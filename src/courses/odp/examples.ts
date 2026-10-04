import type { StandaloneExample } from '../types'

export const odpExamplesBundle = '/downloads/odp-svi-primeri.zip'

export const odpExamples: StandaloneExample[] = [
  { exercise: 1, title: 'Vlasništvo i neizvesnost', description: 'Status udaljenog čvora izveden iz dužine tišine; zakasneli heartbeat ne vraća stanje unazad.', zip: '/downloads/odp-vezba-01-vlasnistvo-neizvesnost.zip', tags: ['Heartbeat', 'Status čvora', 'Vlasništvo'] },
  { exercise: 2, title: 'Ugovori i simulator', description: 'Provera ugovora poruke na ulazu i simulator stanice čiji je tok određen scenarijom.', zip: '/downloads/odp-vezba-02-ugovori-simulator.zip', tags: ['Ugovor', 'Simulator', 'Ponovljivost'] },
  { exercise: 3, title: 'Identitet operacije i audit', description: 'Isti identifikator operacije stiže do druge komponente i do revizijskog traga; konfiguracija se proverava pre pokretanja.', zip: '/downloads/odp-vezba-03-identitet-audit-konfiguracija.zip', tags: ['Korelacija', 'Audit', 'Konfiguracija'] },
  { exercise: 4, title: 'Verzije i failure-first', description: 'Odluka prijemne strane za duplikat, zakasnelu poruku i poruku druge verzije ugovora.', zip: '/downloads/odp-vezba-04-verzionisanje-failure-first.zip', tags: ['Verzionisanje', 'Duplikati', 'Kašnjenje'] },
  { exercise: 5, title: 'Tok podataka i read model', description: 'Zapis merenja kao izvor istine i prikaz koji ne ide unazad i označava zastarelost.', zip: '/downloads/odp-vezba-05-tok-podataka-read-model.zip', tags: ['Telemetrija', 'Projekcija', 'Svežina'] },
  { exercise: 6, title: 'Komande i idempotentnost', description: 'Komanda sa stabilnim identifikatorom, ponovni pokušaj posle isteka i potvrda koja stiže kasno.', zip: '/downloads/odp-vezba-06-komande-idempotentnost.zip', tags: ['Komande', 'Retry', 'Idempotentnost'] },
  { exercise: 7, title: 'Rad bez veze i outbox', description: 'Lokalni outbox čuva nameru kroz prekid veze, a prijemna strana ignoriše ponovljenu poruku.', zip: '/downloads/odp-vezba-07-rad-bez-veze-outbox.zip', tags: ['Outbox', 'Reconnect', 'Deduplikacija'] },
  { exercise: 8, title: 'Koordinacija i protok', description: 'Vremenski ograničeno vlasništvo sa tokenom i jasan odgovor pošiljaocu kada je red pun.', zip: '/downloads/odp-vezba-08-koordinacija-protok.zip', tags: ['Lease', 'Fencing token', 'Backpressure'] },
]
