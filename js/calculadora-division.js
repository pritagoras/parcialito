const css = `
.divcalc{--dc-line:#294578;--dc-muted:#aebfe0;color:#edf3ff;max-width:1120px;margin:auto;padding:clamp(13px,3vw,28px);font:15px/1.55 system-ui,sans-serif}
.divcalc *{box-sizing:border-box}.divcalc button,.divcalc input,.divcalc select{font:inherit}
.divcalc button{cursor:pointer;color:#edf3ff;background:#10234a;border:1px solid #34558e;border-radius:11px;padding:9px 13px}
.divcalc button:hover{border-color:#8caeff}.divcalc button:focus-visible,.divcalc input:focus-visible,.divcalc select:focus-visible{outline:2px solid #63e8c3;outline-offset:2px}
.divcalc .dc-back{background:transparent;border-radius:999px;margin-bottom:18px}
.divcalc .dc-head{margin-bottom:20px}.divcalc .dc-kicker{font-size:10px;letter-spacing:.14em;font-weight:850;color:#7ee6cf}
.divcalc h1{font-size:clamp(26px,4vw,38px);letter-spacing:-.035em;line-height:1.12;margin:6px 0}
.divcalc .dc-intro{color:var(--dc-muted);max-width:76ch;margin:8px 0}
.divcalc .dc-card{border:1px solid var(--dc-line);border-radius:17px;background:linear-gradient(145deg,#102345,#09152b);padding:clamp(13px,2.6vw,22px);margin:14px 0}
.divcalc .dc-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:end}
.divcalc label{display:grid;gap:6px;color:#b9c9e8;font-size:12px;font-weight:700}
.divcalc input,.divcalc select{width:100%;min-width:0;border:1px solid #385888;background:#07152d;color:#f4f7ff;border-radius:10px;padding:11px 10px}
.divcalc .dc-segment{display:flex;gap:6px}.divcalc .dc-segment button{flex:1}.divcalc .dc-segment button.on,.divcalc .dc-tabs button.on{background:#234b82;border-color:#77a8f4;color:white}
.divcalc .dc-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:15px}
.divcalc .dc-metric{border:1px solid #294675;border-radius:12px;padding:11px;background:#091831}
.divcalc .dc-metric span{display:block;color:#9fb5dc;font-size:11px}.divcalc .dc-metric b{display:block;font-size:19px;margin-top:3px;color:#f3f6ff}
.divcalc .dc-tabs{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}.divcalc .dc-tabs button{font-size:13px}
.divcalc .dc-warning{padding:12px 14px;border:1px solid #80633c;background:#302619;color:#ffdfad;border-radius:12px;margin:12px 0;font-size:13px}
.divcalc .dc-stage-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
.divcalc .dc-stage-head h2{font-size:21px;margin:0 0 3px}.divcalc .dc-stage-head p{margin:0;color:var(--dc-muted);font-size:13px}
.divcalc .dc-pill{border:1px solid #326b69;color:#8cebd3;background:#0c302f;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800}
.divcalc .dc-table-wrap{overflow-x:auto;margin-top:14px}.divcalc table{width:100%;border-collapse:collapse;min-width:620px}
.divcalc th,.divcalc td{text-align:left;padding:11px 12px;border-bottom:1px solid #203963;font-size:13px}
.divcalc th{color:#9fb9e9;font-size:11px;letter-spacing:.04em;text-transform:uppercase;background:#0a1a35}
.divcalc td strong{font-size:16px;color:#f3f6ff}.divcalc tr.current{background:#14305a}
.divcalc .dc-stage-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:15px}
.divcalc .dc-stage-list button{text-align:left;min-height:58px;padding:9px 11px;font-size:12px}
.divcalc .dc-stage-list button.on{background:#1d4074;border-color:#8baeff}
.divcalc .dc-stage-list small{display:block;color:#a9bee7;margin-top:3px}
.divcalc .dc-explain{color:#bdcbea;font-size:13px;margin:12px 0 0}
.divcalc .dc-foot{color:#9eb3da;font-size:12px;margin:12px 0 0}
@media(max-width:760px){.divcalc .dc-controls{grid-template-columns:1fr 1fr}.divcalc .dc-summary{grid-template-columns:1fr 1fr}.divcalc .dc-stage-list{grid-template-columns:1fr 1fr}}
@media(max-width:430px){.divcalc .dc-controls{grid-template-columns:1fr}.divcalc .dc-stage-list{grid-template-columns:1fr}}
`;

