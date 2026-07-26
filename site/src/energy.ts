// Two demos for "Energy", the budget argument. The budget: the same
// material with its tension spent two ways, a chord journey over a flat
// texture versus one parked chord under a four-bar arrangement build.
// The implied journey: a drone that never moves while the melody's
// ringing outlines shift mode bar by bar; the engine's own timeline was
// run on these exact notes before the copy quoted it, and it hears Dm,
// Dm7, Gadd9/D, Bbmaj7/D, Dm, flags the dorian color note B, and rates
// a tension arc from 0 up to 33 and home again, over a bass that never
// plays a second pitch (the seam rule, at full stretch). Starting
// either player stops the other.

import { createPlayer, type PNote } from "./lib/player.js";

// --- Demo 1: the budget ---
const nrgChords = document.getElementById("nrg-chords") as HTMLButtonElement;
const nrgArrange = document.getElementById("nrg-arrange") as HTMLButtonElement;
const nrgPlay = document.getElementById("nrg-play") as HTMLButtonElement;
const nrgBlurb = document.getElementById("nrg-blurb") as HTMLElement;
const nrgCanvas = document.getElementById("nrg-canvas") as HTMLCanvasElement;

const BAR = 16;

// Offbeat stabs, the house voicing: chord tones on the offbeat eighths.
function stabs(tones: number[], bar: number): PNote[] {
    const out: PNote[] = [];
    for (const step of [2, 6, 10, 14]) {
        for (const midi of tones) out.push({ midi, step: bar * BAR + step, len: 2 });
    }
    return out;
}

function bassBar(midi: number, bar: number): PNote[] {
    const out: PNote[] = [];
    for (const step of [0, 4, 8, 12]) out.push({ midi, step: bar * BAR + step, len: 4, voice: 1 });
    return out;
}

// Chord journey: vi-IV-I-V voiced as stabs, texture identical every bar.
function chordJourney(): PNote[] {
    const bars: { bass: number; tones: number[] }[] = [
        { bass: 45, tones: [57, 60, 64] },  // Am
        { bass: 41, tones: [57, 60, 65] },  // F
        { bass: 48, tones: [55, 60, 64] },  // C
        { bass: 43, tones: [55, 59, 62] },  // G
    ];
    return bars.flatMap((b, i) => [...bassBar(b.bass, i), ...stabs(b.tones, i)]);
}

// Arrangement journey: Am all four bars, one layer added per bar.
function arrangementJourney(): PNote[] {
    const out: PNote[] = [];
    for (let bar = 0; bar < 4; bar++) out.push(...bassBar(45, bar));
    for (let bar = 1; bar < 4; bar++) out.push(...stabs([57, 60, 64], bar));
    for (let bar = 2; bar < 4; bar++) {
        const arp = [57, 60, 64, 67];
        for (let i = 0; i < 8; i++) {
            out.push({ midi: arp[i % 4]!, step: bar * BAR + i * 2, len: 2 });
        }
    }
    const top = [72, 76, 79, 76];
    for (let i = 0; i < 8; i++) {
        out.push({ midi: top[i % 4]!, step: 3 * BAR + i * 2, len: 2 });
    }
    return out;
}

const nrgPlayer = createPlayer({
    canvas: nrgCanvas, playBtn: nrgPlay,
    topMidi: 80, rows: 37, steps: 64, bpm: 124,
});

let nrgMode: "chords" | "arrange" = "chords";

function setNrg(mode: "chords" | "arrange"): void {
    nrgMode = mode;
    nrgChords.classList.toggle("active", mode === "chords");
    nrgArrange.classList.toggle("active", mode === "arrange");
    if (mode === "chords") {
        nrgPlayer.setNotes(chordJourney());
        nrgBlurb.textContent =
            "The chord journey: vi, IV, I, V, and a texture that never changes. All the motion is harmonic; the arrangement stands still.";
    } else {
        nrgPlayer.setNotes(arrangementJourney());
        nrgBlurb.textContent =
            "The arrangement journey: one chord, four bars, one layer added per bar. Density and register climb, the lift is real, and harmony paid for none of it.";
    }
}

nrgChords.addEventListener("click", () => setNrg("chords"));
nrgArrange.addEventListener("click", () => setNrg("arrange"));

// --- Demo 2: the implied journey ---
const impDrone = document.getElementById("imp-drone") as HTMLButtonElement;
const impStatic = document.getElementById("imp-static") as HTMLButtonElement;
const impShift = document.getElementById("imp-shift") as HTMLButtonElement;
const impPlay = document.getElementById("imp-play") as HTMLButtonElement;
const impBlurb = document.getElementById("imp-blurb") as HTMLElement;
const impCanvas = document.getElementById("imp-canvas") as HTMLCanvasElement;

// D and A, held forever: the bass never plays a second pitch.
const DRONE: PNote[] = [
    { midi: 50, step: 0, len: 64, voice: 1 },
    { midi: 57, step: 0, len: 64, voice: 1 },
];

// One bar: three outline notes arpeggiate in and ring to the bar line,
// so every beat of the bar contains the implied chord.
const ring = (bar: number, a: number, b: number, c: number): PNote[] => [
    { midi: a, step: bar * BAR, len: 16 },
    { midi: b, step: bar * BAR + 4, len: 12 },
    { midi: c, step: bar * BAR + 8, len: 8 },
];

const STATIC_MELODY: PNote[] = [0, 1, 2, 3].flatMap(bar => ring(bar, 65, 69, 72));
const SHIFTING_MELODY: PNote[] = [
    ...ring(0, 65, 69, 72), // F A C: home, dorian at rest
    ...ring(1, 67, 71, 74), // G B D: the natural 6th arrives
    ...ring(2, 70, 74, 77), // Bb D F: the aeolian turn
    ...ring(3, 65, 69, 74), // F A D: home again
];

const impPlayer = createPlayer({
    canvas: impCanvas, playBtn: impPlay,
    topMidi: 79, rows: 31, steps: 64, bpm: 110,
});

const IMP: Record<string, { notes: PNote[]; blurb: string }> = {
    drone: {
        notes: DRONE,
        blurb: "D and A, held. The bass this whole demo will ever have. The extension's timeline hears one chord: D.",
    },
    static: {
        notes: [...DRONE, ...STATIC_MELODY],
        blurb: "One mode, one outline, four bars. The timeline hears Dm and Dm7 breathing, tension idling near zero: home, furnished, parked.",
    },
    shift: {
        notes: [...DRONE, ...SHIFTING_MELODY],
        blurb: "Same drone, but the outline shifts mode each bar. The timeline hears Dm, Dm7, Gadd9/D, Bbmaj7/D, then Dm, flags B as a dorian color note, and rates the tension rising from 0 to 33 and back. Nobody played those chords.",
    },
};

let impMode = "shift";

function setImp(key: string): void {
    impMode = key;
    const p = IMP[key];
    if (!p) return;
    impDrone.classList.toggle("active", key === "drone");
    impStatic.classList.toggle("active", key === "static");
    impShift.classList.toggle("active", key === "shift");
    impBlurb.textContent = p.blurb;
    impPlayer.setNotes(p.notes);
}

impDrone.addEventListener("click", () => setImp("drone"));
impStatic.addEventListener("click", () => setImp("static"));
impShift.addEventListener("click", () => setImp("shift"));

// One player at a time.
nrgPlay.addEventListener("click", () => impPlayer.stop());
impPlay.addEventListener("click", () => nrgPlayer.stop());

setNrg("chords");
setImp("shift");
