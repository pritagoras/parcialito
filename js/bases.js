// ==========================================================
// bases.js: actividad "Laboratorio de bases" (complementariedad).
// Se activa con  "actividad": [..., "bases"]  en el JSON de un tema.
// No necesita datos extra: todo el contenido está en este archivo
// (las preguntas de telómeros y de ADN vs ARN están en la sección DATOS).
//
// Modos:
//   Complementar   armás la hebra nueva base por base (antiparalelo, ADN/ARN)
//   Flujo          sin fin: te van saliendo bases del molde y ponés la que sigue
//   Codones        codón ↔ anticodón, aminoácido, inicio/stop, marco de lectura
//   ADN vs ARN     diferencias entre los dos ácidos nucleicos
//   Telómeros      fin de la hebra rezagada, telomerasa, cáncer
// ==========================================================

import { estado, guardar } from './store.js?v=dev';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Laboratorio de bases';

// ==========================================================
// DATOS
// ==========================================================

// Procesos: qué molde se copia y qué hebra se obtiene
const PROC = {
  dup: {
    nombre: 'Duplicación', corto: 'Duplicación', tpl: 'ADN', prod: 'ADN',
    map: { A: 'T', T: 'A', G: 'C', C: 'G' },
    nota: 'La ADN polimerasa copia el ADN con dNTPs: A–T y G–C. La hebra nueva crece en sentido 5′→3′.',
  },
  trans: {
    nombre: 'Transcripción', corto: 'Transcripción', tpl: 'ADN', prod: 'ARN',
    map: { A: 'U', T: 'A', G: 'C', C: 'G' },
    nota: 'La ARN polimerasa copia un molde de ADN con NTPs: la A del molde se aparea con U (en el ARN no hay timina).',
  },
  tel: {
    nombre: 'Telomerasa (transcripción inversa)', corto: 'Telomerasa', tpl: 'ARN', prod: 'ADN',
    map: { A: 'T', U: 'A', G: 'C', C: 'G' },
    nota: 'La telomerasa es una transcriptasa inversa con su propio ARN molde (3′-AAUCCC-5′): agrega repeticiones 5′-TTAGGG-3′ al extremo 3′ del ADN.',
  },
  anti: {
    nombre: 'Codón–anticodón', corto: 'Anticodón', tpl: 'ARN', prod: 'ARN',
    map: { A: 'U', U: 'A', G: 'C', C: 'G' },
    nota: 'El anticodón del ARNt se aparea con el codón del ARNm de forma antiparalela: A–U y G–C.',
  },
};
const PROC_CHIPS = [['mix', 'Mixto'], ['dup', 'Duplicación'], ['trans', 'Transcripción'], ['anti', 'Anticodón'], ['libre', '⚙️ Elegir molde y producto']];

const COLOR = { A: '#FF8A5C', T: '#FFB938', U: '#D58BFF', G: '#5CC8FF', C: '#4FE0A0' };
const ABC = { ADN: ['A', 'C', 'G', 'T'], ARN: ['A', 'C', 'G', 'U'] };
const COMPR = { A: 'U', U: 'A', G: 'C', C: 'G' };      // ARN con ARN (codón–anticodón)

// Código genético estándar (orden de bases: U, C, A, G)
const ORD = ['U', 'C', 'A', 'G'];
const AAS = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
const AA = {
  F: 'Fenilalanina', L: 'Leucina', S: 'Serina', Y: 'Tirosina', C: 'Cisteína', W: 'Triptófano', P: 'Prolina', H: 'Histidina',
  Q: 'Glutamina', R: 'Arginina', I: 'Isoleucina', M: 'Metionina', T: 'Treonina', N: 'Asparagina', K: 'Lisina', V: 'Valina',
  A: 'Alanina', D: 'Aspartato', E: 'Glutamato', G: 'Glicina',
};
const AA3 = {
  F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg',
  I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp', E: 'Glu', G: 'Gly',
};
const CODON = {};
ORD.forEach((a, i) => ORD.forEach((b, j) => ORD.forEach((c, k) => { CODON[a + b + c] = AAS[i * 16 + j * 4 + k]; })));
const STOPS = ['UAA', 'UAG', 'UGA'];
const nombreAA = (cod) => (CODON[cod] === '*' ? 'Stop (no codifica aminoácido)' : `${AA[CODON[cod]]} (${AA3[CODON[cod]]})`);

// ADN vs ARN: r = 'ADN' | 'ARN' | 'Ambos'
const CARACT = [
  { t: 'Su azúcar es la desoxirribosa.', r: 'ADN', e: 'La desoxirribosa tiene H en el carbono 2′; el ARN tiene ribosa (con OH).' },
  { t: 'Su azúcar es la ribosa.', r: 'ARN', e: 'La ribosa tiene un OH en el carbono 2′. En el ADN ese carbono lleva solo H (desoxirribosa).' },
  { t: 'Tiene timina (T).', r: 'ADN', e: 'La timina es exclusiva del ADN; en el ARN la reemplaza el uracilo.' },
  { t: 'Tiene uracilo (U).', r: 'ARN', e: 'El uracilo es exclusivo del ARN y se aparea con la adenina.' },
  { t: 'Tiene adenina (A).', r: 'Ambos', e: 'A, G y C están en los dos; cambian T (ADN) y U (ARN).' },
  { t: 'Tiene guanina (G) y citosina (C).', r: 'Ambos', e: 'G y C están en ADN y en ARN; se unen entre sí con 3 puentes de hidrógeno.' },
  { t: 'En la célula suele estar como doble hebra.', r: 'ADN', e: 'El ADN es una doble hélice de hebras antiparalelas; el ARN suele ser de hebra simple.' },
  { t: 'En general es de hebra simple.', r: 'ARN', e: 'El ARN suele ser monocatenario (aunque puede plegarse sobre sí mismo).' },
  { t: 'Sus nucleótidos se unen por enlaces fosfodiéster.', r: 'Ambos', e: 'El esqueleto azúcar-fosfato de las dos moléculas se forma con enlaces fosfodiéster.' },
  { t: 'Se sintetiza en la duplicación.', r: 'ADN', e: 'En la duplicación se copia ADN a partir de un molde de ADN.' },
  { t: 'Se sintetiza en la transcripción.', r: 'ARN', e: 'La transcripción copia un segmento de ADN en una molécula de ARN.' },
  { t: 'Se polimeriza a partir de dNTPs.', r: 'ADN', e: 'dNTP = desoxirribonucleótidos trifosfato (sustrato de las ADN polimerasas).' },
  { t: 'Se polimeriza a partir de NTPs.', r: 'ARN', e: 'NTP = ribonucleótidos trifosfato (sustrato de las ARN polimerasas).' },
  { t: 'Se sintetiza siempre en sentido 5′→3′.', r: 'Ambos', e: 'Toda polimerasa agrega nucleótidos al extremo 3′-OH de la cadena en crecimiento.' },
  { t: 'Incluye al ARNm, el ARNt y el ARNr.', r: 'ARN', e: 'Son los tres tipos de ARN que participan en la traducción.' },
  { t: 'Guarda la información genética de forma estable en el núcleo.', r: 'ADN', e: 'El ADN es la molécula de reserva de la información genética; el ARN es más inestable.' },
  { t: 'Sus hebras se aparean de forma antiparalela.', r: 'Ambos', e: 'Cualquier apareamiento entre hebras de ácidos nucleicos es antiparalelo (ADN–ADN, ADN–ARN, ARN–ARN).' },
];

