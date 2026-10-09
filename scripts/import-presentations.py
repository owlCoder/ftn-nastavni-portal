#!/usr/bin/env python3
"""Import only the PDF presentations from ersnovi.zip and oibnovi.zip.

Usage:
    python3 scripts/import-presentations.py /path/to/ersnovi.zip /path/to/oibnovi.zip

Keeps the filenames already referenced by src/courses/*/downloads.ts, never imports
PPTX, archives' source folders, macOS metadata or downloaded fonts. Run from repo
root and commit the resulting public/downloads/*-prezentacije/*.pdf changes.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from zipfile import ZipFile

ERS = {
    "Контролисан развој уз AI.pdf": "06_Kontrolisan_AI_workflow.pdf",
    "Пословна логика и слој случајева употребе.pdf": "03_Poslovna_logika_i_use_case.pdf",
    "SOLID принципи и Clean Architecture.pdf": "02_SOLID_i_Clean_Architecture.pdf",
    "Hooks, guardrails, евалуације и завршни QA.pdf": "08_Guardrails_evaluacije_i_QA.pdf",
    "Захтеви, backlog, Git и тимски развој.pdf": "01_Zahtevi_backlog_i_Git.pdf",
    "MCP над EquipmentReservation решењем.pdf": "07_MCP.pdf",
    "Основне информације о предмету и пројекту.pdf": "00_Osnovne_informacije.pdf",
    "Интеграција модула, уговори и подаци.pdf": "05_Integracija_modula_ugovori.pdf",
    "Тестабилни дизајн, NUnit, Moq и покривеност кода.pdf": "04_Testabilni_dizajn_NUnit_i_Moq.pdf",
}
OIB = {
    name: name for name in [
        "00_Osnovne_informacije.pdf",
        "01_Identitet_autentikacija_i_RBAC.pdf",
        "02_Autorizacija_nad_resursom_i_klasifikacija_podataka.pdf",
        "03_Politike_konfiguracija_i_vidljivost.pdf",
        "04_Imovina_granice_poverenja_i_threat_modeling.pdf",
        "05_MFA_sesije_servisi_i_tajne.pdf",
        "06_Detekcija_incident_i_ranjivosti.pdf",
        "07_Atributi_rizik_i_pregled_pristupa.pdf",
        "08_Korelacija_efektivnost_i_ucenje.pdf",
    ]
}

ROOT = Path(__file__).resolve().parents[1]


def decode_name(raw: str) -> str:
    try:
        return raw.encode("cp437").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return raw


def import_course(course: str, source: Path, mapping: dict[str, str], dry_run: bool) -> None:
    if not source.is_file():
        raise FileNotFoundError(source)
    destination = ROOT / "public" / "downloads" / f"{course}-prezentacije"
    staged: dict[str, bytes] = {}
    with ZipFile(source) as archive:
        for entry in archive.infolist():
            if entry.is_dir() or "__MACOSX" in entry.filename or not entry.filename.lower().endswith(".pdf"):
                continue
            filename = decode_name(entry.filename.rsplit("/", 1)[-1])
            result = mapping.get(filename)
            if not result:
                raise ValueError(f"Neočekivani PDF u {source.name}: {filename}")
            if result in staged:
                raise ValueError(f"Duplikat prezentacije: {result}")
            contents = archive.read(entry)
            if not contents.startswith(b"%PDF-") or b"%%EOF" not in contents[-2048:]:
                raise ValueError(f"Neispravan PDF: {filename}")
            staged[result] = contents
    missing = set(mapping.values()) - set(staged)
    if missing:
        raise ValueError(f"Nedostaju PDF prezentacije: {', '.join(sorted(missing))}")
    if len(staged) != len(mapping):
        raise ValueError("Neispravan broj PDF prezentacija.")
    print(f"{course.upper()}: {len(staged)} PDF fajlova")
    if not dry_run:
        destination.mkdir(parents=True, exist_ok=True)
    for name, data in sorted(staged.items()):
        print(f"  {name}: {len(data):,} B")
        if not dry_run:
            (destination / name).write_bytes(data)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("ers", type=Path, help="Zip sa ERS prezentacijama")
    parser.add_argument("oib", type=Path, help="Zip sa OIB prezentacijama")
    parser.add_argument("--dry-run", action="store_true", help="Samo provera, bez upisa")
    args = parser.parse_args()
    import_course("ers", args.ers, ERS, args.dry_run)
    import_course("oib", args.oib, OIB, args.dry_run)
