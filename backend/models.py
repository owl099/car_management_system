from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import mongo

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    hashed_password = generate_password_hash(data["password"], method="sha256")
    user = {"username": data["username"], "password": hashed_password}

    if mongo.db.users.find_one({"username": user["username"]}):
        return jsonify({"message": "User already exists"}), 400

    mongo.db.users.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = mongo.db.users.find_one({"username": data["username"]})

    if user and check_password_hash(user["password"], data["password"]):
        # Create a simple token (in production, use a secure library)
        return jsonify({"token": str(user["_id"])}), 200

    return jsonify({"message": "Invalid credentials"}), 401
