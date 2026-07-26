// Two demos for "Meter", one file. The illusion: identical clicks where
// grouping buttons change only the picture, never the sound (Bolton's
// subjective rhythmization, performed on yourself). The accent picker:
// really accented clicks, in 2 / 3 / 4, plus six pulses cut 3+3 or 2+2+2.
// One AudioContext and one lookahead scheduler serve both; starting either
// demo stops the other. Vanilla canvas + Web Audio, the house pattern.
// This is the site's first individually scheduled metronome: the looped
// buffer from beat.ts cannot play accents.

// --- Elements ---
const illNone = document.getElementById("ill-none") as HTMLButtonElement;
const ill3 = document.getElementById("ill-3") as HTMLButtonElement;
const ill4 = document.getElementById("ill-4") as HTMLButtonElement;
const illHear = document.getElementById("ill-hear") as HTMLButtonElement;
const illBlurb = document.getElementById("ill-blurb") as HTMLElement;
const illCanvas = document.getElementById("ill-canvas") as HTMLCanvasElement;
const illCtx = illCanvas.getContext("2d")!;

const grpButtons: Record<string, HTMLButtonElement> = {
    "2": document.getElementById("grp-2") as HTMLButtonElement,
    "3": document.getElementById("grp-3") as HTMLButtonElement,
    "4": document.getElementById("grp-4") as HTMLButtonElement,
    "33": document.getElementById("grp-33") as HTMLButtonElement,
    "222": document.getElementById("grp-222") as HTMLButtonElement,
};
const grpHear = document.getElementById("grp-hear") as HTMLButtonElement;
const grpReadout = document.getElementById("grp-readout") as HTMLElement;
const grpCanvas = document.getElementById("grp-canvas") as HTMLCanvasElement;
const grpCtx = grpCanvas.getContext("2d")!;

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// --- Patterns ---
// Accent levels: 0 weak, 1 secondary, 2 downbeat. The illusion pattern is
// one identical mid-weight click, on purpose: the whole point is that the
// signal carries no grouping.
type Level = 0 | 1 | 2;
interface Pattern { spb: number; accents: Level[]; blurb: string; }

const ILLUSION: Pattern = { spb: 60 / 100, accents: [1], blurb: "" };

const GROUPINGS: Record<string, Pattern> = {
    "2": { spb: 60 / 110, accents: [2, 0], blurb: "ONE two ONE two: a march." },
    "3": { spb: 60 / 110, accents: [2, 0, 0], blurb: "ONE two three: a waltz." },
    "4": { spb: 60 / 110, accents: [2, 0, 0, 0], blurb: "ONE two three four: most of the music you own." },
    "33": { spb: 60 / 220, accents: [2, 0, 0, 1, 0, 0], blurb: "Six quick pulses cut 3+3: two big beats per bar, the 6/8 lilt." },
    "222": { spb: 60 / 220, accents: [2, 0, 1, 0, 1, 0], blurb: "The same six pulses cut 2+2+2: three big beats per bar, a quick waltz. That is 3/4." },
};

let grpKey = "4";
let illGroup = 0; // 0 = no help, 3 or 4 = visual tint only

// --- Transport: one lookahead scheduler for whichever demo is playing ---
const LOOKAHEAD_SEC = 0.12;
const TICK_MS = 30;

let audio: AudioContext | null = null;
let clickBuf: AudioBuffer | null = null;
let running: "ill" | "grp" | null = null;
let pattern: Pattern = ILLUSION;
let t0 = 0;       // audio-clock time of pulse 0
let nextIdx = 0;  // next pulse to schedule
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

// Louder and brighter on the downbeat, a nudge on secondary accents.
const LEVEL_GAIN: Record<Level, number> = { 0: 0.16, 1: 0.3, 2: 0.42 };
const LEVEL_RATE: Record<Level, number> = { 0: 1, 1: 1, 2: 1.7 };

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
    illHear.textContent = "Hear it";
    illHear.classList.remove("active");
    grpHear.textContent = "Hear it";
    grpHear.classList.remove("active");
}

function startTransport(demo: "ill" | "grp", p: Pattern): void {
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
    const btn = demo === "ill" ? illHear : grpHear;
    btn.textContent = "Stop";
    btn.classList.add("active");
}

/** Current pulse index of the playing pattern, or -1 when silent. */
function currentPulse(): number {
    if (!audio || !running) return -1;
    const beats = (audio.currentTime - t0) / pattern.spb;
    if (beats < 0) return -1;
    return Math.floor(beats);
}

