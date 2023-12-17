import sqlite3
from flask import Blueprint, jsonify, session, request
from blueprints_and_modules.modules.apps_data.data import socials

communications_bp = Blueprint(
    "communications_bp", __name__, template_folder="../../templates")


@communications_bp.route('/apps_data')
def apps_data():
    return socials


@communications_bp.route("/get_data")
def get_data():
    data = display_history()
    return jsonify(data)



@communications_bp.route("/process_data", methods=["POST"])
def process_data():
    from blueprints_and_modules.blueprints.communications_and_posts.posts import post
    
    try:
        new_post = request.get_json()

        post(new_post['data'])

        response = {"message": f"Processed data: {new_post['data']}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"error": f"Error processing data: {e}"}
        return jsonify(response), 500


def display_history():
    from blueprints_and_modules.blueprints.db.db import get_db_connection

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


def get_social_names():
    from blueprints_and_modules.blueprints.db.db import get_db_connection

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get list on names
    all_socials = [dict(social) for social in cursor.execute(
        "SELECT name FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()]

    conn.close()

    return all_socials