const mitosisStages = [
 ['Interfase · G₁','Antes de la fase S','La célula tiene cromosomas no duplicados.','same'],
 ['Fase S','Replicación del ADN','Se duplica el ADN; cada cromosoma pasa a tener dos cromátidas hermanas.','replicated'],
 ['Interfase · G₂','Preparación para mitosis','La ploidía no cambia: solo se duplicó el ADN.','replicated'],
 ['Profase temprana','Condensación inicial','Los cromosomas duplicados comienzan a condensarse.','replicated'],
 ['Profase tardía · prometafase','Ruptura de la envoltura nuclear','Los microtúbulos del huso acceden a los cromosomas.','replicated'],
 ['Metafase','Alineación ecuatorial','Cada cromosoma duplicado se alinea individualmente.','replicated'],
 ['Anafase temprana','Separación de cromátidas hermanas','Cada cromátida separada pasa a contarse como cromosoma independiente.','mitotic-anaphase'],
 ['Anafase tardía','Migración hacia los polos','Los cromosomas hijos se alejan hacia polos opuestos.','mitotic-anaphase'],
 ['Telofase temprana','Reformación de los núcleos','Cada polo recibe una dotación completa; los cromosomas empiezan a descondensarse.','daughter-nuclei'],
 ['Telofase tardía','Dos núcleos hijos','La cariocinesis termina; cada núcleo tiene la dotación inicial.','daughter-nuclei'],
 ['Citocinesis','Separación del citoplasma','Se forman dos células hijas genéticamente equivalentes en la mitosis típica.','daughter-cells']
];
const meiosisStages = [
 ['Interfase · G₁','Antes de la fase S','La célula diploide contiene pares de homólogos no duplicados.','same'],
 ['Fase S','Única replicación de ADN','Cada cromosoma duplica su ADN. No habrá otra fase S antes de meiosis II.','replicated'],
 ['Interfase · G₂','Preparación para meiosis I','Los homólogos están duplicados y podrán aparearse.','replicated'],
 ['Profase I · leptoteno','Condensación de cromosomas','Los cromosomas duplicados comienzan a hacerse visibles.','replicated'],
 ['Profase I · cigoteno','Sinapsis de homólogos','Los cromosomas homólogos comienzan a aparearse.','replicated'],
 ['Profase I · paquiteno','Tétradas y crossing-over','Ocurre recombinación entre cromátidas no hermanas de homólogos.','replicated'],
 ['Profase I · diploteno','Quiasmas visibles','Los homólogos comienzan a separarse, pero permanecen unidos en los quiasmas.','replicated'],
 ['Profase I · diacinesis','Máxima condensación','Se completa la preparación para la metafase I.','replicated'],
 ['Metafase I','Alineación de pares homólogos','Los bivalentes se orientan en el plano ecuatorial.','replicated'],
 ['Anafase I','Separación de homólogos','Los homólogos migran a polos opuestos; las cromátidas hermanas siguen unidas.','meiosis-anaphase1'],
 ['Telofase I','Llegada a los polos','Cada polo recibe un juego haploide de cromosomas duplicados.','meiosis-products1'],
 ['Citocinesis I','Dos células haploides','Cada célula tiene n cromosomas, todavía con dos cromátidas cada uno.','meiosis-products1'],
 ['Intercinesis','Intervalo entre divisiones','No hay replicación de ADN. Puede reconstruirse parcialmente la envoltura nuclear.','meiosis-products1'],
 ['Profase II','Nuevo huso en cada célula','Cada una de las dos células haploides organiza un nuevo huso.','meiosis-products1'],
 ['Metafase II','Alineación individual','Los cromosomas se alinean individualmente en cada célula.','meiosis-products1'],
 ['Anafase II','Separación de cromátidas','Las cromátidas hermanas se separan y pasan a ser cromosomas independientes.','meiosis-anaphase2'],
 ['Telofase II','Reformación de núcleos','Se forman cuatro núcleos haploides con cromosomas no duplicados.','meiosis-products2'],
 ['Citocinesis II','Cuatro productos haploides','Se completa la división del citoplasma y quedan cuatro células.','meiosis-products2']
];

