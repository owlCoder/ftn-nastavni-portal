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

GitHub Actions workflow `.github/workflows/build.yml` izvršava sledeći tok:

1. instalira zavisnosti komandom `npm ci`;
2. proverava produkcijski build komandom `npm run build`;
3. nakon uspešnog build-a na grani `main` priprema i objavljuje produkciju na Vercel-u.

Za Vercel deploy potrebno je u GitHub repozitorijumu podesiti sledeći Actions secret:

- `VERCEL_TOKEN`

`VERCEL_ORG_ID` i `VERCEL_PROJECT_ID` su podešeni kao repository variables i pripadaju Vercel projektu koji hostuje portal. Token se ne upisuje u repozitorijum.

Produkciona adresa: [predmeti-ftn.vercel.app](https://predmeti-ftn.vercel.app/)

## Organizacija koda

- `src/StaticApp.tsx` — izbor predmeta i deljeni prikaz portala;
- `src/content/` — nastavni sadržaj za ERS i OIB;
- `src/ExamplesEnhancer.tsx` — prikaz primera i paketa za preuzimanje;
- `src/*css` — stilovi za portal, prezentacije i kontrolne tačke;
- `public/downloads/` — PDF, ZIP i projektni paketi dostupni studentima;
- `public/brand/` i `public/course-assets/` — vizuelni materijal portala;
- `scripts/` — pomoćne skripte za pripremu paketa.

## Struktura javnih materijala

Prezentacije su dostupne u PDF formatu za pregled i u PPTX formatu za nastavno uređivanje. Primeri koda su organizovani po predmetu i vežbi, sa posebnim paketom za svaku vežbu i zbirnim paketom tamo gde je to potrebno.
