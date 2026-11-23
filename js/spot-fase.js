import { Sonido } from './sonido.js?v=dev';

// Juego "Encontrá la fase": tocar las células que cumplen lo que piden antes de que se acabe el tiempo.
// Dos modos:
//  · fases:   encontrar la fase de la mitosis (profase, metafase, anafase, telofase).
//  · ploidia: encontrar "2n · 2C en G1", "n · 1C en telofase II"… (modelo 2n = 4, mitosis y meiosis).
// Se abre desde el banner del inicio.

export const TITULO_SPOT_FASE = 'Encontrá la fase';

const CLAVE_MEJOR = 'parcialito-spot-fase-mejor'; // récord del modo "fases" (se conserva la clave original)
const claveMejor = (modo) => (modo === 'fases' ? CLAVE_MEJOR : CLAVE_MEJOR + '-' + modo);

const MODOS = {
  fases: {
    estados: {
      interfase: { nombre: 'Interfase' },
      profase: { nombre: 'Profase' },
      metafase: { nombre: 'Metafase' },
      anafase: { nombre: 'Anafase' },
      telofase: { nombre: 'Telofase' }
    },
    objetivos: ['profase', 'metafase', 'anafase', 'telofase'],
    celulas: (nivel) => Math.min(12 + nivel * 2, 32),
    aciertos: (nivel) => Math.min(3 + Math.floor(nivel / 2), 6),
    tiempo: (nivel) => Math.max(7, 18 - nivel),
    densidad: 0.5,
    guiaBoton: '¿Cómo reconocer cada fase?',
    guia: `
      <p><b>Interfase:</b> núcleo redondo con nucleolo visible; la cromatina está difusa.</p>
      <p><b>Profase:</b> la cromatina se condensa en cromosomas como hilos; desaparecen el nucleolo y la envoltura nuclear.</p>
      <p><b>Metafase:</b> cromosomas alineados en el plano ecuatorial, unidos a las fibras del huso.</p>
      <p><b>Anafase:</b> las cromátidas hermanas se separan y viajan a polos opuestos (forma de V).</p>
      <p><b>Telofase:</b> dos núcleos nuevos y la célula se estrangula (citocinesis).</p>`
  },
  ploidia: {
    estados: {
      g1: { nombre: 'G1', sub: '2n · 2C' },
      g2: { nombre: 'G2', sub: '2n · 4C' },
      mprofase: { nombre: 'Profase mitótica', sub: '2n · 4C' },
      mmetafase: { nombre: 'Metafase mitótica', sub: '2n · 4C' },
      manafase: { nombre: 'Anafase mitótica', sub: '2C por polo' },
      mtelofase: { nombre: 'Telofase mitótica', sub: '2n · 2C por núcleo' },
      p1: { nombre: 'Profase I', sub: '2n · 4C' },
      m1: { nombre: 'Metafase I', sub: '2n · 4C' },
      a1: { nombre: 'Anafase I', sub: '2n · 4C' },
      t1: { nombre: 'Telofase I', sub: 'n · 2C por núcleo' },
      m2: { nombre: 'Metafase II', sub: 'n · 2C' },
      a2: { nombre: 'Anafase II', sub: '1C por polo' },
      t2: { nombre: 'Telofase II', sub: 'n · 1C por núcleo' }
    },
    objetivos: ['g1', 'g2', 'mprofase', 'mmetafase', 'manafase', 'mtelofase', 'p1', 'm1', 'a1', 't1', 'm2', 'a2', 't2'],
    celulas: (nivel) => Math.min(8 + nivel * 2, 22),
    aciertos: (nivel) => Math.min(2 + Math.floor(nivel / 2), 5),
    tiempo: (nivel) => Math.max(10, 24 - nivel * 1.2),
    densidad: 0.55,
    guiaBoton: '¿Cómo leer 2n y C?',
    guia: `
      <p><b>Modelo 2n = 4:</b> dos pares de homólogos, uno largo y otro corto. <b style="color:#b794ff">Violeta</b> = materno y <b style="color:#ff9a6b">naranja</b> = paterno.</p>
      <p><b>n / 2n:</b> cuenta cromosomas por núcleo; 2n = 4 cromosomas y n = 2.</p>
      <p><b>C:</b> cuenta el ADN. Un cromosoma simple es 1C por copia; duplicado (con dos cromátidas, forma de X) vale el doble. G1 = 2n · 2C y G2 = 2n · 4C.</p>
      <p><b>Mitosis:</b> los cromosomas duplicados se alinean de a uno en la metafase, las cromátidas se separan en la anafase y cada núcleo hijo queda 2n · 2C.</p>
      <p><b>Meiosis I:</b> los homólogos se aparean (bivalentes), se alinean de a pares y se separan duplicados. Cada núcleo queda n · 2C.</p>
      <p><b>Meiosis II:</b> se separan las cromátidas; cada núcleo final queda n · 1C.</p>`
  }
};

