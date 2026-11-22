// ==========================================================
// materia.js: Pantalla de materia: elegir temas, juegos interactivos y crucigramas.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { abrirCrucigrama } from './crucigrama.js?v=dev';
import { TITULO as TITULO_COMPARADORES } from './comparadores.js?v=20261026-1';
import { TITULO as TITULO_ATLAS_CROMOSOMAS } from './atlas-cromosomas.js?v=20261110-1';
import { abrirDeduccionNatural } from './deduccion-natural.js?v=20261114-10';
import { abrirFormalizacion, BANCO_ENUNCIADOS, BANCO_ARGUMENTOS, FORMULAS_ESTRUCTURA } from './formalizacion.js?v=20261114-2';
import { abrirComposicionQuimica } from './composicion-quimica.js?v=20261116-1';
import { ACTIVIDADES } from './actividades.js';
import { lanzarTarjetasTemas } from './anki.js';
import { resumenDominioTema, tieneContenido } from './datos.js';
import { vistaInicio } from './home.js';
import { lanzarIPCPrimerParcial, vistaIPCSegundoParcial } from './ipc.js';
import { S, app, avisar, colorMateria, esc, plural } from './nucleo.js';
import { lanzarPracticaTema, lanzarTemas } from './partidas.js';

const BANCO_FORMALIZACION = BANCO_ENUNCIADOS.length + BANCO_ARGUMENTOS.length + FORMULAS_ESTRUCTURA.length;

// Actividades disponibles en una materia (sin repetir) según el campo "actividad" de sus temas
// "actividad" puede ser un texto o una lista de textos. Devuelve una entrada por (actividad, tema).
function actividadesDe(m) {
  const lista = [];
  for (const t of m.temas) {
    const claves = [].concat(t.actividad || []);
    for (const clave of claves) if (ACTIVIDADES[clave] && clave !== 'cuadro') lista.push({ clave, titulo: ACTIVIDADES[clave].titulo, icono: ACTIVIDADES[clave].icono || '🧩', tema: t });
  }
  // El laboratorio es una actividad autónoma: aparece una sola vez en las materias de Biología.
  if (/biolog/i.test((m.id || '') + ' ' + (m.nombre || ''))) {
    lista.push({ clave: 'operones', titulo: ACTIVIDADES.operones.titulo, icono: ACTIVIDADES.operones.icono, tema: null });
    lista.push({ clave: 'comunicacion', titulo: ACTIVIDADES.comunicacion.titulo, icono: ACTIVIDADES.comunicacion.icono, tema: null });
    lista.push({ clave: 'proteina-g', titulo: ACTIVIDADES['proteina-g'].titulo, icono: ACTIVIDADES['proteina-g'].icono, tema: null });
    if (m.id === 'biologia-celular2') {
      lista.push({ clave: 'atlas-cromosomas', titulo: TITULO_ATLAS_CROMOSOMAS, icono: '🧬', tema: null });
    }
    const temaCuadro = m.temas.find(t => [].concat(t.actividad || []).includes('cuadro'));
    if (temaCuadro) lista.push({ clave: 'comparadores', titulo: TITULO_COMPARADORES, icono: '⚖️', tema: temaCuadro });
  }
  return lista;
}

// Temas que tienen crucigrama ("actividad": [..., "crucigrama"]): salen como una fila propia debajo del tema
const tieneCrucigrama = (t) => [].concat(t.actividad || []).includes('crucigrama');

// Mejor resultado guardado de los crucigramas de un tema (el más estrellas y, a igual estrellas, el más rápido)
function mejorCrucigrama(t) {
  let mejor = null;
  for (const [k, g] of Object.entries(estado.crucigramas || {})) {
    if ((k === t.id || k.startsWith(`${t.id}#`)) && g?.mejor) {
      if (!mejor || g.mejor.estrellas > mejor.estrellas || (g.mejor.estrellas === mejor.estrellas && g.mejor.seg < mejor.seg)) mejor = g.mejor;
    }
  }
  return mejor;
}

