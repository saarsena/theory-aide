---
title: Subdivision
heading: "Subdivision: slicing the beat"
summary: >-
  The beat holds still while the space inside it gains structure: eighths,
  triplets, sixteenths, and what Live's grid menu is actually choosing.
category: rhythm
lead: >-
  [[meter|Meter]] went upward: beats bundled into [[bar]]s. This page goes
  the other way. Each beat can be sliced into smaller equal parts, and
  those slices, not the beats themselves, are where most of your rhythms
  actually live. The kick may land on the beat, but the hats, the ghost
  notes, the melody's pickup, the little push before the drop: all of that
  happens between the beats, on the subdivision.
mountain: >-
  Below the slices on this page lies the world of microtiming: the
  milliseconds by which real drummers land off the lattice on purpose, the
  research field that measures groove in deviations, and the reason
  "humanize" is a button in your DAW. Jeff Bilmes' MIT thesis, the source
  of the tatum idea below, is the classic door in. This page stops at the
  grid; the feel lives just past it.
see_also:
  - meter|Meter
  - the-beat|The beat
  - organizing-time|Organizing time
  - triplet
  - grid
  - quantize
references:
  - author: "Jeff A. Bilmes"
    year: 1993
    title: "Timing is of the Essence: Perceptual and Computational Techniques for Representing, Learning, and Reproducing Expressive Timing in Percussive Rhythm"
    source: "MS thesis, Massachusetts Institute of Technology"
    url: "https://dspace.mit.edu/handle/1721.1/62091"
  - author: "Dirk-Jan Povel and Peter Essens"
    year: 1985
    title: "Perception of Temporal Patterns"
    source: "Music Perception 2(4)"
---
## Slice the beat

Press **Hear it** with the slices off: four beats, the pulse you already
know. Then cut them:

<div class="demo">
  <div class="demo-label">Live demo: the slice picker</div>
  <div class="btn-row"><button type="button" id="sub-off">No slices</button><button type="button" id="sub-2">In 2</button><button type="button" id="sub-3">In 3</button><button type="button" id="sub-4">In 4</button><button type="button" id="sub-hear">Hear it</button></div>
  <p class="demo-blurb" id="sub-blurb"></p>
  <canvas class="viz" id="sub-canvas"></canvas>
</div>

Listen to what changes and what does not. The beats never move: same
tempo, same weight, same spacing. The ticks between them are new
structure inside each beat, and each choice has its own personality. Two
is neat. Four is urgent. Three rolls.

If this demo feels familiar, it should: it is [[meter|Meter]]'s accent
picker one rung down the ladder from [[organizing-time|Organizing
time]]. Meter grouped beats into bars; subdivision slices beats into
parts. Same move, opposite directions, and the piano roll draws both at
once: heavy lines bundling up, light lines slicing down.

## Two, three, four

The names follow from the arithmetic. Cut each beat of a 4/4 bar in two
and the bar holds eight slices: eighths. Cut each beat in four and the
bar holds sixteen: sixteenths. Cut a beat in three and you get a
[[triplet]], three equal parts where two would normally sit.

The real divide in that list is not between eighths and sixteenths, which
are just zoom levels of each other. It is between duple and triple:
slicing in twos and fours, or slicing in threes. Straight versus rolling.
Most tracks pick one side and stay there, which is why a triplet dropped
into a straight groove turns heads.

Live's [[grid]] menu is exactly this demo's picker wearing different
clothes: 1/8, 1/16, and the T entries, where T is for triplet. Choosing a
grid width is choosing a subdivision, and every note you draw snaps to
the slices that choice creates.

## The flip

Here is the part that upgrades your ear. Whether something *is* a beat or
a slice is not a fact about the sound. It is a decision about weight:

<div class="demo">
  <div class="demo-label">Live demo: beats or slices, you decide</div>
  <div class="btn-row"><button type="button" id="flip-beats">Hear them as beats</button><button type="button" id="flip-slices">Hear them as slices</button><button type="button" id="flip-hear">Hear it</button></div>
  <p class="demo-blurb" id="flip-blurb"></p>
  <canvas class="viz" id="flip-canvas"></canvas>
</div>

The train of clicks never changes speed. Give every click equal weight
and it reads as a frantic 240 BPM. Put weight on every fourth and the
same train becomes a calm 60 with sixteenths inside it. This is the flip
[[the-beat|The beat]] promised when its readout said your foot "quietly
starts tapping every other click": drum and bass runs its hats near 174,
but the floor feels 87, because the ear files the fast layer as
subdivision, not beat. Subdivision is a hearing, not a speed.

## The finest slice

A groove does not use every subdivision at once. Listen to almost any
track and there is a finest regular slice that everything snaps near,
the smallest currency the rhythm trades in. Jeff Bilmes named it the
tatum, after Art Tatum, in the thesis that taught computers to hear
expressive timing. A boom-bap beat trades in sixteenths; a shuffle
trades in triplets; and Dirk-Jan Povel and Peter Essens showed that
patterns sitting cleanly on one regular lattice are the ones listeners
grasp and remember most easily. Committing to a tatum is not a
limitation. It is what makes a groove learnable by the body listening
to it. Mixing lattices, triplet fills over a straight groove, is real
spice precisely because it breaks that contract for a moment.

## In your music

The grid is a subdivision commitment, and Live gives it hotkeys: Ctrl or
Cmd plus 1 and 2 narrow and widen the grid, plus 3 toggles triplets, plus
4 turns snapping off. [[quantize|Quantize]] pulls every note to the
nearest slice of whatever grid you committed to, which is why quantizing
to the wrong grid flattens a groove: the notes were trading in a currency
the grid did not recognize. The extension's Rhythm And Phrasing panel
measures grid alignment on these same lattices, so its readings are
subdivision readings.

Two experiments: when a section needs energy, do not touch the tempo,
halve the tatum instead, hats from eighths to sixteenths, and notice the
track gets busier without getting faster, which is the slice picker's
lesson in production form. And when a part refuses to sit, check which
lattice it is actually on: a triplet hat over a straight-sixteenth bass
is friction you can hear long before you can name it. What you leave
*empty* on the lattice matters as much as what you fill, and the notes
you don't play are the next stop on the climb.

<script src="/assets/subdivision.js"></script>
