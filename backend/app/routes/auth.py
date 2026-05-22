"""Auth routes — handles post-OAuth user upsert."""

from __future__ import annotations

from flask import Blueprint, jsonify, request

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
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    # Ensure the caller owns this user_id
    from flask import g
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
