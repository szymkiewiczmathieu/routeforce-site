#!/usr/bin/env python3
"""Build the exact public artifact deployed to Cloudflare Workers."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
PUBLIC_DIRECTORIES = ("assets", "blog", "docs", "en", "es")
PUBLIC_FILES = (
    "style.css",
    "favicon.ico",
    "favicon.svg",
    "robots.txt",
    "sitemap.xml",
    "llms.txt",
    "llms-full.txt",
    "product-facts.md",
)
PUBLIC_ROOT_PATTERNS = ("*.html", "*.png", "*.jpg", "*.jpeg", "*.webp", "*.webmanifest")


def reject_symlinks(path: Path) -> None:
    for item in path.rglob("*"):
        if item.is_symlink():
            raise RuntimeError(f"Refusing to publish symlink: {item.relative_to(ROOT)}")


def main() -> int:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()

    copied: set[Path] = set()

    for directory_name in PUBLIC_DIRECTORIES:
        source = ROOT / directory_name
        if not source.is_dir():
            raise FileNotFoundError(f"Missing public directory: {directory_name}")
        reject_symlinks(source)
        shutil.copytree(source, DIST / directory_name)

    for file_name in PUBLIC_FILES:
        source = ROOT / file_name
        if not source.is_file():
            raise FileNotFoundError(f"Missing public file: {file_name}")
        shutil.copy2(source, DIST / file_name)
        copied.add(source.resolve())

    for pattern in PUBLIC_ROOT_PATTERNS:
        for source in ROOT.glob(pattern):
            if source.is_symlink():
                raise RuntimeError(f"Refusing to publish symlink: {source.name}")
            if source.is_file() and source.resolve() not in copied:
                shutil.copy2(source, DIST / source.name)
                copied.add(source.resolve())

    files = sorted(path.relative_to(DIST) for path in DIST.rglob("*") if path.is_file())
    if not files:
        raise RuntimeError("Public artifact is empty")

    print(f"Built dist with {len(files)} public files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
