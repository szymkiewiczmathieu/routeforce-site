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
        self.og_urls: list[str] = []
        self.descriptions: list[str] = []
        self.titles: list[str] = []
        self.h1_count = 0
        self.noindex = False
        self.jsonld: list[str] = []
        self.jsonld_data: list[object] = []
        self._in_title = False
        self._title_buffer: list[str] = []
        self._in_jsonld = False
        self._json_buffer: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        data = {key: value or "" for key, value in attrs}
        if data.get("id"):
            self.ids.add(data["id"])
        if tag == "a" and data.get("href"):
            self.hrefs.append(data["href"])
        if tag == "title":
            self._in_title = True
            self._title_buffer = []
        if tag == "h1":
            self.h1_count += 1
        if tag == "meta" and data.get("name", "").lower() == "description":
            self.descriptions.append(data.get("content", ""))
        if tag == "meta" and data.get("property", "").lower() == "og:url":
            self.og_urls.append(data.get("content", ""))
        if tag == "meta" and data.get("name", "").lower() == "robots":
            self.noindex = "noindex" in data.get("content", "").lower()
        if tag == "link" and "canonical" in data.get("rel", "").lower():
            self.canonicals.append(data.get("href", ""))
        if tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self._in_jsonld = True
            self._json_buffer = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_buffer.append(data)
        if self._in_jsonld:
            self._json_buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self._in_title:
            self.titles.append("".join(self._title_buffer).strip())
            self._in_title = False
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


def date_modified_values(value) -> set[str]:
    """Collect ISO dateModified values from a JSON-LD object or graph."""
    dates: set[str] = set()
    if isinstance(value, dict):
        if isinstance(value.get("dateModified"), str):
            dates.add(value["dateModified"][:10])
        for child in value.values():
            dates.update(date_modified_values(child))
    elif isinstance(value, list):
        for child in value:
            dates.update(date_modified_values(child))
    return dates


def expected_canonical(relative: Path) -> str:
    """Return the exact canonical URL expected for a built HTML artifact."""
    path = relative.as_posix()
    if path == "index.html":
        return f"{CANONICAL_ORIGIN}/"
    if path.endswith("/index.html"):
        return f"{CANONICAL_ORIGIN}/{path[:-len('index.html')]}"
    return f"{CANONICAL_ORIGIN}/{path}"


def top_level_schema_nodes(value) -> list[dict]:
    """Return schema definitions, never nested property/reference objects."""
    if isinstance(value, list):
        return [node for node in value if isinstance(node, dict)]
    if not isinstance(value, dict):
        return []
    graph = value.get("@graph")
    if isinstance(graph, list):
        return [node for node in graph if isinstance(node, dict)]
    return [value]


def entity_reference(value, expected_id: str) -> bool:
    return value == {"@id": expected_id}


def only_node(nodes: list[dict], node_id: str, node_type: str) -> dict | None:
    matches = [
        node for node in nodes
        if node.get("@id") == node_id and node.get("@type") == node_type
    ]
    return matches[0] if len(matches) == 1 else None


