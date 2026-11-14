// ==========================================================
// Deducción natural para IPC: práctica interactiva por reglas.
// Se abre desde Juegos interactivos de la materia IPC.
// Banco basado en los dos formatos del Ejercicio 5 del modelo, con variantes
// de letras proposicionales y resolución de pasos faltantes.
// ==========================================================

import { Sonido } from './sonido.js?v=dev';

export const TITULO = 'Deducción natural: modelo de parcial';

const REGLAS = {
  MP: { nombre: 'Modus Ponens', pista: 'Se afirma el antecedente de un condicional.' },
  MT: { nombre: 'Modus Tollens', pista: 'Se niega el consecuente para negar el antecedente.' },
  SH: { nombre: 'Silogismo hipotético', pista: 'Se encadenan dos condicionales.' },
  SD: { nombre: 'Silogismo disyuntivo', pista: 'Se elimina una alternativa de la disyunción.' },
  DN: { nombre: 'Doble negación', pista: 'Se eliminan dos negaciones juntas.' },
  SIMP: { nombre: 'Simplificación', pista: 'De una conjunción se obtiene cualquiera de sus componentes.' },
  CONJ: { nombre: 'Conjunción', pista: 'Se reúnen dos fórmulas en una conjunción.' }
};

// Los dos formatos reproducen la estructura del Ejercicio 5 del modelo:
// A) fórmulas completas con justificaciones vacías;
// B) justificaciones dadas y fórmulas intermedias para reconstruir.
const PLANTILLAS = [
  {
    id: 'modelo-5a', titulo: 'Deducción · justificar cada línea',
    premisas: ['(p → w) • ~w', '(q ∨ (p → u)) • (r → p)', 'q → w'],
    objetivo: '(r → u) • ~w',
    pasos: [
      { f: '~w', r: 'Simp.', refs: [1], hideJustification: true },
      { f: 'r → p', r: 'Simp.', refs: [2], hideJustification: true },
      { f: '~q', r: 'MT', refs: [3, 4], hideJustification: true },
      { f: 'q ∨ (p → u)', r: 'Simp.', refs: [2], hideJustification: true },
      { f: 'p → u', r: 'SD', refs: [7, 6], hideJustification: true },
      { f: 'r → u', r: 'SH', refs: [5, 8], hideJustification: true },
      { f: '(r → u) • ~w', r: 'Conj.', refs: [9, 4], hideJustification: true }
    ]
  },
  {
    id: 'modelo-5b', titulo: 'Deducción · completar fórmulas',
    premisas: ['~q → (p → q)', '~q • p', '(q • ~q) → t'],
    objetivo: 't',
    pasos: [
      { f: '~q', r: 'Simp.', refs: [2], hideFormula: true },
      { f: 'p → q', r: 'MP', refs: [1, 4], hideFormula: true },
      { f: 'p', r: 'Simp.', refs: [2], hideFormula: true },
      { f: 'q', r: 'MP', refs: [5, 6], hideJustification: true },
      { f: 'q • ~q', r: 'Conj.', refs: [7, 4], hideJustification: true },
      { f: 't', r: 'MP', refs: [3, 8], hideFormula: true }
    ]
  }
];

const ALFABETO = ['p','q','r','s','t','u','v','w'];
const ESCAPAR = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MEZCLAR = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const etiqueta = (r, refs) => refs.length ? r + ' ' + refs.join('–') : r;

function reemplazarLetras(texto, mapa) {
  return texto.replace(/[pqrstuvw]/g, x => mapa[x] || x);
}

function crearBanco() {
  const banco = [];
  PLANTILLAS.forEach((plantilla, ti) => {
    for (let variante = 0; variante < 8; variante++) {
      const mapa = {};
      for (let k = 0; k < 8; k++) mapa[ALFABETO[k]] = ALFABETO[(k + variante + ti) % 8];
      const transformar = x => reemplazarLetras(x, mapa);
      banco.push({
        id: plantilla.id + '-' + variante,
        titulo: plantilla.titulo,
        nivel: ti + 1,
        premisas: plantilla.premisas.map(transformar),
        objetivo: transformar(plantilla.objetivo),
        pasos: plantilla.pasos.map(p => ({ ...p, f: transformar(p.f) }))
      });
    }
  });
  return banco;
}
const BANCO = crearBanco();


