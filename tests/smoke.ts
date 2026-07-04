// Smoke tests for the theory engine. Run with: npx tsx tests/smoke.ts
// Golden values follow the chordgen-m4l / Composition Aide conventions.

import { Chord, Scale, keyUsesFlats, recognizeChord, noteName } from "../src/theory/core.js";
import { inferKey, romanForChord, harmonicFunction, detectProgressions, type RomanLabel } from "../src/theory/analyzer.js";
import { analyzeTimeline, type TimedNote } from "../src/theory/timeline.js";
import { buildCompositionDimensionsData } from "../src/theory/dimensions.js";
import { buildGuidedNextMoveData } from "../src/theory/nextMoves.js";
import { buildRhythmPhrasingData } from "../src/theory/rhythm.js";
import { buildVoicingData } from "../src/theory/voicing.js";
import { buildArrangementFormData } from "../src/theory/form.js";
import { buildTimbreTextureData } from "../src/theory/timbre.js";
import { buildCompositionMapData } from "../src/theory/map.js";

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
check("recognize Cadd9",
    recognizeChord([60, 64, 67, 74], 1)[0]?.chord.name, "Cadd9");
check("recognize Dm11",
    recognizeChord([50, 53, 57, 60, 64, 67], 1)[0]?.chord.name, "Dm11");
check("recognize G13",
    recognizeChord([55, 59, 62, 65, 69, 76], 1)[0]?.chord.name, "G13");
check("recognize G7sus4",
    recognizeChord([55, 60, 62, 65], 1)[0]?.chord.name, "G7sus4");

// ── Key inference ────────────────────────────────────────────────────

const IVViIV = [new Chord(0, "major"), new Chord(7, "major"),
                new Chord(9, "minor"), new Chord(5, "major")];
check("infer C major from I-V-vi-IV", inferKey(IVViIV, 1)[0]?.label, "C major");

const am = [new Chord(9, "minor"), new Chord(2, "minor"),
            new Chord(4, "major"), new Chord(9, "minor")];
check("infer A minor from i-iv-V-i", inferKey(am, 1)[0]?.label, "A minor");

// ── Enharmonic spelling ──────────────────────────────────────────────

check("D minor spells with flats", keyUsesFlats(2, "natural_minor"), true);
check("A major spells with sharps", keyUsesFlats(9, "major"), false);
check("G dorian spells with flats (signature of F major)",
    keyUsesFlats(7, "dorian"), true);
check("D dorian spells plain (signature of C major)",
    keyUsesFlats(2, "dorian"), false);
check("pc 8 minor spells sharp (G# minor, five sharps, not Ab minor)",
    keyUsesFlats(8, "natural_minor"), false);
check("Bb chord name under flat spelling",
    new Chord(10, "major").getName(true), "Bb");

const bbm = [new Chord(10, "minor"), new Chord(3, "minor"),
             new Chord(5, "major"), new Chord(10, "minor")];
check("infer Bb minor (not A#) from i-iv-V-i", inferKey(bbm, 1)[0]?.label, "Bb minor");

const fMaj = [new Chord(5, "major"), new Chord(10, "major"),
              new Chord(0, "major"), new Chord(5, "major")];
check("infer F major with flat spelling from I-IV-V-I",
    inferKey(fMaj, 1)[0]?.label, "F major");

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

