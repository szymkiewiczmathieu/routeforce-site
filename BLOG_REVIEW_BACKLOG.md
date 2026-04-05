# Blog Review Backlog — RouteForce

Goal: review **every blog article** for premium visual quality, public-truth consistency, and stronger decision-grade content.

## Review standard
Each article must be checked for:
- premium visual rendering
- hero quality and first-screen credibility
- pricing/funnel consistency
- product-truth consistency
- CTA quality and internal links
- FAQ / interaction quality where present
- weak or cheap-looking sections
- outdated versioning or stale references
- blog-cluster coherence with current RouteForce positioning

## Status labels
- `DONE` = reviewed and already brought to acceptable premium/coherent level
- `REVIEW NEXT` = priority review queue
- `REVIEW LATER` = lower priority after core money/comparison articles
- `FIX URGENT` = already identified as problematic and should be corrected fast

---

## Core comparison / money articles

- [x] `blog/salesforce-maps-alternative.html` — **DONE** — clean, no issues found
- [x] `blog/salesforce-maps-pricing-alternative.html` — **DONE** — CTA gradient fixed (was using CSS vars with poor contrast)
- [x] `blog/flat-pricing-vs-per-user-salesforce-field-tools.html` — **DONE** — removed "up to 20 users" cap, fixed CTA text, added excl. tax, added internal links
- [x] `blog/fixed-org-pricing-vs-per-user-field-sales-software.html` — **DONE** — rebuilt broken hero, added body dark styles, removed user-cap, fixed CTA to indigo, added internal links
- [x] `blog/what-to-compare-before-replacing-salesforce-maps.html` — **DONE** — fixed pricing user-cap text, fixed light-mode link box on dark page
- [x] `blog/routeforce-vs-salesforce-maps-en.html` — **DONE** — redirect page only, no content issues
- [x] `blog/salesforce-route-planning-pricing.html` — **DONE** — removed user-cap framing from pricing and comparison checklist

## Route planning / field workflow articles

- [x] `blog/field-route-planning-software.html` — **DONE** — fixed hero date visibility, fixed CTA button contrast
- [x] `blog/sales-route-planner.html` — **DONE** — fixed hero date visibility, fixed CTA button contrast
- [x] `blog/salesforce-route-planning-software.html` — **DONE** — fixed CTA button contrast
- [x] `blog/route-planning-in-salesforce.html` — **DONE** — fixed hero date visibility, fixed CTA button contrast
- [x] `blog/optimize-field-sales-routes-salesforce.html` — **DONE** — fixed hero date visibility
- [x] `blog/visit-planning-software-salesforce.html` — **DONE** — clean, no issues found
- [x] `blog/how-to-improve-field-visit-planning-inside-salesforce.html` — **DONE** — rebuilt broken hero, removed dead script.js, added pricing/install info, added internal links
- [x] `blog/why-route-planning-outside-salesforce-breaks-field-execution.html` — **DONE** — rebuilt broken hero, removed dead script.js, added missing footer, expanded pricing section, added internal links
- [x] `blog/from-route-planning-to-visit-reporting-salesforce-native-field-workflow.html` — **DONE** — full template rebuild (dark body, header, footer, analytics, hero, structured data), added internal links

## Product / platform narrative articles

- [x] `blog/routeforce-screen-flows-lwc.html` — **DONE** — standardized hero badge to solid indigo
- [x] `blog/routeforce-worldwide-routing-appexchange.html` — **DONE** — removed all V7.8 refs (11 occurrences), fixed internal-facing language, added Product nav link
- [x] `blog/salesforce-maps-alternative-2026.html` — **DONE** — redirect page only, no content issues

## French article(s)

- [x] `blog/optimiser-tournees-salesforce.html` — **DONE** — redirect page only, no content issues

---

## Known recurring things to eliminate during review
- stale version mentions (especially old V7.7 references if not intended)
- pricing visuals/text implying >20 users inside standard public price
- weak or cheap-looking table-of-contents cards
- FAQ sections without working accordion behavior
- CTA blocks that look appended instead of premium
- wording that sounds trial-first instead of free app → premium unlock
- overly broad claims about growth, unlimited scope, or fake plug-and-play
- sections that read informative but not decision-grade

---

## Rule for execution
For each article review pass:
1. visual check live
2. content consistency check
3. premium upgrade if needed
4. push with clear commit
5. move article status forward in this backlog

---
---

# SEO Content Backlog (data-driven)

Data sources: GSC analytics (2026-03-06 to 2026-04-02) | DataForSEO keyword volumes (US, April 2026) | SERP analysis.

## Keyword volume reality (DataForSEO, US market)