const css = `
.spf{max-width:600px;margin:0 auto;padding:clamp(12px,3vw,24px) 14px 28px;color:var(--crema);user-select:none;-webkit-user-select:none;touch-action:manipulation}
.spf [hidden]{display:none!important}
.spf-back{display:inline-flex;align-items:center;gap:8px;margin:0 0 14px;padding:9px 14px;border:1px solid var(--linea);border-radius:999px;background:var(--panel);color:var(--crema);font-weight:600;font-size:13px;line-height:1.2;font-family:inherit;cursor:pointer}
.spf-back:hover{border-color:var(--violeta)}
.spf-cab{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.spf-cab h1{margin:0;font-size:clamp(1.4rem,5vw,1.9rem);letter-spacing:-.02em}
.spf-sello{padding:4px 8px;border-radius:7px;font-size:.62rem;font-weight:900;letter-spacing:.09em;color:#2a1a00;background:var(--ambar)}
.spf-stage{position:relative;border:1px solid var(--linea);border-radius:20px;padding:14px 12px 16px;background:linear-gradient(160deg,var(--panel),#1a1236)}
.spf-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:.95rem}
.spf-top b{font-variant-numeric:tabular-nums}
.spf-racha{padding:3px 10px;border-radius:999px;background:#ff9a2e;color:#fff;font-weight:800;font-size:.85rem;transition:transform .15s}
.spf-racha.pop{transform:scale(1.25)}
.spf-prompt{text-align:center;margin:14px 0 8px}
.spf-prompt .l{font-size:.85rem;color:var(--tenue)}
.spf-prompt .t{font-size:clamp(1.7rem,7vw,2.1rem);font-weight:800;line-height:1.1}
.spf-prompt small{font-size:.85rem;color:var(--tenue);font-weight:600;margin-left:8px}
.spf-sub{margin-top:4px;color:var(--ambar);font-weight:800;font-size:1.15rem;letter-spacing:.02em}
.spf-bar{height:8px;border-radius:99px;background:var(--panel-2);overflow:hidden;margin:6px auto 12px;max-width:520px}
.spf-bar i{display:block;height:100%;width:100%;background:var(--violeta);border-radius:99px}
.spf-field{position:relative;width:100%}
.spf canvas{display:block;margin:0 auto;border-radius:50%;box-shadow:0 8px 28px rgba(0,0,0,.4)}
.spf-msg{position:absolute;left:0;right:0;bottom:-4px;text-align:center;font-weight:800;font-size:.95rem;min-height:22px;pointer-events:none;opacity:0;transition:opacity .25s;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.spf-help{display:block;margin:20px auto 0;border:1px solid var(--linea);background:var(--panel);color:var(--crema);border-radius:12px;padding:9px 14px;font:inherit;font-size:.85rem;cursor:pointer}
.spf-help:hover{border-color:var(--violeta)}
.spf-guide{margin-top:12px;background:var(--panel);border:1px solid var(--linea);border-radius:14px;padding:6px 14px;font-size:.85rem;line-height:1.45}
.spf-guide p{margin:9px 0;color:#d9cff2}
.spf-guide b{color:var(--ambar)}
.spf-overlay{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:24px;border-radius:20px;background:rgba(23,15,46,.96)}
.spf-overlay h2{margin:0;font-size:1.7rem;color:var(--crema)}
.spf-overlay p{margin:0;max-width:340px;line-height:1.5;color:var(--tenue)}
.spf-overlay .rec{color:var(--ambar);font-weight:700;min-height:1.2em;font-size:.9rem}
.spf-modos{display:grid;gap:10px;width:100%;max-width:340px;margin-top:6px}
.spf-modos button{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:13px 15px;border:1px solid var(--linea);border-radius:14px;background:var(--panel-2);color:var(--crema);font-family:inherit;font-size:1rem;font-weight:800;cursor:pointer;transition:border-color .15s,transform .15s}
.spf-modos button:hover{border-color:var(--violeta);transform:translateY(-1px)}
.spf-modos button small{color:var(--tenue);font-size:.78rem;font-weight:500;line-height:1.35}
`;

