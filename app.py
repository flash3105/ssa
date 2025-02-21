from typing import Counter
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
from werkzeug.utils import secure_filename
from flask import send_from_directory
import logging

# Load environment variables from .env file
load_dotenv()

# Flask app setup
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
# MongoDB Atlas connection URI
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

# Connect to the "SSA" database
db = client["SSA"]

# Access the "user" collection
users_collection = db["users"]
collection = db["resources"]
# JWT Secret Key for creating JWT tokens
JWT_SECRET = os.getenv("JWT_SECRET", "your_jwt_secret_key")

def convert_objectid_to_str(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_objectid_to_str(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectid_to_str(v) for v in obj]
    else:
        return obj

@app.route('/api/upload-resource', methods=['POST'])
def upload_resource():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the file or process it as needed
    file.save(f"uploads/{file.filename}")

    # Prepare resource data
    resource_data = {
        "department": request.form.get('department'),
        "year": request.form.get('year'),
        "course": request.form.get('course'),
        "name": request.form.get('name'),
        "description": request.form.get('description'),
        "file_path": f"uploads/{file.filename}"
    }

    # Insert into MongoDB
    result = collection.insert_one(resource_data)

    # Fetch the inserted document
    inserted_doc = collection.find_one({"_id": result.inserted_id})

    # Convert ObjectId fields to strings
    inserted_doc = convert_objectid_to_str(inserted_doc)

    # Log the document for debugging
    logging.info(f"Inserted document: {inserted_doc}")

    return jsonify({"message": "Resource uploaded successfully!", "resource": inserted_doc}), 201

@app.route('/api/resources/<course>/', methods=['GET'])
def get_resource(course):
    try:
        # Fetch all resources related to the course
        resources = collection.find({"course": course})

        # Convert the cursor to a list of dictionaries
        resource_list = [{
            "name": res.get("name", ""),
            "description": res.get("description", ""),
            "file_path": res.get("file_path", "")
        } for res in resources]

        return jsonify({"resources": resource_list}), 200
    except Exception as e:
        logging.error(f"Error retrieving resources: {e}")
        return jsonify({"error": "Failed to retrieve resources"}), 500

    

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

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
    subject = data.get('selectedCourse')

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
        "subject" : subject
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
        "studentNo" : user["studentNo"],
        "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

    # Include the user's name in the response
    return jsonify({
        "message": "Login successful",
        "token": token,
        "name": user["name"],
        "role": user["role"],
        "email": user["email"],
        "studentNo" : user["studentNo"]
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
   #db.logs.insert_one(log)  # Save the log to the database
    result = db.logs.insert_one(log)
    print(f"Inserted Log with ID: {result.inserted_id}")

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
@app.route('/api/student/logs', methods=['GET'])
def get_student_logs():
    student_email = request.args.get("email")
    if not student_email:
        return jsonify({"message": "Student email is required"}), 400

    # Retrieve logs for the specific advisor, including the _id field
    logs = list(db.logs.find({"student_email": student_email}, {"_id": 1, "student_name": 1, "advisor_email":1 ,"student_email": 1, "department": 1, "year": 1, "module": 1, "date": 1, "BookedTime": 1, "timestamp": 1, "venue": 1, "confirmed": 1, "status": 1}))

    # Transform MongoDB ObjectId to string for JSON serialization
    for log in logs:
        log["_id"] = str(log["_id"])  # Convert ObjectId to string
    
    return jsonify(logs), 200 


@app.route('/api/appointment/confirm/<appointment_id>', methods=['PUT'])
def confirm_appointment(appointment_id):
    try:
        result = db.logs.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"confirmed": True}}
        )
        
        if result.modified_count == 1:
            return jsonify({"message": "Appointment confirmed successfully"}), 200
        else:
            return jsonify({"message": "Appointment not found or already confirmed"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    #for venue 

@app.route('/api/appointment/venue/<appointment_id>', methods=['PUT'])
def confirm_venue(appointment_id):
    venue = request.json.get('venue')  # Extract venue from the request body
    try:
        result = db.logs.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"venue": venue}}
        )
        if result.modified_count == 1:
            return jsonify({"message": "Venue confirmed successfully"}), 200
        else:
            return jsonify({"message": "Venue can't be set"}), 404
    except Exception as e:
        print(f"Error updating venue: {str(e)}")  # More detailed error logging
        return jsonify({"error": str(e)}), 500

@app.route('/api/appointment/status/<appointment_id>',methods=['PUT'])
def update_status(appointment_id):
    status = request.json.get('status')
    try:
        result =db.logs.update_one(
            {"_id":ObjectId(appointment_id)},
            {"$set":{"status":status}}
        )
        if result.modified_count == 1:
            return jsonify({"message": "status confirmed successfully"}), 200
        else:
            return jsonify({"message": "status can't be set"}), 404
    except Exception as e:
        print(f"Error updating status: {str(e)}")  # More detailed error logging
        return jsonify({"error": str(e)}), 500

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

