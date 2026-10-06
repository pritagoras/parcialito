#!/usr/bin/env python3
"""
validar.py: revisa que los archivos de preguntas tengan el formato correcto.

Uso:
    python tools/validar.py                      # revisa todo data/
    python tools/validar.py data/materia/tema.json   # revisa un archivo

Errores  = el archivo no sirve (hay que corregirlo).
Avisos   = el archivo anda, pero conviene revisar algo.
"""

import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATA = RAIZ / "data"
LETRAS = "ABCD"

# Frases que delatan una explicación atada al orden de las opciones.
# La app mezcla las opciones, así que "la opción B" dejaría de tener sentido.
REF_LETRA = re.compile(r"\b(opci[oó]n|alternativa|inciso|respuesta)\s+[A-D]\b", re.IGNORECASE)
COMODINES = ("todas las anteriores", "ninguna de las anteriores", "ambas son correctas", "a y b")


def validar_archivo(ruta: Path):
    """Devuelve (errores, avisos, cantidad_de_preguntas, datos_o_None)."""
    errores, avisos = [], []

    try:
        datos = json.loads(ruta.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"JSON inválido (línea {e.lineno}, columna {e.colno}): {e.msg}"], [], 0, None
    except UnicodeDecodeError:
        return ["El archivo no está en UTF-8."], [], 0, None

    if not isinstance(datos, dict):
        return ["La raíz del archivo debe ser un objeto { ... }."], [], 0, None

    for campo in ("materia", "tema"):
        if not isinstance(datos.get(campo), str) or not datos[campo].strip():
            errores.append(f'Falta el campo "{campo}" (texto no vacío).')

    preguntas = datos.get("preguntas")
    if not isinstance(preguntas, list) or not preguntas:
        errores.append('"preguntas" debe ser una lista con al menos una pregunta.')
        return errores, avisos, 0, datos

    vistas = set()
    for n, p in enumerate(preguntas, start=1):
        e = f"Pregunta {n}: "
        if not isinstance(p, dict):
            errores.append(e + "debe ser un objeto { ... }.")
            continue

        texto = p.get("pregunta")
        if not isinstance(texto, str) or not texto.strip():
            errores.append(e + 'falta "pregunta".')
        else:
            clave = " ".join(texto.lower().split())
            if clave in vistas:
                avisos.append(e + "el enunciado está repetido en este archivo.")
            vistas.add(clave)

        ops = p.get("opciones")
        if not isinstance(ops, list) or len(ops) != 4:
            errores.append(e + f'"opciones" debe tener exactamente 4 elementos (tiene {len(ops) if isinstance(ops, list) else 0}).')
        elif not all(isinstance(o, str) and o.strip() for o in ops):
            errores.append(e + "todas las opciones deben ser texto no vacío.")
        else:
            normales = [" ".join(o.lower().split()) for o in ops]
            if len(set(normales)) < 4:
                errores.append(e + "hay opciones repetidas.")
            if any(c in o for o in normales for c in COMODINES):
                avisos.append(e + 'evitá opciones tipo "todas las anteriores": la app mezcla el orden.')

        c = p.get("correcta")
        if not isinstance(c, str) or c.strip().upper() not in tuple(LETRAS):
            errores.append(e + '"correcta" debe ser una sola letra: "A", "B", "C" o "D".')

        expl = p.get("explicacion")
        if not isinstance(expl, str) or not expl.strip():
            avisos.append(e + 'no tiene "explicacion" (se recomienda para estudiar).')
        elif REF_LETRA.search(expl):
            avisos.append(e + 'la explicación menciona una letra de opción; la app mezcla el orden.')

    return errores, avisos, len(preguntas), datos


def archivos_de_preguntas():
    """Todos los .json de data/<materia>/ que no empiezan con guion bajo."""
    return sorted(
        f
        for carpeta in DATA.iterdir()
        if carpeta.is_dir() and not carpeta.name.startswith((".", "_"))
        for f in carpeta.glob("*.json")
        if not f.name.startswith("_")
    )


def main(argv):
    rutas = [Path(a) for a in argv] if argv else archivos_de_preguntas()
    if not rutas:
        print("No hay archivos de preguntas en data/.")
        return 0

    hay_errores = False
    for ruta in rutas:
        errores, avisos, n, _ = validar_archivo(ruta)
        rel = ruta.resolve().relative_to(RAIZ) if ruta.resolve().is_relative_to(RAIZ) else ruta
        estado = "ERROR" if errores else ("aviso" if avisos else "ok")
        print(f"[{estado:>5}] {rel}  ({n} preguntas)")
        for m in errores:
            print(f"         x {m}")
        for m in avisos:
            print(f"         ! {m}")
        hay_errores = hay_errores or bool(errores)

    return 1 if hay_errores else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
