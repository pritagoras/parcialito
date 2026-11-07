#!/usr/bin/env python3
"""
servidor_local.py: prueba Parcialito en tu compu, sin subir nada a GitHub.

Lo que hace:
  1. Valida los temas y regenera data/index.json (así aparecen los temas nuevos).
  2. Levanta un servidor local en http://localhost:8000 (o el primer puerto libre).
  3. Abre el navegador.

El servidor manda "no-store": cada vez que guardás un cambio y recargás la página
(F5) ves la versión nueva, sin caché vieja.

Uso (lo normal es hacer doble clic en probar.bat):
    python tools/servidor_local.py
    python tools/servidor_local.py --puerto 8080
    python tools/servidor_local.py --no-abrir      # no abre el navegador

Para cortar el servidor: Ctrl+C en la ventana negra.
"""

import argparse
import functools
import mimetypes
import subprocess
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# En Windows el registro a veces dice que .js es "text/plain" y el navegador
# se niega a cargar los módulos. Los fijamos a mano.
for ext, tipo in {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".webmanifest": "application/manifest+json",
}.items():
    mimetypes.add_type(tipo, ext)


class Manejador(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Nada de caché: lo que guardás es lo que ves al recargar.
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def log_request(self, code="-", size="-"):
        # Solo mostramos los problemas (404, 500...) para no llenar la pantalla.
        try:
            if int(code) >= 400:
                self.log_message('"%s" %s', self.requestline, code)
        except (TypeError, ValueError):
            pass


def regenerar_indice():
    script = RAIZ / "tools" / "actualizar_indice.py"
    if not script.exists():
        return
    print("Validando temas y regenerando el índice...")
    r = subprocess.run([sys.executable, str(script)], cwd=RAIZ)
    if r.returncode != 0:
        print("\n⚠ Hay errores en los temas (arriba dice cuáles).")
        print("  Igual levanto el servidor con el índice anterior; corregí y volvé a ejecutar.\n")


def abrir_servidor(puerto_inicial):
    handler = functools.partial(Manejador, directory=str(RAIZ))
    for puerto in range(puerto_inicial, puerto_inicial + 11):
        try:
            return ThreadingHTTPServer(("127.0.0.1", puerto), handler), puerto
        except OSError:
            continue
    return None, None


def main():
    ap = argparse.ArgumentParser(description="Servidor local para probar Parcialito.")
    ap.add_argument("--puerto", type=int, default=8000)
    ap.add_argument("--no-abrir", action="store_true", help="no abrir el navegador")
    args = ap.parse_args()

    regenerar_indice()

    servidor, puerto = abrir_servidor(args.puerto)
    if servidor is None:
        print(f"No encontré un puerto libre entre {args.puerto} y {args.puerto + 10}.")
        return 1

    url = f"http://localhost:{puerto}/"
    print(f"\nParcialito corriendo en {url}")
    print("Guardá tus cambios y recargá la página (F5) para verlos.")
    print("Para cortar: Ctrl+C\n")

    if not args.no_abrir:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()

    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
    finally:
        servidor.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
