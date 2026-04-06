#!/usr/bin/env python3
"""
Google Search Console health probe for RouteForce site.

Pulls top queries, pages, and aggregate click/impression data
from the GSC API using a service account.

Required env vars:
  GSC_SERVICE_ACCOUNT_JSON — path to the service account JSON key file
  GSC_SITE_URL             — e.g. https://routeforce.app/ (must match GSC property)

Optional:
  GSC_DAYS — number of days to look back (default: 28)

Dependencies:
  pip install google-auth google-auth-httplib2 google-api-python-client

Usage:
  python3 scripts/gsc_probe.py
"""

import json
import os
import sys
from datetime import date, timedelta

# Default path to service account key if env var is not set
_default_sa = os.path.expanduser("~/.openclaw/secrets/gsc-mcp-routeforce.json")
SA_KEY_PATH = os.environ.get("GSC_SERVICE_ACCOUNT_JSON", _default_sa if os.path.isfile(_default_sa) else "")
SITE_URL = os.environ.get("GSC_SITE_URL", "sc-domain:routeforce.app")
DAYS = int(os.environ.get("GSC_DAYS", "28"))

if not SA_KEY_PATH:
    print("ERROR: GSC_SERVICE_ACCOUNT_JSON must point to a service account key file.", file=sys.stderr)
    sys.exit(1)

if not os.path.isfile(SA_KEY_PATH):
    print(f"ERROR: Service account key not found at {SA_KEY_PATH}", file=sys.stderr)
    sys.exit(1)

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    print("ERROR: Missing dependencies. Run: pip install google-auth google-auth-httplib2 google-api-python-client", file=sys.stderr)
    sys.exit(1)

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
END_DATE = (date.today() - timedelta(days=3)).isoformat()  # GSC data has ~3 day lag
START_DATE = (date.today() - timedelta(days=DAYS + 3)).isoformat()


def get_service():
    creds = service_account.Credentials.from_service_account_file(SA_KEY_PATH, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=creds)


def query_gsc(service, dimensions, row_limit=20):
    body = {
        "startDate": START_DATE,
        "endDate": END_DATE,
        "dimensions": dimensions,
        "rowLimit": row_limit,
    }
    resp = service.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
    return resp.get("rows", [])


def main():
    service = get_service()

    # Top queries
    query_rows = query_gsc(service, ["query"], row_limit=25)
    # Top pages
    page_rows = query_gsc(service, ["page"], row_limit=15)

    # Aggregate
    total_clicks = sum(r.get("clicks", 0) for r in query_rows)
    total_impressions = sum(r.get("impressions", 0) for r in query_rows)
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions else 0

    print(f"# GSC probe: {START_DATE} to {END_DATE}")
    print()
    print(f"- Total clicks (top 25 queries): {total_clicks}")
    print(f"- Total impressions (top 25 queries): {total_impressions}")
    print(f"- Avg CTR: {avg_ctr:.1f}%")
    print()

    print("## Top queries")
    print("| Query | Clicks | Impressions | CTR | Position |")
    print("|-------|--------|-------------|-----|----------|")
    for row in query_rows:
        q = row["keys"][0]
        c = row.get("clicks", 0)
        i = row.get("impressions", 0)
        ctr = row.get("ctr", 0) * 100
        pos = row.get("position", 0)
        print(f"| {q} | {c} | {i} | {ctr:.1f}% | {pos:.1f} |")
    print()

    print("## Top pages")
    print("| Page | Clicks | Impressions | CTR | Position |")
    print("|------|--------|-------------|-----|----------|")
    for row in page_rows:
        p = row["keys"][0].replace(SITE_URL, "/")
        c = row.get("clicks", 0)
        i = row.get("impressions", 0)
        ctr = row.get("ctr", 0) * 100
        pos = row.get("position", 0)
        print(f"| {p} | {c} | {i} | {ctr:.1f}% | {pos:.1f} |")


if __name__ == "__main__":
    main()
