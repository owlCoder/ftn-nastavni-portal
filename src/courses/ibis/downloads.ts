import type { CoursePresentations, ProjectDocument } from '../types'

export const ibisPresentations: CoursePresentations = {
  "kind": "downloads",
  "downloads": [
    {
      "number": "01",
      "label": "Predavanje 1",
      "title": "SCADA sistemi — arhitektura, procesi, prikazi, konfiguracija i bezbednost",
      "pages": 56,
      "size": "900 KB",
      "file": "/downloads/ibis-prezentacije/01_SCADA_sistemi.pdf"
    },
    {
      "number": "02",
      "label": "Predavanje 2",
      "title": "Javno dostupni podaci u bezbednosti SCADA sistema",
      "pages": 47,
      "size": "716 KB",
      "file": "/downloads/ibis-prezentacije/02_Javno_dostupni_podaci.pdf"
    }
  ]
}

export const ibisProjects: ProjectDocument[] = [
  {
    "code": "SCADALattice",
    "title": "Modularna SCADA platforma za simulaciju, nadzor i upravljanje fizičkim procesima",
    "description": "Tehnička specifikacija projekta na predmetu Informaciona bezbednost infrastrukturnih sistema.",
    "file": "/downloads/ibis-projekti/SCADALattice_Tehnicka_specifikacija.pdf",
    "pages": 25,
    "size": "588 KB",
    "highlights": [
      "Modularnost",
      "SOLID",
      "Clean Architecture"
    ]
  },
  {
    "code": "RackMetria",
    "title": "Simulacija IT, elektroenergetske i rashladne infrastrukture data centra",
    "description": "Tehnička specifikacija projekta na predmetu Informaciona bezbednost infrastrukturnih sistema.",
    "file": "/downloads/ibis-projekti/RackMetria_Tehnicka_specifikacija.pdf",
    "pages": 24,
    "size": "602 KB",
    "highlights": [
      "Modularnost",
      "SOLID",
      "Clean Architecture"
    ]
  },
  {
    "code": "RouteMetria",
    "title": "Simulacija međunarodnih transportnih i logističkih procesa",
    "description": "Tehnička specifikacija projekta na predmetu Informaciona bezbednost infrastrukturnih sistema.",
    "file": "/downloads/ibis-projekti/RouteMetria_Tehnicka_specifikacija.pdf",
    "pages": 24,
    "size": "628 KB",
    "highlights": [
      "Modularnost",
      "SOLID",
      "Clean Architecture"
    ]
  }
]
