// ==========================================================
// juego.js: Pantalla de juego: pregunta, respuesta, racha y mascota.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';
import { rankingActivo } from './ranking.js?v=20261112-dispositivos3';
import { registrarEventoActividad } from './actividad.js?v=20261113-1';
import { actualizarEstadoVisualMC, cargarDificultad, estadoPreguntaMC, htmlEstadoPreguntaMC, registrarDominioMC, textoDificultad } from './datos.js';
import { vistaInicio } from './home.js';
import { S, app, avisar, esc, HITOS, LETRAS, mezclar } from './nucleo.js';
import { SEGUNDO_PARCIAL_TEMA_ID } from './parciales-bio.js';
import { abrirReporte, enviarIntentos } from './reportes.js';
import { vistaResultado } from './resultado.js';

export function empezarJuego(pool, meta) {
  if (!pool.length) {
    vistaInicio();
    avisar('No hay preguntas para jugar');
    return;
  }
  registrarEventoActividad('juego_inicio', { materia: meta.materiaNombre || meta.titulo, tema: meta.temaNombre, modo: meta.ranking ? 'ronda' : 'repaso', total_preguntas: pool.length });
  cargarDificultad(pool.map((q) => q.id));
  S.juego = {
    meta,
    preguntas: pool.map((q) => ({ ...q, orden: mezclar([0, 1, 2, 3]) })),
    i: 0,
    puntos: 0,
    racha: 0,
    mejorRacha: 0,
    aciertos: 0,
    falladas: [],
    intentos: [],
    respondida: false,
    idSesion: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };

  app.innerHTML = `
    <main class="pantalla ${meta.estilo === 'parcial-limpio' ? 'pantalla-segundo-limpia' : ''}">
      <div class="hud">
        <button class="icono" id="btn-salir" aria-label="Salir de la partida">✕</button>
        <div class="progreso" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${pool.length}" aria-valuenow="0"><div class="barra" id="barra"></div></div>
        <div class="puntos"><b id="puntos-n">0</b> pts</div>
        <div class="racha" id="racha" aria-label="Racha"><span class="llama" aria-hidden="true">🔥</span><span id="racha-n">0</span></div>
      </div>
      <div id="zona"></div>
      <div class="mascota-paseo" aria-hidden="true">${MASCOTA_HTML}</div>
    </main>`;

  document.getElementById('btn-salir').addEventListener('click', () => {
    if (window.confirm('¿Salir de la partida? Se pierde el progreso de esta ronda.')) {
      Sonido.clic();
      const volver = S.juego.meta.volver;
      registrarEventoActividad('juego_abandono', { materia: S.juego.meta.materiaNombre || S.juego.meta.titulo, tema: S.juego.meta.temaNombre, modo: S.juego.meta.ranking ? 'ronda' : 'repaso', total_preguntas: S.juego.preguntas.length, datos: { respondidas: S.juego.intentos.length } });
      enviarIntentos(S.juego);
      S.juego = null;
      volver();
    }
  });

  mostrarPregunta();
  window.scrollTo(0, 0);
}

function actualizarRacha(subio) {
  const caja = document.getElementById('racha');
  document.getElementById('racha-n').textContent = S.juego.racha;
  caja.classList.toggle('caliente', S.juego.racha >= 3);
  if (subio) {
    caja.classList.remove('sube');
    void caja.offsetWidth;
    caja.classList.add('sube');
  }
}

