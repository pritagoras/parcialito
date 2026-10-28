// division.js: laboratorio visual para comparar mitosis y meiosis.
// Modelo didáctico diploide (2n = 4): dos pares de cromosomas homólogos.

export const TITULO = 'Laboratorio: mitosis y meiosis';

const FASES = {
  mitosis: [
    ['Interfase (G₂)', 'El ADN ya se duplicó durante la fase S. Cada uno de los cuatro cromosomas está formado por dos cromátidas hermanas; todavía no están condensados como cromosomas visibles.'],
    ['Profase', 'La cromatina se condensa. Se organiza el huso y los centrosomas se alejan; la envoltura nuclear empieza a desarmarse. Los homólogos no se aparean.'],
    ['Prometafase', 'La envoltura nuclear termina de desarmarse y los microtúbulos del huso se unen a los cinetocoros. Cada cromátida hermana queda conectada a un polo opuesto.'],
    ['Metafase', 'Los cuatro cromosomas duplicados se alinean individualmente en la placa metafásica. Las cromátidas hermanas están biorientadas hacia polos opuestos.'],
    ['Anafase', 'Se separan las cromátidas hermanas. Cada cromátida pasa a ser un cromosoma hijo y migra hacia un polo.'],
    ['Telofase y citocinesis', 'Se forman dos núcleos y se divide el citoplasma. El resultado son dos células hijas diploides (2n = 4), con una copia de cada cromosoma.'],
  ],
  meiosis: [
    ['Interfase (antes de meiosis I)', 'El ADN se duplica una sola vez durante la fase S. Los cuatro cromosomas quedan duplicados, cada uno con dos cromátidas hermanas.'],
    ['Profase I', 'Los cromosomas homólogos se aparean (sinapsis) formando dos bivalentes o tétradas. Puede ocurrir crossing-over entre cromátidas no hermanas; el quiasma es el punto de conexión visible después del intercambio.'],
    ['Metafase I', 'Los dos pares de homólogos se alinean como bivalentes en la placa metafásica. La orientación de cada par es independiente; aquí se muestra una de las orientaciones posibles.'],
    ['Anafase I', 'Se separan los cromosomas homólogos duplicados hacia polos opuestos. Los centrómeros no se dividen y las cromátidas hermanas permanecen unidas.'],
    ['Telofase I y citocinesis', 'Se originan dos células haploides (n = 2). Cada cromosoma aún está duplicado: conserva sus dos cromátidas hermanas.'],
    ['Profase II', 'Sin una nueva fase S ni duplicación del ADN, se organiza un huso en cada célula haploide para la segunda división.'],
    ['Metafase II', 'En cada célula, los dos cromosomas duplicados se alinean individualmente. Las cromátidas hermanas se conectan a polos opuestos.'],
    ['Anafase II', 'Se separan los centrómeros y las cromátidas hermanas migran a polos opuestos, como en la anafase mitótica.'],
    ['Telofase II y citocinesis', 'Se forman cuatro células haploides (n = 2), cada una con cromosomas no duplicados. La recombinación y la orientación independiente generan combinaciones distintas.'],
  ],
};

const COLORS = ['#a78bfa', '#45d6ad', '#ffbd59', '#ff7597'];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function styles() {
  if (document.getElementById('estilos-division')) return;
  const el = document.createElement('style');
  el.id = 'estilos-division';
  el.textContent = `
.dv { max-width: 960px; }
.dv .dv-intro { color:var(--tenue); line-height:1.5; }
.dv-tabs,.dv-nav,.dv-phases { display:flex; flex-wrap:wrap; gap:.5rem; margin:.8rem 0; }
.dv-tab,.dv-phase { border:2px solid var(--linea); color:var(--crema); background:var(--panel); border-radius:12px; padding:.55rem .8rem; font:inherit; font-weight:750; cursor:pointer; }
.dv-tab[aria-pressed="true"] { border-color:var(--violeta); background:rgba(155,123,255,.16); }
.dv-phase[aria-current="step"] { border-color:var(--ambar); color:var(--ambar); }
.dv-board { background:radial-gradient(ellipse at center,#281c48,#170f2e 72%); border:2px solid var(--linea); border-radius:18px; overflow:hidden; }
.dv-board svg { display:block; width:100%; height:auto; }
.dv-stage { padding:1rem; background:var(--panel); border:2px solid var(--linea); border-radius:14px; margin:.8rem 0; }
.dv-stage h2 { margin:0 0 .35rem; font-size:1.25rem; }
.dv-stage p { margin:0; line-height:1.5; color:var(--tenue); }
.dv-legend { display:flex; flex-wrap:wrap; gap:.5rem 1rem; color:var(--tenue); font-size:.88rem; margin:.7rem 0; }
.dv-dot { display:inline-block;width:.75rem;height:.75rem;border-radius:50%;margin-right:.3rem;vertical-align:middle; }
.dv-nav { justify-content:space-between; }
.dv-caption { color:var(--tenue); font-size:.88rem; margin:.3rem 0; }
@media(prefers-reduced-motion:no-preference){.dv-board svg .chr{transform-box:fill-box;transform-origin:center;animation:dv-chrom .45s ease-out both}.dv-board svg .spindle{animation:dv-pulse 2.5s ease-in-out infinite}@keyframes dv-chrom{from{opacity:.35;scale:.86}to{opacity:1;scale:1}}@keyframes dv-pulse{50%{opacity:.42}}}
`;
  document.head.appendChild(el);
}

