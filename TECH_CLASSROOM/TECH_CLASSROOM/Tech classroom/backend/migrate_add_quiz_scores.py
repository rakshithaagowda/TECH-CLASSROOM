# migrate_add_quiz_scores.py
import sqlite3

conn = sqlite3.connect("database.db")
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS quiz_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    level INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    UNIQUE(user_id, subject, level),
    FOREIGN KEY(user_id) REFERENCES users(id)
)
""")

conn.commit()
conn.close()
print("Migration done: quiz_scores table exists (or was already present).")
