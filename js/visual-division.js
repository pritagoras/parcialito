const css=`
.divvisual{max-width:1120px;margin:auto;padding:clamp(14px,3vw,30px);color:#edf3ff;font:15px/1.55 system-ui,sans-serif}
.divvisual *{box-sizing:border-box}.divvisual button{font:inherit;cursor:pointer;color:#edf3ff;background:#10234a;border:1px solid #34558e;border-radius:11px;padding:9px 13px}
.divvisual button:hover{border-color:#8caeff}.divvisual button:focus-visible{outline:2px solid #63e8c3;outline-offset:2px}
.divvisual .dv-back{background:transparent;border-radius:999px;margin-bottom:18px}
.divvisual .dv-kicker{font-size:10px;letter-spacing:.14em;font-weight:850;color:#7ee6cf}
.divvisual h1{font-size:clamp(26px,4vw,38px);line-height:1.12;letter-spacing:-.035em;margin:6px 0}
.divvisual .dv-muted{color:#aebfe0;max-width:78ch;margin:8px 0}
.divvisual .dv-card{border:1px solid #294578;border-radius:17px;background:linear-gradient(145deg,#102345,#09152b);padding:clamp(12px,2.5vw,22px);margin:14px 0}
.divvisual .dv-modes{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
.divvisual .dv-modes button.active,.divvisual .dv-phase.active{background:#234b82;border-color:#8baeff}
.divvisual .dv-stage{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.divvisual .dv-stage h2{font-size:21px;margin:0}.divvisual .dv-stage p{font-size:13px;color:#aebfe0;margin:3px 0}
.divvisual .dv-chip{border:1px solid #326b69;color:#8cebd3;background:#0c302f;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800}
.divvisual .dv-svg{width:100%;height:auto;display:block;max-height:380px;margin:8px auto}
.divvisual .dv-legend{display:flex;gap:14px;flex-wrap:wrap;color:#b9c9e8;font-size:12px;margin-top:6px}
.divvisual .dv-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px}
.divvisual .dv-nav{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px}
.divvisual .dv-count{font-size:12px;color:#aebfe0}
.divvisual .dv-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:15px}
.divvisual .dv-phase{text-align:left;font-size:11px;padding:9px;min-height:48px}
.divvisual .dv-note{font-size:13px;color:#c1d0ed;margin:12px 0 0}
.divvisual .dv-key{font-size:11px;color:#91a9d4;margin-top:10px}
@media(max-width:650px){.divvisual .dv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.divvisual .dv-svg{min-height:150px}}
`;
const A='#59c5ff',B='#f2b65d',C='#a78bfa',D='#64d7a1';
const phases={
 mitosis:[
 ['Interfase · G₁','Antes de duplicar el ADN','Hay cuatro cromosomas: dos pares de homólogos. Cada cromosoma tiene una cromátida.','g1'],
 ['Fase S','Duplicación del ADN','Cada cromosoma replica su ADN y queda formado por dos cromátidas hermanas.','replicated'],
 ['Profase','Condensación','Los cuatro cromosomas duplicados se condensan; la envoltura nuclear comienza a desorganizarse.','prophase'],
 ['Prometafase','Unión al huso','Los microtúbulos se unen a los cinetocoros de cada cromosoma.','prometa'],
 ['Metafase','Alineación individual','Los cuatro cromosomas duplicados se alinean individualmente en el ecuador.','meta'],
 ['Anafase','Separación de hermanas','Las cromátidas hermanas se separan; cada una pasa a ser un cromosoma independiente.','ana'],
 ['Telofase','Dos núcleos','En cada polo se reconstruye un núcleo con cuatro cromosomas de una cromátida.','telo'],
 ['Citocinesis','Dos células hijas','Se divide el citoplasma: quedan dos células diploides con 2n = 4.','end']
 ],
 meiosis:[
 ['Interfase · G₁','Antes de duplicar el ADN','Hay cuatro cromosomas: dos pares de homólogos. Cada cromosoma tiene una cromátida.','g1'],
 ['Fase S','Única duplicación del ADN','Cada cromosoma duplica su ADN. No hay otra fase S antes de meiosis II.','replicated'],
 ['Profase I · leptoteno','Condensación','Los cromosomas duplicados comienzan a condensarse.','prophase'],
 ['Profase I · cigoteno','Sinapsis','Los homólogos se reconocen y se aparean: se forman dos bivalentes.','synapsis'],
 ['Profase I · paquiteno','Crossing-over','Cromátidas no hermanas intercambian segmentos; se representa un intercambio en cada par.','cross'],
 ['Profase I · diploteno','Quiasmas','Los homólogos empiezan a separarse, pero permanecen unidos en los quiasmas.','chiasma'],
 ['Profase I · diacinesis','Preparación para metafase I','Los bivalentes alcanzan alta condensación y se organiza el huso.','synapsis'],
 ['Metafase I','Pares en el ecuador','Los dos pares de homólogos se alinean como bivalentes.','meta1'],
 ['Anafase I','Separación de homólogos','Se separan los homólogos; las cromátidas hermanas permanecen unidas.','ana1'],
 ['Telofase I y citocinesis','Dos células haploides','Cada célula recibe dos cromosomas duplicados: n = 2, cada uno con dos cromátidas.','telo1'],
 ['Intercinesis','Sin fase S','Entre meiosis I y II no se replica nuevamente el ADN.','telo1'],
 ['Profase II','Nuevo huso','En cada célula haploide se organiza un huso para la segunda división.','pro2'],
 ['Metafase II','Alineación individual','Los dos cromosomas duplicados se alinean individualmente en cada célula.','meta2'],
 ['Anafase II','Separación de hermanas','Las cromátidas hermanas se separan en cada una de las dos células.','ana2'],
 ['Telofase II','Cuatro núcleos','Se forman cuatro núcleos con dos cromosomas de una cromátida cada uno.','telo2'],
 ['Citocinesis II','Cuatro productos haploides','Quedan cuatro células haploides, cada una con n = 2.','end2']
 ]
};
function chromosome(x,y,color,replicated=false,rotation=0,accent=null){
 const stroke=color, width=5;
 if(!replicated)return '<g transform="translate('+x+' '+y+') rotate('+rotation+')"><path d="M0 -22 L0 22" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="round"/></g>';
 return '<g transform="translate('+x+' '+y+') rotate('+rotation+')" fill="none" stroke-linecap="round"><path d="M-10 -22 L10 22 M10 -22 L-10 22" stroke="'+stroke+'" stroke-width="'+width+'"/>'+(accent?'<path d="M-4 -10 L4 10" stroke="'+accent+'" stroke-width="5"/>':'')+'</g>';
}
function cell(cx,cy,rx,ry,content,opacity=1){
 return '<g opacity="'+opacity+'"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="#0b1b35" stroke="#7392c5" stroke-width="2.5"/>'+content+'</g>';
}
function diagram(kind){
 const A='#59c5ff',B='#f2b65d',C='#a78bfa',D='#64d7a1';
 const colors=[A,B,C,D], out=[];
 const rod=(x,y,i,rep=false,rot=0,accent=null)=>chromosome(x,y,colors[i],rep,rot,accent);
 const X=(x,y,i,rot=0,accent=null)=>chromosome(x,y,colors[i],true,rot,accent);
 if(kind==='g1'){
   out.push(cell(300,150,180,105,colors.map((c,i)=>rod(235+(i%2)*42,112+Math.floor(i/2)*75,i)).join('')));
 }else if(['replicated','prophase','prometa'].includes(kind)){
   out.push(cell(300,150,180,105,[X(235,112,0),X(277,112,1),X(235,187,2),X(277,187,3)].join('')));
 }else if(['synapsis','cross','chiasma'].includes(kind)){
   const accents=kind==='cross'||kind==='chiasma';
   out.push(cell(300,150,180,105,[X(248,115,0,0,accents?B:null),X(275,115,1,0,accents?A:null),X(248,185,2,0,accents?D:null),X(275,185,3,0,accents?C:null)].join('')));
   out.push('<path d="M248 83 Q261 68 275 83 M248 153 Q261 138 275 153" fill="none" stroke="#f5e7a4" stroke-width="2" stroke-dasharray="4 4"/>');
 }else if(kind==='meta'){
   out.push(cell(300,150,180,105,[X(300,95,0),X(300,132,1),X(300,169,2),X(300,206,3)].join('')));
   out.push('<path d="M300 55 V245" stroke="#f5d27b" stroke-width="2" stroke-dasharray="5 6"/>');
 }else if(kind==='meta2'){
   out.push(cell(195,150,105,80,[X(195,132,0),X(195,168,2)].join('')));
   out.push(cell(405,150,105,80,[X(405,132,1),X(405,168,3)].join('')));
   out.push('<path d="M195 82 V218 M405 82 V218" stroke="#f5d27b" stroke-width="2" stroke-dasharray="5 6"/>');
 }else if(kind==='meta1'){
   out.push(cell(300,150,180,105,[X(240,120,0),X(265,120,1),X(335,180,2),X(360,180,3)].join('')));
   out.push('<path d="M300 55 V245" stroke="#f5d27b" stroke-width="2" stroke-dasharray="5 6"/>');
 }else if(kind==='ana'){
   out.push(cell(300,150,180,105,[rod(180,115,0),rod(205,115,1),rod(230,115,2),rod(255,115,3),rod(345,185,0),rod(370,185,1),rod(395,185,2),rod(420,185,3)].join('')));
 }else if(kind==='ana1'){
   out.push(cell(300,150,180,105,[X(185,115,0),X(215,115,2),X(385,185,1),X(415,185,3)].join('')));
 }else if(kind==='telo'||kind==='end'){
   out.push(cell(195,150,105,80,[rod(170,140,0),rod(210,140,1),rod(170,175,2),rod(210,175,3)].join('')));
   out.push(cell(405,150,105,80,[rod(380,140,0),rod(420,140,1),rod(380,175,2),rod(420,175,3)].join('')));
 }else if(kind==='telo1'||kind==='pro2'){
   out.push(cell(195,150,105,80,[X(170,140,0),X(210,140,2)].join('')));
   out.push(cell(405,150,105,80,[X(380,140,1),X(420,140,3)].join('')));
 }else if(kind==='ana2'){
   out.push(cell(195,150,105,80,[rod(135,120,0),rod(160,120,1),rod(225,180,0),rod(250,180,1)].join('')));
   out.push(cell(405,150,105,80,[rod(345,120,2),rod(370,120,3),rod(435,180,2),rod(460,180,3)].join('')));
 }else if(kind==='telo2'||kind==='end2'){
   [[135,125],[265,125],[335,125],[465,125]].forEach((p,j)=>{
     const i=j<2?0:1, k=j<2?2:3;
     out.push(cell(p[0],p[1],58,48,[rod(p[0]-13,p[1],j<2?0:1),rod(p[0]+13,p[1],j<2?2:3)].join('')));
   });
 }
 const label=kind.startsWith('meta')?'PLACA ECUATORIAL':kind==='ana'||kind.startsWith('ana')?'SEPARACIÓN CROMOSÓMICA':kind==='synapsis'||kind==='cross'||kind==='chiasma'?'HOMOLOGÍA Y RECOMBINACIÓN':'CROMOSOMAS · 2n = 4';
 return '<svg class="dv-svg" viewBox="0 0 600 300" role="img" aria-label="'+label+'">'+out.join('')+'</svg>';
}
export function abrirVisualDivision({app,volver}={}){
 let mode='mitosis',index=0;
 function render(){
  const list=phases[mode];index=Math.max(0,Math.min(index,list.length-1));
  const p=list[index];
  app.innerHTML='<main class="divvisual"><button class="dv-back" id="dv-back">← Volver a Mitosis y meiosis</button><header><div class="dv-kicker">PARCIALITO LAB · SIMULACIÓN VISUAL</div><h1>Recorrido visual de la división celular</h1><p class="dv-muted">Modelo fijo de un organismo diploide 2n = 4: dos pares de cromosomas homólogos. Cambiá de fase para observar qué ocurre con los cromosomas, sin alterar la calculadora de cantidades.</p></header><div class="dv-modes"><button data-mode="mitosis" class="'+(mode==='mitosis'?'active':'')+'">🧫 Mitosis</button><button data-mode="meiosis" class="'+(mode==='meiosis'?'active':'')+'">🧬 Meiosis I y II</button></div><section class="dv-card"><div class="dv-stage"><div><h2>'+p[0]+'</h2><p>'+p[1]+'</p></div><span class="dv-chip">'+(mode==='mitosis'?'MITOSIS':'MEIOSIS')+' · 2n = 4</span></div>'+diagram(p[3])+'<div class="dv-legend"><span><i class="dv-dot" style="background:'+A+'"></i>Par homólogo 1 · materno</span><span><i class="dv-dot" style="background:'+B+'"></i>Par homólogo 1 · paterno</span><span><i class="dv-dot" style="background:'+C+'"></i>Par homólogo 2 · materno</span><span><i class="dv-dot" style="background:'+D+'"></i>Par homólogo 2 · paterno</span></div><p class="dv-note">'+p[2]+'</p><div class="dv-nav"><button id="dv-prev" '+(!index?'disabled':'')+'>← Anterior</button><span class="dv-count">Etapa '+(index+1)+' de '+list.length+'</span><button id="dv-next" '+(index===list.length-1?'disabled':'')+'>Siguiente →</button></div><div class="dv-grid">'+list.map((x,i)=>'<button class="dv-phase '+(i===index?'active':'')+'" data-phase="'+i+'">'+(i+1)+'. '+x[0]+'</button>').join('')+'</div></section><p class="dv-key">Esquema didáctico simplificado: los colores distinguen los cuatro cromosomas del juego diploide. El crossing-over se representa de manera ilustrativa, no a escala.</p></main>';
  app.querySelector('#dv-back').onclick=volver;
  app.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;index=0;render()});
  app.querySelector('#dv-prev').onclick=()=>{index=Math.max(0,index-1);render()};
  app.querySelector('#dv-next').onclick=()=>{index=Math.min(list.length-1,index+1);render()};
  app.querySelectorAll('[data-phase]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.phase);render()});
 }
 if(!document.getElementById('division-visual-css')){const s=document.createElement('style');s.id='division-visual-css';s.textContent=css;document.head.appendChild(s)}
 render();
}
