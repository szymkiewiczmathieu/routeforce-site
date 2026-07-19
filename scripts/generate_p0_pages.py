#!/usr/bin/env python3
"""Generate 4 P0 SEO pages for gettourvia.com based on the blog template."""
import os
from pathlib import Path
from datetime import datetime

BASE = Path('/home/ubuntu/openclaw-vps/state/workspace-routeforce-site')
PAGES = {
    'salesforce-maps-mobile-retirement.html': {
        'title': 'Salesforce Maps Mobile App Retirement: What to Do Before August 31, 2026',
        'h1': 'Salesforce Maps mobile app is retiring. What field teams should do now.',
        'description': 'Salesforce is retiring the Maps mobile app on August 31, 2026. Here is what to do, which alternatives to evaluate, and how to migrate without disrupting your field team.',
        'kicker': 'News',
        'date': '2026-07-19',
        'read': '6 min read',
        'summary': 'Salesforce announced the retirement of the Salesforce Maps mobile app, effective August 31, 2026. For field sales teams relying on mobile route planning, this means a forced migration. We explain the timeline, what changes, and which alternatives keep your routes inside Salesforce.',
        'body': [
            ('h2', 'What exactly is retiring?'),
            ('p', 'On August 31, 2026, the Salesforce Maps mobile application will reach end-of-life. After that date, the mobile app will no longer receive updates, support, or critical fixes. The desktop Maps components inside Salesforce are not affected in the same way, but the mobile experience — the one field reps use every day to check routes, log visits, and update records on the road — is gone.'),
            ('p', 'Salesforce recommends moving to alternative solutions for mobile route planning and field execution. The window to plan, test, and migrate is short.'),
            ('h2', 'Why this matters for field sales teams'),
            ('p', 'Most Salesforce Maps users bought the product for two things: route planning and mobile execution. The mobile app retirement removes the second half of that value. Reps who relied on Maps to plan their day, navigate between accounts, and check in will lose that workflow unless the org migrates to another tool.'),
            ('p', 'The risk is not just technical. A forced migration in September means training, data cleanup, and reconfiguration while reps are trying to hit quota.'),
            ('h2', 'What to look for in a replacement'),
            ('p', 'A good replacement should cover four things that Salesforce Maps mobile did:'),
            ('ul', [
                'Route optimization built from Salesforce records',
                'Mobile app that works without a laptop',
                'Check-in and visit reporting tied to Events or Tasks',
                'Annual per-user pricing that does not scale unpredictably'
            ]),
            ('h2', 'Salesforce Maps alternatives that still have a mobile app'),
            ('p', 'The main alternatives fall into two groups: Salesforce-native managed packages and external route planning tools.'),
            ('p', 'Native options run inside Salesforce, keep the CRM as the system of record, and require less data synchronization. External tools may have stronger route optimization, but they force reps to switch apps and they create integration overhead.'),
            ('p', 'For teams that need both mobile and Salesforce-native, the short list is small. Tourvia is one of the few options delivered as a Salesforce managed package with its own mobile experience.'),
            ('h2', 'How to plan the migration before August 31'),
            ('p', 'A clean migration in six weeks is possible if you keep the scope tight:'),
            ('ol', [
                'Audit your current Maps usage: which users, which objects, which workflows.',
                'Identify the minimum viable route inputs: Accounts, Contacts, Leads, Opportunities, or Campaign Members.',
                'Test one alternative in a sandbox with a pilot group of three to five reps.',
                'Compare the annual cost of each option against your current Salesforce Maps contract.',
                'Roll out in phases: power users first, then the rest of the team.',
                'Train reps on the new mobile app before the old one stops working.'
            ]),
            ('h2', 'How Tourvia fits the replacement checklist'),
            ('p', 'Tourvia is a Salesforce managed package. It runs inside your org, uses your existing records, and includes a mobile app for field reps. It does not require an external sync. Pricing is published: €30 excluding tax per licensed user per month, billed annually.'),
            ('p', 'If your team is evaluating replacements because of the mobile retirement, Tourvia offers a 30-day trial so you can test the route-to-visit workflow with your own data before making a decision.'),
        ],
        'cta': True,
        'next': [
            ('../salesforce-route-planning.html', 'Salesforce route planning: see the native workflow inside Salesforce'),
            ('../pricing.html', 'Tourvia pricing: €30/user/month, billed annually'),
            ('salesforce-maps-alternatives-compared.html', 'Salesforce Maps alternatives: full comparison of 6 tools'),
            ('geopointe-alternative.html', 'Geopointe alternative: a Salesforce-native route planning option'),
        ]
    },
    'geopointe-alternative.html': {
        'title': 'Geopointe Alternative for Salesforce: Route Planning Inside CRM',
        'h1': 'Geopointe alternative for route planning inside Salesforce',
        'description': 'Looking for a Geopointe alternative? Compare Tourvia and Geopointe on Salesforce integration, route optimization, mobile execution, and pricing.',
        'kicker': 'Comparison',
        'date': '2026-07-19',
        'read': '8 min read',
        'summary': 'Geopointe is the best-known Salesforce-native mapping tool. If your team needs route planning, mobile visits, and field execution, several alternatives exist. Tourvia is a Salesforce managed package focused on route-to-visit workflows, with clear pricing and a mobile app.',
        'body': [
            ('h2', 'What Geopointe does well'),
            ('p', 'Geopointe is a long-standing AppExchange partner. It offers territory mapping, geocoding, geographic search, and visualization layers inside Salesforce. For organizations that need to understand where customers are and draw territories, Geopointe is a strong choice.'),
            ('h2', 'Where Geopointe becomes less ideal for route execution'),
            ('p', 'Geopointe’s strength is mapping and analytics. Route planning and field execution are secondary. If your reps need optimized daily routes, mobile check-ins, and visit reporting, you may end up combining Geopointe with another tool or with manual processes.'),
            ('p', 'The pricing model also scales with user count. For a field team of 10-20 reps, the total annual cost can become significant before considering implementation and training.'),
            ('h2', 'What to look for in a Geopointe alternative'),
            ('p', 'If your main goal is to turn Salesforce records into routes and visits, prioritize these features:'),
            ('ul', [
                'Salesforce-native managed package with no external sync',
                'Route optimization for multiple stops per day',
                'Mobile app for field reps with offline resilience',
                'Check-in and visit reporting tied to Salesforce Events',
                'Transparent annual pricing'
            ]),
            ('h2', 'Tourvia vs Geopointe at a glance'),
            ('p', 'Both Tourvia and Geopointe are managed packages on Salesforce AppExchange. The difference is focus. Geopointe is a mapping and territory tool. Tourvia is a route planning and visit execution tool.'),
            ('p', 'Tourvia builds the route from Accounts, Contacts, Leads, or Opportunities, optimizes the sequence, and creates Events in Salesforce. The mobile app then guides reps through the day, records check-ins, and writes the visit report back into the CRM.'),
            ('p', 'Geopointe visualizes the data and supports basic routing, but it is not designed around daily field execution in the same way.'),
            ('h2', 'Pricing comparison'),
            ('p', 'Geopointe is typically quoted per user per month, often around $75/user/month, billed annually. Tourvia is priced at €30 excluding tax per licensed user per month, billed annually. For a 15-person field team, the difference can exceed $10,000 per year.'),
            ('p', 'Exact pricing varies by contract and region. Always verify the current Geopointe price directly with the vendor.'),
            ('h2', 'When to choose Tourvia over Geopointe'),
            ('p', 'Choose Tourvia if your priority is daily route optimization, mobile visit execution, and keeping field data inside Salesforce. Choose Geopointe if your priority is territory mapping, geocoding, and geographic analytics.'),
            ('p', 'Some teams may even use both: Geopointe for territory design and Tourvia for route execution.'),
        ],
        'cta': True,
        'next': [
            ('tourvia-vs-geopointe.html', 'Tourvia vs Geopointe: side-by-side comparison'),
            ('geopointe-pricing.html', 'Geopointe pricing: what it costs for a field team'),
            ('salesforce-maps-alternatives-compared.html', 'Salesforce Maps alternatives: full comparison'),
            ('../salesforce-route-planning.html', 'Salesforce route planning: see how Tourvia works'),
        ]
    },
    'tourvia-vs-geopointe.html': {
        'title': 'Tourvia vs Geopointe: Salesforce Route Planning Comparison',
        'h1': 'Tourvia vs Geopointe: which one fits your Salesforce field team?',
        'description': 'Tourvia vs Geopointe: compare integration, route optimization, mobile app, visit reporting, and pricing for Salesforce field teams.',
        'kicker': 'Versus',
        'date': '2026-07-19',
        'read': '9 min read',
        'summary': 'Tourvia and Geopointe are both Salesforce AppExchange solutions, but they solve different problems. Tourvia is built for route planning and visit execution. Geopointe is built for mapping, territory design, and geocoding.',
        'body': [
            ('h2', 'At a glance: Tourvia vs Geopointe'),
            ('table', [
                ['Feature', 'Tourvia', 'Geopointe'],
                ['Salesforce integration', 'Managed package inside Salesforce', 'Managed package inside Salesforce'],
                ['Primary use case', 'Route planning and visit execution', 'Mapping, territory design, and geocoding'],
                ['Route optimization', 'Built-in, multi-stop daily routes', 'Basic routing'],
                ['Mobile app', 'Yes, dedicated field rep app', 'Limited mobile experience'],
                ['Check-in / visit reporting', 'Yes, tied to Salesforce Events', 'Not a core feature'],
                ['Pricing model', '€30/user/month billed annually', 'Quoted per user, ~$75/user/month'],
                ['Data residency', 'Routing inputs processed in France', 'Check with vendor'],
            ]),
            ('h2', 'Integration: both are Salesforce-native'),
            ('p', 'Both products run inside Salesforce as managed packages. This means they read your existing records, respect your permissions, and write updates back into the CRM. No third-party connector is required.'),
            ('p', 'The difference is in how they use that data. Geopointe focuses on visualization and territory analytics. Tourvia focuses on turning records into an executable route and visit plan.'),
            ('h2', 'Route optimization'),
            ('p', 'Tourvia is built around route optimization. You select a set of records, set constraints like time windows or visit duration, and Tourvia returns an optimized sequence. The route then becomes Salesforce Events.'),
            ('p', 'Geopointe can draw routes on a map, but the optimization is lighter. It is not designed for daily field scheduling with multiple constraints.'),
            ('h2', 'Mobile experience'),
            ('p', 'For field reps, the mobile experience determines adoption. Tourvia provides a mobile app built for the route-to-visit workflow. Geopointe’s mobile experience is more limited and not centered on daily execution.'),
            ('h2', 'Pricing'),
            ('p', 'Tourvia publishes a flat price: €30 excluding tax per licensed user per month, billed annually. Geopointe is typically quoted, with public references around $75 per user per month. For a 15-person team, Tourvia can be less than half the cost.'),
            ('h2', 'Which one should you choose?'),
            ('p', 'Choose Tourvia if you want optimized routes, a mobile app for reps, and visit reporting inside Salesforce. Choose Geopointe if you need deep territory mapping, geographic search, and visualization dashboards.'),
            ('p', 'If your need is both, start with the one that solves the most urgent pain. For most field teams executing visits daily, that is route planning.'),
        ],
        'cta': True,
        'next': [
            ('geopointe-alternative.html', 'Geopointe alternative: why teams switch'),
            ('geopointe-pricing.html', 'Geopointe pricing: cost breakdown'),
            ('../pricing.html', 'Tourvia pricing: flat annual model'),
            ('../salesforce-route-planning.html', 'See how Tourvia plans routes inside Salesforce'),
        ]
    },
    'geopointe-pricing.html': {
        'title': 'Geopointe Pricing 2026: What It Costs for Salesforce Field Teams',
        'h1': 'Geopointe pricing: what it costs and how it compares to Tourvia',
        'description': 'Geopointe pricing explained for Salesforce field teams. Compare Geopointe cost, contract model, and annual budget with Tourvia at €30/user/month.',
        'kicker': 'Pricing',
        'date': '2026-07-19',
        'read': '7 min read',
        'summary': 'Geopointe does not publish exact pricing publicly. Field teams typically report costs around $75 per user per month, billed annually. For a 15-person team, that is roughly $13,500 per year. Compare that with alternatives before renewing.',
        'body': [
            ('h2', 'How Geopointe pricing is structured'),
            ('p', 'Geopointe is sold as an AppExchange package with a per-user subscription. The exact price depends on the number of users, the contract length, and the modules included. Most references place the list price around $75 per user per month with annual billing.'),
            ('p', 'Custom pricing is common for larger teams or enterprise contracts. Implementation, training, and premium support may add to the total cost.'),
            ('h2', 'Estimated annual cost for a field team'),
            ('p', 'For a 15-person field team at $75/user/month billed annually:'),
            ('ul', [
                '15 users × $75/month = $1,125/month',
                'Annual cost = $13,500'
            ]),
            ('p', 'For a 30-person team:'),
            ('ul', [
                '30 users × $75/month = $2,250/month',
                'Annual cost = $27,000'
            ]),
            ('p', 'These are estimates. Always request a current quote from Geopointe or a Salesforce account executive.'),
            ('h2', 'What is included in the Geopointe license'),
            ('p', 'Geopointe licenses usually include core mapping, geocoding, territory management, and basic routing. Advanced features like custom layers, API access, and premium support may be add-ons.'),
            ('h2', 'Geopointe vs Tourvia pricing'),
            ('p', 'Tourvia publishes a flat price: €30 excluding tax per licensed user per month, billed annually. There is no separate quote process for the standard license.'),
            ('table', [
                ['Team size', 'Geopointe (estimated $75/user/mo)', 'Tourvia (€30/user/mo, HT)'],
                ['10 users', '$9,000/year', '€3,600/year'],
                ['20 users', '$18,000/year', '€7,200/year'],
                ['50 users', '$45,000/year', '€18,000/year'],
            ]),
            ('p', 'The difference is significant for multi-year contracts. If your main need is route planning and visit execution rather than deep territory analytics, a tool like Tourvia can reduce the annual license cost substantially.'),
            ('h2', 'When Geopointe is worth the price'),
            ('p', 'Geopointe is worth the investment if territory mapping, geographic dashboards, and complex geocoding are central to your operations. If your team mostly needs daily routes and visit reporting, other options may deliver better ROI.'),
            ('h2', 'How to evaluate the real cost'),
            ('p', 'When comparing vendors, include these hidden costs:'),
            ('ul', [
                'Implementation and admin setup time',
                'Training for field reps and managers',
                'Integration maintenance if data syncs externally',
                'Mobile data usage and device support',
                'Contract flexibility and renewal terms'
            ]),
        ],
        'cta': True,
        'next': [
            ('../pricing.html', 'Tourvia pricing: flat per-user model'),
            ('tourvia-vs-geopointe.html', 'Tourvia vs Geopointe: full comparison'),
            ('geopointe-alternative.html', 'Geopointe alternative: why teams switch'),
            ('../salesforce-route-planning.html', 'Salesforce route planning: how Tourvia works'),
        ]
    }
,
    'tourvia-vs-spotio.html': {
        'title': 'Tourvia vs SPOTIO: Salesforce Route Planning for Field Sales',
        'h1': 'Tourvia vs SPOTIO: which field sales route tool fits Salesforce better?',
        'description': 'Compare Tourvia and SPOTIO for field sales route planning, Salesforce integration, mobile app, and pricing.',
        'kicker': 'Versus',
        'date': '2026-07-19',
        'read': '8 min read',
        'summary': 'SPOTIO is a popular field sales platform with route planning, activity tracking, and performance dashboards. Tourvia is a Salesforce managed package focused on route-to-visit execution inside Salesforce.',
        'body': [
            ('h2', 'What SPOTIO does well'),
            ('p', 'SPOTIO is built for field sales teams. It offers route planning, activity tracking, sales performance dashboards, and gamification. It is a strong choice for teams that want a standalone field sales platform with CRM-like capabilities.'),
            ('h2', 'Where SPOTIO becomes less ideal for Salesforce teams'),
            ('p', 'SPOTIO runs outside Salesforce. Data syncs between SPOTIO and your CRM require a connector, which creates latency, maintenance, and duplicate records. If your Salesforce is the system of record, field reps may end up working in two systems.'),
            ('p', 'Pricing is also quoted and can include platform, integration, and per-user fees.'),
            ('h2', 'What to look for in a SPOTIO alternative'),
            ('p', 'If you want to keep field execution inside Salesforce, prioritize:'),
            ('ul', [
                'Salesforce-native managed package with no external sync',
                'Route optimization from Salesforce records',
                'Mobile app that creates Events and Tasks in Salesforce',
                'Published per-user annual pricing',
                'Short implementation and training cycle'
            ]),
            ('h2', 'Tourvia vs SPOTIO at a glance'),
            ('table', [
                ['Feature', 'Tourvia', 'SPOTIO'],
                ['CRM architecture', 'Inside Salesforce', 'Standalone with Salesforce connector'],
                ['Route optimization', 'Built-in, multi-stop', 'Yes, field sales routes'],
                ['Mobile app', 'Dedicated route app', 'Yes, field sales app'],
                ['Salesforce data sync', 'Native, real-time', 'Connector-based'],
                ['System of record', 'Salesforce', 'SPOTIO or shared'],
                ['Pricing model', '€30/user/month billed annually', 'Quoted, platform + per-user'],
            ]),
            ('h2', 'When to choose Tourvia over SPOTIO'),
            ('p', 'Choose Tourvia if Salesforce is your single source of truth, you want reps to work inside one system, and you need route-to-visit execution. Choose SPOTIO if you want a broader field sales platform with its own reporting and CRM features.'),
            ('h2', 'Pricing comparison'),
            ('p', 'Tourvia is €30 excluding tax per user per month billed annually. SPOTIO does not publish pricing; teams typically request a quote. Include connector and integration maintenance costs when comparing.'),
        ],
        'cta': True,
        'next': [
            ('tourvia-vs-route4me.html', 'Tourvia vs Route4Me: route optimization comparison'),
            ('../salesforce-route-planning.html', 'Salesforce route planning: how Tourvia works'),
            ('../pricing.html', 'Tourvia pricing: flat per-user model'),
            ('salesforce-maps-mobile-retirement.html', 'Salesforce Maps mobile retirement guide'),
        ]
    },
    'tourvia-vs-route4me.html': {
        'title': 'Tourvia vs Route4Me: Route Optimization Inside Salesforce',
        'h1': 'Tourvia vs Route4Me: where should your routes live?',
        'description': 'Compare Tourvia and Route4Me for route optimization, Salesforce integration, mobile execution, and pricing.',
        'kicker': 'Versus',
        'date': '2026-07-19',
        'read': '7 min read',
        'summary': 'Route4Me is a powerful route optimization engine used by logistics, delivery, and field service teams. Tourvia is a Salesforce managed package that turns CRM records into optimized routes and visits.',
        'body': [
            ('h2', 'What Route4Me does well'),
            ('p', 'Route4Me is a mature route optimization platform. It handles complex constraints: time windows, capacity, driver skills, avoidance zones, and real-time re-optimization. For delivery fleets and logistics operations, it is a strong tool.'),
            ('h2', 'Where Route4Me becomes less ideal for Salesforce field sales'),
            ('p', 'Route4Me lives outside Salesforce. Field reps must switch between the CRM and the route app. Visits, notes, and outcomes have to be synced back, often through a connector or manual export.'),
            ('p', 'Route4Me is also designed around vehicles and stops, not sales accounts and opportunities. The data model does not map cleanly to Salesforce records.'),
            ('h2', 'What to look for in a Route4Me alternative'),
            ('p', 'If Salesforce is your field sales system of record, look for:'),
            ('ul', [
                'Routes built from Salesforce Accounts, Contacts, Leads, or Opportunities',
                'Automatic creation of Salesforce Events and Tasks',
                'Mobile app with check-in and visit reporting',
                'No manual CSV export or import',
                'Annual per-user pricing'
            ]),
            ('h2', 'Tourvia vs Route4Me at a glance'),
            ('table', [
                ['Feature', 'Tourvia', 'Route4Me'],
                ['Primary use case', 'Salesforce field sales route planning', 'Logistics and delivery optimization'],
                ['Salesforce integration', 'Native managed package', 'Connector or manual export'],
                ['Route optimization', 'Multi-stop with time windows', 'Advanced, vehicle-based constraints'],
                ['Mobile app', 'Route-to-visit app for reps', 'Driver app with proof of delivery'],
                ['Visit reporting', 'Tied to Salesforce Events', 'In-app or exported'],
                ['Pricing model', '€30/user/month billed annually', 'Tiered plans, often per route/vehicle'],
            ]),
            ('h2', 'When to choose Tourvia over Route4Me'),
            ('p', 'Choose Tourvia if your routes are sales visits, your data lives in Salesforce, and you want the outcome written back into the CRM. Choose Route4Me if you manage deliveries, fleets, or complex logistics constraints where Salesforce is not the primary operational system.'),
            ('h2', 'Pricing comparison'),
            ('p', 'Tourvia is €30 excluding tax per user per month billed annually. Route4Me uses tiered plans that depend on route count, vehicle count, and features. For sales teams, the simpler Salesforce-native option often wins on total cost and implementation speed.'),
        ],
        'cta': True,
        'next': [
            ('tourvia-vs-spotio.html', 'Tourvia vs SPOTIO: field sales comparison'),
            ('../salesforce-route-planning.html', 'Salesforce route planning: how Tourvia works'),
            ('../pricing.html', 'Tourvia pricing: flat per-user model'),
            ('salesforce-maps-mobile-retirement.html', 'Salesforce Maps mobile retirement guide'),
        ]
    }
}

