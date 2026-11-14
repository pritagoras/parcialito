// ==========================================================
// Deducción natural para IPC: práctica interactiva por reglas.
// Se abre desde Juegos interactivos de la materia IPC.
// Banco procedural: 10 estructuras de demostración x 8 sustituciones
// de letras = 120 ejercicios, con práctica por regla y modo mixto.
// ==========================================================

import { Sonido } from './sonido.js?v=dev';

export const TITULO = 'Deducción natural: completá las demostraciones';

const REGLAS = {
  MP: { nombre: 'Modus Ponens', forma: 'Si p → q y p, entonces q.', pista: 'Se afirma el antecedente de un condicional.' },
  MT: { nombre: 'Modus Tollens', forma: 'Si p → q y ¬q, entonces ¬p.', pista: 'Se niega el consecuente para negar el antecedente.' },
  SH: { nombre: 'Silogismo hipotético', forma: 'Si p → q y q → r, entonces p → r.', pista: 'Se encadenan dos condicionales.' },
  SD: { nombre: 'Silogismo disyuntivo', forma: 'Si p ∨ q y ¬p, entonces q.', pista: 'Se elimina una alternativa de la disyunción.' },
  DN: { nombre: 'Doble negación', forma: '¬¬p equivale a p.', pista: 'Se eliminan dos negaciones juntas (o se introducen).' }
};

