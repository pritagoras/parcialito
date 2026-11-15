// ==========================================================
// Formalización (IPC): práctica de lenguaje simbólico.
// Se abre desde la materia IPC.
//
// Modos:
//   1. Formalización de enunciados (traducir oraciones al lenguaje simbólico)
//   2. Código y formalización de argumentos (premisas ⊢ conclusión)
//   3. Estructura de fórmulas (conector principal, antecedente, consecuente)
//   4. Práctica mixta
//
// Las opciones incorrectas NO se escriben a mano: se generan alterando la
// respuesta correcta (conversa, otro conector, otro alcance, negación de más o
// de menos) y se descartan con tablas de verdad las que sean equivalentes a la
// correcta, así nunca hay dos respuestas válidas.
// Notación: ~ negación · • conjunción · ∨ disyunción · → condicional · ↔ bicondicional
// ==========================================================

import { Sonido } from './sonido.js?v=dev';

export const TITULO = 'Formalización: lenguaje simbólico';

const CLAVE_PROGRESO = 'parcialito-ipc-fm-progreso';
const LARGO_RONDA = 10;

// ---------- Lógica proposicional mínima ----------
const BINARIOS = ['•', '∨', '→', '↔'];
const NOMBRE_CONECTOR = { '•': 'conjunción', '∨': 'disyunción', '→': 'condicional', '↔': 'bicondicional', '~': 'negación' };

const cierreParentesis = (s) => {
  let d = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') d++;
    else if (s[i] === ')') { d--; if (d === 0) return i; }
  }
  return -1;
};
const sinParentesisExternos = (s) => {
  s = s.trim();
  while (s[0] === '(' && cierreParentesis(s) === s.length - 1) s = s.slice(1, -1).trim();
  return s;
};

export function parsear(texto) {
  const s = sinParentesisExternos(String(texto).replace(/¬/g, '~'));
  let d = 0;
  const ops = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') d++;
    else if (c === ')') d--;
    else if (d === 0 && BINARIOS.includes(c)) ops.push({ i, c });
  }
  if (ops.length) {
    const distintos = new Set(ops.map(o => o.c));
    if (distintos.size > 1 || (ops.length > 1 && !'•∨'.includes(ops[0].c))) throw new Error('Fórmula ambigua sin paréntesis: ' + texto);
    const ult = ops[ops.length - 1];
    return { op: ult.c, l: parsear(s.slice(0, ult.i)), r: parsear(s.slice(ult.i + 1)) };
  }
  if (s[0] === '~') return { op: '~', x: parsear(s.slice(1)) };
  if (!/^[a-z]$/.test(s)) throw new Error('Átomo inválido: "' + s + '" en ' + texto);
  return { op: 'a', v: s };
}

const esBinario = (n) => BINARIOS.includes(n.op);

export function imprimir(n, raiz = true) {
  if (n.op === 'a') return n.v;
  if (n.op === '~') return '~' + (n.x.op === 'a' || n.x.op === '~' ? imprimir(n.x, false) : '(' + imprimir(n.x, true) + ')');
  const t = imprimir(n.l, false) + ' ' + n.op + ' ' + imprimir(n.r, false);
  return raiz ? t : '(' + t + ')';
}

const evaluar = (n, v) => n.op === 'a' ? v[n.v]
  : n.op === '~' ? !evaluar(n.x, v)
  : n.op === '•' ? evaluar(n.l, v) && evaluar(n.r, v)
  : n.op === '∨' ? evaluar(n.l, v) || evaluar(n.r, v)
  : n.op === '→' ? !evaluar(n.l, v) || evaluar(n.r, v)
  : evaluar(n.l, v) === evaluar(n.r, v);

const atomosDe = (n, s = new Set()) => {
  if (n.op === 'a') s.add(n.v);
  else if (n.op === '~') atomosDe(n.x, s);
  else { atomosDe(n.l, s); atomosDe(n.r, s); }
  return s;
};

function asignaciones(letras) {
  const out = [];
  for (let m = 0; m < (1 << letras.length); m++) {
    const v = {};
    letras.forEach((l, i) => { v[l] = !!(m & (1 << i)); });
    out.push(v);
  }
  return out;
}

export function equivalentes(a, b) {
  const letras = [...new Set([...atomosDe(a), ...atomosDe(b)])];
  return asignaciones(letras).every(v => evaluar(a, v) === evaluar(b, v));
}

export function esValido(premisas, conclusion) {
  const letras = [...new Set([...premisas.flatMap(p => [...atomosDe(p)]), ...atomosDe(conclusion)])];
  return asignaciones(letras).every(v => !premisas.every(p => evaluar(p, v)) || evaluar(conclusion, v));
}

// ---------- Generación de opciones incorrectas ----------
// Todas las variantes "con un error típico" de una fórmula.
function mutaciones(raiz) {
  const out = [];
  const visitar = (nodo, rearmar) => {
    if (nodo.op === 'a') {
      out.push(rearmar({ op: '~', x: nodo }));                       // negación de más
    } else if (nodo.op === '~') {
      out.push(rearmar(nodo.x));                                      // negación de menos
      if (esBinario(nodo.x)) {                                        // ~(a o b) → ~a o b (alcance mal puesto)
        out.push(rearmar({ op: nodo.x.op, l: { op: '~', x: nodo.x.l }, r: nodo.x.r }));
        visitar(nodo.x, x => rearmar({ op: '~', x }));
      }
    } else {
      BINARIOS.filter(o => o !== nodo.op).forEach(o => out.push(rearmar({ op: o, l: nodo.l, r: nodo.r })));   // otro conector
      if (nodo.op === '→') out.push(rearmar({ op: '→', l: nodo.r, r: nodo.l }));                              // conversa
      if (esBinario(nodo.l)) out.push(rearmar({ op: nodo.l.op, l: nodo.l.l, r: { op: nodo.op, l: nodo.l.r, r: nodo.r } }));   // otro alcance
      if (esBinario(nodo.r)) out.push(rearmar({ op: nodo.r.op, l: { op: nodo.op, l: nodo.l, r: nodo.r.l }, r: nodo.r.r }));
      visitar(nodo.l, x => rearmar({ op: nodo.op, l: x, r: nodo.r }));
      visitar(nodo.r, x => rearmar({ op: nodo.op, l: nodo.l, r: x }));
    }
  };
  visitar(raiz, x => x);
  return out;
}

