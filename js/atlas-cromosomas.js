import { Sonido } from './sonido.js?v=dev';

export const TITULO = 'Atlas visual: cromosomas y gametogénesis';

const colores = { a: '#62d6f5', b: '#ffbf69', c: '#b39aff', d: '#67dfb0', tinta: '#eaf1ff', tenue: '#a8b9d6' };
const preguntas = [
  { grupo: 'Cromosoma', escena: 'cromosoma', punto: [269, 112], pregunta: '¿Qué estructura señala el marcador?', opciones: ['Telómero', 'Cinetocoro', 'Centrómero', 'Satélite'], correcta: 0, explicacion: 'El telómero es la región repetitiva que protege el extremo de un cromosoma lineal y ayuda a evitar la pérdida o fusión de ADN.' },
  { grupo: 'Cromosoma', escena: 'cromosoma', punto: [300, 170], pregunta: '¿Qué región señala el marcador?', opciones: ['Centrómero', 'Telómero', 'Brazo p', 'Cromátida hermana'], correcta: 0, explicacion: 'El centrómero es la región estrecha que mantiene unidas las cromátidas hermanas. Allí se organiza el cinetocoro.' },
  { grupo: 'Cromosoma', escena: 'cromosoma', punto: [313, 174], pregunta: '¿Qué complejo proteico señala el marcador?', opciones: ['Cinetocoro', 'Telómero', 'Cromómero', 'Nucleosoma'], correcta: 0, explicacion: 'El cinetocoro se ensambla sobre el centrómero y sirve como sitio de unión para los microtúbulos del huso.' },
  { grupo: 'Cromosoma', escena: 'cromosoma', punto: [274, 218], pregunta: '¿Qué unidad señala el marcador?', opciones: ['Una cromátida hermana', 'Un cromosoma homólogo', 'Un centrómero', 'Un quiasma'], correcta: 0, explicacion: 'Las cromátidas hermanas son las dos copias de un cromosoma después de la replicación; permanecen unidas por la región centromérica hasta separarse.' },
  { grupo: 'Cromosoma', escena: 'cromosoma', punto: [280, 143], pregunta: '¿Qué brazo señala el marcador?', opciones: ['Brazo corto p', 'Brazo largo q', 'Telómero', 'Cinetocoro'], correcta: 0, explicacion: 'El brazo p es el brazo corto del cromosoma. La letra p viene de “petit”; el brazo largo se denomina q.' },
  { grupo: 'Cromosoma', escena: 'cromosoma', punto: [274, 235], pregunta: '¿Qué brazo señala el marcador?', opciones: ['Brazo largo q', 'Brazo corto p', 'Centrómero', 'Telómero'], correcta: 0, explicacion: 'El brazo q es el brazo largo, ubicado al otro lado del centrómero respecto del brazo p.' },
  { grupo: 'Huso y mitosis', escena: 'huso', punto: [300, 213], pregunta: '¿Qué conjunto señala el marcador?', opciones: ['Huso mitótico', 'Anillo contráctil', 'Envoltura nuclear', 'Placa celular'], correcta: 0, explicacion: 'El huso mitótico es una estructura de microtúbulos que organiza y separa los cromosomas durante la división celular.' },
  { grupo: 'Huso y mitosis', escena: 'huso', punto: [198, 169], pregunta: '¿Qué tipo de microtúbulo señala el marcador?', opciones: ['Microtúbulo cinetocórico', 'Microtúbulo astral', 'Microtúbulo interpolar', 'Microfilamento de actina'], correcta: 0, explicacion: 'Los microtúbulos cinetocóricos se unen a los cinetocoros y ayudan a mover los cromosomas.' },
  { grupo: 'Huso y mitosis', escena: 'huso', punto: [300, 130], pregunta: '¿Qué tipo de microtúbulo señala el marcador?', opciones: ['Microtúbulo interpolar', 'Microtúbulo cinetocórico', 'Microtúbulo astral', 'Filamento intermedio'], correcta: 0, explicacion: 'Los microtúbulos interpolares se extienden desde polos opuestos y se superponen en la zona media del huso.' },
  { grupo: 'Huso y mitosis', escena: 'huso', punto: [72, 142], pregunta: '¿Qué tipo de microtúbulo señala el marcador?', opciones: ['Microtúbulo astral', 'Microtúbulo cinetocórico', 'Microtúbulo interpolar', 'Microfilamento'], correcta: 0, explicacion: 'Los microtúbulos astrales irradian desde el centrosoma hacia la periferia celular y ayudan a orientar el huso.' },
  { grupo: 'Huso y mitosis', escena: 'huso', punto: [100, 170], pregunta: '¿Qué estructura organiza los microtúbulos en ese polo?', opciones: ['Centrosoma', 'Cinetocoro', 'Centrómero', 'Nucléolo'], correcta: 0, explicacion: 'El centrosoma funciona como centro organizador de microtúbulos en muchas células animales; contiene un par de centríolos y material pericentriolar.' },
  { grupo: 'Huso y mitosis', escena: 'profase', punto: [276, 165], pregunta: '¿Qué fase de la mitosis representa la imagen?', opciones: ['Profase', 'Metafase', 'Anafase', 'Telofase'], correcta: 0, explicacion: 'En profase la cromatina se condensa en cromosomas visibles y comienza a organizarse el huso; la envoltura nuclear todavía está presente al inicio.' },
  { grupo: 'Huso y mitosis', escena: 'prometafase', punto: [300, 159], pregunta: '¿Qué fase representa la imagen, con la envoltura nuclear fragmentándose y el huso accediendo a los cromosomas?', opciones: ['Prometafase', 'Profase', 'Metafase', 'Citocinesis'], correcta: 0, explicacion: 'En prometafase la envoltura nuclear se desorganiza y los microtúbulos del huso pueden capturar los cinetocoros.' },
  { grupo: 'Huso y mitosis', escena: 'metafase', punto: [300, 170], pregunta: '¿Qué plano imaginario señala el marcador?', opciones: ['Placa ecuatorial', 'Plano de citocinesis', 'Plano de sinapsis', 'Surco de segmentación'], correcta: 0, explicacion: 'La placa ecuatorial es el plano medio donde se alinean los cromosomas durante la metafase. No es una estructura física.' },
  { grupo: 'Huso y mitosis', escena: 'metafase', punto: [300, 130], pregunta: '¿Qué fase de la mitosis representa la imagen?', opciones: ['Metafase', 'Anafase', 'Telofase', 'Profase'], correcta: 0, explicacion: 'En la metafase los cromosomas duplicados se alinean en el ecuador y sus cinetocoros están conectados a polos opuestos.' },
  { grupo: 'Huso y mitosis', escena: 'anafase', punto: [193, 126], pregunta: '¿Qué evento está ocurriendo en la célula?', opciones: ['Separación de cromátidas hermanas', 'Apareamiento de homólogos', 'Replicación del ADN', 'Formación de la placa celular'], correcta: 0, explicacion: 'En anafase mitótica se separan las cromátidas hermanas; desde ese momento cada cromátida pasa a contarse como un cromosoma.' },
  { grupo: 'Huso y mitosis', escena: 'telofase', punto: [198, 145], pregunta: '¿Qué estructura vuelve a formarse alrededor de cada conjunto cromosómico?', opciones: ['Envoltura nuclear', 'Cinetocoro', 'Huso acromático', 'Placa ecuatorial'], correcta: 0, explicacion: 'En telofase se reorganizan las envolturas nucleares alrededor de los cromosomas de cada polo y estos comienzan a descondensarse.' },
  { grupo: 'Huso y mitosis', escena: 'citocinesis', punto: [300, 170], pregunta: '¿Qué estructura señala el marcador?', opciones: ['Surco de segmentación', 'Placa ecuatorial', 'Quiasma', 'Centrómero'], correcta: 0, explicacion: 'El surco de segmentación aparece durante la citocinesis de células animales por la contracción de un anillo de actina y miosina.' },
  { grupo: 'Meiosis', escena: 'bivalente', punto: [300, 170], pregunta: '¿Qué conjunto de cromosomas señala el marcador?', opciones: ['Bivalente o tétrada', 'Dos cromátidas hermanas', 'Un cromosoma simple', 'Un cinetocoro'], correcta: 0, explicacion: 'Un bivalente es el par de cromosomas homólogos apareados en meiosis I. Como cada homólogo está duplicado, el conjunto contiene cuatro cromátidas y también se llama tétrada.' },
  { grupo: 'Meiosis', escena: 'bivalente', punto: [315, 165], pregunta: '¿Qué punto de contacto señala el marcador?', opciones: ['Quiasma', 'Centrómero', 'Telómero', 'Placa ecuatorial'], correcta: 0, explicacion: 'El quiasma es la manifestación visible del contacto entre cromátidas no hermanas donde ocurrió recombinación durante la profase I.' },
  { grupo: 'Meiosis', escena: 'anafase1', punto: [218, 145], pregunta: '¿Qué se separa en esta etapa?', opciones: ['Cromosomas homólogos', 'Cromátidas hermanas', 'Nucleótidos', 'Centrómeros de mitosis'], correcta: 0, explicacion: 'En anafase I se separan los cromosomas homólogos. Los centrómeros no se dividen y las cromátidas hermanas permanecen unidas.' },
  { grupo: 'Meiosis', escena: 'anafase2', punto: [164, 168], pregunta: '¿Qué se separa durante la etapa señalada?', opciones: ['Cromátidas hermanas', 'Cromosomas homólogos', 'Bivalentes completos', 'Células germinales'], correcta: 0, explicacion: 'En anafase II se separan las cromátidas hermanas, de manera parecida a lo que sucede en la anafase mitótica.' },
  { grupo: 'Meiosis', escena: 'productos', punto: [470, 130], pregunta: '¿Qué resultado representa la imagen?', opciones: ['Cuatro productos haploides', 'Dos células diploides', 'Una célula tetraploide', 'Dos bivalentes'], correcta: 0, explicacion: 'Una meiosis completa produce cuatro células haploides. En la ovogénesis, en cambio, las divisiones del citoplasma son desiguales y se forma un gameto grande más cuerpos polares.' },
  { grupo: 'Gametogénesis', escena: 'ovogenesis', punto: [95, 170], pregunta: '¿Qué célula inicial de la ovogénesis señala el marcador?', opciones: ['Ovogonio', 'Ovocito primario', 'Ovocito secundario', 'Primer cuerpo polar'], correcta: 0, explicacion: 'El ovogonio es una célula germinal diploide que prolifera por mitosis durante el desarrollo. Al crecer y entrar en meiosis I se convierte en ovocito primario.' },
  { grupo: 'Gametogénesis', escena: 'ovogenesis', punto: [225, 170], pregunta: '¿Qué célula señala el marcador?', opciones: ['Ovocito primario', 'Ovogonio', 'Ovocito secundario', 'Cuerpo polar'], correcta: 0, explicacion: 'El ovocito primario es diploide y comienza la meiosis I. En humanos queda detenido durante años en profase I antes de completar esa división.' },
  { grupo: 'Gametogénesis', escena: 'ovogenesis', punto: [370, 170], pregunta: '¿Qué célula señala el marcador?', opciones: ['Ovocito secundario', 'Ovocito primario', 'Ovogonio', 'Espermátida'], correcta: 0, explicacion: 'El ovocito secundario se forma al terminar la meiosis I; es haploide, pero sus cromosomas todavía están duplicados. En humanos suele ovular detenido en metafase II.' },
  { grupo: 'Gametogénesis', escena: 'ovogenesis', punto: [425, 112], pregunta: '¿Qué célula pequeña señala el marcador?', opciones: ['Primer cuerpo polar', 'Ovocito primario', 'Ovogonio', 'Célula folicular'], correcta: 0, explicacion: 'El primer cuerpo polar recibe un juego cromosómico tras la meiosis I, pero muy poco citoplasma. Puede dividirse o degenerar.' },
  { grupo: 'Gametogénesis', escena: 'ovogenesis', punto: [510, 164], pregunta: '¿Qué producto grande señala el marcador?', opciones: ['Óvulo tras completar meiosis II', 'Ovocito primario', 'Segundo cuerpo polar', 'Espermatocito secundario'], correcta: 0, explicacion: 'La meiosis II del ovocito humano se completa si ocurre fecundación. Se obtiene el óvulo y un cuerpo polar; el gameto femenino conserva casi todo el citoplasma.' },
  { grupo: 'Gametogénesis', escena: 'espermatogenesis', punto: [235, 170], pregunta: '¿Qué célula señala el marcador?', opciones: ['Espermatocito primario', 'Espermátida', 'Espermatozoide', 'Espermatogonio'], correcta: 0, explicacion: 'El espermatocito primario es diploide y entra en meiosis I. Al terminarla se forman dos espermatocitos secundarios haploides.' },
  { grupo: 'Gametogénesis', escena: 'espermatogenesis', punto: [365, 170], pregunta: '¿Qué célula señala el marcador?', opciones: ['Espermátida', 'Espermatocito primario', 'Espermatogonio', 'Ovocito secundario'], correcta: 0, explicacion: 'Las espermátidas son haploides y se originan al finalizar la meiosis II. Luego se diferencian en espermatozoides durante la espermiogénesis.' },
];

