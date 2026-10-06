// ==========================================================
// sonido.js: efectos sintetizados con WebAudio.
// No usa archivos de audio: todo se genera en el navegador.
// ==========================================================

import { estado } from './store.js';

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

  hito() {
    [0, 4, 7, 12, 16].forEach((p, i) => tono(nota(p), i * 0.07, 0.22, 'square', 0.08));
  },

  fin(bueno) {
    const melodia = bueno ? [0, 4, 7, 12, 7, 12] : [7, 3, 0];
    melodia.forEach((p, i) => tono(nota(p), i * 0.13, 0.28, bueno ? 'square' : 'triangle', bueno ? 0.08 : 0.14));
  },
};
