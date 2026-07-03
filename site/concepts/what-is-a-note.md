---
title: What is a note
heading: What is a note?
summary: >-
  A note is a number: how many times per second the air moves. Dial a
  frequency, watch the wave, and hear it.
category: math and acoustics
lead: >-
  Play a note on anything, a synth, a guitar, your own voice, and somewhere a
  surface is pushing the air back and forth very fast. Push it back and forth
  220 times in one second and you hear one particular [[pitch]]. A note is a
  number: how many times per second the air moves. Everything else in music
  theory is built on top of that number.
see_also:
  - math|The math behind music
  - frequency
  - pitch
  - register
---
## Dial a note

Turn your volume down a touch, then drag the slider and press **Hear it**.
The green line is the air pressure at your ear, slowed about 100 times so
your eye can follow what your ear is doing:

<div class="demo">
  <div class="demo-label">Live demo: one note, as moving air</div>
  <div class="btn-row"><input type="range" id="freq-slider" min="0" max="1000" value="500" aria-label="Frequency"><button type="button" id="hear-btn">Hear it</button></div>
  <p class="demo-blurb" id="freq-readout"></p>
  <canvas class="viz" id="note-canvas"></canvas>
</div>

Drag right and two things happen together: the wave squeezes tighter, and the
sound gets higher. That is the entire relationship. **Faster is higher.**
There is nothing else hiding underneath; a "high" note is just air moving
back and forth more times per second than a "low" one.

## Naming the number

You have heard it, so now you can name it. The number of back-and-forths per
second is called [[frequency]]. Its unit is [[hertz]] (Hz): 220 Hz means 220
back-and-forths every second. [[pitch]] is the musical word for how high or
low a frequency sounds. The slider runs from 55 Hz, where basslines live, to
880 Hz, where leads and vocals sit.

The demo names a "nearest note" because the slider is smooth and notes are
not. Every frequency between 55 and 880 exists, and you can play any of
them; 236.4 Hz is a perfectly real sound. A note is simply a frequency that
got picked: one of a small set we all agreed on, so that instruments can
play together. Which frequencies got picked, and why there are twelve per
[[octave]], is its own story (the short version is in
[[math|The math behind music]]).

Before you leave the slider, try this: park it at 110, then 220, then 440,
then 880. Each doubling lands on a note that feels like the same note, only
higher, and every one of them is named A. That doubling distance is called
an [[octave]], and why doubling works that way is the next article on this
trail.

## In your music

Every note in a Live clip is one of these numbers wearing a name badge.
A row in the piano roll is a frequency; the note called A2 is the air
moving 220 times a second, whatever instrument plays it. When this site or
the Theory Aide extension talks about intervals, chords, or keys, it is
doing arithmetic on exactly these numbers, and nothing more mysterious than
that is ever going on.

<script src="/assets/note.js"></script>
