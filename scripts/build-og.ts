import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { formatDate, type PostMeta } from '../src/chrome'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const POSTS_DIR = join(ROOT, 'src/posts')
const FONTS_DIR = join(ROOT, 'src/fonts')
const OUT_DIR = join(ROOT, 'public/og')

const WIDTH = 1200
const HEIGHT = 630
const PAD = 80
const BG = '#161513'
const FG = '#e8e5e0'
const DIM = '#a09c96'

async function loadFonts() {
  const [charterBold, charterItalic, plexRegular, plexBold] = await Promise.all([
    readFile(join(FONTS_DIR, 'charter-bold.ttf')),
    readFile(join(FONTS_DIR, 'charter-italic.ttf')),
    readFile(join(FONTS_DIR, 'ibm-plex-mono-400.ttf')),
    readFile(join(FONTS_DIR, 'ibm-plex-mono-600.ttf')),
  ])
  return [
    { name: 'Charter', data: charterBold, weight: 700 as const, style: 'normal' as const },
    { name: 'Charter', data: charterItalic, weight: 400 as const, style: 'italic' as const },
    { name: 'Plex Mono', data: plexRegular, weight: 400 as const, style: 'normal' as const },
    { name: 'Plex Mono', data: plexBold, weight: 700 as const, style: 'normal' as const },
  ]
}

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
  const slugMatch = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)\.html$/)
  const slug = slugMatch ? slugMatch[1] : filename.replace(/\.html$/, '')
  return {
    title: meta['title'] ?? 'Untitled',
    date: meta['date'] ?? '',
    summary: meta['summary'] ?? '',
    topics: meta['topics'] ? meta['topics'].split(',').map((t) => t.trim()) : [],
    aside: meta['aside'] ?? '',
    slug,
    content: html,
  }
}

type El = { type: string; props: Record<string, unknown> }
function el(type: string, props: Record<string, unknown> = {}, ...children: unknown[]): El {
  const flat = children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false)
  return { type, props: flat.length ? { ...props, children: flat.length === 1 ? flat[0] : flat } : props }
}

function frame(children: El | El[]): El {
  return el(
    'div',
    {
      style: {
        width: WIDTH,
        height: HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        background: BG,
        color: FG,
        padding: PAD,
        fontFamily: 'Plex Mono',
      },
    },
    children as unknown,
  )
}

function wordmark(scale: 'large' | 'small'): El {
  const size = scale === 'large' ? 160 : 36
  return el(
    'div',
    {
      style: {
        fontFamily: 'Plex Mono',
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '0.08em',
        color: FG,
        display: 'flex',
      },
    },
    't15n',
  )
}

function postCard(post: PostMeta): El {
  const tag = post.topics[0] ? post.topics[0].toUpperCase() : ''
  const titleSize = post.title.length > 60 ? 60 : 72

  const top = wordmark('small')

  const middle = el(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 40,
      },
    },
    tag
      ? el(
          'div',
          {
            style: {
              fontFamily: 'Plex Mono',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '0.12em',
              color: DIM,
              display: 'flex',
              marginBottom: 12,
            },
          },
          tag,
        )
      : null,
    el(
      'div',
      {
        style: {
          fontFamily: 'Charter',
          fontWeight: 700,
          fontSize: titleSize,
          lineHeight: 1.1,
          color: FG,
          display: 'flex',
        },
      },
      post.title,
    ),
  )

  const bottom = el(
    'div',
    { style: { fontFamily: 'Plex Mono', fontWeight: 400, fontSize: 24, color: DIM, display: 'flex' } },
    `Thibaut Tiberghien · ${formatDate(post.date)}`,
  )

  return frame([top, middle, bottom])
}

function homeCard(): El {
  const mark = wordmark('large')

  const tagline = el(
    'div',
    {
      style: {
        fontFamily: 'Charter',
        fontWeight: 400,
        fontStyle: 'italic',
        fontSize: 44,
        color: DIM,
        maxWidth: 900,
        textAlign: 'center',
        marginTop: 48,
        display: 'flex',
        lineHeight: 1.3,
      },
    },
    'On the substrate thinking-with-agents needs.',
  )

  const inner = el(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 60,
      },
    },
    mark,
    tagline,
  )

  return frame(inner)
}

async function render(tree: El, fonts: Awaited<ReturnType<typeof loadFonts>>): Promise<Uint8Array> {
  const svg = await satori(tree as never, { width: WIDTH, height: HEIGHT, fonts })
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const fonts = await loadFonts()

  const home = await render(homeCard(), fonts)
  await writeFile(join(OUT_DIR, 'index.png'), home)
  console.log(`  public/og/index.png  ${home.byteLength.toLocaleString()} bytes`)

  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.html')).sort()
  for (const f of files) {
    const html = await readFile(join(POSTS_DIR, f), 'utf8')
    const post = parseMeta(html, f)
    const png = await render(postCard(post), fonts)
    const out = join(OUT_DIR, `${post.slug}.png`)
    await writeFile(out, png)
    console.log(`  public/og/${post.slug}.png  ${png.byteLength.toLocaleString()} bytes`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
