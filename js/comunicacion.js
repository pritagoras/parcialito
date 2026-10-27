import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Comunicación celular y sinapsis';

const TIPOS = [
 {nombre:'Yuxtacrina',desc:'Requiere contacto estrecho entre células: por ejemplo, un ligando de membrana se une a un receptor de la célula vecina.',pista:'Contacto celular directo',ej:'Una célula presenta Notch y la vecina expresa el ligando Delta.'},
 {nombre:'Endocrina',desc:'Una célula endocrina libera una hormona a la circulación; la señal alcanza células diana distantes que expresan el receptor adecuado.',pista:'Hormona + sangre + distancia',ej:'La insulina viaja por la sangre hasta tejidos diana.'},
 {nombre:'Paracrina',desc:'El mensajero se libera al medio extracelular y actúa localmente sobre células cercanas.',pista:'Acción local',ej:'Factores de crecimiento que actúan sobre células vecinas.'},
 {nombre:'Autocrina',desc:'La célula libera una señal que se une a receptores de esa misma célula y modula su propia actividad.',pista:'La célula se señaliza a sí misma',ej:'Una célula inmunitaria libera una citocina que actúa sobre ella.'},
 {nombre:'Neuronal / sináptica',desc:'Una neurona conduce un potencial de acción y libera neurotransmisor en una sinapsis química; también existen sinapsis eléctricas.',pista:'Neurona + sinapsis',ej:'Una terminal neuronal libera acetilcolina sobre una célula muscular.'},
 {nombre:'Neuroendocrina',desc:'Una neurona neurosecretora libera un mensajero a la sangre para actuar sobre células distantes.',pista:'Neurona + circulación',ej:'Neuronas hipotalámicas liberan hormonas a la circulación portal.'},
 {nombre:'Yuxtacrina por unión comunicante',desc:'Las uniones gap forman canales entre células vecinas y permiten el paso directo de ciertos iones y moléculas pequeñas.',pista:'Canales entre citoplasmas',ej:'Células cardíacas coordinan su actividad eléctrica mediante uniones gap.'}
];

const CASOS = [
 {q:'Una hormona liberada por el páncreas viaja por la sangre y actúa sobre células del músculo esquelético.',c:1,e:'Es comunicación endocrina: el mensajero circula por la sangre y actúa a distancia.'},
 {q:'Una célula libera un factor de crecimiento que actúa sobre células próximas del mismo tejido.',c:2,e:'Es paracrina porque el mensajero actúa localmente sobre células cercanas.'},
 {q:'Una célula libera una citocina y esa misma célula expresa el receptor que la reconoce.',c:3,e:'Es autocrina: la célula responde a una señal que ella misma libera.'},
 {q:'Un ligando de membrana de una célula activa un receptor de membrana de una célula que la toca.',c:0,e:'Es señalización yuxtacrina por contacto ligando-receptor entre membranas.'},
 {q:'Un potencial de acción llega a una terminal neuronal; entra Ca²⁺ y se libera neurotransmisor en la hendidura.',c:4,e:'Es comunicación neuronal mediante una sinapsis química.'},
 {q:'Una neurona secretora libera una hormona a la sangre, que alcanza un órgano distante.',c:5,e:'Es neuroendocrina: la célula emisora es neuronal y la señal viaja por la circulación.'},
 {q:'Dos cardiomiocitos intercambian iones a través de canales que conectan sus citoplasmas.',c:6,e:'Son uniones comunicantes o gap junctions. Permiten acoplamiento directo; no son lo mismo que un ligando de membrana.'},
 {q:'Una neurona libera neurotransmisor que actúa sobre otra célula a través de una hendidura sináptica.',c:4,e:'Es señalización neuronal/sináptica. La distancia suele ser pequeña, pero la identidad del mecanismo es la sinapsis.'},
 {q:'Una hormona esteroidea es liberada a la circulación y actúa en células distantes.',c:1,e:'La clase química no determina por sí sola la modalidad: al viajar por la sangre a distancia, es endocrina.'},
 {q:'Una célula inmunitaria produce una señal que activa receptores en otras células cercanas.',c:2,e:'La acción local sobre células vecinas corresponde a señalización paracrina.'}
];

