// ==========================================================
// nucleo.js: Núcleo compartido: elementos del DOM, estado en memoria (S) y utilidades chicas que usan todas las pantallas.
// (Parte de la división de app.js; ver README.)
// ==========================================================

// Estado compartido entre pantallas. Se usa como S.indice, S.juego, S.sesionT
// (los módulos no pueden reasignar variables importadas, por eso van en un objeto).
export const S = {
  indice: null,   // contenido de data/index.json
  juego: null,    // partida en curso (null si no hay)
  sesionT: null,  // sesión de tarjetas en curso (null si no hay)
};

export const app = document.getElementById('app');

const avisoEl = document.getElementById('aviso');

export const LETRAS = ['A', 'B', 'C', 'D'];

const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF', '#FF8A5C'];

export const HITOS = [3, 5, 10, 15, 20, 30, 50];   // rachas que disparan festejo

export const MEGACLASE_TEMA_ID = 'megaclase-marucbc-2026';

export const MEGACLASE_TOTAL = 135;

export const resumenesInicioCache = new Map();

export const cache = new Map();    // idTema -> preguntas ya cargadas

export const cacheTarjetas = new Map();   // idTema -> tarjetas ya cargadas

export const dificultad = new Map();   // idPregunta -> { intentos, fallos } (datos de todos los jugadores)

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mezclar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

let temporizadorAviso = null;

export function avisar(texto) {
  avisoEl.textContent = texto;
  avisoEl.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => avisoEl.classList.remove('visible'), 1500);
}

export function vistaCargando(texto) {
  app.innerHTML = `<div class="cargando"><div class="giro" aria-hidden="true"></div><p>${esc(texto)}</p></div>`;
}

export function colorMateria(m, i) {
  return /^#[0-9a-f]{6}$/i.test(m.color || '') ? m.color : COLORES[i % COLORES.length];
}
