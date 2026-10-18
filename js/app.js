// ==========================================================
// app.js: pantallas y lógica del juego.
// Flujo: inicio (materias) -> materia (temas) -> juego -> resultado
// Los datos se leen de data/index.json (lo genera tools/actualizar_indice.py).
// ==========================================================

import { estado, guardar, hash } from './store.js';
import { Sonido } from './sonido.js';
import { lanzarConfeti } from './confeti.js';
import { rankingActivo, limpiarApodo, guardarPartida, guardarProgreso, rankingMateria, historialDe, progresoDe } from './ranking.js';

const app = document.getElementById('app');
const avisoEl = document.getElementById('aviso');

const LETRAS = ['A', 'B', 'C', 'D'];
const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF', '#FF8A5C'];
const HITOS = [3, 5, 10, 15, 20, 30, 50];   // rachas que disparan festejo

let indice = null;          // contenido de data/index.json
const cache = new Map();    // idTema -> preguntas ya cargadas
let juego = null;           // partida en curso (null si no hay)

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

// ---------- Pantalla: inicio ----------

function vistaInicio() {
  juego = null;
  const nErrores = Object.keys(estado.errores).length;

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
          <button class="btn secundario" id="btn-apodo">👤 ${estado.apodo ? esc(estado.apodo) : 'Elegir apodo'}</button>
        </div>` : ''}
      ${nErrores ? `<button class="banner-errores" id="btn-errores"><span>Repasar mis errores</span><b>${nErrores}</b></button>` : ''}
      ${indice.materias.length
        ? `<div class="materias">${tarjetas}</div>`
        : `<div class="vacio"><strong>Todavía no hay materias</strong>
             Agregá archivos <code>.json</code> dentro de <code>data/</code> y corré
             <code>python tools/actualizar_indice.py</code>.</div>`}
    </main>`;

  document.getElementById('btn-sonido').addEventListener('click', alternarSonido);
  document.getElementById('btn-errores')?.addEventListener('click', () => { Sonido.clic(); lanzarErrores(); });
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
        <button class="btn primario" id="btn-empezar"></button>
      </div>
    </div>`;

  const checks = [...app.querySelectorAll('.tema input')];
  const btnEmpezar = document.getElementById('btn-empezar');
  const btnTodos = document.getElementById('btn-todos');

  const seleccionados = () => checks.filter((c) => c.checked).map((c) => m.temas[Number(c.dataset.n)]);
  const cantidadElegida = () => Number(app.querySelector('input[name="cantidad"]:checked')?.value ?? 10);

  function actualizar() {
    const sel = seleccionados();
    const total = sel.reduce((s, t) => s + t.preguntas, 0);
    const c = cantidadElegida();
    const jugar = c === 0 ? total : Math.min(c, total);
    btnEmpezar.disabled = sel.length === 0;
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
}

function responder(pos) {
  const j = juego;
  if (!j || j.respondida) return;
  j.respondida = true;

  const q = j.preguntas[j.i];
  const acerto = q.orden[pos] === q.correcta;
  const feedback = document.getElementById('feedback');

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

  feedback.innerHTML = veredicto + (q.explicacion ? `<p class="explicacion">${esc(q.explicacion)}</p>` : '');

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
  if (!juego || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
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
