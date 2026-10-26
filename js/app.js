// ==========================================================
// app.js: pantallas y lógica del juego.
// Flujo: inicio (materias) -> materia (temas) -> juego / tarjetas -> resultado
// Los datos se leen de data/index.json (lo genera tools/actualizar_indice.py).
// ==========================================================

import { estado, guardar, hash } from './store.js?v=dev';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';
import { rankingActivo, limpiarApodo, guardarPartida, guardarProgreso, registrarSesion, registrarVisita, rankingMateria, historialDe, progresoDe, registrarIntentos, enviarReporte, dificultadDe, preguntasDificiles, comentariosPublicos, guardarComentarioPublico, enviarReporteGeneral } from './ranking.js?v=dev';
import { infoDispositivo } from './dispositivo.js?v=dev';
import { abrirReplicacion, TITULO as TITULO_REPLICACION } from './replicacion.js?v=dev';
import { abrirCuadro, TITULO as TITULO_CUADRO } from './cuadro.js?v=dev';
import { abrirHorquilla, TITULO as TITULO_HORQUILLA } from './horquilla.js?v=dev';
import { abrirBases, TITULO as TITULO_BASES } from './bases.js?v=dev';
import { abrirCrucigrama } from './crucigrama.js?v=dev';
import { abrirOperones, TITULO as TITULO_OPERONES } from './operones.js?v=20261026-8';
import { abrirCromosomas, TITULO as TITULO_CROMOSOMAS } from './cromosomas.js?v=20261026-3';
import { abrirComunicacion, TITULO as TITULO_COMUNICACION } from './comunicacion.js?v=20261026-2';
import { abrirProteinaG, TITULO as TITULO_PROTEINA_G } from './proteina-g.js?v=20261026-1';
import { abrirLacTrp, TITULO as TITULO_LAC_TRP } from './lac-vs-trp.js?v=20261026-1';
import { abrirComparadorComunicacion, TITULO as TITULO_COMPARADOR_COMUNICACION } from './comparador-comunicacion.js?v=20261026-1';
import { abrirComparadores, TITULO as TITULO_COMPARADORES } from './comparadores.js?v=20261026-1';
import { abrirLab } from './lab.js?v=20261026-9';

const app = document.getElementById('app');
const avisoEl = document.getElementById('aviso');

// Actividades interactivas: un tema las activa con "actividad": "<clave>" en su JSON
const ACTIVIDADES = {
  replicacion: { titulo: TITULO_REPLICACION, icono: '🫧', abrir: abrirReplicacion },
  cuadro: { titulo: TITULO_CUADRO, icono: '📊', abrir: abrirCuadro },
  horquilla: { titulo: TITULO_HORQUILLA, icono: '🧪', abrir: abrirHorquilla },
  bases: { titulo: TITULO_BASES, icono: '🧬', abrir: abrirBases },
  operones: { titulo: TITULO_OPERONES, icono: '🧫', abrir: abrirOperones },
  cromosomas: { titulo: TITULO_CROMOSOMAS, icono: '🧬', abrir: abrirCromosomas },
  comunicacion: { titulo: TITULO_COMUNICACION, icono: '⚡', abrir: abrirComunicacion },
  'proteina-g': { titulo: TITULO_PROTEINA_G, icono: '🧪', abrir: abrirProteinaG },
  'lac-vs-trp': { titulo: TITULO_LAC_TRP, icono: '🧫', abrir: abrirLacTrp },
  'comparador-comunicacion': { titulo: TITULO_COMPARADOR_COMUNICACION, icono: '🔁', abrir: abrirComparadorComunicacion },
  comparadores: { titulo: TITULO_COMPARADORES, icono: '⚖️', abrir: abrirComparadores },
};

const LETRAS = ['A', 'B', 'C', 'D'];
const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF', '#FF8A5C'];
const HITOS = [3, 5, 10, 15, 20, 30, 50];   // rachas que disparan festejo

let indice = null;          // contenido de data/index.json
const cache = new Map();    // idTema -> preguntas ya cargadas
const cacheTarjetas = new Map();   // idTema -> tarjetas ya cargadas
let juego = null;           // partida en curso (null si no hay)
let sesionT = null;         // sesión de tarjetas en curso (null si no hay)
const dificultad = new Map();   // idPregunta -> { intentos, fallos } (datos de todos los jugadores)

// ---------- Utilidades ----------

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function mezclar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

let temporizadorAviso = null;
function avisar(texto) {
  avisoEl.textContent = texto;
  avisoEl.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => avisoEl.classList.remove('visible'), 1500);
}

function esCelular() {
  const ua = navigator.userAgent || '';
  // Chromium reciente ofrece una detección explícita; el patrón clásico cubre
  // Safari y otros navegadores que no implementan userAgentData.
  return navigator.userAgentData?.mobile === true ||
    /iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|webOS|Opera Mini/i.test(ua);
}

function esIOS() {
  return /iPhone|iPod/.test(navigator.userAgent || '');
}

function estaInstalada() {
  return instalacionCompletada ||
    window.matchMedia('(display-mode: standalone)').matches ||
    navigator.standalone === true;
}

let eventoInstalacionPendiente = null;
let instalacionCompletada = false;

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  eventoInstalacionPendiente = evento;

  // Si el aviso nativo aparece después de renderizar el menú, conservar visible
  // el botón para que pueda abrirlo directamente.
  if (esCelular() && !estaInstalada()) {
    const contenedor = document.querySelector('.instalar-app-wrap');
    if (contenedor) contenedor.hidden = false;
  }
});

window.addEventListener('appinstalled', () => {
  instalacionCompletada = true;
  eventoInstalacionPendiente = null;
  document.querySelector('.instalar-app-wrap')?.remove();
  avisar('¡Parcialito se instaló correctamente!');
});

function mostrarAyudaInstalacionIOS() {
  window.alert('Para instalar Parcialito en tu iPhone:\n\n1. Abrí esta página en Safari.\n2. Tocá Compartir (el cuadrado con la flecha hacia arriba).\n3. Elegí «Añadir a pantalla de inicio».');
}

function mostrarAyudaInstalacionAndroid() {
  window.alert('Para instalar Parcialito en tu celular:\n\n1. Abrí el menú del navegador (⋮ o Compartir).\n2. Buscá «Instalar aplicación» o «Añadir a pantalla de inicio».\n3. Confirmá la instalación.\n\nCuando el navegador habilite el aviso nativo, este botón lo abrirá directamente.');
}

async function instalarParcialito() {
  if (!eventoInstalacionPendiente) {
    // Si la API de instalación no está disponible, explicar el método manual.
    if (esIOS()) mostrarAyudaInstalacionIOS();
    else mostrarAyudaInstalacionAndroid();
    return;
  }

  const evento = eventoInstalacionPendiente;
  eventoInstalacionPendiente = null;
  const contenedor = document.querySelector('.instalar-app-wrap');
  try {
    await evento.prompt();
    const eleccion = await evento.userChoice;
    if (eleccion?.outcome === 'accepted') {
      avisar('Parcialito se está instalando…');
    } else {
      // No ocultar el botón: el evento puede volver a estar disponible más tarde,
      // y si no, el botón ofrece las instrucciones manuales como alternativa.
      avisar('No hay problema. Podés instalarla más adelante.');
    }
  } catch (_) {
    avisar('No se pudo abrir la instalación. Volvé a intentarlo o usá el menú del navegador.');
  }
}

function iniciarDetectorActualizaciones(versionActual) {
  if (!versionActual || document.getElementById('aviso-actualizacion')) return;

  // El aviso vive fuera de #app para que no desaparezca al cambiar de pantalla.
  const estilo = document.createElement('style');
  estilo.id = 'estilos-aviso-actualizacion';
  estilo.textContent = [
    '#aviso-actualizacion { position:fixed; z-index:10000; left:50%; bottom:calc(16px + env(safe-area-inset-bottom)); transform:translateX(-50%); width:min(36rem, calc(100vw - 24px)); box-sizing:border-box; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; color:#FFF3DC; background:#231845; border:1px solid #9B7BFF; border-radius:16px; box-shadow:0 12px 40px rgba(0,0,0,.4); font:500 14px/1.4 Inter, system-ui, sans-serif; }',
    '#aviso-actualizacion[hidden] { display:none !important; }',
    '#aviso-actualizacion .texto { display:flex; flex-direction:column; gap:2px; min-width:0; }',
    '#aviso-actualizacion .texto strong { font-size:14px; }',
    '#aviso-actualizacion .texto span { color:#D4C9EB; font-size:12px; }',
    '#aviso-actualizacion button { flex-shrink:0; border:0; border-radius:10px; padding:10px 13px; font:800 12px/1 Inter, system-ui, sans-serif; letter-spacing:.03em; background:#9B7BFF; color:#170F2E; cursor:pointer; }',
    '#aviso-actualizacion button:focus-visible { outline:3px solid #FFB938; outline-offset:3px; }',
    '@media (max-width:430px) { #aviso-actualizacion { align-items:stretch; flex-direction:column; gap:10px; } #aviso-actualizacion button { width:100%; padding:12px; } }'
  ].join('\n');
  document.head.appendChild(estilo);

  const banner = document.createElement('aside');
  banner.id = 'aviso-actualizacion';
  banner.hidden = true;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = '<div class="texto"><strong>¡Hay una actualización disponible!</strong><span>Hay nuevos juegos o mejoras en Parcialito.</span></div><button type="button" id="btn-actualizar-app">↻ ACTUALIZAR</button>';
  document.body.appendChild(banner);

  document.getElementById('btn-actualizar-app').addEventListener('click', function () {
    if ((juego || sesionT) && !window.confirm('Hay una partida en curso. Si actualizás ahora, se reiniciará y perderás el progreso de esta partida. ¿Querés continuar?')) return;
    const url = new URL(window.location.href);
    url.searchParams.set('actualizar', String(Date.now()));
    window.location.replace(url.toString());
  });

  let comprobando = false;
  async function comprobar() {
    if (comprobando) return;
    comprobando = true;
    try {
      // El parámetro y no-store evitan comparar contra una copia cacheada del índice.
      const url = new URL('data/index.json', document.baseURI);
      url.searchParams.set('_actualizacion', String(Date.now()));
      const respuesta = await fetch(url.toString(), { cache: 'no-store' });
      if (!respuesta.ok) return;
      const datos = await respuesta.json();
      if (datos.generado && datos.generado !== versionActual) banner.hidden = false;
    } catch (_) {
      // Si no hay conexión o el sitio se está publicando, se volverá a comprobar.
    } finally {
      comprobando = false;
    }
  }

  window.setInterval(comprobar, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) comprobar();
  });
}

