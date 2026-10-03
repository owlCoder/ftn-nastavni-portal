import { buildPracticum, checkpointOverview, checkpointRequirements } from '../../../practicum/build'
import { text, list, callout, table, image } from '../../../practicum/blocks'
import type { Block } from '../../../practicum/types'
import { ersCheckpoints } from '../checkpoints'
import { exercise1 } from './exercise1'
import { exercise2 } from './exercise2'
import { exercise3 } from './exercise3'
import { exercise4 } from './exercise4'
import { exercise5 } from './exercise5'
import { exercise6 } from './exercise6'
import { exercise7 } from './exercise7'
import { exercise8 } from './exercise8'

const intro: Block[] = [
  text('h1', '0.1. Kako koristiti praktikum'),
  text('paragraph', 'Praktikum prati sadržaj vežbi i razvoj projektnog zadatka. Svaka oblast sadrži teorijsko objašnjenje, praktičan primer, pitanja za proveru razumevanja i zadatke povezane sa projektnim repozitorijumom. Nakon vežbe student treba da ume da obrazloži donete odluke i primeni obrađeni princip u drugom kontekstu.'),
  table(['Faza', 'Preporučeni način rada'], [
    ['Pre vežbe', 'Pročitati uvodni deo oblasti i označiti pojmove koji zahtevaju dodatno razjašnjenje.'],
    ['Tokom vežbe', 'Pratiti demonstraciju i obrazloženje odluka, a ne samo konačan kod ili niz komandi.'],
    ['Posle vežbe', 'Primeniti obrađeni princip u projektnom repozitorijumu i dokumentovati rezultat kroz commit, test, tehnički dokument ili zapis o upotrebi AI alata.'],
    ['Pre projektne kontrolne tačke', 'Proći kontrolnu listu, proveriti izgradnju projekta i testove, a zatim pregledati konačan diff. Svaki član tima treba da ume da obrazloži urađeno.'],
  ]),
  callout('info', 'Nastavni primeri', 'Praktikum koristi domen rezervacije fakultetske opreme i studije slučaja Logger–Blogger i ECommerce za poređenje arhitektonskih odluka. Studentski tim primenjuje iste principe na sopstvenu temu i samostalno oblikuje projektnu strukturu.'),
  callout('note', 'Jezik i alati', 'Primeri su pretežno u C#/.NET okruženju. Na vežbama 6–8 koristi se Kova, lokalni AI agent za VS Code, koji projektnu konfiguraciju čita iz direktorijuma <code>.kova/</code>. Sintaksa AI alata može se menjati između verzija, zato se u praktikumu naglašavaju stabilni koncepti: kontekst, ugovori, granice alata, provera rezultata i evaluacioni scenariji.'),
  text('h1', '0.2. Tok semestra i projekta'),
  text('paragraph', 'Praktikum je organizovan u osam povezanih vežbi. Prva obrađuje zahteve, backlog, Git i timski razvojni tok. Druga povezuje objektno orijentisano programiranje i principe čistog koda sa SOLID principima i Clean Architecture. Slede poslovna logika, testiranje i integracija modula i podataka. Završne vežbe obrađuju razvoj uz podršku AI alata, Model Context Protocol (MCP) i izvršive mehanizme provere.'),
  image('/course-assets/semester-map.svg', 'Tok praktikuma: zahtevi i razvojni proces → arhitektura → poslovna logika → testiranje → integracija modula → razvoj uz AI podršku → MCP → završna provera kvaliteta.', 'Mapa semestra'),
  text('paragraph', 'Napredak projekta proverava se na kontrolnim tačkama. Svaka je u praktikumu navedena jednom, posle poslednje vežbe na koju se oslanja, sa istim zahtevima koje prikazuje kartica „Kontrolne tačke“.'),
  checkpointOverview(ersCheckpoints),
]

