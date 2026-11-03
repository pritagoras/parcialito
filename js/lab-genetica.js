// Laboratorio de genética: primera ley de Mendel, grupos sanguíneos y herencia ligada al sexo
// (daltonismo y hemofilia). Todo el contenido (datos, textos y preguntas) está al principio
// del archivo para poder editarlo sin tocar el dibujo. Sin librerías ni imágenes externas.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rich = s => esc(s).replace(/\^(\w)/g, '<sup>$1</sup>');
const pct = n => (Math.round(n * 100) / 100).toLocaleString('es-AR');

/* ------------------------------------------------------------------ */
/* DATOS                                                                */
/* ------------------------------------------------------------------ */

const COLOR = { dom: '#3d8bff', het: '#9b6dff', rec: '#ff9a2e', verde: '#1fd6a5', rosa: '#ff4f8b', gris: '#8da2d6' };

// Caracteres de la arveja (Pisum sativum) que estudió Mendel. L = letra del alelo dominante.
const CARACTERES = [
  { id: 'semilla', nombre: 'Forma de la semilla', emoji: '🫛', L: 'R', dom: { f: 'lisa', pl: 'lisas' }, rec: { f: 'rugosa', pl: 'rugosas' } },
  { id: 'color', nombre: 'Color de la semilla', emoji: '🟡', L: 'Y', dom: { f: 'amarilla', pl: 'amarillas' }, rec: { f: 'verde', pl: 'verdes' } },
  { id: 'flor', nombre: 'Color de la flor', emoji: '🌸', L: 'P', dom: { f: 'púrpura', pl: 'púrpuras' }, rec: { f: 'blanca', pl: 'blancas' } },
  { id: 'tallo', nombre: 'Altura del tallo', emoji: '🌱', L: 'T', dom: { f: 'alta', pl: 'altas' }, rec: { f: 'enana', pl: 'enanas' } }
];

// k = cantidad de alelos dominantes del progenitor (2 = homocigota dominante, 1 = heterocigota, 0 = homocigota recesivo)
const PRESETS_MENDEL = [
  { id: 'p', et: 'P · líneas puras', k1: 2, k2: 0 },
  { id: 'f2', et: 'F1 × F1', k1: 1, k2: 1 },
  { id: 'prueba', et: 'Cruzamiento prueba', k1: 1, k2: 0 },
  { id: 'dh', et: 'Dominante puro × híbrido', k1: 2, k2: 1 }
];

const GLOSARIO = [
  ['Gen', 'Segmento de ADN que determina un carácter, por ejemplo la forma de la semilla.'],
  ['Alelo', 'Cada una de las variantes de un gen. Un individuo diploide tiene dos alelos por gen.'],
  ['Homocigota', 'Tiene los dos alelos iguales (RR o rr).'],
  ['Heterocigota', 'Tiene los dos alelos distintos (Rr).'],
  ['Genotipo', 'Combinación de alelos que tiene el individuo.'],
  ['Fenotipo', 'Característica que se observa (semilla amarilla o verde). Depende del genotipo y, a veces, del ambiente.'],
  ['Dominante', 'Alelo que se expresa también en el heterocigota. Se escribe con mayúscula.'],
  ['Recesivo', 'Alelo que solo se expresa en homocigosis. Se escribe con minúscula.']
];

// Sistema ABO (alelos A, B e i) y Rh (alelos D y d)
const ABO_G = [['A', 'A'], ['A', 'i'], ['B', 'B'], ['B', 'i'], ['A', 'B'], ['i', 'i']];
const RH_G = [['D', 'D'], ['D', 'd'], ['d', 'd']];
const COLOR_ABO = { A: '#3d8bff', B: '#1fd6a5', AB: '#9b6dff', O: '#ff9a2e' };

const GRUPOS = [
  { g: 'A', geno: 'I<sup>A</sup>I<sup>A</sup> o I<sup>A</sup>i', ant: 'A', anti: 'anti-B', dona: 'A, AB', recibe: 'A, O' },
  { g: 'B', geno: 'I<sup>B</sup>I<sup>B</sup> o I<sup>B</sup>i', ant: 'B', anti: 'anti-A', dona: 'B, AB', recibe: 'B, O' },
  { g: 'AB', geno: 'I<sup>A</sup>I<sup>B</sup>', ant: 'A y B', anti: 'ninguno', dona: 'AB', recibe: 'A, B, AB, O' },
  { g: 'O', geno: 'ii', ant: 'ninguno', anti: 'anti-A y anti-B', dona: 'A, B, AB, O', recibe: 'O' }
];

// Herencia ligada al X (alelo 'N' = normal, 'a' = alterado; se muestra con la letra L)
const CONDICIONES = {
  dalt: {
    nombre: 'Daltonismo', emoji: '👁️', L: 'D',
    gen: 'Los genes de las opsinas de los conos sensibles al rojo y al verde están en el cromosoma X.',
    desc: 'Dificultad para distinguir los colores rojo y verde (la forma más frecuente). No compromete la salud general.',
    frec: 'Afecta a muchos más varones que mujeres: se estima cerca de 8 % de los varones y 0,5 % de las mujeres de ascendencia europea.'
  },
  hemo: {
    nombre: 'Hemofilia', emoji: '🩸', L: 'H',
    gen: 'Hemofilia A: falta o falla el factor VIII de la coagulación (la más frecuente). Hemofilia B: factor IX. Ambos genes están en el cromosoma X.',
    desc: 'La sangre coagula mal: los sangrados duran más de lo normal y pueden ser espontáneos, sobre todo en articulaciones y músculos.',
    frec: 'Afecta casi siempre a varones. Una mujer con hemofilia es muy poco frecuente: lo habitual es que necesite un padre afectado y una madre portadora o afectada.'
  }
};
const MADRES = [['N', 'N'], ['N', 'a'], ['a', 'a']];
const PADRES = [['N', 'Y'], ['a', 'Y']];

