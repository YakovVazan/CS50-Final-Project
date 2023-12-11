import sqlite3

# Configure SQL db
db_path = "social_hub.db"


def get_db_connection():
    return sqlite3.connect(db_path)


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            email_address TEXT,
            authenticated NUMERIC NOT NULL,
            hash TEXT NOT NULL
        )
    """)
    # Create messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            date DATE NOT NULL,
            is_scheduled BOOLEAN NOT NULL,
            schedule_date DATE,
            social_platforms TEXT NOT NULL,
            user_id INTEGER REFERENCES users(id)
        )
    """)
    # Create scheduled_posts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scheduled_posts (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            scheduling_date DATE NOT NULL,
            execution_date DATE NOT NULL,
            social_platforms TEXT NOT NULL,
            user_id INTEGER REFERENCES users(id)
        )
    """)
    # Create notifications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            codeColor TEXT NOT NULL,
            date DATE NOT NULL,
            user_id INTEGER REFERENCES users(id)
        )
    """)
    # Create socials table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS socials (
            index_id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            social_id TEXT NOT NULL,
            user_id INTEGER REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()