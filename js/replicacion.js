// ==========================================================
// replicacion.js: actividad interactiva "Burbuja de replicación".
// Se abre desde la pantalla de una materia (si algún tema declara
// "actividad": "replicacion" en su JSON). No necesita datos extra.
//
// Niveles:
//   0 Explorar         tocá cualquier parte y leé qué es
//   1 Reconocer        helicasa, polimerasa, cebador, molde, hebra nueva, origen
//   2 Líder/rezagada   tocá la hebra pedida o clasificá la marcada
//   3 Moldes           ¿cuál es el molde de la líder / rezagada de cada horquilla?
//
// El rol de cada hebra NO está escrito a mano: se calcula a partir de los
// extremos 5'/3' del molde y del sentido en que avanza cada horquilla. Por eso
// el dibujo se da vuelta al azar (molde superior 3'→5' o 5'→3') y hay que razonar.
// ==========================================================

import { estado, guardar } from './store.js?v=dev';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Burbuja de replicación: líder, rezagada y molde';

const W = 600, H = 440, CY = 220;
const PREGUNTAS_POR_RONDA = 8;
const HITOS = [3, 5, 8];

// ---------- Geometría ----------

// Molde superior: dúplex a los costados y burbuja en el medio (el inferior es el espejo)
const CURVA_L = [[92, 208], [116, 208], [128, 72], [300, 72]];
const CURVA_R = [[300, 72], [472, 72], [484, 208], [508, 208]];
const TOP_D = 'M0,208 L92,208 C116,208 128,72 300,72 C472,72 484,208 508,208 L600,208';
const BOT_D = 'M0,232 L92,232 C116,232 128,368 300,368 C472,368 484,232 508,232 L600,232';

const bez = (p, t) => {
  const u = 1 - t;
  return [
    u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
  ];
};
const dbez = (p, t) => {
  const u = 1 - t;
  return [
    3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]),
    3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]),
  ];
};

// Puntos del molde y de la hebra nueva (desplazada hacia el centro de la burbuja)
function muestrear(curva, t0, t1, n, d) {
  const molde = [], nueva = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [x, y] = bez(curva, t);
    const [dx, dy] = dbez(curva, t);
    const l = Math.hypot(dx, dy) || 1;
    let nx = -dy / l, ny = dx / l;
    if (nx * (300 - x) + ny * (CY - y) < 0) { nx = -nx; ny = -ny; }
    molde.push([x, y]);
    nueva.push([x + nx * d, y + ny * d]);
  }
  return { molde, nueva };
}

const espejo = (pts) => pts.map(([x, y]) => [x, H - y]);

const N_PTS = 28;
const GEO = (() => {
  const L = muestrear(CURVA_L, 0.2, 1, N_PTS, 25);
  const R = muestrear(CURVA_R, 0, 0.8, N_PTS, 25);
  return {
    TL: L, TR: R,
    BL: { molde: espejo(L.molde), nueva: espejo(L.nueva) },
    BR: { molde: espejo(R.molde), nueva: espejo(R.nueva) },
  };
})();

const f1 = (n) => n.toFixed(1);
const trazo = (pts) => 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');

// ---------- Modelo: quién es líder y quién rezagada ----------

// flip=false: molde superior con 3' a la izquierda (y el inferior con 5' a la izquierda)
function calcularPiezas(flip) {
  const izqSup = flip ? 5 : 3;
  const piezas = {};
  for (const tpl of ['top', 'bot']) {
    const izq = tpl === 'top' ? izqSup : (izqSup === 3 ? 5 : 3);
    // La hebra nueva es antiparalela al molde y se sintetiza siempre 5'→3'
    const synth = izq === 3 ? +1 : -1;          // +1 = hacia la derecha
    for (const half of ['L', 'R']) {
      const fork = half === 'L' ? -1 : +1;      // sentido en que avanza esa horquilla
      piezas[(tpl === 'top' ? 'T' : 'B') + half] = { id: (tpl === 'top' ? 'T' : 'B') + half, tpl, half, synth, fork, lider: synth === fork };
    }
  }
  return { piezas, izqSup };
}

