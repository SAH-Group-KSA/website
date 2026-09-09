# English prototype — section map for React

Source: `prototypes/SAH Group _ From People to Impact.html`

**Shared dialogs** (after `<main>`, not inside these sections): `#entity-modal`, `#program-modal`, `#contact-modal` — class `modal`; close via `.modal-close[data-close-dialog]`; `document.body.modal-open` while open.

## `top`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `top` |
| `class` | `hero` |
| `aria-labelledby` | `hero-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="hero-title" class="hero" id="top"> <div aria-hidden="true" class="hero-media"></div> <div aria-hidden="true" class="hero-noise"></div> <div class="container hero-grid"> <div class="hero-copy reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow eyebrow-light" dir="ltr">SAH GROUP<br>PEOPLE FIRST BUSINESS FOLLOWS</p> <h1 id="hero-title">Every lasting impact<br>begins with people<span>Create impact that can be seen</span></h1> <p class="hero-lead">SAH Group is an integrated ecosystem of six specialized companies. We combine expertise in people, leadership, business, technology, partnerships, and impact to turn ideas and challenges into clear, measurable, executable pathways.</p> <div class="hero-actions"> <a class="button button-gold" href="#need">Start Your Journey</a> <a class="button button-ghost" href="#entities">SAH Group</a> </div> <div aria-label="Key highlights" class="hero-proof"> <span><strong>6</strong> Specialized Companies</span> <span><strong>1</strong> Point of Entry</span> <span><strong>1</strong> Integrated Journey</span> </div> </div> <div aria-label="SAH Group entity map" class="group-orbit reveal is-visible" data-delay="120" data-observed="true" style="--reveal-delay: 120ms;"> <div aria-hidden="true" class="orbit-ring orbit-ring-1"></div> <div aria-hidden="true" class="orbit-ring orbit-ring-2"></div> <button aria-label="SAH Group" class="orbit-center" data-scroll-target="#entities" type="button"> <img alt="" height="68" src="[IMG]" width="185"> </button> <button aria-label="SAH Human" class="orbit-node orbit-human" data-entity="human" type="button"><span>SAH<br>HUMAN</span></button> <button aria-label="SEERA" class="orbit-node orbit-seera" data-entity="seera" type="button"><span>SEERA</span></button> <button aria-label="SAH Nexus" class="orbit-node orbit-nexus" data-entity="nexus" type="button"><span>SAH<br>NEXUS</span></button> <button aria-label="SAH Sponsor" class="orbit-node orbit-connect" data-entity="connect" type="button"><span>SAH<br>SPONSOR</span></button> <button aria-label="LEGO by SAH" class="orbit-node orbit-lego" data-entity="lego" type="button"><span>LEGO®<br>BY SAH</span></button> <button aria-label="SAH Impact" class="orbit-node orbit-impact" data-entity="impact" type="button"><span>SAH<br>IMPACT</span></button> </div> </div> <a aria-label="Go to the next section" class="hero-scroll" href="#promise"><span></span>Discover</a> </section>
```

### 3. Interactive elements

- CTA links: `.hero-actions` → `#need`, `#entities`
- Orbit map: `.orbit-center` (`data-scroll-target="#entities"`) + 6× `.orbit-node` (`data-entity`) — opens entity modal / scroll
- Scroll cue: `.hero-scroll` → `#promise`

### 4. Important CSS classes to recreate

- `.hero`
- `.hero-grid`
- `.hero-copy`
- `.hero-media`
- `.hero-noise`
- `.hero-lead`
- `.hero-actions`
- `.hero-proof`
- `.hero-scroll`
- `.group-orbit`
- `.orbit-ring`
- `.orbit-ring-1`
- `.orbit-ring-2`
- `.orbit-center`
- `.orbit-node`
- `.orbit-human`
- `.orbit-seera`
- `.orbit-nexus`
- `.orbit-connect`
- `.orbit-lego`
- `.orbit-impact`
- `.button`
- `.button-gold`
- `.button-ghost`
- `.eyebrow`
- `.eyebrow-light`
- `.reveal`
- `.container`

---

## `promise`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `promise` |
| `class` | `promise section` |

### 2. Key child structure (classes only, compact)

