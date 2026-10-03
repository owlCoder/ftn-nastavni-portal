import type { StandaloneExample } from '../types'

export const oibExamplesBundle = '/downloads/oib-svi-primeri.zip'

export const oibExamples: StandaloneExample[] = [
  { exercise: 1, title: 'Identitet i RBAC', description: 'Autentikacija aktera i centralizovana provera dozvola zasnovana na ulogama.', zip: '/downloads/oib-vezba-01-identitet-rbac.zip', tags: ['RBAC', 'Identitet', 'Politike'] },
  { exercise: 2, title: 'Resurs i klasifikacija', description: 'Odluka o pristupu na osnovu vlasništva, uloge i klasifikacije podatka.', zip: '/downloads/oib-vezba-02-resurs-klasifikacija.zip', tags: ['Autorizacija', 'Resursi', 'Klasifikacija'] },
  { exercise: 3, title: 'Politike i konfiguracija', description: 'Otkrivanje odstupanja aktivne konfiguracije od referentnog bezbednosnog stanja.', zip: '/downloads/oib-vezba-03-politike-konfiguracija.zip', tags: ['Referentno stanje', 'Odstupanje', 'Konfiguracija'] },
  { exercise: 4, title: 'Modelovanje pretnji', description: 'Povezivanje imovine, tokova podataka i granica poverenja sa scenarijima pretnji.', zip: '/downloads/oib-vezba-04-threat-modeling.zip', tags: ['Imovina', 'Granice poverenja', 'Pretnje'] },
  { exercise: 5, title: 'MFA, sesije i tajne', description: 'Dodatna autentikacija za rizičnu operaciju u okviru aktivne sesije.', zip: '/downloads/oib-vezba-05-mfa-sesije-tajne.zip', tags: ['MFA', 'Sesija', 'Dodatna provera'] },
  { exercise: 6, title: 'Detekcija i incident', description: 'Prepoznavanje sumnjivih prijava i formiranje incidenta na osnovu bezbednosnih signala.', zip: '/downloads/oib-vezba-06-detekcija-incident.zip', tags: ['Detekcija', 'Signali', 'Incident'] },
  { exercise: 7, title: 'ABAC i procena rizika', description: 'Odluka o pristupu zasnovana na atributima i priprema periodičnog pregleda prava.', zip: '/downloads/oib-vezba-07-abac-rizik-pregled.zip', tags: ['ABAC', 'Rizik', 'Pregled pristupa'] },
  { exercise: 8, title: 'Korelacija i efektivnost', description: 'Korelacija događaja i merenje efektivnosti bezbednosne kontrole.', zip: '/downloads/oib-vezba-08-korelacija-efektivnost.zip', tags: ['Korelacija', 'Metrike', 'Analiza incidenata'] },
]
