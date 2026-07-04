// Harmonic timeline: merge notes from many tracks, slice into beats,
// recognize the prevailing chord per slice, merge slices into segments
// of stable harmony, and flag notes that fight the chord and key.
// This is the part neither a VST nor a single-clip tool can do.

import { Chord, Scale, keyUsesFlats, mod12, noteName, recognizeChord } from "./core.js";
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
    /** Automatic comparison of the first and second half of the selected range. */
    rangeComparison: RangeComparison | null;
    /** Human-readable text summary for export. */
    textSummary: string;
}

export function generateTextSummary(analysis: Omit<TimelineAnalysis, "textSummary">): string {
    const lines: string[] = [];
    lines.push(`THEORY AIDE ANALYSIS`);
    lines.push(`====================`);
    lines.push(`Range: ${analysis.rangeStart.toFixed(2)} - ${analysis.rangeEnd.toFixed(2)} beats (${analysis.noteCount} notes)`);
    lines.push(`Key:   ${analysis.key.label} (${analysis.key.source})`);
    if (analysis.inferredAgrees === false) {
        const best = analysis.keyCandidates[0];
        lines.push(`Note:  Live's key used, but inference suggests ${best?.label}.`);
    }
    lines.push("");

    lines.push(`PROGRESSION`);
    lines.push(`-----------`);
    const segments = analysis.segments;
    if (!segments.length) {
        lines.push("(No chords detected)");
    } else {
        const seq = segments.map(s => s.chordName || "[rest]").join(" -> ");
        lines.push(seq);
        const romanSeq = segments.map(s => s.roman?.label || "-").join("   ");
        lines.push(romanSeq);
    }
    lines.push("");

    if (analysis.progressions.length > 0) {
        lines.push(`MATCHED PATTERNS`);
        lines.push(`----------------`);
        for (const p of analysis.progressions) {
            lines.push(`- ${p.label} (${p.pattern}): ${p.description}`);
        }
        lines.push("");
    }

    if (analysis.modalColors.length > 0) {
        lines.push(`MODAL COLOR`);
        lines.push(`-----------`);
        for (const m of analysis.modalColors) {
            lines.push(`- ${m.note} (${m.mode}): ${m.description}`);
        }
        lines.push("");
    }

    const hardClashes = analysis.segments.flatMap(s => s.outliers.filter(o => o.severity === "warn"));
    if (hardClashes.length > 0) {
        lines.push(`AUDIT WARNINGS`);
        lines.push(`--------------`);
        const seen = new Set<string>();
        for (const c of hardClashes) {
            const key = `${c.name}:${c.explanation}`;
            if (seen.has(key)) continue;
            seen.add(key);
            lines.push(`- [!] ${c.name}: ${c.explanation} (Tracks: ${c.tracks.join(", ")})`);
        }
        lines.push("");
    }

    if (analysis.rangeComparison) {
        const rc = analysis.rangeComparison;
        lines.push(`RANGE COMPARISON (First vs Second Half)`);
        lines.push(`---------------------------------------`);
        lines.push(`A: ${rc.first.impliedKey || "unclear"} key, ${rc.first.mainFunction} function, energy ${rc.first.energy}`);
        lines.push(`B: ${rc.second.impliedKey || "unclear"} key, ${rc.second.mainFunction} function, energy ${rc.second.energy}`);
        for (const obs of rc.observations) {
            lines.push(`- ${obs}`);
        }
        lines.push("");
    }

    if (analysis.resolutionSuggestions.length > 0) {
        lines.push(`SUGGESTIONS`);
        lines.push(`-----------`);
        for (const s of analysis.resolutionSuggestions) {
            lines.push(`- ${s.reason} Try: ${s.label}`);
        }
        lines.push("");
    }

    lines.push(`Generated by Theory Aide`);
    return lines.join("\n");
}

export interface RangeSummary {
    label: string;
    start: number;
    end: number;
    segmentCount: number;
    noteCount: number;
    impliedKey: string | null;
    chordNames: string[];
    romanLabels: string[];
    progressions: string[];
    averageTension: number;
    peakTension: number;
    averageDensity: number;
    borrowedCount: number;
    secondaryCount: number;
    hardWarningCount: number;
    functionCounts: {
        tonic: number;
        subdominant: number;
        dominant: number;
    };
    mainFunction: "tonic" | "subdominant" | "dominant" | "mixed" | "unclear";
    energy: "low" | "medium" | "high";
}

