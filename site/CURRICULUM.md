# Theory Aide curriculum: the map from beginner to guru

This is the editorial map of the site: what we teach, in what spirit, and every
page the site should eventually have. It is descriptions only, no code. The
mechanical authoring rules (front matter, slugs, wiki-links) live in
`site/README.md`; the mission and architecture live in `DESIGN.md`. This
document is allowed to be ambitious because it is built by accumulation:
one article at a time, small victories, years of them.

Slugs proposed here follow the slug-stability rule: once an article ships at a
slug, that URL is permanent. Until an article ships, its slug here is a
suggestion.

## Part 1: Pedagogical commitments

The style we agree to write in. Every article gets held against these.

1. **Sound first, name second.** The reader hears or sees the thing before it
   gets a term. A demo, an animation, or a described listening moment comes
   before the vocabulary word, never after.
2. **Plain English first, depth behind that.** The lead of every article is
   readable by a total beginner. The depth is real but it is downstream.
3. **The piano roll is our notation.** Every concept is taught in piano-roll
   and MIDI terms, the language the reader's screen already speaks. Staff
   notation is its own optional trail, never a prerequisite for anything.
4. **Spiral, don't sequence.** Concepts are not exhausted in one chapter; they
   return at higher rings. Intervals appear when you first count semitones,
   again when chords stack, again when voices move, again when the math
   explains why a fifth is "empty." Each return assumes only the ring below.
5. **Every claim demonstrable.** Where the engine can show it, the article
   embeds the real panel against curated examples, and the examples are
   verified against the engine before the copy claims what they demonstrate.
   The seam rule, applied to teaching.
6. **Catch it in your music.** Articles end by naming what the extension flags
   or shows about this concept inside a real Live set. Learn it here, hear it
   there.
7. **The math is a parallel thread, never a gate.** Every math article pairs
   with a musical one. You can become fluent without the math trail; the math
   trail is there because for some readers (the author included) seeing the
   arithmetic is the moment it clicks.
8. **One idea per article.** If an article needs "and" in its title, it is
   probably two articles.
9. **No gatekeeping tone.** Jargon is always wiki-linked to a plain
   definition. "Guru" means fluent, not initiated. Rules are explained by what
   they protect (independence, clarity, tension), never enforced as law.
10. **The prose rules hold everywhere.** No em dashes, plain sentences, no
    LLM cadence. See `site/README.md`.

## Part 2: The spiral, four depth rings

Rings are how deep a concept goes, not chapters. Every trail below crosses
several rings, and a reader can ride one trail to the bottom or circle one
ring across all trails. Both are valid paths; the wiki structure means nobody
is ever "on the wrong page."

- **Ring 0 · Sound.** Absolute beginner. What a note, a beat, an interval
  *is*. Nothing is named that has not been heard or seen first. No
  prerequisites, not even "plays an instrument."
- **Ring 1 · Speaking.** Name and build things: scales, keys, triads, basic
  progressions, basic groove. Enough to read every simple view the extension
  shows and know what it means.
- **Ring 2 · Fluency.** Function, motion, form, tension. Why progressions
  pull, why voices fuse, how arrangements breathe. Enough to read every
  detailed panel and make deliberate choices instead of lucky ones.
- **Ring 3 · Guru.** The four wings: jazz and modal harmony, classical craft,
  beyond tonality, and the deep math. Each wing is optional and none is "the"
  ending; a guru picks their obsessions.

## Part 3: The trails

Eight trails plus one optional side trail. Each article stub is
`slug · what the article teaches · demo` (demo names the engine module or
panel that powers its embedded example, where one exists). Articles marked
**(exists)** are live today. Articles marked *(spiral)* also appear in another
trail at a different depth; they are one page, listed twice, because the
trails are reading orders, not folders.

### Trail 1: Hearing & Counting (Ring 0)

Purpose: sound and number, before any theory. Where someone who has never
opened a theory book starts.

- `what-is-a-note` · A note is a number: how many times per second the air
  moves. Pitch as speed of vibration · demo: waves animation (exists, reused)
- `pitch-and-octave` · Double the number and you get "the same note, higher."
  The octave as the ear's equals sign · demo: waves, 2:1
- `notes-have-names` · Twelve names that repeat every octave: C to B, sharps
  and flats, and why the piano roll's rows are striped
- `loud-and-soft` · Amplitude, velocity, dynamics: the other axis of sound,
  and what those 0 to 127 numbers in Live mean
- `the-beat` · The pulse your foot finds. Tempo as beats per minute, and why
  128 BPM feels different from 90
