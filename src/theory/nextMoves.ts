import type { TimelineAnalysis, TimedNote } from "./timeline.js";

export type LikedMaterialId = "progression" | "melody" | "bassline" | "rhythm" | "texture" | "full_clip";

export interface NextSectionJob {
    label: string;
    reason: string;
}

export interface LikedMaterialPlan {
    id: LikedMaterialId;
    label: string;
    summary: string;
    keep: string;
    change: string;
    jobs: NextSectionJob[];
    prompts: string[];
}

export interface GuidedNextMoveData {
    analyzed: boolean;
    clipName: string;
    keyLabel: string | null;
    rangeLabel: string | null;
    noteCount: number;
    intro: string;
    plans: LikedMaterialPlan[];
}

function beatLabel(beat: number): string {
    return `${Math.floor(beat / 4) + 1}.${Math.floor(beat % 4) + 1}`;
}

function uniqueOrdered<T>(items: readonly T[]): T[] {
    const seen = new Set<T>();
    const out: T[] = [];
    for (const item of items) {
        if (item === null || item === undefined || seen.has(item)) continue;
        seen.add(item);
        out.push(item);
    }
    return out;
}

function listJoin(items: readonly string[], fallback: string, maxShown = 6): string {
    if (!items.length) return fallback;
    const shown = items.slice(0, maxShown).join(" to ");
    return items.length > maxShown ? `${shown}, then more` : shown;
}

function chordPath(analysis: TimelineAnalysis | null): string {
    if (!analysis) return "your current chord loop";
    return listJoin(
        uniqueOrdered(analysis.segments.map(segment => segment.chordName).filter(Boolean) as string[]),
        "the implied harmony",
    );
}

function mainRhythm(notes: readonly TimedNote[] | null): string {
    if (!notes || !notes.length) return "the main rhythm";
    const starts = uniqueOrdered(notes.map(note => Math.round(note.start * 4) / 4)).sort((a, b) => a - b);
    if (starts.length <= 2) return "a sparse rhythm with lots of space";
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
        gaps.push((starts[i] ?? 0) - (starts[i - 1] ?? 0));
    }
    const smallestGap = Math.min(...gaps.filter(gap => gap > 1e-9));
    if (smallestGap <= 0.26) return "a busy rhythm with sixteenth note detail";
    if (smallestGap <= 0.51) return "a steady eighth note rhythm";
    return "a slow rhythm with quarter note space";
}

function rangeText(notes: readonly TimedNote[] | null): string {
    if (!notes || !notes.length) return "the current register";
    const pitches = notes.map(note => note.pitch);
    const low = Math.min(...pitches);
    const high = Math.max(...pitches);
    const span = high - low;
    if (span <= 7) return "a narrow register";
    if (span <= 19) return "a medium register span";
    return "a wide register span";
}

function bassShape(notes: readonly TimedNote[] | null): string {
    if (!notes || !notes.length) return "the bass movement";
    const lowNotes = notes
        .slice()
        .sort((a, b) => a.start - b.start || a.pitch - b.pitch)
        .filter((note, idx, sorted) => idx === 0 || Math.abs(note.start - (sorted[idx - 1]?.start ?? note.start)) > 1e-6)
        .map(note => note.pitch);
    const uniqueBass = uniqueOrdered(lowNotes.map(pitch => pitch % 12));
    if (uniqueBass.length <= 1) return "a pedal or repeated root";
    if (uniqueBass.length <= 3) return "a compact bass movement";
    return "an active bass path";
}

function genericPlans(): LikedMaterialPlan[] {
    return buildPlans(null, null);
}

