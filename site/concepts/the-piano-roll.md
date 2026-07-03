---
title: The piano roll
heading: The piano roll is a map
summary: >-
  Pitch up, time across, length is duration. Live's grid is real notation,
  and you can already read it.
category: fundamentals
lead: >-
  If you make music in Ableton, you already read music. The piano roll is a
  map with two directions: higher on the screen is higher in [[pitch]], and
  further right is later in time. Every melody, chord, and bassline you have
  ever drawn into a clip is written in that notation. This article just makes
  the reading conscious.
see_also:
  - what-is-a-note|What is a note
  - pitch-and-octave|Pitch and the octave
  - octave
  - register
  - interval
---
## A map you can play

Here is a one-bar piano roll with a small melody in it. Press **Play** and
watch the line sweep left to right; every note it crosses, you hear. Then
click any square to add a note, or click an existing note to remove it, and
listen to what your edit did:

<div class="demo">
  <div class="demo-label">Live demo: a playable one-bar piano roll</div>
  <div class="btn-row"><button type="button" id="roll-play">Play</button></div>
  <p class="demo-blurb">Click the grid to add and remove notes. Edits take effect on the next pass of the loop.</p>
  <canvas class="viz" id="roll-canvas"></canvas>
</div>

Three things carry all the information: where a note sits vertically, where
it starts horizontally, and how far it stretches. Position is pitch, position
is time, length is duration. There is no fourth secret. That is the entire
notation.

Almost. There is exactly one secret, and it is a good one: zoom in far
enough and even the vertical axis turns out to be time. That story is
[[organizing-time|in the math trail]].

## Up is higher

Each row is one note, and moving up one row moves up one semitone, the
smallest step the piano roll offers. The rows are striped light and dark in
the same pattern as a piano's white and black keys, and the pattern repeats
every twelve rows, because twelve semitones make an [[octave]] and then the
note names start over. Find any C row in the demo: exactly twelve rows up
sits the next C, the same note one octave higher, just as
[[pitch-and-octave|the octave article]] promised. Where a melody sits on
this ladder overall is its [[register]]; the distance between any two of
its notes is an [[interval]]. Learn to see one octave of rows and you can
read the whole ladder.

## Across is later

The vertical lines are time. The heavier lines mark [[beat|beats]], the
steady pulse you tap your foot to, numbered 1 to 4 across the top. Four of
them make the [[bar]], the loop you just listened to. The lighter lines
slice each beat into four, which is the grid you snap to when you draw.
Where a note starts against those lines is its rhythm, and that is the
whole story of the horizontal axis. What happens when notes land off the
heavy lines on purpose has a name, and a whole trail of its own.

## In your music

This is not a diagram of notation, it is notation. Everything staff
notation records (pitch, start, duration) the piano roll records too, just
drawn as a grid instead of five lines (reading staff notation, if you ever
want it, is mostly learning how the same map got squashed). When the
Theory Aide extension analyzes your Live set, these grid positions are
literally all it reads: rows become frequencies, columns become beats, and
every chord name, key, and warning it shows you is arithmetic on this map.
You have been writing the language all along; the rest of this site is
about reading what you wrote.

<script src="/assets/roll.js"></script>
