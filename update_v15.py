#!/usr/bin/env python3
"""Script to update RouteForce site to v1.5"""
import re

# ============================================================
# FRENCH (index.html) — ALL CHANGES
# ============================================================

with open('index.html', 'r', encoding='utf-8') as f:
    fr = f.read()

# 1. META DESCRIPTION
fr = fr.replace(
    '<meta name="description" content="Planifiez et optimisez les tournées de vos commerciaux terrain directement dans Salesforce. Optimisation avancée, création automatique d\'événements, export CSV, historique — 249 €/mois pour toute l\'équipe.">',
    '<meta name="description" content="Visualisez vos Comptes, Opportunités et Leads sur la même carte Salesforce. Filtres polymorphiques, marqueurs SVG distincts, multi-devises — 249 €/mois pour toute l\'équipe, sans coût par utilisateur.">'
)

fr = fr.replace(
    '<meta property="og:description" content="Planifiez et optimisez les tournées de vos commerciaux terrain directement dans Salesforce. Optimisation avancée, création d\'événements, export CSV — 249 €/mois pour toute l\'équipe.">',
    '<meta property="og:description" content="Visualisez vos Comptes, Opportunités et Leads sur la même carte Salesforce. Filtres polymorphiques, marqueurs SVG, multi-devises — 249 €/mois pour toute l\'équipe.">'
)

fr = fr.replace(
    '<meta name="twitter:description" content="Planifiez et optimisez les tournées terrain directement dans Salesforce. Sans coût par utilisateur. 249 €/mois pour toute l\'équipe.">',
    '<meta name="twitter:description" content="Comptes, Opportunités et Leads sur la même carte Salesforce. Filtres polymorphiques, multi-devises. Sans coût par utilisateur. 249 €/mois pour toute l\'équipe.">'
)

# 2. JSON-LD featureList
fr = fr.replace(
    '''        "featureList": [
            "Carte interactive Leaflet intégrée à Salesforce",
            "Optimisation automatique de tournées",
            "Tracé d\'itinéraire sur la carte",
            "Création automatique d\'événements Salesforce",
            "Filtres dynamiques et sauvegardés",
            "Export Google Maps / Waze / CSV",
            "Historique des 20 dernières tournées",
            "Comptes proches par géolocalisation GPS",
            "Drag-and-drop pour réordonner les étapes",
            "Gestion des rendez-vous non assignés",
            "Interface mobile responsive avec bottom sheet",
            "Multilingue FR/EN/ES"
        ],''',
    '''        "featureList": [
            "Carte interactive Leaflet intégrée à Salesforce",
            "Accounts, Opportunities et Leads sur la même carte",
            "Filtres polymorphiques — filtrer par n\'importe quel champ sur n\'importe quel objet",
            "Marqueurs SVG distincts par type d\'objet (Pin=Account, Diamant=Opportunity, Cercle=Lead)",
            "Légende automatique avec sections par type d\'objet",
            "Support multi-devises — montants affichés dans la devise de l\'opportunité",
            "Optimisation automatique de tournées",
            "Tracé d\'itinéraire sur la carte",
            "Création automatique d\'événements Salesforce",
            "Filtres dynamiques et sauvegardés",
            "Export Google Maps / Waze / CSV",
            "Historique des 20 dernières tournées",
            "Comptes proches par géolocalisation GPS",
            "Drag-and-drop pour réordonner les étapes",
            "Gestion des rendez-vous non assignés",
            "Interface mobile responsive avec bottom sheet",
            "Multilingue FR/EN/ES"
        ],'''
)

# 3. COUNTDOWN BANNER — replace with v1.5 celebration banner
old_countdown = '''    <!-- COUNTDOWN BANNER — MULTILINGUAL SLIDER -->
    <div class="countdown-banner">
        <div class="countdown-content">
            <div class="countdown-left">
                <div class="countdown-slider" id="countdown-slider">
                    <div class="countdown-slide active">
                        <span class="countdown-label">🚀 LANCEMENT MONDIAL v1.0</span>
                        <span class="countdown-sub">Package Major • Couverture routière monde entier • 09 mars 2026</span>
                    </div>
                    <div class="countdown-slide">
                        <span class="countdown-label">🚀 WORLDWIDE LAUNCH v1.0</span>
                        <span class="countdown-sub">Major Package • Worldwide routing coverage • March 9, 2026</span>
                    </div>
                    <div class="countdown-slide">
                        <span class="countdown-label">🚀 LANZAMIENTO MUNDIAL v1.0</span>
                        <span class="countdown-sub">Paquete Major • Cobertura mundial de rutas • 9 de marzo 2026</span>
                    </div>
                </div>
            </div>
            <div class="countdown-timer" id="countdown">
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-days">--</span>
                    <span class="countdown-unit" data-fr="JOURS" data-en="DAYS" data-es="DÍAS">JOURS</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-hours">--</span>
                    <span class="countdown-unit" data-fr="HEURES" data-en="HOURS" data-es="HORAS">HEURES</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-mins">--</span>
                    <span class="countdown-unit">MIN</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-secs">--</span>
                    <span class="countdown-unit">SEC</span>
                </div>
            </div>
            <div class="countdown-right">
                <div class="countdown-slider" id="countdown-slider-right">
                    <div class="countdown-slide-right active">
                        <span class="countdown-offer">🆓 ESSAI 14 JOURS</span>
                        <span class="countdown-offer countdown-discount">🔥 -15% INSTALLATION</span>
                    </div>
                    <div class="countdown-slide-right">
                        <span class="countdown-offer">🆓 14-DAY FREE TRIAL</span>
                        <span class="countdown-offer countdown-discount">🔥 15% OFF SETUP</span>
                    </div>
                    <div class="countdown-slide-right">
                        <span class="countdown-offer">🆓 PRUEBA GRATIS 14 DÍAS</span>
                        <span class="countdown-offer countdown-discount">🔥 -15% INSTALACIÓN</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    (function(){
      // Countdown timer
      const target = new Date('2026-03-09T09:00:00+01:00').getTime();
      const langs = ['fr','en','es'];
      let langIdx = 0;

      function updateTimer(){
        const now = Date.now();
        const diff = target - now;
        if(diff <= 0){
          document.getElementById('countdown').innerHTML = '<span style="font-size:1.2rem;font-weight:800;color:#fff;">🎉 LAUNCHED!</span>';
          return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cd-days').textContent = d;
        document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
        document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
        document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
      }

      // Multilingual slider
      function rotateSlides(){
        langIdx = (langIdx + 1) % 3;
        const lang = langs[langIdx];

        // Left slides
        document.querySelectorAll('#countdown-slider .countdown-slide').forEach((s,i) => {
          s.classList.toggle('active', i === langIdx);
        });

        // Right slides
        document.querySelectorAll('#countdown-slider-right .countdown-slide-right').forEach((s,i) => {
          s.classList.toggle('active', i === langIdx);
        });

        // Timer units
        document.querySelectorAll('.countdown-unit[data-'+lang+']').forEach(u => {
          u.textContent = u.getAttribute('data-'+lang);
        });
      }

      updateTimer();
      setInterval(updateTimer, 1000);
      setInterval(rotateSlides, 4000);
    })();
    </script>'''

