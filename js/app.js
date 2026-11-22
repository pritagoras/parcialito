// ==========================================================
// app.js: Punto de entrada: lanza el arranque. Las pantallas están en los demás módulos de js/.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { iniciarTelemetria } from './telemetria.js?v=20261112-dispositivos4';
import { iniciarActividad } from './actividad.js?v=20261113-1';
import { iniciar } from './arranque.js';
import { anotarEntrada } from './visitas.js';
import './teclado.js';   // solo registra atajos de teclado al cargarse

anotarEntrada();

iniciarActividad().catch(() => {});

iniciarTelemetria().catch(() => {});

iniciar();
