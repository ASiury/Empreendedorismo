import os, secrets, sqlite3
from flask import g
from werkzeug.security import generate_password_hash
from .config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS companies(
  id INTEGER PRIMARY KEY AUTOINCREMENT, cnpj TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, phone TEXT, category TEXT, password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS establishments(
  id INTEGER PRIMARY KEY AUTOINCREMENT, company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, category TEXT NOT NULL, description TEXT, address TEXT NOT NULL, city TEXT NOT NULL,
  state TEXT, phone TEXT, whatsapp TEXT, website TEXT, image TEXT, lat REAL NOT NULL, lng REAL NOT NULL,
  features TEXT NOT NULL DEFAULT '[]', plan TEXT DEFAULT 'Gratuito', cert_code TEXT UNIQUE,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS reviews(
  id INTEGER PRIMARY KEY AUTOINCREMENT, establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  author TEXT, author_role TEXT, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS barriers(
  id INTEGER PRIMARY KEY AUTOINCREMENT, establishment_id INTEGER NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  author TEXT, barrier_type TEXT, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT DEFAULT 'aberto',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP);
"""

def get_db():
    if "db" not in g:
        os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

def close_db(_=None):
    db = g.pop("db", None)
    if db: db.close()

def init_db():
    db = get_db()
    db.executescript(SCHEMA)
    columns = {row[1] for row in db.execute("PRAGMA table_info(establishments)").fetchall()}
    if "is_sample" not in columns:
        db.execute("ALTER TABLE establishments ADD COLUMN is_sample INTEGER NOT NULL DEFAULT 0")
    seed_sample_establishments()


def seed_sample_establishments():
    """Cria registros fictícios claramente identificados para a primeira visita."""
    db = get_db()
    sample_cnpj = "00000000000000"  # inválido para login/cadastro; conta interna sem acesso
    owner = db.execute("SELECT id FROM companies WHERE cnpj=?", (sample_cnpj,)).fetchone()
    if owner:
        company_id = owner["id"]
    else:
        cur = db.execute(
            "INSERT INTO companies(cnpj,name,email,category,password_hash) VALUES(?,?,?,?,?)",
            (sample_cnpj, "AcessaAqui — exemplos fictícios", "exemplos@acessaaqui.invalid", "Demonstração de dados",
             generate_password_hash(secrets.token_urlsafe(32)))
        )
        company_id = cur.lastrowid

    samples = [
        ("Café Esquina Azul (fictício)", "Restaurante / Café", "Alameda ilustrativa, 101 — endereço fictício perto da Av. Paulista", "São Paulo", "SP", -23.5630, -46.6540,
         "Cadastro fictício para apresentar o mapa. Nenhum recurso de acessibilidade foi verificado; não representa um estabelecimento real."),
        ("Livraria Vagalume (fictícia)", "Comércio / Supermercado", "Rua ilustrativa, 220 — endereço fictício perto da Av. Paulista", "São Paulo", "SP", -23.5596, -46.6584,
         "Cadastro fictício para apresentar a busca e os detalhes. Nenhum recurso de acessibilidade foi verificado; não representa um estabelecimento real."),
        ("Mercadinho Bairro Verde (fictício)", "Comércio / Supermercado", "Alameda ilustrativa, 305 — endereço fictício perto da Av. Paulista", "São Paulo", "SP", -23.5604, -46.6510,
         "Cadastro fictício para apresentar as avaliações e os recursos. Nenhum recurso de acessibilidade foi verificado; não representa um estabelecimento real."),
    ]
    for name, category, address, city, state, lat, lng, description in samples:
        exists = db.execute("SELECT 1 FROM establishments WHERE name=? AND is_sample=1", (name,)).fetchone()
        if exists:
            continue
        db.execute("""INSERT INTO establishments(company_id,name,category,description,address,city,state,lat,lng,
            features,plan,cert_code,is_sample) VALUES(?,?,?,?,?,?,?,?,?,'[]','Gratuito',NULL,1)""",
            (company_id, name, category, description, address, city, state, lat, lng))
    db.commit()
