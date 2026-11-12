"""Importa el compilado de Maru y agrega respuestas justificadas al banco web."""
import json
import re
from pathlib import Path

import pdfplumber

SOURCE = Path(r"D:\Descargas\Megaclase repaso segundo parcial CBC 2026, por Maru.pdf")
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "megaclase-marucbc-2026.json"
IMG = "assets/megaclase-marucbc-2026/"

# Letras inferidas del contenido de Biología; varias preguntas están duplicadas en el PDF.
KEY = """\
C D D D D C A A A D C D D A D
A C B B A A C B D D D C B A D
C A C B A B B B B D C A A B A
C A A A D D A B A D B C B B A
A B D A C A B A C B A B D C D
B B D C D C D D B D B B C D A
A C D B C B A B B D D B A B A
A B C B B A B B D B A B A B B
B A A C B B C A C A C A D A B
""".split()

WHY = [
"Las proteínas ribosómicas y las láminas tienen señales de localización nuclear y se importan desde el citoplasma.",
"Las subunidades ribosómicas se ensamblan en el núcleo y salen por los poros para participar en la traducción.",
"La heterocromatina está compactada; muchas de sus secuencias repetitivas permanecen transcripcionalmente silenciadas.",
"El genoma procariota típico consiste en una molécula principal de ADN circular, sin núcleo ni telómeros.",
"Los genes que se transcriben activamente suelen estar en eucromatina, que es más accesible.",
"La traducción comienza normalmente en un codón de inicio AUG tanto en procariotas como en eucariotas.",
"Codones sinónimos son tripletes distintos que especifican el mismo aminoácido.",
"La ARN polimerasa lee la hebra molde de ADN en sentido 3′→5′ para sintetizar ARN 5′→3′.",
"El número 4 señala el complejo enzimático que sintetiza el transcripto de ARN: la ARN polimerasa.",
"La cola poli-A se agrega al extremo 3′ del ARNm eucariota y contribuye a su estabilidad.",
"El splicing alternativo combina exones de distintas maneras y genera ARNm maduros diferentes.",
"La peptidil-transferasa del ribosoma cataliza el enlace peptídico que alarga la cadena.",
"La aminoacil-ARNt sintetasa carga el aminoácido correcto en su ARNt, paso necesario para traducir.",
"El ARN es complementario y antiparalelo a la molde: 3′-ATCGATCG-5′ produce 5′-UAGCUAGC-3′.",
"El anticodón debe aparearse de forma complementaria y antiparalela con CCA: 3′-GGU-5′.",
"La sexta base está en el codón CCA; sustituirla puede producir CAU, que también codifica histidina (CAC).",
"La lectura se inicia por el extremo amino y la secuencia y clave de codones dadas conducen a Glu-Ala-Val-Tyr seguido de STOP.",
"La figura muestra el codón GGC para glicina; su anticodón complementario y antiparalelo es 3′-CCG-5′.",
"La cadena complementaria esperada sería 3′-TAACGCG-5′. El PDF no ofrece esa secuencia; se corrigió la opción B para representar una única sustitución.",
"Tras meiosis I hay n=3 cromosomas duplicados; en anafase II las cromátidas se separan y cada polo recibe tres cromosomas de una cromátida.",
"Si el progenitor de fenotipo A es heterocigota (Iᴬi), el cruce IᴬIᴮ × Iᴬi produce descendencia B en la mitad de los casos.",
"La transcriptasa reversa sintetiza ADN utilizando ARN como molde.",
"Con lactosa presente y glucosa escasa, sube el AMPc y CAP activa la transcripción del operón lac.",
"El triptófano actúa como correpresor: activa al represor, que se une al operador y frena el operón.",
"Si el represor no reconoce lactosa, no se inactiva y puede bloquear el operón, impidiendo usar lactosa como nutriente.",
"En el esquema de replicación, D sella los cortes entre fragmentos de Okazaki: es la ADN ligasa.",
"Las procariotas tienen genes reguladores, ADN polimerasa y ribosomas, pero carecen de telómeros al tener ADN circular.",
"La replicación semiconservativa conserva una hebra parental y sintetiza una nueva en cada molécula hija.",
"La helicasa abre la doble hélice y consume ATP; la topoisomerasa, no la helicasa, alivia el superenrollamiento.",
"En G1 hay la mitad de ADN que tras la duplicación en G2; la fase S lo duplica.",
"El cáncer suele surgir cuando se pierde la regulación de proliferación y de los puntos de control del ciclo celular.",
"En G2 el ADN ya se duplicó, por lo que una célula epitelial diploide tiene el doble que una célula en G1 o G0 y que un óvulo.",
"Las mutaciones cambian la secuencia de un alelo y pueden originar alelos nuevos.",
"En metafase II la célula es haploide: puede tener siete cromosomas duplicados si la célula de origen era 2n=14.",
"Los homólogos portan genes para los mismos caracteres en los mismos loci, aunque sus alelos pueden diferir.",
"La metafase ofrece cromosomas condensados y alineados, apropiados para preparar un cariotipo.",
"AABbCc siempre aporta el alelo A: el locus A es homocigota, así que la probabilidad es 1.",
"Procariotas y eucariotas tienen promotores, aunque las secuencias y su organización difieren.",
"Los cinetocoros conectan los cromosomas con los microtúbulos del huso y permiten su movimiento.",
"Los microtúbulos del huso se acortan y desplazan cromosomas hacia los polos durante la anafase.",
"La ADN polimerasa necesita un cebador con un extremo 3′-OH; la ARN polimerasa puede iniciar sin él.",
"En profase mitótica, cada cromosoma ya duplicado tiene dos cromátidas hermanas.",
"La corrección de pruebas ocurre durante la síntesis de ADN (fase S), mientras las polimerasas incorporan nucleótidos.",
"La helicasa separa las hebras rompiendo los puentes de hidrógeno entre bases complementarias.",
"Una mutación es un cambio heredable en la secuencia de nucleótidos del ADN.",
"Roberto, hijo de un progenitor O, debe ser Iᴬi; Susana es ii. Iᴬi × ii da 50 % de hijos ii, grupo O.",
"Un ARNm policistrónico contiene varios marcos de lectura y por eso múltiples inicios y terminaciones.",
"La compactación de la heterocromatina dificulta el acceso de la maquinaria de transcripción.",
"Dos progenitores B pueden ser heterocigotas y tener un hijo O; ambos son bb para ojos celestes, así que todos sus hijos serán celestes.",
"La ARN polimerasa posee señal de localización nuclear y puede entrar unida a importinas.",
"La lámina nuclear se desorganiza al comenzar la mitosis y vuelve a ensamblarse al final.",
"Las células de un organismo comparten el genoma y el repertorio general de histonas, aunque expresen distintos genes.",
"En un polirribosoma varios ribosomas traducen el mismo ARNm y producen copias de la misma cadena polipeptídica.",
"Una mujer daltónica es XᶜXᶜ; con un varón no daltónico XᴺY, todos los hijos varones serán daltónicos y las hijas portadoras.",
"El crossing-over entre cromosomas homólogos puede recombinar y separar genes ligados.",
"Las proteínas que ingresan al núcleo utilizan una señal de localización nuclear reconocida por importinas.",
"En el cruzamiento prueba aa bb, la hembra AABb produce gametos AB y Ab por igual: la mitad de la descendencia resulta negra y corta.",
"La meiosis I reduce de 2n a n; por eso el cambio ocurre del ovocito primario al secundario.",
"Después de las dos meiosis, la espermátida se diferencia por espermiogénesis y forma el espermatozoide.",
"Sin unión de lactosa, el represor mutante permanece unido al operador y bloquea la transcripción del operón.",
"Las cromátidas hermanas se originan al duplicarse un cromosoma y, salvo mutaciones, son copias equivalentes.",
"La cola poli-A protege al ARNm de la degradación y aumenta su vida media en el citoplasma.",
"El intrón se transcribe al transcripto primario y luego se elimina; no queda en el ARNm maduro traducible.",
"La topoisomerasa reduce la tensión del ADN por delante de la burbuja de transcripción.",
"La aminoacil-ARNt sintetasa cataliza la unión del aminoácido con su ARNt correspondiente.",
"El represor ejerce control negativo: al unirse al operador impide la transcripción del operón lac.",
"La hidrólisis de los enlaces de cada ribonucleótido trifosfato incorporado aporta energía a la síntesis de ARN.",
"La ARN polimerasa utiliza la hebra molde de ADN en orientación 3′→5′ y produce ARN en dirección 5′→3′.",
"El splicing elimina intrones del transcripto y empalma sus exones para formar ARNm maduro.",
"Los intrones se transcriben al precursor, pero se eliminan antes de la traducción.",
"Policistrónico significa que un mismo ARNm contiene información para más de un polipéptido.",
"En eucariotas, el ARNm suele ser monocistrónico y se traduce después de su procesamiento y exportación.",
"En bacterias, la ADN polimerasa I puede retirar los cebadores de ARN con su actividad exonucleasa 5′→3′.",
"Sin ADN polimerasa III bacteriana no puede completarse la replicación cromosómica, por lo que la bacteria no puede reproducirse.",
"En células eucariotas, la cromatina está accesible durante la fase S, cuando se duplica el ADN.",
"El citoesqueleto es dinámico: sus filamentos se ensamblan y desensamblan para cambiar forma y movimiento.",
"La cromatina centromérica suele incluir CENP-A, una variante de histona H3 que define el centrómero funcional.",
"Las ciclinas regulan a las Cdks y su concentración cambia; la fosforilación inhibitoria de una Cdk también puede reducir su actividad.",
"El axonema típico de cilios y flagelos tiene nueve dobletes periféricos y dos microtúbulos centrales: 9+2.",
"La señal nuclear y la importina median la entrada; Ran-GTP libera la carga en el núcleo y facilita el reciclado de importina en el citoplasma.",
"Nucleasas cortan y eliminan el tramo dañado; luego otras enzimas rellenan y sellan la reparación.",
"Las roturas de doble hebra sí se reparan, principalmente por unión de extremos no homólogos o recombinación homóloga.",
"Los filamentos de actina son polímeros finos y flexibles, no hebras gruesas (esa descripción corresponde a filamentos intermedios).",
"El splicing alternativo ocurre durante el procesamiento y genera distintas combinaciones de exones en ARNm maduros.",
"En prometafase desaparece la envoltura, los microtúbulos se unen a cinetocoros de modo inicialmente azaroso y las hermanas se conectan a polos opuestos.",
"APC/C degrada securina, libera separasa y permite cortar cohesinas para separar cromátidas hermanas.",
"El punto de control de fase S retrasa la progresión si la replicación está incompleta.",
"Ran-GEF nuclear intercambia GDP por GTP en Ran, generando Ran-GTP.",
"El punto de control G1/S evalúa condiciones y daño, y activa Cdks de G1, transición y fase S.",
"La contracción muscular resulta del deslizamiento de filamentos de actina impulsado por miosina.",
"El nucleosoma contiene ADN enrollado alrededor de un octámero de histonas; H1 contribuye a organizar el ADN enlazador.",
"La exportación de ARNm utiliza receptores y complejos de exportación específicos; no depende del mecanismo Ran típico de proteínas.",
"p53 se estabiliza ante daño, induce p21 para inhibir Cdks y limita proliferación; perder p53 favorece cáncer.",
"Los filamentos intermedios están compuestos por proteínas fibrosas como queratinas, vimentina y láminas.",
"El FPS/S-Cdk se asocia con Cdk2 y ciclina de G1/S para activar el inicio de la replicación.",
"El splicing alternativo es control postranscripcional, no control de la transcripción propiamente dicha.",
"El procesamiento del ARN, incluido el corte y empalme, ocurre en el núcleo eucariota.",
"La degradación de securina por APC/C activa separasa y separa cromátidas hermanas en anafase.",
"El control de la fase S retrasa el ciclo hasta completar la replicación del ADN.",
"La unión de extremos y la recombinación homóloga son vías de reparación de roturas bicatenarias.",
"p53 responde al daño, promueve p21 y actúa como supresor tumoral; las tres afirmaciones describen su papel.",
"Los nucleosomas persisten como unidad de empaquetamiento tanto en cromatina poco condensada como en cromosomas.",
"Eucromatina y cromosomas compactos contienen ADN asociado con histonas y otras proteínas.",
"Un cromosoma es ADN asociado con histonas y con otras proteínas estructurales y reguladoras.",
"Diploide significa dos juegos de cromosomas homólogos, uno heredado de cada progenitor.",
"En el cariotipo XX y XY cambia el par sexual; el número total de cromosomas es igual.",
"Un varón humano tiene 22 pares de autosomas y un par sexual XY.",
"La diferenciación depende de qué genes se activan o silencian, aunque la mayoría de las células conserve el mismo ADN.",
"Las células musculares conservan los genes de melanina, pero no los expresan; la regulación génica produce diferencias celulares.",
"Cambiar entre eucromatina y heterocromatina regula accesibilidad, no altera la secuencia de ADN del gen.",
"Los enhancers activan la transcripción al unirse a factores de transcripción específicos.",
"A partir de una misma secuencia de ADN, el splicing alternativo puede generar ARNm y polipéptidos distintos.",
"La expresión de un gen codificante culmina en una proteína funcional, más allá de producir el transcripto.",
"La metilación del promotor suele impedir el reclutamiento de la maquinaria de transcripción y silenciar el gen.",
"Los factores de transcripción específicos se unen a elementos activadores y colaboran con la ARN polimerasa.",
"La ligasa sella enlaces fosfodiéster entre el fragmento de Okazaki y la cadena de ADN contigua.",
"La ADN polimerasa sintetiza ADN; al inhibirla, la replicación no puede avanzar.",
"Cada hebra nueva, líder y rezagada, requiere un cebador corto de ARN para iniciar la síntesis.",
"Cada cromátida se replica semiconservativamente y queda formada por una hebra parental y una recién sintetizada.",
"El cebador requiere ribonucleótidos (incluido UTP) y la nueva cadena requiere los cuatro desoxirribonucleótidos.",
"La ADN polimerasa I retira cebadores con actividad exonucleasa 5′→3′ y rellena los huecos con ADN.",
"Los cromosomas eucariotas lineales tienen telómeros que tienden a acortarse con cada replicación.",
"La telomerasa extiende extremos cromosómicos usando como molde su propio ARN.",
"Tras replicar el ADN, una célula puede permanecer en G2 sin completar la división.",
"Las Cdks son quinasas catalíticas cuya actividad depende de asociarse con una ciclina.",
"El FPS activa proteínas que licencian e inician la duplicación del ADN.",
"El FPM incluye Cdk1 asociada a ciclina M y promueve la entrada en mitosis.",
"Ciclina D se acumula en G1 y ciclina B aumenta hacia G2/mitosis.",
"En organismos pluricelulares la mitosis permite crecer y reemplazar o reparar células de tejidos.",
"En metafase mitótica, 2n=8 indica ocho cromosomas duplicados, es decir, dieciséis cromátidas.",
"La recombinación y la distribución independiente hacen que las células de una meiosis difieran entre sí.",
"Un espermatocito primario 2n=4 en metafase I tiene cuatro cromosomas duplicados, ocho moléculas de ADN.",
"Meiosis II produce dos células haploides; para 2n=8, cada una queda con cuatro cromosomas y cuatro moléculas de ADN.",
"Un ovocito secundario es haploide (n=5); proviene de una célula diploide 2n=10.",
"La meiosis I reduce 2n=4 a n=2 en dos células; la meiosis II separa cromátidas y forma cuatro células haploides.",
]

