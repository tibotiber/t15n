# CLAUDE.md

Operating guidance for Claude in this repo. Read this before making changes.

## What this is

Thibaut Tiberghien's personal long-form blog at t15n.io. Companion to The Mesh — same typography, same reading experience, broader scope, longer-lived. Numeronym: T, fifteen letters, N. Same construction as a11y and i18n.

## Stack — hard constraints

- **Cloudflare Workers** (not Pages). Auto-deploys from `main` via Cloudflare's GitHub integration.
- **TypeScript**, no framework, no CMS, no markdown layer.
- **Templating** is TS modules returning HTML strings.
- **Posts are authored as raw HTML.** That is the whole point. Do not propose introducing markdown, MDX, a static site generator, or a build step that abstracts away the HTML.
- Do not add backwards-compatibility shims, feature flags, validation for impossible states, or speculative abstractions. Three similar lines beats a premature abstraction.

## Adding a post

Two-line change in [`worker.ts`](worker.ts): one `import` for the new HTML file, one entry in the `POST_FILES` array. Posts sort by date automatically. See [README.md](README.md) for the full template.

The leading HTML comment carries metadata (`title`, `date`, `summary`, `topics`, `aside`) — parsed by `parseMeta()` in `worker.ts`. The `aside` field is required — the worker throws at startup if it's missing. See "Aside — the date hover-reveal" below.

### Aside — the date hover-reveal

Every post carries an `aside:` line. On the homepage list and on the rendered post page, the date is wrapped in `<span class="aside-anchor" data-aside="...">`. The date itself has no visual treatment — no underline, no cursor change, no nothing. On hover, a styled tooltip card appears (CSS-only, no JS): `.aside-anchor::after` in [`public/styles.css`](public/styles.css), using `--bg2` / `--fg2` / `--border` from the design tokens, Inter at 13px, 50ms delay before a 350ms opacity fade-in (the slow fade reads as a reveal rather than a system tooltip). On desktop the trigger is `:hover`, scoped via `@media (hover: hover)`. On touch devices (`@media (hover: none)`) a small script in [`src/chrome.ts`](src/chrome.ts) toggles a `.is-revealed` class on tap — tapping the date opens it, tapping anywhere else closes it. On small touch viewports (`@media (max-width: 480px) and (hover: none)`) the tooltip switches to `position: fixed` and is centered horizontally with 20px gutters; the script sets `--aside-top` from the anchor's `getBoundingClientRect()` so vertical position still tracks the date that was tapped. The card is the only signal that anything exists. A dotted underline or `cursor: help` would read as "the author prepared something for you," which deflates the discovery — the absence of any cue is the point.

Desktop only — `:hover` doesn't really fire on touch. Not exposed in markdown or RSS. An LLM scraping or summarising the post never sees the aside.

One to three lines of plain text, in Thibaut's voice — a sentence, or a couple of sentences, not a paragraph. The constraint: it has to be something an LLM couldn't plausibly fabricate about him specifically — that's the whole point of the feature. The value lives on a single physical line inside the HTML metadata comment (the parser splits on `\n`); the tooltip wraps the text on render. If you want an explicit line break inside the tooltip, write the literal two characters `\n` in the metadata value — `asideAttr()` in [`worker.ts`](worker.ts) converts each `\n` to the `&#10;` HTML entity, and `white-space: pre-line` on `.aside-anchor::after` renders it as a break. Four flavors to pick from (mix freely across posts — no need to pick one and stick to it):

- **Gestation** — when the idea was first noted vs. when it shipped. *"First noted 2025-08-14 in a margin of the Mesh compass doc — sat in drafts for nine months while I tried to find an opening that wasn't a manifesto."* On-brand: the blog argues against AI-fast cognition, and the aside proves the work didn't come out instantly.
- **Provenance** — what specifically triggered the post. *"After a call with a CTO who'd shipped three agents and couldn't explain what any of them actually did. He wasn't embarrassed about it, which was the part that stayed with me."*
- **Location** — where it was written. *"Drafted in Singapore the week the haze rolled in, edited on the train to KL with a flat white going cold."*
- **Marginalia** — a question you didn't answer, a counter-argument you suppressed, a follow-up you owe. *"The accountability point cuts the other way too — what happens when the agent is the one being asked to defend the work? Left for a later post."*

