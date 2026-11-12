// Fragmentos de js/app.js que usaba IPC (sacados de la página principal el 2026-11-12).
// Para volver a activarlo, ver backups/README.md.

// ===== 1) Import (arriba de app.js) =====
import { abrirGuiaKuhn } from './guia-kuhn.js?v=dev';

// ===== 2) HTML del banner en vistaInicio() (iba después del banner de Maru, antes del botón LAB) =====
/*
      <section class="banner-segundo banner-ipc-segundo" aria-labelledby="ipc-segundo-parcial-titulo">
        <div class="sp-cabecera"><span class="sp-sello">✦ ESPACIO DE ESTUDIO</span><span class="sp-numero">IPC · 02</span></div>
        <h2 id="ipc-segundo-parcial-titulo">Segundo parcial · IPC</h2>
        <p class="sp-descripcion">Prepará Hacking, Popper, Foucault y Kuhn con el modelo de examen, variantes y banco de preguntas.</p>
        <button class="sp-tema" id="btn-ipc-segundo-home" type="button">
          <span class="sp-tema-icono" aria-hidden="true">📜</span>
          <span class="sp-tema-texto"><strong>Entrar al segundo parcial de IPC</strong><small>261 preguntas · 9 puntos del modelo de parcial</small></span>
          <span class="sp-tema-accion">Practicar <b aria-hidden="true">↗</b></span>
        </button>
      </section>
*/

// ===== 3) Listener en vistaInicio() (iba después de btn-megaclase) =====
  document.getElementById('btn-ipc-segundo-home')?.addEventListener('click', () => {
    Sonido.clic();
    const ipcIndex = indice.materias.findIndex((m) => m.id === 'ipc-2');
    const ipcMateria = indice.materias[ipcIndex];
    if (ipcMateria?.segundoParcial) vistaIPCSegundoParcial(ipcMateria, ipcIndex, vistaInicio);
    else avisar('No se encontró el banco del Segundo Parcial de IPC.');
  });

// ===== 4) Listener en vistaMateria() (iba después de btn-grupo-crucigramas) =====
  document.getElementById('btn-ipc-p2')?.addEventListener('click', () => {
    Sonido.clic();
    vistaIPCSegundoParcial(m, i);
  });

