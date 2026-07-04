---
title: Pentatonic and blues
heading: "Pentatonic and blues: five notes you can't get wrong"
summary: >-
  Drop two notes from the scale and every clash disappears. Roll random
  phrases over a drone and hear why the box is where phrasing gets learned.
category: fundamentals
lead: >-
  [[the-major-scale|The major scale]] gives you seven notes and a warning:
  some of them lean, and a leaning note held at the wrong moment sounds like
  a mistake. The [[pentatonic]] scale is what you get when you remove the
  warning. Drop the two leaning notes and five remain, and among those five
  there is no wrong choice, only better and worse timing. That safety is not
  a limitation. It is the whole point, and it is why generations of
  improvisers were handed this box first.
mountain: >-
  The blues is not a scale. It is an American musical language with a
  century of recordings, its own forms, its own vocal tradition, and
  techniques (bends, slides, call and response) that live between the
  piano roll's rows, not on them. The six-note "blues scale" on this page
  is a souvenir from that mountain, genuinely useful and genuinely tiny.
  Treat it as a postcard, and go listen to the real thing.
see_also:
  - the-major-scale|The major scale
  - melody|Melody
  - organizing-time|Organizing time
  - pentatonic
  - drone
  - scale
---
## Roll the dice

This demo writes phrases *at random*. A [[drone]] holds the home note
underneath, the dice pick notes from the selected palette, and the only
musicianship in the generator is rhythm: it prefers steps to leaps and it
rests at the end of each phrase. Roll a few. Then, and this is the whole
lesson, switch to **All 12 notes** and roll again:

<div class="demo">
  <div class="demo-label">Live demo: random phrases, safe and unsafe palettes</div>
  <nav class="btn-row" id="palette-picker" aria-label="Palette picker"></nav>
  <div class="btn-row"><button type="button" id="new-phrase">New phrase</button><button type="button" id="pent-play">Play</button></div>
  <p class="demo-blurb" id="pent-readout"></p>
  <canvas class="viz viz-tall" id="pent-canvas"></canvas>
</div>

Random notes from the pentatonic box sound like music. Random notes from
the full twelve sound like someone falling down a staircase. Same dice,
same rhythm, same drone; the only difference is the palette. Whatever
"talent" separates the two, it is not in the player, because there is no
player.

## Why you can't get it wrong

The minor pentatonic on A is A, C, D, E, G: the pattern the engine spells
as gaps of 3, 2, 2, 3, 2 [[semitone|semitones]]. Look at what is missing
from that list: there is no gap of 1. No two notes in the box sit a
semitone apart, and the semitone is where nearly all of harmony's friction
lives. The notes that lean hardest in a [[keys|key]], the ones that demand
resolution, always lean by a semitone; remove every semitone and nothing
leans, so nothing is ever caught leaning at the wrong time. Every note in
the box is a consonant or gently colorful distance from the drone and from
its neighbors. The floor is padded.

That is also the honest cost. Nothing leans, so nothing *pulls*: you give
up the tension-and-release machinery that drives progressions. The
pentatonic is a sandbox, not a home. But sandboxes are where technique
gets built.

## The one dangerous note

The blues scale is the same five notes plus one outsider: the flat five
(Eb against A), parked a semitone from two of its neighbors on purpose.
It is the exception that proves the design: pass through it on the way
somewhere and it drips attitude; let the dice sit on it and it stings.
One added note reintroduces exactly the friction the pentatonic removed,
in a controlled dose, and learning to handle it is the first taste of
handling the full scale's leaning notes.

## The box is a classroom

Here is the personal part. I learned what phrasing *means* inside these
boxes, on a guitar neck, where the pentatonic lives under your hand as a
literal shape: five frets' worth of safety you never have to leave. Only
after the boxes came the big assignment (every mode, up and down the whole
neck, and then which modes speak over which chords), but the boxes came
first, and now I understand why. With pitch made safe, the only thing left
to practice is time: when to start a line, when to end it, how long to
hold, when to say nothing. The dice in the demo already know the two
habits that matter most, resting between phrases and letting the last
note ring, and if you noticed that the *gaps* are what make the random
phrases sound intentional, you have just discovered phrasing. It gets its
own article on this trail, and slicing time is the deep story of
[[organizing-time|Organizing time]].

On the piano roll the box is not a hand shape; it is five rows you never
leave. Draw the A minor pentatonic rows across two octaves in a Live clip,
delete everything else, and you are holding the same classroom your
guitarist friends grew up in.

## In your music

Live will hand you the box directly: set the clip's scale to A minor
pentatonic and turn on Fold, and the piano roll shows only the five safe
rows. Sketch [[melody|melodies]] there when the blank grid is
paralyzing; you can always earn the other notes back later, one lean at a
time. And when a line refuses to work, try the pentatonic test in
reverse: if it sounds fine over the drone but dies over your chords, the
problem is usually a leaning note landing on the wrong moment, which is
to say the problem is not the note, it is the timing. The box teaches you
to hear the difference, which is the skill everything after this article
is built on.

<script src="/assets/pentatonic.js"></script>
