// ==========================================================
// cuadro.js: actividad "Cuadro comparativo" con varios modos de práctica.
// Se activa desde un tema con  "actividad": "cuadro"  y un objeto  "cuadro"
// en el mismo JSON del tema:
//
//   "cuadro": {
//     "titulo": "Duplicación, transcripción y traducción",
//     "columnas": [ { "nombre": "Duplicación del ADN", "corto": "Duplicación" }, ... ],
//     "filas": [ { "aspecto": "Molde", "celdas": ["...", "...", "..."] }, ... ]
//   }
//
// Cada fila tiene una celda por columna. En las celdas se puede usar **negrita**.
//
// Modos:
//   Estudiar     el cuadro completo; filtrá una columna y marcá lo que ya sabés
//   Completar    celdas vacías: elegí la correcta entre 4 opciones
//   Armar        cuadro vacío + banco de fragmentos: tocá uno y después su lugar
//   ¿De cuál es? te muestran una celda y decidís a qué columna pertenece
//   Recordar     tarjeta: pensá la respuesta, mirá y calificate
// ==========================================================

import { estado, guardar } from './store.js?v=dev';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Cuadro comparativo: completalo, armalo y practicalo';

const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF'];
const HITOS = [3, 5, 8, 10];
const POR_RONDA = 10;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const azar = (l) => l[Math.floor(Math.random() * l.length)];
function mezclar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizarCuadro(c) {
  if (!c || !Array.isArray(c.columnas) || !Array.isArray(c.filas)) return null;
  const columnas = c.columnas.map((x) =>
    typeof x === 'string'
      ? { nombre: x, corto: x }
      : { nombre: String(x?.nombre || ''), corto: String(x?.corto || x?.nombre || '') });
  if (columnas.length < 2 || columnas.some((x) => !x.nombre)) return null;
  const filas = c.filas
    .map((f) => ({ aspecto: String(f?.aspecto || ''), celdas: Array.isArray(f?.celdas) ? f.celdas.map(String) : [] }))
    .filter((f) => f.aspecto && f.celdas.length === columnas.length && f.celdas.every((t) => t.trim()));
  if (filas.length < 2) return null;
  return { titulo: String(c.titulo || 'Cuadro comparativo'), columnas, filas };
}

