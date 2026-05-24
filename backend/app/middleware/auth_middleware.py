from functools import wraps

import jwt
from flask import g, jsonify, request, current_app

from app.config import Config


def require_auth(f):
    """Decorator that verifies the Supabase JWT from the Authorization header.

    Uses HS256 with SUPABASE_JWT_SECRET.
    On success sets g.user_id (sub claim) and g.user_email.
    On failure returns a 401 JSON response.
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header:
            return jsonify({'error': 'Authorization header is required'}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Authorization header must be: Bearer <token>'}), 401

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                Config.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={'verify_aud': False},
            )
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.warning('JWT decode failed: %s', e)
            return jsonify({'error': 'Invalid or expired token'}), 401

        user_id = payload.get('sub')
        if not user_id:
            return jsonify({'error': 'Token missing sub claim'}), 401

        g.user_id = user_id
        g.user_email = payload.get('email', '')
        return f(*args, **kwargs)

    return decorated_function
