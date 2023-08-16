import sqlite3
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash

# Configure flask app
app = Flask(__name__)

# Configure SQL db
db_path = "social_hub.db"

# Configure session


def get_db_connection():
    return sqlite3.connect(db_path)


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT NOT NULL,
            hash TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


init_db()


@app.route("/")
def index():
    return render_template("main_layout.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        inputed_name = request.form.get("username")
        inputed_password = request.form.get("password")
        inputed_confirmation = request.form.get("confirmation")

        if not inputed_name or not inputed_password or not inputed_confirmation:
            return render_template("error.html", error_message="All Fields are Required", error_code=400)

        hashed_password = generate_password_hash(inputed_password)

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Prevent redundancy
        rows = cursor.execute(
            "SELECT * FROM users WHERE username = ?", (inputed_name, )).fetchall()
        user_dicts = [dict(user) for user in rows]
        for user in user_dicts:
            if inputed_name == user["username"]:
                return render_template("error.html", error_message="Username already exists.", error_code=400)

        cursor.execute("INSERT INTO users (username, hash) VALUES (?, ?)",
                       (inputed_name, hashed_password))
        conn.commit()
        conn.close()

        return redirect(url_for("login"))
    else:
        return render_template("register.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        inputed_name = request.form.get("username")
        inputed_password = request.form.get("password")

        # Confirm all fields are filled
        if not inputed_name or not inputed_password:
            return render_template("error.html", error_message="All Fields are Required", error_code=400)

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        rows = cursor.execute(
            "SELECT * FROM users WHERE username = ?", (inputed_name, )).fetchall()
        user_dict = [dict(user) for user in rows]

        # Ensure username exists and password is correct
        if len(user_dict) != 1 or not check_password_hash(
            rows[0]["hash"], inputed_password
        ):
            return render_template("error.html", error_message="invalid username and/or password", error_code=403)

        return redirect("/")

    else:
        return render_template("login.html")


@app.route("/my_apps")
def my_apps():
    return render_template("my_apps.html")


@app.route("/available_apps")
def available_apps():
    return render_template("available_apps.html")


if __name__ == '__main__':
    app.run(debug=True)
