import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Laboratorio de operones: lac y trp';

const PREGUNTAS = [
 {q:'Hay lactosa y poca glucosa. ¿Qué ocurre con lac?',o:['LacI bloquea el operador','Expresión alta: LacI se inactiva y CAP-cAMP favorece la transcripción','Se activa TrpR','No puede transcribirse nunca'],c:1,e:'La alolactosa inactiva LacI y, con poca glucosa, aumenta cAMP: CAP-cAMP favorece la unión de la ARN polimerasa.'},
 {q:'Hay lactosa, pero también mucha glucosa. ¿Qué predicción es mejor?',o:['Expresión máxima','LacI permanece siempre unido','Expresión baja: hay inducción, pero poca activación por CAP-cAMP','El operón se vuelve represible'],c:2,e:'La lactosa libera el operador, pero la glucosa alta reduce cAMP y la activación por CAP. La expresión suele ser baja, no necesariamente nula.'},
 {q:'No hay lactosa. ¿Qué ocurre normalmente en lac?',o:['LacI se une al operador','CAP se une a la lactosa','Se expresan al máximo lacZYA','El triptófano actúa como inductor'],c:0,e:'Sin alolactosa inductora, LacI permanece activo y se une al operador.'},
 {q:'En el operón trp, el triptófano abundante funciona como…',o:['Inductor que inactiva al represor','Correpresor que activa al represor TrpR','Promotor','ARN polimerasa'],c:1,e:'El triptófano se une a TrpR y permite que el represor se una al operador.'},
 {q:'¿Qué sucede con trp cuando escasea el triptófano?',o:['TrpR bloquea el operador','Aumenta la expresión de genes de síntesis de Trp','La atenuación siempre termina la transcripción','Se degrada el operón'],c:1,e:'Con poco Trp, el represor no se activa eficazmente y pueden expresarse los genes de biosíntesis.'},
 {q:'¿Qué describe la atenuación bacteriana de trp?',o:['Terminación temprana según la traducción del péptido líder','Un mecanismo exclusivo de eucariotas','Unión de lactosa a CAP','Replicación del operador'],c:0,e:'Con Trp abundante se favorece la horquilla terminadora 3–4; con Trp escaso, el ribosoma se detiene en codones de Trp y se favorece la antiterminadora 2–3.'},
 {q:'¿Cuál es la diferencia central entre lac y trp?',o:['Ambos se activan al abundar su producto','lac es inducible para usar lactosa; trp es represible cuando abunda el producto final','lac solo existe en eucariotas','trp no se regula'],c:1,e:'lac permite aprovechar un sustrato; trp frena la síntesis cuando ya hay suficiente producto.'},
 {q:'¿Qué función cumple el operador?',o:['Secuencia reguladora donde puede unirse el represor','Codifica una enzima','Es el aminoácido triptófano','Es donde se traduce el ARN'],c:0,e:'El operador es ADN regulador: la unión del represor puede impedir o dificultar la transcripción.'}
];

