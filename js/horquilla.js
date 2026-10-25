// ==========================================================
// horquilla.js: actividad "Taller de la horquilla" (enzimas y enlaces).
// Se activa con  "actividad": [..., "horquilla"]  en el JSON de un tema.
// No necesita datos extra: el contenido está en la sección DATOS de abajo
// (se puede editar ahí: textos de cada enzima, pasos del orden, etc.).
//
// Modos:
//   Armar el equipo  ubicá cada enzima en el problema que resuelve (procariotas / eucariotas)
//   Enlaces          zoom molecular: puentes de hidrógeno, fosfodiéster y glucosídico
//   ¿Y si falta…?    sacás una enzima y predecís la consecuencia
//   Orden            ordená los pasos de un fragmento de Okazaki
//   ¿Quién es?       identificá la enzima por su descripción
// ==========================================================

import { estado, guardar } from './store.js';
import { Sonido } from './sonido.js';
import { lanzarConfeti } from './confeti.js';

export const TITULO = 'Taller de la horquilla: enzimas y enlaces';

// ==========================================================
// DATOS (editables)
// ==========================================================

// dom: 'pro' (procariotas), 'euca' (eucariotas) o 'ambos'
const ENZ = {
  helicasa: {
    nombre: 'Helicasa', corto: 'Helicasa', dom: 'ambos', color: '#FF7AA8', pol: false,
    funcion: 'abre la doble hélice en la horquilla.',
    enlace: 'Rompe los puentes de hidrógeno entre las bases complementarias.',
    perfil: 'Rompe los puentes de hidrógeno entre bases complementarias para separar las hebras parentales.',
    falta: 'La doble hélice no se abre: no se forma la horquilla y no hay molde para copiar.',
  },
  ssb: {
    nombre: 'Proteínas SSB', corto: 'SSB', dom: 'ambos', color: '#5CC8FF', pol: false,
    funcion: 'se unen al ADN de hebra simple.',
    enlace: 'Evitan que se vuelvan a formar los puentes de hidrógeno entre las hebras separadas.',
    perfil: 'Se unen al ADN monocatenario y evitan que las hebras se reapareen.',
    falta: 'Las hebras separadas vuelven a aparearse y la horquilla se cierra antes de que se copien.',
  },
  topo1: {
    nombre: 'Topoisomerasa I', corto: 'Topo I', dom: 'ambos', color: '#B79BFF', pol: false,
    funcion: 'alivia la tensión torsional delante de la horquilla.',
    enlace: 'Corta de forma transitoria una hebra (rompe un enlace fosfodiéster) y luego la vuelve a sellar.',
    perfil: 'Alivia la tensión torsional cortando de manera transitoria una de las hebras.',
    falta: 'Se acumula tensión torsional (superenrollamiento) delante de la horquilla y la hélice no puede seguir abriéndose.',
  },
  primasa: {
    nombre: 'Primasa (ARN primasa)', corto: 'Primasa', dom: 'ambos', color: '#FF8A5C', pol: false,
    funcion: 'sintetiza el cebador de ARN (unos 10 ribonucleótidos).',
    enlace: 'Forma enlaces fosfodiéster entre ribonucleótidos para armar el cebador.',
    perfil: 'Sintetiza un cebador corto de ARN (unos 10 ribonucleótidos) que aporta el extremo 3′-OH libre.',
    falta: 'Ninguna ADN polimerasa puede empezar: sin cebador no hay extremo 3′-OH libre y no se inicia ninguna cadena.',
  },
  ligasa: {
    nombre: 'ADN ligasa', corto: 'Ligasa', dom: 'ambos', color: '#FFF3DC', pol: false,
    funcion: 'sella las muescas entre fragmentos de ADN.',
    enlace: 'Forma el enlace fosfodiéster que une los fragmentos.',
    perfil: 'Sella las muescas uniendo fragmentos de ADN con enlaces fosfodiéster.',
    falta: 'Los fragmentos de Okazaki quedan separados por muescas: la hebra rezagada no queda continua.',
  },
  pol3: {
    nombre: 'ADN polimerasa III', corto: 'Pol III', dom: 'pro', color: '#4FE0A0', pol: true,
    funcion: 'hace la mayor parte de la elongación, en las dos hebras (bacterias).',
    enlace: 'Forma enlaces fosfodiéster al agregar dNTPs en el extremo 3′-OH (sentido 5′→3′).',
    perfil: 'En bacterias, hace la mayor parte de la elongación, tanto en la hebra líder como en la rezagada.',
    falta: 'Casi no hay elongación: ni la hebra líder ni los fragmentos de Okazaki se alargan.',
  },
  pol1: {
    nombre: 'ADN polimerasa I', corto: 'Pol I', dom: 'pro', color: '#FFB938', pol: true,
    funcion: 'elimina los cebadores de ARN y rellena con ADN (bacterias).',
    enlace: 'Forma enlaces fosfodiéster al rellenar con ADN el hueco que deja el cebador.',
    perfil: 'En bacterias, elimina los cebadores de ARN y los reemplaza por desoxirribonucleótidos.',
    falta: 'Los cebadores de ARN quedan en la hebra rezagada y no se reemplazan por ADN.',
  },
  pol2: {
    nombre: 'ADN polimerasa II', corto: 'Pol II', dom: 'pro', color: '#D58BFF', pol: true,
    funcion: 'participa en la reparación del ADN (bacterias).',
    enlace: 'Forma enlaces fosfodiéster al rellenar el tramo reparado.',
    perfil: 'En bacterias, participa en la reparación del ADN dañado (no es la principal de la replicación).',
    falta: 'Los daños y errores del ADN quedan sin reparar: la replicación principal sigue, pero con más mutaciones.',
  },
  alfa: {
    nombre: 'ADN polimerasa α (alfa)', corto: 'Pol α', dom: 'euca', color: '#FFB938', pol: true,
    funcion: 'trabaja con la primasa: extiende el cebador con un tramo corto de ADN (eucariotas).',
    enlace: 'Forma enlaces fosfodiéster al extender el cebador con desoxirribonucleótidos.',
    perfil: 'En eucariotas, actúa junto con la primasa: agrega un tramo corto de ADN inmediatamente después del cebador de ARN.',
    falta: 'No se inicia el tramo corto de ADN que sigue al cebador: las polimerasas principales no tienen desde dónde continuar.',
  },
  epsilon: {
    nombre: 'ADN polimerasa ε (épsilon)', corto: 'Pol ε', dom: 'euca', color: '#4FE0A0', pol: true,
    funcion: 'elonga de forma continua la hebra líder (eucariotas).',
    enlace: 'Forma enlaces fosfodiéster al elongar la hebra líder; tiene corrección de pruebas.',
    perfil: 'En eucariotas, elonga de forma continua la hebra líder.',
    falta: 'La hebra líder no se elonga de forma continua.',
  },
  delta: {
    nombre: 'ADN polimerasa δ (delta)', corto: 'Pol δ', dom: 'euca', color: '#5CC8FF', pol: true,
    funcion: 'sintetiza la hebra rezagada, fragmento por fragmento (eucariotas).',
    enlace: 'Forma enlaces fosfodiéster al elongar los fragmentos de Okazaki; tiene corrección de pruebas.',
    perfil: 'En eucariotas, sintetiza la hebra rezagada en forma de fragmentos de Okazaki.',
    falta: 'Los fragmentos de Okazaki no se alargan: la hebra rezagada queda sin copiar.',
  },
};

const DOM_NOMBRE = { pro: 'procariotas', euca: 'eucariotas', ambos: 'ambos' };