const mezclar = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const muestra = (arr, k) => mezclar(arr).slice(0, k);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function distractoresFormula(correcta, cantidad = 3) {
  const base = typeof correcta === 'string' ? parsear(correcta) : correcta;
  const textoBase = imprimir(base);
  const admitidos = new Map();
  const admitir = (arbol, nivel) => {
    const t = imprimir(arbol);
    if (t === textoBase || admitidos.has(t) || equivalentes(base, arbol)) return;
    admitidos.set(t, nivel);
  };
  const nivel1 = mutaciones(base);
  nivel1.forEach(m => admitir(m, 1));
  if (admitidos.size < cantidad) nivel1.forEach(m => mutaciones(m).forEach(m2 => admitir(m2, 2)));
  const porNivel = (n) => mezclar([...admitidos].filter(([, v]) => v === n).map(([t]) => t));
  return [...porNivel(1), ...porNivel(2)].slice(0, cantidad);
}

const textoArgumento = (fs) => fs.slice(0, -1).map(f => imprimir(f)).join('; ') + ' ⊢ ' + imprimir(fs[fs.length - 1]);

export function distractoresArgumento(base, cantidad = 3) {
  const candidatos = new Map();
  base.forEach((f, i) => mutaciones(f).forEach(m => {
    if (equivalentes(f, m)) return;
    const t = textoArgumento(base.map((x, j) => (j === i ? m : x)));
    if (!candidatos.has(t)) candidatos.set(t, i);
  }));
  const porPosicion = {};
  mezclar([...candidatos.keys()]).forEach(t => { (porPosicion[candidatos.get(t)] ||= []).push(t); });
  const colas = mezclar(Object.values(porPosicion));
  const elegidos = [];
  while (elegidos.length < cantidad && colas.some(c => c.length)) {
    colas.forEach(c => { if (c.length && elegidos.length < cantidad) elegidos.push(c.shift()); });
  }
  return elegidos;
}

