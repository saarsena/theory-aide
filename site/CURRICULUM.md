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
   probably two articles. And when the one idea is the visible tip of a
   whole literature (scales, melody, keys), the article says so out loud:
   the "A mountain, not a page" aside (`mountain` front matter) admits the
   depth and points at it, instead of pretending one page settled it.
9. **No gatekeeping tone.** Jargon is always wiki-linked to a plain
   definition. "Guru" means fluent, not initiated. Rules are explained by what
   they protect (independence, clarity, tension), never enforced as law.
10. **The prose rules hold everywhere.** No em dashes, plain sentences, no
    LLM cadence. See `site/README.md`.
11. **Claims get sources.** History, research, numbers, and other people's
    ideas are named inline and cited in a References section at the foot of
    the article. Plain English does not mean unsourced. Mechanics in
    `site/README.md`.

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

### The two tracks (added 2026-07-03)

On top of rings (depth) and trails (topic) sits the reading contract, taken
with gratitude from Misner, Thorne, and Wheeler's *Gravitation*, the physics
textbook famously built as two interleaved tracks through one book:

- **Track 1 is the spine.** One ordered chain of articles, drawn from
  across the trails, that is complete on its own: read only Track 1, in
  order, and you have genuinely learned to speak music. Spine articles
  show their position ("Track 1 · article 4 of 28") and carry previous/next
  navigation, so a beginner can simply keep pressing next. The order lives
  in one file (`site/_data/spine.js`) and grows as articles ship.
- **Track 2 is everything else.** The math trail, the guru wings, the deep
  dives. Track 2 always assumes Track 1 and is always *reached from* a
  Track 1 moment (a hook, a link, a "that story is over here"), but no
  Track 1 article ever requires it. Skipping Track 2 costs depth, never
  continuity.

The two properties to protect: **Track 1 stays complete** (never park an
essential concept in Track 2) and **Track 2 is never load-bearing** (if a
spine article can't be understood without a Track 2 page, either the spine
article is missing a paragraph or the Track 2 page belongs on the spine).

### Track 2: the clusters (added 2026-07-04)

Track 2 grows in named clusters, not one at a time. A cluster is a short
teaching order through existing stubs (Part 3 still owns the stubs), and
every Track 2 article must name the spine article(s) it hangs off, so
nothing ends up like `organizing-time` did: live, good, and reachable from
exactly one sentence. Slugs below are the Part 3 stub names.

Shipped cluster order lives in `site/_data/clusters.js` (the Track 2
mirror of the spine file): each cluster's shipped articles in reading
order, surfaced as a track bar ("Track 2 · The climb · article 2 of 2")
with previous/next links on every clustered article, and presented on the
`/tracks/` page (shipped 2026-07-25) alongside the full spine.

1. **The math of sound** (exists: `math`, `organizing-time`; next:
   `harmonics`). Hangs off `what-is-a-note`, `pitch-and-octave` (which
   already promises the harmonics story), `the-piano-roll`, `intervals`.
