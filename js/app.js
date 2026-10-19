// ==========================================================
// app.js: pantallas y lógica del juego.
// Flujo: inicio (materias) -> materia (temas) -> juego -> resultado
// Los datos se leen de data/index.json (lo genera tools/actualizar_indice.py).
// ==========================================================

import { estado, guardar, hash } from './store.js';
import { Sonido } from './sonido.js';
import { lanzarConfeti } from './confeti.js';
import { rankingActivo, limpiarApodo, guardarPartida, guardarProgreso, registrarSesion, rankingMateria, historialDe, progresoDe, registrarIntentos, enviarReporte, dificultadDe, preguntasDificiles } from './ranking.js';
import { infoDispositivo } from './dispositivo.js';

const app = document.getElementById('app');
const avisoEl = document.getElementById('aviso');

const LETRAS = ['A', 'B', 'C', 'D'];
const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF', '#FF8A5C'];
const HITOS = [3, 5, 10, 15, 20, 30, 50];   // rachas que disparan festejo

let indice = null;          // contenido de data/index.json
const cache = new Map();    // idTema -> preguntas ya cargadas
let juego = null;           // partida en curso (null si no hay)
let simu = null;            // simulacro en curso (null si no hay)
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

function vistaCargando(texto) {
  app.innerHTML = `<div class="cargando"><div class="giro" aria-hidden="true"></div><p>${esc(texto)}</p></div>`;
}

function colorMateria(m, i) {
  return /^#[0-9a-f]{6}$/i.test(m.color || '') ? m.color : COLORES[i % COLORES.length];
}

// ---------- Datos ----------

// Solo acepta https:// o rutas relativas (nada de javascript:, data: ni //otro-sitio)
function urlImagen(valor) {
  const u = String(valor || '').trim();
  return /^https:\/\/\S+$/i.test(u) || /^(?!\/)[\w./%-]+$/.test(u) ? u : '';
}

// Convierte el JSON de un tema en preguntas listas para jugar.
// Las preguntas inválidas se descartan (y se avisa en la consola).
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
  const preguntas = normalizar(await r.json(), tema, materia);
  // Si editaste o borraste preguntas, las "dominadas" viejas dejan de contar
  if (estado.dominadas[tema.id]) {
    const vigentes = new Set(preguntas.map((q) => q.id));
    for (const id of Object.keys(estado.dominadas[tema.id])) {
      if (!vigentes.has(id)) delete estado.dominadas[tema.id][id];
    }
  }
  cache.set(tema.id, preguntas);
  return preguntas;
}

// Cuántas preguntas del tema respondiste bien al menos una vez
function dominadasDe(tema) {
  return Math.min(Object.keys(estado.dominadas[tema.id] || {}).length, tema.preguntas);
}

function dominio(materia) {
  if (!materia.temas.length) return 0;
  const suma = materia.temas.reduce((s, t) => s + (estado.mejores[t.id]?.precision || 0), 0);
  return Math.round(suma / materia.temas.length);
}

// ---------- Repaso espaciado (cajas de Leitner) ----------

const INTERVALOS = [0, 1, 3, 7, 16, 35];   // días hasta volver a ver una pregunta, según su caja (1 a 5)
const MAX_REPASO = 20;                      // preguntas por sesión de "Repaso de hoy"
const diaHoy = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);

// estado.srs = { idPregunta: { caja, prox } }, donde prox es el número de día en que toca repasarla
function srs() {
  if (!estado.srs) {
    estado.srs = {};
    // Primera vez: arranca con lo que ya había (los errores vencen hoy; lo dominado, en unos días)
    const hoy = diaHoy();
    for (const id of Object.keys(estado.errores || {})) estado.srs[id] = { caja: 1, prox: hoy };
    for (const dom of Object.values(estado.dominadas || {})) {
      for (const id of Object.keys(dom)) {
        if (!estado.srs[id]) estado.srs[id] = { caja: 2, prox: hoy + 1 + (parseInt(id, 36) % 6) };
      }
    }
    guardar();
  }
  return estado.srs;
}

function srsRegistrar(id, acerto) {
  const s = srs(), hoy = diaHoy(), c = s[id];
  if (!acerto) { s[id] = { caja: 1, prox: hoy + INTERVALOS[1] }; return; }
  if (!c) { s[id] = { caja: 2, prox: hoy + INTERVALOS[2] }; return; }
  if (c.prox <= hoy) {   // si todavía no tocaba verla, un acierto extra no la adelanta
    const caja = Math.min(5, c.caja + 1);
    s[id] = { caja, prox: hoy + INTERVALOS[caja] };
  }
}