function buildPlans(analysis: TimelineAnalysis | null, notes: readonly TimedNote[] | null): LikedMaterialPlan[] {
    const chords = chordPath(analysis);
    const rhythm = mainRhythm(notes);
    const register = rangeText(notes);
    const bass = bassShape(notes);
    const key = analysis?.key.label ?? "the same key";
    const ending = analysis?.resolutionSuggestions.length
        ? analysis.resolutionSuggestions.map(item => item.label.replace(/->/g, "to")).join(", ")
        : "a clear return to the main idea";

    return [
        {
            id: "progression",
            label: "Progression",
            summary: `The harmonic identity is ${chords}.`,
            keep: "Keep the chord order or the first two chords.",
            change: "Change rhythm, register, density, or starting point.",
            jobs: [
                { label: "Continuation", reason: "Use the same chords with a new surface so the song keeps moving." },
                { label: "Lift", reason: "Move the voicing higher or add chord tones above the main loop." },
                { label: "Contrast", reason: "Start the same chords from a different point or thin the loop down." },
            ],
            prompts: [
                `Keep ${chords}, but make the next section lighter with fewer notes and more space.`,
                `Keep the harmonic DNA in ${key}, but start from the second chord and write an answer section.`,
                `Use ${chords} as pads, then write a new bass rhythm underneath.`,
            ],
        },
        {
            id: "melody",
            label: "Melody",
            summary: `The melodic material sits in ${register}.`,
            keep: "Keep the contour, rhythm, or last note of the phrase.",
            change: "Move the answer higher, lower, shorter, or more spacious.",
            jobs: [
                { label: "Answer", reason: "A second phrase can reply to the first without becoming a new song." },
                { label: "Lift", reason: "A higher answer often reads as chorus energy." },
                { label: "Reset", reason: "A lower and simpler answer can prepare a new verse." },
            ],
            prompts: [
                "Keep the rhythm of the melody, but reverse the contour for the answer phrase.",
                "Keep the final target note, but approach it from a higher register.",
                "Make the next melody shorter and leave the last beat empty.",
            ],
        },
        {
            id: "bassline",
            label: "Bassline",
            summary: `The low end suggests ${bass}.`,
            keep: "Keep the root targets or the strongest landing points.",
            change: "Change octave, rhythm, passing tones, or how often the bass moves.",
            jobs: [
                { label: "Ground", reason: "Simpler bass can make a verse feel settled." },
                { label: "Build", reason: "More bass motion can push toward a chorus, drop, or arrival." },
                { label: "Surprise", reason: "Holding one bass note under changing chords creates pressure." },
            ],
            prompts: [
                "Keep the chord targets, but make the bass move half as often.",
                "Keep the bass rhythm, but move one landing note to a different chord tone.",
                "Hold the first bass note longer while the harmony changes above it.",
            ],
        },
        {
            id: "rhythm",
            label: "Rhythm",
            summary: `The timing reads as ${rhythm}.`,
            keep: "Keep the groove, accent pattern, or phrase spacing.",
            change: "Change notes, voicing, rests, or subdivision.",
            jobs: [
                { label: "Continuation", reason: "Same rhythm with new notes feels related immediately." },
                { label: "Release", reason: "Longer notes and bigger rests lower the pressure." },
                { label: "Build", reason: "Shorter subdivisions and repeated entries raise expectation." },
            ],
            prompts: [
                "Keep the rhythm exactly, but assign it to a new chord tone pattern.",
                "Keep the first half of the rhythm, then answer with more space.",
                "Move the rhythm later by one beat so the next section feels delayed.",
            ],
        },
        {
            id: "texture",
            label: "Texture",
            summary: `The surface depends on ${register} and ${analysis?.trackNames.length ?? 1} layer${(analysis?.trackNames.length ?? 1) === 1 ? "" : "s"}.`,
            keep: "Keep the notes or chord identity.",
            change: "Change sound, octave, width, envelope, filter, or number of layers.",
            jobs: [
                { label: "Open Up", reason: "Wider or brighter sound can make the same material feel larger." },
                { label: "Thin Out", reason: "Removing layers creates verse space without losing identity." },
                { label: "Reveal", reason: "Automation can make a held idea feel like it is developing." },
            ],
            prompts: [
                "Keep the notes, but move one layer up an octave and soften the attack.",
                "Keep the same rhythm, but replace the sound with a thinner texture.",
                "Keep the harmony static, but automate brightness over eight bars.",
            ],
        },
        {
            id: "full_clip",
            label: "Full Clip",
            summary: "Treat the whole clip as the seed.",
            keep: "Keep the identity: key, groove, hook, or density shape.",
            change: "Change one major dimension and one minor detail.",
            jobs: [
                { label: "Contrast", reason: "A B section works when it keeps identity but changes role." },
                { label: "Reset", reason: "A smaller version makes the original feel stronger when it returns." },
                { label: "Payoff", reason: "A bigger version can become the chorus or drop." },
            ],
            prompts: [
                "Duplicate the clip. Version one removes half the notes. Version two raises the top line. Version three changes only the bass rhythm.",
                `Make a B section that ends with ${ending}.`,
                "Arrange A, B, A. If A feels better after B, keep B.",
            ],
        },
    ];
}

export function buildGuidedNextMoveData(
    analysis: TimelineAnalysis | null = null,
    notes: readonly TimedNote[] | null = null,
    clipName = "Current idea",
): GuidedNextMoveData {
    return {
        analyzed: !!analysis,
        clipName,
        keyLabel: analysis?.key.label ?? null,
        rangeLabel: analysis ? `${beatLabel(analysis.rangeStart)} to ${beatLabel(analysis.rangeEnd)}` : null,
        noteCount: analysis?.noteCount ?? notes?.length ?? 0,
        intro: analysis
            ? "Pick the part you like most. The prompts will keep that identity while changing the next section enough to move forward."
            : "Pick the part you like most. The prompts below are generic until you open this from a MIDI clip.",
        plans: analysis ? buildPlans(analysis, notes ?? []) : genericPlans(),
    };
}
