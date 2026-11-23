from flask import Blueprint, request, jsonify
from . import err, clean
from ..models import establishment, review, barrier

bp = Blueprint("feedback", __name__, url_prefix="/api/establishments/<int:eid>")

def _est(eid): return establishment.get(eid)

@bp.get("/reviews")
def reviews(eid):
    return jsonify(review.list_for(eid=eid))

@bp.post("/reviews")
def add_review(eid):
    if not _est(eid): return err("Estabelecimento não encontrado.", 404)
    d = request.get_json(silent=True) or {}
    try: rating = int(d.get("rating"))
    except (TypeError, ValueError): return err("Nota inválida.")
    comment = clean(d.get("comment"), 1000)
    if not 1 <= rating <= 5 or not comment: return err("Informe uma nota de 1 a 5 e um comentário.")
    return jsonify(review.create(eid, {"author": clean(d.get("author"), 80) or "Membro da Comunidade",
        "authorRole": clean(d.get("authorRole"), 80) or "Visitante", "rating": rating, "comment": comment})), 201

@bp.get("/barriers")
def barriers(eid):
    return jsonify(barrier.list_for(eid=eid))

@bp.post("/barriers")
def add_barrier(eid):
    if not _est(eid): return err("Estabelecimento não encontrado.", 404)
    d = request.get_json(silent=True) or {}
    title, desc = clean(d.get("title"), 120), clean(d.get("description"), 1000)
    if not title or not desc: return err("Informe o título e a descrição da barreira.")
    return jsonify(barrier.create(eid, {"author": clean(d.get("author"), 80) or "Cidadão Colaborador",
        "barrierType": clean(d.get("barrierType"), 60) or "Barreira Arquitetônica", "title": title, "description": desc})), 201
