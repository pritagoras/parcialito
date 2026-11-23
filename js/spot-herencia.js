import { Sonido } from './sonido.js?v=dev';
import { estilosSpot } from './spot-fase.js?v=20261122-3';

// Juego "Herencia relámpago": tocar lo que te piden antes de que se acabe el tiempo.
//  · genealogía: encontrar portadoras, afectados o mujeres sin el alelo (herencia recesiva ligada al X).
//  · gametas:    encontrar las gametas posibles de un genotipo (segregación independiente).
// Se abre desde el banner del inicio.

export const TITULO_SPOT_HERENCIA = 'Herencia relámpago';

const CLAVE = 'parcialito-herencia-mejor-';

const css = `
.spfh-campo{width:100%}
.spfh-svg{display:block;width:100%;max-width:560px;margin:0 auto;touch-action:manipulation}
.spfh-nodo{cursor:pointer}
.spfh-msg{min-height:46px;margin-top:10px;text-align:center;font-weight:700;font-size:.9rem;line-height:1.35;padding:0 6px}
.spfh-leyenda{text-align:center;font-size:.74rem;color:var(--tenue);margin-top:4px}
.spfh-celda{transform-box:fill-box;transform-origin:center}
.spfh-celda.entra{animation:spfh-entra .5s cubic-bezier(.2,1.5,.4,1) both}
.spfh-celda.pop{animation:spfh-pop .4s cubic-bezier(.2,1.6,.4,1)}
@keyframes spfh-entra{from{opacity:0;transform:scale(.4) rotate(-6deg)}to{opacity:1;transform:none}}
@keyframes spfh-pop{0%{transform:scale(.88)}60%{transform:scale(1.07)}100%{transform:none}}
.spfh-clave{text-align:center;font-size:.74rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--violeta);margin-bottom:6px}
@media(prefers-reduced-motion:reduce){.spfh-celda.entra,.spfh-celda.pop{animation:none}}
`;

const COLORES = { crema: '#FFF3DC', ok: '#4FE0A0', mal: '#FF5D7A', ambar: '#FFB938' };

const elegir = (a) => a[Math.floor(Math.random() * a.length)];
function mezclar(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================ genealogías ============================ */
// Cada ronda genera una familia nueva (3 generaciones, herencia recesiva ligada al X).
// Lo que se pide se deduce solo del árbol: las "portadoras seguras", las "mujeres sin el alelo"
// (los que se incorporan a la familia se asumen sin el alelo) y las que "podrían ser portadoras".

const ENF = {
  hemofilia: { nombre: 'Hemofilia', icono: '🩸', color: '#e0314b', N: 'H', m: 'h' },
  daltonismo: { nombre: 'Daltonismo', icono: '🎨', color: '#2fb7a3', N: 'D', m: 'd' }
};
const SUP = { H: 'ᴴ', h: 'ʰ', D: 'ᴰ', d: 'ᵈ' };

const ordenAl = (a) => a.slice().sort((x, y) => (x === 'h' ? 1 : 0) - (y === 'h' ? 1 : 0));
const letra = (enf, al) => (al === 'H' ? ENF[enf].N : ENF[enf].m);
const xTxt = (enf, p) => (p.s === 'M' ? 'X' + SUP[letra(enf, p.al[0])] + 'Y' : p.al.map((a) => 'X' + SUP[letra(enf, a)]).join(''));
const xSvg = (enf, p) => (p.s === 'M'
  ? `X<tspan baseline-shift="super" font-size="7">${letra(enf, p.al[0])}</tspan>Y`
  : p.al.map((a) => `X<tspan baseline-shift="super" font-size="7">${letra(enf, a)}</tspan>`).join(''));

function hijosDe(padre, madre, n, prefijo, gen) {
  let sexos;
  do { sexos = Array.from({ length: n }, () => (Math.random() < 0.5 ? 'M' : 'F')); } while (new Set(sexos).size < 2);
  return sexos.map((s, i) => {
    const deMadre = elegir(madre.al);
    const al = s === 'M' ? [deMadre] : ordenAl([padre.al[0], deMadre]);
    const aff = s === 'M' ? al[0] === 'h' : al[0] === 'h' && al[1] === 'h';
    return { id: prefijo + (i + 1), s, al, aff, gen, padre: padre.id, madre: madre.id, cls: '' };
  });
}

function clasificar(personas) {
  const mapa = new Map(personas.map((p) => [p.id, p]));
  for (const p of personas) {
    if (p.s !== 'F' || p.aff) continue;
    const hijos = personas.filter((h) => h.madre === p.id);
    const padre = p.padre && mapa.get(p.padre), madre = p.madre && mapa.get(p.madre);
    if (padre && padre.aff) p.cls = 'car';
    else if (hijos.some((h) => h.s === 'M' && h.aff)) p.cls = 'car';
    else if (!padre) p.cls = 'libre';
    else p.cls = madre && madre.cls === 'libre' ? 'libre' : 'inc';
  }
}

function generarFamilia() {
  for (let intento = 0; intento < 500; intento++) {
    const esc = elegir(['A', 'A', 'B', 'C']);
    const padre = { id: 'I-1', s: 'M', al: [esc === 'A' ? 'H' : 'h'], aff: esc !== 'A', gen: 0, cls: '' };
    const madre = { id: 'I-2', s: 'F', al: esc === 'B' ? ['H', 'H'] : ['H', 'h'], aff: false, gen: 0, cls: '' };
    const hijos2 = hijosDe(padre, madre, Math.random() < 0.5 ? 3 : 4, 'II-', 1);
    const rep = elegir(hijos2);
    const cony = rep.s === 'M'
      ? { id: 'II-c', s: 'F', al: ['H', 'H'], aff: false, gen: 1, cls: '' }
      : { id: 'II-c', s: 'M', al: ['H'], aff: false, gen: 1, cls: '' };
    const [pa3, ma3] = rep.s === 'M' ? [rep, cony] : [cony, rep];
    const hijos3 = hijosDe(pa3, ma3, Math.random() < 0.5 ? 2 : 3, 'III-', 2);
    const personas = [padre, madre, ...hijos2, cony, ...hijos3];
    clasificar(personas);
    const mal = personas.some((p) => p.s === 'F' && !p.aff && ((p.cls === 'car') !== p.al.includes('h') && p.cls !== 'inc'));
    const n = (f) => personas.filter(f).length;
    if (mal || n((p) => p.aff) < 1 || n((p) => p.cls === 'car') < 1 || n((p) => p.cls === 'libre' || p.cls === 'inc') < 1) continue;
    // disposición
    const S = 58, y = [36, 118, 200];
    const slots = hijos2.length + 1, W = (slots - 1) * S, x0 = 170 - W / 2;
    let k = 0;
    const xs2 = hijos2.map((h) => { const x = x0 + k * S; k += h === rep ? 2 : 1; return x; });
    hijos2.forEach((h, i) => { h.x = xs2[i]; h.y = y[1]; });
    cony.x = rep.x + S; cony.y = y[1];
    const mitad2 = (xs2[0] + xs2[xs2.length - 1] + (rep === hijos2[hijos2.length - 1] ? 0 : 0)) / 2;
    padre.x = mitad2 - 34; madre.x = mitad2 + 34; padre.y = madre.y = y[0];
    const c3 = (rep.x + cony.x) / 2, W3 = (hijos3.length - 1) * S;
    const ini = Math.min(Math.max(c3 - W3 / 2, 28), 312 - W3);
    hijos3.forEach((h, i) => { h.x = ini + i * S; h.y = y[2]; });
    const familias = [[['I-1', 'I-2'], hijos2.map((h) => h.id)], [[pa3.id, ma3.id], hijos3.map((h) => h.id)]];
    return { personas, familias, esc };
  }
  return null;
}

function razonGenea(p, enf, mapa) {
  const t = xTxt(enf, p);
  if (p.s === 'M') return p.aff ? `${t}: varón afectado, recibió el X con el alelo de su madre` : `${t}: varón sano, tiene un solo X y no puede ser portador`;
  if (p.aff) return `${t}: mujer afectada, recibió el alelo de su padre y de su madre`;
  if (p.cls === 'car') {
    const padre = p.padre && mapa.get(p.padre);
    return padre && padre.aff
      ? `${t}: portadora segura, su padre afectado le dio su único X con el alelo y ella está sana`
      : `${t}: portadora segura, tiene un hijo afectado (le pasó su X con el alelo) y ella está sana`;
  }
  if (p.cls === 'libre') return p.padre ? `${t}: sin el alelo, su padre es sano y su madre no tiene el alelo` : `${t}: sin el alelo, se incorporó a la familia y se asume que no lo tiene`;
  return `${t} o ${xTxt(enf, { s: 'F', al: ['H', 'H'] })}: su madre es portadora y no hay datos para decidir; puede serlo (50 %), pero no se asegura`;
}

const OBJ_GENEA = {
  afectado: { txt: 'los afectados', es: (p) => p.aff },
  portadora: { txt: 'las portadoras seguras', es: (p) => p.cls === 'car' },
  libre: { txt: 'las mujeres sin el alelo', es: (p) => p.cls === 'libre' },
  inc: { txt: 'las que podrían ser portadoras (50 %)', es: (p) => p.cls === 'inc' }
};

/* ============================== gametas ============================== */

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'R', 'S', 'T', 'L'];

