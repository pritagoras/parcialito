// Parcialito LAB · Transcripción
// Modelo interactivo del paso de la información del ADN al ARN: iniciación, elongación y terminación.
export const TITULO_TRANSCRIPCION = 'Transcripción: del ADN al ARN';

const PASOS = [
  { id:'inicio', titulo:'01 · Iniciación', corto:'Iniciación', color:'#ffc66d',
    texto:'La ARN polimerasa y los factores de transcripción reconocen el promotor y forman el complejo de iniciación. En eucariotas, la ARN polimerasa II transcribe los genes que producen pre-ARNm.',
    clave:'El promotor indica dónde se organiza el inicio; no se copia íntegramente como parte del ARN.' },
  { id:'apertura', titulo:'02 · Apertura local', corto:'Apertura', color:'#5cc8ff',
    texto:'El ADN se abre localmente y deja expuesta la hebra molde. La polimerasa lee esa hebra en sentido 3′→5′ para sintetizar ARN en sentido 5′→3′.',
    clave:'Se separa un tramo pequeño de ADN; el resto de la doble hélice permanece unido.' },
  { id:'elongacion', titulo:'03 · Elongación', corto:'Elongación', color:'#9b7bff',
    texto:'La ARN polimerasa avanza por la hebra molde e incorpora ribonucleótidos complementarios. La cadena de ARN se alarga por su extremo 3′ y usa uracilo (U) en lugar de timina (T).',
    clave:'El ARN nuevo es complementario al molde y coincide con la hebra codificante salvo que U reemplaza a T.' },
  { id:'terminacion', titulo:'04 · Terminación', corto:'Terminación', color:'#ff7aa8',
    texto:'Al alcanzar las señales de terminación propias del sistema, el transcripto se libera y la polimerasa se separa del ADN. En eucariotas, el transcripto primario que dará lugar al ARNm todavía debe madurar.',
    clave:'La transcripción produce ARN; no produce una proteína. En genes eucariotas, el producto inicial suele ser pre-ARNm.' }
];

const BASES = [
  ['A','U','#ffc66d'], ['T','A','#5cc8ff'], ['C','G','#4fe0a0'], ['G','C','#ff7aa8'],
  ['T','A','#5cc8ff'], ['A','U','#ffc66d'], ['G','C','#ff7aa8'], ['C','G','#4fe0a0'],
  ['A','U','#ffc66d'], ['C','G','#4fe0a0'], ['T','A','#5cc8ff'], ['G','C','#ff7aa8']
];
let paso = 0, timer = null, reproduciendo = false;

