from flask import session
from blueprints_and_modules.modules.socketio.socketio_instance import socketio

connected_users = 0
connected_users_ids = []


@socketio.on('connect')
def handle_connect():
    global connected_users_ids
    
    if session and session["user_id"] not in connected_users_ids:
        connected_users_ids.append(session["user_id"])
        update_connections_chart()
    elif session and session["app_owner"]:
        update_connections_chart()


def update_connections_chart():
    socketio.emit('new_connection', len(connected_users_ids))


def new_account_added():
    socketio.emit('new_account')


def send_notification(message_data):
    data = {"message": message_data["message"],
            "codeColor": message_data["codeColor"]}
    socketio.emit('generate_toast', data)
