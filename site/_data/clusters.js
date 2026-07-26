// Track 2: the clusters. Track 2 grows in named reading paths, not one
// article at a time, so nothing ships reachable from exactly one sentence
// (the organizing-time lesson). Each cluster is a short teaching order
// through shipped articles; site/CURRICULUM.md still owns the stubs and the
// full planned order. Per the interleave rule (decided 2026-07-04), the
// time-and-phrasing cluster and the modal ascent are one climb and appear
// here as one path.
//
// Like the spine, this file is the single place cluster order lives: add an
// article here when it ships, reorder freely (URLs never move). Titles are
// duplicated from front matter on purpose, so the nav can render without
// loading every article. An article belongs to at most one cluster.
//
// Fields: id (stable, used nowhere in URLs yet), name (shown in the track
// bar), purpose (one plain sentence for /tracks/), hangsOff (the spine
// articles this path grows out of), articles (shipped, in reading order).
export default [
    {
        id: "math-of-sound",
        name: "The math of sound",
        purpose:
            "The arithmetic under all of it: notes as numbers, consonance as " +
            "ratio, rhythm and pitch as one continuum.",
        hangsOff: [
            { slug: "what-is-a-note", title: "What is a note" },
            { slug: "pitch-and-octave", title: "Pitch and octave" },
            { slug: "the-piano-roll", title: "The piano roll" },
            { slug: "intervals", title: "Intervals" },
        ],
        articles: [
            { slug: "math", title: "The Math" },
            { slug: "organizing-time", title: "Organizing time" },
        ],
    },
    {
        id: "harmony-continued",
        name: "Harmony, continued",
        purpose:
            "Chords past the triad: naming them by their job, then why some " +
            "orders of them feel inevitable.",
        hangsOff: [
            { slug: "triads", title: "Triads" },
            { slug: "keys", title: "Keys" },
            { slug: "the-circle-of-fifths", title: "The circle of fifths" },
        ],
        articles: [
            { slug: "roman-numerals", title: "Roman numerals" },
        ],
    },
    {
        id: "the-climb",
        name: "The climb",
        purpose:
            "Time, phrasing, and the modal ascent as one path: safe palette, " +
            "then phrasing, then palettes, then application.",
        hangsOff: [
            { slug: "the-piano-roll", title: "The piano roll" },
            { slug: "melody", title: "Melody" },
            { slug: "the-major-scale", title: "The major scale" },
            { slug: "keys", title: "Keys" },
            { slug: "the-circle-of-fifths", title: "The circle of fifths" },
        ],
        articles: [
            { slug: "pentatonic-and-blues", title: "Pentatonic and blues" },
            { slug: "the-beat", title: "The beat" },
            { slug: "meter", title: "Meter" },
            { slug: "subdivision", title: "Subdivision" },
            { slug: "rests-and-space", title: "Rests and space" },
        ],
    },
];
