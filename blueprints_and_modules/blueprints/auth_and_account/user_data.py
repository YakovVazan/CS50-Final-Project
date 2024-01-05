import sqlite3
from flask import Blueprint, session
from blueprints_and_modules.blueprints.db.db import get_db_connection

user_data_bp = Blueprint("user_data_bp", __name__,
                         template_folder="../../templates")


@user_data_bp.route('/account_center/<int:user_id>')
def get_user_data(user_id):
    if user_id == session["user_id"]:
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        posts = cursor.execute(
            "SELECT COUNT(*) FROM messages WHERE user_id = ?", (user_id,)).fetchall()
        user_posts = [dict(post) for post in posts]

        scheduled_posts = cursor.execute(
            "SELECT COUNT(*) FROM scheduled_posts WHERE user_id = ?", (user_id,)).fetchall()
        user_scheduled_posts = [dict(scheduled_post)
                                for scheduled_post in scheduled_posts]

        cursor.close()
        conn.close()

        return {"posts": user_posts, "scheduled_posts": user_scheduled_posts}