def render_html(slug, page):
    path = slug.replace('.html', '')
    canonical = f'https://gettourvia.com/blog/{slug}'
    
    body_html = ''
    for tag, content in page['body']:
        if tag == 'p':
            body_html += f'    <p>{content}</p>\n'
        elif tag == 'h2':
            body_html += f'    <h2>{content}</h2>\n'
        elif tag == 'h3':
            body_html += f'    <h3>{content}</h3>\n'
        elif tag == 'ul':
            body_html += '    <ul>\n'
            for item in content:
                body_html += f'      <li>{item}</li>\n'
            body_html += '    </ul>\n'
        elif tag == 'ol':
            body_html += '    <ol>\n'
            for item in content:
                body_html += f'      <li>{item}</li>\n'
            body_html += '    </ol>\n'
        elif tag == 'table':
            body_html += '    <div style="overflow-x:auto;margin:24px 0;">\n'
            body_html += '    <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">\n'
            for i, row in enumerate(content):
                body_html += '      <tr>\n'
                for j, cell in enumerate(row):
                    if i == 0:
                        body_html += f'        <th style="text-align:left;padding:12px;border-bottom:2px solid #3f3f46;color:#fafafa;background:#131316;">{cell}</th>\n'
                    else:
                        body_html += f'        <td style="padding:12px;border-bottom:1px solid #27272a;color:#d4d4d8;">{cell}</td>\n'
                body_html += '      </tr>\n'
            body_html += '    </table>\n'
            body_html += '    </div>\n'

    next_html = ''
    for url, label in page['next']:
        next_html += f'      <li><a href="{url}" style="color:#9099ff;text-decoration:none;">{label} &rarr;</a></li>\n'

    cta_html = ''
    if page.get('cta'):
        cta_html = '''
    <div class="blog-cta" style="background:#131316;border:1px solid #27272a;border-radius:16px;padding:28px 32px;margin-top:40px;">
      <h3 style="color:#fafafa;margin-bottom:10px;">Request a 30-day Tourvia trial</h3>
      <p style="color:#a1a1aa;margin-bottom:18px;">Test Tourvia in your Salesforce org for 30 days. Pricing is €30 excluding tax per licensed user per month, billed annually.</p>
      <a href="../#contact" style="display:inline-block;background:#6366f1;color:white;padding:12px 22px;border-radius:10px;font-weight:600;text-decoration:none;margin-right:12px;">Request a 30-day trial</a>
      <a href="../pricing.html" style="display:inline-block;color:#9099ff;text-decoration:none;font-weight:600;">See pricing &rarr;</a>
    </div>
'''

    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": page['h1'],
        "datePublished": page['date'],
        "dateModified": page['date'],
        "author": {"@type": "Organization", "name": "SKZ Consulting", "alternateName": "Tourvia"},
        "publisher": {"@type": "Organization", "name": "SKZ Consulting", "alternateName": "Tourvia", "url": "https://gettourvia.com"},
        "description": page['description'],
        "mainEntityOfPage": canonical
    }

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <script async src="https://analytics.routeforce.app/js/pa-_n3TcjLOcbLv8zogcyMJM.js"></script>
<script>window.plausible=window.plausible||function(){{(plausible.q=plausible.q||[]).push(arguments)}},plausible.init=plausible.init||function(i){{plausible.o=i||{{}}}};plausible.init()</script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page['title']} | Tourvia</title>
  <meta name="robots" content="index, follow">
    <meta name="description" content="{page['description']}">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="../favicon.ico">
  <link rel="alternate" type="text/plain" title="LLMs.txt" href="/llms.txt">
  <link rel="stylesheet" href="../style.css">
  <meta property="og:title" content="{page['title']}">
  <meta property="og:site_name" content="Tourvia">
  <meta property="og:description" content="{page['description']}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="https://gettourvia.com/assets/screenshots-2026/screen-01.jpg"/>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{page['title']}"/>
  <meta name="twitter:description" content="{page['description']}"/>
  <meta name="twitter:image" content="https://gettourvia.com/assets/screenshots-2026/screen-01.jpg"/>
  <script type="application/ld+json">
  {json.dumps(schema, indent=2, ensure_ascii=False)}
  </script>
