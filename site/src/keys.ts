// Demo for "Keys": the same melody twice. One version ends on the tonic
// and settles; the other stops one row short, on the leading tone, and
// itches. The gravity is the lesson.

import { createPlayer, type PNote } from "./lib/player.js";

interface Ending {
    id: string;
    label: string;
    finalMidi: number;
    blurb: string;
}

// C major line: the first seven notes are shared; only the last differs.
const SHARED = [60, 64, 62, 65, 64, 67, 69];

const ENDINGS: Ending[] = [
    {
        id: "home",
        label: "Ends home",
        finalMidi: 72,
        blurb:
            "The line climbs and lands on C, the tonic. Done. Settled. " +
            "Nothing owed. That arrival feeling is what a key is.",
    },
    {
        id: "hang",
        label: "Ends one row short",
        finalMidi: 71,
        blurb:
            "Identical melody, but the last note stops on B, one semitone " +
            "under home. Feel the itch? Your ear knows exactly which note " +
            "is missing, and it will not let go until it hears it.",
    },
];

const canvas = document.getElementById("keys-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("keys-play") as HTMLButtonElement;
const picker = document.getElementById("ending-picker") as HTMLElement;
const blurb = document.getElementById("keys-blurb") as HTMLElement;

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 73,
    rows: 14,
    steps: 16,
    bpm: 120,
});

function select(e: Ending): void {
    const midis = [...SHARED, e.finalMidi];
    const notes: PNote[] = midis.map((m, i) => ({ midi: m, step: i * 2, len: 2 }));
    player.setNotes(notes);
    blurb.textContent = e.blurb;
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === e.id);
    }
}

for (const e of ENDINGS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = e.label;
    btn.dataset["id"] = e.id;
    btn.addEventListener("click", () => select(e));
    picker.appendChild(btn);
}

select(ENDINGS[0]!);
