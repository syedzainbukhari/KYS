# import os
# import base64
# import uuid
# import random
# from flask import Flask, request, jsonify, render_template, session, redirect, url_for, Response
# import mysql.connector
# from sync_to_google import export_single_record
# from datetime import datetime  # Make sure it's imported
# import psycopg2

# app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

# app.secret_key = 'zain_1234_super_secret'  # Required for session

# # Connect to MySQL database FaceDataDb
# # db = mysql.connector.connect(
# #     host="localhost",
# #     user="root",
# #     password="root",
# #     database="FaceDataDb",
# #     port=8889,
# # )
# db = psycopg2.connect(
#     host="dpg-d16thgbuibrs73eordl0-a",        # Render-hosted DB
#     port=5432,
#     database="facedb_g05r",                   # Your PostgreSQL db name
#     user="facedb_g05r_user",                  # Your PostgreSQL user
#     password="l3KMVuhVMJYqPXSlGlJbY4xHzmi07i59"        # Paste the password from Render
# )

# cursor = db.cursor()

# # Serve the registration form
# @app.route('/')
# def index():
#     return render_template('index.html')

# # Handle form submission

# @app.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     name = data['name']
#     dob = data['dob']
#     age = data['age']
#     image_data = data['image'].split(',')[1]  # Strip "data:image/jpeg;base64,..."

#     image_bytes = base64.b64decode(image_data)

#     filename = f"{uuid.uuid4().hex}.jpg"
#     save_path = os.path.join('/Users/syedzainbukhari/Desktop/NewProject/backend/captured_faces', filename)
#     os.makedirs(os.path.dirname(save_path), exist_ok=True)
#     with open(save_path, 'wb') as f:
#         f.write(image_bytes)

#     cursor.execute(
#         "INSERT INTO faceData (name, dob, age, image_data) VALUES (%s, %s, %s, %s)",
#         (name, dob, age, image_bytes)
#     )
#     db.commit()

#     cursor.execute("SELECT LAST_INSERT_ID()")
#     user_id = cursor.fetchone()[0]

#     session['age'] = int(age)
#     session['user_id'] = user_id

#     # ✅ Convert string DOB to datetime object
#     dob_obj = datetime.strptime(dob, "%Y-%m-%d")
#     export_single_record(name, dob_obj, age, image_bytes)

#     return jsonify({"success": True})

# # Serve the quiz page
# @app.route('/quiz')
# def quiz():
#     age = session.get('age')

#     if not age:
#         return redirect('/')

#     # Decide age group
#     if 6 <= age <= 10:
#         group = 'A'
#     elif 11 <= age <= 16:
#         group = 'B'
#     else:
#         group = 'C'

#     return render_template('quiz.html', group=group)

# # API to fetch questions based on group
# @app.route('/api/get-questions/<group>')
# def get_questions(group):
#     # Example question sets
#     questions_by_group = {
#         'A': [
#             {"question": "What color is the sky?", "options": ["Blue", "Green", "Red"], "answer": "Blue"},
#             {"question": "How many legs does a spider have?", "options": ["6", "8", "10"], "answer": "8"},
#             # Add more...
#         ],
#         'B': [
#             {"question": "What is 12 * 5?", "options": ["60", "50", "45"], "answer": "60"},
#             {"question": "What gas do plants absorb?", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen"], "answer": "Carbon Dioxide"},
#             # Add more...
#         ],
#         'C': [
#             {"question": "Who developed the theory of relativity?", "options": ["Newton", "Einstein", "Tesla"], "answer": "Einstein"},
#             {"question": "What's the capital of Canada?", "options": ["Toronto", "Ottawa", "Vancouver"], "answer": "Ottawa"},
#             # Add more...
#         ]
#     }

#     questions = questions_by_group.get(group.upper())
#     if not questions:
#         return {"success": False, "message": "Invalid group"}, 400

#     random.shuffle(questions)
#     return {"success": True, "questions": questions[:10]}

