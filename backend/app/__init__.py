import os
from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from config import Config


#creating Flask app instance
def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)
    
    
    CORS(app)
    
    
    if not firebase_admin._apps:
        try:
            service_account_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("Firestore Admin initialized")
        except Exception as e:
            print(f"Failed to initialize Firebase: {e}")

    from .api.mindmap import mindmap_bp
    from .api.auth import auth_bp
    from .api.assessment import assessment_bp
    from .api.summary import summary_bp
    app.register_blueprint(mindmap_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessment')
    app.register_blueprint(summary_bp, url_prefix='/api')
    
    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "message": "Backend is working!"})
    
    return app