```html
<section class="promise section" id="promise"> <div class="container split-layout"> <div class="section-heading reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow">The SAH Group Client Journey</p> <h2>We understand<br>Build<br>and execute—for impact that lasts</h2> <p class="lead">At SAH Group, we begin by understanding the current state, design the right pathway, bring together the required expertise, guide execution, and measure what changes.</p> <a class="text-link" href="#need">Start the Transformation Journey <span>←</span></a> </div> <div class="question-cluster reveal is-visible" data-delay="120" data-observed="true"> <article><span>01</span><h3>Analysis</h3><strong>Impact requires clarity about the starting point</strong><p>We listen to the challenge, review the evidence, identify priorities, and define what must be designed—creating a clear view that guides the next steps.</p></article> <article><span>02</span><h3>Pathway</h3><strong>We design the pathway and bring together the expertise</strong><p>We turn the analysis into an integrated pathway and assemble the right capabilities from across SAH Group to build the most effective solution.</p></article> <article><span>03</span><h3>Execution</h3><strong>We turn design into reality</strong><p>We activate the pathway with the client and manage execution and enablement so ideas move from planning into tangible outcomes.</p></article> <article><span>04</span><h3>Impact Measurement</h3><strong>We measure what changed</strong><p>We track outcomes, measure progress, and ensure that execution leads to clear, sustainable impact.</p></article> </div> </div> </section>
```

### 3. Interactive elements

- Text link to `#need` (no JS widgets)

### 4. Important CSS classes to recreate

- `.promise`
- `.section`
- `.container`
- `.split-layout`
- `.section-heading`
- `.question-cluster`
- `.eyebrow`
- `.lead`
- `.text-link`
- `.reveal`

---

## `need`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `need` |
| `class` | `journey-builder section section-dark` |
| `aria-labelledby` | `need-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="need-title" class="journey-builder section section-dark" id="need"> <div class="container"> <div class="section-heading centered reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow eyebrow-light">Start with Your Need</p> <h2 id="need-title">Begin your journey with a clear need</h2> <p class="lead">Three short steps help us understand your need and identify the right pathway.</p> </div> <div class="journey-shell reveal is-visible" data-delay="100" data-observed="true" style="--reveal-delay: 100ms;"> <div aria-label="Pathway-building steps" class="journey-steps"> <div class="journey-step is-active" data-step="1"><span>1</span><b>Understand</b></div> <div class="journey-step" data-step="2"><span>2</span><b>Analyze</b></div> <div class="journey-step" data-step="3"><span>3</span><b>Build</b></div> </div> <div class="journey-stage" id="journey-stage-audience"> <div class="journey-stage-heading"> <span class="stage-number">01</span> <div><h3>Start Your Journey:</h3><p></p></div> </div> <div class="audience-options"> <button class="audience-card" data-audience="individual" type="button"> <span aria-hidden="true" class="audience-icon">I</span> <b>Individual</b> <small></small> <span aria-hidden="true" class="card-arrow">←</span> </button> <button class="audience-card" data-audience="organization" type="button"> <span aria-hidden="true" class="audience-icon">O</span> <b>Organization</b> <small></small> <span aria-hidden="true" class="card-arrow">←</span> </button> </div> </div> <div class="journey-stage" hidden="" id="journey-stage-challenge"> <div class="journey-stage-heading"> <button aria-label="Back to Previous Step" class="back-button js-journey-back" type="button">→</button> <span class="stage-number">02</span> <div><h3 id="challenge-heading">What do you want to change at this stage?</h3><p>Choose the area closest to your current need so we can understand it and identify the most suitable pathway.</p></div> </div> <div class="challenge-grid" id="challenge-grid"></div> </div> <div aria-live="polite" class="journey-stage" hidden="" id="journey-stage-result"> <div class="journey-stage-heading"> <button aria-label="Back to Previous Step" class="back-button js-journey-back" type="button">→</button> <span class="stage-number">03</span> <div><h3>The Right Pathway for Your Need</h3><p>Based on your answers, this pathway is designed for your current need and leads from challenge clarity to execution and impact measurement.</p></div> </div> <div class="recommendation" id="journey-result"></div> </div> </div> </div> </section>
```

### 3. Interactive elements

- Step indicators: `.journey-step` (`data-step`, `.is-active`) — visual only, driven by wizard JS
- Stage 1: `.audience-card` buttons (`data-audience="individual|organization"`)
- Stage 2: `#challenge-grid` challenge buttons (dynamic) + `.js-journey-back`
- Stage 3: `#journey-result` recommendation HTML + `.js-journey-back`; parent `#journey-stage-result` has `aria-live="polite"`

### 4. Important CSS classes to recreate

- `.journey-builder`
- `.section-dark`
- `.journey-shell`
- `.journey-steps`
- `.journey-step`
- `.is-active`
- `.journey-stage`
- `.journey-stage-heading`
- `.stage-number`
- `.audience-options`
- `.audience-card`
- `.audience-icon`
- `.card-arrow`
- `.challenge-grid`
- `.recommendation`
- `.back-button`
- `.js-journey-back`
- `.centered`