function vistaCargando(texto) {
  app.innerHTML = `<div class="cargando"><div class="giro" aria-hidden="true"></div><p>${esc(texto)}</p></div>`;
}

function colorMateria(m, i) {
  return /^#[0-9a-f]{6}$/i.test(m.color || '') ? m.color : COLORES[i % COLORES.length];
}

// ---------- Datos ----------

function urlImagen(valor) {
  const u = String(valor || '').trim();
  return /^https:\/\/\S+$/i.test(u) || /^(?!\/)[\w./\%-]+$/.test(u) ? u : '';
}

function normalizar(json, tema, materia) {
  const salida = [];
  (json.preguntas || []).forEach((p, n) => {
    const ops = Array.isArray(p.opciones) ? p.opciones.map(String) : [];
    const idx = LETRAS.indexOf(String(p.correcta || '').trim().toUpperCase());
    if (!p.pregunta || ops.length !== 4 || idx < 0) {
      console.warn(`[Repaso] Pregunta ${n + 1} de "${tema.id}" descartada: formato inválido.`);
      return;
    }
    salida.push({
      id: hash(p.pregunta),
      texto: String(p.pregunta),
      opciones: ops,
      correcta: idx,
      explicacion: p.explicacion ? String(p.explicacion) : '',
      imagen: urlImagen(p.imagen),
      imagenAlt: p.imagen_alt ? String(p.imagen_alt) : '',
      tema: tema.nombre,
      temaId: tema.id,
      materia: materia.nombre,
    });
  });
  return salida;
}

async function cargarTema(tema, materia) {
  if (cache.has(tema.id)) return cache.get(tema.id);
  const r = await fetch(tema.archivo, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`No se pudo leer ${tema.archivo} (${r.status})`);
  const json = await r.json();
  const preguntas = normalizar(json, tema, materia);
  cacheTarjetas.set(tema.id, normalizarTarjetas(json, tema, materia));
  if (estado.dominadas[tema.id]) {
    const vigentes = new Set(preguntas.map((q) => q.id));
    for (const id of Object.keys(estado.dominadas[tema.id])) {
      if (!vigentes.has(id)) delete estado.dominadas[tema.id][id];
    }
  }
  cache.set(tema.id, preguntas);
  return preguntas;
}

function dominadasDe(tema) {
  return Math.min(Object.keys(estado.dominadas[tema.id] || {}).length, tema.preguntas || 0);
}

function dominio(materia) {
  if (!materia.temas.length) return 0;
  const suma = materia.temas.reduce((s, t) => s + (estado.mejores[t.id]?.precision || 0), 0);
  return Math.round(suma / materia.temas.length);
}

// ---------- Tarjetas tipo Anki ----------

const NUEVAS_POR_DIA = 10;   // tarjetas nuevas que se agregan por día
const MAX_REPASOS = 200;     // tope de tarjetas a repasar en una sesión
const diaHoy = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);

function normalizarTarjetas(json, tema, materia) {
  const salida = [];
  (Array.isArray(json.tarjetas) ? json.tarjetas : []).forEach((c, n) => {
    const frente = String(c?.frente ?? c?.pregunta ?? '').trim();
    const dorso = String(c?.dorso ?? c?.respuesta ?? '').trim();
    if (!frente || !dorso) {
      console.warn(`[Repaso] Tarjeta ${n + 1} de "${tema.id}" descartada: le falta el frente o el dorso.`);
      return;
    }
    salida.push({ id: hash(`t|${frente}`), frente, dorso, tema: tema.nombre, temaId: tema.id, materia: materia.nombre });
  });
  return salida;
}

async function cargarTodas() {
  const listas = await Promise.all(indice.materias.flatMap((m) => m.temas.map((t) => cargarTema(t, m))));
  const mapa = new Map();
  for (const lista of listas) for (const q of lista) if (!mapa.has(q.id)) mapa.set(q.id, q);
  return mapa;
}

const memoria = () => (estado.tarjetas ||= {});
function nuevasHoy() {
  const hoy = diaHoy();
  if (estado.tarjetasHoy?.dia !== hoy) estado.tarjetasHoy = { dia: hoy, nuevas: 0 };
  return estado.tarjetasHoy;
}

function todasLasTarjetas() {
  const vistas = new Set(), lista = [];
  for (const m of indice.materias) {
    for (const t of m.temas) {
      for (const c of cacheTarjetas.get(t.id) || []) if (!vistas.has(c.id)) { vistas.add(c.id); lista.push(c); }
    }
  }
  return lista;
}

function resumenTarjetas(extra = 0) {
  const hoy = diaHoy(), mem = memoria(), todas = todasLasTarjetas();
  const pendientes = todas.filter((c) => mem[c.id] && mem[c.id].prox <= hoy).sort((x, y) => mem[x.id].prox - mem[y.id].prox);
  const nuevas = todas.filter((c) => !mem[c.id]);
  const cupo = Math.max(0, NUEVAS_POR_DIA - nuevasHoy().nuevas) + extra;
  return { total: todas.length, pendientes, nuevas, cupo, nNuevas: Math.min(cupo, nuevas.length) };
}

function programar(est, aprendiendo, r) {
  const ef0 = est?.ef ?? 2.5, iv0 = est?.iv ?? 0, l0 = est?.l ?? 0;
  if (r === 1) {
    const castiga = !!est && !aprendiendo;
    return { vuelve: true, ef: castiga ? Math.max(1.3, ef0 - 0.2) : ef0, iv: 0, l: castiga ? l0 + 1 : l0 };
  }
  if (aprendiendo) {
    if (r === 2) return { vuelve: true, ef: ef0, iv: 0, l: l0 };
    return { vuelve: false, ef: r === 4 ? ef0 + 0.15 : ef0, iv: r === 4 ? (est ? 3 : 4) : 1, l: l0 };
  }
  if (r === 2) return { vuelve: false, ef: Math.max(1.3, ef0 - 0.15), iv: Math.max(iv0 + 1, Math.round(iv0 * 1.2)), l: l0 };
  if (r === 3) return { vuelve: false, ef: ef0, iv: Math.max(iv0 + 1, Math.round(iv0 * ef0)), l: l0 };
  return { vuelve: false, ef: ef0 + 0.15, iv: Math.max(iv0 + 2, Math.round(iv0 * ef0 * 1.3)), l: l0 };
}

const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibrar = (ms) => { if (!estado.silencio) navigator.vibrate?.(ms); };

function activarInclinacion(flip) {
  if (sinMovimiento() || !window.matchMedia('(hover: hover)').matches) return;
  const poner = (ry, rx, mx, my) => {
    flip.style.setProperty('--ry', `${ry}deg`);
    flip.style.setProperty('--rx', `${rx}deg`);
    flip.style.setProperty('--mx', `${mx}%`);
    flip.style.setProperty('--my', `${my}%`);
  };
  flip.addEventListener('pointermove', (e) => {
    if (flip.classList.contains('girando')) return;
    const b = flip.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    poner(((x - 0.5) * 9).toFixed(2), ((0.5 - y) * 7).toFixed(2), (x * 100).toFixed(1), (y * 100).toFixed(1));
  });
  flip.addEventListener('pointerleave', () => poner(0, 0, 50, 30));
}

function fmtIntervalo(d) {
  if (d <= 1) return '1 día';
  if (d < 30) return `${d} días`;
  if (d < 365) { const m = Math.round((d / 30) * 10) / 10; return `${String(m).replace('.', ',')} ${m === 1 ? 'mes' : 'meses'}`; }
  const y = Math.round((d / 365) * 10) / 10;
  return `${String(y).replace('.', ',')} ${y === 1 ? 'año' : 'años'}`;
}

function pintarTarjetasInicio() {
  const zona = document.getElementById('zona-tarjetas');
  if (!zona) return;
  const r = resumenTarjetas();
  if (!r.total) { zona.innerHTML = ''; return; }
  const n = r.pendientes.length + r.nNuevas;
  if (n) {
    zona.innerHTML = `<button class="banner-repaso" id="btn-tarjetas"><span>🃏 Repaso de hoy<small>${r.pendientes.length} para repasar · ${r.nNuevas} ${r.nNuevas === 1 ? 'nueva' : 'nuevas'}</small></span><b>${n}</b></button>`;
    document.getElementById('btn-tarjetas').addEventListener('click', () => { Sonido.clic(); lanzarTarjetas(); });
  } else {
    zona.innerHTML = `<p class="al-dia">🃏 Tarjetas al día: ¡hasta mañana!${r.nuevas.length ? ' <button class="btn enlace" id="btn-mas-tarjetas">Estudiar nuevas igual</button>' : ''}</p>`;
    document.getElementById('btn-mas-tarjetas')?.addEventListener('click', () => { Sonido.clic(); lanzarTarjetas(NUEVAS_POR_DIA); });
  }
}

function lanzarTarjetas(extra = 0) {
  vistaCargando('Preparando tus tarjetas…');
  cargarTodas().then(() => {
    const r = resumenTarjetas(extra);
    const cola = mezclar([...r.pendientes.slice(0, MAX_REPASOS), ...r.nuevas.slice(0, r.cupo)]);
    if (!cola.length) { vistaInicio(); avisar('No tenés tarjetas para hoy'); return; }
    empezarTarjetas(cola, () => vistaInicio());
  }).catch(vistaError);
}