const lado = (n) => (n < 0 ? 'izquierda' : 'derecha');
const ladoOpuesto = (n) => (n < 0 ? 'derecha' : 'izquierda');

function explicarPieza(p) {
  const molde = p.tpl === 'top' ? 'superior' : 'inferior';
  if (p.lider) {
    return `Es LÍDER: la polimerasa sintetiza 5′→3′ hacia la ${lado(p.synth)}, y la horquilla ${lado(p.fork)} también avanza hacia la ${lado(p.fork)}. Copia de corrido, sin cortes. Su molde es la hebra parental ${molde}.`;
  }
  return `Es REZAGADA: la horquilla ${lado(p.fork)} avanza hacia la ${lado(p.fork)}, pero la polimerasa solo puede sintetizar 5′→3′ hacia la ${lado(p.synth)}, o sea, alejándose de la horquilla. Por eso copia en fragmentos de Okazaki, cada uno con su cebador. Su molde es la hebra parental ${molde}.`;
}

const INFO_CAT = {
  helicasa: 'La helicasa abre la doble hélice en la horquilla: rompe los puentes de hidrógeno entre las bases y deja dos hebras molde.',
  polimerasa: 'La ADN polimerasa agrega nucleótidos solo en el extremo 3′ de la hebra nueva (sintetiza 5′→3′) y necesita un cebador para arrancar.',
  cebador: 'El ARN cebador (primer) lo hace la primasa y le da a la polimerasa un extremo 3′ para empezar. La líder necesita uno; la rezagada, uno por cada fragmento de Okazaki.',
  molde: 'Las hebras molde (parentales) son las dos hebras originales. Cada una guía la síntesis de una hebra nueva complementaria y antiparalela.',
  nueva: 'Las hebras nuevas se sintetizan 5′→3′ y son antiparalelas a su molde. En cada horquilla una es líder (continua) y otra rezagada (en fragmentos).',
  origen: 'El origen de replicación es el punto donde empieza a abrirse la burbuja. Desde ahí las dos horquillas avanzan en sentidos opuestos (replicación bidireccional).',
};
const NOMBRE_CAT = {
  helicasa: 'la helicasa', polimerasa: 'la ADN polimerasa', cebador: 'un ARN cebador',
  molde: 'una hebra molde', nueva: 'una hebra nueva', origen: 'el origen de replicación',
};
const PEDIDO_CAT = {
  helicasa: 'Tocá la helicasa.',
  polimerasa: 'Tocá una ADN polimerasa.',
  cebador: 'Tocá un ARN cebador (primer).',
  molde: 'Tocá una hebra molde (la parental, violeta).',
  nueva: 'Tocá una hebra nueva (la recién sintetizada, dorada).',
  origen: 'Tocá el origen de replicación.',
};

// ---------- Dibujo ----------

function flechaPunta(a, b) {
  // triángulo en b apuntando de a hacia b
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l, px = -uy, py = ux, s = 9;
  const p1 = [b[0] + ux * s, b[1] + uy * s];
  const p2 = [b[0] - ux * 2 + px * s * 0.6, b[1] - uy * 2 + py * s * 0.6];
  const p3 = [b[0] - ux * 2 - px * s * 0.6, b[1] - uy * 2 - py * s * 0.6];
  return `${f1(p1[0])},${f1(p1[1])} ${f1(p2[0])},${f1(p2[1])} ${f1(p3[0])},${f1(p3[1])}`;
}

// Fragmentos de Okazaki: tres trozos separados por huecos (índices sobre N_PTS+1 puntos)
const FRAGMENTOS = [[0, 6], [10, 16], [20, N_PTS]];