---

## `entities`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `entities` |
| `class` | `entities section` |
| `aria-labelledby` | `entities-title` |

### 2. Key child structure (classes only, compact)

```html
<section … id="entities">
  <div class="container">
    <div class="section-heading centered reveal">…</div>
    <div class="entity-grid" id="entity-grid">
      <article class="entity-card reveal" data-entity-card="{human|seera|nexus|connect|lego|impact}" style="--entity-color; --entity-soft">
        <div class="entity-brand"><span class="entity-wordmark">…</span></div>
        <div class="entity-card-name">…</div>
        <h3>…</h3><p>…</p>
        <div class="entity-when"><b>When to use it</b>…</div>
        <div class="entity-featured-programs[ is-multi]">
          <div class="entity-featured-program">…<div class="entity-program-network">…<button class="entity-link-chip" data-entity="…">…</button></div></div>
        </div>
        <button class="entity-open" data-entity="…">Explore the Entity</button>
      </article>
      ×6 entities
    </div>
    <div class="integration-note" id="solutions"><span class="integration-mark">+</span><div>…</div></div>
  </div>
</section>
```

### 3. Interactive elements

- Per card: `.entity-open` (`data-entity`) → `#entity-modal`
- Integrated entity chips: `.entity-link-chip` (`data-entity`) → same modal
- Hero orbit nodes (in `#top`) reuse same entity keys

### 4. Important CSS classes to recreate

- `.entities`
- `.entity-grid`
- `.entity-card`
- `.entity-brand`
- `.entity-wordmark`
- `.entity-card-name`
- `.entity-when`
- `.entity-featured-programs`
- `.entity-featured-program`
- `.entity-featured-kicker`
- `.entity-program-network`
- `.entity-program-links`
- `.entity-link-chip`
- `.entity-open`
- `.is-multi`
- `.integration-note`
- `.integration-mark`
- `.visually-hidden`

---

## `method-intro`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `method-intro` |
| `class` | `method-intro section section-dark` |
| `aria-labelledby` | `method-intro-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="method-intro-title" class="method-intro section section-dark" id="method-intro"><div class="container method-intro-inner"><p class="eyebrow eyebrow-light">Impact starts with clarity about the point of transformation</p><h2 id="method-intro-title">Read the Reality<br>Build the Path<br>Lead Execution<br>Measure What Changed</h2><h3>SAH Impact Measurement Index</h3><p class="lead">An integrated measurement index developed by SAH Group local and international experts to assess the current state, track transformation, and measure program and initiative impact across individuals, teams, and organizations.</p></div></section>
```

### 3. Interactive elements

- Static narrative block only

### 4. Important CSS classes to recreate

- `.method-intro`
- `.section-dark`
- `.method-intro-inner`
- `.eyebrow-light`
- `.lead`
- `.container`

---

## `method`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `method` |
| `class` | `method section section-dark` |
| `aria-labelledby` | `method-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="method-title" class="method section section-dark" id="method"> <div class="container method-layout"> <div class="section-heading reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow eyebrow-light">SAH Group Methodology</p> <h2 id="method-title">One Journey—Starting<br>with Understanding and Leading to Impact</h2> <p class="lead">A unified methodology that connects understanding with execution and leads to clear, sustainable impact.</p> <div aria-label="Methodology stages" class="method-controls" role="tablist"> <button aria-selected="true" data-method="see" role="tab" type="button"><span>01</span>Read the Reality</button> <button aria-selected="false" data-method="design" role="tab" type="button"><span>02</span>Design</button> <button aria-selected="false" data-method="build" role="tab" type="button"><span>03</span>Build</button> <button aria-selected="false" data-method="enable" role="tab" type="button"><span>04</span>Enable</button> <button aria-selected="false" data-method="prove" role="tab" type="button"><span>05</span>Prove Impact</button> </div> </div> <div id="sah-method-editor-templates" hidden="" aria-hidden="true"><template data-method-template="see"></template><template data-method-template="design"></template><template data-method-template="build"></template><template data-method-template="enable"></template><template data-method-template="prove"></template></div><div class="method-panel reveal is-visible" data-delay="120" data-observed="true" id="method-panel" role="tabpanel" style="--reveal-delay: 120ms;" tabindex="0" data-active-method="see" aria-label="Read the Reality"> <span class="method-number">01</span> <h3>Read the Reality</h3> <p>We read the current reality and context before making recommendations, identify the real challenge, stakeholders, gaps, and opportunities, and establish a baseline for comparison.</p> <div class="method-output"><span>Discovery sessions and interviews</span><span>Readiness or maturity assessment</span><span>Stakeholder map</span><span>Clear problem definition</span></div> <div class="method-decision">Stage decision: agree on the problem worth solving and the right starting point.</div></div> </div> </section>
```

