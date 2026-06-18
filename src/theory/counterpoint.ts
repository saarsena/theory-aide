// Counterpoint checker: detects parallel/hidden 5ths & octaves, and reports
// motion-type distribution between every pair of MIDI tracks.

import { mod12 } from "./core.js";
import type { TimedNote } from "./timeline.js";

const INTERVAL_NAMES: readonly string[] = [
    "P1","m2","M2","m3","M3","P4","TT","P5","m6","M6","m7","M7",
    "P8","m9","M9","m10","M10","P11","TT+","P12","m13","M13","m14","M14","P15",
];

function ivName(st: number): string {
    return INTERVAL_NAMES[st] ?? `${st}st`;
}

export type MotionType = "parallel" | "similar" | "contrary" | "oblique" | "no_motion";

export interface MotionEvent {
    time:     number;
    duration: number;
    pitchA1: number; pitchA2: number;
    pitchB1: number; pitchB2: number;
    intervalBefore:     number;
    intervalAfter:      number;
    intervalBeforeName: string;
    intervalAfterName:  string;
    motionType:       MotionType;
    isParallelFifth:  boolean;
    isParallelOctave: boolean;
    isParallelUnison: boolean;
    isHiddenFifth:    boolean;
    isHiddenOctave:   boolean;
}

export interface TrackPairSummary {
    trackA: string;
    trackB: string;
    parallelFifths:  MotionEvent[];
    parallelOctaves: MotionEvent[];
    parallelUnisons: MotionEvent[];
    hiddenFifths:    MotionEvent[];
    hiddenOctaves:   MotionEvent[];
    motionCounts: { parallel: number; similar: number; contrary: number; oblique: number; total: number };
    intervalDistribution: { simple: number; name: string; count: number; beats: number }[];
    totalEvents: number;
}

export interface CounterpointData {
    rangeStart: number;
    rangeEnd:   number;
    trackNames: string[];
    pairs:      TrackPairSummary[];
    totals: {
        parallelFifths:  number;
        parallelOctaves: number;
        parallelUnisons: number;
        hiddenFifths:    number;
        hiddenOctaves:   number;
        motionCounts: { parallel: number; similar: number; contrary: number; oblique: number; total: number };
    };
    truncated: boolean;
}

// ── Internal helpers ──────────────────────────────────────────────────

function lowestAt(notes: TimedNote[], t: number): number | null {
    let lowest: number | null = null;
    for (const n of notes) {
        if (n.start <= t && n.end > t) {
            if (lowest === null || n.pitch < lowest) lowest = n.pitch;
        }
    }
    return lowest;
}

const MAX_FLAGGED = 40;

