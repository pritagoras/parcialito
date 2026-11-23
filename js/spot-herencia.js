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

const POR = {
  madreAfectado: 'Su hijo está afectado y el padre es sano: el alelo vino de ella, así que es portadora.',
  madreHijo: 'Tiene un hijo afectado: le dio su X con el alelo, entonces es portadora.',
  hijaPadre: 'Su padre está afectado: le dio su único X con el alelo, y como ella está sana es portadora.',
  ext: 'Se incorporó a la familia: se asume que no tiene el alelo.',
  hijaSana: 'Su padre es sano y su madre no tiene el alelo: no es portadora.'
};

const P = (id, s, x, y, o = {}) => ({ id, s, x, y, aff: !!o.aff, car: !!o.car, por: o.por || '' });

// Cada plantilla: personas con su genotipo real y familias [padres, hijos]. Todo es deducible:
// los que se casan con la familia se asumen sin el alelo.
const PLANTILLAS = [
  {
    id: 't1',
    personas: [
      P('I-1', 'M', 135, 34), P('I-2', 'F', 205, 34, { car: 1, por: POR.madreAfectado }),
      P('a', 'M', 28, 112), P('II-1', 'F', 70, 112, { car: 1, por: POR.madreHijo }),
      P('II-2', 'M', 150, 112, { aff: 1 }), P('II-3', 'M', 235, 112), P('b', 'F', 290, 112, { por: POR.ext }),
      P('III-1', 'M', 49, 190, { aff: 1 }), P('III-3', 'F', 262, 190, { por: POR.hijaSana })
    ],
    familias: [[['I-1', 'I-2'], ['II-1', 'II-2', 'II-3']], [['a', 'II-1'], ['III-1']], [['II-3', 'b'], ['III-3']]]
  },
  {
    id: 't2',
    personas: [
      P('I-1', 'M', 135, 34, { aff: 1 }), P('I-2', 'F', 205, 34, { por: POR.ext }),
      P('II-1', 'F', 60, 112, { car: 1, por: POR.hijaPadre }), P('II-2', 'F', 140, 112, { car: 1, por: POR.hijaPadre }),
      P('II-3', 'M', 230, 112), P('b', 'F', 285, 112, { por: POR.ext }),
      P('III-1', 'F', 257, 190, { por: POR.hijaSana })
    ],
    familias: [[['I-1', 'I-2'], ['II-1', 'II-2', 'II-3']], [['II-3', 'b'], ['III-1']]]
  },
  {
    id: 't4',
    personas: [
      P('I-1', 'M', 135, 34), P('I-2', 'F', 205, 34, { car: 1, por: 'Tiene dos hijos afectados y su pareja es sano: es portadora.' }),
      P('II-1', 'M', 45, 112, { aff: 1 }), P('II-2', 'M', 115, 112, { aff: 1 }),
      P('II-3', 'F', 185, 112, { car: 1, por: POR.madreHijo }), P('a', 'M', 235, 112),
      P('III-1', 'M', 210, 190, { aff: 1 })
    ],
    familias: [[['I-1', 'I-2'], ['II-1', 'II-2', 'II-3']], [['II-3', 'a'], ['III-1']]]
  },
  {
    id: 't5',
    personas: [
      P('I-1', 'M', 135, 34, { aff: 1 }), P('I-2', 'F', 205, 34, { por: POR.ext }),
      P('II-1', 'F', 80, 112, { car: 1, por: POR.hijaPadre }), P('a', 'M', 125, 112),
      P('II-2', 'M', 180, 112), P('b', 'F', 230, 112, { por: POR.ext }),
      P('III-1', 'M', 80, 190, { aff: 1 }), P('III-2', 'M', 130, 190), P('III-3', 'F', 205, 190, { por: POR.hijaSana })
    ],
    familias: [[['I-1', 'I-2'], ['II-1', 'II-2']], [['a', 'II-1'], ['III-1', 'III-2']], [['II-2', 'b'], ['III-3']]]
  }
];

