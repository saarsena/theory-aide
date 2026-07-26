---
title: Modes
heading: "Modes: seven homes, one bass"
summary: >-
  Take one set of notes and move the home around it and you get seven
  moods, the modes. The secret is that the mode lives in the bass, not the
  scale.
category: harmony
lead: >-
  You already found the door in [[minor-scales|Minor scales]]: the white
  keys resting on C are major, and the same white keys resting on A are
  minor. Same notes, a moved home. The modes are just the rest of that
  idea. There are seven notes, so there are seven homes, and each one is a
  mode with its own color. But here is the thing twenty years of playing
  them teaches and no chart will: a mode is not a scale you play. It is a
  scale played over a held home, and the home is set by the bass. Whoever
  owns the bass owns the mode.
mountain: >-
  This page is the trailhead of a mountain that takes a lifetime. Modal
  harmony, modal jazz, how each mode wants to be voiced, which chords pin
  it, the modes of the minor scales, the altered and exotic scales beyond
  these seven: each is its own world, learned by living in it. What
  follows is the map to the trail, not the trail.
see_also:
  - minor-scales|Minor scales
  - keys|Keys
  - the-major-scale|The major scale
  - the-circle-of-fifths|The circle of fifths
  - mode
  - drone
  - characteristic note
---
## Move the home, hear the mode

Start in the **Move the home** view and step through the seven buttons. The
notes never change, they are always the white keys. All that moves is the
[[drone]] underneath, the bass, and with it the whole mood. Then switch to
**One root** to hear the modes a different way: the home stays on D while the
one note that colors each mode changes.

<div class="demo">
  <div class="demo-label">Live demo: seven moods from one set of notes</div>
  <nav class="btn-row" id="view-picker" aria-label="View picker"></nav>
  <nav class="btn-row" id="mode-picker" aria-label="Mode picker"></nav>
  <div class="btn-row"><button type="button" id="modes-play">Play</button></div>
  <p class="demo-blurb" id="modes-readout"></p>
  <canvas class="viz viz-tall" id="modes-canvas"></canvas>
</div>

## Same notes, seven homes

Here is where the seven come from. Take the seven notes of C major and,
instead of calling C home, call each note home in turn. Each starting point
is a [[mode]]:

- **Ionian** (home on C): the plain major scale.
- **Dorian** (home on D): a minor sound, but brighter than plain minor.
- **Phrygian** (home on E): dark, with a low note leaning on the root.
- **Lydian** (home on F): a floating, dreamy major.
- **Mixolydian** (home on G): a loose, bluesy major.
- **Aeolian** (home on A): plain natural [[minor-scales|minor]], from the
  last article.
- **Locrian** (home on B): the odd one out, which we will come back to.

Every one of those is the exact same seven white keys. Nothing is added, no
note is sharped or flatted. The only thing that changes from one to the next
is which note the music treats as home, and that is enough to change
everything, exactly as it was for major and minor in [[keys|Keys]].

## It's a bass game

So what actually decides the home? The bass. Play the white keys over a held
D and your ear hears everything in relation to D: you are in Dorian. Play the
same white keys over a held G and the same notes reorganize around G: now it
is Mixolydian. Change nothing in your right hand, move only the note
underneath, and the mode changes with it.

This is the whole secret, and it is why the demo works: that drone is the
bass, pinning the home. It is also the trap that takes years to feel. Noodle
"D Dorian" with no bass holding D, and your ear, hunting for the strongest
home, will quietly re-hear the whole thing as plain C major, because C major
is what those notes are when nothing pins them elsewhere. The mode only
exists while the home is held. Lose the pin and the color evaporates.

You do not play a mode. You play over one. Set the bass first.

## One root, one note

Deriving the modes from the major scale shows where they come from, but it is
not how you *use* them. For that, flip it around: keep the home fixed and ask
what single note makes each mode different from plain major or minor. Almost
always, it is exactly one note, its [[characteristic note]]. Against a held
D:

- **Dorian** is minor with a **natural 6th**. That one raised note turns the
  sadness of minor into something hopeful and open. It is the sound of modal
  jazz and endless funk vamps, and it is the gateway mode.
- **Mixolydian** is major with a **flat 7th**. Losing the [[leading tone]]
  robs major of its strong pull home, leaving a bright but unresolved sound:
  the dominant, the blues, rock and roll.
- **Lydian** is major with a **sharp 4th**. That lifted fourth floats free of
  home; the mode sounds weightless and full of wonder, which is why film
  scores reach for it.
- **Phrygian** is minor with a **flat 2nd**, a half step sitting right on top
  of the root. It leans in dark and tense, the sound your ear files under
  Spanish guitar and metal.

Ionian and Aeolian are just the two poles you already know, major and minor.
The four above are the workhorses, the modes worth living with.

One hard-won note on using them: the characteristic note *is* the mode, but
lean on it too hard and you sound like you are practicing scales. The craft
is placing it, letting it land at the right moment, not spamming it. That
part only comes from playing.

## Locrian, the oddball

That leaves Locrian, and it earns its own story. Build a mode on the seventh
degree (home on B in the white keys) and something breaks. The fifth above
its home is not a perfect fifth but a **tritone**, so the chord you would
build on home is diminished: unstable by construction. There is no solid
fifth for the bass to sit on, which you can hear in the demo, the drone
simply refuses to settle.

That is why almost no music is written in Locrian: a home you cannot rest on
is barely a home. But the reason it fails is fascinating, and it is the door
to the genuinely strange scales, the ones that break the tidy picture of
seven homes entirely. That is the next article.

## In your music

The practical order is the reverse of how modes are usually taught. Do not
start from the scale. Start from the bass: hold a note, or loop a one-chord
vamp, so the home is unmistakable. Then color over it with the mode's notes,
and place the characteristic note where it counts. A held D and a natural 6th
is Dorian whether or not you ever call it that.

And do not treat modes as exotic. They are major and minor with a single note
moved, and you have been hearing them your whole life, in folk tunes, in
film scores, in every funk record and half the rock ones. The names are new.
The sounds are old friends.

<script src="/assets/modesdemo.js"></script>
