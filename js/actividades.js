// ==========================================================
// actividades.js: Registro de actividades interactivas: un tema las activa con "actividad": "<clave>" en su JSON.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { abrirReplicacion, TITULO as TITULO_REPLICACION } from './replicacion.js?v=dev';
import { abrirCuadro, TITULO as TITULO_CUADRO } from './cuadro.js?v=dev';
import { abrirHorquilla, TITULO as TITULO_HORQUILLA } from './horquilla.js?v=dev';
import { abrirBases, TITULO as TITULO_BASES } from './bases.js?v=20261027-1';
import { abrirOperones, TITULO as TITULO_OPERONES } from './operones.js?v=20261026-9';
import { abrirComunicacion, TITULO as TITULO_COMUNICACION } from './comunicacion.js?v=20261111-1';
import { abrirProteinaG, TITULO as TITULO_PROTEINA_G } from './proteina-g.js?v=20261027-2';
import { abrirLacTrp, TITULO as TITULO_LAC_TRP } from './lac-vs-trp.js?v=20261026-1';
import { abrirComparadorComunicacion, TITULO as TITULO_COMPARADOR_COMUNICACION } from './comparador-comunicacion.js?v=20261026-1';
import { abrirComparadores, TITULO as TITULO_COMPARADORES } from './comparadores.js?v=20261026-1';
import { abrirTelomeros, TITULO as TITULO_TELOMEROS } from './telomeros.js?v=20261027-1';
import { abrirAtlasCromosomas, TITULO as TITULO_ATLAS_CROMOSOMAS } from './atlas-cromosomas.js?v=20261110-1';
import { abrirDeduccionNatural, TITULO as TITULO_DEDUCCION_NATURAL } from './deduccion-natural.js?v=20261114-10';

// Actividades interactivas: un tema las activa con "actividad": "<clave>" en su JSON
export const ACTIVIDADES = {
  replicacion: { titulo: TITULO_REPLICACION, icono: '🫧', abrir: abrirReplicacion },
  cuadro: { titulo: TITULO_CUADRO, icono: '📊', abrir: abrirCuadro },
  horquilla: { titulo: TITULO_HORQUILLA, icono: '🧪', abrir: abrirHorquilla },
  bases: { titulo: TITULO_BASES, icono: '🧬', abrir: abrirBases },
  telomeros: { titulo: TITULO_TELOMEROS, icono: '🧢', abrir: abrirTelomeros },
  'atlas-cromosomas': { titulo: TITULO_ATLAS_CROMOSOMAS, icono: '🧬', abrir: abrirAtlasCromosomas },
  operones: { titulo: TITULO_OPERONES, icono: '🧫', abrir: abrirOperones },
  comunicacion: { titulo: TITULO_COMUNICACION, icono: '⚡', abrir: abrirComunicacion },
  'proteina-g': { titulo: TITULO_PROTEINA_G, icono: '🧪', abrir: abrirProteinaG },
  'lac-vs-trp': { titulo: TITULO_LAC_TRP, icono: '🧫', abrir: abrirLacTrp },
  'comparador-comunicacion': { titulo: TITULO_COMPARADOR_COMUNICACION, icono: '🔁', abrir: abrirComparadorComunicacion },
  comparadores: { titulo: TITULO_COMPARADORES, icono: '⚖️', abrir: abrirComparadores },
  'deduccion-natural': { titulo: TITULO_DEDUCCION_NATURAL, icono: '🧩', abrir: abrirDeduccionNatural },
};