### 3. Interactive elements

- Tablist: `.method-controls` `role="tablist"` with 5× `role="tab"` buttons (`data-method="see|design|build|enable|prove"`, `aria-selected`)
- Panel: `#method-panel` `role="tabpanel"` (`data-active-method`, content swapped from hidden `#sah-method-editor-templates` `<template data-method-template>`)

### 4. Important CSS classes to recreate

- `.method`
- `.method-layout`
- `.method-controls`
- `.method-panel`
- `.method-number`
- `.method-output`
- `.method-decision`
- `.section-dark`
- `.eyebrow-light`

---

## `programs`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `programs` |
| `class` | `programs section` |
| `aria-labelledby` | `programs-title` |

### 2. Key child structure (classes only, compact)

```html
<section … id="programs">
  <div class="container">
    <div class="section-heading reveal">…</div>
    <div class="program-toolbar reveal">
      <label class="search-field"><input id="program-search" type="search" placeholder="…" /><span>⌕</span></label>
      <div class="filter-group" aria-label="Filter programs by entity">
        <button class="filter-chip is-active" data-filter-entity="all">All</button>
        <button class="filter-chip" data-filter-entity="human|seera|nexus|connect|lego|impact">…</button>
      </div>
      <div class="select-row">
        <label>Audience <select id="program-audience">…</select></label>
        <label>Level <select id="program-level">…</select></label>
      </div>
      <p class="program-count" id="program-count" aria-live="polite">Showing …</p>
    </div>
    <div class="program-grid" id="program-grid">
      <article class="program-card" data-program-id="…" style="--program-color">
        <div class="program-top"><span class="program-entity">…</span><span class="program-level">…</span></div>
        <h3>…</h3><p>…</p>
        <div class="program-meta">…</div>
        <button class="program-open" data-program="…">View Program</button>
      </article>
      ×N cards (34 in data)
    </div>
  </div>
</section>
```

### 3. Interactive elements

- Search: `#program-search` (`type="search"`) filters grid
- Entity filters: `.filter-chip` in `.filter-group` (`data-filter-entity`, `.is-active`)
- Selects: `#program-audience`, `#program-level`
- Live count: `#program-count` (`aria-live="polite"`)
- Cards: `.program-card` in `#program-grid`; `.program-open` (`data-program`) → `#program-modal`
- Optional entity chips on cards: `.entity-link-chip` on related entities

### 4. Important CSS classes to recreate

- `.programs`
- `.program-toolbar`
- `.search-field`
- `.filter-group`
- `.filter-chip`
- `.is-active`
- `.select-row`
- `.program-count`
- `.program-grid`
- `.program-card`
- `.program-top`
- `.program-entity`
- `.program-level`
- `.program-open`
- `.program-related-entities`

---

## `journeys`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `journeys` |
| `class` | `client-journeys section section-tinted` |
| `aria-labelledby` | `journeys-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="journeys-title" class="client-journeys section section-tinted" id="journeys"> <div class="container"> <div class="section-heading centered reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow">One Journey. Integrated Expertise.</p> <h2 id="journeys-title">From Understanding to Achieving and Sustaining Impact</h2> </div> <div aria-label="Client journey examples" class="journey-tabs reveal is-visible" data-observed="true" role="tablist" style="--reveal-delay: 0ms;"> <button aria-selected="true" data-journey-example="individual" role="tab" type="button">Individual Example</button> <button aria-selected="false" data-journey-example="organization" role="tab" type="button">Organization Example</button> </div> <div id="sah-journey-editor-templates" hidden="" aria-hidden="true"><template data-journey-template="individual"></template><template data-journey-template="organization"></template></div><div class="journey-example reveal is-visible" data-observed="true" id="journey-example-panel" role="tabpanel" style="--reveal-delay: 0ms;" data-active-journey-example="individual" aria-label="A Leader Moving into an Executive Role"> <div class="journey-example-head"><div><h3>A Leader Moving into an Executive Role</h3><p>Executive transition requires readiness in decision-making, presence, and behavior—not simply more information.</p></div><span class="journey-example-badge">Individual Journey</span></div> <div class="timeline"><article class="timeline-item" style="--timeline-color:#c89a13"><span class="timeline-number">1</span><b>Discovery</b><p>Interview, context, stakeholders, and baseline</p></article><article class="timeline-item" style="--timeline-color:#004530"><span class="timeline-number">2</span><b>Leadership Readiness</b><p>Readiness map, executive coaching, and role priorities</p></article><article class="timeline-item" style="--timeline-color:#30133D"><span class="timeline-number">3</span><b>Executive Presence</b><p>Identity, messages, and presence aligned with the new role</p></article><article class="timeline-item" style="--timeline-color:#C1AD66"><span class="timeline-number">4</span><b>Shared Simulation</b><p>A simulation or collaborative thinking session with the team when needed</p></article><article class="timeline-item" style="--timeline-color:#12304A"><span class="timeline-number">5</span><b>Application</b><p>A 90-day plan, follow-up, and behavioral metrics</p></article><article class="timeline-item" style="--timeline-color:#6F9E82"><span class="timeline-number">6</span><b>Extension</b><p>Ongoing coaching or transition to a higher-level challenge</p></article></div> <div class="journey-deliverables"><b>Deliverables:</b><span>Readiness report</span><span>Transition map</span><span>Coaching sessions</span><span>Presence strategy</span><span>90-day plan</span><span>Progress measurement</span></div></div> </div> </section>
```

