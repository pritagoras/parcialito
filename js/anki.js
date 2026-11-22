// ==========================================================
// anki.js: Tarjetas tipo Anki (repaso espaciado SM-2).
// (Parte de la división de app.js; ver README.)
// ==========================================================

import { estado, guardar, hash } from './store.js?v=20261112-1';
import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';
import { cargarTema } from './datos.js';
import { vistaInicio } from './home.js';
import { vistaMateria } from './materia.js';
import { S, app, avisar, cacheTarjetas, esc, mezclar, plural, vistaCargando } from './nucleo.js';
import { vistaError } from './partidas.js';

const NUEVAS_POR_DIA = 10;   // tarjetas nuevas que se agregan por día

const MAX_REPASOS = 200;     // tope de tarjetas a repasar en una sesión

const diaHoy = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);

export function normalizarTarjetas(json, tema, materia) {
  const salida = [];
  (Array.isArray(json.tarjetas) ? json.tarjetas : []).forEach((c, n) => {
    const frente = String(c?.frente ?? c?.pregunta ?? '').trim();
    const dorso = String(c?.dorso ?? c?.respuesta ?? '').trim();
    if (!frente || !dorso) {
      console.warn(`[Repaso] Tarjeta ${n + 1} de "${tema.id}" descartada: le falta el frente o el dorso.`);
      return;
    }
    salida.push({ id: hash(`t|${frente}`), frente, dorso, tema: tema.nombre, temaId: tema.id, materia: materia.nombre });
  });
  return salida;
}

export async function cargarTodas() {
  const listas = await Promise.all(S.indice.materias.flatMap((m) => m.temas.map((t) => cargarTema(t, m))));
  const mapa = new Map();
  for (const lista of listas) for (const q of lista) if (!mapa.has(q.id)) mapa.set(q.id, q);
  return mapa;
}

const memoria = () => (estado.tarjetas ||= {});

function nuevasHoy() {
  const hoy = diaHoy();
  if (estado.tarjetasHoy?.dia !== hoy) estado.tarjetasHoy = { dia: hoy, nuevas: 0 };
  return estado.tarjetasHoy;
}

function todasLasTarjetas() {
  const vistas = new Set(), lista = [];
  for (const m of S.indice.materias) {
    const fuentes = [...m.temas, ...(m.segundoParcial?.autores || [])];
    for (const t of fuentes) {
      for (const c of cacheTarjetas.get(t.id) || []) if (!vistas.has(c.id)) { vistas.add(c.id); lista.push(c); }
    }
  }
  return lista;
}

function resumenTarjetas(extra = 0) {
  const hoy = diaHoy(), mem = memoria(), todas = todasLasTarjetas();
  const pendientes = todas.filter((c) => mem[c.id] && mem[c.id].prox <= hoy).sort((x, y) => mem[x.id].prox - mem[y.id].prox);
  const nuevas = todas.filter((c) => !mem[c.id]);
  const cupo = Math.max(0, NUEVAS_POR_DIA - nuevasHoy().nuevas) + extra;
  return { total: todas.length, pendientes, nuevas, cupo, nNuevas: Math.min(cupo, nuevas.length) };
}

function programar(est, aprendiendo, r) {
  const ef0 = est?.ef ?? 2.5, iv0 = est?.iv ?? 0, l0 = est?.l ?? 0;
  if (r === 1) {
    const castiga = !!est && !aprendiendo;
    return { vuelve: true, ef: castiga ? Math.max(1.3, ef0 - 0.2) : ef0, iv: 0, l: castiga ? l0 + 1 : l0 };
  }
  if (aprendiendo) {
    if (r === 2) return { vuelve: true, ef: ef0, iv: 0, l: l0 };
    return { vuelve: false, ef: r === 4 ? ef0 + 0.15 : ef0, iv: r === 4 ? (est ? 3 : 4) : 1, l: l0 };
  }
  if (r === 2) return { vuelve: false, ef: Math.max(1.3, ef0 - 0.15), iv: Math.max(iv0 + 1, Math.round(iv0 * 1.2)), l: l0 };
  if (r === 3) return { vuelve: false, ef: ef0, iv: Math.max(iv0 + 1, Math.round(iv0 * ef0)), l: l0 };
  return { vuelve: false, ef: ef0 + 0.15, iv: Math.max(iv0 + 2, Math.round(iv0 * ef0 * 1.3)), l: l0 };
}

const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const vibrar = (ms) => { if (!estado.silencio) navigator.vibrate?.(ms); };

