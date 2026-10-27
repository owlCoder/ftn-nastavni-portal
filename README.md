# FTN nastavni portal

React i TypeScript aplikacija za brz pristup nastavnim materijalima. Bez prijave i imitacije operativnog sistema: izbor predmeta, pregled vežbi i direktno otvaranje PDF dokumenata i preuzimanje ZIP primera.

Za **Elemente razvoja softvera (ERS)** i **Osnove informacione bezbednosti (OIB)** postoje **dve kontrolne tačke**: **KT1 u terminu 4. vežbe** i **KT2 u terminu 8. vežbe**. Kontrolne tačke i termini odbrane projekta su odvojene obaveze.

[Nastavni portal](https://owlcoder.github.io/ftn-nastavni-portal/) · [Nastavni materijali](https://github.com/owlCoder/ftn-nastavni-materijali)

[![Build](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/build.yml/badge.svg)](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/build.yml)
[![GitHub Pages](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml/badge.svg)](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml)

## Materijali sa GitHub-a

Portal prikazuje samo PDF dokumente i ZIP arhive; Word izvori ostaju u repozitorijumu materijala. Spisak foldera i fajlova portal učitava iz javnog repozitorijuma [ftn-nastavni-materijali](https://github.com/owlCoder/ftn-nastavni-materijali), sa grane `main`. Kada izmene materijala budu commitovane i poslate na tu granu, GitHub Actions osvežava indeks u repozitorijumu materijala; posetioci zatim vide izmene pri otvaranju ili klikom na **Osveži**. Osvežavanje indeksa i GitHub keša može potrajati nekoliko minuta. Nije potrebno menjati ili ponovo objavljivati portal samo zbog izmene materijala. Fajlovi se preuzimaju sa istog commita kao spisak, da se verzije ne pomešaju.

Ako GitHub nije dostupan ili ograniči broj zahteva, portal prikazuje obaveštenje i prethodno učitani spisak, odnosno mogućnost ponovnog pokušaja. PDF dokumenti otvaraju se u novoj kartici preglednika, a ZIP arhive preuzimaju direktno. Prikaz uključuje fajlove iz javnog repozitorijuma; tajne i privatni podaci ne pripadaju tamo. Provera povezivanja pokreće se komandom `npm run check:github-materials`.

## Direktorijum materijala

Početna prikazuje stablo sa svim folderima podrazumevano skupljenim. Klik na naziv foldera ili njegovu strelicu proširuje i sažima sadržaj na istoj strani, a komande „Proširi sve“ i „Sažmi sve“ upravljaju celim prikazom. Svaki predmet koristi tabelu fajlova, putanju foldera i povratak preko `..`. Dugme **ZIP ↓** uz folder ili roditeljski direktorijum preuzima ceo taj direktorijum, sa svim podfolderima. **Preuzmi folder .zip** preuzima trenutni direktorijum, a **Preuzmi sve .zip** na početnoj sve predmete, razdvojene po direktorijumima. Arhive sadrže PDF-ove, ZIP primere, zbirne pakete, tekstove praktikuma i prateće slike. Tok i greške preuzimanja prikazuju se iznad tabele.

ERS je dodatno organizovan u tri korenska foldera:

- **Opšti materijali** — osnovne informacije, pravila polaganja i zajednička uputstva.
- **Nastavni materijali** — prvo zaseban praktikum, zatim osam tema; svaka tema okuplja svoju prezentaciju, dostupne primere koda i vezu do poglavlja praktikuma.
- **Projekat** — projektna specifikacija i kontrolne tačke.

Pokrenuti `npm run dev` i otvoriti `http://127.0.0.1:5600/#ers/nastavni`. Tema ne predstavlja jednu nastavnu nedelju; nedeljni raspored se definiše posebno, nakon određivanja trajanja tema. OIB, ODP i IBIS koriste isti jednostavan prikaz uz postojeću strukturu materijala. Susedni repozitorijum `nastava` koristi iste nazive predmeta i isti logički raspored foldera. PDF i PPTX prezentacije, poglavlja praktikuma i kod okupljeni su uz odgovarajuću temu ili vežbu. Prethodne veze na portalu i dalje rade.

## Predmeti

| Predmet | Sadržaj |
|---|---|
| ERS — Elementi razvoja softvera | Osam tema, prezentacije, Logger–Blogger, ECommerce, Equipment Reservation i projektna specifikacija |
| OIB — Osnove informacione bezbednosti | Osam vežbi, prezentacije, osam .NET primera, projektna specifikacija i uputstvo za bodovanje |
| ODP — Osnove distribuiranog programiranja | Osam vežbi, prezentacije, osam .NET primera i projektna specifikacija |
| IBIS — Informaciona bezbednost infrastrukturnih sistema | SCADA prezentacije i specifikacije SCADALattice, RackMetria i RouteMetria |

Materijali se pregledaju kao folderi i fajlovi. Klik na naziv otvara folder ili dokument, a strelica za preuzimanje čuva fajl.

Portal objavljuje PDF prezentacije; PPTX izvori ostaju u repozitorijumu nastavnih materijala. Primeri i tekstovi zadataka usklađeni su između oba repozitorijuma.

U folderu **OIB → Projekat** nalazi se i [Bodovanje projekta](public/downloads/oib-projekat/OIB_Bodovanje_Projekta.pdf): šest strana sa kriterijumima, raspodelom poena, proširenjima i primerom zadatka R1-01.

Tapiz LMS i Tapiz Boards uputstva dostupna su u **ERS → Opšti materijali**, a kod ostalih predmeta u folderu **Uputstva**.

## Korišćenje

1. Otvori [nastavni portal](https://owlcoder.github.io/ftn-nastavni-portal/).
2. Izaberi predmet (ERS, OIB, ODP ili IBIS), bez prijave.
3. Otvori folder i klikni naziv prezentacije, praktikuma ili primera koda.
4. Koristi **ZIP ↓** uz bilo koji folder, uključujući **..**, za preuzimanje celog sadržaja.

PDF-ovi se otvaraju u novoj kartici preglednika, a ZIP arhive preuzimaju direktno. Postojeće veze do poglavlja praktikuma, kao što je `#ers/praktikum/02`, i dalje su podržane.

## Lokalni razvoj

Potreban je Node.js 22 i npm.

```bash
npm ci
npm run dev
npm run build
npm run preview
```

Razvojni server koristi `http://localhost:5600`, a produkcioni izlaz je u `dist/`. `predev` i `prebuild` generišu ZIP arhive primera koda. Nastavni dokumenti uređuju se u Word formatu, a prezentacije u PowerPoint formatu; PDF izvozi autor ručno. Build proverava strukturu predmeta i sadržaj izvezenih vežbi. Novi interfejs koristi postojeće podatke iz `src/courses` i `src/components/courseFileTree.ts`; izvorni materijali nisu menjani.

Produkciona izgradnja uključuje `postbuild` korak (`scripts/inline-production-css.mjs`) koji ugrađuje generisani CSS u `dist/index.html`. Time se izbegava prikaz neformatiranog interfejsa ako host ne uspe da učita zaseban CSS fajl. Vercel koristi osnovnu putanju `/`, a GitHub Pages `/ftn-nastavni-portal/`; konfiguracija je u `vite.config.ts`.

## Organizacija repozitorijuma

| Putanja | Namena |
|---|---|
| `src/courses/{ers,oib,odp,ibis}` | Metapodaci, praktikum i kontrolne tačke |
| `src/components`, `src/styles` | Interfejs i izgled aplikacije |
| `src/practicum` | Model dokumenta za čitanje na portalu |
| `examples` | Izvori programskih primera |
| `public/downloads` | Word dokumenti, PowerPoint prezentacije, postojeći PDF materijali i ZIP arhive |
| `scripts` | Generisanje preuzimanja i provere usklađenosti |
| `.github/workflows` | Build, .NET testovi i GitHub Pages objavljivanje |

## Programski primeri

Potreban je .NET 8 SDK. Komande izvršavati iz direktorijuma primera.

| ERS primer | Solution | Pokretanje |
|---|---|---|
| [Logger–Blogger](examples/ers-logger-blogger) | `Loger-Bloger.sln` | `dotnet run --project Presentation` |
| [ECommerce](examples/ers-ecommerce) | `ECommerce.sln` | `dotnet run --project WebAPI` |
| [Equipment Reservation](examples/ers-ai-workflow) | `EquipmentReservation.sln` | `dotnet run --project src/ConsoleUi` ili `src/Api` |

```bash
dotnet build <naziv-solutiona>.sln --configuration Release
dotnet test <naziv-solutiona>.sln --configuration Release --no-build
```

Logger–Blogger koristi demo naloge `maja` / `demo12345` i `ana` / `demo12345`. API primeri ispisuju adresu pri pokretanju. U [OIB](examples/oib-dotnet) i [ODP](examples/odp-dotnet) direktorijumima svaki podfolder odgovara jednoj vežbi. Za broj `NN` od `01` do `08`:

```bash
dotnet run --project src/Oib.VezbaNN.ConsoleUi
dotnet test Oib.VezbaNN.sln --configuration Release
# ODP: zameniti Oib sa Odp u obe komande.
```

Scenario i zadatak nalaze se u praktikumu. Equipment Reservation koristi `AGENTS.md`, `.kova/skills` i `.ai/AI_USAGE.md`; priprema je opisana u ERS vežbama 6–8. Pre pokretanja MCP-a i guardrails provera izgraditi Release konfiguraciju. MCP resursi su `project://instructions` i `project://readme`.

Evaluacije iz `evals/*.json` sprovode se izborom `skill` i `mode`, zadavanjem `input` i proverom svih stavki `expected.must` i `expected.mustNot`. Ishod i dokaz upisati u `.ai/AI_USAGE.md`. Unit testovi proveravaju strukturu scenarija, a član tima ocenjuje odgovor agenta.

## Izmena i usklađivanje materijala

Ugrađeni rezervni i stariji online prikazi praktikuma uređuju se u `src/courses`, a lokalni primeri u `examples`. Za te ugrađene prikaze PDF putanje održavati u `src/courses/<predmet>/downloads.ts`; veličine i broj stranica treba da odgovaraju stvarnim datotekama. Nakon izmene:

```bash
npm run generate:practicum
npm run check:materials-sync
npm run build
```

Za ugrađenu rezervnu verziju, generisane dokumente iz `public/downloads/praktikum/<predmet>` preneti na odredišta navedena u manifestu: ceo praktikum je izdvojen, poglavlja su uz teme odnosno vežbe, a kontrolne tačke uz projekat. Mapiranje svih dokumenata, slika, ZIP paketa i izvora koda određuje `scripts/teaching-materials.json`. Provera poredi datoteke sa susednim direktorijumom `../nastava`; druga lokacija prosleđuje se kao argument: `npm run check:materials-sync -- /putanja/do/nastava`. Korenski README daje pregled materijala, a README datoteke uz primere sadrže njihova uputstva za pokretanje i proveru.

Za uvoz ERS i OIB PDF prezentacija iz pripremljenih arhiva:

```bash
python3 scripts/import-presentations.py ./ersnovi.zip ./oibnovi.zip --dry-run
python3 scripts/import-presentations.py ./ersnovi.zip ./oibnovi.zip
```

## Objavljivanje i doprinosi

Push na `main` pokreće build, testove pogođenih primera i [GitHub Pages objavljivanje](.github/workflows/pages.yml). Pages koristi `/ftn-nastavni-portal/` kao osnovnu putanju. U podešavanjima repozitorijuma Pages izvor treba da bude **GitHub Actions**.

Pravila doprinosa su u [CONTRIBUTING.md](CONTRIBUTING.md), a prijava bezbednosnih problema u [SECURITY.md](SECURITY.md). Aplikacioni kod koristi [MIT licencu](LICENSE); nastavni dokumenti, institucionalna obeležja i tuđi resursi zadržavaju svoje uslove. Izvori i atribucije navedeni su u [NOTICE.md](NOTICE.md) i [Adwaita atribuciji](public/gnome-icons/ATTRIBUTION.md).

## Pravila polaganja u Word i PDF formatu

Pravila ERS i OIB imaju Word verziju za uređivanje i PDF za čitanje. Veza **Word ↓** nalazi se uz odgovarajući PDF, a ZIP preuzimanje foldera uključuje oba formata. Dokumenti zadržavaju dve kontrolne tačke, KT1 i KT2, i postojeće bodovanje, pragove i uslove.

Za ERS su pravila u **Opštim materijalima**, a za OIB u **Projektu**. Word izvori nalaze se i u odgovarajućim folderima repozitorijuma `nastava`. Nakon izmene Word dokumenta po potrebi ručno izvesti PDF; za rezervne kopije portala pokrenuti `npm run check:materials-sync` i `npm run build`.
