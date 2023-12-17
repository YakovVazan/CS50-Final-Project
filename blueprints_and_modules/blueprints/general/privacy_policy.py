from flask import Blueprint, render_template

privacy_policy_bp = Blueprint("privacy_policy_bp", __name__, template_folder="../../templates")


@privacy_policy_bp.route("/privacy_policy")
def privacy_policy():
    return render_template("privacy_policy.html")