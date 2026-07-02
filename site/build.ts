// Bundles the site's client-side TS. The site imports the analysis engine
// straight from ../src/theory (single source of truth with the extension)
// and reuses the extension's panel HTML files as text. Eleventy copies
// site/dist → _site/assets (see eleventy.config.js).
import * as esbuild from "esbuild";

const production = process.argv.includes("--production");

await esbuild.build({
    entryPoints: ["site/src/main.ts", "site/src/waves.ts"],
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
