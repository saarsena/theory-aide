// The ordering demo, for "Progressions": one pool of chords in C, four
// orderings. Three are famous enough that the engine names them, and the
// fourth is engineered to avoid every strong handoff and match nothing,
// so the aimlessness is heard rather than asserted. Verified against
// recognizeChord, romanForChord, and detectProgressions before the copy
// quoted the labels (the seam rule).

import { createPlayer, type PNote } from "./lib/player.js";

const canvas = document.getElementById("prog-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("prog-play") as HTMLButtonElement;
const blurb = document.getElementById("prog-blurb") as HTMLElement;

const buttons: Record<string, HTMLButtonElement> = {
    axis: document.getElementById("prog-axis") as HTMLButtonElement,
    rotated: document.getElementById("prog-rotated") as HTMLButtonElement,
    schoolbook: document.getElementById("prog-schoolbook") as HTMLButtonElement,
    wanderer: document.getElementById("prog-wanderer") as HTMLButtonElement,
};

// Voicings kept close so the bass carries the story; bass is voice 1.
const CHORDS: Record<string, { bass: number; tones: number[] }> = {
    I: { bass: 48, tones: [60, 64, 67] },
    IV: { bass: 53, tones: [60, 65, 69] },
    V: { bass: 55, tones: [59, 62, 67] },
    vi: { bass: 45, tones: [60, 64, 69] },
    iii: { bass: 52, tones: [59, 64, 67] },
    ii: { bass: 50, tones: [62, 65, 69] },
};

const BAR = 8;

function loop(names: string[]): PNote[] {
    const out: PNote[] = [];
    names.forEach((name, i) => {
        const c = CHORDS[name];
        if (!c) return;
        for (const midi of c.tones) out.push({ midi, step: i * BAR, len: BAR });
        out.push({ midi: c.bass, step: i * BAR, len: BAR, voice: 1 });
    });
    return out;
}

const PRESETS: Record<string, { chords: string[]; blurb: string }> = {
    axis: {
        chords: ["I", "V", "vi", "IV"],
        blurb: "I, V, vi, IV: the four chords of pop. The engine calls this the four-chord pop loop; a few hundred hit songs just call it home.",
    },
    rotated: {
        chords: ["vi", "IV", "I", "V"],
        blurb: "vi, IV, I, V: the same four chords started on the dark one. Nothing changed but the entry point, and the whole mood came with it.",
    },
    schoolbook: {
        chords: ["I", "IV", "V", "I"],
        blurb: "I, IV, V, I: the schoolbook arc. Home, away, tension, home: the whole story of tonal harmony in four bars.",
    },
    wanderer: {
        chords: ["I", "iii", "ii", "vi"],
        blurb: "I, iii, ii, vi: legal chords, weak handoffs. No tension chord, no falling fifth into home, and the engine recognizes nothing here. Neither does your ear.",
    },
};

const player = createPlayer({
    canvas, playBtn,
    topMidi: 71, rows: 28, steps: 32, bpm: 100,
});

function setPreset(key: string): void {
    const p = PRESETS[key];
    if (!p) return;
    for (const [k, b] of Object.entries(buttons)) {
        b.classList.toggle("active", k === key);
    }
    blurb.textContent = p.blurb;
    player.setNotes(loop(p.chords));
}

for (const [k, b] of Object.entries(buttons)) {
    b.addEventListener("click", () => setPreset(k));
}

setPreset("axis");
