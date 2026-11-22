// ==========================================================
// jugadores.js: Directorio público de jugadores.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { jugadoresPublicos } from './ranking.js?v=20261112-dispositivos3';
import { vistaInicio } from './home.js';
import { S, app, esc, MEGACLASE_TEMA_ID, MEGACLASE_TOTAL } from './nucleo.js';
import { vistaHistorial } from './ranking-ui.js';

export function claveTema(materia, tema) {
  const normalizar = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return `${normalizar(materia)}::${normalizar(tema)}`;
}

export function catalogoTemasPublicados() {
  const porId = new Map();
  const porNombre = new Map();
  for (const m of S.indice.materias) {
    const temas = [...(m.temas || []), ...(m.segundoParcial?.autores || [])];
    for (const t of temas) {
      if (!t?.id || Number(t.preguntas || 0) < 1 || porId.has(t.id)) continue;
      const dato = { id: t.id, materia: m.nombre, tema: t.nombre };
      porId.set(t.id, dato);
      porNombre.set(claveTema(m.nombre, t.nombre), dato);
    }
  }
  // Banco externo de Maru, integrado a Biología 2 para perfiles y ranking.
  if (!porId.has(MEGACLASE_TEMA_ID)) {
    const dato = {
      id: MEGACLASE_TEMA_ID, materia: 'Biología 2',
      tema: 'Megaclase de repaso · Segundo parcial 2026 · Maru',
      preguntas: MEGACLASE_TOTAL,
    };
    porId.set(MEGACLASE_TEMA_ID, dato);
    porNombre.set(claveTema(dato.materia, dato.tema), dato);
  }
  return { lista: [...porId.values()], porId, porNombre };
}

function resumirJugadores(datos) {
  const catalogo = catalogoTemasPublicados();
  const mapa = new Map();
  const obtener = (apodo) => {
    const nombre = String(apodo || '').trim();
    if (!nombre) return null;
    const clave = nombre.toLocaleLowerCase('es');
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        apodo: nombre, temas: new Set(), partidas: 0,
        aciertos: 0, preguntas: 0, ultimaActividad: null, ultimaMs: 0,
      });
    }
    return mapa.get(clave);
  };
  const actualizarFecha = (jugador, fecha) => {
    const ms = Date.parse(fecha || '');
    if (Number.isFinite(ms) && ms > jugador.ultimaMs) {
      jugador.ultimaMs = ms;
      jugador.ultimaActividad = fecha;
    }
  };

  for (const fila of datos.progreso || []) {
    const jugador = obtener(fila.apodo);
    if (!jugador) continue;
    const tema = catalogo.porId.get(fila.tema_id) ||
      catalogo.porNombre.get(claveTema(fila.materia, fila.tema));
    if (tema) jugador.temas.add(tema.id);
    actualizarFecha(jugador, fila.creado);
  }
  for (const fila of datos.partidas || []) {
    const jugador = obtener(fila.apodo);
    if (!jugador) continue;
    const tema = catalogo.porNombre.get(claveTema(fila.materia, fila.tema));
    if (tema) jugador.temas.add(tema.id);
    jugador.partidas++;
    jugador.aciertos += Number(fila.aciertos) || 0;
    jugador.preguntas += Number(fila.total) || 0;
    actualizarFecha(jugador, fila.creado);
  }

  const totalTemas = catalogo.lista.length;
  const jugadores = [...mapa.values()].map((j) => ({
    ...j,
    temas: j.temas.size,
    totalTemas,
    cobertura: totalTemas ? Math.round((j.temas.size / totalTemas) * 100) : 0,
    precision: j.preguntas ? Math.round((j.aciertos / j.preguntas) * 100) : null,
  })).sort((a, b) =>
    b.temas - a.temas ||
    b.partidas - a.partidas ||
    b.ultimaMs - a.ultimaMs ||
    a.apodo.localeCompare(b.apodo, 'es')
  );

  return { jugadores, totalTemas };
}

