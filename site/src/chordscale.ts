// The dice come back, for "Chord-scale thinking": the pentatonic
// article's phrase generator, now rolling over a ii-V-I in C (Dm7, G7,
// two bars of Cmaj7) instead of a drone. Four pools: chord tones only,
// one frozen scale with no landing logic, the moving palette (same
// white keys, but strong beats land on the current chord's tones), and
// the lydian color (one F sharpened over the I). The engine confirmed
// what the pools imply before the copy claimed it: D dorian, G
// mixolydian, and C ionian are identical pitch-class sets (the seam
// rule). As in the original: the only musicianship in the generator is
// rhythm and stepwise preference; the pool does the rest.

import { createPlayer, type PNote } from "./lib/player.js";

const canvas = document.getElementById("cst-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("cst-play") as HTMLButtonElement;
const rollBtn = document.getElementById("cst-roll") as HTMLButtonElement;
const blurb = document.getElementById("cst-blurb") as HTMLElement;

const buttons: Record<string, HTMLButtonElement> = {
    tones: document.getElementById("cst-tones") as HTMLButtonElement,
    frozen: document.getElementById("cst-frozen") as HTMLButtonElement,
    moving: document.getElementById("cst-moving") as HTMLButtonElement,
    lydian: document.getElementById("cst-lydian") as HTMLButtonElement,
};

// One bar each of Dm7 and G7, two of Cmaj7, voiced as bass plus shell.
const PROGRESSION = [
    { tones: [50, 53, 57, 60], landing: [62, 65, 69, 72] },        // Dm7
    { tones: [43, 50, 53, 59], landing: [62, 65, 67, 71, 74] },    // G7
    { tones: [48, 52, 55, 59], landing: [60, 64, 67, 71, 72, 76] },// Cmaj7
    { tones: [48, 52, 55, 59], landing: [60, 64, 67, 71, 72, 76] },// Cmaj7
];

const WHITE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
const LYDIAN = [60, 62, 64, 66, 67, 69, 71, 72, 74, 76];

interface Preset { blurb: string; pool(bar: number): number[]; land: boolean; }

const PRESETS: Record<string, Preset> = {
    tones: {
        blurb: "Chord tones only: every note is furniture. Correct on every beat, and stiff as a showroom: an arpeggio machine, not a melody.",
        pool: bar => PROGRESSION[bar]!.landing,
        land: true,
    },
    frozen: {
        blurb: "All of C major, ignoring the chords. Every note is legal, the parent scale guarantees it, but nothing lands: the line floats over the changes like they are not there.",
        pool: () => WHITE,
        land: false,
    },
    moving: {
        blurb: "The same white keys, but strong beats land on the current chord's tones: D dorian, then G mixolydian, then C ionian. The pool never changed. The landings did, and now it speaks.",
        pool: () => WHITE,
        land: true,
    },
    lydian: {
        blurb: "The moving palette with one note turned: over the Cmaj7 bars, F becomes F#. C lydian instead of C ionian, the sharp 4th from the modes article, now a soloist's choice. Same chord, different light.",
        pool: bar => (bar >= 2 ? LYDIAN : WHITE),
        land: true,
    },
};

let preset = "moving";

const player = createPlayer({
    canvas, playBtn,
    topMidi: 77, rows: 36, steps: 64, bpm: 110,
});

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

/** Walk the pool with a stepwise preference, the pentatonic dice's habit. */
function nextNote(pool: number[], prev: number | null): number {
    if (prev === null) return pick(pool);
    const weighted: number[] = [];
    for (const n of pool) {
        const dist = Math.abs(n - prev);
        if (dist === 0) continue;
        const w = dist <= 2 ? 4 : dist <= 4 ? 2 : 1;
        for (let i = 0; i < w; i++) weighted.push(n);
    }
    return pick(weighted.length ? weighted : pool);
}

function rollMelody(): PNote[] {
    const p = PRESETS[preset];
    if (!p) return [];
    const out: PNote[] = [];
    let prev: number | null = null;
    for (let bar = 0; bar < 4; bar++) {
        const pool = p.pool(bar);
        const landing = PROGRESSION[bar]!.landing;
        for (let slot = 0; slot < 8; slot++) {
            const strong = slot === 0 || slot === 4;
            // Strong beats always sound; weak slots rest sometimes, the
            // breath the phrasing article insists on.
            if (!strong && Math.random() < 0.4) continue;
            let midi: number;
            if (strong && p.land) {
                const near = landing.slice().sort((a, b) =>
                    Math.abs(a - (prev ?? 67)) - Math.abs(b - (prev ?? 67)));
                midi = near[Math.random() < 0.7 ? 0 : 1] ?? near[0]!;
            } else {
                midi = nextNote(pool, prev);
            }
            const holdable = slot === 3 || slot === 7;
            out.push({ midi, step: bar * 16 + slot * 2, len: holdable && Math.random() < 0.5 ? 4 : 2 });
            prev = midi;
        }
    }
    return out;
}

function chordNotes(): PNote[] {
    const out: PNote[] = [];
    PROGRESSION.forEach((c, bar) => {
        for (const midi of c.tones) out.push({ midi, step: bar * 16, len: 16, voice: 1 });
    });
    return out;
}

function roll(): void {
    player.setNotes([...chordNotes(), ...rollMelody()]);
}

function setPreset(key: string): void {
    preset = key;
    for (const [k, b] of Object.entries(buttons)) {
        b.classList.toggle("active", k === key);
    }
    const p = PRESETS[key];
    if (p) blurb.textContent = p.blurb;
    roll();
}

for (const [k, b] of Object.entries(buttons)) {
    b.addEventListener("click", () => setPreset(k));
}
rollBtn.addEventListener("click", roll);

setPreset("moving");