function inyectarEstilos() {
  if (document.getElementById('estilos-cuadro')) return;
  const st = document.createElement('style');
  st.id = 'estilos-cuadro';
  st.textContent = `
.pantalla.cu { max-width: 1040px; }
.cu .chips { margin-bottom: .7rem; }
.cu-hud { display: flex; flex-wrap: wrap; gap: .4rem .9rem; align-items: center; color: var(--tenue); font-size: .95rem; margin: .2rem 0 .7rem; }
.cu-hud b { color: var(--crema); }
.cu-hud .r { color: var(--ambar); font-family: var(--pixel); }
.cu-tabla { display: grid; gap: .5rem; }
.cu-cab, .cu-fila { display: grid; grid-template-columns: 8.5rem repeat(var(--vis), minmax(0, 1fr)); gap: .5rem; align-items: stretch; }
.cu-th { font-weight: 800; padding: .55rem .75rem; background: var(--panel-2); border-top: 4px solid var(--cc); border-radius: 10px; }
.cu-asp { font-weight: 800; padding: .7rem .75rem; background: var(--panel-2); border-radius: 10px; overflow-wrap: anywhere; }
.cu-cel { padding: .7rem .8rem; background: var(--panel); border: 2px solid var(--linea); border-left: 5px solid var(--cc); border-radius: 10px; font-size: .95rem; line-height: 1.35; overflow-wrap: anywhere; transition: border-color .15s, background-color .15s, opacity .2s; }
.cu-cel b { color: var(--crema); }
.cu-cel[role="button"] { cursor: pointer; }
.cu-cel[role="button"]:hover { border-color: var(--cc); }
.cu-cel.vacia { border-style: dashed; border-left-style: solid; color: var(--tenue); display: grid; place-items: center; text-align: center; min-height: 3.4rem; font-weight: 600; }
.cu-cel.ok { background: rgba(79, 224, 160, .13); border-color: var(--ok); border-left-color: var(--ok); }
.cu-cel.sabida { opacity: .5; }
.cu-cel.sabida::after { content: ' ✓'; color: var(--ok); font-weight: 800; }
.cu-cel.tiembla { animation: cu-tiembla .4s ease; border-color: var(--mal); }
.cu-cel.objetivo { border-color: var(--ok); background: rgba(79, 224, 160, .13); }
@keyframes cu-tiembla { 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
@media (max-width: 719px) {
  .cu-cab { display: none; }
  .cu-fila { grid-template-columns: 1fr; background: var(--panel); border: 2px solid var(--linea); border-radius: 14px; padding: .6rem; gap: .4rem; }
  .cu-asp { background: none; padding: .1rem .2rem; font-size: 1.1rem; }
  .cu-cel::before { content: attr(data-col); display: block; font-size: .75rem; font-weight: 800; color: var(--cc); text-transform: uppercase; letter-spacing: .05em; margin-bottom: .15rem; }
  .cu-cel.vacia { display: block; text-align: left; place-items: normal; }
  .cu-cel.vacia::before { text-align: left; }
}
.cu-dialogo { width: min(94vw, 34rem); max-height: 90dvh; padding: 1.1rem; background: var(--panel); color: var(--crema); border: 2px solid var(--linea); border-radius: var(--radio); }
.cu-dialogo::backdrop { background: rgba(10, 6, 24, .75); }
.cu-dialogo h2 { font-size: 1.15rem; font-weight: 800; margin-bottom: .2rem; }
.cu-dialogo .sub { color: var(--tenue); font-size: .9rem; margin-bottom: .8rem; }
.cu-ops { display: grid; gap: .5rem; }
.cu-op { width: 100%; text-align: left; padding: .7rem .9rem; background: var(--noche); border: 2px solid var(--linea); border-radius: 12px; line-height: 1.35; font-size: .95rem; }
.cu-op:hover:not([disabled]) { border-color: var(--violeta); }
.cu-op.mal { border-color: var(--mal); background: rgba(255, 93, 122, .13); opacity: .8; }
.cu-op.ok { border-color: var(--ok); background: rgba(79, 224, 160, .15); }
.cu-dialogo .pie { display: flex; justify-content: flex-end; margin-top: .8rem; }
.cu-bandeja { position: sticky; bottom: 0; z-index: 5; margin: .8rem -1rem 0; padding: .6rem 1rem calc(.7rem + env(safe-area-inset-bottom)); background: rgba(23, 15, 46, .96); backdrop-filter: blur(8px); border-top: 2px solid var(--linea); }
.cu-sel { min-height: 2.6rem; max-height: 5.4rem; overflow: auto; font-size: .92rem; line-height: 1.35; color: var(--tenue); margin-bottom: .5rem; }
.cu-sel b.t { color: var(--crema); }
.cu-banco { display: flex; gap: .5rem; overflow-x: auto; padding-bottom: .3rem; scroll-snap-type: x proximity; }
.cu-chip { flex: 0 0 min(15rem, 70vw); scroll-snap-align: start; text-align: left; padding: .55rem .7rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 12px; font-size: .88rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.cu-chip.sel { border-color: var(--ambar); background: rgba(255, 185, 56, .14); }
.cu-opciones-clasif { display: grid; gap: .6rem; margin: .8rem 0; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); }
.cu-opciones-clasif .btn { border-width: 3px; border-style: solid; background: var(--panel); color: var(--crema); }
.cu-opciones-clasif .btn[disabled] { opacity: .7; cursor: default; }
.cu-card { padding: 1.2rem; background: var(--panel); border: 2px solid var(--linea); border-radius: var(--radio); margin: .6rem 0; }
.cu-card .etq { display: inline-block; font-weight: 800; font-size: .85rem; padding: .1rem .6rem; border-radius: 99px; background: var(--noche); border: 2px solid var(--cc, var(--linea)); color: var(--cc, var(--crema)); margin-bottom: .6rem; }
.cu-card .asp { font-size: clamp(1.3rem, 5vw, 1.8rem); font-weight: 800; line-height: 1.2; }
.cu-card .texto { font-size: clamp(1.05rem, 4vw, 1.3rem); font-weight: 600; line-height: 1.4; }
.cu-card .pista { color: var(--tenue); font-size: .9rem; margin-top: .8rem; }
.cu-fb { margin: .6rem 0; }
.cu-fb .veredicto { font-weight: 800; font-size: 1.1rem; }
.cu-fb .veredicto.ok { color: var(--ok); }
.cu-fb .veredicto.mal { color: var(--mal); }
.cu-fb .mini { display: grid; gap: .4rem; margin-top: .6rem; }
.cu-acciones { display: flex; flex-wrap: wrap; gap: .6rem; margin: .6rem 0; }
.cu-acciones .btn { flex: 1 1 8rem; }
`;
  document.head.appendChild(st);
}

