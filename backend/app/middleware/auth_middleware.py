"""JWT authentication middleware for Flask routes."""

from __future__ import annotations

import base64
import os
from functools import wraps

import jwt
from flask import g, jsonify, request, current_app


def require_auth(f):
    """Decorator that verifies the Supabase JWT from the Authorization header.

    Tries decoding with the raw secret first, then with base64-decoded
    secret (Supabase JWT secrets are base64url-encoded strings).
    On success sets g.user_id and g.user_email.
    On failure returns a 401 JSON response.
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401

        token = auth_header.split(' ', 1)[1].strip()
        if not token:
            return jsonify({'error': 'Empty token'}), 401

        secret = os.environ.get('SUPABASE_JWT_SECRET', '')
        if not secret:
            current_app.logger.error('SUPABASE_JWT_SECRET env var not set')
            return jsonify({'error': 'Server misconfiguration'}), 500

        payload = None
        last_error = None

        # Attempt 1: raw secret string (works if Render has raw value)
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=['HS256'],
                options={'verify_aud': False},
            )
        except Exception as e:
            last_error = e

        # Attempt 2: base64-decoded secret (Supabase JWT secrets are base64url)
        if payload is None:
            try:
                # Pad the base64 string if needed
                padded = secret + '=' * (-len(secret) % 4)
                decoded_secret = base64.b64decode(padded)
                payload = jwt.decode(
                    token,
                    decoded_secret,
                    algorithms=['HS256'],
                    options={'verify_aud': False},
                )
            except Exception as e:
                last_error = e

        if payload is None:
            current_app.logger.warning('JWT decode failed: %s', last_error)
            return jsonify({'error': 'Invalid or expired token', 'detail': str(last_error)}), 401

        user_id = payload.get('sub')
        if not user_id:
            return jsonify({'error': 'Token missing sub claim'}), 401

        g.user_id = user_id
        g.user_email = payload.get('email', '')
        request.user_id = user_id
        request.user_email = payload.get('email', '')

        return f(*args, **kwargs)

    return decorated_function
