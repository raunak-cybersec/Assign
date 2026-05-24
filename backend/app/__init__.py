"""Flask application factory for the Assign backend."""

from __future__ import annotations

import logging

from flask import Flask, jsonify, request
from flask_cors import CORS

from app.config import Config


def create_app() -> Flask:
    """Create and configure the Flask application.

    * Registers all route blueprints.
    * Configures CORS for the frontend URL (production) and localhost (dev).
    * Provides a ``/api/health`` endpoint for uptime monitoring.
    * Eagerly validates critical env vars so failures are caught at startup.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    app.url_map.strict_slashes = False

    # ---- Logging --------------------------------------------------------
    logging.basicConfig(
        level=logging.DEBUG if Config.FLASK_ENV == 'development' else logging.INFO,
        format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    )

    # ---- CORS -----------------------------------------------------------
    allowed_origins = [
        'http://localhost:3000',
        'https://assign-git-main-raunak-cybersecs-projects.vercel.app',
        'https://assign-lgpuvvqtg-raunak-cybersecs-projects.vercel.app',
    ]
    if Config.FRONTEND_URL and Config.FRONTEND_URL not in allowed_origins:
        allowed_origins.append(Config.FRONTEND_URL)

    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        allow_headers=['Content-Type', 'Authorization'],
        methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    )

    # ---- Preflight handler (must be before any route) -------------------
    # This ensures OPTIONS requests are handled immediately and never
    # redirected or caught by a route that returns a 3xx.
    @app.before_request
    def handle_preflight():
        if request.method == 'OPTIONS':
            return '', 200

    # ---- Ensure CORS headers on EVERY response (including errors) -------
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin')
        if origin and origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response

    # ---- Validate env vars ----------------------------------------------
    missing = Config.validate()
    if missing:
        app.logger.warning('Missing required env vars: %s', ', '.join(missing))

    # ---- Eagerly initialise Supabase client (fail fast) -----------------
    if not missing:
        try:
            from app.models import get_supabase
            get_supabase()
            app.logger.info('Supabase client initialised successfully')
        except Exception as exc:
            app.logger.error('Failed to initialise Supabase client: %s', exc)

    # ---- Register blueprints -------------------------------------------
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    from app.routes.users import users_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(notifications_bp)

    # ---- Health check ---------------------------------------------------
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    # ---- Generic error handlers ----------------------------------------
    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(_e):
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(405)
    def method_not_allowed(_e):
        return jsonify({'error': 'Method not allowed'}), 405

    return app