// ==========================================================
// Banco 1: enunciados
// ==========================================================
export const BANCO_ENUNCIADOS = [
  { texto: 'Si una hipótesis es contrastable, entonces formula una relación que puede ponerse a prueba y sus consecuencias pueden observarse.',
    codigo: { p: 'la hipótesis es contrastable', q: 'formula una relación comprobable', r: 'sus consecuencias pueden observarse' },
    correcta: 'p → (q • r)',
    explicacion: 'El “si… entonces” abre la condicional. Las dos afirmaciones unidas por “y” forman el consecuente completo: p → (q • r).' },
  { texto: 'O bien una explicación es causal, o bien es descriptiva y se limita a ordenar los hechos.',
    codigo: { p: 'la explicación es causal', q: 'es descriptiva', r: 'se limita a ordenar los hechos' },
    correcta: 'p ∨ (q • r)',
    explicacion: 'La disyunción separa dos alternativas. La segunda alternativa contiene una conjunción: q • r.' },
  { texto: 'Si una premisa es verdadera, entonces la conclusión puede ser verdadera y la forma lógica puede seguir siendo inválida.',
    codigo: { p: 'la premisa es verdadera', q: 'la conclusión puede ser verdadera', r: 'la forma lógica puede ser inválida' },
    correcta: 'p → (q • r)',
    explicacion: 'La verdad de la premisa es el antecedente; el consecuente reúne dos afirmaciones. r no puede quedar fuera del consecuente.' },
  { texto: 'O bien el enunciado es básico, o bien es teórico y depende de otras afirmaciones.',
    codigo: { p: 'el enunciado es básico', q: 'es teórico', r: 'depende de otras afirmaciones' },
    correcta: 'p ∨ (q • r)',
    explicacion: '“O bien” conecta p con el bloque completo “es teórico y depende…”, por eso se agrupa q • r.' },
  { texto: 'Si observamos una correlación sistemática, entonces podemos formular una hipótesis y buscar una implicación contrastadora.',
    codigo: { p: 'observamos una correlación sistemática', q: 'formulamos una hipótesis', r: 'buscamos una implicación contrastadora' },
    correcta: 'p → (q • r)',
    explicacion: 'La consecuencia de observar la correlación está formada por dos acciones unidas por “y”.' },
  { texto: 'O bien la conclusión se desprende de las premisas, o bien el argumento requiere evidencia adicional y no es deductivamente válido.',
    codigo: { p: 'la conclusión se desprende de las premisas', q: 'el argumento requiere evidencia adicional', r: 'el argumento no es deductivamente válido' },
    correcta: 'p ∨ (q • r)',
    explicacion: 'La segunda alternativa contiene dos afirmaciones coordinadas por “y”. El alcance de la disyunción abarca p y todo el bloque q • r.' },
  { texto: 'Una teoría es falsable si y solo si tiene consecuencias observacionales contrastables.',
    codigo: { p: 'la teoría es falsable', q: 'tiene consecuencias observacionales contrastables' },
    correcta: 'p ↔ q',
    explicacion: '“Si y solo si” es el bicondicional: cada parte implica a la otra.' },
  { texto: 'Una hipótesis es científica solo si es contrastable.',
    codigo: { p: 'la hipótesis es científica', q: 'la hipótesis es contrastable' },
    correcta: 'p → q',
    explicacion: '“A solo si B” se formaliza A → B: lo que viene después de “solo si” es el consecuente, no el antecedente.' },
  { texto: 'Es condición necesaria para que un argumento sea sólido que sea válido.',
    codigo: { p: 'el argumento es sólido', q: 'el argumento es válido' },
    correcta: 'p → q',
    explicacion: 'La condición necesaria va en el consecuente: si el argumento es sólido, necesariamente es válido.' },
  { texto: 'Que una premisa sea falsa es condición suficiente para que el argumento no sea sólido.',
    codigo: { p: 'una premisa es falsa', q: 'el argumento es sólido' },
    correcta: 'p → ~q',
    explicacion: 'La condición suficiente es el antecedente. “No sea sólido” es la negación de q.' },
  { texto: 'La hipótesis no es refutable ni es contrastable.',
    codigo: { p: 'la hipótesis es refutable', q: 'la hipótesis es contrastable' },
    correcta: '~p • ~q',
    explicacion: '“Ni… ni…” niega las dos partes: ~p • ~q. (Es equivalente a ~(p ∨ q).)' },
  { texto: 'No es cierto que el argumento sea válido y tenga una premisa falsa.',
    codigo: { p: 'el argumento es válido', q: 'el argumento tiene una premisa falsa' },
    correcta: '~(p • q)',
    explicacion: '“No es cierto que…” niega todo lo que sigue, por eso la negación va delante de un paréntesis: ~(p • q).' },
  { texto: 'El argumento es válido, pero tiene una premisa falsa.',
    codigo: { p: 'el argumento es válido', q: 'el argumento tiene una premisa falsa' },
    correcta: 'p • q',
    explicacion: '“Pero”, “sin embargo” y “aunque” se formalizan como conjunción: agregan un contraste, no un conector distinto.' },
  { texto: 'Aunque la teoría es sencilla, no es verdadera.',
    codigo: { p: 'la teoría es sencilla', q: 'la teoría es verdadera' },
    correcta: 'p • ~q',
    explicacion: '“Aunque” funciona como conjunción y “no es verdadera” es ~q.' },
  { texto: 'A menos que la evidencia sea suficiente, la hipótesis no se acepta.',
    codigo: { p: 'la evidencia es suficiente', q: 'la hipótesis se acepta' },
    correcta: '~p → ~q',
    explicacion: '“A menos que A, B” equivale a “si no A, entonces B”. Acá: si la evidencia no es suficiente, la hipótesis no se acepta. (También se puede escribir p ∨ ~q.)' },
  { texto: 'Si la muestra es representativa y el diseño es correcto, entonces los resultados son confiables.',
    codigo: { p: 'la muestra es representativa', q: 'el diseño es correcto', r: 'los resultados son confiables' },
    correcta: '(p • q) → r',
    explicacion: 'El antecedente es una conjunción, por eso va entre paréntesis: (p • q) → r.' },
  { texto: 'Si la muestra es representativa, entonces, si el diseño es correcto, los resultados son confiables.',
    codigo: { p: 'la muestra es representativa', q: 'el diseño es correcto', r: 'los resultados son confiables' },
    correcta: 'p → (q → r)',
    explicacion: 'Hay una condicional dentro del consecuente de otra condicional. (Es equivalente a (p • q) → r, pero acá se pide respetar la estructura del enunciado.)' },
  { texto: 'La hipótesis es verdadera o es falsa, pero no ambas cosas.',
    codigo: { p: 'la hipótesis es verdadera', q: 'la hipótesis es falsa' },
    correcta: '(p ∨ q) • ~(p • q)',
    explicacion: 'Es una disyunción excluyente: al menos una de las dos (p ∨ q), pero no las dos a la vez (~(p • q)).' },
  { texto: 'Si el argumento es válido o la evidencia es suficiente, entonces la conclusión es aceptable.',
    codigo: { p: 'el argumento es válido', q: 'la evidencia es suficiente', r: 'la conclusión es aceptable' },
    correcta: '(p ∨ q) → r',
    explicacion: 'El antecedente es una disyunción completa: basta con que se dé una de las dos para llegar a r.' },
  { texto: 'Si el argumento es inválido, entonces no es sólido.',
    codigo: { p: 'el argumento es válido', q: 'el argumento es sólido' },
    correcta: '~p → ~q',
    explicacion: '“Inválido” es la negación de “válido” (~p) y “no es sólido” es ~q.' },
  { texto: 'La explicación es causal y predictiva, o es meramente descriptiva.',
    codigo: { p: 'la explicación es causal', q: 'la explicación es predictiva', r: 'la explicación es meramente descriptiva' },
    correcta: '(p • q) ∨ r',
    explicacion: 'La coma marca el alcance: “causal y predictiva” forma la primera alternativa y “meramente descriptiva” la segunda.' },
  { texto: 'Si no hay evidencia suficiente, entonces la hipótesis no puede aceptarse ni rechazarse.',
    codigo: { p: 'hay evidencia suficiente', q: 'la hipótesis puede aceptarse', r: 'la hipótesis puede rechazarse' },
    correcta: '~p → (~q • ~r)',
    explicacion: '“No… ni…” niega las dos opciones dentro del consecuente: ~q • ~r.' },
  { texto: 'Solo si el estudio es replicable, los resultados son confiables.',
    codigo: { p: 'el estudio es replicable', q: 'los resultados son confiables' },
    correcta: 'q → p',
    explicacion: '“Solo si p, q” significa que q depende de p: q → p. El orden de las oraciones en castellano engaña: la que sigue a “solo si” es el consecuente.' },
  { texto: 'No es el caso que, si la hipótesis es contrastable, entonces sea verdadera.',
    codigo: { p: 'la hipótesis es contrastable', q: 'la hipótesis es verdadera' },
    correcta: '~(p → q)',
    explicacion: 'Lo que se niega es la condicional completa, no una de sus partes: ~(p → q).' },
  { texto: 'La teoría es aceptada si y solo si es contrastable y no ha sido refutada.',
    codigo: { p: 'la teoría es aceptada', q: 'la teoría es contrastable', r: 'la teoría ha sido refutada' },
    correcta: 'p ↔ (q • ~r)',
    explicacion: 'El bicondicional une “es aceptada” con el bloque “contrastable y no refutada”. “No ha sido refutada” es ~r.' },
  { texto: 'Si el enunciado es observacional, entonces es contrastable, y si es teórico, entonces depende de la teoría.',
    codigo: { p: 'el enunciado es observacional', q: 'el enunciado es contrastable', r: 'el enunciado es teórico', s: 'el enunciado depende de la teoría' },
    correcta: '(p → q) • (r → s)',
    explicacion: 'Son dos condicionales unidas por “y”: cada una va entre paréntesis y el conector principal es la conjunción.' },
  { texto: 'Si la hipótesis es refutada, entonces se descarta o se modifica.',
    codigo: { p: 'la hipótesis es refutada', q: 'la hipótesis se descarta', r: 'la hipótesis se modifica' },
    correcta: 'p → (q ∨ r)',
    explicacion: 'El consecuente es una disyunción: “se descarta o se modifica”.' },
  { texto: 'Los resultados son confiables si el diseño es correcto y la muestra es representativa.',
    codigo: { p: 'los resultados son confiables', q: 'el diseño es correcto', r: 'la muestra es representativa' },
    correcta: '(q • r) → p',
    explicacion: '“A si B” pone a B como antecedente: lo que sigue a “si” es la condición, aunque aparezca al final de la oración.' },
  { texto: 'El experimento es replicable a menos que haya error de medición.',
    codigo: { p: 'el experimento es replicable', q: 'hay error de medición' },
    correcta: '~q → p',
    explicacion: '“A a menos que B” equivale a “si no B, entonces A”. También puede escribirse q ∨ p.' }
];