const MASCOTA_HTML = `
  <div class="mascota-camina">
    <div class="mascota-sombra"></div>
    <div class="mascota-cuerpo">
      <svg class="perro" viewBox="0 0 180 126" focusable="false" aria-hidden="true">
        <defs>
          <linearGradient id="mp-pelo" x2="0" y2="1"><stop stop-color="#fffdf7"/><stop offset="1" stop-color="#e9dfd3"/></linearGradient>
          <linearGradient id="mp-azul" x2="0" y2="1"><stop stop-color="#4169bd"/><stop offset="1" stop-color="#18366f"/></linearGradient>
        </defs>
        <g class="p-cola">
          <path d="M39 66 C20 58 18 35 30 24 C41 15 53 27 48 39 C44 48 51 53 58 54" fill="none" stroke="#8d7d86" stroke-width="13" stroke-linecap="round"/>
          <path d="M39 64 C23 56 22 36 32 27 C40 20 48 29 44 39 C41 47 49 51 56 53" fill="none" stroke="url(#mp-pelo)" stroke-width="9" stroke-linecap="round"/>
        </g>
        <path d="M39 61 C47 46 77 43 107 52 C129 59 136 78 123 96 L48 98 C34 88 31 74 39 61Z" fill="url(#mp-pelo)" stroke="#8c7b85" stroke-width="2.5"/>
        <g class="p-pata p-pata-a"><path d="M48 83 L45 108 Q44 116 53 116 L63 116 Q68 113 64 107 L67 88" fill="url(#mp-pelo)" stroke="#8c7b85" stroke-width="2.2"/></g>
        <g class="p-pata p-pata-b"><path d="M103 85 L108 108 Q110 116 120 115 L128 112 Q131 108 124 103 L120 80" fill="url(#mp-pelo)" stroke="#8c7b85" stroke-width="2.2"/></g>
        <g class="p-pata p-pata-c"><path d="M75 84 L76 108 Q76 116 86 116 L95 114 Q98 110 91 104 L91 82" fill="#f7f0e7" stroke="#8c7b85" stroke-width="2.2"/></g>
        <g class="p-cabeza">
          <path d="M105 29 C91 23 87 41 94 57 C99 68 113 65 118 52Z" fill="#d9c9c1" stroke="#8c7b85" stroke-width="2"/>
          <path d="M108 31 C99 31 98 43 105 54 C111 58 117 49 116 41Z" fill="#f0d9d7"/>
          <path d="M105 31 C108 10 133 7 150 21 C168 35 166 65 151 79 C137 93 109 82 101 63 C94 48 96 37 105 31Z" fill="url(#mp-pelo)" stroke="#8c7b85" stroke-width="2.5"/>
          <path class="p-oreja" d="M143 20 C153 10 166 20 166 34 C165 45 157 49 150 42" fill="#f3e8df" stroke="#8c7b85" stroke-width="2"/>
          <g class="p-ojos">
            <ellipse cx="128" cy="49" rx="5" ry="7" fill="#211b2d"/><ellipse cx="153" cy="48" rx="5" ry="7" fill="#211b2d"/>
            <circle cx="129.5" cy="46.5" r="1.7" fill="#fff"/><circle cx="154.5" cy="45.5" r="1.7" fill="#fff"/>
          </g>
          <ellipse cx="144" cy="65" rx="19" ry="13" fill="#fffaf2"/>
          <path d="M139 61 Q145 54 151 61 Q149 67 144 67 Q140 66 139 61Z" fill="#292333"/>
          <ellipse class="p-lengua" cx="140" cy="77" rx="4.5" ry="5.5" fill="#f08a96"/>
          <path d="M144 68 Q143 76 136 74" fill="none" stroke="#8c5963" stroke-width="2" stroke-linecap="round"/>
          <path d="M122 17 Q111 7 113 20 Q114 28 125 24 L128 20 Q140 31 145 21 Q147 9 132 16 L128 19Z" fill="#e63946" stroke="#9e1e32" stroke-width="1.8"/>
          <circle cx="128" cy="20" r="4" fill="#f7b2a7" stroke="#9e1e32" stroke-width="1"/>
        </g>
        <path d="M103 73 Q124 91 151 77 L155 85 Q127 101 100 82Z" fill="url(#mp-azul)" stroke="#18366f" stroke-width="2"/>
        <g class="p-medalla">
          <path d="M130 91 L130 99" stroke="#d8a92e" stroke-width="3"/>
          <circle cx="130" cy="105" r="10" fill="#f5c84b" stroke="#8b5c19" stroke-width="2"/>
          <text x="130" y="109" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="900" fill="#32234d">T</text>
        </g>
        <g transform="translate(152 4)"><path class="p-corazon p-c1" d="M0 4 C-8 -2 -4 -9 0 -4 C4 -9 8 -2 0 4Z" fill="#ff5d7a"/></g>
        <g transform="translate(126 0)"><path class="p-corazon p-c2" d="M0 4 C-8 -2 -4 -9 0 -4 C4 -9 8 -2 0 4Z" fill="#ff8fa3"/></g>
        <g transform="translate(166 14)"><path class="p-corazon p-c3" d="M0 4 C-8 -2 -4 -9 0 -4 C4 -9 8 -2 0 4Z" fill="#ff5d7a"/></g>
        <g transform="translate(162 34)"><path class="p-gota" d="M0 -6 C4 0 5 4 0 6 C-5 4 -4 0 0 -6Z" fill="#7fc4ff" stroke="#3b8fd6" stroke-width="1"/></g>
      </svg>
    </div>
  </div>`;

function reaccionMascota(acerto, hito) {
  const m = document.querySelector('.mascota-paseo');
  if (!m) return;
  m.dataset.estado = acerto ? 'acierto' : 'error';
  if (hito) m.dataset.hito = '1';
}

