#!/usr/bin/env python3
import base64
import json
import os
import sys
import urllib.request
from pathlib import Path

ENV_FILE = os.environ.get('DATAFORSEO_ENV_FILE', '/home/node/.openclaw/secrets/dataforseo.env')
KEYWORDS = [
    'salesforce route planning',
    'salesforce route planner',
    'salesforce route optimization',
    'route planning in salesforce',
    'salesforce maps alternative',
    'salesforce maps pricing',
    'field sales route planning',
    'field sales route optimization',
    'visit planning salesforce',
    'sales route planner',
]


def load_env(path):
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(path)
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        os.environ.setdefault(k.strip(), v.strip())


def auth_header():
    b64 = os.environ.get('DATAFORSEO_BASIC_AUTH_B64')
    if b64:
        return f'Basic {b64}'
    login = os.environ['DATAFORSEO_LOGIN']
    pwd = os.environ['DATAFORSEO_PASSWORD']
    return 'Basic ' + base64.b64encode(f'{login}:{pwd}'.encode()).decode()


def post(url, payload):
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={
            'Authorization': auth_header(),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def main():
    load_env(ENV_FILE)
    payload = [{
        'keywords': KEYWORDS,
        'location_name': 'United States',
        'language_name': 'English'
    }]
    data = post('https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_overview/live', payload)
    task = (((data or {}).get('tasks') or [{}])[0].get('result') or [{}])[0]
    items = task.get('items') or []
    results = []
    by_kw = { (item.get('keyword') or '').lower(): item for item in items }
    for kw in KEYWORDS:
        item = by_kw.get(kw.lower())
        if not item:
            results.append({'keyword': kw, 'error': 'no_data'})
            continue
        kd = item.get('keyword_info') or {}
        results.append({
            'keyword': kw,
            'search_volume': kd.get('search_volume'),
            'cpc': kd.get('cpc'),
            'competition': kd.get('competition'),
            'competition_level': kd.get('competition_level'),
        })
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)
