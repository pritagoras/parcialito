// ==========================================================
// crucigrama.js: actividad interactiva "Crucigrama".
// Se abre desde la pantalla de una materia (si algún tema declara
// "actividad": "crucigrama" en su JSON).
//
// Datos, en el JSON del tema:
//   "actividad": ["crucigrama"],
//   "crucigrama": {
//     "titulo": "Duplicación del ADN",
//     "palabras": [
//       { "respuesta": "HELICASA", "pista": "Enzima que abre la doble hélice" },
//       ...
//     ]
//   }
//
// Solo se escriben las palabras y sus pistas: el tablero lo arma el juego
// (cruzando las palabras entre sí) y sale distinto cada vez que tocás "Nuevo tablero".
// "crucigrama" también puede ser una lista de crucigramas.
//
// Lo que hace el juego:
//   - escribís con el teclado (o con el teclado en pantalla en el celular)
//   - al completar una palabra bien, las letras se dan vuelta en ola y se traba
//   - si la completás mal, se sacude (sin decirte cuál letra falló)
//   - pistas (letra / palabra), comprobar, cronómetro, estrellas y récord
//   - el progreso se guarda: si salís, seguís donde quedaste
// ==========================================================

import { estado, guardar } from './store.js?v=dev';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Crucigrama: completá el tablero con las pistas';

const MIN_PALABRAS = 4;
const MAX_LARGO = 18;      // letras por palabra
const INTENTOS = 240;      // tableros que prueba el generador (se queda con el más compacto)

// ---------- Utilidades ----------

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clave = (r, c) => `${r},${c}`;
const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const vibrar = (p) => { if (!estado.silencio) navigator.vibrate?.(p); };

// "Ácido nucleico" -> "ACIDONUCLEICO". Se conservan las Ñ.
function aLetras(txt) {
  return String(txt ?? '')
    .toUpperCase()
    .replace(/Ñ/g, '\u0001')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0001/g, 'Ñ')
    .replace(/[^A-ZÑ]/g, '');
}

function hash(texto) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// Generador de números al azar con semilla: la misma semilla arma siempre el mismo tablero
function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fmtTiempo = (seg) => `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;

// ---------- Datos ----------

function leerCrucigramas(json) {
  const lista = [].concat(json?.crucigrama || []);
  const salida = [];
  lista.forEach((c, i) => {
    const palabras = [];
    const vistas = new Set();
    for (const p of Array.isArray(c?.palabras) ? c.palabras : []) {
      const original = String(p?.respuesta ?? '').trim();
      const letras = aLetras(original);
      const pista = String(p?.pista ?? '').trim();
      if (letras.length < 2 || letras.length > MAX_LARGO || !pista || vistas.has(letras)) {
        if (original) console.warn(`[Crucigrama] Se omitió "${original}": tiene que tener entre 2 y ${MAX_LARGO} letras, una pista y no estar repetida.`);
        continue;
      }
      vistas.add(letras);
      const partes = original.split(/[\s-]+/).map((x) => aLetras(x).length).filter(Boolean);
      palabras.push({ original, letras, pista, partes: partes.length > 1 && partes.reduce((a, b) => a + b, 0) === letras.length ? partes : null });
    }
    if (palabras.length >= MIN_PALABRAS) salida.push({ titulo: String(c?.titulo || 'Crucigrama'), palabras, indice: i });
  });
  return salida;
}

// ---------- Generador del tablero ----------
// Va acomodando las palabras de a una, cruzándolas con las que ya están puestas,
// sin que se toquen de costado. Prueba muchos tableros y se queda con el más compacto.

function intento(palabras, rand) {
  const orden = palabras.map((p) => ({ p, k: p.letras.length + rand() * 5 })).sort((a, b) => b.k - a.k).map((x) => x.p);
  const celdas = new Map();   // "r,c" -> { letra, h, v }
  const puestas = [];
  const caja = { r0: 0, r1: 0, c0: 0, c1: 0 };

  const evaluar = (p, r, c, dir) => {
    const n = p.letras.length;
    const dr = dir === 'v' ? 1 : 0, dc = dir === 'h' ? 1 : 0;
    if (celdas.get(clave(r - dr, c - dc)) || celdas.get(clave(r + dr * n, c + dc * n))) return -1;
    let cruces = 0;
    for (let k = 0; k < n; k++) {
      const rr = r + dr * k, cc = c + dc * k;
      const cel = celdas.get(clave(rr, cc));
      if (cel) {
        if (cel.letra !== p.letras[k]) return -1;
        if (dir === 'h' ? cel.h : cel.v) return -1;
        cruces++;
      } else {
        const a = dir === 'h' ? celdas.get(clave(rr - 1, cc)) : celdas.get(clave(rr, cc - 1));
        const b = dir === 'h' ? celdas.get(clave(rr + 1, cc)) : celdas.get(clave(rr, cc + 1));
        if (a || b) return -1;
      }
    }
    return cruces;
  };

  const poner = (p, r, c, dir) => {
    const dr = dir === 'v' ? 1 : 0, dc = dir === 'h' ? 1 : 0;
    for (let k = 0; k < p.letras.length; k++) {
      const key = clave(r + dr * k, c + dc * k);
      const cel = celdas.get(key) || { letra: p.letras[k], h: false, v: false };
      cel[dir] = true;
      celdas.set(key, cel);
    }
    const r1 = r + dr * (p.letras.length - 1), c1 = c + dc * (p.letras.length - 1);
    caja.r0 = Math.min(caja.r0, r); caja.r1 = Math.max(caja.r1, r1);
    caja.c0 = Math.min(caja.c0, c); caja.c1 = Math.max(caja.c1, c1);
    puestas.push({ p, r, c, dir });
  };

  poner(orden[0], 0, 0, rand() < 0.5 ? 'h' : 'v');
  let restantes = orden.slice(1);
  let avance = true;
  while (restantes.length && avance) {
    avance = false;
    const quedan = [];
    for (const p of restantes) {
      let mejor = null, mejorPuntos = -Infinity;
      const probadas = new Set();
      for (const [key, cel] of celdas) {
        if (cel.h && cel.v) continue;
        const [r0, c0] = key.split(',').map(Number);
        for (let i = 0; i < p.letras.length; i++) {
          if (p.letras[i] !== cel.letra) continue;
          const dir = cel.h ? 'v' : 'h';
          const r = dir === 'v' ? r0 - i : r0, c = dir === 'h' ? c0 - i : c0;
          const id = `${r},${c},${dir}`;
          if (probadas.has(id)) continue;
          probadas.add(id);
          const cruces = evaluar(p, r, c, dir);
          if (cruces < 1) continue;
          const r1 = r + (dir === 'v' ? p.letras.length - 1 : 0), c1 = c + (dir === 'h' ? p.letras.length - 1 : 0);
          const alto = Math.max(caja.r1, r1) - Math.min(caja.r0, r) + 1, ancho = Math.max(caja.c1, c1) - Math.min(caja.c0, c) + 1;
          const puntos = cruces * 30 - ancho * 20 - alto * 8 - alto * ancho * 0.4 + rand() * 8;
          if (puntos > mejorPuntos) { mejorPuntos = puntos; mejor = { r, c, dir }; }
        }
      }
      if (mejor) { poner(p, mejor.r, mejor.c, mejor.dir); avance = true; } else quedan.push(p);
    }
    restantes = quedan;
  }
  let cruces = 0;
  for (const cel of celdas.values()) if (cel.h && cel.v) cruces++;
  const alto = caja.r1 - caja.r0 + 1, ancho = caja.c1 - caja.c0 + 1;
  return { celdas, puestas, restantes, caja, cruces, alto, ancho, puntos: puestas.length * 1000 + cruces * 6 - alto * ancho * 0.3 - ancho * 30 - alto * 10 };
}

function armarTablero(palabras, semilla) {
  const rand = azar(semilla);
  let mejor = null;
  for (let k = 0; k < INTENTOS; k++) {
    const t = intento(palabras, rand);
    if (!mejor || t.puntos > mejor.puntos) mejor = t;
  }
  const { caja } = mejor;
  const sol = new Map();   // "r,c" -> letra
  for (const [key, cel] of mejor.celdas) {
    const [r, c] = key.split(',').map(Number);
    sol.set(clave(r - caja.r0, c - caja.c0), cel.letra);
  }
  const entradas = mejor.puestas.map(({ p, r, c, dir }, i) => {
    const r0 = r - caja.r0, c0 = c - caja.c0;
    const celdas = p.letras.split('').map((_, k) => [r0 + (dir === 'v' ? k : 0), c0 + (dir === 'h' ? k : 0)]);
    return { id: `e${i}`, dir, r: r0, c: c0, p, celdas, num: 0 };
  });
  // Numeración clásica: por filas, de arriba abajo; horizontal y vertical comparten número
  const inicios = [...new Set(entradas.map((e) => clave(e.r, e.c)))].map((k) => k.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const numero = new Map(inicios.map(([r, c], i) => [clave(r, c), i + 1]));
  for (const e of entradas) e.num = numero.get(clave(e.r, e.c));
  entradas.sort((a, b) => a.num - b.num || (a.dir === 'h' ? -1 : 1));
  return { filas: mejor.alto, cols: mejor.ancho, sol, entradas, numero, sinPoner: mejor.restantes.map((p) => p.original) };
}

// ---------- Estilos ----------

function inyectarEstilos() {
  if (document.getElementById('estilos-crucigrama')) return;
  const st = document.createElement('style');
  st.id = 'estilos-crucigrama';
  st.textContent = `
