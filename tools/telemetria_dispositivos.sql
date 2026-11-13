-- ==========================================================
-- TELEMETRÍA DE DISPOSITIVOS · PARCIALITO
--
-- Ejecutar UNA VEZ (o volver a ejecutar sin perder datos) en:
-- Supabase > SQL Editor > New query > Run.
--
-- Crea:
--   public.dispositivos                  Perfil técnico por navegador/dispositivo
--   public.telemetria_dispositivos       Historial técnico y rendimiento
--   public.dispositivos_resumen          Vista resumen por dispositivo
--   public.historial_dispositivos        Visitas + eventos + partidas enlazadas
--   public.rendimiento_dispositivos_diario Métricas diarias de rendimiento
--
-- Privacidad:
--   - No registra IP, GPS, IMEI ni número de serie.
--   - La clave pública puede insertar eventos y llamar al RPC de alta.
--   - La clave pública NO puede leer, editar ni borrar dispositivos/eventos.
--   - Las vistas quedan reservadas al panel/SQL Editor de Supabase.
-- ==========================================================

-- 1) Perfil actual de cada navegador/dispositivo.
create table if not exists public.dispositivos (
  dispositivo_id       uuid primary key,
  fabricante           text,
  modelo               text,
  navegador            text,
  version_navegador    text,
  sistema              text,
  version_plataforma   text,
  arquitectura         text,
  bits                 text,
  tipo_dispositivo     text,
  pantalla             text,
  viewport             text,
  dpr                  numeric(6,2),
  ram_gb               numeric(5,2),
  nucleos              integer,
  conexion             text,
  save_data            boolean,
  instalada            boolean,
  idioma               text,
  zona_horaria         text,
  user_agent           text,
  version_app          text,
  primera_visita       timestamptz not null default now(),
  ultima_visita        timestamptz not null default now()
);

alter table public.dispositivos add column if not exists fabricante text;
alter table public.dispositivos add column if not exists modelo text;
alter table public.dispositivos add column if not exists navegador text;
alter table public.dispositivos add column if not exists version_navegador text;
alter table public.dispositivos add column if not exists sistema text;
alter table public.dispositivos add column if not exists version_plataforma text;
alter table public.dispositivos add column if not exists arquitectura text;
alter table public.dispositivos add column if not exists bits text;
alter table public.dispositivos add column if not exists tipo_dispositivo text;
alter table public.dispositivos add column if not exists pantalla text;
alter table public.dispositivos add column if not exists viewport text;
alter table public.dispositivos add column if not exists dpr numeric(6,2);
alter table public.dispositivos add column if not exists ram_gb numeric(5,2);
alter table public.dispositivos add column if not exists nucleos integer;
alter table public.dispositivos add column if not exists conexion text;
alter table public.dispositivos add column if not exists save_data boolean;
alter table public.dispositivos add column if not exists instalada boolean;
alter table public.dispositivos add column if not exists idioma text;
alter table public.dispositivos add column if not exists zona_horaria text;
alter table public.dispositivos add column if not exists user_agent text;
alter table public.dispositivos add column if not exists version_app text;
alter table public.dispositivos add column if not exists primera_visita timestamptz not null default now();
alter table public.dispositivos add column if not exists ultima_visita timestamptz not null default now();

create unique index if not exists dispositivos_dispositivo_id_uidx
  on public.dispositivos (dispositivo_id);

alter table public.dispositivos enable row level security;

-- La tabla no se puede leer ni modificar desde el cliente. Solo admite altas controladas.
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'dispositivos'
  loop
    execute format('drop policy %I on public.dispositivos', p.policyname);
  end loop;
end
$$;

revoke all on public.dispositivos from anon, authenticated;

grant insert on public.dispositivos to anon, authenticated;
drop policy if exists dispositivos_insert_anon on public.dispositivos;
create policy dispositivos_insert_anon
  on public.dispositivos
  for insert to anon, authenticated
  with check (dispositivo_id is not null);


