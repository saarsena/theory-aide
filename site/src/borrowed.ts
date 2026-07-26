// The borrowing demo, for "Borrowed chords": one four-chord loop in C
// major on the shared mini piano-roll, with presets that swap single
// chords for their parallel-minor imports. The progressions were run
// through recognizeChord and romanForChord before the article claimed
// what the Explain Harmony panel badges: iv, bVII, and bVI all come back
// borrowed, and the plain loop comes back clean (the seam rule).

import { createPlayer, type PNote } from "./lib/player.js";

const canvas = document.getElementById("bor-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("bor-play") as HTMLButtonElement;
const blurb = document.getElementById("bor-blurb") as HTMLElement;

const buttons: Record<string, HTMLButtonElement> = {
    plain: document.getElementById("bor-plain") as HTMLButtonElement,
    iv: document.getElementById("bor-iv") as HTMLButtonElement,
    bvii: document.getElementById("bor-bvii") as HTMLButtonElement,
    bvi: document.getElementById("bor-bvi") as HTMLButtonElement,
};

// Voicings chosen for smooth top lines; each slot is one bar of the loop.
// The bass (voice 1) doubles the root an octave down.
const CHORDS: Record<string, { bass: number; tones: number[] }> = {
    I: { bass: 48, tones: [60, 64, 67] },
    IV: { bass: 53, tones: [60, 65, 69] },
    iv: { bass: 53, tones: [60, 65, 68] },
    V: { bass: 55, tones: [59, 62, 67] },
    bVII: { bass: 46, tones: [58, 62, 65] },
    bVI: { bass: 44, tones: [56, 60, 63] },
};

const BAR = 8; // steps per chord

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
    plain: {
        chords: ["I", "IV", "V", "I"],
        blurb: "I, IV, V, I: all four chords from C major's own shelf. Bright, settled, nothing to report.",
    },
    iv: {
        chords: ["I", "IV", "iv", "I"],
        blurb: "I, IV, iv, I: the second IV has its A bent down to Ab. One note from C minor and the sun goes behind a cloud: the minor iv, the saddest chord in pop.",
    },
    bvii: {
        chords: ["I", "bVII", "IV", "I"],
        blurb: "I, bVII, IV, I: Bb major does not exist in C major, it is on loan from C minor. The rock chord: bright, but it never leans on home the way V does.",
    },
    bvi: {
        chords: ["I", "bVI", "bVII", "I"],
        blurb: "I, bVI, bVII, I: two borrowed chords walking up to home, Ab then Bb then C. The epic cadence of anthems and trailers.",
    },
};

const player = createPlayer({
    canvas, playBtn,
    topMidi: 71, rows: 29, steps: 32, bpm: 100,
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

setPreset("plain");
