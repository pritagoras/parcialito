import { abrirOperones } from './operones.js?v=20261026-10';
import { abrirLabReplicacion } from './lab-replicacion.js?v=20261027-2';
import { abrirBases } from './bases.js?v=20261027-1';
import { abrirTranscripcion } from './transcripcion.js?v=20261027-8';
import { abrirCromosomas } from './cromosomas.js?v=20261027-1';
import { abrirComunicacion } from './comunicacion.js?v=20261027-3';
import { abrirTraduccion } from './traduccion.js?v=20261027-3';
import { abrirProteinaG } from './proteina-g.js?v=20261027-2';
import { abrirMitosis } from './mitosis.js?v=20261027-12';
import { abrirMeiosis } from './meiosis.js?v=20261027-6';


// Parcialito LAB · Factores de transcripción (basales y específicos)
// Tablero con cuatro secciones: Vista, Explicación, Comparador y Preguntas.
// PC: panel de capas a la izquierda + escena grande + tarjetas abajo.
// Celular: chips de capas, escena compacta con pines numerados, tarjetas plegables
// y navegación inferior fija.

const COLOR = { adn: '#3d8bff', esp: '#ff9a2e', basal: '#1fd6a5', pol: '#9b6dff', arnm: '#ff4f8b', prom: '#ffc23d' };

// Piezas del modelo. "capa" dice con qué interruptor se muestran; "pin" es el número en celular.
const PIEZAS = {
  adn: { capa: 'adn', nombre: 'ADN: doble hélice', tipo: 'Ácido nucleico', color: COLOR.adn, texto: 'El ADN está formado por nucleótidos. Cada uno contiene desoxirribosa, fosfato y una base nitrogenada (A, T, C o G). Las dos hebras son complementarias y antiparalelas: una corre 5′→3′ y la otra 3′→5′.', dato: 'Las bases forman pares: A–T y G–C.' },
  especifico: { capa: 'esp', pin: 1, nombre: 'Factor específico', tipo: 'Proteína reguladora', color: COLOR.esp, texto: 'Reconoce secuencias reguladoras concretas y puede actuar como activador o represor. Su efecto depende del contexto celular, de las otras proteínas presentes y de la organización de la cromatina.', dato: 'Los factores específicos no son bases nitrogenadas: son proteínas.' },
  enhancer: { capa: 'adn', pin: 2, nombre: 'Enhancer', tipo: 'Región reguladora de ADN', color: COLOR.prom, texto: 'Secuencia reguladora a la que se unen factores específicos. Puede encontrarse a cierta distancia del promotor y favorecer la transcripción mediante interacciones con el complejo regulador.', dato: 'Un enhancer es ADN, no una proteína.' },
  promotor: { capa: 'adn', pin: 3, nombre: 'Promotor', tipo: 'Región de ADN', color: COLOR.prom, texto: 'Es una región del ADN cercana al sitio donde comienza la transcripción. En genes eucariotas, algunos promotores contienen elementos como la caja TATA; no todos los promotores tienen la misma composición.', dato: 'El sitio +1 es el primer nucleótido transcrito.' },
  basal: { capa: 'basal', pin: 4, nombre: 'Factores basales', tipo: 'Proteínas / complejo de iniciación', color: COLOR.basal, texto: 'Los factores generales de transcripción ayudan a reconocer el promotor, reclutar y posicionar la ARN polimerasa II y formar el complejo de preiniciación. Entre ellos están TFIID (que incluye TBP), TFIIB, TFIIF, TFIIE y TFIIH.', dato: 'Son necesarios para la iniciación basal de la transcripción por ARN polimerasa II.' },
  polimerasa: { capa: 'pol', pin: 5, nombre: 'ARN polimerasa II', tipo: 'Complejo enzimático proteico', color: COLOR.pol, texto: 'En eucariotas, sintetiza pre-ARNm usando una hebra de ADN como molde. Lee el molde en sentido 3′→5′ y sintetiza ARN en sentido 5′→3′.', dato: 'No “convierte” bases en proteínas: produce una cadena de ARN.' },
  arn: { capa: 'arnm', pin: 6, nombre: 'ARNm naciente', tipo: 'Ácido nucleico', color: COLOR.arnm, texto: 'La cadena de ARN crece incorporando ribonucleótidos complementarios a la hebra molde. En ARN se usa uracilo (U) en lugar de timina (T).', dato: 'El ARN se sintetiza en dirección 5′→3′.' }
};

// Recorrido guiado (el paginador 1/5 y la pestaña Explicación usan lo mismo).
const PASOS = [
  { titulo: 'ADN y regiones reguladoras', piezas: ['adn', 'promotor', 'enhancer'], texto: 'La información está en el ADN. El promotor y otras secuencias reguladoras son tramos de ADN, no proteínas.', clave: 'El promotor y el enhancer son secuencias de ADN: no son proteínas.' },
  { titulo: 'Unión de factores específicos', piezas: ['especifico', 'enhancer'], texto: 'Activadores o represores reconocen secuencias reguladoras (enhancers o silenciadores) y modulan la probabilidad de iniciar la transcripción. Pueden actuar a distancia.', clave: 'Los factores específicos se unen a enhancers o silenciadores, aunque estén lejos del promotor, y aumentan o disminuyen la transcripción.' },
  { titulo: 'Ensamblaje basal', piezas: ['basal', 'promotor'], texto: 'Los factores generales (TFIID, TFIIB, TFIIF, TFIIE y TFIIH) organizan el complejo de preiniciación en el promotor y facilitan la participación de la polimerasa.', clave: 'Los factores basales se ensamblan en el promotor y forman el complejo de preiniciación.' },
  { titulo: 'Inicio de la transcripción', piezas: ['polimerasa'], texto: 'La ARN polimerasa II usa una hebra como molde y comienza a sintetizar ARN a partir del sitio de inicio (+1).', clave: 'La ARN polimerasa II llega al promotor con ayuda de los factores basales y arranca en el sitio +1.' },
  { titulo: 'El ARN crece', piezas: ['arn'], texto: 'La cadena nueva crece 5′→3′. La secuencia del ARN es complementaria al molde y coincide con la codificante salvo U en lugar de T.', clave: 'El ARN crece en sentido 5′→3′ y lleva U en lugar de T.' }
];
const CLAVE_GENERAL = 'los factores específicos pueden actuar a distancia (enhancers) y su interacción con el complejo basal facilita la formación del complejo de iniciación y el inicio de la transcripción.';

// Capa que se agrega en cada paso cuando se activa "Paso a paso".
const CAPA_DESDE_PASO = { adn: 1, esp: 2, basal: 3, pol: 4, arnm: 5 };

const CAPAS = [['adn', 'ADN', COLOR.adn], ['pol', 'ARN polimerasa II', COLOR.pol], ['basal', 'Factores basales', COLOR.basal], ['esp', 'Factores específicos', COLOR.esp], ['arnm', 'ARNm', COLOR.arnm]];
const CAPAS_INICIO = { adn: true, pol: true, basal: true, esp: true, arnm: true };

const TABS = [['vista', 'Vista 3D', '🧬'], ['explicacion', 'Explicación', '📖'], ['comparador', 'Comparador', '⚖️'], ['preguntas', 'Preguntas', '❓']];

// Preguntas de la pestaña Preguntas.
const PREGUNTAS = [
  { q: 'Los factores basales de transcripción son…', o: ['Proteínas', 'Secuencias de ADN', 'Moléculas de ARN', 'Bases nitrogenadas'], ok: 0, exp: 'Son proteínas (TFIID, TFIIB, TFIIF, TFIIE, TFIIH) que forman el complejo de preiniciación.' },
  { q: 'El promotor es…', o: ['Una proteína del complejo basal', 'Una región de ADN', 'Una enzima', 'Un tipo de ARN'], ok: 1, exp: 'El promotor es ADN: la secuencia donde se ensamblan los factores basales.' },
  { q: '¿Cuál de estas opciones NO es un factor basal?', o: ['TFIIB', 'TFIID', 'Un activador específico', 'TFIIH'], ok: 2, exp: 'Los activadores y represores son factores específicos; los basales son los TFII.' },
  { q: 'Un enhancer…', o: ['Es una proteína que activa genes', 'Es una secuencia de ADN que puede estar lejos del promotor', 'Sintetiza ARN mensajero', 'Es la hebra de ARN naciente'], ok: 1, exp: 'El enhancer es ADN regulador; las proteínas que se le unen son los factores específicos.' },
  { q: 'La ARN polimerasa II sintetiza ARN en sentido…', o: ['3′→5′', '5′→3′', 'En ambos sentidos', 'Depende de la base'], ok: 1, exp: 'Todo ácido nucleico se sintetiza 5′→3′. La polimerasa lee el molde 3′→5′.' },
  { q: 'Los factores específicos pueden…', o: ['Solo activar la transcripción', 'Solo reprimirla', 'Aumentar o disminuir la transcripción', 'Reemplazar a la ARN polimerasa'], ok: 2, exp: 'Pueden ser activadores o represores, según la proteína y el contexto celular.' },
  { q: 'TBP, la proteína que se une a la caja TATA, forma parte de…', o: ['TFIIH', 'TFIID', 'TFIIF', 'La ARN polimerasa II'], ok: 1, exp: 'TFIID incluye la proteína de unión a TATA (TBP).' },
  { q: 'En el ARN, la base que reemplaza a la timina es…', o: ['Adenina', 'Citosina', 'Uracilo', 'Guanina'], ok: 2, exp: 'El ARN usa uracilo (U) en lugar de timina (T).' },
  { q: 'El sitio +1 es…', o: ['El primer nucleótido que se transcribe', 'La caja TATA', 'Un factor basal', 'El final del gen'], ok: 0, exp: 'Es el sitio de inicio de la transcripción.' }
];

// ---------- Escena SVG ----------
// Dos composiciones: PC (réplica de la imagen de referencia, con rótulos) y celular (compacta, con pines numerados).
// La de PC está dibujada sobre un lienzo de 1040 × 510 unidades.
const DISEÑOS = {
  pc: { W: 1040, H: 510, y: 238, x0: 40, x1: 1000, amp: 36, per: 150, sw: 15, tilt: 1.5, sinBrillo: true, etq: true, pines: false, enh: 212, esp: { x: 208, y: 160, rx: 66, ry: 54, b: 5.6 }, bas: { x: 475, y: 176, rx: 80, ry: 70, b: 6.2 }, pol: { x: 638, y: 228, rx: 124, ry: 106, b: 7.4 }, pro: [398, 572], tss: 567, arn: [[572, 268], [606, 332], [690, 358], [836, 378]] },
  cel: { W: 720, H: 430, y: 235, x0: 30, x1: 692, amp: 25, per: 96, sw: 8, etq: false, pines: true, enh: 118, esp: { x: 120, y: 132, rx: 52, ry: 42 }, bas: { x: 335, y: 190, rx: 58, ry: 50 }, pol: { x: 470, y: 200, rx: 76, ry: 68 }, pro: [275, 400], tss: 400, arn: [[425, 262], [478, 322], [565, 348], [676, 336]] }
};

function azar(semilla) { let s = semilla; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

// Esfera "burbujeante": un cúmulo de círculos con degradado, para dar sensación de volumen.
// Si el cuerpo trae "b" (radio base de cada burbuja) la superficie sale más fina y rugosa.
function esfera(c, grad, semilla) {
  const r = azar(semilla), fino = !!c.b, menor = Math.min(c.rx, c.ry), bolas = [];
  const n = Math.round((c.rx * c.ry) / (fino ? 0.55 * c.b * c.b : 105));
  const f1 = r() * 6.28, f2 = r() * 6.28;
  const forma = (a) => (fino ? 1 + 0.07 * Math.sin(3 * a + f1) + 0.05 * Math.sin(5 * a + f2) : 1);
  const radio = (k) => (fino ? c.b * (0.75 + r() * 0.6) * k : menor * (0.22 + r() * 0.15) * k);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()), f = forma(a);
    bolas.push({ x: c.x + Math.cos(a) * d * c.rx * 0.8 * f, y: c.y + Math.sin(a) * d * c.ry * 0.8 * f, r: radio(1) });
  }
  const m = Math.round(n / (fino ? 1.6 : 2.4));
  for (let i = 0; i < m; i++) {
    const a = (i / m) * Math.PI * 2 + r() * 0.3, f = forma(a);
    bolas.push({ x: c.x + Math.cos(a) * c.rx * 0.88 * f, y: c.y + Math.sin(a) * c.ry * 0.88 * f, r: radio(fino ? 0.95 : 0.9) });
  }
  bolas.sort((p, q) => p.y - q.y);
  let cuerpo = `<ellipse cx="${c.x}" cy="${c.y}" rx="${c.rx * 0.9}" ry="${c.ry * 0.9}" fill="url(#lg-${grad}-o)"/>`;
  if (fino) cuerpo = `<path d="M${Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2, f = forma(a) * 0.93; return (c.x + Math.cos(a) * c.rx * f).toFixed(1) + ' ' + (c.y + Math.sin(a) * c.ry * f).toFixed(1); }).join(' L')}Z" fill="url(#lg-${grad}-o)"/>`;
  return cuerpo + bolas.map((b) => `<circle cx="${b.x.toFixed(1)}" cy="${b.y.toFixed(1)}" r="${b.r.toFixed(1)}" fill="url(#lg-${grad})"${fino ? ' stroke="rgba(0,0,25,.30)" stroke-width=".6"' : ''}/>`).join('');
}

// Doble hélice: hebras que se cruzan (la de atrás más oscura) y peldaños entre ellas.
function helice(L) {
  const { x0, x1, y, amp, per, sw } = L, N = Math.round((x1 - x0) / 5), P = [];
  for (let i = 0; i <= N; i++) {
    const x = x0 + ((x1 - x0) * i) / N, f = ((x - x0) / per) * 2 * Math.PI;
    P.push({ x, a: y - amp * Math.sin(f), b: y + amp * Math.sin(f), c: Math.cos(f) });
  }
  const tramos = []; let cur = { f: P[0].c + P[1].c >= 0, i0: 0 };
  for (let i = 1; i < N; i++) {
    const f = P[i].c + P[i + 1].c >= 0;
    if (f !== cur.f) { cur.i1 = i; tramos.push(cur); cur = { f, i0: i }; }
  }
  cur.i1 = N; tramos.push(cur);
  const trazo = (t, k) => 'M' + P.slice(t.i0, t.i1 + 1).map((p) => p.x.toFixed(1) + ' ' + p[k].toFixed(1)).join(' L');
  const atras = tramos.map((t) => trazo(t, t.f ? 'b' : 'a')).join(' ');
  const frente = tramos.map((t) => trazo(t, t.f ? 'a' : 'b')).join(' ');
  let peldanos = '';
  for (let x = x0 + per / 16, k = 0; x < x1; x += per / 8, k++) {
    const f = ((x - x0) / per) * 2 * Math.PI, ya = y - amp * Math.sin(f), yb = y + amp * Math.sin(f);
    peldanos += `<line x1="${x.toFixed(1)}" y1="${ya.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yb.toFixed(1)}" stroke="${k % 2 ? '#35d4ff' : '#5b9bff'}" stroke-width="${(sw * 0.38).toFixed(1)}" stroke-linecap="round" opacity=".9"/>`;
  }
  const base = `fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const cuerpo = `<g${L.sinBrillo ? ' filter="url(#lbSombra)"' : ' filter="url(#lbGlow)"'}><path d="${atras}" ${base} stroke="#1646a8" stroke-width="${sw}"/>${peldanos}<path d="${frente}" ${base} stroke="url(#gDna)" stroke-width="${sw}"/><path d="${frente}" ${base} stroke="#cfe6ff" stroke-width="${(sw * 0.22).toFixed(1)}" opacity=".55"/></g>`;
  return `<g class="lab-capa" data-capa="adn" data-part="adn">${L.tilt ? `<g transform="rotate(${L.tilt} ${(x0 + x1) / 2} ${y})">${cuerpo}</g>` : cuerpo}</g>`;
}

function texto(x, y, s, o = {}) {
  return `<text x="${x}" y="${y}" fill="${o.fill || '#eaf1ff'}" font-size="${o.size || 15}" font-weight="${o.w || 500}" text-anchor="${o.a || 'middle'}">${s}</text>`;
}

// Gradientes y filtros comunes a las dos composiciones.
function definiciones() {
  const g = (id, luz, base, sombra) => `<radialGradient id="lg-${id}" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${luz}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${sombra}"/></radialGradient><radialGradient id="lg-${id}-o" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${base}"/><stop offset="1" stop-color="${sombra}"/></radialGradient>`;
  return `<defs>
    <linearGradient id="gDna" x1="0" x2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset=".5" stop-color="#58c9ff"/><stop offset="1" stop-color="#2f7bff"/></linearGradient>
    <linearGradient id="gBanda" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
    ${g('esp', '#ffc27a', '#e5800f', '#7a3500')}${g('basal', '#8ff2c4', '#1bb37a', '#06553a')}${g('pol', '#8f80ff', '#4430c9', '#160a5c')}
    <filter id="lbGlow" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="lbSombra" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="#000" flood-opacity=".55"/></filter>
    <marker id="lbFlecha" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1.5 1.5 L8 5 L1.5 8.5" fill="none" stroke="#cfe0ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>
  </defs>`;
}

// Rótulo con recuadro de la composición de PC: título de color y, abajo, una línea de detalle.
function etiqueta(x, y, w, h, color, t1, t2, parte, capa) {
  const ty = t2 ? y + 23 : y + h / 2 + 5.5;
  return `<g class="lab-etq" data-part="${parte}" data-capa="${capa}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="rgba(4,10,30,.55)" stroke="${color}" stroke-width="1.6"/>${texto(x + 14, ty, t1, { fill: color, size: 15, w: 700, a: 'start' })}${t2 ? texto(x + 14, y + 41, t2, { fill: '#dbe6ff', size: 12, a: 'start' }) : ''}</g>`;
}

