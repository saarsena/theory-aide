---
title: Meter
heading: "Meter: how beats bundle into bars"
summary: >-
  Nothing in the clicks says which one is first. You decide, and the accent
  makes your decision public. What 4/4 actually says, and six pulses cut
  two ways.
category: rhythm
lead: >-
  [[the-beat|The beat]] ended with a confession: the demo's clicks were all
  identical, and if you counted them into fours anyway, that was you, not
  the sound. This page is about that habit. Meter is the grouping of beats
  into [[bar]]s, and the strange part is where it lives: not in the signal,
  but in the listener. Music's job is to get a whole room grouping the same
  way at the same time, and the tool it uses is the accent.
mountain: >-
  Meter runs far past the even groupings on this page. Justin London's
  *Hearing in Time* is the deep tour of how listeners build and keep a
  meter, and the world's musics are full of cycles that Western bar lines
  handle awkwardly: Balkan dances counted 2+2+3, Indian talas seven, ten,
  and sixteen beats long, West African timeline patterns that two players
  hear from different starting points. The bar is a habit, not a law.
see_also:
  - the-beat|The beat
  - the-piano-roll|The piano roll
  - organizing-time|Organizing time
  - bar
  - downbeat
  - time signature
references:
  - author: "Thaddeus L. Bolton"
    year: 1894
    title: "Rhythm"
    source: "American Journal of Psychology 6(2)"
  - author: "Justin London"
    year: 2012
    title: "Hearing in Time: Psychological Aspects of Musical Meter"
    source: "Oxford University Press, 2nd edition"
---
## You already grouped them

In 1894 Thaddeus Bolton sat listeners in front of perfectly even, perfectly
identical ticks and asked what they heard. Almost nobody heard what was
there. The ticks bundled themselves into twos, threes, and fours, and the
first tick of each imagined bundle sounded louder, though no tick was
louder than any other. He called it subjective rhythm, and you can run the
experiment on yourself right now:

<div class="demo">
  <div class="demo-label">Live demo: identical clicks, and a suggestion</div>
  <div class="btn-row"><button type="button" id="ill-none">No help</button><button type="button" id="ill-3">Hear it in 3</button><button type="button" id="ill-4">Hear it in 4</button><button type="button" id="ill-hear">Hear it</button></div>
  <p class="demo-blurb" id="ill-blurb"></p>
  <canvas class="viz" id="ill-canvas"></canvas>
</div>

Press **Hear it** with no help selected and count along however you like.
Then click **Hear it in 3** and let the tinted dots lead your counting for
a few bars. Then switch to **Hear it in 4**. The buttons change nothing
but the picture: not one sample of audio is different. Yet each way of
counting feels true while you are inside it, and the first click of every
group you count gains a little imaginary weight. That grouping is the
meter, and so far it is entirely yours.

## The accent makes it public

Private grouping is fine for one listener, but music is usually a group
activity: a band, a dance floor, a room. Everyone needs to land on the
same "one," so music marks it. The marked beat is the [[downbeat]], the
stretch from one downbeat to the next is a [[bar]], and the repeating
group size is the meter. Here is the same pulse with the decision made out
loud:

<div class="demo">
  <div class="demo-label">Live demo: the accent picker</div>
  <div class="btn-row"><button type="button" id="grp-2">In 2</button><button type="button" id="grp-3">In 3</button><button type="button" id="grp-4">In 4</button><button type="button" id="grp-33">3+3</button><button type="button" id="grp-222">2+2+2</button><button type="button" id="grp-hear">Hear it</button></div>
  <p class="demo-blurb" id="grp-readout"></p>
  <canvas class="viz" id="grp-canvas"></canvas>
</div>

In a real track the downbeat is rarely a louder click. It is the kick
landing with the crash, the chord changing, the bass arriving, the whole
arrangement leaning on the same moment. Whatever the means, the message is
the same: count from here.

This is also all a [[time signature]] is saying. The top number of 4/4
answers "how many beats in a bar": four. The bottom number answers "which
grid slice counts as one beat," and in Live's terms it points at the
quarter grid, the [[the-beat|tempo]]-sized division. So 4/4 reads: four
beats per bar, and the beat is the quarter division your BPM is counting.
Three-four is the same sentence with a three in it. The numbers look like
a fraction but they are really a small contract about counting.

## Six pulses, two knives

The pair of buttons at the end of the demo, **3+3** and **2+2+2**, run the
same six quick pulses and differ only in where the accents fall. Cut the
six as 3+3 and you get two big beats per bar, each with a three-pulse
lilt: that is 6/8. Cut them 2+2+2 and you get three big beats per bar:
that is 3/4, a quick waltz. Same pulses, different knife.

Flip between them while the demo plays and notice your body switching
allegiance: swaying in two, then counting in three. Leonard Bernstein
built the hook of "America" from West Side Story on exactly this flip,
alternating the two cuts bar by bar, which is why the tune feels like it
keeps changing its mind mid-stride. Once you can hear this pair apart, no
time signature on the page will scare you: they are all just knives laid
against the same pulse.

## In your music

The time signature field sits right next to the tempo in Live, and the
piano roll has been showing you meter all along: the heavier vertical
lines are downbeats, and everything [[the-piano-roll]] calls a bar is one
sweep of the count you have been reading about. Loop lengths inherit the
habit too: 4-bar and 8-bar loops feel square because they are bundles of
bundles, fours of fours.

The extension trusts Live's meter the same way it trusts Live's key:
everything the Rhythm And Phrasing panel reports, from grid alignment to
phrase lengths measured in bars, is counted against the time signature
you set. Two experiments worth an evening: take a loop that feels square
and re-cut it, either by switching the signature to 6/8 or just by moving
your accents to imply threes over the same pulse; and listen for the
moment a favorite track drops a beat or adds one, because now you will
know exactly what got cut. What lives *between* the beats, the slicing of
each beat into eighths and sixteenths and triplets, is the next stop on
the climb.

<script src="/assets/meter.js"></script>
