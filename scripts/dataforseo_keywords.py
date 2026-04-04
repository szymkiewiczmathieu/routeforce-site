#!/usr/bin/env python3
import base64
import json
import os
import urllib.request
from pathlib import Path

ENV_FILE = os.environ.get('DATAFORSEO_ENV_FILE', '/home/node/.openclaw/secrets/dataforseo.env')
SEEDS = [
    'salesforce route planning',
    'visit planning salesforce',
    'salesforce maps alternative',
    'field sales route optimization',
    'sales route optimization',
]


def load_env(path):
    p = Path(path)
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


def call_ranked(keyword):
    payload = [{
        'keyword': keyword,
        'location_name': 'United States',
        'language_name': 'English',
        'target': 'routeforce.app'
    }]
    req = urllib.request.Request(
        'https://api.dataforseo.com/v3/dataforseo_labs/google/ranked_keywords/live',
        data=json.dumps([{
            'target': 'routeforce.app',
            'location_name': 'United States',
            'language_name': 'English',
            'filters': [['keyword_data.keyword','=',keyword]],
            'limit': 10
        }]).encode(),
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
    out = []
    for kw in SEEDS:
        data = call_ranked(kw)
        out.append({'keyword': kw, 'data': data})
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