new_countdown_fr = '''    <!-- V1.5 LAUNCH BANNER -->
    <div class="countdown-banner">
        <div class="countdown-content" style="justify-content: center; gap: 32px; flex-wrap: wrap;">
            <div class="countdown-left">
                <span class="countdown-label">🎉 v1.5 DISPONIBLE — Comptes, Opportunités &amp; Leads sur la même carte</span>
                <span class="countdown-sub" style="display:block;margin-top:4px;">Filtres polymorphiques · Marqueurs SVG · Multi-devises · Légende automatique</span>
            </div>
            <div class="countdown-right">
                <span class="countdown-offer">🆓 ESSAI 14 JOURS</span>
                <span class="countdown-offer countdown-discount">🔥 -15% INSTALLATION — Offre early adopter</span>
            </div>
        </div>
    </div>'''

fr = fr.replace(old_countdown, new_countdown_fr)

# 4. HERO SUBTITLE
fr = fr.replace(
    '''                <p class="hero-subtitle">
                    RouteForce optimise les itinéraires de vos équipes terrain, crée les rendez-vous dans Salesforce et leur fait gagner du temps — dès le premier jour.
                    <strong>249€/mois pour toute votre équipe, sans coût par utilisateur.</strong>
                </p>''',
    '''                <p class="hero-subtitle">
                    Visualisez vos <strong>Comptes, Opportunités et Leads sur la même carte</strong>, optimisez les tournées de vos équipes terrain et créez les rendez-vous dans Salesforce — dès le premier jour.
                    <strong>249€/mois pour toute votre équipe, sans coût par utilisateur.</strong>
                </p>'''
)

# 5. PROBLEM/SOLUTION — add 2 new items in "Avec RouteForce"
fr = fr.replace(
    '''                        <li><strong>Comptes ET Leads sur la même carte</strong> — prospection + fidélisation, même tournée</li>
                        <li><strong>Itinéraire optimal multimodal</strong>''',
    '''                        <li><strong>Comptes, Opportunités ET Leads sur la même carte</strong> — prospection, pipeline et fidélisation, même tournée</li>
                        <li><strong>Opportunités et Leads</strong> sur la carte — priorisez vos deals par stage, forecast et valeur</li>
                        <li><strong>Filtres configurables</strong> — par secteur, stage de vente, forecast, type de lead</li>
                        <li><strong>Itinéraire optimal multimodal</strong>'''
)

# 6. FEATURES GRID — add 3 new cards after "Comptes proches" card
fr = fr.replace(
    '''                </div>
            </div>
        </div>
    </section>

    <!-- POUR QUI -->''',
    '''                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                            <path d="M17 10l3-3M7 10l-3-3"/>
                        </svg>
                    </div>
                    <h3>Opportunités &amp; Leads sur la carte</h3>
                    <p>Visualisez tout votre pipeline géographiquement. Comptes 📍, Opportunités 🔷 et Leads ⭕ sur la même carte avec des marqueurs SVG distincts et une légende automatique par type d'objet.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="6" x2="20" y2="6"/>
                            <line x1="4" y1="12" x2="14" y2="12"/>
                            <line x1="4" y1="18" x2="17" y2="18"/>
                            <circle cx="20" cy="12" r="2"/>
                            <circle cx="17" cy="18" r="2"/>
                        </svg>
                    </div>
                    <h3>Filtres polymorphiques</h3>
                    <p>Filtrez par n'importe quel champ sur n'importe quel objet — Industry, Stage, Forecast, Lead Status, montant, et tout champ custom. Une interface de filtre unique, applicable à Account, Opportunity ou Lead.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M12 6v1M12 17v1M6 12h1M17 12h1"/>
                        </svg>
                    </div>
                    <h3>Multi-devises</h3>
                    <p>Les montants des opportunités s'affichent dans leur devise native. Les équipes internationales voient chaque deal dans la bonne devise — support natif de toutes les picklists de valeurs custom.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- POUR QUI -->'''
)

# 7. ADMIN CARD — update
fr = fr.replace(
    '                        <li>Conçu pour l\'objet Account Salesforce</li>',
    '                        <li>Comptes, Opportunités et Leads — tout configurable sans code</li>'
)

# 8. SCREENSHOTS — update captions
fr = fr.replace(
    '''                    <div class="screenshot-caption">
                        <h3>Tous vos comptes sur une carte</h3>
                        <p>Prospects, clients, leads — identifiez vos zones de couverture en un coup d'œil. Segmentation couleur automatique.</p>
                    </div>''',
    '''                    <div class="screenshot-caption">
                        <h3>Tous vos records sur une carte</h3>
                        <p>Comptes, Opportunités, Leads — identifiez vos zones de couverture en un coup d'œil. Marqueurs SVG distincts et légende automatique par type d'objet.</p>
                    </div>'''
)

