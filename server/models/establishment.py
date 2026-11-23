import json, secrets
from datetime import datetime
from ..database import get_db

BASE_SQL = """SELECT e.*, COALESCE(ROUND(AVG(r.rating),1),0) AS rating, COUNT(r.id) AS reviews_count,
              SUM(CASE WHEN r.rating >= 4 THEN 1 ELSE 0 END) AS positive_reviews_count
              FROM establishments e LEFT JOIN reviews r ON r.establishment_id=e.id"""

def to_dict(r):
    return {"id": r["id"], "companyId": r["company_id"], "name": r["name"], "category": r["category"],
            "description": r["description"] or "", "address": r["address"], "city": r["city"], "state": r["state"] or "",
            "phone": r["phone"] or "", "whatsapp": r["whatsapp"] or "", "website": r["website"] or "",
            "image": r["image"] or "", "lat": r["lat"], "lng": r["lng"], "features": json.loads(r["features"]),
            "partnershipPlan": r["plan"], "certCode": r["cert_code"], "createdAt": r["created_at"],
            "rating": r["rating"], "reviewsCount": r["reviews_count"], "verifiedByCommunity": (r["positive_reviews_count"] or 0) >= 3,
            "isSample": bool(r["is_sample"])}

def list_all(company_id=None):
    sql, args = BASE_SQL, []
    if company_id: sql += " WHERE e.company_id=?"; args.append(company_id)
    rows = get_db().execute(sql + " GROUP BY e.id ORDER BY e.id DESC", args).fetchall()
    return [to_dict(r) for r in rows if r["id"] is not None]

def get(eid):
    r = get_db().execute(BASE_SQL + " WHERE e.id=? GROUP BY e.id", (eid,)).fetchone()
    return to_dict(r) if r and r["id"] is not None else None

def by_cert(code):
    r = get_db().execute(BASE_SQL + " WHERE e.cert_code=? GROUP BY e.id", (code,)).fetchone()
    return to_dict(r) if r and r["id"] is not None else None

def create(company_id, d):
    db = get_db()
    code = f"ACC-{datetime.now().year}-{secrets.token_hex(3).upper()}"
    cur = db.execute("""INSERT INTO establishments(company_id,name,category,description,address,city,state,phone,whatsapp,
        website,image,lat,lng,features,plan,cert_code) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (company_id, d["name"], d["category"], d.get("description"), d["address"], d["city"], d.get("state"),
         d.get("phone"), d.get("whatsapp"), d.get("website"), d.get("image"), d["lat"], d["lng"],
         json.dumps(d["features"]), d.get("plan") or "Gratuito", code))
    db.commit()
    return get(cur.lastrowid)

def delete(eid):
    db = get_db(); db.execute("DELETE FROM establishments WHERE id=?", (eid,)); db.commit()