### 3. Interactive elements

- Tablist: `.journey-tabs` with 2× `role="tab"` (`data-journey-example="individual|organization"`)
- Panel: `#journey-example-panel` `role="tabpanel"` + `.timeline` / `.timeline-item` (content from `#sah-journey-editor-templates`)

### 4. Important CSS classes to recreate

- `.client-journeys`
- `.section-tinted`
- `.journey-tabs`
- `.journey-example`
- `.journey-example-head`
- `.journey-example-badge`
- `.timeline`
- `.timeline-item`
- `.timeline-number`

---

## `partners`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `partners` |
| `class` | `partners-section section` |
| `aria-labelledby` | `partners-title` |

### 2. Key child structure (classes only, compact)

```html
<section … id="partners">
  <div class="container">
    <div class="section-heading centered reveal">…</div>
    <div class="partner-logo-grid reveal">
      <article class="partner-logo-card"><img src="[IMG]" alt="Strategic Partner" /></article>
      ×multiple partner logos
    </div>
  </div>
</section>
```

### 3. Interactive elements

- Static `.partner-logo-grid` / `.partner-logo-card` (images only)

### 4. Important CSS classes to recreate

- `.partners-section`
- `.partner-logo-grid`
- `.partner-logo-card`
- `.section-heading`
- `.centered`
- `.reveal`

---

## `impact`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `impact` |
| `class` | `measurement section section-dark` |
| `aria-labelledby` | `impact-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="impact-title" class="measurement section section-dark" id="impact"> <div class="container measurement-grid"> <div class="section-heading reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow eyebrow-light">SAH Impact Measurement Index</p> <h2 id="impact-title">We Measure Impact and Strengthen Its Sustainability</h2> <p class="lead">Measurement that extends to sustainable value</p> <div aria-label="Impact measurement chain" class="measurement-chain"> <span>Baseline</span><i>←</i><span>Outputs</span><i>←</i><span>Adoption</span><i>←</i><span>Outcomes</span><i>←</i><span>Impact</span> </div> </div> <div class="metrics-panel reveal is-visible" data-delay="120" data-observed="true" style="--reveal-delay: 120ms;"> <p class="metrics-label">Selected Experience Metrics</p> <div class="metrics-grid"> <article><strong class="counter" data-suffix="+" data-target="4000">4000+</strong><span>People Reached</span></article> <article><strong class="counter" data-suffix="+" data-target="500">500+</strong><span>Leadership Coaching Engagements</span></article> <article><strong class="counter" data-suffix="+" data-target="14">14+</strong><span>Members in an Integrated Team</span></article> <article><strong class="counter" data-suffix="+" data-target="2">2+</strong><span>International Partnerships</span></article> <article><strong class="counter" data-suffix="+" data-target="25">25+</strong><span>Experts in Our Network</span></article></div> <p class="data-note">Final figures are subject to confirmation before public launch.</p> </div> </div> </section>
```

### 3. Interactive elements

- Decorative chain: `.measurement-chain` (spans + separators)
- Animated counters: `.counter` (`data-target`, `data-suffix`) in `.metrics-grid` — scroll/reveal JS

### 4. Important CSS classes to recreate

