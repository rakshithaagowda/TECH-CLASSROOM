import json
import os
from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot", __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

# Load all quiz questions from all subjects
def load_all_questions():
    dataset = []

    for file in os.listdir(DATA_DIR):
        if file.endswith(".json"):
            subject = file.replace(".json", "")
            with open(os.path.join(DATA_DIR, file), "r") as f:
                data = json.load(f)

            for lvl in data["levels"]:
                for q in lvl["questions"]:
                    dataset.append({
                        "subject": subject,
                        "level": lvl["level"],
                        "question": q["question"],
                        "answer": q["answer"],
                        "options": q["options"]
                    })
    return dataset

ALL_QUESTIONS = load_all_questions()


# simple similarity scoring
def similarity(q1, q2):
    q1 = q1.lower()
    q2 = q2.lower()
    score = 0
    for word in q1.split():
        if word in q2:
            score += 1
    return score


@chatbot_bp.route("/chat", methods=["POST"])
def chatbot():
    user_msg = request.json.get("message", "").strip()

    if not user_msg:
        return jsonify({"reply": "Please ask a question!"})

    # find best match
    best = None
    best_score = 0

    for item in ALL_QUESTIONS:
        s = similarity(user_msg, item["question"])
        if s > best_score:
            best = item
            best_score = s

    if best_score == 0:
        return jsonify({"reply": "I don't know that yet. Try asking something from your quiz syllabus!"})

    reply = (
        f"**Question I found:** {best['question']}\n\n"
        f"**Answer:** {best['answer']}\n\n"
        f"**Options:** {', '.join(best['options'])}"
    )

    return jsonify({"reply": reply})