# # Submit quiz result
# @app.route('/submit-quiz', methods=['POST'])
# def submit_quiz():
#     data = request.json
#     score = data.get('score')
#     time_taken = data.get('time')
#     user_id = session.get('user_id')

#     if user_id and score is not None:
#         cursor.execute("UPDATE faceData SET score=%s, time_taken=%s WHERE id=%s", (score, time_taken, user_id))
#         db.commit()
#         return {"success": True}
#     return {"success": False, "message": "Missing data"}, 400

# # Get user's image from DB
# @app.route('/get-image/<int:user_id>')
# def get_image(user_id):
#     cursor.execute("SELECT image_data FROM faceData WHERE id = %s", (user_id,))
#     result = cursor.fetchone()
#     if result and result[0]:
#         return Response(result[0], mimetype='image/jpeg')
#     else:
#         return "Image not found", 404

# @app.route('/get-user')
# def get_user():
#     user_id = session.get('user_id')
#     if not user_id:
#         return jsonify({"success": False, "message": "User not found"}), 404

#     cursor.execute("SELECT id, name, age FROM faceData WHERE id = %s", (user_id,))
#     result = cursor.fetchone()
#     if result:
#         return jsonify({"success": True, "user": {"id": result[0], "name": result[1], "age": result[2]}})
#     else:
#         return jsonify({"success": False, "message": "User not found"}), 404

# @app.route("/certificate")
# def certificate():
#     user = session.get("user") or {}  # Or however you're storing user info
#     return render_template("certificate.html", user=user)




# if __name__ == '__main__':
#     app.run(debug=True)

import os
import base64
import uuid
import random
from flask import Flask, request, jsonify, render_template, session, redirect, url_for, Response
import psycopg2
from sync_to_google import export_single_record
from datetime import datetime

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')

# Use environment variable for production secret
app.secret_key = os.getenv("SECRET_KEY", "zain_1234_super_secret")  # Safe fallback for local dev

# PostgreSQL connection settings from Render
db = psycopg2.connect(
    host="dpg-d16thgbuibrs73eordl0-a",
    port=5432,
    database="facedb_g05r",
    user="facedb_g05r_user",
    password="l3KMVuhVMJYqPXSlGlJbY4xHzmi07i59"
)
cursor = db.cursor()