fr = fr.replace(
    '''                    <div class="screenshot-caption">
                        <h3>Tournée optimisée en quelques secondes</h3>
                        <p>Comptes 📍 et leads ⭐ sur le même itinéraire. L'algorithme trouve le meilleur ordre de visite — vous gagnez du temps dès la première tournée.</p>
                    </div>''',
    '''                    <div class="screenshot-caption">
                        <h3>Tournée optimisée en quelques secondes</h3>
                        <p>Comptes 📍, Opportunités 🔷 et Leads ⭕ sur le même itinéraire. L'algorithme trouve le meilleur ordre de visite — vous gagnez du temps dès la première tournée.</p>
                    </div>'''
)

# 9. COMPARISON TABLE — add row for Accounts + Opps + Leads
fr = fr.replace(
    '''                        <tr>
                            <td>Coût par utilisateur</td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                        </tr>
                    </tbody>''',
    '''                        <tr>
                            <td>Coût par utilisateur</td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                        </tr>
                        <tr class="row-highlight">
                            <td>Comptes + Opportunités + Leads sur la carte</td>
                            <td class="highlight"><span class="check green">✅ inclus</span></td>
                            <td class="highlight"><span class="check green">✅ inclus</span></td>
                            <td class="highlight"><span class="check green">✅ inclus</span></td>
                        </tr>
                        <tr>
                            <td>Salesforce Maps — Objets supportés</td>
                            <td>✅ (~75€/user/mois)</td>
                            <td>✅ (~75€/user/mois)</td>
                            <td class="highlight">✅ (~75€/user/mois)</td>
                        </tr>
                    </tbody>'''
)

# 10. PRICING — Update "Clé en main" price from 5 000€ to 7 500€
fr = fr.replace(
    '                    <div class="pricing-price">\n                        <span class="price">5 000€ <small>HT</small></span>\n                        <span class="price-period">installation unique</span>',
    '                    <div class="pricing-price">\n                        <span class="price">7 500€ <small>HT</small></span>\n                        <span class="price-period">installation unique</span>'
)

# Also add Enterprise mention of Opps/Leads/multi-currency
fr = fr.replace(
    '                        <p class="pricing-desc">Infrastructure dédiée et accompagnement sur mesure pour les organisations multi-sites</p>',
    '                        <p class="pricing-desc">Infrastructure dédiée et accompagnement sur mesure pour les organisations multi-sites — Opportunités, Leads, multi-devises, intégrations avancées</p>'
)

# 11. FAQ — compatibility update
fr = fr.replace(
    'RouteForce fonctionne avec toutes les éditions Salesforce supportant les Lightning Web Components : Professional, Enterprise, Unlimited et Developer. Il s\'intègre avec votre objet Account existant.',
    'RouteForce fonctionne avec toutes les éditions Salesforce supportant les Lightning Web Components : Professional, Enterprise, Unlimited et Developer. Il s\'intègre avec vos objets Account, Opportunity et Lead — nativement, sans configuration spéciale.'
)

# 12. FAQ — subscription price update (5 000€ → 7 500€)
fr = fr.replace(
    '(3 500€ HT en autonome, 5 000€ HT clé en main)',
    '(3 500€ HT en autonome, 7 500€ HT clé en main)'
)

# 13. FAQ — add new FAQ about Opportunities/Leads (after the "secteurs" FAQ)
old_faq_last = '''                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>Quels secteurs d\'activité utilisent RouteForce ?</span>'''
new_faq_section = '''                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>RouteForce supporte-t-il les opportunités et les leads ?</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Oui — depuis la <strong>v1.5</strong>, RouteForce supporte nativement les objets <strong>Account, Opportunity et Lead</strong> sur la même carte. Chaque type d'objet dispose de marqueurs SVG distincts (Pin pour les Comptes, Diamant pour les Opportunités, Cercle pour les Leads) et d'une légende automatique. Les <strong>filtres polymorphiques</strong> vous permettent de filtrer par n'importe quel champ sur n'importe quel objet (Industry, Stage, Forecast, Lead Status, montant, champs custom). Les montants sont affichés dans la devise native de chaque opportunité. Toutes les picklists personnalisées sont supportées nativement.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>Quels secteurs d\'activité utilisent RouteForce ?</span>'''
fr = fr.replace(old_faq_last, new_faq_section)

# 14. JSON-LD FAQ schema at bottom — update clé en main price
fr = fr.replace(
    '"text": "RouteForce fonctionne avec un prix fixe sans coût par utilisateur. Installation unique (à partir de 3 500€ HT) puis 249€/mois pour toute votre org Salesforce, quel que soit le nombre d\'utilisateurs."',
    '"text": "RouteForce fonctionne avec un prix fixe sans coût par utilisateur. Installation unique (à partir de 2 975€ HT en autonome, 7 500€ HT clé en main) puis 249€/mois pour toute votre org Salesforce, quel que soit le nombre d\'utilisateurs."'
)

# 15. JSON-LD structured data — update highPrice (if needed, 7500€ clé en main + 249*12 = ~10488 => keep 18000 for enterprise)
# Already fine as enterprise is "Sur devis" - highPrice 18000 stays

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(fr)

print("FR (index.html) updated ✅")


# ============================================================
# ENGLISH (en/index.html) — ALL CHANGES
# ============================================================

with open('en/index.html', 'r', encoding='utf-8') as f:
    en = f.read()

# 1. META DESCRIPTION
en = en.replace(
    '<meta name="description" content="Plan and optimize your field sales routes directly in Salesforce. Advanced optimization, automatic event creation, CSV export, route history — €249/month for your entire team.">',
    '<meta name="description" content="Visualize your Accounts, Opportunities and Leads on the same Salesforce map. Polymorphic filters, distinct SVG markers, multi-currency support — €249/month for your entire team, no per-user cost.">'
)

en = en.replace(
    '<meta property="og:description" content="Plan and optimize your field sales routes directly in Salesforce. Advanced optimization, event creation, CSV export — €249/month for your entire team.">',
    '<meta property="og:description" content="Visualize your Accounts, Opportunities and Leads on the same Salesforce map. Polymorphic filters, SVG markers, multi-currency — €249/month for your entire team.">'
)

en = en.replace(
    '<meta name="twitter:description" content="Plan and optimize field sales routes directly in Salesforce. No per-user cost. €249/month for your entire team.">',
    '<meta name="twitter:description" content="Accounts, Opportunities and Leads on the same Salesforce map. Polymorphic filters, multi-currency support. No per-user cost. €249/month for your entire team.">'
)

