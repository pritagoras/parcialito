// ==========================================================
// parciales-bio.js: Parciales de Biología: bancos del primer y segundo parcial, estudio por tema y simulacros.
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { cargarTema, normalizar } from './datos.js';
import { vistaInicio } from './home.js';
import { empezarJuego } from './juego.js';
import { S, app, avisar, esc, LETRAS, mezclar, vistaCargando } from './nucleo.js';
import { vistaError } from './partidas.js';

// Segundo parcial: junta TODOS los JSON de la carpeta segundo-parcial/ en un único juego.
// La lista de archivos sale de segundo-parcial/index.json (lo genera tools/actualizar_indice.py).
export const SEGUNDO_PARCIAL_TEMA_ID = 'segundo-parcial/todas';

let segundoParcialPool = null;

const TEMAS_SEGUNDO_PARCIAL = [
  { id: 'nucleo', nombre: 'Núcleo y cromatina', icono: '🔬', descripcion: 'Envoltura nuclear, nucléolo, cromatina y organización del ADN.', patron: /\b(nucleo|nucleolo|cromatina|nucleosoma|histonas?|eucromatina|heterocromatina|poro nuclear|envoltura nuclear)\b/ },
  { id: 'duplicacion', nombre: 'Duplicación del ADN', icono: '🧬', descripcion: 'Replicación, horquilla, enzimas y reparación del ADN.', patron: /\b(replicacion|duplicacion|replicar|duplicar|helicasa|primasa|ligasa|okazaki|horquilla|telomerasa|polimerasa de adn)\b/ },
  { id: 'transcripcion', nombre: 'Transcripción y maduración', icono: '📝', descripcion: 'Síntesis de ARN, promotores, splicing y procesamiento.', patron: /\b(transcripcion|transcripto|transcrito|arn polimerasa|splicing|empalme|intrones?|exones?|promotor|operon|poli.?a|cap 5)\b/ },
  { id: 'traduccion', nombre: 'Traducción y proteínas', icono: '🧫', descripcion: 'Ribosomas, código genético y síntesis de proteínas.', patron: /\b(traduccion|ribosomas?|arnm|arn t|arn de transferencia|codones?|anticodones?|aminoacidos?|polipeptidos?|proteinas?|peptidil|codigo genetico)\b/ },
  { id: 'herencia', nombre: 'Herencia y genética', icono: '🌱', descripcion: 'Genes, alelos, genotipos, fenotipos y patrones hereditarios.', patron: /\b(herencia|mendel|alelos?|genes?|genotipos?|fenotipos?|homocig|heterocig|dominante|recesiv|cruzamiento|mutacion|genetica|gametos?|hered)\b/ },
  { id: 'division', nombre: 'Mitosis y meiosis', icono: '🧩', descripcion: 'División celular, cromosomas, gametogénesis y variabilidad.', patron: /\b(mitosis|meiosis|cromosomas?|cromatidas?|homologos|crossing over|entrecruzamiento|sinapsis|anafase|profase|metafase|telofase|citocinesis|gametogenesis)\b/ },
  { id: 'ciclo', nombre: 'Ciclo celular', icono: '🔄', descripcion: 'Interfase, fases del ciclo y puntos de control.', patron: /\b(ciclo celular|interfase|fase s|fase g1|fase g2|punto de control|checkpoint|ciclinas?|cdk)\b/ },
];

