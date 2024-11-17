import jwt
from flask import current_app, request, jsonify
from functools import wraps

def create_token(user_id):
    """Generate a JWT token for the user."""
    return jwt.encode({"user_id": user_id}, current_app.config["SECRET_KEY"], algorithm="HS256")

def verify_token(token):
    """Verify and decode the JWT token."""
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def login_required(f):
    """Decorator to protect routes with token authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 403
        user_id = verify_token(token)
        if not user_id:
            return jsonify({"message": "Invalid token"}), 403
        return f(user_id, *args, **kwargs)
    return decorated_function
