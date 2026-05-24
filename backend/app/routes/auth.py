"""Auth routes — handles post-OAuth user upsert."""

from __future__ import annotations

from flask import Blueprint, g, jsonify, request

from app import models
from app.middleware.auth_middleware import require_auth

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/callback', methods=['POST'])
@require_auth
def auth_callback():
    """Receive user profile data from the frontend after Google OAuth.

    Expected JSON body::

        {
            "email": "user@example.com",
            "name": "Jane Doe",
            "avatar_url": "https://…",  // optional
            "user_id": "uuid"
        }

    The ``user_id`` in the body is cross-checked against the JWT ``sub``
    claim stored in ``g.user_id`` to prevent spoofing.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    email = (data.get('email') or '').strip()
    name = (data.get('name') or '').strip()
    user_id = (data.get('user_id') or '').strip()
    avatar_url = (data.get('avatar_url') or '').strip() or None

    if not email:
        return jsonify({'error': 'email is required'}), 400
    if not name:
        return jsonify({'error': 'name is required'}), 400

    # If user_id not provided in body, fall back to JWT sub claim
    if not user_id:
        user_id = g.user_id

    # Ensure the caller owns this user_id
    if user_id != g.user_id:
        return jsonify({'error': 'user_id does not match authenticated user'}), 403

    try:
        user = models.upsert_user(
            user_id=user_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
        return jsonify({'user': user}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to upsert user: {str(exc)}'}), 500


@auth_bp.route('/register', methods=['POST'])
@require_auth
def register():
    """Alternative registration endpoint — accepts {id, email, name, avatar_url}.

    Upserts the user into the users table. Alias for /callback with a
    flexible body schema so the frontend can call either endpoint.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    # Accept both 'id' and 'user_id' field names
    user_id = (data.get('id') or data.get('user_id') or '').strip()
    email = (data.get('email') or '').strip()
    name = (data.get('name') or email.split('@')[0] or '').strip()
    avatar_url = (data.get('avatar_url') or '').strip() or None

    if not email:
        return jsonify({'error': 'email is required'}), 400

    # Fall back to JWT sub if not provided
    if not user_id:
        user_id = g.user_id

    # Security: ensure caller can only register themselves
    if user_id != g.user_id:
        return jsonify({'error': 'user_id does not match authenticated user'}), 403

    try:
        user = models.upsert_user(
            user_id=user_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
        return jsonify({'user': user}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to register user: {str(exc)}'}), 500


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_me():
    """Return the currently authenticated user's profile."""
    try:
        user = models.get_user_by_id(g.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user}), 200
    except Exception as exc:
        return jsonify({'error': f'Failed to fetch user: {str(exc)}'}), 500