function activarInclinacion(flip) {
  if (sinMovimiento() || !window.matchMedia('(hover: hover)').matches) return;
  const poner = (ry, rx, mx, my) => {
    flip.style.setProperty('--ry', `${ry}deg`);
    flip.style.setProperty('--rx', `${rx}deg`);
    flip.style.setProperty('--mx', `${mx}%`);
    flip.style.setProperty('--my', `${my}%`);
  };
  flip.addEventListener('pointermove', (e) => {
    if (flip.classList.contains('girando')) return;
    const b = flip.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    poner(((x - 0.5) * 9).toFixed(2), ((0.5 - y) * 7).toFixed(2), (x * 100).toFixed(1), (y * 100).toFixed(1));
  });
  flip.addEventListener('pointerleave', () => poner(0, 0, 50, 30));
}

function fmtIntervalo(d) {
  if (d <= 1) return '1 día';
  if (d < 30) return `${d} días`;
  if (d < 365) { const m = Math.round((d / 30) * 10) / 10; return `${String(m).replace('.', ',')} ${m === 1 ? 'mes' : 'meses'}`; }
  const y = Math.round((d / 365) * 10) / 10;
  return `${String(y).replace('.', ',')} ${y === 1 ? 'año' : 'años'}`;
}

export function pintarTarjetasInicio() {
  const zona = document.getElementById('zona-tarjetas');
  if (!zona) return;
  const r = resumenTarjetas();
  if (!r.total) { zona.innerHTML = ''; return; }
  const n = r.pendientes.length + r.nNuevas;
  if (n) {
    zona.innerHTML = `<button class="banner-repaso" id="btn-tarjetas"><span>🃏 Repaso de hoy<small>${r.pendientes.length} para repasar · ${r.nNuevas} ${r.nNuevas === 1 ? 'nueva' : 'nuevas'}</small></span><b>${n}</b></button>`;
    document.getElementById('btn-tarjetas').addEventListener('click', () => { Sonido.clic(); lanzarTarjetas(); });
  } else {
    zona.innerHTML = `<p class="al-dia">🃏 Tarjetas al día: ¡hasta mañana!${r.nuevas.length ? ' <button class="btn enlace" id="btn-mas-tarjetas">Estudiar nuevas igual</button>' : ''}</p>`;
    document.getElementById('btn-mas-tarjetas')?.addEventListener('click', () => { Sonido.clic(); lanzarTarjetas(NUEVAS_POR_DIA); });
  }
}

function lanzarTarjetas(extra = 0) {
  vistaCargando('Preparando tus tarjetas…');
  cargarTodas().then(() => {
    const r = resumenTarjetas(extra);
    const cola = mezclar([...r.pendientes.slice(0, MAX_REPASOS), ...r.nuevas.slice(0, r.cupo)]);
    if (!cola.length) { vistaInicio(); avisar('No tenés tarjetas para hoy'); return; }
    empezarTarjetas(cola, () => vistaInicio());
  }).catch(vistaError);
}

export async function lanzarTarjetasTemas(materia, temas, alFinalizar = null) {
  vistaCargando('Preparando tarjetas…');
  try {
    for (const t of temas) await cargarTema(t, materia);
    const hoy = diaHoy();
    const mem = memoria();

    const tarjetasTema = [];
    for (const t of temas) {
      for (const c of cacheTarjetas.get(t.id) || []) tarjetasTema.push(c);
    }

    if (!tarjetasTema.length) {
      const iM = S.indice.materias.indexOf(materia);
      if (iM >= 0) vistaMateria(iM); else vistaInicio();
      avisar('Los temas seleccionados no tienen tarjetas');
      return;
    }

    const pendientes = tarjetasTema.filter((c) => mem[c.id] && mem[c.id].prox <= hoy).sort((x, y) => mem[x.id].prox - mem[y.id].prox);
    const nuevas = tarjetasTema.filter((c) => !mem[c.id]);

    let cola = [];
    if (pendientes.length > 0 || nuevas.length > 0) {
      const cupo = Math.max(0, NUEVAS_POR_DIA - nuevasHoy().nuevas);
      cola = mezclar([...pendientes.slice(0, MAX_REPASOS), ...nuevas.slice(0, cupo)]);
    }
    
    if (!cola.length) {
      cola = mezclar([...tarjetasTema]);
    }

    const iMateria = S.indice.materias.indexOf(materia);
    empezarTarjetas(cola, alFinalizar || (() => vistaMateria(iMateria >= 0 ? iMateria : 0)));
  } catch (e) {
    vistaError(e);
  }
}

