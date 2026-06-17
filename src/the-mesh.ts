// The Mesh — landing page (t15n.io/the-mesh).
// Monochrome, type-first, product-style journey: a cover (photo + title),
// then the belief (why) → how (it guides the writing) → what (no editor) →
// the proof (before/after) → payoff (pages you can think in) → trust → invite.
// Opening matches the t15n reading column; the rest runs in full-bleed bands.

// Three-party diagram — shares .mesh-fig-* element classes for theming.
const DIAGRAM_SVG = `<svg viewBox="0 0 640 246" role="img" aria-label="You, the agent, and the Mesh's own point of view all meet in one page.">
    <line class="mesh-fig-link" x1="110" y1="66" x2="320" y2="172"/>
    <line class="mesh-fig-link" x1="320" y1="66" x2="320" y2="172"/>
    <line class="mesh-fig-link" x1="530" y1="66" x2="320" y2="172"/>
    <g class="mesh-fig-node">
      <g class="mesh-fig-icon" transform="translate(110 46)"><circle cx="0" cy="-4" r="4.2"/><path d="M-6.5 9.5A7.2 7.2 0 0 1 6.5 9.5"/></g>
      <text x="110" y="26" class="mesh-fig-label">YOU</text>
    </g>
    <g class="mesh-fig-node">
      <g class="mesh-fig-icon" transform="translate(320 46)"><path d="M0 -5V-9H-4"/><rect x="-8" y="-5" width="16" height="12" rx="2.5"/><path d="M-10 1h2"/><path d="M8 1h2"/><path d="M-3 0v2"/><path d="M3 0v2"/></g>
      <text x="320" y="26" class="mesh-fig-label">THE AGENT</text>
    </g>
    <g class="mesh-fig-node">
      <g class="mesh-fig-icon" transform="translate(530 46)"><path d="M0 -7L-8 5"/><path d="M0 -7L8 5"/><path d="M-8 5L8 5"/><circle class="nd" cx="0" cy="-7" r="2.2"/><circle class="nd" cx="-8" cy="5" r="2.2"/><circle class="nd" cx="8" cy="5" r="2.2"/></g>
      <text x="530" y="26" class="mesh-fig-label">THE MESH</text>
    </g>
    <g class="mesh-fig-page">
      <rect x="262" y="172" width="116" height="64" rx="6"/>
      <g class="mesh-fig-icon mesh-fig-pageicon" transform="translate(320 190)"><path d="M-5 -7H2L5 -4V7H-5Z"/><path d="M2 -7V-4H5"/><path d="M-2.5 -1H2.5"/><path d="M-2.5 2H2.5"/></g>
      <text x="320" y="221" class="mesh-fig-pagelabel">a page</text>
    </g>
  </svg>`

// Show the making — the same brief, two ways.
const MAKING = `<div class="mesh2-compare">
      <div class="mesh2-panel reveal">
        <div class="mesh2-panel-label">A generic assistant</div>
        <p class="mesh2-generic">Moving standups to async can improve focus and reduce interruptions for the team. The main benefits are flexibility, fewer meetings, and a written record. The trade-offs are less real-time discussion and slower responses to blockers. A hybrid approach may offer the best of both, so it could be worth trialing the change and gathering feedback before deciding.</p>
      </div>
      <div class="mesh2-panel reveal">
        <div class="mesh2-panel-label">The Mesh</div>
        <div class="mesh2-art">
          <div class="art-row"><span class="art-k">Decision</span><span class="art-v">Standups go async on Monday. Three-week trial.</span></div>
          <div class="art-row"><span class="art-k">Why</span><span class="art-v">The daily call was buying manager visibility, not team flow. The people who needed the sync least were paying for it with their morning.</span></div>
          <div class="art-row"><span class="art-k">Ruled out</span><span class="art-v">A hybrid. It keeps the interruption and adds a second place to coordinate.</span></div>
          <div class="art-row"><span class="art-k">Watching</span><span class="art-v">Can we surface a blocker within the hour, not the day? That is the thing async could break.</span></div>
        </div>
      </div>
    </div>`