function analyzePair(
    notesA: TimedNote[],
    notesB: TimedNote[],
    trackA: string,
    trackB: string,
    rangeStart: number,
    rangeEnd:   number,
): TrackPairSummary {
    // Collect all note-boundary times within the range
    const times = new Set<number>([rangeStart, rangeEnd]);
    for (const n of [...notesA, ...notesB]) {
        if (n.start > rangeStart && n.start < rangeEnd) times.add(n.start);
        if (n.end   > rangeStart && n.end   < rangeEnd) times.add(n.end);
    }
    const sorted = Array.from(times).sort((a, b) => a - b);

    // Build states: consecutive windows where both voices are sounding a stable note
    interface State { time: number; timeEnd: number; pA: number; pB: number }
    const states: State[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
        const t0 = sorted[i]!;
        const t1 = sorted[i + 1]!;
        const mid = t0 + (t1 - t0) * 0.5;
        const pA = lowestAt(notesA, mid);
        const pB = lowestAt(notesB, mid);
        if (pA === null || pB === null) continue;

        const last = states[states.length - 1];
        if (last && last.pA === pA && last.pB === pB) {
            last.timeEnd = t1;
        } else {
            states.push({ time: t0, timeEnd: t1, pA, pB });
        }
    }

    // Accumulate interval distribution over all states
    const ivDist = new Map<number, { count: number; beats: number }>();
    for (const s of states) {
        const simple = mod12(Math.abs(s.pA - s.pB));
        const e = ivDist.get(simple) ?? { count: 0, beats: 0 };
        e.count++;
        e.beats += s.timeEnd - s.time;
        ivDist.set(simple, e);
    }

    // Analyse motion between consecutive states
    const events: MotionEvent[] = [];
    const MAX_GAP = 0.126; // ~32nd-note tolerance for adjacent notes

    for (let i = 0; i < states.length - 1; i++) {
        const s1 = states[i]!;
        const s2 = states[i + 1]!;
        if (s2.time - s1.timeEnd > MAX_GAP) continue;

        const pA1 = s1.pA, pA2 = s2.pA;
        const pB1 = s1.pB, pB2 = s2.pB;

        const ivBefore = Math.abs(pA1 - pB1);
        const ivAfter  = Math.abs(pA2 - pB2);

        const dirA = Math.sign(pA2 - pA1);
        const dirB = Math.sign(pB2 - pB1);

        let motionType: MotionType;
        if (dirA === 0 && dirB === 0)   motionType = "no_motion";
        else if (dirA === 0 || dirB === 0) motionType = "oblique";
        else if (dirA !== dirB)            motionType = "contrary";
        else if ((pA2 - pA1) === (pB2 - pB1)) motionType = "parallel";
        else                               motionType = "similar";

        const simpleBefore = mod12(ivBefore);
        const simpleAfter  = mod12(ivAfter);
        const sameDir      = dirA !== 0 && dirB !== 0 && dirA === dirB;

        // Upper voice = whichever has the higher pitch in state 2
        const upperLeap = pA2 >= pB2
            ? Math.abs(pA2 - pA1)
            : Math.abs(pB2 - pB1);

        const isParallelFifth  = simpleBefore === 7 && simpleAfter === 7 && sameDir;
        const isParallelOctave = simpleBefore === 0 && ivBefore > 0
                              && simpleAfter  === 0 && ivAfter  > 0 && sameDir;
        const isParallelUnison = ivBefore === 0 && ivAfter === 0 && dirA !== 0;
        const isHiddenFifth    = simpleAfter === 7 && !isParallelFifth  && sameDir && upperLeap > 2;
        const isHiddenOctave   = simpleAfter === 0 && ivAfter > 0
                              && !isParallelOctave && sameDir && upperLeap > 2;

        events.push({
            time: s2.time,
            duration: s2.timeEnd - s2.time,
            pitchA1: pA1, pitchA2: pA2,
            pitchB1: pB1, pitchB2: pB2,
            intervalBefore: ivBefore, intervalAfter: ivAfter,
            intervalBeforeName: ivName(ivBefore),
            intervalAfterName:  ivName(ivAfter),
            motionType,
            isParallelFifth, isParallelOctave, isParallelUnison,
            isHiddenFifth, isHiddenOctave,
        });
    }

    const motionCounts = { parallel: 0, similar: 0, contrary: 0, oblique: 0, total: 0 };
    for (const e of events) {
        if (e.motionType === "no_motion") continue;
        motionCounts.total++;
        if (e.motionType === "parallel") motionCounts.parallel++;
        else if (e.motionType === "similar")  motionCounts.similar++;
        else if (e.motionType === "contrary") motionCounts.contrary++;
        else if (e.motionType === "oblique")  motionCounts.oblique++;
    }

    const take = (arr: MotionEvent[]) => arr.slice(0, MAX_FLAGGED);

    return {
        trackA, trackB,
        parallelFifths:  take(events.filter(e => e.isParallelFifth)),
        parallelOctaves: take(events.filter(e => e.isParallelOctave)),
        parallelUnisons: take(events.filter(e => e.isParallelUnison)),
        hiddenFifths:    take(events.filter(e => e.isHiddenFifth)),
        hiddenOctaves:   take(events.filter(e => e.isHiddenOctave)),
        motionCounts,
        intervalDistribution: Array.from(ivDist.entries())
            .map(([simple, { count, beats }]) => ({
                simple, name: INTERVAL_NAMES[simple] ?? `${simple}st`,
                count, beats: Math.round(beats * 100) / 100,
            }))
            .sort((a, b) => a.simple - b.simple),
        totalEvents: events.length,
    };
}

// ── Public API ────────────────────────────────────────────────────────

const MAX_PAIRS = 120; // cap on track pairs to keep the JSON sane (~15 tracks)

export function buildCounterpointData(
    notes: TimedNote[],
    rangeStart: number,
    rangeEnd:   number,
): CounterpointData {
    const trackMap = new Map<string, TimedNote[]>();
    for (const n of notes) {
        let arr = trackMap.get(n.track);
        if (!arr) { arr = []; trackMap.set(n.track, arr); }
        arr.push(n);
    }

    // Sort by name so pairing is deterministic: reordering tracks in Live's
    // track list must not change which pairs get analysed.
    const trackNames = Array.from(trackMap.keys()).sort((a, b) => a.localeCompare(b));
    const pairs: TrackPairSummary[] = [];
    let truncated = false;

    outer:
    for (let i = 0; i < trackNames.length; i++) {
        for (let j = i + 1; j < trackNames.length; j++) {
            if (pairs.length >= MAX_PAIRS) { truncated = true; break outer; }
            const tA = trackNames[i]!;
            const tB = trackNames[j]!;
            pairs.push(analyzePair(
                trackMap.get(tA)!, trackMap.get(tB)!,
                tA, tB, rangeStart, rangeEnd,
            ));
        }
    }

    const sum = (fn: (p: TrackPairSummary) => number) => pairs.reduce((s, p) => s + fn(p), 0);
    const mc  = (k: keyof TrackPairSummary["motionCounts"]) => pairs.reduce((s, p) => s + p.motionCounts[k], 0);

    return {
        rangeStart, rangeEnd, trackNames, pairs, truncated,
        totals: {
            parallelFifths:  sum(p => p.parallelFifths.length),
            parallelOctaves: sum(p => p.parallelOctaves.length),
            parallelUnisons: sum(p => p.parallelUnisons.length),
            hiddenFifths:    sum(p => p.hiddenFifths.length),
            hiddenOctaves:   sum(p => p.hiddenOctaves.length),
            motionCounts: {
                parallel: mc("parallel"), similar: mc("similar"),
                contrary: mc("contrary"), oblique:  mc("oblique"),
                total:    mc("total"),
            },
        },
    };
}
