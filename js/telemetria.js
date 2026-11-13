// ==========================================================
// telemetria.js: perfil técnico seudónimo del dispositivo + diagnóstico.
// Los eventos no contienen apodo, respuestas ni texto escrito.
// ==========================================================
import { rankingActivo, registrarDispositivo, registrarTelemetria } from './ranking.js?v=20261112-dispositivos3';
import { idDispositivo, perfilDispositivo } from './dispositivo.js?v=20261112-dispositivos3';

const VERSION_APP = '2026.11.12-telemetria1';
const cola = [];
let dispositivoId = null;
let temporizador = null;
let vitals = { lcp: null, cls: 0, inp: null };
let vistaActual = '';

function rutaActual() {
  return String(location.pathname || '/').slice(0, 160);
}

function encolar(evento, extra = {}) {
  if (!dispositivoId || !rankingActivo()) return;
  cola.push({
    dispositivo_id: dispositivoId,
    evento,
    ruta: rutaActual(),
    version_app: VERSION_APP,
    ...extra,
  });
  if (cola.length >= 8) vaciar();
  else if (!temporizador) temporizador = setTimeout(vaciar, 12000);
}

async function vaciar() {
  if (temporizador) clearTimeout(temporizador);
  temporizador = null;
  if (!cola.length || !rankingActivo()) return;
  const lote = cola.splice(0, 20);
  try {
    await registrarTelemetria(lote);
  } catch (error) {
    console.error('[Telemetría] No se pudo guardar el lote de eventos.', error);
    if (cola.length < 20) cola.unshift(...lote);
    if (!temporizador) temporizador = setTimeout(vaciar, 15000);
  }
}

function observarRendimiento() {
  const registrarCarga = () => {
    try {
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return;
      const carga = Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd || nav.duration);
      encolar('page_load', {
        duracion_ms: Number.isFinite(carga) && carga > 0 ? carga : null,
        datos: {
          dom_content_loaded_ms: Math.round(nav.domContentLoadedEventEnd || 0),
          transfer_size: nav.transferSize || null,
        },
      });
    } catch {}
  };
  if (document.readyState === 'complete') registrarCarga();
  else window.addEventListener('load', registrarCarga, { once: true });

  const observar = (tipo, callback) => {
    try {
      const obs = new PerformanceObserver(list => callback(list.getEntries()));
      obs.observe({ type: tipo, buffered: true });
    } catch {}
  };

  observar('largest-contentful-paint', entries => {
    const e = entries[entries.length - 1];
    if (e) vitals.lcp = Math.round(e.startTime);
  });
  observar('layout-shift', entries => {
    for (const e of entries) if (!e.hadRecentInput) vitals.cls += e.value;
  });
  observar('event', entries => {
    for (const e of entries) {
      if (e.interactionId && e.duration) vitals.inp = Math.max(vitals.inp || 0, Math.round(e.duration));
    }
  });
}

function instrumentarFetch() {
  const original = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const entrada = args[0];
    let url;
    try {
      url = new URL(typeof entrada === 'string' ? entrada : entrada.url, location.href);
    } catch {}
    const medir = url && url.origin === location.origin &&
      (/\.json$/i.test(url.pathname) || /\.json\//i.test(url.pathname));
    const inicio = medir ? performance.now() : 0;
    try {
      const respuesta = await original(...args);
      if (medir) {
        const duracion = Math.round(performance.now() - inicio);
        const recurso = url.pathname.slice(0, 180);
        encolar(respuesta.ok ? 'json_load' : 'json_error', {
          duracion_ms: duracion,
          recurso,
          codigo: respuesta.status,
          datos: { ok: respuesta.ok },
        });
      }
      return respuesta;
    } catch (error) {
      if (medir) encolar('fetch_error', {
        duracion_ms: Math.round(performance.now() - inicio),
        recurso: url.pathname.slice(0, 180),
        datos: { tipo: String(error?.name || 'Error').slice(0, 40) },
      });
      throw error;
    }
  };
}

function instrumentarErrores() {
  window.addEventListener('error', e => {
    if (e?.target && e.target !== window) {
      const src = e.target.src || e.target.href || '';
      encolar('resource_error', { recurso: String(src).split('?')[0].slice(-180) || null });
      return;
    }
    encolar('js_error', {
      recurso: String(e.filename || '').split('?')[0].slice(-180) || null,
      datos: {
        mensaje: String(e.message || 'Error').slice(0, 180),
        linea: Number(e.lineno) || null,
        columna: Number(e.colno) || null,
      },
    });
  });
  window.addEventListener('unhandledrejection', e => {
    const r = e?.reason;
    encolar('promise_error', {
      datos: { tipo: String(r?.name || 'Error').slice(0, 40), mensaje: String(r?.message || r || 'Error').slice(0, 180) },
    });
  });
}

function instrumentarVistas() {
  const root = document.getElementById('app');
  if (!root || !('MutationObserver' in window)) return;
  let pendiente = false;
  const revisar = () => {
    pendiente = false;
    const titulo = root.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) || '';
    if (titulo && titulo.length <= 80 && !/[?¿]/.test(titulo) && titulo !== vistaActual) {
      vistaActual = titulo;
      encolar('vista', { datos: { titulo } });
    }
  };
  const obs = new MutationObserver(() => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(revisar);
  });
  obs.observe(root, { childList: true, subtree: true, characterData: true });
  revisar();
}

export async function iniciarTelemetria() {
  if (!rankingActivo()) return;
  dispositivoId = idDispositivo();
  if (!dispositivoId) return;

  // Instrumentar antes de la carga inicial para medir también data/index.json.
  instrumentarFetch();
  instrumentarErrores();
  observarRendimiento();
  instrumentarVistas();

  try {
    const perfil = await perfilDispositivo();
    const fila = Object.fromEntries(Object.entries({
      dispositivo_id: dispositivoId,
      ...perfil,
      version_app: VERSION_APP,
      ultima_visita: new Date().toISOString(),
    }).filter(([, valor]) => valor !== null && valor !== undefined));
    await registrarDispositivo(fila);
  } catch (error) {
    console.error('[Telemetría] No se pudo registrar el dispositivo. Revisá tools/telemetria_dispositivos.sql y los logs de Supabase.', error);
    dispositivoId = null;
    cola.length = 0;
    return;
  }

  encolar('app_open');

  window.addEventListener('pagehide', () => {
    encolar('web_vitals', { datos: {
      lcp_ms: vitals.lcp,
      cls: Math.round(vitals.cls * 10000) / 10000,
      inp_ms: vitals.inp,
    } });
    vaciar();
  }, { once: true });
}
