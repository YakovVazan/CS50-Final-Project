from functools import wraps
from flask import session, redirect

def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if session:
            return func(*args, **kwargs)
        else:
            return redirect("/")
    return wrapper