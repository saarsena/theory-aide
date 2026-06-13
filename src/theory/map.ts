import type { TimelineAnalysis, TimedNote } from "./timeline.js";

export interface MapPoint {
    x: number;
    y: number;
    label?: string;
}

export interface DensityBlock {
    start: number;
    end: number;
    value: number;
}

export interface MapNote {
    start: number;
    end: number;
    pitch: number;
    track: string;
}

export interface VoicingProfilePoint {
    x: number;
    low: number;
    high: number;
    center: number;
    density: number;
}

export interface MotionProfileBlock {
    start: number;
    end: number;
    energy: number;
    attacks: number;
    pitchMotion: number;
    velocity: number;
    densityChange: number;
}

export interface MapProgressionNode {
    start: number;
    end: number;
    label: string;
    roman: string;
    tension: number;
    fn: string | null;
}

export interface CompositionMapData {
    title: string;
    rangeStart: number;
    rangeEnd: number;
    keyLabel: string;
    lowPitch: number;
    highPitch: number;
    density: DensityBlock[];
    tension: MapPoint[];
    notes: MapNote[];
    voicingProfile: VoicingProfilePoint[];
    motionProfile: MotionProfileBlock[];
    rhythmHits: MapPoint[];
    progression: MapProgressionNode[];
}

function uniqueSorted(values: readonly number[]): number[] {
    return [...new Set(values.map(value => Math.round(value * 1000) / 1000))]
        .sort((a, b) => a - b);
}

function densityBetween(notes: readonly TimedNote[], start: number, end: number): number {
    const mid = start + (end - start) / 2;
    return notes.filter(note => note.start <= mid + 1e-6 && note.end > mid + 1e-6).length;
}

function rhythmStrength(start: number): number {
    const pos = ((start % 4) + 4) % 4;
    if (Math.abs(pos) <= 0.04) return 1;
    if (Math.abs(pos - Math.round(pos)) <= 0.04) return 0.75;
    if (Math.abs((pos % 1) - 0.5) <= 0.04) return 0.5;
    return 0.3;
}

function soundingPitches(notes: readonly TimedNote[], time: number): number[] {
    return notes
        .filter(note => note.start <= time + 1e-6 && note.end > time + 1e-6)
        .map(note => note.pitch)
        .sort((a, b) => a - b);
}

function average(values: readonly number[]): number {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function motionBlocks(
    notes: readonly TimedNote[],
    rangeStart: number,
    rangeEnd: number,
): MotionProfileBlock[] {
    const out: MotionProfileBlock[] = [];
    const step = 1;
    let previousDensity = densityBetween(notes, rangeStart, Math.min(rangeStart + step, rangeEnd));

    for (let start = rangeStart; start < rangeEnd - 1e-6; start += step) {
        const end = Math.min(start + step, rangeEnd);
        const windowNotes = notes.filter(note => note.start >= start - 1e-6 && note.start < end - 1e-6);
        const ordered = windowNotes.slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);
        const attacks = ordered.length;
        const pitchMotion = ordered.slice(1).reduce(
            (sum, note, idx) => sum + Math.abs(note.pitch - (ordered[idx]?.pitch ?? note.pitch)),
            0,
        );
        const velocity = average(ordered.map(note => note.velocity));
        const density = densityBetween(notes, start, end);
        const densityChange = Math.abs(density - previousDensity);
        previousDensity = density;

        const energy = Math.min(100,
            attacks * 8 +
            Math.min(28, pitchMotion * 1.4) +
            Math.min(20, velocity / 6) +
            densityChange * 10);

        out.push({ start, end, energy, attacks, pitchMotion, velocity, densityChange });
    }

    return out;
}

export function buildCompositionMapData(
    analysis: TimelineAnalysis,
    notes: readonly TimedNote[],
    title = "Composition Map",
): CompositionMapData {
    const active = notes.slice().sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    const pitches = active.map(note => note.pitch);
    const lowPitch = pitches.length ? Math.min(...pitches) : 48;
    const highPitch = pitches.length ? Math.max(...pitches) : 72;
    const densityTimes = uniqueSorted([
        analysis.rangeStart,
        analysis.rangeEnd,
        ...active.flatMap(note => [note.start, note.end]),
    ]).filter(time => time >= analysis.rangeStart && time <= analysis.rangeEnd);

    const density = densityTimes.slice(0, -1).map((time, idx) => {
        const end = densityTimes[idx + 1] ?? time;
        return {
            start: time,
            end,
            value: densityBetween(active, time, end),
        };
    }).filter(block => block.end > block.start);

    const tension = analysis.segments.map(segment => ({
        x: segment.start + (segment.end - segment.start) / 2,
        y: segment.tension,
        label: segment.chordName ?? "No chord",
    }));

    const voicingProfile = densityTimes.map(time => {
        const pitchesAtTime = soundingPitches(active, time);
        const low = pitchesAtTime.length ? Math.min(...pitchesAtTime) : lowPitch;
        const high = pitchesAtTime.length ? Math.max(...pitchesAtTime) : lowPitch;
        return {
            x: time,
            low,
            high,
            center: pitchesAtTime.length
                ? pitchesAtTime.reduce((sum, pitch) => sum + pitch, 0) / pitchesAtTime.length
                : lowPitch,
            density: pitchesAtTime.length,
        };
    });

    const rhythmHits = uniqueSorted(active.map(note => note.start))
        .map(start => ({
            x: start,
            y: rhythmStrength(start),
        }));

    return {
        title,
        rangeStart: analysis.rangeStart,
        rangeEnd: analysis.rangeEnd,
        keyLabel: analysis.key.label,
        lowPitch,
        highPitch,
        density,
        tension,
        notes: active.map(note => ({
            start: note.start,
            end: note.end,
            pitch: note.pitch,
            track: note.track,
        })),
        voicingProfile,
        motionProfile: motionBlocks(active, analysis.rangeStart, analysis.rangeEnd),
        rhythmHits,
        progression: analysis.segments
            .filter(segment => !!segment.chordName)
            .map(segment => ({
                start: segment.start,
                end: segment.end,
                label: segment.chordName ?? "No chord",
                roman: segment.roman?.label ?? "",
                tension: segment.tension,
                fn: segment.fn,
            })),
    };
}
