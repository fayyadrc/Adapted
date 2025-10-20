import os
from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

def create_app():
    """
    Application factory pattern for creating Flask app instance
    """
    # Load environment variables from .env file
    load_dotenv()
    
    # Create Flask app instance
    app = Flask(__name__)
    
    # Enable CORS to allow React frontend to make requests to the backend
    CORS(app)
    
    # Firebase admin initialization
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firestore Admin initialized")
    
    # Register blueprints
    from .api.mindmap import mindmap_bp
    app.register_blueprint(mindmap_bp, url_prefix='/api')
    
    # Health check route
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is working!"})
    
    return app