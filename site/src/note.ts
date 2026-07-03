// Interactive one-note demo for the "What is a note" article: a sine wave
// animated at a user-chosen frequency, with an audible tone via Web Audio.
// Vanilla canvas, no dependencies — the house pattern for site visualizations.

const canvas = document.getElementById("note-canvas") as HTMLCanvasElement;
const slider = document.getElementById("freq-slider") as HTMLInputElement;
const hearBtn = document.getElementById("hear-btn") as HTMLButtonElement;
const readout = document.getElementById("freq-readout") as HTMLElement;
const ctx = canvas.getContext("2d")!;

// Slider is logarithmic so the low octaves get as much room as the high
// ones: 0..1000 maps to 55 Hz..880 Hz (A1 to A5, four octaves).
const F_MIN = 55;
const F_RANGE = 16; // 880 / 55
const freqFromSlider = () => F_MIN * Math.pow(F_RANGE, Number(slider.value) / 1000);

const WINDOW_SEC = 0.02;  // canvas shows 20 ms of air pressure
const PHASE_STEP = 0.001; // radians per frame per Hz ≈ 100× slower than life

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

function updateReadout(): void {
    const hz = Math.round(freq);
    readout.textContent =
        `${hz} Hz: the air moves back and forth ${hz} times every second. ` +
        `Nearest note: ${noteName(freq)}.`;
}

// --- Audio: one sine oscillator, created on demand (browsers require a
// user gesture before sound), gain-ramped to avoid clicks. ---
let audio: AudioContext | null = null;
let osc: OscillatorNode | null = null;
let gain: GainNode | null = null;
const LEVEL = 0.15;

function startTone(): void {
    audio ??= new AudioContext();
    void audio.resume();
    gain = audio.createGain();
    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(LEVEL, audio.currentTime + 0.03);
    gain.connect(audio.destination);
    osc = audio.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audio.currentTime);
    osc.connect(gain);
    osc.start();
    hearBtn.textContent = "Stop";
    hearBtn.classList.add("active");
}

function stopTone(): void {
    if (!audio || !osc || !gain) return;
    const t = audio.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.05);
    osc.stop(t + 0.06);
    osc = null;
    gain = null;
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

hearBtn.addEventListener("click", () => (osc ? stopTone() : startTone()));

slider.addEventListener("input", () => {
    freq = freqFromSlider();
    updateReadout();
    if (audio && osc) {
        osc.frequency.setTargetAtTime(freq, audio.currentTime, 0.02);
    }
});

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

    // Rest position of the air, then the pressure wave around it.
    ctx.strokeStyle = css("--line") || "#c8c4bd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    const cycles = freq * WINDOW_SEC;
    ctx.strokeStyle = css("--green") || "#2a7a30";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
        const y = h / 2 - h * 0.36 * Math.sin(2 * Math.PI * cycles * (px / w) - phase);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("air pressure at your ear, slowed about 100×", 10, 16);

    phase += freq * PHASE_STEP;
    requestAnimationFrame(draw);
}

updateReadout();
requestAnimationFrame(draw);
