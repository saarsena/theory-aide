---
title: The Math
heading: The math behind music
summary: >-
  A note is a number, and consonance is arithmetic. Watch two waves add up
  into what your ear actually receives.
category: math and acoustics
lead: >-
  A note is a number: how many times per second the air moves back and forth.
  Every idea in music theory including intervals, consonance, keys, and why
  [[parallel fifths]] "fuse" is a relationship between those numbers. Tools
  usually gloss over this. Stated plainly: <em>you are hearing arithmetic.</em>
see_also:
  - counterpoint
  - parallel fifths
  - parallel octaves
---
## Watch two notes add up

Below are two sound waves and their sum as well as what actually reaches your
ear when both notes play at once. Try each interval and watch the **sum**
(the dark line):

<div class="demo">
  <div class="demo-label">Live demo: two waves and what your ear receives</div>
  <nav class="btn-row" id="ratio-picker" aria-label="Interval picker"></nav>
  <p class="demo-blurb" id="ratio-blurb"></p>
  <canvas class="viz" id="wave-canvas"></canvas>
</div>

## What you just saw

- **Octave (2:1)**: the top wave fits *exactly twice* inside the bottom one,
  so the sum repeats in perfect lockstep. Your ear hears the two notes as
  almost the same thing. That's why [[parallel octaves]] collapse two melodies
  into one. Mathematically, they nearly are one.
- **Perfect fifth (3:2)**: three cycles against two. This is still a tiny
  whole number ratio, so the sum settles into a short repeating pattern:
  consonant, stable, "empty" enough to fuse. Hence [[parallel fifths]].
- **Slightly detuned**: the ratio is *almost* 1:1 but not quite, so the waves
  drift in and out of agreement. The slow swelling you see (and would hear)
  is *beating*: the difference between the two frequencies, made audible.

Consonance isn't a matter of taste that theory later rationalized, it is
small whole number arithmetic your ears do for free. They do that shit
hundreds of times a second too. Dissonance is just harder math.

## Where this is going

*This page is the first in a series of prototypes that if fleshed out will
go into detail about sine waves as circular motion, harmonics and why timbre
is a recipe, equal temperament as compromise with a 12th root in it, and for
me (and the other max msp people), what those patches are actually doing.
It's generative fucking calculus. I mean, c'mon.*

<script src="/assets/waves.js"></script>
