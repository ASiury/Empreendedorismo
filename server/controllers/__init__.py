from functools import wraps
from flask import jsonify, session

def err(msg, code=400):
    return jsonify({"error": msg}), code

def login_required(fn):
    @wraps(fn)
    def wrapper(*a, **kw):
        if not session.get("company_id"):
            return err("Faça login como empresa para continuar.", 401)
        return fn(*a, **kw)
    return wrapper

def clean(v, n):
    return (v or "").strip()[:n] if isinstance(v, str) or v is None else str(v)[:n]
