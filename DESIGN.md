# Theory Aide — Design

A session-aware harmonic lens for Ableton Live, built on the Extensions SDK.

## Positioning: complement Scaler, don't compete

Scaler (and Composition Aide's generate features) own the **writing** side: chord
discovery, progression building, performances. Scaler is a VST — it lives inside one
plugin instance and is structurally blind to the Live Set.

Theory Aide owns the **reading** side: it analyzes, explains, audits, and refines the
harmony that is *already in the set* — including MIDI that Scaler wrote. Everything it
does requires Live-Set access that a plugin can never have.

| | Scaler | Theory Aide |
|---|---|---|
| Sees | its own MIDI input | every clip, track, scene, the arrangement timeline |
| Direction | generates new material | understands existing material |
| Scope | one track at a time | all tracks at once (vertical harmony) |
| Key context | syncs to Live's key | reads the same Live key as its frame of reference |

**Explicit non-goals** (Scaler's turf): chord suggestion browsing, performance/arpeggio
engines, progression generation, chord-set libraries.

## Pillars

1. **Harmonic Timeline** *(v0.1 — flagship)* — select a range in the arrangement and see
   what *all tracks together* spell harmonically, beat by beat: chords, Roman numerals,
   key, and per-track clash warnings (notes that fight the prevailing harmony, with the
   offending track named). Looped arrangement clips are unrolled correctly.
2. **Explain** *(v0.1)* — right-click any MIDI clip for a chord-by-chord explanation in
   Live's current key: Roman numerals, harmonic function (T/S/D), borrowed-chord badges.
3. **Audit** *(v0.2)* — set-wide harmonic lint: clips whose key disagrees with Live's key,
   out-of-scale notes, rough voice-leading seams between consecutive scenes/sections.
4. **Refine** *(v0.3)* — non-generative transforms: voice-leading optimizer, snap-to-scale,
   enharmonic-aware transpose. (Candidates to migrate from Composition Aide.)
5. **Navigate** *(v0.3)* — name cue points by detected section keys; key-colored maps of
   session and arrangement.

## Architecture

```
Ableton Live ── Extension Host (Node)
                  └── dist/extension.js   (everything bundled, zero runtime deps)
                        ├── src/extension.ts      commands + context menus
                        ├── src/theory/*          pure-TS engine (no Python!)
                        └── src/*.html            self-contained modals, bundled as text
```

- **No Python.** Composition Aide's only recurring support issue was the Python PATH.
  The theory engine here is pure TypeScript, bundled by esbuild into `extension.js`.
- **Key inference**: Krumhansl-Schmuckler profile correlation over duration-weighted
  pitch-class histograms. When Live's Scale Mode is on, Live's key wins and inference
  is only used as a cross-check.
- **Chord recognition**: weighted pitch-class template matching with bass-note inversion
  awareness.
- **Timeline segmentation**: per-beat slices, merged when the recognized chord persists.

## SDK constraints (1.0.0-beta.0)

- `Song.rootNote` / `scaleName` / `scaleIntervals` are **read-only** — we can read Live's
  key but not set it.
- Context-menu scopes only (no panels): `MidiClip`, `Scene`, `ClipSlot`,
  `MidiTrack.ArrangementSelection`, etc.
- Modals are URL-loaded webviews; data in via string injection, result out via
  `close_and_send` postMessage.
