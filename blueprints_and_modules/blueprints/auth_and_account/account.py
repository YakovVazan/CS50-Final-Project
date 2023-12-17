import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, session, render_template, request, jsonify
from blueprints_and_modules.blueprints.db.db import get_db_connection
from blueprints_and_modules.blueprints.auth_and_account.email_auth import email_authentication_logics

account_bp = Blueprint("account_bp", __name__, template_folder="../../templates")

@account_bp.route('/get_current_user_details')
def get_current_user_details():
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    rows = cursor.execute(
        "SELECT * FROM users WHERE id = ?", (session["user_id"], )).fetchall()
    user_dict = [dict(user) for user in rows]

    conn.commit()

    return user_dict[0]


@account_bp.route('/account_center')
def account_center():
    user_details = get_current_user_details()

    return render_template("account_center.html", details=user_details)


@account_bp.route('/update_personal_details', methods=["POST"])
def update_personal_details():
    old_details = get_current_user_details()
    new_details = request.get_json()

    if (check_password(old_details["hash"], new_details["oldPassword"])):
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if old_details["email_address"] != new_details["email"]:
            old_details["authenticated"] = 0

        if new_details["newPassword"]:
            new_hash = generate_password_hash(new_details["newPassword"])
            cursor.execute(
                "UPDATE users SET username = ?, email_address = ?, authenticated = ?, hash = ? WHERE id = ?",
                (new_details["name"], new_details["email"],
                    old_details["authenticated"], new_hash, session["user_id"])
            )
        else:
            cursor.execute(
                "UPDATE users SET username = ?, email_address = ?, authenticated = ? WHERE id = ?",
                (new_details["name"], new_details["email"],
                    old_details["authenticated"], session["user_id"])
            )
        conn.commit()
        conn.close()

        return jsonify({"message": "Details updated successfully!", "codeColor": "success"}), 200
    else:
        return jsonify({"message": "Wrong password.", "codeColor": "error"})
    

def check_password(hash, password):
    return check_password_hash(hash, password)


@account_bp.route('/update_password', methods=["POST"])
def update_password():
    email_address = request.get_json()

    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    email_addresses = [row[0] for row in cursor.execute(
        "SELECT email_address FROM users").fetchall()]

    if email_address in email_addresses:
        user_details = [dict(row) for row in cursor.execute(
            "SELECT * FROM users WHERE email_address = ?", (email_address, )).fetchall()][0]
        # Log user in, in flask's session
        session["user_id"] = user_details["id"]
        session["user_name"] = user_details["username"]

        email_authentication_logics(email_address)

        cursor.execute("UPDATE users SET email_address = ?, authenticated = ?, hash = ? WHERE id = ?",
                       (email_address, 1, generate_password_hash(str(session["one_time_code"])), session["user_id"]))

        conn.commit()
        conn.close()

        session.pop("one_time_code", None)

        return jsonify({'message': 'Your password was reseted successfully!.', "codeColor": "success"})
    else:
        conn.close()

        return jsonify({'message': 'An error occured while trying to reset your password.', "codeColor": "error"})