export function abrirOperones({app, volver}) {
 let vista='lac', lactosa=true, glucosa=false, trp=false, atenuacion=true;
 let orden=[], pregunta=0, completadas=0, puntos=0, racha=0, mejor=0, respondida=false, last=-1;
 const estilos = `
 <style>
 .op-wrap{max-width:720px;margin:auto;padding:1rem 1rem calc(2rem + env(safe-area-inset-bottom));color:var(--crema,#FFF3DC)}
 .op-back{border:0;background:transparent;color:var(--tenue,#B8ABDB);padding:.5rem 0;font-weight:800}
 .op-head,.op-card{border:1px solid var(--linea,#43347A);border-radius:17px;background:var(--panel,#231845);padding:1rem;margin:.75rem 0}
 .op-head{background:linear-gradient(135deg,rgba(155,123,255,.2),var(--panel,#231845))}
 .op-kicker{color:var(--violeta,#9B7BFF);font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
 .op-head h1{font-size:clamp(1.5rem,5vw,2rem);line-height:1.15;margin:.35rem 0}
 .op-muted{color:var(--tenue,#B8ABDB);font-size:.88rem}
 .op-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.35rem;margin:1rem 0}
 .op-tab,.op-choice button{border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);border-radius:11px;padding:.7rem .3rem;font-weight:800;font-size:.8rem}
 .op-tab{color:var(--tenue,#B8ABDB)} .op-tab[aria-pressed=true]{background:var(--violeta,#9B7BFF);color:#170F2E}
 .op-card h2{font-size:1.1rem;margin-bottom:.35rem}
 .op-control{margin:.9rem 0}.op-control>span{display:block;font-size:.9rem;font-weight:800;margin-bottom:.45rem}
 .op-choice{display:flex;gap:.45rem}.op-choice button{flex:1;font-size:.86rem}
 .op-choice button[aria-pressed=true]{border-color:var(--violeta,#9B7BFF);background:rgba(155,123,255,.2);box-shadow:inset 0 0 0 1px var(--violeta,#9B7BFF)}
 .op-diagram{padding:.7rem;background:var(--noche,#170F2E);border:1px solid var(--linea,#43347A);border-radius:13px;margin:.8rem 0}
 .op-genes{display:grid;grid-template-columns:1fr .8fr 1fr 1fr 1fr;gap:.25rem}
 .op-gene{text-align:center;overflow-wrap:anywhere;padding:.55rem .12rem;border:1px solid #9B7BFF;border-radius:7px;background:rgba(155,123,255,.16);font-size:.68rem;font-weight:900}
 .op-prom{border-color:#FFB938;background:rgba(255,185,56,.12)}.op-oper{border-color:#FF5D7A;background:rgba(255,93,122,.12)}.op-struct{border-color:#4FE0A0;background:rgba(79,224,160,.1)}.op-off{opacity:.35}
 .op-arrow{text-align:center;color:var(--tenue,#B8ABDB);font-size:.8rem;margin:.5rem 0}
 .op-status{display:flex;gap:.6rem;padding:.8rem;border-radius:11px;border:1px solid rgba(79,224,160,.4);background:rgba(79,224,160,.08);font-size:.88rem}
 .op-status.warn{border-color:rgba(255,185,56,.45);background:rgba(255,185,56,.08)}.op-status b{display:block;margin-bottom:.2rem}
 .op-score{display:flex;gap:.4rem;margin:.75rem 0}.op-score div{flex:1;text-align:center;border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);border-radius:10px;padding:.5rem .1rem}.op-score b{display:block;color:var(--ambar,#FFB938);font-size:1.1rem}.op-score small{font-size:.7rem;color:var(--tenue,#B8ABDB)}
 .op-pill{display:inline-block;padding:.2rem .5rem;border-radius:99px;background:rgba(155,123,255,.17);font-size:.72rem;font-weight:900;margin:.15rem}
 .op-compare{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}.op-compare .op-card{margin:0;padding:.8rem}.op-compare h3{margin-bottom:.5rem}.op-list{padding-left:1.1rem;color:var(--tenue,#B8ABDB);font-size:.86rem}.op-list li{margin:.4rem 0}
 .op-question{font-size:1.05rem;font-weight:900;margin:.8rem 0;line-height:1.4}.op-answer{width:100%;text-align:left;border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);border-radius:11px;padding:.8rem;margin:.3rem 0;font-size:.88rem}.op-answer.good{border-color:#4FE0A0;background:rgba(79,224,160,.12)}.op-answer.bad{border-color:#FF5D7A;background:rgba(255,93,122,.12)}.op-answer:disabled{opacity:1}
 .op-feedback{padding:.8rem;border:1px solid var(--linea,#43347A);border-radius:11px;margin:.6rem 0;background:rgba(155,123,255,.1);font-size:.88rem}
 .op-primary{width:100%;border:0;border-radius:11px;padding:.8rem;margin-top:.5rem;background:var(--violeta,#9B7BFF);color:#170F2E;font-weight:900}
 .op-hairpins{display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin:.7rem 0}.op-hairpins span{text-align:center;padding:.6rem .2rem;border:1px solid var(--linea,#43347A);border-radius:10px;font-size:.78rem;font-weight:800}.op-hairpins .active{border-color:#FFB938;background:rgba(255,185,56,.12)}
 @media(max-width:480px){.op-wrap{padding-left:.8rem;padding-right:.8rem}.op-tab{font-size:.68rem}.op-genes{gap:.15rem}.op-gene{font-size:.6rem;padding:.5rem .05rem}.op-compare{grid-template-columns:1fr}}
 </style>`;
 app.innerHTML=estilos+'<main class="op-wrap"><button class="op-back" id="op-back">← Volver</button><header class="op-head"><div class="op-kicker">Laboratorio molecular · interactivo</div><h1>Operones lac y trp</h1><p class="op-muted">Modificá las condiciones, observá la regulación y comprobá tus predicciones.</p></header><nav class="op-tabs"><button class="op-tab" data-view="lac">🧪 lac</button><button class="op-tab" data-view="trp">🧬 trp</button><button class="op-tab" data-view="compare">↔ Comparar</button><button class="op-tab" data-view="quiz">🎯 Desafío</button></nav><section id="op-content"></section></main>';
 const $=s=>app.querySelector(s);
 $('#op-back').onclick=()=>{Sonido.clic();volver();};
 app.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{Sonido.clic();vista=b.dataset.view;render();});
 function render(){
  app.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===vista)));
  if(vista==='lac')lacView();else if(vista==='trp')trpView();else if(vista==='compare')compareView();else quizView();
  controls();
 }
 function lacView(){
  const bloqueado=!lactosa, cap=!glucosa, nivel=bloqueado?'Reprimida':cap?'Alta':'Baja';
  const explicacion=bloqueado?'Sin lactosa inductora, LacI se une al operador y bloquea o dificulta la transcripción.':cap?'La alolactosa inactiva LacI y CAP-cAMP favorece la unión de la ARN polimerasa porque la glucosa es baja.':'LacI queda inactivo, pero la glucosa alta reduce cAMP y la activación por CAP: la expresión es baja.';
  $('#op-content').innerHTML='<section class="op-card"><h2>1. Ajustá el ambiente</h2><p class="op-muted">El operón lac es inducible y responde a la lactosa y a la glucosa.</p><div class="op-control"><span>¿Hay lactosa?</span><div class="op-choice"><button data-lactosa="0" aria-pressed="'+!lactosa+'">No hay</button><button data-lactosa="1" aria-pressed="'+lactosa+'">Sí hay</button></div></div><div class="op-control"><span>Glucosa</span><div class="op-choice"><button data-glucosa="1" aria-pressed="'+glucosa+'">Alta</button><button data-glucosa="0" aria-pressed="'+!glucosa+'">Baja</button></div></div></section><section class="op-card"><h2>2. Observá el ADN</h2><div class="op-diagram"><div class="op-genes"><div class="op-gene op-prom">Promotor</div><div class="op-gene op-oper '+(bloqueado?'':'op-off')+'">Operador</div><div class="op-gene op-struct '+(bloqueado?'op-off':'')+'">lacZ</div><div class="op-gene op-struct '+(bloqueado?'op-off':'')+'">lacY</div><div class="op-gene op-struct '+(bloqueado?'op-off':'')+'">lacA</div></div><div class="op-arrow">ARN polimerasa → '+(bloqueado?'⛔ bloqueada':'→ transcripción')+'</div><div class="op-status '+(nivel==='Alta'?'':'warn')+'"><span>'+(bloqueado?'🔒':cap?'🟢':'🟡')+'</span><div><b>Expresión: '+nivel+'</b>'+explicacion+'</div></div></div><p class="op-muted">lacZ: β-galactosidasa · lacY: permeasa · lacA: transacetilasa. Esquema simplificado.</p></section><section class="op-card"><h2>3. Leé el resultado</h2><div class="op-score"><div><b>'+(lactosa?'Sí':'No')+'</b><small>Lactosa</small></div><div><b>'+(glucosa?'Alta':'Baja')+'</b><small>Glucosa</small></div><div><b>'+nivel+'</b><small>Transcripción</small></div></div><p class="op-muted">Probá las cuatro combinaciones y anticipá el resultado antes de tocar los controles.</p></section>';
 }
 function trpView(){
  const terminador=atenuacion&&trp, nivel=trp?(terminador?'Muy baja':'Baja'):'Alta';
  const explicacion=trp?'El triptófano actúa como correpresor: activa TrpR, que se une al operador y reduce la transcripción.':'Con poco triptófano, TrpR no se activa eficazmente y pueden expresarse los genes de biosíntesis.';
  const at= !atenuacion?'Atenuación desactivada: se muestra solo el control por represor.':trp?'Trp abundante: se favorece la horquilla terminadora 3–4 y se detiene la transcripción antes de los genes.':'Trp escaso: el ribosoma se detiene en los codones de Trp del líder; se favorece la antiterminadora 2–3 y la transcripción continúa.';
  $('#op-content').innerHTML='<section class="op-card"><h2>1. Cambiá la disponibilidad</h2><p class="op-muted">El operón trp es represible: frena la síntesis cuando abunda su producto final.</p><div class="op-control"><span>¿Hay mucho triptófano?</span><div class="op-choice"><button data-trp="0" aria-pressed="'+!trp+'">Escaso</button><button data-trp="1" aria-pressed="'+trp+'">Abundante</button></div></div></section><section class="op-card"><h2>2. Regulación del ADN</h2><div class="op-diagram"><div class="op-genes"><div class="op-gene op-prom">Promotor</div><div class="op-gene op-oper '+(trp?'':'op-off')+'">Operador</div><div class="op-gene op-struct '+(trp?'op-off':'')+'">trpE</div><div class="op-gene op-struct '+(trp?'op-off':'')+'">trpD/C</div><div class="op-gene op-struct '+(trp?'op-off':'')+'">trpB/A</div></div><div class="op-arrow">ARN polimerasa → '+(trp?'⛔ reprimida':'→ transcripción')+'</div><div class="op-status '+(trp?'warn':'')+'"><span>'+(trp?'🔒':'🟢')+'</span><div><b>Expresión: '+nivel+'</b>'+explicacion+'</div></div></div><div class="op-control"><span>Control por atenuación</span><div class="op-choice"><button data-atten="0" aria-pressed="'+!atenuacion+'">Solo represor</button><button data-atten="1" aria-pressed="'+atenuacion+'">Represor + atenuación</button></div></div><div class="op-hairpins"><span class="'+(atenuacion&&!trp?'active':'')+'">Horquilla 2–3<br>Antiterminadora</span><span class="'+(terminador?'active':'')+'">Horquilla 3–4<br>Terminadora</span></div><div class="op-status '+(terminador?'warn':'')+'"><span>🧬</span><div><b>Atenuación bacteriana</b>'+at+'</div></div><p class="op-muted" style="margin-top:.7rem">La atenuación depende del acoplamiento entre transcripción y traducción en bacterias.</p></section>';
 }
 function compareView(){
  $('#op-content').innerHTML='<section class="op-card"><h2>Dos estrategias reguladoras</h2><p class="op-muted">Conectá la regulación con la necesidad de la célula.</p></section><div class="op-compare"><section class="op-card"><h3>🧪 Operón lac</h3><span class="op-pill">Inducible</span><span class="op-pill">Catabólico</span><ul class="op-list"><li>Permite aprovechar lactosa.</li><li>Sin lactosa: LacI se une al operador.</li><li>Con lactosa: alolactosa inactiva LacI.</li><li>Glucosa baja: CAP-cAMP potencia la expresión.</li></ul><div class="op-status"><div><b>Pregunta guía</b>¿Conviene utilizar este sustrato?</div></div><button class="op-primary" id="op-golac">Probar lac</button></section><section class="op-card"><h3>🧬 Operón trp</h3><span class="op-pill">Represible</span><span class="op-pill">Anabólico</span><ul class="op-list"><li>Permite sintetizar triptófano.</li><li>Trp escaso: represor inactivo.</li><li>Trp abundante: actúa como correpresor.</li><li>En bacterias puede sumarse la atenuación.</li></ul><div class="op-status warn"><div><b>Pregunta guía</b>¿Ya hay suficiente producto final?</div></div><button class="op-primary" id="op-gotrp" style="background:var(--ambar,#FFB938)">Probar trp</button></section></div>';
 }
 function quizView(){
  if(!orden.length)orden=[0,1,2,3,4,5,6,7].sort(()=>Math.random()-.5);
  const q=PREGUNTAS[orden[pregunta%orden.length]], fin=completadas>=8;
  $('#op-content').innerHTML='<section class="op-card"><h2>Desafío de examen</h2><p class="op-muted">8 preguntas mezcladas · elegí y revisá la explicación.</p><div class="op-score"><div><b>'+puntos+'</b><small>Puntos</small></div><div><b>'+racha+'</b><small>Racha</small></div><div><b>'+mejor+'</b><small>Mejor racha</small></div></div>'+(fin?'<div class="op-status"><div><b>¡Ronda completada!</b> '+puntos+'/80 puntos · '+(puntos/10)+' de 8 correctas.</div></div><button class="op-primary" id="op-restart">Jugar otra ronda</button>':'<div class="op-muted">Pregunta '+(completadas+1)+' de 8</div><p class="op-question">'+q.q+'</p>'+q.o.map((o,i)=>'<button class="op-answer" data-answer="'+i+'">'+String.fromCharCode(65+i)+'. '+o+'</button>').join('')+'<div id="op-feedback"></div>'+(respondida?'<button class="op-primary" id="op-next">Siguiente pregunta →</button>':''))+'</section>';
  if(respondida&&!fin){
   $('#op-feedback').innerHTML='<div class="op-feedback"><b>'+(last===q.c?'✓ Correcto':'✕ No exactamente')+'</b><p style="margin-top:.35rem">'+q.e+'</p></div>';
   app.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;const n=Number(b.dataset.answer);if(n===q.c)b.classList.add('good');if(n===last&&n!==q.c)b.classList.add('bad');});
   $('#op-next').onclick=()=>{Sonido.clic();pregunta++;completadas++;respondida=false;last=-1;if(completadas===8){Sonido.fin(puntos>=60);if(puntos>=60)lanzarConfeti(100);}render();};
  }
 }
 function controls(){
  app.querySelectorAll('[data-lactosa]').forEach(b=>b.onclick=()=>{Sonido.clic();lactosa=b.dataset.lactosa==='1';render();});
  app.querySelectorAll('[data-glucosa]').forEach(b=>b.onclick=()=>{Sonido.clic();glucosa=b.dataset.glucosa==='1';render();});
  app.querySelectorAll('[data-trp]').forEach(b=>b.onclick=()=>{Sonido.clic();trp=b.dataset.trp==='1';render();});
  app.querySelectorAll('[data-atten]').forEach(b=>b.onclick=()=>{Sonido.clic();atenuacion=b.dataset.atten==='1';render();});
  $('#op-golac')?.addEventListener('click',()=>{Sonido.clic();vista='lac';render();});
  $('#op-gotrp')?.addEventListener('click',()=>{Sonido.clic();vista='trp';render();});
  app.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
   if(respondida)return;Sonido.clic();last=Number(b.dataset.answer);respondida=true;
   if(last===PREGUNTAS[orden[pregunta%orden.length]].c){puntos+=10;racha++;mejor=Math.max(mejor,racha);Sonido.acierto();}else{racha=0;Sonido.error();}
   render();
  });
  $('#op-restart')?.addEventListener('click',()=>{Sonido.clic();orden=[];pregunta=0;completadas=0;puntos=0;racha=0;mejor=0;respondida=false;last=-1;render();});
 }
 render();
}