// Cada casillero es un "problema" de la horquilla; acepta una o más enzimas según el dominio.
// zona: dónde se dibuja (ver construirGeo / posicion). Los textos son pistas de situación.
const SLOTS = {
  topo: { problema: 'Delante de la horquilla, en el ADN todavía cerrado, se acumula tensión torsional (superenrollamiento).', acepta: { pro: ['topo1'], euca: ['topo1'] } },
  hel: { problema: 'Hay que separar las dos hebras de la doble hélice, rompiendo los enlaces entre las bases.', acepta: { pro: ['helicasa'], euca: ['helicasa'] } },
  ssb: { problema: 'Las hebras simples recién abiertas tienden a volver a aparearse.', acepta: { pro: ['ssb'], euca: ['ssb'] } },
  pri: { problema: 'Ninguna polimerasa puede empezar de cero: falta un extremo 3′-OH libre. Hay que sintetizar un cebador de ARN.', acepta: { pro: ['primasa'], euca: ['primasa'] } },
  alfa: { problema: 'Justo después del cebador hay que agregar un tramo corto de ADN para que sigan las polimerasas principales.', acepta: { euca: ['alfa'] } },
  lid: { problema: 'La hebra líder tiene que elongarse de forma continua en el mismo sentido en que avanza la horquilla.', acepta: { pro: ['pol3'], euca: ['epsilon'] } },
  rez: { problema: 'Cada fragmento de Okazaki de la hebra rezagada tiene que elongarse a partir de su cebador.', acepta: { pro: ['pol3'], euca: ['delta'] } },
  cebo: { problema: 'En este fragmento hay que eliminar el cebador de ARN y rellenar el hueco con ADN.', acepta: { pro: ['pol1'] } },
  lig: { problema: 'Entre dos fragmentos de ADN quedó una muesca: falta el enlace que une el esqueleto.', acepta: { pro: ['ligasa'], euca: ['ligasa'] } },
  rep: { problema: 'Hay una base mal apareada en el ADN ya sintetizado: hay que repararla.', acepta: { pro: ['pol2'] } },
};
const ORDEN_SLOTS = {
  pro: ['topo', 'hel', 'ssb', 'pri', 'lid', 'rez', 'cebo', 'lig', 'rep'],
  euca: ['topo', 'hel', 'ssb', 'pri', 'alfa', 'lid', 'rez', 'lig'],
};

// Pasos de la vida de un fragmento de Okazaki (en orden)
const PASOS = {
  pro: [
    'La helicasa abre la hélice (rompe puentes de hidrógeno).',
    'Las proteínas SSB cubren la hebra simple.',
    'La primasa sintetiza un cebador de ARN.',
    'La ADN polimerasa III alarga el cebador: se forma el fragmento de Okazaki.',
    'La ADN polimerasa I elimina el cebador y rellena con ADN.',
    'La ADN ligasa sella la muesca (enlace fosfodiéster).',
  ],
  euca: [
    'La helicasa abre la hélice (rompe puentes de hidrógeno).',
    'Las proteínas SSB cubren la hebra simple.',
    'La primasa sintetiza un cebador de ARN.',
    'La ADN polimerasa α agrega un tramo corto de ADN tras el cebador.',
    'La ADN polimerasa δ elonga el fragmento de Okazaki.',
    'Se elimina el cebador de ARN y se reemplaza por ADN.',
    'La ADN ligasa sella la muesca (enlace fosfodiéster).',
  ],
};

// Preguntas del modo Enlaces (r: helice 'hidrogeno' | 'fosfodiester' | 'glucosidico')
const PREG_ENL = [
  { t: 'La helicasa separa las dos hebras. Tocá el enlace que rompe.', r: 'hidrogeno', e: 'La helicasa rompe los puentes de hidrógeno entre las bases; el esqueleto de cada hebra queda intacto.' },
  { t: 'Las proteínas SSB cubren el ADN de hebra simple. Tocá el enlace que evitan que se vuelva a formar.', r: 'hidrogeno', e: 'Al cubrir la hebra simple impiden que se reformen los puentes de hidrógeno entre bases complementarias.' },
  { t: 'La ADN polimerasa agrega un nucleótido a la cadena nueva. Tocá el enlace que forma.', r: 'fosfodiester', e: 'Une el 3′-OH de la cadena en crecimiento con el fosfato del nucleótido que entra (sentido 5′→3′).' },
  { t: 'La ADN ligasa sella la muesca entre dos fragmentos. Tocá el enlace que forma.', r: 'fosfodiester', e: 'La ligasa restablece el enlace fosfodiéster que une el esqueleto azúcar-fosfato.' },
  { t: 'La topoisomerasa I corta de forma transitoria una hebra. Tocá el tipo de enlace que rompe.', r: 'fosfodiester', e: 'Corta el esqueleto azúcar-fosfato (un enlace fosfodiéster) y después lo vuelve a sellar.' },
  { t: 'La primasa arma el cebador de ARN. Tocá el enlace que forma entre ribonucleótidos.', r: 'fosfodiester', e: 'Une ribonucleótidos con enlaces fosfodiéster, igual que en cualquier cadena de ácido nucleico.' },
  { t: '¿Qué enlace mantiene unida una A con su T?', r: 'hidrogeno', e: 'Las bases complementarias se unen por puentes de hidrógeno: 2 en A=T y 3 en G≡C.' },
  { t: '¿Qué enlace une la desoxirribosa con la base nitrogenada?', r: 'glucosidico', e: 'Es el enlace N-glucosídico entre el azúcar y la base.' },
  { t: '¿Qué enlace une nucleótidos consecutivos de una misma hebra?', r: 'fosfodiester', e: 'El enlace fosfodiéster une el 3′-OH de un nucleótido con el fosfato del siguiente: forma el esqueleto de la hebra.' },
  { t: 'Una unión G–C es más fuerte que una A–T. Tocá el enlace responsable.', r: 'hidrogeno', e: 'G≡C tiene 3 puentes de hidrógeno; A=T tiene 2.' },
  { t: 'Si calentás el ADN, las hebras se separan. Tocá el enlace que se rompe primero.', r: 'hidrogeno', e: 'Los puentes de hidrógeno son débiles: se separan sin romper los enlaces covalentes del esqueleto.' },
  { t: 'Las polimerasas con corrección de pruebas retiran un nucleótido mal apareado. Tocá el enlace que cortan para sacarlo.', r: 'fosfodiester', e: 'La exonucleasa 3′→5′ rompe el enlace fosfodiéster que unía ese último nucleótido.' },
];

const INFO_ENL = {
  hidrogeno: 'Puentes de hidrógeno: unen las bases complementarias (A=T: 2; G≡C: 3). Son débiles: se pueden separar sin romper las cadenas.',
  fosfodiester: 'Enlace fosfodiéster: une el 3′-OH de un nucleótido con el fosfato del siguiente. Forma el esqueleto azúcar-fosfato de cada hebra.',
  glucosidico: 'Enlace N-glucosídico: une la desoxirribosa con la base nitrogenada.',
};
const NOMBRE_ENL = { hidrogeno: 'los puentes de hidrógeno', fosfodiester: 'el enlace fosfodiéster', glucosidico: 'el enlace glucosídico' };

// ==========================================================
// Utilidades
// ==========================================================

const HITOS = [3, 5, 8, 10];
const POR_RONDA = 10;
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const azar = (l) => l[Math.floor(Math.random() * l.length)];
function mezclar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const aceptaDe = (slot, dom) => SLOTS[slot].acepta[dom] || [];
const enzDelDominio = (dom) => Object.keys(ENZ).filter((k) => ENZ[k].dom === 'ambos' || ENZ[k].dom === dom);

// ==========================================================
// Geometría de la escena de la horquilla
// ==========================================================

const W = 600, H = 380, CY = 190;
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
const f1 = (n) => n.toFixed(1);
const trazo = (pts) => 'M' + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' L');