// ===== 5) Bloque completo de funciones (iba entre vistaMateria() y '// ---------- Armado de partidas') =====
// ---------- IPC: modelo de parcial por puntos ----------
const IPC_MODELO_PARCIAL = [
  { id:'p1', numero:1, autorClave:'hacking', autorEtiqueta:'Hacking', titulo:'Ciencias humanas y clasificaciones', consigna:'Tesis de Hacking sobre cómo las clasificaciones de las ciencias humanas interactúan con las personas clasificadas.', subtemas:['Clases humanas e indiferentes','Nominalismo dinámico y making up people','Ontología histórica y tipos humanos','Ontología histórica','Representar e intervenir / realismo de entidades'] },
  { id:'p2', numero:2, autorClave:'hacking', autorEtiqueta:'Hacking', titulo:'Nicho ecológico', consigna:'Reconocer qué significa “nicho ecológico” dentro del análisis de Hacking.', subtemas:['Nicho ecológico y cuatro vectores'] },
  { id:'p3', numero:3, autorClave:'popper', autorEtiqueta:'Popper', titulo:'Psicologismo y enunciados básicos', consigna:'Identificar por qué Popper rechaza fundamentar los enunciados básicos en estados psicológicos o percepciones privadas.', subtemas:['Base empírica y trilema de Fries','Enunciados básicos y convención','Síntesis de Popper'] },
  { id:'p4', numero:4, autorClave:'popper', autorEtiqueta:'Popper', titulo:'Cuándo una teoría está falsada', consigna:'Distinguir falsabilidad, falsación efectiva, corroboración y verificación.', subtemas:['Estructura lógica de la falsación','Falsación, corroboración y verificación','Demarcación y falsabilidad'] },
  { id:'p5', numero:5, autorClave:'foucault', autorEtiqueta:'Foucault', titulo:'Ciencias humanas y modernidad política', consigna:'Relacionar la emergencia de las ciencias humanas con las formas modernas de organización política.', subtemas:['Ciencias humanas y modernidad política','Síntesis Foucault','Técnicas disciplinarias','Panoptismo y visibilidad'] },
  { id:'p6', numero:6, autorClave:'foucault', autorEtiqueta:'Foucault', titulo:'Concepción relacional del poder', consigna:'Reconocer el poder como una relación productiva y capilar, no como una cosa que alguien posee.', subtemas:['Concepción relacional, microfísica y saber-poder','Concepción relacional y productiva del poder','Microfísica del poder y saber-poder','Genealogía y transformación del castigo'] },
  { id:'p7', numero:7, autorClave:'kuhn', autorEtiqueta:'Kuhn', titulo:'Revolución científica y cambio de paradigma', consigna:'Consigna de desarrollo convertida a opción múltiple: explicar por qué una revolución no equivale a reemplazar un paradigma falso o refutado por otro definitivamente verdadero.', subtemas:['Revolución científica','Pérdida kuhniana','Paradigma y matriz disciplinar','Valores y elección de paradigmas','Síntesis de Kuhn','Paradigma, matriz disciplinar y ciencia normal','Valores, elección y carga teórica','Carga teórica y Gestalt'] },
  { id:'p8', numero:8, autorClave:'hacking', autorEtiqueta:'Hacking', titulo:'Clase interactiva', consigna:'Definir una clase interactiva y distinguirla de una clasificación indiferente.', subtemas:['Clases humanas e indiferentes','Efecto de bucle','Nominalismo dinámico y making up people'] },
  { id:'p9', numero:9, autorClave:'kuhn', autorEtiqueta:'Kuhn', titulo:'Situación problemática: anomalía, enigma o crisis', consigna:'Caso de referencia: una señal de radio no encaja con las leyes astrofísicas aceptadas; se revisan varias veces la calibración y el software, pero la anomalía persiste. Identificar y justificar el concepto kuhniano.', subtemas:['Identificación de conceptos: situaciones tipo parcial','Justificación de situaciones: variantes del ejercicio 9','Anomalía, enigma y crisis','Inconmensurabilidad','Ciencia normal y enigmas'] }
];

function autorIPCPorClave(m, clave) {
  return m.segundoParcial.autores.find((a) => a.clave === clave);
}

async function cargarPreguntasIPCPunto(m, punto) {
  const autor = autorIPCPorClave(m, punto.autorClave);
  if (!autor) return [];
  const pool = await cargarPreguntasIPC(m, [autor]);
  const subtemas = new Set(punto.subtemas);
  return pool.filter((q) => subtemas.has(q.subtema));
}

async function lanzarIPCPuntoModelo(m, materiaIndex, punto) {
  vistaCargando('Preparando el punto ' + punto.numero + ' del modelo…');
  try {
    const pool = mezclar(await cargarPreguntasIPCPunto(m, punto));
    if (!pool.length) throw new Error('Todavía no hay variantes disponibles para este punto.');
    empezarJuego(pool, {
      titulo: 'IPC · Modelo · Punto ' + punto.numero,
      temaId: 'ipc-modelo-' + punto.id,
      categoria: 'ipc-segundo-parcial',
      ranking: true,
      materiaNombre: m.nombre,
      temaNombre: 'Punto ' + punto.numero + ' · ' + punto.titulo,
      repetir: () => lanzarIPCPuntoModelo(m, materiaIndex, punto),
      volver: () => vistaIPCSegundoParcial(m, materiaIndex),
    });
  } catch (e) {
    vistaError(e);
  }
}

// Todas las variantes de todos los puntos, en orden de punto (1 → 9).
// Si una pregunta sirve para más de un punto, se cuenta una sola vez (en el primero).
async function cargarTodasPreguntasIPCModelo(m) {
  const porPunto = await Promise.all(IPC_MODELO_PARCIAL.map((p) => cargarPreguntasIPCPunto(m, p)));
  const usados = new Set();
  const pool = [];
  IPC_MODELO_PARCIAL.forEach((punto, i) => {
    const propias = porPunto[i].filter((q) => !usados.has(q.id));
    propias.forEach((q) => usados.add(q.id));
    pool.push(...mezclar(propias).map((q) => ({ ...q, tema: 'Punto ' + punto.numero + ' · ' + punto.titulo })));
  });
  return pool;
}

