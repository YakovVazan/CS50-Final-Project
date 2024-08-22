import json
import sqlite3
import requests
import facebook
from datetime import datetime, timedelta
from requests_oauthlib import OAuth1Session
from flask import Blueprint, session, redirect, url_for
from config import TELEGRAM_TOKEN, X_API_KEY, X_KEY_SECRET
from blueprints_and_modules.blueprints.db.db import get_db_connection
from blueprints_and_modules.modules.socketio.socketio_logics import send_toast
from blueprints_and_modules.blueprints.auth_and_account.account import details_getter
from blueprints_and_modules.blueprints.communications_and_posts.communications import get_social_names

posts_bp = Blueprint(
    "posts_bp", __name__, template_folder="../../templates")


def post(new_post):
    utc_now = datetime.utcnow()
    user_time = utc_now - timedelta(minutes=details_getter(session["user_id"])["time_zone_offset"])
    
    current_datetime = user_time.strftime("%Y-%m-%d %H:%M:%S")

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
                "SELECT * FROM socials WHERE user_id = ? AND name = ?", (session["user_id"], "Telegram")).fetchall()][0]["social_id"])["channel_id"]
            conn.close()

            send_to_telegram_channel(channel_id, content)
        if "Twitter" in social_names:
            send_to_twitter(content)
        if "Facebook" in social_names:
            send_to_facebook_page(content)

    except:
        print("Not logged into any social account yet.")


def send_to_telegram_channel(chat_id, message):
    if chat_id and message:
        url = f'https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage'

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
    consumer_key = X_API_KEY
    consumer_secret = X_KEY_SECRET

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


def send_to_facebook_page(content):
    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    user_details = json.loads([dict(token) for token in cursor.execute("SELECT social_id FROM socials WHERE user_id = ? AND name = ?",
                                                                       (session["user_id"], "Facebook")).fetchall()][0]["social_id"])

    conn.close()

    try:
        graph = facebook.GraphAPI(user_details["user_access_token"])
        pages_info = graph.get_object("/me/accounts")

        for page in pages_info['data']:
            # allow user to choose to which page to post
            if page['id'] == user_details["page_id"]:
                post_to_fb_page(user_details["page_id"],
                                page['access_token'], content)
                break
    except Exception as e:
        data = {"message": f"{e}", "codeColor": "#dc3545"}
        send_toast(data)
        
        return redirect(url_for("facebook_login"))


def post_to_fb_page(page_id, access_token, content):
    data = {
        'message': f"{content}",
        # You can include other parameters like 'link', 'picture', 'caption', etc.
    }

    api_endpoint = f'https://graph.facebook.com/v18.0/{page_id}/feed'

    params = {
        'access_token': access_token,
    }

    requests.post(api_endpoint, data=data, params=params)