function dibujarSVG(piezas, izqSup) {
  const supIzq = izqSup === 3 ? '3′' : '5′', supDer = izqSup === 3 ? '5′' : '3′';
  const infIzq = izqSup === 3 ? '5′' : '3′', infDer = izqSup === 3 ? '3′' : '5′';

  // escalones del dúplex fuera de la burbuja
  let peldanos = '';
  for (let x = 8; x < 92; x += 12) peldanos += `<line x1="${x}" y1="209" x2="${x}" y2="231"/>`;
  for (let x = 516; x < 600; x += 12) peldanos += `<line x1="${x}" y1="209" x2="${x}" y2="231"/>`;

  let grupos = '';       // peldaños de la burbuja + hebras nuevas
  let encima = '';       // cebadores, polimerasas, helicasas
  let pistas = '';

  for (const id of ['TL', 'TR', 'BL', 'BR']) {
    const p = piezas[id];
    const g = GEO[id];
    const pts = g.nueva;
    for (let i = 1; i < pts.length - 1; i += 3) {
      peldanos += `<line x1="${f1(g.molde[i][0])}" y1="${f1(g.molde[i][1])}" x2="${f1(pts[i][0])}" y2="${f1(pts[i][1])}"/>`;
    }
    const trozos = p.lider ? [[0, N_PTS]] : FRAGMENTOS;
    const cls = `nueva ${p.lider ? 'lider' : 'rezagada'}`;
    grupos += `<g class="el ${cls}" data-id="n-${id}" data-cat="nueva"><path class="hit" d="${trazo(pts)}"/>` +
      trozos.map(([a, b]) => `<path class="n" d="${trazo(pts.slice(a, b + 1))}"/>`).join('') + `</g>`;

    // extremo 5' (inicio de síntesis) y 3' (donde crece) de cada trozo
    trozos.forEach(([a, b], k) => {
      const cinco = p.synth > 0 ? pts[a] : pts[b];
      const tres = p.synth > 0 ? pts[b] : pts[a];
      const antes = p.synth > 0 ? pts[b - 1] : pts[a + 1];
      encima += `<g class="el cebador" data-id="c-${id}-${k}" data-cat="cebador"><circle class="hit" cx="${f1(cinco[0])}" cy="${f1(cinco[1])}" r="12"/><rect x="${f1(cinco[0] - 5)}" y="${f1(cinco[1] - 5)}" width="10" height="10" rx="2.5"/></g>`;
      pistas += `<polygon class="punta" points="${flechaPunta(antes, tres)}"/>`;
    });

    // polimerasa: en el extremo 3' de la hebra líder o del fragmento más cercano a la horquilla
    const pegado = p.lider ? [0, N_PTS] : (p.half === 'L' ? FRAGMENTOS[0] : FRAGMENTOS[FRAGMENTOS.length - 1]);
    const tresPol = p.synth > 0 ? pts[pegado[1]] : pts[pegado[0]];
    const dxp = p.synth * 8;
    encima += `<g class="el pol" data-id="p-${id}" data-cat="polimerasa"><circle class="hit" cx="${f1(tresPol[0] + dxp)}" cy="${f1(tresPol[1])}" r="18"/><circle class="cuerpo" cx="${f1(tresPol[0] + dxp)}" cy="${f1(tresPol[1])}" r="11"/><text x="${f1(tresPol[0] + dxp)}" y="${f1(tresPol[1] + 4.5)}" text-anchor="middle">P</text></g>`;

    // rótulos 5′/3′ de la hebra nueva (solo con pistas)
    const izqLbl = p.synth > 0 ? '5′' : '3′', derLbl = p.synth > 0 ? '3′' : '5′';
    const fuera = (i) => {
      const m = g.molde[i], n = pts[i];
      const dx = m[0] - n[0], dy = m[1] - n[1], l = Math.hypot(dx, dy) || 1;
      const esOrigen = (p.half === 'L' && i === N_PTS) || (p.half === 'R' && i === 0);
      return [m[0] + (dx / l) * 19 + (esOrigen ? (p.half === 'L' ? -15 : 15) : 0), m[1] + (dy / l) * 19 + 5];
    };
    const la = fuera(0), lb = fuera(N_PTS);
    pistas += `<text class="et" x="${f1(la[0])}" y="${f1(la[1])}" text-anchor="middle">${izqLbl}</text>` +
              `<text class="et" x="${f1(lb[0])}" y="${f1(lb[1])}" text-anchor="middle">${derLbl}</text>`;
  }

  const helicasa = (x, id) =>
    `<g class="el hel" data-id="h-${id}" data-cat="helicasa"><circle class="hit" cx="${x}" cy="220" r="26"/><circle class="anillo" cx="${x}" cy="220" r="15"/><circle class="hueco" cx="${x}" cy="220" r="6"/></g>`;

  return `
  <svg viewBox="0 36 ${W} 368" role="img" aria-label="Burbuja de replicación del ADN con dos horquillas">
    <g class="peldanos">${peldanos}</g>
    <g class="el molde" data-id="m-top" data-cat="molde"><path class="hit" d="${TOP_D}"/><path class="t" d="${TOP_D}"/></g>
    <g class="el molde" data-id="m-bot" data-cat="molde"><path class="hit" d="${BOT_D}"/><path class="t" d="${BOT_D}"/></g>
    ${grupos}
    <g class="el origen" data-id="o" data-cat="origen"><rect class="hit" x="284" y="110" width="32" height="220"/><line x1="300" y1="118" x2="300" y2="322"/><text x="300" y="226" text-anchor="middle">origen</text></g>
    ${encima}
    ${helicasa(86, 'L')}${helicasa(514, 'R')}
    <g class="pistas">${pistas}</g>
    <g class="rotulos">
      <text x="6" y="196">${supIzq}</text><text x="594" y="196" text-anchor="end">${supDer}</text>
      <text x="6" y="258">${infIzq}</text><text x="594" y="258" text-anchor="end">${infDer}</text>
    </g>
    <g class="horquillas">
      <text x="6" y="300">◀ Horquilla</text><text x="6" y="318">izquierda</text>
      <text x="594" y="300" text-anchor="end">Horquilla ▶</text><text x="594" y="318" text-anchor="end">derecha</text>
    </g>
  </svg>`;
}