// ==========================================================
// Banco 2: argumentos
// Cada oración lleva su fórmula, así la corrección muestra el paso a paso.
// ==========================================================
export const BANCO_ARGUMENTOS = [
  { premisas: [
      { t: 'La evidencia disponible es insuficiente, o la explicación es provisional.', f: 'p ∨ q' },
      { t: 'Si la evidencia no es insuficiente, entonces la explicación puede someterse a una prueba directa.', f: '~p → r' },
      { t: 'La explicación no puede someterse a una prueba directa.', f: '~r' }],
    conclusion: { t: 'La evidencia disponible es insuficiente.', f: 'p' },
    codigo: { p: 'la evidencia disponible es insuficiente', q: 'la explicación es provisional', r: 'la explicación puede someterse a una prueba directa' },
    regla: 'MT sobre ~p → r y ~r da ~~p; por DN, p. (La primera premisa no hace falta para llegar a la conclusión.)' },
  { premisas: [
      { t: 'El argumento es válido, o necesita una premisa adicional.', f: 'p ∨ q' },
      { t: 'Si no necesita una premisa adicional, entonces la conclusión se sigue deductivamente.', f: '~q → r' },
      { t: 'La conclusión no se sigue deductivamente.', f: '~r' }],
    conclusion: { t: 'Necesita una premisa adicional.', f: 'q' },
    codigo: { p: 'el argumento es válido', q: 'el argumento necesita una premisa adicional', r: 'la conclusión se sigue deductivamente' },
    regla: 'MT sobre ~q → r y ~r da ~~q; por DN, q.' },
  { premisas: [
      { t: 'La muestra es representativa, o los datos son insuficientes.', f: 'p ∨ q' },
      { t: 'Si la muestra no es representativa, entonces los resultados no permiten generalizar.', f: '~p → r' },
      { t: 'Los resultados permiten generalizar.', f: '~r' }],
    conclusion: { t: 'La muestra es representativa.', f: 'p' },
    codigo: { p: 'la muestra es representativa', q: 'los datos son insuficientes', r: 'los resultados no permiten generalizar' },
    regla: '“Los resultados permiten generalizar” es la negación de r, o sea ~r. MT sobre ~p → r y ~r da ~~p; por DN, p.' },
  { premisas: [
      { t: 'La teoría es empírica, o contiene términos teóricos.', f: 'p ∨ q' },
      { t: 'Si no contiene términos teóricos, entonces sus enunciados pueden confrontarse directamente.', f: '~q → r' },
      { t: 'Sus enunciados no pueden confrontarse directamente.', f: '~r' }],
    conclusion: { t: 'La teoría contiene términos teóricos.', f: 'q' },
    codigo: { p: 'la teoría es empírica', q: 'la teoría contiene términos teóricos', r: 'sus enunciados pueden confrontarse directamente' },
    regla: 'MT sobre ~q → r y ~r da ~~q; por DN, q.' },
  { premisas: [
      { t: 'El estudio es experimental, o es observacional.', f: 'p ∨ q' },
      { t: 'Si no es observacional, entonces interviene deliberadamente sobre las variables.', f: '~q → r' },
      { t: 'El estudio no interviene deliberadamente sobre las variables.', f: '~r' }],
    conclusion: { t: 'Es observacional.', f: 'q' },
    codigo: { p: 'el estudio es experimental', q: 'el estudio es observacional', r: 'el estudio interviene deliberadamente sobre las variables' },
    regla: 'MT sobre ~q → r y ~r da ~~q; por DN, q.' },
  { premisas: [
      { t: 'La explicación es causal, o es meramente descriptiva.', f: 'p ∨ q' },
      { t: 'Si no es descriptiva, entonces pretende identificar una relación causal.', f: '~q → r' },
      { t: 'La explicación no pretende identificar una relación causal.', f: '~r' }],
    conclusion: { t: 'Es meramente descriptiva.', f: 'q' },
    codigo: { p: 'la explicación es causal', q: 'la explicación es meramente descriptiva', r: 'la explicación pretende identificar una relación causal' },
    regla: '“No es descriptiva” es ~q. MT sobre ~q → r y ~r da ~~q; por DN, q.' },
  { premisas: [
      { t: 'Si la hipótesis es contrastable, entonces es científica.', f: 'p → q' },
      { t: 'La hipótesis es contrastable.', f: 'p' }],
    conclusion: { t: 'La hipótesis es científica.', f: 'q' },
    codigo: { p: 'la hipótesis es contrastable', q: 'la hipótesis es científica' },
    regla: 'MP: de p → q y p se obtiene q.' },
  { premisas: [
      { t: 'Si la muestra es aleatoria, entonces es representativa.', f: 'p → q' },
      { t: 'Si la muestra es representativa, entonces los resultados pueden generalizarse.', f: 'q → r' }],
    conclusion: { t: 'Si la muestra es aleatoria, entonces los resultados pueden generalizarse.', f: 'p → r' },
    codigo: { p: 'la muestra es aleatoria', q: 'la muestra es representativa', r: 'los resultados pueden generalizarse' },
    regla: 'SH: se encadenan p → q y q → r.' },
  { premisas: [
      { t: 'El efecto se debe al azar o al tratamiento.', f: 'p ∨ q' },
      { t: 'El efecto no se debe al azar.', f: '~p' }],
    conclusion: { t: 'El efecto se debe al tratamiento.', f: 'q' },
    codigo: { p: 'el efecto se debe al azar', q: 'el efecto se debe al tratamiento' },
    regla: 'SD: de p ∨ q y ~p se obtiene q.' },
  { premisas: [
      { t: 'Si la teoría es verdadera, entonces la predicción se cumple.', f: 'p → q' },
      { t: 'La predicción no se cumple.', f: '~q' }],
    conclusion: { t: 'La teoría no es verdadera.', f: '~p' },
    codigo: { p: 'la teoría es verdadera', q: 'la predicción se cumple' },
    regla: 'MT: de p → q y ~q se obtiene ~p.' },
  { premisas: [
      { t: 'Si el diseño es correcto y la muestra es representativa, entonces los resultados son confiables.', f: '(p • q) → r' },
      { t: 'El diseño es correcto.', f: 'p' },
      { t: 'La muestra es representativa.', f: 'q' }],
    conclusion: { t: 'Los resultados son confiables.', f: 'r' },
    codigo: { p: 'el diseño es correcto', q: 'la muestra es representativa', r: 'los resultados son confiables' },
    regla: 'Conj. de p y q da p • q; luego MP con (p • q) → r.' },
  { premisas: [
      { t: 'No es cierto que la hipótesis no sea contrastable.', f: '~~p' },
      { t: 'Si la hipótesis es contrastable, entonces puede ponerse a prueba.', f: 'p → q' }],
    conclusion: { t: 'La hipótesis puede ponerse a prueba.', f: 'q' },
    codigo: { p: 'la hipótesis es contrastable', q: 'la hipótesis puede ponerse a prueba' },
    regla: 'DN: de ~~p se obtiene p; luego MP con p → q.' },
  { premisas: [
      { t: 'El experimento es controlado y replicable.', f: 'p • q' },
      { t: 'Si el experimento es replicable, entonces sus resultados son confiables.', f: 'q → r' }],
    conclusion: { t: 'Los resultados son confiables.', f: 'r' },
    codigo: { p: 'el experimento es controlado', q: 'el experimento es replicable', r: 'sus resultados son confiables' },
    regla: 'Simp. de p • q da q; luego MP con q → r.' },
  { premisas: [
      { t: 'La conclusión no se sigue de las premisas, o el argumento es válido.', f: '~p ∨ q' },
      { t: 'El argumento no es válido.', f: '~q' }],
    conclusion: { t: 'La conclusión no se sigue de las premisas.', f: '~p' },
    codigo: { p: 'la conclusión se sigue de las premisas', q: 'el argumento es válido' },
    regla: 'SD: de ~p ∨ q y ~q se obtiene ~p.' },
  { premisas: [
      { t: 'Si la ley es universal, entonces es falsable.', f: 'p → q' },
      { t: 'Si la ley es falsable, entonces es científica.', f: 'q → r' },
      { t: 'La ley es universal.', f: 'p' }],
    conclusion: { t: 'La ley es científica.', f: 'r' },
    codigo: { p: 'la ley es universal', q: 'la ley es falsable', r: 'la ley es científica' },
    regla: 'MP con p → q da q; luego MP con q → r da r (o SH y después MP).' },
  { premisas: [
      { t: 'Si no hay variable de confusión, entonces el efecto es causal.', f: '~p → q' },
      { t: 'No hay variable de confusión.', f: '~p' }],
    conclusion: { t: 'El efecto es causal.', f: 'q' },
    codigo: { p: 'hay variable de confusión', q: 'el efecto es causal' },
    regla: 'MP: de ~p → q y ~p se obtiene q.' },
  { premisas: [
      { t: 'La hipótesis es verdadera o es falsa.', f: 'p ∨ q' },
      { t: 'Si es falsa, entonces se rechaza.', f: 'q → r' },
      { t: 'La hipótesis no se rechaza.', f: '~r' }],
    conclusion: { t: 'La hipótesis es verdadera.', f: 'p' },
    codigo: { p: 'la hipótesis es verdadera', q: 'la hipótesis es falsa', r: 'la hipótesis se rechaza' },
    regla: 'MT sobre q → r y ~r da ~q; luego SD con p ∨ q da p.' },
  { premisas: [
      { t: 'Si el modelo es adecuado, entonces predice bien y es simple.', f: 'p → (q • r)' },
      { t: 'El modelo es adecuado.', f: 'p' }],
    conclusion: { t: 'El modelo predice bien.', f: 'q' },
    codigo: { p: 'el modelo es adecuado', q: 'el modelo predice bien', r: 'el modelo es simple' },
    regla: 'MP da q • r; luego Simp. da q.' },
  { premisas: [
      { t: 'El tratamiento funciona y no tiene efectos adversos, o no se aprueba.', f: '(p • ~q) ∨ ~r' },
      { t: 'El tratamiento se aprueba.', f: 'r' }],
    conclusion: { t: 'El tratamiento funciona y no tiene efectos adversos.', f: 'p • ~q' },
    codigo: { p: 'el tratamiento funciona', q: 'el tratamiento tiene efectos adversos', r: 'el tratamiento se aprueba' },
    regla: 'De r se obtiene ~~r (DN); luego SD elimina la alternativa ~r.' }
];

