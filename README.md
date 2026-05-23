# t15n

Personal long-form blog at [t15n.io](https://t15n.io). Numeronym for Thibaut Tiberghien.

Pure HTML, generated in TypeScript on a Cloudflare Worker. No framework, no CMS, no markdown layer.

## Stack

- **Hosting:** Cloudflare Workers, auto-deployed from `main` via Cloudflare's GitHub integration
- **Language:** TypeScript
- **Templating:** TS modules returning HTML strings; posts authored as raw HTML
- **Fonts:** Charter (self-hosted), Inter and IBM Plex Mono (Google Fonts)

## Local dev

```bash
corepack enable     # one-time; activates the pinned Yarn 4
yarn install
yarn dev
```

Runs `wrangler dev` on port `8015`.

## Adding a post

1. Create `src/posts/YYYY-MM-DD-slug.html` with a metadata comment:

   ```html
   <!--
   title: Post title
   date: 2026-06-01
   summary: One-line summary for the index and RSS feed.
   topics: knowledge-infrastructure, agent-native-teams
   aside: First noted 2025-09-04 — sat in drafts for nine months.
   -->

   <div class="kicker">Essay · 1 June 2026</div>
   <h1>Post title.</h1>
   <p class="lead">Lead paragraph.</p>

   <p>Body…</p>
   ```

   The `aside` field is required — the worker throws at startup if it's missing. It's surfaced as a hover-reveal tooltip on the date in the rendered post. See [CLAUDE.md](CLAUDE.md) for what to put in it.

2. Register the post in [`worker.ts`](worker.ts) by adding two lines:

   ```ts
   import myPost from './src/posts/2026-06-01-my-slug.html'

   const POST_FILES = [
     // ...existing entries
     { filename: '2026-06-01-my-slug.html', content: myPost },
   ]
   ```

That's it — posts sort by date automatically and appear on the homepage and RSS feed.

## Deploy

Pushes to `main` auto-deploy via the Cloudflare GitHub integration. No `wrangler deploy` from CI.

CI runs `npm run lint` (TypeScript typecheck) only — see [`.github/workflows/lint.yml`](.github/workflows/lint.yml).

## Structure

```
public/
  styles.css              Stylesheet served as static asset
  fonts/charter/          Self-hosted Charter woff2 files
src/
  chrome.ts               page(), formatDate(), PostMeta interface, header/footer
  rss.ts                  RSS feed generator
  html.d.ts               TS module declaration for HTML text imports
  posts/                  One .html file per post
worker.ts                 Worker entry — routes /, /about, /rss.xml, /<slug>
wrangler.jsonc            Workers config; assets binding + HTML text rule
```

## Design

Monochrome — no accent colour. Light: `#ffffff` background, `#1d1d1f` text. Dark: `#111111` background, `#e6e6e6` text. Header is always dark. Theme preference persists to `localStorage` under `t15n-theme`.

## Third-party notices

Self-hosted fonts and their licenses are listed in [NOTICE.md](NOTICE.md). Charter is used under the 1992 Bitstream X Consortium grant; Inter and IBM Plex Mono are used under the SIL Open Font License 1.1.