-- 2) Alta/actualización controlada del perfil.
-- Evita depender de una política UPDATE para el upsert de PostgREST.
create or replace function public.registrar_dispositivo(p_dispositivo jsonb)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_ultima timestamptz;
begin
  if p_dispositivo is null or jsonb_typeof(p_dispositivo) <> 'object' then
    raise exception 'El perfil del dispositivo debe ser un objeto JSON.';
  end if;

  v_id := nullif(btrim(p_dispositivo->>'dispositivo_id'), '')::uuid;
  if v_id is null then
    raise exception 'dispositivo_id ausente o inválido.';
  end if;

  v_ultima := coalesce(
    nullif(p_dispositivo->>'ultima_visita', '')::timestamptz,
    now()
  );

  begin
    insert into public.dispositivos (
      dispositivo_id, fabricante, modelo, navegador, version_navegador,
      sistema, version_plataforma, arquitectura, bits, tipo_dispositivo,
      pantalla, viewport, dpr, ram_gb, nucleos, conexion, save_data,
      instalada, idioma, zona_horaria, user_agent, version_app,
      primera_visita, ultima_visita
    ) values (
      v_id,
      left(nullif(p_dispositivo->>'fabricante',''), 50),
      left(nullif(p_dispositivo->>'modelo',''), 100),
      left(nullif(p_dispositivo->>'navegador',''), 60),
      left(nullif(p_dispositivo->>'version_navegador',''), 30),
      left(nullif(p_dispositivo->>'sistema',''), 60),
      left(nullif(p_dispositivo->>'version_plataforma',''), 30),
      left(nullif(p_dispositivo->>'arquitectura',''), 30),
      left(nullif(p_dispositivo->>'bits',''), 8),
      left(nullif(p_dispositivo->>'tipo_dispositivo',''), 20),
      left(nullif(p_dispositivo->>'pantalla',''), 20),
      left(nullif(p_dispositivo->>'viewport',''), 20),
      case when coalesce(p_dispositivo->>'dpr','') ~ '^[0-9]+(\.[0-9]+)?$'
        then (p_dispositivo->>'dpr')::numeric(6,2) else null end,
      case when coalesce(p_dispositivo->>'ram_gb','') ~ '^[0-9]+(\.[0-9]+)?$'
        then (p_dispositivo->>'ram_gb')::numeric(5,2) else null end,
      case when coalesce(p_dispositivo->>'nucleos','') ~ '^[0-9]+$'
        then (p_dispositivo->>'nucleos')::integer else null end,
      left(nullif(p_dispositivo->>'conexion',''), 20),
      case when p_dispositivo->>'save_data' in ('true','false')
        then (p_dispositivo->>'save_data')::boolean else null end,
      case when p_dispositivo->>'instalada' in ('true','false')
        then (p_dispositivo->>'instalada')::boolean else null end,
      left(nullif(p_dispositivo->>'idioma',''), 20),
      left(nullif(p_dispositivo->>'zona_horaria',''), 60),
      left(nullif(p_dispositivo->>'user_agent',''), 300),
      left(nullif(p_dispositivo->>'version_app',''), 40),
      now(),
      v_ultima
    );
  exception
    when unique_violation then
      null;
  end;
end;
$$;

revoke all on function public.registrar_dispositivo(jsonb) from public;
grant execute on function public.registrar_dispositivo(jsonb) to anon, authenticated;

-- 3) Historial técnico: una fila por carga, vista, error o métrica.
create table if not exists public.telemetria_dispositivos (
  id              bigint generated always as identity primary key,
  dispositivo_id  uuid not null references public.dispositivos(dispositivo_id) on delete cascade,
  evento          text not null,
  ruta            text,
  version_app     text,
  duracion_ms     integer,
  recurso         text,
  codigo          integer,
  datos           jsonb not null default '{}'::jsonb,
  creado          timestamptz not null default now()
);

