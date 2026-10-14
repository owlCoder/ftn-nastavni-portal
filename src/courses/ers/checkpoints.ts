import type { Checkpoint } from '../types'

export const ersCheckpoints: Checkpoint[] = [
  {
    "id": "ers-kt1",
    "code": "KT1",
    "title": "Osnovna implementacija",
    "exercises": [
      1,
      4
    ],
    "date": "Vežba 4",
    "dateLabel": "Termin",
    "points": 10,
    "summary": "Prva kontrolna tačka održava se u terminu 4. vežbe i proverava osnovnu implementaciju svih dodeljenih celina.",
    "items": [
      "Repozitorijum i pokretanje projekta; strukturiran Tapiz backlog i podela rada.",
      "Osnovni domenski model, poslovna pravila i API/contract granice za sve dodeljene celine.",
      "Najmanje jedan izvršiv funkcionalni tok i automatizovani test značajnog pravila.",
      "Dogovor sa zavisnim timovima ili kontrolisani stub kada zavisna komponenta nije spremna."
    ]
  },
  {
    "id": "ers-kt2",
    "code": "KT2",
    "title": "Završna demonstracija",
    "exercises": [
      5,
      8
    ],
    "date": "Vežba 8",
    "dateLabel": "Termin",
    "points": 10,
    "summary": "Druga kontrolna tačka održava se u terminu 8. vežbe i obuhvata završnu demonstraciju svake dodeljene celine u odobrenom obimu.",
    "items": [
      "Realizovani obavezni use-case-ovi svake dodeljene celine u odobrenom obimu.",
      "Pozitivni i negativni testovi, integracija, build/CI i pregledani Pull Request-ovi.",
      "Ponovljivo pokretanje sa demo podacima i demonstracija zaokruženog poslovnog procesa.",
      "Poštovanje vlasništva nad podacima, prava pristupa i tenant izolacije gde je primenljivo."
    ]
  }
]
