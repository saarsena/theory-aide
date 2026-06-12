// Data tables adapted from chordgen-m4l/src/data.js (itself a one-for-one
// port of Composition Aide's music_theory.py). Analysis-only subset:
// progression templates and the chord-symbol parser map are deliberately
// absent — Theory Aide reads harmony, it does not generate it.

export const CHORD_QUALITIES: Record<string, readonly number[]> = {
    // Triads
    "major":       [0, 4, 7],
    "minor":       [0, 3, 7],
    "diminished":  [0, 3, 6],
    "augmented":   [0, 4, 8],
    // Sixth chords
    "major6":      [0, 4, 7, 9],
    "minor6":      [0, 3, 7, 9],
    // Sevenths
    "major7":      [0, 4, 7, 11],
    "minor7":      [0, 3, 7, 10],
    "dominant7":   [0, 4, 7, 10],
    "dim7":        [0, 3, 6, 9],
    "half-dim7":   [0, 3, 6, 10],
    // Ninths
    "major9":      [0, 4, 7, 11, 14],
    "minor9":      [0, 3, 7, 10, 14],
    "dominant9":   [0, 4, 7, 10, 14],
    "add9":        [0, 4, 7, 14],
    // Elevenths and thirteenths
    "minor11":     [0, 3, 7, 10, 14, 17],
    "dominant11":  [0, 4, 7, 10, 14, 17],
    "major13":     [0, 4, 7, 11, 14, 21],
    "minor13":     [0, 3, 7, 10, 14, 21],
    "dominant13":  [0, 4, 7, 10, 14, 21],
    // Suspensions
    "sus2":        [0, 2, 7],
    "sus4":        [0, 5, 7],
    "dominant7sus4": [0, 5, 7, 10],
};

export const QUALITY_TO_SUFFIX: Record<string, string> = {
    "major":      "",
    "minor":      "m",
    "diminished": "dim",
    "augmented":  "aug",
    "major7":     "maj7",
    "minor7":     "m7",
    "dominant7":  "7",
    "dim7":       "dim7",
    "half-dim7":  "m7b5",
    "sus2":       "sus2",
    "sus4":       "sus4",
    "major6":     "6",
    "minor6":     "m6",
    "major9":     "maj9",
    "minor9":     "m9",
    "dominant9":  "9",
    "add9":       "add9",
    "minor11":    "m11",
    "dominant11": "11",
    "major13":    "maj13",
    "minor13":    "m13",
    "dominant13": "13",
    "dominant7sus4": "7sus4",
};

export const SCALE_PATTERNS: Record<string, readonly number[]> = {
    "major":            [2, 2, 1, 2, 2, 2, 1],
    "natural_minor":    [2, 1, 2, 2, 1, 2, 2],
    "harmonic_minor":   [2, 1, 2, 2, 1, 3, 1],
    "melodic_minor":    [2, 1, 2, 2, 2, 2, 1],
    "dorian":           [2, 1, 2, 2, 2, 1, 2],
    "phrygian":         [1, 2, 2, 2, 1, 2, 2],
    "lydian":           [2, 2, 2, 1, 2, 2, 1],
    "mixolydian":       [2, 2, 1, 2, 2, 1, 2],
    "locrian":          [1, 2, 2, 1, 2, 2, 2],
    "pentatonic_major": [2, 2, 3, 2, 3],
    "pentatonic_minor": [3, 2, 2, 3, 2],
    "blues":            [3, 2, 1, 1, 3, 2],
    "chromatic":        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

export const NOTE_NAMES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#",
                                 "G", "G#", "A", "A#", "B"] as const;

export const NOTE_NAMES_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb",
                                 "G", "Ab", "A", "Bb", "B"] as const;

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;

// All modes borrow from major except major itself, which borrows from
// natural minor.
export const PARALLEL_MODE: Record<string, string> = {
    "major":          "natural_minor",
    "natural_minor":  "major",
    "harmonic_minor": "major",
    "melodic_minor":  "major",
    "dorian":         "major",
    "mixolydian":     "major",
    "lydian":         "major",
    "phrygian":       "major",
    "locrian":        "major",
};

// Live's Current Scale Name chooser values → our pattern names. Scales we
// have no pattern for fall back to Song.scaleIntervals at the call site.
export const LIVE_SCALE_TO_PATTERN: Record<string, string> = {
    "Major":            "major",
    "Minor":            "natural_minor",
    "Harmonic Minor":   "harmonic_minor",
    "Melodic Minor":    "melodic_minor",
    "Dorian":           "dorian",
    "Phrygian":         "phrygian",
    "Lydian":           "lydian",
    "Mixolydian":       "mixolydian",
    "Locrian":          "locrian",
    "Major Pentatonic": "pentatonic_major",
    "Minor Pentatonic": "pentatonic_minor",
    "Minor Blues":      "blues",
};
