import re
from werkzeug.security import generate_password_hash, check_password_hash
from ..database import get_db

def normalize_cnpj(raw): return re.sub(r"[^A-Z0-9]", "", (raw or "").upper())

def valid_cnpj(raw):
    c = normalize_cnpj(raw)
    if not re.fullmatch(r"[A-Z0-9]{12}\d{2}", c) or len(set(c)) == 1:
        return False

    def dv(base, weights):
        total = sum((ord(char) - 48) * weight for char, weight in zip(base, weights))
        remainder = total % 11
        return "0" if remainder < 2 else str(11 - remainder)

    first = dv(c[:12], [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    second = dv(c[:12] + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    return c[12:] == first + second

def public(row):
    return {"id": row["id"], "cnpj": row["cnpj"], "name": row["name"], "email": row["email"],
            "phone": row["phone"], "category": row["category"]}

def create(d):
    db = get_db()
    cur = db.execute("INSERT INTO companies(cnpj,name,email,phone,category,password_hash) VALUES(?,?,?,?,?,?)",
        (normalize_cnpj(d["cnpj"]), d["name"], d["email"].lower(), d.get("phone"), d.get("category"),
         generate_password_hash(d["password"])))
    db.commit()
    return find(cur.lastrowid)

def find(cid): return get_db().execute("SELECT * FROM companies WHERE id=?", (cid,)).fetchone()

def authenticate(email, password):
    row = get_db().execute("SELECT * FROM companies WHERE email=?", ((email or "").lower(),)).fetchone()
    return row if row and check_password_hash(row["password_hash"], password or "") else None

def exists(cnpj, email):
    return get_db().execute("SELECT 1 FROM companies WHERE cnpj=? OR email=?", (normalize_cnpj(cnpj), (email or "").lower())).fetchone()
