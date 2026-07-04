// Shared mini piano-roll loop player for article demos: draws a read-only
// grid (Live-style row stripes, note-name gutter, beat numbers), loops the
// current notes with Web Audio, and sweeps a playhead. The interactive
// editing version lives in roll.ts (The piano roll article); demos that
// just need "show these notes and play them" use this. Voice 0 is a
// triangle wave, voice 1 a sine, so two lines stay audibly separate.

export interface PNote {
    midi: number;
    step: number;
    len: number;
    voice?: number; // 0 (default) or 1
}

export interface PlayerOpts {
    canvas: HTMLCanvasElement;
    playBtn: HTMLButtonElement;
    topMidi: number; // midi note of the top row
    rows: number;
    steps: number;   // sixteenth-grid columns
    bpm: number;
    colors?: string[]; // per-voice note colors (defaults: green, blue)
}

export interface Player {
    setNotes(notes: PNote[]): void;
    setView(topMidi: number, rows?: number): void;
    stop(): void;
}

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK = new Set([1, 3, 6, 8, 10]);
const noteName = (m: number) => `${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 2}`;
const midiFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const GUTTER_L = 36;
const GUTTER_T = 16;

export function createPlayer(opts: PlayerOpts): Player {
    const { canvas, playBtn, steps, bpm } = opts;
    const ctx = canvas.getContext("2d")!;
    const colors = opts.colors ?? [];
    const stepDur = 60 / bpm / 4;
    const barDur = stepDur * steps;

    let topMidi = opts.topMidi;
    let rows = opts.rows;
    let notes: PNote[] = [];

    let audio: AudioContext | null = null;
    let master: GainNode | null = null;
    let timer: number | null = null;
    let nextBarTime = 0;
    let barStart = 0;

    function scheduleBar(t0: number): void {
        if (!audio || !master) return;
        for (const n of notes) {
            const start = t0 + n.step * stepDur;
            const end = start + n.len * stepDur;
            const gain = audio.createGain();
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.14, start + 0.01);
            gain.gain.setValueAtTime(0.14, end - 0.03);
            gain.gain.linearRampToValueAtTime(0, end);
            gain.connect(master);
            const osc = audio.createOscillator();
            osc.type = (n.voice ?? 0) === 1 ? "sine" : "triangle";
            osc.frequency.setValueAtTime(midiFreq(n.midi), start);
            osc.connect(gain);
            osc.start(start);
            osc.stop(end + 0.01);
        }
    }

    function start(): void {
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
                nextBarTime += barDur;
            }
        }, 25);
        playBtn.textContent = "Stop";
        playBtn.classList.add("active");
    }

    function stop(): void {
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

    playBtn.addEventListener("click", () => (timer !== null ? stop() : start()));

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

        const cw = (w - GUTTER_L) / steps;
        const ch = (h - GUTTER_T) / rows;
        const rowMidi = (r: number) => topMidi - r;

        for (let r = 0; r < rows; r++) {
            const y = GUTTER_T + r * ch;
            ctx.fillStyle = BLACK.has(((rowMidi(r) % 12) + 12) % 12)
                ? css("--panel2") || "#dedbd7"
                : "#fff";
            ctx.fillRect(GUTTER_L, y, w - GUTTER_L, ch);
        }

        for (let s = 0; s <= steps; s++) {
            const x = GUTTER_L + s * cw;
            ctx.strokeStyle = s % 4 === 0 ? css("--dim") || "#666" : css("--line") || "#c8c4bd";
            ctx.lineWidth = s % 4 === 0 ? 1.2 : 0.6;
            ctx.beginPath();
            ctx.moveTo(x, GUTTER_T);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let r = 0; r <= rows; r++) {
            const y = GUTTER_T + r * ch;
            ctx.strokeStyle = css("--line") || "#c8c4bd";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(GUTTER_L, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        ctx.fillStyle = css("--dim") || "#666";
        ctx.textBaseline = "middle";
        for (let r = 0; r < rows; r++) {
            const isC = ((rowMidi(r) % 12) + 12) % 12 === 0;
            ctx.font = `${isC ? "700 " : ""}9px system-ui, sans-serif`;
            ctx.fillText(noteName(rowMidi(r)), 4, GUTTER_T + r * ch + ch / 2);
        }
        ctx.font = "10px system-ui, sans-serif";
        ctx.textBaseline = "alphabetic";
        for (let b = 0; b < steps / 4; b++) {
            ctx.fillText(String(b + 1), GUTTER_L + b * 4 * cw + 3, 11);
        }

        const defaultColors = [css("--green") || "#2a7a30", css("--blue") || "#1855a0"];
        for (const n of notes) {
            const row = topMidi - n.midi;
            if (row < 0 || row >= rows) continue;
            ctx.fillStyle = colors[n.voice ?? 0] ?? defaultColors[n.voice ?? 0] ?? "#2a7a30";
            ctx.beginPath();
            ctx.roundRect(
                GUTTER_L + n.step * cw + 1,
                GUTTER_T + row * ch + 1.5,
                n.len * cw - 2,
                ch - 3,
                3,
            );
            ctx.fill();
        }

        if (timer !== null && audio && audio.currentTime >= barStart - 0.05) {
            const pos = (((audio.currentTime - barStart) % barDur) + barDur) % barDur / barDur;
            const x = GUTTER_L + pos * (w - GUTTER_L);
            ctx.strokeStyle = css("--accent") || "#a06800";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, GUTTER_T);
            ctx.lineTo(x, h);
            ctx.stroke();
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    return {
        setNotes(n: PNote[]): void {
            notes = n;
        },
        setView(newTop: number, newRows?: number): void {
            topMidi = newTop;
            if (newRows !== undefined) rows = newRows;
        },
        stop,
    };
}
