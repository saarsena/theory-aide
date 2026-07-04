// Demo for "The circle of fifths": twelve major keys on a wheel. Click one
// to hear its triad and see how many notes it shares with C major. The
// geometry is the lesson: distance on the circle is harmonic distance.

const ORDER: { pc: number; label: string }[] = [
    { pc: 0, label: "C" },
    { pc: 7, label: "G" },
    { pc: 2, label: "D" },
    { pc: 9, label: "A" },
    { pc: 4, label: "E" },
    { pc: 11, label: "B" },
    { pc: 6, label: "F#" },
    { pc: 1, label: "Db" },
    { pc: 8, label: "Ab" },
    { pc: 3, label: "Eb" },
    { pc: 10, label: "Bb" },
    { pc: 5, label: "F" },
];

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const scaleSet = (pc: number) => new Set(MAJOR.map((d) => (pc + d) % 12));
const C_SET = scaleSet(0);

const canvas = document.getElementById("circle-canvas") as HTMLCanvasElement;
const blurb = document.getElementById("circle-blurb") as HTMLElement;
const ctx = canvas.getContext("2d")!;

let selected = 0; // index into ORDER

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// --- Audio: a short major-triad chime on click. ---
let audio: AudioContext | null = null;
const midiFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

function playTriad(pc: number): void {
    audio ??= new AudioContext();
    void audio.resume();
    const t = audio.currentTime;
    const root = 60 + (pc <= 6 ? pc : pc - 12); // keep roots near C3
    for (const off of [0, 4, 7]) {
        const gain = audio.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
        gain.gain.setTargetAtTime(0, t + 0.5, 0.18);
        gain.connect(audio.destination);
        const osc = audio.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(midiFreq(root + off), t);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 1.4);
    }
}

function describe(): void {
    const k = ORDER[selected]!;
    if (selected === 0) {
        blurb.textContent =
            "C major, the reference. Click any other key to hear its chord " +
            "and see how much it shares with C.";
        return;
    }
    const shared = [...scaleSet(k.pc)].filter((pc) => C_SET.has(pc)).length;
    const steps = Math.min(selected, 12 - selected);
    blurb.textContent =
        `${k.label} major: ${steps} step${steps === 1 ? "" : "s"} around the ` +
        `circle from C, sharing ${shared} of 7 notes with C major. ` +
        (steps === 1
            ? "Next-door neighbors: one note changed, so moving here is smooth."
            : steps >= 5
                ? "The far side: barely any common ground, so it sounds like leaving the country."
                : "Each step swaps exactly one more note away from C.");
}

function nodePos(i: number, w: number, h: number): { x: number; y: number } {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2 - 28;
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
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

    ctx.strokeStyle = css("--line") || "#c8c4bd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    const r = Math.min(w, h) / 2 - 28;
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 12; i++) {
        const { x, y } = nodePos(i, w, h);
        const isSel = i === selected;
        const isC = i === 0;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? css("--accent") || "#a06800" : isC ? css("--panel2") || "#dedbd7" : "#fff";
        ctx.fill();
        ctx.strokeStyle = isC && !isSel ? css("--dim") || "#666" : css("--line") || "#c8c4bd";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = isSel ? "#fff" : css("--text") || "#1c1c1c";
        ctx.font = "700 12px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(ORDER[i]!.label, x, y);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("each step clockwise: up a fifth, one note swapped", 10, 16);

    requestAnimationFrame(draw);
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = 0; i < 12; i++) {
        const p = nodePos(i, canvas.clientWidth, canvas.clientHeight);
        if (Math.hypot(x - p.x, y - p.y) <= 18) {
            selected = i;
            playTriad(ORDER[i]!.pc);
            describe();
            return;
        }
    }
});

describe();
requestAnimationFrame(draw);
