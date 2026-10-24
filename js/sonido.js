// ==========================================================
// sonido.js: efectos sintetizados con WebAudio.
// No usa archivos de audio: todo se genera en el navegador.
// ==========================================================

import { estado } from './store.js?v=dev';

let ctx = null;

// Escala pentatónica (en semitonos): cada acierto seguido suena más agudo
const ESCALA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const DO5 = 523.25;
const nota = (semitonos) => DO5 * Math.pow(2, semitonos / 12);

function tono(freq, inicio, duracion, tipo = 'sine', volumen = 0.16, hasta = null) {
  if (estado.silencio || !ctx) return;
  const t0 = ctx.currentTime + inicio;
  const osc = ctx.createOscillator();
  const gan = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, t0);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t0 + duracion);
  gan.gain.setValueAtTime(0.0001, t0);
  gan.gain.exponentialRampToValueAtTime(volumen, t0 + 0.012);
  gan.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  osc.connect(gan).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duracion + 0.03);
}

// Soplido de aire: ruido filtrado cuyo tono sube o baja (el "fiu" de dar vuelta una carta)
function soplido(inicio, duracion, desde, hasta, volumen = 0.14) {
  if (estado.silencio || !ctx) return;
  const t0 = ctx.currentTime + inicio;
  const n = Math.max(1, Math.ceil(ctx.sampleRate * duracion));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const datos = buf.getChannelData(0);
  for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
  const fuente = ctx.createBufferSource();
  fuente.buffer = buf;
  const filtro = ctx.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.Q.value = 1.2;
  filtro.frequency.setValueAtTime(desde, t0);
  filtro.frequency.exponentialRampToValueAtTime(hasta, t0 + duracion);
  const gan = ctx.createGain();
  gan.gain.setValueAtTime(0.0001, t0);
  gan.gain.exponentialRampToValueAtTime(volumen, t0 + duracion * 0.35);
  gan.gain.exponentialRampToValueAtTime(0.0001, t0 + duracion);
  fuente.connect(filtro).connect(gan).connect(ctx.destination);
  fuente.start(t0);
  fuente.stop(t0 + duracion + 0.02);
}

export const Sonido = {
  // Los navegadores exigen un gesto del usuario antes de reproducir audio
  iniciar() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  },

  clic() {
    tono(660, 0, 0.06, 'square', 0.05);
  },

  acierto(racha) {
    const paso = ESCALA[Math.min(Math.max(racha, 1) - 1, ESCALA.length - 1)];
    tono(nota(paso), 0, 0.14, 'triangle', 0.2);
    tono(nota(paso + 7), 0.09, 0.22, 'triangle', 0.16);
  },

  error(perdioRacha) {
    tono(220, 0, 0.28, 'sawtooth', 0.12, 110);
    if (perdioRacha) tono(165, 0.2, 0.4, 'sawtooth', 0.1, 70);
  },

  // Dar vuelta una tarjeta: soplido que sube + golpecito suave cuando "aterriza" (coincide con el rebote de la animación)
  voltear() {
    soplido(0, 0.34, 450, 2800, 0.34);
    tono(190, 0.5, 0.1, 'sine', 0.12, 95);
    tono(1500, 0.52, 0.04, 'sine', 0.04);
  },

  // Valorar una tarjeta: 1 otra vez, 2 difícil, 3 bien, 4 fácil
  valorar(r) {
    if (r === 1) {
      tono(330, 0, 0.12, 'triangle', 0.1, 220);
      tono(247, 0.09, 0.2, 'triangle', 0.08, 185);
    } else if (r === 2) {
      tono(392, 0, 0.14, 'triangle', 0.1);
      tono(370, 0.08, 0.16, 'triangle', 0.07);
    } else if (r === 3) {
      tono(nota(0), 0, 0.14, 'triangle', 0.18);
      tono(nota(7), 0.09, 0.22, 'triangle', 0.14);
    } else {
      [0, 4, 7].forEach((p, i) => tono(nota(p), i * 0.07, 0.16, 'triangle', 0.14));
      tono(nota(12), 0.22, 0.3, 'sine', 0.12);
    }
  },

  hito() {
    [0, 4, 7, 12, 16].forEach((p, i) => tono(nota(p), i * 0.07, 0.22, 'square', 0.08));
  },

  fin(bueno) {
    const melodia = bueno ? [0, 4, 7, 12, 7, 12] : [7, 3, 0];
    melodia.forEach((p, i) => tono(nota(p), i * 0.13, 0.28, bueno ? 'square' : 'triangle', bueno ? 0.08 : 0.14));
  },
};