async function lanzarIPCModeloTodas(m, materiaIndex) {
  vistaCargando('Preparando todas las preguntas del modelo…');
  try {
    const pool = await cargarTodasPreguntasIPCModelo(m);
    if (!pool.length) throw new Error('Todavía no hay preguntas disponibles para el modelo.');
    empezarJuego(pool, {
      titulo: 'IPC · Modelo de parcial',
      temaId: 'ipc-modelo-todas',
      categoria: 'ipc-segundo-parcial',
      ranking: true,
      materiaNombre: m.nombre,
      temaNombre: 'Todas las preguntas del modelo',
      repetir: () => lanzarIPCModeloTodas(m, materiaIndex),
      volver: () => vistaIPCSegundoParcial(m, materiaIndex),
    });
  } catch (e) {
    vistaError(e);
  }
}

// ---------- IPC: Segundo Parcial por autor ----------

function vistaIPCSegundoParcial(m, materiaIndex, volver = () => vistaMateria(materiaIndex)) {
  const config = m.segundoParcial;
  if (!config?.autores?.length) {
    vistaMateria(materiaIndex);
    avisar('No se encontró la configuración del Segundo Parcial de IPC.');
    return;
  }
  let autorActivo = 'todos';
  const autores = config.autores;
  const listaAutores = () => autorActivo === 'todos'
    ? autores
    : autores.filter((a) => a.clave === autorActivo);
  const cantidadActiva = () => listaAutores().reduce((s, a) => s + (a.preguntas || 0), 0);
  const modeloMarkup = '<section class="ipc-modelo-panel">' +
    '<div class="ipc-modelo-intro"><div><span class="ipc-modelo-kicker">PRÁCTICA GUIADA</span><h2>Modelo de parcial</h2></div>' +
    '<p>Los puntos del examen de referencia, separados por consigna. Practicá cada punto con todas sus variantes o recorré todas las preguntas del modelo, ordenadas por punto.</p></div>' +
    '<button class="btn primario ipc-modelo-completo" id="btn-ipc-modelo-completo">Practicar todas las preguntas del modelo →</button>' +
    '<div class="ipc-modelo-puntos">' + IPC_MODELO_PARCIAL.map((p) =>
      '<article class="ipc-modelo-punto"><div class="ipc-modelo-punto-top"><span class="ipc-modelo-num">' + String(p.numero).padStart(2, '0') + '</span><span class="ipc-modelo-autor">' + esc(p.autorEtiqueta) + '</span></div>' +
      '<h3>' + esc(p.titulo) + '</h3><p>' + esc(p.consigna) + '</p>' +
      '<div class="ipc-modelo-punto-foot"><span data-ipc-modelo-count="' + p.id + '">Cargando variantes…</span><button class="btn enlace" type="button" data-ipc-modelo-punto="' + p.id + '">Practicar este punto →</button></div></article>'
    ).join('') + '</div></section>';
  const guiaMarkup = '<section class="ipc-guia-panel"><span class="ipc-modelo-kicker">GUÍA DE ESTUDIO</span>' +
    '<h2>Ejercicio 9: anomalía, enigma, crisis y paradigma</h2>' +
    '<p>Cómo distinguir cada concepto de Kuhn y cómo justificarlo cuando el parcial te da un texto.</p>' +
    '<button class="btn secundario" id="btn-ipc-guia-kuhn" type="button">Abrir la guía de Kuhn →</button></section>';


  app.innerHTML = `
    <main class="pantalla ipc-p2-wrap">
      <button class="btn enlace" id="btn-ipc-p2-volver">← IPC</button>
      <div class="titulo-materia">
        <span class="emoji" aria-hidden="true">📜</span>
        <h1>Segundo Parcial</h1>
      </div>
      <p class="bajada">Banco de estudio por autor y un bloque integrador. Cada pregunta incluye explicación, análisis de distractores y expansión de estudio.</p>
      ${modeloMarkup}
      ${guiaMarkup}
      <section class="ipc-p2-resumen">
        <strong>${config.preguntas}</strong>
        <span>preguntas de opción múltiple</span>
        <small>5 bloques · ${config.tarjetas} tarjetas SM-2 · banco imprimible</small>
      </section>
      <section class="ipc-p2-selector">
        <h2>Elegí el autor o el bloque</h2>
        <div class="ipc-p2-chips" id="ipc-p2-chips">
          <button class="ipc-p2-chip activa" type="button" data-autor="todos" aria-pressed="true">Todos <small>${config.preguntas}</small></button>
          ${autores.map((a) => `<button class="ipc-p2-chip" type="button" data-autor="${esc(a.clave)}" aria-pressed="false">${esc(a.etiqueta)} <small>${a.preguntas}</small></button>`).join('')}
        </div>
        <p class="ipc-p2-seleccion" id="ipc-p2-seleccion">Todos los bloques · ${config.preguntas} preguntas</p>
        <div class="ipc-p2-acciones">
          <button class="btn primario" id="btn-ipc-p2-practicar">Practicar los 5 bloques →</button>
          <button class="btn secundario" id="btn-ipc-p2-banco">Consultar banco completo</button>
          <button class="btn secundario" id="btn-ipc-p2-tarjetas">Repasar tarjetas SM-2</button>
        </div>
      </section>
      <section class="ipc-p2-autores" aria-label="Bloques por autor">
        ${autores.map((a) => `
          <article class="ipc-p2-autor">
            <div class="ipc-p2-autor-cabecera">
              <h3>${esc(a.autor)}</h3>
              <span>${a.preguntas} preguntas · ${a.tarjetas} tarjetas</span>
            </div>
            <p>${esc(a.clave === 'hacking' ? 'Clases humanas · efecto de bucle · nicho ecológico · ontología histórica · representar e intervenir' :
              a.clave === 'popper' ? 'Falsabilidad · corroboración · base empírica · enunciados básicos · modus tollens' :
              a.clave === 'foucault' ? 'Poder-saber · microfísica · Panóptico · disciplina · genealogía del castigo' :
              a.clave === 'kuhn' ? 'Matriz disciplinar · ciencia normal · anomalías · revoluciones · inconmensurabilidad · Kuhn-loss' :
              'Kuhn · Foucault · Bourdieu · visibilidad · habitus y campo')}</p>
            <div class="ipc-p2-autor-acciones">
              <button class="btn enlace" type="button" data-practicar-autor="${esc(a.clave)}">Practicar este bloque →</button>
              <button class="btn enlace" type="button" data-ver-autor="${esc(a.clave)}">Ver preguntas</button>
              <button class="btn enlace" type="button" data-tarjetas-autor="${esc(a.clave)}">Tarjetas SM-2 →</button>
            </div>
          </article>`).join('')}
      </section>
    </main>`;

  document.getElementById('btn-ipc-modelo-completo').addEventListener('click', () => {
    Sonido.clic();
    lanzarIPCModeloTodas(m, materiaIndex);
  });
  document.getElementById('btn-ipc-guia-kuhn').addEventListener('click', () => {
    Sonido.clic();
    abrirGuiaKuhn({
      app,
      volver: () => vistaIPCSegundoParcial(m, materiaIndex, volver),
      practicar: () => lanzarIPCPuntoModelo(m, materiaIndex, IPC_MODELO_PARCIAL.find((p) => p.id === 'p9')),
    });
  });
  app.querySelectorAll('[data-ipc-modelo-punto]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const punto = IPC_MODELO_PARCIAL.find((p) => p.id === b.dataset.ipcModeloPunto);
    if (punto) lanzarIPCPuntoModelo(m, materiaIndex, punto);
  }));
  IPC_MODELO_PARCIAL.forEach(async (p) => {
    try {
      const preguntas = await cargarPreguntasIPCPunto(m, p);
      const el = app.querySelector('[data-ipc-modelo-count="' + p.id + '"]');
      if (el) el.textContent = preguntas.length + (preguntas.length === 1 ? ' pregunta' : ' preguntas');
    } catch (e) {
      console.warn('[Modelo IPC]', e);
    }
  });
  cargarTodasPreguntasIPCModelo(m).then((todas) => {
    const btn = document.getElementById('btn-ipc-modelo-completo');
    if (btn && todas.length) btn.textContent = 'Practicar todas las preguntas del modelo (' + todas.length + ') →';
  }).catch((e) => console.warn('[Modelo IPC]', e));

  document.getElementById('btn-ipc-p2-volver').addEventListener('click', () => {
    Sonido.clic();
    volver();
  });
  const botonPracticar = document.getElementById('btn-ipc-p2-practicar');
  const botonBanco = document.getElementById('btn-ipc-p2-banco');

  function actualizarSeleccion() {
    const lista = listaAutores();
    const total = cantidadActiva();
    app.querySelectorAll('[data-autor]').forEach((b) => {
      const activo = b.dataset.autor === autorActivo;
      b.classList.toggle('activa', activo);
      b.setAttribute('aria-pressed', String(activo));
    });
    document.getElementById('ipc-p2-seleccion').textContent = autorActivo === 'todos'
      ? `Todos los bloques · ${total} preguntas`
      : `${lista[0].autor} · ${total} preguntas`;
    botonPracticar.textContent = autorActivo === 'todos'
      ? `Practicar los 5 bloques (${total}) →`
      : `Practicar ${lista[0].etiqueta} (${total}) →`;
  }

  app.querySelectorAll('[data-autor]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    autorActivo = b.dataset.autor;
    actualizarSeleccion();
  }));
  botonPracticar.addEventListener('click', () => {
    Sonido.clic();
    lanzarIPCSegundoParcial(m, materiaIndex, listaAutores());
  });
  botonBanco.addEventListener('click', () => {
    Sonido.clic();
    vistaBancoIPC(m, materiaIndex, listaAutores());
  });
  document.getElementById('btn-ipc-p2-tarjetas').addEventListener('click', () => {
    Sonido.clic();
    lanzarTarjetasIPCSegundoParcial(m, materiaIndex, listaAutores());
  });
  app.querySelectorAll('[data-practicar-autor]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const autor = autores.find((a) => a.clave === b.dataset.practicarAutor);
    if (autor) lanzarIPCSegundoParcial(m, materiaIndex, [autor]);
  }));
  app.querySelectorAll('[data-ver-autor]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const autor = autores.find((a) => a.clave === b.dataset.verAutor);
    if (autor) vistaBancoIPC(m, materiaIndex, [autor]);
  }));
  app.querySelectorAll('[data-tarjetas-autor]').forEach((b) => b.addEventListener('click', () => {
    Sonido.clic();
    const autor = autores.find((a) => a.clave === b.dataset.tarjetasAutor);
    if (autor) lanzarTarjetasIPCSegundoParcial(m, materiaIndex, [autor]);
  }));
  actualizarSeleccion();
  window.scrollTo(0, 0);
}