// Pixel grab-hand cursor for the live-canvas thumbnail, built from a grid
// ('#' = filled pixel) so it reads as a retro cursor over the dragged card.
// Open-hand "grab" cursor for the live-canvas thumbnail (Tabler "hand-stop", MIT).
// The finger/palm outlines are filled white so the hand reads as a solid cursor,
// with a dark outline kept for visibility in light mode. The palm is drawn first
// so the finger-division strokes stay visible on top, all reaching the same
// baseline (y=12) rather than being hidden under the palm fill. Scaled and parked
// over the dragged box.
const GRAB_HAND =
  `<g class="tn-grab" transform="translate(127 82) scale(1.35)">` +
  `<path d="M17 7.5a1.5 1.5 0 0 1 3 0v8.5a6 6 0 0 1 -6 6h-2h.208a6 6 0 0 1 -5.012 -2.7a69.74 69.74 0 0 1 -.196 -.3c-.312 -.479 -1.407 -2.388 -3.286 -5.728a1.5 1.5 0 0 1 .536 -2.022a1.867 1.867 0 0 1 2.28 .28l1.47 1.47"/>` +
  `<path d="M8 13v-7.5a1.5 1.5 0 0 1 3 0v6.5"/>` +
  `<path d="M11 12V3.5a1.5 1.5 0 0 1 3 0V12"/>` +
  `<path d="M14 12V5.5a1.5 1.5 0 0 1 3 0V12"/>` +
  `</g>`

// Example thumbnails — monochrome mini-artifacts showing the forms a page
// can take: a table, a diagram, a chart, a live (manipulable) canvas, a map.
const THUMBS: Array<{ label: string; svg: string }> = [
  {
    label: 'A table',
    svg: `<svg class="tn" viewBox="0 0 220 150" aria-hidden="true">
      <rect class="tn-frame" x="14" y="20" width="192" height="110" rx="6"/>
      <rect class="tn-fill" x="15" y="21" width="190" height="23" rx="5"/>
      <line class="tn-line" x1="78" y1="20" x2="78" y2="130"/>
      <line class="tn-line" x1="142" y1="20" x2="142" y2="130"/>
      <line class="tn-line" x1="14" y1="66" x2="206" y2="66"/>
      <line class="tn-line" x1="14" y1="88" x2="206" y2="88"/>
      <line class="tn-line" x1="14" y1="110" x2="206" y2="110"/>
      <rect class="tn-ink" x="24" y="29" width="30" height="6" rx="2"/>
      <rect class="tn-ink" x="90" y="29" width="30" height="6" rx="2"/>
      <rect class="tn-ink" x="154" y="29" width="30" height="6" rx="2"/>
      <rect class="tn-soft" x="24" y="52" width="34" height="5" rx="2"/>
      <rect class="tn-soft" x="90" y="52" width="22" height="5" rx="2"/>
      <rect class="tn-soft" x="24" y="74" width="28" height="5" rx="2"/>
      <rect class="tn-soft" x="154" y="74" width="30" height="5" rx="2"/>
      <rect class="tn-soft" x="90" y="96" width="34" height="5" rx="2"/>
    </svg>`,
  },
  {
    label: 'A diagram',
    svg: `<svg class="tn" viewBox="0 0 220 150" aria-hidden="true">
      <line class="tn-link" x1="110" y1="50" x2="66" y2="92"/>
      <line class="tn-link" x1="110" y1="50" x2="154" y2="92"/>
      <line class="tn-link" x1="88" y1="104" x2="132" y2="104"/>
      <rect class="tn-box" x="88" y="26" width="44" height="24" rx="5"/>
      <rect class="tn-box" x="44" y="92" width="44" height="24" rx="5"/>
      <rect class="tn-box" x="132" y="92" width="44" height="24" rx="5"/>
      <rect class="tn-ink" x="96" y="35" width="28" height="6" rx="2"/>
      <rect class="tn-ink" x="52" y="101" width="28" height="6" rx="2"/>
      <rect class="tn-ink" x="140" y="101" width="28" height="6" rx="2"/>
    </svg>`,
  },
  {
    label: 'A chart',
    svg: `<svg class="tn" viewBox="0 0 220 150" aria-hidden="true">
      <line class="tn-line" x1="24" y1="28" x2="24" y2="120"/>
      <line class="tn-line" x1="24" y1="120" x2="200" y2="120"/>
      <polyline class="tn-curve" points="24,102 60,78 96,90 132,52 168,64 200,34"/>
      <circle class="tn-dot" cx="60" cy="78" r="3.4"/>
      <circle class="tn-dot" cx="132" cy="52" r="3.4"/>
      <circle class="tn-dot" cx="200" cy="34" r="3.4"/>
    </svg>`,
  },
  {
    label: 'A live canvas',
    svg: `<svg class="tn" viewBox="0 0 220 150" aria-hidden="true">
      <rect class="tn-frame" x="16" y="20" width="188" height="110" rx="6"/>
      <rect class="tn-box" x="34" y="36" width="46" height="26" rx="5"/>
      <rect class="tn-ink" x="42" y="45" width="30" height="6" rx="2"/>
      <path class="tn-dash" d="M82 66 q30 4 56 18"/>
      <rect class="tn-box" x="106" y="76" width="46" height="26" rx="5"/>
      <rect class="tn-ink" x="114" y="85" width="30" height="6" rx="2"/>
      ${GRAB_HAND}
    </svg>`,
  },
  {
    label: 'A map',
    svg: `<svg class="tn" viewBox="0 0 220 150" aria-hidden="true">
      <rect class="tn-frame" x="18" y="20" width="184" height="110" rx="6"/>
      <line class="tn-grid" x1="78" y1="20" x2="78" y2="130"/>
      <line class="tn-grid" x1="140" y1="20" x2="140" y2="130"/>
      <line class="tn-grid" x1="18" y1="58" x2="202" y2="58"/>
      <line class="tn-grid" x1="18" y1="94" x2="202" y2="94"/>
      <polygon class="tn-zone" points="34,54 58,44 80,54 86,74 70,92 44,94 30,76"/>
      <polygon class="tn-zone" points="120,38 150,34 170,50 160,66 132,64 122,52"/>
      <polygon class="tn-zone" points="152,88 184,84 192,106 168,116 150,104"/>
      <path class="tn-pin" d="M104 94 L112.3 73.4 A9 9 0 1 0 95.7 73.4 Z"/>
      <circle class="tn-maphole" cx="104" cy="70" r="3.4"/>
    </svg>`,
  },
]

