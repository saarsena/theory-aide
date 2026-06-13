# Theory Aide TODO

## Phase 1: Make Existing Analysis More Explainable

- [x] Add structured progression labels to the analysis payload.
- [x] Show progression matches in Harmonic Timeline and Explain Harmony.
- [x] Add short "why this works" text for common cadence and pop-loop matches.
- [x] Keep smoke-test coverage for every detected pattern.

## Phase 2: Better Clash Explanations

- [x] Classify out-of-key notes as likely passing tones, chord extensions, or hard clashes.
- [x] Explain which track contributes each clash and why it matters.
- [x] Distinguish "outside the key" from "inside the chord but outside the inferred scale."

## Phase 3: Resolution Suggestions

- [x] Suggest likely next chords for dominant and secondary-dominant endings.
- [x] Identify unresolved half cadences.
- [x] Add simple "try next" guidance such as `G7 -> C` or `A7 -> Dm`.

## Phase 4: Richer Chord Recognition

- [x] Expand recognition for add9, 9th, 11th, 13th, and suspended dominant chords.
- [x] Add tests for voicings where extensions appear above different bass notes.
- [x] Avoid over-labeling simple triads when extensions are weak passing tones.

## Phase 5: Modal Color and Tension

- [x] Detect common modal colors: Dorian, Phrygian, Lydian, and Mixolydian.
- [x] Add a tension or density score per segment.
- [x] Visualize tension over time in the timeline modal.

## Phase 6: Section-Level Insight

- [x] Compare selected ranges or song sections, such as verse vs chorus.
- [x] Summarize key, chord vocabulary, and tension differences between sections.
- [x] Add exportable text summaries for review outside Ableton.

## Phase 7: What Next Workflow

- [x] Add an in-extension guide for turning one liked generated idea into the next song section.
- [x] Cover next-section jobs such as verse, chorus, pre chorus, bridge, build, and resolution.
- [x] Explain practical strategies: rotate the progression, borrow one chord, answer the melody, and change density.
- [x] Register the guide on MIDI clip and scene context menus.

## Phase 8: Composer Dimensions Primer

- [x] Expand the primer beyond scales, chords, and progressions.
- [x] Add vertical axis guidance for intervals, harmonic gravity, voicing density, and voice leading.
- [x] Add horizontal axis guidance for pulse, meter, subdivision, timing feel, and phrasing.
- [x] Add macro and spectral guidance for form, development, texture, dynamics, masking, and timbral motion.