const grupos = [
  { nombre: 'Cromosoma', icono: '🧬', descripcion: 'Partes del cromosoma y extremos cromosómicos.' },
  { nombre: 'Huso y mitosis', icono: '🧫', descripcion: 'Microtúbulos, fases y estructuras de la división.' },
  { nombre: 'Meiosis', icono: '🔀', descripcion: 'Homólogos, tétradas, quiasmas y productos.' },
  { nombre: 'Gametogénesis', icono: '🥚', descripcion: 'Ovogénesis y espermatogénesis.' },
];

const estilos = `
.atlas-crom{--ac-ink:#edf3ff;--ac-muted:#a9b9d4;color:var(--ac-ink);max-width:1120px;margin:auto;padding:clamp(14px,3vw,30px);border:1px solid #28284f;border-radius:22px;background:radial-gradient(ellipse at 85% 0%,#302465 0,transparent 42%),linear-gradient(145deg,#100d27,#090c1d);font:15px/1.55 Inter,system-ui,sans-serif}
.atlas-crom *{box-sizing:border-box}.atlas-crom button{font:inherit;color:var(--ac-ink);cursor:pointer}.atlas-crom .ac-back{border:0;background:transparent;padding:4px 0;color:#c3b6ff}.atlas-crom .ac-kicker{margin-top:20px;color:#c5b8ff;font-size:.7rem;letter-spacing:.15em;font-weight:850}.atlas-crom h1{font-size:clamp(1.9rem,5vw,3.1rem);line-height:1.08;letter-spacing:-.04em;margin:8px 0}.atlas-crom .ac-intro{max-width:70ch;color:var(--ac-muted)}.atlas-crom .ac-groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin:22px 0}.atlas-crom .ac-group{display:flex;align-items:center;gap:12px;text-align:left;padding:15px;border:1px solid #35315e;border-radius:15px;background:linear-gradient(140deg,#201b43,#14172f);transition:transform .18s,border-color .18s}.atlas-crom .ac-group:hover{transform:translateY(-2px);border-color:#a99aff}.atlas-crom .ac-gi{display:grid;place-items:center;flex:0 0 42px;height:42px;border-radius:12px;background:#372d6c;font-size:1.35rem}.atlas-crom .ac-gt{display:grid;flex:1;gap:2px}.atlas-crom .ac-gt small{color:var(--ac-muted);font-size:.78rem}.atlas-crom .ac-count{color:#d2c7ff;font-size:.75rem;font-weight:800;white-space:nowrap}.atlas-crom .ac-all{width:100%;padding:13px;border:1px solid #8772e6;border-radius:13px;background:linear-gradient(100deg,#5949bb,#473d9b);font-weight:800}.atlas-crom .ac-quiz-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:18px 0 10px;flex-wrap:wrap}.atlas-crom .ac-progress{height:7px;border-radius:99px;background:#252542;overflow:hidden}.atlas-crom .ac-progress i{display:block;height:100%;background:linear-gradient(90deg,#9d8aff,#5ed3f3);transition:width .2s}.atlas-crom .ac-meta{display:flex;gap:8px;align-items:center;color:var(--ac-muted);font-size:.8rem}.atlas-crom .ac-tag{padding:4px 9px;border:1px solid #51458b;border-radius:999px;color:#d3c9ff;background:#211c42;font-size:.72rem;font-weight:800}.atlas-crom .ac-card{margin-top:13px;padding:clamp(12px,2.5vw,22px);border:1px solid #302e56;border-radius:18px;background:linear-gradient(145deg,#171632,#101427)}.atlas-crom .ac-visual{display:grid;place-items:center;min-height:260px;padding:8px;border:1px solid #273653;border-radius:14px;background:radial-gradient(ellipse at center,#152744,#0c1325 74%)}.atlas-crom svg{display:block;width:100%;height:auto;max-height:370px}.atlas-crom .ac-q{font-size:clamp(1.1rem,2.7vw,1.45rem);line-height:1.35;margin:18px 0 12px}.atlas-crom .ac-answers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.atlas-crom .ac-answer{display:flex;align-items:flex-start;gap:9px;min-height:54px;text-align:left;padding:11px;border:1px solid #38405f;border-radius:12px;background:#1b2138;line-height:1.4}.atlas-crom .ac-answer:hover:not(:disabled){border-color:#a99aff;background:#262448}.atlas-crom .ac-answer:focus-visible,.atlas-crom button:focus-visible{outline:3px solid #a99aff;outline-offset:2px}.atlas-crom .ac-answer:disabled{cursor:default}.atlas-crom .ac-answer .ac-letter{display:grid;place-items:center;flex:0 0 25px;width:25px;height:25px;border-radius:7px;background:#303853;font-size:.78rem;font-weight:850}.atlas-crom .ac-answer.good{border-color:#49d6ae;background:#12352f}.atlas-crom .ac-answer.bad{border-color:#fb82b2;background:#3a2034}.atlas-crom .ac-feedback{min-height:48px;margin:12px 0 0;padding:11px 13px;border-left:3px solid #7cdeca;border-radius:0 10px 10px 0;background:#122b32;color:#c7eee2;font-size:.88rem}.atlas-crom .ac-next{display:flex;justify-content:flex-end;margin-top:11px}.atlas-crom .ac-next button,.atlas-crom .ac-result button{padding:10px 14px;border:1px solid #8978e7;border-radius:11px;background:#433987;font-weight:800}.atlas-crom .ac-result{text-align:center;padding:32px 10px}.atlas-crom .ac-score{font-size:clamp(2.7rem,9vw,5rem);font-weight:900;color:#c5b8ff;letter-spacing:-.05em}.atlas-crom .ac-result p{color:var(--ac-muted)}.atlas-crom .ac-note{margin:14px 0 0;color:#92a4c4;font-size:.76rem}
@media(max-width:620px){.atlas-crom .ac-groups,.atlas-crom .ac-answers{grid-template-columns:1fr}.atlas-crom .ac-visual{min-height:190px}.atlas-crom{padding:12px;border-radius:16px}}
@media(prefers-reduced-motion:reduce){.atlas-crom *{transition:none!important}}
`;

