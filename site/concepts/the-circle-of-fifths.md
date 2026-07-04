---
title: The circle of fifths
heading: "The circle of fifths: the map of keys"
summary: >-
  Twelve keys arranged so neighbors differ by one note. Click around the
  wheel and hear how far from home you are.
category: harmony
lead: >-
  Once music has homes, it has distances between homes. Some key changes
  feel like stepping into the next room; others feel like landing in another
  country. The [[circle of fifths]] is the map that makes those distances
  exact: all twelve major keys on a wheel, arranged so that moving one step
  swaps exactly one note. It is the single most useful diagram in Western
  harmony, and it is genuinely a map, in that near things on it sound near.
mountain: >-
  The circle is the map room of harmony, and this page only unlocks the
  door. Key signatures read straight off it, modulation routes are paths
  across it, chord progressions trace little loops on it (the ii V I is a
  three-step walk home), and its minor-key inner ring, its use in jazz, and
  its relationship to tuning each have literatures of their own.
see_also:
  - keys|Keys
  - circle of fifths
  - key
  - intervals|Intervals
  - math|The math behind music
references:
  - author: "Nikolai Diletsky"
    year: 1679
    title: "Grammatika musikiyskago peniya (A Grammar of Music)"
    source: "contains the earliest known circle-of-fifths diagram"
  - author: "Johann David Heinichen"
    year: 1728
    title: "Der General-Bass in der Composition"
    source: "the treatise that popularized the circle in Western practice"
---
## Click around

C sits at the top. Click any key to hear its chord and see how much it
still has in common with C major:

<div class="demo">
  <div class="demo-label">Live demo: twelve keys, one wheel</div>
  <p class="demo-blurb" id="circle-blurb"></p>
  <canvas class="viz viz-tall" id="circle-canvas"></canvas>
</div>

Work your way around clockwise: G, then D, then A. Each step sounds a
little further from where you started, and the caption keeps count of why:
each step keeps six of C's seven notes and swaps one. By the far side of
the wheel (F#, six steps out) only one note survives, and it sounds like
it.

## Neighbors share almost everything

This is the property that makes the circle a map and not just a list.
Two keys one step apart share six of seven notes, so a melody can drift
between them almost without the listener noticing, which is exactly how a
lot of songs change key. Two keys across the wheel share almost nothing,
so jumping between them is a dramatic event. Distance on the circle *is*
harmonic distance: not a metaphor, a measurement, and you just heard it.

## Why fifths

The wheel is built by stacking the perfect fifth, the 3:2 interval from
[[intervals|the interval demo]], the strongest relationship two different
notes can have. Go up a fifth from C and you get G, the key most like C.
Do it twelve times and you visit every key exactly once before arriving
back home, which is a small miracle of arithmetic (twelve fifths very
nearly equal seven octaves, and the "very nearly" is the temperament story
in [[math|the math trail]]). The circle closing at all is why Western
music can treat its twelve keys as one connected space.

## In your music

Producers use this map constantly without the diagram: the lift of a
late-song key change up one step, the smoothness of borrowing a chord from
a neighboring key, the drama of a truck-driver modulation from nowhere.
When the Theory Aide extension's set audit finds a clip whose key disagrees
with the Live set's key, the circle is how to read the disagreement: one
step off is a spice; five steps off is probably an accident, and now you
can tell which.

<script src="/assets/circle.js"></script>
