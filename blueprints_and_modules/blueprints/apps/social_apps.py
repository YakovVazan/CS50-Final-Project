import json
import sqlite3
import requests
from requests_oauthlib import OAuth1Session
from config import TELEGRAM_TOKEN, X_API_KEY, X_KEY_SECRET
from blueprints_and_modules.modules.apps_data.data import socials
from blueprints_and_modules.blueprints.db.db import get_db_connection
from flask import Blueprint, request, render_template, session, redirect
from blueprints_and_modules.blueprints.auth_and_account.login_required_decoration import login_required

social_apps_bp = Blueprint("social_apps_bp", __name__,
                           template_folder="../../../templates")


@social_apps_bp.route("/available_apps/telegram", methods=["GET", "POST"])
@login_required
def telegram_login():
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
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/getUpdates")

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


def find_id_by_name(json_data, channel_name):
    # Grab channel' ID from the bot's data by its name recursively
    if isinstance(json_data, dict):
        if 'title' in json_data and json_data['title'] == channel_name:
            return json_data.get('id')
        for value in json_data.values():
            result = find_id_by_name(value, channel_name)
            if result is not None:
                return result
    elif isinstance(json_data, list):
        for item in json_data:
            result = find_id_by_name(item, channel_name)
            if result is not None:
                return result


@social_apps_bp.route("/available_apps/twitter", methods=["GET", "POST"])
@login_required
def twitter_login_and_authorize():
    consumer_key = X_API_KEY
    consumer_secret = X_KEY_SECRET

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


@social_apps_bp.route("/available_apps/facebook", methods=["GET", "POST"])
@login_required
def facebook_login():
    if request.method == "GET":
        # Get facebook visuals
        for social in socials:
            if social["name"] == "Facebook":
                social_details = social
                break

        return render_template("login_facebook.html", social_details=social_details)
    else:
        user_access_token = request.form.get("user_access_token")
        page_id = request.form.get("page_id")

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        social_id = {
            "user_access_token": f"{user_access_token}", "page_id": f"{page_id}"}

        # Insert new social to socials table
        cursor.execute(
            "INSERT INTO socials (social_id, name, user_id) VALUES (?, ?, ?) ", (json.dumps(social_id), "Facebook", session["user_id"]))

        conn.commit()
        conn.close()