# 2. JSON-LD featureList
en = en.replace(
    '''        "featureList": [
            "Interactive Leaflet map integrated in Salesforce",
            "Automatic route optimization",
            "Route trace on the map",
            "Automatic Salesforce event creation",
            "Dynamic and saved filters",
            "Export to Google Maps / Waze / CSV",
            "History of the last 20 routes",
            "Nearby accounts by GPS geolocation",
            "Drag-and-drop to reorder stops",
            "Unassigned appointment management",
            "Responsive mobile interface with bottom sheet",
            "Multilingual FR/EN/ES"
        ],''',
    '''        "featureList": [
            "Interactive Leaflet map integrated in Salesforce",
            "Accounts, Opportunities and Leads on the same map",
            "Polymorphic filters — filter by any field on any object",
            "Distinct SVG markers per object type (Pin=Account, Diamond=Opportunity, Circle=Lead)",
            "Auto-legend with sections per object type",
            "Multi-currency support — amounts in opportunity currency",
            "Automatic route optimization",
            "Route trace on the map",
            "Automatic Salesforce event creation",
            "Dynamic and saved filters",
            "Export to Google Maps / Waze / CSV",
            "History of the last 20 routes",
            "Nearby accounts by GPS geolocation",
            "Drag-and-drop to reorder stops",
            "Unassigned appointment management",
            "Responsive mobile interface with bottom sheet",
            "Multilingual FR/EN/ES"
        ],'''
)

# 3. COUNTDOWN BANNER — replace with v1.5 celebration banner
old_countdown_en = '''    <!-- COUNTDOWN BANNER — MULTILINGUAL SLIDER -->
    <div class="countdown-banner">
        <div class="countdown-content">
            <div class="countdown-left">
                <div class="countdown-slider" id="countdown-slider">
                    <div class="countdown-slide active">
                        <span class="countdown-label">🚀 LANCEMENT MONDIAL v1.0</span>
                        <span class="countdown-sub">Package Major • Couverture routière monde entier • 09 mars 2026</span>
                    </div>
                    <div class="countdown-slide">
                        <span class="countdown-label">🚀 WORLDWIDE LAUNCH v1.0</span>
                        <span class="countdown-sub">Major Package • Worldwide routing coverage • March 9, 2026</span>
                    </div>
                    <div class="countdown-slide">
                        <span class="countdown-label">🚀 LANZAMIENTO MUNDIAL v1.0</span>
                        <span class="countdown-sub">Paquete Major • Cobertura mundial de rutas • 9 de marzo 2026</span>
                    </div>
                </div>
            </div>
            <div class="countdown-timer" id="countdown">
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-days">--</span>
                    <span class="countdown-unit" data-fr="JOURS" data-en="DAYS" data-es="DÍAS">JOURS</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-hours">--</span>
                    <span class="countdown-unit" data-fr="HEURES" data-en="HOURS" data-es="HORAS">HEURES</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-mins">--</span>
                    <span class="countdown-unit">MIN</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-secs">--</span>
                    <span class="countdown-unit">SEC</span>
                </div>
            </div>
            <div class="countdown-right">
                <div class="countdown-slider" id="countdown-slider-right">
                    <div class="countdown-slide-right active">
                        <span class="countdown-offer">🆓 ESSAI 14 JOURS</span>
                        <span class="countdown-offer countdown-discount">🔥 -15% INSTALLATION</span>
                    </div>
                    <div class="countdown-slide-right">
                        <span class="countdown-offer">🆓 14-DAY FREE TRIAL</span>
                        <span class="countdown-offer countdown-discount">🔥 15% OFF SETUP</span>
                    </div>
                    <div class="countdown-slide-right">
                        <span class="countdown-offer">🆓 PRUEBA GRATIS 14 DÍAS</span>
                        <span class="countdown-offer countdown-discount">🔥 -15% INSTALACIÓN</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    (function(){
      // Countdown timer
      const target = new Date('2026-03-09T09:00:00+01:00').getTime();
      const langs = ['fr','en','es'];
      let langIdx = 0;

      function updateTimer(){
        const now = Date.now();
        const diff = target - now;
        if(diff <= 0){
          document.getElementById('countdown').innerHTML = '<span style="font-size:1.2rem;font-weight:800;color:#fff;">🎉 LAUNCHED!</span>';
          return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cd-days').textContent = d;
        document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
        document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
        document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
      }

      // Multilingual slider
      function rotateSlides(){
        langIdx = (langIdx + 1) % 3;
        const lang = langs[langIdx];

        // Left slides
        document.querySelectorAll('#countdown-slider .countdown-slide').forEach((s,i) => {
          s.classList.toggle('active', i === langIdx);
        });

        // Right slides
        document.querySelectorAll('#countdown-slider-right .countdown-slide-right').forEach((s,i) => {
          s.classList.toggle('active', i === langIdx);
        });

        // Timer units
        document.querySelectorAll('.countdown-unit[data-'+lang+']').forEach(u => {
          u.textContent = u.getAttribute('data-'+lang);
        });
      }

      updateTimer();
      setInterval(updateTimer, 1000);
      setInterval(rotateSlides, 4000);
    })();
    </script>'''

new_countdown_en = '''    <!-- V1.5 LAUNCH BANNER -->
    <div class="countdown-banner">
        <div class="countdown-content" style="justify-content: center; gap: 32px; flex-wrap: wrap;">
            <div class="countdown-left">
                <span class="countdown-label">🎉 v1.5 NOW AVAILABLE — Accounts, Opportunities &amp; Leads on the same map</span>
                <span class="countdown-sub" style="display:block;margin-top:4px;">Polymorphic Filters · SVG Markers · Multi-Currency · Auto-Legend</span>
            </div>
            <div class="countdown-right">
                <span class="countdown-offer">🆓 14-DAY FREE TRIAL</span>
                <span class="countdown-offer countdown-discount">🔥 15% OFF SETUP — Early Adopter Offer</span>
            </div>
        </div>
    </div>'''

en = en.replace(old_countdown_en, new_countdown_en)

