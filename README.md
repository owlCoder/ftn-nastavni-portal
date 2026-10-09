# FTN Desktop — GNOME-inspirisani nastavni portal

FTN Desktop je javna React/TypeScript web aplikacija koja nastavne materijale Fakulteta tehničkih nauka prikazuje kao interaktivnu radnu površinu u stilu GNOME Shell/Adwaita. Studenti mogu da otvaraju **ERS, OIB i ODP praktikume u prozorima**, pregledaju prezentacije i primere, koriste beleške i igraju Sudoku, Tetris, Space Invaders, Snake i 2048.

**FTN Desktop nije instaliran operativni sistem.** Izgled radne površine, prozori, Activities pregled, sistemska podešavanja i neke statistike su web simulacija. Vreme i kalendar prikazuju stvarne podatke: sat koristi vremensku zonu Europe/Belgrade, a vremenska prognoza Novi Sad/Open-Meteo.

## O sistemu

U okviru desktopa otvori **README.md** da prikažeš ekran „O sistemu”, sa podacima o portalu, načinu upotrebe, primerom moćne radne stanice i originalnim AMD/NVIDIA logotipima.

### High-end demonstracioni profil (nije tvoj stvarni hardver)

| Komponenta | Simulirana konfiguracija |
| --- | --- |
| CPU | **AMD Ryzen 9 9950X3D** — 16 jezgara / 32 niti |
| GPU | **NVIDIA GeForce RTX 5090** — 32 GB GDDR7 |
| RAM | **128 GB DDR5** |
| Skladište | **4 TB NVMe SSD** |
| Desktop UI | **FTN Desktop**, izgled inspirisan GNOME 51 / Adwaita |
| Implementacija | React, TypeScript, Vite (pokreće se u browseru) |

<p>
  <img src="public/brand/amd.svg" alt="AMD logo" height="36" width="130"/>
  &nbsp;
  <img src="public/brand/nvidia.svg" alt="NVIDIA logo" height="36" width="80"/>
</p>

