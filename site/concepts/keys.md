---
title: Keys
heading: "Keys: where home is"
summary: >-
  Pick a scale and one note becomes home. Hear the same melody land, then
  hang one row short, and feel the gravity.
category: fundamentals
lead: >-
  Stay inside one [[scale]] for a while and something happens that no single
  note causes: one of the seven starts to feel like *home*. Melodies leave
  it and come back to it; endings on it feel finished; endings off it feel
  suspended in the air. That gravity field is a [[key]]. "In C major" does
  not mean "uses only white notes"; it means C is where the gravity points.
mountain: >-
  Keys open onto half the map of music theory: the [[the-circle-of-fifths|
  circle of fifths]] that arranges them, modulation (moving between them
  mid-song), relative and parallel minor, and the modes, where the same
  seven notes pledge allegiance to a different home. Every one of those is
  its own literature. This page teaches only the gravity itself.
see_also:
  - the-major-scale|The major scale
  - key
  - tonic
  - melody|Melody
  - the-circle-of-fifths|The circle of fifths
---
## The itch

Two versions of the same melody. They differ in exactly one note, the last
one. Play "Ends home" first, then "Ends one row short," and pay attention
to your own reaction as the loop restarts:

<div class="demo">
  <div class="demo-label">Live demo: the same melody, landed and hanging</div>
  <nav class="btn-row" id="ending-picker" aria-label="Ending picker"></nav>
  <div class="btn-row"><button type="button" id="keys-play">Play</button></div>
  <p class="demo-blurb" id="keys-blurb"></p>
  <canvas class="viz" id="keys-canvas"></canvas>
</div>

That itch on the second version is not taste, and you did not learn it in
a classroom. The melody spent the whole bar teaching your ear that C is
home, and then it stopped one semitone short, on the note theorists call
the leading tone precisely because of the way it *leads*. Your ear finishes
the melody whether or not the music does.

## Gravity, not a rulebook

A key assigns every note a job, defined by its distance from home. The
[[tonic]] is rest. The note a fifth above is the strong counterweight. The
leading tone is the itch you just felt. Nothing about this is a rule you
follow; it is a field you work *in*, the way a dancer works in gravity.
Tension in tonal music is, at bottom, distance from home made audible, and
a melody or chord progression is a trip: how far out it goes, how long it
stays, which road it takes back.

## Portable homes

Like the scale it comes from, a key is a pattern, not a set of pitches:
move home from C to F and every job moves with it, which is why a song
transposed for a singer's range is still recognizably the same song. What
changes between keys is not the internal logic but the *address*, and how
far apart two addresses are, why C and G are neighbors while C and F# are
strangers, turns out to have an exact geometric answer. That map is next.

## In your music

Live carries a key setting per set and per clip, and when Scale Mode is on
the Theory Aide extension treats that as ground truth: every chord it
explains and every clash it flags is measured against Live's declared home.
When the key is not set, the extension infers one from the notes, the same
way your ear just did, by noticing which note the music treats as the
floor.

<script src="/assets/keys.js"></script>
