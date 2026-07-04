// Demo for "Voices": a bass line and a lead line, hearable together or
// alone. Two timbres, two colors, one music.

import { createPlayer, type PNote } from "./lib/player.js";

// Bass (voice 0, triangle, green) and lead (voice 1, sine, blue) in C.
const BASS: PNote[] = [
    { midi: 48, step: 0, len: 4 },  // C2
    { midi: 55, step: 4, len: 4 },  // G2
    { midi: 57, step: 8, len: 4 },  // A2
    { midi: 53, step: 12, len: 4 }, // F2
].map((n) => ({ ...n, voice: 0 }));

const LEAD: PNote[] = [
    { midi: 64, step: 0, len: 2 },
    { midi: 62, step: 2, len: 2 },
    { midi: 60, step: 4, len: 2 },
    { midi: 62, step: 6, len: 2 },
    { midi: 64, step: 8, len: 2 },
    { midi: 65, step: 10, len: 2 },
    { midi: 64, step: 12, len: 2 },
    { midi: 62, step: 14, len: 2 },
].map((n) => ({ ...n, voice: 1 }));

interface View {
    id: string;
    label: string;
    notes: PNote[];
    blurb: string;
}

const VIEWS: View[] = [
    {
        id: "both",
        label: "Both voices",
        notes: [...BASS, ...LEAD],
        blurb:
            "Bass (green) and lead (blue) at once. Notice you can follow " +
            "either one with your attention, like picking a speaker at a party.",
    },
    {
        id: "lead",
        label: "Lead alone",
        notes: LEAD,
        blurb: "Just the blue line. A complete little melody on its own.",
    },
    {
        id: "bass",
        label: "Bass alone",
        notes: BASS,
        blurb:
            "Just the green line. Slower and simpler, but also a melody on " +
            "its own, not merely support.",
    },
];

const canvas = document.getElementById("voices-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("voices-play") as HTMLButtonElement;
const picker = document.getElementById("view-picker") as HTMLElement;
const blurb = document.getElementById("voices-blurb") as HTMLElement;

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 67,
    rows: 20,
    steps: 16,
    bpm: 110,
});

function select(v: View): void {
    player.setNotes(v.notes);
    blurb.textContent = v.blurb;
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === v.id);
    }
}

for (const v of VIEWS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = v.label;
    btn.dataset["id"] = v.id;
    btn.addEventListener("click", () => select(v));
    picker.appendChild(btn);
}

select(VIEWS[0]!);
