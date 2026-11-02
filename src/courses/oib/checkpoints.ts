import type { Checkpoint } from '../types'

export const oibCheckpoints: Checkpoint[] = [
  {
    "id": "oib-kt1",
    "code": "KT1",
    "title": "Započet projekat i dijagrami",
    "exercises": [
      1,
      4
    ],
    "date": "Vežba 4",
    "dateLabel": "Termin",
    "summary": "KT1 se održava na 4. vežbi. Svaki student prikazuje svoj doprinos dodeljenom delu projekta.",
    "itemsHeading": "Zahtevi za svakog studenta",
    "orderedItems": true,
    "items": [
      "Započeta implementacija. U zajedničkom repozitorijumu postoji započet projekat i početni kod dodeljenog dela. Prikazati šta je stvarno urađeno i kako se deo pokreće.",
      "Sopstveni doprinos. Svaki student pokazuje konkretan doprinos svom delu zadatka kroz kod, commit/PR ili drugi proverljiv trag rada.",
      "Dijagram arhitekture. Priložiti dijagram arhitekture svog dela: ključne komponente, odgovornosti, interfejse, zavisnosti i vezu sa ostalim delovima platforme.",
      "Dijagram toka podataka. Priložiti dijagram toka podataka (DFD) svog dela: aktere, ulaze/izlaze, procese, skladišta podataka i tokove, uz granice poverenja gde su relevantne.",
      "Kratka demonstracija. Pokazati početnu funkcionalnost ili jasno definisan započet tok. Objasniti naredne korake, preostali posao i eventualne zavisnosti."
    ]
  },
  {
    "id": "oib-kt2",
    "code": "KT2",
    "title": "Završetak i demonstracija",
    "exercises": [
      5,
      8
    ],
    "date": "Vežba 8",
    "dateLabel": "Termin",
    "summary": "KT2 se održava na 8. vežbi. Svaki student prikazuje svoj doprinos dodeljenom delu projekta.",
    "itemsHeading": "Zahtevi za svakog studenta",
    "orderedItems": true,
    "items": [
      "Realizovan projektni deo. Dodeljeni deo funkcioniše u skladu sa primenljivim zahtevima nove projektne specifikacije. Prikazati kompletan tok upotrebe.",
      "Povezivanje modula. Proveriti i demonstrirati relevantne veze sa drugim delovima platforme preko dogovorenih interfejsa. Opisati preostala ograničenja.",
      "Testovi i bezbednost. Obezbediti testove pozitivnih i negativnih scenarija, uključujući provere dozvola i validacije gde je primenljivo. Prikazati rezultate.",
      "Pokretanje i dokumentacija. Ažurirati README i uputstvo za pokretanje, arhitekturu i tok podataka prema implementaciji. Demonstracija treba da bude ponovljiva.",
      "Individualni doprinos. Svaki student brani svoj deo: svrhu, ključni kod, odluke, testove i povezivanje sa projektom. Doprinos je vidljiv u Git istoriji."
    ]
  }
]