# 4. HERO SUBTITLE
en = en.replace(
    '''                <p class="hero-subtitle">
                    RouteForce optimizes your field team's routes, creates Salesforce events automatically and saves them time — from day one.
                    <strong>€249/month for your entire team, no per-user cost.</strong>
                </p>''',
    '''                <p class="hero-subtitle">
                    Visualize your <strong>Accounts, Opportunities and Leads on the same map</strong>, optimize your field team's routes and create Salesforce events automatically — from day one.
                    <strong>€249/month for your entire team, no per-user cost.</strong>
                </p>'''
)

# 5. PROBLEM/SOLUTION — add 2 new items
en = en.replace(
    '''                        <li><strong>Accounts AND Leads on the same map</strong> — prospecting + retention, same route</li>
                        <li><strong>Optimal multimodal routing</strong>''',
    '''                        <li><strong>Accounts, Opportunities AND Leads on the same map</strong> — prospecting, pipeline and retention, same route</li>
                        <li><strong>Opportunities and Leads</strong> on the map — prioritize your deals by stage, forecast and value</li>
                        <li><strong>Configurable filters</strong> — by industry, sales stage, forecast category, lead type</li>
                        <li><strong>Optimal multimodal routing</strong>'''
)

# 6. FEATURES GRID — add 3 new cards
en = en.replace(
    '''                </div>
            </div>
        </div>
    </section>

    <!-- POUR QUI -->
    <section class="personas-section" id="pour-qui">
        <div class="container">
            <div class="section-header">
                <h2>Who is RouteForce for?</h2>''',
    '''                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                            <path d="M17 10l3-3M7 10l-3-3"/>
                        </svg>
                    </div>
                    <h3>Opportunities &amp; Leads on the Map</h3>
                    <p>Visualize your entire pipeline geographically. Accounts 📍, Opportunities 🔷 and Leads ⭕ on the same map with distinct SVG markers and an automatic legend per object type.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="6" x2="20" y2="6"/>
                            <line x1="4" y1="12" x2="14" y2="12"/>
                            <line x1="4" y1="18" x2="17" y2="18"/>
                            <circle cx="20" cy="12" r="2"/>
                            <circle cx="17" cy="18" r="2"/>
                        </svg>
                    </div>
                    <h3>Polymorphic Filters</h3>
                    <p>Filter by any field on any object — Industry, Stage, Forecast, Lead Status, amount, and any custom field. One unified filter interface, applicable to Account, Opportunity or Lead.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M12 6v1M12 17v1M6 12h1M17 12h1"/>
                        </svg>
                    </div>
                    <h3>Multi-Currency</h3>
                    <p>Opportunity amounts display in their native currency. International teams see each deal in the right currency — native support for all custom picklist values.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- POUR QUI -->
    <section class="personas-section" id="pour-qui">
        <div class="container">
            <div class="section-header">
                <h2>Who is RouteForce for?</h2>'''
)

# 7. ADMIN CARD — update
en = en.replace(
    '                        <li>Built for the Salesforce Account object</li>',
    '                        <li>Accounts, Opportunities and Leads — all configurable, no code required</li>'
)

# 8. SCREENSHOTS — update captions
en = en.replace(
    '''                    <div class="screenshot-caption">
                        <h3>All your accounts on a map</h3>
                        <p>Prospects, clients, leads — spot your coverage zones at a glance. Automatic color segmentation.</p>
                    </div>''',
    '''                    <div class="screenshot-caption">
                        <h3>All your records on a map</h3>
                        <p>Accounts, Opportunities, Leads — spot your coverage zones at a glance. Distinct SVG markers and automatic legend per object type.</p>
                    </div>'''
)

en = en.replace(
    '''                    <div class="screenshot-caption">
                        <h3>Route optimized in seconds</h3>
                        <p>Accounts 📍 and leads ⭐ on the same route. The algorithm finds the best visit order — you save time from day one.</p>
                    </div>''',
    '''                    <div class="screenshot-caption">
                        <h3>Route optimized in seconds</h3>
                        <p>Accounts 📍, Opportunities 🔷 and Leads ⭕ on the same route. The algorithm finds the best visit order — you save time from day one.</p>
                    </div>'''
)

# 9. COMPARISON TABLE — add row
en = en.replace(
    '''                        <tr>
                            <td>Cost per user</td>
                            <td class="highlight"><span class="check green">€0</span></td>
                            <td class="highlight"><span class="check green">€0</span></td>
                            <td class="highlight"><span class="check green">€0</span></td>
                        </tr>
                    </tbody>''',
    '''                        <tr>
                            <td>Cost per user</td>
                            <td class="highlight"><span class="check green">€0</span></td>
                            <td class="highlight"><span class="check green">€0</span></td>
                            <td class="highlight"><span class="check green">€0</span></td>
                        </tr>
                        <tr class="row-highlight">
                            <td>Accounts + Opportunities + Leads on map</td>
                            <td class="highlight"><span class="check green">✅ included</span></td>
                            <td class="highlight"><span class="check green">✅ included</span></td>
                            <td class="highlight"><span class="check green">✅ included</span></td>
                        </tr>
                        <tr>
                            <td>Salesforce Maps — Objects supported</td>
                            <td>✅ (~€75/user/mo)</td>
                            <td>✅ (~€75/user/mo)</td>
                            <td class="highlight">✅ (~€75/user/mo)</td>
                        </tr>
                    </tbody>'''
)

# 10. PRICING — Update "Turnkey" price from €5,000 to €7,500
en = en.replace(
    '                    <div class="pricing-price">\n                        <span class="price">€5,000 <small>excl. tax</small></span>\n                        <span class="price-period">one-time setup</span>',
    '                    <div class="pricing-price">\n                        <span class="price">€7,500 <small>excl. tax</small></span>\n                        <span class="price-period">one-time setup</span>'
)

# Enterprise mention
en = en.replace(
    '                        <p class="pricing-desc">Dedicated infrastructure and tailored support for multi-site organizations</p>',
    '                        <p class="pricing-desc">Dedicated infrastructure and tailored support for multi-site organizations — Opportunities, Leads, multi-currency, advanced integrations</p>'
)

