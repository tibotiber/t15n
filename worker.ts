import { page, formatDate } from './src/chrome'
import type { PostMeta } from './src/chrome'
import { generateRSS } from './src/rss'
import { htmlToMarkdown, readingTime } from './src/markdown'

// --- Post registry ---
// Add one import + one entry here for each new post.
import fifteenYearsHtml from './src/posts/2026-05-19-fifteen-years.html'

const POST_FILES: Array<{ filename: string; content: string }> = [
  { filename: '2026-05-19-fifteen-years.html', content: fifteenYearsHtml },
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

// --- Helpers ---

function wantsMarkdown(request: Request, url: URL): boolean {
  const format = url.searchParams.get('format')
  if (format === 'markdown' || format === 'md') return true
  return (request.headers.get('Accept') ?? '').includes('text/markdown')
}

const MD_HEADERS = { 'Content-Type': 'text/markdown; charset=utf-8' }

// --- Page renderers ---

function renderIndex(): string {
  const items = POSTS.map((p) => {
    const kicker = p.topics[0] ? p.topics[0].charAt(0).toUpperCase() + p.topics[0].slice(1) : ''
    const kickerHtml = kicker
      ? `<div class="post-item-kicker">${kicker} · ${formatDate(p.date)}</div>`
      : `<div class="post-item-kicker">${formatDate(p.date)}</div>`
    return `
  <li class="post-item">
    ${kickerHtml}
    <h2 class="post-item-title"><a href="/${p.slug}">${p.title}</a></h2>
    <p class="post-item-summary">${p.summary}</p>
  </li>`
  }).join('')

  const body = `<div class="page">
  <div class="index-intro">
    <p>On the substrate thinking-with-agents needs.</p>
    <p>Notes alongside building The Mesh, an opinionated context layer where the understanding you build with AI doesn't evaporate when the session ends.</p>
  </div>
  <ul class="post-list">${items}
  </ul>
</div>`

  return page(
    'Writing',
    body,
    'Notes on knowledge infrastructure, agent-native teams, and opinionated tools.',
    {
      slug: 'index',
      path: '/',
      fullTitle: 't15n - Thibaut Tiberghien',
    },
  )
}

function postContent(post: PostMeta): { rawHtml: string; markdown: string } {
  const rawHtml = post.content.replace(/^[\s\n]*<!--[\s\S]*?-->[\s\n]*/, '')
  const markdown = htmlToMarkdown(rawHtml)
  return { rawHtml, markdown }
}

function renderPost(post: PostMeta): string {
  const { rawHtml, markdown } = postContent(post)
  const timeStr = readingTime(markdown)
  const contentWithTime = rawHtml.replace(
    /<div class="kicker">([^<]*)<\/div>/,
    `<div class="kicker">$1 · <span class="reading-time">${timeStr}</span></div>`,
  )
  const shareUrl = `https://t15n.io/${post.slug}`
  const shareText = encodeURIComponent(post.title)
  const postEnd = `
  <div class="pe-actions">
    <a href="#" class="pe-link" id="pe-copy">Copy link</a>
    <span class="pe-dot">·</span>
    <a href="https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&amp;text=${shareText}" class="pe-link" target="_blank" rel="noopener">Share on X</a>
  </div>`
  const body = `<div class="page">
  <article>${contentWithTime}${postEnd}
  </article>
</div>`
  return page(post.title, body, post.summary || undefined, {
    slug: post.slug,
    path: `/${post.slug}`,
    type: 'article',
    date: post.date,
    tag: post.topics[0],
  })
}

function renderPostMarkdown(post: PostMeta): string {
  const { markdown } = postContent(post)
  const topics = post.topics.join(', ')
  const frontmatter = `---
title: ${post.title}
date: ${post.date}
summary: ${post.summary}
topics: ${topics}
slug: ${post.slug}
url: https://t15n.io/${post.slug}
---`
  return frontmatter + '\n\n' + markdown
}

function renderIndexMarkdown(): string {
  const items = POSTS.map((p) => {
    const topics = p.topics.length ? ` · ${p.topics.join(', ')}` : ''
    return `### [${p.title}](https://t15n.io/${p.slug})\n${formatDate(p.date)}${topics}\n\n${p.summary}`
  }).join('\n\n---\n\n')
  return `# t15n\n\nOn the substrate thinking-with-agents needs.\n\n---\n\n${items}`
}

function renderAbout(): string {
  const body = `<div class="page">
  <article>
    <div class="kicker">About</div>
    <h1>Thibaut Tiberghien.</h1>
    <p>I run <a href="https://smplrspace.com">Smplrspace</a>, a data-visualization company for commercial real estate, and I'm building The Mesh, an opinionated context layer where the understanding you build with AI doesn't evaporate when the session ends.</p>

    <p>When I paused recently to look at what actually interested me, fifteen years of work connected into one thread: making digital things and ideas tangible so they can be manipulated, understood, and decided on. Tangible user interfaces during my Master's in Germany. A PhD on semantic web technologies — knowledge structured as graphs you can navigate, where the shape itself derives new information. Years of data-visualization work. Smplrspace, which anchors building data to the space it describes and visualizes it in place. The Mesh, which turns thinking into a permanent, visible, addressable asset for the team, instead of letting it die in chat windows. Same impulse, different scopes.</p>

    <p>I write here about knowledge infrastructure, the cognitive debt teams accumulate when they use AI without substrate, what agent-native teams actually require, and why design-led companies win in their fields.</p>

    <p>Smplrspace's first hire was a designer, at a stage when every hire was existential. The bet has aged well. The same instinct shows up in the work I admire most: design as judgment, not decoration. What gets left out matters as much as what stays in.</p>

    <p>French by origin, studied in Germany, twelve years in Malaysia, now in Singapore with my wife and three kids.</p>

    <p>On <a href="https://x.com/tibotiber">X</a> as @tibotiber. Email me at <a href="mailto:thibaut@smplrspace.com">thibaut@smplrspace.com</a>.</p>
  </article>
</div>`
  return page('About', body, 'Thibaut Tiberghien, founder of Smplrspace. Building The Mesh, an opinionated context layer where the understanding you build with AI doesn\'t evaporate when the session ends.', {
    slug: 'index',
    path: '/about',
  })
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
    const url = new URL(request.url)
    const { pathname } = url
    const md = wantsMarkdown(request, url)

    // Homepage
    if (pathname === '/' || pathname === '') {
      if (md) return new Response(renderIndexMarkdown(), { headers: MD_HEADERS })
      return new Response(renderIndex(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // About page
    if (pathname === '/about') {
      return new Response(renderAbout(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // RSS feed
    if (pathname === '/rss.xml') {
      return new Response(generateRSS(POSTS, url.origin), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
      })
    }

    // Post pages: /<slug>
    const slug = pathname.slice(1)
    const post = POST_BY_SLUG.get(slug)
    if (post) {
      if (md) return new Response(renderPostMarkdown(post), { headers: MD_HEADERS })
      return new Response(renderPost(post), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }

    // 404
    return new Response(render404(), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  },
}
