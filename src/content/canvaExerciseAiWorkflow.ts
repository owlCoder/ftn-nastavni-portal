import type { DocumentPage } from '../types'
import { text, list, callout, code, table, diagram, page } from './canvaPracticumShared'

export const exerciseAiWorkflow = (): DocumentPage[] => [
  page('Vežba 6 — Razvoj uz podršku AI alata u istom rešenju', [
    text('h1', 'Vežba 6 — Kontrolisan razvoj uz AI: kontekst, instrukcije, skill-ovi i režimi rada'),
    text('paragraph', 'AI alati uvode se nakon što je u Vežbi 5 uspostavljeno razumljivo i testirano jezgro sistema. Rad se nastavlja u rešenju <code>examples/ers-ai-workflow/EquipmentReservation.sln</code>. AI deo primera podešen je za <b>Kova</b>, lokalnog AI agenta za VS Code, koji konfiguraciju čita iz direktorijuma <code>.kova/</code>. AI alat mora poštovati postojeće arhitektonske granice, a rezultat se proverava izgradnjom projekta, testovima i pregledom izmena.'),
    diagram('Kontrolisan tok nad EquipmentReservation solution-om', [
      ['Zadatak', 'jasan cilj i kriterijumi', 'slate'],
      ['Kontekst', 'relevantni projekti i testovi', 'cyan'],
      ['Instrukcije', '.ai/AI_INSTRUCTIONS.md', 'blue'],
      ['Skill + režim', '.kova/skills i Plan/Manual', 'violet'],
      ['Provera', 'build, test i git diff', 'emerald'],
    ]),
  ]),

  page('6.1. Od nejasnog zahteva do proverljivog zadatka', [
    text('h2', '6.1. Od nejasnog zahteva do proverljivog zadatka'),
    text('paragraph', 'Umesto upita „sredi rezervacije“, zadatak treba da kaže koje ponašanje menjamo, koje slojeve ne smemo da narušimo i kako dokazujemo rezultat.'),
    code('markdown', `# Zadatak
Analiziraj promenu: jedna rezervacija ne sme tražiti više od 5 komada opreme.
Ne menjaj kod u ovoj fazi.

# Ograničenja
- Poslovno pravilo mora ostati u Domain/Application delu.
- API ne sme sadržati poslovnu odluku.
- IInventoryModule ugovor menjaj samo ako je zaista potrebno.
- Postojeći testovi moraju ostati uspešni.

# Vrati
1. pogođene fajlove i slojeve,
2. pretpostavke i rizike,
3. minimalni plan izmene,
4. test scenarije,
5. komande za proveru solution-a.`, 'Primer zadatka vezan za konkretan EquipmentReservation kod'),
    callout('note', 'Prvo analiza, zatim izmena', 'Veliki diff nastao iz nejasnog upita je teško pregledati. Plan se pregleda pre nego što agent dobije dozvolu za pisanje.'),
  ]),

  page('6.2. Projektne instrukcije su verzionisana pravila', [
    text('h2', '6.2. Projektne instrukcije su verzionisana pravila'),
    text('paragraph', 'Gotov primer sadrži <code>.ai/AI_INSTRUCTIONS.md</code>. Njegova pravila su konkretna za arhitekturu ovog solution-a i mogu se proveriti čitanjem project reference-a i pokretanjem testova. Datoteka ne zavisi od alata: Kova je ne učitava automatski, pa je svaki skill čita kao prvi korak.'),
    code('markdown', `## Arhitektura
- Domain ne zavisi ni od jednog drugog projekta. Modeli nose stanje,
  a pravila sprovode domenski servisi.
- Application zavisi samo od Domain. Sadrži use-case-ove, validatore i portove.
- Infrastructure implementira portove i ne donosi poslovne odluke.
- Api i ConsoleUi su presentation adapteri i composition root-ovi.
- MCP i guardrails su razvojni alati i ne smeju postati zavisnost poslovnog jezgra.

## Ishodi
- Očekivani poslovni neuspeh vraća se kao Result sa stabilnim kodom.

## Posle izmene
1. Pokreni ciljane testove.
2. Pokreni kompletan test projekat kada je praktično.
3. Pregledaj git diff i ukloni nepovezane izmene.
4. Ne tvrdi da je nešto provereno ako stvarna komanda nije izvršena.
5. Ne čitaj .env, tajne ili pristupne tokene.`, 'examples/ers-ai-workflow/.ai/AI_INSTRUCTIONS.md'),
    text('paragraph', '<code>.ai/AI_USAGE.md</code> čuva sažet trag: zadatak, korišćeni alat i režim, kontekst, predlog modela, odluku tima i nezavisan dokaz provere. Potpuni chat transcript nije zamena za inženjersku evidenciju.'),
  ]),

  page('6.3. Skill za ponovljiv pregled pull request-a', [
    text('h2', '6.3. Skill za ponovljiv pregled pull request-a'),
    text('paragraph', 'Kova otkriva skill-ove samo u <code>.kova/skills/&lt;naziv&gt;/SKILL.md</code>. Procedura <code>.kova/skills/review-pull-request/SKILL.md</code> razdvaja review od implementacije. Isti postupak može da se primeni na više izmena u solution-u.'),
    code('markdown', `---
name: review-pull-request
description: Review an ERS change against requirements, architecture and observed test results.
---

# review-pull-request

## Režim rada
Koristi se u Kova režimu Manual.

## Ulazi
- zahtev i kriterijumi prihvatanja
- projektna pravila iz .ai/AI_INSTRUCTIONS.md
- git diff (MCP alat get_git_diff)
- rezultat testova (MCP alat run_unit_tests)

## Postupak
1. Pročitaj .ai/AI_INSTRUCTIONS.md.
2. Sažmi očekivano ponašanje.
3. Proveri da li diff izlazi iz obima zahteva.
4. Proveri Dependency Rule i granice modula.
5. Pregledaj negativne i granične scenarije.
6. Uporedi promenjeno ponašanje sa testovima.
7. Prijavi nalaze po ozbiljnosti.

## Ograničenje
Ne menjaj kod tokom review faze.`, 'Sažeta verzija procedure iz gotovog primera'),
    list([
      'Zaglavlje sadrži samo <code>name</code> i <code>description</code>; naziv mora da odgovara nazivu direktorijuma.',
      'Skill se bira iz liste <b>Skill</b> iznad polja za unos; u kontekst modela ulazi samo izabrani skill.',
      'Skill je proceduralni kontekst: ne može da promeni dozvole, odobri alat niti izmeni zaštićenu konfiguraciju.',
    ]),
    callout('info', 'Podela odgovornosti', 'Uloga namenjena pregledu ne treba istovremeno da bude autor izmene koju ocenjuje. Razdvajanje uloga omogućava nezavisniju proveru rezultata.'),
  ]),

  page('6.4. Specijalizovane uloge i najmanje privilegije', [
    text('h2', '6.4. Specijalizovane uloge i najmanje privilegije'),
    text('paragraph', 'Uloga je u primeru par skill + režim rada. Skill opisuje postupak, a režim određuje šta agent tehnički sme: u režimu Plan Kova izlaže samo alate za čitanje, dok u režimu Manual svaka izmena i svaka komanda traže odobrenje.'),
    table(['Skill u primeru', 'Kova režim i dozvole', 'Ograničenje'], [
      ['architecture-review', 'Plan: čitanje solution-a, strukture, instrukcija i diff-a.', 'Ne piše kod; režim to sprovodi nezavisno od modela.'],
      ['implement-approved-plan', 'Manual: menja samo fajlove iz usvojenog plana, uz odobrenje svake izmene.', 'Ne proširuje poslovni zahtev.'],
      ['review-pull-request', 'Manual: čita diff, a <code>run_unit_tests</code> pokreće uz odobrenje.', 'Ne menja test samo da sakrije grešku.'],
    ]),
    code('json', `{
  "task": "Implement approved reservation quantity rule",
  "constraints": [
    "Keep business rule outside Api",
    "Do not add Infrastructure dependency to Domain/Application"
  ],
  "filesToConsider": [
    "src/EquipmentReservation.Application/Reservations/Create/CreateReservationCommandValidator.cs",
    "src/EquipmentReservation.Application/Reservations/Create/CreateReservationErrorCodes.cs",
    "tests/EquipmentReservation.Tests/Application/CreateReservationCommandValidatorTests.cs"
  ],
  "verification": [
    "dotnet build EquipmentReservation.sln",
    "dotnet test EquipmentReservation.sln --no-build"
  ]
}`, 'Strukturirana predaja zadatka skill-u implement-approved-plan'),
  ]),

  page('6.5. AI rezultat nije dokaz', [
    text('h2', '6.5. AI rezultat nije dokaz'),
    text('paragraph', 'Ocena modela nije dokaz ispravnosti promene. Završetak zadatka zahteva uspešnu izgradnju rešenja, prolazak NUnit testova i pregled konačnog skupa izmena.'),
    code('bash', `dotnet build EquipmentReservation.sln --configuration Release
dotnet test EquipmentReservation.sln --configuration Release --no-build
git diff -- .`, 'Minimalna nezavisna provera nakon AI izmene'),
    list([
      'Ako komanda nije izvršena, rezultat se ne beleži kao uspešna provera.',
      'Ako test padne, ne menja se očekivanje testa bez razumevanja poslovnog pravila.',
      'Ako diff dodiruje slojeve koji nisu bili u planu, promena se vraća na analizu.',
      'Ako agent traži tajne ili .env, zahtev se odbija i prelazi na guardrail temu iz Vežbe 8.',
    ]),
  ]),

  page('6.6. Rad na vežbi — razvojni tok uz podršku AI alata', [
    text('h2', '6.6. Rad na vežbi — razvojni tok uz podršku AI alata'),
    callout('task', 'Zadatak', 'Na kopiji <code>EquipmentReservation.sln</code> zadati malu promenu poslovnog pravila. Prvo koristiti skill <code>architecture-review</code> u režimu Plan samo za analizu; zatim skill-u <code>implement-approved-plan</code> u režimu Manual proslediti usvojen plan. Na kraju pokrenuti solution build/test, pregledati diff i uneti sažet zapis u <code>.ai/AI_USAGE.md</code>.'),
    table(['Dokaz', 'Šta student pokazuje'], [
      ['Plan pre izmene', 'Da je razumeo pogođene slojeve i granice.'],
      ['Ograničen skup izmena', 'Da AI agent nije proširio obim zadatka van usvojenog plana.'],
      ['Build + test rezultat', 'Da provera nije zasnovana na tvrdnji modela.'],
      ['AI_USAGE zapis', 'Da tim može rekonstruisati odluku i razlog prihvatanja/odbijanja predloga.'],
    ]),
    callout('success', 'Ishod vežbe', 'Student ume da koristi AI alat uz očuvanje SOLID principa, arhitektonskih granica i sopstvene odgovornosti za konačan rezultat.'),
  ]),
]
