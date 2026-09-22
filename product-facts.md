# Tourvia product facts

Last verified: 21 July 2026

Tourvia, formerly RouteForce, is a route planning and field execution application operated by SKZ Consulting. It is delivered as a managed package for Salesforce orgs.

## Commercial model

- Trial: 30 days, installed from the public AppExchange listing with Get It Now
- Trial scope: every product feature is included during the trial
- Subscription: €30 excluding tax per licensed user per month
- Billing: annual, equivalent to €360 excluding tax per user per year
- Team size: the same €30 excluding tax per-user price applies at every team size
- Free plan: none
- Installation and configuration: handled by the customer’s Salesforce admin using the documentation
- Distribution: public AppExchange listing; the customer’s Salesforce admin installs with Get It Now

The current pricing page is the source for commercial terms: https://gettourvia.com/pricing.html

## Product and package

- Current documented version: TourviaApp 7.36.0
- Current release focus: planning invalidation when options change, protection against stale asynchronous recalculation, Agentforce recency filtering before result limits, keyboard focus for route-step actions, and resilient marker rendering when an optional type field is empty or invalid
- Trial access: 30-day trial installed from the public AppExchange listing (Get It Now)
- Security Review: passed on 22 May 2026 for the reviewed package lineage
- Salesforce does not endorse or recommend Tourvia
- Main surfaces: Salesforce record pages, app pages, tabs, utility bar, Campaign pages and Salesforce Mobile
- Supported mapped records: Accounts, Leads, Opportunities and Campaign Members
- Bulk selection: records can be added to a route one by one or by drawing an area on the map that takes every record inside it in a single action
- Planning scope: one route covers one day for one user. Tourvia does not plan multiple reps or multiple days in a single pass
- Included analytics: 2 dashboards and 18 Salesforce reports

## Architecture and data flow

Salesforce remains the CRM system of record. Tourvia reads and writes Salesforce records through the managed package. Route calculations send the minimum required routing inputs, including geocoordinates and time constraints, to Tourvia’s routing infrastructure hosted in France on OVHcloud. The routing service is operated by Tourvia.

The check-in workflow uses a configurable GPS-assisted proximity check. Its result depends on device accuracy, geocoding quality, and the configured radius; it does not prove identity or physical presence.

International routing is available where the required road data exists. Customers should validate the relevant territories during the 30-day trial.

Technical documentation: https://gettourvia.com/docs/
Privacy policy: https://gettourvia.com/docs/privacy.html
DPA: https://gettourvia.com/docs/dpa.html

## Brand and operator

- Product name: Tourvia
- Former product name: RouteForce
- Operator: SKZ Consulting
- Salesforce ISV Partner: yes
- Legal form: société par actions simplifiée unipersonnelle (SASU)
- Registered office: 14 rue Bausset, 75015 Paris, France
- RCS Paris / SIREN: 102 154 879
- SIRET: 102 154 879 00013
- VAT: FR36102154879
- Contact: contact@gettourvia.com

Legal notice: https://gettourvia.com/docs/mentions-legales.html

## Primary references

- Homepage: https://gettourvia.com/
- Pricing: https://gettourvia.com/pricing.html
- Route planning: https://gettourvia.com/salesforce-route-planning.html
- Visit planning: https://gettourvia.com/visit-planning-salesforce.html
- Native integration: https://gettourvia.com/native-integration-salesforce.html
- Use cases: https://gettourvia.com/use-cases.html
- Security Review and AppExchange listing: https://gettourvia.com/blog/tourvia-private-appexchange-security-review.html
- RouteForce to Tourvia name change: https://gettourvia.com/blog/routeforce-becomes-tourvia.html