// Por cada rama: puntos del molde y de la hebra nueva (por dentro), de la horquilla hacia la izquierda
const GEO = (() => {
  const g = {};
  for (const [lado, sg] of [['top', -1], ['bot', 1]]) {
    const curva = [[440, CY + sg * 12], [395, CY + sg * 12], [375, CY + sg * 100], [250, CY + sg * 100]];
    const molde = [], nueva = [], nrm = [];
    const N = 28;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const [x, y] = bez(curva, t);
      const [dx, dy] = dbez(curva, t);
      const l = Math.hypot(dx, dy) || 1;
      let nx = -dy / l, ny = dx / l;
      if (ny * (CY - y) < 0) { nx = -nx; ny = -ny; }       // normal hacia adentro (centro)
      molde.push([x, y]); nueva.push([x + nx * 26, y + ny * 26]); nrm.push([nx, ny]);
    }
    for (let x = 230; x >= 20; x -= 10) {
      molde.push([x, CY + sg * 100]); nueva.push([x, CY + sg * 74]); nrm.push([0, -sg]);
    }
    const L = [0];
    for (let i = 1; i < molde.length; i++) L.push(L[i - 1] + Math.hypot(molde[i][0] - molde[i - 1][0], molde[i][1] - molde[i - 1][1]));
    g[lado] = { molde, nueva, nrm, L, sg };
  }
  return g;
})();

// Punto a distancia d (px) de la horquilla, sobre 'molde' o 'nueva'
function en(lado, d, cual) {
  const G = GEO[lado], pts = G[cual];
  const dd = Math.max(0, Math.min(d, G.L[G.L.length - 1]));
  let i = 1;
  while (i < G.L.length - 1 && G.L[i] < dd) i++;
  const t = (dd - G.L[i - 1]) / ((G.L[i] - G.L[i - 1]) || 1);
  const n0 = G.nrm[i - 1], n1 = G.nrm[i];
  return {
    x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
    y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
    nx: n0[0] + (n1[0] - n0[0]) * t,
    ny: n0[1] + (n1[1] - n0[1]) * t,
  };
}
// Tramo de la hebra nueva entre dos distancias
function tramo(lado, d0, d1) {
  const G = GEO[lado], pts = [en(lado, d0, 'nueva')];
  for (let i = 0; i < G.L.length; i++) if (G.L[i] > d0 && G.L[i] < d1) pts.push({ x: G.nueva[i][0], y: G.nueva[i][1] });
  pts.push(en(lado, d1, 'nueva'));
  return pts.map((p) => [p.x, p.y]);
}

// Posición y ancla de cada casillero (distancias en px desde la horquilla)
function posicionSlot(id) {
  const dentro = (lado, d, desv) => { const a = en(lado, d, 'nueva'); return { ax: a.x, ay: a.y, x: a.x + a.nx * desv, y: a.y + a.ny * desv }; };
  const fuera = (lado, d, desv) => { const a = en(lado, d, 'molde'); return { ax: a.x, ay: a.y, x: a.x - a.nx * desv, y: a.y - a.ny * desv }; };
  const fuera2 = (lado, d, desv) => { const a = en(lado, d, 'nueva'); return { ax: a.x, ay: a.y, x: a.x - a.nx * desv, y: a.y - a.ny * desv }; };
  switch (id) {
    case 'topo': return { ax: 540, ay: CY - 12, x: 540, y: CY - 46 };
    case 'hel': return { ax: 440, ay: CY, x: 440, y: CY };
    case 'ssb': return fuera('bot', 42, 34);
    case 'pri': return dentro('bot', 92, 34);
    case 'alfa': return fuera('bot', 135, 32);
    case 'lid': return fuera2('top', 170, 58);
    case 'rez': return dentro('bot', 192, 34);
    case 'cebo': return fuera('bot', 222, 32);
    case 'lig': return dentro('bot', 330, 34);
    case 'rep': return fuera2('top', 300, 58);
    default: return { ax: 0, ay: 0, x: 0, y: 0 };
  }
}

function flecha(a, b, color) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l, px = -uy, py = ux, s = 9;
  const P = [[b[0] + ux * s, b[1] + uy * s], [b[0] - ux * 2 + px * 6, b[1] - uy * 2 + py * 6], [b[0] - ux * 2 - px * 6, b[1] - uy * 2 - py * 6]];
  return `<polygon points="${P.map((p) => `${f1(p[0])},${f1(p[1])}`).join(' ')}" fill="${color}"/>`;
}

// llenos: Map slot -> enzima ubicada; sel: slot seleccionado; faltan: Set de slots marcados como faltantes
function escena(dom, llenos = new Map(), sel = null, faltan = new Set(), conNumeros = true) {
  const orden = ORDEN_SLOTS[dom];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Horquilla de replicación">`;

  // ADN parental (adelante, a la derecha)
  let peld = '';
  for (let x = 452; x < 600; x += 12) peld += `<line x1="${x}" y1="${CY - 11}" x2="${x}" y2="${CY + 11}"/>`;
  s += `<g class="peldanos">${peld}</g>`;
  s += `<path class="mol" d="M600,${CY - 12} L440,${CY - 12}"/><path class="mol" d="M600,${CY + 12} L440,${CY + 12}"/>`;
  // ramas
  for (const lado of ['top', 'bot']) {
    const G = GEO[lado];
    s += `<path class="mol" d="${trazo(G.molde)}"/>`;
    // peldaños entre molde y hebra nueva (donde hay hebra nueva)
    const dIni = lado === 'top' ? 82 : 92;
    let p2 = '';
    for (let d = dIni; d < G.L[G.L.length - 1] - 8; d += 12) {
      if (lado === 'bot' && ((d > 190 && d < 214) || (d > 306 && d < 330))) continue;
      const a = en(lado, d, 'molde'), b = en(lado, d, 'nueva');
      p2 += `<line x1="${f1(a.x)}" y1="${f1(a.y)}" x2="${f1(b.x)}" y2="${f1(b.y)}"/>`;
    }
    s += `<g class="peldanos">${p2}</g>`;
  }
  // hebra líder (continua) con punta hacia la horquilla (3′ en la punta)
  const lider = tramo('top', 80, 395);
  s += `<path class="nue" d="${trazo(lider)}"/>`;
  s += flecha(lider[1], lider[0], '#FFF3DC');
  // hebra rezagada: tres fragmentos; cada uno se sintetiza alejándose de la horquilla
  const frags = [[90, 190], [215, 306], [330, 395]];
  frags.forEach(([d0, d1], k) => {
    const t = tramo('bot', d0, d1);
    s += `<path class="nue" d="${trazo(t)}"/>`;
    const fin = t[t.length - 1], ant = t[t.length - 2];
    s += flecha(ant, fin, '#FFF3DC');
    const pr = en('bot', d0, 'nueva');
    if (k === 1) s += `<rect class="cebador" x="${f1(pr.x - 6)}" y="${f1(pr.y - 6)}" width="12" height="12" rx="3"/>`;
    if (k === 0) s += `<rect class="cebador pend" x="${f1(pr.x - 6)}" y="${f1(pr.y - 6)}" width="12" height="12" rx="3"/>`;
  });
  // daño (base mal apareada) en la hebra líder
  const dn = en('top', 260, 'nueva');
  s += `<g class="dano"><line x1="${f1(dn.x - 6)}" y1="${f1(dn.y - 6)}" x2="${f1(dn.x + 6)}" y2="${f1(dn.y + 6)}"/><line x1="${f1(dn.x - 6)}" y1="${f1(dn.y + 6)}" x2="${f1(dn.x + 6)}" y2="${f1(dn.y - 6)}"/></g>`;

  // rótulos
  s += `<g class="rotulos"><text x="8" y="${CY - 100 - 8}">3′</text><text x="8" y="${CY + 100 + 22}">5′</text><text x="592" y="${CY - 22}" text-anchor="end">5′</text><text x="592" y="${CY + 36}" text-anchor="end">3′</text></g>`;
  s += `<g class="etq"><text x="440" y="${CY - 84}" text-anchor="middle">la horquilla avanza →</text>` +
       `<text x="40" y="70">Hebra líder</text><text x="40" y="${H - 14}">Hebra rezagada (fragmentos de Okazaki)</text></g>`;

  // casilleros
  orden.forEach((id, n) => {
    const p = posicionSlot(id);
    const enz = llenos.get(id);
    const falta = faltan.has(id);
    s += `<g class="slot ${enz ? 'lleno' : ''} ${sel === id ? 'sel' : ''} ${falta ? 'falta' : ''}" data-slot="${id}">` +
      `<line class="con" x1="${f1(p.ax)}" y1="${f1(p.ay)}" x2="${f1(p.x)}" y2="${f1(p.y)}"/><circle class="ancla" cx="${f1(p.ax)}" cy="${f1(p.ay)}" r="3.5"/>` +
      `<circle class="hit" cx="${f1(p.x)}" cy="${f1(p.y)}" r="30"/>`;
    if (enz) {
      const E = ENZ[enz], w = Math.max(54, E.corto.length * 11 + 18);
      s += `<rect class="pill" x="${f1(p.x - w / 2)}" y="${f1(p.y - 14)}" width="${w}" height="28" rx="14" fill="${E.color}"/><text class="pt" x="${f1(p.x)}" y="${f1(p.y + 6)}" text-anchor="middle">${esc(E.corto)}</text>`;
    } else if (falta) {
      s += `<circle class="vac" cx="${f1(p.x)}" cy="${f1(p.y)}" r="19"/><text class="num" x="${f1(p.x)}" y="${f1(p.y + 7)}" text-anchor="middle">✖</text>`;
    } else {
      s += `<circle class="vac" cx="${f1(p.x)}" cy="${f1(p.y)}" r="19"/>` + (conNumeros ? `<text class="num" x="${f1(p.x)}" y="${f1(p.y + 7)}" text-anchor="middle">${n + 1}</text>` : '');
    }
    s += '</g>';
  });
  return s + '</svg>';
}

