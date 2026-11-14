// Guía de estudio: cómo distinguir y justificar los conceptos de Kuhn en el ejercicio 9
// (anomalía, enigma, crisis, paradigma, ciencia normal, revolución, inconmensurabilidad).
export const TITULO = 'Guía de Kuhn · Ejercicio 9';

const CONCEPTOS = [
  {
    id: 'paradigma', nombre: 'Paradigma (matriz disciplinar)', color: '#9B7BFF', icono: '🧭',
    que: 'El marco que comparte una comunidad científica: leyes, supuestos, valores, métodos, instrumentos y ejemplares (soluciones modelo). Define qué problemas son legítimos y cómo se resuelven.',
    pistas: ['comparten leyes, supuestos, valores y métodos', 'acuerdan qué problemas son relevantes', 'soluciones anteriores sirven como modelo', 'la formación de nuevos investigadores enseña…'],
    justifica: 'Es un paradigma porque el texto describe el conjunto de leyes, supuestos, valores, métodos y ejemplares que la comunidad comparte y que orienta qué problemas investigar y cómo resolverlos. No habla de un problema puntual, sino del marco que lo hace posible.',
    confunde: 'No es un enigma ni una anomalía: esos son problemas que aparecen dentro del marco. Tampoco es una ley o una hipótesis aislada.'
  },
  {
    id: 'normal', nombre: 'Ciencia normal', color: '#7FD1FF', icono: '🔧',
    que: 'La investigación cotidiana guiada por un paradigma aceptado: la comunidad resuelve enigmas con las herramientas del marco sin cuestionar sus fundamentos. No es pasiva ni trivial; puede ser técnicamente muy exigente.',
    pistas: ['trabajan dentro del marco', 'instrumentos y ecuaciones aceptados', 'resuelve un problema pendiente', 'no cuestiona el marco general'],
    justifica: 'Es ciencia normal porque el científico actúa dentro de los compromisos del paradigma, usando herramientas compartidas para resolver un problema pendiente, sin cuestionar el marco general.',
    confunde: 'Con paradigma: el paradigma es el marco; la ciencia normal es la actividad que se hace guiada por él. Con revolución: acá el marco no cambia.'
  },
  {
    id: 'enigma', nombre: 'Enigma (puzzle)', color: '#4FE0A0', icono: '🧩',
    que: 'Un problema que la comunidad considera resoluble con los recursos teóricos, matemáticos e instrumentales del paradigma vigente. El paradigma dice qué preguntar y cómo buscar la solución. Si no sale, se duda del científico, no del paradigma.',
    pistas: ['el paradigma ofrece ecuaciones y técnicas', 'la comunidad sabe qué procedimientos aplicar', 'reconoce el problema como legítimo', 'trabajan dentro del marco hasta resolverlo'],
    justifica: 'Es un enigma porque se trata de un problema que la comunidad reconoce como legítimo y resoluble con los modelos, técnicas e instrumentos que ofrece el paradigma vigente.',
    confunde: 'Con anomalía: el enigma encaja con lo que el paradigma espera y se resuelve con sus herramientas; la anomalía es lo que no encaja y resiste.'
  },
  {
    id: 'anomalia', nombre: 'Anomalía', color: '#FFB938', icono: '⚠️',
    que: 'Un resultado o fenómeno que no encaja con las expectativas del paradigma y resiste los intentos de resolverlo: se repiten mediciones, se revisan instrumentos y procedimientos, y la discrepancia persiste. Es un problema localizado: por sí sola no refuta el paradigma ni implica una crisis.',
    pistas: ['no coincide con lo previsto / no encaja con las leyes', 'se repiten las mediciones, se revisa la calibración', 'se descartan errores de procedimiento', 'persiste / sigue ahí', 'se estudia como un problema localizado'],
    justifica: 'Es una anomalía porque el resultado no encaja con las expectativas del paradigma y resiste los controles (se descartaron errores y la discrepancia persiste). Todavía no es una crisis porque se trata de un fenómeno puntual, sin acumulación de dificultades ni pérdida generalizada de confianza en el marco.',
    confunde: 'Con enigma: el enigma se resuelve con las herramientas del paradigma; la anomalía las desafía. Con crisis: la anomalía es una dificultad puntual; la crisis es la acumulación que debilita la confianza en el marco.'
  },
  {
    id: 'crisis', nombre: 'Crisis', color: '#FF5D7A', icono: '🔥',
    que: 'Un período de inestabilidad: se acumulan anomalías relevantes, los intentos de ajuste fracasan, se discuten los fundamentos, aparecen propuestas alternativas y la comunidad pierde confianza en que el paradigma pueda resolver sus dificultades.',
    pistas: ['se acumulan resultados que contradicen predicciones centrales', 'los intentos de ajuste fracasan', 'cuestionan supuestos básicos / fundamentos', 'aparecen propuestas alternativas', 'la comunidad pierde confianza'],
    justifica: 'Es una crisis porque no se trata de una anomalía aislada: se acumulan anomalías relevantes que afectan compromisos centrales, se multiplican las discusiones sobre los fundamentos y la comunidad pierde confianza en el paradigma.',
    confunde: 'Con anomalía: una anomalía persistente no alcanza, por sí sola, para hablar de crisis; hace falta el alcance amplio y la pérdida de confianza. Con revolución: la crisis es la inestabilidad; la revolución es el reemplazo del paradigma.'
  },
  {
    id: 'revolucion', nombre: 'Revolución científica', color: '#FF9D80', icono: '🔄',
    que: 'El episodio en que un paradigma es reemplazado por otro incompatible. Cambian los conceptos, los problemas relevantes y los criterios de evaluación. No es pasar de un paradigma falso o refutado a uno definitivamente verdadero.',
    pistas: ['se abandona el marco anterior', 'nuevo paradigma que lo reemplaza', 'cambian los conceptos y los problemas'],
    justifica: 'Es una revolución científica porque el marco compartido es reemplazado por otro que redefine conceptos, problemas y criterios; no es un simple ajuste dentro del paradigma vigente.',
    confunde: 'Con crisis: la crisis precede a la revolución, no es el reemplazo. Con “falso por verdadero”: para Kuhn no se reemplaza una falsedad por una verdad definitiva (clave del ejercicio 7).'
  },
  {
    id: 'inconmensurabilidad', nombre: 'Inconmensurabilidad', color: '#5CE5BF', icono: '⚖️',
    que: 'La ausencia de una escala neutral y compartida para comparar punto por punto dos paradigmas rivales: pueden cambiar el significado de los términos, los problemas importantes y los criterios de evaluación. No implica incomunicación total: se puede discutir y dar razones.',
    pistas: ['dos comunidades / tradiciones rivales', 'términos centrales cambiaron de significado', 'problemas y pruebas diferentes', 'no existe una escala neutral', 'aun así pueden discutir razones'],
    justifica: 'Es inconmensurabilidad porque se comparan dos paradigmas rivales que usan conceptos y criterios diferentes y no existe una medida neutral, aceptada por ambos, que decida mecánicamente cuál es superior. Eso no impide discutir con razones.',
    confunde: 'Con anomalía o crisis: esas ocurren dentro de un paradigma; la inconmensurabilidad aparece al comparar paradigmas distintos.'
  }
];