async function cargarPreguntasIPC(m, autores) {
  const pool = [];
  for (const autor of autores) {
    const tema = {
      id: autor.id,
      nombre: autor.etiqueta || autor.autor,
      archivo: autor.archivo,
      preguntas: autor.preguntas || 0,
    };
    pool.push(...await cargarTema(tema, m));
  }
  return pool;
}

async function lanzarTarjetasIPCSegundoParcial(m, materiaIndex, autores) {
  const temas = autores.map((autor) => ({
    id: autor.id,
    nombre: autor.etiqueta || autor.autor,
    archivo: autor.archivo,
    preguntas: autor.preguntas || 0,
    tarjetas: autor.tarjetas || 0,
  }));
  await lanzarTarjetasTemas(m, temas, () => vistaIPCSegundoParcial(m, materiaIndex));
}

async function lanzarIPCSegundoParcial(m, materiaIndex, autores) {
  vistaCargando('Preparando el Segundo Parcial de IPC…');
  try {
    const pool = mezclar(await cargarPreguntasIPC(m, autores));
    if (!pool.length) throw new Error('No se encontraron preguntas en los bloques elegidos.');
    const nombre = autores.length === 1 ? autores[0].autor : 'Segundo Parcial';
    empezarJuego(pool, {
      titulo: `IPC · ${nombre}`,
      temaId: autores.length === 1 ? autores[0].id : null,
      categoria: 'ipc-segundo-parcial',
      ranking: true,
      materiaNombre: m.nombre,
      temaNombre: nombre,
      repetir: () => lanzarIPCSegundoParcial(m, materiaIndex, autores),
      volver: () => vistaIPCSegundoParcial(m, materiaIndex),
    });
  } catch (e) {
    vistaError(e);
  }
}

