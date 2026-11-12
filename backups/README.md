# Backups

Acá queda guardado lo que se sacó de la página principal de Parcialito para poder
volver a usarlo. Nada de esta carpeta se lee desde la app ni la valida `tools/`.

## `ipc-semio/` (sacado el 2026-11-12)

| Qué | Dónde |
|---|---|
| Preguntas y tarjetas de IPC 2 (9 temas) | `ipc-semio/data/ipc-2/` |
| Banco del segundo parcial de IPC (Hacking, Popper, Foucault, Kuhn, Integrador) | `ipc-semio/data/ipc-segundo-parcial/` |
| Semiología 2 (2 temas) | `ipc-semio/data/semio/` |
| Guía de Kuhn | `ipc-semio/js/guia-kuhn.js` |
| Código que tenía `js/app.js` (banner del inicio, modelo de parcial, bloques por autor, banco) | `ipc-semio/js/app-ipc-fragmentos.js` |
| Estilos que tenía `css/styles.css` | `ipc-semio/css/ipc.css` |
| Entradas que tenían IPC 2 y Semiología 2 en `data/index.json` | `ipc-semio/data-index-entradas.json` |

### Volver a activar solo Semiología 2

1. Mover `backups/ipc-semio/data/semio` a `data/semio`.
2. Correr `update.bat` (o `python tools/actualizar_indice.py`) para regenerar `data/index.json`.

### Volver a activar IPC 2 (con su segundo parcial)

1. Mover `backups/ipc-semio/data/ipc-2` y `backups/ipc-semio/data/ipc-segundo-parcial` a `data/`.
2. Mover `backups/ipc-semio/js/guia-kuhn.js` a `js/`.
3. Pegar cada fragmento de `app-ipc-fragmentos.js` en `js/app.js`, en el lugar que indica su encabezado.
4. Pegar `backups/ipc-semio/css/ipc.css` al final de `css/styles.css`.
5. Correr `update.bat`. El indexador conserva el bloque `segundoParcial` de IPC solo si ya estaba en
   `data/index.json`, así que hay que agregar a mano la entrada de `ipc-2` desde `data-index-entradas.json`
   (con su bloque `segundoParcial`) y volver a correr `update.bat`.

### Atajo con git

Todo esto estaba en el commit `3ecb578` (el último antes de sacarlo). Para ver cualquier archivo
original: `git show 3ecb578:js/app.js`.
