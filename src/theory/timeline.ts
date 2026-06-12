// Harmonic timeline: merge notes from many tracks, slice into beats,
// recognize the prevailing chord per slice, merge slices into segments
// of stable harmony, and flag notes that fight the chord and key.
// This is the part neither a VST nor a single-clip tool can do.

import { Chord, Scale, mod12, noteName, recognizeChord } from "./core.js";
import {
    KeyCandidate,
    RomanLabel,
    HarmonicFunction,
    harmonicFunction,
    inferKey,
    romanForChord,
} from "./analyzer.js";

/** A note placed on an absolute beat timeline, tagged with its source track. */
export interface TimedNote {
    pitch: number;
    /** Absolute start, in beats. */
    start: number;
    /** Absolute end, in beats. */
    end: number;
    velocity: number;
    track: string;
}

export interface Outlier {
    pc: number;
    name: string;
    /** True when the note is outside the key scale entirely (not just the chord). */
    outOfKey: boolean;
    tracks: string[];
}

export interface Segment {
    start: number;
    end: number;
    chord: Chord | null;
    chordName: string | null;
    confidence: number;
    roman: RomanLabel | null;
    fn: HarmonicFunction;
    /** Sounding pitch classes, strongest first. */
    pcs: number[];
    pcNames: string[];
    outliers: Outlier[];
    /** Tracks contributing notes to this segment. */
    tracks: string[];
    /** Chord interval structure, e.g. [0,4,7] for a major triad. */
    intervals: number[];
    /** Chord quality key, e.g. "dominant7". */
    quality: string | null;
    /** Note names of chord tones in root-position order. */
    chordToneNames: string[];
}

export interface TimelineAnalysis {
    rangeStart: number;
    rangeEnd: number;
    segments: Segment[];
    keyCandidates: KeyCandidate[];
    /** The key actually used for Roman numerals. */
    key: { root: number; scaleName: string; label: string; source: "live" | "inferred" };
    /** When Live's key was used: does inference agree? */
    inferredAgrees: boolean | null;
    trackNames: string[];
    noteCount: number;
    /** Pitch classes in the key scale (for scale display). */
    scaleNotes: number[];
    /** Note names of the key scale. */
    scaleNoteNames: string[];
}

interface Slice {
    start: number;
    end: number;
    /** pc → accumulated weight (overlap beats × velocity). */
    weights: Map<number, number>;
    /** pc → contributing tracks. */
    pcTracks: Map<number, Set<string>>;
    /** Lowest sounding pitch, for inversion detection. */
    bassPitch: number | null;
    chord: Chord | null;
    confidence: number;
}

/** Pitch classes weaker than this fraction of the strongest one are treated
 *  as passing tones and excluded from chord matching (but still reported). */
const PASSING_TONE_RATIO = 0.2;

function buildSlices(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    sliceBeats: number,
): Slice[] {
    const slices: Slice[] = [];
    for (let t = rangeStart; t < rangeEnd - 1e-9; t += sliceBeats) {
        slices.push({
            start: t,
            end: Math.min(t + sliceBeats, rangeEnd),
            weights: new Map(),
            pcTracks: new Map(),
            bassPitch: null,
            chord: null,
            confidence: 0,
        });
    }

    for (const note of notes) {
        const firstIdx = Math.max(0, Math.floor((note.start - rangeStart) / sliceBeats));
        for (let i = firstIdx; i < slices.length; i++) {
            const slice = slices[i];
            if (!slice || slice.start >= note.end) break;
            const overlap = Math.min(slice.end, note.end) - Math.max(slice.start, note.start);
            if (overlap <= 1e-9) continue;
            const pc = mod12(note.pitch);
            const weight = overlap * (note.velocity / 100);
            slice.weights.set(pc, (slice.weights.get(pc) ?? 0) + weight);
            let trackSet = slice.pcTracks.get(pc);
            if (!trackSet) {
                trackSet = new Set();
                slice.pcTracks.set(pc, trackSet);
            }
            trackSet.add(note.track);
            if (slice.bassPitch === null || note.pitch < slice.bassPitch) {
                slice.bassPitch = note.pitch;
            }
        }
    }

    for (const slice of slices) {
        if (!slice.weights.size) continue;
        const maxWeight = Math.max(...slice.weights.values());
        const strongPcs = [...slice.weights.entries()]
            .filter(([, w]) => w >= maxWeight * PASSING_TONE_RATIO)
            .map(([pc]) => pc);
        // Feed actual pitches so the bass note can mark the inversion: the
        // bass pitch first (recognizeChord uses min()), others in any octave.
        const bassPc = slice.bassPitch !== null ? mod12(slice.bassPitch) : null;
        const pitches = strongPcs.map(pc => pc === bassPc ? pc : pc + 12);
        const matches = recognizeChord(pitches, 1);
        const best = matches[0];
        if (best && strongPcs.length >= 2) {
            slice.chord = best.chord;
            slice.confidence = best.score;
        }
    }

    return slices;
}

