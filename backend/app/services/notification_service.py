"""Notification service — thin wrapper around the models layer."""

from __future__ import annotations

import logging

from app import models

logger = logging.getLogger(__name__)


def create_notification(user_id: str, task_id: str, message: str) -> dict:
    """Create a notification row for *user_id* about *task_id*.

    Logs and swallows exceptions so that a notification failure never
    breaks the calling request.
    """
    try:
        return models.create_notification(user_id, task_id, message)
    except Exception:
        logger.exception('Failed to create notification for user %s', user_id)
        return {}