// ==========================================================
// Banco 3: estructura de fórmulas
// ==========================================================
export const FORMULAS_ESTRUCTURA = [
  '(p • q) → r', 'p → (q • r)', '~(p ∨ q)', '~p ∨ q', '(p ∨ q) • ~r', '~(p → q)',
  'p ↔ (q • r)', '(p → q) • (q → r)', '~p → (q ∨ r)', '(p • q) ∨ r', 'p • (q ∨ r)', '~(p • q) → r',
  '(p ∨ q) → ~r', 'p → ~q', '~~p', '(p ↔ q) → r', 'p ∨ (q → r)', '(p → q) ∨ r',
  '~(p ↔ q)', '(~p • q) → (r ∨ s)', '((p → q) • p) → q', 'p • ~(q ∨ r)', '(p • q) ↔ (r ∨ s)', '~p • ~q'
];

const ETIQUETA_CONECTOR = { '→': '→ condicional', '•': '• conjunción', '∨': '∨ disyunción', '↔': '↔ bicondicional', '~': '~ negación' };

// ---------- Armado de preguntas ----------
export function armarEnunciado(it) {
  const correcta = imprimir(parsear(it.correcta));
  return {
    tipo: 'Enunciados', texto: it.texto, codigo: it.codigo, correcta,
    opciones: mezclar([correcta, ...distractoresFormula(correcta, 3)]),
    explicacion: it.explicacion
  };
}