function mostrarPregunta() {
  const j = S.juego;
  const q = j.preguntas[j.i];
  registrarEventoActividad('pregunta', { materia: j.meta.materiaNombre || j.meta.titulo, tema: q.tema || j.meta.temaNombre, modo: j.meta.ranking ? 'ronda' : 'repaso', pregunta_id: q.id, pregunta: q.texto, numero_pregunta: j.i + 1, total_preguntas: j.preguntas.length });
  j.respondida = false;

  const zona = document.getElementById('zona');
  const mascota = document.querySelector('.mascota-paseo');
  const pantalla = zona?.closest('.pantalla');
  // Mantener viva la misma instancia del perrito mientras se reconstruye el contenido de cada pregunta.
  if (mascota && pantalla && mascota.parentElement !== pantalla) pantalla.appendChild(mascota);
  // La reacción de la respuesta anterior termina aquí; el paseo principal no se reinicia.
  mascota?.removeAttribute('data-estado');
  mascota?.removeAttribute('data-hito');

  document.getElementById('barra').style.width = `${(j.i / j.preguntas.length) * 100}%`;

  const estadoMC = estadoPreguntaMC(q);
  const claseEstadoMC = estadoMC ? (estadoMC.dominada ? 'pregunta-dominada' : 'pregunta-practica') : '';
  zona.innerHTML = `
    <p class="contador">Pregunta ${j.i + 1} de ${j.preguntas.length}</p>
    <div class="tarjeta-pregunta ${claseEstadoMC}" id="tarjeta">
      ${htmlEstadoPreguntaMC(q)}
      <p class="tema-etq">${esc(q.tema)}</p>
      <h2 class="pregunta">${esc(q.texto)}</h2>
      ${q.imagen ? `
        <figure class="q-figura">
          <a href="${esc(q.imagen)}" target="_blank" rel="noopener" aria-label="Abrir la imagen en tamaño completo">
            <img src="${esc(q.imagen)}" alt="${esc(q.imagenAlt)}" loading="eager" decoding="async">
          </a>
        </figure>` : ''}
      ${rankingActivo() && j.meta.estilo !== 'parcial-limpio' ? `
        <div class="pie-tarjeta">
          <button class="reportar" id="btn-reportar" type="button" ${estado.reportadas?.[q.id] ? 'disabled' : ''}>
            ${estado.reportadas?.[q.id] ? '✓ Reportada' : '⚑ Reportar pregunta'}
          </button>
        </div>` : ''}
    </div>
    <div class="opciones" id="opciones" role="group" aria-label="Opciones de respuesta">
      ${q.orden.map((oi, pos) => `
        <button class="opcion" data-pos="${pos}">
          <span class="letra" aria-hidden="true">${LETRAS[pos]}</span>
          <span>${esc(q.opciones[oi])}</span>
        </button>`).join('')}
    </div>
    <div class="feedback" id="feedback" aria-live="polite"></div>
    <div class="acciones"><button class="btn primario" id="btn-sig" hidden></button></div>
    ${rankingActivo() && j.meta.estilo === 'parcial-limpio' ? `
      <div class="pie-tarjeta pie-tarjeta-abajo">
        <button class="reportar" id="btn-reportar" type="button" ${estado.reportadas?.[q.id] ? 'disabled' : ''}>
          ${estado.reportadas?.[q.id] ? '✓ Reportada' : '⚑ Reportar pregunta'}
        </button>
      </div>` : ''}
    ${j.meta.estilo === 'parcial-limpio' ? '' : '<p class="ayuda-teclas">Teclado: 1 a 4 (o A a D) para responder, Enter para seguir.</p>'}`;

  // Volvemos a colocar el mismo nodo debajo de las opciones: sus animaciones CSS siguen en curso.
  const feedbackActual = document.getElementById('feedback');
  if (mascota && feedbackActual) zona.insertBefore(mascota, feedbackActual);

  document.querySelectorAll('.opcion').forEach((b) =>
    b.addEventListener('click', () => responder(Number(b.dataset.pos))));
  document.getElementById('btn-sig').addEventListener('click', siguiente);
  document.getElementById('btn-reportar')?.addEventListener('click', (e) => abrirReporte(q, e.currentTarget));
  document.querySelector('.q-figura img')?.addEventListener('error', (e) => {
    e.currentTarget.closest('.q-figura').innerHTML = '<p class="q-figura-error">No se pudo cargar la imagen.</p>';
  });
}

function detalleDidacticoHTML(q) {
  const esSegundoParcialIPC = q.temaId === SEGUNDO_PARCIAL_TEMA_ID;
  const refs = esSegundoParcialIPC ? [] : Object.entries(q.refutacionIncorrectas || {});
  const expansion = q.expansionEstudio || [];
  if (!refs.length && !expansion.length) return '';
  return `
    <details class="detalle-didactico">
      <summary>${refs.length ? 'Analizar distractores y ampliar estudio' : 'Ampliar estudio'}</summary>
      ${refs.length ? `<section><h4>Por qué son incorrectas las otras opciones</h4><ul>${refs.map(([letra, texto]) => `<li><b>${esc(letra)}.</b> ${esc(texto)}</li>`).join('')}</ul></section>` : ''}
      ${expansion.length ? `<section><h4>Expansión de estudio</h4>${expansion.map((x) => `<div class="detalle-expansion"><strong>${esc(x.pregunta)}</strong><p>${esc(x.respuesta)}</p></div>`).join('')}</section>` : ''}
    </details>`;
}

