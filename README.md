# RouteForce Site

Public marketing website for **RouteForce** — a native Salesforce route planning and field execution product.

## Project status
Active production website.

Current scope includes:
- main marketing homepage
- SEO / GEO landing pages
- comparison pages
- public documentation hub
- FR / EN / ES localized pages
- trial funnel and contact flow

## Stack
- Static site (HTML / CSS / JavaScript)
- GitHub Pages for public hosting
- Plausible Analytics (self-hosted)
- No frontend framework

## Local setup
Clone the repository and open the site locally with any static file server.

Example:
```bash
python3 -m http.server 8000
```

Then open:
```text
http://localhost:8000
```

## Deployment flow
Deployment is Git-based:
1. update content / pages / assets
2. commit to `main`
3. push to GitHub
4. GitHub Pages publishes the site

For documentation pages:
- source of truth is maintained in the `routeforce-docs` repository
- public HTML guides are rebuilt from the Markdown sources before being published here

## Owner / contact
Owner: RouteForce
Contact: contact@routeforce.app
Website: https://routeforce.app

## Notes
- Pricing and product claims must stay aligned with the live RouteForce product
- Public comparisons should use dated public sources and cautious wording
- Keep FR / EN / ES business logic aligned
