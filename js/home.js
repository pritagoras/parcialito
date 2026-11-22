// ==========================================================
// home.js: Pantalla de inicio (materias, banners) y resúmenes del inicio.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { rankingActivo } from './ranking.js?v=20261112-dispositivos3';
import { abrirLab } from './lab.js?v=20261111-1';
import { abrirEnvioImagenes } from './envios.js?v=20261114-3';
import { pintarTarjetasInicio } from './anki.js';
import { dominio, progresoMCDe, temasConContenido } from './datos.js';
import { esCelular, estaInstalada, instalarParcialito } from './instalacion.js';
import { lanzarIPCPrimerParcial, vistaIPCSegundoParcial } from './ipc.js';
import { vistaJugadores } from './jugadores.js';
import { vistaMateria } from './materia.js';
import { S, app, avisar, colorMateria, esc, MEGACLASE_TEMA_ID, plural, resumenesInicioCache } from './nucleo.js';
import { cargarSegundoParcial, lanzarPrimerParcial, lanzarSegundoParcial, lanzarSimulacroMixto, vistaBancoSegundoParcial, vistaEstudioBiologiaPorParcial } from './parciales-bio.js';
import { abrirReporteGeneral, cargarComentariosPublicos, publicarComentario } from './participacion.js';
import { lanzarDificiles, lanzarErrores, lanzarMegaclase } from './partidas.js';
import { vistaApodo, vistaRanking } from './ranking-ui.js';

