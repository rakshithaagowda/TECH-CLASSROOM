
# Tech-Classroom
Tech Classroom is a web-based learning platform for technical subjects, offering classroom management, level-based interactive quizzes, a student dashboard, to-do list, and a resource library for structured and engaging learning.
=======
# TECH_CLASSROOM

TECH_CLASSROOM is a web-based classroom and technical learning platform that allows students to learn, practice, and track their progress in a structured way.

---

## Overview

This project is built with a **Python backend (Flask)** and a **frontend using HTML, CSS, and JavaScript**.

It provides a classroom-like environment where students can attempt quizzes, access resources, and manage their learning activities.

---

## Features

* Classroom-based learning system
* Level-based technical quizzes
* Quiz management (create, update, store results)
* Student performance tracking
* Resource section for learning materials
* Basic chatbot support
* To-do/task management

---

## Tech Stack

* Backend: Python (Flask)
* Frontend: HTML, CSS, JavaScript
* Database: SQLite

---

## Project Structure

```
TECH_CLASSROOM/
│
├── backend/
│   ├── app.py
│   ├── chatbot.py
│   ├── config.py
│   ├── database.py
│   ├── routes_quiz.py
│   ├── routes_chatbot.py
│   ├── database.db
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── assets/
│   ├── css/
│   ├── js/
│   ├── pages/
│   └── resources/
│
└── README.md
```

---

## How to Run the Project

### 1. Clone the repository

git clone https://github.com/your-username/TECH_CLASSROOM.git

### 2. Go to backend

cd backend

### 3. Create virtual environment

python -m venv venv

### 4. Activate environment

venv\Scripts\activate

### 5. Install dependencies

pip install -r requirements.txt

### 6. Run the server

python app.py

### 7. Open frontend

Go to frontend folder and open:
index.html

---

## Notes

* Database used: SQLite (`database.db`)
* Backend handles APIs and quiz logic
* Frontend handles UI and user interaction

---

## Future Improvements

* Add authentication system
* Improve chatbot functionality
* Enhance UI/UX
* Deploy the application

---

## Author

Rakshitha R S

>>>>>>> 72d050b1c1b1e07f941cc2b2fd01c8198cef979d