- `.measurement`
- `.section-dark`
- `.measurement-grid`
- `.measurement-chain`
- `.metrics-panel`
- `.metrics-label`
- `.metrics-grid`
- `.counter`
- `.data-note`

---

## `initiatives`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `initiatives` |
| `class` | `initiatives section` |
| `aria-labelledby` | `initiatives-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="initiatives-title" class="initiatives section" id="initiatives"> <div class="container"> <div class="section-heading centered reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow">Selected Initiatives &amp; Platforms</p> <h2 id="initiatives-title">Spaces that Create Knowledge and Lead to Impact</h2> <p class="lead">Initiatives and platforms that turn expertise into dialogue, knowledge, and a professional identity built to extend.</p> </div> <div class="initiatives-grid"> <article class="initiative-card reveal is-visible" data-observed="true" style="--initiative-color: var(--impact); --reveal-delay: 0ms;"> <span class="initiative-owner">SAH IMPACT</span> <h3>SAH Dialogues</h3> <p>A dialogue series hosting experts and leaders to discuss the decisions, transformations, and journeys behind their impact.</p> <div class="initiative-stats"><span><strong>20</strong> Sessions</span><span><strong>20</strong> Experts</span></div> <button class="text-link js-open-contact" data-contact-context="Interest in SAH Dialogues" type="button">Explore SAH Dialogues <span aria-hidden="true">←</span></button> </article> <article class="initiative-card reveal is-visible" data-delay="80" data-observed="true" style="--initiative-color: var(--deep); --reveal-delay: 80ms;"> <span class="initiative-owner">SAH GROUP</span> <h3>SAH Group Newsletter</h3> <p>Selected ideas, experiences, and tools that support clearer vision and more informed decisions.</p> <form class="newsletter-form" id="newsletter-form" novalidate=""> <label class="visually-hidden" for="newsletter-email">Email Address</label> <input autocomplete="email" id="newsletter-email" name="newsletterEmail" placeholder="Your email address" required="" type="email"> <button class="button button-primary" type="submit">Subscribe</button> </form> <p class="newsletter-status" id="newsletter-status" role="status"></p> </article> <article class="initiative-card reveal is-visible" data-delay="160" data-observed="true" style="--initiative-color: var(--seera); --reveal-delay: 160ms;"> <span class="initiative-owner">SEERA</span> <h3>SEERA</h3> <p>A journey that turns experience into a clear professional story and identity through which leaders define themselves and are recognized by others.</p> <button class="text-link" data-program="seera-story" type="button">Explore Seera Story® <span aria-hidden="true">←</span></button> </article> </div> </div> </section>
```

### 3. Interactive elements

- SAH Dialogues: `.js-open-contact` → `#contact-modal` (`data-contact-context`)
- Newsletter: `#newsletter-form` + `#newsletter-email` + `#newsletter-status` (`role="status"`)
- SEERA card: `.text-link` button (`data-program="seera-story"`) → `#program-modal`

### 4. Important CSS classes to recreate

- `.initiatives`
- `.initiatives-grid`
- `.initiative-card`
- `.initiative-owner`
- `.initiative-stats`
- `.newsletter-form`
- `.newsletter-status`
- `.text-link`
- `.js-open-contact`

---

## `about`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `about` |
| `class` | `about section` |
| `aria-labelledby` | `about-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="about-title" class="about section" id="about"> <div class="container"> <div class="about-grid"> <div aria-hidden="true" class="about-media reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"><span dir="ltr">PEOPLE FIRST<br>BUSINESS FOLLOWS</span></div> <div class="section-heading reveal is-visible" data-delay="100" data-observed="true" style="--reveal-delay: 100ms;"> <p class="eyebrow">SAH Group</p> <h2 id="about-title">Multiple Specializations<br>One Pathway<br>Lasting Impact</h2> <p class="lead">SAH Group brings together multiple specializations while maintaining one client journey—from understanding the need to creating lasting impact.</p> <div class="vision-mission"> <article><span>Our Vision</span><p>To be the Kingdom’s leading ecosystem for leadership development and sustainable impact.</p></article> <article><span>Our Mission</span><p>We empower leaders and organizations to transform awareness into purposeful action, decisions into measurable growth, and growth into sustainable impact through one integrated ecosystem.</p></article> </div> </div> </div> <div class="principles reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <article><b>People First</b><p>We believe the quality of every outcome begins with the quality of the people behind it.</p></article> <article><b>Clarity Before Decisions</b><p>We build decisions on clarity—not assumptions.</p></article> <article><b>Leadership Before Expansion</b><p>Organizations grow only as far as their leaders grow.</p></article> <article><b>Impact Before Activity</b><p>We measure value by lasting change—not activity alone.</p></article> <article><b>Integration Before Execution</b><p>We bring expertise and entities around one need to provide an integrated solution—not fragmented services.</p></article> </div><div class="founders-section reveal is-visible" data-observed="true"><div class="section-heading centered"><p class="eyebrow">Founding Leadership</p><h3>Founders</h3><p class="lead">Leadership that brings together vision, rigorous diagnosis, and disciplined execution to build lasting impact.</p></div><div class="founders-grid"><article class="founder-card"><div class="founder-photo"><img alt="Dr. Huda Haqawi" loading="lazy" src="[IMG]"></div><div class="founder-copy"><h4>Dr. Huda Haqawi</h4><strong>Founder &amp; Chief Executive Officer</strong><p>An entrepreneur and innovation strategist with more than 14 years of experience in leadership, business development, and organizational transformation.</p></div></article><article class="founder-card"><div class="founder-photo"><img alt="Ghada Al-Qarni" loading="lazy" src="[IMG]"></div><div class="founder-copy"><h4>Ghada Al-Qarni</h4><strong>Co-Founder &amp; Chief Operating Officer</strong><p>Leads operational excellence and business execution, with experience in preparing, managing, and delivering more than 100 strategic projects and initiatives.</p></div></article></div></div> </div> </section>
```

