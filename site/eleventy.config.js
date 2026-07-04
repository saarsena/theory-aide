// Eleventy config for the Theory Aide site.
// Input is the site/ directory itself; TS sources and the esbuild output are
// excluded from templating. Bundles land in _site/assets via passthrough.
//
// Article system: encyclopedia articles are Markdown files in site/concepts/.
// The filename is the slug is the permanent URL (/concepts/<slug>/) — see
// site/README.md for the authoring guide and the slug-stability rule.
import { readFileSync, readdirSync } from "node:fs";
import spine from "./_data/spine.js";

// Canonical glossary (same file the dictionary pages render from).
const glossary = JSON.parse(
    readFileSync(new URL("../src/theory/glossary.json", import.meta.url), "utf8"),
);

// Same slug rule as site/_data/glossary.js, so wiki-links and dictionary
// permalinks can never drift apart.
const slugify = (s) => s.trim().toLowerCase().replace(/\s+/g, "-");

// Article slugs, read from the filenames in site/concepts/. Adding a new
// article requires a dev-server restart before links to it resolve.
const articleSlugs = new Set(
    readdirSync(new URL("./concepts", import.meta.url))
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, "")),
);

// [[target]] or [[target|display text]] → a link. Resolution order:
// article in site/concepts/, then dictionary term (with the glossary
// definition as a tooltip), else plain text — never a broken link.
function wikilinks(html) {
    if (typeof html !== "string") return html;
    return html.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target, display) => {
        // Collapse internal whitespace: prose wiki-links may wrap across
        // source lines ("[[parallel\nmotion|...]]").
        const text = (display ?? target).trim().replace(/\s+/g, " ");
        const key = target.trim().toLowerCase().replace(/\s+/g, " ");
        const slug = slugify(key);
        if (articleSlugs.has(slug)) {
            return `<a href="/concepts/${slug}/">${text}</a>`;
        }
        if (key in glossary) {
            const def = glossary[key].replace(/"/g, "&quot;");
            return `<a class="term" href="/dictionary/${slug}/" title="${def}">${text}</a>`;
        }
        return text;
    });
}

// Contents box built from the h2 ids in rendered article HTML.
// Wikipedia-style: only shown once an article has enough sections to need it.
function toc(html) {
    if (typeof html !== "string") return "";
    const heads = [...html.matchAll(/<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
        .map((m) => ({ id: m[1], text: m[2].replace(/<[^>]+>/g, "").trim() }));
    if (heads.length < 3) return "";
    const items = heads
        .map((h) => `<li><a href="#${h.id}">${h.text}</a></li>`)
        .join("");
    return `<nav class="toc" aria-label="Contents"><div class="toc-title">Contents</div><ol>${items}</ol></nav>`;
}

export default function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({ "site/dist": "assets" });
    eleventyConfig.ignores.add("site/src/**");
    eleventyConfig.ignores.add("site/dist/**");
    eleventyConfig.ignores.add("site/build.ts");
    eleventyConfig.ignores.add("site/tsconfig.json");
    eleventyConfig.ignores.add("site/README.md");
    eleventyConfig.ignores.add("site/CURRICULUM.md");

    eleventyConfig.addFilter("wikilinks", wikilinks);
    eleventyConfig.addFilter("toc", toc);

    // Track 1 spine lookup: where (if anywhere) an article sits on the
    // ordered path, and its neighbors for prev/next navigation.
    eleventyConfig.addFilter("spineInfo", (fileSlug) => {
        const i = spine.findIndex((s) => s.slug === fileSlug);
        if (i < 0) return null;
        return {
            index: i + 1,
            total: spine.length,
            prev: i > 0 ? spine[i - 1] : null,
            next: i < spine.length - 1 ? spine[i + 1] : null,
        };
    });

    // Give Markdown h2/h3 headings ids (slugified from their text) so the
    // Contents box and #fragment links work without an extra dependency.
    eleventyConfig.amendLibrary("md", (md) => {
        md.core.ruler.push("heading_ids", (state) => {
            const tokens = state.tokens;
            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i];
                if (t.type === "heading_open" && (t.tag === "h2" || t.tag === "h3")) {
                    const text = tokens[i + 1]?.content ?? "";
                    const id = text
                        .trim()
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    if (id) t.attrSet("id", id);
                }
            }
        });
    });

    return {
        templateFormats: ["njk", "md"],
        markdownTemplateEngine: "njk",
        dir: {
            input: "site",
            output: "site/_site",
            includes: "_includes",
            data: "_data",
        },
    };
}
