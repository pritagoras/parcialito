// ==========================================================
// ranking-ui.js: Pantallas de apodo, ranking e historial.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { limpiarApodo, rankingMateria, historialDe, progresoDe } from './ranking.js?v=20261112-dispositivos3';
import { vistaInicio } from './home.js';
import { catalogoTemasPublicados, claveTema } from './jugadores.js';
import { S, app, avisar, esc } from './nucleo.js';
import { anotarVisita } from './visitas.js';

export function vistaApodo() {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Inicio</button>
      <h1 class="titulo-seccion">Tu apodo</h1>
      <p class="bajada">Es el nombre que se ve en el ranking. Podés cambiarlo cuando quieras.</p>
      <form class="form-apodo" id="form-apodo">
        <input id="inp-apodo" type="text" maxlength="20" autocomplete="off"
               placeholder="Ej: Gonza" aria-label="Apodo" value="${esc(estado.apodo)}">
        <button class="btn primario" type="submit">Guardar</button>
      </form>
      ${estado.apodo ? '<button class="btn secundario" id="btn-historial">Ver mi historial</button>' : ''}
      <p class="aviso-datos">Al entrar a la página se registra la visita (con tu apodo, si ya lo elegiste). Al terminar una ronda se guardan tu apodo, tus resultados y el progreso de los temas practicados. El ranking y el directorio de jugadores muestran estadísticas asociadas a tu apodo. Los datos básicos de tu dispositivo se usan solo para estadísticas internas y no son públicos. También se registra, sin tu apodo, si cada pregunta se respondió bien o mal.</p>
    </main>`;

  const input = document.getElementById('inp-apodo');
  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  document.getElementById('btn-historial')?.addEventListener('click', () => {
    Sonido.clic();
    vistaHistorial(estado.apodo, vistaApodo);
  });
  document.getElementById('form-apodo').addEventListener('submit', (e) => {
    e.preventDefault();
    const apodo = limpiarApodo(input.value);
    if (!apodo) { avisar('Escribí un apodo'); input.focus(); return; }
    estado.apodo = apodo;
    guardar();
    anotarVisita('apodo');
    Sonido.clic();
    vistaInicio();
    avisar(`Listo, ${apodo}`);
  });
  window.scrollTo(0, 0);
  input.focus();
}

let pedidoRanking = 0;

export function vistaRanking(iMateria = 0, tema = '') {
  if (!S.indice.materias.length) { vistaInicio(); return; }
  const m = S.indice.materias[iMateria];

  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Inicio</button>
      <h1 class="titulo-seccion">🏆 Ranking</h1>
      <div class="chips" role="group" aria-label="Materia">
        ${S.indice.materias.map((x, i) => `
          <button class="chip ${i === iMateria ? 'activo' : ''}" data-i="${i}">${esc(x.nombre)}</button>`).join('')}
      </div>
      <label class="filtro-tema">
        <span>Tema</span>
        <select id="sel-tema">
          <option value="">Todos</option>
          <option value="Varios temas" ${tema === 'Varios temas' ? 'selected' : ''}>Varios temas (mezclados)</option>
          ${[...(m.temas || []), ...(m.segundoParcial?.autores || []), ...(m.id === 'biologia-celular2' ? [{ nombre: 'Megaclase de repaso · Segundo parcial 2026 · Maru' }] : [])].map((t) => `<option value="${esc(t.nombre)}" ${t.nombre === tema ? 'selected' : ''}>${esc(t.nombre)}</option>`).join('')}
        </select>
      </label>
      <p class="nota-ranking">Se muestra la mejor partida de cada apodo, ordenada por puntos.</p>
      <div id="lista-ranking"><p class="estado-ranking">Cargando…</p></div>
    </main>`;

  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  app.querySelectorAll('.chip').forEach((b) =>
    b.addEventListener('click', () => { Sonido.clic(); vistaRanking(Number(b.dataset.i)); }));
  document.getElementById('sel-tema').addEventListener('change', (e) => {
    Sonido.clic();
    vistaRanking(iMateria, e.target.value);
  });
  window.scrollTo(0, 0);

  const mio = ++pedidoRanking;
  const caja = document.getElementById('lista-ranking');
  rankingMateria(m.nombre, tema || null).then((filas) => {
    if (mio !== pedidoRanking) return;
    if (!filas.length) {
      caja.innerHTML = '<p class="estado-ranking">Todavía nadie jugó acá. ¡Sé el primero!</p>';
      return;
    }
    caja.innerHTML = `<ol class="lista-ranking">${filas.map((f, n) => `
      <li class="${estado.apodo && f.apodo.toLowerCase() === estado.apodo.toLowerCase() ? 'yo' : ''}">
        <span class="pos">${n + 1}</span>
        <button class="nombre-jugador" data-apodo="${esc(f.apodo)}">${esc(f.apodo)}</button>
        <span class="detalle-fila">${esc(f.tema)} · ${f.total ? `${f.aciertos}/${f.total}` : 'progreso registrado'}</span>
        ${f.dominioTemas?.length ? `<span class="detalle-dominadas">${f.dominioTemas.map((d) => `${esc(d.tema)}: ${d.dominadas}/${d.total} dominadas`).join(' · ')}</span>` : ''}
        <b class="pts">${f.puntos}</b>
      </li>`).join('')}</ol>`;
    caja.querySelectorAll('.nombre-jugador').forEach((b) =>
      b.addEventListener('click', () => {
        Sonido.clic();
        vistaHistorial(b.dataset.apodo, () => vistaRanking(iMateria, tema));
      }));
  }).catch(() => {
    if (mio !== pedidoRanking) return;
    caja.innerHTML = '<p class="estado-ranking">No se pudo cargar el ranking. Probá de nuevo en un rato.</p>';
  });
}

