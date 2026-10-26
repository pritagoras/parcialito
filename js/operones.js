import { Sonido } from './sonido.js?v=dev';
import { lanzarConfeti } from './confeti.js?v=dev';

export const TITULO = 'Regulación genética: lac, trp y ferritina';

const PREGUNTAS = [
 {q:'Hay lactosa y poca glucosa. ¿Qué ocurre con lac?',o:['LacI bloquea el operador','Expresión alta: LacI se inactiva y CAP-cAMP favorece la transcripción','Se activa TrpR','No puede transcribirse nunca'],c:1,e:'La alolactosa inactiva LacI y, con poca glucosa, aumenta cAMP: CAP-cAMP favorece la unión de la ARN polimerasa.'},
 {q:'Hay lactosa, pero también mucha glucosa. ¿Qué predicción es mejor?',o:['Expresión máxima','LacI permanece siempre unido','Expresión baja: hay inducción, pero poca activación por CAP-cAMP','El operón se vuelve represible'],c:2,e:'La lactosa libera el operador, pero la glucosa alta reduce cAMP y la activación por CAP. La expresión suele ser baja, no necesariamente nula.'},
 {q:'No hay lactosa. ¿Qué ocurre normalmente en lac?',o:['LacI se une al operador','CAP se une a la lactosa','Se expresan al máximo lacZYA','El triptófano actúa como inductor'],c:0,e:'Sin alolactosa inductora, LacI permanece activo y se une al operador.'},
 {q:'En el operón trp, el triptófano abundante funciona como…',o:['Inductor que inactiva al represor','Correpresor que activa al represor TrpR','Promotor','ARN polimerasa'],c:1,e:'El triptófano se une a TrpR y permite que el represor se una al operador.'},
 {q:'¿Qué sucede con trp cuando escasea el triptófano?',o:['TrpR bloquea el operador','Aumenta la expresión de genes de síntesis de Trp','La atenuación siempre termina la transcripción','Se degrada el operón'],c:1,e:'Con poco Trp, el represor no se activa eficazmente y pueden expresarse los genes de biosíntesis.'},
 {q:'¿Qué describe la atenuación bacteriana de trp?',o:['Terminación temprana según la traducción del péptido líder','Un mecanismo exclusivo de eucariotas','Unión de lactosa a CAP','Replicación del operador'],c:0,e:'Con Trp abundante se favorece la horquilla terminadora 3–4; con Trp escaso, el ribosoma se detiene en codones de Trp y se favorece la antiterminadora 2–3.'},
 {q:'¿Cuál es la diferencia central entre lac y trp?',o:['Ambos se activan al abundar su producto','lac es inducible para usar lactosa; trp es represible cuando abunda el producto final','lac solo existe en eucariotas','trp no se regula'],c:1,e:'lac permite aprovechar un sustrato; trp frena la síntesis cuando ya hay suficiente producto.'},
 {q:'¿Qué función cumple el operador?',o:['Secuencia reguladora donde puede unirse el represor','Codifica una enzima','Es el aminoácido triptófano','Es donde se traduce el ARN'],c:0,e:'El operador es ADN regulador: la unión del represor puede impedir o dificultar la transcripción.'},
 {q:'¿Qué ocurre con la síntesis de ferritina cuando escasea el hierro?',o:['IRP se une al IRE 5′ del ARNm y dificulta la traducción','IRP bloquea el operador del ADN','La traducción aumenta al máximo','El IRE se convierte en proteína'],c:0,e:'Con poco hierro, IRP se une al IRE de la región 5′ no traducida del ARNm de ferritina y reprime la traducción.'}
];

