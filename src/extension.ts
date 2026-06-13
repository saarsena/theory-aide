import {
    initialize,
    MidiClip,
    MidiTrack,
    Song,
    DataModelObject,
    type ActivationContext,
    type ArrangementSelection,
    type ExtensionContext,
    type Handle,
} from "@ableton-extensions/sdk";

import { Scale, buildDiatonicChords, noteName } from "./theory/core.js";
import { LIVE_SCALE_TO_PATTERN, NOTE_NAMES_SHARP, SCALE_PATTERNS } from "./theory/data.js";
import { analyzeTimeline, type TimedNote, type TimelineAnalysis, keyUsesFlats } from "./theory/timeline.js";
import { romanForChord, harmonicFunction, keyLabel } from "./theory/analyzer.js";

import timelineHtml  from "./timeline.html";
import explainHtml   from "./explain.html";
import referenceHtml from "./reference.html";
import auditHtml     from "./audit.html";
import primerHtml    from "./primer.html";
import nextHtml      from "./next.html";

type Ctx = ExtensionContext<"1.0.0">;

// ── Helpers ──────────────────────────────────────────────────────────

function safeJson(data: unknown): string {
    // < keeps "</script>" sequences inert inside the inline <script>.
    return JSON.stringify(data).replace(/</g, "\\u003c");
}

function showHtml(context: Ctx, html: string, token: string, data: unknown,
                  width: number, height: number): Promise<string> {
    const injected = html.replaceAll(token, () => safeJson(data));
    const url = `data:text/html,${encodeURIComponent(injected)}`;
    return context.ui.showModalDialog(url, width, height);
}

function showMessage(context: Ctx, title: string, body: string): Promise<string> {
    const html = `<!doctype html><html><body style="margin:0;font-family:system-ui;background:#1a1a1a;color:#d8d8d8;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:12px">
<div style="font-size:15px;font-weight:600">${title}</div>
<div style="font-size:13px;color:#999;max-width:320px;text-align:center">${body}</div>
<button onclick='var m={method:"close_and_send",params:["null"]};if(window.webkit&&window.webkit.messageHandlers&&window.webkit.messageHandlers.live)window.webkit.messageHandlers.live.postMessage(m);else if(window.chrome&&window.chrome.webview)window.chrome.webview.postMessage(m);' style="margin-top:8px;background:#2f2f2f;color:#ddd;border:1px solid #444;border-radius:4px;padding:6px 18px;cursor:pointer">OK</button>
</body></html>`;
    return context.ui.showModalDialog(`data:text/html,${encodeURIComponent(html)}`, 400, 200);
}

/** Live's key (when Scale Mode is on) as an analysis Scale; null otherwise. */
function liveKey(song: Song<"1.0.0">): { root: number; scale: Scale; label: string } | null {
    if (!song.scaleMode) return null;
    const root = Number(song.rootNote);
    const liveName = song.scaleName;
    const pattern = LIVE_SCALE_TO_PATTERN[liveName];
    const scale = pattern
        ? new Scale(root, pattern)
        : Scale.fromIntervals(root, song.scaleIntervals.map(Number), liveName);
    const rootName = noteName(root);
    return { root, scale, label: `${rootName} ${liveName}` };
}

// ── Audit helpers ────────────────────────────────────────────────────

/** Pitch-class → circle-of-fifths position (C=0, G=1, D=2, … F=11). */
const PC_TO_COF = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5] as const;

/** Minimum steps around the circle of fifths between two key centres.
 *  Relative major/minor pairs share the same CoF position (distance 0). */
function cofDist(root1: number, scale1: string, root2: number, scale2: string): number {
    const adj1 = scale1.includes("minor") ? (root1 + 3) % 12 : root1;
    const adj2 = scale2.includes("minor") ? (root2 + 3) : root2;
    const p1 = PC_TO_COF[((adj1 % 12) + 12) % 12] ?? 0;
    const p2 = PC_TO_COF[((Number(adj2) % 12) + 12) % 12] ?? 0;
    const d = Math.abs(p1 - p2);
    return Math.min(d, 12 - d);
}

// ── Clip note extraction ─────────────────────────────────────────────

/**
 * Project a clip's notes onto the absolute arrangement timeline, unrolling
 * loops, and clamp to [rangeStart, rangeEnd]. Note times inside a clip are
 * relative to the clip's internal timeline, where the start marker is the
 * point aligned with clip.startTime in the arrangement.
 */
