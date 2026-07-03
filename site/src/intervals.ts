// Interactive interval-tasting demo for the "Intervals" article: a base
// note plus a second tone at a selectable interval, drawn and audible.
// Same instrument as the octave demo, wider palette. Vanilla canvas +
// Web Audio, the house pattern.

interface Mode {
    id: string;
    label: string;
    ratio: number;
    blurb: string;
}

const MODES: Mode[] = [
    {
        id: "unison",
        label: "Unison (0)",
        ratio: 1,
        blurb: "The same note twice. Total fusion: it just gets thicker.",
    },
    {
        id: "semitone",
        label: "Semitone (1)",
        ratio: 16 / 15,
        blurb:
            "One row apart on the piano roll, the smallest step. The waves " +
            "never settle: pure rub.",
    },
    {
        id: "min3",
        label: "Minor third (3)",
        ratio: 6 / 5,
        blurb: "Three semitones. Sweet but shaded: the minor in minor chords.",
    },
    {
        id: "maj3",
        label: "Major third (4)",
        ratio: 5 / 4,
        blurb: "Four semitones. The bright sweetness at the heart of major chords.",
    },
    {
        id: "tritone",
        label: "Tritone (6)",
        ratio: Math.SQRT2,
        blurb:
            "Six semitones, exactly half an octave. No tidy ratio exists, " +
            "and you can hear that.",
    },
    {
        id: "fifth",
        label: "Perfect fifth (7)",
        ratio: 3 / 2,
        blurb:
            "Seven semitones. Open, strong, almost fusing: the most stable " +
            "interval after the octave.",
    },
    {
        id: "octave",
        label: "Octave (12)",
        ratio: 2,
        blurb: "Twelve semitones: the same note, higher.",
    },
];

const canvas = document.getElementById("interval-canvas") as HTMLCanvasElement;
const picker = document.getElementById("mode-picker") as HTMLElement;
const slider = document.getElementById("base-slider") as HTMLInputElement;
const hearBtn = document.getElementById("hear-btn") as HTMLButtonElement;
const readout = document.getElementById("interval-readout") as HTMLElement;
const ctx = canvas.getContext("2d")!;

// Logarithmic slider: 0..1000 maps to 55..440 Hz. Default (667) is 220, A2.
const F_MIN = 55;
const F_RANGE = 8;
const freqFromSlider = () => F_MIN * Math.pow(F_RANGE, Number(slider.value) / 1000);

const WINDOW_SEC = 0.03;
const PHASE_STEP = 0.001;

let mode = MODES[3]!; // start on the major third, the sweet one
let freq = freqFromSlider();
let phase = 0;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// Nearest note name, Ableton convention (middle C = C3 = MIDI 60).
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function noteName(f: number): string {
    const midi = Math.round(69 + 12 * Math.log2(f / 440));
    return `${NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 2}`;
}

function label(f: number): string {
    return `${Math.round(f)} Hz (${noteName(f)})`;
}

function updateReadout(): void {
    readout.textContent =
        mode.ratio === 1
            ? `${label(freq)}, twice. ${mode.blurb}`
            : `${label(freq)} + ${label(freq * mode.ratio)}. ${mode.blurb}`;
}

// --- Audio: two sine oscillators, both always sounding while playing, so
// switching intervals mid-sound glides the upper note between flavors. ---
let audio: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let gain1: GainNode | null = null;
let gain2: GainNode | null = null;
const LEVEL = 0.12;

function startTone(): void {
    audio ??= new AudioContext();
    void audio.resume();
    const t = audio.currentTime;
    gain1 = audio.createGain();
    gain2 = audio.createGain();
    for (const g of [gain1, gain2]) {
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(LEVEL, t + 0.03);
        g.connect(audio.destination);
    }
    osc1 = audio.createOscillator();
    osc2 = audio.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * mode.ratio, t);
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc1.start();
    osc2.start();
    hearBtn.textContent = "Stop";
    hearBtn.classList.add("active");
}

function stopTone(): void {
    if (!audio || !osc1 || !osc2 || !gain1 || !gain2) return;
    const t = audio.currentTime;
    for (const g of [gain1, gain2]) {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0, t + 0.05);
    }
    osc1.stop(t + 0.06);
    osc2.stop(t + 0.06);
    osc1 = osc2 = null;
    gain1 = gain2 = null;
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

function applyMode(): void {
    if (audio && osc2) {
        osc2.frequency.setTargetAtTime(freq * mode.ratio, audio.currentTime, 0.05);
    }
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === mode.id);
    }
    updateReadout();
}

hearBtn.addEventListener("click", () => (osc1 ? stopTone() : startTone()));

slider.addEventListener("input", () => {
    freq = freqFromSlider();
    if (audio && osc1 && osc2) {
        const t = audio.currentTime;
        osc1.frequency.setTargetAtTime(freq, t, 0.02);
        osc2.frequency.setTargetAtTime(freq * mode.ratio, t, 0.02);
    }
    updateReadout();
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

    const cycles = freq * WINDOW_SEC;
    const low = (x: number) => Math.sin(2 * Math.PI * cycles * x - phase);
    const high = (x: number) =>
        Math.sin(2 * Math.PI * cycles * mode.ratio * x - phase * mode.ratio);

    trace(css("--green") || "#2a7a30", 1.5, w, h * 0.25, h * 0.16, low);
    trace(css("--blue") || "#1855a0", 1.5, w, h * 0.25, h * 0.16, high);
    trace(css("--text") || "#1c1c1c", 2.5, w, h * 0.72, h * 0.11, (x) => low(x) + high(x));

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("the two notes", 10, 16);
    ctx.fillText("their sum: what your ear receives", 10, h * 0.72 - h * 0.13);

    phase += freq * PHASE_STEP;
    requestAnimationFrame(draw);
}

applyMode();
requestAnimationFrame(draw);
