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

function sinapsisArt(paso,potencial,bloqueador){
 const ca=paso>=1&&bloqueador!=='calcio',ves=paso>=2&&bloqueador!=='calcio',nt=paso>=3&&bloqueador!=='calcio',post=paso>=3&&bloqueador!=='receptor';
 const vm=potencial==='reposo'?'−70 mV':potencial==='despolarizacion'?'+30 mV':potencial==='repolarizacion'?'−55 mV':'−80 mV';
 let s='<svg viewBox="0 0 620 500" role="img" aria-label="Sinapsis química: propagación del potencial de acción, canales de calcio, vesículas y receptores postsinápticos"><defs><linearGradient id="ccPre"><stop stop-color="#173e55"/><stop offset="1" stop-color="#286a78"/></linearGradient><linearGradient id="ccPost"><stop stop-color="#33295b"/><stop offset="1" stop-color="#62509b"/></linearGradient></defs>';
 s+='<path d="M20 55 H210 Q246 55 246 88 V114" fill="none" stroke="#4FE0A0" stroke-width="22" stroke-linecap="round"/><path d="M20 55 H210 Q246 55 246 88 V114" fill="none" stroke="#d5fff2" stroke-width="2" stroke-dasharray="7 9" class="cc-flow"/><text x="22" y="22" fill="#d8fff5" font-size="14" font-weight="700">Axón · potencial de acción</text>';
 for(let i=0;i<6;i++)s+='<circle class="cc-pulse" style="animation-delay:'+(i*.12)+'s" cx="'+(40+i*30)+'" cy="55" r="4" fill="#FFB938"/>';
 const naOpen=potencial==='despolarizacion',kOpen=potencial==='repolarizacion'||potencial==='hiperpolarizacion';
 s+='<g><rect x="88" y="40" width="18" height="30" rx="4" fill="'+(naOpen?'#4FE0A0':'#29475c')+'" stroke="#d9fff5"/><path d="M93 46 L101 55 L93 64" stroke="#07111f" stroke-width="2" fill="none"/><text x="97" y="87" text-anchor="middle" fill="#b8d4e5" font-size="9">Na⁺</text><rect x="145" y="40" width="18" height="30" rx="4" fill="'+(kOpen?'#FFB938':'#29475c')+'" stroke="#ffe7b5"/><path d="M150 46 L158 55 L150 64" stroke="#07111f" stroke-width="2" fill="none"/><text x="154" y="87" text-anchor="middle" fill="#b8d4e5" font-size="9">K⁺</text></g>';
 s+='<rect x="164" y="114" width="178" height="174" rx="22" fill="url(#ccPre)" stroke="#4FE0A0" stroke-width="2"/><text x="253" y="137" text-anchor="middle" fill="#eafffa" font-size="12" font-weight="700">Terminal presináptica</text>';
 s+='<text x="176" y="158" fill="#9bb2c9" font-size="9">Canales de Ca²⁺ dependientes de voltaje</text>';
 for(let i=0;i<3;i++){const x=193+i*59;s+='<g><rect x="'+(x-8)+'" y="220" width="16" height="32" rx="4" fill="'+(ca?'#4FE0A0':'#3a5368')+'" stroke="#eafffa"/><path d="M'+(x-3)+' 228 L'+(x+3)+' 236 L'+(x-3)+' 244" fill="none" stroke="#0a1727" stroke-width="2"/><text x="'+x+'" y="265" text-anchor="middle" fill="#b8d4e5" font-size="9">Ca²⁺</text></g>';}
 for(let i=0;i<5;i++){const x=190+(i%3)*47,y=176+Math.floor(i/3)*27;s+='<g class="'+(ves&&i===4?'cc-pulse':'')+'"><circle cx="'+x+'" cy="'+y+'" r="11" fill="#493a7c" stroke="#B9A1FF" stroke-width="2"/><circle cx="'+(x-3)+'" cy="'+(y-2)+'" r="2.5" fill="#FFB938"/><circle cx="'+(x+3)+'" cy="'+(y+3)+'" r="2.5" fill="#FFB938"/></g>';}
 s+='<text x="253" y="306" text-anchor="middle" fill="#b8d4e5" font-size="10">Vesículas sinápticas</text><rect x="18" y="321" width="584" height="62" rx="10" fill="#17182f" stroke="#8b79c6" stroke-dasharray="5 5"/><text x="30" y="337" fill="#B9A1FF" font-size="10">HENDIDURA SINÁPTICA</text>';
 if(nt)for(let i=0;i<18;i++)s+='<circle class="cc-pulse" style="animation-delay:'+(i*.06)+'s" cx="'+(34+(i*31)%550)+'" cy="'+(348+(i%3)*10)+'" r="3.5" fill="#FFB938"/>';
 s+='<path d="M18 402 Q65 394 112 402 T206 402 T300 402 T394 402 T488 402 T602 402" stroke="#B9A1FF" stroke-width="17" fill="none" stroke-linecap="round"/><path d="M18 402 Q65 394 112 402 T206 402 T300 402 T394 402 T488 402 T602 402" stroke="#efe9ff" stroke-width="2" fill="none"/><text x="22" y="430" fill="#e9e2ff" font-size="13" font-weight="700">Membrana postsináptica</text>';
 const rr=[{x:165,n:'AMPA',col:'#4FE0A0',on:post&&potencial!=='hiperpolarizacion'},{x:310,n:'NMDA',col:'#FFB938',on:post&&potencial==='despolarizacion'},{x:455,n:'GABA-A',col:'#FF7AA8',on:post}];
 for(const r of rr){s+='<rect x="'+(r.x-14)+'" y="389" width="28" height="29" rx="6" fill="'+(r.on?r.col:'#34485c')+'" stroke="'+r.col+'" stroke-width="2"/><path d="M'+(r.x-4)+' 394 V413 M'+(r.x+4)+' 394 V413" stroke="#07111f" stroke-width="2"/><text x="'+r.x+'" y="451" text-anchor="middle" fill="'+r.col+'" font-size="11" font-weight="700">'+r.n+'</text>';}
 s+='<g><rect x="548" y="389" width="28" height="29" rx="5" fill="#31556c" stroke="#69cfff" stroke-width="2"/><path d="M553 397 H571 M553 405 H571" stroke="#07111f" stroke-width="2"/><text x="562" y="451" text-anchor="middle" fill="#69cfff" font-size="10" font-weight="700">Na⁺/K⁺</text><text x="562" y="468" text-anchor="middle" fill="#9bb2c9" font-size="8">ATPasa</text></g>';
 s+='<text x="165" y="468" text-anchor="middle" fill="#9bb2c9" font-size="9">cationes</text><text x="310" y="468" text-anchor="middle" fill="#9bb2c9" font-size="9">Mg²⁺ depende de Vm</text><text x="455" y="468" text-anchor="middle" fill="#9bb2c9" font-size="9">Cl⁻</text>';
 if(post)s+='<path d="M165 376 V421 M455 376 V421" stroke="#4FE0A0" stroke-width="2" stroke-dasharray="4 4" class="cc-flow"/>';
 s+='<rect x="374" y="113" width="226" height="174" rx="13" fill="#091827" stroke="#29455f"/><text x="390" y="137" fill="#9bb2c9" font-size="10">ESTADO DE LA SIMULACIÓN</text><text x="390" y="164" fill="'+(ca?'#4FE0A0':'#9bb2c9')+'" font-size="15" font-weight="700">Ca²⁺: '+(bloqueador==='calcio'?'bloqueado':ca?'entra':'canal cerrado')+'</text><text x="390" y="190" fill="'+(ves?'#FFB938':'#9bb2c9')+'" font-size="13">Vesículas: '+(bloqueador==='calcio'?'liberación reducida':ves?'fusión activa':'en reserva')+'</text><text x="390" y="215" fill="'+(nt?'#FFB938':'#9bb2c9')+'" font-size="13">Neurotransmisor: '+(nt?'liberado':'no liberado')+'</text><text x="390" y="240" fill="#B9A1FF" font-size="13">Vm: '+vm+'</text><text x="390" y="264" fill="#9bb2c9" font-size="10">Canales Na⁺/K⁺: axón</text>';
 s+='<text x="310" y="491" text-anchor="middle" fill="#7f9bb4" font-size="10">Modelo conceptual · los canales y las distancias no están a escala</text></svg>';
 return s;
}

