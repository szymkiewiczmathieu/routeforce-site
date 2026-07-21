#!/usr/bin/env python3
"""Safely resubmit the gettourvia.com sitemap through Search Console.

Google's Indexing API is restricted to JobPosting and livestream pages. Tourvia
uses Search Console sitemap submission for ordinary marketing and blog URLs.
Successful scheduled runs are silent; set VERBOSE=1 for a status line.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SITE_URL = os.environ.get("GSC_SITE_URL", "sc-domain:gettourvia.com")
SITEMAP_URL = os.environ.get("SITEMAP_URL", "https://gettourvia.com/sitemap.xml")
TOKEN_PATH = Path(
    os.environ.get("GOOGLE_TOKEN_PATH", "/home/ubuntu/.hermes/google_token.json")
)


def main() -> int:
    credentials = Credentials.from_authorized_user_file(str(TOKEN_PATH))
    service = build("searchconsole", "v1", credentials=credentials, cache_discovery=False)

    service.sitemaps().submit(siteUrl=SITE_URL, feedpath=SITEMAP_URL).execute()
    sitemaps = service.sitemaps().list(siteUrl=SITE_URL).execute().get("sitemap", [])
    status = next((item for item in sitemaps if item.get("path") == SITEMAP_URL), None)
    if status is None:
        print(f"ERROR: submitted sitemap is missing from Search Console: {SITEMAP_URL}")
        return 1

    result = {
        key: status.get(key)
        for key in (
            "path",
            "lastSubmitted",
            "lastDownloaded",
            "isPending",
            "warnings",
            "errors",
        )
    }
    warnings = int(status.get("warnings") or 0)
    errors = int(status.get("errors") or 0)
    if warnings or errors:
        print("ALERT: Search Console sitemap issue " + json.dumps(result, sort_keys=True))
        return 1

    if os.environ.get("VERBOSE") == "1":
        print("Sitemap submitted: " + json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
