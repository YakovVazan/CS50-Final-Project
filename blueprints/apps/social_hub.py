import sqlite3
import json
import requests
from data import socials
from socials.Telegram.secrets import token
from flask import Blueprint, request, session, render_template, redirect, url_for, jsonify
from blueprints.auth_and_account.login_required_decoration import login_required
from blueprints.db.db import get_db_connection

social_hub_bp = Blueprint("social_hub_bp", __name__, template_folder="../../templates")


@social_hub_bp.route("/available_apps", methods=["GET", "POST"])
@login_required
def available_apps():
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
            sorted_list = sorted(
                [s for s in socials if s["name"] not in owned_socials], key=lambda x: x['name'])

        # Show all available apps if none owned
        else:
            sorted_list = sorted(socials, key=lambda x: x['name'])

        return render_template("available_apps.html", socials=sorted_list)
    else:
        social_app_name = request.form.get("app-name")
        if social_app_name == "Telegram":
            return redirect(url_for("telegram_login"))
        elif social_app_name == "Twitter":
            return redirect(url_for("twitter_login_and_authorize"))
        elif social_app_name == "Facebook":
            return redirect(url_for("facebook_login"))
        else:
            return render_template("error.html", error_message=f"{social_app_name} is not available on SocialHub yet.", error_code=503)
        

@social_hub_bp.route("/has_social_accounts")
def has_social_accounts():
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    social_accounts = [dict(social_account) for social_account in cursor.execute(
        "SELECT * FROM socials WHERE user_id = ?", (session["user_id"],)).fetchall()]

    conn.close()

    return jsonify(len(social_accounts))


@social_hub_bp.route('/owned_apps')
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


@social_hub_bp.route("/my_apps")
@login_required
def my_apps():
    owned_socials = owned_apps()

    # Collect only already owned apps and sort by name
    sorted_list = sorted([
        s for os in owned_socials for s in socials if s["name"] == os["name"]], key=lambda x: x['name'])

    return render_template("my_apps.html", socials=sorted_list)


@social_hub_bp.route("/apps_logout", methods=["POST"])
@login_required
def apps_logout():
    social_app_name = request.get_json()

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Special telegram logout
    if social_app_name == "Telegram":
        channel_id = json.loads([dict(social_details) for social_details in cursor.execute(
            "SELECT social_id FROM socials WHERE name = ? AND user_id = ?", (social_app_name, session["user_id"])).fetchall()][0]["social_id"])["channel_id"]

        # Send request to leave Telegram channel
        print(requests.post(
            f'https://api.telegram.org/bot{token}/leaveChat?chat_id={channel_id}').status_code)

    # Default apps deletion from db
    cursor.execute(
        "DELETE FROM socials WHERE name = ? AND user_id = ?", (social_app_name, session["user_id"]))

    conn.commit()
    conn.close()

    # Didn't work, reloading from JS
    return ""