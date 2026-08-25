#!/usr/bin/env python3
"""
Genera manifest.json a partir del contingut real de les carpetes
infografies/, activitats/ i apunts/.

infografies/ és una llista PLANA (calaix de sastre, sense separar
per bloc). activitats/ i apunts/ segueixen separats per bloc.

Estructura esperada al repo:
    infografies/Mapa_globalitzacio.html
    infografies/Piramide_poblacio.html
    activitats/bloc-01/01_Activitat_Globalitzacio.pdf
    activitats/bloc-02/23_Activitat_Geotermica.pdf
    apunts/bloc-01/Resum_globalitzacio.pdf

Convenció recomanada pel nom del fitxer (opcional però útil per
l'alumnat): prefixa'l amb el número de tema dins el bloc, ex.
"01_Activitat_Globalitzacio.pdf" per identificar-lo com a tema 1.

Resultat (manifest.json a l'arrel del repo):
    {
      "infografies": ["Mapa_globalitzacio.html", "Piramide_poblacio.html"],
      "activitats": {
        "bloc-01": ["01_Activitat_Globalitzacio.pdf"],
        "bloc-02": ["23_Activitat_Geotermica.pdf"]
      },
      "apunts": {
        "bloc-01": ["Resum_globalitzacio.pdf"]
      }
    }

S'executa automàticament via GitHub Action en cada push. No cal
executar-lo a mà.
"""
import json
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOC_KINDS = ["activitats", "apunts"]
FLAT_KINDS = ["infografies"]
BLOCS = ["bloc-01", "bloc-02", "bloc-03", "bloc-04"]
OUTPUT_PATH = os.path.join(REPO_ROOT, "manifest.json")


def scan_flat(kind):
    """Llista plana: tots els fitxers directament dins la carpeta, sense subcarpetes de bloc."""
    base = os.path.join(REPO_ROOT, kind)
    if not os.path.isdir(base):
        return []

    return sorted(
        f for f in os.listdir(base)
        if os.path.isfile(os.path.join(base, f))
        and not f.startswith(".")
    )


def scan_by_bloc(kind):
    base = os.path.join(REPO_ROOT, kind)
    result = {}
    if not os.path.isdir(base):
        return result

    for bloc_id in BLOCS:
        bloc_path = os.path.join(base, bloc_id)
        if not os.path.isdir(bloc_path):
            continue

        files = sorted(
            f for f in os.listdir(bloc_path)
            if os.path.isfile(os.path.join(bloc_path, f))
            and not f.startswith(".")
        )

        if files:
            result[bloc_id] = files

    return result


def main():
    manifest = {}
    for kind in FLAT_KINDS:
        manifest[kind] = scan_flat(kind)
    for kind in BLOC_KINDS:
        manifest[kind] = scan_by_bloc(kind)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    flat_total = sum(len(manifest[k]) for k in FLAT_KINDS)
    bloc_total = sum(len(files) for k in BLOC_KINDS for files in manifest[k].values())
    print(f"manifest.json generat amb {flat_total + bloc_total} fitxers.")


if __name__ == "__main__":
    main()
