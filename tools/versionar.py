#!/usr/bin/env python3
"""
versionar.py: se ejecuta SOLO al publicar (lo llama el workflow de GitHub Pages).

Problema que resuelve: GitHub Pages deja que el navegador guarde cada archivo
unos 10 minutos. Si subís cambios, un celular puede mezclar un archivo nuevo con
otro viejo y la app se rompe o no muestra lo nuevo (había que borrar los datos).

Qué hace (sobre la copia que se publica, no sobre tu repo):
  1. Agrega ?v=<versión> a todos los imports de js/*.js
  2. Agrega ?v=<versión> al <script> y al <link> de css de index.html
  3. Inserta en index.html una red de seguridad: si la app no arranca, muestra un
     botón "Actualizar" que recarga saltándose el caché.

Uso (lo hace el workflow):
    python tools/versionar.py <versión>
"""

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# Cualquier texto './algo.js' entre comillas (así se escriben los imports)
IMPORT = re.compile(r"""(['"])(\./[\w./-]+\.js)(?:\?v=\w+)?\1""")
# src="js/xxx.js" y href="css/xxx.css" de index.html
ENLACE = re.compile(r'((?:src|href)="(?:js|css)/[\w./-]+\.(?:js|css))(?:\?v=\w+)?"')

RED_DE_SEGURIDAD = """
<script id="red-de-seguridad">
(function () {
  function aviso() {
    var app = document.getElementById('app');
    if (!app || app.childElementCount) return;
    app.innerHTML = '<div style="padding:2rem 1rem;text-align:center;font-family:system-ui,sans-serif;color:#FFF3DC">' +
      '<p style="margin:0 0 1rem">No se pudo cargar la app. Probablemente tu navegador tiene guardada una versión vieja.</p>' +
      '<button id="act-ver" style="font:inherit;font-weight:700;padding:.8rem 1.4rem;border-radius:14px;border:0;background:#9B7BFF;color:#120a26">Actualizar</button></div>';
    document.getElementById('act-ver').onclick = function () {
      location.replace(location.pathname + '?actualizar=' + Date.now() + location.hash);
    };
  }
  // Falla de un <script> (archivo viejo/mezclado en caché) o error al ejecutarlo
  window.addEventListener('error', function (e) {
    var t = e && e.target;
    if (t && t.tagName && t.tagName !== 'SCRIPT') return;   // ignora tipografías, imágenes, etc.
    setTimeout(aviso, 300);
  }, true);
  setTimeout(aviso, 6000);
})();
</script>
"""


def main(argv):
    version = re.sub(r"\W", "", argv[0]) if argv else "dev"
    if not version:
        version = "dev"

    cambiados = 0
    for f in sorted((RAIZ / "js").glob("*.js")):
        texto = f.read_text(encoding="utf-8")
        nuevo = IMPORT.sub(lambda m: f"{m[1]}{m[2]}?v={version}{m[1]}", texto)
        if nuevo != texto:
            f.write_text(nuevo, encoding="utf-8")
            cambiados += 1

    html = RAIZ / "index.html"
    h = html.read_text(encoding="utf-8")
    h = ENLACE.sub(lambda m: f'{m[1]}?v={version}"', h)
    if 'id="red-de-seguridad"' not in h:
        if "</body>" in h:
            h = h.replace("</body>", RED_DE_SEGURIDAD + "</body>")
        else:
            h += RED_DE_SEGURIDAD
    html.write_text(h, encoding="utf-8")

    print(f"Versión {version}: {cambiados} archivos js versionados, index.html actualizado.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
