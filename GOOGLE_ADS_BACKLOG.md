# Google Ads Backlog — RouteForce

Working goal: get RouteForce to a clean, measurable Google Ads V1 launch without breaking pricing truth, funnel truth, or product truth.

## Status summary
- Product/message: almost ready
- Landing pages: identified
- Tracking: front-side instrumentation added
- Version baseline: aligned to V7.8.0
- Remaining work: confirm analytics reception, freeze campaign inputs, then launch a small V1 test

---

## Guardrails (do not break)
- Funnel truth: **Install RouteForce from AppExchange → start with the free app → unlock premium features**
- Do **not** drift back to a fake trial-first narrative unless business confirms it explicitly
- Pricing truth: **€599 excl. tax / month, billed annually, for Salesforce orgs up to 20 users**
- Larger deployments: **quoted separately**
- Do **not** use public wording like:
  - "unlimited users"
  - "no per-seat fees ever"
  - "whether you have 5 reps or 50, the price stays the same"
  - fake universal "install and go" / plug-and-play claims
- Product angle to preserve:
  - more deployable
  - clearer to configure
  - more credible for real Salesforce orgs
  - admin-friendly
  - Salesforce-native

---

## P0 — Must verify now

### P0.1 Confirm analytics events in real analytics
**Goal:** confirm the events that work in-browser also appear in Plausible on the real domain.

- [ ] Verify `AppExchange Click` appears in Plausible
- [ ] Verify `Lead Form Submit` appears in Plausible
- [ ] Verify event props are readable enough to distinguish page intent:
  - `page_path`
  - `link_text`
  - `form`
- [ ] Confirm at least these live paths are measurable:
  - `/`
  - `/salesforce-route-planning.html`
  - `/blog/salesforce-maps-alternative.html`

Notes:
- Front-side browser verification already passed locally.
- Localhost is ignored by Plausible, which is expected.

### P0.2 Freeze landing pages for V1
- [x] Landing #1: `/salesforce-route-planning.html`
- [x] Landing #2: `/blog/salesforce-maps-alternative.html`
- [ ] Decide whether homepage `/` is only support/brand/retargeting or part of search launch

### P0.3 Freeze V1 campaign angles
- [x] Angle #1: **Salesforce-native route planning**
- [x] Angle #2: **Salesforce Maps alternative / pricing clarity**
- [ ] Reject extra angles for V1 unless keyword data clearly justifies them

### P0.4 Confirm primary and secondary conversions
- [x] Primary conversion: `AppExchange Click`
- [x] Secondary conversion: `Lead Form Submit`
- [ ] Decide whether any third micro-conversion is worth tracking in V1

---

## P1 — Keyword research and campaign inputs

### P1.1 Shortlist keywords to validate with data
Gather real data (DataForSEO or equivalent) for:

#### Route-planning cluster
- [ ] salesforce route planning
- [ ] salesforce route planner
- [ ] salesforce route optimization
- [ ] route planning in salesforce

#### Alternative / pricing cluster
- [ ] salesforce maps alternative
- [ ] alternative to salesforce maps
- [ ] salesforce maps pricing
- [ ] salesforce maps cost

#### Field workflow cluster
- [ ] field sales route planning
- [ ] field sales route optimization
- [ ] visit planning salesforce
- [ ] sales route planner

For each keyword, collect if possible:
- [ ] monthly volume
- [ ] CPC
- [ ] competition/difficulty
- [ ] country / language relevance
- [ ] likely intent
- [ ] SERP shape / commerciality

### P1.2 Map keyword → landing → angle → priority
Target output: one decision table per keyword.

Minimum fields:
- Keyword
- Intent
- Suggested landing
- Suggested angle
- Priority (`P1`, `P2`, `P3`)
- Keep / reject / later

Current default mapping:

| Keyword | Landing | Angle | Priority |
|---|---|---|---|
| salesforce route planning | `/salesforce-route-planning.html` | Salesforce-native route planning | P1 |
| salesforce route planner | `/salesforce-route-planning.html` | Salesforce-native route planning | P1 |
| salesforce maps alternative | `/blog/salesforce-maps-alternative.html` | Alternative / pricing clarity | P1 |
| salesforce route optimization | `/salesforce-route-planning.html` | Optimize routes inside Salesforce | P2 |
| route planning in salesforce | `/salesforce-route-planning.html` | Native workflow in Salesforce | P2 |
| salesforce maps pricing | `/blog/salesforce-maps-alternative.html` | Pricing clarity / alternative | P2 |
| field sales route planning | `/field-sales-route-optimization.html` | Field execution + route planning | P3 |
| field sales route optimization | `/field-sales-route-optimization.html` | Field execution + route optimization | P3 |
| visit planning salesforce | `/visit-planning-salesforce.html` | Visit planning inside Salesforce | P3 |
| sales route planner | TBD / likely reject for V1 | Too broad | P3-low |

---

## Final V1 campaign structure (frozen working draft)

### Campaign 1 — Salesforce Maps Pricing / Alternative

#### Ad Group 1 — Salesforce Maps Pricing
- **Keyword:** `salesforce maps pricing`
- **Landing:** `/blog/salesforce-maps-alternative.html`
- **Angle:** pricing clarity, native alternative, simpler buying story
- **Primary conversion:** `AppExchange Click`
- **Status:** ready for small test once launch checklist is complete

#### Ad Group 2 — Salesforce Maps Alternative
- **Keyword:** `salesforce maps alternative`
- **Landing:** `/blog/salesforce-maps-alternative.html`
- **Angle:** native alternative, route planning + field execution, better fit for real Salesforce orgs
- **Primary conversion:** `AppExchange Click`
- **Status:** ready for small test once launch checklist is complete