async function lanzarTarjetasTemas(materia, temas) {
  vistaCargando('Preparando tarjetas…');
  try {
    for (const t of temas) await cargarTema(t, materia);
    const hoy = diaHoy();
    const mem = memoria();

    const tarjetasTema = [];
    for (const t of temas) {
      for (const c of cacheTarjetas.get(t.id) || []) tarjetasTema.push(c);
    }

    if (!tarjetasTema.length) {
      const iM = indice.materias.indexOf(materia);
      if (iM >= 0) vistaMateria(iM); else vistaInicio();
      avisar('Los temas seleccionados no tienen tarjetas');
      return;
    }

    const pendientes = tarjetasTema.filter((c) => mem[c.id] && mem[c.id].prox <= hoy).sort((x, y) => mem[x.id].prox - mem[y.id].prox);
    const nuevas = tarjetasTema.filter((c) => !mem[c.id]);

    let cola = [];
    if (pendientes.length > 0 || nuevas.length > 0) {
      const cupo = Math.max(0, NUEVAS_POR_DIA - nuevasHoy().nuevas);
      cola = mezclar([...pendientes.slice(0, MAX_REPASOS), ...nuevas.slice(0, cupo)]);
    }
    
    if (!cola.length) {
      cola = mezclar([...tarjetasTema]);
    }

    const iMateria = indice.materias.indexOf(materia);
    empezarTarjetas(cola, () => vistaMateria(iMateria >= 0 ? iMateria : 0));
  } catch (e) {
    vistaError(e);
  }
}

function empezarTarjetas(cola, volver = () => vistaInicio()) {
  const mem = memoria();
  sesionT = {
    cola: [...cola],
    total: cola.length,
    hechas: 0,                 
    nuevasVistas: 0, repasadas: 0, otraVez: 0,
    origen: new Map(cola.map((c) => [c.id, mem[c.id] ? 'repaso' : 'nueva'])),
    fallada: new Set(),        
    nuevaContada: new Set(),
    volteada: false,
    volver,
  };
  app.innerHTML = `
    <main class="pantalla">
      <div class="hud">
        <button class="icono" id="btn-salir" aria-label="Salir (se guarda lo que ya hiciste)">✕</button>
        <div class="progreso" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${cola.length}" aria-valuenow="0"><div class="barra" id="barra"></div></div>
        <div class="contadores-t" id="contadores-t" aria-label="Tarjetas pendientes"></div>
      </div>
      <div id="zona-t"></div>
    </main>`;
  document.getElementById('btn-salir').addEventListener('click', () => {
    Sonido.clic();
    const v = sesionT?.volver || vistaInicio;
    sesionT = null;
    guardar();
    v();
  });
  mostrarTarjeta();
  window.scrollTo(0, 0);
}

function pintarContadoresT() {
  const s = sesionT, mem = memoria();
  const aprendiendo = (c) => !!mem[c.id] && (mem[c.id].iv === 0 || s.fallada.has(c.id));
  const nNuevas = s.cola.filter((c) => !mem[c.id]).length;
  const nAprend = s.cola.filter(aprendiendo).length;
  const nRepaso = s.cola.length - nNuevas - nAprend;
  document.getElementById('contadores-t').innerHTML =
    `<span class="c-nueva" title="Nuevas">${nNuevas}</span><span class="c-aprend" title="Olvidadas, a recuperar">${nAprend}</span><span class="c-repaso" title="A repasar">${nRepaso}</span>`;
  document.getElementById('barra').style.width = `${(s.hechas / s.total) * 100}%`;
  document.querySelector('.progreso').setAttribute('aria-valuenow', String(s.hechas));
}

function mostrarTarjeta() {
  const s = sesionT, c = s.cola[0];
  s.volteada = false;
  pintarContadoresT();
  document.getElementById('zona-t').innerHTML = `
    <div class="flip entra" id="flip" role="button" tabindex="0" aria-label="Tarjeta. Tocá para ver la respuesta">
      <div class="flip-tilt">
        <div class="flip-interno">
          <div class="cara frente">
            <p class="tema-etq">${esc(c.tema)}</p>
            <div class="texto-t">${esc(c.frente)}</div>
            <p class="pista-t">Tocá la tarjeta para darla vuelta</p>
          </div>
          <div class="cara dorso" aria-hidden="true">
            <p class="tema-etq">Respuesta</p>
            <div class="texto-t">${esc(c.dorso)}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="acciones-t" id="acciones-t"><button class="btn primario" id="btn-voltear">Mostrar respuesta</button></div>
    <p class="ayuda-valorar" id="ayuda-valorar" hidden>Marcá qué tan bien la sabías: cuanto más fácil, más tarde vuelve a aparecer.</p>
    <p class="ayuda-teclas">Teclado: Espacio da vuelta la tarjeta · 1 Otra vez · 2 Difícil · 3 Bien · 4 Fácil</p>`;
  const flip = document.getElementById('flip');
  flip.addEventListener('click', voltearTarjeta);
  flip.addEventListener('animationend', (e) => { if (e.animationName === 'entra') flip.classList.remove('entra'); });
  activarInclinacion(flip);
  document.getElementById('btn-voltear').addEventListener('click', voltearTarjeta);
}

function voltearTarjeta() {
  const s = sesionT;
  if (!s || s.volteada) return;
  s.volteada = true;
  const c = s.cola[0], est = memoria()[c.id];
  const aprendiendo = !est || est.iv === 0 || s.fallada.has(c.id);
  const flip = document.getElementById('flip');
  flip.classList.remove('entra');
  flip.style.setProperty('--ry', '0deg');
  flip.style.setProperty('--rx', '0deg');
  flip.classList.add('volteada');
  if (!sinMovimiento()) {
    flip.classList.add('girando');
    setTimeout(() => flip.classList.remove('girando'), 950);
  }
  flip.setAttribute('aria-label', 'Tarjeta dada vuelta');
  flip.querySelector('.frente').setAttribute('aria-hidden', 'true');
  flip.querySelector('.dorso').removeAttribute('aria-hidden');

  const botones = [[1, 'Otra vez', 'otra'], [2, 'Difícil', 'dificil'], [3, 'Bien', 'bien'], [4, 'Fácil', 'facil']];
  document.getElementById('acciones-t').innerHTML = botones.map(([r, txt, clase]) => {
    const p = programar(est, aprendiendo, r);
    return `<button class="valorar ${clase}" data-r="${r}" style="--i:${r - 1}"><b>${txt}</b><small>${p.vuelve ? '< 10 min' : fmtIntervalo(p.iv)}</small></button>`;
  }).join('');
  document.querySelectorAll('.valorar').forEach((b) => b.addEventListener('click', () => valorarTarjeta(Number(b.dataset.r))));
  Sonido.voltear ? Sonido.voltear() : Sonido.clic();
  vibrar(12);
  document.getElementById('ayuda-valorar').hidden = false;
}

function valorarTarjeta(r) {
  const s = sesionT;
  if (!s || !s.volteada || s.bloqueada) return;
  const c = s.cola.shift();
  const mem = memoria(), est = mem[c.id], hoy = diaHoy();
  const aprendiendo = !est || est.iv === 0 || s.fallada.has(c.id);
  const res = programar(est, aprendiendo, r);

  if (!est && !s.nuevaContada.has(c.id)) {
    s.nuevaContada.add(c.id);
    nuevasHoy().nuevas++;
    s.nuevasVistas++;
  }
  if (r === 1) { s.fallada.add(c.id); s.otraVez++; }
  if (!(res.vuelve && !est)) mem[c.id] = { ef: res.ef, iv: res.iv, prox: hoy + res.iv, l: res.l };

  if (res.vuelve) {
    s.cola.splice(Math.min(s.cola.length, r === 1 ? 3 : 6), 0, c);
  } else {
    s.hechas++;
    if (s.origen.get(c.id) === 'repaso') s.repasadas++;
  }
  guardar();
  if (Sonido.valorar) Sonido.valorar(r); else if (r >= 3) Sonido.acierto(1); else Sonido.clic();
  vibrar(r === 1 ? [10, 40, 10] : 8);

  const siguiente = () => {
    if (sesionT !== s) return;
    s.bloqueada = false;
    if (!s.cola.length) terminarTarjetas(); else mostrarTarjeta();
  };
  const flip = document.getElementById('flip');
  if (flip && !sinMovimiento()) {
    s.bloqueada = true;
    flip.classList.remove('girando', 'entra');
    flip.classList.add(`sale-${r}`);
    setTimeout(siguiente, 300);
  } else {
    siguiente();
  }
}

function terminarTarjetas() {
  const s = sesionT;
  const volver = s?.volver || vistaInicio;
  sesionT = null;
  guardar();
  const hoy = diaHoy();
  const r = resumenTarjetas();
  const manana = Object.values(memoria()).filter((v) => v.prox <= hoy + 1).length;
  app.innerHTML = `
    <main class="pantalla resultado">
      <div class="grande" aria-hidden="true">🎉</div>
      <h1>¡Listo por hoy!</h1>
      <p class="sub">Terminaste tu repaso de tarjetas.</p>
      <div class="cifras">
        <div class="cifra"><b>${s.nuevasVistas}</b><span>Nuevas</span></div>
        <div class="cifra"><b>${s.repasadas}</b><span>Repasadas</span></div>
        <div class="cifra"><b>${s.otraVez}</b><span>Otra vez</span></div>
      </div>
      <p class="estado-ranking">Para mañana: ${plural(manana, 'tarjeta', 'tarjetas')}.</p>
      <div class="botones">
        ${r.nuevas.length ? `<button class="btn primario" id="btn-mas">Estudiar ${Math.min(NUEVAS_POR_DIA, r.nuevas.length)} nuevas más</button>` : ''}
        <button class="btn ${r.nuevas.length ? 'secundario' : 'primario'}" id="btn-inicio">Volver</button>
      </div>
    </main>`;
  document.getElementById('btn-mas')?.addEventListener('click', () => { Sonido.clic(); lanzarTarjetas(NUEVAS_POR_DIA); });
  document.getElementById('btn-inicio').addEventListener('click', () => { Sonido.clic(); volver(); });
  Sonido.fin(true);
  lanzarConfeti(s.hechas ? 80 : 30);
  window.scrollTo(0, 0);
}

// ---------- Dificultad real (datos de todos los jugadores) ----------

const MIN_DATOS = 10;

function cargarDificultad(ids) {
  if (!rankingActivo()) return;
  const faltan = [...new Set(ids)].filter((id) => !dificultad.has(id)).slice(0, 500);
  if (!faltan.length) return;
  dificultadDe(faltan).then((filas) => {
    for (const f of filas) dificultad.set(f.pregunta_id, { intentos: Number(f.intentos), fallos: Number(f.fallos) });
  }).catch(() => {});
}

