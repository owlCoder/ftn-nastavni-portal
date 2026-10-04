import type { Block } from '../../../practicum/types'
import { text, list, callout, code, table, diagram } from '../../../practicum/blocks'

export const exercise6: Block[] = [
  [
    text('h1', 'Vežba 6 — Kontrolisan razvoj uz AI: kontekst, instrukcije, skill-ovi i režimi rada'),
    text('paragraph', 'AI alati uvode se nakon što je u Vežbi 5 uspostavljeno razumljivo i testirano jezgro sistema. Rad se nastavlja u rešenju <code>examples/ers-ai-workflow/EquipmentReservation.sln</code>. AI deo primera podešen je za <b>Kova</b>, lokalnog AI agenta za VS Code, koji konfiguraciju čita iz direktorijuma <code>.kova/</code>, dok projektna pravila stoje u <code>AGENTS.md</code>. AI alat mora poštovati postojeće arhitektonske granice, a rezultat se proverava izgradnjom projekta, testovima i pregledom izmena.'),
    diagram('Kontrolisan tok nad EquipmentReservation solution-om', [
      ['Zadatak', 'jasan cilj i kriterijumi', 'slate'],
      ['Kontekst', 'relevantni projekti i testovi', 'cyan'],
      ['Instrukcije', 'AGENTS.md', 'blue'],
      ['Skill + režim', '.kova/skills i Plan/Manual', 'violet'],
      ['Provera', 'build, test i git diff', 'emerald'],
    ]),
  ],

  [
    text('h2', '6.1. Priprema: Kova u VS Code-u'),
    text('paragraph', 'Kova je lokalni AI agent za VS Code, dostupan kao ekstenzija <code>owlcoder.kova-local</code>. Podrazumevani provajder je Ollama sa modelom <code>qwen3:4b</code>, pa se ceo primer može raditi bez slanja koda van računara. Opis u praktikumu odgovara verziji Kova 0.3.2 ili novijoj.'),
    list([
      'Instalirati VS Code 1.100 ili noviji, ekstenziju Kova, Ollama i model <code>qwen3:4b</code>. Audit hook iz Vežbe 8 koristi Node.js.',
      'Izgraditi solution u Release konfiguraciji, jer Kova pokreće MCP server i guardrail projekat sa <code>--no-build</code>.',
      'Otvoriti direktorijum <code>examples/ers-ai-workflow</code> kao VS Code workspace. Skill-ovi, MCP, hook-ovi i guardrail koriste upravo taj root.',
      'Pokrenuti <b>Kova: Open Chat</b>, izabrati model, režim rada i skill. Za Qwen3 uključiti Thinking: bez njega model razmišljanje ispisuje kao običan odgovor i ne vraća pozive alata.',
    ], true),
    code('bash', `ollama pull qwen3:4b
cd examples/ers-ai-workflow
dotnet build EquipmentReservation.sln --configuration Release
code .`, 'Priprema modela, solution-a i workspace-a'),
    table(['Režim', 'Šta agent sme'], [
      ['Plan', 'Samo alati za čitanje; nema izmena datoteka ni pokretanja komandi.'],
      ['Manual', 'Čitanje radi direktno; svaki upis i svaki proces traže odobrenje.'],
      ['Edit', 'Uobičajene izmene u workspace-u rade direktno; procesi traže odobrenje.'],
      ['Auto', 'Izmene i komande sa liste <code>kova.commands.allow</code> rade direktno; ostalo traži odobrenje ili se blokira.'],
    ]),
    text('paragraph', 'Na vežbama se koriste režimi Plan i Manual, jer je u njima svaka izmena vidljiva pre izvršenja. Guardrail iz Vežbe 8 važi u svakom režimu. Budžet konteksta, Thinking i lista dozvoljenih komandi menjaju se kroz <b>Kova: Open Settings</b>.'),
    callout('warning', 'Drugi provajderi šalju kontekst van računara', 'Postavkom <code>kova.provider</code> može se izabrati DeepSeek ili OpenAI-kompatibilan endpoint, a ključ se unosi komandom <b>Kova: Set Provider API Key</b> i čuva u VS Code SecretStorage, ne u <code>settings.json</code>. Upit i priloženi kontekst tada odlaze na taj endpoint, pa pravilo da se tajne i <code>.env</code> ne daju agentu postaje još važnije.'),
  ],

  [
    text('h2', '6.2. Od nejasnog zahteva do proverljivog zadatka'),
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
  ],

  [
    text('h2', '6.3. Projektne instrukcije su verzionisana pravila'),
    text('paragraph', 'Projektna pravila stoje u datoteci <code>AGENTS.md</code> u korenu repozitorijuma. To je otvorena konvencija za instrukcije AI agentima koju prepoznaje više alata, pa pravila ostaju ista i kada se alat promeni. Pravila u primeru su konkretna za arhitekturu ovog solution-a i mogu se proveriti čitanjem project reference-a i pokretanjem testova.'),
    callout('note', 'Kova i AGENTS.md', 'Kova od verzije 0.3.2 učitava <code>AGENTS.md</code> iz korena projekta u svako pokretanje, pre izabranog skill-a, i to prikazuje u listi aktivnosti kao <em>Project rules · AGENTS.md</em>. Skill-ovi zato ne ponavljaju projektna pravila i ne čitaju ih sami. Datoteka sme da ima najviše 16.000 bajtova; veću Kova preskače uz poruku, a test <code>AiWorkflowArtifactsTests</code> pada čim se ta granica pređe.'),
    code('markdown', `## Komande
- Izgradnja: dotnet build EquipmentReservation.sln --configuration Release
- Testovi: dotnet test EquipmentReservation.sln --configuration Release --no-build
- Pregled izmena: git diff -- .

## Arhitektura
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
5. Ne čitaj .env, tajne ili pristupne tokene.`, 'examples/ers-ai-workflow/AGENTS.md'),
    text('paragraph', '<code>.ai/AI_USAGE.md</code> čuva sažet trag: zadatak, korišćeni alat i režim, kontekst, predlog modela, odluku tima i nezavisan dokaz provere. Potpuni chat transcript nije zamena za inženjersku evidenciju. Gotov primer sadrži jedan prihvaćen i jedan odbijen predlog, jer zapis ima vrednost tek kada pokazuje i razlog odluke.'),
    code('markdown', `## Primer zapisa — odbijen predlog

- **Zadatak:** odrediti gde se sprovodi pravilo raspoložive količine opreme.
- **Alat:** Kova, model qwen3:4b, režim Plan, skill architecture-review.
- **Kontekst:** InMemoryInventoryModule.cs, InventoryReservationService.cs,
  ReservationEndpoints.cs, AGENTS.md.
- **Predlog AI alata:** uporediti traženu i raspoloživu količinu direktno
  u InMemoryInventoryModule, jer adapter već drži stanje zalihe.
- **Odluka tima:** odbijeno; poslovna odluka bi prešla u Infrastructure
  i svaki novi adapter bi morao da je ponovi. Pravilo ostaje u domenskom
  servisu InventoryReservationService, a adapter ga samo poziva.
- **Provera:** testovi Reserve_WhenStockIsInsufficient_ReturnsStableErrorCode
  i CreateReservation_WhenInventoryIsInsufficient_RejectsWithoutChangingInventory.`, 'examples/ers-ai-workflow/.ai/AI_USAGE.md'),
  ],

  [
    text('h2', '6.4. Skill za ponovljiv pregled pull request-a'),
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
- projektna pravila iz AGENTS.md (Kova ih učitava automatski)
- git diff (MCP alat get_git_diff)
- rezultat testova (MCP alat run_unit_tests)

## Postupak
1. Sažmi očekivano ponašanje.
2. Proveri da li diff izlazi iz obima zahteva.
3. Proveri Dependency Rule i granice modula.
4. Pregledaj negativne i granične scenarije.
5. Uporedi promenjeno ponašanje sa testovima.
6. Prijavi nalaze po ozbiljnosti.

## Ograničenje
Ne menjaj kod tokom review faze.`, 'Sažeta verzija procedure iz gotovog primera'),
    list([
      'Zaglavlje sadrži samo <code>name</code> i <code>description</code>; naziv mora da odgovara nazivu direktorijuma.',
      'Skill se bira iz liste <b>Skill</b> iznad polja za unos; u kontekst modela ulazi samo izabrani skill.',
      'Posle dodavanja novog skill-a pokrenuti <b>Developer: Reload Window</b> i ponovo otvoriti Kova; izbor <b>None</b> uklanja skill iz razgovora.',
      'Skill je proceduralni kontekst: ne može da promeni dozvole, odobri alat niti izmeni zaštićenu konfiguraciju.',
    ]),
    callout('info', 'Podela odgovornosti', 'Uloga namenjena pregledu ne treba istovremeno da bude autor izmene koju ocenjuje. Razdvajanje uloga omogućava nezavisniju proveru rezultata.'),
  ],

  [
    text('h2', '6.5. Specijalizovane uloge i najmanje privilegije'),
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
  ],

  [
    text('h2', '6.6. AI rezultat nije dokaz'),
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
  ],

  [
    text('h2', '6.7. Rad na vežbi — razvojni tok uz podršku AI alata'),
    callout('task', 'Zadatak', 'Na kopiji <code>EquipmentReservation.sln</code> zadati malu promenu poslovnog pravila. Prvo koristiti skill <code>architecture-review</code> u režimu Plan samo za analizu; zatim skill-u <code>implement-approved-plan</code> u režimu Manual proslediti usvojen plan. Na kraju pokrenuti solution build/test, pregledati diff i uneti sažet zapis u <code>.ai/AI_USAGE.md</code>.'),
    table(['Dokaz', 'Šta student pokazuje'], [
      ['Plan pre izmene', 'Da je razumeo pogođene slojeve i granice.'],
      ['Ograničen skup izmena', 'Da AI agent nije proširio obim zadatka van usvojenog plana.'],
      ['Build + test rezultat', 'Da provera nije zasnovana na tvrdnji modela.'],
      ['AI_USAGE zapis', 'Da tim može rekonstruisati odluku, razlog prihvatanja ili odbijanja predloga i dokaz provere.'],
    ]),
    callout('success', 'Ishod vežbe', 'Student ume da koristi AI alat uz očuvanje SOLID principa, arhitektonskih granica i sopstvene odgovornosti za konačan rezultat.'),
  ],
].flat()