// Telómeros: ok = respuesta correcta; mal = 3 distractores
const TELOM = [
  { t: '¿Qué son los telómeros?', ok: 'Secuencias repetidas en los extremos de los cromosomas lineales.', mal: ['Los sitios donde empieza la duplicación.', 'Los genes que codifican la telomerasa.', 'El centro del cromosoma, donde se unen las cromátidas.'], e: 'Son ADN repetitivo en los extremos de los cromosomas lineales eucariotas.' },
  { t: '¿Cuál es la repetición del telómero humano?', ok: '5′-TTAGGG-3′', mal: ['5′-AATCCC-3′', '5′-UUAGGG-3′', '5′-GGGATT-3′'], e: 'La repetición TTAGGG se encuentra en tándem miles de veces.' },
  { t: '¿Por qué se acortan los extremos de los cromosomas en cada duplicación?', ok: 'Al sacar el último cebador de la hebra rezagada no hay 3′-OH para rellenar el hueco.', mal: ['Porque la ADN polimerasa no puede copiar la hebra líder hasta el final.', 'Porque la helicasa corta los extremos al abrir la hélice.', 'Porque la ligasa elimina los últimos nucleótidos.'], e: 'La ADN polimerasa necesita un extremo 3′-OH: en el último fragmento de Okazaki queda un tramo 5′ sin copiar.' },
  { t: '¿Qué hebra tiene el problema del extremo?', ok: 'La hebra rezagada.', mal: ['La hebra líder.', 'Las dos por igual.', 'Solo la hebra molde de ARN.'], e: 'La rezagada se sintetiza en fragmentos con cebadores; la líder se copia de corrido hasta el final del molde.' },
  { t: '¿Qué tipo de enzima es la telomerasa?', ok: 'Una transcriptasa inversa: una ADN polimerasa que usa un molde de ARN propio.', mal: ['Una ARN polimerasa que usa un molde de ADN.', 'Una helicasa que abre los telómeros.', 'Una ligasa que sella los extremos.'], e: 'Lleva incorporado el ARN molde y sintetiza ADN a partir de él.' },
  { t: 'La telomerasa tiene un ARN molde 3′-AAUCCC-5′. ¿Qué ADN agrega?', ok: '5′-TTAGGG-3′', mal: ['5′-UUAGGG-3′', '5′-GGGATT-3′', '5′-AATCCC-3′'], e: 'Complementaria y antiparalela: A→T, U→A, C→G; y es ADN, así que lleva T, no U.' },
  { t: '¿A qué extremo del ADN agrega repeticiones la telomerasa?', ok: 'Al extremo 3′ (saliente) de la hebra.', mal: ['Al extremo 5′ de la hebra.', 'Al medio del cromosoma.', 'A los dos extremos 5′ por igual.'], e: 'Toda polimerasa agrega nucleótidos en 3′-OH; así se alarga el molde y la rezagada puede completarse.' },
  { t: 'En las células somáticas sin telomerasa, ¿qué pasa con los telómeros?', ok: 'Se acortan en cada división; al ser muy cortos, la célula deja de dividirse.', mal: ['Se alargan en cada división.', 'No cambian, se copian completos.', 'Se duplican junto con el centrómero.'], e: 'Es un “contador” de divisiones: con telómeros críticos la célula entra en senescencia o muere.' },
  { t: '¿Qué se observa en muchas células cancerosas?', ok: 'Reactivan la telomerasa y pueden dividirse indefinidamente.', mal: ['Pierden por completo sus telómeros.', 'No tienen cebadores de ARN.', 'Tienen cromosomas circulares.'], e: 'Mantener los telómeros evita la senescencia y permite divisiones sin límite.' },
  { t: '¿Cuál es una función de los telómeros?', ok: 'Proteger los extremos de la degradación y de la fusión entre cromosomas.', mal: ['Iniciar la transcripción de los genes vecinos.', 'Unir las cromátidas hermanas.', 'Anclar el cromosoma al ribosoma.'], e: 'Evitan que el extremo se degrade o se confunda con una rotura de ADN.' },
  { t: '¿Por qué el cromosoma circular de una bacteria no tiene este problema?', ok: 'Porque no tiene extremos: no queda un cebador terminal sin reemplazar.', mal: ['Porque usa ARN como material genético.', 'Porque la hebra rezagada no existe en bacterias.', 'Porque tiene telomerasa de más.'], e: 'Sin extremos libres, los cebadores se reemplazan siempre con ADN que sigue.' },
];

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
const inv = (s) => s.split('').reverse().join('');
const compARN = (s) => s.split('').map((c) => COMPR[c]).join('');        // base por base
const revcARN = (s) => inv(compARN(s));                                  // complementaria y antiparalela
const fmt = (s, a = '5′', b = '3′') => `${a}-${s}-${b}`;
const puentes = (a, b) => (a === 'G' || a === 'C' || b === 'G' || b === 'C' ? 3 : 2);
const secAzar = (tipo, n) => Array.from({ length: n }, () => azar(ABC[tipo]));
const codonSentido = () => { let c; do { c = secAzar('ARN', 3).join(''); } while (CODON[c] === '*'); return c; };

// Genera hasta 3 distractores distintos de ok, a partir de candidatos; completa con variantes al azar
function distractores(ok, candidatos, variante) {
  const set = [];
  for (const c of candidatos) if (c !== ok && !set.includes(c)) set.push(c);
  let guard = 0;
  while (set.length < 3 && guard++ < 50) { const v = variante(); if (v !== ok && !set.includes(v)) set.push(v); }
  return mezclar(set).slice(0, 3);
}

