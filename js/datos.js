// ==========================================================
// datos.js: Carga de temas y preguntas, dominio por pregunta/tema y dificultad real.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, hash } from './store.js?v=20261112-1';
import { rankingActivo, dificultadDe } from './ranking.js?v=20261112-dispositivos3';
import { normalizarTarjetas } from './anki.js';
import { cache, cacheTarjetas, dificultad, LETRAS } from './nucleo.js';

function urlImagen(valor) {
  const u = String(valor || '').trim();
  return /^https:\/\/\S+$/i.test(u) || /^(?!\/)[\w./\%-]+$/.test(u) ? u : '';
}

export function normalizar(json, tema, materia) {
  const salida = [];
  (json.preguntas || []).forEach((p, n) => {
    const textoPregunta = String(p.enunciado ?? p.pregunta ?? '').trim();
    const ops = Array.isArray(p.opciones)
      ? p.opciones.map((op) => String(typeof op === 'object' && op !== null ? (op.texto ?? op.text ?? '') : op))
      : [];
    const clave = String(p.respuestaCorrecta ?? p.correcta ?? '').trim().toUpperCase();
    const idx = LETRAS.indexOf(clave);
    if (!textoPregunta || ops.length !== 4 || ops.some((op) => !op) || idx < 0) {
      console.warn(`[Repaso] Pregunta ${n + 1} de "${tema.id}" descartada: formato inválido.`);
      return;
    }
    const expansion = Array.isArray(p.expansionEstudio)
      ? p.expansionEstudio
          .filter((x) => x && (x.pregunta || x.respuesta))
          .map((x) => ({ pregunta: String(x.pregunta || ''), respuesta: String(x.respuesta || '') }))
      : [];
    salida.push({
      id: p.id || hash(textoPregunta),
      texto: textoPregunta,
      opciones: ops,
      correcta: idx,
      explicacion: String(p.justificacionCorrecta ?? p.explicacion ?? ''),
      refutacionIncorrectas: p.refutacionIncorrectas && typeof p.refutacionIncorrectas === 'object'
        ? p.refutacionIncorrectas
        : {},
      expansionEstudio: expansion,
      autor: String(p.autor || ''),
      subtema: String(p.subtema || ''),
      imagen: urlImagen(p.imagen),
      imagenAlt: p.imagen_alt ? String(p.imagen_alt) : '',
      tema: p.subtema ? `${p.autor ? p.autor + ' · ' : ''}${p.subtema}` : tema.nombre,
      temaId: tema.id,
      materia: materia.nombre,
      archivoJson: tema.archivo || null,
      numeroPregunta: n + 1,
    });
  });
  return salida;
}

export async function cargarTema(tema, materia) {
  if (cache.has(tema.id)) return cache.get(tema.id);
  const r = await fetch(tema.archivo, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`No se pudo leer ${tema.archivo} (${r.status})`);
  const json = await r.json();
  const preguntas = normalizar(json, tema, materia);
  cacheTarjetas.set(tema.id, normalizarTarjetas(json, tema, materia));
  const progreso = progresoMCDe(tema.id);
  const vigentes = new Set(preguntas.map((q) => q.id));
  for (const id of Object.keys(progreso)) {
    if (!vigentes.has(id)) delete progreso[id];
  }
  cache.set(tema.id, preguntas);
  return preguntas;
}

export function progresoMCDe(temaId) {
  estado.dominioMC ||= {};
  return (estado.dominioMC[temaId] ||= {});
}

function datoDominioMC(q) {
  return progresoMCDe(q.temaId)[q.id] || null;
}

export function estadoPreguntaMC(q) {
  const dato = datoDominioMC(q);
  if (!dato || !dato.intentos) return null;
  return {
    dominada: !!dato.dominada,
    racha: Math.min(3, Number(dato.racha) || 0),
    intentos: Number(dato.intentos) || 0,
  };
}

