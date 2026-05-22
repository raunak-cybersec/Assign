"""Notification routes — list and mark-as-read."""

from __future__ import annotations

from flask import Blueprint, g, jsonify

from app import models
from app.middleware.auth_middleware import require_auth

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')


@notifications_bp.route('/', methods=['GET'])
@require_auth
def list_notifications():
    """Return the 50 most recent notifications for the authenticated user."""
    try:
        notifications = models.get_notifications_for_user(g.user_id, limit=50)
        return jsonify({'notifications': notifications}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch notifications: {str(exc)}'}), 500


@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@require_auth
def mark_read(notification_id: str):
    """Mark a single notification as read.

    Returns 404 if the notification does not exist or does not belong to the
    authenticated user.
    """
    try:
        notification = models.mark_notification_read(notification_id, g.user_id)
    except Exception as exc:
        return jsonify({'error': f'Failed to update notification: {str(exc)}'}), 500

    if not notification:
        return jsonify({'error': 'Notification not found'}), 404

    return jsonify({'notification': notification}), 200
