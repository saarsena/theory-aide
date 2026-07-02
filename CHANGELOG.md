# Changelog

All notable changes to Theory Aide are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
this project is pre-1.0, so anything may still change.

## [0.2.0] - 2026-07-02

### Added

- **Simplified panel UX** — piloted on the five densest panels (Harmonic
  Timeline, Counterpoint Checker, Composition Dimensions, Voicing & Density,
  Rhythm & Phrasing), based on user feedback that the panels were overwhelming:
  - A one-sentence **plain-English headline** at the top of each panel that
    answers "what am I looking at" before any table or grid.
  - Panels open in a **simple view** by default; a **Show details** button
    reveals the full tables, metric grids, and interval distributions. The
    choice is remembered between sessions.
  - **Plain-language tooltips** on theory jargon — hover terms like *parallel
    fifths*, *contrary motion*, or *tonic* (dotted underline) for a one-line
    definition in plain words.
  - A **→ What should I do next?** button that closes the panel and opens
    *What Do I Do Next?* for the same material, turning analysis into action.
  - The remaining panels get the same treatment once the pilot is validated.
- **Website proof of concept (`site/`).** The seed of a free Theory Aide
  teaching site: a counterpoint concept page that runs the extension's own
  analysis engine — and the actual Counterpoint Checker panel — live in the
  browser against curated examples (parallel fifths, contrary motion, a hidden
  octave). Fully static, no server. Build with `npm run site`. Not part of the
  extension `.ablx`.

### Changed

- **Versioned packaging.** `npm run package` now names the archive from
  `manifest.json` — e.g. `Theory-Aide-0.2.0.ablx` — instead of a fixed name.
  The manifest version had been stuck at 0.1.0 while actual releases reached
  0.1.9; it is now the single source of truth (bumped to 0.2.0), so Live and
  the filename report the same version.

## [v0.1.8] - 2026-06-26

### Added

- **Counterpoint track picker.** Counterpoint Checker now opens a track-selection
  step first: a checklist of every MIDI track with notes in the range, showing
  note count, pitch range, and pitch-class count. Drum/percussion tracks are
  auto-detected by name and pre-unchecked. Includes Select all / none /
  Melodic only and a live pair count. Only the selected tracks are analyzed.
- **Harmonic Timeline track picker.** The Harmonic Timeline now opens the same
  track-selection step first, so you can omit unpitched percussion (and anything
  else) before it gets spelled into the combined harmony.
- **Harmonic Timeline single view.** A "Single view" toggle in the pager swaps
  the 10-segments-per-page table for one continuous, scrollable list — far less
  tiresome on long arrangements. Clicking a chord in the strip scrolls straight
  to its row. The choice is remembered between sessions.

### Fixed

- **Percussion auto-detection missed "Drums"/"Percussion" and false-flagged
  melodic tracks.** Name matching now treats keywords as stems, so plurals and
  suffixes (Drums, Percussion, Toms, Claps) are caught — adding any such word to
  a track name is enough. The old GM-drum pitch-range fallback was dropped: it
  wrongly flagged low melodic parts (e.g. a guitar around E1–C2) as percussion.
- **Counterpoint missed parallels in large sets.** The engine capped analysis at
  15 track pairs in Live's track order, so in big projects the meaningful pairs
  were silently dropped (and muting or reordering tracks changed the results).
  Pairing is now deterministic (sorted by name, so reordering no longer matters)
  and the cap was raised to 120, with a clear "truncated" notice when exceeded.
- **Same-named tracks were merged.** Two tracks sharing a name were treated as one
  voice. Each track now gets a unique label, so identically-named tracks stay
  separate.
- **Note names were an octave too high.** Pitches used the C4 = MIDI 60 convention;
  Ableton labels middle C as C3. Corrected in Counterpoint, Voicing & Density, and
  Composition Dimensions (e.g. what showed as B3 now correctly reads B2).
- **Counterpoint modal opened in dark theme.** A flash-of-unstyled-content meant
  the saved light theme wasn't applied before first paint. The theme is now set by
  a blocking script in `<head>` (also applied to the new track picker).

### Docs

- README documents the track picker and the Tone Row Checker.
- KNOWN_ISSUES.md cleared (the theme bug is resolved).

## [0.1.0] — 2026-06-14

### Added

- **Tone Row Checker** — twelve-tone / serial analysis of a clip: prime row (P0)
  detection, full 12×12 Babbitt matrix with hexachord color coding, interval
  vector, I- and R-combinatoriality tests, all 48 row forms, and pitch-class
  sequence annotation against detected row statements.
- **Counterpoint Checker** — parallel 5ths/octaves, hidden 5ths/octaves, and
  parallel unisons across track pairs, with motion-type breakdown and harmonic
  interval distribution.
- Composition guidance and map tools, composer-dimension primer sections, and
  timeline summary export.
- Core engine: harmonic timeline, key inference, Roman numerals, chord
  recognition, voicing/density, rhythm/phrasing, timbre/texture/dynamics,
  arrangement form, composition dimensions, next-move suggestions, theory
  reference, and music theory primer.
