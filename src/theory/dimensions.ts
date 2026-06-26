import type { TimelineAnalysis, TimedNote } from "./timeline.js";

export type CompositionDimensionId = "vertical" | "horizontal" | "macro" | "spectral";
export type ChangeFocus = "harmony" | "rhythm" | "form" | "texture" | "density" | "dynamics";

export interface DimensionCard {
    id: CompositionDimensionId;
    title: string;
    headline: string;
    observations: string[];
    nextMove: string;
}

export interface CompositionDimensionsData {
    keyLabel: string;
    rangeLabel: string;
    noteCount: number;
    trackCount: number;
    primaryChange: ChangeFocus;
    primaryChangeReason: string;
    summary: string;
    dimensions: DimensionCard[];
}

function beatLabel(beat: number): string {
    return `${Math.floor(beat / 4) + 1}.${Math.floor(beat % 4) + 1}`;
}

function rounded(value: number, places = 1): number {
    const scale = 10 ** places;
    return Math.round(value * scale) / scale;
}

function average(values: readonly number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function uniqueCount<T>(values: readonly T[]): number {
    return new Set(values.filter(value => value !== null && value !== undefined)).size;
}

function functionMix(analysis: TimelineAnalysis): string {
    const counts = new Map<string, number>();
    for (const segment of analysis.segments) {
        if (!segment.fn) continue;
        counts.set(segment.fn, (counts.get(segment.fn) ?? 0) + 1);
    }
    if (!counts.size) return "Function is unclear.";
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `${name} ${count}`)
        .join(", ");
}

function harmonicHeadline(chordCount: number, avgDensity: number): string {
    const colorText = chordCount === 1
        ? "1 harmonic color"
        : `${chordCount} harmonic colors`;
    const densityText = avgDensity <= 1.5
        ? "thin voicing"
        : avgDensity <= 3
            ? "moderate voicing"
            : "dense voicing";
    return `${colorText}, ${densityText}`;
}

function pitchName(pitch: number): string {
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    // Ableton labels middle C (MIDI 60) as C3, so subtract 2.
    return `${names[((pitch % 12) + 12) % 12]}${Math.floor(pitch / 12) - 2}`;
}

function registerSummary(notes: readonly TimedNote[]): string {
    if (!notes.length) return "No register information.";
    const pitches = notes.map(note => note.pitch);
    const low = Math.min(...pitches);
    const high = Math.max(...pitches);
    return `${pitchName(low)} to ${pitchName(high)}, span ${high - low} semitones`;
}

function onsetSummary(notes: readonly TimedNote[]): string {
    if (!notes.length) return "No rhythm information.";
    const starts = notes.map(note => note.start);
    const startsPerBeat = new Map<number, number>();
    for (const start of starts) {
        const bucket = Math.round(start * 4) / 4;
        startsPerBeat.set(bucket, (startsPerBeat.get(bucket) ?? 0) + 1);
    }
    const densest = [...startsPerBeat.entries()].sort((a, b) => b[1] - a[1])[0];
    const smallestGap = starts
        .slice()
        .sort((a, b) => a - b)
        .reduce<number | null>((min, start, idx, sorted) => {
            if (idx === 0) return min;
            const gap = start - (sorted[idx - 1] ?? start);
            if (gap <= 1e-9) return min;
            return min === null ? gap : Math.min(min, gap);
        }, null);
    const subdivision = smallestGap === null
        ? "mostly sustained"
        : smallestGap <= 0.26
            ? "active phrase with sixteenth note detail"
            : smallestGap <= 0.51
                ? "steady phrase with eighth note detail"
                : "slow moving phrase, mostly quarter notes or longer";
    return densest
        ? `${subdivision}, busiest point near ${beatLabel(densest[0])}`
        : subdivision;
}

function velocitySummary(notes: readonly TimedNote[]): { text: string; spread: number } {
    if (!notes.length) return { text: "No velocity information.", spread: 0 };
    const velocities = notes.map(note => note.velocity);
    const min = Math.min(...velocities);
    const max = Math.max(...velocities);
    if (min === max) return { text: `Static velocity at ${min}`, spread: 0 };
    return { text: `${min} to ${max}`, spread: max - min };
}

