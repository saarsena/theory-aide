// The punctuation demo, for "Cadences": one phrase, four endings. Every
// preset opens I then vi (home, then drifting) and differs only in its
// final two chords, so the cadence is the isolated variable. Bar five is
// deliberately silent: the breath from the phrasing article, and the
// space the half cadence needs to hang in, since a loop that restarted
// on I immediately would resolve the very question mark it just asked.
// Verified against detectProgressions before the copy claimed labels:
// the engine names the authentic and plagal endings and has no template
// for half or deceptive (the seam rule).

import { createPlayer, type PNote } from "./lib/player.js";

const canvas = document.getElementById("cad-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("cad-play") as HTMLButtonElement;
const blurb = document.getElementById("cad-blurb") as HTMLElement;

const buttons: Record<string, HTMLButtonElement> = {
    authentic: document.getElementById("cad-authentic") as HTMLButtonElement,
    plagal: document.getElementById("cad-plagal") as HTMLButtonElement,
    half: document.getElementById("cad-half") as HTMLButtonElement,
    deceptive: document.getElementById("cad-deceptive") as HTMLButtonElement,
};

const CHORDS: Record<string, { bass: number; tones: number[] }> = {
    I: { bass: 48, tones: [60, 64, 67] },
    IV: { bass: 53, tones: [60, 65, 69] },
    V: { bass: 55, tones: [59, 62, 67] },
    vi: { bass: 45, tones: [60, 64, 69] },
    ii: { bass: 50, tones: [62, 65, 69] },
};

const BAR = 8;
const BARS = 5; // four chords, then the breath

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
    authentic: {
        chords: ["I", "vi", "V", "I"],
        blurb: "V to I, the authentic cadence: the full stop. Both magnets from the seventh-chords article get paid, and the phrase files itself as finished.",
    },
    plagal: {
        chords: ["I", "vi", "IV", "I"],
        blurb: "IV to I, the plagal cadence: the amen. No leading tone, no tritone, nothing snaps; the phrase settles like a hand on a shoulder.",
    },
    half: {
        chords: ["I", "vi", "ii", "V"],
        blurb: "Ending ON V, the half cadence: the question mark. Listen to the silence after it: the phrase stopped, but nothing finished.",
    },
    deceptive: {
        chords: ["I", "vi", "V", "vi"],
        blurb: "V to vi, the deceptive cadence: the swerve. Watch the roll: B still rises to C, the ear gets its melodic payment, but the bass steps to A instead of C and the ground moves.",
    },
};

const player = createPlayer({
    canvas, playBtn,
    topMidi: 71, rows: 28, steps: BAR * BARS, bpm: 100,
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

setPreset("authentic");
