// Harmonic timeline: merge notes from many tracks, slice into beats,
// recognize the prevailing chord per slice, merge slices into segments
// of stable harmony, and flag notes that fight the chord and key.
// This is the part neither a VST nor a single-clip tool can do.

import { Chord, Scale, mod12, noteName, recognizeChord } from "./core.js";
import {
    KeyCandidate,
    RomanLabel,
    ProgressionMatch,
    ResolutionSuggestion,
    HarmonicFunction,
    detectProgressions,
    harmonicFunction,
    inferKey,
    romanForChord,
    keyLabel,
    suggestResolutionForEnding,
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

function chordDisplayUsesFlats(roman: RomanLabel | null, keyUseFlats: boolean): boolean {
    if (roman?.borrowed && roman.label.includes("b")) return true;
    return keyUseFlats;
}

export interface Outlier {
    pc: number;
    name: string;
    /** True when the note is outside the key scale entirely (not just the chord). */
    outOfKey: boolean;
    kind: "passing_tone" | "chord_extension" | "chord_tone_outside_key" | "hard_clash";
    severity: "info" | "warn";
    explanation: string;
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
    /** Compact 0 to 100 estimate of harmonic tension for visualization. */
    tension: number;
    /** Number of distinct sounding pitch classes in the segment. */
    density: number;
}

export interface ModalColor {
    mode: "dorian" | "phrygian" | "lydian" | "mixolydian";
    note: string;
    description: string;
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
    /** Common progression/cadence matches found in consecutive segments. */
    progressions: ProgressionMatch[];
    /** Likely next-chord moves when the selected range ends unresolved. */
    resolutionSuggestions: ResolutionSuggestion[];
    /** Characteristic modal notes found against the chosen key center. */
    modalColors: ModalColor[];
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

function classifyOutlier(
    pc: number,
    weight: number,
    maxWeight: number,
    chord: Chord | null,
    inChord: boolean,
): Pick<Outlier, "kind" | "severity" | "explanation"> {
    if (chord && inChord) {
        return {
            kind: "chord_tone_outside_key",
            severity: "info",
            explanation: "Outside the key, but it belongs to the detected chord. This is color, not a clash.",
        };
    }

    if (weight < maxWeight * PASSING_TONE_RATIO) {
        return {
            kind: "passing_tone",
            severity: "info",
            explanation: "Brief or lightly weighted against the harmony, so it may be a passing tone or ornament.",
        };
    }

    if (chord) {
        const interval = mod12(pc - chord.root);
        if ([2, 5, 9, 10, 11].includes(interval)) {
            return {
                kind: "chord_extension",
                severity: "info",
                explanation: "Outside the triad shape, but it resembles an added chord color such as a 9th, 11th, 13th, or 7th.",
            };
        }
    }

    return {
        kind: "hard_clash",
        severity: "warn",
        explanation: "Outside both the key and detected chord, and strong enough to sound like a real clash.",
    };
}

function tensionForSegment(
    chord: Chord | null,
    pcs: readonly number[],
    outliers: readonly Outlier[],
): number {
    let score = Math.max(0, pcs.length - 3) * 8;

    for (const outlier of outliers) {
        score += outlier.severity === "warn" ? 35 : 10;
    }

    if (chord) {
        if (["diminished", "dim7"].includes(chord.quality)) score += 50;
        else if (chord.quality === "half-dim7") score += 45;
        else if (chord.quality === "augmented") score += 40;
        else if (chord.quality.startsWith("dominant")) score += 35;
        else if (["major7", "minor7", "major9", "minor9", "add9"].includes(chord.quality)) score += 15;
        else if (["minor11", "dominant11", "major13", "minor13", "dominant13"].includes(chord.quality)) score += 25;
    }

    return Math.min(100, Math.round(score));
}

function detectModalColors(
    notePcs: readonly number[],
    key: TimelineAnalysis["key"],
    useFlats: boolean,
): ModalColor[] {
    const pcs = new Set(notePcs.map(mod12));
    const root = key.root;
    const found: ModalColor[] = [];

    const add = (mode: ModalColor["mode"], pc: number, preferFlats: boolean, description: string) => {
        if (pcs.has(mod12(pc))) {
            found.push({ mode, note: noteName(pc, preferFlats || useFlats), description });
        }
    };

    if (key.scaleName === "major") {
        add("lydian", root + 6, false, "Raised 4th color against a major key center.");
        add("mixolydian", root + 10, true, "Flat 7th color against a major key center.");
    } else if (key.scaleName === "natural_minor") {
        add("dorian", root + 9, false, "Natural 6th color against a minor key center.");
        add("phrygian", root + 1, true, "Flat 2nd color against a minor key center.");
    }

    return found;
}

function buildSlices(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
): Slice[] {
    const times = new Set<number>();
    times.add(rangeStart);
    times.add(rangeEnd);

    for (const note of notes) {
        if (note.start >= rangeStart && note.start < rangeEnd) times.add(note.start);
        if (note.end > rangeStart && note.end <= rangeEnd) times.add(note.end);
    }

    const sortedTimes = Array.from(times).sort((a, b) => a - b);
    const slices: Slice[] = [];

    for (let i = 0; i < sortedTimes.length - 1; i++) {
        slices.push({
            start: sortedTimes[i]!,
            end: sortedTimes[i + 1]!,
            weights: new Map(),
            pcTracks: new Map(),
            bassPitch: null,
            chord: null,
            confidence: 0,
        });
    }

    for (const note of notes) {
        for (const slice of slices) {
            if (slice.start >= note.end || slice.end <= note.start) continue;

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
        const name = slice.chord ? slice.chord.getName() : null;
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
    liveKey?: { root: number; scale: Scale; label: string } | undefined;
}

export function keyUsesFlats(root: number, scaleName: string): boolean {
    if (scaleName === "major") {
        return [5, 10, 3, 8, 1, 6].includes(mod12(root));
    }
    if (scaleName === "natural_minor") {
        return [2, 7, 0, 5, 10, 3, 8].includes(mod12(root));
    }
    return false;
}

export function analyzeTimeline(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    options: AnalyzeTimelineOptions = {},
): TimelineAnalysis {
    const slices = buildSlices(notes, rangeStart, rangeEnd);
    const groups = mergeSlices(slices);

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

    const useFlats = keyUsesFlats(key.root, key.scaleName);
    const trackNames = [...new Set(notes.map(n => n.track))];
    const segments: Segment[] = [];

    for (const group of groups) {
        const first = group[0];
        const last = group[group.length - 1];
        if (!first || !last) continue;

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
        const maxWeight = weights.size ? Math.max(...weights.values()) : 0;

        const chord = first.chord;
        const chordPcs = chord ? new Set(chord.pitchClasses) : null;
        const roman = chord ? romanForChord(chord, scale) : null;
        const chordUseFlats = chordDisplayUsesFlats(roman, useFlats);

        const outliers: Outlier[] = [];
        for (const pc of pcs) {
            const inKey = scale.contains(pc);
            const inChord = chordPcs?.has(pc) ?? false;
            if (inKey) continue;
            const classification = classifyOutlier(pc, weights.get(pc) ?? 0, maxWeight, chord, inChord);
            outliers.push({
                pc,
                name: noteName(pc, useFlats),
                outOfKey: true,
                ...classification,
                tracks: [...(pcTracks.get(pc) ?? [])].sort(),
            });
        }

        const segTracks = new Set<string>();
        for (const tracks of pcTracks.values()) for (const t of tracks) segTracks.add(t);

        segments.push({
            start: first.start,
            end: last.end,
            chord,
            chordName: chord ? chord.getName(chordUseFlats) : null,
            confidence: first.confidence,
            roman,
            fn: chord ? harmonicFunction(chord, scale) : null,
            pcs,
            pcNames: pcs.map(pc => noteName(pc, chordUseFlats)),
            outliers,
            tracks: [...segTracks].sort(),
            intervals: chord ? chord.intervals : [],
            quality: chord ? chord.quality : null,
            chordToneNames: chord
                ? chord.intervals.map(iv => noteName(mod12(chord.root + iv), chordUseFlats))
                : [],
            tension: tensionForSegment(chord, pcs, outliers),
            density: pcs.length,
        });
    }

    const lastSegment = segments[segments.length - 1] ?? null;
    const resolutionSuggestions = lastSegment
        ? suggestResolutionForEnding(
            lastSegment.roman,
            lastSegment.fn,
            scale,
            segments.length - 1,
            lastSegment.chordName,
            useFlats,
        )
        : [];

    return {
        rangeStart,
        rangeEnd,
        segments,
        keyCandidates,
        key: {
            ...key,
            label: keyLabel(key.root, key.scaleName, useFlats),
        },
        inferredAgrees,
        trackNames,
        noteCount: notes.length,
        scaleNotes: scale.notes,
        scaleNoteNames: scale.notes.map(pc => noteName(pc, useFlats)),
        progressions: detectProgressions(segments.map(s => s.roman)),
        resolutionSuggestions,
        modalColors: detectModalColors(notes.map(n => n.pitch), key, useFlats),
    };
}
