import { abrirCuadro, TITULO as TITULO_CUADRO } from './cuadro.js?v=dev';
import { abrirLacTrp, TITULO as TITULO_LAC_TRP } from './lac-vs-trp.js?v=20261026-1';
import { abrirComparadorComunicacion, TITULO as TITULO_COMUNICACION } from './comparador-comunicacion.js?v=20261026-1';

export const TITULO = 'Comparadores de conceptos';

export function abrirComparadores({ app, volver, temaCuadro }) {
  const items = [
    { id: 'cuadro', icon: '🧬', titulo: 'Duplicación vs. transcripción vs. traducción', detalle: 'Tres procesos, criterios comunes y diferencias moleculares', abrir: abrirCuadro, args: { tema: temaCuadro } },
    { id: 'lac', icon: '🧫', titulo: 'Operón lac vs. operón trp', detalle: 'Inducción, represión, lactosa, glucosa y triptófano', abrir: abrirLacTrp, args: {} },
    { id: 'comunicacion', icon: '🔁', titulo: 'Métodos de comunicación celular', detalle: 'Endocrina, paracrina, autocrina, neuronal y neuroendocrina', abrir: abrirComparadorComunicacion, args: {} },
  ];
  const css = '.cmp{max-width:900px;margin:auto;padding:clamp(12px,3vw,24px);font-family:Inter,system-ui,sans-serif;color:var(--texto,#fff3dc)}.cmp *{box-sizing:border-box}.cmp .hero{padding:22px;border:1px solid #594574;border-radius:20px;background:linear-gradient(135deg,#332153,#19132b);margin:16px 0}.cmp .eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#c5b0ff}.cmp h1{font-size:clamp(1.5rem,4vw,2.2rem);margin:8px 0}.cmp p{line-height:1.6}.cmp .back,.cmp .item{font:inherit;cursor:pointer;border:1px solid #574574;background:#251b3b;color:#fff3dc;border-radius:15px;padding:14px;text-align:left}.cmp .list{display:grid;gap:12px}.cmp .item{display:flex;align-items:center;gap:14px;width:100%;transition:transform .15s,border-color .15s}.cmp .item:hover{transform:translateY(-1px);border-color:#9b7bff}.cmp .ico{display:grid;place-items:center;flex:0 0 44px;height:44px;border-radius:13px;background:#392957;font-size:1.35rem}.cmp .body{flex:1;min-width:0}.cmp .name{display:block;font-weight:800;margin-bottom:5px}.cmp .detail{display:block;color:#cfc1e4;font-size:.9rem;line-height:1.4}.cmp .arrow{font-size:1.2rem;color:#c5b0ff}@media(prefers-reduced-motion:reduce){.cmp .item{transition:none}}';
  if (!document.getElementById('css-comparadores')) { const s=document.createElement('style'); s.id='css-comparadores'; s.textContent=css; document.head.appendChild(s); }
  app.innerHTML = '<main class="cmp"><button class="back" id="cmp-back">← Volver a juegos</button><header class="hero"><div class="eyebrow">Estudio comparativo</div><h1>Comparadores de conceptos</h1><p>Elegí una familia de conceptos y estudiá las diferencias con los mismos criterios. Cada actividad combina comparación y práctica.</p></header><div class="list">'+items.map((x)=>'<button class="item" data-cmp="'+x.id+'"><span class="ico" aria-hidden="true">'+x.icon+'</span><span class="body"><span class="name">'+x.titulo+'</span><span class="detail">'+x.detalle+'</span></span><span class="arrow" aria-hidden="true">→</span></button>').join('')+'</div></main>';
  app.querySelector('#cmp-back').addEventListener('click', volver);
  app.querySelectorAll('[data-cmp]').forEach(b=>b.addEventListener('click',()=>{
    const item=items.find(x=>x.id===b.dataset.cmp);
    if (!item) return;
    item.abrir({app, volver:()=>abrirComparadores({app,volver,temaCuadro}), ...item.args});
  }));
}
