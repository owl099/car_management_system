from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS
from utils.mongo_config import mongo
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})  # Allows all origins for testing purposes
# CORS(app, origins=["https://car-management-system-smoky.vercel.app"])

# MongoDB Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")


mongo.init_app(app)

# Import routes
try:
    from routes.auth_routes import auth_bp
    from routes.car_routes import car_bp

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(car_bp, url_prefix="/cars")
except Exception as e:
    print(f"Error importing or registering routes: {e}")

# Test Route
@app.route("/")
def index():
    return jsonify({"message": "API is running with MongoDB Atlas!"})

# Debug Route: List All Registered Routes
@app.route("/routes", methods=["GET"])
def list_routes():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():
        methods = ",".join(rule.methods)
        url = urllib.parse.unquote(str(rule))
        output.append(f"{url} ({methods})")
    return jsonify({"routes": output})

if __name__ == "__main__":
    app.run(debug=True)
