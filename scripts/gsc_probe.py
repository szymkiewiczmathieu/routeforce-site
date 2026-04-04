#!/usr/bin/env python3
import json
import sys
from pathlib import Path

KEY = Path('/home/node/.openclaw/secrets/gsc-mcp-routeforce.json')
SITE = 'sc-domain:routeforce.app'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except Exception as e:
    print(json.dumps({"status": "error", "reason": f"missing_google_libs: {e}"}))
    sys.exit(1)

try:
    creds = service_account.Credentials.from_service_account_file(str(KEY), scopes=SCOPES)
    service = build('searchconsole', 'v1', credentials=creds, cache_discovery=False)
    try:
        service.searchanalytics().query(siteUrl=SITE, body={
            'startDate': '2026-03-06',
            'endDate': '2026-04-02',
            'dimensions': ['page'],
            'rowLimit': 5,
        }).execute()
        print(json.dumps({"status": "ok", "site": SITE}))
    except Exception as e:
        print(json.dumps({"status": "error", "site": SITE, "reason": str(e)}))
        sys.exit(2)
except Exception as e:
    print(json.dumps({"status": "error", "site": SITE, "reason": str(e)}))
    sys.exit(3)
