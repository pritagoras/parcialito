# Backups

`ipc-semio/` conserva únicamente material que no está en el repositorio activo:
los JSON y metadatos de Semiología 2. La app no carga estos archivos y no existe
`data/semio/`.

## Semiología 2 archivada

Contenido preservado en `ipc-semio/data/semio/`:

- `_materia.json`
- `01-conferencia2.json`
- `02-enunciacion-encarnada.json`

Para volver a activarla, copiá esa carpeta a `data/semio/` y corré
`python tools/actualizar_indice.py` para regenerar `data/index.json`.

## IPC

IPC 2 y el banco del segundo parcial de IPC están activos en la app, en
`data/ipc-2/` y `data/ipc-segundo-parcial/`. La guía de Kuhn, los estilos y la
funcionalidad también están incorporados en `js/guia-kuhn.js`, `css/styles.css`
y `js/app.js`.

Se quitaron de este backup las copias redundantes de esos datos y archivos, además
de un índice parcial y fragmentos de app que ya no se necesitan para la ejecución.
Si necesitás recuperar el estado histórico, consultá el commit `3ecb578` con Git.