const line = (x1, y1, x2, y2, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}/>`;
const chromatid = (x1, y1, x2, y2, color, width = 8) => `<path d="M${x1},${y1} Q${(x1+x2)/2+5},${(y1+y2)/2} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
function chromosome(x, y, color, duplicated = true, opts = {}) {
  const rot = opts.rotate || 0;
  const recombinant = opts.recombinant || false;
  let s = `<g class="chr" transform="translate(${x} ${y}) rotate(${rot})">`;
  if (duplicated) {
    s += chromatid(-13,-21,-13,21,color) + chromatid(13,-21,13,21,color);
    if (recombinant) s += `<path d="M7,-4 Q13,0 7,4" fill="none" stroke="#ff7597" stroke-width="8" stroke-linecap="round"/>`;
    s += `<circle cx="0" cy="0" r="4.5" fill="#fff0d5" stroke="#170f2e" stroke-width="2"/>`;
  } else {
    s += `<path d="M-8,-20 Q2,-5 0,0 Q-2,5 8,20" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`;
    if (recombinant) s += `<path d="M3,9 Q5,14 8,20" fill="none" stroke="#ff7597" stroke-width="8" stroke-linecap="round"/>`;
    s += `<circle cx="0" cy="0" r="4" fill="#fff0d5" stroke="#170f2e" stroke-width="2"/>`;
  }
  return s + '</g>';
}

function cell(cx, cy, rx, ry, label = '') {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(82,62,123,.16)" stroke="#a995d2" stroke-width="3"/>${label ? `<text x="${cx}" y="${cy+ry+22}" text-anchor="middle" class="lbl">${esc(label)}</text>` : ''}`;
}

