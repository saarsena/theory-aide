// Twelve-tone / serial analysis: detect prime row, build the 12×12 matrix,
// compute hexachord properties, interval vector, and combinatoriality.

import { mod12, noteName } from "./core.js";
import type { TimedNote } from "./timeline.js";

// ── Row arithmetic ────────────────────────────────────────────────────

function invertRow(P0: number[]): number[] {
    const start = P0[0] ?? 0;
    return P0.map(pc => mod12(2 * start - pc));
}

function transposeRow(row: number[], t: number): number[] {
    return row.map(pc => mod12(pc + t));
}

// ── Matrix ────────────────────────────────────────────────────────────

export interface ToneRowMatrix {
    rows:       number[][];   // 12 × 12, each cell is a pitch class
    noteNames:  string[][];   // same shape, human-readable
    rowLabels:  string[];     // "P0", "P7", etc.  (read left → right)
    colLabels:  string[];     // "I0", "I5", etc.  (read top → bottom)
    // right-to-left = R; bottom-to-top = RI (shown as hints in UI)
}

function buildMatrix(P0: number[]): ToneRowMatrix {
    const I0 = invertRow(P0);
    const start = P0[0] ?? 0;

    const rows: number[][] = [];
    const noteNames: string[][] = [];
    const rowLabels: string[] = [];

    for (let i = 0; i < 12; i++) {
        const t = mod12((I0[i] ?? 0) - start);
        const row = transposeRow(P0, t);
        rows.push(row);
        noteNames.push(row.map(pc => noteName(pc)));
        rowLabels.push(`P${I0[i] ?? 0}`);
    }

    const colLabels = P0.map(pc => `I${pc}`);

    return { rows, noteNames, rowLabels, colLabels };
}

// ── Hexachord ─────────────────────────────────────────────────────────

export interface HexachordInfo {
    h1Names: string[];
    h2Names: string[];
    h1PCs:   number[];
    h2PCs:   number[];
    isComplement: boolean;    // h1 ∪ h2 = all 12 PCs (always true for a complete row)
    iCombinatorial: string | null;  // "I5" — which inversion makes h1+Ih1 = chromatic
    rCombinatorial: boolean;        // row is palindromic in hexachords
}

function hexachordAnalysis(P0: number[]): HexachordInfo {
    const h1PCs = P0.slice(0, 6);
    const h2PCs = P0.slice(6, 12);
    const h1Set = new Set(h1PCs);
    const h2Set = new Set(h2PCs);

    const isComplement = h1PCs.length === 6 && h2PCs.length === 6 &&
        [...h1Set].every(pc => !h2Set.has(pc)) &&
        [...h2Set].every(pc => !h1Set.has(pc));

    // I-combinatorial: find n such that In's first hexachord = complement of h1
    let iCombinatorial: string | null = null;
    const I0 = invertRow(P0);
    for (let t = 0; t < 12; t++) {
        const iForm = transposeRow(I0, t);
        const iH1 = new Set(iForm.slice(0, 6));
        if ([...iH1].every(pc => !h1Set.has(pc))) {
            iCombinatorial = `I${t}`;
            break;
        }
    }

    // R-combinatorial: row's second hexachord = retrograde of first hexachord
    const rCombinatorial = h1PCs.every((pc, i) => pc === h2PCs[5 - i]);

    return {
        h1Names: h1PCs.map(pc => noteName(pc)),
        h2Names: h2PCs.map(pc => noteName(pc)),
        h1PCs, h2PCs,
        isComplement,
        iCombinatorial,
        rCombinatorial,
    };
}

// ── Interval vector ───────────────────────────────────────────────────

function intervalVector(pcs: number[]): number[] {
    const counts = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < pcs.length; i++) {
        for (let j = i + 1; j < pcs.length; j++) {
            const iv = mod12((pcs[j] ?? 0) - (pcs[i] ?? 0));
            const ic = Math.min(iv, 12 - iv);
            if (ic > 0 && ic <= 6) counts[ic - 1]!++;
        }
    }
    return counts;
}

// ── PC extraction ─────────────────────────────────────────────────────

function extractLinearPCs(notes: TimedNote[]): number[] {
    const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);

    // Group notes within 0.05 beats as a simultaneity
    const groups: number[][] = [];
    let lastTime = -999;
    let current: number[] = [];

    for (const n of sorted) {
        if (n.start - lastTime > 0.05) {
            if (current.length) groups.push(current);
            current = [];
            lastTime = n.start;
        }
        const pc = mod12(n.pitch);
        if (!current.includes(pc)) current.push(pc);
    }
    if (current.length) groups.push(current);

    // Flatten, removing consecutive identical PCs (held notes)
    const result: number[] = [];
    for (const group of groups) {
        for (const pc of group) {
            if (result[result.length - 1] !== pc) result.push(pc);
        }
    }
    return result;
}

