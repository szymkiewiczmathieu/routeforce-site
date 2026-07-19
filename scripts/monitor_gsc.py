#!/usr/bin/env python3
"""Monitor Google Search Console: canonical, coverage, and key page status."""
import os
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

KEY_PAGES = [
    "https://gettourvia.com/",
    "https://gettourvia.com/pricing.html",
    "https://gettourvia.com/salesforce-route-planning.html",
    "https://gettourvia.com/field-sales-route-optimization.html",
    "https://gettourvia.com/native-integration-salesforce.html",
    "https://gettourvia.com/blog/salesforce-maps-alternatives-compared.html",
    "https://gettourvia.com/blog/routeforce-becomes-tourvia.html",
]


def inspect_url(service, url):
    try:
        result = service.urlInspection().index().inspect(
            body={"inspectionUrl": url, "siteUrl": "sc-domain:gettourvia.com"}
        ).execute()
        status = result.get("inspectionResult", {}).get("indexStatusResult", {})
        return {
            "url": url,
            "verdict": status.get("verdict"),
            "state": status.get("coverageState"),
            "last_crawl": status.get("lastCrawlTime"),
            "google_canonical": status.get("googleCanonical"),
            "user_canonical": status.get("userCanonical"),
        }
    except Exception as e:
        return {"url": url, "error": str(e)}


def get_performance_summary(service):
    end = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")
    start = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
    try:
        resp = service.searchanalytics().query(
            siteUrl="sc-domain:gettourvia.com",
            body={"startDate": start, "endDate": end, "dimensions": ["date"], "rowLimit": 30}
        ).execute()
        rows = resp.get("rows", [])
        if not rows:
            return None
        return {
            "clicks": sum(r["clicks"] for r in rows),
            "impressions": sum(r["impressions"] for r in rows),
            "avg_ctr": sum(r["ctr"] for r in rows) / len(rows),
            "avg_position": sum(r["position"] for r in rows) / len(rows),
            "days": len(rows),
        }
    except Exception as e:
        return {"error": str(e)}


def main():
    creds = Credentials.from_authorized_user_file('/home/ubuntu/.hermes/google_token.json')
    service = build('searchconsole', 'v1', credentials=creds)

    print("## 📡 Monitoring GSC – gettourvia.com")
    print(f"\nDate: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")

    print("\n### Inspection URL (canonical + indexation)")
    canonical_issues = []
    for url in KEY_PAGES:
        r = inspect_url(service, url)
        if "error" in r:
            print(f"- {url}: ERREUR {r['error']}")
        else:
            canon_ok = r['google_canonical'] == r['user_canonical'] == url
            icon = "✅" if canon_ok and r['verdict'] == 'PASS' else "⚠️"
            print(f"{icon} {url}")
            print(f"   Verdict: {r['verdict']}, State: {r['state']}")
            print(f"   Canonical Google: {r['google_canonical']}")
            if not canon_ok:
                canonical_issues.append((url, r['google_canonical'], r['user_canonical']))

    if canonical_issues:
        print("\n🚨 Problèmes de canonical détectés:")
        for url, g, u in canonical_issues:
            print(f"  - {url}: Google choisit {g} au lieu de {u}")

    print("\n### Performance (30 jours)")
    perf = get_performance_summary(service)
    if perf:
        if "error" in perf:
            print(f"Erreur: {perf['error']}")
        elif perf.get("days"):
            print(f"- Clics: {perf['clicks']:.0f}")
            print(f"- Impressions: {perf['impressions']:.0f}")
            print(f"- CTR moyen: {perf['avg_ctr']*100:.2f}%")
            print(f"- Position moyenne: {perf['avg_position']:.1f}")
            print(f"- Jours avec données: {perf['days']}")
        else:
            print("Pas encore de données (délai Google)")
    else:
        print("Pas encore de données (délai Google)")


if __name__ == "__main__":
    main()