### 3. Interactive elements

- Static `.about-grid`, `.vision-mission`, `.principles`, `.founders-grid` / `.founder-card`

### 4. Important CSS classes to recreate

- `.about`
- `.about-grid`
- `.about-media`
- `.vision-mission`
- `.principles`
- `.founders-section`
- `.founders-grid`
- `.founder-card`
- `.founder-photo`
- `.founder-copy`

---

## `community`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `community` |
| `class` | `community section section-tinted` |
| `aria-labelledby` | `community-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="community-title" class="community section section-tinted" id="community"> <div class="container"> <div class="section-heading centered reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow">SAH Group Communities</p> <h2 id="community-title">Communities that Grow through Expertise and Participation</h2> <p class="lead">Join the community that fits you.</p> </div> <div class="community-grid"> <article class="community-card reveal is-visible" data-observed="true" style="--community-accent: var(--impact); --reveal-delay: 0ms;"> <div aria-hidden="true" class="community-icon community-icon-empathy"><span></span><span></span><span></span></div> <div class="community-copy"> <span class="community-label">SAH IMPACT</span> <h3>Empathy KSA</h3> <p>A national community creating space for listening and empathy in leadership, work, and the human experience.</p> <div class="community-features"><span>Meaningful Dialogues</span><span>Applied Knowledge</span><span>Professional Connection</span></div> </div> <a class="button button-dark community-whatsapp" data-whatsapp-message="I would like to join the Empathy KSA community" href="https://api.whatsapp.com/send?text=I%20would%20like%20to%20join%20the%20Empathy%20KSA%20community" rel="noopener noreferrer" target="_blank">Request to Join <span aria-hidden="true">↗</span></a> </article> <article class="community-card reveal is-visible" data-delay="100" data-observed="true" style="--community-accent: var(--lego); --reveal-delay: 100ms;"> <div aria-hidden="true" class="community-icon community-icon-lego"><span></span><span></span><span></span></div> <div class="community-copy"> <span class="community-label">LEGO BY SAH COMMUNITY</span> <h3>LEGO Community</h3> <p>A professional community for leaders, experts, and practitioners to build clarity of thought and turn challenges into better dialogue and decisions.</p> <div class="community-features"><span>Interactive Sessions</span><span>Real Challenges</span><span>Tools &amp; Experiences</span></div> </div> <a class="button button-dark community-whatsapp" data-whatsapp-message="I would like to request membership in the LEGO by SAH Community" href="https://api.whatsapp.com/send?text=I%20would%20like%20to%20request%20membership%20in%20the%20LEGO%20by%20SAH%20Community" rel="noopener noreferrer" target="_blank">Request to Join <span aria-hidden="true">↗</span></a> </article> </div> </div> </section>
```

### 3. Interactive elements

- WhatsApp join links: `.community-whatsapp` (`data-whatsapp-message`, external `api.whatsapp.com`)

### 4. Important CSS classes to recreate

- `.community`
- `.section-tinted`
- `.community-grid`
- `.community-card`
- `.community-icon`
- `.community-icon-empathy`
- `.community-icon-lego`
- `.community-copy`
- `.community-label`
- `.community-features`
- `.community-whatsapp`
- `.button-dark`

