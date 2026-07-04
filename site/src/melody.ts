// Demo for "Melody": three one-bar lines with very different shapes, on the
// shared mini-roll player. Same key, same rhythm, different contour.

import { createPlayer, type PNote } from "./lib/player.js";

interface Shape {
    id: string;
    label: string;
    midis: number[]; // 8 notes, 2 steps each
    blurb: string;
}

const SHAPES: Shape[] = [
    {
        id: "steps",
        label: "Mostly steps",
        midis: [60, 62, 64, 65, 67, 67, 64, 62],
        blurb:
            "Every move is one or two rows. The line walks; your ear follows " +
            "it without effort. This is the singable kind.",
    },
    {
        id: "leaps",
        label: "Big leaps",
        midis: [60, 67, 64, 72, 65, 74, 69, 62],
        blurb:
            "Every move is a jump. Angular, attention-grabbing, hard to sing. " +
            "Leaps are strong precisely because they cost effort.",
    },
    {
        id: "arch",
        label: "The arch",
        midis: [60, 62, 64, 67, 72, 69, 65, 62],
        blurb:
            "Steps up, one leap to the peak, then a fall. One clear high " +
            "point per phrase is the oldest trick in melody, because it works.",
    },
];

const canvas = document.getElementById("melody-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("melody-play") as HTMLButtonElement;
const picker = document.getElementById("shape-picker") as HTMLElement;
const blurb = document.getElementById("melody-blurb") as HTMLElement;

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 75,
    rows: 17,
    steps: 16,
    bpm: 120,
});

function select(shape: Shape): void {
    const notes: PNote[] = shape.midis.map((m, i) => ({ midi: m, step: i * 2, len: 2 }));
    player.setNotes(notes);
    blurb.textContent = shape.blurb;
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === shape.id);
    }
}

for (const s of SHAPES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = s.label;
    btn.dataset["id"] = s.id;
    btn.addEventListener("click", () => select(s));
    picker.appendChild(btn);
}

select(SHAPES[0]!);
