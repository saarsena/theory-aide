---
title: Counterpoint
heading: "Counterpoint: making melodies work together"
summary: >-
  The craft of keeping simultaneous melodies independent, with the actual
  Counterpoint Checker running live in your browser.
category: counterpoint
lead: >-
  Counterpoint is the craft of writing two or more [[voices|voices]] that
  sound good at the same time <em>and</em> each stay a [[melody]] in their
  own right. It is not about following old rules for their own sake. It is
  about independence: when two lines stop being independent, your ear hears
  one thick line instead of two, and the music quietly loses a voice. You
  have spent eleven articles earning the tools to hear that happen. This is
  where they all get used at once.
mountain: >-
  Counterpoint is one of the tallest mountains in music. Fux's species
  method has trained composers for three hundred years, Bach's chorales
  are still the standard corpus for studying it, and the craft branches
  into voice leading, dissonance treatment, imitation, fugue. Everything
  on this page is the view from the gate. The climb, species by species,
  is further along this trail.
see_also:
  - voices|Voices
  - motion-types|Motion types
  - parallel fifths
  - contrary motion
  - voice leading
  - math|The math behind music
references:
  - author: "Johann Joseph Fux"
    year: 1725
    title: "Gradus ad Parnassum"
    source: "English translation, The Study of Counterpoint, trans. Alfred Mann, W. W. Norton"
---
## The one rule that matters most

You already hold the pieces. From [[motion-types|Motion types]]: two voices
can move parallel, similar, oblique, or contrary, ranked by independence.
From [[intervals|Intervals]]: the fifth and the [[octave]] are the "empty"
distances, so acoustically pure they fuse. Put those together and you have
the one rule most counterpoint guidelines boil down to: **don't let two
voices accidentally fuse.** The fastest way to fuse them is [[parallel
fifths]] and [[parallel octaves]], the least independent motion locked at
the most fusible intervals; the surest guard against it is [[contrary
motion]], which no ear can mistake for one line. (Why fifths and octaves in
particular? That's arithmetic. [[math|See the math]].) Everything else,
parallel thirds, oblique pedals, bold leaps answered by steps, is free
material, spent on purpose.

## See it, don't just read it

Below is the actual Counterpoint Checker from the
[Theory Aide extension for Ableton Live](https://github.com/saarsena/theory-aide).
Same code, same analysis engine, running right here in your browser. And
here is what eleven articles bought you: every number in this panel is now
readable. The tracks it compares are [[voices|voices]]; the motion
breakdown is the four types you can hear; the interval distribution is
distances you have tasted. Pick an example and press <strong>Play</strong>
to hear the two voices and watch them on the grid (bass green, lead blue).
Then read the checker's verdict below the roll: the headline first, and
<em>Show details</em> when you want the full breakdown:

<div class="demo">
  <div class="demo-label">Live demo: hear it, see it, then read the analysis</div>
  <nav id="example-picker" aria-label="Example picker"></nav>
  <p id="example-blurb"></p>
  <div class="btn-row"><button type="button" id="example-play">Play</button></div>
  <canvas class="viz viz-tall" id="example-canvas"></canvas>
  <iframe id="panel-frame" title="Counterpoint Checker panel"></iframe>
</div>

## The craft past the rule

Not fusing is the floor, not the art. Above it, counterpoint is a set of
trades made in time: where the voices are allowed to clash (dissonance is
welcome, on schedule), how each line keeps a shape worth following on its
own, how they breathe at different moments so the texture never clots, and
how they land together at a cadence after disagreeing all phrase. The
classical gym for all of this is species counterpoint, five graded
exercises that have built this skill since 1725, and it lives further
along this trail. But the instinct transfers immediately: whenever two of
your lines move at once, you are already doing counterpoint, well or badly.

## In your music, and the end of the trail

The Theory Aide extension runs this exact checker across the tracks of
your Live set: pick the voices, and it reports the motion balance and
every parallel or hidden fifth and octave, with the offending beats named.
You now read that report natively, and better, you know which flags are
real problems (a lead and bass fusing by accident) and which are choices
(a deliberate octave-doubled hook).

And that is Track 1. If you walked here from
[[what-is-a-note|What is a note]], you can now hear a note as moving air,
read the piano roll as notation, taste intervals, build and name triads,
climb the scale, feel where home is, navigate the map of keys, and follow
independent voices through four kinds of motion. That is genuinely
speaking the language. From here the trails fan out: deeper into
counterpoint and voice leading, into the harmony of full progressions,
into rhythm, form, and the mathematics under all of it. Wander wherever
your music points; the spine will hold.

<script src="/assets/main.js"></script>
