// Interactive triad-builder for the "Triads" article: three oscillators
// stacked at selectable chord shapes, named live by the actual Theory Aide
// engine (recognizeChord, imported straight from src/theory per the seam
// rule). Vanilla canvas + Web Audio, the house pattern.

import { recognizeChord } from "../../src/theory/core.js";

interface Mode {
    id: string;
    label: string;
    offsets: [number, number | null, number]; // semitones: root, third, fifth
    blurb: string;
}

const MODES: Mode[] = [
    {
        id: "fifth",
        label: "Just the fifth (0·7)",
        offsets: [0, null, 7],
        blurb:
            "Root and fifth only: the power chord. A frame with no picture " +
            "in it, neither happy nor sad.",
    },
    {
        id: "major",
        label: "Major (0·4·7)",
        offsets: [0, 4, 7],
        blurb: "Root, major third, fifth. The bright one.",
    },
    {
        id: "minor",
        label: "Minor (0·3·7)",
        offsets: [0, 3, 7],
        blurb: "Root, minor third (one row lower), fifth. Same frame, shaded mood.",
    },
    {
        id: "dim",
        label: "Diminished (0·3·6)",
        offsets: [0, 3, 6],
        blurb: "Minor third and the fifth shrinks too. Unstable, wants to move.",
    },
    {
        id: "aug",
        label: "Augmented (0·4·8)",
        offsets: [0, 4, 8],
        blurb: "Major third and the fifth stretches. Dreamlike, unresolved.",
    },
];

const canvas = document.getElementById("triad-canvas") as HTMLCanvasElement;
const picker = document.getElementById("mode-picker") as HTMLElement;
const slider = document.getElementById("base-slider") as HTMLInputElement;
const hearBtn = document.getElementById("hear-btn") as HTMLButtonElement;
const readout = document.getElementById("triad-readout") as HTMLElement;
const ctx = canvas.getContext("2d")!;

// The slider picks the root note, snapped to the nearest semitone so the
// engine's name and the sound agree exactly. 0..1000 maps to 55..440 Hz;
// the default (667) lands on A2.
const F_MIN = 55;
const F_RANGE = 8;
const rootMidiFromSlider = () => {
    const f = F_MIN * Math.pow(F_RANGE, Number(slider.value) / 1000);
    return Math.round(69 + 12 * Math.log2(f / 440));
};

const midiFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const WINDOW_SEC = 0.03;
const PHASE_STEP = 0.001;

let mode = MODES[1]!; // start on major, the bright one
let rootMidi = rootMidiFromSlider();
let phase = 0;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Note names, Ableton convention (middle C = C3 = MIDI 60).
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const noteName = (m: number) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 2}`;

function soundingMidi(): number[] {
    return mode.offsets.filter((o): o is number => o !== null).map((o) => rootMidi + o);
}

function updateReadout(): void {
    const notes = soundingMidi().map(noteName).join(" + ");
    if (mode.offsets[1] === null) {
        readout.textContent =
            `${notes}. ${mode.blurb} The engine shrugs at naming it: without ` +
            `the middle note there is no flavor to name.`;
    } else {
        const match = recognizeChord(soundingMidi(), 1)[0];
        const name = match ? match.chord.name : "?";
        readout.textContent =
            `${notes}. ${mode.blurb} The engine reads the notes and says: ${name}.`;
    }
}

// --- Audio: three sine oscillators; the middle one (the third) is gated
// off for the bare fifth, so switching shapes mid-sound morphs the mood. ---
let audio: AudioContext | null = null;
let oscs: OscillatorNode[] | null = null;
let gains: GainNode[] | null = null;
const LEVEL = 0.1;

function targetFreqs(): [number, number, number] {
    const third = mode.offsets[1];
    return [
        midiFreq(rootMidi + mode.offsets[0]),
        midiFreq(rootMidi + (third ?? 4)), // parked at a major third while silent
        midiFreq(rootMidi + mode.offsets[2]),
    ];
}

function startTone(): void {
    audio ??= new AudioContext();
    void audio.resume();
    const t = audio.currentTime;
    const freqs = targetFreqs();
    gains = [];
    oscs = [];
    for (let i = 0; i < 3; i++) {
        const g = audio.createGain();
        const level = i === 1 && mode.offsets[1] === null ? 0 : LEVEL;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(level, t + 0.03);
        g.connect(audio.destination);
        const o = audio.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(freqs[i]!, t);
        o.connect(g);
        o.start();
        gains.push(g);
        oscs.push(o);
    }
    hearBtn.textContent = "Stop";
    hearBtn.classList.add("active");
}

function stopTone(): void {
    if (!audio || !oscs || !gains) return;
    const t = audio.currentTime;
    for (const g of gains) {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + 0.05);
    }
    for (const o of oscs) o.stop(t + 0.06);
    oscs = null;
    gains = null;
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

function applyMode(): void {
    if (audio && oscs && gains) {
        const t = audio.currentTime;
        const freqs = targetFreqs();
        for (let i = 0; i < 3; i++) {
            oscs[i]!.frequency.setTargetAtTime(freqs[i]!, t, 0.05);
        }
        gains[1]!.gain.setTargetAtTime(
            mode.offsets[1] === null ? 0 : LEVEL, t, 0.03);
    }
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === mode.id);
    }
    updateReadout();
}

hearBtn.addEventListener("click", () => (oscs ? stopTone() : startTone()));

slider.addEventListener("input", () => {
    rootMidi = rootMidiFromSlider();
    applyMode();
});

for (const m of MODES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = m.label;
    btn.dataset["id"] = m.id;
    btn.addEventListener("click", () => {
        mode = m;
        applyMode();
    });
    picker.appendChild(btn);
}

function trace(
    color: string,
    width: number,
    w: number,
    mid: number,
    amp: number,
    fn: (x: number) => number,
): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
        const y = mid - amp * fn(px / w);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
    }
    ctx.stroke();
}

function draw(): void {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const rootFreq = midiFreq(rootMidi);
    const cycles = rootFreq * WINDOW_SEC;
    const freqs = targetFreqs();
    const parts = freqs.map((f, i) => {
        const r = f / rootFreq;
        const silent = i === 1 && mode.offsets[1] === null;
        return (x: number) =>
            silent ? 0 : Math.sin(2 * Math.PI * cycles * r * x - phase * r);
    });

    const colors = [
        css("--green") || "#2a7a30",
        css("--blue") || "#1855a0",
        css("--accent") || "#a06800",
    ];
    for (let i = 0; i < 3; i++) {
        if (i === 1 && mode.offsets[1] === null) continue;
        trace(colors[i]!, 1.5, w, h * 0.25, h * 0.13, parts[i]!);
    }
    trace(css("--text") || "#1c1c1c", 2.5, w, h * 0.72, h * 0.085,
        (x) => parts[0]!(x) + parts[1]!(x) + parts[2]!(x));

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("root (green), third (blue), fifth (amber)", 10, 16);
    ctx.fillText("their sum: what your ear receives", 10, h * 0.72 - h * 0.12);

    phase += rootFreq * PHASE_STEP;
    requestAnimationFrame(draw);
}

applyMode();
requestAnimationFrame(draw);
