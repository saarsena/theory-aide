// Demo for "The math behind music": hear the tuning compromise. The same
// major triad, played in Just intonation (small whole-number ratios) and in
// Equal temperament (the 12th root of 2). The just chord locks; the equal
// chord beats, because its major third sits 13.7 cents sharp of pure and its
// harmonics grind against the root's. Sawtooth tones (harmonic-rich) are
// required for that beat to exist; sines would sit silent and steady.
//
// Root fixed at A2 = 110 Hz. Ratios and cents are computed here, not
// hardcoded, and match scratchpad verification (comma 23.46c, ET third
// +13.69c, beat ~4.4 Hz).

const ROOT_HZ = 110; // A2

interface Tuning {
    id: string;
    label: string;
    // ratios of root, major third, fifth above the root
    ratios: [number, number, number];
}

const JUST: Tuning = { id: "just", label: "Just intonation", ratios: [1, 5 / 4, 3 / 2] };
const EQUAL: Tuning = {
    id: "equal",
    label: "Equal temperament",
    ratios: [1, Math.pow(2, 4 / 12), Math.pow(2, 7 / 12)],
};

const cents = (ratio: number) => 1200 * Math.log2(ratio);

const canvas = document.getElementById("temper-canvas") as HTMLCanvasElement;
const picker = document.getElementById("tuning-picker") as HTMLElement;
const hearBtn = document.getElementById("temper-hear") as HTMLButtonElement;
const readout = document.getElementById("temper-readout") as HTMLElement;
const ctx = canvas.getContext("2d")!;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

let tuning = JUST;
let phase = 0;

function freqs(): [number, number, number] {
    return tuning.ratios.map(r => ROOT_HZ * r) as [number, number, number];
}

function updateReadout(): void {
    const thirdCents = cents(tuning.ratios[1]);
    if (tuning.id === "just") {
        readout.textContent =
            "The pure major third is the ratio 5:4 exactly. Every note's " +
            "harmonics line up with the root's, so the chord locks and sits " +
            "perfectly still. Beautiful, and playable in only one key.";
    } else {
        readout.textContent =
            `The equal-tempered major third is ${thirdCents.toFixed(1)} cents ` +
            "sharp of pure, the price of making all twelve keys equally " +
            "playable. Its harmonics grind against the root's, and you hear " +
            "the result: a shimmer of about four beats a second. Your piano " +
            "does this on every major chord.";
    }
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === tuning.id);
    }
}

// ── Audio: three sawtooth oscillators through a gentle lowpass, so the
// upper harmonics that do the beating are present but not harsh. ──
let audio: AudioContext | null = null;
let oscs: OscillatorNode[] | null = null;
let master: GainNode | null = null;
const LEVEL = 0.06;

function startTone(): void {
    audio ??= new AudioContext();
    void audio.resume();
    const t = audio.currentTime;
    master = audio.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(1, t + 0.03);
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2600;
    master.connect(lp);
    lp.connect(audio.destination);

    oscs = freqs().map(f => {
        const g = audio!.createGain();
        g.gain.value = LEVEL;
        g.connect(master!);
        const o = audio!.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f, t);
        o.connect(g);
        o.start();
        return o;
    });
    hearBtn.textContent = "Stop";
    hearBtn.classList.add("active");
}

function stopTone(): void {
    if (!audio || !oscs || !master) return;
    const t = audio.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.05);
    for (const o of oscs) o.stop(t + 0.07);
    oscs = null;
    master = null;
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

function retune(): void {
    if (audio && oscs) {
        const t = audio.currentTime;
        freqs().forEach((f, i) => oscs![i]!.frequency.setTargetAtTime(f, t, 0.03));
    }
}

hearBtn.addEventListener("click", () => (oscs ? stopTone() : startTone()));

for (const tng of [JUST, EQUAL]) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = tng.label;
    btn.dataset["id"] = tng.id;
    btn.addEventListener("click", () => {
        tuning = tng;
        retune();
        updateReadout();
    });
    picker.appendChild(btn);
}

// ── Canvas: the summed waveform over a ~0.4s window, each note approximated
// by six harmonics (1/n amplitude) so the beating that you hear is the
// beating that you see. Just locks into a steady shape; Equal pulses. ──
const WINDOW_SEC = 0.4;
const HARMONICS = 6;

function partial(f: number, x: number): number {
    let y = 0;
    for (let n = 1; n <= HARMONICS; n++) y += Math.sin(2 * Math.PI * f * n * x) / n;
    return y;
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

    const fs = freqs();
    const mid = h * 0.5;
    const amp = h * 0.22;
    const shift = phase * WINDOW_SEC;

    ctx.strokeStyle = css("--text") || "#1c1c1c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
        const x = (px / w) * WINDOW_SEC + shift;
        const sum = (partial(fs[0], x) + partial(fs[1], x) + partial(fs[2], x)) / 3;
        const y = mid - amp * sum;
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText(
        tuning.id === "just" ? "just: the shape locks and holds still"
            : "equal: watch the amplitude pulse (that pulse is the beating)",
        10, 16);

    phase += 0.0025;
    if (phase > 1) phase -= 1;
    requestAnimationFrame(draw);
}

updateReadout();
requestAnimationFrame(draw);
