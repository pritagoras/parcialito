-- Agrega fabricante y modelo a cada registro de la tabla de visitas.
-- Ejecutar una sola vez en Supabase > SQL Editor.
-- Es idempotente: puede volver a ejecutarse sin duplicar columnas.

alter table public.visitas
  add column if not exists fabricante text,
  add column if not exists modelo text;

create index if not exists visitas_modelo_idx
  on public.visitas (fabricante, modelo);
