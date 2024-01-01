import sqlite3
import datetime
from flask import session, jsonify, Blueprint, request
from blueprints_and_modules.blueprints.db.db import get_db_connection
from blueprints_and_modules.modules.socketio.socketio_instance import socketio
from blueprints_and_modules.modules.socketio.socketio_logics import new_report

reports_bp = Blueprint(
    "reports_bp", __name__, template_folder="../../templates")


@socketio.on('collect-report')
def collectReport(data):
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Insert new message
    cursor.execute("INSERT INTO reports (date, content, anonymous, user_id) VALUES (?, ?, ?, ?)",
                   (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), data["text"], data["check"], session["user_id"] if data["check"] == False else ""))

    conn.commit()
    conn.close()

    new_report()


@reports_bp.route('/fetchReportsData')
def fetchReportsData():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # get all reports
    reports = [{"id": report["id"], "date": report["date"], "content": report["content"], "anonymous": report["anonymous"],
                "user_id": report["user_id"]} for report in cursor.execute("SELECT * FROM reports").fetchall()]

    conn.close()

    return jsonify(reports)


@reports_bp.route("/delete_report", methods=["POST"])
def delete_report():
    try:
        report_to_delete = request.get_json()

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Delete from reports table
        cursor.execute(
            "DELETE FROM reports WHERE id = (?) ", (report_to_delete, ))

        conn.commit()
        conn.close()

        response = {"message": "Deleted successfully."}
        
        return jsonify(response), 200
    except Exception as e:
        response = {"message": f"Error deleting report. {e}"}

        return jsonify(response), 500
