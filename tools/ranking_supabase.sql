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

-- ----------------------------------------------------------
-- Registro privado de rondas con datos del dispositivo.
-- La web solo puede AGREGAR filas: no hay regla de lectura, así que
-- con la clave pública nadie puede ver esta tabla. La ves vos desde
-- el panel de Supabase (Table Editor > sesiones).
-- ----------------------------------------------------------
create table if not exists sesiones (
  id                bigint generated always as identity primary key,
  apodo             text        not null check (char_length(apodo) between 1 and 20),
  modo              text        not null check (modo in ('ronda', 'repaso')),
  materia           text        not null default '' check (char_length(materia) <= 80),
  tema              text        not null default '' check (char_length(tema) <= 80),
  aciertos          int         not null check (aciertos >= 0),
  total             int         not null check (total between 1 and 1000),
  puntos            int         not null check (puntos >= 0),
  racha_max         int         not null default 0 check (racha_max >= 0),
  navegador         text        check (char_length(navegador) <= 60),
  sistema           text        check (char_length(sistema) <= 60),
  tipo_dispositivo  text        check (char_length(tipo_dispositivo) <= 20),
  pantalla          text        check (char_length(pantalla) <= 20),
  idioma            text        check (char_length(idioma) <= 20),
  zona_horaria      text        check (char_length(zona_horaria) <= 60),
  user_agent        text        check (char_length(user_agent) <= 300),
  creado            timestamptz not null default now(),
  check (aciertos <= total)
);

create index if not exists sesiones_apodo_idx on sesiones (apodo, creado desc);

alter table sesiones enable row level security;

drop policy if exists "insertar sesiones" on sesiones;
create policy "insertar sesiones" on sesiones
  for insert to anon with check (true);


-- ----------------------------------------------------------
-- Participación desde la página principal.
-- Los comentarios son públicos; los reportes generales son privados.
-- RLS: cualquiera puede leer/agregar comentarios, pero no editarlos ni borrarlos.
-- Los reportes solo admiten INSERT desde la web; no existe política de lectura.
-- ----------------------------------------------------------
create table if not exists comentarios_publicos (
  id          bigint generated always as identity primary key,
  apodo       text not null check (char_length(apodo) between 1 and 20),
  comentario  text not null check (char_length(comentario) between 1 and 500),
  creado      timestamptz not null default now()
);
create index if not exists comentarios_publicos_creado_idx on comentarios_publicos (creado desc);
alter table comentarios_publicos enable row level security;
drop policy if exists "lectura comentarios publicos" on comentarios_publicos;
create policy "lectura comentarios publicos" on comentarios_publicos
  for select to anon using (true);
drop policy if exists "insertar comentarios publicos" on comentarios_publicos;
create policy "insertar comentarios publicos" on comentarios_publicos
  for insert to anon with check (
    char_length(trim(apodo)) between 1 and 20
    and char_length(trim(comentario)) between 1 and 500
  );

create table if not exists reportes_generales (
  id          bigint generated always as identity primary key,
  motivo      text not null check (motivo in ('error', 'sugerencia', 'tecnico', 'otro')),
  apodo       text check (apodo is null or char_length(apodo) <= 20),
  comentario  text not null check (char_length(comentario) between 1 and 1000),
  pagina      text not null default '/' check (char_length(pagina) <= 200),
  creado      timestamptz not null default now()
);
alter table reportes_generales enable row level security;
drop policy if exists "insertar reportes generales" on reportes_generales;
create policy "insertar reportes generales" on reportes_generales
  for insert to anon with check (
    motivo in ('error', 'sugerencia', 'tecnico', 'otro')
    and (apodo is null or char_length(apodo) <= 20)
    and char_length(trim(comentario)) between 1 and 1000
    and char_length(pagina) <= 200
  );
