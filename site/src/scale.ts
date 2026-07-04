// Demo for "The major scale": the pattern climbed from any root, on the
// shared mini-roll player. The slider transposes; the pattern never changes.

import { createPlayer, type PNote } from "./lib/player.js";

const DEGREES = [0, 2, 4, 5, 7, 9, 11, 12];

const canvas = document.getElementById("scale-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("scale-play") as HTMLButtonElement;
const slider = document.getElementById("root-slider") as HTMLInputElement;
const blurb = document.getElementById("scale-blurb") as HTMLElement;

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteName = (m: number) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 2}`;

// Slider picks the root note: C2 (48) to G3 (67).
const rootFromSlider = () => 48 + Math.round((Number(slider.value) / 1000) * 19);

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 72,
    rows: 13,
    steps: 16,
    bpm: 120,
});

function apply(): void {
    const root = rootFromSlider();
    const notes: PNote[] = DEGREES.map((d, i) => ({
        midi: root + d,
        step: i * 2,
        len: 2,
    }));
    player.setView(root + 12, 13);
    player.setNotes(notes);
    blurb.textContent =
        `${DEGREES.map((d) => noteName(root + d)).join(" ")} · ` +
        `the climb, in semitones: 2 2 1 2 2 2 1. Same pattern from any root.`;
}

slider.addEventListener("input", apply);
apply();