#feedback ....
@app.route('/api/feedback', methods=['POST'])
def save_feedback():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Check if data was provided
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Prepare feedback data to insert into the database
        feedback_data = {
            "student_number": data.get("studentNumber"),
            "advisor_email": data.get("advisorEmail"),
            "module" : data.get("module"),
            "session_met_needs": data.get("sessionMetNeeds"),
            "further_support": data.get("furtherSupport"),
            "session_rating": data.get("sessionRating"),
            "improvement_suggestions": data.get("improvementSuggestions"),
            "additional_notes": data.get("additionalNotes"),
            "timestamp": datetime.utcnow()  # Save current UTC time as feedback timestamp
        }

        # Insert feedback into the database
        db.feedback.insert_one(feedback_data)

        # Respond with a success message
        return jsonify({"message": "Feedback submitted successfully!"}), 200
    except Exception as e:
        # Catch any unexpected errors and log them
        print(f"Error saving feedback: {e}")
        return jsonify({"error": "An error occurred while submitting the feedback."}), 500


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
    
    #Posting data into finaid
@app.route('/api/FinancialAid', methods=['POST'])
def save_financial_aid():
    try:
        data = request.get_json()  # Get data from the request body
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Correct dictionary syntax (use : instead of =)
        financial_aid_data = {
            "needsFinancialAid": data.get('needsFinancialAid'),
            "needsAidGuidance": data.get('needsAidGuidance'),
            "needsAidOfficer": data.get('needsAidOfficer'),
            "studentNo" : data.get('studentNo')
        }
        
        # Save the survey data to MongoDB
        db.FinAid.insert_one(financial_aid_data)

        # Respond with a success message
        return jsonify({"message": "Survey submitted successfully!"}), 200
        
    except Exception as e:
        # Catch any unexpected errors and log them
        print(f"Error saving survey: {e}")
        return jsonify({"error": "An error occurred while submitting the survey."}), 500


  
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
            "department" : survey_data.get("department"),
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
    
from bson import ObjectId

@app.route('/api/analytics', methods=['GET'])
def analyze_data():
    # Logs Analysis
    logs = db.logs.find()
    print(logs)
    departments = [log['department'] for log in logs]
    total_logs = len(departments)
    
    department_counter = Counter(departments)
    most_common_department = department_counter.most_common(3)
    
    # Survey Analysis
    survey_data = db.surveys.find()
    
    # Department distribution from survey data
    survey_departments = [log["department"] for log in logs]
    survey_department_counter = Counter(survey_departments)
    
    # Analyzing survey questions
    course_challenges = Counter([survey.get('courseChallenges') for survey in db.surveys.find()])
    needs_tutor = Counter([survey.get('needsTutor') for survey in db.surveys.find()])
    emotional_state = Counter([survey.get('emotionalState') for survey in db.surveys.find()])
    
    # Return all data as JSON
    analysis = {
        "total_logs": total_logs,
        "most_common_department": most_common_department,
        "survey_department_counts": dict(survey_department_counter),
        "course_challenges": dict(course_challenges),
        "needs_tutor": dict(needs_tutor),
        "emotional_state": dict(emotional_state),
    }
    print(analysis)
    return jsonify(analysis)
@app.route('/api/get_summary/<student_number>', methods=['GET'])
def get_summary(student_number):
    try:
        # Retrieve the survey from MongoDB
        if "@" in student_number: 
            student_id = student_number.split("@")[0]
            survey=db.surveys.find_one({"studentNo": student_id})
        else:
             survey = db.surveys.find_one({"studentNo": student_number})

        if not survey:
            return jsonify({'message': 'No survey summary found'}), 404

        # Convert ObjectId to string
        survey['_id'] = str(survey['_id'])

        return jsonify({'summary': survey}), 200
    except Exception as e:
        print(f"Error retrieving survey summary: {e}")
        return jsonify({"error": "An error occurred while fetching the summary."}), 500



#get tutors or advisors 

@app.route('/api/users/adminP', methods=['GET'])
def get_tutors_and_advisors():
    """
    Fetch all users who have the role of 'Tutor' or 'Academic Advisor',
    along with their subject, student number, and department.
    """
    try:
        roles = ["Tutor", "Academic Advisor"]
        users = list(users_collection.find(
            {"role": {"$in": roles}}, 
            {"_id": 1, "name": 1, "email": 1, "role": 1, "subject": 1, "studentNo": 1, "department": 1}
        ))

        if not users:
            return jsonify({"message": "No tutors or academic advisors found."}), 404
        
        # Convert ObjectId to string
        for user in users:
            user["_id"] = str(user["_id"])

        return jsonify(users), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/users/editAdmin/<string:id>', methods=['PUT'])
def edit_user(id):
    try:
        # Get the user by ID
        user = users_collection.find_one({"_id": ObjectId(id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update the user fields from the request body
        data = request.get_json()
        update_data = {
            "name": data.get("name", user.get("name")),
            "email": data.get("email", user.get("email")),
            "role": data.get("role", user.get("role")),
            "studentNo": data.get("studentNo", user.get("studentNo")),
            "department": data.get("department", user.get("department")),
            "subject": data.get("subject", user.get("subject"))
        }

        # Update the user in MongoDB
        users_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})

        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete user (MongoDB)
@app.route('/api/users/delete/<string:id>', methods=['DELETE'])
def delete_user(id):
    try:
        # Get the user by ID
        user = users_collection.find_one({"_id": ObjectId(id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Delete the user from MongoDB
        users_collection.delete_one({"_id": ObjectId(id)})

        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
