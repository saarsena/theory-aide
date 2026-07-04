---
title: The Math
heading: The math behind music
summary: >-
  A note is a number, and consonance is arithmetic. Then twelve fifths refuse
  to fit inside seven octaves, and the whole system has to cheat to survive.
category: math and acoustics
lead: >-
  A note is a number: how many times per second the air moves back and forth.
  Intervals, consonance, keys, why [[parallel fifths]] "fuse": every one of
  them is a relationship between those numbers. Most tools gloss over this.
  Stated plainly, <em>you are hearing arithmetic</em>, and once you follow the
  arithmetic far enough it does something wonderful: it breaks, and music has
  to compromise to keep going.
see_also:
  - organizing-time|Organizing time
  - the-circle-of-fifths|The circle of fifths
  - intervals|Intervals
  - counterpoint
  - parallel fifths
  - equal temperament
references:
  - author: "Hermann von Helmholtz"
    year: 1863
    title: "On the Sensations of Tone as a Physiological Basis for the Theory of Music"
    source: "English translation by Alexander J. Ellis, 1875"
  - author: "J. Murray Barbour"
    year: 1951
    title: "Tuning and Temperament: A Historical Survey"
    source: "Michigan State College Press"
---
## Watch two notes add up

Below are two sound waves and their sum: what actually reaches your ear when
both notes play at once. Try each interval and watch the **sum**, the dark
line:

<div class="demo">
  <div class="demo-label">Live demo: two waves and what your ear receives</div>
  <nav class="btn-row" id="ratio-picker" aria-label="Interval picker"></nav>
  <p class="demo-blurb" id="ratio-blurb"></p>
  <canvas class="viz" id="wave-canvas"></canvas>
</div>

- **Octave (2:1)**: the top wave fits *exactly twice* inside the bottom one,
  so the sum repeats in perfect lockstep. Your ear hears the two notes as
  almost the same thing, which is why [[parallel octaves]] collapse two
  melodies into one. Mathematically, they nearly are one.
- **Perfect fifth (3:2)**: three cycles against two. Still a tiny
  whole-number ratio, so the sum settles into a short repeating pattern:
  consonant, stable, empty enough to fuse. Hence [[parallel fifths]].
- **Slightly detuned**: the ratio is *almost* 1:1 but not quite, so the waves
  drift in and out of agreement. The slow swelling is *beating*: the
  difference between the two frequencies, made audible. Hold onto beating.
  It comes back as the villain of this whole story.

Consonance is not a matter of taste that theory later rationalized. It is
small-whole-number arithmetic your ears do for free, hundreds of times a
second. Dissonance is just harder math.

## Why twelve, and why they don't quite fit

Here is the fact that everything downstream depends on, and that almost no
beginner is ever shown. Start on any note and go up a perfect fifth, the
strong 3:2. Do it again, and again, twelve times. You pass through all
twelve notes and land back on a version of where you started, seven octaves
higher. That is [[the-circle-of-fifths|the circle of fifths]], and it is why
Western music has exactly twelve notes: twelve fifths bring you home.

Except they don't. Multiply the ratios and check. Twelve fifths is
(3/2) multiplied by itself twelve times, which is about **129.75**. Seven
octaves is 2 multiplied by itself seven times, which is exactly **128**.
Those are not the same number. Twelve pure fifths overshoot seven octaves by
a ratio of about 129.75 to 128, a gap of roughly **23 [[cent|cents]]**, just
under a quarter of a semitone. The circle of fifths, the neat wheel the whole
key system rides on, does not actually close.

This gap has a name, the Pythagorean comma, and it is not a rounding error
or a flaw in anyone's instrument. It is a permanent, provable fact about the
numbers 2 and 3: no stack of pure fifths will ever land exactly on a pure
octave, because no power of 3/2 will ever equal a power of 2. The universe
simply did not arrange for music's two most basic intervals to agree.

## The compromise everyone agreed to

So music cheats, and the cheat is so total that you have never once heard a
piano play a pure fifth. The modern fix is **[[equal temperament]]**: forget
the pure ratios, and instead chop the octave into twelve *identical* steps.
Each step is the number that, multiplied by itself twelve times, gives
exactly 2: the twelfth root of 2, about **1.05946**. Every semitone on every
piano is that one irrational number.

Doing this smears the comma evenly across all twelve fifths. Each tempered
fifth is about 2 cents flat of pure, small enough that almost nobody notices,
and twelve of those tiny shortfalls add up to precisely the 23-cent comma,
now paid off a little at a time instead of dumped in one ugly lump. The
trade is exact and it is the deal underneath all Western music: **give up
being perfectly in tune in any single key, and in return be equally, only
slightly, out of tune in all of them.** Before this deal, an instrument
tuned pure in C was unusable in F sharp. After it, one tuning plays
everything, which is the entire reason a piano can exist.

You can hear the price. The tempered major third pays the most: it lands
about **14 cents sharp** of the pure 5:4, enough that its overtones grind
against the root's and produce exactly the beating from the first demo:

<div class="demo">
  <div class="demo-label">Live demo: the same chord, in tune two different ways</div>
  <nav class="btn-row" id="tuning-picker" aria-label="Tuning picker"></nav>
  <div class="btn-row"><button type="button" id="temper-hear">Hear it</button></div>
  <p class="demo-blurb" id="temper-readout"></p>
  <canvas class="viz" id="temper-canvas"></canvas>
</div>

The just chord sits perfectly still. The equal-tempered chord shimmers, about
four beats a second, and that shimmer is the comma, spread thin and paid in
full on every major chord your favorite records are built from. Once you have
heard it you cannot unhear it, and you also understand why it is worth it.

## Where this is going

This page is the front door to the math trail, and the trail runs deep. The
idea that pitch itself is just rhythm too fast to count is
[[organizing-time|Organizing time]]. Still ahead: why a single played note is
secretly a stack of many (harmonics, and why timbre is a recipe), sine waves
as circular motion, and, for the Max and gen~ crowd, what those patches are
actually computing when an LFO climbs into audio rate. It is generative
calculus wearing a hoodie. I mean, c'mon.

<script src="/assets/waves.js"></script>
<script src="/assets/temperament.js"></script>
