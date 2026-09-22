# FR SITE SHELL — gettourvia.com/fr/
# Règles de coquille obligatoires pour toute page /fr/*.html
# Le design (classes, ids, structure) est IDENTIQUE à la page EN source.

## <html> et <head>
- `<html lang="fr">`
- `<meta name="robots" content="index, follow">`
- description meta traduite (150-160 car.)
- canonical : `https://gettourvia.com/fr/<slug>` (AUTO-RÉFÉRENCÉ, jamais vers la page EN)
- hreflang, 3 tags exactement :
  `<link rel="alternate" hreflang="fr" href="https://gettourvia.com/fr/<slug>"/>`
  `<link rel="alternate" hreflang="en" href="https://gettourvia.com/<en-equivalent>"/>`
  `<link rel="alternate" hreflang="x-default" href="https://gettourvia.com/<en-equivalent>"/>`
- `og:locale` = `fr_FR`; og:title/og:description/twitter traduits; og:url = canonical FR
- JSON-LD : même graphe que la page EN, textes traduits, `"inLanguage": "fr"` sur WebPage ;
  FAQPage : questions/réponses traduites et STRICTEMENT identiques à la FAQ visible.
- Conserver : scripts analytics, fonts, css (chemins absolus `/assets/...`), preload images.

## Header (labels FR)
- brand link → `/fr/` ; `<b>Tourvia</b><small>anciennement RouteForce</small>`
- nav-main :
  - homepage FR : Journée terrain `#day-in-the-field` · Fonctionnalités `#features` · Produit `#showcase` · Tarifs `#pricing` · Cas d'usage `/fr/cas-d-usage.html` · Blog `/blog/` · Docs `/docs/`
  - pages FR secondaires : mêmes libellés mais ancres en absolu `/fr/#day-in-the-field` etc.
- head-right :
  - head-link AppExchange : `Disponible sur AppExchange`
  - head-cta (btn-primary) : `Démarrer l'essai 30 jours`
- mobile-menu : mêmes entrées + `Contact` → `/fr/#contact`

## Footer (labels FR)
- foot-brand texte : « Package managé Salesforce pour la planification de tournées et l'exécution terrain. Tourvia est le nouveau nom de RouteForce. » + CTA `Disponible sur AppExchange`
- Colonne Produit : Fonctionnalités `/fr/#features` · Tarifs `/fr/tarifs.html` · Cas d'usage `/fr/cas-d-usage.html` · Intégration `/native-integration-salesforce.html` (page EN, garder le href) · Comparatif `/compare.html` (page EN)
- Colonne Ressources : Blog `/blog/` · Docs `/docs/` · Outils gratuits `/tools.html` · Guide d'installation `/docs/setup-guide.html` · Guide utilisateur `/docs/user-guide-fr.html` · Guide de configuration `/docs/configuration-guide.html`
- Colonne Entreprise : Contact `mailto:contact@gettourvia.com` · Confidentialité `/docs/privacy.html` · Conditions `/docs/terms.html` · Mentions légales `/docs/mentions-legales.html` · CGV `/docs/cgv.html` · DPA `/docs/dpa.html` · Status (uptimerobot, inchangé)
- foot-bottom, 3 spans :
  `<span>&copy; 2026 SKZ Consulting · partenaire ISV Salesforce.</span>`
  `<span>Package managé Salesforce édité par SKZ Consulting, partenaire ISV Salesforce, distribué sur la Salesforce AppExchange. Salesforce ne soutient ni ne recommande Tourvia.</span>`
  `<span>Langue : Français · <a href="/<en-equivalent>" hreflang="en" lang="en">English</a></span>`

## Règles de contenu
- Ancres `id` INCHANGÉES (même valeurs que la page EN : `day-in-the-field`, `features`, `showcase`, `pricing`, `contact`…).
- Classes CSS inchangées. Structure HTML identique, seul le texte visible change.
- Vouvoiement. Ton direct, concret, zéro hype. Pas d'émojis.
- Prix : « 30 € HT par utilisateur et par mois, facturé mensuellement, soit 360 € HT par utilisateur et par an ».
- CTA principal : `Disponible sur AppExchange` / `Démarrer l'essai 30 jours` ; secondaire selon page.
- Interdit : « Dans un monde en constante évolution », « il est important de noter », « n'hésitez pas », « afin de » en boucle, « plongée en profondeur », « tirer parti de » systématique. Privilégier des verbes directs.
