import sqlite3
from flask import Blueprint, session, render_template, redirect, jsonify
from blueprints_and_modules.blueprints.db.db import get_db_connection
from blueprints_and_modules.blueprints.auth_and_account.login_required_decoration import login_required


dashboard_and_data_bp = Blueprint(
    "dashboard_and_data_bp", __name__, template_folder="../../templates")


@dashboard_and_data_bp.route("/dashboard")
@login_required
def dashboard():
    if session["app_owner"]:
        return render_template("dashboard.html")
    else:
        return redirect("/login")


@dashboard_and_data_bp.route('/app_database')
def app_database():
    data = {}

    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    data["users"] = [dict(user)
                     for user in cursor.execute("SELECT * FROM users").fetchall()]
    data["posts"] = [dict(post) for post in cursor.execute(
        "SELECT * FROM messages").fetchall()]
    data["scheduled_posts"] = [dict(scheduled_post) for scheduled_post in cursor.execute(
        "SELECT * FROM scheduled_posts").fetchall()]
    data["linked_accounts"] = [dict(linked_account) for linked_account in cursor.execute(
        "SELECT * FROM socials").fetchall()]

    conn.close()

    return jsonify(data)
