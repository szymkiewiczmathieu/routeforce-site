#!/usr/bin/env python3
"""Deterministic pre-deployment checks for the Tourvia public artifact."""

from __future__ import annotations

import json
import re
import sys

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
CANONICAL_ORIGIN = "https://gettourvia.com"
FORBIDDEN_NAMES = {
    ".git",
    ".github",
    ".wrangler",
    "scripts",
    "MIGRATION.md",
    "CNAME",
    "worker.js",
    "dist-worker.js",
    "wrangler.jsonc",
    "package.json",
    "package-lock.json",
    "gsc-analytics.js",
    "tailwind.input.css",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.hrefs: list[str] = []
        self.canonicals: list[str] = []
        self.descriptions: list[str] = []
        self.h1_count = 0
        self.noindex = False
        self.jsonld: list[str] = []
        self._in_jsonld = False
        self._json_buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        data = {key: value or "" for key, value in attrs}
        if data.get("id"):
            self.ids.add(data["id"])
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta" and data.get("name", "").lower() == "description":
            self.descriptions.append(data.get("content", ""))
        if tag == "meta" and data.get("name", "").lower() == "robots":
            self.noindex = "noindex" in data.get("content", "").lower()
        if tag == "link" and "canonical" in data.get("rel", "").lower():
            self.canonicals.append(data.get("href", ""))
        if tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self._in_jsonld = True
            self._json_buffer = []

    def handle_data(self, data: str) -> None:
        if self._in_jsonld:
            self._json_buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._json_buffer))
            self._in_jsonld = False


def local_target(source: Path, href: str) -> tuple[Path | None, str]:
    parsed = urlparse(href)
    if parsed.scheme in {"mailto", "tel", "javascript", "data"} or parsed.netloc:
        return None, ""
    path = unquote(parsed.path)
    if not path:
        return source, unquote(parsed.fragment)
    target = DIST / path.lstrip("/") if path.startswith("/") else source.parent / path
    if target.is_dir() or path.endswith("/"):
        target /= "index.html"
    elif not target.suffix:
        html_target = target.with_suffix(".html")
        target = html_target if html_target.exists() else target / "index.html"
    return target.resolve(), unquote(parsed.fragment)


def public_path_to_file(url: str) -> Path:
    path = unquote(urlparse(url).path)
    target = DIST / path.lstrip("/")
    if not path or path.endswith("/"):
        target /= "index.html"
    return target


def main() -> int:
    errors: list[str] = []
    html_files = sorted(DIST.rglob("*.html"))
    pages: dict[Path, PageParser] = {}
    jsonld_count = 0
    link_count = 0

    if not html_files:
        errors.append("No HTML files in dist")

    for forbidden in FORBIDDEN_NAMES:
        if any(part == forbidden for path in DIST.rglob("*") for part in path.relative_to(DIST).parts):
            errors.append(f"Internal artifact published: {forbidden}")

    for file in html_files:
        source = file.read_text(errors="ignore")
        relative = file.relative_to(DIST)
        if "https://routeforce.app" in source:
            errors.append(f"{relative}: old absolute site URL")

        parser = PageParser()
        parser.feed(source)
        pages[file.resolve()] = parser
        link_count += len(parser.hrefs)

        if not parser.noindex:
            if len(parser.descriptions) != 1:
                errors.append(f"{relative}: descriptions={len(parser.descriptions)}")
            if len(parser.canonicals) != 1 or not parser.canonicals[0].startswith(CANONICAL_ORIGIN):
                errors.append(f"{relative}: canonical={parser.canonicals}")
            if parser.h1_count != 1:
                errors.append(f"{relative}: h1={parser.h1_count}")

        for block in parser.jsonld:
            try:
                json.loads(block)
                jsonld_count += 1
            except json.JSONDecodeError as exc:
                errors.append(f"{relative}: invalid JSON-LD ({exc.msg})")

    for source, parser in pages.items():
        for href in parser.hrefs:
            target, fragment = local_target(source, href)
            if target is None:
                continue
            try:
                target.relative_to(DIST.resolve())
            except ValueError:
                errors.append(f"{source.relative_to(DIST)}: link escapes dist ({href})")
                continue
            if not target.exists():
                errors.append(f"{source.relative_to(DIST)}: missing link target ({href})")
                continue
            if fragment and target.suffix.lower() == ".html":
                target_parser = pages.get(target)
                if target_parser and fragment not in target_parser.ids:
                    errors.append(f"{source.relative_to(DIST)}: missing anchor ({href})")

    sitemap = DIST / "sitemap.xml"
    if sitemap.is_file():
        sitemap_source = sitemap.read_text(errors="strict")
        sitemap_urls = re.findall(r"<loc>(https://[^<]+)</loc>", sitemap_source)
        if "<urlset" not in sitemap_source or "</urlset>" not in sitemap_source:
            errors.append("Invalid sitemap document")
    else:
        errors.append("Missing sitemap.xml")
        sitemap_urls = []

    for url in sitemap_urls:
        if not url.startswith(CANONICAL_ORIGIN):
            errors.append(f"Sitemap uses wrong origin: {url}")
        if not public_path_to_file(url).is_file():
            errors.append(f"Sitemap target missing: {url}")

    robots = (DIST / "robots.txt").read_text(errors="ignore") if (DIST / "robots.txt").exists() else ""
    if f"Sitemap: {CANONICAL_ORIGIN}/sitemap.xml" not in robots:
        errors.append("robots.txt does not point to the production sitemap")

    print(
        f"HTML={len(html_files)} INDEXABLE={sum(not page.noindex for page in pages.values())} "
        f"JSONLD={jsonld_count} LINKS={link_count} SITEMAP={len(sitemap_urls)} ERRORS={len(errors)}"
    )
    for error in errors:
        print(error, file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