export function vistaInicio() {
  S.juego = null;
  S.sesionT = null;
  const nErrores = Object.keys(estado.errores).length;
  const tarjetas = S.indice.materias.map((m, i) => {
    const totalPreg = m.temas.reduce((s, t) => s + (t.preguntas || 0), 0);
    const totalTarj = m.temas.reduce((s, t) => s + (t.tarjetas || 0), 0);
    const pct = dominio(m);
    const nTemas = temasConContenido(m).length || m.temas.length;

    let metaTexto = '';
    if (totalPreg > 0 && totalTarj > 0) {
      metaTexto = `${plural(nTemas, 'tema', 'temas')}, ${plural(totalPreg, 'pregunta', 'preguntas')} · ${plural(totalTarj, 'tarjeta', 'tarjetas')}`;
    } else if (totalTarj > 0) {
      metaTexto = `${plural(nTemas, 'tema', 'temas')}, ${plural(totalTarj, 'tarjeta', 'tarjetas')}`;
    } else {
      metaTexto = `${plural(nTemas, 'tema', 'temas')}, ${plural(totalPreg, 'pregunta', 'preguntas')}`;
    }

    return `
      <button class="materia" data-materia="${i}" style="--c:${colorMateria(m, i)}">
        <span class="emoji" aria-hidden="true">${esc(m.emoji || '📚')}</span>
        <h2>${esc(m.nombre)}</h2>
        <span class="meta">${metaTexto}</span>
        <span class="dominio">
          <span class="riel"><span class="relleno" style="width:${pct}%"></span></span>
          <span>${pct}%</span>
        </span>
      </button>`;
  }).join('');

  app.innerHTML = `
    <main class="pantalla">
      <header class="cabecera">
        <h1 class="marca">Parcialito</h1>
        <div class="acciones-cabecera">
          <button class="icono" id="btn-sonido" aria-label="${estado.silencio ? 'Activar sonido' : 'Silenciar'}">${estado.silencio ? '🔇' : '🔊'}</button>
          <a class="dev-link" href="https://www.instagram.com/pritagoras/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Pritagoras" title="Instagram de Pritagoras">
            <svg class="instagram-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="4.1" stroke="currentColor" stroke-width="2"/>
              <circle cx="17.65" cy="6.55" r="1.2" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </header>
      <p class="bajada">Elegí una materia y practicá con preguntas de opción múltiple.</p>
      <section class="banner-imagenes" aria-label="Compartir imágenes">
        <div class="banner-imagenes-icono" aria-hidden="true">📸</div>
        <div class="banner-imagenes-texto">
          <strong>Compartí con Parcialito</strong>
          <p>Apuntes, fotos, mascotas o memes.</p>
        </div>
        <button class="btn-subir-imagen" id="btn-subir-imagen" type="button">＋ Subir imagen</button>
      </section>
      <a class="banner-corrector" href="./corrector.html" aria-label="Abrir la corrección del segundo parcial, temas 43 y 44">
        <span class="corrector-sello" aria-hidden="true">✓</span>
        <span class="corrector-texto"><strong>Corrección del segundo parcial</strong><small>Compará tus respuestas con las grillas oficiales · Temas 43 y 44</small></span>
        <span class="corrector-accion">Abrir ↗</span>
      </a>
      <section class="banner-segundo" aria-labelledby="segundo-parcial-titulo">
        <div class="sp-cabecera"><span class="sp-sello">✦ BIOLOGÍA 1</span><span class="sp-numero">PARCIALES</span></div>
        <h2 id="segundo-parcial-titulo">Practicá los dos parciales</h2>
        <p class="sp-descripcion">Elegí un banco completo o probá un simulacro mixto con 20 preguntas de cada parcial.</p>
        <button class="sp-tema" id="btn-sp-primer" type="button">
          <span class="sp-tema-icono" aria-hidden="true">🧬</span>
          <span class="sp-tema-texto"><strong>Primer parcial de Biología · banco completo</strong><small>250 preguntas · opción múltiple</small></span>
          <span class="sp-tema-accion">Jugar <b aria-hidden="true">↗</b></span>
        </button>
        <button class="sp-tema" id="btn-sp-ciclo" type="button">
          <span class="sp-tema-icono" aria-hidden="true">🧬</span>
          <span class="sp-tema-texto"><strong>Segundo parcial de Biología · banco completo</strong><small>547 preguntas · opción múltiple</small></span>
          <span class="sp-tema-accion">Jugar <b aria-hidden="true">↗</b></span>
        </button>
        <button class="sp-tema sp-tema-por-tema" id="btn-sp-mixto" type="button">
          <span class="sp-tema-icono" aria-hidden="true">🎯</span>
          <span class="sp-tema-texto"><strong>Simulacro mixto · 40 preguntas</strong><small>20 del primer parcial + 20 del segundo · orden aleatorio</small></span>
          <span class="sp-tema-accion">Jugar <b aria-hidden="true">↗</b></span>
        </button>
        <button class="sp-tema sp-tema-por-tema" id="btn-sp-temas" type="button">
          <span class="sp-tema-icono" aria-hidden="true">🗂️</span>
          <span class="sp-tema-texto"><strong>Estudiar por tema</strong><small>Núcleo, duplicación, transcripción, traducción, herencia y más</small></span>
          <span class="sp-tema-accion">Elegir <b aria-hidden="true">↗</b></span>
        </button>
        <button class="sp-banco" id="btn-sp-banco" type="button">
          <span class="sp-banco-icono" aria-hidden="true">☷</span>
          <span class="sp-banco-texto"><strong>Ver el banco completo</strong><small>Explorá todas las preguntas, opciones y respuestas</small></span>
          <span class="sp-banco-flecha" aria-hidden="true">↗</span>
        </button>
      </section>
      <section class="banner-segundo banner-ipc-segundo" aria-labelledby="ipc-kath-titulo">
        <div class="sp-cabecera"><span class="sp-sello">✦ ESPACIO DE ESTUDIO</span><span class="sp-numero">IPC · KATH</span></div>
        <h2 id="ipc-kath-titulo">IPC para KATH</h2>
        <p class="sp-descripcion">Introducción al Pensamiento Científico. Se recuperaron los temas, las tarjetas de repaso y el banco completo del segundo parcial.</p>
        <button class="sp-tema" id="btn-ipc-temas-home" type="button">
          <span class="sp-tema-icono" aria-hidden="true">📚</span>
          <span class="sp-tema-texto"><strong>Explorar todos los temas</strong><small data-resumen-inicio="ipc-temas">Cargando resumen…</small></span>
          <span class="sp-tema-accion">Entrar <b aria-hidden="true">↗</b></span>
        </button>
        <button class="sp-tema" id="btn-ipc-primer-home" type="button">
          <span class="sp-tema-icono" aria-hidden="true">📘</span>
          <span class="sp-tema-texto"><strong>Primer parcial · banco completo</strong><small data-resumen-inicio="ipc-primer">Cargando resumen…</small></span>
          <span class="sp-tema-accion">Practicar <b aria-hidden="true">↗</b></span>
        </button>
        <button class="sp-tema" id="btn-ipc-segundo-home" type="button">
          <span class="sp-tema-icono" aria-hidden="true">📜</span>
          <span class="sp-tema-texto"><strong>Segundo parcial · banco completo</strong><small data-resumen-inicio="ipc-segundo">Cargando resumen…</small></span>
          <span class="sp-tema-accion">Practicar <b aria-hidden="true">↗</b></span>
        </button>
      </section>
      <section class="banner-segundo banner-megaclase" aria-labelledby="megaclase-titulo">
        <div class="sp-cabecera"><span class="sp-sello">✦ MEGACLASE · MARU</span><span class="sp-numero">CBC · 2026</span></div>
        <h2 id="megaclase-titulo">Repaso del segundo parcial</h2>
        <p class="sp-descripcion">Practicá las <span data-resumen-inicio="megaclase">preguntas del compilado</span> con respuesta explicada y sus figuras originales. Las que ya dominás quedan al final cuando vuelvas.</p>
        <button class="sp-tema" id="btn-megaclase" type="button">
          <span class="sp-tema-icono" aria-hidden="true">📝</span>
          <span class="sp-tema-texto"><strong>Entrar al repaso de Maru</strong><small data-resumen-inicio="megaclase-progreso">Opción múltiple · Cargando resumen…</small></span>
          <span class="sp-tema-accion">Practicar <b aria-hidden="true">↗</b></span>
        </button>
      </section>

      <button class="banner-lab" id="btn-lab" type="button"><span class="banner-lab-icon">🧬</span><span class="banner-lab-text"><strong>LAB <span class="banner-lab-nuevo">NUEVO</span></strong><small>Explorá la biología con modelos interactivos y recorridos guiados.</small></span><span class="banner-lab-flecha">↗</span></button>
      ${estaInstalada() || !esCelular() ? '' : `
        <div class="instalar-app-wrap">
          <button class="btn secundario btn-instalar" id="btn-instalar-app" type="button">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 16v3.5h15V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Instalar Parcialito</span>
          </button>
        </div>`}
      ${rankingActivo() ? `
        <div class="barra-ranking">
          <button class="btn secundario" id="btn-ranking">🏆 Ranking</button>
          <button class="btn secundario" id="btn-jugadores">👥 Jugadores</button>
          <button class="btn secundario" id="btn-dificiles">🔥 Las más difíciles</button>
          <button class="btn secundario" id="btn-apodo">👤 ${estado.apodo ? esc(estado.apodo) : 'Elegir apodo'}</button>
        </div>` : ''}
      <div id="zona-tarjetas"></div>
      ${nErrores ? `<button class="banner-errores" id="btn-errores"><span>Repasar mis errores</span><b>${nErrores}</b></button>` : ''}
      ${S.indice.materias.length
        ? `<div class="materias">${tarjetas}</div>`
        : `<div class="vacio"><strong>Todavía no hay materias</strong>
             Agregá archivos <code>.json</code> dentro de <code>data/</code> y corré
             <code>python tools/actualizar_indice.py</code>.</div>`}
      <section class="participacion" aria-label="Comentarios y reportes">
        <details class="panel-comentarios" id="panel-comentarios">
          <summary>
            <svg class="icono-lineal" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-9.5A7.5 7.5 0 0 1 10.5 4h2A7.5 7.5 0 0 1 20 11.5Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span>Comentarios</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 10 5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </summary>
          <div class="comentarios-contenido">
            <p class="participacion-ayuda">Dejá una idea, una duda o un comentario para quienes usan Parcialito.</p>
            <form id="form-comentario" class="form-participacion">
              <label class="campo"><span>Tu apodo</span><input id="comentario-apodo" name="apodo" maxlength="20" required placeholder="Ej. BioFan23" autocomplete="nickname"></label>
              <label class="campo"><span>Comentario</span><textarea id="comentario-texto" name="comentario" maxlength="500" rows="3" required placeholder="¿Qué te gustaría compartir?"></textarea></label>
              <button class="btn primario" id="comentario-enviar" type="submit">Publicar comentario</button>
              <p class="participacion-estado" id="comentario-estado" role="status" aria-live="polite"></p>
            </form>
            <div class="lista-comentarios" id="lista-comentarios"><p class="estado-ranking">Abrí esta sección para cargar los comentarios…</p></div>
          </div>
        </details>
        <button class="btn reporte-general-boton" id="btn-reporte-general" type="button">
          <svg class="icono-lineal" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 21V4m0 1c5-4 9 4 14 0v11c-5 4-9-4-14 0" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span>Enviar reporte privado</span>
        </button>
      </section>
    </main>`;

  document.getElementById('btn-sonido').addEventListener('click', alternarSonido);
  document.getElementById('btn-subir-imagen')?.addEventListener('click', (evento) => {
    evento.preventDefault();
    try {
      abrirEnvioImagenes({ avisar });
    } catch (error) {
      console.error('[Parcialito] No se pudo abrir el buzón de imágenes:', error);
      avisar('No se pudo abrir el buzón. Actualizá la página e intentá otra vez.');
    }
  });
  document.getElementById('btn-sp-primer')?.addEventListener('click', () => { Sonido.clic(); lanzarPrimerParcial(); });
  document.getElementById('btn-sp-ciclo')?.addEventListener('click', () => { Sonido.clic(); lanzarSegundoParcial(); });
  document.getElementById('btn-sp-mixto')?.addEventListener('click', () => { Sonido.clic(); lanzarSimulacroMixto(); });
  document.getElementById('btn-sp-temas')?.addEventListener('click', () => { Sonido.clic(); vistaEstudioBiologiaPorParcial(); });
  document.getElementById('btn-sp-banco')?.addEventListener('click', () => { Sonido.clic(); vistaBancoSegundoParcial(); });
  document.getElementById('btn-megaclase')?.addEventListener('click', () => { Sonido.clic(); lanzarMegaclase(); });
  document.getElementById('btn-ipc-temas-home')?.addEventListener('click', () => {
    Sonido.clic();
    const ipcIndex = S.indice.materias.findIndex((m) => m.id === 'ipc-2');
    if (ipcIndex >= 0) vistaMateria(ipcIndex);
    else avisar('No se encontró la materia IPC para KATH.');
  });
  document.getElementById('btn-ipc-primer-home')?.addEventListener('click', () => {
    Sonido.clic();
    const ipcIndex = S.indice.materias.findIndex((m) => m.id === 'ipc-2');
    const ipcMateria = S.indice.materias[ipcIndex];
    if (ipcMateria?.primerParcial) lanzarIPCPrimerParcial(ipcMateria, ipcIndex, vistaInicio);
    else avisar('No se encontró el banco del Primer Parcial de IPC.');
  });
  document.getElementById('btn-ipc-segundo-home')?.addEventListener('click', () => {
    Sonido.clic();
    const ipcIndex = S.indice.materias.findIndex((m) => m.id === 'ipc-2');
    const ipcMateria = S.indice.materias[ipcIndex];
    if (ipcMateria?.segundoParcial) vistaIPCSegundoParcial(ipcMateria, ipcIndex, vistaInicio);
    else avisar('No se encontró el banco del Segundo Parcial de IPC.');
  });
  document.getElementById('btn-lab')?.addEventListener('click', () => { Sonido.clic(); abrirLab({ app, volver: vistaInicio }); });
  document.getElementById('btn-instalar-app')?.addEventListener('click', instalarParcialito);
  document.getElementById('btn-errores')?.addEventListener('click', () => { Sonido.clic(); lanzarErrores(); });
  document.getElementById('btn-dificiles')?.addEventListener('click', () => { Sonido.clic(); lanzarDificiles(); });
  document.getElementById('btn-ranking')?.addEventListener('click', () => { Sonido.clic(); vistaRanking(); });
  document.getElementById('btn-jugadores')?.addEventListener('click', () => { Sonido.clic(); vistaJugadores(); });
  document.getElementById('btn-apodo')?.addEventListener('click', () => { Sonido.clic(); vistaApodo(); });
  document.getElementById('panel-comentarios')?.addEventListener('toggle', (e) => {
    if (e.target.open) cargarComentariosPublicos();
  });
  document.getElementById('form-comentario')?.addEventListener('submit', publicarComentario);
  document.getElementById('btn-reporte-general')?.addEventListener('click', () => { Sonido.clic(); abrirReporteGeneral(); });
  app.querySelectorAll('.materia').forEach((b) =>
    b.addEventListener('click', () => { Sonido.clic(); vistaMateria(Number(b.dataset.materia)); }));
  pintarTarjetasInicio();
  pintarResumenSegundoParcial();
  cargarResumenesInicio();
}

