---
title: Triads
heading: "Triads: three notes, one mood"
summary: >-
  Stack two thirds and you have a chord. Build all four flavors and let the
  real engine name what you're hearing.
category: harmony
lead: >-
  Play three notes together in the right spacing and something new happens:
  your ear stops hearing three notes and starts hearing one object with a
  mood. That object is a [[chord]], and the smallest, most important kind
  is the [[triad]]: a [[root]], a third, and a fifth, stacked. Almost every
  chord you have ever heard is a triad or a triad wearing accessories.
see_also:
  - intervals|Intervals
  - triad
  - chord
  - root
  - consonance
  - the-piano-roll|The piano roll
---
## Build one

The slider picks the root note; the buttons pick the shape (the numbers are
semitone offsets, exactly the rows you would count on the piano roll). The
name in the readout is not hardcoded: it comes from the same chord
recognizer that reads Ableton Live sets in the Theory Aide extension,
listening to the actual notes you built:

<div class="demo">
  <div class="demo-label">Live demo: stack a triad, the engine names it</div>
  <nav class="btn-row" id="mode-picker" aria-label="Chord shape picker"></nav>
  <div class="btn-row"><input type="range" id="base-slider" min="0" max="1000" value="667" aria-label="Root note"><button type="button" id="hear-btn">Hear it</button></div>
  <p class="demo-blurb" id="triad-readout"></p>
  <canvas class="viz" id="triad-canvas"></canvas>
</div>

Start with **Just the fifth** and really listen: it is solid but blank, a
frame with no picture. Now press **Major**. One added note and suddenly the
sound has a mood. Switch to **Minor** while it plays and feel the single
semitone drop change everything.

## Two thirds, stacked

A triad is two intervals from [[intervals|the last article]] stacked on top
of each other. The bottom note is the [[root]]: the note the chord is built
from and named after. Seven semitones up sits the fifth, the sturdy 3:2
frame. And in between sits the third, the note that decides the mood: four
semitones up (a major third) and the chord is bright; three semitones up
(a minor third) and it shades over. On the piano roll a triad is just three
rows: root, root plus 3 or 4, root plus 7. That one-row difference in the
middle is the entire distance between happy and sad, which may be the
highest ratio of meaning to semitones anywhere in music.

## The four flavors

Move the third and the fifth around and there are exactly four triads:

- **Major (0·4·7)**: bright, settled, home. The major third from the
  interval demo, now with a frame around it.
- **Minor (0·3·7)**: the same frame, the third lowered one row. Shaded,
  serious, not "sad" so much as deeper in the picture.
- **Diminished (0·3·6)**: the fifth shrinks too, and the frame itself goes
  unstable. A diminished chord leans hard toward somewhere else; it is
  tension wearing a chord costume.
- **Augmented (0·4·8)**: the fifth stretches instead. Dreamlike, symmetric,
  unresolved; the rarest of the four in the wild, and instantly
  recognizable once you've tasted it.

Major and minor carry nearly all popular music between them; diminished and
augmented are the spices you reach for on purpose.

## In your music

Draw any three-note stack into a Live clip and you have done everything
this article describes; the piano roll makes triads visible as their row
pattern. When the Theory Aide extension explains a clip or spells your
arrangement's harmony beat by beat, the code doing the naming is the exact
code in the demo above, unmodified: it measures the intervals in the stack
and recognizes the flavor. Which triads a key gives you for free, and why
they come out major in some slots and minor in others, is the next article
on the harmony trail, and it is where chords stop being objects and start
being a language.

<script src="/assets/triads.js"></script>