2. **Harmony, continued** (exists: `roman-numerals`, `seventh-chords`,
   `progressions`, `cadences`, the cluster's core run complete, which
   unblocks the climb's Ring 3 summit `chord-scale-thinking`). Hangs off
   `triads`, `keys`, `the-circle-of-fifths`.
3. **Time and phrasing** (exists: `the-beat`, `meter`, `subdivision`,
   `rests-and-space`, `phrasing`, the cluster's core run complete; later
   `syncopation`, `groove`).
   Hangs off `the-piano-roll`, `organizing-time`, `melody`. The spine
   skipped rhythm entirely, so this cluster runs closest to the
   load-bearing line: watch it. The extension's Rhythm & Phrasing panel
   (phrase detection, breath points, the "delayed answer" move) finally
   gets its teaching material here.
4. **The modal ascent** (exists: `minor-scales`, `modes`,
   `borrowed-chords`, the cluster's core run complete; the Ring 3 wing `modal-interchange` and
   `chord-scale-thinking` waits for the harmony cluster to catch up).
   Hangs off `the-major-scale`, `keys`, `the-circle-of-fifths`.

**The interleave rule (decided 2026-07-04):** clusters 3 and 4 are one
climb. A mode is a palette; phrasing is how you say anything with it, and
teaching modes without phrasing trains scale-runners. The climb follows the
sequence the site's author was actually taught (blues boxes first, then
modes across the whole neck, then which modes speak over which chords and
progressions): **safe palette, then phrasing, then palettes, then
application.** The safe palette is `pentatonic-and-blues`, five notes you
can't get wrong, which is why the blues box teaches phrasing: pitch anxiety
is removed and all attention lands on when, how long, and where to breathe.
Suggested reading order: `pentatonic-and-blues`, `the-beat`, `meter`,
`rests-and-space`, `phrasing`, `minor-scales`, `modes`, `borrowed-chords`,
with `chord-scale-thinking` (the "what speaks over what" assignment) as the
Ring 3 summit. The modal articles demo improvised phrases, not scale
charts, in the improv-instructor voice that is this site's origin story.
The planned `/tracks/` page presents Track 1 as the course and these
clusters as the named paths beyond it.

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
- `the-beat` **(exists)** · The pulse your foot finds. Tempo as beats per
  minute, and why 128 BPM feels different from 90 · demo: metronome, 40 to
  220 BPM, with the half-time regrouping audible at the top
- `meter` **(exists)** · How beats group into bars: what 4/4 actually says,
  and the neighbors (3/4, 6/8) · demo: Bolton's identical-clicks illusion,
  then an accent picker with six pulses cut 3+3 vs 2+2+2 · *(spiral: Trail 5)*
- `the-piano-roll` · The piano roll is a map: pitch up, time across. Reading
  Live's grid as real notation, because it is

### Trail 2: Building Blocks (Rings 0 to 1)

Purpose: the vocabulary everything else is written in: intervals, scales,
keys, melodies, chords.

- `intervals` **(exists)** · The distance between two notes, counted in
  semitones, heard as flavor. The interval, not the note, is what your ear
  reacts to · demo: two live tones, seven selectable intervals
- `steps-and-leaps` · Half steps, whole steps, and jumps: the difference
  between a melody that walks and one that vaults
- `the-major-scale` **(exists)** · The step pattern most Western music walks
  on, and how to build it from any note in the piano roll · demo: mini-roll
  scale climb from any root
- `minor-scales` **(exists)** · The same notes, a new home: relative keys as
  the keyhole into the modes, then the three minors as one missing magnet and
  two repairs · demo: the movable home (white keys resting on C or A, with
  natural/harmonic/melodic switches over a drone)
- `pentatonic-and-blues` **(exists)** · Five notes you can't get wrong: the
  improviser's sandbox, where phrasing gets learned because pitch is safe ·
  demo: dice-rolled phrases over a drone, safe palette vs all twelve notes
- `keys` **(exists)** · What "in C major" means. The tonic as home, and how
  every other note gets its job from where home is · demo: same melody,
  landed vs hanging ending
- `melody` **(exists)** · Contour, steps versus leaps, range, and why
  melodies breathe. What makes a line singable even when nothing sings it ·
  demo: three shapes on the mini-roll
- `triads` **(exists)** · Stack two thirds and you have a chord. Major,
  minor, diminished, augmented, straight off the piano roll · demo: three
  live tones, named by the engine's chord recognizer
- `inversions` · Same notes, different bass, different feel. Why the bottom
  note matters most

### Trail 3: Harmony (Rings 1 to 3)

Purpose: chords, what they want, and where they pull. The longest trail,
and at Ring 3 it becomes the jazz and modal wing.

Ring 1:

