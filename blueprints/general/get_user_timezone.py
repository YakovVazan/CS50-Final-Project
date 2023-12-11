import sqlite3
from datetime import datetime, timedelta
from blueprints.db.db import get_db_connection
from flask import Blueprint, request, jsonify, session

timezone_bp = Blueprint("timezone_bp", __name__,
                        template_folder="../../templates")


@timezone_bp.route("/set_timezone", methods=['POST'])
def set_timezone():
    data = request.get_json()
    timezone_offset = data.get('timezoneOffset')

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("UPDATE users SET time_zone_offset = ? WHERE id = ?",
                   (timezone_offset, session["user_id"]))

    conn.commit()
    conn.close()

    return jsonify(timezone_offset)