const CICLO = [
  ['Pre-ciencia', 'Escuelas rivales que discrepan sobre los fundamentos.'],
  ['Paradigma + ciencia normal', 'Una perspectiva logra consenso y la comunidad resuelve enigmas dentro del marco.'],
  ['Anomalía', 'Aparece un resultado que no encaja y resiste los controles.'],
  ['Crisis', 'Las anomalías se acumulan y se pierde confianza en el marco.'],
  ['Revolución', 'Un paradigma es reemplazado por otro. Y empieza un nuevo ciclo.']
];

const PARES = [
  {
    titulo: 'Enigma vs. anomalía', pregunta: '¿Encaja o resiste?', color: '#FFB938',
    texto: 'El enigma encaja con lo que el paradigma espera y se resuelve con sus herramientas. La anomalía no encaja y sigue ahí aun después de revisar.',
    truco: 'Si el texto dice que se descartaron errores y el problema persiste, es anomalía. Si dice que el marco da las técnicas para resolverlo, es enigma.'
  },
  {
    titulo: 'Anomalía vs. crisis', pregunta: '¿Una dificultad o muchas? ¿Local o general?', color: '#FF5D7A',
    texto: 'La anomalía es una discrepancia puntual. La crisis es la acumulación de anomalías, con debate sobre los fundamentos, propuestas alternativas y pérdida de confianza de la comunidad.',
    truco: 'Buscá frases como “se acumulan”, “pierde confianza”, “fundamentos”, “alternativas”. Si no aparecen, es anomalía, aunque el texto suene dramático.'
  },
  {
    titulo: 'Paradigma vs. ciencia normal vs. enigma', pregunta: '¿Marco, actividad o problema?', color: '#9B7BFF',
    texto: 'El paradigma es el marco compartido. La ciencia normal es la actividad guiada por ese marco. El enigma es cada problema concreto que se resuelve dentro de esa actividad.',
    truco: 'Si el texto lista leyes, valores, métodos y ejemplares, es paradigma. Si describe a alguien resolviendo un problema con herramientas aceptadas, es ciencia normal o enigma.'
  },
  {
    titulo: 'Crisis vs. revolución', pregunta: '¿Inestabilidad o reemplazo?', color: '#FF9D80',
    texto: 'La crisis es el período de inestabilidad. La revolución es el reemplazo del paradigma por otro. Una crisis puede terminar en revolución, pero no son lo mismo.',
    truco: 'Si el marco todavía no fue reemplazado, no es revolución.'
  },
  {
    titulo: 'Inconmensurabilidad vs. todo lo demás', pregunta: '¿Dentro de un paradigma o entre dos?', color: '#5CE5BF',
    texto: 'Enigma, anomalía y crisis ocurren dentro de un paradigma. La inconmensurabilidad aparece cuando se comparan dos paradigmas rivales.',
    truco: 'Si el texto habla de dos comunidades o tradiciones y de que no hay una escala neutral, es inconmensurabilidad.'
  }
];