</head>
<body style="background:#09090b;color:#e4e4e7;">
<header style="position:sticky;top:0;z-index:1000;background:rgba(9,9,11,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #27272a;">
  <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 28px;max-width:1320px;margin:0 auto;">
    <a href="../" style="display:flex;align-items:center;gap:10px;text-decoration:none;min-width:0;padding-right:12px;">
      <img src="../assets/logo-site-brand.png" alt="Tourvia" style="width:32px;height:32px;border-radius:10px;flex-shrink:0;"/>
      <span style="font-size:1.125rem;font-weight:700;letter-spacing:-0.02em;color:#fafafa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Tourvia</span>
    </a>
    <nav id="desktopNav" style="display:flex;gap:24px;align-items:center;font-size:0.95rem;white-space:nowrap;">
      <a href="../#features" style="color:#a1a1aa;text-decoration:none;">Features</a>
      <a href="../#showcase" style="color:#a1a1aa;text-decoration:none;">Product</a>
      <a href="../#pricing" style="color:#a1a1aa;text-decoration:none;">Pricing</a>
      <a href="../use-cases.html" style="color:#a1a1aa;text-decoration:none;">Use cases</a>
      <a href="../blog/" style="color:#a1a1aa;text-decoration:none;">Blog</a>
    </nav>
    <div style="display:flex;align-items:center;gap:8px;">
      <a href="../docs/" style="color:#a1a1aa;text-decoration:none;font-size:0.95rem;" id="docsLink">Docs</a>
      <a href="../#contact" style="background:#6366f1;color:white;padding:10px 18px;border-radius:10px;font-weight:600;text-decoration:none;font-size:0.92rem;">Request trial</a>
    </div>
  </div>
