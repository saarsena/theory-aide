# Theory Aide

A session-aware harmonic lens for Ableton Live, built on the Extensions SDK
(1.0.0-beta.0). Theory Aide **reads** the harmony already in your set — across all
tracks at once — and explains it. It is designed to complement generators like Scaler
and Composition Aide, not replace them: they write chords, Theory Aide understands
what got written. See [DESIGN.md](DESIGN.md) for the full positioning and roadmap.

**No Python required.** The entire theory engine is TypeScript, bundled into
`dist/extension.js`.

## Commands (v0.1)

| Command | Trigger | What it does |
|---|---|---|
| **Harmonic Timeline (All Tracks)…** | Right-click a MIDI-track arrangement selection | Scans **every MIDI track** in the selected time range (looped clips unrolled), slices the combined harmony beat by beat, and shows the chord/Roman-numeral timeline with harmonic functions (T/S/D), borrowed-chord and secondary-dominant badges, and per-track clash warnings — e.g. "F# out of key — Bass". |
| **Explain Harmony…** | Right-click a MIDI clip | Chord-by-chord explanation of the clip in **Live's current key** (the same key Scaler syncs to): Roman numerals, function colors, borrowed badges, out-of-key flags, and key candidates with scores. |

When Live's **Scale Mode** is on, analysis uses Live's key and warns if the content
actually suggests a different key. Otherwise the key is inferred
(scale-membership scoring, shown transparently with candidate scores).

## Building

Requires Node.js ≥ 24, the SDK `.tgz` packages (expected in
`extensions-sdk-1.0.0-beta.0/` at the repo root), and a Live build with the
Extensions platform + Developer Mode for `npm start`.

```bash
npm install
npm run build      # type-check + bundle → dist/extension.js
npx tsx tests/smoke.ts   # engine smoke tests
npm start          # build + load into Live (needs .env with EXTENSION_HOST_PATH)
npm run package    # production .ablx
```

## Layout

```
src/
  extension.ts        commands, context menus, clip → timeline note extraction
  theory/data.ts      chord/scale tables (from chordgen-m4l, golden-tested lineage)
  theory/core.ts      Scale, Chord, diatonic builder, chord recognition
  theory/analyzer.ts  key inference, Roman numerals, harmonic function
  theory/timeline.ts  cross-track segmentation, clash detection
  timeline.html       Harmonic Timeline modal
  explain.html        Explain Harmony modal
tests/smoke.ts        engine assertions
```

MIT © 2026 saarsena
