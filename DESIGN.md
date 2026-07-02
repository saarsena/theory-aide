# Theory Aide — Design

One music-theory brain, many surfaces.

**Mission:** build, over months and years, a free and lasting tool for people
around the world to learn to speak the language of music. The paid alternatives
run from $60 (Scaler) to $996 (Synfire Pro); their moat is accumulated content
and polish, not technology. Free stays free — this is a mutual-aid project, not
a product waiting for a business model.

Theory Aide is a music-theory project: an analysis engine plus the plain-English
teaching material wrapped around it. The **product is the engine and the
concepts**. Everything users touch is a *surface* over that shared core:

1. **The website** (theoryaide.fishfvch.com) — a free theory dictionary,
   encyclopedia, and explorer. The front door: it serves every musician,
   regardless of what software they own.
2. **The Ableton Live extension** — the session-aware client. It applies the
   same engine to the music *you are actually making*, inside Live.

The two surfaces tell one story: **learn it on the site, catch it in your
music.** The website explains counterpoint; the extension tells you your bass
and pad have parallel fifths at bar 17. Neither is the companion of the other —
they are siblings sharing one brain.

## The core: engine + concepts

- `src/theory/*` — pure TypeScript, zero SDK or DOM dependency. Give it notes,
  it gives you analysis (harmony, counterpoint, rhythm, voicing, form, tension,
  next moves). This is the asset everything else is built from.
- The teaching layer — plain-English headlines, the glossary of jargon with
  one-line definitions, concept prose (Teach Me mode, the primer, the theory
  reference). Written once, rendered everywhere.

**The seam rule (protect this):** everything downstream of "here are the notes"
is shared. The engine is imported straight from `src/theory` (never copied),
and panels are reused byte-for-byte — the same HTML injected with the same
token replacement, whether into a Live modal or a browser iframe. Only the
*note source* varies per surface: Live's clips and selections; curated examples
on the site; MIDI upload later. New capability = new note source, never a fork.

## Surface: the website

A free theory **dictionary / encyclopedia / explorer**, with the real engine
running client-side:

- **Dictionary** — the glossary terms as first-class pages (seeded by the
  panels' shared glossary map).
- **Encyclopedia** — concept pages: plain-English explanation first, depth
  behind a toggle, and the extension's actual analysis panel embedded live
  against curated examples (each verified to trigger the finding its copy
  describes).
- **Explorer** — the same panels against *your* notes: MIDI upload, later a
  small editor. Slots into the note-source seam; everything else is untouched.

**Fully static.** The engine runs client-side; examples are bundled data. No
server, no accounts, no hosting cost — and MIDI parsing stays client-side when
it arrives. Free to run means free to keep running forever.

The proof of concept lives in `site/` (one counterpoint concept page, three
curated examples, `npm run site`). Known web-only quirk: `localStorage` doesn't
persist inside sandboxed iframes, so embedded panels always open in the
light/simple defaults — acceptable (arguably correct) for a teaching page.

## Surface: the Ableton Live extension

The session-aware client, built on the Extensions SDK. Its unique power is the
one thing no website (and no VST) can have: **access to the whole Live Set.**

### Positioning vs. Scaler (near term: complement, don't compete)

Scaler owns the **writing** side: chord discovery, progression building,
performances. Scaler is a VST — it lives inside one plugin instance and is
structurally blind to the Live Set.

The extension owns the **reading** side: it analyzes, explains, audits, and
refines the harmony that is *already in the set* — including MIDI that Scaler
wrote.

| | Scaler | Theory Aide extension |
|---|---|---|
| Sees | its own MIDI input | every clip, track, scene, the arrangement timeline |
| Direction | generates new material | understands existing material |
| Scope | one track at a time | all tracks at once (vertical harmony) |
| Key context | syncs to Live's key | reads the same Live key as its frame of reference |

**Near-term non-goals** (Scaler's turf): chord suggestion browsing,
performance/arpeggio engines, progression generation, chord-set libraries.
(See "Long horizon" — these are non-goals of the extension today, not vows.)

### Pillars

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

### SDK constraints (1.0.0-beta.0)

- `Song.rootNote` / `scaleName` / `scaleIntervals` are **read-only** — we can read Live's
  key but not set it.
- Context-menu scopes only (no panels): `MidiClip`, `Scene`, `ClipSlot`,
  `MidiTrack.ArrangementSelection`, etc.
- Modals are URL-loaded webviews; data in via string injection, result out via
  `close_and_send` postMessage.
- No `openUrl` / external-browser API. The Node runtime's `child_process` works
  as an escape hatch (verified in Live on Windows) but is unsanctioned and
  could break in a future host. Worth a feature request to Ableton.

## Architecture

```
                    ┌── src/theory/*        pure-TS engine (no Python, no SDK)
   one brain ───────┤   glossary + prose    teaching layer
                    └── src/*.html          self-contained panels, bundled as text
                          │
        ┌─────────────────┴──────────────────┐
   Ableton Live                          Browser (static)
   Extension Host (Node)                 site/ — dictionary/encyclopedia/explorer
   src/extension.ts → dist/extension.js  site/src/main.ts → site/dist/main.js
   notes from: clips, selections         notes from: curated examples, (later) MIDI upload
```

- **No Python.** Composition Aide's only recurring support issue was the Python PATH.
  The theory engine here is pure TypeScript, bundled by esbuild.
- **Key inference**: Krumhansl-Schmuckler profile correlation over duration-weighted
  pitch-class histograms. When Live's Scale Mode is on, Live's key wins and inference
  is only used as a cross-check.
- **Chord recognition**: weighted pitch-class template matching with bass-note inversion
  awareness.
- **Timeline segmentation**: per-beat slices, merged when the recognized chord persists.
- Repo structure will eventually invert to match the identity (engine as core
  package, `extension/` and `site/` as sibling consumers) — cosmetic, deferred
  until it earns its churn.

## Long horizon (decided 2026-07-02)

A patient, years-scale commitment: grow the free, open project into a genuine
alternative to the paid theory tools (Scaler ~$60, Hooktheory's books +
subscription, Captain Chords, Synfire Pro at $996, courses). Their moat is
accumulated content and polish, not technology — and the analysis engine, the
hard part, already exists here. The precedent is MuseScore/Audacity/Blender:
free alternatives built by accumulation, not by launch.

Principles:

- **Free stays free.** Static hosting and open source mean there is nothing to
  paywall, sunset, or acquire. Mutual aid first; donations, if ever, are
  support — not a gate.
- **Accumulate, don't sprint.** One concept page, one glossary entry, one
  curated example at a time. The near-term non-goals above get revisited only
  when the reading side is deep enough that writing-side features grow out of
  it naturally (e.g. Refine's transforms are already halfway there).
- **Burnout is the only real risk.** Scope patience over ambition.
