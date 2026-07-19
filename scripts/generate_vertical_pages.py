#!/usr/bin/env python3
"""Generate vertical pages for pharma and CPG field sales."""
import os, json
from pathlib import Path
from datetime import datetime

BASE = Path('/home/ubuntu/openclaw-vps/state/workspace-routeforce-site')
PAGES = {
    'blog/route-planning-pharma-sales.html': {
        'title': 'Route Planning Software for Pharma Sales Reps inside Salesforce',
        'h1': 'Route planning for pharmaceutical sales teams inside Salesforce',
        'description': 'How pharmaceutical sales teams use Salesforce-native route planning to optimize HCP visits, stay compliant, and report visits directly in the CRM.',
        'kicker': 'Vertical',
        'date': '2026-07-19',
        'read': '7 min',
        'summary': 'Pharma sales reps visit doctors, clinics, and hospitals on tight schedules. Tourvia turns Salesforce targets into optimized routes, records visits as Events, and keeps managers compliant.',
        'body': [
            ('h2', 'Why pharma sales needs route planning'),
            ('p', 'Pharmaceutical sales representatives manage large territories with hundreds of healthcare professionals. Without route planning, reps lose hours in traffic, miss appointments, and under-report visits.'),
            ('p', 'Regulatory compliance also requires accurate visit records. A route planning tool that writes events and outcomes into Salesforce makes reporting easier for managers and compliance teams.'),
            ('h2', 'Specific constraints for pharma route planning'),
            ('ul', [
                'Strict visit windows and hospital access rules',
                'High-value targets that must be visited on schedule',
                'Call notes and sample management tied to each visit',
                'Territory alignment with sales targets',
                'Compliance with local pharma regulations'
            ]),
            ('h2', 'How Salesforce-native route planning helps'),
            ('p', 'A native managed package reads Targets, Accounts, Contacts, and Calls directly from Salesforce. It builds an optimized daily route, creates Events, and records check-ins. The data never leaves Salesforce.'),
            ('h2', 'Tourvia for pharmaceutical field teams'),
            ('p', 'Tourvia is installed inside Salesforce as a managed package. It plans routes from CRM targets, guides reps through the day, and writes visit outcomes back into the CRM. Pricing is flat: €30 per user per month, billed annually.'),
            ('p', 'A 30-day trial lets you test routes with your own Salesforce data before committing.'),
        ],
        'cta': True,
        'next': [
            ('route-planning-cpg-field-sales.html', 'Route planning for CPG field sales'),
            ('../salesforce-route-planning.html', 'How Tourvia works inside Salesforce'),
            ('../pricing.html', 'Tourvia pricing'),
        ]
    },
    'blog/route-planning-cpg-field-sales.html': {
        'title': 'Route Planning for CPG Field Sales Teams inside Salesforce',
        'h1': 'Route planning for CPG and FMCG field sales teams',
        'description': 'How consumer packaged goods sales teams use Salesforce-native route planning to optimize retail visits, track execution, and improve coverage.',
        'kicker': 'Vertical',
        'date': '2026-07-19',
        'read': '7 min',
        'summary': 'CPG field reps visit grocery stores, convenience stores, and retail chains. Tourvia builds daily routes from Salesforce accounts, tracks check-ins, and helps managers measure coverage.',
        'body': [
            ('h2', 'The CPG field sales challenge'),
            ('p', 'Consumer packaged goods sales teams cover dense routes of retail outlets. Each visit matters for shelf placement, promotions, and order taking. Poor routing means missed stores and lower revenue per rep.'),
            ('h2', 'What CPG route planning needs'),
            ('ul', [
                'Route optimization across many small accounts',
                'Visit frequency planning by store tier',
                'Check-in and check-out tracking',
                'Photo or note capture tied to each visit',
                'Coverage reporting by territory and rep'
            ]),
            ('h2', 'Why native Salesforce matters for CPG'),
            ('p', 'Retail accounts, contacts, and opportunities already live in Salesforce. A native route planning tool uses that data without sync, exports, or duplicate records. Managers see coverage in real time.'),
            ('h2', 'Tourvia for CPG field teams'),
            ('p', 'Tourvia turns Salesforce accounts into optimized daily routes for CPG reps. It creates Events, guides the rep through the day, and records check-ins. Territory managers can measure coverage and visits per store.'),
            ('p', 'Pricing is flat at €30 per user per month billed annually. A 30-day trial is available.'),
        ],
        'cta': True,
        'next': [
            ('route-planning-pharma-sales.html', 'Route planning for pharma sales'),
            ('../salesforce-route-planning.html', 'How Tourvia works inside Salesforce'),
            ('../pricing.html', 'Tourvia pricing'),
        ]
    }
}

