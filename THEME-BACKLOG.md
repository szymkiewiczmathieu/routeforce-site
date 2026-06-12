# RouteForce theme backlog

Référence visuelle: `pricing.html`

## Légende
- **OK**: cohérent avec la nouvelle direction, pas prioritaire
- **KO**: en retard visuellement, à reprendre pendant le tour

## Root pages
- **OK** `index.html`
- **OK** `pricing.html`
- **OK** `salesforce-route-planning.html`
- **OK** `visit-planning-salesforce.html`
- **OK** `native-integration-salesforce.html`
- **OK** `field-sales-route-optimization.html`
- **OK** `flat-rate-route-optimization.html`
- **OK** `use-cases.html`
- **OK** `consulting.html`

## Blog
- **OK** `blog/index.html`
- **OK** `blog/business-case-sales-route-optimization.html`
- **OK** `blog/field-route-planning-software.html`
- **OK** `blog/field-sales-app.html`
- **OK** `blog/fixed-org-pricing-vs-per-user-field-sales-software.html`
- **OK** `blog/flat-pricing-vs-per-user-salesforce-field-tools.html`
- **OK** `blog/from-route-planning-to-visit-reporting-salesforce-native-field-workflow.html`
- **OK** `blog/how-to-improve-field-visit-planning-inside-salesforce.html`
- **OK** `blog/how-to-set-up-route-planning-salesforce.html`
- **OK** `blog/optimize-field-sales-routes-salesforce.html`
- **OK** `blog/route-optimization-software.html`
- **OK** `blog/route-planning-in-salesforce.html`
- **OK** `blog/routeforce-screen-flows-lwc.html`
- **OK** `blog/routeforce-vs-badger-maps.html`
- **OK** `blog/routeforce-worldwide-routing-appexchange.html`
- **OK** `blog/sales-route-planner.html`
- **OK** `blog/sales-territory-mapping.html`
- **OK** `blog/salesforce-maps-alternative.html`
- **OK** `blog/salesforce-maps-alternatives-compared.html`
- **OK** `blog/salesforce-maps-pricing-alternative.html`
- **OK** `blog/salesforce-maps-pricing-breakdown.html`
- **OK** `blog/salesforce-route-planning-pricing.html`
- **OK** `blog/salesforce-route-planning-software.html`
- **OK** `blog/visit-planning-software-salesforce.html`
- **OK** `blog/what-to-compare-before-replacing-salesforce-maps.html`
- **OK** `blog/why-route-planning-outside-salesforce-breaks-field-execution.html`

## Docs
- **OK** `docs/index.html`
- **OK** `docs/setup-guide.html`
- **OK** `docs/user-guide.html`
- **OK** `docs/configuration-guide.html`
- **OK** `docs/privacy.html`
- **OK** `docs/terms.html`
- **OK** `docs/dpa.html`
- **OK** `docs/cgv.html`
- **OK** `docs/mentions-legales.html`

## Utility
- **OK** `404.html`

## Tour order

### Batch 1, highest priority KO
1. `use-cases.html` ✅
2. `consulting.html` ✅
3. `native-integration-salesforce.html` ✅
4. `field-sales-route-optimization.html` ✅
5. `flat-rate-route-optimization.html` ✅

### Batch 2, hubs
6. `docs/index.html` ✅

### Batch 3, highest-intent blog pages
7. `blog/route-optimization-software.html` ✅
8. `blog/sales-route-planner.html` ✅
9. `blog/salesforce-maps-pricing-breakdown.html` ✅
10. `blog/what-to-compare-before-replacing-salesforce-maps.html` ✅

## Rules for the tour
- garder le header premium unifié
- garder une logique desktop claire, pas de faux mobile étiré
- garder une zone de décision visible above the fold
- garder des cartes dark cohérentes
- harmoniser les CTA vers la même famille de messages
- éviter les surfaces claires parasites si elles cassent le thème

## Look & feel follow-up queue (2026-04-12 live audit)

### P1, highest-impact visual fixes
1. **Long SEO money pages on mobile**
   - `salesforce-route-planning.html`
   - `field-sales-route-optimization.html`
   - `visit-planning-salesforce.html`
   - Problem: too many same-weight dark blocks, long uninterrupted reading runs, comparison/table sections that feel heavy on mobile.
   - Goal: stronger rhythm, shorter section intros, clearer section breaks, lighter mobile spacing, and more visible CTA progression.
2. **Long comparison articles**
   - `blog/salesforce-maps-alternatives-compared.html`
   - `blog/route-optimization-software.html`
   - `blog/salesforce-maps-alternative.html`
   - Problem: premium theme holds, but editorial feel drops into dense SEO-document mode.
   - Goal: make these pages feel curated and premium, not just exhaustive.
3. **Bottom-of-page conversion fatigue**
   - affects most long templates above
   - Problem: late-page CTA zones arrive after too much visual repetition.
   - Goal: sharper end-state CTA, stronger proof/benefit summary before the final ask.

### P2, worthwhile next polish
4. **Blog/article template variety**
   - `blog/index.html` is good, but article templates need more visual contrast between summary cards, prose sections, tables, FAQs, and CTA bands.
5. **Consulting page conversion polish**
   - `consulting.html`
   - Problem: structurally solid, but the lower conversion area can feel flatter than pricing/home.
6. **Docs hub premium continuity on mobile**
   - `docs/index.html`
   - Problem: clean and readable, but still more functional than premium in the mobile flow.

### P3, optional after the main pass
7. Tighten card density and section spacing on secondary blog pages not yet rechecked live in this audit.
8. Add more visual “rest moments” on very long pages: summary strips, quote/proof modules, or cleaner checkpoint blocks.

## Cross-template design rules for the next pass
- break long pages into clearer chapters with more vertical rhythm
- stop stacking too many border-only dark cards with identical visual weight
- shorten intros before bullets/tables when intent is transactional
- make mobile tables/comparison blocks easier to scan or chunk
- keep CTA energy rising through the page instead of peaking only near the top
- preserve `pricing.html` as the gold reference for decisiveness and visual authority
