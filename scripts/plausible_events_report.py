#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ENV_FILE = os.environ.get("PLAUSIBLE_ENV_FILE", "/home/node/.openclaw/workspace-routeforce-infra/.env.plausible-readonly")
SITE_ID = os.environ.get("PLAUSIBLE_SITE_ID", "routeforce.app")
PERIOD = os.environ.get("PLAUSIBLE_PERIOD", "30d")


def load_env_file(path: str):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Env file not found: {path}")
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip())


def fetch_json(base_url: str, api_key: str, endpoint: str, params: dict):
    url = f"{base_url.rstrip('/')}{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def main():
    load_env_file(ENV_FILE)
    base_url = os.environ["PLAUSIBLE_BASE_URL"]
    api_key = os.environ["PLAUSIBLE_API_KEY"]

    events = fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
        "site_id": SITE_ID,
        "period": PERIOD,
        "property": "event:name",
        "metrics": "visitors,pageviews",
        "limit": 50,
    }).get("results", [])

    def filtered_pages(event_name):
        return fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
            "site_id": SITE_ID,
            "period": PERIOD,
            "property": "event:page",
            "metrics": "visitors,pageviews",
            "filters": f"event:name=={event_name}",
            "limit": 50,
        }).get("results", [])

    result = {
        "site_id": SITE_ID,
        "period": PERIOD,
        "events": events,
        "appx_pages": filtered_pages("AppExchange Click"),
        "lead_form_pages": filtered_pages("Lead Form Submit"),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
