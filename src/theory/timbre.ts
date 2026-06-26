import type { TimedNote } from "./timeline.js";

export interface TimbreBand {
    label: string;
    count: number;
    detail: string;
}

export interface TimbreTextureData {
    clipName: string;
    rangeLabel: string;
    summary: string;
    bands: TimbreBand[];
    checklist: string[];
    suggestions: string[];
}

function beatLabel(beat: number): string {
    return `${Math.floor(beat / 4) + 1}.${Math.floor(beat % 4) + 1}`;
}

function average(values: readonly number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function velocityText(notes: readonly TimedNote[]): string {
    if (!notes.length) return "No velocity data";
    const values = notes.map(note => note.velocity);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? `static velocity at ${min}` : `velocity range ${min} to ${max}`;
}

export function buildTimbreTextureData(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
    clipName = "Current clip",
): TimbreTextureData {
    const low = notes.filter(note => note.pitch < 48).length;
    const lowMid = notes.filter(note => note.pitch >= 48 && note.pitch < 60).length;
    const mid = notes.filter(note => note.pitch >= 60 && note.pitch < 72).length;
    const high = notes.filter(note => note.pitch >= 72).length;
    const avgVelocity = average(notes.map(note => note.velocity));
    const activeBands = [low, lowMid, mid, high].filter(count => count > 0).length;
    const crowdedMiddle = lowMid + mid >= Math.max(6, notes.length * 0.7);

    return {
        clipName,
        rangeLabel: `${beatLabel(rangeStart)} to ${beatLabel(rangeEnd)}`,
        summary: `${clipName} uses ${activeBands} register band${activeBands === 1 ? "" : "s"} with ${velocityText(notes)}.`,
        bands: [
            { label: "Bass", count: low, detail: "Below C3. Keep this area simple unless the sound is very thin." },
            { label: "Low Mid", count: lowMid, detail: "C3 to B3. This area can become cloudy when several parts stack." },
            { label: "Mid And Presence", count: mid, detail: "C4 to B4. Hooks, chords, and vocals often compete here." },
            { label: "High Air", count: high, detail: "C5 and above. Useful for lift, sparkle, and perceived width." },
        ],
        checklist: [
            crowdedMiddle
                ? "The middle register is carrying most of the material. Move one part up, down, or out."
                : "The register spread leaves usable space for another layer.",
            avgVelocity > 105
                ? "Velocities are loud on average. Save some headroom for the next section."
                : "Velocity leaves room for a later lift.",
            "Give the bass, chord body, hook, and texture separate jobs before adding another part.",
            "If two parts live in the same register, separate them by rhythm, envelope, brightness, or stereo width.",
        ],
        suggestions: [
            "Open a filter across four or eight bars to make one held idea feel like development.",
            "Shorten the envelope for a verse, then lengthen or widen it for the chorus.",
            "Thin the low mids before adding another bass or pad layer.",
            "Brighten the top layer while keeping the harmony still for a controlled build.",
        ],
    };
}