Logotipi su preuzeti iz [Simple Icons](https://github.com/simple-icons/simple-icons) (CC0); robne marke pripadaju svojim nosiocima. Ovo **ne znači** da AMD ili NVIDIA podržavaju projekat. Adwaita ikone u `public/gnome-icons/` su rad GNOME Project-a (LGPL v3 ili CC BY-SA 3.0 US; pogledati `public/gnome-icons/ATTRIBUTION.md`).

### Prijava i personalizacija

Na ulazu je lokalna prijava namenjena prikazu desktop iskustva:

- **Korisničko ime:** `student`
- **Lozinka:** `ftn`

Ova prijava je **isključivo klijentska** (hardkodovana u isporučenom JavaScript-u) i ne štiti privatne ili poverljive resurse. **Ne koristiti je kao realnu autentifikaciju.** Za produkcionu kontrolu pristupa potrebno je dodati serversku autentifikaciju i sesije.

`localStorage` čuva status prijave (`ftn-os-session-v1`), izabranu pozadinu (10 predefinisanih), svetlu/tamnu temu, prikaz widgeta, noćni režim, osvetljenje i rekorde za Snake i 2048. Odjava briše samo status prijave, a podešavanja i beleške ostaju u istom browseru. Dok je korisnik prijavljen, **donji dock je uvek vidljiv** sa aplikacijama za tri predmeta i igre. Drawer sa aplikacijama je modalni prozor koji se zatvara klikom van njega ili tasterom Esc.

### Korišćenje

- **Aktivnosti** otvaraju umanjeni prikaz svih aplikacija; pretraga radi po nazivu predmeta ili aplikacije. Podržani su Super ili Ctrl+Space, kao i Esc za zatvaranje.
- **Folderi predmeta** se otvaraju dvoklikom u istom tabu; prozori se mogu pomerati, minimizovati, maksimizovati i prebaciti preko celog ekrana.
- **Gornja traka** sadrži pravi sat, kalendar i simulirane sistemske kontrole; **Quick Settings** omogućavaju promenu teme, prikaza widgeta i izgleda pozadine.
- **Widgeti** prikazuju prognozu, časovnik, kalendar i *jasno obeležene simulirane* CPU/RAM/SSD vrednosti. Beleške se čuvaju samo lokalno u browseru.


## Dostupni predmeti

- **Elementi razvoja softvera**: praktikum, prezentacije, primeri koda i kontrolne tačke projekta.
- **Osnove informacione bezbednosti**: praktikum, prezentacije, .NET primeri i kontrolne tačke projekta.
- **Osnove distribuiranog programiranja**: projektna dokumentacija i materijali koji se postepeno dodaju.

Materijali su namenjeni studentima za pregled i preuzimanje, a nastavnicima za održavanje sadržaja.

## Lokalno pokretanje

Potreban je Node.js 22.

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 5600
```

Portal je tada dostupan na `http://localhost:5600`.

Za Windows se može koristiti `start.cmd`, a za macOS/Linux `./start.sh`.

## Provera produkcijskog build-a

```bash
npm run build
npm run preview
```

Vite generiše statički sadržaj u `dist/`. Pre build-a skripta priprema ZIP pakete sa primerima za preuzimanje.

## CI/CD

GitHub Actions workflow `.github/workflows/build.yml` proverava svaki pull request i svaki push na `main`:

1. instalira zavisnosti komandom `npm ci`;
2. priprema ZIP pakete sa primerima;
3. proverava produkcijski build komandom `npm run build`.

Vercel projekat `ftn-nastavni-portal` povezan je sa ovim GitHub repozitorijumom. Push na `main` automatski pokreće production deploy preko Vercel Git integracije. Tokeni i pristupni podaci nisu deo repozitorijuma.

Produkciona adresa: [ftn-nastavni-portal.vercel.app](https://ftn-nastavni-portal.vercel.app/)

## Organizacija koda

```text
src/
  main.tsx, App.tsx      ulazna tačka i GNOME desktop shell
  courses/               sadržaj po predmetu: ers/, oib/, odp/
    types.ts             Course, Checkpoint i tipovi materijala za preuzimanje
    <predmet>/index.ts   opis predmeta koji portal prikazuje
    <predmet>/checkpoints.ts
    ers/practicum/       uvod, vežbe 1–8 i završni deo praktikuma
  practicum/             model dokumenta: blokovi i sklapanje praktikuma
  components/            GnomeDesktop, SystemAbout, DesktopGames, CourseApp, document/, examples/
  lib/                   pomoćne funkcije (putanje, isticanje koda, fullscreen)
  styles/                GNOME / Adwaita stilovi portala i sadržaja
examples/                izvorni kod primera (ERS i OIB)
public/downloads/        PDF i ZIP materijali dostupni studentima
public/brand/            vektorski logotipi (AMD, NVIDIA, FTN)
public/gnome-icons/      Adwaita SVG ikonice i licenca
scripts/                 priprema ZIP paketa i lokalno pokretanje
```

### Kontrolne tačke

Kontrolne tačke svakog predmeta definisane su na jednom mestu, u `src/courses/<predmet>/checkpoints.ts`. Iz te liste nastaju i kartica „Kontrolne tačke" i odgovarajući odeljci u praktikumu: `buildPracticum` svaku tačku ubacuje jednom, posle poslednje vežbe iz njenog opsega (`exercises`). Zahtevi se zato ne prepisuju u tekst vežbi; izmena termina, opsega ili stavke radi se samo u toj datoteci.

### Primeri

Praktikum citira kod iz `examples/`. Posle izmene primera treba uskladiti odgovarajuću vežbu u `src/courses/ers/practicum/` i fokus liste u `scripts/generate-example-zips.mjs`; ZIP paketi se ponovo prave pri svakom `npm run dev` i `npm run build`.

## Struktura javnih materijala

Prezentacije su dostupne u PDF formatu za pregled i u PPTX formatu za nastavno uređivanje. Primeri koda su organizovani po predmetu i vežbi, sa posebnim paketom za svaku vežbu i zbirnim paketom tamo gde je to potrebno.