function arrangementNotes(
    clip: MidiClip<"1.0.0">,
    trackName: string,
    rangeStart: number,
    rangeEnd: number,
): TimedNote[] {
    const out: TimedNote[] = [];
    const clipStart = clip.startTime;
    const clipEnd = clip.endTime;
    const lo = Math.max(rangeStart, clipStart);
    const hi = Math.min(rangeEnd, clipEnd);
    if (hi <= lo) return out;

    const notes = clip.notes.filter(n => !n.muted);

    const emit = (absStart: number, absEnd: number, pitch: number, velocity: number) => {
        const s = Math.max(absStart, lo);
        const e = Math.min(absEnd, hi);
        if (e - s > 1e-9) out.push({ pitch, start: s, end: e, velocity, track: trackName });
    };

    if (!clip.looping) {
        const offset = clipStart - clip.startMarker;
        for (const n of notes) {
            emit(n.startTime + offset, n.startTime + offset + n.duration, n.pitch, n.velocity ?? 100);
        }
        return out;
    }

    // Looping: iteration 0 plays internal [startMarker, loopEnd), then the
    // loop region [loopStart, loopEnd) repeats until the clip's end.
    const loopLen = clip.loopEnd - clip.loopStart;
    if (loopLen <= 1e-9) return out;

    let arrPos = clipStart;
    let winStart = clip.startMarker;
    const firstLen = clip.loopEnd - clip.startMarker;
    if (firstLen <= 1e-9) winStart = clip.loopStart;

    for (let guard = 0; guard < 4096 && arrPos < hi; guard++) {
        const winEnd = clip.loopEnd;
        const winLen = winEnd - winStart;
        const offset = arrPos - winStart;
        for (const n of notes) {
            if (n.startTime >= winStart && n.startTime < winEnd) {
                // Notes are cut when the playhead jumps back at the loop end.
                const end = Math.min(n.startTime + n.duration, winEnd);
                emit(n.startTime + offset, end + offset, n.pitch, n.velocity ?? 100);
            }
        }
        arrPos += winLen;
        winStart = clip.loopStart;
    }
    return out;
}

/** Notes of a single clip on its own internal timeline (for session clips). */
function clipNotes(clip: MidiClip<"1.0.0">, label: string): { notes: TimedNote[]; start: number; end: number } {
    const active = clip.notes.filter(n => !n.muted);
    const start = clip.looping ? clip.loopStart : clip.startMarker;
    const end = clip.looping ? clip.loopEnd : clip.endMarker;
    const notes: TimedNote[] = [];
    for (const n of active) {
        const s = Math.max(n.startTime, start);
        const e = Math.min(n.startTime + n.duration, end);
        if (e - s > 1e-9) {
            notes.push({ pitch: n.pitch, start: s, end: e, velocity: n.velocity ?? 100, track: label });
        }
    }
    return { notes, start, end };
}

// ── Analysis wiring ──────────────────────────────────────────────────

function runAnalysis(
    song: Song<"1.0.0">,
    notes: TimedNote[],
    rangeStart: number,
    rangeEnd: number,
): TimelineAnalysis {
    const key = liveKey(song);
    return analyzeTimeline(notes, rangeStart, rangeEnd, {
        liveKey: key ?? undefined,
    });
}

function timelineModalData(analysis: TimelineAnalysis) {
    return {
        rangeStart: analysis.rangeStart,
        rangeEnd: analysis.rangeEnd,
        key: analysis.key,
        inferredAgrees: analysis.inferredAgrees,
        trackNames: analysis.trackNames,
        noteCount: analysis.noteCount,
        scaleNotes: analysis.scaleNotes,
        scaleNoteNames: analysis.scaleNoteNames,
        keyCandidates: analysis.keyCandidates.slice(0, 3).map(candidate => ({
            root: candidate.root,
            scaleName: candidate.scaleName,
            label: candidate.label,
        })),
        segments: analysis.segments.map(segment => ({
            start: segment.start,
            end: segment.end,
            chordName: segment.chordName,
            roman: segment.roman,
            fn: segment.fn,
            pcNames: segment.pcNames,
            outliers: segment.outliers.map(outlier => ({
                name: outlier.name,
                severity: outlier.severity,
                explanation: outlier.explanation,
                tracks: outlier.tracks,
            })),
            tension: segment.tension,
            density: segment.density,
        })),
        progressions: analysis.progressions.slice(0, 8),
        resolutionSuggestions: analysis.resolutionSuggestions.slice(0, 4),
        modalColors: analysis.modalColors,
        rangeComparison: analysis.rangeComparison,
        textSummary: analysis.textSummary,
    };
}

