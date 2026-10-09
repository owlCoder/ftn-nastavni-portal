# Contributing

Thanks for helping improve FTN Teaching Portal. Contributions are welcome for desktop usability, document viewing, accessibility, translations, documentation and course material organization.

## Development workflow

1. Check [open issues](https://github.com/owlCoder/ftn-nastavni-portal/issues) to avoid duplicate work.
2. Fork the repository and create a descriptive branch from `main`.
3. Install Node.js 22.x, then run `npm ci`.
4. Start the app with `npm run dev`, and implement a focused change.
5. Run `npm run build` to verify TypeScript and the production Vite build.
6. Open a pull request explaining the change, any UI screenshots, and the testing performed.

### Code guidelines

- Keep file navigation and window controls keyboard accessible.
- Preserve the continuous practicum reading experience unless the change explicitly targets it.
- Keep all file and PDF asset paths compatible with the GitHub Pages repository base path. Prefer `assetUrl()` from `src/lib/assets.ts` for runtime public assets.
- Keep generated downloadable archives reproducible via `scripts/generate-example-zips.mjs`.
- Avoid unnecessary frameworks, telemetry, network dependencies or browser permission prompts.
- Respect reduced-motion preferences and mobile layouts.

### Educational material

Only add academic slides, screenshots, logos or proprietary teaching materials when you have redistribution permission. The MIT software license does **not** automatically cover third-party educational content. See [NOTICE.md](NOTICE.md).

### Issues and security

Use public issues for ordinary bug reports and feature requests. For a vulnerability or sensitive security concern, follow [SECURITY.md](SECURITY.md) instead of posting exploit details publicly.

Please be respectful and constructive during reviews.