// ==========================================================
// Zoom molecular (enlaces)
// ==========================================================

const BASES_SUP = ['A', 'G', 'T', 'C', 'A'];
const COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
const COLOR_BASE = { A: '#FF8A5C', T: '#FFB938', G: '#5CC8FF', C: '#4FE0A0' };

function molecular() {
  const xs = BASES_SUP.map((_, i) => 90 + i * 105);
  let s = `<svg viewBox="0 0 600 290" role="img" aria-label="Fragmento de ADN: bases, azúcares y fosfatos">`;
  const YT = 56, YB = 234;
  // esqueletos (fosfodiéster): sobre cada hebra, entre azúcares consecutivos
  for (const [y, rev] of [[YT, false], [YB, true]]) {
    for (let i = 0; i < xs.length - 1; i++) {
      const xa = xs[i] + 15, xb = xs[i + 1] - 15, xm = (xa + xb) / 2;
      s += `<g class="enl" data-enl="fosfodiester"><line class="hit" x1="${xa - 6}" y1="${y}" x2="${xb + 6}" y2="${y}"/>` +
        `<line class="fd" x1="${xa}" y1="${y}" x2="${xb}" y2="${y}"/><circle class="fos" cx="${xm}" cy="${y}" r="10"/><text class="ft" x="${xm}" y="${y + 4}" text-anchor="middle">P</text></g>`;
    }
    // prolongación a los extremos (cadena que sigue)
    s += `<line class="fd tenue" x1="22" y1="${y}" x2="${xs[0] - 15}" y2="${y}"/><line class="fd tenue" x1="${xs[xs.length - 1] + 15}" y1="${y}" x2="578" y2="${y}"/>`;
  }
  xs.forEach((x, i) => {
    const bT = BASES_SUP[i], bB = COMP[bT];
    const dobles = (bT === 'A' || bT === 'T') ? 2 : 3;
    // azúcares
    const pent = (cx, cy) => { const pts = []; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5; pts.push(`${f1(cx + 15 * Math.cos(a))},${f1(cy + 15 * Math.sin(a))}`); } return pts.join(' '); };
    s += `<polygon class="azu" points="${pent(x, YT)}"/><polygon class="azu" points="${pent(x, YB)}"/>`;
    // enlaces glucosídicos
    s += `<g class="enl" data-enl="glucosidico"><line class="hit" x1="${x}" y1="${YT + 13}" x2="${x}" y2="${YT + 40}"/><line class="gl" x1="${x}" y1="${YT + 15}" x2="${x}" y2="${YT + 38}"/></g>`;
    s += `<g class="enl" data-enl="glucosidico"><line class="hit" x1="${x}" y1="${YB - 13}" x2="${x}" y2="${YB - 40}"/><line class="gl" x1="${x}" y1="${YB - 15}" x2="${x}" y2="${YB - 38}"/></g>`;
    // bases
    s += `<rect class="base" x="${x - 19}" y="${YT + 38}" width="38" height="34" rx="8" fill="${COLOR_BASE[bT]}"/><text class="bl" x="${x}" y="${YT + 61}" text-anchor="middle">${bT}</text>`;
    s += `<rect class="base" x="${x - 19}" y="${YB - 72}" width="38" height="34" rx="8" fill="${COLOR_BASE[bB]}"/><text class="bl" x="${x}" y="${YB - 49}" text-anchor="middle">${bB}</text>`;
    // puentes de hidrógeno
    const y0 = YT + 76, y1 = YB - 76;
    let dash = '';
    const offs = dobles === 2 ? [-7, 7] : [-12, 0, 12];
    for (const o of offs) dash += `<line class="hb" x1="${x + o}" y1="${y0}" x2="${x + o}" y2="${y1}"/>`;
    s += `<g class="enl" data-enl="hidrogeno" data-par="${bT}${bB}" data-n="${dobles}"><rect class="hit" x="${x - 26}" y="${y0 - 2}" width="52" height="${y1 - y0 + 4}"/>${dash}</g>`;
  });
  s += `<g class="rotulos"><text x="4" y="${YT + 5}">5′</text><text x="596" y="${YT + 5}" text-anchor="end">3′</text><text x="4" y="${YB + 5}">3′</text><text x="596" y="${YB + 5}" text-anchor="end">5′</text></g>`;
  return s + '</svg>';
}

// ==========================================================
// Estilos
// ==========================================================

