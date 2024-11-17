from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from utils.mongo_config import mongo

car_bp = Blueprint("cars", __name__)

#create car
@car_bp.route("/", methods=["POST"])
def create_car():
    try:
        data = request.json
        if not data or not data.get("title") or not data.get("description") or not data.get("user_id"):
            return jsonify({"message": "Title, description, and user_id are required"}), 400

        if len(data.get("images", [])) > 10:
            return jsonify({"message": "You can upload up to 10 images only"}), 400

        car = {
            "title": data["title"],
            "description": data["description"],
            "images": data.get("images", []),
            "tags": data.get("tags", {}),
            "user_id": data["user_id"],
        }
        result = mongo.db.cars.insert_one(car)
        return jsonify({"message": "Car created successfully", "id": str(result.inserted_id)}), 201

    except Exception as e:
        print(f"Error in create_car: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


# List all cars
@car_bp.route("/", methods=["GET"])
def list_cars():
    try:
        cars = list(mongo.db.cars.find())
        for car in cars:
            car["_id"] = str(car["_id"])  # Convert ObjectId to string
        return jsonify(cars), 200

    except Exception as e:
        print(f"Error in list_cars: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


# Fetch car details by ID
@car_bp.route("/<car_id>", methods=["GET"])
def get_car(car_id):
    try:
        print(f"Fetching car details for ID: {car_id}")

        # Validate ObjectId format
        try:
            object_id = ObjectId(car_id)
        except Exception:
            return jsonify({"message": "Invalid car_id format"}), 400

        # Query MongoDB for the car
        car = mongo.db.cars.find_one({"_id": object_id})
        if not car:
            return jsonify({"message": "Car not found"}), 404

        # Convert ObjectId to string for response
        car["_id"] = str(car["_id"])
        return jsonify(car), 200

    except Exception as e:
        print(f"Error in get_car: {e}")
        return jsonify({"message": "Internal Server Error"}), 500



# Update a car by ID
@car_bp.route("/<car_id>", methods=["PUT"])
def update_car(car_id):
    try:
        # Validate ObjectId format
        try:
            object_id = ObjectId(car_id)
        except Exception:
            return jsonify({"message": "Invalid car_id format"}), 400

        # Parse request data
        data = request.json
        if not data:
            return jsonify({"message": "No data provided to update"}), 400

        updated_fields = {
            "title": data.get("title"),
            "description": data.get("description"),
            "images": data.get("images", []),
            "tags": data.get("tags", {}),
        }

        # Remove None values
        updated_fields = {key: value for key, value in updated_fields.items() if value is not None}

        # Update the car in the database
        result = mongo.db.cars.update_one(
            {"_id": object_id},
            {"$set": updated_fields}
        )

        if result.matched_count == 0:
            return jsonify({"message": "Car not found"}), 404

        return jsonify({"message": "Car updated successfully"}), 200

    except Exception as e:
        print(f"Error in update_car: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


# Delete a car by ID
@car_bp.route("/<car_id>", methods=["DELETE"])
def delete_car(car_id):
    try:
        # Validate ObjectId format
        try:
            object_id = ObjectId(car_id)
        except Exception:
            return jsonify({"message": "Invalid car_id format"}), 400

        # Delete the car from the database
        result = mongo.db.cars.delete_one({"_id": object_id})

        if result.deleted_count == 0:
            return jsonify({"message": "Car not found"}), 404

        return jsonify({"message": "Car deleted successfully"}), 200

    except Exception as e:
        print(f"Error in delete_car: {e}")
        return jsonify({"message": "Internal Server Error"}), 500
    


# Search cars globally by title, description, images, user_id, or tags
@car_bp.route("/search", methods=["GET"])
def search_cars():
    try:
        query = request.args.get("q", "").lower()
        if not query:
            return jsonify({"message": "Search query is required"}), 400

        # Find cars where title, description, images, user_id, or tags match the query
        results = mongo.db.cars.find({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},          # Match in title
                {"description": {"$regex": query, "$options": "i"}},   # Match in description
                {"images": {"$regex": query, "$options": "i"}},        # Match in image URLs
                {"user_id": {"$regex": query, "$options": "i"}},       # Match in user_id
                {
                    "tags": {  # Search tags as an array of key-value pairs
                        "$elemMatch": {
                            "value": {"$regex": query, "$options": "i"}  # Match tag values
                        }
                    }
                }
            ]
        })

        cars = []
        for car in results:
            car["_id"] = str(car["_id"])
            cars.append(car)

        return jsonify(cars), 200

    except Exception as e:
        print(f"Error in search_cars: {e}")
        return jsonify({"message": "Internal Server Error"}), 500

    