// ── Extension entry ──────────────────────────────────────────────────

export function activate(activation: ActivationContext) {
    const context = initialize(activation, "1.0.0");
    const song = context.application.song;
    let timelineRunning = false;

    // ── Harmonic Timeline: what do all tracks spell together? ────────

    context.commands.registerCommand("theory.timeline", (arg: unknown) =>
        void (async (selection: ArrangementSelection) => {
            if (timelineRunning) {
                await showMessage(context, "Harmonic Timeline",
                    "Timeline analysis is already running. Wait for the current window to finish opening, then try again.");
                return;
            }
            timelineRunning = true;
            try {
                const rangeStart = selection.time_selection_start;
                const rangeEnd = selection.time_selection_end;
                if (rangeEnd - rangeStart <= 1e-9) {
                    await showMessage(context, "Harmonic Timeline",
                        "Select a time range in the arrangement first.");
                    return;
                }

                const notes: TimedNote[] = [];
                for (const track of song.tracks) {
                    if (!(track instanceof MidiTrack)) continue;
                    for (const clip of track.arrangementClips) {
                        if (clip instanceof MidiClip && !clip.muted) {
                            notes.push(...arrangementNotes(clip, track.name, rangeStart, rangeEnd));
                        }
                    }
                }

                if (!notes.length) {
                    await showMessage(context, "Harmonic Timeline",
                        "No MIDI notes found in the selected range (all tracks were scanned).");
                    return;
                }

                const analysis = runAnalysis(song, notes, rangeStart, rangeEnd);
                await showHtml(context, timelineHtml, "__TIMELINE_JSON__", timelineModalData(analysis), 1040, 760);
            } finally {
                timelineRunning = false;
            }
        })(arg as ArrangementSelection).catch(err => {
            console.error("[theory-aide] timeline failed:", err);
            void showMessage(context, "Error", "Failed to run Harmonic Timeline analysis.");
        }),
    );

    void context.ui.registerContextMenuAction(
        "MidiTrack.ArrangementSelection",
        "Harmonic Timeline (All Tracks)…",
        "theory.timeline",
    );

    // ── Explain Clip: Roman numerals in Live's current key ───────────

    context.commands.registerCommand("theory.explainClip", (arg: unknown) =>
        void (async () => {
            if (!arg) return;
            const obj = context.getObjectFromHandle(arg as Handle, DataModelObject);
            if (!(obj instanceof MidiClip)) return;

            const clip = obj as MidiClip<"1.0.0">;
            const { notes, start, end } = clipNotes(clip, clip.name || "Clip");
            if (!notes.length) {
                await showMessage(context, "Explain Clip", "This clip has no unmuted notes.");
                return;
            }

            const analysis = runAnalysis(song, notes, start, end);
            const data = { ...analysis, clipName: clip.name || "Untitled clip" };
            await showHtml(context, explainHtml, "__EXPLAIN_JSON__", data, 760, 700);
        })().catch(err => {
            console.error("[theory-aide] explain failed:", err);
            void showMessage(context, "Error", "Failed to run Explain Harmony analysis.");
        }),
    );

    void context.ui.registerContextMenuAction(
        "MidiClip",
        "Explain Harmony…",
        "theory.explainClip",
    );

    // ── Theory Reference: standalone cheat sheet ─────────────────────

    context.commands.registerCommand("theory.reference", (_arg: unknown) =>
        void (async () => {
            const refData = buildReferenceData(song);
            await showHtml(context, referenceHtml, "__REFERENCE_JSON__", refData, 820, 700);
        })().catch(err => {
            console.error("[theory-aide] reference failed:", err);
            void showMessage(context, "Error", "Failed to open Theory Reference.");
        }),
    );

    void context.ui.registerContextMenuAction(
        "MidiClip",
        "Theory Reference…",
        "theory.reference",
    );

    void context.ui.registerContextMenuAction(
        "Scene",
        "Theory Reference…",
        "theory.reference",
    );

    // ── Music Theory Primer ───────────────────────────────────────────

    context.commands.registerCommand("theory.primer", (_arg: unknown) =>
        void (async () => {
            const lk = liveKey(song);
            const useFlats = lk ? keyUsesFlats(lk.root, lk.scale.patternName) : false;
            const primerData = lk
                ? {
                    key: { root: lk.root, scaleName: lk.scale.patternName, label: lk.label },
                    scaleNotes: lk.scale.notes,
                    scaleNoteNames: lk.scale.notes.map(pc => noteName(pc, useFlats)),
                }
                : { key: null, scaleNotes: [], scaleNoteNames: [] };
            await showHtml(context, primerHtml, "__PRIMER_JSON__", primerData, 840, 660);
        })().catch(err => {
            console.error("[theory-aide] primer failed:", err);
            void showMessage(context, "Error", "Failed to open Music Theory Primer.");
        }),
    );

    void context.ui.registerContextMenuAction(
        "Scene",
        "Music Theory Primer…",
        "theory.primer",
    );

    void context.ui.registerContextMenuAction(
        "MidiClip",
        "Music Theory Primer…",
        "theory.primer",
    );

    // ── What Next: arrangement workflow after finding a good idea ─────────

    context.commands.registerCommand("theory.whatNext", (_arg: unknown) =>
        void (async () => {
            await showHtml(context, nextHtml, "__NEXT_JSON__", {}, 820, 700);
        })().catch(err => {
            console.error("[theory-aide] what next failed:", err);
            void showMessage(context, "Error", "Failed to open What Do I Do Next.");
        }),
    );

    void context.ui.registerContextMenuAction(
        "Scene",
        "What Do I Do Next?…",
        "theory.whatNext",
    );

    void context.ui.registerContextMenuAction(
        "MidiClip",
        "What Do I Do Next?…",
        "theory.whatNext",
    );


    // ── Session Audit: set-wide harmonic lint ─────────────────────────

    context.commands.registerCommand("theory.audit", (_arg: unknown) =>
        void (async () => {
            const lk = liveKey(song);
            const scalePCSet = lk ? new Set(lk.scale.notes) : null;

            // Collect all MIDI clips (session view + arrangement)
            interface ClipTask {
                trackName: string;
                trackIndex: number;
                clip: MidiClip<"1.0.0">;
                isArrangement: boolean;
                sceneIndex: number | null;
            }

            const tasks: ClipTask[] = [];
            const tracks = song.tracks;

            for (let ti = 0; ti < tracks.length; ti++) {
                const track = tracks[ti];
                if (!(track instanceof MidiTrack)) continue;

                // Session clips
                for (let si = 0; si < track.clipSlots.length; si++) {
                    const slot = track.clipSlots[si];
                    if (!slot) continue;
                    const clip = slot.clip;
                    if (!(clip instanceof MidiClip)) continue;
                    tasks.push({ trackName: track.name, trackIndex: ti,
                                 clip, isArrangement: false, sceneIndex: si });
                }

                // Arrangement clips
                for (const clip of track.arrangementClips) {
                    if (!(clip instanceof MidiClip)) continue;
                    tasks.push({ trackName: track.name, trackIndex: ti,
                                 clip, isArrangement: true, sceneIndex: null });
                }
            }

            if (!tasks.length) {
                await showMessage(context, "Session Audit",
                    "No MIDI clips found in this session.");
                return;
            }

            interface ClipAuditResult {
                trackName: string; trackIndex: number;
                sceneName: string | null; sceneIndex: number | null;
                clipName: string; noteCount: number;
                inferredKey: string | null;
                outOfKeyCount: number; outOfKeyPercent: number;
                severity: "ok" | "warn" | "error";
                isArrangement: boolean;
            }

            const results: ClipAuditResult[] = [];
            const keyCounts = new Map<string, number>();
            const scenes = song.scenes;

            for (const task of tasks) {
                try {
                    const { notes, start, end } = clipNotes(task.clip, task.trackName);
                    if (!notes.length) continue;

                    // Neutral inference: no liveKey so we see what the clip *itself* suggests
                    const analysis = analyzeTimeline(notes, start, end);
                    const bestKey = analysis.keyCandidates[0];

                    // Count notes outside Live's key scale
                    let outOfKeyCount = 0;
                    if (scalePCSet) {
                        for (const note of notes) {
                            if (!scalePCSet.has(((note.pitch % 12) + 12) % 12)) outOfKeyCount++;
                        }
                    }
                    const outOfKeyPercent = Math.round((outOfKeyCount / notes.length) * 100);

                    // Severity: primary = out-of-key %, secondary = CoF distance
                    let severity: "ok" | "warn" | "error" = "ok";
                    if (lk) {
                        const dist = bestKey
                            ? cofDist(bestKey.root, bestKey.scaleName, lk.root, lk.scale.patternName)
                            : 6;
                        if (outOfKeyPercent > 25 || dist >= 5) {
                            severity = "error";
                        } else if (outOfKeyPercent > 8 || dist >= 3) {
                            severity = "warn";
                        }
                    }

                    if (bestKey) {
                        keyCounts.set(bestKey.label, (keyCounts.get(bestKey.label) ?? 0) + 1);
                    }

                    const sceneName = !task.isArrangement && task.sceneIndex !== null
                        ? (scenes[task.sceneIndex]?.name || `Scene ${task.sceneIndex + 1}`)
                        : null;

                    results.push({
                        trackName: task.trackName, trackIndex: task.trackIndex,
                        sceneName, sceneIndex: task.sceneIndex,
                        clipName: task.clip.name || "(unnamed)",
                        noteCount: notes.length,
                        inferredKey: bestKey?.label ?? null,
                        outOfKeyCount, outOfKeyPercent,
                        severity,
                        isArrangement: task.isArrangement,
                    });
                } catch (err) {
                    console.error(`[theory-aide] audit clip "${task.clip.name}" failed:`, err);
                }
            }

            // Dominant inferred key (for key-mismatch suggestion)
            const dominantInferredKey = keyCounts.size > 0
                ? ([...keyCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null)
                : null;

            const okCount    = results.filter(r => r.severity === "ok").length;
            const warnCount  = results.filter(r => r.severity === "warn").length;
            const errorCount = results.filter(r => r.severity === "error").length;

            await showHtml(context, auditHtml, "__AUDIT_JSON__", {
                liveKey: lk ? { root: lk.root, scaleName: lk.scale.patternName, label: lk.label } : null,
                scaleMode: !!lk,
                scannedClips: tasks.length,
                analyzedClips: results.length,
                dominantInferredKey,
                results,
                summary: { okCount, warnCount, errorCount },
            }, 720, 580);
        })().catch(err => console.error("[theory-aide] audit failed:", err)),
    );

    void context.ui.registerContextMenuAction(
        "Scene",
        "Audit Session…",
        "theory.audit",
    );

    console.log("[theory-aide] activated");
}

// ── Reference data builder ───────────────────────────────────────────────

interface DiatonicChordInfo {
    roman: string;
    chordName: string;
    quality: string;
    fn: string | null;
}

interface ReferenceData {
    key: { root: number; scaleName: string; label: string; source: "live" | "unavailable" };
    scaleNoteNames: string[];
    scaleNotes: number[];
    scaleFormula: number[];
    triads: DiatonicChordInfo[];
    sevenths: DiatonicChordInfo[];
}

function buildReferenceData(song: Song<"1.0.0">): ReferenceData {
    const lk = liveKey(song);
    let root      = 0;
    let scale     = new Scale(0, "major");
    let scaleName = "major";
    let label     = "C major";
    let source: "live" | "unavailable" = "unavailable";

    if (lk) {
        root      = lk.root;
        scale     = lk.scale;
        scaleName = scale.patternName;
        label     = lk.label;
        source    = "live";
    }

    const triads   = buildDiatonicChords(scale, false);
    const sevenths = buildDiatonicChords(scale, true);

    const useFlats = keyUsesFlats(root, scaleName);

    const toInfo = (chord: ReturnType<typeof buildDiatonicChords>[0]): DiatonicChordInfo => ({
        roman:     romanForChord(chord, scale).label,
        chordName: chord.getName(useFlats),
        quality:   chord.quality,
        fn:        harmonicFunction(chord, scale),
    });

    const pattern = SCALE_PATTERNS[scaleName];

    return {
        key:          { root, scaleName, label, source },
        scaleNoteNames: scale.notes.map(pc => noteName(pc, useFlats)),
        scaleNotes:   scale.notes,
        scaleFormula: pattern ? [...pattern] : [],
        triads:       triads.map(toInfo),
        sevenths:     sevenths.map(toInfo),
    };
}