### Campaign 2 — Salesforce Route Planning

#### Ad Group 1 — Salesforce Route Planning
- **Keyword:** `salesforce route planning`
- **Landing:** `/salesforce-route-planning.html`
- **Angle:** native route planning inside Salesforce, create visits faster, keep CRM workflow intact
- **Primary conversion:** `AppExchange Click`
- **Status:** secondary priority after Maps cluster or parallel with small budget

#### Ad Group 2 — Salesforce Route Planner
- **Keyword:** `salesforce route planner`
- **Landing:** `/salesforce-route-planning.html`
- **Angle:** route planning for field teams, map + visits + execution, Salesforce-native deployment
- **Primary conversion:** `AppExchange Click`
- **Status:** secondary priority after Maps cluster or parallel with small budget

### Keywords rejected or delayed for V1
- `sales route planner` → too broad / too risky for Salesforce intent
- `salesforce route optimization` → expensive CPC for low volume
- `route planning in salesforce` → no usable data yet
- `field sales route optimization` → no usable data yet
- `visit planning salesforce` → no usable data yet

### Default negative keywords to prepare
- jobs
- career
- careers
- training
- certification
- support
- login
- tutorial
- definition
- google maps
- apple maps
- waze
- free route planner
- delivery route planner
- truck routing
- route planner app

## P2 — Ads asset production

### P2.1 Campaign structure V1

#### Campaign A — Salesforce Route Planning
- [x] Core theme defined
- [ ] Final keyword set frozen
- [ ] Match types chosen
- [ ] Negative keywords attached

#### Campaign B — Salesforce Maps Alternative
- [x] Core theme defined
- [ ] Final keyword set frozen
- [ ] Match types chosen
- [ ] Negative keywords attached

#### Campaign C — Field workflow / visit planning
- [ ] Do not launch unless keyword data justifies it

### P2.2 Final RSA assets
Prepare final production-ready assets with strict character discipline.

#### Campaign A assets
- [x] Draft headlines prepared
- [x] Draft descriptions prepared
- [ ] Final 8–10 headlines selected
- [ ] Final descriptions selected

#### Campaign B assets
- [x] Draft headlines prepared
- [x] Draft descriptions prepared
- [ ] Final 8–10 headlines selected
- [ ] Final descriptions selected

### P2.3 Extensions
- [x] Draft sitelinks prepared
- [x] Draft callouts prepared
- [ ] Final sitelinks approved
- [ ] Final callouts approved
- [ ] Confirm whether structured snippets are useful

Suggested sitelinks:
- Pricing
- Route Planning
- Use Cases
- Install On AppExchange

Suggested callouts:
- Salesforce-native
- Flat org pricing
- Up to 20 users
- AppExchange install
- Admin-friendly
- Field execution
- Mobile-first
- No per-seat fees in scope

---

## P3 — Negative keywords / exclusions

### Default exclusions to review
- [ ] jobs
- [ ] careers
- [ ] training
- [ ] certification
- [ ] support
- [ ] login
- [ ] docs-only intent if not commercial
- [ ] generic consumer map intent
- [ ] non-Salesforce route-planner intent

### Decision notes
- Keep exclusions tight at first
- Do not overfilter before seeing search terms
- But do protect budget from obvious junk traffic

---

## P4 — Landing page QA for paid traffic

### `/salesforce-route-planning.html`
- [ ] Hero still matches target keyword exactly enough
- [ ] CTA hierarchy feels clean
- [ ] Pricing wording remains aligned
- [ ] Proof product blocks remain credible
- [ ] No contradictory wording vs AppExchange

### `/blog/salesforce-maps-alternative.html`
- [ ] Comparative angle remains strong
- [ ] Pricing comparison is still coherent
- [ ] CTA to AppExchange is visible enough
- [ ] Does not overpromise beyond real product truth

### Homepage `/`
- [ ] Decide whether to use only for brand / retargeting
- [ ] If used for paid cold traffic later, re-check hero and proof blocks again

---

## P5 — Launch checklist

Launch a small V1 test only when all are true:

- [ ] Live analytics confirms `AppExchange Click`
- [ ] Live analytics confirms `Lead Form Submit`
- [ ] Landing #1 frozen
- [ ] Landing #2 frozen
- [ ] Keyword shortlist validated with real data
- [ ] Final ad assets selected
- [ ] Negative keywords added
- [ ] AppExchange copy aligns with site pricing truth
- [ ] No remaining public contradiction between:
  - ads
  - landing pages
  - homepage
  - pricing page
  - AppExchange

---

## Ready / Not Ready criteria

### NOT READY
Any of the following is still true:
- events not confirmed in live analytics
- unclear pricing wording remains in public surfaces
- V1 keywords not validated
- landing/message mismatch still obvious

### ALMOST READY
All of the following are true:
- front instrumentation works
- live versioning/copy aligned
- landings identified
- campaign angles identified
- only analytics confirmation + keyword validation remain

### READY FOR SMALL TEST
All of the following are true:
- live analytics confirmation done
- keyword shortlist validated with real data
- final assets approved
- negative keywords prepared
- no major public copy contradictions remain

---

## Owner notes
- Site/copy/tracking validation: assistant + Mathieu
- Keyword data pull: Mathieu or assistant using available data source
- Final go/no-go: Mathieu

---

## Current assessment
Current status: **ALMOST READY**

Main blockers before a responsible Google Ads V1 test:
1. confirm live analytics events in Plausible
2. validate keyword shortlist with real data
3. freeze final campaign assets and exclusions