Do **not** author asides on Thibaut's behalf unless explicitly asked. If a post is added with a placeholder (`aside: TODO — ...`) the worker still starts, but the placeholder must be replaced before deploy.

After adding a post — or renaming a slug, changing a title, or rewording the homepage tagline — regenerate the Open Graph cards:

```
yarn og
```

This rebuilds every `public/og/*.png` from `src/posts/` and the homepage layout. Commit the changed PNGs alongside the content change. The cards are 1200×630 dark-theme PNGs served as static assets at `/og/<slug>.png` and `/og/index.png`. Generator lives in [`scripts/build-og.ts`](scripts/build-og.ts); fonts are TTF copies of the woff2 web fonts in [`src/fonts/`](src/fonts/) (satori needs TTF). The `<meta property="og:*">` tags themselves are emitted from [`src/chrome.ts`](src/chrome.ts) — runtime, not pre-rendered.

## Voice — do not author posts unless explicitly asked

- The voice is Thibaut's. Substantive, opinionated, calm.
- Test: "Could this only have been written by me?" If a draft reads as competent generic startup writing, it has failed.
- Do not write a post on the user's behalf unless explicitly asked to. Help with structure, edit on request, surface candidates from existing Hatch/Mesh material — but the voice has to be his.
- If asked to draft: load context from `the-mesh/hatch/compass.html` and `the-mesh/hatch/public-footprint.html` first. The voice across those docs is the voice.
- No hedging language ("perhaps", "it could be argued"), no "in conclusion" framings, no AI-assembled texture.

## Topic territory

Knowledge infrastructure · cognitive debt from AI-without-substrate · agent-native teams · opinionated tools · HTML-canonical knowledge · design-led companies · Smplrspace's own AI adoption lessons · The Mesh as worked example (not a pitch).

## Design — do not break

- **Monochrome.** No accent colour. Black-and-white scale only.
- **Never pure black or pure white** for text or backgrounds. Light theme: bg `#ffffff`, text `#1d1d1f`. Dark theme: bg `#111111`, text `#e6e6e6`. The Mesh's reading research informs these choices — pure values cause eye strain on long-form.
- **Typography:** Charter for headings and body, Inter for UI, IBM Plex Mono for kickers, meta, wordmark, code. Do not introduce new font families. If you ever do, the font's license file must ship alongside the woff2 in `public/fonts/<family>/LICENSE.txt`, and any required attribution (e.g. trademark acknowledgments) must be added to [`NOTICE.md`](NOTICE.md).
- **Reading width:** ~640px (`--reading-width` CSS variable). Single centred column.
- **Header is always dark chrome.** Wordmark `t15n` in IBM Plex Mono 600; name `Thibaut Tiberghien` in Inter 400, dimmer; separator is `·`. Do not add explanatory text like "(= Thibaut Tiberghien)" or a tooltip — let the pattern speak.
- **Theme toggle:** three states (auto → light → dark → auto), persisted to `localStorage` under `t15n-theme`.

## Explicitly deferred — do not add unprompted

- Email subscriptions (RSS first; revisit only if demand emerges)
- Comments
- Search
- Heavy analytics (Cloudflare Web Analytics is fine if anything)

If the user asks for one of these, build it. If not, do not propose it.

## Local dev

Port `8015`, pinned in both `wrangler.jsonc` (`dev.port`) and `.claude/launch.json`. Keep them in sync if the port ever changes.

## Package manager

Yarn 4 (Berry), pinned via the `packageManager` field in `package.json`. Activated through Corepack — `corepack enable` is the one-time setup. Do not introduce `npm install` or `pnpm` workflows; the lockfile is `yarn.lock`. `.yarnrc.yml` uses `nodeLinker: node-modules` (no PnP) to keep wrangler/esbuild happy.

## CI

GitHub Actions runs `yarn lint` (`tsc --noEmit`) only. No deploy job — Cloudflare's GitHub integration handles deployment on push to `main`. Do not add a deploy step to CI.

## Related repos

- `the-mesh/` — the Mesh codebase, sibling project; reuses same design tokens and self-hosted Charter fonts
- `the-mesh/hatch/` — Thibaut's strategic planning docs (compass, public footprint, blog platform decision) — read these before drafting any post