const repasoPendiente = () => { const hoy = diaHoy(); return Object.values(srs()).filter((v) => v.prox <= hoy).length; };

// Todas las preguntas de todas las materias (id -> pregunta)
async function cargarTodas() {
  const listas = await Promise.all(indice.materias.flatMap((m) => m.temas.map((t) => cargarTema(t, m))));
  const mapa = new Map();
  for (const lista of listas) for (const q of lista) if (!mapa.has(q.id)) mapa.set(q.id, q);
  return mapa;
}

// ---------- Dificultad real (datos de todos los jugadores) ----------

const MIN_DATOS = 10;   // con menos respuestas que esto no se muestra el porcentaje

// Pide en segundo plano la estadística de las preguntas de una ronda (si falla, simplemente no se muestra)
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
  if (simu) { clearInterval(simu.timer); simu = null; }
  const nErrores = Object.keys(estado.errores).length;
  const nRepaso = repasoPendiente();
  const hayAgenda = Object.keys(srs()).length > 0;

  const tarjetas = indice.materias.map((m, i) => {
    const totalPreg = m.temas.reduce((s, t) => s + t.preguntas, 0);
    const pct = dominio(m);
    return `
      <button class="materia" data-materia="${i}" style="--c:${colorMateria(m, i)}">
        <span class="emoji" aria-hidden="true">${esc(m.emoji || '📚')}</span>
        <h2>${esc(m.nombre)}</h2>
        <span class="meta">${plural(m.temas.length, 'tema', 'temas')}, ${plural(totalPreg, 'pregunta', 'preguntas')}</span>
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
        <button class="icono" id="btn-sonido" aria-label="${estado.silencio ? 'Activar sonido' : 'Silenciar'}">${estado.silencio ? '🔇' : '🔊'}</button>
      </header>
      <p class="bajada">Elegí una materia y practicá con preguntas de opción múltiple.</p>
      ${rankingActivo() ? `
        <div class="barra-ranking">
          <button class="btn secundario" id="btn-ranking">🏆 Ranking</button>
          <button class="btn secundario" id="btn-dificiles">🔥 Las más difíciles</button>
          <button class="btn secundario" id="btn-apodo">👤 ${estado.apodo ? esc(estado.apodo) : 'Elegir apodo'}</button>
        </div>` : ''}
      ${nRepaso ? `<button class="banner-repaso" id="btn-repaso"><span>🧠 Repaso de hoy</span><b>${nRepaso}</b></button>`
        : hayAgenda ? '<p class="al-dia">🧠 Repaso al día: no tenés nada pendiente para hoy.</p>' : ''}
      ${nErrores ? `<button class="banner-errores" id="btn-errores"><span>Repasar mis errores</span><b>${nErrores}</b></button>` : ''}
      ${indice.materias.length
        ? `<div class="materias">${tarjetas}</div>`
        : `<div class="vacio"><strong>Todavía no hay materias</strong>
             Agregá archivos <code>.json</code> dentro de <code>data/</code> y corré
             <code>python tools/actualizar_indice.py</code>.</div>`}
    </main>`;

  document.getElementById('btn-sonido').addEventListener('click', alternarSonido);
  document.getElementById('btn-errores')?.addEventListener('click', () => { Sonido.clic(); lanzarErrores(); });
  document.getElementById('btn-repaso')?.addEventListener('click', () => { Sonido.clic(); lanzarRepasoHoy(); });
  document.getElementById('btn-dificiles')?.addEventListener('click', () => { Sonido.clic(); lanzarDificiles(); });
  document.getElementById('btn-ranking')?.addEventListener('click', () => { Sonido.clic(); vistaRanking(); });
  document.getElementById('btn-apodo')?.addEventListener('click', () => { Sonido.clic(); vistaApodo(); });
  app.querySelectorAll('.materia').forEach((b) =>
    b.addEventListener('click', () => { Sonido.clic(); vistaMateria(Number(b.dataset.materia)); }));
}

function alternarSonido() {
  estado.silencio = !estado.silencio;
  guardar();
  const b = document.getElementById('btn-sonido');
  b.textContent = estado.silencio ? '🔇' : '🔊';
  b.setAttribute('aria-label', estado.silencio ? 'Activar sonido' : 'Silenciar');
  Sonido.clic();
}

// ---------- Pantalla: materia (elegir temas) ----------

function vistaMateria(i) {
  const m = indice.materias[i];
  const color = colorMateria(m, i);
  const opcionesCantidad = [[10, '10'], [20, '20'], [0, 'Todas']];

  const filas = m.temas.map((t, n) => {
    const mejor = estado.mejores[t.id];
    return `
      <label class="tema" style="--c:${color}">
        <input type="checkbox" data-n="${n}" checked>
        <span class="cuerpo">
          <span class="nombre">${esc(t.nombre)}</span><br>
          <span class="detalle">${plural(t.preguntas, 'pregunta', 'preguntas')}${dominadasDe(t) ? ` · ${dominadasDe(t)} dominadas` : ''}</span>
        </span>
        ${mejor ? `<span class="mejor ${mejor.precision >= 80 ? 'alto' : ''}">Mejor ${mejor.precision}%</span>` : ''}
      </label>`;
  }).join('');

  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Materias</button>
      <div class="titulo-materia">
        <span class="emoji" aria-hidden="true">${esc(m.emoji || '📚')}</span>
        <h1>${esc(m.nombre)}</h1>
      </div>
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
          <button class="btn secundario" id="btn-simulacro">📝 Simulacro</button>
          <button class="btn primario" id="btn-empezar"></button>
        </div>
      </div>
    </div>`;

  const checks = [...app.querySelectorAll('.tema input')];
  const btnEmpezar = document.getElementById('btn-empezar');
  const btnTodos = document.getElementById('btn-todos');
  const btnSimulacro = document.getElementById('btn-simulacro');

  const seleccionados = () => checks.filter((c) => c.checked).map((c) => m.temas[Number(c.dataset.n)]);
  const cantidadElegida = () => Number(app.querySelector('input[name="cantidad"]:checked')?.value ?? 10);

  function actualizar() {
    const sel = seleccionados();
    const total = sel.reduce((s, t) => s + t.preguntas, 0);
    const c = cantidadElegida();
    const jugar = c === 0 ? total : Math.min(c, total);
    btnEmpezar.disabled = sel.length === 0;
    btnSimulacro.disabled = sel.length === 0;
    btnEmpezar.textContent = sel.length ? `Empezar (${jugar})` : 'Elegí un tema';
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
  btnEmpezar.addEventListener('click', () => {
    Sonido.clic();
    lanzarTemas(m, seleccionados(), cantidadElegida());
  });
  btnSimulacro.addEventListener('click', () => { Sonido.clic(); abrirConfigSimulacro(m, seleccionados()); });

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
      // datos para el ranking público (solo cuentan las rondas normales)
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
      // Los errores guardados ya no existen en los archivos (se editaron o borraron)
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

async function lanzarRepasoHoy() {
  vistaCargando('Armando tu repaso…');
  try {
    const todas = await cargarTodas();
    const s = srs(), hoy = diaHoy();
    let cambio = false;
    for (const id of Object.keys(s)) if (!todas.has(id)) { delete s[id]; cambio = true; }   // preguntas editadas o borradas
    if (cambio) guardar();
    const vencidas = Object.entries(s)
      .filter(([, v]) => v.prox <= hoy)
      .sort((x, y) => x[1].prox - y[1].prox || x[1].caja - y[1].caja);   // primero las más atrasadas
    if (!vencidas.length) {
      vistaInicio();
      avisar('No tenés nada para repasar hoy');
      return;
    }
    const pool = mezclar(vencidas.slice(0, MAX_REPASO).map(([id]) => todas.get(id)));
    empezarJuego(pool, {
      titulo: 'Repaso de hoy',
      temaId: null,
      repetir: () => lanzarRepasoHoy(),
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
    const dificiles = filas.map((f) => todas.get(f.pregunta_id)).filter(Boolean);   // ya vienen de más a menos difícil
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
    // "orden" mezcla las opciones: así no importa en qué lugar las escribió el LM
    preguntas: pool.map((q) => ({ ...q, orden: mezclar([0, 1, 2, 3]) })),
    i: 0,
    puntos: 0,
    racha: 0,
    mejorRacha: 0,
    aciertos: 0,
    falladas: [],
    intentos: [],     // respuestas pendientes de enviar (dificultad real)
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
    void caja.offsetWidth;      // reinicia la animación
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

  srsRegistrar(q.id, acerto);

  // Para la estadística de dificultad: solo si acertó o no (nada personal)
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
    const ganado = 100 + Math.min(j.racha - 1, 10) * 10;   // bonus por racha
    j.puntos += ganado;
    delete estado.errores[q.id];                            // ya lo sabés: sale de "errores"
    (estado.dominadas[q.temaId] ||= {})[q.id] = 1;          // cuenta para el progreso del tema
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
  if (!j || !j.respondida) return;     // evita doble avance (Enter + clic)
  j.respondida = false;
  Sonido.clic();
  j.i++;
  if (j.i >= j.preguntas.length) vistaResultado();
  else mostrarPregunta();
}

// ---------- Dificultad real y reportes ----------

// Manda a Supabase las respuestas acumuladas de la ronda (sin esperar y sin romper nada si falla)
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

// Una fila de progreso por cada tema que apareció en la ronda
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

  // Guarda el mejor resultado solo si jugaste un único tema
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

  // Ranking público: solo las rondas normales (no el repaso de errores ni de falladas)
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

  // Progreso por tema: guarda cuántas preguntas dominás de cada tema que apareció en la ronda
  if (rankingActivo() && estado.apodo) {
    guardarProgreso(filasProgreso(j.preguntas)).catch(() => {});
    // Registro privado de la ronda con datos del dispositivo (no se muestra en la página)
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

// ---------- Simulacro de parcial ----------

const NOTA_APROBACION = 0.6;   // se aprueba con el 60 % de respuestas correctas
const fmtNota = (aciertos, total) => (Math.round((aciertos / total) * 100) / 10).toFixed(1).replace('.', ',');
const fmtTiempo = (seg) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

function abrirConfigSimulacro(materia, temas) {
  const total = temas.reduce((s, t) => s + t.preguntas, 0);
  const cants = [10, 20, 30, 40].filter((n) => n < total);
  cants.push(total);
  const cantInicial = cants.includes(estado.simuConfig?.cant) ? estado.simuConfig.cant : (cants.includes(20) ? 20 : cants[cants.length - 1]);
  const tiempos = [[0, 'Sin límite'], [60, '1 minuto por pregunta'], [90, '1 min 30 s por pregunta'], [120, '2 minutos por pregunta']];
  const segInicial = tiempos.some(([v]) => v === estado.simuConfig?.seg) ? estado.simuConfig.seg : 90;

  const dlg = document.createElement('dialog');
  dlg.className = 'reporte';
  dlg.setAttribute('aria-labelledby', 'sim-titulo');
  dlg.innerHTML = `
    <h2 id="sim-titulo">📝 Simulacro de parcial</h2>
    <p class="reporte-texto">Preguntas mezcladas de los temas elegidos. No ves si acertaste hasta entregar.</p>
    <label class="campo">
      <span>Cantidad de preguntas</span>
      <select id="sim-cant">${cants.map((n) => `<option value="${n}" ${n === cantInicial ? 'selected' : ''}>${n === total ? `Todas (${n})` : n}</option>`).join('')}</select>
    </label>
    <label class="campo">
      <span>Tiempo</span>
      <select id="sim-seg">${tiempos.map(([v, txt]) => `<option value="${v}" ${v === segInicial ? 'selected' : ''}>${txt}</option>`).join('')}</select>
    </label>
    <p class="reporte-estado" id="sim-resumen"></p>
    <div class="reporte-botones">
      <button class="btn secundario" id="sim-cancelar" type="button">Cancelar</button>
      <button class="btn primario" id="sim-empezar" type="button">Empezar</button>
    </div>`;
  document.body.appendChild(dlg);

  const cant = () => Number(dlg.querySelector('#sim-cant').value);
  const seg = () => Number(dlg.querySelector('#sim-seg').value);
  const resumen = () => {
    dlg.querySelector('#sim-resumen').textContent =
      `${plural(cant(), 'pregunta', 'preguntas')} · ${seg() ? `${Math.ceil((cant() * seg()) / 60)} min en total` : 'sin límite de tiempo'} · se aprueba con ${Math.round(NOTA_APROBACION * 100)}%`;
  };
  dlg.querySelectorAll('select').forEach((s) => s.addEventListener('change', resumen));
  resumen();

  dlg.querySelector('#sim-cancelar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => dlg.remove());
  dlg.querySelector('#sim-empezar').addEventListener('click', () => {
    estado.simuConfig = { cant: cant(), seg: seg() };
    guardar();
    const c = cant(), s = seg();
    dlg.close();
    lanzarSimulacro(materia, temas, c, s);
  });
  dlg.showModal();
}

async function lanzarSimulacro(materia, temas, cant, seg) {
  vistaCargando('Armando el simulacro…');
  try {
    let pool = [];
    for (const t of temas) pool.push(...(await cargarTema(t, materia)));
    pool = mezclar(pool).slice(0, cant);
    if (!pool.length) { vistaInicio(); avisar('No hay preguntas para el simulacro'); return; }
    empezarSimulacro(pool, seg, {
      materia: materia.nombre,
      repetir: () => lanzarSimulacro(materia, temas, cant, seg),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

function empezarSimulacro(pool, seg, meta) {
  const total = pool.length;
  simu = {
    meta, total,
    preguntas: pool.map((q) => ({ ...q, orden: mezclar([0, 1, 2, 3]) })),
    resp: Array(total).fill(null),   // posición elegida en cada pregunta (null = en blanco)
    i: 0,
    vistas: 0,                       // hasta qué pregunta llegó
    limite: seg * total,             // 0 = sin límite
    t0: Date.now(),
    timer: null,
    fin: false,
  };

  app.innerHTML = `
    <main class="pantalla">
      <div class="hud">
        <button class="icono" id="btn-salir" aria-label="Abandonar el simulacro">✕</button>
        <div class="progreso" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0"><div class="barra" id="barra"></div></div>
        <div class="reloj" id="reloj" aria-label="Tiempo">⏱ <span id="reloj-t">00:00</span></div>
      </div>
      <div id="zona"></div>
    </main>`;

  document.getElementById('btn-salir').addEventListener('click', () => {
    if (window.confirm('¿Abandonar el simulacro? No se guarda nada de esta ronda.')) {
      Sonido.clic();
      clearInterval(simu.timer);
      const volver = simu.meta.volver;
      simu = null;
      volver();
    }
  });

  simu.timer = setInterval(tickSimulacro, 1000);
  tickSimulacro();
  mostrarPreguntaSimu();
  window.scrollTo(0, 0);
}

function tickSimulacro() {
  const s = simu;
  if (!s || s.fin) return;
  const usado = Math.floor((Date.now() - s.t0) / 1000);
  const resta = s.limite ? Math.max(0, s.limite - usado) : null;
  const reloj = document.getElementById('reloj');
  if (!reloj) return;
  document.getElementById('reloj-t').textContent = fmtTiempo(resta ?? usado);
  reloj.classList.toggle('urgente', resta !== null && resta <= 60);
  if (resta === 0) terminarSimulacro(true);
}

function mostrarPreguntaSimu() {
  const s = simu;
  const q = s.preguntas[s.i];
  s.vistas = Math.max(s.vistas, s.i + 1);
  const ultima = s.i === s.total - 1;

  document.getElementById('barra').style.width = `${(s.i / s.total) * 100}%`;
  document.querySelector('.progreso').setAttribute('aria-valuenow', String(s.i));
  document.getElementById('zona').innerHTML = `
    <p class="contador">Pregunta ${s.i + 1} de ${s.total}</p>
    <div class="tarjeta-pregunta">
      <p class="tema-etq">${esc(q.tema)}</p>
      <h2 class="pregunta">${esc(q.texto)}</h2>
      ${q.imagen ? `
        <figure class="q-figura">
          <a href="${esc(q.imagen)}" target="_blank" rel="noopener" aria-label="Abrir la imagen en tamaño completo">
            <img src="${esc(q.imagen)}" alt="${esc(q.imagenAlt)}" decoding="async">
          </a>
        </figure>` : ''}
    </div>
    <div class="opciones" id="opciones" role="group" aria-label="Opciones de respuesta">
      ${q.orden.map((oi, pos) => `
        <button class="opcion ${s.resp[s.i] === pos ? 'elegida' : ''}" data-pos="${pos}" aria-pressed="${s.resp[s.i] === pos}">
          <span class="letra" aria-hidden="true">${LETRAS[pos]}</span>
          <span>${esc(q.opciones[oi])}</span>
        </button>`).join('')}
    </div>
    <div class="acciones"><button class="btn primario" id="btn-sim-sig">${ultima ? 'Entregar' : 'Siguiente'}</button></div>
    <p class="ayuda-teclas">Teclado: 1 a 4 (o A a D) para elegir, Enter para seguir. Volvé a tocar tu respuesta para dejarla en blanco.</p>`;

  document.querySelectorAll('#opciones .opcion').forEach((b) =>
    b.addEventListener('click', () => elegirSimu(Number(b.dataset.pos))));
  document.getElementById('btn-sim-sig').addEventListener('click', siguienteSimu);
  document.querySelector('.q-figura img')?.addEventListener('error', (e) => {
    e.currentTarget.closest('.q-figura').innerHTML = '<p class="q-figura-error">No se pudo cargar la imagen.</p>';
  });
}

function elegirSimu(pos) {
  const s = simu;
  if (!s || s.fin) return;
  s.resp[s.i] = s.resp[s.i] === pos ? null : pos;
  document.querySelectorAll('#opciones .opcion').forEach((b, p) => {
    const activa = s.resp[s.i] === p;
    b.classList.toggle('elegida', activa);
    b.setAttribute('aria-pressed', String(activa));
  });
  Sonido.clic();
}

function siguienteSimu() {
  const s = simu;
  if (!s || s.fin) return;
  Sonido.clic();
  if (s.i === s.total - 1) {
    const blancas = s.resp.filter((r) => r === null).length;
    if (window.confirm(blancas ? `Tenés ${plural(blancas, 'pregunta', 'preguntas')} sin responder. ¿Entregar igual?` : '¿Entregar el simulacro?')) terminarSimulacro(false);
    return;
  }
  s.i++;
  mostrarPreguntaSimu();
}

function terminarSimulacro(porTiempo) {
  const s = simu;
  if (!s || s.fin) return;
  s.fin = true;
  clearInterval(s.timer);

  const total = s.total;
  const usado = Math.min(Math.floor((Date.now() - s.t0) / 1000), s.limite || Infinity);
  let aciertos = 0, blancos = 0;
  const malas = [];                 // { q, pos, visto }
  const intentos = [];
  const porTema = new Map();

  s.preguntas.forEach((q, i) => {
    const visto = i < s.vistas;     // si se acabó el tiempo, las que no llegó a ver no cuentan en las estadísticas
    const pos = s.resp[i];
    const ok = pos !== null && q.orden[pos] === q.correcta;
    const t = porTema.get(q.temaId) || { nombre: q.tema, ok: 0, total: 0 };
    t.total++;
    if (ok) t.ok++;
    porTema.set(q.temaId, t);

    if (ok) aciertos++;
    else { malas.push({ q, pos, visto }); if (pos === null) blancos++; }

    if (visto) {
      srsRegistrar(q.id, ok);
      if (ok) { delete estado.errores[q.id]; (estado.dominadas[q.temaId] ||= {})[q.id] = 1; }
      else estado.errores[q.id] = 1;
      intentos.push({ pregunta_id: q.id, tema_id: q.temaId, pregunta: q.texto.slice(0, 160), acierto: ok, modo: 'simulacro' });
    }
  });

  const aprobado = aciertos / total >= NOTA_APROBACION;
  const previas = (estado.simulacros || []).filter((x) => x.materia === s.meta.materia);
  const mejorPrevia = previas.length ? Math.max(...previas.map((x) => x.nota)) : null;
  const nota = Math.round((aciertos / total) * 100) / 10;
  estado.simulacros = [...(estado.simulacros || []), { f: Date.now(), materia: s.meta.materia, nota, aciertos, total, seg: usado }].slice(-30);
  guardar();
  if (rankingActivo() && intentos.length) registrarIntentos(intentos).catch(() => {});

  const meta = s.meta;
  simu = null;

  const detalle = malas.map(({ q, pos, visto }) => `
    <details>
      <summary>${esc(q.texto)}</summary>
      <div class="detalle">
        <p>${pos === null ? (visto ? 'La dejaste en blanco.' : 'No llegaste a esta pregunta.') : `Tu respuesta: ${esc(q.opciones[q.orden[pos]])}`}</p>
        <p><strong>Respuesta:</strong> ${esc(q.opciones[q.correcta])}</p>
        ${q.explicacion ? `<p>${esc(q.explicacion)}</p>` : ''}
      </div>
    </details>`).join('');

  const temasHtml = porTema.size > 1 ? `
    <h2 class="subtitulo">Por tema</h2>
    <ul class="lista-progreso">${[...porTema.values()].map((t) => {
      const pct = Math.round((t.ok / t.total) * 100);
      return `
        <li>
          <div class="cuerpo">
            <span class="nombre">${esc(t.nombre)}</span>
            <span class="riel"><span class="relleno" style="width:${pct}%"></span></span>
          </div>
          <span class="pct">${pct}%<small>${t.ok}/${t.total}</small></span>
        </li>`;
    }).join('')}</ul>` : '';

  app.innerHTML = `
    <main class="pantalla resultado">
      <div class="grande" aria-hidden="true">${aprobado ? '🎓' : '📚'}</div>
      <h1>Nota ${fmtNota(aciertos, total)}</h1>
      <p class="sub">${aprobado ? '¡Aprobado!' : 'Todavía no alcanza.'} ${porTiempo ? 'Se terminó el tiempo.' : ''}</p>
      <div class="cifras">
        <div class="cifra"><b>${aciertos}</b><span>Correctas</span></div>
        <div class="cifra"><b>${total - aciertos - blancos}</b><span>Incorrectas</span></div>
        <div class="cifra"><b>${blancos}</b><span>En blanco</span></div>
      </div>
      <p class="estado-ranking">Tiempo: ${fmtTiempo(usado)}${s.limite ? ` de ${fmtTiempo(s.limite)}` : ''} · Se aprueba con ${Math.round(NOTA_APROBACION * 100)}%${mejorPrevia !== null ? ` · Tu mejor nota anterior: ${String(mejorPrevia.toFixed(1)).replace('.', ',')}` : ''}</p>
      <div class="botones">
        <button class="btn primario" id="btn-otra">Repetir simulacro</button>
        ${malas.length ? `<button class="btn secundario" id="btn-malas">Repasar errores (${malas.length})</button>` : ''}
        <button class="btn secundario" id="btn-inicio">Inicio</button>
      </div>
      ${temasHtml}
      ${malas.length ? `<section class="falladas"><h2>Para repasar</h2>${detalle}</section>` : ''}
    </main>`;

  document.getElementById('btn-otra').addEventListener('click', () => { Sonido.clic(); meta.repetir(); });
  document.getElementById('btn-malas')?.addEventListener('click', () => {
    Sonido.clic();
    const pool = malas.map(({ q }) => q);
    const metaRepaso = { titulo: 'Repaso del simulacro', temaId: null, volver: () => vistaInicio() };
    empezarJuego(pool, { ...metaRepaso, repetir: () => empezarJuego(pool, metaRepaso) });
  });
  document.getElementById('btn-inicio').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });

  Sonido.fin(aprobado);
  if (aprobado) lanzarConfeti(aciertos === total ? 160 : 100);
  window.scrollTo(0, 0);
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
      <p class="aviso-datos">Al terminar una ronda se guardan tu apodo, tus resultados y datos básicos de tu dispositivo (navegador, sistema, pantalla, idioma y zona horaria) para estadísticas. También se registra, sin tu apodo, si cada pregunta se respondió bien o mal. El ranking solo muestra apodo y puntos.</p>
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
    Sonido.clic();
    vistaInicio();
    avisar(`Listo, ${apodo}`);
  });
  window.scrollTo(0, 0);
  input.focus();
}

let pedidoRanking = 0;   // descarta respuestas viejas si el usuario cambia de filtro rápido

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
  if ((!juego && !simu) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest?.('dialog, input, textarea, select')) return;   // escribiendo en un formulario
  const k = e.key.toLowerCase();
  if (simu) {
    if (simu.fin) return;
    const pos = ['1', '2', '3', '4'].indexOf(k);
    const pos2 = ['a', 'b', 'c', 'd'].indexOf(k);
    if (pos >= 0) elegirSimu(pos);
    else if (pos2 >= 0) elegirSimu(pos2);
    else if (k === 'enter') { e.preventDefault(); siguienteSimu(); }
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

// El audio del navegador necesita un gesto previo del usuario
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
    vistaInicio();
  } catch (e) {
    vistaError(e);
  }
}

iniciar();
