#!/usr/bin/env python3
"""
actualizar_indice.py: recorre data/ y genera data/index.json.

Estructura esperada:
    data/
      <carpeta-de-materia>/
        _materia.json        (opcional: nombre, emoji, color y orden de la materia)
        01-primer-tema.json
        02-segundo-tema.json

Uso:
    python tools/actualizar_indice.py

Antes de generar el índice valida todos los archivos; si hay errores, no escribe nada.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from validar import DATA, RAIZ, archivos_de_preguntas, validar_archivo


def leer_meta_materia(carpeta: Path) -> dict:
    ruta = carpeta / "_materia.json"
    if not ruta.exists():
        return {}
    try:
        meta = json.loads(ruta.read_text(encoding="utf-8"))
        return meta if isinstance(meta, dict) else {}
    except json.JSONDecodeError as e:
        print(f"  ! {ruta.relative_to(RAIZ)} tiene JSON inválido ({e.msg}); se ignora.")
        return {}


def main() -> int:
    if not DATA.exists():
        print("No existe la carpeta data/.")
        return 1

    archivos = archivos_de_preguntas()
    hay_errores = False
    por_materia = {}

    for ruta in archivos:
        errores, avisos, n, datos = validar_archivo(ruta)
        rel = ruta.relative_to(RAIZ)
        if errores:
            hay_errores = True
            print(f"[ERROR] {rel}")
            for m in errores:
                print(f"   x {m}")
            continue
        for m in avisos:
            print(f"[aviso] {rel}: {m}")
        por_materia.setdefault(ruta.parent, []).append((ruta, datos, n))

    if hay_errores:
        print("\nNo se generó el índice: corregí los errores de arriba.")
        return 1

    metas = {c: leer_meta_materia(c) for c in por_materia}

    def clave_orden(carpeta):
        orden = metas[carpeta].get("orden")
        return (orden if isinstance(orden, (int, float)) else 9999, carpeta.name)

    materias = []
    for carpeta in sorted(por_materia, key=clave_orden):
        temas_archivo = por_materia[carpeta]
        meta = metas[carpeta]
        primer_json = temas_archivo[0][1]
        materia = {
            "id": carpeta.name,
            "nombre": meta.get("nombre") or primer_json["materia"],
            "emoji": meta.get("emoji", "📚"),
        }
        if meta.get("color"):
            materia["color"] = meta["color"]
        materia["temas"] = []

        for ruta, datos, n in temas_archivo:
            n_tarjetas = len(datos.get("tarjetas", [])) if isinstance(datos.get("tarjetas"), list) else 0
            item = {
                "id": f"{carpeta.name}/{ruta.stem}",
                "nombre": datos["tema"],
                "archivo": ruta.relative_to(RAIZ).as_posix(),
                "preguntas": n,
            }
            if n_tarjetas > 0:
                item["tarjetas"] = n_tarjetas
            act = datos.get("actividad")
            if isinstance(act, str) and act.strip():
                item["actividad"] = act.strip()
            elif isinstance(act, list):
                lista_act = [a.strip() for a in act if isinstance(a, str) and a.strip()]
                if lista_act:
                    item["actividad"] = lista_act
            materia["temas"].append(item)

        materias.append(materia)

    indice = {
        "generado": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "materias": materias,
    }
    destino = DATA / "index.json"
    destino.write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total_temas = sum(len(m["temas"]) for m in materias)
    total_preg = sum(t["preguntas"] for m in materias for t in m["temas"])
    total_tarj = sum(t.get("tarjetas", 0) for m in materias for t in m["temas"])
    print(
        f"Listo: {len(materias)} materias, {total_temas} temas, {total_preg} preguntas, {total_tarj} tarjetas -> {destino.relative_to(RAIZ)}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())