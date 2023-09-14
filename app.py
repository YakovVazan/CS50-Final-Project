import sqlite3
from flask_session import Session
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from data import socials
from datetime import datetime

# Configure flask app
app = Flask(__name__)

# Configure SQL db
db_path = "social_hub.db"

# Configure session
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


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
            user_id INTEGER REFERENCES users(id),
            social_id INTEGER REFERENCES social_media(id)
        )
    """)
    # Create scheduled_posts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scheduled_posts (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            scheduling_date DATE NOT NULL,
            execution_date DATE NOT NULL,
            user_id INTEGER REFERENCES users(id),
            social_id INTEGER REFERENCES social_media(id)
        )
    """)
    conn.commit()
    conn.close()


init_db()


@app.route("/")
def index():
    if session:
        return render_template("index.html", username=session["user_name"])
    else:
        return redirect("/login")


@app.route("/get_data")
def get_data():
    data = display_history()
    return jsonify(data)


@app.route("/process_data", methods=["POST"])
def process_data():
    try:
        new_post = request.get_json()

        post(new_post['data'])

        response = {"message": f"Processed data: {new_post['data']}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": "Error processing data"}
        return jsonify(response), 500


def post(new_post):
    # Call social media APIs right here

    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Insert new message
    cursor.execute("INSERT INTO messages (content, date, user_id, is_scheduled) VALUES (?, ?, ?, ?)",
                   (new_post, current_datetime, session["user_id"], False))
    conn.commit()
    conn.close()


def display_history():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    messages = cursor.execute(
        "SELECT * FROM messages WHERE user_id = ?", (session["user_id"],)).fetchall()

    full_messages = [{"id": message["id"], "content": message["content"], "date": message["date"].split(
        ' ')[0].split(' ')[0][5:], "time": message["date"].split(' ')[1].rsplit(':', 1)[0], "is_scheduled": message["is_scheduled"], "schedule_date": message["schedule_date"]} for message in messages]

    # Format time stamp properly
    for item in full_messages:
        if item["time"][0] == '0' and item["time"][1] != '0':
            item["time"] = item["time"][1:]

    conn.close()

    return full_messages


@app.route("/schedule_post", methods=["POST"])
def schedule_post():
    try:
        new_schedule_post = request.get_json()

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''INSERT INTO scheduled_posts (content, scheduling_date, execution_date, user_id) VALUES (?, ?, ?, ?)
        ''', (new_schedule_post["content"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), new_schedule_post["date"], session["user_id"]))

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {new_schedule_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": "Error scheduling post."}
        return jsonify(response), 500


@app.route("/scheduled_posts")
def scheduled_posts():
    return render_template("scheduled_posts.html", posts=display_scheduled_posts())


@app.route("/get_scheduled_posts")
def get_scheduled_posts():
    data = display_scheduled_posts()
    return jsonify(data)


def display_scheduled_posts():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    schedule_posts_details = cursor.execute(
        "SELECT * FROM scheduled_posts WHERE user_id = ?", (session["user_id"], )).fetchall()

    user_scheduled_posts = [dict(single_post)
                            for single_post in schedule_posts_details]

    conn.close()

    return user_scheduled_posts


@app.route("/delete_scheduled_posts", methods=["POST"])
def delete_scheduled_posts():
    try:
        post_to_delete = request.get_json()

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Get full body of deleting-scheduled-post
        scheduled_post = [dict(post) for post in cursor.execute(
            "SELECT * FROM scheduled_posts WHERE id = (?) ", (post_to_delete["postId"], )).fetchall()][0]

        # Delete from scheduled_posts table
        cursor.execute(
            "DELETE FROM scheduled_posts WHERE id = (?) ", (post_to_delete["postId"], ))

        if post_to_delete["isScheduleTime"]:
            # Insert into messages table
            cursor.execute("INSERT INTO messages (content, date, is_scheduled, schedule_date, user_id) VALUES (?, ?, ?, ?, ?)",
                           (scheduled_post["content"], scheduled_post["execution_date"], True, scheduled_post["scheduling_date"], session["user_id"]))

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {scheduled_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": "Error scheduling post."}
        return jsonify(response), 500


@app.route("/notifications")
def notifications():
    return render_template("error.html", error_message="Notifications page is currently under constructions.", error_code=400)


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
    # Forget any user_id
    session.clear()

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

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]
        session["user_name"] = rows[0]["username"]

        return redirect("/")

    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/my_apps")
def my_apps():
    if session:
        return render_template("my_apps.html")
    else:
        return redirect("/")


@app.route("/available_apps", methods=["GET", "POST"])
def available_apps():
    if session:
        if request.method == "GET":
            sorted_list = sorted(socials, key=lambda x: x['name'])
            return render_template("available_apps.html", socials=sorted_list)
        else:
            app_name = request.form.get("app-name")
            return render_template("error.html", error_message=f"{app_name} is not available on SocialHub yet.", error_code=503)
    else:
        return redirect("/")


@app.route("/delete_account", methods=["GET", "POST"])
def delete_account():
    if session:
        if request.method == "GET":
            return render_template("delete_account.html")
        else:
            # Get database
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Delete every trace
            cursor.execute(
                "DELETE FROM scheduled_posts WHERE user_id = ?", (session["user_id"],))
            cursor.execute(
                "DELETE FROM messages WHERE user_id = ?", (session["user_id"],))
            cursor.execute(
                "DELETE FROM users WHERE id = ?", (session["user_id"],))

            conn.commit()
            conn.close()

            return render_template("register.html")
    else:
        return redirect("/")


if __name__ == '__main__':
    app.run(debug=True, port=8)