export interface RangeComparison {
    first: RangeSummary;
    second: RangeSummary;
    observations: string[];
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

function overlaps(startA: number, endA: number, startB: number, endB: number): number {
    return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function uniqueOrdered(values: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const value of values) {
        if (!value || seen.has(value)) continue;
        seen.add(value);
        out.push(value);
    }
    return out;
}

function strongestFunction(counts: RangeSummary["functionCounts"]): RangeSummary["mainFunction"] {
    const ordered = [
        ["tonic", counts.tonic],
        ["subdominant", counts.subdominant],
        ["dominant", counts.dominant],
    ] as const;
    const sorted = [...ordered].sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    const second = sorted[1];
    if (!top || top[1] === 0) return "unclear";
    if (second && second[1] === top[1]) return "mixed";
    return top[0];
}

function summarizeRange(
    label: string,
    start: number,
    end: number,
    segments: readonly Segment[],
    notes: readonly TimedNote[],
): RangeSummary {
    const segmentParts = segments
        .map(segment => ({ segment, overlap: overlaps(segment.start, segment.end, start, end) }))
        .filter(part => part.overlap > 1e-9);
    const totalDuration = segmentParts.reduce((sum, part) => sum + part.overlap, 0);
    const weightedAverage = (value: (segment: Segment) => number): number => {
        if (totalDuration <= 1e-9) return 0;
        return Math.round(segmentParts.reduce((sum, part) => sum + value(part.segment) * part.overlap, 0) / totalDuration);
    };

    const averageTension = weightedAverage(segment => segment.tension || 0);
    const averageDensity = weightedAverage(segment => segment.density || 0);
    const peakTension = segmentParts.reduce((max, part) => Math.max(max, part.segment.tension || 0), 0);
    const functionCounts = { tonic: 0, subdominant: 0, dominant: 0 };
    for (const part of segmentParts) {
        if (part.segment.fn) functionCounts[part.segment.fn] += 1;
    }
    const chordList = segmentParts
        .map(part => part.segment.chord)
        .filter((chord): chord is Chord => !!chord);
    const impliedKey = inferKey(chordList, 1)[0]?.label ?? null;

    return {
        label,
        start,
        end,
        segmentCount: segmentParts.length,
        noteCount: notes.filter(note => overlaps(note.start, note.end, start, end) > 1e-9).length,
        impliedKey,
        chordNames: uniqueOrdered(segmentParts.map(part => part.segment.chordName)),
        romanLabels: uniqueOrdered(segmentParts.map(part => part.segment.roman?.label)),
        progressions: detectProgressions(segmentParts.map(part => part.segment.roman)).map(match => match.pattern),
        averageTension,
        peakTension,
        averageDensity,
        borrowedCount: segmentParts.filter(part => part.segment.roman?.borrowed).length,
        secondaryCount: segmentParts.filter(part => part.segment.roman?.secondary).length,
        hardWarningCount: segmentParts.reduce(
            (sum, part) => sum + part.segment.outliers.filter(outlier => outlier.severity === "warn").length,
            0,
        ),
        functionCounts,
        mainFunction: strongestFunction(functionCounts),
        energy: averageTension >= 55 ? "high" : averageTension >= 25 ? "medium" : "low",
    };
}

function compareSummaries(first: RangeSummary, second: RangeSummary): string[] {
    const observations: string[] = [];
    const tensionDelta = second.averageTension - first.averageTension;
    const densityDelta = second.averageDensity - first.averageDensity;

    if (first.impliedKey && second.impliedKey && first.impliedKey !== second.impliedKey) {
        observations.push("Range B implies " + second.impliedKey + " after Range A implies " + first.impliedKey + ".");
    } else if (first.impliedKey && second.impliedKey) {
        observations.push("Both ranges imply " + first.impliedKey + ".");
    }

    if (Math.abs(tensionDelta) >= 10) {
        observations.push(
            second.averageTension > first.averageTension
                ? "Range B carries more tension than Range A."
                : "Range B relaxes compared with Range A.",
        );
    } else {
        observations.push("Both ranges have similar tension.");
    }

    if (Math.abs(densityDelta) >= 1) {
        observations.push(
            second.averageDensity > first.averageDensity
                ? "Range B is denser, with more notes sounding at once."
                : "Range B is more open, with fewer notes sounding at once.",
        );
    }

    if (second.chordNames.length > first.chordNames.length) {
        observations.push("Range B uses a wider chord vocabulary.");
    } else if (second.chordNames.length < first.chordNames.length) {
        observations.push("Range B uses fewer chord colors.");
    }

    if (second.secondaryCount > first.secondaryCount) {
        observations.push("Range B adds more applied dominant motion.");
    }
    if (second.borrowedCount > first.borrowedCount) {
        observations.push("Range B adds more modal interchange color.");
    }
    if (second.mainFunction !== first.mainFunction && second.mainFunction !== "mixed" && second.mainFunction !== "unclear") {
        observations.push("Range B leans more toward " + second.mainFunction + " function.");
    }
    if (second.hardWarningCount > first.hardWarningCount) {
        observations.push("Range B has more hard clashes to review.");
    }

    return observations.slice(0, 5);
}

function compareRangeHalves(
    segments: readonly Segment[],
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
): RangeComparison | null {
    if (rangeEnd - rangeStart < 2 || segments.length < 2) return null;
    const midpoint = rangeStart + (rangeEnd - rangeStart) / 2;
    const first = summarizeRange("Range A", rangeStart, midpoint, segments, notes);
    const second = summarizeRange("Range B", midpoint, rangeEnd, segments, notes);
    if (!first.segmentCount || !second.segmentCount) return null;
    return { first, second, observations: compareSummaries(first, second) };
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

// Spelling policy lives in core.ts now; re-exported so existing imports
// from this module keep working.
export { keyUsesFlats };

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

    const res = {
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
        rangeComparison: compareRangeHalves(segments, notes, rangeStart, rangeEnd),
    };

    return {
        ...res,
        textSummary: generateTextSummary(res),
    };
}
