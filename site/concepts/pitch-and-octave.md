---
title: Pitch and octave
heading: "Pitch and the octave: the ear's equals sign"
summary: >-
  Double any frequency and you land on the same note, higher. Hear the
  octave melt into one sound, then bend it and hear it argue.
category: math and acoustics
lead: >-
  Double any frequency, 110 to 220, 220 to 440, and you land on a note that
  feels like the one you left, only higher. Not a similar note: the same
  note, somehow, in a higher voice. That doubling distance is the
  [[octave]], the closest thing hearing has to an equals sign, and it is
  why music needs only twelve note names instead of a new one for every
  [[pitch]].
see_also:
  - what-is-a-note|What is a note
  - octave
  - register
  - parallel octaves
  - counterpoint
  - math|The math behind music
---
## Hear it disappear

Press **Hear it**, get used to the single note, then click **Add the
octave**. Listen for the moment the second note stops being a second note.
It doesn't sit next to the first one; it disappears into it, and what's
left is one sound with more light in it. Then click **Almost an octave**
and hear the same trick fail:

<div class="demo">
  <div class="demo-label">Live demo: one note, then its double</div>
  <nav class="btn-row" id="mode-picker" aria-label="Mode picker"></nav>
  <div class="btn-row"><input type="range" id="base-slider" min="0" max="1000" value="333" aria-label="Base frequency"><button type="button" id="hear-btn">Hear it</button></div>
  <p class="demo-blurb" id="octave-readout"></p>
  <canvas class="viz" id="octave-canvas"></canvas>
</div>

Switch between the two modes while the sound is playing. Exactly double
melts together; almost double churns and rubs. Your ear is drawing a hard
line between those two, and it is drawing it at the number 2.

## The same note, higher

Because doubling sounds like sameness, every doubling of a frequency gets
the same name. 55 Hz, 110, 220, 440, 880: all of them are called A. What
changes is [[register]], how high or low the note sits, and that is what
the number after the letter counts: A1, A2, A3 are the same A in different
registers, each one octave apart.

This is why the piano roll looks the way it does. The twelve note names
wrap around at every octave, so the rows repeat in the same striped
pattern all the way up. Twelve rows up from any note is always the same
letter, one octave higher. Learn one octave of the piano roll and you have
learned all of it.

## Why doubling disappears

Look at the two waves in the demo while the octave plays. The fast wave
fits exactly twice inside every cycle of the slow one, so the pair repeats
in perfect lockstep, over and over, forever. Nothing drifts, nothing rubs,
and your ear reads that steadiness as one sound. At almost-double the fit
is broken: the waves slide against each other, the sum keeps changing
shape, and you hear the disagreement. The deeper arithmetic of which
ratios fuse and which rub is in [[math|The math behind music]].

There is a second reason doubling sounds built-in, and it is a preview of
a future article: a real-world note is never just one frequency. A string
or a voice quietly contains its own double inside it, so the octave is a
note your ear has already been hearing all along (that story is called
harmonics).

## In your music

The octave is the first [[interval]] worth knowing by name, and the most
practical one. Copy a bassline twelve semitones up and you have octave
doubling: the sound gets thicker and brighter but the harmony does not
change at all, because you added the "same notes." Producers reach for
this constantly, and it works for exactly the reason the demo showed.

The same fusion has a sharp edge, though. Two melodies locked an octave
apart stop being two melodies; they collapse into one thick line. That is
why [[parallel octaves]] are the classic warning in [[counterpoint]], and
why the Theory Aide extension flags them in your Live set: not because a
rule says so, but because the octave's sameness quietly deletes one of
your voices.

<script src="/assets/octave.js"></script>
