// Seven moods from one set of notes, for "Modes". Two views: "Move the
// home" walks the white keys with the drone (the bass, the home) moved to
// each of the seven degrees in turn; "One root" holds the drone on D and
// changes the mode's one characteristic note instead, which is how modes
// are actually used. The drone's fifth is only sounded when the mode has
// a perfect fifth, which is exactly how Locrian tells on itself.
// Reconstructed from the deployed production bundle after the original
// source was lost with its machine; behavior and copy match the live page.

import { Scale, noteName, keyUsesFlats } from "../../src/theory/core.js";
import { createPlayer, type PNote } from "./lib/player.js";

interface Mode {
    pattern: string;
    label: string;
    homePc: number;      // white-key home in the "Move the home" view
    charDegree: number;  // 1-based degree of the characteristic note, 0 = a pole
    charName: string;
    mood: string;
}

// Bright to dark, with the two poles (Ionian, Aeolian) in their places.
const MODES: Mode[] = [
    { pattern: "major", label: "Ionian", homePc: 0, charDegree: 0, charName: "", mood: "the major scale itself, the bright pole." },
    { pattern: "lydian", label: "Lydian", homePc: 5, charDegree: 4, charName: "sharp 4th", mood: "major, floating and weightless." },
    { pattern: "mixolydian", label: "Mixolydian", homePc: 7, charDegree: 7, charName: "flat 7th", mood: "major that will not fully resolve: bluesy, rock." },
    { pattern: "dorian", label: "Dorian", homePc: 2, charDegree: 6, charName: "natural 6th", mood: "the hopeful minor: modal jazz and funk." },
    { pattern: "natural_minor", label: "Aeolian", homePc: 9, charDegree: 0, charName: "", mood: "natural minor, the dark pole you already know." },
    { pattern: "phrygian", label: "Phrygian", homePc: 4, charDegree: 2, charName: "flat 2nd", mood: "dark and tense: Spanish, flamenco, metal." },
    { pattern: "locrian", label: "Locrian", homePc: 11, charDegree: 5, charName: "flat 5th", mood: "the oddball: no stable home to stand on." },
];

const PARALLEL_ROOT = 2; // D: the held root of the "One root" view

const canvas = document.getElementById("modes-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("modes-play") as HTMLButtonElement;
const viewPicker = document.getElementById("view-picker") as HTMLElement;
const modePicker = document.getElementById("mode-picker") as HTMLElement;
const readout = document.getElementById("modes-readout") as HTMLElement;

let view: "derive" | "parallel" = "derive";
let modeIdx = 3; // Dorian first: the gateway mode

/** Scale's pitch classes as ascending semitone offsets from the root,
 *  closed with the octave, so the climb can be laid onto real midi. */
function offsets(scale: Scale): number[] {
    const notes = scale.notes;
    const out = [0];
    for (let i = 1; i < notes.length; i++) {
        const step = ((notes[i]! - notes[i - 1]!) % 12 + 12) % 12;
        out.push((out[i - 1] ?? 0) + step);
    }
    out.push(12);
    return out;
}

const player = createPlayer({
    canvas, playBtn,
    topMidi: 84, rows: 26, steps: 16, bpm: 120,
});

function update(): void {
    const mode = MODES[modeIdx]!;
    const root = view === "derive" ? mode.homePc : PARALLEL_ROOT;
    const base = view === "derive" ? 60 + mode.homePc : 62;
    const scale = new Scale(root, mode.pattern);
    const flats = keyUsesFlats(root, mode.pattern);
    const midis = offsets(scale).map(o => base + o);
    const notes: PNote[] = midis.map((midi, i) => ({ midi, step: i * 2, len: 2 }));

    // The drone pins the home. The fifth joins only when the scale has a
    // perfect fifth, so Locrian's bass audibly has nowhere to sit.
    const droneMidi = base - 12;
    const hasFifth = scale.notes.some(pc => ((pc - root) % 12 + 12) % 12 === 7);
    notes.push({ midi: droneMidi, step: 0, len: 16, voice: 1 });
    if (hasFifth) notes.push({ midi: droneMidi + 7, step: 0, len: 16, voice: 1 });

    const lo = Math.min(...midis, droneMidi);
    const hi = Math.max(...midis);
    player.setView(hi + 1, hi - lo + 4);
    player.setNotes(notes);

    const homeName = noteName(root, flats);
    const names = scale.notes.map(pc => noteName(pc, flats)).join(" ");
    const charNote = mode.charDegree > 0 ? noteName(scale.notes[mode.charDegree - 1]!, flats) : "";
    if (view === "derive") {
        readout.innerHTML = `<strong>${mode.label}</strong>, home on ${homeName}: ${names}. `
            + (mode.homePc === 0
                ? "The white keys resting on C. Every mode below is these same notes with the home, the drone, moved somewhere else."
                : `The same white keys as C major, but the bass now holds ${homeName}, and that alone makes it ${mode.label}: ${mode.mood}`);
    } else {
        readout.innerHTML = `<strong>D ${mode.label}</strong>: ${names}. `
            + (mode.charDegree === 0
                ? (mode.label === "Ionian"
                    ? "The bright pole. Every other mode is measured against it."
                    : "The dark pole, plain natural minor.")
                : `Against the same held D, the one note that makes it is the <strong>${mode.charName} (${charNote})</strong>. ${mode.mood}`)
            + (mode.pattern === "locrian"
                ? " Notice the drone: with no perfect fifth in the scale, the bass has nothing stable to sit on."
                : "");
    }

    for (const b of viewPicker.querySelectorAll("button")) {
        b.classList.toggle("active", (b as HTMLButtonElement).dataset.view === view);
    }
    for (const b of modePicker.querySelectorAll("button")) {
        const idx = Number((b as HTMLButtonElement).dataset.idx);
        b.textContent = view === "derive"
            ? `${MODES[idx]!.label} (${noteName(MODES[idx]!.homePc, false)})`
            : MODES[idx]!.label;
        b.classList.toggle("active", idx === modeIdx);
    }
}

for (const [label, key] of [["Move the home", "derive"], ["One root", "parallel"]] as const) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.dataset.view = key;
    b.addEventListener("click", () => { view = key; update(); });
    viewPicker.appendChild(b);
}
MODES.forEach((_, idx) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.idx = String(idx);
    b.addEventListener("click", () => { modeIdx = idx; update(); });
    modePicker.appendChild(b);
});

update();
