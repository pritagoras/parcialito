// Banco consultable por tema: muestra todas las preguntas sin alterar el modo de juego.
(() => {
  const LETRAS = ['A', 'B', 'C', 'D'];
  let indicePromise;

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function cargarIndice() {
    if (!indicePromise) {
      indicePromise = fetch('data/index.json', { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('No se pudo cargar el índice de temas.');
        return r.json();
      });
    }
    return indicePromise;
  }

  function instalarEstilos() {
    if (document.getElementById('estilos-banco-tema')) return;
    const style = document.createElement('style');
    style.id = 'estilos-banco-tema';
    style.textContent = `
      .btn-ver-banco-tema {
        display:flex; align-items:center; width:calc(100% - 3.1rem); max-width:100%;
        min-width:0; margin:-.3rem 0 .15rem 3.1rem; padding:.38rem .65rem;
        border:1px solid rgba(184,171,219,.14); border-radius:9px;
        background:rgba(35,24,69,.34); color:var(--tenue, #B8ABDB);
        font:500 .78rem/1.35 var(--fuente, Inter, system-ui, sans-serif);
        text-align:left; cursor:pointer; transition:background-color .15s,border-color .15s,color .15s;
      }
      .btn-ver-banco-tema:hover {
        background:rgba(46,32,88,.52); border-color:rgba(184,171,219,.28);
        color:var(--crema, #FFF3DC);
      }
      .btn-ver-banco-tema:focus-visible {
        outline:2px solid rgba(155,123,255,.65); outline-offset:2px; border-radius:9px;
      }
      @media(max-width:480px) {
        .btn-ver-banco-tema { width:calc(100% - 2.8rem); margin-left:2.8rem; padding:.42rem .6rem; }
      }
      .banco-tema-dialog { width:min(760px,calc(100vw - 24px)); max-width:760px; max-height:88dvh; padding:0; border:1px solid rgba(155,123,255,.45); border-radius:18px; color:#FFF3DC; background:#170F2E; box-shadow:0 20px 70px #0009; }
      .banco-tema-dialog::backdrop { background:rgba(8,5,18,.78); backdrop-filter:blur(3px); }
      .banco-tema-cabeza { position:sticky; top:0; z-index:2; padding:18px; background:#211845; border-bottom:1px solid #ffffff20; }
      .banco-tema-cabeza h2 { margin:0 0 5px; font:800 20px Inter,system-ui,sans-serif; }
      .banco-tema-cabeza p { margin:0; color:#C8BDDE; font:500 13px Inter,system-ui,sans-serif; }
      .banco-tema-controles { display:flex; gap:8px; margin-top:13px; }
      .banco-tema-controles input { min-width:0; flex:1; padding:11px 12px; border:1px solid #ffffff30; border-radius:10px; background:#170F2E; color:#FFF3DC; font:inherit; }
      .banco-tema-cerrar { padding:9px 12px; border:0; border-radius:10px; background:#9B7BFF; color:#170F2E; font-weight:800; cursor:pointer; }
      .banco-tema-contenido { padding:14px 18px 18px; overflow:auto; }
      .banco-tema-estado { margin:0 0 12px; color:#C8BDDE; font-size:13px; }
      .banco-tema-pregunta { margin:0 0 13px; padding:15px; border:1px solid #ffffff20; border-radius:13px; background:#211845; }
      .banco-tema-pregunta h3 { margin:0 0 12px; font-size:15px; line-height:1.5; }
      .banco-tema-opciones { display:grid; gap:7px; margin:0; padding:0; list-style:none; }
      .banco-tema-opciones li { display:flex; gap:9px; padding:9px 10px; border-radius:9px; background:#ffffff08; color:#E8E0F5; font-size:13px; line-height:1.4; }
      .banco-tema-opciones li.correcta { border:1px solid #4FE0A0; background:#4FE0A012; color:#B9F5D7; }
      .banco-tema-opciones li span:first-child { flex:0 0 19px; font-weight:800; }
      .banco-tema-explicacion { margin-top:10px; color:#D4C9EB; font-size:13px; line-height:1.5; }
      .banco-tema-explicacion summary { cursor:pointer; color:#C6B2FF; font-weight:700; }
      .banco-tema-explicacion p { margin:8px 0 0; }
      .banco-tema-nav { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:14px; }
      .banco-tema-nav button { padding:9px 12px; border:1px solid #ffffff30; border-radius:10px; background:#ffffff0c; color:#FFF3DC; font-weight:700; cursor:pointer; }
      .banco-tema-nav button:disabled { opacity:.35; cursor:default; }
      @media(max-width:480px) { .banco-tema-dialog { max-height:92dvh; } .banco-tema-cabeza,.banco-tema-contenido { padding:13px; } .banco-tema-cabeza h2 { font-size:18px; } }
    `;
    document.head.appendChild(style);
  }

  function normalizarPreguntas(json) {
    return (Array.isArray(json.preguntas) ? json.preguntas : []).flatMap((p, n) => {
      const texto = String(p.enunciado ?? p.pregunta ?? '').trim();
      const opciones = Array.isArray(p.opciones)
        ? p.opciones.map(op => String(op && typeof op === 'object' ? (op.texto ?? op.text ?? '') : op))
        : [];
      const correcta = LETRAS.indexOf(String(p.respuestaCorrecta ?? p.correcta ?? '').trim().toUpperCase());
      if (!texto || opciones.length !== 4 || opciones.some(x => !x) || correcta < 0) return [];
      return [{
        texto, opciones, correcta,
        explicacion: String(p.justificacionCorrecta ?? p.explicacion ?? ''),
        imagen: typeof p.imagen === 'string' ? p.imagen : '',
        imagenAlt: String(p.imagen_alt || 'Imagen de la pregunta'),
        numero: n + 1
      }];
    });
  }

  function abrirDialogo(tema, materia) {
    instalarEstilos();
    let dlg = document.getElementById('banco-tema-dialog');
    if (dlg) dlg.remove();
    dlg = document.createElement('dialog');
    dlg.id = 'banco-tema-dialog';
    dlg.className = 'banco-tema-dialog';
    dlg.innerHTML = `
      <header class="banco-tema-cabeza">
        <h2>${esc(tema.nombre)}</h2>
        <p>${esc(materia.nombre)} · Todas las preguntas del tema</p>
        <div class="banco-tema-controles">
          <input id="banco-tema-buscar" type="search" placeholder="Buscar en las preguntas…" aria-label="Buscar preguntas">
          <button class="banco-tema-cerrar" type="button" id="banco-tema-cerrar">Cerrar</button>
        </div>
      </header>
      <section class="banco-tema-contenido">
        <p class="banco-tema-estado" id="banco-tema-estado">Cargando preguntas…</p>
        <div id="banco-tema-lista"></div>
        <nav class="banco-tema-nav" id="banco-tema-nav"></nav>
      </section>`;
    document.body.appendChild(dlg);
    dlg.querySelector('#banco-tema-cerrar').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => dlg.remove());
    dlg.showModal();

    fetch(tema.archivo, { cache: 'no-cache' }).then(r => {
      if (!r.ok) throw new Error('No se pudo leer el archivo de preguntas (' + r.status + ').');
      return r.json();
    }).then(json => {
      const preguntas = normalizarPreguntas(json);
      const estado = dlg.querySelector('#banco-tema-estado');
      const lista = dlg.querySelector('#banco-tema-lista');
      const nav = dlg.querySelector('#banco-tema-nav');
      const buscar = dlg.querySelector('#banco-tema-buscar');
      const porPagina = 15;
      let pagina = 0;

      function pintar() {
        const termino = buscar.value.trim().toLocaleLowerCase('es');
        const filtradas = preguntas.filter(q =>
          [q.texto, ...q.opciones, q.explicacion].join(' ').toLocaleLowerCase('es').includes(termino)
        );
        const paginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
        pagina = Math.min(pagina, paginas - 1);
        const inicio = pagina * porPagina;
        const visibles = filtradas.slice(inicio, inicio + porPagina);
        estado.textContent = filtradas.length
          ? `Mostrando ${inicio + 1}–${inicio + visibles.length} de ${filtradas.length} preguntas · ${preguntas.length} en total`
          : 'No hay preguntas que coincidan con la búsqueda.';
        lista.innerHTML = visibles.map(q => `
          <article class="banco-tema-pregunta">
            <h3>${q.numero}. ${esc(q.texto)}</h3>
            ${q.imagen && /^https:\/\//i.test(q.imagen) ? `<img src="${esc(q.imagen)}" alt="${esc(q.imagenAlt)}" loading="lazy" style="display:block;max-width:100%;max-height:260px;object-fit:contain;margin:0 auto 12px;border-radius:9px">` : ''}
            <ol class="banco-tema-opciones">
              ${q.opciones.map((op, i) => `<li class="${i === q.correcta ? 'correcta' : ''}"><span>${LETRAS[i]}.</span><span>${esc(op)}${i === q.correcta ? ' · Correcta' : ''}</span></li>`).join('')}
            </ol>
            ${q.explicacion ? `<details class="banco-tema-explicacion"><summary>Ver justificación</summary><p>${esc(q.explicacion)}</p></details>` : ''}
          </article>`).join('');
        nav.innerHTML = `
          <button type="button" id="banco-tema-anterior" ${pagina === 0 ? 'disabled' : ''}>← Anterior</button>
          <span>${pagina + 1} / ${paginas}</span>
          <button type="button" id="banco-tema-siguiente" ${pagina >= paginas - 1 ? 'disabled' : ''}>Siguiente →</button>`;
        nav.querySelector('#banco-tema-anterior').addEventListener('click', () => { pagina--; pintar(); });
        nav.querySelector('#banco-tema-siguiente').addEventListener('click', () => { pagina++; pintar(); });
      }
      buscar.addEventListener('input', () => { pagina = 0; pintar(); });
      pintar();
    }).catch(error => {
      dlg.querySelector('#banco-tema-estado').textContent = error.message || 'No se pudieron cargar las preguntas.';
    });
  }

  let programando = false;
  function mejorarPantalla() {
    if (programando) return;
    programando = true;
    queueMicrotask(async () => {
      programando = false;
      const titulo = document.querySelector('.titulo-materia h1');
      const contenedor = document.querySelector('main.pantalla .temas');
      if (!titulo || !contenedor) return;
      try {
        const indice = await cargarIndice();
        const materia = indice.materias.find(m => m.nombre === titulo.textContent.trim());
        if (!materia) return;
        contenedor.querySelectorAll('label.tema input[data-n]').forEach(input => {
          const fila = input.closest('label.tema');
          if (!fila || fila.nextElementSibling?.classList.contains('btn-ver-banco-tema')) return;
          const tema = materia.temas[Number(input.dataset.n)];
          if (!tema || !(tema.preguntas > 0)) return;
          const boton = document.createElement('button');
          boton.type = 'button';
          boton.className = 'btn-ver-banco-tema';
          boton.textContent = 'Ver todas las preguntas · ' + tema.preguntas;
          boton.addEventListener('click', () => abrirDialogo(tema, materia));
          fila.insertAdjacentElement('afterend', boton);
        });
      } catch (e) {
        console.warn('[Banco por tema]', e);
      }
    });
  }

  const observer = new MutationObserver(mejorarPantalla);
  observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
  mejorarPantalla();
})();
