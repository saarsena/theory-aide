# Changelog

All notable changes to Theory Aide are recorded here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/);
this project is pre-1.0, so anything may still change.

## [0.1.7] — 2026-06-18

### Added
- **Counterpoint track picker.** Counterpoint Checker now opens a track-selection
  step first: a checklist of every MIDI track with notes in the range, showing
  note count, pitch range, and pitch-class count. Drum/percussion tracks are
  auto-detected (by name, or low GM-drum range with many pitch classes) and
  pre-unchecked. Includes Select all / none / Melodic only and a live pair count.
  Only the selected tracks are analyzed.

### Fixed
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