</header>

<section class="blog-hero blog-hero-premium" style="padding:64px 24px 40px;">
  <div class="container">
    <div class="blog-hero-premium-grid" style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:48px;max-width:1200px;margin:0 auto;align-items:start;">
      <div class="blog-hero-copy">
        <div class="blog-kicker-row" style="display:flex;gap:12px;align-items:center;color:#a1a1aa;font-size:0.92rem;margin-bottom:16px;">
      <span class="blog-kicker-chip" style="background:#27272a;color:#e4e4e7;padding:4px 10px;border-radius:20px;font-size:0.8rem;">{page['kicker']}</span>
      <time datetime="{page['date']}">{datetime.strptime(page['date'], '%Y-%m-%d').strftime('%B %d, %Y')}</time>
      <span>&middot;</span>
      <span>{page['read']}</span>
    </div>
    <h1 style="font-size:2.25rem;font-weight:800;line-height:1.15;color:#fafafa;margin-bottom:18px;">{page['h1']}</h1>
    <p class="blog-hero-summary" style="font-size:1.125rem;color:#a1a1aa;line-height:1.7;">{page['summary']}</p>
    <div style="display:flex;flex-wrap:wrap;gap:10px 18px;margin-top:18px;color:#a1a1aa;font-size:0.92rem;"><span>Salesforce-native managed package</span><span>€30/user/month, billed annually</span><span>30-day trial</span></div>
      </div>
      <aside class="blog-hero-sidecard blog-hero-sidecard-muted" style="background:#131316;border:1px solid #27272a;border-radius:18px;padding:24px;">
        <div class="blog-hero-sidecard-label" style="color:#6366f1;font-size:0.8rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;">Managed-package option</div>
        <div class="blog-hero-sidecard-title" style="font-size:1.1rem;font-weight:700;color:#fafafa;margin-bottom:10px;">Evaluate Tourvia for your Salesforce field team</div>
        <p class="blog-hero-sidecard-copy" style="color:#a1a1aa;font-size:0.95rem;line-height:1.6;">Tourvia publishes its annual per-user price and offers a complete 30-day trial for testing representative routes and field workflows.</p>
        <div class="blog-hero-linklist" style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
          <a href="../pricing.html" style="color:#9099ff;text-decoration:none;">See Tourvia pricing</a>
          <a href="../salesforce-route-planning.html" style="color:#9099ff;text-decoration:none;">Explore route planning</a>
          <a href="../#contact" style="color:#9099ff;text-decoration:none;">Request trial</a>
        </div>
      </aside>
    </div>
  </div>
