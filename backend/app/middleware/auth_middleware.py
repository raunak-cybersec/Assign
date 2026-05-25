"""JWT authentication middleware for Flask routes."""

from __future__ import annotations

import base64
import os
from functools import wraps

import jwt
from jwt import PyJWKClient
from flask import g, jsonify, request, current_app

from app.config import Config

_jwks_client = None

def _get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{Config.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client

def require_auth(f):
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

        # --- Attempt 1: ES256 via JWKS (newer Supabase projects) ---
        try:
            jwks_client = _get_jwks_client()
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=['ES256'],
                options={'verify_aud': False},
            )
        except Exception as es_err:
            last_error = es_err

        # --- Attempt 2: HS256 with raw secret (some Supabase projects) ---
        if payload is None:
            try:
                payload = jwt.decode(
                    token,
                    secret,
                    algorithms=['HS256'],
                    options={'verify_aud': False},
                )
            except Exception as hs_raw_err:
                last_error = hs_raw_err

        # --- Attempt 3: HS256 with base64-decoded secret (legacy Supabase projects) ---
        if payload is None:
            try:
                padded = secret + '=' * (-len(secret) % 4)
                decoded_secret = base64.b64decode(padded)
                payload = jwt.decode(
                    token,
                    decoded_secret,
                    algorithms=['HS256'],
                    options={'verify_aud': False},
                )
            except Exception as hs_b64_err:
                last_error = hs_b64_err

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
