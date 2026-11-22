// ==========================================================
// partidas.js: Armado de partidas: práctica por tema, errores, difíciles, megaclase.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { preguntasDificiles } from './ranking.js?v=20261112-dispositivos3';
import { cargarTodas } from './anki.js';
import { iniciar } from './arranque.js';
import { cargarTema, estadoPreguntaMC, MIN_DATOS, normalizar } from './datos.js';
import { vistaInicio } from './home.js';
import { empezarJuego } from './juego.js';
import { vistaMateria } from './materia.js';
import { S, app, avisar, esc, MEGACLASE_TEMA_ID, mezclar, vistaCargando } from './nucleo.js';

export async function lanzarPracticaTema(materia, tema, indiceMateria, soloNoDominadas = false, volver = () => vistaMateria(indiceMateria)) {
  vistaCargando(soloNoDominadas ? 'Preparando tus preguntas pendientes…' : 'Preparando el tema…');
  try {
    const preguntas = await cargarTema(tema, materia);
    const pool = soloNoDominadas
      ? preguntas.filter((q) => !estadoPreguntaMC(q)?.dominada)
      : preguntas;

    if (!pool.length) {
      volver();
      avisar(soloNoDominadas ? '¡Ya dominaste todas las preguntas de este tema!' : 'Este tema no tiene preguntas disponibles');
      return;
    }

    const iniciar = () => lanzarPracticaTema(materia, tema, indiceMateria, soloNoDominadas, volver);
    empezarJuego(mezclar(pool), {
      titulo: materia.nombre,
      temaId: tema.id,
      ranking: true,
      materiaNombre: materia.nombre,
      temaNombre: tema.nombre,
      repetir: iniciar,
      volver,
    });
  } catch (e) {
    vistaError(e);
  }
}

export async function lanzarTemas(materia, temas, cantidad, volver = () => vistaInicio()) {
  vistaCargando('Preparando preguntas…');
  try {
    let pool = [];
    for (const t of temas) pool.push(...(await cargarTema(t, materia)));
    pool = mezclar(pool);
    if (cantidad > 0) pool = pool.slice(0, cantidad);
    empezarJuego(pool, {
      titulo: materia.nombre,
      temaId: temas.length === 1 ? temas[0].id : null,
      ranking: true,
      materiaNombre: materia.nombre,
      temaNombre: temas.length === 1 ? temas[0].nombre : 'Varios temas',
      repetir: () => lanzarTemas(materia, temas, cantidad, volver),
      volver,
    });
  } catch (e) {
    vistaError(e);
  }
}

export async function lanzarMegaclase() {
  vistaCargando('Preparando las preguntas de la megaclase…');
  try {
    const r = await fetch('data/megaclase-marucbc-2026.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('No se pudo leer el repaso de Maru (' + r.status + ')');
    const json = await r.json();
    const materia = { nombre: json.materia || 'Biología CBC' };
    const tema = {
      id: MEGACLASE_TEMA_ID,
      nombre: json.tema || 'Megaclase de repaso · Segundo parcial 2026',
      archivo: 'data/megaclase-marucbc-2026.json',
    };
    const pool = normalizar(json, tema, materia);
    const ordenadas = [
      ...pool.filter((pregunta) => !estadoPreguntaMC(pregunta)?.dominada),
      ...pool.filter((pregunta) => estadoPreguntaMC(pregunta)?.dominada),
    ];
    empezarJuego(ordenadas, {
      titulo: tema.nombre,
      temaId: tema.id,
      ranking: false,
      estilo: 'parcial-limpio',
      materiaNombre: materia.nombre,
      temaNombre: tema.nombre,
      repetir: lanzarMegaclase,
      volver: vistaInicio,
    });
  } catch (e) {
    vistaError(e);
  }
}

export async function lanzarErrores() {
  vistaCargando('Buscando tus errores…');
  try {
    let pool = [];
    for (const m of S.indice.materias) {
      for (const t of m.temas) pool.push(...(await cargarTema(t, m)));
    }
    pool = mezclar(pool.filter((q) => estado.errores[q.id]));
    if (!pool.length) {
      estado.errores = {};
      guardar();
      vistaInicio();
      avisar('No quedan errores por repasar');
      return;
    }
    empezarJuego(pool, {
      titulo: 'Repaso de errores',
      temaId: null,
      repetir: () => lanzarErrores(),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

export async function lanzarDificiles() {
  vistaCargando('Buscando las preguntas más difíciles…');
  try {
    let filas;
    try {
      filas = await preguntasDificiles(MIN_DATOS, 60);
    } catch {
      vistaInicio();
      avisar('No se pudo leer la estadística');
      return;
    }
    const todas = await cargarTodas();
    const dificiles = filas.map((f) => todas.get(f.pregunta_id)).filter(Boolean);
    if (dificiles.length < 5) {
      vistaInicio();
      avisar('Todavía no hay datos suficientes');
      return;
    }
    const cuantas = estado.cantidad === 0 ? 20 : Math.max(estado.cantidad, 10);
    empezarJuego(mezclar(dificiles.slice(0, cuantas)), {
      titulo: 'Las más difíciles',
      temaId: null,
      repetir: () => lanzarDificiles(),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

export function vistaError(e) {
  console.error(e);
  app.innerHTML = `
    <main class="pantalla">
      <div class="vacio">
        <strong>No se pudieron cargar las preguntas</strong>
        ${esc(e.message || e)}<br><br>
        Si abriste <code>index.html</code> con doble clic, el navegador bloquea la lectura de archivos.
        Levantá un servidor local con <code>python -m http.server</code> y entrá a
        <code>http://localhost:8000</code>.
      </div>
      <p style="margin-top:1rem"><button class="btn secundario" id="btn-reintentar">Volver al inicio</button></p>
    </main>`;
  document.getElementById('btn-reintentar').addEventListener('click', iniciar);
}
