// Interactive octave demo for the "Pitch and the octave" article: a base
// note plus a second tone at exactly double (2:1) or almost double (1.9:1)
// the frequency, drawn and audible. Vanilla canvas + Web Audio, the house
// pattern for site visualizations.

interface Mode {
    id: string;
    label: string;
    ratio: number; // 0 = base note alone
    blurb: (low: string, high: string) => string;
}

const MODES: Mode[] = [
    {
        id: "alone",
        label: "One note alone",
        ratio: 0,
        blurb: (low) => `${low} on its own. Remember this sound.`,
    },
    {
        id: "octave",
        label: "Add the octave (2:1)",
        ratio: 2,
        blurb: (low, high) =>
            `${low} plus ${high}, exactly double. The peaks line up every ` +
            `single cycle and the two notes melt into one sound: the same ` +
            `note, higher.`,
    },
    {
        id: "almost",
        label: "Almost an octave (1.9:1)",
        ratio: 1.9,
        blurb: (low, high) =>
            `${low} plus ${high}, almost double but not quite. Nothing lines ` +
            `up, the sum churns, and your ear hears two separate notes arguing.`,
    },
];

const canvas = document.getElementById("octave-canvas") as HTMLCanvasElement;
const picker = document.getElementById("mode-picker") as HTMLElement;
const slider = document.getElementById("base-slider") as HTMLInputElement;
const hearBtn = document.getElementById("hear-btn") as HTMLButtonElement;
const readout = document.getElementById("octave-readout") as HTMLElement;
const ctx = canvas.getContext("2d")!;

// Logarithmic slider: 0..1000 maps to 55..440 Hz, so doubling stays in a
// comfortable range. The default (333) lands on 110 Hz, A1.
const F_MIN = 55;
const F_RANGE = 8;
const freqFromSlider = () => F_MIN * Math.pow(F_RANGE, Number(slider.value) / 1000);

const WINDOW_SEC = 0.03;  // canvas shows 30 ms of air pressure
const PHASE_STEP = 0.001; // radians per frame per Hz ≈ 100× slower than life

let mode = MODES[0]!;
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
    readout.textContent = mode.blurb(label(freq), label(freq * mode.ratio));
}

// --- Audio: two sine oscillators. The second one is always running while
// playing; "one note alone" just gates its gain to zero, so switching modes
// mid-sound morphs smoothly (2:1 curdling into 1.9:1 is the lesson). ---
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
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(LEVEL, t + 0.03);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(mode.ratio ? LEVEL : 0, t + 0.03);
    gain1.connect(audio.destination);
    gain2.connect(audio.destination);
    osc1 = audio.createOscillator();
    osc2 = audio.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * (mode.ratio || 2), t);
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
    if (audio && osc2 && gain2) {
        const t = audio.currentTime;
        gain2.gain.setTargetAtTime(mode.ratio ? LEVEL : 0, t, 0.03);
        osc2.frequency.setTargetAtTime(freq * (mode.ratio || 2), t, 0.05);
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
        osc2.frequency.setTargetAtTime(freq * (mode.ratio || 2), t, 0.02);
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

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";

    if (mode.ratio === 0) {
        trace(css("--green") || "#2a7a30", 2, w, h / 2, h * 0.36, low);
        ctx.fillText("one note, slowed about 100×", 10, 16);
    } else {
        trace(css("--green") || "#2a7a30", 1.5, w, h * 0.25, h * 0.16, low);
        trace(css("--blue") || "#1855a0", 1.5, w, h * 0.25, h * 0.16, high);
        trace(css("--text") || "#1c1c1c", 2.5, w, h * 0.72, h * 0.11, (x) => low(x) + high(x));
        ctx.fillText("the two notes", 10, 16);
        ctx.fillText("their sum: what your ear receives", 10, h * 0.72 - h * 0.13);
    }

    phase += freq * PHASE_STEP;
    requestAnimationFrame(draw);
}

applyMode();
requestAnimationFrame(draw);