function chordPath(chordNames: readonly string[]): string {
    if (!chordNames.length) return "No clear chord path.";
    const maxShown = 8;
    const shown = chordNames.slice(0, maxShown).join(" to ");
    return chordNames.length > maxShown
        ? `Chord path starts ${shown}, then continues.`
        : `Chord path: ${shown}.`;
}

function progressionHeadline(analysis: TimelineAnalysis): string {
    if (analysis.progressions.length) {
        return analysis.progressions.map(progression => progression.pattern).join(", ");
    }
    const rc = analysis.rangeComparison;
    if (!rc) return "Form is still open";
    if (rc.second.energy !== rc.first.energy) {
        return `Energy moves from ${rc.first.energy} to ${rc.second.energy}`;
    }
    if (rc.second.averageDensity !== rc.first.averageDensity) {
        return rc.second.averageDensity > rc.first.averageDensity
            ? "Second half gets denser"
            : "Second half opens up";
    }
    return "No named progression";
}

function macroObservations(analysis: TimelineAnalysis): string[] {
    const observations: string[] = [];
    const rc = analysis.rangeComparison;

    if (!rc) {
        observations.push("The selected range is short, so large form is still open.");
    } else {
        if (rc.first.impliedKey && rc.second.impliedKey && rc.first.impliedKey !== rc.second.impliedKey) {
            observations.push(
                `The first half leans toward ${rc.first.impliedKey}; the second half leans toward ${rc.second.impliedKey}. Treat that as color, not a required key change.`,
            );
        } else if (rc.first.impliedKey && rc.second.impliedKey) {
            observations.push(`Both halves stay near ${rc.first.impliedKey}.`);
        }

        const tensionDelta = rc.second.averageTension - rc.first.averageTension;
        if (Math.abs(tensionDelta) >= 10) {
            observations.push(tensionDelta > 0
                ? "The second half raises tension."
                : "The second half releases tension.");
        } else {
            observations.push("Both halves carry similar tension.");
        }

        const densityDelta = rc.second.averageDensity - rc.first.averageDensity;
        if (Math.abs(densityDelta) >= 1) {
            observations.push(densityDelta > 0
                ? "The second half gets denser."
                : "The second half opens up.");
        }

        if (rc.second.secondaryCount > rc.first.secondaryCount) {
            observations.push("The second half adds more applied dominant motion.");
        }
    }

    observations.push(analysis.modalColors.length
        ? `Modal color present: ${analysis.modalColors.map(color => `${color.mode} ${color.note}`).join(", ")}.`
        : "No strong modal color was detected.");
    observations.push(`Key frame: ${analysis.key.label} from ${analysis.key.source}.`);
    return observations;
}

function changeScores(analysis: TimelineAnalysis, notes: readonly TimedNote[]): Record<ChangeFocus, number> {
    const segments = analysis.segments;
    const chordCount = uniqueCount(segments.map(segment => segment.chordName));
    const fnCount = uniqueCount(segments.map(segment => segment.fn));
    const averageDensity = average(segments.map(segment => segment.density));
    const densitySpread = segments.length
        ? Math.max(...segments.map(segment => segment.density)) - Math.min(...segments.map(segment => segment.density))
        : 0;
    const tensionSpread = segments.length
        ? Math.max(...segments.map(segment => segment.tension)) - Math.min(...segments.map(segment => segment.tension))
        : 0;
    const startBuckets = uniqueCount(notes.map(note => Math.round(note.start * 4) / 4));
    const velocity = velocitySummary(notes);

    return {
        harmony: chordCount * 2 + fnCount + analysis.progressions.length * 2 + analysis.modalColors.length,
        rhythm: Math.min(12, startBuckets / Math.max(1, analysis.rangeEnd - analysis.rangeStart)) + (notes.length > segments.length * 3 ? 2 : 0),
        form: analysis.rangeComparison ? analysis.rangeComparison.observations.length * 2 : 1,
        texture: analysis.trackNames.length * 2 + Math.min(6, averageDensity),
        density: densitySpread * 2 + Math.min(6, averageDensity) + tensionSpread / 20,
        dynamics: velocity.spread / 10,
    };
}

function strongestChange(scores: Record<ChangeFocus, number>): ChangeFocus {
    return (Object.entries(scores) as Array<[ChangeFocus, number]>)
        .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "harmony";
}

