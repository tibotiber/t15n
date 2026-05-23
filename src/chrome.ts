export interface PostMeta {
  title: string
  date: string
  summary: string
  topics: string[]
  aside: string
  slug: string
  content: string
}

export interface OgInfo {
  title?: string
  description?: string
  slug?: string
  path?: string
  type?: 'website' | 'article'
  date?: string
  tag?: string
  fullTitle?: string
}

const SITE = 'https://t15n.io'
const DEFAULT_DESC = 'On the substrate thinking-with-agents needs. Notes by Thibaut Tiberghien alongside building The Mesh.'

const THEME_SCRIPT = `<script>try{var _t=localStorage.getItem("t15n-theme");if(_t)document.documentElement.setAttribute("data-theme",_t)}catch(e){}<\/script>`

const THEME_TOGGLE_SCRIPT = `<script>
(function(){
  var btn=document.getElementById('theme-btn');
  var icon=document.getElementById('theme-icon');
  var root=document.documentElement;
  var MOON='<path d="M13 9.5A5.5 5.5 0 0 1 7.5 4a5.5 5.5 0 1 0 5.5 5.5z"/>';
  var SUN='<circle cx="8" cy="8" r="3"/><g stroke-linecap="round"><line x1="8" y1="1" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/><line x1="3.05" y1="3.05" x2="4.46" y2="4.46"/><line x1="11.54" y1="11.54" x2="12.95" y2="12.95"/><line x1="12.95" y1="3.05" x2="11.54" y2="4.46"/><line x1="4.46" y1="11.54" x2="3.05" y2="12.95"/><\/g>';
  var AUTO='<rect x="1" y="2" width="14" height="10" rx="1.5"/><line x1="5" y1="14" x2="11" y2="14"/><line x1="8" y1="12" x2="8" y2="14"/>';
  function getTheme(){return root.getAttribute('data-theme')||'auto'}
  function render(){
    var t=getTheme();
    if(t==='light'){icon.innerHTML=MOON;btn.title='Switch to dark'}
    else if(t==='dark'){icon.innerHTML=AUTO;btn.title='Switch to auto'}
    else{icon.innerHTML=SUN;btn.title='Switch to light'}
  }
  btn.addEventListener('click',function(){
    var t=getTheme();var n;
    if(t==='auto')n='light';else if(t==='light')n='dark';else n='auto';
    if(n==='auto'){root.removeAttribute('data-theme');try{localStorage.removeItem('t15n-theme')}catch(e){}}
    else{root.setAttribute('data-theme',n);try{localStorage.setItem('t15n-theme',n)}catch(e){}}
    render();
  });
  render();
  var copyEl=document.getElementById('pe-copy');
  if(copyEl){copyEl.addEventListener('click',function(e){e.preventDefault();var orig=this.textContent;navigator.clipboard.writeText(window.location.href).then(function(){copyEl.textContent='Copied!';setTimeout(function(){copyEl.textContent=orig},1500)});})}
  document.addEventListener('click',function(e){
    var anchor=e.target&&e.target.closest?e.target.closest('.aside-anchor'):null;
    document.querySelectorAll('.aside-anchor.is-revealed').forEach(function(el){if(el!==anchor)el.classList.remove('is-revealed')});
    if(anchor){
      var willOpen=!anchor.classList.contains('is-revealed');
      if(willOpen){
        var rect=anchor.getBoundingClientRect();
        anchor.style.setProperty('--aside-top',(rect.bottom+10)+'px');
      }
      anchor.classList.toggle('is-revealed');
    }
  });
})();
<\/script>`

function head(title: string, description: string | undefined, og: OgInfo): string {
  const desc = description ?? DEFAULT_DESC
  const titleText = og.fullTitle ?? `${title} — t15n`
  const ogTitle = og.title ?? titleText
  const ogDesc = og.description ?? desc
  const slug = og.slug ?? 'index'
  const path = og.path ?? '/'
  const type = og.type ?? 'website'
  const imageUrl = `${SITE}/og/${slug}.png`
  const pageUrl = `${SITE}${path}`
  const articleTags =
    type === 'article'
      ? `
  <meta property="article:author" content="Thibaut Tiberghien">${og.date ? `\n  <meta property="article:published_time" content="${esc(og.date)}">` : ''}${og.tag ? `\n  <meta property="article:tag" content="${esc(og.tag)}">` : ''}`
      : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  ${THEME_SCRIPT}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${esc(desc)}">
  <meta name="author" content="Thibaut Tiberghien">
  <link rel="stylesheet" href="/styles.css">
  <link rel="alternate" type="application/rss+xml" title="t15n" href="/rss.xml">
  <title>${esc(titleText)}</title>
  <meta property="og:title" content="${esc(ogTitle)}">
  <meta property="og:description" content="${esc(ogDesc)}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="t15n">${articleTags}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(ogTitle)}">
  <meta name="twitter:description" content="${esc(ogDesc)}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:creator" content="@tibotiber">
  <meta name="twitter:site" content="@tibotiber">
</head>
<body>`
}

function header(): string {
  return `<header>
  <div class="header-left">
    <a href="/" class="wordmark">t15n</a>
    <span class="header-sep">·</span>
    <span class="header-name">Thibaut Tiberghien</span>
  </div>
  <nav class="header-nav">
    <a href="/">home</a>
    <a href="/about">about</a>
    <a href="/rss.xml" target="_blank" rel="noopener">rss</a>
    <button class="theme-btn" id="theme-btn" aria-label="Toggle theme">
      <svg id="theme-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></svg>
    </button>
  </nav>
</header>`
}

function footer(): string {
  return `<footer>
  <span class="ft-mark">t15n</span>
  <span class="ft-byline">Thibaut Tiberghien · <a href="https://x.com/tibotiber" target="_blank" rel="noopener">@tibotiber on X</a> · <a href="mailto:thibaut@smplrspace.com">thibaut@smplrspace.com</a> · <a href="/rss.xml" target="_blank" rel="noopener">RSS</a></span>
  <span class="ft-note">Built on Cloudflare. HTML by hand, mine or Claude's.</span>
</footer>`
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function page(title: string, body: string, description?: string, og: OgInfo = {}): string {
  return `${head(title, description, og)}
${header()}
${body}
${footer()}
${THEME_TOGGLE_SCRIPT}
</body>
</html>`
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00Z')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}
