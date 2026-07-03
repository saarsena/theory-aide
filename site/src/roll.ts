// Interactive mini piano roll for "The piano roll" article: one bar, one
// octave (C3 to C4), a preloaded melody, click to add or remove notes, and
// a looping playhead with Web Audio. Vanilla canvas, the house pattern.

interface Note {
    row: number;  // 0 = top row (C4), 12 = bottom row (C3)
    step: number; // 0..15, sixteenth-note grid
    len: number;  // in steps
}

const STEPS = 16;
const ROWS = 13;
const TOP_MIDI = 72; // C4 (Ableton convention: middle C = C3 = MIDI 60)
const BPM = 100;
const STEP_DUR = 60 / BPM / 4;
const BAR_DUR = STEP_DUR * STEPS;

// A small up-and-down arpeggio that lands back home, with mixed lengths so
// note length = duration is visible at a glance.
let notes: Note[] = [
    { row: 12, step: 0, len: 2 },  // C3
    { row: 8, step: 2, len: 2 },   // E3
    { row: 5, step: 4, len: 2 },   // G3
    { row: 0, step: 6, len: 2 },   // C4
    { row: 5, step: 8, len: 2 },   // G3
    { row: 8, step: 10, len: 2 },  // E3
    { row: 12, step: 12, len: 4 }, // C3, held
];

const canvas = document.getElementById("roll-canvas") as HTMLCanvasElement;
const playBtn = document.getElementById("roll-play") as HTMLButtonElement;
const ctx = canvas.getContext("2d")!;

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK = new Set([1, 3, 6, 8, 10]);
const rowMidi = (row: number) => TOP_MIDI - row;
const rowName = (row: number) => {
    const m = rowMidi(row);
    return `${NAMES[m % 12]}${Math.floor(m / 12) - 2}`;
};
const rowFreq = (row: number) => 440 * Math.pow(2, (rowMidi(row) - 69) / 12);

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// --- Audio: schedule the bar's notes just ahead of each loop pass. ---
let audio: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let nextBarTime = 0;
let barStart = 0;

function scheduleBar(t0: number): void {
    if (!audio || !master) return;
    for (const n of notes) {
        const start = t0 + n.step * STEP_DUR;
        const end = start + n.len * STEP_DUR;
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 0.01);
        gain.gain.setValueAtTime(0.16, end - 0.03);
        gain.gain.linearRampToValueAtTime(0, end);
        gain.connect(master);
        const osc = audio.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(rowFreq(n.row), start);
        osc.connect(gain);
        osc.start(start);
        osc.stop(end + 0.01);
    }
}

function startLoop(): void {
    audio ??= new AudioContext();
    void audio.resume();
    master = audio.createGain();
    master.gain.setValueAtTime(0.8, audio.currentTime);
    master.connect(audio.destination);
    barStart = audio.currentTime + 0.06;
    nextBarTime = barStart;
    timer = window.setInterval(() => {
        if (!audio) return;
        if (audio.currentTime > nextBarTime - 0.12) {
            scheduleBar(nextBarTime);
            barStart = nextBarTime;
            nextBarTime += BAR_DUR;
        }
    }, 25);
    playBtn.textContent = "Stop";
    playBtn.classList.add("active");
}

function stopLoop(): void {
    if (timer !== null) {
        clearInterval(timer);
        timer = null;
    }
    if (audio && master) {
        master.gain.setTargetAtTime(0, audio.currentTime, 0.03);
    }
    master = null;
    playBtn.textContent = "Play";
    playBtn.classList.remove("active");
}

playBtn.addEventListener("click", () => (timer !== null ? stopLoop() : startLoop()));

// --- Grid geometry (CSS pixels). ---
const GUTTER_L = 36; // note-name labels
const GUTTER_T = 16; // beat numbers

function cellAt(x: number, y: number): { row: number; step: number } | null {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cw = (w - GUTTER_L) / STEPS;
    const ch = (h - GUTTER_T) / ROWS;
    const step = Math.floor((x - GUTTER_L) / cw);
    const row = Math.floor((y - GUTTER_T) / ch);
    if (step < 0 || step >= STEPS || row < 0 || row >= ROWS) return null;
    return { row, step };
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const cell = cellAt(e.clientX - rect.left, e.clientY - rect.top);
    if (!cell) return;
    const hit = notes.findIndex(
        (n) => n.row === cell.row && cell.step >= n.step && cell.step < n.step + n.len,
    );
    if (hit >= 0) notes.splice(hit, 1);
    else notes.push({ row: cell.row, step: cell.step, len: 1 });
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

    const cw = (w - GUTTER_L) / STEPS;
    const ch = (h - GUTTER_T) / ROWS;

    // Row stripes: black-key rows darker, like Live.
    for (let r = 0; r < ROWS; r++) {
        const y = GUTTER_T + r * ch;
        ctx.fillStyle = BLACK.has(rowMidi(r) % 12) ? css("--panel2") || "#dedbd7" : "#fff";
        ctx.fillRect(GUTTER_L, y, w - GUTTER_L, ch);
    }

    // Grid lines: light per step, heavy per beat (every 4 steps).
    for (let s = 0; s <= STEPS; s++) {
        const x = GUTTER_L + s * cw;
        ctx.strokeStyle = s % 4 === 0 ? css("--dim") || "#666" : css("--line") || "#c8c4bd";
        ctx.lineWidth = s % 4 === 0 ? 1.2 : 0.6;
        ctx.beginPath();
        ctx.moveTo(x, GUTTER_T);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
        const y = GUTTER_T + r * ch;
        ctx.strokeStyle = css("--line") || "#c8c4bd";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(GUTTER_L, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }

    // Labels: note names left (C rows bolder), beat numbers on top.
    ctx.fillStyle = css("--dim") || "#666";
    ctx.textBaseline = "middle";
    for (let r = 0; r < ROWS; r++) {
        const isC = rowMidi(r) % 12 === 0;
        ctx.font = `${isC ? "700 " : ""}9px system-ui, sans-serif`;
        ctx.fillText(rowName(r), 4, GUTTER_T + r * ch + ch / 2);
    }
    ctx.font = "10px system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    for (let b = 0; b < 4; b++) {
        ctx.fillText(String(b + 1), GUTTER_L + b * 4 * cw + 3, 11);
    }

    // Notes.
    for (const n of notes) {
        ctx.fillStyle = css("--green") || "#2a7a30";
        const x = GUTTER_L + n.step * cw;
        const y = GUTTER_T + n.row * ch;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1.5, n.len * cw - 2, ch - 3, 3);
        ctx.fill();
    }

    // Playhead.
    if (timer !== null && audio) {
        const pos = ((audio.currentTime - barStart) % BAR_DUR + BAR_DUR) % BAR_DUR / BAR_DUR;
        if (audio.currentTime >= barStart - 0.05) {
            const x = GUTTER_L + pos * (w - GUTTER_L);
            ctx.strokeStyle = css("--accent") || "#a06800";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, GUTTER_T);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
    }

    requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
