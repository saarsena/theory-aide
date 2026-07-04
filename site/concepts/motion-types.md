---
title: Motion types
heading: "Motion types: the four ways two voices move"
summary: >-
  Parallel, similar, oblique, contrary: every pair of moving voices is
  doing one of four things, ranked by independence.
category: counterpoint
lead: >-
  Take any two [[voices|voices]] and watch one move: the other voice can go
  the same direction by the same amount, the same direction by a different
  amount, hold still, or go the other way. That is the complete list.
  Parallel, similar, oblique, contrary: four motions, and every moment of
  every duet, chorale, or bass-and-lead arrangement is spending its time in
  one of them. Which ones it favors decides whether two voices sound like
  two voices.
mountain: >-
  This four-way taxonomy is the front gate of counterpoint, a discipline
  with three centuries of formal pedagogy behind it (Fux's 1725 species
  method is still taught) and craft traditions far older. Everything past
  this gate, which mixtures of motion to favor, what to do at phrase
  endings, how many voices you can actually steer, is the mountain the
  [[counterpoint]] article and its trail start climbing.
see_also:
  - voices|Voices
  - contrary motion
  - parallel motion
  - oblique motion
  - similar motion
  - counterpoint|Counterpoint
references:
  - author: "Johann Joseph Fux"
    year: 1725
    title: "Gradus ad Parnassum"
    source: "English translation, The Study of Counterpoint, trans. Alfred Mann, W. W. Norton"
---
## The four ways

Same two voices, four relationships. Each example was verified against the
extension's counterpoint engine before the captions were written, so what
the captions claim is what the checker actually reports:

<div class="demo">
  <div class="demo-label">Live demo: two voices, four motions, engine-verified</div>
  <nav class="btn-row" id="motion-picker" aria-label="Motion picker"></nav>
  <div class="btn-row"><button type="button" id="motion-play">Play</button></div>
  <p class="demo-blurb" id="motion-blurb"></p>
  <canvas class="viz viz-tall" id="motion-canvas"></canvas>
</div>

Play them in order and listen for one thing only: how many voices you
hear. Parallel sounds closest to one; contrary sounds most like two.

## Ranked by independence

The four motions are really a scale of independence. [[parallel
motion|Parallel]] is the least independent: the second voice is a copy at
a fixed distance, adding thickness but not a second thread. [[similar
motion|Similar]] keeps the direction but breaks the lockstep. [[oblique
motion|Oblique]] gives one voice full freedom against an anchor, which is
why drones and pedal tones feel so open. And [[contrary motion|Contrary]]
is full independence, two shapes your ear cannot merge. None of them is
wrong; a good pair of lines uses all four, the way good writing uses long
and short sentences. What matters is knowing which one you are spending.

## When parallel burns you

Parallel motion has one sharp edge, and you have already met it: at the
"empty" intervals, the fifth and the octave, parallel motion makes the
fusion total. That is the parallel example above, and the checker flags
all three moves as [[parallel fifths]]. Parallel thirds and sixths, by
contrast, are a beloved sound (every vocal duet leans on them), because
those intervals keep enough color to stay two voices. The rule of thumb
is not "never move in parallel"; it is "don't move in parallel through
the intervals that erase a voice."

## In your music

Pull up any track where a bassline and a lead coexist and watch them in
the piano roll: every simultaneous move is one of these four. If a section
feels thick but weightless, check how much of it is parallel motion; if a
drop feels rigid, an oblique pedal under a moving top line opens it up;
and the counterpoint checker in the Theory Aide extension reports exactly
this breakdown, per pair of tracks, for your actual set. You now read its
report natively, and the next article puts all four motions to work.

<script src="/assets/motion.js"></script>
