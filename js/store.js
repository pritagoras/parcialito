// ==========================================================
// store.js: guarda en el navegador (localStorage) lo que
// querés conservar entre sesiones: mejores resultados,
// preguntas falladas y si el sonido está apagado.
// ==========================================================

const CLAVE = 'repaso:v1';

const base = {
  silencio: false,   // true = sonido apagado
  cantidad: 10,      // preguntas por partida (0 = todas)
  mejores: {},       // { idTema: { precision, puntos, racha } }
  errores: {},       // { idPregunta: 1 }
};

let guardado = {};
try {
  guardado = JSON.parse(localStorage.getItem(CLAVE)) || {};
} catch {
  guardado = {};
}

// Objeto compartido: se modifica directamente y después se llama a guardar()
export const estado = { ...base, ...guardado };

export function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Si el navegador bloquea el almacenamiento, la app sigue andando sin guardar.
  }
}

// Hash corto y estable de un texto: sirve como ID de pregunta
// para recordar cuáles fallaste aunque reordenes el archivo.
export function hash(texto) {
  const t = String(texto).trim().toLowerCase().replace(/\s+/g, ' ');
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
