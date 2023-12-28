from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from blueprints_and_modules.modules.socketio.socketio_logics import update_connections_chart, connected_users_ids


def scheduled_job():
    changes_flag = False
    
    # remove users that their last app usage was in the previous minute
    for user in connected_users_ids:
        if user["id"] != 1 and user["last_time_seen"] < datetime.now().minute and not user["connected"]:
            connected_users_ids.remove(user)
            changes_flag = True
            
    if changes_flag:
        update_connections_chart()


scheduler = BackgroundScheduler()
scheduler.add_job(scheduled_job, 'cron', second=0)
scheduler.start()
