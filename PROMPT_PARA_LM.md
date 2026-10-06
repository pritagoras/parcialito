# Prompt para generar preguntas con un LM

Copiá el bloque de abajo, completá los campos entre `[corchetes]` y pegalo en el LM
(Claude, ChatGPT, Gemini, etc.) junto con tu material de estudio: apuntes, texto de la
clase, un PDF adjunto o las diapositivas.

El LM te devuelve **un único archivo JSON**. Guardalo con la extensión `.json` dentro de
`data/<carpeta-de-la-materia>/` y corré `python tools/actualizar_indice.py`.

---

## Prompt

````text
Actuá como un docente universitario que arma preguntas de opción múltiple para un
parcial. Generá preguntas EXCLUSIVAMENTE a partir del material que te paso al final.
No uses conocimiento externo: si algo no está en el material, no lo preguntes.

DATOS
- Materia: [nombre de la materia, ej. Biología Celular y Molecular]
- Tema: [nombre del tema o clase, ej. Clase 3: Membrana plasmática]
- Cantidad de preguntas: [N, ej. 20]

REGLAS DE LAS PREGUNTAS
1. Cada pregunta tiene EXACTAMENTE 4 opciones y UNA sola correcta.
2. Los distractores (opciones incorrectas) deben ser plausibles: conceptos reales del
   mismo tema que un alumno podría confundir. Nada absurdo ni evidentemente falso.
3. Las 4 opciones deben tener longitud y estilo parecidos. La correcta no debe ser
   siempre la más larga ni la más detallada.
4. Variá la letra de la respuesta correcta: que A, B, C y D aparezcan más o menos
   parejo en todo el conjunto.
5. Prohibido usar "todas las anteriores", "ninguna de las anteriores", "A y B" o
   similares. Cada opción debe poder leerse sola.
6. Evitá negaciones ("¿cuál NO es...?") salvo que sea lo que mejor evalúa el concepto.
7. Cubrí todo el material de forma pareja, y mezclá niveles: definiciones, relaciones
   entre conceptos, aplicación a un caso y comparaciones.
8. No repitas preguntas ni hagas dos preguntas que se respondan entre sí.
9. Cada pregunta lleva una "explicacion" de 1 a 3 oraciones: por qué la respuesta
   correcta es correcta y, si sirve, por qué falla el distractor más tentador.
   NUNCA menciones letras ni posiciones en la explicación ("la opción B", "la
   primera"): la app mezcla el orden de las opciones al jugar.
10. Escribí en español rioplatense neutro, con ortografía y tildes correctas, y
    respetá los términos técnicos tal como aparecen en el material.

FORMATO DE SALIDA (obligatorio)
Respondé SOLO con un bloque de código JSON válido. Sin texto antes ni después, sin
comentarios dentro del JSON, sin comas finales. Usá comillas dobles y escapá las
comillas internas con \". Estructura exacta:

{
  "materia": "[misma materia de arriba]",
  "tema": "[mismo tema de arriba]",
  "preguntas": [
    {
      "pregunta": "Texto del enunciado",
      "opciones": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
      "correcta": "C",
      "explicacion": "Por qué es correcta."
    }
  ]
}

Reglas del formato:
- "correcta" es UNA sola letra mayúscula: "A", "B", "C" o "D". Corresponde a la
  posición dentro de "opciones" (A = primera, B = segunda, C = tercera, D = cuarta).
- Las opciones NO llevan prefijo de letra ni numeración: nada de "A) ..." ni "1.".
- Antes de responder, revisá una por una que la letra de "correcta" apunte a la
  opción que de verdad es correcta.

MATERIAL DE ESTUDIO
[pegá acá tu texto, o adjuntá el archivo]
````

---

## Para crear una materia nueva

Cada materia es una carpeta dentro de `data/`. Para que tenga nombre, emoji y color
propios, agregá un archivo `_materia.json` (es opcional). Podés pedírselo al LM:

````text
Generá un JSON con este formato para la materia "[nombre]". Elegí un emoji que la
represente y un color en hexadecimal (#RRGGBB) con buen contraste sobre fondo oscuro.
Respondé solo con el bloque JSON.

{
  "nombre": "[nombre]",
  "emoji": "🧬",
  "color": "#9B7BFF"
}
````

## Consejos para mejores resultados

- **Un tema por archivo y por pedido.** Entre 10 y 25 preguntas por vez funciona mejor
  que 100 de golpe: el LM mantiene la calidad y es más fácil revisar.
- **Pedí más de las que necesitás** y descartá las dudosas.
- **Revisá siempre las respuestas.** Un LM puede equivocarse aunque tenga el material
  delante. El validador (`python tools/validar.py`) controla el formato, no la verdad.
- **Si ya tenés preguntas hechas** (por ejemplo de parciales viejos), pegalas en lugar
  del material y cambiá la consigna a: "Convertí las siguientes preguntas al formato
  JSON de abajo, sin cambiar su contenido. Si falta alguna explicación, redactala vos
  basándote en la respuesta correcta."
- **Nombre del archivo:** numerá los archivos para controlar el orden en que aparecen
  (`01-membrana.json`, `02-mitocondria.json`, ...).