| Keyword | Monthly Vol | CPC $ | Competition | Our GSC pos |
|---------|-----------|-------|-------------|-------------|
| route planner app | 1,600 | $6.87 | 49 | - |
| route optimization software | 1,300 | $47.52 | 23 | - |
| route planning software | 1,000 | $31.61 | 21 | - |
| salesforce maps | 1,000 | $12.71 | 33 | - |
| territory management salesforce | 390 | $6.37 | 14 | - |
| sales route planning | 320 | $21.40 | 49 | - |
| sales route planner | 320 | $21.40 | 49 | - |
| sales rep route planner | 320 | $21.40 | 49 | - |
| sales territory mapping | 320 | $9.47 | 34 | - |
| sales mapping software | 210 | $45.22 | 33 | - |
| field sales management | 170 | $0.06 | 8 | - |
| salesforce maps pricing | 140 | $12.41 | 20 | 35.5 |
| field sales software | 110 | $41.98 | 31 | - |
| field sales app | 90 | $20.26 | 21 | - |
| salesforce mapping tool | 70 | $35.75 | 69 | - |
| badger maps pricing | 40 | $10.76 | 32 | - |
| salesforce maps alternative | 30 | - | 9 | 47.7 |
| route planner for salesforce | 30 | - | - | 40.9 |
| sales route optimization | 30 | $51.62 | 52 | 76 |
| field service route optimization | 30 | - | 22 | 93.6 |
| salesforce territory mapping | 30 | $8.92 | 23 | - |
| badger maps alternative | 20 | $23.90 | 82 | - |
| salesforce maps cost | 20 | $14.61 | 38 | 31 |
| salesforce route optimization | 10 | $29.30 | 38 | 26 |
| salesforce route planning | 10 | $16.79 | 75 | 44 |

Key insight: the high-volume keywords are GENERIC ("route planner app" 1,600, "route optimization software" 1,300). Salesforce-specific keywords are low volume (10-30). The strategy should target both: generic pages to capture wide funnel, Salesforce-specific for high intent.

## GSC baseline (28 days)
- 362 impressions, 17 clicks, 4.7% CTR
- 0 clicks on non-branded queries (only "routeforce" / "route force" get clicks)
- Top query "route planner for salesforce" = 109 impressions but position 40.9

## Priority 1: High-volume generic keywords (biggest traffic potential)

These are high-volume keywords where RouteForce has NO presence yet. Winning even page 2 on these would 10x current traffic.

### 1.1 DONE: "Sales route planner: the complete comparison for field teams"
- [x] Target: "sales route planner" (320/mo), "sales rep route planner" (320/mo), "sales route planning" (320/mo)
- [x] Combined volume: ~960/mo across variants. This is the biggest opportunity.
- [x] Rewritten blog/sales-route-planner.html from ~700 to ~2,800 words with 5-tool comparison table
- [x] Competition index: 49 (medium)

### 1.2 DONE: "Salesforce Maps pricing: what it actually costs for field teams (2026)"
- [x] Target: "salesforce maps pricing" (140/mo), "salesforce maps cost" (20/mo)
- [x] Combined: ~160/mo. High buyer intent, $12+ CPC.
- [x] New article blog/salesforce-maps-pricing-breakdown.html, ~1,800 words with TCO tables
- [x] Competition index: 20 (LOW). Quick win.

### 1.3 DONE: "Route optimization software: the buyer's guide for field teams"
- [x] Target: "route optimization software" (1,300/mo, $47.52 CPC, comp 23)
- [x] New article blog/route-optimization-software.html, ~2,500 words
- [x] 8-tool comparison with real pricing, decision tree, ROI benchmarks

### 1.4 DONE: "Sales territory mapping: how to visualize and manage sales territories"
- [x] Target: "sales territory mapping" (320/mo), "territory management salesforce" (390/mo), "salesforce territory mapping" (30/mo)
- [x] Combined: ~740/mo. New article blog/sales-territory-mapping.html, ~2,000 words
- [x] 5-tool comparison table, practical territory planning steps, honest RouteForce positioning

## Priority 2: Salesforce-specific high-intent keywords

### 2.1 DONE: salesforce-route-planning.html strengthened
- [x] Target: "route planner for salesforce" (30/mo vol, but 109 GSC impressions), "salesforce route planning" (10/mo), "salesforce route optimization" (10/mo)
- [x] Added comparison table (RouteForce vs SF Maps vs Badger Maps vs SPOTIO), decision framework, internal links
- [x] ~800 words added

### 2.2 DONE: "Salesforce Maps alternatives compared: 6 tools for field teams in 2026"
- [x] Target: "salesforce maps alternative" (30/mo, comp 9)
- [x] New article blog/salesforce-maps-alternatives-compared.html, ~3,000 words
- [x] Genuine 7-tool comparison (SF Maps + 6 alternatives) with pricing table and decision framework