export function armarArgumento(it) {
  const fs = [...it.premisas, it.conclusion].map(x => parsear(x.f));
  const correcta = textoArgumento(fs);
  return {
    tipo: 'Argumentos', premisas: it.premisas.map(p => ({ t: p.t, f: imprimir(parsear(p.f)) })),
    conclusion: { t: it.conclusion.t, f: imprimir(parsear(it.conclusion.f)) },
    codigo: it.codigo, correcta,
    opciones: mezclar([correcta, ...distractoresArgumento(fs, 3)]),
    explicacion: it.regla
  };
}

function subformulas(n, out = []) {
  if (n.op === 'a') return out;
  if (n.op === '~') { out.push(n.x); subformulas(n.x, out); return out; }
  out.push(n.l, n.r); subformulas(n.l, out); subformulas(n.r, out);
  return out;
}

export function armarEstructura(formula, tipo) {
  const n = parsear(formula);
  const f = imprimir(n);
  if (tipo === 'conector') {
    const correcta = ETIQUETA_CONECTOR[n.op];
    const otros = muestra(Object.values(ETIQUETA_CONECTOR).filter(x => x !== correcta), 3);
    const detalle = n.op === '~'
      ? `La negación está delante de todo lo demás y afecta a «${imprimir(n.x)}».`
      : `Es una ${NOMBRE_CONECTOR[n.op]}: une «${imprimir(n.l)}» con «${imprimir(n.r)}». Los conectores que quedan dentro de paréntesis son secundarios.`;
    return {
      tipo: 'Estructura', texto: '¿Cuál es el conector principal de esta fórmula?', formula: f,
      correcta, opciones: mezclar([correcta, ...otros]),
      explicacion: 'El conector principal es el que queda fuera de todos los paréntesis y define qué tipo de fórmula es. ' + detalle
    };
  }
  const parte = tipo === 'antecedente' ? n.l : n.r;
  const otra = tipo === 'antecedente' ? n.r : n.l;
  const correcta = imprimir(parte);
  const pool = new Map();
  const agregar = (arbol) => {
    const t = imprimir(arbol);
    if (t !== correcta && !pool.has(t) && !equivalentes(parte, arbol)) pool.set(t, arbol);
  };
  agregar(otra);
  mezclar(subformulas(n)).forEach(agregar);
  mutaciones(parte).forEach(agregar);
  if (pool.size < 3) [...pool.values()].forEach(a => mutaciones(a).forEach(agregar));   // fórmulas muy chicas: se buscan más variantes
  const elegidos = [imprimir(otra), ...mezclar([...pool.keys()].filter(t => t !== imprimir(otra)))].filter(t => pool.has(t)).slice(0, 3);
  return {
    tipo: 'Estructura', texto: `¿Cuál es el ${tipo} de esta fórmula?`, formula: f,
    correcta, opciones: mezclar([correcta, ...elegidos]),
    explicacion: `En una condicional, el antecedente es lo que está antes de la flecha principal y el consecuente lo que está después. Acá la flecha principal separa «${imprimir(n.l)}» (antecedente) de «${imprimir(n.r)}» (consecuente).`
  };
}

function rondaEstructura(cantidad) {
  return muestra(FORMULAS_ESTRUCTURA, cantidad).map(f => {
    const n = parsear(f);
    const tipo = n.op === '→' ? muestra(['conector', 'antecedente', 'consecuente'], 1)[0] : 'conector';
    return armarEstructura(f, tipo);
  });
}

const MODOS = {
  enunciados: {
    nombre: 'Formalización de enunciados', corto: 'Enunciados',
    descripcion: 'Traducir oraciones al lenguaje simbólico y respetar el alcance de los conectores.',
    cantidad: () => BANCO_ENUNCIADOS.length,
    ronda: () => muestra(BANCO_ENUNCIADOS, LARGO_RONDA).map(armarEnunciado)
  },
  argumentos: {
    nombre: 'Código y formalización de argumentos', corto: 'Argumentos',
    descripcion: 'Separar premisas y conclusión y elegir la forma completa.',
    cantidad: () => BANCO_ARGUMENTOS.length,
    ronda: () => muestra(BANCO_ARGUMENTOS, LARGO_RONDA).map(armarArgumento)
  },
  estructura: {
    nombre: 'Estructura de fórmulas', corto: 'Estructura',
    descripcion: 'Reconocer el conector principal, el antecedente y el consecuente.',
    cantidad: () => FORMULAS_ESTRUCTURA.length,
    ronda: () => rondaEstructura(LARGO_RONDA)
  },
  mixto: {
    nombre: 'Práctica mixta', corto: 'Mixto',
    descripcion: 'Un poco de cada tipo, en orden aleatorio.',
    cantidad: () => BANCO_ENUNCIADOS.length + BANCO_ARGUMENTOS.length + FORMULAS_ESTRUCTURA.length,
    ronda: () => mezclar([
      ...muestra(BANCO_ENUNCIADOS, 5).map(armarEnunciado),
      ...muestra(BANCO_ARGUMENTOS, 4).map(armarArgumento),
      ...rondaEstructura(3)
    ])
  }
};
export const armarRonda = (modo) => MODOS[modo].ronda();

// ---------- Progreso y sonido ----------
function cargarProgreso() {
  try { return JSON.parse(localStorage.getItem(CLAVE_PROGRESO) || '{}'); } catch { return {}; }
}
function guardarProgreso(p) {
  try { localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(p)); } catch { /* sin almacenamiento: no pasa nada */ }
}
// El sonido nunca debe impedir que el ejercicio avance.
function sonar(nombre, ...args) {
  try { Sonido[nombre]?.(...args); } catch { /* ignorado */ }
}

