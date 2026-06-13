import type { TimedNote } from "./timeline.js";

export interface RhythmMetric {
    label: string;
    value: string;
    detail: string;
}

export interface PhraseFinding {
    label: string;
    detail: string;
    severity: "info" | "suggestion" | "warning";
}

export interface RhythmSuggestion {
    label: string;
    action: string;
}

export interface RhythmPhrasingData {
    clipName: string;
    rangeLabel: string;
    noteCount: number;
    summary: string;
    metrics: RhythmMetric[];
    findings: PhraseFinding[];
    suggestions: RhythmSuggestion[];
}

function round(value: number, places = 2): number {
    const scale = 10 ** places;
    return Math.round(value * scale) / scale;
}

function beatLabel(beat: number): string {
    return `${Math.floor(beat / 4) + 1}.${Math.floor(beat % 4) + 1}`;
}

function uniqueSorted(values: readonly number[], grid = 0.001): number[] {
    const rounded = values.map(value => Math.round(value / grid) * grid);
    return [...new Set(rounded)].sort((a, b) => a - b);
}

function near(value: number, target: number, tolerance = 0.04): boolean {
    return Math.abs(value - target) <= tolerance;
}

function smallestGap(starts: readonly number[]): number | null {
    let gap: number | null = null;
    for (let i = 1; i < starts.length; i++) {
        const diff = (starts[i] ?? 0) - (starts[i - 1] ?? 0);
        if (diff <= 1e-9) continue;
        gap = gap === null ? diff : Math.min(gap, diff);
    }
    return gap;
}

function subdivisionLabel(gap: number | null): string {
    if (gap === null) return "Mostly sustained";
    if (near(gap, 1 / 3, 0.04)) return "Triplet subdivision";
    if (gap <= 0.26) return "Sixteenth note subdivision";
    if (gap <= 0.51) return "Eighth note subdivision";
    if (gap <= 1.01) return "Quarter note subdivision";
    return "Long note phrasing";
}

function onsetPosition(start: number): number {
    const pos = start % 4;
    return pos < 0 ? pos + 4 : pos;
}

function barIndex(start: number, rangeStart: number): number {
    return Math.floor((start - rangeStart) / 4);
}

function positionFingerprint(notes: readonly TimedNote[], rangeStart: number, bar: number): string {
    const positions = notes
        .filter(note => barIndex(note.start, rangeStart) === bar)
        .map(note => round((note.start - rangeStart) % 4, 2));
    return uniqueSorted(positions).join(",");
}

function repeatedBarCount(notes: readonly TimedNote[], rangeStart: number, barCount: number): number {
    const counts = new Map<string, number>();
    for (let bar = 0; bar < barCount; bar++) {
        const fingerprint = positionFingerprint(notes, rangeStart, bar);
        if (!fingerprint) continue;
        counts.set(fingerprint, (counts.get(fingerprint) ?? 0) + 1);
    }
    return [...counts.values()].filter(count => count > 1).reduce((sum, count) => sum + count, 0);
}

function notesPerBar(notes: readonly TimedNote[], rangeStart: number, barCount: number): number[] {
    const counts = Array.from({ length: Math.max(1, barCount) }, () => 0);
    for (const note of notes) {
        const idx = Math.max(0, Math.min(counts.length - 1, barIndex(note.start, rangeStart)));
        counts[idx] = (counts[idx] ?? 0) + 1;
    }
    return counts;
}

function densitySummary(counts: readonly number[]): string {
    const avg = counts.reduce((sum, count) => sum + count, 0) / Math.max(1, counts.length);
    if (avg >= 10) return "Crowded";
    if (avg >= 6) return "Active";
    if (avg >= 3) return "Balanced";
    return "Sparse";
}

function syncopationSummary(starts: readonly number[]): { value: string; count: number } {
    let syncopated = 0;
    for (const start of starts) {
        const pos = onsetPosition(start);
        const beatPos = pos % 1;
        if (!near(beatPos, 0, 0.04) && !near(beatPos, 0.5, 0.04)) syncopated++;
    }
    if (!starts.length) return { value: "No clear syncopation", count: 0 };
    const ratio = syncopated / starts.length;
    if (ratio >= 0.45) return { value: "High syncopation", count: syncopated };
    if (ratio >= 0.2) return { value: "Moderate syncopation", count: syncopated };
    return { value: "Mostly on the grid", count: syncopated };
}

function timingFeel(starts: readonly number[]): string {
    const offEighths = starts
        .map(start => onsetPosition(start) % 1)
        .filter(pos => pos > 0.52 && pos < 0.72);
    if (offEighths.length >= 3) return "Possible swing or pushed offbeats";

    const loose = starts.filter(start => {
        const nearestSixteenth = Math.round(start * 4) / 4;
        const distance = Math.abs(start - nearestSixteenth);
        return distance > 0.025 && distance < 0.1;
    });
    if (loose.length >= 3) return "Humanized timing";
    return "Straight grid feel";
}

function phraseLengthLabel(duration: number): string {
    if (duration < 4) return "Short phrase under one bar";
    if (duration <= 4.1) return "One bar phrase";
    if (duration <= 8.1) return "Two bar phrase";
    if (duration <= 16.1) return "Four bar phrase";
    return `${round(duration / 4, 1)} bar phrase`;
}

function lastQuarterIsEmpty(notes: readonly TimedNote[], rangeStart: number, rangeEnd: number): boolean {
    const split = rangeStart + (rangeEnd - rangeStart) * 0.75;
    return !notes.some(note => note.start >= split);
}

