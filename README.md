# Parcialito

Trivia de opción múltiple para estudiar, por materia y tema. Se publica en GitHub Pages
y funciona como app instalable (PWA). No hay build: es HTML + JS en módulos + JSON.

## Estructura

| Carpeta / archivo | Qué es |
|---|---|
| `index.html`, `js/app.js` | La app. `app.js` es solo el punto de entrada; las pantallas están en los módulos de abajo |
| `js/lab-*.js`, `js/*.js` | Laboratorios y actividades interactivas |
| `data/<materia>/` | Un JSON por tema + `_materia.json` (nombre, emoji, color) |
| `data/index.json` | Índice que lee la app. **Se genera solo**, no se edita a mano |
| `data/img/` | Imágenes de las preguntas (las crea el editor) |
| `segundo-parcial/` | JSON de "Parciales de Biología (Integrador)"; se juntan en un único juego |
| `js/editor.js` | Editor local de materias, temas y preguntas |
| `probar.bat` | Prueba la app en tu compu (servidor local + navegador) |
| `tools/` | Validador, generador de índice, iconos, versionado y SQL de Supabase |
| `PROMPT_PARA_LM.md`, `PROMPT_LAB_PARA_LM.md` | Prompts para generar preguntas y laboratorios con un LM |
| `backups/` | Material guardado que no se muestra en la app (IPC 2 y Semiología 2); ver `backups/README.md` |

## Cómo está dividida la app (`js/`)

`app.js` arranca todo; cada pantalla vive en su módulo. Para cambiar algo, buscá el módulo:

| Módulo | Qué tiene |
|---|---|
| `nucleo.js` | Elementos del DOM, el estado compartido `S` (`S.indice`, `S.juego`, `S.sesionT`) y utilidades chicas (`esc`, `mezclar`, `plural`, `avisar`) |
| `arranque.js` | `iniciar()`: carga `data/index.json` y muestra el inicio |
| `home.js` | Pantalla de inicio (materias, banners) |
| `materia.js` | Pantalla de materia: elegir temas, juegos interactivos, crucigramas |
| `partidas.js` | Armado de partidas (práctica por tema, errores, difíciles, megaclase) |
| `juego.js` | Pantalla de juego: pregunta, respuesta, racha, mascota |
| `resultado.js`, `reportes.js` | Resultado de la partida; reportes de preguntas |
| `datos.js` | Carga de temas y preguntas, dominio por pregunta y por tema |
| `anki.js` | Tarjetas tipo Anki (repaso espaciado) |
| `parciales-bio.js`, `ipc.js` | Bancos y pantallas de los parciales de Biología y de IPC |
| `ranking-ui.js`, `jugadores.js`, `visitas.js`, `participacion.js` | Ranking, historial, directorio de jugadores, visitas y comentarios |
| `instalacion.js` | Instalación como app (PWA) y aviso de versión nueva |
| `actividades.js` | Registro de actividades interactivas (qué clave abre qué laboratorio) |
| `teclado.js` | Atajos de teclado |

Reglas para tocar estos módulos:

- Las partidas y sesiones en curso se leen y se asignan siempre como `S.juego` / `S.sesionT` (un módulo no puede reasignar una variable importada).
- Si un módulo nuevo solo registra listeners al cargarse (como `teclado.js`), hay que importarlo desde `app.js`, si no nunca se ejecuta.
- Un módulo nuevo en `js/` se agrega también a la lista `SHELL` de `sw.js` para que funcione sin conexión.

## Agregar o modificar contenido

1. Generá el JSON con el prompt de `PROMPT_PARA_LM.md` (o usá el editor local).
2. Guardalo en `data/<materia>/NN-tema.json`.
3. Corré `update.bat` (o `python tools/actualizar_indice.py`): valida todo y regenera `data/index.json`.
4. Subí los cambios a `main`. El workflow publica el sitio; si algún JSON tiene un error, el deploy se frena.

Para revisar a mano: `python tools/validar.py` (o pasándole un archivo).
Errores = el archivo no sirve. Avisos = anda, pero conviene mirarlo.

## Probar en tu compu

Hacé doble clic en `probar.bat` (necesita Python). Valida los temas, regenera el índice,
levanta la app en `http://localhost:8000` y abre el navegador. Guardá un cambio y recargá
con F5: el servidor no usa caché, así que ves siempre la versión nueva. Se corta con Ctrl+C.
Si necesitás otro puerto: `python tools/servidor_local.py --puerto 8080`.

Ojo: las partidas que juegues ahí también se guardan en el ranking real (Supabase).

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
