import os
from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore

app=Flask(__name__)
#allows react frontend to make reqs to the backend
CORS(app)

#firebase admin initilization
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
print("Firestore Admin initialized")

#test api routes
@app.route("/")
def home():
    return "backend is working"
@app.route("/api/test")
def api_test():
    return jsonify(message="Backend is working!")

if __name__ == "__main__":
    app.run(debug=True, port=5000)