function vistaSelectorJuegos(m, indiceMateria, actividades) {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver-selector">← ${esc(m.nombre)}</button>
      <div class="titulo-materia"><span class="emoji" aria-hidden="true">🎮</span><h1>Juegos interactivos</h1></div>
      <p class="bajada">Elegí una actividad para explorar el tema de forma visual e interactiva.</p>
      <div class="temas selector-juegos">
        ${actividades.map((a, n) => {
          const detalle = a.tema ? a.tema.nombre : (a.titulo.includes(':') ? a.titulo.slice(a.titulo.indexOf(':') + 1).trim() : 'Actividad interactiva');
          return `<button class="tema-cruci" data-juego="${n}">
            <span class="ic" aria-hidden="true">${esc(a.icono || '🧩')}</span>
            <span class="cuerpo"><span class="nombre">${esc(a.titulo)}</span><span class="detalle">${esc(detalle)}</span></span>
            <b aria-hidden="true">▶</b>
          </button>`;
        }).join('')}
      </div>
    </main>`;
  document.getElementById('btn-volver-selector').addEventListener('click', () => { Sonido.clic(); vistaMateria(indiceMateria); });
  app.querySelectorAll('[data-juego]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const a = actividades[Number(b.dataset.juego)];
    ACTIVIDADES[a.clave].abrir({ app, volver: () => vistaSelectorJuegos(m, indiceMateria, actividades), tema: a.tema, materia: m });
  }));
  window.scrollTo(0, 0);
}

function vistaSelectorCrucigramas(m, indiceMateria) {
  const temas = m.temas.filter(tieneCrucigrama);
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver-selector">← ${esc(m.nombre)}</button>
      <div class="titulo-materia"><span class="emoji" aria-hidden="true">🔤</span><h1>Crucigramas</h1></div>
      <p class="bajada">Elegí el tema del crucigrama que querés resolver.</p>
      <div class="temas selector-crucigramas">
        ${temas.map((t, n) => {
          const rec = mejorCrucigrama(t);
          return `<button class="tema-cruci" data-crucigrama="${n}">
            <span class="ic" aria-hidden="true">🔤</span>
            <span class="cuerpo"><span class="nombre">${esc(t.nombre)}</span><span class="detalle">Completá el tablero con las pistas</span></span>
            ${rec ? `<span class="mejor">${'★'.repeat(rec.estrellas)}</span>` : '<b aria-hidden="true">▶</b>'}
          </button>`;
        }).join('')}
      </div>
    </main>`;
  document.getElementById('btn-volver-selector').addEventListener('click', () => { Sonido.clic(); vistaMateria(indiceMateria); });
  app.querySelectorAll('[data-crucigrama]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    abrirCrucigrama({ app, volver: () => vistaSelectorCrucigramas(m, indiceMateria), tema: temas[Number(b.dataset.crucigrama)], materia: m });
  }));
  window.scrollTo(0, 0);
}

