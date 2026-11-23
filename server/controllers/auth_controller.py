import sqlite3
from flask import Blueprint, request, session, jsonify
from . import err, clean
from ..models import company

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@bp.post("/register")
def register():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict): return err("Envie os dados da conta em formato JSON.")
    d = {k: clean(payload.get(k), 120) for k in ("cnpj", "name", "email", "phone", "category")}
    password = payload.get("password")
    password = password if isinstance(password, str) else ""
    if not all(d[k] for k in ("cnpj", "name", "email", "phone")): return err("Preencha todos os campos obrigatórios.")
    if not company.valid_cnpj(d["cnpj"]): return err("CNPJ inválido.")
    if "@" not in d["email"] or "." not in d["email"].split("@")[-1]: return err("E-mail inválido.")
    if len(password) < 8 or len(password) > 128: return err("A senha deve ter entre 8 e 128 caracteres.")
    d["password"] = password
    if company.exists(d["cnpj"], d["email"]): return err("CNPJ ou e-mail já cadastrado.", 409)
    try:
        row = company.create(d)
    except sqlite3.IntegrityError:
        return err("CNPJ ou e-mail já cadastrado.", 409)
    session.clear(); session["company_id"] = row["id"]
    return jsonify(company.public(row)), 201

@bp.post("/login")
def login():
    d = request.get_json(silent=True)
    if not isinstance(d, dict): return err("Informe e-mail e senha.")
    email = clean(d.get("email"), 120)
    password = d.get("password") if isinstance(d.get("password"), str) else ""
    if len(password) > 128: return err("E-mail ou senha incorretos.", 401)
    row = company.authenticate(email, password)
    if not row: return err("E-mail ou senha incorretos.", 401)
    session.clear(); session["company_id"] = row["id"]
    return jsonify(company.public(row))

@bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})

@bp.get("/me")
def me():
    row = company.find(session.get("company_id")) if session.get("company_id") else None
    return jsonify(company.public(row) if row else None)