export function vistaHistorial(apodo, volver) {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Volver</button>
      <h1 class="titulo-seccion">Historial de ${esc(apodo)}</h1>
      <div id="lista-historial"><p class="estado-ranking">Cargando…</p></div>
    </main>`;
  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); volver(); });
  window.scrollTo(0, 0);

  const caja = document.getElementById('lista-historial');
  Promise.all([historialDe(apodo, 500), progresoDe(apodo).catch(() => [])]).then(([filas, progreso]) => {
    if (!caja.isConnected) return;
    if (!filas.length && !progreso.length) {
      caja.innerHTML = '<p class="estado-ranking">Todavía no hay partidas guardadas.</p>';
      return;
    }
    const catalogo = catalogoTemasPublicados();
    const totalTemas = catalogo.lista.length;
    const temasJugados = new Set();
    for (const p of progreso) {
      const t = catalogo.porId.get(p.tema_id) || catalogo.porNombre.get(claveTema(p.materia, p.tema));
      if (t) temasJugados.add(t.id);
    }
    for (const f of filas) {
      const t = catalogo.porNombre.get(claveTema(f.materia, f.tema));
      if (t) temasJugados.add(t.id);
    }
    const aciertosTotales = filas.reduce((s, f) => s + (Number(f.aciertos) || 0), 0);
    const preguntasTotales = filas.reduce((s, f) => s + (Number(f.total) || 0), 0);
    const precisionGlobal = preguntasTotales ? Math.round((aciertosTotales / preguntasTotales) * 100) : null;
    const coberturaTemas = totalTemas ? Math.round((temasJugados.size / totalTemas) * 100) : 0;
    const partidasLabel = filas.length >= 500 ? '500+' : String(filas.length);
    const bloqueResumen = `
      <div class="jugador-stats">
        <div><strong>${temasJugados.size}/${totalTemas}</strong><span>temas practicados</span></div>
        <div><strong>${coberturaTemas}%</strong><span>cobertura temática</span></div>
        <div><strong>${partidasLabel}</strong><span>partidas puntuadas</span></div>
        <div><strong>${precisionGlobal === null ? '—' : precisionGlobal + '%'}</strong><span>precisión acumulada</span></div>
      </div>
      ${filas.length >= 500 ? '<p class="nota-ranking">Se muestran las últimas 500 partidas guardadas.</p>' : ''}`;
    const bloqueProgreso = progreso.length ? `
      <h2 class="subtitulo">Progreso por tema</h2>
      <ul class="lista-progreso">${progreso.map((p) => {
        const pct = Math.round((p.dominadas / p.total) * 100);
        return `
          <li>
            <div class="cuerpo">
              <span class="nombre">${esc(p.materia)} · ${esc(p.tema)}</span>
              <span class="riel"><span class="relleno" style="width:${pct}%"></span></span>
            </div>
            <span class="pct">${pct}%<small>${p.dominadas}/${p.total}</small></span>
          </li>`;
      }).join('')}</ul>
      ${filas.length ? '<h2 class="subtitulo">Partidas</h2>' : ''}` : '';
    caja.innerHTML = bloqueResumen + bloqueProgreso + `<ul class="lista-historial">${filas.map((f) => {
      const pct = Math.round((f.aciertos / f.total) * 100);
      const fecha = new Date(f.creado).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      return `
        <li>
          <div class="cuerpo">
            <span class="nombre">${esc(f.materia)} · ${esc(f.tema)}</span>
            <span class="detalle">${fecha} · ${f.aciertos}/${f.total} (${pct}%) · racha ${f.racha_max}</span>
          </div>
          <b class="pts">${f.puntos}</b>
        </li>`;
    }).join('')}</ul>`;
  }).catch(() => {
    if (caja.isConnected) caja.innerHTML = '<p class="estado-ranking">No se pudo cargar el historial.</p>';
  });
}