const esc = (s) => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reducirMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function abrirTranscripcion({app, volver}) {
  detener();
  inyectarEstilos();
  app.innerHTML = `
  <main class="trn">
    <header class="trn-head">
      <button class="trn-back" type="button" data-volver>← Laboratorio</button>
      <div class="trn-kicker">PARCIALITO LAB · GENÉTICA MOLECULAR</div>
      <h1>Transcripción: del ADN al ARN</h1>
      <p>Seguí cómo la ARN polimerasa usa una hebra de ADN como molde para producir una cadena de ARN, paso a paso.</p>
    </header>
    <nav class="trn-tabs" aria-label="Modos del laboratorio">
      <button type="button" class="act" data-modo="modelo">🧬 Modelo animado</button>
      <button type="button" data-modo="guia">📖 Guía del proceso</button>
      <button type="button" data-modo="quiz">❓ Comprobá lo aprendido</button>
    </nav>
    <section data-vista="modelo">
      <div class="trn-layout">
        <aside class="trn-panel">
          <span class="trn-label">RECORRIDO</span>
          <div class="trn-pasos" data-pasos></div>
          <div class="trn-controls">
            <button type="button" data-play>▶ Reproducir</button>
            <div><button type="button" data-prev aria-label="Paso anterior">←</button><button type="button" data-next aria-label="Paso siguiente">Siguiente →</button></div>
            <button type="button" class="trn-reset" data-reset>↺ Reiniciar recorrido</button>
          </div>
        </aside>
        <div class="trn-scene-wrap">
          <div class="trn-scene-head"><span class="trn-live" data-live>ETAPA 01 / 04</span><span class="trn-legend"><i></i> ADN <i></i> ARN <i></i> Polimerasa</span></div>
          <div class="trn-scene" data-scene></div>
          <div class="trn-caption"><span class="trn-stepnum" data-num>01</span><div><h2 data-title></h2><p data-text></p><strong data-clave></strong></div></div>
        </div>
      </div>
    </section>
    <section data-vista="guia" hidden>
      <div class="trn-guide" data-guide></div>
      <div class="trn-note"><b>Direccionalidad esencial</b><span>La ARN polimerasa lee la hebra molde 3′→5′ y sintetiza el ARN 5′→3′. La síntesis de ácidos nucleicos siempre ocurre agregando nucleótidos al extremo 3′ de la cadena nueva.</span></div>
    </section>
    <section data-vista="quiz" hidden>
      <div class="trn-quiz"><div class="trn-label">PREGUNTA RÁPIDA</div><h2 data-q></h2><div class="trn-options" data-options></div><p class="trn-feedback" data-feedback aria-live="polite"></p><button type="button" data-qnext>Siguiente pregunta →</button></div>
    </section>
    <footer class="trn-foot"><span>TRANSCRIPCIÓN ≠ TRADUCCIÓN</span><p>La transcripción copia información del ADN en ARN. La maduración del pre-ARNm es un proceso posterior, conectado con este laboratorio.</p></footer>
  </main>`;

  const root=app.querySelector('.trn');
  root.querySelector('[data-volver]').addEventListener('click',()=>{detener();volver();});
  root.querySelectorAll('[data-modo]').forEach(b=>b.addEventListener('click',()=>{
    root.querySelectorAll('[data-modo]').forEach(x=>x.classList.toggle('act',x===b));
    root.querySelectorAll('[data-vista]').forEach(v=>v.hidden=v.dataset.vista!==b.dataset.modo);
    if(b.dataset.modo!=='modelo') detener();
  }));
  root.querySelector('[data-play]').addEventListener('click',()=>reproduciendo?detener():reproducir());
  root.querySelector('[data-prev]').addEventListener('click',()=>{detener();mostrar(paso-1);});
  root.querySelector('[data-next]').addEventListener('click',()=>{detener();mostrar(paso+1);});
  root.querySelector('[data-reset]').addEventListener('click',()=>{detener();mostrar(0);});
  root.querySelector('[data-guide]').innerHTML=PASOS.map((p,i)=>`<article class="trn-guide-card" style="--c:${p.color}"><span>ETAPA 0${i+1}</span><h2>${p.titulo}</h2><p>${p.texto}</p><b>${p.clave}</b></article>`).join('');
  prepararQuiz(root);
  mostrar(0);
  function mostrar(n){
    paso=Math.max(0,Math.min(PASOS.length-1,n));
    const p=PASOS[paso];
    root.querySelector('[data-live]').textContent=`ETAPA 0${paso+1} / 04`;
    root.querySelector('[data-num]').textContent=`0${paso+1}`;
    root.querySelector('[data-title]').textContent=p.titulo;
    root.querySelector('[data-text]').textContent=p.texto;
    root.querySelector('[data-clave]').textContent=p.clave;
    root.querySelector('[data-pasos]').innerHTML=PASOS.map((x,i)=>`<button type="button" class="trn-step ${i===paso?'act':''}" data-step="${i}"><i style="--c:${x.color}">${String(i+1).padStart(2,'0')}</i><span>${x.corto}<small>${['Complejo de inicio','ADN abierto','Síntesis de ARN','Liberación del transcripto'][i]}</small></span><b>${i===paso?'●':'○'}</b></button>`).join('');
    root.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{detener();mostrar(Number(b.dataset.step));}));
    root.querySelector('[data-prev]').disabled=paso===0;
    root.querySelector('[data-next]').disabled=paso===PASOS.length-1;
    root.querySelector('[data-play]').textContent=reproduciendo?'Ⅱ Pausar':paso===PASOS.length-1?'↺ Repetir':'▶ Reproducir';
    root.querySelector('[data-scene]').innerHTML=escena(paso);
  }
  function reproducir(){
    if(reducirMovimiento()){mostrar(paso+1);return;}
    if(paso===PASOS.length-1) mostrar(0);
    reproduciendo=true;root.querySelector('[data-play]').textContent='Ⅱ Pausar';
    timer=window.setInterval(()=>{if(paso>=PASOS.length-1){detener();return;}mostrar(paso+1);},2600);
  }
  function detener(){if(timer!==null)window.clearInterval(timer);timer=null;reproduciendo=false;const b=app.querySelector('[data-play]');if(b)b.textContent=paso===PASOS.length-1?'↺ Repetir':'▶ Reproducir';}
  function prepararQuiz(root){
    const preguntas=[
      {q:'¿En qué sentido sintetiza ARN la ARN polimerasa?',o:['3′→5′','5′→3′','En ambos sentidos'],ok:1,e:'La cadena nueva crece agregando nucleótidos al extremo 3′, por eso la síntesis es 5′→3′.'},
      {q:'¿Qué hebra utiliza la ARN polimerasa como molde?',o:['La hebra codificante','La hebra molde, leída 3′→5′','Las dos hebras simultáneamente'],ok:1,e:'La polimerasa lee la hebra molde en dirección 3′→5′ y produce una cadena complementaria.'},
      {q:'¿Qué base del ARN ocupa el lugar de la timina?',o:['Uracilo (U)','Guanina (G)','Citosina (C)'],ok:0,e:'En ARN se usa uracilo; por eso, frente a una A del molde, se incorpora U al ARN.'},
      {q:'¿Qué producto se obtiene directamente de la transcripción de un gen eucariota codificante?',o:['Una proteína','ADN duplicado','Un transcripto de ARN, generalmente pre-ARNm'],ok:2,e:'La transcripción produce ARN. En genes eucariotas codificantes, el producto inicial suele procesarse para formar ARNm maduro.'}
    ];
    let qi=0,respondida=false;
    const pintar=()=>{const p=preguntas[qi];root.querySelector('[data-q]').textContent=p.q;root.querySelector('[data-options]').innerHTML=p.o.map((o,i)=>`<button type="button" data-opt="${i}">${o}</button>`).join('');root.querySelector('[data-feedback]').textContent='';root.querySelector('[data-qnext]').disabled=true;respondida=false;root.querySelectorAll('[data-opt]').forEach(b=>b.addEventListener('click',()=>{if(respondida)return;respondida=true;const ok=Number(b.dataset.opt)===p.ok;root.querySelectorAll('[data-opt]').forEach(x=>{x.disabled=true;if(Number(x.dataset.opt)===p.ok)x.classList.add('good');});if(!ok)b.classList.add('bad');root.querySelector('[data-feedback]').textContent=(ok?'Correcto. ':'No exactamente. ')+p.e;root.querySelector('[data-qnext]').disabled=false;}));};
    root.querySelector('[data-qnext]').addEventListener('click',()=>{qi=(qi+1)%preguntas.length;pintar();});pintar();
  }
}

