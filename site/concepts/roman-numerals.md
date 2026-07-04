---
title: Roman numerals
heading: "Roman numerals: chords named by their job"
summary: >-
  Every major key hands you the same seven chords, and numbering them frees
  a progression from its key. Watch the letters change while the numbers
  hold still.
category: harmony
lead: >-
  In [[intervals|Intervals]] you learned that your ear listens to distances,
  not note names: drag a melody up five semitones and it is still the same
  melody. The exact same thing is true of chords. A progression that works
  in C works in every key, and Roman numerals are how musicians write that
  fact down. Number the chords by where they sit in the [[key]] instead of
  naming their letters, and the progression's identity survives any
  transposition, which is why one numeral line can describe a thousand
  songs.
mountain: >-
  This page opens the door to harmonic analysis, and harmonic analysis is a
  mountain. Past this trailhead sit two centuries of argument about how
  chords function, several rival labeling systems, jazz chart dialects, and
  entire theories (Riemann's functions, Schenker's graphs) built to answer
  questions this page only points at. The numerals themselves are the easy
  part, and they are all you need for a long time.
see_also:
  - triads|Triads
  - the-major-scale|The major scale
  - keys|Keys
  - roman numeral
  - diatonic
  - chord
references:
  - author: "Georg Joseph Vogler"
    year: 1776
    title: "Tonwissenschaft und Tonsetzkunst"
    source: "earliest systematic use of Roman numerals for scale-degree harmony"
  - author: "Gottfried Weber"
    year: 1817
    title: "Versuch einer geordneten Theorie der Tonsetzkunst"
    source: "popularized the system, including uppercase and lowercase for chord quality"
---
## Watch the numbers hold still

Pick a progression, then walk the key buttons and listen. Every letter
name changes with the key. The numerals never move, because you are not
changing the music, only relocating it:

<div class="demo">
  <div class="demo-label">Live demo: the engine names the chords in every key</div>
  <nav class="btn-row" id="prog-picker" aria-label="Progression picker"></nav>
  <nav class="btn-row" id="key-picker" aria-label="Key picker"></nav>
  <div class="chord-cards" id="chord-cards"></div>
  <p class="demo-blurb" id="roman-readout"></p>
  <div class="btn-row"><button type="button" id="roman-play">Play</button></div>
  <canvas class="viz viz-tall" id="roman-canvas"></canvas>
</div>

Nothing in those cards is hardcoded. The chords are built, named, spelled,
and even recognized as a progression by the same engine that reads Ableton
Live sets in the Theory Aide extension. When the readout calls something
the "four-chord pop loop," that is the engine recognizing the shape from
the numerals alone, exactly as it does in your session.

## The seven chords a key gives you for free

Here is where the numbers come from. Take [[the-major-scale|the major
scale]] and build a [[triads|triad]] on every one of its seven notes, using
only notes the [[scale]] contains. No choices are involved: the scale's
step pattern decides every chord for you. In C major you get C, Dm, Em, F,
G, Am, and Bdim. These are the key's [[diatonic]] chords, the harmony it
hands you for free.

Now do the same in G major: G, Am, Bm, C, D, Em, F#dim. Different letters,
but look at the qualities. Major, minor, minor, major, major, minor,
diminished, in that order, every single time, in every major key. The
pattern of the scale fixes the pattern of the chords, so the qualities
are a property of the *positions*, not of the letters that happen to
occupy them.

That is the whole insight. If the quality at each position never changes,
the position is a better name than the letter.

## Naming the job, not the letter

So number the positions. The chord built on the first scale degree is I,
on the second ii, up to vii°. The case carries the quality you just
discovered: uppercase for major (I, IV, V), lowercase for minor (ii, iii,
vi), and a ° for the diminished chord (vii°). Read a [[roman
numeral|numeral]] and you know two things at once: where the chord sits
relative to home, and what flavor lives there.

This is why the demo's numbers hold still. "I to V" does not mean "C to G";
it means "home to the chord five steps up," and that relationship exists in
every key. It is also why musicians can talk to each other so efficiently:
"it's a 1-6-4-5 in Bb" is a complete set of instructions, and the same
sentence works when the singer wants it in C instead. The numerals are
chords described the way [[intervals|intervals]] describe notes: by
relationship, not by name.

One honest footnote: minor keys run the same trick on the minor scale and
get a different quality pattern (i, ii°, III, iv, v, VI, VII), plus some
habitual modifications that are their own story. The idea is identical;
only the pattern changes.

## In your music

You have probably been speaking this language without the notation.
Producers say "1-5-6-4" out loud; jazz charts say ii-V-I; Nashville session
players write the same idea with Arabic numbers. When you transpose a loop
in Live and it still works, you are hearing what the numerals notate.

The Theory Aide extension speaks numerals natively: Explain Harmony labels
every chord in your clip with its numeral in Live's current key, and the
Harmonic Timeline does the same across your whole arrangement, which is how
it can call a passage a ii-V-I regardless of what key you wrote it in.
Where those seven chords want to *go*, why V leans so hard toward I, is
the pull the trail explores next in [[keys|Keys]] and
[[the-circle-of-fifths|The circle of fifths]].

<script src="/assets/roman.js"></script>
