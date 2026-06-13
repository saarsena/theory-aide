# Theory Aide

Theory Aide is an Ableton Live extension for understanding what your MIDI is doing musically. It analyzes harmony, rhythm, voicing, density, motion, form, and tension, and then turns that analysis into clear explanations and practical next steps.

The goal is not to judge whether an idea is correct or good. The goal is to help producers understand why an ideas work for them, why you may feels stuck, and things that you can try before throwing the idea away.

Theory Aide is built for the moment after you generate or write something interesting and ask, “What now?” It can explain the harmonic timeline, identify chord function, show tension and density over time, inspect rhythm and phrasing, flag muddy voicings, compare song sections, and suggest ways to develop the material into a verse, chorus, bridge, build, breakdown, or resolution.

The extension treats theory as a creative lens, not a rulebook. It connects traditional concepts like Roman numerals modal theory with producer focused concepts like groove, register, frequency space, texture, automation, and arrangement energy.

I am trying to make music theory useful inside the writing process.

It is not meant to replace taste. It is meant to support you and make you more confident in your ability to express creativity.

See [DESIGN.md](DESIGN.md) for the full positioning and roadmap.

![11](11.png)
![22](22.png)
![33](33.png)

**No Python required.** The entire theory engine is TypeScript, bundled into
`dist/extension.js`.

## Commands (v0.1)

| Command                             | Trigger                                        | What it does                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Harmonic Timeline (All Tracks)…** | Right-click a MIDI-track arrangement selection | Scans **every MIDI track** in the selected time range (looped clips unrolled), slices the combined harmony beat by beat, and shows the chord/Roman-numeral timeline with harmonic functions (T/S/D), borrowed-chord and secondary-dominant badges, and per-track clash warnings — e.g. "F# out of key — Bass". |
| **Explain Harmony…**                | Right-click a MIDI clip                        | Chord-by-chord explanation of the clip in **Live's current key** (the same key Scaler syncs to): Roman numerals, function colors, borrowed badges, out-of-key flags, and key candidates with scores.                                                                                                           |

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