// --- Demo 1 wiring: grouping buttons touch only the picture ---
function updateIllusion(): void {
    illNone.classList.toggle("active", illGroup === 0);
    ill3.classList.toggle("active", illGroup === 3);
    ill4.classList.toggle("active", illGroup === 4);
    if (illGroup === 0) {
        illBlurb.textContent =
            "No help, just clicks. Try counting them in threes for a while, then switch to fours: both will feel true.";
    } else if (illGroup === 3) {
        illBlurb.textContent =
            "Every third dot tinted. The sound has not changed by one sample.";
    } else {
        illBlurb.textContent =
            "Every fourth dot tinted. Same clicks, different world.";
    }
}

illNone.addEventListener("click", () => { illGroup = 0; updateIllusion(); });
ill3.addEventListener("click", () => { illGroup = 3; updateIllusion(); });
ill4.addEventListener("click", () => { illGroup = 4; updateIllusion(); });
illHear.addEventListener("click", () =>
    running === "ill" ? stopTransport() : startTransport("ill", ILLUSION));

// --- Demo 2 wiring: pattern buttons change the sound (and restart the bar) ---
function setGrouping(key: string): void {
    grpKey = key;
    for (const [k, b] of Object.entries(grpButtons)) {
        b.classList.toggle("active", k === key);
    }
    const p = GROUPINGS[key];
    if (!p) return;
    grpReadout.textContent = p.blurb;
    if (running === "grp") startTransport("grp", p);
}

for (const [k, b] of Object.entries(grpButtons)) {
    b.addEventListener("click", () => setGrouping(k));
}
grpHear.addEventListener("click", () =>
    running === "grp" ? stopTransport() : startTransport("grp", GROUPINGS[grpKey] ?? ILLUSION));

// --- Drawing: one loop, both canvases ---
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

const ILL_DOTS = 12; // shows whole groups of 3 and of 4

function drawIllusion(): void {
    const { w, h } = sizeCanvas(illCanvas, illCtx);
    const cur = running === "ill" ? currentPulse() % ILL_DOTS : -1;
    const gap = w / (ILL_DOTS + 1);
    const r = Math.min(h * 0.14, gap * 0.32);
    for (let i = 0; i < ILL_DOTS; i++) {
        const x = gap * (i + 1);
        const y = h * 0.55;
        const tinted = illGroup !== 0 && i % illGroup === 0;
        illCtx.beginPath();
        illCtx.arc(x, y, r, 0, Math.PI * 2);
        illCtx.fillStyle = i === cur
            ? (css("--green") || "#2a7a30")
            : tinted ? (css("--accent") || "#a06800") : (css("--line") || "#c8c4bd");
        illCtx.fill();
        // The tint is a suggestion, not an accent: ring it instead of
        // growing it, so the dots stay visibly the same size.
        if (tinted) {
            illCtx.strokeStyle = css("--accent") || "#a06800";
            illCtx.lineWidth = 2;
            illCtx.beginPath();
            illCtx.arc(x, y, r + 4, 0, Math.PI * 2);
            illCtx.stroke();
        }
    }
    illCtx.fillStyle = css("--dim") || "#666";
    illCtx.font = "11px system-ui, sans-serif";
    illCtx.fillText("twelve identical clicks. the tint is only a suggestion, and your ear will take it", 10, 16);
}

function drawGrouping(): void {
    const { w, h } = sizeCanvas(grpCanvas, grpCtx);
    const p = GROUPINGS[grpKey];
    if (!p) return;
    const n = p.accents.length;
    const cur = running === "grp" ? currentPulse() % n : -1;
    const gap = w / (n + 1);
    const r = Math.min(h * 0.11, gap * 0.22);
    const sizeFor = (level: Level) => level === 2 ? r * 1.65 : level === 1 ? r * 1.25 : r;
    for (let i = 0; i < n; i++) {
        const level = p.accents[i] ?? 0;
        const x = gap * (i + 1);
        const y = h * 0.55;
        grpCtx.beginPath();
        grpCtx.arc(x, y, sizeFor(level), 0, Math.PI * 2);
        grpCtx.fillStyle = i === cur
            ? (css("--green") || "#2a7a30")
            : level > 0 ? (css("--accent") || "#a06800") : (css("--line") || "#c8c4bd");
        grpCtx.fill();
    }
    grpCtx.fillStyle = css("--dim") || "#666";
    grpCtx.font = "11px system-ui, sans-serif";
    grpCtx.fillText("the big dot is the downbeat. one downbeat to the next is a bar", 10, 16);
}

function draw(): void {
    drawIllusion();
    drawGrouping();
    requestAnimationFrame(draw);
}

updateIllusion();
setGrouping("4");
requestAnimationFrame(draw);
