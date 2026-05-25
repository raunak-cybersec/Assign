from __future__ import annotations
from functools import wraps
from flask import g, jsonify, request
from app.models import get_supabase


def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token'}), 401
        token = auth_header.split(' ')[1]
        try:
            supabase = get_supabase()
            user = supabase.auth.get_user(token)
            if not user or not user.user:
                return jsonify({'error': 'Invalid token'}), 401
            g.user_id = user.user.id
            g.user_email = user.user.email
            request.user_id = user.user.id
            request.user_email = user.user.email
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'detail': str(e)}), 401
        return f(*args, **kwargs)
    return decorated_function