const THUMB_CARDS = THUMBS.map(
  (t) => `<div class="mesh3-thumb reveal">${t.svg}<div class="mesh3-thumb-label">${t.label}</div></div>`,
).join('\n        ')

// The "code safety net" group. Each element shows its status with a monochrome
// mark — a check for what's in place, a half-disc for in progress, a ring for
// not started — so the row reads as a roadmap without leaning on color. The
// title (hover) text spells the status out for clarity and accessibility.
const NET_MARKS: Record<string, string> = {
  done: '<svg class="mesh-net-mark" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.6 6.3 5 8.7 9.4 3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  progress:
    '<svg class="mesh-net-mark" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6 2A4 4 0 0 1 6 10Z" fill="currentColor"/></svg>',
  todo: '<svg class="mesh-net-mark" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
}
const NET_STATUS: Record<string, string> = { done: 'In place', progress: 'In progress', todo: 'Planned' }
const NET =
  `<div class="mesh-net-title">Safety net, borrowed from code</div>
      <div class="mesh-net-items">` +
  [
    { label: 'Diff', status: 'done' },
    { label: 'Review', status: 'done' },
    { label: 'Rollback', status: 'progress' },
    { label: 'Attribution', status: 'progress' },
    { label: 'Test', status: 'todo' },
  ]
    .map(
      ({ label, status }) =>
        `<span class="mesh-net-item mesh-net-${status}" title="${NET_STATUS[status]}">${NET_MARKS[status]}${label}</span>`,
    )
    .join('') +
  `</div>`

