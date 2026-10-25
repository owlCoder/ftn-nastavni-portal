import type { Checkpoint } from '../types'

export const oibCheckpoints: Checkpoint[] = [
  {
    "id": "oib-kt1",
    "code": "KT1",
    "title": "Osnovna implementacija i bezbednosni model",
    "exercises": [
      1,
      4
    ],
    "date": "Vežba 4",
    "dateLabel": "Termin",
    "summary": "Prva kontrolna tačka održava se u terminu 4. vežbe. Tim prikazuje obuhvat svih dodeljenih celina, bezbednosni model i prvi zaokružen funkcionalni tok sa serverskom zaštitom i negativnim testom.",
    "itemsHeading": "Obavezno za sve timove",
    "orderedItems": true,
    "items": [
      "Za SVAKU dodeljenu celinu: lista use-case-ova iz specifikacije, redosled implementacije i označeni preduslovi (TAPIZ backlog).",
      "Jedan objedinjeni domen model / skica toka, ključni entiteti, statusi i vlasništvo podataka; minimalna security matrica Subject–Action–Resource–Allow/Deny za relevantne operacije.",
      "Repozitorijum: osnovna struktura aplikacije, README sa startovanjem, build koji prolazi, početni CI i Tapiz task → branch → PR praksa.",
      "Primarna celina: najmanje jedan zaokružen funkcionalan tok koji prolazi kroz aplikacionu logiku i persistence/simulator, sa demonstracijom normalnog ishoda; za jednostavnije celine očekuju se bar dve ključne operacije (npr. unos + promena statusa).",
      "Serverska zaštita konkretne operacije (scope/ownership/role prema domenu), validacija ulaza i jedan AUTOMATIZOVAN negativni test; ne smatra se dovoljnom zaštita samo kroz UI.",
      "Threat model svih dodeljenih celina: asset → misuse/pretnja → kontrola → test → evidence, uz prikaz bar jedne trust granice.",
      "Migracije/seed ili ekvivalentno ponovljivo testno stanje; strukturisani događaj/audit za relevantnu promenu bez tajni.",
      "Minimalni cross-team ugovor pregledan sa susednim timom; ako implementacija nije spremna, stub + pozitivni i negativni odgovor."
    ],
    "presentation": "Model i backlog, pokrenut normalan scenario, negativan automatski test i konkretan plan završetka do KT2 u terminu 8. vežbe.",
    "notRequired": [
      "Puna realizacija druge/treće celine.",
      "Produkcioni simulator."
    ]
  },
  {
    "id": "oib-kt2",
    "code": "KT2",
    "title": "Završna demonstracija i security QA",
    "exercises": [
      5,
      8
    ],
    "date": "Vežba 8",
    "dateLabel": "Termin",
    "summary": "Druga kontrolna tačka održava se u terminu 8. vežbe. Tim demonstrira sve obavezne use-case-ove svih dodeljenih celina u odobrenom obimu, njihovo povezivanje, bezbednosne odluke i ponovljivo pokretanje, uz ažurnu dokumentaciju.",
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
    ],
    "presentation": "Povezani end-to-end scenario, pozitivan i negativan test, ugovori i individualno obrazloženje rada. Kontrolne tačke i termini odbrane projekta su odvojene obaveze."
  }
]