create index if not exists telemetria_dispositivo_fecha_idx
  on public.telemetria_dispositivos (dispositivo_id, creado desc);
create index if not exists telemetria_evento_fecha_idx
  on public.telemetria_dispositivos (evento, creado desc);
create index if not exists telemetria_ruta_fecha_idx
  on public.telemetria_dispositivos (ruta, creado desc);

alter table public.telemetria_dispositivos enable row level security;
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'telemetria_dispositivos'
  loop
    execute format('drop policy %I on public.telemetria_dispositivos', p.policyname);
  end loop;
end
$$;
create policy telemetria_dispositivos_insert_anon
  on public.telemetria_dispositivos
  for insert to anon, authenticated
  with check (
    dispositivo_id is not null
    and char_length(evento) between 1 and 50
  );
grant insert on public.telemetria_dispositivos to anon, authenticated;

-- 4) Visitas: enlazar el registro histórico con el mismo dispositivo.
-- Si la tabla ya existe, se conservan sus filas y solo se agregan columnas.
create table if not exists public.visitas (
  id                 bigint generated always as identity primary key,
  visitante          text not null,
  dispositivo_id     uuid,
  apodo              text,
  evento             text not null default 'entrada',
  navegador          text,
  sistema            text,
  tipo_dispositivo   text,
  pantalla           text,
  idioma             text,
  zona_horaria       text,
  user_agent         text,
  fabricante         text,
  modelo             text,
  creado             timestamptz not null default now()
);

alter table public.visitas add column if not exists dispositivo_id uuid;
alter table public.visitas add column if not exists visitante text;
alter table public.visitas add column if not exists apodo text;
alter table public.visitas add column if not exists evento text default 'entrada';
alter table public.visitas add column if not exists navegador text;
alter table public.visitas add column if not exists sistema text;
alter table public.visitas add column if not exists tipo_dispositivo text;
alter table public.visitas add column if not exists pantalla text;
alter table public.visitas add column if not exists idioma text;
alter table public.visitas add column if not exists zona_horaria text;
alter table public.visitas add column if not exists user_agent text;
alter table public.visitas add column if not exists fabricante text;
alter table public.visitas add column if not exists modelo text;
alter table public.visitas add column if not exists creado timestamptz not null default now();

create index if not exists visitas_dispositivo_fecha_idx
  on public.visitas (dispositivo_id, creado desc);
create index if not exists visitas_visitante_fecha_idx
  on public.visitas (visitante, creado desc);

-- Recuperar el historial anterior: antes de enlazar dispositivo_id, las visitas
-- ya guardaban un ID seudónimo estable en visitante. Se reutiliza ese mismo ID
-- para crear el perfil retroactivo y asociar las visitas antiguas.
update public.visitas
set dispositivo_id = visitante::uuid
where dispositivo_id is null
  and visitante ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

insert into public.dispositivos (
  dispositivo_id, fabricante, modelo, navegador, sistema, tipo_dispositivo,
  pantalla, idioma, zona_horaria, user_agent, primera_visita, ultima_visita
)
select
  v.visitante::uuid,
  (array_agg(nullif(v.fabricante,'') order by v.creado desc)
    filter (where nullif(v.fabricante,'') is not null))[1],
  (array_agg(nullif(v.modelo,'') order by v.creado desc)
    filter (where nullif(v.modelo,'') is not null))[1],
  (array_agg(nullif(v.navegador,'') order by v.creado desc))[1],
  (array_agg(nullif(v.sistema,'') order by v.creado desc))[1],
  (array_agg(nullif(v.tipo_dispositivo,'') order by v.creado desc))[1],
  (array_agg(nullif(v.pantalla,'') order by v.creado desc))[1],
  (array_agg(nullif(v.idioma,'') order by v.creado desc))[1],
  (array_agg(nullif(v.zona_horaria,'') order by v.creado desc))[1],
  (array_agg(nullif(v.user_agent,'') order by v.creado desc))[1],
  min(v.creado),
  max(v.creado)
