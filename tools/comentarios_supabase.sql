-- Parcialito: tablas para comentarios públicos y reportes privados.
-- Ejecutar una sola vez en Supabase > SQL Editor > New query > Run.
-- La clave pública de la web puede leer/escribir comentarios, pero solo insertar reportes.
-- No se crea ninguna política SELECT para reportes_generales.

create table if not exists public.comentarios_publicos (
  id bigint generated always as identity primary key,
  apodo text not null check (char_length(apodo) between 1 and 20),
  comentario text not null check (char_length(comentario) between 1 and 500),
  creado timestamptz not null default now()
);
create index if not exists comentarios_publicos_creado_idx on public.comentarios_publicos (creado desc);
alter table public.comentarios_publicos enable row level security;
drop policy if exists "lectura comentarios publicos" on public.comentarios_publicos;
create policy "lectura comentarios publicos" on public.comentarios_publicos
  for select to anon using (true);
drop policy if exists "insertar comentarios publicos" on public.comentarios_publicos;
create policy "insertar comentarios publicos" on public.comentarios_publicos
  for insert to anon with check (
    char_length(trim(apodo)) between 1 and 20
    and char_length(trim(comentario)) between 1 and 500
  );

create table if not exists public.reportes_generales (
  id bigint generated always as identity primary key,
  motivo text not null check (motivo in ('error', 'sugerencia', 'tecnico', 'otro')),
  apodo text check (apodo is null or char_length(apodo) <= 20),
  comentario text not null check (char_length(comentario) between 1 and 1000),
  pagina text not null default '/' check (char_length(pagina) <= 200),
  creado timestamptz not null default now()
);
alter table public.reportes_generales enable row level security;
drop policy if exists "insertar reportes generales" on public.reportes_generales;
create policy "insertar reportes generales" on public.reportes_generales
  for insert to anon with check (
    motivo in ('error', 'sugerencia', 'tecnico', 'otro')
    and (apodo is null or char_length(apodo) <= 20)
    and char_length(trim(comentario)) between 1 and 1000
    and char_length(pagina) <= 200
  );

-- Importante: no agregar política SELECT a reportes_generales.
