import { page, formatDate } from './src/chrome'
import type { PostMeta } from './src/chrome'
import { generateRSS } from './src/rss'

// --- Post registry ---
// Add one import + one entry here for each new post.
import pipelineHtml from './src/posts/2026-05-19-pipeline.html'

const POST_FILES: Array<{ filename: string; content: string }> = [
  { filename: '2026-05-19-pipeline.html', content: pipelineHtml },
]

// --- Metadata parser ---
function parseMeta(html: string, filename: string): PostMeta {
  const match = html.match(/<!--([\s\S]*?)-->/)
  const meta: Record<string, string> = {}
  if (match) {
    for (const line of match[1].trim().split('\n')) {
      const colon = line.indexOf(':')
      if (colon > 0) {
        meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
      }
    }
  }
  // Derive slug from filename: YYYY-MM-DD-my-slug.html → my-slug
  const slugMatch = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.html$/)
  const slug = slugMatch ? slugMatch[1] : filename.replace(/\.html$/, '')
  return {
    title: meta['title'] ?? 'Untitled',
    date: meta['date'] ?? '',
    summary: meta['summary'] ?? '',
    topics: meta['topics'] ? meta['topics'].split(',').map((t) => t.trim()) : [],
    slug,
    content: html,
  }
}

// Build posts list (newest first) at startup
const POSTS: PostMeta[] = POST_FILES.map(({ filename, content }) => parseMeta(content, filename)).sort(
  (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
)

const POST_BY_SLUG = new Map(POSTS.map((p) => [p.slug, p]))

// --- Page renderers ---

function renderIndex(): string {
  const items = POSTS.map(
    (p) => `
  <li class="post-item">
    <h2 class="post-item-title"><a href="/${p.slug}">${p.title}</a></h2>
    <div class="post-item-meta">${formatDate(p.date)}</div>
    <p class="post-item-summary">${p.summary}</p>
  </li>`,
  ).join('')

  const body = `<div class="page">
  <div class="index-header">
    <h1>t15n</h1>
    <p>Long-form writing by Thibaut Tiberghien.</p>
  </div>
  <ul class="post-list">${items}
  </ul>
</div>`

  return page('Writing', body, 'Long-form writing by Thibaut Tiberghien on knowledge infrastructure, agent-native teams, and opinionated tools.')
}

function renderPost(post: PostMeta): string {
  // Strip the leading HTML comment (metadata block) before rendering
  const content = post.content.replace(/^[\s\n]*<!--[\s\S]*?-->[\s\n]*/, '')
  const body = `<div class="page">
  <article>${content}
  </article>
</div>`
  return page(post.title, body, post.summary || undefined)
}

function renderAbout(): string {
  const body = `<div class="page">
  <article>
    <div class="kicker">About</div>
    <h1>Thibaut Tiberghien.</h1>
    <p class="lead">Founder of <a href="https://smplrspace.com">Smplrspace</a>. Building <a href="https://the-mesh.app">The Mesh</a> — a shared knowledge base for teams working with AI.</p>

    <p>I've been on a single thread for about fifteen years: making digital things tangible so they can be manipulated and understood. It started with tangible user interfaces during my Master's in Germany. It carried into data visualisation. A PhD on semantic web technologies — knowledge structured as graphs you can navigate. Smplrspace is data visualisation for commercial real estate. The Mesh is knowledge infrastructure for AI-native teams.</p>

    <p>This blog is the companion surface to The Mesh. Same typography, same reading experience, broader scope. The territory: knowledge infrastructure, cognitive debt from AI-without-substrate, what agent-native teams actually require in practice, opinionated tools, design-led companies.</p>

    <p>Based in Singapore. French by origin, Malaysian by fifteen years. Three kids.</p>

    <p>Find me on <a href="https://x.com/tibotiber">X</a> or reach out directly at <a href="mailto:thibaut@smplrspace.com">thibaut@smplrspace.com</a>.</p>
  </article>
</div>`
  return page('About', body)
}

function render404(): string {
  const body = `<div class="page">
  <div class="not-found">
    <div class="kicker">404</div>
    <h1>Nothing here.</h1>
    <p><a href="/">Back to writing</a></p>
  </div>
</div>`
  return page('Not found', body)
}

// --- Worker ---

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url)
    const baseUrl = new URL(request.url).origin

    // Homepage
    if (pathname === '/' || pathname === '') {
      return new Response(renderIndex(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // About page
    if (pathname === '/about') {
      return new Response(renderAbout(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // RSS feed
    if (pathname === '/rss.xml') {
      return new Response(generateRSS(POSTS, baseUrl), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
      })
    }

    // Post pages: /<slug>
    const slug = pathname.slice(1) // strip leading /
    const post = POST_BY_SLUG.get(slug)
    if (post) {
      return new Response(renderPost(post), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // 404
    return new Response(render404(), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  },
}
