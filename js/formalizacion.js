import { Sonido } from './sonido.js?v=dev';

export const TITULO = 'Formalización: lenguaje simbólico';

const PREGUNTAS = [
  { bloque:'Enunciados', prompt:'Si una hipótesis es contrastable, entonces formula una relación que puede ponerse a prueba y sus consecuencias pueden observarse.', codigo:'p = la hipótesis es contrastable · q = formula una relación comprobable · r = sus consecuencias pueden observarse', correcta:'p → (q • r)', opciones:['p → (q • r)','(p → q) • r','p • (q → r)','(p • q) → r'], explicacion:'El “si… entonces” introduce la condicional completa. Las dos afirmaciones unidas por “y” están dentro del consecuente: p → (q • r).' },
  { bloque:'Enunciados', prompt:'O bien una explicación es causal, o bien es descriptiva y se limita a ordenar los hechos.', codigo:'p = la explicación es causal · q = es descriptiva · r = se limita a ordenar los hechos', correcta:'p ∨ (q • r)', opciones:['p ∨ (q • r)','(p ∨ q) • r','p • (q ∨ r)','(p • q) ∨ r'], explicacion:'La disyunción separa dos alternativas. La segunda alternativa contiene una conjunción: q • r.' },
  { bloque:'Enunciados', prompt:'Si una premisa es verdadera, entonces la conclusión puede ser verdadera y la forma lógica puede seguir siendo inválida.', codigo:'p = la premisa es verdadera · q = la conclusión puede ser verdadera · r = la forma puede ser inválida', correcta:'p → (q • r)', opciones:['p → (q • r)','(p → q) • r','p • (q → r)','(p • q) → r'], explicacion:'La verdad de la premisa activa una condicional cuyo consecuente reúne dos afirmaciones. No corresponde dejar r fuera del consecuente.' },
  { bloque:'Enunciados', prompt:'O bien el enunciado es básico, o bien es teórico y depende de otras afirmaciones.', codigo:'p = el enunciado es básico · q = es teórico · r = depende de otras afirmaciones', correcta:'p ∨ (q • r)', opciones:['p ∨ (q • r)','(p ∨ q) • r','p • (q ∨ r)','(p • q) ∨ r'], explicacion:'“O bien” conecta p con el bloque completo “es teórico y depende…”. Por eso se agrupa q • r.' },
  { bloque:'Enunciados', prompt:'Si observamos una correlación sistemática, entonces podemos formular una hipótesis y buscar una implicación contrastadora.', codigo:'p = observamos una correlación sistemática · q = formulamos una hipótesis · r = buscamos una implicación contrastadora', correcta:'p → (q • r)', opciones:['p → (q • r)','(p → q) • r','p • (q → r)','(p • q) → r'], explicacion:'La consecuencia de observar la correlación está formada por dos acciones unidas por “y”.' },
  { bloque:'Enunciados', prompt:'O bien la conclusión se desprende de las premisas, o bien el argumento requiere evidencia adicional y no es deductivamente válido.', codigo:'p = la conclusión se desprende de las premisas · q = requiere evidencia adicional · r = no es deductivamente válido', correcta:'p ∨ (q • r)', opciones:['p ∨ (q • r)','(p ∨ q) • r','p • (q ∨ r)','(p • q) ∨ r'], explicacion:'La segunda alternativa contiene dos afirmaciones coordinadas por “y”. El alcance de la disyunción abarca p y todo el bloque q • r.' },
  { bloque:'Argumentos', prompt:'La evidencia disponible es insuficiente, o la explicación es provisional. Si la evidencia no es insuficiente, entonces la explicación puede someterse a una prueba directa. La explicación no puede someterse a una prueba directa. Por lo tanto, la evidencia disponible es insuficiente.', codigo:'p = evidencia insuficiente · q = explicación provisional · r = explicación puede someterse a prueba directa', correcta:'p ∨ q; ¬p → r; ¬r ⊢ p', opciones:['p ∨ q; ¬p → r; ¬r ⊢ p','p ∨ q; p → r; ¬r ⊢ q','p ∨ q; ¬q → r; ¬r ⊢ p','p ∨ q; ¬p → r; r ⊢ p'], explicacion:'Las premisas son p ∨ q, ¬p → r y ¬r. Por MT, de ¬p → r y ¬r se obtiene p; la conclusión es p.' },
  { bloque:'Argumentos', prompt:'El argumento es válido, o necesita una premisa adicional. Si no necesita una premisa adicional, entonces la conclusión se sigue deductivamente. La conclusión no se sigue deductivamente. Por lo tanto, necesita una premisa adicional.', codigo:'p = argumento válido · q = necesita una premisa adicional · r = la conclusión se sigue deductivamente', correcta:'p ∨ q; ¬q → r; ¬r ⊢ q', opciones:['p ∨ q; ¬q → r; ¬r ⊢ q','p ∨ q; ¬p → r; ¬r ⊢ p','p ∨ q; q → r; ¬r ⊢ p','p ∨ q; ¬q → r; r ⊢ q'], explicacion:'La segunda premisa es ¬q → r y la tercera ¬r. Por MT se obtiene q, que coincide con la conclusión.' },
  { bloque:'Argumentos', prompt:'La muestra es representativa, o los datos son insuficientes. Si la muestra no es representativa, entonces los resultados no permiten generalizar. Los resultados permiten generalizar. Por lo tanto, la muestra es representativa.', codigo:'p = muestra representativa · q = datos insuficientes · r = resultados no permiten generalizar', correcta:'p ∨ q; ¬p → r; ¬r ⊢ p', opciones:['p ∨ q; ¬p → r; ¬r ⊢ p','p ∨ q; ¬q → r; ¬r ⊢ q','p ∨ q; ¬p → r; r ⊢ p','p ∨ q; p → r; ¬r ⊢ q'], explicacion:'“Los resultados permiten generalizar” se simboliza ¬r. Aplicando MT a ¬p → r y ¬r se obtiene p.' },
  { bloque:'Argumentos', prompt:'La teoría es empírica, o contiene términos teóricos. Si no contiene términos teóricos, entonces sus enunciados pueden confrontarse directamente. Sus enunciados no pueden confrontarse directamente. Por lo tanto, la teoría contiene términos teóricos.', codigo:'p = teoría empírica · q = contiene términos teóricos · r = enunciados pueden confrontarse directamente', correcta:'p ∨ q; ¬q → r; ¬r ⊢ q', opciones:['p ∨ q; ¬q → r; ¬r ⊢ q','p ∨ q; ¬p → r; ¬r ⊢ p','p ∨ q; q → r; ¬r ⊢ q','p ∨ q; ¬q → r; r ⊢ q'], explicacion:'La segunda premisa es ¬q → r y la tercera ¬r. Por MT se obtiene q: la teoría contiene términos teóricos.' },
  { bloque:'Argumentos', prompt:'El estudio es experimental, o es observacional. Si no es observacional, entonces interviene deliberadamente sobre las variables. El estudio no interviene deliberadamente sobre las variables. Por lo tanto, es observacional.', codigo:'p = estudio experimental · q = estudio observacional · r = interviene deliberadamente sobre las variables', correcta:'p ∨ q; ¬q → r; ¬r ⊢ q', opciones:['p ∨ q; ¬q → r; ¬r ⊢ q','p ∨ q; ¬p → r; ¬r ⊢ p','p ∨ q; q → r; ¬r ⊢ q','p ∨ q; ¬q → r; r ⊢ q'], explicacion:'La premisa condicional es ¬q → r y se afirma ¬r. Por MT se obtiene q, es decir, que el estudio es observacional.' },
  { bloque:'Argumentos', prompt:'La explicación es causal, o es meramente descriptiva. Si no es descriptiva, entonces pretende identificar una relación causal. La explicación no pretende identificar una relación causal. Por lo tanto, es meramente descriptiva.', codigo:'p = explicación causal · q = explicación descriptiva · r = pretende identificar una relación causal', correcta:'p ∨ q; ¬q → r; ¬r ⊢ q', opciones:['p ∨ q; ¬q → r; ¬r ⊢ q','p ∨ q; ¬p → r; ¬r ⊢ p','p ∨ q; q → r; ¬r ⊢ q','p ∨ q; ¬q → r; r ⊢ q'], explicacion:'“No es descriptiva” es ¬q. La condicional ¬q → r junto con ¬r permite obtener q por MT.' }
];