- `roman-numerals` **(exists)** · The seven chords a key gives you for
  free, and naming them by their job instead of their letter, so a
  progression means the same thing in every key · demo: engine-named
  progressions across all twelve keys (absorbed the former
  `chords-in-a-key` stub; one lesson, decided 2026-07-04)
- `progressions` **(exists)** · Why some chord orders feel inevitable and
  others feel random. The pull, in plain terms · demo: one chord pool, four
  orderings (pop loop, dark start, schoolbook, wanderer), three named by
  detectProgressions and the wanderer verified to match nothing
- `seventh-chords` **(exists)** · Add one more third and chords learn to
  lean. Major 7, dominant 7, minor 7, half-diminished · demo: the flavor lab
  (four qualities on one root, triad/+7th toggle) and the lean (G-C vs G7-C,
  the tritone resolving), names verified against the recognizer
- `cadences` **(exists)** · How music punctuates: full stops, commas, and
  question marks at the ends of phrases · demo: one phrase, four endings
  (authentic, plagal, half, deceptive) with a silent breath bar, the first
  two named by the engine's templates

Ring 2:

- `harmonic-function` · Tonic, subdominant, dominant: home, away, and the
  pull back home. Three jobs behind all seven chords · demo: explain panel
  T/S/D badges
- `the-circle-of-fifths` **(exists)** · The map of keys: why neighbors share
  notes and what "closely related" actually measures · demo: clickable
  wheel, hear each key's distance from C
- `modes` **(exists)** · Seven homes, one bass: the mode lives in the drone,
  not the scale, taught the way an improviser learns them · demo: white keys
  over a movable drone, move-the-home and one-root views, Locrian's missing
  fifth audible
- `borrowed-chords` **(exists)** · Stealing from the parallel key for color,
  and why the minor iv in a major song hits like it does · demo: one loop,
  three loans (iv, bVII, bVI), engine-verified against the borrowed badges
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

- `voices` **(exists)** · What a "voice" is when nothing is singing: your
  bass, lead, and pad are voices whether you meant it or not · demo:
  bass and lead, together and soloed
- `motion-types` **(exists)** · Parallel, similar, oblique, contrary: the
  four ways two lines can move, and which ones protect independence · demo:
  two voices, four motions, engine-verified examples
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

- `the-beat` **(exists)** · *(spiral: Trail 1)*
- `meter` **(exists)** · *(spiral: Trail 1)*

Ring 1:

- `subdivision` **(exists)** · Eighths, sixteenths, triplets: slicing the
  beat, and what the grid settings in Live actually choose · demo: slice
  picker over a steady bar, plus the beats-or-slices flip (one train,
  weights decide)
- `rests-and-space` **(exists)** · Silence as material: the notes you don't
  play are doing work · demo: clickable sixteen-cell step sequencer, loaded
  full so the first act is deletion; tresillo and son clave presets
- `syncopation` · Accents landing off the strong beats: the pushed, alive
  feel, and how to place it deliberately · demo: rhythm panel
- `swing` · Displacing the grid on purpose: what the swing knob does and
  where the feel lives

Ring 2:

- `phrasing` **(exists)** · Musical sentences: where lines breathe, and why
  four and eight keep showing up · demo: one pentatonic sentence five ways
  (question / answer / both / no breaths / delayed answer), presets verified
  against the rhythm engine
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
- `organizing-time` **(exists)** · Music is the art of organizing time: hear
  a rhythm accelerate into a pitch, then ride the zoom lens from form down
  to timbre · demo: pulse accelerator
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
- `/tracks/` · Track 1 in full reading order plus the Track 2 clusters
  with their shipped articles. Exists (2026-07-25), rendered from
  `site/_data/spine.js` and `site/_data/clusters.js`.
- `/trails/` *(future)* · The deeper curriculum overlay: the eight trails
  and the side trail, each with its purpose sentence, ring by ring. Parked
  until enough articles exist to order.
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
