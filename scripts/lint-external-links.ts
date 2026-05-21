import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = join(import.meta.dirname, '..')
const TARGETS = [join(ROOT, 'src'), join(ROOT, 'worker.ts')]
const INTERNAL_HOST = 't15n.io'

function walk(path: string, out: string[] = []): string[] {
  const s = statSync(path)
  if (s.isFile()) {
    if (/\.(ts|html)$/.test(path)) out.push(path)
    return out
  }
  for (const entry of readdirSync(path)) walk(join(path, entry), out)
  return out
}

const anchorRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi

type Offense = { file: string; line: number; href: string; missing: string[] }
const offenses: Offense[] = []

for (const target of TARGETS) {
  for (const file of walk(target)) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(anchorRe)) {
      const tag = match[0]
      const href = match[1]
      const isExternal = /^https?:\/\//i.test(href)
      const isRss = href === '/rss.xml'
      if (!isExternal && !isRss) continue
      if (isExternal) {
        try {
          const url = new URL(href)
          if (url.hostname === INTERNAL_HOST || url.hostname.endsWith('.' + INTERNAL_HOST)) continue
        } catch {
          continue
        }
      }
      const missing: string[] = []
      if (!/\btarget=["']_blank["']/i.test(tag)) missing.push('target="_blank"')
      if (!/\brel=["'][^"']*\bnoopener\b[^"']*["']/i.test(tag)) missing.push('rel="noopener"')
      if (missing.length === 0) continue
      const line = text.slice(0, match.index ?? 0).split('\n').length
      offenses.push({ file: relative(ROOT, file), line, href, missing })
    }
  }
}

if (offenses.length > 0) {
  console.error('External and RSS links must open in a new tab. Add target="_blank" rel="noopener":')
  for (const o of offenses) {
    console.error(`  ${o.file}:${o.line}  ${o.href}  (missing: ${o.missing.join(', ')})`)
  }
  process.exit(1)
}

console.log(`External-link check passed (${TARGETS.length} root(s) scanned).`)
