-- Buzón privado de imágenes de Parcialito.
-- Esta migración ya fue aplicada directamente al proyecto Supabase tnpcvmnwuhsxdxvwxvlh.
-- Se conserva como referencia reproducible del esquema y sus políticas.

create table if not exists public.envios_imagenes (
  id bigint generated always as identity primary key,
  archivos jsonb not null
    check (jsonb_typeof(archivos) = 'array' and jsonb_array_length(archivos) between 1 and 6),
  categoria text not null default 'Variado' check (char_length(categoria) <= 40),
  apodo text check (apodo is null or char_length(apodo) <= 20),
  mensaje text check (mensaje is null or char_length(mensaje) <= 300),
  estado text not null default 'pendiente' check (estado in ('pendiente','revisado')),
  creado timestamptz not null default now()
);
create index if not exists envios_imagenes_creado_idx on public.envios_imagenes (creado desc);
alter table public.envios_imagenes enable row level security;
grant usage on schema public to anon, authenticated;
grant insert on public.envios_imagenes to anon;
grant select, update, delete on public.envios_imagenes to authenticated;
grant usage, select on sequence public.envios_imagenes_id_seq to anon;

drop policy if exists "envios insertar anonimo" on public.envios_imagenes;
create policy "envios insertar anonimo" on public.envios_imagenes
  for insert to anon with check (
    jsonb_typeof(archivos) = 'array'
    and jsonb_array_length(archivos) between 1 and 6
    and char_length(categoria) <= 40
    and (apodo is null or char_length(apodo) <= 20)
    and (mensaje is null or char_length(mensaje) <= 300)
    and estado = 'pendiente'
  );
drop policy if exists "envios solo admin leer" on public.envios_imagenes;
create policy "envios solo admin leer" on public.envios_imagenes
  for select to authenticated using ((select public.parcialito_soy_admin()));
drop policy if exists "envios solo admin actualizar" on public.envios_imagenes;
create policy "envios solo admin actualizar" on public.envios_imagenes
  for update to authenticated using ((select public.parcialito_soy_admin()))
  with check ((select public.parcialito_soy_admin()));
drop policy if exists "envios solo admin borrar" on public.envios_imagenes;
create policy "envios solo admin borrar" on public.envios_imagenes
  for delete to authenticated using ((select public.parcialito_soy_admin()));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('parcialito-envios','parcialito-envios',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "envios subir imagenes" on storage.objects;
create policy "envios subir imagenes" on storage.objects
  for insert to anon with check (
    bucket_id = 'parcialito-envios'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and (storage.filename(name)) ~ '^[0-9a-fA-F-]{36}\.(jpg|png|webp)$'
  );
drop policy if exists "envios admin leer imagenes" on storage.objects;
create policy "envios admin leer imagenes" on storage.objects
  for select to authenticated using (
    bucket_id='parcialito-envios' and (select public.parcialito_soy_admin())
  );
drop policy if exists "envios admin borrar imagenes" on storage.objects;
create policy "envios admin borrar imagenes" on storage.objects
  for delete to authenticated using (
    bucket_id='parcialito-envios' and (select public.parcialito_soy_admin())
  );