// ---------- Estilos (se inyectan una sola vez) ----------

function inyectarEstilos() {
  if (document.getElementById('estilos-replicacion')) return;
  const st = document.createElement('style');
  st.id = 'estilos-replicacion';
  st.textContent = `
.rep .chips { margin-bottom: .6rem; }
.rep-hud { display: flex; flex-wrap: wrap; gap: .4rem .9rem; align-items: center; color: var(--tenue); font-size: .95rem; margin-bottom: .4rem; }
.rep-hud b { color: var(--crema); }
.rep-hud .r { color: var(--ambar); font-family: var(--pixel); }
.rep-pregunta { font-size: clamp(1.15rem, 4.2vw, 1.45rem); font-weight: 700; line-height: 1.3; min-height: 2.6em; margin: .3rem 0 .2rem; }
.rep-lienzo { background: var(--panel); border: 2px solid var(--linea); border-radius: var(--radio); padding: .4rem; margin: .5rem 0; }
.rep-lienzo svg { display: block; width: 100%; height: auto; -webkit-tap-highlight-color: transparent; user-select: none; }
.rep-lienzo .hit { fill: none; stroke: transparent; stroke-width: 28; pointer-events: stroke; }
.rep-lienzo circle.hit, .rep-lienzo rect.hit { fill: transparent; stroke: none; pointer-events: all; }
.rep-lienzo .el { cursor: pointer; }
.rep-lienzo .peldanos line { stroke: var(--linea); stroke-width: 2; pointer-events: none; }
.rep-lienzo .molde path.t { fill: none; stroke: #9B7BFF; stroke-width: 7; stroke-linecap: round; pointer-events: none; }
.rep-lienzo .nueva path.n { fill: none; stroke: #FFB938; stroke-width: 7; stroke-linecap: round; pointer-events: none; transition: stroke .25s; }
.rep-lienzo.rev .nueva.lider path.n { stroke: #4FE0A0; }
.rep-lienzo.rev .nueva.rezagada path.n { stroke: #FF8A5C; }
.rep-lienzo .cebador rect { fill: var(--crema); stroke: #FF7AA8; stroke-width: 2.5; pointer-events: none; }
.rep-lienzo .pol .cuerpo { fill: #5CC8FF; stroke: #0b2e40; stroke-width: 2; pointer-events: none; }
.rep-lienzo .pol text { fill: #0b2e40; font: 800 13px var(--fuente); pointer-events: none; }
.rep-lienzo .hel .anillo { fill: none; stroke: #FF7AA8; stroke-width: 8; pointer-events: none; }
.rep-lienzo .hel .hueco { fill: var(--noche); pointer-events: none; }
.rep-lienzo .origen line { stroke: var(--tenue); stroke-width: 2; stroke-dasharray: 5 6; pointer-events: none; }
.rep-lienzo .origen text { fill: var(--tenue); font: 600 14px var(--fuente); pointer-events: none; paint-order: stroke; stroke: var(--panel); stroke-width: 6px; }
.rep-lienzo .rotulos text { fill: var(--crema); font: 800 20px var(--fuente); pointer-events: none; }
.rep-lienzo .horquillas text { fill: var(--tenue); font: 600 15px var(--fuente); pointer-events: none; }
.rep-lienzo .pistas { display: none; pointer-events: none; }
.rep-lienzo.pista .pistas, .rep-lienzo.rev .pistas { display: inline; }
.rep-lienzo .pistas .et { fill: var(--crema); font: 800 17px var(--fuente); }
.rep-lienzo .pistas .punta { fill: var(--crema); }
.rep-lienzo .el.objetivo { animation: rep-pulso 1s ease-in-out infinite; }
@keyframes rep-pulso { 50% { filter: drop-shadow(0 0 7px #fff); } }
.rep-lienzo .el.ok { filter: drop-shadow(0 0 8px #4FE0A0); }
.rep-lienzo .el.mal { filter: drop-shadow(0 0 8px #FF5D7A); }
.rep-lienzo .el.sel { filter: drop-shadow(0 0 7px #fff); }
.rep-botones { display: flex; flex-wrap: wrap; gap: .6rem; margin: .6rem 0; }
.rep-botones .btn { flex: 1 1 8rem; }
.rep-feedback { min-height: 3rem; margin: .4rem 0 .8rem; }
.rep-feedback .veredicto { font-weight: 800; font-size: 1.1rem; }
.rep-feedback .veredicto.ok { color: var(--ok); }
.rep-feedback .veredicto.mal { color: var(--mal); }
.rep-feedback p + p { margin-top: .3rem; color: var(--tenue); }
.rep-leyenda { display: flex; flex-wrap: wrap; gap: .3rem .9rem; font-size: .85rem; color: var(--tenue); margin-top: .4rem; }
.rep-leyenda i { display: inline-block; width: .8rem; height: .8rem; border-radius: 3px; margin-right: .3rem; vertical-align: -1px; }
@media (prefers-reduced-motion: reduce) { .rep-lienzo .el.objetivo { animation: none; filter: drop-shadow(0 0 7px #fff); } }
`;
  document.head.appendChild(st);
}

