// Parcialito LAB: catálogo de laboratorios interactivos.
export function abrirLab({ app, volver }) {
  const componentes = {
    adn: { nombre: 'ADN: doble hélice', tipo: 'Ácido nucleico', color: '#4f9cff', texto: 'El ADN está formado por nucleótidos. Cada uno contiene desoxirribosa, fosfato y una base nitrogenada (A, T, C o G). Las dos hebras son complementarias y antiparalelas: una corre 5′→3′ y la otra 3′→5′.', dato: 'Las bases forman pares: A–T y G–C.' },
    promotor: { nombre: 'Promotor', tipo: 'Región de ADN', color: '#ffbd59', texto: 'Es una región del ADN cercana al sitio donde comienza la transcripción. En genes eucariotas, algunos promotores contienen elementos como la caja TATA; no todos los promotores tienen la misma composición.', dato: 'El sitio +1 es el primer nucleótido transcrito.' },
    enhancer: { nombre: 'Enhancer', tipo: 'Región reguladora de ADN', color: '#ff8a45', texto: 'Secuencia reguladora a la que se unen factores específicos. Puede encontrarse a cierta distancia del promotor y favorecer la transcripción mediante interacciones con el complejo regulador.', dato: 'Un enhancer es ADN, no una proteína.' },
    especifico: { nombre: 'Factor específico', tipo: 'Proteína reguladora', color: '#ff8a45', texto: 'Reconoce secuencias reguladoras concretas y puede actuar como activador o represor. Su efecto depende del contexto celular, de las otras proteínas presentes y de la organización de la cromatina.', dato: 'Los factores específicos no son bases nitrogenadas: son proteínas.' },
    basal: { nombre: 'Factores basales', tipo: 'Proteínas / complejo de iniciación', color: '#28d7b0', texto: 'Los factores generales de transcripción ayudan a reconocer el promotor, reclutar y posicionar la ARN polimerasa II y formar el complejo de preiniciación. Entre ellos están TFIID (que incluye TBP), TFIIB, TFIIF, TFIIE y TFIIH.', dato: 'Son necesarios para la iniciación basal de la transcripción por ARN polimerasa II.' },
    polimerasa: { nombre: 'ARN polimerasa II', tipo: 'Complejo enzimático proteico', color: '#a58bff', texto: 'En eucariotas, sintetiza pre-ARNm usando una hebra de ADN como molde. Lee el molde en sentido 3′→5′ y sintetiza ARN en sentido 5′→3′.', dato: 'No “convierte” bases en proteínas: produce una cadena de ARN.' },
    arn: { nombre: 'ARN naciente', tipo: 'Ácido nucleico', color: '#ff5f9e', texto: 'La cadena de ARN crece incorporando ribonucleótidos complementarios a la hebra molde. En ARN se usa uracilo (U) en lugar de timina (T).', dato: 'El ARN se sintetiza en dirección 5′→3′.' }
  };
  const pasos = [
    { titulo: '1. ADN y regiones reguladoras', id: 'adn', texto: 'La información está en el ADN. El promotor y otras secuencias reguladoras son tramos de ADN, no proteínas.' },
    { titulo: '2. Unión de factores específicos', id: 'especifico', texto: 'Activadores o represores reconocen secuencias reguladoras y modulan la probabilidad de iniciar la transcripción.' },
    { titulo: '3. Ensamblaje basal', id: 'basal', texto: 'Los factores generales organizan el complejo de preiniciación en el promotor y facilitan la participación de la polimerasa.' },
    { titulo: '4. Inicio de la transcripción', id: 'polimerasa', texto: 'La ARN polimerasa II usa una hebra como molde y comienza a sintetizar ARN a partir del sitio de inicio (+1).' },
    { titulo: '5. El ARN crece', id: 'arn', texto: 'La cadena nueva crece 5′→3′. La secuencia del ARN es complementaria al molde y coincide con la codificante salvo U en lugar de T.' }
  ];
  let seleccionado = 'basal', paso = -1, giro = 0;
  app.innerHTML = `
    <main class="pantalla lab-pantalla">
      <header class="cabecera"><button class="btn secundario" id="lab-volver">← Inicio</button><h1 class="marca">Parcialito <span style="color:#9B7BFF">LAB</span></h1><span class="lab-chip">EXPLORACIÓN</span></header>
      <section class="lab-intro"><p class="lab-eyebrow">LABORATORIO INTERACTIVO · BIOLOGÍA 2</p><h2>Dentro de la transcripción</h2><p>Explorá el ADN, las regiones reguladoras y las proteínas que coordinan la transcripción eucariota.</p></section>
      <section class="lab-catalogo">
        <article class="lab-card lab-card-activo"><div class="lab-card-icon">🧬</div><div><span class="lab-estado">DISPONIBLE</span><h3>Transcripción y factores de transcripción</h3><p>Modelo molecular didáctico · ADN, promotor, factores basales y específicos, ARN polimerasa II.</p><div class="lab-tags"><span>Cuasi-3D</span><span>Explorable</span><span>Modo guiado</span></div></div></article>
        <article class="lab-card lab-card-proximo"><div class="lab-card-icon">⚡</div><div><span class="lab-estado">PRÓXIMAMENTE</span><h3>Comunicación celular</h3><p>Receptores, proteínas G y cascadas de señalización.</p></div></article>
        <article class="lab-card lab-card-proximo"><div class="lab-card-icon">🧠</div><div><span class="lab-estado">PRÓXIMAMENTE</span><h3>Sinapsis e impulso nervioso</h3><p>Canales iónicos, potencial de acción y neurotransmisores.</p></div></article>
      </section>
      <section class="lab-real">
        <div class="lab-explorador-cab"><div><span class="lab-eyebrow">ESTRUCTURA MOLECULAR REAL</span><h2>Complejo de preiniciación de la transcripción</h2></div><span class="lab-chip">PDB · 7ML2</span></div>
        <p class="lab-real-intro">Vista molecular interactiva de una estructura experimental de ARN polimerasa II con ADN y componentes del complejo de iniciación. Arrastrá para rotar y usá el zoom para acercarte. Esta estructura corresponde a un complejo de levadura; sirve para explorar la arquitectura molecular, no como mapa exacto de cada gen humano.</p>
        <div class="lab-real-view">
          <pdbe-molstar id="lab-pdbe" molecule-id="7ml2" hide-controls="false" hide-logo="true" bg-color-r="10" bg-color-g="9" bg-color-b="23" lighting="glossy" style="display:block;width:100%;height:560px"></pdbe-molstar>
          <div class="lab-real-fallback" id="lab-real-fallback">Cargando visualizador molecular… Si no aparece, revisá la conexión a internet; el visor usa la biblioteca de PDBe.</div>
        </div>
        <div class="lab-real-footer"><span>🧬 Estructura experimental · representación 3D</span><a href="https://www.rcsb.org/structure/7ML2" target="_blank" rel="noopener noreferrer">Consultar ficha científica ↗</a></div>
      </section>
      <section class="lab-explorador">
        <div class="lab-explorador-cab"><div><span class="lab-eyebrow">MÓDULO 01</span><h2>Maquinaria de transcripción</h2></div><button class="btn secundario" id="lab-giro">↻ Rotar modelo</button></div>
        <div class="lab-workspace">
          <div class="lab-visual">
            <div class="lab-visual-top"><span>MODELO ESQUEMÁTICO</span><span>Seleccioná una pieza</span></div>
            <div class="lab-molecule" id="lab-molecule" style="--giro:0deg">
              <svg viewBox="0 0 760 380" role="img" aria-label="Modelo didáctico de ADN y complejo de transcripción">
                <defs><linearGradient id="labDna" x1="0" x2="1"><stop stop-color="#2478e8"/><stop offset=".5" stop-color="#58c5ff"/><stop offset="1" stop-color="#2478e8"/></linearGradient><linearGradient id="labProtein" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d4c7ff"/><stop offset="1" stop-color="#7655e8"/></linearGradient></defs>
                <g class="lab-helix" id="lab-helix">
                  <path d="M28 178 C80 95 125 95 178 178 S275 261 328 178 S425 95 478 178 S575 261 628 178 S710 95 748 145" fill="none" stroke="url(#labDna)" stroke-width="12" stroke-linecap="round"/>
                  <path d="M28 224 C80 307 125 307 178 224 S275 141 328 224 S425 307 478 224 S575 141 628 224 S710 307 748 257" fill="none" stroke="#3c82f6" stroke-width="12" stroke-linecap="round"/>
                  ${Array.from({length:23},(_,i)=>{const x=35+i*31;const y1=178+Math.sin(i*.72)*63;const y2=224-Math.sin(i*.72)*63;return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${['#ffbd59','#52dfb2','#ff7ba5','#a58bff'][i%4]}" stroke-width="4" opacity=".95"/>`}).join('')}
                </g>
                <g class="lab-part" data-part="enhancer" tabindex="0" role="button" aria-label="Seleccionar enhancer"><rect x="58" y="145" width="100" height="22" rx="8" fill="#ff8a45" opacity=".95"/><text x="108" y="138" text-anchor="middle" fill="#ffd3b3" font-size="13">ENHANCER</text></g>
                <g class="lab-part" data-part="especifico" tabindex="0" role="button" aria-label="Seleccionar factor específico" transform="translate(140 45)"><path d="M0 44 C-17 15 8 -4 31 9 C53 -11 82 9 78 32 C101 50 79 76 57 69 C33 87 8 70 0 44Z" fill="#ff963e" stroke="#ffc18b" stroke-width="2"/><circle cx="28" cy="30" r="7" fill="#ffe2c9" opacity=".7"/><text x="39" y="97" fill="#ffc18b" font-size="13" text-anchor="middle">FACTOR ESPECÍFICO</text></g>
                <g class="lab-part" data-part="promotor" tabindex="0" role="button" aria-label="Seleccionar promotor"><rect x="347" y="198" width="105" height="17" rx="7" fill="#ffbd59" stroke="#ffe1a3" stroke-width="2"/><text x="399" y="242" fill="#ffdb91" font-size="13" text-anchor="middle">PROMOTOR</text></g>
                <g class="lab-part" data-part="basal" tabindex="0" role="button" aria-label="Seleccionar factores basales" transform="translate(342 106)"><path d="M6 42 C-3 8 29 -4 49 12 C66 -5 98 11 93 37 C119 54 98 83 73 75 C49 93 20 78 6 42Z" fill="#20bda2" stroke="#83ffe8" stroke-width="2"/><circle cx="40" cy="37" r="10" fill="#9cffe9" opacity=".7"/><text x="49" y="101" fill="#83ffe8" font-size="13" text-anchor="middle">FACTORES BASALES</text></g>
                <g class="lab-part" data-part="polimerasa" tabindex="0" role="button" aria-label="Seleccionar ARN polimerasa II" transform="translate(442 99)"><path d="M18 20 C1 -3 48 -15 65 6 C91 -10 121 8 113 32 C141 51 119 86 92 78 C69 98 37 80 35 64 C8 64 2 41 18 20Z" fill="url(#labProtein)" stroke="#c9bcff" stroke-width="2"/><circle cx="75" cy="35" r="13" fill="#f0eaff" opacity=".6"/><text x="66" y="111" fill="#c9bcff" font-size="13" text-anchor="middle">ARN POL II</text></g>
                <g class="lab-part" data-part="arn" tabindex="0" role="button" aria-label="Seleccionar ARN naciente"><path d="M500 240 C526 270 552 266 576 286 S630 310 668 295" fill="none" stroke="#ff5f9e" stroke-width="9" stroke-linecap="round"/><circle cx="526" cy="262" r="5" fill="#ffb3d0"/><circle cx="576" cy="286" r="5" fill="#ffb3d0"/><circle cx="626" cy="304" r="5" fill="#ffb3d0"/><text x="610" y="340" fill="#ff9fc5" font-size="14" text-anchor="middle">ARN NACIENTE</text></g>
                <text x="25" y="270" fill="#a9caff" font-size="15">3′</text><text x="26" y="157" fill="#a9caff" font-size="15">5′</text><text x="718" y="124" fill="#a9caff" font-size="15">3′</text><text x="718" y="281" fill="#a9caff" font-size="15">5′</text>
              </svg>
            </div>
            <div class="lab-leyenda"><span><i style="background:#4f9cff"></i>ADN</span><span><i style="background:#ffbd59"></i>Región de ADN</span><span><i style="background:#ff8a45"></i>Factor específico</span><span><i style="background:#28d7b0"></i>Factores basales</span><span><i style="background:#a58bff"></i>ARN pol II</span><span><i style="background:#ff5f9e"></i>ARN</span></div>
            <p class="lab-aviso-modelo">Esquema conceptual, no una estructura atómica a escala. Las posiciones son ilustrativas; la organización real depende del gen y del complejo.</p>
          </div>
          <aside class="lab-info" aria-live="polite"><span class="lab-info-tipo" id="lab-tipo">PROTEÍNAS</span><h3 id="lab-nombre">Factores basales</h3><p id="lab-texto"></p><div class="lab-dato" id="lab-dato"></div><div class="lab-quiz-mini"><strong>¿Qué estás viendo?</strong><p id="lab-pregunta">Los factores basales son…</p><div id="lab-opciones"><button data-answer="proteina">Proteínas</button><button data-answer="base">Bases nitrogenadas</button><button data-answer="region">Región de ADN</button><button data-answer="acido">Ácido nucleico</button></div><p id="lab-feedback" role="status"></p></div></aside>
        </div>
        <section class="lab-guia"><div><span class="lab-eyebrow">RECORRIDO GUIADO</span><h3 id="lab-paso-titulo">Explorá libremente</h3><p id="lab-paso-texto">Seleccioná los componentes del modelo para conocer su naturaleza y función.</p></div><div class="lab-guia-acciones"><button class="btn secundario" id="lab-anterior">← Anterior</button><button class="btn primario" id="lab-siguiente">Empezar recorrido →</button></div></section>
      </section>
      <section class="lab-claves"><h2>Regla visual para el examen</h2><div class="lab-clave-grid"><article><b style="color:#ffbd59">ADN</b><p>Promotor, enhancer y sitios reguladores: son secuencias de nucleótidos.</p></article><article><b style="color:#28d7b0">PROTEÍNAS</b><p>Factores basales, factores específicos y ARN polimerasa II: son componentes proteicos.</p></article><article><b style="color:#ff5f9e">ARN</b><p>El producto inicial es ARN; luego el pre-ARNm eucariota suele procesarse.</p></article></div></section>
    </main>
    <style>
      .lab-pantalla{max-width:1180px}.lab-real{margin:24px 0;border:1px solid var(--linea);border-radius:22px;overflow:hidden;background:rgba(12,10,27,.55)}.lab-real-intro{color:var(--tenue);font-size:.88rem;line-height:1.6;padding:0 22px;max-width:920px}.lab-real-view{position:relative;background:#0a0917;min-height:360px}.lab-real-view pdbe-molstar{min-height:360px}.lab-real-fallback{padding:12px 18px;color:#a99dc8;font-size:.75rem}.lab-real-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 18px;border-top:1px solid var(--linea);font-size:.75rem;color:#a99dc8}.lab-real-footer a{color:#c7b8ff;text-decoration:none}.lab-real-footer a:hover{text-decoration:underline}.lab-pantalla .cabecera{gap:12px;align-items:center}.lab-pantalla .marca{font-size:clamp(1.2rem,3vw,1.7rem)}.lab-chip,.lab-tags span{font-size:.72rem;letter-spacing:.07em;border:1px solid #51417c;border-radius:999px;padding:6px 9px;color:#c7b8ff;white-space:nowrap}.lab-intro{padding:26px 0 16px}.lab-eyebrow{font-size:.7rem;letter-spacing:.14em;font-weight:800;color:#a995ff}.lab-intro h2{font-size:clamp(1.8rem,4vw,2.7rem);margin:7px 0}.lab-intro p{color:var(--tenue);max-width:690px;line-height:1.6}.lab-catalogo{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0 28px}.lab-card{border:1px solid var(--linea);background:linear-gradient(145deg,rgba(46,32,88,.82),rgba(23,15,46,.8));border-radius:18px;padding:16px;display:flex;gap:12px;min-width:0}.lab-card-activo{border-color:#9b7bff;box-shadow:inset 0 0 0 1px #9b7bff33}.lab-card-icon{font-size:1.8rem}.lab-estado{font-size:.65rem;font-weight:800;letter-spacing:.12em;color:#4fe0a0}.lab-card-proximo .lab-estado{color:#b8abdb}.lab-card h3{font-size:1rem;margin:7px 0}.lab-card p{font-size:.83rem;color:var(--tenue);line-height:1.5;margin:0 0 12px}.lab-tags{display:flex;gap:5px;flex-wrap:wrap}.lab-tags span{font-size:.62rem;padding:4px 7px;letter-spacing:0}.lab-explorador{border:1px solid var(--linea);border-radius:22px;overflow:hidden;background:rgba(12,10,27,.45)}.lab-explorador-cab{padding:20px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--linea)}.lab-explorador-cab h2{margin:5px 0 0;font-size:1.25rem}.lab-workspace{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,.8fr)}.lab-visual{padding:14px;min-width:0;border-right:1px solid var(--linea)}.lab-visual-top{display:flex;justify-content:space-between;gap:10px;color:var(--tenue);font-size:.65rem;letter-spacing:.07em}.lab-molecule{perspective:900px;transform-style:preserve-3d;transition:transform .6s ease;filter:drop-shadow(0 16px 24px #05030c77)}.lab-molecule svg{width:100%;height:auto;overflow:visible}.lab-molecule .lab-helix{transform-origin:380px 190px;transition:transform .6s ease}.lab-molecule .lab-part{cursor:pointer;outline:none;transition:filter .2s}.lab-molecule .lab-part:hover,.lab-molecule .lab-part:focus{filter:drop-shadow(0 0 9px #fff8)}.lab-molecule .lab-part.seleccionado{filter:drop-shadow(0 0 11px #fff)}.lab-molecule.giro-a{transform:rotateY(8deg) rotateX(2deg)}.lab-molecule.giro-b{transform:rotateY(-8deg) rotateX(-2deg)}.lab-leyenda{display:flex;gap:9px 14px;flex-wrap:wrap;padding:10px 2px}.lab-leyenda span{font-size:.68rem;color:#d0c7e9;display:flex;align-items:center;gap:5px}.lab-leyenda i{width:9px;height:9px;border-radius:50%;display:inline-block}.lab-aviso-modelo{font-size:.7rem;line-height:1.45;color:#9287b6;margin:5px 0}.lab-info{padding:22px;background:rgba(35,24,69,.55)}.lab-info-tipo{font-size:.68rem;letter-spacing:.1em;font-weight:800;color:#28d7b0}.lab-info h3{font-size:1.3rem;margin:9px 0}.lab-info>p{font-size:.9rem;line-height:1.65;color:#d6cdea}.lab-dato{border-left:3px solid #9b7bff;background:#9b7bff12;padding:11px 12px;font-size:.82rem;line-height:1.5;margin:16px 0}.lab-quiz-mini{border-top:1px solid var(--linea);padding-top:15px;margin-top:18px}.lab-quiz-mini strong{font-size:.9rem}.lab-quiz-mini p{font-size:.82rem;color:var(--tenue)}#lab-opciones{display:grid;gap:7px}#lab-opciones button{border:1px solid #51417c;border-radius:10px;padding:9px;background:#21183e;color:var(--crema);text-align:left;font:inherit;font-size:.8rem;cursor:pointer}#lab-opciones button:hover{border-color:#9b7bff}#lab-feedback{min-height:1.2em;font-weight:700}.lab-guia{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 22px;border-top:1px solid var(--linea)}.lab-guia h3{margin:6px 0}.lab-guia p{color:var(--tenue);font-size:.86rem;line-height:1.5;max-width:620px;margin-bottom:0}.lab-guia-acciones{display:flex;gap:8px;flex-shrink:0}.lab-claves{padding:28px 0}.lab-claves h2{font-size:1.2rem}.lab-clave-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.lab-clave-grid article{border:1px solid var(--linea);border-radius:15px;padding:16px;background:#23184555}.lab-clave-grid p{color:var(--tenue);font-size:.85rem;line-height:1.55;margin-bottom:0}
      @media(max-width:760px){.lab-real-view pdbe-molstar{height:430px!important}.lab-real-intro{padding:0 14px}.lab-real-footer{padding:12px 14px}.lab-catalogo{grid-template-columns:1fr}.lab-card{padding:13px}.lab-workspace{grid-template-columns:1fr}.lab-visual{border-right:0;border-bottom:1px solid var(--linea);padding:10px}.lab-info{padding:18px}.lab-guia{align-items:stretch;flex-direction:column}.lab-guia-acciones{display:grid;grid-template-columns:1fr 1fr}.lab-explorador-cab{align-items:flex-start;padding:16px}.lab-chip{font-size:.6rem}.lab-visual-top{font-size:.58rem}.lab-leyenda{gap:8px}.lab-leyenda span{font-size:.62rem}.lab-clave-grid{grid-template-columns:1fr}.lab-pantalla .cabecera{flex-wrap:wrap}.lab-pantalla .marca{margin-right:auto}}
      @media(prefers-reduced-motion:reduce){.lab-molecule,.lab-molecule *{transition:none!important}}
    </style>`;
  const seleccionar = (id) => {
    const c = componentes[id] || componentes.basal;
    seleccionado = id;
    app.querySelectorAll('.lab-part').forEach((el) => el.classList.toggle('seleccionado', el.dataset.part === id));
    document.getElementById('lab-tipo').textContent = c.tipo.toUpperCase();
    document.getElementById('lab-tipo').style.color = c.color;
    document.getElementById('lab-nombre').textContent = c.nombre;
    document.getElementById('lab-texto').textContent = c.texto;
    document.getElementById('lab-dato').textContent = c.dato;
    document.getElementById('lab-feedback').textContent = '';
    const answer = id === 'promotor' || id === 'enhancer' ? 'region' : id === 'adn' || id === 'arn' ? 'acido' : 'proteina';
    document.querySelectorAll('#lab-opciones button').forEach((b) => { b.disabled = false; b.style.borderColor = '#51417c'; b.style.opacity = '1'; });
    document.querySelector('#lab-opciones [data-answer="acido"]').textContent = id === 'adn' ? 'Ácido nucleico (ADN)' : 'Ácido nucleico (ARN)';
    document.querySelectorAll('#lab-opciones button').forEach((b) => b.dataset.correct = String(b.dataset.answer === answer));
  };
  app.querySelectorAll('.lab-part').forEach((el) => {
    const activar = () => seleccionar(el.dataset.part);
    el.addEventListener('click', activar);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activar(); } });
  });
  document.getElementById('lab-volver').addEventListener('click', volver);
  document.getElementById('lab-giro').addEventListener('click', () => {
    giro++; const m = document.getElementById('lab-molecule'); m.classList.remove('giro-a','giro-b'); m.classList.add(giro % 2 ? 'giro-a' : 'giro-b');
    document.getElementById('lab-helix').style.transform = giro % 2 ? 'rotateY(14deg) skewY(-2deg)' : 'rotateY(-14deg) skewY(2deg)';
  });
  document.getElementById('lab-opciones').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-answer]'); if (!b) return;
    const ok = b.dataset.correct === 'true';
    document.getElementById('lab-feedback').textContent = ok ? '¡Bien! Identificaste la naturaleza de este componente.' : 'No exactamente. Revisá el tipo indicado arriba y volvé a intentarlo.';
    document.getElementById('lab-feedback').style.color = ok ? '#4fe0a0' : '#ff8b9e';
    if (ok) document.querySelectorAll('#lab-opciones button').forEach((x) => { x.disabled = true; x.style.opacity = x === b ? '1' : '.5'; });
  });
  const mostrarPaso = (n) => {
    paso = Math.max(-1, Math.min(pasos.length - 1, n));
    const titulo = document.getElementById('lab-paso-titulo'), texto = document.getElementById('lab-paso-texto'), sig = document.getElementById('lab-siguiente'), ant = document.getElementById('lab-anterior');
    if (paso < 0) { titulo.textContent = 'Explorá libremente'; texto.textContent = 'Seleccioná los componentes del modelo para conocer su naturaleza y función.'; sig.textContent = 'Empezar recorrido →'; }
    else { titulo.textContent = pasos[paso].titulo; texto.textContent = pasos[paso].texto; seleccionar(pasos[paso].id); sig.textContent = paso === pasos.length - 1 ? 'Volver al inicio ↺' : 'Siguiente paso →'; }
    ant.disabled = paso <= 0; ant.style.opacity = paso <= 0 ? '.55' : '1';
  };
  document.getElementById('lab-siguiente').addEventListener('click', () => mostrarPaso(paso >= pasos.length - 1 ? -1 : paso + 1));
  document.getElementById('lab-anterior').addEventListener('click', () => mostrarPaso(paso <= 0 ? -1 : paso - 1));
  seleccionar(seleccionado); mostrarPaso(-1);
  // Carga el visor experimental desde PDBe; el esquema didáctico sigue disponible debajo.
  const pdbeScriptId = 'parcialito-pdbe-molstar-script';
  if (!document.getElementById(pdbeScriptId)) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/pdbe-molstar@3.5.0/build/pdbe-molstar.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.id = pdbeScriptId;
    script.src = 'https://cdn.jsdelivr.net/npm/pdbe-molstar@3.5.0/build/pdbe-molstar-component.js';
    script.async = true;
    script.onload = () => { const fb = app.querySelector('#lab-real-fallback'); if (fb) { fb.textContent = 'Biblioteca cargada; descargando la estructura molecular…'; customElements.whenDefined('pdbe-molstar').then(() => { if (app.contains(fb)) fb.textContent = 'Visor listo. Podés rotar, acercar y seleccionar componentes de la estructura.'; }).catch(() => { if (app.contains(fb)) fb.textContent = 'La biblioteca se cargó, pero no se pudo iniciar el visor. El esquema didáctico sigue disponible abajo.'; }); } };
    script.onerror = () => { const fb = app.querySelector('#lab-real-fallback'); if (fb) fb.textContent = 'No se pudo cargar el visor externo. El laboratorio esquemático sigue disponible abajo.'; };
    document.head.appendChild(script);
  } else if (window.customElements && window.customElements.get('pdbe-molstar')) {
    const fb = app.querySelector('#lab-real-fallback');
    if (fb) fb.textContent = 'Visor listo. Podés rotar, acercar y seleccionar componentes de la estructura.';
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