const ERRORES = [
  'Elegir “crisis” porque el texto suena dramático. Una anomalía que persiste no alcanza, por sí sola, para hablar de crisis.',
  'Tratar la anomalía como una refutación automática del paradigma. Eso es Popper; para Kuhn no es así.',
  'Confundir el marco con los problemas: el paradigma no es un enigma ni una anomalía, son problemas que aparecen dentro de él.',
  'Decir que inconmensurabilidad es incomunicación total o relativismo. Se puede discutir, lo que falta es una medida neutral única.',
  'Decir que una revolución reemplaza un paradigma falso por uno verdadero (es la afirmación falsa del ejercicio 7).',
  'Justificar sin usar el texto: la justificación tiene que apoyarse en frases concretas de la situación.'
];

const EJEMPLOS = [
  {
    concepto: 'Enigma', color: '#4FE0A0',
    texto: 'Un grupo de físicos detecta pequeñas diferencias entre dos mediciones. El paradigma vigente ofrece ecuaciones y técnicas conocidas para calcular la causa, y los investigadores trabajan dentro de ese marco hasta resolver el problema.',
    clave: 'El paradigma ofrece las ecuaciones y técnicas, y el problema se resuelve dentro del marco. No hay nada que resista ni que no encaje.'
  },
  {
    concepto: 'Crisis', color: '#FF5D7A',
    texto: 'Durante años se acumulan resultados que contradicen predicciones centrales de una disciplina. Los intentos de ajuste fracasan, varios grupos cuestionan supuestos básicos y la comunidad pierde confianza en que el paradigma pueda resolver esas dificultades.',
    clave: 'Acumulación, fracaso de los ajustes, cuestionamiento de supuestos básicos y pérdida de confianza de la comunidad: eso es más que una anomalía aislada.'
  }
];

