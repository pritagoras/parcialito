
export function abrirCantidadADN({app,volver}={}){
  let proceso='meiosis';
  const modelos={
    mitosis:{
      titulo:'Mitosis',
      sub:'Una replicación y una división; se conserva la ploidía.',
      color:'#72a7ff',
      path:'M100 213 L220 213 L340 105 L455 105 L585 105 L715 213 L850 213',
      puntos:[
        {x:100,y:213,label:'G₁'},
        {x:220,y:213,label:'Inicio S'},
        {x:340,y:105,label:'Fin S'},
        {x:455,y:105,label:'G₂'},
        {x:585,y:105,label:'Mitosis'},
        {x:715,y:213,label:'Citocinesis'},
        {x:850,y:213,label:'Célula hija'}
      ],
      pathCompacto:'M85 213 L145 105 L205 105 L265 105 L325 213 L380 213',
      puntosCompactos:[
        {x:85,y:213,label:'G₁'},
        {x:145,y:105,label:'Fin S'},
        {x:205,y:105,label:'G₂'},
        {x:265,y:105,label:'M'},
        {x:325,y:213,label:'Cito.'},
        {x:380,y:213,label:'Hijas'}
      ],
      nota:'El ADN se duplica en la fase S, pero la célula continúa siendo diploide (2n). Antes de terminar la división, el contenido total llega a 4C. Tras la citocinesis, cada célula hija queda con 2n y 2C de ADN.',
      etapas:[
        {n:'G₁',v:'2n · 2C',d:'La célula aún no duplicó el ADN.'},
        {n:'Fase S',v:'2n · 2C → 4C',d:'Se replica cada molécula de ADN.'},
        {n:'G₂',v:'2n · 4C',d:'Cada cromosoma tiene dos cromátidas.'},
        {n:'Mitosis',v:'4C en la célula',d:'Se separan las cromátidas hermanas.'},
        {n:'Tras citocinesis',v:'2n · 2C por hija',d:'Cada hija recibe una dotación equivalente.'}
      ]
    },
    meiosis:{
      titulo:'Meiosis y fecundación',
      sub:'Una replicación, dos divisiones y después la unión de dos gametos.',
      color:'#63e8c3',
      path:'M100 213 L220 213 L340 105 L455 105 L590 213 L725 295 L850 295',
      puntos:[
        {x:100,y:213,label:'G₁'},
        {x:220,y:213,label:'Inicio S'},
        {x:340,y:105,label:'Fin S'},
        {x:455,y:105,label:'G₂'},
        {x:590,y:213,label:'Tras meiosis I'},
        {x:725,y:295,label:'Tras meiosis II'},
        {x:850,y:295,label:'Gametos'}
      ],
      pathCompacto:'M85 213 L145 105 L205 105 L265 213 L325 295 L380 295',
      puntosCompactos:[
        {x:85,y:213,label:'G₁'},
        {x:145,y:105,label:'Fin S'},
        {x:205,y:105,label:'G₂'},
        {x:265,y:213,label:'Tras MI'},
        {x:325,y:295,label:'Tras MII'},
        {x:380,y:295,label:'Gametos'}
      ],
      nota:'El ADN se replica una sola vez. Tras meiosis I, cada célula es haploide (n), pero sus cromosomas siguen duplicados: 2C. Tras meiosis II, los gametos tienen n y 1C. En la fecundación, dos gametos aportan sus genomas y el cigoto recupera 2n y 2C.',
      etapas:[
        {n:'G₁',v:'2n · 2C',d:'Dotación diploide antes de replicar.'},
        {n:'Fase S',v:'2n · 2C → 4C',d:'La cantidad de ADN se duplica; la ploidía sigue en 2n.'},
        {n:'Tras meiosis I',v:'n · 2C',d:'Se separan los homólogos; cada cromosoma aún tiene dos cromátidas.'},
        {n:'Tras meiosis II',v:'n · 1C',d:'Se separan las cromátidas hermanas y se forman los gametos.'},
        {n:'Tras fecundación',v:'2n · 2C',d:'Se fusionan dos gametos haploides y se forma el cigoto diploide.'}
      ]
    }
  };
  const css='.adn-lab{--adn-text:#edf3ff;--adn-muted:#aebfe0;max-width:1040px;margin:auto;padding:clamp(13px,3vw,30px);color:var(--adn-text);font:15px/1.55 system-ui,sans-serif}.adn-lab *{box-sizing:border-box}.adn-lab button{font:inherit;cursor:pointer}.adn-back{display:inline-flex;align-items:center;gap:8px;margin:0 0 18px;padding:10px 14px;border:1px solid #36558b;border-radius:999px;background:#0b1a35;color:#e4edff;font-size:13px;font-weight:650;transition:background .18s,border-color .18s,transform .18s}.adn-back:hover{background:#162d55;border-color:#6f9df4;transform:translateX(-2px)}.adn-back:focus-visible,.adn-switch button:focus-visible{outline:3px solid #91baff;outline-offset:3px}.adn-head{display:flex;align-items:center;gap:13px}.adn-icon{width:48px;height:48px;display:grid;place-items:center;flex:none;border:1px solid #31518a;border-radius:15px;background:linear-gradient(145deg,#183767,#101d3b);font-size:24px}.adn-eyebrow{color:#8daef1;font-size:10px;font-weight:850;letter-spacing:.12em}.adn-title{font-size:clamp(25px,4vw,35px);line-height:1.15;letter-spacing:-.035em;margin:5px 0}.adn-sub{color:var(--adn-muted);font-size:14px;margin:0}.adn-switch{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:6px;border:1px solid #294578;border-radius:15px;background:#08162e;margin:20px 0 14px}.adn-switch button{padding:11px 13px;border:1px solid transparent;border-radius:10px;background:transparent;color:#aebfe0;font-size:13px;font-weight:700}.adn-switch button.on{color:#fff;border-color:#4c7bcd;background:linear-gradient(110deg,#244b87,#172f57);box-shadow:0 4px 14px #02081755}.adn-card{overflow:hidden;background:linear-gradient(145deg,#102345,#09152b);border:1px solid #2b4776;border-radius:19px;padding:clamp(13px,3vw,22px);box-shadow:0 12px 32px #0002}.adn-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}.adn-card-head h2{font-size:19px;margin:0 0 3px}.adn-card-head p{color:var(--adn-muted);font-size:12px;margin:0}.adn-unit{padding:6px 9px;border:1px solid #2d4c80;border-radius:999px;color:#bcd2f7;background:#0a1b36;font-size:11px;white-space:nowrap}.adn-chart{display:block;width:100%;height:auto;margin:8px 0 0;overflow:visible}.adn-chart.compact{max-width:520px;margin-left:auto;margin-right:auto}.adn-guide{stroke:#385178;stroke-width:1.2;stroke-dasharray:4 6}.adn-axis{stroke:#7893c4;stroke-width:1.4}.adn-chart text{font-family:system-ui,sans-serif}.adn-label{fill:#c5d7f6;font-size:12px;text-anchor:middle}.adn-value{fill:#88a9e5;font-size:11px;font-weight:700}.adn-axis-label{fill:#9fb5dc;font-size:11px}.adn-legend{display:flex;gap:8px 15px;flex-wrap:wrap;color:#b3c5e5;font-size:11px;margin:2px 0 0}.adn-legend span{display:inline-flex;align-items:center;gap:6px}.adn-key{width:9px;height:9px;border-radius:50%;display:inline-block}.adn-note{display:flex;gap:12px;align-items:flex-start;margin-top:14px;padding:13px 15px;border:1px solid #2d507a;border-left:4px solid #63e8c3;border-radius:12px;background:linear-gradient(110deg,#102a43,#0b1b34);color:#cfdef8;font-size:13px}.adn-note-icon{display:grid;place-items:center;flex:none;width:25px;height:25px;border-radius:8px;background:#174943;color:#8cf2d5;font-weight:900}.adn-note p{margin:0}.adn-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:13px}.adn-step{min-width:0;padding:11px 10px;border:1px solid #294675;border-radius:12px;background:linear-gradient(155deg,#0d1e3b,#09162d)}.adn-step b{display:block;color:#87e9ce;font-size:12px;margin-bottom:5px}.adn-step strong{display:block;color:#f0f5ff;font-size:12px;line-height:1.35;margin-bottom:5px}.adn-step span{display:block;color:#9fb4d8;font-size:11px;line-height:1.45}.adn-fec{margin-top:15px;padding:clamp(14px,3vw,21px);border:1px solid #3b6984;border-radius:18px;background:radial-gradient(ellipse at 82% 15%,#173c53,transparent 55%),linear-gradient(145deg,#102944,#09182e)}.adn-fec-head{max-width:75ch}.adn-fec-eyebrow{color:#79e3cb;font-size:10px;font-weight:850;letter-spacing:.1em}.adn-fec-head h3{font-size:19px;letter-spacing:-.02em;margin:5px 0}.adn-fec-head p{color:#b7cde9;font-size:12px;margin:0}.adn-fec-flow{display:flex;justify-content:center;align-items:center;gap:clamp(8px,2vw,22px);margin:21px 0 10px}.adn-gamete,.adn-zygote{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:85px;text-align:center}.adn-gamete i{display:block;width:42px;height:42px;border:2px solid #77a8f4;border-radius:50%;background:radial-gradient(circle at 35% 30%,#294e7d,#102344 70%);box-shadow:0 0 20px #5b8cf222}.adn-gamete.alt i{border-color:#bd91fa;background:radial-gradient(circle at 35% 30%,#593c7e,#211d43 70%)}.adn-zygote i{display:block;width:52px;height:52px;border:2px solid #63e8c3;border-radius:50%;background:radial-gradient(circle at 35% 30%,#26776b,#103e43 72%);box-shadow:0 0 22px #63e8c333}.adn-gamete b,.adn-zygote b{font-size:12px}.adn-gamete span,.adn-zygote span{font-size:11px;color:#a9c4ec}.adn-zygote span{color:#8cebd0}.adn-plus,.adn-arrow{color:#8eb5f7;font-size:22px;font-weight:800}.adn-arrow{color:#75e7c8}.adn-fec-caption{display:flex;justify-content:center;align-items:center;gap:12px;color:#9fb5dc;font-size:10px;text-align:center}.adn-fec-caption b{padding:5px 9px;border:1px solid #316f67;border-radius:999px;color:#8cebd0;background:#0b3438}.adn-claridad{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.adn-claridad article{padding:13px 15px;border:1px solid #294675;border-radius:12px;background:#0a1933}.adn-claridad b{display:block;font-size:12px;color:#c5d8fa;margin-bottom:4px}.adn-claridad p{font-size:11px;line-height:1.5;color:#9fb4d8;margin:0}@media(max-width:760px){.adn-steps{grid-template-columns:repeat(2,minmax(0,1fr))}.adn-step:last-child:nth-child(odd){grid-column:1/-1}}@media(max-width:500px){.adn-lab{padding:15px 11px 30px}.adn-switch{grid-template-columns:1fr}.adn-chart .adn-label{font-size:10px}.adn-fec-flow{gap:7px}.adn-gamete,.adn-zygote{min-width:62px}.adn-gamete i{width:33px;height:33px}.adn-zygote i{width:43px;height:43px}.adn-plus,.adn-arrow{font-size:17px}.adn-claridad{grid-template-columns:1fr}.adn-card{padding:12px 9px}.adn-chart{margin-left:-2px;width:calc(100% + 4px)}}';
  function construirGrafico(d){
    const compacto=typeof window!=='undefined'&&window.matchMedia('(max-width:700px)').matches;
    const puntos=compacto?d.puntosCompactos:d.puntos;
    const path=compacto?d.pathCompacto:d.path;
    const viewBox=compacto?'0 0 410 385':'0 0 960 385';
    const right=compacto?395:920;
    const center=compacto?205:495;
    const guides=[
      '<line class="adn-guide" x1="70" y1="105" x2="'+right+'" y2="105"/>',
      '<line class="adn-guide" x1="70" y1="213" x2="'+right+'" y2="213"/>',
      '<line class="adn-guide" x1="70" y1="295" x2="'+right+'" y2="295"/>'
    ].join('');
    const points=puntos.map(function(p){
      return '<g><circle cx="'+p.x+'" cy="'+p.y+'" r="12" fill="'+d.color+'" opacity=".14"/><circle cx="'+p.x+'" cy="'+p.y+'" r="5.5" fill="'+d.color+'" stroke="#f1f6ff" stroke-width="2"/><text class="adn-label" x="'+p.x+'" y="343">'+p.label+'</text></g>';
    }).join('');
    return '<svg class="adn-chart'+(compacto?' compact':'')+'" viewBox="'+viewBox+'" role="img" aria-label="Gráfico del contenido de ADN por célula durante '+d.titulo+'">'+
      '<text class="adn-axis-label" x="70" y="30">CONTENIDO DE ADN</text>'+
      guides+
      '<line class="adn-axis" x1="70" y1="58" x2="70" y2="315"/><line class="adn-axis" x1="70" y1="315" x2="'+right+'" y2="315"/>'+
      '<text class="adn-value" x="27" y="109">4C</text><text class="adn-value" x="27" y="217">2C</text><text class="adn-value" x="27" y="299">1C</text>'+
      '<path d="'+path+'" fill="none" stroke="'+d.color+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
      points+
      '<text class="adn-axis-label" x="'+center+'" y="377" text-anchor="middle">Etapas del proceso</text>'+
      '</svg>';
  }
  function tarjetasEtapas(d){
    return d.etapas.map(function(e){
      return '<article class="adn-step"><b>'+e.n+'</b><strong>'+e.v+'</strong><span>'+e.d+'</span></article>';
    }).join('');
  }
  function bloqueFecundacion(){
    return '<section class="adn-fec" aria-label="Fecundación y formación del cigoto">'+
      '<div class="adn-fec-head"><div class="adn-fec-eyebrow">DESPUÉS DE LA MEIOSIS</div><h3>Fecundación: se restablece la diploidía</h3><p>Cada gameto aporta un juego haploide con 1C de ADN. Al fusionarse sus genomas, el cigoto vuelve a tener 2n y 2C.</p></div>'+
      '<div class="adn-fec-flow"><div class="adn-gamete"><i aria-hidden="true"></i><b>Gametos</b><span>n · 1C</span></div><span class="adn-plus" aria-hidden="true">+</span><div class="adn-gamete alt"><i aria-hidden="true"></i><b>Gametos</b><span>n · 1C</span></div><span class="adn-arrow" aria-hidden="true">→</span><div class="adn-zygote"><i aria-hidden="true"></i><b>Cigoto</b><span>2n · 2C</span></div></div>'+
      '<div class="adn-fec-caption"><span>Haploide</span><b>Fecundación</b><span>Diploide</span></div></section>';
  }
  function render(){
    const d=modelos[proceso];
    const fec=proceso==='meiosis'?bloqueFecundacion():'';
    const comparacion=proceso==='meiosis'
      ?'<div class="adn-claridad"><article><b>Ploidía (n)</b><p>Indica cuántos juegos de cromosomas hay. Pasa de 2n a n en meiosis I y vuelve a 2n en el cigoto.</p></article><article><b>Contenido de ADN (C)</b><p>Se duplica en fase S (2C → 4C), baja a 2C tras meiosis I y a 1C tras meiosis II.</p></article></div>'
      :'<div class="adn-claridad"><article><b>Ploidía (n)</b><p>En la mitosis habitual se conserva la condición diploide: 2n.</p></article><article><b>Contenido de ADN (C)</b><p>Se duplica en S y, después de la división y citocinesis, cada célula hija queda con 2C.</p></article></div>';
    app.innerHTML='<section class="adn-lab">'+
      '<button type="button" id="adn-back" class="adn-back" aria-label="Volver a Mitosis y meiosis"><span aria-hidden="true">←</span> Volver a Mitosis y meiosis</button>'+
      '<header class="adn-head"><span class="adn-icon" aria-hidden="true">📈</span><div><div class="adn-eyebrow">PARCIALITO LAB · BIOLOGÍA CELULAR</div><h1 class="adn-title">Cantidad de ADN por etapa</h1><p class="adn-sub">Cómo cambia el ADN en cada etapa y qué sucede al formarse el cigoto.</p></div></header>'+
      '<div class="adn-switch" role="group" aria-label="Elegir proceso">'+
        '<button type="button" data-p="mitosis" class="'+(proceso==='mitosis'?'on':'')+'" aria-pressed="'+(proceso==='mitosis')+'">Mitosis</button>'+
        '<button type="button" data-p="meiosis" class="'+(proceso==='meiosis'?'on':'')+'" aria-pressed="'+(proceso==='meiosis')+'">Meiosis + fecundación</button>'+
      '</div>'+
      '<section class="adn-card"><div class="adn-card-head"><div><h2>'+d.titulo+'</h2><p>'+d.sub+'</p></div><span class="adn-unit">C = contenido de ADN</span></div>'+
        construirGrafico(d)+
        '<div class="adn-legend"><span><i class="adn-key" style="background:'+d.color+'"></i>Contenido de ADN por célula</span><span>4C · ADN duplicado</span><span>2C · cantidad total de ADN</span><span>1C · contenido de cada gameto</span></div></section>'+
      '<div class="adn-note"><span class="adn-note-icon" aria-hidden="true">i</span><p>'+d.nota+'</p></div>'+
      '<section class="adn-steps" aria-label="Valores de ADN por etapa">'+tarjetasEtapas(d)+'</section>'+
      fec+comparacion+
    '</section>';
    app.querySelector('#adn-back').onclick=volver;
    app.querySelectorAll('[data-p]').forEach(function(b){b.onclick=function(){proceso=b.dataset.p;render()}});
  }
  if(!document.getElementById('adn-lab-css')){const st=document.createElement('style');st.id='adn-lab-css';st.textContent=css;document.head.appendChild(st)}
  render();
}