export function registrarDominioMC(q, acerto, idSesion) {
  const progreso = progresoMCDe(q.temaId);
  const dato = progreso[q.id] || { intentos: 0, aciertos: 0, errores: 0, racha: 0, dominada: false };
  // Una pregunta suma como máximo una vez por partida: evita repetirla para acelerar el dominio.
  if (dato.ultimaSesion === idSesion) return;
  dato.intentos++;
  if (acerto) {
    dato.aciertos++;
    dato.racha = Math.min(3, (Number(dato.racha) || 0) + 1);
    // El dominio es permanente: una vez alcanzado, los errores posteriores no lo quitan.
    dato.dominada = !!dato.dominada || dato.racha >= 3;
  } else {
    dato.errores++;
    dato.racha = 0;
    // Si todavía no estaba dominada, sigue en práctica. Si ya lo estaba, conserva el dominio.
  }
  dato.ultimaSesion = idSesion;
  progreso[q.id] = dato;
}

export function htmlEstadoPreguntaMC(q) {
  const estadoMC = estadoPreguntaMC(q);
  if (!estadoMC) return '';
  return estadoMC.dominada
    ? '<div class="estado-pregunta estado-pregunta-dominada"><span class="estado-punto"></span><span>Dominada</span></div>'
    : `<div class="estado-pregunta estado-pregunta-practica"><span class="estado-punto"></span><span>En práctica</span><small>${estadoMC.racha}/3 aciertos</small></div>`;
}

export function actualizarEstadoVisualMC(q) {
  const tarjeta = document.getElementById('tarjeta');
  if (!tarjeta) return;
  tarjeta.classList.remove('pregunta-dominada', 'pregunta-practica');
  const anterior = tarjeta.querySelector('.estado-pregunta');
  anterior?.remove();
  const estadoMC = estadoPreguntaMC(q);
  if (!estadoMC) return;
  tarjeta.classList.add(estadoMC.dominada ? 'pregunta-dominada' : 'pregunta-practica');
  tarjeta.insertAdjacentHTML('afterbegin', htmlEstadoPreguntaMC(q));
}

export function dominadasDe(tema) {
  return Object.values(progresoMCDe(tema.id)).filter((dato) => dato?.dominada).length;
}

export function resumenDominioTema(tema) {
  const preguntas = cache.get(tema.id);
  const total = preguntas ? preguntas.length : Math.max(0, Number(tema.preguntas) || 0);
  const dominadas = preguntas
    ? preguntas.filter((q) => estadoPreguntaMC(q)?.dominada).length
    : Math.min(total, dominadasDe(tema));
  return {
    total,
    dominadas,
    pendientes: Math.max(0, total - dominadas),
    porcentaje: total ? Math.round((dominadas / total) * 100) : 0,
    completo: total > 0 && dominadas >= total,
  };
}

// Un tema "tiene contenido" si ofrece preguntas o tarjetas. Los que solo traen crucigrama u otra
// actividad se juegan desde sus propios botones y no cuentan como tema de trivia.
export const tieneContenido = (t) => (t.preguntas || 0) > 0 || (t.tarjetas || 0) > 0;

export const temasConContenido = (materia) => materia.temas.filter(tieneContenido);

export function dominio(materia) {
  // El promedio se hace solo sobre temas con preguntas: los de crucigrama o tarjetas no tienen
  // precisión y bajaban el porcentaje de la materia.
  const temas = materia.temas.filter((t) => (t.preguntas || 0) > 0);
  if (!temas.length) return 0;
  const suma = temas.reduce((s, t) => s + (estado.mejores[t.id]?.precision || 0), 0);
  return Math.round(suma / temas.length);
}

export const MIN_DATOS = 10;

export function cargarDificultad(ids) {
  if (!rankingActivo()) return;
  const faltan = [...new Set(ids)].filter((id) => !dificultad.has(id)).slice(0, 500);
  if (!faltan.length) return;
  dificultadDe(faltan).then((filas) => {
    for (const f of filas) dificultad.set(f.pregunta_id, { intentos: Number(f.intentos), fallos: Number(f.fallos) });
  }).catch(() => {});
}

export function textoDificultad(id) {
  const d = dificultad.get(id);
  if (!d || d.intentos < MIN_DATOS) return '';
  const pct = Math.round((d.fallos / d.intentos) * 100);
  const etiqueta = pct >= 60 ? 'Difícil' : pct <= 20 ? 'Fácil' : 'Intermedia';
  return `<p class="dato-dificultad">📊 <b>${etiqueta}</b>: el ${pct}% de los jugadores la falla (${d.intentos} respuestas).</p>`;
}
