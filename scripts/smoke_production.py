#!/usr/bin/env python3
"""Post-deployment production smoke tests for gettourvia.com."""

from __future__ import annotations

import time
from urllib.error import HTTPError
from urllib.request import HTTPRedirectHandler, Request, build_opener

ORIGIN = "https://gettourvia.com"


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = build_opener(NoRedirect)
CHECKS = {
    "/": 200,
    "/pricing.html": 200,
    "/blog/": 200,
    "/docs/": 200,
    "/en/": 301,
    "/es/": 301,
    "/flat-rate-route-optimization.html": 301,
    "/blog/salesforce-maps-alternative.html": 301,
    "/definitely-not-a-page": 404,
}


def status(path: str) -> tuple[int, str]:
    request = Request(ORIGIN + path, headers={"User-Agent": "TourviaDeploySmoke/1.0"})
    try:
        response = OPENER.open(request, timeout=30)
        return response.status, response.headers.get("Location", "")
    except HTTPError as exc:
        return exc.code, exc.headers.get("Location", "")


def run_checks() -> list[str]:
    errors: list[str] = []
    for path, expected in CHECKS.items():
        actual, location = status(path)
        if actual != expected:
            errors.append(f"{path}: expected {expected}, got {actual}")
        if actual == 301 and location in {path, ORIGIN + path}:
            errors.append(f"{path}: self-redirect")

    request = Request(
        "https://www.gettourvia.com/pricing.html?source=www",
        headers={"User-Agent": "TourviaDeploySmoke/1.0"},
    )
    try:
        response = OPENER.open(request, timeout=30)
        www_status = response.status
        www_location = response.headers.get("Location", "")
    except HTTPError as exc:
        www_status = exc.code
        www_location = exc.headers.get("Location", "")
    if www_status != 301 or www_location != "https://gettourvia.com/pricing.html?source=www":
        errors.append(f"www redirect: {www_status} {www_location}")
    return errors


def main() -> int:
    errors: list[str] = []
    for attempt in range(1, 7):
        errors = run_checks()
        if not errors:
            print(f"Production smoke passed ({len(CHECKS) + 1} checks)")
            return 0
        if attempt < 6:
            time.sleep(10)
    for error in errors:
        print(error)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