function productoCartesiano(listas) {
  return listas.reduce((acc, lista) => acc.flatMap((x) => lista.map((a) => x + a)), ['']);
}

function nuevoGenotipo(nivel) {
  const nGenes = nivel >= 3 && Math.random() < 0.5 ? 3 : 2;
  const letras = mezclar(LETRAS.slice()).slice(0, nGenes).sort();
  let tipos;
  do {
    tipos = letras.map(() => elegir(['het', 'het', 'homD', 'homR']));
  } while (!tipos.includes('het'));
  const genes = letras.map((L, i) => {
    const l = L.toLowerCase();
    if (tipos[i] === 'het') return { L, l, alelos: [L, l], gen: L + l };
    if (tipos[i] === 'homD') return { L, l, alelos: [L], gen: L + L };
    return { L, l, alelos: [l], gen: l + l };
  });
  return genes;
}

function distractores(genes, validas) {
  const cand = new Set();
  const orden = (partes) => partes.join('');
  genes.forEach((g) => cand.add(g.gen));
  cand.add(genes.map((g) => g.gen).join(''));
  genes.forEach((g) => g.alelos.forEach((a) => cand.add(a)));
  validas.forEach((v) => {
    genes.forEach((g, i) => {
      if (g.alelos.length === 1) {
        const otro = g.alelos[0] === g.L ? g.l : g.L;
        const partes = v.split('');
        partes[i] = otro;
        cand.add(orden(partes));
      }
    });
  });
  genes.forEach((gi, i) => {
    if (gi.alelos.length === 2) {
      validas.forEach((v) => {
        const partes = v.split('');
        partes[i] = gi.gen;
        cand.add(orden(partes));
      });
    }
  });
  if (genes.length === 3) {
    validas.forEach((v) => genes.forEach((_, i) => cand.add(v.split('').filter((__, j) => j !== i).join(''))));
  }
  const validasSet = new Set(validas);
  return mezclar([...cand].filter((c) => !validasSet.has(c)));
}

function razonGameta(txt, genes) {
  const cuenta = genes.map((g) => [...txt].filter((c) => c.toLowerCase() === g.L.toLowerCase()).length);
  const gDoble = genes.findIndex((g, i) => cuenta[i] === 2);
  if (gDoble >= 0) return 'Tiene los dos alelos del gen ' + genes[gDoble].L + ': en la meiosis se separan y cada gameta lleva uno solo.';
  const ajeno = [...txt].find((c) => !genes.some((g) => g.alelos.includes(c)));
  if (ajeno) return 'El alelo ' + ajeno + ' no está en este genotipo.';
  if (cuenta.some((n) => n === 0)) return 'Le falta un alelo: cada gameta lleva uno de cada gen.';
  return 'Esa combinación no se forma en este genotipo.';
}

/* =============================== juego =============================== */

const GUIAS = {
  genea: `
    <p><b>Símbolos:</b> cuadrado = varón, círculo = mujer, color = afectado. Es herencia recesiva ligada al X (hemofilia, daltonismo).</p>
    <p><b>Varones:</b> tienen un solo X (XY), así que están sanos o afectados. Nunca son portadores.</p>
    <p><b>Portadora segura:</b> mujer sana que sí o sí tiene un alelo afectado: la hija de un padre afectado, o la madre de un hijo afectado.</p>
    <p><b>Podría ser portadora:</b> hija sana de una madre portadora, sin más datos: 50 % de probabilidad, no se asegura.</p>
    <p><b>Sin el alelo:</b> hija de padre sano y madre sin el alelo. Los que se casan con la familia se asumen sin el alelo.</p>
    <p>Cada ronda es una familia nueva. Al tocar, se revela el genotipo (XᴴXʰ, XᴴY, etc.).</p>`,
  gametas: `
    <p><b>Meiosis:</b> cada gameta lleva un solo alelo de cada gen. Los alelos de un mismo gen se separan (Aa → A o a).</p>
    <p><b>Heterocigota:</b> da dos tipos de alelos para ese gen; homocigota (AA o aa), uno solo.</p>
    <p><b>Segregación independiente:</b> se forman todas las combinaciones posibles. AaBb da AB, Ab, aB y ab; AABb da AB y Ab.</p>
    <p><b>Cantidad de gametas distintas:</b> 2 elevado a la cantidad de genes heterocigotas.</p>`,
  dominancia: `<p><b>Cuadro de Punnett:</b> arriba y a la izquierda están las gametas de cada progenitor; cada casillero es un hijo posible. Tocá los que cumplan la consigna: primero ves el genotipo y al tocar se revela el fenotipo.</p><p><b>Dominancia completa:</b> el heterocigota expresa el fenotipo dominante (Yy × Yy da 3 amarillas : 1 verde).</p><p><b>Dominancia incompleta:</b> el heterocigota es intermedio: RR roja, RB rosa, BB blanca (1 : 2 : 1).</p><p><b>Codominancia:</b> el heterocigota expresa los dos alelos a la vez: RB es roja y blanca.</p>`,
  abo: `<p><b>Sistema ABO:</b> Iᴬ e Iᴮ son codominantes entre sí y ambos dominan sobre i.</p><p>IᴬIᴮ = grupo AB (antígenos A y B, sin anticuerpos). Iᴬ_ = grupo A (antígeno A, anticuerpos anti-B). Iᴮ_ = grupo B (antígeno B, anti-A). ii = grupo O (sin antígenos, anti-A y anti-B).</p><p>Cada casillero del cuadro es un hijo posible; tocalo para ver sus glóbulos rojos.</p>`,
  ligadaX: `<p><b>Herencia recesiva ligada al X:</b> en hemofilia usamos Xᴴ (normal) y Xʰ (alelo de hemofilia); en daltonismo, Xᴰ (normal) y Xᵈ (alelo de daltonismo).</p><p><b>Varones (XY):</b> tienen un solo X. Si ese X lleva el alelo recesivo, están afectados; no son portadores.</p><p><b>Mujeres (XX):</b> con un alelo recesivo son portadoras y, en el modelo recesivo clásico, no manifiestan el rasgo. Con dos alelos recesivos están afectadas.</p><p><b>Clave del cruce:</b> el padre transmite su X a todas las hijas y su Y a todos los hijos varones. Cada casillero representa una combinación posible de gametas.</p>`
};

/* ===== Cuadros de Punnett (dominancias y grupos sanguíneos) ===== */

