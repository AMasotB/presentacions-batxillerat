#!/usr/bin/env python3
"""
Genera manifest.json a partir del contingut real de les carpetes
activitats/ i pau/.

Estructura esperada al repo:
    activitats/B1_01/qualsevol_nom.pdf
    activitats/B2_23/una_altra_activitat.pdf
    pau/B1_01/model_examen.pdf

Resultat (manifest.json a l'arrel del repo):
    {
      "activitats": {
        "B1_01": ["qualsevol_nom.pdf"],
        "B2_23": ["una_altra_activitat.pdf"]
      },
      "pau": {
        "B1_01": ["model_examen.pdf"]
      }
    }

S'executa automàticament via GitHub Action en cada push. No cal
executar-lo a mà.
"""
import json
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KINDS = ["activitats", "pau"]
OUTPUT_PATH = os.path.join(REPO_ROOT, "manifest.json")


def scan_kind(kind):
    base = os.path.join(REPO_ROOT, kind)
    result = {}
    if not os.path.isdir(base):
        return result

    for topic_id in sorted(os.listdir(base)):
        topic_path = os.path.join(base, topic_id)
        if not os.path.isdir(topic_path):
            continue

        files = sorted(
            f for f in os.listdir(topic_path)
            if os.path.isfile(os.path.join(topic_path, f))
            and not f.startswith(".")
        )

        if files:
            result[topic_id] = files

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