function r(label: string): RomanLabel {
    return { label, borrowed: label.startsWith("b"), secondary: label.includes("/") };
}
check("detect ii-V-I", detectProgressions([r("ii7"), r("V7"), r("I")]).map(p => p.pattern), ["ii-V-I"]);
check("detect I-V-vi-IV", detectProgressions([r("I"), r("V"), r("vi"), r("IV")]).map(p => p.pattern), ["I-V-vi-IV"]);
check("detect I-vi-IV-V", detectProgressions([r("I"), r("vi"), r("IV"), r("V")]).map(p => p.pattern), ["I-vi-IV-V"]);
check("detect vi-IV-I-V", detectProgressions([r("vi"), r("IV"), r("I"), r("V")]).map(p => p.pattern), ["vi-IV-I-V"]);
check("detect i-bVII-bVI", detectProgressions([r("i"), r("bVII"), r("bVI")]).map(p => p.pattern), ["i-bVII-bVI"]);
check("detect I-IV-V", detectProgressions([r("I"), r("IV"), r("V")]).map(p => p.pattern), ["I-IV-V"]);
check("detect authentic cadence", detectProgressions([r("V7"), r("I")]).map(p => p.pattern), ["V-I"]);
check("detect plagal cadence", detectProgressions([r("IV"), r("I")]).map(p => p.pattern), ["IV-I"]);

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
check("timeline progression labels", tl.progressions.map(p => p.pattern), ["I-IV-V"]);
check("range comparison labels",
    [tl.rangeComparison?.first.label, tl.rangeComparison?.second.label],
    ["Range A", "Range B"]);
check("range comparison chord groups",
    [tl.rangeComparison?.first.chordNames, tl.rangeComparison?.second.chordNames],
    [["C", "F"], ["G", "C"]]);
check("range comparison implied keys",
    [tl.rangeComparison?.first.impliedKey, tl.rangeComparison?.second.impliedKey],
    ["C major", "C major"]);
check("range comparison main functions",
    [tl.rangeComparison?.first.mainFunction, tl.rangeComparison?.second.mainFunction],
    ["mixed", "mixed"]);
check("range comparison warning count", tl.rangeComparison?.first.hardWarningCount, 1);
const fSeg = tl.segments[1];
check("clash detected on F segment", fSeg?.outliers.map(o => o.name), ["F#"]);
check("clash attributed to Bass", fSeg?.outliers[0]?.tracks, ["Bass"]);
const cSeg = tl.segments[0];
check("no clash on C segment", cSeg?.outliers.length, 0);
check("tracks captured", tl.trackNames.sort(), ["Bass", "Keys"]);
check("hard clash classified", fSeg?.outliers[0]?.kind, "hard_clash");
check("hard clash explanation", fSeg?.outliers[0]?.severity, "warn");
check("clash segment has higher tension", (fSeg?.tension ?? 0) > (cSeg?.tension ?? 0), true);

// Live-key override: same notes, analyzed under Live's A minor.
const aMinor = new Scale(9, "natural_minor");
const tl2 = analyzeTimeline(notes, 0, 8, {
    liveKey: { root: 9, scale: aMinor, label: "A Minor" },
});
check("live key used", tl2.key.source, "live");
// C, F, G are the diatonic III, VI, VII of A natural minor.
check("romans relative to A minor", tl2.segments.map(s => s.roman?.label),
    ["III", "VI", "VII", "III"]);

const cMajorLive = { root: 0, scale: cMajor, label: "C major" };
const borrowedFlatInC = analyzeTimeline([
    n(63, 0, 1, "Keys"), n(67, 0, 1, "Keys"), n(70, 0, 1, "Keys"),
], 0, 1, { liveKey: cMajorLive });
check("borrowed flat chord spelling", borrowedFlatInC.segments[0]?.chordName, "Eb");
check("borrowed flat chord tones", borrowedFlatInC.segments[0]?.chordToneNames, ["Eb", "G", "Bb"]);
check("borrowed flat roman", borrowedFlatInC.segments[0]?.roman,
    { label: "bIII", borrowed: true, secondary: false });

const d7InC = analyzeTimeline([
    n(50, 0, 2, "Keys"), n(54, 0, 2, "Keys"), n(57, 0, 2, "Keys"), n(60, 0, 2, "Keys"),
], 0, 2, { liveKey: cMajorLive });
check("outside-key chord tone classified",
    d7InC.segments[0]?.outliers.map(o => [o.name, o.kind, o.severity]),
    [["F#", "chord_tone_outside_key", "info"]]);