const ORDEN = { completa: 'Yy', incompleta: 'RB', codominancia: 'RB', abo: 'ABi' };
const COLOR_ALELO = {
  Y: '#7b57e0', y: '#e8872a', R: '#e0314b', B: '#9aa6c4', A: '#3ea6ff', i: '#9aa0b5'
};
const CRUCES = {
  completa: [['Yy', 'Yy'], ['Yy', 'yy'], ['YY', 'yy'], ['YY', 'Yy']],
  incompleta: [['RB', 'RB'], ['RR', 'RB'], ['RB', 'BB'], ['RR', 'BB']],
  codominancia: [['RB', 'RB'], ['RR', 'RB'], ['RB', 'BB']],
  abo: [['Ai', 'Bi'], ['AB', 'ii'], ['Ai', 'Ai'], ['AB', 'Ai'], ['Bi', 'ii'], ['AB', 'AB'], ['Bi', 'Bi']]
};
const ENFERMEDADES_LIGADA_X = {
  hemofilia: { normal: 'Xᴴ', mutado: 'Xʰ', normalTexto: 'coagulación normal' },
  daltonismo: { normal: 'Xᴰ', mutado: 'Xᵈ', normalTexto: 'visión cromática habitual' }
};

// N = X normal; m = X con el alelo recesivo; Y = cromosoma Y.
const CRUCES_LIGADA_X = [
  { id: 'portadora-sano', madre: ['N', 'm'], padre: ['N', 'Y'] },
  { id: 'sana-afectado', madre: ['N', 'N'], padre: ['m', 'Y'] },
  { id: 'afectada-sano', madre: ['m', 'm'], padre: ['N', 'Y'] },
  { id: 'portadora-afectado', madre: ['N', 'm'], padre: ['m', 'Y'] }
];

function resultadoLigadaX(aleloMadre, aleloPadre, enfermedad) {
  const info = ENFERMEDADES_LIGADA_X[enfermedad];
  const varon = aleloPadre === 'Y';
  const cantidadMutados = Number(aleloMadre === info.mutado) + Number(aleloPadre === info.mutado);
  const afectado = varon ? aleloMadre === info.mutado : cantidadMutados === 2;
  const portadora = !varon && cantidadMutados === 1;
  const noPortadora = !varon && cantidadMutados === 0;
  const genotipo = varon ? aleloMadre + 'Y' : (aleloMadre === info.normal ? aleloMadre + aleloPadre : aleloPadre + aleloMadre);
  const sexo = varon ? 'M' : 'F';
  const fen = afectado ? (varon ? 'varón afectado' : 'mujer afectada') : portadora ? 'mujer portadora' : varon ? 'varón sano' : 'mujer sana no portadora';
  return { g: genotipo, sexo, afectado, portadora, noPortadora, fen };
}
const TITULO_CLAVE = {
  completa: 'Dominancia completa · semillas de arveja', incompleta: 'Dominancia incompleta · flor dondiego de noche',
  codominancia: 'Codominancia · flor roja y blanca', abo: 'Grupos sanguíneos ABO', ligadaX: 'Herencia recesiva ligada al X'
};
const LEYENDA = {
  completa: 'Y: amarilla (dominante) · y: verde (recesivo)',
  incompleta: 'R: roja · B: blanca · RB: rosa (intermedio)',
  codominancia: 'R: roja · B: blanca · RB: ambos colores a la vez',
  abo: '▲ antígeno A · ■ antígeno B · ii: sin antígenos', ligadaX: 'Arriba: gametas del padre · izquierda: gametas de la madre · Y no lleva el alelo del rasgo'
};

const normalizar = (clave, a, b) => [a, b].sort((x, y) => ORDEN[clave].indexOf(x) - ORDEN[clave].indexOf(y)).join('');

function fenotipo(clave, g) {
  if (clave === 'completa') return g.includes('Y') ? 'amarilla' : 'verde';
  if (clave === 'incompleta') return g === 'RR' ? 'roja' : g === 'BB' ? 'blanca' : 'rosa';
  if (clave === 'codominancia') return g === 'RR' ? 'roja' : g === 'BB' ? 'blanca' : 'roja y blanca';
  const a = g.includes('A'), b = g.includes('B');
  return a && b ? 'AB' : a ? 'A' : b ? 'B' : 'O';
}

const FEN_TXT = {
  completa: { amarilla: 'las semillas amarillas', verde: 'las semillas verdes' },
  incompleta: { roja: 'las flores rojas', rosa: 'las flores rosas', blanca: 'las flores blancas' },
  codominancia: { roja: 'las flores rojas', blanca: 'las flores blancas', 'roja y blanca': 'las flores de ambos colores' },
  abo: { A: 'los hijos del grupo A', B: 'los hijos del grupo B', AB: 'los hijos del grupo AB', O: 'los hijos del grupo O' }
};
const FEN_NOMBRE = {
  completa: { amarilla: 'semilla amarilla', verde: 'semilla verde' },
  incompleta: { roja: 'flor roja', rosa: 'flor rosa', blanca: 'flor blanca' },
  codominancia: { roja: 'flor roja', blanca: 'flor blanca', 'roja y blanca': 'flor roja y blanca' },
  abo: { A: 'grupo A', B: 'grupo B', AB: 'grupo AB', O: 'grupo O' }
};

const geno = (clave, g) => clave === 'abo'
  ? [...g].map((c) => (c === 'A' ? 'Iᴬ' : c === 'B' ? 'Iᴮ' : 'i')).join('') : g;
const alelo = (clave, c) => (clave === 'abo' ? (c === 'A' ? 'Iᴬ' : c === 'B' ? 'Iᴮ' : 'i') : c);

// Etiqueta SVG con superíndices reales para los alelos del sistema ABO.
function etiquetaSvg(clave, g, tam) {
  if (clave !== 'abo') return g;
  const s = Math.round(tam * 0.62);
  return [...g].map((c) => (c === 'i' ? 'i' : `I<tspan baseline-shift="super" font-size="${s}">${c}</tspan>`)).join('');
}

const ANTI = { A: 'anti-B', B: 'anti-A', AB: 'sin anticuerpos', O: 'anti-A y anti-B' };
const ANTIGENO = { A: 'antígeno A', B: 'antígeno B', AB: 'antígenos A y B', O: 'sin antígenos' };

function explicar(clave, g) {
  const f = fenotipo(clave, g), t = geno(clave, g), homo = g[0] === g[1];
  if (clave === 'completa') {
    return f === 'verde' ? t + ': homocigota recesivo, semilla verde'
      : t + (homo ? ': homocigota dominante, semilla amarilla' : ': heterocigota, Y domina sobre y, semilla amarilla');
  }
  if (clave === 'incompleta') {
    return f === 'rosa' ? t + ': heterocigota, fenotipo intermedio (rosa)' : t + ': homocigota, flor ' + f;
  }
  if (clave === 'codominancia') {
    return f === 'roja y blanca' ? t + ': heterocigota, se expresan los dos alelos a la vez' : t + ': homocigota, flor ' + f;
  }
  const por = f === 'AB' ? 'codominancia, expresa A y B' : f === 'O' ? 'sin alelos Iᴬ ni Iᴮ' : homo ? 'homocigota' : (f === 'A' ? 'Iᴬ' : 'Iᴮ') + ' domina sobre i';
  return t + ': grupo ' + f + ' (' + por + ' · ' + ANTIGENO[f] + ', ' + ANTI[f] + ')';
}

