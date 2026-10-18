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

drop policy if exists "lectura publica" on partidas;
create policy "lectura publica" on partidas
  for select to anon using (true);

drop policy if exists "insertar partidas" on partidas;
create policy "insertar partidas" on partidas
  for insert to anon with check (true);

-- ----------------------------------------------------------
-- Progreso por tema: cuántas preguntas de cada tema dominó cada apodo
-- (respondidas bien al menos una vez). Se agrega una fila nueva cada
-- vez que termina una ronda; la app muestra la más reciente por tema.
-- Se puede volver a ejecutar este archivo entero sin problemas.
-- ----------------------------------------------------------
create table if not exists progreso_temas (
  id               bigint generated always as identity primary key,
  apodo            text        not null check (char_length(apodo) between 1 and 20),
  materia          text        not null check (char_length(materia) between 1 and 80),
  tema_id          text        not null check (char_length(tema_id) between 1 and 120),
  tema             text        not null check (char_length(tema) between 1 and 80),
  dominadas        int         not null check (dominadas >= 0),
  total            int         not null check (total >= 1),
  mejor_precision  int         not null default 0 check (mejor_precision between 0 and 100),
  creado           timestamptz not null default now(),
  check (dominadas <= total)
);

create index if not exists progreso_apodo_idx on progreso_temas (apodo, tema_id, creado desc);

alter table progreso_temas enable row level security;

drop policy if exists "lectura publica" on progreso_temas;
create policy "lectura publica" on progreso_temas
  for select to anon using (true);

drop policy if exists "insertar progreso" on progreso_temas;
create policy "insertar progreso" on progreso_temas
  for insert to anon with check (true);