const reglaPista = r => (REGLAS[String(r).toUpperCase().replace('.', '')] || {}).pista || 'Aplicación de la regla indicada.';

const claveDePaso = p => {
  const just = etiqueta(p.r, p.refs);
  if (p.hideFormula && p.hideJustification) return 'AMBOS::' + p.f + '::' + just;
  if (p.hideFormula) return 'FORMULA::' + p.f;
  if (p.hideJustification) return 'JUST::' + just;
  return 'AMBOS::' + p.f + '::' + just;
};

// ----------------------------------------------------------
// Validación lógica mínima.
// Sirve para no ofrecer como distractor una opción que también es correcta
// (p. ej. en "Simp. 2" sobre ~q • p, tanto ~q como p son respuestas válidas).
// ----------------------------------------------------------
const cierreParentesis = (s) => {
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++;
    else if (s[i] === ')') { d--; if (d === 0) return i; }
  }
  return -1;
};
const sinParentesisExternos = (s) => {
  s = s.trim();
  while (s[0] === '(' && cierreParentesis(s) === s.length - 1) s = s.slice(1, -1).trim();
  return s;
};
function parsearFormula(texto) {
  const s = sinParentesisExternos(texto);
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') d++;
    else if (c === ')') d--;
    else if (d === 0 && '•∨→'.includes(c)) return { op: c, l: parsearFormula(s.slice(0, i)), r: parsearFormula(s.slice(i + 1)) };
  }
  if (s[0] === '~') return { op: '~', x: parsearFormula(s.slice(1)) };
  return { op: 'a', v: s };
}
const formulaATexto = (n) => n.op === 'a' ? n.v : n.op === '~' ? '~' + formulaATexto(n.x) : '(' + formulaATexto(n.l) + n.op + formulaATexto(n.r) + ')';
const mismaFormula = (a, b) => formulaATexto(a) === formulaATexto(b);

// Todas las fórmulas que se pueden concluir aplicando la regla a las premisas citadas (en ese orden).
function conclusionesDe(regla, premisas) {
  const R = String(regla).toUpperCase().replace('.', '');
  const [a, b] = premisas;
  const salida = [];
  if (!a) return salida;
  if (R === 'SIMP' && a.op === '•') salida.push(a.l, a.r);
  else if (R === 'DN' && a.op === '~' && a.x.op === '~') salida.push(a.x.x);
  else if (b) {
    if (R === 'MP' && a.op === '→' && mismaFormula(a.l, b)) salida.push(a.r);
    if (R === 'MT' && a.op === '→' && b.op === '~' && mismaFormula(b.x, a.r)) salida.push({ op: '~', x: a.l });
    if (R === 'SH' && a.op === '→' && b.op === '→' && mismaFormula(a.r, b.l)) salida.push({ op: '→', l: a.l, r: b.r });
    if (R === 'SD' && a.op === '∨' && b.op === '~') {
      if (mismaFormula(b.x, a.l)) salida.push(a.r);
      if (mismaFormula(b.x, a.r)) salida.push(a.l);
    }
    if (R === 'CONJ') salida.push({ op: '•', l: a, r: b });
  }
  return salida;
}

// ¿La opción (clave) sería una respuesta lógicamente válida para ese paso del ejercicio?
function opcionEsValida(clave, ejercicio, indice) {
  try {
    const paso = ejercicio.pasos[indice];
    const n = ejercicio.premisas.length + indice + 1;
    const lineas = [...ejercicio.premisas, ...ejercicio.pasos.slice(0, indice).map(p => p.f)].map(parsearFormula);
    const [tipo, a] = clave.split('::');
    if (tipo === 'FORMULA') {
      const g = parsearFormula(a);
      return conclusionesDe(paso.r, paso.refs.map(k => lineas[k - 1])).some(c => mismaFormula(c, g));
    }
    if (tipo === 'JUST') {
      const [regla, ...resto] = a.split(' ');
      const refs = resto.join('').split('–').map(Number);
      if (refs.some(k => !(k >= 1 && k < n))) return false;
      const f = parsearFormula(paso.f);
      return conclusionesDe(regla, refs.map(k => lineas[k - 1])).some(c => mismaFormula(c, f));
    }
  } catch { /* si algo no se puede analizar, la opción se trata como no válida */ }
  return false;
}

