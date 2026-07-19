#!/usr/bin/env python3
"""Generate French SEO cluster pages for gettourvia.com."""
import os, json
from pathlib import Path
from datetime import datetime

BASE = Path('/home/ubuntu/openclaw-vps/state/workspace-routeforce-site')
PAGES = {
    'fr/optimisation-tournees-salesforce.html': {
        'title': 'Optimisation des tournées Salesforce : planifier sans quitter le CRM',
        'h1': 'Optimiser les tournées terrain directement dans Salesforce',
        'description': 'Découvrez comment optimiser les tournées de vos commerciaux et techniciens terrain dans Salesforce. Route planning native, app mobile et reporting de visites intégrés.',
        'kicker': 'Guide',
        'date': '2026-07-19',
        'read': '9 min',
        'summary': 'L\'optimisation des tournées dans Salesforce permet de transformer vos comptes, contacts, leads et opportunités en itinéraires optimisés. Tourvia est un managed package natif qui crée des événements Salesforce et guide les équipes terrain via une application mobile.',
        'body': [
            ('h2', 'Pourquoi optimiser les tournées dans Salesforce ?'),
            ('p', 'Les équipes terrain passent encore beaucoup de temps à jongler entre le CRM, une feuille Excel et un GPS. Cela crée des pertes de temps, des données incomplètes et des opportunités manquées. Optimiser les tournées directement dans Salesforce centralise la planification, l\'exécution et le reporting dans un seul système.'),
            ('p', 'Avec une solution native, vous ne synchronisez pas des données entre deux outils. Les comptes, contacts, leads et opportunités servent directement de points de passage.'),
            ('h2', 'Les étapes clés de l\'optimisation'),
            ('ol', [
                'Sélectionner les enregistrements à visiter (comptes, contacts, leads, opportunités ou membres de campagne).',
                'Définir les contraintes : créneaux horaires, durée des visites, localisation de départ.',
                'Lancer l\'optimisation pour obtenir l\'ordre de passage idéal.',
                'Convertir l\'itinéraire en événements Salesforce.',
                'Guider l\'équipe terrain avec l\'application mobile.',
                'Récupérer les comptes-rendus et les check-ins dans le CRM.'
            ]),
            ('h2', 'Quels gains attendre ?'),
            ('ul', [
                'Réduction du temps de planification quotidienne',
                'Plus de visites par jour et par commercial',
                'Données terrain à jour dans Salesforce',
                'Meilleure visibilité manager sur l\'activité terrain'
            ]),
            ('h2', 'Tourvia : une solution native pour Salesforce'),
            ('p', 'Tourvia est un managed package Salesforce. Il s\'installe dans votre org, respecte vos profils et permissions, et utilise vos données existantes. Le prix est public : 30 € HT par utilisateur et par mois, facturé annuellement.'),
            ('p', 'Vous pouvez tester Tourvia pendant 30 jours dans votre environnement Salesforce avec vos propres données.'),
        ],
        'cta': True,
        'next': [
            ('planification-visites-salesforce.html', 'Planification de visites Salesforce'),
            ('tarifs-outils-terrain-salesforce.html', 'Tarifs des outils terrain Salesforce'),
            ('alternative-salesforce-maps.html', 'Alternative à Salesforce Maps'),
            ('../salesforce-route-planning.html', 'Route planning Salesforce (EN)'),
        ]
    },
    'fr/planification-visites-salesforce.html': {
        'title': 'Planification des visites Salesforce : guide complet',
        'h1': 'Planifier les visites terrain dans Salesforce',
        'description': 'Guide pratique pour planifier les visites terrain directement dans Salesforce. Comptes-rendus, check-in mobile et tournées optimisées.',
        'kicker': 'Guide',
        'date': '2026-07-19',
        'read': '8 min',
        'summary': 'La planification des visites dans Salesforce permet de transformer les enregistrements CRM en rendez-vous terrain. Tourvia crée automatiquement des événements et guide les équipes avec une app mobile.',
        'body': [
            ('h2', 'Le problème de la planification manuelle'),
            ('p', 'Beaucoup d\'équipes terrain planifient encore leurs visites à la main : un commercial regarde sa liste de comptes, choisit un ordre approximatif, puis navigue au feeling. Cela donne des trajets trop longs, des visites manquées et des rapports incomplets.'),
            ('h2', 'Comment planifier des visites dans Salesforce'),
            ('ol', [
                'Choisir les enregistrements à visiter (comptes, contacts, leads, opportunités).',
                'Fixer les contraintes : heures d\'ouverture, durée, localisation.',
                'Optimiser l\'ordre des visites pour réduire la distance parcourue.',
                'Générer des événements Salesforce liés aux enregistrements.',
                'Envoyer l\'itinéraire vers l\'application mobile du commercial.',
                'Récupérer le compte-rendu et le check-in dans le CRM.'
            ]),
            ('h2', 'Pourquoi une solution native est plus fiable'),
            ('p', 'Un outil externe à Salesforce nécessite une synchronisation. Les données peuvent être en décal, les doublons apparaissent, et les commerciaux doivent jongler entre deux applications. Une solution native évite ces problèmes : les visites sont des événements Salesforce standard.'),
            ('h2', 'Tourvia pour la planification de visites'),
            ('p', 'Tourvia planifie les visites directement à partir des enregistrements Salesforce. Les commerciaux reçoivent leur journée sur mobile, check-in/check-out à chaque étape, et le manager retrouve les rapports dans Salesforce.'),
        ],
        'cta': True,
        'next': [
            ('optimisation-tournees-salesforce.html', 'Optimisation des tournées Salesforce'),
            ('tarifs-outils-terrain-salesforce.html', 'Tarifs des outils terrain Salesforce'),
            ('alternative-salesforce-maps.html', 'Alternative à Salesforce Maps'),
            ('../visit-planning-salesforce.html', 'Visit planning Salesforce (EN)'),
        ]
    },
    'fr/tarifs-outils-terrain-salesforce.html': {
        'title': 'Tarifs des outils terrain Salesforce : comparatif 2026',
        'h1': 'Combien coûte un outil terrain Salesforce en 2026 ?',
        'description': 'Comparatif des tarifs des outils de tournées et de visites terrain pour Salesforce. Tourvia, Geopointe, Salesforce Maps et Badger Maps.',
        'kicker': 'Comparatif',
        'date': '2026-07-19',
        'read': '7 min',
        'summary': 'Les outils terrain Salesforce facturent généralement à l\'utilisateur et par mois. Tourvia affiche un prix fixe : 30 € HT par utilisateur et par mois, facturé annuellement.',
        'body': [
            ('h2', 'Modèles de tarification des outils terrain'),
            ('p', 'La plupart des solutions de tournées et visites terrain se facturent par utilisateur et par mois, avec une facturation annuelle. Certains éditeurs ajoutent des frais de mise en œuvre, de support ou d\'intégration.'),
            ('h2', 'Comparatif des prix'),
            ('table', [
                ['Outil', 'Prix public estimé', 'Facturation'],
                ['Tourvia', '30 € HT/utilisateur/mois', 'Annuelle'],
                ['Salesforce Maps', '75–150 $/utilisateur/mois', 'Annuelle'],
                ['Geopointe', '~75 $/utilisateur/mois', 'Annuelle, sur devis'],
                ['Badger Maps', '49–109 $/utilisateur/mois', 'Annuelle'],
                ['SPOTIO', 'Sur devis', 'Annuelle'],
            ]),
            ('h2', 'Coût total pour une équipe de 15 personnes'),
            ('p', 'Pour une équipe de 15 commerciaux terrain, le coût annuel varie fortement selon l\'outil. Tourvia revient à 5 400 € HT par an. Salesforce Maps ou Geopointe peuvent dépasser 13 000 $ par an pour la même équipe.'),
            ('h2', 'Ce qu\'il faut inclure dans le budget'),
            ('ul', [
                'Licence par utilisateur',
                'Mise en œuvre et configuration',
                'Formation des équipes',
                'Support et maintenance',
                'Intégration CRM si l\'outil est externe'
            ]),
            ('h2', 'Tourvia : tarif transparent'),
            ('p', 'Tourvia propose un tarif unique et public : 30 € HT par utilisateur et par mois, facturé annuellement. Pas de devis, pas de tarif caché. Un essai de 30 jours est disponible.'),
        ],
        'cta': True,
        'next': [
            ('../pricing.html', 'Tourvia pricing (EN)'),
            ('optimisation-tournees-salesforce.html', 'Optimisation des tournées Salesforce'),
            ('planification-visites-salesforce.html', 'Planification des visites Salesforce'),
        ]
    },
    'fr/alternative-salesforce-maps.html': {
        'title': 'Alternative à Salesforce Maps : quelle solution choisir en 2026 ?',
        'h1': 'Une alternative à Salesforce Maps pour la planification terrain',
        'description': 'Salesforce Maps retire son app mobile le 31 août 2026. Découvrez les alternatives natives Salesforce comme Tourvia pour remplacer la planification et les visites terrain.',
        'kicker': 'Alternatives',
        'date': '2026-07-19',
        'read': '8 min',
        'summary': 'Salesforce Maps met fin à son application mobile le 31 août 2026. Tourvia est une alternative native Salesforce avec optimisation de tournées, app mobile et reporting de visites.',
        'body': [
            ('h2', 'Pourquoi chercher une alternative à Salesforce Maps ?'),
            ('p', 'Salesforce a annoncé la fin de l\'application mobile Salesforce Maps le 31 août 2026. Les équipes terrain qui l\'utilisent pour planifier leurs journées et naviguer entre les comptes doivent migrer vers une autre solution.'),
            ('h2', 'Les critères d\'une bonne alternative'),
            ('ul', [
                'Solution native Salesforce (managed package)',
                'Optimisation de tournées multi-arrêts',
                'Application mobile pour les équipes terrain',
                'Check-in et comptes-rendus de visites',
                'Tarification transparente'
            ]),
            ('h2', 'Les principales alternatives'),
            ('p', 'Les alternatives se divisent en deux catégories : les solutions natives Salesforce et les outils externes synchronisés. Les solutions natives gardent Salesforce comme référentiel unique et évitent les synchronisations.'),
            ('h2', 'Tourvia, alternative native'),
            ('p', 'Tourvia est un managed package Salesforce qui crée des tournées optimisées à partir des comptes, contacts, leads et opportunités. L\'application mobile guide les commerciaux et les comptes-rendus sont écrits dans Salesforce.'),
            ('p', 'Le prix est fixe : 30 € HT par utilisateur et par mois, facturé annuellement. Un essai de 30 jours est proposé.'),
        ],
        'cta': True,
        'next': [
            ('optimisation-tournees-salesforce.html', 'Optimisation des tournées Salesforce'),
            ('planification-visites-salesforce.html', 'Planification des visites Salesforce'),
            ('../blog/salesforce-maps-mobile-retirement.html', 'Salesforce Maps mobile retirement (EN)'),
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
      <h3 style="color:#fafafa;margin-bottom:10px;">Demandez un essai Tourvia de 30 jours</h3>
      <p style="color:#a1a1aa;margin-bottom:18px;">Testez Tourvia dans votre environnement Salesforce pendant 30 jours. Tarif : 30 € HT par utilisateur et par mois, facturé annuellement.</p>
      <a href="../#contact" style="display:inline-block;background:#6366f1;color:white;padding:12px 22px;border-radius:10px;font-weight:600;text-decoration:none;margin-right:12px;">Demander un essai</a>
      <a href="../pricing.html" style="display:inline-block;color:#9099ff;text-decoration:none;font-weight:600;">Voir les tarifs &rarr;</a>
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
        "mainEntityOfPage": canonical,
        "inLanguage": "fr"
    }

    html = f'''<!DOCTYPE html>
<html lang="fr">
<head>
  <script async src="https://analytics.routeforce.app/js/pa-_n3TcjLOcbLv8zogcyMJM.js"></script>
<script>window.plausible=window.plausible||function(){{(plausible.q=plausible.q||[]).push(arguments)}},plausible.init=plausible.init||function(i){{plausible.o=i||{{}}}};plausible.init()</script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{page['title']} | Tourvia</title>
  <meta name="robots" content="index, follow">
    <meta name="description" content="{page['description']}">
  <link rel="canonical" href="{canonical}">
  <link rel="alternate" hreflang="en" href="https://gettourvia.com/salesforce-route-planning.html"/>
  <link rel="alternate" hreflang="fr" href="{canonical}"/>
  <link rel="alternate" hreflang="x-default" href="https://gettourvia.com/salesforce-route-planning.html"/>
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
      <a href="../" style="color:#a1a1aa;text-decoration:none;">Accueil</a>
      <a href="../salesforce-route-planning.html" style="color:#a1a1aa;text-decoration:none;">Route planning</a>
      <a href="../pricing.html" style="color:#a1a1aa;text-decoration:none;">Tarifs</a>
      <a href="../blog/" style="color:#a1a1aa;text-decoration:none;">Blog</a>
    </nav>
  </div>
</header>

<main class="blog-post" style="max-width:760px;margin:0 auto;padding:60px 20px 80px;">
  <a href="../" style="color:#9099ff;text-decoration:none;font-size:0.95rem;">&larr; Retour à l'accueil</a>
  <p style="text-transform:uppercase;font-size:0.75rem;letter-spacing:0.08em;color:#9099ff;margin-top:24px;">{page['kicker']}</p>
  <h1 style="font-size:2.25rem;line-height:1.15;font-weight:700;color:#fafafa;margin:8px 0 16px;">{page['h1']}</h1>
  <p style="color:#a1a1aa;font-size:1.05rem;line-height:1.6;">{page['summary']}</p>
  <p style="color:#71717a;font-size:0.85rem;margin:12px 0 32px;">Publié le {page['date']} · {page['read']}</p>

{body_html}
{cta_html}

  <h2 style="font-size:1.5rem;color:#fafafa;margin-top:48px;">Pages liées</h2>
  <ul style="color:#a1a1aa;line-height:1.8;margin-top:12px;">
{next_html}
  </ul>
</main>

<footer style="border-top:1px solid #27272a;padding:40px 28px;text-align:center;color:#71717a;font-size:0.85rem;">
  <p>&copy; 2026 SKZ Consulting / Tourvia. <a href="../docs/privacy.html" style="color:#9099ff;text-decoration:none;">Confidentialité</a></p>
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

print(f'\nAll {len(PAGES)} French cluster pages created.')