function textoDificultad(id) {
  const d = dificultad.get(id);
  if (!d || d.intentos < MIN_DATOS) return '';
  const pct = Math.round((d.fallos / d.intentos) * 100);
  const etiqueta = pct >= 60 ? 'Difícil' : pct <= 20 ? 'Fácil' : 'Intermedia';
  return `<p class="dato-dificultad">📊 <b>${etiqueta}</b>: el ${pct}% de los jugadores la falla (${d.intentos} respuestas).</p>`;
}

// ---------- Pantalla: inicio ----------

function vistaInicio() {
  juego = null;
  sesionT = null;
  const nErrores = Object.keys(estado.errores).length;

  const tarjetas = indice.materias.map((m, i) => {
    const totalPreg = m.temas.reduce((s, t) => s + (t.preguntas || 0), 0);
    const totalTarj = m.temas.reduce((s, t) => s + (t.tarjetas || 0), 0);
    const pct = dominio(m);

    let metaTexto = '';
    if (totalPreg > 0 && totalTarj > 0) {
      metaTexto = `${plural(m.temas.length, 'tema', 'temas')}, ${plural(totalPreg, 'pregunta', 'preguntas')} · ${plural(totalTarj, 'tarjeta', 'tarjetas')}`;
    } else if (totalTarj > 0) {
      metaTexto = `${plural(m.temas.length, 'tema', 'temas')}, ${plural(totalTarj, 'tarjeta', 'tarjetas')}`;
    } else {
      metaTexto = `${plural(m.temas.length, 'tema', 'temas')}, ${plural(totalPreg, 'pregunta', 'preguntas')}`;
    }

    return `
      <button class="materia" data-materia="${i}" style="--c:${colorMateria(m, i)}">
        <span class="emoji" aria-hidden="true">${esc(m.emoji || '📚')}</span>
        <h2>${esc(m.nombre)}</h2>
        <span class="meta">${metaTexto}</span>
        <span class="dominio">
          <span class="riel"><span class="relleno" style="width:${pct}%"></span></span>
          <span>${pct}%</span>
        </span>
      </button>`;
  }).join('');

  app.innerHTML = `
    <main class="pantalla">
      <header class="cabecera">
        <h1 class="marca">Parcialito</h1>
        <div class="acciones-cabecera">
          <button class="icono" id="btn-sonido" aria-label="${estado.silencio ? 'Activar sonido' : 'Silenciar'}">${estado.silencio ? '🔇' : '🔊'}</button>
          <a class="dev-link" href="https://www.instagram.com/pritagoras/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Pritagoras" title="Instagram de Pritagoras">
            <svg class="instagram-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="4.1" stroke="currentColor" stroke-width="2"/>
              <circle cx="17.65" cy="6.55" r="1.2" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </header>
      <p class="bajada">Elegí una materia y practicá con preguntas de opción múltiple.</p>
      <button class="banner-lab" id="btn-lab" type="button"><span class="banner-lab-icon">🧬</span><span class="banner-lab-text"><strong>LAB <span class="banner-lab-nuevo">NUEVO</span></strong><small>Explorá la biología con modelos interactivos y recorridos guiados.</small></span><span class="banner-lab-flecha">↗</span></button>
      ${estaInstalada() || !esCelular() ? '' : `
        <div class="instalar-app-wrap">
          <button class="btn secundario btn-instalar" id="btn-instalar-app" type="button">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 16v3.5h15V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Instalar Parcialito</span>
          </button>
        </div>`}
      ${rankingActivo() ? `
        <div class="barra-ranking">
          <button class="btn secundario" id="btn-ranking">🏆 Ranking</button>
          <button class="btn secundario" id="btn-dificiles">🔥 Las más difíciles</button>
          <button class="btn secundario" id="btn-apodo">👤 ${estado.apodo ? esc(estado.apodo) : 'Elegir apodo'}</button>
        </div>` : ''}
      <div id="zona-tarjetas"></div>
      ${nErrores ? `<button class="banner-errores" id="btn-errores"><span>Repasar mis errores</span><b>${nErrores}</b></button>` : ''}
      ${indice.materias.length
        ? `<div class="materias">${tarjetas}</div>`
        : `<div class="vacio"><strong>Todavía no hay materias</strong>
             Agregá archivos <code>.json</code> dentro de <code>data/</code> y corré
             <code>python tools/actualizar_indice.py</code>.</div>`}
      <section class="participacion" aria-label="Comentarios y reportes">
        <details class="panel-comentarios" id="panel-comentarios">
          <summary>
            <svg class="icono-lineal" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5A7.5 7.5 0 0 1 10.5 4h2A7.5 7.5 0 0 1 20 11.5Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Comentarios</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </summary>
          <div class="comentarios-contenido">
            <p class="participacion-ayuda">Dejá una idea, una duda o un comentario para quienes usan Parcialito.</p>
            <form id="form-comentario" class="form-participacion">
              <label class="campo"><span>Tu apodo</span><input id="comentario-apodo" name="apodo" maxlength="20" required placeholder="Ej. BioFan23" autocomplete="nickname"></label>
              <label class="campo"><span>Comentario</span><textarea id="comentario-texto" name="comentario" maxlength="500" rows="3" required placeholder="¿Qué te gustaría compartir?"></textarea></label>
              <button class="btn primario" id="comentario-enviar" type="submit">Publicar comentario</button>
              <p class="participacion-estado" id="comentario-estado" role="status" aria-live="polite"></p>
            </form>
            <div class="lista-comentarios" id="lista-comentarios"><p class="estado-ranking">Abrí esta sección para cargar los comentarios…</p></div>
          </div>
        </details>
        <button class="btn reporte-general-boton" id="btn-reporte-general" type="button">
          <svg class="icono-lineal" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 21V4m0 1c5-4 9 4 14 0v11c-5 4-9-4-14 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Enviar reporte privado</span>
        </button>
      </section>
    </main>`;

  document.getElementById('btn-sonido').addEventListener('click', alternarSonido);
  document.getElementById('btn-lab')?.addEventListener('click', () => { Sonido.clic(); abrirLab({ app, volver: vistaInicio }); });
  document.getElementById('btn-instalar-app')?.addEventListener('click', instalarParcialito);
  document.getElementById('btn-errores')?.addEventListener('click', () => { Sonido.clic(); lanzarErrores(); });
  document.getElementById('btn-dificiles')?.addEventListener('click', () => { Sonido.clic(); lanzarDificiles(); });
  document.getElementById('btn-ranking')?.addEventListener('click', () => { Sonido.clic(); vistaRanking(); });
  document.getElementById('btn-apodo')?.addEventListener('click', () => { Sonido.clic(); vistaApodo(); });
  document.getElementById('panel-comentarios')?.addEventListener('toggle', (e) => {
    if (e.target.open) cargarComentariosPublicos();
  });
  document.getElementById('form-comentario')?.addEventListener('submit', publicarComentario);
  document.getElementById('btn-reporte-general')?.addEventListener('click', () => { Sonido.clic(); abrirReporteGeneral(); });
  app.querySelectorAll('.materia').forEach((b) =>
    b.addEventListener('click', () => { Sonido.clic(); vistaMateria(Number(b.dataset.materia)); }));
  pintarTarjetasInicio();
}

function alternarSonido() {
  estado.silencio = !estado.silencio;
  guardar();
  const b = document.getElementById('btn-sonido');
  b.textContent = estado.silencio ? '🔇' : '🔊';
  b.setAttribute('aria-label', estado.silencio ? 'Activar sonido' : 'Silenciar');
  Sonido.clic();
}

// ---------- Participación: comentarios públicos y reportes privados ----------

let comentariosCargando = false;

async function cargarComentariosPublicos() {
  const caja = document.getElementById('lista-comentarios');
  if (!caja || comentariosCargando) return;
  comentariosCargando = true;
  caja.innerHTML = '<p class="estado-ranking">Cargando comentarios…</p>';
  try {
    const filas = await comentariosPublicos();
    if (!caja.isConnected) return;
    caja.innerHTML = filas.length ? filas.map((f) => `
      <article class="comentario-publico">
        <div class="comentario-cabecera"><strong>${esc(f.apodo)}</strong><time datetime="${esc(f.creado)}">${new Date(f.creado).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</time></div>
        <p>${esc(f.comentario)}</p>
      </article>`).join('') : '<p class="estado-ranking">Todavía no hay comentarios. ¡Podés ser el primero!</p>';
  } catch {
    if (caja.isConnected) caja.innerHTML = '<p class="estado-ranking">No se pudieron cargar los comentarios. Probá de nuevo más tarde.</p>';
  } finally {
    comentariosCargando = false;
  }
}

async function publicarComentario(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const apodoEl = document.getElementById('comentario-apodo');
  const textoEl = document.getElementById('comentario-texto');
  const estadoEl = document.getElementById('comentario-estado');
  const boton = document.getElementById('comentario-enviar');
  const apodo = limpiarApodo(apodoEl.value);
  const comentario = textoEl.value.trim().slice(0, 500);
  if (!apodo || !comentario) { estadoEl.textContent = 'Completá el apodo y el comentario.'; return; }
  boton.disabled = true;
  estadoEl.textContent = 'Publicando…';
  try {
    await guardarComentarioPublico({ apodo, comentario });
    textoEl.value = '';
    estadoEl.textContent = '¡Comentario publicado!';
    await cargarComentariosPublicos();
  } catch {
    estadoEl.textContent = 'No se pudo publicar. Es posible que falte activar la tabla de comentarios en Supabase.';
  } finally {
    boton.disabled = false;
  }
}

