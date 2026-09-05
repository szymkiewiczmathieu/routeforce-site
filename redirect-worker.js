/**
 * Redirect all traffic from routeforce.app to gettourvia.com.
 * Preserves query strings and resolves retired aliases and valid extensionless
 * public pages to their final canonical URL in one permanent redirect.
 */
const LEGACY_REDIRECTS = new Map([
  ['/en/', '/'],
  ['/en/index.html', '/'],
  ['/en/use-cases.html', '/use-cases.html'],
  ['/en/pricing.html', '/pricing.html'],
  ['/en/field-sales-route-optimization.html', '/field-sales-route-optimization.html'],
  ['/en/visit-planning-salesforce.html', '/visit-planning-salesforce.html'],
  ['/en/flat-rate-route-optimization.html', '/pricing.html'],
  ['/en/salesforce-route-planning.html', '/salesforce-route-planning.html'],
  ['/en/docs/', '/docs/'],
  ['/en/blog/', '/blog/'],
  ['/es/', '/'],
  ['/es/index.html', '/'],
  ['/es/casos-de-uso.html', '/use-cases.html'],
  ['/es/pricing.html', '/pricing.html'],
  ['/es/docs/', '/docs/'],
  ['/es/blog/', '/blog/'],
  ['/blog/optimiser-tournees-salesforce.html', '/blog/optimize-field-sales-routes-salesforce.html'],
  ['/blog/routeforce-vs-salesforce-maps-en.html', '/blog/salesforce-maps-alternatives-compared.html'],
  ['/blog/salesforce-maps-alternative-2026.html', '/blog/salesforce-maps-alternatives-compared.html'],
  ['/blog/salesforce-maps-alternative.html', '/blog/salesforce-maps-alternatives-compared.html'],
  ['/blog/what-to-compare-before-replacing-salesforce-maps.html', '/blog/salesforce-maps-alternatives-compared.html'],
  ['/blog/field-route-planning-software.html', '/field-sales-route-optimization.html'],
  ['/blog/fixed-org-pricing-vs-per-user-field-sales-software.html', '/blog/flat-pricing-vs-per-user-salesforce-field-tools.html'],
  ['/blog/route-planning-in-salesforce.html', '/salesforce-route-planning.html'],
  ['/blog/salesforce-route-planning-pricing.html', '/pricing.html'],
  ['/blog/salesforce-route-planning-software.html', '/salesforce-route-planning.html'],
  ['/blog/visit-planning-software-salesforce.html', '/visit-planning-salesforce.html'],
  ['/flat-rate-route-optimization.html', '/pricing.html'],
  ['/consulting.html', '/'],
  ['/index.html', '/'],
  ['/docs', '/docs/'],
  ['/docs/index.html', '/docs/'],
  ['/blog', '/blog/'],
  ['/blog/index.html', '/blog/'],
]);

function extensionlessHtmlPath(pathname) {
  if (pathname.endsWith('/') || /\.[^/]+$/.test(pathname)) return pathname;
  return `${pathname}.html`;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const extensionPath = extensionlessHtmlPath(url.pathname);
    const pathname = LEGACY_REDIRECTS.get(url.pathname)
      || LEGACY_REDIRECTS.get(extensionPath)
      || extensionPath;
    const target = new URL(pathname + url.search, 'https://gettourvia.com');

    return new Response(null, {
      status: 301,
      statusText: 'Moved Permanently',
      headers: {
        Location: target.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  },
};
