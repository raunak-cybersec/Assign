"""User routes — list registered users."""

from __future__ import annotations

from flask import Blueprint, g, jsonify

from app import models
from app.middleware.auth_middleware import require_auth

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('/', methods=['GET'])
@require_auth
def list_users():
    """Return all registered users ordered by name.

    Used by the frontend to populate assignee dropdowns and user lists.
    Ensures avatar_url is always present (null if not set).
    """
    try:
        users = models.get_all_users()
        # Normalise — guarantee avatar_url key exists on every user object
        for u in users:
            u.setdefault('avatar_url', None)
        return jsonify({'users': users}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch users: {str(exc)}'}), 500


@users_bp.route('/<user_id>', methods=['GET'])
@require_auth
def get_user(user_id: str):
    """Return a single user by ID."""
    try:
        user = models.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        user.setdefault('avatar_url', None)
        return jsonify({'user': user}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch user: {str(exc)}'}), 500
