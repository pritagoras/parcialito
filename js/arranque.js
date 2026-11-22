// ==========================================================
// arranque.js: Arranque: carga el índice y muestra el inicio (iniciar).
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { cargarTodas, pintarTarjetasInicio } from './anki.js';
import { vistaInicio } from './home.js';
import { iniciarDetectorActualizaciones } from './instalacion.js';
import { S, vistaCargando } from './nucleo.js';
import { vistaError } from './partidas.js';

export async function iniciar() {
  vistaCargando('Cargando materias…');
  try {
    const r = await fetch('data/index.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error(`No se pudo leer data/index.json (${r.status})`);
    S.indice = await r.json();
    S.indice.materias = S.indice.materias || [];
    iniciarDetectorActualizaciones(S.indice.generado);
    if (estado.srs) { delete estado.srs; guardar(); }
    vistaInicio();
    cargarTodas().then(pintarTarjetasInicio).catch(() => {});
  } catch (e) {
    vistaError(e);
  }
}