### 2.3 DONE: "RouteForce vs Badger Maps: which route planner for Salesforce teams?"
- [x] Target: "badger maps alternative" (20/mo, $23.90 CPC), "badger maps pricing" (40/mo, comp 32)
- [x] New article blog/routeforce-vs-badger-maps.html, ~1,500 words with pricing tables and honest comparison
- [x] Badger pricing confirmed: $58/user Business, $95/user Enterprise + add-ons

### 2.4 DONE: field-sales-route-optimization.html strengthened
- [x] Target: "sales route optimization" (30/mo, $51.62 CPC!), "field service route optimization" (30/mo)
- [x] Added field service section, ROI section, 2 new FAQs, internal links. ~600 words added.

## Priority 3: Funnel completion (decision + activation)

### 3.1 DONE: "How to build the business case for sales route optimization"
- [x] Target: "field sales software" (110/mo, $41.98 CPC), "field sales management" (170/mo)
- [x] New article blog/business-case-sales-route-optimization.html, ~1,500 words
- [x] ROI calculator (7:1 ratio, payback under 6 weeks), objection handling table, CFO tips

### 3.2 DONE: "How to set up route planning in Salesforce: install to first route"
- [x] Activation content. blog/how-to-set-up-route-planning-salesforce.html, ~1,000 words
- [x] 5-step technical guide with links to docs

### 3.3 DONE: "Field sales app: what mobile field teams need from their tools"
- [x] Target: "field sales app" (90/mo, $20.26 CPC, comp 21)
- [x] New article blog/field-sales-app.html, ~1,200 words with 6-tool comparison table

## Priority 4: Content consolidation (fix cannibalization)

### 4.1 MERGE: Pricing articles (4 articles, heavy overlap)
- [ ] Keep: flat-pricing-vs-per-user-salesforce-field-tools.html (most detailed)
- [ ] Merge unique content from: fixed-org-pricing-vs-per-user-field-sales-software.html, salesforce-maps-pricing-alternative.html, salesforce-route-planning-pricing.html
- [ ] 301 redirect the 3 others to the canonical
- [ ] Risk: temporary ranking dip, mitigated by quality improvement

### 4.2 MERGE: Salesforce Maps alternative articles
- [ ] salesforce-maps-alternative.html + what-to-compare-before-replacing-salesforce-maps.html
- [ ] Replace both with the new listicle from 2.2

## Priority 5: Off-site / authority building

### 5.1 Get listed in competitor listicles
- [ ] RouteForce appears in ZERO third-party listicles (SPOTIO, Leadbeam, G2, Capterra, TrustRadius, Software Advice, GetApp)
- [ ] Create profiles on G2, Capterra, TrustRadius, GetApp
- [ ] Submit for inclusion in Software Advice
- [ ] This is the single highest-leverage SEO action after on-site content

### 5.2 AppExchange reviews
- [ ] Push free tier users to leave reviews
- [ ] 10-15 reviews at 4.5+ stars enables aggregateRating in schema
- [ ] Then add rating to homepage JSON-LD

### 5.3 Salesforce community presence
- [ ] Post on Salesforce Ben, SF Stack Exchange, Trailblazer Community
- [ ] Guest posts on SF-adjacent blogs
- [ ] Each = backlink + brand signal

## Execution timeline (data-prioritized)

| Week | Action | Target keyword volume | Expected impact |
|------|--------|----------------------|-----------------|
| 1 | 1.2 Salesforce Maps pricing article | 160/mo, comp 20 | Quick win, already pos 35 |
| 1 | 1.1 Rewrite sales-route-planner.html | 960/mo, comp 49 | Biggest volume opportunity |
| 2 | 2.1 Rewrite salesforce-route-planning.html | 50/mo but 109 GSC imp | Improve top GSC query |
| 2 | 2.3 RouteForce vs Badger Maps | 60/mo, $24 CPC | High commercial value |
| 3 | 1.4 Sales territory mapping guide | 740/mo, comp 14-34 | Large volume, low competition |
| 3 | 2.2 Salesforce Maps alternatives listicle | 30/mo, comp 9 | Very low competition |
| 4 | 1.3 Route optimization software guide | 1,300/mo, comp 23 | Massive volume top-of-funnel |
| 4 | 4.1 Consolidate pricing articles | - | Fix cannibalization |
| 5 | 3.1 Business case / ROI article | 280/mo combined | Decision-stage |
| 5 | 3.3 Field sales app guide | 90/mo, comp 21 | Mobile angle, low comp |
| 6 | 2.4 Strengthen field-sales-route-optimization | 60/mo, $51 CPC | Highest CPC keyword |
| 6 | 3.2 Setup guide blog post | Low vol | Activation |
| Ongoing | 5.1-5.3 Off-site presence | - | Authority + backlinks |