function empezarTarjetas(cola, volver = () => vistaInicio()) {
  const mem = memoria();
  S.sesionT = {
    cola: [...cola],
    total: cola.length,
    hechas: 0,                 
    nuevasVistas: 0, repasadas: 0, otraVez: 0,
    origen: new Map(cola.map((c) => [c.id, mem[c.id] ? 'repaso' : 'nueva'])),
    fallada: new Set(),        
    nuevaContada: new Set(),
    volteada: false,
    volver,
  };
  app.innerHTML = `
    <main class="pantalla">
      <div class="hud">
        <button class="icono" id="btn-salir" aria-label="Salir (se guarda lo que ya hiciste)">✕</button>
        <div class="progreso" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${cola.length}" aria-valuenow="0"><div class="barra" id="barra"></div></div>
        <div class="contadores-t" id="contadores-t" aria-label="Tarjetas pendientes"></div>
      </div>
      <div id="zona-t"></div>
    </main>`;
  document.getElementById('btn-salir').addEventListener('click', () => {
    Sonido.clic();
    const v = S.sesionT?.volver || vistaInicio;
    S.sesionT = null;
    guardar();
    v();
  });
  mostrarTarjeta();
  window.scrollTo(0, 0);
}

function pintarContadoresT() {
  const s = S.sesionT, mem = memoria();
  const aprendiendo = (c) => !!mem[c.id] && (mem[c.id].iv === 0 || s.fallada.has(c.id));
  const nNuevas = s.cola.filter((c) => !mem[c.id]).length;
  const nAprend = s.cola.filter(aprendiendo).length;
  const nRepaso = s.cola.length - nNuevas - nAprend;
  document.getElementById('contadores-t').innerHTML =
    `<span class="c-nueva" title="Nuevas">${nNuevas}</span><span class="c-aprend" title="Olvidadas, a recuperar">${nAprend}</span><span class="c-repaso" title="A repasar">${nRepaso}</span>`;
  document.getElementById('barra').style.width = `${(s.hechas / s.total) * 100}%`;
  document.querySelector('.progreso').setAttribute('aria-valuenow', String(s.hechas));
}

function mostrarTarjeta() {
  const s = S.sesionT, c = s.cola[0];
  s.volteada = false;
  pintarContadoresT();
  document.getElementById('zona-t').innerHTML = `
    <div class="flip entra" id="flip" role="button" tabindex="0" aria-label="Tarjeta. Tocá para ver la respuesta">
      <div class="flip-tilt">
        <div class="flip-interno">
          <div class="cara frente">
            <p class="tema-etq">${esc(c.tema)}</p>
            <div class="texto-t">${esc(c.frente)}</div>
            <p class="pista-t">Tocá la tarjeta para darla vuelta</p>
          </div>
          <div class="cara dorso" aria-hidden="true">
            <p class="tema-etq">Respuesta</p>
            <div class="texto-t">${esc(c.dorso)}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="acciones-t" id="acciones-t"><button class="btn primario" id="btn-voltear">Mostrar respuesta</button></div>
    <p class="ayuda-valorar" id="ayuda-valorar" hidden>Marcá qué tan bien la sabías: cuanto más fácil, más tarde vuelve a aparecer.</p>
    <p class="ayuda-teclas">Teclado: Espacio da vuelta la tarjeta · 1 Otra vez · 2 Difícil · 3 Bien · 4 Fácil</p>`;
  const flip = document.getElementById('flip');
  flip.addEventListener('click', voltearTarjeta);
  flip.addEventListener('animationend', (e) => { if (e.animationName === 'entra') flip.classList.remove('entra'); });
  activarInclinacion(flip);
  document.getElementById('btn-voltear').addEventListener('click', voltearTarjeta);
}

