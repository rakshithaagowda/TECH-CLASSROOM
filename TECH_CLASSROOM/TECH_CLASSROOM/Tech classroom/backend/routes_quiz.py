# routes_quiz.py
import os
import json
from flask import Blueprint, jsonify

quiz_bp = Blueprint("quiz", __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_subject_file(subject):
    filename = f"{subject}.json"
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@quiz_bp.route("/<subject>/<int:level>", methods=["GET"])
def get_quiz(subject, level):
    subject = subject.lower()
    subject_data = load_subject_file(subject)
    if not subject_data:
        return jsonify({"error": "Subject not found"}), 404

    for lvl in subject_data.get("levels", []):
        if lvl.get("level") == level:
            # Expect each question to have: question, options (list), answer
            # Normalize to objects with {question, options, answer}
            questions = []
            for q in lvl.get("questions", []):
                # if q already in desired format, use it; else try to map
                if isinstance(q, dict):
                    # ensure options array exists
                    opts = q.get("options")
                    if not opts:
                        # try option1..option4 style
                        opts = [q.get("option1"), q.get("option2"), q.get("option3"), q.get("option4")]
                        opts = [o for o in opts if o is not None]
                    questions.append({
                        "question": q.get("question") or q.get("q") or "",
                        "options": opts,
                        "answer": q.get("answer")
                    })
                else:
                    # unsupported format
                    continue
            return jsonify(questions)
    return jsonify({"error": "Level not found"}), 404

# optional: list available files
@quiz_bp.route("/available", methods=["GET"])
def available():
    files = []
    if os.path.isdir(DATA_DIR):
        files = [f for f in os.listdir(DATA_DIR) if f.lower().endswith(".json")]
    return jsonify({"files": files})
