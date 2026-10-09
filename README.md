# FTN Teaching Portal

**A browser-based desktop for course materials, exercises, and learning tools.**

[![Build](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/build.yml/badge.svg)](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/build.yml)
[![GitHub Pages](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml/badge.svg)](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml)
[![License: MIT (code)](https://img.shields.io/badge/code%20license-MIT-blue.svg)](LICENSE)

FTN Teaching Portal is an open-source React and TypeScript application that presents course material in a desktop-like interface inspired by GNOME Shell and Adwaita. It offers a file-manager workflow for navigating study materials without switching browser tabs, a custom PDF reader, an exercise viewer, and small built-in applications.

The educational content is primarily in Serbian. **This is a web application, not an operating system or a GNOME distribution.** The project is independent and is not an official product of the University of Novi Sad, GNOME, AMD, or NVIDIA.

## Live demo

**GitHub Pages:** [owlcoder.github.io/ftn-nastavni-portal](https://owlcoder.github.io/ftn-nastavni-portal/)

> GitHub Pages must be enabled once under **Settings → Pages → Build and deployment → Source: GitHub Actions** before the first deployment will become public. See [Deployment](#deployment).

The desktop uses a *local-only* illustrative login:

| Field | Value |
| --- | --- |
| Username | `student` |
| Password | `ftn` |

These credentials are hard-coded in browser-side code and **do not authenticate or protect data**. Never use this login for private files, student records, or real access control.

## Features

- **Desktop workspace:** movable, minimizable and maximizable application windows; application overview; searchable launchers; persistent bottom dock; desktop course folders.
- **Course file manager:** nested exercise, presentation and example folders, expandable navigation tree, breadcrumbs and file previews for ERS, OIB and ODP.
- **Continuous practicum reader:** document-style scrolling, collapsible table of contents, links to exercises and zoom controls.
- **Custom PDF viewer:** PDF.js-powered rendering with page navigation, zoom, fullscreen mode and downloads, rather than the browser's built-in PDF toolbar.
- **ZIP explorer and downloads:** browse example archives, preview text-based source files, download individual documents or export entire folders as ZIP archives.
- **Project milestones:** a timeline for checkpoint dates, descriptions, and required work.
- **Desktop apps:** calendar with locally saved events, notes, system-monitor-style indicators, Sudoku, Tetris, Space Invaders, Snake and 2048.
- **Personalization:** ten preset wallpapers, dark/light appearance, widgets and preferences saved to local storage.
- **Weather and time:** Novi Sad forecast from Open-Meteo and a clock using the `Europe/Belgrade` time zone.

**Data transparency:** desktop performance indicators and the hardware profile shown in *About System* are illustrative and do not read device hardware telemetry. Local notes, preferences and game scores live in the browser's `localStorage`.

### Courses

| Code | Course | Content |
| --- | --- | --- |
| ERS | Software Development Elements | Practicum, PDF presentations, source-code examples, checkpoints and project specification |
| OIB | Fundamentals of Information Security | Practicum, PDF presentations, .NET examples and checkpoints |
| ODP | Fundamentals of Distributed Programming | Practicum, PDF presentations, .NET examples and checkpoints |

Exercise materials are arranged by course and exercise number. PDF and ZIP downloads are static assets; checkpoint/practicum text can also be exported as Markdown. Not all third-party or educational materials are distributed under the software license; see [Licensing](#licensing).

## Technology

- React 19 and TypeScript 6
- Vite 8
- CSS for the desktop, window manager, file explorer and course content
- Mozilla PDF.js (loaded from cdnjs for the custom PDF reader)
- GitHub Actions for CI and GitHub Pages deployment
- No backend, database or user-account service

## Getting started

**Requirements:** Node.js 22.x and npm.

```bash
git clone https://github.com/owlCoder/ftn-nastavni-portal.git
cd ftn-nastavni-portal
npm ci
npm run dev
```

Vite runs locally at **http://localhost:5600**. The `predev` script generates downloadable exercise ZIP packages before starting the development server.

To build and preview the production bundle:

```bash
npm run build
npm run preview
```

The production bundle is written to `dist/`. The `prebuild` script regenerates downloadable ZIP packages; those archives are therefore part of the standard deployment pipeline.

## Repository layout

```text
.github/workflows/
  build.yml                 TypeScript/Vite build on pushes and PRs
  pages.yml                 GitHub Pages publication from main
src/
  components/               Desktop, file manager, PDF reader, games, widgets
  courses/{ers,oib,odp}/    Course metadata, checkpoints, practicum materials
  practicum/                Continuous document model and composition
  lib/                      Shared utilities and asset URL resolution
  styles/                   Desktop, Adwaita-inspired UI and document styling
examples/                   Educational source-code examples
public/
  downloads/                PDF files and generated/committed ZIP archives
  brand/                    Branding assets
  gnome-icons/              Upstream Adwaita icons and attribution
scripts/
  generate-example-zips.mjs Prepare archive downloads
  import-presentations.py   Import PDF-only presentation updates
```

### Updating course content

1. Edit course metadata and practicum blocks under `src/courses/<course>/`.
2. Keep checkpoint definitions in `src/courses/<course>/checkpoints.ts` so deadlines and related practicum references stay consistent.
3. Update the relevant examples under `examples/` and, if necessary, the generated archive definitions in `scripts/generate-example-zips.mjs`.
4. Run `npm run build` before committing.

For ERS and OIB presentation updates, `scripts/import-presentations.py` accepts two existing ZIP archives and extracts **PDFs only**, preserving the repository's published file paths. PPTX files are intentionally excluded. This importer does **not** run automatically during deployment, and updated binary presentation files must be committed separately.

```bash
python3 scripts/import-presentations.py ./ersnovi.zip ./oibnovi.zip --dry-run
python3 scripts/import-presentations.py ./ersnovi.zip ./oibnovi.zip
```

## Deployment

GitHub Pages is deployed from **`main`** using [`.github/workflows/pages.yml`](.github/workflows/pages.yml). The workflow installs dependencies using `npm ci`, generates course downloads, compiles the Vite application, uploads `dist/` and publishes it using the official GitHub Pages actions.

### One-time GitHub Pages setup

A repository administrator must:

1. Open **[Settings → Pages](https://github.com/owlCoder/ftn-nastavni-portal/settings/pages)**.
2. Under **Build and deployment**, select **GitHub Actions** as the publishing source.
3. Open **[Actions → Deploy GitHub Pages](https://github.com/owlCoder/ftn-nastavni-portal/actions/workflows/pages.yml)** and run the workflow (or push another commit to `main`).

After setup, changes pushed to `main` automatically trigger a fresh deployment. The workflow sets the Vite public base path to `/ftn-nastavni-portal/` so asset links resolve correctly at the GitHub Pages repository URL.

Vercel can also serve the same static Vite application at the domain root. This project does not require Vercel for local development or GitHub Pages hosting.

## Contributing

Contributions, bug reports, UI accessibility improvements, course content corrections and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

- Check for an existing issue before filing a new one.
- Explain how to reproduce bugs and include browser details where relevant.
- Test with `npm run build`; keep the application keyboard-accessible.
- Do not submit personal information, confidential course files, credentials or third-party material without redistribution rights.

For sensitive security concerns, see [SECURITY.md](SECURITY.md).

## Licensing

The **original application source code** is available under the **MIT License** (see [LICENSE](LICENSE)). This does **not** automatically license academic slides, PDF course material, institutional branding or third-party artwork. Those works retain their respective owners and terms.

See [NOTICE.md](NOTICE.md) and [Adwaita attribution](public/gnome-icons/ATTRIBUTION.md) for third-party and educational-content details. AMD and NVIDIA marks are used illustratively; no endorsement is implied.

---

Maintained as a community-oriented educational software project. Feedback and improvements are welcome via [GitHub Issues](https://github.com/owlCoder/ftn-nastavni-portal/issues).