function changeReason(focus: ChangeFocus, scores: Record<ChangeFocus, number>): string {
    const reason: Record<ChangeFocus, string> = {
        harmony: "Harmony is doing most of the storytelling here: the chord path, function, or modal color changes more than the other dimensions.",
        rhythm: "Rhythm is doing most of the storytelling here: the note starts and phrase spacing create the clearest motion.",
        form: "Form is doing most of the storytelling here: the first half and second half behave like different section roles.",
        texture: "Texture is doing most of the storytelling here: the track layering, register, or pitch spread defines the sound.",
        density: "Density is doing most of the storytelling here: the amount of simultaneous material changes across the range.",
        dynamics: "Dynamics are doing most of the storytelling here: velocity contrast is the most active change.",
    };
    return reason[focus];
}

export function buildCompositionDimensionsData(
    analysis: TimelineAnalysis,
    notes: readonly TimedNote[],
): CompositionDimensionsData {
    const segments = analysis.segments;
    const avgTension = rounded(average(segments.map(segment => segment.tension)));
    const avgDensity = rounded(average(segments.map(segment => segment.density)));
    const peakDensity = segments.length ? Math.max(...segments.map(segment => segment.density)) : 0;
    const warningCount = segments.reduce(
        (sum, segment) => sum + segment.outliers.filter(outlier => outlier.severity === "warn").length,
        0,
    );
    const chordNames = segments.map(segment => segment.chordName).filter(Boolean) as string[];
    const velocity = velocitySummary(notes);
    const scores = changeScores(analysis, notes);
    const primaryChange = strongestChange(scores);
    const progressionText = progressionHeadline(analysis);
    const rangeText = `${beatLabel(analysis.rangeStart)} to ${beatLabel(analysis.rangeEnd)}`;

    const dimensions: DimensionCard[] = [
        {
            id: "vertical",
            title: "Vertical Axis",
            headline: harmonicHeadline(uniqueCount(chordNames), avgDensity),
            observations: [
                chordPath(chordNames),
                `Function mix: ${functionMix(analysis)}.`,
                warningCount
                    ? `${warningCount} hard clash warning${warningCount === 1 ? "" : "s"} need attention.`
                    : "No hard clash warnings.",
            ],
            nextMove: peakDensity >= 5
                ? "Open the voicing. Move one or two upper notes up an octave, or simplify the bass to roots."
                : "Add contrast by changing register or inversion while keeping the same chord path.",
        },
        {
            id: "horizontal",
            title: "Horizontal Axis",
            headline: onsetSummary(notes),
            observations: [
                `${notes.length} notes over ${rounded(analysis.rangeEnd - analysis.rangeStart)} beats.`,
                `Average tension is ${avgTension} out of 100.`,
                analysis.resolutionSuggestions.length
                    ? `Ending wants motion: ${analysis.resolutionSuggestions.map(item => item.label.replace(/->/g, "to")).join(", ")}.`
                    : "The ending does not strongly demand a stock resolution.",
            ],
            nextMove: "Keep the notes, then rewrite only the rhythm. Try longer rests, a later entry, or a simpler first half.",
        },
        {
            id: "macro",
            title: "Macro Architecture",
            headline: progressionText,
            observations: macroObservations(analysis),
            nextMove: "Duplicate the idea and make a B section that changes one job: lift, release, contrast, reset, or build.",
        },
        {
            id: "spectral",
            title: "Spectral Dimension",
            headline: registerSummary(notes),
            observations: [
                `${analysis.trackNames.length} contributing track${analysis.trackNames.length === 1 ? "" : "s"}: ${analysis.trackNames.join(", ")}.`,
                `${velocity.text}.`,
                `Peak pitch density is ${peakDensity} distinct notes at once.`,
            ],
            nextMove: peakDensity >= 5
                ? "Thin one layer or move it to another octave so the bass, mids, and top line each have their own space."
                : "Create motion with sound design: open a filter, widen a pad, shorten an envelope, or brighten the top layer.",
        },
    ];

    return {
        keyLabel: analysis.key.label,
        rangeLabel: rangeText,
        noteCount: analysis.noteCount,
        trackCount: analysis.trackNames.length,
        primaryChange,
        primaryChangeReason: changeReason(primaryChange, scores),
        summary: `This selection is mostly changing ${primaryChange}. Use the cards below to choose the next compositional move without replacing the idea.`,
        dimensions,
    };
}