function detectPrimeRow(orderedPCs: number[]): { row: number[]; complete: boolean } {
    const seen = new Set<number>();
    const row: number[] = [];
    for (const pc of orderedPCs) {
        if (!seen.has(pc)) {
            seen.add(pc);
            row.push(pc);
            if (row.length === 12) break;
        }
    }
    return { row, complete: row.length === 12 };
}

// ── Row-form search in the PC sequence ───────────────────────────────

export interface RowFormMatch {
    label:   string;   // "P3", "I7", "R11", "RI0"
    form:    "P" | "I" | "R" | "RI";
    t:       number;   // transposition (starting PC)
    startIdx: number;  // position in orderedPCs where match begins
    matched:  number;  // how many PCs matched in order (max 12)
    pcs:      number[];// the row form's PCs
}

function allForms(P0: number[]): { label: string; form: "P"|"I"|"R"|"RI"; t: number; pcs: number[] }[] {
    const I0 = invertRow(P0);
    const result = [];
    for (let t = 0; t < 12; t++) {
        const P = transposeRow(P0, t);
        const I = transposeRow(I0, t);
        result.push({ label: `P${mod12(P[0] ?? 0)}`,  form: "P"  as const, t, pcs: P });
        result.push({ label: `I${mod12(I[0] ?? 0)}`,  form: "I"  as const, t, pcs: I });
        result.push({ label: `R${mod12(P[0] ?? 0)}`,  form: "R"  as const, t, pcs: [...P].reverse() });
        result.push({ label: `RI${mod12(I[0] ?? 0)}`, form: "RI" as const, t, pcs: [...I].reverse() });
    }
    return result;
}

function findRowSegments(orderedPCs: number[], P0: number[]): RowFormMatch[] {
    const forms = allForms(P0);
    const segments: RowFormMatch[] = [];
    let pos = 0;

    while (pos < orderedPCs.length) {
        let best: (typeof forms[0] & { matched: number; startIdx: number }) | null = null;

        for (const f of forms) {
            let matched = 0;
            let pcIdx = pos;
            for (const rowPC of f.pcs) {
                // Skip PCs in the sequence that are repetitions (already matched)
                while (pcIdx < orderedPCs.length && orderedPCs[pcIdx] !== rowPC) pcIdx++;
                if (pcIdx >= orderedPCs.length) break;
                matched++;
                pcIdx++;
            }
            if (!best || matched > best.matched) {
                best = { ...f, matched, startIdx: pos };
            }
        }

        if (!best || best.matched < 3) { pos++; continue; }

        segments.push({
            label:    best.label,
            form:     best.form,
            t:        best.t,
            startIdx: pos,
            matched:  best.matched,
            pcs:      best.pcs,
        });
        pos += best.matched;
    }

    return segments;
}

// ── Public interface ──────────────────────────────────────────────────

export interface ToneRowData {
    clipName:    string;
    rangeStart:  number;
    rangeEnd:    number;
    noteCount:   number;
    orderedPCs:  number[];
    orderedPCNames: string[];
    detectedRow: number[] | null;
    rowNames:    string[];
    isComplete:  boolean;
    matrix:      ToneRowMatrix | null;
    hexachord:   HexachordInfo | null;
    intervalVector: number[] | null;
    allForms48:  { label: string; pcs: number[]; names: string[] }[];
    segments:    RowFormMatch[];
}

export function buildToneRowData(
    notes:      TimedNote[],
    rangeStart: number,
    rangeEnd:   number,
    clipName:   string,
): ToneRowData {
    const orderedPCs = extractLinearPCs(notes);
    const { row, complete } = detectPrimeRow(orderedPCs);

    if (row.length < 3) {
        return {
            clipName, rangeStart, rangeEnd,
            noteCount: notes.length,
            orderedPCs, orderedPCNames: orderedPCs.map(pc => noteName(pc)),
            detectedRow: null, rowNames: [],
            isComplete: false,
            matrix: null, hexachord: null, intervalVector: null,
            allForms48: [], segments: [],
        };
    }

    // Pad to 12 if incomplete (analysis is partial)
    const P0 = complete ? row : row;
    const rowNames = P0.map(pc => noteName(pc));

    const matrix      = complete ? buildMatrix(P0) : null;
    const hexachord   = complete ? hexachordAnalysis(P0) : null;
    const iv          = complete ? intervalVector(P0) : null;
    const forms48     = complete
        ? allForms(P0).map(f => ({ label: f.label, pcs: f.pcs, names: f.pcs.map(pc => noteName(pc)) }))
        : [];
    const segments    = complete ? findRowSegments(orderedPCs, P0) : [];

    return {
        clipName, rangeStart, rangeEnd,
        noteCount: notes.length,
        orderedPCs, orderedPCNames: orderedPCs.map(pc => noteName(pc)),
        detectedRow: P0, rowNames,
        isComplete: complete,
        matrix, hexachord,
        intervalVector: iv,
        allForms48: forms48,
        segments,
    };
}