const CSS = `
.gk{max-width:820px;margin:0 auto;padding:clamp(12px,3vw,24px);color:var(--crema);font-family:var(--fuente)}
.gk *{box-sizing:border-box}
.gk h1{font-size:clamp(1.5rem,6vw,2.1rem);line-height:1.15;margin:.2rem 0 .6rem}
.gk h2{font-size:1.3rem;margin:0 0 .5rem}
.gk h3{font-size:1.05rem;margin:0 0 .35rem}
.gk p{margin:.35rem 0;line-height:1.55}
.gk-kicker{display:inline-block;font-size:.72rem;letter-spacing:.12em;font-weight:800;color:var(--ambar)}
.gk-lead{color:var(--tenue);font-size:1.02rem}
.gk-nav{position:sticky;top:0;z-index:5;display:flex;gap:.45rem;overflow-x:auto;padding:.6rem 0;margin:.8rem 0;background:linear-gradient(var(--noche) 78%,transparent);-webkit-overflow-scrolling:touch}
.gk-chip{flex:0 0 auto;border:1px solid var(--linea);background:var(--panel);color:var(--crema);border-radius:999px;padding:.4rem .85rem;font:inherit;font-size:.9rem;cursor:pointer}
.gk-sec{margin:1.6rem 0;scroll-margin-top:4rem}
.gk-card{background:var(--panel);border:1px solid var(--linea);border-radius:var(--radio);padding:1rem;margin:.75rem 0}
.gk-card.acento{border-left:5px solid var(--c,var(--violeta))}
.gk-step{display:flex;gap:.75rem;align-items:flex-start}
.gk-num{flex:0 0 auto;width:2rem;height:2rem;border-radius:50%;display:grid;place-items:center;font-weight:800;background:var(--violeta);color:#120a26}
.gk-res{display:inline-block;border-radius:8px;padding:.1rem .5rem;font-weight:700;font-size:.9rem;background:color-mix(in srgb,var(--c) 22%,transparent);color:var(--c)}
.gk-ciclo{display:grid;gap:.5rem;margin:.6rem 0}
.gk-ciclo-it{display:flex;gap:.7rem;align-items:center;background:var(--panel-2);border:1px solid var(--linea);border-radius:12px;padding:.6rem .8rem}
.gk-ciclo-it b{min-width:8.2rem}
.gk-lab{font-size:.74rem;letter-spacing:.08em;font-weight:800;color:var(--tenue);text-transform:uppercase;margin:.8rem 0 .25rem}
.gk-pistas{display:flex;flex-wrap:wrap;gap:.4rem}
.gk-pista{background:color-mix(in srgb,var(--c) 16%,transparent);border:1px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:999px;padding:.2rem .65rem;font-size:.9rem}
.gk-just{background:var(--panel-2);border-left:3px solid var(--ok);border-radius:8px;padding:.6rem .8rem;font-size:.98rem}
.gk-tit{display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem}
.gk-tit span{font-size:1.4rem}
.gk-tit h3{margin:0;color:var(--c)}
.gk-truco{margin-top:.5rem;color:var(--ambar);font-size:.95rem}
.gk-texto{font-style:italic;background:var(--panel-2);border-radius:10px;padding:.7rem .9rem;border:1px dashed var(--linea)}
.gk-receta{counter-reset:r;list-style:none;padding:0;margin:.6rem 0}
.gk-receta li{counter-increment:r;position:relative;padding:.1rem 0 .1rem 2.6rem;margin:.7rem 0}
.gk-receta li::before{content:counter(r);position:absolute;left:0;top:0;width:2rem;height:2rem;border-radius:50%;display:grid;place-items:center;font-weight:800;background:var(--violeta);color:#120a26}
.gk-plantilla{background:var(--panel-2);border:1px dashed var(--ambar);border-radius:12px;padding:.8rem 1rem;font-weight:600}
.gk-pistas-tabla{display:grid;gap:.5rem}
.gk-pista-fila{background:var(--panel-2);border-radius:10px;padding:.55rem .75rem}
.gk-pista-fila q{display:block;font-style:italic;margin-bottom:.15rem}
.gk-err{padding-left:1.2rem}
.gk-err li{margin:.45rem 0}
.gk-btn{display:inline-block;border:0;border-radius:14px;padding:.8rem 1.2rem;font:inherit;font-weight:700;cursor:pointer;background:var(--violeta);color:#120a26}
.gk-btn.sec{background:transparent;color:var(--crema);border:1px solid var(--linea)}
.gk-volver{border:0;background:none;color:var(--tenue);font:inherit;cursor:pointer;padding:.3rem 0}
.gk-acciones{display:flex;flex-wrap:wrap;gap:.6rem;margin:1rem 0}
`;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function metodo() {
  return `
    <section class="gk-sec" id="gk-metodo">
      <h2>El método en 3 preguntas</h2>
      <p class="gk-lead">Leé la situación y respondé en este orden. La primera respuesta que sea “sí” te dice el concepto.</p>
      <div class="gk-card"><div class="gk-step"><div class="gk-num">1</div><div>
        <h3>¿El texto describe un marco compartido o un problema concreto?</h3>
        <p>Si habla de leyes, supuestos, valores, métodos y ejemplares que la comunidad comparte y que enseña a los nuevos investigadores: <span class="gk-res" style="--c:#9B7BFF">Paradigma</span></p>
        <p>Si describe un problema concreto, pasá a la 2.</p>
      </div></div></div>
      <div class="gk-card"><div class="gk-step"><div class="gk-num">2</div><div>
        <h3>¿El problema encaja con lo que el paradigma espera y se resuelve con sus herramientas?</h3>
        <p>Sí, y la comunidad sabe cómo abordarlo: <span class="gk-res" style="--c:#4FE0A0">Enigma</span> (es parte de la ciencia normal).</p>
        <p>No: no coincide con lo previsto, se revisaron los instrumentos y los procedimientos, y la discrepancia persiste: <span class="gk-res" style="--c:#FFB938">Anomalía</span>. Pasá a la 3.</p>
      </div></div></div>
      <div class="gk-card"><div class="gk-step"><div class="gk-num">3</div><div>
        <h3>¿La dificultad es puntual o se acumula y afecta los fundamentos?</h3>
        <p>Es un fenómeno puntual o un problema localizado: se queda en <span class="gk-res" style="--c:#FFB938">Anomalía</span>.</p>
        <p>Se acumulan anomalías, fallan los ajustes, se discuten los fundamentos, aparecen alternativas y la comunidad pierde confianza: <span class="gk-res" style="--c:#FF5D7A">Crisis</span>.</p>
      </div></div></div>
      <div class="gk-card acento" style="--c:#5CE5BF">
        <h3>Aparte: ¿se comparan dos paradigmas rivales?</h3>
        <p>Si los términos cambian de significado entre tradiciones y no hay una escala neutral para decidir: <span class="gk-res" style="--c:#5CE5BF">Inconmensurabilidad</span>.</p>
      </div>
      <h3 style="margin-top:1.1rem">El ciclo de Kuhn, para ubicarte</h3>
      <div class="gk-ciclo">${CICLO.map(([t, d], i) => `<div class="gk-ciclo-it"><b>${i + 1}. ${esc(t)}</b><span>${esc(d)}</span></div>`).join('')}</div>
    </section>`;
}

