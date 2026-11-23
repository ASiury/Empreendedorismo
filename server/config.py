import os, secrets
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.environ.get("DB_PATH", os.path.join(BASE, "data", "acessaaqui.db"))
# Neste checkout as páginas ficam diretamente na raiz do projeto.
PUBLIC = BASE

def secret_key():
    """Chave de sessão: variável de ambiente ou arquivo gerado na 1ª execução."""
    if os.environ.get("SECRET_KEY"):
        return os.environ["SECRET_KEY"]
    path = os.path.join(BASE, "data", ".secret_key")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        with open(path, "w") as f:
            f.write(secrets.token_hex(32))
    with open(path, encoding="utf-8") as f:
        return f.read().strip()
