// Curated note examples for the teaching site. Each one is a small,
// deliberate two-voice passage designed to trigger a specific engine
// finding, so the reader sees the concept and the analysis side by side.
// Every claim in a blurb was verified against the engine before it was
// written (motion counts and flags checked, not assumed).
//
// Pitches use MIDI numbers with Ableton's convention (middle C = C3 = 60),
// matching how the extension labels notes. All examples are 4 bars:
// 8 notes per voice, 2 beats each.

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
function line(track: string, pitches: number[], dur = 2, start = 0): TimedNote[] {
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
            "For the first two bars the lead is locked a fifth above the bass, " +
            "marching up in step with it, and the two lines fuse into one thick " +
            "line. Then the lead breaks free and moves its own way. Play it and " +
            "listen for the moment the music becomes two voices. The checker " +
            "flags all four locked moves as parallel fifths and finds nothing " +
            "to flag in the free half.",
        rangeStart: 0,
        rangeEnd: 16,
        notes: [
            ...line("Bass", [48, 50, 52, 53, 55, 52, 50, 48]),
            ...line("Lead", [55, 57, 59, 60, 62, 64, 65, 64]),
        ],
    },
    {
        id: "contrary-motion",
        title: "Contrary motion, clean",
        blurb:
            "Two mirrored arches: the lead climbs while the bass walks down, " +
            "then both turn around. The bass is walking that lead like a bitch. " +
            "Woop! Each line is unmistakably its own melody. This is contrary " +
            "motion, the strongest and most independent way two lines can move, " +
            "and the checker finds nothing to flag: no parallels, no hidden " +
            "intervals, motion 100% contrary.",
        rangeStart: 0,
        rangeEnd: 16,
        notes: [
            ...line("Bass", [55, 53, 52, 50, 48, 50, 52, 53]),
            ...line("Lead", [60, 62, 64, 65, 67, 65, 64, 62]),
        ],
    },
    {
        id: "hidden-octave",
        title: "A hidden octave",
        blurb:
            "This one is sneakier, like a ninja. Three bars of perfectly healthy " +
            "motion, and then at the start of bar three both voices leap upward " +
            "at once and land exactly an octave apart. They never moved in " +
            "parallel octaves, yet for that moment the two lines collapse into " +
            "one. That is a hidden octave: the checker flags exactly that one " +
            "landing and nothing else.",
        rangeStart: 0,
        rangeEnd: 16,
        notes: [
            ...line("Bass", [53, 55, 57, 55, 60, 57, 53, 48]),
            ...line("Lead", [62, 64, 62, 64, 72, 71, 69, 65]),
        ],
    },
];
