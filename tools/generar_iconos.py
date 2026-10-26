#!/usr/bin/env python3
"""Genera iconos PWA de 192 y 512 px desde ico.png en la raíz del repo.

El workflow omite este paso mientras ico.png no exista. Si la imagen no es
cuadrada, se centra en un lienzo cuadrado transparente para no recortar el diseño.
"""
from pathlib import Path
import sys

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ORIGEN = ROOT / "ico.png"
DESTINO = ROOT / "icons"


def main() -> int:
    if not ORIGEN.is_file():
        print("No existe ico.png; no se regeneran los iconos.")
        return 0

    try:
        with Image.open(ORIGEN) as original:
            original.load()
            imagen = original.convert("RGBA")
    except Exception as exc:
        print(f"ERROR: no se pudo leer ico.png como imagen PNG válida: {exc}")
        return 1

    if imagen.width < 1 or imagen.height < 1:
        print("ERROR: ico.png tiene dimensiones inválidas.")
        return 1

    lado = max(imagen.width, imagen.height)
    if imagen.size != (lado, lado):
        lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
        lienzo.alpha_composite(
            imagen,
            ((lado - imagen.width) // 2, (lado - imagen.height) // 2)
        )
        imagen = lienzo

    DESTINO.mkdir(parents=True, exist_ok=True)
    for tamano in (192, 512):
        icono = imagen.resize((tamano, tamano), Image.Resampling.LANCZOS)
        ruta = DESTINO / f"parcialito-{tamano}.png"
        icono.save(ruta, format="PNG", optimize=True)
        print(f"Icono actualizado: {ruta.relative_to(ROOT)} ({tamano}x{tamano})")

    return 0


if __name__ == "__main__":
    sys.exit(main())
