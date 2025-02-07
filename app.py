from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import bcrypt
import jwt
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import re

# Load environment variables from .env file
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection URI
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Connect to the "SSA" database
db = client["SSA"]

# Access the "user" collection
users_collection = db["users"]

# JWT Secret Key for creating JWT tokens
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_key")

# Register Route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    print(data)
    name = data.get('name')
    studentNo = data.get('studentNo')
    department = data.get('department')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'Student')  # Default role is "Student"

    # Input validation
    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"message": "Invalid email format"}), 400

    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long"}), 400

    # Check if the email already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Insert user data into the collection
    result = users_collection.insert_one({
        "name": name,
        "email": email,
       "studentNo":studentNo,
        "password": hashed_password.decode('utf-8'),
        "role": role,
        "department": department,
    })

    print(f"User inserted with ID: {result.inserted_id}")  # For debugging
    return jsonify({"message": "User registered successfully"}), 201

# Login Route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    # Find the user by email
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Verify the password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"message": "Invalid credentials"}), 401

    # Generate JWT token
    payload = {
        "user_id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    # Include the user's name in the response
    return jsonify({
        "message": "Login successful",
        "token": token,
        "name": user["name"],
        "role": user["role"],
        "email": user["email"]
    }), 200

#submit a log 
@app.route('/api/log', methods=['POST'])
def submit_log():
    data = request.json
    log = {
        "student_name": data.get("student_name"),
        "student_email" : data.get("student_email"),
        "department": data.get("department"),
        "year": data.get("year"),
        "module": data.get("module"),
        "date" : data.get("date"),
        "BookedTime":data.get("time"),
        "timestamp": datetime.utcnow().isoformat(),
        "advisor_email": data.get("advisor_email"),
        "confirmed": None,
        "status": None,
        "venue":None
            # Assign logs to a specific advisor
    }
    db.logs.insert_one(log)  # Save the log to the database
    return jsonify({"message": "Log submitted successfully"}), 201

#retrieve a log
@app.route('/api/advisor/logs', methods=['GET'])
def get_advisor_logs():
    advisor_email = request.args.get("advisor_email")
    if not advisor_email:
        return jsonify({"message": "Advisor email is required"}), 400

    # Retrieve logs for the specific advisor, including the _id field
    logs = list(db.logs.find({"advisor_email": advisor_email}, {"_id": 1, "student_name": 1, "student_email": 1, "department": 1, "year": 1, "module": 1, "date": 1, "BookedTime": 1, "timestamp": 1, "venue": 1, "confirmed": 1, "status": 1}))

    # Transform MongoDB ObjectId to string for JSON serialization
    for log in logs:
        log["_id"] = str(log["_id"])  # Convert ObjectId to string

    return jsonify(logs), 200
#update data 

@app.route('/api/log/<log_id>', methods=['PATCH'])
def update_log(log_id):
    """
    Update specific fields in an existing log entry.
    """
    data = request.json  # Get the fields to update from the request body

    # Ensure that the provided data is not empty
    if not data:
        return jsonify({"message": "No data provided to update"}), 400

    # Update the log with the provided fields
    update_result = db.logs.update_one(
        {"_id": ObjectId(log_id)},  # Find the log by its ID
        {"$set": data}  # Set the new values for the provided fields
    )

    # Check if the log was found and updated
    if update_result.matched_count == 0:
        return jsonify({"message": "Log not found"}), 404

    if update_result.modified_count == 0:
        return jsonify({"message": "No changes made to the log"}), 200

    return jsonify({"message": "Log updated successfully"}), 200

@app.route('/api/appointments',methods=['POST'])
def make_appointments():
    data = request.json
    log = {
        "student_name": data.get("student_name"),
        "student_email" : data.get("student_email"),
        "department": data.get("department"),
        "year": data.get("year"),
        "module": data.get("module"),
        "date" : data.get("date"),
        "BookedTime":data.get("time"),
        "timestamp": datetime.utcnow().isoformat(),
        "advisor_email": data.get("advisor_email"), 
          # Assign logs to a specific advisor
    }
    db.appointments.insert_one(log)  # Save the log to the database
    return jsonify({"message": "Log submitted successfully"}), 201
#retrieve appointments 
@app.route('/api/appoint', methods=['GET'])
def get_advisor_appoint():
    advisor_email = request.args.get("advisor_email")
    if not advisor_email:
        return jsonify({"message": "Advisor email is required"}), 400

    # Retrieve logs for the specific advisor
    logs = list(db.appointments.find({"advisor_email": advisor_email}, {"_id": 0}))
    return jsonify(logs), 200

# Protected Route Example
@app.route('/api/protected', methods=['GET'])
def protected():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"message": "Token is missing!"}), 403

    try:
        # Remove "Bearer " from the token if present
        token = token.split(" ")[1] if " " in token else token
        decoded_token = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return jsonify({"message": "Access granted", "user": decoded_token}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401
    

@app.route('/api/saveSurvey', methods=['POST'])
def save_survey():
    try:
        # Get the data from the frontend (JSON data sent in the body of the POST request)
        survey_data = request.get_json()

        # Validate the required fields (check if they exist or are not empty)
        if not survey_data.get("courseChallenges") or not survey_data.get("emotionalState"):
            return jsonify({"error": "Please fill in all required fields"}), 400
        
        # Prepare the survey data to be inserted into MongoDB
        survey_document = {
            "studentNo" : survey_data.get("studentNumber"),
            "courseChallenges": survey_data.get("courseChallenges"),
            "needsTutor": survey_data.get("needsTutor"),
            "needsStudyBuddy": survey_data.get("needsStudyBuddy"),
            "overwhelmed": survey_data.get("overwhelmed"),
            "emotionalState": survey_data.get("emotionalState"),
            "needsMentor": survey_data.get("needsMentor"),
            "needsCounselor": survey_data.get("needsCounselor"),
            "careerSupport": survey_data.get("careerSupport"),
            "internshipInterest": survey_data.get("internshipInterest"),
            "financialSupport": survey_data.get("financialSupport"),
            "financialAidHelp": survey_data.get("financialAidHelp"),
            "peerNetwork": survey_data.get("peerNetwork"),
            "departmentGroup": survey_data.get("departmentGroup"),
            "studentAmbassador": survey_data.get("studentAmbassador"),
            "preferredCommunication": survey_data.get("preferredCommunication"),
            "timestamp": datetime.utcnow(),  # Timestamp to indicate when the survey was submitted
        }

        # Save the survey data to MongoDB 
        db.surveys.insert_one(survey_document)

        # Respond with a success message
        return jsonify({"message": "Survey submitted successfully!"}), 200
    
    except Exception as e:
        # Catch any unexpected errors and log them
        print(f"Error saving survey: {e}")
        return jsonify({"error": "An error occurred while submitting the survey."}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