from public.visitas v
where v.visitante ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
group by v.visitante::uuid
on conflict (dispositivo_id) do update set
  fabricante = coalesce(dispositivos.fabricante, excluded.fabricante),
  modelo = coalesce(dispositivos.modelo, excluded.modelo),
  navegador = coalesce(dispositivos.navegador, excluded.navegador),
  sistema = coalesce(dispositivos.sistema, excluded.sistema),
  tipo_dispositivo = coalesce(dispositivos.tipo_dispositivo, excluded.tipo_dispositivo),
  pantalla = coalesce(dispositivos.pantalla, excluded.pantalla),
  idioma = coalesce(dispositivos.idioma, excluded.idioma),
  zona_horaria = coalesce(dispositivos.zona_horaria, excluded.zona_horaria),
  user_agent = coalesce(dispositivos.user_agent, excluded.user_agent),
  primera_visita = least(dispositivos.primera_visita, excluded.primera_visita),
  ultima_visita = greatest(dispositivos.ultima_visita, excluded.ultima_visita);

-- Vincular visitas históricas con el perfil técnico del mismo navegador.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'visitas_dispositivo_id_fkey'
      and conrelid = 'public.visitas'::regclass
  ) then
    alter table public.visitas
      add constraint visitas_dispositivo_id_fkey
      foreign key (dispositivo_id)
      references public.dispositivos(dispositivo_id)
      on delete set null;
  end if;
end
$$;
alter table public.visitas enable row level security;
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'visitas'
  loop
    execute format('drop policy %I on public.visitas', p.policyname);
  end loop;
end
$$;
create policy visitas_insert_anon
  on public.visitas
  for insert to anon, authenticated
  with check (
    visitante is not null
    and char_length(visitante) between 10 and 100
    and evento in ('entrada','apodo')
    and (apodo is null or char_length(apodo) <= 20)
  );
grant insert on public.visitas to anon, authenticated;

-- 5) Enlazar también partidas finalizadas al dispositivo que las jugó.
create table if not exists public.sesiones (
  id                bigint generated always as identity primary key,
  apodo             text not null check (char_length(apodo) between 1 and 20),
  modo              text not null check (modo in ('ronda','repaso')),
  materia           text not null default '' check (char_length(materia) <= 80),
  tema              text not null default '' check (char_length(tema) <= 80),
  aciertos          integer not null check (aciertos >= 0),
  total             integer not null check (total between 1 and 1000),
  puntos            integer not null check (puntos >= 0),
  racha_max         integer not null default 0 check (racha_max >= 0),
  navegador         text,
  sistema           text,
  tipo_dispositivo  text,
  pantalla          text,
  idioma            text,
  zona_horaria      text,
  user_agent        text,
  dispositivo_id    uuid,
  creado            timestamptz not null default now(),
  check (aciertos <= total)
);
alter table public.sesiones add column if not exists dispositivo_id uuid;
create index if not exists sesiones_dispositivo_fecha_idx
  on public.sesiones (dispositivo_id, creado desc);

alter table public.sesiones enable row level security;
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'sesiones'
  loop
    execute format('drop policy %I on public.sesiones', p.policyname);
  end loop;
end
$$;
create policy sesiones_insert_anon
  on public.sesiones
  for insert to anon, authenticated
  with check (
    char_length(apodo) between 1 and 20
    and modo in ('ronda','repaso')
    and total between 1 and 1000
    and aciertos between 0 and total
  );
grant insert on public.sesiones to anon, authenticated;

