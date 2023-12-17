from blueprints_and_modules.modules.socketio.socketio_instance import socketio

connected_users = 0


@socketio.on('connect')
def handle_connect():
    global connected_users
    connected_users += 1
    socketio.emit('new_connection', connected_users)


@socketio.on('disconnect')
def handle_disconnect():
    global connected_users
    connected_users -= 1
    socketio.emit('new_connection', connected_users)


def new_account_added():
    socketio.emit('new_account')


def send_notification(message_data):
    data = {"message": message_data["message"],
            "codeColor": message_data["codeColor"]}
    socketio.emit('generate_toast', data)