</section>

<section class="blog-content" style="padding:60px 0 100px;">
  <div class="container longform-rhythm" style="max-width:800px;margin:0 auto;padding:0 24px;">
{body_html}{cta_html}
  </div>
</section>

<section style="max-width:800px;margin:0 auto 3rem;padding:0 24px;">
  <h2 style="font-size:1.25rem;font-weight:700;color:#fafafa;margin-bottom:1rem;">Next pages for evaluation</h2>
  <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:10px;">
{next_html}  </ul>
</section>

<footer style="border-top:1px solid #27272a;padding:64px 24px 32px;background:#09090b;">
  <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:48px;">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <img src="/assets/logo-site-brand.png" alt="Tourvia" style="width:28px;height:28px;border-radius:8px;"/>
        <span style="font-weight:700;color:#fafafa;font-size:1.05rem;">Tourvia</span>
      </div>
      <p style="color:#a1a1aa;font-size:0.9rem;line-height:1.6;max-width:280px;margin:0 0 16px;">Salesforce managed package for route planning and field execution.</p>
      <a href="../#contact" style="display:inline-flex;align-items:center;gap:6px;background:#6366f1;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.85rem;">Request trial</a>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:0.875rem;">
      <span style="font-weight:700;color:#fafafa;margin-bottom:4px;font-size:0.8rem;letter-spacing:0.06em;text-transform:uppercase;">Product</span>
      <a href="../#features" style="color:#a1a1aa;text-decoration:none;">Features</a>
      <a href="../#pricing" style="color:#a1a1aa;text-decoration:none;">Pricing</a>
      <a href="../use-cases.html" style="color:#a1a1aa;text-decoration:none;">Use cases</a>
      <a href="../native-integration-salesforce.html" style="color:#a1a1aa;text-decoration:none;">Integration</a>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:0.875rem;">
      <span style="font-weight:700;color:#fafafa;margin-bottom:4px;font-size:0.8rem;letter-spacing:0.06em;text-transform:uppercase;">Resources</span>
      <a href="../blog/" style="color:#a1a1aa;text-decoration:none;">Blog</a>
      <a href="../docs/" style="color:#a1a1aa;text-decoration:none;">Docs</a>
      <a href="../pricing.html" style="color:#a1a1aa;text-decoration:none;">Pricing ROI</a>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;font-size:0.875rem;">
      <span style="font-weight:700;color:#fafafa;margin-bottom:4px;font-size:0.8rem;letter-spacing:0.06em;text-transform:uppercase;">Company</span>
      <a href="mailto:contact@routeforce.app" style="color:#a1a1aa;text-decoration:none;">Contact</a>
      <a href="../docs/privacy.html" style="color:#a1a1aa;text-decoration:none;">Privacy</a>
      <a href="../docs/terms.html" style="color:#a1a1aa;text-decoration:none;">Terms</a>
      <a href="../docs/mentions-legales.html" style="color:#a1a1aa;text-decoration:none;">Legal notice</a>
      <a href="https://stats.uptimerobot.com/Z4Rq6R0Trb" target="_blank" rel="noopener" style="color:#a1a1aa;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">Status <span style="width:7px;height:7px;background:#22c55e;border-radius:50%;display:inline-block;"></span></a>
    </div>
  </div>
  <div style="max-width:1200px;margin:40px auto 0;padding-top:24px;border-top:1px solid #1e1e22;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;color:#71717a;font-size:0.8rem;">
    <span>&copy; 2026 SKZ Consulting. Tourvia is a product of SKZ Consulting.</span>
    <span>Delivered as an AppExchange managed package.</span>
  </div>
</footer>
<script>
window.plausible=window.plausible||function(){{(window.plausible.q=window.plausible.q||[]).push(arguments)}};
document.querySelectorAll('a[href*="appexchange.salesforce.com/appxListingDetail"]').forEach(function(link){{
  link.addEventListener('click',function(){{
    window.plausible('AppExchange Click',{{props:{{page_path:window.location.pathname,link_text:(link.textContent||'').trim().replace(/\s+/g,' ').slice(0,80)}}}});
  }});
}});
</script>
</body>
</html>
'''
    return html

import json

for slug, page in PAGES.items():
    out = BASE / 'blog' / slug
    out.write_text(render_html(slug, page), encoding='utf-8')
    print(f"Created {out}")

print("\nAll 4 P0 pages created.")