const PREGUNTAS = [
  // --- Mendel: primera ley, color de semillas y deducción de F1/parentales
  { t: 'mendel', q: "Se cruzan dos líneas puras de arvejas: una produce semillas amarillas (YY) y la otra semillas verdes (yy). ¿Cuál será el genotipo de la F1?", o: ["100 % YY","100 % Yy","50 % YY y 50 % yy","100 % yy"], ok: 1, exp: "La línea amarilla solo forma gametas Y y la verde solo forma gametas y. Todos los descendientes reciben Y de un progenitor e y del otro: son Yy." },
  { t: 'mendel', q: "En el cruce YY × yy, ¿qué fenotipo tendrá la primera generación filial?", o: ["100 % semillas verdes","75 % amarillas y 25 % verdes","100 % semillas amarillas","50 % amarillas y 50 % verdes"], ok: 2, exp: "Todos los descendientes son Yy. Como Y domina sobre y, todas las semillas de la F1 son amarillas." },
  { t: 'mendel', q: "Una F1 está formada por individuos 100 % heterocigotas (Yy). Si los progenitores eran líneas puras, ¿qué genotipos tenían?", o: ["YY × yy","Yy × Yy","YY × YY","yy × yy"], ok: 0, exp: "Para que todos los descendientes sean Yy y los progenitores sean líneas puras, uno debe aportar siempre Y (YY) y el otro siempre y (yy)." },
  { t: 'mendel', q: "Se sabe que uno de los progenitores era verde (yy) y que toda la F1 resultó amarilla. ¿Qué genotipo debía tener el progenitor amarillo?", o: ["Yy","yy","YY","No puede determinarse aunque toda la F1 sea amarilla"], ok: 2, exp: "Si el progenitor amarillo fuera Yy, al cruzarlo con yy aparecerían descendientes verdes. Para que toda la F1 sea amarilla, debe ser YY." },
  { t: 'mendel', q: "Una planta amarilla de genotipo desconocido se cruza con una planta verde (yy). La descendencia resulta mitad amarilla y mitad verde. ¿Cuál era el genotipo de la planta amarilla?", o: ["YY","Yy","yy","YY o yy"], ok: 1, exp: "La planta verde aporta siempre y. Para obtener mitad Yy (amarillas) y mitad yy (verdes), la planta amarilla debe producir gametas Y e y: su genotipo era Yy." },
  { t: 'mendel', q: "Se cruzan dos líneas puras de semillas amarillas. ¿Qué genotipo tendrá la F1?", o: ["100 % Yy","100 % yy","100 % YY","50 % YY y 50 % Yy"], ok: 2, exp: "Si ambas líneas son puras y amarillas, sus genotipos son YY. Cada progenitor aporta Y, por lo que toda la descendencia es YY." },
  { t: 'mendel', q: "Se cruzan dos líneas puras de semillas verdes (yy × yy). ¿Cómo será la F1?", o: ["100 % amarilla Yy","100 % verde yy","50 % amarilla y 50 % verde","100 % amarilla YY"], ok: 1, exp: "Los dos progenitores solo pueden producir gametas y. Todos los descendientes serán yy y tendrán semillas verdes." },
  { t: 'mendel', q: "Al cruzar dos líneas puras de distinto color, la F1 resulta completamente amarilla. ¿Qué alelo es dominante?", o: ["El alelo para semillas verdes","Ambos alelos son codominantes","No se puede saber","El alelo para semillas amarillas"], ok: 3, exp: "En una F1 uniforme de un cruce entre líneas puras contrastantes, el fenotipo que se expresa en los heterocigotas corresponde al alelo dominante: Y, amarillo." },
  { t: 'mendel', q: "El análisis genético de una F1 revela que todos sus individuos son Yy. ¿Qué combinación de parentales puros explica ese resultado?", o: ["YY × yy","YY × YY","Yy × Yy","yy × yy"], ok: 0, exp: "Un parental puro YY aporta exclusivamente Y y uno puro yy aporta exclusivamente y. Por eso todos los descendientes son Yy." },
  { t: 'mendel', q: "Una F1 presenta únicamente semillas amarillas, pero no se analizaron sus genotipos ni se conoce si los parentales eran líneas puras. ¿Qué se puede concluir?", o: ["Que todos los individuos son necesariamente YY","Que todos son necesariamente Yy","Que expresan el fenotipo dominante, pero no alcanza para conocer todos sus genotipos","Que el alelo verde desapareció"], ok: 2, exp: "El color amarillo puede corresponder a YY o a Yy. Observar solo el fenotipo no permite asegurar el genotipo ni reconstruir de manera única los parentales." },
  { t: 'mendel', q: "¿Qué genotipos pueden producir el fenotipo de semillas amarillas cuando Y es dominante?", o: ["Solo YY","YY o Yy","Solo Yy","YY o yy"], ok: 1, exp: "El alelo Y se expresa tanto en homocigosis (YY) como en heterocigosis (Yy)." },
  { t: 'mendel', q: "Si el color verde es recesivo, ¿qué genotipo debe tener una planta con semillas verdes?", o: ["YY","Yy","YY o Yy","yy"], ok: 3, exp: "El fenotipo recesivo solo se manifiesta cuando no hay ningún alelo dominante: el individuo debe ser yy." },
  { t: 'mendel', q: "¿Qué tipo de gametas puede producir una línea pura amarilla (YY)?", o: ["Solo gametas Y","Gametas Y e y en igual proporción","Solo gametas y","Gametas YY"], ok: 0, exp: "Un individuo YY tiene dos alelos iguales. Al formarse las gametas, cada una recibe un solo alelo y todas llevan Y." },
  { t: 'mendel', q: "¿Qué alelo lleva cada gameta de una línea pura verde (yy)?", o: ["Y","Yy","y","YY"], ok: 2, exp: "El progenitor yy solo puede aportar el alelo y. Cada gameta contiene un único alelo para ese gen." },
  { t: 'mendel', q: "En un cruce entre YY y yy, ¿qué combinación genética aparece en cada casilla del cuadro de Punnett?", o: ["YY","Yy","yy","Yy o yy"], ok: 1, exp: "Todas las combinaciones unen una gameta Y con una gameta y. Por eso las cuatro casillas contienen Yy." },
  { t: 'mendel', q: "En la F1 del cruce YY × yy, ¿qué porcentaje de descendientes tendrá semillas verdes?", o: ["25 %","50 %","75 %","0 %"], ok: 3, exp: "No aparece ningún genotipo yy en esa F1: todos son Yy y expresan el color amarillo. El alelo verde permanece presente, pero no se manifiesta." },
  { t: 'mendel', q: "¿Por qué el color verde no aparece en la F1 del cruce YY × yy?", o: ["Porque el alelo verde se elimina durante la fecundación","Porque el alelo verde deja de existir","Porque Y domina sobre y en los heterocigotas Yy","Porque las gametas verdes no participan"], ok: 2, exp: "El alelo recesivo y no desaparece: queda en el genotipo Yy, pero el alelo dominante Y determina el fenotipo amarillo." },
  { t: 'mendel', q: "¿Qué representa la F1 en un experimento de cruzamiento?", o: ["La generación de progenitores originales","La primera generación de descendientes obtenida al cruzar los parentales","La generación formada exclusivamente por individuos recesivos","La segunda generación de descendientes"], ok: 1, exp: "F1 significa primera generación filial: es la descendencia directa del cruce entre los parentales (P)." },
  { t: 'mendel', q: "¿Qué establece la ley de uniformidad de la F1, en el caso de dos líneas puras que difieren en un carácter?", o: ["La F1 presenta siempre cuatro fenotipos","La F1 es uniforme y expresa el carácter dominante","La F1 es mitad dominante y mitad recesiva","Todos los descendientes son homocigotas recesivos"], ok: 1, exp: "Al cruzar dos líneas puras que difieren en un carácter, todos los individuos de la F1 son iguales entre sí y heterocigotas; expresan el rasgo dominante." },
  { t: 'mendel', q: "¿Qué condición es fundamental para aplicar la ley de uniformidad en el cruce clásico de Mendel?", o: ["Que ambos progenitores sean heterocigotas","Que se estudien dos genes a la vez","Que los progenitores sean líneas puras y difieran en el carácter estudiado","Que la F1 se cruce consigo misma"], ok: 2, exp: "El cruce clásico se realiza entre dos líneas puras (homocigotas) que presentan variantes opuestas del mismo carácter." },
  { t: 'mendel', q: "Una planta amarilla se cruza con una verde (yy) y aparece al menos un descendiente verde. ¿Qué genotipo tenía la planta amarilla?", o: ["YY","Yy","yy","No existe ningún genotipo posible"], ok: 1, exp: "Para que nazca un descendiente yy, ambos progenitores deben aportar y. La planta amarilla debe tener un alelo Y y uno y: Yy." },
  { t: 'mendel', q: "¿Puede aparecer una semilla verde en la F1 de un cruce entre líneas puras YY × yy?", o: ["Sí, en el 25 %","Sí, en el 50 %","No, porque todos los descendientes son Yy","Sí, en el 75 %"], ok: 2, exp: "No. El cruce produce exclusivamente individuos Yy. El fenotipo verde requiere el genotipo yy." },
  { t: 'mendel', q: "Dos líneas puras producen una F1 en la que todas las semillas son verdes. Si el color verde es recesivo, ¿qué genotipo tienen los dos parentales?", o: ["YY × yy","Yy × Yy","YY × YY","yy × yy"], ok: 3, exp: "Para que toda la F1 sea verde, todos los descendientes deben ser yy. Si ambos parentales son líneas puras, los dos son yy." },
  { t: 'mendel', q: "Si todos los individuos de una F1 son Yy, ¿qué alelos recibió cada descendiente de sus progenitores?", o: ["Y de ambos","y de ambos","Y de uno e y del otro","Dos alelos Y y uno y"], ok: 2, exp: "Cada descendiente recibe un alelo de cada progenitor. En este caso, uno aportó Y y el otro aportó y." },
  { t: 'mendel', q: "¿Qué cruce permite obtener una F1 completamente heterocigota Yy cuando se usan parentales homocigotas?", o: ["YY × yy","YY × YY","yy × yy","Yy × Yy"], ok: 0, exp: "El cruce de homocigota dominante con homocigota recesivo produce descendientes Yy en el 100 % de los casos." },
  { t: 'mendel', q: "Una F1 de semillas amarillas tiene genotipo Yy en todos sus individuos. ¿Qué fenotipo expresa el alelo recesivo en esa generación?", o: ["Verde, porque y está presente","No se expresa; queda enmascarado por Y","Amarillo, porque y es dominante","No se puede determinar"], ok: 1, exp: "Aunque todos llevan el alelo y, el fenotipo es amarillo porque Y es dominante. La presencia de un alelo recesivo no implica que se exprese." },
  { t: 'mendel', q: "Un estudiante afirma que YY × yy produce una F1 con 75 % de semillas amarillas y 25 % verdes. ¿Cuál es la corrección?", o: ["La F1 será 50 % amarilla y 50 % verde","La F1 será 100 % verde","La F1 será 75 % verde y 25 % amarilla","La F1 será 100 % amarilla y genéticamente Yy"], ok: 3, exp: "El resultado 3:1 corresponde al fenotipo de una F2 obtenida al cruzar dos heterocigotas Yy × Yy. En YY × yy, toda la F1 es Yy y amarilla." },
  { t: 'mendel', q: "¿Qué información hace posible reconstruir con mayor seguridad los parentales a partir de una F1?", o: ["Solo saber que la F1 es amarilla","Saber que la F1 es 100 % Yy y que los parentales eran líneas puras","Conocer únicamente el número de semillas","Saber que al menos un parental era amarillo"], ok: 1, exp: "La combinación de uniformidad genotípica (todos Yy) y parentales de línea pura permite inferir que el cruce fue YY × yy." },
  { t: 'mendel', q: "Una línea pura amarilla se cruza con una línea pura verde. ¿Qué proporción de la F1 será heterocigota?", o: ["0 %","25 %","50 %","100 %"], ok: 3, exp: "Todos los descendientes reciben Y del parental amarillo YY e y del verde yy. Por lo tanto, el 100 % es heterocigota Yy." },
  { t: 'mendel', q: "¿Cuál de estas afirmaciones diferencia correctamente fenotipo y genotipo en la F1 de YY × yy?", o: ["Fenotipo: Yy; genotipo: amarillo","Fenotipo: amarillo; genotipo: Yy","Fenotipo: verde; genotipo: yy","Fenotipo y genotipo significan lo mismo"], ok: 1, exp: "El genotipo es la combinación de alelos (Yy); el fenotipo es el rasgo observable (semillas amarillas)." },
  { t: 'mendel', q: "Un informe indica que la F1 fue 100 % amarilla y 100 % Yy. ¿Qué conclusión es compatible con el modelo mendeliano de líneas puras?", o: ["Un parental YY y el otro yy","Ambos parentales yy","Ambos parentales YY","Un parental Yy y el otro yy"], ok: 0, exp: "El cruce entre líneas puras YY y yy explica que toda la F1 sea heterocigota Yy y exprese el color amarillo." },
  // --- Grupos sanguíneos
  { t: 'abo', q: '¿Cuántos alelos distintos existen en la población para el grupo sanguíneo ABO?', o: ['Dos: A y B', 'Tres: I^A, I^B e i', 'Cuatro: A, B, AB y O', 'Uno solo'], ok: 1, exp: 'Es un caso de alelismo múltiple: en la población hay tres alelos, pero cada persona tiene solo dos.' },
  { t: 'abo', q: 'Una persona con genotipo I^AI^B tiene grupo AB porque los alelos I^A e I^B son…', o: ['recesivos entre sí', 'codominantes', 'letales en conjunto', 'ligados al sexo'], ok: 1, exp: 'En la codominancia los dos alelos se expresan a la vez: el glóbulo rojo lleva antígenos A y B.' },
  { t: 'abo', q: 'Una persona del grupo A puede tener el genotipo…', o: ['solo I^AI^A', 'I^AI^A o I^Ai', 'I^AI^B o I^Ai', 'solo ii'], ok: 1, exp: 'El alelo i es recesivo respecto de I^A, así que tanto I^AI^A como I^Ai dan grupo A.' },
  { t: 'abo', q: 'Una madre del grupo A (I^Ai) y un padre del grupo B (I^Bi) pueden tener hijos de…', o: ['solo grupo AB', 'grupo A o B solamente', 'grupo O solamente', 'los cuatro grupos: A, B, AB y O'], ok: 3, exp: 'Las gametas son I^A o i de la madre e I^B o i del padre. Se combinan en I^AI^B (AB), I^Ai (A), I^Bi (B) y ii (O), 25 % cada uno.' },
  { t: 'abo', q: 'Si los dos progenitores son del grupo O, ¿de qué grupo serán sus hijos?', o: ['Del grupo A o B', 'Solo del grupo O', 'Del grupo AB', 'De cualquier grupo'], ok: 1, exp: 'Ambos son ii, así que solo pueden dar gametas con i. Todos los hijos son ii.' },
  { t: 'abo', q: '¿Qué tiene una persona del grupo AB?', o: ['Antígenos A y B en los glóbulos rojos y ningún anticuerpo anti-A ni anti-B en el plasma', 'Ningún antígeno y los dos anticuerpos', 'Antígeno A y anticuerpo anti-B', 'Antígeno B y anticuerpo anti-B'], ok: 0, exp: 'No tiene anticuerpos contra A ni contra B porque reconocería como propios los dos antígenos. Por eso recibe glóbulos rojos de cualquier grupo ABO.' },
  { t: 'abo', q: 'Una madre Rh− (dd) y un padre Rh+ heterocigota (Dd) tienen un hijo. ¿Qué probabilidad hay de que sea Rh−?', o: ['0 %', '25 %', '50 %', '100 %'], ok: 2, exp: 'La madre solo da d. El padre da D o d con igual probabilidad: mitad Dd (Rh+) y mitad dd (Rh−).' },
  { t: 'abo', q: '¿Qué grupo ABO se considera donante universal de glóbulos rojos?', o: ['AB', 'A', 'O', 'B'], ok: 2, exp: 'Los glóbulos rojos del grupo O no tienen antígenos A ni B, por eso no los atacan los anticuerpos del receptor.' },
  // --- Herencia ligada al sexo
  { t: 'sexo', q: '¿En qué cromosoma están los genes del daltonismo y de la hemofilia?', o: ['En un autosoma', 'En el cromosoma Y', 'En el cromosoma X', 'En el ADN mitocondrial'], ok: 2, exp: 'Por eso se llaman herencias ligadas al X. El cromosoma Y no tiene alelos para estos genes.' },
  { t: 'sexo', q: '¿Por qué los varones se ven afectados más a menudo por una enfermedad recesiva ligada al X?', o: ['Porque el Y transmite la enfermedad', 'Porque tienen un solo X y alcanza con un alelo recesivo para expresarlo', 'Porque las mujeres no tienen X', 'Porque los varones tienen dos X'], ok: 1, exp: 'Los varones son hemicigotas (XY): no hay un segundo alelo que compense. Las mujeres necesitan dos copias recesivas.' },
  { t: 'sexo', q: 'Una mujer portadora (X^DX^d) tiene hijos con un varón de visión normal (X^DY). ¿Qué proporción de sus hijos varones será daltónica?', o: ['0 %', '25 %', '100 %', '50 %'], ok: 3, exp: 'Los hijos varones reciben el Y del padre y uno de los dos X de la madre. Mitad X^DY (sano) y mitad X^dY (daltónico). Sobre el total de hijos, es el 25 %.' },
  { t: 'sexo', q: 'Un varón daltónico (X^dY) tiene hijos con una mujer X^DX^D. ¿Cómo serán?', o: ['Hijas portadoras e hijos sanos', 'Hijas daltónicas e hijos sanos', 'Hijos varones daltónicos', 'Todos daltónicos'], ok: 0, exp: 'Les da el X^d a todas sus hijas (portadoras, X^DX^d) y el Y a sus hijos varones, que reciben el X^D de la madre y son sanos.' },
  { t: 'sexo', q: 'Un varón con hemofilia recibió el alelo alterado de…', o: ['su padre', 'su madre, que es portadora o está afectada', 'cualquiera de los dos por igual', 'ninguno: surge siempre por mutación nueva'], ok: 1, exp: 'Del padre recibió el Y. El único X que tiene viene de la madre. (Una mutación nueva es posible, pero no es lo habitual.)' },
  { t: 'sexo', q: '¿Qué se necesita para que una mujer tenga una enfermedad recesiva ligada al X?', o: ['Un solo alelo alterado', 'Dos alelos alterados: uno de cada progenitor', 'Que su padre sea portador y su madre sana', 'Que tenga un cromosoma Y'], ok: 1, exp: 'Debe ser X^aX^a: el padre tiene que estar afectado y la madre ser portadora o estar afectada.' },
  { t: 'sexo', q: 'Una mujer portadora (X^HX^h) y un varón hemofílico (X^hY) tienen un hijo. ¿Qué probabilidad hay de que tenga hemofilia, sin importar su sexo?', o: ['25 %', '75 %', '0 %', '50 %'], ok: 3, exp: 'Los cuatro genotipos posibles son X^HX^h (hija portadora), X^hX^h (hija afectada), X^HY (hijo sano) y X^hY (hijo afectado), 25 % cada uno. Hay dos afectados de cuatro.' },
  { t: 'sexo', q: '¿Qué proteína falta en la hemofilia A y cuál en la hemofilia B?', o: ['Hemofilia A: factor IX; hemofilia B: factor VIII', 'Hemofilia A: factor VIII; hemofilia B: factor IX', 'En las dos falta la hemoglobina', 'En las dos falta el fibrinógeno'], ok: 1, exp: 'La A (la más frecuente) es una deficiencia del factor VIII y la B del factor IX. Los dos genes están en el X.' },
  { t: 'sexo', q: '¿Puede un varón transmitir un alelo ligado al X a su hijo varón?', o: ['Sí, siempre', 'Sí, solo si está afectado', 'No: a sus hijos varones les da el cromosoma Y', 'Sí, si su pareja es portadora'], ok: 2, exp: 'Un varón le da el Y a sus hijos varones y el X a sus hijas. Por eso no hay transmisión de padre a hijo varón en la herencia ligada al X.' }
];
const TEMAS_Q = [['todas', 'Todo el laboratorio'], ['mendel', 'Mendel'], ['abo', 'Grupos sanguíneos'], ['sexo', 'Daltonismo y hemofilia']];

