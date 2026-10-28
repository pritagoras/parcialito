const CSS = `
.dv{max-width:1120px;margin:auto;padding:clamp(12px,3vw,28px);color:#edf3ff;font:15px/1.55 system-ui,sans-serif}.dv *{box-sizing:border-box}.dv button{font:inherit;cursor:pointer;color:#eaf1ff;background:#102342;border:1px solid #304c7d;border-radius:11px;padding:10px 13px}.dv button:focus-visible{outline:3px solid #63e8c3;outline-offset:2px}.dv .back{margin-bottom:14px}.dv .hero,.dv .panel{border:1px solid #2a416c;background:linear-gradient(145deg,#122342,#0b1730);border-radius:18px;padding:clamp(13px,2.4vw,22px);margin:12px 0}.dv h1{font-size:clamp(25px,4vw,37px);line-height:1.15;margin:6px 0}.dv h2{font-size:clamp(19px,3vw,25px);margin:7px 0}.dv p{color:#b9c9e8}.dv .kicker{font-size:11px;letter-spacing:.12em;font-weight:800;color:#63e8c3}.dv .tabs,.dv .subtabs{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0}.dv button.active{border-color:#63e8c3;background:#1c3d52;box-shadow:inset 0 0 0 1px #63e8c333}.dv .art{border:1px solid #29436e;border-radius:15px;background:radial-gradient(ellipse at center,#1a3154,#081326 78%);padding:8px}.dv svg{display:block;width:100%;height:auto;max-height:460px}.dv .legend{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#b9c9e8}.dv .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px}.dv .note{border-left:3px solid #63e8c3;background:#132a45;padding:11px 13px;border-radius:8px;margin-top:12px}.dv .controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:12px}.dv .primary{background:#1d4c45;border-color:#3b8d7c}.dv .compare{display:grid;grid-template-columns:1fr 1fr;gap:12px}.dv .compare>article{border:1px solid #2c4777;border-radius:14px;padding:13px;background:#0b1931;min-width:0}.dv .compare h3{margin:0 0 7px;font-size:16px}.dv .compare p{font-size:13px;margin:5px 0}.dv .phasegrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.dv .phase-progress{height:5px;background:#253757;border-radius:8px;overflow:hidden;margin-top:16px}.dv .phase-progress span{display:block;height:100%;background:#63e8c3}.dv button:disabled{opacity:.35;cursor:default}.dv .phase-compact .compare{margin-top:12px}.dv .phase-compact .compare>article{padding:12px}.dv .phase-compact .note{margin-top:8px}.dv .phase-compact .controls{margin-top:14px}.dv .phasegrid button{text-align:left;line-height:1.35}.dv .phasegrid small{display:block;color:#9db5dd;margin-top:4px}.dv .split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.dv .mini{font-size:12px;color:#9eb4d9}.dv .bar{height:5px;background:#253757;border-radius:8px;overflow:hidden;margin-top:12px}.dv .bar span{display:block;height:100%;background:#63e8c3}.dv .highlight{color:#63e8c3;font-weight:800}@media(max-width:620px){.dv .compare,.dv .split{grid-template-columns:1fr}.dv .phasegrid{grid-template-columns:1fr}.dv .controls button{flex:1}}@media(prefers-reduced-motion:no-preference){.dv .moving{animation:dv-in .65s ease-out both}@keyframes dv-in{from{opacity:.2;translate:0 8px}to{opacity:1;translate:0 0}}}
`;
const mitosis = [
['Interfase previa','Se duplica el ADN; cada cromosoma queda con dos cromátidas hermanas.','2n · ADN duplicado','La replicación ocurre antes de la división.'],
['Profase','Los cromosomas se condensan; se organiza el huso y la envoltura nuclear se desorganiza.','Cromosomas duplicados','No hay sinapsis de homólogos ni crossing-over como evento propio de la mitosis.'],
['Metafase','Los cromosomas se alinean individualmente en el plano ecuatorial.','Cromosomas individuales','Cada cromátida hermana se orienta hacia un polo opuesto.'],
['Anafase','Se separan las cromátidas hermanas y migran a polos opuestos.','Separación de hermanas','Cada cromátida separada pasa a ser un cromosoma independiente.'],
['Telofase','Se forman nuevas envolturas nucleares y los cromosomas se descondensan.','Dos núcleos','Los dos núcleos conservan la dotación cromosómica de la célula madre.'],
['Citocinesis','Se divide el citoplasma y se forman dos células hijas.','2 células hijas','Habitualmente conservan la misma ploidía que la célula de origen.']
];
const meiosis = [
['Interfase previa','Se duplica el ADN una sola vez antes de comenzar la meiosis I.','2n · ADN duplicado','No vuelve a duplicarse entre meiosis I y meiosis II.'],
['Profase I','Los homólogos se aparean; puede ocurrir crossing-over entre cromátidas no hermanas.','Bivalentes / tétradas','La recombinación genética contribuye a la variabilidad.'],
['Metafase I','Los pares de homólogos se ubican en el plano ecuatorial.','Pares de homólogos','La orientación de cada par es independiente y al azar.'],
['Anafase I','Los cromosomas homólogos se separan; las cromátidas hermanas permanecen unidas.','Separación de homólogos','División reduccional: se reduce el número de juegos cromosómicos.'],
['Telofase I y citocinesis','Los cromosomas llegan a los polos y se forman dos células haploides.','2 células haploides','Cada cromosoma sigue duplicado. Puede existir intercinesis.'],
['Profase II','Se organiza un nuevo huso en cada célula haploide.','Sin nueva fase S','No hay duplicación de ADN entre las divisiones.'],
['Metafase II','Los cromosomas se alinean individualmente en el ecuador de cada célula.','Cromosomas individuales','Cada uno conserva dos cromátidas hermanas.'],
['Anafase II','Las cromátidas hermanas se separan hacia polos opuestos.','Separación de hermanas','División ecuacional, semejante a la mitosis en este aspecto.'],
['Telofase II y citocinesis','Se forman los núcleos y se completa la separación de los productos celulares.','4 productos haploides','Cada producto tiene la mitad del número de cromosomas de la célula original.']
];
export function abrirComparadorDivision({app,volver,initialMode='visual'}){
 let modo=initialMode,fase=0,varModo='cross',paso=0,auto=null;
 const stop=()=>{if(auto)clearInterval(auto);auto=null;};
 const C=['#a99aff','#ff9f78','#63e8c3','#f3ce67'];
 const chrom=(x,y,c,dup=true,swap=null)=>dup?'<g transform="translate('+x+' '+y+')"><path d="M-7 -19L7 19M7 -19L-7 19" stroke="'+c+'" stroke-width="5" stroke-linecap="round"/>'+(swap?'<path d="M1 4L7 19" stroke="'+swap+'" stroke-width="5" stroke-linecap="round"/>':'')+'<circle r="3" fill="#fff0b5"/></g>':'<g transform="translate('+x+' '+y+')"><path d="M-5 -17L0 0L-5 17M5 -17L0 0L5 17" stroke="'+c+'" stroke-width="5" stroke-linecap="round"/>'+(swap?'<path d="M1 4L5 16" stroke="'+swap+'" stroke-width="5"/>':'')+'<circle r="2.5" fill="#fff0b5"/></g>';
 const cell=(x,y,rx=50,ry=60)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#10234a" stroke="#6e8bd0" stroke-width="2"/>';
 const label=(x,y,s)=>'<text x="'+x+'" y="'+y+'" fill="#eaf1ff" font-size="10" text-anchor="middle">'+s+'</text>';
 function variabilitySVG(){
  let s='<svg class="moving" viewBox="0 0 360 260" role="img" aria-label="'+(varModo==='cross'?'Crossing-over entre cromátidas no hermanas':'Segregación independiente de homólogos, paso '+(paso+1))+'">';
  if(varModo==='cross'){
   if(paso===0){s+=cell(180,112,70,75)+chrom(163,105,C[0])+chrom(196,105,C[1])+label(180,205,'1. Los homólogos se aparean')+label(180,225,'y forman un bivalente');}
   else if(paso===1){s+=cell(180,112,70,75)+'<path d="M158 82L195 143M195 82L158 143" stroke="'+C[0]+'" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M195 82L158 143M158 82L195 143" stroke="'+C[1]+'" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="177" cy="112" r="7" fill="#fff0b5" stroke="#081326" stroke-width="2"/>'+label(180,205,'2. Cromátidas no hermanas')+label(180,225,'intercambian segmentos');}
   else{s+=cell(100,105,48,59)+cell(260,105,48,59)+chrom(89,99,C[0],true,C[1])+chrom(111,99,C[1],true,C[0])+chrom(249,99,C[1],true,C[0])+chrom(271,99,C[0],true,C[1])+label(100,181,'Recombinante 1')+label(260,181,'Recombinante 2')+label(180,220,'3. Quedan nuevas combinaciones');}
  }else{
   if(paso===0){s+=cell(180,105,72,68)+chrom(163,90,C[0])+chrom(196,90,C[1])+chrom(163,124,C[2])+chrom(196,124,C[3])+label(180,190,'1. Cada par de homólogos')+label(180,209,'se orienta independientemente');}
   else if(paso===1){s+=cell(180,105,72,68)+'<path d="M180 48V162" stroke="#8eb3f6" stroke-width="2" stroke-dasharray="4 4"/>'+chrom(151,82,C[0])+chrom(209,82,C[2])+chrom(151,128,C[1])+chrom(209,128,C[3])+label(180,190,'2. La orientación puede cambiar')+label(180,209,'de un par a otro');}
   else{s+=cell(88,72,42,45)+cell(88,164,42,45)+cell(272,72,42,45)+cell(272,164,42,45)+chrom(79,68,C[0])+chrom(97,160,C[1])+chrom(263,68,C[2])+chrom(281,160,C[3])+label(88,127,'Polo A')+label(272,127,'Polo B')+label(180,224,'3. Los homólogos se separan')+label(180,242,'y generan combinaciones distintas');}
  }
  return s+'</svg>';
 }
 function render(){
  stop();
  const head='<main class="dv"><button class="back" id="dv-back">← Volver a Mitosis y meiosis</button><header class="hero"><div class="kicker">PARCIALITO LAB · DIVISIÓN CELULAR</div><h1>Comparación y variabilidad genética</h1><p>Dos mecanismos contribuyen a la variabilidad meiótica; además, compará visualmente la mitosis y la meiosis, fase por fase y en una guía escrita.</p><nav class="tabs"><button data-mode="visual" class="'+(modo==='visual'?'active':'')+'">Vista conjunta</button><button data-mode="fases" class="'+(modo==='fases'?'active':'')+'">Índice fase por fase</button><button data-mode="texto" class="'+(modo==='texto'?'active':'')+'">Qué ocurre en cada fase</button><button data-mode="var" class="'+(modo==='var'?'active':'')+'">Variabilidad genética</button></nav></header>';
  let body='';
  if(modo==='visual'){
   body='<section class="panel"><div class="kicker">DOS PROCESOS EN PARALELO</div><h2>De una célula inicial a las células hijas</h2><p>Esquema de conjunto: una división conserva la dotación cromosómica; la otra realiza dos divisiones consecutivas.</p><div class="compare"><article><h3 style="color:#63e8c3">🧫 MITOSIS</h3><div class="art"><svg viewBox="0 0 330 250" role="img" aria-label="Mitosis: una célula se divide y produce dos células hijas"><ellipse cx="62" cy="90" rx="38" ry="43" fill="#10234a" stroke="#6e8bd0" stroke-width="2"/>'+chrom(52,80,C[0])+chrom(72,102,C[1])+'<path d="M105 90H142M134 83L143 90L134 97" stroke="#8eb3f6" stroke-width="2" fill="none"/><ellipse cx="180" cy="90" rx="37" ry="43" fill="#10234a" stroke="#6e8bd0" stroke-width="2"/>'+chrom(170,80,C[0])+chrom(190,102,C[1])+'<path d="M220 90H242M234 83L243 90L234 97" stroke="#8eb3f6" stroke-width="2" fill="none"/><ellipse cx="275" cy="72" rx="27" ry="30" fill="#10234a" stroke="#63e8c3" stroke-width="2"/><ellipse cx="275" cy="125" rx="27" ry="30" fill="#10234a" stroke="#63e8c3" stroke-width="2"/>'+label(275,76,'2n')+label(275,129,'2n')+label(62,150,'Inicial')+label(180,150,'ADN duplicado')+label(165,194,'1 división')+label(165,214,'2 células hijas')+label(165,233,'misma ploidía habitual',9)+'</svg></div><p><b>Resultado:</b> dos células hijas, habitualmente con la misma dotación cromosómica que la célula inicial.</p></article><article><h3 style="color:#a99aff">🧬 MEIOSIS</h3><div class="art"><svg viewBox="0 0 330 250" role="img" aria-label="Meiosis: dos divisiones producen cuatro células haploides"><ellipse cx="45" cy="91" rx="32" ry="38" fill="#10234a" stroke="#6e8bd0" stroke-width="2"/>'+chrom(38,82,C[0])+chrom(54,103,C[1])+'<path d="M80 91H106M99 84L107 91L99 98" stroke="#8eb3f6" stroke-width="2" fill="none"/><ellipse cx="137" cy="65" rx="28" ry="32" fill="#10234a" stroke="#6e8bd0" stroke-width="2"/><ellipse cx="137" cy="123" rx="28" ry="32" fill="#10234a" stroke="#6e8bd0" stroke-width="2"/>'+chrom(131,60,C[0])+chrom(143,117,C[1])+'<path d="M167 65H190M183 58L191 65L183 72M167 123H190M183 116L191 123L183 130" stroke="#8eb3f6" stroke-width="2" fill="none"/>'+[[218,48],[277,48],[218,141],[277,141]].map(([x,y],i)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="23" ry="27" fill="#10234a" stroke="#63e8c3" stroke-width="2"/>'+chrom(x,y-2,C[i%4],false)).join('')+label(165,194,'2 divisiones')+label(165,214,'4 productos haploides')+label(165,233,'combinaciones variables',9)+'</svg></div><p><b>Resultado:</b> cuatro productos haploides; el reparto de homólogos y el crossing-over generan variabilidad.</p></article></div><div class="note">La figura es esquemática: los colores distinguen cromosomas de origen materno/paterno y los productos no están dibujados a escala.</div></section>';
  }else if(modo==='fases'){
   const pares=[
    {m:0,e:0,t:'Preparación: duplicación del ADN'},
    {m:1,e:1,t:'Profase: condensación vs apareamiento de homólogos'},
    {m:2,e:2,t:'Metafase: cromosomas individuales vs pares de homólogos'},
    {m:3,e:3,t:'Anafase: hermanas vs homólogos'},
    {m:4,e:4,t:'Telofase I: final de la primera división meiótica'},
    {m:null,e:5,t:'Meiosis II · Profase II'},
    {m:null,e:6,t:'Meiosis II · Metafase II'},
    {m:null,e:7,t:'Meiosis II · Anafase II'},
    {m:null,e:8,t:'Meiosis II · Telofase II y citocinesis'}
   ];
   fase=Math.max(0,Math.min(fase,pares.length-1));
   const p=pares[fase],m=p.m===null?null:mitosis[p.m],me=meiosis[p.e];
   body='<section class="panel phase-compact"><div class="kicker">COMPARACIÓN GUIADA · '+(fase+1)+' DE '+pares.length+'</div><h2>'+p.t+'</h2><div class="compare"><article><h3 style="color:#63e8c3">Mitosis'+(m?' · '+m[0]:'')+'</h3>'+(m?'<p>'+m[1]+'</p><p class="mini">'+m[2]+'</p><div class="note">'+m[3]+'</div>':'<p class="mini">No hay una fase equivalente: la mitosis termina tras una sola división.</p>')+'</article><article><h3 style="color:#c0b4ff">Meiosis · '+me[0]+'</h3><p>'+me[1]+'</p><p class="mini">'+me[2]+'</p><div class="note">'+me[3]+'</div></article></div><div class="phase-progress"><span style="width:'+((fase+1)/pares.length*100)+'%"></span></div><div class="controls"><button id="phase-prev" '+(fase===0?'disabled':'')+'>← Anterior</button><span class="mini">Comparación '+(fase+1)+' / '+pares.length+'</span><button id="phase-next" class="primary" '+(fase===pares.length-1?'disabled':'')+'>Siguiente fase →</button></div><p class="mini">Avanzá para comparar el siguiente momento de cada proceso. La meiosis tiene una segunda división que no existe en la mitosis.</p></section>';
  }else if(modo==='texto'){
   body='<section class="panel"><div class="kicker">GUÍA ESCRITA</div><h2>Qué ocurre en cada fase</h2><p>Repaso por proceso, con el evento principal y la clave para distinguirlo.</p><div class="compare"><article><h3 style="color:#63e8c3">Mitosis</h3>'+mitosis.map((x,i)=>'<div class="note"><b>'+(i+1)+'. '+x[0]+'</b><p>'+x[1]+'</p><p class="mini"><b>Clave:</b> '+x[3]+'</p></div>').join('')+'</article><article><h3 style="color:#c0b4ff">Meiosis</h3>'+meiosis.map((x,i)=>'<div class="note"><b>'+(i+1)+'. '+x[0]+'</b><p>'+x[1]+'</p><p class="mini"><b>Clave:</b> '+x[3]+'</p></div>').join('')+'</article></div></section>';
  }else{
   const vSteps=varModo==='cross'?[
    'En profase I, los cromosomas homólogos se aparean y sus cromátidas quedan próximas.',
    'Se produce un intercambio recíproco de segmentos entre cromátidas no hermanas.',
    'Tras el intercambio quedan cromátidas recombinantes, con nuevas combinaciones de alelos.'
   ]:[
    'Los pares de homólogos se disponen en el ecuador durante la metafase I.',
    'Cada par puede orientarse de una u otra manera, independientemente de los demás pares.',
    'En anafase I, los homólogos se separan hacia polos opuestos; el reparto combina cromosomas maternos y paternos.'
   ];
   const vtext=vSteps[paso];
   body='<section class="panel"><div class="kicker">CONSECUENCIAS GENÉTICAS DE LA MEIOSIS · PDF, PÁG. 15</div><h2>Dos fuentes de variabilidad genética</h2><div class="subtabs"><button data-var="cross" class="'+(varModo==='cross'?'active':'')+'">1 · Crossing-over</button><button data-var="seg" class="'+(varModo==='seg'?'active':'')+'">2 · Segregación al azar</button></div><div class="art">'+variabilitySVG()+'</div><p>'+vtext+'</p><div class="controls"><button id="vprev">← Paso anterior</button><span class="mini">Paso '+(paso+1)+' de 3 · esquema guiado</span><button class="primary" id="vnext">Siguiente →</button></div><div class="bar"><span style="width:'+((paso+1)/3*100)+'%"></span></div><div class="note"><b>Idea central:</b> la meiosis distribuye al azar genes maternos y paternos en las gametas. El crossing-over crea nuevas combinaciones dentro de cromátidas; la segregación independiente reparte combinaciones de cromosomas homólogos. Fallas de segregación pueden causar alteraciones cromosómicas.</div></section>';
  }
  app.innerHTML=head+body+'</main>';
  app.querySelector('#dv-back').onclick=()=>{stop();volver();};
  app.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{modo=b.dataset.mode;render();});
  app.querySelectorAll('[data-fase]').forEach(b=>b.onclick=()=>{fase=Number(b.dataset.fase);render();});
  app.querySelector('#phase-prev')?.addEventListener('click',()=>{fase=Math.max(0,fase-1);render();});
  app.querySelector('#phase-next')?.addEventListener('click',()=>{fase=Math.min(8,fase+1);render();});
  app.querySelectorAll('[data-var]').forEach(b=>b.onclick=()=>{varModo=b.dataset.var;paso=0;render();});
  app.querySelector('#vprev')?.addEventListener('click',()=>{paso=Math.max(0,paso-1);render();});
  app.querySelector('#vnext')?.addEventListener('click',()=>{paso=Math.min(2,paso+1);render();});
 }
 const old=document.getElementById('division-compare-css');if(old)old.remove();const st=document.createElement('style');st.id='division-compare-css';st.textContent=CSS;document.head.appendChild(st);render();
}
