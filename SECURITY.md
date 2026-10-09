# Security Policy

## Scope

FTN Teaching Portal is a **static, public, client-side educational web application**. Its local demo login (`student` / `ftn`) is hard-coded into the JavaScript bundle and is intentionally **not an authentication or authorization mechanism**. It must not be used to protect private course content, student records, or other sensitive information.

Settings, notes, locally entered calendar events and scores are stored in the user's own browser via `localStorage`. They are not synchronized with a server. Do not enter confidential data.

## Supported versions

Security fixes are targeted at the latest code on the `main` branch. Older builds are not maintained separately.

## Reporting

If you discover a vulnerability affecting the code or users:

1. Prefer **Report a vulnerability** under the repository's **Security** tab if GitHub private vulnerability reporting is enabled.
2. If that option is unavailable, contact a repository maintainer privately before sharing proof-of-concept or exploit details. Do not include private data or secrets in a public issue.
3. Include affected versions, reproduction steps, expected/actual behavior and potential impact.

Ordinary UI bugs and documentation issues may be filed through GitHub Issues.

## Dependencies

The custom PDF viewer loads PDF.js from a third-party CDN at runtime. Its loading behavior, browser security model and external-network dependency should be considered when deploying in restricted environments.
