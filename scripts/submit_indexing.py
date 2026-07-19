#!/usr/bin/env python3
"""Submit all gettourvia.com sitemap URLs to Google Indexing API.
Runs every 3 days to force recrawl during migration."""
import os
import re
import requests
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SITEMAP_URL = os.environ.get("SITEMAP_URL", "https://gettourvia.com/sitemap.xml")
KEY_URLS = [
    "https://gettourvia.com/",
    "https://gettourvia.com/pricing.html",
    "https://gettourvia.com/salesforce-route-planning.html",
    "https://gettourvia.com/field-sales-route-optimization.html",
    "https://gettourvia.com/native-integration-salesforce.html",
    "https://gettourvia.com/use-cases.html",
    "https://gettourvia.com/visit-planning-salesforce.html",
    "https://gettourvia.com/blog/salesforce-maps-alternatives-compared.html",
    "https://gettourvia.com/blog/routeforce-becomes-tourvia.html",
]


def get_sitemap_urls():
    text = requests.get(SITEMAP_URL, timeout=30).text
    return re.findall(r'<loc>([^\s]+)</loc>', text)


def submit_indexing(urls):
    creds = Credentials.from_authorized_user_file('/home/ubuntu/.hermes/google_token.json')
    service = build('indexing', 'v3', credentials=creds)
    success = 0
    errors = 0
    quota_exceeded = False
    for url in urls:
        if quota_exceeded:
            break
        try:
            service.urlNotifications().publish(body={"url": url, "type": "URL_UPDATED"}).execute()
            success += 1
        except HttpError as e:
            if e.resp.status in (429, 403):
                quota_exceeded = True
            else:
                errors += 1
                print(f"ERROR {url}: {e}")
    return success, errors, quota_exceeded


def main():
    urls = get_sitemap_urls()
    # Always prioritize key pages first
    ordered = [u for u in KEY_URLS if u in urls] + [u for u in urls if u not in KEY_URLS]
    print(f"Submitting {len(ordered)} URLs to Google Indexing API...")
    success, errors, quota_exceeded = submit_indexing(ordered)
    print(f"Done: {success} OK, {errors} errors, quota_exceeded={quota_exceeded}")


if __name__ == "__main__":
    main()
