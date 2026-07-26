// The phrase demo, for "Phrasing": one four-bar pentatonic melody on the
// shared mini piano-roll, sliced five ways. Question alone (ends hanging
// on D), answer alone (sits down on C), the full sentence, a run-on
// version with every silence filled, and the delayed answer, where the
// reply enters late and the empty beat leans. The presets were verified
// against buildRhythmPhrasingData before the article's copy claimed what
// the panel says about them (the seam rule).

import { createPlayer, type PNote } from "./lib/player.js";

const canvas = document.getElementById("phr-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("phr-play") as HTMLButtonElement;
const blurb = document.getElementById("phr-blurb") as HTMLElement;

const buttons: Record<string, HTMLButtonElement> = {
    q: document.getElementById("phr-q") as HTMLButtonElement,
    a: document.getElementById("phr-a") as HTMLButtonElement,
    both: document.getElementById("phr-both") as HTMLButtonElement,
    runon: document.getElementById("phr-runon") as HTMLButtonElement,
    delay: document.getElementById("phr-delay") as HTMLButtonElement,
};

// C major pentatonic, home on C. The question rises and hangs on D; the
// answer retraces the shape and sits down on C.
const Q: PNote[] = [
    { midi: 60, step: 0, len: 2 }, { midi: 62, step: 2, len: 2 },
    { midi: 64, step: 4, len: 2 }, { midi: 67, step: 6, len: 2 },
    { midi: 69, step: 8, len: 6 },
    { midi: 67, step: 16, len: 2 }, { midi: 64, step: 18, len: 2 },
    { midi: 67, step: 20, len: 2 }, { midi: 62, step: 22, len: 4 },
];
const A: PNote[] = [
    { midi: 60, step: 32, len: 2 }, { midi: 62, step: 34, len: 2 },
    { midi: 64, step: 36, len: 2 }, { midi: 67, step: 38, len: 2 },
    { midi: 64, step: 40, len: 6 },
    { midi: 67, step: 48, len: 2 }, { midi: 64, step: 50, len: 2 },
    { midi: 62, step: 52, len: 2 }, { midi: 60, step: 54, len: 8 },
];

// Every breath filled with more pentatonic motion: the line never inhales.
const FILLS: PNote[] = [
    { midi: 67, step: 14, len: 2 },
    { midi: 64, step: 26, len: 2 }, { midi: 67, step: 28, len: 2 }, { midi: 69, step: 30, len: 2 },
    { midi: 69, step: 46, len: 2 },
    { midi: 62, step: 62, len: 2 },
];

// The answer one beat late; the final note trimmed to the bar.
const A_DELAYED: PNote[] = A.map(n => ({
    ...n,
    step: n.step + 4,
    len: n.step + 4 + n.len > 64 ? 64 - (n.step + 4) : n.len,
}));

const PRESETS: Record<string, { notes: PNote[]; blurb: string }> = {
    q: {
        notes: Q,
        blurb: "The question: two bars that end hanging on D, away from home. Feel your ear waiting. That is a comma, not a full stop.",
    },
    a: {
        notes: A,
        blurb: "The answer: two bars that retrace the shape and sit down on C, home. Alone it sounds plain, an answer with nothing to answer.",
    },
    both: {
        notes: [...Q, ...A],
        blurb: "Question, breath, answer: a complete musical sentence. This shape is under most of the melodies you know.",
    },
    runon: {
        notes: [...Q, ...A, ...FILLS],
        blurb: "The same melody with every silence filled. The line never inhales, and a few loops in, you can feel it suffocate.",
    },
    delay: {
        notes: [...Q, ...A_DELAYED],
        blurb: "The answer arrives one beat late, and the silence where it should have started leans forward. The delayed answer: a move worth stealing.",
    },
};

const player = createPlayer({
    canvas,
    playBtn,
    topMidi: 72,
    rows: 16,
    steps: 64,
    bpm: 100,
});

function setPreset(key: string): void {
    const p = PRESETS[key];
    if (!p) return;
    for (const [k, b] of Object.entries(buttons)) {
        b.classList.toggle("active", k === key);
    }
    blurb.textContent = p.blurb;
    player.setNotes(p.notes);
}

for (const [k, b] of Object.entries(buttons)) {
    b.addEventListener("click", () => setPreset(k));
}

setPreset("both");
