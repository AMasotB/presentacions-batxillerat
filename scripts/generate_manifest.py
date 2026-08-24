#!/usr/bin/env python3
"""
Genera manifest.json a partir del contingut real de les carpetes
activitats/ i pau/, organitzades per BLOC (no per tema).

Estructura esperada al repo:
    activitats/bloc-01/01_Activitat_Globalitzacio.pdf
    activitats/bloc-02/23_Activitat_Geotermica.pdf
    pau/bloc-01/model_examen.pdf

Convenció recomanada pel nom del fitxer (opcional però útil per
l'alumnat): prefixa'l amb el número de tema dins el bloc, ex.
"01_Activitat_Globalitzacio.pdf" per identificar-lo com a tema 1.

Resultat (manifest.json a l'arrel del repo):
    {
      "activitats": {
        "bloc-01": ["01_Activitat_Globalitzacio.pdf"],
        "bloc-02": ["23_Activitat_Geotermica.pdf"]
      },
      "pau": {
        "bloc-01": ["model_examen.pdf"]
      }
    }

S'executa automàticament via GitHub Action en cada push. No cal
executar-lo a mà.
"""
import json
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KINDS = ["activitats", "pau"]
BLOCS = ["bloc-01", "bloc-02", "bloc-03", "bloc-04"]
OUTPUT_PATH = os.path.join(REPO_ROOT, "manifest.json")


def scan_kind(kind):
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
    manifest = {kind: scan_kind(kind) for kind in KINDS}

    with open(OUTPUT_PATH, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    total = sum(len(files) for kind in manifest.values() for files in kind.values())
    print(f"manifest.json generat amb {total} fitxers.")


if __name__ == "__main__":
    main()
