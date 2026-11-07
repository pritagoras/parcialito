// Parcialito LAB · Gametogénesis: meiosis, espermatogénesis y ovogénesis.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MEIOSIS = [
{id:'g1',name:'G1 · antes de replicar',group:'Interfase',text:'La célula germinal es diploide. Cada cromosoma tiene una sola cromátida. En humanos: 46 cromosomas y 46 moléculas de ADN.',key:'En G1 hay 2n y 2C.'},
{id:'s',name:'Después de fase S',group:'Replicación previa',text:'El ADN se duplica una sola vez antes de la meiosis. Cada cromosoma queda formado por dos cromátidas hermanas, pero la ploidía y el número de cromosomas no cambian.',key:'Se duplica el ADN, no el número de cromosomas: 2n y 4C.'},
{id:'lepto',name:'Leptonema',group:'Profase I · subetapa 1',text:'Los cromosomas comienzan a condensarse y se observan como filamentos largos y delgados. Las cromátidas todavía no se distinguen claramente.',key:'Leptonema: comienzo de la condensación.'},
{id:'cygo',name:'Cigonema',group:'Profase I · subetapa 2',text:'Los cromosomas homólogos se reconocen y se aparean mediante sinapsis. Entre ellos se organiza el complejo sinaptonémico. El par recibe el nombre de bivalente.',key:'Sinapsis = apareamiento de cromosomas homólogos.'},
{id:'pachi',name:'Paquinema',group:'Profase I · subetapa 3',text:'Los homólogos están apareados a lo largo de toda su extensión. Se reconoce una tétrada de cuatro cromátidas. Ocurre crossing over entre cromátidas no hermanas.',key:'Paquinema: crossing over y recombinación genética.'},
{id:'diplo',name:'Diplonema',group:'Profase I · subetapa 4',text:'Los homólogos comienzan a separarse, pero permanecen unidos en los quiasmas, que evidencian los sitios donde ocurrió el entrecruzamiento.',key:'Los quiasmas mantienen asociados a los homólogos.'},
{id:'diaci',name:'Diacinesis',group:'Profase I · subetapa 5',text:'Los cromosomas alcanzan una condensación máxima. Los quiasmas se desplazan hacia los extremos. Se desorganiza la envoltura nuclear y se organiza el huso.',key:'Diacinesis: máxima condensación y preparación para la división.'},
{id:'meta1',name:'Metafase I',group:'Meiosis I · alineación',text:'Los pares de homólogos se ubican en el plano ecuatorial. La orientación de cada par es independiente y al azar, lo que contribuye a la variabilidad genética.',key:'Se alinean bivalentes; la orientación de cada par es independiente.'},
{id:'ana1',name:'Anafase I',group:'Meiosis I · división reduccional',text:'Los cromosomas homólogos se separan y migran a polos opuestos. Las cromátidas hermanas permanecen unidas por sus centrómeros.',key:'Anafase I separa homólogos, no cromátidas hermanas.'},
{id:'telo1',name:'Telofase I y citocinesis',group:'Fin de meiosis I',text:'Se forman dos células haploides. Cada una recibió un representante de cada par de homólogos, pero sus cromosomas continúan duplicados.',key:'Después de meiosis I: n cromosomas duplicados y 2C por célula.'},
{id:'pro2',name:'Profase II',group:'Meiosis II · preparación',text:'En cada célula haploide se organiza nuevamente el huso. No existe una nueva duplicación del ADN entre meiosis I y meiosis II.',key:'No hay una segunda fase S entre ambas divisiones.'},
{id:'meta2',name:'Metafase II',group:'Meiosis II · alineación',text:'Los cromosomas, todavía formados por dos cromátidas hermanas, se alinean individualmente en el plano ecuatorial de cada célula.',key:'En metafase II se alinean cromosomas individuales, no pares de homólogos.'},
{id:'ana2',name:'Anafase II',group:'Meiosis II · división ecuacional',text:'Los centrómeros se dividen y las cromátidas hermanas se separan. Desde ese momento cada cromátida pasa a considerarse un cromosoma independiente.',key:'Anafase II separa cromátidas hermanas.'},
{id:'telo2',name:'Telofase II y citocinesis',group:'Fin de la meiosis',text:'Se reorganizan los núcleos y termina la división del citoplasma. El resultado general son cuatro productos haploides con cromosomas simples.',key:'Resultado general: cuatro productos haploides con 1C.'}
];
const ESPERMA = [
{name:'Espermatogonia',group:'Célula germinal inicial',text:'La espermatogonia es diploide. Se mantiene mediante divisiones mitóticas; algunas células continúan la población germinal y otras se diferencian para ingresar en meiosis.',key:'En humanos: 46 cromosomas simples y 2C antes de replicar el ADN.',cells:1,chr:46,chrom:46,dna:46,pl:'2n',c:'2C'},
{name:'Espermatocito primario',group:'Ingreso en meiosis I',text:'Cuando la espermatogonia inicia la meiosis I pasa a llamarse espermatocito primario. Ya duplicó el ADN, pero todavía conserva los dos juegos de cromosomas homólogos.',key:'Sigue siendo diploide: 46 cromosomas y 92 cromátidas.',cells:1,chr:46,chrom:92,dna:92,pl:'2n',c:'4C'},
{name:'Espermatocitos secundarios',group:'Fin de meiosis I',text:'Al separarse los cromosomas homólogos se forman dos espermatocitos secundarios. Cada uno es haploide, aunque sus cromosomas todavía tienen dos cromátidas.',key:'Cada célula: 23 cromosomas duplicados, 46 cromátidas y 2C.',cells:2,chr:23,chrom:46,dna:46,pl:'n',c:'2C'},
{name:'Espermátidas',group:'Fin de meiosis II',text:'Los espermatocitos secundarios completan la meiosis II y separan sus cromátidas hermanas. Se forman cuatro espermátidas haploides.',key:'Cada espermátida: 23 cromosomas simples y 1C.',cells:4,chr:23,chrom:23,dna:23,pl:'n',c:'1C'},
{name:'Espermatozoides',group:'Espermiogénesis',text:'Durante la espermiogénesis las espermátidas se diferencian morfológicamente: condensan el núcleo, forman el acrosoma y el flagelo y pierden gran parte del citoplasma. No ocurre otra división.',key:'La espermiogénesis cambia la morfología, no la ploidía ni el número de cromosomas.',cells:4,chr:23,chrom:23,dna:23,pl:'n',c:'1C'}
];
const OVOGENESIS = [
{name:'Ovogonia',group:'Etapa embrionaria',text:'Las ovogonias son diploides y se multiplican por mitosis durante el desarrollo fetal. Alrededor del tercer mes comienzan a ingresar en meiosis I y pasan a denominarse ovocitos primarios.',key:'La ovogonia es la célula germinal inicial (2n); al ingresar en meiosis I se transforma en ovocito primario.',chr:46,chrom:46,dna:46,pl:'2n',c:'2C',pause:''},
{name:'Ovocito primario',group:'Inicio de meiosis I · vida fetal',text:'Al ingresar en meiosis, la ovogonia pasa a llamarse ovocito primario. Inicia la meiosis I y queda detenido en profase I avanzada (diplonema/dictioteno) antes del nacimiento.',key:'Primera detención: profase I. La reserva de ovocitos primarios está presente al nacer.',chr:46,chrom:92,dna:92,pl:'2n',c:'4C',pause:'DETENIDO EN PROFASE I'},
{name:'Ovocito secundario + primer cuerpo polar',group:'Finalización de meiosis I',text:'Desde la pubertad, en cada ciclo puede comenzar el desarrollo de más de un folículo. Algunos ovocitos reanudan la meiosis I, pero generalmente uno alcanza la etapa que culmina con la ovulación: se forma un ovocito secundario grande y un primer cuerpo polar pequeño.',key:'La citocinesis es asimétrica: el ovocito secundario conserva casi todo el citoplasma.',chr:23,chrom:46,dna:46,pl:'n',c:'2C',pause:''},
{name:'Ovocito secundario ovulado',group:'Ovulación · meiosis II',text:'El ovocito secundario es liberado durante la ovulación. Comienza la meiosis II y queda detenido en metafase II mientras no ocurra la fecundación.',key:'Segunda detención: metafase II. Lo que se ovula es el ovocito secundario, no un óvulo que ya terminó la meiosis.',chr:23,chrom:46,dna:46,pl:'n',c:'2C',pause:'DETENIDO EN METAFASE II'},
{name:'Óvulo + segundo cuerpo polar',group:'Tras la fecundación',text:'La fecundación desencadena señales que permiten completar la meiosis II. Se forma el óvulo y el segundo cuerpo polar; el primer cuerpo polar puede dividirse. Luego se combina el material genético de ambas gametas.',key:'Óvulo: n = 23 y 1C. Se forma el segundo cuerpo polar; el primero puede dividirse. Tras la unión de los pronúcleos se restablece 2n = 46 en el cigoto.',chr:23,chrom:23,dna:23,pl:'n',c:'1C',pause:''}
];
const PREGUNTAS = [
{q:'¿Qué se separa durante la anafase I?',o:['Cromátidas hermanas','Cromosomas homólogos','Moléculas de ADN','Centríolos'],a:1,e:'En anafase I se separan los cromosomas homólogos. Las cromátidas hermanas permanecen unidas.'},
{q:'¿En qué subetapa de la profase I ocurre el crossing over?',o:['Leptonema','Cigonema','Paquinema','Diacinesis'],a:2,e:'El crossing over ocurre durante el paquinema, entre cromátidas no hermanas de cromosomas homólogos.'},
{q:'¿Qué representa un quiasma?',o:['Un centrómero','El inicio de la fase S','Un punto visible donde ocurrió el crossing over','La separación de homólogos'],a:2,e:'Los quiasmas evidencian los sitios de intercambio y mantienen unidos a los homólogos durante parte de la profase I.'},
{q:'Una célula humana en G1 tiene:',o:['46 cromosomas y 92 cromátidas','23 cromosomas y 23 cromátidas','46 cromosomas y 46 cromátidas','92 cromosomas y 92 cromátidas'],a:2,e:'En G1 hay 46 cromosomas no duplicados, cada uno con una cromátida y una molécula de ADN.'},
{q:'Un espermatocito primario humano después de la replicación tiene:',o:['23 cromosomas y 46 cromátidas','46 cromosomas y 92 cromátidas','92 cromosomas y 92 cromátidas','23 cromosomas y 23 cromátidas'],a:1,e:'Sigue siendo diploide (2n=46), pero cada cromosoma tiene dos cromátidas: 92 en total.'},
{q:'¿Por qué el espermatocito secundario es haploide si tiene cromosomas duplicados?',o:['Porque perdió las cromátidas','Porque ya se separaron los homólogos','Porque duplicó el ADN dos veces','Porque completó meiosis II'],a:1,e:'Tras meiosis I cada célula tiene un representante de cada par: n, aunque sus cromosomas sigan duplicados.'},
{q:'¿Qué proceso transforma espermátidas en espermatozoides?',o:['Espermatogénesis II','Ovulación','Espermiogénesis','Sinapsis'],a:2,e:'La espermiogénesis es la diferenciación morfológica final; no es una división ni cambia la ploidía.'},
{q:'¿Cuándo comienza la meiosis en la ovogénesis?',o:['En la pubertad','Después de la fecundación','Durante la vida fetal','En la menopausia'],a:2,e:'Las ovogonias ingresan en meiosis durante la vida fetal y pasan a ser ovocitos primarios.'},
{q:'¿En qué etapa queda detenido el ovocito primario?',o:['Metafase I','Profase I avanzada (dictioteno)','Anafase II','Metafase II'],a:1,e:'La primera detención de la ovogénesis ocurre en profase I avanzada, también llamada dictioteno.'},
{q:'¿Qué permite completar la meiosis II del ovocito?',o:['El pico de FSH por sí solo','La fecundación','La menstruación','La formación del cuerpo lúteo'],a:1,e:'La fecundación desencadena señales que reanudan y completan la meiosis II.'},
{q:'¿Por qué se forman cuerpos polares?',o:['Para conservar todo el citoplasma en cuatro células','Para eliminar cromosomas duplicados por mitosis','Para repartir el citoplasma de forma desigual y conservarlo en el ovocito','Para producir espermatozoides'],a:2,e:'Las divisiones asimétricas concentran casi todo el citoplasma en una única célula funcional.'},
{q:'Una célula 2n=8 después de la fase S tiene:',o:['8 cromosomas y 8 cromátidas','16 cromosomas y 16 cromátidas','8 cromosomas y 16 cromátidas','4 cromosomas y 8 cromátidas'],a:2,e:'La replicación duplica las cromátidas y el ADN, pero no el número de cromosomas.'},
{q:'Después de meiosis II, una célula humana contiene:',o:['46 cromosomas duplicados','23 cromosomas simples','23 pares de homólogos','46 cromátidas'],a:1,e:'Cada producto haploide contiene 23 cromosomas simples y 1C.'},
{q:'¿Cuál es el resultado general de la meiosis en la espermatogénesis?',o:['Dos espermatozoides diploides','Cuatro espermátidas haploides','Un óvulo y tres cuerpos polares','Dos espermatocitos primarios'],a:1,e:'Un espermatocito primario completa meiosis I y II y origina cuatro espermátidas haploides.'},
{q:'¿Qué contenido cromosómico tiene un ovocito primario humano detenido en profase I?',o:['23 cromosomas simples y 1C','46 cromosomas duplicados y 4C','23 cromosomas duplicados y 2C','46 cromosomas simples y 2C'],a:1,e:'El ovocito primario ya duplicó el ADN, pero todavía conserva los dos juegos de homólogos: 2n = 46, 92 cromátidas y 4C.'},
{q:'Al terminar la meiosis I del ovocito primario, el ovocito secundario es:',o:['Diploide, con 46 cromosomas simples','Haploide, con 23 cromosomas duplicados y 2C','Haploide, con 23 cromosomas simples y 1C','Diploide, con 46 cromosomas duplicados'],a:1,e:'La meiosis I separa homólogos. El ovocito secundario queda haploide, pero conserva cromosomas duplicados: 23 cromosomas, 46 cromátidas y 2C.'},
{q:'¿Qué célula se libera en la ovulación?',o:['Ovocito primario detenido en profase I','Óvulo que ya completó meiosis II','Ovocito secundario detenido en metafase II','Ovogonia diploide'],a:2,e:'En la ovulación se libera un ovocito secundario que inició meiosis II y queda detenido en metafase II hasta la fecundación.'},
{q:'¿Qué sucede con los folículos durante un ciclo ovárico según el material de clase?',o:['Todos los folículos que comienzan a crecer ovulan','Puede comenzar el desarrollo de más de uno, pero generalmente uno alcanza la ovulación','Los folículos comienzan a desarrollarse después de la fecundación','Ningún folículo se desarrolla después de la pubertad'],a:1,e:'Puede comenzar el desarrollo de más de un folículo, aunque generalmente uno llega a la etapa preovulatoria y libera el ovocito secundario.'},
{q:'¿Cuál es la diferencia entre menstruación y ciclo menstrual?',o:['Son términos equivalentes','La menstruación es un acontecimiento dentro del ciclo, no el ciclo completo','El ciclo menstrual ocurre solo durante la menstruación','La menstruación es la meiosis II'],a:1,e:'La menstruación es uno de los acontecimientos del ciclo menstrual; no representa toda la secuencia cíclica.'},
{q:'¿Qué conjunto de hormonas enumera el material para la línea germinal femenina?',o:['FSH, LH, estrógenos y progesterona','FSH, testosterona y adrenalina','LH, testosterona y progesterona','Solo estrógenos y progesterona'],a:0,e:'El cuadro del material enumera FSH, LH, estrógenos y progesterona para la línea femenina, sin desarrollar en detalle todas sus acciones individuales.'}
];
const COMPARACIONES_ADN = [
  {
    "q": "¿Qué célula contiene más ADN por célula: un ovocito primario detenido en profase I o una espermátida recién formada?",
    "o": [
      "La espermátida, porque ya terminó la meiosis.",
      "El ovocito primario: 4C frente a 1C, cuatro veces más ADN.",
      "Ambas contienen 2C.",
      "Tienen igual cantidad por ser células germinales."
    ],
    "a": 1,
    "e": "El ovocito primario está en 2n, 4C; la espermátida terminó meiosis II y está en n, 1C. El ovocito primario contiene cuatro veces más ADN."
  },
  {
    "q": "Al comparar un espermatocito primario y un ovocito primario humanos, ambos después de replicar el ADN y antes de completar meiosis I, ¿cuál tiene más ADN?",
    "o": [
      "El espermatocito primario, porque produce cuatro gametas.",
      "El ovocito primario, porque conserva más citoplasma.",
      "Tienen la misma cantidad: ambos son 2n, 4C, con 46 cromosomas y 92 cromátidas.",
      "El ovocito primario tiene 2C y el espermatocito 4C."
    ],
    "a": 2,
    "e": "Ambas células ya duplicaron el ADN, pero todavía no separaron los homólogos: 46 cromosomas duplicados, 92 cromátidas y 4C."
  },
  {
    "q": "¿Qué contiene más ADN por célula: el ovocito secundario que se libera en la ovulación o un espermatozoide maduro?",
    "o": [
      "El espermatozoide: 2C y el ovocito 1C.",
      "El ovocito secundario: 2C y el espermatozoide 1C.",
      "Ambos tienen 1C porque son haploides.",
      "Ambos tienen 2C porque ya completaron una división meiótica."
    ],
    "a": 1,
    "e": "El ovocito ovulado está detenido en metafase II: n, 2C. El espermatozoide completó meiosis II: n, 1C. El ovocito contiene el doble de ADN."
  },
  {
    "q": "Un espermatocito secundario y un ovocito secundario detenido en metafase II tienen, cada uno, ¿qué contenido genético?",
    "o": [
      "2n, 4C.",
      "n, 1C.",
      "n, 2C: 23 cromosomas duplicados, 46 cromátidas y 2C.",
      "2n, 2C."
    ],
    "a": 2,
    "e": "Ambas células completaron meiosis I: son haploides, pero todavía conservan cromátidas hermanas unidas. Cada una tiene n=23 y 2C."
  },
  {
    "q": "¿Qué diferencia de contenido de ADN existe entre una espermátida y un espermatozoide maduro?",
    "o": [
      "La espermátida tiene 2C y el espermatozoide 1C.",
      "El espermatozoide duplica su ADN durante la espermiogénesis.",
      "No hay diferencia: ambos son n, 1C; la espermiogénesis cambia la morfología, no el ADN.",
      "La espermátida es 2n y el espermatozoide n."
    ],
    "a": 2,
    "e": "La espermiogénesis no es una división. La espermátida y el espermatozoide conservan 23 cromosomas simples y 1C."
  },
  {
    "q": "Si se comparan una espermatogonia en G1 y una ovogonia antes de replicar su ADN, ¿cuál tiene más información genética?",
    "o": [
      "La espermatogonia, por estar en el testículo.",
      "La ovogonia, porque dará origen al ovocito.",
      "Ambas tienen la misma cantidad: 2n, 2C y 46 cromosomas simples.",
      "Ambas son n, 1C."
    ],
    "a": 2,
    "e": "Ambas son células germinales diploides antes de fase S: 46 cromosomas simples y 2C."
  },
  {
    "q": "¿Qué célula tiene el doble de ADN por célula: una espermatogonia en G1 o un espermatocito primario después de la fase S?",
    "o": [
      "La espermatogonia: 4C frente a 2C.",
      "El espermatocito primario: 4C frente a 2C.",
      "Tienen igual cantidad porque ambos son 2n.",
      "La espermatogonia, porque aún no se dividió."
    ],
    "a": 1,
    "e": "La espermatogonia en G1 tiene 2n, 2C. El espermatocito primario ya replicó el ADN y tiene 2n, 4C."
  },
  {
    "q": "¿Qué contiene más ADN por célula: una ovogonia en G1 o un ovocito primario detenido en profase I?",
    "o": [
      "La ovogonia, porque es diploide.",
      "El ovocito primario: 4C frente a 2C.",
      "Ambos tienen 4C por ser diploides.",
      "Ambos tienen 2C porque no completaron meiosis I."
    ],
    "a": 1,
    "e": "La ovogonia en G1 tiene 2C. El ovocito primario ya atravesó fase S y permanece en profase I con 4C. Ambos son 2n."
  },
  {
    "q": "¿Qué diferencia de ADN hay entre el ovocito primario detenido en profase I y el ovocito secundario recién formado tras meiosis I?",
    "o": [
      "El ovocito secundario tiene el doble: 4C frente a 2C.",
      "El ovocito primario tiene el doble: 4C frente a 2C.",
      "Tienen igual cantidad: ambos 2C.",
      "El ovocito primario es 1C y el secundario 2C."
    ],
    "a": 1,
    "e": "Antes de meiosis I, el ovocito primario tiene 2n, 4C. Después de separar los homólogos, el ovocito secundario es n, 2C."
  },
  {
    "q": "Al finalizar meiosis I de la ovogénesis, ¿cómo se comparan el ovocito secundario y el primer cuerpo polar en su contenido cromosómico?",
    "o": [
      "El ovocito secundario tiene 2C y el cuerpo polar 1C.",
      "El cuerpo polar es diploide y el ovocito haploide.",
      "Ambos son n, 2C y contienen igual ADN, aunque el ovocito conserva casi todo el citoplasma.",
      "El ovocito secundario tiene 4C porque retuvo el citoplasma."
    ],
    "a": 2,
    "e": "La división es asimétrica en citoplasma, no en la reducción cromosómica. Ambos reciben un juego haploide de cromosomas duplicados: n, 2C."
  },
  {
    "q": "¿Qué contiene más ADN por célula: un ovocito primario detenido en profase I o un espermatocito secundario después de meiosis I?",
    "o": [
      "El espermatocito secundario, porque separó homólogos.",
      "El ovocito primario: 4C frente a 2C.",
      "Ambos tienen 2C.",
      "Ambos tienen 4C."
    ],
    "a": 1,
    "e": "El ovocito primario aún es 2n, 4C. El espermatocito secundario ya es n, 2C."
  },
  {
    "q": "¿Cuántas veces más ADN tiene un espermatocito primario humano que un espermatozoide maduro?",
    "o": [
      "Dos veces: 2C frente a 1C.",
      "Cuatro veces: 4C frente a 1C.",
      "La misma cantidad por ser células germinales.",
      "Dos veces: ambos tienen 46 moléculas de ADN."
    ],
    "a": 1,
    "e": "El espermatocito primario tiene 4C después de replicar; el espermatozoide tiene 1C. La relación es 4:1."
  },
  {
    "q": "Por célula, ¿qué etapa contiene más ADN: metafase I o metafase II?",
    "o": [
      "Metafase II: 4C frente a 2C.",
      "Ambas tienen 2C.",
      "Metafase I: 2n, 4C; metafase II: n, 2C.",
      "Ambas tienen 4C."
    ],
    "a": 2,
    "e": "En metafase I la célula conserva ambos juegos de homólogos: 2n, 4C. En metafase II cada célula es haploide: n, 2C."
  },
  {
    "q": "¿Qué contiene más ADN: el ovocito secundario ovulado en metafase II o el óvulo después de completar meiosis II?",
    "o": [
      "El óvulo, porque ya está listo para fecundarse.",
      "El ovocito secundario: 2C frente a 1C.",
      "Ambos tienen 1C.",
      "Ambos tienen 2C."
    ],
    "a": 1,
    "e": "Antes de completar meiosis II, el ovocito secundario tiene 2C; al terminarla, el óvulo queda con cromosomas simples y 1C."
  },
  {
    "q": "Al comparar un óvulo humano recién formado tras meiosis II con un espermatozoide maduro, ¿qué afirmación es correcta?",
    "o": [
      "El óvulo tiene 2C y el espermatozoide 1C.",
      "El espermatozoide es 2n y el óvulo n.",
      "Ambos son haploides y tienen 1C, con 23 cromosomas simples.",
      "El óvulo tiene 46 cromosomas y el espermatozoide 23."
    ],
    "a": 2,
    "e": "Una vez completada meiosis II, ambas gametas maduras son n=23, con 23 cromátidas y 1C."
  },
  {
    "q": "Antes de la primera replicación del ADN del cigoto, ¿cómo se compara su contenido total de ADN con el de un espermatozoide?",
    "o": [
      "El cigoto tiene 2C y el espermatozoide 1C; el cigoto tiene el doble.",
      "El cigoto tiene 4C y el espermatozoide 1C.",
      "Ambos tienen 1C.",
      "El espermatozoide tiene el doble."
    ],
    "a": 0,
    "e": "La unión de dos genomas haploides de 1C restablece 2n, 2C en el cigoto antes de fase S. Tiene el doble de ADN que un espermatozoide."
  },
  {
    "q": "Un ovocito secundario detenido en metafase II y un cigoto antes de su primera fase S, ¿tienen la misma cantidad de ADN?",
    "o": [
      "No: el cigoto tiene 4C y el ovocito 2C.",
      "Sí, ambos tienen 2C, aunque el ovocito es n y el cigoto 2n.",
      "Sí, ambos son 2n, 2C.",
      "No: el ovocito tiene 1C y el cigoto 2C."
    ],
    "a": 1,
    "e": "Ambos contienen 2C total. El ovocito es n con 23 cromosomas duplicados; el cigoto 2n con 46 cromosomas simples. Igual ADN no implica igual ploidía."
  },
  {
    "q": "¿Qué diferencia existe entre un ovocito primario detenido en profase I y un cigoto antes de fase S, aunque ambos sean diploides?",
    "o": [
      "No hay diferencia: 2n siempre significa 2C.",
      "El cigoto tiene 4C y el ovocito 2C.",
      "El ovocito primario tiene 4C y el cigoto 2C: misma ploidía, distinta cantidad de ADN.",
      "El ovocito primario es n y el cigoto 2n."
    ],
    "a": 2,
    "e": "Ambos son 2n, pero el ovocito primario ya duplicó su ADN y está en 4C. El cigoto previo a fase S tiene 2C."
  },
  {
    "q": "Durante anafase I, antes de completarse la citocinesis, ¿qué diferencia hay entre el ADN total de la célula y el ADN que corresponde a cada polo?",
    "o": [
      "La célula completa tiene 2C y cada polo 4C.",
      "La célula completa conserva 4C; cada futuro núcleo recibe 2C.",
      "La célula completa tiene 1C y cada polo 2C.",
      "Cada polo tiene 4C."
    ],
    "a": 1,
    "e": "En anafase I el ADN total de la célula sigue siendo 4C hasta la división. Cada futuro núcleo recibe n, 2C."
  },
  {
    "q": "En anafase II, comparando el ADN de cada futuro núcleo con el de la célula haploide antes de separar cromátidas, ¿qué ocurre?",
    "o": [
      "Cada futuro núcleo recibe 1C, la mitad de los 2C de la célula en metafase II.",
      "Cada futuro núcleo recibe 2C.",
      "La ploidía vuelve a 2n y el ADN queda en 4C.",
      "No cambia: cada futuro núcleo sigue en 2C."
    ],
    "a": 0,
    "e": "La célula en metafase II tiene n, 2C. Al separarse las cromátidas, cada futuro núcleo recibe n cromosomas simples y 1C."
  },
  {
    "q": "¿Qué comparación entre un espermatocito secundario al terminar meiosis I y una espermátida al terminar meiosis II es correcta?",
    "o": [
      "Ambos tienen n, pero el secundario 2C y la espermátida 1C.",
      "El secundario es 2n, 4C y la espermátida n, 2C.",
      "Ambos tienen n, 1C.",
      "La espermátida tiene el doble de ADN."
    ],
    "a": 0,
    "e": "Después de meiosis I, el espermatocito secundario es n, 2C. Después de meiosis II, la espermátida es n, 1C."
  },
  {
    "q": "¿Cómo se comparan el número de cromosomas y el contenido de ADN de un ovocito primario en profase I y un espermatocito secundario?",
    "o": [
      "Ambos tienen 23 cromosomas y 2C.",
      "El ovocito primario tiene 46 cromosomas y 4C; el secundario 23 cromosomas y 2C.",
      "El ovocito tiene 92 cromosomas y 2C.",
      "Ambos tienen 46 cromosomas y 4C."
    ],
    "a": 1,
    "e": "El ovocito primario tiene 2n, 4C; el espermatocito secundario n, 2C. Los cromosomas se cuentan por centrómeros."
  },
  {
    "q": "Una célula primaria masculina completa meiosis I. ¿Cómo se compara el ADN de las dos células secundarias juntas con el ADN de la célula primaria antes de dividirse?",
    "o": [
      "Las dos células juntas tienen la mitad.",
      "Las dos células juntas conservan 4C en total; cada una recibe 2C.",
      "Las dos juntas tienen 8c.",
      "Cada secundaria tiene 1C, total 2C."
    ],
    "a": 1,
    "e": "Antes de meiosis I el espermatocito primario contiene 4C. Cada célula secundaria recibe 2C; juntas conservan los 4C iniciales."
  },
  {
    "q": "Si se considera el ADN total de los cuatro productos de la espermatogénesis al finalizar meiosis II, ¿cómo se compara con el ADN del espermatocito primario antes de dividirse?",
    "o": [
      "Los cuatro productos juntos contienen 4C, igual que la célula primaria; cada espermátida tiene 1C.",
      "Los cuatro juntos contienen 1C.",
      "Los cuatro juntos contienen 8c.",
      "Cada espermátida tiene 4C."
    ],
    "a": 0,
    "e": "El espermatocito primario empieza con 4C. Al final hay cuatro espermátidas de 1C: 4 × 1C = 4C en conjunto."
  },
  {
    "q": "¿Qué contiene más ADN por célula: el primer cuerpo polar recién formado o un espermatozoide maduro?",
    "o": [
      "El espermatozoide: 2C frente a 1C.",
      "Ambos tienen 1C.",
      "El primer cuerpo polar: 2C frente a 1C, aunque tenga mucho menos citoplasma.",
      "El primer cuerpo polar es 2n, 4C."
    ],
    "a": 2,
    "e": "El primer cuerpo polar se forma al completar meiosis I y es n, 2C. El espermatozoide es n, 1C. El tamaño citoplasmático no determina el ADN nuclear."
  },
  {
    "q": "¿Qué comparación es correcta entre el segundo cuerpo polar y un espermatozoide maduro?",
    "o": [
      "El segundo cuerpo polar tiene 2C y el espermatozoide 1C.",
      "Ambos son haploides con cromosomas simples y 1C.",
      "El segundo cuerpo polar es diploide.",
      "El espermatozoide tiene 4C."
    ],
    "a": 1,
    "e": "El segundo cuerpo polar se produce al finalizar meiosis II: es n, 1C, al igual que el óvulo y el espermatozoide maduros."
  },
  {
    "q": "Compara un ovocito secundario en metafase II con una espermatogonia en G1. ¿Qué afirmación distingue correctamente ADN y ploidía?",
    "o": [
      "Ambos tienen 2C, pero el ovocito es n con 23 cromosomas duplicados y la espermatogonia 2n con 46 simples.",
      "Ambos son 2n porque tienen 2C.",
      "El ovocito tiene 4C y la espermatogonia 1C.",
      "La espermatogonia tiene menos cromosomas."
    ],
    "a": 0,
    "e": "Ambas tienen 2C de ADN total, pero el ovocito es haploide con 23 cromosomas duplicados; la espermatogonia es diploide con 46 simples."
  },
  {
    "q": "Compara una espermatogonia en G1 y un ovocito primario detenido en profase I. ¿Qué afirmación es correcta?",
    "o": [
      "Tienen igual número de cromosomas, 46, pero el ovocito tiene el doble de ADN: 4C frente a 2C.",
      "El ovocito tiene 92 cromosomas.",
      "La espermatogonia tiene más ADN.",
      "Ambos tienen 46 cromosomas simples y 2C."
    ],
    "a": 0,
    "e": "Ambas conservan 46 cromosomas y son diploides. El ovocito primario ya replicó su ADN: 4C; la espermatogonia en G1 tiene 2C."
  },
  {
    "q": "¿Qué pareja tiene igual cantidad de ADN por célula, pero distinta ploidía: ovocito secundario en metafase II o espermatogonia en G1?",
    "o": [
      "No tienen igual ADN: el ovocito tiene 4C y la espermatogonia 2C.",
      "Ambos tienen 2C, pero el ovocito es n y la espermatogonia 2n.",
      "Ambos son n, 2C.",
      "El ovocito tiene 1C y la espermatogonia 4C."
    ],
    "a": 1,
    "e": "El ovocito secundario tiene n, 2C; la espermatogonia en G1 tiene 2n, 2C. Igual cantidad total de ADN no significa igual número de juegos cromosómicos."
  },
  {
    "q": "¿Cuál comparación muestra dos células con el mismo número de cromosomas, pero diferente cantidad de moléculas de ADN?",
    "o": [
      "Espermátida y espermatozoide: ambos 23 cromosomas, pero 23 y 46 moléculas.",
      "Espermatogonia en G1 y ovocito primario en profase I: ambas 46 cromosomas, pero 46 y 92 moléculas de ADN.",
      "Ovocito secundario y espermatocito secundario: 23 cromosomas, pero 23 y 92 moléculas.",
      "Óvulo y cigoto: ambos 46 cromosomas y 1C."
    ],
    "a": 1,
    "e": "Ambas tienen 46 cromosomas. La espermatogonia en G1 tiene cromosomas simples (46 moléculas de ADN, 2C); el ovocito primario tiene duplicados (92 moléculas, 4C)."
  },
  {
    "q": "¿Qué cambio ocurre en el contenido de ADN al pasar de una célula diploide en G1 a un espermatocito primario después de la fase S?",
    "o": [
      "Pasa de 2C a 4C sin cambiar 2n ni los 46 cromosomas.",
      "Pasa de 2n a n y de 2C a 1C.",
      "Pasa de 46 a 92 cromosomas y mantiene 2C.",
      "Pasa de 2C a 1C."
    ],
    "a": 0,
    "e": "Durante fase S se duplica el ADN de 2C a 4C. El número de cromosomas sigue siendo 46 y la ploidía 2n; cada cromosoma pasa a tener dos cromátidas."
  }
];
const EXPLICACION = [
{h:'Ploidía y contenido de ADN',p:'La ploidía (n o 2n) expresa la cantidad de juegos cromosómicos. El contenido de ADN (c) indica cuánto material genético posee la célula. La replicación transforma 2C en 4C, pero no duplica la ploidía ni el número de cromosomas.'},
{h:'Meiosis I: división reduccional',p:'En profase I ocurren leptonema, cigonema, paquinema, diplonema y diacinesis. La sinapsis aproxima homólogos; el crossing over genera recombinación entre cromátidas no hermanas. En anafase I se separan los homólogos y cada célula resultante es haploide, con cromosomas duplicados.'},
{h:'Meiosis II: división ecuacional',p:'No hay una nueva replicación de ADN. Los cromosomas se alinean individualmente y en anafase II se separan las cromátidas hermanas. El resultado general son cuatro productos haploides con cromosomas simples.'},
{h:'Espermatogénesis y espermiogénesis',p:'La espermatogénesis ocurre en los túbulos seminíferos y la diferenciación meiótica comienza en la pubertad. Cada espermatocito primario produce cuatro espermátidas. La espermiogénesis es la diferenciación morfológica de esas espermátidas en espermatozoides: formación del acrosoma y flagelo, condensación nuclear y pérdida de gran parte del citoplasma.'},
{h:'Ovogénesis y detenciones',p:'La ovogénesis comienza durante la vida fetal. Los ovocitos primarios quedan detenidos en profase I avanzada. A partir de la pubertad algunos reanudan su maduración; la meiosis I produce un ovocito secundario y un primer cuerpo polar. El ovocito secundario ovulado queda detenido en metafase II y completa esa división únicamente si ocurre fecundación.'},
{h:'Asimetría citoplasmática',p:'En la ovogénesis las divisiones meióticas reparten el citoplasma de manera desigual. El ovocito conserva casi todo el citoplasma y los cuerpos polares reciben muy poco. El resultado funcional es una gameta femenina, no cuatro gametas equivalentes.'},
{h:'Desarrollo folicular y ovulación',p:'En cada ciclo ovárico puede comenzar el desarrollo de más de un folículo, aunque generalmente uno alcanza la etapa que culmina con la ovulación. La célula liberada es un ovocito secundario detenido en metafase II, no un óvulo con meiosis completa. La menstruación es un acontecimiento del ciclo menstrual, no un sinónimo del ciclo entero.'},
{h:'Regulación hormonal indicada en el material',p:'El cuadro enumera FSH, LH y testosterona para la línea masculina; y FSH, LH, estrógenos y progesterona para la femenina. La clase también menciona células de sostén dentro de los túbulos seminíferos y células ubicadas por fuera. Los anticonceptivos hormonales inhiben la liberación de FSH y LH. El material no desarrolla todas las acciones individuales de cada hormona, por lo que no se atribuyen mecanismos adicionales.'}
];
const CSS = '.gameto{--bg:#050b1b;--ink:#eaf1ff;--muted:#a8bce7;--mint:#5ce5bf;--gold:#ffc66d;color:var(--ink);max-width:1240px;margin:0 auto;padding:clamp(13px,2.6vw,30px);background:radial-gradient(ellipse at 55% 0%,#182b64 0,transparent 48%),var(--bg);border:1px solid #1e3470;border-radius:24px;font-family:inherit;overflow:hidden}.gameto *{box-sizing:border-box}.gameto button,.gameto select{font:inherit;color:var(--ink);background:#10234a;border:1px solid #2c4785;border-radius:12px;padding:9px 12px;cursor:pointer}.gameto button:hover{border-color:#86a9ff}.gameto button:focus-visible,.gameto select:focus-visible{outline:2px solid var(--mint);outline-offset:3px}.gameto button:disabled{opacity:.4;cursor:not-allowed}.gameto .gm-back{background:transparent;border:0;color:#b6c8ef;padding:5px 0}.gameto .gm-kicker{color:var(--mint);font-size:.7rem;font-weight:850;letter-spacing:.16em;margin:12px 0 8px}.gameto h1{font-size:clamp(1.8rem,4.7vw,3rem);line-height:1.04;letter-spacing:-.04em;margin:0 0 10px}.gameto h2{font-size:clamp(1.15rem,3vw,1.6rem);margin:0 0 8px}.gameto h3{font-size:1rem;margin:0 0 7px}.gameto p{color:#bacaf0;line-height:1.65}.gameto .gm-hero{padding:17px 0 21px;border-bottom:1px solid #243b6c}.gameto .gm-hero p{max-width:790px;margin:0}.gameto .gm-tags{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px}.gameto .gm-tags span{border:1px solid #294574;background:#0b1c3a;border-radius:99px;padding:6px 10px;font-size:.74rem;color:#bdd3fa}.gameto .gm-tabs{display:flex;gap:7px;overflow-x:auto;padding:7px;margin:16px 0;border:1px solid #1c3267;border-radius:15px;background:#071229}.gameto .gm-tabs button{flex:0 0 auto;font-size:.82rem}.gameto .gm-tabs button.active,.gameto .gm-mode.active,.gameto .gm-phase.active{background:linear-gradient(135deg,#385ce6,#473db7);border-color:#829aff;box-shadow:0 0 18px #526eff2a}.gameto .gm-modebar{display:flex;gap:7px;flex-wrap:wrap;margin:4px 0 14px}.gameto .gm-modebar button{font-size:.8rem}.gameto .gm-card{border:1px solid #233c78;border-radius:18px;background:linear-gradient(145deg,#0a1834,#071126);padding:clamp(13px,2.5vw,22px);margin:12px 0;min-width:0}.gameto .gm-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:13px}.gameto .gm-head p{margin:4px 0 0;font-size:.85rem}.gameto .gm-chip{font-size:.66rem;letter-spacing:.08em;color:var(--mint);border:1px solid #276b70;border-radius:999px;padding:7px 9px;white-space:nowrap}.gameto .gm-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,.8fr);gap:14px;align-items:stretch}.gameto .gm-scene{display:grid;place-items:center;min-height:290px;border:1px solid #1e3974;border-radius:17px;background:radial-gradient(ellipse at center,#142b5a 0,#07132c 68%);overflow:hidden;padding:8px}.gameto .gm-scene svg{width:100%;height:auto;max-height:430px;display:block}.gameto .gm-readout{display:flex;flex-direction:column;gap:10px}.gameto .gm-phase-title{font-size:1.22rem;font-weight:850;line-height:1.2}.gameto .gm-sub{color:var(--mint);font-size:.78rem;font-weight:750}.gameto .gm-readout p{font-size:.88rem;margin:0}.gameto .gm-key{border-left:3px solid var(--gold);background:#111e3b;padding:11px 13px;border-radius:0 12px 12px 0;font-size:.83rem;line-height:1.55;color:#e6edff}.gameto .gm-key b{color:var(--gold)}.gameto .gm-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}.gameto .gm-stat{background:#0a1730;border:1px solid #1d346b;border-radius:12px;padding:10px;min-width:0}.gameto .gm-stat span{display:block;color:#9eb4e4;font-size:.68rem;margin-bottom:5px}.gameto .gm-stat b{font-size:.92rem}.gameto .gm-phases{display:flex;gap:6px;overflow-x:auto;padding:3px 1px 10px;margin:8px 0 3px}.gameto .gm-phase{flex:0 0 auto;font-size:.73rem;line-height:1.25;padding:8px 10px;min-height:40px}.gameto .gm-progress{height:5px;border-radius:99px;background:#15254a;overflow:hidden;margin:12px 0}.gameto .gm-progress span{display:block;height:100%;background:linear-gradient(90deg,#5ce5bf,#a99aff,#ff83b5)}.gameto .gm-controls{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px}.gameto .gm-primary{background:linear-gradient(135deg,#4b65f1,#5243bc);border-color:#8295ff;font-weight:750}.gameto .gm-next{background:#153a3b;border-color:#3b8979}.gameto .gm-selectrow{display:flex;gap:9px;align-items:center;flex-wrap:wrap;color:#b8c9ed;font-size:.8rem}.gameto .gm-selectrow select{padding:8px 10px;font-size:.8rem}.gameto .gm-legend{display:flex;gap:10px;flex-wrap:wrap;color:#aebfe3;font-size:.72rem;margin-top:8px}.gameto .gm-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.gameto .gm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.gameto .gm-grid article{border:1px solid #20386f;background:#09152d;border-radius:14px;padding:14px}.gameto .gm-grid p{font-size:.82rem;margin:7px 0 0}.gameto .gm-note{border:1px solid #30466e;background:#0a1730;border-radius:13px;padding:13px;color:#c6d5f1;margin-top:12px;font-size:.82rem;line-height:1.55}.gameto .gm-note strong{color:var(--gold)}.gameto .gm-table-wrap{overflow-x:auto;border:1px solid #263e70;border-radius:13px}.gameto table{width:100%;border-collapse:collapse;font-size:.81rem;min-width:680px}.gameto th{background:#17294e;color:#dce7ff;text-align:left;font-size:.75rem;padding:11px 10px}.gameto td{padding:10px;border-top:1px solid #23385f;color:#c2d0ef;vertical-align:top;line-height:1.5}.gameto tr:nth-child(even) td{background:#0c1b36}.gameto .gm-quiz-q{font-size:1.12rem;font-weight:800;line-height:1.5;margin:17px 0}.gameto .gm-answers{display:grid;grid-template-columns:1fr 1fr;gap:9px}.gameto .gm-answer{text-align:left;display:flex;gap:10px;align-items:flex-start;line-height:1.45}.gameto .gm-letter{display:grid;place-items:center;min-width:27px;height:27px;border-radius:8px;background:#1a2d5c;font-weight:800}.gameto .gm-answer.good{border-color:#3ed9a5;background:#10372f}.gameto .gm-answer.bad{border-color:#ff7096;background:#3a1830}.gameto .gm-feedback{color:#c3d2f4;min-height:40px;margin:12px 0;font-size:.86rem}.gameto .gm-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#9db2e1;font-size:.8rem}.gameto .gm-result{text-align:center;padding:25px}.gameto .gm-result .score{font-size:3rem;font-weight:900;color:#91b8ff}.gameto .gm-stat-big{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.gameto .gm-stat-big article{background:#09152d;border:1px solid #20386f;border-radius:12px;padding:12px}.gameto .gm-stat-big span{display:block;color:#9eb4e4;font-size:.7rem}.gameto .gm-stat-big strong{display:block;font-size:1.2rem;margin-top:4px}.gameto .gm-small{font-size:.75rem;color:#9eb3dc}.gameto .gm-calculator{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gameto .gm-calculator label{display:flex;flex-direction:column;gap:6px;color:#aebfe3;font-size:.77rem}.gameto .gm-calculator select{width:100%}.gameto .gm-warning{padding:10px 12px;border-left:3px solid #ffbd70;background:#241d2b;border-radius:0 10px 10px 0;color:#ffe7c7;font-size:.8rem;line-height:1.5;margin-top:10px}@media(max-width:850px){.gameto .gm-layout{grid-template-columns:1fr}.gameto .gm-scene{min-height:240px}.gameto .gm-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:560px){.gameto{border-radius:16px;padding:12px}.gameto .gm-head{display:block}.gameto .gm-chip{display:inline-block;margin-top:8px}.gameto .gm-grid,.gameto .gm-answers,.gameto .gm-calculator{grid-template-columns:1fr}.gameto .gm-stat-big{grid-template-columns:1fr 1fr}.gameto .gm-stats{grid-template-columns:1fr 1fr}.gameto .gm-controls{align-items:stretch}.gameto .gm-controls button{flex:1}.gameto .gm-tabs{position:sticky;top:0;z-index:5}.gameto .gm-stagegrid{grid-template-columns:1fr 1fr}}@media(prefers-reduced-motion:no-preference){.gameto .gm-chr{transform-box:fill-box;transform-origin:center;animation:gm-enter .42s ease-out both}.gameto .gm-move-left{animation:gm-left .7s ease-out both}.gameto .gm-move-right{animation:gm-right .7s ease-out both}@keyframes gm-enter{from{opacity:.2;scale:.8}to{opacity:1;scale:1}}@keyframes gm-left{from{translate:25px 0;opacity:.4}to{translate:0 0;opacity:1}}@keyframes gm-right{from{translate:-25px 0;opacity:.4}to{translate:0 0;opacity:1}}}@media(prefers-reduced-motion:reduce){.gameto *{animation:none!important;transition:none!important}}';
export function abrirLabGametogenesis({app,volver}){
 let tab='vista',mode='meiosis',mi=0,orientation=0,track={esperma:0,ovo:0},n2=4,calc='g1',qi=0,score=0,answered=false,quizType='general',quizPool=[],timer=null,playing=false;
 if(!document.getElementById('gm-lab-css')){const st=document.createElement('style');st.id='gm-lab-css';st.textContent=CSS;document.head.appendChild(st);}
 const stop=()=>{if(timer){clearInterval(timer);timer=null;}playing=false;};
 function statsFor(id,N){
  const n=N/2;
  if(id==='g1')return {pl:'2n',chr:N,ch:N,dna:N,c:'2C',label:'Por célula'};
  if(id==='s'||['lepto','cygo','pachi','diplo','diaci','meta1'].includes(id))return {pl:'2n',chr:N,ch:N*2,dna:N*2,c:'4C',label:'Por célula'};
  if(id==='ana1')return {pl:'n',chr:n,ch:N,dna:N,c:'2C',label:'Por futuro núcleo'};
  if(id==='telo1'||id==='pro2'||id==='meta2')return {pl:'n',chr:n,ch:N,dna:N,c:'2C',label:'Por célula'};
  if(id==='ana2')return {pl:'n',chr:n,ch:n,dna:n,c:'1C',label:'Por futuro núcleo'};
  if(id==='telo2')return {pl:'n',chr:n,ch:n,dna:n,c:'1C',label:'Por producto'};
  return {pl:'2n',chr:N,ch:N,dna:N,c:'2C',label:'Por célula'};
 }
 function statCards(s){return '<div class="gm-stats"><div class="gm-stat"><span>Ploidía</span><b>'+s.pl+'</b></div><div class="gm-stat"><span>Cromosomas</span><b>'+s.chr+'</b></div><div class="gm-stat"><span>Cromátidas</span><b>'+s.ch+'</b></div><div class="gm-stat"><span>Moléculas de ADN</span><b>'+s.dna+'</b></div><div class="gm-stat"><span>Contenido</span><b>'+s.c+'</b></div><div class="gm-stat"><span>Referencia</span><b>'+s.label+'</b></div></div>';}
 function ellipse(x,y,rx,ry,stroke){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#10234a" fill-opacity=".8" stroke="'+(stroke||'#6685d4')+'" stroke-width="2.5"/>';}
 function chromosome(x,y,color,rep,extra){
   if(!rep)return '<g class="gm-chr" transform="translate('+x+' '+y+')"><path d="M-7 -25 L7 25" stroke="'+color+'" stroke-width="8" stroke-linecap="round"/>'+(extra?'<path d="M1 10 L7 24" stroke="'+extra+'" stroke-width="8" stroke-linecap="round"/>':'')+'<circle r="3.5" fill="#ffcf78"/></g>';
   return '<g class="gm-chr" transform="translate('+x+' '+y+')"><path d="M-12 -25 L0 0 L-12 25 M12 -25 L0 0 L12 25" fill="none" stroke="'+color+'" stroke-width="8" stroke-linecap="round"/>'+(extra?'<path d="M3 6 L12 24" stroke="'+(typeof extra==='string'?extra:'#ffcf78')+'" stroke-width="8" stroke-linecap="round"/>':'')+'<circle r="4.2" fill="#ffcf78" stroke="#fff1bf" stroke-width="1.2"/></g>';
 }
 function caption(x,y,s,color){return '<text x="'+x+'" y="'+y+'" fill="'+(color||'#eaf1ff')+'" font-size="13" font-weight="700" text-anchor="middle">'+s+'</text>';}
 function meiosisSVG(id){
  const A='#a99aff',B='#ff9d80',C='#5ce5bf',D='#f3ce67',T='#ffcf78',secondLeft=orientation===0?C:D,secondRight=orientation===0?D:C,donorLeft=orientation===0?D:C,donorRight=orientation===0?C:D;let s='<svg viewBox="0 0 760 390" role="img" aria-label="Modelo esquemático de '+esc(MEIOSIS[mi].name)+'">';
  if(id==='g1'){s+=ellipse(380,190,125,112)+'<ellipse cx="380" cy="190" rx="83" ry="76" fill="#111e43" stroke="#9a8be6" stroke-dasharray="5 5"/>'+chromosome(345,155,A,false)+chromosome(415,155,B,false)+chromosome(345,224,C,false)+chromosome(415,224,D,false)+caption(380,35,'CÉLULA DIPLOIDE ANTES DE REPLICAR')+caption(380,345,'4 cromosomas simples en el ejemplo 2n = 4','#a9caff');}
  else if(id==='s'||['lepto','cygo','pachi','diplo','diaci'].includes(id)){
   s+=ellipse(380,190,125,112)+'<ellipse cx="380" cy="190" rx="83" ry="76" fill="#111e43" stroke="#9a8be6" stroke-dasharray="'+(['lepto','cygo','pachi','diplo','diaci'].includes(id)?'5 5':'none')+'"/>';
   if(id==='s'){s+=chromosome(345,150,A,true)+chromosome(415,150,B,true)+chromosome(345,225,C,true)+chromosome(415,225,D,true)+caption(380,35,'DESPUÉS DE LA REPLICACIÓN')+caption(380,345,'Cada cromosoma tiene dos cromátidas','#a9caff');}
   else{
     const crossed=['pachi','diplo','diaci'].includes(id); s+=chromosome(346,150,A,true,crossed?B:null)+chromosome(380,150,B,true,crossed?A:null)+chromosome(346,225,C,true,crossed?D:null)+chromosome(380,225,D,true,crossed?C:null);
    if(id==='lepto')s+=caption(570,135,'Filamentos','#a9caff')+caption(570,154,'condensados','#a9caff');
    if(id==='cygo')s+='<path d="M346 111 Q363 95 380 111 M346 185 Q363 169 380 185" fill="none" stroke="#eaf1ff" stroke-width="2" stroke-dasharray="3 3"/>'+caption(565,140,'Sinapsis','#5ce5bf')+caption(565,160,'complejo sinaptonémico','#a9caff');
    if(id==='pachi')s+='<path d="M340 125 Q361 110 381 126 M340 200 Q361 185 381 201" fill="none" stroke="'+T+'" stroke-width="5" stroke-linecap="round"/>'+caption(570,138,'Crossing over',T)+caption(570,158,'entre cromátidas no', '#a9caff')+caption(570,176,'hermanas','#a9caff');
    if(id==='diplo')s+='<path d="M346 113 Q363 99 380 113 M346 188 Q363 174 380 188" fill="none" stroke="'+T+'" stroke-width="2.5"/>'+caption(565,143,'Quiasmas',T);
    if(id==='diaci')s+=caption(565,143,'Máxima','#5ce5bf')+caption(565,161,'condensación','#5ce5bf');
    s+=caption(380,35,'PROFASE I · '+MEIOSIS[mi].name.toUpperCase())+caption(380,345,'Dos bivalentes representativos · tétradas de cuatro cromátidas','#a9caff');
   }
  }else if(id==='meta1'){
   s+=ellipse(380,190,125,112)+caption(380,35,'BIVALENTES EN LA PLACA ECUATORIAL')+chromosome(350,150,A,true,B)+chromosome(390,150,B,true,A)+chromosome(350,230,secondLeft,true,donorLeft)+chromosome(390,230,secondRight,true,donorRight)+'<path d="M380 75 V305" stroke="#ffcf78" stroke-dasharray="5 6" stroke-width="2"/>'+caption(380,345,'Orientación independiente de cada par','#a9caff');
  }else if(id==='ana1'||id==='telo1'){
   if(id==='ana1'){s+=ellipse(380,190,125,112)+caption(380,35,'SEPARACIÓN DE HOMÓLOGOS')+chromosome(270,140,A,true,B)+chromosome(270,235,secondLeft,true,donorLeft)+chromosome(490,140,B,true,A)+chromosome(490,235,secondRight,true,donorRight)+caption(270,320,'Polo 1','#a9caff')+caption(490,320,'Polo 2','#a9caff');}
   else{s+=ellipse(235,190,112,103)+ellipse(525,190,112,103)+chromosome(205,155,A,true,B)+chromosome(265,225,secondLeft,true,donorLeft)+chromosome(495,155,B,true,A)+chromosome(555,225,secondRight,true,donorRight)+caption(235,325,'Célula haploide 1','#5ce5bf')+caption(525,325,'Célula haploide 2','#5ce5bf');}
  }else if(id==='pro2'||id==='meta2'){
   s+=ellipse(235,190,112,103)+ellipse(525,190,112,103)+chromosome(205,155,A,true,B)+chromosome(265,225,secondLeft,true,donorLeft)+chromosome(495,155,B,true,A)+chromosome(555,225,secondRight,true,donorRight)+caption(380,35,id==='pro2'?'NUEVOS HUSOS · SIN REPLICACIÓN':'CROMOSOMAS INDIVIDUALES EN EL ECUADOR')+caption(235,325,'n = '+(n2/2),'#5ce5bf')+caption(525,325,'n = '+(n2/2),'#5ce5bf');
  }else if(id==='ana2'){
   s+=ellipse(235,190,112,103)+ellipse(525,190,112,103)+chromosome(190,145,A,false)+chromosome(280,235,A,false,B)+chromosome(480,145,B,false)+chromosome(570,235,B,false,A)+chromosome(190,235,secondLeft,false)+chromosome(280,145,secondLeft,false,donorLeft)+chromosome(480,235,secondRight,false)+chromosome(570,145,secondRight,false,donorRight)+caption(380,35,'SEPARACIÓN DE CROMÁTIDAS HERMANAS')+caption(380,345,'Cada cromátida pasa a ser un cromosoma','#a9caff');
  }else{
   [[105,115,A,secondLeft,null,null],[275,115,A,secondLeft,B,donorLeft],[485,115,B,secondRight,A,donorRight],[655,115,B,secondRight,null,null]].forEach(p=>{s+=ellipse(p[0],p[1],58,53)+chromosome(p[0]-16,p[1],p[2],false,p[4])+chromosome(p[0]+16,p[1],p[3],false,p[5]);});
   s+=caption(380,35,'CUATRO PRODUCTOS HAPLOIDES')+caption(380,230,'Un cromosoma simple de cada par representativo · n = '+(n2/2),'#5ce5bf');
  }
  return s+'</svg>';
 }
 function renderMeiosis(){
  const f=MEIOSIS[mi],st=statsFor(f.id,n2),mount=app.querySelector('#gm-view');
  mount.innerHTML='<section class="gm-card"><div class="gm-head"><div><div class="gm-kicker">MODELO CROMOSÓMICO · DOS PARES REPRESENTATIVOS</div><h2>Meiosis paso a paso</h2><p>Avanzá por las subetapas de profase I y observá cuándo se separan los homólogos y cuándo las cromátidas.</p></div><span class="gm-chip">2n = '+n2+' · MODELO</span></div><div class="gm-selectrow"><label for="gm-n2">Número diploide:</label><select id="gm-n2"><option value="4" '+(n2===4?'selected':'')+'>2n = 4</option><option value="6" '+(n2===6?'selected':'')+'>2n = 6</option><option value="8" '+(n2===8?'selected':'')+'>2n = 8</option><option value="12" '+(n2===12?'selected':'')+'>2n = 12</option><option value="46" '+(n2===46?'selected':'')+'>2n = 46 (humano)</option></select><span class="gm-small">El dibujo muestra dos pares; los conteos se ajustan al valor elegido.</span></div><div class="gm-phases">'+MEIOSIS.map((x,i)=>'<button class="gm-phase '+(i===mi?'active':'')+'" data-mi="'+i+'">'+(i+1)+'. '+esc(x.name)+'</button>').join('')+'</div><div class="gm-progress"><span style="width:'+((mi+1)/MEIOSIS.length*100)+'%"></span></div><div class="gm-layout"><div><div class="gm-scene">'+meiosisSVG(f.id)+'</div><div class="gm-legend"><span><i style="background:#a99aff"></i>Par 1 · homólogo materno</span><span><i style="background:#ff9d80"></i>Par 1 · homólogo paterno</span><span><i style="background:#5ce5bf"></i>Par 2 · homólogo materno</span><span><i style="background:#f3ce67"></i>Par 2 · homólogo paterno</span><span><i style="background:#ffcf78"></i>Quiasma / punto de intercambio</span></div></div><div class="gm-readout"><div class="gm-sub">'+esc(f.group)+'</div><div class="gm-phase-title">'+esc(f.name)+'</div><p>'+esc(f.text)+'</p><div class="gm-key"><b>Clave de examen:</b> '+esc(f.key)+'</div>'+statCards(st)+'</div></div><div class="gm-controls">'+(mi===7?'<button id="gm-orient">↔ '+(orientation===0?'Ver otra orientación':'Volver a la orientación anterior')+'</button>':'')+'<button id="gm-prev" '+(mi===0?'disabled':'')+'>← Anterior</button><button class="gm-primary" id="gm-play">'+(playing?'Ⅱ Pausar':'▶ Reproducir')+'</button><span class="gm-small">Etapa '+(mi+1)+' de '+MEIOSIS.length+'</span><button class="gm-next" id="gm-next" '+(mi===MEIOSIS.length-1?'disabled':'')+'>Siguiente →</button></div><div class="gm-note"><strong>Cómo leer el conteo:</strong> en anafase I y II las cifras se expresan por futuro núcleo o polo. Durante la transición, la célula completa todavía contiene el material de ambos polos.</div></section>';
  mount.querySelectorAll('[data-mi]').forEach(b=>b.onclick=()=>{stop();mi=Number(b.dataset.mi);renderMeiosis();});
  mount.querySelector('#gm-n2').onchange=e=>{n2=Number(e.target.value);renderMeiosis();};
  mount.querySelector('#gm-prev').onclick=()=>{stop();mi=Math.max(0,mi-1);renderMeiosis();};
  mount.querySelector('#gm-next').onclick=()=>{stop();mi=Math.min(MEIOSIS.length-1,mi+1);renderMeiosis();};
  const orientationButton=mount.querySelector('#gm-orient'); if(orientationButton)orientationButton.onclick=()=>{orientation=1-orientation;renderMeiosis();};
  mount.querySelector('#gm-play').onclick=()=>{if(playing){stop();renderMeiosis();return;}playing=true;timer=setInterval(()=>{if(mi>=MEIOSIS.length-1){stop();renderMeiosis();return;}mi++;renderMeiosis();},1900);renderMeiosis();};
 }
 function trackSVG(kind,i){
  let s='<svg viewBox="0 0 760 320" role="img" aria-label="Esquema de '+(kind==='esperma'?'espermatogénesis':'ovogénesis')+'">';
  if(kind==='esperma'){
   if(i<2){s+=ellipse(380,150,i===0?83:105,i===0?83:105)+'<ellipse cx="380" cy="150" rx="53" ry="48" fill="#111e43" stroke="#9a8be6" stroke-dasharray="4 4"/>'+chromosome(355,125,'#a99aff',i===1)+chromosome(405,175,'#5ce5bf',i===1)+caption(380,35,i===0?'CÉLULA DIPLOIDE':'CROMOSOMAS DUPLICADOS')+caption(380,285,i===0?'Espermatogonia':'Espermatocito primario','#a9caff');}
   else if(i===2){s+=ellipse(230,150,85,76)+ellipse(530,150,85,76)+chromosome(205,145,'#a99aff',true)+chromosome(255,165,'#5ce5bf',true)+chromosome(505,145,'#ff9d80',true)+chromosome(555,165,'#f3ce67',true)+caption(230,35,'ESPERMATOCITO II')+caption(530,35,'ESPERMATOCITO II')+caption(380,280,'Meiosis I: se separaron los homólogos','#5ce5bf');}
   else if(i===3){[[130,115,'#a99aff'],[300,115,'#5ce5bf'],[460,115,'#ff9d80'],[630,115,'#f3ce67']].forEach(p=>{s+=ellipse(p[0],p[1],52,48)+chromosome(p[0]-10,p[1],p[2],false)+chromosome(p[0]+10,p[1],p[2],false);});s+=caption(380,35,'CUATRO ESPERMÁTIDAS HAPLOIDES')+caption(380,245,'Meiosis II: separación de cromátidas','#5ce5bf');}
   else{[[130,125],[300,125],[470,125],[640,125]].forEach((p,j)=>{const c=['#a99aff','#5ce5bf','#ff9d80','#f3ce67'][j];s+='<g><ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="19" ry="24" fill="'+c+'" stroke="#fff" stroke-width="1.2"/><path d="M'+p[0]+' '+(p[1]+22)+' Q'+(p[0]-24)+' 220 '+(p[0]+4)+' 280" fill="none" stroke="#7edcf4" stroke-width="4" stroke-linecap="round"/><path d="M'+(p[0]-12)+' '+(p[1]-20)+' Q'+p[0]+' '+(p[1]-38)+' '+(p[0]+13)+' '+(p[1]-20)+'" fill="#ffc66d" stroke="#ffe5ae"/></g>';});s+=caption(380,35,'ESPERMATOZOIDES')+caption(380,300,'Cabeza · acrosoma · pieza intermedia · flagelo','#5ce5bf');}
  }else{
   if(i===0){s+=ellipse(380,150,75,70)+chromosome(355,140,'#a99aff',false)+chromosome(405,165,'#ff9d80',false)+caption(380,35,'OVOGONIA · 2n')+caption(380,260,'Proliferación mitótica durante la vida fetal','#a9caff');}
   else if(i===1){s+=ellipse(360,150,105,95)+ellipse(360,150,69,61,'#a99aff')+chromosome(335,130,'#a99aff',true)+chromosome(385,170,'#ff9d80',true)+caption(360,35,'OVOCITO PRIMARIO · 2n, 4C')+caption(360,275,'Profase I avanzada · dictioteno','#ffcf78')+'<rect x="485" y="110" width="190" height="58" rx="12" fill="#2b2336" stroke="#ffbd70"/>'+caption(580,134,'DETENIDO','#ffcf78')+caption(580,153,'hasta la pubertad','#eaf1ff');}
   else if(i===2){s+=ellipse(255,150,102,94)+ellipse(500,150,27,25)+chromosome(230,145,'#a99aff',true)+chromosome(280,165,'#ff9d80',true)+chromosome(500,150,'#ffcf78',true)+caption(255,35,'OVOCITO SECUNDARIO')+caption(500,215,'1.er cuerpo polar','#ffcf78')+caption(255,276,'Casi todo el citoplasma','#5ce5bf');}
   else if(i===3){s+=ellipse(345,150,112,100)+chromosome(315,130,'#a99aff',true)+chromosome(375,170,'#ff9d80',true)+ellipse(495,230,21,19)+caption(345,35,'OVOCITO II')+caption(345,275,'Metafase II · ovulación','#ffcf78')+caption(495,270,'1.er cuerpo polar','#a9caff')+'<rect x="485" y="65" width="190" height="52" rx="12" fill="#2b2336" stroke="#ffbd70"/>'+caption(580,87,'DETENIDO','#ffcf78')+caption(580,104,'hasta fecundación','#eaf1ff');}
   else{s+=ellipse(330,150,104,94)+chromosome(330,150,'#a99aff',false)+ellipse(515,90,22,18)+ellipse(515,155,16,14)+ellipse(515,210,12,10)+caption(330,35,'ÓVULO · n, 1C')+caption(515,255,'Cuerpos polares',11,'#ffcf78')+'<path d="M650 150 Q610 125 585 138" fill="none" stroke="#7edcf4" stroke-width="3" stroke-linecap="round"/>'+caption(640,115,'Espermatozoide',10,'#7edcf4')+caption(380,300,'La unión de pronúcleos restablece 2n en el cigoto','#5ce5bf');}
  }
  return s+'</svg>';
 }
 function renderTrack(kind){
  const data=kind==='esperma'?ESPERMA:OVOGENESIS,i=track[kind],x=data[i],mount=app.querySelector('#gm-view');
  mount.innerHTML='<section class="gm-card"><div class="gm-head"><div><div class="gm-kicker">'+(kind==='esperma'?'DESARROLLO MASCULINO':'DESARROLLO FEMENINO')+'</div><h2>'+(kind==='esperma'?'Espermatogénesis':'Ovogénesis')+'</h2><p>Seleccioná cada etapa para seguir los cambios celulares, cromosómicos y temporales.</p></div><span class="gm-chip">'+(kind==='esperma'?'PRODUCCIÓN DESDE PUBERTAD':'RESERVA OVÁRICA LIMITADA')+'</span></div><div class="gm-phases">'+data.map((p,j)=>'<button class="gm-phase '+(j===i?'active':'')+'" data-track="'+j+'">'+(j+1)+'. '+esc(p.name)+'</button>').join('')+'</div><div class="gm-progress"><span style="width:'+((i+1)/data.length*100)+'%"></span></div><div class="gm-layout"><div class="gm-scene">'+trackSVG(kind,i)+'</div><div class="gm-readout"><div class="gm-sub">'+esc(x.group)+'</div><div class="gm-phase-title">'+esc(x.name)+'</div><p>'+esc(x.text)+'</p><div class="gm-key"><b>Clave:</b> '+esc(x.key)+'</div><div class="gm-stat-big"><article><span>Ploidía</span><strong>'+x.pl+'</strong></article><article><span>Cromosomas</span><strong>'+x.chr+'</strong></article><article><span>Cromátidas</span><strong>'+x.chrom+'</strong></article><article><span>ADN</span><strong>'+x.c+'</strong></article></div>'+(x.pause?'<div class="gm-warning">Ⅱ '+x.pause+'</div>':'')+'</div></div><div class="gm-controls"><button id="gm-track-prev" '+(i===0?'disabled':'')+'>← Anterior</button><span class="gm-small">Etapa '+(i+1)+' de '+data.length+'</span><button class="gm-next" id="gm-track-next" '+(i===data.length-1?'disabled':'')+'>Siguiente →</button></div>'+'<div class="gm-note"><strong>Sobre el esquema:</strong> el dibujo muestra cromosomas representativos para visualizar los cambios; los conteos del panel corresponden a células humanas (2n = 46).</div>'+(kind==='esperma'&&i===4?'<div class="gm-note"><strong>No confundir:</strong> espermatogénesis es todo el proceso; espermiogénesis es solamente la diferenciación de espermátida a espermatozoide.</div>':'')+(kind==='ovo'&&i===3?'<div class="gm-note"><strong>Precisión:</strong> durante la ovulación se libera el ovocito secundario detenido en metafase II; todavía no es el óvulo con meiosis II completa.</div>':'')+'</section>';
  mount.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{track[kind]=Number(b.dataset.track);renderTrack(kind);});
  mount.querySelector('#gm-track-prev').onclick=()=>{track[kind]=Math.max(0,i-1);renderTrack(kind);};
  mount.querySelector('#gm-track-next').onclick=()=>{track[kind]=Math.min(data.length-1,i+1);renderTrack(kind);};
 }
 function calcState(){
  const N=n2,n=N/2;
  if(calc==='g1')return {title:'G1 · antes de replicar',pl:'2n',chr:N,chrom:N,dna:N,c:'2C',desc:'Cada cromosoma tiene una sola cromátida. La célula conserva dos juegos cromosómicos.'};
  if(calc==='s')return {title:'Después de fase S / metafase I',pl:'2n',chr:N,chrom:N*2,dna:N*2,c:'4C',desc:'El ADN se duplicó: cada cromosoma tiene dos cromátidas. No cambió el número de cromosomas.'};
  if(calc==='mi1')return {title:'Después de meiosis I',pl:'n',chr:n,chrom:N,dna:N,c:'2C',desc:'Los homólogos se separaron. Cada célula es haploide, pero conserva cromosomas duplicados.'};
  if(calc==='mii')return {title:'Después de meiosis II',pl:'n',chr:n,chrom:n,dna:n,c:'1C',desc:'Las cromátidas hermanas se separaron. Cada producto haploide tiene cromosomas simples.'};
  return {title:'Ovocito secundario · metafase II',pl:'n',chr:n,chrom:N,dna:N,c:'2C',desc:'El ovocito secundario ya es haploide, aunque sus cromosomas siguen duplicados. Permanece detenido hasta la fecundación.'};
 }
 function renderCalc(){
  const x=calcState(),mount=app.querySelector('#gm-view');
  mount.innerHTML='<section class="gm-card"><div class="gm-kicker">CALCULADORA DE PLOIDÍA Y ADN</div><h2>Contá sin confundir cromosomas y cromátidas</h2><p>Elegí un número diploide y una etapa. El modelo calcula los valores por célula o producto, según corresponda.</p><div class="gm-calculator"><label>Número diploide (2n)<select id="gm-calc-n"><option value="4" '+(n2===4?'selected':'')+'>2n = 4</option><option value="6" '+(n2===6?'selected':'')+'>2n = 6</option><option value="8" '+(n2===8?'selected':'')+'>2n = 8</option><option value="10" '+(n2===10?'selected':'')+'>2n = 10</option><option value="12" '+(n2===12?'selected':'')+'>2n = 12</option><option value="46" '+(n2===46?'selected':'')+'>2n = 46 (humano)</option></select></label><label>Etapa celular<select id="gm-calc-stage"><option value="g1" '+(calc==='g1'?'selected':'')+'>G1 · antes de replicar</option><option value="s" '+(calc==='s'?'selected':'')+'>Después de fase S / metafase I</option><option value="mi1" '+(calc==='mi1'?'selected':'')+'>Después de meiosis I</option><option value="mii" '+(calc==='mii'?'selected':'')+'>Después de meiosis II</option><option value="ovo" '+(calc==='ovo'?'selected':'')+'>Ovocito secundario en metafase II</option></select></label></div><div class="gm-note"><strong>'+x.title+':</strong> '+x.desc+'</div><div class="gm-stat-big" style="margin-top:13px"><article><span>Ploidía</span><strong>'+x.pl+'</strong></article><article><span>Cromosomas</span><strong>'+x.chr+'</strong></article><article><span>Cromátidas</span><strong>'+x.chrom+'</strong></article><article><span>Moléculas de ADN</span><strong>'+x.dna+'</strong></article><article><span>Contenido ADN</span><strong>'+x.c+'</strong></article><article><span>Juego haploide</span><strong>n = '+(n2/2)+'</strong></article></div><div class="gm-warning">Regla de conteo: un cromosoma duplicado sigue contando como un cromosoma mientras sus cromátidas hermanas permanezcan unidas por el centrómero.</div></section>';
  mount.querySelector('#gm-calc-n').onchange=e=>{n2=Number(e.target.value);renderCalc();};
  mount.querySelector('#gm-calc-stage').onchange=e=>{calc=e.target.value;renderCalc();};
 }
 function renderExplain(){
  const mount=app.querySelector('#gm-view');
  mount.innerHTML='<section class="gm-card"><div class="gm-kicker">RECORRIDO CONCEPTUAL</div><h2>De una célula diploide a gametas haploides</h2><p>La meiosis comparte una lógica general, pero la producción de gametas masculinas y femeninas se organiza de manera diferente.</p><div class="gm-grid">'+EXPLICACION.map((x,i)=>'<article><div class="gm-sub">0'+(i+1)+'</div><h3>'+esc(x.h)+'</h3><p>'+esc(x.p)+'</p></article>').join('')+'</div><div class="gm-note"><strong>Conteo humano:</strong> G1: 46 cromosomas y 46 cromátidas; después de S: 46 y 92; tras meiosis I: 23 y 46 por célula; tras meiosis II: 23 y 23 por producto.</div></section>';
 }
 function renderCompare(){
  const mount=app.querySelector('#gm-view');
  const rows=[
   ['Gónada y ubicación','Testículos · túbulos seminíferos','Ovarios · folículos ováricos'],
   ['Célula germinal inicial','Espermatogonia','Ovogonia'],
   ['Inicio de meiosis','Desde la pubertad','Durante la vida fetal'],
   ['Detención meiótica','No presenta detenciones prolongadas características','Profase I avanzada desde la vida fetal; metafase II hasta la fecundación'],
   ['Continuidad','Producción sostenida desde la pubertad; algunas espermatogonias se mantienen por mitosis','Reserva limitada de ovocitos primarios; maduración cíclica'],
   ['Producto de meiosis','Cuatro espermátidas por espermatocito primario','Ovocito secundario y primer cuerpo polar; si hay fecundación, óvulo y segundo cuerpo polar'],
   ['Gametas funcionales','Cuatro espermatozoides por espermatocito primario, después de espermiogénesis','Una gameta funcional'],
   ['Citoplasma','La espermátida pierde gran parte durante espermiogénesis','Distribución muy asimétrica; el ovocito conserva casi todo'],
   ['Diferenciación final','Espermiogénesis: acrosoma, flagelo, condensación nuclear y pérdida de citoplasma','No hay proceso equivalente a la espermiogénesis'],
   ['Hormonas del material','FSH, LH y testosterona','FSH, LH, estrógenos y progesterona']
  ];
  mount.innerHTML='<section class="gm-card"><div class="gm-kicker">COMPARADOR</div><h2>Espermatogénesis vs. ovogénesis</h2><p>Comparación de la cronología, las divisiones y el rendimiento de ambas rutas.</p><div class="gm-table-wrap"><table><thead><tr><th>Característica</th><th>Espermatogénesis</th><th>Ovogénesis</th></tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,i)=>'<td>'+(i===0?'<strong>'+esc(c)+'</strong>':esc(c))+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><div class="gm-note"><strong>Clave:</strong> la meiosis es el mecanismo compartido; el momento de inicio, las detenciones y la distribución del citoplasma explican las diferencias entre ambos procesos.</div></section>';
 }
 function shuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
 function renderQuiz(){
  const mount=app.querySelector('#gm-view');
  if(qi>=quizPool.length){const pct=Math.round(score/quizPool.length*100);mount.innerHTML='<section class="gm-card gm-result"><div class="gm-kicker">DESAFÍO COMPLETADO</div><div class="score">'+score+' / '+quizPool.length+'</div><h2>'+pct+'% de respuestas correctas</h2><p>'+(pct>=85?'Muy buen dominio de meiosis y gametogénesis.':pct>=65?'Buen trabajo. Repasá las explicaciones de los errores.':'Volvé a recorrer los modelos y probá otra ronda.')+'</p><button class="gm-primary" id="gm-retry">Reintentar</button> <button id="gm-qhome">Volver a LAB</button></section>';mount.querySelector('#gm-retry').onclick=()=>{qi=0;score=0;answered=false;quizPool=shuffle(quizType==='comparaciones'?COMPARACIONES_ADN:PREGUNTAS);renderQuiz();};mount.querySelector('#gm-qhome').onclick=volver;return;}
  const q=quizPool[qi];
  mount.innerHTML='<section class="gm-card"><div class="gm-modebar"><button data-quiz-set="general" class="gm-mode '+(quizType==='general'?'active':'')+'">Repaso general · '+PREGUNTAS.length+'</button><button data-quiz-set="comparaciones" class="gm-mode '+(quizType==='comparaciones'?'active':'')+'">Comparar ADN y cromosomas · '+COMPARACIONES_ADN.length+'</button></div><div class="gm-note"><strong>Regla:</strong> compará ADN (c), ploidía (n) y número de cromosomas por separado. Salvo que la consigna diga lo contrario, compará cada célula individualmente, no sumes células distintas.</div><div class="gm-head"><div><div class="gm-kicker">AUTOEVALUACIÓN · GAMETOGÉNESIS</div><h2>Comprobá lo que entendiste</h2><p>Respondé y revisá la explicación de cada pregunta.</p></div><span class="gm-chip">PREGUNTA '+(qi+1)+' / '+quizPool.length+'</span></div><div class="gm-progress"><span style="width:'+((qi+(answered?1:0))/quizPool.length*100)+'%"></span></div><div class="gm-quiz-q">'+esc(q.q)+'</div><div class="gm-answers">'+q.o.map((x,i)=>'<button class="gm-answer" data-answer="'+i+'" '+(answered?'disabled':'')+'><span class="gm-letter">'+('ABCD'[i])+'</span><span>'+esc(x)+'</span></button>').join('')+'</div><p class="gm-feedback" id="gm-feedback">'+(answered?esc(q.e):'')+'</p><div class="gm-foot"><span>'+(answered?'Puntaje: '+score+' / '+(qi+1):'Respondé para ver tu puntaje parcial')+'</span><button class="gm-primary" id="gm-qnext" '+(!answered?'disabled':'')+'>'+(qi===quizPool.length-1?'Ver resultado':'Siguiente pregunta →')+'</button></div></section>';
  mount.querySelectorAll('[data-quiz-set]').forEach(b=>b.onclick=()=>{const next=b.dataset.quizSet;if(next===quizType)return;quizType=next;qi=0;score=0;answered=false;quizPool=shuffle(quizType==='comparaciones'?COMPARACIONES_ADN:PREGUNTAS);renderQuiz();});
   mount.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(answered)return;answered=true;const pick=Number(b.dataset.answer),ok=pick===q.a;if(ok)score++;mount.querySelectorAll('[data-answer]').forEach(x=>{x.disabled=true;if(Number(x.dataset.answer)===q.a)x.classList.add('good');});if(!ok)b.classList.add('bad');mount.querySelector('#gm-feedback').textContent=(ok?'¡Correcto! ':'No exactamente. ')+q.e;mount.querySelector('#gm-qnext').disabled=false;});
  mount.querySelector('#gm-qnext').onclick=()=>{if(!answered)return;qi++;answered=false;renderQuiz();};
 }
 function renderViewInto(main){
  main.innerHTML='<div class="gm-modebar"><button data-mode="meiosis" class="gm-mode '+(mode==='meiosis'?'active':'')+'">🧬 Meiosis</button><button data-mode="esperma" class="gm-mode '+(mode==='esperma'?'active':'')+'">♂ Espermatogénesis</button><button data-mode="ovo" class="gm-mode '+(mode==='ovo'?'active':'')+'">♀ Ovogénesis</button><button data-mode="calc" class="gm-mode '+(mode==='calc'?'active':'')+'">∑ Conteo</button></div><div id="gm-view"></div>';
  app.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{stop();mode=b.dataset.mode;render();});
  if(mode==='meiosis')renderMeiosis();else if(mode==='esperma')renderTrack('esperma');else if(mode==='ovo')renderTrack('ovo');else renderCalc();
 }
 function render(){
  stop();
  app.innerHTML='<main class="gameto"><button class="gm-back" id="gm-back">← Volver a Laboratorios</button><header class="gm-hero"><div class="gm-kicker">PARCIALITO LAB · BIOLOGÍA CELULAR Y EMBRIOLOGÍA</div><h1>Gametogénesis</h1><p>Explorá la meiosis y seguí cómo se forman las gametas masculinas y femeninas. Contá cromosomas, cromátidas y ADN en cada etapa.</p><div class="gm-tags"><span>🧬 Meiosis</span><span>♂ Espermatogénesis</span><span>♀ Ovogénesis</span><span>∑ Ploidía y ADN</span></div></header><nav class="gm-tabs"><button data-tab="vista" class="'+(tab==='vista'?'active':'')+'">Modelo interactivo</button><button data-tab="explicacion" class="'+(tab==='explicacion'?'active':'')+'">Explicación</button><button data-tab="comparador" class="'+(tab==='comparador'?'active':'')+'">Comparador</button><button data-tab="preguntas" class="'+(tab==='preguntas'?'active':'')+'">Preguntas</button></nav><div id="gm-main"></div></main>';
  app.querySelector('#gm-back').onclick=()=>{stop();volver();};
  app.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{stop();tab=b.dataset.tab;render();});
  const main=app.querySelector('#gm-main');
  if(tab==='vista')renderViewInto(main);
  else if(tab==='explicacion'){main.innerHTML='<div id="gm-view"></div>';renderExplain();}
  else if(tab==='comparador'){main.innerHTML='<div id="gm-view"></div>';renderCompare();}
  else{main.innerHTML='<div id="gm-view"></div>';qi=0;score=0;answered=false;quizType='general';quizPool=shuffle(PREGUNTAS);renderQuiz();}
 }
 render();
}