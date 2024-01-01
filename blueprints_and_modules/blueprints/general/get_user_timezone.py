import sqlite3
from flask import Blueprint, request, jsonify, session
from blueprints_and_modules.blueprints.db.db import get_db_connection


timezone_bp = Blueprint("timezone_bp", __name__,
                        template_folder="../../templates")


@timezone_bp.route("/set_timezone", methods=['POST'])
def set_timezone():
    """get timezone using ip and use it for the charts"""
    # import requests
    # ip_addr = request.headers.get("X-Forwarded-For") or request.remote_addr
    # url = f"https://ipinfo.io/{ip_addr}/json"
    # response = requests.get(url).json()
    # print(response)
    # location_data = {"ip": ip_addr, "city": response.get(
    #     "city"), "region": response.get("region"), "country": response.get("country_name")}
    # print(location_data)

    """get device type"""
    # user_agnent = request.user_agent
    # device_data = {"user_agent": user_agnent.string,
    #                "borwser": user_agnent.browser, "version": user_agnent.version, "platform": user_agnent.platform, "language": user_agnent.language}
    # print(device_data)
    data = request.get_json()
    timezone_offset = data.get('timezoneOffset')

    # Get database
    conn = get_db_connection()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    cursor.execute("UPDATE users SET time_zone_offset = ? WHERE id = ?",
                   (timezone_offset, session["user_id"]))

    conn.commit()
    conn.close()

    return jsonify(timezone_offset)
