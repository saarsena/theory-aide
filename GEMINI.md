# Theory Aide: Music Theory Learning Aide & Reference for Ableton Live

Theory Aide is a session-aware music theory learning aide and reference tool for Ableton Live, built on the Ableton Extensions SDK (1.0.0-beta.0). It functions as a "theory cheat sheet" and harmonic lens, designed to complement generation VSTs like Scaler by analyzing and explaining the harmony already present in a Live Set.

## Project Overview

- **Core Purpose:** Acts as a teaching tool and reference guide. It reads multi-track harmony from MIDI clips and arrangement selections to provide Roman numeral analysis, harmonic function labeling, and clash detection, helping users understand the theoretical underpinnings of their music.
- **Key Technologies:**
    - **Language:** TypeScript (Strict mode).
    - **Runtime:** Node.js (>= 24).
    - **Bundler:** esbuild (configured via `build.ts`).
    - **Platform:** Ableton Extensions SDK (beta).
    - **UI:** Self-contained HTML/CSS/JS modals loaded as `data:text/html` URLs.
- **Architecture:**
    - `src/extension.ts`: Extension lifecycle, command registration, and Live Set interaction.
    - `src/theory/`: Pure TypeScript music theory engine (no Python/external dependencies).
        - `core.ts`: Basic primitives (Notes, Scales, Chords, recognition).
        - `analyzer.ts`: Key inference, Roman numeral labeling, harmonic functions.
        - `timeline.ts`: Cross-track segmentation and clash detection.
        - `data.ts`: Static tables for scales and chords.
    - `src/*.html`: UI views (Timeline, Explain, Audit, Reference, Primer).

## Building and Running

Commands are defined in `package.json` and utilize `tsx` and `esbuild`.

- **Install Dependencies:** `npm install`
- **Build Extension:** `npm run build`
    - Runs `tsc --noEmit` followed by `build.ts`.
    - Bundles everything into `dist/extension.js`.
- **Run in Live:** `npm start`
    - Requires `.env` with `EXTENSION_HOST_PATH`.
    - Builds and uses `extensions-cli run` to load into a running Live instance.
- **Run Smoke Tests:** `npx tsx tests/smoke.ts`
    - Validates the theory engine (recognition, inference, labeling).
- **Package for Production:** `npm run package`
    - Generates a `.ablx` package.

## Development Conventions

- **Pure Theory Engine:** All logic in `src/theory/` must remain "pure TS" and avoid importing from `@ableton-extensions/sdk`. This ensures the engine can be tested in isolation (see `tests/smoke.ts`).
- **UI Communication:** Modals are Webviews. Data is injected via string replacement (e.g., `__TIMELINE_JSON__`) in the HTML template and results are sent back via `close_and_send` postMessage.
- **SDK Interaction:** Access to Live's data (clips, tracks, song state) is handled in `src/extension.ts` using the Extensions SDK. Note that many Live properties are currently read-only in the beta SDK.
- **Note Extraction:** `arrangementNotes` and `clipNotes` in `src/extension.ts` handle the projection of MIDI notes from clips onto the arrangement timeline, including unrolling loops.
- **Key Inference:** Uses Krumhansl-Schmuckler profile correlation and scale-membership scoring. Live's "Scale Mode" key is respected if enabled.

## Key Files

- `src/extension.ts`: The bridge between Live and the theory engine.
- `src/theory/core.ts`: The source of truth for musical logic.
- `src/theory/analyzer.ts`: High-level musical analysis (Roman numerals).
- `build.ts`: Controls the bundling process, including HTML inlining.
- `manifest.json`: Extension metadata (id, name, version, entry point).
- `DESIGN.md`: Deep dive into project philosophy and roadmap.
