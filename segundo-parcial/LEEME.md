# Segundo parcial: dónde van los JSON

Pegá acá **un archivo `.json` por cada tanda de preguntas** (el mismo formato que
`PROMPT_PARA_LM.md`). Podés tener todos los archivos que quieras, separados por tema
o por clase: al tocar **Segundo parcial** en la app, se juntan todas las preguntas
de todos los archivos en un único juego.

## Cómo agregar preguntas

1. Generá el JSON con el LM (usá el prompt de `PROMPT_PARA_LM.md`).
2. Guardalo en esta carpeta con un nombre numerado, por ejemplo
   `02-transcripcion.json`, `03-traduccion.json`.
3. Subí los cambios a GitHub. Al publicar, el workflow corre
   `python tools/actualizar_indice.py`, que valida los archivos y arma
   `segundo-parcial/index.json` (la lista de archivos que lee la app).
   Si corrés el script en tu compu antes de subir, también funciona.

Si algún JSON tiene un error de formato, el deploy se frena y te avisa cuál es.

## Formato

```json
{
  "materia": "Segundo parcial",
  "tema": "Nombre del tema",
  "preguntas": [
    {
      "pregunta": "Texto del enunciado",
      "opciones": ["Opción 1", "Opción 2", "Opción 3", "Opción 4"],
      "correcta": "C",
      "explicacion": "Por qué es correcta."
    }
  ]
}
```

Nota: `segundo-parcial/index.json` se genera solo. No lo edites a mano.