export async function abrirCuadro({ app, volver, tema }) {
  inyectarEstilos();
  app.innerHTML = '<div class="cargando"><div class="giro" aria-hidden="true"></div><p>Cargando el cuadro…</p></div>';

  let D = null;
  try {
    const r = await fetch(tema.archivo, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`No se pudo leer ${tema.archivo} (${r.status})`);
    D = normalizarCuadro((await r.json()).cuadro);
  } catch (e) {
    console.error(e);
  }
  if (!D) {
    app.innerHTML = `<main class="pantalla"><div class="vacio"><strong>No se pudo cargar el cuadro</strong>
      El tema necesita un objeto <code>"cuadro"</code> válido con <code>columnas</code> y <code>filas</code>.</div>
      <p style="margin-top:1rem"><button class="btn secundario" id="cu-volver">Volver</button></p></main>`;
    app.querySelector('#cu-volver').addEventListener('click', volver);
    return;
  }

  const NC = D.columnas.length;
  const color = (c) => COLORES[c % COLORES.length];
  const todasFilas = D.filas.map((_, i) => i);
  const celdas = D.filas.flatMap((fila, f) => fila.celdas.map((_, c) => ({ f, c })));
  const texto = (f, c) => D.filas[f].celdas[c];

  const MODOS = [
    ['estudiar', '📖 Estudiar'],
    ['completar', '✍️ Completar'],
    ['armar', '🧩 Armar'],
    ['clasificar', '🎯 ¿De cuál es?'],
    ['recordar', '🃏 Recordar'],
  ];

  let modo = 'estudiar';
  let S = {};                 // estado propio de cada modo (se reinicia al cambiar de modo)
  let ronda = null;           // contadores de la ronda actual

  const $ = (s) => app.querySelector(s);
  const zona = () => $('#cu-zona');
  const reg = () => (((estado.actividades ||= {}).cuadro ||= {}));

  function nuevaRonda() { ronda = { racha: 0, puntos: 0, aciertos: 0, total: 0, mejorRacha: 0 }; }

  function guardarMejor(m, pct) {
    const r = reg();
    r[m] ||= 0;
    const rec = pct > r[m];
    if (rec) r[m] = pct;
    try { guardar(); } catch (_) { /* sin almacenamiento */ }
    return rec;
  }

  function sumarPunto(primerIntento) {
    ronda.racha++;
    ronda.mejorRacha = Math.max(ronda.mejorRacha, ronda.racha);
    const ganado = (primerIntento ? 100 : 40) + Math.min(ronda.racha - 1, 5) * 10;
    ronda.puntos += ganado;
    Sonido.acierto(ronda.racha);
    if (HITOS.includes(ronda.racha)) setTimeout(() => { Sonido.hito(); lanzarConfeti(60); }, 250);
    return ganado;
  }
  function restarRacha() { Sonido.error(ronda.racha >= 3); ronda.racha = 0; }

  const hud = (extra = '') => `<div class="cu-hud">${extra}<span class="r">🔥 ${ronda.racha}</span><span><b>${ronda.puntos}</b> pts</span></div>`;

  // ---------- tabla ----------
  function tablaHTML(filas, celdaFn, foco = -1) {
    const cols = foco >= 0 ? [foco] : D.columnas.map((_, i) => i);
    return `<div class="cu-tabla" style="--vis:${cols.length}">
      <div class="cu-cab"><div></div>${cols.map((c) => `<div class="cu-th" style="--cc:${color(c)}">${esc(D.columnas[c].nombre)}</div>`).join('')}</div>
      ${filas.map((f) => `<div class="cu-fila"><div class="cu-asp">${esc(D.filas[f].aspecto)}</div>${cols.map((c) => {
        const x = celdaFn(f, c);
        return `<div class="cu-cel ${x.clase || ''}" style="--cc:${color(c)}" data-f="${f}" data-c="${c}" data-col="${esc(D.columnas[c].corto)}" ${x.attrs || ''}>${x.html}</div>`;
      }).join('')}</div>`).join('')}
    </div>`;
  }

  // ---------- estructura ----------
  function pintar() {
    app.innerHTML = `
      <main class="pantalla cu">
        <button class="btn enlace" id="cu-volver">← Volver</button>
        <h1 class="titulo-seccion">📊 ${esc(D.titulo)}</h1>
        <div class="chips" id="cu-modos" role="group" aria-label="Modo">
          ${MODOS.map(([m, t]) => `<button class="chip ${m === modo ? 'activo' : ''}" data-modo="${m}">${t}</button>`).join('')}
        </div>
        <div id="cu-zona"></div>
        <dialog class="cu-dialogo" id="cu-dlg"></dialog>
      </main>`;
    $('#cu-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
    app.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      cambiarModo(b.dataset.modo);
    }));
    window.scrollTo(0, 0);
  }

  function cambiarModo(m) {
    modo = m;
    S = {};
    nuevaRonda();
    app.querySelectorAll('[data-modo]').forEach((b) => b.classList.toggle('activo', b.dataset.modo === m));
    ({ estudiar: vEstudiar, completar: vCompletar, armar: vArmar, clasificar: vClasificar, recordar: vRecordar })[m]();
    window.scrollTo(0, 0);
  }

  function resultado({ emoji, titulo, cifras, nota, botones }) {
    zona().innerHTML = `
      <div class="resultado" style="padding:1rem 0">
        <div class="grande" aria-hidden="true">${emoji}</div>
        <h1>${titulo}</h1>
        <div class="cifras" style="margin-top:1rem">
          ${cifras.map(([n, t]) => `<div class="cifra"><b>${n}</b><span>${t}</span></div>`).join('')}
        </div>
        <p class="sub" style="margin:0 auto 1.2rem">${nota}</p>
        <div class="botones">${botones.map(([id, t, cl]) => `<button class="btn ${cl}" id="${id}">${t}</button>`).join('')}</div>
      </div>`;
    window.scrollTo(0, 0);
  }
  function emojiPct(p) { return p >= 90 ? ['🏆', '¡Excelente!'] : p >= 70 ? ['🎉', '¡Muy bien!'] : p >= 50 ? ['👍', 'Vas por buen camino'] : ['💪', 'A seguir practicando']; }

  // ======================================================
  // Modo 1: Estudiar
  // ======================================================
  function vEstudiar() {
    S.foco = -1;
    S.sabidas = new Set();
    dibujarEstudiar();
  }
  function dibujarEstudiar() {
    const foco = S.foco;
    const opciones = [[-1, 'Todas'], ...D.columnas.map((c, i) => [i, c.corto])];
    zona().innerHTML = `
      <div class="chips" id="cu-foco" aria-label="Mostrar columna">
        ${opciones.map(([v, t]) => `<button class="chip ${v === foco ? 'activo' : ''}" data-foco="${v}">${esc(t)}</button>`).join('')}
      </div>
      <p class="nota-ranking">Tocá una celda para marcarla como “ya la sé”. Sabidas: <b>${S.sabidas.size}</b> de ${celdas.length}.</p>
      ${tablaHTML(todasFilas, (f, c) => ({ html: fmt(texto(f, c)), clase: S.sabidas.has(`${f}-${c}`) ? 'sabida' : '', attrs: 'role="button" tabindex="0"' }), foco)}`;
    zona().querySelectorAll('[data-foco]').forEach((b) => b.addEventListener('click', () => { Sonido.clic(); S.foco = Number(b.dataset.foco); dibujarEstudiar(); }));
    zona().querySelectorAll('.cu-cel').forEach((el) => {
      const alt = () => {
        const k = `${el.dataset.f}-${el.dataset.c}`;
        S.sabidas.has(k) ? S.sabidas.delete(k) : S.sabidas.add(k);
        Sonido.clic();
        const y = window.scrollY;
        dibujarEstudiar();
        window.scrollTo(0, y);
      };
      el.addEventListener('click', alt);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alt(); } });
    });
  }

  // ======================================================
  // Modo 2: Completar (celdas vacías con 4 opciones)
  // ======================================================
  const DIFICULTADES = [[1, '1 por fila'], [2, '2 por fila'], [NC, 'Todo vacío']];

  function vCompletar() {
    S.dif = S.dif ?? 1;
    S.vacias = new Map();
    for (const f of todasFilas) {
      for (const c of mezclar([...Array(NC).keys()]).slice(0, Math.min(S.dif, NC))) S.vacias.set(`${f}-${c}`, { f, c, hecha: false, fallos: 0 });
    }
    ronda.total = S.vacias.size;
    dibujarCompletar();
  }

  function dibujarCompletar() {
    const hechas = [...S.vacias.values()].filter((v) => v.hecha).length;
    zona().innerHTML = `
      <div class="chips">${DIFICULTADES.map(([n, t]) => `<button class="chip ${n === S.dif ? 'activo' : ''}" data-dif="${n}">${t}</button>`).join('')}</div>
      ${hud(`<span>Completadas <b>${hechas}</b> de ${S.vacias.size}</span>`)}
      ${tablaHTML(todasFilas, (f, c) => {
        const v = S.vacias.get(`${f}-${c}`);
        if (!v) return { html: fmt(texto(f, c)) };
        if (v.hecha) return { html: fmt(texto(f, c)), clase: 'ok' };
        return { html: '❓ Tocá para completar', clase: 'vacia', attrs: 'role="button" tabindex="0"' };
      })}`;
    zona().querySelectorAll('[data-dif]').forEach((b) => b.addEventListener('click', () => { Sonido.clic(); S.dif = Number(b.dataset.dif); nuevaRonda(); vCompletar(); }));
    zona().querySelectorAll('.cu-cel.vacia').forEach((el) => {
      const abrir = () => { Sonido.clic(); abrirOpciones(Number(el.dataset.f), Number(el.dataset.c)); };
      el.addEventListener('click', abrir);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } });
    });
  }

  // 3 distractores: primero de la misma fila (otras columnas), después de la misma columna
  function opcionesPara(f, c) {
    const correcta = texto(f, c);
    const candidatos = [
      ...mezclar([...Array(NC).keys()].filter((x) => x !== c).map((x) => texto(f, x))),
      ...mezclar(todasFilas.filter((x) => x !== f).map((x) => texto(x, c))),
      ...mezclar(celdas.filter((x) => !(x.f === f && x.c === c)).map((x) => texto(x.f, x.c))),
    ];
    const dist = [];
    for (const t of candidatos) if (t !== correcta && !dist.includes(t) && dist.length < 3) dist.push(t);
    return mezclar([correcta, ...dist]);
  }

  function abrirOpciones(f, c) {
    const dlg = $('#cu-dlg');
    const v = S.vacias.get(`${f}-${c}`);
    const correcta = texto(f, c);
    dlg.innerHTML = `
      <h2>${esc(D.columnas[c].nombre)}</h2>
      <p class="sub">${esc(D.filas[f].aspecto)}: ¿cuál va acá?</p>
      <div class="cu-ops">${opcionesPara(f, c).map((t) => `<button class="cu-op" data-t="${esc(t)}">${fmt(t)}</button>`).join('')}</div>
      <div class="pie"><button class="btn secundario" id="cu-cerrar">Cerrar</button></div>`;
    dlg.querySelector('#cu-cerrar').addEventListener('click', () => dlg.close());
    dlg.querySelectorAll('.cu-op').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.t === correcta) {
        v.hecha = true;
        if (v.fallos === 0) ronda.aciertos++;
        sumarPunto(v.fallos === 0);
        dlg.close();
        if ([...S.vacias.values()].every((x) => x.hecha)) finCompletar(); else { const y = window.scrollY; dibujarCompletar(); window.scrollTo(0, y); }
      } else {
        v.fallos++;
        restarRacha();
        b.classList.add('mal');
        b.disabled = true;
      }
    }));
    dlg.showModal();
  }

  function finCompletar() {
    const pct = Math.round((ronda.aciertos / ronda.total) * 100);
    const rec = guardarMejor('completar', pct);
    const [emoji, titulo] = emojiPct(pct);
    resultado({
      emoji, titulo,
      cifras: [[ronda.puntos, 'Puntos'], [`${pct}%`, `${ronda.aciertos} de ${ronda.total} a la primera`], [ronda.mejorRacha, 'Mejor racha']],
      nota: rec ? '¡Nuevo récord en este modo!' : `Tu mejor resultado: ${reg().completar}%`,
      botones: [['cu-otra', 'Otro cuadro', 'primario'], ['cu-estudiar', 'Estudiar', 'secundario']],
    });
    $('#cu-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); vCompletar(); });
    $('#cu-estudiar').addEventListener('click', () => { Sonido.clic(); cambiarModo('estudiar'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  // ======================================================
  // Modo 3: Armar (banco de fragmentos + cuadro vacío)
  // ======================================================
  const FILAS_POR_TANDA = 3;

  function vArmar() {
    S.pendientes = mezclar(todasFilas);
    nuevaTanda();
  }

  function nuevaTanda() {
    if (S.pendientes.length < 1) S.pendientes = mezclar(todasFilas);
    const filas = S.pendientes.splice(0, Math.min(FILAS_POR_TANDA, S.pendientes.length)).sort((a, b) => a - b);
    S.filas = filas;
    S.ubicadas = new Set();
    S.erroneos = new Set();
    S.banco = mezclar(filas.flatMap((f) => D.columnas.map((_, c) => ({ k: `${f}-${c}`, f, c }))));
    S.sel = null;
    ronda.total = (ronda.total || 0) + S.banco.length;
    dibujarArmar();
  }

  function dibujarArmar() {
    const quedan = S.banco.length;
    zona().innerHTML = `
      ${hud(`<span>Faltan <b>${quedan}</b> fragmentos</span>`)}
      <p class="nota-ranking">Tocá un fragmento del banco (abajo) y después la celda donde va.</p>
      <div style="padding-bottom:.5rem">${tablaHTML(S.filas, (f, c) =>
        S.ubicadas.has(`${f}-${c}`)
          ? { html: fmt(texto(f, c)), clase: 'ok' }
          : { html: 'Tocá para ubicar acá', clase: 'vacia', attrs: 'role="button" tabindex="0"' })}</div>
      <div class="cu-bandeja">
        <div class="cu-sel" id="cu-sel">${S.sel ? `<b class="t">Elegido:</b> ${fmt(texto(S.sel.f, S.sel.c))}` : 'Elegí un fragmento del banco.'}</div>
        <div class="cu-banco" id="cu-banco">${S.banco.map((x, i) => `<button class="cu-chip ${S.sel && S.sel.k === x.k ? 'sel' : ''}" data-i="${i}">${fmt(texto(x.f, x.c))}</button>`).join('')}</div>
      </div>`;
    zona().querySelectorAll('.cu-chip').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      const x = S.banco[Number(b.dataset.i)];
      S.sel = S.sel && S.sel.k === x.k ? null : x;
      const sc = zona().querySelector('#cu-banco').scrollLeft, y = window.scrollY;
      dibujarArmar();
      zona().querySelector('#cu-banco').scrollLeft = sc;
      window.scrollTo(0, y);
    }));
    zona().querySelectorAll('.cu-cel.vacia').forEach((el) => {
      const ubicar = () => colocar(el);
      el.addEventListener('click', ubicar);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ubicar(); } });
    });
  }

  function colocar(el) {
    if (!S.sel) { zona().querySelector('#cu-sel').textContent = 'Primero elegí un fragmento del banco.'; return; }
    const k = `${el.dataset.f}-${el.dataset.c}`;
    // Cuenta como correcto si el texto coincide con el de esa celda (por si hay textos repetidos)
    if (texto(S.sel.f, S.sel.c) === texto(Number(el.dataset.f), Number(el.dataset.c))) {
      S.ubicadas.add(k);
      S.banco = S.banco.filter((x) => x.k !== S.sel.k);
      if (!S.erroneos.has(S.sel.k)) ronda.aciertos++;
      S.sel = null;
      sumarPunto(true);
      if (!S.banco.length) { finTanda(); return; }
      const y = window.scrollY;
      dibujarArmar();
      window.scrollTo(0, y);
    } else {
      S.erroneos.add(S.sel.k);
      restarRacha();
      el.classList.add('tiembla');
      setTimeout(() => el.classList.remove('tiembla'), 450);
      zona().querySelector('.cu-hud .r').textContent = '🔥 0';
    }
  }

  function finTanda() {
    const pct = Math.max(0, Math.round((ronda.aciertos / ronda.total) * 100));
    const rec = guardarMejor('armar', pct);
    const [emoji, titulo] = emojiPct(pct);
    resultado({
      emoji, titulo,
      cifras: [[ronda.puntos, 'Puntos'], [`${pct}%`, `${ronda.aciertos} de ${ronda.total} sin error`], [ronda.mejorRacha, 'Mejor racha']],
      nota: rec ? '¡Nuevo récord en este modo!' : `Tu mejor resultado: ${reg().armar}%`,
      botones: [['cu-otra', 'Otras filas', 'primario'], ['cu-estudiar', 'Estudiar', 'secundario']],
    });
    $('#cu-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); nuevaTanda(); });
    $('#cu-estudiar').addEventListener('click', () => { Sonido.clic(); cambiarModo('estudiar'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  // ======================================================
  // Modo 4: ¿De cuál es? (clasificar una celda)
  // ======================================================
  function vClasificar() {
    S.cola = mezclar(celdas).slice(0, POR_RONDA);
    S.i = 0;
    ronda.total = S.cola.length;
    preguntaClasificar();
  }

  function preguntaClasificar() {
    if (S.i >= S.cola.length) return finClasificar();
    const { f, c } = S.cola[S.i];
    S.resp = false;
    zona().innerHTML = `
      ${hud(`<span>Pregunta <b>${S.i + 1}</b> de ${S.cola.length}</span>`)}
      <div class="cu-card">
        <p class="pista" style="margin:0 0 .4rem">${esc(D.filas[f].aspecto)}</p>
        <p class="texto">${fmt(texto(f, c))}</p>
      </div>
      <p class="nota-ranking">¿A cuál corresponde?</p>
      <div class="cu-opciones-clasif">${D.columnas.map((col, i) => `<button class="btn" data-c="${i}" style="border-color:${color(i)}">${esc(col.nombre)}</button>`).join('')}</div>
      <div class="cu-fb" id="cu-fb" aria-live="polite"></div>
      <div id="cu-sig"></div>`;
    zona().querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => responderClasificar(Number(b.dataset.c))));
  }

  function responderClasificar(elegida) {
    if (S.resp) return;
    S.resp = true;
    const { f, c } = S.cola[S.i];
    const ok = elegida === c;
    zona().querySelectorAll('[data-c]').forEach((b) => {
      b.disabled = true;
      const i = Number(b.dataset.c);
      if (i === c) b.style.background = 'rgba(79,224,160,.2)';
      else if (i === elegida) b.style.background = 'rgba(255,93,122,.2)';
    });
    let v;
    if (ok) { ronda.aciertos++; const g = sumarPunto(true); v = `<p class="veredicto ok">¡Correcto! +${g}</p>`; }
    else { restarRacha(); v = `<p class="veredicto mal">Incorrecto: era ${esc(D.columnas[c].nombre)}</p>`; }
    const mini = `<div class="cu-tabla" style="--vis:${NC}"><div class="cu-fila"><div class="cu-asp">${esc(D.filas[f].aspecto)}</div>${D.columnas.map((_, ci) =>
      `<div class="cu-cel ${ci === c ? 'ok' : ''}" style="--cc:${color(ci)}" data-col="${esc(D.columnas[ci].corto)}">${fmt(texto(f, ci))}</div>`).join('')}</div></div>`;
    $('#cu-fb').innerHTML = `${v}<div class="mini">${mini}</div>`;
    $('#cu-sig').innerHTML = `<div class="cu-acciones"><button class="btn primario" id="cu-next">${S.i + 1 >= S.cola.length ? 'Ver resultado' : 'Siguiente'}</button></div>`;
    $('#cu-next').addEventListener('click', () => { Sonido.clic(); S.i++; preguntaClasificar(); });
    $('#cu-next').focus({ preventScroll: true });
    $('#cu-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function finClasificar() {
    const pct = Math.round((ronda.aciertos / ronda.total) * 100);
    const rec = guardarMejor('clasificar', pct);
    const [emoji, titulo] = emojiPct(pct);
    resultado({
      emoji, titulo,
      cifras: [[ronda.puntos, 'Puntos'], [`${pct}%`, `${ronda.aciertos} de ${ronda.total}`], [ronda.mejorRacha, 'Mejor racha']],
      nota: rec ? '¡Nuevo récord en este modo!' : `Tu mejor resultado: ${reg().clasificar}%`,
      botones: [['cu-otra', 'Otra ronda', 'primario'], ['cu-estudiar', 'Estudiar', 'secundario']],
    });
    $('#cu-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); vClasificar(); });
    $('#cu-estudiar').addEventListener('click', () => { Sonido.clic(); cambiarModo('estudiar'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  // ======================================================
  // Modo 5: Recordar (tarjeta: pensá, mirá, calificate)
  // ======================================================
  function vRecordar() {
    S.cola = mezclar(celdas).slice(0, POR_RONDA).map((x) => ({ ...x, intento: 0 }));
    S.base = S.cola.length;
    S.sabidas1 = 0;
    S.hechas = 0;
    tarjetaRecordar();
  }

  function tarjetaRecordar() {
    if (!S.cola.length) return finRecordar();
    const it = S.cola[0];
    S.visto = false;
    zona().innerHTML = `
      <div class="cu-hud"><span>Quedan <b>${S.cola.length}</b></span><span>Sabidas a la primera: <b>${S.sabidas1}</b></span></div>
      <div class="cu-card" id="cu-tarj" style="--cc:${color(it.c)}" role="button" tabindex="0">
        <span class="etq">${esc(D.columnas[it.c].nombre)}</span>
        <p class="asp">${esc(D.filas[it.f].aspecto)}</p>
        <div id="cu-dorso"><p class="pista">Pensá la respuesta y tocá la tarjeta para verla.</p></div>
      </div>
      <div class="cu-acciones" id="cu-notas"></div>`;
    const ver = () => {
      if (S.visto) return;
      S.visto = true;
      Sonido.clic();
      $('#cu-dorso').innerHTML = `<p class="texto" style="margin-top:.6rem">${fmt(texto(it.f, it.c))}</p>`;
      $('#cu-notas').innerHTML = `
        <button class="btn secundario" data-n="no" style="border-color:var(--mal)">No me acordé</button>
        <button class="btn secundario" data-n="dude" style="border-color:var(--ambar)">Dudé</button>
        <button class="btn secundario" data-n="si" style="border-color:var(--ok)">Lo sabía</button>`;
      zona().querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => calificar(b.dataset.n)));
    };
    $('#cu-tarj').addEventListener('click', ver);
    $('#cu-tarj').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ver(); } });
  }

  function calificar(n) {
    const it = S.cola.shift();
    if (n === 'si') {
      Sonido.acierto(1);
      if (it.intento === 0) S.sabidas1++;
    } else {
      Sonido.error(false);
      if (it.intento < 2) S.cola.push({ ...it, intento: it.intento + 1 });  // vuelve a aparecer al final
    }
    tarjetaRecordar();
  }

  function finRecordar() {
    const pct = Math.round((S.sabidas1 / S.base) * 100);
    const rec = guardarMejor('recordar', pct);
    const [emoji, titulo] = emojiPct(pct);
    resultado({
      emoji, titulo,
      cifras: [[`${pct}%`, `${S.sabidas1} de ${S.base} a la primera`], [S.base, 'Tarjetas'], [reg().recordar ?? pct, 'Mejor %']],
      nota: rec ? '¡Nuevo récord en este modo!' : 'Las que fallaste volvieron a aparecer hasta que las supiste.',
      botones: [['cu-otra', 'Otra ronda', 'primario'], ['cu-estudiar', 'Estudiar', 'secundario']],
    });
    $('#cu-otra').addEventListener('click', () => { Sonido.clic(); vRecordar(); });
    $('#cu-estudiar').addEventListener('click', () => { Sonido.clic(); cambiarModo('estudiar'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  // ---------- arranque ----------
  nuevaRonda();
  pintar();
  cambiarModo('estudiar');
}
