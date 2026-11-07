# Parcialito

Trivia de opción múltiple para estudiar, por materia y tema. Se publica en GitHub Pages
y funciona como app instalable (PWA). No hay build: es HTML + JS en módulos + JSON.

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `index.html`, `js/app.js` | La app (menú, juego, Anki, ranking, progreso) |
| `js/lab-*.js`, `js/*.js` | Laboratorios y actividades interactivas |
| `data/<materia>/` | Un JSON por tema + `_materia.json` (nombre, emoji, color) |
| `data/index.json` | Índice que lee la app. **Se genera solo**, no se edita a mano |
| `data/img/` | Imágenes de las preguntas (las crea el editor) |
| `segundo-parcial/` | JSON de "Parciales de Biología (Integrador)"; se juntan en un único juego |
| `js/editor.js` | Editor local de materias, temas y preguntas |
| `tools/` | Validador, generador de índice, iconos, versionado y SQL de Supabase |
| `PROMPT_PARA_LM.md`, `PROMPT_LAB_PARA_LM.md` | Prompts para generar preguntas y laboratorios con un LM |

## Agregar o modificar contenido

1. Generá el JSON con el prompt de `PROMPT_PARA_LM.md` (o usá el editor local).
2. Guardalo en `data/<materia>/NN-tema.json`.
3. Corré `update.bat` (o `python tools/actualizar_indice.py`): valida todo y regenera `data/index.json`.
4. Subí los cambios a `main`. El workflow publica el sitio; si algún JSON tiene un error, el deploy se frena.

Para revisar a mano: `python tools/validar.py` (o pasándole un archivo).
Errores = el archivo no sirve. Avisos = anda, pero conviene mirarlo.

## Reglas del formato

- 4 opciones por pregunta; `correcta` es una letra `A`–`D`.
- La app mezcla las opciones: no uses "todas las anteriores" ni nombres letras en la explicación.
- Cada pregunta debería tener `explicacion`.

## Ranking y progreso

Usan Supabase (apodo, sin cuentas). Las tablas están en `tools/*.sql` y la URL y la clave
publishable están en `js/ranking.js` (esa clave es pública por diseño; la seguridad la dan las
políticas RLS de las tablas).

## Publicación

`.github/workflows/pages.yml`: valida, regenera índice e iconos (desde `ico.png` si existe),
versiona los archivos para evitar cachés viejos y publica en Pages.
