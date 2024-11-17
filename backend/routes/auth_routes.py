from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from utils.mongo_config import mongo

auth_bp = Blueprint("auth", __name__)

# @auth_bp.route("/signup", methods=["POST"])
# def signup():
#     try:
#         # Parse the request data
#         data = request.json
#         if not data or not data.get("username") or not data.get("password"):
#             return jsonify({"message": "Username and password are required"}), 400

#         # Check if user already exists
#         if mongo.db.users.find_one({"username": data["username"]}):
#             return jsonify({"message": "User already exists"}), 400

#         # Hash the password and create the user
#         hashed_password = generate_password_hash(data["password"], method="sha256")
#         user = {"username": data["username"], "password": hashed_password}
#         mongo.db.users.insert_one(user)

#         return jsonify({"message": "User created successfully"}), 201

#     except Exception as e:
#         print(f"Error in /signup: {e}")  # Log the error
#         return jsonify({"message": "Internal Server Error"}), 500


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        # Extract username and password from the request body
        data = request.json
        username = data.get("username")
        password = data.get("password")

        # Validate the presence of username and password
        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        # Check if the user already exists
        if mongo.db.users.find_one({"username": username}):
            return jsonify({"message": "User already exists"}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create the user and insert into the database
        user = {"username": username, "password": hashed_password}
        mongo.db.users.insert_one(user)

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        # Log the exception for debugging
        print(f"Error in /signup: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        # Parse the request data
        data = request.json
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"message": "Username and password are required"}), 400

        # Find the user in the database
        user = mongo.db.users.find_one({"username": data["username"]})

        # Validate password
        if user and check_password_hash(user["password"], data["password"]):
            return jsonify({"token": str(user["_id"])}), 200

        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        print(f"Error in /login: {e}")  # Log the error
        return jsonify({"message": "Internal Server Error"}), 500

