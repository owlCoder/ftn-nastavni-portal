# FTN nastavni portal

React i TypeScript aplikacija za brz pristup nastavnim materijalima. Bez prijave i imitacije operativnog sistema: izbor predmeta, pregled vežbi, pretraga i direktno otvaranje PDF dokumenata i preuzimanje ZIP primera.

[Nastavni portal](https://owlcoder.github.io/ftn-nastavni-portal/) · [Nastavni materijali](https://github.com/owlCoder/ftn-nastavni-materijali)

[![Build](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/build.yml/badge.svg)](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/build.yml)
[![GitHub Pages](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml/badge.svg)](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml)

## Predmeti

| Predmet | Sadržaj |
|---|---|
| ERS — Elementi razvoja softvera | Osam vežbi, prezentacije, Logger–Blogger, ECommerce, Equipment Reservation i projektna specifikacija |
| OIB — Osnove informacione bezbednosti | Osam vežbi, prezentacije, osam .NET primera, projektna specifikacija i uputstvo za bodovanje |
| ODP — Osnove distribuiranog programiranja | Osam vežbi, prezentacije, osam .NET primera i projektna specifikacija |
| IBIS — Informaciona bezbednost infrastrukturnih sistema | SCADA prezentacije i specifikacije SCADALattice, RackMetria i RouteMetria |

Za svaki predmet odmah su prikazane **Računarske vežbe**, sa direktnim linkovima za PDF prezentaciju, tekst vežbe u praktikumu i ZIP primer koda. Na stranici predmeta dostupne su i sve prezentacije, programski primeri, projektna dokumentacija, kontrolne tačke i uputstva. Pretraga u zaglavlju pretražuje materijale sva četiri predmeta.

Portal objavljuje PDF prezentacije; PPTX izvori ostaju u repozitorijumu nastavnih materijala. Primeri i tekstovi zadataka usklađeni su između oba repozitorijuma.

U folderu **OIB → Projekat** nalazi se i [Bodovanje projekta](public/downloads/oib-projekat/OIB_Bodovanje_Projekta.pdf): šest strana sa kriterijumima, raspodelom poena, proširenjima i primerom zadatka R1-01.

Svaki predmet u folderu **Uputstva** sadrži PDF uputstva za Tapiz LMS i Tapiz Boards, dostupna za čitanje i preuzimanje.

## Korišćenje

1. Otvori [nastavni portal](https://owlcoder.github.io/ftn-nastavni-portal/).
2. Izaberi predmet (ERS, OIB, ODP ili IBIS), bez prijave.
3. Kod željene vežbe klikni **Otvori PDF**, **Pročitaj** za praktikum ili **Preuzmi ZIP** za primer koda.
4. U nastavku stranice pronađi sve prezentacije, programske primere, projekat i uputstva. Pretraga u zaglavlju pretražuje sav objavljeni sadržaj.

PDF-ovi se otvaraju u novoj kartici preglednika, a ZIP arhive preuzimaju direktno. Postojeće veze do poglavlja praktikuma, kao što je `#ers/praktikum/02`, i dalje su podržane.

## Lokalni razvoj

Potreban je Node.js 22 i npm.

```bash
npm ci
npm run dev
npm run build
npm run preview
```

Razvojni server koristi `http://localhost:5600`, a produkcioni izlaz je u `dist/`. `predev` i `prebuild` generišu Markdown dokumente i ZIP arhive iz izvora. Build proverava strukturu predmeta i sadržaj izvezenih vežbi. Novi interfejs koristi postojeće podatke iz `src/courses` i `src/components/courseFileTree.ts`; izvorni materijali nisu menjani.

## Organizacija repozitorijuma

| Putanja | Namena |
|---|---|
| `src/courses/{ers,oib,odp,ibis}` | Metapodaci, praktikum i kontrolne tačke |
| `src/components`, `src/styles` | Interfejs i izgled aplikacije |
| `src/practicum` | Model dokumenta i zajednički Markdown izvoz |
| `examples` | Izvori programskih primera |
| `public/downloads` | PDF materijali, generisani Markdown dokumenti i ZIP arhive |
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

Praktikum se uređuje u `src/courses`, a programski primeri u `examples`. Objavljene PDF putanje održavati u `src/courses/<predmet>/downloads.ts`; veličine i broj stranica treba da odgovaraju stvarnim datotekama. Nakon izmene:

```bash
npm run generate:practicum
npm run check:materials-sync
npm run build
```

Generisane dokumente iz `public/downloads/praktikum/<predmet>` preneti u `03 Racunarske vezbe` odgovarajućeg predmeta u repozitorijumu materijala. Mapiranje izvora primera, projektnih PDF-ova i zajedničkih uputstava određuje `scripts/teaching-materials.json`. Provera poredi datoteke sa susednim direktorijumom `../nastava`; druga lokacija prosleđuje se kao argument: `npm run check:materials-sync -- /putanja/do/nastava`. Korenski README daje pregled materijala, a README datoteke uz primere sadrže njihova uputstva za pokretanje i proveru.

Za uvoz ERS i OIB PDF prezentacija iz pripremljenih arhiva:

```bash
python3 scripts/import-presentations.py ./ersnovi.zip ./oibnovi.zip --dry-run
python3 scripts/import-presentations.py ./ersnovi.zip ./oibnovi.zip
```

## Objavljivanje i doprinosi

Push na `main` pokreće build, testove pogođenih primera i [GitHub Pages objavljivanje](.github/workflows/pages.yml). Pages koristi `/ftn-nastavni-portal/` kao osnovnu putanju. U podešavanjima repozitorijuma Pages izvor treba da bude **GitHub Actions**.

Pravila doprinosa su u [CONTRIBUTING.md](CONTRIBUTING.md), a prijava bezbednosnih problema u [SECURITY.md](SECURITY.md). Aplikacioni kod koristi [MIT licencu](LICENSE); nastavni dokumenti, institucionalna obeležja i tuđi resursi zadržavaju svoje uslove. Izvori i atribucije navedeni su u [NOTICE.md](NOTICE.md) i [Adwaita atribuciji](public/gnome-icons/ATTRIBUTION.md).