function abrirReporteGeneral() {
  const dlg = document.createElement('dialog');
  dlg.className = 'reporte';
  dlg.setAttribute('aria-labelledby', 'reporte-general-titulo');
  dlg.innerHTML = `
    <h2 id="reporte-general-titulo">Reporte privado</h2>
    <p class="participacion-ayuda">Este mensaje solo vos, como responsable de Parcialito, podrás revisarlo. No aparecerá en los comentarios públicos.</p>
    <form id="form-reporte-general" class="form-participacion">
      <label class="campo"><span>Motivo</span><select id="reporte-general-motivo"><option value="error">Error en la página o una pregunta</option><option value="sugerencia">Sugerencia de mejora</option><option value="tecnico">Problema técnico</option><option value="otro">Otro</option></select></label>
      <label class="campo"><span>Apodo (opcional)</span><input id="reporte-general-apodo" maxlength="20" placeholder="Tu apodo"></label>
      <label class="campo"><span>Detalle</span><textarea id="reporte-general-texto" rows="4" maxlength="1000" required placeholder="Contame qué pasó o qué cambiarías"></textarea></label>
      <p class="participacion-estado" id="reporte-general-estado" role="status" aria-live="polite"></p>
      <div class="reporte-botones"><button class="btn secundario" id="reporte-general-cancelar" type="button">Cancelar</button><button class="btn primario" id="reporte-general-enviar" type="submit">Enviar en privado</button></div>
    </form>`;
  document.body.appendChild(dlg);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.querySelector('#reporte-general-cancelar').addEventListener('click', () => dlg.close());
  dlg.querySelector('#form-reporte-general').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = dlg.querySelector('#reporte-general-enviar');
    const estadoEl = dlg.querySelector('#reporte-general-estado');
    boton.disabled = true;
    estadoEl.textContent = 'Enviando…';
    try {
      await enviarReporteGeneral({
        motivo: dlg.querySelector('#reporte-general-motivo').value,
        apodo: limpiarApodo(dlg.querySelector('#reporte-general-apodo').value) || null,
        comentario: dlg.querySelector('#reporte-general-texto').value.trim().slice(0, 1000),
        pagina: location.pathname.slice(0, 200)
      });
      estadoEl.textContent = 'Reporte enviado de forma privada. ¡Gracias!';
      boton.textContent = 'Enviado';
      setTimeout(() => { if (dlg.open) dlg.close(); }, 1100);
    } catch {
      estadoEl.textContent = 'No se pudo enviar. Es posible que falte activar la tabla de reportes en Supabase.';
      boton.disabled = false;
    }
  });
  dlg.showModal();
}

// ---------- Pantalla: materia (elegir temas) ----------

// Actividades disponibles en una materia (sin repetir) según el campo "actividad" de sus temas
// "actividad" puede ser un texto o una lista de textos. Devuelve una entrada por (actividad, tema).
function actividadesDe(m) {
  const lista = [];
  for (const t of m.temas) {
    const claves = [].concat(t.actividad || []);
    for (const clave of claves) if (ACTIVIDADES[clave] && clave !== 'cuadro') lista.push({ clave, titulo: ACTIVIDADES[clave].titulo, icono: ACTIVIDADES[clave].icono || '🧩', tema: t });
  }
  // El laboratorio es una actividad autónoma: aparece una sola vez en las materias de Biología.
  if (/biolog/i.test((m.id || '') + ' ' + (m.nombre || ''))) {
    lista.push({ clave: 'operones', titulo: ACTIVIDADES.operones.titulo, icono: ACTIVIDADES.operones.icono, tema: null });
    lista.push({ clave: 'cromosomas', titulo: ACTIVIDADES.cromosomas.titulo, icono: ACTIVIDADES.cromosomas.icono, tema: null });
    lista.push({ clave: 'comunicacion', titulo: ACTIVIDADES.comunicacion.titulo, icono: ACTIVIDADES.comunicacion.icono, tema: null });
    lista.push({ clave: 'proteina-g', titulo: ACTIVIDADES['proteina-g'].titulo, icono: ACTIVIDADES['proteina-g'].icono, tema: null });
    const temaCuadro = m.temas.find(t => [].concat(t.actividad || []).includes('cuadro'));
    if (temaCuadro) lista.push({ clave: 'comparadores', titulo: TITULO_COMPARADORES, icono: '⚖️', tema: temaCuadro });
  }
  return lista;
}

// Temas que tienen crucigrama ("actividad": [..., "crucigrama"]): salen como una fila propia debajo del tema
const tieneCrucigrama = (t) => [].concat(t.actividad || []).includes('crucigrama');

// Mejor resultado guardado de los crucigramas de un tema (el más estrellas y, a igual estrellas, el más rápido)
function mejorCrucigrama(t) {
  let mejor = null;
  for (const [k, g] of Object.entries(estado.crucigramas || {})) {
    if ((k === t.id || k.startsWith(`${t.id}#`)) && g?.mejor) {
      if (!mejor || g.mejor.estrellas > mejor.estrellas || (g.mejor.estrellas === mejor.estrellas && g.mejor.seg < mejor.seg)) mejor = g.mejor;
    }
  }
  return mejor;
}

function vistaSelectorJuegos(m, indiceMateria, actividades) {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver-selector">← ${esc(m.nombre)}</button>
      <div class="titulo-materia"><span class="emoji" aria-hidden="true">🎮</span><h1>Juegos interactivos</h1></div>
      <p class="bajada">Elegí una actividad para explorar el tema de forma visual e interactiva.</p>
      <div class="temas selector-juegos">
        ${actividades.map((a, n) => {
          const detalle = a.tema ? a.tema.nombre : (a.titulo.includes(':') ? a.titulo.slice(a.titulo.indexOf(':') + 1).trim() : 'Actividad interactiva');
          return `<button class="tema-cruci" data-juego="${n}">
            <span class="ic" aria-hidden="true">${esc(a.icono || '🧩')}</span>
            <span class="cuerpo"><span class="nombre">${esc(a.titulo)}</span><span class="detalle">${esc(detalle)}</span></span>
            <b aria-hidden="true">▶</b>
          </button>`;
        }).join('')}
      </div>
    </main>`;
  document.getElementById('btn-volver-selector').addEventListener('click', () => { Sonido.clic(); vistaMateria(indiceMateria); });
  app.querySelectorAll('[data-juego]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const a = actividades[Number(b.dataset.juego)];
    ACTIVIDADES[a.clave].abrir({ app, volver: () => vistaSelectorJuegos(m, indiceMateria, actividades), tema: a.tema, materia: m });
  }));
  window.scrollTo(0, 0);
}

function vistaSelectorCrucigramas(m, indiceMateria) {
  const temas = m.temas.filter(tieneCrucigrama);
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver-selector">← ${esc(m.nombre)}</button>
      <div class="titulo-materia"><span class="emoji" aria-hidden="true">🔤</span><h1>Crucigramas</h1></div>
      <p class="bajada">Elegí el tema del crucigrama que querés resolver.</p>
      <div class="temas selector-crucigramas">
        ${temas.map((t, n) => {
          const rec = mejorCrucigrama(t);
          return `<button class="tema-cruci" data-crucigrama="${n}">
            <span class="ic" aria-hidden="true">🔤</span>
            <span class="cuerpo"><span class="nombre">${esc(t.nombre)}</span><span class="detalle">Completá el tablero con las pistas</span></span>
            ${rec ? `<span class="mejor">${'★'.repeat(rec.estrellas)}</span>` : '<b aria-hidden="true">▶</b>'}
          </button>`;
        }).join('')}
      </div>
    </main>`;
  document.getElementById('btn-volver-selector').addEventListener('click', () => { Sonido.clic(); vistaMateria(indiceMateria); });
  app.querySelectorAll('[data-crucigrama]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    abrirCrucigrama({ app, volver: () => vistaSelectorCrucigramas(m, indiceMateria), tema: temas[Number(b.dataset.crucigrama)], materia: m });
  }));
  window.scrollTo(0, 0);
}

