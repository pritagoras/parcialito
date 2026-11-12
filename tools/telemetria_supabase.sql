-- ==========================================================
-- TELEMETRÍA DE DISPOSITIVOS PARA PARCIALITO
-- Ejecutar una sola vez (o volver a ejecutar: es idempotente).
-- Crea un perfil técnico seudónimo por navegador/dispositivo y un historial
-- separado de eventos de rendimiento/errores/uso.
-- No guarda apodos, IP, GPS, IMEI ni número de serie.
-- ==========================================================

create table if not exists public.dispositivos (
  dispositivo_id uuid primary key,
  fabricante text check (fabricante is null or char_length(fabricante) <= 50),
  modelo text check (modelo is null or char_length(modelo) <= 100),
  tipo_dispositivo text check (tipo_dispositivo is null or char_length(tipo_dispositivo) <= 20),
  sistema text check (sistema is null or char_length(sistema) <= 60),
  version_plataforma text check (version_plataforma is null or char_length(version_plataforma) <= 30),
  navegador text check (navegador is null or char_length(navegador) <= 60),
  version_navegador text check (version_navegador is null or char_length(version_navegador) <= 30),
  arquitectura text check (arquitectura is null or char_length(arquitectura) <= 30),
  bits text check (bits is null or char_length(bits) <= 8),
  pantalla text check (pantalla is null or char_length(pantalla) <= 20),
  viewport text check (viewport is null or char_length(viewport) <= 20),
  dpr numeric(5,2),
  ram_gb numeric(4,1),
  nucleos integer,
  conexion text check (conexion is null or char_length(conexion) <= 20),
  save_data boolean,
  idioma text check (idioma is null or char_length(idioma) <= 20),
  zona_horaria text check (zona_horaria is null or char_length(zona_horaria) <= 60),
  instalada boolean,
  user_agent text check (user_agent is null or char_length(user_agent) <= 300),
  version_app text check (version_app is null or char_length(version_app) <= 40),
  primera_visita timestamptz not null default now(),
  ultima_visita timestamptz not null default now()
);

create index if not exists dispositivos_modelo_idx
  on public.dispositivos (fabricante, modelo);
create index if not exists dispositivos_ultima_visita_idx
  on public.dispositivos (ultima_visita desc);

grant insert, update on public.dispositivos to anon;

alter table public.dispositivos enable row level security;
drop policy if exists "telemetria crear perfil dispositivo" on public.dispositivos;
create policy "telemetria crear perfil dispositivo" on public.dispositivos
  for insert to anon with check (true);
drop policy if exists "telemetria actualizar perfil dispositivo" on public.dispositivos;
create policy "telemetria actualizar perfil dispositivo" on public.dispositivos
  for update to anon using (true) with check (true);

create table if not exists public.telemetria_dispositivos (
  id bigint generated always as identity primary key,
  dispositivo_id uuid not null references public.dispositivos(dispositivo_id) on delete cascade,
  evento text not null check (char_length(evento) between 1 and 50),
  duracion_ms integer check (duracion_ms is null or duracion_ms between 0 and 600000),
  ruta text check (ruta is null or char_length(ruta) <= 160),
  recurso text check (recurso is null or char_length(recurso) <= 180),
  codigo integer,
  version_app text check (version_app is null or char_length(version_app) <= 40),
  datos jsonb not null default '{}'::jsonb,
  creado timestamptz not null default now()
);

create index if not exists telemetria_dispositivo_fecha_idx
  on public.telemetria_dispositivos (dispositivo_id, creado desc);
create index if not exists telemetria_evento_fecha_idx
  on public.telemetria_dispositivos (evento, creado desc);

grant insert on public.telemetria_dispositivos to anon;
grant usage, select on sequence public.telemetria_dispositivos_id_seq to anon;

alter table public.telemetria_dispositivos enable row level security;
drop policy if exists "telemetria insertar eventos" on public.telemetria_dispositivos;
create policy "telemetria insertar eventos" on public.telemetria_dispositivos
  for insert to anon with check (true);

-- Vistas de consulta para el propietario desde el SQL Editor.
-- No se exponen a anon/authenticated mediante la API REST.
create or replace view public.resumen_dispositivos
with (security_invoker = true) as
select
  d.*,
  count(t.id) filter (where t.evento = 'app_open') as visitas,
  round(avg(t.duracion_ms) filter (where t.evento = 'page_load')) as carga_promedio_ms,
  count(t.id) filter (where t.evento in ('js_error', 'promise_error', 'fetch_error', 'json_error', 'resource_error')) as errores,
  max(t.creado) as ultimo_evento
from public.dispositivos d
left join public.telemetria_dispositivos t on t.dispositivo_id = d.dispositivo_id
group by d.dispositivo_id;

create or replace view public.historial_dispositivos
with (security_invoker = true) as
select
  t.id, t.dispositivo_id, d.fabricante, d.modelo, t.evento,
  t.duracion_ms, t.ruta, t.recurso, t.codigo, t.version_app,
  t.datos, t.creado
from public.telemetria_dispositivos t
join public.dispositivos d on d.dispositivo_id = t.dispositivo_id;

revoke all on public.resumen_dispositivos from anon, authenticated;
revoke all on public.historial_dispositivos from anon, authenticated;
grant select on public.resumen_dispositivos to postgres;
grant select on public.historial_dispositivos to postgres;

-- Consultas rápidas:
-- select * from public.resumen_dispositivos order by ultima_visita desc;
-- select * from public.historial_dispositivos
--   where dispositivo_id = 'PEGAR-UUID-AQUI' order by creado desc;