def importar():
    if not SOURCE.exists():
        raise FileNotFoundError(f"No se encuentra el PDF: {SOURCE}")
    if len(KEY) != 135 or len(WHY) != 135:
        raise ValueError(f"Se esperaban 135 claves y justificaciones; hay {len(KEY)} y {len(WHY)}")
    preguntas = []
    actual = None
    opcion = None
    with pdfplumber.open(SOURCE) as pdf:
        for page_num, page in enumerate(pdf.pages, 1):
            for line in (page.extract_text() or "").splitlines():
                line = line.strip()
                line = re.split(r"\s+(?:Si llegaste hasta acá|Preparé este compilado|Pero, si necesitás explicaciones)", line, maxsplit=1)[0].strip()
                if not line:
                    continue
                match = re.match(r"^(\d{1,3})[.)]\s*(.*)$", line)
                if match and 1 <= int(match.group(1)) <= 135:
                    n = int(match.group(1))
                    actual = {"n": n, "pregunta": match.group(2), "opciones": []}
                    preguntas.append(actual)
                    opcion = None
                    continue
                match = re.match(r"^([a-dA-D])[.)]\s*(.*)$", line)
                if match and actual:
                    opcion = match.group(1).upper()
                    actual["opciones"].append(match.group(2))
                    continue
                if (actual and line and not line.startswith(("Biología con Maru", "Si llegaste hasta acá", "Preparé este compilado", "Pero, si necesitás explicaciones", "https://"))
                        and not re.fullmatch(r"\d+", line)):
                    if opcion:
                        actual["opciones"][-1] += " " + line
                    else:
                        actual["pregunta"] += " " + line

    if len(preguntas) != 135 or any(len(q["opciones"]) != 4 for q in preguntas):
        raise ValueError("La extracción no encontró las 135 preguntas con cuatro opciones.")

    for q in preguntas:
        n = q["n"]
        q["id"] = f"megaclase-maru-2026-{n:03}"
        q["pregunta"] = re.sub(r"\s+", " ", q["pregunta"]).strip()
        q["opciones"] = [re.sub(r"\s+", " ", o).strip() for o in q["opciones"]]
        if n == 17:
            q["pregunta"] = "¿Qué polipéptido será sintetizado a partir del siguiente fragmento de ADN molde? 3′ CTT CGT CAA ATG ATT 5′ (GUU→Val, GCA→Ala, UAC→Tyr, GAA→Glu)"
        q["correcta"] = KEY[n-1]
        q["explicacion"] = WHY[n-1]
        if n == 19:
            # El PDF tiene una errata en la opción de sustitución: aquí queda una sola base cambiada.
            q["opciones"][1] = "3' TTACGCG 5'"
        elif n == 121:
            q["pregunta"] = "¿Cuál de las siguientes enzimas tiene actividad exonucleasa 5′→3′ para remover el cebador de ARN?"
        if n == 9:
            q["imagen"] = IMG + "p3-figura1.png"
            q["imagen_alt"] = "Esquema de transcripción; el rótulo 4 señala la ARN polimerasa."
        elif n == 17:
            q["imagen"] = IMG + "p4-figura1.png"
            q["imagen_alt"] = "Tabla del código genético para identificar los aminoácidos."
        elif n == 18:
            q["imagen"] = IMG + "p5-figura4.png"
            q["imagen_alt"] = "Ribosoma en el codón de terminación, con el último aminoácido glicina y el anticodón indicado."
        elif n == 26:
            q["imagen"] = IMG + "p7-figura1.png"
            q["imagen_alt"] = "Esquema de replicación del ADN con enzimas señaladas por letras."
        del q["n"]

    resultado = {
        "materia": "Biología CBC",
        "tema": "Megaclase de repaso · Segundo parcial 2026 · Maru",
        "fuente": "Compilado de preguntas de segundo parcial CBC, Biología con Maru.",
        "preguntas": preguntas,
    }
    OUTPUT.write_text(json.dumps(resultado, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generadas {len(preguntas)} preguntas en {OUTPUT}")

if __name__ == "__main__":
    importar()
