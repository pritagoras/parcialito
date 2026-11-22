// ==========================================================
// reportes.js: Envío de intentos y reportes de preguntas.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { rankingActivo, registrarIntentos, enviarReporte } from './ranking.js?v=20261112-dispositivos3';
import { idDispositivo } from './dispositivo.js?v=20261112-dispositivos3';
import { idSesionActividad } from './actividad.js?v=20261113-1';
import { avisar, esc } from './nucleo.js';

export function enviarIntentos(j) {
  if (!j || !j.intentos.length) return;
  const filas = j.intentos.map(f => ({ ...f, actividad_session_id: idSesionActividad(), dispositivo_id: idDispositivo(), apodo: estado.apodo || null, materia: String(j.meta.materiaNombre || j.meta.titulo || '').slice(0,80), tema: String(j.meta.temaNombre || '').slice(0,80) }));
  j.intentos = [];
  if (rankingActivo()) registrarIntentos(filas).catch(() => {});
}

const MOTIVOS_REPORTE = [
  ['respuesta_incorrecta', 'La respuesta marcada como correcta está mal'],
  ['enunciado', 'El enunciado es confuso o tiene errores'],
  ['opciones', 'Las opciones están mal armadas'],
  ['imagen', 'La imagen no se ve o no corresponde'],
  ['otro', 'Otro motivo'],
];

export function abrirReporte(q, boton) {
  const motivos = MOTIVOS_REPORTE.filter(([clave]) => clave !== 'imagen' || q.imagen);
  const dlg = document.createElement('dialog');
  dlg.className = 'reporte';
  dlg.setAttribute('aria-labelledby', 'reporte-titulo');
  dlg.innerHTML = `
    <h2 id="reporte-titulo">Reportar pregunta</h2>
    <p class="reporte-texto">${esc(q.texto)}</p>
    <label class="campo">
      <span>¿Qué está mal?</span>
      <select id="reporte-motivo">
        ${motivos.map(([clave, txt]) => `<option value="${clave}">${esc(txt)}</option>`).join('')}
      </select>
    </label>
    <label class="campo">
      <span>Comentario (opcional)</span>
      <textarea id="reporte-comentario" rows="3" maxlength="300" placeholder="Contanos qué viste mal"></textarea>
    </label>
    <p class="reporte-estado" id="reporte-estado" role="status"></p>
    <div class="reporte-botones">
      <button class="btn secundario" id="reporte-cancelar" type="button">Cancelar</button>
      <button class="btn primario" id="reporte-enviar" type="button">Enviar</button>
    </div>`;
  document.body.appendChild(dlg);

  const estadoEl = dlg.querySelector('#reporte-estado');
  const btnEnviar = dlg.querySelector('#reporte-enviar');
  dlg.querySelector('#reporte-cancelar').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => dlg.remove());

  btnEnviar.addEventListener('click', async () => {
    btnEnviar.disabled = true;
    estadoEl.textContent = 'Enviando…';
    try {
      await enviarReporte({
        pregunta_id: q.id,
        pregunta_hash: q.id,
        tema_id: q.temaId,
        archivo_json: q.archivoJson || null,
        pregunta_numero: q.numeroPregunta || null,
        pregunta: q.texto.slice(0, 300),
        correcta: q.opciones[q.correcta].slice(0, 200),
        motivo: dlg.querySelector('#reporte-motivo').value,
        comentario: dlg.querySelector('#reporte-comentario').value.trim().slice(0, 300) || null,
        apodo: estado.apodo || null,
      });
      (estado.reportadas ||= {})[q.id] = 1;
      guardar();
      if (boton?.isConnected) { boton.disabled = true; boton.textContent = '✓ Reportada'; }
      dlg.close();
      avisar('¡Gracias por avisar!');
    } catch {
      btnEnviar.disabled = false;
      estadoEl.textContent = 'No se pudo enviar. Probá de nuevo.';
    }
  });

  dlg.showModal();
}