// ==========================================================
// Estilos
// ==========================================================

function inyectarEstilos() {
  if (document.getElementById('estilos-bases')) return;
  const st = document.createElement('style');
  st.id = 'estilos-bases';
  st.textContent = `
.pantalla.ba { max-width: 860px; }
.ba .chips { margin-bottom: .6rem; }
.ba-hud { display: flex; flex-wrap: wrap; gap: .4rem .9rem; align-items: center; color: var(--tenue); font-size: .95rem; margin: .2rem 0 .5rem; }
.ba-hud b { color: var(--crema); }
.ba-hud .r { color: var(--ambar); font-family: var(--pixel); }
.ba-ctx { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin: .3rem 0 .4rem; font-weight: 700; }
.ba-tag { padding: .25rem .65rem; border-radius: 99px; background: var(--panel); border: 2px solid var(--linea); font-size: .88rem; }
.ba-tag.adn { border-color: #5CC8FF; } .ba-tag.arn { border-color: #FF7AA8; }
.ba-preg { font-size: clamp(1.1rem, 4.2vw, 1.4rem); font-weight: 700; line-height: 1.3; margin: .3rem 0; }
.ba-lienzo { background: var(--panel); border: 2px solid var(--linea); border-radius: var(--radio); padding: .6rem .5rem .5rem; margin: .5rem 0; }
.ba-cap { display: flex; justify-content: space-between; color: var(--tenue); font-size: .8rem; margin: .1rem .1rem .25rem; }
.ba-cap b { color: var(--crema); }
.ba-fila { display: grid; grid-template-columns: 1.7rem repeat(var(--n), minmax(0, 1fr)) 1.7rem; gap: 3px; align-items: center; }
.ba-ext { font-weight: 800; color: var(--crema); font-size: 1.05rem; text-align: center; }
.ba-b { aspect-ratio: 1 / 1; max-height: 3.1rem; display: grid; place-items: center; border-radius: 10px; font-weight: 800; font-size: clamp(.95rem, 4.6vw, 1.45rem); color: #10091f; border: 2px solid var(--noche); }
.ba-b.vacio { background: transparent; border: 2px dashed var(--linea); color: var(--tenue); }
.ba-b.cur { border: 3px solid var(--ambar); color: var(--ambar); animation: ba-pulso 1s ease-in-out infinite; background: rgba(255, 185, 56, .1); }
.ba-b.tiembla { animation: ba-tiembla .4s ease; border-color: var(--mal); }
.ba-b.sinvalor { opacity: .35; }
.ba-pu { height: 1.35rem; display: flex; justify-content: center; gap: 4px; align-items: stretch; padding: 2px 0; }
.ba-pu i { width: 0; border-left: 3px dashed #5CC8FF; }
.ba-flecha { text-align: center; color: var(--tenue); font-size: .82rem; margin: .35rem 0 0; }
.ba-flecha b { color: var(--ambar); }
@keyframes ba-pulso { 50% { filter: drop-shadow(0 0 6px var(--ambar)); } }
@keyframes ba-tiembla { 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(2px); } }
.ba-bandeja { position: sticky; bottom: 0; z-index: 5; margin: .8rem -1rem 0; padding: .6rem 1rem calc(.7rem + env(safe-area-inset-bottom)); background: rgba(23, 15, 46, .96); backdrop-filter: blur(8px); border-top: 2px solid var(--linea); }
.ba-info { min-height: 2.6rem; max-height: 7rem; overflow: auto; font-size: .92rem; line-height: 1.35; color: var(--tenue); margin-bottom: .5rem; }
.ba-info b { color: var(--crema); }
.ba-info .ok { color: var(--ok); font-weight: 800; }
.ba-info .mal { color: var(--mal); font-weight: 800; }
.ba-teclas { display: grid; grid-template-columns: repeat(5, 1fr); gap: .45rem; }
.ba-tecla { padding: .7rem 0; border-radius: 12px; font-weight: 800; font-size: 1.25rem; color: #10091f; border: 2px solid var(--noche); }
.ba-tecla:active { transform: scale(.94); }
.ba-fb { margin: .6rem 0; }
.ba-fb .veredicto { font-weight: 800; font-size: 1.1rem; }
.ba-fb .veredicto.ok { color: var(--ok); }
.ba-fb .veredicto.mal { color: var(--mal); }
.ba-fb p + p { margin-top: .3rem; color: var(--tenue); }
.ba-acc { display: flex; flex-wrap: wrap; gap: .6rem; margin: .6rem 0; }
.ba-acc .btn { flex: 1 1 9rem; }
.ba-ops { display: grid; gap: .5rem; margin: .6rem 0; }
.ba-ops.tres { grid-template-columns: repeat(3, 1fr); }
.ba-op { width: 100%; text-align: left; padding: .75rem .9rem; background: var(--panel); border: 2px solid var(--linea); border-radius: 12px; line-height: 1.35; font-size: .97rem; }
.ba-ops.tres .ba-op { text-align: center; font-weight: 800; font-size: 1.05rem; padding: .9rem .3rem; }
.ba-op.mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 1.1rem; letter-spacing: .02em; }
.ba-op:hover:not([disabled]) { border-color: var(--violeta); }
.ba-op.ok { border-color: var(--ok); background: rgba(79, 224, 160, .15); }
.ba-op.mal { border-color: var(--mal); background: rgba(255, 93, 122, .13); }
.ba-card { padding: 1.1rem; background: var(--panel); border: 2px solid var(--linea); border-radius: var(--radio); margin: .6rem 0; }
.ba-card .texto { font-size: clamp(1.05rem, 4vw, 1.3rem); font-weight: 600; line-height: 1.4; }
.ba-card .pista { color: var(--tenue); font-size: .9rem; margin-bottom: .4rem; }
.ba-card .seq { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 800; font-size: clamp(1.4rem, 7vw, 2rem); letter-spacing: .06em; margin: .2rem 0; }
.ba-card .seq small { font-size: .55em; color: var(--tenue); font-family: inherit; font-weight: 600; letter-spacing: 0; }
.ba details { margin: .6rem 0; background: var(--panel); border: 2px solid var(--linea); border-radius: 12px; padding: .5rem .8rem; }
.ba details summary { cursor: pointer; font-weight: 700; }
.ba-tabla { display: grid; grid-template-columns: auto repeat(4, 1fr); gap: 3px; margin-top: .6rem; font-size: .72rem; }
.ba-tabla div { padding: .25rem .2rem; border-radius: 6px; background: rgba(255, 255, 255, .04); text-align: center; line-height: 1.35; }
.ba-tabla .cab { background: transparent; font-weight: 800; color: var(--ambar); display: grid; place-items: center; }
.ba-tabla .stop { color: var(--mal); font-weight: 800; }
.ba-tabla .met { color: var(--ok); font-weight: 800; }
.ba-nota { color: var(--tenue); font-size: .85rem; margin: .3rem 0; }
@media (prefers-reduced-motion: reduce) { .ba-b.cur { animation: none; } }
`;
  document.head.appendChild(st);
}