function explicarLigadaX(c) {
  if (c.sexo === 'M' && c.afectado) return c.g + ': varón afectado. Tiene un solo cromosoma X y recibió en él el alelo recesivo; no puede ser portador sano.';
  if (c.sexo === 'F' && c.afectado) return c.g + ': mujer afectada. Recibió el alelo recesivo en los dos cromosomas X.';
  if (c.portadora) return c.g + ': mujer portadora. Tiene un alelo normal y uno recesivo; en este modelo no manifiesta el rasgo.';
  if (c.sexo === 'M') return c.g + ': varón sano. Su único cromosoma X lleva el alelo normal.';
  return c.g + ': mujer sana no portadora. Sus dos cromosomas X llevan el alelo normal.';
}
function consignasPunnett(clave, celdas) {
  const fens = [...new Set(celdas.map((c) => c.fen))];
  const lista = fens.map((f) => ({ texto: FEN_TXT[clave][f], es: (c) => c.fen === f }));
  if (clave !== 'abo') {
    lista.push({ texto: 'los homocigotas', es: (c) => c.g[0] === c.g[1] });
    lista.push({ texto: 'los heterocigotas', es: (c) => c.g[0] !== c.g[1] });
  } else {
    lista.push({ texto: 'los que tienen antígeno A en sus glóbulos rojos', es: (c) => c.fen === 'A' || c.fen === 'AB' });
    lista.push({ texto: 'los que tienen antígeno B en sus glóbulos rojos', es: (c) => c.fen === 'B' || c.fen === 'AB' });
    lista.push({ texto: 'los que tienen anticuerpos anti-A en el plasma', es: (c) => c.fen === 'B' || c.fen === 'O' });
    lista.push({ texto: 'los que tienen anticuerpos anti-B en el plasma', es: (c) => c.fen === 'A' || c.fen === 'O' });
  }
  const buenas = lista.filter((l) => { const n = celdas.filter(l.es).length; return n > 0 && n < 4; });
  return buenas.length ? buenas : lista.filter((l) => celdas.some(l.es));
}

