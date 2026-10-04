import type { Checkpoint } from '../types'

export const oibCheckpoints: Checkpoint[] = [
  {
    id: 'oib-p1',
    code: 'P1',
    title: 'Identitet, uloge i autorizacija',
    exercises: [1, 2],
    date: '19.10.',
    summary:
      'U ovoj fazi ne zahteva se završen bezbednosni model. Tim identifikuje subjekte sistema, razdvaja autentikaciju od autorizacije i povezuje stavke backloga sa proverljivim bezbednosnim zahtevima.',
    items: [
      'Zajednički repozitorijum sa README dokumentom i dodeljenom projektnom celinom.',
      'Osnovna autentikacija i RBAC su implementirani; pristup se proverava serverski, ne samo u UI-ju.',
      'Najmanje jedan negativan test potvrđuje da je pristup tuđem resursu odbijen bez otkrivanja zaštićenih podataka.',
      'Revizijski zapis beleži uspešne i neuspešne pokušaje pristupa, uključujući aktera, radnju i ciljni resurs.',
    ],
  },
  {
    id: 'oib-p2',
    code: 'P2',
    title: 'Politike, klasifikacija i referentna konfiguracija',
    exercises: [3, 4],
    date: '02.11.',
    summary:
      'Tim uspostavlja katalog bezbednosnih pravila povezan sa konkretnim resursima, klasifikacijom podataka i očekivanom konfiguracijom sistema.',
    items: [
      'Katalog bezbednosnih politika podržava verzionisanje bez naknadne izmene objavljene verzije.',
      'Klasifikacija podataka je dodeljena najmanje jednom tipu resursa i utiče na dozvoljeno rukovanje.',
      'Referentna bezbednosna konfiguracija omogućava otkrivanje odstupanja od očekivanog stanja.',
      'Tim ume da objasni koje pravilo prioriteta važi kada su dve politike u konfliktu.',
    ],
  },
  {
    id: 'oib-p3',
    code: 'P3',
    title: 'Testiranje i manual-core-baseline',
    exercises: [5, 6],
    date: '23.11.',
    summary:
      'Ova kontrolna tačka zaokružuje osnovni nivo sistema. Postojeća struktura i skup testova moraju omogućiti nezavisnu proveru svake naredne izmene, uključujući izmene predložene pomoću AI alata.',
    items: [
      'Evidencija imovine sadrži podatke o kritičnosti i vlasniku svakog registrovanog resursa.',
      'Ključni bezbednosni slučajevi upotrebe imaju testove za uspešne i negativne scenarije.',
      'Izveštaj o pokrivenosti je pregledan; najmanje jedna rizična grana je obrazložena ili pokrivena testom.',
      'Stabilna verzija jezgra je označena Git tag-om `manual-core-baseline`.',
    ],
  },
  {
    id: 'oib-p4',
    code: 'P4',
    title: 'Operativna i napredna bezbednost — završna odbrana',
    exercises: [7, 8],
    date: '14.12.',
    summary:
      'Na završnoj odbrani svaki član tima obrazlaže imovinu, pretnje, primenjene kontrole, način provere i preostali rizik u okviru dodeljene projektne celine.',
    items: [
      'Višefaktorska ili dodatna autentikacija i vremenski ograničen privilegovan pristup implementirani su za rizične operacije.',
      'Pravilo detekcije i tok obrade incidenta obuhvataju događaj, upozorenje, incident i dokumentovano zatvaranje.',
      'Postoje najmanje tri evaluaciona ili bezbednosna scenarija, uključujući negativan scenario ili scenario zloupotrebe.',
      'Na odbrani svaki član tima objašnjava model pretnji, kontrolu i test svoje celine bez oslanjanja na automatski generisan odgovor.',
    ],
  },
]