/* ------------------------------------------------------------------ */
/* CÁLCULO                                                              */
/* ------------------------------------------------------------------ */

const RANGO = { A: 0, B: 1, i: 2, D: 0, d: 1, N: 0, a: 1 };
const ordenar = (a, b) => (RANGO[a] <= RANGO[b] ? [a, b] : [b, a]);
const esMay = x => x === x.toUpperCase();
const ordenarM = (a, b) => (!esMay(a) && esMay(b) ? [b, a] : [a, b]);
// Cuadro 2×2: filas = gametas del progenitor 1, columnas = gametas del progenitor 2 (orden fila-columna)
function punnett(g1, g2, orden) { const cel = []; g1.forEach(a => g2.forEach(b => cel.push(orden(a, b)))); return cel; }

const gh = a => (a === 'A' || a === 'B' ? `I<sup>${a}</sup>` : a); // alelo ABO a HTML
const fenABO = p => { const A = p.includes('A'), B = p.includes('B'); return A && B ? 'AB' : A ? 'A' : B ? 'B' : 'O'; };
const fenRh = p => (p.includes('D') ? '+' : '−');

/* ------------------------------------------------------------------ */
/* ESTILOS                                                              */
/* ------------------------------------------------------------------ */

function inyectarEstilos() {
  if (document.getElementById('gen-lab-css')) return;
  const st = document.createElement('style');
  st.id = 'gen-lab-css';
  st.textContent = `
.gen{box-sizing:border-box;max-width:1240px;min-height:100dvh;margin:0 auto;padding:clamp(14px,3vw,34px);color:#e3ebff;font-family:var(--fuente,Inter,system-ui,sans-serif);background:radial-gradient(60rem 28rem at 8% -8rem,#17316e 0,transparent 65%),radial-gradient(44rem 24rem at 100% 0,#33206b 0,transparent 62%),#040a1f;box-shadow:0 0 0 100vmax #040a1f;clip-path:inset(0 -100vmax)}
.gen *{box-sizing:border-box}
.gen sup{font-size:.68em;line-height:0}
.gen-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gen-back{border:1px solid #2b477a;border-radius:10px;padding:9px 13px;background:#0b1b3b;color:#c8d8fa;font:inherit;font-size:.82rem;cursor:pointer}
.gen-back:hover{border-color:#6695ee}
.gen-kicker{margin-top:20px;color:#84b1ff;font-size:.7rem;letter-spacing:.16em;font-weight:800}
.gen-head h1{font-size:clamp(1.9rem,5vw,3rem);line-height:1.1;letter-spacing:-.03em;margin:8px 0}
.gen-head p{margin:0;max-width:62ch;color:#b6c8f4;line-height:1.65}
.gen-tabs{display:flex;gap:8px;margin:22px 0 18px;padding:6px;border:1px solid #25438c;border-radius:18px;background:rgba(8,20,54,.9);overflow-x:auto}
.gen-tabs button{flex:1 0 auto;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid transparent;border-radius:13px;padding:11px 14px;background:transparent;color:#a9c1f2;font:inherit;font-size:.86rem;font-weight:650;white-space:nowrap;cursor:pointer}
.gen-tabs button:hover{color:#fff}
.gen-tabs button.on{background:linear-gradient(135deg,#3f66ff,#2f4de6);color:#fff;box-shadow:0 0 18px rgba(63,102,255,.45)}
.gen-grid{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:16px;align-items:start}
.gen-card{min-width:0;border:1px solid #25438c;border-radius:18px;padding:clamp(15px,2.4vw,22px);background:rgba(8,20,54,.9)}
.gen-card h2{margin:0 0 4px;font-size:1.1rem}
.gen-card h3{margin:16px 0 8px;font-size:.78rem;letter-spacing:.1em;color:#84b1ff;font-weight:800}
.gen-card p{margin:6px 0;color:#c6d5f7;line-height:1.65;font-size:.9rem}
.gen-card b,.gen-card strong{color:#fff}
.gen-stack{display:grid;gap:16px;min-width:0}
.gen-chips{display:flex;flex-wrap:wrap;gap:7px}
.gen-chip{display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid #2b477a;border-radius:11px;padding:8px 11px;background:#0b1b3b;color:#dbe7ff;font:inherit;font-size:.86rem;font-weight:700;cursor:pointer;text-align:left}
.gen-chip small{font-size:.7rem;font-weight:500;color:#9db6e8}
.gen-chip:hover{border-color:#6695ee}
.gen-chip.on{border-color:#6f8dff;background:linear-gradient(135deg,#243f9b,#1d2f78);box-shadow:0 0 14px rgba(63,102,255,.4)}
.gen-lbl{margin:14px 0 7px;font-size:.74rem;letter-spacing:.1em;font-weight:800;color:#84b1ff}
.gen-lbl:first-child{margin-top:0}
.gen-pun{width:100%;max-width:420px;border-collapse:separate;border-spacing:6px;table-layout:fixed;margin:4px auto 0}
.gen-pun th,.gen-pun td{border-radius:12px;text-align:center;vertical-align:middle;padding:0}
.gen-pun-corner{color:#6f89c4;font-size:1.1rem;height:46px}
.gen-pun-gam{height:46px;border:1px solid #2b477a;background:#0b1b3b;font-size:1.05rem;font-weight:800;color:#fff}
.gen-pun td{height:84px;border:1px solid transparent;font-size:1.15rem;font-weight:800;color:#fff}
.gen-pun td small{display:block;margin-top:5px;font-size:.68rem;font-weight:600;opacity:.92}
.gen-leyenda{margin:10px 0 0;text-align:center;font-size:.78rem;color:#9db6e8}
.gen-bars{display:grid;gap:8px;margin-top:6px}
.gen-bar{display:grid;grid-template-columns:minmax(78px,32%) 1fr 62px;align-items:center;gap:10px;font-size:.84rem}
.gen-bar-t{height:11px;border-radius:99px;background:#122253;overflow:hidden}
.gen-bar-t i{display:block;height:100%;border-radius:99px}
.gen-bar b{text-align:right}
.gen-gens{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:6px}
.gen-gens>div{border:1px solid #27458f;border-radius:14px;padding:12px;background:#09152f}
.gen-gens .t{font-size:.7rem;letter-spacing:.1em;font-weight:800;color:#84b1ff}
.gen-gens .g{margin:5px 0 3px;font-size:1.35rem;font-weight:800;color:#fff}
.gen-gens .f{font-size:.82rem;color:#c6d5f7}
.gen-arrow{align-self:center;text-align:center;color:#6f89c4;font-size:1.4rem}
.gen-nota{margin-top:12px;padding:12px 14px;border:1px solid #3a4f95;border-left:4px solid #9b6dff;border-radius:12px;background:#0b1636;font-size:.85rem;line-height:1.6;color:#c6d5f7}
.gen-clave{display:flex;align-items:flex-start;gap:12px;padding:13px 16px;border:1px solid #33559f;border-radius:16px;background:linear-gradient(110deg,#102447,#0c1634)}
.gen-clave i{font-style:normal;font-size:1.3rem}
.gen-clave p{margin:0;color:#dbe7ff;font-size:.9rem;line-height:1.6}
.gen-tabla{width:100%;border-collapse:collapse;font-size:.84rem}
.gen-tabla th,.gen-tabla td{padding:9px 10px;border-bottom:1px solid #1d3570;text-align:left;vertical-align:top}
.gen-tabla th{font-size:.7rem;letter-spacing:.08em;color:#84b1ff}
.gen-scroll{overflow-x:auto}
.gen-glos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.gen-glos>div{border:1px solid #27458f;border-radius:12px;padding:10px 12px;background:#09152f;font-size:.83rem;line-height:1.55;color:#c6d5f7}
.gen-glos b{display:block;margin-bottom:2px;color:#9bd0ff}
.gen-reglas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.gen-reglas>div{border:1px solid #27458f;border-radius:14px;padding:12px 14px;background:#09152f}
.gen-reglas b{display:block;color:#ffc17e;margin-bottom:4px;font-size:.88rem}
.gen-reglas span{font-size:.83rem;line-height:1.55;color:#c6d5f7}
.gen-pedi>svg{display:block;width:100%;height:auto;max-width:560px;margin:0 auto}
.gen-leg{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:8px;font-size:.78rem;color:#b6c8f4}
.gen-leg span{display:inline-flex;align-items:center;gap:6px}
.gen-chr{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.gen-chr svg{flex:0 0 auto;width:150px;height:auto}
.gen-chr p{flex:1 1 220px}
.gen-q{max-width:860px;margin:0 auto}
.gen-q-top{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#91aad5;font-size:.8rem;margin-bottom:10px}
.gen-prog{height:5px;background:#1a2c4c;border-radius:8px;overflow:hidden;margin-bottom:14px}
.gen-prog i{display:block;height:100%;background:linear-gradient(90deg,#5c8cff,#4ee0c1)}
.gen-q h2{font-size:clamp(1.05rem,2.6vw,1.4rem);line-height:1.5;margin:6px 0 16px}
.gen-op{display:grid;gap:9px}
.gen-op button{display:flex;align-items:center;gap:12px;text-align:left;border:1px solid #2a4067;border-radius:12px;padding:12px;background:#0c1b37;color:#d9e6ff;font:inherit;font-size:.9rem;line-height:1.5;cursor:pointer}
.gen-op button b{display:grid;place-items:center;flex:0 0 30px;height:30px;border-radius:8px;background:#1b3157;color:#a9caff}
.gen-op button:hover:not(:disabled){border-color:#6695ee}
.gen-op button:disabled{cursor:default}
.gen-op button.ok{border-color:#35b891;background:#10352f}
.gen-op button.no{border-color:#d55b85;background:#351a2b}
.gen-fb{min-height:52px;margin:14px 0 4px;font-size:.88rem;line-height:1.6;color:#c6d5f7}
.gen-act{border:1px solid #5187ee;border-radius:11px;padding:11px 16px;background:linear-gradient(135deg,#2869df,#3446b2);color:#fff;font:inherit;font-size:.86rem;font-weight:750;cursor:pointer}
.gen-act:disabled{opacity:.4;cursor:default}
.gen-act.sec{background:#0b1b3b;border-color:#2b477a;color:#c8d8fa}
.gen-temas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:16px 0}
.gen-temas button{display:flex;flex-direction:column;gap:5px;text-align:left;border:1px solid #2d4d7d;border-radius:14px;padding:16px;background:#0d1e3c;color:#eef4ff;font:inherit;cursor:pointer}
.gen-temas button:hover{border-color:#6695ee}
.gen-temas span{font-size:.78rem;color:#a8bddf}
.gen-res{text-align:center}
.gen-boceto{margin:16px 0 4px;padding:14px;border:1px solid #38548c;border-radius:15px;background:linear-gradient(135deg,rgba(22,44,83,.82),rgba(9,21,47,.96))}
.gen-boceto-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
.gen-boceto-head strong{display:block;color:#fff;font-size:.88rem}
.gen-boceto-head small{display:block;margin-top:3px;color:#9db6e8;font-size:.72rem;line-height:1.4}
.gen-boceto-grid{display:grid;grid-template-columns:minmax(82px,.8fr) repeat(2,minmax(0,1fr));gap:6px;max-width:520px;margin:8px auto 0}
.gen-boceto-corner{display:grid;place-items:center;color:#7189bd;font-size:1.15rem;font-weight:800}
.gen-boceto-item{display:grid;gap:4px;min-width:0;padding:7px;border:1px solid #294575;border-radius:10px;background:#09152f}
.gen-boceto-item span{font-size:.64rem;line-height:1.2;color:#9db6e8}
.gen-boceto-item input{width:100%;min-width:0;padding:8px 4px;border:1px dashed #5577b0;border-radius:7px;background:#0d1e3c;color:#fff;text-align:center;font:inherit;font-size:1rem;font-weight:800;outline:none}
.gen-boceto-item input:focus{border-color:#8db7ff;box-shadow:0 0 0 2px rgba(141,183,255,.16)}
.gen-boceto-hint{margin:10px 0 0!important;color:#8fa9d6!important;font-size:.72rem!important;line-height:1.45!important}
@media(max-width:620px){.gen-boceto{padding:10px}.gen-boceto-grid{grid-template-columns:minmax(70px,.78fr) repeat(2,minmax(0,1fr));gap:5px}.gen-boceto-item{padding:6px 4px}.gen-boceto-item span{font-size:.59rem}}
.gen-res h2{font-size:2.6rem;margin:10px 0}
.gen button:focus-visible{outline:2px solid #9bd0ff;outline-offset:2px}
@media(max-width:860px){.gen-grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:620px){.gen{padding:12px 11px 28px}.gen-gens,.gen-glos,.gen-reglas,.gen-temas{grid-template-columns:1fr}.gen-gens{gap:8px}.gen-arrow{transform:rotate(90deg)}.gen-bar{grid-template-columns:minmax(70px,34%) 1fr 56px;gap:8px}.gen-tabs button{padding:10px 12px;font-size:.8rem}}
@media(prefers-reduced-motion:reduce){.gen *{transition:none!important;animation:none!important}}
`;
  document.head.appendChild(st);
}

