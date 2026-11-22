// ==========================================================
// teclado.js: Atajos de teclado y activación del sonido.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { Sonido } from './sonido.js?v=dev';
import { valorarTarjeta, voltearTarjeta } from './anki.js';
import { responder, siguiente } from './juego.js';
import { S } from './nucleo.js';

document.addEventListener('keydown', (e) => {
  if ((!S.juego && !S.sesionT) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.target.closest?.('dialog, input, textarea, select')) return;
  const k = e.key.toLowerCase();
  if (S.sesionT) {
    if (k === ' ' || k === 'enter') { e.preventDefault(); if (S.sesionT.volteada) valorarTarjeta(3); else voltearTarjeta(); }
    else if (S.sesionT.volteada && ['1', '2', '3', '4'].includes(k)) valorarTarjeta(Number(k));
    return;
  }
  if (!S.juego.respondida) {
    const pos = ['1', '2', '3', '4'].indexOf(k);
    const pos2 = ['a', 'b', 'c', 'd'].indexOf(k);
    if (pos >= 0) responder(pos);
    else if (pos2 >= 0) responder(pos2);
  } else if (k === 'enter' || k === ' ') {
    e.preventDefault();
    siguiente();
  }
});

document.addEventListener('pointerdown', () => Sonido.iniciar(), { once: true });

document.addEventListener('keydown', () => Sonido.iniciar(), { once: true });