function inyectarEstilos() {
  const previo = document.getElementById('spf-css');
  if (previo) previo.remove();
  const st = document.createElement('style');
  st.id = 'spf-css';
  st.textContent = css;
  document.head.appendChild(st);
}

// Lo reutiliza el juego de herencia (js/spot-herencia.js) para compartir el mismo aspecto.
export function estilosSpot() { inyectarEstilos(); }

const elegir = (a) => a[Math.floor(Math.random() * a.length)];
function mezclar(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Colores y largos del modelo 2n = 4 (dos pares de homólogos: uno largo y otro corto)
const COL_M = '#5a2a8c'; // materno
const COL_P = '#c2572a'; // paterno
const LARGO = 0.34;
const CORTO = 0.2;

export function abrirSpotFase({ app, volver }) {
  inyectarEstilos();

  app.innerHTML = `<main class="spf">
    <button type="button" class="spf-back" data-spf-volver>← <span>Volver a Parcialito</span></button>
    <header class="spf-cab"><span class="spf-sello">NUEVO JUEGO</span><h1>Encontrá la fase</h1></header>
    <section class="spf-stage">
      <div class="spf-top">
        <div data-spf="vidas"></div>
        <div>Puntos <b data-spf="puntos">0</b></div>
        <div class="spf-racha" data-spf="racha">🔥×1</div>
      </div>
      <div class="spf-prompt">
        <div class="l">Tocá cada célula en</div>
        <div><span class="t" data-spf="objetivo">…</span><small data-spf="cuenta"></small></div>
        <div class="spf-sub" data-spf="sub" hidden></div>
      </div>
      <div class="spf-bar"><i data-spf="barra"></i></div>
      <div class="spf-field"><canvas data-spf="lienzo"></canvas><div class="spf-msg" data-spf="msg"></div></div>
      <div class="spf-overlay" data-spf="overlay">
        <h2 data-spf="ov-titulo">Encontrá la fase</h2>
        <p data-spf="ov-texto">Tocá todas las células que cumplan lo que te piden antes de que se acabe el tiempo. Si te equivocás, perdés una vida.</p>
        <p class="rec" data-spf="ov-rec"></p>
        <div class="spf-modos">
          <button type="button" data-modo="fases">🔬 Fases de la mitosis<small>Profase, metafase, anafase y telofase.</small></button>
          <button type="button" data-modo="ploidia">🧬 Ploidía y ADN<small>Encontrá "2n · 2C en G1" o "n · 1C en telofase II". Mitosis y meiosis.</small></button>
        </div>
      </div>
    </section>
    <button type="button" class="spf-help" data-spf="ayuda">¿Cómo reconocer cada fase?</button>
    <div class="spf-guide" data-spf="guia" hidden></div>
  </main>`;

  const raiz = app.querySelector('.spf');
  const $ = (n) => raiz.querySelector(`[data-spf="${n}"]`);
  const cv = $('lienzo');
  const ctx = cv.getContext('2d');

  const estado = {
    juego: 'fases', modo: 'inactivo', nivel: 0, puntos: 0, vidas: 3, racha: 0, tiempo: 0, tiempoMax: 1,
    objetivo: '', k: 3, halladas: 0, revelar: false, celulas: [], motas: [], ultimoObjetivo: ''
  };
  let S = 400, dpr = 1, vivo = true, raf = 0, msgTimer = null;
  const mejores = { fases: 0, ploidia: 0 };
  for (const m of Object.keys(mejores)) {
    try { mejores[m] = +localStorage.getItem(claveMejor(m)) || 0; } catch (e) { /* sin almacenamiento */ }
  }
  const textoRecords = () => (mejores.fases || mejores.ploidia)
    ? 'Récords · Fases: ' + mejores.fases + ' · Ploidía: ' + mejores.ploidia : '';
  $('ov-rec').textContent = textoRecords();

  const luego = (fn, ms) => setTimeout(() => { if (vivo && cv.isConnected) fn(); }, ms);
  const modo = () => MODOS[estado.juego];
  const info = (id) => modo().estados[id];

  function aplicarGuia() {
    $('guia').innerHTML = modo().guia;
    $('ayuda').textContent = modo().guiaBoton;
  }
  aplicarGuia();

  /* ---------- tamaño ---------- */
  function ajustar() {
    const w = raiz.querySelector('.spf-field').clientWidth || 360;
    S = Math.max(260, Math.floor(Math.min(w, 560, window.innerHeight - 290)));
    dpr = window.devicePixelRatio || 1;
    cv.width = S * dpr; cv.height = S * dpr;
    cv.style.width = S + 'px'; cv.style.height = S + 'px';
  }
  window.addEventListener('resize', ajustar);

  /* ---------- ronda ---------- */
  function nuevaRonda() {
    const M = modo();
    const n = M.celulas(estado.nivel);
    const k = M.aciertos(estado.nivel);
    let objetivo;
    do { objetivo = elegir(M.objetivos); } while (objetivo === estado.ultimoObjetivo);
    Object.assign(estado, { ultimoObjetivo: objetivo, objetivo, k, halladas: 0, revelar: false });
    estado.tiempoMax = estado.tiempo = M.tiempo(estado.nivel);

    const fases = [];
    for (let i = 0; i < k; i++) fases.push(objetivo);
    const otras = Object.keys(M.estados).filter((p) => p !== objetivo);
    for (let i = k; i < n; i++) fases.push(elegir(otras));
    mezclar(fases);

    let rho = Math.sqrt(M.densidad / n), puestas = [];
    for (let intento = 0; intento < 40; intento++) {
      puestas = [];
      let ok = true;
      for (let i = 0; i < n && ok; i++) {
        let listo = false;
        for (let a = 0; a < 300 && !listo; a++) {
          const ang = Math.random() * Math.PI * 2;
          const d = Math.sqrt(Math.random()) * (0.96 - 1.3 * rho);
          const u = Math.cos(ang) * d, v = Math.sin(ang) * d;
          if (puestas.every((q) => Math.hypot(q.u - u, q.v - v) >= 2.2 * rho)) { puestas.push({ u, v }); listo = true; }
        }
        if (!listo) ok = false;
      }
      if (ok) break;
      rho *= 0.95;
    }
    estado.celulas = puestas.map((p, i) => ({
      u: p.u, v: p.v, rho, fase: fases[i], rot: Math.random() * Math.PI * 2,
      n: Array.from({ length: 40 }, Math.random), resuelta: false, falloEn: 0
    }));
    estado.motas = Array.from({ length: 70 }, () => ({ u: Math.random() * 2 - 1, v: Math.random() * 2 - 1, r: Math.random() * 2 + 0.5 }));
    estado.modo = 'jugando';
    const obj = info(objetivo);
    $('objetivo').textContent = obj.nombre;
    const sub = $('sub');
    sub.hidden = !obj.sub;
    sub.textContent = obj.sub || '';
    actualizarHud();
  }

  /* ---------- HUD ---------- */
  function actualizarHud() {
    $('vidas').textContent = '❤️'.repeat(Math.max(0, estado.vidas)) + '🖤'.repeat(Math.max(0, 3 - estado.vidas));
    $('puntos').textContent = estado.puntos;
    $('racha').textContent = '🔥×' + (1 + Math.floor(estado.racha / 4));
    $('cuenta').textContent = estado.halladas + ' de ' + estado.k;
  }
  function decir(texto, color) {
    const m = $('msg');
    m.textContent = texto; m.style.color = color || 'inherit'; m.style.opacity = 1;
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => { m.style.opacity = 0; }, 1800);
  }
  function pulsoRacha() {
    const s = $('racha');
    s.classList.add('pop');
    setTimeout(() => s.classList.remove('pop'), 150);
  }

  /* ---------- interacción ---------- */
  const posBase = (c) => ({ x: S / 2 + c.u * S / 2, y: S / 2 + c.v * S / 2, r: c.rho * S / 2 });

  cv.addEventListener('pointerdown', (e) => {
    if (estado.modo !== 'jugando') return;
    const rect = cv.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    let tocada = null, mejorD = 1e9;
    for (const c of estado.celulas) {
      const p = posBase(c), d = Math.hypot(p.x - px, p.y - py);
      if (d < p.r * 1.2 && d < mejorD) { mejorD = d; tocada = c; }
    }
    if (!tocada || tocada.resuelta) return;
    if (tocada.fase === estado.objetivo) {
      tocada.resuelta = true; estado.halladas++; estado.racha++;
      estado.puntos += 10 * (1 + Math.floor(estado.racha / 4));
      Sonido.acierto(estado.racha); pulsoRacha(); actualizarHud();
      if (estado.halladas === estado.k) completarRonda();
    } else {
      tocada.falloEn = performance.now();
      const perdioRacha = estado.racha > 0;
      estado.vidas--; estado.racha = 0; Sonido.error(perdioRacha);
      const real = info(tocada.fase);
      decir('Esa es ' + real.nombre + (real.sub ? ' (' + real.sub + ')' : ''), 'var(--mal)');
      actualizarHud();
      if (estado.vidas <= 0) { estado.modo = 'entre'; luego(finDelJuego, 900); }
    }
  });

  function completarRonda() {
    estado.modo = 'entre';
    const bono = Math.ceil(estado.tiempo) * 5;
    estado.puntos += bono; estado.nivel++;
    Sonido.hito(); decir('¡Ronda completa! +' + bono, 'var(--ok)'); actualizarHud();
    luego(nuevaRonda, 1000);
  }
  function tiempoAgotado() {
    estado.modo = 'entre'; estado.revelar = true;
    const perdioRacha = estado.racha > 0;
    estado.vidas--; estado.racha = 0; Sonido.error(perdioRacha);
    decir('¡Se acabó el tiempo!', 'var(--mal)'); actualizarHud();
    if (estado.vidas <= 0) luego(finDelJuego, 1300);
    else luego(nuevaRonda, 1400);
  }
  function finDelJuego() {
    if (estado.modo === 'fin') return;
    estado.modo = 'fin';
    const nuevoRecord = estado.puntos > mejores[estado.juego];
    if (nuevoRecord) {
      mejores[estado.juego] = estado.puntos;
      try { localStorage.setItem(claveMejor(estado.juego), String(estado.puntos)); } catch (e) { /* sin almacenamiento */ }
    }
    Sonido.fin(nuevoRecord);
    $('ov-titulo').textContent = 'Fin del juego';
    $('ov-texto').textContent = 'Hiciste ' + estado.puntos + ' puntos y llegaste a la ronda ' + (estado.nivel + 1) + '. Elegí un modo para jugar de nuevo.';
    $('ov-rec').textContent = (nuevoRecord ? '🏆 ¡Nuevo récord! ' : '') + textoRecords();
    $('overlay').hidden = false;
  }

  raiz.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => {
    Sonido.iniciar(); Sonido.clic();
    $('overlay').hidden = true;
    estado.juego = b.dataset.modo;
    Object.assign(estado, { nivel: 0, puntos: 0, vidas: 3, racha: 0, ultimoObjetivo: '' });
    $('guia').hidden = true;
    aplicarGuia();
    ajustar(); nuevaRonda();
  }));
  $('ayuda').addEventListener('click', () => { const g = $('guia'); g.hidden = !g.hidden; });
  raiz.querySelector('[data-spf-volver]').addEventListener('click', () => { salir(); Sonido.clic(); volver(); });

  function salir() {
    vivo = false;
    cancelAnimationFrame(raf);
    clearTimeout(msgTimer);
    window.removeEventListener('resize', ajustar);
  }

  /* ---------- dibujo: piezas ---------- */
  function cruz(x, y, s) {
    ctx.beginPath(); ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s); ctx.stroke();
  }
  // Cromosoma simple (una cromátida) en el espacio unitario de la célula
  function simple(x, y, ang, len, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = col; ctx.lineWidth = 0.085;
    ctx.beginPath(); ctx.moveTo(0, -len / 2); ctx.lineTo(0, len / 2); ctx.stroke();
    ctx.restore();
  }
  // Cromosoma duplicado (dos cromátidas unidas por el centrómero: forma de X)
  function doble(x, y, ang, len, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = col; ctx.lineWidth = 0.075;
    const w = 0.065;
    ctx.beginPath(); ctx.moveTo(-w, -len / 2); ctx.lineTo(w, len / 2); ctx.moveTo(w, -len / 2); ctx.lineTo(-w, len / 2); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, 0.045, 0, 7); ctx.fill();
    ctx.restore();
  }
  // Par de homólogos apareados (bivalente): dos duplicados lado a lado
  function bivalente(x, y, ang, len) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    doble(-0.1, 0, 0, len, COL_M);
    doble(0.1, 0, 0, len, COL_P);
    ctx.restore();
  }
  function huso(ys, polo) {
    ctx.strokeStyle = 'rgba(120,80,150,.4)'; ctx.lineWidth = 0.03;
    for (const yy of ys) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * polo, 0); ctx.lineTo(0, yy); ctx.stroke(); }
  }
  function husoAnafase(ys, x) {
    ctx.strokeStyle = 'rgba(120,80,150,.35)'; ctx.lineWidth = 0.03;
    for (const yy of ys) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 1.15, 0); ctx.lineTo(s * x, yy); ctx.stroke(); }
  }
  function nucleo(r, discontinuo) {
    ctx.fillStyle = 'rgba(217,167,224,.25)'; ctx.strokeStyle = 'rgba(142,74,166,.5)'; ctx.lineWidth = 0.045;
    if (discontinuo) ctx.setLineDash([0.08, 0.07]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
  }
  function nucleoElipse(x) {
    ctx.fillStyle = '#dcb0e6'; ctx.strokeStyle = '#8e4aa6'; ctx.lineWidth = 0.06;
    ctx.beginPath(); ctx.ellipse(x, 0, 0.3, 0.42, 0, 0, 7); ctx.fill(); ctx.stroke();
  }

  const CROMOS = [
    { len: LARGO, col: COL_M }, { len: LARGO, col: COL_P },
    { len: CORTO, col: COL_M }, { len: CORTO, col: COL_P }
  ];
  const HUECOS = [[-0.24, -0.2], [0.22, -0.2], [-0.2, 0.24], [0.24, 0.22]];

  /* ---------- dibujo: contenido de cada estado ---------- */
  function contenidoFases(ph, n) {
    if (ph === 'interfase') {
      ctx.fillStyle = '#dcb0e6'; ctx.strokeStyle = '#8e4aa6'; ctx.lineWidth = 0.06;
      ctx.beginPath(); ctx.arc(0, 0, 0.55, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(90,42,140,.35)';
      for (let i = 0; i < 9; i++) { const a = n[5 + i] * 6.28, d = n[15 + i] * 0.42; ctx.beginPath(); ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 0.04, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#5a2a8c'; ctx.beginPath(); ctx.arc((n[3] - 0.5) * 0.3, (n[4] - 0.5) * 0.3, 0.15, 0, 7); ctx.fill();
    } else if (ph === 'profase') {
      ctx.fillStyle = 'rgba(217,167,224,.25)'; ctx.strokeStyle = 'rgba(142,74,166,.45)'; ctx.lineWidth = 0.04;
      ctx.setLineDash([0.08, 0.07]); ctx.beginPath(); ctx.arc(0, 0, 0.66, 0, 7); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = '#5a2a8c'; ctx.lineWidth = 0.075;
      for (let i = 0; i < 6; i++) {
        const a = n[5 + i] * 6.28, d = n[12 + i] * 0.3, cx = Math.cos(a) * d, cy = Math.sin(a) * d;
        const th = n[20 + i] * 6.28, L = 0.26, dx = Math.cos(th) * L, dy = Math.sin(th) * L;
        const qx = cx - dy * (n[28 + i] - 0.5) * 2.2, qy = cy + dx * (n[28 + i] - 0.5) * 2.2;
        ctx.beginPath(); ctx.moveTo(cx - dx, cy - dy); ctx.quadraticCurveTo(qx, qy, cx + dx, cy + dy); ctx.stroke();
      }
    } else if (ph === 'metafase') {
      const ys = [-0.56, -0.28, 0, 0.28, 0.56];
      huso(ys, 0.95);
      ctx.strokeStyle = '#5a2a8c'; ctx.lineWidth = 0.1;
      ys.forEach((yy, i) => cruz((n[i] - 0.5) * 0.08, yy, 0.09));
    } else if (ph === 'anafase') {
      const ys = [-0.42, -0.14, 0.14, 0.42];
      husoAnafase(ys, 0.78);
      ctx.strokeStyle = '#5a2a8c'; ctx.lineWidth = 0.09;
      for (const yy of ys) for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(s * 0.58, yy - 0.11); ctx.lineTo(s * 0.78, yy); ctx.lineTo(s * 0.58, yy + 0.11); ctx.stroke();
      }
    } else if (ph === 'telofase') {
      for (const s of [-1, 1]) {
        nucleoElipse(s * 0.66);
        ctx.fillStyle = 'rgba(90,42,140,.4)';
        for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(s * 0.66 + (n[i] - 0.5) * 0.3, (n[6 + i] - 0.5) * 0.5, 0.035, 0, 7); ctx.fill(); }
      }
    }
  }

  // Los 4 cromosomas del modelo 2n = 4 dispersos dentro de un núcleo (simples o duplicados)
  function dispersos(n, fn, escala) {
    CROMOS.forEach((c, i) => {
      const [hx, hy] = HUECOS[i];
      fn(hx * escala + (n[i] - 0.5) * 0.08, hy * escala + (n[4 + i] - 0.5) * 0.08, n[10 + i] * Math.PI, c.len, c.col);
    });
  }
  // Dos o cuatro cromosomas dentro de un núcleo en telofase (a escala reducida)
  function enNucleo(x, n, lista, fn) {
    const huecos = lista.length === 4
      ? [[-0.1, -0.2], [0.1, -0.12], [-0.08, 0.14], [0.1, 0.2]]
      : [[-0.06, -0.14], [0.07, 0.14]];
    lista.forEach((c, i) => {
      fn(x + huecos[i][0] + (n[i] - 0.5) * 0.03, huecos[i][1] + (n[6 + i] - 0.5) * 0.03, n[12 + i] * Math.PI, c.len * 0.62, c.col);
    });
  }

  function contenidoPloidia(ph, n) {
    const orden = [CROMOS[0], CROMOS[2], CROMOS[1], CROMOS[3]]; // largo, corto, largo, corto
    const haploideIzq = [CROMOS[0], CROMOS[3]]; // largo materno + corto paterno
    const haploideDer = [CROMOS[1], CROMOS[2]]; // largo paterno + corto materno
    if (ph === 'g1') {
      nucleo(0.62, false);
      dispersos(n, simple, 1);
    } else if (ph === 'g2') {
      nucleo(0.66, false);
      dispersos(n, doble, 1);
    } else if (ph === 'mprofase') {
      nucleo(0.7, true);
      dispersos(n, doble, 1.12);
    } else if (ph === 'mmetafase') {
      const ys = [-0.6, -0.2, 0.2, 0.6];
      huso(ys, 0.95);
      orden.forEach((c, i) => doble((n[i] - 0.5) * 0.06, ys[i], 0, c.len, c.col));
    } else if (ph === 'manafase') {
      const ys = [-0.55, -0.18, 0.18, 0.55];
      husoAnafase(ys, 0.72);
      for (const s of [-1, 1]) orden.forEach((c, i) => simple(s * 0.72, ys[i], 0, c.len, c.col));
    } else if (ph === 'mtelofase') {
      for (const s of [-1, 1]) { nucleoElipse(s * 0.66); enNucleo(s * 0.66, n, CROMOS, simple); }
    } else if (ph === 'p1') {
      nucleo(0.7, true);
      bivalente(-0.26 + (n[0] - 0.5) * 0.06, -0.06, 0.5 + n[1] * 0.6, LARGO);
      bivalente(0.28 + (n[2] - 0.5) * 0.06, 0.12, -0.4 - n[3] * 0.6, CORTO);
    } else if (ph === 'm1') {
      huso([-0.32, 0.3], 0.95);
      bivalente(0, -0.32, 0, LARGO);
      bivalente(0, 0.3, 0, CORTO);
    } else if (ph === 'a1') {
      const ys = [-0.28, 0.3];
      husoAnafase(ys, 0.72);
      doble(-0.72, ys[0], 0, LARGO, COL_M); doble(-0.72, ys[1], 0, CORTO, COL_P);
      doble(0.72, ys[0], 0, LARGO, COL_P); doble(0.72, ys[1], 0, CORTO, COL_M);
    } else if (ph === 't1') {
      nucleoElipse(-0.66); nucleoElipse(0.66);
      enNucleo(-0.66, n, haploideIzq, doble);
      enNucleo(0.66, n, haploideDer, doble);
    } else if (ph === 'm2') {
      huso([-0.3, 0.3], 0.95);
      doble(0, -0.3, 0, LARGO, COL_M);
      doble(0, 0.3, 0, CORTO, COL_P);
    } else if (ph === 'a2') {
      const ys = [-0.28, 0.28];
      husoAnafase(ys, 0.72);
      for (const s of [-1, 1]) { simple(s * 0.72, ys[0], 0, LARGO, COL_M); simple(s * 0.72, ys[1], 0, CORTO, COL_P); }
    } else if (ph === 't2') {
      nucleoElipse(-0.66); nucleoElipse(0.66);
      enNucleo(-0.66, n, haploideIzq, simple);
      enNucleo(0.66, n, haploideIzq, simple);
    }
  }

  const ELIPTICAS = ['anafase', 'manafase', 'a1', 'a2'];
  const DOS_CELULAS = ['telofase', 'mtelofase', 't1', 't2'];

  function dibujarCelula(c, t) {
    const p = posBase(c), r = p.r;
    const x = p.x + Math.sin(t / 900 + c.n[0] * 6) * r * 0.04;
    const y = p.y + Math.cos(t / 1100 + c.n[1] * 6) * r * 0.04;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(c.rot + Math.sin(t / 1500 + c.n[2] * 6) * 0.06); ctx.scale(r, r);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.fillStyle = 'rgba(255,240,247,.92)'; ctx.strokeStyle = '#b5628f'; ctx.lineWidth = 0.07;
    const ph = c.fase;
    if (ELIPTICAS.includes(ph)) { ctx.beginPath(); ctx.ellipse(0, 0, 1.25, 0.85, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    else if (DOS_CELULAS.includes(ph)) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 0.62, 0, 0.7, 0, 7); ctx.fill(); ctx.stroke(); } }
    else { ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill(); ctx.stroke(); }

    if (estado.juego === 'fases') contenidoFases(ph, c.n);
    else contenidoPloidia(ph, c.n);
    ctx.restore();

    const ahora = performance.now();
    if (c.resuelta) {
      ctx.strokeStyle = '#2e9e5b'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(46,158,91,.18)';
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.12, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3.5; ctx.beginPath();
      ctx.moveTo(p.x - r * 0.35, p.y); ctx.lineTo(p.x - r * 0.1, p.y + r * 0.28); ctx.lineTo(p.x + r * 0.4, p.y - r * 0.3); ctx.stroke();
    } else if (ahora - c.falloEn < 1800) {
      ctx.strokeStyle = '#d64545'; ctx.lineWidth = 3; ctx.fillStyle = 'rgba(214,69,69,.14)';
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.12, 0, 7); ctx.fill(); ctx.stroke();
      const real = info(c.fase);
      ctx.fillStyle = '#d64545'; ctx.font = '700 ' + Math.max(11, r * 0.4) + 'px system-ui,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(real.nombre, p.x, p.y - r * 1.25);
      if (real.sub) ctx.fillText(real.sub, p.x, p.y + r * 1.5);
    } else if (estado.revelar && c.fase === estado.objetivo) {
      ctx.strokeStyle = '#f0a020'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.12, 0, 7); ctx.stroke();
    }
  }

  function dibujar(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    const R = S / 2 - 3;
    ctx.save();
    ctx.beginPath(); ctx.arc(S / 2, S / 2, R, 0, 7); ctx.clip();
    const g = ctx.createRadialGradient(S / 2, S / 2, R * 0.1, S / 2, S / 2, R);
    g.addColorStop(0, '#fbe9f1'); g.addColorStop(1, '#efc6da');
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = 'rgba(160,90,140,.18)';
    for (const m of estado.motas) { ctx.beginPath(); ctx.arc(S / 2 + m.u * S / 2, S / 2 + m.v * S / 2, m.r, 0, 7); ctx.fill(); }
    for (const c of estado.celulas) dibujarCelula(c, t);
    ctx.restore();
    ctx.strokeStyle = '#6d5a99'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(S / 2, S / 2, R, 0, 7); ctx.stroke();
  }

  let ultimo = performance.now();
  function cuadro(t) {
    if (!vivo) return;
    if (!cv.isConnected) { salir(); return; }
    const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
    if (estado.modo === 'jugando') {
      estado.tiempo -= dt;
      if (estado.tiempo <= 0) { estado.tiempo = 0; tiempoAgotado(); }
    }
    const f = Math.max(0, estado.tiempo / estado.tiempoMax);
    const barra = $('barra');
    barra.style.width = (f * 100) + '%';
    barra.style.background = f < 0.3 ? '#ff5d7a' : f < 0.55 ? '#ffb938' : '#9b7bff';
    dibujar(t);
    raf = requestAnimationFrame(cuadro);
  }

  ajustar();
  actualizarHud();
  raf = requestAnimationFrame(cuadro);
  window.scrollTo?.({ top: 0 });
}