export function abrirCalculadoraDivision({app,volver}={}) {
 let ploidy='diploide', n=23, process='mitosis', index=0;
 const count=(stage)=>{
   const p=ploidy==='diploide'?2:1, start=n*p;
   if(process==='mitosis'){
     if(stage==='same')return {cell:1,chrom:start,chromatids:start,dna:p};
     if(stage==='replicated')return {cell:1,chrom:start,chromatids:start*2,dna:p*2};
     if(stage==='mitotic-anaphase')return {cell:1,chrom:start*2,chromatids:start*2,dna:p*2,perPole:[start,start,p]};
     if(stage==='daughter-nuclei')return {cell:1,nuclei:2,chrom:start,chromatids:start,dna:p};
     return {cell:2,chrom:start,chromatids:start,dna:p};
   }
   if(ploidy==='haploide'){if(stage==='same')return {cell:1,chrom:n,chromatids:n,dna:1};if(stage==='replicated')return {cell:1,chrom:n,chromatids:n*2,dna:2};return null;}
   if(stage==='same')return {cell:1,chrom:start,chromatids:start,dna:2};
   if(stage==='replicated')return {cell:1,chrom:start,chromatids:start*2,dna:4};
   if(stage==='meiosis-anaphase1')return {cell:1,chrom:start,chromatids:start*2,dna:4,perPole:[n,n*2,2]};
   if(stage==='meiosis-products1')return {cell:2,chrom:n,chromatids:n*2,dna:2};
   if(stage==='meiosis-anaphase2')return {cell:2,chrom:n*2,chromatids:n*2,dna:2,perPole:[n,n,1]};
   return {cell:4,chrom:n,chromatids:n,dna:1};
 };
 const currentStages=()=>process==='mitosis'?mitosisStages:meiosisStages;
 function render(){
   const stages=currentStages();index=Math.max(0,Math.min(index,stages.length-1));
   const st=stages[index],v=count(st[3]),human=ploidy==='diploide'&&n===23;
   const fmt=x=>x.toLocaleString('es-AR');
   const metrics=v?[
     [v.nuclei?'Núcleos en la célula':'Células / productos',v.nuclei||v.cell],
     ['Cromosomas por célula',v.chrom],
     ['Cromátides por célula',v.chromatids],
     ['ADN total por célula',v.dna+'C']
   ]:[['Células', '1 → 2 → 4'],['Cromosomas','No aplicable'],['Cromátides','No aplicable'],['ADN','No aplicable']];
   app.innerHTML='<main class="divcalc"><button class="dc-back" id="dc-back">← Volver al laboratorio</button><header class="dc-head"><div class="dc-kicker">PARCIALITO LAB · HERRAMIENTA DE CÁLCULO</div><h1>Calculadora de cromosomas y ADN</h1><p class="dc-intro">Elegí la ploidía, definí cuántos cromosomas tiene un juego haploide (n) y recorré cada etapa. Los valores se recalculan en tiempo real.</p></header>'+
    '<section class="dc-card"><div class="dc-controls"><label>Ploidía inicial<div class="dc-segment"><button type="button" data-ploidy="haploide" class="'+(ploidy==='haploide'?'on':'')+'">Haploide (n)</button><button type="button" data-ploidy="diploide" class="'+(ploidy==='diploide'?'on':'')+'">Diploide (2n)</button></div></label><label>Número de cromosomas por juego (n)<input id="dc-n" type="number" min="1" max="1000" step="1" value="'+n+'"></label><label>Proceso<select id="dc-process"><option value="mitosis" '+(process==='mitosis'?'selected':'')+'>Mitosis</option><option value="meiosis" '+(process==='meiosis'?'selected':'')+'>Meiosis I y II</option></select></label><label>Ejemplo humano<input value="'+(human?'Humano: 2n = 46 / n = 23':'Personalizado')+'" readonly></label></div>'+
    '<div class="dc-summary"><div class="dc-metric"><span>Dotación inicial</span><b>'+(ploidy==='diploide'?'2n':'n')+' = '+(ploidy==='diploide'?2*n:n)+'</b></div><div class="dc-metric"><span>Cromátides antes de S</span><b>'+(ploidy==='diploide'?2*n:n)+'</b></div><div class="dc-metric"><span>ADN antes de S</span><b>'+(ploidy==='diploide'?'2C':'1C')+'</b></div><div class="dc-metric"><span>Tras fase S</span><b>'+(ploidy==='diploide'?'4C':'2C')+'</b></div></div></section>'+
    (process==='meiosis'&&ploidy==='haploide'?'<div class="dc-warning"><b>Importante:</b> la meiosis convencional requiere pares de cromosomas homólogos. Una célula haploide no tiene esos pares; por eso no puede realizar una meiosis I reduccional normal. Para estudiar el proceso meiótico estándar, seleccioná diploide.</div>':'')+
    '<section class="dc-card"><div class="dc-stage-head"><div><h2>'+st[0]+'</h2><p>'+st[1]+'</p></div><span class="dc-pill">'+(process==='mitosis'?'MITOSIS':'MEIOSIS I · II')+'</span></div><p class="dc-explain">'+st[2]+'</p>'+
    '<div class="dc-summary">'+metrics.map(([a,b])=>'<div class="dc-metric"><span>'+a+'</span><b>'+b+'</b></div>').join('')+'</div>'+
    (v&&v.perPole?'<p class="dc-foot">Por cada polo: '+fmt(v.perPole[0])+' cromosomas · '+fmt(v.perPole[1])+' cromátides · '+v.perPole[2]+'C de ADN.</p>':'')+
    '<div class="dc-controls" style="margin-top:16px;grid-template-columns:auto 1fr auto"><button id="dc-prev" '+(!index?'disabled':'')+'>← Anterior</button><label>Etapa<select id="dc-stage">'+stages.map((x,i)=>'<option value="'+i+'" '+(i===index?'selected':'')+'>'+(i+1)+'. '+x[0]+'</option>').join('')+'</select></label><button id="dc-next" '+(index===stages.length-1?'disabled':'')+'>Siguiente →</button></div>'+
    '<div class="dc-stage-list">'+stages.map((x,i)=>'<button type="button" data-stage="'+i+'" class="'+(i===index?'on':'')+'">'+(i+1)+'. '+x[0]+'<small>'+x[1]+'</small></button>').join('')+'</div></section>'+
    '<p class="dc-foot">Convención: “cromosomas” cuenta centrómeros. Antes de separar cromátidas hermanas, un cromosoma duplicado cuenta como 1 cromosoma y 2 cromátidas. C representa el contenido de ADN relativo a un juego haploide no replicado.</p>';
   app.querySelector('#dc-back').onclick=volver;
   app.querySelectorAll('[data-ploidy]').forEach(b=>b.onclick=()=>{ploidy=b.dataset.ploidy;render()});
   app.querySelector('#dc-n').onchange=e=>{const x=Math.max(1,Math.min(1000,Math.floor(Number(e.target.value)||1)));n=x;e.target.value=x;render()};
   app.querySelector('#dc-process').onchange=e=>{process=e.target.value;index=0;render()};
   app.querySelector('#dc-prev').onclick=()=>{index=Math.max(0,index-1);render()};
   app.querySelector('#dc-next').onclick=()=>{index=Math.min(stages.length-1,index+1);render()};
   app.querySelector('#dc-stage').onchange=e=>{index=Number(e.target.value);render()};
   app.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.stage);render()});
 }
 if(!document.getElementById('division-calculator-css')){const s=document.createElement('style');s.id='division-calculator-css';s.textContent=css;document.head.appendChild(s)}
 render();
}
