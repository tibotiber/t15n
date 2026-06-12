function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
}

function inlineMarkdown(html: string): string {
  let s = html.replace(/\s+/g, ' ').trim()
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*')
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
  s = s.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
  s = s.replace(/<[^>]+>/g, '')
  return unescapeHtml(s)
}

export function htmlToMarkdown(html: string): string {
  let md = html.trim()

  // Preserve pre/code blocks verbatim before any other processing
  const codeBlocks: string[] = []
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    const idx = codeBlocks.length
    codeBlocks.push('\n```\n' + unescapeHtml(code).trim() + '\n```\n')
    return `\x00CODE${idx}\x00`
  })

  // Strip kicker — topic and date are already in the YAML frontmatter
  md = md.replace(/<div[^>]*class="kicker[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => '\n# ' + inlineMarkdown(t) + '\n')
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => '\n## ' + inlineMarkdown(t) + '\n')
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => '\n### ' + inlineMarkdown(t) + '\n')

  // Blockquote — process inner <p> tags
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) => {
    const text = inner
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_: string, t: string) => inlineMarkdown(t))
      .replace(/<[^>]+>/g, '')
      .trim()
    return '\n' + text.split('\n').filter(Boolean).map((l: string) => '> ' + l).join('\n') + '\n'
  })

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    return '\n' + items.map((m) => '- ' + inlineMarkdown(m[1])).join('\n') + '\n'
  })

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    return '\n' + items.map((m, i) => `${i + 1}. ` + inlineMarkdown(m[1])).join('\n') + '\n'
  })

  // HR
  md = md.replace(/<hr[^>]*>/gi, '\n\n---\n\n')

  // Regular paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => '\n' + inlineMarkdown(t) + '\n')

  // Restore code blocks
  codeBlocks.forEach((block, idx) => {
    md = md.replace(`\x00CODE${idx}\x00`, block)
  })

  // Strip any leftover tags
  md = md.replace(/<[^>]+>/g, '')
  md = unescapeHtml(md)

  return md.replace(/\n{3,}/g, '\n\n').trim()
}

export function readingTime(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')   // code blocks
    .replace(/`[^`]+`/g, ' ')           // inline code
    .replace(/https?:\/\/\S+/g, ' ')    // bare URLs
    .replace(/[#*_[\]()>~|]/g, ' ')    // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim()
  const words = text.split(' ').filter((w) => w.length > 0).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}
