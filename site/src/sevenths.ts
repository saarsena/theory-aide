// Two demos for "Seventh chords", both on the shared mini piano-roll.
// The flavor lab: four qualities on one root C, with a Triad / +7th
// toggle so the added third is the only thing that changes. The lean:
// G then C against G7 then C, the tritone resolution audible. Chord
// names and roman labels were verified against recognizeChord and
// romanForChord before the copy quoted them (the seam rule). Starting
// either player stops the other.

import { createPlayer, type PNote } from "./lib/player.js";

// --- Demo 1: the flavor lab ---
const sevButtons: Record<string, HTMLButtonElement> = {
    maj7: document.getElementById("sev-maj7") as HTMLButtonElement,
    dom7: document.getElementById("sev-dom7") as HTMLButtonElement,
    min7: document.getElementById("sev-min7") as HTMLButtonElement,
    halfdim: document.getElementById("sev-halfdim") as HTMLButtonElement,
};
const triadBtn = document.getElementById("sev-triad") as HTMLButtonElement;
const seventhBtn = document.getElementById("sev-seventh") as HTMLButtonElement;
const sevPlay = document.getElementById("sev-play") as HTMLButtonElement;
const sevBlurb = document.getElementById("sev-blurb") as HTMLElement;
const sevCanvas = document.getElementById("sev-canvas") as HTMLCanvasElement;

interface Quality {
    triad: number[];
    seventh: number;
    triadName: string;
    name: string;
    triadBlurb: string;
    seventhBlurb: string;
}

const QUALITIES: Record<string, Quality> = {
    maj7: {
        triad: [60, 64, 67], seventh: 71, triadName: "C", name: "Cmaj7",
        triadBlurb: "C major: bright, square, completely settled.",
        seventhBlurb: "Cmaj7: the added B shimmers a semitone under the octave. Dreamy, soft focus: neo-soul, bossa, lofi. At rest, but no longer plain.",
    },
    dom7: {
        triad: [60, 64, 67], seventh: 70, triadName: "C", name: "C7",
        triadBlurb: "C major again: the same settled triad.",
        seventhBlurb: "C7: the flat seventh (Bb) turns the same bright triad restless. This is the dominant seventh, the pulling chord, and it wants to move.",
    },
    min7: {
        triad: [60, 63, 67], seventh: 70, triadName: "Cm", name: "Cm7",
        triadBlurb: "C minor: the dark triad from the triads article.",
        seventhBlurb: "Cm7: minor with its edges rounded. Mellow and warm, the workhorse of funk, soul, and every vamp that loops all night.",
    },
    halfdim: {
        triad: [60, 63, 66], seventh: 70, triadName: "Cdim", name: "Cm7b5",
        triadBlurb: "C diminished: the unstable stack of two minor thirds.",
        seventhBlurb: "Cm7b5, the half-diminished: the diminished triad with a minor seventh softening it. Shadowy, unresolved, jazz's favorite doorway chord.",
    },
};

let quality = "maj7";
let withSeventh = false;

const sevPlayer = createPlayer({
    canvas: sevCanvas, playBtn: sevPlay,
    topMidi: 72, rows: 26, steps: 16, bpm: 100,
});

function updateSev(): void {
    const q = QUALITIES[quality];
    if (!q) return;
    const midis = withSeventh ? [...q.triad, q.seventh] : q.triad;
    const notes: PNote[] = midis.map(midi => ({ midi, step: 0, len: 16 }));
    notes.push({ midi: 48, step: 0, len: 16, voice: 1 });
    sevPlayer.setNotes(notes);
    sevBlurb.textContent = withSeventh ? q.seventhBlurb : q.triadBlurb;
    for (const [k, b] of Object.entries(sevButtons)) {
        b.classList.toggle("active", k === quality);
    }
    triadBtn.classList.toggle("active", !withSeventh);
    seventhBtn.classList.toggle("active", withSeventh);
    triadBtn.textContent = `Triad (${q.triadName})`;
    seventhBtn.textContent = `+7th (${q.name})`;
}

for (const [k, b] of Object.entries(sevButtons)) {
    b.addEventListener("click", () => { quality = k; updateSev(); });
}
triadBtn.addEventListener("click", () => { withSeventh = false; updateSev(); });
seventhBtn.addEventListener("click", () => { withSeventh = true; updateSev(); });

// --- Demo 2: the lean ---
const leanTriad = document.getElementById("lean-triad") as HTMLButtonElement;
const leanSeventh = document.getElementById("lean-seventh") as HTMLButtonElement;
const leanPlay = document.getElementById("lean-play") as HTMLButtonElement;
const leanBlurb = document.getElementById("lean-blurb") as HTMLElement;
const leanCanvas = document.getElementById("lean-canvas") as HTMLCanvasElement;

const LEANS: Record<string, { first: number[]; bass: number; blurb: string }> = {
    triad: {
        first: [55, 59, 62], bass: 43,
        blurb: "G then C, plain triads: V to I. The leading tone B steps up to C, and it lands fine. One magnet.",
    },
    seventh: {
        first: [55, 59, 62, 65], bass: 43,
        blurb: "G7 then C: the added F forms a tritone against B, and both resolve by semitone in opposite directions, B up to C, F down to E. Two magnets. Feel how much harder it lands.",
    },
};

let lean = "triad";

const leanPlayer = createPlayer({
    canvas: leanCanvas, playBtn: leanPlay,
    topMidi: 69, rows: 27, steps: 32, bpm: 90,
});

function updateLean(): void {
    const l = LEANS[lean];
    if (!l) return;
    const notes: PNote[] = [];
    for (const midi of l.first) notes.push({ midi, step: 0, len: 16 });
    notes.push({ midi: l.bass, step: 0, len: 16, voice: 1 });
    for (const midi of [60, 64, 67]) notes.push({ midi, step: 16, len: 16 });
    notes.push({ midi: 48, step: 16, len: 16, voice: 1 });
    leanPlayer.setNotes(notes);
    leanBlurb.textContent = l.blurb;
    leanTriad.classList.toggle("active", lean === "triad");
    leanSeventh.classList.toggle("active", lean === "seventh");
}

leanTriad.addEventListener("click", () => { lean = "triad"; updateLean(); });
leanSeventh.addEventListener("click", () => { lean = "seventh"; updateLean(); });

// One player at a time.
sevPlay.addEventListener("click", () => leanPlayer.stop());
leanPlay.addEventListener("click", () => sevPlayer.stop());

updateSev();
updateLean();