---

## `faq`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `faq` |
| `class` | `faq section` |
| `aria-labelledby` | `faq-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="faq-title" class="faq section" id="faq"> <div class="container faq-layout"> <div class="section-heading reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow">Questions Before You Begin</p> <h2 id="faq-title">What You Need to Know Before You Begin</h2> <p class="lead">Direct answers that explain how we work and help you get started.</p> </div> <div class="accordion reveal is-visible" data-delay="100" data-observed="true" style="--reveal-delay: 100ms;"> <details open=""><summary>Do I need to know the right entity or service before contacting you?</summary><p>No. Start with the challenge or outcome you want, and SAH Group will diagnose the need and identify the lead entity and supporting expertise.</p></details> <details><summary>Do you work with individuals or only organizations?</summary><p>We work with individuals, leaders, teams, and organizations. The entry point and deliverables differ, while the methodology remains consistent from understanding and design through building, enablement, and measurement.</p></details> <details><summary>Is the solution an off-the-shelf program or customized?</summary><p>We have core programs and methodologies, and we customize the intervention level, composition, duration, and metrics to the client’s context and stage.</p></details> <details><summary>What does the client receive after the discovery session?</summary><p>You receive an initial recommendation clarifying the problem, starting point, lead entity, intervention model, expected deliverables, and next step.</p></details> <details><summary>Do you stop at planning, or do you support execution?</summary><p>The engagement may begin with diagnosis or advisory and extend into a transformation project, execution support, knowledge transfer, or impact measurement as needed.</p></details> </div> </div> </section>
```

### 3. Interactive elements

- Native accordion: `.accordion` > 5× `<details>` / `<summary>` (first `open` in prototype)

### 4. Important CSS classes to recreate

- `.faq`
- `.faq-layout`
- `.accordion`
- `.section-heading`
- `.reveal`

---

## `contact`

### 1. Outer section tag

| Attribute | Value |
|-----------|-------|
| `id` | `contact` |
| `class` | `contact section section-dark` |
| `aria-labelledby` | `contact-title` |

### 2. Key child structure (classes only, compact)

```html
<section aria-labelledby="contact-title" class="contact section section-dark" id="contact"> <div class="container contact-grid"> <div class="section-heading reveal is-visible" data-observed="true" style="--reveal-delay: 0ms;"> <p class="eyebrow eyebrow-light">Start Now</p> <h2 id="contact-title">Define What You Want to Change<br>and We Will Build the Starting Point with You</h2> <p class="lead">Share the context in a few minutes, and we will contact you to define the discovery session and first step.</p> <div class="contact-details"> <a href="mailto:info@sah.com.sa">info@sah.com.sa</a> <span>Riyadh, Kingdom of Saudi Arabia</span> </div> </div> <form class="contact-form reveal is-visible" data-delay="120" data-observed="true" id="contact-form" novalidate="" style="--reveal-delay: 120ms;"> <div aria-label="Client type" class="form-segment" role="radiogroup"> <label><input checked="" name="clientType" type="radio" value="Individual"><span>I am an Individual</span></label> <label><input name="clientType" type="radio" value="Organization"><span>We are an Organization</span></label> </div> <div class="form-grid"> <label>Full Name *<input autocomplete="name" name="name" required="" type="text"></label> <label>Email Address *<input autocomplete="email" name="email" required="" type="email"></label> <label>Phone Number<input autocomplete="tel" name="phone" type="tel"></label> <label>Organization / Title<input autocomplete="organization" name="organization" type="text"></label> </div> <label>What do you want to change? *<textarea name="challenge" placeholder="Describe the challenge or outcome you are looking for…" required="" rows="4"></textarea></label> <input id="contact-context" name="context" type="hidden" value="General Discovery Session"> <div class="form-footer"> <p>Submitting will open your email with a prepared message to the SAH team.</p> <button class="button button-gold" type="submit">Submit Discovery Request</button> </div> <p class="form-status" id="contact-status" role="status"></p> </form> </div> </section>
```

### 3. Interactive elements

- Form `#contact-form`: client type `radiogroup`, fields, hidden `#contact-context`, `#contact-status`
- Submit opens mailto flow (prototype JS) — not a server POST
- Triggered from site-wide `.js-open-contact` with context prefilled

### 4. Important CSS classes to recreate

- `.contact`
- `.section-dark`
- `.contact-grid`
- `.contact-details`
- `.contact-form`
- `.form-segment`
- `.form-grid`
- `.form-footer`
- `.form-status`
- `.button-gold`
- `.is-invalid`

---
