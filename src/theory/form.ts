import type { TimelineAnalysis, TimedNote } from "./timeline.js";

export interface FormTemplate {
    name: string;
    role: string;
    move: string;
}

export interface FormComparison {
    label: string;
    detail: string;
}

export interface ArrangementFormData {
    rangeLabel: string;
    summary: string;
    templates: FormTemplate[];
    comparison: FormComparison[];
    suggestions: string[];
}

function beatLabel(beat: number): string {
    return `${Math.floor(beat / 4) + 1}.${Math.floor(beat % 4) + 1}`;
}

function average(values: readonly number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rounded(value: number, places = 1): number {
    const scale = 10 ** places;
    return Math.round(value * scale) / scale;
}

function pitchAverage(notes: readonly TimedNote[]): number {
    return average(notes.map(note => note.pitch));
}

function notesInRange(notes: readonly TimedNote[], start: number, end: number): TimedNote[] {
    return notes.filter(note => note.start < end && note.end > start);
}

export function buildArrangementFormData(
    analysis: TimelineAnalysis,
    notes: readonly TimedNote[],
): ArrangementFormData {
    const mid = analysis.rangeStart + (analysis.rangeEnd - analysis.rangeStart) / 2;
    const firstNotes = notesInRange(notes, analysis.rangeStart, mid);
    const secondNotes = notesInRange(notes, mid, analysis.rangeEnd);
    const firstDensity = average(analysis.segments.filter(segment => segment.start < mid).map(segment => segment.density));
    const secondDensity = average(analysis.segments.filter(segment => segment.start >= mid).map(segment => segment.density));
    const firstTension = average(analysis.segments.filter(segment => segment.start < mid).map(segment => segment.tension));
    const secondTension = average(analysis.segments.filter(segment => segment.start >= mid).map(segment => segment.tension));
    const registerDelta = pitchAverage(secondNotes) - pitchAverage(firstNotes);
    const densityDelta = secondDensity - firstDensity;
    const tensionDelta = secondTension - firstTension;

    const comparison: FormComparison[] = [
        {
            label: "Harmony",
            detail: analysis.progressions.length
                ? `Named motion detected: ${analysis.progressions.map(item => item.pattern).join(", ")}.`
                : "No named progression dominates the selected range.",
        },
        {
            label: "Rhythm And Density",
            detail: Math.abs(densityDelta) >= 1
                ? `The second half ${densityDelta > 0 ? "gets denser" : "opens up"} by ${rounded(Math.abs(densityDelta))} notes at once.`
                : "Both halves have similar note density.",
        },
        {
            label: "Register",
            detail: Math.abs(registerDelta) >= 3
                ? `The second half moves ${registerDelta > 0 ? "higher" : "lower"} by about ${rounded(Math.abs(registerDelta))} semitones on average.`
                : "Both halves sit in a similar register.",
        },
        {
            label: "Tension",
            detail: Math.abs(tensionDelta) >= 10
                ? `The second half ${tensionDelta > 0 ? "builds" : "releases"} tension.`
                : "Both halves carry similar tension.",
        },
    ];

    const likelyRole = tensionDelta > 10 || densityDelta > 1
        ? "build or pre chorus"
        : tensionDelta < -10 || densityDelta < -1
            ? "breakdown or verse reset"
            : "continuation or groove section";

    const suggestions = [
        "For a verse, remove one layer and keep the strongest rhythm or bass target.",
        "For a chorus, raise the top register, widen the voicing, and make the downbeats clearer.",
        "For a bridge, keep one recognizable rhythm and change the harmonic color or starting chord.",
        "For a breakdown, strip to bass, one hook fragment, and a quieter texture before rebuilding.",
    ];

    return {
        rangeLabel: `${beatLabel(analysis.rangeStart)} to ${beatLabel(analysis.rangeEnd)}`,
        summary: `This range most naturally reads as ${likelyRole}.`,
        templates: [
            { name: "Intro", role: "Set the world", move: "Start with a thin version of the hook, texture, or pulse." },
            { name: "Verse", role: "Tell the story", move: "Use fewer notes, lower density, and leave room for a lead part." },
            { name: "Pre Chorus", role: "Create need", move: "Increase repetition, dominant pull, register, or subdivision." },
            { name: "Chorus", role: "Pay off", move: "Widen the voicing, clarify the bass, and raise the melodic register." },
            { name: "Bridge", role: "Change perspective", move: "Use a borrowed color, new texture, or relative key center." },
            { name: "Breakdown", role: "Reset the ear", move: "Remove layers and let space become the feature." },
            { name: "Build", role: "Raise expectation", move: "Repeat a small idea while density, brightness, or rhythm increases." },
            { name: "Outro", role: "Let go", move: "Reduce activity and return to the simplest recognizable idea." },
        ],
        comparison,
        suggestions,
    };
}
