// ==========================================================
// participacion.js: Participación: comentarios públicos y reportes generales.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { limpiarApodo, comentariosPublicos, guardarComentarioPublico, enviarReporteGeneral } from './ranking.js?v=20261112-dispositivos3';
import { esc } from './nucleo.js';

let comentariosCargando = false;

export async function cargarComentariosPublicos() {
  const caja = document.getElementById('lista-comentarios');
  if (!caja || comentariosCargando) return;
  comentariosCargando = true;
  caja.innerHTML = '<p class="estado-ranking">Cargando comentarios…</p>';
  try {
    const filas = await comentariosPublicos();
    if (!caja.isConnected) return;
    caja.innerHTML = filas.length ? filas.map((f) => `
      <article class="comentario-publico">
        <div class="comentario-cabecera"><strong>${esc(f.apodo)}</strong><time datetime="${esc(f.creado)}">${new Date(f.creado).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</time></div>
        <p>${esc(f.comentario)}</p>
      </article>`).join('') : '<p class="estado-ranking">Todavía no hay comentarios. ¡Podés ser el primero!</p>';
  } catch {
    if (caja.isConnected) caja.innerHTML = '<p class="estado-ranking">No se pudieron cargar los comentarios. Probá de nuevo más tarde.</p>';
  } finally {
    comentariosCargando = false;
  }
}

export async function publicarComentario(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const apodoEl = document.getElementById('comentario-apodo');
  const textoEl = document.getElementById('comentario-texto');
  const estadoEl = document.getElementById('comentario-estado');
  const boton = document.getElementById('comentario-enviar');
  const apodo = limpiarApodo(apodoEl.value);
  const comentario = textoEl.value.trim().slice(0, 500);
  if (!apodo || !comentario) { estadoEl.textContent = 'Completá el apodo y el comentario.'; return; }
  boton.disabled = true;
  estadoEl.textContent = 'Publicando…';
  try {
    await guardarComentarioPublico({ apodo, comentario });
    textoEl.value = '';
    estadoEl.textContent = '¡Comentario publicado!';
    await cargarComentariosPublicos();
  } catch {
    estadoEl.textContent = 'No se pudo publicar. Es posible que falte activar la tabla de comentarios en Supabase.';
  } finally {
    boton.disabled = false;
  }
}

export function abrirReporteGeneral() {
  const dlg = document.createElement('dialog');
  dlg.className = 'reporte';
  dlg.setAttribute('aria-labelledby', 'reporte-general-titulo');
  dlg.innerHTML = `
    <h2 id="reporte-general-titulo">Reporte privado</h2>
    <p class="participacion-ayuda">Este mensaje solo vos, como responsable de Parcialito, podrás revisarlo. No aparecerá en los comentarios públicos.</p>
    <form id="form-reporte-general" class="form-participacion">
      <label class="campo"><span>Motivo</span><select id="reporte-general-motivo"><option value="error">Error en la página o una pregunta</option><option value="sugerencia">Sugerencia de mejora</option><option value="tecnico">Problema técnico</option><option value="otro">Otro</option></select></label>
      <label class="campo"><span>Apodo (opcional)</span><input id="reporte-general-apodo" maxlength="20" placeholder="Tu apodo"></label>
      <label class="campo"><span>Detalle</span><textarea id="reporte-general-texto" rows="4" maxlength="1000" required placeholder="Contame qué pasó o qué cambiarías"></textarea></label>
      <p class="participacion-estado" id="reporte-general-estado" role="status" aria-live="polite"></p>
      <div class="reporte-botones"><button class="btn secundario" id="reporte-general-cancelar" type="button">Cancelar</button><button class="btn primario" id="reporte-general-enviar" type="submit">Enviar en privado</button></div>
    </form>`;
  document.body.appendChild(dlg);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.querySelector('#reporte-general-cancelar').addEventListener('click', () => dlg.close());
  dlg.querySelector('#form-reporte-general').addEventListener('submit', async (e) => {
    e.preventDefault();
    const boton = dlg.querySelector('#reporte-general-enviar');
    const estadoEl = dlg.querySelector('#reporte-general-estado');
    boton.disabled = true;
    estadoEl.textContent = 'Enviando…';
    try {
      await enviarReporteGeneral({
        motivo: dlg.querySelector('#reporte-general-motivo').value,
        apodo: limpiarApodo(dlg.querySelector('#reporte-general-apodo').value) || null,
        comentario: dlg.querySelector('#reporte-general-texto').value.trim().slice(0, 1000),
        pagina: location.pathname.slice(0, 200)
      });
      estadoEl.textContent = 'Reporte enviado de forma privada. ¡Gracias!';
      boton.textContent = 'Enviado';
      setTimeout(() => { if (dlg.open) dlg.close(); }, 1100);
    } catch {
      estadoEl.textContent = 'No se pudo enviar. Es posible que falte activar la tabla de reportes en Supabase.';
      boton.disabled = false;
    }
  });
  dlg.showModal();
}