const closing: Block[] = [
  text('h1', 'Sažetak: isti principi u novom razvojnom okruženju'),
  text('paragraph', 'Principi softverskog inženjerstva primenjuju se i kada razvoj uključuje AI agente i dodatnu automatizaciju. Interfejs definiše ugovor alata, SRP razdvaja odgovornosti agentskih uloga, kontrolisano dodeljivanje alata i konteksta odgovara načelima upravljanja zavisnostima, a evaluacioni scenariji dopunjuju testiranje celog razvojnog toka.'),
  table(['Softversko inženjerstvo', 'Razvoj uz podršku AI alata'], [
    ['Interfejs', 'Ugovor alata ili MCP funkcionalnosti sa jasnim ulazom, izlazom i ograničenjima.'],
    ['Single Responsibility', 'Specijalizovana agentska uloga sa ograničenom odgovornošću.'],
    ['Dependency Injection', 'Kontrolisano dodeljivanje alata i spoljnog konteksta.'],
    ['Jedinični test', 'Deterministička provera softverskog ponašanja.'],
    ['Integracioni test', 'Provera toka rada kroz više komponenti ili modula.'],
    ['Pokrivenost koda', 'Signal nepokrivenog koda; sličan način razmišljanja koristi se pri izboru skupa evaluacionih scenarija.'],
    ['Middleware / policy', 'Hook ili guardrail koji se izvršava na definisanoj granici životnog ciklusa.'],
    ['Ponovljiva procedura', 'Skill koji čuva i verzioniše razvojni postupak.'],
  ]),
  callout('success', 'Odgovornost studenta', 'Student je odgovoran za razumevanje zahteva, obrazloženje arhitekture i proveru ispravnosti promene, bez obzira na to da li je u radu korišćen AI alat.'),

  text('h1', 'Preporučena literatura i dokumentacija'),
  text('paragraph', 'Literatura je namenjena produbljivanju tema iz praktikuma. Pojmove treba povezivati sa konkretnim izmenama koda, testovima i arhitektonskim odlukama u studentskom projektu.'),
  list([
    'Robert C. Martin — <i>Clean Code: A Handbook of Agile Software Craftsmanship</i>.',
    'Robert C. Martin — <i>Clean Architecture: A Craftsman’s Guide to Software Structure and Design</i>.',
    'Scott Chacon i Ben Straub — <i>Pro Git</i>; zvanična Git dokumentacija: <a href="https://git-scm.com/doc">git-scm.com/doc</a>.',
    'Ken Schwaber i Jeff Sutherland — <i>The Scrum Guide</i>: <a href="https://scrumguides.org">scrumguides.org</a>.',
    'NUnit dokumentacija: <a href="https://docs.nunit.org">docs.nunit.org</a>; Moq projekat i dokumentacija: <a href="https://github.com/devlooped/moq">github.com/devlooped/moq</a>.',
    'Microsoft Learn — .NET dependency injection, testiranje i arhitektura aplikacija: <a href="https://learn.microsoft.com/dotnet/">learn.microsoft.com/dotnet</a>.',
    'Model Context Protocol — specifikacija i koncepti resources/tools/prompts: <a href="https://modelcontextprotocol.io">modelcontextprotocol.io</a>.',
    'Kova — dokumentacija za skill-ove, MCP, hook-ove i režime rada: <a href="https://github.com/owlCoder/kova">github.com/owlCoder/kova</a>; pratiti aktuelnu verziju sintakse.',
  ]),
  callout('note', 'Napomena o verzijama', 'AI alati i njihova konfiguraciona sintaksa menjaju se brže od osnovnih principa softverskog inženjerstva. Kada se razlikuje konkretna komanda ili naziv konfiguracione datoteke, treba pratiti aktuelnu zvaničnu dokumentaciju, ali zadržati isti mentalni model, granice odgovornosti i način provere.'),
]

export const ersPracticum = buildPracticum({
  subject: 'Elementi razvoja softvera',
  intro,
  exercises: [exercise1, exercise2, exercise3, exercise4, exercise5, exercise6, exercise7, exercise8],
  closing,
  checkpoints: ersCheckpoints,
  checkpointSection: checkpointRequirements,
})