function vistaMateria(i) {
  const m = indice.materias[i];
  const color = colorMateria(m, i);
  const opcionesCantidad = [[10, '10'], [20, '20'], [0, 'Todas']];

  const filas = m.temas.map((t, n) => {
    const mejor = estado.mejores[t.id];
    const nPreg = t.preguntas || 0;
    const nTarj = t.tarjetas || 0;

    let textoDetalle = '';
    if (nPreg > 0 && nTarj > 0) {
      textoDetalle = `${plural(nPreg, 'pregunta', 'preguntas')} · ${plural(nTarj, 'tarjeta', 'tarjetas')}`;
    } else if (nTarj > 0) {
      textoDetalle = plural(nTarj, 'tarjeta', 'tarjetas');
    } else {
      textoDetalle = plural(nPreg, 'pregunta', 'preguntas');
    }

    if (dominadasDe(t)) {
      textoDetalle += ` · ${dominadasDe(t)} dominadas`;
    }

    // Un tema que solo tiene crucigrama (sin preguntas ni tarjetas) no se muestra como tema: solo su fila de crucigrama
    const soloCruci = tieneCrucigrama(t) && nPreg === 0 && nTarj === 0;
    const fila = soloCruci ? '' : `
      <label class="tema" style="--c:${color}">
        <input type="checkbox" data-n="${n}" checked>
        <span class="cuerpo">
          <span class="nombre">${esc(t.nombre)}</span><br>
          <span class="detalle">${textoDetalle}</span>
        </span>
        ${mejor ? `<span class="mejor ${mejor.precision >= 80 ? 'alto' : ''}">Mejor ${mejor.precision}%</span>` : ''}
      </label>`;

    return fila;
  }).join('');

  const actividades = actividadesDe(m);

  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Materias</button>
      <div class="titulo-materia">
        <span class="emoji" aria-hidden="true">${esc(m.emoji || '📚')}</span>
        <h1>${esc(m.nombre)}</h1>
      </div>
      ${actividades.length ? `<button class="banner-repaso" id="btn-grupo-juegos"><span>🎮 Juegos interactivos<small>${plural(actividades.length, 'juego disponible', 'juegos disponibles')} · elegí cuál abrir</small></span><b>▶</b></button>` : ''}
      ${m.temas.some(tieneCrucigrama) ? `<button class="banner-repaso" id="btn-grupo-crucigramas"><span>🔤 Crucigramas<small>${plural(m.temas.filter(tieneCrucigrama).length, 'crucigrama disponible', 'crucigramas disponibles')} · elegí un tema</small></span><b>▶</b></button>` : ''}
      <div class="temas-barra">
        <span>Temas</span>
        <button class="btn enlace" id="btn-todos"></button>
      </div>
      <div class="temas">${filas}</div>
    </main>
    <div class="pie-fijo">
      <div class="interior">
        <div class="segmentos" role="radiogroup" aria-label="Cantidad de preguntas">
          ${opcionesCantidad.map(([v, txt]) => `
            <label><input type="radio" name="cantidad" value="${v}" ${estado.cantidad === v ? 'checked' : ''}><span>${txt}</span></label>`).join('')}
        </div>
        <div class="grupo-botones">
          <button class="btn primario" id="btn-empezar"></button>
        </div>
      </div>
    </div>`;

  const checks = [...app.querySelectorAll('.tema input')];
  const btnEmpezar = document.getElementById('btn-empezar');
  const btnTodos = document.getElementById('btn-todos');

  const seleccionados = () => checks.filter((c) => c.checked).map((c) => m.temas[Number(c.dataset.n)]);
  const cantidadElegida = () => Number(app.querySelector('input[name="cantidad"]:checked')?.value ?? 10);

  function actualizar() {
    const sel = seleccionados();
    const totalPreg = sel.reduce((s, t) => s + (t.preguntas || 0), 0);
    const totalTarj = sel.reduce((s, t) => s + (t.tarjetas || 0), 0);
    const c = cantidadElegida();
    const jugar = c === 0 ? totalPreg : Math.min(c, totalPreg);

    if (sel.length === 0) {
      btnEmpezar.disabled = true;
      btnEmpezar.textContent = 'Elegí un tema';
    } else if (totalPreg === 0 && totalTarj > 0) {
      btnEmpezar.disabled = false;
      btnEmpezar.textContent = `🃏 Ver tarjetas (${totalTarj})`;
    } else {
      btnEmpezar.disabled = totalPreg === 0;
      btnEmpezar.textContent = `Empezar (${jugar})`;
    }

    btnTodos.textContent = sel.length === checks.length ? 'Quitar todos' : 'Elegir todos';
  }

  checks.forEach((c) => c.addEventListener('change', () => { Sonido.clic(); actualizar(); }));
  app.querySelectorAll('input[name="cantidad"]').forEach((r) =>
    r.addEventListener('change', () => { estado.cantidad = cantidadElegida(); guardar(); Sonido.clic(); actualizar(); }));
  btnTodos.addEventListener('click', () => {
    const marcar = seleccionados().length !== checks.length;
    checks.forEach((c) => (c.checked = marcar));
    Sonido.clic();
    actualizar();
  });
  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  document.getElementById('btn-grupo-juegos')?.addEventListener('click', () => {
    Sonido.clic();
    vistaSelectorJuegos(m, i, actividades);
  });
  document.getElementById('btn-grupo-crucigramas')?.addEventListener('click', () => {
    Sonido.clic();
    vistaSelectorCrucigramas(m, i);
  });

  btnEmpezar.addEventListener('click', () => {
    Sonido.clic();
    const sel = seleccionados();
    const totalPreg = sel.reduce((s, t) => s + (t.preguntas || 0), 0);
    const totalTarj = sel.reduce((s, t) => s + (t.tarjetas || 0), 0);

    if (totalPreg === 0 && totalTarj > 0) {
      lanzarTarjetasTemas(m, sel);
    } else {
      lanzarTemas(m, sel, cantidadElegida());
    }
  });

  actualizar();
  window.scrollTo(0, 0);
}

// ---------- Armado de partidas ----------

async function lanzarTemas(materia, temas, cantidad) {
  vistaCargando('Preparando preguntas…');
  try {
    let pool = [];
    for (const t of temas) pool.push(...(await cargarTema(t, materia)));
    pool = mezclar(pool);
    if (cantidad > 0) pool = pool.slice(0, cantidad);
    empezarJuego(pool, {
      titulo: materia.nombre,
      temaId: temas.length === 1 ? temas[0].id : null,
      ranking: true,
      materiaNombre: materia.nombre,
      temaNombre: temas.length === 1 ? temas[0].nombre : 'Varios temas',
      repetir: () => lanzarTemas(materia, temas, cantidad),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

async function lanzarErrores() {
  vistaCargando('Buscando tus errores…');
  try {
    let pool = [];
    for (const m of indice.materias) {
      for (const t of m.temas) pool.push(...(await cargarTema(t, m)));
    }
    pool = mezclar(pool.filter((q) => estado.errores[q.id]));
    if (!pool.length) {
      estado.errores = {};
      guardar();
      vistaInicio();
      avisar('No quedan errores por repasar');
      return;
    }
    empezarJuego(pool, {
      titulo: 'Repaso de errores',
      temaId: null,
      repetir: () => lanzarErrores(),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

async function lanzarDificiles() {
  vistaCargando('Buscando las preguntas más difíciles…');
  try {
    let filas;
    try {
      filas = await preguntasDificiles(MIN_DATOS, 60);
    } catch {
      vistaInicio();
      avisar('No se pudo leer la estadística');
      return;
    }
    const todas = await cargarTodas();
    const dificiles = filas.map((f) => todas.get(f.pregunta_id)).filter(Boolean);
    if (dificiles.length < 5) {
      vistaInicio();
      avisar('Todavía no hay datos suficientes');
      return;
    }
    const cuantas = estado.cantidad === 0 ? 20 : Math.max(estado.cantidad, 10);
    empezarJuego(mezclar(dificiles.slice(0, cuantas)), {
      titulo: 'Las más difíciles',
      temaId: null,
      repetir: () => lanzarDificiles(),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

function vistaError(e) {
  console.error(e);
  app.innerHTML = `
    <main class="pantalla">
      <div class="vacio">
        <strong>No se pudieron cargar las preguntas</strong>
        ${esc(e.message || e)}<br><br>
        Si abriste <code>index.html</code> con doble clic, el navegador bloquea la lectura de archivos.
        Levantá un servidor local con <code>python -m http.server</code> y entrá a
        <code>http://localhost:8000</code>.
      </div>
      <p style="margin-top:1rem"><button class="btn secundario" id="btn-reintentar">Volver al inicio</button></p>
    </main>`;
  document.getElementById('btn-reintentar').addEventListener('click', iniciar);
}

// ---------- Pantalla: juego ----------

function empezarJuego(pool, meta) {
  if (!pool.length) {
    vistaInicio();
    avisar('No hay preguntas para jugar');
    return;
  }
  cargarDificultad(pool.map((q) => q.id));
  juego = {
    meta,
    preguntas: pool.map((q) => ({ ...q, orden: mezclar([0, 1, 2, 3]) })),
    i: 0,
    puntos: 0,
    racha: 0,
    mejorRacha: 0,
    aciertos: 0,
    falladas: [],
    intentos: [],
    respondida: false,
  };

  app.innerHTML = `
    <main class="pantalla">
      <div class="hud">
        <button class="icono" id="btn-salir" aria-label="Salir de la partida">✕</button>
        <div class="progreso" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${pool.length}" aria-valuenow="0"><div class="barra" id="barra"></div></div>
        <div class="puntos"><b id="puntos-n">0</b> pts</div>
        <div class="racha" id="racha" aria-label="Racha"><span class="llama" aria-hidden="true">🔥</span><span id="racha-n">0</span></div>
      </div>
      <div id="zona"></div>
    </main>`;

  document.getElementById('btn-salir').addEventListener('click', () => {
    if (window.confirm('¿Salir de la partida? Se pierde el progreso de esta ronda.')) {
      Sonido.clic();
      const volver = juego.meta.volver;
      enviarIntentos(juego);
      juego = null;
      volver();
    }
  });

  mostrarPregunta();
  window.scrollTo(0, 0);
}

function actualizarRacha(subio) {
  const caja = document.getElementById('racha');
  document.getElementById('racha-n').textContent = juego.racha;
  caja.classList.toggle('caliente', juego.racha >= 3);
  if (subio) {
    caja.classList.remove('sube');
    void caja.offsetWidth;
    caja.classList.add('sube');
  }
}

function mostrarPregunta() {
  const j = juego;
  const q = j.preguntas[j.i];
  j.respondida = false;

  document.getElementById('barra').style.width = `${(j.i / j.preguntas.length) * 100}%`;

  document.getElementById('zona').innerHTML = `
    <p class="contador">Pregunta ${j.i + 1} de ${j.preguntas.length}</p>
    <div class="tarjeta-pregunta" id="tarjeta">
      <p class="tema-etq">${esc(q.tema)}</p>
      <h2 class="pregunta">${esc(q.texto)}</h2>
      ${q.imagen ? `
        <figure class="q-figura">
          <a href="${esc(q.imagen)}" target="_blank" rel="noopener" aria-label="Abrir la imagen en tamaño completo">
            <img src="${esc(q.imagen)}" alt="${esc(q.imagenAlt)}" loading="eager" decoding="async">
          </a>
        </figure>` : ''}
      ${rankingActivo() ? `
        <div class="pie-tarjeta">
          <button class="reportar" id="btn-reportar" type="button" ${estado.reportadas?.[q.id] ? 'disabled' : ''}>
            ${estado.reportadas?.[q.id] ? '✓ Reportada' : '⚑ Reportar pregunta'}
          </button>
        </div>` : ''}
    </div>
    <div class="opciones" id="opciones" role="group" aria-label="Opciones de respuesta">
      ${q.orden.map((oi, pos) => `
        <button class="opcion" data-pos="${pos}">
          <span class="letra" aria-hidden="true">${LETRAS[pos]}</span>
          <span>${esc(q.opciones[oi])}</span>
        </button>`).join('')}
    </div>
    <div class="feedback" id="feedback" aria-live="polite"></div>
    <div class="acciones"><button class="btn primario" id="btn-sig" hidden></button></div>
    <p class="ayuda-teclas">Teclado: 1 a 4 (o A a D) para responder, Enter para seguir.</p>`;

  document.querySelectorAll('.opcion').forEach((b) =>
    b.addEventListener('click', () => responder(Number(b.dataset.pos))));
  document.getElementById('btn-sig').addEventListener('click', siguiente);
  document.getElementById('btn-reportar')?.addEventListener('click', (e) => abrirReporte(q, e.currentTarget));
  document.querySelector('.q-figura img')?.addEventListener('error', (e) => {
    e.currentTarget.closest('.q-figura').innerHTML = '<p class="q-figura-error">No se pudo cargar la imagen.</p>';
  });
}

function responder(pos) {
  const j = juego;
  if (!j || j.respondida) return;
  j.respondida = true;

  const q = j.preguntas[j.i];
  const acerto = q.orden[pos] === q.correcta;
  const feedback = document.getElementById('feedback');

  j.intentos.push({
    pregunta_id: q.id,
    tema_id: q.temaId,
    pregunta: q.texto.slice(0, 160),
    acierto: acerto,
    modo: j.meta.ranking ? 'ronda' : 'repaso',
  });

  document.getElementById('opciones').classList.add('bloqueadas');
  document.querySelectorAll('.opcion').forEach((b, p) => {
    if (q.orden[p] === q.correcta) b.classList.add('ok');
    else if (p === pos) b.classList.add('mal');
    else b.classList.add('apagada');
  });

  let veredicto;
  if (acerto) {
    j.racha++;
    j.aciertos++;
    j.mejorRacha = Math.max(j.mejorRacha, j.racha);
    const ganado = 100 + Math.min(j.racha - 1, 10) * 10;
    j.puntos += ganado;
    delete estado.errores[q.id];
    (estado.dominadas[q.temaId] ||= {})[q.id] = 1;
    Sonido.acierto(j.racha);
    actualizarRacha(true);

    const esHito = HITOS.includes(j.racha);
    if (esHito) {
      setTimeout(() => {
        Sonido.hito();
        avisar(`¡Racha de ${j.racha}!`);
        lanzarConfeti(j.racha >= 10 ? 140 : 70);
      }, 250);
    }
    veredicto = `<p class="veredicto ok">¡Correcto! +${ganado}</p>`;
  } else {
    const perdida = j.racha;
    j.racha = 0;
    j.falladas.push(q);
    estado.errores[q.id] = 1;
    Sonido.error(perdida >= 3);
    actualizarRacha(false);
    document.getElementById('tarjeta').classList.add('tiembla');
    veredicto = `<p class="veredicto mal">Incorrecto${perdida >= 3 ? `: se corta la racha de ${perdida}` : ''}</p>`;
  }
  guardar();

  feedback.innerHTML = veredicto + (q.explicacion ? `<p class="explicacion">${esc(q.explicacion)}</p>` : '') + textoDificultad(q.id);

  const ultima = j.i === j.preguntas.length - 1;
  document.getElementById('barra').style.width = `${((j.i + 1) / j.preguntas.length) * 100}%`;
  document.querySelector('.progreso').setAttribute('aria-valuenow', String(j.i + 1));
  const btn = document.getElementById('btn-sig');
  btn.textContent = ultima ? 'Ver resultado' : 'Siguiente';
  btn.hidden = false;
  btn.focus({ preventScroll: true });
  btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  document.getElementById('puntos-n').textContent = j.puntos;
}

function siguiente() {
  const j = juego;
  if (!j || !j.respondida) return;
  j.respondida = false;
  Sonido.clic();
  j.i++;
  if (j.i >= j.preguntas.length) vistaResultado();
  else mostrarPregunta();
}

// ---------- Dificultad real y reportes ----------

function enviarIntentos(j) {
  if (!j || !j.intentos.length) return;
  const filas = j.intentos;
  j.intentos = [];
  if (rankingActivo()) registrarIntentos(filas).catch(() => {});
}

const MOTIVOS_REPORTE = [
  ['respuesta_incorrecta', 'La respuesta marcada como correcta está mal'],
  ['enunciado', 'El enunciado es confuso o tiene errores'],
  ['opciones', 'Las opciones están mal armadas'],
  ['imagen', 'La imagen no se ve o no corresponde'],
  ['otro', 'Otro motivo'],
];

function abrirReporte(q, boton) {
  const motivos = MOTIVOS_REPORTE.filter(([clave]) => clave !== 'imagen' || q.imagen);
  const dlg = document.createElement('dialog');
  dlg.className = 'reporte';
  dlg.setAttribute('aria-labelledby', 'reporte-titulo');
  dlg.innerHTML = `
    <h2 id="reporte-titulo">Reportar pregunta</h2>
    <p class="reporte-texto">${esc(q.texto)}</p>
    <label class="campo">
      <span>¿Qué está mal?</span>
      <select id="reporte-motivo">
        ${motivos.map(([clave, txt]) => `<option value="${clave}">${esc(txt)}</option>`).join('')}
      </select>
    </label>
    <label class="campo">
      <span>Comentario (opcional)</span>
      <textarea id="reporte-comentario" rows="3" maxlength="300" placeholder="Contanos qué viste mal"></textarea>
    </label>
    <p class="reporte-estado" id="reporte-estado" role="status"></p>
    <div class="reporte-botones">
      <button class="btn secundario" id="reporte-cancelar" type="button">Cancelar</button>
      <button class="btn primario" id="reporte-enviar" type="button">Enviar</button>
    </div>`;
  document.body.appendChild(dlg);

  const estadoEl = dlg.querySelector('#reporte-estado');
  const btnEnviar = dlg.querySelector('#reporte-enviar');
  dlg.querySelector('#reporte-cancelar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => dlg.remove());

  btnEnviar.addEventListener('click', async () => {
    btnEnviar.disabled = true;
    estadoEl.textContent = 'Enviando…';
    try {
      await enviarReporte({
        pregunta_id: q.id,
        tema_id: q.temaId,
        pregunta: q.texto.slice(0, 300),
        correcta: q.opciones[q.correcta].slice(0, 200),
        motivo: dlg.querySelector('#reporte-motivo').value,
        comentario: dlg.querySelector('#reporte-comentario').value.trim().slice(0, 300) || null,
        apodo: estado.apodo || null,
      });
      (estado.reportadas ||= {})[q.id] = 1;
      guardar();
      if (boton?.isConnected) { boton.disabled = true; boton.textContent = '✓ Reportada'; }
      dlg.close();
      avisar('¡Gracias por avisar!');
    } catch {
      btnEnviar.disabled = false;
      estadoEl.textContent = 'No se pudo enviar. Probá de nuevo.';
    }
  });

  dlg.showModal();
}

// ---------- Pantalla: resultado ----------

function filasProgreso(preguntas) {
  const ids = new Set(preguntas.map((q) => q.temaId));
  const filas = [];
  for (const m of indice.materias) {
    for (const t of m.temas) {
      if (!ids.has(t.id)) continue;
      filas.push({
        apodo: estado.apodo,
        materia: m.nombre,
        tema_id: t.id,
        tema: t.nombre,
        dominadas: dominadasDe(t),
        total: t.preguntas,
        mejor_precision: estado.mejores[t.id]?.precision || 0,
      });
    }
  }
  return filas;
}

function vistaResultado() {
  const j = juego;
  const total = j.preguntas.length;
  const precision = Math.round((j.aciertos / total) * 100);

  if (j.meta.temaId) {
    const prev = estado.mejores[j.meta.temaId] || { precision: 0, puntos: 0, racha: 0 };
    estado.mejores[j.meta.temaId] = {
      precision: Math.max(prev.precision, precision),
      puntos: Math.max(prev.puntos, j.puntos),
      racha: Math.max(prev.racha, j.mejorRacha),
    };
  }
  guardar();

  let emoji = '💪', titulo = 'A seguir practicando', sub = 'Repasá las falladas y probá de nuevo.';
  if (precision >= 90) { emoji = '🏆'; titulo = '¡Excelente!'; sub = 'Dominás este material.'; }
  else if (precision >= 70) { emoji = '🎉'; titulo = '¡Muy bien!'; sub = 'Un repaso más y lo tenés.'; }
  else if (precision >= 50) { emoji = '👍'; titulo = 'Vas por buen camino'; sub = 'Mirá las explicaciones de las falladas.'; }

  const falladas = j.falladas.map((q) => `
    <details>
      <summary>${esc(q.texto)}</summary>
      <div class="detalle">
        <p><strong>Respuesta:</strong> ${esc(q.opciones[q.correcta])}</p>
        ${q.explicacion ? `<p>${esc(q.explicacion)}</p>` : ''}
      </div>
    </details>`).join('');

  app.innerHTML = `
    <main class="pantalla resultado">
      <div class="grande" aria-hidden="true">${emoji}</div>
      <h1>${titulo}</h1>
      <p class="sub">${sub}</p>
      <div class="cifras">
        <div class="cifra"><b>${j.puntos}</b><span>Puntos</span></div>
        <div class="cifra"><b>${precision}%</b><span>${j.aciertos} de ${total}</span></div>
        <div class="cifra"><b>${j.mejorRacha}</b><span>Mejor racha</span></div>
      </div>
      <p class="estado-ranking" id="estado-ranking" role="status"></p>
      <div class="botones">
        <button class="btn primario" id="btn-otra">Jugar de nuevo</button>
        ${j.falladas.length ? `<button class="btn secundario" id="btn-falladas">Repasar falladas (${j.falladas.length})</button>` : ''}
        <button class="btn secundario" id="btn-inicio">Inicio</button>
      </div>
      ${j.falladas.length ? `<section class="falladas"><h2>Para repasar</h2>${falladas}</section>` : ''}
    </main>`;

  const { meta } = j;
  const falladasPool = j.falladas;
  enviarIntentos(j);
  juego = null;

  if (rankingActivo() && meta.ranking) {
    const estadoEl = document.getElementById('estado-ranking');
    if (!estado.apodo) {
      estadoEl.textContent = 'Elegí un apodo en el inicio para aparecer en el ranking.';
    } else {
      estadoEl.textContent = 'Guardando en el ranking…';
      guardarPartida({
        apodo: estado.apodo,
        materia: meta.materiaNombre,
        tema: meta.temaNombre,
        aciertos: j.aciertos,
        total,
        puntos: j.puntos,
        rachaMax: j.mejorRacha,
      }).then(
        () => { const el = document.getElementById('estado-ranking'); if (el) el.textContent = '✓ Guardado en el ranking'; },
        () => { const el = document.getElementById('estado-ranking'); if (el) el.textContent = 'No se pudo guardar en el ranking.'; },
      );
    }
  }

  if (rankingActivo() && estado.apodo) {
    guardarProgreso(filasProgreso(j.preguntas)).catch(() => {});
    registrarSesion({
      apodo: estado.apodo,
      modo: meta.ranking ? 'ronda' : 'repaso',
      materia: String(meta.materiaNombre || meta.titulo || '').slice(0, 80),
      tema: String(meta.temaNombre || '').slice(0, 80),
      aciertos: j.aciertos,
      total,
      puntos: j.puntos,
      racha_max: j.mejorRacha,
      ...infoDispositivo(),
    }).catch(() => {});
  }

  document.getElementById('btn-otra').addEventListener('click', () => { Sonido.clic(); meta.repetir(); });
  document.getElementById('btn-falladas')?.addEventListener('click', () => {
    Sonido.clic();
    const metaFalladas = { ...meta, temaId: null, ranking: false };
    empezarJuego(falladasPool, { ...metaFalladas, titulo: 'Repaso de falladas', repetir: () => empezarJuego(falladasPool, metaFalladas) });
  });
  document.getElementById('btn-inicio').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });

  const bueno = precision >= 70;
  Sonido.fin(bueno);
  if (bueno) lanzarConfeti(precision >= 90 ? 160 : 100);
  window.scrollTo(0, 0);
}

// ---------- Visitas: quién entra a la página ----------

// Identificador anónimo y estable de este navegador (para reconocer a la misma persona entre visitas).
function idVisitante() {
  try {
    let id = localStorage.getItem('parcialito_visitante');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
      localStorage.setItem('parcialito_visitante', id);
    }
    return id;
  } catch (_) {
    return null;   // sin almacenamiento: no se puede reconocer al visitante
  }
}

// evento: 'entrada' (abrió la página) o 'apodo' (eligió o cambió su apodo: vincula el ID con el nombre).
function anotarVisita(evento) {
  if (!rankingActivo()) return;
  const visitante = idVisitante();
  if (!visitante) return;
  registrarVisita({
    visitante,
    apodo: estado.apodo || null,
    evento,
    ...infoDispositivo(),
  }).catch(() => {});
}

// Una "entrada" por sesión del navegador (recargar no cuenta como visita nueva).
function anotarEntrada() {
  try {
    if (sessionStorage.getItem('parcialito_entrada')) return;
    sessionStorage.setItem('parcialito_entrada', '1');
  } catch (_) { /* sin sessionStorage: se registra igual */ }
  anotarVisita('entrada');
}

// ---------- Pantallas: apodo, ranking e historial ----------

function vistaApodo() {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Inicio</button>
      <h1 class="titulo-seccion">Tu apodo</h1>
      <p class="bajada">Es el nombre que se ve en el ranking. Podés cambiarlo cuando quieras.</p>
      <form class="form-apodo" id="form-apodo">
        <input id="inp-apodo" type="text" maxlength="20" autocomplete="off"
               placeholder="Ej: Gonza" aria-label="Apodo" value="${esc(estado.apodo)}">
        <button class="btn primario" type="submit">Guardar</button>
      </form>
      ${estado.apodo ? '<button class="btn secundario" id="btn-historial">Ver mi historial</button>' : ''}
      <p class="aviso-datos">Al entrar a la página se registra la visita (con tu apodo, si ya lo elegiste). Al terminar una ronda se guardan tu apodo, tus resultados y datos básicos de tu dispositivo (navegador, sistema, pantalla, idioma y zona horaria) para estadísticas. También se registra, sin tu apodo, si cada pregunta se respondió bien o mal. El ranking solo muestra apodo y puntos.</p>
    </main>`;

  const input = document.getElementById('inp-apodo');
  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  document.getElementById('btn-historial')?.addEventListener('click', () => {
    Sonido.clic();
    vistaHistorial(estado.apodo, vistaApodo);
  });
  document.getElementById('form-apodo').addEventListener('submit', (e) => {
    e.preventDefault();
    const apodo = limpiarApodo(input.value);
    if (!apodo) { avisar('Escribí un apodo'); input.focus(); return; }
    estado.apodo = apodo;
    guardar();
    anotarVisita('apodo');
    Sonido.clic();
    vistaInicio();
    avisar(`Listo, ${apodo}`);
  });
  window.scrollTo(0, 0);
  input.focus();
}

