'use strict';

(() => {
  // ---------- Utilidades ----------
  const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c] || c));
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
    if (!el) return;
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
    abiertas: new Set(),
    filtro: '',
    handle: null,
    base: { archivos: new Map(), crudos: new Map(), secuencia: '', indice: '' },
    analisis: { lista: [], conteo: new Map(), errores: 0, avisos: 0 },
    avisosCarga: [],
    imgs: new Map(),
    imgNuevas: new Set(),
    imgExistentes: new Set(),
    imgListadoOk: false,
  };
  const PROB = new WeakMap();

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

  const nombreImagen = (ruta) => {
    const m = /^data\/img\/([\w.%-]+)$/.exec(String(ruta || '').trim());
    return m ? m[1] : null;
  };

  // ---------- Validación ----------
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
      if (!n && !/^https:\/\/\S+$/i.test(q.imagen.trim())) avisos.push('La ruta de la imagen no es válida.');
      else if (n && E.imgListadoOk && !E.imgExistentes.has(n) && !E.imgs.has(n)) avisos.push(`La imagen "${n}" no está en data/img/.`);
      if (!norm(q.imagenAlt)) avisos.push('La imagen no tiene descripción.');
    }
    return { errores, avisos };
  }

  function validarTarjeta(c) {
    const errores = [], avisos = [];
    if (!norm(c.frente)) errores.push('Falta el frente.');
    if (!norm(c.dorso)) errores.push('Falta el dorso.');
    if (norm(c.frente).length > 280) avisos.push('El frente es largo: conviene usar una sola idea corta.');
    if (norm(c.dorso).length > 600) avisos.push('El dorso es muy largo.');
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
        if (!t.preguntas.length && (!t.tarjetas || !t.tarjetas.length)) {
          reg('e', m, t, null, 'El tema debe contener al menos una pregunta o al menos una tarjeta.');
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

  // ---------- Serialización ----------
  const J = (v) => JSON.stringify(v);

  function serializarPregunta(q) {
    const sangria = '      ';
    const lineasOps = q.opciones.map(J);
    const enLinea = `[${lineasOps.join(', ')}]`;
    const ops = enLinea.length <= 120
      ? enLinea
      : `[\n${lineasOps.map((l) => `${sangria}${l}`).join(',\n')}\n${sangria}]`;
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
    for (const [k, v] of Object.entries(t.extra || {})) campos.push(`  ${J(k)}: ${J(v)}`);
    campos.push(`  "preguntas": [\n${t.preguntas.map(serializarPregunta).join(',\n')}\n  ]`);
    if (t.tarjetas?.length) campos.push(`  "tarjetas": [\n${t.tarjetas.map(serializarTarjeta).join(',\n')}\n  ]`);
    return `{\n${campos.join(',\n')}\n}\n`;
  }

  function serializarMeta(m, forzar) {
    const o = { nombre: m.nombre, emoji: m.emoji };
    if (m.color) o.color = m.color;
    if (forzar || m.ordenEnArchivo !== undefined) o.orden = m.orden;
    Object.assign(o, m.extra || {});
    return JSON.stringify(o, null, 2) + '\n';
  }

  const metaNecesaria = (m, forzar) =>
    forzar || m.tieneMeta || m.emoji !== '📚' || !!m.color || norm(m.nombre) !== norm(m.nombreBase);

  function nombreArchivo(t, i) {
    return `${String(i + 1).padStart(2, '0')}-${t.parte}.json`;
  }

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
          const item = {
            id: `${m.carpeta}/${archivo.replace(/\.json$/, '')}`,
            nombre: t.nombre,
            archivo: `data/${m.carpeta}/${archivo}`,
            preguntas: t.preguntas.length,
          };
          if (t.tarjetas?.length) item.tarjetas = t.tarjetas.length;
          if (typeof t.extra?.actividad === 'string' && t.extra.actividad.trim()) item.actividad = t.extra.actividad.trim();
          return item;
        });
        return o;
      }),
    };
  }

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

  // ---------- ZIP ----------
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

  // ---------- Carga ----------
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
        if (!datos || typeof datos !== 'object') {
          problemas.push(`${f.ruta}: formato inválido. No se tocó.`);
          continue;
        }
        gestionados.push(f.ruta);
        const { materia, tema, preguntas, tarjetas, ...extra } = datos;
        const qs = [];
        if (Array.isArray(preguntas)) {
          preguntas.forEach((p, i) => {
            if (!p || typeof p !== 'object') { avisos.push(`${f.ruta}: la pregunta ${i + 1} no es un objeto; se omitió.`); return; }
            qs.push(preguntaDesdeJSON(p, avisos, `${f.ruta}, pregunta ${i + 1}`));
          });
        }
        const ts = [];
        if (Array.isArray(tarjetas)) {
          tarjetas.forEach((c, i) => {
            if (!c || typeof c !== 'object') { avisos.push(`${f.ruta}: la tarjeta ${i + 1} no es un objeto; se omitió.`); return; }
            ts.push(tarjetaDesdeJSON(c));
          });
        } else if (tarjetas !== undefined) extra.tarjetas = tarjetas;
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

    E.base.secuencia = materias.map((m) => m.carpeta).join('|');
    const destino = construirDestino();
    const existentes = new Map();
    for (const [ruta, texto] of destino) if (mapa.has(ruta)) existentes.set(ruta, texto);
    for (const ruta of gestionados) if (!destino.has(ruta)) existentes.set(ruta, mapa.get(ruta));
    const crudos = new Map();
    for (const ruta of existentes.keys()) crudos.set(ruta, mapa.get(ruta));
    fijarBase(existentes, crudos);
    try {
      const idx = JSON.parse(mapa.get('index.json') || 'null');
      if (idx && Array.isArray(idx.materias)) E.base.indice = JSON.stringify(idx.materias);
    } catch { }
  }

  async function resolverDataDir(handle) {
    try { return await handle.getDirectoryHandle('data'); } catch { }
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

  // ---------- Imágenes ----------
  const MAX_LADO = 1200;

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
    } catch { }
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

  async function codificarImagen(lienzo) {
    let blob = await new Promise((ok) => lienzo.toBlob(ok, 'image/webp', 0.85));
    if (!blob || blob.type !== 'image/webp') {
      const c = document.createElement('canvas');
      c.width = lienzo.width; c.height = lienzo.height;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(lienzo, 0, 0);
      blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.88));
    }
    if (!blob) throw new Error('El navegador no pudo convertir la imagen.');
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const nombre = `p-${crc32(bytes).toString(16).padStart(8, '0')}-${bytes.length.toString(36)}.${ext}`;
    return { blob, nombre };
  }

  const LIMITE_BASE = 4096;

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
        <p class="pista">Arrastrá el recuadro para moverlo, y las esquinas o bordes para cambiarle el tamaño.</p>
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
      let dw = 0, dh = 0;
      let rect = null;
      let ratio = null;
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
      function rectRatio(r) {
        let w, h;
        if (dw / dh > r) { h = dh; w = dh * r; } else { w = dw; h = dw / r; }
        return { x: (dw - w) / 2, y: (dh - h) / 2, w, h };
      }

      function asas() {
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
        ctx.fillStyle = 'rgba(10, 5, 25, .62)';
        ctx.beginPath(); ctx.rect(0, 0, dw, dh); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.fill('evenodd');
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255, 243, 220, .35)';
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
        info.textContent = `Tamaño final: ${c.width} × ${c.height} px. En el juego se ve entera.`;
        clearTimeout(temporizadorTam);
        temporizadorTam = setTimeout(() => c.toBlob((b) => {
          if (b && d.open) info.textContent = `Tamaño final: ${c.width} × ${c.height} px (unos ${Math.max(1, Math.round(b.size / 1024))} KB). En el juego se ve entera.`;
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
          if (a.length === 2) {
            const sx = a.includes('w') ? -1 : 1, sy = a.includes('n') ? -1 : 1;
            const ax = sx > 0 ? r0.x : r0.x + r0.w, ay = sy > 0 ? r0.y : r0.y + r0.h;
            rect = desdeAncla(ax, ay, sx, sy, Math.max(MIN, (p.x - ax) * sx), Math.max(MIN, (p.y - ay) * sy));
          } else {
            let x1 = r0.x, y1 = r0.y, x2 = r0.x + r0.w, y2 = r0.y + r0.h;
            if (a === 'w') x1 = Math.min(p.x, x2 - MIN);
            if (a === 'e') x2 = Math.max(p.x, x1 + MIN);
            if (a === 'n') y1 = Math.min(p.y, y2 - MIN);
            if (a === 's') y2 = Math.max(p.y, y1 + MIN);
            rect = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
          }
        } else {
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

  const urlsImagen = new Map();
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

  // ---------- Escritura ----------
  async function dirDe(raiz, partes, crear) {
    let d = raiz;
    for (const p of partes) d = await d.getDirectoryHandle(p, { create: crear });
    return d;
  }

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
      if (partes.length) {
        try { const padre = await dirDe(raiz, partes.slice(0, -1), false); await padre.removeEntry(partes[partes.length - 1]); } catch { }
      }
    } catch { }
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

  // ---------- Estado ----------
  function renderEstado() {
    const plan = calcularPlan();
    E.plan = plan;
    const n = cantidadCambios(plan);
    const chip = $('#estado');
    if (!chip) return;
    const sucio = n > 0 || (plan.indiceCambio && E.materias.length > 0);
    chip.textContent = n > 0 ? `${plural(n, 'archivo', 'archivos')} con cambios` : (sucio ? 'Índice por actualizar' : 'Sin cambios');
    chip.classList.toggle('sucio', sucio);
    const b = $('#n-prob');
    if (!b) return;
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
    } catch { }
  }
  const guardarBorrador = debounce(escribirBorrador, 500);
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
    if (!b) return;
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
      avisar('Borrador restaurado');
    };
    $('#bn-desc').onclick = () => { try { localStorage.removeItem(CLAVE_BORRADOR); } catch { } b.hidden = true; };
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
  const cerrarModal = () => { const d = $('#modal'); if (d && d.open) d.close(); };
  const modalEl = $('#modal');
  if (modalEl) modalEl.addEventListener('click', (e) => { if (e.target === e.currentTarget) cerrarModal(); });

  // ---------- Lateral ----------
  function renderLateral() {
    const el = $('#lateral');
    if (!el) return;
    const c = E.analisis.conteo;
    const punto = (u) => {
      const x = c.get(u);
      return x?.e ? '<span class="punto err" title="Tiene errores"></span>' : x?.a ? '<span class="punto avi" title="Tiene avisos"></span>' : '';
    };
    el.innerHTML = `
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
    if (!cont) return;
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
        <div id="lista-c"></div>
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
      : '<div class="vacia">Este tema todavía no tiene tarjetas.</div>';
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
        <label class="campo"><span>Explicación</span><textarea rows="2" data-campo="q-explicacion">${esc(q.explicacion)}</textarea></label>
        <div class="campo-imagen">
          <span class="rotulo">Imagen (opcional)</span>
          ${q.imagen ? `<figure class="img-prev"><img data-img="${esc(q.imagen)}" alt=""><figcaption class="archivo">${esc(q.imagen)}</figcaption></figure>` : ''}
          <div class="acciones-q">
            <label class="btn chico" style="cursor:pointer">${q.imagen ? 'Cambiar imagen' : 'Elegir imagen'}<input type="file" accept="image/*" data-campo="q-imagen-archivo" hidden></label>
            ${q.imagen ? '<button class="btn chico peligro" data-accion="q-img-quitar">Quitar imagen</button>' : ''}
          </div>
          ${q.imagen ? `<label class="campo"><span>Descripción de la imagen</span><input type="text" data-campo="q-imagen-alt" value="${esc(q.imagenAlt)}"></label>` : ''}
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
      : `<div class="vacia">${t.preguntas.length ? 'Ninguna pregunta coincide con el filtro.' : 'Este tema no tiene preguntas de opción múltiple.'}</div>`;
  }

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
      if (chip) {
        chip.textContent = q.correcta || '?';
        chip.classList.toggle('vacio', !q.correcta);
      }
      const ul = card.querySelector('[data-problemas]');
      if (ul) ul.innerHTML = htmlProblemas(r);
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

  // ---------- Edición ----------
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
      case 'm-nombre': m.nombre = el.value; const tm = $('#titulo-materia'); if (tm) tm.textContent = `${m.emoji} ${m.nombre || 'Sin nombre'}`; break;
      case 'm-emoji': m.emoji = el.value.trim() || '📚'; const tm2 = $('#titulo-materia'); if (tm2) tm2.textContent = `${m.emoji} ${m.nombre || 'Sin nombre'}`; break;
      case 'm-color': m.color = el.value.toUpperCase(); break;
      case 't-nombre': t.nombre = el.value; const tt = $('#titulo-tema'); if (tt) tt.textContent = t.nombre || 'Tema sin nombre'; break;
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
      if (!recortada) return;
      const { blob, nombre } = await codificarImagen(recortada);
      E.imgs.set(nombre, blob);
      if (!E.imgExistentes.has(nombre)) E.imgNuevas.add(nombre);
      q.imagen = `data/img/${nombre}`;
      repintarPregunta(q);
      refrescar();
      avisar(`Imagen lista (${Math.max(1, Math.round(blob.size / 1024))} KB)`);
    } catch (err) {
      console.error(err);
      avisar('No se pudo leer esa imagen.');
    }
  }

  function hidratarImagenes() {
    const principal = $('#principal');
    if (!principal) return;
    $$('#principal img[data-img]:not([data-listo])').forEach(async (img) => {
      img.dataset.listo = '1';
      const ruta = img.dataset.img;
      const n = nombreImagen(ruta);
      const url = n ? await urlDeImagen(n) : (/^https:\/\/\S+$/i.test(ruta) ? ruta : null);
      if (url) img.src = url;
      else {
        const p = document.createElement('p');
        p.className = 'pista';
        p.textContent = 'No se puede mostrar la vista previa.';
        img.replaceWith(p);
      }
    });
  }
  const principalEl = $('#principal');
  if (principalEl) new MutationObserver(hidratarImagenes).observe(principalEl, { childList: true, subtree: true });

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

  // ---------- Acciones ----------
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
    if (!TIENE_API_CARPETAS) { $('#in-carpeta')?.click(); return; }
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
    const b = $('#banner'); if (b) b.hidden = true;
    pintarTodo();
    const n = E.materias.length;
    avisar(n ? `Abierto: ${plural(n, 'materia', 'materias')}` : 'La carpeta no tiene materias todavía');
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
      seleccionar(m.uid, t.uid);
      refrescar();
    },
    'mat-sube': () => { if (mover(E.materias, E.materias.indexOf(matActual()), -1)) pintarTodo(); },
    'mat-baja': () => { if (mover(E.materias, E.materias.indexOf(matActual()), 1)) pintarTodo(); },
    'mat-borrar': () => {
      const m = matActual();
      if (!window.confirm(`¿Eliminar la materia “${m.nombre}”?`)) return;
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
      catch { avisar('El navegador bloqueó el portapapeles.'); }
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
      if (!window.confirm(`¿Eliminar el tema “${t.nombre}”?`)) return;
      m.temas.splice(m.temas.indexOf(t), 1);
      seleccionar(m.uid);
      refrescar();
    },
    'abrir-todas': () => { const t = temaActual(); if (t) t.preguntas.forEach((q) => E.abiertas.add(q.uid)); renderPreguntas(); },
    'cerrar-todas': () => { E.abiertas.clear(); renderPreguntas(); },
    'q-nueva': () => {
      const t = temaActual();
      if (!t) return;
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
      if (!card || !t) return;
      const i = t.preguntas.findIndex((q) => q.uid === card.dataset.q);
      const q = t.preguntas[i];
      if (!q) return;
      if (E.abiertas.has(q.uid)) E.abiertas.delete(q.uid); else E.abiertas.add(q.uid);
      card.outerHTML = htmlPregunta(q, i);
      $(`[data-q="${q.uid}"] .preg-cab`)?.focus();
    },
    'q-sube': (el) => moverPregunta(el, -1),
    'q-baja': (el) => moverPregunta(el, 1),
    'q-dup': (el) => {
      const t = temaActual(), q = preguntaDe(el);
      if (!t || !q) return;
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
      if (!q) return;
      const orden = mezclar([0, 1, 2, 3]);
      const viejaCorrecta = LETRAS.indexOf(q.correcta);
      q.opciones = orden.map((i) => q.opciones[i]);
      if (viejaCorrecta >= 0) q.correcta = LETRAS[orden.indexOf(viejaCorrecta)];
      const t = temaActual();
      const card = el.closest('[data-q]');
      if (card && t) card.outerHTML = htmlPregunta(q, t.preguntas.indexOf(q));
      refrescar();
    },
    'c-nueva': () => {
      const t = temaActual();
      if (!t) return;
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
      if (!t || !c) return;
      const copia = JSON.parse(JSON.stringify(c));
      copia.uid = uid();
      t.tarjetas.splice(t.tarjetas.indexOf(c) + 1, 0, copia);
      renderTarjetas();
      refrescar();
      $(`[data-c="${copia.uid}"]`)?.scrollIntoView({ block: 'center' });
    },
    'c-borrar': (el) => {
      const t = temaActual(), c = tarjetaDe(el);
      if (!t || !c) return;
      if (!window.confirm('¿Eliminar esta tarjeta?')) return;
      t.tarjetas.splice(t.tarjetas.indexOf(c), 1);
      renderTarjetas();
      refrescar();
    },
    'c-prompt': () => abrirPromptTarjetas(),
    'q-img-quitar': (el) => {
      const q = preguntaDe(el);
      if (!q) return;
      q.imagen = '';
      q.imagenAlt = '';
      repintarPregunta(q);
      refrescar();
    },
    'q-borrar': (el) => {
      const t = temaActual(), q = preguntaDe(el);
      if (!t || !q) return;
      if (!window.confirm('¿Eliminar esta pregunta?')) return;
      t.preguntas.splice(t.preguntas.indexOf(q), 1);
      E.abiertas.delete(q.uid);
      renderPreguntas();
      refrescar();
    },
  };

  function moverTarjeta(el, d) {
    const t = temaActual(), c = tarjetaDe(el);
    if (!t || !c || !mover(t.tarjetas, t.tarjetas.indexOf(c), d)) return;
    renderTarjetas();
    refrescar();
    $(`[data-c="${c.uid}"]`)?.scrollIntoView({ block: 'center' });
  }

  function moverPregunta(el, d) {
    const t = temaActual(), q = preguntaDe(el);
    if (!t || !q || !mover(t.preguntas, t.preguntas.indexOf(q), d)) return;
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

  if (principalEl) {
    principalEl.addEventListener('input', onInput);
    principalEl.addEventListener('change', onChange);
  }

  // ---------- Importar LM ----------
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

  function normalizarLM(texto) {
    const r = extraerJSON(texto);
    if (r.error) return { error: r.error };
    const datos = r.datos;
    let materia = '', tema = '', lista, listaT;
    const esTarjeta = (x) => x && typeof x === 'object' && ('frente' in x || 'dorso' in x);
    if (Array.isArray(datos)) {
      if (datos.length && datos.every(esTarjeta)) listaT = datos; else lista = datos;
    } else if (datos && typeof datos === 'object') {
      materia = String(datos.materia ?? '').trim();
      tema = String(datos.tema ?? '').trim();
      lista = alias(datos, 'preguntas', 'questions');
      listaT = alias(datos, 'tarjetas', 'flashcards', 'cards');
    }
    if (!Array.isArray(lista) && !Array.isArray(listaT)) return { error: 'No encontré la lista "preguntas" ni la lista "tarjetas".' };
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
      }
      if (ops.length !== 4) errores.push(`Tiene ${ops.length} opciones (se necesitan 4).`);
      const bruto = alias(p, 'correcta', 'respuesta', 'respuesta_correcta', 'answer', 'correct');
      let letra = '';
      if (typeof bruto === 'number') {
        const idx = base1 ? bruto - 1 : bruto;
        if (idx >= 0 && idx < 4) { letra = LETRAS[idx]; }
      } else if (typeof bruto === 'string') {
        const s = bruto.trim();
        const m1 = s.match(/^\(?([A-Da-d])[\)\.\:]?$/);
        if (m1) letra = m1[1].toUpperCase();
        else {
          const j = ops.findIndex((o) => norm(o) === norm(s));
          const m2 = s.match(/^\(?([A-Da-d])[\)\.\:]\s/);
          if (j >= 0) { letra = LETRAS[j]; }
          else if (m2) { letra = m2[1].toUpperCase(); }
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
    return { materia, tema, items, tarjetas, nota: r.nota };
  }

  function abrirImportar() {
    const m0 = matActual(), t0 = temaActual();
    const d = abrirModal('Pegar JSON del LM', `
      <label class="campo"><span>Pegá el JSON devuelto por el modelo</span>
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
        <label class="check"><input type="checkbox" id="imp-omitir" ${omitir ? 'checked' : ''}> Omitir las que ya existen en el tema elegido</label>
        <label class="check"><input type="checkbox" id="imp-rotas" ${conRotas ? 'checked' : ''}> Importar también las que tienen errores</label>
        <ul class="vista-prev">${res.items.map((it) => `<li><span class="et ${etiqueta[it.estado][0]}">${etiqueta[it.estado][1]}</span>
          <span>${esc(it.q?.pregunta || '(vacía)')}</span></li>`).join('')}${res.tarjetas.map((x) => `<li><span class="et ${etiqueta[x.estado][0]}">${etiqueta[x.estado][1]}</span>
          <span>🃏 ${esc(x.c?.frente || '(vacía)')}</span></li>`).join('')}</ul>`;
      const total = aImportar.length + aImportarT.length;
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
      cerrarModal();
      seleccionar(m.uid, t.uid);
      refrescar();
      avisar(`Importación realizada con éxito en “${t.nombre}”`);
    };
    txt.focus();
  }

  const PROMPT_TARJETAS = "Sos un tutor experto en técnicas de estudio. Tu tarea es convertir el material en TARJETAS DE ESTUDIO tipo Anki.\n\nFORMATO DE SALIDA:\n{\n  \"materia\": \"[MATERIA]\",\n  \"tema\": \"[TEMA]\",\n  \"tarjetas\": [\n    { \"frente\": \"...\", \"dorso\": \"...\" }\n  ]\n}";

  function abrirPromptTarjetas() {
    const m = matActual(), t = temaActual();
    const texto = PROMPT_TARJETAS.replaceAll('[MATERIA]', m?.nombre || '[MATERIA]').replaceAll('[TEMA]', t?.nombre || '[TEMA]');
    const d = abrirModal('Prompt para tarjetas', `<textarea id="prompt-t" rows="12" readonly>${esc(texto)}</textarea>`,
      '<button class="btn" id="p-cerrar">Cerrar</button><button class="btn primario" id="p-copiar">Copiar prompt</button>');
    $('#p-cerrar', d).onclick = cerrarModal;
    $('#p-copiar', d).onclick = async () => {
      try { await navigator.clipboard.writeText(texto); avisar('Prompt copiado'); }
      catch { $('#prompt-t', d).select(); avisar('Copiá con Ctrl+C'); }
    };
  }

  function abrirBuscar() {
    const d = abrirModal('Buscar', `<input type="text" id="bus-q" placeholder="Buscar…"><div id="bus-res" style="margin-top:.8rem"></div>`);
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
        ? hits.map((h) => `<button class="resultado-busqueda" data-m="${h.m.uid}" data-t="${h.t.uid}" data-q="${h.q.uid}">${esc(h.tarjeta ? `🃏 ${h.q.frente || '(sin frente)'}` : (h.q.pregunta || '(sin enunciado)'))}<small>${esc(h.m.nombre)} › ${esc(h.t.nombre)}</small></button>`).join('')
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
      ? `<p class="nota"><b>${plural(errores, 'error', 'errores')}</b> y <b>${plural(avisos, 'aviso', 'avisos')}</b>.</p>
        ${ordenada.slice(0, 300).map((p, i) => `<button class="resultado-busqueda" data-i="${i}"><span class="et ${p.nivel === 'e' ? 'rota' : 'rep'}">${p.nivel === 'e' ? 'Error' : 'Aviso'}</span> ${esc(p.texto)}<small>${esc(p.donde)}</small></button>`).join('')}`
      : '<div class="nota"><b>Todo en orden.</b></div>');
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
    return archivos;
  }

  function abrirGuardar() {
    analizar();
    const plan = calcularPlan();
    E.plan = plan;
    const n = cantidadCambios(plan);
    const errores = E.analisis.errores;

    const d = abrirModal('Guardar cambios', `
      <div class="resumen-plan">
        <div class="nuevo"><b>${plan.nuevos.length}</b>nuevos</div>
        <div class="mod"><b>${plan.modificados.length}</b>modificados</div>
        <div class="borr"><b>${plan.borrados.length}</b>a borrar</div>
      </div>
      ${errores ? `<div class="nota mal"><b>Hay ${plural(errores, 'error', 'errores')}.</b> <button class="btn chico" id="g-ver">Verlos</button> <label class="check"><input type="checkbox" id="g-igual"> Guardar de todos modos</label></div>` : ''}
      <div id="g-estado"></div>`,
      `${TIENE_API_CARPETAS ? `<button class="btn primario" id="g-escribir">${E.handle ? 'Escribir en la carpeta' : 'Elegir carpeta y escribir'}</button>` : ''}
       <button class="btn ${TIENE_API_CARPETAS ? '' : 'primario'}" id="g-zip">Descargar ZIP</button>
       <button class="btn fantasma" id="g-cerrar">Cerrar</button>`);

    const botones = $$('#g-escribir, #g-zip', d);
    const bloqueo = () => {
      const bloqueado = errores > 0 && !$('#g-igual', d)?.checked;
      botones.forEach((b) => { b.disabled = bloqueado; });
    };
    bloqueo();
    $('#g-igual', d)?.addEventListener('change', bloqueo);
    $('#g-ver', d)?.addEventListener('click', abrirRevisar);
    $('#g-cerrar', d).onclick = cerrarModal;

    $('#g-zip', d).onclick = () => descargarZip(plan, false, d);
    const esc_ = $('#g-escribir', d);
    if (esc_) esc_.onclick = async () => {
      try {
        if (!E.handle) await elegirCarpetaEscritura();
        if (!(await asegurarPermiso(E.handle))) { avisar('Sin permiso de escritura.'); return; }
        const p = calcularPlan();
        for (const n of p.imagenes) await escribirArchivo(E.handle, `img/${n}`, E.imgs.get(n));
        for (const r of [...p.nuevos, ...p.modificados]) await escribirArchivo(E.handle, r, p.destino.get(r));
        for (const r of p.borrados) await borrarArchivo(E.handle, r);
        if (p.indiceCambio || cantidadCambios(p) > 0 || !E.base.archivos.size) await escribirArchivo(E.handle, 'index.json', textoIndice(p.indiceNuevo));
        fijarBase(p.destino, p.destino);
        refrescar();
        cerrarModal();
        avisar('Cambios guardados correctamente');
      } catch (e) {
        if (e.name === 'AbortError') return;
        console.error(e);
        $('#g-estado', d).innerHTML = `<div class="nota mal">Error: ${esc(e.message)}</div>`;
      }
    };
  }

  async function descargarZip(plan, soloCambios, d) {
    const archivos = await archivosParaZip(plan, soloCambios);
    descargar(`repaso-data-${marcaTiempo()}.zip`, crearZip(archivos));
    fijarBase(plan.destino, plan.destino);
    refrescar();
    cerrarModal();
    avisar('ZIP generado');
  }

  // ---------- Conexión inicial ----------
  $('#btn-abrir')?.addEventListener('click', abrirCarpeta);
  $('#btn-importar')?.addEventListener('click', abrirImportar);
  $('#btn-buscar')?.addEventListener('click', abrirBuscar);
  $('#btn-revisar')?.addEventListener('click', abrirRevisar);
  $('#btn-guardar')?.addEventListener('click', abrirGuardar);
  $('#in-carpeta')?.addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const mapa = await leerDesdeInput(files);
    E.handle = null;
    leerImagenesDesdeInput(files);
    cargarArchivos(mapa);
    despuesDeCargar(mapa);
  });

  fijarBase(new Map(), new Map());
  pintarTodo();
  revisarBorrador();
})();