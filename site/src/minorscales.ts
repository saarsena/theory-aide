// The movable home, for "Minor scales": the same seven white keys played
// as a climb over a two-note drone, resting on C (major) or on A (minor),
// with natural / harmonic / melodic switches for the minor side. The
// point of the demo is that switching home changes everything while the
// notes change nothing. Reconstructed from the deployed production
// bundle after the original source was lost with its machine; behavior
// and copy match the live page.

import { Scale, noteName, keyUsesFlats } from "../../src/theory/core.js";
import { createPlayer, type PNote } from "./lib/player.js";

const canvas = document.getElementById("minor-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("minor-play") as HTMLButtonElement;
const homePicker = document.getElementById("home-picker") as HTMLElement;
const flavorPicker = document.getElementById("flavor-picker") as HTMLElement;
const readout = document.getElementById("minor-readout") as HTMLElement;

let home: "major" | "minor" = "minor";
let flavor = "natural_minor";

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

const STEPS = 16;
const player = createPlayer({
    canvas, playBtn,
    topMidi: 74, rows: 17, steps: STEPS, bpm: 120,
});

function current(): { root: number; base: number; scale: Scale; flats: boolean } {
    return home === "major"
        ? { root: 0, base: 60, scale: new Scale(0, "major"), flats: false }
        : { root: 9, base: 57, scale: new Scale(9, flavor), flats: keyUsesFlats(9, flavor) };
}

function update(): void {
    const { base, scale, flats } = current();
    const midis = offsets(scale).map(o => base + o);
    const notes: PNote[] = midis.map((midi, i) => ({ midi, step: i * 2, len: 2 }));
    // The drone is the home, pinned: root and fifth an octave below.
    notes.push({ midi: base - 12, step: 0, len: STEPS, voice: 1 });
    notes.push({ midi: base - 12 + 7, step: 0, len: STEPS, voice: 1 });
    const lo = Math.min(...midis, base - 12);
    const hi = Math.max(...midis);
    player.setView(hi + 1, hi - lo + 4);
    player.setNotes(notes);

    const names = scale.notes.map(pc => noteName(pc, flats)).join(" ");
    if (home === "major") {
        readout.innerHTML = `<strong>${names}</strong>, home on C. Bright and settled: the major scale. Now switch the home to A and listen to these very same seven notes turn dark.`;
    } else if (flavor === "natural_minor") {
        readout.innerHTML = `<strong>${names}</strong>, home on A. The <em>exact same seven notes</em> as C major, but resting on A instead of C. Nothing was added or removed; only the center moved. That one move, same notes, new home, is the whole idea behind the modes.`;
    } else if (flavor === "harmonic_minor") {
        readout.innerHTML = `<strong>${names}</strong>. The 7th is raised to G#, a leading tone that pulls hard up to A. That pull is why harmonic minor exists: natural minor had no such tug home.`;
    } else {
        readout.innerHTML = `<strong>${names}</strong>. Both the 6th and 7th lift on the way up (F#, G#), smoothing the wide gap harmonic minor left behind. This is melodic minor, the singer's ascent.`;
    }

    for (const b of homePicker.querySelectorAll("button")) {
        b.classList.toggle("active", (b as HTMLButtonElement).dataset.home === home);
    }
    flavorPicker.querySelectorAll("button").forEach(b => {
        (b as HTMLButtonElement).disabled = home === "major";
        b.classList.toggle("active", home === "minor" && (b as HTMLButtonElement).dataset.flavor === flavor);
    });
    flavorPicker.style.opacity = home === "major" ? "0.4" : "1";
}

for (const [label, key] of [["Major · home C", "major"], ["Minor · home A", "minor"]] as const) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.dataset.home = key;
    b.addEventListener("click", () => { home = key; update(); });
    homePicker.appendChild(b);
}
for (const [label, key] of [["Natural", "natural_minor"], ["Harmonic", "harmonic_minor"], ["Melodic", "melodic_minor"]] as const) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.dataset.flavor = key;
    b.addEventListener("click", () => { home = "minor"; flavor = key; update(); });
    flavorPicker.appendChild(b);
}

update();