.pantalla.cru { max-width: 1000px; padding-bottom: 3rem; }
.cru-top { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.cru-reloj { font-family: var(--pixel); font-size: 1.05rem; padding: .3rem .75rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 12px; color: var(--tenue); white-space: nowrap; }
.cru-titulo { font-size: clamp(1.5rem, 5vw, 2rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.15; margin: .3rem 0 .8rem; }
.cru-prog { display: flex; align-items: center; gap: .8rem; margin-bottom: .8rem; }
.cru-barra { flex: 1; height: 12px; background: var(--panel); border: 2px solid var(--linea); border-radius: 99px; overflow: hidden; }
.cru-barra > div { height: 100%; width: 0; background: linear-gradient(90deg, var(--violeta), var(--ok)); border-radius: 99px; transition: width .5s cubic-bezier(.3, 1.2, .5, 1); box-shadow: 0 0 12px rgba(79, 224, 160, .5); }
.cru-cuenta { font-family: var(--pixel); color: var(--tenue); white-space: nowrap; }
.cru-cuenta.salta { animation: cru-salta .45s ease; color: var(--ok); }
@keyframes cru-salta { 35% { transform: scale(1.35); } }

.cru-clue { position: sticky; top: 0; z-index: 6; display: flex; align-items: center; gap: .6rem; padding: .6rem .7rem; margin: 0 0 .8rem; background: rgba(23, 15, 46, .95); backdrop-filter: blur(8px); border: 2px solid var(--violeta); border-radius: 14px; min-height: 4.1rem; }
.cru-clue .nav { flex: none; width: 2.4rem; height: 2.4rem; display: grid; place-items: center; background: var(--panel); border: 2px solid var(--linea); border-radius: 10px; }
.cru-clue .nav:hover { border-color: var(--violeta); }
.cru-clue .cuerpo { flex: 1; min-width: 0; animation: cru-entra .25s ease; }
.cru-clue .num { font-family: var(--pixel); color: var(--ambar); margin-right: .4rem; white-space: nowrap; }
.cru-clue .len { color: var(--tenue); margin-left: .35rem; white-space: nowrap; }
.cru-clue .texto { font-weight: 600; line-height: 1.3; font-size: .98rem; }
@keyframes cru-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.cru-cuerpo { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.2rem; }
.cru-cuerpo > * { min-width: 0; }
@media (min-width: 900px) { .cru-cuerpo { grid-template-columns: minmax(0, 1fr) 320px; align-items: start; } }
.cru-caja { overflow: auto; padding: .9rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 18px; text-align: center; -webkit-overflow-scrolling: touch; }
.cru-tablero { --t: 40px; display: inline-grid; gap: 3px; touch-action: manipulation; user-select: none; -webkit-user-select: none; text-align: left; }
.cru-x { width: var(--t); height: var(--t); }
.cru-c { scroll-margin-top: calc(var(--barra-h, 6rem) + .8rem); scroll-margin-bottom: calc(var(--tec-h, 0px) + 1rem); }
.cru-c {
  position: relative; width: var(--t); height: var(--t); display: grid; place-items: center;
  background: #FFF3DC; color: #1b1230; border-radius: 7px; cursor: pointer;
  box-shadow: 0 3px 0 #b9a98c, 0 6px 10px rgba(0, 0, 0, .25);
  font-weight: 800; font-size: calc(var(--t) * .52); line-height: 1;
  transition: background-color .15s, box-shadow .15s, transform .12s;
  -webkit-tap-highlight-color: transparent;
}
.cru-c:hover { transform: translateY(-1px); }
.cru-c.pal { background: #E4DAFF; box-shadow: 0 3px 0 #a99bd6, 0 6px 10px rgba(0, 0, 0, .25); }
.cru-c.sel { background: #FFD27A; box-shadow: 0 3px 0 #c9993a, 0 0 0 3px var(--ambar), 0 8px 16px rgba(255, 185, 56, .35); transform: translateY(-2px); z-index: 2; }
.cru-c.ok { background: #BDF5D9; box-shadow: 0 3px 0 #6fb898, 0 6px 10px rgba(0, 0, 0, .25); color: #0b3d28; }
.cru-c.ok.sel { background: #9CEFC8; }
.cru-c.mal { background: #FFC4CE; color: #7a0f26; box-shadow: 0 3px 0 #c98896, 0 6px 10px rgba(0, 0, 0, .25); }
.cru-c.rev .cru-l { color: #b36200; }
.cru-n { position: absolute; top: 2px; left: 4px; font-size: calc(var(--t) * .26); font-weight: 700; color: #6a5a8e; line-height: 1; pointer-events: none; }
.cru-l { display: block; pointer-events: none; }
.cru-l.pop { animation: cru-pop .24s ease-out; }
@keyframes cru-pop { 0% { transform: scale(.35); opacity: 0; } 60% { transform: scale(1.28); } 100% { transform: scale(1); opacity: 1; } }
.cru-c.ola { animation: cru-ola .65s cubic-bezier(.3, .6, .3, 1) both; animation-delay: var(--d, 0ms); }
@keyframes cru-ola { 0% { transform: perspective(300px) rotateX(0); } 40% { transform: perspective(300px) rotateX(90deg) scale(1.05); } 75% { transform: perspective(300px) rotateX(-14deg) scale(1.1); } 100% { transform: perspective(300px) rotateX(0); } }
.cru-c.sacude { animation: cru-sacude .45s ease both; animation-delay: var(--d, 0ms); }
@keyframes cru-sacude { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-5px); background: #FFC4CE; } 40% { transform: translateX(5px); background: #FFC4CE; } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
.cru-c.destello { animation: cru-destello .8s ease both; }
@keyframes cru-destello { 0% { box-shadow: 0 0 0 0 rgba(255, 185, 56, .9); } 50% { box-shadow: 0 0 0 10px rgba(255, 185, 56, 0), 0 0 24px rgba(255, 185, 56, .9); transform: scale(1.12); } 100% { box-shadow: 0 3px 0 #b9a98c; } }
.cru-c.fiesta { animation: cru-fiesta .75s cubic-bezier(.3, 1.3, .5, 1) both; animation-delay: calc(var(--r) * 45ms + var(--c) * 45ms); }
@keyframes cru-fiesta { 0% { transform: translateY(0); } 40% { transform: translateY(-14px) scale(1.12); background: #FFE08A; box-shadow: 0 3px 0 #c9a23a, 0 0 22px rgba(255, 210, 90, .9); } 100% { transform: translateY(0); } }

.cru-herr { display: flex; flex-wrap: wrap; gap: .5rem; margin: .9rem 0 0; }
.cru-herr .btn { padding: .55rem .9rem; font-size: .95rem; }
.cru-listas { display: grid; gap: 1rem; }
.cru-lista h2 { font-size: 1.05rem; margin: 0 0 .4rem; color: var(--tenue); }
.cru-lista ol { list-style: none; margin: 0; padding: 0; display: grid; gap: .3rem; max-height: 17rem; overflow: auto; }
@media (min-width: 900px) { .cru-lista ol { max-height: 15rem; } }
.cru-lista li { display: flex; gap: .55rem; padding: .5rem .65rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 10px; cursor: pointer; font-size: .95rem; line-height: 1.3; transition: border-color .15s, background-color .15s, opacity .3s; }
.cru-lista li:hover { border-color: var(--violeta); }
.cru-lista li.act { border-color: var(--ambar); background: var(--panel-2); }
.cru-lista li .n { font-family: var(--pixel); color: var(--ambar); min-width: 1.6rem; }
.cru-lista li.hecha { opacity: .72; border-color: rgba(79, 224, 160, .55); }
.cru-lista li.hecha .t { text-decoration: line-through; text-decoration-color: rgba(79, 224, 160, .7); }
.cru-lista li .resp { display: none; color: var(--ok); font-weight: 700; text-decoration: none; }
.cru-lista li.hecha .resp { display: block; }

.cru-toast { position: fixed; left: 50%; bottom: 7.5rem; transform: translate(-50%, 12px); padding: .55rem 1.1rem; background: var(--crema); color: #1b1230; font-weight: 700; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, .35); opacity: 0; pointer-events: none; transition: opacity .2s, transform .25s; z-index: 80; max-width: calc(100vw - 2rem); text-align: center; }
.cru-toast.v { opacity: 1; transform: translate(-50%, 0); }

.cru-teclado { display: none; }
@media (pointer: coarse) {
  .pantalla.cru { padding-bottom: 14rem; }
  .cru-teclado { display: grid; gap: .35rem; position: fixed; left: 0; right: 0; bottom: 0; padding: .55rem .4rem calc(.55rem + env(safe-area-inset-bottom)); background: rgba(23, 15, 46, .97); border-top: 2px solid var(--linea); z-index: 30; }
  .cru-fila { display: flex; justify-content: center; gap: .3rem; }
  .cru-k { flex: 1; max-width: 2.7rem; height: 2.85rem; display: grid; place-items: center; background: var(--panel); border: 2px solid var(--linea); border-radius: 9px; font-weight: 700; font-size: 1.05rem; touch-action: manipulation; user-select: none; -webkit-user-select: none; }
  .cru-k:active { background: var(--violeta); color: #120a26; transform: scale(.94); }
  .cru-k.ancha { max-width: 3.9rem; font-size: .95rem; }
  .cru-toast { bottom: 13rem; }
}

.cru-fin { position: fixed; inset: 0; z-index: 70; display: grid; place-items: center; padding: 1rem; background: rgba(10, 5, 25, .78); animation: cru-entra .3s ease; }
.cru-fin-caja { width: min(26rem, 100%); padding: 1.6rem 1.3rem 1.3rem; text-align: center; background: var(--panel); border: 2px solid var(--violeta); border-radius: 22px; box-shadow: 0 20px 60px rgba(0, 0, 0, .5); animation: cru-pop .5s cubic-bezier(.3, 1.4, .5, 1); }
.cru-estrellas { font-size: 2.8rem; letter-spacing: .25rem; line-height: 1; margin-bottom: .6rem; }
.cru-estrellas span { display: inline-block; color: var(--linea); }
.cru-estrellas span.on { color: var(--ambar); text-shadow: 0 0 18px rgba(255, 185, 56, .8); animation: cru-pop .5s cubic-bezier(.3, 1.6, .5, 1) both; animation-delay: var(--d); }
.cru-fin h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em; margin: 0 0 .4rem; }
.cru-fin p { color: var(--tenue); margin: .2rem 0; }
.cru-fin p b { color: var(--crema); }
.cru-fin-botones { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; margin-top: 1.1rem; }

.cru-elegir { display: grid; gap: .6rem; margin-top: 1rem; }
@media (prefers-reduced-motion: reduce) { .cru *, .cru-fin, .cru-fin * { animation: none !important; transition: none !important; } }
`;
  document.head.appendChild(st);
}

// ---------- Pantalla principal ----------

export async function abrirCrucigrama({ app, volver, tema }) {
  inyectarEstilos();
  app.innerHTML = '<div class="cargando"><div class="giro" aria-hidden="true"></div><p>Preparando el crucigrama…</p></div>';
  let crucis;
  try {
    const r = await fetch(tema.archivo, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`No se pudo leer ${tema.archivo} (${r.status})`);
    crucis = leerCrucigramas(await r.json());
  } catch (e) {
    console.error('[Crucigrama]', e);
    app.innerHTML = `<main class="pantalla cru"><button class="btn enlace" id="cru-volver">← Volver</button><div class="vacio"><strong>No se pudo cargar el crucigrama</strong>Revisá tu conexión y probá de nuevo.</div></main>`;
    $('#cru-volver').addEventListener('click', volver);
    return;
  }

  if (!crucis.length) {
    app.innerHTML = `<main class="pantalla cru"><button class="btn enlace" id="cru-volver">← Volver</button>
      <div class="vacio"><strong>Este tema todavía no tiene un crucigrama</strong>Hace falta un campo <code>crucigrama</code> con al menos ${MIN_PALABRAS} palabras (cada una con su <code>respuesta</code> y su <code>pista</code>).</div></main>`;
    $('#cru-volver').addEventListener('click', volver);
    return;
  }
  if (crucis.length === 1) { jugar({ app, volver, tema, def: crucis[0], clavePartida: tema.id, alVolver: volver }); return; }

  // Varios crucigramas en el mismo tema: se elige uno
  const elegir = () => {
    app.innerHTML = `<main class="pantalla cru"><button class="btn enlace" id="cru-volver">← Volver</button>
      <h1 class="cru-titulo">Elegí un crucigrama</h1>
      <div class="cru-elegir">${crucis.map((c, n) => `<button class="banner-repaso" data-n="${n}"><span>🧩 ${esc(c.titulo)}<small>${c.palabras.length} palabras</small></span><b>▶</b></button>`).join('')}</div></main>`;
    $('#cru-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
    $$('[data-n]').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      const def = crucis[Number(b.dataset.n)];
      jugar({ app, volver, tema, def, clavePartida: `${tema.id}#${def.indice}`, alVolver: elegir });
    }));
  };
  elegir();
}

function jugar({ app, tema, def, clavePartida, alVolver }) {
  estado.crucigramas ||= {};
  const firma = hash(def.palabras.map((p) => `${p.letras}|${p.pista}`).join('~') + '|v1');
  let guardado = estado.crucigramas[clavePartida];
  if (!guardado || guardado.firma !== firma || guardado.listo) {
    guardado = { firma, semilla: Math.floor(Math.random() * 2147483647), letras: {}, reveladas: [], pistas: 0, seg: 0, mejor: guardado?.mejor };
    estado.crucigramas[clavePartida] = guardado;
  }

  let T = armarTablero(def.palabras, guardado.semilla);
  let S = null;
  let escuchas = [];
  let reloj = null;
  let toastT = null;

  const porCelda = () => {
    const m = new Map();
    for (const e of T.entradas) for (const [r, c] of e.celdas) {
      const k = clave(r, c);
      const o = m.get(k) || { h: null, v: null };
      o[e.dir] = e;
      m.set(k, o);
    }
    return m;
  };

  function nuevoEstado(g) {
    return {
      cel: porCelda(),
      letras: new Map(Object.entries(g.letras)),
      reveladas: new Set(g.reveladas),
      fijas: new Set(),
      resueltas: new Set(),
      sel: { r: 0, c: 0, dir: 'h' },
      pistas: g.pistas || 0,
      seg: g.seg || 0,
      racha: 0,
      terminado: false,
      celdaEl: new Map(),
    };
  }

  const guardarProgreso = () => {
    guardado.letras = Object.fromEntries(S.letras);
    guardado.reveladas = [...S.reveladas];
    guardado.pistas = S.pistas;
    guardado.seg = S.seg;
    guardar();
  };

  // ----- helpers del tablero -----
  const entradaActual = () => {
    const o = S.cel.get(clave(S.sel.r, S.sel.c));
    return o?.[S.sel.dir] || o?.h || o?.v || null;
  };
  const llena = (e) => e.celdas.every(([r, c]) => S.letras.get(clave(r, c)));
  const correcta = (e) => e.celdas.every(([r, c], i) => S.letras.get(clave(r, c)) === e.p.letras[i]);
  const bloqueada = (k) => S.fijas.has(k);

  function reconstruirFijas() {
    S.fijas = new Set(S.reveladas);
    for (const e of T.entradas) if (S.resueltas.has(e.id)) for (const [r, c] of e.celdas) S.fijas.add(clave(r, c));
  }

  // ----- pantalla -----
  function pintar() {
    app.innerHTML = `
    <main class="pantalla cru" id="cru">
      <div class="cru-top">
        <button class="btn enlace" id="cru-volver">← Volver</button>
        <div class="cru-reloj" aria-label="Tiempo">⏱ <span id="cru-reloj">00:00</span></div>
      </div>
      <h1 class="cru-titulo">${esc(def.titulo)}</h1>
      <div class="cru-prog">
        <div class="cru-barra" role="progressbar" aria-label="Palabras resueltas" aria-valuemin="0" aria-valuemax="${T.entradas.length}" aria-valuenow="0"><div id="cru-relleno"></div></div>
        <span class="cru-cuenta" id="cru-cuenta">0/${T.entradas.length}</span>
      </div>
      <div class="cru-clue" aria-live="polite">
        <button class="nav" id="cru-ant" aria-label="Pista anterior">◀</button>
        <div class="cuerpo" id="cru-pista"></div>
        <button class="nav" id="cru-sig" aria-label="Pista siguiente">▶</button>
      </div>
      <div class="cru-cuerpo">
        <div>
          <div class="cru-caja" id="cru-caja"><div class="cru-tablero" id="cru-tablero" role="grid" aria-label="Tablero del crucigrama"></div></div>
          <div class="cru-herr">
            <button class="btn secundario" data-h="comprobar">✔ Comprobar</button>
            <button class="btn secundario" data-h="letra">💡 Pista</button>
            <button class="btn secundario" data-h="palabra">🔍 Revelar palabra</button>
            <button class="btn secundario" data-h="nuevo">🔄 Nuevo tablero</button>
          </div>
          ${T.sinPoner.length ? `<p class="pista-ayuda" style="color:var(--tenue);font-size:.88rem;margin-top:.6rem">En este tablero no entraron ${T.sinPoner.length === 1 ? 'una palabra' : T.sinPoner.length + ' palabras'}. Tocá “Nuevo tablero” para probar otra combinación.</p>` : ''}
          ${guardado.mejor ? `<p style="color:var(--tenue);font-size:.9rem;margin-top:.6rem">Tu récord: ${'★'.repeat(guardado.mejor.estrellas)} · ${fmtTiempo(guardado.mejor.seg)}</p>` : ''}
        </div>
        <div class="cru-listas">
          <section class="cru-lista"><h2>Horizontales →</h2><ol id="cru-lh"></ol></section>
          <section class="cru-lista"><h2>Verticales ↓</h2><ol id="cru-lv"></ol></section>
        </div>
      </div>
      <div class="cru-teclado" id="cru-teclado"></div>
      <div class="cru-toast" id="cru-toast" role="status"></div>
    </main>`;

    // tablero
    const tab = $('#cru-tablero');
    tab.style.gridTemplateColumns = `repeat(${T.cols}, var(--t))`;
    S.celdaEl.clear();
    let html = '';
    for (let r = 0; r < T.filas; r++) {
      for (let c = 0; c < T.cols; c++) {
        const k = clave(r, c);
        if (!T.sol.has(k)) { html += '<div class="cru-x"></div>'; continue; }
        const n = T.numero.get(k);
        html += `<div class="cru-c" role="gridcell" data-k="${k}" style="--r:${r};--c:${c}">${n ? `<span class="cru-n">${n}</span>` : ''}<span class="cru-l"></span></div>`;
      }
    }
    tab.innerHTML = html;
    $$('.cru-c', tab).forEach((el) => S.celdaEl.set(el.dataset.k, el));

    // listas de pistas
    for (const dir of ['h', 'v']) {
      $(dir === 'h' ? '#cru-lh' : '#cru-lv').innerHTML = T.entradas.filter((e) => e.dir === dir).map((e) => `
        <li data-id="${e.id}"><span class="n">${e.num}</span><span><span class="t">${esc(e.p.pista)} <small style="color:var(--tenue)">${lenTxt(e)}</small></span><span class="resp">${esc(e.p.original)}</span></span></li>`).join('');
    }
    $$('.cru-lista li').forEach((li) => li.addEventListener('click', () => {
      const e = T.entradas.find((x) => x.id === li.dataset.id);
      Sonido.clic();
      irAEntrada(e);
    }));

    // teclado en pantalla (solo se ve en pantallas táctiles)
    const filas = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
    $('#cru-teclado').innerHTML = filas.map((f, i) => `<div class="cru-fila">${i === 2 ? '<button class="cru-k ancha" data-t="dir" aria-label="Cambiar dirección">⇄</button>' : ''}${f.split('').map((ch) => `<button class="cru-k" data-t="${ch}">${ch}</button>`).join('')}${i === 2 ? '<button class="cru-k ancha" data-t="borrar" aria-label="Borrar">⌫</button>' : ''}</div>`).join('');
    $$('.cru-k').forEach((b) => b.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      const t = b.dataset.t;
      if (t === 'borrar') borrar(); else if (t === 'dir') alternarDireccion(); else escribir(t);
    }));

    // eventos
    tab.addEventListener('pointerdown', (ev) => {
      const el = ev.target.closest('.cru-c');
      if (!el) return;
      const [r, c] = el.dataset.k.split(',').map(Number);
      seleccionar(r, c, true);
      Sonido.clic();
    });
    $('#cru-ant').addEventListener('click', () => { Sonido.clic(); moverEntrada(-1); });
    $('#cru-sig').addEventListener('click', () => { Sonido.clic(); moverEntrada(1); });
    $('#cru-volver').addEventListener('click', salir);
    $$('[data-h]').forEach((b) => b.addEventListener('click', () => herramienta(b.dataset.h)));
    calcularTamano();
  }

  const lenTxt = (e) => `(${e.p.partes ? e.p.partes.join(', ') : e.p.letras.length})`;

  function calcularTamano() {
    const caja = $('#cru-caja'), tab = $('#cru-tablero');
    if (!caja || !tab) return;
    const disp = caja.clientWidth - 30;
    let t = Math.floor((disp - (T.cols - 1) * 3) / T.cols);
    // en pantallas grandes se achica un poco para que el tablero entero se vea sin scrollear
    if (window.innerWidth >= 900) t = Math.min(t, Math.floor((window.innerHeight - 300 - (T.filas - 1) * 3) / T.filas));
    t = Math.max(26, Math.min(52, t));
    tab.style.setProperty('--t', `${t}px`);
  }

  function pintarCelda(k, { pop = false } = {}) {
    const el = S.celdaEl.get(k);
    if (!el) return;
    const l = el.querySelector('.cru-l');
    l.textContent = S.letras.get(k) || '';
    el.classList.toggle('rev', S.reveladas.has(k));
    if (pop) { l.classList.remove('pop'); void l.offsetWidth; l.classList.add('pop'); }
  }

  function repintarTodo() {
    const enResueltas = new Set();
    for (const e of T.entradas) if (S.resueltas.has(e.id)) for (const [r, c] of e.celdas) enResueltas.add(clave(r, c));
    for (const [k, el] of S.celdaEl) {
      pintarCelda(k);
      el.classList.toggle('ok', enResueltas.has(k));
    }
    for (const e of T.entradas) marcarLista(e);
    actualizarProgreso(false);
  }

  function marcarLista(e) {
    const li = $(`.cru-lista li[data-id="${e.id}"]`);
    if (!li) return;
    const hecha = S.resueltas.has(e.id);
    li.classList.toggle('hecha', hecha);
  }

  function actualizarProgreso(animar = true) {
    const n = S.resueltas.size, total = T.entradas.length;
    $('#cru-relleno').style.width = `${(n / total) * 100}%`;
    $('.cru-barra').setAttribute('aria-valuenow', String(n));
    const cuenta = $('#cru-cuenta');
    cuenta.textContent = `${n}/${total}`;
    if (animar) { cuenta.classList.remove('salta'); void cuenta.offsetWidth; cuenta.classList.add('salta'); }
  }

  // ----- selección -----
  function seleccionar(r, c, alternar = false) {
    const o = S.cel.get(clave(r, c));
    if (!o) return;
    let dir = S.sel.dir;
    if (alternar && S.sel.r === r && S.sel.c === c && o.h && o.v) dir = dir === 'h' ? 'v' : 'h';
    else if (dir === 'h' && !o.h) dir = 'v';
    else if (dir === 'v' && !o.v) dir = 'h';
    S.sel = { r, c, dir };
    pintarSeleccion();
  }

  function alternarDireccion() {
    const o = S.cel.get(clave(S.sel.r, S.sel.c));
    if (o?.h && o?.v) { S.sel.dir = S.sel.dir === 'h' ? 'v' : 'h'; pintarSeleccion(); Sonido.clic(); }
  }

  function pintarSeleccion() {
    $$('.cru-c.sel, .cru-c.pal').forEach((el) => el.classList.remove('sel', 'pal'));
    const e = entradaActual();
    if (!e) return;
    for (const [r, c] of e.celdas) S.celdaEl.get(clave(r, c))?.classList.add('pal');
    S.celdaEl.get(clave(S.sel.r, S.sel.c))?.classList.add('sel');
    S.sel.dir = e.dir;
    // barra de la pista actual
    const caja = $('#cru-pista');
    caja.style.animation = 'none'; void caja.offsetWidth; caja.style.animation = '';
    caja.innerHTML = `<span class="num">${e.num}${e.dir === 'h' ? '→' : '↓'}</span><span class="texto">${esc(e.p.pista)}</span><span class="len">${lenTxt(e)}</span>`;
    $$('.cru-lista li').forEach((li) => li.classList.toggle('act', li.dataset.id === e.id));
    // la casilla activa tiene que quedar a la vista: ni tapada por la barra de la pista ni por el teclado en pantalla
    const cru = $('#cru'), barra = $('.cru-clue'), tec = $('#cru-teclado');
    cru.style.setProperty('--barra-h', `${barra.offsetHeight}px`);
    cru.style.setProperty('--tec-h', `${tec.offsetParent ? tec.offsetHeight : 0}px`);
    S.celdaEl.get(clave(S.sel.r, S.sel.c))?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  // Primera casilla de la palabra que todavía no tiene la letra correcta
  function primeraVacia(e) {
    return e.celdas.find(([r, c], i) => S.letras.get(clave(r, c)) !== e.p.letras[i]) || e.celdas[0];
  }

  function irAEntrada(e) {
    if (!e) return;
    const [r, c] = primeraVacia(e);
    S.sel = { r, c, dir: e.dir };
    pintarSeleccion();
  }

  // Salta a la pista siguiente/anterior (da prioridad a las que faltan)
  function moverEntrada(paso) {
    const orden = [...T.entradas].sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === 'h' ? -1 : 1));
    const act = entradaActual();
    let i = orden.indexOf(act);
    for (let n = 0; n < orden.length; n++) {
      i = (i + paso + orden.length) % orden.length;
      if (!S.resueltas.has(orden[i].id)) { irAEntrada(orden[i]); return true; }
    }
    return false;
  }

  // ----- escribir -----
  function indiceEn(e, k) { return e.celdas.findIndex(([r, c]) => clave(r, c) === k); }

  function avanzar() {
    const e = entradaActual();
    if (!e) return;
    let i = indiceEn(e, clave(S.sel.r, S.sel.c));
    for (let n = i + 1; n < e.celdas.length; n++) {
      const [r, c] = e.celdas[n];
      if (!bloqueada(clave(r, c))) { S.sel = { r, c, dir: e.dir }; pintarSeleccion(); return; }
    }
  }

  function escribir(ch) {
    if (S.terminado) return;
    let e = entradaActual();
    if (!e) return;
    let k = clave(S.sel.r, S.sel.c);
    if (bloqueada(k)) {   // las letras ya resueltas no se tocan: el cursor pasa a la siguiente libre
      const i = indiceEn(e, k);
      const sig = e.celdas.slice(i + 1).find(([r, c]) => !bloqueada(clave(r, c)));
      if (!sig) return;
      S.sel = { r: sig[0], c: sig[1], dir: e.dir };
      k = clave(sig[0], sig[1]);
    }
    S.letras.set(k, ch);
    pintarCelda(k, { pop: true });
    S.celdaEl.get(k).classList.remove('mal');
    Sonido.clic();
    const resolvio = evaluarPalabras(k);
    if (!resolvio) { avanzar(); pintarSeleccion(); }
    guardarProgreso();
  }

  function borrar() {
    if (S.terminado) return;
    const e = entradaActual();
    if (!e) return;
    let k = clave(S.sel.r, S.sel.c);
    if (!S.letras.get(k) || bloqueada(k)) {   // si no hay nada acá, retrocede una
      const i = indiceEn(e, k);
      const ant = e.celdas.slice(0, i).reverse().find(([r, c]) => !bloqueada(clave(r, c)));
      if (!ant) return;
      S.sel = { r: ant[0], c: ant[1], dir: e.dir };
      k = clave(ant[0], ant[1]);
    }
    S.letras.delete(k);
    pintarCelda(k);
    S.celdaEl.get(k).classList.remove('mal');
    pintarSeleccion();
    guardarProgreso();
  }

  function mover(dr, dc) {
    let r = S.sel.r + dr, c = S.sel.c + dc;
    while (r >= 0 && c >= 0 && r < T.filas && c < T.cols && !T.sol.has(clave(r, c))) { r += dr; c += dc; }   // salta casilleros vacíos
    if (!T.sol.has(clave(r, c))) return;
    const o = S.cel.get(clave(r, c));
    const dir = dr !== 0 ? 'v' : 'h';
    S.sel = { r, c, dir: o[dir] ? dir : S.sel.dir };
    pintarSeleccion();
  }

  // ----- evaluar palabras -----
  function evaluarPalabras(k, suave = false) {
    const o = S.cel.get(k);
    let resolvio = false;
    for (const e of [o.h, o.v]) {
      if (!e || S.resueltas.has(e.id) || !llena(e)) continue;
      if (correcta(e)) { resolver(e, suave); resolvio = true; } else if (!suave) equivocada(e);
    }
    return resolvio;
  }

  // Después de revelar una palabra entera, las que la cruzan pueden haber quedado completas
  function evaluarCruzadas(e) {
    for (const [r, c] of e.celdas) {
      const o = S.cel.get(clave(r, c));
      const otra = o.h === e ? o.v : o.h;
      if (otra && !S.resueltas.has(otra.id) && llena(otra) && correcta(otra)) resolver(otra, true);
    }
  }

  function resolver(e, suave) {
    S.resueltas.add(e.id);
    e.celdas.forEach(([r, c]) => S.fijas.add(clave(r, c)));
    const animar = !sinMovimiento();
    e.celdas.forEach(([r, c], i) => {
      const el = S.celdaEl.get(clave(r, c));
      if (!animar) { el.classList.add('ok'); return; }
      el.style.setProperty('--d', `${i * 70}ms`);
      el.classList.remove('ola', 'sacude'); void el.offsetWidth;
      el.classList.add('ola');
      setTimeout(() => el.classList.add('ok'), i * 70 + 200);
      setTimeout(() => el.classList.remove('ola'), i * 70 + 700);
    });
    marcarLista(e);
    actualizarProgreso(true);
    if (!suave) {
      S.racha++;
      Sonido.acierto(S.racha);
      vibrar(25);
      lanzarConfeti(S.resueltas.size === T.entradas.length ? 0 : 22);
    }
    guardarProgreso();
    if (S.resueltas.size === T.entradas.length) { setTimeout(terminar, suave ? 300 : 700); return; }
    setTimeout(() => {   // pasa solo a la próxima pista que falta
      if (S.terminado) return;
      const sig = proximaSinResolver(e);
      if (sig) irAEntrada(sig);
    }, suave ? 250 : 650);
  }

  function proximaSinResolver(desde) {
    const orden = [...T.entradas].sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === 'h' ? -1 : 1));
    const i = orden.indexOf(desde);
    for (let n = 1; n <= orden.length; n++) {
      const e = orden[(i + n) % orden.length];
      if (!S.resueltas.has(e.id)) return e;
    }
    return null;
  }

  function equivocada(e) {
    S.racha = 0;
    Sonido.error(false);
    vibrar([40, 40, 40]);
    if (sinMovimiento()) return;
    e.celdas.forEach(([r, c], i) => {
      const el = S.celdaEl.get(clave(r, c));
      if (S.fijas.has(clave(r, c))) return;
      el.style.setProperty('--d', `${i * 35}ms`);
      el.classList.remove('sacude'); void el.offsetWidth;
      el.classList.add('sacude');
      setTimeout(() => el.classList.remove('sacude'), i * 35 + 500);
    });
  }

  // ----- herramientas -----
  function toast(msg) {
    const t = $('#cru-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('v');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('v'), 2200);
  }

  function herramienta(h) {
    if (S.terminado) return;
    Sonido.clic();
    if (h === 'comprobar') {
      let malas = 0, llenas = 0;
      for (const [k, v] of S.letras) {
        if (S.fijas.has(k)) continue;
        llenas++;
        if (v !== T.sol.get(k)) { S.celdaEl.get(k).classList.add('mal'); malas++; }
      }
      if (!llenas) toast('Todavía no escribiste nada');
      else if (!malas) toast('Todo lo que escribiste está bien ✅');
      else toast(`${malas} ${malas === 1 ? 'letra incorrecta' : 'letras incorrectas'} (en rojo)`);
    } else if (h === 'letra') {
      const e = entradaActual();
      let k = clave(S.sel.r, S.sel.c);
      if (!e) return;
      if (S.letras.get(k) === T.sol.get(k)) {   // esa ya está bien: da la pista de la próxima que falta
        const sig = e.celdas.find(([r, c]) => S.letras.get(clave(r, c)) !== T.sol.get(clave(r, c)));
        if (!sig) return;
        k = clave(sig[0], sig[1]);
        S.sel = { r: sig[0], c: sig[1], dir: e.dir };
      }
      revelar(k);
      S.pistas++;
      pintarSeleccion();
      if (!evaluarPalabras(k, true)) avanzar();
      pintarSeleccion();
      guardarProgreso();
    } else if (h === 'palabra') {
      const e = entradaActual();
      if (!e || S.resueltas.has(e.id)) return;
      for (const [r, c] of e.celdas) {
        const k = clave(r, c);
        if (S.letras.get(k) !== T.sol.get(k)) { revelar(k); S.pistas++; }
      }
      resolver(e, true);
      evaluarCruzadas(e);
      toast('Palabra revelada: cuenta como pista');
    } else if (h === 'nuevo') {
      const hayProgreso = S.letras.size > 0;
      if (hayProgreso && !window.confirm('¿Armar un tablero nuevo? Se pierde lo que llevás en este.')) return;
      nuevoTablero();
    }
  }

  function revelar(k) {
    S.letras.set(k, T.sol.get(k));
    S.reveladas.add(k);
    S.fijas.add(k);
    const el = S.celdaEl.get(k);
    el.classList.remove('mal');
    pintarCelda(k, { pop: true });
    if (!sinMovimiento()) { el.classList.remove('destello'); void el.offsetWidth; el.classList.add('destello'); setTimeout(() => el.classList.remove('destello'), 850); }
  }

  function nuevoTablero() {
    detener();
    guardado = { firma, semilla: Math.floor(Math.random() * 2147483647), letras: {}, reveladas: [], pistas: 0, seg: 0, mejor: guardado.mejor };
    estado.crucigramas[clavePartida] = guardado;
    guardar();
    T = armarTablero(def.palabras, guardado.semilla);
    iniciar();
  }

  // ----- final -----
  function terminar() {
    if (S.terminado) return;
    S.terminado = true;
    clearInterval(reloj);
    const letras = T.sol.size;
    const estrellas = S.pistas === 0 ? 3 : S.pistas <= Math.ceil(letras * 0.15) ? 2 : 1;
    const nuevoRecord = !guardado.mejor || estrellas > guardado.mejor.estrellas || (estrellas === guardado.mejor.estrellas && S.seg < guardado.mejor.seg);
    const anterior = guardado.mejor;
    if (nuevoRecord) guardado.mejor = { estrellas, seg: S.seg };
    guardado.listo = true;
    guardarProgreso();

    const animar = !sinMovimiento();
    if (animar) $$('.cru-c').forEach((el) => { el.classList.remove('sel', 'pal'); el.classList.add('fiesta'); });
    Sonido.hito();
    setTimeout(() => Sonido.fin(true), 350);
    lanzarConfeti(170);
    setTimeout(() => lanzarConfeti(110), 650);
    vibrar([30, 50, 30, 50, 80]);

    setTimeout(() => {
      const caja = document.createElement('div');
      caja.className = 'cru-fin';
      caja.setAttribute('role', 'dialog');
      caja.setAttribute('aria-modal', 'true');
      caja.setAttribute('aria-label', 'Crucigrama completo');
      caja.innerHTML = `
        <div class="cru-fin-caja">
          <div class="cru-estrellas" aria-label="${estrellas} de 3 estrellas">${[1, 2, 3].map((n) => `<span class="${n <= estrellas ? 'on' : ''}" style="--d:${300 + n * 280}ms">★</span>`).join('')}</div>
          <h2>¡Crucigrama completo!</h2>
          <p>Tiempo <b>${fmtTiempo(S.seg)}</b> · Pistas usadas <b>${S.pistas}</b></p>
          <p>${nuevoRecord ? (anterior ? '🏆 ¡Nuevo récord!' : '🏆 Primer récord guardado') : `Tu récord: ${'★'.repeat(guardado.mejor.estrellas)} · ${fmtTiempo(guardado.mejor.seg)}`}</p>
          <p style="font-size:.9rem">${estrellas === 3 ? 'Sin pistas: ¡perfecto!' : 'Para las 3 estrellas, probá sin pistas.'}</p>
          <div class="cru-fin-botones">
            <button class="btn primario" id="cru-otro">Nuevo crucigrama</button>
            <button class="btn secundario" id="cru-sal">Volver</button>
            <button class="btn enlace" id="cru-ver">Ver el tablero</button>
          </div>
        </div>`;
      $('#cru').appendChild(caja);
      $('#cru-otro').addEventListener('click', () => { Sonido.clic(); nuevoTablero(); });
      $('#cru-sal').addEventListener('click', salir);
      $('#cru-ver').addEventListener('click', () => { Sonido.clic(); caja.remove(); });
    }, animar ? 1300 : 200);
  }

  // ----- teclado físico -----
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.('input, textarea, select, dialog')) return;
    if (document.querySelector('.cru-fin') && e.key !== 'Escape') return;
    const k = e.key;
    if (k === 'Backspace' || k === 'Delete') { e.preventDefault(); borrar(); }
    else if (k === 'ArrowLeft') { e.preventDefault(); mover(0, -1); }
    else if (k === 'ArrowRight') { e.preventDefault(); mover(0, 1); }
    else if (k === 'ArrowUp') { e.preventDefault(); mover(-1, 0); }
    else if (k === 'ArrowDown') { e.preventDefault(); mover(1, 0); }
    else if (k === 'Tab') { e.preventDefault(); moverEntrada(e.shiftKey ? -1 : 1); }
    else if (k === 'Enter') { e.preventDefault(); moverEntrada(1); }
    else if (k === ' ') { e.preventDefault(); alternarDireccion(); }
    else if (k === 'Escape') { const f = document.querySelector('.cru-fin'); if (f) f.remove(); }
    else if (k.length === 1) {
      const ch = aLetras(k);
      if (ch.length === 1) { e.preventDefault(); escribir(ch); }
    }
  }

  const escuchar = (obj, tipo, fn) => { obj.addEventListener(tipo, fn); escuchas.push(() => obj.removeEventListener(tipo, fn)); };

  function detener() {
    clearInterval(reloj);
    clearTimeout(toastT);
    escuchas.forEach((f) => f());
    escuchas = [];
  }

  function salir() {
    Sonido.clic();
    if (S && !S.terminado) guardarProgreso();
    detener();
    alVolver();
  }

  // ----- arranque -----
  function iniciar() {
    S = nuevoEstado(guardado);
    pintar();
    // retoma el progreso guardado: las palabras ya correctas quedan resueltas sin festejo
    for (const e of T.entradas) if (llena(e) && correcta(e)) S.resueltas.add(e.id);
    reconstruirFijas();
    repintarTodo();
    const primera = T.entradas.find((e) => !S.resueltas.has(e.id)) || T.entradas[0];
    irAEntrada(primera);
    $('#cru-reloj').textContent = fmtTiempo(S.seg);
    reloj = setInterval(() => {
      if (S.terminado || document.visibilityState !== 'visible') return;
      S.seg++;
      const r = $('#cru-reloj');
      if (r) r.textContent = fmtTiempo(S.seg);
      if (S.seg % 5 === 0) guardarProgreso();
    }, 1000);
    escuchar(document, 'keydown', onKey);
    let pend = null;
    escuchar(window, 'resize', () => { clearTimeout(pend); pend = setTimeout(calcularTamano, 120); });
    if (S.resueltas.size === T.entradas.length) setTimeout(terminar, 300);
  }

  iniciar();
}
