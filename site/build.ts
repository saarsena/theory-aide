// Bundles the site's client-side TS. The site imports the analysis engine
// straight from ../src/theory (single source of truth with the extension)
// and reuses the extension's panel HTML files as text. Eleventy copies
// site/dist → _site/assets (see eleventy.config.js).
import * as esbuild from "esbuild";

const production = process.argv.includes("--production");

await esbuild.build({
    entryPoints: [
        "site/src/main.ts",
        "site/src/waves.ts",
        "site/src/note.ts",
        "site/src/octave.ts",
        "site/src/roll.ts",
        "site/src/pulse.ts",
        "site/src/beat.ts",
        "site/src/meter.ts",
        "site/src/intervals.ts",
        "site/src/triads.ts",
        "site/src/scale.ts",
        "site/src/melody.ts",
        "site/src/keys.ts",
        "site/src/circle.ts",
        "site/src/voices.ts",
        "site/src/motion.ts",
        "site/src/roman.ts",
        "site/src/pentatonic.ts",
        "site/src/temperament.ts",
    ],
    outdir: "site/dist",
    bundle: true,
    format: "iife",
    platform: "browser",
    sourcesContent: false,
    logLevel: "info",
    minify: production,
    sourcemap: !production,
    loader: { ".html": "text" },
});