const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const line = (x1, y1, x2, y2, color = '#6f91c7', width = 3, dash = '') => `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;

function chromosome(x, y, scale = 1, accent = false) {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke-linecap="round"><path d="M-33 -65 C-30 -38 -20 -15 0 0 C20 25 31 60 35 105" stroke="${colores.a}" stroke-width="13"/><path d="M33 -65 C30 -38 20 -15 0 0 C-20 25 -31 60 -35 105" stroke="${colores.b}" stroke-width="13"/><path d="M-31 -43 L-22 -38 M-26 56 L-35 62 M31 -43 L22 -38 M26 56 L35 62" stroke="#fff8" stroke-width="2"/>${accent ? `<ellipse cx="0" cy="0" rx="17" ry="9" fill="#d7c8ff" stroke="#fff" stroke-width="2"/><ellipse cx="-14" cy="0" rx="6" ry="4" fill="#67dfb0" stroke="#e9fff7" stroke-width="1.5"/><ellipse cx="14" cy="0" rx="6" ry="4" fill="#67dfb0" stroke="#e9fff7" stroke-width="1.5"/>` : `<ellipse cx="0" cy="0" rx="9" ry="6" fill="#d7c8ff" stroke="#fff" stroke-width="2"/>`}</g>`;
}

function cell(x = 300, y = 170, rx = 250, ry = 115, extra = '') {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#0e1a31" stroke="#7289b8" stroke-width="3"/>${extra}`;
}

