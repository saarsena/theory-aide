import type { TimedNote } from "./timeline.js";

export interface VoicingMetric {
    label: string;
    value: string;
    detail: string;
}

export interface VoicingFinding {
    label: string;
    detail: string;
    severity: "info" | "suggestion" | "warning";
}

export interface VoicingData {
    clipName: string;
    rangeLabel: string;
    noteCount: number;
    summary: string;
    metrics: VoicingMetric[];
    findings: VoicingFinding[];
    suggestions: string[];
}

function beatLabel(beat: number): string {
    return `${Math.floor(beat / 4) + 1}.${Math.floor(beat % 4) + 1}`;
}

function noteName(pitch: number): string {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    return `${names[((pitch % 12) + 12) % 12]}${Math.floor(pitch / 12) - 1}`;
}

function uniqueSorted(values: readonly number[]): number[] {
    return [...new Set(values)].sort((a, b) => a - b);
}

function average(values: readonly number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rounded(value: number, places = 1): number {
    const scale = 10 ** places;
    return Math.round(value * scale) / scale;
}

function soundingGroups(notes: readonly TimedNote[]): number[][] {
    const starts = uniqueSorted(notes.map(note => Math.round(note.start * 1000) / 1000));
    return starts.map(start => uniqueSorted(
        notes
            .filter(note => note.start <= start + 1e-6 && note.end > start + 1e-6)
            .map(note => note.pitch),
    )).filter(group => group.length > 0);
}

function spacingLabel(intervals: readonly number[]): string {
    if (!intervals.length) return "Single note or unison";
    const avg = average(intervals);
    if (avg <= 3) return "Tight spacing";
    if (avg <= 7) return "Moderate spacing";
    return "Open spacing";
}

function countLowClusters(groups: readonly number[][]): number {
    return groups.filter(group => {
        const lowNotes = group.filter(pitch => pitch < 48);
        if (lowNotes.length < 3) return false;
        const span = Math.max(...lowNotes) - Math.min(...lowNotes);
        return span <= 12;
    }).length;
}

function countMidCrowding(groups: readonly number[][]): number {
    return groups.filter(group => group.filter(pitch => pitch >= 48 && pitch <= 72).length >= 5).length;
}

function inversionHint(groups: readonly number[][]): string {
    const first = groups.find(group => group.length >= 3);
    if (!first) return "No stable chord stack detected.";
    const pcs = uniqueSorted(first.map(pitch => ((pitch % 12) + 12) % 12));
    const bassPc = ((first[0] ?? 0) % 12 + 12) % 12;
    return pcs[0] === bassPc
        ? "Bass often supports the lowest chord tone."
        : "Bass may be using an inversion or non root support.";
}

export function buildVoicingData(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    clipName = "Current clip",
): VoicingData {
    const active = notes.slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    const pitches = active.map(note => note.pitch);
    const groups = soundingGroups(active);
    const low = pitches.length ? Math.min(...pitches) : 0;
    const high = pitches.length ? Math.max(...pitches) : 0;
    const span = high - low;
    const maxDensity = groups.length ? Math.max(...groups.map(group => group.length)) : 0;
    const avgDensity = average(groups.map(group => group.length));
    const intervals = groups.flatMap(group => group.slice(1).map((pitch, idx) => pitch - (group[idx] ?? pitch)));
    const lowClusters = countLowClusters(groups);
    const midCrowds = countMidCrowding(groups);
    const spacing = spacingLabel(intervals);

    const findings: VoicingFinding[] = [
        {
            label: "Register",
            detail: pitches.length
                ? `The voicing spans ${noteName(low)} to ${noteName(high)}, which is ${span} semitones.`
                : "No register information is available.",
            severity: "info",
        },
        {
            label: "Bass Support",
            detail: inversionHint(groups),
            severity: "info",
        },
    ];

    if (lowClusters) {
        findings.push({
            label: "Muddy Low Register Cluster",
            detail: `${lowClusters} moment${lowClusters === 1 ? "" : "s"} place three or more low notes inside one octave.`,
            severity: "warning",
        });
    }

    if (midCrowds) {
        findings.push({
            label: "Crowded Midrange",
            detail: `${midCrowds} moment${midCrowds === 1 ? "" : "s"} stack five or more notes in the midrange.`,
            severity: "warning",
        });
    }

    if (!lowClusters && !midCrowds) {
        findings.push({
            label: "Readable Density",
            detail: "The voicing does not show obvious low mud or midrange crowding.",
            severity: "suggestion",
        });
    }

    const suggestions = [
        lowClusters
            ? "Move one low chord tone up an octave and leave the bass on a single root or fifth."
            : "Try one wider version by moving the highest chord tone up an octave.",
        midCrowds
            ? "Remove one inner voice or move it above the melody so the midrange can breathe."
            : "Try a denser answer by adding one inner chord tone for the next section.",
        "For smoother voice leading, keep common tones in place and move the other voices by the smallest available step.",
        maxDensity >= 5
            ? "Use simpler bass support under dense chords: root, fifth, or a held pedal."
            : "If the section needs lift, double the top note an octave higher instead of adding more middle notes.",
    ];

    return {
        clipName,
        rangeLabel: `${beatLabel(rangeStart)} to ${beatLabel(rangeEnd)}`,
        noteCount: active.length,
        summary: `${clipName} has ${spacing.toLowerCase()} with peak density ${maxDensity}.`,
        metrics: [
            { label: "Register Span", value: pitches.length ? `${noteName(low)} to ${noteName(high)}` : "No notes", detail: `${span} semitones from lowest to highest note.` },
            { label: "Spacing", value: spacing, detail: intervals.length ? `Average adjacent spacing is ${rounded(average(intervals))} semitones.` : "There are not enough stacked notes to measure spacing." },
            { label: "Density", value: `Average ${rounded(avgDensity)}, peak ${maxDensity}`, detail: "Density counts how many notes sound together at each attack point." },
            { label: "Doubling", value: `${active.length - uniqueSorted(pitches.map(p => p % 12)).length} octave duplicate${active.length - uniqueSorted(pitches.map(p => p % 12)).length === 1 ? "" : "s"}`, detail: "Doubling can add weight, but too much doubling can blur the chord." },
        ],
        findings,
        suggestions,
    };
}