// Composición de PC: réplica de la imagen de referencia.
function escenaPC(L) {
  const { W, H, y, sw, enh, esp, bas, pol, pro, tss, arn } = L;
  const [p0, p1] = pro, centro = (L.x0 + L.x1) / 2;
  const enhY = y + (enh - centro) * Math.sin((L.tilt * Math.PI) / 180);

  // Enhancer: tramo amarillo que cruza la hélice.
  const cruz = `M${enh - 30} ${enhY - 27} L${enh + 30} ${enhY + 27} M${enh - 30} ${enhY + 27} L${enh + 30} ${enhY - 27}`;
  const en = `<g class="lab-capa lab-parte" data-capa="adn" data-part="enhancer" tabindex="0" role="button" aria-label="Seleccionar enhancer"><path d="${cruz}" stroke="#7a5a00" stroke-width="${sw * 1.35}" stroke-linecap="round" fill="none"/><path d="${cruz}" stroke="#ffd23d" stroke-width="${sw * 1.0}" stroke-linecap="round" fill="none"/><path d="${cruz}" stroke="#fff3b0" stroke-width="${sw * 0.28}" stroke-linecap="round" fill="none" opacity=".6"/></g>`;

  const bEsp = `<g class="lab-capa lab-parte lab-flota" data-capa="esp" data-part="especifico" tabindex="0" role="button" aria-label="Seleccionar factor específico"><g filter="url(#lbSombra)">${esfera(esp, 'esp', 7)}</g></g>`;
  const bBas = `<g class="lab-capa lab-parte lab-flota" data-capa="basal" data-part="basal" tabindex="0" role="button" aria-label="Seleccionar factores basales"><g filter="url(#lbSombra)">${esfera(bas, 'basal', 11)}</g></g>`;
  const bPol = `<g class="lab-capa lab-parte lab-flota" data-capa="pol" data-part="polimerasa" tabindex="0" role="button" aria-label="Seleccionar ARN polimerasa II"><g filter="url(#lbSombra)">${esfera(pol, 'pol', 23)}</g></g>`;

  // Arco punteado: el factor específico "habla" con el complejo basal a distancia.
  const arco = `<path class="lab-arco lab-capa" data-capa="esp" d="M${esp.x + 50} ${esp.y - 48} Q${(esp.x + bas.x) / 2 + 40} ${esp.y - 88} ${bas.x - 62} ${bas.y - 8}" fill="none" stroke="#e8f0ff" stroke-width="1.8" stroke-dasharray="3 6" stroke-linecap="round"/>`;

  // Promotor: tres tramos de color (naranja, verde, azul) que abrazan el ADN, como un barril.
  const alto = 74, top = 233, cols = [['#ff9f2e', p0, 440, 0], ['#19c997', 440, 500, 7], ['#2f86ff', 500, p1, 12]];
  const banda = cols.map(([c, a, b, d]) => `<rect x="${a}" y="${top + d}" width="${b - a}" height="${alto - d}" fill="${c}"/><rect x="${a}" y="${top + d}" width="${b - a}" height="${alto - d}" fill="url(#gBanda)"/>`).join('');
  let anillos = '';
  for (let x = p0 + 9; x < p1 - 4; x += 9) anillos += `<line x1="${x}" y1="${top + 2}" x2="${x}" y2="${top + alto - 2}" stroke="rgba(0,10,40,.28)" stroke-width="1.4"/>`;
  const prom = `<g class="lab-capa lab-parte" data-capa="adn" data-part="promotor" tabindex="0" role="button" aria-label="Seleccionar promotor"><clipPath id="lbRecorte"><rect x="${p0}" y="${top}" width="${p1 - p0}" height="${alto}" rx="18"/></clipPath><g filter="url(#lbSombra)"><g clip-path="url(#lbRecorte)">${banda}${anillos}<rect x="${p0}" y="${top}" width="${p1 - p0}" height="9" fill="#fff" opacity=".18"/></g></g></g>`;

  // ARNm naciente.
  const [a0, a1, a2, a3] = arn, dArn = `M${a0} C${a1} ${a2} ${a3}`.replace(/,/g, ' ');
  const mrna = `<g class="lab-capa lab-parte" data-capa="arnm" data-part="arn" tabindex="0" role="button" aria-label="Seleccionar ARN naciente"><g filter="url(#lbSombra)"><path d="${dArn}" fill="none" stroke="#8e0f3d" stroke-width="${sw * 1.18}" stroke-linecap="round"/><path d="${dArn}" fill="none" stroke="#f0245f" stroke-width="${sw * 0.96}" stroke-linecap="round"/><path d="${dArn}" fill="none" stroke="#ff9cbc" stroke-width="${sw * 0.16}" stroke-linecap="round" opacity=".7" transform="translate(0 -2)"/><path d="${dArn}" fill="none" stroke="#7a0f3a" stroke-width="${sw * 0.96}" stroke-dasharray="1.6 7.4" opacity=".5"/></g><path d="${dArn}" fill="none" stroke="transparent" stroke-width="${sw * 3}"/></g>`;

  // Rótulos y guías.
  const guia = (capa, d, color, punta) => `<g class="lab-capa" data-capa="${capa}"><path class="lab-leader" d="${d}" stroke="${color}"/>${punta ? `<circle cx="${punta[0]}" cy="${punta[1]}" r="3.6" fill="${color}"/>` : ''}</g>`;
  let anot = '';
  anot += etiqueta(98, 28, 150, 54, COLOR.esp, 'Factor específico', '(activador)', 'especifico', 'esp');
  anot += guia('esp', `M168 82 L${esp.x - 3} ${esp.y - 2}`, COLOR.esp, [esp.x - 3, esp.y - 2]);
  anot += etiqueta(386, 32, 207, 50, COLOR.basal, 'Factores basales', '(TFIID, TFIIB, TFIIF, TFIIE, TFIIH)', 'basal', 'basal');
  anot += guia('basal', `M440 90 L${bas.x - 3} ${bas.y + 17}`, COLOR.basal, [bas.x - 3, bas.y + 17]);
  anot += etiqueta(648, 47, 153, 38, COLOR.pol, 'ARN polimerasa II', '', 'polimerasa', 'pol');
  anot += guia('pol', 'M681 91 L650 135', COLOR.pol);
  anot += `<g class="lab-etq" data-part="enhancer" data-capa="adn"><path class="lab-leader" d="M182 325 L${enh + 1} ${enhY + 28}" stroke="#eef4ff"/>${texto(150, 337, 'Elemento de respuesta', { size: 13.5, fill: '#eef4ff' })}${texto(150, 355, 'a activadores (enhancer)', { size: 13.5, w: 600, fill: '#ffffff' })}${texto(150, 373, '(puede estar a distancia)', { size: 11.5, fill: '#b9c9ed' })}</g>`;
  anot += `<g class="lab-etq" data-part="promotor" data-capa="adn"><path d="M340 318 V329 Q340 331 342 331 H471 Q473 331 473 329 V318" fill="none" stroke="#5ca8ff" stroke-width="2.6" stroke-linecap="round"/>${texto(406, 352, 'Región promotora', { size: 13.5, w: 600, fill: '#ffffff' })}${texto(406, 371, '(caja TATA, Inr, DPE, etc.)', { size: 11.5, fill: '#cfdcf7' })}</g>`;
  anot += `<g class="lab-etq" data-part="promotor" data-capa="adn"><line class="lab-leader" x1="${tss}" y1="318" x2="${tss}" y2="${y + 138}" stroke="#bcd4ff" marker-end="url(#lbFlecha)"/>${texto(557, 403, 'Sitio de inicio', { size: 13.5, fill: '#eef4ff' })}${texto(557, 421, 'de la transcripción', { size: 13.5, fill: '#eef4ff' })}${texto(557, 439, '(+1)', { size: 13.5, fill: '#eef4ff' })}</g>`;
  anot += guia('arnm', 'M760 372 L797 405', COLOR.arnm);
  anot += `<g class="lab-etq" data-part="arn" data-capa="arnm"><rect x="800" y="391" width="156" height="38" rx="11" fill="rgba(4,10,30,.55)" stroke="${COLOR.arnm}" stroke-width="1.6"/>${texto(878, 415, 'ARNm (en síntesis)', { size: 14.5, w: 500, fill: '#ffe1ec' })}</g>`;
  anot += texto(26, 195, '5′', { size: 17, a: 'start', fill: '#e3ecff' }) + texto(30, 273, '3′', { size: 17, a: 'start', fill: '#e3ecff' });
  anot += texto(1008, 222, '3′', { size: 17, a: 'start', fill: '#e3ecff' }) + texto(1008, 298, '5′', { size: 17, a: 'start', fill: '#e3ecff' });

  return `<svg class="lab-svg" id="lab-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Modelo didáctico de ADN, factores basales, factores específicos y ARN polimerasa II" preserveAspectRatio="xMidYMid meet">${definiciones()}${helice(L)}${en}${arco}${bEsp}${bBas}${prom}${bPol}${mrna}${anot}</svg>`;
}

// Composición de celular: compacta, con pines numerados.
function escenaCel(L) {
  const { W, H, y, sw, enh, esp, bas, pol, pro, tss, arn } = L;
  const defs = definiciones();

  // Enhancer: dos barras amarillas que abrazan la hélice.
  const en = `<g class="lab-capa lab-parte" data-capa="adn" data-part="enhancer" tabindex="0" role="button" aria-label="Seleccionar enhancer"><path d="M${enh - 26} ${y - 38} L${enh + 26} ${y + 38} M${enh - 26} ${y + 38} L${enh + 26} ${y - 38}" stroke="#7a5a00" stroke-width="${sw * 1.9}" stroke-linecap="round"/><path d="M${enh - 26} ${y - 38} L${enh + 26} ${y + 38} M${enh - 26} ${y + 38} L${enh + 26} ${y - 38}" stroke="#ffd23d" stroke-width="${sw * 1.4}" stroke-linecap="round"/></g>`;

  const bEsp = `<g class="lab-capa lab-parte lab-flota" data-capa="esp" data-part="especifico" tabindex="0" role="button" aria-label="Seleccionar factor específico"><g filter="url(#lbSombra)">${esfera(esp, 'esp', 7)}</g></g>`;
  const bBas = `<g class="lab-capa lab-parte lab-flota" data-capa="basal" data-part="basal" tabindex="0" role="button" aria-label="Seleccionar factores basales"><g filter="url(#lbSombra)">${esfera(bas, 'basal', 11)}</g></g>`;
  const bPol = `<g class="lab-capa lab-parte lab-flota" data-capa="pol" data-part="polimerasa" tabindex="0" role="button" aria-label="Seleccionar ARN polimerasa II"><g filter="url(#lbSombra)">${esfera(pol, 'pol', 23)}</g></g>`;

  // Arco punteado: el factor específico "habla" con el complejo basal a distancia.
  const ax = esp.x + esp.rx * 0.6, ay = esp.y - esp.ry * 0.95, bx = bas.x - bas.rx * 0.5, by = bas.y - bas.ry * 0.9;
  const arco = `<path class="lab-arco lab-capa" data-capa="esp" d="M${ax} ${ay} Q${(ax + bx) / 2} ${Math.min(ay, by) - 55} ${bx} ${by}" fill="none" stroke="#e8f0ff" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>`;

  // Promotor: tres bandas de color que "abrazan" el ADN (se dibujan por delante de las esferas).
  const [p0, p1] = pro, tercio = (p1 - p0) / 3, alto = sw * 3.6, cols = ['#ff9f2e', '#19c997', '#2f86ff'];
  const banda = cols.map((c, i) => `<rect x="${(p0 + tercio * i).toFixed(1)}" y="${y - alto / 2}" width="${tercio.toFixed(1)}" height="${alto}" fill="${c}"/><rect x="${(p0 + tercio * i).toFixed(1)}" y="${y - alto / 2}" width="${tercio.toFixed(1)}" height="${alto}" fill="url(#gBanda)"/>`).join('');
  const prom = `<g class="lab-capa lab-parte" data-capa="adn" data-part="promotor" tabindex="0" role="button" aria-label="Seleccionar promotor"><clipPath id="lbRecorte"><rect x="${p0}" y="${y - alto / 2}" width="${p1 - p0}" height="${alto}" rx="${alto / 2.4}"/></clipPath><g clip-path="url(#lbRecorte)">${banda}</g></g>`;

  // ARNm naciente.
  const [a0, a1, a2, a3] = arn, dArn = `M${a0} C${a1} ${a2} ${a3}`.replace(/,/g, ' ');
  const mrna = `<g class="lab-capa lab-parte" data-capa="arnm" data-part="arn" tabindex="0" role="button" aria-label="Seleccionar ARN naciente"><g filter="url(#lbGlow)"><path d="${dArn}" fill="none" stroke="#a3124a" stroke-width="${sw * 1.1}" stroke-linecap="round"/><path d="${dArn}" fill="none" stroke="#ff4f8b" stroke-width="${sw * 0.8}" stroke-linecap="round"/><path d="${dArn}" fill="none" stroke="#ffc2d8" stroke-width="${sw * 0.2}" stroke-linecap="round" opacity=".7"/></g><path d="${dArn}" fill="none" stroke="transparent" stroke-width="${sw * 3}"/></g>`;

  // Pines numerados.
  let anot = texto(8, y - 20, '5′', { size: 14, a: 'start', fill: '#cfe0ff' }) + texto(8, y + 36, '3′', { size: 14, a: 'start', fill: '#cfe0ff' });
  anot += texto(712, y - 24, '3′', { size: 14, a: 'end', fill: '#cfe0ff' }) + texto(712, y + 32, '5′', { size: 14, a: 'end', fill: '#cfe0ff' });
  anot += `<line class="lab-capa" data-capa="adn" x1="${tss}" y1="${y + 22}" x2="${tss}" y2="${y + 62}" stroke="#9fc4ff" stroke-width="1.6" marker-end="url(#lbFlecha)"/>` + texto(tss, y + 82, '+1', { size: 13, fill: '#9fc4ff', w: 700 });
  const pos = { especifico: [esp.x + esp.rx * 0.85, esp.y - esp.ry * 0.9], enhancer: [enh, y + 50], promotor: [(p0 + p1) / 2 - 20, y + 54], basal: [bas.x - bas.rx * 0.65, bas.y - bas.ry * 0.95], polimerasa: [pol.x + pol.rx * 0.65, pol.y - pol.ry * 0.95], arn: [a2[0], a2[1] - 26] };
  Object.keys(pos).forEach((id) => {
    const p = PIEZAS[id], [px, py] = pos[id];
    anot += `<g class="lab-pin" data-part="${id}" data-capa="${p.capa}"><circle cx="${px}" cy="${py}" r="24" fill="transparent"/><circle cx="${px}" cy="${py}" r="13" fill="${p.color === COLOR.prom ? '#ffc23d' : p.color}" stroke="#fff" stroke-width="2"/><text x="${px}" y="${py + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#06102a">${p.pin}</text></g>`;
  });
  return `<svg class="lab-svg" id="lab-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Modelo didáctico de ADN, factores basales, factores específicos y ARN polimerasa II" preserveAspectRatio="xMidYMid meet">${defs}${helice(L)}${en}${arco}${bEsp}${bBas}${bPol}${prom}${mrna}${anot}</svg>`;
}

function construirEscena(L) { return L.etq ? escenaPC(L) : escenaCel(L); }

// Cuadros de vista (viewBox) para "Vista general" y "Primer plano".
function cuadros(L) {
  const general = L.etq ? [0, 0, L.W, L.H] : [0, 40, L.W, 340];
  const x0 = L.pro[0] - 90, x1 = L.pol.x + L.pol.rx + 60, y0 = L.bas.y - L.bas.ry - 50, y1 = L.y + 130;
  return { general, cerca: [x0, y0, x1 - x0, y1 - y0] };
}

