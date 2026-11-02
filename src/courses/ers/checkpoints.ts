import type { Checkpoint } from '../types'

export const ersCheckpoints: Checkpoint[] = [
  {
    "id": "ers-kt1",
    "code": "KT1",
    "title": "Započet projekat i dijagrami",
    "exercises": [
      1,
      4
    ],
    "date": "Vežba 4",
    "dateLabel": "Termin",
    "points": 10,
    "summary": "KT1 se održava na 4. vežbi. Svaki student prikazuje svoj doprinos dodeljenom delu projekta.",
    "itemsHeading": "Zahtevi za svakog studenta",
    "orderedItems": true,
    "items": [
      "Započeta implementacija. U repozitorijumu postoji započet projekat i početni kod dodeljenog dela. Prikazati konkretan rezultat i način pokretanja.",
      "Sopstveni doprinos. Svaki student pokazuje šta je realizovao u svom delu zadatka, kroz kod i proverljiv commit/PR.",
      "Dijagram arhitekture. Priložiti dijagram arhitekture svog dela: komponente, odgovornosti, interfejsi i veze sa ostatkom sistema STUDIUM.",
      "Dijagram toka podataka. Priložiti DFD svog dela: akteri, procesi, skladišta podataka, ulazi/izlazi, tokovi i relevantne granice pristupa.",
      "Demonstracija i plan. Prikazati započet poslovni scenario, navesti preostali rad, poslovna pravila i zavisnosti od drugih delova."
    ]
  },
  {
    "id": "ers-kt2",
    "code": "KT2",
    "title": "Završetak i demonstracija",
    "exercises": [
      5,
      8
    ],
    "date": "Vežba 8",
    "dateLabel": "Termin",
    "points": 10,
    "summary": "KT2 se održava na 8. vežbi. Svaki student prikazuje svoj doprinos dodeljenom delu projekta.",
    "itemsHeading": "Zahtevi za svakog studenta",
    "orderedItems": true,
    "items": [
      "Realizovan dodeljeni deo. Implementirane su odobrene funkcionalnosti iz dodeljene celine prema STUDIUM specifikaciji. Demonstrirati poslovni tok.",
      "Poslovna pravila. Proveriti rokove, statuse, prava pristupa, konzistentnost podataka i očuvanje ranijih evidencija.",
      "Testovi. Prikazati pozitivne i negativne scenarije, automatske testove i rezultate izvršavanja.",
      "Integracija i dokumentacija. Povezati relevantne delove, ažurirati dijagrame i README i obezbediti ponovljivo pokretanje.",
      "Individualna odbrana. Svaki student objašnjava svoj kod, projektne odluke, testove i doprinos u repozitorijumu."
    ]
  }
]