function conceptos() {
  return `
    <section class="gk-sec" id="gk-conceptos">
      <h2>Cada concepto, con sus pistas y su justificación</h2>
      <p class="gk-lead">Para cada uno: qué es, qué frases del texto lo delatan, cómo se justifica y con qué se confunde.</p>
      ${CONCEPTOS.map((c) => `
        <article class="gk-card acento" style="--c:${c.color}">
          <div class="gk-tit"><span aria-hidden="true">${c.icono}</span><h3>${esc(c.nombre)}</h3></div>
          <p>${esc(c.que)}</p>
          <div class="gk-lab">Pistas en el texto</div>
          <div class="gk-pistas">${c.pistas.map((p) => `<span class="gk-pista">${esc(p)}</span>`).join('')}</div>
          <div class="gk-lab">Cómo se justifica</div>
          <div class="gk-just">${esc(c.justifica)}</div>
          <div class="gk-lab">No lo confundas</div>
          <p>${esc(c.confunde)}</p>
        </article>`).join('')}
    </section>`;
}

function diferencias() {
  return `
    <section class="gk-sec" id="gk-diferencias">
      <h2>Cómo no confundirlos</h2>
      <p class="gk-lead">Los errores del ejercicio 9 casi siempre son entre conceptos vecinos. Estas son las parejas peligrosas.</p>
      ${PARES.map((p) => `
        <article class="gk-card acento" style="--c:${p.color}">
          <h3>${esc(p.titulo)}</h3>
          <p><b>${esc(p.pregunta)}</b></p>
          <p>${esc(p.texto)}</p>
          <p class="gk-truco">💡 ${esc(p.truco)}</p>
        </article>`).join('')}
    </section>`;
}