function escena(etapa){
  const abierto=etapa>=1, creciendo=etapa>=2, terminado=etapa>=3;
  const xs=BASES.map((_,i)=>70+i*44);
  const dnaTop=xs.map((x,i)=>`<line x1="${x}" y1="155" x2="${x}" y2="245" stroke="#315a9f" stroke-width="3" opacity=".8"/>`).join('');
  const dna1=xs.map((x,i)=>`<rect x="${x-3}" y="150" width="6" height="100" rx="3" fill="#4d8fff" opacity=".6"/>`).join('');
  const bases=BASES.map(([m,r,c],i)=>`<g><line x1="${xs[i]}" y1="155" x2="${xs[i]}" y2="245" stroke="${c}" stroke-width="3" opacity="${abierto?.9:.5}"/><text x="${xs[i]}" y="143" text-anchor="middle" fill="#b8cafa" font-size="12">${m}</text><text x="${xs[i]}" y="263" text-anchor="middle" fill="#b8cafa" font-size="12">${['T','A','G','C','T','A','C','G','T','G','A','C'][i]}</text></g>`).join('');
  const arn=BASES.slice(0,creciendo?Math.min(12,(etapa-1)*4+4):0).map(([m,r,c],i)=>`<g><circle cx="${xs[i]}" cy="${terminado?315:295}" r="12" fill="${c}" opacity=".95"/><text x="${xs[i]}" y="${terminado?319:299}" text-anchor="middle" fill="#081329" font-size="11" font-weight="800">${r}</text></g>`).join('');
  const polx=etapa===0?270:etapa===1?330:etapa===2?420:550;
  const pol=`<g class="trn-pol" transform="translate(${polx} 192)"><ellipse rx="66" ry="45" fill="#9b7bff" opacity=".16"/><path d="M-55,-14 Q-52,-49 -10,-45 Q22,-59 50,-31 Q70,-6 49,20 Q25,48 -12,37 Q-54,43 -60,7Z" fill="#6f58d9" stroke="#b6a7ff" stroke-width="2.5"/><text y="5" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">ARN pol.</text></g>`;
  const prom= `<rect x="185" y="125" width="116" height="25" rx="7" fill="#ffc66d" fill-opacity=".2" stroke="#ffc66d"/><text x="243" y="141" text-anchor="middle" fill="#ffe2a3" font-size="11">PROMOTOR</text>`;
  const burbuja=abierto?`<rect x="260" y="142" width="260" height="111" rx="44" fill="#5cc8ff" fill-opacity=".07" stroke="#5cc8ff" stroke-dasharray="5 5"/>`:'';
  const etiquetas=`<text x="32" y="104" fill="#a9c5ff" font-size="13">Hebra codificante</text><text x="32" y="284" fill="#a9c5ff" font-size="13">Hebra molde</text><text x="500" y="350" fill="#ff93ba" font-size="13">ARN naciente 5′→3′</text>`;
  return `<svg viewBox="0 0 640 390" role="img" aria-label="Modelo esquemático de transcripción del ADN al ARN"><defs><linearGradient id="trnDna" x1="0" x2="1"><stop stop-color="#3d8bff"/><stop offset="1" stop-color="#5cc8ff"/></linearGradient></defs>
    <path d="M35 155 H605" stroke="url(#trnDna)" stroke-width="8" stroke-linecap="round"/><path d="M35 245 H605" stroke="#2755a3" stroke-width="8" stroke-linecap="round"/>
    ${dnaTop}${bases}${prom}${burbuja}${pol}${arn}
    <path d="M${polx+28} 226 Q${polx+58} 257 ${Math.min(595,polx+90)} 293" fill="none" stroke="#ff7aa8" stroke-width="3" stroke-dasharray="5 4" opacity="${creciendo?.9:0}"/>
    ${etiquetas}
    <text x="320" y="35" text-anchor="middle" fill="#eaf1ff" font-size="18" font-weight="700">${['Complejo de iniciación','Apertura local del ADN','Elongación del ARN','Liberación del transcripto'][etapa]}</text>
  </svg>`;
}