function sceneMarkup(scene) {
  if (scene === 'cromosoma') {
    return `<text x="300" y="30" text-anchor="middle" fill="#a9bddc" font-size="13">CROMOSOMA DUPLICADO</text>${chromosome(300, 174, .95, true)}<text x="300" y="320" text-anchor="middle" fill="#8398bb" font-size="11">Dos cromátidas hermanas · esquema didáctico</text>`;
  }
  if (scene === 'huso' || scene === 'metafase') {
    const metaphase = scene === 'metafase';
    let s = cell(300, 174, 250, 115);
    s += `<g fill="none" stroke="#8f7be0" stroke-width="2.5" opacity=".9">`;
    for (const y of [130, 151, 174, 197, 218]) s += line(115, 174, 288, y, '#8f7be0', 2.4) + line(485, 174, 312, y, '#8f7be0', 2.4) + line(288, y, 312, y, '#b39aff', 2);
    s += `</g>`;
    for (const x of [100, 500]) {
      s += `<g stroke="#f5c16f" stroke-width="3" stroke-linecap="round">${line(x - 13, 174, x + 13, 174, '#f5c16f', 3)}${line(x, 161, x, 187, '#f5c16f', 3)}<circle cx="${x}" cy="174" r="10" fill="#543d82" stroke="#d1bdff" stroke-width="2"/></g>`;
      for (const dy of [-25, 25]) s += line(x, 174, x + (x < 300 ? -28 : 28), 174 + dy, '#f1bb68', 2);
    }
    if (metaphase) {
      s += line(300, 64, 300, 284, '#ffde88', 2, '5 7');
      s += chromosome(274, 174, .55) + chromosome(326, 174, .55);
    } else {
      s += chromosome(285, 174, .58) + chromosome(315, 174, .58);
      s += `<circle cx="285" cy="174" r="5" fill="#f5c16f"/><circle cx="315" cy="174" r="5" fill="#f5c16f"/>`;
    }
    return `${s}<text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Microtúbulos organizados entre dos polos</text>`;
  }
  if (scene === 'profase') {
    return `${cell()}<ellipse cx="300" cy="170" rx="102" ry="72" fill="#121f3a" stroke="#63a9d1" stroke-width="2.5" stroke-dasharray="7 5"/>${chromosome(276, 165, .44)}${chromosome(324, 165, .44)}<circle cx="190" cy="173" r="9" fill="#493b7a" stroke="#c5b8ff" stroke-width="2"/><circle cx="410" cy="173" r="9" fill="#493b7a" stroke="#c5b8ff" stroke-width="2"/><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Cromosomas condensándose dentro del núcleo</text>`;
  }
  if (scene === 'prometafase') {
    return `${cell()}<path d="M202 120 Q222 100 241 111 M358 111 Q379 100 398 120 M202 220 Q220 238 242 227 M358 227 Q380 238 398 220" fill="none" stroke="#62d6f5" stroke-width="3" stroke-dasharray="7 6"/>${line(100, 174, 287, 160, '#9b86ed', 2.5)}${line(500, 174, 313, 178, '#9b86ed', 2.5)}${chromosome(300, 170, .58)}<circle cx="290" cy="170" r="5" fill="#ffbf69"/><circle cx="310" cy="170" r="5" fill="#ffbf69"/><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">La envoltura se fragmenta y el huso captura cinetocoros</text>`;
  }
  if (scene === 'anafase') {
    let s = cell();
    for (const i of [0, 1, 2]) {
      const y = 126 + i * 24;
      s += `<path d="M${175 + i * 18} ${y} l18 -12 18 12 -18 12Z" fill="none" stroke="${[colores.a, colores.b, colores.c][i]}" stroke-width="5" stroke-linejoin="round"/>`;
      s += `<path d="M${425 - i * 18} ${y + 5} l-18 -12 -18 12 18 12Z" fill="none" stroke="${[colores.a, colores.b, colores.c][i]}" stroke-width="5" stroke-linejoin="round"/>`;
    }
    s += line(140, 174, 275, 174, '#9b86ed', 2) + line(460, 174, 325, 174, '#9b86ed', 2);
    return `${s}<text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Las cromátidas migran hacia polos opuestos</text>`;
  }
  if (scene === 'telofase') {
    return `${cell()}<ellipse cx="198" cy="170" rx="65" ry="54" fill="#17213d" stroke="#62d6f5" stroke-width="3"/><ellipse cx="402" cy="170" rx="65" ry="54" fill="#17213d" stroke="#62d6f5" stroke-width="3"/><path d="M180 156 l12 18 13 -18 M382 156 l12 18 13 -18" fill="none" stroke="#ffbf69" stroke-width="5" stroke-linecap="round"/><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Se reorganizan dos núcleos hijos</text>`;
  }
  if (scene === 'citocinesis') {
    return `${cell()}<path d="M300 58 C278 106 278 238 300 286" fill="none" stroke="#ff82b2" stroke-width="10" stroke-linecap="round"/><path d="M289 173 H311" stroke="#ffb5cf" stroke-width="3"/><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">La célula animal se estrangula por el ecuador</text>`;
  }
  if (scene === 'bivalente') {
    const left = chromosome(280, 174, .8, true), right = chromosome(320, 174, .8, true);
    return `${cell()}${left}${right}<path d="M280 148 C292 162 309 186 320 200 M280 200 C292 186 309 162 320 148" fill="none" stroke="#f5f0ff" stroke-width="4"/><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Homólogos duplicados apareados · profase I</text>`;
  }
  if (scene === 'anafase1') {
    return `${cell()}${chromosome(200, 169, .72, true)}${chromosome(400, 169, .72, true)}${line(120, 174, 235, 174, '#9b86ed', 2)}${line(480, 174, 365, 174, '#9b86ed', 2)}<text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Homólogos a polos opuestos · hermanas unidas</text>`;
  }
  if (scene === 'anafase2') {
    return `${cell(190, 174, 125, 90)}${cell(410, 174, 125, 90)}<path d="M142 145 l22 23 22 -23 M238 202 l-22 -23 -22 23 M362 145 l22 23 22 -23 M458 202 l-22 -23 -22 23" fill="none" stroke="#62d6f5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Separación de cromátidas en las dos células haploides</text>`;
  }
  if (scene === 'productos') {
    let s = '';
    [[140, 132], [280, 132], [420, 132], [520, 132]].forEach(([x, y], i) => {
      s += `<circle cx="${x}" cy="${y}" r="43" fill="#111d36" stroke="#7f90bd" stroke-width="2.5"/><path d="M${x - 12} ${y - 15} l12 15 -12 15 M${x + 12} ${y - 15} l-12 15 12 15" fill="none" stroke="${i % 2 ? colores.c : colores.a}" stroke-width="4" stroke-linecap="round"/>`;
    });
    return `${s}<text x="300" y="227" text-anchor="middle" fill="#c3b6ff" font-size="13" font-weight="700">n</text><text x="300" y="319" text-anchor="middle" fill="#8398bb" font-size="11">Cuatro células finales de una meiosis</text>`;
  }
  if (scene === 'ovogenesis') {
    const cells = [
      `<circle cx="95" cy="170" r="38" fill="#182447" stroke="#8f7be0" stroke-width="3"/><circle cx="95" cy="170" r="11" fill="#b39aff"/><text x="95" y="232" text-anchor="middle" fill="#a8b9d6" font-size="11">1 · 2n</text>`,
      `<circle cx="225" cy="170" r="54" fill="#182447" stroke="#62d6f5" stroke-width="3"/><circle cx="225" cy="170" r="15" fill="#b39aff"/><text x="225" y="242" text-anchor="middle" fill="#a8b9d6" font-size="11">2 · 2n, ADN duplicado</text>`,
      `<circle cx="370" cy="170" r="49" fill="#182447" stroke="#67dfb0" stroke-width="3"/><circle cx="370" cy="170" r="14" fill="#b39aff"/><circle cx="425" cy="112" r="14" fill="#2a3150" stroke="#ffbf69" stroke-width="2"/><text x="370" y="240" text-anchor="middle" fill="#a8b9d6" font-size="11">3 · n, cromosomas duplicados</text>`,
      `<circle cx="515" cy="170" r="49" fill="#182447" stroke="#ffbf69" stroke-width="3"/><circle cx="515" cy="170" r="13" fill="#b39aff"/><circle cx="561" cy="111" r="12" fill="#2a3150" stroke="#ffbf69" stroke-width="2"/><text x="515" y="240" text-anchor="middle" fill="#a8b9d6" font-size="11">4 · n, tras meiosis II</text>`,
    ].join('');
    const arrows = [145, 290, 435].map(x => `<path d="M${x} 170 h23 m-7 -7 7 7 -7 7" fill="none" stroke="#d0c5ff" stroke-width="2.5"/>`).join('');
    return `${cells}${arrows}<text x="300" y="38" text-anchor="middle" fill="#c6baff" font-size="13" font-weight="700">OVOGÉNESIS · DIVISIONES ASIMÉTRICAS</text>`;
  }
  if (scene === 'espermatogenesis') {
    const stages = [[100, 170, 30], [235, 170, 42], [365, 170, 34], [505, 170, 27]];
    let s = `<text x="300" y="38" text-anchor="middle" fill="#c6baff" font-size="13" font-weight="700">ESPERMATOGÉNESIS</text>`;
    stages.forEach(([x, y, r], i) => {
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#17213d" stroke="${[colores.c, colores.a, colores.d, colores.b][i]}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${i === 3 ? 7 : 10}" fill="#b39aff"/>`;
      if (i < 3) s += `<path d="M${x + r + 7} ${y} h33 m-8 -7 8 7 -8 7" fill="none" stroke="#d0c5ff" stroke-width="2.5"/>`;
    });
    return `${s}<text x="300" y="245" text-anchor="middle" fill="#a8b9d6" font-size="11">2n → meiosis I → n → meiosis II → n</text>`;
  }
  return '';
}

