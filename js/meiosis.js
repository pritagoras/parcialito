const fases=[
{nombre:'Interfase previa',grupo:'Antes de la meiosis',texto:'Durante la fase S se duplica el ADN. Cada cromosoma queda formado por dos cromátidas hermanas; la célula todavía es diploide (2n).',clave:'La duplicación del ADN ocurre una sola vez, antes de la meiosis I. No vuelve a ocurrir entre meiosis I y meiosis II.'},
{nombre:'Profase I',grupo:'Meiosis I · etapa prolongada',texto:'Los cromosomas se condensan y los homólogos se aparean (sinapsis), formando bivalentes o tétradas. Puede ocurrir crossing-over entre cromátidas no hermanas, con intercambio de segmentos y formación de quiasmas. Hacia el final, se desorganiza la envoltura nuclear y se organiza el huso.',clave:'Para este recorrido no se separan las subetapas de la profase I: lo esencial es el apareamiento de homólogos y la recombinación genética.'},
{nombre:'Metafase I',grupo:'Meiosis I · alineación',texto:'Los pares de cromosomas homólogos se ubican en el plano ecuatorial. En cada par, un homólogo queda orientado hacia un polo y el otro hacia el polo opuesto; la orientación de cada par es independiente.',clave:'Se alinean bivalentes (pares de homólogos), no cromosomas individuales. La orientación al azar contribuye a la variabilidad genética.'},
{nombre:'Anafase I',grupo:'Meiosis I · división reduccional',texto:'Los cromosomas homólogos se separan y migran hacia polos opuestos. Las cromátidas hermanas de cada cromosoma permanecen unidas por su centrómero.',clave:'Se separan los homólogos, no las cromátidas hermanas. El número de juegos cromosómicos se reduce de diploide a haploide.'},
{nombre:'Telofase I',grupo:'Meiosis I · llegada a los polos',texto:'Los cromosomas llegan a los polos y se reagrupan. Cada polo recibe la mitad del número de cromosomas de la célula original; cada cromosoma todavía está duplicado.',clave:'Cada polo contiene un juego haploide de cromosomas duplicados.'},
{nombre:'Citocinesis I e intercinesis',grupo:'Entre las dos divisiones',texto:'Se completa la división del citoplasma y se forman dos células haploides. Puede existir un intervalo llamado intercinesis; no se duplica el ADN en este período.',clave:'Las dos células entran en meiosis II sin una nueva fase S ni duplicación del ADN.'},
{nombre:'Profase II',grupo:'Meiosis II · división ecuacional',texto:'En cada una de las dos células haploides, los cromosomas pueden condensarse nuevamente y se organiza un nuevo huso. Los cromosomas se unen a las fibras del huso por la región del centrómero/cinetocoro.',clave:'La meiosis II se parece a la mitosis, pero no está precedida por duplicación del ADN.'},
{nombre:'Metafase II',grupo:'Meiosis II · alineación',texto:'En cada célula, los cromosomas —cada uno formado por dos cromátidas hermanas— se alinean individualmente en el plano ecuatorial y se conectan al huso desde polos opuestos.',clave:'Ahora se alinean cromosomas individuales, no pares de homólogos.'},
{nombre:'Anafase II',grupo:'Meiosis II · separación de hermanas',texto:'Se separan las cromátidas hermanas de cada cromosoma y migran hacia polos opuestos. Desde ese momento, cada cromátida separada se considera un cromosoma independiente.',clave:'La meiosis II es ecuacional: separa cromátidas hermanas y mantiene el número haploide de cromosomas en cada producto.'},
{nombre:'Telofase II',grupo:'Meiosis II · formación de núcleos',texto:'Los cromosomas llegan a los polos, el huso se desorganiza y se forman nuevas envolturas nucleares. Cada uno de los cuatro núcleos resultantes posee la mitad del número de cromosomas de la célula progenitora.',clave:'Se forman cuatro núcleos haploides; la citocinesis termina de separar los productos celulares.'},
{nombre:'Resultado de la meiosis',grupo:'Cuatro productos haploides',texto:'Tras la citocinesis se obtienen habitualmente cuatro células haploides. La recombinación de la profase I y la distribución al azar de los homólogos generan combinaciones genéticas diferentes.',clave:'Meiosis I separa homólogos (reduccional); meiosis II separa cromátidas hermanas (ecuacional).'}
];
const css='.mei{color:#edf3ff;font:15px/1.5 system-ui,sans-serif;max-width:1050px;margin:auto;padding:clamp(10px,2vw,20px)}.mei *{box-sizing:border-box}.mei button{cursor:pointer;border:1px solid #354b79;border-radius:12px;background:#152443;color:#edf3ff;padding:10px 13px;font:inherit}.mei button:focus-visible{outline:3px solid #63e8c3;outline-offset:2px}.mei .hero,.mei .panel{border:1px solid #2a416c;background:linear-gradient(145deg,#122342,#0c1830);border-radius:18px;padding:clamp(13px,2.5vw,20px);margin:12px 0}.mei h1{font-size:clamp(25px,4vw,36px);line-height:1.15;margin:7px 0}.mei h2{font-size:clamp(19px,3vw,25px);margin:7px 0}.mei p{color:#bdcce8}.mei .eyebrow{color:#63e8c3;font-size:11px;font-weight:800;letter-spacing:.12em}.mei .phases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.mei .phases button{text-align:left;font-size:12px;line-height:1.3;min-height:46px}.mei button.active{border-color:#63e8c3;background:#20395a;box-shadow:inset 0 0 0 1px #63e8c344}.mei .progress{height:5px;background:#253757;border-radius:9px;overflow:hidden;margin-top:14px}.mei .progress span{display:block;height:100%;background:linear-gradient(90deg,#a99aff,#63e8c3)}.mei .stage{background:radial-gradient(ellipse at 50% 42%,#1b3157,#081326 75%);border:1px solid #2b426d;border-radius:16px;padding:5px;margin:12px 0}.mei svg{display:block;width:100%;height:auto;max-height:440px}.mei .legend{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;color:#bdcce8;font-size:12px;padding:5px}.mei .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.mei .controls{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:10px}.mei .controls .next{background:#20483f;border-color:#387b6b}.mei .note{border-left:3px solid #63e8c3;padding:10px 12px;background:#142a45;border-radius:8px;color:#e0eaff}.mei .crossgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}.mei .crossgrid>div{background:#0a1730;border:1px solid #30466e;border-radius:12px;padding:12px}.mei .crossgrid p{font-size:13px;margin:5px 0}.mei .small{font-size:12px;color:#9fb2d6}@media(max-width:540px){.mei .phases{grid-template-columns:repeat(2,minmax(0,1fr))}.mei .crossgrid{grid-template-columns:1fr}.mei .controls button{flex:1}}@media(prefers-reduced-motion:no-preference){.mei svg .chr{transform-box:fill-box;transform-origin:center;animation:mei-arrive .45s ease-out both}.mei svg .travel-left{animation:mei-travel-left .82s cubic-bezier(.2,.7,.25,1) both}.mei svg .travel-right{animation:mei-travel-right .82s cubic-bezier(.2,.7,.25,1) both}@keyframes mei-arrive{from{opacity:.25;scale:.88}to{opacity:1;scale:1}}@keyframes mei-travel-left{from{translate:26px 0;opacity:.5}to{translate:0 0;opacity:1}}@keyframes mei-travel-right{from{translate:-26px 0;opacity:.5}to{translate:0 0;opacity:1}}}';
function dibujo(n){
 const A='#a99aff',B='#ff9f78',G='#63e8c3',Y='#f3ce67',H='#54cfe6',W='#eaf1ff';
 const cell=(x,y,rx,ry=rx)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#10234a" fill-opacity=".82" stroke="#6383d1" stroke-width="2.5"/>';
 const nucleus=(x,y,r,broken=false)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#17274e" fill-opacity=".55" stroke="#a99aff" stroke-width="2" '+(broken?'stroke-dasharray="5 6"':'')+'/>';
 const chrom=(x,y,c,angle=0,swap=null,movement='')=>'<g class="chr '+movement+'" transform="translate('+x+' '+y+') rotate('+angle+')"><path d="M-9 -23 L0 0 L-9 23 M9 -23 L0 0 L9 23" stroke="'+c+'" stroke-width="7" fill="none" stroke-linecap="round"/>'+(swap?'<path d="M1 4 L9 23" stroke="'+swap+'" stroke-width="7" fill="none" stroke-linecap="round"/>':'')+'<circle r="4" fill="#ffe7a3" stroke="#fff4d1" stroke-width="1.2"/></g>';
 const single=(x,y,c,angle=0,swap=null,movement='')=>'<g class="chr '+movement+'" transform="translate('+x+' '+y+') rotate('+angle+')"><path d="M-6 -20 L0 0 L-6 20 M6 -20 L0 0 L6 20" stroke="'+c+'" stroke-width="6" fill="none" stroke-linecap="round"/>'+(swap?'<path d="M1 5 L6 19" stroke="'+swap+'" stroke-width="6" fill="none" stroke-linecap="round"/>':'')+'<circle r="3.4" fill="#ffe7a3"/></g>';
 const pole=(x,y)=>'<g transform="translate('+x+' '+y+')" stroke="#fff0bf" stroke-width="1.5" fill="'+Y+'"><circle r="5"/><path d="M-10 0H10M0 -10V10" stroke-linecap="round"/></g>';
 const fiber=(x1,y1,x2,y2,curve=0)=>'<path d="M'+x1+' '+y1+' Q'+((x1+x2)/2)+' '+(y1+curve)+' '+x2+' '+y2+'" stroke="'+H+'" stroke-width="1.4" opacity=".85" fill="none"/>';
 const txt=(x,y,s,size=10,color=W)=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" text-anchor="middle">'+s+'</text>';
 let s='<svg viewBox="0 0 360 320" role="img" aria-label="'+fases[n].nombre+'; esquema de cromosomas durante la meiosis">';
 if(n===0){
  s+=cell(180,145,120)+nucleus(180,145,76)+chrom(148,119,A,-10)+chrom(212,119,B,10)+chrom(148,172,G,-10)+chrom(212,172,Y,10);
  s+=txt(180,42,'DUPLICACIÓN PREVIA DEL ADN',12,G)+txt(180,286,'2n = 4 cromosomas · 8 cromátidas',10);
 }else if(n===1){
  s+=cell(180,145,120)+nucleus(180,145,77,true)+txt(180,39,'PROFASE I · VISIÓN GENERAL',12,G);
  // Two bivalents with four chromatids each; crossover is shown only as a short exchanged segment.
  s+=chrom(143,112,A,-8,B)+chrom(163,112,B,8,A)+chrom(143,177,G,-8,Y)+chrom(163,177,Y,8,G);
  s+='<path d="M143 101 Q153 87 163 101 M143 166 Q153 152 163 166" fill="none" stroke="#fff0c2" stroke-width="2" stroke-dasharray="3 3"/>';
  s+=txt(250,104,'Bivalente',10,G)+txt(250,119,'(2 homólogos)',9)+txt(250,169,'Quiasma',10,Y)+txt(250,184,'intercambio',9);
  s+=txt(180,286,'Sinapsis + crossing-over + huso',10);
 }else if(n===2){
  s+=cell(180,145,120)+pole(63,145)+pole(297,145)+txt(180,39,'PLANO ECUATORIAL',12,G);
  s+=fiber(63,145,143,115,-20)+fiber(63,145,143,175,20)+fiber(297,145,163,115,-20)+fiber(297,145,163,175,20);
  s+=chrom(143,115,A,-8)+chrom(163,115,B,8)+chrom(143,175,G,-8)+chrom(163,175,Y,8);
  s+='<path d="M125 145H215" stroke="#f3ce67" stroke-width="1.5" stroke-dasharray="4 4"/>'+txt(180,286,'Los homólogos se orientan a polos opuestos',10);
 }else if(n===3){
  s+=cell(180,145,120)+pole(63,145)+pole(297,145)+txt(180,39,'SEPARACIÓN DE HOMÓLOGOS',12,G);
  s+=fiber(63,145,105,112)+fiber(63,145,105,178)+fiber(297,145,255,112)+fiber(297,145,255,178);
  s+=chrom(105,112,A,-8,null,'travel-left')+chrom(105,178,G,-8,null,'travel-left')+chrom(255,112,B,8,null,'travel-right')+chrom(255,178,Y,8,null,'travel-right');
  s+=txt(180,286,'Las cromátidas hermanas siguen unidas',10);
 }else if(n===4){
  s+=cell(180,145,120)+pole(78,145)+pole(282,145)+chrom(112,112,A,-8)+chrom(112,178,G,-8)+chrom(248,112,B,8)+chrom(248,178,Y,8);
  s+=nucleus(112,145,38,true)+nucleus(248,145,38,true)+txt(180,39,'HOMÓLOGOS EN POLOS OPUESTOS',11,G)+txt(180,286,'Cada polo recibe un juego haploide duplicado',10);
 }else if(n===5){
  s+=cell(94,145,68,78)+cell(266,145,68,78)+nucleus(94,145,43)+nucleus(266,145,43)+chrom(80,126,A,-8)+chrom(108,164,G,8)+chrom(252,126,B,-8)+chrom(280,164,Y,8);
  s+=txt(94,244,'n = 2',11,G)+txt(266,244,'n = 2',11,G)+txt(180,286,'Dos células haploides · ADN sin duplicarse',10);
 }else if(n===6){
  s+=cell(94,145,68,78)+cell(266,145,68,78)+nucleus(94,145,43,true)+nucleus(266,145,43,true)+pole(48,145)+pole(140,145)+pole(220,145)+pole(312,145);
  s+=fiber(48,145,80,126,-8)+fiber(140,145,108,164,8)+fiber(220,145,252,126,-8)+fiber(312,145,280,164,8);
  s+=chrom(80,126,A,-8)+chrom(108,164,G,8)+chrom(252,126,B,-8)+chrom(280,164,Y,8)+txt(180,39,'NUEVOS HUSOS',12,G)+txt(180,286,'Cada célula inicia su propia división',10);
 }else if(n===7){
  s+=cell(94,145,68,78)+cell(266,145,68,78)+pole(48,145)+pole(140,145)+pole(220,145)+pole(312,145);
  s+=fiber(48,145,80,126,-8)+fiber(140,145,80,126,8)+fiber(48,145,108,164,8)+fiber(140,145,108,164,-8)+fiber(220,145,252,126,-8)+fiber(312,145,252,126,8)+fiber(220,145,280,164,8)+fiber(312,145,280,164,-8);
  s+=chrom(80,126,A,-8)+chrom(108,164,G,8)+chrom(252,126,B,-8)+chrom(280,164,Y,8)+txt(180,39,'CROMOSOMAS INDIVIDUALES EN EL ECUADOR',11,G)+txt(94,244,'n = 2',10)+txt(266,244,'n = 2',10)+txt(180,286,'Cada cromosoma conserva dos cromátidas',10);
 }else if(n===8){
  s+=cell(94,145,68,78)+cell(266,145,68,78)+pole(48,145)+pole(140,145)+pole(220,145)+pole(312,145);
  s+=fiber(48,145,66,126)+fiber(140,145,116,126)+fiber(48,145,66,164)+fiber(140,145,116,164)+fiber(220,145,234,126)+fiber(312,145,284,126)+fiber(220,145,234,164)+fiber(312,145,284,164);
  s+=single(66,126,A,-12,null,'travel-left')+single(116,126,A,12,B,'travel-right')+single(66,164,G,-12,null,'travel-left')+single(116,164,G,12,null,'travel-right')+single(234,126,B,-12,A,'travel-left')+single(284,126,B,12,null,'travel-right')+single(234,164,Y,-12,null,'travel-left')+single(284,164,Y,12,null,'travel-right');
  s+=txt(180,39,'SEPARACIÓN DE CROMÁTIDAS HERMANAS',11,G)+txt(94,244,'n = 2',10)+txt(266,244,'n = 2',10)+txt(180,286,'Cada cromátida pasa a ser un cromosoma',10);
 }else if(n===9){
  s+=cell(94,145,68,78)+cell(266,145,68,78)+nucleus(94,145,43)+nucleus(266,145,43)+nucleus(94,145,25)+nucleus(266,145,25);
  s+=single(80,126,A,-12)+single(108,164,G,12)+single(252,126,B,-12)+single(280,164,Y,12);
  s+=txt(180,39,'RECONSTITUCIÓN DE NÚCLEOS',12,G)+txt(94,244,'2n? No: n = 2',10)+txt(266,244,'n = 2',10)+txt(180,286,'Cuatro núcleos haploides en total',10);
 }else{
  const pos=[[82,87,A],[278,87,B],[82,204,G],[278,204,Y]];
  pos.forEach(([x,y,c])=>{s+=cell(x,y,38,42)+nucleus(x,y,24)+single(x-9,y,c,-8)+single(x+9,y,c,8)});
  s+=txt(180,39,'RESULTADO',12,G)+txt(180,278,'4 productos haploides · n = 2 en el ejemplo',10);
 }
 return s+'</svg>';
}
export function abrirMeiosis({app,volver}) {
  let n = 0;
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; };
  const old = document.getElementById('meiosis-css');
  if (old) old.remove();
  const st = document.createElement('style');
  st.id = 'meiosis-css';
  st.textContent = css;
  document.head.appendChild(st);
  function render() {
    const f = fases[n];
    app.innerHTML = '<section class="mei"><button type="button" id="back" aria-label="Volver a Mitosis y meiosis">← Volver a Mitosis y meiosis</button><header class="hero"><div class="eyebrow">PARCIALITO LAB · DIVISIÓN CELULAR</div><h1>Meiosis I y II</h1><p>Seguí el recorrido: sinapsis, recombinación genética, separación de homólogos y separación de cromátidas.</p><div class="progress"><span style="display:block;width:'+((n+1)/fases.length*100)+'%;height:100%"></span></div></header><section class="panel"><div class="phases">'+fases.map((x,i)=>'<button data-n="'+i+'" class="'+(i===n?'active':'')+'" aria-current="'+(i===n?'step':'false')+'">'+(i+1)+'. '+x.nombre+'</button>').join('')+'</div><div class="stage">'+dibujo(n)+'</div><div class="legend"><span><i class="dot" style="background:#a99aff"></i>Homólogo 1 · par 1</span><span><i class="dot" style="background:#ff9f78"></i>Homólogo 2 · par 1</span><span><i class="dot" style="background:#63e8c3"></i>Homólogo 1 · par 2</span><span><i class="dot" style="background:#f3ce67"></i>Homólogo 2 · par 2</span><span>Segmentos de color opuesto: recombinación</span></div><div class="controls"><button id="prev" '+(!n?'disabled':'')+'>← Anterior</button><button id="play">'+(timer?'⏸ Pausar':'▶ Reproducir')+'</button><span class="small">FASE '+(n+1)+' / '+fases.length+'</span><button class="next" id="next" '+(n===fases.length-1?'disabled':'')+'>Siguiente →</button></div></section><section class="panel"><div class="eyebrow">'+f.grupo.toUpperCase()+'</div><h2>'+f.nombre+'</h2><p>'+f.texto+'</p>'+(n===2?'<div class="crossgrid"><div><strong style="color:#63e8c3">¿Qué se intercambia?</strong><p>Un segmento equivalente entre cromátidas no hermanas de homólogos distintos.</p></div><div><strong style="color:#ffbd8b">¿Qué resultado deja?</strong><p>Dos cromátidas recombinantes y dos con la combinación parental en el ejemplo de un único crossing-over.</p></div></div>':'')+'<div class="note"><strong>Clave de examen:</strong> '+f.clave+'</div><p class="small">Modelo esquemático, no a escala. Cada X representa un cromosoma duplicado; cada V de anafase II representa un cromosoma de una cromátida. Los tramos del color opuesto muestran el intercambio recíproco entre cromátidas no hermanas.</p></section></section>';
    app.querySelector('#back').onclick = () => { stop(); volver(); };
    app.querySelector('#prev').onclick = () => { stop(); if(n){n--;render();} };
    app.querySelector('#next').onclick = () => { stop(); if(n<fases.length-1){n++;render();} };
    app.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{stop();n=Number(b.dataset.n);render();});
    app.querySelector('#play').onclick = () => {
      if (timer) stop();
      else timer = setInterval(() => {
        if (n >= fases.length - 1) { stop(); render(); return; }
        n++;
        render();
      }, 1800);
      render();
    };
  }
  render();
}
