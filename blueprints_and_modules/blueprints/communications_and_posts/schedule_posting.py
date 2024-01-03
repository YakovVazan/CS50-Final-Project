import json
import sqlite3
from datetime import datetime, timedelta
from flask import Blueprint, session, request, jsonify, render_template
from blueprints_and_modules.blueprints.db.db import get_db_connection
from blueprints_and_modules.blueprints.auth_and_account.account import details_getter
from blueprints_and_modules.blueprints.communications_and_posts.communications import get_social_names
from blueprints_and_modules.blueprints.communications_and_posts.posts import monitor_interface_with_socials
from blueprints_and_modules.blueprints.auth_and_account.login_required_decoration import login_required

schedule_posting = Blueprint(
    "schedule_posting", __name__, template_folder="../../templates")

@schedule_posting.route("/schedule_post", methods=["POST"])
def schedule_post():
    try:
        utc_now = datetime.utcnow()
        user_time = utc_now - timedelta(minutes=details_getter(session["user_id"])["time_zone_offset"])

        new_schedule_post = request.get_json()

        social_names = json.dumps(
            [name for social in get_social_names() for name in social.values()])

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute('''INSERT INTO scheduled_posts (content, scheduling_date, execution_date, social_platforms, user_id) VALUES (?, ?, ?, ?, ?)
        ''', (new_schedule_post["content"], user_time.strftime("%Y-%m-%d %H:%M:%S"), new_schedule_post["date"], social_names, session["user_id"]))

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {new_schedule_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": f"Error scheduling post: {e}"}
        return jsonify(response), 500


@schedule_posting.route("/edit_scheduled_post", methods=["POST"])
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


@schedule_posting.route("/scheduled_posts")
@login_required
def scheduled_posts():
    return render_template("scheduled_posts.html", posts=display_scheduled_posts())


@schedule_posting.route("/get_scheduled_posts")
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


@schedule_posting.route("/delete_scheduled_posts", methods=["POST"])
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
            cursor.execute("INSERT INTO messages (content, date, is_scheduled, schedule_date, social_platforms, user_id) VALUES (?, ?, ?, ?, ?, ?)",
                           (scheduled_post["content"], scheduled_post["execution_date"], True, scheduled_post["scheduling_date"], scheduled_post["social_platforms"], session["user_id"]))

            monitor_interface_with_socials(scheduled_post["content"])

        conn.commit()
        conn.close()

        response = {"message": f"Processed data: {scheduled_post}"}
        return jsonify(response), 200
    except Exception as e:
        response = {"message": f"Error deleting scheduled post. {e}"}
        print(response)
        return jsonify(response), 500