# 11. FAQ — compatibility update
en = en.replace(
    'It integrates with your existing Account object.',
    'It integrates with your existing Account, Opportunity and Lead objects — natively, without special configuration.'
)

# 12. FAQ — subscription price update
en = en.replace(
    '(€3,500 excl. tax self-service, €5,000 excl. tax turnkey)',
    '(€3,500 excl. tax self-service, €7,500 excl. tax turnkey)'
)

# 13. FAQ — add new FAQ about Opportunities/Leads
old_en_faq = '''                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>What industries use RouteForce?</span>'''
new_en_faq = '''                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>Does RouteForce support Opportunities and Leads?</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Yes — since <strong>v1.5</strong>, RouteForce natively supports <strong>Account, Opportunity and Lead</strong> objects on the same map. Each object type has distinct SVG markers (Pin for Accounts, Diamond for Opportunities, Circle for Leads) and an automatic legend. <strong>Polymorphic filters</strong> let you filter by any field on any object (Industry, Stage, Forecast, Lead Status, amount, custom fields). Amounts display in each opportunity's native currency. All custom picklist values are natively supported.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>What industries use RouteForce?</span>'''
en = en.replace(old_en_faq, new_en_faq)

# 14. JSON-LD FAQ schema — update pricing
en = en.replace(
    '"text": "RouteForce works with a flat price and no per-user cost. One-time setup (from €3,500 excl. tax) then €249/month for your entire Salesforce org, regardless of the number of users."',
    '"text": "RouteForce works with a flat price and no per-user cost. One-time setup (from €2,975 excl. tax self-service, €7,500 excl. tax turnkey) then €249/month for your entire Salesforce org, regardless of the number of users."'
)

with open('en/index.html', 'w', encoding='utf-8') as f:
    f.write(en)

print("EN (en/index.html) updated ✅")


# ============================================================
# SPANISH (es/index.html) — ALL CHANGES
# ============================================================

with open('es/index.html', 'r', encoding='utf-8') as f:
    es = f.read()

# 1. META DESCRIPTION
es = es.replace(
    '<meta name="description" content="Planifique y optimice las rutas de sus comerciales directamente en Salesforce. Optimización avanzada, creación automática de eventos, exportación CSV, historial — 249€/mes para todo su equipo.">',
    '<meta name="description" content="Visualice sus Cuentas, Oportunidades y Leads en el mismo mapa Salesforce. Filtros polimórficos, marcadores SVG distintos, soporte multi-divisa — 249€/mes para todo su equipo, sin coste por usuario.">'
)

es = es.replace(
    '<meta property="og:description" content="Planifique y optimice las rutas de sus comerciales directamente en Salesforce. Optimización avanzada, creación de eventos, exportación CSV — 249€/mes para todo su equipo.">',
    '<meta property="og:description" content="Visualice sus Cuentas, Oportunidades y Leads en el mismo mapa Salesforce. Filtros polimórficos, marcadores SVG, multi-divisa — 249€/mes para todo su equipo.">'
)

es = es.replace(
    '<meta name="twitter:description" content="Planifique y optimice rutas comerciales directamente en Salesforce. Sin coste por usuario. 249€/mes para todo su equipo.">',
    '<meta name="twitter:description" content="Cuentas, Oportunidades y Leads en el mismo mapa Salesforce. Filtros polimórficos, multi-divisa. Sin coste por usuario. 249€/mes para todo su equipo.">'
)

# 2. JSON-LD featureList
es = es.replace(
    '''        "featureList": [
            "Mapa interactivo Leaflet integrado en Salesforce",
            "Optimización automática de rutas",
            "Trazado de itinerario en el mapa",
            "Creación automática de eventos Salesforce",
            "Filtros dinámicos y guardados",
            "Exportación Google Maps / Waze / CSV",
            "Historial de las últimas 20 rutas",
            "Cuentas cercanas por geolocalización GPS",
            "Drag-and-drop para reordenar paradas",
            "Gestión de citas no asignadas",
            "Interfaz móvil responsive con bottom sheet",
            "Multilingüe FR/EN/ES"
        ],''',
    '''        "featureList": [
            "Mapa interactivo Leaflet integrado en Salesforce",
            "Cuentas, Oportunidades y Leads en el mismo mapa",
            "Filtros polimórficos — filtrar por cualquier campo en cualquier objeto",
            "Marcadores SVG distintos por tipo de objeto (Pin=Cuenta, Diamante=Oportunidad, Círculo=Lead)",
            "Leyenda automática con secciones por tipo de objeto",
            "Soporte multi-divisa — importes en la divisa de la oportunidad",
            "Optimización automática de rutas",
            "Trazado de itinerario en el mapa",
            "Creación automática de eventos Salesforce",
            "Filtros dinámicos y guardados",
            "Exportación Google Maps / Waze / CSV",
            "Historial de las últimas 20 rutas",
            "Cuentas cercanas por geolocalización GPS",
            "Drag-and-drop para reordenar paradas",
            "Gestión de citas no asignadas",
            "Interfaz móvil responsive con bottom sheet",
            "Multilingüe FR/EN/ES"
        ],'''
)