async function jsonResumenInicio(archivo) {
  if (!resumenesInicioCache.has(archivo)) {
    resumenesInicioCache.set(archivo, fetch(archivo, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`No se pudo leer ${archivo} (${r.status})`);
      return r.json();
    }));
  }
  return resumenesInicioCache.get(archivo);
}

async function contarJsonInicio(archivo, clave) {
  const json = await jsonResumenInicio(archivo);
  if (!Array.isArray(json[clave])) throw new Error(`${archivo} no contiene ${clave}.`);
  return json[clave].length;
}

async function cargarResumenesInicio() {
  const mostrar = (clave, texto) => {
    const el = app.querySelector(`[data-resumen-inicio="${clave}"]`);
    if (el) el.textContent = texto;
  };
  const materiaIPC = S.indice.materias.find((m) => m.id === 'ipc-2');
  const temasIPC = materiaIPC?.temas || [];
  const segundoIPC = materiaIPC?.segundoParcial;
  const resolver = async (clave, tarea, alFallar) => {
    try { mostrar(clave, await tarea()); }
    catch { mostrar(clave, alFallar); }
  };
  void resolver('ipc-temas', async () => {
    const conteos = await Promise.all(temasIPC.map(async (t) => {
      const json = await jsonResumenInicio(t.archivo);
      if (!Array.isArray(json.preguntas)) throw new Error(`${t.archivo} no contiene preguntas.`);
      return [json.preguntas.length, Array.isArray(json.tarjetas) ? json.tarjetas.length : 0];
    }));
    const preguntas = conteos.reduce((s, x) => s + x[0], 0);
    const tarjetas = conteos.reduce((s, x) => s + x[1], 0);
    return `${plural(temasIPC.length, 'tema', 'temas')} · ${plural(preguntas, 'pregunta', 'preguntas')} + ${tarjetas} tarjetas SM-2`;
  }, 'Temas disponibles · opción múltiple y tarjetas SM-2');
  void resolver('ipc-primer', async () => {
    const archivo = materiaIPC?.primerParcial?.archivo;
    if (!archivo) throw new Error('No se encontró el banco.');
    const n = await contarJsonInicio(archivo, 'preguntas');
    return `${plural(n, 'pregunta', 'preguntas')} · opción múltiple y explicación`;
  }, 'Banco de opción múltiple y explicación');
  void resolver('ipc-segundo', async () => {
    const autores = segundoIPC?.autores || [];
    const [preguntas, tarjetas] = await Promise.all([
      Promise.all(autores.map((a) => contarJsonInicio(a.archivo, 'preguntas'))).then((x) => x.reduce((s, n) => s + n, 0)),
      Promise.all(autores.map((a) => contarJsonInicio(a.archivo, 'tarjetas'))).then((x) => x.reduce((s, n) => s + n, 0)),
    ]);
    if (!autores.length) throw new Error('No se encontraron bloques.');
    return `${preguntas} preguntas · ${tarjetas} tarjetas · modelo de 9 puntos y guía de Kuhn`;
  }, 'Banco completo · modelo de 9 puntos y guía de Kuhn');
  void resolver('megaclase', async () => {
    const n = await contarJsonInicio('data/megaclase-marucbc-2026.json', 'preguntas');
    return `${plural(n, 'pregunta', 'preguntas')} del compilado`;
  }, 'del compilado');
  void resolver('megaclase-progreso', async () => {
    const total = await contarJsonInicio('data/megaclase-marucbc-2026.json', 'preguntas');
    const dominadas = Math.min(Object.values(progresoMCDe(MEGACLASE_TEMA_ID)).filter((dato) => dato?.dominada).length, total);
    return `Opción múltiple · ${dominadas}/${total} dominadas`;
  }, 'Opción múltiple · progreso disponible');
}

// Actualiza el cartel del banner con la cantidad real de preguntas.
async function pintarResumenSegundoParcial() {
  const caja = document.querySelector('#btn-sp-ciclo .sp-tema-texto');
  if (!caja) return;
  try {
    const pool = await cargarSegundoParcial();
    if (!caja.isConnected) return;
    const archivos = new Set(pool.map((q) => q.archivoJson).filter(Boolean)).size;
    const vistas = estado.vistasSP || {};
    const nuevas = pool.filter((q) => !vistas[q.id]).length;
    const detalle = nuevas === pool.length ? 'ninguna respondida todavía' : `${nuevas} sin responder`;
    caja.innerHTML = `<strong>Segundo parcial de Biología · banco completo</strong><small>${pool.length} preguntas disponibles · ${detalle} · las ya respondidas van al final · ${archivos} archivos</small>`;
  } catch { /* se deja el texto por defecto */ }
}

function alternarSonido() {
  estado.silencio = !estado.silencio;
  guardar();
  const b = document.getElementById('btn-sonido');
  b.textContent = estado.silencio ? '🔇' : '🔊';
  b.setAttribute('aria-label', estado.silencio ? 'Activar sonido' : 'Silenciar');
  Sonido.clic();
}
