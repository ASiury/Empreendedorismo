from ..database import get_db

def to_dict(r):
    return {"id": r["id"], "establishmentId": r["establishment_id"], "author": r["author"], "authorRole": r["author_role"],
            "rating": r["rating"], "comment": r["comment"], "date": r["created_at"][:10], "verified": True}

def list_for(eid=None, company_id=None):
    sql, args = "SELECT r.* FROM reviews r", []
    if eid: sql += " WHERE r.establishment_id=?"; args.append(eid)
    elif company_id:
        sql += " JOIN establishments e ON e.id=r.establishment_id WHERE e.company_id=?"; args.append(company_id)
    return [to_dict(r) for r in get_db().execute(sql + " ORDER BY r.id DESC", args)]

def create(eid, d):
    db = get_db()
    cur = db.execute("INSERT INTO reviews(establishment_id,author,author_role,rating,comment) VALUES(?,?,?,?,?)",
                     (eid, d["author"], d["authorRole"], d["rating"], d["comment"]))
    db.commit()
    return to_dict(db.execute("SELECT * FROM reviews WHERE id=?", (cur.lastrowid,)).fetchone())
