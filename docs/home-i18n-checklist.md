# Home FR/EN/ES alignment checklist

Use this quick checklist whenever homepage messaging changes in one locale.

## Source of truth
- Pick one reference locale for the change (usually FR first).
- List the sections touched before editing translations: SEO meta, hero badge, H1, hero subtitle, proof points, problem/solution block, features section, CTA labels.

## Cross-locale review
- Verify the same offer facts exist in FR, EN, and ES: trial, setup promo, pricing wording, native Salesforce wording, hosting/privacy wording.
- Check that unsupported claims were not reintroduced in one locale only.
- Keep feature names aligned conceptually, even if not translated word-for-word.

## Safe final check
- Re-read `index.html`, `en/index.html`, and `es/index.html` side by side on the touched sections.
- If HTML was edited manually, verify no card/section wrapper was left unclosed in one locale.
- Prefer one atomic PR for the reference locale, then one atomic alignment PR for the other locales if needed.
