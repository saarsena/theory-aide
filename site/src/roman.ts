// Demo for "Roman numerals": pick a progression and a key. The letter
// names change with every key; the numerals never move. Chord names,
// numerals, spelling, and even the progression's nickname all come from
// the real engine (core + analyzer, imported straight from src/theory per
// the seam rule); nothing in the readout is hardcoded.

import {
    Scale,
    buildDiatonicChords,
    keyUsesFlats,
    noteName,
} from "../../src/theory/core.js";
import { romanForChord, detectProgressions } from "../../src/theory/analyzer.js";
import { createPlayer, type PNote } from "./lib/player.js";

interface Prog {
    id: string;
    label: string;
    degrees: number[]; // 0-based scale-degree indexes
    lens: number[];    // sixteenth-steps per chord; must sum to STEPS
}

const STEPS = 32;
const PROGS: Prog[] = [
    { id: "pop",     label: "I · V · vi · IV", degrees: [0, 4, 5, 3], lens: [8, 8, 8, 8] },
    { id: "jazz",    label: "ii · V · I",      degrees: [1, 4, 0],    lens: [8, 8, 16] },
    { id: "primary", label: "I · IV · V",      degrees: [0, 3, 4],    lens: [8, 8, 16] },
];

const canvas = document.getElementById("roman-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("roman-play") as HTMLButtonElement;
const progPicker = document.getElementById("prog-picker") as HTMLElement;
const keyPicker = document.getElementById("key-picker") as HTMLElement;
const cards = document.getElementById("chord-cards") as HTMLElement;
const readout = document.getElementById("roman-readout") as HTMLElement;

let prog = PROGS[0]!;
let keyRoot = 0; // C major to start

// The engine's diminished label ends in a plain "o"; show the ° the page
// prose uses.
const pretty = (label: string) => label.replace(/o$/, "°");

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 68,
    rows: 24,
    steps: STEPS,
    bpm: 120,
});

function apply(): void {
    const flats = keyUsesFlats(keyRoot, "major");
    const scale = new Scale(keyRoot, "major");
    const triads = buildDiatonicChords(scale, false);
    const chords = prog.degrees.map(d => triads[d]!);
    const romans = chords.map(c => romanForChord(c, scale));
    const detected = detectProgressions(romans)[0];

    cards.innerHTML = "";
    chords.forEach((c, i) => {
        const card = document.createElement("div");
        card.className = "chord-card";
        const r = document.createElement("div");
        r.className = "cc-roman";
        r.textContent = pretty(romans[i]!.label);
        const n = document.createElement("div");
        n.className = "cc-name";
        n.textContent = c.getName(flats);
        card.append(r, n);
        cards.appendChild(card);
    });

    const notes: PNote[] = [];
    let step = 0;
    chords.forEach((c, i) => {
        for (const iv of c.intervals) {
            notes.push({ midi: 48 + c.root + iv, step, len: prog.lens[i]! });
        }
        step += prog.lens[i]!;
    });
    player.setNotes(notes);

    const keyName = noteName(keyRoot, flats);
    const names = chords.map(c => c.getName(flats)).join(" · ");
    readout.textContent =
        `In ${keyName} major: ${names}. ` +
        (detected
            ? `The engine recognizes the shape and calls it the ${detected.label}. ${detected.description}`
            : "");

    for (const btn of progPicker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === prog.id);
    }
    for (const btn of keyPicker.querySelectorAll("button")) {
        btn.classList.toggle("active", Number(btn.dataset["pc"]) === keyRoot);
    }
}

for (const p of PROGS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = p.label;
    btn.dataset["id"] = p.id;
    btn.addEventListener("click", () => {
        prog = p;
        apply();
    });
    progPicker.appendChild(btn);
}

for (let pc = 0; pc < 12; pc++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = noteName(pc, keyUsesFlats(pc, "major"));
    btn.dataset["pc"] = String(pc);
    btn.addEventListener("click", () => {
        keyRoot = pc;
        apply();
    });
    keyPicker.appendChild(btn);
}

apply();
