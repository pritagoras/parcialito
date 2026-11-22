// ==========================================================
// visitas.js: Visitas: quién entra a la página.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado } from './store.js?v=20261112-1';
import { rankingActivo, registrarVisita } from './ranking.js?v=20261112-dispositivos3';
import { idDispositivo, infoDispositivo, perfilDispositivo } from './dispositivo.js?v=20261112-dispositivos3';

// Identificador anónimo y estable de este navegador (para reconocer a la misma persona entre visitas).
function idVisitante() {
  try {
    let id = localStorage.getItem('parcialito_visitante');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);
      localStorage.setItem('parcialito_visitante', id);
    }
    return id;
  } catch (_) {
    return null;   // sin almacenamiento: no se puede reconocer al visitante
  }
}

// evento: 'entrada' (abrió la página) o 'apodo' (eligió o cambió su apodo: vincula el ID con el nombre).
export async function anotarVisita(evento) {
  if (!rankingActivo()) return;
  const visitante = idVisitante();
  if (!visitante) return;
  let perfil = {};
  try {
    perfil = await perfilDispositivo();
  } catch (_) {
    // Si el navegador no expone el modelo, se registra la visita igualmente.
  }
  registrarVisita({
    visitante,
    dispositivo_id: idDispositivo(),
    apodo: estado.apodo || null,
    evento,
    ...infoDispositivo(),
    fabricante: perfil.fabricante || null,
    modelo: perfil.modelo || null,
  }).catch(() => {});
}

// Una "entrada" por sesión del navegador (recargar no cuenta como visita nueva).
export function anotarEntrada() {
  try {
    if (sessionStorage.getItem('parcialito_entrada')) return;
    sessionStorage.setItem('parcialito_entrada', '1');
  } catch (_) { /* sin sessionStorage: se registra igual */ }
  anotarVisita('entrada');
}
