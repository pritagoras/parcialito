// ==========================================================
// resultado.js: Pantalla de resultado y progreso.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';
import { rankingActivo, guardarPartida, guardarProgreso, registrarSesion } from './ranking.js?v=20261112-dispositivos3';
import { idDispositivo, infoDispositivo } from './dispositivo.js?v=20261112-dispositivos3';
import { registrarEventoActividad, idSesionActividad } from './actividad.js?v=20261113-1';
import { dominadasDe } from './datos.js';
import { vistaInicio } from './home.js';
import { empezarJuego } from './juego.js';
import { S, app, esc, MEGACLASE_TEMA_ID, MEGACLASE_TOTAL } from './nucleo.js';
import { enviarIntentos } from './reportes.js';

function filasProgreso(preguntas) {
  const ids = new Set(preguntas.map((q) => q.temaId));
  const filas = [];
  const vistos = new Set();
  for (const m of S.indice.materias) {
    const temas = [...(m.temas || []), ...(m.segundoParcial?.autores || [])];
    for (const t of temas) {
      if (!ids.has(t.id) || vistos.has(t.id)) continue;
      vistos.add(t.id);
      filas.push({
        apodo: estado.apodo, materia: m.nombre, tema_id: t.id, tema: t.nombre,
        dominadas: dominadasDe(t), total: t.preguntas,
        mejor_precision: estado.mejores[t.id]?.precision || 0,
      });
    }
  }
  if (ids.has(MEGACLASE_TEMA_ID) && !vistos.has(MEGACLASE_TEMA_ID)) {
    filas.push({
      apodo: estado.apodo, materia: 'Biología 2', tema_id: MEGACLASE_TEMA_ID,
      tema: 'Megaclase de repaso · Segundo parcial 2026 · Maru',
      dominadas: Math.min(dominadasDe({ id: MEGACLASE_TEMA_ID }), MEGACLASE_TOTAL),
      total: MEGACLASE_TOTAL, mejor_precision: estado.mejores[MEGACLASE_TEMA_ID]?.precision || 0,
    });
  }
  return filas;
}

export function vistaResultado() {
  const j = S.juego;
  const total = j.preguntas.length;
  const precision = Math.round((j.aciertos / total) * 100);

  if (j.meta.temaId) {
    const prev = estado.mejores[j.meta.temaId] || { precision: 0, puntos: 0, racha: 0 };
    estado.mejores[j.meta.temaId] = {
      precision: Math.max(prev.precision, precision),
      puntos: Math.max(prev.puntos, j.puntos),
      racha: Math.max(prev.racha, j.mejorRacha),
    };
  }
  guardar();

  let emoji = '💪', titulo = 'A seguir practicando', sub = 'Repasá las falladas y probá de nuevo.';
  if (precision >= 90) { emoji = '🏆'; titulo = '¡Excelente!'; sub = 'Dominás este material.'; }
  else if (precision >= 70) { emoji = '🎉'; titulo = '¡Muy bien!'; sub = 'Un repaso más y lo tenés.'; }
  else if (precision >= 50) { emoji = '👍'; titulo = 'Vas por buen camino'; sub = 'Mirá las explicaciones de las falladas.'; }

  const falladas = j.falladas.map((q) => `
    <details>
      <summary>${esc(q.texto)}</summary>
      <div class="detalle">
        <p><strong>Respuesta:</strong> ${esc(q.opciones[q.correcta])}</p>
        ${q.explicacion ? `<p>${esc(q.explicacion)}</p>` : ''}
      </div>
    </details>`).join('');

  app.innerHTML = `
    <main class="pantalla resultado ${j.meta.estilo === 'parcial-limpio' ? 'pantalla-segundo-limpia' : ''}">
      <div class="grande" aria-hidden="true">${emoji}</div>
      <h1>${titulo}</h1>
      <p class="sub">${sub}</p>
      <div class="cifras">
        <div class="cifra"><b>${j.puntos}</b><span>Puntos</span></div>
        <div class="cifra"><b>${precision}%</b><span>${j.aciertos} de ${total}</span></div>
        <div class="cifra"><b>${j.mejorRacha}</b><span>Mejor racha</span></div>
      </div>
      <p class="estado-ranking" id="estado-ranking" role="status"></p>
      <div class="botones">
        <button class="btn primario" id="btn-otra">Jugar de nuevo</button>
        ${j.falladas.length ? `<button class="btn secundario" id="btn-falladas">Repasar falladas (${j.falladas.length})</button>` : ''}
        <button class="btn secundario" id="btn-inicio">Inicio</button>
      </div>
      ${j.falladas.length ? `<section class="falladas"><h2>Para repasar</h2>${falladas}</section>` : ''}
    </main>`;

  const { meta } = j;
  registrarEventoActividad('juego_fin', { materia: meta.materiaNombre || meta.titulo, tema: meta.temaNombre, modo: meta.ranking ? 'ronda' : 'repaso', total_preguntas: total, datos: { aciertos: j.aciertos, puntos: j.puntos, precision, racha_max: j.mejorRacha } });
  const falladasPool = j.falladas;
  enviarIntentos(j);
  S.juego = null;

  if (rankingActivo() && meta.ranking) {
    const estadoEl = document.getElementById('estado-ranking');
    if (!estado.apodo) {
      estadoEl.textContent = 'Elegí un apodo en el inicio para aparecer en el ranking.';
    } else {
      estadoEl.textContent = 'Guardando en el ranking…';
      guardarPartida({
        apodo: estado.apodo,
        materia: meta.materiaNombre,
        tema: meta.temaNombre,
        aciertos: j.aciertos,
        total,
        puntos: j.puntos,
        rachaMax: j.mejorRacha,
      }).then(
        () => { const el = document.getElementById('estado-ranking'); if (el) el.textContent = '✓ Guardado en el ranking'; },
        () => { const el = document.getElementById('estado-ranking'); if (el) el.textContent = 'No se pudo guardar en el ranking.'; },
      );
    }
  }

  if (rankingActivo() && estado.apodo) {
    guardarProgreso(filasProgreso(j.preguntas)).catch(() => {});
    registrarSesion({
      apodo: estado.apodo,
      modo: meta.ranking ? 'ronda' : 'repaso',
      materia: String(meta.materiaNombre || meta.titulo || '').slice(0, 80),
      tema: String(meta.temaNombre || '').slice(0, 80),
      aciertos: j.aciertos,
      total,
      puntos: j.puntos,
      racha_max: j.mejorRacha,
      dispositivo_id: idDispositivo(),
      actividad_session_id: idSesionActividad(),
      ...infoDispositivo(),
    }).catch(() => {});
  }

  document.getElementById('btn-otra').addEventListener('click', () => { Sonido.clic(); meta.repetir(); });
  document.getElementById('btn-falladas')?.addEventListener('click', () => {
    Sonido.clic();
    const metaFalladas = { ...meta, temaId: null, ranking: false };
    empezarJuego(falladasPool, { ...metaFalladas, titulo: 'Repaso de falladas', repetir: () => empezarJuego(falladasPool, metaFalladas) });
  });
  document.getElementById('btn-inicio').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });

  const bueno = precision >= 70;
  Sonido.fin(bueno);
  if (bueno) lanzarConfeti(precision >= 90 ? 160 : 100);
  window.scrollTo(0, 0);
}
