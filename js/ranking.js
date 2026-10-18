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

async function pedir(ruta, opciones = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${ruta}`, {
    ...opciones,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(opciones.headers || {}),
    },
  });
  if (!r.ok) throw new Error(`Ranking: error ${r.status}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

// Arma la query con %20 (y no '+') para los espacios.
const consulta = (q) => q.toString().replace(/\+/g, '%20');

// Limpia el apodo: sin espacios de más y hasta 20 caracteres.
export function limpiarApodo(texto) {
  return String(texto || '').replace(/\s+/g, ' ').trim().slice(0, 20);
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

// Ranking de una materia (o de un tema puntual): la mejor partida de cada apodo, por puntos.
export async function rankingMateria(materia, tema = null, limite = 20) {
  const q = new URLSearchParams({
    select: 'apodo,tema,aciertos,total,puntos,racha_max,creado',
    materia: `eq.${materia}`,
    order: 'puntos.desc,creado.asc',
    limit: '500',
  });
  if (tema) q.set('tema', `eq.${tema}`);
  const filas = (await pedir(`partidas?${consulta(q)}`)) || [];

  const mejores = new Map();   // ya vienen ordenadas: la primera de cada apodo es su mejor
  for (const f of filas) {
    const clave = f.apodo.toLowerCase();
    if (!mejores.has(clave)) mejores.set(clave, f);
  }
  return [...mejores.values()].slice(0, limite);
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
