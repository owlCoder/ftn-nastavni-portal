# FTN nastavni portal

Javni web portal za nastavne materijale na Fakultetu tehničkih nauka. Portal objedinjuje prezentacije, praktikume, primere koda i projektne informacije za predmete na studijskom programu Primenjeno softversko inženjerstvo.

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
  main.tsx, App.tsx      ulazna tačka i izbor predmeta
  courses/               sadržaj po predmetu: ers/, oib/, odp/
    types.ts             Course, Checkpoint i tipovi materijala za preuzimanje
    <predmet>/index.ts   opis predmeta koji portal prikazuje
    <predmet>/checkpoints.ts
    ers/practicum/       uvod, vežbe 1–8 i završni deo praktikuma
  practicum/             model dokumenta: blokovi i sklapanje praktikuma
  components/            prikaz: CourseApp, tabovi, document/, examples/
  lib/                   pomoćne funkcije (putanje, isticanje koda, fullscreen)
  styles/                stilovi portala
examples/                izvorni kod primera (ERS i OIB)
public/downloads/        PDF i ZIP materijali dostupni studentima
scripts/                 priprema ZIP paketa i lokalno pokretanje
```

### Kontrolne tačke

Kontrolne tačke svakog predmeta definisane su na jednom mestu, u `src/courses/<predmet>/checkpoints.ts`. Iz te liste nastaju i kartica „Kontrolne tačke" i odgovarajući odeljci u praktikumu: `buildPracticum` svaku tačku ubacuje jednom, posle poslednje vežbe iz njenog opsega (`exercises`). Zahtevi se zato ne prepisuju u tekst vežbi; izmena termina, opsega ili stavke radi se samo u toj datoteci.

### Primeri

Praktikum citira kod iz `examples/`. Posle izmene primera treba uskladiti odgovarajuću vežbu u `src/courses/ers/practicum/` i fokus liste u `scripts/generate-example-zips.mjs`; ZIP paketi se ponovo prave pri svakom `npm run dev` i `npm run build`.

## Struktura javnih materijala

Prezentacije su dostupne u PDF formatu za pregled i u PPTX formatu za nastavno uređivanje. Primeri koda su organizovani po predmetu i vežbi, sa posebnim paketom za svaku vežbu i zbirnim paketom tamo gde je to potrebno.