# 3. COUNTDOWN BANNER — same HTML as FR/EN
old_countdown_es = '''    <!-- COUNTDOWN BANNER — MULTILINGUAL SLIDER -->
    <div class="countdown-banner">
        <div class="countdown-content">
            <div class="countdown-left">
                <div class="countdown-slider" id="countdown-slider">
                    <div class="countdown-slide active">
                        <span class="countdown-label">🚀 LANCEMENT MONDIAL v1.0</span>
                        <span class="countdown-sub">Package Major • Couverture routière monde entier • 09 mars 2026</span>
                    </div>
                    <div class="countdown-slide">
                        <span class="countdown-label">🚀 WORLDWIDE LAUNCH v1.0</span>
                        <span class="countdown-sub">Major Package • Worldwide routing coverage • March 9, 2026</span>
                    </div>
                    <div class="countdown-slide">
                        <span class="countdown-label">🚀 LANZAMIENTO MUNDIAL v1.0</span>
                        <span class="countdown-sub">Paquete Major • Cobertura mundial de rutas • 9 de marzo 2026</span>
                    </div>
                </div>
            </div>
            <div class="countdown-timer" id="countdown">
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-days">--</span>
                    <span class="countdown-unit" data-fr="JOURS" data-en="DAYS" data-es="DÍAS">JOURS</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-hours">--</span>
                    <span class="countdown-unit" data-fr="HEURES" data-en="HOURS" data-es="HORAS">HEURES</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-mins">--</span>
                    <span class="countdown-unit">MIN</span>
                </div>
                <div class="countdown-sep">:</div>
                <div class="countdown-block">
                    <span class="countdown-num" id="cd-secs">--</span>
                    <span class="countdown-unit">SEC</span>
                </div>
            </div>
            <div class="countdown-right">
                <div class="countdown-slider" id="countdown-slider-right">
                    <div class="countdown-slide-right active">
                        <span class="countdown-offer">🆓 ESSAI 14 JOURS</span>
                        <span class="countdown-offer countdown-discount">🔥 -15% INSTALLATION</span>
                    </div>
                    <div class="countdown-slide-right">
                        <span class="countdown-offer">🆓 14-DAY FREE TRIAL</span>
                        <span class="countdown-offer countdown-discount">🔥 15% OFF SETUP</span>
                    </div>
                    <div class="countdown-slide-right">
                        <span class="countdown-offer">🆓 PRUEBA GRATIS 14 DÍAS</span>
                        <span class="countdown-offer countdown-discount">🔥 -15% INSTALACIÓN</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
    (function(){
      // Countdown timer
      const target = new Date('2026-03-09T09:00:00+01:00').getTime();
      const langs = ['fr','en','es'];
      let langIdx = 0;

      function updateTimer(){
        const now = Date.now();
        const diff = target - now;
        if(diff <= 0){
          document.getElementById('countdown').innerHTML = '<span style="font-size:1.2rem;font-weight:800;color:#fff;">🎉 LAUNCHED!</span>';
          return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('cd-days').textContent = d;
        document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
        document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
        document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
      }

      // Multilingual slider
      function rotateSlides(){
        langIdx = (langIdx + 1) % 3;
        const lang = langs[langIdx];

        // Left slides
        document.querySelectorAll('#countdown-slider .countdown-slide').forEach((s,i) => {
          s.classList.toggle('active', i === langIdx);
        });

        // Right slides
        document.querySelectorAll('#countdown-slider-right .countdown-slide-right').forEach((s,i) => {
          s.classList.toggle('active', i === langIdx);
        });

        // Timer units
        document.querySelectorAll('.countdown-unit[data-'+lang+']').forEach(u => {
          u.textContent = u.getAttribute('data-'+lang);
        });
      }

      updateTimer();
      setInterval(updateTimer, 1000);
      setInterval(rotateSlides, 4000);
    })();
    </script>'''

new_countdown_es = '''    <!-- V1.5 LAUNCH BANNER -->
    <div class="countdown-banner">
        <div class="countdown-content" style="justify-content: center; gap: 32px; flex-wrap: wrap;">
            <div class="countdown-left">
                <span class="countdown-label">🎉 v1.5 DISPONIBLE — Cuentas, Oportunidades &amp; Leads en el mismo mapa</span>
                <span class="countdown-sub" style="display:block;margin-top:4px;">Filtros Polimórficos · Marcadores SVG · Multi-Divisa · Leyenda Automática</span>
            </div>
            <div class="countdown-right">
                <span class="countdown-offer">🆓 PRUEBA GRATIS 14 DÍAS</span>
                <span class="countdown-offer countdown-discount">🔥 -15% INSTALACIÓN — Oferta early adopter</span>
            </div>
        </div>
    </div>'''

es = es.replace(old_countdown_es, new_countdown_es)

# 4. HERO SUBTITLE
es = es.replace(
    '''                <p class="hero-subtitle">
                    RouteForce optimiza los itinerarios de su equipo de campo, crea eventos en Salesforce automáticamente y les ahorra tiempo — desde el primer día.
                    <strong>249€/mes para todo su equipo, sin coste por usuario.</strong>
                </p>''',
    '''                <p class="hero-subtitle">
                    Visualice sus <strong>Cuentas, Oportunidades y Leads en el mismo mapa</strong>, optimice los itinerarios de su equipo de campo y cree eventos Salesforce automáticamente — desde el primer día.
                    <strong>249€/mes para todo su equipo, sin coste por usuario.</strong>
                </p>'''
)

# 5. PROBLEM/SOLUTION
es = es.replace(
    '''                        <li><strong>Cuentas Y Leads en el mismo mapa</strong> — prospección + fidelización, misma ruta</li>
                        <li><strong>Enrutamiento multimodal óptimo</strong>''',
    '''                        <li><strong>Cuentas, Oportunidades Y Leads en el mismo mapa</strong> — prospección, pipeline y fidelización, misma ruta</li>
                        <li><strong>Oportunidades y Leads</strong> en el mapa — priorice sus deals por etapa, forecast y valor</li>
                        <li><strong>Filtros configurables</strong> — por sector, etapa de venta, forecast, tipo de lead</li>
                        <li><strong>Enrutamiento multimodal óptimo</strong>'''
)

