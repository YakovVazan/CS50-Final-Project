import datetime
from flask import session
from blueprints_and_modules.modules.socketio.socketio_instance import socketio

connected_users_ids = []


@socketio.on('connect')
def handle_connect():
    global connected_users_ids

    if session and session["user_id"] not in [user["id"] for user in connected_users_ids]:
        connected_users_ids.append(
            {"id": session["user_id"], "last_time_seen": datetime.datetime.now().minute, "connected": True})

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
    socketio.emit('new_connection', {
                  "connected_users_ids": connected_users_ids, "connected_users": len(connected_users_ids)})


def new_account_added():
    socketio.emit('new_account')


def send_notification(message_data):
    data = {"message": message_data["message"],
            "codeColor": message_data["codeColor"]}
    socketio.emit('generate_toast', data)