const MENSAJEROS = [
 {n:'Cortisol',f:'Esteroide derivado del colesterol',r:'Receptor intracelular glucocorticoide',m:'Puede atravesar la membrana y regular la expresión génica mediante un receptor intracelular.',g:0},
 {n:'Insulina',f:'Péptido / proteína',r:'Receptor de membrana con actividad tirosina-cinasa',m:'Activa vías de señalización intracelular; no atraviesa libremente la bicapa lipídica.',g:1},
 {n:'Adrenalina',f:'Derivado del aminoácido tirosina (catecolamina)',r:'Receptores adrenérgicos de membrana',m:'Actúa principalmente mediante receptores acoplados a proteína G y segundos mensajeros.',g:2},
 {n:'Hormona tiroidea T₃',f:'Derivado yodado de tirosina',r:'Receptor nuclear',m:'Aunque deriva de un aminoácido, es lipofílica y actúa principalmente mediante receptores nucleares.',g:2},
 {n:'Glucagón',f:'Péptido',r:'Receptor de membrana acoplado a proteína G',m:'Activa señalización intracelular, incluida la vía de AMPc en células diana.',g:1},
 {n:'Prostaglandina E₂',f:'Eicosanoide derivado del ácido araquidónico',r:'Receptores EP de membrana',m:'Lípido señalizador de acción generalmente local; sus receptores pueden activar distintas vías.',g:3},
 {n:'Acetilcolina',f:'Éster de colina y acetato; no es un aminoácido',r:'Receptores nicotínicos o muscarínicos',m:'Puede abrir canales iónicos mediante receptores nicotínicos o activar proteínas G mediante receptores muscarínicos.',g:6},
 {n:'Vasopresina (ADH)',f:'Péptido de nueve aminoácidos',r:'Receptores V₁/V₂ de membrana',m:'Actúa mediante receptores acoplados a proteína G; V₂ promueve la inserción de acuaporina-2 en células renales.',g:1},
 {n:'Óxido nítrico (NO)',f:'Gas señalizador sintetizado a partir de arginina',r:'Activa guanilato ciclasa soluble',m:'Difunde a través de membranas y aumenta GMPc; no usa un receptor clásico de superficie.',g:5},
 {n:'Dopamina',f:'Derivado del aminoácido tirosina (catecolamina)',r:'Receptores dopaminérgicos de membrana',m:'Modula vías intracelulares mediante receptores D₁-like y D₂-like.',g:2}
];