function mergeSlices(slices: Slice[]): Slice[][] {
    const groups: Slice[][] = [];
    let current: Slice[] = [];
    let currentName: string | null | undefined;

    for (const slice of slices) {
        const name = slice.chord ? slice.chord.name : null;
        if (current.length && name === currentName) {
            current.push(slice);
        } else {
            if (current.length) groups.push(current);
            current = [slice];
            currentName = name;
        }
    }
    if (current.length) groups.push(current);
    return groups;
}

export interface AnalyzeTimelineOptions {
    /** Beats per analysis slice. */
    sliceBeats?: number;
    /** Live's key, when Scale Mode is on. Takes precedence over inference. */
    liveKey?: { root: number; scale: Scale; label: string } | undefined;
}

export function analyzeTimeline(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    options: AnalyzeTimelineOptions = {},
): TimelineAnalysis {
    const sliceBeats = options.sliceBeats ?? 1;
    const slices = buildSlices(notes, rangeStart, rangeEnd, sliceBeats);
    const groups = mergeSlices(slices);

    // Infer the key from the segment chords (post-merge = harmonic rhythm).
    const segmentChords = groups
        .map(g => g[0]?.chord)
        .filter((c): c is Chord => !!c);
    const keyCandidates = inferKey(segmentChords, 3);

    let key: TimelineAnalysis["key"];
    let scale: Scale;
    let inferredAgrees: boolean | null = null;
    const best = keyCandidates[0];

    if (options.liveKey) {
        scale = options.liveKey.scale;
        key = {
            root: options.liveKey.root,
            scaleName: scale.patternName,
            label: options.liveKey.label,
            source: "live",
        };
        inferredAgrees = best
            ? best.root === scale.root && new Scale(best.root, best.scaleName).notes
                .every(pc => scale.contains(pc))
            : null;
    } else if (best) {
        scale = new Scale(best.root, best.scaleName);
        key = { root: best.root, scaleName: best.scaleName, label: best.label, source: "inferred" };
    } else {
        scale = new Scale(0, "major");
        key = { root: 0, scaleName: "major", label: "C major", source: "inferred" };
    }

    const trackNames = [...new Set(notes.map(n => n.track))];
    const segments: Segment[] = [];

    for (const group of groups) {
        const first = group[0];
        const last = group[group.length - 1];
        if (!first || !last) continue;

        // Re-accumulate weights and track sets across the whole segment.
        const weights = new Map<number, number>();
        const pcTracks = new Map<number, Set<string>>();
        for (const slice of group) {
            for (const [pc, w] of slice.weights) {
                weights.set(pc, (weights.get(pc) ?? 0) + w);
            }
            for (const [pc, tracks] of slice.pcTracks) {
                let set = pcTracks.get(pc);
                if (!set) {
                    set = new Set();
                    pcTracks.set(pc, set);
                }
                for (const t of tracks) set.add(t);
            }
        }
        const pcs = [...weights.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([pc]) => pc);

        const chord = first.chord;
        const chordPcs = chord ? new Set(chord.pitchClasses) : null;

        // Flag notes outside the key that aren't tones of the recognized
        // chord — chord tones of a borrowed chord are intentional color,
        // not clashes.
        const outliers: Outlier[] = [];
        for (const pc of pcs) {
            if (scale.contains(pc)) continue;
            if (chordPcs?.has(pc)) continue;
            outliers.push({
                pc,
                name: noteName(pc),
                outOfKey: true,
                tracks: [...(pcTracks.get(pc) ?? [])].sort(),
            });
        }

        const segTracks = new Set<string>();
        for (const tracks of pcTracks.values()) for (const t of tracks) segTracks.add(t);

        segments.push({
            start: first.start,
            end: last.end,
            chord,
            chordName: chord ? chord.name : null,
            confidence: first.confidence,
            roman: chord ? romanForChord(chord, scale) : null,
            fn: chord ? harmonicFunction(chord, scale) : null,
            pcs,
            pcNames: pcs.map(pc => noteName(pc)),
            outliers,
            tracks: [...segTracks].sort(),
            intervals: chord ? chord.intervals : [],
            quality: chord ? chord.quality : null,
            // Root-position order regardless of inversion — correct for educational display.
            chordToneNames: chord
                ? chord.intervals.map(iv => noteName(mod12(chord.root + iv)))
                : [],
        });
    }

    return {
        rangeStart,
        rangeEnd,
        segments,
        keyCandidates,
        key,
        inferredAgrees,
        trackNames,
        noteCount: notes.length,
        scaleNotes: scale.notes,
        scaleNoteNames: scale.notes.map(pc => noteName(pc)),
    };
}
