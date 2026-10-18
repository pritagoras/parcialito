-- ==========================================================
-- Ranking público con apodos (Supabase)
--
-- Pasos:
--  1. Creá una cuenta gratis en https://supabase.com y un proyecto nuevo.
--  2. En "SQL Editor", pegá TODO este archivo y apretá Run.
--  3. En "Project Settings > API" copiá la URL del proyecto y la clave
--     "anon" (o "publishable") y pegalas arriba de js/ranking.js.
--  4. Hacé commit y push: el ranking se activa solo.
--
-- La clave anon es pública por diseño. La seguridad la dan estas reglas:
-- cualquiera puede LEER e INSERTAR partidas, pero nadie puede editar
-- ni borrar desde la web.
-- ==========================================================

create table if not exists partidas (
  id         bigint generated always as identity primary key,
  apodo      text        not null check (char_length(apodo) between 1 and 20),
  materia    text        not null check (char_length(materia) between 1 and 80),
  tema       text        not null check (char_length(tema) between 1 and 80),
  aciertos   int         not null check (aciertos >= 0),
  total      int         not null check (total between 1 and 1000),
  puntos     int         not null check (puntos >= 0),
  racha_max  int         not null default 0 check (racha_max >= 0),
  creado     timestamptz not null default now(),
  check (aciertos <= total),
  check (racha_max <= total),
  check (puntos <= total * 200)   -- máximo posible: 100 + 100 de bonus por pregunta
);

create index if not exists partidas_materia_idx on partidas (materia, tema, puntos desc);
create index if not exists partidas_apodo_idx   on partidas (lower(apodo), creado desc);

alter table partidas enable row level security;

create policy "lectura publica" on partidas
  for select to anon using (true);

create policy "insertar partidas" on partidas
  for insert to anon with check (true);