const mezclar = (a) => {
  const b = [...a];
  for (let i=b.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; }
  return b;
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function abrirFormalizacion({ app, volver }) {
  let modo = 'Enunciados';
  let preguntas = [];
  let indice = 0;
  let aciertos = 0;
  let respondida = false;
  let seleccion = null;

  function inicio() {
    app.innerHTML = `
      <main class="pantalla fm-wrap">
        <button class="btn enlace" id="fm-volver">← Volver a IPC</button>
        <div class="titulo-materia"><span class="emoji">🔣</span><h1>${TITULO}</h1></div>
        <p class="bajada">Practicá con el formato del modelo: identificá la estructura lógica, respetá el alcance de los conectores y reconstruí argumentos completos.</p>
        <section class="fm-panel">
          <h2>Elegí el tipo de práctica</h2>
          <button class="fm-modo" data-modo="Enunciados"><strong>1. Formalización de enunciados</strong><small>Traducir oraciones al lenguaje simbólico y reconocer paréntesis.</small></button>
          <button class="fm-modo" data-modo="Argumentos"><strong>2. Código y formalización de argumentos</strong><small>Separar premisas y conclusión, asignar letras y elegir la forma completa.</small></button>
        </section>
        <p class="fm-nota">Todas las respuestas son seleccionables. Después de cada elección aparece la corrección y el motivo.</p>
      </main>`;
    app.querySelector('#fm-volver').addEventListener('click', volver);
    app.querySelectorAll('[data-modo]').forEach(b=>b.addEventListener('click',()=>{modo=b.dataset.modo; iniciar();}));
    window.scrollTo(0,0);
  }

  function iniciar() {
    preguntas = mezclar(PREGUNTAS.filter(p=>p.bloque===modo));
    indice=0; aciertos=0; respondida=false; seleccion=null;
    render();
  }

  function render() {
    const p=preguntas[indice];
    const opciones=mezclar(p.opciones);
    const progreso=Math.round(indice/preguntas.length*100);
    app.innerHTML=`
      <main class="pantalla fm-wrap">
        <button class="btn enlace" id="fm-salir">← Elegir otra práctica</button>
        <div class="fm-cabecera"><span>${esc(modo)}</span><span>${indice+1} / ${preguntas.length}</span></div>
        <div class="fm-progreso"><span style="width:${progreso}%"></span></div>
        <section class="fm-panel">
          <p class="fm-etiqueta">EJERCICIO ${indice+1}</p>
          <h2>${esc(p.prompt)}</h2>
          ${modo==='Argumentos'?'<p class="fm-ayuda">Elegí el código y la formalización que representan correctamente todas las premisas y la conclusión.</p>':''}
          <div class="fm-opciones">${opciones.map((o,n)=>`<button class="fm-opcion" data-op="${n}"><span>${String.fromCharCode(65+n)}</span><code>${esc(o)}</code></button>`).join('')}</div>
          <div id="fm-feedback" aria-live="polite"></div>
          <button class="btn primario" id="fm-siguiente" hidden>${indice===preguntas.length-1?'Ver resultado':'Siguiente ejercicio'} →</button>
        </section>
      </main>`;
    app.querySelector('#fm-salir').addEventListener('click',inicio);
    const opcionesActuales=app.querySelectorAll('[data-op]');
    const lista=app.querySelector('.fm-opciones');
    const visibles=[...lista.querySelectorAll('.fm-opcion')].map(b=>b.querySelector('code').textContent);
    opcionesActuales.forEach(b=>b.addEventListener('click',()=>{
      if(respondida)return;
      respondida=true;
      const elegida=visibles[Number(b.dataset.op)];
      const bien=elegida===p.correcta;
      if(bien)aciertos++;
      opcionesActuales.forEach(x=>{
        x.disabled=true;
        const valor=x.querySelector('code').textContent;
        if(valor===p.correcta)x.classList.add('fm-correcta');
        else if(x===b&&!bien)x.classList.add('fm-incorrecta');
      });
      app.querySelector('#fm-feedback').innerHTML=`
        <div class="fm-explica ${bien?'ok':'error'}"><strong>${bien?'¡Correcto!':'No es esa opción.'}</strong>
        <p><b>Respuesta:</b> <code>${esc(p.correcta)}</code></p>
        <p><b>Código:</b> ${esc(p.codigo)}</p><p>${esc(p.explicacion)}</p></div>`;
      const sig=app.querySelector('#fm-siguiente'); sig.hidden=false;
      sig.addEventListener('click',()=>{indice++;if(indice<preguntas.length)render();else resultado();});
    }));
    window.scrollTo(0,0);
  }

  function resultado() {
    app.innerHTML=`
      <main class="pantalla fm-wrap"><button class="btn enlace" id="fm-inicio">← Volver a prácticas</button>
      <section class="fm-panel fm-final"><p class="fm-etiqueta">RESULTADO</p><h2>${aciertos} de ${preguntas.length} correctas</h2>
      <p>${Math.round(aciertos/preguntas.length*100)}% de precisión en ${esc(modo.toLowerCase())}.</p>
      <button class="btn primario" id="fm-repetir">Repetir esta práctica</button></section></main>`;
    app.querySelector('#fm-inicio').addEventListener('click',inicio);
    app.querySelector('#fm-repetir').addEventListener('click',iniciar);
    window.scrollTo(0,0);
  }

  if(!document.getElementById('estilos-formalizacion')) {
    const st=document.createElement('style');st.id='estilos-formalizacion';
    st.textContent=`
      .fm-wrap{max-width:880px;margin:0 auto;padding-bottom:2rem}
      .fm-panel{background:var(--panel,rgba(128,128,128,.08));border:1px solid var(--borde,rgba(128,128,128,.2));border-radius:16px;padding:clamp(16px,3vw,24px);margin-top:18px}
      .fm-panel h2{font-size:1.12rem;line-height:1.5;margin:8px 0 18px}
      .fm-modo{display:flex;flex-direction:column;gap:6px;text-align:left;width:100%;padding:16px;border:1px solid var(--borde,rgba(128,128,128,.22));border-radius:12px;background:transparent;color:inherit;margin:10px 0;cursor:pointer}
      .fm-modo strong{font-size:1rem}.fm-modo small{opacity:.75;line-height:1.4}
      .fm-nota,.fm-ayuda{opacity:.75;font-size:.9rem;line-height:1.5}
      .fm-cabecera{display:flex;justify-content:space-between;gap:12px;margin-top:16px;font-size:.9rem;font-weight:700}
      .fm-progreso{height:6px;border-radius:8px;background:rgba(128,128,128,.18);overflow:hidden;margin-top:10px}.fm-progreso span{display:block;height:100%;background:var(--acento,#6b8afd)}
      .fm-etiqueta{font-size:.72rem;letter-spacing:.1em;font-weight:800;opacity:.65}
      .fm-opciones{display:grid;gap:10px;margin:18px 0}
      .fm-opcion{display:flex;align-items:flex-start;gap:12px;text-align:left;width:100%;padding:13px;border:1px solid var(--borde,rgba(128,128,128,.22));border-radius:12px;background:transparent;color:inherit;cursor:pointer;min-width:0}
      .fm-opcion>span{flex:0 0 26px;height:26px;border-radius:50%;display:grid;place-items:center;background:rgba(128,128,128,.15);font-weight:800}
      .fm-opcion code,.fm-explica code{white-space:normal;overflow-wrap:anywhere;font-size:.92rem}
      .fm-opcion.fm-correcta{border-color:#2c9b67;background:rgba(44,155,103,.1)}
      .fm-opcion.fm-incorrecta{border-color:#c65a5a;background:rgba(198,90,90,.1)}
      .fm-explica{padding:14px;border-radius:12px;margin:14px 0;line-height:1.5;background:rgba(128,128,128,.1)}
      .fm-explica.ok{border-left:4px solid #2c9b67}.fm-explica.error{border-left:4px solid #c65a5a}
      .fm-explica p{margin:8px 0}.fm-final{text-align:center}
      @media(max-width:560px){.fm-panel{padding:14px}.fm-opcion{padding:11px}.fm-opcion code{font-size:.84rem}}
    `;
    document.head.appendChild(st);
  }
  inicio();
}
