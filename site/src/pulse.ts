// The Stockhausen accelerator, for "Organizing time": one looping click
// whose rate sweeps from 2 per second (a rhythm you count) to 220 per
// second (a pitch you hear). The signal never changes, only its speed.
// Vanilla canvas + Web Audio, the house pattern.

const canvas = document.getElementById("pulse-canvas") as HTMLCanvasElement;
const slider = document.getElementById("pulse-slider") as HTMLInputElement;
const hearBtn = document.getElementById("hear-btn") as HTMLButtonElement;
const readout = document.getElementById("pulse-readout") as HTMLElement;
const ctx = canvas.getContext("2d")!;

// Logarithmic slider: 0..1000 maps to 2..220 events per second. The
// default (147) lands on 4 per second, comfortably in rhythm territory.
const E_MIN = 2;
const E_RANGE = 110; // 220 / 2
const eventsFromSlider = () => E_MIN * Math.pow(E_RANGE, Number(slider.value) / 1000);

const WINDOW_SEC = 1;     // canvas shows one second of clicks
const PHASE_STEP = 0.001; // radians per frame per event/sec ≈ 100× slower

let events = eventsFromSlider();
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
    const n = events < 10 ? events.toFixed(1) : String(Math.round(events));
    if (events < 14) {
        readout.textContent = `${n} clicks per second: a rhythm. You can count these.`;
    } else if (events < 30) {
        readout.textContent =
            `${n} clicks per second: the border. Your ear is giving up counting.`;
    } else {
        readout.textContent =
            `${n} clicks per second: a pitch. Nearest note: ${noteName(events)}.`;
    }
}

// --- Audio: one cycle of a decaying click in a looped buffer. The buffer
// is authored at BASE_RATE events per second, so playbackRate is simply
// events / BASE_RATE. Nothing about the click ever changes but its speed. ---
const BASE_RATE = 20;
let audio: AudioContext | null = null;
let src: AudioBufferSourceNode | null = null;
let gain: GainNode | null = null;
const LEVEL = 0.3;

function makeClickBuffer(ac: AudioContext): AudioBuffer {
    const len = Math.round(ac.sampleRate / BASE_RATE);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    const decay = len / 14;
    for (let i = 0; i < len; i++) {
        data[i] = Math.exp(-i / decay);
    }
    return buf;
}

function startClicks(): void {
    audio ??= new AudioContext();
    void audio.resume();
    const t = audio.currentTime;
    gain = audio.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(LEVEL, t + 0.03);
    gain.connect(audio.destination);
    src = audio.createBufferSource();
    src.buffer = makeClickBuffer(audio);
    src.loop = true;
    src.playbackRate.setValueAtTime(events / BASE_RATE, t);
    src.connect(gain);
    src.start();
    hearBtn.textContent = "Stop";
    hearBtn.classList.add("active");
}

function stopClicks(): void {
    if (!audio || !src || !gain) return;
    const t = audio.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.05);
    src.stop(t + 0.06);
    src = null;
    gain = null;
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

hearBtn.addEventListener("click", () => (src ? stopClicks() : startClicks()));

slider.addEventListener("input", () => {
    events = eventsFromSlider();
    updateReadout();
    if (audio && src) {
        src.playbackRate.setTargetAtTime(events / BASE_RATE, audio.currentTime, 0.02);
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

    const base = h * 0.82;
    ctx.strokeStyle = css("--line") || "#c8c4bd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, base);
    ctx.lineTo(w, base);
    ctx.stroke();

    // The click train: the same decaying shape as the audio buffer, one
    // per cycle, scrolling at the (slowed) event rate.
    const cycles = events * WINDOW_SEC;
    ctx.strokeStyle = css("--green") || "#2a7a30";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
        const cyc = cycles * (px / w) - phase / (2 * Math.PI);
        const frac = ((cyc % 1) + 1) % 1;
        const y = base - h * 0.62 * Math.exp(-frac * 14);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("the clicks, slowed about 100×: still just clicks", 10, 16);

    phase += events * PHASE_STEP * 2 * Math.PI;
    requestAnimationFrame(draw);
}

updateReadout();
requestAnimationFrame(draw);
