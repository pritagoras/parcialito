# Parcialito

Trivia de opción múltiple para estudiar, **modular por materia y por tema**. Cada pregunta
tiene 4 opciones, y el juego suma puntos, racha 🔥, sonidos, confeti y un repaso de errores.
Es un sitio estático: no necesita servidor ni base de datos y se publica gratis en GitHub Pages.

## Cómo agregar contenido

1. Armá un prompt con [`PROMPT_PARA_LM.md`](PROMPT_PARA_LM.md), pegá tu material y copiá el JSON que devuelve el LM.
2. Guardalo en `data/<carpeta-de-la-materia>/NN-nombre-del-tema.json`.
   Si la materia es nueva, creá la carpeta (y, si querés emoji y color propios, un `_materia.json`).
3. Controlá el formato y regenerá el índice:
   ```bash
   python tools/actualizar_indice.py
   ```
4. Subilo:
   ```bash
   git add .
   git commit -m "Agrego tema nuevo"
   git push
   ```

No hay que tocar HTML, CSS ni JavaScript. Para borrar un tema, borrá su archivo y volvé al paso 3.

## Estructura

```
index.html
css/styles.css
js/                       app.js (juego), sonido.js, confeti.js, store.js
data/
  index.json              lo genera tools/actualizar_indice.py (no se edita a mano)
  biologia-celular/
    _materia.json         opcional: nombre, emoji y color de la materia
    01-membrana-plasmatica.json
    02-mitocondria-respiracion.json
  historia-argentina/
    ...
tools/
  actualizar_indice.py    valida todo y genera data/index.json
  validar.py              solo valida (también se puede usar por archivo)
PROMPT_PARA_LM.md         plantilla para generar preguntas
```

Los archivos de `data/` con "(ejemplo)" en el nombre del tema son de muestra: borralos cuando cargues los tuyos.

## Formato de un tema

```json
{
  "materia": "Biología Celular y Molecular",
  "tema": "Membrana plasmática",
  "preguntas": [
    {
      "pregunta": "¿Qué función cumple el colesterol en la membrana?",
      "opciones": ["Sintetiza ATP", "Modula la fluidez", "Reconoce antígenos", "Bombea iones"],
      "correcta": "B",
      "explicacion": "Se intercala entre los fosfolípidos y regula la fluidez."
    }
  ]
}
```

- Exactamente 4 opciones. `correcta` es una letra (`A` a `D`) que indica la posición dentro de `opciones`.
- La app **mezcla el orden de las opciones** en cada partida, así que la explicación no debe nombrar letras.
- `explicacion` es opcional pero muy recomendable para estudiar.
- La carpeta define la materia; el nombre que se muestra sale de `_materia.json` o, si no existe, del campo `"materia"` del primer tema.
- Los archivos se ordenan por nombre: prefijalos con `01-`, `02-`... para controlar el orden.

## Probarlo en tu compu

Los navegadores bloquean la lectura de archivos si abrís `index.html` con doble clic, así que levantá un servidor local:

```bash
python -m http.server 8000
```

y entrá a http://localhost:8000. Solo hace falta Python 3.9 o superior para las herramientas; el sitio en sí no usa nada instalado.

## Publicarlo en GitHub Pages

1. Creá un repositorio nuevo en GitHub y subí todo el contenido de esta carpeta a la rama `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `git push` a `main` dispara `.github/workflows/pages.yml`, que valida las preguntas, regenera el índice y publica.
   Si algún JSON tiene errores, el despliegue se frena y el error aparece en la pestaña **Actions**.

La URL queda como `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

*Alternativa sin Actions:* en **Settings → Pages** elegí "Deploy from a branch" (`main`, carpeta `/root`). En ese caso acordate de correr `python tools/actualizar_indice.py` y commitear `data/index.json` antes de cada push.

## Cómo se juega

- Elegí una materia, marcá uno o varios temas y la cantidad de preguntas (10, 20 o todas).
- Cada acierto suma 100 puntos más un bono creciente por racha (hasta +100). Un error corta la racha.
- Las preguntas falladas quedan guardadas en tu navegador: en la pantalla de inicio aparece **Repasar mis errores**, y una pregunta sale de esa lista cuando la acertás.
- Teclado: `1`–`4` o `A`–`D` para responder, `Enter` para seguir.
- El progreso (mejores resultados, errores, sonido) se guarda en `localStorage`: es por navegador y por dispositivo.

## Personalizar

- **Colores y tipografías:** variables al principio de `css/styles.css`.
- **Puntajes y festejos:** constante `HITOS` y la cuenta de `ganado` en `js/app.js`.
- **Sonidos:** `js/sonido.js` (se sintetizan en el navegador, no hay archivos de audio).
