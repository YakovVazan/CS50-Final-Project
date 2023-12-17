import sqlite3
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Blueprint, request, render_template, session, redirect
from blueprints_and_modules.blueprints.db.db import get_db_connection
from socials.Email.secrets import social_hub_email_details
from socials.Email.secrets import email_visuals

email_auth_bp = Blueprint(
    "email_auth_bp", __name__, template_folder="../../templates")


@email_auth_bp.route("/email_authentication", methods=["GET", "POST"])
def email_authentication():
    from blueprints.auth_and_account.account import get_current_user_details
    
    recipient = get_current_user_details()["email_address"]

    if request.method == "GET":
        email_authentication_logics(recipient)

        return render_template("login_email.html", email_visuals=email_visuals)
    else:
        given_code = int(request.form.get("email_auth_code"))

        if given_code == session["one_time_code"]:
            session.pop("one_time_code", None)

            # Get database
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET authenticated = ? WHERE id = ? ", (1, session["user_id"]))
            conn.commit()
            conn.close()

            return redirect("/")
        else:
            return render_template("error.html", error_message="Wrong code.", error_code=400)


def email_authentication_logics(recipient):
    session["one_time_code"] = secrets.randbelow(1000000)

    smtp_server = 'smtp.gmail.com'
    smtp_port = 587
    smtp_username = social_hub_email_details["email_address"]
    smtp_password = social_hub_email_details["email_password"]

    smtp_connection = smtplib.SMTP(smtp_server, smtp_port)
    smtp_connection.starttls()
    smtp_connection.login(smtp_username, smtp_password)

    msg = MIMEMultipart()
    msg['From'] = smtp_username
    msg['To'] = recipient
    msg['Subject'] = 'SocialHub authentication'

    body = f"Authenticate your Email account.\nCopy the code presented below and paste it in SocialHub site.\n{session['one_time_code']}"
    msg.attach(MIMEText(body, 'plain'))

    smtp_connection.sendmail(smtp_username, recipient, msg.as_string())

    smtp_connection.quit()