# 6. FEATURES GRID — add 3 new cards
# Find the end of features grid in ES - different structure (has unclosed div)
# Let me search for the POUR QUI section
es = es.replace(
    '''    <!-- POUR QUI -->
    <section class="personas-section" id="pour-qui">
        <div class="container">
            <div class="section-header">
                <h2>¿Para quién es RouteForce?</h2>''',
    '''    <!-- FEATURES NEW V1.5 -->
    <section class="features-section" id="features-v15" style="background:#f8fafc;padding-top:0;">
        <div class="container" style="padding-top:0;">
            <div class="features-grid" style="padding-top:0;">
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                            <path d="M17 10l3-3M7 10l-3-3"/>
                        </svg>
                    </div>
                    <h3>Oportunidades &amp; Leads en el Mapa</h3>
                    <p>Visualice todo su pipeline geográficamente. Cuentas 📍, Oportunidades 🔷 y Leads ⭕ en el mismo mapa con marcadores SVG distintos y una leyenda automática por tipo de objeto.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="6" x2="20" y2="6"/>
                            <line x1="4" y1="12" x2="14" y2="12"/>
                            <line x1="4" y1="18" x2="17" y2="18"/>
                            <circle cx="20" cy="12" r="2"/>
                            <circle cx="17" cy="18" r="2"/>
                        </svg>
                    </div>
                    <h3>Filtros Polimórficos</h3>
                    <p>Filtre por cualquier campo en cualquier objeto — Industry, Stage, Forecast, Lead Status, importe, y cualquier campo custom. Una interfaz de filtro unificada para Account, Opportunity o Lead.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M12 6v1M12 17v1M6 12h1M17 12h1"/>
                        </svg>
                    </div>
                    <h3>Multi-Divisa</h3>
                    <p>Los importes de las oportunidades se muestran en su divisa nativa. Los equipos internacionales ven cada deal en la divisa correcta — soporte nativo de todas las listas de selección de valores custom.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- POUR QUI -->
    <section class="personas-section" id="pour-qui">
        <div class="container">
            <div class="section-header">
                <h2>¿Para quién es RouteForce?</h2>'''
)

# 7. ADMIN CARD — update
es = es.replace(
    '                        <li>Diseñado para el objeto Account de Salesforce</li>',
    '                        <li>Cuentas, Oportunidades y Leads — todo configurable sin código</li>'
)

# 8. SCREENSHOTS — update captions
es = es.replace(
    '''                    <div class="screenshot-caption">
                        <h3>Todas sus cuentas en un mapa</h3>
                        <p>Prospectos, clientes, leads — identifique sus zonas de cobertura de un vistazo. Segmentación por colores automática.</p>
                    </div>''',
    '''                    <div class="screenshot-caption">
                        <h3>Todos sus registros en un mapa</h3>
                        <p>Cuentas, Oportunidades, Leads — identifique sus zonas de cobertura de un vistazo. Marcadores SVG distintos y leyenda automática por tipo de objeto.</p>
                    </div>'''
)

es = es.replace(
    '''                    <div class="screenshot-caption">
                        <h3>Ruta optimizada en segundos</h3>
                        <p>Cuentas 📍 y leads ⭐ en el mismo itinerario. El algoritmo encuentra el mejor orden de visita — ahorre tiempo desde el primer día.</p>
                    </div>''',
    '''                    <div class="screenshot-caption">
                        <h3>Ruta optimizada en segundos</h3>
                        <p>Cuentas 📍, Oportunidades 🔷 y Leads ⭕ en el mismo itinerario. El algoritmo encuentra el mejor orden de visita — ahorre tiempo desde el primer día.</p>
                    </div>'''
)

# 9. COMPARISON TABLE — add row
es = es.replace(
    '''                        <tr>
                            <td>Coste por usuario</td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                        </tr>
                    </tbody>''',
    '''                        <tr>
                            <td>Coste por usuario</td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                            <td class="highlight"><span class="check green">0 €</span></td>
                        </tr>
                        <tr class="row-highlight">
                            <td>Cuentas + Oportunidades + Leads en el mapa</td>
                            <td class="highlight"><span class="check green">✅ incluido</span></td>
                            <td class="highlight"><span class="check green">✅ incluido</span></td>
                            <td class="highlight"><span class="check green">✅ incluido</span></td>
                        </tr>
                        <tr>
                            <td>Salesforce Maps — Objetos soportados</td>
                            <td>✅ (~75€/usuario/mes)</td>
                            <td>✅ (~75€/usuario/mes)</td>
                            <td class="highlight">✅ (~75€/usuario/mes)</td>
                        </tr>
                    </tbody>'''
)

# 10. PRICING — Update "Llave en Mano" from 5.000€ to 7.500€
es = es.replace(
    '                    <div class="pricing-price">\n                        <span class="price">5.000€ <small>sin IVA</small></span>\n                        <span class="price-period">instalación única</span>',
    '                    <div class="pricing-price">\n                        <span class="price">7.500€ <small>sin IVA</small></span>\n                        <span class="price-period">instalación única</span>'
)

# Enterprise mention
es = es.replace(
    '                        <p class="pricing-desc">Infraestructura dedicada y acompañamiento a medida para organizaciones multi-sede</p>',
    '                        <p class="pricing-desc">Infraestructura dedicada y acompañamiento a medida para organizaciones multi-sede — Oportunidades, Leads, multi-divisa, integraciones avanzadas</p>'
)

# 11. FAQ — compatibility update
es = es.replace(
    'Se integra con su objeto Account existente.',
    'Se integra con sus objetos Account, Opportunity y Lead — de forma nativa, sin configuración especial.'
)

# 12. FAQ — subscription price update
es = es.replace(
    '(3.500€ sin IVA en autónomo, 5.000€ sin IVA llave en mano)',
    '(3.500€ sin IVA en autónomo, 7.500€ sin IVA llave en mano)'
)

# 13. FAQ — add new FAQ
old_es_faq = '''                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>¿Qué sectores utilizan RouteForce?</span>'''
new_es_faq = '''                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>¿RouteForce soporta oportunidades y leads?</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="faq-answer">
                        <p>Sí — desde la <strong>v1.5</strong>, RouteForce soporta nativamente los objetos <strong>Account, Opportunity y Lead</strong> en el mismo mapa. Cada tipo de objeto tiene marcadores SVG distintos (Pin para Cuentas, Diamante para Oportunidades, Círculo para Leads) y una leyenda automática. Los <strong>filtros polimórficos</strong> permiten filtrar por cualquier campo en cualquier objeto (Industry, Stage, Forecast, Lead Status, importe, campos custom). Los importes se muestran en la divisa nativa de cada oportunidad. Todas las listas de selección personalizadas están soportadas nativamente.</p>
                    </div>
                </div>
                <div class="faq-item">
                    <button class="faq-question" aria-expanded="false">
                        <span>¿Qué sectores utilizan RouteForce?</span>'''
es = es.replace(old_es_faq, new_es_faq)

with open('es/index.html', 'w', encoding='utf-8') as f:
    f.write(es)

print("ES (es/index.html) updated ✅")
print("\nAll 3 files updated successfully!")
