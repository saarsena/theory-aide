// Packages the extension with a versioned filename derived from
// manifest.json, e.g. Theory-Aide-0.1.0.ablx. Run via: npm run package
import { execSync } from "node:child_process";
import * as fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
const outfile = `${String(manifest.name).replace(/\s+/g, "-")}-${manifest.version}.ablx`;

execSync(`npx extensions-cli package -o "${outfile}"`, { stdio: "inherit" });
console.log(`packaged: ${outfile}`);