check("secondary dominant resolution suggested",
    d7InC.resolutionSuggestions.map(s => [s.label, s.targetRoman, s.targetChord]),
    [["D7 -> G", "V", "G"]]);

const cWithPassingTone = analyzeTimeline([
    n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(67, 0, 1, "Keys"), n(61, 0.1, 0.15, "Lead"),
], 0, 1, { liveKey: cMajorLive });
check("passing tone classified",
    cWithPassingTone.segments[0]?.outliers.map(o => [o.name, o.kind, o.severity]),
    [["C#", "passing_tone", "info"]]);

const cWithWeakAdd9 = analyzeTimeline([
    n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(67, 0, 1, "Keys"), n(74, 0.1, 0.15, "Lead"),
], 0, 1, { liveKey: cMajorLive });
check("weak add9 does not overlabel triad", cWithWeakAdd9.segments[0]?.chordName, "C");

const cWithStrongAdd9 = analyzeTimeline([
    n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(67, 0, 1, "Keys"), n(74, 0, 1, "Lead"),
], 0, 1, { liveKey: cMajorLive });
check("strong add9 labels chord color", cWithStrongAdd9.segments[0]?.chordName, "Cadd9");

const gInC = analyzeTimeline([
    n(55, 0, 2, "Keys"), n(59, 0, 2, "Keys"), n(62, 0, 2, "Keys"),
], 0, 2, { liveKey: cMajorLive });
check("dominant ending resolution suggested",
    gInC.resolutionSuggestions.map(s => [s.label, s.targetRoman, s.targetChord]),
    [["G -> C", "I", "C"]]);

const cLydianColor = analyzeTimeline([
    n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(67, 0, 1, "Keys"), n(66, 0, 1, "Lead"),
], 0, 1, { liveKey: cMajorLive });
check("lydian color detected", cLydianColor.modalColors.map(m => [m.mode, m.note]), [["lydian", "F#"]]);

const cMixolydianColor = analyzeTimeline([
    n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(67, 0, 1, "Keys"), n(70, 0, 1, "Lead"),
], 0, 1, { liveKey: cMajorLive });
check("mixolydian color detected", cMixolydianColor.modalColors.map(m => [m.mode, m.note]), [["mixolydian", "Bb"]]);

const aMinorLive = { root: 9, scale: aMinor, label: "A minor" };
const aDorianColor = analyzeTimeline([
    n(57, 0, 1, "Keys"), n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(66, 0, 1, "Lead"),
], 0, 1, { liveKey: aMinorLive });
check("dorian color detected", aDorianColor.modalColors.map(m => [m.mode, m.note]), [["dorian", "F#"]]);

const aPhrygianColor = analyzeTimeline([
    n(57, 0, 1, "Keys"), n(60, 0, 1, "Keys"), n(64, 0, 1, "Keys"), n(58, 0, 1, "Lead"),
], 0, 1, { liveKey: aMinorLive });
check("phrygian color detected", aPhrygianColor.modalColors.map(m => [m.mode, m.note]), [["phrygian", "Bb"]]);

check("textSummary contains key", tl.textSummary.includes("Key:   C major (inferred)"), true);
check("textSummary contains chord progression", tl.textSummary.includes("C -> F -> G -> C"), true);
check("textSummary contains matched pattern", tl.textSummary.includes("I-IV-V"), true);

const dimensions = buildCompositionDimensionsData(tl, notes);
check("dimensions primary change", dimensions.primaryChange, "harmony");
check("dimensions card count", dimensions.dimensions.length, 4);
check("dimensions include vertical card",
    dimensions.dimensions.find(card => card.id === "vertical")?.title, "Vertical Axis");
check("dimensions use musical vertical headline",
    dimensions.dimensions.find(card => card.id === "vertical")?.headline.includes("harmonic colors"), true);
