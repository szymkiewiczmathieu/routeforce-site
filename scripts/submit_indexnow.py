#!/usr/bin/env python3
"""Notify IndexNow-participating engines that specific URLs changed.

IndexNow is supported by Bing, Yandex, Seznam and Naver. Google has never
adopted it, so this does NOT accelerate Google indexing: use Search Console
sitemap resubmission (scripts/submit_indexing.py) for that.

It still matters here because Bing's index feeds Microsoft Copilot and is one
of the retrieval sources used by assistant search surfaces, so it is part of
the GEO/LLM visibility path rather than the classic SEO path.

Google's Indexing API is deliberately not used anywhere in this repository:
it is restricted to JobPosting and BroadcastEvent pages, and calling it for
ordinary marketing URLs is out of policy.

Usage:
    python3 scripts/submit_indexnow.py https://gettourvia.com/ https://gettourvia.com/fr/

With no arguments it submits the site's key entry points.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

HOST = "gettourvia.com"
KEY = "25b62d24cb92c76df10ae2213769ffd3"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"

DEFAULT_URLS = [
    f"https://{HOST}/",
    f"https://{HOST}/fr/",
]


def verify_key_file() -> bool:
    """The key file must be publicly readable or engines reject the payload."""
    try:
        with urllib.request.urlopen(KEY_LOCATION, timeout=20) as response:
            served = response.read().decode("utf-8").strip()
    except urllib.error.URLError as error:
        print(f"ERROR: key file unreachable at {KEY_LOCATION}: {error}")
        return False

    if served != KEY:
        print(f"ERROR: key file content mismatch at {KEY_LOCATION}")
        return False

    print(f"Key file verified: {KEY_LOCATION}")
    return True


def submit(urls: list[str]) -> int:
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
    except urllib.error.HTTPError as error:
        # 422 means the URLs did not belong to the declared host, 403 a key
        # problem. Both are real failures worth surfacing.
        print(f"ERROR: IndexNow rejected the submission: HTTP {error.code} {error.reason}")
        return 1
    except urllib.error.URLError as error:
        print(f"ERROR: IndexNow unreachable: {error}")
        return 1

    # 200 = accepted, 202 = accepted but key validation still pending.
    if status not in (200, 202):
        print(f"ERROR: unexpected IndexNow status {status}")
        return 1

    print(f"IndexNow accepted {len(urls)} URL(s): HTTP {status}")
    for url in urls:
        print(f"  - {url}")
    return 0


def main() -> int:
    urls = sys.argv[1:] or DEFAULT_URLS

    bad = [url for url in urls if not url.startswith(f"https://{HOST}/")]
    if bad:
        print(f"ERROR: URLs outside https://{HOST}/ cannot be submitted: {bad}")
        return 1

    if not verify_key_file():
        return 1

    return submit(urls)


if __name__ == "__main__":
    raise SystemExit(main())
