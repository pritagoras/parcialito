// ==========================================================
// ranking.js: ranking público e historial de partidas con apodos.
// Usa Supabase (base de datos gratuita) a través de su API REST,
// sin librerías externas. Mientras no cargues las dos claves de
// abajo, el ranking queda desactivado y el juego anda igual.
//
// Cómo activarlo: ver tools/ranking_supabase.sql (pasos al principio).
// ==========================================================

// Supabase > Project Settings > API
const SUPABASE_URL = 'https://tnpcvmnwuhsxdxvwxvlh.supabase.co/rest/v1/';        // ej: 'https://abcdefgh.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_UXVhm9cko_YZm3GrAUBRyg_YSIfM03O';   // la clave "anon" / "publishable" (es pública por diseño)

export const rankingActivo = () =>
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;

// Acepta la URL con o sin "/rest/v1/" al final y con o sin barra final.
const BASE = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

async function pedir(ruta, opciones = {}) {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    ...(opciones.headers || {}),
  };
  // Las claves nuevas (sb_publishable_...) NO son JWT y no van en Authorization;
  // solo las claves viejas "anon" (empiezan con eyJ) se mandan también ahí.
  if (SUPABASE_ANON_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;

  const r = await fetch(`${BASE}/rest/v1/${ruta}`, { ...opciones, headers });
  if (!r.ok) {
    // El detalle queda en la consola del navegador (F12) para poder diagnosticar.
    console.error('[Ranking]', r.status, await r.text().catch(() => ''));
    throw new Error(`Ranking: error ${r.status}`);
  }
  return r.status === 204 ? null : r.json().catch(() => null);
}

// Arma la query con %20 (y no '+') para los espacios.
const consulta = (q) => q.toString().replace(/\+/g, '%20');

// Limpia el apodo: sin espacios de más y hasta 20 caracteres.
export function limpiarApodo(texto) {
  return String(texto || '').replace(/\s+/g, ' ').trim().slice(0, 20);
}

// Telemetría privada: upsert de perfil y escritura de eventos, sin apodos.
export async function registrarDispositivo(fila) {
  await pedir('dispositivos?on_conflict=dispositivo_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(fila),
  });
}

export async function registrarTelemetria(filas) {
  if (!filas?.length) return;
  await pedir('telemetria_dispositivos', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(filas),
  });
}

// Guarda una partida terminada.
export async function guardarPartida({ apodo, materia, tema, aciertos, total, puntos, rachaMax }) {
  await pedir('partidas', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      apodo, materia, tema, aciertos, total, puntos,
      racha_max: rachaMax,
    }),
  });
}

// Registra una ronda terminada junto con los datos del dispositivo.
// Va a una tabla que la web solo puede escribir (no leer): se ve desde el panel de Supabase.
export async function registrarSesion(fila) {
  await pedir('sesiones', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  });
}

// Guarda el progreso de uno o varios temas (una fila nueva por tema; nunca se pisa nada).
export async function guardarProgreso(filas) {
  if (!filas.length) return;
  await pedir('progreso_temas', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(filas),
  });
}

// Último progreso conocido de un apodo, un registro por tema.
export async function progresoDe(apodo) {
  const q = new URLSearchParams({
    select: 'materia,tema_id,tema,dominadas,total,mejor_precision,creado',
    apodo: `eq.${apodo}`,
    order: 'creado.desc',
    limit: '500',
  });
  const filas = (await pedir(`progreso_temas?${consulta(q)}`)) || [];
  const ultimos = new Map();   // vienen de la más nueva a la más vieja
  for (const f of filas) if (!ultimos.has(f.tema_id)) ultimos.set(f.tema_id, f);
  return [...ultimos.values()].sort((a, b) => (a.materia + a.tema).localeCompare(b.materia + b.tema));
}

// Ranking de una materia (o de un tema puntual): la mejor partida de cada apodo, por puntos.
export async function rankingMateria(materia, tema = null, limite = 20) {
  const q = new URLSearchParams({
    select: 'apodo,tema,aciertos,total,puntos,racha_max,creado',
    materia: `eq.${materia}`,
    order: 'puntos.desc,creado.asc',
    limit: '500',
  });
  if (tema) q.set('tema', `eq.${tema}`);
  const qp = new URLSearchParams({
    select: 'apodo,materia,tema_id,tema,dominadas,total,creado',
    materia: `eq.${materia}`,
    order: 'creado.desc',
    limit: '5000',
  });
  const [filas, progreso] = await Promise.all([
    pedir(`partidas?${consulta(q)}`),
    pedir(`progreso_temas?${consulta(qp)}`),
  ]);
  const mejores = new Map();
  for (const f of (filas || [])) {
    const clave = f.apodo.toLocaleLowerCase('es');
    if (!mejores.has(clave)) mejores.set(clave, { ...f, dominioTemas: [] });
  }
  const porJugador = new Map();
  for (const p of (progreso || [])) {
    if (tema && p.tema !== tema) continue;
    const clave = String(p.apodo || '').toLocaleLowerCase('es');
    if (!clave) continue;
    if (!porJugador.has(clave)) porJugador.set(clave, new Map());
    const temas = porJugador.get(clave);
    const idTema = p.tema_id || p.tema;
    if (!temas.has(idTema)) temas.set(idTema, {
      tema: p.tema, dominadas: Number(p.dominadas) || 0, total: Number(p.total) || 0,
    });
    if (!mejores.has(clave)) mejores.set(clave, {
      apodo: p.apodo, tema: p.tema, aciertos: 0, total: 0,
      puntos: 0, racha_max: 0, creado: p.creado, dominioTemas: [],
    });
  }
  for (const [clave, f] of mejores) {
    f.dominioTemas = [...(porJugador.get(clave)?.values() || [])]
      .sort((a, b) => a.tema.localeCompare(b.tema, 'es'));
  }
  return [...mejores.values()].slice(0, limite);
}

