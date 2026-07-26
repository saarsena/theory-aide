// The metronome, for "The beat": one identical click at a chosen tempo,
// 40 to 220 BPM. Nothing distinguishes any click from its neighbors, on
// purpose; grouping the pulse into bars is the next article's business.
// Vanilla canvas + Web Audio, the house pattern (pulse.ts is this demo's
// faster cousin: same looped click, swept into pitch territory).

const canvas = document.getElementById("beat-canvas") as HTMLCanvasElement;
const slider = document.getElementById("beat-slider") as HTMLInputElement;
const hearBtn = document.getElementById("hear-btn") as HTMLButtonElement;
const readout = document.getElementById("beat-readout") as HTMLElement;
const preset90 = document.getElementById("bpm-90") as HTMLButtonElement;
const preset128 = document.getElementById("bpm-128") as HTMLButtonElement;
const ctx = canvas.getContext("2d")!;

let bpm = Number(slider.value);

// Visual pulse position, in whole beats. Advanced by real elapsed time
// (the audio clock while playing) so the drawn pulse stays locked to the
// clicks you hear.
let beatsAccum = 0;
let lastClock = 0;
let clockAnchored = false;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function updateReadout(): void {
    if (bpm < 60) {
        readout.textContent =
            `${bpm} BPM: slower than a resting heartbeat. Each click stands alone, and holding the thread between them takes real effort.`;
    } else if (bpm < 76) {
        readout.textContent =
            `${bpm} BPM: ballad territory, right around a resting heartbeat.`;
    } else if (bpm < 104) {
        readout.textContent =
            `${bpm} BPM: walking pace. The head-nod zone where most hip-hop lives.`;
    } else if (bpm < 135) {
        readout.textContent =
            `${bpm} BPM: quicker than a walk. The dance floor: house lands around 120 to 128, techno a notch above.`;
    } else if (bpm < 160) {
        readout.textContent =
            `${bpm} BPM: harder styles. Listen to your foot: it may have quietly started tapping every other click.`;
    } else {
        readout.textContent =
            `${bpm} BPM: drum and bass country. The clicks are fast but the felt beat is half of this: your foot taps ${Math.round(bpm / 2)}.`;
    }
}

function updatePresets(): void {
    preset90.classList.toggle("active", bpm === 90);
    preset128.classList.toggle("active", bpm === 128);
}

// --- Audio: one click in a looped buffer, authored at BASE_RATE beats per
// second, so playbackRate is (bpm / 60) / BASE_RATE. Only the speed ever
// changes, never the click. ---
const BASE_RATE = 2;
let audio: AudioContext | null = null;
let src: AudioBufferSourceNode | null = null;
let gain: GainNode | null = null;
const LEVEL = 0.3;

function makeClickBuffer(ac: AudioContext): AudioBuffer {
    const len = Math.round(ac.sampleRate / BASE_RATE);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    // Short decay regardless of buffer length: a click, then silence until
    // the loop comes around.
    const decay = ac.sampleRate / 160;
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
    src.playbackRate.setValueAtTime(bpm / 60 / BASE_RATE, t);
    src.connect(gain);
    src.start();
    clockAnchored = false; // re-anchor onto the audio clock next frame
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
    clockAnchored = false; // re-anchor off the audio clock next frame
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

function setBpm(next: number): void {
    bpm = next;
    slider.value = String(next);
    updateReadout();
    updatePresets();
    if (audio && src) {
        src.playbackRate.setTargetAtTime(bpm / 60 / BASE_RATE, audio.currentTime, 0.02);
    }
}

hearBtn.addEventListener("click", () => (src ? stopClicks() : startClicks()));
slider.addEventListener("input", () => setBpm(Number(slider.value)));
preset90.addEventListener("click", () => setBpm(90));
preset128.addEventListener("click", () => setBpm(128));

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

    // Advance by real elapsed seconds, using the audio clock while playing
    // so the picture cannot drift from the sound.
    const now = (audio && src) ? audio.currentTime : performance.now() / 1000;
    if (!clockAnchored) { lastClock = now; clockAnchored = true; }
    let dt = now - lastClock;
    lastClock = now;
    if (dt < 0 || dt > 0.25) dt = 0; // ignore clock-source switches and tab sleeps
    beatsAccum += (bpm / 60) * dt;

    const frac = ((beatsAccum % 1) + 1) % 1;
    const cx = w / 2;
    const cy = h * 0.52;
    const base = Math.min(w, h) * 0.16;

    // Guide ring at the pulse's peak size, so the eye has a reference.
    ctx.strokeStyle = css("--line") || "#c8c4bd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, base * 1.35, 0, Math.PI * 2);
    ctx.stroke();

    // The pulse: jumps on the click, relaxes until the next one. Same
    // decay shape as the audio buffer, drawn instead of heard.
    const r = base * (1 + 0.35 * Math.exp(-frac * 7));
    ctx.fillStyle = css("--green") || "#2a7a30";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("the beat you hear, drawn in real time. no click is special: counting them into fours is your doing", 10, 16);

    requestAnimationFrame(draw);
}

updateReadout();
updatePresets();
requestAnimationFrame(draw);
