// Demo for "Motion types": two voices, four ways to move. Every example
// was verified against the extension's counterpoint engine before the
// blurbs were written: the parallel case really does flag three parallel
// fifths, and the other three are pure specimens of their motion type.

import { createPlayer, type PNote } from "./lib/player.js";

interface Motion {
    id: string;
    label: string;
    bass: number[]; // 4 notes, one per beat
    lead: number[];
    blurb: string;
}

const MOTIONS: Motion[] = [
    {
        id: "parallel",
        label: "Parallel",
        bass: [60, 62, 64, 65],
        lead: [67, 69, 71, 72],
        blurb:
            "Both voices move the same direction by the same amount, locked " +
            "a fifth apart. The counterpoint checker flags all three moves " +
            "as parallel fifths: the lines fuse into one thick voice.",
    },
    {
        id: "similar",
        label: "Similar",
        bass: [60, 62, 64, 65],
        lead: [64, 71, 72, 74],
        blurb:
            "Both voices move up, but by different amounts. Same direction, " +
            "independent sizes: related, not fused. No flags.",
    },
    {
        id: "oblique",
        label: "Oblique",
        bass: [60, 60, 60, 60],
        lead: [64, 65, 67, 69],
        blurb:
            "One voice holds while the other moves. The held note anchors; " +
            "the moving line gets all the attention. Drones and pedal tones " +
            "live here.",
    },
    {
        id: "contrary",
        label: "Contrary",
        bass: [60, 59, 57, 55],
        lead: [64, 65, 67, 69],
        blurb:
            "The voices move in opposite directions. Maximum independence: " +
            "your ear cannot mistake them for one line. This is the motion " +
            "counterpoint loves most.",
    },
];

const canvas = document.getElementById("motion-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("motion-play") as HTMLButtonElement;
const picker = document.getElementById("motion-picker") as HTMLElement;
const blurb = document.getElementById("motion-blurb") as HTMLElement;

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 76,
    rows: 22,
    steps: 16,
    bpm: 100,
});

function select(m: Motion): void {
    const notes: PNote[] = [
        ...m.bass.map((midi, i) => ({ midi, step: i * 4, len: 4, voice: 0 })),
        ...m.lead.map((midi, i) => ({ midi, step: i * 4, len: 4, voice: 1 })),
    ];
    player.setNotes(notes);
    blurb.textContent = m.blurb;
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === m.id);
    }
}

for (const m of MOTIONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = m.label;
    btn.dataset["id"] = m.id;
    btn.addEventListener("click", () => select(m));
    picker.appendChild(btn);
}

select(MOTIONS[0]!);
