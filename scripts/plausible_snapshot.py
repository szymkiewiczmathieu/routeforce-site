#!/usr/bin/env python3
"""
Plausible Analytics 30-day snapshot for RouteForce site.

Pulls top pages, sources, and aggregate stats from the Plausible API.
Outputs a markdown summary to stdout (suitable for cron piping).

Required env vars:
  PLAUSIBLE_API_HOST  — e.g. https://analytics.routeforce.app
  PLAUSIBLE_API_KEY   — your Plausible API key (read-only is fine)
  PLAUSIBLE_SITE_ID   — e.g. routeforce.app

Usage:
  python3 scripts/plausible_snapshot.py
"""

import json
import os
import sys
from datetime import date, timedelta
from urllib.request import Request, urlopen
from urllib.error import HTTPError

API_HOST = os.environ.get("PLAUSIBLE_API_HOST", "").rstrip("/")
API_KEY = os.environ.get("PLAUSIBLE_API_KEY", "")
SITE_ID = os.environ.get("PLAUSIBLE_SITE_ID", "routeforce.app")

if not API_HOST or not API_KEY:
    print("ERROR: PLAUSIBLE_API_HOST and PLAUSIBLE_API_KEY must be set.", file=sys.stderr)
    sys.exit(1)

PERIOD_END = date.today().isoformat()
PERIOD_START = (date.today() - timedelta(days=30)).isoformat()

HEADERS = {"Authorization": f"Bearer {API_KEY}"}


def api_get(path, params=None):
    qs = f"site_id={SITE_ID}&period=custom&date={PERIOD_START},{PERIOD_END}"
    if params:
        qs += "&" + params
    url = f"{API_HOST}{path}?{qs}"
    req = Request(url, headers=HEADERS)
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        print(f"API error {e.code}: {e.read().decode()}", file=sys.stderr)
        sys.exit(1)


def main():
    # Aggregate stats
    agg = api_get("/api/v1/stats/aggregate", "metrics=visitors,pageviews,bounce_rate,visit_duration")
    results = agg.get("results", {})
    visitors = results.get("visitors", {}).get("value", "N/A")
    pageviews = results.get("pageviews", {}).get("value", "N/A")
    bounce = results.get("bounce_rate", {}).get("value", "N/A")
    duration = results.get("visit_duration", {}).get("value", "N/A")

    # Top pages
    pages = api_get("/api/v1/stats/breakdown", "property=event:page&limit=15&metrics=visitors,pageviews")
    page_rows = pages.get("results", [])

    # Top sources
    sources = api_get("/api/v1/stats/breakdown", "property=visit:source&limit=10&metrics=visitors")
    source_rows = sources.get("results", [])

    # Output
    print(f"# Plausible snapshot: {PERIOD_START} to {PERIOD_END}")
    print()
    print(f"- Visitors: {visitors}")
    print(f"- Pageviews: {pageviews}")
    print(f"- Bounce rate: {bounce}%")
    print(f"- Avg visit duration: {duration}s")
    print()

    print("## Top pages")
    print("| Page | Visitors | Pageviews |")
    print("|------|----------|-----------|")
    for row in page_rows:
        print(f"| {row.get('page', '?')} | {row.get('visitors', 0)} | {row.get('pageviews', 0)} |")
    print()

    print("## Top sources")
    print("| Source | Visitors |")
    print("|--------|----------|")
    for row in source_rows:
        print(f"| {row.get('source', '(direct)')} | {row.get('visitors', 0)} |")


if __name__ == "__main__":
    main()
