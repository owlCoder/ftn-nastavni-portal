import { buildPracticum, checkpointReference } from '../../practicum/build'
import { text, list, callout, table } from '../../practicum/blocks'
import type { Block } from '../../practicum/types'
import { odpCheckpoints } from './checkpoints'
import { odpExercises } from './exercises'

const intro: Block[] = [
  text('h1', '0.1. Kako koristiti praktikum'),
  text('paragraph', 'Praktikum je samostalan materijal za razumevanje distribuiranih sistema. Svaka vežba objašnjava problem koji raspodela sistema uvodi, razlog zbog kog je izabrani princip važan, tipične greške i način na koji se odluka proverava u razvoju softvera. Cilj je da student nakon vežbe može samostalno da obnovi princip i primeni ga na dodeljenoj projektnoj celini, a ne da zapamti jedan konkretan primer.'),
  callout('info', 'Od metode do projekta', 'Praktikum ne daje gotovo distribuirano rešenje za projekat. Svaki tim dobija dodeljenu projektnu celinu (npr. telemetriju, komande, koordinaciju ili replikaciju) i princip sa vežbe primenjuje na sopstveni domen, uz obrazloženje odluke na projektnoj kontrolnoj tački.'),
  table(['Faza', 'Preporučeni način rada'], [
    ['Pre vežbe', 'Pročitati temu i označiti pretpostavke koje mreža, vreme ili više instanci mogu da pokvare.'],
    ['Tokom vežbe', 'Pratiti razlog odluke i njen trade-off, a ne samo konačni oblik implementacije.'],
    ['Posle vežbe', 'Povezati princip sa konkretnim distribuiranim scenarijem i objasniti dokaz kroz test ili kontrolisani failure scenario.'],
    ['Pred odbranu', 'Objasniti granicu odgovornosti, neizvestan ishod i razlog zbog kog sistem na njega reaguje baš tako.'],
  ]),
  callout('info', 'Simulatori umesto realne opreme', 'Praktikum ne zahteva realnu orbitalnu mehaniku, radio opremu ni pravu satelitsku komunikaciju. Udaljeni uređaji, mreža i failure situacije reprodukuju se kontrolisanim, ponovljivim simulatorima.'),
  callout('note', 'Jezik i alati', 'Primeri su pretežno u C#/.NET okruženju. Druga tehnologija može biti odobrena kada tim obezbedi interoperabilnost i ekvivalentan nivo testiranja i failure pokrivenosti.'),
  text('h1', '0.2. Tok gradiva'),
  text('paragraph', 'Osam vežbi prati tok razmišljanja potreban za distribuirani sistem: najpre vlasništvo i granice, zatim ugovori i vidljivost, potom rad sa porukama, komande i prekidi veze, a na kraju koordinacija, opterećenje i konzistentnost. Redosled gradi mentalni model distribuiranog ponašanja.'),
  list([
    'Vlasništvo i granice: poslovni entiteti, čvorovi i neizvesnost mreže.',
    'Ugovori i vidljivost: poruke, simulatori, korelacija i konfiguracija.',
    'Pouzdani tokovi: podaci, komande, poslovi, retry i idempotentnost.',
    'Rad pod pritiskom: prekidi veze, koordinacija, backpressure i zastareli prikazi.',
  ]),
]

const closing: Block[] = [
  text('h1', 'Sažetak: distribuiran sistem kao objašnjiv, testiran proces'),
  text('paragraph', 'Kroz osam vežbi gradi se jedan konzistentan lanac: entitet i vlasništvo → ugovor → distribuirana operacija → failure/recovery scenario → test → evidencija. Taj lanac ostaje isti bez obzira na to da li se radi o osnovnom heartbeat mehanizmu, command dispatch-u ili naprednom regionalnom failover-u — menja se samo nivo sistema na kome se primenjuje.'),
  table(['Nivo', 'Šta uvodi'], [
    ['R1 — osnovni', 'Misije, stanice, node-ovi, ugovori, identitet, audit, observability.'],
    ['R2 — operativni', 'Telemetrija, komande, jobs, messaging, lease, DLQ, reconnect.'],
    ['R3 — napredni', 'Coordination, failover, replikacija, backpressure, eventual consistency.'],
  ]),
  callout('success', 'Odgovornost ostaje kod studenta', 'Automatizacija i AI podrška mogu ubrzati implementaciju, ali tim mora razumeti distribuirani model, objasniti trade-off odabrane strategije i pokazati nezavisan dokaz da failure/recovery ponašanje zaista radi.'),

  text('h1', 'Preporučena literatura i dokumentacija'),
  text('paragraph', 'Literatura služi za produbljivanje tema iz praktikuma. Preporuka je da se čita uz konkretan distribuirani scenario, jer se principi najbrže usvajaju kada student može da poveže definiciju sa failure scenarijem, testom ili observability zapisom.'),
  list([
    'Martin Kleppmann — <i>Designing Data-Intensive Applications</i>.',
    'Chris Richardson — <i>Microservices Patterns</i> (Saga, Outbox, Transactional messaging).',
    'Google SRE Book — <i>Site Reliability Engineering</i>: <a href="https://sre.google/books/">sre.google/books</a>.',
    'Microsoft Learn — Cloud Design Patterns (Retry, Circuit Breaker, Competing Consumers): <a href="https://learn.microsoft.com/azure/architecture/patterns/">learn.microsoft.com/azure/architecture/patterns</a>.',
    'NUnit dokumentacija: <a href="https://docs.nunit.org">docs.nunit.org</a>; Moq dokumentacija: <a href="https://github.com/devlooped/moq">github.com/devlooped/moq</a>.',
    'Pat Helland — <i>Life beyond Distributed Transactions</i> (rad o idempotenciji i outbox obrascu).',
    'Leslie Lamport — <i>Time, Clocks, and the Ordering of Events in a Distributed System</i> (osnova za temu logičkog vremena i redosleda događaja).',
  ]),
  callout('note', 'Napomena o alatima', 'Konkretni message broker-i, orkestratori i cloud platforme menjaju se brže od osnovnih distribuiranih principa. Simulatori korišćeni u praktikumu oponašaju njihovo ponašanje radi vežbe — ne predstavljaju se kao realni proizvodi.'),
]

export const odpPracticum = buildPracticum({
  subject: 'Osnove distribuiranog programiranja',
  intro,
  exercises: odpExercises,
  closing,
  checkpoints: odpCheckpoints,
  checkpointSection: checkpointReference,
})