function justificar() {
  return `
    <section class="gk-sec" id="gk-justificar">
      <h2>Cómo escribir la justificación</h2>
      <p class="gk-lead">El ejercicio no pide solo el nombre: pide justificar. Una buena justificación tiene tres partes.</p>
      <ol class="gk-receta">
        <li><b>Nombrá el concepto y definilo</b> con las palabras de Kuhn (qué es, en una frase).</li>
        <li><b>Apoyate en el texto:</b> citá o parafraseá la frase concreta que muestra ese rasgo.</li>
        <li><b>Descartá al vecino:</b> explicá en una frase por qué no es el concepto con el que se confunde.</li>
      </ol>
      <div class="gk-plantilla">Se trata de [concepto] porque [definición breve] y en el texto [frase o hecho concreto]. No es [concepto vecino] porque [diferencia clave].</div>
    </section>`;
}

function ejemplo() {
  return `
    <section class="gk-sec" id="gk-ejemplo">
      <h2>Ejemplo resuelto: el texto del modelo de parcial</h2>
      <div class="gk-texto">“Llevamos meses registrando una señal de radio que no encaja con ninguna de las leyes astrofísicas actuales. Al principio pensamos que era un error de calibración de las antenas, pero ya revisamos el software tres veces y la señal sigue ahí, poniendo en entredicho todo lo que pensamos.”</div>
      <div class="gk-lab">Qué dice cada frase</div>
      <div class="gk-pistas-tabla">
        <div class="gk-pista-fila"><q>“no encaja con ninguna de las leyes astrofísicas actuales”</q>No coincide con lo que el paradigma espera. Entonces no es un enigma.</div>
        <div class="gk-pista-fila"><q>“error de calibración… revisamos el software tres veces”</q>Se hicieron controles y se descartaron errores.</div>
        <div class="gk-pista-fila"><q>“la señal sigue ahí”</q>La discrepancia persiste.</div>
        <div class="gk-pista-fila" style="border-left:3px solid var(--ambar)"><q>“poniendo en entredicho todo lo que pensamos”</q><b>Ojo:</b> es la frase que tienta a elegir “crisis”. Pero el texto habla de una sola señal. No describe acumulación de anomalías, propuestas alternativas ni una comunidad que pierde confianza.</div>
      </div>
      <div class="gk-lab">Respuesta: Anomalía</div>
      <div class="gk-just">Se trata de una anomalía porque la señal no encaja con las expectativas del paradigma vigente (las leyes astrofísicas actuales) y resiste los controles: se descartó un error de calibración y se revisó el software tres veces, pero la señal persiste. No es un enigma, porque el paradigma no ofrece los recursos para resolverla. Tampoco es todavía una crisis, porque el texto describe un fenómeno puntual, sin acumulación de dificultades ni pérdida generalizada de confianza de la comunidad en el paradigma.</div>
      <p class="gk-truco">💡 Si en cambio quisieras defender “crisis”, tendrías que justificar con el texto que hay acumulación de anomalías y pérdida de confianza de toda la comunidad. El texto no lo dice, por eso la lectura más sólida es anomalía.</p>
      <h3 style="margin-top:1.1rem">Otros dos casos tipo</h3>
      ${EJEMPLOS.map((e) => `
        <article class="gk-card acento" style="--c:${e.color}">
          <div class="gk-texto">${esc(e.texto)}</div>
          <p style="margin-top:.6rem"><span class="gk-res" style="--c:${e.color}">${esc(e.concepto)}</span></p>
          <p>${esc(e.clave)}</p>
        </article>`).join('')}
    </section>`;
}

