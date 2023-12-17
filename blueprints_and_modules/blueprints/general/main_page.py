from flask import Blueprint, session, render_template, redirect

main_page_bp = Blueprint("main_page_bp", __name__, template_folder="../../templates")


@main_page_bp.route("/")
def index():
    if session:
        return render_template("index.html")
    else:
        return redirect("/login")