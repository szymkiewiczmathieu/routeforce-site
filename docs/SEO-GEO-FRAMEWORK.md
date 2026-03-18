# RouteForce SEO / GEO Landing Framework

Last updated: 2026-03-18
Owner: routeforce-site

## Purpose
This file is the operating framework for RouteForce SEO / GEO landing pages.
Do not build new SEO pages from scratch in an ad hoc way.
Reuse this structure, the same conversion logic, and the same trust signals.

## Core principle
Each landing page must do 4 things at once:
1. rank on search intent
2. be easily citable by AI assistants
3. convert toward the primary trial funnel
4. remain perfectly aligned across FR / EN / ES

## Mandatory structure for every SEO landing

### 1. Hero
- intent-matching H1
- short subtitle with clear value proposition
- primary CTA to `#contact`
- secondary CTA may point to screenshots or pricing, but should not fragment the funnel

### 2. “4 clear answers” block
Mandatory block near the top of the page.
It must answer:
- What is it?
- Who is it for?
- How much does it cost?
- Where is data processed? OR What is the main benefit?

This block exists to improve:
- human comprehension
- featured-snippet style extraction
- AI citability
- conversion clarity

### 3. Main body
Use strong H2/H3 sections with clear intent.
Write self-contained passages that can be quoted without surrounding context.
Avoid generic SEO filler.

### 4. FAQ block
Must exist on every important SEO landing.
Questions should be direct, factual, and reusable.

### 5. Final CTA block
Primary CTA should point to the trial/contact section.
Default messaging:
- FR: `Essai gratuit 14 jours`
- EN: `Start your 14-day trial`
- ES: `Prueba gratuita 14 días`

## Structured data rules
At minimum, important SEO landings must include:
- `FAQPage`

Optionally add later when relevant:
- `SoftwareApplication`
- `BreadcrumbList`

## CTA rules
Default RouteForce rule now:
- primary CTA => `#contact`
- do not reintroduce demo-first logic on SEO landings unless explicitly decided
- avoid Calendly-first CTAs on SEO pages

## Trust signals to repeat consistently
Use these repeatedly, without inventing anything:
- native Salesforce software
- built for field teams / field sales teams
- €599/month / 599€ HT par mois for the whole Salesforce org
- no per-user pricing
- 14-day free trial
- CRM data stays in Salesforce
- routing-related processing on infrastructure hosted in France

## FR / EN / ES parity rules
For tri-language landing sets:
- same overall structure
- same number of major sections
- same “4 answers” logic
- same CTA logic
- same legal / trust direction
- same funnel destination

FR remains the master reference.
EN and ES must follow the FR business logic, not drift into a separate funnel.

## Legal / messaging constraints
Never publish:
- invented performance claims
- invented customer numbers
- infrastructure secrets
- server IPs, ports, versions, internal architecture details
- broken or placeholder legal links

Safe public messaging includes:
- hosted in France
- CRM data stays in Salesforce
- encrypted connection / secure infrastructure
- pricing and trial terms already validated on site

## Audit checklist before push
For each SEO landing batch, verify:
- CTA points to `#contact`
- no old “Book a demo” / “Réserver une démo” drift on SEO pages
- `FAQPage` schema exists
- “4 answers” block exists
- legal links are not broken
- FR / EN / ES parity is preserved where applicable
- no placeholder text
- no contradictory pricing

## Current standard already deployed on key pages
Deployed on:
- `planification-tournees-salesforce.html`
- `planification-visites-salesforce.html`
- `optimisation-tournees-commerciaux-terrain.html`
- `optimisation-tournees-prix-fixe.html`
- `en/salesforce-route-planning.html`
- `en/visit-planning-salesforce.html`
- `en/field-sales-route-optimization.html`
- `en/flat-rate-route-optimization.html`
- `es/planificacion-rutas-salesforce.html`
- `es/planificacion-visitas-salesforce.html`
- `es/optimizacion-rutas-comerciales-campo.html`
- `es/optimizacion-rutas-precio-fijo.html`

## Next usage
Any new SEO landing, comparison page, or GEO page should start from this framework, not from an empty page.
