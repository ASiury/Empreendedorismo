from ..database import get_db

def to_dict(r):
    return {"id": r["id"], "establishmentId": r["establishment_id"], "author": r["author"], "barrierType": r["barrier_type"],
            "title": r["title"], "description": r["description"], "status": r["status"], "date": r["created_at"][:10]}

def list_for(eid=None, company_id=None):
    sql, args = "SELECT b.* FROM barriers b", []
    if eid: sql += " WHERE b.establishment_id=?"; args.append(eid)
    elif company_id:
        sql += " JOIN establishments e ON e.id=b.establishment_id WHERE e.company_id=?"; args.append(company_id)
    return [to_dict(r) for r in get_db().execute(sql + " ORDER BY b.id DESC", args)]

def create(eid, d):
    db = get_db()
    cur = db.execute("INSERT INTO barriers(establishment_id,author,barrier_type,title,description) VALUES(?,?,?,?,?)",
                     (eid, d["author"], d["barrierType"], d["title"], d["description"]))
    db.commit()
    return to_dict(db.execute("SELECT * FROM barriers WHERE id=?", (cur.lastrowid,)).fetchone())
