
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
  const cssPractica=".adn-practica{margin-top:18px;padding:clamp(15px,3vw,23px);border:1px solid #365b8b;border-radius:19px;background:radial-gradient(ellipse at 85% 0%,#193d59,transparent 48%),linear-gradient(145deg,#102345,#09152b);box-shadow:0 12px 32px #0002}.adn-practica-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.adn-practica-head h2{font-size:clamp(20px,3vw,25px);letter-spacing:-.025em;margin:5px 0}.adn-practica-head p{font-size:12px;color:#aebfe0;max-width:65ch;margin:0}.adn-puntaje{flex:none;text-align:center;padding:8px 13px;border:1px solid #326d67;border-radius:12px;background:#0a2c35}.adn-puntaje b,.adn-puntaje span{display:block}.adn-puntaje b{font-size:18px;color:#8cebd0}.adn-puntaje span{font-size:10px;color:#b4d5d8}.adn-progreso{height:5px;margin:16px 0 18px;border-radius:9px;overflow:hidden;background:#203757}.adn-progreso span{display:block;height:100%;background:linear-gradient(90deg,#63e8c3,#72a7ff);transition:width .2s}.adn-pregunta-meta{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;color:#8eb5f7;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.adn-enunciado{font-size:17px;line-height:1.45;margin:10px 0 14px;color:#f0f5ff}.adn-visual-pregunta{max-width:430px;margin:0 auto 14px;padding:10px 14px;border:1px solid #294675;border-radius:13px;background:#08162e}.adn-visual-pregunta svg{display:block;width:100%;height:auto}.adn-opciones{display:grid;gap:8px}.adn-opcion{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:11px 12px;border:1px solid #294675;border-radius:12px;background:#0b1a33;color:#dce8fc;font-size:13px;line-height:1.45;transition:border-color .15s,background .15s}.adn-opcion:hover:not(:disabled){border-color:#709be8;background:#13294a}.adn-opcion:focus-visible,.adn-accion:focus-visible{outline:3px solid #91baff;outline-offset:3px}.adn-opcion:disabled{cursor:default}.adn-letra{display:grid;place-items:center;flex:none;width:27px;height:27px;border:1px solid #385781;border-radius:8px;color:#9fbde9;font-weight:800;font-size:11px}.adn-opcion.elegida{border-color:#72a7ff;background:#142c4d}.adn-opcion.correcta{border-color:#4cb69d;background:#10372f}.adn-opcion.correcta .adn-letra{border-color:#4cb69d;color:#8cebd0}.adn-opcion.incorrecta{border-color:#bb6d79;background:#3b1e31}.adn-opcion b{margin-left:auto;color:#8cebd0}.adn-ayuda{font-size:11px;color:#9fb4d8;margin:11px 0}.adn-retro{margin-top:13px;padding:12px 14px;border:1px solid #365b8b;border-radius:12px;background:#0a1933}.adn-retro.bien{border-color:#347b69;background:#0b2c2c}.adn-retro.mal{border-color:#805266;background:#2a1b32}.adn-retro b{font-size:13px;color:#8cebd0}.adn-retro.mal b{color:#ffb7c3}.adn-retro p{margin:4px 0 0;font-size:12px;color:#c5d7f6}.adn-practica-acciones{display:flex;justify-content:flex-end;margin-top:15px}.adn-accion{padding:10px 15px;border:1px solid #3e6196;border-radius:11px;background:#14294a;color:#e6efff;font-weight:750;font-size:12px}.adn-accion.primaria{border-color:#4e9e91;background:linear-gradient(110deg,#185a57,#174b62)}.adn-accion:disabled{opacity:.42;cursor:not-allowed}.adn-final-practica{text-align:center;padding:14px 0 4px}.adn-final-icon{display:grid;place-items:center;width:43px;height:43px;margin:0 auto 10px;border:1px solid #4cb69d;border-radius:50%;background:#10372f;color:#8cebd0;font-size:23px}.adn-final-practica h3{font-size:22px;margin:6px 0}.adn-final-practica p{color:#b7cde9;font-size:13px}.adn-final-practica .adn-accion{margin-top:8px}@media(max-width:500px){.adn-practica{padding:14px 11px}.adn-practica-head{gap:8px}.adn-puntaje{padding:7px 9px}.adn-opcion{padding:10px;font-size:12px}.adn-enunciado{font-size:15px}}";
  const cssBaseOriginal=css;
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

  const preguntasPractica=[
    {tipo:'CANTIDAD DE ADN',pregunta:'Una célula somática humana está en G₁, antes de la fase S. ¿Qué combinación corresponde?',opciones:['46 cromosomas, 46 cromátidas; 2n y 2C','46 cromosomas, 92 cromátidas; 2n y 4C','23 cromosomas, 23 cromátidas; n y 1C','92 cromosomas, 92 cromátidas; 4n y 4C'],correcta:0,explicacion:'En G₁ hay 46 cromosomas no duplicados. La célula es diploide (2n) y contiene 2C de ADN.'},
    {tipo:'LEÉ EL GRÁFICO',pregunta:'Observá este tramo del gráfico: la curva sube de 2C a 4C durante S. ¿Qué cambia y qué se mantiene?',visual:'<svg viewBox="0 0 320 132" role="img" aria-label="Gráfico de contenido de ADN: pasa de 2C a 4C durante la fase S"><line x1="38" y1="18" x2="38" y2="106" stroke="#7893c4"/><line x1="38" y1="106" x2="300" y2="106" stroke="#7893c4"/><line x1="38" y1="36" x2="300" y2="36" stroke="#385178" stroke-dasharray="4 5"/><line x1="38" y1="82" x2="300" y2="82" stroke="#385178" stroke-dasharray="4 5"/><text x="7" y="40" fill="#88a9e5" font-size="11">4C</text><text x="7" y="86" fill="#88a9e5" font-size="11">2C</text><path d="M50 82 L105 82 L175 36 L225 36 L290 36" fill="none" stroke="#63e8c3" stroke-width="4" stroke-linecap="round"/><text x="65" y="124" fill="#c5d7f6" font-size="11">G₁</text><text x="160" y="124" fill="#c5d7f6" font-size="11">S</text><text x="255" y="124" fill="#c5d7f6" font-size="11">G₂</text></svg>',opciones:['Se duplica el ADN, pero la ploidía permanece en 2n','La ploidía cambia de 2n a 4n','Se duplica el número de cromosomas de 46 a 92','La célula se vuelve haploide'],correcta:0,explicacion:'En S se replica el ADN: cada cromosoma pasa a tener dos cromátidas. El número de cromosomas contado por centrómeros sigue siendo 46 y la ploidía sigue siendo 2n.'},
    {tipo:'CROMOSOMAS Y CROMÁTIDAS',pregunta:'Al terminar la fase S de una célula humana diploide, antes de dividirse, ¿cuántos cromosomas y cromátidas hay?',opciones:['92 cromosomas y 92 cromátidas','46 cromosomas y 92 cromátidas','46 cromosomas y 46 cromátidas','23 cromosomas y 46 cromátidas'],correcta:1,explicacion:'Se cuentan 46 cromosomas porque hay 46 centrómeros; cada uno tiene dos cromátidas, por eso hay 92 cromátidas.'},
    {tipo:'LEÉ EL GRÁFICO',pregunta:'En este esquema, la célula acaba de completar la meiosis I. ¿Qué combinación corresponde al punto señalado?',visual:'<svg viewBox="0 0 320 132" role="img" aria-label="Gráfico de meiosis con ADN: G1 y G2 en 2C y 4C, después de meiosis I en 2C y después de meiosis II en 1C"><line x1="38" y1="18" x2="38" y2="106" stroke="#7893c4"/><line x1="38" y1="106" x2="300" y2="106" stroke="#7893c4"/><line x1="38" y1="36" x2="300" y2="36" stroke="#385178" stroke-dasharray="4 5"/><line x1="38" y1="66" x2="300" y2="66" stroke="#385178" stroke-dasharray="4 5"/><line x1="38" y1="91" x2="300" y2="91" stroke="#385178" stroke-dasharray="4 5"/><text x="7" y="40" fill="#88a9e5" font-size="11">4C</text><text x="7" y="70" fill="#88a9e5" font-size="11">2C</text><text x="7" y="95" fill="#88a9e5" font-size="11">1C</text><path d="M48 66 L90 66 L130 36 L170 36 L215 66 L260 91 L295 91" fill="none" stroke="#63e8c3" stroke-width="4" stroke-linecap="round"/><circle cx="215" cy="66" r="7" fill="#ffca68" stroke="#fff1c9" stroke-width="2"/><text x="195" y="124" fill="#c5d7f6" font-size="10">Tras meiosis I</text></svg>',opciones:['2n, 4C; 46 cromosomas y 92 cromátidas','n, 2C; 23 cromosomas y 46 cromátidas','n, 1C; 23 cromosomas y 23 cromátidas','2n, 2C; 46 cromosomas y 46 cromátidas'],correcta:1,explicacion:'Después de meiosis I se separan los cromosomas homólogos. Cada célula queda haploide (n), con 23 cromosomas todavía duplicados: 46 cromátidas y 2C.'},
    {tipo:'PLOIDÍA VS. ADN',pregunta:'¿Cuál afirmación distingue correctamente n de C?',opciones:['n indica la cantidad de ADN; C indica los juegos cromosómicos','n y C significan exactamente lo mismo','n indica los juegos de cromosomas; C indica la cantidad de ADN','Una célula 4C siempre es tetraploide (4n)'],correcta:2,explicacion:'La ploidía (n) cuenta juegos de cromosomas. C expresa contenido de ADN. Por eso una célula puede ser 2n y 4C después de replicar su ADN.'},
    {tipo:'LEÉ EL GRÁFICO',pregunta:'El gráfico termina en 1C tras meiosis II. Si se trata de un gameto humano normal, ¿qué esperás encontrar?',visual:'<svg viewBox="0 0 320 132" role="img" aria-label="Gráfico que baja de 4C a 2C tras meiosis I y a 1C tras meiosis II"><line x1="38" y1="18" x2="38" y2="106" stroke="#7893c4"/><line x1="38" y1="106" x2="300" y2="106" stroke="#7893c4"/><line x1="38" y1="36" x2="300" y2="36" stroke="#385178" stroke-dasharray="4 5"/><line x1="38" y1="66" x2="300" y2="66" stroke="#385178" stroke-dasharray="4 5"/><line x1="38" y1="91" x2="300" y2="91" stroke="#385178" stroke-dasharray="4 5"/><text x="7" y="40" fill="#88a9e5" font-size="11">4C</text><text x="7" y="70" fill="#88a9e5" font-size="11">2C</text><text x="7" y="95" fill="#88a9e5" font-size="11">1C</text><path d="M48 36 L100 36 L155 66 L220 91 L295 91" fill="none" stroke="#63e8c3" stroke-width="4" stroke-linecap="round"/><circle cx="260" cy="91" r="7" fill="#ffca68" stroke="#fff1c9" stroke-width="2"/><text x="235" y="124" fill="#c5d7f6" font-size="10">Gametos</text></svg>',opciones:['23 cromosomas, 23 cromátidas; n y 1C','23 cromosomas, 46 cromátidas; n y 2C','46 cromosomas, 46 cromátidas; 2n y 2C','46 cromosomas, 92 cromátidas; 2n y 4C'],correcta:0,explicacion:'Después de meiosis II se separan las cromátidas hermanas. El gameto tiene 23 cromosomas de una cromátida cada uno: n y 1C.'},
    {tipo:'FECUNDACIÓN',pregunta:'Un óvulo y un espermatozoide humanos normales se fusionan. Antes de que el cigoto replique su ADN, ¿qué resultado se espera?',opciones:['n y 1C: sigue siendo haploide','2n y 2C: 46 cromosomas y 46 cromátidas','2n y 4C: 46 cromosomas y 92 cromátidas','4n y 2C: 92 cromosomas y 46 cromátidas'],correcta:1,explicacion:'Cada gameto aporta n y 1C. La fecundación reúne ambos juegos y forma un cigoto diploide: 2n y 2C, con 46 cromosomas y 46 cromátidas antes de la fase S.'},
    {tipo:'CONCEPTO CLAVE',pregunta:'¿Cómo se determina el número de cromosomas en una célula, incluso cuando están duplicados?',opciones:['Contando cada cromátida como un cromosoma','Contando las moléculas de ADN sin importar su unión','Contando los centrómeros','Contando solo los pares homólogos'],correcta:2,explicacion:'El número de cromosomas se cuenta por centrómeros. Un cromosoma duplicado tiene dos cromátidas, pero sigue contando como un cromosoma mientras sus centrómeros no se hayan separado.'}
  ];
  let ordenPractica=preguntasPractica.map(function(_,i){return i});
  let indicePractica=0;
  let seleccionPractica=null;
  let revisadaPractica=false;
  let aciertosPractica=0;
  let respondidasPractica=0;
  function mezclarPractica(){ordenPractica.sort(function(){return Math.random()-.5});indicePractica=0;seleccionPractica=null;revisadaPractica=false;aciertosPractica=0;respondidasPractica=0;}
  function bloquePractica(){
    const q=preguntasPractica[ordenPractica[indicePractica]];
    const opciones=q.opciones.map(function(op,i){const estado=revisadaPractica?(i===q.correcta?' correcta':(i===seleccionPractica?' incorrecta':'')):(i===seleccionPractica?' elegida':'');return '<button type="button" class="adn-opcion'+estado+'" data-practica-op="'+i+'" '+(revisadaPractica?'disabled':'')+'><span class="adn-letra">'+String.fromCharCode(65+i)+'</span><span>'+op+'</span>'+(revisadaPractica&&i===q.correcta?'<b aria-hidden="true">✓</b>':'')+'</button>';}).join('');
    const terminada=indicePractica>=preguntasPractica.length;
    return '<section class="adn-practica" aria-labelledby="adn-practica-titulo"><div class="adn-practica-head"><div><div class="adn-fec-eyebrow">PONÉ A PRUEBA LO QUE ENTENDISTE</div><h2 id="adn-practica-titulo">Práctica: interpretá el ADN</h2><p>Respondé preguntas de conteo, ploidía y lectura del gráfico. Algunas requieren deducir los valores a partir de la curva.</p></div><div class="adn-puntaje"><b>'+aciertosPractica+'/'+respondidasPractica+'</b><span>aciertos</span></div></div>'+
      '<div class="adn-progreso" role="progressbar" aria-label="Progreso de práctica" aria-valuemin="0" aria-valuemax="'+preguntasPractica.length+'" aria-valuenow="'+respondidasPractica+'"><span style="width:'+(respondidasPractica/preguntasPractica.length*100)+'%"></span></div>'+
      (terminada?'<div class="adn-final-practica"><div class="adn-final-icon">✓</div><h3>'+(aciertosPractica>=8?'¡Excelente dominio!':aciertosPractica>=6?'¡Muy bien!':'¡Buen repaso!')+'</h3><p>Resultado: <strong>'+aciertosPractica+' de '+preguntasPractica.length+'</strong>. Volvé a intentarlo para afianzar los conceptos.</p><button type="button" class="adn-accion primaria" data-practica-reiniciar>Mezclar y volver a practicar</button></div>':'<div class="adn-pregunta-meta"><span>Pregunta '+(indicePractica+1)+' de '+preguntasPractica.length+'</span><span>'+q.tipo+'</span></div><h3 class="adn-enunciado">'+q.pregunta+'</h3>'+(q.visual?'<div class="adn-visual-pregunta">'+q.visual+'</div>':'')+'<div class="adn-opciones" role="group" aria-label="Opciones de respuesta">'+opciones+'</div>'+
      (revisadaPractica?'<div class="adn-retro '+(seleccionPractica===q.correcta?'bien':'mal')+'" role="status"><b>'+(seleccionPractica===q.correcta?'¡Correcto!':'No exactamente')+'</b><p>'+q.explicacion+'</p></div>':'<p class="adn-ayuda">Elegí una opción y después comprobá tu respuesta.</p>')+
      '<div class="adn-practica-acciones">'+(revisadaPractica?'<button type="button" class="adn-accion primaria" data-practica-siguiente>'+(indicePractica===preguntasPractica.length-1?'Ver resultado':'Siguiente pregunta')+' →</button>':'<button type="button" class="adn-accion primaria" data-practica-comprobar '+(seleccionPractica===null?'disabled':'')+'>Comprobar respuesta</button>')+'</div>')+'</section>';
  }


  let dibujoModo='mitosis';
  let dibujoPuntos=[];
  const dibujoModelos={
    mitosis:{labels:['G₁','S','G₂','Profase','Metafase','Anafase','Citocinesis'],values:[2,4,4,4,4,2,2]},
    meiosis:{labels:['G₁','S','G₂','Profase I','Metafase I','Meiosis I','Profase II','Metafase II','Meiosis II','Gameto'],values:[2,4,4,4,4,2,2,2,1,1]}
  };
  function dibujoHTML(){
    const m=dibujoModelos[dibujoModo], w=640,h=260,left=48,right=18,top=22,bottom=48;
    const xs=m.labels.map((_,i)=>left+i*(w-left-right)/(m.labels.length-1));
    const y=v=>top+(4-v)*(h-top-bottom)/3;
    const ref=m.values.map((v,i)=>(i?'L':'M')+xs[i]+' '+y(v)).join(' ');
    const trazos=dibujoPuntos.slice(1).map((p,i)=>{
      const a=dibujoPuntos[i],correcto=a.value===m.values[a.index]&&p.value===m.values[p.index];
      return '<line x1="'+xs[a.index]+'" y1="'+y(a.value)+'" x2="'+xs[p.index]+'" y2="'+y(p.value)+'" stroke="'+(correcto?'#20b981':'#ef4444')+'" stroke-width="4" stroke-linecap="round"/>';
    }).join('');
    const pts=dibujoPuntos.map(p=>'<circle cx="'+xs[p.index]+'" cy="'+y(p.value)+'" r="5" fill="'+(p.value===m.values[p.index]?'#20b981':'#ef4444')+'"/>').join('');
    const grid=[1,2,3,4].map(v=>'<g><line x1="'+left+'" y1="'+y(v)+'" x2="'+(w-right)+'" y2="'+y(v)+'" stroke="#8992a3" stroke-opacity=".22" stroke-dasharray="4 4"/><text x="'+(left-12)+'" y="'+(y(v)+4)+'" fill="currentColor" font-size="12" text-anchor="end">'+v+'C</text></g>').join('');
    const labels=m.labels.map((t,i)=>'<text x="'+xs[i]+'" y="'+(h-20)+'" fill="currentColor" font-size="'+(m.labels.length>8?9:11)+'" text-anchor="middle">'+t+'</text>').join('');
    return '<section class="adn-draw"><div class="adn-draw-head"><div><div class="adn-fec-eyebrow">MODO INTERACTIVO</div><h2>Dibujá vos la curva de ADN</h2><p>Tocá el gráfico en cada etapa para ubicar tus puntos y unir los tramos; también podés elegir los niveles abajo. Cada tramo se corrige al instante.</p></div><div class="adn-draw-switch"><button type="button" data-draw-mode="mitosis" class="'+(dibujoModo==='mitosis'?'on':'')+'">Mitosis</button><button type="button" data-draw-mode="meiosis" class="'+(dibujoModo==='meiosis'?'on':'')+'">Meiosis</button></div></div>'+
    '<div class="adn-draw-legend"><span><i style="background:#9ca3af"></i>Curva correcta</span><span><i style="background:#20b981"></i>Tramo correcto</span><span><i style="background:#ef4444"></i>Tramo incorrecto</span></div>'+
    '<div class="adn-draw-canvas"><svg data-draw-plot viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Gráfico para dibujar cantidad de ADN">'+grid+'<path d="'+ref+'" fill="none" stroke="#9ca3af" stroke-width="3" stroke-dasharray="6 6" opacity=".75"/>'+trazos+pts+labels+'</svg></div>'+
    '<p class="adn-draw-instruction">Elegí el nivel para cada etapa, de izquierda a derecha:</p><div class="adn-draw-levels">'+m.labels.map((t,i)=>'<label><span>'+t+'</span><select data-draw-index="'+i+'"><option value="">Elegir C</option><option value="1" '+(dibujoPuntos[i]?.value===1?'selected':'')+'>1C</option><option value="2" '+(dibujoPuntos[i]?.value===2?'selected':'')+'>2C</option><option value="3" '+(dibujoPuntos[i]?.value===3?'selected':'')+'>3C</option><option value="4" '+(dibujoPuntos[i]?.value===4?'selected':'')+'>4C</option></select></label>').join('')+'</div>'+
    '<div class="adn-draw-foot"><span role="status">'+(dibujoPuntos.length===m.labels.length?'¡Curva completa! Revisá los tramos rojos y corregilos.':'Completaste '+dibujoPuntos.length+' de '+m.labels.length+' etapas.')+'</span><button type="button" class="adn-accion" data-draw-reset>Reiniciar dibujo</button></div></section>';
  }
  const dibujoCSS = '.adn-draw{margin:24px 0;padding:clamp(16px,3vw,26px);border:1px solid var(--adn-border,#343044);border-radius:22px;background:var(--adn-panel,rgba(255,255,255,.025))}.adn-draw-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.adn-draw h2{margin:5px 0 8px;font-size:clamp(20px,3vw,27px)}.adn-draw p{line-height:1.55}.adn-draw-switch{display:flex;gap:6px;flex-wrap:wrap}.adn-draw-switch button{border:1px solid #77708b;background:transparent;color:inherit;border-radius:10px;padding:9px 12px}.adn-draw-switch button.on{background:#7c3aed;color:#fff}.adn-draw-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;margin:14px 0}.adn-draw-legend span{display:flex;align-items:center;gap:6px}.adn-draw-legend i{width:10px;height:10px;border-radius:50%;display:inline-block}.adn-draw-canvas{width:100%;overflow-x:auto}.adn-draw-canvas svg{display:block;width:100%;min-width:520px;max-height:320px}.adn-draw-instruction{font-weight:700;margin:18px 0 10px}.adn-draw-levels{display:grid;grid-template-columns:repeat(auto-fit,minmax(95px,1fr));gap:9px}.adn-draw-levels label{display:grid;gap:6px;font-size:12px}.adn-draw-levels select{width:100%;min-width:0;border:1px solid #817b92;background:#211a35;color:inherit;border-radius:9px;padding:10px 6px}.adn-draw-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;font-size:13px}.adn-draw-foot [role=status]{line-height:1.5}@media(max-width:560px){.adn-draw-head{display:block}.adn-draw-switch{margin:12px 0}.adn-draw-foot{align-items:flex-start;flex-direction:column}}';

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
      dibujoHTML()+
      bloquePractica()+
    '</section>';
    app.querySelector('#adn-back').onclick=volver;
    app.querySelectorAll('[data-draw-mode]').forEach(function(b){b.onclick=function(){dibujoModo=b.dataset.drawMode;dibujoPuntos=[];render()}});
    app.querySelectorAll('[data-draw-index]').forEach(function(sel){sel.disabled=Number(sel.dataset.drawIndex)>dibujoPuntos.length;sel.onchange=function(){const i=Number(sel.dataset.drawIndex),v=sel.value===''?null:Number(sel.value);if(i>dibujoPuntos.length)return;if(v===null)dibujoPuntos=dibujoPuntos.slice(0,i);else{dibujoPuntos=dibujoPuntos.slice(0,i);dibujoPuntos.push({index:i,value:v})}render()}});
    const plot=app.querySelector('[data-draw-plot]');if(plot)plot.onclick=function(ev){const rect=plot.getBoundingClientRect(),m=dibujoModelos[dibujoModo],w=640,h=260,left=48,right=18,top=22,bottom=48;const px=(ev.clientX-rect.left)/rect.width*w,py=(ev.clientY-rect.top)/rect.height*h;const xs=m.labels.map((_,i)=>left+i*(w-left-right)/(m.labels.length-1));let idx=0;for(let j=1;j<xs.length;j++)if(Math.abs(xs[j]-px)<Math.abs(xs[idx]-px))idx=j;if(idx>dibujoPuntos.length)return;const yy=v=>top+(4-v)*(h-top-bottom)/3;let val=[1,2,3,4].reduce((best,v)=>Math.abs(yy(v)-py)<Math.abs(yy(best)-py)?v:best,1);dibujoPuntos=dibujoPuntos.slice(0,idx);dibujoPuntos.push({index:idx,value:val});render()};
    const resetDibujo=app.querySelector('[data-draw-reset]');if(resetDibujo)resetDibujo.onclick=function(){dibujoPuntos=[];render()};
    app.querySelectorAll('[data-p]').forEach(function(b){b.onclick=function(){proceso=b.dataset.p;render()}});
    app.querySelectorAll('[data-practica-op]').forEach(function(b){b.onclick=function(){if(revisadaPractica)return;seleccionPractica=Number(b.dataset.practicaOp);render()}});
    const comprobar=app.querySelector('[data-practica-comprobar]');
    if(comprobar)comprobar.onclick=function(){if(seleccionPractica===null||revisadaPractica)return;const q=preguntasPractica[ordenPractica[indicePractica]];revisadaPractica=true;respondidasPractica++;if(seleccionPractica===q.correcta)aciertosPractica++;render()};
    const siguiente=app.querySelector('[data-practica-siguiente]');
    if(siguiente)siguiente.onclick=function(){if(!revisadaPractica)return;if(indicePractica<preguntasPractica.length-1){indicePractica++;seleccionPractica=null;revisadaPractica=false}else{respondidasPractica=preguntasPractica.length+0;indicePractica=preguntasPractica.length-1;const panel=app.querySelector('.adn-practica');if(panel){panel.innerHTML='<div class="adn-final-practica"><div class="adn-final-icon">✓</div><h3>'+(aciertosPractica>=8?'¡Excelente dominio!':aciertosPractica>=6?'¡Muy bien!':'¡Buen repaso!')+'</h3><p>Resultado: <strong>'+aciertosPractica+' de '+preguntasPractica.length+'</strong>. Volvé a intentarlo para afianzar los conceptos.</p><button type="button" class="adn-accion primaria" data-practica-reiniciar>Mezclar y volver a practicar</button></div>';panel.querySelector('[data-practica-reiniciar]').onclick=function(){mezclarPractica();render()};return}}render()};
    app.querySelectorAll('[data-practica-reiniciar]').forEach(function(b){b.onclick=function(){mezclarPractica();render()}});
  }
  if(!document.getElementById('adn-lab-css')){const st=document.createElement('style');st.id='adn-lab-css';st.textContent=css+cssPractica+dibujoCSS;document.head.appendChild(st)}else{document.getElementById('adn-lab-css').textContent=css+cssPractica+dibujoCSS}
  render();
}