function inyectarEstilos() {
  if (document.getElementById('estilos-dn-ipc')) return;
  const st = document.createElement('style');
  st.id = 'estilos-dn-ipc';
  st.textContent = `
.dn-wrap{max-width:900px;margin:0 auto;padding-bottom:2rem}
.dn-top{display:flex;align-items:center;justify-content:space-between;gap:.7rem;flex-wrap:wrap}
.dn-kicker{font-size:.76rem;letter-spacing:.12em;font-weight:800;color:var(--ambar)}
.dn-intro{color:var(--tenue);line-height:1.5;margin:.35rem 0 1rem}
.dn-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;margin:1rem 0}
.dn-stat{background:var(--panel-2);border:1px solid var(--linea);border-radius:12px;padding:.7rem}
.dn-stat b{display:block;font-size:1.35rem;color:var(--crema)}
.dn-stat small{color:var(--tenue)}
.dn-rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:.55rem;margin:1rem 0}
.dn-rule{background:var(--panel);border:2px solid var(--linea);border-radius:12px;padding:.7rem;text-align:left;color:var(--crema);min-height:76px}
.dn-rule b{display:block;color:var(--ambar);font-size:1.08rem}
.dn-rule small{color:var(--tenue);line-height:1.3}
.dn-rule.activa{border-color:var(--violeta);background:rgba(155,123,255,.12)}
.dn-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.6rem;margin:1rem 0}
.dn-actions .btn{min-height:3rem}
.dn-progress{height:8px;border-radius:20px;background:var(--panel-2);overflow:hidden;margin:.6rem 0 1rem}
.dn-progress span{display:block;height:100%;background:var(--ok);transition:width .2s}
.dn-proof{background:var(--panel);border:2px solid var(--linea);border-radius:15px;padding:.8rem;margin:.7rem 0}
.dn-proof h3{font-size:1rem;margin:0 0 .65rem}
.dn-line{display:grid;grid-template-columns:2rem minmax(0,1fr) minmax(100px,.8fr);gap:.5rem;align-items:center;padding:.58rem .5rem;border-bottom:1px solid var(--linea);font-variant-numeric:tabular-nums}
.dn-line:last-child{border-bottom:0}
.dn-num{color:var(--tenue);font-weight:800}
.dn-formula{font-family:ui-monospace,monospace;font-size:1.02rem;overflow-wrap:anywhere}
.dn-just{font-size:.82rem;color:var(--tenue);text-align:right}
.dn-line.blank{background:rgba(155,123,255,.07);border:1px dashed var(--violeta);border-radius:9px;margin:.25rem 0;cursor:pointer}
.dn-line.focus{outline:2px solid var(--ambar);background:rgba(255,185,56,.08)}
.dn-line.done .dn-just{color:var(--ok);font-weight:800}
.dn-line.revealed{border-color:var(--mal);background:rgba(255,93,122,.07)}
.dn-line.revealed .dn-just{color:var(--mal);font-weight:800}
.dn-card{cursor:pointer;touch-action:manipulation;pointer-events:auto;position:relative;z-index:1}
.dn-select{margin:.8rem 0;padding:.85rem;background:var(--panel-2);border:1px solid var(--linea);border-radius:13px}
.dn-select h3{margin:0 0 .25rem;font-size:1rem}
.dn-select p{margin:0 0 .7rem;color:var(--tenue);font-size:.88rem}
.dn-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:.5rem}
.dn-card{border:2px solid var(--linea);background:var(--panel);border-radius:10px;padding:.65rem .55rem;color:var(--crema);text-align:center;min-height:54px}
.dn-card b{display:block;color:var(--ambar);font-size:1rem}
.dn-card small{display:block;color:var(--tenue);font-size:.72rem}
.dn-card:disabled{opacity:.45;cursor:default}
.dn-feedback{padding:.7rem .8rem;border-radius:10px;margin:.65rem 0;line-height:1.4}
.dn-feedback.ok{background:rgba(79,224,160,.12);border:1px solid var(--ok)}
.dn-feedback.bad{background:rgba(255,93,122,.1);border:1px solid var(--mal)}
.dn-bottom{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:space-between;margin-top:1rem}
.dn-muted{color:var(--tenue);font-size:.86rem}
.dn-rule-detail{padding:.65rem .75rem;border-left:3px solid var(--violeta);background:var(--panel-2);border-radius:8px;margin:.5rem 0;font-size:.9rem}
@media(max-width:560px){.dn-line{grid-template-columns:1.5rem minmax(0,1fr);gap:.35rem}.dn-just{grid-column:2;text-align:left}.dn-stat{padding:.55rem}.dn-stat b{font-size:1.15rem}}
  `;
  document.head.appendChild(st);
}