export function abrirComunicacion({app, volver}) {
 let vista='tipos', indiceCaso=0, aciertos=0, contestada=false, elegida=-1, ronda=[], mIndex=0, mRespuesta=-1, mRevelado=false, paso=0, potencial='reposo', bloqueador='ninguno';
 let intensidadAccion=20, tiempoAccion=0, accionPausada=false, accionTerminada=false, accionFrame=null, accionInicio=0;
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


 .cc-tabs{grid-template-columns:repeat(auto-fit,minmax(118px,1fr))}
 .cc-ap-main{overflow:hidden;background:#1b1b1b;border-color:#292929;color:#f1f1f1}
 .cc-ap-main h2,.cc-ap-main h3{color:#f4f4f4}
 .cc-ap-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:.8rem}
 .cc-ap-head h2{font-size:clamp(1.1rem,4vw,1.45rem);font-weight:500;margin:0 0 .4rem}
 .cc-ap-phase{display:inline-flex;align-items:center;padding:.25rem .55rem;border-radius:99px;background:#292929;color:#e3e3e3;font-size:.72rem}
 .cc-ap-metrics{display:flex;gap:1rem;flex-shrink:0}
 .cc-ap-metric{display:grid;gap:.1rem;color:#aaa;font-size:.68rem}
 .cc-ap-metric strong{color:#f7f7f7;font-size:1.25rem;line-height:1.2;font-weight:600;white-space:nowrap}
 .cc-ap-chart{padding:.35rem .45rem .15rem;border-radius:18px;background:#1c1c1c;border:1px solid #262626}
 .cc-ap-chart svg{display:block;width:100%;height:auto}
 .cc-ap-chart .cc-ap-grid{stroke:#383838;stroke-width:1}
 .cc-ap-chart .cc-ap-grid-label{fill:#999;font-size:12px}
 .cc-ap-chart .cc-ap-time-label{fill:#999;font-size:12px;text-anchor:middle}
 .cc-ap-chart .cc-ap-threshold{stroke:#ef514c;stroke-width:1.6;stroke-dasharray:6 4}
 .cc-ap-chart .cc-ap-threshold-label{fill:#f25c55;font-size:12px}
 .cc-ap-chart .cc-ap-curve{fill:none;stroke:#8ccfff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 3px rgba(140,207,255,.22))}
 .cc-ap-chart .cc-ap-cursor{fill:#9bd5ff;stroke:#d9f0ff;stroke-width:1.5}
 .cc-ap-channels{margin-top:.8rem;padding:.9rem;border-radius:19px;background:#1e1e1e}
 .cc-ap-channels h3{font-size:1.05rem;margin:0 0 .25rem}
 .cc-ap-channel-caption{font-size:.76rem;color:#aaa;margin:0 0 .7rem;line-height:1.4}
 .cc-ap-channel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}
 .cc-ap-channel{min-width:0;padding:.7rem;border-radius:14px;background:#151515;border:1px solid #242424}
 .cc-ap-channel-head{display:flex;align-items:center;justify-content:space-between;gap:.35rem;flex-wrap:wrap}
 .cc-ap-channel-head b{font-size:.86rem}
 .cc-ap-badge{padding:.2rem .45rem;border-radius:99px;background:#292929;color:#eee;font-size:.67rem;white-space:nowrap}
 .cc-ap-badge.open{background:rgba(79,224,160,.15);color:#65e6a7}
 .cc-ap-badge.inactive{background:rgba(255,185,56,.14);color:#ffc65f}
 .cc-ap-art{height:74px;display:flex;align-items:center;justify-content:center;gap:0;margin:.35rem 0}
 .cc-ap-art svg{width:100%;max-width:190px;height:70px}
 .cc-ap-art .cc-ap-membrane{fill:#353535}
 .cc-ap-art .cc-ap-na-gate{fill:#8ccfff;transition:transform .2s,opacity .2s}
 .cc-ap-art .cc-ap-k-gate{fill:#4fe0a0;transition:transform .2s,opacity .2s}
 .cc-ap-art .cc-ap-flow{opacity:0;transition:opacity .2s}
 .cc-ap-art .cc-ap-flow.visible{opacity:1}
 .cc-ap-art .cc-ap-m-na-open{transform:translateY(-7px)}
 .cc-ap-art .cc-ap-h-na-closed{opacity:.35}
 .cc-ap-art .cc-ap-k-open{transform:translateY(-8px)}
 .cc-ap-channel p{margin:.15rem 0 0;color:#aaa;font-size:.72rem;line-height:1.4;min-height:2.5em}
 .cc-ap-controls{padding:.9rem;margin-top:.8rem;border:1px solid #303030;border-radius:18px;background:#1d1d1d}
 .cc-ap-control-row{display:flex;flex-wrap:wrap;gap:.45rem}
 .cc-ap-button{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;padding:.62rem .8rem;border:1px solid #373737;border-radius:99px;background:#1a1a1a;color:#eee;font:700 .78rem/1.2 Inter,system-ui,sans-serif;cursor:pointer}
 .cc-ap-button:hover{border-color:#777}
 .cc-ap-button.active{background:#1c315f;border-color:#85bfff;color:#f4f8ff}
 .cc-ap-button:focus-visible,.cc-ap-range:focus-visible{outline:2px solid #8ccfff;outline-offset:2px}
 .cc-ap-button:disabled{opacity:.5;cursor:default}
 .cc-ap-slider{display:grid;grid-template-columns:1fr auto;gap:.4rem .8rem;margin-top:.9rem;align-items:center}
 .cc-ap-slider label{font-size:.78rem;color:#bcbcbc}
 .cc-ap-slider output{font-weight:800;color:#f4f4f4;font-variant-numeric:tabular-nums}
 .cc-ap-range{grid-column:1/-1;width:100%;accent-color:#8ccfff}
 .cc-ap-experiment-note{margin:.7rem 0 0;color:#aaa;font-size:.76rem;line-height:1.45}
 .cc-ap-phase-panel{margin-top:.8rem;padding:.9rem;border:1px solid var(--linea,#43347A);border-radius:16px;background:var(--panel,#231845)}
 .cc-ap-phase-panel h3{margin:0 0 .2rem;font-size:1rem}
 .cc-ap-phase-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.45rem;margin-top:.7rem}
 .cc-ap-phase-tile{padding:.6rem;border:1px solid var(--linea,#43347A);border-radius:11px;background:var(--noche,#170F2E);min-width:0}
 .cc-ap-phase-tile.active{border-color:#8ccfff;background:rgba(140,207,255,.1)}
 .cc-ap-phase-tile b{display:block;font-size:.76rem;margin-bottom:.2rem}
 .cc-ap-phase-tile small{display:block;color:var(--tenue,#B8ABDB);font-size:.68rem;line-height:1.4}
 .cc-ap-explain-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin-top:.8rem}
 .cc-ap-explain{padding:.85rem;border:1px solid var(--linea,#43347A);border-radius:13px;background:var(--panel,#231845)}
 .cc-ap-explain h3{font-size:.92rem;margin:0 0 .3rem}
 .cc-ap-explain p{margin:0;color:var(--tenue,#B8ABDB);font-size:.8rem;line-height:1.5}
 .cc-ap-explain strong{color:var(--crema,#FFF3DC)}
 .cc-ap-footnote{margin:.7rem 0 0;color:#999;font-size:.72rem;line-height:1.45}
 @media(max-width:620px){
   .cc-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}
   .cc-ap-head{display:block}
   .cc-ap-metrics{margin-top:.65rem;justify-content:flex-start}
   .cc-ap-channel-grid{grid-template-columns:1fr}
   .cc-ap-channel{display:grid;grid-template-columns:1fr 1.1fr;align-items:center;gap:.4rem .7rem}
   .cc-ap-channel-head{grid-column:1/-1}
   .cc-ap-art{grid-column:1;grid-row:2;height:58px}
   .cc-ap-channel p{grid-column:2;grid-row:2;min-height:0}
   .cc-ap-phase-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
   .cc-ap-explain-grid{grid-template-columns:1fr}
 }

 </style>`;
 app.innerHTML=estilos+`<main class="cc-wrap"><button class="cc-back" id="cc-back">← Volver</button><header class="cc-head"><div class="cc-kicker">Biología celular y molecular · interactivo</div><h1>Comunicación celular</h1><p class="cc-muted">Clasificá señales, reconocé la química de los mensajeros y explorá una sinapsis paso a paso.</p></header><nav class="cc-tabs" aria-label="Secciones"><button class="cc-tab" data-view="tipos">🧩 Comunicación</button><button class="cc-tab" data-view="quimica">🧪 Mensajeros</button><button class="cc-tab" data-view="sinapsis">⚡ Sinapsis</button><button class="cc-tab" data-view="potencial">📈 Potencial de acción</button><button class="cc-tab" data-view="conexinas">🔗 Conexinas y gap</button><button class="cc-tab" data-view="repaso">📚 Repaso</button></nav><section id="cc-content"></section></main>`;
 const $=s=>app.querySelector(s);
 $('#cc-back').onclick=()=>{detenerAnimacionPotencial();Sonido.clic();volver();};
 app.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{Sonido.clic();vista=b.dataset.view;render();});
 function render(){
  detenerAnimacionPotencial();
  app.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===vista)));
  if(vista==='tipos')tiposView();else if(vista==='quimica')quimicaView();else if(vista==='sinapsis')sinapsisView();else if(vista==='potencial')potencialAccionView();else if(vista==='conexinas')conexinasView();else repasoView();
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
 function conexinasView(){
  const svg='<svg viewBox="0 0 620 300" role="img" aria-label="Dos conexones formados por seis conexinas se acoplan para conectar los citoplasmas de dos células"><rect x="8" y="18" width="238" height="264" rx="16" fill="#205a69" fill-opacity=".55" stroke="#4fe0a0"/><rect x="374" y="18" width="238" height="264" rx="16" fill="#4b3b80" fill-opacity=".55" stroke="#b9a1ff"/><text x="127" y="43" fill="#d8fff5" text-anchor="middle" font-size="15" font-weight="700">Célula A</text><text x="493" y="43" fill="#e0d6ff" text-anchor="middle" font-size="15" font-weight="700">Célula B</text><rect x="229" y="65" width="12" height="205" rx="6" fill="#55d6b2"/><rect x="379" y="65" width="12" height="205" rx="6" fill="#b9a1ff"/><g transform="translate(290 155)"><circle r="48" fill="#183e4b" stroke="#55d6b2" stroke-width="3"/><circle r="27" fill="#102c39" stroke="#b9fff0" stroke-width="2"/><circle r="11" fill="#ffb938"/><path d="M0 -48 V-27 M41 -24 L23 -13 M41 24 L23 13 M0 48 V27 M-41 24 L-23 13 M-41 -24 L-23 -13" stroke="#b9fff0" stroke-width="7" stroke-linecap="round"/></g><g transform="translate(330 155)"><circle r="48" fill="#34285d" stroke="#b9a1ff" stroke-width="3"/><circle r="27" fill="#20183e" stroke="#e0d6ff" stroke-width="2"/><circle r="11" fill="#ffb938"/><path d="M0 -48 V-27 M41 -24 L23 -13 M41 24 L23 13 M0 48 V27 M-41 24 L-23 13 M-41 -24 L-23 -13" stroke="#e0d6ff" stroke-width="7" stroke-linecap="round"/></g><path d="M310 144 V166 M303 159 L310 166 L317 159" stroke="#ffb938" stroke-width="3" fill="none"/><text x="310" y="78" text-anchor="middle" fill="#fff3dc" font-size="14" font-weight="700">Canal gap</text><text x="310" y="235" text-anchor="middle" fill="#fff3dc" font-size="12">paso directo</text></svg>';
  $('#cc-content').innerHTML='<section class="cc-card cc-syn"><div class="cc-kicker">Uniones comunicantes · gap junctions</div><h2>Conexinas → conexón → canal intercelular</h2><p class="cc-muted">Cada conexón (hemicanal) está formado habitualmente por seis proteínas conexina. Un conexón de una célula se acopla con otro de la célula vecina y forma un canal continuo entre ambos citoplasmas.</p>'+svg+'<div class="cc-feedback"><b>Conexina</b><p>Es una proteína transmembrana que funciona como una subunidad del canal.</p><b>Conexón o hemicanal</b><p>Conjunto habitual de seis conexinas ensambladas en una membrana celular.</p><b>Unión gap</b><p>Acoplamiento de dos conexones enfrentados, uno de cada célula. El canal permite el paso directo de iones y moléculas pequeñas entre citoplasmas, según su tamaño, carga y la permeabilidad del canal.</p></div></section><section class="cc-card"><h2>¿Para qué sirven?</h2><p class="cc-muted">Permiten acoplamiento eléctrico y metabólico. En el músculo cardíaco contribuyen a propagar corrientes iónicas entre células y coordinar su actividad. No son sinapsis químicas: no requieren liberar neurotransmisor en una hendidura extracelular para conectar directamente ambos citoplasmas.</p><div class="cc-note">Precisión: las uniones gap no están siempre abiertas; su permeabilidad puede regularse por factores como voltaje, pH, Ca²⁺ intracelular y el tipo de conexina.</div></section>';
 }

 function detenerAnimacionPotencial(){
  if(accionFrame!==null){cancelAnimationFrame(accionFrame);accionFrame=null;}
 }

 function voltajeAccion(t){
  const supra=intensidadAccion>=15;
  const puntos=supra
   ? [[0,-70],[.38,-70],[.65,-55],[.88,-18],[1.12,30],[1.32,18],[1.62,-18],[1.96,-55],[2.28,-80],[2.85,-75],[3.35,-70],[5,-70]]
   : [[0,-70],[.4,-70],[.72,-70+intensidadAccion],[1.02,-70+intensidadAccion*.88],[1.42,-70+intensidadAccion*.55],[2.05,-70+intensidadAccion*.2],[2.8,-70+intensidadAccion*.04],[3.5,-70],[5,-70]];
  if(t<=0)return puntos[0][1];
  for(let i=1;i<puntos.length;i++){
   if(t<=puntos[i][0]){
    const a=puntos[i-1],b=puntos[i];
    const u=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0])));
    const suave=u*u*(3-2*u);
    return a[1]+(b[1]-a[1])*suave;
   }
  }
  return puntos[puntos.length-1][1];
 }

 function faseAccion(t){
  if(intensidadAccion<15){
   if(t<.4)return {id:'reposo',titulo:'Potencial de reposo',detalle:'La membrana permanece cerca de −70 mV. El interior es relativamente negativo y se mantienen los gradientes de Na⁺ y K⁺.'};
   if(t<1.3)return {id:'subumbral',titulo:'Despolarización local subumbral',detalle:'El estímulo vuelve el interior menos negativo, pero no alcanza el umbral cercano a −55 mV. No se dispara un potencial de acción.'};
   if(t<3.4)return {id:'subumbral',titulo:'Disipación del potencial graduado',detalle:'La respuesta local pierde amplitud con el tiempo y se aproxima nuevamente al potencial de reposo.'};
   return {id:'retorno',titulo:'Retorno al reposo',detalle:'El potencial vuelve a −70 mV. Como no se alcanzó el umbral, no hubo respuesta de todo o nada.'};
  }
  if(t<.65)return {id:'reposo',titulo:'Reposo y llegada del estímulo',detalle:'La membrana parte de unos −70 mV. El estímulo despolarizante lleva el segmento hacia el umbral.'};
  if(t<.82)return {id:'umbral',titulo:'Umbral de disparo',detalle:'Alrededor de −55 mV se activa la apertura regenerativa de canales de Na⁺ dependientes de voltaje.'};
  if(t<1.16)return {id:'despolarizacion',titulo:'Despolarización',detalle:'Se abren rápidamente las compuertas de activación de Na⁺. El sodio entra a favor de su gradiente electroquímico y el voltaje sube.'};
  if(t<1.55)return {id:'pico',titulo:'Pico u overshoot',detalle:'El interior llega a ser positivo (cerca de +30 mV). Los canales de Na⁺ se inactivan y los de K⁺ terminan de abrirse.'};
  if(t<2.15)return {id:'repolarizacion',titulo:'Repolarización',detalle:'Disminuye la entrada de Na⁺ porque sus canales están inactivados; el K⁺ sale por canales dependientes de voltaje y el interior se hace negativo otra vez.'};
  if(t<2.9)return {id:'hiperpolarizacion',titulo:'Hiperpolarización',detalle:'Los canales de K⁺ tardan en cerrarse. Sigue saliendo K⁺ y el potencial cae transitoriamente por debajo de −70 mV.'};
  return {id:'retorno',titulo:'Retorno al reposo',detalle:'Los canales de K⁺ se cierran y los canales de Na⁺ recuperan su estado de reposo. Los gradientes se conservan y mantienen mediante transportadores y la Na⁺/K⁺-ATPasa.'};
 }

 function estadoCanalesAccion(t){
  if(intensidadAccion<15||t<.65)return {
   na:'Cerrado',naClass:'',naTexto:'Compuerta m cerrada y h abierta. El canal está disponible, pero no conduce Na⁺.',
   k:'Cerrado',kClass:'',kTexto:'Canal de K⁺ dependiente de voltaje cerrado.'
  };
  if(t<1.16)return {
   na:'Abierto',naClass:'open',naTexto:'m abierta y h abierta: entra Na⁺ rápidamente y se acelera la despolarización.',
   k:'Cerrado',kClass:'',kTexto:'El canal de K⁺ todavía está cerrado; su apertura es más lenta.'
  };
  if(t<1.55)return {
   na:'Inactivado',naClass:'inactive',naTexto:'La compuerta h se cierra: el canal deja de conducir Na⁺ aunque la membrana siga despolarizada.',
   k:'Abriéndose',kClass:'open',kTexto:'Los canales de K⁺ dependientes de voltaje comienzan a abrirse.'
  };
  if(t<2.15)return {
   na:'Inactivado',naClass:'inactive',naTexto:'El canal de Na⁺ sigue inactivado; todavía no está disponible para otro disparo.',
   k:'Abierto',kClass:'open',kTexto:'Sale K⁺ de la célula y el voltaje regresa a valores negativos.'
  };
  if(t<2.9)return {
   na:'Recuperándose',naClass:'',naTexto:'Los canales de Na⁺ vuelven al estado cerrado y disponible.',
   k:'Cerrándose',kClass:'open',kTexto:'El cierre tardío permite que siga saliendo K⁺ y aparezca la hiperpolarización.'
  };
  return {
   na:'Cerrado',naClass:'',naTexto:'m cerrada y h abierta: estado de reposo, disponible para un nuevo potencial.',
   k:'Cerrado',kClass:'',kTexto:'Los canales de K⁺ de voltaje vuelven al estado cerrado.'
  };
 }

 function actualizarMarcoAccion(t){
  const f=faseAccion(t),v=voltajeAccion(t),supra=intensidadAccion>=15;
  const x0=68,x1=680,y0=28,h=185;
  const px=(ms)=>x0+(ms/5)*(x1-x0);
  const py=(mv)=>y0+((40-mv)/130)*h;
  let d='';
  const pasos=Math.max(1,Math.ceil(t/.035));
  for(let i=0;i<=pasos;i++){
   const ms=t*i/pasos;
   d+=(i?' L':'M')+px(ms).toFixed(2)+' '+py(voltajeAccion(ms)).toFixed(2);
  }
  const path=$('#cc-ap-path'),dot=$('#cc-ap-dot');
  if(path)path.setAttribute('d',d);
  if(dot){dot.setAttribute('cx',px(t).toFixed(2));dot.setAttribute('cy',py(v).toFixed(2));}
  const phase=$('#cc-ap-phase'),vm=$('#cc-ap-vm'),time=$('#cc-ap-time'),detail=$('#cc-ap-detail');
  if(phase)phase.textContent=f.titulo;
  if(vm)vm.textContent=(v>0?'+':'')+Math.round(v)+' mV';
  if(time)time.textContent=t.toFixed(1).replace('.',',')+' ms';
  if(detail)detail.textContent=f.detalle;
  const msg=$('#cc-ap-message');
  if(msg){
   if(t>=5){
    msg.textContent=supra
     ?'Se alcanzó el umbral y se generó un potencial de acción completo. Es una respuesta de todo o nada: un estímulo más intenso no aumenta la amplitud del potencial.'
     :'El estímulo de +'+intensidadAccion+' mV fue subumbral: produjo un potencial local graduado que se disipó, sin generar un potencial de acción.';
   }else if(!supra){
    msg.textContent='El estímulo de +'+intensidadAccion+' mV no alcanza el umbral de −55 mV. La respuesta es local y graduada.';
   }else{
    msg.textContent='Estímulo supraumbral: se está recorriendo la secuencia eléctrica completa de una neurona.';
   }
  }
  document.querySelectorAll('.cc-ap-phase-tile').forEach(el=>el.classList.toggle('active',el.dataset.phase===f.id));
  const canales=estadoCanalesAccion(t);
  const naBadge=$('#cc-ap-na-badge'),naText=$('#cc-ap-na-text'),kBadge=$('#cc-ap-k-badge'),kText=$('#cc-ap-k-text');
  const naM=$('#cc-ap-na-m'),naH=$('#cc-ap-na-h'),naFlow=$('#cc-ap-na-flow');
  const kGate=$('#cc-ap-k-gate'),kFlow=$('#cc-ap-k-flow');
  if(naBadge){naBadge.textContent=canales.na;naBadge.className='cc-ap-badge '+canales.naClass;}
  if(naText)naText.textContent=canales.naTexto;
  if(kBadge){kBadge.textContent=canales.k;kBadge.className='cc-ap-badge '+canales.kClass;}
  if(kText)kText.textContent=canales.kTexto;
  if(naM)naM.setAttribute('class','cc-ap-na-gate '+(canales.na==='Abierto'?'cc-ap-m-na-open':''));
  if(naH)naH.setAttribute('class','cc-ap-na-gate '+(canales.na==='Inactivado'?'cc-ap-h-na-closed':''));
  if(naFlow)naFlow.setAttribute('class','cc-ap-flow '+(canales.na==='Abierto'?'visible':''));
  if(kGate)kGate.setAttribute('class','cc-ap-k-gate '+(canales.k==='Abierto'||canales.k==='Abriéndose'||canales.k==='Cerrándose'?'cc-ap-k-open':''));
  if(kFlow)kFlow.setAttribute('class','cc-ap-flow '+(canales.k==='Abierto'||canales.k==='Abriéndose'||canales.k==='Cerrándose'?'visible':''));
  const weak=$('#cc-ap-weak'),strong=$('#cc-ap-strong'),range=$('#cc-ap-range'),value=$('#cc-ap-intensity');
  if(weak)weak.classList.toggle('active',!supra);
  if(strong)strong.classList.toggle('active',supra);
  if(range&&Number(range.value)!==intensidadAccion)range.value=String(intensidadAccion);
  if(value)value.textContent='+'+intensidadAccion+' mV';
 }

 function iniciarAnimacionPotencial(reiniciar){
  detenerAnimacionPotencial();
  if(reiniciar){tiempoAccion=0;accionTerminada=false;}
  accionPausada=false;
  accionInicio=performance.now()-(tiempoAccion/5)*3900;
  actualizarMarcoAccion(tiempoAccion);
  const cuadro=(ahora)=>{
   if(accionPausada||vista!=='potencial'){accionFrame=null;return;}
   tiempoAccion=Math.min(5,((ahora-accionInicio)/3900)*5);
   actualizarMarcoAccion(tiempoAccion);
   if(tiempoAccion>=5){accionTerminada=true;accionFrame=null;const b=$('#cc-ap-pause');if(b)b.textContent='↻ Repetir';return;}
   accionFrame=requestAnimationFrame(cuadro);
  };
  accionFrame=requestAnimationFrame(cuadro);
  const b=$('#cc-ap-pause');if(b)b.textContent='Ⅱ Pausar';
 }

 function seleccionarEstimulo(valor){
  intensidadAccion=valor;
  const range=$('#cc-ap-range');
  if(range)range.value=String(valor);
  iniciarAnimacionPotencial(true);
  Sonido.clic();
 }

 function potencialAccionView(){
  const y=(v)=>28+((40-v)/130)*185;
  const x=(t)=>68+(t/5)*612;
  const yTicks=[40,0,-55,-70,-85].map(v=>
   '<g><line class="cc-ap-grid" x1="68" x2="680" y1="'+y(v)+'" y2="'+y(v)+'"/><text class="cc-ap-grid-label" x="4" y="'+(y(v)+4)+'">'+v+' mV</text></g>'
  ).join('');
  const xTicks=[0,1,2,3,4,5].map(t=>
   '<g><line class="cc-ap-grid" x1="'+x(t)+'" x2="'+x(t)+'" y1="28" y2="213"/><text class="cc-ap-time-label" x="'+x(t)+'" y="235">'+t+' ms</text></g>'
  ).join('');
  const fases=[
   ['reposo','Reposo','≈ −70 mV; interior negativo.'],
   ['umbral','Umbral','≈ −55 mV; dispara la respuesta.'],
   ['subumbral','Potencial local','Graduado; no llega al umbral.'],
   ['despolarizacion','Despolarización','Entra Na⁺; el voltaje sube.'],
   ['pico','Pico','Na⁺ se inactiva; K⁺ abre.'],
   ['repolarizacion','Repolarización','Sale K⁺; vuelve la negatividad.'],
   ['hiperpolarizacion','Hiperpolarización','K⁺ sigue saliendo un poco más.'],
   ['retorno','Retorno','Se recupera el reposo.']
  ];
  const faseHtml=fases.map(f=>
   '<div class="cc-ap-phase-tile" data-phase="'+f[0]+'"><b>'+f[1]+'</b><small>'+f[2]+'</small></div>'
  ).join('');
  $('#cc-content').innerHTML=
   '<section class="cc-card cc-ap-main">'+
    '<header class="cc-ap-head"><div><h2>Potencial de Acción Neuronal</h2><span class="cc-ap-phase" id="cc-ap-phase">Reposo y llegada del estímulo</span></div>'+
     '<div class="cc-ap-metrics"><div class="cc-ap-metric">Voltaje (Vₘ)<strong id="cc-ap-vm">−70 mV</strong></div><div class="cc-ap-metric">Tiempo<strong id="cc-ap-time">0,0 ms</strong></div></div></header>'+
    '<div class="cc-ap-chart"><svg viewBox="0 0 700 250" role="img" aria-label="Gráfico animado de voltaje de membrana durante un potencial de acción, con umbral en menos 55 milivoltios">'+
     yTicks+xTicks+
     '<line class="cc-ap-threshold" x1="68" x2="680" y1="'+y(-55)+'" y2="'+y(-55)+'"/>'+
     '<text class="cc-ap-threshold-label" x="675" y="'+(y(-55)-7)+'" text-anchor="end">Umbral (−55 mV)</text>'+
     '<path id="cc-ap-path" class="cc-ap-curve" d=""/><circle id="cc-ap-dot" class="cc-ap-cursor" cx="68" cy="'+y(-70)+'" r="4"/></svg></div>'+
    '<section class="cc-ap-channels"><h3>Canales iónicos y transporte</h3><p class="cc-ap-channel-caption" id="cc-ap-detail">En reposo: el interior neuronal se mantiene alrededor de −70 mV.</p>'+
     '<div class="cc-ap-channel-grid">'+
      '<article class="cc-ap-channel"><div class="cc-ap-channel-head"><b>Canal Na⁺</b><span class="cc-ap-badge" id="cc-ap-na-badge">Cerrado</span></div>'+
       '<div class="cc-ap-art"><svg viewBox="0 0 190 70" role="img" aria-label="Canal de sodio con compuertas de activación m e inactivación h">'+
        '<rect class="cc-ap-membrane" x="4" y="25" width="48" height="20" rx="6"/><rect class="cc-ap-membrane" x="138" y="25" width="48" height="20" rx="6"/>'+
        '<rect id="cc-ap-na-m" class="cc-ap-na-gate" x="62" y="14" width="14" height="42" rx="7"/><rect id="cc-ap-na-h" class="cc-ap-na-gate" x="112" y="14" width="14" height="42" rx="7"/>'+
        '<path id="cc-ap-na-flow" class="cc-ap-flow" d="M94 5 V59 M88 52 L94 60 L100 52" stroke="#8ccfff" stroke-width="3" fill="none"/>'+
        '<text x="69" y="68" fill="#aaa" font-size="9" text-anchor="middle">m</text><text x="119" y="68" fill="#aaa" font-size="9" text-anchor="middle">h</text></svg></div>'+
       '<p id="cc-ap-na-text">Compuerta m cerrada y h abierta. El canal está disponible, pero no conduce Na⁺.</p></article>'+
      '<article class="cc-ap-channel"><div class="cc-ap-channel-head"><b>Canal K⁺</b><span class="cc-ap-badge" id="cc-ap-k-badge">Cerrado</span></div>'+
       '<div class="cc-ap-art"><svg viewBox="0 0 190 70" role="img" aria-label="Canal de potasio dependiente de voltaje">'+
        '<rect class="cc-ap-membrane" x="4" y="25" width="48" height="20" rx="6"/><rect class="cc-ap-membrane" x="138" y="25" width="48" height="20" rx="6"/>'+
        '<rect id="cc-ap-k-gate" class="cc-ap-k-gate" x="72" y="14" width="15" height="42" rx="7"/><rect class="cc-ap-k-gate" x="104" y="14" width="15" height="42" rx="7"/>'+
        '<path id="cc-ap-k-flow" class="cc-ap-flow" d="M95 60 V6 M89 14 L95 6 L101 14" stroke="#4fe0a0" stroke-width="3" fill="none"/>'+
       '</svg></div><p id="cc-ap-k-text">Canal de K⁺ dependiente de voltaje cerrado.</p></article>'+
      '<article class="cc-ap-channel"><div class="cc-ap-channel-head"><b>Bomba Na⁺/K⁺</b><span class="cc-ap-badge open">Activa · ATP</span></div>'+
       '<div class="cc-ap-art"><svg viewBox="0 0 190 70" role="img" aria-label="Bomba sodio potasio que expulsa tres sodios e introduce dos potasios">'+
        '<rect class="cc-ap-membrane" x="4" y="25" width="48" height="20" rx="6"/><rect class="cc-ap-membrane" x="138" y="25" width="48" height="20" rx="6"/>'+
        '<rect x="72" y="14" width="46" height="42" rx="14" fill="#252525" stroke="#aaa" stroke-width="1.5"/>'+
        '<path d="M88 47 V18 M82 25 L88 17 L94 25" stroke="#8ccfff" stroke-width="2.7" fill="none"/><path d="M104 19 V48 M98 41 L104 49 L110 41" stroke="#4fe0a0" stroke-width="2.7" fill="none"/></svg></div>'+
       '<p>3 Na⁺ salen y 2 K⁺ entran por ATP; mantiene los gradientes iónicos.</p></article>'+
     '</div></section>'+
    '<section class="cc-ap-controls"><div class="cc-ap-control-row">'+
     '<button type="button" class="cc-ap-button" id="cc-ap-weak">ϟ Estímulo débil (subumbral)</button>'+
     '<button type="button" class="cc-ap-button active" id="cc-ap-strong">ϟ Estímulo fuerte (supraumbral)</button>'+
     '<button type="button" class="cc-ap-button" id="cc-ap-pause">Ⅱ Pausar</button>'+
     '<button type="button" class="cc-ap-button" id="cc-ap-reset">↻ Reiniciar</button></div>'+
     '<div class="cc-ap-slider"><label for="cc-ap-range">Intensidad del estímulo aplicado</label><output id="cc-ap-intensity">+20 mV</output>'+
      '<input class="cc-ap-range" id="cc-ap-range" type="range" min="0" max="25" step="1" value="'+intensidadAccion+'"/></div>'+
     '<p class="cc-ap-experiment-note" id="cc-ap-message">El estímulo supera el umbral y genera un potencial de acción completo.</p></section>'+
   '</section>'+
   '<section class="cc-ap-phase-panel"><h3>Fases del potencial de acción</h3><p class="cc-muted">Observá qué cambia en la membrana a medida que avanza la curva.</p><div class="cc-ap-phase-grid">'+faseHtml+'</div></section>'+
   '<section class="cc-ap-explain-grid">'+
    '<article class="cc-ap-explain"><h3>1. Reposo y gradientes</h3><p>El potencial suele ser cercano a <strong>−70 mV</strong>. Hay más Na⁺ y Ca²⁺ afuera, y más K⁺ adentro. La permeabilidad selectiva, los canales de fuga y los gradientes electroquímicos explican el voltaje.</p></article>'+
    '<article class="cc-ap-explain"><h3>2. Umbral y todo o nada</h3><p>Alrededor de <strong>−55 mV</strong> se abren suficientes canales de Na⁺ para producir una despolarización regenerativa. Si el umbral no se alcanza, queda un potencial local graduado; si se alcanza, se dispara el potencial completo.</p></article>'+
    '<article class="cc-ap-explain"><h3>3. Repolarización</h3><p>Los canales de Na⁺ se inactivan y los de K⁺ se abren con retraso. La <strong>salida de K⁺</strong> hace que el interior vuelva a ser negativo. La bomba Na⁺/K⁺ no produce esta caída rápida.</p></article>'+
    '<article class="cc-ap-explain"><h3>4. Períodos refractarios</h3><p><strong>Absoluto:</strong> los canales de Na⁺ inactivados impiden otro potencial. <strong>Relativo:</strong> durante la hiperpolarización puede iniciarse otro, pero hace falta un estímulo mayor.</p></article>'+
    '<article class="cc-ap-explain"><h3>5. Propagación por el axón</h3><p>Las corrientes locales despolarizan el segmento vecino. La región que acaba de activarse queda refractaria, favoreciendo el avance hacia adelante. En axones mielinizados, la conducción es saltatoria entre nodos de Ranvier.</p></article>'+
    '<article class="cc-ap-explain"><h3>6. Conexión con la sinapsis</h3><p>Cuando el potencial llega a la terminal presináptica, abre canales de <strong>Ca²⁺ dependientes de voltaje</strong>. El Ca²⁺ que entra desencadena la fusión de vesículas y la liberación del neurotransmisor.</p></article>'+
   '</section>'+
   '<p class="cc-ap-footnote">Modelo didáctico de una neurona típica. Los valores de −70 mV, −55 mV y +30 mV, así como los tiempos, son aproximados y varían según el tipo celular.</p>';

  $('#cc-ap-weak').onclick=()=>seleccionarEstimulo(10);
  $('#cc-ap-strong').onclick=()=>seleccionarEstimulo(20);
  $('#cc-ap-range').addEventListener('input',e=>{
   intensidadAccion=Number(e.target.value);
   iniciarAnimacionPotencial(true);
  });
  $('#cc-ap-pause').onclick=()=>{
   if(accionTerminada){iniciarAnimacionPotencial(true);return;}
   if(!accionPausada){
    accionPausada=true;detenerAnimacionPotencial();
    $('#cc-ap-pause').textContent='▶ Reanudar';
   }else iniciarAnimacionPotencial(false);
   Sonido.clic();
  };
  $('#cc-ap-reset').onclick=()=>{iniciarAnimacionPotencial(true);Sonido.clic();};
  iniciarAnimacionPotencial(true);
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
  const carga=potencial==='reposo'?'−70 mV aprox.':potencial==='despolarizacion'?'+30 mV aprox.':potencial==='repolarizacion'?'−55 mV aprox.':'−80 mV aprox.';
  $('#cc-content').innerHTML=`<section class="cc-card cc-syn"><div class="cc-kicker">Vista anatómica + detalle molecular</div><h2>Una sinapsis, dos neuronas</h2><p class="cc-muted">Esquema conceptual, no a escala. Avanzá para observar qué estructura interviene en cada etapa.</p>${sinapsisArt(paso,potencial,bloqueador)}<div class="cc-feedback"><b>${titulo[0]}</b><p>${titulo[1]}</p></div><div class="cc-row"><button class="cc-secondary" id="cc-prev" ${paso===0?'disabled':''}>← Anterior</button><button class="cc-primary" id="cc-next-s">${paso===5?'Reiniciar':'Siguiente etapa →'}</button></div></section><section class="cc-card"><h2>Condiciones del experimento</h2><p class="cc-muted">Cambiá una condición y observá la predicción de la simulación.</p><div class="cc-row"><button class="cc-choice" data-pot="reposo" aria-pressed="${potencial==='reposo'}">Reposo</button><button class="cc-choice" data-pot="despolarizacion" aria-pressed="${potencial==='despolarizacion'}">Despolarización</button><button class="cc-choice" data-pot="repolarizacion">Repolarización</button><button class="cc-choice" data-pot="hiperpolarizacion" aria-pressed="${potencial==='hiperpolarizacion'}">Hiperpolarización</button></div><div class="cc-ions" style="margin-top:.7rem"><div><b>Na⁺</b><small>Más concentrado afuera</small></div><div><b>K⁺</b><small>Más concentrado adentro</small></div><div><b>Ca²⁺</b><small>Mucho más afuera que en el citosol</small></div></div><p class="cc-muted">Potencial de referencia: ${carga}. Los valores varían entre tipos celulares y condiciones.</p><div class="cc-row"><button class="cc-choice" data-block="ninguno" aria-pressed="${bloqueador==='ninguno'}">Sin bloqueo</button><button class="cc-choice" data-block="calcio" aria-pressed="${bloqueador==='calcio'}">Bloquear Ca²⁺</button><button class="cc-choice" data-block="receptor" aria-pressed="${bloqueador==='receptor'}">Bloquear receptor</button></div><div class="cc-note" style="margin-top:.7rem">${bloqueador==='calcio'?'Sin entrada de Ca²⁺ presináptico, la liberación vesicular desencadenada por el potencial de acción queda muy reducida o impedida.':bloqueador==='receptor'?'El neurotransmisor puede liberarse, pero el receptor postsináptico bloqueado no transmite la señal por esa vía.':'La Na⁺/K⁺-ATPasa mantiene gradientes: expulsa 3 Na⁺ e introduce 2 K⁺ por ATP. Los canales de voltaje producen las fases rápidas del potencial de acción; la bomba no las genera directamente.'}</div></section>`;
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
