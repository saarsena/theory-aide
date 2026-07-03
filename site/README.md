# Theory Aide site: authoring guide

The site is fully static (Eleventy). `npm run site` builds it into
`site/_site/`; `npm run site:dev` serves it at `http://localhost:8124/`.

The content has two tiers:

- **Dictionary** (`/dictionary/`): one page per glossary term, generated from
  the canonical `src/theory/glossary.json`. To add a term, edit that JSON.
- **Encyclopedia articles** (`/concepts/`): one Markdown file per concept in
  `site/concepts/`. This is where the writing accumulates.

## Writing an article

Create `site/concepts/<slug>.md`. The filename **is** the slug **is** the
permanent URL (`/concepts/<slug>/`).

**The slug-stability rule: never rename an article file.** Inbound links,
bookmarks, and (in the future) comment threads all key on the URL. Retitling
an article is fine, that's what `title`/`heading` front matter is for; the
file keeps its name forever. Pick slugs that are short, lowercase, and
hyphen-separated.

Front matter fields:

| field | required | what it does |
|---|---|---|
| `title` | yes | short name: browser tab, nav, listings |
| `heading` | no | full h1 if the title alone is too terse |
| `summary` | yes | one plain sentence for the Concepts index cards |
| `lead` | yes | the lead paragraph: plain English, readable by itself, no jargon that isn't wiki-linked. May contain inline HTML and wiki-links |
| `category` | yes | one of: harmony, counterpoint, rhythm, math and acoustics, form (add sparingly) |
| `see_also` | no | list of wiki-link targets for the See also section |

Everything else comes from the layout automatically: the Contents box appears
once an article has three or more `##` sections, the See also section renders
from `see_also`, and every article carries the (currently empty, invisible)
`#comments` mount point for the future comment system.

## Wiki-links

In article body, lead, and `see_also`, write `[[target]]` or
`[[target|display text]]`. Resolution order:

1. An article slug in `site/concepts/` → links to the article.
2. A glossary term → links to its dictionary page, styled with a dotted
   underline and the definition as a hover tooltip.
3. Neither → renders as plain text. Never a broken link, so it's safe to
   link terms that don't have pages yet.

Article slugs are read from filenames when the build starts, so after adding
a new article file, restart `npm run site:dev` for links **to** it to resolve.

## Live demos

Demos are raw HTML blocks in the Markdown (a `.demo` div plus a
`<script src="/assets/....js">` tag) backed by a TypeScript entry point in
`site/src/`, bundled by esbuild (`site/build.ts`, add new entry points there).
Keep raw HTML blocks free of blank lines, or the Markdown parser will split
them. The seam rule from DESIGN.md applies: demos import the real engine from
`src/theory`, and curated examples must be verified against the engine before
the surrounding copy claims what they demonstrate.

## Comments (future)

Comments are planned but deliberately deferred. The design that keeps them
cheap to add later, already in place:

- Every article URL is permanent (the slug-stability rule above).
- Every article renders an empty `<section id="comments">` mount point.

When they arrive, the site stays static: a client-side script fills the mount
point from a small external API (likely a Cloudflare Worker), with automated
moderation that flags borderline comments for human review. Nothing about
that touches the Eleventy build.

## Prose rules

Plain English first, depth behind that. No em dashes, ever: use commas,
colons, or a new sentence ("·" is the house separator for labels). Keep the
lead readable by someone who knows nothing; keep the depth honest for someone
who knows plenty.
