import sqlite3
from datetime import datetime, timedelta
from flask import Blueprint, request, session, jsonify
from blueprints_and_modules.blueprints.db.db import get_db_connection
from blueprints_and_modules.blueprints.auth_and_account.account import details_getter
from blueprints_and_modules.blueprints.auth_and_account.login_required_decoration import login_required

notifications_bp = Blueprint("notifications_bp", __name__, template_folder="../../templates")


@notifications_bp.route("/manage_notifications", methods=["GET", "POST"])
@login_required
def manage_notifications():
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
        utc_now = datetime.utcnow()
        user_time = utc_now - timedelta(minutes=details_getter(session["user_id"])["time_zone_offset"])
        
        data = request.get_json()
        action = data.get("action", "")
        codeColor = data.get("codeColor", "")
        content = data.get("content", "")
        id = data.get("id", "")

        if action == "CREATE":
            cursor.execute(
                "INSERT INTO notifications (codeColor, content, date, user_id) VALUES (?, ?, ?, ?)",
                (codeColor, content, user_time.strftime("%Y-%m-%d %H:%M:%S"), session["user_id"]))
        elif action == "DELETE":
            cursor.execute(
                "DELETE FROM notifications WHERE id = (?) AND user_id = ?", (id, session["user_id"]))

        conn.commit()
        conn.close()

        return jsonify({"message": f"{action} successful"})