async function vistaBancoIPC(m, materiaIndex, autoresIniciales = m.segundoParcial.autores) {
  vistaCargando('Cargando el banco de IPC…');
  try {
    const pool = await cargarPreguntasIPC(m, autoresIniciales);
    const autoresDisponibles = autoresIniciales;
    const subtemas = [...new Set(pool.map((q) => q.subtema).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
    let autorFiltro = '';
    let subtemaFiltro = '';
    let busqueda = '';
    let pagina = 0;
    let porPagina = 20;

    app.innerHTML = `
      <main class="pantalla ipc-p2-bank-print">
        <div class="ipc-p2-bank-head ipc-no-print">
          <button class="btn enlace" id="btn-ipc-banco-volver">← Segundo Parcial</button>
          <div class="ipc-p2-bank-actions">
            <button class="btn secundario" id="btn-ipc-banco-print">Imprimir / guardar PDF</button>
            <button class="btn primario" id="btn-ipc-banco-practicar">Practicar búsqueda →</button>
          </div>
        </div>
        <div class="titulo-materia">
          <span class="emoji" aria-hidden="true">📚</span>
          <h1>Banco de preguntas · IPC</h1>
        </div>
        <p class="bajada ipc-no-print">Consultá la justificación de cada respuesta correcta. La impresión incluye todos los resultados del filtro seleccionado.</p>
        <section class="ipc-p2-bank-filtros ipc-no-print">
          <label><span>Buscar enunciado, opción o explicación</span><input id="ipc-buscar" type="search" placeholder="Ej.: efecto de bucle, enunciado básico, Panóptico…" autocomplete="off"></label>
          <label><span>Autor</span><select id="ipc-filtro-autor">
            <option value="">Todos los autores incluidos</option>
            ${autoresDisponibles.map((a) => `<option value="${esc(a.clave)}">${esc(a.etiqueta)}</option>`).join('')}
          </select></label>
          <label><span>Subtema</span><select id="ipc-filtro-subtema">
            <option value="">Todos los subtemas</option>
            ${subtemas.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
          </select></label>
        </section>
        <div class="ipc-p2-bank-count" id="ipc-banco-estado" aria-live="polite"></div>
        <section class="ipc-p2-bank-lista" id="ipc-banco-lista"></section>
        <nav class="ipc-p2-bank-pages ipc-no-print" id="ipc-banco-paginacion" aria-label="Páginas del banco"></nav>
        <footer class="ipc-p2-bank-footer">
          Parcialito · IPC · Segundo Parcial · ${pool.length} preguntas cargadas
        </footer>
      </main>`;

    document.getElementById('btn-ipc-banco-volver').addEventListener('click', () => {
      Sonido.clic();
      vistaIPCSegundoParcial(m, materiaIndex);
    });
    const input = document.getElementById('ipc-buscar');
    const selectAutor = document.getElementById('ipc-filtro-autor');
    const selectSubtema = document.getElementById('ipc-filtro-subtema');

    const filtradas = () => pool.filter((q) => {
      if (autorFiltro && q.autor !== (autoresDisponibles.find((a) => a.clave === autorFiltro)?.autor || '')) return false;
      if (subtemaFiltro && q.subtema !== subtemaFiltro) return false;
      if (!busqueda) return true;
      const exp = (q.expansionEstudio || []).flatMap((x) => [x.pregunta, x.respuesta]);
      const texto = [q.texto, q.autor, q.subtema, ...q.opciones, q.explicacion, ...exp].join(' ').toLocaleLowerCase('es');
      return texto.includes(busqueda);
    });

    function pintarBanco() {
      const todos = filtradas();
      const totalPaginas = Math.max(1, Math.ceil(todos.length / porPagina));
      pagina = Math.min(pagina, totalPaginas - 1);
      const inicio = pagina * porPagina;
      const visibles = todos.slice(inicio, inicio + porPagina);
      document.getElementById('ipc-banco-estado').textContent = todos.length
        ? `Mostrando ${inicio + 1}–${inicio + visibles.length} de ${todos.length} preguntas`
        : 'No hay preguntas que coincidan con los filtros.';
      document.getElementById('ipc-banco-lista').innerHTML = visibles.map((q, n) => {
        const expansiones = q.expansionEstudio || [];
        return `
          <article class="ipc-p2-banco-pregunta">
            <div class="ipc-p2-banco-meta">
              <span>Pregunta ${inicio + n + 1}</span>
              <span>${esc(q.autor || 'IPC')} · ${esc(q.subtema || q.tema)}</span>
            </div>
            <h2>${esc(q.texto)}</h2>
            <ol class="ipc-p2-banco-opciones">
              ${q.opciones.map((op, k) => `<li class="${k === q.correcta ? 'correcta' : ''}"><b>${LETRAS[k]}.</b><span>${esc(op)}</span>${k === q.correcta ? '<strong>Correcta</strong>' : ''}</li>`).join('')}
            </ol>
            <section class="ipc-p2-justificacion">
              <h3>Justificación de la respuesta correcta</h3>
              <p>${esc(q.explicacion || 'Sin justificación cargada.')}</p>
            </section>
            ${expansiones.length ? `<section class="ipc-p2-expansion">
              <h3>Expansión de estudio</h3>
              ${expansiones.map((x) => `<div><h4>${esc(x.pregunta)}</h4><p>${esc(x.respuesta)}</p></div>`).join('')}
            </section>` : ''}
          </article>`;
      }).join('');
      document.getElementById('ipc-banco-paginacion').innerHTML = `
        <button class="btn secundario" id="ipc-pagina-anterior" ${pagina === 0 ? 'disabled' : ''}>← Anterior</button>
        <span>Página ${pagina + 1} de ${totalPaginas}</span>
        <button class="btn secundario" id="ipc-pagina-siguiente" ${pagina >= totalPaginas - 1 ? 'disabled' : ''}>Siguiente →</button>`;
      document.getElementById('ipc-pagina-anterior').addEventListener('click', () => { pagina--; pintarBanco(); window.scrollTo(0, 0); });
      document.getElementById('ipc-pagina-siguiente').addEventListener('click', () => { pagina++; pintarBanco(); window.scrollTo(0, 0); });
      document.getElementById('btn-ipc-banco-practicar').disabled = todos.length === 0;
      document.getElementById('btn-ipc-banco-practicar').textContent = `Practicar estas ${todos.length} preguntas →`;
    }

    input.addEventListener('input', () => { busqueda = input.value.trim().toLocaleLowerCase('es'); pagina = 0; pintarBanco(); });
    selectAutor.addEventListener('change', () => { autorFiltro = selectAutor.value; pagina = 0; pintarBanco(); });
    selectSubtema.addEventListener('change', () => { subtemaFiltro = selectSubtema.value; pagina = 0; pintarBanco(); });
    document.getElementById('btn-ipc-banco-practicar').addEventListener('click', () => {
      const poolFiltrado = filtradas();
      if (!poolFiltrado.length) return;
      Sonido.clic();
      const keys = autoresDisponibles.filter((a) => poolFiltrado.some((q) => q.temaId === a.id));
      empezarJuego(mezclar(poolFiltrado), {
        titulo: 'IPC · Segundo Parcial',
        temaId: keys.length === 1 ? keys[0].id : null,
        categoria: 'ipc-segundo-parcial',
        ranking: true,
        materiaNombre: m.nombre,
        temaNombre: keys.length === 1 ? keys[0].autor : 'Banco filtrado',
        repetir: () => vistaBancoIPC(m, materiaIndex, keys.length ? keys : autoresDisponibles),
        volver: () => vistaBancoIPC(m, materiaIndex, autoresDisponibles),
      });
    });
    document.getElementById('btn-ipc-banco-print').addEventListener('click', () => {
      Sonido.clic();
      porPagina = Math.max(1, filtradas().length);
      pagina = 0;
      pintarBanco();
      window.print();
      porPagina = 20;
      pintarBanco();
    });

    pintarBanco();
    window.scrollTo(0, 0);
  } catch (e) {
    vistaError(e);
  }
}
