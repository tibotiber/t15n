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

The leading HTML comment carries metadata (`title`, `date`, `summary`, `topics`) — parsed by `parseMeta()` in `worker.ts`.

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
- **Typography:** Charter for headings and body, Inter for UI, IBM Plex Mono for kickers, meta, wordmark, code. Do not introduce new font families.
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

## CI

GitHub Actions runs `npm run lint` (`tsc --noEmit`) only. No deploy job — Cloudflare's GitHub integration handles deployment on push to `main`. Do not add a deploy step to CI.

## Related repos

- `the-mesh/` — the Mesh codebase, sibling project; reuses same design tokens and self-hosted Charter fonts
- `the-mesh/hatch/` — Thibaut's strategic planning docs (compass, public footprint, blog platform decision) — read these before drafting any post