export async function cargarSegundoParcial() {
  if (segundoParcialPool) return segundoParcialPool;
  const r = await fetch('segundo-parcial/index.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error(`No se pudo leer segundo-parcial/index.json (${r.status})`);
  const manifiesto = await r.json();
  const materia = { nombre: 'Segundo parcial' };
  if (!Array.isArray(manifiesto.temas) || !manifiesto.temas.length) {
    throw new Error('El índice del Segundo parcial no contiene archivos.');
  }
  const listas = await Promise.all(manifiesto.temas.map(async (t) => {
    const rr = await fetch(t.archivo, { cache: 'no-cache' });
    if (!rr.ok) throw new Error(`No se pudo leer ${t.archivo} (${rr.status})`);
    const json = await rr.json();
    if (!Array.isArray(json.preguntas)) throw new Error(`${t.archivo} no contiene un array de preguntas válido.`);
    const stem = t.archivo.replace(/^.*\//, '').replace(/\.json$/, '');
    const normalizadas = normalizar(json, { id: `segundo-parcial/${stem}`, nombre: json.tema || stem, archivo: t.archivo }, materia);
    if (normalizadas.length !== json.preguntas.length) {
      throw new Error(`${t.archivo}: se cargaron ${normalizadas.length} de ${json.preguntas.length}; hay preguntas con formato inválido.`);
    }
    if (Number.isInteger(t.preguntas) && t.preguntas !== json.preguntas.length) {
      throw new Error(`${t.archivo}: el índice declara ${t.preguntas} preguntas, pero el JSON contiene ${json.preguntas.length}.`);
    }
    return normalizadas;
  }));
  // No descartamos preguntas por coincidencias de hash: cada registro válido del banco entra al juego.
  const pool = listas.flat().map((q) => ({ ...q, temaId: SEGUNDO_PARCIAL_TEMA_ID }));
  const totalDeclarado = manifiesto.temas.reduce((s, t) => s + (Number(t.preguntas) || 0), 0);
  if (totalDeclarado && pool.length !== totalDeclarado) {
    throw new Error(`El banco declara ${totalDeclarado} preguntas, pero se cargaron ${pool.length}.`);
  }
  segundoParcialPool = pool;
  return pool;
}

// Primer parcial de Biología 1: reutiliza el banco oficial ya incluido en data/index.json.
let primerParcialPool = null;

async function cargarPrimerParcial() {
  if (primerParcialPool) return primerParcialPool;
  const materia = S.indice.materias.find((m) => m.id === 'biologia-celular');
  const tema = materia?.temas.find((t) => /parcial completo.*banco de preguntas/i.test(t.nombre || ''));
  if (!materia || !tema) throw new Error('No se encontró el banco del Primer parcial de Biología 1.');
  const originales = await cargarTema(tema, materia);
  if (!originales.length) throw new Error('El banco original del Primer parcial está vacío.');
  if (Number.isInteger(tema.preguntas) && originales.length !== tema.preguntas) {
    throw new Error(`El banco original del Primer parcial declara ${tema.preguntas} preguntas, pero se cargaron ${originales.length}.`);
  }

  // Bancos adicionales independientes: se pueden retirar sin modificar el JSON original.
  const temasExtra = materia.temas.filter((t) => /adicional.*mix primer parcial/i.test(t.nombre || ''));
  const ids = new Set(originales.map((q) => q.id));
  const adicionales = [];
  for (const temaExtra of temasExtra) {
    const lote = await cargarTema(temaExtra, materia);
    if (lote.length !== temaExtra.preguntas) {
      throw new Error(`El banco adicional ${temaExtra.archivo} declara ${temaExtra.preguntas} preguntas, pero se cargaron ${lote.length}.`);
    }
    if (lote.some((q) => ids.has(q.id))) {
      throw new Error(`El banco adicional ${temaExtra.archivo} contiene identificadores repetidos con otro lote del Primer parcial.`);
    }
    for (const q of lote) ids.add(q.id);
    adicionales.push(...lote);
  }
  const pool = [...originales, ...adicionales];
  primerParcialPool = pool;
  return pool;
}

export async function lanzarPrimerParcial() {
  vistaCargando('Preparando el banco del Primer parcial…');
  try {
    const pool = await cargarPrimerParcial();
    empezarJuego(mezclar(pool), {
      titulo: 'Primer parcial · Biología 1',
      temaId: 'biologia-celular/15-tema-parcial-completo-convertido',
      estilo: 'parcial-limpio',
      ranking: false,
      materiaNombre: 'Biología 1',
      temaNombre: 'Primer parcial completo',
      repetir: () => lanzarPrimerParcial(),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

export async function lanzarSimulacroMixto() {
  vistaCargando('Armando el simulacro mixto…');
  try {
    const [primer, segundo] = await Promise.all([cargarPrimerParcial(), cargarSegundoParcial()]);
    if (primer.length < 20 || segundo.length < 20) {
      throw new Error('Cada parcial necesita al menos 20 preguntas para armar el simulacro.');
    }
    const seleccion = [
      ...mezclar(primer).slice(0, 20),
      ...mezclar(segundo).slice(0, 20),
    ];
    empezarJuego(mezclar(seleccion), {
      titulo: 'Simulacro mixto · Biología 1',
      temaId: null,
      estilo: 'parcial-limpio',
      ranking: false,
      materiaNombre: 'Biología 1',
      temaNombre: '20 preguntas del Primer parcial + 20 del Segundo parcial',
      repetir: () => lanzarSimulacroMixto(),
      volver: () => vistaInicio(),
    });
  } catch (e) {
    vistaError(e);
  }
}

export async function lanzarSegundoParcial() {
  let pool;
  try {
    pool = await cargarSegundoParcial();
  } catch (e) {
    console.warn('[Segundo parcial]', e);
    alert('No se pudieron cargar las preguntas del Segundo parcial. Probá de nuevo en un rato.');
    return;
  }
  if (!pool.length) {
    alert('Todavía no hay preguntas en el Segundo parcial.');
    return;
  }
  const meta = {
    titulo: 'Segundo parcial',
    temaId: SEGUNDO_PARCIAL_TEMA_ID,
    estilo: 'parcial-limpio',
    ranking: false,
    materiaNombre: 'Segundo parcial',
    temaNombre: 'Todos los temas',
    repetir: () => lanzarSegundoParcial(),
    volver: () => vistaInicio(),
  };
  // Cada partida incluye TODO el banco (no se descarta ninguna pregunta), pero ordenado así:
  //   1) primero las que nunca respondiste,
  //   2) después las que la última vez fallaste,
  //   3) al final las que la última vez acertaste.
  // Dentro de cada grupo el orden es aleatorio.
  empezarJuego(ordenInteligente(pool), meta);
}

function preguntasDeTemaSegundoParcial(pool, tema) {
  return pool.filter((q) => tema.patron.test(normalizarTerminoBanco(`${q.texto} ${q.explicacion || ''}`)));
}

const TEMAS_PRIMER_PARCIAL = [
  { id: 'virus', nombre: 'Virus, bacteriófagos, viroides y priones', icono: '🦠', descripcion: 'Estructura viral, ciclos de infección y agentes subvirales.', patron: /\b(virus|viriones?|bacteriofagos?|fagos?|capsides?|profagos?|lisogenia|lisogenicos?|liticos?|viroides?|priones?|retrovirus|hiv)\b/ },
  { id: 'membrana', nombre: 'Membranas y transporte', icono: '🫧', descripcion: 'Membrana plasmática, lípidos y transporte celular.', patron: /\b(membranas?|fosfolipidos?|glucolipidos?|colesterol|bicapas?|difusion|osmosis|transporte|canales? ionicos?|bombas?|endocitosis|exocitosis|fagocitosis|pinocitosis|permeabilidad|potencial de membrana|gradiente electroquimico|glucocalix|oligosacaridos|sodio|potasio|cftr)\b/ },
  { id: 'metabolismo', nombre: 'Metabolismo y energía', icono: '⚡', descripcion: 'Enzimas, reacciones metabólicas, respiración y fotosíntesis.', patron: /\b(metabolismo|atp|anabolicos?|catabolicos?|exergonicos?|endergonicos?|respiracion|glucolisis|krebs|cadena respiratoria|fosforilacion oxidativa|fermentacion|fotosintesis|cloroplastos?|tilacoides?|calvin|enzimas?|sustratos?|catalisis|km|vmax|inhibicion|retroinhibicion|redox|oxido.?reduccion|nadph|nadh|fadh2|coenzimas?|fotolisis|fotorrespiracion|energia libre|energia|zimogeno|pep carboxilasa|rubisco|anabolica|catabolica)\b/ },
  { id: 'biomoleculas', nombre: 'Biomoléculas y ácidos nucleicos', icono: '🧬', descripcion: 'Agua, glúcidos, lípidos, proteínas, nucleótidos y ADN/ARN.', patron: /\b(agua|glucidos?|carbohidratos?|monosacaridos?|disacaridos?|polisacaridos?|lactosa|sacarosa|almidon|glucogeno|celulosa|lipidos?|acidos grasos|trigliceridos?|triacilgliceroles?|proteinas?|aminoacidos?|peptidos?|nucleotidos?|nucleosidos?|acidos nucleicos|adn|arn|bases nitrogenadas|chargaff|fosfodiester|vitaminas?|enlaces covalentes|puentes de hidrogeno|esteroides?|colageno|fenilalanina|condensacion|hidrolisis|hidrofobicos?|anfipaticos?|buffers?|saponificable|ribosa|desoxirribosa)\b/ },
  { id: 'celula', nombre: 'Organización celular', icono: '🔬', descripcion: 'Células procariotas y eucariotas, organelas y niveles de organización.', patron: /\b(celulas?|celular|procariotas?|eucariotas?|procariontes?|eucariontes?|organismos pluricelulares|organizacion celular|organelas?|organelos?|nucleos?|nucleolos?|ribosomas?|citoesqueleto|centriolos?|pared celular|bacterias?|arqueas?|mitocondrias?|peroxisomas?|lisosomas?|reticulo|golgi|microtubulos?|microfilamentos?|filamentos intermedios|actina|tubulina|microscopios?|niveles? de organizacion|teoria celular|homeostasis|endosimbiosis|endosimbionte|endomembranas?|copii|srp|histona|carioteca|resolucion|reinos?|plantae|sistemas abiertos|organo)\b/ },
  { id: 'integracion', nombre: 'Integración y conceptos generales', icono: '🧩', descripcion: 'Preguntas integradoras y conceptos que atraviesan varios temas.', patron: null }
];

function clasificarPreguntaPrimerParcial(q) {
  const subtema = normalizarTerminoBanco(q.subtema || '');
  if (/^integracion\b/.test(subtema)) return 'integracion';

  // Los subtemas explícitos tienen prioridad sobre palabras sueltas del enunciado.
  for (const tema of TEMAS_PRIMER_PARCIAL) {
    if (tema.patron && tema.patron.test(subtema)) return tema.id;
  }

  // Para el banco original se analiza primero el enunciado y recién después
  // las opciones, evitando que un distractor decida por sí solo el tema.
  const enunciado = normalizarTerminoBanco(q.texto || q.pregunta || q.enunciado || '');
  for (const tema of TEMAS_PRIMER_PARCIAL) {
    if (tema.patron && tema.patron.test(enunciado)) return tema.id;
  }

  const opciones = normalizarTerminoBanco((q.opciones || []).join(' '));
  for (const tema of TEMAS_PRIMER_PARCIAL) {
    if (tema.patron && tema.patron.test(opciones)) return tema.id;
  }
  return 'integracion';
}

function preguntasDeTemaPrimerParcial(pool, tema) {
  return pool.filter((q) => clasificarPreguntaPrimerParcial(q) === tema.id);
}

export function vistaEstudioBiologiaPorParcial() {
  app.innerHTML = `
    <main class="pantalla estudio-sp">
      <button class="btn enlace" id="btn-volver-parciales-bio">← Inicio</button>
      <div class="titulo-materia"><span class="emoji" aria-hidden="true">🧬</span><h1>Estudiar por tema</h1></div>
      <p class="bajada">Elegí el parcial cuyos temas querés repasar.</p>
      <section class="estudio-sp-grid" aria-label="Parciales de Biología">
        <button class="estudio-sp-card" type="button" id="btn-temas-primer-parcial">
          <span class="estudio-sp-icono" aria-hidden="true">📘</span>
          <span class="estudio-sp-texto"><strong>Primer parcial</strong><small>Temas de Biología 1 · banco completo y preguntas adicionales</small></span>
          <span class="estudio-sp-flecha" aria-hidden="true">↗</span>
        </button>
        <button class="estudio-sp-card" type="button" id="btn-temas-segundo-parcial">
          <span class="estudio-sp-icono" aria-hidden="true">📗</span>
          <span class="estudio-sp-texto"><strong>Segundo parcial</strong><small>Núcleo, duplicación, expresión génica, división celular y más</small></span>
          <span class="estudio-sp-flecha" aria-hidden="true">↗</span>
        </button>
      </section>
    </main>`;
  document.getElementById('btn-volver-parciales-bio').addEventListener('click', () => { Sonido.clic(); vistaInicio(); });
  document.getElementById('btn-temas-primer-parcial').addEventListener('click', () => { Sonido.clic(); vistaEstudioPrimerParcial(); });
  document.getElementById('btn-temas-segundo-parcial').addEventListener('click', () => { Sonido.clic(); vistaEstudioSegundoParcial(); });
  window.scrollTo(0, 0);
}

function vistaEstudioPrimerParcial() {
  vistaCargando('Preparando los temas del Primer parcial…');
  cargarPrimerParcial().then((pool) => {
    const temas = TEMAS_PRIMER_PARCIAL.map((tema) => ({ ...tema, cantidad: preguntasDeTemaPrimerParcial(pool, tema).length }));
    app.innerHTML = `
      <main class="pantalla estudio-sp">
        <button class="btn enlace" id="btn-volver-temas-primer">← Parciales</button>
        <div class="titulo-materia"><span class="emoji" aria-hidden="true">📘</span><h1>Primer parcial por tema</h1></div>
        <p class="bajada">Elegí un tema para practicar sus preguntas. Se incluyen el banco original y los lotes adicionales.</p>
        <section class="estudio-sp-grid" aria-label="Temas del Primer parcial">
          ${temas.filter((tema) => tema.cantidad > 0).map((tema) => `
            <button class="estudio-sp-card" type="button" data-tema-p1="${tema.id}">
              <span class="estudio-sp-icono" aria-hidden="true">${tema.icono}</span>
              <span class="estudio-sp-texto"><strong>${tema.nombre}</strong><small>${tema.descripcion}</small><em>${tema.cantidad} preguntas</em></span>
              <span class="estudio-sp-flecha" aria-hidden="true">↗</span>
            </button>`).join('')}
        </section>
      </main>`;
    document.getElementById('btn-volver-temas-primer').addEventListener('click', () => { Sonido.clic(); vistaEstudioBiologiaPorParcial(); });
    app.querySelectorAll('[data-tema-p1]').forEach((boton) => boton.addEventListener('click', () => {
      Sonido.clic();
      const tema = TEMAS_PRIMER_PARCIAL.find((item) => item.id === boton.dataset.temaP1);
      if (tema) lanzarPrimerParcialPorTema(tema, pool);
    }));
    window.scrollTo(0, 0);
  }).catch((e) => {
    console.error('[Temas del Primer parcial]', e);
    vistaError(e);
  });
}

function lanzarPrimerParcialPorTema(tema, poolOriginal) {
  const pool = preguntasDeTemaPrimerParcial(poolOriginal, tema);
  if (!pool.length) {
    avisar(`Todavía no hay preguntas clasificadas en ${tema.nombre}.`);
    return;
  }
  empezarJuego(mezclar(pool), {
    titulo: `Primer parcial · ${tema.nombre}`,
    temaId: 'biologia-celular/15-tema-parcial-completo-convertido',
    estilo: 'parcial-limpio',
    ranking: false,
    materiaNombre: 'Biología 1',
    temaNombre: tema.nombre,
    repetir: () => lanzarPrimerParcialPorTema(tema, poolOriginal),
    volver: () => vistaEstudioPrimerParcial(),
  });
}

function vistaEstudioSegundoParcial() {
  vistaCargando('Preparando los temas…');
  cargarSegundoParcial().then((pool) => {
    const temas = TEMAS_SEGUNDO_PARCIAL.map((tema) => ({ ...tema, cantidad: preguntasDeTemaSegundoParcial(pool, tema).length }));
    app.innerHTML = `
      <main class="pantalla estudio-sp">
        <button class="btn enlace" id="btn-volver-temas-sp">← Parciales</button>
        <div class="titulo-materia"><span class="emoji" aria-hidden="true">🗂️</span><h1>Segundo parcial por tema</h1></div>
        <p class="bajada">Elegí un tema para practicar sus preguntas. También podés volver al recorrido completo cuando quieras.</p>
        <section class="estudio-sp-grid" aria-label="Temas del segundo parcial">
          ${temas.map((tema) => `
            <button class="estudio-sp-card" type="button" data-tema-sp="${tema.id}" ${tema.cantidad ? '' : 'disabled'}>
              <span class="estudio-sp-icono" aria-hidden="true">${tema.icono}</span>
              <span class="estudio-sp-texto"><strong>${tema.nombre}</strong><small>${tema.descripcion}</small><em>${tema.cantidad} preguntas</em></span>
              <span class="estudio-sp-flecha" aria-hidden="true">↗</span>
            </button>`).join('')}
        </section>
        <button class="sp-banco estudio-sp-banco" id="btn-banco-desde-temas" type="button"><span class="sp-banco-icono" aria-hidden="true">☷</span><span class="sp-banco-texto"><strong>Ver el banco completo</strong><small>Explorá las preguntas, opciones y respuestas</small></span><span class="sp-banco-flecha" aria-hidden="true">↗</span></button>
      </main>`;
    document.getElementById('btn-volver-temas-sp').addEventListener('click', () => { Sonido.clic(); vistaEstudioBiologiaPorParcial(); });
    document.getElementById('btn-banco-desde-temas').addEventListener('click', () => { Sonido.clic(); vistaBancoSegundoParcial(); });
    app.querySelectorAll('[data-tema-sp]').forEach((boton) => boton.addEventListener('click', () => {
      Sonido.clic();
      const tema = TEMAS_SEGUNDO_PARCIAL.find((item) => item.id === boton.dataset.temaSp);
      if (tema) lanzarSegundoParcialPorTema(tema, pool);
    }));
    window.scrollTo(0, 0);
  }).catch((e) => {
    console.error('[Temas del segundo parcial]', e);
    vistaError(e);
  });
}

function lanzarSegundoParcialPorTema(tema, poolOriginal) {
  const pool = preguntasDeTemaSegundoParcial(poolOriginal, tema);
  if (!pool.length) {
    avisar(`Todavía no hay preguntas clasificadas en ${tema.nombre}.`);
    return;
  }
  empezarJuego(ordenInteligente(pool), {
    titulo: `Segundo parcial · ${tema.nombre}`,
    temaId: SEGUNDO_PARCIAL_TEMA_ID,
    estilo: 'parcial-limpio',
    ranking: false,
    materiaNombre: 'Segundo parcial',
    temaNombre: tema.nombre,
    repetir: () => lanzarSegundoParcialPorTema(tema, poolOriginal),
    volver: () => vistaEstudioSegundoParcial(),
  });
}

function ordenInteligente(pool) {
  const vistas = estado.vistasSP || {};
  const grupos = [[], [], []];
  for (const q of pool) {
    const v = vistas[q.id];
    grupos[v === 2 ? 2 : v === 1 ? 1 : 0].push(q);
  }
  return grupos.flatMap((g) => mezclar(g));
}

// Normaliza tildes y mayúsculas para que la búsqueda por palabras sea flexible.
function normalizarTerminoBanco(valor) {
  return String(valor || '').toLocaleLowerCase('es')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function separarPalabrasBanco(valor) {
  return [...new Set(normalizarTerminoBanco(valor).split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean))];
}

function preguntasPorPalabras(pool, palabras) {
  return pool.filter((q) => {
    const contenido = normalizarTerminoBanco([
      q.texto, q.tema, ...(q.opciones || []), q.explicacion
    ].join(' '));
    // Con varias palabras se incluyen preguntas que coincidan con AL MENOS una.
    return palabras.some((palabra) => contenido.includes(palabra));
  });
}

async function lanzarBiologiaPorPalabras(entrada, incluirPrimer = true, incluirSegundo = true) {
  const palabras = separarPalabrasBanco(entrada);
  if (!palabras.length) {
    alert('Escribí al menos una palabra para preparar la práctica.');
    return;
  }
  if (!incluirPrimer && !incluirSegundo) {
    alert('Seleccioná al menos un parcial para buscar.');
    return;
  }
  let pool;
  try {
    const cargas = [];
    if (incluirPrimer) cargas.push(cargarPrimerParcial());
    if (incluirSegundo) cargas.push(cargarSegundoParcial());
    pool = (await Promise.all(cargas)).flat();
  } catch (e) {
    console.warn('[Práctica por palabras de Biología]', e);
    alert('No se pudieron cargar todos los bancos seleccionados. Probá de nuevo en un rato.');
    return;
  }
  const filtradas = preguntasPorPalabras(pool, palabras);
  if (!filtradas.length) {
    alert('No encontramos preguntas con esos términos en los parciales seleccionados.');
    return;
  }
  const etiqueta = palabras.join(', ');
  const parciales = [incluirPrimer ? 'Primer parcial' : '', incluirSegundo ? 'Segundo parcial' : ''].filter(Boolean);
  const origen = parciales.join(' + ');
  empezarJuego(mezclar(filtradas), {
    titulo: `${origen} · palabras clave`,
    temaId: null,
    estilo: 'parcial-limpio',
    ranking: false,
    materiaNombre: 'Biología 1',
    temaNombre: `${origen} · Palabras: ${etiqueta}`,
    repetir: () => lanzarBiologiaPorPalabras(entrada, incluirPrimer, incluirSegundo),
    volver: () => vistaBancoSegundoParcial(),
  });
}

// Compatibilidad con llamadas anteriores al buscador del Segundo parcial.
async function lanzarSegundoParcialPorPalabras(entrada) {
  return lanzarBiologiaPorPalabras(entrada, false, true);
}

// Vista de consulta: permite recorrer TODO el pool sin iniciar una partida.
export function vistaBancoSegundoParcial() {
  vistaCargando('Cargando el banco completo…');
  Promise.all([cargarSegundoParcial(), cargarPrimerParcial()]).then(([poolOriginal, poolPrimerParcial]) => {
    const pool = poolOriginal.map((q, i) => ({ ...q, numeroPool: i + 1 }));
    const archivos = [...new Set(pool.map((q) => q.archivoJson).filter(Boolean))].sort((x, y) =>
      Number(x.match(/(\d+)\.json$/)?.[1] || 0) - Number(y.match(/(\d+)\.json$/)?.[1] || 0));
    const porPagina = 25;
    let busqueda = '';
    let archivoElegido = '';
    let pagina = 0;

    const nombreArchivo = (ruta) => {
      const n = ruta?.match(/(\d+)\.json$/)?.[1];
      return n ? `Archivo ${n}` : 'Archivo de origen';
    };

    app.innerHTML = `
      <main class="pantalla banco-sp">
        <button class="btn enlace" id="btn-volver-banco">← Inicio</button>
        <div class="titulo-materia">
          <span class="emoji" aria-hidden="true">📚</span>
          <h1>Banco completo</h1>
        </div>
        <p class="bajada">Segundo parcial · consultá las preguntas sin iniciar una partida.</p>
        <section class="banco-sp-panel">
          <div class="banco-sp-resumen">
            <div><strong>${pool.length}</strong><span>preguntas en el pool</span></div>
            <div><strong>${archivos.length}</strong><span>archivos integrados</span></div>
          </div>
          <section class="banco-practica-palabras" aria-labelledby="banco-practica-titulo">
            <div class="banco-practica-cabecera">
              <span class="banco-practica-icono" aria-hidden="true">⌕</span>
              <div>
                <h2 id="banco-practica-titulo">Practicar por palabras clave</h2>
                <p>Escribí una o varias palabras y jugá con las preguntas relacionadas.</p>
              </div>
            </div>
            <div class="banco-practica-parciales" role="group" aria-label="Bancos donde buscar">
              <label><input id="banco-practica-p1" type="checkbox" checked> <span>Primer parcial <small>· ${poolPrimerParcial.length} preguntas</small></span></label>
              <label><input id="banco-practica-p2" type="checkbox" checked> <span>Segundo parcial <small>· ${pool.length} preguntas</small></span></label>
            </div>
            <label class="banco-sp-busqueda" for="banco-practica-input">
              <span>¿Qué querés practicar?</span>
              <input id="banco-practica-input" type="search" placeholder="Ej.: mitosis, meiosis, membrana, enzimas…" autocomplete="off">
            </label>
            <div class="banco-practica-ayuda">Separá las palabras con espacios o comas. Se incluirán preguntas que coincidan con cualquiera de ellas.</div>
            <div class="banco-practica-resultado" id="banco-practica-resultado" aria-live="polite">Escribí para ver cuántas preguntas coinciden.</div>
            <button class="btn banco-practica-iniciar" id="btn-practicar-palabras" type="button" disabled>Practicar estas preguntas →</button>
          </section>
          <label class="banco-sp-busqueda">
            <span>Buscar una pregunta en el banco</span>
            <input id="banco-buscar" type="search" placeholder="Escribí para filtrar la lista…" autocomplete="off">
          </label>
          <label class="banco-sp-filtro">
            <span>Filtrar por archivo de origen</span>
            <select id="banco-archivo">
              <option value="">Todos los archivos</option>
              ${archivos.map((ruta) => `<option value="${esc(ruta)}">${esc(nombreArchivo(ruta))}</option>`).join('')}
            </select>
          </label>
          <div class="banco-sp-estado" id="banco-estado" aria-live="polite"></div>
          <div class="banco-sp-lista" id="banco-lista"></div>
          <nav class="banco-sp-paginacion" id="banco-paginacion" aria-label="Páginas del banco"></nav>
        </section>
      </main>`;

    document.getElementById('btn-volver-banco').addEventListener('click', () => {
      Sonido.clic();
      vistaInicio();
    });
    const inputPractica = document.getElementById('banco-practica-input');
    const checkPrimer = document.getElementById('banco-practica-p1');
    const checkSegundo = document.getElementById('banco-practica-p2');
    const botonPractica = document.getElementById('btn-practicar-palabras');
    const resultadoPractica = document.getElementById('banco-practica-resultado');
    const actualizarCoincidencias = () => {
      const palabras = separarPalabrasBanco(inputPractica.value);
      const incluirPrimer = checkPrimer.checked;
      const incluirSegundo = checkSegundo.checked;
      const seleccion = [
        ...(incluirPrimer ? poolPrimerParcial : []),
        ...(incluirSegundo ? poolOriginal : []),
      ];
      const cantidad = palabras.length && (incluirPrimer || incluirSegundo)
        ? preguntasPorPalabras(seleccion, palabras).length : 0;
      resultadoPractica.textContent = !incluirPrimer && !incluirSegundo
        ? 'Seleccioná al menos un parcial.'
        : palabras.length
          ? (cantidad
            ? `${cantidad} pregunta${cantidad === 1 ? '' : 's'} coinciden en ${[incluirPrimer ? 'Primer parcial' : '', incluirSegundo ? 'Segundo parcial' : ''].filter(Boolean).join(' + ')}. Se incluyen coincidencias con cualquiera de las palabras.`
            : 'No encontramos coincidencias en los parciales seleccionados. Probá con otros términos.')
          : 'Escribí para ver cuántas preguntas coinciden.';
      botonPractica.disabled = cantidad === 0;
      botonPractica.textContent = cantidad
        ? `Practicar ${cantidad} pregunta${cantidad === 1 ? '' : 's'} →`
        : 'Practicar estas preguntas →';
    };
    inputPractica.addEventListener('input', actualizarCoincidencias);
    checkPrimer.addEventListener('change', actualizarCoincidencias);
    checkSegundo.addEventListener('change', actualizarCoincidencias);
    botonPractica.addEventListener('click', () => {
      Sonido.clic();
      lanzarBiologiaPorPalabras(inputPractica.value, checkPrimer.checked, checkSegundo.checked);
    });

    document.getElementById('banco-buscar').addEventListener('input', (e) => {
      busqueda = e.target.value.trim().toLocaleLowerCase('es');
      pagina = 0;
      pintar();
    });
    document.getElementById('banco-archivo').addEventListener('change', (e) => {
      archivoElegido = e.target.value;
      pagina = 0;
      pintar();
    });

    function pintar() {
      const filtradas = pool.filter((q) => {
        if (archivoElegido && q.archivoJson !== archivoElegido) return false;
        if (!busqueda) return true;
        const texto = [q.texto, q.tema, ...q.opciones, q.explicacion].join(' ').toLocaleLowerCase('es');
        return texto.includes(busqueda);
      });
      const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
      pagina = Math.min(pagina, totalPaginas - 1);
      const inicio = pagina * porPagina;
      const visibles = filtradas.slice(inicio, inicio + porPagina);
      const estadoEl = document.getElementById('banco-estado');
      const lista = document.getElementById('banco-lista');
      const nav = document.getElementById('banco-paginacion');

      estadoEl.textContent = filtradas.length
        ? `Mostrando ${inicio + 1}–${inicio + visibles.length} de ${filtradas.length} preguntas`
        : 'No hay preguntas que coincidan con la búsqueda.';
      lista.innerHTML = visibles.map((q) => `
        <article class="banco-pregunta">
          <div class="banco-pregunta-meta">
            <span>Pregunta ${q.numeroPool}</span>
            <span>${esc(nombreArchivo(q.archivoJson))} · ${esc(q.tema)}</span>
          </div>
          <h2>${esc(q.texto)}</h2>
          ${q.imagen ? `<figure class="banco-pregunta-imagen"><img src="${esc(q.imagen)}" alt="${esc(q.imagenAlt || 'Imagen de la pregunta')}" loading="lazy"></figure>` : ''}
          <ol class="banco-opciones">
            ${q.opciones.map((op, n) => `
              <li class="${n === q.correcta ? 'es-correcta' : ''}">
                <span>${LETRAS[n]}.</span><span>${esc(op)}</span>
                ${n === q.correcta ? '<b>Correcta</b>' : ''}
              </li>`).join('')}
          </ol>
          ${q.explicacion ? `<details class="banco-explicacion"><summary>Ver explicación</summary><p>${esc(q.explicacion)}</p></details>` : ''}
        </article>`).join('');

      nav.innerHTML = `
        <button class="btn secundario" id="banco-anterior" ${pagina === 0 ? 'disabled' : ''}>← Anterior</button>
        <span>Página ${pagina + 1} de ${totalPaginas}</span>
        <button class="btn secundario" id="banco-siguiente" ${pagina >= totalPaginas - 1 ? 'disabled' : ''}>Siguiente →</button>`;
      document.getElementById('banco-anterior').addEventListener('click', () => {
        pagina--;
        pintar();
        window.scrollTo(0, 0);
      });
      document.getElementById('banco-siguiente').addEventListener('click', () => {
        pagina++;
        pintar();
        window.scrollTo(0, 0);
      });
    }

    pintar();
    window.scrollTo(0, 0);
  }).catch((e) => {
    console.error('[Banco del segundo parcial]', e);
    vistaError(e);
  });
}
