// Parcialito LAB · Maduración del pre-ARNm
// Modelo animado e interactivo: cap 5′, cola poli-A, splicing y splicing alternativo.
export const TITULO_MADURACION = 'Maduración del ARNm';

const PASOS = [
  {
    id:'cap', n:'01', titulo:'Cap 5′', corto:'Cap 5′', color:'#ffc66d',
    etiqueta:'PROTECCIÓN DEL EXTREMO 5′',
    texto:'Se incorpora una guanosina modificada (7-metilguanosina) al extremo 5′ del transcripto mediante un enlace 5′–5′ trifosfato. El cap protege al ARN y participa en su reconocimiento durante la exportación y el inicio de la traducción.',
    clave:'El cap se agrega al extremo 5′; no es una secuencia de adeninas.',
    hecho:'Cap 5′ = 7-metilguanosina modificada.'
  },
  {
    id:'poli', n:'02', titulo:'Cola poli-A', corto:'Cola poli-A', color:'#5ee5bd',
    etiqueta:'EXTREMO 3′ · ADENINAS',
    texto:'Tras el corte del extremo 3′ del transcripto, la poli-A polimerasa agrega una serie de adeninas que forma la cola poli-A. Las proteínas que se unen a esta cola contribuyen a la estabilidad, exportación y regulación de la vida media del ARNm.',
    clave:'La cola poli-A se agrega al extremo 3′ y no está codificada como una larga cadena de T en el ADN molde.',
    hecho:'Cola poli-A = muchas A añadidas al extremo 3′.'
  },
  {
    id:'splicing', n:'03', titulo:'Splicing', corto:'Splicing', color:'#b49aff',
    etiqueta:'ELIMINAR INTRONES · UNIR EXONES',
    texto:'El espliceosoma reconoce señales del pre-ARNm, elimina los intrones y une los exones. El resultado es una secuencia continua que conserva los segmentos que formarán parte del ARNm maduro.',
    clave:'Los intrones se eliminan; los exones que quedan se unen en el ARNm maduro.',
    hecho:'Splicing = corte y empalme del ARN, no del ADN.'
  },
  {
    id:'alternativo', n:'04', titulo:'Splicing alternativo', corto:'Alternativo', color:'#ff8bb6',
    etiqueta:'UN MISMO TRANSCRIPTO · DISTINTAS ISOFORMAS',
    texto:'En determinados genes, los exones pueden combinarse de distintas maneras. Así, un mismo pre-ARNm puede originar ARNm maduros diferentes y, en muchos casos, isoformas proteicas distintas. No significa que se mezclen al azar: el patrón depende de señales y reguladores celulares.',
    clave:'El splicing alternativo amplía la diversidad de productos de un gen sin necesitar un gen distinto para cada isoforma.',
    hecho:'Exones alternativos → ARNm maduros diferentes.'
  }
];