const FAMILIAS = ['Esteroide','Péptido / proteína','Derivado de aminoácido','Derivado lipídico','Neurotransmisor (categoría funcional)','Gas señalizador','Éster de colina y acetato'];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function tipoVisual(nombre,grande){
 const w=grande?300:150,h=grande?170:78,m=w/2,r=grande?25:13;
 let s='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Modelo animado de '+nombre+'"><defs><linearGradient id="ccA"><stop stop-color="#287e78"/><stop offset="1" stop-color="#24547b"/></linearGradient><linearGradient id="ccB"><stop stop-color="#4d3c83"/><stop offset="1" stop-color="#7960b6"/></linearGradient></defs>';
 const cell=(x,y,rad,g)=>'<circle cx="'+x+'" cy="'+y+'" r="'+rad+'" fill="url(#'+g+')" stroke="'+(g==='ccA'?'#4FE0A0':'#B9A1FF')+'" stroke-width="2"/><circle cx="'+x+'" cy="'+y+'" r="'+(rad*.3)+'" fill="#fff" opacity=".35"/>';
 const dot=(x,y,i)=>'<circle class="cc-pulse" style="animation-delay:'+(i*.13)+'s" cx="'+x+'" cy="'+y+'" r="'+(grande?4:2.5)+'" fill="#FFB938"/>';
 if(nombre==='Yuxtacrina'){
 s+='<rect x="'+(w*.05)+'" y="12" width="'+(w*.4)+'" height="'+(h-24)+'" rx="12" fill="#173c4a" stroke="#4FE0A0"/><rect x="'+(w*.55)+'" y="12" width="'+(w*.4)+'" height="'+(h-24)+'" rx="12" fill="#30264f" stroke="#B9A1FF"/><path d="M'+(w*.45)+' '+(h*.43)+' H'+(w*.55)+' M'+(w*.45)+' '+(h*.58)+' H'+(w*.55)+'" stroke="#FFB938" stroke-width="'+(grande?5:3)+'"/>'+dot(m,h*.43,0)+'<text x="'+(w*.25)+'" y="'+(h*.35)+'" fill="#fff3dc" text-anchor="middle" font-size="'+(grande?12:7)+'">Ligando</text><text x="'+(w*.75)+'" y="'+(h*.35)+'" fill="#fff3dc" text-anchor="middle" font-size="'+(grande?12:7)+'">Receptor</text>';
 }else if(nombre==='Paracrina'){
 s+=cell(w*.15,h*.5,r,'ccA')+cell(w*.85,h*.5,r,'ccB')+'<path class="cc-flow" d="M'+(w*.25)+' '+(h*.5)+' Q'+m+' '+(h*.1)+' '+(w*.75)+' '+(h*.5)+'" stroke="#FFB938" stroke-width="2" fill="none"/>';
 for(let i=0;i<6;i++)s+=dot(w*(.3+i*.08),h*(i%2?.4:.62),i);
 }else if(nombre==='Autocrina'){
 s+=cell(m,h*.5,grande?42:21,'ccA')+'<path class="cc-flow" d="M'+(w*.28)+' '+(h*.4)+' Q'+m+' 4 '+(w*.72)+' '+(h*.4)+'" stroke="#FFB938" stroke-width="2" fill="none"/>';
 for(let i=0;i<7;i++){const a=i*6.283/7;s+=dot(m+Math.cos(a)*(grande?52:26),h*.5+Math.sin(a)*(grande?43:21),i);}
 }else if(nombre==='Endocrina'){
 s+='<path d="M5 '+(h*.5)+' H'+(w-5)+'" stroke="#FF7AA8" stroke-width="'+(grande?18:9)+'" opacity=".18"/><path class="cc-flow" d="M5 '+(h*.5)+' H'+(w-5)+'" stroke="#FF7AA8" stroke-width="2" fill="none"/>'+cell(w*.1,h*.5,grande?18:9,'ccA')+cell(w*.9,h*.5,grande?21:10,'ccB');
 for(let i=0;i<6;i++)s+=dot(w*(.25+i*.09),h*(i%2?.4:.6),i);
 s+='<text x="'+m+'" y="'+(h*.88)+'" text-anchor="middle" fill="#ffb8d0" font-size="'+(grande?11:6)+'">sangre</text>';
 }else if(nombre==='Neuronal / sináptica'){
 s+='<path d="M8 12 Q'+(w*.22)+' 2 '+(w*.33)+' 14 L'+(w*.36)+' '+(h*.48)+' H8Z" fill="#315d81" stroke="#4FE0A0" stroke-width="2"/><path d="M8 '+(h*.69)+' H'+(w-8)+'" stroke="#B9A1FF" stroke-width="'+(grande?14:7)+'" stroke-linecap="round"/>';
 for(let i=0;i<7;i++)s+=dot(w*(.15+i*.1),h*(.4+(i%2)*.1),i);
 s+='<text x="'+m+'" y="'+(h*.92)+'" text-anchor="middle" fill="#d8cfff" font-size="'+(grande?11:6)+'">hendidura sináptica</text>';
 }else if(nombre==='Neuroendocrina'){
 s+='<path d="M'+(w*.12)+' '+(h*.8)+' Q'+(w*.28)+' '+(h*.6)+' '+(w*.38)+' '+(h*.36)+' T'+(w*.55)+' '+(h*.35)+'" fill="none" stroke="#4FE0A0" stroke-width="'+(grande?13:6)+'" stroke-linecap="round"/><path class="cc-flow" d="M'+(w*.73)+' 8 V'+(h-8)+'" stroke="#FF7AA8" stroke-width="'+(grande?18:9)+'" opacity=".65"/>';
 for(let i=0;i<5;i++)s+=dot(w*(.42+i*.06),h*(.38+i*.1),i);
 s+='<text x="'+(w*.73)+'" y="'+(h*.9)+'" text-anchor="middle" fill="#ffb8d0" font-size="'+(grande?11:6)+'">sangre</text>';
 }else{
 s+=cell(w*.15,h*.5,r,'ccA')+cell(w*.85,h*.5,r,'ccB');
 for(let i=0;i<3;i++)s+='<path d="M'+(w*.29)+' '+(h*(.39+i*.12))+' H'+(w*.71)+'" stroke="#FFB938" stroke-width="'+(grande?5:2.5)+'" stroke-linecap="round"/>';
 for(let i=0;i<4;i++)s+=dot(w*(.35+i*.1),h*(i%2?.42:.6),i);
 s+='<text x="'+m+'" y="'+(h*.88)+'" text-anchor="middle" fill="#ffdfa0" font-size="'+(grande?11:6)+'">canales gap</text>';
 }
 return s+'</svg>';
}