function fechaCorta(fecha) {
  if (!fecha) return 'Sin actividad reciente';
  const ms = Date.parse(fecha);
  if (!Number.isFinite(ms)) return 'Sin actividad reciente';
  return new Date(ms).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function vistaJugadores(filtroInicial = '') {
  app.innerHTML = `
    <main class="pantalla">
      <button class="btn enlace" id="btn-volver">← Inicio</button>
      <h1 class="titulo-seccion">👥 Jugadores</h1>
      <p class="nota-ranking">Conocé quiénes juegan y cuánto contenido de Parcialito recorrió cada persona.</p>
      <div class="jugadores-cabecera" id="jugadores-cabecera"><span class="estado-ranking">Cargando jugadores…</span></div>
      <label class="jugadores-busqueda">
        <span>Buscar jugador</span>
        <input id="jugadores-filtro" type="search" maxlength="20" placeholder="Escribí un apodo…" autocomplete="off">
      </label>
      <p class="jugadores-contador" id="jugadores-contador"></p>
      <ol class="lista-jugadores" id="lista-jugadores"><li class="estado-ranking">Cargando…</li></ol>
    </main>`;

  document.getElementById('btn-volver').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  const filtro = document.getElementById('jugadores-filtro');
  const cabecera = document.getElementById('jugadores-cabecera');
  const contador = document.getElementById('jugadores-contador');
  const lista = document.getElementById('lista-jugadores');
  filtro.value = filtroInicial;

  let jugadores = [];
  let totalTemas = 0;
  function pintarLista() {
    const termino = filtro.value.trim().toLocaleLowerCase('es');
    const visibles = jugadores.filter((j) => j.apodo.toLocaleLowerCase('es').includes(termino));
    contador.textContent = `${visibles.length} de ${jugadores.length} jugadores`;
    if (!visibles.length) {
      lista.innerHTML = jugadores.length
        ? '<li class="estado-ranking">No hay jugadores que coincidan con esa búsqueda.</li>'
        : '<li class="estado-ranking">Todavía no hay jugadores registrados. ¡Sé el primero en aparecer!</li>';
      return;
    }
    lista.innerHTML = visibles.map((j) => `
      <li class="jugador-fila ${estado.apodo && estado.apodo.toLowerCase() === j.apodo.toLowerCase() ? 'jugador-propio' : ''}">
        <button class="jugador-enlace" type="button" data-apodo="${esc(j.apodo)}">
          <span class="jugador-cabecera-fila">
            <strong>${esc(j.apodo)}</strong>
            <span>${j.temas}/${totalTemas} temas</span>
          </span>
          <span class="jugador-riel" aria-label="${j.cobertura}% de cobertura temática"><i style="width:${j.cobertura}%"></i></span>
          <span class="jugador-detalle">
            ${j.partidas ? `${j.partidas} partidas puntuadas · ${j.precision}% de precisión` : 'Actividad registrada por tema'}
            <span>Última actividad: ${fechaCorta(j.ultimaActividad)}</span>
          </span>
          <span class="jugador-flecha" aria-hidden="true">↗</span>
        </button>
      </li>`).join('');
    lista.querySelectorAll('.jugador-enlace').forEach((b) => b.addEventListener('click', () => {
      Sonido.clic();
      const busqueda = filtro.value;
      vistaHistorial(b.dataset.apodo, () => vistaJugadores(busqueda));
    }));
  }

  filtro.addEventListener('input', pintarLista);
  window.scrollTo(0, 0);
  jugadoresPublicos().then((datos) => {
    if (!lista.isConnected) return;
    const resumen = resumirJugadores(datos);
    jugadores = resumen.jugadores;
    totalTemas = resumen.totalTemas;
    cabecera.innerHTML = `
      <div><strong>${jugadores.length}</strong><span>jugadores registrados</span></div>
      <div><strong>${totalTemas}</strong><span>temas disponibles</span></div>`;
    pintarLista();
  }).catch(() => {
    if (!lista.isConnected) return;
    cabecera.innerHTML = '';
    contador.textContent = '';
    lista.innerHTML = '<li class="estado-ranking">No se pudo cargar el directorio. Probá de nuevo en un rato.</li>';
  });
}