function consignasLigadaX(celdas) {
  const candidatas = [
    { texto: 'los hijos varones afectados', es: (c) => c.sexo === 'M' && c.afectado },
    { texto: 'los hijos varones sanos', es: (c) => c.sexo === 'M' && !c.afectado },
    { texto: 'las hijas portadoras', es: (c) => c.sexo === 'F' && c.portadora },
    { texto: 'las hijas afectadas', es: (c) => c.sexo === 'F' && c.afectado },
    { texto: 'las hijas sanas no portadoras', es: (c) => c.sexo === 'F' && c.noPortadora },
    { texto: 'los descendientes afectados', es: (c) => c.afectado },
    { texto: 'los descendientes que heredaron el alelo recesivo', es: (c) => c.afectado || c.portadora }
  ];
  return candidatas.filter((op) => {
    const n = celdas.filter(op.es).length;
    return n > 0 && n < celdas.length;
  });
}
/* ---- dibujo de los fenotipos (centrados en el origen) ---- */
function arteArveja(color) {
  const sem = color === 'amarilla' ? ['#f6cf32', '#b98a00'] : ['#4fb43c', '#25701a'];
  const semillas = [-25, 0, 25].map((x) => `<circle cx="${x}" cy="0" r="11.5" fill="${sem[0]}" stroke="${sem[1]}" stroke-width="2.5"/><circle cx="${x - 4}" cy="-4" r="3.2" fill="#fff" opacity=".65"/>`).join('');
  return `<g transform="rotate(-18)"><ellipse rx="52" ry="22" fill="#68bb47" stroke="#2f7a1e" stroke-width="3"/><ellipse rx="44" ry="14.5" fill="#e6f6d3"/>${semillas}</g>`;
}
function arteFlor(colores) {
  const petalos = [0, 1, 2, 3, 4, 5].map((k) => {
    const c = colores[k % colores.length];
    return `<ellipse cx="0" cy="-24" rx="13.5" ry="22" transform="rotate(${k * 60})" fill="${c[0]}" stroke="${c[1]}" stroke-width="2.5"/>`;
  }).join('');
  return petalos + '<circle r="10" fill="#ffd23a" stroke="#c58f00" stroke-width="2.5"/><circle r="3.5" fill="#fff3b0"/>';
}
const ROJO = ['#e0314b', '#9c1630'], ROSA = ['#f7a3c0', '#c9577f'], BLANCO = ['#fffaf3', '#bfaeb8'];
function arteSangre(fen) {
  let antig = '';
  const tieneA = fen === 'A' || fen === 'AB', tieneB = fen === 'B' || fen === 'AB';
  for (let k = 0; k < 8; k++) {
    const ang = k * 45 - 90, rad = (ang * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
    const tipo = fen === 'AB' ? (k % 2 ? 'B' : 'A') : tieneA ? 'A' : tieneB ? 'B' : '';
    if (!tipo) continue;
    const cab = tipo === 'A'
      ? `<polygon points="-6.5,5 6.5,5 0,-6.5" fill="#3ea6ff" stroke="#14609e" stroke-width="1.6" transform="translate(${c * 48} ${s * 48}) rotate(${ang + 90})"/>`
      : `<rect x="-5.5" y="-5.5" width="11" height="11" fill="#ffc83a" stroke="#a67800" stroke-width="1.6" transform="translate(${c * 48} ${s * 48}) rotate(${ang})"/>`;
    antig += `<line x1="${c * 34}" y1="${s * 34}" x2="${c * 43}" y2="${s * 43}" stroke="#7d1229" stroke-width="2.2"/>${cab}`;
  }
  return antig + '<circle r="35" fill="url(#spfh-rbc)" stroke="#7d1229" stroke-width="3"/><ellipse rx="15" ry="15" fill="rgba(60,0,15,.2)"/><ellipse cx="-12" cy="-14" rx="9" ry="5" fill="#fff" opacity=".22" transform="rotate(-35 -12 -14)"/>';
}
function arteFenotipo(clave, fen) {
  if (clave === 'completa') return arteArveja(fen);
  if (clave === 'incompleta') return arteFlor([fen === 'roja' ? ROJO : fen === 'rosa' ? ROSA : BLANCO]);
  if (clave === 'codominancia') return arteFlor(fen === 'roja' ? [ROJO] : fen === 'blanca' ? [BLANCO] : [ROJO, BLANCO]);
  return arteSangre(fen);
}

function razonProporcion(celdas, clave) {
  const cuenta = (f) => { const m = new Map(); celdas.forEach((c) => m.set(f(c), (m.get(f(c)) || 0) + 1)); return [...m.values()].sort((a, b) => b - a).join(' : '); };
  return 'Fenotipos ' + cuenta((c) => c.fen) + ' · Genotipos ' + cuenta((c) => c.g);
}

export function abrirHerencia({ app, volver }) {
  estilosSpot();
  document.getElementById('spfh-css')?.remove();
  const st = document.createElement('style');
  st.id = 'spfh-css'; st.textContent = css;
  document.head.appendChild(st);

  app.innerHTML = `<main class="spf spfh">
    <button type="button" class="spf-back" data-spf-volver>← <span>Volver a Parcialito</span></button>
    <header class="spf-cab"><span class="spf-sello">NUEVO JUEGO</span><h1>Herencia relámpago</h1></header>
    <section class="spf-stage">
      <div class="spf-top">
        <div data-spf="vidas"></div>
        <div>Puntos <b data-spf="puntos">0</b></div>
        <div class="spf-racha" data-spf="racha">🔥×1</div>
      </div>
      <div class="spf-prompt">
        <div class="l" data-spf="etiqueta">Tocá cada</div>
        <div><span class="t" data-spf="objetivo">…</span><small data-spf="cuenta"></small></div>
        <div class="spf-sub" data-spf="sub" hidden></div>
      </div>
      <div class="spf-bar"><i data-spf="barra"></i></div>
      <div class="spfh-campo" data-spf="campo"></div>
      <div class="spfh-msg" data-spf="msg"></div>
      <div class="spf-overlay" data-spf="overlay">
        <h2 data-spf="ov-titulo">Herencia relámpago</h2>
        <p data-spf="ov-texto">Tocá todo lo que te piden antes de que se acabe el tiempo. Si te equivocás, perdés una vida y te explico por qué.</p>
        <p class="rec" data-spf="ov-rec"></p>
        <div class="spf-modos">
          <button type="button" data-modo="genea">🧬 Genealogías<small>Familias nuevas cada ronda: portadoras seguras, posibles portadoras y genotipos XᴴXʰ.</small></button>
          <button type="button" data-modo="gametas">🎲 Gametas posibles<small>Dado AaBb, tocá AB, Ab, aB y ab. Esquivá las imposibles.</small></button>
          <button type="button" data-modo="dominancia">🎨 Dominancias<small>Cuadros de Punnett: completa, incompleta y codominancia. Mirá cómo salen las flores y las semillas.</small></button>
          <button type="button" data-modo="abo">🩸 Codominancia en ABO<small>Deducí grupos, antígenos y anticuerpos de los hijos. Con glóbulos rojos dibujados.</small></button>
          <button type="button" data-modo="ligadaX">🧬 Herencia ligada al X<small>Hemofilia y daltonismo: resolvé cruces y encontrá portadoras y descendientes afectados.</small></button>
        </div>
      </div>
    </section>
    <button type="button" class="spf-help" data-spf="ayuda">¿Cómo se resuelve?</button>
    <div class="spf-guide" data-spf="guia" hidden></div>
  </main>`;

  const raiz = app.querySelector('.spfh');
  const $ = (n) => raiz.querySelector(`[data-spf="${n}"]`);

  const estado = {
    juego: 'genea', modo: 'inactivo', nivel: 0, puntos: 0, vidas: 3, racha: 0,
    tiempo: 0, tiempoMax: 1, k: 0, halladas: 0, ronda: null, ultimaPlantilla: '', ultimoCruce: '', ultimoCruceXL: '', ultimaConsigna: ''
  };
  let vivo = true, raf = 0, msgTimer = null;
  const mejores = { genea: 0, gametas: 0, dominancia: 0, abo: 0, ligadaX: 0 };
  for (const m of Object.keys(mejores)) {
    try { mejores[m] = +localStorage.getItem(CLAVE + m) || 0; } catch (e) { /* sin almacenamiento */ }
  }
  const textoRecords = () => Object.values(mejores).some(Boolean)
    ? 'Récords · Genealogías: ' + mejores.genea + ' · Gametas: ' + mejores.gametas + ' · Dominancias: ' + mejores.dominancia + ' · ABO: ' + mejores.abo + ' · Ligada al X: ' + mejores.ligadaX : '';
  $('ov-rec').textContent = textoRecords();

  const luego = (fn, ms) => setTimeout(() => { if (vivo && raiz.isConnected) fn(); }, ms);

  function aplicarGuia() { $('guia').innerHTML = GUIAS[estado.juego]; }
  aplicarGuia();

  /* ---------- HUD ---------- */
  function actualizarHud() {
    $('vidas').textContent = '❤️'.repeat(Math.max(0, estado.vidas)) + '🖤'.repeat(Math.max(0, 3 - estado.vidas));
    $('puntos').textContent = estado.puntos;
    $('racha').textContent = '🔥×' + (1 + Math.floor(estado.racha / 4));
    $('cuenta').textContent = estado.halladas + ' de ' + estado.k;
  }
  function decir(texto, color) {
    const m = $('msg');
    m.textContent = texto; m.style.color = color;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { m.textContent = ''; }, 4200);
  }
  function pulsoRacha() {
    const s = $('racha');
    s.classList.add('pop');
    setTimeout(() => s.classList.remove('pop'), 150);
  }
  function fijarPrompt(etiqueta, objetivo, sub) {
    $('etiqueta').textContent = etiqueta;
    $('objetivo').textContent = objetivo;
    const el = $('sub');
    el.hidden = !sub; el.textContent = sub || '';
  }

  /* ---------- rondas ---------- */
  function nuevaRonda() {
    estado.halladas = 0;
    $('msg').textContent = '';
    if (estado.juego === 'genea') rondaGenea();
    else if (estado.juego === 'gametas') rondaGametas();
    else if (estado.juego === 'ligadaX') rondaLigadaX();
    else rondaDominancia();
    estado.modo = 'jugando';
    actualizarHud();
    pintar();
  }

  function rondaGenea() {
    const fam = generarFamilia();
    const enf = elegir(Object.keys(ENF));
    const personas = fam.personas;
    const claves = Object.keys(OBJ_GENEA).filter((k) => personas.some(OBJ_GENEA[k].es));
    const pesos = claves.flatMap((k) => (k === 'afectado' ? [k] : k === 'inc' ? [k] : [k, k]));
    const objetivo = estado.nivel === 0 ? 'portadora' : elegir(pesos.filter((k) => k !== estado.ultimoObjetivo).length ? pesos.filter((k) => k !== estado.ultimoObjetivo) : pesos);
    estado.ultimoObjetivo = objetivo;
    const set = new Set(personas.filter(OBJ_GENEA[objetivo].es).map((p) => p.id));
    estado.k = set.size;
    estado.tiempoMax = estado.tiempo = Math.max(14, 24 - estado.nivel * 1.1);
    personas.forEach((p) => { p.est = ''; p.nuevo = false; });
    estado.ronda = { tipo: 'genea', personas, familias: fam.familias, set, objetivo, enf, anim: true, revelar: false };
    fijarPrompt('Tocá', OBJ_GENEA[objetivo].txt, ENF[enf].icono + ' ' + ENF[enf].nombre + ' · recesiva ligada al X');
  }

  function rondaGametas() {
    const genes = nuevoGenotipo(estado.nivel);
    const validas = productoCartesiano(genes.map((g) => g.alelos));
    const extra = Math.min(4 + Math.floor(estado.nivel / 2), 8);
    const dis = distractores(genes, validas).slice(0, extra);
    const items = mezclar([...validas.map((t) => ({ txt: t, ok: true })), ...dis.map((t) => ({ txt: t, ok: false }))]);
    const n = items.length;
    let rho = Math.sqrt(0.5 / n), puestas = [];
    for (let intento = 0; intento < 60; intento++) {
      puestas = [];
      let ok = true;
      for (let i = 0; i < n && ok; i++) {
        let listo = false;
        for (let a = 0; a < 300 && !listo; a++) {
          const ang = Math.random() * Math.PI * 2;
          const d = Math.sqrt(Math.random()) * (0.97 - rho);
          const u = Math.cos(ang) * d, v = Math.sin(ang) * d;
          if (puestas.every((q) => Math.hypot(q.u - u, q.v - v) >= 2.1 * rho)) { puestas.push({ u, v }); listo = true; }
        }
        if (!listo) ok = false;
      }
      if (ok) break;
      rho *= 0.95;
    }
    const burbujas = items.map((it, i) => ({ ...it, u: puestas[i].u, v: puestas[i].v, rho, est: '' }));
    estado.k = validas.length;
    estado.tiempoMax = estado.tiempo = Math.max(11, 20 - estado.nivel);
    estado.ronda = { tipo: 'gametas', genes, burbujas, revelar: false };
    const genotipo = genes.map((g) => g.gen).join('');
    fijarPrompt('Tocá cada gameta posible de', genotipo, 'segregación independiente · ' + validas.length + (validas.length === 1 ? ' tipo' : ' tipos'));
  }

  function rondaLigadaX() {
    const enfermedad = estado.nivel % 2 === 0 ? 'hemofilia' : 'daltonismo';
    const info = ENFERMEDADES_LIGADA_X[enfermedad];
    const disponibles = CRUCES_LIGADA_X.filter((c) => c.id !== estado.ultimoCruceXL);
    const cruce = estado.nivel === 0 ? CRUCES_LIGADA_X[0] : elegir(disponibles.length ? disponibles : CRUCES_LIGADA_X);
    estado.ultimoCruceXL = cruce.id;

    const madre = cruce.madre.map((a) => a === 'N' ? info.normal : info.mutado);
    const padre = cruce.padre.map((a) => a === 'N' ? info.normal : a === 'm' ? info.mutado : 'Y');
    const celdas = [];
    for (let f = 0; f < 2; f++) for (let c = 0; c < 2; c++) {
      celdas.push({ ...resultadoLigadaX(madre[f], padre[c], enfermedad), est: '', nuevo: false });
    }

    const opciones = consignasLigadaX(celdas);
    const evitar = opciones.filter((o) => o.texto !== estado.ultimaConsigna);
    const consigna = estado.nivel === 0
      ? (opciones.find((o) => o.texto === 'los hijos varones afectados') || opciones[0])
      : elegir(evitar.length ? evitar : opciones);
    estado.ultimaConsigna = consigna.texto;
    const set = new Set(celdas.map((c, i) => consigna.es(c) ? i : -1).filter((i) => i >= 0));

    estado.k = set.size;
    estado.tiempoMax = estado.tiempo = Math.max(13, 24 - estado.nivel * 0.65);
    estado.ronda = { tipo: 'ligadaX', clave: 'ligadaX', enfermedad, info, madre, padre, celdas, cruce, set, anim: true, revelar: false };
    fijarPrompt('Tocá', consigna.texto, enfermedad + ' · ' + madre.join('') + ' × ' + padre.join(''));
  }
  function rondaDominancia() {
    const abo = estado.juego === 'abo';
    const variantes = ['completa', 'incompleta', 'codominancia'];
    const clave = abo ? 'abo' : variantes[estado.nivel % variantes.length];
    const opciones = CRUCES[clave];
    let cruce = estado.nivel < variantes.length ? opciones[0] : elegir(opciones);
    if (abo && estado.nivel > 0) cruce = elegir(opciones.filter((c) => c.join() !== estado.ultimoCruce));
    estado.ultimoCruce = cruce.join();
    const [m, pa] = cruce;
    const celdas = [];
    for (let f = 0; f < 2; f++) for (let c = 0; c < 2; c++) {
      const g = normalizar(clave, pa[c], m[f]);
      celdas.push({ g, fen: fenotipo(clave, g), est: '', nuevo: false });
    }
    const opcionesC = consignasPunnett(clave, celdas);
    const evitar = opcionesC.filter((o) => o.texto !== estado.ultimaConsigna);
    const consigna = estado.nivel === 0 ? opcionesC[0] : elegir(evitar.length ? evitar : opcionesC);
    estado.ultimaConsigna = consigna.texto;
    const set = new Set(celdas.map((c, i) => (consigna.es(c) ? i : -1)).filter((i) => i >= 0));
    estado.k = set.size;
    estado.tiempoMax = estado.tiempo = Math.max(12, 22 - estado.nivel * 0.7);
    estado.ronda = { tipo: 'punnett', clave, celdas, cruce, set, anim: true, revelar: false };
    fijarPrompt('Tocá', consigna.texto, 'Cruce ' + geno(clave, m) + ' × ' + geno(clave, pa));
  }

  /* ---------- dibujo ---------- */
  function svgGenea(R) {
    const mapa = new Map(R.personas.map((p) => [p.id, p]));
    const acento = ENF[R.enf].color, M = 15;
    let lineas = '';
    for (const [padres, hijos] of R.familias) {
      const [a, b] = padres.map((id) => mapa.get(id));
      const yP = a.y, midX = (a.x + b.x) / 2, ySib = yP + 38;
      const ks = hijos.map((id) => mapa.get(id));
      const xs = ks.map((k) => k.x).concat(midX);
      lineas += `<line x1="${Math.min(a.x, b.x) + M}" y1="${yP}" x2="${Math.max(a.x, b.x) - M}" y2="${yP}"/><line x1="${midX}" y1="${yP}" x2="${midX}" y2="${ySib}"/><line x1="${Math.min(...xs)}" y1="${ySib}" x2="${Math.max(...xs)}" y2="${ySib}"/>`;
      ks.forEach((k) => { lineas += `<line x1="${k.x}" y1="${ySib}" x2="${k.x}" y2="${k.y - M}"/>`; });
    }
    const nodos = R.personas.map((p, i) => {
      const rev = !!p.est || R.revelar;
      const falto = R.revelar && !p.est && R.set.has(p.id);
      let stroke = COLORES.crema, ancho = 2.2, halo = '', insignia = '';
      if (p.est === 'ok') { stroke = COLORES.ok; ancho = 3.4; halo = `<circle cx="${p.x}" cy="${p.y}" r="23" fill="${COLORES.ok}" opacity=".18"/>`; insignia = `<circle cx="${p.x + 14}" cy="${p.y - 14}" r="7.5" fill="${COLORES.ok}"/><path d="M${p.x + 10.5} ${p.y - 14} l2.5 2.8 l4.5 -5.6" stroke="#0b3a26" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
      else if (p.est === 'mal') { stroke = COLORES.mal; ancho = 3.4; halo = `<circle cx="${p.x}" cy="${p.y}" r="23" fill="${COLORES.mal}" opacity=".18"/>`; insignia = `<circle cx="${p.x + 14}" cy="${p.y - 14}" r="7.5" fill="${COLORES.mal}"/><path d="M${p.x + 11.5} ${p.y - 16.5} l5 5 m0 -5 l-5 5" stroke="#4a0a17" stroke-width="2" fill="none" stroke-linecap="round"/>`; }
      else if (falto) { stroke = COLORES.ambar; ancho = 3.6; halo = `<circle cx="${p.x}" cy="${p.y}" r="23" fill="${COLORES.ambar}" opacity=".2"/>`; }
      const fill = p.aff ? acento : 'rgba(255,243,220,.09)';
      const forma = p.s === 'M'
        ? `<rect x="${p.x - M}" y="${p.y - M}" width="${2 * M}" height="${2 * M}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${ancho}"/>`
        : `<circle cx="${p.x}" cy="${p.y}" r="${M}" fill="${fill}" stroke="${stroke}" stroke-width="${ancho}"/>`;
      let marca = '';
      if (rev && p.cls === 'car') marca = `<circle cx="${p.x}" cy="${p.y}" r="5.5" fill="#b69bff" stroke="#fff3dc" stroke-width="1.4"/>`;
      else if (rev && p.cls === 'inc') marca = `<text x="${p.x}" y="${p.y + 5.5}" text-anchor="middle" font-size="16" font-weight="800" fill="${COLORES.ambar}">?</text>`;
      const rot = rev ? `<text x="${p.x}" y="${p.y + 30}" text-anchor="middle" font-size="10" font-weight="700" fill="#e9dcf7">${xSvg(R.enf, p)}</text>` : '';
      const clase = 'spfh-celda' + (R.anim ? ' entra' : '') + (p.nuevo ? ' pop' : '');
      return `<g class="spfh-nodo ${clase}" data-i="${i}" style="animation-delay:${R.anim ? p.gen * 160 + (i % 5) * 40 : 0}ms">${halo}<circle cx="${p.x}" cy="${p.y}" r="26" fill="transparent"/>${forma}${marca}${rot}${insignia}</g>`;
    }).join('');
    const gens = ['I', 'II', 'III'].map((t, i) => `<text x="5" y="${40 + i * 82}" font-size="11" font-weight="700" fill="#8f82b5">${t}</text>`).join('');
    return `<svg class="spfh-svg" viewBox="0 0 340 236" role="img" aria-label="Genealogía de tres generaciones">
      <rect x="0" y="0" width="340" height="236" rx="22" fill="rgba(255,255,255,.035)"/>
      <g stroke="#cfc3ea" stroke-width="1.8" fill="none" stroke-linecap="round">${lineas}</g>${gens}${nodos}</svg>
      <div class="spfh-leyenda">Cuadrado: varón · círculo: mujer · color: afectado · al tocar se revela el genotipo (● portadora · ? posible portadora)</div>`;
  }

  function svgGametas(R) {
    const cx = 170, cy = 170, RC = 163;
    const bs = R.burbujas.map((b, i) => {
      const x = cx + b.u * RC, y = cy + b.v * RC, r = b.rho * RC;
      let fill = '#fff6fa', stroke = '#b5628f', ancho = 2;
      if (b.est === 'ok') { fill = 'rgba(79,224,160,.55)'; stroke = '#1f8f5c'; ancho = 3.5; }
      else if (b.est === 'mal') { fill = 'rgba(255,93,122,.35)'; stroke = '#d64545'; ancho = 3.5; }
      else if (R.revelar && b.ok) { stroke = '#e08a00'; ancho = 3.5; }
      const fs = Math.min(r * 0.75, (r * 1.7) / (b.txt.length * 0.62));
      return `<g class="spfh-nodo" data-i="${i}"><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${ancho}"/>
        <text x="${x}" y="${y + fs * 0.35}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#3b1f5c" pointer-events="none">${b.txt}</text></g>`;
    }).join('');
    return `<svg class="spfh-svg" viewBox="0 0 340 340" role="img" aria-label="Campo con burbujas de genotipos">
      <defs><radialGradient id="spfh-g"><stop offset="0" stop-color="#fbe9f1"/><stop offset="1" stop-color="#efc6da"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${RC + 5}" fill="url(#spfh-g)" stroke="#6d5a99" stroke-width="5"/>${bs}</svg>`;
  }

  function svgPunnett(R) {
    const { clave } = R, x0 = 44, y0 = 44, T = 140;
    const cab = (txt, x, y, al) => `<circle cx="${x}" cy="${y}" r="17" fill="${COLOR_ALELO[al] || '#7b57e0'}" stroke="rgba(255,255,255,.55)" stroke-width="2"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="${al === 'B' && clave === 'abo' ? '#3a2a00' : '#fff'}">${etiquetaSvg(clave, al, 16)}</text>`;
    let g = '';
    const [m, pa] = R.cruce;
    for (let c = 0; c < 2; c++) g += cab(pa[c], x0 + c * T + T / 2, 22, pa[c]);
    for (let f = 0; f < 2; f++) g += cab(m[f], 22, y0 + f * T + T / 2, m[f]);
    g += '<text x="22" y="29" text-anchor="middle" font-size="20" font-weight="800" fill="#b8abdb">×</text>';
    R.celdas.forEach((c, i) => {
      const col = i % 2, fila = i >> 1, cx = x0 + col * T + T / 2, cy = y0 + fila * T + T / 2;
      const rev = !!c.est || R.revelar;
      const falto = R.revelar && !c.est && R.set.has(i);
      let fondo = '#fff6fa', borde = '#b5628f', ancho = 2.5;
      if (c.est === 'ok') { fondo = '#d6f7e6'; borde = '#1f8f5c'; ancho = 4; }
      else if (c.est === 'mal') { fondo = '#ffdce3'; borde = '#d64545'; ancho = 4; }
      else if (falto) { borde = '#e08a00'; ancho = 4.5; }
      const arte = rev
        ? `<g transform="translate(${cx} ${cy - 20}) scale(.85)">${arteFenotipo(clave, c.fen)}</g>`
        : `<circle cx="${cx}" cy="${cy - 20}" r="27" fill="none" stroke="#b5628f" stroke-width="2.5" stroke-dasharray="5 6" opacity=".6"/><text x="${cx}" y="${cy - 10}" text-anchor="middle" font-size="30" font-weight="800" fill="#b5628f" opacity=".55">?</text>`;
      const nombre = rev ? `<text x="${cx}" y="${cy + 60}" text-anchor="middle" font-size="11.5" font-weight="700" fill="#5b3d78">${FEN_NOMBRE[clave][c.fen]}</text>` : '';
      const clase = 'spfh-celda' + (R.anim ? ' entra' : '') + (c.nuevo ? ' pop' : '');
      g += `<g class="spfh-nodo ${clase}" data-i="${i}" style="animation-delay:${R.anim ? i * 80 : 0}ms">
        <rect x="${cx - 66}" y="${cy - 66}" width="132" height="132" rx="20" fill="${fondo}" stroke="${borde}" stroke-width="${ancho}"/>
        ${arte}
        <text x="${cx}" y="${cy + 43}" text-anchor="middle" font-size="20" font-weight="800" fill="#3b1f5c">${etiquetaSvg(clave, c.g, 20)}</text>${nombre}</g>`;
    });
    return `<div class="spfh-clave">${TITULO_CLAVE[clave]}</div>
      <svg class="spfh-svg" viewBox="-2 -2 328 328" role="img" aria-label="Cuadro de Punnett">
      <defs><radialGradient id="spfh-rbc" cx=".4" cy=".35"><stop offset="0" stop-color="#f0647c"/><stop offset="1" stop-color="#b3213f"/></radialGradient></defs>
      <rect x="-2" y="-2" width="328" height="328" rx="26" fill="rgba(255,255,255,.04)"/>${g}</svg>
      <div class="spfh-leyenda">${LEYENDA[clave]}</div>`;
  }

  function svgLigadaX(R) {
    const x0 = 44, y0 = 44, T = 140;
    const tonoAlelo = (a) => a === R.info.normal ? '#7b57e0' : a === R.info.mutado ? '#e8872a' : '#8b96a8';
    const cab = (txt, x, y) => `<circle cx="${x}" cy="${y}" r="18" fill="${tonoAlelo(txt)}" stroke="rgba(255,255,255,.55)" stroke-width="2"/><text x="${x}" y="${y + 5.5}" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">${txt}</text>`;
    let g = '<text x="184" y="9" text-anchor="middle" font-size="9.5" font-weight="700" fill="#b8abdb">GAMETAS DEL PADRE</text>';
    const [m, pa] = [R.madre, R.padre];
    for (let c = 0; c < 2; c++) g += cab(pa[c], x0 + c * T + T / 2, 27);
    for (let f = 0; f < 2; f++) g += cab(m[f], 22, y0 + f * T + T / 2);

    R.celdas.forEach((c, i) => {
      const col = i % 2, fila = i >> 1, cx = x0 + col * T + T / 2, cy = y0 + fila * T + T / 2;
      const revela = !!c.est || R.revelar;
      const falto = R.revelar && !c.est && R.set.has(i);
      let fondo = '#fff6fa', borde = '#b5628f', ancho = 2.5;
      if (c.est === 'ok') { fondo = '#d6f7e6'; borde = '#1f8f5c'; ancho = 4; }
      else if (c.est === 'mal') { fondo = '#ffdce3'; borde = '#d64545'; ancho = 4; }
      else if (revela && !c.est) {
        fondo = c.afectado ? '#ffe3e7' : c.portadora ? '#fff1cf' : '#e7f5eb';
        borde = falto ? '#e08a00' : c.afectado ? '#d64545' : c.portadora ? '#c18a22' : '#438b64';
        ancho = falto ? 4.5 : 3;
      }
      let resultado = `<circle cx="${cx}" cy="${cy - 30}" r="25" fill="none" stroke="#b5628f" stroke-width="2.5" stroke-dasharray="5 6" opacity=".6"/><text x="${cx}" y="${cy - 20}" text-anchor="middle" font-size="28" font-weight="800" fill="#b5628f" opacity=".55">?</text>`;
      let genotipo = '', fenotipoTxt = '';
      if (revela) {
        const forma = c.sexo === 'M'
          ? `<rect x="${cx - 17}" y="${cy - 47}" width="34" height="34" rx="3" fill="${c.afectado ? '#ffdce3' : '#e8e0ff'}" stroke="${c.afectado ? '#d64545' : '#7652ba'}" stroke-width="2.5"/>`
          : `<circle cx="${cx}" cy="${cy - 30}" r="18" fill="${c.afectado ? '#ffdce3' : c.portadora ? '#fff1cf' : '#e8e0ff'}" stroke="${c.afectado ? '#d64545' : c.portadora ? '#c18a22' : '#7652ba'}" stroke-width="2.5"/>`;
        const simbolo = c.sexo === 'M' ? '♂' : '♀';
        resultado = forma + `<text x="${cx}" y="${cy - 24}" text-anchor="middle" font-size="21" font-weight="800" fill="#3b1f5c">${simbolo}</text>`;
        genotipo = `<text x="${cx}" y="${cy + 3}" text-anchor="middle" font-size="16" font-weight="800" fill="#3b1f5c">${c.g}</text>`;
        fenotipoTxt = `<text x="${cx}" y="${cy + 25}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#5b3d78">${c.fen}</text>`;
      }
      const clase = 'spfh-celda' + (R.anim ? ' entra' : '') + (c.nuevo ? ' pop' : '');
      g += `<g class="${clase}" data-i="${i}" style="animation-delay:${R.anim ? i * 80 : 0}ms"><rect x="${cx - 66}" y="${cy - 66}" width="132" height="132" rx="20" fill="${fondo}" stroke="${borde}" stroke-width="${ancho}"/>${resultado}${genotipo}${fenotipoTxt}</g>`;
    });

    const leyenda = 'Arriba: gametas del padre · izquierda: gametas de la madre · ' +
      R.info.normal + ': ' + R.info.normalTexto + ' · ' + R.info.mutado + ': alelo recesivo de ' + R.enfermedad + ' · Y: no lleva ese alelo';
    return `<div class="spfh-clave">${TITULO_CLAVE.ligadaX} · ${R.enfermedad}</div><svg class="spfh-svg" viewBox="-2 -2 328 328" role="img" aria-label="Cuadro de Punnett de herencia recesiva ligada al X"><rect x="-2" y="-2" width="328" height="328" rx="26" fill="rgba(255,255,255,.04)"/>${g}</svg><div class="spfh-leyenda">${leyenda}</div>`;
  }
  function pintar() {
    const R = estado.ronda;
    $('campo').innerHTML = R.tipo === 'genea' ? svgGenea(R) : R.tipo === 'gametas' ? svgGametas(R) : R.tipo === 'ligadaX' ? svgLigadaX(R) : svgPunnett(R);
    if (R.anim) R.anim = false;
    if (R.celdas) R.celdas.forEach((c) => { c.nuevo = false; });
    if (R.personas) R.personas.forEach((p) => { p.nuevo = false; });
  }

  /* ---------- interacción ---------- */
  $('campo').addEventListener('pointerdown', (e) => {
    if (estado.modo !== 'jugando') return;
    const g = e.target.closest('[data-i]');
    if (!g) return;
    const R = estado.ronda, i = +g.dataset.i;
    if (R.tipo === 'genea') tocarGenea(R, R.personas[i]);
    else if (R.tipo === 'gametas') tocarGameta(R, R.burbujas[i]);
    else if (R.tipo === 'ligadaX') tocarLigadaX(R, i);
    else tocarDominancia(R, i);
  });

  function acierto(texto) {
    estado.halladas++; estado.racha++;
    estado.puntos += 10 * (1 + Math.floor(estado.racha / 4));
    Sonido.acierto(estado.racha); pulsoRacha();
    if (texto) decir(texto, 'var(--ok)');
    actualizarHud();
    pintar();
    if (estado.halladas === estado.k) completarRonda();
  }
  function error(texto) {
    const perdioRacha = estado.racha > 0;
    estado.vidas--; estado.racha = 0; Sonido.error(perdioRacha);
    decir(texto, 'var(--mal)');
    actualizarHud();
    pintar();
    if (estado.vidas <= 0) { estado.modo = 'entre'; luego(finDelJuego, 1500); }
  }

  function tocarGenea(R, p) {
    if (p.est) return;
    p.nuevo = true;
    const txt = razonGenea(p, R.enf, new Map(R.personas.map((q) => [q.id, q])));
    if (R.set.has(p.id)) { p.est = 'ok'; acierto('✓ ' + txt); }
    else { p.est = 'mal'; error('✗ ' + txt); }
  }
  function tocarGameta(R, b) {
    if (b.est) return;
    if (b.ok) { b.est = 'ok'; acierto(''); }
    else { b.est = 'mal'; error(b.txt + ': ' + razonGameta(b.txt, R.genes)); }
  }

  function tocarDominancia(R, i) {
    const c = R.celdas[i];
    if (c.est) return;
    c.nuevo = true;
    const txt = explicar(R.clave, c.g);
    if (R.set.has(i)) { c.est = 'ok'; acierto('✓ ' + txt); }
    else { c.est = 'mal'; error('✗ ' + txt); }
  }

  function tocarLigadaX(R, i) {
    const c = R.celdas[i];
    if (c.est) return;
    c.nuevo = true;
    const txt = explicarLigadaX(c);
    if (R.set.has(i)) { c.est = 'ok'; acierto('✓ ' + txt); }
    else { c.est = 'mal'; error('✗ ' + txt); }
  }
  function completarRonda() {
    estado.modo = 'entre';
    const bono = Math.ceil(estado.tiempo) * 5;
    estado.puntos += bono; estado.nivel++;
    const R = estado.ronda;
    R.revelar = true;
    Sonido.hito(); decir('¡Ronda completa! +' + bono + (R.celdas ? ' · ' + razonProporcion(R.celdas, R.clave) : ''), 'var(--ok)'); actualizarHud();
    pintar();
    luego(nuevaRonda, R.celdas ? 2600 : R.personas ? 2300 : 1500);
  }
  function tiempoAgotado() {
    estado.modo = 'entre'; estado.ronda.revelar = true;
    const perdioRacha = estado.racha > 0;
    estado.vidas--; estado.racha = 0; Sonido.error(perdioRacha);
    decir('¡Se acabó el tiempo! Las que faltaban están en naranja.', 'var(--mal)'); actualizarHud();
    pintar();
    if (estado.vidas <= 0) luego(finDelJuego, 1800);
    else luego(nuevaRonda, 2200);
  }
  function finDelJuego() {
    if (estado.modo === 'fin') return;
    estado.modo = 'fin';
    const nuevoRecord = estado.puntos > mejores[estado.juego];
    if (nuevoRecord) {
      mejores[estado.juego] = estado.puntos;
      try { localStorage.setItem(CLAVE + estado.juego, String(estado.puntos)); } catch (e) { /* sin almacenamiento */ }
    }
    Sonido.fin(nuevoRecord);
    $('ov-titulo').textContent = 'Fin del juego';
    $('ov-texto').textContent = 'Hiciste ' + estado.puntos + ' puntos y llegaste a la ronda ' + (estado.nivel + 1) + '. Elegí un modo para jugar de nuevo.';
    $('ov-rec').textContent = (nuevoRecord ? '🏆 ¡Nuevo récord! ' : '') + textoRecords();
    $('overlay').hidden = false;
  }

  raiz.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => {
    Sonido.iniciar(); Sonido.clic();
    $('overlay').hidden = true;
    estado.juego = b.dataset.modo;
    Object.assign(estado, { nivel: 0, puntos: 0, vidas: 3, racha: 0, ultimaPlantilla: '', ultimoCruce: '', ultimoCruceXL: '', ultimaConsigna: '' });
    $('guia').hidden = true;
    aplicarGuia();
    nuevaRonda();
  }));
  $('ayuda').addEventListener('click', () => { const g = $('guia'); g.hidden = !g.hidden; });
  raiz.querySelector('[data-spf-volver]').addEventListener('click', () => { salir(); Sonido.clic(); volver(); });

  function salir() {
    vivo = false;
    cancelAnimationFrame(raf);
    clearTimeout(msgTimer);
  }

  let ultimo = performance.now();
  function cuadro(t) {
    if (!vivo) return;
    if (!raiz.isConnected) { salir(); return; }
    const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
    if (estado.modo === 'jugando') {
      estado.tiempo -= dt;
      if (estado.tiempo <= 0) { estado.tiempo = 0; tiempoAgotado(); }
    }
    const f = Math.max(0, estado.tiempo / estado.tiempoMax);
    const barra = $('barra');
    barra.style.width = (f * 100) + '%';
    barra.style.background = f < 0.3 ? '#ff5d7a' : f < 0.55 ? '#ffb938' : '#9b7bff';
    raf = requestAnimationFrame(cuadro);
  }

  actualizarHud();
  raf = requestAnimationFrame(cuadro);
  window.scrollTo?.({ top: 0 });
}