/* ------------------------------------------------------------------ */
/* COMPONENTES                                                          */
/* ------------------------------------------------------------------ */

function tablaPunnett(filas, cols, cel, fmt, clase) {
  return `<table class="gen-pun"><caption class="gen-sr">Cuadro de Punnett</caption>
    <thead><tr><th class="gen-pun-corner" scope="col">×</th>${cols.map(c => `<th scope="col" class="gen-pun-gam">${c}</th>`).join('')}</tr></thead>
    <tbody>${filas.map((f, i) => `<tr><th scope="row" class="gen-pun-gam">${f}</th>${[0, 1].map(j => { const c = cel[i * 2 + j]; return `<td style="background:${clase(c)}">${fmt(c)}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
}

function barras(items) {
  return `<div class="gen-bars">${items.filter(x => x.n > 0).map(x => `<div class="gen-bar"><span>${x.etq}</span><span class="gen-bar-t"><i style="width:${x.n / x.total * 100}%;background:${x.color}"></i></span><b>${pct(x.n / x.total * 100)} %</b></div>`).join('')}</div>`;
}

const clave = txt => `<div class="gen-clave"><i aria-hidden="true">💡</i><p><b>Dato clave:</b> ${txt}</p></div>`;

// Genotipo ligado al X en HTML: ['N','a'] con letra L -> X<sup>D</sup>X<sup>d</sup>
function xh(al, L) { return al.map(a => (a === 'Y' ? 'Y' : `X<sup>${a === 'N' ? L : L.toLowerCase()}</sup>`)).join(''); }
// Lo mismo en SVG (con tspan para el superíndice)
function xs(al, L, x, y, size = 15) {
  let sub = false, out = '';
  al.forEach(a => {
    const dy = sub ? ' dy="5"' : '';
    if (a === 'Y') { out += `<tspan${dy}>Y</tspan>`; sub = false; }
    else { out += `<tspan${dy}>X</tspan><tspan font-size="${size - 5}" dy="-5">${a === 'N' ? L : L.toLowerCase()}</tspan>`; sub = true; }
  });
  return `<text x="${x}" y="${y}" text-anchor="middle" fill="#e3ebff" font-size="${size}" font-weight="800">${out}</text>`;
}

/* ------------------------------------------------------------------ */
/* LABORATORIO                                                          */
/* ------------------------------------------------------------------ */

export function abrirLabGenetica({ app, volver }) {
  inyectarEstilos();
  const S = {
    sec: 'mendel',
    m: { c: 1, k1: 2, k2: 0 },
    a: { g1: 1, g2: 3, r1: 1, r2: 2 },
    s: { cond: 'dalt', m: 1, p: 0 },
    q: { fase: 'inicio', cola: [], i: 0, puntos: 0, resp: false, filtro: 'todas' }
  };

  /* ---------- Mendel ---------- */
  function lecturaMendel(C, k1, k2) {
    const L = C.L, l = L.toLowerCase(), d = C.dom, r = C.rec;
    const clave2 = [k1, k2].sort().join('');
    if (clave2 === '02') return { t: 'Primera ley: uniformidad de la F1', x: `Al cruzar dos líneas puras que difieren en un carácter, <b>todos los descendientes de la F1 son iguales</b>: heterocigotas ${L}${l} con el fenotipo dominante (${d.f}). No hay ninguna ${r.f}, pero el alelo ${l} no desapareció: quedó oculto.` };
    if (clave2 === '11') return { t: 'Segregación de los alelos (F2)', x: `Cada híbrido ${L}${l} forma dos tipos de gametas, ${L} y ${l}, en igual proporción. Al cruzar los híbridos de la F1 <b>reaparece el fenotipo recesivo</b> (${r.pl}): 3 ${d.pl} : 1 ${r.f} en el fenotipo y 1 : 2 : 1 en el genotipo.` };
    if (clave2 === '01') return { t: 'Cruzamiento prueba', x: `Se cruza un individuo de fenotipo dominante con un homocigota recesivo (${l}${l}). Si el dominante es heterocigota, <b>la mitad de la descendencia es ${r.f}</b> (1 : 1). Si fuera ${L}${L}, toda la descendencia sería ${d.f}.` };
    if (clave2 === '12') return { t: 'Todos con fenotipo dominante', x: `Como un progenitor es ${L}${L}, toda la descendencia es ${d.f}. Pero la mitad es ${L}${L} y la mitad ${L}${l}: mirando solo el fenotipo no se pueden distinguir.` };
    if (clave2 === '22') return { t: 'Línea pura dominante', x: `Los dos progenitores solo dan gametas ${L}: toda la descendencia es ${L}${L} y ${d.f}.` };
    if (clave2 === '00') return { t: 'Línea pura recesiva', x: `Los dos progenitores solo dan gametas ${l}: toda la descendencia es ${l}${l} y ${r.f}. Con dos recesivos, la característica se mantiene generación tras generación.` };
    return { t: 'Cruce', x: '' };
  }

  function secMendel() {
    const C = CARACTERES[S.m.c], L = C.L, l = L.toLowerCase();
    const gen = k => (k === 2 ? L + L : k === 1 ? L + l : l + l);
    const gam = k => (k === 2 ? [L, L] : k === 1 ? [L, l] : [l, l]);
    const fen = k => (k === 0 ? C.rec.f : C.dom.f);
    const g1 = gam(S.m.k1), g2 = gam(S.m.k2);
    const cel = punnett(g1, g2, ordenarM);
    const nDom = cel.filter(c => c[0] === L).length;
    const nLL = cel.filter(c => c[0] === L && c[1] === L).length;
    const nLl = cel.filter(c => c[0] === L && c[1] === l).length;
    const nll = cel.filter(c => c[0] === l).length;
    const colorCel = c => (c[0] === l ? 'rgba(255,154,46,.32)' : c[1] === l ? 'rgba(155,109,255,.34)' : 'rgba(61,139,255,.34)');
    const lect = lecturaMendel(C, S.m.k1, S.m.k2);
    const selPadre = (n, k) => `<div class="gen-chips">${[2, 1, 0].map(v => `<button type="button" class="gen-chip ${k === v ? 'on' : ''}" data-act="m-k${n}" data-v="${v}" aria-pressed="${k === v}"><span>${gen(v)}</span><small>${fen(v)}</small></button>`).join('')}</div>`;

    return `<div class="gen-grid">
      <div class="gen-stack">
        <div class="gen-card">
          <p class="gen-lbl">CARÁCTER</p>
          <div class="gen-chips">${CARACTERES.map((c, i) => `<button type="button" class="gen-chip ${S.m.c === i ? 'on' : ''}" data-act="m-car" data-v="${i}" aria-pressed="${S.m.c === i}"><span>${c.emoji} ${esc(c.nombre)}</span><small>${c.dom.f} (${c.L}) · ${c.rec.f} (${c.L.toLowerCase()})</small></button>`).join('')}</div>
          <p class="gen-lbl">CRUCES DE MENDEL</p>
          <div class="gen-chips">${PRESETS_MENDEL.map(p => `<button type="button" class="gen-chip ${S.m.k1 === p.k1 && S.m.k2 === p.k2 ? 'on' : ''}" data-act="m-pre" data-v="${p.id}">${p.et}</button>`).join('')}</div>
          <p class="gen-lbl">PROGENITOR 1 (filas)</p>${selPadre(1, S.m.k1)}
          <p class="gen-lbl">PROGENITOR 2 (columnas)</p>${selPadre(2, S.m.k2)}
        </div>
      </div>
      <div class="gen-stack">
        <div class="gen-card">
          <h2>Cuadro de Punnett: ${gen(S.m.k1)} × ${gen(S.m.k2)}</h2>
          <p>Cada progenitor aporta <b>un solo alelo</b> por gameta. El cuadro cruza todas las combinaciones posibles.</p>
          ${tablaPunnett(g1, g2, cel, c => `${c[0]}${c[1]}<small>${c[0] === l ? C.rec.f : C.dom.f}</small>`, colorCel)}
          <p class="gen-leyenda">Filas: gametas del progenitor 1 · columnas: gametas del progenitor 2</p>
          <h3>GENOTIPOS</h3>
          ${barras([{ etq: L + L, n: nLL, total: 4, color: COLOR.dom }, { etq: L + l, n: nLl, total: 4, color: COLOR.het }, { etq: l + l, n: nll, total: 4, color: COLOR.rec }])}
          <h3>FENOTIPOS</h3>
          ${barras([{ etq: C.dom.pl, n: nDom, total: 4, color: COLOR.dom }, { etq: C.rec.pl, n: 4 - nDom, total: 4, color: COLOR.rec }])}
          <div class="gen-nota"><b>${lect.t}.</b> ${lect.x}</div>
        </div>
        <div class="gen-card">
          <h2>Del experimento a las leyes</h2>
          <p>Mendel (1822–1884) trabajó con arvejas porque tienen líneas puras, caracteres bien contrastantes y se pueden cruzar a voluntad. Cruzó líneas puras (P), obtuvo la F1 y después cruzó los híbridos entre sí para obtener la F2.</p>
          <div class="gen-gens" role="img" aria-label="Generaciones P, F1 y F2 para ${esc(C.nombre)}">
            <div><div class="t">P · LÍNEAS PURAS</div><div class="g">${L + L} × ${l + l}</div><div class="f">${C.dom.f} × ${C.rec.f}</div></div>
            <div><div class="t">F1 · UNIFORME</div><div class="g">100 % ${L + l}</div><div class="f">todas ${C.dom.pl}</div></div>
            <div><div class="t">F2 · F1 × F1</div><div class="g">1 ${L + L} : 2 ${L + l} : 1 ${l + l}</div><div class="f">3 ${C.dom.pl} : 1 ${C.rec.f}</div></div>
          </div>
          <div class="gen-nota">Sobre la numeración: en muchos textos en español, la <b>primera ley</b> es la uniformidad de la F1 y la <b>segunda</b> es la segregación de los alelos en la F2. Otros textos llaman «primera ley» al principio de segregación. Los dos hechos son los que tenés que saber explicar.</div>
        </div>
        <div class="gen-card"><h2>Vocabulario</h2><div class="gen-glos" style="margin-top:10px">${GLOSARIO.map(([t, d]) => `<div><b>${t}</b>${d}</div>`).join('')}</div></div>
        ${clave('los alelos se separan al formarse las gametas (meiosis) y se vuelven a juntar al azar en la fecundación. Por eso el recesivo puede quedar oculto en la F1 y reaparecer en la F2.')}
      </div>
    </div>`;
  }

  /* ---------- Grupos sanguíneos ---------- */
  function secABO() {
    const A = S.a;
    const p1 = ABO_G[A.g1], p2 = ABO_G[A.g2], r1 = RH_G[A.r1], r2 = RH_G[A.r2];
    const cel = punnett(p1, p2, ordenar), celR = punnett(r1, r2, ordenar);
    const dist = { A: 0, B: 0, AB: 0, O: 0 };
    cel.forEach(c => dist[fenABO(c)]++);
    const rh = { '+': 0, '−': 0 };
    celR.forEach(c => rh[fenRh(c)]++);
    const combos = [];
    ['A', 'B', 'AB', 'O'].forEach(g => ['+', '−'].forEach(s => { const p = dist[g] / 4 * (rh[s] / 4) * 100; if (p > 0) combos.push({ g, s, p }); }));
    const genoH = p => gh(p[0]) + gh(p[1]);
    const selABO = (n, sel) => `<div class="gen-chips">${ABO_G.map((p, i) => `<button type="button" class="gen-chip ${sel === i ? 'on' : ''}" data-act="a-g${n}" data-v="${i}" aria-pressed="${sel === i}"><span>Grupo ${fenABO(p)}</span><small>${genoH(p)}</small></button>`).join('')}</div>`;
    const selRh = (n, sel) => `<div class="gen-chips">${RH_G.map((p, i) => `<button type="button" class="gen-chip ${sel === i ? 'on' : ''}" data-act="a-r${n}" data-v="${i}" aria-pressed="${sel === i}"><span>Rh ${fenRh(p)}</span><small>${p.join('')}</small></button>`).join('')}</div>`;
    const lectura = (() => {
      const hay = Object.keys(dist).filter(k => dist[k] > 0);
      if (hay.length === 1) return `Todos los hijos serían del grupo <b>${hay[0]}</b>.`;
      return `Los hijos podrían ser de los grupos <b>${hay.join(', ')}</b>. Fijate que dos progenitores del mismo grupo pueden tener hijos de otro grupo si son heterocigotas.`;
    })();

    return `<div class="gen-grid">
      <div class="gen-stack">
        <div class="gen-card">
          <p class="gen-lbl">PROGENITOR 1 · ABO</p>${selABO(1, A.g1)}
          <p class="gen-lbl">PROGENITOR 2 · ABO</p>${selABO(2, A.g2)}
          <p class="gen-lbl">PROGENITOR 1 · Rh</p>${selRh(1, A.r1)}
          <p class="gen-lbl">PROGENITOR 2 · Rh</p>${selRh(2, A.r2)}
        </div>
      </div>
      <div class="gen-stack">
        <div class="gen-card">
          <h2>Sistema ABO: ${genoH(p1)} × ${genoH(p2)}</h2>
          <p>Hay tres alelos (<b>I<sup>A</sup></b>, <b>I<sup>B</sup></b> e <b>i</b>), pero cada persona tiene solo dos. I<sup>A</sup> e I<sup>B</sup> son <b>codominantes</b> entre sí y los dos dominan sobre <b>i</b>.</p>
          ${tablaPunnett(p1.map(gh), p2.map(gh), cel, c => `${genoH(c)}<small>Grupo ${fenABO(c)}</small>`, c => COLOR_ABO[fenABO(c)] + '55')}
          <p class="gen-leyenda">Filas: gametas del progenitor 1 · columnas: gametas del progenitor 2</p>
          ${barras(['A', 'B', 'AB', 'O'].map(g => ({ etq: 'Grupo ' + g, n: dist[g], total: 4, color: COLOR_ABO[g] })))}
          <div class="gen-nota">${lectura}</div>
        </div>
        <div class="gen-card">
          <h2>Factor Rh: ${r1.join('')} × ${r2.join('')}</h2>
          <p>El Rh está determinado por otro gen, en otro cromosoma. <b>D</b> (Rh+) es dominante sobre <b>d</b> (Rh−): una persona es Rh− solo si es <b>dd</b>.</p>
          ${tablaPunnett(r1, r2, celR, c => `${c.join('')}<small>Rh ${fenRh(c)}</small>`, c => (fenRh(c) === '+' ? 'rgba(255,79,139,.34)' : 'rgba(141,162,214,.28)'))}
          ${barras([{ etq: 'Rh +', n: rh['+'], total: 4, color: COLOR.rosa }, { etq: 'Rh −', n: rh['−'], total: 4, color: COLOR.gris }])}
          <h3>GRUPO Y FACTOR JUNTOS</h3>
          <p>Como son genes independientes, se multiplican las probabilidades.</p>
          <div class="gen-chips">${combos.map(c => `<span class="gen-chip" style="cursor:default;border-color:${COLOR_ABO[c.g]}"><span>${c.g}${c.s}</span><small>${pct(c.p)} %</small></span>`).join('')}</div>
        </div>
        <div class="gen-card">
          <h2>Antígenos, anticuerpos y transfusiones</h2>
          <div class="gen-scroll"><table class="gen-tabla"><thead><tr><th>GRUPO</th><th>GENOTIPO</th><th>ANTÍGENOS EN EL GLÓBULO ROJO</th><th>ANTICUERPOS EN EL PLASMA</th><th>DONA GLÓBULOS ROJOS A</th><th>RECIBE DE</th></tr></thead>
          <tbody>${GRUPOS.map(g => `<tr><td><b style="color:${COLOR_ABO[g.g]}">${g.g}</b></td><td>${g.geno}</td><td>${g.ant}</td><td>${g.anti}</td><td>${g.dona}</td><td>${g.recibe}</td></tr>`).join('')}</tbody></table></div>
          <div class="gen-nota"><b>Incompatibilidad Rh.</b> Si una madre Rh− espera un bebé Rh+, puede formar anticuerpos anti-D. En un embarazo posterior con un feto Rh+ esos anticuerpos pueden atacar sus glóbulos rojos (enfermedad hemolítica del recién nacido). Se previene con inmunoglobulina anti-D.</div>
          <div class="gen-nota">El grupo sanguíneo sirve para <b>excluir</b> una paternidad (por ejemplo, dos progenitores O no pueden tener un hijo A), pero no alcanza para confirmarla.</div>
        </div>
        ${clave('dos progenitores del mismo grupo pueden tener hijos de otro grupo si son heterocigotas (por ejemplo, I<sup>A</sup>i × I<sup>A</sup>i puede dar un hijo ii, del grupo O). Un hijo del grupo AB nunca puede tener un progenitor del grupo O.')}
      </div>
    </div>`;
  }

  /* ---------- Herencia ligada al sexo ---------- */
  function hijosSexo(madre, padre) {
    const hijos = [];
    madre.forEach(ma => padre.forEach(pa => {
      if (pa === 'Y') hijos.push({ sexo: 'M', al: [ma, 'Y'], est: ma === 'a' ? 'afectado' : 'sano' });
      else { const al = ordenar(ma, pa); const na = al.filter(x => x === 'a').length; hijos.push({ sexo: 'F', al, est: na === 2 ? 'afectada' : na === 1 ? 'portadora' : 'sana' }); }
    }));
    return hijos;
  }

  function pedigri(madre, padre, hijos, L) {
    const sim = (sexo, est, cx, cy) => {
      const af = est === 'afectado' || est === 'afectada', por = est === 'portadora';
      const relleno = af ? '#ff9a2e' : '#0b1d44';
      const forma = sexo === 'M' ? `<rect x="${cx - 20}" y="${cy - 20}" width="40" height="40" rx="3" fill="${relleno}" stroke="#9bc0ff" stroke-width="2.5"/>` : `<circle cx="${cx}" cy="${cy}" r="21" fill="${relleno}" stroke="#9bc0ff" stroke-width="2.5"/>`;
      return forma + (por ? `<circle cx="${cx}" cy="${cy}" r="5.5" fill="#ff9a2e"/>` : '');
    };
    const estPadre = padre[0] === 'a' ? 'afectado' : 'sano';
    const estMadre = madre.filter(x => x === 'a').length === 2 ? 'afectada' : madre.includes('a') ? 'portadora' : 'sana';
    const xs0 = [90, 210, 330, 450];
    let s = `<svg viewBox="0 0 540 275" role="img" aria-label="Árbol genealógico de los dos progenitores y los cuatro tipos de hijos posibles"><rect x="2" y="2" width="536" height="271" rx="18" fill="#08142b" stroke="#25438c"/>`;
    s += `<g stroke="#8fb4ff" stroke-width="2.5" fill="none"><line x1="232" y1="46" x2="308" y2="46"/><line x1="270" y1="46" x2="270" y2="112"/><line x1="90" y1="112" x2="450" y2="112"/>${xs0.map(x => `<line x1="${x}" y1="112" x2="${x}" y2="138"/>`).join('')}</g>`;
    s += sim('M', estPadre, 210, 46) + sim('F', estMadre, 330, 46);
    s += xs(padre, L, 210, 90, 14) + xs(madre, L, 330, 90, 14);
    s += `<text x="210" y="22" text-anchor="middle" fill="#9db6e8" font-size="11" font-weight="700">PADRE</text><text x="330" y="22" text-anchor="middle" fill="#9db6e8" font-size="11" font-weight="700">MADRE</text>`;
    hijos.forEach((h, i) => {
      const cx = xs0[i];
      s += sim(h.sexo, h.est, cx, 160) + xs(h.al, L, cx, 208, 14);
      s += `<text x="${cx}" y="232" text-anchor="middle" fill="#c6d5f7" font-size="11">${h.sexo === 'M' ? 'Hijo' : 'Hija'} ${h.est}</text><text x="${cx}" y="249" text-anchor="middle" fill="#7f97cf" font-size="10">25 %</text>`;
    });
    return s + '</svg>';
  }

  function secSexo() {
    const K = S.s, C = CONDICIONES[K.cond], L = C.L, l = L.toLowerCase();
    const madre = MADRES[K.m], padre = PADRES[K.p];
    const hijos = hijosSexo(madre, padre);
    const hijas = hijos.filter(h => h.sexo === 'F'), hijosM = hijos.filter(h => h.sexo === 'M');
    const cuenta = (arr, e) => arr.filter(h => h.est === e).length;
    const afectados = hijos.filter(h => h.est === 'afectado' || h.est === 'afectada').length;
    const colorH = h => (h.est === 'afectado' || h.est === 'afectada' ? 'rgba(255,154,46,.34)' : h.est === 'portadora' ? 'rgba(155,109,255,.34)' : 'rgba(61,139,255,.3)');
    const et = (al) => xh(al, L);
    const selMadre = `<div class="gen-chips">${MADRES.map((m, i) => `<button type="button" class="gen-chip ${K.m === i ? 'on' : ''}" data-act="s-m" data-v="${i}" aria-pressed="${K.m === i}"><span>${et(m)}</span><small>${['Madre sana', 'Madre portadora', 'Madre afectada'][i]}</small></button>`).join('')}</div>`;
    const selPadre = `<div class="gen-chips">${PADRES.map((p, i) => `<button type="button" class="gen-chip ${K.p === i ? 'on' : ''}" data-act="s-p" data-v="${i}" aria-pressed="${K.p === i}"><span>${et(p)}</span><small>${['Padre sano', 'Padre afectado'][i]}</small></button>`).join('')}</div>`;
    const fHijas = hijas.length ? `Hijas: <b>${pct(cuenta(hijas, 'sana') / 2 * 100)} %</b> sanas · <b>${pct(cuenta(hijas, 'portadora') / 2 * 100)} %</b> portadoras · <b>${pct(cuenta(hijas, 'afectada') / 2 * 100)} %</b> afectadas` : '';
    const fHijos = `Hijos varones: <b>${pct(cuenta(hijosM, 'sano') / 2 * 100)} %</b> sanos · <b>${pct(cuenta(hijosM, 'afectado') / 2 * 100)} %</b> afectados`;

    return `<div class="gen-grid">
      <div class="gen-stack">
        <div class="gen-card">
          <p class="gen-lbl">CONDICIÓN</p>
          <div class="gen-chips">${Object.entries(CONDICIONES).map(([k, c]) => `<button type="button" class="gen-chip ${K.cond === k ? 'on' : ''}" data-act="s-cond" data-v="${k}" aria-pressed="${K.cond === k}"><span>${c.emoji} ${c.nombre}</span><small>alelos X<sup>${c.L}</sup> y X<sup>${c.L.toLowerCase()}</sup></small></button>`).join('')}</div>
          <p class="gen-lbl">MADRE (XX)</p>${selMadre}
          <p class="gen-lbl">PADRE (XY)</p>${selPadre}
          <p style="margin-top:14px;font-size:.8rem;color:#9db6e8">X<sup>${L}</sup> = alelo normal (dominante) · X<sup>${l}</sup> = alelo alterado (recesivo).</p>
        </div>
        <div class="gen-card gen-chr">
          <svg viewBox="0 0 150 110" role="img" aria-label="Cromosomas sexuales X e Y">
            <g stroke-linecap="round" fill="none" stroke-width="13"><g stroke="#3d8bff"><line x1="14" y1="16" x2="52" y2="92"/><line x1="52" y1="16" x2="14" y2="92"/></g><g stroke="#ff9a2e"><line x1="98" y1="28" x2="118" y2="62"/><line x1="138" y1="28" x2="118" y2="62"/><line x1="118" y1="62" x2="118" y2="94"/></g></g>
            <text x="33" y="108" text-anchor="middle" fill="#c6d5f7" font-size="12" font-weight="800">X</text><text x="118" y="108" text-anchor="middle" fill="#c6d5f7" font-size="12" font-weight="800">Y</text>
          </svg>
          <p><b>Mujeres: XX. Varones: XY.</b> El X lleva muchos genes que no tienen nada que ver con el sexo. El Y es mucho más chico y no tiene alelos para estos genes: por eso el varón es <b>hemicigota</b> (tiene un solo alelo).</p>
        </div>
      </div>
      <div class="gen-stack">
        <div class="gen-card">
          <h2>${C.emoji} ${C.nombre}: ${et(madre)} × ${et(padre)}</h2>
          <p>${C.desc}</p>
          <p style="color:#9db6e8;font-size:.84rem">${C.gen}</p>
          ${tablaPunnett(madre.map(a => xh([a], L)), padre.map(a => (a === 'Y' ? 'Y' : xh([a], L))), hijos.map(h => h), h => `${et(h.al)}<small>${h.sexo === 'M' ? '♂ hijo' : '♀ hija'} ${h.est}</small>`, colorH)}
          <p class="gen-leyenda">Filas: gametas de la madre (♀) · columnas: gametas del padre (♂)</p>
          <h3>RESULTADO</h3>
          <p>${fHijas}${fHijas ? '<br>' : ''}${fHijos}</p>
          <p>Probabilidad de que un hijo cualquiera esté afectado: <b>${pct(afectados / 4 * 100)} %</b></p>
        </div>
        <div class="gen-card gen-pedi">
          <h2>Árbol genealógico</h2>
          <p>Cuadrado = varón, círculo = mujer. Relleno naranja = afectado. Círculo con punto = mujer portadora (sana, pero con un alelo alterado). Los cuatro hijos son las cuatro casillas del cuadro.</p>
          ${pedigri(madre, padre, hijos, L)}
          <div class="gen-leg"><span><svg width="18" height="18"><rect x="2" y="2" width="14" height="14" rx="2" fill="#0b1d44" stroke="#9bc0ff" stroke-width="2"/></svg>Varón sano</span><span><svg width="18" height="18"><rect x="2" y="2" width="14" height="14" rx="2" fill="#ff9a2e" stroke="#9bc0ff" stroke-width="2"/></svg>Varón afectado</span><span><svg width="18" height="18"><circle cx="9" cy="9" r="7" fill="#0b1d44" stroke="#9bc0ff" stroke-width="2"/><circle cx="9" cy="9" r="3" fill="#ff9a2e"/></svg>Portadora</span><span><svg width="18" height="18"><circle cx="9" cy="9" r="7" fill="#ff9a2e" stroke="#9bc0ff" stroke-width="2"/></svg>Mujer afectada</span></div>
        </div>
        <div class="gen-card">
          <h2>Reglas para resolver los problemas</h2>
          <div class="gen-reglas" style="margin-top:10px">
            <div><b>El padre le da su X a las hijas</b><span>y su Y a los hijos varones. Por eso un varón nunca le transmite su X a un hijo varón.</span></div>
            <div><b>Padre afectado × madre sana (XX)</b><span>Todas las hijas son portadoras y todos los hijos varones son sanos. La condición «salta» una generación.</span></div>
            <div><b>Madre portadora × padre sano</b><span>La mitad de los hijos varones está afectada y la mitad de las hijas es portadora. Ninguna hija está afectada.</span></div>
            <div><b>Para que una mujer esté afectada</b><span>necesita dos alelos alterados: padre afectado y madre portadora o afectada.</span></div>
          </div>
          <div class="gen-nota"><b>Por qué hay más varones afectados.</b> ${C.frec} <br>Ejemplo histórico: la reina Victoria de Inglaterra era portadora de hemofilia y la transmitió a varias casas reales europeas.</div>
        </div>
        ${clave('en la herencia recesiva ligada al X, un varón se afecta con un solo alelo alterado, que siempre recibe de su madre. Una mujer necesita dos.')}
      </div>
    </div>`;
  }

  /* ---------- Preguntas ---------- */
  function mezclar(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
  function iniciarQuiz(filtro) {
    const base = PREGUNTAS.filter(p => filtro === 'todas' || p.t === filtro);
    S.q = { fase: 'pregunta', filtro, i: 0, puntos: 0, resp: false, cola: mezclar(base).map(p => ({ q: p.q, exp: p.exp, boceto: p.t === 'mendel', borrador: {}, o: mezclar(p.o.map((t, i) => ({ t, ok: i === p.ok }))) })) };
  }

  function bocetoPunnettHTML(q) {
    if (!q.boceto) return '';
    const valores = q.borrador || {};
    const campos = [
      ['g2a', 'P2 · gameta 1', 'Gameta 1 del progenitor 2'],
      ['g2b', 'P2 · gameta 2', 'Gameta 2 del progenitor 2'],
      ['g1a', 'P1 · gameta 1', 'Gameta 1 del progenitor 1'],
      ['h11', 'F1 · casilla 1', 'Genotipo descendiente 1'],
      ['h12', 'F1 · casilla 2', 'Genotipo descendiente 2'],
      ['g1b', 'P1 · gameta 2', 'Gameta 2 del progenitor 1'],
      ['h21', 'F1 · casilla 3', 'Genotipo descendiente 3'],
      ['h22', 'F1 · casilla 4', 'Genotipo descendiente 4']
    ];
    return `<section class="gen-boceto" aria-label="Cuadro de Punnett editable">
      <div class="gen-boceto-head">
        <div><strong>✏️ Tu cuadro de Punnett</strong><small>Completá las gametas y combiná los alelos en las cuatro casillas.</small></div>
        <button type="button" class="gen-act sec" data-act="q-boceto-clear">Limpiar</button>
      </div>
      <div class="gen-boceto-grid">
        <div class="gen-boceto-corner" aria-hidden="true">×</div>
        ${campos.slice(0,2).map(([k,l,a]) => `<label class="gen-boceto-item"><span>${l}</span><input type="text" maxlength="4" autocomplete="off" autocapitalize="off" spellcheck="false" data-boceto="${k}" aria-label="${a}" value="${esc(valores[k] || '')}" placeholder="·"></label>`).join('')}
        ${campos.slice(2).map(([k,l,a]) => `<label class="gen-boceto-item"><span>${l}</span><input type="text" maxlength="4" autocomplete="off" autocapitalize="off" spellcheck="false" data-boceto="${k}" aria-label="${a}" value="${esc(valores[k] || '')}" placeholder="·"></label>`).join('')}
      </div>
      <p class="gen-boceto-hint">Es un espacio de trabajo personal: no se corrige ni modifica tu puntaje. Podés escribir Y, y, Yy, etc.</p>
    </section>`;
  }

  function secQuiz() {
    const Q = S.q;
    if (Q.fase === 'inicio') {
      return `<div class="gen-q"><div class="gen-card"><h2>Preguntas de genética</h2><p>${PREGUNTAS.length} preguntas de opción múltiple con explicación en cada respuesta. Elegí qué querés repasar:</p>
        <div class="gen-temas">${TEMAS_Q.map(([k, n]) => `<button type="button" data-act="q-start" data-v="${k}"><b>${n}</b><span>${PREGUNTAS.filter(p => k === 'todas' || p.t === k).length} preguntas</span></button>`).join('')}</div></div></div>`;
    }
    if (Q.fase === 'fin') {
      const p = Math.round(Q.puntos / Q.cola.length * 100);
      return `<div class="gen-q"><div class="gen-card gen-res"><p class="gen-lbl" style="margin-top:0">RESULTADO</p><h2>${Q.puntos} / ${Q.cola.length}</h2><p>${p} % correcto. ${p >= 85 ? 'Excelente dominio.' : p >= 70 ? 'Buen resultado: repasá las explicaciones de los errores.' : 'Volvé a mirar los cuadros de Punnett y probá de nuevo.'}</p>
        <p><button type="button" class="gen-act" data-act="q-start" data-v="${Q.filtro}">Reintentar</button> <button type="button" class="gen-act sec" data-act="q-menu">Elegir otro tema</button></p></div></div>`;
    }
    const q = Q.cola[Q.i];
    return `<div class="gen-q"><div class="gen-q-top"><button type="button" class="gen-back" data-act="q-menu">← Salir</button><span>Pregunta ${Q.i + 1} / ${Q.cola.length}</span></div>
      <div class="gen-prog"><i style="width:${Q.i / Q.cola.length * 100}%"></i></div>
      <div class="gen-card"><h2>${rich(q.q)}</h2>
      <div class="gen-op">${q.o.map((o, i) => `<button type="button" data-act="q-ans" data-v="${i}"><b>${'ABCD'[i]}</b><span>${rich(o.t)}</span></button>`).join('')}</div>
      ${bocetoPunnettHTML(q)}
      <p class="gen-fb" id="gen-fb" aria-live="polite"></p>
      <button type="button" class="gen-act" id="gen-next" data-act="q-next" disabled>${Q.i === Q.cola.length - 1 ? 'Ver resultado' : 'Siguiente →'}</button></div></div>`;
  }

  function responder(i) {
    const Q = S.q;
    if (Q.resp) return;
    Q.resp = true;
    const q = Q.cola[Q.i], ok = q.o[i].ok;
    if (ok) Q.puntos++;
    app.querySelectorAll('[data-act="q-ans"]').forEach((b, j) => { b.disabled = true; if (q.o[j].ok) b.classList.add('ok'); else if (j === i) b.classList.add('no'); });
    app.querySelector('#gen-fb').innerHTML = `<b>${ok ? 'Correcto.' : 'Incorrecto.'}</b> ${rich(q.exp)}`;
    app.querySelector('#gen-next').disabled = false;
  }

  /* ---------- Estructura general ---------- */
  const SECCIONES = [['mendel', '🌱', 'Primera ley de Mendel'], ['abo', '🩸', 'Grupos sanguíneos'], ['sexo', '🧬', 'Daltonismo y hemofilia'], ['quiz', '✓', 'Preguntas']];

  function render(irArriba) {
    const y = window.scrollY;
    const cuerpo = S.sec === 'mendel' ? secMendel() : S.sec === 'abo' ? secABO() : S.sec === 'sexo' ? secSexo() : secQuiz();
    app.innerHTML = `<main class="gen">
      <header class="gen-head"><button type="button" class="gen-back" data-act="volver">← Volver a Laboratorios</button>
        <div class="gen-kicker">PARCIALITO LAB · GENÉTICA</div><h1>Genética mendeliana</h1>
        <p>De los experimentos de Mendel con arvejas a los grupos sanguíneos y a las enfermedades ligadas al cromosoma X. Elegí los genotipos de los progenitores y mirá cómo se reparten los alelos.</p></header>
      <nav class="gen-tabs" aria-label="Secciones del laboratorio de genética">${SECCIONES.map(([k, ic, n]) => `<button type="button" class="${S.sec === k ? 'on' : ''}" data-act="tab" data-v="${k}" aria-current="${S.sec === k}"><span aria-hidden="true">${ic}</span>${n}</button>`).join('')}</nav>
      <section>${cuerpo}</section></main>`;
    app.querySelector('.gen').addEventListener('click', onClick);
    app.querySelector('.gen').addEventListener('input', e => {
      const input = e.target.closest('[data-boceto]');
      if (!input) return;
      const actual = S.q.cola[S.q.i];
      if (!actual || !actual.boceto) return;
      actual.borrador ||= {};
      actual.borrador[input.dataset.boceto] = input.value;
    });
    window.scrollTo(0, irArriba ? 0 : y);
  }

  function onClick(e) {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act, v = b.dataset.v;
    switch (act) {
      case 'volver': volver(); return;
      case 'tab': S.sec = v; render(true); return;
      case 'm-car': S.m.c = +v; break;
      case 'm-k1': S.m.k1 = +v; break;
      case 'm-k2': S.m.k2 = +v; break;
      case 'm-pre': { const p = PRESETS_MENDEL.find(x => x.id === v); S.m.k1 = p.k1; S.m.k2 = p.k2; break; }
      case 'a-g1': S.a.g1 = +v; break;
      case 'a-g2': S.a.g2 = +v; break;
      case 'a-r1': S.a.r1 = +v; break;
      case 'a-r2': S.a.r2 = +v; break;
      case 's-cond': S.s.cond = v; break;
      case 's-m': S.s.m = +v; break;
      case 's-p': S.s.p = +v; break;
      case 'q-start': iniciarQuiz(v); break;
      case 'q-menu': S.q = { fase: 'inicio', cola: [], i: 0, puntos: 0, resp: false, filtro: 'todas' }; break;
      case 'q-ans': responder(+v); return;
      case 'q-boceto-clear': {
        const actual = S.q.cola[S.q.i];
        if (actual) actual.borrador = {};
        app.querySelectorAll('[data-boceto]').forEach(input => { input.value = ''; });
        return;
      }
      case 'q-next': S.q.i++; S.q.resp = false; if (S.q.i >= S.q.cola.length) S.q.fase = 'fin'; break;
      default: return;
    }
    render(act.startsWith('q-'));
  }

  render(true);
}