function inyectarEstilos(){
 if(document.getElementById('transcripcion-lab-css'))return;
 const st=document.createElement('style');st.id='transcripcion-lab-css';
 st.textContent=`
 .trn{--tx:#eaf1ff;--mut:#afc2ee;--ln:#254581;max-width:1260px;min-height:100dvh;margin:0 auto;padding:clamp(16px,3vw,30px);box-sizing:border-box;color:var(--tx);font-family:var(--fuente,Inter,system-ui,sans-serif);background:radial-gradient(ellipse at 58% 16%,rgba(45,81,190,.2),transparent 50%),radial-gradient(ellipse at 95% 65%,rgba(118,64,225,.12),transparent 35%),#040a1c;box-shadow:0 0 0 100vmax #040a1c;clip-path:inset(0 -100vmax)}
 .trn *{box-sizing:border-box}.trn button{font:inherit;cursor:pointer}.trn button:focus-visible{outline:2px solid #9fc0ff;outline-offset:3px}.trn [hidden]{display:none!important}
 .trn-head{padding-bottom:20px;border-bottom:1px solid #1c3d80}.trn-back{border:1px solid #244581;border-radius:10px;background:#0b1940;color:#bcd0ff;padding:8px 12px;font-size:.82rem!important}.trn-kicker{margin-top:22px;color:#81aaff;font-size:.7rem;font-weight:800;letter-spacing:.14em}.trn h1{margin:7px 0 8px;font-size:clamp(1.55rem,3vw,2.3rem);line-height:1.12;letter-spacing:-.035em}.trn-head p{max-width:66ch;color:var(--mut);line-height:1.6;margin:0}
 .trn-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:20px 0}.trn-tabs button{padding:10px 15px;border:1px solid #244581;border-radius:11px;background:#091638;color:#bfd0f7;font-size:.83rem}.trn-tabs button.act{background:linear-gradient(135deg,#5268ff,#344ce8);border-color:#7188ff;color:white}
 .trn-layout{display:grid;grid-template-columns:245px minmax(0,1fr);gap:18px}.trn-panel,.trn-scene-wrap,.trn-guide-card,.trn-note,.trn-quiz{border:1px solid #203c7f;border-radius:18px;background:linear-gradient(145deg,rgba(9,21,51,.98),rgba(5,13,33,.98));box-shadow:0 10px 28px #0002}
 .trn-panel{padding:15px}.trn-label{display:block;font-size:.68rem;letter-spacing:.13em;color:#8fb0ff;font-weight:800;margin-bottom:12px}.trn-pasos{display:grid;gap:7px}.trn-step{display:flex;align-items:center;gap:9px;width:100%;text-align:left;padding:10px 8px;border:1px solid #1c356d;border-radius:11px;background:#071432;color:#dce7ff}.trn-step.act{border-color:#638aff;background:#12285a}.trn-step i{display:grid;place-items:center;width:31px;height:31px;flex:none;border-radius:9px;background:color-mix(in srgb,var(--c) 18%,#071432);border:1px solid var(--c);font-size:.7rem;font-style:normal;font-weight:800}.trn-step span{font-size:.83rem;font-weight:700}.trn-step small{display:block;margin-top:3px;font-size:.68rem;font-weight:500;color:#9fb3e4}.trn-step b{margin-left:auto;color:#90aaff;font-size:.65rem}
 .trn-controls{display:grid;gap:8px;margin-top:16px}.trn-controls>button,.trn-controls div button,.trn-quiz>button{padding:10px;border:1px solid #3559a4;border-radius:10px;background:#163475;color:#f4f7ff;font-size:.82rem;font-weight:700}.trn-controls div{display:grid;grid-template-columns:1fr 1.6fr;gap:7px}.trn-controls button:disabled{opacity:.35;cursor:default}.trn-controls .trn-reset{background:#091638;color:#b8cafa;border-color:#203c7f}
 .trn-scene-wrap{padding:14px;min-width:0}.trn-scene-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.trn-live{font-size:.7rem;font-weight:800;letter-spacing:.1em;color:#a9c2ff}.trn-legend{display:flex;align-items:center;gap:6px;color:#aabce5;font-size:.68rem}.trn-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#4d8fff}.trn-legend i:nth-of-type(2){background:#ff7aa8}.trn-legend i:nth-of-type(3){background:#9b7bff}.trn-scene{margin-top:12px;border:1px solid #1a3470;border-radius:16px;background:radial-gradient(ellipse at 50% 45%,rgba(28,68,145,.28),rgba(4,10,28,.2) 70%);overflow:hidden}.trn-scene svg{display:block;width:100%;height:auto}.trn-pol{filter:drop-shadow(0 0 12px #8c77ff88)}.trn-caption{display:grid;grid-template-columns:42px 1fr;gap:12px;margin-top:14px;padding:14px;border:1px solid #1d3978;border-radius:14px;background:#071432}.trn-stepnum{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#142d67;color:#a9c4ff;font-weight:800}.trn-caption h2{font-size:1.1rem;margin:0 0 6px}.trn-caption p{font-size:.87rem;line-height:1.6;color:#b8c9ee;margin:0 0 10px}.trn-caption strong{font-size:.8rem;line-height:1.5;color:#ffe0a0}
 .trn-guide{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.trn-guide-card{padding:18px;border-top:3px solid var(--c)}.trn-guide-card>span{font-size:.68rem;font-weight:800;color:var(--c);letter-spacing:.1em}.trn-guide-card h2{font-size:1.08rem;margin:10px 0}.trn-guide-card p,.trn-guide-card b{font-size:.86rem;line-height:1.65;color:#b9c9ee}.trn-guide-card b{display:block;margin-top:10px;color:#ffe0a0}.trn-note{display:grid;grid-template-columns:180px 1fr;gap:15px;padding:18px;margin-top:14px}.trn-note b{color:#91b5ff}.trn-note span{font-size:.88rem;line-height:1.6;color:#b9c9ee}
 .trn-quiz{padding:clamp(18px,4vw,30px);max-width:850px;margin:auto}.trn-quiz h2{font-size:1.2rem;line-height:1.4}.trn-options{display:grid;gap:8px;margin:18px 0}.trn-options button{text-align:left;padding:12px;border:1px solid #284783;border-radius:11px;background:#081638;color:#dce7ff}.trn-options button.good{border-color:#1fd6a5;background:#0b3a35}.trn-options button.bad{border-color:#ff7aa8;background:#40142a}.trn-options button:disabled{cursor:default}.trn-feedback{color:#b9c9ee;line-height:1.6;min-height:2.5em}.trn-quiz>button:disabled{opacity:.4}
 .trn-foot{margin-top:22px;padding:16px 18px;border:1px solid #243e7c;border-radius:14px;background:#071432}.trn-foot span{font-size:.68rem;font-weight:800;letter-spacing:.12em;color:#ff9fbe}.trn-foot p{font-size:.82rem;line-height:1.55;color:#aebfe6;margin:7px 0 0}
 @media(max-width:780px){.trn{padding:15px}.trn-layout{grid-template-columns:1fr}.trn-panel{padding:12px}.trn-pasos{grid-template-columns:repeat(2,minmax(0,1fr))}.trn-step{padding:8px 6px}.trn-step small{font-size:.62rem}.trn-controls{grid-template-columns:1fr 1fr}.trn-controls .trn-reset{grid-column:1/-1}.trn-scene-wrap{padding:9px}.trn-guide{grid-template-columns:1fr}.trn-note{grid-template-columns:1fr;gap:7px}.trn-tabs button{flex:1;font-size:.75rem;padding:10px 8px}}
 @media(prefers-reduced-motion:reduce){.trn *{animation:none!important;transition:none!important}}
 `;
 document.head.appendChild(st);
}
