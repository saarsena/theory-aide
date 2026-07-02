// Curated note examples for the teaching site. Each one is a small,
// deliberate two-voice fragment designed to trigger a specific engine
// finding, so the reader sees the concept and the analysis side by side.
//
// Pitches use MIDI numbers with Ableton's convention (middle C = C3 = 60),
// matching how the extension labels notes.

import type { TimedNote } from "../../src/theory/timeline.js";

export interface SiteExample {
    id: string;
    /** Button label in the example picker. */
    title: string;
    /** Teaching copy shown above the live panel. */
    blurb: string;
    rangeStart: number;
    rangeEnd: number;
    notes: TimedNote[];
}

/** One monophonic voice: equal-length notes starting at `start`. */
function line(track: string, pitches: number[], dur = 1, start = 0): TimedNote[] {
    return pitches.map((pitch, i) => ({
        pitch,
        start: start + i * dur,
        end: start + (i + 1) * dur,
        velocity: 96,
        track,
    }));
}

export const EXAMPLES: SiteExample[] = [
    {
        id: "parallel-fifths",
        title: "Parallel fifths, on purpose",
        blurb:
            "Two voices locked a fifth apart, marching up together: C–D–E–F over " +
            "F–G–A–B♭. Every single move is a parallel fifth, the classic " +
            "counterpoint no-no. Listen with your eyes: the two lines never act " +
            "independently, so they fuse into one thick line. The checker flags " +
            "all three moves and reports the motion as 100% parallel.",
        rangeStart: 0,
        rangeEnd: 4,
        notes: [
            ...line("Lead", [60, 62, 64, 65]),
            ...line("Bass", [53, 55, 57, 58]),
        ],
    },
    {
        id: "contrary-motion",
        title: "Contrary motion, clean",
        blurb:
            "The same rising lead line, but now the bass is walking that lead like a bitch. Woop! " +
            "The voices pull apart and each one is clearly its own melody. " +
            "This is contrary motion, the strongest and most independent (and therefore best) way two " +
            "lines can move. The checker finds nothing to flag: no parallels, no " +
            "hidden intervals, motion 100% contrary.",
        rangeStart: 0,
        rangeEnd: 5,
        notes: [
            ...line("Lead", [60, 62, 64, 65, 67]),
            ...line("Bass", [55, 53, 52, 50, 48]),
        ],
    },
    {
        id: "hidden-octave",
        title: "A hidden octave",
        blurb:
            "This one is sneakier, like a ninja. The two voices start out fine, then the first move " +
            "is contrary. But then both voices leap upward at once and land exactly " +
            "an octave apart. They didn't move in parallel octaves, yet the effect " +
            "is similar: two independent lines suddenly collapse into one. That's a " +
            "hidden octave, and the checker catches it even though no rule about " +
            "parallel motion was technically broken.",
        rangeStart: 0,
        rangeEnd: 3,
        notes: [
            ...line("Lead", [62, 64, 72]),
            ...line("Bass", [57, 55, 60]),
        ],
    },
];