// ---------- Actividad ----------

const NIVELES = [
  [0, 'Explorar'],
  [1, 'Reconocer'],
  [2, 'Líder y rezagada'],
  [3, 'Moldes'],
];

const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

export function abrirReplicacion({ app, volver }) {
  inyectarEstilos();

  let nivel = 0;
  let flip = false;
  let modelo = calcularPiezas(false);
  let q = null;
  let respondida = false;
  let usoPista = false;
  let ronda = { i: 0, aciertos: 0, racha: 0, mejorRacha: 0, puntos: 0, ultCat: null };

  const $ = (s) => app.querySelector(s);
  const registro = () => ((estado.actividades ||= {}).replicacion ||= { mejor: 0 });

  // ----- armado de preguntas -----
  function generar() {
    const P = modelo.piezas;
    if (nivel === 1) {
      const cats = Object.keys(PEDIDO_CAT).filter((c) => c !== ronda.ultCat);
      const cat = azar(cats);
      ronda.ultCat = cat;
      return { tipo: 'cat', cat, texto: PEDIDO_CAT[cat] };
    }
    if (nivel === 2) {
      const half = azar(['L', 'R']);
      const lider = azar([true, false]);
      const objetivo = Object.values(P).find((p) => p.half === half && p.lider === lider);
      if (Math.random() < 0.5) {
        return { tipo: 'pieza', pieza: objetivo, texto: `En la horquilla ${half === 'L' ? 'izquierda' : 'derecha'}, tocá la hebra ${lider ? 'LÍDER' : 'REZAGADA'}.` };
      }
      const marcada = azar(Object.values(P));
      return { tipo: 'clasificar', pieza: marcada, texto: `La hebra nueva marcada, de la horquilla ${marcada.half === 'L' ? 'izquierda' : 'derecha'}: ¿es líder o rezagada?` };
    }
    // nivel 3
    const pz = azar(Object.values(P));
    return { tipo: 'molde', pieza: pz, texto: `¿Cuál es el molde de la hebra ${pz.lider ? 'LÍDER' : 'REZAGADA'} de la horquilla ${pz.half === 'L' ? 'izquierda' : 'derecha'}? Tocá la hebra molde.` };
  }

  function explicarMolde(pz) {
    const molde = pz.tpl === 'top' ? 'superior' : 'inferior';
    const regla = pz.lider
      ? 'se lee 3′→5′ en el mismo sentido en que avanza la horquilla'
      : 'se lee 5′→3′ en el sentido en que avanza la horquilla';
    return `Es la hebra parental ${molde}: ${regla}. Ojo: cada molde es líder en una horquilla y rezagada en la otra.`;
  }

  // ----- pantallas -----
  function pintar() {
    app.innerHTML = `
      <main class="pantalla rep">
        <button class="btn enlace" id="rep-volver">← Volver</button>
        <h1 class="titulo-seccion">🧬 Burbuja de replicación</h1>
        <div class="chips" role="group" aria-label="Nivel">
          ${NIVELES.map(([n, t]) => `<button class="chip ${n === nivel ? 'activo' : ''}" data-nivel="${n}">${t}</button>`).join('')}
        </div>
        <div class="rep-hud" id="rep-hud"></div>
        <p class="rep-pregunta" id="rep-pregunta"></p>
        <div class="rep-lienzo" id="rep-lienzo"></div>
        <div class="rep-botones" id="rep-botones"></div>
        <div class="rep-feedback" id="rep-feedback" aria-live="polite"></div>
        <div class="rep-leyenda">
          <span><i style="background:#9B7BFF"></i>hebra molde</span>
          <span><i style="background:#FFB938"></i>hebra nueva</span>
          <span><i style="background:#FF7AA8"></i>helicasa / cebador</span>
          <span><i style="background:#5CC8FF"></i>polimerasa</span>
        </div>
      </main>`;
    $('#rep-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
    app.querySelectorAll('[data-nivel]').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      nivel = Number(b.dataset.nivel);
      nuevaRonda();
      pintar();
      siguiente(true);
    }));
    $('#rep-lienzo').addEventListener('click', (e) => {
      const g = e.target.closest('[data-id]');
      if (g) tocar(g);
    });
    window.scrollTo(0, 0);
  }

  function nuevaRonda() {
    ronda = { i: 0, aciertos: 0, racha: 0, mejorRacha: 0, puntos: 0, ultCat: null };
  }

  function hud() {
    if (nivel === 0) { $('#rep-hud').innerHTML = '<span>Tocá cualquier parte del dibujo para ver qué es.</span>'; return; }
    $('#rep-hud').innerHTML = `<span>Pregunta <b>${Math.min(respondida ? ronda.i : ronda.i + 1, PREGUNTAS_POR_RONDA)}</b> de ${PREGUNTAS_POR_RONDA}</span>
      <span class="r">🔥 ${ronda.racha}</span><span><b>${ronda.puntos}</b> pts</span>`;
  }

  // Dibuja una pregunta nueva (o el modo explorar)
  function siguiente(primera = false) {
    if (nivel > 0 && ronda.i >= PREGUNTAS_POR_RONDA) { resultado(); return; }
    flip = Math.random() < 0.5;
    modelo = calcularPiezas(flip);
    respondida = false;
    usoPista = false;
    q = nivel === 0 ? null : generar();

    const lienzo = $('#rep-lienzo');
    lienzo.innerHTML = dibujarSVG(modelo.piezas, modelo.izqSup);
    lienzo.classList.toggle('rev', nivel === 0);
    lienzo.classList.remove('pista');

    $('#rep-pregunta').textContent = nivel === 0 ? 'Modo explorar: tocá la helicasa, una polimerasa, una hebra…' : q.texto;
    $('#rep-feedback').innerHTML = '';
    hud();

    const cont = $('#rep-botones');
    cont.innerHTML = '';
    if (nivel > 0) {
      if (q.tipo === 'clasificar') {
        cont.innerHTML = `<button class="btn primario" data-resp="lider">Líder</button><button class="btn primario" data-resp="rezagada">Rezagada</button>`;
        cont.querySelectorAll('[data-resp]').forEach((b) => b.addEventListener('click', () => responderClasificar(b.dataset.resp === 'lider')));
        lienzo.querySelector(`[data-id="n-${q.pieza.id}"]`)?.classList.add('objetivo');
      }
      const bp = document.createElement('button');
      bp.className = 'btn secundario';
      bp.id = 'rep-pista';
      bp.textContent = '💡 Mostrar extremos 5′/3′';
      bp.addEventListener('click', () => { usoPista = true; lienzo.classList.add('pista'); bp.disabled = true; Sonido.clic(); });
      cont.appendChild(bp);
    } else if (!primera) {
      // en explorar, "otra vista" da vuelta el dibujo
    }
    if (nivel === 0) {
      cont.innerHTML = `<button class="btn secundario" id="rep-girar">🔄 Dar vuelta el dibujo</button>`;
      $('#rep-girar').addEventListener('click', () => { Sonido.clic(); siguiente(); });
    }
  }

  function mostrarInfoExplorar(g) {
    app.querySelectorAll('#rep-lienzo .sel').forEach((e) => e.classList.remove('sel'));
    g.classList.add('sel');
    const cat = g.dataset.cat;
    let txt;
    if (cat === 'nueva') txt = `<p><b>Hebra nueva.</b> ${explicarPieza(modelo.piezas[g.dataset.id.slice(2)])}</p>`;
    else txt = `<p><b>${NOMBRE_CAT[cat][0].toUpperCase() + NOMBRE_CAT[cat].slice(1)}.</b> ${INFO_CAT[cat]}</p>`;
    $('#rep-feedback').innerHTML = txt;
  }

  function tocar(g) {
    if (nivel === 0 || respondida) { mostrarInfoExplorar(g); return; }
    const cat = g.dataset.cat;
    const id = g.dataset.id;

    if (q.tipo === 'clasificar') {
      $('#rep-feedback').innerHTML = '<p>Elegí con los botones: ¿líder o rezagada?</p>';
      return;
    }
    if (q.tipo === 'pieza') {
      if (cat !== 'nueva') { $('#rep-feedback').innerHTML = '<p>Tocá una de las hebras nuevas (las doradas).</p>'; return; }
      const ok = id === `n-${q.pieza.id}`;
      cerrar(ok, g, ok ? '' : `Tocaste otra: ${modelo.piezas[id.slice(2)].lider ? 'esa es la líder' : 'esa es la rezagada'}${modelo.piezas[id.slice(2)].half === q.pieza.half ? ' de esa misma horquilla' : ' pero de la otra horquilla'}.`, explicarPieza(q.pieza), [`[data-id="n-${q.pieza.id}"]`]);
      return;
    }
    if (q.tipo === 'molde') {
      if (cat !== 'molde') { $('#rep-feedback').innerHTML = '<p>Tocá una de las dos hebras molde (las violetas).</p>'; return; }
      const correcto = q.pieza.tpl === 'top' ? 'm-top' : 'm-bot';
      cerrar(id === correcto, g, '', explicarMolde(q.pieza), [`[data-id="${correcto}"]`]);
      return;
    }
    // nivel 1
    const ok = cat === q.cat;
    cerrar(ok, g, ok ? '' : `Eso es ${NOMBRE_CAT[cat]}.`, INFO_CAT[q.cat], [`[data-cat="${q.cat}"]`]);
  }

  function responderClasificar(esLider) {
    if (respondida) return;
    const ok = esLider === q.pieza.lider;
    const g = $(`#rep-lienzo [data-id="n-${q.pieza.id}"]`);
    cerrar(ok, g, '', explicarPieza(q.pieza), []);
  }

  function cerrar(ok, tocado, extra, explicacion, objetivos) {
    respondida = true;
    const lienzo = $('#rep-lienzo');
    lienzo.classList.add('rev');
    lienzo.querySelectorAll('.objetivo').forEach((e) => e.classList.remove('objetivo'));
    if (!ok) objetivos.forEach((s) => lienzo.querySelectorAll(s).forEach((e) => e.classList.add('ok')));
    if (tocado) tocado.classList.add(ok ? 'ok' : 'mal');

    ronda.i++;
    let veredicto;
    if (ok) {
      ronda.aciertos++;
      ronda.racha++;
      ronda.mejorRacha = Math.max(ronda.mejorRacha, ronda.racha);
      const ganado = (usoPista ? 50 : 100) + Math.min(ronda.racha - 1, 5) * 10;
      ronda.puntos += ganado;
      Sonido.acierto(ronda.racha);
      if (HITOS.includes(ronda.racha)) setTimeout(() => { Sonido.hito(); lanzarConfeti(60); }, 250);
      veredicto = `<p class="veredicto ok">¡Correcto! +${ganado}</p>`;
    } else {
      Sonido.error(ronda.racha >= 3);
      ronda.racha = 0;
      veredicto = `<p class="veredicto mal">Incorrecto${extra ? `. ${extra}` : ''}</p>`;
    }
    $('#rep-feedback').innerHTML = `${veredicto}<p>${explicacion}</p><p>Podés tocar cualquier parte para ver qué es.</p>`;
    $('#rep-botones').innerHTML = `<button class="btn primario" id="rep-sig">${ronda.i >= PREGUNTAS_POR_RONDA ? 'Ver resultado' : 'Siguiente'}</button>`;
    const b = $('#rep-sig');
    b.addEventListener('click', () => { Sonido.clic(); siguiente(); });
    b.focus({ preventScroll: true });
    b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    hud();
  }

  function resultado() {
    const pct = Math.round((ronda.aciertos / PREGUNTAS_POR_RONDA) * 100);
    const reg = registro();
    const nuevoRecord = pct > (reg.mejor || 0);
    if (nuevoRecord) reg.mejor = pct;
    try { guardar(); } catch (_) { /* sin almacenamiento */ }

    let emoji = '💪', titulo = 'A seguir practicando';
    if (pct >= 90) { emoji = '🏆'; titulo = '¡Excelente!'; }
    else if (pct >= 70) { emoji = '🎉'; titulo = '¡Muy bien!'; }
    else if (pct >= 50) { emoji = '👍'; titulo = 'Vas por buen camino'; }

    $('#rep-hud').innerHTML = '';
    $('#rep-pregunta').textContent = '';
    $('#rep-lienzo').innerHTML = `
      <div class="resultado" style="padding:1.2rem .5rem">
        <div class="grande" aria-hidden="true">${emoji}</div>
        <h1>${titulo}</h1>
        <div class="cifras" style="margin-top:1rem">
          <div class="cifra"><b>${ronda.puntos}</b><span>Puntos</span></div>
          <div class="cifra"><b>${pct}%</b><span>${ronda.aciertos} de ${PREGUNTAS_POR_RONDA}</span></div>
          <div class="cifra"><b>${ronda.mejorRacha}</b><span>Mejor racha</span></div>
        </div>
        <p class="sub" style="margin:0 auto">${nuevoRecord ? '¡Nuevo récord en esta actividad!' : `Tu mejor resultado: ${reg.mejor}%`}</p>
      </div>`;
    $('#rep-lienzo').classList.remove('rev', 'pista');
    $('#rep-feedback').innerHTML = '';
    $('#rep-botones').innerHTML = `<button class="btn primario" id="rep-otra">Otra ronda</button><button class="btn secundario" id="rep-explorar">Explorar</button>`;
    $('#rep-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); siguiente(); });
    $('#rep-explorar').addEventListener('click', () => { Sonido.clic(); nivel = 0; nuevaRonda(); pintar(); siguiente(true); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  pintar();
  siguiente(true);
}