-- Dar permiso de uso únicamente a las secuencias de identidad necesarias
-- para que los INSERT del navegador no fallen por permisos de secuencia.
do $$
declare v_seq text;
begin
  v_seq := pg_get_serial_sequence('public.telemetria_dispositivos', 'id');
  if v_seq is not null then
    execute format('grant usage, select on sequence %s to anon, authenticated', v_seq);
  end if;
  v_seq := pg_get_serial_sequence('public.visitas', 'id');
  if v_seq is not null then
    execute format('grant usage, select on sequence %s to anon, authenticated', v_seq);
  end if;
  v_seq := pg_get_serial_sequence('public.sesiones', 'id');
  if v_seq is not null then
    execute format('grant usage, select on sequence %s to anon, authenticated', v_seq);
  end if;
end
$$;

-- 6) Vista: un renglón por dispositivo con indicadores agregados.
create or replace view public.dispositivos_resumen as
select
  d.dispositivo_id,
  d.fabricante,
  d.modelo,
  d.tipo_dispositivo,
  d.sistema,
  d.navegador,
  d.version_navegador,
  d.pantalla,
  d.viewport,
  d.dpr,
  d.ram_gb,
  d.nucleos,
  d.conexion,
  d.save_data,
  d.instalada,
  d.idioma,
  d.zona_horaria,
  d.version_app,
  d.primera_visita,
  greatest(d.ultima_visita, coalesce(e.ultimo_evento, d.ultima_visita)) as ultima_visita,
  coalesce(v.total_visitas, 0) as total_visitas,
  coalesce(s.total_sesiones, 0) as total_sesiones,
  coalesce(e.total_eventos, 0) as total_eventos,
  coalesce(e.cargas_pagina, 0) as cargas_pagina,
  e.promedio_carga_pagina_ms,
  e.p95_carga_pagina_ms,
  coalesce(e.cargas_json, 0) as cargas_json,
  coalesce(e.errores_json, 0) as errores_json,
  coalesce(e.errores_tecnicos, 0) as errores_tecnicos,
  e.lcp_promedio_ms,
  e.cls_promedio,
  e.inp_promedio_ms,
  e.ultimo_evento
from public.dispositivos d
left join lateral (
  select
    count(*) as total_visitas
  from public.visitas x
  where x.dispositivo_id = d.dispositivo_id
) v on true
left join lateral (
  select
    count(*) as total_sesiones
  from public.sesiones x
  where x.dispositivo_id = d.dispositivo_id
) s on true
left join lateral (
  select
    count(*) as total_eventos,
    count(*) filter (where t.evento = 'page_load') as cargas_pagina,
    round(avg(t.duracion_ms) filter (where t.evento = 'page_load'), 1) as promedio_carga_pagina_ms,
    round((percentile_cont(0.95) within group (order by t.duracion_ms)
      filter (where t.evento = 'page_load'))::numeric, 1) as p95_carga_pagina_ms,
    count(*) filter (where t.evento = 'json_load') as cargas_json,
    count(*) filter (where t.evento = 'json_error') as errores_json,
    count(*) filter (where t.evento in ('fetch_error','resource_error','js_error','promise_error','json_error')) as errores_tecnicos,
    round(avg(nullif(t.datos->>'lcp_ms','')::numeric)
      filter (where t.evento = 'web_vitals'), 1) as lcp_promedio_ms,
    round(avg(nullif(t.datos->>'cls','')::numeric)
      filter (where t.evento = 'web_vitals'), 4) as cls_promedio,
    round(avg(nullif(t.datos->>'inp_ms','')::numeric)
      filter (where t.evento = 'web_vitals'), 1) as inp_promedio_ms,
    max(t.creado) as ultimo_evento
  from public.telemetria_dispositivos t
  where t.dispositivo_id = d.dispositivo_id
) e on true;

-- 7) Vista: línea de tiempo de visitas, actividad técnica y partidas por dispositivo.
drop view if exists public.historial_dispositivos;
create view public.historial_dispositivos as
select
  ('evento:' || t.id::text) as registro_id,
  t.dispositivo_id,
  t.creado,
  'telemetria'::text as fuente,
  t.evento as actividad,
  t.ruta,
  t.duracion_ms,
  t.recurso,
  t.codigo,
  t.datos as detalle
