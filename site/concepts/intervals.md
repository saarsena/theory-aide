---
title: Intervals
heading: "Intervals: the distances your ear actually hears"
summary: >-
  The distance between two notes, counted in semitones, heard as a flavor.
  Taste seven of them with two live tones.
category: fundamentals
lead: >-
  Here is a strange fact hiding in plain sight: your ear barely cares which
  notes you play. Drag a whole melody up five semitones in Live and every
  single note changes, yet it is obviously the same melody. What survived
  the move is the set of distances between the notes. Those distances are
  called intervals, and they, not the notes themselves, are what your ear
  actually listens to.
see_also:
  - pitch-and-octave|Pitch and the octave
  - the-piano-roll|The piano roll
  - octave
  - semitone
  - consonance
  - math|The math behind music
references:
  - author: "Hermann von Helmholtz"
    year: 1863
    title: "On the Sensations of Tone as a Physiological Basis for the Theory of Music"
    source: "English translation by Alexander J. Ellis, 1875"
  - author: "Reinier Plomp and Willem J. M. Levelt"
    year: 1965
    title: "Tonal Consonance and Critical Bandwidth"
    source: "Journal of the Acoustical Society of America, vol. 38"
---
## Taste them

Each button below is one interval: a fixed distance between two tones. Press
**Hear it** and work through them slowly. Don't try to name the feelings
yet, just notice that each distance *has* one:

<div class="demo">
  <div class="demo-label">Live demo: two notes, seven distances</div>
  <nav class="btn-row" id="mode-picker" aria-label="Interval picker"></nav>
  <div class="btn-row"><input type="range" id="base-slider" min="0" max="1000" value="667" aria-label="Base frequency"><button type="button" id="hear-btn">Hear it</button></div>
  <p class="demo-blurb" id="interval-readout"></p>
  <canvas class="viz" id="interval-canvas"></canvas>
</div>

Now move the base slider while an interval plays. The notes change, the
flavor doesn't. A major third is bright and a semitone rubs no matter where
you put them, which is the lead paragraph's claim made audible: the flavor
lives in the distance, not in the notes.

## Counting the distance

On [[the-piano-roll]], an interval is simply a row count. One row is a
[[semitone]], the smallest step, and every interval is some number of them:
the minor third is three rows, the major third four, the perfect fifth
seven, the [[octave]] twelve. The traditional names (third, fifth) come
from counting steps along a scale, which is its own article; for now the
numbers in the demo's buttons are the honest measure, and they are what the
piano roll shows you directly. Count rows between any two notes and you
have named the interval's size, wherever it sits.

## Why they have flavors

The flavors are not taste or tradition; they are physics your ear performs
for free. Two notes a perfect fifth apart vibrate in a 3:2 relationship:
their waves realign constantly, the sum settles, and you hear it as open
and stable, what musicians call [[consonance]]. The major third is 5:4,
a slightly longer pattern, sweet rather than hollow. The semitone and the
tritone have no tidy small-number ratio at all, so the waves never settle
and you hear the churn: [[dissonance]], the rub the demo made obvious.
Watch the sum line in the canvas flip between calm and boiling as you
switch buttons; that line is the physics. The full arithmetic lives in
[[math|The math behind music]]. (One honest footnote: the piano roll's
intervals are nudged a hair away from these pure ratios so that all twelve
keys can share one tuning. Why, and what it costs, is the temperament
story, coming later in the math trail.)

Helmholtz worked out the physical basis of consonance in the 1860s, and
Plomp and Levelt pinned down the modern version experimentally a century
later: roughness is what your ear reports when two tones crowd the same
critical band. The references below are the deep end.

## In your music

Intervals are the working unit of nearly everything this site teaches.
Chords are intervals stacked: a major chord is a major third with a perfect
fifth around it, which is why the demo's 5:4 button sounds like the inside
of happiness. Basslines against leads are intervals in motion, which is the
whole subject of [[counterpoint]]. And when the Theory Aide extension names
a chord in your Live set, it is doing exactly what you did above: measuring
the distances between simultaneous notes and recognizing the flavor. Your
ear has been fluent in intervals all along; now you know what it was
tasting.

<script src="/assets/intervals.js"></script>
