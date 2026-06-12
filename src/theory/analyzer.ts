// Key inference and Roman-numeral labelling, ported from Composition
// Aide's analyzer.py (scale-membership scoring — deliberately transparent
// so the UI can show *why* a key won).

import { ROMAN, PARALLEL_MODE } from "./data.js";
import { Chord, Scale, buildDiatonicChords, mod12, noteName } from "./core.js";

// Candidate keys: 12 majors + 12 natural minors. More modes tend to tie
// with a parent major and confuse the result more than they help.
const CANDIDATE_KEYS: Array<[number, string]> = [
    ...Array.from({ length: 12 }, (_, pc) => [pc, "major"] as [number, string]),
    ...Array.from({ length: 12 }, (_, pc) => [pc, "natural_minor"] as [number, string]),
];

export interface KeyCandidate {
    root: number;
    scaleName: string;
    score: number;
    diatonicCount: number;
    totalChords: number;
    label: string;
}

export function keyLabel(root: number, scaleName: string, useFlats = false): string {
    const suffix = scaleName === "natural_minor"
        ? " minor"
        : ` ${scaleName.replace(/_/g, " ")}`;
    return `${noteName(root, useFlats)}${suffix}`;
}

/** 1.0 if every pitch class of the chord lives in the scale, proportional
 *  otherwise — so a single bVII or secondary dominant doesn't flip the key. */
function chordMembershipScore(chord: Chord, scale: Scale): number {
    const pcs = chord.pitchClasses;
    if (!pcs.length) return 0;
    const inScale = pcs.filter(pc => scale.contains(pc)).length;
    return inScale / pcs.length;
}

/**
 * Top-N most likely keys for a chord sequence, best first.
 * +1.0 per fully-diatonic chord (less for partial), +0.5 first/last-tonic
 * anchors, +0.25 mild major bias to break relative-key ties.
 */
export function inferKey(chords: readonly Chord[], topN = 3): KeyCandidate[] {
    if (!chords.length) return [];

    const first = chords[0];
    const last = chords[chords.length - 1];
    const candidates: KeyCandidate[] = [];

    for (const [root, scaleName] of CANDIDATE_KEYS) {
        const scale = new Scale(root, scaleName);
        let score = 0;
        let diatonicCount = 0;
        for (const c of chords) {
            const m = chordMembershipScore(c, scale);
            score += m;
            if (m === 1.0) diatonicCount++;
        }
        if (first && first.root === root) score += 0.5;
        if (last && last.root === root) score += 0.5;
        if (scaleName === "major") score += 0.25;

        candidates.push({
            root,
            scaleName,
            score: Math.round(score * 1000) / 1000,
            diatonicCount,
            totalChords: chords.length,
            label: keyLabel(root, scaleName),
        });
    }

    candidates.sort((a, b) => b.score - a.score);
    return candidates.slice(0, topN);
}

// ── Roman-numeral labelling ─────────────────────────────────────────

function labelDiatonicMatch(idx: number, dc: Chord): string {
    let base: string = ROMAN[idx] ?? String(idx + 1);
    if (["minor", "diminished", "minor7", "half-dim7"].includes(dc.quality)) {
        base = base.toLowerCase();
    }
    if (dc.quality === "diminished") base += "o";
    else if (dc.quality === "half-dim7") base += "ø7";
    else if (dc.quality === "dominant7") base += "7";
    else if (dc.quality === "minor7") base += "7";
    else if (dc.quality === "major7") base += "maj7";
    return base;
}

export interface RomanLabel {
    label: string;
    borrowed: boolean;
    secondary: boolean;
}

/**
 * Best-effort Roman numeral for a chord under a key: diatonic match first
 * (triads and sevenths separately, so a plain C isn't labelled Imaj7),
 * then borrowed-from-parallel, then secondary dominant, then "?(name)".
 */
export function romanForChord(chord: Chord, scale: Scale): RomanLabel {
    const triads = buildDiatonicChords(scale, false);
    const sevenths = buildDiatonicChords(scale, true);

    for (const dcList of [triads, sevenths]) {
        for (let i = 0; i < dcList.length; i++) {
            const dc = dcList[i];
            if (dc && dc.root === chord.root && dc.quality === chord.quality) {
                return { label: labelDiatonicMatch(i, dc), borrowed: false, secondary: false };
            }
        }
    }

    // Borrowed-chord check: same scale degree in the parallel mode.
    const parallelName = PARALLEL_MODE[scale.patternName]
        ?? (scale.patternName === "major" ? "natural_minor" : "major");
    if (scalePatternExists(parallelName)) {
        const parallel = new Scale(scale.root, parallelName);
        for (const withSevenths of [false, true]) {
            const borrowedChords = buildDiatonicChords(parallel, withSevenths);
            for (let i = 0; i < borrowedChords.length; i++) {
                const pc = borrowedChords[i];
                if (pc && pc.root === chord.root && pc.quality === chord.quality) {
                    let base = labelDiatonicMatch(i, pc);
                    if (!scale.contains(chord.root)) base = "b" + base;
                    return { label: base, borrowed: true, secondary: false };
                }
            }
        }
    }

    // Secondary-dominant check: V or V7 of a diatonic target.
    if (chord.quality === "dominant7" || chord.quality === "major") {
        for (let i = 0; i < triads.length; i++) {
            const dc = triads[i];
            if (dc && mod12(chord.root + 5) === dc.root) {
                let target: string = ROMAN[i] ?? String(i + 1);
                if (["minor", "diminished"].includes(dc.quality)) {
                    target = target.toLowerCase();
                }
                const tag = chord.quality === "dominant7" ? "V7" : "V";
                return { label: `${tag}/${target}`, borrowed: false, secondary: true };
            }
        }
    }

    return { label: `?(${chord.name})`, borrowed: false, secondary: false };
}

function scalePatternExists(name: string): boolean {
    try {
        new Scale(0, name);
        return true;
    } catch {
        return false;
    }
}

// ── Harmonic function ───────────────────────────────────────────────

export type HarmonicFunction = "tonic" | "subdominant" | "dominant" | null;

/** Classic functional-harmony buckets by scale degree of the chord root.
 *  Degrees (0-indexed): 0/2/5 → T, 1/3 → S, 4/6 → D. Null off-scale. */
export function harmonicFunction(chord: Chord, scale: Scale): HarmonicFunction {
    const degreeIdx = scale.notes.indexOf(mod12(chord.root));
    if (degreeIdx === -1 || scale.degreeCount !== 7) return null;
    if ([0, 2, 5].includes(degreeIdx)) return "tonic";
    if ([1, 3].includes(degreeIdx)) return "subdominant";
    return "dominant";
}