export function voltearTarjeta() {
  const s = S.sesionT;
  if (!s || s.volteada) return;
  s.volteada = true;
  const c = s.cola[0], est = memoria()[c.id];
  const aprendiendo = !est || est.iv === 0 || s.fallada.has(c.id);
  const flip = document.getElementById('flip');
  flip.classList.remove('entra');
  flip.style.setProperty('--ry', '0deg');
  flip.style.setProperty('--rx', '0deg');
  flip.classList.add('volteada');
  if (!sinMovimiento()) {
    flip.classList.add('girando');
    setTimeout(() => flip.classList.remove('girando'), 950);
  }
  flip.setAttribute('aria-label', 'Tarjeta dada vuelta');
  flip.querySelector('.frente').setAttribute('aria-hidden', 'true');
  flip.querySelector('.dorso').removeAttribute('aria-hidden');

  const botones = [[1, 'Otra vez', 'otra'], [2, 'Difícil', 'dificil'], [3, 'Bien', 'bien'], [4, 'Fácil', 'facil']];
  document.getElementById('acciones-t').innerHTML = botones.map(([r, txt, clase]) => {
    const p = programar(est, aprendiendo, r);
    return `<button class="valorar ${clase}" data-r="${r}" style="--i:${r - 1}"><b>${txt}</b><small>${p.vuelve ? '< 10 min' : fmtIntervalo(p.iv)}</small></button>`;
  }).join('');
  document.querySelectorAll('.valorar').forEach((b) => b.addEventListener('click', () => valorarTarjeta(Number(b.dataset.r))));
  Sonido.voltear ? Sonido.voltear() : Sonido.clic();
  vibrar(12);
  document.getElementById('ayuda-valorar').hidden = false;
}

export function valorarTarjeta(r) {
  const s = S.sesionT;
  if (!s || !s.volteada || s.bloqueada) return;
  const c = s.cola.shift();
  const mem = memoria(), est = mem[c.id], hoy = diaHoy();
  const aprendiendo = !est || est.iv === 0 || s.fallada.has(c.id);
  const res = programar(est, aprendiendo, r);

  if (!est && !s.nuevaContada.has(c.id)) {
    s.nuevaContada.add(c.id);
    nuevasHoy().nuevas++;
    s.nuevasVistas++;
  }
  if (r === 1) { s.fallada.add(c.id); s.otraVez++; }
  if (!(res.vuelve && !est)) mem[c.id] = { ef: res.ef, iv: res.iv, prox: hoy + res.iv, l: res.l };

  if (res.vuelve) {
    s.cola.splice(Math.min(s.cola.length, r === 1 ? 3 : 6), 0, c);
  } else {
    s.hechas++;
    if (s.origen.get(c.id) === 'repaso') s.repasadas++;
  }
  guardar();
  if (Sonido.valorar) Sonido.valorar(r); else if (r >= 3) Sonido.acierto(1); else Sonido.clic();
  vibrar(r === 1 ? [10, 40, 10] : 8);

  const siguiente = () => {
    if (S.sesionT !== s) return;
    s.bloqueada = false;
    if (!s.cola.length) terminarTarjetas(); else mostrarTarjeta();
  };
  const flip = document.getElementById('flip');
  if (flip && !sinMovimiento()) {
    s.bloqueada = true;
    flip.classList.remove('girando', 'entra');
    flip.classList.add(`sale-${r}`);
    setTimeout(siguiente, 300);
  } else {
    siguiente();
  }
}

function terminarTarjetas() {
  const s = S.sesionT;
  const volver = s?.volver || vistaInicio;
  S.sesionT = null;
  guardar();
  const hoy = diaHoy();
  const r = resumenTarjetas();
  const manana = Object.values(memoria()).filter((v) => v.prox <= hoy + 1).length;
  app.innerHTML = `
    <main class="pantalla resultado">
      <div class="grande" aria-hidden="true">🎉</div>
      <h1>¡Listo por hoy!</h1>
      <p class="sub">Terminaste tu repaso de tarjetas.</p>
      <div class="cifras">
        <div class="cifra"><b>${s.nuevasVistas}</b><span>Nuevas</span></div>
        <div class="cifra"><b>${s.repasadas}</b><span>Repasadas</span></div>
        <div class="cifra"><b>${s.otraVez}</b><span>Otra vez</span></div>
      </div>
      <p class="estado-ranking">Para mañana: ${plural(manana, 'tarjeta', 'tarjetas')}.</p>
      <div class="botones">
        ${r.nuevas.length ? `<button class="btn primario" id="btn-mas">Estudiar ${Math.min(NUEVAS_POR_DIA, r.nuevas.length)} nuevas más</button>` : ''}
        <button class="btn ${r.nuevas.length ? 'secundario' : 'primario'}" id="btn-inicio">Volver</button>
      </div>
    </main>`;
  document.getElementById('btn-mas')?.addEventListener('click', () => { Sonido.clic(); lanzarTarjetas(NUEVAS_POR_DIA); });
  document.getElementById('btn-inicio').addEventListener('click', () => { Sonido.clic(); volver(); });
  Sonido.fin(true);
  lanzarConfeti(s.hechas ? 80 : 30);
  window.scrollTo(0, 0);
}
