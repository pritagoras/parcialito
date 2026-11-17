// Subsección de Biología 1: Composición química de los seres vivos.
const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export function abrirComposicionQuimica(parametros) {
  const {
    app, materia, subseccion, volver, iniciar, practicar,
    resumenDominioTema, abrirBanco, cantidadActual, guardarCantidad
  } = parametros;

  const temas = materia.temas;
  const porId = new Map(temas.map((tema, indice) => [tema.id, { tema, indice }]));
  const grupos = (subseccion.grupos || []).map((grupo) => ({
    ...grupo,
    entradas: (grupo.temaIds || []).map((id) => porId.get(id)).filter(Boolean)
  }));
  const idsIncluidos = new Set(grupos.flatMap((grupo) => grupo.entradas.map((x) => x.tema.id)));
  const totalPreguntas = grupos.reduce(
    (total, grupo) => total + grupo.entradas.reduce((suma, x) => suma + (Number(x.tema.preguntas) || 0), 0),
    0
  );

  const render = () => abrirComposicionQuimica(parametros);
  const gruposHtml = grupos.map((grupo) => {
    const filas = grupo.entradas.map(({ tema, indice }) => {
      const nPreguntas = Number(tema.preguntas) || 0;
      const dominio = resumenDominioTema(tema);
      const detalle = plural(nPreguntas, 'pregunta', 'preguntas');
      const barra = nPreguntas > 0 ? `
        <span class="tema-progreso" role="progressbar"
          aria-label="Dominio de ${esc(tema.nombre)}"
          aria-valuemin="0" aria-valuemax="${dominio.total}"
          aria-valuenow="${dominio.dominadas}">
          <span class="tema-progreso-relleno" style="width:${dominio.porcentaje}%"></span>
        </span>
        <span class="tema-progreso-detalle">${dominio.dominadas}/${dominio.total} dominadas</span>` : '';

      return `
        <div class="tema-item">
          <label class="tema" style="--c:${esc(materia.color || '#9B7BFF')}">
            <input type="checkbox" data-n="${indice}" checked>
            <span class="cuerpo">
              <span class="nombre">${esc(tema.nombre)} ${dominio.completo ? '<span class="coronita" role="img" aria-label="Tema completamente dominado" title="Tema completamente dominado">👑</span>' : ''}</span><br>
              <span class="detalle">${detalle}${dominio.dominadas ? ` · ${dominio.dominadas} dominadas` : ''}</span>
              ${barra}
            </span>
          </label>
          <div class="tema-practicas">
            ${dominio.pendientes > 0
              ? `<button type="button" class="tema-practica-link" data-practicar-pendientes="${indice}">Practicar no dominadas <span>${dominio.pendientes}</span></button>`
              : '<span class="tema-practica-completo">Todas dominadas</span>'}
            <button type="button" class="tema-practica-link" data-practicar-todas="${indice}">Practicar todas <span>${nPreguntas}</span></button>
          </div>
        </div>`;
    }).join('');

    return `
      <section class="bloque-temas-composicion">
        <div class="temas-barra"><span>${esc(grupo.nombre)}</span></div>
        <div class="temas">${filas}</div>
      </section>`;
  }).join('');

  const cantidadInicial = [10, 20, 0].includes(Number(cantidadActual)) ? Number(cantidadActual) : 10;

  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver-composicion">← Biología 1</button>
      <div class="titulo-materia">
        <span class="emoji" aria-hidden="true">⚗️</span>
        <h1>${esc(subseccion.nombre)}</h1>
      </div>
      <p class="bajada">Practicá por tema o combiná varios bancos. Los glúcidos también se conocen como carbohidratos o hidratos de carbono.</p>
      <p class="detalle-fuente-composicion">${plural(totalPreguntas, 'pregunta disponible', 'preguntas disponibles')} · Las diapositivas organizan el recorrido principal; el complemento del texto está identificado por separado.</p>
      ${gruposHtml}
      <details class="banco-materia">
        <summary class="banco-materia-cabecera">
          <span class="banco-materia-textos">
            <strong>Banco de preguntas de la subsección</strong>
            <small>Ver las preguntas, sus opciones y las respuestas correctas por tema.</small>
          </span>
          <span class="banco-materia-flecha" aria-hidden="true">▾</span>
        </summary>
        <div class="banco-materia-temas">
          ${grupos.map((grupo) => `
            <div class="banco-subgrupo">
              <span class="banco-subgrupo-titulo">${esc(grupo.nombre)}</span>
              ${grupo.entradas.map(({ tema, indice }) => `
                <button type="button" class="banco-materia-tema" data-banco-tema="${indice}">
                  <span>${esc(tema.nombre)}</span><small>${Number(tema.preguntas) || 0} preguntas</small>
                </button>`).join('')}
            </div>`).join('')}
        </div>
      </details>
    </main>
    <div class="pie-fijo">
      <div class="interior">
        <div class="segmentos" role="radiogroup" aria-label="Cantidad de preguntas">
          <label><input type="radio" name="cantidad-composicion" value="10" ${cantidadInicial === 10 ? 'checked' : ''}><span>10</span></label>
          <label><input type="radio" name="cantidad-composicion" value="20" ${cantidadInicial === 20 ? 'checked' : ''}><span>20</span></label>
          <label><input type="radio" name="cantidad-composicion" value="0" ${cantidadInicial === 0 ? 'checked' : ''}><span>Todas</span></label>
        </div>
        <div class="grupo-botones">
          <button class="btn primario" id="btn-empezar-composicion">Empezar</button>
        </div>
      </div>
    </div>`;

  const checks = [...app.querySelectorAll('.bloque-temas-composicion .tema input[type="checkbox"]')];
  const botonEmpezar = document.getElementById('btn-empezar-composicion');
  const botonVolver = document.getElementById('btn-volver-composicion');
  const seleccionados = () => checks.filter((check) => check.checked).map((check) => temas[Number(check.dataset.n)]);
  const cantidadElegida = () => Number(app.querySelector('input[name="cantidad-composicion"]:checked')?.value ?? 10);

  function actualizar() {
    const seleccion = seleccionados();
    const total = seleccion.reduce((suma, tema) => suma + (Number(tema.preguntas) || 0), 0);
    const cantidad = cantidadElegida();
    const disponibles = cantidad === 0 ? total : Math.min(cantidad, total);
    botonEmpezar.disabled = !seleccion.length || !total;
    botonEmpezar.textContent = !seleccion.length
      ? 'Elegí un tema'
      : `Empezar (${disponibles})`;
  }

  checks.forEach((check) => check.addEventListener('change', actualizar));
  app.querySelectorAll('input[name="cantidad-composicion"]').forEach((radio) =>
    radio.addEventListener('change', () => {
      guardarCantidad(cantidadElegida());
      actualizar();
    })
  );

  app.querySelectorAll('[data-practicar-todas]').forEach((boton) => boton.addEventListener('click', () => {
    const tema = temas[Number(boton.dataset.practicarTodas)];
    if (tema) practicar(tema, false, render);
  }));
  app.querySelectorAll('[data-practicar-pendientes]').forEach((boton) => boton.addEventListener('click', () => {
    const tema = temas[Number(boton.dataset.practicarPendientes)];
    if (tema) practicar(tema, true, render);
  }));
  app.querySelectorAll('[data-banco-tema]').forEach((boton) => boton.addEventListener('click', () => {
    const tema = temas[Number(boton.dataset.bancoTema)];
    if (tema) abrirBanco(tema);
  }));

  botonVolver.addEventListener('click', volver);
  botonEmpezar.addEventListener('click', () => {
    const seleccion = seleccionados();
    if (!seleccion.length) return;
    iniciar(seleccion, cantidadElegida(), render);
  });

  actualizar();
  window.scrollTo(0, 0);
}
