import os
from flask import Flask, jsonify, send_from_directory
from .config import PUBLIC, secret_key
from .database import close_db, init_db
from .controllers import auth_controller, establishment_controller, review_controller

def create_app():
    app = Flask(__name__, static_folder=None)
    app.config.update(SECRET_KEY=secret_key(), SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax",
                      SESSION_COOKIE_SECURE=os.environ.get("SESSION_COOKIE_SECURE", "0") == "1",
                      MAX_CONTENT_LENGTH=256 * 1024)
    app.teardown_appcontext(close_db)
    for m in (auth_controller, establishment_controller, review_controller):
        app.register_blueprint(m.bp)
    with app.app_context():
        init_db()

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Não encontrado."}), 404

    @app.get("/")
    @app.get("/index.html")
    def home():
        # A página inicial vive em view/, mas usa caminhos de assets relativos à raiz.
        return send_from_directory(os.path.join(PUBLIC, "view"), "index.html")

    @app.get("/<path:path>")
    def static_files(path):  # Views estáticas (HTML/CSS/JS)
        return send_from_directory(PUBLIC, path)
    return app

if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=3000, debug=False)
