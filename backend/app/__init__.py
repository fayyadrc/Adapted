import os
from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from config import Config

def create_app():
    """
    Application factory pattern for creating Flask app instance
    """
    # Create Flask app instance
    app = Flask(__name__)
    
    # Load configuration from config.py
    app.config.from_object(Config)
    
    # Enable CORS to allow React frontend to make requests to the backend
    CORS(app)
    
    # Firebase admin initialization (only if not already initialized)
    if not firebase_admin._apps:
        try:
            # Use absolute path for the service account key
            service_account_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("Firestore Admin initialized")
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")

    # Register blueprints
    from .api.mindmap import mindmap_bp
    from .api.auth import auth_bp
    app.register_blueprint(mindmap_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Health check route
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is working!"})
    
    return app