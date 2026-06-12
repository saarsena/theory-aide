// Smoke tests for the theory engine. Run with: npx tsx tests/smoke.ts
// Golden values follow the chordgen-m4l / Composition Aide conventions.

import { Chord, Scale, recognizeChord, noteName } from "../src/theory/core.js";
import { inferKey, romanForChord, harmonicFunction } from "../src/theory/analyzer.js";
import { analyzeTimeline, type TimedNote } from "../src/theory/timeline.js";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) {
        console.log(`  ok  ${label}`);
    } else {
        failures++;
        console.error(`FAIL  ${label}\n      expected ${e}\n      actual   ${a}`);
    }
}

// ── Chord recognition ────────────────────────────────────────────────

check("recognize C major triad",
    recognizeChord([60, 64, 67], 1)[0]?.chord.name, "C");
check("recognize G7",
    recognizeChord([55, 59, 62, 65], 1)[0]?.chord.name, "G7");
check("recognize first-inversion C (E bass)",
    recognizeChord([52, 60, 67], 1)[0]?.chord.name, "C/E");
check("recognize Am7 when A is the bass",
    recognizeChord([57, 60, 64, 67], 1)[0]?.chord.name, "Am7");
check("recognize C6 when C is the bass",
    recognizeChord([48, 57, 64, 67], 1)[0]?.chord.name, "C6");

// ── Key inference ────────────────────────────────────────────────────

const IVViIV = [new Chord(0, "major"), new Chord(7, "major"),
                new Chord(9, "minor"), new Chord(5, "major")];
check("infer C major from I-V-vi-IV", inferKey(IVViIV, 1)[0]?.label, "C major");

const am = [new Chord(9, "minor"), new Chord(2, "minor"),
            new Chord(4, "major"), new Chord(9, "minor")];
check("infer A minor from i-iv-V-i", inferKey(am, 1)[0]?.label, "A minor");

// ── Roman numerals ───────────────────────────────────────────────────

const cMajor = new Scale(0, "major");
check("Dm7 in C = ii7", romanForChord(new Chord(2, "minor7"), cMajor).label, "ii7");
check("G7 in C = V7", romanForChord(new Chord(7, "dominant7"), cMajor).label, "V7");
check("Bb in C = borrowed bVII", romanForChord(new Chord(10, "major"), cMajor),
    { label: "bVII", borrowed: true, secondary: false });
check("A7 in C = V7/ii", romanForChord(new Chord(9, "dominant7"), cMajor),
    { label: "V7/ii", borrowed: false, secondary: true });
check("function of F in C", harmonicFunction(new Chord(5, "major"), cMajor), "subdominant");
check("function of G in C", harmonicFunction(new Chord(7, "major"), cMajor), "dominant");

// ── Timeline analysis ────────────────────────────────────────────────

// Two tracks spelling C | F | G | C over 8 beats (2 beats per chord),
// with one clashing F# on the bass track during the F chord.
function n(pitch: number, start: number, end: number, track: string): TimedNote {
    return { pitch, start, end, velocity: 100, track };
}
const notes: TimedNote[] = [
    // Keys track: triads
    n(60, 0, 2, "Keys"), n(64, 0, 2, "Keys"), n(67, 0, 2, "Keys"),
    n(65, 2, 4, "Keys"), n(69, 2, 4, "Keys"), n(72, 2, 4, "Keys"),
    n(67, 4, 6, "Keys"), n(71, 4, 6, "Keys"), n(74, 4, 6, "Keys"),
    n(60, 6, 8, "Keys"), n(64, 6, 8, "Keys"), n(67, 6, 8, "Keys"),
    // Bass track: roots, plus a wrong F# under the F chord
    n(36, 0, 2, "Bass"), n(41, 2, 4, "Bass"), n(42, 3, 4, "Bass"),
    n(43, 4, 6, "Bass"), n(36, 6, 8, "Bass"),
];

const tl = analyzeTimeline(notes, 0, 8);
check("timeline chord sequence", tl.segments.map(s => s.chordName), ["C", "F", "G", "C"]);
check("timeline key", tl.key.label, "C major");
check("timeline romans", tl.segments.map(s => s.roman?.label), ["I", "IV", "V", "I"]);
const fSeg = tl.segments[1];
check("clash detected on F segment", fSeg?.outliers.map(o => o.name), ["F#"]);
check("clash attributed to Bass", fSeg?.outliers[0]?.tracks, ["Bass"]);
const cSeg = tl.segments[0];
check("no clash on C segment", cSeg?.outliers.length, 0);
check("tracks captured", tl.trackNames.sort(), ["Bass", "Keys"]);

// Live-key override: same notes, analyzed under Live's A minor.
const aMinor = new Scale(9, "natural_minor");
const tl2 = analyzeTimeline(notes, 0, 8, {
    liveKey: { root: 9, scale: aMinor, label: "A Minor" },
});
check("live key used", tl2.key.source, "live");
// C, F, G are the diatonic III, VI, VII of A natural minor.
check("romans relative to A minor", tl2.segments.map(s => s.roman?.label),
    ["III", "VI", "VII", "III"]);

console.log(failures ? `\n${failures} failure(s)` : "\nall ok");
process.exit(failures ? 1 : 0);
