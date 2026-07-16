# Tourvia product facts

Last verified: 11 July 2026

Tourvia, formerly RouteForce, is a Salesforce-native route planning and field execution application operated by SKZ Consulting. It is delivered as a managed package for Salesforce orgs.

## Commercial model

- Trial: 30 days, available on request for qualified Salesforce orgs
- Trial scope: every product feature is included during the trial
- Subscription: €30 excluding tax per licensed user per month
- Billing: annual, equivalent to €360 excluding tax per user per year
- Enterprise scope: larger or multi-entity deployments can request a quote
- Free plan: none
- Installation and configuration: handled by the customer’s Salesforce admin using the documentation
- Distribution: private AppExchange access coordinated with the customer’s Salesforce admin

The current pricing page is the source for commercial terms: https://routeforce.app/pricing.html

## Product and package

- Current documented version: TourviaApp 7.33.0
- Security Review: passed on 22 May 2026 for the reviewed package lineage
- Salesforce does not endorse or recommend Tourvia
- Main surfaces: Salesforce record pages, app pages, tabs, utility bar, Campaign pages and Salesforce Mobile
- Supported mapped records: Accounts, Leads, Opportunities and Campaign Members
- Included analytics: 2 dashboards and 18 Salesforce reports

## Architecture and data flow

Salesforce remains the CRM system of record. Tourvia reads and writes Salesforce records through the managed package. Route calculations send the minimum required routing inputs, including geocoordinates and time constraints, to Tourvia’s routing infrastructure hosted in France on OVHcloud. The routing service is operated by Tourvia.

Technical documentation: https://routeforce.app/docs/
Privacy policy: https://routeforce.app/docs/privacy.html
DPA: https://routeforce.app/docs/dpa.html

## Brand and operator

- Product name: Tourvia
- Former product name: RouteForce
- Operator: SKZ Consulting
- Legal form: société par actions simplifiée unipersonnelle (SASU)
- Registered office: 14 rue Bausset, 75015 Paris, France
- RCS Paris / SIREN: 102 154 879
- SIRET: 102 154 879 00013
- VAT: FR36102154879
- Contact: contact@routeforce.app

Legal notice: https://routeforce.app/docs/mentions-legales.html

## Primary references

- Homepage: https://routeforce.app/
- Pricing: https://routeforce.app/pricing.html
- Route planning: https://routeforce.app/salesforce-route-planning.html
- Visit planning: https://routeforce.app/visit-planning-salesforce.html
- Native integration: https://routeforce.app/native-integration-salesforce.html
- Use cases: https://routeforce.app/use-cases.html
- Security Review and private access: https://routeforce.app/blog/tourvia-private-appexchange-security-review.html
- RouteForce to Tourvia name change: https://routeforce.app/blog/routeforce-becomes-tourvia.html
