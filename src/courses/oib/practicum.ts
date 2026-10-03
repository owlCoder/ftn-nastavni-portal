import { buildPracticum, checkpointReference } from '../../practicum/build'
import { text, list, callout, table } from '../../practicum/blocks'
import type { Block } from '../../practicum/types'
import { oibCheckpoints } from './checkpoints'
import { oibExercises } from './exercises'

const intro: Block[] = [
  text('h1', '0.1. Kako koristiti praktikum'),
  text('paragraph', 'Praktikum prati sadržaj vežbi iz informacione bezbednosti. Svaka tema obuhvata problem, primenjene kontrole, tipične greške i način provere donete odluke. Nakon vežbe student treba da ume da obrazloži obrađeni princip i primeni ga u okviru dodeljene projektne celine.'),
  callout('info', 'Primena na projektu', 'Svaki tim dobija projektnu celinu, kao što su identitet, autorizacija, revizijski trag ili detekcija, i obrađene principe primenjuje na sopstveni domen. Donete odluke obrazlažu se na projektnoj kontrolnoj tački.'),
  table(['Faza', 'Preporučeni način rada'], [
    ['Pre vežbe', 'Pročitati temu i izdvojiti pretpostavke koje bi u informacionom sistemu mogle biti pogrešne.'],
    ['Tokom vežbe', 'Povezati pojam sa posledicama u razvoju informacionog sistema, a ne samo sa nazivom klase ili krajnje tačke API-ja.'],
    ['Posle vežbe', 'Primeniti princip na primeru sistema i dokumentovati rezultat testom, odlukom ili revizijskim zapisom.'],
    ['Pred odbranu', 'Objasniti problem, izabranu kontrolu, njeno ograničenje i način na koji je ponašanje provereno.'],
  ]),
  callout('info', 'Defanzivna orijentacija', 'Praktikum ne zahteva razvoj eksploita, malvera ni napad na realne sisteme. Sumnjiva aktivnost, greška konfiguracije ili pokušaj nedozvoljenog pristupa reprodukuju se kontrolisanim simulatorima i testnim identitetima.'),
  callout('note', 'Jezik i alati', 'Primeri su pretežno u C#/.NET okruženju. Druga tehnologija može biti odobrena kada tim obezbedi interoperabilnost i ekvivalentan nivo testiranja i bezbednosne kontrole.'),
  text('h1', '0.2. Tok gradiva'),
  text('paragraph', 'Osam vežbi obrađuje identitet i pristup, zaštitu podataka, bezbednosne politike, granice poverenja, reagovanje na incidente, procenu rizika i unapređivanje kontrola. Teme su raspoređene tako da se svaka naredna oslanja na prethodno uvedene pojmove.'),
  list([
    'Identitet i RBAC: ko pristupa sistemu, sa kojim pravom i zašto.',
    'Autorizacija i podaci: odluka nad konkretnim resursom i osetljivost informacije.',
    'Politike i granice poverenja: pravila, konfiguracija, imovina i modelovanje pretnji.',
    'Operativna bezbednost: sesije, MFA, tajne, detekcija i incident.',
    'Napredne odluke: kontekstualna pravila, rizik, korelacija i dokaz efektivnosti.',
  ]),
]

const closing: Block[] = [
  text('h1', 'Sažetak: bezbednost kao sledljiv, dokaziv proces'),
  text('paragraph', 'Vežbe primenjuju isti analitički sled: imovina → pretnja ili zloupotreba → bezbednosni zahtev → kontrola → bezbednosni test → dokaz. Postupak se primenjuje na autentikaciju, privilegovani pristup i analizu putanja napada, uz prilagođavanje nivou posmatranog sistema.'),
  table(['Nivo', 'Šta uvodi'], [
    ['R1 — osnovni', 'Identitet, resursi, klasifikacija, autorizacija, politike i audit.'],
    ['R2 — operativni', 'MFA, sesije, tajne, detekcija, incidenti i ranjivosti.'],
    ['R3 — napredni', 'Mehanizam politika, pregled pristupa, rizik, korelacija i automatizacija odgovora.'],
  ]),
  callout('success', 'Odgovornost studenta', 'Tim je odgovoran za razumevanje zahteva, obrazloženje bezbednosnog modela i dokazivanje efektivnosti primenjene kontrole.'),

  text('h1', 'Preporučena literatura i dokumentacija'),
  text('paragraph', 'Literatura je namenjena produbljivanju tema iz praktikuma. Pojmove treba povezivati sa modelom pretnji, bezbednosnim testovima i revizijskim zapisima konkretnog informacionog sistema.'),
  list([
    'OWASP — <i>Application Security Verification Standard (ASVS)</i> i <i>OWASP Top 10</i>: <a href="https://owasp.org">owasp.org</a>.',
    'NIST — <i>Digital Identity Guidelines (SP 800-63)</i>: <a href="https://pages.nist.gov/800-63-3/">pages.nist.gov/800-63-3</a>.',
    'NIST — <i>Zero Trust Architecture (SP 800-207)</i>: <a href="https://csrc.nist.gov/publications/detail/sp/800-207/final">csrc.nist.gov</a>.',
    'Adam Shostack — <i>Threat Modeling: Designing for Security</i>.',
    'NUnit dokumentacija: <a href="https://docs.nunit.org">docs.nunit.org</a>; Moq dokumentacija: <a href="https://github.com/devlooped/moq">github.com/devlooped/moq</a>.',
    'Microsoft Learn — ASP.NET Core Identity, autorizacija i bezbedna konfiguracija: <a href="https://learn.microsoft.com/aspnet/core/security/">learn.microsoft.com/aspnet/core/security</a>.',
    'MITRE ATT&CK — okvir za razumevanje taktika i tehnika (koristi se isključivo kao referentni rečnik, ne kao uputstvo za napad): <a href="https://attack.mitre.org">attack.mitre.org</a>.',
  ]),
  callout('note', 'Napomena o alatima', 'Konkretni bezbednosni alati (SIEM, IDS, PKI proizvodi) menjaju se brže od osnovnih principa. Simulatori korišćeni u praktikumu oponašaju njihovo ponašanje radi vežbe — ne predstavljaju se kao realni proizvodi.'),
]

export const oibPracticum = buildPracticum({
  subject: 'Osnove informacione bezbednosti',
  intro,
  exercises: oibExercises,
  closing,
  checkpoints: oibCheckpoints,
  checkpointSection: checkpointReference,
})