function inyectarEstilos() {
  if (document.getElementById('estilos-horquilla')) return;
  const st = document.createElement('style');
  st.id = 'estilos-horquilla';
  st.textContent = `
.pantalla.hq { max-width: 860px; }
.hq .chips { margin-bottom: .6rem; }
.hq-hud { display: flex; flex-wrap: wrap; gap: .4rem .9rem; align-items: center; color: var(--tenue); font-size: .95rem; margin: .2rem 0 .5rem; }
.hq-hud b { color: var(--crema); }
.hq-hud .r { color: var(--ambar); font-family: var(--pixel); }
.hq-preg { font-size: clamp(1.1rem, 4.2vw, 1.4rem); font-weight: 700; line-height: 1.3; margin: .3rem 0; }
.hq-lienzo { background: var(--panel); border: 2px solid var(--linea); border-radius: var(--radio); padding: .4rem; margin: .5rem 0; }
.hq-lienzo svg { display: block; width: 100%; height: auto; user-select: none; -webkit-tap-highlight-color: transparent; }
.hq-lienzo .mol { fill: none; stroke: #9B7BFF; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
.hq-lienzo .nue { fill: none; stroke: #FFB938; stroke-width: 7; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
.hq-lienzo .peldanos line { stroke: var(--linea); stroke-width: 2; pointer-events: none; }
.hq-lienzo .cebador { fill: #FF7AA8; stroke: var(--noche); stroke-width: 2; pointer-events: none; }
.hq-lienzo .cebador.pend { fill: none; stroke: #FF7AA8; stroke-dasharray: 3 3; }
.hq-lienzo .dano line { stroke: var(--mal); stroke-width: 3.5; stroke-linecap: round; pointer-events: none; }
.hq-lienzo .rotulos text { fill: var(--crema); font: 800 19px var(--fuente); pointer-events: none; }
.hq-lienzo .etq text { fill: var(--tenue); font: 600 17px var(--fuente); pointer-events: none; }
.hq-lienzo .slot { cursor: pointer; }
.hq-lienzo .slot .hit { fill: transparent; pointer-events: all; }
.hq-lienzo .slot .con { stroke: var(--tenue); stroke-width: 1.5; stroke-dasharray: 3 3; pointer-events: none; }
.hq-lienzo .slot .ancla { fill: var(--crema); pointer-events: none; }
.hq-lienzo .slot .vac { fill: var(--noche); stroke: var(--crema); stroke-width: 2.5; stroke-dasharray: 5 4; pointer-events: none; }
.hq-lienzo .slot .num { fill: var(--crema); font: 800 20px var(--fuente); pointer-events: none; }
.hq-lienzo .slot .pt { fill: #10091f; font: 800 18px var(--fuente); pointer-events: none; }
.hq-lienzo .slot .pill { stroke: var(--noche); stroke-width: 2; pointer-events: none; }
.hq-lienzo .slot.sel .vac { stroke: var(--ambar); stroke-width: 4; animation: hq-pulso 1s ease-in-out infinite; }
.hq-lienzo .slot.falta .vac { stroke: var(--mal); fill: rgba(255, 93, 122, .2); animation: hq-pulso 1s ease-in-out infinite; }
.hq-lienzo .slot.falta .num { fill: var(--mal); }
.hq-lienzo .slot.tiembla { animation: hq-tiembla .4s ease; }
@keyframes hq-pulso { 50% { filter: drop-shadow(0 0 7px #fff); } }
@keyframes hq-tiembla { 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
.hq-lienzo .enl { cursor: pointer; }
.hq-lienzo .enl .hit { stroke: transparent; stroke-width: 30; fill: transparent; pointer-events: all; }
.hq-lienzo .fd { stroke: var(--crema); stroke-width: 5; stroke-linecap: round; pointer-events: none; }
.hq-lienzo .fd.tenue { stroke: var(--linea); }
.hq-lienzo .fos { fill: #FF7AA8; stroke: var(--noche); stroke-width: 2; pointer-events: none; }
.hq-lienzo .ft { fill: #10091f; font: 800 12px var(--fuente); pointer-events: none; }
.hq-lienzo .azu { fill: #9B7BFF; stroke: var(--noche); stroke-width: 2; pointer-events: none; }
.hq-lienzo .gl { stroke: var(--ambar); stroke-width: 5; stroke-linecap: round; pointer-events: none; }
.hq-lienzo .base { stroke: var(--noche); stroke-width: 2; pointer-events: none; }
.hq-lienzo .bl { fill: #10091f; font: 800 20px var(--fuente); pointer-events: none; }
.hq-lienzo .hb { stroke: #5CC8FF; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 5 5; pointer-events: none; }
.hq-lienzo .enl.ok .fd, .hq-lienzo .enl.ok .gl, .hq-lienzo .enl.ok .hb { stroke: var(--ok); }
.hq-lienzo .enl.mal .fd, .hq-lienzo .enl.mal .gl, .hq-lienzo .enl.mal .hb { stroke: var(--mal); }
.hq-lienzo .enl.ok, .hq-lienzo .enl.mal { filter: drop-shadow(0 0 5px currentColor); }
.hq-lienzo .enl.sel .fd, .hq-lienzo .enl.sel .gl, .hq-lienzo .enl.sel .hb { stroke: #fff; }
.hq-bandeja { position: sticky; bottom: 0; z-index: 5; margin: .8rem -1rem 0; padding: .6rem 1rem calc(.7rem + env(safe-area-inset-bottom)); background: rgba(23, 15, 46, .96); backdrop-filter: blur(8px); border-top: 2px solid var(--linea); }
.hq-info { min-height: 3rem; max-height: 7.5rem; overflow: auto; font-size: .92rem; line-height: 1.35; color: var(--tenue); margin-bottom: .5rem; }
.hq-info b { color: var(--crema); }
.hq-banco { display: flex; gap: .5rem; overflow-x: auto; padding-bottom: .3rem; }
.hq-chip { flex: 0 0 auto; padding: .5rem .8rem; border-radius: 99px; background: var(--panel); border: 2px solid var(--linea); border-left-width: 8px; font-weight: 700; font-size: .92rem; white-space: nowrap; }
.hq-chip small { color: var(--tenue); font-weight: 600; margin-left: .35rem; font-size: .75rem; text-transform: uppercase; }
.hq-chip.sel { border-color: var(--ambar); background: rgba(255, 185, 56, .14); }
.hq-fb { margin: .6rem 0; }
.hq-fb .veredicto { font-weight: 800; font-size: 1.1rem; }
.hq-fb .veredicto.ok { color: var(--ok); }
.hq-fb .veredicto.mal { color: var(--mal); }
.hq-fb p + p { margin-top: .3rem; color: var(--tenue); }
.hq-acc { display: flex; flex-wrap: wrap; gap: .6rem; margin: .6rem 0; }
.hq-acc .btn { flex: 1 1 9rem; }
.hq-ops { display: grid; gap: .5rem; margin: .6rem 0; }
.hq-op { width: 100%; text-align: left; padding: .75rem .9rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 12px; line-height: 1.35; font-size: .97rem; }
.hq-op:hover:not([disabled]) { border-color: var(--violeta); }
.hq-op.ok { border-color: var(--ok); background: rgba(79, 224, 160, .15); }
.hq-op.mal { border-color: var(--mal); background: rgba(255, 93, 122, .13); }
.hq-card { padding: 1.1rem; background: var(--panel); border: 2px solid var(--linea); border-radius: var(--radio); margin: .6rem 0; }
.hq-card .texto { font-size: clamp(1.05rem, 4vw, 1.3rem); font-weight: 600; line-height: 1.4; }
.hq-card .pista { color: var(--tenue); font-size: .9rem; margin-bottom: .4rem; }
.hq-orden { display: grid; gap: .4rem; margin: .6rem 0; padding: 0; list-style: none; counter-reset: paso; }
.hq-orden li { display: flex; gap: .6rem; align-items: baseline; padding: .6rem .8rem; background: rgba(79, 224, 160, .12); border: 2px solid var(--ok); border-radius: 12px; line-height: 1.35; counter-increment: paso; }
.hq-orden li::before { content: counter(paso); font-family: var(--pixel); color: var(--ok); }
.hq-pasos { display: grid; gap: .5rem; margin: .6rem 0; }
.hq-paso { text-align: left; padding: .7rem .9rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 12px; line-height: 1.35; font-size: .96rem; }
.hq-paso:hover { border-color: var(--violeta); }
.hq-paso.tiembla { animation: hq-tiembla .4s ease; border-color: var(--mal); }
.hq-dom { display: inline-flex; gap: .4rem; margin-bottom: .6rem; }
@media (prefers-reduced-motion: reduce) { .hq-lienzo .slot.sel .vac, .hq-lienzo .slot.falta .vac { animation: none; } }
`;
  document.head.appendChild(st);
}