function firstOnsetDelay(starts: readonly number[], rangeStart: number): number {
    const first = starts[0];
    return first === undefined ? 0 : first - rangeStart;
}

function buildFindings(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    starts: readonly number[],
    barCounts: readonly number[],
): PhraseFinding[] {
    const duration = rangeEnd - rangeStart;
    const barCount = Math.max(1, Math.ceil(duration / 4));
    const repeated = repeatedBarCount(notes, rangeStart, barCount);
    const findings: PhraseFinding[] = [
        {
            label: phraseLengthLabel(duration),
            detail: `The clip spans ${round(duration)} beats, from ${beatLabel(rangeStart)} to ${beatLabel(rangeEnd)}.`,
            severity: "info",
        },
    ];

    if (repeated >= 2) {
        findings.push({
            label: "Repeated rhythm shape",
            detail: "At least two bars share the same onset pattern. This can make the phrase feel cohesive.",
            severity: "info",
        });
    }

    if (lastQuarterIsEmpty(notes, rangeStart, rangeEnd)) {
        findings.push({
            label: "Phrase leaves an answer space",
            detail: "The final quarter of the clip is mostly open, which gives the next phrase room to answer.",
            severity: "suggestion",
        });
    } else {
        findings.push({
            label: "Phrase may need an answer",
            detail: "The ending stays active, so the listener may need a rest, held note, or simpler reply afterward.",
            severity: "suggestion",
        });
    }

    if (barCounts.some(count => count >= 12)) {
        findings.push({
            label: "Crowded bar",
            detail: "One bar has many note starts. Consider removing notes or turning some hits into held tones.",
            severity: "warning",
        });
    }

    if (firstOnsetDelay(starts, rangeStart) >= 0.75) {
        findings.push({
            label: "Delayed entry",
            detail: "The phrase waits before entering. That can feel intentional if another part fills the pickup space.",
            severity: "info",
        });
    }

    return findings;
}

function buildSuggestions(
    density: string,
    subdivision: string,
    syncopation: { value: string; count: number },
    hasAnswerSpace: boolean,
): RhythmSuggestion[] {
    const suggestions: RhythmSuggestion[] = [];

    if (density === "Crowded" || density === "Active") {
        suggestions.push({
            label: "Add silence",
            action: "Mute every other short note for one pass. Keep the notes that define the hook.",
        });
    } else {
        suggestions.push({
            label: "Add a pickup",
            action: "Place one short note before the next downbeat so the phrase points into the following section.",
        });
    }

    suggestions.push({
        label: "Delay the answer",
        action: "Copy the phrase, then move the reply one beat later. This creates space without changing the notes.",
    });

    if (subdivision.includes("Sixteenth")) {
        suggestions.push({
            label: "Relax the subdivision",
            action: "Convert some sixteenth note motion into eighth notes or held tones.",
        });
    } else {
        suggestions.push({
            label: "Alter the subdivision",
            action: "Try one pass with eighth note motion, then one pass with triplet motion. Keep whichever feels less square.",
        });
    }

    if (syncopation.count === 0) {
        suggestions.push({
            label: "Add one offbeat",
            action: "Move one nonessential note halfway between beats. One syncopation is often enough.",
        });
    }

    if (!hasAnswerSpace) {
        suggestions.push({
            label: "Make the ending breathe",
            action: "Remove the last note or lengthen it so the next phrase has a clear entrance.",
        });
    }

    return suggestions.slice(0, 4);
}

export function buildRhythmPhrasingData(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    clipName = "Current clip",
): RhythmPhrasingData {
    const active = notes.slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    const starts = uniqueSorted(active.map(note => note.start), 0.001);
    const gap = smallestGap(starts);
    const subdivision = subdivisionLabel(gap);
    const barCount = Math.max(1, Math.ceil((rangeEnd - rangeStart) / 4));
    const barCounts = notesPerBar(active, rangeStart, barCount);
    const density = densitySummary(barCounts);
    const syncopation = syncopationSummary(starts);
    const feel = timingFeel(starts);
    const hasAnswerSpace = lastQuarterIsEmpty(active, rangeStart, rangeEnd);

    const metrics: RhythmMetric[] = [
        {
            label: "Pulse And Meter",
            value: "Four beat bar reference",
            detail: "Ableton clips are read against the beat grid, so bar position is the main listening frame.",
        },
        {
            label: "Subdivision",
            value: subdivision,
            detail: gap === null
                ? "The clip has few separate attacks, so duration matters more than fast rhythm."
                : `The smallest repeated spacing is about ${round(gap)} beats.`,
        },
        {
            label: "Syncopation",
            value: syncopation.value,
            detail: `${syncopation.count} onset${syncopation.count === 1 ? "" : "s"} land away from the strongest beat divisions.`,
        },
        {
            label: "Groove Feel",
            value: feel,
            detail: "This compares note starts to straight sixteenth and eighth positions.",
        },
        {
            label: "Phrase Density",
            value: density,
            detail: `Notes per bar: ${barCounts.join(", ")}.`,
        },
    ];

    const findings = buildFindings(active, rangeStart, rangeEnd, starts, barCounts);
    const suggestions = buildSuggestions(density, subdivision, syncopation, hasAnswerSpace);

    return {
        clipName,
        rangeLabel: `${beatLabel(rangeStart)} to ${beatLabel(rangeEnd)}`,
        noteCount: active.length,
        summary: `${clipName} has ${density.toLowerCase()} phrase density with ${subdivision.toLowerCase()} and ${syncopation.value.toLowerCase()}.`,
        metrics,
        findings,
        suggestions,
    };
}
