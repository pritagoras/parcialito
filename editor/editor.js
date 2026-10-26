// ==========================================================
// editor.js: editor local de materias, temas y preguntas.
//
// Todo ocurre en tu navegador: no se sube nada a ningún lado.
// Lee la carpeta data/ del repo, te deja editar y después:
//   - escribe los cambios directo en la carpeta (Chrome / Edge), o
//   - descarga un ZIP con la carpeta data/ lista para pisar la del repo.
// Cada tema puede tener también tarjetas tipo Anki ("tarjetas": frente y dorso) para el repaso diario.
// Un tema también puede tener un crucigrama ("crucigrama": palabras con pistas); el tablero lo arma el juego.
// Las imágenes de las preguntas se recortan y se reducen en el navegador, y se guardan en data/img/.
// ==========================================================
'use strict';

(() => {
  // ---------- Utilidades ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const LETRAS = ['A', 'B', 'C', 'D'];
  const EMOJIS = ['📚', '🧬', '🔬', '🧪', '⚗️', '🧠', '🫀', '🦴', '💊', '🌱', '🌍', '📜', '⚖️', '🏛️', '💻', '📐', '➗', '📊', '💰', '🗣️', '🎨', '🎵', '⚽', '🩺'];
  const COLORES = ['#9B7BFF', '#FFB938', '#4FE0A0', '#FF7AA8', '#5CC8FF', '#FF8A5C'];
  const CLAVE_BORRADOR = 'repaso-editor:borrador:v1';
  const TIENE_API_CARPETAS = typeof window.showDirectoryPicker === 'function';

  let _n = 0;
  const uid = () => 'u' + (++_n);

  const slug = (s) =>
    String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sin-nombre';

  const mezclar = (lista) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let _temporizadorAviso = null;
  function avisar(texto) {
    const el = $('#aviso');
    el.textContent = texto;
    el.classList.add('visible');
    clearTimeout(_temporizadorAviso);
    _temporizadorAviso = setTimeout(() => el.classList.remove('visible'), 2600);
  }

  const debounce = (fn, ms) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  // ---------- Estado ----------
  const E = {
    materias: [],
    sel: { materia: null, tema: null },
    abiertas: new Set(),           // uids de preguntas desplegadas
    filtro: '',
    handle: null,                  // carpeta data/ con permiso de escritura (si se abrió con la API)
    base: { archivos: new Map(), crudos: new Map(), secuencia: '', indice: '' },
    analisis: { lista: [], conteo: new Map(), errores: 0, avisos: 0 },
    avisosCarga: [],
    imgs: new Map(),               // nombre de imagen -> Blob (para vista previa y para escribirla al guardar)
    imgNuevas: new Set(),          // imágenes cargadas acá que todavía no están en la carpeta del repo
    imgExistentes: new Set(),      // nombres que ya estaban en data/img/ al abrir la carpeta
    imgListadoOk: false,           // true si se pudo leer data/img/ (permite avisar de imágenes faltantes)
  };
  const PROB = new WeakMap();      // pregunta -> { errores, avisos }

  // ---------- Modelo ----------
  const nuevaPregunta = (o = {}) => ({
    uid: uid(), pregunta: '', opciones: ['', '', '', ''], correcta: '', explicacion: '', imagen: '', imagenAlt: '', extra: {}, ...o,
  });

  const nuevoTema = (o = {}) => ({
    uid: uid(), nombre: '', parte: '', extra: {}, preguntas: [], tarjetas: [], ...o,
  });

  const nuevaMateria = (o = {}) => ({
    uid: uid(), carpeta: '', nombre: '', emoji: '📚', color: '', orden: 0, extra: {},
    tieneMeta: false, ordenEnArchivo: undefined, nombreBase: '', temas: [], ...o,
  });

  const nuevaTarjeta = (o = {}) => ({ uid: uid(), frente: '', dorso: '', extra: {}, ...o });

  function tarjetaDesdeJSON(c) {
    const { frente, dorso, pregunta, respuesta, ...extra } = c;
    return nuevaTarjeta({ frente: String(frente ?? pregunta ?? ''), dorso: String(dorso ?? respuesta ?? ''), extra });
  }

  function preguntaDesdeJSON(p, avisos, ctx) {
    const { pregunta, opciones, correcta, explicacion, imagen, imagen_alt, ...extra } = p;
    const ops = Array.isArray(opciones) ? opciones.map((o) => String(o ?? '')) : [];
    if (ops.length > 4) avisos.push(`${ctx}: tenía ${ops.length} opciones; se conservaron las primeras 4.`);
    while (ops.length < 4) ops.push('');
    const c = String(correcta ?? '').trim().toUpperCase();
    return nuevaPregunta({
      pregunta: String(pregunta ?? ''),
      opciones: ops.slice(0, 4),
      correcta: LETRAS.includes(c) ? c : '',
      explicacion: String(explicacion ?? ''),
      imagen: String(imagen ?? '').trim(),
      imagenAlt: String(imagen_alt ?? ''),
      extra,
    });
  }

  // "data/img/archivo.webp" -> "archivo.webp" (null si no apunta a data/img/)
  const nombreImagen = (ruta) => {
    const m = /^data\/img\/([\w.%-]+)$/.exec(String(ruta || '').trim());
    return m ? m[1] : null;
  };

  // ---------- Validación (misma lógica que tools/validar.py) ----------
  const REF_LETRA = /\b(opci[oó]n|alternativa|inciso|respuesta)\s+[A-D]\b/i;
  const COMODINES = /\b(todas las anteriores|ninguna de las anteriores|ambas son correctas|a y b)\b/i;

  function validarPregunta(q) {
    const errores = [], avisos = [];
    if (!norm(q.pregunta)) errores.push('Falta el enunciado.');
    const vacias = q.opciones.map((o, i) => (norm(o) ? null : LETRAS[i])).filter(Boolean);
    if (vacias.length) errores.push(`Opciones vacías: ${vacias.join(', ')}.`);
    else {
      const ns = q.opciones.map(norm);
      if (new Set(ns).size < 4) errores.push('Hay opciones repetidas.');
      if (ns.some((o) => COMODINES.test(o))) avisos.push('Evitá opciones tipo "todas las anteriores": el juego mezcla el orden.');
    }
    if (!LETRAS.includes(q.correcta)) errores.push('Marcá cuál es la opción correcta.');
    if (!norm(q.explicacion)) avisos.push('No tiene explicación (se recomienda para estudiar).');
    else if (REF_LETRA.test(q.explicacion)) avisos.push('La explicación menciona una letra de opción; el juego mezcla el orden.');
    if (norm(q.imagen)) {
      const n = nombreImagen(q.imagen);
      if (!n && !/^https:\/\/\S+$/i.test(q.imagen.trim())) avisos.push('La ruta de la imagen no es válida: el juego no la va a mostrar (tiene que ser data/img/... o https://...).');
      else if (n && E.imgListadoOk && !E.imgExistentes.has(n) && !E.imgs.has(n)) avisos.push(`La imagen "${n}" no está en data/img/.`);
      if (!norm(q.imagenAlt)) avisos.push('La imagen no tiene descripción (sirve para accesibilidad).');
    }
    return { errores, avisos };
  }

  function validarTarjeta(c) {
    const errores = [], avisos = [];
    if (!norm(c.frente)) errores.push('Falta el frente.');
    if (!norm(c.dorso)) errores.push('Falta el dorso.');
    if (norm(c.frente).length > 280) avisos.push('El frente es largo: una tarjeta rinde más con una sola idea corta.');
    if (norm(c.dorso).length > 600) avisos.push('El dorso es muy largo; probá partirlo en varias tarjetas.');
    return { errores, avisos };
  }

  function analizar() {
    const lista = [], conteo = new Map();
    let errores = 0, avisos = 0;
    const sumar = (u, nivel) => {
      const c = conteo.get(u) || { e: 0, a: 0 };
      if (nivel === 'e') c.e++; else c.a++;
      conteo.set(u, c);
    };
    const reg = (nivel, m, t, q, texto) => {
      lista.push({ nivel, m: m.uid, t: t?.uid, q: q?.uid, texto, donde: `${m.nombre || 'Sin nombre'}${t ? ' › ' + (t.nombre || 'Sin nombre') : ''}` });
      if (nivel === 'e') errores++; else avisos++;
      sumar(m.uid, nivel);
      if (t) sumar(t.uid, nivel);
    };
    const carpetas = new Map();
    E.materias.forEach((m) => {
      if (!norm(m.nombre)) reg('e', m, null, null, 'La materia no tiene nombre.');
      if (carpetas.has(m.carpeta)) reg('e', m, null, null, `La carpeta "${m.carpeta}" está repetida.`);
      carpetas.set(m.carpeta, true);
      m.temas.forEach((t) => {
        if (!norm(t.nombre)) reg('e', m, t, null, 'El tema no tiene nombre.');
        if (!t.preguntas.length && !(t.tarjetas || []).length) reg('e', m, t, null, 'El tema no tiene preguntas ni tarjetas.');
        if (t.extra?.crucigrama !== undefined) {
          const nc = normalizarCrucigrama(t.extra.crucigrama);
          if (nc.error) reg('a', m, t, null, `Crucigrama: ${nc.error}`);
          else {
            if (nc.validas < 4) reg('a', m, t, null, `Crucigrama: tiene ${nc.validas} palabras válidas y hacen falta al menos 4.`);
            nc.filas.filter((f) => f.problemas.length).forEach((f) => reg('a', m, t, null, `Crucigrama, palabra ${f.n}: ${f.problemas.join(' ')}`));
            nc.filas.filter((f) => f.avisos.length).forEach((f) => reg('a', m, t, null, `Crucigrama, palabra ${f.n}: ${f.avisos.join(' ')}`));
          }
        }
        const vistas = new Map();
        t.preguntas.forEach((q, i) => {
          const r = validarPregunta(q);
          const clave = norm(q.pregunta);
          if (clave) {
            if (vistas.has(clave)) r.avisos.push(`Enunciado repetido (igual a la pregunta ${vistas.get(clave)}).`);
            else vistas.set(clave, i + 1);
          }
          PROB.set(q, r);
          r.errores.forEach((x) => reg('e', m, t, q, `Pregunta ${i + 1}: ${x}`));
          r.avisos.forEach((x) => reg('a', m, t, q, `Pregunta ${i + 1}: ${x}`));
        });
        const frentes = new Map();
        (t.tarjetas || []).forEach((c, i) => {
          const r = validarTarjeta(c);
          const clave = norm(c.frente);
          if (clave) {
            if (frentes.has(clave)) r.avisos.push(`Frente repetido (igual a la tarjeta ${frentes.get(clave)}).`);
            else frentes.set(clave, i + 1);
          }
          PROB.set(c, r);
          r.errores.forEach((x) => reg('e', m, t, c, `Tarjeta ${i + 1}: ${x}`));
          r.avisos.forEach((x) => reg('a', m, t, c, `Tarjeta ${i + 1}: ${x}`));
        });
      });
    });
    E.analisis = { lista, conteo, errores, avisos };
  }

  // ---------- Serialización (qué se escribe en cada archivo) ----------
  const J = (v) => JSON.stringify(v);

  function serializarPregunta(q) {
    const sangria = '      ';
    const lineasOps = q.opciones.map(J);
    const enLinea = `[${lineasOps.join(', ')}]`;
    const ops = enLinea.length <= 120
      ? enLinea
      : `[\n${lineasOps.map((l) => `${sangria}  ${l}`).join(',\n')}\n${sangria}]`;
    const campos = [
      `${sangria}"pregunta": ${J(q.pregunta)}`,
      `${sangria}"opciones": ${ops}`,
      `${sangria}"correcta": ${J(q.correcta)}`,
    ];
    if (norm(q.explicacion)) campos.push(`${sangria}"explicacion": ${J(q.explicacion)}`);
    if (norm(q.imagen)) campos.push(`${sangria}"imagen": ${J(q.imagen.trim())}`);
    if (norm(q.imagen) && norm(q.imagenAlt)) campos.push(`${sangria}"imagen_alt": ${J(q.imagenAlt.trim())}`);
    for (const [k, v] of Object.entries(q.extra || {})) campos.push(`${sangria}${J(k)}: ${J(v)}`);
    return `    {\n${campos.join(',\n')}\n    }`;
  }

  function serializarTarjeta(c) {
    const sangria = '      ';
    const campos = [`${sangria}"frente": ${J(c.frente)}`, `${sangria}"dorso": ${J(c.dorso)}`];
    for (const [k, v] of Object.entries(c.extra || {})) campos.push(`${sangria}${J(k)}: ${J(v)}`);
    return `    {\n${campos.join(',\n')}\n    }`;
  }

  function serializarTema(m, t) {
    const campos = [`  "materia": ${J(m.nombre)}`, `  "tema": ${J(t.nombre)}`];
    for (const [k, v] of Object.entries(t.extra || {})) campos.push(`  ${J(k)}: ${JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')}`);
    campos.push(`  "preguntas": [\n${t.preguntas.map(serializarPregunta).join(',\n')}\n  ]`);
    if (t.tarjetas?.length) campos.push(`  "tarjetas": [\n${t.tarjetas.map(serializarTarjeta).join(',\n')}\n  ]`);
    return `{\n${campos.join(',\n')}\n}\n`;
  }

  // "orden" se escribe solo si el archivo ya lo tenía o si cambió el orden/conjunto de materias
  function serializarMeta(m, forzar) {
    const o = { nombre: m.nombre, emoji: m.emoji };
    if (m.color) o.color = m.color;
    if (forzar || m.ordenEnArchivo !== undefined) o.orden = m.orden;
    Object.assign(o, m.extra || {});
    return JSON.stringify(o, null, 2) + '\n';
  }

  // El juego ignora el orden si no hay _materia.json con "orden"
  const metaNecesaria = (m, forzar) =>
    forzar || m.tieneMeta || m.emoji !== '📚' || !!m.color || norm(m.nombre) !== norm(m.nombreBase);

  function nombreArchivo(t, i) {
    return `${String(i + 1).padStart(2, '0')}-${t.parte}.json`;
  }

  // Asegura que cada tema tenga un "parte" de nombre único dentro de su materia
  function normalizarPartes(m) {
    const usadas = new Set();
    m.temas.forEach((t) => {
      let base = t.parte || slug(t.nombre);
      let p = base, n = 2;
      while (usadas.has(p)) p = `${base}-${n++}`;
      t.parte = p;
      usadas.add(p);
    });
  }

  function construirIndice() {
    return {
      materias: E.materias.map((m) => {
        const o = { id: m.carpeta, nombre: m.nombre, emoji: m.emoji };
        if (m.color) o.color = m.color;
        o.temas = m.temas.map((t, i) => {
          const archivo = nombreArchivo(t, i);
          return { id: `${m.carpeta}/${archivo.replace(/\.json$/, '')}`, nombre: t.nombre, archivo: `data/${m.carpeta}/${archivo}`, preguntas: t.preguntas.length, ...(t.tarjetas?.length ? { tarjetas: t.tarjetas.length } : {}) };
        });
        return o;
      }),
    };
  }

  // Mapa ruta (relativa a data/) -> texto, con todo lo que el editor administra
  function construirDestino() {
    const destino = new Map();
    const secuencia = E.materias.map((m) => m.carpeta).join('|');
    const forzar = secuencia !== E.base.secuencia;
    E.materias.forEach((m, mi) => {
      m.orden = mi + 1;
      normalizarPartes(m);
      if (metaNecesaria(m, forzar)) destino.set(`${m.carpeta}/_materia.json`, serializarMeta(m, forzar));
      m.temas.forEach((t, ti) => destino.set(`${m.carpeta}/${nombreArchivo(t, ti)}`, serializarTema(m, t)));
    });
    return destino;
  }

  function calcularPlan() {
    const destino = construirDestino();
    const indiceNuevo = construirIndice();
    const plan = { destino, nuevos: [], modificados: [], borrados: [], iguales: [], imagenes: [], indiceCambio: false, indiceNuevo };
    for (const [ruta, texto] of destino) {
      if (!E.base.archivos.has(ruta)) plan.nuevos.push(ruta);
      else if (E.base.archivos.get(ruta) !== texto) plan.modificados.push(ruta);
      else plan.iguales.push(ruta);
    }
    for (const ruta of E.base.archivos.keys()) if (!destino.has(ruta)) plan.borrados.push(ruta);
    plan.indiceCambio = JSON.stringify(indiceNuevo.materias) !== E.base.indice;
    // Imágenes nuevas que alguna pregunta usa de verdad (las que se descartaron no se escriben)
    const usadas = new Set();
    E.materias.forEach((m) => m.temas.forEach((t) => t.preguntas.forEach((q) => { const n = nombreImagen(q.imagen); if (n) usadas.add(n); })));
    plan.imagenes = [...E.imgNuevas].filter((n) => usadas.has(n) && E.imgs.has(n));
    return plan;
  }

  const cantidadCambios = (p) => p.nuevos.length + p.modificados.length + p.borrados.length + (p.imagenes?.length || 0);

  function releerOrdenesDeArchivos(archivos) {
    E.materias.forEach((m) => {
      let ord;
      try { ord = JSON.parse(archivos.get(`${m.carpeta}/_materia.json`) || 'null')?.orden; } catch { ord = undefined; }
      m.ordenEnArchivo = typeof ord === 'number' ? ord : undefined;
    });
  }

  // Congela como "lo que está en el repo" el conjunto de archivos indicado
  function fijarBase(archivos, crudos) {
    E.base.archivos = new Map(archivos);
    E.base.crudos = new Map(crudos);
    E.base.secuencia = E.materias.map((m) => m.carpeta).join('|');
    E.base.indice = JSON.stringify(construirIndice().materias);
    E.materias.forEach((m) => {
      const metaTexto = archivos.get(`${m.carpeta}/_materia.json`);
      m.tieneMeta = metaTexto !== undefined;
      m.nombreBase = m.nombre;
    });
    releerOrdenesDeArchivos(archivos);
  }

  // ---------- ZIP (sin compresión, sin librerías) ----------
  const TABLA_CRC = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = TABLA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function crearZip(archivos) {
    const enc = new TextEncoder();
    const partes = [], central = [];
    let offset = 0;
    const d = new Date();
    const hora = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const fecha = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const a of archivos) {
      const nombre = enc.encode(a.nombre), datos = a.bytes || enc.encode(a.texto), crc = crc32(datos);
      const loc = new DataView(new ArrayBuffer(30));
      loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true); loc.setUint16(8, 0, true);
      loc.setUint16(10, hora, true); loc.setUint16(12, fecha, true); loc.setUint32(14, crc, true);
      loc.setUint32(18, datos.length, true); loc.setUint32(22, datos.length, true);
      loc.setUint16(26, nombre.length, true); loc.setUint16(28, 0, true);
      partes.push(new Uint8Array(loc.buffer), nombre, datos);
      const cen = new DataView(new ArrayBuffer(46));
      cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true); cen.setUint16(10, 0, true);
      cen.setUint16(12, hora, true); cen.setUint16(14, fecha, true); cen.setUint32(16, crc, true);
      cen.setUint32(20, datos.length, true); cen.setUint32(24, datos.length, true); cen.setUint16(28, nombre.length, true);
      cen.setUint32(42, offset, true);
      central.push(new Uint8Array(cen.buffer), nombre);
      offset += 30 + nombre.length + datos.length;
    }
    const tamCentral = central.reduce((s, p) => s + p.length, 0);
    const fin = new DataView(new ArrayBuffer(22));
    fin.setUint32(0, 0x06054b50, true);
    fin.setUint16(8, archivos.length, true); fin.setUint16(10, archivos.length, true);
    fin.setUint32(12, tamCentral, true); fin.setUint32(16, offset, true);
    return new Blob([...partes, ...central, new Uint8Array(fin.buffer)], { type: 'application/zip' });
  }

  function descargar(nombre, blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  const marcaTiempo = () => {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  };

  // ---------- Carga de archivos ----------
  // mapa: ruta relativa a data/ ("materia/01-tema.json") -> texto
  function cargarArchivos(mapa) {
    const grupos = new Map();
    const problemas = [], avisos = [], gestionados = [];
    for (const [ruta, texto] of mapa) {
      const partes = ruta.split('/');
      if (partes.length !== 2) continue;
      const [carpeta, archivo] = partes;
      if (!archivo.toLowerCase().endsWith('.json') || carpeta.startsWith('.') || carpeta.startsWith('_')) continue;
      if (!grupos.has(carpeta)) grupos.set(carpeta, { meta: null, temas: [] });
      const g = grupos.get(carpeta);
      if (archivo === '_materia.json') {
        try { g.meta = JSON.parse(texto); gestionados.push(ruta); } catch (e) { problemas.push(`${ruta}: JSON inválido (${e.message}). No se tocó.`); }
      } else if (!archivo.startsWith('_')) {
        g.temas.push({ archivo, texto, ruta });
      }
    }

    const materias = [];
    for (const [carpeta, g] of grupos) {
      const temas = [];
      g.temas.sort((a, b) => a.archivo.localeCompare(b.archivo));
      for (const f of g.temas) {
        let datos;
        try { datos = JSON.parse(f.texto); } catch (e) { problemas.push(`${f.ruta}: JSON inválido (${e.message}). No se tocó.`); continue; }
        if (!datos || typeof datos !== 'object' || !Array.isArray(datos.preguntas)) {
          problemas.push(`${f.ruta}: no tiene una lista "preguntas". No se tocó.`);
          continue;
        }
        gestionados.push(f.ruta);
        const { materia, tema, preguntas, tarjetas, ...extra } = datos;
        const qs = [];
        preguntas.forEach((p, i) => {
          if (!p || typeof p !== 'object') { avisos.push(`${f.ruta}: la pregunta ${i + 1} no es un objeto; se omitió.`); return; }
          qs.push(preguntaDesdeJSON(p, avisos, `${f.ruta}, pregunta ${i + 1}`));
        });
        const ts = [];
        if (Array.isArray(tarjetas)) {
          tarjetas.forEach((c, i) => {
            if (!c || typeof c !== 'object') { avisos.push(`${f.ruta}: la tarjeta ${i + 1} no es un objeto; se omitió.`); return; }
            ts.push(tarjetaDesdeJSON(c));
          });
        } else if (tarjetas !== undefined) extra.tarjetas = tarjetas;   // formato raro: se conserva tal cual
        const parte = f.archivo.replace(/\.json$/i, '').replace(/^\d+[-_ ]*/, '');
        temas.push(nuevoTema({ nombre: String(tema ?? ''), parte: slug(parte), extra, preguntas: qs, tarjetas: ts, materiaCampo: String(materia ?? '') }));
      }
      if (!temas.length && !g.meta) continue;
      const meta = g.meta && typeof g.meta === 'object' ? g.meta : {};
      const { nombre, emoji, color, orden, ...extraMeta } = meta;
      const nombreBase = String(nombre || temas[0]?.materiaCampo || carpeta);
      materias.push(nuevaMateria({
        carpeta, nombre: nombreBase, nombreBase,
        emoji: emoji || '📚', color: /^#[0-9a-f]{6}$/i.test(color || '') ? color : '',
        orden: typeof orden === 'number' ? orden : 9999,
        ordenEnArchivo: typeof orden === 'number' ? orden : undefined,
        extra: extraMeta, tieneMeta: !!g.meta, temas,
      }));
    }
    materias.sort((a, b) => a.orden - b.orden || a.carpeta.localeCompare(b.carpeta));

    E.materias = materias;
    E.sel = { materia: materias[0]?.uid ?? null, tema: null };
    E.abiertas = new Set();
    E.filtro = '';
    E.avisosCarga = [...problemas, ...avisos];

    // Lo que acaba de leerse es, por definición, lo que hay en el repo.
    // Solo cuentan como "existentes" los archivos que realmente estaban en disco.
    E.base.secuencia = materias.map((m) => m.carpeta).join('|');
    const destino = construirDestino();
    const existentes = new Map();
    for (const [ruta, texto] of destino) if (mapa.has(ruta)) existentes.set(ruta, texto);
    // Archivos leídos que el editor va a reemplazar por otro nombre: figuran como "a borrar"
    for (const ruta of gestionados) if (!destino.has(ruta)) existentes.set(ruta, mapa.get(ruta));
    const crudos = new Map();
    for (const ruta of existentes.keys()) crudos.set(ruta, mapa.get(ruta));
    fijarBase(existentes, crudos);
    // El índice original se compara ignorando "generado"
    try {
      const idx = JSON.parse(mapa.get('index.json') || 'null');
      if (idx && Array.isArray(idx.materias)) E.base.indice = JSON.stringify(idx.materias);
    } catch { /* se regenera igual */ }
  }

  // Elige la carpeta data/ a partir de lo que el usuario seleccionó
  async function resolverDataDir(handle) {
    try { return await handle.getDirectoryHandle('data'); } catch { /* no hay subcarpeta data */ }
    if (handle.name === 'data') return handle;
    if (window.confirm(`No encontré la carpeta "data" dentro de "${handle.name}".\n\n¿Querés que la cree ahí? (Cancelar = usar "${handle.name}" como si fuera data)`)) {
      return handle.getDirectoryHandle('data', { create: true });
    }
    return handle;
  }

  async function leerDesdeHandle(dataDir) {
    const mapa = new Map();
    for await (const [nombre, h] of dataDir.entries()) {
      if (h.kind === 'file' && nombre === 'index.json') {
        mapa.set('index.json', await (await h.getFile()).text());
      } else if (h.kind === 'directory' && !nombre.startsWith('.')) {
        for await (const [archivo, fh] of h.entries()) {
          if (fh.kind === 'file' && archivo.toLowerCase().endsWith('.json')) {
            mapa.set(`${nombre}/${archivo}`, await (await fh.getFile()).text());
          }
        }
      }
    }
    return mapa;
  }

  async function leerDesdeInput(files) {
    const mapa = new Map();
    for (const f of files) {
      const partes = (f.webkitRelativePath || f.name).split('/');
      let rel = null;
      for (let i = 0; i < partes.length; i++) {
        const restantes = partes.length - i - 1;
        if (partes[i] === 'data' && (restantes === 1 || restantes === 2)) { rel = partes.slice(i + 1).join('/'); break; }
      }
      if (rel && rel.toLowerCase().endsWith('.json')) mapa.set(rel, await f.text());
    }
    return mapa;
  }

  // ---------- Imágenes de las preguntas (data/img/) ----------
  const MAX_LADO = 1200;   // px del lado más largo: alcanza para estudiar y pesa poco

  function reiniciarImagenes(listadoOk = false, existentes = new Set(), blobs = new Map()) {
    E.imgListadoOk = listadoOk;
    E.imgExistentes = existentes;
    E.imgs = blobs;
    E.imgNuevas = new Set();
  }

  async function listarImagenes(dataDir) {
    const nombres = new Set();
    try {
      const d = await dataDir.getDirectoryHandle('img');
      for await (const [n, h] of d.entries()) if (h.kind === 'file') nombres.add(n);
    } catch { /* todavía no hay carpeta img */ }
    return nombres;
  }

  function leerImagenesDesdeInput(files) {
    const nombres = new Set(), blobs = new Map();
    for (const f of files) {
      const p = (f.webkitRelativePath || '').split('/');
      for (let i = 0; i < p.length; i++) {
        if (p[i] === 'data' && p[i + 1] === 'img' && p.length === i + 3) { nombres.add(p[i + 2]); blobs.set(p[i + 2], f); break; }
      }
    }
    reiniciarImagenes(true, nombres, blobs);
  }

  // Pasa el lienzo ya recortado a WebP (o JPEG si el navegador no lo soporta).
  // El nombre sale del contenido: la misma imagen siempre tiene el mismo nombre y no se duplica.
  async function codificarImagen(lienzo) {
    let blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/webp', 0.85));
    if (!blob || blob.type !== 'image/webp') {
      const c = document.createElement('canvas');
      c.width = lienzo.width; c.height = lienzo.height;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);   // JPEG no tiene transparencia
      x.drawImage(lienzo, 0, 0);
      blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.88));
    }
    if (!blob) throw new Error('El navegador no pudo convertir la imagen.');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const nombre = `p-${crc32(bytes).toString(16).padStart(8, '0')}-${bytes.length.toString(36)}.${ext}`;
    return { blob, nombre };
  }

  // ---------- Recorte de la imagen antes de usarla ----------
  const LIMITE_BASE = 4096;   // las fotos enormes se achican un poco antes de editarlas (cuidan la memoria)

  // Abre el recortador. Devuelve un <canvas> con el resultado final (ya a tamaño de salida) o null si se cancela.
  async function abrirRecorte(archivo) {
    const bmp = await createImageBitmap(archivo);
    let base = document.createElement('canvas');
    const e0 = Math.min(1, LIMITE_BASE / Math.max(bmp.width, bmp.height));
    base.width = Math.max(1, Math.round(bmp.width * e0));
    base.height = Math.max(1, Math.round(bmp.height * e0));
    base.getContext('2d').drawImage(bmp, 0, 0, base.width, base.height);
    bmp.close?.();

    return new Promise((resolver) => {
      const RATIOS = [['libre', 'Libre', null], ['toda', 'Toda', null], ['16:9', '16:9', 16 / 9], ['4:3', '4:3', 4 / 3], ['1:1', '1:1', 1]];
      const d = abrirModal('Recortar imagen', `
        <div class="rec-barra">
          <span class="rotulo">Proporción</span>
          ${RATIOS.map(([c, txt]) => `<button class="btn chico ${c === 'libre' ? 'activo' : ''}" data-r="${c}" type="button">${txt}</button>`).join('')}
          <span class="rec-sep"></span>
          <button class="btn chico" id="rec-izq" type="button" aria-label="Girar a la izquierda">↶ Girar</button>
          <button class="btn chico" id="rec-der" type="button" aria-label="Girar a la derecha">Girar ↷</button>
        </div>
        <div class="rec-escena"><canvas id="rec-canvas" aria-label="Imagen a recortar"></canvas></div>
        <p class="pista">Arrastrá el recuadro para moverlo, y las esquinas o los bordes para cambiarle el tamaño. Si arrastrás fuera del recuadro, dibujás uno nuevo.</p>
        <span class="rotulo">Así va a quedar</span>
        <div class="rec-prev"><canvas id="rec-prev"></canvas></div>
        <p class="pista" id="rec-info"></p>`,
        '<button class="btn" id="rec-cancelar" type="button">Cancelar</button><button class="btn primario" id="rec-ok" type="button">Usar esta imagen</button>');

      const canvas = $('#rec-canvas', d), ctx = canvas.getContext('2d');
      const prev = $('#rec-prev', d), info = $('#rec-info', d);
      const MIN = 24, ASA = 14;
      const CURSOR = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize' };
      const dpr = window.devicePixelRatio || 1;
      const limitar = (v, a, b) => Math.min(Math.max(v, a), b);
      let dw = 0, dh = 0;            // tamaño del lienzo en pantalla
      let rect = null;               // recuadro de recorte, en coordenadas de pantalla
      let ratio = null;              // proporción fija (ancho/alto) o null si es libre
      let arrastre = null;
      let aceptado = false;

      function ajustarVista() {
        const disp = Math.max(240, $('.rec-escena', d).clientWidth - 24);
        const k = Math.min(disp / base.width, (window.innerHeight * 0.42) / base.height, 1);
        dw = Math.max(1, Math.round(base.width * k));
        dh = Math.max(1, Math.round(base.height * k));
        canvas.width = Math.round(dw * dpr); canvas.height = Math.round(dh * dpr);
        canvas.style.width = `${dw}px`; canvas.style.height = `${dh}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const rectCompleto = () => ({ x: 0, y: 0, w: dw, h: dh });
      function rectRatio(r) {   // el recuadro más grande de esa proporción, centrado
        let w, h;
        if (dw / dh > r) { h = dh; w = dh * r; } else { w = dw; h = dw / r; }
        return { x: (dw - w) / 2, y: (dh - h) / 2, w, h };
      }

      function asas() {   // con proporción fija solo se usan las esquinas
        const { x, y, w, h } = rect;
        const lista = [['nw', x, y], ['ne', x + w, y], ['sw', x, y + h], ['se', x + w, y + h]];
        if (!ratio) lista.push(['n', x + w / 2, y], ['s', x + w / 2, y + h], ['w', x, y + h / 2], ['e', x + w, y + h / 2]);
        return lista;
      }
      const posicion = (e) => {
        const b = canvas.getBoundingClientRect();
        return { x: limitar((e.clientX - b.left) * dw / b.width, 0, dw), y: limitar((e.clientY - b.top) * dh / b.height, 0, dh) };
      };
      const asaEn = (p) => (asas().find(([, ax, ay]) => Math.abs(p.x - ax) <= ASA && Math.abs(p.y - ay) <= ASA) || [])[0] || null;
      const dentro = (p) => p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h;

      // Recuadro que crece desde un punto fijo (ax, ay) hacia la dirección (sx, sy)
      function desdeAncla(ax, ay, sx, sy, dx, dy) {
        const maxW = sx > 0 ? dw - ax : ax, maxH = sy > 0 ? dh - ay : ay;
        let w = dx, h = dy;
        if (ratio) {
          if (w / h > ratio) w = h * ratio; else h = w / ratio;
          const f = Math.min(1, maxW / w, maxH / h);
          w *= f; h *= f;
        } else { w = Math.min(w, maxW); h = Math.min(h, maxH); }
        return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h };
      }

      function dibujar() {
        ctx.clearRect(0, 0, dw, dh);
        ctx.drawImage(base, 0, 0, dw, dh);
        ctx.fillStyle = 'rgba(10, 5, 25, .62)';   // oscurece lo que queda afuera
        ctx.beginPath(); ctx.rect(0, 0, dw, dh); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.fill('evenodd');
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255, 243, 220, .35)';   // regla de tercios
        ctx.beginPath();
        for (let i = 1; i < 3; i++) {
          ctx.moveTo(rect.x + rect.w * i / 3, rect.y); ctx.lineTo(rect.x + rect.w * i / 3, rect.y + rect.h);
          ctx.moveTo(rect.x, rect.y + rect.h * i / 3); ctx.lineTo(rect.x + rect.w, rect.y + rect.h * i / 3);
        }
        ctx.stroke();
        ctx.lineWidth = 2; ctx.strokeStyle = '#FFF3DC';
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        for (const [, ax, ay] of asas()) { ctx.fillStyle = '#9B7BFF'; ctx.fillRect(ax - 6, ay - 6, 12, 12); ctx.strokeRect(ax - 6, ay - 6, 12, 12); }
      }

      // Lo que realmente se va a guardar: el recorte, a lo sumo MAX_LADO px del lado más largo
      function lienzoSalida() {
        const kx = base.width / dw, ky = base.height / dh;
        const sx = rect.x * kx, sy = rect.y * ky, sw = rect.w * kx, sh = rect.h * ky;
        const esc = Math.min(1, MAX_LADO / Math.max(sw, sh));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw * esc)); c.height = Math.max(1, Math.round(sh * esc));
        c.getContext('2d').drawImage(base, sx, sy, sw, sh, 0, 0, c.width, c.height);
        return c;
      }

      let temporizadorTam = null;
      function refrescarRecorte() {
        dibujar();
        const c = lienzoSalida();
        const k = Math.min(1, 520 / c.width, 150 / c.height);
        prev.width = Math.max(1, Math.round(c.width * k)); prev.height = Math.max(1, Math.round(c.height * k));
        prev.getContext('2d').drawImage(c, 0, 0, prev.width, prev.height);
        const nota = c.height / c.width > 1.2
          ? ' En el juego se ve entera, pero las imágenes muy altas se achican para entrar en pantalla.'
          : ' En el juego se ve entera, sin recortes extra.';
        info.textContent = `Tamaño final: ${c.width} × ${c.height} px.${nota}`;
        clearTimeout(temporizadorTam);
        temporizadorTam = setTimeout(() => c.toBlob((b) => {
          if (b && d.open) info.textContent = `Tamaño final: ${c.width} × ${c.height} px (unos ${Math.max(1, Math.round(b.size / 1024))} KB).${nota}`;
        }, 'image/webp', 0.85), 300);
      }
      let cuadroPedido = false;
      const pedirRefresco = () => {
        if (cuadroPedido) return;
        cuadroPedido = true;
        requestAnimationFrame(() => { cuadroPedido = false; if (d.open) refrescarRecorte(); });
      };

      canvas.addEventListener('pointerdown', (e) => {
        const p = posicion(e);
        const a = asaEn(p);
        canvas.setPointerCapture(e.pointerId);
        if (a) arrastre = { modo: 'asa', a, r0: { ...rect } };
        else if (dentro(p)) arrastre = { modo: 'mover', dx: p.x - rect.x, dy: p.y - rect.y };
        else arrastre = { modo: 'nuevo', ax: p.x, ay: p.y, activo: false };
        e.preventDefault();
      });
      canvas.addEventListener('pointermove', (e) => {
        const p = posicion(e);
        if (!arrastre) { const a = asaEn(p); canvas.style.cursor = a ? CURSOR[a] : dentro(p) ? 'move' : 'crosshair'; return; }
        if (arrastre.modo === 'mover') {
          rect = { ...rect, x: limitar(p.x - arrastre.dx, 0, dw - rect.w), y: limitar(p.y - arrastre.dy, 0, dh - rect.h) };
        } else if (arrastre.modo === 'asa') {
          const { a, r0 } = arrastre;
          if (a.length === 2) {   // esquina: el punto opuesto queda fijo
            const sx = a.includes('w') ? -1 : 1, sy = a.includes('n') ? -1 : 1;
            const ax = sx > 0 ? r0.x : r0.x + r0.w, ay = sy > 0 ? r0.y : r0.y + r0.h;
            rect = desdeAncla(ax, ay, sx, sy, Math.max(MIN, (p.x - ax) * sx), Math.max(MIN, (p.y - ay) * sy));
          } else {                // borde (solo en modo libre)
            let x1 = r0.x, y1 = r0.y, x2 = r0.x + r0.w, y2 = r0.y + r0.h;
            if (a === 'w') x1 = Math.min(p.x, x2 - MIN);
            if (a === 'e') x2 = Math.max(p.x, x1 + MIN);
            if (a === 'n') y1 = Math.min(p.y, y2 - MIN);
            if (a === 's') y2 = Math.max(p.y, y1 + MIN);
            rect = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
          }
        } else {                  // recuadro nuevo (solo si realmente se arrastró)
          if (!arrastre.activo && Math.hypot(p.x - arrastre.ax, p.y - arrastre.ay) < 6) return;
          arrastre.activo = true;
          const sx = p.x >= arrastre.ax ? 1 : -1, sy = p.y >= arrastre.ay ? 1 : -1;
          rect = desdeAncla(arrastre.ax, arrastre.ay, sx, sy, Math.max(MIN, Math.abs(p.x - arrastre.ax)), Math.max(MIN, Math.abs(p.y - arrastre.ay)));
        }
        pedirRefresco();
      });
      const soltar = () => { arrastre = null; };
      canvas.addEventListener('pointerup', soltar);
      canvas.addEventListener('pointercancel', soltar);
      canvas.addEventListener('click', (e) => e.stopPropagation());

      $$('[data-r]', d).forEach((b) => b.addEventListener('click', () => {
        const [clave, , r] = RATIOS.find(([c]) => c === b.dataset.r);
        $$('[data-r]', d).forEach((x) => x.classList.toggle('activo', x === b));
        if (clave === 'libre') ratio = null;
        else if (clave === 'toda') { ratio = null; rect = rectCompleto(); }
        else { ratio = r; rect = rectRatio(r); }
        refrescarRecorte();
      }));

      function girar(sentido) {
        const n = document.createElement('canvas');
        n.width = base.height; n.height = base.width;
        const x = n.getContext('2d');
        x.translate(n.width / 2, n.height / 2);
        x.rotate(sentido * Math.PI / 2);
        x.drawImage(base, -base.width / 2, -base.height / 2);
        base = n;
        ajustarVista();
        rect = ratio ? rectRatio(ratio) : rectCompleto();
        refrescarRecorte();
      }
      $('#rec-izq', d).onclick = () => girar(-1);
      $('#rec-der', d).onclick = () => girar(1);

      $('#rec-cancelar', d).onclick = cerrarModal;
      $('#rec-ok', d).onclick = () => { aceptado = true; const c = lienzoSalida(); cerrarModal(); resolver(c); };
      d.addEventListener('close', () => { if (!aceptado) resolver(null); }, { once: true });

      ajustarVista();
      rect = rectCompleto();
      refrescarRecorte();
    });
  }

  const urlsImagen = new Map();   // nombre -> URL temporal para la vista previa
  async function urlDeImagen(nombre) {
    if (urlsImagen.has(nombre)) return urlsImagen.get(nombre);
    let blob = E.imgs.get(nombre) || null;
    if (!blob && E.handle) {
      try { blob = await (await (await E.handle.getDirectoryHandle('img')).getFileHandle(nombre)).getFile(); } catch { blob = null; }
    }
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    urlsImagen.set(nombre, url);
    return url;
  }

  // ---------- Escritura en la carpeta (Chrome / Edge) ----------
  async function dirDe(raiz, partes, crear) {
    let d = raiz;
    for (const p of partes) d = await d.getDirectoryHandle(p, { create: crear });
    return d;
  }

  // contenido: texto o Blob (las imágenes)
  async function escribirArchivo(raiz, ruta, contenido) {
    const partes = ruta.split('/');
    const nombre = partes.pop();
    const dir = await dirDe(raiz, partes, true);
    const fh = await dir.getFileHandle(nombre, { create: true });
    const w = await fh.createWritable();
    await w.write(contenido);
    await w.close();
  }

  async function borrarArchivo(raiz, ruta) {
    const partes = ruta.split('/');
    const nombre = partes.pop();
    try {
      const dir = await dirDe(raiz, partes, false);
      await dir.removeEntry(nombre);
      if (partes.length) { // si la carpeta quedó vacía, se borra
        try { const padre = await dirDe(raiz, partes.slice(0, -1), false); await padre.removeEntry(partes[partes.length - 1]); } catch { /* no estaba vacía */ }
      }
    } catch { /* ya no existía */ }
  }

  async function elegirCarpetaEscritura() {
    const h = await window.showDirectoryPicker({ mode: 'readwrite' });
    E.handle = await resolverDataDir(h);
    return E.handle;
  }

  async function asegurarPermiso(handle) {
    const opts = { mode: 'readwrite' };
    if ((await handle.queryPermission(opts)) === 'granted') return true;
    return (await handle.requestPermission(opts)) === 'granted';
  }

  // ==========================================================
  //  INTERFAZ
  // ==========================================================

  const mat = (id) => E.materias.find((m) => m.uid === id) || null;
  const matActual = () => mat(E.sel.materia);
  const temaActual = () => matActual()?.temas.find((t) => t.uid === E.sel.tema) || null;
  function ubicarTema(tid) {
    for (const m of E.materias) { const t = m.temas.find((x) => x.uid === tid); if (t) return [m, t]; }
    return [null, null];
  }
  const totalPreguntas = (m) => m.temas.reduce((s, t) => s + t.preguntas.length, 0);
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  function crearMateria(nombre) {
    const base = slug(nombre);
    let carpeta = base, n = 2;
    while (E.materias.some((m) => m.carpeta === carpeta)) carpeta = `${base}-${n++}`;
    const m = nuevaMateria({ carpeta, nombre, nombreBase: '' });
    E.materias.push(m);
    return m;
  }

  function crearTema(m, nombre) {
    const t = nuevoTema({ nombre, parte: slug(nombre) });
    m.temas.push(t);
    normalizarPartes(m);
    return t;
  }

  // ---------- Estado, borrador y avisos ----------
  function renderEstado() {
    const plan = calcularPlan();
    E.plan = plan;
    const n = cantidadCambios(plan);
    const chip = $('#estado');
    const sucio = n > 0 || (plan.indiceCambio && E.materias.length > 0);
    chip.textContent = n > 0 ? `${plural(n, 'archivo', 'archivos')} con cambios` : (sucio ? 'Índice por actualizar' : 'Sin cambios');
    chip.classList.toggle('sucio', sucio);
    const b = $('#n-prob');
    const { errores, avisos } = E.analisis;
    b.hidden = !(errores || avisos);
    b.textContent = errores || avisos;
    b.classList.toggle('aviso', !errores);
    b.title = errores ? `${plural(errores, 'error', 'errores')}` : `${plural(avisos, 'aviso', 'avisos')}`;
  }

  const hayCambios = () => !!E.plan && (cantidadCambios(E.plan) > 0 || (E.plan.indiceCambio && E.materias.length > 0));

  function escribirBorrador() {
    try {
      if (!hayCambios()) { localStorage.removeItem(CLAVE_BORRADOR); return; }
      localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({
        t: Date.now(),
        materias: E.materias,
        base: { archivos: [...E.base.archivos], crudos: [...E.base.crudos], secuencia: E.base.secuencia, indice: E.base.indice },
      }));
    } catch { /* sin espacio o bloqueado: no pasa nada */ }
  }
  const guardarBorrador = debounce(escribirBorrador, 500);
  // Al cerrar, recargar o cambiar de pestaña se guarda enseguida, sin esperar al retardo
  window.addEventListener('pagehide', escribirBorrador);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') escribirBorrador(); });

  function ajustarContador() {
    let max = _n;
    const ver = (x) => { const k = Number(String(x.uid).slice(1)); if (k > max) max = k; };
    E.materias.forEach((m) => { ver(m); m.temas.forEach((t) => { ver(t); t.preguntas.forEach(ver); (t.tarjetas || []).forEach(ver); }); });
    _n = max;
  }

  function revisarBorrador() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(CLAVE_BORRADOR)); } catch { d = null; }
    if (!d || !Array.isArray(d.materias) || !d.base) return;
    const b = $('#banner');
    b.hidden = false;
    b.innerHTML = `<span>Hay un borrador sin guardar del ${esc(new Date(d.t).toLocaleString('es-AR'))} (${plural(d.materias.length, 'materia', 'materias')}).</span>
      <button class="btn chico primario" id="bn-rest">Restaurar</button><button class="btn chico" id="bn-desc">Descartar</button>`;
    $('#bn-rest').onclick = () => {
      E.materias = d.materias;
      E.materias.forEach((m) => m.temas.forEach((t) => { t.tarjetas ||= []; }));
      E.base = { archivos: new Map(d.base.archivos), crudos: new Map(d.base.crudos), secuencia: d.base.secuencia, indice: d.base.indice };
      E.handle = null;
      reiniciarImagenes(false);
      releerOrdenesDeArchivos(E.base.archivos);
      ajustarContador();
      E.sel = { materia: E.materias[0]?.uid ?? null, tema: null };
      b.hidden = true;
      pintarTodo();
      const conImagenes = E.materias.some((m) => m.temas.some((t) => t.preguntas.some((q) => nombreImagen(q.imagen))));
      avisar(conImagenes ? 'Borrador restaurado. Si habías cargado imágenes nuevas sin guardar, volvé a elegirlas.' : 'Borrador restaurado');
    };
    $('#bn-desc').onclick = () => { try { localStorage.removeItem(CLAVE_BORRADOR); } catch { /* nada */ } b.hidden = true; };
  }

  window.addEventListener('beforeunload', (e) => {
    if (hayCambios()) { escribirBorrador(); e.preventDefault(); e.returnValue = ''; }
  });

  // ---------- Modal ----------
  function abrirModal(titulo, cuerpo, pie = '') {
    const d = $('#modal');
    d.innerHTML = `<form method="dialog" class="m-cab"><h2>${esc(titulo)}</h2><button class="icono" aria-label="Cerrar">✕</button></form>
      <div class="m-cuerpo">${cuerpo}</div><div class="m-pie">${pie}</div>`;
    if (!d.open) d.showModal();
    return d;
  }
  const cerrarModal = () => { const d = $('#modal'); if (d.open) d.close(); };
  $('#modal').addEventListener('click', (e) => { if (e.target === e.currentTarget) cerrarModal(); });

  // ---------- Lateral ----------
  function renderLateral() {
    const c = E.analisis.conteo;
    const punto = (u) => {
      const x = c.get(u);
      return x?.e ? '<span class="punto err" title="Tiene errores"></span>' : x?.a ? '<span class="punto avi" title="Tiene avisos"></span>' : '';
    };
    $('#lateral').innerHTML = `
      <div class="lat-acciones"><button class="btn chico" data-accion="nueva-materia">+ Materia</button>
        ${matActual() ? '<button class="btn chico" data-accion="nuevo-tema">+ Tema</button>' : ''}</div>
      ${E.materias.length ? '' : '<p class="pista">Todavía no hay materias.</p>'}
      ${E.materias.map((m) => `
        <section class="lat-materia" style="--c:${esc(m.color || '#9B7BFF')}">
          <button class="lat-m ${E.sel.materia === m.uid && !E.sel.tema ? 'activa' : ''}" data-accion="ir-materia" data-id="${m.uid}">
            <span aria-hidden="true">${esc(m.emoji)}</span><b>${esc(m.nombre || 'Sin nombre')}</b>${punto(m.uid)}<small>${totalPreguntas(m)}</small>
          </button>
          <ul>${m.temas.map((t) => `<li><button class="lat-t ${E.sel.tema === t.uid ? 'activa' : ''}" data-accion="ir-tema" data-id="${t.uid}">
            <span class="nombre">${esc(t.nombre || 'Sin nombre')}</span>${punto(t.uid)}<small>${t.preguntas.length}${(t.tarjetas || []).length ? ` · 🃏${t.tarjetas.length}` : ''}</small></button></li>`).join('')}</ul>
        </section>`).join('')}`;
  }

  // ---------- Vistas principales ----------
  function renderPrincipal() {
    const cont = $('#principal');
    const m = matActual(), t = temaActual();
    if (!E.materias.length) cont.innerHTML = htmlBienvenida();
    else if (m && t) { cont.innerHTML = htmlTema(m, t); renderPreguntas(); renderTarjetas(); }
    else if (m) cont.innerHTML = htmlMateria(m);
    else cont.innerHTML = '<div class="vacia">Elegí una materia en el panel de la izquierda.</div>';
  }

  function pintarTodo() {
    analizar();
    renderLateral();
    renderPrincipal();
    renderEstado();
    guardarBorrador();
  }

  function refrescar() {
    analizar();
    refrescarTarjetas();
    renderLateral();
    renderEstado();
    guardarBorrador();
  }
  const refrescarLento = debounce(refrescar, 250);

  function seleccionar(mid, tid = null) {
    E.sel = { materia: mid, tema: tid };
    E.filtro = '';
    renderPrincipal();
    renderLateral();
    window.scrollTo({ top: 0 });
  }

  function htmlBienvenida() {
    return `<div class="bienvenida">
      <h2>Editá tus materias y preguntas</h2>
      <p>Todo pasa en tu navegador. Al final descargás los archivos listos para pisar los del repo${TIENE_API_CARPETAS ? ', o los escribís directo en la carpeta' : ''}.</p>
      <div class="caminos">
        <div class="camino"><h3>Abrir mi repo</h3>
          <p>${TIENE_API_CARPETAS ? 'Elegí la carpeta del repo (o su carpeta data). Vas a poder guardar directo ahí.' : 'Elegí la carpeta del repo (o su carpeta data). En este navegador vas a guardar descargando un ZIP.'}</p>
          <button class="btn primario" data-accion="abrir-carpeta">Abrir carpeta del repo</button></div>
        <div class="camino"><h3>Importar del LM</h3>
          <p>Pegá el JSON que te devolvió el LM y se crea la materia y el tema solos.</p>
          <button class="btn" data-accion="importar">Pegar JSON del LM</button></div>
        <div class="camino"><h3>Empezar de cero</h3>
          <p>Armá materias, temas y preguntas a mano con formularios.</p>
          <button class="btn" data-accion="empezar-vacio">Crear la primera materia</button></div>
      </div></div>`;
  }

  function htmlMateria(m) {
    const i = E.materias.indexOf(m);
    return `
      <div class="cabecera-vista">
        <h2 id="titulo-materia">${esc(m.emoji)} ${esc(m.nombre || 'Sin nombre')}</h2>
        <button class="btn chico" data-accion="mat-sube" ${i === 0 ? 'disabled' : ''}>↑ Subir</button>
        <button class="btn chico" data-accion="mat-baja" ${i === E.materias.length - 1 ? 'disabled' : ''}>↓ Bajar</button>
        <button class="btn chico peligro" data-accion="mat-borrar">Eliminar materia</button>
      </div>
      <div class="tarjeta">
        <h3>Datos de la materia</h3>
        <div class="fila">
          <label class="campo"><span>Nombre</span><input type="text" data-campo="m-nombre" value="${esc(m.nombre)}"></label>
          <label class="campo" style="max-width:8rem;min-width:6rem"><span>Emoji</span><input type="text" data-campo="m-emoji" maxlength="8" value="${esc(m.emoji)}"></label>
          <div class="campo" style="flex:none;min-width:0"><span>Color</span>
            <input type="color" data-campo="m-color" value="${esc(m.color || '#9B7BFF')}" aria-label="Color de la materia">
            <button class="btn chico fantasma" data-accion="quitar-color">Automático</button></div>
        </div>
        <div class="paleta" aria-label="Emojis sugeridos">${EMOJIS.map((e) => `<button data-accion="m-emoji" data-v="${e}" aria-label="Usar ${e}">${e}</button>`).join('')}</div>
        <div class="paleta colores" aria-label="Colores sugeridos">${COLORES.map((c) => `<button data-accion="m-color" data-v="${c}" style="background:${c}" aria-label="Usar color ${c}"></button>`).join('')}</div>
        <details style="margin-top:.9rem"><summary class="rotulo" style="cursor:pointer">Avanzado</summary>
          <label class="campo"><span>Carpeta dentro de data/</span><input type="text" data-campo="m-carpeta" value="${esc(m.carpeta)}"></label>
          <p class="pista">Si la cambiás, todos los archivos de la materia se mueven a la carpeta nueva al guardar.</p>
        </details>
      </div>
      <div class="tarjeta">
        <h3>Temas (${m.temas.length})</h3>
        ${m.temas.length ? `<ul class="lista-temas">${m.temas.map((t, k) => `
          <li><span class="nombre">${esc(t.nombre || 'Sin nombre')}</span><small>${plural(t.preguntas.length, 'pregunta', 'preguntas')}</small>
            <button class="btn chico" data-accion="tema-sube" data-id="${t.uid}" ${k === 0 ? 'disabled' : ''} aria-label="Subir tema">↑</button>
            <button class="btn chico" data-accion="tema-baja" data-id="${t.uid}" ${k === m.temas.length - 1 ? 'disabled' : ''} aria-label="Bajar tema">↓</button>
            <button class="btn chico" data-accion="ir-tema" data-id="${t.uid}">Abrir</button></li>`).join('')}</ul>` : '<div class="vacia">Esta materia todavía no tiene temas.</div>'}
        <p style="margin-top:.8rem;display:flex;gap:.5rem;flex-wrap:wrap">
          <button class="btn" data-accion="nuevo-tema">+ Tema nuevo</button>
          <button class="btn" data-accion="importar">Pegar JSON del LM</button></p>
      </div>`;
  }

  function htmlTema(m, t) {
    const dist = LETRAS.map((L) => t.preguntas.filter((q) => q.correcta === L).length);
    const k = m.temas.indexOf(t);
    return `
      <p class="miga"><button data-accion="ir-materia" data-id="${m.uid}">${esc(m.emoji)} ${esc(m.nombre || 'Sin nombre')}</button> › Tema</p>
      <div class="cabecera-vista">
        <h2 id="titulo-tema">${esc(t.nombre || 'Tema sin nombre')}</h2>
        <button class="btn chico" data-accion="importar">Pegar JSON del LM</button>
        <button class="btn chico" data-accion="t-descargar">Descargar JSON</button>
        <button class="btn chico" data-accion="t-copiar">Copiar JSON</button>
        <button class="btn chico" data-accion="t-dup">Duplicar</button>
        <button class="btn chico peligro" data-accion="t-borrar">Eliminar</button>
      </div>
      <div class="tarjeta">
        <div class="fila">
          <label class="campo"><span>Nombre del tema</span><input type="text" data-campo="t-nombre" value="${esc(t.nombre)}"></label>
          <label class="campo"><span>Materia</span><select data-campo="t-materia">${E.materias.map((x) => `<option value="${x.uid}" ${x === m ? 'selected' : ''}>${esc(x.nombre || 'Sin nombre')}</option>`).join('')}</select></label>
        </div>
        <p class="estadisticas">
          <span><b>${t.preguntas.length}</b> preguntas</span>
          <span><b id="n-tarj-est">${(t.tarjetas || []).length}</b> tarjetas</span>
          <span>Correctas: ${LETRAS.map((L, i) => `${L} <b>${dist[i]}</b>`).join(' · ')}</span>
          <span class="archivo" id="ruta-archivo">data/${esc(m.carpeta)}/${esc(nombreArchivo(t, k))}</span>
        </p>
      </div>
      <div class="herramientas-q">
        <input type="text" id="filtro" placeholder="Filtrar preguntas de este tema…" value="${esc(E.filtro)}" aria-label="Filtrar preguntas">
        <button class="btn chico" data-accion="abrir-todas">Desplegar todas</button>
        <button class="btn chico" data-accion="cerrar-todas">Plegar todas</button>
        <button class="btn chico primario" data-accion="q-nueva">+ Pregunta</button>
      </div>
      <div id="lista-q"></div>
      <section class="seccion-tarjetas">
        <div class="cabecera-vista">
          <h3>🃏 Tarjetas tipo Anki</h3>
          <button class="btn chico" data-accion="c-prompt">Prompt para el LM</button>
          <button class="btn chico" data-accion="importar">Pegar JSON del LM</button>
          <button class="btn chico primario" data-accion="c-nueva">+ Tarjeta</button>
        </div>
        <p class="pista">Cada tarjeta tiene un frente (la pregunta o el concepto) y un dorso (la respuesta). En el juego se dan vuelta y vos marcás qué tan bien la sabías: con eso se arma el “Repaso de hoy”.</p>
        <div id="lista-c"></div>
      </section>
      ${htmlSeccionCrucigrama(t)}`;
  }

  function htmlSeccionCrucigrama(t) {
    const cr = t.extra?.crucigrama;
    const nc = cr !== undefined ? normalizarCrucigrama(cr) : null;
    return `<section class="seccion-tarjetas">
        <div class="cabecera-vista">
          <h3>🧩 Crucigrama</h3>
          <button class="btn chico" data-accion="x-prompt">Prompt para el LM</button>
          <button class="btn chico" data-accion="importar">Pegar JSON del LM</button>
          ${cr !== undefined ? '<button class="btn chico peligro" data-accion="x-quitar">Quitar crucigrama</button>' : ''}
        </div>
        <p class="pista">${cr === undefined
          ? 'Este tema todavía no tiene crucigrama. Pedile a un LM las palabras con sus pistas (botón “Prompt para el LM”) y pegalas con “Pegar JSON del LM”. El tablero lo arma el juego solo y sale distinto cada vez.'
          : nc?.error ? `Hay un crucigrama pero tiene un problema: ${esc(nc.error)}`
          : `Crucigrama “${esc(nc.obj.titulo)}” con <b>${nc.validas}</b> palabras válidas. En el juego aparece como una actividad de la materia.`}</p>
      </section>`;
  }

  function htmlTarjeta(c, i) {
    const r = PROB.get(c) || validarTarjeta(c);
    const clase = `tarj${r.errores.length ? ' con-error' : r.avisos.length ? ' con-aviso' : ''}`;
    return `<article class="${clase}" data-c="${c.uid}">
      <div class="tarj-cab">
        <span class="n">${i + 1}</span>
        <div class="acciones-q">
          <button class="btn chico" data-accion="c-sube" aria-label="Subir tarjeta">↑</button>
          <button class="btn chico" data-accion="c-baja" aria-label="Bajar tarjeta">↓</button>
          <button class="btn chico" data-accion="c-dup">Duplicar</button>
          <button class="btn chico peligro" data-accion="c-borrar">Eliminar</button>
        </div>
      </div>
      <div class="tarj-campos">
        <label class="campo"><span>Frente</span><textarea rows="3" data-campo="c-frente">${esc(c.frente)}</textarea></label>
        <label class="campo"><span>Dorso</span><textarea rows="3" data-campo="c-dorso">${esc(c.dorso)}</textarea></label>
      </div>
      <ul class="problemas" data-problemas>${htmlProblemas(r)}</ul>
    </article>`;
  }

  function renderTarjetas() {
    const t = temaActual();
    const cont = $('#lista-c');
    if (!t || !cont) return;
    const lista = t.tarjetas || [];
    cont.innerHTML = lista.length
      ? lista.map((c, i) => htmlTarjeta(c, i)).join('')
      : '<div class="vacia">Este tema todavía no tiene tarjetas. Usá “+ Tarjeta”, o pedile al LM que las arme con “Prompt para el LM” y pegalas con “Pegar JSON del LM”.</div>';
  }

  function tarjetaDe(el) {
    const card = el.closest('[data-c]');
    const t = temaActual();
    return card && t ? (t.tarjetas || []).find((c) => c.uid === card.dataset.c) : null;
  }

  const htmlProblemas = (r) =>
    (r.errores.length || r.avisos.length)
      ? r.errores.map((x) => `<li class="e">${esc(x)}</li>`).join('') + r.avisos.map((x) => `<li class="a">${esc(x)}</li>`).join('')
      : '<li style="color:var(--ok)">Sin problemas.</li>';

  function htmlPregunta(q, i) {
    const abierta = E.abiertas.has(q.uid);
    const r = PROB.get(q) || validarPregunta(q);
    const clase = `preg${abierta ? ' abierta' : ''}${r.errores.length ? ' con-error' : r.avisos.length ? ' con-aviso' : ''}`;
    return `<article class="${clase}" data-q="${q.uid}">
      <div class="preg-cab" data-accion="alternar" tabindex="0" role="button" aria-expanded="${abierta}">
        <span class="n">${i + 1}</span>
        <span class="resumen">${esc(q.pregunta || '(sin enunciado)')}</span>
        <span class="chip ${q.correcta ? '' : 'vacio'}" title="Respuesta correcta">${q.correcta || '?'}</span>
      </div>
      ${abierta ? `<div class="preg-cuerpo">
        <label class="campo"><span>Enunciado</span><textarea rows="2" data-campo="q-pregunta">${esc(q.pregunta)}</textarea></label>
        <span class="rotulo">Opciones (marcá la correcta)</span>
        ${q.opciones.map((o, k) => `<div class="opcion-edit ${q.correcta === LETRAS[k] ? 'correcta' : ''}">
          <input type="radio" name="c-${q.uid}" value="${LETRAS[k]}" data-campo="q-correcta" ${q.correcta === LETRAS[k] ? 'checked' : ''} aria-label="La correcta es la ${LETRAS[k]}">
          <span class="letra">${LETRAS[k]}</span>
          <input type="text" data-campo="q-op${k}" value="${esc(o)}" aria-label="Opción ${LETRAS[k]}"></div>`).join('')}
        <p class="pista">El juego mezcla el orden de las opciones, así que no importa dónde pongas la correcta.</p>
        <label class="campo"><span>Explicación</span><textarea rows="2" data-campo="q-explicacion">${esc(q.explicacion)}</textarea></label>
        <div class="campo-imagen">
          <span class="rotulo">Imagen (opcional)</span>
          ${q.imagen ? `<figure class="img-prev"><img data-img="${esc(q.imagen)}" alt=""><figcaption class="archivo">${esc(q.imagen)}</figcaption></figure>` : ''}
          <div class="acciones-q">
            <label class="btn chico" style="cursor:pointer">${q.imagen ? 'Cambiar imagen' : 'Elegir imagen'}<input type="file" accept="image/*" data-campo="q-imagen-archivo" hidden></label>
            ${q.imagen ? '<button class="btn chico peligro" data-accion="q-img-quitar">Quitar imagen</button>' : ''}
          </div>
          ${q.imagen ? `<label class="campo"><span>Descripción de la imagen (para accesibilidad)</span><input type="text" data-campo="q-imagen-alt" value="${esc(q.imagenAlt)}"></label>` : ''}
          <p class="pista">Se reduce a ${MAX_LADO} px y se guarda en data/img/ cuando guardás los cambios.</p>
        </div>
        <ul class="problemas" data-problemas>${htmlProblemas(r)}</ul>
        <div class="acciones-q">
          <button class="btn chico" data-accion="q-sube">↑ Subir</button>
          <button class="btn chico" data-accion="q-baja">↓ Bajar</button>
          <button class="btn chico" data-accion="q-dup">Duplicar</button>
          <button class="btn chico" data-accion="q-mezclar">Mezclar opciones</button>
          <button class="btn chico peligro" data-accion="q-borrar">Eliminar</button>
        </div></div>` : ''}
    </article>`;
  }

  function renderPreguntas() {
    const t = temaActual();
    const cont = $('#lista-q');
    if (!t || !cont) return;
    const f = norm(E.filtro);
    const items = t.preguntas.map((q, i) => [q, i]).filter(([q]) => !f || norm([q.pregunta, ...q.opciones, q.explicacion].join(' ')).includes(f));
    cont.innerHTML = items.length
      ? items.map(([q, i]) => htmlPregunta(q, i)).join('')
      : `<div class="vacia">${t.preguntas.length ? 'Ninguna pregunta coincide con el filtro.' : 'Este tema todavía no tiene preguntas. Usá “+ Pregunta” o “Pegar JSON del LM”.'}</div>`;
  }

  // Actualiza lo que cambia mientras se escribe, sin tocar los campos (no pierde el foco)
  function refrescarTarjetas() {
    const t = temaActual();
    if (!t) return;
    $$('#lista-q .preg').forEach((card) => {
      const q = t.preguntas.find((x) => x.uid === card.dataset.q);
      const r = q && PROB.get(q);
      if (!r) return;
      card.classList.toggle('con-error', r.errores.length > 0);
      card.classList.toggle('con-aviso', !r.errores.length && r.avisos.length > 0);
      card.querySelector('.resumen').textContent = q.pregunta || '(sin enunciado)';
      const chip = card.querySelector('.chip');
      chip.textContent = q.correcta || '?';
      chip.classList.toggle('vacio', !q.correcta);
      const ul = card.querySelector('[data-problemas]');
      if (ul) ul.innerHTML = htmlProblemas(r);
      card.querySelectorAll('.opcion-edit').forEach((fila, k) => fila.classList.toggle('correcta', q.correcta === LETRAS[k]));
    });
    $$('#lista-c .tarj').forEach((card) => {
      const c = (t.tarjetas || []).find((x) => x.uid === card.dataset.c);
      const r = c && PROB.get(c);
      if (!r) return;
      card.classList.toggle('con-error', r.errores.length > 0);
      card.classList.toggle('con-aviso', !r.errores.length && r.avisos.length > 0);
      const ul = card.querySelector('[data-problemas]');
      if (ul) ul.innerHTML = htmlProblemas(r);
    });
    const nt = $('#n-tarj-est');
    if (nt) nt.textContent = (t.tarjetas || []).length;
    const m = matActual();
    const ruta = $('#ruta-archivo');
    if (ruta && m) ruta.textContent = `data/${m.carpeta}/${nombreArchivo(t, m.temas.indexOf(t))}`;
  }

  // ---------- Edición de campos ----------
  function preguntaDe(el) {
    const card = el.closest('[data-q]');
    const t = temaActual();
    return card && t ? t.preguntas.find((q) => q.uid === card.dataset.q) : null;
  }

  function onInput(e) {
    const el = e.target;
    const campo = el.dataset.campo;
    if (el.id === 'filtro') { E.filtro = el.value; renderPreguntas(); return; }
    if (!campo) return;
    const m = matActual(), t = temaActual();
    switch (campo) {
      case 'm-nombre': m.nombre = el.value; $('#titulo-materia').textContent = `${m.emoji} ${m.nombre || 'Sin nombre'}`; break;
      case 'm-emoji': m.emoji = el.value.trim() || '📚'; $('#titulo-materia').textContent = `${m.emoji} ${m.nombre || 'Sin nombre'}`; break;
      case 'm-color': m.color = el.value.toUpperCase(); break;
      case 't-nombre': t.nombre = el.value; $('#titulo-tema').textContent = t.nombre || 'Tema sin nombre'; break;
      case 'c-frente':
      case 'c-dorso': {
        const c = tarjetaDe(el);
        if (!c) return;
        if (campo === 'c-frente') c.frente = el.value; else c.dorso = el.value;
        break;
      }
      default: {
        const q = preguntaDe(el);
        if (!q) return;
        if (campo === 'q-pregunta') q.pregunta = el.value;
        else if (campo === 'q-explicacion') q.explicacion = el.value;
        else if (campo === 'q-correcta') q.correcta = el.value;
        else if (campo === 'q-imagen-alt') q.imagenAlt = el.value;
        else if (/^q-op[0-3]$/.test(campo)) q.opciones[Number(campo.slice(4))] = el.value;
      }
    }
    refrescarLento();
  }

  function repintarPregunta(q) {
    const t = temaActual();
    const card = $(`[data-q="${q.uid}"]`);
    if (card && t) card.outerHTML = htmlPregunta(q, t.preguntas.indexOf(q));
  }

  async function elegirImagen(input) {
    const archivo = input.files[0];
    const q = preguntaDe(input);
    input.value = '';
    if (!archivo || !q) return;
    try {
      const recortada = await abrirRecorte(archivo);
      if (!recortada) return;   // canceló el recorte
      const { blob, nombre } = await codificarImagen(recortada);
      E.imgs.set(nombre, blob);
      if (!E.imgExistentes.has(nombre)) E.imgNuevas.add(nombre);
      q.imagen = `data/img/${nombre}`;
      repintarPregunta(q);
      refrescar();
      avisar(`Imagen lista (${Math.max(1, Math.round(blob.size / 1024))} KB)`);
    } catch (err) {
      console.error(err);
      avisar('No se pudo leer esa imagen. Probá con un PNG, JPG o WebP.');
    }
  }

  // Las vistas previas se completan solas cuando aparece una <img data-img> en pantalla
  function hidratarImagenes() {
    $$('#principal img[data-img]:not([data-listo])').forEach(async (img) => {
      img.dataset.listo = '1';
      const ruta = img.dataset.img;
      const n = nombreImagen(ruta);
      const url = n ? await urlDeImagen(n) : (/^https:\/\/\S+$/i.test(ruta) ? ruta : null);
      if (url) img.src = url;
      else {
        const p = document.createElement('p');
        p.className = 'pista';
        p.textContent = 'No se puede mostrar la vista previa (la imagen no está cargada en esta sesión).';
        img.replaceWith(p);
      }
    });
  }
  new MutationObserver(hidratarImagenes).observe($('#principal'), { childList: true, subtree: true });

  function onChange(e) {
    const el = e.target;
    if (el.dataset.campo === 'q-imagen-archivo') { elegirImagen(el); return; }
    if (el.dataset.campo === 'm-carpeta') {
      const m = matActual();
      let nueva = slug(el.value), n = 2;
      const base = nueva;
      while (E.materias.some((x) => x !== m && x.carpeta === nueva)) nueva = `${base}-${n++}`;
      m.carpeta = nueva;
      el.value = nueva;
      refrescar();
    } else if (el.dataset.campo === 't-materia') {
      const [m, t] = ubicarTema(E.sel.tema);
      const destino = mat(el.value);
      if (!m || !destino || destino === m) return;
      m.temas.splice(m.temas.indexOf(t), 1);
      destino.temas.push(t);
      normalizarPartes(destino);
      E.sel = { materia: destino.uid, tema: t.uid };
      pintarTodo();
      avisar(`Tema movido a “${destino.nombre}”`);
    }
  }

  // ---------- Acciones (clics) ----------
  const mover = (lista, i, d) => {
    const j = i + d;
    if (j < 0 || j >= lista.length) return false;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    return true;
  };

  function irA(mid, tid, qid) {
    cerrarModal();
    E.sel = { materia: mid, tema: tid || null };
    E.filtro = '';
    if (qid) E.abiertas.add(qid);
    renderPrincipal();
    renderLateral();
    if (qid) {
      const card = $(`[data-q="${qid}"]`) || $(`[data-c="${qid}"]`);
      if (card) card.scrollIntoView({ block: 'center' });
    } else window.scrollTo({ top: 0 });
  }

  function descartarSiHaceFalta() {
    if (!hayCambios()) return true;
    return window.confirm('Hay cambios sin guardar. Si seguís, se descartan. ¿Continuar?');
  }

  async function abrirCarpeta() {
    if (!descartarSiHaceFalta()) return;
    if (!TIENE_API_CARPETAS) { $('#in-carpeta').click(); return; }
    try {
      const h = await window.showDirectoryPicker({ mode: 'readwrite' });
      const dataDir = await resolverDataDir(h);
      const mapa = await leerDesdeHandle(dataDir);
      const imagenes = await listarImagenes(dataDir);
      E.handle = dataDir;
      reiniciarImagenes(true, imagenes);
      cargarArchivos(mapa);
      despuesDeCargar(mapa);
    } catch (e) {
      if (e.name !== 'AbortError') { console.error(e); avisar(`No se pudo abrir la carpeta: ${e.message}`); }
    }
  }

  function despuesDeCargar(mapa) {
    $('#banner').hidden = true;
    pintarTodo();
    const n = E.materias.length;
    avisar(n ? `Abierto: ${plural(n, 'materia', 'materias')}, ${plural(E.materias.reduce((s, m) => s + totalPreguntas(m), 0), 'pregunta', 'preguntas')}` : 'La carpeta no tiene materias todavía');
    if (E.avisosCarga.length) {
      abrirModal('Cosas a tener en cuenta al abrir', `
        <p class="nota">Estos archivos no se pudieron leer del todo. Los que dicen “No se tocó” se dejan como están y no se modifican ni se borran.</p>
        <ul class="problemas">${E.avisosCarga.map((x) => `<li class="a">${esc(x)}</li>`).join('')}</ul>`, '<button class="btn primario" onclick="this.closest(\'dialog\').close()">Entendido</button>');
    }
  }

  const ACCIONES = {
    'abrir-carpeta': () => abrirCarpeta(),
    'importar': () => abrirImportar(),
    'empezar-vacio': () => {
      if (!descartarSiHaceFalta()) return;
      const nombre = window.prompt('Nombre de la primera materia:');
      if (!nombre?.trim()) return;
      E.materias = [];
      E.handle = null;
      reiniciarImagenes(false);
      fijarBase(new Map(), new Map());
      const m = crearMateria(nombre.trim());
      E.sel = { materia: m.uid, tema: null };
      pintarTodo();
    },
    'ir-materia': (el) => seleccionar(el.dataset.id),
    'ir-tema': (el) => { const [m, t] = ubicarTema(el.dataset.id); if (t) seleccionar(m.uid, t.uid); },
    'nueva-materia': () => {
      const nombre = window.prompt('Nombre de la materia nueva:');
      if (!nombre?.trim()) return;
      const m = crearMateria(nombre.trim());
      seleccionar(m.uid);
      refrescar();
    },
    'nuevo-tema': () => {
      const m = matActual();
      if (!m) return;
      const nombre = window.prompt(`Nombre del tema nuevo en “${m.nombre}”:`);
      if (!nombre?.trim()) return;
      const t = crearTema(m, nombre.trim());
      const q = nuevaPregunta();
      t.preguntas.push(q);
      E.abiertas.add(q.uid);
      seleccionar(m.uid, t.uid);
      refrescar();
    },
    'mat-sube': () => { if (mover(E.materias, E.materias.indexOf(matActual()), -1)) { pintarTodo(); } },
    'mat-baja': () => { if (mover(E.materias, E.materias.indexOf(matActual()), 1)) { pintarTodo(); } },
    'mat-borrar': () => {
      const m = matActual();
      if (!window.confirm(`¿Eliminar la materia “${m.nombre}” con ${plural(m.temas.length, 'tema', 'temas')} y ${plural(totalPreguntas(m), 'pregunta', 'preguntas')}?\n\nSe borran sus archivos al guardar.`)) return;
      E.materias.splice(E.materias.indexOf(m), 1);
      E.sel = { materia: E.materias[0]?.uid ?? null, tema: null };
      pintarTodo();
    },
    'm-emoji': (el) => { const m = matActual(); m.emoji = el.dataset.v; renderPrincipal(); refrescar(); },
    'm-color': (el) => { const m = matActual(); m.color = el.dataset.v; renderPrincipal(); refrescar(); },
    'quitar-color': () => { const m = matActual(); m.color = ''; renderPrincipal(); refrescar(); },
    'tema-sube': (el) => { const m = matActual(); if (mover(m.temas, m.temas.findIndex((t) => t.uid === el.dataset.id), -1)) { renderPrincipal(); refrescar(); } },
    'tema-baja': (el) => { const m = matActual(); if (mover(m.temas, m.temas.findIndex((t) => t.uid === el.dataset.id), 1)) { renderPrincipal(); refrescar(); } },
    't-descargar': () => {
      const m = matActual(), t = temaActual();
      descargar(nombreArchivo(t, m.temas.indexOf(t)), new Blob([serializarTema(m, t)], { type: 'application/json' }));
    },
    't-copiar': async () => {
      const m = matActual(), t = temaActual();
      try { await navigator.clipboard.writeText(serializarTema(m, t)); avisar('JSON copiado al portapapeles'); }
      catch { avisar('El navegador bloqueó el portapapeles; usá “Descargar JSON”.'); }
    },
    't-dup': () => {
      const m = matActual(), t = temaActual();
      const copia = JSON.parse(JSON.stringify(t));
      copia.uid = uid();
      copia.nombre = `${t.nombre} (copia)`;
      copia.parte = `${t.parte}-copia`;
      copia.preguntas.forEach((q) => { q.uid = uid(); });
      (copia.tarjetas || []).forEach((c) => { c.uid = uid(); });
      m.temas.splice(m.temas.indexOf(t) + 1, 0, copia);
      normalizarPartes(m);
      seleccionar(m.uid, copia.uid);
      refrescar();
    },
    't-borrar': () => {
      const m = matActual(), t = temaActual();
      if (!window.confirm(`¿Eliminar el tema “${t.nombre}” con ${plural(t.preguntas.length, 'pregunta', 'preguntas')}?\n\nSe borra su archivo al guardar.`)) return;
      m.temas.splice(m.temas.indexOf(t), 1);
      seleccionar(m.uid);
      refrescar();
    },
    'abrir-todas': () => { temaActual().preguntas.forEach((q) => E.abiertas.add(q.uid)); renderPreguntas(); },
    'cerrar-todas': () => { E.abiertas.clear(); renderPreguntas(); },
    'q-nueva': () => {
      const t = temaActual();
      const q = nuevaPregunta();
      t.preguntas.push(q);
      E.abiertas.add(q.uid);
      E.filtro = '';
      const f = $('#filtro'); if (f) f.value = '';
      renderPreguntas();
      refrescar();
      const card = $(`[data-q="${q.uid}"]`);
      card?.scrollIntoView({ block: 'center' });
      card?.querySelector('textarea')?.focus();
    },
    'alternar': (el) => {
      const card = el.closest('[data-q]');
      const t = temaActual();
      const i = t.preguntas.findIndex((q) => q.uid === card.dataset.q);
      const q = t.preguntas[i];
      if (E.abiertas.has(q.uid)) E.abiertas.delete(q.uid); else E.abiertas.add(q.uid);
      card.outerHTML = htmlPregunta(q, i);
      $(`[data-q="${q.uid}"] .preg-cab`)?.focus();
    },
    'q-sube': (el) => moverPregunta(el, -1),
    'q-baja': (el) => moverPregunta(el, 1),
    'q-dup': (el) => {
      const t = temaActual(), q = preguntaDe(el);
      const copia = JSON.parse(JSON.stringify(q));
      copia.uid = uid();
      t.preguntas.splice(t.preguntas.indexOf(q) + 1, 0, copia);
      E.abiertas.add(copia.uid);
      renderPreguntas();
      refrescar();
      $(`[data-q="${copia.uid}"]`)?.scrollIntoView({ block: 'center' });
    },
    'q-mezclar': (el) => {
      const q = preguntaDe(el);
      const orden = mezclar([0, 1, 2, 3]);
      const viejaCorrecta = LETRAS.indexOf(q.correcta);
      q.opciones = orden.map((i) => q.opciones[i]);
      if (viejaCorrecta >= 0) q.correcta = LETRAS[orden.indexOf(viejaCorrecta)];
      const t = temaActual();
      const card = el.closest('[data-q]');
      card.outerHTML = htmlPregunta(q, t.preguntas.indexOf(q));
      refrescar();
    },
    'c-nueva': () => {
      const t = temaActual();
      t.tarjetas ||= [];
      const c = nuevaTarjeta();
      t.tarjetas.push(c);
      renderTarjetas();
      refrescar();
      const card = $(`[data-c="${c.uid}"]`);
      card?.scrollIntoView({ block: 'center' });
      card?.querySelector('textarea')?.focus();
    },
    'c-sube': (el) => moverTarjeta(el, -1),
    'c-baja': (el) => moverTarjeta(el, 1),
    'c-dup': (el) => {
      const t = temaActual(), c = tarjetaDe(el);
      const copia = JSON.parse(JSON.stringify(c));
      copia.uid = uid();
      t.tarjetas.splice(t.tarjetas.indexOf(c) + 1, 0, copia);
      renderTarjetas();
      refrescar();
      $(`[data-c="${copia.uid}"]`)?.scrollIntoView({ block: 'center' });
    },
    'c-borrar': (el) => {
      const t = temaActual(), c = tarjetaDe(el);
      if (!window.confirm('¿Eliminar esta tarjeta?')) return;
      t.tarjetas.splice(t.tarjetas.indexOf(c), 1);
      renderTarjetas();
      refrescar();
    },
    'c-prompt': () => abrirPromptTarjetas(),
    'x-prompt': () => abrirPromptCrucigrama(),
    'x-quitar': () => {
      const m = matActual(), t = temaActual();
      if (!window.confirm('¿Quitar el crucigrama de este tema?')) return;
      delete t.extra.crucigrama;
      const acts = [].concat(t.extra.actividad || []).filter((a) => a !== 'crucigrama');
      if (acts.length) t.extra.actividad = acts; else delete t.extra.actividad;
      seleccionar(m.uid, t.uid);
      refrescar();
    },
    'q-img-quitar': (el) => {
      const q = preguntaDe(el);
      q.imagen = '';
      q.imagenAlt = '';
      repintarPregunta(q);
      refrescar();
    },
    'q-borrar': (el) => {
      const t = temaActual(), q = preguntaDe(el);
      if (!window.confirm('¿Eliminar esta pregunta?')) return;
      t.preguntas.splice(t.preguntas.indexOf(q), 1);
      E.abiertas.delete(q.uid);
      renderPreguntas();
      refrescar();
      const num = $('.estadisticas b'); if (num) num.textContent = t.preguntas.length;
    },
  };

  function moverTarjeta(el, d) {
    const t = temaActual(), c = tarjetaDe(el);
    if (!mover(t.tarjetas, t.tarjetas.indexOf(c), d)) return;
    renderTarjetas();
    refrescar();
    $(`[data-c="${c.uid}"]`)?.scrollIntoView({ block: 'center' });
  }

  function moverPregunta(el, d) {
    const t = temaActual(), q = preguntaDe(el);
    if (!mover(t.preguntas, t.preguntas.indexOf(q), d)) return;
    renderPreguntas();
    refrescar();
    $(`[data-q="${q.uid}"]`)?.scrollIntoView({ block: 'center' });
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-accion]');
    const f = el && ACCIONES[el.dataset.accion];
    if (f && !el.disabled) f(el, e);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); abrirGuardar(); return; }
    const el = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && el.dataset?.accion === 'alternar') { e.preventDefault(); ACCIONES.alternar(el); }
  });
  $('#principal').addEventListener('input', onInput);
  $('#principal').addEventListener('change', onChange);

  // ---------- Importar lo que devuelve el LM ----------
  function extraerJSON(texto) {
    let t = texto.trim();
    const cerco = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (cerco) t = cerco[1].trim();
    const a = t.indexOf('{'), b = t.indexOf('[');
    const ini = [a, b].filter((x) => x >= 0).sort((x, y) => x - y)[0];
    if (ini === undefined) return { error: 'No encontré ningún JSON en el texto.' };
    t = t.slice(ini);
    const fin = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'));
    t = t.slice(0, fin + 1);
    try { return { datos: JSON.parse(t) }; } catch (e1) {
      const arreglado = t.replace(/[\u201C\u201D]/g, '"').replace(/,(\s*[}\]])/g, '$1');
      try { return { datos: JSON.parse(arreglado), nota: 'Se corrigieron comillas curvas o comas finales.' }; }
      catch { return { error: `El JSON no es válido: ${e1.message}` }; }
    }
  }

  const alias = (o, ...claves) => { for (const k of claves) if (o[k] !== undefined) return o[k]; return undefined; };

  // Letras de una respuesta tal como las usa el tablero: sin tildes, espacios ni signos (la Ñ se conserva)
  const letrasDe = (txt) => String(txt ?? '').toUpperCase().replace(/Ñ/g, '\u0001').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0001/g, 'Ñ').replace(/[^A-ZÑ]/g, '');

  // Revisa un crucigrama pegado o ya guardado. Devuelve { obj, filas, validas } o { error }.
  function normalizarCrucigrama(c) {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return { error: 'El crucigrama tiene que ser un objeto con "titulo" y "palabras".' };
    const lista = alias(c, 'palabras', 'words', 'entradas');
    if (!Array.isArray(lista)) return { error: 'Al crucigrama le falta la lista "palabras".' };
    const palabras = [], filas = [], vistas = new Set();
    lista.forEach((p, i) => {
      const o = p && typeof p === 'object' ? p : {};
      const respuesta = String(alias(o, 'respuesta', 'palabra', 'answer', 'word') ?? '').trim();
      const pista = String(alias(o, 'pista', 'definicion', 'clue') ?? '').trim();
      const letras = letrasDe(respuesta);
      const problemas = [], avisos = [];
      if (!respuesta) problemas.push('Falta la respuesta.');
      else if (letras.length < 2) problemas.push('La respuesta es demasiado corta.');
      else if (letras.length > 18) problemas.push('La respuesta tiene más de 18 letras.');
      if (!pista) problemas.push('Falta la pista.');
      if (letras && vistas.has(letras)) problemas.push('Respuesta repetida.');
      if (!problemas.length) {
        vistas.add(letras);
        if (letras.length >= 4 && letrasDe(pista).includes(letras)) avisos.push('La pista contiene la respuesta.');
        if (letras.length > 14) avisos.push('Es muy larga: puede ensanchar el tablero.');
        palabras.push({ respuesta, pista });
      }
      filas.push({ respuesta, pista, problemas, avisos, n: i + 1 });
    });
    const titulo = String(alias(c, 'titulo', 'title', 'nombre') ?? '').trim();
    return { obj: { titulo: titulo || 'Crucigrama', palabras }, filas, validas: palabras.length };
  }

  function normalizarLM(texto) {
    const r = extraerJSON(texto);
    if (r.error) return { error: r.error };
    const datos = r.datos;
    let materia = '', tema = '', lista, listaT, crucigrama = null;
    const esTarjeta = (x) => x && typeof x === 'object' && ('frente' in x || 'dorso' in x);
    if (Array.isArray(datos)) {
      if (datos.length && datos.every(esTarjeta)) listaT = datos; else lista = datos;
    } else if (datos && typeof datos === 'object') {
      materia = String(datos.materia ?? '').trim();
      tema = String(datos.tema ?? '').trim();
      lista = alias(datos, 'preguntas', 'questions');
      listaT = alias(datos, 'tarjetas', 'flashcards', 'cards');
      const cr = alias(datos, 'crucigrama', 'crossword');
      if (cr !== undefined) crucigrama = normalizarCrucigrama(cr);
    }
    if (!Array.isArray(lista) && !Array.isArray(listaT) && !(crucigrama && !crucigrama.error)) {
      return { error: crucigrama?.error || 'No encontré la lista "preguntas", la lista "tarjetas" ni un "crucigrama".' };
    }
    lista = Array.isArray(lista) ? lista : [];
    const tarjetas = (Array.isArray(listaT) ? listaT : []).map((c, i) => {
      if (!c || typeof c !== 'object') return { c: null, errores: ['No es un objeto.'], n: i + 1 };
      const frente = String(alias(c, 'frente', 'pregunta', 'anverso', 'front') ?? '').trim();
      const dorso = String(alias(c, 'dorso', 'respuesta', 'reverso', 'back') ?? '').trim();
      const errores = [];
      if (!frente) errores.push('Falta el frente.');
      if (!dorso) errores.push('Falta el dorso.');
      return { c: nuevaTarjeta({ frente, dorso }), errores, n: i + 1 };
    });

    const numeros = lista.map((p) => (p && typeof p === 'object' ? alias(p, 'correcta', 'respuesta', 'respuesta_correcta', 'answer', 'correct') : undefined)).filter((v) => typeof v === 'number');
    const base1 = numeros.length > 0 && !numeros.includes(0);

    const items = lista.map((p, i) => {
      const notas = [], errores = [];
      if (!p || typeof p !== 'object') return { q: null, notas, errores: ['No es un objeto.'] };
      const enun = String(alias(p, 'pregunta', 'enunciado', 'question') ?? '').trim();
      let ops = alias(p, 'opciones', 'options', 'respuestas', 'alternativas');
      if (ops && !Array.isArray(ops) && typeof ops === 'object') {
        ops = LETRAS.map((L) => ops[L] ?? ops[L.toLowerCase()] ?? '');
        notas.push('Las opciones venían como objeto con letras.');
      }
      ops = Array.isArray(ops) ? ops.map((o) => String(o ?? '').trim()) : [];
      if (ops.length >= 2 && ops.every((o) => /^[A-Da-d][\)\.\:]\s+/.test(o))) {
        ops = ops.map((o) => o.replace(/^[A-Da-d][\)\.\:]\s+/, ''));
        notas.push('Se quitaron los prefijos "A)", "B)"… de las opciones.');
      }
      if (ops.length !== 4) errores.push(`Tiene ${ops.length} opciones (se necesitan 4).`);
      const bruto = alias(p, 'correcta', 'respuesta', 'respuesta_correcta', 'answer', 'correct');
      let letra = '';
      if (typeof bruto === 'number') {
        const idx = base1 ? bruto - 1 : bruto;
        if (idx >= 0 && idx < 4) { letra = LETRAS[idx]; notas.push(`La correcta venía como número (${bruto}); ahora es ${letra}.`); }
      } else if (typeof bruto === 'string') {
        const s = bruto.trim();
        const m1 = s.match(/^\(?([A-Da-d])[\)\.\:]?$/);
        if (m1) letra = m1[1].toUpperCase();
        else {
          const j = ops.findIndex((o) => norm(o) === norm(s));
          const m2 = s.match(/^\(?([A-Da-d])[\)\.\:]\s/);
          if (j >= 0) { letra = LETRAS[j]; notas.push(`La correcta venía como texto; ahora es ${letra}.`); }
          else if (m2) { letra = m2[1].toUpperCase(); notas.push(`La correcta venía como "${s.slice(0, 30)}"; se tomó ${letra}.`); }
        }
      }
      if (!enun) errores.push('Falta el enunciado.');
      if (!letra) errores.push('No pude determinar cuál es la correcta.');
      const expl = String(alias(p, 'explicacion', 'explicación', 'justificacion', 'explanation') ?? '').trim();
      const fijas = ops.slice(0, 4);
      while (fijas.length < 4) fijas.push('');
      const q = nuevaPregunta({ pregunta: enun, opciones: fijas, correcta: letra, explicacion: expl });
      const v = validarPregunta(q);
      v.errores.forEach((x) => { if (!errores.includes(x) && !/Marcá|enunciado/.test(x)) errores.push(x); });
      return { q, notas, errores, n: i + 1 };
    });
    return { materia, tema, items, tarjetas, crucigrama: crucigrama && !crucigrama.error ? crucigrama : null, errorCrucigrama: crucigrama?.error || '', nota: r.nota };
  }

  function htmlCrucigramaPrev(c, temaDestino) {
    const malas = c.filas.filter((f) => f.problemas.length);
    return `<div class="nota ${c.validas < 4 ? 'mal' : ''}">🧩 <b>Crucigrama “${esc(c.obj.titulo)}”</b>: ${plural(c.validas, 'palabra válida', 'palabras válidas')}${malas.length ? `, ${plural(malas.length, 'descartada', 'descartadas')}` : ''}.
      ${c.validas < 4 ? 'Hacen falta al menos 4 palabras para armar el tablero.' : ''}
      ${temaDestino?.extra?.crucigrama ? '<b>Este tema ya tiene un crucigrama: se va a reemplazar.</b>' : ''}
      <ul class="vista-prev">${c.filas.map((f) => `<li><span class="et ${f.problemas.length ? 'rota' : 'ok'}">${f.problemas.length ? 'Descartada' : 'OK'}</span>
        <span>${esc(f.respuesta || '(vacía)')} — ${esc(f.pista || '(sin pista)')}${[...f.problemas, ...f.avisos].length ? `<br><small style="color:var(--tenue)">${esc([...f.problemas, ...f.avisos].join(' '))}</small>` : ''}</span></li>`).join('')}</ul></div>`;
  }

  function abrirImportar() {
    const m0 = matActual(), t0 = temaActual();
    const d = abrirModal('Pegar JSON del LM', `
      <label class="campo"><span>Pegá lo que te devolvió el LM (se aceptan bloques de código y texto alrededor)</span>
        <textarea id="imp-texto" rows="8" placeholder='{ "materia": "...", "tema": "...", "preguntas": [ ... ], "tarjetas": [ ... ] }'></textarea></label>
      <p><label class="btn chico" style="cursor:pointer">…o abrir un archivo .json<input type="file" id="imp-archivo" accept=".json,.txt,application/json,text/plain" hidden></label></p>
      <div id="imp-prev"></div>`,
      '<button class="btn" id="imp-cancelar">Cancelar</button><button class="btn primario" id="imp-ok" disabled>Importar</button>');

    let res = null;
    let sel = { mat: '', tema: '', nombreMat: '', nombreTema: '' };
    const prev = $('#imp-prev', d), ok = $('#imp-ok', d), txt = $('#imp-texto', d);

    const clave = (q) => norm(q.pregunta);
    function duplicadasT() {
      const mm = sel.mat !== '__nueva__' ? mat(sel.mat) : null;
      const tt = mm && sel.tema !== '__nuevo__' ? mm.temas.find((t) => t.uid === sel.tema) : null;
      return new Set(tt ? (tt.tarjetas || []).map((c) => norm(c.frente)) : []);
    }
    function duplicadas() {
      const mm = sel.mat !== '__nueva__' ? mat(sel.mat) : null;
      const tt = mm && sel.tema !== '__nuevo__' ? mm.temas.find((t) => t.uid === sel.tema) : null;
      return new Set(tt ? tt.preguntas.map(clave) : []);
    }

    function inicializarSeleccion() {
      const nm = norm(res.materia);
      let mm = nm ? E.materias.find((m) => norm(m.nombre) === nm) : (m0 || E.materias[0]);
      sel.mat = mm ? mm.uid : '__nueva__';
      sel.nombreMat = res.materia || 'Materia nueva';
      sel.nombreTema = res.tema || 'Tema nuevo';
      const nt = norm(res.tema);
      let tt = mm && nt ? mm.temas.find((t) => norm(t.nombre) === nt) : null;
      if (!tt && mm && !nt && t0 && mm === m0) tt = t0;
      sel.tema = tt ? tt.uid : '__nuevo__';
    }

    function pintar() {
      if (!res) { prev.innerHTML = ''; ok.disabled = true; return; }
      if (res.error) { prev.innerHTML = `<div class="nota mal">${esc(res.error)}</div>`; ok.disabled = true; return; }
      const mm = sel.mat !== '__nueva__' ? mat(sel.mat) : null;
      const dup = duplicadas();
      const dupT = duplicadasT();
      const omitir = $('#imp-omitir', d)?.checked ?? true;
      const conRotas = $('#imp-rotas', d)?.checked ?? false;
      res.items.forEach((it) => {
        it.estado = !it.q || it.errores.length ? 'rota' : dup.has(clave(it.q)) ? 'dup' : it.notas.length ? 'rep' : 'ok';
      });
      res.tarjetas.forEach((x) => {
        x.estado = !x.c || x.errores.length ? 'rota' : dupT.has(norm(x.c.frente)) ? 'dup' : 'ok';
      });
      const cuenta = (e) => [...res.items, ...res.tarjetas].filter((i) => i.estado === e).length;
      const aImportar = res.items.filter((i) => i.q && (i.estado === 'ok' || i.estado === 'rep' || (i.estado === 'dup' && !omitir) || (i.estado === 'rota' && conRotas)));
      const aImportarT = res.tarjetas.filter((x) => x.c && (x.estado === 'ok' || (x.estado === 'dup' && !omitir) || (x.estado === 'rota' && conRotas)));
      const etiqueta = { ok: ['ok', 'OK'], rep: ['rep', 'Reparada'], rota: ['rota', 'Con errores'], dup: ['dup', 'Ya existe'] };
      prev.innerHTML = `
        ${res.nota ? `<div class="nota">${esc(res.nota)}</div>` : ''}
        ${!res.items.length && !res.tarjetas.length && sel.tema === '__nuevo__' ? '<div class="nota mal">Este JSON solo trae el crucigrama. Un tema nuevo quedaría sin preguntas ni tarjetas: elegí un tema que ya tenga contenido, o agregale una pregunta o una tarjeta después.</div>' : ''}
        ${res.errorCrucigrama ? `<div class="nota mal">${esc(res.errorCrucigrama)}</div>` : ''}
        <p class="nota"><b>${plural(res.items.length, 'pregunta', 'preguntas')}</b> y <b>${plural(res.tarjetas.length, 'tarjeta', 'tarjetas')}</b> en el JSON:
          ${cuenta('ok')} correctas, ${cuenta('rep')} reparadas, ${cuenta('rota')} con errores, ${cuenta('dup')} repetidas.</p>
        <div class="fila">
          <label class="campo"><span>Materia</span><select id="imp-mat">
            ${E.materias.map((m) => `<option value="${m.uid}" ${sel.mat === m.uid ? 'selected' : ''}>${esc(m.nombre)}</option>`).join('')}
            <option value="__nueva__" ${sel.mat === '__nueva__' ? 'selected' : ''}>Materia nueva…</option></select></label>
          <label class="campo"><span>Tema</span><select id="imp-tema">
            ${(mm ? mm.temas : []).map((t) => `<option value="${t.uid}" ${sel.tema === t.uid ? 'selected' : ''}>${esc(t.nombre)}</option>`).join('')}
            <option value="__nuevo__" ${sel.tema === '__nuevo__' ? 'selected' : ''}>Tema nuevo…</option></select></label>
        </div>
        <div class="fila">
          ${sel.mat === '__nueva__' ? `<label class="campo"><span>Nombre de la materia nueva</span><input type="text" id="imp-nm" value="${esc(sel.nombreMat)}"></label>` : ''}
          ${sel.tema === '__nuevo__' ? `<label class="campo"><span>Nombre del tema nuevo</span><input type="text" id="imp-nt" value="${esc(sel.nombreTema)}"></label>` : ''}
        </div>
        ${res.crucigrama ? htmlCrucigramaPrev(res.crucigrama, mm && sel.tema !== '__nuevo__' ? mm.temas.find((t) => t.uid === sel.tema) : null) : ''}
        <label class="check"><input type="checkbox" id="imp-omitir" ${omitir ? 'checked' : ''}> Omitir las que ya existen en el tema elegido</label>
        <label class="check"><input type="checkbox" id="imp-rotas" ${conRotas ? 'checked' : ''}> Importar también las que tienen errores, para corregirlas a mano</label>
        <ul class="vista-prev">${res.items.map((it) => `<li><span class="et ${etiqueta[it.estado][0]}">${etiqueta[it.estado][1]}</span>
          <span>${esc(it.q?.pregunta || '(vacía)')}${[...it.errores, ...it.notas].length ? `<br><small style="color:var(--tenue)">${esc([...it.errores, ...it.notas].join(' '))}</small>` : ''}</span></li>`).join('')}${res.tarjetas.map((x) => `<li><span class="et ${etiqueta[x.estado][0]}">${etiqueta[x.estado][1]}</span>
          <span>🃏 ${esc(x.c?.frente || '(vacía)')}${x.errores.length ? `<br><small style="color:var(--tenue)">${esc(x.errores.join(' '))}</small>` : ''}</span></li>`).join('')}</ul>`;
      ok._crucigrama = res.crucigrama && res.crucigrama.validas >= 4 ? res.crucigrama.obj : null;
      const total = aImportar.length + aImportarT.length + (ok._crucigrama ? 1 : 0);
      ok.disabled = total === 0;
      ok.textContent = total ? `Importar ${total}` : 'Importar';
      ok._lista = aImportar;
      ok._listaT = aImportarT;
      $('#imp-mat', d).onchange = (e) => { sel.mat = e.target.value; const m = mat(sel.mat); sel.tema = m && norm(res.tema) && m.temas.find((t) => norm(t.nombre) === norm(res.tema)) ? m.temas.find((t) => norm(t.nombre) === norm(res.tema)).uid : '__nuevo__'; pintar(); };
      $('#imp-tema', d).onchange = (e) => { sel.tema = e.target.value; pintar(); };
      $('#imp-nm', d)?.addEventListener('input', (e) => { sel.nombreMat = e.target.value; });
      $('#imp-nt', d)?.addEventListener('input', (e) => { sel.nombreTema = e.target.value; });
      $('#imp-omitir', d).onchange = pintar;
      $('#imp-rotas', d).onchange = pintar;
    }

    const analizarTexto = debounce(() => {
      if (!txt.value.trim()) { res = null; pintar(); return; }
      res = normalizarLM(txt.value);
      if (!res.error) inicializarSeleccion();
      pintar();
    }, 250);
    txt.addEventListener('input', analizarTexto);
    $('#imp-archivo', d).addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (f) { txt.value = await f.text(); analizarTexto(); }
    });
    $('#imp-cancelar', d).onclick = cerrarModal;
    ok.onclick = () => {
      let m = sel.mat === '__nueva__' ? crearMateria((sel.nombreMat || '').trim() || 'Materia nueva') : mat(sel.mat);
      let t = sel.tema === '__nuevo__' ? crearTema(m, (sel.nombreTema || '').trim() || 'Tema nuevo') : m.temas.find((x) => x.uid === sel.tema);
      const lista = ok._lista || [];
      lista.forEach((it) => { t.preguntas.push(it.q); if (it.estado === 'rota') E.abiertas.add(it.q.uid); });
      const listaT = ok._listaT || [];
      t.tarjetas ||= [];
      listaT.forEach((x) => t.tarjetas.push(x.c));
      if (ok._crucigrama) {
        t.extra = t.extra || {};
        t.extra.crucigrama = ok._crucigrama;
        const acts = [].concat(t.extra.actividad || []);
        if (!acts.includes('crucigrama')) acts.push('crucigrama');
        t.extra.actividad = acts;
      }
      cerrarModal();
      seleccionar(m.uid, t.uid);
      refrescar();
      const partes = [lista.length ? plural(lista.length, 'pregunta', 'preguntas') : '', listaT.length ? plural(listaT.length, 'tarjeta', 'tarjetas') : '', ok._crucigrama ? 'un crucigrama' : ''].filter(Boolean);
      avisar(`Se importaron ${partes.join(' y ')} a “${t.nombre}”`);
    };
    txt.focus();
  }

const PROMPT_TARJETAS = "Sos un tutor experto en técnicas de estudio (recuperación activa y repetición espaciada). Tu tarea es convertir el material que te paso en TARJETAS DE ESTUDIO tipo Anki y devolverlas en un único JSON.\n\nCONTEXTO\n- Materia: [MATERIA]\n- Tema: [TEMA]\n- Cantidad de tarjetas: 25 (si el material no alcanza, hacé menos antes que inventar o repetir)\n\nREGLAS PARA CADA TARJETA\n1. Una sola idea por tarjeta. Si algo tiene varias partes, hacé varias tarjetas, o una tarjeta cuyo dorso sea una lista corta.\n2. \"frente\": una pregunta o consigna concreta, con UNA respuesta clara, que se pueda contestar de memoria. Tiene que entenderse sola, sin depender de otras tarjetas ni del material (\"según el texto\" y \"como vimos antes\" están prohibidos).\n3. \"dorso\": la respuesta directa en 1 a 3 oraciones (máximo 400 caracteres). Primero la respuesta; después, solo si hace falta, una aclaración corta. Si es una enumeración, usá líneas que empiecen con \"• \".\n4. Variá los tipos: definiciones, \"¿por qué?\", diferencias entre dos conceptos, ejemplos, causas y consecuencias, procedimientos. Fechas y autores solo si son centrales.\n5. Basate SOLO en el material. No inventes datos ni agregues contenido que no esté.\n6. Texto plano: sin numeración (\"1.\", \"Tarjeta 1\"), sin markdown (nada de **negritas**, #, tablas), sin HTML y sin emojis. Para un salto de línea usá \\n.\n7. Sin tarjetas repetidas ni casi iguales.\n8. Español rioplatense neutro, claro y sin vueltas.\n\nFORMATO DE SALIDA (obligatorio)\nDevolvé SOLO un bloque de código JSON, sin texto antes ni después, con esta estructura exacta:\n\n{\n  \"materia\": \"[MATERIA]\",\n  \"tema\": \"[TEMA]\",\n  \"tarjetas\": [\n    { \"frente\": \"...\", \"dorso\": \"...\" }\n  ]\n}\n\n- Los nombres de los campos son exactamente \"materia\", \"tema\", \"tarjetas\", \"frente\" y \"dorso\".\n- JSON válido: comillas dobles rectas, sin comas finales y sin comentarios. Las comillas dobles dentro de un texto se escriben \\\".\n\nEJEMPLO (de otra materia, solo para mostrar el estilo)\n{\n  \"materia\": \"Epistemología\",\n  \"tema\": \"Popper\",\n  \"tarjetas\": [\n    {\n      \"frente\": \"¿Qué propone el criterio de falsabilidad de Popper?\",\n      \"dorso\": \"Una teoría es científica si puede ser refutada por la experiencia.\\nNo importa cuántas veces se confirma: importa que pueda fallar.\"\n    },\n    {\n      \"frente\": \"¿En qué se diferencia el método deductivo de Popper del inductivismo?\",\n      \"dorso\": \"Popper no parte de observaciones para generalizar: propone conjeturas y trata de refutarlas con contrastaciones.\"\n    }\n  ]\n}\n\nAntes de responder, revisá una por una que cada tarjeta cumpla las reglas y que el JSON sea válido.\n\nMATERIAL\n\"\"\"\n[PEGAR ACÁ EL TEXTO, LOS APUNTES O EL TEMARIO]\n\"\"\"";

const PROMPT_CRUCIGRAMA = "Sos un docente experto en armar crucigramas para estudiar. Tu tarea es convertir el material que te paso en una LISTA DE PALABRAS CON SUS PISTAS y devolverla en un único JSON. No armes el tablero: el juego lo arma solo, cruzando las palabras entre sí.\n\nCONTEXTO\n- Materia: [MATERIA]\n- Tema: [TEMA]\n- Cantidad de palabras: entre 12 y 16 (si el material no alcanza, hacé menos antes que inventar o repetir)\n\nREGLAS PARA LAS RESPUESTAS\n1. Cada respuesta es un término clave del material: un concepto, una estructura, una enzima, un autor, un proceso, etc.\n2. Entre 3 y 12 letras (nunca más de 14). Evitá siglas raras y frases largas; si hace falta una frase, que sean 2 palabras cortas (por ejemplo \"ARN mensajero\").\n3. Sin repetidas, y sin que una sea el plural o la variante de otra.\n4. Mezclá palabras largas (7 a 12 letras) con cortas (3 a 6): las cortas ayudan a que el tablero cruce bien. Incluí al menos 3 cortas.\n5. Escribilas con su ortografía correcta (tildes, ñ, mayúscula inicial). El juego ignora tildes, espacios y guiones para armar el tablero, y las muestra bien cuando se resuelven.\n6. Basate SOLO en el material. No inventes términos.\n\nREGLAS PARA LAS PISTAS\n1. Una pista breve (entre 6 y 20 palabras) que se pueda resolver sabiendo el tema.\n2. NUNCA incluyas la respuesta ni una palabra de su misma familia en la pista (para \"Helicasa\" no uses \"helicasa\" ni \"helicoidal\").\n3. La pista tiene que llevar a UNA sola respuesta: describí una función, una definición o una característica distintiva, no algo vago.\n4. Variá el estilo: definiciones, funciones, \"¿quién...?\", ejemplos, comparaciones. Evitá \"según el texto\" o \"como vimos\".\n5. Texto plano: sin numeración, sin markdown, sin HTML y sin emojis.\n\nFORMATO DE SALIDA (obligatorio)\nDevolvé SOLO un bloque de código JSON, sin texto antes ni después, con esta estructura exacta:\n\n{\n  \"materia\": \"[MATERIA]\",\n  \"tema\": \"[TEMA]\",\n  \"crucigrama\": {\n    \"titulo\": \"[TEMA]\",\n    \"palabras\": [\n      { \"respuesta\": \"...\", \"pista\": \"...\" }\n    ]\n  }\n}\n\n- Los nombres de los campos son exactamente \"materia\", \"tema\", \"crucigrama\", \"titulo\", \"palabras\", \"respuesta\" y \"pista\".\n- JSON válido: comillas dobles rectas, sin comas finales y sin comentarios. Las comillas dobles dentro de un texto se escriben \\\".\n\nEJEMPLO (de otra materia, solo para mostrar el estilo)\n{\n  \"materia\": \"Epistemología\",\n  \"tema\": \"Popper\",\n  \"crucigrama\": {\n    \"titulo\": \"Popper y la falsabilidad\",\n    \"palabras\": [\n      { \"respuesta\": \"Falsabilidad\", \"pista\": \"Criterio de Popper: una teoría es científica si puede ser refutada por la experiencia\" },\n      { \"respuesta\": \"Conjetura\", \"pista\": \"Para Popper, punto de partida de la ciencia: una hipótesis audaz que luego se somete a prueba\" },\n      { \"respuesta\": \"Refutación\", \"pista\": \"Resultado que muestra que una teoría es falsa y obliga a descartarla o modificarla\" },\n      { \"respuesta\": \"Inducción\", \"pista\": \"Razonamiento que Popper rechaza: pasar de casos observados a una ley general\" },\n      { \"respuesta\": \"Cisne\", \"pista\": \"Ave cuya variedad negra se usa como ejemplo para refutar \\\"todos son blancos\\\"\" }\n    ]\n  }\n}\n\nAntes de responder, revisá una por una que cada respuesta cumpla las reglas, que ninguna pista contenga su respuesta y que el JSON sea válido.\n\nMATERIAL\n\"\"\"\n[PEGAR ACÁ EL TEXTO, LOS APUNTES O EL TEMARIO]\n\"\"\"";

  function abrirPromptCrucigrama() {
    const m = matActual(), t = temaActual();
    const texto = PROMPT_CRUCIGRAMA.replaceAll('[MATERIA]', m?.nombre || '[MATERIA]').replaceAll('[TEMA]', t?.nombre || '[TEMA]');
    const d = abrirModal('Prompt para que el LM arme un crucigrama', `
      <p class="nota">Copiá este prompt y pegalo en tu modelo de lenguaje. Reemplazá lo que está entre corchetes en <b>MATERIAL</b> por tus apuntes. Después copiá lo que te devuelva y pegalo con <b>“Pegar JSON del LM”</b>.</p>
      <textarea id="prompt-x" rows="16" readonly>${esc(texto)}</textarea>`,
      '<button class="btn" id="px-cerrar">Cerrar</button><button class="btn primario" id="px-copiar">Copiar prompt</button>');
    $('#px-cerrar', d).onclick = cerrarModal;
    $('#px-copiar', d).onclick = async () => {
      try { await navigator.clipboard.writeText(texto); avisar('Prompt copiado'); }
      catch { $('#prompt-x', d).select(); avisar('Quedó seleccionado: copialo con Ctrl+C'); }
    };
  }

  function abrirPromptTarjetas() {
    const m = matActual(), t = temaActual();
    const texto = PROMPT_TARJETAS.replaceAll('[MATERIA]', m?.nombre || '[MATERIA]').replaceAll('[TEMA]', t?.nombre || '[TEMA]');
    const d = abrirModal('Prompt para que el LM arme tarjetas', `
      <p class="nota">Copiá este prompt y pegalo en tu modelo de lenguaje. Reemplazá lo que está entre corchetes en <b>MATERIAL</b> por tus apuntes (y ajustá la cantidad de tarjetas). Después copiá lo que te devuelva y pegalo con <b>“Pegar JSON del LM”</b>.</p>
      <textarea id="prompt-t" rows="16" readonly>${esc(texto)}</textarea>`,
      '<button class="btn" id="p-cerrar">Cerrar</button><button class="btn primario" id="p-copiar">Copiar prompt</button>');
    $('#p-cerrar', d).onclick = cerrarModal;
    $('#p-copiar', d).onclick = async () => {
      try { await navigator.clipboard.writeText(texto); avisar('Prompt copiado'); }
      catch { $('#prompt-t', d).select(); avisar('Quedó seleccionado: copialo con Ctrl+C'); }
    };
  }

  // ---------- Buscar y revisar ----------
  function abrirBuscar() {
    const d = abrirModal('Buscar en todas las preguntas', `<input type="text" id="bus-q" placeholder="Palabra o frase…" aria-label="Buscar"><div id="bus-res" style="margin-top:.8rem"></div>`);
    const inp = $('#bus-q', d), res = $('#bus-res', d);
    const pintar = () => {
      const f = norm(inp.value);
      if (f.length < 2) { res.innerHTML = '<p class="pista">Escribí al menos 2 letras.</p>'; return; }
      const hits = [];
      for (const m of E.materias) for (const t of m.temas) t.preguntas.forEach((q, i) => {
        if (hits.length < 60 && norm([q.pregunta, ...q.opciones, q.explicacion].join(' ')).includes(f)) hits.push({ m, t, q, i });
      });
      for (const m of E.materias) for (const t of m.temas) (t.tarjetas || []).forEach((c, i) => {
        if (hits.length < 60 && norm(`${c.frente} ${c.dorso}`).includes(f)) hits.push({ m, t, q: c, i, tarjeta: true });
      });
      res.innerHTML = hits.length
        ? hits.map((h) => `<button class="resultado-busqueda" data-m="${h.m.uid}" data-t="${h.t.uid}" data-q="${h.q.uid}">${esc(h.tarjeta ? `🃏 ${h.q.frente || '(sin frente)'}` : (h.q.pregunta || '(sin enunciado)'))}<small>${esc(h.m.nombre)} › ${esc(h.t.nombre)}, ${h.tarjeta ? 'tarjeta' : 'pregunta'} ${h.i + 1}</small></button>`).join('')
        : '<p class="pista">Sin resultados.</p>';
      $$('.resultado-busqueda', res).forEach((b) => b.addEventListener('click', () => irA(b.dataset.m, b.dataset.t, b.dataset.q)));
    };
    inp.addEventListener('input', debounce(pintar, 150));
    pintar();
    inp.focus();
  }

  function abrirRevisar() {
    analizar();
    const { lista, errores, avisos } = E.analisis;
    const ordenada = [...lista].sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === 'e' ? -1 : 1));
    const d = abrirModal('Revisar todo', ordenada.length
      ? `<p class="nota"><b>${plural(errores, 'error', 'errores')}</b> y <b>${plural(avisos, 'aviso', 'avisos')}</b>. Los errores frenan la publicación del sitio; los avisos son recomendaciones.</p>
        ${ordenada.slice(0, 300).map((p, i) => `<button class="resultado-busqueda" data-i="${i}"><span class="et ${p.nivel === 'e' ? 'rota' : 'rep'}">${p.nivel === 'e' ? 'Error' : 'Aviso'}</span> ${esc(p.texto)}<small>${esc(p.donde)}</small></button>`).join('')}
        ${ordenada.length > 300 ? `<p class="pista">Se muestran los primeros 300.</p>` : ''}`
      : '<div class="nota"><b>Todo en orden.</b> No hay errores ni avisos.</div>');
    $$('.resultado-busqueda', d).forEach((b) => b.addEventListener('click', () => {
      const p = ordenada[Number(b.dataset.i)];
      irA(p.m, p.t, p.q);
    }));
  }

  // ---------- Guardar ----------
  const textoIndice = (indice) =>
    JSON.stringify({ generado: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), ...indice }, null, 2) + '\n';

  async function archivosParaZip(plan, soloCambios) {
    const archivos = [];
    const cambiado = (r) => plan.nuevos.includes(r) || plan.modificados.includes(r);
    for (const [r, texto] of plan.destino) {
      if (soloCambios && !cambiado(r)) continue;
      const usarOriginal = !cambiado(r) && E.base.crudos.has(r);
      archivos.push({ nombre: `data/${r}`, texto: usarOriginal ? E.base.crudos.get(r) : texto });
    }
    if (!soloCambios || plan.indiceCambio || cantidadCambios(plan) > 0) {
      archivos.push({ nombre: 'data/index.json', texto: textoIndice(plan.indiceNuevo) });
    }
    for (const n of plan.imagenes) {
      archivos.push({ nombre: `data/img/${n}`, bytes: new Uint8Array(await E.imgs.get(n).arrayBuffer()) });
    }
    if (plan.borrados.length) {
      archivos.push({
        nombre: 'ARCHIVOS_PARA_BORRAR.txt',
        texto: `Borrá estos archivos del repo (el ZIP no puede borrar por vos):\n\n${plan.borrados.map((r) => `data/${r}`).join('\n')}\n`,
      });
    }
    return archivos;
  }

  function abrirGuardar() {
    analizar();
    const plan = calcularPlan();
    E.plan = plan;
    const n = cantidadCambios(plan);
    const errores = E.analisis.errores, avisos = E.analisis.avisos;
    const lista = (titulo, arr) => (arr.length
      ? `<details class="lista"><summary>${titulo} (${arr.length})</summary><ul>${arr.map((r) => `<li>data/${esc(r)}</li>`).join('')}</ul></details>` : '');
    const hayAlgo = n > 0 || plan.indiceCambio;

    const d = abrirModal('Guardar cambios', `
      <div class="resumen-plan">
        <div class="nuevo"><b>${plan.nuevos.length}</b>nuevos</div>
        <div class="mod"><b>${plan.modificados.length}</b>modificados</div>
        <div class="borr"><b>${plan.borrados.length}</b>a borrar</div>
        <div><b>${plan.iguales.length}</b>sin cambios</div>
      </div>
      ${errores ? `<div class="nota mal"><b>Hay ${plural(errores, 'error', 'errores')}.</b> Si los subís así, el workflow del repo se frena y el sitio no se publica.
        <button class="btn chico" id="g-ver">Verlos</button>
        <label class="check"><input type="checkbox" id="g-igual"> Guardar igual de todos modos</label></div>` : ''}
      ${!errores && avisos ? `<div class="nota">Hay ${plural(avisos, 'aviso', 'avisos')} (recomendaciones, no frenan nada). <button class="btn chico" id="g-ver">Verlos</button></div>` : ''}
      ${lista('Archivos nuevos', plan.nuevos)}${lista('Archivos modificados', plan.modificados)}${lista('Imágenes nuevas', plan.imagenes.map((n) => `img/${n}`))}${lista('Archivos que hay que borrar', plan.borrados)}
      <div class="nota"><b>Cómo usarlo:</b> ${TIENE_API_CARPETAS ? '“Escribir en la carpeta” guarda directo en tu repo. ' : ''}Con el ZIP, descomprimilo y copiá la carpeta <b>data</b> dentro del repo, pisando la existente.${plan.imagenes.length ? ' Las imágenes van en <b>data/img</b>: combiná las carpetas y no borres las imágenes que ya estaban.' : ''} Después hacé <code>git add . &amp;&amp; git commit &amp;&amp; git push</code>.</div>
      <div id="g-estado"></div>`,
      `${TIENE_API_CARPETAS ? `<button class="btn primario" id="g-escribir">${E.handle ? 'Escribir en la carpeta abierta' : 'Elegir carpeta y escribir'}</button>` : ''}
       <button class="btn ${TIENE_API_CARPETAS ? '' : 'primario'}" id="g-zip">Descargar ZIP de data/</button>
       <button class="btn" id="g-zip-c">Solo lo que cambió (ZIP)</button>
       <button class="btn fantasma" id="g-cerrar">Cerrar</button>`);

    const botones = $$('#g-escribir, #g-zip, #g-zip-c', d);
    const bloqueo = () => {
      const bloqueado = errores > 0 && !$('#g-igual', d)?.checked;
      botones.forEach((b) => { b.disabled = bloqueado; });
      if (!hayAlgo) { $('#g-escribir', d) && ($('#g-escribir', d).disabled = true); $('#g-zip-c', d).disabled = true; }
    };
    bloqueo();
    $('#g-igual', d)?.addEventListener('change', bloqueo);
    $('#g-ver', d)?.addEventListener('click', abrirRevisar);
    $('#g-cerrar', d).onclick = cerrarModal;

    $('#g-zip', d).onclick = () => descargarZip(plan, false, d);
    $('#g-zip-c', d).onclick = () => descargarZip(plan, true, d);
    const esc_ = $('#g-escribir', d);
    if (esc_) esc_.onclick = async () => {
      try {
        if (!E.handle) await elegirCarpetaEscritura();
        if (!(await asegurarPermiso(E.handle))) { avisar('Sin permiso para escribir en la carpeta.'); return; }
        const p = calcularPlan();
        for (const n of p.imagenes) {   // primero las imágenes: así ningún JSON apunta a un archivo que todavía no está
          await escribirArchivo(E.handle, `img/${n}`, E.imgs.get(n));
          E.imgExistentes.add(n);
          E.imgNuevas.delete(n);
        }
        for (const r of [...p.nuevos, ...p.modificados]) await escribirArchivo(E.handle, r, p.destino.get(r));
        for (const r of p.borrados) await borrarArchivo(E.handle, r);
        if (p.indiceCambio || cantidadCambios(p) > 0 || !E.base.archivos.size) await escribirArchivo(E.handle, 'index.json', textoIndice(p.indiceNuevo));
        fijarBase(p.destino, p.destino);
        refrescar();
        $('#g-estado', d).innerHTML = `<div class="nota"><b>Listo.</b> Se escribieron ${plural(p.nuevos.length + p.modificados.length, 'archivo', 'archivos')}${p.imagenes.length ? ` (más ${plural(p.imagenes.length, 'imagen', 'imágenes')})` : ''} y se borraron ${p.borrados.length} en la carpeta “${esc(E.handle.name)}”.
          Ahora podés hacer <code>git add . &amp;&amp; git commit &amp;&amp; git push</code>.</div>`;
        botones.forEach((b) => { b.disabled = true; });
        avisar('Cambios guardados en la carpeta');
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.error(e);
        $('#g-estado', d).innerHTML = `<div class="nota mal"><b>No se pudo escribir:</b> ${esc(e.message)}. Probá con el ZIP.</div>`;
      }
    };
  }

  async function descargarZip(plan, soloCambios, d) {
    const archivos = await archivosParaZip(plan, soloCambios);
    descargar(`repaso-data-${marcaTiempo()}${soloCambios ? '-cambios' : ''}.zip`, crearZip(archivos));
    $('#g-estado', d).innerHTML = `<div class="nota"><b>ZIP descargado</b> (${plural(archivos.length, 'archivo', 'archivos')}).
      Copiá la carpeta <b>data</b> al repo${plan.borrados.length ? ' y borrá lo que indica ARCHIVOS_PARA_BORRAR.txt' : ''}.
      <br><button class="btn chico" id="g-marcar" style="margin-top:.5rem">Ya lo copié al repo: marcar como guardado</button></div>`;
    $('#g-marcar', d).onclick = () => {
      plan.imagenes.forEach((n) => { E.imgExistentes.add(n); E.imgNuevas.delete(n); });
      fijarBase(plan.destino, plan.destino);
      refrescar();
      cerrarModal();
      avisar('Marcado como guardado');
    };
  }

  // ---------- Conexión de la barra y arranque ----------
  $('#btn-abrir').addEventListener('click', abrirCarpeta);
  $('#btn-importar').addEventListener('click', abrirImportar);
  $('#btn-buscar').addEventListener('click', abrirBuscar);
  $('#btn-revisar').addEventListener('click', abrirRevisar);
  $('#btn-guardar').addEventListener('click', abrirGuardar);
  $('#in-carpeta').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const mapa = await leerDesdeInput(files);
    if (![...mapa.keys()].some((k) => k.includes('/'))) { avisar('No encontré una carpeta data/ con archivos .json en lo que elegiste.'); return; }
    E.handle = null;
    leerImagenesDesdeInput(files);
    cargarArchivos(mapa);
    despuesDeCargar(mapa);
  });

  if (!TIENE_API_CARPETAS) $('#btn-abrir').textContent = 'Cargar carpeta del repo';

  fijarBase(new Map(), new Map());
  pintarTodo();
  revisarBorrador();
})();