function cargarProgreso() {
  try { return JSON.parse(localStorage.getItem('parcialito-ipc-dn-progreso') || '{}'); } catch { return {}; }
}
function guardarProgreso(p) {
  try { localStorage.setItem('parcialito-ipc-dn-progreso', JSON.stringify(p)); } catch {}
}
// El sonido nunca debe impedir que el ejercicio avance: si falla, se ignora.
function sonar(nombre, ...args) {
  try { Sonido[nombre]?.(...args); } catch {}
}

export function abrirDeduccionNatural({ app, volver }) {
  inyectarEstilos();
  let modo = 'mixto';
  let reglaFiltro = null;
  let cola = [];
  let totalRonda = 0;
  let actual = null;
  let lineaActiva = 0;
  let aciertos = 0;
  let errores = 0;
  let racha = 0;
  let resueltas = new Set();
  let reveladas = new Set();
  let progreso = cargarProgreso();
  let feedbackTexto = '';
  let feedbackTipo = 'ok';

  const pantallaInicio = () => {
    const total = progreso.total || 0;
    const correctas = progreso.correctas || 0;
    app.innerHTML = `
      <main class="pantalla dn-wrap">
        <button class="btn enlace" id="dn-volver">← IPC</button>
        <div class="dn-top"><span class="dn-kicker">IPC · LÓGICA FORMAL</span><span class="dn-muted">BANCO DE PRÁCTICA</span></div>
        <h1>Deducción natural</h1>
        <p class="dn-intro">Practicá con el formato del modelo: a veces están las fórmulas y faltan las justificaciones; otras veces tenés que reconstruir las fórmulas intermedias a partir de las reglas y referencias dadas.</p>
        <div class="dn-stats">
          <div class="dn-stat"><b>${BANCO.length}</b><small>variantes del modelo</small></div>
          <div class="dn-stat"><b>${correctas}</b><small>líneas correctas acumuladas</small></div>
          <div class="dn-stat"><b>${total ? Math.round(correctas / total * 100) : 0}%</b><small>precisión histórica</small></div>
        </div>
        <div class="dn-actions">
          <button class="btn primario" id="dn-mixto">Empezar práctica aleatoria</button>
          <button class="btn secundario" id="dn-todas">Recorrer banco completo · ${BANCO.length} ejercicios</button>
          <button class="btn secundario" id="dn-reiniciar">Reiniciar estadísticas</button>
        </div>
        <p class="dn-muted">Las reglas y las referencias se presentan como en el parcial. No se indica de antemano qué regla tenés que usar.</p>
      </main>`;
    app.querySelector('#dn-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
    app.querySelector('#dn-mixto').addEventListener('click', () => iniciar('mixto'));
    app.querySelector('#dn-todas').addEventListener('click', () => iniciar('todas'));
    app.querySelector('#dn-reiniciar').addEventListener('click', () => {
      if (!confirm('¿Reiniciar las estadísticas de deducción natural en este dispositivo?')) return;
      progreso = {}; guardarProgreso(progreso); pantallaInicio();
    });
  };

  function iniciar(m) {
    modo = m;
    reglaFiltro = null;
    const seleccion = [...BANCO];
    cola = MEZCLAR(seleccion);
    totalRonda = cola.length;
    aciertos = 0; errores = 0; racha = 0; actual = null;
    siguiente();
  }

  function siguiente() {
    if (!cola.length) {
      app.innerHTML = `
        <main class="pantalla dn-wrap">
          <button class="btn enlace" id="dn-volver">← Deducción natural</button>
          <h1>¡Ronda completada!</h1>
          <p class="dn-intro">Terminaste ${aciertos + errores} líneas evaluadas. Podés volver a practicar: el orden de los ejercicios cambia en cada ronda.</p>
          <div class="dn-stats"><div class="dn-stat"><b>${aciertos}</b><small>correctas</small></div><div class="dn-stat"><b>${errores}</b><small>intentos incorrectos</small></div><div class="dn-stat"><b>${Math.round(aciertos / Math.max(1, aciertos + errores) * 100)}%</b><small>precisión de la ronda</small></div></div>
          <button class="btn primario" id="dn-otra">Otra ronda</button>
        </main>`;
      app.querySelector('#dn-volver').addEventListener('click', pantallaInicio);
      app.querySelector('#dn-otra').addEventListener('click', () => iniciar(modo));
      return;
    }
    actual = cola.shift();
    resueltas = new Set();
    reveladas = new Set();
    feedbackTexto = '';
    lineaActiva = 0;
    pintarEjercicio();
  }

  function opcionesPara(ejercicio, indice) {
    const paso = ejercicio.pasos[indice];
    const correcta = claveDePaso(paso);
    const candidatas = new Set();
    BANCO.forEach(e => e.pasos.forEach(p => {
      if (!!p.hideFormula === !!paso.hideFormula && !!p.hideJustification === !!paso.hideJustification) {
        const k = claveDePaso(p);
        if (k !== correcta) candidatas.add(k);
      }
    }));
    // Se descartan los distractores que también serían respuestas válidas.
    const distractores = [...candidatas].filter(k => !opcionEsValida(k, ejercicio, indice));
    return MEZCLAR([correcta, ...MEZCLAR(distractores).slice(0, 3)]);
  }

  function pintarEjercicio() {
    const lineas = actual.premisas.map((f,i) => ({ f, just:'Premisa', blank:false, n:i+1 }));
    actual.pasos.forEach((p,i) => lineas.push({ f:resueltas.has(i) || !p.hideFormula ? p.f : '……………………', just:resueltas.has(i) || !p.hideJustification ? etiqueta(p.r,p.refs) : '………………', blank:true, done:resueltas.has(i), revealed:reveladas.has(i), n:lineas.length+1, index:i }));
    const pendientes = actual.pasos.map((_,i)=>i).filter(i=>!resueltas.has(i));
    if (!pendientes.includes(lineaActiva)) lineaActiva = pendientes[0] ?? -1;
    const seleccion = lineaActiva;
    const paso = actual.pasos[seleccion];
    const cards = paso ? opcionesPara(actual, seleccion) : [];
    const lineaInicio = actual.premisas.length + 1;
    const feedbackMarkup = feedbackTexto ? '<div class="dn-feedback '+feedbackTipo+'">' + ESCAPAR(feedbackTexto) + '</div>' : '';
    feedbackTexto = '';
    app.innerHTML = `
      <main class="pantalla dn-wrap">
        <div class="dn-top"><button class="btn enlace" id="dn-salir">← Salir</button><span class="dn-kicker">EJERCICIO ${totalRonda - cola.length} / ${totalRonda}</span></div>
        <h1>${ESCAPAR(actual.titulo)}</h1>
        <p class="dn-muted"><b>Objetivo de la deducción:</b> <code>${ESCAPAR(actual.objetivo)}</code></p>
        <p class="dn-intro">Completá los espacios siguiendo la demostración. Según el ejercicio, tendrás que justificar una fórmula o descubrir la fórmula que falta.</p>
        <div class="dn-stats"><div class="dn-stat"><b>${aciertos}</b><small>líneas correctas</small></div><div class="dn-stat"><b>${errores}</b><small>errores</small></div><div class="dn-stat"><b>${resueltas.size}/${actual.pasos.length}</b><small>líneas resueltas</small></div></div>
        <div class="dn-progress"><span style="width:${resueltas.size / actual.pasos.length * 100}%"></span></div>
        <section class="dn-proof">
          <h3>Demostración · ${actual.premisas.length + actual.pasos.length} líneas</h3>
          ${lineas.map(l => `<div class="dn-line ${l.blank?'blank':''} ${l.done?'done':''} ${l.revealed?'revealed':''} ${l.blank && !l.done && l.index===seleccion?'focus':''}" ${l.blank?'data-dn-line="'+l.index+'"':''}>
            <span class="dn-num">${l.n}.</span><span class="dn-formula">${ESCAPAR(l.f)}</span><span class="dn-just">${ESCAPAR(l.just)}</span>
          </div>`).join('')}
        </section>
        ${feedbackMarkup}
        ${paso ? `
          <section class="dn-select">
            <h3>Completá la línea ${lineaInicio + seleccion}</h3>
            <p>${paso.hideFormula && paso.hideJustification ? 'Elegí la fórmula y su justificación.' : paso.hideFormula ? 'Elegí la fórmula que se obtiene; la regla ya está indicada.' : 'Elegí la regla y las líneas que justifican la fórmula.'}</p>
            <div class="dn-cards">${cards.map(c => {
              const [tipo, a, b] = c.split('::');
              let principal = a, detalle = '';
              if (tipo === 'JUST') { const partes = a.split(' '); principal = partes[0]; detalle = 'Líneas ' + partes.slice(1).join(' y '); }
              else if (tipo === 'AMBOS') { principal = a; const partes = b.split(' '); detalle = partes[0] + ' · líneas ' + partes.slice(1).join(' y '); }
              else detalle = 'Fórmula posible';
              return `<button class="dn-card" type="button" data-dn-card="${ESCAPAR(c)}"><b>${ESCAPAR(principal)}</b><small>${ESCAPAR(detalle)}</small></button>`;
            }).join('')}</div>
            <div id="dn-feedback" aria-live="polite"></div>
          </section>` : `
          <div class="dn-feedback ok"><b>Demostración completa.</b> Todas las líneas están justificadas correctamente.</div>
          <div class="dn-rule-detail">${actual.pasos.map(p=>'<b>'+p.r+'</b>: '+ESCAPAR(reglaPista(p.r))).join('<br>')}</div>
          <button class="btn primario" id="dn-siguiente">Siguiente ejercicio →</button>`}
        <div class="dn-bottom"><span class="dn-muted">${reglaFiltro ? 'Filtro: '+reglaFiltro+' · ' : ''}Nivel ${actual.nivel} / 3</span><button class="btn secundario" id="dn-menu">Volver al módulo</button></div>
      </main>`;
    app.querySelector('#dn-salir').addEventListener('click', pantallaInicio);
    app.querySelector('#dn-menu').addEventListener('click', pantallaInicio);
    app.querySelectorAll('[data-dn-line]').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.dnLine);
      if (resueltas.has(i)) return;
      lineaActiva = i; pintarEjercicio();
    }));
    app.querySelectorAll('[data-dn-card]').forEach(tarjeta => {
      tarjeta.addEventListener('click', evento => {
        evento.preventDefault();
        evento.stopPropagation();
        comprobar(tarjeta.dataset.dnCard, seleccion);
      }, { passive: false });
    });
    app.querySelector('#dn-siguiente')?.addEventListener('click', siguiente);
  }

  function comprobar(eleccion, index) {
    const paso = actual.pasos[index];
    if (resueltas.has(index)) return;
    const correcta = claveDePaso(paso);
    if (eleccion === correcta) {
      aciertos++;
      racha++;
      progreso.total = (progreso.total || 0) + 1;
      progreso.correctas = (progreso.correctas || 0) + 1;
      guardarProgreso(progreso);
      resueltas.add(index);
      feedbackTexto = '¡Correcto! ' + paso.f + ' — ' + etiqueta(paso.r, paso.refs) + '. ' + reglaPista(paso.r);
      feedbackTipo = 'ok';
      pintarEjercicio();
      sonar('acierto', racha);
    } else {
      errores++;
      const perdioRacha = racha >= 3;
      racha = 0;
      progreso.total = (progreso.total || 0) + 1;
      guardarProgreso(progreso);
      reveladas.add(index);
      resueltas.add(index);
      feedbackTexto = 'Respuesta correcta: ' + paso.f + ' — ' + etiqueta(paso.r, paso.refs) + '. ' + (reglaPista(paso.r) || 'Revisá la regla aplicada y las líneas citadas.') + ' Continuá con el siguiente espacio.';
      feedbackTipo = 'bad';
      pintarEjercicio();
      sonar('error', perdioRacha);
    }
  }

  pantallaInicio();
}
