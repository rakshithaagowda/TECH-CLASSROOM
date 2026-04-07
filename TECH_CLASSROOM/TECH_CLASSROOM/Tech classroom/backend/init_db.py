import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# -----------------------------
# USERS TABLE 
# -----------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
""")

# -----------------------------
# TODO TABLE 
# -----------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
""")

# -----------------------------
# QUIZ PROGRESS TABLE (IMPORTANT!)
# -----------------------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS quiz_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    max_level_unlocked INTEGER DEFAULT 1,
    UNIQUE(user_id, subject),
    FOREIGN KEY(user_id) REFERENCES users(id)
);
""")

conn.commit()
conn.close()

print("DATABASE INITIALIZED: users, todos & quiz_progress tables created successfully!")
