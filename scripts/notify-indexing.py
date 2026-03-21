#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOG_DIR = ROOT / 'logs'
LOG_PATH = LOG_DIR / 'indexing-history.json'
DEFAULT_SITEMAP = 'https://routeforce.app/sitemap.xml'
DEFAULT_SITE = 'routeforce.app'
INDEXNOW_ENDPOINT = 'https://api.indexnow.org/IndexNow'


def utc_now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def sha256_text(text: str) -> str:
    return 'sha256:' + hashlib.sha256(text.encode('utf-8')).hexdigest()


def load_json(path: Path):
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text())
    except Exception:
        return []


def save_json(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=20) as resp:
        return resp.read().decode('utf-8')


def parse_sitemap(xml_text: str):
    root = ET.fromstring(xml_text)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = []
    for loc in root.findall('.//sm:loc', ns):
        if loc.text:
            urls.append(loc.text.strip())
    if not urls:
        for loc in root.findall('.//loc'):
            if loc.text:
                urls.append(loc.text.strip())
    return urls


def validate_urls(urls, site):
    cleaned = []
    seen = set()
    for url in urls:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme != 'https':
            continue
        if parsed.hostname != site:
            continue
        if 'localhost' in url or '127.0.0.1' in url:
            continue
        if url not in seen:
            cleaned.append(url)
            seen.add(url)
    return cleaned


def notify_indexnow(site, urls, dry_run=False):
    key = os.environ.get('INDEXNOW_KEY', '').strip()
    key_location = os.environ.get('INDEXNOW_KEY_LOCATION', '').strip()
    if not key:
        return {'engine': 'indexnow', 'status': 'skipped', 'reason': 'missing INDEXNOW_KEY'}
    payload = {
        'host': site,
        'key': key,
        'keyLocation': key_location or f'https://{site}/{key}.txt',
        'urlList': urls,
    }
    if dry_run:
        return {'engine': 'indexnow', 'status': 'dry-run', 'submittedUrlCount': len(urls), 'payloadPreview': payload}
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=body,
        headers={'Content-Type': 'application/json; charset=utf-8'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return {'engine': 'indexnow', 'status': 'ok', 'httpStatus': resp.status, 'submittedUrlCount': len(urls)}
    except Exception as e:
        return {'engine': 'indexnow', 'status': 'fail', 'submittedUrlCount': len(urls), 'error': str(e)}


def main():
    parser = argparse.ArgumentParser(description='Notify search engines after a RouteForce site deploy.')
    parser.add_argument('--sitemap', default=DEFAULT_SITEMAP)
    parser.add_argument('--site', default=DEFAULT_SITE)
    parser.add_argument('--mode', choices=['sitemap', 'urls'], default='sitemap')
    parser.add_argument('--urls-file')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    if args.mode == 'sitemap':
        sitemap_text = fetch_text(args.sitemap)
        raw_urls = parse_sitemap(sitemap_text)
        sitemap_hash = sha256_text(sitemap_text)
    else:
        if not args.urls_file:
            print('Missing --urls-file for mode=urls', file=sys.stderr)
            sys.exit(2)
        raw_text = Path(args.urls_file).read_text()
        raw_urls = [line.strip() for line in raw_text.splitlines() if line.strip()]
        sitemap_hash = sha256_text(raw_text)

    urls = validate_urls(raw_urls, args.site)
    if not urls:
        result = {
            'timestamp': utc_now(),
            'site': args.site,
            'sitemap': args.sitemap,
            'sitemapHash': sitemap_hash,
            'submittedUrlCount': 0,
            'engines': {},
            'status': 'FAIL',
            'reason': 'No valid public HTTPS URLs found',
        }
        history = load_json(LOG_PATH)
        history.append(result)
        save_json(LOG_PATH, history)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(1)

    engine_result = notify_indexnow(args.site, urls, dry_run=args.dry_run)
    status = 'OK' if engine_result['status'] in ('ok', 'dry-run') else ('PARTIAL' if engine_result['status'] == 'skipped' else 'FAIL')

    result = {
        'timestamp': utc_now(),
        'site': args.site,
        'sitemap': args.sitemap if args.mode == 'sitemap' else None,
        'sitemapHash': sitemap_hash,
        'submittedUrlCount': len(urls),
        'engines': {'indexnow': engine_result},
        'status': status,
        'mode': args.mode,
        'dryRun': args.dry_run,
    }

    history = load_json(LOG_PATH)
    history.append(result)
    save_json(LOG_PATH, history)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if status in ('OK', 'PARTIAL') else 1)


if __name__ == '__main__':
    main()
