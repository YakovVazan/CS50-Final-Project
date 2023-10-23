import sqlite3
from flask_session import Session
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from data import socials
from datetime import datetime
import requests
import json
from requests_oauthlib import OAuth1Session
from socials.Telegram.secrets import token
from socials.X.secrets import keys_and_tokens

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

        response = {"error": f"Processed data: {new_post['data']}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"error": f"Error processing data: {e}"}
        return jsonify(response), 500


def post(new_post):
    current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    social_names = json.dumps(
        [name for social in get_social_names() for name in social.values()])

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Insert new message
    cursor.execute("INSERT INTO messages (content, date, is_scheduled, social_platforms, user_id) VALUES (?, ?, ?, ?, ?)",
                   (new_post, current_datetime, False, social_names, session["user_id"]))

    monitor_interface_with_socials(new_post)

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

        social_names = json.dumps(
            [name for social in get_social_names() for name in social.values()])

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''INSERT INTO scheduled_posts (content, scheduling_date, execution_date, social_platforms, user_id) VALUES (?, ?, ?, ?, ?)
        ''', (new_schedule_post["content"], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), new_schedule_post["date"], social_names, session["user_id"]))

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {new_schedule_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": f"Error scheduling post: {e}"}
        return jsonify(response), 500


@app.route("/edit_scheduled_post", methods=["POST"])
def edit_scheduled_post():
    try:
        edited_post = request.get_json()

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''UPDATE scheduled_posts SET content = ?, execution_date = ? WHERE id = ?
        ''', (edited_post["content"], edited_post["date"], edited_post["postId"]))

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {edited_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": f"Error editing post: {e}"}
        print(response)
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
            cursor.execute("INSERT INTO messages (content, date, is_scheduled, schedule_date, social_platforms, user_id) VALUES (?, ?, ?, ?, ?)",
                           (scheduled_post["content"], scheduled_post["execution_date"], True, scheduled_post["scheduling_date"], scheduled_post["social_platforms"], session["user_id"]))

            monitor_interface_with_socials(scheduled_post["content"])

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {scheduled_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": f"Error scheduling post. {e}"}
        return jsonify(response), 500


def get_social_names():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get list on names
    all_socials = [dict(social) for social in cursor.execute(
        "SELECT name FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()]

    conn.close()

    return all_socials


@app.route('/apps_data')
def apps_data():
    return socials


@app.route("/available_apps", methods=["GET", "POST"])
def available_apps():
    if session:
        if request.method == "GET":
            # Get database
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Collect cureent user's apps
            owned_socials = set(os["name"] for os in [dict(social_details) for social_details in cursor.execute(
                "SELECT * FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()])

            conn.close()

            # Sort by name
            if len(owned_socials) > 0:
                # Filter socials omitting duplicates
                sorted_list = sorted([s for s in socials if s["name"] not in owned_socials], key=lambda x: x['name'])

            # Show all available apps if none owned
            else:
                sorted_list = sorted(socials, key=lambda x: x['name'])

            return render_template("available_apps.html", socials=sorted_list)
        else:
            app_name = request.form.get("app-name")
            if app_name == "Telegram":
                return redirect(url_for("telegram_login"))
            elif app_name == "Twitter":
                return redirect(url_for("twitter_login_and_authorize"))
            else:
                return render_template("error.html", error_message=f"{app_name} is not available on SocialHub yet.", error_code=503)
    else:
        return redirect("/")


@app.route("/has_social_accounts")
def has_social_accounts():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    social_accounts = [dict(social_account) for social_account in cursor.execute(
        "SELECT * FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()]

    conn.close()

    return jsonify(len(social_accounts))


@app.route('/owned_apps')
def owned_apps():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Collect cureent user's apps
    owned_socials = [dict(social_details) for social_details in cursor.execute(
        "SELECT * FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()]

    conn.close()

    return owned_socials


@app.route("/my_apps")
def my_apps():
    if session:
        owned_socials = owned_apps()

        # Collect only already owned apps and sort by name
        sorted_list = sorted([
            s for os in owned_socials for s in socials if s["name"] == os["name"]], key=lambda x: x['name'])

        return render_template("my_apps.html", socials=sorted_list)
    else:
        return redirect("/")


@app.route("/available_apps/telegram", methods=["GET", "POST"])
def telegram_login():
    if session:
        if request.method == "GET":
            for social in socials:
                if social["name"] == "Telegram":
                    social_details = social
                    break

            return render_template("login_telegram.html", social_details=social_details)
        else:
            # Collect channel name
            channel_name = request.form.get("chat_name")

            response = requests.get(
                f"https://api.telegram.org/bot{token}/getUpdates")

            # Parse JSON string into a dictionary
            dict_response = json.loads(response.text)

            channel_id = find_id_by_name(dict_response, channel_name)

            # Get database
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            social_id = {"channel_id": f"{channel_id}"}

            # Insert new social to socials table
            cursor.execute(
                "INSERT INTO socials (social_id, name, user_id) VALUES (?, ?, ?) ", (json.dumps(social_id), "Telegram", session["user_id"]))

            conn.commit()
            conn.close()
            return redirect("/")
    else:
        return redirect("/")

# Grab channel' ID from the bot's data by its name recursively
def find_id_by_name(json_data, channel_name):
    if isinstance(json_data, dict):
        for key, value in json_data.items():
            if key == 'title' and value == channel_name:
                if 'id' in json_data:
                    return json_data['id']
            else:
                result = find_id_by_name(value, channel_name)
                if result is not None:
                    return result


@app.route("/available_apps/twitter", methods=["GET", "POST"])
def twitter_login_and_authorize():
    consumer_key = keys_and_tokens["API Key"]
    consumer_secret = keys_and_tokens["API Key Secret"]

    if request.method == "GET":
        # Get twitter visuals
        if request.method == "GET":
            for social in socials:
                if social["name"] == "Twitter":
                    social_details = social
                    break

        # Get aouth token
        request_token_url = "https://api.twitter.com/oauth/request_token?oauth_callback=oob&x_auth_access_type=write"
        oauth = OAuth1Session(consumer_key, client_secret=consumer_secret)

        fetch_response = oauth.fetch_request_token(request_token_url)
        oauth_token = fetch_response.get("oauth_token")

        # Store aouth token in flask's session temporarily
        session["oauth_token"] = oauth_token

        return render_template("login_twitter.html", url=f"https://api.twitter.com/oauth/authorize?oauth_token={session['oauth_token']}", social_details=social_details)
    else:
        verifier = request.form.get("pin")
        access_token_url = "https://api.twitter.com/oauth/access_token"
        oauth = OAuth1Session(
            consumer_key,
            client_secret=consumer_secret,
            resource_owner_key=session["oauth_token"],
            verifier=verifier,
        )
        oauth_tokens = oauth.fetch_access_token(access_token_url)

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        tokens = {"access_token": oauth_tokens["oauth_token"],
                  "access_token_secret":  oauth_tokens["oauth_token_secret"],
                  "oauth_token": session["oauth_token"]}

        # Insert new social into socials table
        cursor.execute(
            "INSERT INTO socials (social_id, name, user_id) VALUES (?, ?, ?) ", (json.dumps(tokens), "Twitter", session["user_id"]))

        conn.commit()
        conn.close()

        # Delete aouth token from flask's session after verification completed
        del session["oauth_token"]

        return redirect("/")


def monitor_interface_with_socials(content):
    try:
        # Get names of owned apps
        social_names = json.dumps(
            [name for social in get_social_names() for name in social.values()])

        # Call social media APIs
        if "Telegram" in social_names:
            # Get database
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            # Get channel's id
            channel_id = json.loads([dict(social_details) for social_details in cursor.execute(
                "SELECT * FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()][0]["social_id"])["channel_id"]
            conn.close()

            send_to_telegram_channel(channel_id, content)
        if "Twitter" in social_names:
            send_to_twitter(content)

    except:
        print("Not logged into any social account yet.")


def send_to_telegram_channel(chat_id, message):
    if chat_id and message:
        url = f'https://api.telegram.org/bot{token}/sendMessage'

        data = {
            'chat_id': chat_id,
            'text': message,
        }

        response = requests.post(url, json=data)
        response_data = response.json()

        return response_data.get('ok')
    else:
        return False


def send_to_twitter(content):
    consumer_key = keys_and_tokens["API Key"]
    consumer_secret = keys_and_tokens["API Key Secret"]

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    tokens = json.loads([dict(token) for token in cursor.execute("SELECT social_id FROM socials WHERE user_id = ? AND name = ?",
                        (session["user_id"], "Twitter")).fetchall()][0]["social_id"])

    conn.close()

    # Create an authenticated session with the access token
    oauth = OAuth1Session(
        consumer_key,
        client_secret=consumer_secret,
        resource_owner_key=tokens["access_token"],
        resource_owner_secret=tokens["access_token_secret"],
    )

    # Make the request to post the tweet
    response = oauth.post(
        "https://api.twitter.com/2/tweets",
        json={"text": content},
    )

    # Check the response status
    if response.status_code != 201:
        raise Exception("Request returned an error: {} {}".format(
            response.status_code, response.text))


@app.route("/apps_logout", methods=["POST"])
def apps_logout():
    if session:
        app_name = request.get_json()

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Special telegram logout
        if app_name == "Telegram":
            channel_id = json.loads([dict(social_details) for social_details in cursor.execute(
                "SELECT social_id FROM socials WHERE name = ? AND user_id = ?", (app_name, session["user_id"])).fetchall()][0]["social_id"])["channel_id"]

            # Send request to leave Telegram channel
            print(requests.post(
                f'https://api.telegram.org/bot{token}/leaveChat?chat_id={channel_id}').status_code)

        # Default apps deletion from db 
        cursor.execute(
                "DELETE FROM socials WHERE name = ? AND user_id = ?", (app_name, session["user_id"]))

        conn.commit()
        conn.close()

        # Didn't work, reloading from JS
        return ""
    else:
        return redirect("/")


@app.route("/manage_notifications", methods=["GET", "POST"])
def manage_notifications():
    if session:
        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if request.method == "GET":
            notifications_list = cursor.execute(
                "SELECT * FROM notifications WHERE user_id = ?", (session["user_id"],))
            full_notifications = [{"id": notification["id"], "content": notification["content"],
                                   "date": notification["date"], "user_id": notification["user_id"], "codeColor": notification["codeColor"]} for notification in notifications_list]
            return jsonify(full_notifications)
        else:
            data = request.get_json()
            action = data.get("action", "")
            codeColor = data.get("codeColor", "")
            content = data.get("content", "")
            id = data.get("id", "")

            if action == "CREATE":
                cursor.execute(
                    "INSERT INTO notifications (codeColor, content, date, user_id) VALUES (?, ?, ?, ?)",
                    (codeColor, content, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), session["user_id"]))
            elif action == "DELETE":
                cursor.execute(
                    "DELETE FROM notifications WHERE id = (?) AND user_id = ?", (id, session["user_id"]))

            conn.commit()
            conn.close()

            return jsonify({"message": f"{action} successful"})

    else:
        return redirect("/")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
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
                "DELETE FROM users WHERE id = ?", (session["user_id"],))
            cursor.execute(
                "DELETE FROM messages WHERE user_id = ?", (session["user_id"],))
            cursor.execute(
                "DELETE FROM scheduled_posts WHERE user_id = ?", (session["user_id"],))
            cursor.execute(
                "DELETE FROM notifications WHERE user_id = ?", (session["user_id"],))
            cursor.execute(
                "DELETE FROM socials WHERE user_id = ?", (session["user_id"],))

            conn.commit()
            conn.close()

            return render_template("register.html")
    else:
        return redirect("/")


init_db()


if __name__ == '__main__':
    app.run(debug=True)
