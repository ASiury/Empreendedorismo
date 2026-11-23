import re
from flask import Blueprint, request, session, jsonify, render_template_string
from . import err, clean, login_required
from ..models import establishment, review, barrier
from ..services.geocoding import geocode

bp = Blueprint("establishments", __name__)
FEATURE = re.compile(r"^[a-z_]{2,40}$")

@bp.get("/api/establishments")
def index():
    return jsonify(establishment.list_all())

@bp.get("/api/establishments/<int:eid>")
def show(eid):
    est = establishment.get(eid)
    return jsonify(est) if est else err("Estabelecimento não encontrado.", 404)

@bp.post("/api/establishments")
@login_required
def create():
    d = request.get_json(silent=True) or {}
    data = {k: clean(d.get(k), n) for k, n in (("name", 120), ("category", 60), ("description", 1000), ("address", 200),
            ("city", 80), ("phone", 30), ("whatsapp", 30), ("website", 200), ("image", 400), ("plan", 60))}
    if not all(data[k] for k in ("name", "category", "address", "city")): return err("Informe nome, categoria, endereço e cidade.")
    plan = clean(d.get("partnershipPlan"), 60) or "Gratuito"
    if plan != "Gratuito": return err("Planos pagos ainda não estão disponíveis.", 422)
    feats = d.get("features") or []
    if not isinstance(feats, list) or not all(isinstance(f, str) and FEATURE.match(f) for f in feats):
        return err("Lista de recursos inválida.")
    data["plan"] = plan
    data["features"] = sorted(set(feats))
    try:
        lat, lng = float(d["lat"]), float(d["lng"])
        data["state"] = clean(d.get("state"), 2)
    except (KeyError, TypeError, ValueError):
        geo = geocode(data["address"], data["city"])
        if not geo: return err("Não foi possível localizar esse endereço no mapa. Confira rua, número e cidade.", 422)
        lat, lng, data["state"] = geo
    if not (-35 <= lat <= 6 and -75 <= lng <= -30): return err("Coordenadas fora do Brasil.", 422)
    data["lat"], data["lng"] = lat, lng
    return jsonify(establishment.create(session["company_id"], data)), 201

@bp.delete("/api/establishments/<int:eid>")
@login_required
def destroy(eid):
    est = establishment.get(eid)
    if not est: return err("Estabelecimento não encontrado.", 404)
    if est["companyId"] != session["company_id"]: return err("Você não tem permissão para excluir esta unidade.", 403)
    establishment.delete(eid)
    return jsonify({"ok": True})

@bp.get("/api/me/establishments")
@login_required
def mine():
    return jsonify(establishment.list_all(session["company_id"]))

@bp.get("/api/me/feedback")
@login_required
def feedback():
    cid = session["company_id"]
    return jsonify({"reviews": review.list_for(company_id=cid), "barriers": barrier.list_for(company_id=cid)})

VERIFY_VIEW = """<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verificação de Certificado - AcessaAqui</title>
<body style="font-family:system-ui;max-width:560px;margin:3rem auto;padding:0 1rem;line-height:1.5">
{% if est %}<h1 style="color:#047857">✔ Registro encontrado na plataforma</h1>
<p><strong>{{ est.name }}</strong><br>{{ est.address }} - {{ est.city }}/{{ est.state }}</p>
<p>Código interno: <code>{{ est.certCode }}</code><br>Registrado em {{ est.createdAt[:10] }}</p>
<p>Este registro confirma que a unidade foi cadastrada no AcessaAqui. A classificação utiliza informações fornecidas pela empresa e não representa auditoria técnica ou certificação pública.</p>
<p><a href="/view/usuario.html">Ver acessibilidade completa no AcessaAqui</a></p>
{% else %}<h1 style="color:#b91c1c">✖ Certificado não encontrado</h1><p>Este código não consta na base do AcessaAqui.</p>{% endif %}</body></html>"""

@bp.get("/verificar/<code>")
def verify(code):
    return render_template_string(VERIFY_VIEW, est=establishment.by_cert(code))