// ==========================================================
// Actividad
// ==========================================================

export function abrirHorquilla({ app, volver }) {
  inyectarEstilos();

  const MODOS = [
    ['armar', '🧰 Armar el equipo'],
    ['enlaces', '🔬 Enlaces'],
    ['falta', '🔧 ¿Y si falta…?'],
    ['orden', '⏱️ Orden'],
    ['quien', '🎯 ¿Quién es?'],
  ];
  let modo = 'armar';
  let dom = 'pro';
  let S = {};
  let ronda = null;

  const $ = (s) => app.querySelector(s);
  const zona = () => $('#hq-zona');
  const reg = () => (((estado.actividades ||= {}).horquilla ||= {}));

  function nuevaRonda() { ronda = { racha: 0, puntos: 0, aciertos: 0, total: 0, mejorRacha: 0 }; }
  function guardarMejor(m, pct) {
    const r = reg();
    r[m] ||= 0;
    const rec = pct > r[m];
    if (rec) r[m] = pct;
    try { guardar(); } catch (_) { /* sin almacenamiento */ }
    return rec;
  }
  function sumarPunto(limpio) {
    ronda.racha++;
    ronda.mejorRacha = Math.max(ronda.mejorRacha, ronda.racha);
    const g = (limpio ? 100 : 40) + Math.min(ronda.racha - 1, 5) * 10;
    ronda.puntos += g;
    Sonido.acierto(ronda.racha);
    if (HITOS.includes(ronda.racha)) setTimeout(() => { Sonido.hito(); lanzarConfeti(60); }, 250);
    return g;
  }
  function perderRacha() { Sonido.error(ronda.racha >= 3); ronda.racha = 0; }
  const hud = (extra = '') => `<div class="hq-hud">${extra}<span class="r">🔥 ${ronda.racha}</span><span><b>${ronda.puntos}</b> pts</span></div>`;
  const emojiPct = (p) => (p >= 90 ? ['🏆', '¡Excelente!'] : p >= 70 ? ['🎉', '¡Muy bien!'] : p >= 50 ? ['👍', 'Vas por buen camino'] : ['💪', 'A seguir practicando']);

  function selectorDominio() {
    return `<div class="chips hq-dom" role="group" aria-label="Organismo">
      <button class="chip ${dom === 'pro' ? 'activo' : ''}" data-dom="pro">Procariotas</button>
      <button class="chip ${dom === 'euca' ? 'activo' : ''}" data-dom="euca">Eucariotas</button></div>`;
  }
  function enlazarDominio() {
    zona().querySelectorAll('[data-dom]').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      dom = b.dataset.dom;
      nuevaRonda();
      iniciarModo();
    }));
  }

  function resultado({ emoji, titulo, cifras, nota, botones }) {
    zona().innerHTML = `
      <div class="resultado" style="padding:1rem 0">
        <div class="grande" aria-hidden="true">${emoji}</div>
        <h1>${titulo}</h1>
        <div class="cifras" style="margin-top:1rem">${cifras.map(([n, t]) => `<div class="cifra"><b>${n}</b><span>${t}</span></div>`).join('')}</div>
        <p class="sub" style="margin:0 auto 1.2rem">${nota}</p>
        <div class="botones">${botones.map(([id, t, cl]) => `<button class="btn ${cl}" id="${id}">${t}</button>`).join('')}</div>
      </div>`;
    window.scrollTo(0, 0);
  }
  function cerrarRonda(m, extraTotal) {
    const pct = Math.round((ronda.aciertos / (extraTotal || ronda.total)) * 100);
    const rec = guardarMejor(m, pct);
    const [emoji, titulo] = emojiPct(pct);
    resultado({
      emoji, titulo,
      cifras: [[ronda.puntos, 'Puntos'], [`${pct}%`, `${ronda.aciertos} de ${extraTotal || ronda.total} sin error`], [ronda.mejorRacha, 'Mejor racha']],
      nota: rec ? '¡Nuevo récord en este modo!' : `Tu mejor resultado: ${reg()[m]}%`,
      botones: [['hq-otra', 'Otra ronda', 'primario'], ['hq-armar', 'Armar el equipo', 'secundario']],
    });
    $('#hq-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); iniciarModo(); });
    $('#hq-armar').addEventListener('click', () => { Sonido.clic(); cambiarModo('armar'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  function pintar() {
    app.innerHTML = `
      <main class="pantalla hq">
        <button class="btn enlace" id="hq-volver">← Volver</button>
        <h1 class="titulo-seccion">🧪 Taller de la horquilla</h1>
        <div class="chips" id="hq-modos" role="group" aria-label="Modo">
          ${MODOS.map(([m, t]) => `<button class="chip ${m === modo ? 'activo' : ''}" data-modo="${m}">${t}</button>`).join('')}
        </div>
        <div id="hq-zona"></div>
      </main>`;
    $('#hq-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
    app.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => { Sonido.clic(); cambiarModo(b.dataset.modo); }));
    window.scrollTo(0, 0);
  }
  function cambiarModo(m) {
    modo = m;
    app.querySelectorAll('[data-modo]').forEach((b) => b.classList.toggle('activo', b.dataset.modo === m));
    nuevaRonda();
    iniciarModo();
    window.scrollTo(0, 0);
  }
  function iniciarModo() {
    S = {};
    ({ armar: vArmar, enlaces: vEnlaces, falta: vFalta, orden: vOrden, quien: vQuien })[modo]();
  }

  // ======================================================
  // Modo 1: Armar el equipo
  // ======================================================
  function vArmar() {
    const slots = ORDEN_SLOTS[dom];
    S.llenos = new Map();
    S.sel = { chip: null, slot: null };
    S.erroneos = new Set();     // casilleros donde ya hubo un error
    // banco: un chip por casillero (con la enzima que corresponde) + señuelos del otro dominio
    const banco = [];
    slots.forEach((id) => aceptaDe(id, dom).forEach((e) => banco.push({ k: `${id}`, enz: e })));
    const otro = dom === 'pro' ? 'euca' : 'pro';
    Object.keys(ENZ).filter((k) => ENZ[k].dom === otro && ENZ[k].pol).forEach((e) => banco.push({ k: `x-${e}`, enz: e, senuelo: true }));
    S.banco = mezclar(banco).map((c, i) => ({ ...c, i }));
    ronda.total = slots.length;
    dibujarArmar();
  }

  function infoArmar() {
    const { chip, slot } = S.sel;
    if (chip != null && slot) return '';
    if (slot) return `<b>Casillero ${ORDEN_SLOTS[dom].indexOf(slot) + 1}:</b> ${esc(SLOTS[slot].problema)}<br>Ahora elegí la enzima del banco.`;
    if (chip != null) return `<b>${esc(ENZ[S.banco.find((c) => c.i === chip).enz].nombre)}</b> elegida. Tocá el casillero donde va (cada uno describe un problema).`;
    return 'Tocá un casillero para ver el problema que hay que resolver, y elegí del banco la enzima que lo resuelve. Ojo: hay enzimas de más (de otro organismo).';
  }

  function dibujarArmar(msg = '') {
    const quedan = ORDEN_SLOTS[dom].length - S.llenos.size;
    zona().innerHTML = `
      ${selectorDominio()}
      ${hud(`<span>Faltan <b>${quedan}</b> casilleros</span>`)}
      <div class="hq-lienzo">${escena(dom, S.llenos, S.sel.slot)}</div>
      <div class="hq-bandeja">
        <div class="hq-info" id="hq-info">${msg || infoArmar()}</div>
        <div class="hq-banco" id="hq-banco">${S.banco.map((c) => {
          const E = ENZ[c.enz];
          return `<button class="hq-chip ${S.sel.chip === c.i ? 'sel' : ''}" data-i="${c.i}" style="border-left-color:${E.color}">${esc(E.nombre.replace('ADN polimerasa', 'Pol').replace('Proteínas ', ''))}</button>`;
        }).join('')}</div>
      </div>`;
    enlazarDominio();
    zona().querySelectorAll('.hq-chip').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      const i = Number(b.dataset.i);
      S.sel.chip = S.sel.chip === i ? null : i;
      if (S.sel.chip != null && S.sel.slot) return intentarColocar();
      redibujarArmar();
    }));
    zona().querySelectorAll('.slot').forEach((g) => g.addEventListener('click', () => {
      const id = g.dataset.slot;
      if (S.llenos.has(id)) { redibujarArmar(`<b>${esc(ENZ[S.llenos.get(id)].nombre)}</b> ${esc(ENZ[S.llenos.get(id)].funcion)}<br>${esc(ENZ[S.llenos.get(id)].enlace)}`); return; }
      Sonido.clic();
      S.sel.slot = S.sel.slot === id ? null : id;
      if (S.sel.slot && S.sel.chip != null) return intentarColocar();
      redibujarArmar();
    }));
  }
  function redibujarArmar(msg = '') {
    const sc = zona().querySelector('#hq-banco')?.scrollLeft || 0;
    const y = window.scrollY;
    dibujarArmar(msg);
    const b = zona().querySelector('#hq-banco');
    if (b) b.scrollLeft = sc;
    window.scrollTo(0, y);
  }

  function intentarColocar() {
    const slot = S.sel.slot;
    const chip = S.banco.find((c) => c.i === S.sel.chip);
    const E = ENZ[chip.enz];
    const ok = aceptaDe(slot, dom).includes(chip.enz);
    if (ok) {
      S.llenos.set(slot, chip.enz);
      S.banco = S.banco.filter((c) => c.i !== chip.i);
      if (!S.erroneos.has(slot)) ronda.aciertos++;
      sumarPunto(!S.erroneos.has(slot));
      S.sel = { chip: null, slot: null };
      if (S.llenos.size === ORDEN_SLOTS[dom].length) return finArmar();
      redibujarArmar(`<span style="color:var(--ok);font-weight:800">¡Correcto!</span> <b>${esc(E.nombre)}</b> ${esc(E.funcion)} ${esc(E.enlace)}`);
    } else {
      S.erroneos.add(slot);
      perderRacha();
      let razon;
      if (E.dom !== 'ambos' && E.dom !== dom) razon = `${E.nombre} es de ${DOM_NOMBRE[E.dom]}; acá estás armando la horquilla de ${DOM_NOMBRE[dom]}.`;
      else razon = `${E.nombre} ${E.funcion} Acá hace falta otra cosa: ${SLOTS[slot].problema}`;
      S.sel = { chip: null, slot };
      const y = window.scrollY;
      dibujarArmar(`<span style="color:var(--mal);font-weight:800">No es esa.</span> ${esc(razon)}`);
      window.scrollTo(0, y);
      const g = zona().querySelector(`.slot[data-slot="${slot}"]`);
      g?.classList.add('tiembla');
      setTimeout(() => g?.classList.remove('tiembla'), 450);
    }
  }
  function finArmar() { cerrarRonda('armar_' + dom); }

  // ======================================================
  // Modo 2: Enlaces (zoom molecular)
  // ======================================================
  function vEnlaces() {
    S.cola = mezclar(PREG_ENL).slice(0, POR_RONDA);
    S.i = 0;
    ronda.total = S.cola.length;
    preguntaEnlace();
  }
  function preguntaEnlace() {
    if (S.i >= S.cola.length) return cerrarRonda('enlaces');
    S.resp = false;
    const q = S.cola[S.i];
    zona().innerHTML = `
      ${hud(`<span>Pregunta <b>${S.i + 1}</b> de ${S.cola.length}</span>`)}
      <p class="hq-preg">${esc(q.t)}</p>
      <div class="hq-lienzo">${molecular()}</div>
      <p class="hq-info" style="min-height:0">Referencias: <b style="color:#5CC8FF">azul punteado</b> = puentes de hidrógeno · <b style="color:var(--crema)">línea clara con P</b> = esqueleto (fosfato) · <b style="color:var(--ambar)">ámbar</b> = unión azúcar–base.</p>
      <div class="hq-fb" id="hq-fb" aria-live="polite"></div><div id="hq-sig"></div>`;
    zona().querySelectorAll('.enl').forEach((g) => g.addEventListener('click', () => tocarEnlace(g)));
  }
  function tocarEnlace(g) {
    const tipo = g.dataset.enl;
    if (S.resp) {
      zona().querySelectorAll('.enl.sel').forEach((e) => e.classList.remove('sel'));
      g.classList.add('sel');
      let t = INFO_ENL[tipo];
      if (tipo === 'hidrogeno') t = `Par ${g.dataset.par[0]}–${g.dataset.par[1]}: ${g.dataset.n} puentes de hidrógeno. ` + t;
      $('#hq-fb').insertAdjacentHTML('beforeend', '');
      $('#hq-info-extra')?.remove();
      $('#hq-fb').insertAdjacentHTML('beforeend', `<p id="hq-info-extra">${esc(t)}</p>`);
      return;
    }
    S.resp = true;
    const q = S.cola[S.i];
    const ok = tipo === q.r;
    zona().querySelectorAll('.enl').forEach((e) => { if (e.dataset.enl === q.r) e.classList.add('ok'); });
    if (!ok) g.classList.add('mal');
    let v;
    if (ok) { ronda.aciertos++; v = `<p class="veredicto ok">¡Correcto! +${sumarPunto(true)}</p>`; }
    else { perderRacha(); v = `<p class="veredicto mal">Incorrecto: era ${esc(NOMBRE_ENL[q.r])}. Lo que tocaste es ${esc(NOMBRE_ENL[tipo])}.</p>`; }
    $('#hq-fb').innerHTML = `${v}<p>${esc(q.e)}</p><p>Podés tocar cualquier enlace para ver qué es.</p>`;
    $('#hq-sig').innerHTML = `<div class="hq-acc"><button class="btn primario" id="hq-next">${S.i + 1 >= S.cola.length ? 'Ver resultado' : 'Siguiente'}</button></div>`;
    $('#hq-next').addEventListener('click', () => { Sonido.clic(); S.i++; preguntaEnlace(); });
    $('#hq-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // ======================================================
  // Modo 3: ¿Y si falta…?
  // ======================================================
  function escenarios() {
    const slots = ORDEN_SLOTS[dom];
    const lista = [];
    const vistas = new Set();
    slots.forEach((id) => aceptaDe(id, dom).forEach((e) => {
      if (vistas.has(e)) return;
      vistas.add(e);
      lista.push({ enz: e, slots: slots.filter((s) => aceptaDe(s, dom).includes(e)), texto: ENZ[e].falta, nombre: ENZ[e].nombre });
    }));
    // corrección de pruebas (exonucleasa 3′→5′) de las polimerasas principales
    lista.push({
      enz: 'prueba', slots: slots.filter((s) => s === 'lid' || s === 'rez'),
      texto: 'Los nucleótidos mal apareados no se retiran: aumentan los errores (mutaciones) en el ADN nuevo.',
      nombre: dom === 'pro' ? 'la actividad de corrección de pruebas (exonucleasa 3′→5′) de la ADN polimerasa III' : 'la actividad de corrección de pruebas de las polimerasas ε y δ',
    });
    return lista;
  }
  function vFalta() {
    S.esc = mezclar(escenarios()).slice(0, POR_RONDA);
    S.i = 0;
    ronda.total = S.esc.length;
    preguntaFalta();
  }
  function preguntaFalta() {
    if (S.i >= S.esc.length) return cerrarRonda('falta_' + dom);
    S.resp = false;
    const sc = S.esc[S.i];
    // escena completa salvo los casilleros de la enzima que falta
    const llenos = new Map();
    ORDEN_SLOTS[dom].forEach((id) => { if (!sc.slots.includes(id)) llenos.set(id, aceptaDe(id, dom)[0]); });
    const otras = mezclar(S.esc.concat(escenarios()).filter((x) => x.enz !== sc.enz && x.texto !== sc.texto));
    const distintas = [];
    for (const o of otras) if (!distintas.some((d) => d.texto === o.texto) && distintas.length < 3) distintas.push(o);
    const ops = mezclar([sc, ...distintas]);
    zona().innerHTML = `
      ${selectorDominio()}
      ${hud(`<span>Pregunta <b>${S.i + 1}</b> de ${S.esc.length}</span>`)}
      <p class="hq-preg">¿Qué pasaría si faltara ${esc(sc.enz === 'prueba' ? sc.nombre : ENZ[sc.enz].nombre)}?</p>
      <div class="hq-lienzo">${escena(dom, llenos, null, new Set(sc.slots), false)}</div>
      <div class="hq-ops" id="hq-ops">${ops.map((o, k) => `<button class="hq-op" data-k="${k}">${esc(o.texto)}</button>`).join('')}</div>
      <div class="hq-fb" id="hq-fb" aria-live="polite"></div><div id="hq-sig"></div>`;
    enlazarDominio();
    zona().querySelectorAll('.hq-op').forEach((b) => b.addEventListener('click', () => {
      if (S.resp) return;
      S.resp = true;
      const elegida = ops[Number(b.dataset.k)];
      const ok = elegida.texto === sc.texto;
      zona().querySelectorAll('.hq-op').forEach((x, k) => { x.disabled = true; if (ops[k].texto === sc.texto) x.classList.add('ok'); });
      let v;
      if (ok) { ronda.aciertos++; v = `<p class="veredicto ok">¡Correcto! +${sumarPunto(true)}</p>`; }
      else { b.classList.add('mal'); perderRacha(); v = `<p class="veredicto mal">Incorrecto</p>`; }
      const por = elegida.texto !== sc.texto ? `<p>Lo que elegiste le pasaría a: ${esc(elegida.enz === 'prueba' ? elegida.nombre : ENZ[elegida.enz].nombre)}.</p>` : '';
      $('#hq-fb').innerHTML = `${v}${por}`;
      $('#hq-sig').innerHTML = `<div class="hq-acc"><button class="btn primario" id="hq-next">${S.i + 1 >= S.esc.length ? 'Ver resultado' : 'Siguiente'}</button></div>`;
      $('#hq-next').addEventListener('click', () => { Sonido.clic(); S.i++; preguntaFalta(); });
      $('#hq-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  }

  // ======================================================
  // Modo 4: Orden de los pasos
  // ======================================================
  function vOrden() {
    const pasos = PASOS[dom].map((t, k) => ({ t, k }));
    S.pasos = mezclar(pasos);
    S.hecho = [];
    S.err = 0;
    ronda.total = pasos.length;
    dibujarOrden();
  }
  function dibujarOrden() {
    const falta = PASOS[dom].length - S.hecho.length;
    zona().innerHTML = `
      ${selectorDominio()}
      ${hud(`<span>Faltan <b>${falta}</b> pasos</span>`)}
      <p class="hq-preg">Ordená los pasos de la vida de un fragmento de Okazaki. Tocá siempre el que sigue.</p>
      <ol class="hq-orden">${S.hecho.map((p) => `<li>${esc(p.t)}</li>`).join('')}</ol>
      <div class="hq-pasos">${S.pasos.map((p) => `<button class="hq-paso" data-k="${p.k}">${esc(p.t)}</button>`).join('')}</div>`;
    enlazarDominio();
    zona().querySelectorAll('.hq-paso').forEach((b) => b.addEventListener('click', () => {
      const k = Number(b.dataset.k);
      if (k === S.hecho.length) {
        const p = S.pasos.find((x) => x.k === k);
        S.hecho.push(p);
        S.pasos = S.pasos.filter((x) => x.k !== k);
        if (!S.errPaso?.has(k)) ronda.aciertos++;
        sumarPunto(!S.errPaso?.has(k));
        if (!S.pasos.length) return cerrarRonda('orden_' + dom);
        const y = window.scrollY; dibujarOrden(); window.scrollTo(0, y);
      } else {
        (S.errPaso ||= new Set()).add(S.hecho.length);
        perderRacha();
        b.classList.add('tiembla');
        setTimeout(() => b.classList.remove('tiembla'), 450);
        zona().querySelector('.hq-hud .r').textContent = '🔥 0';
      }
    }));
  }

  // ======================================================
  // Modo 5: ¿Quién es?
  // ======================================================
  function vQuien() {
    S.cola = mezclar(Object.keys(ENZ)).slice(0, POR_RONDA);
    S.i = 0;
    ronda.total = S.cola.length;
    preguntaQuien();
  }
  function preguntaQuien() {
    if (S.i >= S.cola.length) return cerrarRonda('quien');
    S.resp = false;
    const id = S.cola[S.i];
    const E = ENZ[id];
    const resto = Object.keys(ENZ).filter((k) => k !== id);
    const pols = mezclar(resto.filter((k) => ENZ[k].pol === E.pol));
    const otras = mezclar(resto.filter((k) => ENZ[k].pol !== E.pol));
    const dist = E.pol ? [...pols.slice(0, 2), otras[0]] : [...otras.slice(0, 2), pols[0]];
    const ops = mezclar([id, ...dist]);
    zona().innerHTML = `
      ${hud(`<span>Pregunta <b>${S.i + 1}</b> de ${S.cola.length}</span>`)}
      <div class="hq-card"><p class="pista">¿Qué enzima o proteína es?</p><p class="texto">${esc(E.perfil)}</p></div>
      <div class="hq-ops" id="hq-ops">${ops.map((o) => `<button class="hq-op" data-id="${o}">${esc(ENZ[o].nombre)}${ENZ[o].dom !== 'ambos' ? ` <small style="color:var(--tenue)">(${DOM_NOMBRE[ENZ[o].dom]})</small>` : ''}</button>`).join('')}</div>
      <div class="hq-fb" id="hq-fb" aria-live="polite"></div><div id="hq-sig"></div>`;
    zona().querySelectorAll('.hq-op').forEach((b) => b.addEventListener('click', () => {
      if (S.resp) return;
      S.resp = true;
      const ok = b.dataset.id === id;
      zona().querySelectorAll('.hq-op').forEach((x) => { x.disabled = true; if (x.dataset.id === id) x.classList.add('ok'); });
      let v;
      if (ok) { ronda.aciertos++; v = `<p class="veredicto ok">¡Correcto! +${sumarPunto(true)}</p>`; }
      else { b.classList.add('mal'); perderRacha(); v = `<p class="veredicto mal">Incorrecto: era ${esc(E.nombre)}</p>`; }
      $('#hq-fb').innerHTML = `${v}<p><b>${esc(E.nombre)}</b> ${esc(E.funcion)}</p><p>${esc(E.enlace)}</p>`;
      $('#hq-sig').innerHTML = `<div class="hq-acc"><button class="btn primario" id="hq-next">${S.i + 1 >= S.cola.length ? 'Ver resultado' : 'Siguiente'}</button></div>`;
      $('#hq-next').addEventListener('click', () => { Sonido.clic(); S.i++; preguntaQuien(); });
      $('#hq-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  }

  // ---------- arranque ----------
  nuevaRonda();
  pintar();
  iniciarModo();
}