const PLANTILLAS = [
  {
    id: 'mp-directo', titulo: 'Aplicación directa de MP', nivel: 1,
    premisas: ['p → q', 'p'],
    pasos: [{ f: 'q', r: 'MP', refs: [1, 2] }]
  },
  {
    id: 'mt-directo', titulo: 'Aplicación directa de MT', nivel: 1,
    premisas: ['p → q', '¬q'],
    pasos: [{ f: '¬p', r: 'MT', refs: [1, 2] }]
  },
  {
    id: 'sh-directo', titulo: 'Aplicación directa de SH', nivel: 1,
    premisas: ['p → q', 'q → r'],
    pasos: [{ f: 'p → r', r: 'SH', refs: [1, 2] }]
  },
  {
    id: 'sd-directo', titulo: 'Aplicación directa de SD', nivel: 1,
    premisas: ['p ∨ q', '¬p'],
    pasos: [{ f: 'q', r: 'SD', refs: [1, 2] }]
  },
  {
    id: 'dn-directo', titulo: 'Aplicación directa de DN', nivel: 1,
    premisas: ['¬¬p'],
    pasos: [{ f: 'p', r: 'DN', refs: [1] }]
  },
  {
    id: 'mp-cadena', titulo: 'Encadenamiento por MP', nivel: 1,
    premisas: ['p → q', 'q → r', 'p'],
    pasos: [{ f: 'q', r: 'MP', refs: [1, 3] }, { f: 'r', r: 'MP', refs: [2, 4] }]
  },
  {
    id: 'mt-cadena', titulo: 'Negación encadenada', nivel: 2,
    premisas: ['p → q', 'q → r', '¬r'],
    pasos: [{ f: '¬q', r: 'MT', refs: [2, 3] }, { f: '¬p', r: 'MT', refs: [1, 4] }]
  },
  {
    id: 'mt-sd', titulo: 'De un condicional a una disyunción', nivel: 2,
    premisas: ['p ∨ q', 'q → r', '¬r'],
    pasos: [{ f: '¬q', r: 'MT', refs: [2, 3] }, { f: 'p', r: 'SD', refs: [1, 4] }]
  },
  {
    id: 'dn-mp', titulo: 'Doble negación y afirmación', nivel: 1,
    premisas: ['¬¬p', 'p → q'],
    pasos: [{ f: 'p', r: 'DN', refs: [1] }, { f: 'q', r: 'MP', refs: [2, 3] }]
  },
  {
    id: 'sh-mt', titulo: 'Encadenar y negar', nivel: 3,
    premisas: ['p → q', 'q → r', 'r → s', '¬s'],
    pasos: [{ f: 'p → r', r: 'SH', refs: [1, 2] }, { f: 'p → s', r: 'SH', refs: [5, 3] }, { f: '¬p', r: 'MT', refs: [6, 4] }]
  },
  {
    id: 'dn-sd', titulo: 'Doble negación y silogismo disyuntivo', nivel: 2,
    premisas: ['p ∨ q', '¬¬¬p'],
    pasos: [{ f: '¬p', r: 'DN', refs: [2] }, { f: 'q', r: 'SD', refs: [1, 3] }]
  },
  {
    id: 'sh-mp', titulo: 'Silogismo hipotético y MP', nivel: 3,
    premisas: ['p → q', 'q → r', 'r → s', 'p'],
    pasos: [{ f: 'p → r', r: 'SH', refs: [1, 2] }, { f: 'p → s', r: 'SH', refs: [5, 3] }, { f: 's', r: 'MP', refs: [6, 4] }]
  },
  {
    id: 'mt-sd-mp', titulo: 'Resolver una alternativa', nivel: 3,
    premisas: ['p ∨ q', 'p → r', '¬r', 'q → s'],
    pasos: [{ f: '¬p', r: 'MT', refs: [2, 3] }, { f: 'q', r: 'SD', refs: [1, 5] }, { f: 's', r: 'MP', refs: [4, 6] }]
  },
  {
    id: 'sd-mt', titulo: 'Descartar una opción', nivel: 2,
    premisas: ['p ∨ q', 'p → r', '¬r'],
    pasos: [{ f: '¬p', r: 'MT', refs: [2, 3] }, { f: 'q', r: 'SD', refs: [1, 4] }]
  },
  {
    id: 'dn-mt-mp', titulo: 'Combinar tres reglas', nivel: 3,
    premisas: ['¬¬p', 'p → q', 'q → r', '¬r'],
    pasos: [{ f: 'p', r: 'DN', refs: [1] }, { f: '¬q', r: 'MT', refs: [3, 4] }, { f: '¬p', r: 'MT', refs: [2, 6] }]
  },
  {
    id: 'cadena-cuatro-pasos', titulo: 'Construir una cadena completa', nivel: 3,
    premisas: ['p → q', 'q → r', 'r → s', 's → t', 'p'],
    pasos: [{ f: 'p → r', r: 'SH', refs: [1, 2] }, { f: 'p → s', r: 'SH', refs: [6, 3] }, { f: 'p → t', r: 'SH', refs: [7, 4] }, { f: 't', r: 'MP', refs: [8, 5] }]
  },
  {
    id: 'mixto-cuatro-pasos', titulo: 'Resolver y encadenar cuatro pasos', nivel: 3,
    premisas: ['p → q', 'q → r', '¬r', 'p ∨ s', 's → t'],
    pasos: [{ f: '¬q', r: 'MT', refs: [2, 3] }, { f: '¬p', r: 'MT', refs: [1, 6] }, { f: 's', r: 'SD', refs: [4, 7] }, { f: 't', r: 'MP', refs: [5, 8] }]
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
      // La rotación conserva símbolos distintos dentro de cada demostración.
      const premisas = plantilla.premisas.map(x => reemplazarLetras(x, mapa));
      const pasos = plantilla.pasos.map(x => ({ ...x, f: reemplazarLetras(x.f, mapa) }));
      banco.push({
        id: plantilla.id + '-' + variante,
        titulo: plantilla.titulo,
        nivel: plantilla.nivel,
        premisas,
        pasos,
        reglas: [...new Set(pasos.map(x => x.r))]
      });
    }
  });
  return banco;
}
const BANCO = crearBanco();

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
        <p class="dn-intro">Completá demostraciones línea por línea. Elegí una línea vacía y colocá la ficha con la regla y las líneas que justifican el paso. Cada respuesta se corrige al instante.</p>
        <div class="dn-stats">
          <div class="dn-stat"><b>${BANCO.length}</b><small>ejercicios disponibles</small></div>
          <div class="dn-stat"><b>${correctas}</b><small>líneas correctas acumuladas</small></div>
          <div class="dn-stat"><b>${total ? Math.round(correctas / total * 100) : 0}%</b><small>precisión histórica</small></div>
        </div>
        <div class="dn-actions">
          <button class="btn primario" id="dn-mixto">Empezar práctica aleatoria</button>
          <button class="btn secundario" id="dn-todas">Recorrer banco completo · ${BANCO.length} ejercicios</button>
          <button class="btn secundario" id="dn-reiniciar">Reiniciar estadísticas</button>
        </div>
        <p class="dn-muted">El banco combina ejercicios de una regla y demostraciones encadenadas de dificultad creciente. Las letras proposicionales cambian entre variantes.</p>
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
    reglaFiltro = Object.hasOwn(REGLAS, m) ? m : null;
    const seleccion = [...BANCO];
    cola = MEZCLAR(seleccion);
    totalRonda = cola.length;
    aciertos = 0; errores = 0; actual = null;
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

  function opcionesPara(paso, index) {
    const correcta = paso.f + '||' + etiqueta(paso.r, paso.refs);
    const candidatas = [];
    BANCO.forEach(e => e.pasos.forEach(p => {
      const opcion = p.f + '||' + etiqueta(p.r, p.refs);
      if (opcion !== correcta && !candidatas.includes(opcion)) candidatas.push(opcion);
    }));
    return MEZCLAR([correcta, ...MEZCLAR(candidatas).slice(0,3)]);
  }

  function pintarEjercicio() {
    const lineas = actual.premisas.map((f,i) => ({ f, just:'Premisa', blank:false, n:i+1 }));
    actual.pasos.forEach((p,i) => lineas.push({ f:resueltas.has(i) ? p.f : '……………………', just:resueltas.has(i) ? etiqueta(p.r,p.refs) : '¿Qué sigue?', blank:true, done:resueltas.has(i), revealed:reveladas.has(i), n:lineas.length+1, index:i }));
    const pendientes = actual.pasos.map((_,i)=>i).filter(i=>!resueltas.has(i));
    if (!pendientes.includes(lineaActiva)) lineaActiva = pendientes[0] ?? -1;
    const seleccion = lineaActiva;
    const paso = actual.pasos[seleccion];
    const cards = paso ? opcionesPara(paso, seleccion) : [];
    const lineaInicio = actual.premisas.length + 1;
    const feedbackMarkup = feedbackTexto ? '<div class="dn-feedback '+feedbackTipo+'">' + ESCAPAR(feedbackTexto) + '</div>' : '';
    feedbackTexto = '';
    app.innerHTML = `
      <main class="pantalla dn-wrap">
        <div class="dn-top"><button class="btn enlace" id="dn-salir">← Salir</button><span class="dn-kicker">EJERCICIO ${totalRonda - cola.length} / ${totalRonda}</span></div>
        <h1>${ESCAPAR(actual.titulo)}</h1>
        <p class="dn-intro">Completá cada espacio: elegí qué fórmula se obtiene y qué regla permite obtenerla. Las reglas están mezcladas; no hay pistas por categoría.</p>
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
            <h3>Justificá la línea ${lineaInicio + seleccion}: <code>${ESCAPAR(paso.f)}</code></h3>
            <p>Elegí la ficha con la regla y las líneas utilizadas.</p>
            <div class="dn-cards">${cards.map(c => {
              const [formula, just] = c.split('||');
              const [regla, ...nums] = just.split(' ');
              return `<button class="dn-card" type="button" data-dn-card="${ESCAPAR(c)}"><b>${ESCAPAR(formula)}</b><small>${regla} · líneas ${nums.join(' y ')}</small></button>`;
            }).join('')}</div>
            <div id="dn-feedback" aria-live="polite"></div>
          </section>` : `
          <div class="dn-feedback ok"><b>Demostración completa.</b> Todas las líneas están justificadas correctamente.</div>
          <div class="dn-rule-detail">${actual.pasos.map(p=>'<b>'+p.r+'</b>: '+ESCAPAR(REGLAS[p.r].pista)).join('<br>')}</div>
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
    app.onclick = (evento) => {
      const tarjeta = evento.target.closest('[data-dn-card]');
      if (tarjeta && app.contains(tarjeta)) comprobar(tarjeta.dataset.dnCard, seleccion);
    };
    app.querySelector('#dn-siguiente')?.addEventListener('click', siguiente);
  }

  function comprobar(eleccion, index) {
    const paso = actual.pasos[index];
    const correcta = paso.f + '||' + etiqueta(paso.r, paso.refs);
    const feedback = app.querySelector('#dn-feedback');
    if (eleccion === correcta) {
      aciertos++;
      progreso.total = (progreso.total || 0) + 1;
      progreso.correctas = (progreso.correctas || 0) + 1;
      guardarProgreso(progreso);
      resueltas.add(index);
      feedbackTexto = '¡Correcto! ' + paso.f + ' se obtiene por ' + paso.r + ' usando las líneas ' + paso.refs.join(' y ') + '. ' + REGLAS[paso.r].pista;
      feedbackTipo = 'ok';
      Sonido.acierto?.();
      pintarEjercicio();
    } else {
      errores++;
      progreso.total = (progreso.total || 0) + 1;
      guardarProgreso(progreso);
      reveladas.add(index);
      resueltas.add(index);
      feedbackTexto = 'No era esa. La respuesta correcta es: ' + paso.f + ' — ' + etiqueta(paso.r, paso.refs) + '. ' + REGLAS[paso.r].pista + ' Seguimos con el próximo paso.';
      feedbackTipo = 'bad';
      Sonido.error?.();
      pintarEjercicio();
    }
  }

  pantallaInicio();
}