let pedidoRanking = 0;

function vistaRanking(iMateria = 0, tema = '') {
  if (!indice.materias.length) { vistaInicio(); return; }
  const m = indice.materias[iMateria];

  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Inicio</button>
      <h1 class="titulo-seccion">🏆 Ranking</h1>
      <div class="chips" role="group" aria-label="Materia">
        ${indice.materias.map((x, i) => `
          <button class="chip ${i === iMateria ? 'activo' : ''}" data-i="${i}">${esc(x.nombre)}</button>`).join('')}
      </div>
      <label class="filtro-tema">
        <span>Tema</span>
        <select id="sel-tema">
          <option value="">Todos</option>
          <option value="Varios temas" ${tema === 'Varios temas' ? 'selected' : ''}>Varios temas (mezclados)</option>
          ${m.temas.map((t) => `<option value="${esc(t.nombre)}" ${t.nombre === tema ? 'selected' : ''}>${esc(t.nombre)}</option>`).join('')}
        </select>
      </label>
      <p class="nota-ranking">Se muestra la mejor partida de cada apodo, ordenada por puntos.</p>
      <div id="lista-ranking"><p class="estado-ranking">Cargando…</p></div>
    </main>`;

  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  app.querySelectorAll('.chip').forEach((b) =>
    b.addEventListener('click', () => { Sonido.clic(); vistaRanking(Number(b.dataset.i)); }));
  document.getElementById('sel-tema').addEventListener('change', (e) => {
    Sonido.clic();
    vistaRanking(iMateria, e.target.value);
  });
  window.scrollTo(0, 0);

  const mio = ++pedidoRanking;
  const caja = document.getElementById('lista-ranking');
  rankingMateria(m.nombre, tema || null).then((filas) => {
    if (mio !== pedidoRanking) return;
    if (!filas.length) {
      caja.innerHTML = '<p class="estado-ranking">Todavía nadie jugó acá. ¡Sé el primero!</p>';
      return;
    }
    caja.innerHTML = `<ol class="lista-ranking">${filas.map((f, n) => `
      <li class="${estado.apodo && f.apodo.toLowerCase() === estado.apodo.toLowerCase() ? 'yo' : ''}">
        <span class="pos">${n + 1}</span>
        <button class="nombre-jugador" data-apodo="${esc(f.apodo)}">${esc(f.apodo)}</button>
        <span class="detalle-fila">${esc(f.tema)} · ${f.aciertos}/${f.total}</span>
        <b class="pts">${f.puntos}</b>
      </li>`).join('')}</ol>`;
    caja.querySelectorAll('.nombre-jugador').forEach((b) =>
      b.addEventListener('click', () => {
        Sonido.clic();
        vistaHistorial(b.dataset.apodo, () => vistaRanking(iMateria, tema));
      }));
  }).catch(() => {
    if (mio !== pedidoRanking) return;
    caja.innerHTML = '<p class="estado-ranking">No se pudo cargar el ranking. Probá de nuevo en un rato.</p>';
  });
}

function vistaHistorial(apodo, volver) {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Volver</button>
      <h1 class="titulo-seccion">Historial de ${esc(apodo)}</h1>
      <div id="lista-historial"><p class="estado-ranking">Cargando…</p></div>
    </main>`;
  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
  window.scrollTo(0, 0);

  const caja = document.getElementById('lista-historial');
  Promise.all([historialDe(apodo), progresoDe(apodo).catch(() => [])]).then(([filas, progreso]) => {
    if (!caja.isConnected) return;
    if (!filas.length && !progreso.length) {
      caja.innerHTML = '<p class="estado-ranking">Todavía no hay partidas guardadas.</p>';
      return;
    }
    const bloqueProgreso = progreso.length ? `
      <h2 class="subtitulo">Progreso por tema</h2>
      <ul class="lista-progreso">${progreso.map((p) => {
        const pct = Math.round((p.dominadas / p.total) * 100);
        return `
          <li>
            <div class="cuerpo">
              <span class="nombre">${esc(p.materia)} · ${esc(p.tema)}</span>
              <span class="riel"><span class="relleno" style="width:${pct}%"></span></span>
            </div>
            <span class="pct">${pct}%<small>${p.dominadas}/${p.total}</small></span>
          </li>`;
      }).join('')}</ul>
      ${filas.length ? '<h2 class="subtitulo">Partidas</h2>' : ''}` : '';
    caja.innerHTML = bloqueProgreso + `<ul class="lista-historial">${filas.map((f) => {
      const pct = Math.round((f.aciertos / f.total) * 100);
      const fecha = new Date(f.creado).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `
        <li>
          <div class="cuerpo">
            <span class="nombre">${esc(f.materia)} · ${esc(f.tema)}</span>
            <span class="detalle">${fecha} · ${f.aciertos}/${f.total} (${pct}%) · racha ${f.racha_max}</span>
          </div>
          <b class="pts">${f.puntos}</b>
        </li>`;
    }).join('')}</ul>`;
  }).catch(() => {
    if (caja.isConnected) caja.innerHTML = '<p class="estado-ranking">No se pudo cargar el historial.</p>';
  });
}

