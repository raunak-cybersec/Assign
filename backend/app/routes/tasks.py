"""Task routes — full CRUD with activity logging, notifications, and emails."""

from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, g, jsonify, request

from app import models
from app.middleware.auth_middleware import require_auth
from app.services import email_service, notification_service

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')

# Valid enum values (mirrors DB CHECK constraints)
VALID_STATUSES = {'todo', 'in_progress', 'completed'}
VALID_PRIORITIES = {'low', 'medium', 'high'}
MAX_DESCRIPTION_LENGTH = 500


# ---------------------------------------------------------------------------
# GET /api/tasks/
# ---------------------------------------------------------------------------

@tasks_bp.route('/', methods=['GET'])
@require_auth
def list_tasks():
    """Return tasks the authenticated user created or is assigned to.

    Query params:
        ?status=todo|in_progress|completed
        ?priority=low|medium|high
        ?assignee_id=<uuid>
        ?filter=assigned_to_me|created_by_me
    """
    status = request.args.get('status')
    priority = request.args.get('priority')
    assignee_id = request.args.get('assignee_id')
    filter_mode = request.args.get('filter')

    if status and status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'}), 400
    if priority and priority not in VALID_PRIORITIES:
        return jsonify({'error': f'Invalid priority. Must be one of: {", ".join(VALID_PRIORITIES)}'}), 400
    if filter_mode and filter_mode not in ('assigned_to_me', 'created_by_me'):
        return jsonify({'error': 'Invalid filter. Must be assigned_to_me or created_by_me'}), 400

    try:
        tasks = models.get_tasks_for_user(
            user_id=g.user_id,
            status=status,
            priority=priority,
            assignee_id=assignee_id,
            filter_mode=filter_mode,
        )
        return jsonify({'tasks': tasks}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch tasks: {str(exc)}'}), 500


# ---------------------------------------------------------------------------
# POST /api/tasks/
# ---------------------------------------------------------------------------

@tasks_bp.route('/', methods=['POST'])
@require_auth
def create_task():
    """Create a new task.

    Required: ``title``
    Optional: ``description`` (max 500 chars), ``due_date``, ``priority``,
              ``assignee_id``
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    title = (data.get('title') or '').strip()
    if not title:
        return jsonify({'error': 'title is required'}), 400

    description = (data.get('description') or '').strip() or None
    if description and len(description) > MAX_DESCRIPTION_LENGTH:
        return jsonify({'error': f'description must be at most {MAX_DESCRIPTION_LENGTH} characters'}), 400

    priority = data.get('priority', 'medium')
    if priority not in VALID_PRIORITIES:
        return jsonify({'error': f'Invalid priority. Must be one of: {", ".join(VALID_PRIORITIES)}'}), 400

    due_date = data.get('due_date') or None
    assignee_id = data.get('assignee_id') or None

    task_payload = {
        'title': title,
        'description': description,
        'priority': priority,
        'creator_id': g.user_id,
    }
    if due_date:
        task_payload['due_date'] = due_date
    if assignee_id:
        task_payload['assignee_id'] = assignee_id

    try:
        task = models.create_task(task_payload)
    except Exception as exc:
        return jsonify({'error': f'Failed to create task: {str(exc)}'}), 500

    # Activity log
    try:
        models.create_activity_log(
            task_id=task['id'],
            user_id=g.user_id,
            action='Task created',
            new_value=title,
        )
    except Exception:
        pass  # non-critical

    # If there is an assignee, notify & email them
    if assignee_id:
        try:
            creator = models.get_user_by_id(g.user_id)
            assignee = models.get_user_by_id(assignee_id)
            creator_name = creator['name'] if creator else 'Someone'

            if assignee:
                notification_service.create_notification(
                    user_id=assignee_id,
                    task_id=task['id'],
                    message=f'{creator_name} assigned you a task: {title}',
                )
                email_service.send_task_assigned_email(
                    assignee_email=assignee['email'],
                    assignee_name=assignee['name'],
                    task=task,
                    creator_name=creator_name,
                )
        except Exception as e:
            from flask import current_app
            current_app.logger.error(f"Failed to send assignment notification/email: {e}")

    return jsonify({'task': task}), 201


# ---------------------------------------------------------------------------
# GET /api/tasks/<task_id>
# ---------------------------------------------------------------------------

@tasks_bp.route('/<task_id>', methods=['GET'])
@require_auth
def get_task(task_id: str):
    """Return a single task with creator/assignee user objects and activity logs."""
    try:
        task = models.get_task_by_id(task_id)
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch task: {str(exc)}'}), 500

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    # Ensure the requester has access
    if task.get('creator_id') != g.user_id and task.get('assignee_id') != g.user_id:
        return jsonify({'error': 'You do not have access to this task'}), 403

    try:
        activity_logs = models.get_activity_logs_for_task(task_id)
    except Exception:
        activity_logs = []

    return jsonify({'task': task, 'activity_logs': activity_logs}), 200


# ---------------------------------------------------------------------------
# PUT /api/tasks/<task_id>
# ---------------------------------------------------------------------------

@tasks_bp.route('/<task_id>', methods=['PUT'])
@require_auth
def update_task(task_id: str):
    """Update one or more fields on a task.

    Logs each changed field in activity_logs.  Sends emails/notifications
    when the status changes to ``completed`` or when the assignee changes.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    # Fetch the existing task to compare changes
    try:
        existing = models.get_task_by_id(task_id)
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch task: {str(exc)}'}), 500

    if not existing:
        return jsonify({'error': 'Task not found'}), 404

    # Ensure the requester has access (creator or assignee)
    if existing.get('creator_id') != g.user_id and existing.get('assignee_id') != g.user_id:
        return jsonify({'error': 'You do not have access to this task'}), 403

    # Build update payload and detect changes
    update_payload: dict = {}
    changes: list[tuple[str, str | None, str | None]] = []

    # title
    if 'title' in data:
        new_title = (data['title'] or '').strip()
        if not new_title:
            return jsonify({'error': 'title cannot be empty'}), 400
        if new_title != existing.get('title'):
            changes.append(('Title changed', existing.get('title'), new_title))
            update_payload['title'] = new_title

    # description
    if 'description' in data:
        new_desc = (data['description'] or '').strip() or None
        if new_desc and len(new_desc) > MAX_DESCRIPTION_LENGTH:
            return jsonify({'error': f'description must be at most {MAX_DESCRIPTION_LENGTH} characters'}), 400
        if new_desc != existing.get('description'):
            changes.append(('Description changed', existing.get('description'), new_desc))
            update_payload['description'] = new_desc

    # status
    if 'status' in data:
        new_status = data['status']
        if new_status not in VALID_STATUSES:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(VALID_STATUSES)}'}), 400
        if new_status != existing.get('status'):
            changes.append(('Status changed', existing.get('status'), new_status))
            update_payload['status'] = new_status

    # priority
    if 'priority' in data:
        new_priority = data['priority']
        if new_priority not in VALID_PRIORITIES:
            return jsonify({'error': f'Invalid priority. Must be one of: {", ".join(VALID_PRIORITIES)}'}), 400
        if new_priority != existing.get('priority'):
            changes.append(('Priority changed', existing.get('priority'), new_priority))
            update_payload['priority'] = new_priority

    # due_date
    if 'due_date' in data:
        new_due = data['due_date']
        if new_due != existing.get('due_date'):
            changes.append(('Due date changed', existing.get('due_date'), new_due))
            update_payload['due_date'] = new_due

    # assignee_id
    if 'assignee_id' in data:
        new_assignee = data['assignee_id']
        if new_assignee != existing.get('assignee_id'):
            changes.append(('Assignee changed', existing.get('assignee_id'), new_assignee))
            update_payload['assignee_id'] = new_assignee

    if not update_payload:
        return jsonify({'error': 'No changes detected'}), 400

    update_payload['updated_at'] = datetime.now(timezone.utc).isoformat()

    try:
        updated = models.update_task(task_id, update_payload)
    except Exception as exc:
        return jsonify({'error': f'Failed to update task: {str(exc)}'}), 500

    if not updated:
        return jsonify({'error': 'Task not found'}), 404

    # Record activity logs
    for action, old_val, new_val in changes:
        try:
            models.create_activity_log(
                task_id=task_id,
                user_id=g.user_id,
                action=action,
                old_value=str(old_val) if old_val is not None else None,
                new_value=str(new_val) if new_val is not None else None,
            )
        except Exception:
            pass

    # --- Side effects -------------------------------------------------

    # If status changed to 'completed', email the creator
    if update_payload.get('status') == 'completed' and existing.get('creator_id'):
        try:
            creator = models.get_user_by_id(existing['creator_id'])
            completer = models.get_user_by_id(g.user_id)
            if creator and completer:
                email_service.send_task_completed_email(
                    creator_email=creator['email'],
                    creator_name=creator['name'],
                    task=updated,
                    completer_name=completer['name'],
                )
                notification_service.create_notification(
                    user_id=existing['creator_id'],
                    task_id=task_id,
                    message=f'{completer["name"]} completed the task: {updated.get("title", "")}',
                )
        except Exception:
            pass

    # If assignee changed, notify the NEW assignee
    if 'assignee_id' in update_payload and update_payload['assignee_id']:
        new_assignee_id = update_payload['assignee_id']
        try:
            assignee = models.get_user_by_id(new_assignee_id)
            updater = models.get_user_by_id(g.user_id)
            updater_name = updater['name'] if updater else 'Someone'

            if assignee:
                notification_service.create_notification(
                    user_id=new_assignee_id,
                    task_id=task_id,
                    message=f'{updater_name} assigned you a task: {updated.get("title", "")}',
                )
                email_service.send_task_assigned_email(
                    assignee_email=assignee['email'],
                    assignee_name=assignee['name'],
                    task=updated,
                    creator_name=updater_name,
                )
        except Exception:
            pass

    # Re-fetch with joins for a complete response
    try:
        full_task = models.get_task_by_id(task_id)
    except Exception:
        full_task = updated

    return jsonify({'task': full_task}), 200


# ---------------------------------------------------------------------------
# DELETE /api/tasks/<task_id>
# ---------------------------------------------------------------------------

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@require_auth
def delete_task(task_id: str):
    """Delete a task.  Only the creator may delete."""
    try:
        task = models.get_task_by_id(task_id)
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch task: {str(exc)}'}), 500

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    if task.get('creator_id') != g.user_id:
        return jsonify({'error': 'Only the task creator can delete this task'}), 403

    try:
        models.delete_task(task_id)
    except Exception as exc:
        return jsonify({'error': f'Failed to delete task: {str(exc)}'}), 500

    return jsonify({'message': 'Task deleted successfully'}), 200
