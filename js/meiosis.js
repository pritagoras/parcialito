const fases=[
{nombre:'Interfase previa',grupo:'Preparación',texto:'Se replica el ADN: cada cromosoma queda formado por dos cromátidas hermanas. La célula sigue siendo diploide (2n).',clave:'La replicación sucede antes de la meiosis, no entre meiosis I y II.'},
{nombre:'Profase I · sinapsis',grupo:'Meiosis I',texto:'Los cromosomas homólogos se aparean. El conjunto de dos cromosomas duplicados forma un bivalente o tétrada, con cuatro cromátidas.',clave:'Los homólogos se aparean en meiosis I; no ocurre este apareamiento en mitosis.'},
{nombre:'Profase I · crossing-over',grupo:'Recombinación',texto:'Cromátidas no hermanas de los cromosomas homólogos intercambian segmentos equivalentes de ADN. Los puntos de unión visibles se denominan quiasmas.',clave:'En un crossing-over recíproco, dos cromátidas quedan recombinantes y dos conservan su combinación parental.'},
{nombre:'Metafase I',grupo:'Meiosis I',texto:'Los pares de homólogos se alinean en el ecuador. Cada homólogo se orienta hacia un polo opuesto y la orientación de cada par es independiente.',clave:'Se alinean pares de homólogos, no cromosomas individuales.'},
{nombre:'Anafase I',grupo:'Meiosis I',texto:'Los cromosomas homólogos se separan hacia polos opuestos. Las cromátidas hermanas permanecen unidas.',clave:'División reduccional: los centrómeros no se dividen en anafase I.'},
{nombre:'Telofase I',grupo:'Fin de meiosis I',texto:'Los homólogos ya llegaron a polos opuestos. La célula sigue siendo una sola y cada polo contiene un juego haploide de cromosomas duplicados.',clave:'Antes de la citocinesis, los dos juegos cromosómicos siguen dentro de la misma célula.'},
{nombre:'Citocinesis I',grupo:'Fin de meiosis I',texto:'Se divide el citoplasma y se forman dos células haploides. Los cromosomas de cada célula todavía están duplicados.',clave:'La citocinesis separa físicamente las células; no separa las cromátidas hermanas.'},
{nombre:'Metafase II',grupo:'Meiosis II',texto:'En cada célula, los cromosomas se alinean individualmente en el ecuador y se conectan al huso desde polos opuestos.',clave:'No hay replicación de ADN entre meiosis I y meiosis II.'},
{nombre:'Anafase II',grupo:'Meiosis II',texto:'Los centrómeros se dividen y las cromátidas hermanas se separan. Cada cromátida pasa a ser un cromosoma independiente.',clave:'En meiosis II se separan las cromátidas hermanas, como en mitosis.'},
{nombre:'Cuatro células haploides',grupo:'Resultado',texto:'Se obtienen cuatro células haploides. El crossing-over y la distribución independiente de los homólogos contribuyen a su diversidad genética.',clave:'El resultado habitual son cuatro productos haploides genéticamente diferentes.'}
];
const css='.mei{color:#edf3ff;font:15px/1.5 system-ui,sans-serif;max-width:1050px;margin:auto;padding:clamp(10px,2vw,20px)}.mei *{box-sizing:border-box}.mei button{cursor:pointer;border:1px solid #354b79;border-radius:12px;background:#152443;color:#edf3ff;padding:10px 13px;font:inherit}.mei button:focus-visible{outline:3px solid #63e8c3;outline-offset:2px}.mei .hero,.mei .panel{border:1px solid #2a416c;background:linear-gradient(145deg,#122342,#0c1830);border-radius:18px;padding:clamp(13px,2.5vw,20px);margin:12px 0}.mei h1{font-size:clamp(25px,4vw,36px);line-height:1.15;margin:7px 0}.mei h2{font-size:clamp(19px,3vw,25px);margin:7px 0}.mei p{color:#bdcce8}.mei .eyebrow{color:#63e8c3;font-size:11px;font-weight:800;letter-spacing:.12em}.mei .phases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.mei .phases button{text-align:left;font-size:12px;line-height:1.3;min-height:46px}.mei button.active{border-color:#63e8c3;background:#20395a;box-shadow:inset 0 0 0 1px #63e8c344}.mei .progress{height:5px;background:#253757;border-radius:9px;overflow:hidden;margin-top:14px}.mei .progress span{display:block;height:100%;background:linear-gradient(90deg,#a99aff,#63e8c3)}.mei .stage{background:radial-gradient(ellipse at 50% 42%,#1b3157,#081326 75%);border:1px solid #2b426d;border-radius:16px;padding:5px;margin:12px 0}.mei svg{display:block;width:100%;height:auto;max-height:440px}.mei .legend{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;color:#bdcce8;font-size:12px;padding:5px}.mei .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.mei .controls{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:10px}.mei .controls .next{background:#20483f;border-color:#387b6b}.mei .note{border-left:3px solid #63e8c3;padding:10px 12px;background:#142a45;border-radius:8px;color:#e0eaff}.mei .crossgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}.mei .crossgrid>div{background:#0a1730;border:1px solid #30466e;border-radius:12px;padding:12px}.mei .crossgrid p{font-size:13px;margin:5px 0}.mei .small{font-size:12px;color:#9fb2d6}@media(max-width:540px){.mei .phases{grid-template-columns:repeat(2,minmax(0,1fr))}.mei .crossgrid{grid-template-columns:1fr}.mei .controls button{flex:1}}@media(prefers-reduced-motion:no-preference){.mei svg .chr{transform-box:fill-box;transform-origin:center;animation:mei-arrive .45s ease-out both}@keyframes mei-arrive{from{opacity:.25;scale:.88}to{opacity:1;scale:1}}}';
function dibujo(n){
const A='#a99aff',B='#ff9f78',G='#63e8c3',Y='#f3ce67',H='#54cfe6';
const cell=(x,y,rx,ry=rx)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#10234a" stroke="#6383d1" stroke-width="2.5"/>';
const chrom=(x,y,c,re=null,other=null)=>'<g class="chr" transform="translate('+x+' '+y+')"><path d="M-8 -22 L8 22 M8 -22 L-8 22" stroke="'+c+'" stroke-width="6" fill="none" stroke-linecap="round"/>'+(re==='down'&&other?'<path d="M1 4 L8 22" stroke="'+other+'" stroke-width="6" fill="none" stroke-linecap="round"/>':'')+(re==='up'&&other?'<path d="M-1 -4 L-8 -22" stroke="'+other+'" stroke-width="6" fill="none" stroke-linecap="round"/>':'')+'<circle r="3.5" fill="#f4f7ff" stroke="#09152c" stroke-width="1"/></g>';
const single=(x,y,c,a=0,re=null,other=null)=>'<g class="chr" transform="translate('+x+' '+y+') rotate('+a+')"><path d="M-7 -19 L0 0 L-7 19 M7 -19 L0 0 L7 19" stroke="'+c+'" stroke-width="6" fill="none" stroke-linecap="round"/>'+(re&&other?'<path d="M'+(re==='down'?1:-1)+' '+(re==='down'?5:-5)+' L'+(re==='down'?7:-7)+' '+(re==='down'?18:-18)+'" stroke="'+other+'" stroke-width="6" fill="none" stroke-linecap="round"/>':'')+'<circle r="3.5" fill="#f4f7ff"/></g>';
const t=(x,y,v,z=11,c='#dce7ff')=>'<text x="'+x+'" y="'+y+'" fill="'+c+'" font-size="'+z+'" text-anchor="middle">'+v+'</text>';
const poles=(x1,y1,x2,y2)=>'<g fill="'+Y+'" stroke="#fff0bf" stroke-width="1.5"><circle cx="'+x1+'" cy="'+y1+'" r="5"/><circle cx="'+x2+'" cy="'+y2+'" r="5"/></g>';
const fibers=(segments)=>'<g stroke="'+H+'" stroke-width="1.3" opacity=".8" fill="none">'+segments.map(p=>'<path d="M'+p[0]+' '+p[1]+' L'+p[2]+' '+p[3]+'"/>').join('')+'</g>';
let s='<svg viewBox="0 0 340 290" role="img" aria-label="'+fases[n].nombre+'">';
if(n===0){
 s+=cell(170,130,105)+'<circle cx="170" cy="130" r="66" fill="#17274e" stroke="#a99aff" stroke-dasharray="4 4"/>'+chrom(135,105,A)+chrom(205,105,B)+chrom(135,160,G)+chrom(205,160,Y)+t(170,265,'Fase S previa · 2n = 4 cromosomas duplicados',10);
}
if(n===1){
 s+=cell(170,130,105)+'<circle cx="170" cy="130" r="67" fill="#17274e" stroke="#a99aff" stroke-dasharray="4 4"/>'+chrom(138,105,A)+chrom(202,105,B)+chrom(138,160,G)+chrom(202,160,Y)+t(170,43,'SINAPSIS · DOS BIVALENTES',11,G)+t(170,265,'2n = 4 · cuatro cromosomas, ocho cromátidas',9);
}
if(n===2){
 s+=cell(170,130,105)+'<circle cx="170" cy="130" r="67" fill="#17274e" stroke="#a99aff" stroke-dasharray="4 4"/>'+chrom(138,105,A,'down',B)+chrom(202,105,B,'up',A)+chrom(138,160,G)+chrom(202,160,Y)+'<path d="M138 105 Q170 91 202 105" stroke="#fff" stroke-width="1.8" stroke-dasharray="3 3" fill="none"/>'+t(170,39,'CROSSING-OVER',13,G)+t(170,58,'entre dos cromátidas no hermanas',10)+t(170,265,'Dos recombinantes · dos parentales',10);
}
if(n===3){
 // En meiosis I, las cromátidas hermanas de cada homólogo se coorientan al mismo polo.
 s+=cell(170,130,105)+poles(63,130,277,130)+fibers([[63,130,138,105],[277,130,202,105],[277,130,138,160],[63,130,202,160]])+'<path d="M58 130 H282" stroke="#8ba8e8" stroke-width="1" stroke-dasharray="3 5"/>'+chrom(138,105,A)+chrom(202,105,B)+chrom(202,160,G)+chrom(138,160,Y)+t(170,42,'PLACA ECUATORIAL',11,G)+t(170,265,'Cada bivalente se orienta independientemente',9);
}
if(n===4){
 s+=cell(170,130,105)+poles(65,130,275,130)+fibers([[65,130,112,100],[65,130,112,160],[275,130,228,100],[275,130,228,160]])+chrom(112,100,A)+chrom(112,160,Y)+chrom(228,100,B)+chrom(228,160,G)+t(170,42,'ANAFASE I',12,G)+t(170,265,'Se separan homólogos; hermanas siguen unidas',9);
}
if(n===5){
 s+=cell(170,130,105)+poles(72,130,268,130)+chrom(112,105,A)+chrom(112,160,Y)+chrom(228,105,B)+chrom(228,160,G)+t(170,42,'TELOFASE I',12,G)+t(170,265,'Una célula · dos juegos haploides en polos opuestos',9);
}
if(n===6){
 s+=cell(86,130,54,64)+cell(254,130,54,64)+chrom(76,110,A)+chrom(76,151,Y)+chrom(244,110,B)+chrom(244,151,G)+t(86,211,'n · duplicado',10,G)+t(254,211,'n · duplicado',10,G)+t(170,265,'Citocinesis I · dos células, dos cromosomas cada una',9);
}
if(n===7){
 s+=cell(86,130,54,64)+cell(254,130,54,64)+poles(51,130,121,130)+poles(219,130,289,130)+fibers([[51,130,76,110],[121,130,76,110],[51,130,76,151],[121,130,76,151],[219,130,244,110],[289,130,244,110],[219,130,244,151],[289,130,244,151]])+chrom(76,110,A)+chrom(76,151,Y)+chrom(244,110,B)+chrom(244,151,G)+t(86,211,'Metafase II',10,G)+t(254,211,'Metafase II',10,G)+t(170,265,'Dos cromosomas duplicados por célula',9);
}
if(n===8){
 s+=cell(86,130,54,64)+cell(254,130,54,64)+poles(51,130,121,130)+poles(219,130,289,130)+fibers([[51,130,63,109],[121,130,108,109],[51,130,63,151],[121,130,108,151],[219,130,231,109],[289,130,276,109],[219,130,231,151],[289,130,276,151]])+single(63,109,A,-15)+single(108,109,A,15,'down',B)+single(63,151,Y,-15)+single(108,151,Y,15)+single(231,109,B,-15,'up',A)+single(276,109,B,15)+single(231,151,G,-15)+single(276,151,G,15)+t(86,211,'Anafase II',10,G)+t(254,211,'Anafase II',10,G)+t(170,265,'Se separan las hermanas de ambos cromosomas',9);
}
if(n===9){
 const productos=[[A,Y,null,null],[A,Y,'down',B],[B,G,'up',A],[B,G,null,null]];
 const pos=[[82,70],[258,70],[82,180],[258,180]];
 productos.forEach((p,i)=>{const [x,y]=pos[i];s+=cell(x,y,34)+single(x-9,y,p[0],0,p[2],p[3])+single(x+9,y,p[1])+t(x,y+48,'n = 2',9,G)});
 s+=t(170,275,'4 productos haploides · dos cromosomas cada uno',9);
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