// ---------- Estilos ----------
function inyectarEstilos() {
  if (document.getElementById('estilos-fm-ipc')) return;
  const st = document.createElement('style');
  st.id = 'estilos-fm-ipc';
  st.textContent = `
.fm-wrap{max-width:880px;margin:0 auto;padding-bottom:2rem}
.fm-wrap [hidden]{display:none!important}
.fm-kicker{font-size:.76rem;letter-spacing:.12em;font-weight:800;color:var(--ambar)}
.fm-top{display:flex;align-items:center;justify-content:space-between;gap:.7rem;flex-wrap:wrap}
.fm-intro{color:var(--tenue);line-height:1.5;margin:.35rem 0 1rem}
.fm-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem;margin:1rem 0}
.fm-stat{background:var(--panel-2);border:1px solid var(--linea);border-radius:12px;padding:.7rem}
.fm-stat b{display:block;font-size:1.35rem;color:var(--crema)}
.fm-stat small{color:var(--tenue)}
.fm-panel{background:var(--panel);border:2px solid var(--linea);border-radius:15px;padding:clamp(14px,3vw,22px);margin-top:16px}
.fm-panel h2{font-size:1.12rem;line-height:1.5;margin:6px 0 14px}
.fm-modo{display:flex;flex-direction:column;gap:5px;text-align:left;width:100%;padding:15px;border:2px solid var(--linea);border-radius:12px;background:var(--panel-2);color:var(--crema);margin:10px 0;cursor:pointer;touch-action:manipulation}
.fm-modo:hover{border-color:var(--violeta)}
.fm-modo strong{font-size:1rem}
.fm-modo small{color:var(--tenue);line-height:1.4}
.fm-nota,.fm-ayuda{color:var(--tenue);font-size:.9rem;line-height:1.5}
.fm-cabecera{display:flex;justify-content:space-between;gap:12px;margin-top:14px;font-size:.9rem;font-weight:700}
.fm-progreso{height:8px;border-radius:20px;background:var(--panel-2);overflow:hidden;margin-top:10px}
.fm-progreso span{display:block;height:100%;background:var(--violeta);transition:width .2s}
.fm-etiqueta{font-size:.72rem;letter-spacing:.1em;font-weight:800;color:var(--tenue)}
.fm-premisas{margin:6px 0 10px;padding-left:1.3rem;line-height:1.5}
.fm-premisas li{margin:.3rem 0}
.fm-conclusion{margin:0 0 6px;line-height:1.5}
.fm-formula{display:block;margin:10px 0 4px;padding:14px;border-radius:12px;background:var(--panel-2);border:1px solid var(--linea);text-align:center;font-size:1.35rem;overflow-wrap:anywhere}
.fm-codigo{margin:14px 0 4px;padding:11px 13px;border-left:3px solid var(--violeta);background:var(--panel-2);border-radius:8px;font-size:.92rem}
.fm-codigo ul{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:3px}
.fm-codigo code{font-weight:800;color:var(--ambar)}
.fm-opciones{display:grid;gap:10px;margin:16px 0}
.fm-opcion{display:flex;align-items:flex-start;gap:12px;text-align:left;width:100%;padding:13px;border:2px solid var(--linea);border-radius:12px;background:var(--panel);color:var(--crema);cursor:pointer;min-width:0;touch-action:manipulation}
.fm-opcion:hover:not(:disabled){border-color:var(--violeta)}
.fm-opcion>span{flex:0 0 26px;height:26px;border-radius:50%;display:grid;place-items:center;background:var(--panel-2);font-weight:800}
.fm-opcion code,.fm-explica code{white-space:normal;overflow-wrap:anywhere;font-size:.98rem}
.fm-opcion:disabled{cursor:default}
.fm-opcion.fm-correcta{border-color:var(--ok);background:rgba(79,224,160,.12)}
.fm-opcion.fm-incorrecta{border-color:var(--mal);background:rgba(255,93,122,.1)}
.fm-explica{padding:13px 14px;border-radius:12px;margin:14px 0;line-height:1.5;background:var(--panel-2)}
.fm-explica.ok{border-left:4px solid var(--ok)}
.fm-explica.error{border-left:4px solid var(--mal)}
.fm-explica p{margin:8px 0}
.fm-paso{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--linea);font-size:.92rem}
.fm-paso:last-of-type{border-bottom:0}
.fm-paso span{color:var(--tenue);min-width:0}
.fm-paso code{flex:none;white-space:nowrap;text-align:right}
.fm-final{text-align:center}
.fm-falladas{text-align:left;margin:14px 0;padding:0;list-style:none;display:grid;gap:8px}
.fm-falladas li{padding:10px 12px;border-radius:10px;background:var(--panel-2);border-left:3px solid var(--mal);font-size:.92rem;line-height:1.45}
.fm-acciones{display:flex;gap:.6rem;flex-wrap:wrap;margin-top:12px}
@media(max-width:560px){.fm-panel{padding:14px}.fm-opcion{padding:11px}.fm-opcion code{font-size:.9rem}.fm-stat{padding:.55rem}.fm-stat b{font-size:1.15rem}}
  `;
  document.head.appendChild(st);
}