def render_html(slug, page):
    canonical = f'https://gettourvia.com/{slug}'
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

    next_html = ''
    for url, label in page['next']:
        next_html += f'      <li><a href="{url}" style="color:#9099ff;text-decoration:none;">{label} &rarr;</a></li>\n'

    cta_html = '''
    <div class="blog-cta" style="background:#131316;border:1px solid #27272a;border-radius:16px;padding:28px 32px;margin-top:40px;">
      <h3 style="color:#fafafa;margin-bottom:10px;">Request a 30-day Tourvia trial</h3>
      <p style="color:#a1a1aa;margin-bottom:18px;">Test Tourvia in your Salesforce org for 30 days. Pricing is €30 excluding tax per licensed user per month, billed annually.</p>
      <a href="../#contact" style="display:inline-block;background:#6366f1;color:white;padding:12px 22px;border-radius:10px;font-weight:600;text-decoration:none;margin-right:12px;">Request a 30-day trial</a>
      <a href="../pricing.html" style="display:inline-block;color:#9099ff;text-decoration:none;font-weight:600;">See pricing &rarr;</a>
    </div>
''' if page.get('cta') else ''

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
      <a href="../" style="color:#a1a1aa;text-decoration:none;">Home</a>
      <a href="../salesforce-route-planning.html" style="color:#a1a1aa;text-decoration:none;">Route planning</a>
      <a href="../pricing.html" style="color:#a1a1aa;text-decoration:none;">Pricing</a>
      <a href="../blog/" style="color:#a1a1aa;text-decoration:none;">Blog</a>
    </nav>
  </div>
</header>

<main class="blog-post" style="max-width:760px;margin:0 auto;padding:60px 20px 80px;">
  <a href="../blog/" style="color:#9099ff;text-decoration:none;font-size:0.95rem;">&larr; Back to blog</a>
  <p style="text-transform:uppercase;font-size:0.75rem;letter-spacing:0.08em;color:#9099ff;margin-top:24px;">{page['kicker']}</p>
  <h1 style="font-size:2.25rem;line-height:1.15;font-weight:700;color:#fafafa;margin:8px 0 16px;">{page['h1']}</h1>
  <p style="color:#a1a1aa;font-size:1.05rem;line-height:1.6;">{page['summary']}</p>
  <p style="color:#71717a;font-size:0.85rem;margin:12px 0 32px;">Published {page['date']} · {page['read']}</p>

{body_html}
{cta_html}

  <h2 style="font-size:1.5rem;color:#fafafa;margin-top:48px;">Next pages for evaluation</h2>
  <ul style="color:#a1a1aa;line-height:1.8;margin-top:12px;">
{next_html}
  </ul>
</main>

<footer style="border-top:1px solid #27272a;padding:40px 28px;text-align:center;color:#71717a;font-size:0.85rem;">
  <p>&copy; 2026 SKZ Consulting / Tourvia. <a href="../docs/privacy.html" style="color:#9099ff;text-decoration:none;">Privacy</a></p>
</footer>
</body>
</html>
'''
    return html


for slug, page in PAGES.items():
    target = BASE / slug
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(render_html(slug, page))
    print(f'Created {target}')

print(f'\nAll {len(PAGES)} vertical pages created.')
