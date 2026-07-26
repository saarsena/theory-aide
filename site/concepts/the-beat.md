---
title: The beat
heading: "The beat: the pulse your foot finds"
summary: >-
  Identical clicks, evenly spaced, and your body does the rest. Tempo as
  beats per minute, and why 128 BPM feels different from 90.
category: rhythm
lead: >-
  Play almost any piece of music to a room and the feet start agreeing.
  Nobody voted, but everyone lands in the same place: on the [[beat]], the
  steady pulse underneath the surface rhythms. In
  [[pentatonic-and-blues|Pentatonic and blues]] you rolled phrases over a
  drone and the timing did all the work; this page names the clock those
  phrases were leaning on. The beat is not something in the sound so much
  as something your body builds from the sound, which is why it survives
  drum fills, dropped bars, and silence.
mountain: >-
  How a body locks onto a pulse is a research field of its own, called
  entrainment, sitting between psychology, neuroscience, and music theory.
  Justin London's *Hearing in Time* is the standard tour: how fast a pulse
  can go before we regroup it, how slow before it falls apart, and why the
  beat is a thing the listener does rather than a thing the signal
  contains. This page is the footpath; that book is the mountain.
see_also:
  - organizing-time|Organizing time
  - the-piano-roll|The piano roll
  - pentatonic-and-blues|Pentatonic and blues
  - beat
  - tempo
  - bar
references:
  - author: "Leon van Noorden and Dirk Moelants"
    year: 1999
    title: "Resonance in the Perception of Musical Pulse"
    source: "Journal of New Music Research 28(1)"
  - author: "Dirk Moelants"
    year: 2002
    title: "Preferred tempo reconsidered"
    source: "Proceedings of the 7th International Conference on Music Perception and Cognition"
  - author: "Justin London"
    year: 2012
    title: "Hearing in Time: Psychological Aspects of Musical Meter"
    source: "Oxford University Press, 2nd edition"
---
## Find the pulse

Press **Hear it** and let it run for a few seconds. Don't analyze anything.
Just notice what your foot, or your head, or your breath wants to do:

<div class="demo">
  <div class="demo-label">Live demo: the pulse, at your chosen speed</div>
  <div class="btn-row"><button type="button" id="bpm-90">90 BPM</button><button type="button" id="bpm-128">128 BPM</button><input type="range" id="beat-slider" min="40" max="220" value="90" aria-label="Tempo in beats per minute"><button type="button" id="hear-btn">Hear it</button></div>
  <p class="demo-blurb" id="beat-readout"></p>
  <canvas class="viz" id="beat-canvas"></canvas>
</div>

That agreement your body reaches with the clicks is the whole concept. The
beat is the layer of time you can predict: you know when the next click
lands before it lands, which is why you can tap *with* it instead of just
after it. Everything this site will ever say about rhythm is measured
against this pulse.

One more thing to notice: every click in the demo is identical. Nothing in
the sound says "this one is beat one." If you caught yourself counting the
clicks into fours anyway, that was you, not the demo, and that habit gets
its own article ([[meter]]) later on the climb.

## Tempo is a number

How fast the beats come is the [[tempo]], measured in beats per minute:
BPM, the number sitting in the top-left corner of Live. The arithmetic is
as plain as it looks. At 120 BPM there are 120 beats in a minute, so two
per second, so one every half second. Drag the demo's slider and you are
changing exactly one number, the gap between clicks, and nothing else.

If you read [[organizing-time|Organizing time]], you have met this idea
from the other side: the beat is one rung on the ladder of time scales,
the rung around half a second where slices of time are countable,
tappable, and predictable. Tempo is just the exact speed of that rung. And
on [[the-piano-roll]], the beat is what the vertical grid lines are
counting; a [[bar]] is those lines bundled into groups.

## Why 128 feels different from 90

Press the **90 BPM** button, listen for a while, then press **128 BPM**.
Same click, same evenness, one number changed, and yet the two don't feel
like faster and slower versions of one thing. 90 nods; 128 drives.

The going explanation is that your body is not a neutral measuring device.
People asked to tap at whatever speed feels natural cluster around two taps
per second, near 120 BPM, right around walking pace; Leon van Noorden and
Dirk Moelants modeled pulse perception as a resonance centered there, and
Moelants later confirmed the preference across large collections of real
music. So a tempo is never just a number: it is a number compared against
the tempos your body already runs. 90 BPM sits below your walk, with slack
in it, which is why heads nod to it. 128 sits just above, always slightly
ahead of you, which is why it pulls you forward. Genres settle where their
job is easiest: hip-hop's head-nod around 80 to 100, house at 120 to 128,
techno a notch above that.

Push the slider past 160 and something stranger happens: your foot quietly
gives up on the clicks and starts tapping every other one. There are
limits to how fast a pulse can go before listeners regroup it (Justin
London's *Hearing in Time* maps them), and dance music exploits this
deliberately. Drum and bass runs near 174 BPM, but the floor feels it as a
heavy 87: the fast layer shimmers on top while the felt beat walks
underneath. One signal, two speeds, and your body picks the one it can
inhabit.

## In your music

The beat is the one thing in your project that exists before any note
does: Live's tempo field ticks whether or not anything plays. Everything
the extension's Rhythm And Phrasing panel reports, grid alignment,
[[syncopation]], phrase lengths, breath points, is measured against that
pulse, so this article is the ruler all of those readings assume. Two
things to try this week: when a loop feels stiff, before touching a single
note, ride the tempo up and down a few BPM and notice how much feel that
one number owns; and when a track feels frantic, check whether you built
it at a tempo whose *felt* beat is half the number on the screen.

<script src="/assets/beat.js"></script>
