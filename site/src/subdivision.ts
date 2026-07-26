// Two demos for "Subdivision", one file. The picker: a steady 4/4 bar
// whose beats stay put while lighter, higher ticks slice the space
// between them in 2, 3, or 4. The flip: one unchanging click train whose
// accents decide whether you hear eight fast beats or two slow beats
// sliced into sixteenths; subdivision is a hearing, not a speed. Same
// lookahead scheduler as meter.ts; one AudioContext serves both demos and
// starting either stops the other.

// --- Elements ---
const subButtons: Record<string, HTMLButtonElement> = {
    "off": document.getElementById("sub-off") as HTMLButtonElement,
    "2": document.getElementById("sub-2") as HTMLButtonElement,
    "3": document.getElementById("sub-3") as HTMLButtonElement,
    "4": document.getElementById("sub-4") as HTMLButtonElement,
};
const subHear = document.getElementById("sub-hear") as HTMLButtonElement;
const subBlurb = document.getElementById("sub-blurb") as HTMLElement;
const subCanvas = document.getElementById("sub-canvas") as HTMLCanvasElement;
const subCtx = subCanvas.getContext("2d")!;

const flipBeats = document.getElementById("flip-beats") as HTMLButtonElement;
const flipSlices = document.getElementById("flip-slices") as HTMLButtonElement;
const flipHear = document.getElementById("flip-hear") as HTMLButtonElement;
const flipBlurb = document.getElementById("flip-blurb") as HTMLElement;
const flipCanvas = document.getElementById("flip-canvas") as HTMLCanvasElement;
const flipCtx = flipCanvas.getContext("2d")!;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// --- Patterns ---
// Levels: 0 slice (quiet high tick), 1 beat, 2 downbeat. The slice voice
// sits above the beat voice in pitch and below it in weight, so the two
// layers read as figure and ground.
type Level = 0 | 1 | 2;
interface Pattern { spb: number; accents: Level[]; div: number; blurb: string; }

const BPM = 90;
const beatPattern = (div: number, blurb: string): Pattern => {
    const accents: Level[] = [];
    for (let beat = 0; beat < 4; beat++) {
        for (let s = 0; s < div; s++) {
            accents.push(s !== 0 ? 0 : beat === 0 ? 2 : 1);
        }
    }
    return { spb: 60 / BPM / div, accents, div, blurb };
};

const SUBS: Record<string, Pattern> = {
    "off": beatPattern(1, "Four beats, nothing inside them. This is where Meter left you."),
    "2": beatPattern(2, "Each beat cut in two: eighths. The beat has not moved."),
    "3": beatPattern(3, "Each beat cut in three: triplets. Rounder, rolling."),
    "4": beatPattern(4, "Each beat cut in four: sixteenths. Busier, and the tempo never changed."),
};

// The flip: identical train, four clicks per second, and only the weights
// differ between the two hearings.
const FLIPS: Record<string, Pattern> = {
    "beats": {
        spb: 0.25, accents: [1], div: 1,
        blurb: "Every click carries beat weight: a sprint at 240 BPM. Your foot has probably already given up and picked every fourth one.",
    },
    "slices": {
        spb: 0.25, accents: [1, 0, 0, 0], div: 4,
        blurb: "Same clicks, same speed. Beat weight on every fourth: now it is a calm 60 BPM, sliced into sixteenths.",
    },
};

let subKey = "off";
let flipKey = "beats";

// --- Transport: one lookahead scheduler for whichever demo is playing ---
const LOOKAHEAD_SEC = 0.12;
const TICK_MS = 30;

let audio: AudioContext | null = null;
let clickBuf: AudioBuffer | null = null;
let running: "sub" | "flip" | null = null;
let pattern: Pattern = SUBS["off"]!;
let t0 = 0;
let nextIdx = 0;
let timer: ReturnType<typeof setInterval> | null = null;

function makeClickBuffer(ac: AudioContext): AudioBuffer {
    const len = Math.round(ac.sampleRate * 0.05);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    const decay = ac.sampleRate / 160;
    for (let i = 0; i < len; i++) {
        data[i] = Math.exp(-i / decay);
    }
    return buf;
}

const LEVEL_GAIN: Record<Level, number> = { 0: 0.12, 1: 0.3, 2: 0.42 };
const LEVEL_RATE: Record<Level, number> = { 0: 2.4, 1: 1, 2: 1.7 };

function scheduleClick(ac: AudioContext, at: number, level: Level): void {
    const src = ac.createBufferSource();
    src.buffer = clickBuf;
    src.playbackRate.setValueAtTime(LEVEL_RATE[level], at);
    const g = ac.createGain();
    g.gain.setValueAtTime(LEVEL_GAIN[level], at);
    src.connect(g);
    g.connect(ac.destination);
    src.start(at);
}

function schedulerTick(): void {
    if (!audio || !running) return;
    const horizon = audio.currentTime + LOOKAHEAD_SEC;
    while (t0 + nextIdx * pattern.spb < horizon) {
        const level = pattern.accents[nextIdx % pattern.accents.length] ?? 0;
        scheduleClick(audio, t0 + nextIdx * pattern.spb, level);
        nextIdx++;
    }
}

function stopTransport(): void {
    if (timer !== null) { clearInterval(timer); timer = null; }
    running = null;
    subHear.textContent = "Hear it";
    subHear.classList.remove("active");
    flipHear.textContent = "Hear it";
    flipHear.classList.remove("active");
}

