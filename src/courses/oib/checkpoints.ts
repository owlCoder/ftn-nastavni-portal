import type { Checkpoint } from '../types'

export const oibCheckpoints: Checkpoint[] = [
  {
    "id": "oib-kt1",
    "code": "KT1",
    "title": "Scope, model i pokrenut projekat",
    "exercises": [
      1,
      2
    ],
    "date": "Kraj 2. nedelje",
    "dateLabel": "Termin",
    "summary": "Tim utvrđuje obuhvat svih dodeljenih celina, zajednički model i početne ugovore, pokreće projekat i pokazuje prvo izvršivo pravilo.",
    "itemsHeading": "Obavezno za sve timove",
    "orderedItems": true,
    "items": [
      "Za SVAKU dodeljenu celinu: lista use-case-ova iz specifikacije, redosled implementacije i označeni preduslovi (TAPIZ backlog).",
      "Jedan objedinjeni domen model / skica toka, ključni entiteti, statusi i vlasništvo podataka; minimalna security matrica Subject–Action–Resource–Allow/Deny za relevantne operacije.",
      "Prva mapa međutimskih zavisnosti: owner, consumer, minimalni API/event/policy ugovor u DRAFT stanju (ako postoji granica).",
      "Repozitorijum: osnovna struktura aplikacije, README sa startovanjem, build koji prolazi, početni CI i Tapiz task → branch → PR praksa.",
      "Jedno izvršivo pravilo ili minimalni test domenske invarijante."
    ],
    "presentation": "5–7 minuta; model, backlog, dokaz da se projekat build-uje, jedan test i konkretan plan KT2.",
    "notRequired": [
      "Završen MFA.",
      "Detections engine.",
      "Full frontend.",
      "Finalne integracije."
    ]
  },
  {
    "id": "oib-kt2",
    "code": "KT2",
    "title": "Prvi vertikalni scenario",
    "exercises": [
      3,
      4
    ],
    "date": "Kraj 4. nedelje",
    "dateLabel": "Termin",
    "summary": "Primarna celina ima prvi zaokružen funkcionalan tok, serversku zaštitu i negativan automatski test. Model pretnji obuhvata sve dodeljene celine.",
    "itemsHeading": "Obavezno za sve timove",
    "orderedItems": true,
    "items": [
      "Primarna celina: najmanje jedan zaokružen funkcionalan tok koji prolazi kroz aplikacionu logiku i persistence/simulator, sa demonstracijom normalnog ishoda; za jednostavnije celine očekuju se bar dve ključne operacije (npr. unos + promena statusa).",
      "Serverska zaštita konkretne operacije (scope/ownership/role prema domenu), validacija ulaza i jedan AUTOMATIZOVAN negativni test; ne smatra se dovoljnom zaštita samo kroz UI.",
      "Threat model svih dodeljenih celina: asset → misuse/pretnja → kontrola → test → evidence, uz prikaz bar jedne trust granice.",
      "Migracije/seed ili ekvivalentno ponovljivo testno stanje; strukturisani događaj/audit za relevantnu promenu bez tajni.",
      "Minimalni cross-team ugovor pregledan sa susednim timom; ako implementacija nije spremna, stub + pozitivni i negativni odgovor."
    ],
    "presentation": "Pokrenut normalan scenario i negativan automatski test.",
    "notRequired": [
      "Puna realizacija druge/treće celine.",
      "Produkcioni simulator."
    ]
  },
  {
    "id": "oib-kt3",
    "code": "KT3",
    "title": "Druga celina i povezivanje",
    "exercises": [
      5,
      6
    ],
    "date": "Kraj 6. nedelje",
    "dateLabel": "Termin",
    "summary": "Prva i druga dodeljena celina imaju izvršive tokove, provereno povezivanje i ugovor gde postoji međutimska zavisnost. Timovi sa tri celine prikazuju minimalni izvršiv prototip treće celine.",
    "itemsHeading": "Obavezno za sve timove",
    "orderedItems": true,
    "items": [
      "Izvršiv ključni funkcionalni tok iz PRVE i DRUGE dodeljene celine i način na koji su povezane (ili legitimno nezavisne, ali sa jasnim zajedničkim bezbednosnim scenarijem).",
      "Pozitivan + negativan automatski test toka; odgovarajući audit event, kontrolisana greška i prolazak kroz CI.",
      "Bar jedan dogovoreni među-timski contract/security test gde zavisnost postoji; stubbing privremeno dozvoljen uz dokaz ugovora.",
      "Dokumentovana ograničenja i plan prelaska sa stub-a na adapter."
    ],
    "additionalRequirements": [
      {
        "title": "Dodatno za timove sa 3 celine",
        "items": [
          "Treća celina ima izvršiv prototip JEDNOG ključnog use-case-a/pravila/odluke; ne traži se ceo R3 podsistem u ovom trenutku."
        ]
      }
    ],
    "presentation": "Jedan povezani scenario, negative test i ugovor sa drugim timom."
  },
  {
    "id": "oib-kt4",
    "code": "KT4",
    "title": "Finalna demonstracija i security QA",
    "exercises": [
      7,
      8
    ],
    "date": "Kraj 8. nedelje",
    "dateLabel": "Termin",
    "summary": "Tim demonstrira sve obavezne use-case-ove aktivnog/odobrenog scope-a, dokazuje bezbednosne odluke i ponovljivo pokretanje i predaje ažurnu dokumentaciju. Normativni obim ostaje obavezan dok nastavni tim ne objavi formalnu reviziju.",
    "itemsHeading": "Obavezno za sve timove",
    "orderedItems": true,
    "items": [
      "Svi obavezni use-case-ovi AKTIVNOG/ODOBRENOG scope-a celina; ako se puni normativni scope iz SCUTUM specifikacije smanjuje, NASTAVNI TIM mora to unapred eksplicitno objaviti kao reviziju.",
      "End-to-end demo: početno stanje → akcija → odluka dozvoli/odbij → relevantan security/audit trag → konačan status.",
      "Unit + negativni security + odgovarajući integracioni/contract testovi po relevantnoj celini, CI green, dokumentovane revizije PR.",
      "Clean clone, migracije i seed/demo podaci rade prema README-u.",
      "API/event/policy ugovori, threat model, ADR, evidencija testiranja, individualni doprinosi i residual risk su ažurni.",
      "Cross-team integracija sa realnim adapterom gde je dostupna; samo stub ne prikazivati kao završenu realnu integraciju."
    ],
    "additionalRequirements": [
      {
        "title": "Dodatno za timove sa 3 celine",
        "items": [
          "Treća celina mora imati javno odobren opseg i izvršiv bezbednosni tok sa automatizovanim testovima; kompletan normativni obim je obavezan osim ako je nastavni tim formalno promenio specifikaciju."
        ]
      }
    ]
  }
]