// ---------- HTML de las secciones ----------
const iconoADN = `<svg viewBox="0 0 48 48" width="48" height="52" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><linearGradient id="lbIc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b79bff"/><stop offset="1" stop-color="#7c52ff"/></linearGradient></defs><path d="M14 4c0 12 20 14 20 24S14 36 14 44M34 4c0 12-20 14-20 24s20 8 20 16" fill="none" stroke="url(#lbIc)" stroke-width="4" stroke-linecap="round"/><path d="M17 12h14M15 20h18M15 36h18M17 44h0" stroke="url(#lbIc)" stroke-width="3" stroke-linecap="round"/></svg>`;

function htmlCapas() {
  return CAPAS.map(([id, nombre, c]) => `<label class="lab-capa-op" style="--c:${c}"><input type="checkbox" data-capa-chk="${id}"${CAPAS_INICIO[id] ? ' checked' : ''}><i class="lab-punto"></i><span>${nombre}</span><b class="lab-sw" aria-hidden="true"></b></label>`).join('');
}

// Íconos blancos de los círculos de "¿Qué hace cada factor?".
const svgIc = (d) => `<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONOS = {
  basal: svgIc('<circle cx="9" cy="8" r="3"/><path d="M3.5 19.5c0-3.4 2.4-5.6 5.5-5.6s5.5 2.2 5.5 5.6"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.2 14.2c2.8-.3 4.8 1.6 4.8 4.4"/>'),
  esp: svgIc('<circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c0-3.6 2.8-6 6.5-6s6.5 2.4 6.5 6"/><path d="M9.5 17.2h5"/>'),
  pol: svgIc('<rect x="3.2" y="8.6" width="17.6" height="6.8" rx="3.4" transform="rotate(-45 12 12)"/><path d="M9.4 9.4l5.2 5.2"/>')
};

function htmlTarjetas() {
  const fila = (c, ic, t, d) => `<div class="lab-fila-f" style="--c:${c}"><span class="lab-ic">${ic}</span><div><h4>${t}</h4><p>${d}</p></div></div>`;
  const elem = (c, n, d, parte) => `<button type="button" class="lab-elem" data-part="${parte}" style="--c:${c}"><i></i><b>${n}</b><span>${d}</span></button>`;
  const u = (t) => `<u>${t}</u>`;
  const lista = `${u('TFIID')}, ${u('TFIIB')}, ${u('TFIIF')}, ${u('TFIIE')} y ${u('TFIIH')}`;
  // Esquema de la región promotora (coordenadas en un lienzo de 340 × 160).
  const esquema = `<svg class="lab-esq" viewBox="0 6 340 152" role="img" aria-label="Esquema: enhancer lejano, cajas CAAT y TATA, Inr y sitio de inicio +1">
      <rect x="1" y="12" width="73" height="47" rx="10" fill="rgba(255,180,58,.06)" stroke="#ffb43a" stroke-width="1.6"/>
      <text x="37.5" y="32" text-anchor="middle" font-size="13.5" font-weight="700" fill="#ffc866">Enhancer</text><text x="37.5" y="48" text-anchor="middle" font-size="12" fill="#ffc866">(lejos)</text>
      <path d="M77 37 C100 37 111 48 114 68 M108.5 61.5 L114 69.5 L119.5 61.5" fill="none" stroke="#ffb43a" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="21" y="83" width="300" height="30" rx="6" fill="#2f6cf5"/>
      <rect x="259" y="83" width="62" height="30" rx="6" fill="#7c52ff"/><rect x="259" y="83" width="12" height="30" fill="#7c52ff"/>
      <rect x="211" y="83" width="48" height="30" fill="#3a86ff"/>
      <rect x="81" y="83" width="50" height="50" rx="5" fill="#6a5cf0"/><rect x="141" y="83" width="54" height="50" rx="5" fill="#ff4f8b"/>
      <g font-size="13" font-weight="700" text-anchor="middle"><text x="106" y="102" fill="#10163d">CAAT</text><text x="106" y="120" fill="#10163d">box</text><text x="168" y="102" fill="#2a0f2c">TATA</text><text x="168" y="120" fill="#2a0f2c">box</text><text x="235" y="103" fill="#eaf3ff">Inr</text></g>
      <text x="277" y="38" text-anchor="middle" font-size="12.5" fill="#c9d8ff">+1</text>
      <path d="M277 122 V52 H306 M300 47 L307 52 L300 57" fill="none" stroke="#5fe0ff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <g font-size="12" fill="#9d86ff" text-anchor="end"><text x="337" y="141">Inicio de</text><text x="337" y="155">transcripción</text></g>
    </svg>`;
  return `
  <details class="lab-tarj" open><summary><h3>¿Qué hace cada factor?</h3></summary><div class="lab-tarj-cuerpo">
    ${fila(COLOR.basal, ICONOS.basal, 'Factores basales', `Forman el complejo de preiniciación y permiten que la ARN polimerasa II se una al promotor.<br>Incluyen: ${lista}.`)}
    ${fila(COLOR.esp, ICONOS.esp, 'Factores específicos', `Se unen a secuencias reguladoras <b>(enhancers o silenciadores)</b> y aumentan o disminuyen la transcripción.<br>Pueden ser <b>activadores</b> o <b>represores</b>.`)}
    ${fila(COLOR.pol, ICONOS.pol, 'ARN polimerasa II', 'Reconoce el promotor y sintetiza el ARN mensajero<br><b>en dirección 5′ → 3′.</b>')}
  </div></details>
  <details class="lab-tarj" open><summary><h3>¿Qué es cada elemento?</h3></summary><div class="lab-tarj-cuerpo lab-elems">
    ${elem(COLOR.adn, 'ADN', 'Doble hélice que contiene la información genética.', 'adn')}
    ${elem(COLOR.pol, 'ARN polimerasa II', 'Enzima que sintetiza el ARN mensajero.', 'polimerasa')}
    ${elem(COLOR.basal, 'TFIID, TFIIB, TFIIF,<br>TFIIE, TFIIH', 'Factores basales de transcripción.', 'basal')}
    ${elem(COLOR.esp, 'Activadores<br>/ Represores', 'Proteínas que se unen a secuencias reguladoras.', 'especifico')}
    ${elem(COLOR.prom, 'Promotor', 'Secuencia de ADN donde se ensamblan los factores basales.', 'promotor')}
    ${elem(COLOR.arnm, 'ARNm', 'Copia del gen, sintetizada en dirección 5′ → 3′.', 'arn')}
  </div></details>
  <details class="lab-tarj" open><summary><h3>Esquema de la región promotora <small>(eucariotas)</small></h3></summary><div class="lab-tarj-cuerpo">
    ${esquema}
    <div class="lab-tipos"><h4>Tipos de factores</h4><div class="lab-tipos-cols">
      <div style="--c:${COLOR.basal}"><b><i></i>Basales</b><ul><li>TFIID (TBP)</li><li>TFIIB</li><li>TFIIF</li><li>TFIIE</li><li>TFIIH</li></ul></div>
      <div style="--c:${COLOR.esp}"><b><i></i>Específicos</b><ul><li>Activadores</li><li>Represores</li></ul></div>
    </div></div>
  </div></details>`;
}

function htmlExplicacion() {
  const pasos = PASOS.map((p, i) => `<article class="lab-paso-c" style="--c:${[COLOR.adn, COLOR.esp, COLOR.basal, COLOR.pol, COLOR.arnm][i]}"><span class="lab-num">${i + 1}</span><div><h3>${p.titulo}</h3><p>${p.texto}</p><button type="button" class="lab-btn-sec" data-ver-paso="${i}">Ver en el modelo →</button></div></article>`).join('');
  return `<div class="lab-doble"><div class="lab-lista-pasos">${pasos}</div>
    <aside class="lab-regla"><h3>Regla visual para el examen</h3>
      <article style="--c:${COLOR.prom}"><b>ADN</b><p>Promotor, enhancer y sitios reguladores: son secuencias de nucleótidos.</p></article>
      <article style="--c:${COLOR.basal}"><b>PROTEÍNAS</b><p>Factores basales, factores específicos y ARN polimerasa II: son componentes proteicos.</p></article>
      <article style="--c:${COLOR.arnm}"><b>ARN</b><p>El producto inicial es ARN; luego el pre-ARNm eucariota suele procesarse.</p></article>
    </aside></div>`;
}

function tabla(cab, filas, colores) {
  return `<div class="lab-tabla" role="table"><div class="lab-tr lab-th" role="row"><span></span>${cab.map((c, i) => `<b style="--c:${colores[i]}">${c}</b>`).join('')}</div>${filas.map((f) => `<div class="lab-tr" role="row"><span class="lab-rotulo">${f[0]}</span>${f.slice(1).map((c, i) => `<p data-l="${cab[i]}" style="--c:${colores[i]}">${c}</p>`).join('')}</div>`).join('')}</div>`;
}
function htmlComparador() {
  const t1 = tabla(['Factores basales', 'Factores específicos', 'ARN polimerasa II'], [
    ['Naturaleza', 'Proteínas', 'Proteínas', 'Complejo enzimático proteico'],
    ['Actúan sobre', 'El promotor', 'Enhancers o silenciadores', 'El promotor, reclutada por los basales'],
    ['Función', 'Forman el complejo de preiniciación', 'Aumentan o disminuyen la transcripción', 'Sintetiza ARN en sentido 5′→3′'],
    ['Distancia', 'Actúan en el promotor', 'Pueden actuar a distancia', 'Comienza en el sitio +1'],
    ['Ejemplos', 'TFIID (TBP), TFIIB, TFIIF, TFIIE, TFIIH', 'Activadores y represores', 'ARN pol II (sintetiza pre-ARNm)']
  ], [COLOR.basal, COLOR.esp, COLOR.pol]);
  const t2 = tabla(['Promotor', 'Enhancer'], [
    ['Naturaleza', 'Secuencia de ADN', 'Secuencia de ADN'],
    ['Ubicación', 'Cerca del sitio de inicio (+1)', 'Puede estar lejos del promotor'],
    ['Qué se le une', 'Factores basales y ARN polimerasa II', 'Factores específicos (activadores)'],
    ['Efecto', 'Permite la iniciación basal', 'Aumenta la transcripción']
  ], [COLOR.prom, COLOR.prom]);
  return `<section class="lab-bloque"><h2>Factores y enzima</h2>${t1}</section><section class="lab-bloque"><h2>Secuencias de ADN reguladoras</h2>${t2}</section>`;
}

// ---------- Función principal ----------
/* ---------- Catálogo principal del LAB ---------- */
export function abrirLab({ app, volver }) {
  const temas = [
    {id:'factores', icon:'🧬', grupo:'GENÉTICA MOLECULAR', titulo:'ADN y factores de transcripción', desc:'Explorá la doble hélice, los factores basales y específicos, la ARN polimerasa II y el inicio de la transcripción.', activo:true, tono:'azul'},
    {id:'operones', icon:'🧫', grupo:'REGULACIÓN GÉNICA', titulo:'Operones lac y trp + ferritina', desc:'Experimentá con lactosa, glucosa, triptófano, atenuación y regulación según la disponibilidad de hierro.', activo:true, tono:'verde'},
    {id:'replicacion', icon:'🧬', grupo:'DUPLICACIÓN DEL ADN', titulo:'Duplicación del ADN · laboratorio integrador', desc:'Unificá el modelo de replicación, la horquilla, el cuadro comparativo y el crucigrama en un solo recorrido interactivo.', activo:true, tono:'azul'},
    {id:'bases', icon:'🧬', grupo:'GENÉTICA MOLECULAR', titulo:'Laboratorio de bases', desc:'Practicá complementariedad, flujo de bases, codones, anticodones y diferencias entre ADN y ARN con ejercicios interactivos.', activo:true, tono:'verde'},
    {id:'transcripcion', icon:'🧬', grupo:'GENÉTICA MOLECULAR', titulo:'Transcripción: del ADN al ARN', desc:'Seguí la iniciación, apertura local, elongación y terminación con una animación interactiva del proceso.', activo:true, tono:'azul'},
    {id:'cromosomas', icon:'🧬', grupo:'NÚCLEO Y CROMATINA', titulo:'Laboratorio de cromosomas', desc:'Explorá la estructura, compactación de la cromatina y los cariotipos con modelos visuales interactivos.', activo:true, tono:'violeta'},
    {id:'mitosis', icon:'🧫', grupo:'DIVISIÓN CELULAR', titulo:'Mitosis y citocinesis', desc:'Recorré profase temprana y tardía, metafase, anafase, telofase y citocinesis con animación guiada, mecanismos moleculares y desafío interactivo.', activo:true, tono:'verde'},
    {id:'proteina-g', icon:'🧬', grupo:'SEÑALIZACIÓN CELULAR', titulo:'Proteínas G: cascadas y apagado de la señal', desc:'Compará Gs, Gi y Gq con cascadas visuales; explorá AMPc/PKA, IP₃/DAG/Ca²⁺ y los mecanismos que terminan la señal.', activo:true, tono:'violeta'},
    {id:'comunicacion', icon:'📡', grupo:'SEÑALIZACIÓN Y UNIONES GAP', titulo:'Comunicación celular y sinapsis', desc:'Explorá los mecanismos de señalización, la transmisión sináptica y las uniones comunicantes formadas por conexones y conexinas.', activo:true, tono:'violeta'},
    {id:'neuro', icon:'⚡', grupo:'NEUROBIOLOGÍA', titulo:'Impulso nervioso y sinapsis', desc:'Espacio preparado para potencial de acción, canales iónicos y transmisión sináptica.', tono:'ambar'},
    {id:'celula', icon:'🔬', grupo:'BIOLOGÍA CELULAR', titulo:'La célula por dentro', desc:'Un lugar para futuros modelos de organelas, membranas y transporte celular.', tono:'rosa'},
    {id:'nuevo', icon:'＋', grupo:'NUEVO LABORATORIO', titulo:'Próximo laboratorio', desc:'Sección libre para sumar otro proceso o tema cuando quieras ampliar el catálogo.', tono:'gris'}
  ];
  inyectarEstilos();
  inyectarEstilosCatalogo();
  function abrirDivisionCelular(){
    let tema='mitosis';
    const datos={
      mitosis:{icon:'🧫',n:'01',titulo:'Mitosis y citocinesis',bajada:'Una división celular para conservar la dotación cromosómica.',detalle:'Seguí la condensación, alineación y separación de cromátidas hermanas hasta formar dos células hijas.',pasos:['Profase','Metafase','Anafase','Telofase','Citocinesis'],abrir:()=>abrirMitosis({app,volver:abrirDivisionCelular})},
      meiosis:{icon:'🧬',n:'02',titulo:'Meiosis I y II',bajada:'Dos divisiones que reducen la dotación cromosómica y generan variabilidad.',detalle:'Explorá la sinapsis de homólogos, el crossing-over, la separación de homólogos y después de cromátidas hermanas.',pasos:['Sinapsis','Crossing-over','Meiosis I','Meiosis II'],abrir:()=>abrirMeiosis({app,volver:abrirDivisionCelular})}
    };
    function pintar(){
      const t=datos[tema];
      app.innerHTML=`<section class="mitlab div-hub">
        <button class="ml-back" id="div-back">← Volver al catálogo</button>
        <header class="ml-hero"><div><div class="ml-kicker">PARCIALITO LAB · BIOLOGÍA CELULAR</div><h1>División celular</h1><p>Elegí un tema para explorar sus etapas con el modelo interactivo.</p></div></header>
        <nav class="div-tabs" aria-label="Temas de división celular">
          <button type="button" data-div="mitosis" class="${tema==='mitosis'?'activo':''}"><span>🧫</span><b>Mitosis</b><small>Una división</small></button>
          <button type="button" data-div="meiosis" class="${tema==='meiosis'?'activo':''}"><span>🧬</span><b>Meiosis I y II</b><small>Dos divisiones</small></button>
        </nav>
        <article class="div-feature div-${tema}">
          <div class="div-art" aria-hidden="true"><div class="div-cell"><i></i><i></i><i></i><i></i></div><span class="div-art-label">${t.n} / 02 · PROCESO</span></div>
          <div class="div-info"><div class="ml-kicker">LABORATORIO ${t.n}</div><h2>${t.icon} ${t.titulo}</h2><h3>${t.bajada}</h3><p>${t.detalle}</p>
            <div class="div-tags">${t.pasos.map((p,i)=>`<span><i>${String(i+1).padStart(2,'0')}</i>${p}</span>`).join('')}</div>
            <button type="button" class="div-open" id="div-open">Entrar al modelo <b>→</b></button>
          </div>
        </article></section>`;
      app.querySelector('#div-back').onclick=mostrarCatalogo;
      app.querySelectorAll('[data-div]').forEach(b=>b.onclick=()=>{tema=b.dataset.div;pintar()});
      app.querySelector('#div-open').onclick=t.abrir;
    }
    const st=document.createElement('style');st.id='div-hub-css';document.getElementById(st.id)?.remove();
    st.textContent='.div-hub{max-width:1120px;margin:auto;padding:clamp(14px,3vw,30px);color:#edf3ff}.div-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:7px;border:1px solid #294578;border-radius:16px;background:#08162f;margin:18px 0}.div-tabs button{display:grid;grid-template-columns:36px 1fr;grid-template-rows:auto auto;gap:2px 10px;text-align:left;padding:12px;border:1px solid transparent;border-radius:12px;background:transparent;color:#aebfe0;font:inherit}.div-tabs button>span{grid-row:1/3;display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:#162b4e;font-size:21px}.div-tabs b{font-size:14px;color:#dbe7ff}.div-tabs small{font-size:11px;color:#8fa6d0}.div-tabs .activo{background:#1b3765;border-color:#477cf4}.div-feature{display:grid;grid-template-columns:minmax(150px,.8fr) minmax(0,1.2fr);gap:24px;align-items:center;padding:clamp(14px,3vw,28px);border:1px solid #2c4777;border-radius:20px;background:radial-gradient(ellipse at 22% 42%,#1c3764,transparent 58%),linear-gradient(140deg,#101f3b,#09152b)}.div-art{min-height:220px;position:relative;display:grid;place-items:center;border:1px solid #2c4777;border-radius:16px;background:radial-gradient(circle,#1c3d69,#09152c 72%)}.div-cell{width:140px;height:140px;border:2px solid #7898d0;border-radius:50%;position:relative}.div-cell i{position:absolute;left:50%;top:50%;width:9px;height:44px;border-radius:8px;background:#9f91ff;transform:translate(-50%,-50%) rotate(35deg)}.div-cell i:nth-child(2){transform:translate(-50%,-50%) rotate(-35deg);background:#ff9f78}.div-cell i:nth-child(3){transform:translate(-50%,-50%) rotate(80deg);background:#63e8c3}.div-cell i:nth-child(4){transform:translate(-50%,-50%) rotate(-80deg);background:#ffce69}.div-art-label{position:absolute;bottom:10px;left:10px;color:#8fa9d8;font-size:10px;font-weight:800;letter-spacing:.1em}.div-info h2{font-size:clamp(22px,3vw,30px);margin:6px 0}.div-info h3{font-size:15px;color:#c2d4f7}.div-info p{line-height:1.6;color:#aebfe0;font-size:14px}.div-tags{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0}.div-tags span{padding:6px 8px;border:1px solid #2c4777;border-radius:8px;background:#0a1932;color:#c5d6f7;font-size:11px}.div-tags i{font-style:normal;color:#63e8c3;margin-right:5px}.div-open{display:flex;justify-content:space-between;width:100%;max-width:330px;padding:13px 15px;border:1px solid #4b77cf;border-radius:12px;background:linear-gradient(110deg,#234b8d,#193665);color:white;font:inherit;font-weight:700}@media(max-width:600px){.div-feature{grid-template-columns:1fr;gap:14px;padding:13px}.div-art{min-height:175px}.div-cell{width:120px;height:120px}.div-open{max-width:none}.div-tabs button{grid-template-columns:28px 1fr;gap:4px 7px;padding:9px 7px}.div-tabs button>span{width:28px;height:30px;font-size:17px}.div-tabs b{font-size:12px}.div-tabs small{font-size:10px}}';
    document.head.appendChild(st);pintar();
  }
  function tarjeta(t) {
    return `<button type="button" class="lab-cat-card tono-${t.tono}" data-lab-card="${t.id}">
      <span class="lab-cat-cardtop"><span class="lab-cat-icon">${t.icon}</span><span class="lab-cat-status ${t.activo?'status-on':''}"><i></i>${t.activo?'INTERACTIVO':'ESPACIO DISPONIBLE'}</span></span>
      <span class="lab-cat-grupo">${t.grupo}</span><strong>${t.titulo}</strong><span class="lab-cat-desc">${t.desc}</span>
      <span class="lab-cat-accion">${t.activo?'Entrar al laboratorio':'Abrir espacio'} <b aria-hidden="true">↗</b></span>
    </button>`;
  }
  function mostrarCatalogo() {
    app.innerHTML = `<main class="lab-catalogo">
      <header class="lab-cat-cab"><button type="button" class="lab-cat-volver" data-cat-inicio>← <span>Volver a Parcialito</span></button>
        <div class="lab-cat-marca">PARCIALITO <b>LAB</b></div><p class="lab-cat-eyebrow">BIOLOGÍA CELULAR Y MOLECULAR</p>
        <h1>Laboratorio</h1><p class="lab-cat-intro">Elegí qué proceso querés explorar. Cada tema tiene su propio espacio para modelos, explicaciones y actividades interactivas.</p>
      </header>
      <section class="lab-cat-section"><div class="lab-cat-sectionhead"><div><span class="lab-cat-kicker">EXPLORAR</span><h2>Laboratorios disponibles</h2></div><span class="lab-cat-count">${temas.filter(t=>t.activo).length.toString().padStart(2,'0')} activos</span></div><div class="lab-cat-grid">${temas.filter(t=>t.activo).map(t=>tarjeta(t)+(t.id==='transcripcion'?`<button type="button" class="lab-cat-card tono-verde lab-cat-translation-card" data-open-translation><span class="lab-cat-cardtop"><span class="lab-cat-icon">🧬</span><span class="lab-cat-status status-on"><i></i>INTERACTIVO</span></span><span class="lab-cat-grupo">EXPRESIÓN GÉNICA · SIGUIENTE ETAPA</span><strong>Traducción: del ARNm a la proteína</strong><span class="lab-cat-desc">Después de la transcripción, seguí cómo el ARNm se lee en el ribosoma, cómo se cargan los ARNt, se forman los enlaces peptídicos y se libera la proteína.</span><span class="lab-cat-accion">Entrar al laboratorio <b aria-hidden="true">↗</b></span></button>`:'')).join('')}</div></section>
      <section class="lab-cat-section lab-cat-futuros"><div class="lab-cat-sectionhead"><div><span class="lab-cat-kicker">EN CONSTRUCCIÓN</span><h2>Más laboratorios</h2><p>Espacios reservados para incorporar nuevos temas sin mezclar los contenidos.</p></div><span class="lab-cat-count">${temas.filter(t=>!t.activo).length} espacios</span></div><div class="lab-cat-grid">${temas.filter(t=>!t.activo).map(tarjeta).join('')}</div></section>
      <footer class="lab-cat-pie">Un tema por laboratorio · Contenidos ampliables de forma independiente</footer></main>`;
    app.querySelector('[data-cat-inicio]').addEventListener('click', volver);
    app.querySelectorAll('[data-open-translation]').forEach(b=>b.addEventListener('click',()=>abrirTraduccion({app,volver:mostrarCatalogo})));
    app.querySelectorAll('[data-lab-card]').forEach(b=>b.addEventListener('click',()=>{
      const t=temas.find(x=>x.id===b.dataset.labCard);
      if(t.id==='factores') abrirFactores({app,volver:mostrarCatalogo});
      else if(t.id==='operones') abrirOperones({app,volver:mostrarCatalogo});
      else if(t.id==='replicacion') abrirLabReplicacion({app,volver:mostrarCatalogo});
      else if(t.id==='bases') abrirBases({app,volver:mostrarCatalogo});
      else if(t.id==='transcripcion') abrirTranscripcion({app,volver:mostrarCatalogo});
      else if(t.id==='cromosomas') abrirCromosomas({app,volver:mostrarCatalogo});
      else if(t.id==='mitosis') abrirDivisionCelular();
      else if(t.id==='comunicacion') abrirComunicacion({app,volver:mostrarCatalogo});
      else if(t.id==='proteina-g') abrirProteinaG({app,volver:mostrarCatalogo});
      else mostrarEspacio(t);
    }));
  }
  function mostrarEspacio(t) {
    app.innerHTML = `<main class="lab-catalogo"><header class="lab-cat-cab"><button type="button" class="lab-cat-volver" data-cat-back>← <span>Todos los laboratorios</span></button><div class="lab-cat-marca">PARCIALITO <b>LAB</b></div></header>
      <section class="lab-cat-vacio"><span class="lab-cat-icon">${t.icon}</span><p class="lab-cat-eyebrow">${t.grupo}</p><h1>${t.titulo}</h1><p>Este espacio ya está reservado en el catálogo. Todavía no tiene un modelo interactivo, pero se puede completar después sin modificar los demás laboratorios.</p>
      <div class="lab-cat-vacio-nota"><span>＋</span><div><strong>Espacio listo para ampliar</strong><p>Acá se podrán agregar el modelo, los controles, las explicaciones y las preguntas del tema.</p></div></div><button type="button" class="lab-cat-primary" data-cat-back>Volver al catálogo</button></section></main>`;
    app.querySelectorAll('[data-cat-back]').forEach(b=>b.addEventListener('click',mostrarCatalogo));
  }
  mostrarCatalogo();
}

function inyectarEstilosCatalogo() {
  if(document.getElementById('lab-catalogo-css')) return;
  const st=document.createElement('style'); st.id='lab-catalogo-css';
  st.textContent=`
  .lab-catalogo{--ct:#eaf1ff;box-sizing:border-box;max-width:1260px;min-height:100dvh;margin:0 auto;padding:clamp(18px,4vw,42px);color:var(--ct);font-family:var(--fuente,Inter,system-ui,sans-serif);background:radial-gradient(55rem 25rem at 12% -7rem,#14327d 0,transparent 65%),radial-gradient(40rem 25rem at 100% 35%,#1a0f4d55 0,transparent 70%),#040a1c;box-shadow:0 0 0 100vmax #040a1c;clip-path:inset(0 -100vmax)}
  .lab-cat-cab{padding-bottom:28px;border-bottom:1px solid #1c3d8f}.lab-cat-volver{display:inline-flex;gap:8px;align-items:center;padding:9px 13px;border:1px solid #1c3d8f;border-radius:11px;background:#0a1738;color:#9fb3e6;cursor:pointer;font:inherit;font-size:.85rem;font-weight:600}.lab-cat-volver:hover{border-color:#3d8bff;color:white}
  .lab-cat-marca{margin-top:26px;color:#a8c7ff;font-size:.78rem;font-weight:800;letter-spacing:.16em}.lab-cat-marca b{margin-left:5px;padding:4px 7px;border-radius:6px;background:#2f7bff;color:white}
  .lab-cat-eyebrow,.lab-cat-kicker{margin:22px 0 7px;color:#72a8ff;font-size:.72rem;font-weight:800;letter-spacing:.15em}.lab-cat-cab h1,.lab-cat-vacio h1{margin:0;font-size:clamp(2.2rem,5vw,3.7rem);line-height:1.06;letter-spacing:-.045em}.lab-cat-intro{max-width:720px;margin:15px 0 0;color:#b9c9f2;font-size:1.02rem;line-height:1.7}
  .lab-cat-translation{display:grid;grid-template-columns:minmax(220px,.8fr) minmax(0,1.5fr);gap:clamp(16px,3vw,30px);align-items:center;margin-top:22px;padding:clamp(17px,3vw,28px);border:1px solid #2d5882;border-radius:20px;background:radial-gradient(ellipse at 15% 10%,#174a5a 0,transparent 65%),linear-gradient(125deg,#0b203c,#11163b)}.lab-cat-translation-art{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;min-height:125px;padding:16px;border:1px solid #28516e;border-radius:15px;background:#061328;color:#7de8cb;font-size:.8rem;font-weight:900;letter-spacing:.06em;text-align:center}.lab-cat-translation-art span{padding:9px 10px;border:1px solid #287a78;border-radius:9px;background:#0d302f}.lab-cat-translation-art b{color:#ffc66d;font-size:1.2rem}.lab-cat-translation-art .ribosome-mark{border-color:#5ca8ff;background:#102b4c;color:#bcd8ff}.lab-cat-translation-copy .lab-cat-grupo{display:block;margin:0 0 8px;color:#70e4c4}.lab-cat-translation-copy h2{margin:0;font-size:clamp(1.25rem,2.5vw,1.8rem);line-height:1.25}.lab-cat-translation-copy p{margin:10px 0 17px;color:#b9c9f2;line-height:1.65;font-size:.91rem}.lab-cat-translation-btn{display:inline-flex;align-items:center;gap:15px;border:1px solid #4fbdab;border-radius:11px;padding:11px 14px;background:#124a4b;color:#eafff9;font:inherit;font-size:.87rem;font-weight:800;cursor:pointer}.lab-cat-translation-btn:hover{background:#17605d}.lab-cat-section{padding-top:30px}.lab-cat-sectionhead{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:16px}.lab-cat-sectionhead h2{margin:4px 0 0;font-size:clamp(1.25rem,2.4vw,1.7rem)}.lab-cat-sectionhead p{margin:8px 0 0;color:#9fb3e6;line-height:1.55}.lab-cat-kicker{margin:0}.lab-cat-count{white-space:nowrap;padding:6px 10px;border:1px solid #234488;border-radius:999px;color:#9fb3e6;font-size:.76rem}
  .lab-cat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.lab-cat-card{min-width:0;display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:clamp(17px,2.6vw,25px);border:1px solid #23406f;border-radius:19px;background:linear-gradient(145deg,#0d1f48f5,#060e22f5);color:#eaf1ff;font:inherit;cursor:pointer;transition:transform .18s,border-color .18s}.lab-cat-card:hover{transform:translateY(-3px);border-color:#3d8bff}.lab-cat-card:focus-visible,.lab-cat-volver:focus-visible,.lab-cat-primary:focus-visible{outline:2px solid #83b5ff;outline-offset:3px}
  .lab-cat-cardtop{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;margin-bottom:22px}.lab-cat-icon{display:grid;place-items:center;width:49px;height:49px;flex:0 0 49px;border:1px solid #31549a;border-radius:14px;background:#102653;font-size:1.55rem}.lab-cat-status{display:inline-flex;align-items:center;gap:7px;padding:5px 8px;border:1px solid #34415e;border-radius:999px;color:#aab7d2;font-size:.62rem;font-weight:800;letter-spacing:.04em}.lab-cat-status i{width:6px;height:6px;border-radius:50%;background:#8793aa}.lab-cat-status.status-on{border-color:#1e6a60;background:#0b302e;color:#79e8c7}.lab-cat-status.status-on i{background:#1fd6a5}
  .lab-cat-grupo{margin-bottom:8px;color:#72a8ff;font-size:.67rem;font-weight:800;letter-spacing:.13em}.lab-cat-card strong{font-size:clamp(1.05rem,2vw,1.35rem);line-height:1.3}.lab-cat-desc{flex:1;margin-top:10px;color:#b9c9f2;font-size:.9rem;line-height:1.65}.lab-cat-accion{display:flex;justify-content:space-between;gap:12px;width:100%;margin-top:24px;padding-top:14px;border-top:1px solid #1c3159;color:#9fc0ff;font-size:.84rem;font-weight:750}.lab-cat-accion b{font-size:1.15rem}
  .tono-verde .lab-cat-icon{border-color:#236e63;background:#0b302e}.tono-verde .lab-cat-grupo{color:#64e4bd}.tono-violeta .lab-cat-icon{border-color:#56449b;background:#241b50}.tono-violeta .lab-cat-grupo{color:#b5a2ff}.tono-ambar .lab-cat-icon{border-color:#87602c;background:#382814}.tono-ambar .lab-cat-grupo{color:#ffd18a}.tono-rosa .lab-cat-icon{border-color:#814367;background:#381b34}.tono-rosa .lab-cat-grupo{color:#ff9bce}.tono-gris{border-style:dashed!important;background:#070f25!important}.tono-gris .lab-cat-icon{border-style:dashed}
  .lab-cat-translation-card{border-color:#2d806f;background:radial-gradient(ellipse at 12% 0%,#174a5a 0,transparent 70%),linear-gradient(145deg,#0b203c,#11163b)}.lab-cat-translation-card .lab-cat-grupo{color:#70e4c4}.lab-cat-translation-card .lab-cat-accion{color:#7de8cb}.lab-cat-futuros{margin-top:12px;padding-bottom:18px;border-top:1px solid #152c5d}.lab-cat-pie{padding-top:17px;border-top:1px solid #152c5d;color:#7287b7;font-size:.78rem}
  .lab-cat-vacio{max-width:760px;margin:clamp(45px,9vh,100px) auto;text-align:center}.lab-cat-vacio>.lab-cat-icon{margin:0 auto 23px;width:65px;height:65px;font-size:2rem}.lab-cat-vacio h1{font-size:clamp(2rem,5vw,3.3rem)}.lab-cat-vacio>p:not(.lab-cat-eyebrow){max-width:620px;margin:18px auto;color:#b9c9f2;line-height:1.7}.lab-cat-vacio-nota{display:flex;gap:14px;margin:28px auto;padding:18px;text-align:left;border:1px dashed #31518a;border-radius:15px;background:#081433}.lab-cat-vacio-nota>span{display:grid;place-items:center;flex:0 0 34px;height:34px;border-radius:10px;background:#12295b;color:#9fc0ff;font-size:1.4rem}.lab-cat-vacio-nota p{margin:5px 0 0;color:#9fb3e6;font-size:.86rem;line-height:1.5}.lab-cat-primary{padding:11px 17px;border:1px solid #3d8bff;border-radius:11px;background:#235fe0;color:white;font:inherit;font-size:.9rem;font-weight:700;cursor:pointer}
  @media(max-width:680px){.lab-cat-translation{grid-template-columns:1fr;gap:13px;padding:15px}.lab-cat-translation-art{min-height:85px}.lab-cat-translation-btn{width:100%;justify-content:space-between}.lab-catalogo{padding:17px 14px 28px}.lab-cat-grid{grid-template-columns:1fr;gap:12px}.lab-cat-card{padding:17px;border-radius:16px}.lab-cat-section{padding-top:25px}.lab-cat-sectionhead{align-items:flex-start}.lab-cat-count{font-size:.68rem;padding:5px 8px}.lab-cat-desc{font-size:.87rem}.lab-cat-intro{font-size:.94rem}.lab-cat-vacio{margin:55px auto}.lab-cat-vacio-nota{padding:14px}}
  @media(prefers-reduced-motion:reduce){.lab-cat-card{transition:none}.lab-cat-card:hover{transform:none}}
  `;
  document.head.appendChild(st);
}

function abrirFactores({ app, volver }) {
  let capas = { ...CAPAS_INICIO }, modo = 'general', paso = 0, pasoActivo = false, pasoAPaso = false, sel = null;
  let chico = window.matchMedia('(max-width: 760px)'), vbActual = null, raf = 0, cerrado = false, molstarScrollObserver = null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  inyectarEstilos();
  app.innerHTML = `
  <main class="lab2" id="lab2">
    <header class="lab-cab">
      <div class="lab-tit">
        <button class="lab-volver" id="lab-volver" aria-label="Volver al catálogo de laboratorios" title="Volver">←</button>
        ${iconoADN}<div><h1>Factores de transcripción</h1><h2>Basales y específicos</h2></div>
      </div>
      <nav class="lab-tabs" role="tablist" aria-label="Secciones del laboratorio">${TABS.map(([id, n, ic], i) => `<button class="lab-tab${i ? '' : ' act'}" role="tab" id="tab-${id}" aria-selected="${i ? 'false' : 'true'}" aria-controls="sec-${id}" data-tab="${id}"><span class="ic" aria-hidden="true">${ic}</span><span>${n}</span></button>`).join('')}</nav>
    </header>

    <section class="lab-sec" id="sec-vista" role="tabpanel" aria-labelledby="tab-vista">
      <p class="lab-intro">Explorá cómo se organizan y actúan los factores de transcripción en la hebra de ADN para iniciar la transcripción.</p>
      <div class="lab-vista">
        <aside class="lab-panel" aria-label="Controles del modelo">
          <details class="lab-grupo" open><summary>Capas</summary><div class="lab-capas">${htmlCapas()}</div></details>
          <details class="lab-grupo" open><summary>Modo de vista</summary><div class="lab-modos" role="radiogroup" aria-label="Modo de vista">
            <button type="button" role="radio" aria-checked="true" class="act" data-modo="general"><i>⛶</i>Vista general</button>
            <button type="button" role="radio" aria-checked="false" data-modo="cerca"><i>⌖</i>Primer plano</button>
            <button type="button" role="radio" aria-checked="false" data-modo="lateral"><i>⟲</i>Vista lateral</button>
          </div></details>
          <details class="lab-grupo" open><summary>Animación</summary><div class="lab-anim">
            <label class="lab-capa-op lab-paso-sw"><input type="checkbox" id="lab-pasoapaso"><span class="lab-play" aria-hidden="true">▶</span><span>Paso a paso</span><b class="lab-sw" aria-hidden="true"></b></label>
            <button type="button" class="lab-reiniciar" id="lab-reiniciar">↻ Reiniciar</button>
          </div></details>
        </aside>
        <div class="lab-escenario">
          <div class="lab-escena" id="lab-escena"></div>
          <div class="lab-leyenda-cel" id="lab-leyenda-cel"></div>
          <article class="lab-detalle" id="lab-detalle" aria-live="polite"><span class="lab-det-tipo" id="lab-det-tipo"></span><h3 id="lab-det-nombre"></h3><p id="lab-det-texto"></p><div class="lab-det-dato" id="lab-det-dato"></div></article>
        </div>
      </div>
      <div class="lab-tarjetas" id="lab-tarjetas">${htmlTarjetas()}</div>
      <div class="lab-pie">
        <div class="lab-clave"><span class="lab-bombilla" aria-hidden="true">💡</span><p id="lab-clave"><b>Dato clave:</b> ${CLAVE_GENERAL}</p></div>
        <div class="lab-pager" role="group" aria-label="Pasos del recorrido"><button type="button" id="lab-prev" aria-label="Paso anterior">‹</button><span id="lab-pag" aria-live="polite">1 / ${PASOS.length}</span><button type="button" id="lab-next" aria-label="Paso siguiente">›</button></div>
      </div>
      <details class="lab-real" id="lab-real"><summary><span>🔬 Estructura experimental real</span><em>PDB 7ML2</em></summary>
        <p>Vista molecular interactiva de ARN polimerasa II con ADN y componentes del complejo de iniciación. Arrastrá para rotar y usá el zoom para acercarte. Es un complejo de levadura: sirve para explorar la arquitectura molecular, no como mapa exacto de cada gen humano.</p>
        <div class="lab-real-view" id="lab-real-view"><div class="lab-real-fb" id="lab-real-fb">Se carga al abrir esta sección.</div></div>
        <div class="lab-real-pie"><span>Estructura experimental · representación 3D</span><a href="https://www.rcsb.org/structure/7ML2" target="_blank" rel="noopener noreferrer">Ficha científica ↗</a></div>
      </details>
    </section>

    <section class="lab-sec" id="sec-explicacion" role="tabpanel" aria-labelledby="tab-explicacion" hidden>${htmlExplicacion()}</section>
        <section class="lab-sec" id="sec-comparador" role="tabpanel" aria-labelledby="tab-comparador" hidden>${htmlComparador()}</section>
    <section class="lab-sec" id="sec-preguntas" role="tabpanel" aria-labelledby="tab-preguntas" hidden><div id="lab-quiz" class="lab-quiz"></div></section>
  </main>`;

  const $ = (s) => app.querySelector(s), $$ = (s) => [...app.querySelectorAll(s)];
  const escena = $('#lab-escena');

  // ----- Escena -----
  function pintarEscena() {
    const L = chico.matches ? DISEÑOS.cel : DISEÑOS.pc;
    escena.innerHTML = construirEscena(L);
    vbActual = null;
    $('#lab-leyenda-cel').innerHTML = chico.matches
      ? Object.keys(PIEZAS).filter((id) => PIEZAS[id].pin).sort((a, b) => PIEZAS[a].pin - PIEZAS[b].pin).map((id) => `<button type="button" data-part="${id}" data-capa="${PIEZAS[id].capa}"><b style="background:${PIEZAS[id].color}">${PIEZAS[id].pin}</b>${PIEZAS[id].nombre}</button>`).join('')
      : '';
    aplicar(true);
  }

  function irA(vb) {
    const svg = $('#lab-svg'); if (!svg) return;
    cancelAnimationFrame(raf);
    const desde = vbActual || vb, t0 = performance.now(), dur = reduce ? 0 : 480;
    const marco = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1, e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      vbActual = desde.map((d, i) => d + (vb[i] - d) * e);
      svg.setAttribute('viewBox', vbActual.join(' '));
      if (k < 1) raf = requestAnimationFrame(marco);
    };
    raf = requestAnimationFrame(marco);
  }

  function capaVisible(c) {
    if (pasoAPaso) return paso + 1 >= CAPA_DESDE_PASO[c];
    return !!capas[c];
  }
  function enFoco(parte) { return pasoActivo && PASOS[paso].piezas.includes(parte); }

  // Refleja el estado (capas, foco, selección, vista) en la escena y los controles.
  function aplicar(sinVista) {
    $$('[data-capa]').forEach((el) => { if (el.tagName !== 'INPUT') el.classList.toggle('oculto', !capaVisible(el.dataset.capa)); });
    $$('[data-capa-chk]').forEach((i) => { i.checked = capaVisible(i.dataset.capaChk); i.disabled = pasoAPaso; });
    const hayFoco = pasoActivo;
    escena.classList.toggle('foco-on', hayFoco);
    escena.classList.toggle('lateral', modo === 'lateral');
    $$('#lab-escena [data-part], #lab-leyenda-cel [data-part]').forEach((el) => {
      el.classList.toggle('en-foco', enFoco(el.dataset.part));
      el.classList.toggle('sel', el.dataset.part === sel);
    });
    $$('.lab-elem').forEach((el) => el.classList.toggle('sel', el.dataset.part === sel));
    $$('[data-modo]').forEach((b) => { b.classList.toggle('act', b.dataset.modo === modo); b.setAttribute('aria-checked', b.dataset.modo === modo); });
    $('#lab-pag').textContent = `${paso + 1} / ${PASOS.length}`;
    $('#lab-prev').disabled = paso === 0; $('#lab-next').disabled = paso === PASOS.length - 1;
    $('#lab-clave').innerHTML = `<b>Dato clave:</b> ${pasoActivo ? PASOS[paso].clave : CLAVE_GENERAL}`;
    $('#lab-pasoapaso').checked = pasoAPaso;
    $('.lab-pie').classList.toggle('con-paso', pasoActivo);
    if (!sinVista) { const c = cuadros(chico.matches ? DISEÑOS.cel : DISEÑOS.pc); irA(modo === 'cerca' ? c.cerca : c.general); }
    else { const c = cuadros(chico.matches ? DISEÑOS.cel : DISEÑOS.pc); const svg = $('#lab-svg'); if (svg) { vbActual = modo === 'cerca' ? c.cerca : c.general; svg.setAttribute('viewBox', vbActual.join(' ')); } }
  }

  function seleccionar(id) {
    const p = PIEZAS[id]; if (!p) return;
    sel = id;
    const t = $('#lab-det-tipo'); t.textContent = p.tipo.toUpperCase(); t.style.color = p.color;
    $('#lab-det-nombre').textContent = p.nombre; $('#lab-det-texto').textContent = p.texto; $('#lab-det-dato').textContent = p.dato;
    $('#lab-detalle').style.setProperty('--c', p.color); $('#lab-detalle').classList.add('hay');
    aplicar(true);
  }

  function irAPaso(n, activo = true) {
    paso = Math.max(0, Math.min(PASOS.length - 1, n)); pasoActivo = activo;
    if (activo) seleccionar(PASOS[paso].piezas[0]); else aplicar(true);
  }

  // ----- Eventos del tablero -----
  const elegirPieza = (e) => {
    const el = e.target.closest('[data-part]'); if (!el || el.classList.contains('oculto')) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (e.type === 'keydown') e.preventDefault();
    seleccionar(el.dataset.part);
    if (el.classList.contains('lab-elem') || el.closest('#lab-leyenda-cel')) $('#lab-detalle').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  };
  ['#lab-escena', '#lab-leyenda-cel', '#lab-tarjetas'].forEach((s) => { $(s).addEventListener('click', elegirPieza); $(s).addEventListener('keydown', elegirPieza); });

  $$('[data-capa-chk]').forEach((i) => i.addEventListener('change', () => { capas[i.dataset.capaChk] = i.checked; aplicar(true); }));
  $$('[data-modo]').forEach((b) => b.addEventListener('click', () => { modo = b.dataset.modo; aplicar(); }));
  $('#lab-pasoapaso').addEventListener('change', (e) => { pasoAPaso = e.target.checked; if (pasoAPaso) { pasoActivo = true; seleccionar(PASOS[paso].piezas[0]); } else aplicar(true); });
  $('#lab-prev').addEventListener('click', () => irAPaso(paso - 1));
  $('#lab-next').addEventListener('click', () => irAPaso(paso + 1));
  $('#lab-reiniciar').addEventListener('click', () => {
    capas = { ...CAPAS_INICIO }; modo = 'general'; paso = 0; pasoActivo = false; pasoAPaso = false; sel = null;
    $('#lab-detalle').classList.remove('hay'); aplicar();
  });

  // Tarjetas: abiertas y fijas en PC; plegables y cerradas en celular.
  const ajustarTarjetas = () => $$('.lab-tarj, .lab-grupo').forEach((d) => { d.open = !chico.matches || d.classList.contains('lab-grupo'); });
  $$('.lab-tarj > summary').forEach((s) => s.addEventListener('click', (e) => { if (!chico.matches) e.preventDefault(); }));
  $$('.lab-grupo > summary').forEach((s) => s.addEventListener('click', (e) => { if (!chico.matches) e.preventDefault(); }));
  // Al cambiar entre PC y celular se vuelve a dibujar la escena con la otra composición.
  const alCambiar = () => { pintarEscena(); ajustarTarjetas(); if (sel) seleccionar(sel); };
  chico.addEventListener('change', alCambiar);

  // ----- Pestañas -----
  function irATab(id) {
    $$('.lab-tab').forEach((b) => { const on = b.dataset.tab === id; b.classList.toggle('act', on); b.setAttribute('aria-selected', on); });
    TABS.forEach(([t]) => { $('#sec-' + t).hidden = t !== id; });
    if (id === 'preguntas' && !$('#lab-quiz').childElementCount) reiniciarQuiz();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => irATab(b.dataset.tab)));
  $('.lab-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const t = $$('.lab-tab'), i = t.findIndex((b) => b.classList.contains('act')), n = (i + (e.key === 'ArrowRight' ? 1 : -1) + t.length) % t.length;
    irATab(t[n].dataset.tab); t[n].focus();
  });
  $$('[data-ver-paso]').forEach((b) => b.addEventListener('click', () => { irATab('vista'); irAPaso(Number(b.dataset.verPaso)); }));

  // ----- Preguntas -----
  let q = { i: 0, aciertos: 0, orden: [] };
  function reiniciarQuiz() { q = { i: 0, aciertos: 0, orden: PREGUNTAS.map((_, k) => k).sort(() => Math.random() - 0.5) }; pintarPregunta(); }
  function pintarPregunta() {
    const cont = $('#lab-quiz');
    if (q.i >= PREGUNTAS.length) {
      const pct = Math.round((q.aciertos / PREGUNTAS.length) * 100);
      cont.innerHTML = `<div class="lab-quiz-fin"><span class="lab-quiz-medalla">${pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'}</span><h2>${q.aciertos} de ${PREGUNTAS.length} correctas</h2><p>${pct >= 80 ? '¡Excelente! Tenés muy claro quién es quién en la transcripción.' : pct >= 50 ? 'Vas bien. Repasá la pestaña Comparador y probá de nuevo.' : 'Repasá la pestaña Explicación y volvé a intentarlo.'}</p><button class="lab-btn" id="lab-q-reint">Reintentar</button></div>`;
      $('#lab-q-reint').addEventListener('click', reiniciarQuiz); return;
    }
    const p = PREGUNTAS[q.orden[q.i]], ops = p.o.map((t, k) => ({ t, ok: k === p.ok })).sort(() => Math.random() - 0.5);
    cont.innerHTML = `<div class="lab-quiz-top"><span>Pregunta ${q.i + 1} de ${PREGUNTAS.length}</span><span>✔ ${q.aciertos}</span></div><div class="lab-quiz-barra"><i style="width:${(q.i / PREGUNTAS.length) * 100}%"></i></div><h2>${p.q}</h2><div class="lab-quiz-ops">${ops.map((o, k) => `<button type="button" data-ok="${o.ok}"><b>${'ABCD'[k]}</b>${o.t}</button>`).join('')}</div><div class="lab-quiz-fb" id="lab-q-fb" role="status"></div>`;
    cont.querySelectorAll('.lab-quiz-ops button').forEach((b) => b.addEventListener('click', () => {
      const ok = b.dataset.ok === 'true'; if (ok) q.aciertos++;
      cont.querySelectorAll('.lab-quiz-ops button').forEach((x) => { x.disabled = true; x.classList.toggle('bien', x.dataset.ok === 'true'); });
      if (!ok) b.classList.add('mal');
      $('#lab-q-fb').innerHTML = `<p class="${ok ? 'ok' : 'no'}">${ok ? '¡Correcto!' : 'No exactamente.'} ${p.exp}</p><button class="lab-btn" id="lab-q-sig">${q.i === PREGUNTAS.length - 1 ? 'Ver resultado' : 'Siguiente →'}</button>`;
      $('#lab-q-sig').addEventListener('click', () => { q.i++; pintarPregunta(); });
    }));
  }

  // ----- Estructura real (se carga solo si se abre) -----
  $('#lab-real').addEventListener('toggle', (e) => {
    if (!e.target.open || $('#lab-pdbe')) return;
    const vista = $('#lab-real-view'), fb = $('#lab-real-fb');
    fb.textContent = 'Cargando visualizador molecular…';
    // Algunos visores moleculares intentan bloquear el scroll global. Guardamos el
    // estado original y revertimos únicamente los bloqueos que agregue el visor.
    const raiz = document.documentElement, cuerpo = document.body;
    const estilosScroll = [raiz, cuerpo].map((el) => ({el, overflow: el.style.overflow, position: el.style.position, height: el.style.height, touchAction: el.style.touchAction}));
    const restaurarScroll = () => estilosScroll.forEach(({el, overflow, position, height, touchAction}) => {
      if (el.style.overflow === 'hidden' || el.style.overflow === 'clip') el.style.overflow = overflow;
      if (el.style.position === 'fixed') el.style.position = position;
      if (el.style.height === '100%' || el.style.height === '100vh' || el.style.height === '100dvh') el.style.height = height;
      if (el.style.touchAction === 'none') el.style.touchAction = touchAction;
    });
    const montar = () => {
      vista.insertAdjacentHTML('afterbegin', '<pdbe-molstar id="lab-pdbe" molecule-id="7ml2" hide-controls="false" hide-logo="true" bg-color-r="4" bg-color-g="10" bg-color-b="28" lighting="glossy" style="display:block;position:relative;width:100%;height:480px;max-width:100%;z-index:0"></pdbe-molstar>');
      fb.textContent = 'Podés rotar el modelo dentro del visor; la página debe seguir desplazándose normalmente.';
      restaurarScroll();
      if (window.MutationObserver) {
        molstarScrollObserver = new MutationObserver(restaurarScroll);
        molstarScrollObserver.observe(raiz, {attributes:true, attributeFilter:['style']});
        molstarScrollObserver.observe(cuerpo, {attributes:true, attributeFilter:['style']});
      }
    };
    if (window.customElements && window.customElements.get('pdbe-molstar')) return montar();
    if (!document.getElementById('lab-molstar-css')) { const l = document.createElement('link'); l.id = 'lab-molstar-css'; l.rel = 'stylesheet'; l.href = 'https://cdn.jsdelivr.net/npm/pdbe-molstar@3.5.0/build/pdbe-molstar.css'; document.head.appendChild(l); }
    const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pdbe-molstar@3.5.0/build/pdbe-molstar-component.js'; s.async = true;
    s.onload = () => customElements.whenDefined('pdbe-molstar').then(montar).catch(() => { fb.textContent = 'No se pudo iniciar el visor. El modelo esquemático sigue disponible arriba.'; });
    s.onerror = () => { fb.textContent = 'No se pudo cargar el visor externo. Revisá tu conexión; el modelo esquemático sigue disponible arriba.'; };
    document.head.appendChild(s);
  });

  $('#lab-volver').addEventListener('click', () => { cerrado = true; cancelAnimationFrame(raf); molstarScrollObserver?.disconnect(); chico.removeEventListener('change', alCambiar); volver(); });

  pintarEscena(); ajustarTarjetas();
  aplicar(true);
  window.scrollTo({ top: 0 });
}

// ---------- Estilos (se inyectan una sola vez) ----------
function inyectarEstilos() {
  let st = document.getElementById('lab2-css');
  if (!st) { st = document.createElement('style'); st.id = 'lab2-css'; document.head.appendChild(st); }
  st.textContent = `
.lab2{--b0:#040a1c;--b1:#081433;--ln:#1c3d8f;--ln2:#2f5fd0;--tx:#eaf1ff;--mu:#9fb3e6;--az:#2f7bff;
  position:relative;max-width:1312px;margin:0 auto;padding:22px 24px 44px;color:var(--tx);min-height:100dvh;font-family:var(--fuente);
  background:radial-gradient(60rem 28rem at 12% -6rem,#0f2468 0,transparent 62%),radial-gradient(40rem 24rem at 100% 30%,#1a0f4d55 0,transparent 70%),var(--b0);
  box-shadow:0 0 0 100vmax var(--b0);clip-path:inset(0 -100vmax)}
.lab2 *{box-sizing:border-box}.lab2 h1,.lab2 h2,.lab2 h3,.lab2 h4,.lab2 p{margin:0}.lab2 button{font:inherit;color:inherit;cursor:pointer}
.lab2 [hidden]{display:none!important}
.lab-cab{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:18px}
.lab-volver{border:1px solid var(--ln);background:#0a1738;border-radius:12px;padding:9px 14px;font-weight:600;color:var(--mu)}.lab-volver:hover{border-color:var(--az);color:#fff}
.lab-tit{display:flex;align-items:center;gap:12px;min-width:0}.lab-marca{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--mu)}.lab-marca b{color:#a98bff}
.lab-tit h1{font-size:clamp(1.5rem,2.6vw,2.1rem);font-weight:700;line-height:1.1;letter-spacing:-.01em;color:#dfe8ff}.lab-tit h2{font-size:clamp(1.15rem,2vw,1.55rem);font-weight:600;color:#c9d8ff;line-height:1.2}
.lab-tabs{display:flex;gap:4px;padding:6px;border-radius:999px;background:rgba(9,20,52,.9);border:1px solid var(--ln);box-shadow:0 0 28px #1a4bd033}
.lab-tab{border:0;background:transparent;border-radius:999px;padding:11px 24px;color:var(--mu);font-weight:600;white-space:nowrap;display:flex;gap:6px;align-items:center;transition:background .2s,color .2s}
.lab-tab .ic{display:none}.lab-tab:hover{color:#fff}.lab-tab.act{background:linear-gradient(180deg,#3b82ff,#2a63e6);color:#fff;box-shadow:0 0 18px #2f7bff88}
.lab-tab:focus-visible,.lab-volver:focus-visible,.lab2 summary:focus-visible,.lab-elem:focus-visible{outline:2px solid #7fb0ff;outline-offset:2px}
.lab-intro{color:#b9c9f2;max-width:560px;line-height:1.5;margin:14px 0 22px;font-size:1rem}.lab-vista>*{min-width:0}
.lab-vista{display:grid;grid-template-columns:250px minmax(0,1fr);gap:22px;align-items:start}
.lab-panel{border:1px solid var(--ln);border-radius:20px;background:rgba(8,18,48,.78);padding:12px 16px;box-shadow:inset 0 0 30px #1a3fb01a}
.lab-grupo{padding:10px 0;border-bottom:1px solid #16306f}.lab-grupo:last-child{border-bottom:0}
.lab-grupo>summary{list-style:none;font-weight:600;font-size:.9rem;color:#dfe8ff;display:flex;align-items:center;gap:8px;padding:2px 0 8px;cursor:default}.lab-grupo>summary::-webkit-details-marker{display:none}
.lab-grupo>summary::before{content:'⌄';color:var(--mu);font-size:.9rem}
.lab-capa-op{display:flex;align-items:center;gap:10px;padding:8px 2px;cursor:pointer;font-size:.88rem;color:#d3def9;position:relative}
.lab-capa-op input{position:absolute;opacity:0;pointer-events:none}.lab-punto{width:14px;height:14px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);flex:0 0 14px}
.lab-capa-op>span:not(.lab-play){flex:1}.lab-sw{width:42px;height:24px;border-radius:99px;background:#243a78;position:relative;transition:background .2s;flex:0 0 42px}
.lab-sw::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s}
.lab-capa-op input:checked~.lab-sw{background:#2f7bff}.lab-capa-op input:checked~.lab-sw::after{transform:translateX(18px)}
.lab-capa-op input:focus-visible~.lab-sw{outline:2px solid #7fb0ff;outline-offset:2px}.lab-capa-op input:disabled~*{opacity:.75}
.lab-modos{display:grid;gap:8px}.lab-modos button{display:flex;gap:10px;align-items:center;border:1px solid #1f3a85;background:#0a1534;border-radius:12px;padding:11px 12px;font-size:.88rem;color:#d3def9;text-align:left}
.lab-modos button i{font-style:normal;width:20px;text-align:center;color:var(--mu)}.lab-modos button.act{border-color:#4a8dff;background:#12306e;color:#fff;box-shadow:0 0 16px #2f7bff55}.lab-modos button:hover{border-color:#4a8dff}
.lab-play{width:30px;height:30px;border-radius:50%;border:2px solid #3b82ff;display:grid;place-items:center;font-size:.7rem;color:#8fb8ff;flex:0 0 30px}
.lab-reiniciar{width:100%;margin-top:8px;border:1px solid #2a4aa5;background:#112a66;border-radius:12px;padding:11px;font-weight:600;color:#e5eeff}.lab-reiniciar:hover{background:#17388a}
.lab-escenario{min-width:0}.lab-escena{position:relative;border-radius:22px;perspective:1100px;min-height:300px;overflow:hidden}
.lab-svg{display:block;width:100%;height:auto;max-height:560px;overflow:visible;transition:transform .7s cubic-bezier(.2,.7,.2,1)}
.lab-escena.lateral .lab-svg{transform:rotateY(-26deg) rotateX(7deg) scale(.92)}
.lab-svg text{font-family:var(--fuente);pointer-events:none}.lab-svg .lab-capa,.lab-svg .lab-etq,.lab-svg .lab-pin{transition:opacity .45s}
.lab-svg .oculto,.lab-leyenda-cel .oculto{opacity:0;pointer-events:none}.lab-leyenda-cel .oculto{opacity:.35;pointer-events:auto}
.lab-svg [data-part]{cursor:pointer;outline:none}.lab-svg .lab-parte:hover,.lab-svg .lab-parte:focus-visible{filter:brightness(1.18)}
.lab-svg .lab-parte.sel{filter:drop-shadow(0 0 10px #fff)}.lab-svg .lab-etq.sel rect{fill:rgba(30,60,140,.9)}
.lab-escena.foco-on .lab-svg [data-part]:not(.en-foco){opacity:.28}.lab-escena.foco-on .lab-svg .lab-parte.en-foco{filter:drop-shadow(0 0 14px #fff)}
.lab-escena.foco-on .lab-svg .oculto{opacity:0}
.lab-arco{animation:lab-marcha 1.4s linear infinite}@keyframes lab-marcha{to{stroke-dashoffset:-18}}
.lab-flota{animation:lab-flota 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.lab-flota:nth-of-type(3n){animation-delay:-2s}@keyframes lab-flota{50%{transform:translateY(-4px)}}
.lab-leyenda-cel{display:none}
.lab-detalle{margin-top:14px;border:1px solid var(--ln);border-left:4px solid var(--c,#2f7bff);border-radius:16px;background:rgba(8,18,48,.8);padding:14px 18px;display:grid;grid-template-columns:minmax(0,1fr);gap:6px}
.lab-det-tipo{font-size:.68rem;letter-spacing:.12em;font-weight:800}.lab-detalle h3{font-size:1.15rem}.lab-detalle p{font-size:.9rem;line-height:1.6;color:#cdd9f7}
.lab-det-dato{font-size:.84rem;color:#9fc4ff;border-top:1px dashed #234488;padding-top:8px;margin-top:2px}.lab-det-dato::before{content:'Ojo: ';font-weight:800;color:#c7dcff}
.lab-tarjetas{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;margin-top:22px;align-items:stretch}
.lab-tarj{border:1px solid var(--ln);border-radius:20px;background:rgba(8,18,48,.78);padding:18px 20px;box-shadow:inset 0 0 30px #1a3fb01a}
.lab-tarj>summary{list-style:none;cursor:default}.lab-tarj>summary::-webkit-details-marker{display:none}.lab-tarj h3{font-size:1.1rem;font-weight:700;color:#e6eeff}.lab-tarj h3 small{font-weight:500;color:#5aa2ff;font-size:inherit}
.lab-tarj-cuerpo{margin-top:14px;display:grid;gap:16px}
.lab-fila-f{display:grid;grid-template-columns:48px 1fr;gap:14px}.lab-fila-f h4{color:var(--c);font-size:1.02rem;font-weight:700;margin-bottom:3px}.lab-fila-f p{font-size:.85rem;line-height:1.5;color:#cdd9f7}
.lab-ic{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-size:1.3rem;background:color-mix(in srgb,var(--c) 28%,#06102a);border:2px solid color-mix(in srgb,var(--c) 70%,#fff);box-shadow:0 0 14px color-mix(in srgb,var(--c) 45%,transparent)}
.lab-elems{gap:6px}.lab-elem{display:grid;grid-template-columns:22px minmax(0,.9fr) minmax(0,1.2fr);gap:12px;align-items:center;text-align:left;border:1px solid transparent;background:transparent;border-radius:12px;padding:7px 6px}
.lab-elem i{width:20px;height:20px;border-radius:50%;background:var(--c);box-shadow:0 0 10px color-mix(in srgb,var(--c) 70%,transparent)}.lab-elem b{color:var(--c);font-size:.84rem;line-height:1.25}.lab-elem span{font-size:.78rem;color:#b4c4ec;line-height:1.35}
.lab-elem:hover,.lab-elem.sel{background:#102656;border-color:#2a4aa5}
.lab-tipos{border:1px solid #1f3a85;border-radius:14px;padding:12px 14px}.lab-tipos h4{font-size:.85rem;margin-bottom:8px}.lab-tipos-cols{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lab-tipos b{display:flex;align-items:center;gap:8px;font-size:.82rem;color:#dfe8ff;margin-bottom:4px}.lab-tipos b i{width:11px;height:11px;border-radius:50%;background:var(--c)}
.lab-tipos ul{margin:0;padding:0;list-style:none;font-size:.78rem;color:#b9c9f2}.lab-tipos li{padding:2px 0 2px 18px;position:relative}.lab-tipos li::before{content:'';position:absolute;left:3px;top:.75em;width:5px;height:5px;border-radius:50%;background:var(--c)}
.lab-pie{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:20px}.lab-clave{flex:1;display:flex;align-items:center;gap:14px;border:1px solid var(--ln);border-radius:999px;background:rgba(8,18,48,.78);padding:12px 24px;min-width:0}
.lab-clave p{font-size:.84rem;line-height:1.45;color:#c4d3f6}.lab-clave b{color:#fff}.lab-bombilla{font-size:1.5rem;filter:drop-shadow(0 0 8px #ffc23d88)}
.lab-pager{display:flex;align-items:center;gap:14px;font-size:.92rem;color:#cfdcff;white-space:nowrap}.lab-pager button{width:52px;height:52px;border-radius:14px;border:1px solid var(--ln2);background:#0e2457;font-size:1.6rem;line-height:1;color:#fff}.lab-pager button:hover:not(:disabled){background:#1a3b8c}.lab-pager button:disabled{opacity:.35;cursor:default}
.lab-real{margin-top:22px;border:1px solid var(--ln);border-radius:20px;background:rgba(8,18,48,.6);overflow:hidden}.lab-real>summary{list-style:none;display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 20px;font-weight:600;cursor:pointer}.lab-real>summary::-webkit-details-marker{display:none}.lab-real>summary em{font-style:normal;font-size:.72rem;letter-spacing:.07em;border:1px solid #2f4fa5;border-radius:99px;padding:5px 10px;color:#a9c4ff}
.lab-real>p{padding:0 20px 14px;color:#a9bbe6;font-size:.86rem;line-height:1.6;max-width:900px}.lab-real-view{background:#040a1c;min-height:120px}.lab-real-fb{padding:12px 20px;font-size:.78rem;color:#8fa3d6}.lab-real-pie{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 20px;border-top:1px solid var(--ln);font-size:.78rem;color:#8fa3d6}.lab-real-pie a{color:#9cc2ff;text-decoration:none}
.lab-sec{animation:lab-ent .35s ease}@keyframes lab-ent{from{opacity:0;transform:translateY(8px)}}
.lab-doble{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,1fr);gap:22px;margin-top:22px;align-items:start}
.lab-lista-pasos{display:grid;gap:14px}.lab-paso-c{display:grid;grid-template-columns:48px 1fr;gap:16px;border:1px solid var(--ln);border-left:4px solid var(--c);border-radius:18px;background:rgba(8,18,48,.78);padding:18px 20px}
.lab-num{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:1.1rem;color:#06102a;background:var(--c);box-shadow:0 0 16px color-mix(in srgb,var(--c) 60%,transparent)}
.lab-paso-c h3{font-size:1.05rem;color:var(--c);margin-bottom:5px}.lab-paso-c p{font-size:.92rem;line-height:1.6;color:#cdd9f7}
.lab-btn-sec{margin-top:12px;border:1px solid #2a4aa5;background:#0e2457;border-radius:10px;padding:9px 14px;font-size:.84rem;font-weight:600;color:#dbe6ff}.lab-btn-sec:hover{background:#17388a}
.lab-regla{border:1px solid var(--ln);border-radius:20px;background:rgba(8,18,48,.78);padding:20px;display:grid;gap:12px;position:sticky;top:16px}.lab-regla h3{font-size:1.05rem}.lab-regla article{border:1px solid #1f3a85;border-radius:14px;padding:14px;background:#0a1534}.lab-regla b{color:var(--c);letter-spacing:.06em;font-size:.82rem}.lab-regla p{font-size:.86rem;line-height:1.5;color:#b9c9f2;margin-top:4px}
.lab-bloque{margin-top:22px}.lab-bloque h2{font-size:1.15rem;margin-bottom:12px}
.lab-tabla{border:1px solid var(--ln);border-radius:18px;overflow:hidden;background:rgba(8,18,48,.78)}.lab-tr{display:grid;grid-template-columns:150px repeat(auto-fit,minmax(0,1fr));border-top:1px solid #16306f}.lab-tr:first-child{border-top:0}
.lab-th{background:#0b1c4a}.lab-th b{padding:14px 16px;color:var(--c);font-size:.95rem}.lab-tr p,.lab-rotulo{padding:13px 16px;font-size:.88rem;line-height:1.5;color:#cdd9f7}.lab-rotulo{color:#8fa8e6;font-weight:600;font-size:.8rem;letter-spacing:.04em}
.lab-quiz{max-width:720px;margin:26px auto 0;border:1px solid var(--ln);border-radius:22px;background:rgba(8,18,48,.78);padding:24px}
.lab-quiz-top{display:flex;justify-content:space-between;font-size:.8rem;color:var(--mu)}.lab-quiz-barra{height:8px;border-radius:99px;background:#112456;margin:10px 0 18px;overflow:hidden}.lab-quiz-barra i{display:block;height:100%;background:linear-gradient(90deg,#2f7bff,#1fd6a5);transition:width .4s}
.lab-quiz h2{font-size:1.3rem;line-height:1.35;margin-bottom:16px}.lab-quiz-ops{display:grid;gap:10px}.lab-quiz-ops button{display:flex;gap:12px;align-items:center;text-align:left;border:1px solid #234488;background:#0a1534;border-radius:14px;padding:14px;font-size:.95rem;color:#e5eeff}
.lab-quiz-ops button b{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:#16306f;font-size:.8rem;flex:0 0 28px}.lab-quiz-ops button:hover:not(:disabled){border-color:#4a8dff}.lab-quiz-ops button:disabled{cursor:default}
.lab-quiz-ops .bien{border-color:#1fd6a5;background:#0b3a35}.lab-quiz-ops .bien b{background:#1fd6a5;color:#04251f}.lab-quiz-ops .mal{border-color:#ff5d7a;background:#40142a}.lab-quiz-ops .mal b{background:#ff5d7a;color:#2a0612}
.lab-quiz-fb{margin-top:16px;display:grid;gap:12px}.lab-quiz-fb p{font-size:.92rem;line-height:1.55;color:#cdd9f7}.lab-quiz-fb .ok::first-line{color:#1fd6a5;font-weight:700}.lab-quiz-fb .no::first-line{color:#ff8ba0;font-weight:700}
.lab-btn{border:0;border-radius:12px;padding:13px 20px;font-weight:700;background:linear-gradient(180deg,#3b82ff,#2a63e6);color:#fff;justify-self:start;box-shadow:0 0 18px #2f7bff55}
.lab-quiz-fin{text-align:center;display:grid;gap:12px;justify-items:center;padding:12px 0}.lab-quiz-medalla{font-size:3rem}.lab-quiz-fin p{color:#b9c9f2}

/* ===== Celular: composición propia ===== */
@media(max-width:1100px){.lab-tarjetas{grid-template-columns:1fr 1fr}.lab-tarjetas .lab-tarj:last-child{grid-column:1/-1}.lab-doble{grid-template-columns:1fr}.lab-regla{position:static}}
@media(max-width:900px){.lab-cab{grid-template-columns:auto 1fr}.lab-tabs{grid-column:1/-1;justify-self:start;max-width:100%;overflow-x:auto}.lab-vista{grid-template-columns:1fr}.lab-panel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.lab-grupo{border-bottom:0}}
@media(max-width:760px){
  .lab2{padding:12px 14px calc(92px + env(safe-area-inset-bottom));clip-path:none;box-shadow:none;max-width:none}
  .lab-cab{grid-template-columns:auto 1fr;gap:10px}.lab-volver span{display:none}.lab-volver{padding:9px 12px}
  .lab-tit svg{width:34px;height:34px}.lab-tit h1{font-size:1.15rem}.lab-tit h2{font-size:.92rem}.lab-marca{font-size:.62rem}
  .lab-tabs{position:fixed;left:0;right:0;bottom:0;z-index:60;border-radius:20px 20px 0 0;border-width:1px 0 0;padding:6px 8px calc(6px + env(safe-area-inset-bottom));justify-content:space-around;background:rgba(5,12,34,.97);backdrop-filter:blur(12px);box-shadow:0 -10px 30px #0008;overflow:visible;max-width:none;justify-self:stretch}
  .lab-tab{flex:1;flex-direction:column;gap:2px;padding:7px 4px;font-size:.68rem;border-radius:14px}.lab-tab .ic{display:block;font-size:1.25rem;line-height:1}
  .lab-intro{font-size:.88rem;margin:10px 0 12px}
  .lab-vista{gap:10px}
  .lab-panel{display:flex;flex-direction:column;gap:8px;padding:10px;border-radius:16px}
  .lab-grupo{padding:0}.lab-grupo>summary{display:none}
  .lab-capas{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:none;margin:0 -2px}.lab-capas::-webkit-scrollbar{display:none}
  .lab-capas .lab-capa-op{flex:0 0 auto;border:1px solid #234488;background:#0a1534;border-radius:99px;padding:8px 12px;font-size:.78rem;gap:7px;white-space:nowrap}
  .lab-capas .lab-capa-op span{flex:0 0 auto}.lab-capas .lab-sw{display:none}.lab-capas .lab-punto{width:10px;height:10px;flex-basis:10px;opacity:.35;box-shadow:none}
  .lab-capas .lab-capa-op:has(input:checked){border-color:var(--c);background:color-mix(in srgb,var(--c) 18%,#06102a)}.lab-capas .lab-capa-op:has(input:checked) .lab-punto{opacity:1;box-shadow:0 0 8px var(--c)}
  .lab-modos{grid-template-columns:repeat(3,1fr);gap:6px;background:#0a1534;border:1px solid #234488;border-radius:14px;padding:4px}.lab-modos button{flex-direction:column;gap:2px;border:0;background:transparent;padding:8px 2px;font-size:.7rem;text-align:center;border-radius:11px;box-shadow:none!important}.lab-modos button i{width:auto;font-size:1.05rem}.lab-modos button.act{background:#1a47a8}
  .lab-anim{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.lab-anim .lab-paso-sw{border:1px solid #234488;background:#0a1534;border-radius:12px;padding:6px 10px;font-size:.82rem}.lab-reiniciar{width:auto;margin:0;padding:11px 14px;font-size:.82rem}.lab-play{width:26px;height:26px;flex-basis:26px}
  .lab-escena{min-height:0;margin:0 -6px;border-radius:16px;background:radial-gradient(circle at 50% 40%,#0c1f58 0,#050d28 75%);border:1px solid var(--ln)}.lab-svg{max-height:340px}.lab-escena.lateral .lab-svg{transform:rotateY(-18deg) rotateX(5deg) scale(.9)}
  .lab-leyenda-cel{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.lab-leyenda-cel button{display:flex;align-items:center;gap:9px;border:1px solid #234488;background:#0a1534;border-radius:12px;padding:9px 10px;font-size:.76rem;text-align:left;color:#d3def9;line-height:1.2}.lab-leyenda-cel button b{width:22px;height:22px;flex:0 0 22px;border-radius:50%;display:grid;place-items:center;color:#06102a;font-size:.76rem}.lab-leyenda-cel button.sel{border-color:#fff;background:#12306e}
  .lab-detalle{padding:12px 14px}.lab-detalle h3{font-size:1.02rem}.lab-detalle p{font-size:.86rem}
  .lab-tarjetas{grid-template-columns:1fr;gap:10px;margin-top:14px}.lab-tarjetas .lab-tarj:last-child{grid-column:auto}
  .lab-tarj{padding:0;border-radius:16px}.lab-tarj>summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:15px 16px}.lab-tarj>summary::after{content:'⌄';color:var(--mu);font-size:1.2rem;transition:transform .2s}.lab-tarj[open]>summary::after{transform:rotate(180deg)}.lab-tarj h3{font-size:1rem}
  .lab-tarj-cuerpo{margin:0;padding:0 16px 16px}.lab-elem{grid-template-columns:20px 1fr;grid-template-areas:'i b' '. s';gap:2px 10px}.lab-elem i{grid-area:i}.lab-elem b{grid-area:b}.lab-elem span{grid-area:s}
  .lab-pie{position:sticky;bottom:calc(76px + env(safe-area-inset-bottom));z-index:40;flex-direction:column-reverse;align-items:stretch;gap:8px;margin-top:14px}
  .lab-clave{border-radius:16px;padding:10px 14px;background:rgba(6,14,40,.97);backdrop-filter:blur(8px);gap:10px}.lab-clave p{font-size:.74rem;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.lab-bombilla{font-size:1.1rem}.lab-capas,.lab-modos,.lab-anim{min-width:0}
  .lab-pager{justify-content:space-between;background:rgba(6,14,40,.97);border:1px solid var(--ln);border-radius:16px;padding:6px}.lab-pager button{width:46px;height:38px;border-radius:11px;font-size:1.4rem}.lab-pie:not(.con-paso) .lab-clave{display:none}.lab-pie{bottom:calc(72px + env(safe-area-inset-bottom))}
  .lab-real>summary{padding:14px 16px;font-size:.92rem}.lab-real>p{padding:0 16px 12px}.lab-real-view pdbe-molstar{height:380px!important}
  .lab-paso-c{grid-template-columns:38px 1fr;gap:12px;padding:14px}.lab-num{width:36px;height:36px;font-size:.95rem}.lab-btn-sec{width:100%}
  .lab-tr{grid-template-columns:1fr}.lab-th{display:none}.lab-rotulo{background:#0b1c4a;padding:9px 14px}.lab-tr p{padding:10px 14px;border-top:1px solid #16306f}.lab-tr p::before{content:attr(data-l);display:block;font-size:.7rem;letter-spacing:.05em;font-weight:700;color:var(--c);margin-bottom:2px}
  .lab-quiz{margin-top:12px;padding:16px;border-radius:18px}.lab-quiz h2{font-size:1.1rem}.lab-quiz-ops button{padding:12px}
}

/* Integración del módulo lac/trp/ferritina dentro del laboratorio nuevo */
.lab2 .op-wrap{max-width:1100px;padding:10px 0 24px;min-height:0;background:transparent;box-shadow:none;clip-path:none;color:var(--tx)}
.lab2 .op-head,.lab2 .op-card{border-color:var(--ln);background:rgba(8,18,48,.78)}
.lab2 .op-head{background:linear-gradient(135deg,rgba(47,123,255,.18),rgba(8,18,48,.92))}
.lab2 .op-kicker{color:#72a8ff}
.lab2 .op-muted,.lab2 .op-list{color:#b9c9f2}
.lab2 .op-tab,.lab2 .op-choice button,.lab2 .op-answer{border-color:#234488;background:#0a1534;color:#eaf1ff}
.lab2 .op-tab[aria-pressed=true],.lab2 .op-primary{background:linear-gradient(180deg,#3b82ff,#2a63e6);color:#fff}
.lab2 .op-choice button[aria-pressed=true]{border-color:#4a8dff;background:#12306e;box-shadow:inset 0 0 0 1px #4a8dff}
.lab2 .op-diagram,.lab2 .op-score div{background:#040a1c;border-color:#234488}
.lab2 .op-gene{background:rgba(47,123,255,.14);border-color:#3d8bff}
.lab2 .op-prom{border-color:#ffc23d;background:rgba(255,194,61,.12)}
.lab2 .op-oper{border-color:#ff7aa8;background:rgba(255,122,168,.12)}
.lab2 .op-struct{border-color:#1fd6a5;background:rgba(31,214,165,.1)}
.lab2 .op-status{border-color:rgba(31,214,165,.45);background:rgba(31,214,165,.08)}
.lab2 .op-status.warn{border-color:rgba(255,194,61,.5);background:rgba(255,194,61,.08)}
.lab2 .op-pill{background:rgba(47,123,255,.18)}
.lab2 .op-feedback{border-color:#234488;background:#0a1534}
.lab2 .op-answer.good{border-color:#1fd6a5;background:#0b3a35}
.lab2 .op-answer.bad{border-color:#ff5d7a;background:#40142a}
.lab2 .op-score b{color:#72a8ff}
.lab2 .op-hairpins span.active{border-color:#ffc23d;background:rgba(255,194,61,.12)}
.lab2 .op-genes{gap:.3rem}
@media(max-width:760px){.lab2 .op-wrap{padding:4px 0 18px}.lab2 .op-tabs{position:static;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible;border-radius:16px;border-width:1px;padding:5px;background:#081433;box-shadow:none}.lab2 .op-tab{font-size:.72rem;flex-direction:row;justify-content:center}.lab2 .op-card{padding:.85rem}.lab2 .op-genes{grid-template-columns:repeat(5,minmax(0,1fr))}.lab2 .op-gene{font-size:.62rem}}


/* Pulido visual de la primera sección: jerarquía, profundidad y legibilidad */
.lab2{--ln:#24468f;--ln2:#477cf4;background:radial-gradient(ellipse at 57% 18%,rgba(27,76,174,.16),transparent 46%),radial-gradient(ellipse at 92% 65%,rgba(112,62,220,.10),transparent 35%),#040a1c}
.lab2 .lab-cab{gap:20px}
.lab2 .lab-tit{align-items:flex-start}
.lab2 .lab-tit>svg{filter:drop-shadow(0 0 10px #9b6dff66);flex:none}
.lab2 .lab-intro{max-width:62ch;color:#b9c9f2;font-size:.96rem;letter-spacing:.005em}
.lab2 .lab-tabs{border-color:#203a7c;background:rgba(8,18,48,.86);box-shadow:0 8px 28px #02061655,inset 0 1px #ffffff08}
.lab2 .lab-tab{padding:10px 19px;font-size:.88rem;transition:background .2s,color .2s,transform .2s}
.lab2 .lab-tab.act{background:linear-gradient(135deg,#5268ff,#344ce8);box-shadow:0 5px 18px #334cff55,inset 0 1px #ffffff35}
.lab2 .lab-panel,.lab2 .lab-tarj,.lab2 .lab-detalle,.lab2 .lab-real,.lab2 .lab-regla,.lab2 .lab-paso-c,.lab2 .lab-tabla,.lab2 .lab-quiz{background:linear-gradient(145deg,rgba(8,20,49,.96),rgba(5,13,34,.96));border-color:#203c7f;box-shadow:0 10px 30px #00000016,inset 0 1px #ffffff05}
.lab2 .lab-panel{border-radius:18px;padding:14px 15px}
.lab2 .lab-grupo{border-color:#1b3268}
.lab2 .lab-capa-op{padding:9px 3px;font-size:.85rem}
.lab2 .lab-punto{box-shadow:0 0 12px color-mix(in srgb,var(--c) 48%,transparent)}
.lab2 .lab-modos button{transition:all .18s ease}
.lab2 .lab-modos button.act{background:linear-gradient(110deg,#143b87,#10275d);box-shadow:inset 0 0 0 1px #4a8dff,0 4px 14px #0003}
.lab2 .lab-escena{background:radial-gradient(ellipse at 50% 48%,rgba(19,48,112,.25),transparent 58%);border-radius:22px}
.lab2 .lab-svg{filter:drop-shadow(0 10px 20px #0002)}
.lab2 .lab-svg .lab-parte{transition:filter .2s,opacity .35s}
.lab2 .lab-svg .lab-parte:hover,.lab2 .lab-svg .lab-parte:focus-visible{filter:brightness(1.18) drop-shadow(0 0 8px #8fbaff77)}
.lab2 .lab-detalle{border-radius:16px;padding:16px 19px;box-shadow:inset 3px 0 0 color-mix(in srgb,var(--c,#2f7bff) 30%,transparent)}
.lab2 .lab-detalle h3{letter-spacing:-.015em}
.lab2 .lab-tarjetas{gap:16px;margin-top:18px}
.lab2 .lab-tarj{border-radius:18px;padding:17px 18px}
.lab2 .lab-tarj h3{letter-spacing:-.02em}
.lab2 .lab-fila-f{grid-template-columns:42px 1fr;gap:12px}
.lab2 .lab-ic{width:42px;height:42px;font-size:1.15rem}
.lab2 .lab-elem{padding:9px 7px;transition:background .16s,border-color .16s}
.lab2 .lab-elem span{font-size:.77rem;line-height:1.45}
.lab2 .lab-tipos{background:rgba(5,14,37,.55)}
.lab2 .lab-clave{background:linear-gradient(110deg,rgba(8,20,49,.96),rgba(6,15,38,.94));box-shadow:0 6px 20px #0002}
.lab2 .lab-pager button{transition:transform .15s,background .15s,border-color .15s;box-shadow:inset 0 1px #ffffff10}
.lab2 .lab-pager button:hover:not(:disabled){transform:translateY(-2px);border-color:#709cff}
.lab2 .lab-btn,.lab2 .lab-btn-sec,.lab2 .lab-reiniciar{transition:transform .15s,filter .15s,background .15s}
.lab2 .lab-btn:hover,.lab2 .lab-btn-sec:hover,.lab2 .lab-reiniciar:hover{filter:brightness(1.12);transform:translateY(-1px)}
.lab2 button:focus-visible,.lab2 summary:focus-visible,.lab2 .lab-elem:focus-visible{outline:2px solid #91baff;outline-offset:3px}
@media(min-width:1101px){
 .lab2 .lab-vista{grid-template-columns:238px minmax(0,1fr);gap:20px}
 .lab2 .lab-escena{min-height:320px}
 .lab2 .lab-svg{max-height:530px}
 .lab2 .lab-tarjetas{grid-template-columns:1.05fr 1fr .95fr}
}
@media(max-width:760px){
 .lab2 .lab-intro{font-size:.86rem;line-height:1.55}
 .lab2 .lab-panel{box-shadow:0 8px 24px #0002}
 .lab2 .lab-escena{box-shadow:inset 0 1px #ffffff08,0 10px 24px #0002}
 .lab2 .lab-tarj{box-shadow:0 8px 22px #0002}
 .lab2 .lab-clave{border-color:#3155a1}
}

/* Rediseño de la escena principal: más aire, rótulos legibles y paneles definidos */
.lab2{--ln:#254581;--ln2:#477cf4;background:radial-gradient(ellipse at 58% 24%,rgba(28,72,166,.18),transparent 48%),radial-gradient(ellipse at 95% 68%,rgba(107,60,213,.10),transparent 36%),#040a1c}
.lab2 .lab-cab{grid-template-columns:auto minmax(260px,1fr);gap:18px 20px}
.lab2 .lab-tabs{grid-column:1/-1;justify-self:end;max-width:100%;border-color:#233d7b;background:rgba(8,18,48,.94);box-shadow:0 8px 26px #0003,inset 0 1px #ffffff08}
.lab2 .lab-tab{padding:10px 20px;font-size:.88rem}
.lab2 .lab-tab.act{background:linear-gradient(135deg,#5268ff,#344ce8);box-shadow:0 5px 18px #334cff55,inset 0 1px #ffffff35}
.lab2 .lab-intro{max-width:66ch;margin:15px 0 18px;font-size:.96rem;line-height:1.65;color:#bdcffa}
.lab2 .lab-vista{grid-template-columns:225px minmax(0,1fr);gap:20px}
.lab2 .lab-panel,.lab2 .lab-tarj,.lab2 .lab-detalle,.lab2 .lab-real,.lab2 .lab-quiz{background:linear-gradient(145deg,rgba(9,21,51,.98),rgba(5,13,33,.98));border-color:#233f7d;box-shadow:0 10px 28px #0002,inset 0 1px #ffffff06}
.lab2 .lab-panel{border-radius:18px;padding:14px}
.lab2 .lab-grupo{border-color:#1a3267}
.lab2 .lab-capa-op{padding:9px 2px;font-size:.82rem}
.lab2 .lab-modos button{padding:10px;border-radius:11px;transition:background .18s,border-color .18s}
.lab2 .lab-modos button.act{background:linear-gradient(110deg,#173e8b,#10275d);box-shadow:inset 0 0 0 1px #548cff}
.lab2 .lab-escena{min-height:0;overflow:hidden;border:1px solid #1c3979;border-radius:20px;background:radial-gradient(ellipse at 50% 44%,rgba(19,48,112,.3),rgba(4,10,28,.1) 68%);box-shadow:inset 0 1px #ffffff08,0 12px 30px #0002}
.lab2 .lab-svg{width:100%;height:auto;max-height:none;filter:drop-shadow(0 8px 20px #0002)}
.lab2 .lab-svg .lab-etq rect{fill:rgba(5,13,34,.94);stroke-width:2.3}
.lab2 .lab-svg .lab-etq text{paint-order:stroke;stroke:rgba(4,10,28,.35);stroke-width:.6px}
.lab2 .lab-svg .lab-parte{transition:filter .2s,opacity .25s}
.lab2 .lab-svg .lab-parte:hover,.lab2 .lab-svg .lab-parte:focus-visible{filter:brightness(1.18) drop-shadow(0 0 9px #8fbaff77)}
.lab2 .lab-detalle{margin-top:12px;padding:15px 18px;border-radius:15px;border-left:4px solid var(--c,#2f7bff)}
.lab2 .lab-detalle h3{font-size:1.12rem;letter-spacing:-.015em}
.lab2 .lab-detalle p{max-width:85ch}
.lab2 .lab-tarjetas{grid-template-columns:1.05fr 1fr .95fr;gap:14px;margin-top:16px}
.lab2 .lab-tarj{padding:16px;border-radius:17px}
.lab2 .lab-tarj h3{font-size:1rem;line-height:1.35}
.lab2 .lab-fila-f{grid-template-columns:38px 1fr;gap:11px}
.lab2 .lab-ic{width:38px;height:38px;font-size:1.05rem}
.lab2 .lab-fila-f h4{font-size:.94rem}
.lab2 .lab-fila-f p{font-size:.81rem;line-height:1.55}
.lab2 .lab-elem{grid-template-columns:20px minmax(0,1fr);grid-template-areas:'i b' '. s';gap:3px 9px;padding:8px;border-radius:10px}
.lab2 .lab-elem i{grid-area:i;width:17px;height:17px}
.lab2 .lab-elem b{grid-area:b;font-size:.8rem}
.lab2 .lab-elem span{grid-area:s;padding-left:26px;font-size:.75rem;line-height:1.45}
.lab2 .lab-tipos{background:rgba(4,12,32,.55)}
.lab2 .lab-pie{margin-top:16px}
.lab2 .lab-clave{border-radius:16px;background:linear-gradient(110deg,rgba(9,21,51,.98),rgba(5,13,33,.98));box-shadow:0 7px 22px #0002}
.lab2 .lab-pager button{transition:transform .15s,background .15s,border-color .15s;box-shadow:inset 0 1px #ffffff10}
.lab2 .lab-pager button:hover:not(:disabled){transform:translateY(-2px);border-color:#7da4ff}
.lab2 .lab-btn,.lab2 .lab-btn-sec,.lab2 .lab-reiniciar{transition:transform .15s,filter .15s}
.lab2 .lab-btn:hover,.lab2 .lab-btn-sec:hover,.lab2 .lab-reiniciar:hover{filter:brightness(1.12);transform:translateY(-1px)}
.lab2 .lab-real-view{position:relative;overflow:hidden;isolation:isolate;overscroll-behavior:contain}
.lab2 .lab-real-view pdbe-molstar{position:relative!important;inset:auto!important;display:block!important;width:100%!important;max-width:100%!important;height:480px!important;min-height:320px;z-index:0!important;touch-action:pan-y}
.lab2 .lab-real-view canvas{max-width:100%}
.lab2 .lab-real[open]{overflow:visible}
.lab2 button:focus-visible,.lab2 summary:focus-visible,.lab2 .lab-elem:focus-visible{outline:2px solid #91baff;outline-offset:3px}
@media(min-width:1101px){
 .lab2 .lab-vista{grid-template-columns:225px minmax(0,1fr);gap:20px}
 .lab2 .lab-escenario{min-width:0}
 .lab2 .lab-tarjetas{grid-template-columns:1.02fr 1fr .98fr}
}
@media(max-width:1100px){.lab2 .lab-tarjetas{grid-template-columns:1fr 1fr}.lab2 .lab-tarjetas .lab-tarj:last-child{grid-column:1/-1}}
@media(max-width:900px){
 .lab2 .lab-cab{grid-template-columns:auto minmax(0,1fr)}
 .lab2 .lab-tabs{grid-column:1/-1;justify-self:start}
 .lab2 .lab-vista{grid-template-columns:1fr}
 .lab2 .lab-panel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
}
@media(max-width:760px){
 .lab2 .lab-cab{grid-template-columns:auto minmax(0,1fr);gap:10px}
 .lab2 .lab-tabs{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;justify-content:space-around;overflow:visible;max-width:none;grid-column:1/-1;justify-self:stretch}
 .lab2 .lab-tab{flex:1;padding:7px 3px;font-size:.66rem}
 .lab2 .lab-panel{display:flex;flex-direction:column;gap:8px}
 .lab2 .lab-escena{margin:0;border-radius:16px}
 .lab2 .lab-svg{width:100%;max-height:370px}
 .lab2 .lab-tarjetas{grid-template-columns:1fr;gap:10px}
 .lab2 .lab-tarjetas .lab-tarj:last-child{grid-column:auto}
 .lab2 .lab-elem{grid-template-columns:20px 1fr;grid-template-areas:'i b' '. s'}
 .lab2 .lab-elem span{padding-left:27px}
 .lab2 .lab-real-view pdbe-molstar{height:420px!important;touch-action:pan-y}
}

.lab2 .lab-vista{grid-template-columns:minmax(0,1fr);gap:14px}
.lab2 .lab-escena{border:1px solid #1b3978;border-radius:20px;background:radial-gradient(ellipse at 51% 43%,rgba(28,68,145,.27),rgba(4,10,28,.12) 66%);box-shadow:inset 0 1px #ffffff0a,0 14px 32px #0003}
.lab2 .lab-svg{width:100%;max-height:none}
.lab2 .lab-svg .lab-leader{fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.92}
.lab2 .lab-svg .lab-etq rect{filter:drop-shadow(0 5px 12px #0004)}
.lab2 .lab-svg .lab-etq[data-part],.lab2 .lab-svg .lab-etq[data-capa]{cursor:pointer}
.lab2 .lab-svg [data-part].sel{filter:drop-shadow(0 0 10px #fff9)}
.lab2 .lab-detalle{margin-top:12px}
.lab2 .lab-detalle:not(.hay){display:none}
.lab2 .lab-tarjetas{margin-top:18px;gap:14px}
.lab2 .lab-tarj{border-radius:17px}

/* ===== Diseño de referencia (PC y tablet): réplica de la imagen del laboratorio de transcripción ===== */
@media(min-width:761px){
 .lab2{padding:20px 22px 44px;background:radial-gradient(ellipse at 56% 22%,rgba(27,70,160,.20),transparent 50%),radial-gradient(ellipse at 96% 66%,rgba(104,58,210,.11),transparent 38%),#040a1f}
 .lab2 .lab-cab{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px 24px}
 .lab2 .lab-tit{display:flex;align-items:center;gap:14px}
 .lab2 .lab-tit>svg{width:48px;height:52px;flex:none;filter:drop-shadow(0 0 10px #9b6dff66)}
 .lab2 .lab-tit h1{font-size:clamp(1.45rem,2.2vw,1.72rem);font-weight:700;letter-spacing:-.01em;line-height:1.12;color:#e3ebff}
 .lab2 .lab-tit h2{margin-top:1px;font-size:clamp(1.05rem,1.6vw,1.3rem);font-weight:600;line-height:1.2;color:#cfdbff}
 .lab2 .lab-volver{display:grid;place-items:center;width:34px;height:34px;padding:0;flex:none;border-radius:50%;font-size:1rem;line-height:1;border-color:#27458f;background:#0a1a42}
 .lab2 .lab-tabs{grid-column:auto;justify-self:auto;padding:6px;border-color:#25418a;background:rgba(8,20,54,.92)}
 .lab2 .lab-tab{padding:10px 23px;font-size:.92rem}
 .lab2 .lab-tab.act{background:linear-gradient(180deg,#3f66ff,#2f4de6);box-shadow:0 0 22px #3b5bff77,inset 0 1px #ffffff40}
 .lab2 .lab-intro{max-width:33em;margin:14px 0 20px;font-size:.88rem;line-height:1.5;color:#b6c8f4}

 .lab2 .lab-panel{padding:10px 13px 14px;border-radius:22px;border-color:#27458f}
 .lab2 .lab-grupo{padding:9px 0}
 .lab2 .lab-grupo>summary{padding:2px 0 7px;font-size:.84rem}
 .lab2 .lab-capa-op{padding:6.5px 2px;gap:8px;font-size:.8rem}
 .lab2 .lab-punto{width:14px;height:14px;flex:0 0 14px}
 .lab2 .lab-capa-op input:not(:checked)+.lab-punto{opacity:.45;box-shadow:none}
 .lab2 .lab-sw{width:32px;height:19px;flex:0 0 32px}
 .lab2 .lab-sw::after{top:2.5px;left:2.5px;width:14px;height:14px}
 .lab2 .lab-capa-op input:checked~.lab-sw::after{transform:translateX(13px)}
 .lab2 .lab-modos{gap:6px}
 .lab2 .lab-modos button{padding:8px 10px;border-radius:10px;font-size:.82rem}
 .lab2 .lab-play{width:28px;height:28px;flex:0 0 28px}
 .lab2 .lab-reiniciar{margin-top:6px;padding:8px;border-radius:11px;font-size:.85rem;background:#13306f}

 .lab2 .lab-escena{border:0;border-radius:0;background:none;box-shadow:none;overflow:visible}
 .lab2 .lab-svg{filter:none;max-height:none}
 .lab2 .lab-svg .lab-leader{stroke-width:1.5}
 .lab2 .lab-svg .lab-etq rect{filter:none}
 .lab2 .lab-detalle{margin-top:6px}

 .lab2 .lab-tarjetas{margin-top:22px;gap:18px}
 .lab2 .lab-tarj{padding:16px 20px;border-radius:16px;border-color:#25438c}
 .lab2 .lab-tarj h3{font-size:.94rem;letter-spacing:-.01em}
 .lab2 .lab-tarj-cuerpo{margin-top:14px;gap:16px}
 .lab2 .lab-fila-f{grid-template-columns:42px 1fr;gap:12px}
 .lab2 .lab-ic{width:42px;height:42px;font-size:1rem;border:2px solid color-mix(in srgb,var(--c) 55%,#fff);background:radial-gradient(circle at 35% 28%,color-mix(in srgb,var(--c) 92%,#fff),color-mix(in srgb,var(--c) 78%,#000));box-shadow:0 0 16px color-mix(in srgb,var(--c) 45%,transparent)}
 .lab2 .lab-fila-f h4{margin-bottom:3px;font-size:.98rem}
 .lab2 .lab-fila-f p{font-size:.81rem;line-height:1.5;color:#a9c1f2}
 .lab2 .lab-fila-f p b{color:#eaf1ff;font-weight:600}
 .lab2 .lab-fila-f u{text-decoration-thickness:1px;text-underline-offset:2px}
 .lab2 .lab-elems{gap:0}
 .lab2 .lab-elem{display:grid;grid-template-columns:30px 92px minmax(0,1fr);grid-template-areas:none;gap:0 10px;align-items:center;min-height:48px;padding:5px 4px;border-radius:12px}
 .lab2 .lab-elem i{grid-area:auto;width:27px;height:27px}
 .lab2 .lab-elem b{grid-area:auto;font-size:.67rem;line-height:1.25}
 .lab2 .lab-elem span{grid-area:auto;padding-left:0;font-size:.67rem;line-height:1.4;color:#b4c6ee}
 .lab2 .lab-esq{display:block;width:100%;height:auto;margin-top:0;overflow:visible}
 .lab2 .lab-tipos{margin-top:0;padding:11px 16px 12px;border-color:#25438c;border-radius:12px;background:rgba(5,14,38,.5)}
 .lab2 .lab-tipos h4{margin-bottom:8px;font-size:.88rem}
 .lab2 .lab-tipos b{margin-bottom:3px;font-size:.82rem}
 .lab2 .lab-tipos ul{font-size:.76rem}
 .lab2 .lab-tipos li{padding:1px 0 1px 19px}

 .lab2 .lab-pie{margin-top:20px;gap:24px;align-items:center}
 .lab2 .lab-clave{flex:0 1 58%;border-radius:999px;padding:12px 26px;border-color:#2b4a98;background:rgba(7,18,46,.9);box-shadow:none}
 .lab2 .lab-clave p{font-size:.78rem;line-height:1.5}
 .lab2 .lab-pager{margin-left:auto;gap:16px}
 .lab2 .lab-pager span{font-size:.86rem}
 .lab2 .lab-pager button{width:44px;height:44px;border-radius:12px;font-size:1.5rem;background:#10285e;border-color:#2f58b8}
}
@media(min-width:901px){.lab2 .lab-vista{grid-template-columns:224px minmax(0,1fr);gap:22px}}
@media(min-width:1101px){.lab2 .lab-tarjetas{grid-template-columns:1.2fr 1.1fr 1fr}}

.lab2 .lab-esq{max-width:560px;margin-left:auto;margin-right:auto}
@media(prefers-reduced-motion:reduce){.lab2 *{animation:none!important;transition:none!important}}

`;
}