function errores() {
  return `
    <section class="gk-sec" id="gk-errores">
      <h2>Errores frecuentes</h2>
      <ul class="gk-err">${ERRORES.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
    </section>`;
}

export function abrirGuiaKuhn({ app, volver, practicar }) {
  if (!document.getElementById('css-guia-kuhn')) {
    const s = document.createElement('style');
    s.id = 'css-guia-kuhn';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  const secciones = [['gk-metodo', 'Método'], ['gk-conceptos', 'Conceptos'], ['gk-diferencias', 'Diferencias'], ['gk-justificar', 'Justificar'], ['gk-ejemplo', 'Ejemplo'], ['gk-errores', 'Errores']];
  app.innerHTML = `
    <main class="pantalla gk">
      <button class="gk-volver" id="gk-volver" type="button">← Segundo parcial</button>
      <span class="gk-kicker">GUÍA DE ESTUDIO · KUHN</span>
      <h1>Ejercicio 9: anomalía, enigma, crisis, paradigma…</h1>
      <p class="gk-lead">En el ejercicio 9 te dan un texto y tenés que identificar qué concepto de Kuhn describe y justificarlo. Acá está cómo distinguirlos y cómo escribir la justificación de cada uno.</p>
      <div class="gk-acciones"><button class="gk-btn" id="gk-practicar-1" type="button">Practicar situaciones tipo parcial →</button></div>
      <nav class="gk-nav" aria-label="Secciones de la guía">${secciones.map(([id, t]) => `<button class="gk-chip" type="button" data-gk="${id}">${t}</button>`).join('')}</nav>
      ${metodo()}${conceptos()}${diferencias()}${justificar()}${ejemplo()}${errores()}
      <div class="gk-acciones"><button class="gk-btn" id="gk-practicar-2" type="button">Practicar situaciones tipo parcial →</button><button class="gk-btn sec" id="gk-volver-2" type="button">Volver al segundo parcial</button></div>
    </main>`;
  app.querySelector('#gk-volver').addEventListener('click', volver);
  app.querySelector('#gk-volver-2').addEventListener('click', volver);
  app.querySelector('#gk-practicar-1').addEventListener('click', practicar);
  app.querySelector('#gk-practicar-2').addEventListener('click', practicar);
  app.querySelectorAll('[data-gk]').forEach((b) => b.addEventListener('click', () => {
    document.getElementById(b.dataset.gk)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  window.scrollTo(0, 0);
}
