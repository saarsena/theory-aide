---
title: Organizing time
heading: Music is the art of organizing time
summary: >-
  Hear a rhythm accelerate until it becomes a pitch, then ride the zoom lens
  from song form all the way down to timbre. It is time slices the whole way.
category: math and acoustics
lead: >-
  Strip everything else away and a piece of music is a stack of decisions
  about when. When the kick lands, when the chord changes, when the section
  turns, when the air moves. Music is the art of organizing slices of time,
  and the strange, beautiful part is that this is true at every zoom level
  at once: the slices just get faster and faster until, at the bottom of the
  ladder, they stop being rhythm and become the notes themselves.
see_also:
  - math|The math behind music
  - the-piano-roll|The piano roll
  - what-is-a-note|What is a note
  - frequency
  - beat
  - tempo
references:
  - author: "Karlheinz Stockhausen"
    year: 1957
    title: "… wie die Zeit vergeht … (…How Time Passes…)"
    source: "die Reihe 3; English translation by Cornelius Cardew in the 1959 English edition"
  - author: "Seth Horvitz"
    year: 2009
    title: "Boundaries of Perception and the Endless Struggle for Unity in the Music of Karlheinz Stockhausen"
    url: "https://www.academia.edu/68677579/Boundaries_of_Perception_and_the_Endless_Struggle_for_Unity_in_the_Music_of_Karlheinz_Stockhausen"
  - author: "Curtis Roads"
    year: 2001
    title: "Microsound"
    source: "MIT Press"
---
## Hear rhythm become pitch

Press **Hear it** with the slider at the left. You get clicks: a rhythm,
something you could tap along to. Now drag right, slowly, and pay attention
to the moment you stop being able to count:

<div class="demo">
  <div class="demo-label">Live demo: the same click, faster and faster</div>
  <div class="btn-row"><input type="range" id="pulse-slider" min="0" max="1000" value="147" aria-label="Clicks per second"><button type="button" id="hear-btn">Hear it</button></div>
  <p class="demo-blurb" id="pulse-readout"></p>
  <canvas class="viz" id="pulse-canvas"></canvas>
</div>

Somewhere around twenty clicks per second something gives. Your ear stops
reporting *events* and starts reporting *a tone*. Keep dragging and the tone
rises like any other note; park at 110 and you are hearing A1, built out of
nothing but the rhythm you were tapping a moment ago.

## The border in your ear

Here is what did not change during that sweep: anything about the click. The
demo plays one recorded click in a loop, and the slider only changes how
often it repeats. The whole difference between rhythm and pitch, in that
demo and in general, is speed.

Below roughly twenty events per second, you experience time slices as
rhythm: countable, tappable, the territory of the [[beat]]. Above it, the
same slices fuse into [[pitch]]. A note is a rhythm too fast to count, and
[[frequency]] in [[hertz]] is just "events per second" wearing a lab coat;
the 220 back-and-forths from [[what-is-a-note|What is a note]] are a drum
roll your ear gave up counting. Composers have known this border is fake
for a while. Stockhausen wrote a whole essay on rhythm and pitch being one
continuum, and then built pieces where one melts into the other.

## The zoom lens

Once you see the border dissolve, the whole of music turns into one ladder
of time scales, and everything this site teaches lives on a rung of it:

- **Form**: slices minutes long. Intro, drop, verse, chorus.
- **Phrases**: slices a few seconds long, the sentences of a melody.
- **Beats and bars**: slices around half a second, set by the [[tempo]].
  This is where the grid lives.
- **Subdivisions**: tenths of a second, where groove and swing happen.
- **Pitch**: slices measured in milliseconds, fused by the ear into notes.
- **Timbre**: structure finer still, the shape inside each single cycle.

Composing, arranging, sequencing, sound design: same job, different zoom.
And look back at [[the-piano-roll]] with this in mind. The horizontal axis
is time you can count. The vertical axis is time too fast to count. The
map's two directions are secretly one direction, drawn at two speeds.

## In your music

If you produce electronic music, you have crossed this border with your own
hands, whether or not anyone said so out loud:

- Take a tempo-synced LFO wobbling a filter at 1/16th notes and sweep its
  rate up into the audible range: the wobble becomes a tone riding your
  sound. That is FM synthesis, and it is the demo above wearing a modular
  patch.
- Shorten a delay below about 50 milliseconds and it stops echoing and
  starts ringing at a pitch. The arithmetic is right on the surface: a 2 ms
  delay repeats 500 times a second, so it rings near B4. One over the delay
  time is the note.
- Granular synthesis is this article made literal: chop time into slices
  and reorganize them. Slow, it's texture; fast, it's tone. (The deep book
  on this ladder is Curtis Roads' *Microsound*, for when you want the whole
  tour.)

For the Max and gen~ people: this is why `phasor~` is the most honest
object in the patcher. It is just a clock. Run it slow, it sequences; run
it fast, it *is* the oscillator. Same ramp, same math, different rung of
the ladder. Time, organized.

<script src="/assets/pulse.js"></script>