function draw(mode, index) {
  const n = index;
  const mitosis = mode === 'mitosis';
  const last = FASES[mode].length - 1;
  const twoCells = mitosis ? n === last : n === 4 || n === 5 || n === 6 || n === 7;
  const fourCells = !mitosis && n === 8;
  const centers = fourCells ? [[165,110],[435,110],[165,300],[435,300]] : twoCells ? [[190,205],[410,205]] : [[300,205]];
  let svg = `<svg viewBox="0 0 600 410" role="img" aria-label="Esquema de ${mitosis ? 'mitosis' : 'meiosis'}, fase ${esc(FASES[mode][n][0])}"><style>.lbl{fill:#d5c9eb;font:700 15px system-ui}.micro{stroke:#8b76b8;stroke-width:2;opacity:.68}.nuc{fill:rgba(167,139,250,.08);stroke:#9c84cb;stroke-width:2;stroke-dasharray:6 5}</style>`;
  centers.forEach(([cx,cy]) => { svg += cell(cx,cy, fourCells ? 105 : twoCells ? 100 : 258, fourCells ? 75 : twoCells ? 120 : 165); });
  const spindle = (cx, cy, dx) => {
    const left = cx - dx, right = cx + dx;
    svg += `<circle cx="${left}" cy="${cy}" r="7" fill="#ffd166"/><circle cx="${right}" cy="${cy}" r="7" fill="#ffd166"/>`;
    return [left,right];
  };
  const poles = centers.map(([cx,cy]) => spindle(cx,cy, centers.length === 1 ? 205 : 95));
  const chrom = (x,y,c,dup=true,o={}) => { svg += chromosome(x,y,c,dup,o); };
  if (mitosis) {
    const [left,right] = poles[0];
    if (n === 0) {
      svg += `<ellipse class="nuc" cx="300" cy="205" rx="105" ry="80"/><text x="300" y="198" text-anchor="middle" class="lbl">ADN duplicado</text><text x="300" y="220" text-anchor="middle" class="lbl">aún descondensado</text>`;
    } else if (n <= 3) {
      if (n === 1) svg += `<ellipse class="nuc" cx="300" cy="205" rx="120" ry="90"/>`;
      const xs = n === 3 ? [260,287,313,340] : [220,275,325,380];
      xs.forEach((x,i) => chrom(x,205,COLORS[i],true));
      if (n >= 2) xs.forEach((x) => {
        svg += line(left,205,x-13,205,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"');
        svg += line(right,205,x+13,205,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"');
      });
      if (n === 3) svg += line(300,75,300,335,'stroke="#f3d7ff" stroke-dasharray="5 5" opacity=".7"');
    } else if (n === 4) {
      for (let i=0;i<4;i++) { const y=140+i*43; chrom(left+45,y,COLORS[i],false,{rotate:-30}); chrom(right-45,y,COLORS[i],false,{rotate:30}); }
    } else {
      centers.forEach(([cx,cy])=>{
        for (let i=0;i<4;i++) chrom(cx-21+(i%2)*42,cy-19+Math.floor(i/2)*38,COLORS[i],false);
        svg += `<ellipse class="nuc" cx="${cx}" cy="${cy}" rx="55" ry="72"/>`;
      });
    }
  } else if (n <= 3) {
    const [left,right] = poles[0];
    if (n === 0) svg += `<ellipse class="nuc" cx="300" cy="205" rx="105" ry="80"/><text x="300" y="198" text-anchor="middle" class="lbl">ADN duplicado</text><text x="300" y="220" text-anchor="middle" class="lbl">antes de meiosis I</text>`;
    if (n === 1) {
      // Dos bivalentes con homólogos apareados; crossover entre cromátidas no hermanas.
      [[258,300],[342,300]].forEach(([x,y],i) => { chrom(x-13,y,COLORS[i*2],true,{recombinant:i===0}); chrom(x+13,y,COLORS[i*2+1],true); });
      svg += `<path d="M245 283 Q258 270 271 283 M329 317 Q342 330 355 317" fill="none" stroke="#ff7597" stroke-width="3"/><text x="300" y="112" text-anchor="middle" class="lbl">bivalentes (tétradas)</text>`;
    }
    if (n === 2) {
      [[274,0],[326,1]].forEach(([x,pair]) => { chrom(x,183,COLORS[pair*2],true); chrom(x,227,COLORS[pair*2+1],true); });
      [183,227].forEach(y => { svg += line(left,205,274,y,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"'); svg += line(right,205,326,y,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"'); });
      svg += line(300,95,300,315,'stroke="#f3d7ff" stroke-dasharray="5 5" opacity=".7"');
    }
    if (n === 3) {
      chrom(left+55,170,COLORS[0],true,{recombinant:true}); chrom(left+55,240,COLORS[2],true);
      chrom(right-55,170,COLORS[1],true); chrom(right-55,240,COLORS[3],true);
    }
    if (n === 1 || n === 2 || n === 3) {
      if (n === 3) {
        [[left+55,170],[left+55,240]].forEach(([x,y])=>{svg += line(left,205,x,y,'class="spindle" stroke="#8b76b8" opacity=".46" stroke-width="2"');});
        [[right-55,170],[right-55,240]].forEach(([x,y])=>{svg += line(right,205,x,y,'class="spindle" stroke="#8b76b8" opacity=".46" stroke-width="2"');});
      }
    }
  } else if (n <= 7) {
    centers.forEach(([cx,cy],ci) => {
      const [left,right] = poles[ci];
      if (n === 4 || n === 5) {
        if (n === 4) { chrom(cx-30,cy,COLORS[ci*2],true); chrom(cx+30,cy,COLORS[ci*2+1],true,{recombinant:ci===0}); }
        else { svg += `<ellipse class="nuc" cx="${cx}" cy="${cy}" rx="62" ry="48"/>`; chrom(cx-25,cy,COLORS[ci*2],true); chrom(cx+25,cy,COLORS[ci*2+1],true); }
      } else if (n === 6) {
        chrom(cx-24,cy,COLORS[ci*2],true); chrom(cx+24,cy,COLORS[ci*2+1],true);
        svg += line(left,cy,cx-24,cy,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"');
        svg += line(right,cy,cx+24,cy,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"');
        svg += line(cx,cy-72,cx,cy+72,'stroke="#f3d7ff" stroke-dasharray="5 5" opacity=".7"');
      } else {
        for (let j=0;j<2;j++) { const y=cy-22+j*44; chrom(left+32,y,COLORS[ci*2+j],false,{rotate:-28}); chrom(right-32,y,COLORS[ci*2+j],false,{rotate:28}); svg += line(left,cy,left+32,y,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"'); svg += line(right,cy,right-32,y,'class="spindle" stroke="#8b76b8" opacity=".48" stroke-width="2"'); }
      }
    });
  } else {
    centers.forEach(([cx,cy],ci) => {
      const [left,right] = poles[ci];
      if (ci % 2 === 0) { chrom(cx-18,cy-10,COLORS[ci],false,{recombinant:ci===0}); chrom(cx+18,cy+10,COLORS[(ci+1)%4],false); }
      else { chrom(cx-18,cy+10,COLORS[ci],false); chrom(cx+18,cy-10,COLORS[(ci+1)%4],false,{recombinant:ci===1}); }
      svg += `<ellipse class="nuc" cx="${cx}" cy="${cy}" rx="55" ry="45"/>`;
    });
  }
  svg += `<g class="dv-legend-svg">`;
  svg += `<text x="300" y="390" text-anchor="middle" class="lbl">${mitosis ? 'Dos pares de homólogos: violeta/verde y ámbar/rosa' : 'Dos pares de homólogos: violeta/verde y ámbar/rosa · rosa: recombinación'}</text>`;
  svg += '</g></svg>';
  return svg;
}

export function abrirDivision({ app, volver }) {
  styles();
  let mode = 'mitosis';
  let phase = 0;
  let timer = null;
  const stopPlayback = () => { clearInterval(timer); timer = null; };
  const render = () => {
    const fases = FASES[mode];
    app.innerHTML = `<main class="pantalla dv">
      <button class="btn enlace" id="dv-back">← Volver a Biología 2</button>
      <h1>${TITULO}</h1>
      <p class="dv-intro">Explorá las divisiones en el mismo modelo de célula diploide (2n = 4). Las figuras son esquemáticas y no están a escala. Elegí una fase o avanzá paso a paso.</p>
      <div class="dv-tabs" role="group" aria-label="Tipo de división">
        <button class="dv-tab" data-mode="mitosis" aria-pressed="${mode==='mitosis'}">Mitosis</button>
        <button class="dv-tab" data-mode="meiosis" aria-pressed="${mode==='meiosis'}">Meiosis</button>
      </div>
      <div class="dv-phases" role="group" aria-label="Fases">
        ${fases.map(([name],i)=>`<button class="dv-phase" data-phase="${i}" aria-current="${i===phase?'step':'false'}">${esc(name)}</button>`).join('')}
      </div>
      <p class="dv-caption">Cada color identifica un cromosoma. Los homólogos comparten longitud y posición del centrómero; las cromátidas hermanas permanecen juntas hasta la separación indicada.</p>
      <div class="dv-board">${draw(mode,phase)}</div>
      <section class="dv-stage" aria-live="polite"><h2>${esc(fases[phase][0])}</h2><p>${esc(fases[phase][1])}</p></section>
      <div class="dv-legend"><span><i class="dv-dot" style="background:${COLORS[0]}"></i><i class="dv-dot" style="background:${COLORS[1]}"></i>Par homólogo 1</span><span><i class="dv-dot" style="background:${COLORS[2]}"></i><i class="dv-dot" style="background:${COLORS[3]}"></i>Par homólogo 2</span><span>✦ Centrómero</span><span>Segmento rosa: intercambio entre cromátidas no hermanas</span></div>
      <div class="dv-nav"><button class="btn secundario" id="dv-prev" ${phase===0?'disabled':''}>← Anterior</button><button class="btn secundario" id="dv-play">${timer ? '⏸ Pausar' : '▶ Reproducir'}</button><button class="btn primario" id="dv-next">${phase===fases.length-1?'Reiniciar':'Siguiente →'}</button></div>
      <p class="dv-caption">Modelo didáctico inspirado en <a href="https://openstax.org/books/biology-2e/pages/10-2-the-cell-cycle" target="_blank" rel="noopener">Biology 2e, OpenStax (mitosis)</a> y <a href="https://openstax.org/books/biology-2e/pages/11-1-the-process-of-meiosis" target="_blank" rel="noopener">capítulo de meiosis</a>.</p>
    </main>`;
    app.querySelector('#dv-back').addEventListener('click', () => { stopPlayback(); volver(); });
    app.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{ stopPlayback(); mode=b.dataset.mode; phase=0; render(); }));
    app.querySelectorAll('[data-phase]').forEach(b=>b.addEventListener('click',()=>{ stopPlayback(); phase=Number(b.dataset.phase); render(); }));
    app.querySelector('#dv-prev').addEventListener('click',()=>{ stopPlayback(); phase=Math.max(0,phase-1); render(); });
    app.querySelector('#dv-next').addEventListener('click',()=>{ stopPlayback(); phase=phase===fases.length-1?0:phase+1; render(); });
    app.querySelector('#dv-play').addEventListener('click',()=>{
      if (timer) stopPlayback();
      else timer = setInterval(()=>{ phase=(phase+1)%fases.length; render(); }, 2300);
      render();
    });
  };
  render();
  window.scrollTo(0,0);
}
