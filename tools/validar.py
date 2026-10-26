#!/usr/bin/env python3
"""
validar.py: revisa que los archivos de preguntas/tarjetas tengan el formato correcto.

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
ACTIVIDADES = {"replicacion", "cuadro", "horquilla", "bases", "crucigrama"}   # actividades interactivas que conoce la app (carpeta js/)

# Frases que delatan una explicación atada al orden de las opciones.
# La app mezcla las opciones, así que "la opción B" dejaría de tener sentido.
REF_LETRA = re.compile(r"\b(opci[oó]n|alternativa|inciso|respuesta)\s+[A-D]\b", re.IGNORECASE)
COMODINES = re.compile(
    r"\b(todas las anteriores|ninguna de las anteriores|ambas son correctas|a y b)\b", re.IGNORECASE
)


def validar_cuadro(c):
    """Revisa el objeto "cuadro" de la actividad de cuadro comparativo."""
    e = "Cuadro: "
    if not isinstance(c, dict):
        return [e + 'falta el objeto "cuadro" (el tema declara la actividad "cuadro").']
    errores = []
    cols = c.get("columnas")
    filas = c.get("filas")
    if not isinstance(cols, list) or len(cols) < 2:
        return [e + '"columnas" debe ser una lista de al menos 2 columnas.']
    for i, col in enumerate(cols, start=1):
        nombre = col if isinstance(col, str) else (col or {}).get("nombre") if isinstance(col, dict) else None
        if not isinstance(nombre, str) or not nombre.strip():
            errores.append(e + f"la columna {i} no tiene nombre.")
    if not isinstance(filas, list) or len(filas) < 2:
        errores.append(e + '"filas" debe ser una lista de al menos 2 filas.')
        return errores
    for n, f in enumerate(filas, start=1):
        if not isinstance(f, dict) or not isinstance(f.get("aspecto"), str) or not f["aspecto"].strip():
            errores.append(e + f'la fila {n} necesita "aspecto".')
            continue
        celdas = f.get("celdas")
        if not isinstance(celdas, list) or len(celdas) != len(cols):
            errores.append(e + f'la fila {n} ("{f["aspecto"]}") debe tener {len(cols)} celdas (tiene {len(celdas) if isinstance(celdas, list) else 0}).')
        elif not all(isinstance(t, str) and t.strip() for t in celdas):
            errores.append(e + f'la fila {n} ("{f["aspecto"]}") tiene celdas vacías.')
    return errores


def validar_crucigrama(c):
    """Devuelve (errores, avisos) del crucigrama o de una lista de crucigramas."""
    if isinstance(c, list):
        errores, avisos = [], []
        for n, item in enumerate(c, start=1):
            e, a = validar_crucigrama(item)
            errores.extend(f"Crucigrama {n}: {x}" for x in e)
            avisos.extend(f"Crucigrama {n}: {x}" for x in a)
        if not c:
            avisos.append("La lista de crucigramas está vacía.")
        return errores, avisos
    e = "Crucigrama: "
    if not isinstance(c, dict):
        return [e + 'tiene que ser un objeto con "titulo" y "palabras".'], []
    palabras = c.get("palabras")
    if not isinstance(palabras, list):
        return [e + 'falta la lista "palabras".'], []
    validas = 0
    avisos = []
    for n, p in enumerate(palabras, start=1):
        resp = p.get("respuesta") if isinstance(p, dict) else None
        pista = p.get("pista") if isinstance(p, dict) else None
        if not isinstance(resp, str) or not resp.strip() or not isinstance(pista, str) or not pista.strip():
            avisos.append(e + f'la palabra {n} necesita "respuesta" y "pista"; se va a ignorar.')
        else:
            validas += 1
    if validas < 4:
        avisos.append(e + f"tiene {validas} palabras válidas y hacen falta al menos 4 para armar el tablero.")
    return [], avisos


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
    tarjetas = datos.get("tarjetas")

    if preguntas is not None and not isinstance(preguntas, list):
        errores.append('"preguntas" debe ser una lista.')
        preguntas = []
    elif preguntas is None:
        preguntas = []

    if tarjetas is not None and not isinstance(tarjetas, list):
        errores.append('"tarjetas" debe ser una lista.')
        tarjetas = []
    elif tarjetas is None:
        tarjetas = []

    tiene_crucigrama = isinstance(datos.get("crucigrama"), (dict, list))
    if not preguntas and not tarjetas and not tiene_crucigrama:
        errores.append('El tema debe contener al menos una pregunta, una tarjeta o un crucigrama.')
        return errores, avisos, 0, datos

    # Actividades interactivas (opcional): texto o lista de textos
    actividad = datos.get("actividad")
    claves = [actividad] if isinstance(actividad, str) else (actividad if isinstance(actividad, list) else [])
    if actividad is not None and not isinstance(actividad, (str, list)):
        errores.append('"actividad" debe ser un texto o una lista de textos.')
    for clave in claves:
        if clave not in ACTIVIDADES:
            avisos.append(f'"actividad": "{clave}" no existe (disponibles: {", ".join(sorted(ACTIVIDADES))}).')
    if "cuadro" in claves:
        errores.extend(validar_cuadro(datos.get("cuadro")))
    if "crucigrama" in claves or "crucigrama" in datos:
        e_c, a_c = validar_crucigrama(datos.get("crucigrama"))
        errores.extend(e_c)
        avisos.extend(a_c)

    # Validación de preguntas
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
            if any(COMODINES.search(o) for o in normales):
                avisos.append(e + 'evitá opciones tipo "todas las anteriores": la app mezcla el orden.')

        c = p.get("correcta")
        if not isinstance(c, str) or c.strip().upper() not in tuple(LETRAS):
            errores.append(e + '"correcta" debe ser una sola letra: "A", "B", "C" o "D".')

        expl = p.get("explicacion")
        if not isinstance(expl, str) or not expl.strip():
            avisos.append(e + 'no tiene "explicacion" (se recomienda para estudiar).')
        elif REF_LETRA.search(expl):
            avisos.append(e + 'la explicación menciona una letra de opción; la app mezcla el orden.')

    # Validación de tarjetas
    for n, t in enumerate(tarjetas, start=1):
        e = f"Tarjeta {n}: "
        if not isinstance(t, dict):
            errores.append(e + "debe ser un objeto { ... }.")
            continue
        frente = t.get("frente") or t.get("pregunta")
        dorso = t.get("dorso") or t.get("respuesta")
        if not isinstance(frente, str) or not frente.strip():
            errores.append(e + 'falta el frente.')
        if not isinstance(dorso, str) or not dorso.strip():
            errores.append(e + 'falta el dorso.')

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