import type { LessonPackage, StandaloneExample } from '../types'

export const ersProjectBundle = '/downloads/ers-ai-vezbe-5-8.zip'

export const ersStandaloneExamples: StandaloneExample[] = [
  {
    exercise: 2,
    title: 'Logger–Blogger',
    description: 'Primena SOLID principa kroz razdvajanje poslovne logike, evidentiranja događaja i infrastrukturnih odgovornosti.',
    zip: '/Logger-Bloger.zip',
    tags: ['SOLID', 'SRP', 'DIP'],
  },
  {
    exercise: 3,
    title: 'ECommerce',
    description: 'Organizacija domenskog, aplikacionog i infrastrukturnog sloja prema pravilima Clean Architecture.',
    zip: '/E-Commerce.zip',
    tags: ['Clean Architecture', 'Repository', 'Use cases'],
  },
]

/** EquipmentReservation packages; the ZIP files are produced by scripts/generate-example-zips.mjs. */
export const ersLessonPackages: LessonPackage[] = [
  {
    number: 5,
    title: 'Integracija modula, ugovori i podaci',
    summary: 'Razgraničenje domena, aplikacionog sloja, portova, adaptera i API-ja, uz proveru idempotentnosti zahteva.',
    zip: '/downloads/vezba-5-integracija-modula.zip',
    contents: ['Rešenje', 'Izvorni kod', 'Testovi'],
  },
  {
    number: 6,
    title: 'Kontrolisan razvoj uz AI',
    summary: 'Projektna pravila, evidencija odluka i Kova skill-ovi sa jasno podeljenim ulogama i režimima rada.',
    zip: '/downloads/vezba-6-ai-workflow.zip',
    contents: ['Konfiguracija'],
  },
  {
    number: 7,
    title: 'MCP: povezivanje agenata sa projektom',
    summary: 'Ograničen pristup projektnoj dokumentaciji, strukturi izvornog koda, izmenama i rezultatima testova.',
    zip: '/downloads/vezba-7-mcp.zip',
    contents: ['Izvorni kod', 'Konfiguracija'],
  },
  {
    number: 8,
    title: 'Hooks, guardrails i evaluacije',
    summary: 'Izvršiva pravila za AI alate i evaluacioni scenariji za proveru arhitekture, bezbednosti i kvaliteta rezultata.',
    zip: '/downloads/vezba-8-guardrails-evals.zip',
    contents: ['Izvorni kod', 'Konfiguracija', 'Evaluacije', 'Testovi'],
  },
]