// ==========================================================
// Interfaz
// ==========================================================
export function abrirFormalizacion({ app, volver }) {
  inyectarEstilos();
  let modo = 'enunciados';
  let ronda = [];
  let indice = 0;
  let aciertos = 0;
  let racha = 0;
  let respondida = false;
  let falladas = [];
  let progreso = cargarProgreso();

  function inicio() {
    const total = progreso.total || 0;
    const correctas = progreso.correctas || 0;
    app.innerHTML = `
      <main class="pantalla fm-wrap">
        <button class="btn enlace" id="fm-volver" type="button">← IPC</button>
        <div class="fm-top"><span class="fm-kicker">IPC · LÓGICA FORMAL</span></div>
        <h1>Formalización</h1>
        <p class="fm-intro">Practicá con el formato del modelo: identificá la estructura lógica, respetá el alcance de los conectores y reconstruí argumentos completos. Cada ronda tiene hasta ${LARGO_RONDA} ejercicios distintos.</p>
        <div class="fm-stats">
          <div class="fm-stat"><b>${total}</b><small>respondidas</small></div>
          <div class="fm-stat"><b>${correctas}</b><small>correctas</small></div>
          <div class="fm-stat"><b>${total ? Math.round(correctas / total * 100) : 0}%</b><small>precisión histórica</small></div>
        </div>
        <section class="fm-panel">
          <h2>Elegí el tipo de práctica</h2>
          ${Object.entries(MODOS).map(([id, m], i) => `<button class="fm-modo" type="button" data-modo="${id}"><strong>${i + 1}. ${esc(m.nombre)}</strong><small>${esc(m.descripcion)} · ${m.cantidad()} ejercicios en el banco</small></button>`).join('')}
        </section>
        <p class="fm-nota">Notación: ~ negación · • conjunción · ∨ disyunción · → condicional · ↔ bicondicional. Después de cada elección aparece la corrección y el motivo.</p>
        ${total ? '<div class="fm-acciones"><button class="btn secundario" type="button" id="fm-reiniciar">Reiniciar estadísticas</button></div>' : ''}
      </main>`;
    app.querySelector('#fm-volver').addEventListener('click', () => { sonar('clic'); volver(); });
    app.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => { modo = b.dataset.modo; iniciar(); }));
    app.querySelector('#fm-reiniciar')?.addEventListener('click', () => {
      if (!confirm('¿Reiniciar las estadísticas de formalización en este dispositivo?')) return;
      progreso = {}; guardarProgreso(progreso); inicio();
    });
    window.scrollTo(0, 0);
  }

  function iniciar() {
    ronda = armarRonda(modo);
    indice = 0; aciertos = 0; racha = 0; falladas = [];
    render();
  }

  function cuerpo(q) {
    if (q.tipo === 'Argumentos') {
      return `<ol class="fm-premisas">${q.premisas.map(p => `<li>${esc(p.t)}</li>`).join('')}</ol>
        <p class="fm-conclusion"><b>Por lo tanto:</b> ${esc(q.conclusion.t)}</p>
        <p class="fm-ayuda">Elegí la forma completa: las premisas separadas por «;» y la conclusión después de «⊢».</p>`;
    }
    if (q.tipo === 'Estructura') {
      return `<h2>${esc(q.texto)}</h2><code class="fm-formula">${esc(q.formula)}</code>`;
    }
    return `<h2>${esc(q.texto)}</h2><p class="fm-ayuda">Elegí la formalización correcta usando el código dado.</p>`;
  }

  function render() {
    const q = ronda[indice];
    respondida = false;
    const progresoPct = Math.round(indice / ronda.length * 100);
    const codigo = q.codigo
      ? `<div class="fm-codigo"><span class="fm-etiqueta">CÓDIGO</span><ul>${Object.entries(q.codigo).map(([l, t]) => `<li><code>${esc(l)}</code> = ${esc(t)}</li>`).join('')}</ul></div>`
      : '';
    app.innerHTML = `
      <main class="pantalla fm-wrap">
        <button class="btn enlace" id="fm-salir" type="button">← Elegir otra práctica</button>
        <div class="fm-cabecera"><span>${esc(MODOS[modo].corto)}</span><span>${indice + 1} / ${ronda.length}</span></div>
        <div class="fm-progreso"><span style="width:${progresoPct}%"></span></div>
        <section class="fm-panel">
          <p class="fm-etiqueta">${esc(q.tipo.toUpperCase())} · EJERCICIO ${indice + 1}</p>
          ${cuerpo(q)}
          ${codigo}
          <div class="fm-opciones">${q.opciones.map((o, n) => `<button class="fm-opcion" type="button" data-op="${n}"><span>${String.fromCharCode(65 + n)}</span><code>${esc(o)}</code></button>`).join('')}</div>
          <div id="fm-feedback" aria-live="polite"></div>
          <button class="btn primario" type="button" id="fm-siguiente" hidden>${indice === ronda.length - 1 ? 'Ver resultado' : 'Siguiente ejercicio'} →</button>
        </section>
      </main>`;
    app.querySelector('#fm-salir').addEventListener('click', inicio);
    const botones = [...app.querySelectorAll('[data-op]')];
    botones.forEach(b => b.addEventListener('click', () => responder(q, q.opciones[Number(b.dataset.op)], b, botones)));
    app.querySelector('#fm-siguiente').addEventListener('click', () => {
      indice++;
      if (indice < ronda.length) render(); else resultado();
    });
    window.scrollTo(0, 0);
  }

  function responder(q, elegida, boton, botones) {
    if (respondida) return;
    respondida = true;
    const bien = elegida === q.correcta;
    progreso.total = (progreso.total || 0) + 1;
    if (bien) { aciertos++; racha++; progreso.correctas = (progreso.correctas || 0) + 1; }
    else { falladas.push(q); }
    const perdioRacha = !bien && racha >= 3;
    if (!bien) racha = 0;
    guardarProgreso(progreso);

    botones.forEach(x => {
      x.disabled = true;
      const valor = q.opciones[Number(x.dataset.op)];
      if (valor === q.correcta) x.classList.add('fm-correcta');
      else if (x === boton) x.classList.add('fm-incorrecta');
    });
    const pasos = q.tipo === 'Argumentos'
      ? [...q.premisas.map((p, i) => ({ t: `Premisa ${i + 1}: ${p.t}`, f: p.f })), { t: `Conclusión: ${q.conclusion.t}`, f: q.conclusion.f }]
          .map(p => `<div class="fm-paso"><span>${esc(p.t)}</span><code>${esc(p.f)}</code></div>`).join('')
      : '';
    app.querySelector('#fm-feedback').innerHTML = `
      <div class="fm-explica ${bien ? 'ok' : 'error'}"><strong>${bien ? '¡Correcto!' : 'No es esa opción.'}</strong>
        <p><b>Respuesta:</b> <code>${esc(q.correcta)}</code></p>
        ${pasos}
        <p>${esc(q.explicacion)}</p></div>`;
    app.querySelector('#fm-siguiente').hidden = false;
    app.querySelector('#fm-siguiente').focus({ preventScroll: true });
    if (bien) sonar('acierto', racha); else sonar('error', perdioRacha);
  }

  function resultado() {
    const total = ronda.length;
    const pct = Math.round(aciertos / total * 100);
    app.innerHTML = `
      <main class="pantalla fm-wrap"><button class="btn enlace" id="fm-inicio" type="button">← Volver a prácticas</button>
        <section class="fm-panel fm-final">
          <p class="fm-etiqueta">RESULTADO</p>
          <h2>${aciertos} de ${total} correctas</h2>
          <p>${pct}% de precisión en ${esc(MODOS[modo].corto.toLowerCase())}.</p>
          ${falladas.length ? `<h2>Para repasar</h2><ul class="fm-falladas">${falladas.map(q => `<li>${esc(q.texto || q.conclusion.t)}<br><code>${esc(q.correcta)}</code></li>`).join('')}</ul>` : '<p>¡Sin errores en esta ronda!</p>'}
          <div class="fm-acciones" style="justify-content:center"><button class="btn primario" type="button" id="fm-repetir">Otra ronda</button></div>
        </section>
      </main>`;
    app.querySelector('#fm-inicio').addEventListener('click', inicio);
    app.querySelector('#fm-repetir').addEventListener('click', iniciar);
    window.scrollTo(0, 0);
  }

  inicio();
}