def main() -> int:
    errors: list[str] = []
    html_files = sorted(DIST.rglob("*.html"))
    pages: dict[Path, PageParser] = {}
    modified_dates: dict[Path, set[str]] = {}
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
            canonical = expected_canonical(relative)
            if len(parser.descriptions) != 1:
                errors.append(f"{relative}: descriptions={len(parser.descriptions)}")
            if parser.canonicals != [canonical]:
                errors.append(f"{relative}: canonical={parser.canonicals} expected={canonical}")
            if parser.og_urls != [canonical]:
                errors.append(f"{relative}: og:url={parser.og_urls} expected={canonical}")
            if parser.h1_count != 1:
                errors.append(f"{relative}: h1={parser.h1_count}")

        for block in parser.jsonld:
            try:
                data = json.loads(block)
                parser.jsonld_data.append(data)
                jsonld_count += 1
                modified_dates.setdefault(file.resolve(), set()).update(date_modified_values(data))
            except json.JSONDecodeError as exc:
                errors.append(f"{relative}: invalid JSON-LD ({exc.msg})")

    homepage = pages.get((DIST / "index.html").resolve())
    if not homepage:
        errors.append("Missing index.html")
    else:
        home_nodes = [
            node
            for data in homepage.jsonld_data
            for node in top_level_schema_nodes(data)
        ]
        website_id = f"{CANONICAL_ORIGIN}/#website"
        organization_id = f"{CANONICAL_ORIGIN}/#organization"
        product_id = f"{CANONICAL_ORIGIN}/#tourvia"
        website = only_node(home_nodes, website_id, "WebSite")
        organization = only_node(home_nodes, organization_id, "Organization")
        product = only_node(home_nodes, product_id, "SoftwareApplication")
        if not website:
            errors.append("index.html: missing canonical WebSite entity")
        elif not (
            website.get("url") == f"{CANONICAL_ORIGIN}/"
            and entity_reference(website.get("publisher"), organization_id)
            and entity_reference(website.get("about"), product_id)
        ):
            errors.append("index.html: WebSite identity links are incomplete")
        if not organization:
            errors.append("index.html: missing canonical Organization entity")
        elif (
            organization.get("name") != "SKZ Consulting"
            or organization.get("legalName") != "SKZ Consulting"
            or "sameAs" in organization
        ):
            errors.append("index.html: Organization identity is invalid")
        if not product:
            errors.append("index.html: missing canonical SoftwareApplication entity")
        elif not (
            product.get("name") == "Tourvia"
            and product.get("url") == f"{CANONICAL_ORIGIN}/"
            and product.get("sameAs") == [
                "https://appexchange.salesforce.com/appxListingDetail?listingId=0b5cf9f9-e7d9-40c1-a513-2a5847a813ba"
            ]
            and entity_reference(product.get("author"), organization_id)
            and entity_reference(product.get("publisher"), organization_id)
        ):
            errors.append("index.html: SoftwareApplication identity is invalid")

    strategic_pages = (
        "pricing.html",
        "salesforce-route-planning.html",
        "visit-planning-salesforce.html",
        "field-sales-route-optimization.html",
        "native-integration-salesforce.html",
        "use-cases.html",
    )
    prohibited_page_product_fields = {
        "offers",
        "price",
        "priceCurrency",
        "priceSpecification",
        "softwareVersion",
        "featureList",
        "applicationCategory",
        "operatingSystem",
    }
    for relative in strategic_pages:
        parser = pages.get((DIST / relative).resolve())
        if not parser:
            errors.append(f"{relative}: missing built page")
            continue
        canonical = expected_canonical(Path(relative))
        expected_id = f"{canonical}#webpage"
        nodes = [
            node
            for data in (parser.jsonld_data if parser else [])
            for node in top_level_schema_nodes(data)
        ]
        webpage_nodes = [node for node in nodes if node.get("@type") == "WebPage"]
        breadcrumb_nodes = [node for node in nodes if node.get("@type") == "BreadcrumbList"]
        webpage = only_node(nodes, expected_id, "WebPage")
        node_ids = [node["@id"] for node in nodes if isinstance(node.get("@id"), str)]
        if len(node_ids) != len(set(node_ids)):
            errors.append(f"{relative}: duplicate top-level JSON-LD @id")
        if len(webpage_nodes) != 1 or not webpage:
            errors.append(f"{relative}: missing canonical WebPage entity")
        elif not (
            len(parser.titles) == 1
            and len(parser.descriptions) == 1
            and webpage.get("url") == canonical
            and webpage.get("name") == parser.titles[0]
            and webpage.get("description") == parser.descriptions[0]
            and webpage.get("inLanguage") == "en"
            and webpage.get("dateModified") == "2026-09-05"
            and entity_reference(webpage.get("isPartOf"), f"{CANONICAL_ORIGIN}/#website")
            and entity_reference(webpage.get("about"), f"{CANONICAL_ORIGIN}/#tourvia")
            and entity_reference(webpage.get("mainEntity"), f"{CANONICAL_ORIGIN}/#tourvia")
            and entity_reference(webpage.get("publisher"), f"{CANONICAL_ORIGIN}/#organization")
        ):
            errors.append(f"{relative}: WebPage identity links are incomplete")
        if len(breadcrumb_nodes) != 1:
            errors.append(f"{relative}: expected one BreadcrumbList")
        if any(node.get("@type") in {"Product", "SoftwareApplication"} for node in nodes):
            errors.append(f"{relative}: page-local product definition is forbidden")
        if webpage and prohibited_page_product_fields & webpage.keys():
            errors.append(f"{relative}: WebPage duplicates product fields")

    tools_relative = "tools.html"
    tools_canonical = expected_canonical(Path(tools_relative))
    tools_parser = pages.get((DIST / tools_relative).resolve())
    tool_urls = (
        f"{CANONICAL_ORIGIN}/salesforce-route-planning-data-readiness-checker.html",
        f"{CANONICAL_ORIGIN}/field-sales-visit-capacity-calculator.html",
    )
    if not tools_parser:
        errors.append("tools.html: missing built page")
    else:
        tools_nodes = [
            node
            for data in tools_parser.jsonld_data
            for node in top_level_schema_nodes(data)
        ]
        collection = only_node(
            tools_nodes, f"{tools_canonical}#webpage", "CollectionPage"
        )
        item_list = only_node(
            tools_nodes, f"{tools_canonical}#tool-list", "ItemList"
        )
        breadcrumbs = [
            node for node in tools_nodes if node.get("@type") == "BreadcrumbList"
        ]
        if not collection or not (
            len(tools_parser.titles) == 1
            and len(tools_parser.descriptions) == 1
            and collection.get("url") == tools_canonical
            and collection.get("name") == tools_parser.titles[0]
            and collection.get("description") == tools_parser.descriptions[0]
            and collection.get("inLanguage") == "en"
            and collection.get("dateModified") == "2026-09-05"
            and entity_reference(collection.get("isPartOf"), f"{CANONICAL_ORIGIN}/#website")
            and entity_reference(collection.get("publisher"), f"{CANONICAL_ORIGIN}/#organization")
            and entity_reference(collection.get("mainEntity"), f"{tools_canonical}#tool-list")
        ):
            errors.append("tools.html: CollectionPage identity is incomplete")
        list_urls = tuple(
            entry.get("url")
            for entry in (item_list or {}).get("itemListElement", [])
            if isinstance(entry, dict)
        )
        if not item_list or item_list.get("numberOfItems") != 2 or list_urls != tool_urls:
            errors.append("tools.html: ItemList must name the two canonical tools in order")
        if len(breadcrumbs) != 1:
            errors.append("tools.html: expected one BreadcrumbList")
        if not all(url.removeprefix(CANONICAL_ORIGIN) in tools_parser.hrefs for url in tool_urls):
            errors.append("tools.html: missing crawlable edge to a tool")

    for tool_url in tool_urls:
        relative = tool_url.removeprefix(f"{CANONICAL_ORIGIN}/")
        parser = pages.get((DIST / relative).resolve())
        if not parser:
            errors.append(f"{relative}: missing built tool page")
            continue
        nodes = [
            node
            for data in parser.jsonld_data
            for node in top_level_schema_nodes(data)
        ]
        breadcrumbs = [node for node in nodes if node.get("@type") == "BreadcrumbList"]
        breadcrumb_items = (breadcrumbs[0] if len(breadcrumbs) == 1 else {}).get(
            "itemListElement", []
        )
        breadcrumb_urls = tuple(
            item.get("item") for item in breadcrumb_items if isinstance(item, dict)
        )
        if breadcrumb_urls != (f"{CANONICAL_ORIGIN}/", tools_canonical, tool_url):
            errors.append(f"{relative}: breadcrumb must run Tourvia → Free tools → tool")
        if "/tools.html" not in parser.hrefs:
            errors.append(f"{relative}: missing visible backlink to the tools hub")

    llms = DIST / "llms.txt"
    if not llms.is_file() or not all(url in llms.read_text(errors="ignore") for url in (tools_canonical, *tool_urls)):
        errors.append("llms.txt: missing bounded free-tools references")

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
        sitemap_entries = re.findall(
            r"<url>\s*<loc>(https://[^<]+)</loc>\s*"
            r"<lastmod>(\d{4}-\d{2}-\d{2})</lastmod>.*?</url>",
            sitemap_source,
            flags=re.DOTALL,
        )
        sitemap_urls = [url for url, _ in sitemap_entries]
        if "<urlset" not in sitemap_source or "</urlset>" not in sitemap_source:
            errors.append("Invalid sitemap document")
        if len(sitemap_entries) != sitemap_source.count("<url>"):
            errors.append("Sitemap URL entries must include loc and ISO lastmod")
        if len(sitemap_urls) != len(set(sitemap_urls)):
            errors.append("Sitemap contains duplicate URLs")
    else:
        errors.append("Missing sitemap.xml")
        sitemap_entries = []
        sitemap_urls = []

    sitemap_url_set = set(sitemap_urls)
    for url, lastmod in sitemap_entries:
        if not url.startswith(CANONICAL_ORIGIN):
            errors.append(f"Sitemap uses wrong origin: {url}")
        target = public_path_to_file(url)
        if not target.is_file():
            errors.append(f"Sitemap target missing: {url}")
            continue
        parser = pages.get(target.resolve())
        if parser and parser.noindex:
            errors.append(f"Sitemap target is noindex: {url}")
        dates = modified_dates.get(target.resolve(), set())
        if len(dates) > 1:
            errors.append(f"{target.relative_to(DIST)}: conflicting dateModified values={sorted(dates)}")
        elif dates and lastmod != next(iter(dates)):
            errors.append(
                f"{target.relative_to(DIST)}: sitemap lastmod={lastmod} "
                f"does not match dateModified={next(iter(dates))}"
            )

    for path, parser in pages.items():
        if parser.noindex or not parser.canonicals:
            continue
        canonical = parser.canonicals[0]
        if canonical not in sitemap_url_set:
            errors.append(f"{path.relative_to(DIST)}: indexable canonical missing from sitemap ({canonical})")

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
