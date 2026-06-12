// Core primitives: notes, scales, chords, and chord recognition.
// Adapted from chordgen-m4l/src/theory.js and Composition Aide's
// music_theory.py recognize_chord().

import {
    CHORD_QUALITIES,
    QUALITY_TO_SUFFIX,
    SCALE_PATTERNS,
    NOTE_NAMES_SHARP,
    NOTE_NAMES_FLAT,
} from "./data.js";

export function mod12(n: number): number {
    return ((n % 12) + 12) % 12;
}

export function noteName(pc: number, useFlats = false): string {
    const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
    return names[mod12(pc)] ?? "?";
}

export function intervalBetween(a: number, b: number): number {
    return mod12(b - a);
}

// ── Scale ───────────────────────────────────────────────────────────

export class Scale {
    readonly root: number;
    readonly patternName: string;
    private readonly _notes: number[];

    constructor(root: number, patternName: string, explicitNotes?: readonly number[]) {
        this.root = mod12(root);
        this.patternName = patternName;
        if (explicitNotes) {
            this._notes = explicitNotes.map(mod12);
            return;
        }
        const pattern = SCALE_PATTERNS[patternName];
        if (!pattern) throw new Error(`Unknown scale pattern: ${patternName}`);
        const notes = [this.root];
        for (const step of pattern) {
            notes.push(mod12((notes[notes.length - 1] ?? 0) + step));
        }
        // Drop the wrap-around note when it lands back on the root.
        this._notes = notes[notes.length - 1] === this.root
            ? notes.slice(0, -1)
            : notes;
    }

    /** Build a scale directly from semitone offsets (e.g. Live's
     *  Song.scaleIntervals) when no named pattern matches. */
    static fromIntervals(root: number, intervals: readonly number[], name = "custom"): Scale {
        return new Scale(root, name, intervals.map(iv => mod12(root + iv)));
    }

    get notes(): number[] {
        return this._notes.slice();
    }

    get degreeCount(): number {
        return this._notes.length;
    }

    /** 1-indexed; wraps mod degreeCount. */
    noteAtDegree(degree: number): number {
        const n = this.degreeCount;
        return this._notes[(((degree - 1) % n) + n) % n] ?? this.root;
    }

    contains(pc: number): boolean {
        return this._notes.includes(mod12(pc));
    }
}

// ── Chord ───────────────────────────────────────────────────────────

export class Chord {
    root: number;
    quality: string;
    inversion: number;

    constructor(root: number, quality: string, inversion = 0) {
        this.root = mod12(root);
        this.quality = quality;
        this.inversion = inversion;
    }

    get intervals(): number[] {
        const known = CHORD_QUALITIES[this.quality];
        if (known) return known.slice();
        // Fallback: dashed-intervals string like "0-2-4" from matchQuality.
        return this.quality.split("-").map(x => parseInt(x, 10));
    }

    get pitchClasses(): number[] {
        const pcs = this.intervals.map(iv => mod12(this.root + iv));
        const inv = this.inversion;
        return pcs.slice(inv).concat(pcs.slice(0, inv));
    }

    get bassNote(): number {
        return this.pitchClasses[0] ?? this.root;
    }

    get name(): string {
        const suffix = QUALITY_TO_SUFFIX[this.quality] ?? this.quality;
        let base = noteName(this.root) + suffix;
        if (this.inversion && this.bassNote !== this.root) {
            base += "/" + noteName(this.bassNote);
        }
        return base;
    }
}

// ── Diatonic chord builder ──────────────────────────────────────────

function matchQuality(intervals: number[]): string {
    for (const [name, pattern] of Object.entries(CHORD_QUALITIES)) {
        if (pattern.length === intervals.length &&
            pattern.every((v, i) => v === intervals[i])) {
            return name;
        }
    }
    return intervals.join("-");
}

export function buildDiatonicChords(scale: Scale, sevenths = false): Chord[] {
    const chords: Chord[] = [];
    const notes = scale.notes;
    const n = notes.length;
    // Scale-degree indexing (not pitch-class arithmetic) — what makes
    // pentatonic/blues scales work.
    for (let deg = 0; deg < n; deg++) {
        const root = notes[deg] ?? 0;
        const third = notes[(deg + 2) % n] ?? 0;
        const fifth = notes[(deg + 4) % n] ?? 0;
        const intervals = [0, intervalBetween(root, third), intervalBetween(root, fifth)];
        if (sevenths) {
            const seventh = notes[(deg + 6) % n] ?? 0;
            intervals.push(intervalBetween(root, seventh));
        }
        chords.push(new Chord(root, matchQuality(intervals)));
    }
    return chords;
}

// ── Chord recognition ───────────────────────────────────────────────

export interface ChordMatch {
    score: number;
    chord: Chord;
}

/**
 * Identify the most likely chord(s) from MIDI notes or pitch classes.
 * When MIDI note numbers are supplied, the lowest note detects inversions.
 *
 * Scoring: matched / (len(expected) + 0.5 * extra). Exact match = 1.0.
 */
export function recognizeChord(notes: readonly number[], topN = 3): ChordMatch[] {
    if (!notes.length) return [];

    const inputPcs = new Set(notes.map(mod12));
    const bassPc = mod12(Math.min(...notes));

    const results: Array<{ score: number; missing: number; root: number; chord: Chord }> = [];
    for (let root = 0; root < 12; root++) {
        for (const [quality, intervals] of Object.entries(CHORD_QUALITIES)) {
            const expectedPcs = new Set(intervals.map(iv => mod12(root + iv)));

            let matched = 0;
            for (const pc of expectedPcs) if (inputPcs.has(pc)) matched++;
            if (matched === 0) continue;

            let extra = 0;
            for (const pc of inputPcs) if (!expectedPcs.has(pc)) extra++;
            const missing = expectedPcs.size - matched;
            const score = matched / (expectedPcs.size + 0.5 * extra);

            const chord = new Chord(root, quality);
            if (expectedPcs.has(bassPc) && bassPc !== root) {
                const idx = chord.pitchClasses.indexOf(bassPc);
                if (idx !== -1) chord.inversion = idx;
            }
            results.push({ score, missing, root, chord });
        }
    }

    // Best score first; ties broken by fewer missing tones, then by
    // root-position reading of the bass (Am7 over C6 when A is lowest),
    // then root.
    const bassRootBonus = (r: { root: number }) => (r.root === bassPc ? 0 : 1);
    results.sort((a, b) =>
        b.score - a.score ||
        a.missing - b.missing ||
        bassRootBonus(a) - bassRootBonus(b) ||
        a.root - b.root);

    const seen = new Set<string>();
    const unique: ChordMatch[] = [];
    for (const r of results) {
        const key = `${r.chord.root}|${r.chord.quality}|${r.chord.inversion}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push({ score: r.score, chord: r.chord });
        }
    }
    return unique.slice(0, topN);
}
