// Demo for "Pentatonic and blues": a dice-rolled phrase over an A drone.
// The pitches come from the engine's own scale patterns (Scale, imported
// straight from src/theory per the seam rule). The point is audible, not
// argued: random phrases from the five-note box sound fine; the same dice
// over all twelve notes do not. The generator also breathes on purpose,
// resting at the end of each phrase, which is the seed of the phrasing
// article this one leads to.

import { Scale } from "../../src/theory/core.js";
import { createPlayer, type PNote } from "./lib/player.js";

const ROOT = 9; // A
const LO = 57;  // A2 in Ableton naming
const HI = 79;
const STEPS = 32;

interface Palette {
    id: string;
    label: string;
    midis: number[];
    blurb: string;
}

function scaleMidis(patternName: string): number[] {
    const pcs = new Set(new Scale(ROOT, patternName).notes);
    const out: number[] = [];
    for (let m = LO; m <= HI; m++) if (pcs.has(((m % 12) + 12) % 12)) out.push(m);
    return out;
}

const chromaticMidis: number[] = [];
for (let m = LO; m <= HI; m++) chromaticMidis.push(m);

const PALETTES: Palette[] = [
    {
        id: "pent",
        label: "Minor pentatonic",
        midis: scaleMidis("pentatonic_minor"),
        blurb:
            "A C D E G: five notes, and not a semitone anywhere in the box. " +
            "Nothing clashes with the drone, so every roll of the dice is " +
            "listenable. The only thing left to judge is the timing.",
    },
    {
        id: "blues",
        label: "Blues",
        midis: scaleMidis("blues"),
        blurb:
            "The same box plus one deliberately dangerous note: the flat " +
            "five, Eb. Hear how it works when the phrase passes through it " +
            "and stings when the dice decide to sit on it.",
    },
    {
        id: "all",
        label: "All 12 notes",
        midis: chromaticMidis,
        blurb:
            "Same dice, no box. Every note is available, including every " +
            "clash. This is what the pentatonic was protecting you from.",
    },
];

const canvas = document.getElementById("pent-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("pent-play") as HTMLButtonElement;
const picker = document.getElementById("palette-picker") as HTMLElement;
const rollBtn = document.getElementById("new-phrase") as HTMLButtonElement;
const readout = document.getElementById("pent-readout") as HTMLElement;

let palette = PALETTES[0]!;

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 80,
    rows: 37,
    steps: STEPS,
    bpm: 100,
});

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

// Random walk over the palette: mostly neighbor moves, occasional leaps,
// the shape every improviser's hands default to.
function walkFrom(idx: number, midis: number[]): number {
    const r = Math.random();
    let move: number;
    if (r < 0.15) move = 0;
    else if (r < 0.60) move = 1;
    else if (r < 0.85) move = 2;
    else move = 3;
    if (Math.random() < 0.5) move = -move;
    let next = idx + move;
    if (next < 0) next = idx + Math.abs(move);
    if (next >= midis.length) next = idx - Math.abs(move);
    return Math.max(0, Math.min(midis.length - 1, next));
}

function rollPhrase(): void {
    const midis = palette.midis;
    const notes: PNote[] = [
        // The drone: root and fifth, held under everything.
        { midi: 45, step: 0, len: STEPS, voice: 1 },
        { midi: 52, step: 0, len: STEPS, voice: 1 },
    ];

    // Start each phrase near the middle of the box.
    let idx = Math.floor(midis.length / 2);

    // Two sub-phrases with a breath after each: [0..14] and [16..30].
    for (const [start, end] of [[0, 14], [16, 30]] as const) {
        let cursor = start;
        let last: PNote | null = null;
        while (cursor < end) {
            const len = Math.min(pick([2, 2, 2, 4, 4, 6]), end - cursor);
            notes.push({ midi: midis[idx]!, step: cursor, len });
            last = notes[notes.length - 1]!;
            cursor += len;
            if (Math.random() < 0.25) cursor += 2; // rest: the phrase breathes
            idx = walkFrom(idx, midis);
        }
        // Let the final note of the phrase ring into the gap.
        if (last) last.len += 2;
    }

    player.setNotes(notes);
    readout.textContent = palette.blurb;
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === palette.id);
    }
}

for (const p of PALETTES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = p.label;
    btn.dataset["id"] = p.id;
    btn.addEventListener("click", () => {
        palette = p;
        rollPhrase();
    });
    picker.appendChild(btn);
}

rollBtn.addEventListener("click", rollPhrase);
rollPhrase();
