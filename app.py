from flask import Flask, render_template
from flask_session import Session
from blueprints_and_modules.blueprints.db.db import init_db
from blueprints_and_modules.modules.socketio.socketio_instance import socketio
from blueprints_and_modules.modules.socketio.socketio_logics import *
from blueprints_and_modules.modules.scheduler.scheduler import *
from blueprints_and_modules.blueprints.admin.reports import reports_bp
from blueprints_and_modules.blueprints.auth_and_account.auth import auth_bp
from blueprints_and_modules.blueprints.auth_and_account.account import account_bp
from blueprints_and_modules.blueprints.auth_and_account.user_data import user_data_bp
from blueprints_and_modules.blueprints.auth_and_account.email_auth import email_auth_bp
from blueprints_and_modules.blueprints.communications_and_posts.communications import communications_bp
from blueprints_and_modules.blueprints.communications_and_posts.posts import posts_bp
from blueprints_and_modules.blueprints.communications_and_posts.schedule_posting import schedule_posting
from blueprints_and_modules.blueprints.admin.dashboard_and_data import dashboard_and_data_bp
from blueprints_and_modules.blueprints.apps.social_hub import social_hub_bp
from blueprints_and_modules.blueprints.apps.social_apps import social_apps_bp
from blueprints_and_modules.blueprints.general.main_page import main_page_bp
from blueprints_and_modules.blueprints.general.notifications import notifications_bp
from blueprints_and_modules.blueprints.general.privacy_policy import privacy_policy_bp
from blueprints_and_modules.blueprints.general.get_user_timezone import timezone_bp
# from socials.Facebook.secrets import app_credentials


# Configure flask app
app = Flask(__name__)

# Configure socketIO
socketio.init_app(app)

# Configure blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(account_bp)
app.register_blueprint(user_data_bp)
app.register_blueprint(email_auth_bp)
app.register_blueprint(communications_bp)
app.register_blueprint(posts_bp)
app.register_blueprint(schedule_posting)
app.register_blueprint(dashboard_and_data_bp)
app.register_blueprint(social_hub_bp)
app.register_blueprint(social_apps_bp)
app.register_blueprint(main_page_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(privacy_policy_bp)
app.register_blueprint(timezone_bp)
app.register_blueprint(reports_bp)

# Configure session
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


# Prevent cashing
@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


# prevent wrong pathes in url
@app.route('/<path:path>')
def catch_all(path):
    return render_template('404.html')


if __name__ == '__main__':
    init_db()

    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