export function vistaMateria(i) {
  const m = S.indice.materias[i];
  const color = colorMateria(m, i);
  const opcionesCantidad = [[10, '10'], [20, '20'], [0, 'Todas']];
  const temasEnSubsecciones = new Set((m.subsecciones || []).flatMap((s) => (s.grupos || []).flatMap((g) => g.temaIds || [])));

  const filas = m.temas.map((t, n) => {
    if (temasEnSubsecciones.has(t.id)) return '';
    const mejor = estado.mejores[t.id];
    const nPreg = t.preguntas || 0;
    const nTarj = t.tarjetas || 0;
    const dominioTema = resumenDominioTema(t);

    let textoDetalle = '';
    if (nPreg > 0 && nTarj > 0) {
      textoDetalle = `${plural(nPreg, 'pregunta', 'preguntas')} · ${plural(nTarj, 'tarjeta', 'tarjetas')}`;
    } else if (nTarj > 0) {
      textoDetalle = '🃏 ' + plural(nTarj, 'tarjeta', 'tarjetas');
    } else {
      textoDetalle = plural(nPreg, 'pregunta', 'preguntas');
    }

    if (dominioTema.dominadas) {
      textoDetalle += ` · ${dominioTema.dominadas} dominadas`;
    }

    // Un tema sin preguntas ni tarjetas (solo crucigrama u otra actividad) no se muestra acá:
    // se juega desde "Crucigramas" o "Juegos interactivos". Así nunca aparece un "0 preguntas".
    if (!tieneContenido(t)) return '';

    const barraDominio = nPreg > 0 ? `
      <span class="tema-progreso" role="progressbar" aria-label="Dominio de ${esc(t.nombre)}" aria-valuemin="0" aria-valuemax="${dominioTema.total}" aria-valuenow="${dominioTema.dominadas}">
        <span class="tema-progreso-relleno" style="width:${dominioTema.porcentaje}%"></span>
      </span>
      <span class="tema-progreso-detalle">${dominioTema.dominadas}/${dominioTema.total} dominadas</span>` : '';

    return `
      <div class="tema-item">
        <label class="tema" style="--c:${color}">
          <input type="checkbox" data-n="${n}" checked>
          <span class="cuerpo">
            <span class="nombre">${esc(t.nombre)} ${dominioTema.completo ? '<span class="coronita" role="img" aria-label="Tema completamente dominado" title="Tema completamente dominado">👑</span>' : ''}</span><br>
            <span class="detalle">${textoDetalle}</span>
            ${barraDominio}
          </span>
          ${mejor ? `<span class="mejor ${mejor.precision >= 80 ? 'alto' : ''}">Mejor ${mejor.precision}%</span>` : ''}
        </label>
        ${nPreg > 0 ? `<div class="tema-practicas">
          ${dominioTema.pendientes > 0 ? `<button type="button" class="tema-practica-link" data-practicar-pendientes="${n}">Practicar no dominadas <span>${dominioTema.pendientes}</span></button>` : '<span class="tema-practica-completo">Todas dominadas</span>'}
          <button type="button" class="tema-practica-link" data-practicar-todas="${n}">Practicar todas <span>${nPreg}</span></button>
        </div>` : ''}
      </div>`;
  }).join('');

  const actividades = actividadesDe(m);
  const subseccionesMarkup = (m.subsecciones || []).map((seccion, indiceSeccion) => {
    const ids = (seccion.grupos || []).flatMap((g) => g.temaIds || []);
    const total = m.temas.filter((t) => ids.includes(t.id)).reduce((suma, t) => suma + (t.preguntas || 0), 0);
    return `<button type="button" class="banner-repaso" data-abrir-subseccion="${indiceSeccion}"><span>${esc(seccion.emoji || '⚗️')} ${esc(seccion.nombre)}<small>${esc(seccion.descripcion || '')} · ${plural(total, 'pregunta multiple choice', 'preguntas multiple choice')}</small></span><b>↗</b></button>`;
  }).join('');

  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Materias</button>
      <div class="titulo-materia">
        <span class="emoji" aria-hidden="true">${esc(m.emoji || '📚')}</span>
        <h1>${esc(m.nombre)}</h1>
      </div>
      ${m.primerParcial ? `<button class="banner-repaso ipc-p1-entry" id="btn-ipc-p1"><span>📘 Primer parcial de IPC<small>${m.primerParcial.preguntas} preguntas · banco completo</small></span><b>▶</b></button>` : ''}
      ${m.segundoParcial ? `<button class="banner-repaso ipc-p2-entry" id="btn-ipc-p2"><span>📜 Segundo parcial de IPC<small>${m.segundoParcial.preguntas} preguntas · ${m.segundoParcial.tarjetas} tarjetas · modelo de 9 puntos</small></span><b>▶</b></button>` : ''}
      ${m.id === 'ipc-2' ? '<button class="banner-repaso" id="btn-ipc-deduccion"><span>🧩 Deducción natural<small>16 ejercicios con variantes · MP, MT, SH, SD, DN, Simp. y Conj.</small></span><b>▶</b></button>' : ''}
      ${m.id === 'ipc-2' ? '<button class="banner-repaso" id="btn-ipc-formalizacion"><span>🔣 Formalización<small>' + BANCO_FORMALIZACION + ' ejercicios · enunciados, argumentos y estructura de fórmulas</small></span><b>▶</b></button>' : ''}
      ${actividades.length ? `<button class="banner-repaso" id="btn-grupo-juegos"><span>🎮 Juegos interactivos<small>${plural(actividades.length, 'juego disponible', 'juegos disponibles')} · elegí cuál abrir</small></span><b>▶</b></button>` : ''}
      ${m.temas.some(tieneCrucigrama) ? `<button class="banner-repaso" id="btn-grupo-crucigramas"><span>🔤 Crucigramas<small>${plural(m.temas.filter(tieneCrucigrama).length, 'crucigrama disponible', 'crucigramas disponibles')} · elegí un tema</small></span><b>▶</b></button>` : ''}
      ${subseccionesMarkup}
      <div class="temas-barra">
        <span>Temas</span>
        <button class="btn enlace" id="btn-todos"></button>
      </div>
      <div class="temas">${filas}</div>
      <details class="banco-materia">
        <summary class="banco-materia-cabecera">
          <span class="banco-materia-textos">
            <strong id="banco-materia-titulo">Banco de preguntas</strong>
            <small>Ver todas las preguntas de cada tema, con sus opciones y respuestas correctas.</small>
          </span>
          <span class="banco-materia-flecha" aria-hidden="true">▾</span>
        </summary>
        <div class="banco-materia-temas" id="banco-materia-temas">
          ${m.temas.map((t,n)=>(!temasEnSubsecciones.has(t.id) && t.preguntas>0) ? `<button type="button" class="banco-materia-tema" data-banco-tema="${n}"><span>${esc(t.nombre)}</span><small>${t.preguntas} preguntas</small></button>` : '').join('')}
        </div>
      </details>
    </main>
    <div class="pie-fijo">
      <div class="interior">
        <div class="segmentos" role="radiogroup" aria-label="Cantidad de preguntas">
          ${opcionesCantidad.map(([v, txt]) => `
            <label><input type="radio" name="cantidad" value="${v}" ${estado.cantidad === v ? 'checked' : ''}><span>${txt}</span></label>`).join('')}
        </div>
        <div class="grupo-botones">
          <button class="btn primario" id="btn-empezar"></button>
        </div>
      </div>
    </div>`;

  const checks = [...app.querySelectorAll('.tema input')];
  const btnEmpezar = document.getElementById('btn-empezar');
  const btnTodos = document.getElementById('btn-todos');

  const seleccionados = () => checks.filter((c) => c.checked).map((c) => m.temas[Number(c.dataset.n)]);
  const cantidadElegida = () => Number(app.querySelector('input[name="cantidad"]:checked')?.value ?? 10);

  function actualizar() {
    const sel = seleccionados();
    const totalPreg = sel.reduce((s, t) => s + (t.preguntas || 0), 0);
    const totalTarj = sel.reduce((s, t) => s + (t.tarjetas || 0), 0);
    const c = cantidadElegida();
    const jugar = c === 0 ? totalPreg : Math.min(c, totalPreg);

    if (sel.length === 0) {
      btnEmpezar.disabled = true;
      btnEmpezar.textContent = 'Elegí un tema';
    } else if (totalPreg === 0 && totalTarj > 0) {
      btnEmpezar.disabled = false;
      btnEmpezar.textContent = `🃏 Ver tarjetas (${totalTarj})`;
    } else {
      btnEmpezar.disabled = totalPreg === 0;
      btnEmpezar.textContent = `Empezar (${jugar})`;
    }

    btnTodos.textContent = sel.length === checks.length ? 'Quitar todos' : 'Elegir todos';
  }

  app.querySelectorAll('[data-practicar-todas]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    lanzarPracticaTema(m, m.temas[Number(b.dataset.practicarTodas)], i, false);
  }));
  app.querySelectorAll('[data-practicar-pendientes]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    lanzarPracticaTema(m, m.temas[Number(b.dataset.practicarPendientes)], i, true);
  }));

  // El banco de cada tema va abajo de todo: cada botón abre el listado completo del tema (js/banco-temas.js).
  app.querySelectorAll('[data-banco-tema]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const tema = m.temas[Number(b.dataset.bancoTema)];
    if (window.ParcialitoBanco?.abrir) window.ParcialitoBanco.abrir(tema, m);
    else avisar('El banco de preguntas todavía no cargó. Probá de nuevo en un segundo.');
  }));
  checks.forEach((c) => c.addEventListener('change', () => { Sonido.clic(); actualizar(); }));
  app.querySelectorAll('input[name="cantidad"]').forEach((r) =>
    r.addEventListener('change', () => { estado.cantidad = cantidadElegida(); guardar(); Sonido.clic(); actualizar(); }));
  btnTodos.addEventListener('click', () => {
    const marcar = seleccionados().length !== checks.length;
    checks.forEach((c) => (c.checked = marcar));
    Sonido.clic();
    actualizar();
  });
  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  app.querySelectorAll('[data-abrir-subseccion]').forEach((boton) => boton.addEventListener('click', () => {
    Sonido.clic();
    const seccion = m.subsecciones?.[Number(boton.dataset.abrirSubseccion)];
    if (!seccion) return;
    abrirComposicionQuimica({
      app, materia: m, subseccion: seccion,
      volver: () => vistaMateria(i),
      iniciar: (temas, cantidad, volver) => lanzarTemas(m, temas, cantidad, volver),
      practicar: (tema, pendientes, volver) => lanzarPracticaTema(m, tema, i, pendientes, volver),
      resumenDominioTema,
      abrirBanco: (tema) => {
        if (window.ParcialitoBanco?.abrir) window.ParcialitoBanco.abrir(tema, m);
        else avisar('El banco de preguntas todavía no cargó. Probá de nuevo en un segundo.');
      },
      cantidadActual: estado.cantidad,
      guardarCantidad: (cantidad) => { estado.cantidad = cantidad; guardar(); }
    });
  }));
  document.getElementById('btn-ipc-p1')?.addEventListener('click', () => { Sonido.clic(); lanzarIPCPrimerParcial(m, i, () => vistaMateria(i)); });
  document.getElementById('btn-ipc-p2')?.addEventListener('click', () => {
    Sonido.clic();
    vistaIPCSegundoParcial(m, i);
  });
  document.getElementById('btn-ipc-deduccion')?.addEventListener('click', () => {
    Sonido.clic();
    abrirDeduccionNatural({ app, volver: () => vistaMateria(i), materia: m });
  });
  document.getElementById('btn-ipc-formalizacion')?.addEventListener('click', () => {
    Sonido.clic();
    abrirFormalizacion({ app, volver: () => vistaMateria(i), materia: m });
  });
  document.getElementById('btn-grupo-juegos')?.addEventListener('click', () => {
    Sonido.clic();
    vistaSelectorJuegos(m, i, actividades);
  });
  document.getElementById('btn-grupo-crucigramas')?.addEventListener('click', () => {
    Sonido.clic();
    vistaSelectorCrucigramas(m, i);
  });

  btnEmpezar.addEventListener('click', () => {
    Sonido.clic();
    const sel = seleccionados();
    const totalPreg = sel.reduce((s, t) => s + (t.preguntas || 0), 0);
    const totalTarj = sel.reduce((s, t) => s + (t.tarjetas || 0), 0);

    if (totalPreg === 0 && totalTarj > 0) {
      lanzarTarjetasTemas(m, sel);
    } else {
      lanzarTemas(m, sel, cantidadElegida());
    }
  });

  actualizar();
  window.scrollTo(0, 0);
}