export function theMeshBody(): string {
  return `<div class="mesh2">

  <section class="mesh2-sec mesh3-open">
    <div class="mesh3-inner">
      <div class="kicker">An experiment in what shared knowledge should be once AI writes</div>
      <div class="mesh-hero-photo">
        <img src="/img/mesh-hero.jpg" alt="A person working at a laptop, a second laptop across the table." width="2000" height="1333">
        <h1 class="mesh-hero-title"><span class="mesh-hl"><svg class="mesh-hl-mark" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="hlrough" x="-8%" y="-25%" width="116%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.022 0.075" numOctaves="2" seed="4" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="11" xChannelSelector="R" yChannelSelector="G"/></filter><linearGradient id="hlfill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4e24a" stop-opacity="0.3"/><stop offset="0.13" stop-color="#f4e24a" stop-opacity="0.88"/><stop offset="0.5" stop-color="#efd838" stop-opacity="0.95"/><stop offset="0.87" stop-color="#f4e24a" stop-opacity="0.88"/><stop offset="1" stop-color="#f4e24a" stop-opacity="0.34"/></linearGradient></defs><rect x="6" y="9" width="288" height="48" rx="22" fill="url(#hlfill)" filter="url(#hlrough)" opacity="0.58"/><rect x="9" y="23" width="285" height="48" rx="22" fill="url(#hlfill)" filter="url(#hlrough)" opacity="0.58"/></svg>The Mesh</span></h1>
        <p class="mesh-hero-credit">Photo <a href="https://unsplash.com/@priscilladupreez?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank" rel="noopener">Priscilla Du Preez</a> / <a href="https://unsplash.com/photos/a-man-sitting-in-front-of-a-laptop-computer-OEdkPaxYMXU?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a></p>
      </div>
      <p class="mesh-tagline">A knowledge base that writes with you, <span class="mesh-tw">not just for you.</span></p>
      <section class="mesh-section mesh-belief">
        <p class="mesh-statement">When AI makes output free, the thinking becomes the only part that still has value.</p>
        <p>The real product of a session with AI is not the text it produced. It is the understanding you built getting there, and that understanding dies when the tab closes. A page of conclusions nobody can trace back is a liability, not knowledge. The Mesh keeps the reasoning, so it compounds across a team instead of evaporating.</p>
      </section>
    </div>
  </section>

  <section class="mesh2-sec mesh2-alt">
    <div class="mesh2-inner">
      <h2 class="reveal">When your knowledge base says no.</h2>
      <p class="reveal">Keeping the reasoning takes more than a place to put it. The Mesh carries an opinion about what good knowledge work is and how it compounds, and it applies that opinion while a page is being written, including when that means pushing back on you.</p>
    </div>
  </section>

  <section class="mesh2-sec">
    <div class="mesh2-inner">
      <div class="mesh2-split">
        <div class="reveal">
          <h2>There is no text editor. You direct an agent.</h2>
          <p>You tell an agent what you want, and the Mesh briefs it on what good work looks like. The agent writes from both, so every page has three authors.</p>
        </div>
        <div class="mesh2-fig reveal">${DIAGRAM_SVG}</div>
      </div>
    </div>
  </section>

  <section class="mesh2-sec mesh2-alt mesh2-making">
    <div class="mesh2-inner">
      <h2 class="reveal">The difference is the brief.</h2>
      <p class="reveal">Give the same request to a generic assistant and to the Mesh. The generic one returns the safe, hedged answer, while the Mesh returns a point of view anchored in the team's actual context.</p>
      <div class="mesh2-prompt reveal"><span class="pr-k">The request</span>"Write up why we're moving standups to async."</div>
      ${MAKING}
    </div>
  </section>

  <section class="mesh2-sec mesh3-payoff">
    <div class="mesh2-inner">
      <h2 class="reveal">Pages you can actually think in.</h2>
      <p class="reveal">Plain text won on terseness, which only mattered while a human typed the markup. Once the agent does that, a page can become whatever the thought needs, laid out so the structure carries the meaning instead of decorating it. One artifact, at one address, doing what a doc, a deck, and a whiteboard each did partway.</p>
      <div class="mesh3-thumbs">
        ${THUMB_CARDS}
      </div>
    </div>
  </section>

  <section class="mesh2-sec mesh2-alt">
    <div class="mesh2-inner">
      <h2 class="reveal">No trust, no adoption.</h2>
      <p class="reveal">Of everything AI could be applied to, code was one of the first to earn that trust. There are a few reasons, but the most interesting one, for what we're doing, is that a wrong answer was survivable there: every change is a diff, it gets reviewed, it can be rolled back, and it carries a name. Giving knowledge work that same safety net is one of the things the Mesh is working toward. It is not all there yet, but we have started putting the first pieces in place.</p>
      <div class="mesh-net reveal">${NET}</div>
    </div>
  </section>

  <section class="mesh2-sec mesh2-close">
    <div class="mesh2-inner reveal">
      <p>The Mesh runs today, built with Claude and using itself. It is more of an experiment than a product, and the team at Smplrspace already uses it. <span class="mesh-muted">If any of this resonates, or you are putting an agent layer on your own product and asking what good output even means once the agent writes it, I'm open to talk.</span></p>
      <p class="mesh-more"><a href="/about">About me <span class="arrow" aria-hidden="true"><svg viewBox="0 0 5 10"><path d="M0.7 0.7 4.3 5 0.7 9.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></p>
    </div>
  </section>

  </div>
  <script>
  (function(){
    var d=document.documentElement;d.classList.add('js-reveal');
    var els=[].slice.call(document.querySelectorAll('.reveal'));
    if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{rootMargin:'0px 0px -10% 0px'});
    els.forEach(function(e){io.observe(e)});
  })();
  </script>`
}
