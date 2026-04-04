#!/usr/bin/env python3
import base64
import json
import os
import urllib.request
from pathlib import Path

ENV_FILE = os.environ.get('DATAFORSEO_ENV_FILE', '/home/node/.openclaw/secrets/dataforseo.env')


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


def main():
    load_env(ENV_FILE)
    auth = os.environ.get('DATAFORSEO_BASIC_AUTH_B64')
    if not auth:
        login = os.environ['DATAFORSEO_LOGIN']
        pwd = os.environ['DATAFORSEO_PASSWORD']
        auth = base64.b64encode(f'{login}:{pwd}'.encode()).decode()

    payload = [{
        'keyword': 'salesforce route planning',
        'location_name': 'United States',
        'language_name': 'English'
    }]
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live',
        data=body,
        headers={
            'Authorization': f'Basic {auth}',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        print(resp.read().decode())


if __name__ == '__main__':
    main()