export function abrirComunicacion({app, volver}) {
 let vista='tipos', indiceCaso=0, aciertos=0, contestada=false, elegida=-1, ronda=[], mIndex=0, mRespuesta=-1, mRevelado=false, paso=0, potencial='reposo', bloqueador='ninguno';
 const estilos = `
 <style>
 .cc-wrap{max-width:850px;margin:auto;padding:1rem 1rem calc(2rem + env(safe-area-inset-bottom));color:var(--crema,#FFF3DC)}
 .cc-back{border:0;background:transparent;color:var(--tenue,#B8ABDB);padding:.5rem 0;font-weight:800}
 .cc-head,.cc-card{border:1px solid var(--linea,#43347A);border-radius:17px;background:var(--panel,#231845);padding:1rem;margin:.75rem 0}
 .cc-head{background:linear-gradient(135deg,rgba(155,123,255,.22),var(--panel,#231845))}
 .cc-kicker{color:var(--violeta,#9B7BFF);font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
 .cc-head h1{font-size:clamp(1.45rem,5vw,2rem);line-height:1.15;margin:.35rem 0}
 .cc-muted{color:var(--tenue,#B8ABDB);font-size:.88rem;line-height:1.5}
 .cc-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;margin:1rem 0}
 .cc-tab,.cc-choice{border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);color:var(--crema,#FFF3DC);border-radius:11px;padding:.75rem .45rem;font-weight:800;font-size:.82rem}
 .cc-tab[aria-pressed=true]{background:var(--violeta,#9B7BFF);color:#170F2E;border-color:var(--violeta,#9B7BFF)}
 .cc-card h2{font-size:1.12rem;margin:.1rem 0 .45rem}
 .cc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem}
 .cc-tile{border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);border-radius:13px;padding:.8rem;text-align:left;min-width:0}
 .cc-tile strong{display:block;color:var(--violeta,#9B7BFF);margin-bottom:.25rem}
 .cc-tile small{color:var(--tenue,#B8ABDB);line-height:1.45}
 .cc-pill{display:inline-block;border-radius:99px;padding:.2rem .5rem;background:rgba(155,123,255,.16);font-size:.72rem;font-weight:900;margin:.15rem}
 .cc-choice{display:block;width:100%;text-align:left;margin:.4rem 0;line-height:1.4}
 .cc-choice[aria-pressed=true]{border-color:var(--violeta,#9B7BFF);background:rgba(155,123,255,.18)}
 .cc-choice.good{border-color:#4FE0A0;background:rgba(79,224,160,.12)}
 .cc-choice.bad{border-color:#FF7AA8;background:rgba(255,122,168,.12)}
 .cc-primary{width:100%;border:0;border-radius:11px;padding:.85rem;margin-top:.55rem;background:var(--violeta,#9B7BFF);color:#170F2E;font-weight:900}
 .cc-secondary{width:100%;border:1px solid var(--linea,#43347A);border-radius:11px;padding:.75rem;margin-top:.5rem;background:transparent;color:var(--crema,#FFF3DC);font-weight:800}
 .cc-feedback{padding:.85rem;border:1px solid var(--linea,#43347A);border-radius:11px;margin:.7rem 0;background:rgba(155,123,255,.1);font-size:.9rem;line-height:1.5}
 .cc-feedback.good{border-color:rgba(79,224,160,.6);background:rgba(79,224,160,.08)}
 .cc-score{display:flex;gap:.5rem}.cc-score div{flex:1;text-align:center;border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);border-radius:10px;padding:.6rem .2rem}.cc-score b{display:block;color:var(--ambar,#FFB938);font-size:1.1rem}.cc-score small{color:var(--tenue,#B8ABDB);font-size:.7rem}
 .cc-syn svg{width:100%;height:auto;display:block;background:var(--noche,#170F2E);border:1px solid var(--linea,#43347A);border-radius:13px}
.cc-syn svg .cc-pulse{animation:ccPulse 1.4s ease-in-out infinite}.cc-syn svg .cc-flow{stroke-dasharray:5 7;animation:ccFlow 1.1s linear infinite}@keyframes ccPulse{0%,100%{opacity:.3}50%{opacity:1;filter:drop-shadow(0 0 5px currentColor)}}@keyframes ccFlow{to{stroke-dashoffset:-24}}.cc-wrap .cc-type-art{display:block;width:100%;height:78px;margin-bottom:.5rem;border-radius:10px;background:radial-gradient(ellipse,#26304e,#170f2e)}.cc-wrap .cc-type-art svg{width:100%;height:100%;border:0;background:transparent}.cc-wrap .cc-type-detail-art{width:100%;max-height:220px;margin:.4rem 0}.cc-wrap .cc-type-detail-art svg{width:100%;height:auto;border:0;background:transparent}
 .cc-note{border-left:3px solid var(--ambar,#FFB938);padding:.65rem .8rem;background:rgba(255,185,56,.07);border-radius:0 10px 10px 0;font-size:.86rem;line-height:1.5}
 .cc-row{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap}.cc-row>*{flex:1}
 .cc-table{width:100%;border-collapse:collapse;font-size:.85rem}.cc-table th,.cc-table td{text-align:left;vertical-align:top;padding:.6rem .45rem;border-bottom:1px solid var(--linea,#43347A)}.cc-table th{color:var(--violeta,#9B7BFF)}
 .cc-ions{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem}.cc-ions div{padding:.65rem .3rem;text-align:center;border:1px solid var(--linea,#43347A);border-radius:10px;background:var(--noche,#170F2E)}.cc-ions b{display:block;font-size:1.05rem;color:var(--ambar,#FFB938)}.cc-ions small{color:var(--tenue,#B8ABDB);font-size:.72rem}
 @media(max-width:540px){.cc-wrap{padding-left:.75rem;padding-right:.75rem}.cc-grid{grid-template-columns:1fr}.cc-tabs{gap:.25rem}.cc-tab{font-size:.7rem;padding:.65rem .2rem}.cc-table{font-size:.77rem}.cc-table th,.cc-table td{padding:.45rem .25rem}}
 @media(prefers-reduced-motion:reduce){.cc-wrap *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
 </style>`;
 app.innerHTML=estilos+`<main class="cc-wrap"><button class="cc-back" id="cc-back">← Volver</button><header class="cc-head"><div class="cc-kicker">Biología celular y molecular · interactivo</div><h1>Comunicación celular</h1><p class="cc-muted">Clasificá señales, reconocé la química de los mensajeros y explorá una sinapsis paso a paso.</p></header><nav class="cc-tabs" aria-label="Secciones"><button class="cc-tab" data-view="tipos">🧩 Comunicación</button><button class="cc-tab" data-view="quimica">🧪 Mensajeros</button><button class="cc-tab" data-view="sinapsis">⚡ Sinapsis</button><button class="cc-tab" data-view="repaso">📚 Repaso</button></nav><section id="cc-content"></section></main>`;
 const $=s=>app.querySelector(s);
 $('#cc-back').onclick=()=>{Sonido.clic();volver();};
 app.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{Sonido.clic();vista=b.dataset.view;render();});
 function render(){
  app.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===vista)));
  if(vista==='tipos')tiposView();else if(vista==='quimica')quimicaView();else if(vista==='sinapsis')sinapsisView();else repasoView();
  window.scrollTo({top:0,behavior:'auto'});
 }
 function tiposView(){
  $('#cc-content').innerHTML=`<section class="cc-card"><h2>Mapa de mecanismos</h2><p class="cc-muted">Elegí una tarjeta para distinguir el criterio de clasificación. Los mecanismos pueden describirse desde más de un eje: distancia, contacto, célula emisora y vía de transporte.</p><div class="cc-grid">${TIPOS.map((t,i)=>`<button class="cc-tile" data-tipo="${i}"><span class="cc-type-art">${tipoVisual(t.nombre,false)}</span><strong>${esc(t.nombre)}</strong><small>${esc(t.pista)}<br>${esc(t.ej)}</small></button>`).join('')}</div><div id="cc-tipo-info"></div></section><section class="cc-card"><div class="cc-kicker">Desafío de clasificación</div><h2>¿Qué mecanismo describe el caso?</h2><div class="cc-score"><div><b>${aciertos}</b><small>Aciertos</small></div><div><b>${indiceCaso+1}/${CASOS.length}</b><small>Pregunta</small></div><div><b>${ronda.length||CASOS.length}</b><small>Casos</small></div></div><p class="cc-muted" style="margin-top:.8rem">${esc(CASOS[indiceCaso].q)}</p>${TIPOS.map((t,i)=>`<button class="cc-choice ${contestada&&elegida===i&&elegida!==CASOS[indiceCaso].c?'bad':''} ${contestada&&CASOS[indiceCaso].c===i?'good':''}" data-caso="${i}" aria-pressed="${elegida===i}">${esc(t.nombre)}</button>`).join('')}${contestada?`<div class="cc-feedback ${elegida===CASOS[indiceCaso].c?'good':''}"><b>${elegida===CASOS[indiceCaso].c?'✓ Correcto':'↻ Repasemos'}</b><p>${esc(CASOS[indiceCaso].e)}</p></div><button class="cc-primary" id="cc-next">${indiceCaso===CASOS.length-1?'Reiniciar ronda':'Siguiente caso →'}</button>`: `<button class="cc-primary" id="cc-check" disabled>Comprobar respuesta</button>`}</section>`;
  app.querySelectorAll('[data-tipo]').forEach(b=>b.onclick=()=>{Sonido.clic();const t=TIPOS[Number(b.dataset.tipo)];$('#cc-tipo-info').innerHTML=`<div class="cc-feedback"><div class="cc-type-detail-art">${tipoVisual(t.nombre,true)}</div><b>${esc(t.nombre)}</b><p>${esc(t.desc)}</p><p><b>Ejemplo:</b> ${esc(t.ej)}</p></div>`;});
  app.querySelectorAll('[data-caso]').forEach(b=>b.onclick=()=>{if(contestada)return;elegida=Number(b.dataset.caso);$('#cc-content').querySelectorAll('[data-caso]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#cc-check').disabled=false;Sonido.clic();});
  $('#cc-check')?.addEventListener('click',()=>{contestada=true;if(elegida===CASOS[indiceCaso].c)aciertos++;Sonido.clic();tiposView();});
  $('#cc-next')?.addEventListener('click',()=>{Sonido.clic();if(indiceCaso===CASOS.length-1){indiceCaso=0;aciertos=0;}else indiceCaso++;contestada=false;elegida=-1;tiposView();});
 }
 function quimicaView(){
  const m=MENSAJEROS[mIndex];
  $('#cc-content').innerHTML=`<section class="cc-card"><div class="cc-kicker">Familias químicas y receptores</div><h2>¿Qué clase de mensajero es?</h2><p class="cc-muted">No confundas la naturaleza química con la modalidad de comunicación: una hormona puede ser esteroidea o peptídica, y un neurotransmisor no necesariamente es un aminoácido.</p><div class="cc-score"><div><b>${mIndex+1}/${MENSAJEROS.length}</b><small>Mensajero</small></div><div><b>${m.n}</b><small>Molécula</small></div></div><h2 style="margin-top:1rem">${esc(m.n)}</h2><p class="cc-muted">Elegí la descripción química más precisa.</p>${FAMILIAS.map((f,i)=>`<button class="cc-choice" data-fam="${i}" aria-pressed="${mRespuesta===i}">${esc(f)}</button>`).join('')}${mRevelado?`<div class="cc-feedback ${mRespuesta===m.g?'good':''}"><b>${mRespuesta===m.g?'✓ Buena clasificación':'Respuesta y matiz'}</b><p><b>Familia:</b> ${esc(m.f)}</p><p><b>Receptor:</b> ${esc(m.r)}</p><p>${esc(m.m)}</p></div><button class="cc-primary" id="cc-next-m">${mIndex===MENSAJEROS.length-1?'Volver al primero':'Siguiente mensajero →'}</button>`: `<button class="cc-primary" id="cc-reveal" disabled>Comprobar y ver receptor</button>`}</section><section class="cc-card"><h2>Regla de oro</h2><p class="cc-muted">La solubilidad, la estructura y el receptor condicionan cómo se transmite la señal. Hay excepciones importantes: las hormonas tiroideas derivan de aminoácidos, pero actúan principalmente mediante receptores nucleares; el óxido nítrico es un gas y activa guanilato ciclasa soluble.</p></section>`;
  app.querySelectorAll('[data-fam]').forEach(b=>b.onclick=()=>{if(mRevelado)return;mRespuesta=Number(b.dataset.fam);app.querySelectorAll('[data-fam]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#cc-reveal').disabled=false;Sonido.clic();});
  $('#cc-reveal')?.addEventListener('click',()=>{mRevelado=true;quimicaView();});
  $('#cc-next-m')?.addEventListener('click',()=>{mIndex=(mIndex+1)%MENSAJEROS.length;mRespuesta=-1;mRevelado=false;quimicaView();Sonido.clic();});
 }
 function sinapsisView(){
  const etapas=[
   ['1. Potencial de acción','La despolarización llega a la terminal presináptica y cambia el potencial de membrana.'],
   ['2. Entrada de Ca²⁺','Se abren canales de Ca²⁺ dependientes de voltaje. El calcio entra y activa la maquinaria de liberación vesicular.'],
   ['3. Exocitosis','Las vesículas se fusionan con la membrana y liberan neurotransmisor a la hendidura sináptica.'],
   ['4. Receptores postsinápticos','El neurotransmisor se une a receptores. Los ionotrópicos son canales; los metabotrópicos activan cascadas intracelulares.'],
   ['5. Respuesta','Según el receptor y los gradientes iónicos, la membrana puede despolarizarse o hiperpolarizarse. No toda sinapsis es excitadora.'],
   ['6. Terminación','El mensajero se elimina por recaptación, degradación enzimática o difusión. Las bombas y transportadores restauran gradientes a distintas escalas temporales.']
  ];
  const [etapa,titulo]=[paso,etapas[paso]];
  const ca=paso>=1, ves=paso>=2, nt=paso>=3, rec=paso>=3;
  const bloqueo=bloqueador==='calcio'&&paso>=1;
  const bloqueaRec=bloqueador==='receptor'&&paso>=3;
  const carga=potencial==='reposo'?'−70 mV aprox.':potencial==='despolarizacion'?'+30 mV aprox.':'−80 mV aprox.';
  $('#cc-content').innerHTML=`<section class="cc-card cc-syn"><div class="cc-kicker">Vista anatómica + detalle molecular</div><h2>Una sinapsis, dos neuronas</h2><p class="cc-muted">Esquema conceptual, no a escala. Avanzá para observar qué estructura interviene en cada etapa.</p><svg viewBox="0 0 360 365" role="img" aria-label="Neurona presináptica, hendidura sináptica y neurona postsináptica"><defs><linearGradient id="ccN" x1="0" x2="1"><stop offset="0" stop-color="#5E3B9C"/><stop offset="1" stop-color="#9B7BFF"/></linearGradient></defs><path d="M20 28 Q58 10 95 28 L95 50 Q135 43 155 65 L155 112 Q153 128 139 135 L70 135 Q43 132 30 113 L20 92Z" fill="url(#ccN)" stroke="#B9A1FF" stroke-width="2"/><text x="87" y="24" fill="#FFF3DC" font-size="10" text-anchor="middle">Terminal presináptica</text><path d="M28 57 Q65 37 105 58" stroke="#D9CAFF" stroke-width="3" fill="none"/><g fill="#FFB938" stroke="#FFF3DC" stroke-width="1">${[0,1,2,3,4,5].map((n)=>`<circle cx="${48+(n%3)*27}" cy="${70+Math.floor(n/3)*26}" r="9" opacity="${ves&&!bloqueo?'.95':'.45'}"/>`).join('')}</g><g fill="#5CC8FF">${[0,1,2,3,4,5,6,7,8,9].map(n=>`<circle cx="${35+(n%5)*23}" cy="${150+Math.floor(n/5)*14}" r="3.5" opacity="${nt&&!bloqueo?'.95':'.12'}"/>`).join('')}</g><rect x="12" y="145" width="336" height="54" rx="8" fill="#24183D" stroke="#9B7BFF" stroke-dasharray="4 4"/><text x="180" y="160" fill="#D9CAFF" font-size="10" text-anchor="middle">Hendidura sináptica</text><text x="180" y="187" fill="#B8ABDB" font-size="9" text-anchor="middle">Neurotransmisor difunde entre membranas</text><path d="M15 232 Q52 210 95 225 L135 214 Q164 220 169 244 L169 287 Q130 304 92 289 L45 300 Q20 292 15 270Z" fill="#5B3D88" stroke="#B9A1FF" stroke-width="2"/><text x="88" y="322" fill="#FFF3DC" font-size="10" text-anchor="middle">Neurona postsináptica</text><path d="M22 227 L22 209 M46 220 L46 202 M70 217 L70 199 M94 220 L94 202 M118 219 L118 201 M142 225 L142 207" stroke="#4FE0A0" stroke-width="4" stroke-linecap="round" opacity="${rec&&!bloqueaRec?1:.25}"/><text x="180" y="345" fill="#B8ABDB" font-size="9" text-anchor="middle">Receptores y canales iónicos</text><g fill="#5CC8FF" opacity="${ca&&!bloqueo?1:.15}"><circle cx="147" cy="87" r="4"/><circle cx="156" cy="95" r="4"/><circle cx="144" cy="104" r="4"/></g><text x="236" y="78" fill="#FFF3DC" font-size="10">Ca²⁺ ${bloqueo?'✕ bloqueado':ca?'entra':'canal cerrado'}</text><text x="235" y="92" fill="#B8ABDB" font-size="9">Vesículas: ${ves?'fusión':'en reserva'}</text><text x="235" y="106" fill="#B8ABDB" font-size="9">NT: ${nt&&!bloqueo?'liberado':'no liberado'}</text></svg><div class="cc-feedback"><b>${titulo[0]}</b><p>${titulo[1]}</p></div><div class="cc-row"><button class="cc-secondary" id="cc-prev" ${paso===0?'disabled':''}>← Anterior</button><button class="cc-primary" id="cc-next-s">${paso===5?'Reiniciar':'Siguiente etapa →'}</button></div></section><section class="cc-card"><h2>Condiciones del experimento</h2><p class="cc-muted">Cambiá una condición y observá la predicción de la simulación.</p><div class="cc-row"><button class="cc-choice" data-pot="reposo" aria-pressed="${potencial==='reposo'}">Reposo</button><button class="cc-choice" data-pot="despolarizacion" aria-pressed="${potencial==='despolarizacion'}">Despolarización</button><button class="cc-choice" data-pot="hiperpolarizacion" aria-pressed="${potencial==='hiperpolarizacion'}">Hiperpolarización</button></div><div class="cc-ions" style="margin-top:.7rem"><div><b>Na⁺</b><small>Más concentrado afuera</small></div><div><b>K⁺</b><small>Más concentrado adentro</small></div><div><b>Ca²⁺</b><small>Mucho más afuera que en el citosol</small></div></div><p class="cc-muted">Potencial de referencia: ${carga}. Los valores varían entre tipos celulares y condiciones.</p><div class="cc-row"><button class="cc-choice" data-block="ninguno" aria-pressed="${bloqueador==='ninguno'}">Sin bloqueo</button><button class="cc-choice" data-block="calcio" aria-pressed="${bloqueador==='calcio'}">Bloquear Ca²⁺</button><button class="cc-choice" data-block="receptor" aria-pressed="${bloqueador==='receptor'}">Bloquear receptor</button></div><div class="cc-note" style="margin-top:.7rem">${bloqueador==='calcio'?'Sin entrada de Ca²⁺ presináptico, la liberación vesicular desencadenada por el potencial de acción queda muy reducida o impedida.':bloqueador==='receptor'?'El neurotransmisor puede liberarse, pero el receptor postsináptico bloqueado no transmite la señal por esa vía.':'La Na⁺/K⁺-ATPasa mantiene gradientes: expulsa 3 Na⁺ e introduce 2 K⁺ por ATP. Los canales de voltaje producen las fases rápidas del potencial de acción; la bomba no las genera directamente.'}</div></section>`;
  $('#cc-prev').onclick=()=>{paso=Math.max(0,paso-1);Sonido.clic();sinapsisView();};
  $('#cc-next-s').onclick=()=>{paso=paso===5?0:paso+1;Sonido.clic();sinapsisView();};
  app.querySelectorAll('[data-pot]').forEach(b=>b.onclick=()=>{potencial=b.dataset.pot;Sonido.clic();sinapsisView();});
  app.querySelectorAll('[data-block]').forEach(b=>b.onclick=()=>{bloqueador=b.dataset.block;Sonido.clic();sinapsisView();});
 }
 function repasoView(){
  $('#cc-content').innerHTML=`<section class="cc-card"><div class="cc-kicker">Ficha integradora</div><h2>Cómo resolver una pregunta de examen</h2><ol><li>Identificá quién libera la señal: célula endocrina, neurona u otra célula.</li><li>Observá la ruta: sangre, medio extracelular local, contacto directo o hendidura sináptica.</li><li>Separá mecanismo de comunicación y naturaleza química del mensajero.</li><li>Identificá el receptor y si es de membrana, intracelular o una enzima activada por un gas.</li><li>En sinapsis, distinguí canales iónicos, transportadores, bomba Na⁺/K⁺ y canales de Ca²⁺.</li></ol></section><section class="cc-card"><h2>Datos que conviene dominar</h2><table class="cc-table"><thead><tr><th>Estructura</th><th>Función</th></tr></thead><tbody><tr><td>Canales de Na⁺ dependientes de voltaje</td><td>Contribuyen a la fase ascendente del potencial de acción.</td></tr><tr><td>Canales de K⁺ dependientes de voltaje</td><td>Contribuyen a la repolarización y, según el tipo celular, a la poshiperpolarización.</td></tr><tr><td>Canales de Ca²⁺ presinápticos</td><td>La entrada de Ca²⁺ desencadena la fusión de vesículas sinápticas.</td></tr><tr><td>Na⁺/K⁺-ATPasa</td><td>Por ATP: 3 Na⁺ salen y 2 K⁺ entran; mantiene gradientes iónicos.</td></tr><tr><td>Receptor postsináptico ionotrópico</td><td>Canal regulado por ligando; respuesta rápida según iones y potencial de reversión.</td></tr><tr><td>Receptor metabotrópico</td><td>Activa proteínas G o cascadas; respuesta indirecta y moduladora.</td></tr></tbody></table><div class="cc-note">−70 mV es una referencia frecuente para el potencial de reposo neuronal, no una constante universal. El signo y magnitud de la respuesta sináptica dependen del tipo de receptor y de los gradientes electroquímicos.</div></section>`;
 }
 render();
}