check("dimensions summarize static velocity",
    dimensions.dimensions.find(card => card.id === "spectral")?.observations.includes("Static velocity at 100."), true);

const nextMoves = buildGuidedNextMoveData(tl, notes, "Smoke clip");
check("next moves analyze clip", nextMoves.analyzed, true);
check("next moves material choices",
    nextMoves.plans.map(plan => plan.id),
    ["progression", "melody", "bassline", "rhythm", "texture", "full_clip"]);
check("next moves progression prompts",
    (nextMoves.plans.find(plan => plan.id === "progression")?.prompts.length ?? 0) >= 3, true);

const rhythmNotes: TimedNote[] = [
    n(60, 0, 0.25, "Lead"), n(62, 0.5, 0.75, "Lead"), n(64, 1, 1.25, "Lead"), n(65, 1.5, 1.75, "Lead"),
    n(67, 2, 2.25, "Lead"), n(69, 2.5, 2.75, "Lead"), n(71, 3, 3.25, "Lead"), n(72, 3.5, 3.75, "Lead"),
    n(60, 4, 4.25, "Lead"), n(62, 4.5, 4.75, "Lead"), n(64, 5, 5.25, "Lead"), n(65, 5.5, 5.75, "Lead"),
    n(67, 6, 6.25, "Lead"), n(69, 6.5, 6.75, "Lead"), n(71, 7, 7.25, "Lead"), n(72, 7.5, 7.75, "Lead"),
];
const rhythm = buildRhythmPhrasingData(rhythmNotes, 0, 8, "Rhythm smoke");
check("rhythm subdivision",
    rhythm.metrics.find(metric => metric.label === "Subdivision")?.value, "Eighth note subdivision");
check("rhythm phrase finding",
    rhythm.findings.some(finding => finding.label === "Two bar phrase"), true);
check("rhythm repeated shape",
    rhythm.findings.some(finding => finding.label === "Repeated rhythm shape"), true);
check("rhythm suggestions include delayed answer",
    rhythm.suggestions.some(suggestion => suggestion.label === "Delay the answer"), true);

const voicingNotes: TimedNote[] = [
    n(36, 0, 2, "Keys"), n(40, 0, 2, "Keys"), n(43, 0, 2, "Keys"),
    n(60, 0, 2, "Keys"), n(64, 0, 2, "Keys"), n(67, 0, 2, "Keys"),
];
const voicing = buildVoicingData(voicingNotes, 0, 2, "Voicing smoke");
check("voicing flags low mud",
    voicing.findings.some(finding => finding.label === "Muddy Low Register Cluster"), true);
check("voicing suggests simpler bass",
    voicing.suggestions.some(suggestion => suggestion.includes("single root")), true);

const form = buildArrangementFormData(tl, notes);
check("form includes templates", form.templates.length, 8);
check("form comparison includes tension",
    form.comparison.some(item => item.label === "Tension"), true);

const timbre = buildTimbreTextureData(voicingNotes, 0, 2, "Timbre smoke");
check("timbre bands", timbre.bands.map(band => band.label), ["Bass", "Low Mid", "Mid And Presence", "High Air"]);
check("timbre suggestions include filter",
    timbre.suggestions.some(suggestion => suggestion.includes("filter")), true);

const map = buildCompositionMapData(tl, notes, "Map smoke");
check("map density blocks", map.density.length > 0, true);
check("map rhythm hits", map.rhythmHits.length > 0, true);
check("map progression nodes", map.progression.map(node => node.label), ["C", "F", "G", "C"]);
check("map pitch range", [map.lowPitch, map.highPitch], [36, 74]);
check("map voicing profile", map.voicingProfile.length > 0, true);
check("map motion profile", map.motionProfile.length > 0, true);

console.log(failures ? `\n${failures} failure(s)` : "\nall ok");
process.exit(failures ? 1 : 0);
