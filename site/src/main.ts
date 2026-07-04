// Theory Aide site — proof of concept.
//
// The architecture rule this file proves: everything downstream of
// "here are the notes" is shared with the extension.
//   - The engine is imported directly from ../src/theory (no copy).
//   - The panel is the extension's counterpoint.html, byte-for-byte,
//     injected into an iframe the same way showHtml() injects it into
//     a Live modal (token replacement).
// Only the note source differs: curated examples instead of Live.

import { buildCounterpointData } from "../../src/theory/counterpoint.js";
import counterpointHtml from "../../src/counterpoint.html";
import { EXAMPLES, type SiteExample } from "./examples.js";
import { createPlayer, type PNote } from "./lib/player.js";

// Small web-only overrides injected into the panel document:
//   - hide the Close / "What should I do next?" buttons (Live-modal plumbing
//     that has nowhere to go in a browser iframe)
//   - hide the theme toggle; the page controls presentation
const WEB_OVERRIDES =
    "<style>.close-btn, .next-link, #theme-btn { display: none !important; }</style>";

function panelDoc(example: SiteExample): string {
    const data = buildCounterpointData(example.notes, example.rangeStart, example.rangeEnd);
    return counterpointHtml
        .replace("__COUNTERPOINT_JSON__", () => JSON.stringify(data))
        .replace("</head>", WEB_OVERRIDES + "</head>");
}

const picker = document.getElementById("example-picker") as HTMLElement;
const blurb = document.getElementById("example-blurb") as HTMLElement;
const frame = document.getElementById("panel-frame") as HTMLIFrameElement;

// Playable mini-roll of the example above the panel, so the reader sees
// and hears the two voices before reading the checker's verdict. One step
// = one beat here (bpm 30 with sixteenth-step timing = 120 BPM beats);
// the heavy grid lines and top numbers mark the four bars.
const player = createPlayer({
    canvas: document.getElementById("example-canvas") as HTMLCanvasElement,
    playBtn: document.getElementById("example-play") as HTMLButtonElement,
    topMidi: 74,
    rows: 28,
    steps: 16,
    bpm: 30,
});

function toRoll(example: SiteExample): PNote[] {
    return example.notes.map((n) => ({
        midi: n.pitch,
        step: n.start,
        len: n.end - n.start,
        voice: n.track === "Bass" ? 0 : 1,
    }));
}

function select(example: SiteExample): void {
    for (const btn of picker.querySelectorAll("button")) {
        btn.classList.toggle("active", btn.dataset["id"] === example.id);
    }
    blurb.textContent = example.blurb;
    const midis = example.notes.map((n) => n.pitch);
    const top = Math.max(...midis) + 2;
    const bottom = Math.min(...midis) - 2;
    player.setView(top, top - bottom + 1);
    player.setNotes(toRoll(example));
    frame.srcdoc = panelDoc(example);
}

for (const example of EXAMPLES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = example.title;
    btn.dataset["id"] = example.id;
    btn.addEventListener("click", () => select(example));
    picker.appendChild(btn);
}

const first = EXAMPLES[0];
if (first) select(first);
