import datetime
from flask import session, request
from blueprints_and_modules.modules.socketio.socketio_instance import socketio
from blueprints_and_modules.blueprints.auth_and_account.account import details_getter
from blueprints_and_modules.blueprints.auth_and_account.email_auth import email_authentication_logics
from blueprints_and_modules.blueprints.auth_and_account.account import account_deleter

connected_users_ids = []


@socketio.on('connect')
def handle_connect():
    global connected_users_ids

    if session and session["user_id"] not in [user["id"] for user in connected_users_ids]:
        connected_users_ids.append(
            {"id": session["user_id"], "sid": request.sid, "last_time_seen": datetime.datetime.now().minute, "connected": True})

        update_connections_chart()
    elif session and session["app_owner"]:
        update_connections_chart()


@socketio.on('tab_visibility')
def handle_tab_visibility(is_visible):
    # set last seen time to track at the end of the minute
    if not is_visible:
        for user in connected_users_ids:
            if session and user["id"] == session["user_id"]:
                user["connected"] = False
                user["last_time_seen"] = datetime.datetime.now().minute
                break
    # keep track of currently connected users
    else:
        # update charts if user returned in the middle of a minute
        if session and session["user_id"] not in [user["id"] for user in connected_users_ids]:
            connected_users_ids.append(
                {"id": session["user_id"], "last_time_seen": datetime.datetime.now().minute, "connected": True})
            update_connections_chart()
        # update last seen value for returning user
        else:
            for user in connected_users_ids:
                if session and user["id"] == session["user_id"]:
                    user["connected"] = True
                    user["last_time_seen"] = datetime.datetime.now().minute
                    break


def update_connections_chart():
    socketio.emit('new_connection', {"connected_users": connected_users_ids})


def send_toast(data, room=None):
    socketio.emit('generate_toast', data, room=room)


def send_notification(data):
    socketio.emit('generate_notification', data)


def new_report():
    socketio.emit('new-report')


@socketio.on('dmUser')
def dmUser(id):
    sid = get_user_sid(id)
    if sid:
        message_data = {"message": "Admin is dming you.",
                        "codeColor": "#0dcaf0"}
        send_toast(message_data, room=sid)
    send_notification(message_data)


@socketio.on('banUser')
def banUser(data):
    email_address = details_getter(data["id"])["email_address"]
    message_data = {
        "message": "You've been banned from using our platform.", "codeColor": "#0dcaf0"}
    email_authentication_logics(
        email_address, "SocialHub ban", message_data["message"])

    account_deleter(data["id"])
    


def get_user_sid(id):
    for user in connected_users_ids:
        if user['id'] == id:
            return user['sid']
    return None


def reload_page(id):
    sid = get_user_sid(id)
    
    if sid:
        socketio.emit('reload_page', room=sid)
