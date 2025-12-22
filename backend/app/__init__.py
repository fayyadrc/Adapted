import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from supabase import create_client, Client
from backend.config import Config


# Global Supabase client
supabase: Client = None

#creating Flask app instance
def create_app():
    global supabase
    
    # Determine static folder path for serving React build
    static_folder = os.environ.get('STATIC_FOLDER', '../static/frontend')
    static_folder_abs = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', static_folder))
    
    app = Flask(__name__, static_folder=static_folder_abs, static_url_path='')

    app.config.from_object(Config)
    
    # Production-aware CORS configuration
    is_production = os.environ.get('FLASK_ENV', 'development') == 'production'
    if is_production:
        # In production, specify allowed origins
        allowed_origins = os.environ.get('CORS_ORIGINS', '').split(',')
        if allowed_origins and allowed_origins[0]:
            CORS(app, origins=allowed_origins, supports_credentials=True)
        else:
            CORS(app)  # Fallback to allow all (configure CORS_ORIGINS in production!)
    else:
        CORS(app)  # Allow all origins in development
    
    
    # Initialize Supabase
    try:
        if app.config['SUPABASE_URL'] and app.config['SUPABASE_KEY']:
            supabase = create_client(
                app.config['SUPABASE_URL'],
                app.config['SUPABASE_KEY']
            )
            print("Supabase client initialized")
        else:
            print("Warning: Supabase credentials not found in environment variables")
    except Exception as e:
        print(f"Failed to initialize Supabase: {e}")

    from .api.mindmap import mindmap_bp
    from .api.assessment import assessment_bp
    from .api.upload import upload_bp
    app.register_blueprint(mindmap_bp, url_prefix='/api')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
    app.register_blueprint(upload_bp, url_prefix='/api')
    
    from .api.image_upload import image_upload_bp
    app.register_blueprint(image_upload_bp, url_prefix='/api')
    
    from .api.infographic import infographic_bp
    app.register_blueprint(infographic_bp, url_prefix='/api/infographic')

    from .api.folders import folders_bp
    app.register_blueprint(folders_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is working!"})
    
    # Serve React App - catch all routes that don't match API
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        # If path is for API, let it 404 (shouldn't reach here due to blueprints)
        if path.startswith('api/') or path == 'api':
            return jsonify({"error": "Not found"}), 404
        
        # Try to serve the file directly (for static assets like JS, CSS, images)
        full_path = os.path.join(app.static_folder, path)
        if path and os.path.exists(full_path) and os.path.isfile(full_path):
            return send_from_directory(app.static_folder, path)
        
        # For all other routes, serve index.html (React SPA routing)
        return send_from_directory(app.static_folder, 'index.html')
    
    return app