from public.telemetria_dispositivos t

union all

select
  ('visita:' || v.id::text) as registro_id,
  v.dispositivo_id,
  v.creado,
  'visita'::text as fuente,
  v.evento as actividad,
  null::text as ruta,
  null::integer as duracion_ms,
  null::text as recurso,
  null::integer as codigo,
  jsonb_strip_nulls(jsonb_build_object(
    'visitante', v.visitante,
    'apodo', v.apodo,
    'fabricante', v.fabricante,
    'modelo', v.modelo,
    'navegador', v.navegador,
    'sistema', v.sistema,
    'tipo_dispositivo', v.tipo_dispositivo
  )) as detalle
from public.visitas v
where v.dispositivo_id is not null

union all

select
  ('sesion:' || s.id::text) as registro_id,
  s.dispositivo_id,
  s.creado,
  'sesion'::text as fuente,
  ('partida_' || s.modo) as actividad,
  null::text as ruta,
  null::integer as duracion_ms,
  null::text as recurso,
  null::integer as codigo,
  jsonb_strip_nulls(jsonb_build_object(
    'apodo', s.apodo,
    'materia', s.materia,
    'tema', s.tema,
    'aciertos', s.aciertos,
    'total', s.total,
    'puntos', s.puntos,
    'racha_max', s.racha_max
  )) as detalle
from public.sesiones s
where s.dispositivo_id is not null;

-- 8) Vista: evolución diaria de cargas y errores por dispositivo.
create or replace view public.rendimiento_dispositivos_diario as
select
  date_trunc('day', t.creado) as dia,
  t.dispositivo_id,
  count(*) filter (where t.evento = 'page_load') as cargas_pagina,
  round(avg(t.duracion_ms) filter (where t.evento = 'page_load'), 1) as promedio_carga_ms,
  round((percentile_cont(0.95) within group (order by t.duracion_ms)
    filter (where t.evento = 'page_load'))::numeric, 1) as p95_carga_ms,
  count(*) filter (where t.evento = 'json_load') as cargas_json,
  count(*) filter (where t.evento = 'json_error') as errores_json,
  count(*) filter (where t.evento in ('fetch_error','resource_error','js_error','promise_error','json_error')) as errores_tecnicos,
  round(avg(nullif(t.datos->>'lcp_ms','')::numeric)
    filter (where t.evento = 'web_vitals'), 1) as lcp_promedio_ms,
  round(avg(nullif(t.datos->>'cls','')::numeric)
    filter (where t.evento = 'web_vitals'), 4) as cls_promedio,
  round(avg(nullif(t.datos->>'inp_ms','')::numeric)
    filter (where t.evento = 'web_vitals'), 1) as inp_promedio_ms
from public.telemetria_dispositivos t
group by date_trunc('day', t.creado), t.dispositivo_id;

-- Las vistas son para el panel/SQL Editor, no para el navegador público.
revoke all on public.dispositivos_resumen from anon, authenticated;
revoke all on public.historial_dispositivos from anon, authenticated;
revoke all on public.rendimiento_dispositivos_diario from anon, authenticated;

comment on table public.dispositivos is
  'Perfil seudónimo por navegador/dispositivo; sin IP, GPS ni identificadores físicos.';
comment on table public.telemetria_dispositivos is
  'Historial técnico de carga, navegación, errores y métricas web vitals.';
comment on view public.dispositivos_resumen is
  'Resumen de dispositivos con visitas, partidas, cargas, errores y Web Vitals.';
comment on view public.historial_dispositivos is
  'Línea de tiempo cronológica de actividad enlazada a cada dispositivo.';
comment on view public.rendimiento_dispositivos_diario is
  'Métricas diarias de rendimiento por dispositivo.';


-- Recargar el esquema de PostgREST para exponer el RPC y las columnas nuevas.
notify pgrst, 'reload schema';