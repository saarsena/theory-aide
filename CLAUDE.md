# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Theory Aide is an Ableton Live extension that analyzes MIDI (harmony, rhythm,
voicing, density, motion, form, tension) and turns it into plain-English
explanations and suggested next moves. It's TypeScript end to end (no
Python), bundled to `dist/extension.js` and loaded into Live via the
Ableton Extensions SDK.

The same analysis engine (`src/theory/`) also powers **www.fishfvch.com**, a
static teaching site (Eleventy) whose sources live under `site/`. The
extension and the site are two front ends over one engine — see "Two
consumers, one engine" below before touching `src/theory/`.

## Commands

```bash
npm install
npm run build              # tsc --noEmit + esbuild bundle → dist/extension.js
npx tsx tests/smoke.ts     # engine smoke tests (plain assertion script, not a test runner)
npm start                  # build + load into Live (needs .env with EXTENSION_HOST_PATH; requires Developer Mode)
npm run package             # production build + versioned .ablx (name/version read from manifest.json)
npm run site                # build the teaching site → site/_site/
npm run site:dev            # site with live-reload dev server, http://localhost:8124/
npm run site:prod           # production site build
```

There is no separate lint command; `tsc --noEmit` (root `tsconfig.json` for
`src/`, `site/tsconfig.json` for `site/`) is the type-check gate for each.
`tests/smoke.ts` has no test filtering flag — it runs all checks in the file
and prints `ok`/`FAIL` per assertion; edit/add `check(...)` calls in that
file directly.

Building requires Node.js ≥ 24 and the SDK `.tgz` packages, expected at
`extensions-sdk-1.0.0-beta.0/` at the repo root (this directory, along with
`.env`, `dist/`, and `*.ablx`, is gitignored — not part of the committed
source). Running `npm start` additionally requires a Live build with the
Extensions platform and Developer Mode enabled.

## Architecture

### Two consumers, one engine

`src/theory/*.ts` is the canonical analysis engine and has no dependency on
the Ableton SDK or the DOM — it's pure functions over notes/pitches/timing.
Two things sit on top of it:

1. **The extension** (`src/extension.ts`): registers context-menu commands
   via the SDK, pulls notes out of Ableton's `Song`/`MidiTrack`/`MidiClip`
   object model, calls into `src/theory/`, and renders results by injecting
   JSON into one of the `src/*.html` modal templates.
2. **The site demos** (`site/src/*.ts`): browser-side TypeScript, bundled by
   esbuild (`site/build.ts`), that imports the *same* engine from
   `src/theory` and runs it against curated example data
   (`site/src/examples.ts`) for interactive demos embedded in the Markdown
   articles.

When changing analysis behavior in `src/theory/`, both consumers move
together — don't fork logic into `site/src/` or `src/extension.ts` that
duplicates what the engine already does. Curated site examples are expected
to be verified against the real engine, not hand-authored to look right.

`src/theory/glossary.json` is the other shared source of truth: it backs
both the in-extension hover tooltips (dotted-underlined theory terms in the
modals) and the site's `/dictionary/` pages (one generated page per term).

### Extension command flow

`src/extension.ts` registers one handler per context-menu command
(arrangement selection, MIDI clip, or scene — see README for the full
command table). A handler typically:

1. Extracts notes from the SDK's live object model. Arrangement-scoped
   commands unroll looping clips onto the absolute timeline
   (`arrangementNotes`); clip-scoped commands read the clip's own timeline
   (`clipNotes`).
2. Calls the relevant `src/theory/*.ts` builder (e.g.
   `buildCompositionDimensionsData`, `analyzeTimeline`, `buildToneRowData`).
3. Renders via `showHtml(context, someHtml, TOKEN, data, width, height)`,
   which does a literal token replacement of `data` (JSON, HTML-escaped via
   `safeJson`) into the imported `.html` template, then opens it as a
   `data:text/html` modal (`context.ui.showModalDialog`). HTML files are
   pulled in as raw strings at bundle time via esbuild's `.html` → `text`
   loader configured in `build.ts`; there's one template per command
   (`src/timeline.html`, `src/explain.html`, etc.), matched 1:1 with a
   `theory/*.ts` data builder.

Live's key: when Live's Scale Mode is on, analysis uses Live's key
(`liveKey()`, reading `song.scaleMode`/`rootNote`/`scaleName`) and flags
disagreement with the detected key; otherwise the key is inferred from
scale-membership scoring in `theory/analyzer.ts`.

### Packaging

`manifest.json` (name, version, entry point, min API version) is the single
source of truth for both `npm run package` (esbuild production bundle, then
`pack.ts` shells out to `extensions-cli package` and renames the output to
`<Name>-<version>.ablx`) and the extension's identity inside Live.

### The site

Eleventy-based static site (`site/eleventy.config.js`), with two content
tiers:

- `/dictionary/`: one page per term, generated from `src/theory/glossary.json`.
- `/concepts/`: hand-written Markdown articles in `site/concepts/`, one file
  per concept. **The filename is the permanent URL slug — never rename an
  article file** (retitle via the `title`/`heading` front matter instead).
  `site/_data/spine.js` orders the "Track 1" curriculum path; full authoring
  rules (front matter fields, `[[wiki-link]]` resolution order, citation
  format, live-demo wiring) are in `site/README.md` and the curriculum
  contract in `site/CURRICULUM.md` — read those before adding or editing
  articles.

### TypeScript conventions

Both `tsconfig.json` and `site/tsconfig.json` run with `strict`,
`noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` on — array/object
index access is `T | undefined` and optional properties can't be assigned
`undefined` explicitly. Code throughout (e.g. the `?? 0` fallbacks in
`extension.ts`'s `cofDist`) leans on this rather than non-null assertions.
