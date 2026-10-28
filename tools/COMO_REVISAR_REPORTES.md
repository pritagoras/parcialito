# Revisar reportes de preguntas de Parcialito

## Qué guarda cada reporte nuevo

La tabla `reportes_preguntas` guarda el reporte privado y, además:
- `archivo_json`: ruta exacta del JSON de origen dentro del repositorio.
- `pregunta_numero`: posición original en el array `preguntas` (orientativa si el archivo se reordena).
- `pregunta_hash`: identificador calculado desde el enunciado; permite buscar la pregunta aunque cambie de posición.
- `pregunta_id` y `tema_id`: identificadores que ya usaba la aplicación.

Los reportes anteriores a la migración no tendrán esos tres campos nuevos; se pueden rastrear con `pregunta_id`, `tema_id` y el texto guardado, pero pueden requerir búsqueda manual.

## Activación única

1. Abrí Supabase y entrá al proyecto que usa Parcialito.
2. Entrá en **SQL Editor**.
3. Abrí este archivo del repo: `tools/migracion_reportes_origen.sql`.
4. Pegá su contenido y ejecutalo una sola vez.
5. Esperá a que GitHub Pages publique la versión nueva. La aplicación ya incluye el envío de la procedencia en los reportes.

## Cómo pedirme la revisión

1. En Supabase, abrí **Table Editor → reportes_preguntas**.
2. Exportá/descargá las filas como CSV (o JSON si la interfaz ofrece esa opción).
3. Adjuntá ese archivo en el chat y pedí: **“Revisá los reportes pendientes de Parcialito y corregí directamente los errores confirmados en el repo.”**

Con `archivo_json` puedo abrir el archivo exacto del repositorio y contrastar el reporte con el JSON original. Revisaré el enunciado, todas las opciones, la respuesta correcta y la explicación; no cambiaré una pregunta solo porque alguien la haya reportado. Te devolveré un resumen de qué se corrigió y qué necesita verificación.

## Privacidad y automatización

Los reportes siguen siendo privados en Supabase: no se publican en comentarios ni se vuelcan automáticamente a issues públicos de GitHub. La conexión disponible para editar el repo no tiene acceso directo a leer la tabla privada de Supabase, por lo que el CSV/JSON es el puente seguro por ahora. No pongas claves secretas de Supabase ni tokens de GitHub en los archivos del sitio.