export function abrirOperones({app, volver}) {
 let vista='lac', lactosa=true, glucosa=false, trp=false, atenuacion=true, hierro=false, recorridoProceso='lac', recorridoPaso=0, moleculaSel='Promotor';
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
 .op-tabs{grid-template-columns:repeat(6,minmax(0,1fr))}
 .op-processes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;margin:.8rem 0}
 .op-processes button,.op-guide-steps button{border:1px solid var(--linea,#43347A);background:var(--noche,#170F2E);color:var(--tenue,#B8ABDB);border-radius:10px;padding:.65rem .4rem;font-weight:850}
 .op-processes button[aria-pressed=true]{border-color:#5aa2ff;background:rgba(61,139,255,.16);color:#eaf1ff}
 .op-scene{overflow:hidden;border:1px solid #23406f;border-radius:16px;background:radial-gradient(ellipse at 50% 20%,#122957 0%,#071329 58%,#040a18 100%);margin:.8rem 0;padding:1rem}
 .op-dna-track{height:16px;margin:2rem .25rem 1.7rem;border-radius:99px;background:linear-gradient(90deg,#2365c9,#58c9ff,#2365c9);box-shadow:0 0 15px #2365c966;position:relative}
 .op-dna-track:after{content:"";position:absolute;inset:5px 0;border-top:2px solid #d8f1ff;opacity:.8}
 .op-molecules{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:.55rem;position:relative}
 .op-molecule{min-width:78px;max-width:100%;border:1px solid #31549a;border-radius:13px;background:#102653;color:#eaf1ff;padding:.65rem .75rem;font-weight:850;box-shadow:0 5px 16px #0004;cursor:pointer}
 .op-molecule small{display:block;color:#b9c9f2;font-weight:600;font-size:.68rem;margin-top:.2rem}
 .op-molecule[data-kind=protein]{border-color:#9b7bff;background:#211747}.op-molecule[data-kind=signal]{border-color:#ffb938;background:#382814}.op-molecule[data-kind=blocked]{border-color:#ff5d7a;background:#3b182b}.op-molecule[data-kind=active]{border-color:#4fe0a0;background:#0b302e}
 .op-molecule.selected{outline:2px solid #eaf1ff;outline-offset:2px;box-shadow:0 0 20px #3d8bff88}.op-molecule.stage-focus{transform:translateY(-4px);box-shadow:0 0 19px #3d8bff88;border-color:#72a8ff}
 .op-flow-arrow{text-align:center;color:#9fc4ff;font-size:1.4rem;line-height:1.2;padding:.35rem}
 .op-scene-caption{text-align:center;color:#9fb3e6;font-size:.76rem;margin-top:.8rem}
 .op-guide-steps{display:flex;gap:.35rem;margin:.8rem 0}
 .op-guide-steps button{flex:1;min-width:0;padding:.55rem .2rem}
 .op-guide-steps button[aria-current=step]{background:#235fe0;border-color:#72a8ff;color:white}
 .op-guide-copy{padding:1rem;border:1px solid #23406f;border-radius:14px;background:linear-gradient(135deg,rgba(61,139,255,.12),rgba(7,19,41,.92))}
 .op-guide-copy h3{margin:.35rem 0 .55rem;font-size:1.12rem}.op-guide-copy p{line-height:1.6;margin:.45rem 0}
 .op-guide-nav{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin-top:.8rem}.op-guide-nav button{border:1px solid #31549a;border-radius:11px;padding:.75rem;background:#102653;color:#eaf1ff;font-weight:850}.op-guide-nav button:disabled{opacity:.35}
 .op-mol-detail{margin-top:.65rem;padding:.8rem;border:1px solid var(--linea,#43347A);border-radius:11px;color:var(--tenue,#B8ABDB);font-size:.86rem;line-height:1.55}.op-mol-detail b{color:#eaf1ff}
 @media(max-width:480px){.op-tabs{grid-template-columns:repeat(3,minmax(0,1fr))}.op-processes{grid-template-columns:1fr}.op-scene{padding:.7rem}.op-molecule{min-width:68px;padding:.55rem}.op-guide-steps button{font-size:.75rem}}

 @media(max-width:480px){.op-wrap{padding-left:.8rem;padding-right:.8rem}.op-tab{font-size:.68rem}.op-genes{gap:.15rem}.op-gene{font-size:.6rem;padding:.5rem .05rem}.op-compare{grid-template-columns:1fr}}
 </style>`;
 app.innerHTML=estilos+'<main class="op-wrap"><button class="op-back" id="op-back">← Volver</button><header class="op-head"><div class="op-kicker">Laboratorio molecular · interactivo</div><h1>Operón lac, operón trp y ferritina</h1><p class="op-muted">Explorá cómo las señales ambientales y el hierro regulan la expresión génica: cambiá las condiciones, observá los mecanismos y comprobá tus predicciones.</p></header><nav class="op-tabs"><button class="op-tab" data-view="recorrido">🧭 Recorrido</button><button class="op-tab" data-view="lac">🧪 lac</button><button class="op-tab" data-view="trp">🧬 trp</button><button class="op-tab" data-view="ferritina">🩸 Ferritina</button><button class="op-tab" data-view="compare">↔ Comparar</button><button class="op-tab" data-view="quiz">🎯 Desafío</button></nav><section id="op-content"></section></main>';
 const $=s=>app.querySelector(s);
 $('#op-back').onclick=()=>{Sonido.clic();volver();};
 app.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{Sonido.clic();vista=b.dataset.view;render();});
 function render(){
  app.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===vista)));
  if(vista==='recorrido')renderRecorrido();else if(vista==='lac')lacView();else if(vista==='trp')trpView();else if(vista==='ferritina')ferritinaView();else if(vista==='compare')compareView();else quizView();
  controls();
 }
 function renderRecorrido(){
  const esLac=recorridoProceso==='lac', esTrp=recorridoProceso==='trp';
  const pasos=esLac?[
   ['1. Señales del ambiente','La célula detecta lactosa y glucosa. La lactosa puede generar alolactosa, mientras que la glucosa modifica la señal AMPc–CAP.','La expresión alta requiere lactosa presente y glucosa baja.'],
   ['2. LacI y el operador',lactosa?'La alolactosa se une a LacI y reduce su afinidad por el operador.':'Sin lactosa inductora, LacI se une al operador y bloquea o dificulta la transcripción.','La lactosa regula al represor; no se une directamente al ADN.'],
   ['3. Activación por CAP',glucosa?'La glucosa alta reduce el AMPc: CAP activa poco la transcripción.':'La glucosa baja eleva el AMPc y el complejo CAP–AMPc favorece el reclutamiento de la ARN polimerasa.','La liberación del represor no significa, por sí sola, expresión máxima.'],
   ['4. Transcripción de lacZYA',!lactosa?'LacI permanece unido al operador: la transcripción queda reprimida.':glucosa?'LacI está inactivado, pero falta activación fuerte por CAP–AMPc: la expresión es baja.':'LacI se libera y CAP–AMPc activa: la transcripción puede ser alta.','lacZ, lacY y lacA permiten captar y metabolizar lactosa.']
  ]:esTrp?[
   ['1. Disponibilidad de triptófano',trp?'El triptófano es abundante y puede actuar como correpresor de TrpR.':'El triptófano escasea: la célula necesita expresar genes para sintetizarlo.','lac responde a un sustrato; trp responde a la abundancia de su producto final.'],
   ['2. TrpR y el operador',trp?'Trp se une a TrpR y favorece que el represor se una al operador.':'Sin suficiente Trp, TrpR no bloquea eficazmente el operador.','Este es el control transcripcional por represor.'],
   ['3. Traducción del líder trpL',trp?'El ribosoma traduce el péptido líder sin detenerse en los codones de Trp.':'El ribosoma se detiene en los codones de Trp del líder por falta de aminoácido.','La posición del ribosoma modifica qué regiones del ARN pueden aparearse.'],
   ['4. Atenuación',!atenuacion?'La atenuación está desactivada en el simulador; queda el control por TrpR.':trp?'Se favorece la horquilla 3–4 terminadora y la transcripción termina antes de los genes estructurales.':'Se favorece la horquilla 2–3 antiterminadora y la transcripción continúa.','La atenuación requiere el acoplamiento entre transcripción y traducción en bacterias.']
  ]:[
   ['1. Hierro disponible',hierro?'El hierro es suficiente; la célula puede producir ferritina para almacenarlo.':'El hierro escasea; conviene reducir la producción de una proteína de almacenamiento.','Ferritina se regula principalmente durante la traducción del ARNm.'],
   ['2. IRP reconoce el IRE',hierro?'IRP deja de bloquear el IRE 5′ del ARNm de ferritina.':'IRP se une al IRE de la región 5′ no traducida y dificulta el inicio de traducción.','IRE es una región del ARN; IRP es una proteína que la reconoce.'],
   ['3. Traducción de ferritina',hierro?'El ribosoma puede iniciar la traducción y aumenta la producción de ferritina.':'La unión IRP–IRE dificulta el inicio: se produce menos ferritina.','No confundas traducción de ARNm con transcripción desde ADN.']
  ];
  recorridoPaso=Math.max(0,Math.min(pasos.length-1,recorridoPaso));
  const paso=pasos[recorridoPaso], nombre=esLac?'Operón lac':esTrp?'Operón trp':'Regulación de ferritina';
  const descripcion=esLac?'Ajustá lactosa y glucosa en la pestaña lac para cambiar las señales.':esTrp?'Ajustá triptófano y atenuación en la pestaña trp.':'Ajustá el hierro en Ferritina para observar el control del ARNm.';
  let nodos=[];
  if(esLac){
   nodos=[['Promotor','ADN','signal'],['Operador',lactosa?'LacI liberado':'LacI unido',lactosa?'active':'blocked']];
   if(lactosa)nodos.push(['Alolactosa','se une a LacI','signal']);else nodos.push(['LacI','represor activo','blocked']);
   nodos.push([glucosa?'CAP poco activo':'CAP–AMPc',glucosa?'glucosa alta':'glucosa baja',glucosa?'blocked':'active']);
   nodos.push(['ARN polimerasa',!lactosa?'bloqueada':glucosa?'actividad baja':'transcripción alta',!lactosa?'blocked':glucosa?'signal':'active']);
   nodos.push(['lacZ · lacY · lacA',lactosa?(glucosa?'expresión baja':'expresión alta'):'sin transcripción eficaz',lactosa?'active':'blocked']);
  }else if(esTrp){
   nodos=[['Promotor','ADN','signal'],['Operador',trp?'TrpR unido':'TrpR libre',trp?'blocked':'active'],['TrpR',trp?'activado por Trp':'sin correpresor',trp?'blocked':'protein'],['Ribosoma / trpL',trp?'avanza por el líder':'se detiene en codones Trp',trp?'signal':'active'],['Horquilla',!atenuacion?'sin atenuación':trp?'3–4 terminadora':'2–3 antiterminadora',!atenuacion?'protein':trp?'blocked':'active'],['Genes trpEDCBA',trp?'expresión reducida':'transcripción continúa',trp?'blocked':'active']];
  }else{
   nodos=[['ARNm ferritina','región 5′','protein'],['IRE 5′','elemento regulador','signal'],['IRP',hierro?'no unida':'unida al IRE',hierro?'protein':'blocked'],['Ribosoma',hierro?'inicia traducción':'inicio dificultado',hierro?'active':'blocked'],['Ferritina',hierro?'síntesis favorecida':'síntesis reducida',hierro?'active':'blocked']];
  }
  const diagrama=esLac||esTrp?'<div class="op-dna-track" aria-label="ADN bacteriano"></div>':'<div class="op-dna-track" style="background:linear-gradient(90deg,#a3124a,#ff4f8b,#a3124a)" aria-label="ARN mensajero"></div>';
  const focos=esLac?[['Alolactosa','CAP–AMPc','CAP poco activo'],['Operador','LacI','Alolactosa'],['CAP–AMPc','CAP poco activo'],['ARN polimerasa','lacZ · lacY · lacA']][recorridoPaso]:esTrp?[['TrpR'],['Operador','TrpR'],['Ribosoma / trpL'],['Horquilla','Genes trpEDCBA']][recorridoPaso]:[['ARNm ferritina'],['IRE 5′','IRP'],['Ribosoma','Ferritina']][recorridoPaso];
  const piezas=nodos.map((m,i)=>'<button type="button" class="op-molecule '+(moleculaSel===m[0]?'selected ':'')+(focos.includes(m[0])?'stage-focus':'')+'" data-mol="'+m[0]+'" data-kind="'+m[2]+'">'+m[0]+'<small>'+m[1]+'</small></button>').join('<span class="op-flow-arrow" aria-hidden="true">→</span>');
  const detalle={
   'Promotor':'Región de ADN donde se posiciona la ARN polimerasa para iniciar la transcripción.',
   'Operador':'Secuencia reguladora de ADN donde puede unirse un represor.',
   'Alolactosa':'Inductor derivado de la lactosa que se une a LacI y reduce su afinidad por el operador.',
   'LacI':'Represor del operón lac; sin inductor puede unirse al operador.',
   'CAP–AMPc':'Complejo activador que favorece la transcripción de lac cuando la glucosa es baja.',
   'CAP poco activo':'Con glucosa alta disminuye el AMPc y la activación por CAP.',
   'ARN polimerasa':'Enzima que sintetiza ARN a partir de una hebra molde de ADN.',
   'lacZ · lacY · lacA':'Genes estructurales implicados en el aprovechamiento de la lactosa.',
   'TrpR':'Represor que se activa al unirse al triptófano, que actúa como correpresor.',
   'Ribosoma / trpL':'La traducción del péptido líder permite detectar indirectamente la disponibilidad de triptófano.',
   'Horquilla':'Las regiones del ARN líder pueden formar una estructura terminadora o antiterminadora.',
   'Genes trpEDCBA':'Genes que codifican enzimas de la biosíntesis de triptófano.',
   'ARNm ferritina':'ARN mensajero cuya traducción se ajusta según la disponibilidad de hierro.',
   'IRE 5′':'Elemento de respuesta al hierro en la región 5′ no traducida del ARNm.',
   'IRP':'Proteína reguladora que se une al IRE cuando el hierro escasea.',
   'Ribosoma':'Complejo que traduce el ARNm; su inicio se dificulta cuando IRP ocupa el IRE 5′.',
   'Ferritina':'Proteína que almacena hierro dentro de la célula.'
  };
  const molInfo=detalle[moleculaSel]||detalle[nodos[0][0]];
  const botonCond=esLac?'<button class="op-primary" data-jump="lac">Cambiar lactosa y glucosa</button>':esTrp?'<button class="op-primary" data-jump="trp">Cambiar triptófano y atenuación</button>':'<button class="op-primary" data-jump="ferritina">Cambiar hierro</button>';
  $('#op-content').innerHTML='<section class="op-card"><div class="op-kicker">Simulación guiada · paso a paso</div><h2>'+nombre+'</h2><p class="op-muted">'+descripcion+'</p><div class="op-processes" role="group" aria-label="Elegir proceso"><button data-proceso="lac" aria-pressed="'+esLac+'">🧪 Operón lac</button><button data-proceso="trp" aria-pressed="'+esTrp+'">🧬 Operón trp</button><button data-proceso="ferritina" aria-pressed="'+(!esLac&&!esTrp)+'">🩸 Ferritina</button></div><div class="op-scene">'+diagrama+'<div class="op-molecules">'+piezas+'</div><p class="op-scene-caption">Esquema molecular interactivo · seleccioná una pieza para conocer su función</p></div><div class="op-mol-detail" aria-live="polite"><b>'+moleculaSel+'.</b> '+molInfo+'</div><div class="op-guide-steps" role="group" aria-label="Etapas">'+pasos.map((p,i)=>'<button data-rstep="'+i+'" aria-current="'+(i===recorridoPaso?'step':'false')+'">'+(i+1)+'</button>').join('')+'</div><div class="op-guide-copy"><div class="op-kicker">Etapa '+(recorridoPaso+1)+' de '+pasos.length+'</div><h3>'+paso[0]+'</h3><p>'+paso[1]+'</p><p class="op-muted"><b>Idea clave:</b> '+paso[2]+'</p><div class="op-guide-nav"><button data-rprev '+(recorridoPaso===0?'disabled':'')+'>← Anterior</button><button data-rnext '+(recorridoPaso===pasos.length-1?'disabled':'')+'>Siguiente →</button></div></div><div class="op-status" style="margin-top:.8rem"><div><b>Condiciones actuales</b>'+(esLac?'Lactosa: '+(lactosa?'presente':'ausente')+' · glucosa: '+(glucosa?'alta':'baja')+'. ':esTrp?'Triptófano: '+(trp?'abundante':'escaso')+' · atenuación: '+(atenuacion?'activa':'desactivada')+'. ':'Hierro: '+(hierro?'abundante':'escaso')+'. ')+botonCond+'</div></div></section>';
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

 function ferritinaView(){
  const irp= !hierro;
  const nivel=hierro?'Alta: se traduce ferritina':'Baja: traducción bloqueada';
  const explicacion=hierro
   ?'Cuando el hierro es abundante, IRP deja de unirse al IRE situado en la región 5′ no traducida del ARNm de ferritina. El ribosoma puede iniciar la traducción y se produce ferritina para almacenar hierro.'
   :'Cuando el hierro escasea, IRP se une al IRE en la región 5′ no traducida del ARNm de ferritina e impide el inicio eficiente de la traducción. Así se evita fabricar una proteína de almacenamiento cuando falta hierro.';
  $('#op-content').innerHTML='<section class="op-card"><h2>1. Ajustá el hierro disponible</h2><p class="op-muted">La ferritina almacena hierro. Su regulación se parece en el resultado a un interruptor génico, pero ocurre principalmente durante la <b>traducción del ARNm</b>, no porque un represor bloquee un operador de ADN.</p><div class="op-control"><span>Hierro celular</span><div class="op-choice"><button data-hierro="0" aria-pressed="'+!hierro+'">Escaso</button><button data-hierro="1" aria-pressed="'+hierro+'">Abundante</button></div></div></section><section class="op-card"><h2>2. Seguí el control molecular</h2><div class="op-diagram"><div class="op-genes"><div class="op-gene op-prom">ADN</div><div class="op-gene op-oper">ARNm</div><div class="op-gene op-struct">IRE 5′</div><div class="op-gene '+(irp?'op-oper':'op-struct')+'">'+(irp?'IRP unido':'IRP libre')+'</div><div class="op-gene op-prom">Ribosoma</div></div><div class="op-arrow">ARNm de ferritina → '+(irp?'⛔ inicio bloqueado':'→ traducción')+'</div><div class="op-status '+(hierro?'':'warn')+'"><span>'+(hierro?'🟢':'🔒')+'</span><div><b>'+nivel+'</b>'+explicacion+'</div></div></div><p class="op-muted">IRE = elemento de respuesta al hierro en el ARN; IRP = proteína reguladora del hierro. En ferritina, el IRE está en el extremo 5′ del ARNm.</p></section><section class="op-card"><h2>3. ¿Por qué importa?</h2><div class="op-score"><div><b>'+(hierro?'Abundante':'Escaso')+'</b><small>Hierro</small></div><div><b>'+(irp?'IRP–IRE':'IRP se libera')+'</b><small>Regulación</small></div><div><b>'+(hierro?'Más':'Menos')+'</b><small>Ferritina</small></div></div><p class="op-muted">Esta respuesta evita invertir el mecanismo: el hierro bajo reprime la traducción de ferritina; el hierro alto permite que aumente.</p></section>';
 }
 function compareView(){
  $('#op-content').innerHTML=`
  <section class="op-card">
   <div class="op-kicker">Guía integradora</div><h2>Tres niveles de control de la expresión génica</h2>
   <p>Los tres sistemas ajustan la producción de moléculas a las necesidades celulares, pero <b>no actúan en el mismo punto</b>. lac y trp regulan principalmente la transcripción bacteriana; la ferritina se regula, en el mecanismo clásico, mediante la traducción de su ARNm.</p>
   <div class="op-status"><div><b>Clave para el examen</b>No confundas el operador del ADN con el IRE del ARN: el primero participa en el control transcripcional de los operones; el segundo es una estructura reguladora del ARNm.</div></div>
  </section>
  <div class="op-compare">
   <section class="op-card"><h3>🧪 Operón lac</h3><span class="op-pill">Inducible</span><span class="op-pill">Catabólico</span>
    <p>Permite utilizar lactosa cuando está disponible. Su regulación integra una señal negativa (LacI) y una positiva (CAP–AMPc).</p>
    <ul class="op-list"><li><b>Sin lactosa:</b> LacI se une al operador y dificulta la transcripción.</li><li><b>Con lactosa:</b> parte de ella se convierte en alolactosa, el inductor que se une a LacI y reduce su afinidad por el operador.</li><li><b>Glucosa baja:</b> aumenta el AMPc; el complejo CAP–AMPc favorece la unión de la ARN polimerasa y eleva la expresión.</li><li><b>Glucosa alta:</b> baja el AMPc y disminuye la activación, aunque haya lactosa.</li></ul>
    <div class="op-status"><div><b>Genes estructurales</b>lacZ codifica β-galactosidasa; lacY, permeasa; lacA, transacetilasa. El promotor es el sitio de inicio de la transcripción y el operador es una secuencia reguladora reconocida por LacI.</div></div>
    <button class="op-primary" id="op-golac">Explorar las condiciones de lac</button>
   </section>
   <section class="op-card"><h3>🧬 Operón trp</h3><span class="op-pill">Represible</span><span class="op-pill">Anabólico</span>
    <p>Codifica enzimas necesarias para biosintetizar triptófano. El producto final informa si hace falta seguir fabricándolo.</p>
    <ul class="op-list"><li><b>Trp escaso:</b> TrpR sin triptófano no se une eficazmente al operador; la transcripción puede continuar.</li><li><b>Trp abundante:</b> el triptófano actúa como <i>correpresor</i>, se une a TrpR y favorece su unión al operador.</li><li><b>Atenuación:</b> en bacterias como <i>E. coli</i>, el péptido líder trpL permite que el acoplamiento entre transcripción y traducción detecte la disponibilidad de Trp.</li><li><b>Trp abundante:</b> el ribosoma avanza por los codones de Trp del líder y se favorece la horquilla 3–4 terminadora.</li><li><b>Trp escaso:</b> el ribosoma se detiene en esos codones; se favorece la estructura 2–3 antiterminadora y la transcripción continúa.</li></ul>
    <div class="op-status warn"><div><b>Precisión</b>Represión por TrpR y atenuación son mecanismos distintos que pueden actuar conjuntamente. La atenuación depende del acoplamiento transcripción–traducción propio de procariotas.</div></div>
    <button class="op-primary" id="op-gotrp" style="background:var(--ambar,#FFB938)">Explorar el operón trp</button>
   </section>
  </div>
  <section class="op-card"><h3>🩸 Ferritina: regulación por hierro</h3><span class="op-pill">Control traduccional</span><span class="op-pill">Homeostasis del hierro</span>
   <p>La ferritina es una proteína de almacenamiento: secuestra hierro en una forma menos reactiva y ayuda a mantener una reserva celular. Fabricarla cuando falta hierro sería poco útil, por eso la célula regula la traducción de su ARNm.</p>
   <ul class="op-list"><li><b>Hierro bajo:</b> las proteínas reguladoras IRP se unen al elemento IRE ubicado en la región 5′ no traducida del ARNm de ferritina.</li><li>La unión IRP–IRE dificulta el inicio de la traducción; se sintetiza menos ferritina y se evita invertir en almacenamiento cuando el hierro escasea.</li><li><b>Hierro alto:</b> IRP deja de ocupar ese IRE (por cambios en su unión al hierro o en su estado funcional, según la IRP); el ribosoma puede iniciar la traducción y aumenta la síntesis de ferritina.</li><li>El IRE es una estructura/secuencia reguladora del <b>ARN</b>, no un operador del ADN. IRP es una proteína, no una secuencia genética.</li></ul>
   <div class="op-status"><div><b>Cadena causal</b>Hierro bajo → IRP se une al IRE 5′ → se inhibe la iniciación de traducción → baja la ferritina. Hierro alto → disminuye esa unión reguladora → se permite la traducción → aumenta la ferritina.</div></div>
   <button class="op-primary" id="op-goferritina">Explorar la regulación de ferritina</button>
  </section>
  <section class="op-card"><h2>Comparación rápida</h2><div class="scroll"><table style="width:100%;border-collapse:collapse;font-size:.86rem"><thead><tr><th style="text-align:left;padding:.55rem;border-bottom:1px solid #49395e">Característica</th><th style="text-align:left;padding:.55rem;border-bottom:1px solid #49395e">lac</th><th style="text-align:left;padding:.55rem;border-bottom:1px solid #49395e">trp</th><th style="text-align:left;padding:.55rem;border-bottom:1px solid #49395e">Ferritina</th></tr></thead><tbody>
   <tr><td style="padding:.55rem;border-bottom:1px solid #49395e">Objetivo</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Utilizar lactosa</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Sintetizar triptófano</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Almacenar hierro</td></tr>
   <tr><td style="padding:.55rem;border-bottom:1px solid #49395e">Nivel principal</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Transcripción</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Transcripción y atenuación</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Traducción</td></tr>
   <tr><td style="padding:.55rem;border-bottom:1px solid #49395e">Señal clave</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Alolactosa; glucosa/AMPc</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Triptófano</td><td style="padding:.55rem;border-bottom:1px solid #49395e">Hierro celular</td></tr>
   <tr><td style="padding:.55rem;border-bottom:1px solid #49395e">Regulador</td><td style="padding:.55rem;border-bottom:1px solid #49395e">LacI y CAP–AMPc</td><td style="padding:.55rem;border-bottom:1px solid #49395e">TrpR; estructuras del líder</td><td style="padding:.55rem;border-bottom:1px solid #49395e">IRP e IRE 5′ del ARNm</td></tr>
   <tr><td style="padding:.55rem">Lógica</td><td style="padding:.55rem">Inducible</td><td style="padding:.55rem">Represible</td><td style="padding:.55rem">Hierro bajo reprime la traducción</td></tr>
  </tbody></table></div>
  <p class="op-muted">La tabla resume los modelos clásicos; la regulación real puede incluir mecanismos adicionales según el organismo y las condiciones celulares.</p></section>`;
 } function quizView(){
   if(!orden.length) orden=PREGUNTAS.map((_,i)=>i).sort(()=>Math.random()-.5);
   const q=PREGUNTAS[orden[pregunta%orden.length]], fin=completadas>=PREGUNTAS.length;
   const cuerpo=fin
    ? `<div class="op-status"><div><b>¡Ronda completada!</b> ${puntos}/${PREGUNTAS.length*10} puntos · ${puntos/10} de ${PREGUNTAS.length} correctas.</div></div><button class="op-primary" id="op-restart">Jugar otra ronda</button>`
    : `<div class="op-muted">Pregunta ${completadas+1} de ${PREGUNTAS.length}</div><p class="op-question">${q.q}</p>${q.o.map((o,i)=>`<button class="op-answer" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}<div id="op-feedback"></div>${respondida?'<button class="op-primary" id="op-next">Siguiente pregunta →</button>':''}`;
   $('#op-content').innerHTML=`<section class="op-card"><h2>Desafío de examen</h2><p class="op-muted">Preguntas mezcladas sobre lac, trp, atenuación y ferritina · elegí y revisá la explicación.</p><div class="op-score"><div><b>${puntos}</b><small>Puntos</small></div><div><b>${racha}</b><small>Racha</small></div><div><b>${mejor}</b><small>Mejor racha</small></div></div>${cuerpo}</section>`;
   if(respondida&&!fin){
    $('#op-feedback').innerHTML='<div class="op-feedback"><b>'+(last===q.c?'✓ Correcto':'✕ No exactamente')+'</b><p style="margin-top:.35rem">'+q.e+'</p></div>';
    app.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;const n=Number(b.dataset.answer);if(n===q.c)b.classList.add('good');if(n===last&&n!==q.c)b.classList.add('bad');});
    $('#op-next').onclick=()=>{Sonido.clic();pregunta++;completadas++;respondida=false;last=-1;if(completadas===PREGUNTAS.length){Sonido.fin(puntos>=60);if(puntos>=60)lanzarConfeti(100);}render();};
   }
  }
  function controls(){
  app.querySelectorAll('[data-proceso]').forEach(b=>b.onclick=()=>{Sonido.clic();recorridoProceso=b.dataset.proceso;recorridoPaso=0;moleculaSel=recorridoProceso==='ferritina'?'IRE 5′':'Promotor';render();});
  app.querySelectorAll('[data-rstep]').forEach(b=>b.onclick=()=>{Sonido.clic();recorridoPaso=Number(b.dataset.rstep);render();});
  $('#op-content [data-rprev]')?.addEventListener('click',()=>{Sonido.clic();recorridoPaso=Math.max(0,recorridoPaso-1);render();});
  $('#op-content [data-rnext]')?.addEventListener('click',()=>{Sonido.clic();recorridoPaso=Math.min((recorridoProceso==='lac'||recorridoProceso==='trp'?4:3)-1,recorridoPaso+1);render();});
  app.querySelectorAll('[data-mol]').forEach(b=>b.onclick=()=>{Sonido.clic();moleculaSel=b.dataset.mol;render();});
  app.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>{Sonido.clic();vista=b.dataset.jump;render();});

  app.querySelectorAll('[data-lactosa]').forEach(b=>b.onclick=()=>{Sonido.clic();lactosa=b.dataset.lactosa==='1';render();});
  app.querySelectorAll('[data-glucosa]').forEach(b=>b.onclick=()=>{Sonido.clic();glucosa=b.dataset.glucosa==='1';render();});
  app.querySelectorAll('[data-trp]').forEach(b=>b.onclick=()=>{Sonido.clic();trp=b.dataset.trp==='1';render();});
  app.querySelectorAll('[data-atten]').forEach(b=>b.onclick=()=>{Sonido.clic();atenuacion=b.dataset.atten==='1';render();});
  app.querySelectorAll('[data-hierro]').forEach(b=>b.onclick=()=>{Sonido.clic();hierro=b.dataset.hierro==='1';render();});
  $('#op-golac')?.addEventListener('click',()=>{Sonido.clic();vista='lac';render();});
  $('#op-gotrp')?.addEventListener('click',()=>{Sonido.clic();vista='trp';render();});
  $('#op-goferritina')?.addEventListener('click',()=>{Sonido.clic();vista='ferritina';render();});
  app.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
   if(respondida)return;Sonido.clic();last=Number(b.dataset.answer);respondida=true;
   if(last===PREGUNTAS[orden[pregunta%orden.length]].c){puntos+=10;racha++;mejor=Math.max(mejor,racha);Sonido.acierto(racha);}else{racha=0;Sonido.error();}
   render();
  });
  $('#op-restart')?.addEventListener('click',()=>{Sonido.clic();orden=[];pregunta=0;completadas=0;puntos=0;racha=0;mejor=0;respondida=false;last=-1;render();});
 }
 render();
}
