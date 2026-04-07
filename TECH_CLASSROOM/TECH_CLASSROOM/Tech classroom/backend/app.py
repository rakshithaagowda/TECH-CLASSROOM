# ================================
#  Tech Classroom Backend (Final)
#  Fast | Stable | No SocketIO
# ================================

from flask import Flask, request, jsonify, session, g
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os, json

# Blueprints
from routes_quiz import quiz_bp
from chatbot import chatbot_bp

# -----------------------------------
# Flask Setup
# -----------------------------------
app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev_secret_key"

# Register blueprints
app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
app.register_blueprint(chatbot_bp, url_prefix="/api/chatbot")

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": ["http://127.0.0.1:5500", "http://localhost:5500"]
        }
    }
)

# -----------------------------------
# DB Connection
# -----------------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect("database.db")
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(error):
    db = g.pop("db", None)
    if db:
        db.close()


# -----------------------------------
# Initialize Database
# -----------------------------------
def init_db():
    db = get_db()

    # USERS
    db.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    # TODOS
    db.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    """)

    # QUIZ PROGRESS
    db.execute("""
        CREATE TABLE IF NOT EXISTS quiz_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            max_level_unlocked INTEGER DEFAULT 1,
            UNIQUE(user_id, subject)
        )
    """)

    # QUIZ SCORES
    db.execute("""
        CREATE TABLE IF NOT EXISTS quiz_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            subject TEXT NOT NULL,
            level INTEGER NOT NULL,
            score INTEGER NOT NULL,
            total INTEGER NOT NULL
        )
    """)

    db.commit()


with app.app_context():
    init_db()


# -----------------------------------
# Helper: Checks if level exists
# -----------------------------------
def subject_has_level(subject, level):
    path = os.path.join("data", f"{subject}.json")
    if not os.path.exists(path):
        return False
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        for lvl in data.get("levels", []):
            if lvl["level"] == int(level):
                return True
    except:
        return False
    return False


# -----------------------------------
# AUTH ROUTES
# -----------------------------------
@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.json
    fullname = data.get("fullname")
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    if not fullname or not email or not username or not password:
        return jsonify({"error": "All fields required"}), 400

    db = get_db()
    exists = db.execute(
        "SELECT id FROM users WHERE email=? OR username=?",
        (email, username)
    ).fetchone()

    if exists:
        return jsonify({"error": "Email or username already exists"}), 409

    hashed = generate_password_hash(password)

    db.execute(
        "INSERT INTO users (fullname,email,username,password) VALUES (?,?,?,?)",
        (fullname, email, username, hashed)
    )
    db.commit()

    return jsonify({"message": "Signup successful"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not check_password_hash(user["password"], password):
        return jsonify({"error": "Incorrect password"}), 401

    session["user_id"] = user["id"]
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "fullname": user["fullname"],
            "username": user["username"],
            "email": user["email"]
        }
    })


@app.route("/api/auth/me", methods=["GET"])
def me():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"logged_in": False})

    db = get_db()
    user = db.execute(
        "SELECT id,fullname,username,email FROM users WHERE id=?",
        (uid,)
    ).fetchone()

    return jsonify({"logged_in": True, "user": dict(user)})


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


# -----------------------------------
# TODO ROUTES
# -----------------------------------
@app.route("/api/todo", methods=["GET"])
def get_todos():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    db = get_db()
    rows = db.execute("SELECT * FROM todos WHERE user_id=?", (uid,)).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/todo", methods=["POST"])
def add_todo():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    text = request.json.get("text")

    db = get_db()
    db.execute("INSERT INTO todos (user_id,text) VALUES (?,?)", (uid, text))
    db.commit()

    return jsonify({"message": "Added"})


@app.route("/api/todo/<int:tid>", methods=["DELETE"])
def delete_todo(tid):
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    db = get_db()
    db.execute("DELETE FROM todos WHERE id=?", (tid,))
    db.commit()

    return jsonify({"message": "Deleted"})


# -----------------------------------
# QUIZ PROGRESS
# -----------------------------------
@app.route("/api/quiz/progress", methods=["GET"])
def get_quiz_progress():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"progress": {}})

    db = get_db()
    rows = db.execute(
        "SELECT subject,max_level_unlocked FROM quiz_progress WHERE user_id=?",
        (uid,)
    ).fetchall()

    return jsonify({
        "progress": {r["subject"]: r["max_level_unlocked"] for r in rows}
    })


@app.route("/api/quiz/progress", methods=["POST"])
def update_quiz_progress():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    data = request.json
    subject = (data.get("subject") or "").lower()
    level = int(data.get("level"))

    if not subject_has_level(subject, level):
        return jsonify({"error": "Invalid subject/level"}), 404

    db = get_db()
    row = db.execute(
        "SELECT max_level_unlocked FROM quiz_progress WHERE user_id=? AND subject=?",
        (uid, subject)
    ).fetchone()

    if row:
        if level > row["max_level_unlocked"]:
            db.execute(
                "UPDATE quiz_progress SET max_level_unlocked=? WHERE user_id=? AND subject=?",
                (level, uid, subject)
            )
            db.commit()
    else:
        db.execute(
            "INSERT INTO quiz_progress (user_id,subject,max_level_unlocked) VALUES (?,?,?)",
            (uid, subject, level)
        )
        db.commit()

    return jsonify({"message": "Saved"})


# -----------------------------------
# QUIZ SCORE
# -----------------------------------
@app.route("/api/quiz/score", methods=["POST"])
def quiz_score():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    data = request.json
    subject = data.get("subject")
    level = int(data.get("level"))
    score = int(data.get("score"))
    total = int(data.get("total"))

    db = get_db()

    exists = db.execute("""
        SELECT id FROM quiz_scores
        WHERE user_id=? AND subject=? AND level=?
    """, (uid, subject, level)).fetchone()

    if exists:
        db.execute("""
            UPDATE quiz_scores SET score=?, total=? WHERE id=?
        """, (score, total, exists["id"]))
    else:
        db.execute("""
            INSERT INTO quiz_scores (user_id,subject,level,score,total)
            VALUES (?,?,?,?,?)
        """, (uid, subject, level, score, total))

    db.commit()
    return jsonify({"message": "Score saved"})


@app.route("/api/quiz/score/summary", methods=["GET"])
def quiz_score_summary():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"scores": {}, "total_points": 0})

    db = get_db()

    rows = db.execute("""
        SELECT subject, SUM(score) AS earned, SUM(total) AS total
        FROM quiz_scores
        WHERE user_id=?
        GROUP BY subject
    """, (uid,)).fetchall()

    summary = {}
    total_pts = 0

    for r in rows:
        earned = int(r["earned"])
        total_pts += earned
        summary[r["subject"]] = {
            "earned": earned,
            "total": int(r["total"])
        }

    return jsonify({"scores": summary, "total_points": total_pts})


# -----------------------------------
# Run App (FAST)
# -----------------------------------
if __name__ == "__main__":
    app.run(debug=True)