function startTransport(demo: "sub" | "flip", p: Pattern): void {
    stopTransport();
    audio ??= new AudioContext();
    void audio.resume();
    clickBuf ??= makeClickBuffer(audio);
    running = demo;
    pattern = p;
    t0 = audio.currentTime + 0.08;
    nextIdx = 0;
    schedulerTick();
    timer = setInterval(schedulerTick, TICK_MS);
    const btn = demo === "sub" ? subHear : flipHear;
    btn.textContent = "Stop";
    btn.classList.add("active");
}

/** Elapsed pulses of the playing pattern, or -1 when silent. */
function currentPulse(): number {
    if (!audio || !running) return -1;
    const pulses = (audio.currentTime - t0) / pattern.spb;
    if (pulses < 0) return -1;
    return Math.floor(pulses);
}

// --- Demo 1 wiring ---
function setSub(key: string): void {
    subKey = key;
    for (const [k, b] of Object.entries(subButtons)) {
        b.classList.toggle("active", k === key);
    }
    const p = SUBS[key];
    if (!p) return;
    subBlurb.textContent = p.blurb;
    if (running === "sub") startTransport("sub", p);
}

for (const [k, b] of Object.entries(subButtons)) {
    b.addEventListener("click", () => setSub(k));
}
subHear.addEventListener("click", () =>
    running === "sub" ? stopTransport() : startTransport("sub", SUBS[subKey] ?? SUBS["off"]!));

// --- Demo 2 wiring ---
function setFlip(key: string): void {
    flipKey = key;
    flipBeats.classList.toggle("active", key === "beats");
    flipSlices.classList.toggle("active", key === "slices");
    const p = FLIPS[key];
    if (!p) return;
    flipBlurb.textContent = p.blurb;
    if (running === "flip") startTransport("flip", p);
}

flipBeats.addEventListener("click", () => setFlip("beats"));
flipSlices.addEventListener("click", () => setFlip("slices"));
flipHear.addEventListener("click", () =>
    running === "flip" ? stopTransport() : startTransport("flip", FLIPS[flipKey] ?? FLIPS["beats"]!));

// --- Drawing ---
function sizeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): { w: number; h: number } {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { w, h };
}

// Demo 1: one bar drawn as a ruler, the way Live draws it. Heavy lines are
// beats, light lines are the chosen slices, and the playhead sweeps.
function drawSub(): void {
    const { w, h } = sizeCanvas(subCanvas, subCtx);
    const p = SUBS[subKey] ?? SUBS["off"]!;
    const x0 = 14;
    const x1 = w - 14;
    const yTop = h * 0.3;
    const yBot = h * 0.85;

    subCtx.lineWidth = 1;
    subCtx.strokeStyle = css("--line") || "#c8c4bd";
    for (let i = 0; i < 4 * p.div; i++) {
        if (i % p.div === 0) continue;
        const x = x0 + (x1 - x0) * (i / (4 * p.div));
        subCtx.beginPath();
        subCtx.moveTo(x, yTop + (yBot - yTop) * 0.25);
        subCtx.lineTo(x, yBot);
        subCtx.stroke();
    }
    subCtx.lineWidth = 2;
    subCtx.strokeStyle = css("--text") || "#1c1c1c";
    for (let i = 0; i <= 4; i++) {
        const x = x0 + (x1 - x0) * (i / 4);
        subCtx.beginPath();
        subCtx.moveTo(x, yTop);
        subCtx.lineTo(x, yBot);
        subCtx.stroke();
    }

    if (running === "sub") {
        const barLen = pattern.spb * pattern.accents.length;
        const beats = audio ? (audio.currentTime - t0) / barLen : 0;
        if (beats >= 0) {
            const frac = beats % 1;
            const x = x0 + (x1 - x0) * frac;
            subCtx.strokeStyle = css("--green") || "#2a7a30";
            subCtx.lineWidth = 2;
            subCtx.beginPath();
            subCtx.moveTo(x, yTop - 6);
            subCtx.lineTo(x, yBot + 6);
            subCtx.stroke();
        }
    }

    subCtx.fillStyle = css("--dim") || "#666";
    subCtx.font = "11px system-ui, sans-serif";
    subCtx.fillText("one bar, drawn like the piano roll draws it: heavy lines are beats, light lines are the slices you chose", 10, 16);
}

// Demo 2: the unchanging train as a dot row; only the weights move.
function drawFlip(): void {
    const { w, h } = sizeCanvas(flipCanvas, flipCtx);
    const p = FLIPS[flipKey] ?? FLIPS["beats"]!;
    const n = 8;
    const cur = running === "flip" ? currentPulse() % n : -1;
    const gap = w / (n + 1);
    const r = Math.min(h * 0.11, gap * 0.22);
    for (let i = 0; i < n; i++) {
        const level = p.accents[i % p.accents.length] ?? 0;
        const x = gap * (i + 1);
        const y = h * 0.55;
        flipCtx.beginPath();
        flipCtx.arc(x, y, level === 1 ? r * 1.5 : r, 0, Math.PI * 2);
        flipCtx.fillStyle = i === cur
            ? (css("--green") || "#2a7a30")
            : level === 1 ? (css("--accent") || "#a06800") : (css("--line") || "#c8c4bd");
        flipCtx.fill();
    }
    flipCtx.fillStyle = css("--dim") || "#666";
    flipCtx.font = "11px system-ui, sans-serif";
    flipCtx.fillText("the same eight clicks either way. the weights decide what is a beat and what is a slice", 10, 16);
}

function draw(): void {
    drawSub();
    drawFlip();
    requestAnimationFrame(draw);
}

setSub("off");
setFlip("beats");
requestAnimationFrame(draw);
