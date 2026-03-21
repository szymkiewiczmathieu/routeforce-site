# INDEXING-WORKFLOW.md — RouteForce

## Objectif
Garantir qu'après chaque déploiement public du site `routeforce.app`, l'indexation soit notifiée **systématiquement** sans dépendre d'un oubli humain.

---

## Principe
La fiabilité repose sur 3 couches :

1. **Règle écrite** — le workflow est documenté
2. **Script unique** — la notification passe par une seule commande reproductible
3. **Rattrapage automatique** — un cron vérifie qu'aucun déploiement n'a été oublié

---

## Définition du “done” après déploiement
Un déploiement public site n'est considéré comme terminé que si :

- `sitemap.xml` est à jour
- les URLs publiques attendues sont présentes dans le sitemap
- la notification d'indexation a été envoyée
- une trace d'exécution a été enregistrée

---

## Architecture recommandée

### 1. Script principal
Fichier recommandé :
- `scripts/notify-indexing.py`

### 2. Historique d'exécution
Fichier recommandé :
- `logs/indexing-history.json`

### 3. Détection de changement
Source minimale :
- hash de `sitemap.xml`
- ou dernier commit déployé

---

## Comportement attendu du script

### Entrées
Le script doit accepter au moins :
- `--sitemap https://routeforce.app/sitemap.xml`
- `--site routeforce.app`
- `--mode sitemap|urls`
- `--urls <fichier.txt>` (optionnel)
- `--dry-run`

### Étapes
1. Charger le sitemap ou la liste d'URLs
2. Vérifier que les URLs sont publiques, en HTTPS, sur `routeforce.app`
3. Dédupliquer
4. Notifier les moteurs cibles
5. Enregistrer le résultat dans l'historique
6. Sortir un code retour clair

### Sorties attendues
- statut global `OK` / `PARTIAL` / `FAIL`
- nombre d'URLs soumises
- moteurs contactés
- erreurs éventuelles
- timestamp UTC
- hash du sitemap utilisé

---

## Moteurs / canaux à couvrir
Version MVP :
- **IndexNow**
- **Bing Webmaster / Bing via IndexNow**

Version étendue :
- GSC sitemap ping / soumission si disponible
- autres moteurs supportés par IndexNow

---

## Règles de sécurité / qualité
- ne jamais soumettre d'URL non publique
- ne jamais soumettre d'environnement local / staging
- refuser `localhost`, IPs, URLs non HTTPS
- loguer les erreurs sans bloquer silencieusement
- si le sitemap est vide ou invalide → `FAIL`
- si un moteur échoue mais pas les autres → `PARTIAL`

---

## Historique d'exécution recommandé
Format JSON conseillé :

```json
{
  "timestamp": "2026-03-21T20:00:00Z",
  "site": "routeforce.app",
  "sitemap": "https://routeforce.app/sitemap.xml",
  "sitemapHash": "sha256:...",
  "submittedUrlCount": 28,
  "engines": {
    "indexnow": "ok",
    "bing": "ok"
  },
  "status": "OK",
  "commit": "abc1234"
}
```

---

## Déclenchement recommandé

### Niveau 1 — manuel fiable
Après push site public :
1. vérifier `sitemap.xml`
2. lancer `notify-indexing.py`
3. vérifier le log

### Niveau 2 — cron de rattrapage
Créer un cron qui :
1. lit le dernier hash de `sitemap.xml`
2. compare avec le dernier hash notifié dans `logs/indexing-history.json`
3. si différent → lance `notify-indexing.py`
4. enregistre le résultat

### Niveau 3 — idéal
Déclenchement post-déploiement + cron de rattrapage en secours.

---

## Cron recommandé
Nom suggéré :
- `routeforce-site-indexing-check`

Fréquence suggérée :
- toutes les 30 minutes
- ou toutes les heures

Logique :
- si `sitemap.xml` inchangé depuis la dernière notif → ne rien faire
- si `sitemap.xml` a changé → notifier
- si la dernière notif est en échec → retenter avec backoff simple

---

## Message de sortie recommandé

### Succès
- `✅ Indexation notifiée — 28 URLs — IndexNow OK — hash sitemap abc123`

### Partiel
- `⚠️ Indexation partielle — 28 URLs — IndexNow OK — Bing FAIL`

### Échec
- `❌ Indexation échouée — sitemap invalide ou aucun moteur notifié`

---

## Workflow opératoire RouteForce
Après chaque déploiement important du site :
1. push sur `main`
2. vérifier publication live
3. vérifier `sitemap.xml`
4. lancer la notification d'indexation
5. archiver le run
6. si pas de trace → le cron de rattrapage prend le relais

---

## Décision
Pour RouteForce, on implémente d'abord un **MVP simple et robuste** :
- script unique
- log d'exécution
- cron de rattrapage

Pas d'usine à gaz multi-sites tant qu'on n'a pas validé le process sur `routeforce.app`.
