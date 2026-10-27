# Prompt para generar un laboratorio nuevo con el mismo diseño

Sirve para pedirle a cualquier LM (Claude, ChatGPT, Gemini…) un laboratorio de **otro tema**
que se vea igual que el de *Factores de transcripción* (`js/lab.js`).

## Cómo usarlo

1. Adjuntá al LM **la imagen de referencia** del laboratorio de transcripción (la captura de la Vista 3D).
   Si el LM acepta archivos, adjuntá también `js/lab.js` como ejemplo de código.
2. Copiá el bloque de abajo, completá lo que está entre `[corchetes]` y pegalo.
3. Guardá lo que devuelva como `js/lab-<id>.js`.
4. Integración (2 líneas en `js/lab.js`):
   - arriba: `import { abrirLabNuevo } from './lab-<id>.js';`
   - en `abrirLab`, en la lista `temas`, agregá `{id:'<id>', icon:'🧬', grupo:'...', titulo:'...', desc:'...', activo:true, tono:'azul'}`
     y junto a las otras ramas (`else if(t.id==='operones') ...`) agregá
     `else if(t.id==='<id>') abrirLabNuevo({app,volver:mostrarCatalogo});`
5. Corré `python tools/versionar.py` si querés refrescar la caché.

---

## Prompt

````text
Actuá como un desarrollador front-end y diseñador de material didáctico de biología.
Te adjunto una imagen de referencia: es la pestaña "Vista 3D" de un laboratorio interactivo.
Quiero que crees un laboratorio NUEVO con EXACTAMENTE la misma estructura y el mismo estilo
visual, pero sobre otro tema.

TEMA NUEVO
- Título principal: [ej. Duplicación del ADN]
- Subtítulo: [ej. Horquilla de replicación y enzimas]
- Frase de introducción (1–2 líneas): [ej. Explorá cómo se organizan y actúan las enzimas en la horquilla.]
- Material de estudio (usá SOLO esto, sin inventar datos): [pegá apuntes, texto o adjuntá el PDF]
- Cantidad de piezas en el modelo: [4 a 6]   |   Pasos de la guía: [4 a 5]   |   Preguntas: [8 a 10]

ENTREGABLE
Un único archivo JavaScript (módulo ES) llamado js/lab-[id].js que exporte
    export function abrirLab[Nombre]({ app, volver })
y que dibuje todo dentro de app.innerHTML, inyectando su propio <style> (sin librerías
externas, sin imágenes externas, sin frameworks). Todo el modelo "3D" se dibuja con SVG
inline generado por código. Debe funcionar al abrirlo sin servidor de compilación.
Devolvé solo el código, en un bloque, sin explicaciones largas.

ESTRUCTURA (idéntica a la imagen, de arriba hacia abajo)
1. Cabecera: botón circular "←" que llama a volver(); ícono del tema a la izquierda del título;
   título (h1, ~1.7rem, peso 700) y subtítulo (h2, ~1.3rem, peso 600) uno debajo del otro.
   A la derecha, una barra de pestañas redondeada con 4 pestañas: "Vista 3D" (activa, azul con
   resplandor), "Explicación", "Comparador", "Preguntas". Debajo, la frase de introducción.
2. Vista 3D, en dos columnas (panel de 225px + escena):
   - Panel izquierdo "Capas": un interruptor (toggle) por categoría de piezas, cada uno con su
     punto de color; luego "Modo de vista" con 3 botones (Vista general, Primer plano, Vista
     lateral; el activo con borde azul); luego "Animación" con "Paso a paso" (toggle + botón de
     play circular) y un botón "Reiniciar".
   - Escena: SVG sobre fondo azul noche. Elementos con volumen (esferas hechas de cientos de
     círculos pequeños con degradado radial, sombra y borde oscuro fino para dar rugosidad
     proteica), hebra de ADN en doble hélice si el tema la incluye, y rótulos con recuadro de
     borde fino del color de cada pieza (título en negrita del color + detalle en blanco),
     unidos por líneas guía finas. Debajo del modelo, llamadas con texto blanco y llaves o
     flechas (ej. "Región…", "Sitio de…"). Incluir 5′/3′ si corresponde. Cada pieza es clickeable.
3. Tres tarjetas en fila (en celular, una debajo de otra):
   a. "¿Qué hace cada elemento?": 3 filas con ícono circular de color + título de color + 2–3
      líneas de descripción (palabras clave en negrita).
   b. "¿Qué es cada elemento?": una fila por pieza con círculo de color, nombre en negrita del
      color y descripción corta a la derecha.
   c. Un esquema SVG pequeño del tema + recuadro "Tipos de …" con dos columnas de listas con viñetas.
4. Pie: píldora redondeada con ícono de bombilla y "Dato clave: …" (a la izquierda) y, a la
   derecha, paginador "‹  1 / N  ›" con dos botones cuadrados redondeados. El paginador recorre
   los pasos de la guía y resalta las piezas de cada paso.
5. Pestañas: "Explicación" = los pasos en orden con su texto; "Comparador" = tabla que compara
   2–3 elementos del tema; "Preguntas" = quiz de opción múltiple (4 opciones, una correcta,
   explicación al responder, puntaje final con botón "Reintentar").

ESTILO (respetalo al pie de la letra)
- Fondo de página #040a1f con resplandores radiales azul y violeta muy suaves.
- Tarjetas y paneles: fondo rgba(8,20,54,.9), borde 1px #25438c / #27458f, radio 16–22px.
- Texto principal #e3ebff; secundario #a9c1f2 / #b6c8f4. Tipografía sans-serif del sistema.
- Colores de piezas (usá uno distinto por categoría, mantené estos para las primeras):
  azul #3d8bff, naranja #ff9a2e, verde #1fd6a5, violeta #9b6dff, rosa #ff4f8b, amarillo #ffc23d.
- Interruptores y botones activos en azul #3f66ff → #2f4de6 con resplandor.
- Diseño de referencia para pantalla ≥ 761px. En celular (< 760px): chips de capas, escena
  compacta con pines numerados, tarjetas apiladas, navegación inferior fija.
- Respetar prefers-reduced-motion. Textos en español rioplatense, claros y breves.

MODELO DE DATOS (definilo arriba del archivo, así se puede editar sin tocar el dibujo)
- PIEZAS: { id: { capa, nombre, tipo, color, texto, dato } }
- PASOS: [{ titulo, piezas:[ids], texto, clave }]
- CAPAS: [[id, etiqueta, color]]
- PREGUNTAS: [{ q, o:[4 opciones], ok:índice_correcto, exp }]   (variá la posición de la correcta)
- COMPARADOR: filas y columnas de la tabla

REGLAS
- Contenido 100% basado en el material; si falta un dato, omitilo en vez de inventarlo.
- No uses imágenes externas ni CDN. No uses localStorage.
- Cada pieza debe poder activarse/desactivarse desde su capa y resaltarse al hacer clic.
- Antes de responder, revisá que el código no tenga errores de sintaxis y que todas las
  funciones y variables que uses estén definidas.
````
