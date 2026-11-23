#!/usr/bin/env python3
"""Fail on stale commercial claims and incorrect annual pricing-table arithmetic."""
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

FORBIDDEN = {
    'stale Salesforce Maps Advanced rate': re.compile(r'\$125(?=\s*(?:/|per\b|</|,\s*per\b))|125(?:&nbsp;|\s)*\$(?=\s*/\s*utilisateur)', re.I),
    'stale Mapsly range': re.compile(r'\$25\s+to\s+\$70', re.I),
    'stale current build': re.compile(r'current build,?\s*(?:TourviaApp\s*)?7\.36\.0|TourviaApp 7\.36\.0\. (?:Security|Salesforce)', re.I),
    'incorrect Badger annual total': re.compile(r'\$5,880|5 880\s*\$', re.I),
    'unsupported Geopointe estimate': re.compile(r'Field teams typically report costs around \$75|Most references place the list price around \$75', re.I),
    'stale trial request wording': re.compile(r'complete 30-day trial is available on request', re.I),
    'broken licensed-user pricing copy': re.compile(r'covering per licensed user', re.I),
    'unsupported SPOTIO seat price': re.compile(r'SPOTIO starts at \$39', re.I),
    'unsupported Maptive pass duration': re.compile(r'45-day pass|45 jours', re.I),
    'stale Map My Customers range': re.compile(r'\$55-79/user/mo|individual plan at \$55/month', re.I),
    'obsolete pricing-conflict wording': re.compile(r'conflicting \$150|pricing-card figure|carte tarifaire', re.I),
}

REQUIRED = {
    'pricing.html': ['$75', '$150', '€30'],
    'fr/tarifs.html': ['75', '150', '30'],
    'compare.html': ['$75/user/month for Maps; $150 for Advanced', '23 November 2026'],
    'blog/tourvia-vs-mapsly.html': ['€30', '€55', '€80', '€26', '€47', '€68'],
    'blog/routeforce-vs-badger-maps.html': ['$6,960/yr', 'checked 23 November 2026'],
    'blog/salesforce-maps-pricing-breakdown.html': ['10 total $18,000', '30 licences total $54,000 per year'],
    'blog/flat-pricing-vs-per-user-salesforce-field-tools.html': ['three additional Maps Advanced licences add $5,400'],
    'product-facts.md': ['TourviaApp 7.37.0', 'Last verified: 23 November 2026'],
    'llms-full.txt': ['TourviaApp 7.37.0', '**Released**: 30 September 2026'],
    'llms.txt': ['TourviaApp 7.37.0', 'Last verified: 23 November 2026'],
}

# Some money tables name the product in the header but state the monthly rate
# in the surrounding prose. Validate those cells too instead of skipping them.
IMPLICIT_TABLE_RATES = {
    'fr/tarifs.html': {
        'Tourvia': ('€', 30),
        'Salesforce Maps Standard': ('$', 75),
        'Salesforce Maps Advanced': ('$', 150),
    },
}


def number(value: str) -> int:
    return int(re.sub(r'\D', '', value))


class PricingTables(HTMLParser):
    def __init__(self, rel: str):
        super().__init__(convert_charrefs=True)
        self.rel = rel
        self.recent: list[str] = []
        self.tables: list[dict] = []
        self.table: dict | None = None
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag, attrs):
        if tag == 'table':
            self.table = {'context': ' '.join(self.recent)[-700:], 'rows': []}
        elif tag == 'tr' and self.table is not None:
            self.row = []
        elif tag in ('th', 'td') and self.row is not None:
            self.cell = []

    def handle_endtag(self, tag):
        if tag in ('th', 'td') and self.cell is not None and self.row is not None:
            self.row.append(re.sub(r'\s+', ' ', ''.join(self.cell)).strip())
            self.cell = None
        elif tag == 'tr' and self.row is not None and self.table is not None:
            self.table['rows'].append(self.row)
            self.row = None
        elif tag == 'table' and self.table is not None:
            self.tables.append(self.table)
            self.table = None

    def handle_data(self, data):
        if self.cell is not None:
            self.cell.append(data)
        elif self.table is None and data.strip():
            self.recent.append(data.strip())
            self.recent = self.recent[-50:]

    def validate(self) -> int:
        checked = 0
        for table in self.tables:
            rows = table['rows']
            if not rows:
                continue
            headers = rows[0]
            rates = []
            for header in headers:
                match = re.search(r'([$€])\s*([\d,]+)\s*/\s*(?:user|utilisateur)\s*/\s*(?:mo|month)', header, re.I)
                rates.append((match.group(1), number(match.group(2))) if match else None)
            if not any(rates):
                implied = IMPLICIT_TABLE_RATES.get(self.rel, {})
                rates = [implied.get(header) for header in headers]
            if not any(rates):
                continue
            annual = bool(re.search(r'annual|annuel|per year|par an|/yr|/year|/an\b', table['context'], re.I))
            annual |= any(re.search(r'/yr|/year|/an\b', cell, re.I) for row in rows[1:] for cell in row)
            if not annual:
                continue
            for row in rows[1:]:
                if not row:
                    continue
                team = re.search(r'(\d+)\s*(?:users?|utilisateurs?)', row[0], re.I)
                if not team:
                    continue
                seats = int(team.group(1))
                for idx, rate in enumerate(rates):
                    if rate is None or idx >= len(row):
                        continue
                    currency, monthly = rate
                    cell = row[idx]
                    match = re.fullmatch(r'([$€])\s*([\d,]+)(?:\s*/\s*(?:yr|year|an))?', cell, re.I)
                    if not match:
                        match = re.fullmatch(r'([\d, ]+)\s*([$€])(?:\s*/\s*(?:yr|year|an))?', cell, re.I)
                    if not match:
                        continue
                    if cell.startswith(currency):
                        actual_currency = cell[0]
                        actual = number(cell)
                    else:
                        actual_currency = currency
                        actual = number(cell)
                    expected = seats * monthly * 12
                    if actual_currency != currency or actual != expected:
                        raise AssertionError(
                            f'{self.rel}: {seats} seats, {headers[idx]}: '
                            f'expected {currency}{expected:,}/year, found {cell!r}'
                        )
                    checked += 1
        return checked


def main() -> int:
    errors: list[str] = []
    source_files = [p for p in ROOT.rglob('*.html') if not {'dist', 'node_modules', '.git'}.intersection(p.parts)]
    source_files += [ROOT / 'scripts/generate_p0_pages.py']
    for path in source_files:
        text = path.read_text()
        for label, pattern in FORBIDDEN.items():
            match = pattern.search(text)
            if match:
                errors.append(f'{path.relative_to(ROOT)}: {label}: {match.group(0)!r}')

    for rel, needles in REQUIRED.items():
        text = (ROOT / rel).read_text()
        for needle in needles:
            if needle not in text:
                errors.append(f'{rel}: missing current fact {needle!r}')

    checked = 0
    tables_seen = 0
    for path in source_files:
        if path.suffix != '.html':
            continue
        parser = PricingTables(str(path.relative_to(ROOT)))
        parser.feed(path.read_text())
        tables_seen += len(parser.tables)
        try:
            checked += parser.validate()
        except AssertionError as exc:
            errors.append(str(exc))

    if checked < 20:
        errors.append(f'Arithmetic coverage too low: only {checked} annual cells checked')
    if errors:
        print('COMMERCIAL AUDIT FAILED')
        for error in errors:
            print(' -', error)
        return 1
    print(f'COMMERCIAL AUDIT OK: {len(source_files)} source files scanned; {tables_seen} tables inspected; {checked} annual price cells recalculated.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
