"""User routes — list registered users."""

from __future__ import annotations

from flask import Blueprint, jsonify

from app import models
from app.middleware.auth_middleware import require_auth

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('/', methods=['GET'])
@require_auth
def list_users():
    """Return all registered users ordered by name.

    Used by the frontend to populate assignee dropdowns and user lists.
    """
    try:
        users = models.get_all_users()
        return jsonify({'users': users}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch users: {str(exc)}'}), 500
