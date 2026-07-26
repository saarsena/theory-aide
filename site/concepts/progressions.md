---
title: Progressions
heading: "Progressions: why some chord orders feel inevitable"
summary: >-
  The same four chords can march or wander, and the difference is the
  ordering. The pull, in plain terms, and where the falling fifth gets its
  gravity.
category: harmony
lead: >-
  [[roman-numerals|Roman numerals]] named the chords a key hands you, and
  [[seventh-chords|Seventh chords]] found the one that pulls. This page is
  about putting them in a row. A [[progression]] is a sequence of chords
  heard as one unit, and here is its secret: the chords are the
  ingredients, but the *order* is the recipe. The same four chords can
  feel like gravity or like a shrug, and the difference is nothing but
  which handoffs you choose.
mountain: >-
  Why chords pull at all is one of music theory's oldest arguments.
  Rameau planted the flag in 1722 with root motion by fifths; Riemann
  rebuilt everything around three functions; modern scholars argue about
  whether pop loops are functional at all or a different animal wearing
  tonal clothes. The next articles on this path (cadences, and later
  harmonic function) walk further in; the full debate is a library, not a
  page.
see_also:
  - roman-numerals|Roman numerals
  - seventh-chords|Seventh chords
  - the-circle-of-fifths|The circle of fifths
  - borrowed-chords|Borrowed chords
  - progression
  - vamp
references:
  - author: "Jean-Philippe Rameau"
    year: 1722
    title: "Traité de l'harmonie réduite à ses principes naturels"
    source: "Ballard, Paris; the founding account of root motion by fifths"
  - author: "The Axis of Awesome"
    year: 2009
    title: "Four Chords"
    source: "live comedy medley demonstrating dozens of hits sharing the I-V-vi-IV loop"
---
## Same chords, different order

Every preset in this demo draws from the same small pool of chords in C
major. Play the **Four chords of pop** first and let it cycle; then try
the other three:

<div class="demo">
  <div class="demo-label">Live demo: one pool of chords, four orderings</div>
  <div class="btn-row"><button type="button" id="prog-axis">Four chords of pop</button><button type="button" id="prog-rotated">Same chords, dark start</button><button type="button" id="prog-schoolbook">Schoolbook</button><button type="button" id="prog-wanderer">Wanderer</button><button type="button" id="prog-play">Play</button></div>
  <p class="demo-blurb" id="prog-blurb"></p>
  <canvas class="viz viz-tall" id="prog-canvas"></canvas>
</div>

The first three feel like they know where they are going. The fourth
uses chords just as legal, just as in-key, and goes nowhere. Nothing is
wrong with iii or ii or vi as chords; what is missing is the handoffs,
and handoffs are the entire craft.

## The pull, in plain terms

Strip away the vocabulary and chords have three jobs. Some feel like
**home** (I above all). Some feel **away**, out of the house but in no
hurry (IV, ii, vi). One feels like **tension**, the held breath that
needs the next chord (V, and V7 more so). A progression that works
visits these jobs in an order that tells a story, and the strongest
handoff in the whole system is the one you heard in
[[seventh-chords|Seventh chords]]: the tension chord falling a fifth
into home, V to I, two magnets snapping shut.

That fall is not special to V. Watch the bass in the demo: the moves
that feel most inevitable are falling fifths, and
[[the-circle-of-fifths|the circle of fifths]] explains why this one
interval keeps winning: a fall of a fifth is one step around the wheel
toward home, so a chain of them, vi to ii to V to I, is your ear
walking downhill the whole way. The wanderer preset is aimless
precisely because it refuses every one of these moves: no tension
chord, no falling fifth, just polite neighbors nodding at each other.
(These three jobs have formal names and colors in the extension, and
they get their own article at the next ring; for now, home, away, and
tension will carry you a long way.)

## Loops and journeys

There are two ways to use the pull. A journey spends it: home, away,
tension, arrival, the schoolbook preset, the shape of hymns and
verses that end. A loop *banks* it: the four-chord pop loop never
resolves its IV back to I with any finality, it just hands off around
the circle forever, which is why it can run for an entire song without
tiring, the same trick the [[borrowed-chords|borrowed]] bVII and the
blues pull off. And a loop has one free parameter a journey lacks:
where you get on. The dark-start preset is the pop loop rotated two
clicks, identical chords, and it reads as melancholy instead of bright
because the ear takes the first chord of a loop as the protagonist. A
one-chord [[vamp]] is the degenerate case: all home, all pull banked,
the modal world from [[modes|Modes]].

What loops defer, journeys must spend, and the moment of spending has
names: the handful of standard ways a progression punctuates its
arrival. Those are cadences, and they are the next article.

## In your music

The extension recognizes the famous orderings by name: run **Explain
Harmony** over the demo's loops and it reports the **four-chord pop
loop**, the **minor-start pop loop**, and the **primary-chord
progression**, while the wanderer returns nothing, exactly as your ear
reported. Two experiments that cost nothing: rotate a loop you already
have, same chords, start on a different one, and you have a genuinely
new-feeling section for free, a pre-chorus hiding inside your chorus;
and when a progression feels aimless, do not add chords, check the
handoffs, one falling fifth in the right place usually fixes what three
new chords cannot.

<script src="/assets/progressions.js"></script>