export function responder(pos) {
  const j = S.juego;
  if (!j || j.respondida) return;
  j.respondida = true;

  const q = j.preguntas[j.i];
  const modoLimpio = j.meta.estilo === 'parcial-limpio';
  const acerto = q.orden[pos] === q.correcta;
  registrarEventoActividad('respuesta', { materia: j.meta.materiaNombre || j.meta.titulo, tema: q.tema || j.meta.temaNombre, modo: j.meta.ranking ? 'ronda' : 'repaso', pregunta_id: q.id, pregunta: q.texto, seleccion: q.opciones[q.orden[pos]], respuesta_correcta: q.opciones[q.correcta], acierto: acerto, numero_pregunta: j.i + 1, total_preguntas: j.preguntas.length });
  registrarDominioMC(q, acerto, j.idSesion);
  const feedback = document.getElementById('feedback');

  j.intentos.push({
    pregunta_id: q.id,
    tema_id: q.temaId,
    pregunta: q.texto.slice(0, 160),
    acierto: acerto,
    modo: j.meta.ranking ? 'ronda' : 'repaso',
  });

  // Segundo parcial: recordamos qué preguntas ya respondiste para mandarlas al final en la próxima partida.
  if (j.meta.temaId === SEGUNDO_PARCIAL_TEMA_ID) {
    (estado.vistasSP ||= {})[q.id] = acerto ? 2 : 1;
  }

  document.getElementById('opciones').classList.add('bloqueadas');
  document.querySelectorAll('.opcion').forEach((b, p) => {
    if (q.orden[p] === q.correcta) b.classList.add('ok');
    else if (p === pos) b.classList.add('mal');
    else b.classList.add('apagada');
  });

  let veredicto;
  if (acerto) {
    j.aciertos++;
    delete estado.errores[q.id];
    if (modoLimpio) {
      veredicto = '<p class="veredicto ok">¡Correcto!</p>';
    } else {
      j.racha++;
      j.mejorRacha = Math.max(j.mejorRacha, j.racha);
      const ganado = 100 + Math.min(j.racha - 1, 10) * 10;
      j.puntos += ganado;
      Sonido.acierto(j.racha);
      actualizarRacha(true);

      if (HITOS.includes(j.racha)) {
        setTimeout(() => {
          Sonido.hito();
          avisar(`¡Racha de ${j.racha}!`);
          lanzarConfeti(j.racha >= 10 ? 140 : 70);
        }, 250);
      }
      veredicto = `<p class="veredicto ok">¡Correcto! +${ganado}</p>`;
    }
  } else {
    if (!modoLimpio) {
      const perdida = j.racha;
      j.racha = 0;
      Sonido.error(perdida >= 3);
      actualizarRacha(false);
      document.getElementById('tarjeta').classList.add('tiembla');
      veredicto = `<p class="veredicto mal">Incorrecto${perdida >= 3 ? `: se corta la racha de ${perdida}` : ''}</p>`;
    } else {
      veredicto = '<p class="veredicto mal">Repasemos esta respuesta.</p>';
    }
    j.falladas.push(q);
    estado.errores[q.id] = 1;
  }
  reaccionMascota(acerto, acerto && !modoLimpio && HITOS.includes(j.racha));
  actualizarEstadoVisualMC(q);
  guardar();

  feedback.innerHTML = veredicto
    + (q.explicacion ? `<p class="explicacion">${esc(q.explicacion)}</p>` : '')
    + detalleDidacticoHTML(q)
    + (modoLimpio ? '' : textoDificultad(q.id));

  const ultima = j.i === j.preguntas.length - 1;
  document.getElementById('barra').style.width = `${((j.i + 1) / j.preguntas.length) * 100}%`;
  document.querySelector('.progreso').setAttribute('aria-valuenow', String(j.i + 1));
  const btn = document.getElementById('btn-sig');
  btn.textContent = ultima ? 'Ver resultado' : 'Siguiente';
  btn.hidden = false;
  btn.focus({ preventScroll: true });
  btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  document.getElementById('puntos-n').textContent = j.puntos;
}

export function siguiente() {
  const j = S.juego;
  if (!j || !j.respondida) return;
  j.respondida = false;
  Sonido.clic();
  j.i++;
  if (j.i >= j.preguntas.length) vistaResultado();
  else mostrarPregunta();
}
