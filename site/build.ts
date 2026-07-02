// Builds the Theory Aide website bundle. The site imports the analysis
// engine straight from ../src/theory (single source of truth with the
// extension) and reuses the extension's panel HTML files as text.
import * as esbuild from "esbuild";

const production = process.argv.includes("--production");

await esbuild.build({
    entryPoints: ["site/src/main.ts"],
    outfile: "site/dist/main.js",
    bundle: true,
    format: "iife",
    platform: "browser",
    sourcesContent: false,
    logLevel: "info",
    minify: production,
    sourcemap: !production,
    loader: { ".html": "text" },
});
