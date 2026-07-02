// Dictionary entries, read from the canonical glossary in src/theory/.
// That JSON is the single source of truth for theory jargon: the site's
// dictionary pages render from it here, and the extension panels' tooltip
// maps should eventually be injected from it at build time (today they
// still carry inline copies — keep them in sync until that lands).
import { readFileSync } from "node:fs";

const raw = JSON.parse(
    readFileSync(new URL("../../src/theory/glossary.json", import.meta.url), "utf8"),
);

export default Object.entries(raw)
    .map(([term, definition]) => ({
        term,
        definition,
        slug: term.replace(/\s+/g, "-"),
    }))
    .sort((a, b) => a.term.localeCompare(b.term));
