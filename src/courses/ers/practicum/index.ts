import type { Block, CourseDocument, DocumentPage } from '../types'
import { exercise1 } from './canvaExercise1'
import { exercise4 } from './canvaExercise4'
import { exercise5 } from './canvaExercise5'
import { exercise6 } from './canvaExercise6'
import { exerciseIntegration } from './canvaExerciseIntegration'
import { exerciseAiWorkflow } from './canvaExerciseAiWorkflow'
import { exercise9 } from './canvaExercise9'
import { exercise10 } from './canvaExercise10'
import { reflowPages } from './contentLayout'
import { text, list, callout, table, image, page } from './canvaPracticumShared'

let metaSequence = 0
const id = (prefix: string) => `praktikum-${prefix}-${String(++metaSequence).padStart(3, '0')}`

const institution = (): Block => ({
  id: id('institution'),
  type: 'institution',
  university: 'Univerzitet u Novom Sadu',
  faculty: 'Fakultet tehničkih nauka',
  department: 'Primenjeno softversko inženjerstvo · 2026/2027',
  leftLogoSrc: '/brand/university.svg',
  rightLogoSrc: '/brand/ftn.svg',
})

const cover = (): DocumentPage => ({
  id: id('page'),
  label: 'Naslovna',
  layout: 'cover',
  blocks: [
    institution(),
    { id: id('title'), type: 'text', variant: 'title', html: 'Praktikum iz predmeta Elementi razvoja softvera', align: 'center' },
    { id: id('subtitle'), type: 'text', variant: 'subtitle', html: 'Akademska 2026/2027. godina', align: 'center' },
    { id: id('quote'), type: 'text', variant: 'quote', html: 'Materijal za vežbe, samostalan rad i kontinuirani razvoj projektnog zadatka.', align: 'center' },
    { id: id('caption'), type: 'text', variant: 'caption', html: 'Univerzitet u Novom Sadu · Fakultet tehničkih nauka · Primenjeno softversko inženjerstvo', align: 'center' },
  ],
})

const introPages = (): DocumentPage[] => [
  page('0.1. Kako koristiti praktikum', [
    text('h1', '0.1. Kako koristiti praktikum'),
    text('paragraph', 'Praktikum prati sadržaj vežbi i razvoj projektnog zadatka. Svaka oblast sadrži teorijsko objašnjenje, praktičan primer, pitanja za proveru razumevanja i zadatke povezane sa projektnim repozitorijumom. Nakon vežbe student treba da ume da obrazloži donete odluke i primeni obrađeni princip u drugom kontekstu.'),
    table(['Faza', 'Preporučeni način rada'], [
      ['Pre vežbe', 'Pročitati uvodni deo oblasti i označiti pojmove koji zahtevaju dodatno razjašnjenje.'],
      ['Tokom vežbe', 'Pratiti demonstraciju i obrazloženje odluka, a ne samo konačan kod ili niz komandi.'],
      ['Posle vežbe', 'Primeniti obrađeni princip u projektnom repozitorijumu i dokumentovati rezultat kroz commit, test, tehnički dokument ili zapis o upotrebi AI alata.'],
      ['Pre projektne kontrolne tačke', 'Proći kontrolnu listu, proveriti izgradnju projekta i testove, a zatim pregledati konačan diff. Svaki član tima treba da ume da obrazloži urađeno.'],
    ]),
    callout('info', 'Nastavni primeri', 'Praktikum koristi domen rezervacije fakultetske opreme i studije slučaja Logger–Blogger i ECommerce za poređenje arhitektonskih odluka. Studentski tim primenjuje iste principe na sopstvenu temu i samostalno oblikuje projektnu strukturu.'),
    callout('note', 'Jezik i alati', 'Primeri su pretežno u C#/.NET okruženju. Sintaksa pojedinih AI alata može se menjati između verzija, zato se u praktikumu naglašavaju stabilni koncepti: kontekst, ugovori, granice alata, provera rezultata i evaluacioni scenariji.'),
  ]),
  page('0.2. Tok semestra i projekta', [
    text('h1', '0.2. Tok semestra i projekta'),
    text('paragraph', 'Praktikum je organizovan u osam povezanih vežbi. Prva obrađuje zahteve, backlog, Git i timski razvojni tok. Druga povezuje objektno orijentisano programiranje i principe čistog koda sa SOLID principima i Clean Architecture. Slede poslovna logika, testiranje i integracija modula i podataka. Završne vežbe obrađuju razvoj uz podršku AI alata, Model Context Protocol (MCP) i izvršive mehanizme provere.'),
    image('/course-assets/semester-map.svg', 'Tok praktikuma: zahtevi i razvojni proces → arhitektura → poslovna logika → testiranje → integracija modula → razvoj uz AI podršku → MCP → završna provera kvaliteta.', 'Mapa semestra'),
    list([
      'P1 (Vežba 1–2) — problem, backlog, kriterijumi prihvatanja i uredan razvojni tok kroz Git i pull request.',
      'P2 (Vežba 2–3) — arhitektonske granice, najmanje jedan vertikalni prolaz kroz sistem i koherentni slučajevi upotrebe.',
      'P3 (Vežba 4) — testirano funkcionalno jezgro i Git tag `manual-core-baseline`.',
      'P4 (Vežba 6–8) — stabilne projektne instrukcije, ponovljive procedure, MCP integracija, hook i guardrail mehanizmi, evaluacioni scenariji i završna odbrana.',
    ]),
  ]),
]