// ---------- Teclado ----------

document.addEventListener('keydown', (e) => {
  if ((!juego && !sesionT) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest?.('dialog, input, textarea, select')) return;
  const k = e.key.toLowerCase();
  if (sesionT) {
    if (k === ' ' || k === 'enter') { e.preventDefault(); if (sesionT.volteada) valorarTarjeta(3); else voltearTarjeta(); }
    else if (sesionT.volteada && ['1', '2', '3', '4'].includes(k)) valorarTarjeta(Number(k));
    return;
  }
  if (!juego.respondida) {
    const pos = ['1', '2', '3', '4'].indexOf(k);
    const pos2 = ['a', 'b', 'c', 'd'].indexOf(k);
    if (pos >= 0) responder(pos);
    else if (pos2 >= 0) responder(pos2);
  } else if (k === 'enter' || k === ' ') {
    e.preventDefault();
    siguiente();
  }
});

document.addEventListener('pointerdown', () => Sonido.iniciar(), { once: true });
document.addEventListener('keydown', () => Sonido.iniciar(), { once: true });

// ---------- Arranque ----------

async function iniciar() {
  vistaCargando('Cargando materias…');
  try {
    const r = await fetch('data/index.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`No se pudo leer data/index.json (${r.status})`);
    indice = await r.json();
    indice.materias = indice.materias || [];
    iniciarDetectorActualizaciones(indice.generado);
    if (estado.srs) { delete estado.srs; guardar(); }
    vistaInicio();
    cargarTodas().then(pintarTarjetasInicio).catch(() => {});
  } catch (e) {
    vistaError(e);
  }
}

anotarEntrada();
iniciar();