- `meter` · How beats group into bars: what 4/4 actually says, and the
  neighbors (3/4, 6/8) · *(spiral: Trail 5)*
- `the-piano-roll` · The piano roll is a map: pitch up, time across. Reading
  Live's grid as real notation, because it is

### Trail 2: Building Blocks (Rings 0 to 1)

Purpose: the vocabulary everything else is written in: intervals, scales,
keys, melodies, chords.

- `intervals` · The distance between two notes, counted in semitones, heard
  as flavor. The interval, not the note, is what your ear reacts to · demo:
  waves ratios
- `steps-and-leaps` · Half steps, whole steps, and jumps: the difference
  between a melody that walks and one that vaults
- `the-major-scale` · The step pattern most Western music walks on, and how
  to build it from any note in the piano roll
- `minor-scales` · Natural, harmonic, melodic: three flavors of sad and what
  each is for
- `keys` · What "in C major" means. The tonic as home, and how every other
  note gets its job from where home is · demo: analyzer key inference
- `melody` · Contour, steps versus leaps, range, and why melodies breathe.
  What makes a line singable even when nothing sings it
- `triads` · Stack two thirds and you have a chord. Major, minor, diminished,
  augmented, straight off the piano roll · demo: analyzer chord recognition
- `inversions` · Same notes, different bass, different feel. Why the bottom
  note matters most

### Trail 3: Harmony (Rings 1 to 3)

Purpose: chords, what they want, and where they pull. The longest trail,
and at Ring 3 it becomes the jazz and modal wing.

Ring 1:

- `chords-in-a-key` · The seven chords a key gives you for free, and why
  most songs never need more · demo: explain panel, Roman numerals
- `roman-numerals` · Naming chords by their job instead of their letter, so
  a progression means the same thing in every key · demo: explain panel
- `progressions` · Why some chord orders feel inevitable and others feel
  random. The pull, in plain terms · demo: harmonic timeline
- `seventh-chords` · Add one more third and chords learn to lean. Major 7,
  dominant 7, minor 7, half-diminished
- `cadences` · How music punctuates: full stops, commas, and question marks
  at the ends of phrases

Ring 2:

- `harmonic-function` · Tonic, subdominant, dominant: home, away, and the
  pull back home. Three jobs behind all seven chords · demo: explain panel
  T/S/D badges
- `the-circle-of-fifths` · The map of keys: why neighbors share notes and
  what "closely related" actually measures
- `modes` · One scale, seven homes. Dorian, Lydian, Mixolydian and the rest,
  taught the way an improviser learns them · demo: analyzer
- `borrowed-chords` · Stealing from the parallel key for color, and why the
  minor iv in a major song hits like it does · demo: explain panel borrowed
  badges
- `secondary-dominants` · A dominant aimed at a chord that isn't home,
  briefly making it feel like home · demo: explain panel
- `modulation` · Changing key without the seams showing: pivots, common
  tones, and the direct lift
- `tension` · How harmony breathes over time: tension curves across a
  progression, a section, a song · demo: harmonic timeline tension track

Ring 3 (the jazz and modal wing):

- `chord-extensions` · 9ths, 11ths, 13ths: the upper floors of a chord and
  which ones clash with which
- `alterations` · b9, #9, #11, b13: controlled dissonance on the dominant,
  where jazz keeps its spice
- `the-ii-V-I` · The engine of jazz harmony: why this three-chord cell is
  everywhere and how to hear it coming
- `chord-scale-thinking` · Every chord implies a scale; every scale implies
  chords. The improviser's two-way street
- `modal-interchange` · Borrowing systematized: the full palette of parallel
  modes as one big pantry
- `substitutions` · Tritone subs and friends: swapping a chord for one that
  shares its pull

### Trail 4: Voices in Motion (Rings 1 to 3)

Purpose: counterpoint and voice leading, how independent lines stay
independent. At Ring 3 it becomes the classical craft wing.

Ring 1:

- `voices` · What a "voice" is when nothing is singing: your bass, lead, and
  pad are voices whether you meant it or not
- `motion-types` · Parallel, similar, oblique, contrary: the four ways two
  lines can move, and which ones protect independence · demo: counterpoint
  panel
- `counterpoint` **(exists)** · Making two melodies work together: the one
  rule that matters most · demo: counterpoint panel

Ring 2:

- `voice-leading` · The smoothest path between chords: common tones, steps,
  and why good progressions are mostly small moves · demo: counterpoint,
  next-moves suggestions
- `voicing` · Spacing, doubling, register: the same chord arranged well or
  badly · demo: voicing panel
- `density` · How many notes sound at once, how full it feels, and when
  fuller is worse · demo: voicing panel
