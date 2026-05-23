"""Supabase interaction layer.

Provides a shared Supabase client and thin helper functions for CRUD
operations on each table.  Every function uses the **service role** client
so that Row Level Security is bypassed on the server side.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from supabase import Client, create_client

from app.config import Config

# Suppress extremely verbose httpx/hpack debug logs
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)
logging.getLogger('hpack').setLevel(logging.WARNING)

# ---------------------------------------------------------------------------
# Singleton client
# ---------------------------------------------------------------------------

_client: Client | None = None


def get_supabase() -> Client:
    """Return (and lazily create) the Supabase service-role client.

    Uses HTTP/1.1 to avoid HTTP/2 connection pool issues when
    multiple concurrent requests share a single connection.
    """
    global _client
    if _client is None:
        _client = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_SERVICE_ROLE_KEY,
        )
        # Force HTTP/1.1 on the underlying postgrest client to avoid
        # HTTP/2 ConnectionTerminated errors.
        _client.postgrest.session = httpx.Client(
            base_url=f"{Config.SUPABASE_URL}/rest/v1",
            headers=_client.postgrest.session.headers,
            http2=False,
            timeout=30.0,
        )
    return _client



# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


def upsert_user(user_id: str, email: str, name: str, avatar_url: str | None = None) -> dict:
    """Insert a user or update name/avatar if they already exist.

    Uses the Supabase ``upsert`` with ``on_conflict='id'`` so that the first
    sign-in creates the row and subsequent sign-ins refresh profile data.
    """
    payload: dict[str, Any] = {
        'id': user_id,
        'email': email,
        'name': name,
    }
    if avatar_url is not None:
        payload['avatar_url'] = avatar_url

    result = (
        get_supabase()
        .table('users')
        .upsert(payload, on_conflict='id')
        .execute()
    )
    return result.data[0] if result.data else {}


def get_user_by_id(user_id: str) -> dict | None:
    """Fetch a single user by their UUID."""
    result = (
        get_supabase()
        .table('users')
        .select('*')
        .eq('id', user_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def get_all_users() -> list[dict]:
    """Return all users ordered by name."""
    result = (
        get_supabase()
        .table('users')
        .select('*')
        .order('name')
        .execute()
    )
    return result.data or []


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


def create_task(data: dict) -> dict:
    """Insert a new task and return the created row."""
    result = (
        get_supabase()
        .table('tasks')
        .insert(data)
        .execute()
    )
    return result.data[0] if result.data else {}


def get_task_by_id(task_id: str) -> dict | None:
    """Fetch a single task by UUID, with creator and assignee joins."""
    result = (
        get_supabase()
        .table('tasks')
        .select('*, creator:users!tasks_creator_id_fkey(*), assignee:users!tasks_assignee_id_fkey(*)')
        .eq('id', task_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


def get_tasks_for_user(
    user_id: str,
    status: str | None = None,
    priority: str | None = None,
    assignee_id: str | None = None,
    filter_mode: str | None = None,
) -> list[dict]:
    """Return tasks visible to *user_id* with optional filters.

    ``filter_mode`` can be ``assigned_to_me`` or ``created_by_me`` to narrow
    the result set beyond the default (created OR assigned).
    """
    query = (
        get_supabase()
        .table('tasks')
        .select('*, creator:users!tasks_creator_id_fkey(*), assignee:users!tasks_assignee_id_fkey(*)')
    )

    # Scope filter
    if filter_mode == 'assigned_to_me':
        query = query.eq('assignee_id', user_id)
    elif filter_mode == 'created_by_me':
        query = query.eq('creator_id', user_id)
    else:
        # Default: tasks the user created OR is assigned to
        query = query.or_(f'creator_id.eq.{user_id},assignee_id.eq.{user_id}')

    if status:
        query = query.eq('status', status)
    if priority:
        query = query.eq('priority', priority)
    if assignee_id:
        query = query.eq('assignee_id', assignee_id)

    query = query.order('created_at', desc=True)
    result = query.execute()
    return result.data or []


def update_task(task_id: str, data: dict) -> dict | None:
    """Update fields on a task and return the updated row."""
    result = (
        get_supabase()
        .table('tasks')
        .update(data)
        .eq('id', task_id)
        .execute()
    )
    return result.data[0] if result.data else None


def delete_task(task_id: str) -> bool:
    """Hard-delete a task.  Returns True on success."""
    result = (
        get_supabase()
        .table('tasks')
        .delete()
        .eq('id', task_id)
        .execute()
    )
    return bool(result.data)


# ---------------------------------------------------------------------------
# Activity Logs
# ---------------------------------------------------------------------------


def create_activity_log(task_id: str, user_id: str, action: str,
                        old_value: str | None = None, new_value: str | None = None) -> dict:
    """Record a change against a task."""
    payload: dict[str, Any] = {
        'task_id': task_id,
        'user_id': user_id,
        'action': action,
    }
    if old_value is not None:
        payload['old_value'] = old_value
    if new_value is not None:
        payload['new_value'] = new_value

    result = (
        get_supabase()
        .table('activity_logs')
        .insert(payload)
        .execute()
    )
    return result.data[0] if result.data else {}


def get_activity_logs_for_task(task_id: str) -> list[dict]:
    """Return activity logs for a task, newest first, with user info."""
    result = (
        get_supabase()
        .table('activity_logs')
        .select('*, user:users!activity_logs_user_id_fkey(*)')
        .eq('task_id', task_id)
        .order('created_at', desc=True)
        .execute()
    )
    return result.data or []


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------


def create_notification(user_id: str, task_id: str, message: str) -> dict:
    """Insert a notification for *user_id*."""
    result = (
        get_supabase()
        .table('notifications')
        .insert({
            'user_id': user_id,
            'task_id': task_id,
            'message': message,
        })
        .execute()
    )
    return result.data[0] if result.data else {}


def get_notifications_for_user(user_id: str, limit: int = 50) -> list[dict]:
    """Return the most recent notifications for a user."""
    result = (
        get_supabase()
        .table('notifications')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


def mark_notification_read(notification_id: str, user_id: str) -> dict | None:
    """Mark a single notification as read.  Only the owning user may do so."""
    result = (
        get_supabase()
        .table('notifications')
        .update({'is_read': True})
        .eq('id', notification_id)
        .eq('user_id', user_id)
        .execute()
    )
    return result.data[0] if result.data else None
