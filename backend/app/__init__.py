import os
from flask import Flask, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from config import Config


# Global Supabase client
supabase: Client = None

#creating Flask app instance
def create_app():
    global supabase
    app = Flask(__name__)

    app.config.from_object(Config)
    
    
    CORS(app)
    
    
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
    from .api.auth import auth_bp
    from .api.assessment import assessment_bp
    from .api.summary import summary_bp
    from .api.upload import upload_bp
    app.register_blueprint(mindmap_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
    app.register_blueprint(summary_bp, url_prefix='/api')
    app.register_blueprint(upload_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is working!"})
    
    return app