- `register` · Where notes sit: mud zones, sparkle zones, and leaving room
  for the kick

Ring 3 (the classical craft wing):

- `species-counterpoint` · The classical gym: five species, one exercise
  regime that has trained composers for three centuries
- `four-part-writing` · Chorale-style craft: four voices, every rule earning
  its keep · demo: counterpoint panel
- `bassline-counterpoint` · Producer framing of the whole trail: your
  bassline and your lead are already in counterpoint, write them like it

### Trail 5: Time (Rings 0 to 3)

Purpose: rhythm, from finding the pulse to breaking the grid on purpose.

Ring 0:

- `the-beat` · *(spiral: Trail 1)*
- `meter` · *(spiral: Trail 1)*

Ring 1:

- `subdivision` · Eighths, sixteenths, triplets: slicing the beat, and what
  the grid settings in Live actually choose
- `rests-and-space` · Silence as material: the notes you don't play are
  doing work
- `syncopation` · Accents landing off the strong beats: the pushed, alive
  feel, and how to place it deliberately · demo: rhythm panel
- `swing` · Displacing the grid on purpose: what the swing knob does and
  where the feel lives

Ring 2:

- `phrasing` · Musical sentences: where lines breathe, and why four and
  eight keep showing up · demo: rhythm panel
- `groove` · Velocity, micro-timing, repetition: why two identical patterns
  feel different · demo: rhythm panel
- `polyrhythm` · Two pulses at once: three against two, and why it shimmers
- `polymeter` · Two bar lengths at once: patterns that drift apart and lock
  back up

Ring 3:

- `odd-meters` · 5, 7, and beyond: how odd meters group, and how to make
  them groove instead of stumble
- `metric-modulation` · Changing tempo by reinterpreting the subdivision:
  the smoothest gear shift in music

### Trail 6: The Big Picture (Rings 1 to 2)

Purpose: form and arrangement, how minutes of music hold together.

- `sections` · Intro, verse, chorus, drop, bridge: the building blocks of a
  song's shape, and what each one's job is · demo: form analysis
- `song-forms` · AABA, verse-chorus, twelve-bar, through-composed: the
  standard floor plans and why they persist · demo: form analysis
- `repetition-and-variation` · The fundamental trade: enough repetition to
  hold on, enough change to stay awake
- `energy` · How arrangements breathe: density, register, and activity as
  an energy curve across the song · demo: dimensions panel
- `texture` · Layers and their roles: who has the foreground, who has the
  floor, who is glue · demo: timbre panel
- `dynamics-and-timbre` · Loudness and tone color as arrangement tools, not
  mixing afterthoughts · demo: timbre panel
- `arrangement` · What enters when, and why: reading a great arrangement as
  a sequence of decisions · demo: form analysis

### Trail 7: The Math (Rings 0 to 3, parallel thread)

Purpose: the arithmetic under all of it. Runs alongside every other trail
and is never required by any of them.

- `math` **(exists)** · The math behind music: a note is a number, and
  consonance is arithmetic · demo: waves animation
- `harmonics` · One note is already a chord: the overtone series, and why
  timbre is a recipe of sines · demo: waves (extended)
- `beating-and-tuning` · Two frequencies almost agreeing: beats as audible
  subtraction, and how tuners exploit it · demo: waves, detuned
- `temperament` · The compromise in your piano roll: why twelve equal steps,
  the 12th root of 2, and what got sacrificed
- `just-intonation` · The pure ratios equal temperament approximates, what
  music sounds like without the compromise, and why we mostly accept it
- `fourier-intuition` · Any sound is a sum of sines: the single idea under
  synthesis, EQ, and the whole spectral world
- `synthesis-as-calculus` · What your patches are actually doing: rates of
  change, accumulation, feedback. For the Max and gen~ people: it's
  generative calculus, stated plainly
- `generative-music` · Probability, LFOs, and rules that compose: the math
  of systems that surprise their own author

### Trail 8: Beyond Tonality (Ring 3)

Purpose: the twentieth century's other answers, for readers who want to see
past the key system. The Tone Row Checker makes this trail's demos nearly
free.

- `atonality` · Music without a home note: what holds it together instead,
  and how to listen to it honestly
- `twelve-tone` · The row: all twelve notes, none repeated, as the seed of a
  whole piece · demo: tone row checker
- `the-row-matrix` · Prime, inversion, retrograde, retrograde-inversion: the
  12 by 12 grid of every form of a row · demo: tone row checker matrix
- `combinatoriality` · Rows engineered so their halves interlock: serial
  craft at its most architectural · demo: tone row checker
