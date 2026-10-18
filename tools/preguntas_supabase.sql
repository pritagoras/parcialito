-- ==========================================================
-- preguntas_supabase.sql: reportes de preguntas y dificultad real.
--
-- Cómo usarlo: Supabase > SQL Editor > New query > pegar todo > Run.
-- Se puede correr más de una vez sin romper nada.
--
-- La web solo puede ESCRIBIR en estas tablas (igual que "sesiones").
-- Todo se mira desde el panel de Supabase (Table Editor o SQL Editor).
-- ==========================================================

-- ---------- Reportes de preguntas ----------
create table if not exists public.reportes_preguntas (
  id           bigint generated always as identity primary key,
  pregunta_id  text not null check (char_length(pregunta_id) between 1 and 20),
  tema_id      text check (char_length(tema_id) <= 80),
  pregunta     text check (char_length(pregunta) <= 300),   -- copia del enunciado (el id es un hash)
  correcta     text check (char_length(correcta) <= 200),   -- respuesta que el juego daba por correcta
  motivo       text not null check (motivo in ('respuesta_incorrecta','enunciado','opciones','imagen','otro')),
  comentario   text check (char_length(comentario) <= 300),
  apodo        text check (char_length(apodo) <= 20),
  estado       text not null default 'nuevo' check (estado in ('nuevo','revisado','descartado')),
  creado       timestamptz not null default now()
);
create index if not exists reportes_preguntas_id_idx on public.reportes_preguntas (pregunta_id);

-- ---------- Intentos (para la dificultad real) ----------
create table if not exists public.intentos_preguntas (
  id           bigint generated always as identity primary key,
  pregunta_id  text not null check (char_length(pregunta_id) between 1 and 20),
  tema_id      text check (char_length(tema_id) <= 80),
  pregunta     text check (char_length(pregunta) <= 160),
  acierto      boolean not null,
  modo         text not null default 'ronda' check (modo in ('ronda','repaso')),
  creado       timestamptz not null default now()
);
create index if not exists intentos_preguntas_id_idx on public.intentos_preguntas (pregunta_id);

-- ---------- Seguridad: la web solo inserta ----------
alter table public.reportes_preguntas enable row level security;
alter table public.intentos_preguntas enable row level security;

drop policy if exists "web inserta reportes" on public.reportes_preguntas;
create policy "web inserta reportes" on public.reportes_preguntas
  for insert to anon with check (true);

drop policy if exists "web inserta intentos" on public.intentos_preguntas;
create policy "web inserta intentos" on public.intentos_preguntas
  for insert to anon with check (true);

revoke all on public.reportes_preguntas, public.intentos_preguntas from anon;
grant insert on public.reportes_preguntas, public.intentos_preguntas to anon;

-- ---------- Vistas para revisar (solo desde el panel) ----------

-- Qué preguntas fallan más. "repaso" no cuenta: ahí se repiten justo las que ya fallaste.
create or replace view public.dificultad_preguntas as
select
  pregunta_id,
  max(pregunta) as pregunta,
  max(tema_id)  as tema_id,
  count(*)                              as intentos,
  count(*) filter (where not acierto)   as fallos,
  round(100.0 * count(*) filter (where not acierto) / count(*), 1) as pct_fallo
from public.intentos_preguntas
where modo = 'ronda'
group by pregunta_id;

-- Preguntas con reportes nuevos, las más reportadas primero.
create or replace view public.preguntas_reportadas as
select
  pregunta_id,
  max(pregunta)  as pregunta,
  max(correcta)  as correcta,
  max(tema_id)   as tema_id,
  count(*)       as reportes,
  array_agg(distinct motivo) as motivos,
  max(creado)    as ultimo
from public.reportes_preguntas
where estado = 'nuevo'
group by pregunta_id
order by reportes desc, ultimo desc;

-- Las vistas NO son públicas: la web (anon) no puede leerlas.
revoke all on public.dificultad_preguntas, public.preguntas_reportadas from anon, authenticated;

-- ---------- Consultas útiles ----------
-- Preguntas a revisar (muchos fallos con suficientes intentos):
--   select * from dificultad_preguntas where intentos >= 10 order by pct_fallo desc limit 30;
-- Preguntas reportadas:
--   select * from preguntas_reportadas;
-- Detalle y comentarios de una pregunta:
--   select motivo, comentario, apodo, creado from reportes_preguntas where pregunta_id = 'xxxx' order by creado desc;
-- Marcar como revisados los reportes de una pregunta:
--   update reportes_preguntas set estado = 'revisado' where pregunta_id = 'xxxx' and estado = 'nuevo';
