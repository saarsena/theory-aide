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
| `category` | yes | one of: fundamentals, harmony, counterpoint, rhythm, math and acoustics, form (add sparingly) |
| `see_also` | no | list of wiki-link targets for the See also section |
| `references` | no | list of sources, rendered as a References section (see Citations below) |
| `mountain` | no | one short paragraph admitting the topic's true depth, rendered as the "A mountain, not a page" aside after the body. Use it on any article whose subject has a literature of its own (scales, melody, keys...): the article is the Track 1 footpath, and this aside is where we say so honestly and point at what lies beyond |

Everything else comes from the layout automatically: the Contents box appears
once an article has three or more `##` sections, the See also section renders
from `see_also`, and every article carries the (currently empty, invisible)
`#comments` mount point for the future comment system.

## The spine (Track 1)

`site/_data/spine.js` holds the ordered list of Track 1 articles: the one
path that is complete on its own (the two-track idea from MTW's
*Gravitation*; the full contract is in `site/CURRICULUM.md`). Each entry is
`{ slug, title }`. Articles on the list get a "Track 1 · article N of M"
marker and previous/next navigation automatically; articles not on it are
marked Track 2. When a spine-worthy article ships, add it to the list in
reading order; reorder freely (URLs never move, only the nav links).
Restart the dev server after editing the spine, it is read at build start.

## The clusters (Track 2)

`site/_data/clusters.js` is the spine's Track 2 mirror: the named reading
paths beyond the course (the cluster contract is in `site/CURRICULUM.md`).
Each cluster has a `name`, a one-sentence `purpose`, the spine articles it
`hangsOff`, and its shipped `articles` in reading order. A Track 2 article
listed in a cluster gets a "Track 2 · \<cluster\> · article N of M" bar and
previous/next navigation within its path; one not listed anywhere falls
back to the generic Track 2 bar, which is the signal to go add it to a
cluster. The `/tracks/` page renders the spine and all clusters from these
two data files. An article belongs to at most one cluster. Same rules as
the spine: add on ship, reorder freely, restart the dev server after
editing.

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

## Citations

Claims get sources. When an article leans on history ("Stockhausen wrote an
essay"), research (the ~20 Hz rhythm-to-pitch border), a number that isn't
common knowledge, or an idea that belongs to someone, cite it. Plain English
does not mean unsourced; for a reference site, unsourced claims are the
fastest way to stop being one.

How to cite: name the person or work inline in the prose where the claim is
made (no footnote markers), and put the full citation in the `references`
front matter list. Each entry:

```yaml
references:
  - author: "Curtis Roads"
    year: 2001
    title: "Microsound"
    source: "MIT Press"        # optional: journal, publisher, venue
    url: "https://..."         # optional: link on the title
```

The article layout renders these as a numbered References section after
See also (the Wikipedia order). Only `author` and `title` are required.
Never put bare URLs in prose; they go in references or wiki-links.

## Prose rules

Plain English first, depth behind that. No em dashes, ever: use commas,
colons, or a new sentence ("·" is the house separator for labels). Keep the
lead readable by someone who knows nothing; keep the depth honest for someone
who knows plenty.