- `set-theory-basics` · Pitch-class sets: naming harmonies that Roman
  numerals can't, without mysticism

### Side trail: Reading Music (optional, explicitly skippable)

Purpose: staff-notation literacy for readers who want to read outside
literature, taught by mapping from the piano roll they already know. Nothing
on the site requires this trail.

- `staff-notation` · The staff as a squashed piano roll: five lines, the
  same pitch axis, different compression
- `rhythm-notation` · Note shapes as durations: mapping flags and dots back
  to grid lengths you already use
- `key-signatures` · The sharps and flats at the line's start: a key,
  declared once instead of repeated
- `reading-lead-sheets` · Melody plus chord symbols: the working musician's
  format, and the fastest reading payoff for a producer

## Part 4: Pseudo site index

The page tree as it should eventually exist. Descriptions only; pages marked
*(future)* need templates or features that do not exist yet and are parked.

- `/` · Home. What the site promises (learn to speak the language of music,
  free, forever), who it serves, and the three doors: Concepts, Dictionary,
  Trails.
- `/concepts/` · The encyclopedia index: every article, grouped by category
  (harmony, counterpoint, rhythm, math and acoustics, form). Exists.
- `/concepts/<slug>/` · The articles. The trail lists in Part 3 are the
  complete planned inventory, roughly 75 articles. Two exist.
- `/trails/` *(future)* · The curriculum overlay: the eight trails and the
  side trail, each with its purpose sentence and reading order. This is the
  "start here" page for anyone who wants a path instead of a wander.
- `/trails/<trail>/` *(future)* · One page per trail: the ordered article
  list, ring by ring, with one line on why each article is where it is.
  Needs a small template; the ordering data could live in front matter or
  one data file. Parked until enough articles exist to order.
- `/dictionary/` · Every glossary term, one honest sentence each. Exists at
  17 terms; grows organically as articles wiki-link terms that don't exist
  yet (an unresolved wiki-link is a to-do, by design). Long-term this is
  hundreds of terms.
- `/dictionary/<term>/` · One page per term. Exists. Long-term each entry
  grows examples you can hear and a pointer to the article that teaches it.
- `/explorer/` *(future)* · The third note source: upload a MIDI file and
  run the same panels against your own music, client-side. Slots into the
  seam; nothing else changes. The bridge between reading the site and
  installing the extension.
- `/extension/` *(future)* · What the Ableton extension is, what it sees,
  honest install instructions, and the "learn it here, catch it there"
  story.
- `/about/` *(future)* · The mission, the mutual aid note, open source, who
  makes this, and how to say thanks (the Ko-fi can).
- Every article page carries the invisible `#comments` mount point, already
  built, waiting for the comment system described in `site/README.md`.

## Part 5: First steps (small victories)

The first eight articles, chosen to spread across trails, reuse demos that
already run, and give beginners a real Ring 0 entrance. In rough order:

1. `what-is-a-note` · Trail 1 · reuses the waves demo as-is. The site's
   true front door for a total beginner.
2. `the-piano-roll` · Trail 1 · no demo needed, just screenshots and clear
   prose. Unlocks "piano-roll first" for every later article.
3. `intervals` · Trail 2 · waves demo plus curated two-note examples.
4. `triads` · Trail 2 · first article to embed chord recognition; needs a
   small glue bundle like the counterpoint one (curated examples, verified).
5. `harmonic-function` · Trail 3 · tonic, subdominant, dominant with the
   explain panel's T/S/D badges against a curated progression.
6. `syncopation` · Trail 5 · first rhythm panel embed; straight-versus-
   pushed curated pair.
7. `modes` · Trail 3 · the jazz-modal differentiator, taught the improviser's
   way. High value, mostly prose, analyzer demo optional.
8. `motion-types` · Trail 4 · completes the counterpoint on-ramp so the
   existing article stops being an island.

Each of these also grows the glossary by its handful of terms, so the
dictionary accumulates in step. After these eight, re-map: the next queue
gets chosen from whatever the first eight taught us.

## Part 6: Open questions (parked, not blocking)

- The `/trails/` template and where trail ordering data lives (front matter
  vs one data file). Decide when there are enough articles to order.
- MIDI upload explorer: when, and whether it lands before or after the first
  full trail is readable.
- Whether dictionary entries eventually get their own richer template
  (audio, notation, inline demo) or stay one-sentence-plus-pointer.
- Ear training: real interactivity needs Web Audio (making the wave demos
  audible is the obvious first step). Big win, separate effort.
- Comments: design is settled (see `site/README.md`), timing is not.
