import sqlite3
from blueprints_and_modules.blueprints.db.db import get_db_connection
from config import SOCIALHUB_APP_OWNER_EMAIL, SOCIALHUB_VERSION_NUMBERING
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, render_template, request, redirect, url_for, session
from blueprints_and_modules.blueprints.auth_and_account.login_required_decoration import login_required
from blueprints_and_modules.modules.socketio.socketio_logics import connected_users_ids, update_connections_chart

auth_bp = Blueprint("auth_bp", __name__, template_folder="../../templates")


@auth_bp.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        inputed_name = request.form.get("username")
        inputed_email = request.form.get("email_address")
        inputed_password = request.form.get("password")
        inputed_confirmation = request.form.get("confirmation")

        if not inputed_name or not inputed_password or not inputed_confirmation or not inputed_email:
            return render_template("error.html", error_message="All Fields are Required", error_code=400)

        hashed_password = generate_password_hash(inputed_password)

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Prevent redundancy
        rows = cursor.execute(
            "SELECT * FROM users WHERE username = ?", (inputed_name, )).fetchall()
        user_dicts = [dict(user) for user in rows]
        for user in user_dicts:
            if inputed_name == user["username"]:
                conn.close()

                return render_template("error.html", error_message="Username already exists.", error_code=400)
            elif inputed_email == user["email_address"]:
                conn.close()

                return render_template("error.html", error_message="Email is already in use by another user.", error_code=400)

        cursor.execute("INSERT INTO users (username, email_address, authenticated, hash) VALUES (?, ?, ?, ?)",
                       (inputed_name, inputed_email, False, hashed_password))
        conn.commit()
        conn.close()

        update_connections_chart()

        return redirect(url_for("auth_bp.login"))
    else:
        return render_template("register.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    # Forget any user_id
    session.clear()

    if request.method == "POST":
        inputed_name = request.form.get("username")
        inputed_password = request.form.get("password")

        # Confirm all fields are filled
        if not inputed_name or not inputed_password:
            return render_template("error.html", error_message="All Fields are Required", error_code=400)

        # Get database
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        rows = cursor.execute(
            "SELECT * FROM users WHERE username = ?", (inputed_name, )).fetchall()
        user_dict = [dict(user) for user in rows]

        # Ensure username exists and password is correct
        if len(user_dict) != 1 or not check_password_hash(
            rows[0]["hash"], inputed_password
        ):
            return render_template("error.html", error_message="invalid username and/or password", error_code=403)

        # Store user details in flask's session
        session["user_id"] = rows[0]["id"]
        session["user_name"] = rows[0]["username"]
        session["app_owner"] = True if user_dict[0]["email_address"] == SOCIALHUB_APP_OWNER_EMAIL else False
        session["version_numbering"] = SOCIALHUB_VERSION_NUMBERING

        conn.commit()

        return redirect("/")
    else:
        return render_template("login.html")


@auth_bp.route("/logout")
@login_required
def logout():
    handleLogout(session["user_id"])

    # Redirect user to login form
    return redirect("/")


def handleLogout(id):
    # Forget any user_id
    session.clear()

    # Control charts
    global connected_users_ids

    # remove and update charts when a user logs out
    connected_users_ids.remove(
        [user for user in connected_users_ids if user["id"] == id][0])

    update_connections_chart()