const summaryPages = (): DocumentPage[] => [
  page('Sažetak: isti principi u novom razvojnom okruženju', [
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
  ]),
]

const literaturePages = (): DocumentPage[] => [
  page('Preporučena literatura i dokumentacija', [
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
      'Zvanična dokumentacija AI razvojnog okruženja koje se koristi na vežbama; pratiti aktuelnu verziju sintakse za projektne instrukcije, procedure, agente i hooks.',
    ]),
    callout('note', 'Napomena o verzijama', 'AI alati i njihova konfiguraciona sintaksa menjaju se brže od osnovnih principa softverskog inženjerstva. Kada se razlikuje konkretna komanda ili naziv konfiguracione datoteke, treba pratiti aktuelnu zvaničnu dokumentaciju, ali zadržati isti mentalni model, granice odgovornosti i način provere.'),
  ]),
]

const chapter = (pages: DocumentPage[], name: string) => reflowPages(pages, name)

function renumberExercisePages(pages: DocumentPage[], from: number, to: number): DocumentPage[] {
  const exercisePrefix = new RegExp(`^Vežba ${from}\\b`)
  const sectionPrefix = new RegExp(`^${from}(?=\\.)`)

  return pages.map((sourcePage) => ({
    ...sourcePage,
    label: (sourcePage.label || '')
      .replace(exercisePrefix, `Vežba ${to}`)
      .replace(sectionPrefix, String(to)),
    blocks: sourcePage.blocks.map((block) => {
      if (block.type !== 'text' || !['h1', 'h2', 'h3'].includes(block.variant)) return block
      return {
        ...block,
        html: block.html
          .replace(exercisePrefix, `Vežba ${to}`)
          .replace(sectionPrefix, String(to)),
      }
    }),
  }))
}

function plain(html: string) {
  return html.replace(/<[^>]+>/g, '').trim()
}

function pageContainsHeading(page: DocumentPage, needle: string) {
  return page.blocks.some((item) => item.type === 'text' && ['h1', 'h2'].includes(item.variant) && plain(item.html).startsWith(needle))
}

function contentsPage(body: DocumentPage[]): DocumentPage {
  const exerciseNumbers = Array.from({ length: 8 }, (_, index) => index + 1)
  const wanted = [
    ['Uvod i način rada', '0.1. Kako koristiti praktikum'],
    ['Tok semestra i projekta', '0.2. Tok semestra i projekta'],
    ...exerciseNumbers.map((number) => [`Vežba ${number}`, `Vežba ${number}`] as [string, string]),
    ['Sažetak', 'Sažetak: isti principi'],
    ['Literatura i dokumentacija', 'Preporučena literatura'],
  ] as Array<[string, string]>

  const rows = wanted.map(([label, needle]) => {
    const index = body.findIndex((item) => pageContainsHeading(item, needle))
    if (index < 0) return [label, '—']
    const target = body[index]
    const pageNumber = index + 3
    return [`<a class="toc-link" href="#page-${target.id}">${label}</a>`, String(pageNumber)]
  })

  return page('Sadržaj', [
    text('h1', 'Sadržaj'),
    text('paragraph', 'Pregled oblasti i početnih strana. Naslovi u elektronskoj verziji vode direktno na odgovarajuće poglavlje.'),
    table(['Oblast', 'Strana'], rows),
  ])
}

const bodyPages = [
  ...chapter(introPages(), 'Uvod'),
  ...chapter(exercise1(), 'Vežba 1'),
  ...chapter(renumberExercisePages(exercise4(), 4, 2), 'Vežba 2'),
  ...chapter(renumberExercisePages(exercise5(), 5, 3), 'Vežba 3'),
  ...chapter(renumberExercisePages(exercise6(), 6, 4), 'Vežba 4'),
  ...chapter(exerciseIntegration(), 'Vežba 5'),
  ...chapter(exerciseAiWorkflow(), 'Vežba 6'),
  ...chapter(renumberExercisePages(exercise9(), 9, 7), 'Vežba 7'),
  ...chapter(renumberExercisePages(exercise10(), 10, 8), 'Vežba 8'),
  ...chapter(summaryPages(), 'Zaključak'),
  ...chapter(literaturePages(), 'Literatura'),
]

export const practicum2026: CourseDocument = {
  version: 7,
  id: 'ers-praktikum-2026-27-current',
  title: 'Praktikum 2026/27',
  subtitle: 'Elementi razvoja softvera',
  subject: 'Elementi razvoja softvera',
  kind: 'praktikum',
  headerText: 'Elementi razvoja softvera',
  footerText: 'Primenjeno softversko inženjerstvo',
  createdAt: '2026-08-25T12:00:00.000Z',
  updatedAt: '2026-09-05T22:45:00.000Z',
  theme: { name: 'Academic Light', font: 'System', accent: 'blue', density: 'comfortable', codeTheme: 'light', pageSize: 'A4' },
  pages: [cover(), contentsPage(bodyPages), ...bodyPages],
}