// ==========================================================
// Actividad
// ==========================================================

export function abrirBases({ app, volver }) {
  inyectarEstilos();

  const MODOS = [
    ['comp', '🧬 Complementar'],
    ['flujo', '🎲 Flujo'],
    ['cod', '🔤 Codones'],
    ['adnarn', '⚗️ ADN vs ARN'],
  ];
  let modo = 'comp';
  let procSel = 'mix';
  let molde = 'ADN', producto = 'ARN';   // para el proceso libre
  let S = {};
  let ronda = null;

  const $ = (s) => app.querySelector(s);
  const zona = () => $('#ba-zona');
  const reg = () => (((estado.actividades ||= {}).bases ||= {}));

  function nuevaRonda() { ronda = { racha: 0, puntos: 0, aciertos: 0, total: 0, mejorRacha: 0 }; }
  function guardarMejor(m, valor) {
    const r = reg();
    r[m] ||= 0;
    const rec = valor > r[m];
    if (rec) r[m] = valor;
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
  const hud = (extra = '') => `<div class="ba-hud">${extra}<span class="r">🔥 ${ronda.racha}</span><span><b>${ronda.puntos}</b> pts</span></div>`;
  const emojiPct = (p) => (p >= 90 ? ['🏆', '¡Excelente!'] : p >= 70 ? ['🎉', '¡Muy bien!'] : p >= 50 ? ['👍', 'Vas por buen camino'] : ['💪', 'A seguir practicando']);

  function selectorProceso() {
    const libre = procSel === 'libre'
      ? `<div class="chips" role="group" aria-label="Molde">Molde: ${['ADN', 'ARN'].map((t) => `<button class="chip ${molde === t ? 'activo' : ''}" data-mol="${t}">${t}</button>`).join('')}
         &nbsp;Hebra nueva: ${['ADN', 'ARN'].map((t) => `<button class="chip ${producto === t ? 'activo' : ''}" data-prod="${t}">${t}</button>`).join('')}</div>` : '';
    return `<div class="chips" role="group" aria-label="Proceso">${PROC_CHIPS.map(([k, t]) => `<button class="chip ${procSel === k ? 'activo' : ''}" data-proc="${k}">${t}</button>`).join('')}</div>${libre}`;
  }
  function enlazarProceso() {
    zona().querySelectorAll('[data-mol],[data-prod]').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      if (b.dataset.mol) molde = b.dataset.mol; else producto = b.dataset.prod;
      nuevaRonda();
      iniciarModo();
    }));
    zona().querySelectorAll('[data-proc]').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      procSel = b.dataset.proc;
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
  function cerrarRonda(m) {
    const pct = ronda.total ? Math.round((ronda.aciertos / ronda.total) * 100) : 0;
    const rec = guardarMejor(m, pct);
    const [emoji, titulo] = emojiPct(pct);
    resultado({
      emoji, titulo,
      cifras: [[ronda.puntos, 'Puntos'], [`${pct}%`, `${ronda.aciertos} de ${ronda.total} sin error`], [ronda.mejorRacha, 'Mejor racha']],
      nota: rec ? '¡Nuevo récord en este modo!' : `Tu mejor resultado: ${reg()[m]}%`,
      botones: [['ba-otra', 'Otra ronda', 'primario'], ['ba-comp', 'Complementar', 'secundario']],
    });
    $('#ba-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); iniciarModo(); });
    $('#ba-comp').addEventListener('click', () => { Sonido.clic(); cambiarModo('comp'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70) lanzarConfeti(pct >= 90 ? 140 : 90);
  }

  function pintar() {
    app.innerHTML = `
      <main class="pantalla ba">
        <button class="btn enlace" id="ba-volver">← Volver</button>
        <h1 class="titulo-seccion">🧬 Laboratorio de bases</h1>
        <div class="chips" id="ba-modos" role="group" aria-label="Modo">
          ${MODOS.map(([m, t]) => `<button class="chip ${m === modo ? 'activo' : ''}" data-modo="${m}">${t}</button>`).join('')}
        </div>
        <div id="ba-zona"></div>
      </main>`;
    $('#ba-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
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
    S = { id: Math.random() };
    ({ comp: vComp, flujo: vFlujo, cod: vCod, adnarn: vAdnArn })[modo]();
  }

  // ======================================================
  // Hebras (render común a Complementar y Flujo)
  // ======================================================
  function nuevaHebra(largoFlujo) {
    const clave = procSel === 'mix' ? azar(['dup', 'trans', 'anti']) : procSel;
    let P = PROC[clave];
    if (clave === 'libre') {
      const map = { G: 'C', C: 'G' };
      map.A = producto === 'ARN' ? 'U' : 'T';
      map[molde === 'ARN' ? 'U' : 'T'] = 'A';
      const nombre = molde === producto ? `${molde} → ${producto} (molde y hebra nueva iguales)` : `${molde} → ${producto}`;
      P = { nombre, corto: 'Libre', tpl: molde, prod: producto, map,
        nota: `Molde de ${molde}, hebra nueva de ${producto}: la A del molde se aparea con ${map.A}, y la ${molde === 'ARN' ? 'U' : 'T'} con A; G con C.` };
    }
    let tpl, rev;
    if (clave === 'tel') { tpl = 'AAUCCC'.repeat(largoFlujo ? 2 : 1).split(''); rev = false; }
    else if (clave === 'anti') { tpl = (largoFlujo ? codonSentido() + codonSentido() + codonSentido() : codonSentido()).split(''); rev = true; }
    else { tpl = secAzar(P.tpl, largoFlujo ? 12 : 6); rev = Math.random() < 0.5; }
    const n = tpl.length;
    const orden = rev ? Array.from({ length: n }, (_, i) => n - 1 - i) : Array.from({ length: n }, (_, i) => i);
    return { clave, P, tpl, rev, n, orden, nueva: Array(n).fill(null), k: 0, err: new Set() };
  }

  // h: hebra; ventana opcional {s, e}. Devuelve HTML.
  function hebrasHTML(h, win) {
    const s = win ? win.s : 0, e = win ? win.e : h.n;
    const tplEnds = h.rev ? ['5′', '3′'] : ['3′', '5′'];
    const newEnds = [tplEnds[1], tplEnds[0]];
    const cur = h.orden[h.k];
    const izq = (ends) => (s === 0 ? ends[0] : '…');
    const der = (ends) => (e === h.n ? ends[1] : '…');
    let top = '', mid = '', bot = '';
    for (let c = s; c < e; c++) {
      const b = h.tpl[c];
      top += `<div class="ba-b" style="background:${COLOR[b]}">${b}</div>`;
      const nb = h.nueva[c];
      mid += `<div class="ba-pu">${nb ? '<i></i>'.repeat(puentes(b, nb)) : ''}</div>`;
      if (nb) bot += `<div class="ba-b" style="background:${COLOR[nb]}">${nb}</div>`;
      else if (c === cur && h.k < h.n) bot += `<div class="ba-b cur" data-cur="1">?</div>`;
      else bot += `<div class="ba-b vacio"></div>`;
    }
    const fila = (celdas, ends) => `<div class="ba-fila" style="--n:${e - s}"><span class="ba-ext">${izq(ends)}</span>${celdas}<span class="ba-ext">${der(ends)}</span></div>`;
    return `<div class="ba-cap"><span><b>Molde</b> · ${h.P.tpl}</span><span>${tplEnds[0]} → ${tplEnds[1]}</span></div>${fila(top, tplEnds)}
      ${fila(mid, ['', ''])}
      ${fila(bot, newEnds)}
      <div class="ba-cap" style="margin-top:.25rem"><span><b>Hebra nueva</b> · ${h.P.prod}</span><span>${newEnds[0]} → ${newEnds[1]}</span></div>
      <p class="ba-flecha">La síntesis va de <b>5′ a 3′</b> de la hebra nueva: ${h.rev ? '← hacia la izquierda' : 'hacia la derecha →'}</p>`;
  }

  function ctxHTML(h) {
    return `<div class="ba-ctx"><span class="ba-tag">${esc(h.P.nombre)}</span>
      <span class="ba-tag ${h.P.tpl === 'ADN' ? 'adn' : 'arn'}">Molde: ${h.P.tpl}</span><span>→</span>
      <span class="ba-tag ${h.P.prod === 'ADN' ? 'adn' : 'arn'}">Nueva: ${h.P.prod}</span></div>`;
  }
  const teclasHTML = () => `<div class="ba-teclas">${['A', 'T', 'U', 'G', 'C'].map((b) => `<button class="ba-tecla" data-b="${b}" style="background:${COLOR[b]}">${b}</button>`).join('')}</div>`;

  function explicarError(h, tplBase, pick, correcta) {
    const P = h.P;
    if (pick === tplBase) return `Tenés que poner la base <b>complementaria</b>, no la misma (${tplBase}).`;
    if (pick === 'T' && P.prod === 'ARN') return `La hebra nueva es <b>ARN</b>: no tiene timina, lleva uracilo (U). ${tplBase} se aparea con <b>${correcta}</b>.`;
    if (pick === 'U' && P.prod === 'ADN') return `La hebra nueva es <b>ADN</b>: no tiene uracilo, lleva timina (T). ${tplBase} se aparea con <b>${correcta}</b>.`;
    return `<b>${tplBase}</b> se aparea con <b>${correcta}</b> (${puentes(tplBase, correcta)} puentes de hidrógeno).`;
  }

  // ======================================================
  // Modo 1: Complementar
  // ======================================================
  const HEBRAS_POR_RONDA = 4;
  function vComp() {
    S.num = 0;
    S.h = null;
    siguienteHebraComp();
  }
  function siguienteHebraComp() {
    if (S.num >= HEBRAS_POR_RONDA) return cerrarRonda('complementar');
    S.num++;
    S.h = nuevaHebra(false);
    S.fase = 'bases';
    ronda.total += S.h.n + 1;
    S.msg = S.h.P.nota;
    dibujarComp();
  }
  function dibujarComp(msg) {
    const h = S.h;
    const y = window.scrollY;
    zona().innerHTML = `
      ${selectorProceso()}
      ${hud(`<span>Hebra <b>${S.num}</b> de ${HEBRAS_POR_RONDA}</span>`)}
      ${ctxHTML(h)}
      <div class="ba-lienzo">${hebrasHTML(h)}</div>
      <div class="ba-bandeja">
        <div class="ba-info" id="ba-info">${msg || S.msg}</div>
        ${teclasHTML()}
      </div>`;
    enlazarProceso();
    zona().querySelectorAll('.ba-tecla').forEach((b) => b.addEventListener('click', () => ponerBase(b.dataset.b)));
    window.scrollTo(0, y);
  }
  function ponerBase(b) {
    const h = S.h;
    const idx = h.orden[h.k];
    const tb = h.tpl[idx];
    const ok = h.P.map[tb];
    if (b === ok) {
      h.nueva[idx] = b;
      if (!h.err.has(idx)) ronda.aciertos++;
      sumarPunto(!h.err.has(idx));
      h.k++;
      if (h.k >= h.n) return preguntaLectura();
      dibujarComp(`<span class="ok">¡Bien!</span> <b>${tb}</b> con <b>${b}</b>: ${puentes(tb, b)} puentes de hidrógeno.`);
    } else {
      h.err.add(idx);
      perderRacha();
      dibujarComp(`<span class="mal">No es esa.</span> ${explicarError(h, tb, b, ok)}`);
      const c = zona().querySelector('.ba-b.cur');
      c?.classList.add('tiembla');
      setTimeout(() => c?.classList.remove('tiembla'), 450);
      zona().querySelector('.ba-hud .r').textContent = '🔥 0';
    }
  }

  function preguntaLectura() {
    const h = S.h;
    S.fase = 'lectura';
    const dibujada = h.nueva.join('');                       // de izquierda a derecha, como está en pantalla
    const finIzq = h.rev ? '3′' : '5′', finDer = h.rev ? '5′' : '3′';
    const okTxt = fmt(dibujada, finIzq, finDer);
    const ops = [{ t: okTxt, ok: true }];
    const cambioTU = (s) => (h.P.prod === 'ARN' ? s.replace(/U/g, 'T') : s.replace(/T/g, 'U'));
    const cand = [
      fmt(dibujada, finDer, finIzq),                                         // mismos símbolos, extremos al revés
      fmt(inv(dibujada), finIzq, finDer),                                    // secuencia invertida
      fmt(cambioTU(dibujada), finIzq, finDer),                               // ácido nucleico equivocado
      fmt(h.tpl.join(''), finIzq, finDer),                                   // copia del molde
    ];
    const mal = distractores(okTxt, cand, () => {
      const a = dibujada.split('');
      const i = Math.floor(Math.random() * a.length);
      a[i] = azar(ABC[h.P.prod].filter((x) => x !== a[i]));
      return fmt(a.join(''), finIzq, finDer);
    });
    mal.forEach((t) => ops.push({ t, ok: false }));
    const lista = mezclar(ops);
    const dir = h.rev
      ? 'El molde está escrito 5′→3′ de izquierda a derecha, así que la hebra nueva (antiparalela) queda 3′→5′.'
      : 'El molde está escrito 3′→5′ de izquierda a derecha, así que la hebra nueva (antiparalela) queda 5′→3′.';
    const y = window.scrollY;
    zona().innerHTML = `
      ${selectorProceso()}
      ${hud(`<span>Hebra <b>${S.num}</b> de ${HEBRAS_POR_RONDA}</span>`)}
      ${ctxHTML(h)}
      <div class="ba-lienzo">${hebrasHTML(h)}</div>
      <p class="ba-preg">¿Cómo queda escrita la hebra nueva, de izquierda a derecha, con sus extremos?</p>
      <div class="ba-ops" id="ba-ops">${lista.map((o, k) => `<button class="ba-op mono" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
      <div class="ba-fb" id="ba-fb" aria-live="polite"></div><div id="ba-sig"></div>`;
    enlazarProceso();
    window.scrollTo(0, y);
    zona().querySelectorAll('.ba-op').forEach((b) => b.addEventListener('click', () => {
      if (S.fase !== 'lectura') return;
      S.fase = 'fin';
      const el = lista[Number(b.dataset.k)];
      zona().querySelectorAll('.ba-op').forEach((x, k) => { x.disabled = true; if (lista[k].ok) x.classList.add('ok'); });
      let v;
      if (el.ok) { ronda.aciertos++; v = `<p class="veredicto ok">¡Correcto! +${sumarPunto(true)}</p>`; }
      else { b.classList.add('mal'); perderRacha(); v = `<p class="veredicto mal">Incorrecto</p>`; }
      $('#ba-fb').innerHTML = `${v}<p>${esc(dir)}</p><p>Leída de 5′ a 3′, la hebra nueva es <b>${esc(fmt(inv(dibujada) === dibujada || !h.rev ? dibujada : inv(dibujada)))}</b>.</p>`;
      const ultima = S.num >= HEBRAS_POR_RONDA;
      $('#ba-sig').innerHTML = `<div class="ba-acc"><button class="btn primario" id="ba-next">${ultima ? 'Ver resultado' : 'Siguiente hebra'}</button></div>`;
      $('#ba-next').addEventListener('click', () => { Sonido.clic(); siguienteHebraComp(); });
      $('#ba-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  }

  // ======================================================
  // Modo 2: Flujo (sin fin)
  // ======================================================
  const VENTANA = 8;
  function vFlujo() {
    S.hebras = 0;
    S.resp = 0;
    S.h = nuevaHebra(true);
    S.msg = S.h.P.nota;
    dibujarFlujo();
  }
  function dibujarFlujo(msg) {
    const h = S.h;
    const idx = h.orden[Math.min(h.k, h.n - 1)];
    const W = Math.min(VENTANA, h.n);
    const s = Math.max(0, Math.min(idx - (h.rev ? W - 4 : 3), h.n - W));
    const y = window.scrollY;
    zona().innerHTML = `
      ${selectorProceso()}
      ${hud(`<span>Bases: <b>${S.resp}</b></span><span>Hebras: <b>${S.hebras}</b></span>`)}
      ${ctxHTML(h)}
      <div class="ba-lienzo">${hebrasHTML(h, { s, e: s + W })}</div>
      <div class="ba-bandeja">
        <div class="ba-info" id="ba-info">${msg || S.msg}</div>
        ${teclasHTML()}
        <div class="ba-acc" style="margin:.5rem 0 0"><button class="btn secundario" id="ba-fin">Terminar</button></div>
      </div>`;
    enlazarProceso();
    zona().querySelectorAll('.ba-tecla').forEach((b) => b.addEventListener('click', () => responderFlujo(b.dataset.b)));
    $('#ba-fin').addEventListener('click', () => { Sonido.clic(); terminarFlujo(); });
    window.scrollTo(0, y);
  }
  function responderFlujo(b) {
    const h = S.h;
    const idx = h.orden[h.k];
    const tb = h.tpl[idx];
    const ok = h.P.map[tb];
    if (b === ok) {
      h.nueva[idx] = b;
      S.resp++;
      ronda.total++;
      if (!h.err.has(idx)) ronda.aciertos++;
      sumarPunto(!h.err.has(idx));
      h.k++;
      if (h.k >= h.n) {
        S.hebras++;
        dibujarFlujo(`<span class="ok">¡Hebra completa!</span> Viene otro molde: fijate bien si es ADN o ARN y qué se está copiando.`);
        Sonido.hito();
        const id = S.id;
        setTimeout(() => {
          if (S.id !== id) return;
          S.h = nuevaHebra(true);
          S.msg = S.h.P.nota;
          dibujarFlujo(`<b>Nuevo molde:</b> ${esc(S.h.P.nombre)}. ${esc(S.h.P.nota)}`);
        }, 1100);
        return;
      }
      dibujarFlujo(`<span class="ok">¡Bien!</span> ${tb} con ${b}.`);
    } else {
      h.err.add(idx);
      perderRacha();
      dibujarFlujo(`<span class="mal">No es esa.</span> ${explicarError(h, tb, b, ok)}`);
      const c = zona().querySelector('.ba-b.cur');
      c?.classList.add('tiembla');
      setTimeout(() => c?.classList.remove('tiembla'), 450);
      zona().querySelector('.ba-hud .r').textContent = '🔥 0';
    }
  }
  function terminarFlujo() {
    const pct = ronda.total ? Math.round((ronda.aciertos / ronda.total) * 100) : 0;
    const rec = guardarMejor('flujo_racha', ronda.mejorRacha);
    const [emoji, titulo] = ronda.total ? emojiPct(pct) : ['🧬', 'Todavía no empezaste'];
    resultado({
      emoji, titulo,
      cifras: [[ronda.puntos, 'Puntos'], [`${pct}%`, `${ronda.aciertos} de ${ronda.total} sin error`], [ronda.mejorRacha, 'Mejor racha']],
      nota: rec && ronda.mejorRacha ? '¡Nueva mejor racha en Flujo!' : `Tu mejor racha en Flujo: ${reg().flujo_racha || 0}`,
      botones: [['ba-otra', 'Seguir jugando', 'primario'], ['ba-comp', 'Complementar', 'secundario']],
    });
    $('#ba-otra').addEventListener('click', () => { Sonido.clic(); nuevaRonda(); iniciarModo(); });
    $('#ba-comp').addEventListener('click', () => { Sonido.clic(); cambiarModo('comp'); });
    Sonido.fin(pct >= 70);
    if (pct >= 70 && ronda.total >= 10) lanzarConfeti(90);
  }

  // ======================================================
  // Corredor de preguntas de opciones (Codones, ADN vs ARN, Telómeros)
  // q: { pista, html, ops:[{t, ok}], e, fijo?, mono?, tres? }
  // ======================================================
  function correrCola(qs, clave) {
    S.qs = qs;
    S.i = 0;
    S.clave = clave;
    ronda.total = qs.length;
    mostrarQ();
  }
  function mostrarQ() {
    if (S.i >= S.qs.length) return cerrarRonda(S.clave);
    S.resp = false;
    const q = S.qs[S.i];
    const ops = q.fijo ? q.ops : mezclar(q.ops);
    const previa = q.antes || '';
    zona().innerHTML = `
      ${previa}
      ${hud(`<span>Pregunta <b>${S.i + 1}</b> de ${S.qs.length}</span>`)}
      <div class="ba-card"><p class="pista">${esc(q.pista)}</p>${q.html}</div>
      <div class="ba-ops ${q.tres ? 'tres' : ''}" id="ba-ops">${ops.map((o, k) => `<button class="ba-op ${q.mono ? 'mono' : ''}" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
      <div class="ba-fb" id="ba-fb" aria-live="polite"></div><div id="ba-sig"></div>`;
    zona().querySelectorAll('.ba-op').forEach((b) => b.addEventListener('click', () => {
      if (S.resp) return;
      S.resp = true;
      const el = ops[Number(b.dataset.k)];
      zona().querySelectorAll('.ba-op').forEach((x, k) => { x.disabled = true; if (ops[k].ok) x.classList.add('ok'); });
      let v;
      if (el.ok) { ronda.aciertos++; v = `<p class="veredicto ok">¡Correcto! +${sumarPunto(true)}</p>`; }
      else { b.classList.add('mal'); perderRacha(); v = `<p class="veredicto mal">Incorrecto</p>`; }
      $('#ba-fb').innerHTML = `${v}<p>${q.e}</p>`;
      $('#ba-sig').innerHTML = `<div class="ba-acc"><button class="btn primario" id="ba-next">${S.i + 1 >= S.qs.length ? 'Ver resultado' : 'Siguiente'}</button></div>`;
      $('#ba-next').addEventListener('click', () => { Sonido.clic(); S.i++; mostrarQ(); });
      $('#ba-next').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
  }

  // ======================================================
  // Modo 3: Codones
  // ======================================================
  const bigSeq = (txt, etiqueta, a = '5′', b = '3′') => `<p class="seq"><small>${a}-</small>${esc(txt)}<small>-${b}</small></p><p class="pista" style="margin:0">${esc(etiqueta)}</p>`;
  const mutarARN = (s) => { const a = s.split(''); const i = Math.floor(Math.random() * a.length); a[i] = azar(ABC.ARN.filter((x) => x !== a[i])); return a.join(''); };

  function qCodonAnticodon() {
    const cod = codonSentido();
    const ok = revcARN(cod);
    const mal = distractores(ok, [compARN(cod), inv(cod), ok.replace(/U/g, 'T'), cod], () => mutarARN(ok));
    return {
      pista: 'Escribí el anticodón del ARNt (de 5′ a 3′) que reconoce este codón.',
      html: bigSeq(cod, 'codón del ARNm'),
      mono: true,
      ops: [{ t: fmt(ok), ok: true }, ...mal.map((t) => ({ t: fmt(t), ok: false }))],
      e: `Codón y anticodón son antiparalelos: 5′-${cod}-3′ se aparea con 3′-${compARN(cod)}-5′. Escrito de 5′ a 3′ (y con U, porque es ARN) el anticodón es 5′-${ok}-3′.`,
    };
  }
  function qAnticodonCodon() {
    const ac = codonSentido();
    const ok = revcARN(ac);
    const mal = distractores(ok, [compARN(ac), inv(ac), ok.replace(/U/g, 'T'), ac], () => mutarARN(ok));
    return {
      pista: 'El ARNt tiene este anticodón. ¿Qué codón del ARNm reconoce? (de 5′ a 3′)',
      html: bigSeq(ac, 'anticodón del ARNt'),
      mono: true,
      ops: [{ t: fmt(ok), ok: true }, ...mal.map((t) => ({ t: fmt(t), ok: false }))],
      e: `El anticodón 5′-${ac}-3′ se aparea con 3′-${compARN(ac)}-5′; leído de 5′ a 3′, el codón es 5′-${ok}-3′.`,
    };
  }
  function qCodonAA() {
    let cod;
    if (Math.random() < 0.2) cod = azar(STOPS);
    else if (Math.random() < 0.15) cod = 'AUG';
    else cod = codonSentido();
    const ok = nombreAA(cod);
    const otras = mezclar(Object.keys(CODON).map((c) => nombreAA(c)).filter((t, i, a) => a.indexOf(t) === i && t !== ok));
    const mal = otras.slice(0, 3);
    let e = `${cod} codifica ${ok}.`;
    if (cod === 'AUG') e += ' Además es el codón de inicio.';
    if (STOPS.includes(cod)) e += ' Los codones de terminación (UAA, UAG, UGA) no tienen ARNt: los reconocen factores de liberación y termina la traducción.';
    return {
      pista: '¿Qué aminoácido codifica este codón?',
      html: bigSeq(cod, 'codón del ARNm'),
      ops: [{ t: ok, ok: true }, ...mal.map((t) => ({ t, ok: false }))],
      e,
    };
  }
  function qMolde() {
    const tpl = secAzar('ADN', 3).join('');
    const okS = tpl.split('').map((c) => ({ A: 'U', T: 'A', G: 'C', C: 'G' }[c])).join('');
    const mal = distractores(okS, [
      tpl.split('').map((c) => ({ A: 'T', T: 'A', G: 'C', C: 'G' }[c])).join(''),  // ADN en vez de ARN
      inv(okS),                                                                      // sin invertir
      tpl.replace(/T/g, 'U'),                                                        // copia del molde
      inv(tpl.replace(/T/g, 'U')),
    ], () => mutarARN(okS));
    return {
      pista: 'Se transcribe este molde de ADN. ¿Qué codón queda en el ARNm? (de 5′ a 3′)',
      html: bigSeq(tpl, 'hebra molde de ADN', '3′', '5′'),
      mono: true,
      ops: [{ t: fmt(okS), ok: true }, ...mal.map((t) => ({ t: fmt(t), ok: false }))],
      e: `El ARNm es complementario y antiparalelo al molde: 3′-${tpl}-5′ → 5′-${okS}-3′ (A del molde → U, T → A, G ↔ C).`,
    };
  }
  function qStop() {
    if (Math.random() < 0.5) {
      const ok = azar(STOPS);
      const mal = mezclar(Object.keys(CODON).filter((c) => !STOPS.includes(c))).slice(0, 3);
      return {
        pista: '¿Cuál de estos codones es de terminación (stop)?',
        html: '<p class="texto">Elegí el que <b>no</b> codifica ningún aminoácido.</p>',
        mono: true,
        ops: [{ t: fmt(ok), ok: true }, ...mal.map((c) => ({ t: fmt(c), ok: false }))],
        e: `Los tres codones de terminación son UAA, UAG y UGA. ${ok} no tiene ARNt: lo reconocen factores de liberación.`,
      };
    }
    return {
      pista: '¿Con qué codón empieza la traducción?',
      html: '<p class="texto">El ribosoma arranca en el codón de <b>inicio</b>.</p>',
      ops: [
        { t: 'AUG (metionina)', ok: true },
        { t: 'UAA (stop)', ok: false },
        { t: 'UGA (triptófano)', ok: false },
        { t: 'GUA (metionina)', ok: false },
      ],
      e: 'AUG es el codón de inicio y codifica metionina. UGA es stop (el triptófano es UGG).',
    };
  }
  function qCuenta() {
    const k = 2 + Math.floor(Math.random() * 3);
    const medio = Array.from({ length: k }, () => { let c; do { c = codonSentido(); } while (c === 'AUG'); return c; });
    const stop = azar(STOPS);
    const extra = codonSentido();
    const ms = ['AUG', ...medio, stop, extra];
    const ok = 1 + k;
    const opsN = [ok, ok + 1, ok - 1, ok + 2];
    return {
      pista: 'El ribosoma lee el ARNm de 5′ a 3′ desde el AUG hasta el primer codón de terminación.',
      html: `<p class="seq" style="font-size:clamp(1rem,5vw,1.4rem)"><small>5′-</small>${esc(ms.join(' '))}<small>-3′</small></p><p class="pista" style="margin:0">¿Cuántos aminoácidos tiene el péptido?</p>`,
      ops: opsN.map((n, i) => ({ t: `${n} aminoácidos`, ok: i === 0 })),
      e: `AUG + ${k} codones de sentido = ${ok} aminoácidos. El codón ${stop} termina la traducción (no suma aminoácido) y lo que viene después (${extra}) ya no se traduce.`,
    };
  }
  function tablaCodigo() {
    let h = '<div class="ba-tabla"><div class="cab"></div>' + ORD.map((b) => `<div class="cab">${b}</div>`).join('');
    ORD.forEach((a) => {
      h += `<div class="cab">${a}</div>`;
      ORD.forEach((b) => {
        h += '<div>' + ORD.map((c) => {
          const cod = a + b + c, aa = CODON[cod];
          const cl = aa === '*' ? 'stop' : cod === 'AUG' ? 'met' : '';
          return `<span class="${cl}">${cod} ${aa === '*' ? 'Stop' : AA3[aa]}</span>`;
        }).join('<br>') + '</div>';
      });
    });
    return h + '</div>';
  }
  function vCod() {
    const tipos = [qCodonAnticodon, qCodonAnticodon, qCodonAnticodon, qAnticodonCodon, qAnticodonCodon, qCodonAA, qCodonAA, qMolde, qStop, qCuenta];
    const qs = tipos.map((f) => f());
    const tabla = `<details><summary>📖 Ver tabla del código genético</summary>${tablaCodigo()}<p class="ba-nota">Columnas: 2.ª base (U, C, A, G). Filas: 1.ª base. Dentro de cada celda, 3.ª base U, C, A, G. <span style="color:var(--ok)">AUG</span> = inicio · <span style="color:var(--mal)">Stop</span> = terminación.</p></details>`;
    qs.forEach((q) => { q.antes = tabla; });
    correrCola(mezclar(qs), 'codones');
  }

  // ======================================================
  // Modo 4: ADN vs ARN
  // ======================================================
  function qSeqAcido() {
    const tipo = azar(['ADN', 'ARN', 'ninguno']);
    let s;
    do {
      s = Array.from({ length: 6 }, () => azar(tipo === 'ninguno' ? ['A', 'C', 'G'] : ABC[tipo]));
    } while (tipo === 'ADN' && !s.includes('T') || tipo === 'ARN' && !s.includes('U'));
    const r = tipo === 'ninguno' ? 'Ambos' : tipo;
    const e = tipo === 'ADN' ? 'Tiene timina (T): solo puede ser ADN.'
      : tipo === 'ARN' ? 'Tiene uracilo (U): solo puede ser ARN.'
        : 'No tiene ni T ni U: con A, G y C solas no se puede saber si es ADN o ARN.';
    return {
      pista: '¿Esta secuencia es de ADN, de ARN o podría ser de ambos?',
      html: `<p class="seq"><small>5′-</small>${esc(s.join(''))}<small>-3′</small></p>`,
      tres: true, fijo: true,
      ops: ['ADN', 'ARN', 'Ambos'].map((t) => ({ t, ok: t === r })),
      e,
    };
  }
  function vAdnArn() {
    const feats = mezclar(CARACT).slice(0, 7).map((c) => ({
      pista: '¿De qué ácido nucleico es esta característica?',
      html: `<p class="texto">${esc(c.t)}</p>`,
      tres: true, fijo: true,
      ops: ['ADN', 'ARN', 'Ambos'].map((t) => ({ t, ok: t === c.r })),
      e: esc(c.e),
    }));
    const qs = mezclar([...feats, qSeqAcido(), qSeqAcido(), qSeqAcido()]);
    correrCola(qs, 'adnarn');
  }

  // Los telómeros se estudian en su simulación propia dentro del laboratorio de duplicación.

  // ---------- arranque ----------
  nuevaRonda();
  pintar();
  iniciarModo();
}