// Lee las tablas públicas por bloques para superar el límite de filas por respuesta.
async function leerFilasPublicas(ruta, maxFilas = 20000) {
  const bloque = 1000;
  const filas = [];
  for (let desde = 0; desde < maxFilas; desde += bloque) {
    const pagina = (await pedir(`${ruta}&limit=${bloque}&offset=${desde}`)) || [];
    filas.push(...pagina);
    if (pagina.length < bloque) break;
  }
  return filas;
}

// Solo consulta apodos, partidas y progreso temático. No lee sesiones privadas
// ni datos del dispositivo.
export async function jugadoresPublicos() {
  const qProgreso = new URLSearchParams({
    select: 'apodo,materia,tema_id,tema,dominadas,total,mejor_precision,creado',
    order: 'creado.desc',
  });
  const qPartidas = new URLSearchParams({
    select: 'apodo,materia,tema,aciertos,total,puntos,creado',
    order: 'creado.desc',
  });
  const [progreso, partidas] = await Promise.all([
    leerFilasPublicas(`progreso_temas?${consulta(qProgreso)}`),
    leerFilasPublicas(`partidas?${consulta(qPartidas)}`),
  ]);
  return { progreso, partidas };
}

// Historial de un apodo: sus partidas, de la más nueva a la más vieja.
export async function historialDe(apodo, limite = 50) {
  const q = new URLSearchParams({
    select: 'materia,tema,aciertos,total,puntos,racha_max,creado',
    apodo: `eq.${apodo}`,
    order: 'creado.desc',
    limit: String(limite),
  });
  return (await pedir(`partidas?${consulta(q)}`)) || [];
}

// Respuestas de una ronda (solo acierto/fallo por pregunta, sin apodo).
// Sirven para calcular qué preguntas fallan más entre todos los jugadores.
export async function registrarIntentos(filas) {
  if (!filas.length) return;
  await pedir('intentos_preguntas', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(filas),
  });
}

// Reporte de una pregunta mal armada o con la respuesta equivocada.
// La web solo puede escribir; se revisa desde el panel de Supabase.
export async function enviarReporte(fila) {
  const opciones = {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  };
  try {
    await pedir('reportes_preguntas', opciones);
  } catch (error) {
    // Compatibilidad temporal: si Supabase todavía no tiene las columnas
    // de procedencia, reintentar con los campos originales para no perder el reporte.
    const { archivo_json, pregunta_numero, pregunta_hash, ...filaCompatible } = fila;
    if (!('archivo_json' in fila) && !('pregunta_numero' in fila) && !('pregunta_hash' in fila)) throw error;
    await pedir('reportes_preguntas', {
      ...opciones,
      body: JSON.stringify(filaCompatible),
    });
  }
}

 // Comentarios públicos: se pueden leer y agregar desde la web.
export async function comentariosPublicos() {
  const q = new URLSearchParams({ select: 'apodo,comentario,creado', order: 'creado.desc', limit: '50' });
  return (await pedir(`comentarios_publicos?${consulta(q)}`)) || [];
}

export async function guardarComentarioPublico(fila) {
  await pedir('comentarios_publicos', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  });
}

// Reportes generales privados: la web solo tiene permiso de insertar, nunca de leer.
export async function enviarReporteGeneral(fila) {
  await pedir('reportes_generales', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  });
}

// Estadística de dificultad de un grupo de preguntas (de todos los jugadores).
// Devuelve [{ pregunta_id, intentos, fallos }] solo para las que ya tienen suficientes respuestas.
export async function dificultadDe(ids) {
  if (!ids.length) return [];
  return (await pedir('rpc/dificultad_publica', { method: 'POST', body: JSON.stringify({ ids }) })) || [];
}

// Las preguntas que más se fallan, de más a menos difíciles.
export async function preguntasDificiles(minimo = 10, limite = 40) {
  return (await pedir('rpc/preguntas_dificiles', { method: 'POST', body: JSON.stringify({ minimo, limite }) })) || [];
}

// Registra una visita (entrada a la página) o la identificación de un visitante con su apodo.
// Va a una tabla que la web solo puede escribir (no leer): se ve desde el panel de Supabase.
export async function registrarVisita(fila) {
  await pedir('visitas', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(fila),
  });
}
