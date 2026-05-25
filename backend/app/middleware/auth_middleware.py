"""JWT authentication middleware for Flask routes."""

from __future__ import annotations

import base64
import os
from functools import wraps

import jwt
from flask import g, jsonify, request


def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token'}), 401
        token = auth_header.split(' ')[1]
        try:
            secret = os.environ.get('SUPABASE_JWT_SECRET', '')
            payload = jwt.decode(
                token,
                secret,
                algorithms=['HS256'],
                options={"verify_aud": False}
            )
            g.user_id = payload.get('sub')
            g.user_email = payload.get('email')
            request.user_id = payload.get('sub')
            request.user_email = payload.get('email')
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'detail': str(e)}), 401

        return f(*args, **kwargs)

    return decorated_function
