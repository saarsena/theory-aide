// Animated two-wave demo for the Math page: two sine waves and their sum,
// with selectable frequency ratios. Vanilla canvas, no dependencies — the
// house pattern for site visualizations.

interface RatioOption {
    id: string;
    label: string;
    ratio: number;
    blurb: string;
}

const OPTIONS: RatioOption[] = [
    {
        id: "octave",
        label: "Octave (2:1)",
        ratio: 2,
        blurb:
            "The blue wave cycles exactly twice per green cycle. The sum repeats " +
            "perfectly. Your ear hears near-sameness.",
    },
    {
        id: "fifth",
        label: "Perfect fifth (3:2)",
        ratio: 1.5,
        blurb:
            "Three cycles against two. The sum settles into a short repeating " +
            "pattern, consonant and stable.",
    },
    {
        id: "detuned",
        label: "Slightly detuned",
        ratio: 1.04,
        blurb:
            "Almost 1:1 but not quite. Watch the sum swell and fade as the waves " +
            "drift in and out of phase. That's beating.",
    },
];

const canvas = document.getElementById("wave-canvas") as HTMLCanvasElement;
const picker = document.getElementById("ratio-picker") as HTMLElement;
const blurb = document.getElementById("ratio-blurb") as HTMLElement;
const ctx = canvas.getContext("2d")!;

let current = OPTIONS[0]!;
let phase = 0;

const BASE_CYCLES = 3;      // green-wave cycles visible across the canvas
const SPEED = 0.012;        // phase advance per frame

const css = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function trace(
    color: string,
    width: number,
    w: number,
    mid: number,
    amp: number,
    fn: (x: number) => number,
): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let px = 0; px <= w; px++) {
        const y = mid - amp * fn(px / w);
        if (px === 0) ctx.moveTo(px, y);
        else ctx.lineTo(px, y);
    }
    ctx.stroke();
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

    const waveA = (x: number) => Math.sin(2 * Math.PI * BASE_CYCLES * x - phase);
    const waveB = (x: number) =>
        Math.sin(2 * Math.PI * BASE_CYCLES * current.ratio * x - phase * current.ratio);

    // Two source waves in the upper half, their sum in the lower half.
    trace(css("--green"), 1.5, w, h * 0.25, h * 0.16, waveA);
    trace(css("--blue"), 1.5, w, h * 0.25, h * 0.16, waveB);
    trace(css("--text") || "#1c1c1c", 2.5, w, h * 0.72, h * 0.11, x => waveA(x) + waveB(x));

    ctx.fillStyle = css("--dim") || "#666";
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillText("the two notes", 10, 16);
    ctx.fillText("their sum: what your ear receives", 10, h * 0.72 - h * 0.13);

    phase += SPEED;
    requestAnimationFrame(draw);
}

function select(option: RatioOption): void {
    current = option;
    blurb.textContent = option.blurb;
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === option.id);
    }
}

for (const option of OPTIONS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = option.label;
    btn.dataset["id"] = option.id;
    btn.addEventListener("click", () => select(option));
    picker.appendChild(btn);
}

select(current);
requestAnimationFrame(draw);
