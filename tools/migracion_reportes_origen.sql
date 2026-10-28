-- Parcialito: añadir procedencia del JSON a los reportes de preguntas.
-- Ejecutar UNA sola vez en Supabase > SQL Editor.
-- No elimina ni modifica reportes existentes; las columnas nuevas quedan NULL en filas antiguas.

alter table public.reportes_preguntas
  add column if not exists archivo_json text,
  add column if not exists pregunta_numero integer,
  add column if not exists pregunta_hash text;

create index if not exists reportes_preguntas_hash_idx
  on public.reportes_preguntas (pregunta_hash);

comment on column public.reportes_preguntas.archivo_json is
  'Ruta del JSON de origen dentro del repositorio Parcialito, por ejemplo data/biologia-celular/04-tema-celula-eucariota.json';
comment on column public.reportes_preguntas.pregunta_numero is
  'Posición de la pregunta dentro del array preguntas del JSON de origen (1-based); puede cambiar si se reordena el archivo.';
comment on column public.reportes_preguntas.pregunta_hash is
  'Identificador estable calculado desde el enunciado en la aplicación; sirve para localizar la pregunta aunque cambie su posición.';
