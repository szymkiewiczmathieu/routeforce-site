#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ENV_FILE = os.environ.get("PLAUSIBLE_ENV_FILE", "/home/node/.openclaw/workspace-routeforce-infra/.env.plausible-readonly")
SITE_ID = os.environ.get("PLAUSIBLE_SITE_ID", "routeforce.app")
OVERVIEW_PERIOD = os.environ.get("PLAUSIBLE_PERIOD", "30d")
EVENT_PERIOD = os.environ.get("PLAUSIBLE_EVENT_PERIOD", "day")


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


def first_value(results, key):
    try:
        return results.get(key, {}).get("value")
    except Exception:
        return None


def main():
    load_env_file(ENV_FILE)
    base_url = os.environ["PLAUSIBLE_BASE_URL"]
    api_key = os.environ["PLAUSIBLE_API_KEY"]

    overview = fetch_json(base_url, api_key, "/api/v1/stats/aggregate", {
        "site_id": SITE_ID,
        "period": OVERVIEW_PERIOD,
        "metrics": "visitors,pageviews,visits,bounce_rate,visit_duration",
    }).get("results", {})

    pages = fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
        "site_id": SITE_ID,
        "period": OVERVIEW_PERIOD,
        "property": "event:page",
        "metrics": "visitors,pageviews",
        "limit": 5,
    }).get("results", [])

    sources = fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
        "site_id": SITE_ID,
        "period": OVERVIEW_PERIOD,
        "property": "visit:source",
        "metrics": "visitors,visits",
        "limit": 5,
    }).get("results", [])

    events = fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
        "site_id": SITE_ID,
        "period": EVENT_PERIOD,
        "property": "event:name",
        "metrics": "visitors,pageviews",
        "limit": 20,
    }).get("results", [])

    appx_pages = fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
        "site_id": SITE_ID,
        "period": EVENT_PERIOD,
        "property": "event:page",
        "metrics": "visitors,pageviews",
        "filters": "event:name==AppExchange Click",
        "limit": 10,
    }).get("results", [])

    lead_pages = fetch_json(base_url, api_key, "/api/v1/stats/breakdown", {
        "site_id": SITE_ID,
        "period": EVENT_PERIOD,
        "property": "event:page",
        "metrics": "visitors,pageviews",
        "filters": "event:name==Lead Form Submit",
        "limit": 10,
    }).get("results", [])

    event_names = {row.get("name"): row for row in events}
    appx_ok = "AppExchange Click" in event_names
    lead_ok = "Lead Form Submit" in event_names

    lines = []
    lines.append(f"- 30d overview: {first_value(overview, 'visits')} visits, {first_value(overview, 'visitors')} visitors, {first_value(overview, 'pageviews')} pageviews, {first_value(overview, 'bounce_rate')}% bounce.")

    if pages:
        top = ", ".join(f"{p.get('page')} ({p.get('pageviews')} PV)" for p in pages[:3])
        lines.append(f"- Top pages: {top}.")

    if sources:
        top = ", ".join(f"{s.get('source')} ({s.get('visits')} visits)" for s in sources[:3])
        lines.append(f"- Top sources: {top}.")

    if appx_ok:
        appx_detail = ", ".join(f"{p.get('page')} ({p.get('visitors')} visitors)" for p in appx_pages[:3]) or "event seen"
        lines.append(f"- AppExchange Click is firing in Plausible ({EVENT_PERIOD}): {appx_detail}.")
    else:
        lines.append(f"- AppExchange Click not seen in Plausible for period={EVENT_PERIOD}.")

    if lead_ok:
        lead_detail = ", ".join(f"{p.get('page')} ({p.get('visitors')} visitors)" for p in lead_pages[:3]) or "event seen"
        lines.append(f"- Lead Form Submit is firing in Plausible ({EVENT_PERIOD}): {lead_detail}.")
    else:
        lines.append(f"- Lead Form Submit not seen in Plausible for period={EVENT_PERIOD}.")

    if appx_ok and lead_ok:
        lines.append("- Ads readiness: tracking looks healthy; next priority is keyword data + campaign freeze.")
    elif appx_ok:
        lines.append("- Ads readiness: primary conversion tracking is validated; secondary form tracking still needs confirmation.")
    else:
        lines.append("- Ads readiness: do not launch paid traffic until AppExchange Click is confirmed in Plausible.")

    print("\n".join(lines[:6]))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"- Error while checking Plausible ads readiness: {e}")
        sys.exit(1)
