import type { PostMeta } from './chrome'

export function generateRSS(posts: PostMeta[], baseUrl: string): string {
  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseUrl}/${p.slug}</link>
      <guid isPermaLink="true">${baseUrl}/${p.slug}</guid>
      <pubDate>${new Date(p.date + 'T00:00:00Z').toUTCString()}</pubDate>
      <description><![CDATA[${p.summary}]]></description>
    </item>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>t15n</title>
    <link>${baseUrl}</link>
    <description>Long-form writing by Thibaut Tiberghien.</description>
    <language>en</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}
