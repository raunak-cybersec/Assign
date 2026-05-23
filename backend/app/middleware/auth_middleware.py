import json
import urllib.request
from functools import wraps

import jwt
from jwt import PyJWKClient
from flask import g, jsonify, request, current_app

from app.config import Config

# Cache the JWKS client so we don't re-fetch keys on every request
_jwks_client = None


def _get_jwks_client():
    """Lazily create a PyJWKClient for Supabase JWKS endpoint."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{Config.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


def require_auth(f):
    """Decorator that verifies the Supabase JWT from the Authorization header.

    On success, sets ``g.user_id`` to the ``sub`` claim (the Supabase user
    UUID).  On failure, returns a 401 JSON response.

    Supports both ES256 (asymmetric JWKS) and HS256 (shared secret) tokens,
    depending on how the Supabase project is configured.
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

        payload = None

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
            current_app.logger.debug('ES256 JWKS decode failed: %s', es_err)

        # --- Attempt 2: HS256 with raw secret (older Supabase projects) ---
        if payload is None:
            try:
                payload = jwt.decode(
                    token,
                    Config.SUPABASE_JWT_SECRET,
                    algorithms=['HS256'],
                    options={'verify_aud': False},
                )
            except Exception as hs_err:
                current_app.logger.debug('HS256 decode failed: %s', hs_err)

        if payload is None:
            return jsonify({'error': 'Invalid or expired token'}), 401

        user_id = payload.get('sub')
        if not user_id:
            return jsonify({'error': 'Token missing sub claim'}), 401

        g.user_id = user_id
        return f(*args, **kwargs)

    return decorated_function
