#!/usr/bin/env python3
"""Daily SEO report + reindexing for gettourvia.com.
Cloudflare Analytics requires a separate Zone Analytics token that we do not have yet.
This version reports GSC + sitemap indexing, which works with the current Google OAuth token."""
import os
import re
import requests
import sys
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SITEMAP_URL = "https://gettourvia.com/sitemap.xml"


def get_gsc_metrics(site, start_date, end_date):
    creds = Credentials.from_authorized_user_file('/home/ubuntu/.hermes/google_token.json')
    service = build('searchconsole', 'v1', credentials=creds)
    try:
        response = service.searchanalytics().query(
            siteUrl=site,
            body={
                "startDate": start_date,
                "endDate": end_date,
                "dimensions": ["date"],
                "rowLimit": 10,
            }
        ).execute()
        rows = response.get("rows", [])
        if not rows:
            return None
        total = {
            "clicks": sum(r["clicks"] for r in rows),
            "impressions": sum(r["impressions"] for r in rows),
            "ctr": sum(r["ctr"] for r in rows) / len(rows) if rows else 0,
            "position": sum(r["position"] for r in rows) / len(rows) if rows else 0,
        }
        return total
    except HttpError as e:
        print(f"GSC error ({site}): {e}", file=sys.stderr)
        return None


def get_sitemap_urls():
    try:
        text = requests.get(SITEMAP_URL, timeout=30).text
        return re.findall(r'<loc>([^\s]+)</loc>', text)
    except Exception as e:
        print(f"Sitemap error: {e}", file=sys.stderr)
        return []


def submit_indexing_urls(urls):
    creds = Credentials.from_authorized_user_file('/home/ubuntu/.hermes/google_token.json')
    try:
        service = build('indexing', 'v3', credentials=creds)
    except Exception as e:
        print(f"Indexing API init error: {e}", file=sys.stderr)
        return 0, 0
    success = 0
    errors = 0
    for url in urls:
        try:
            service.urlNotifications().publish(body={"url": url, "type": "URL_UPDATED"}).execute()
            success += 1
        except HttpError as e:
            if e.resp.status == 429:
                break
            errors += 1
    return success, errors


def main():
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
    gsc_end = (datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")
    gsc_start = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")

    gsc_new = get_gsc_metrics("sc-domain:gettourvia.com", gsc_start, gsc_end)
    gsc_old = get_gsc_metrics("sc-domain:routeforce.app", gsc_start, gsc_end)

    urls = get_sitemap_urls()
    indexed_success, indexed_errors = 0, 0
    if urls:
        indexed_success, indexed_errors = submit_indexing_urls(urls)

    lines = [f"## 📊 Rapport gettourvia.com – {yesterday}"]

    lines.extend(["", "**Cloudflare** : données analytiques non disponibles avec le token actuel (besoin Zone Analytics Read)."])

    lines.extend(["", "**Google Search Console** (30 derniers jours) :"])
    if gsc_new:
        lines.append(
            f"- gettourvia.com : {gsc_new['clicks']:.0f} clics / {gsc_new['impressions']:.0f} impressions / CTR {gsc_new['ctr']*100:.2f}% / pos {gsc_new['position']:.1f}"
        )
    else:
        lines.append("- gettourvia.com : aucune donnée (délai de collecte Google)")

    if gsc_old:
        lines.append(
            f"- routeforce.app : {gsc_old['clicks']:.0f} clics / {gsc_old['impressions']:.0f} impressions / CTR {gsc_old['ctr']*100:.2f}% / pos {gsc_old['position']:.1f}"
        )
    else:
        lines.append("- routeforce.app : aucune donnée")

    lines.extend([
        "",
        f"**Indexation** : {len(urls)} URLs dans le sitemap, {indexed_success} soumises à l'API Google, {indexed_errors} erreurs",
    ])

    print("\n".join(lines))


if __name__ == "__main__":
    main()