const ENFERMEDADES = ['hemofilia', 'daltonismo'];

function razonGenea(tipo, p) {
  if (tipo === 'portadora') {
    if (p.s === 'M') return p.aff ? 'Es un varón afectado: tiene un solo X y no se lo llama portador.' : 'Es un varón sano: tiene un solo X, no puede ser portador.';
    return p.por;
  }
  if (tipo === 'afectado') return 'Esa persona está sana (símbolo vacío).';
  if (p.s === 'M') return 'Es un varón: la consigna pide una mujer.';
  return p.car ? 'Esa mujer sí tiene el alelo: ' + p.por : 'Es una mujer afectada.';
}

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
    <p><b>Símbolos:</b> cuadrado = varón, círculo = mujer, relleno = afectado. Herencia recesiva ligada al X (hemofilia, daltonismo).</p>
    <p><b>Varones:</b> tienen un solo X, así que están sanos o afectados. No son portadores.</p>
    <p><b>Portadora:</b> mujer sana con un alelo afectado. Se deduce con dos reglas: la madre de un hijo afectado, y la hija sana de un padre afectado, son portadoras.</p>
    <p><b>Los que se casan con la familia</b> se asumen sin el alelo.</p>`,
  gametas: `
    <p><b>Meiosis:</b> cada gameta lleva un solo alelo de cada gen. Los alelos de un mismo gen se separan (Aa → A o a).</p>
    <p><b>Heterocigota:</b> da dos tipos de alelos para ese gen; homocigota (AA o aa), uno solo.</p>
    <p><b>Segregación independiente:</b> se forman todas las combinaciones posibles. AaBb da AB, Ab, aB y ab; AABb da AB y Ab.</p>
    <p><b>Cantidad de gametas distintas:</b> 2 elevado a la cantidad de genes heterocigotas.</p>`,
  dominancia: `<p><b>Dominancia completa:</b> el heterocigota expresa solo el fenotipo dominante (3:1 en Aa × Aa).</p><p><b>Dominancia incompleta:</b> el heterocigota tiene un fenotipo intermedio (1:2:1).</p><p><b>Codominancia:</b> en el heterocigota se expresan ambos alelos a la vez (1:2:1).</p>`,
  abo: `<p>En el sistema ABO, <b>Iᴬ e Iᴮ son codominantes</b> entre sí y ambos dominan sobre i. Por eso IᴬIᴮ da grupo AB, mientras que Iᴬi da A e Iᴮi da B. El grupo O es ii.</p><p>El cruce de este modo es Iᴬi × Iᴮi.</p>`
};

const DOMINANCIAS = {
  completa: { ejemplo: 'Cruce Yy × Yy · Y domina sobre y', genos: ['YY', 'Yy', 'Yy', 'yy'] },
  incompleta: { ejemplo: 'Cruce RB × RB · heterocigota de fenotipo intermedio', genos: ['RR', 'RB', 'RB', 'BB'] },
  codominancia: { ejemplo: 'Cruce RB × RB · heterocigota expresa ambos alelos', genos: ['RR', 'RB', 'RB', 'BB'] }
};

const ABO = {
  ejemplo: 'Cruce Iᴬi × Iᴮi · Iᴬ e Iᴮ son codominantes y dominan sobre i',
  genos: ['IᴬIᴮ', 'Iᴬi', 'Iᴮi', 'ii'],
  consignas: [
    { texto: 'el genotipo que expresa los antígenos A y B', es: (g) => g === 'IᴬIᴮ' },
    { texto: 'el genotipo del grupo O', es: (g) => g === 'ii' },
    { texto: 'el genotipo del grupo A', es: (g) => g === 'Iᴬi' },
    { texto: 'el genotipo del grupo B', es: (g) => g === 'Iᴮi' }
  ],
  error: 'En el sistema ABO, IᴬIᴮ es AB (expresa ambos antígenos), Iᴬi es A, Iᴮi es B e ii es O.'
};

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
          <button type="button" data-modo="genea">🧬 Genealogías<small>Encontrá a las portadoras en la herencia ligada al X.</small></button>
          <button type="button" data-modo="gametas">🎲 Gametas posibles<small>Dado AaBb, tocá AB, Ab, aB y ab. Esquivá las imposibles.</small></button>
          <button type="button" data-modo="dominancia">🎨 Dominancias<small>Completá consignas de dominancia completa, incompleta y codominancia.</small></button>
          <button type="button" data-modo="abo">🩸 Codominancia en ABO<small>Deducí los grupos sanguíneos posibles del cruce Iᴬi × Iᴮi.</small></button>
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
    tiempo: 0, tiempoMax: 1, k: 0, halladas: 0, ronda: null, ultimaPlantilla: ''
  };
  let vivo = true, raf = 0, msgTimer = null;
  const mejores = { genea: 0, gametas: 0, dominancia: 0, abo: 0 };
  for (const m of Object.keys(mejores)) {
    try { mejores[m] = +localStorage.getItem(CLAVE + m) || 0; } catch (e) { /* sin almacenamiento */ }
  }
  const textoRecords = () => Object.values(mejores).some(Boolean)
    ? 'Récords · Genealogías: ' + mejores.genea + ' · Gametas: ' + mejores.gametas + ' · Dominancias: ' + mejores.dominancia + ' · ABO: ' + mejores.abo : '';
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
    else rondaDominancia();
    estado.modo = 'jugando';
    actualizarHud();
    pintar();
  }

  function rondaGenea() {
    const plantilla = elegir(PLANTILLAS.filter((p) => p.id !== estado.ultimaPlantilla));
    estado.ultimaPlantilla = plantilla.id;
    const espejo = Math.random() < 0.5;
    const personas = plantilla.personas.map((p) => ({ ...p, x: espejo ? 340 - p.x : p.x, est: '' }));
    const conjuntos = {
      portadora: personas.filter((p) => p.car),
      afectado: personas.filter((p) => p.aff),
      libre: personas.filter((p) => p.s === 'F' && !p.aff && !p.car)
    };
    let tipos = ['portadora', 'portadora', 'portadora', 'afectado', 'libre'].filter((t) => conjuntos[t].length);
    const tipo = estado.nivel === 0 ? 'afectado' : elegir(tipos);
    const enfermedad = elegir(ENFERMEDADES);
    const set = new Set(conjuntos[tipo].map((p) => p.id));
    estado.k = set.size;
    estado.tiempoMax = estado.tiempo = Math.max(12, 22 - estado.nivel * 1.2);
    estado.ronda = { tipo: 'genea', plantilla, personas, set, objetivo: tipo, revelar: false };
    const nombres = { portadora: 'Portadora', afectado: 'Afectado', libre: 'Mujer sin el alelo' };
    fijarPrompt('Tocá cada individuo', nombres[tipo], enfermedad + ' · ligada al X');
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

  function rondaDominancia() {
    const abo = estado.juego === 'abo';
    const variantes = Object.keys(DOMINANCIAS);
    const clave = abo ? 'abo' : variantes[estado.nivel % variantes.length];
    const d = abo ? ABO : DOMINANCIAS[clave];
    const items = mezclar(d.genos.map((genotipo) => ({ genotipo, est: '' })));
    const n = items.length, rho = Math.sqrt(0.42 / n), puestos = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
      puestos.push({ u: Math.cos(ang) * 0.53, v: Math.sin(ang) * 0.53 });
    }
    const burbujas = items.map((it, i) => ({ ...it, ...puestos[i], rho, est: '' }));
    const consignas = abo ? d.consignas : clave === 'completa'
      ? [{ texto: 'los que expresan el fenotipo recesivo', es: (g) => g === 'yy' }, { texto: 'los heterocigotas', es: (g) => g[0] !== g[1] }, { texto: 'los que expresan el fenotipo dominante', es: (g) => g !== 'yy' }]
      : clave === 'incompleta'
        ? [{ texto: 'el fenotipo intermedio', es: (g) => g === 'RB' }, { texto: 'el fenotipo rojo', es: (g) => g === 'RR' }, { texto: 'el fenotipo blanco', es: (g) => g === 'BB' }]
        : [{ texto: 'la expresión de ambos alelos', es: (g) => g === 'RB' }, { texto: 'el fenotipo rojo', es: (g) => g === 'RR' }, { texto: 'el fenotipo blanco', es: (g) => g === 'BB' }];
    const consigna = abo ? consignas[estado.nivel % consignas.length] : consignas[Math.floor(estado.nivel / variantes.length) % consignas.length];
    const set = new Set(burbujas.map((b, i) => consigna.es(b.genotipo) ? i : -1).filter((i) => i >= 0));
    burbujas.forEach((b, i) => { b.ok = set.has(i); });
    estado.k = set.size;
    estado.tiempoMax = estado.tiempo = Math.max(12, 21 - estado.nivel * 0.7);
    estado.ronda = { tipo: 'dominancia', burbujas, d, clave, abo, set, revelar: false };
    fijarPrompt('Seleccioná', consigna.texto, d.ejemplo);
  }

  /* ---------- dibujo ---------- */
  function simboloGenea(p, i, revelar, objetivoOk) {
    let fill = p.aff ? COLORES.crema : 'rgba(255,243,220,.06)';
    let stroke = COLORES.crema, ancho = 2, extra = '';
    if (p.est === 'ok') { fill = 'rgba(79,224,160,.35)'; stroke = COLORES.ok; ancho = 3.5; extra = `<path d="M${p.x - 7} ${p.y} l5 6 l10 -12" stroke="${COLORES.ok}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; }
    else if (p.est === 'mal') { stroke = COLORES.mal; ancho = 3.5; extra = `<path d="M${p.x - 6} ${p.y - 6} l12 12 m0 -12 l-12 12" stroke="${COLORES.mal}" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
    else if (revelar && objetivoOk) { stroke = COLORES.ambar; ancho = 3.5; }
    const forma = p.s === 'M'
      ? `<rect x="${p.x - 14}" y="${p.y - 14}" width="28" height="28" fill="${fill}" stroke="${stroke}" stroke-width="${ancho}"/>`
      : `<circle cx="${p.x}" cy="${p.y}" r="14" fill="${fill}" stroke="${stroke}" stroke-width="${ancho}"/>`;
    const sombra = p.aff && p.est === 'ok' ? `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${COLORES.ok}"/>` : '';
    return `<g class="spfh-nodo" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r="23" fill="transparent"/>${forma}${sombra}${extra}</g>`;
  }

  function svgGenea(R) {
    const mapa = new Map(R.personas.map((p) => [p.id, p]));
    let lineas = '';
    for (const [padres, hijos] of R.plantilla.familias) {
      const [a, b] = padres.map((id) => mapa.get(id));
      const yP = a.y, midX = (a.x + b.x) / 2;
      lineas += `<line x1="${Math.min(a.x, b.x) + 14}" y1="${yP}" x2="${Math.max(a.x, b.x) - 14}" y2="${yP}"/>`;
      const ks = hijos.map((id) => mapa.get(id));
      const ySib = yP + 36;
      const xs = ks.map((k) => k.x).concat(midX);
      lineas += `<line x1="${midX}" y1="${yP}" x2="${midX}" y2="${ySib}"/>`;
      lineas += `<line x1="${Math.min(...xs)}" y1="${ySib}" x2="${Math.max(...xs)}" y2="${ySib}"/>`;
      ks.forEach((k) => { lineas += `<line x1="${k.x}" y1="${ySib}" x2="${k.x}" y2="${k.y - 14}"/>`; });
    }
    const simbolos = R.personas.map((p, i) => simboloGenea(p, i, R.revelar, R.set.has(p.id) && !p.est)).join('');
    const gens = ['I', 'II', 'III'].map((t, i) => `<text x="4" y="${38 + i * 78}" font-size="11" fill="#B8ABDB">${t}</text>`).join('');
    return `<svg class="spfh-svg" viewBox="0 0 340 215" role="img" aria-label="Genealogía de tres generaciones">
      <g stroke="${COLORES.crema}" stroke-width="1.7" fill="none">${lineas}</g>${simbolos}${gens}</svg>
      <div class="spfh-leyenda">Cuadrado: varón · círculo: mujer · relleno: afectado</div>`;
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

  function svgDominancia(R) {
    const cx = 170, cy = 170, RC = 163;
    const bs = R.burbujas.map((b, i) => {
      const x = cx + b.u * RC, y = cy + b.v * RC, r = 43;
      const fill = b.est === 'ok' ? 'rgba(79,224,160,.6)' : b.est === 'mal' ? 'rgba(255,93,122,.38)' : '#fff6fa';
      const stroke = R.revelar && b.ok ? '#e08a00' : '#b5628f';
      return `<g class="spfh-nodo" data-i="${i}"><circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-size="18" font-weight="800" fill="#3b1f5c">${b.genotipo}</text></g>`;
    }).join('');
    return `<svg class="spfh-svg" viewBox="0 0 340 340" role="img" aria-label="Resultados posibles de un cruce"><circle cx="${cx}" cy="${cy}" r="${RC + 5}" fill="#fbe9f1" stroke="#6d5a99" stroke-width="5"/>${bs}</svg>`;
  }

  function pintar() {
    const R = estado.ronda;
    $('campo').innerHTML = R.tipo === 'genea' ? svgGenea(R) : R.tipo === 'gametas' ? svgGametas(R) : svgDominancia(R);
  }

  /* ---------- interacción ---------- */
  $('campo').addEventListener('pointerdown', (e) => {
    if (estado.modo !== 'jugando') return;
    const g = e.target.closest('[data-i]');
    if (!g) return;
    const R = estado.ronda, i = +g.dataset.i;
    if (R.tipo === 'genea') tocarGenea(R, R.personas[i]);
    else if (R.tipo === 'gametas') tocarGameta(R, R.burbujas[i]);
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
    if (R.set.has(p.id)) { p.est = 'ok'; acierto(R.objetivo === 'portadora' ? p.por : ''); }
    else { p.est = 'mal'; error(razonGenea(R.objetivo, p)); }
  }
  function tocarGameta(R, b) {
    if (b.est) return;
    if (b.ok) { b.est = 'ok'; acierto(''); }
    else { b.est = 'mal'; error(b.txt + ': ' + razonGameta(b.txt, R.genes)); }
  }

  function tocarDominancia(R, i) {
    const b = R.burbujas[i];
    if (b.est) return;
    if (R.set.has(i)) { b.est = 'ok'; acierto(''); }
    else {
      b.est = 'mal';
      const explicacion = R.abo ? ABO.error : R.clave === 'completa'
        ? 'Con dominancia completa, Yy expresa el dominante; yy es recesivo.'
        : R.clave === 'incompleta'
          ? 'Con dominancia incompleta, RB es el heterocigota intermedio; RR y BB son homocigotas.'
          : 'Con codominancia, RB expresa los dos alelos a la vez; RR y BB son homocigotas.';
      error(b.genotipo + '. ' + explicacion);
    }
  }

  function completarRonda() {
    estado.modo = 'entre';
    const bono = Math.ceil(estado.tiempo) * 5;
    estado.puntos += bono; estado.nivel++;
    Sonido.hito(); decir('¡Ronda completa! +' + bono, 'var(--ok)'); actualizarHud();
    luego(nuevaRonda, 1500);
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
    Object.assign(estado, { nivel: 0, puntos: 0, vidas: 3, racha: 0, ultimaPlantilla: '' });
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