# ========================== Routes ============================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data['name']
        dob = data['dob']
        age = data['age']
        image_data = data['image'].split(',')[1]

        image_bytes = base64.b64decode(image_data)

        # Save image to local folder (relative path)
        filename = f"{uuid.uuid4().hex}.jpg"
        save_path = os.path.join('captured_faces', filename)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        with open(save_path, 'wb') as f:
            f.write(image_bytes)

        # Insert into PostgreSQL
        cursor.execute(
            "INSERT INTO faceData (name, dob, age, image_data) VALUES (%s, %s, %s, %s)",
            (name, dob, age, psycopg2.Binary(image_bytes))
        )
        db.commit()

        # Fetch last inserted ID in PostgreSQL
        cursor.execute("SELECT currval(pg_get_serial_sequence('faceData', 'id'))")
        user_id = cursor.fetchone()[0]

        session['age'] = int(age)
        session['user_id'] = user_id

        # Export to Google Drive & Sheet
        dob_obj = datetime.strptime(dob, "%Y-%m-%d")
        export_single_record(name, dob_obj, age, image_bytes)

        return jsonify({"success": True})
    
    except Exception as e:
        # Print error to logs for debugging
        print("❌ Registration Error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/quiz')
def quiz():
    age = session.get('age')
    if not age:
        return redirect('/')

    if 6 <= age <= 10:
        group = 'A'
    elif 11 <= age <= 16:
        group = 'B'
    else:
        group = 'C'

    return render_template('quiz.html', group=group)


@app.route('/api/get-questions/<group>')
def get_questions(group):
    questions_by_group = {
        'A': [
            {"question": "What color is the sky?", "options": ["Blue", "Green", "Red"], "answer": "Blue"},
            {"question": "How many legs does a spider have?", "options": ["6", "8", "10"], "answer": "8"},
        ],
        'B': [
            {"question": "What is 12 * 5?", "options": ["60", "50", "45"], "answer": "60"},
            {"question": "What gas do plants absorb?", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen"], "answer": "Carbon Dioxide"},
        ],
        'C': [
            {"question": "Who developed the theory of relativity?", "options": ["Newton", "Einstein", "Tesla"], "answer": "Einstein"},
            {"question": "What's the capital of Canada?", "options": ["Toronto", "Ottawa", "Vancouver"], "answer": "Ottawa"},
        ]
    }

    questions = questions_by_group.get(group.upper())
    if not questions:
        return {"success": False, "message": "Invalid group"}, 400

    random.shuffle(questions)
    return {"success": True, "questions": questions[:10]}


@app.route('/submit-quiz', methods=['POST'])
def submit_quiz():
    data = request.json
    score = data.get('score')
    time_taken = data.get('time')
    user_id = session.get('user_id')

    if user_id and score is not None:
        cursor.execute("UPDATE faceData SET score=%s, time_taken=%s WHERE id=%s", (score, time_taken, user_id))
        db.commit()
        return {"success": True}
    return {"success": False, "message": "Missing data"}, 400


@app.route('/get-image/<int:user_id>')
def get_image(user_id):
    cursor.execute("SELECT image_data FROM faceData WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    if result and result[0]:
        return Response(result[0], mimetype='image/jpeg')
    else:
        return "Image not found", 404


@app.route('/get-user')
def get_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"success": False, "message": "User not found"}), 404

    cursor.execute("SELECT id, name, age FROM faceData WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    if result:
        return jsonify({"success": True, "user": {"id": result[0], "name": result[1], "age": result[2]}})
    else:
        return jsonify({"success": False, "message": "User not found"}), 404


# @app.route("/certificate")
# def certificate():
#     user = session.get("user") or {}
#     return render_template("certificate.html", user=user)

@app.route("/certificate")
def certificate():
    return render_template("certificate.html")

@app.route('/api/certificate-data')
def certificate_data():
    user_id = session.get('user_id') or request.args.get('id')

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid user ID"}), 400

    try:
        cursor.execute("""
            SELECT name, age, score, time_taken, dob, image_data 
            FROM faceData 
            WHERE id = %s
        """, (user_id,))
        
        result = cursor.fetchone()
        if not result:
            return jsonify({"success": False, "message": "User data not found"}), 404
        
        name, age, score, time_taken, dob, image_data = result
        
        url_score = request.args.get('score')
        url_time = request.args.get('time')
        
        final_score = int(url_score) if url_score else (score if score is not None else 0)
        final_time = int(url_time) if url_time else (time_taken if time_taken is not None else 0)
        
        if 6 <= age <= 10:
            level = "Beginner"
            total_questions = 10
        elif 11 <= age <= 16:
            level = "Intermediate"
            total_questions = 10
        else:
            level = "Advanced"
            total_questions = 10
        
        accuracy = round((final_score / total_questions) * 100) if total_questions > 0 else 0
        minutes = int(final_time) // 60
        seconds = int(final_time) % 60
        time_formatted = f"{minutes}:{seconds:02d}"
        
        certificate_id = f"SKP-{datetime.now().year}-{user_id:04d}-{uuid.uuid4().hex[:6].upper()}"
        
        image_base64 = None
        if image_data:
            if isinstance(image_data, memoryview):
                image_data = image_data.tobytes()
            image_base64 = f"data:image/jpeg;base64,{base64.b64encode(image_data).decode('utf-8')}"

        return jsonify({
            "success": True,
            "name": name,
            "age": age,
            "image": image_base64,
            "score": final_score,
            "total_questions": total_questions,
            "accuracy": accuracy,
            "time_taken": final_time,
            "time_formatted": time_formatted,
            "quiz_level": level,
            "certificate_id": certificate_id,
            "date": datetime.now().strftime("%B %d, %Y")
        })

    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"success": False, "message": f"Database error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
