# Repository Guidelines

## Project Structure & Module Organization

Theory Aide is a TypeScript Ableton Live Extension. Source lives in `src/`, with the extension entry point in `src/extension.ts`. Harmonic-analysis logic is under `src/theory/`, while modal UI templates live beside the entry point as `src/*.html`. Smoke tests are in `tests/smoke.ts`. Build output is generated into `dist/`, and packaged extension artifacts use the `.ablx` format. Keep SDK tarballs in `extensions-sdk-1.0.0-beta.0/`; they are referenced by local `file:` dependencies in `package.json`.

## Build, Test, and Development Commands

- `npm install`: install local SDK packages and TypeScript tooling.
- `npm run build`: type-check with `tsc --noEmit`, then bundle via `build.ts` into `dist/extension.js`.
- `npx tsx tests/smoke.ts`: run theory-engine smoke tests.
- `npm start`: build and launch through `extensions-cli run`; requires Live Developer Mode and `.env` with `EXTENSION_HOST_PATH`.
- `npm run package`: production build and `.ablx` packaging.

## Coding Style & Naming Conventions

Use strict TypeScript with ESM. Keep relative runtime imports using `.js` suffixes, matching existing files such as `import { Scale } from "./theory/core.js"`. Use 4-space indentation, `camelCase` for functions and variables, `PascalCase` for classes and interfaces, and concise exported types. Prefer explicit return types for public helpers and data-shape interfaces for modal payloads. Avoid unrelated formatting churn in HTML templates and generated `dist/` output.

## Testing Guidelines

The current test suite is a smoke-test script, not a full framework. Add focused checks to `tests/smoke.ts` when changing chord recognition, key inference, Roman numeral analysis, timeline segmentation, or clash detection. Follow the existing `check("behavior", actual, expected)` pattern and include golden values that describe the musical expectation. Run both `npx tsx tests/smoke.ts` and `npm run build` before opening a PR.

## Commit & Pull Request Guidelines

Recent history uses short, descriptive subjects, including Conventional Commit style such as `fix: restore scrolling in Explain Harmony window...`. Prefer `fix:`, `feat:`, `docs:`, or `test:` prefixes for clarity. PRs should include a brief behavior summary, test results, and screenshots or screen recordings for UI modal changes. Link related issues when available and call out any `.env`, Ableton Live, or SDK-version assumptions.

## Security & Configuration Tips

Do not commit local secrets or machine-specific paths from `.env`; update `.env.example` when configuration changes. Treat `node_modules/`, `dist/`, and packaged `.ablx` files as generated unless a release task explicitly requires them.
