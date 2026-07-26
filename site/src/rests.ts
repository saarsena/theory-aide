// The step sequencer, for "Rests and space": one bar of sixteen slices,
// every cell clickable, loaded full on purpose so the reader's first act
// is deletion. A soft pulse layer keeps ticking underneath whatever the
// cells do, so an empty cell is audible as silence against the clock
// rather than as nothing. Same lookahead scheduler as meter.ts and
// subdivision.ts; the first demo on the site with a clickable canvas.

const btnAll = document.getElementById("seq-all") as HTMLButtonElement;
const btnFour = document.getElementById("seq-four") as HTMLButtonElement;
const btnTres = document.getElementById("seq-tres") as HTMLButtonElement;
const btnClave = document.getElementById("seq-clave") as HTMLButtonElement;
const btnClear = document.getElementById("seq-clear") as HTMLButtonElement;
const hearBtn = document.getElementById("seq-hear") as HTMLButtonElement;
const blurb = document.getElementById("seq-blurb") as HTMLElement;
const canvas = document.getElementById("seq-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// --- The bar: 16 sixteenth slices at 105 BPM ---
const N = 16;
const BPM = 105;
const SPB = 60 / BPM / 4; // seconds per slice

// Cells are read at schedule time, so clicking a cell changes the sound
// within one lookahead window: no restart, the bar just keeps rolling.
let cells: boolean[] = Array(N).fill(true);

const PRESETS: Record<string, { on: number[]; blurb: string }> = {
    all: {
        on: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        blurb: "Every slice filled. Technically a rhythm; actually a wall. Start deleting.",
    },
    four: {
        on: [0, 4, 8, 12],
        blurb: "Four on the floor: hits on the beats, silence on every other slice. The club's heartbeat.",
    },
    tres: {
        on: [0, 6, 12],
        blurb: "The tresillo: 3+3+2. The third hit lands early and the gap where you expected it does the pushing.",
    },
    clave: {
        on: [0, 3, 6, 10, 12],
        blurb: "The son clave, 3-2: a tresillo-shaped question, then two hits answering on the beat side. Five hits, eleven rests, whole genres.",
    },
    clear: {
        on: [],
        blurb: "Nothing but the pulse. Sixteen rests, waiting.",
    },
};

function countBlurb(): void {
    const n = cells.filter(Boolean).length;
    blurb.textContent = `${n} of ${N} slices filled, ${N - n} resting.`;
}

function setPreset(key: string): void {
    const p = PRESETS[key];
    if (!p) return;
    cells = Array(N).fill(false);
    for (const i of p.on) cells[i] = true;
    blurb.textContent = p.blurb;
}

btnAll.addEventListener("click", () => setPreset("all"));
btnFour.addEventListener("click", () => setPreset("four"));
btnTres.addEventListener("click", () => setPreset("tres"));
btnClave.addEventListener("click", () => setPreset("clave"));
btnClear.addEventListener("click", () => setPreset("clear"));

// --- Transport ---
const LOOKAHEAD_SEC = 0.12;
const TICK_MS = 30;

let audio: AudioContext | null = null;
let clickBuf: AudioBuffer | null = null;
let running = false;
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

function scheduleClick(ac: AudioContext, at: number, gain: number, rate: number): void {
    const src = ac.createBufferSource();
    src.buffer = clickBuf;
    src.playbackRate.setValueAtTime(rate, at);
    const g = ac.createGain();
    g.gain.setValueAtTime(gain, at);
    src.connect(g);
    g.connect(ac.destination);
    src.start(at);
}

function schedulerTick(): void {
    if (!audio || !running) return;
    const horizon = audio.currentTime + LOOKAHEAD_SEC;
    while (t0 + nextIdx * SPB < horizon) {
        const at = t0 + nextIdx * SPB;
        const slice = nextIdx % N;
        // The pulse layer: soft beat ticks that never stop, so silence in
        // the cell layer stays measured against the clock.
        if (slice % 4 === 0) {
            scheduleClick(audio, at, slice === 0 ? 0.16 : 0.11, 2.4);
        }
        // The cell layer: a low thump wherever a cell is filled.
        if (cells[slice]) {
            scheduleClick(audio, at, 0.5, 0.55);
        }
        nextIdx++;
    }
}

function stop(): void {
    if (timer !== null) { clearInterval(timer); timer = null; }
    running = false;
    hearBtn.textContent = "Hear it";
    hearBtn.classList.remove("active");
}

function start(): void {
    audio ??= new AudioContext();
    void audio.resume();
    clickBuf ??= makeClickBuffer(audio);
    running = true;
    t0 = audio.currentTime + 0.08;
    nextIdx = 0;
    schedulerTick();
    timer = setInterval(schedulerTick, TICK_MS);
    hearBtn.textContent = "Stop";
    hearBtn.classList.add("active");
}

hearBtn.addEventListener("click", () => (running ? stop() : start()));

// --- The clickable grid ---
const MARGIN = 14;
const CELL_GAP = 4;
const BEAT_GAP = 10; // extra room after every group of four

interface Rect { x: number; y: number; w: number; h: number; }

function cellRect(i: number, w: number, h: number): Rect {
    const groups = Math.floor(i / 4);
    const cw = (w - 2 * MARGIN - (N - 1) * CELL_GAP - 3 * BEAT_GAP) / N;
    const x = MARGIN + i * (cw + CELL_GAP) + groups * BEAT_GAP;
    const y = h * 0.32;
    return { x, y, w: cw, h: h * 0.52 };
}

canvas.style.cursor = "pointer";
canvas.addEventListener("pointerdown", (e) => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    for (let i = 0; i < N; i++) {
        const r = cellRect(i, w, h);
        if (e.offsetX >= r.x && e.offsetX <= r.x + r.w &&
            e.offsetY >= r.y && e.offsetY <= r.y + r.h) {
            cells[i] = !cells[i];
            countBlurb();
            return;
        }
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

    let cur = -1;
    if (audio && running) {
        const pulses = (audio.currentTime - t0) / SPB;
        if (pulses >= 0) cur = Math.floor(pulses) % N;
    }

    for (let i = 0; i < N; i++) {
        const r = cellRect(i, w, h);
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 4);
        ctx.fillStyle = cells[i]
            ? (css("--accent") || "#a06800")
            : (css("--panel2") || "#dedbd7");
        ctx.fill();
        if (i === cur) {
            ctx.strokeStyle = css("--green") || "#2a7a30";
            ctx.lineWidth = 3;
            ctx.stroke();
        } else if (!cells[i]) {
            ctx.strokeStyle = css("--line") || "#c8c4bd";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("click a cell to fill or empty it. the empty cells are the rests, and they are doing work", 10, 16);

    requestAnimationFrame(draw);
}

setPreset("all");
requestAnimationFrame(draw);
