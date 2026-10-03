import type { Checkpoint } from '../types'

export const ersCheckpoints: Checkpoint[] = [
  {
    id: 'p1',
    code: 'P1',
    title: 'Problem, backlog i razvojni tok',
    exercises: [1, 2],
    date: '19.10.',
    summary:
      'U ovoj fazi ne zahteva se završena arhitektura niti veliki obim implementacije. Tim obrazlaže problem, razlaže rad na proverljive stavke i dokumentuje početni tok zajedničkog razvoja u repozitorijumu.',
    items: [
      'Zajednički repozitorijum sa README dokumentom i pristupom svih članova tima.',
      'Tapiz Boards sadrži backlog sa prioritetima i proverljivim kriterijumima prihvatanja.',
      'Najmanje jedan zahtev za spajanje (pull request) sadrži pregled izmena i obrazložene komentare učesnika.',
      'Tim koristi dogovoreni tok Backlog → Ready → In Progress → Code Review → QA/Verify → Done.',
    ],
  },
  {
    id: 'p2',
    code: 'P2',
    title: 'Arhitektura i funkcionalno jezgro',
    exercises: [3, 4],
    date: '02.11.',
    summary:
      'Tim prikazuje arhitektonske granice i najmanje jedan zaokružen slučaj upotrebe, od ulaznog zahteva do poslovnog rezultata, uz razdvojene odgovornosti poslovnog i infrastrukturnog koda.',
    items: [
      'Dokumentovana odgovornost svakog sloja i dozvoljeni smer zavisnosti.',
      'Implementiran je najmanje jedan vertikalni prolaz kroz sistem, od zahteva do rezultata.',
      'Za očekivane neuspehe definisani stabilni kodovi ili tipovi rezultata, bez generičkih izuzetaka.',
      'Domenski i aplikacioni sloj mogu se testirati bez pokretanja stvarne baze podataka ili korisničkog interfejsa.',
    ],
  },
  {
    id: 'p3',
    code: 'P3',
    title: 'Testiranje i manual-core-baseline',
    exercises: [5, 6],
    date: '23.11.',
    summary:
      'Do ove kontrolne tačke tim samostalno projektuje jezgro sistema i osnovni skup testova. U narednoj fazi AI alati mogu imati veću ulogu, ali se svaki njihov predlog proverava postojećim testovima i pregledom izmena.',
    items: [
      'Ključni slučajevi upotrebe imaju testove za uspešne i negativne scenarije.',
      'Izveštaj o pokrivenosti je pregledan i najmanje jedna rizična grana je obrazložena ili dodatno pokrivena.',
      'Najmanje jedan bug je najpre reprodukovan testom, a zatim ispravljen.',
      'Stabilna verzija jezgra je označena Git tag-om `manual-core-baseline`.',
    ],
  },
  {
    id: 'p4',
    code: 'P4',
    title: 'Razvoj uz podršku AI alata i završna odbrana',
    exercises: [7, 8],
    date: '14.12.',
    summary:
      'Na završnoj odbrani svaki član tima obrazlaže zahteve, arhitekturu, testove i način na koji su AI alati korišćeni i proveravani tokom razvoja.',
    items: [
      '`AGENTS.md` i `AI_USAGE.md` sadrže projektna pravila i reprezentativne zapise odluka.',
      'Najmanje dve ponovljive procedure ili uloge AI agenata imaju definisane ulaze, izlaze i ograničenja.',
      'Postoje najmanje tri evaluaciona scenarija, uključujući negativan slučaj.',
      'Na odbrani svaki član tima objašnjava svoj deo bez oslanjanja na automatski generisan odgovor.',
    ],
  },
]