function imageFor(q) {
  const [x, y] = q.punto;
  const labelX = x > 420 ? x - 30 : x + 30;
  const labelY = Math.max(48, y - 28);
  const lineX = x > 420 ? labelX + 19 : labelX - 19;
  return `<svg viewBox="0 0 600 340" role="img" aria-label="Ilustración educativa con un marcador A; identificá la estructura señalada"><defs><linearGradient id="atlasBg" x1="0" x2="1"><stop stop-color="#0b1830"/><stop offset="1" stop-color="#121b35"/></linearGradient></defs><rect x="2" y="2" width="596" height="336" rx="17" fill="url(#atlasBg)" stroke="#283d62"/>${sceneMarkup(q.escena)}<path d="M${x} ${y} L${lineX} ${labelY}" fill="none" stroke="#ff8fb7" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="9" fill="#ff8fb7" fill-opacity=".24" stroke="#ff9cbe" stroke-width="2.5"/><circle cx="${labelX}" cy="${labelY}" r="15" fill="#ff8fb7" stroke="#ffe1ec" stroke-width="2"/><text x="${labelX}" y="${labelY + 5}" text-anchor="middle" fill="#271022" font-size="14" font-weight="900">A</text></svg>`;
}

export function abrirAtlasCromosomas({ app, volver } = {}) {
  let grupo = null;
  let mazo = [];
  let actual = 0;
  let aciertos = 0;
  let respondida = false;
  let ultimaCorrecta = false;

  function renderInicio() {
    app.innerHTML = `<main class="atlas-crom"><button class="ac-back" id="ac-back">← Volver a Juegos interactivos</button><div class="ac-kicker">BIOLOGÍA 2 · PRÁCTICA CON IMÁGENES</div><h1>${TITULO}</h1><p class="ac-intro">Mirá el esquema, identificá la estructura señalada y elegí la respuesta. Después vas a ver qué función cumple y en qué etapa aparece. Los dibujos son esquemáticos y no están a escala.</p><section class="ac-groups" aria-label="Elegir recorrido visual">${grupos.map(g => `<button class="ac-group" data-grupo="${g.nombre}"><span class="ac-gi" aria-hidden="true">${g.icono}</span><span class="ac-gt"><strong>${g.nombre}</strong><small>${g.descripcion}</small></span><span class="ac-count">${preguntas.filter(q => q.grupo === g.nombre).length} láminas →</span></button>`).join('')}</section><button class="ac-all" id="ac-all">Hacer el recorrido completo · ${preguntas.length} láminas</button><p class="ac-note">Temas: telómeros, centrómero, cinetocoro, huso, mitosis, meiosis, ovogénesis y espermatogénesis.</p></main>`;
    app.querySelector('#ac-back').onclick = volver;
    app.querySelector('#ac-all').onclick = () => comenzar(null);
    app.querySelectorAll('[data-grupo]').forEach(b => b.onclick = () => comenzar(b.dataset.grupo));
  }

  function comenzar(filtro) {
    grupo = filtro;
    mazo = preguntas.filter(q => !filtro || q.grupo === filtro).map(q => ({ ...q }));
    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    mazo.forEach(q => {
      const opciones = q.opciones.map((texto, i) => ({ texto, correcta: i === q.correcta }));
      for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
      }
      q.opciones = opciones.map(o => o.texto);
      q.correcta = opciones.findIndex(o => o.correcta);
    });
    actual = 0;
    aciertos = 0;
    respondida = false;
    renderPregunta();
  }

  function renderPregunta() {
    const q = mazo[actual];
    if (!q) return renderResultado();
    const feedback = respondida ? `<div class="ac-feedback" role="status"><strong>${ultimaCorrecta ? '¡Correcto!' : `La respuesta es ${escapeHtml(q.opciones[q.correcta])}.`}</strong> ${escapeHtml(q.explicacion)}</div>` : '';
    app.innerHTML = `<main class="atlas-crom"><button class="ac-back" id="ac-back">← Volver al atlas</button><div class="ac-quiz-head"><div class="ac-meta"><span class="ac-tag">${escapeHtml(q.grupo)}</span><span>Lámina ${actual + 1} de ${mazo.length}</span></div><span class="ac-meta">Aciertos: ${aciertos}</span></div><div class="ac-progress" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${mazo.length}" aria-valuenow="${actual + (respondida ? 1 : 0)}"><i style="width:${((actual + (respondida ? 1 : 0)) / mazo.length) * 100}%"></i></div><section class="ac-card"><div class="ac-visual">${imageFor(q)}</div><h2 class="ac-q">${escapeHtml(q.pregunta)}</h2><div class="ac-answers">${q.opciones.map((o, i) => `<button class="ac-answer ${respondida && i === q.correcta ? 'good' : ''} ${respondida && i !== q.correcta && i === q._eleccion ? 'bad' : ''}" data-opcion="${i}" ${respondida ? 'disabled' : ''}><span class="ac-letter">${'ABCD'[i]}</span><span>${escapeHtml(o)}</span></button>`).join('')}</div>${feedback}<div class="ac-next">${respondida ? `<button id="ac-next">${actual === mazo.length - 1 ? 'Ver resultado' : 'Siguiente lámina →'}</button>` : ''}</div></section><p class="ac-note">El marcador A apunta a una zona concreta. En la respuesta vas a ver su nombre y su función.</p></main>`;
    app.querySelector('#ac-back').onclick = renderInicio;
    app.querySelectorAll('[data-opcion]').forEach(b => b.onclick = () => responder(Number(b.dataset.opcion)));
    app.querySelector('#ac-next')?.addEventListener('click', () => { actual++; respondida = false; renderPregunta(); });
  }

  function responder(indice) {
    if (respondida) return;
    respondida = true;
    const q = mazo[actual];
    q._eleccion = indice;
    ultimaCorrecta = indice === q.correcta;
    if (ultimaCorrecta) aciertos++;
    Sonido.clic();
    renderPregunta();
  }

  function renderResultado() {
    const porcentaje = Math.round((aciertos / mazo.length) * 100);
    app.innerHTML = `<main class="atlas-crom"><button class="ac-back" id="ac-back">← Volver al atlas</button><section class="ac-card ac-result"><div class="ac-kicker">RECORRIDO COMPLETADO</div><div class="ac-score">${aciertos}/${mazo.length}</div><h2>${porcentaje >= 80 ? '¡Muy buen reconocimiento visual!' : 'Una vuelta más te va a ayudar a fijar las estructuras.'}</h2><p>${porcentaje}% de respuestas correctas${grupo ? ` en ${escapeHtml(grupo)}` : ' en el recorrido completo'}.</p><button id="ac-repeat">Repetir este recorrido ↻</button></section></main>`;
    app.querySelector('#ac-back').onclick = renderInicio;
    app.querySelector('#ac-repeat').onclick = () => comenzar(grupo);
  }

  if (!document.getElementById('atlas-crom-css')) {
    const style = document.createElement('style');
    style.id = 'atlas-crom-css';
    style.textContent = estilos;
    document.head.appendChild(style);
  }
  renderInicio();
}