const escapeHTML = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function abrirMaduracionARNm({app, volver}) {
  let paso = 0, isoforma = 'A', seleccionado = 'pre';
  let quizIndex = 0, quizCorrectas = 0, quizRespondida = false;
  const preguntas = [
    {q:'¿En qué extremo se incorpora el cap?', o:['Extremo 3′','Extremo 5′','En medio de cada intrón','En ambos extremos'],ok:1,exp:'El cap de 7-metilguanosina se incorpora al extremo 5′.'},
    {q:'¿Qué componente se agrega para formar la cola poli-A?',o:['Uracilos','Guaninas modificadas','Adeninas','Intrones'],ok:2,exp:'La poli-A polimerasa agrega una serie de adeninas al extremo 3′.'},
    {q:'Durante el splicing convencional…',o:['Se eliminan exones','Se eliminan intrones y se unen exones','Se duplica el ADN','Se traducen codones'],ok:1,exp:'El espliceosoma elimina intrones y empalma los exones.'},
    {q:'El splicing alternativo permite…',o:['Que un gen origine distintas isoformas de ARNm','Que el ARN se convierta en ADN siempre','Que desaparezcan todos los exones','Que la traducción ocurra en el núcleo'],ok:0,exp:'La selección de exones puede producir diferentes ARNm maduros a partir de un mismo transcripto.'}
  ];

  function dibujo() {
    const alternativo = paso === 3;
    const compacta = paso >= 2;
    const exons = alternativo
      ? (isoforma === 'B'
        ? [{x:95,w:85,t:'E1',c:'#4c8dff'},{x:190,w:85,t:'E2',c:'#4c8dff'},{x:285,w:85,t:'E4',c:'#ff8bb6'},{x:380,w:85,t:'E5',c:'#4c8dff'}]
        : [{x:95,w:85,t:'E1',c:'#4c8dff'},{x:190,w:85,t:'E2',c:'#4c8dff'},{x:285,w:85,t:'E3',c:'#ff8bb6'},{x:380,w:85,t:'E5',c:'#4c8dff'}])
      : compacta
        ? [{x:95,w:85,t:'E1',c:'#4c8dff'},{x:190,w:85,t:'E2',c:'#4c8dff'},{x:285,w:85,t:'E3',c:'#4c8dff'},{x:380,w:85,t:'E4',c:'#4c8dff'}]
        : [{x:95,w:85,t:'E1',c:'#4c8dff'},{x:270,w:85,t:'E2',c:'#4c8dff'},{x:445,w:85,t:'E3',c:'#4c8dff'},{x:620,w:85,t:'E4',c:'#4c8dff'}];
    const introns = [{x:180,w:90,t:'I1'},{x:355,w:90,t:'I2'},{x:530,w:90,t:'I3'}];
    const showIntrons = paso < 3;
    const exonMarkup = exons.map(e=>`<g class="mr-exon" data-part="${e.t}" tabindex="0" role="button" aria-label="Seleccionar exón ${e.t}"><rect x="${e.x}" y="139" width="${e.w}" height="44" rx="10" fill="${e.c}" stroke="#d9e8ff" stroke-opacity=".7"/><text x="${e.x+e.w/2}" y="166" text-anchor="middle" fill="#fff" font-size="15" font-weight="800">${e.t}</text></g>`).join('');
    const intronMarkup = introns.map((e,i)=>`<g class="${paso < 2 ? 'mr-intron' : 'mr-intron sale'}"><path d="M${e.x} 161 H${e.x+e.w}" stroke="#ff9b69" stroke-width="5" stroke-linecap="round" stroke-dasharray="6 7"/><text x="${e.x+e.w/2}" y="123" text-anchor="middle" fill="#ffb18c" font-size="12">${e.t} · intrón</text></g>`).join('');
    const cap = paso >= 0 ? `<g class="mr-cap"><path d="M62 161 H94" stroke="#d5e4ff" stroke-width="5" stroke-linecap="round"/><circle cx="53" cy="161" r="17" fill="#ffc66d" stroke="#fff0c8" stroke-width="2"/><text x="53" y="165" text-anchor="middle" fill="#35210a" font-size="11" font-weight="900">m⁷G</text><text x="53" y="194" text-anchor="middle" fill="#ffc66d" font-size="11">CAP 5′</text></g>` : '';
    const tail = paso >= 1 ? `<g class="mr-tail"><path d="M705 161 H730" stroke="#d5e4ff" stroke-width="5" stroke-linecap="round"/>${Array.from({length:7},(_,i)=>`<circle cx="${740+i*13}" cy="${161+Math.sin(i*1.4)*5}" r="5" fill="#5ee5bd" style="animation-delay:${i*.07}s"/>`).join('')}<text x="778" y="194" text-anchor="middle" fill="#5ee5bd" font-size="11">COLA poli-A</text></g>` : '';
    const title = paso === 0 ? 'PRE-ARNm + CAP 5′' : paso === 1 ? 'ARNm CON CAP + COLA POLI-A' : alternativo ? `ISOFORMA ${isoforma}` : 'ARNm MADURO · EXONES UNIDOS';
    const intronText = showIntrons ? intronMarkup : '';
    return `<svg class="mr-svg" viewBox="0 0 850 270" role="img" aria-label="Esquema animado de maduración del ARN mensajero">
      <defs><linearGradient id="mrLine" x1="0" x2="1"><stop stop-color="#7caaff"/><stop offset="1" stop-color="#cfb6ff"/></linearGradient><filter id="mrGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect x="8" y="8" width="834" height="254" rx="18" fill="#07142b" stroke="#203a69"/>
      <text x="30" y="38" fill="#92baff" font-size="12" font-weight="800" letter-spacing="2">${title}</text>
      <path d="M62 161 H788" stroke="url(#mrLine)" stroke-width="5" stroke-linecap="round" opacity=".65"/>
      ${cap}${intronText}${exonMarkup}${tail}
      ${paso===2 ? '<g class="mr-splice"><path d="M180 105 Q395 35 620 105" fill="none" stroke="#b49aff" stroke-width="2" stroke-dasharray="5 7"/><path d="M390 48 l-9 13 h18 z" fill="#b49aff"/><text x="400" y="77" text-anchor="middle" fill="#c8b7ff" font-size="13">espliceosoma: elimina intrones</text></g>':''}
      ${alternativo ? `<g class="mr-alt"><rect x="270" y="202" width="85" height="23" rx="7" fill="#ff8bb6" opacity="${isoforma==='A'?1:.18}"/><text x="312" y="218" text-anchor="middle" fill="#fff" font-size="10">E3 ${isoforma==='A'?'incluido':'omitido'}</text><rect x="445" y="202" width="85" height="23" rx="7" fill="#ff8bb6" opacity="${isoforma==='B'?1:.18}"/><text x="487" y="218" text-anchor="middle" fill="#fff" font-size="10">E4 ${isoforma==='B'?'incluido':'omitido'}</text></g>`:''}
      <text x="60" y="238" fill="#a7bce4" font-size="11">5′</text><text x="788" y="238" fill="#a7bce4" font-size="11" text-anchor="end">3′</text>
    </svg>`;
  }

  function render() {
    const p = PASOS[paso];
    app.innerHTML = `<main class="mr-lab">
      <header class="mr-head"><button class="mr-back" id="mr-back">← Todos los laboratorios</button><div class="mr-brand">PARCIALITO <b>LAB</b> · GENÉTICA MOLECULAR</div><div class="mr-heading"><div><p class="mr-eyebrow">TRANSCRIPCIÓN Y PROCESAMIENTO POSTRANSCRIPCIONAL</p><h1>Maduración del ARNm</h1><p class="mr-lead">Seguí el recorrido del pre-ARNm: agregá sus extremos, quitá intrones y compará dos isoformas.</p></div><div class="mr-status"><span class="mr-pulse"></span> MODELO INTERACTIVO</div></div>
      <div class="mr-stepbar">${PASOS.map((x,i)=>`<button data-step="${i}" class="${i===paso?'active':''}" style="--step-color:${x.color}"><span>${x.n}</span><b>${x.corto}</b></button>`).join('')}</div></header>
      <section class="mr-work">
        <div class="mr-model-card"><div class="mr-model-head"><div><span class="mr-mini">MODELO MOLECULAR</span><h2>${p.titulo}</h2></div><span class="mr-step-count">${paso+1} / ${PASOS.length}</span></div>
          <div id="mr-drawing">${dibujo()}</div>
          <div class="mr-legend"><span><i style="--dot:#4c8dff"></i>Exones</span><span><i style="--dot:#ff9b69"></i>Intrones</span><span><i style="--dot:#ffc66d"></i>Cap 5′</span><span><i style="--dot:#5ee5bd"></i>Cola poli-A</span></div>
          <div class="mr-model-actions"><button id="mr-prev" class="mr-secondary" ${paso===0?'disabled':''}>← Anterior</button><button id="mr-next" class="mr-primary">${paso===3?'Ir a preguntas':'Siguiente proceso →'}</button></div>
        </div>
        <aside class="mr-explain"><div class="mr-eyebrow">QUÉ ESTÁ PASANDO</div><h2 style="color:${p.color}">${p.etiqueta}</h2><p>${p.texto}</p><div class="mr-key"><span>IDEA CLAVE</span><p>${p.clave}</p></div><div class="mr-fact"><b>Recordá</b><p>${p.hecho}</p></div>
          ${paso===3?'<div class="mr-iso"><b>Comparar isoformas</b><p>Elegí qué variante de ARNm querés observar.</p><div><button data-iso="A" class="'+(isoforma==='A'?'active':'')+'">Isoforma A</button><button data-iso="B" class="'+(isoforma==='B'?'active':'')+'">Isoforma B</button></div></div>':''}
        </aside>
      </section>
      <section class="mr-quiz-card"><div class="mr-quiz-intro"><div><span class="mr-eyebrow">COMPROBÁ LO QUE ENTENDISTE</span><h2>Desafío rápido</h2><p>Cuatro preguntas con corrección y explicación.</p></div><span class="mr-quiz-mark">✦</span></div><div id="mr-quiz"></div></section>
    </main>`;
    styles();
    app.querySelector('#mr-back').onclick=volver;
    app.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{paso=+b.dataset.step;render();});
    app.querySelector('#mr-prev').onclick=()=>{if(paso>0){paso--;render();}};
    app.querySelector('#mr-next').onclick=()=>{if(paso<3){paso++;render();}else{app.querySelector('#mr-quiz-card')?.scrollIntoView({behavior:'smooth'});app.querySelector('#mr-quiz')?.scrollIntoView({behavior:'smooth',block:'center'});}};
    app.querySelectorAll('[data-iso]').forEach(b=>b.onclick=()=>{isoforma=b.dataset.iso;render();});
    app.querySelectorAll('[data-part]').forEach(el=>{const pick=()=>{seleccionado=el.dataset.part;const note=app.querySelector('#mr-selected');if(note)note.textContent='Seleccionaste '+seleccionado+'. Mirá el color y la posición en el esquema.';};el.addEventListener('click',pick);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick();}});});
    paintQuiz();
    app.querySelectorAll('.mr-model-card').forEach(el=>{el.style.setProperty('--current',p.color);});
    if(paso===3) app.querySelector('#mr-drawing')?.setAttribute('aria-live','polite');
    app.querySelector('.mr-model-card').insertAdjacentHTML('beforeend','<p class="mr-selected" id="mr-selected">Tocá un exón o una parte del modelo para seleccionarla.</p>');
  }

  function paintQuiz() {
    const q=app.querySelector('#mr-quiz'); if(!q)return;
    if(quizIndex>=preguntas.length){q.innerHTML=`<div class="mr-result"><b>${quizCorrectas} / ${preguntas.length}</b><p>${quizCorrectas>=3?'¡Muy bien! Dominás los pasos principales.':'Repasá las cuatro etapas y volvé a intentarlo.'}</p><button class="mr-primary" id="mr-retry">Repetir preguntas</button></div>`;q.querySelector('#mr-retry').onclick=()=>{quizIndex=0;quizCorrectas=0;quizRespondida=false;paintQuiz();};return;}
    quizRespondida=false;const item=preguntas[quizIndex];
    q.innerHTML=`<div class="mr-qtop"><span>Pregunta ${quizIndex+1} de ${preguntas.length}</span><span>Correctas: ${quizCorrectas}</span></div><h3>${escapeHTML(item.q)}</h3><div class="mr-options">${item.o.map((x,i)=>`<button data-answer="${i}"><b>${'ABCD'[i]}</b><span>${escapeHTML(x)}</span></button>`).join('')}</div><p class="mr-feedback" id="mr-feedback">Elegí una respuesta.</p>`;
    q.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(quizRespondida)return;quizRespondida=true;const ok=+b.dataset.answer===item.ok;if(ok)quizCorrectas++;q.querySelectorAll('[data-answer]').forEach(x=>{x.disabled=true;if(+x.dataset.answer===item.ok)x.classList.add('correct');});if(!ok)b.classList.add('wrong');q.querySelector('#mr-feedback').textContent=(ok?'¡Correcto! ':'No exactamente. ')+item.exp;const next=document.createElement('button');next.className='mr-primary';next.textContent=quizIndex===preguntas.length-1?'Ver resultado':'Siguiente pregunta →';next.onclick=()=>{quizIndex++;paintQuiz();};q.appendChild(next);});
  }

  function styles() {
    if(document.getElementById('mr-css'))return;
    const st=document.createElement('style');st.id='mr-css';st.textContent=`
      .mr-lab{box-sizing:border-box;max-width:1280px;min-height:100dvh;margin:auto;padding:clamp(14px,3vw,34px);color:#eef4ff;background:radial-gradient(55rem 28rem at 8% -8rem,#173a7b 0,transparent 65%),radial-gradient(35rem 22rem at 100% 30%,#3c1c6650 0,transparent 70%),#040a1b;font-family:var(--fuente,Inter,system-ui,sans-serif);box-shadow:0 0 0 100vmax #040a1b;clip-path:inset(0 -100vmax)}.mr-lab *{box-sizing:border-box}.mr-lab button{font:inherit;cursor:pointer}.mr-lab button:focus-visible{outline:2px solid #a5c7ff;outline-offset:3px}.mr-head{border-bottom:1px solid #233d72;padding-bottom:22px}.mr-back,.mr-secondary{border:1px solid #2a477d;border-radius:10px;background:#0a1a37;color:#c9d9fb;padding:9px 13px;font-size:.83rem}.mr-back:hover,.mr-secondary:hover:not(:disabled){border-color:#6896ff}.mr-brand{margin-top:22px;color:#9bbdff;font-size:.72rem;letter-spacing:.14em;font-weight:850}.mr-brand b{display:inline-block;padding:4px 7px;background:#5364f4;border-radius:6px;color:white}.mr-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:20px}.mr-eyebrow{color:#85aaff;font-size:.68rem;letter-spacing:.14em;font-weight:850}.mr-heading h1{margin:8px 0;font-size:clamp(2rem,4vw,3.2rem);line-height:1.05;letter-spacing:-.04em}.mr-lead{max-width:70ch;margin:0;color:#b9c9e8;line-height:1.65}.mr-status{display:flex;align-items:center;gap:8px;white-space:nowrap;border:1px solid #274576;border-radius:99px;padding:9px 12px;color:#9fc1ff;font-size:.66rem;font-weight:800;letter-spacing:.08em}.mr-pulse{width:8px;height:8px;border-radius:50%;background:#5ee5bd;box-shadow:0 0 12px #5ee5bd;animation:mrPulse 1.8s infinite}.mr-stepbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:24px}.mr-stepbar button{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid #203963;border-radius:13px;background:#09152c;color:#b9c9e8;padding:12px;min-width:0}.mr-stepbar button span{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:9px;background:#15294b;color:var(--step-color);font-size:.72rem;font-weight:900}.mr-stepbar button b{font-size:.84rem}.mr-stepbar button.active{border-color:var(--step-color);background:linear-gradient(120deg,#12254a,#09152c);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--step-color) 25%,transparent),0 8px 20px #0002;color:#fff}.mr-work{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.9fr);gap:16px;margin-top:18px;align-items:stretch}.mr-model-card,.mr-explain,.mr-quiz-card{border:1px solid #203963;border-radius:18px;background:linear-gradient(145deg,#0b1934,#061126);box-shadow:0 12px 28px #0002}.mr-model-card{padding:clamp(14px,2vw,23px);min-width:0}.mr-model-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.mr-mini{font-size:.65rem;letter-spacing:.14em;color:#87a9eb;font-weight:850}.mr-model-head h2{margin:6px 0 0;font-size:clamp(1.15rem,2vw,1.5rem)}.mr-step-count{border:1px solid #2b4673;border-radius:9px;padding:6px 9px;color:#a8c6fa;font-size:.75rem;white-space:nowrap}.mr-svg{display:block;width:100%;height:auto;margin-top:8px;overflow:visible}.mr-exon{cursor:pointer;outline:none;animation:mrIn .55s both}.mr-exon:hover rect,.mr-exon:focus rect{filter:url(#mrGlow) brightness(1.2)}.mr-intron{animation:mrIn .55s both}.mr-intron.sale{animation:mrOut .7s forwards}.mr-cap circle,.mr-tail circle{animation:mrBob 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}.mr-splice{animation:mrIn .5s both}.mr-legend{display:flex;gap:13px;flex-wrap:wrap;margin:4px 0 16px;color:#a9bee3;font-size:.73rem}.mr-legend span{display:flex;align-items:center;gap:6px}.mr-legend i{width:9px;height:9px;border-radius:50%;background:var(--dot);box-shadow:0 0 8px var(--dot)}.mr-model-actions{display:flex;justify-content:space-between;gap:10px;padding-top:13px;border-top:1px solid #1c3154}.mr-primary{border:1px solid #627aff;border-radius:10px;background:linear-gradient(135deg,#4567ff,#5741d8);color:#fff;padding:10px 14px;font-weight:800;font-size:.82rem;box-shadow:0 6px 16px #3d4ee933}.mr-secondary:disabled{opacity:.35;cursor:default}.mr-explain{padding:clamp(17px,2.2vw,25px);border-top:3px solid var(--current,#b49aff)}.mr-explain h2{margin:10px 0;font-size:1.12rem;line-height:1.4}.mr-explain>p{color:#c1d0ec;font-size:.88rem;line-height:1.75}.mr-key{margin-top:19px;padding:14px;border:1px solid #2b4677;border-radius:12px;background:#09152b}.mr-key>span{font-size:.65rem;color:#90b3ff;font-weight:900;letter-spacing:.12em}.mr-key p{margin:7px 0 0;color:#e3edff;font-size:.85rem;line-height:1.65}.mr-fact{margin-top:12px;display:flex;gap:10px;align-items:flex-start}.mr-fact b{flex:none;color:#b8ceff;font-size:.8rem}.mr-fact p{margin:0;color:#9db3da;font-size:.8rem;line-height:1.55}.mr-iso{margin-top:18px;border-top:1px solid #23385d;padding-top:15px}.mr-iso>b{font-size:.86rem}.mr-iso p{color:#aabfe4;font-size:.8rem;line-height:1.5}.mr-iso>div{display:flex;gap:8px}.mr-iso button{flex:1;border:1px solid #334a74;border-radius:9px;background:#0c1c38;color:#b9c9e8;padding:9px;font-size:.8rem}.mr-iso button.active{border-color:#ff8bb6;background:#351b35;color:#fff}.mr-quiz-card{margin-top:17px;padding:clamp(16px,3vw,26px)}.mr-quiz-intro{display:flex;align-items:center;justify-content:space-between;gap:15px;border-bottom:1px solid #21375c;padding-bottom:14px}.mr-quiz-intro h2{margin:7px 0 4px;font-size:1.35rem}.mr-quiz-intro p{margin:0;color:#a9bee3;font-size:.84rem}.mr-quiz-mark{font-size:2rem;color:#a995ff}.mr-qtop{display:flex;justify-content:space-between;gap:10px;margin:15px 0;color:#91aad5;font-size:.78rem}.mr-quiz-card h3{font-size:1rem;line-height:1.55}.mr-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.mr-options button{display:flex;align-items:center;gap:10px;text-align:left;border:1px solid #2a4168;border-radius:10px;background:#0b1a34;color:#dbe7ff;padding:10px;font-size:.82rem;line-height:1.5}.mr-options button b{display:grid;place-items:center;flex:none;width:27px;height:27px;border-radius:8px;background:#1a3156;color:#a9c8ff}.mr-options button.correct{border-color:#37b994;background:#10362f}.mr-options button.wrong{border-color:#d75d88;background:#381a2a}.mr-options button:disabled{cursor:default}.mr-feedback{min-height:35px;color:#b6caed;font-size:.83rem;line-height:1.6}.mr-result{display:flex;align-items:center;gap:15px;flex-wrap:wrap;padding-top:15px}.mr-result>b{font-size:1.6rem;color:#a8c4ff}.mr-result p{flex:1;color:#b6caed;font-size:.84rem}.mr-selected{margin:7px 0 0;color:#91a8d0;font-size:.73rem}.mr-alt{animation:mrIn .5s both}@keyframes mrIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes mrOut{to{opacity:0;transform:translateY(-13px);pointer-events:none}}@keyframes mrBob{50%{transform:translateY(-4px)}}@keyframes mrPulse{50%{opacity:.35;box-shadow:0 0 3px #5ee5bd}}@media(max-width:900px){.mr-work{grid-template-columns:1fr}.mr-explain{border-top:1px solid #203963;border-left:3px solid var(--current,#b49aff)}.mr-heading{align-items:flex-start;flex-direction:column}.mr-status{align-self:flex-start}}@media(max-width:620px){.mr-lab{padding:13px 10px 28px}.mr-stepbar{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.mr-stepbar button{padding:9px;gap:7px}.mr-stepbar button span{width:27px;height:27px}.mr-stepbar button b{font-size:.78rem}.mr-svg{min-width:620px}.mr-model-card #mr-drawing{overflow-x:auto;padding-bottom:5px}.mr-options{grid-template-columns:1fr}.mr-model-actions button{font-size:.77rem}.mr-status{white-space:normal}}@media(prefers-reduced-motion:reduce){.mr-lab *, .mr-lab *::before,.mr-lab *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(st);
  }
  render();
}
