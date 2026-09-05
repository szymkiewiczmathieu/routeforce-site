const REDIRECTS = new Map([
  ['/en', '/'],
  ['/en/', '/'],
  ['/en/index.html', '/'],
  ['/en/use-cases.html', '/use-cases.html'],
  ['/en/pricing.html', '/pricing.html'],
  ['/en/field-sales-route-optimization.html', '/field-sales-route-optimization.html'],
  ['/en/visit-planning-salesforce.html', '/visit-planning-salesforce.html'],
  ['/en/flat-rate-route-optimization.html', '/pricing.html'],
  ['/en/salesforce-route-planning.html', '/salesforce-route-planning.html'],
  ['/en/docs/', '/docs/'],
  ['/en/docs', '/docs/'],
  ['/en/blog/', '/blog/'],
  ['/en/blog', '/blog/'],
  ['/es', '/'],
  ['/es/', '/'],
  ['/es/index.html', '/'],
  ['/es/casos-de-uso.html', '/use-cases.html'],
  ['/es/pricing.html', '/pricing.html'],
  ['/es/docs/', '/docs/'],
  ['/es/docs', '/docs/'],
  ['/es/blog/', '/blog/'],
  ['/es/blog', '/blog/'],
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

const DIRECTORY_INDEXES = new Map([
  ['/', '/index.html'],
  ['/docs/', '/docs/index.html'],
  ['/blog/', '/blog/index.html'],
]);

function redirect(url, pathname, status = 301, origin = url.origin) {
  const destination = new URL(pathname, origin);
  destination.search = url.search;
  return Response.redirect(destination.toString(), status);
}

function canonicalOrigin(url) {
  const origin = new URL(url.origin);
  origin.hostname = 'gettourvia.com';
  return origin.toString();
}

function extensionlessHtmlPath(pathname) {
  if (pathname.endsWith('/') || /\.[^/]+$/.test(pathname)) return null;
  return `${pathname}.html`;
}

function withHeaders(response, hostname, pathname) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  headers.set('X-Frame-Options', 'SAMEORIGIN');

  if (hostname.endsWith('.workers.dev')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  if (/\.(?:css|js|svg|png|jpe?g|webp|ico|mp4|woff2?)$/i.test(pathname)) {
    headers.set('Cache-Control', 'public, max-age=86400');
  } else if (/\.html$/i.test(pathname) || pathname.endsWith('/')) {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    const htmlPath = extensionlessHtmlPath(pathname);
    const directTarget = REDIRECTS.get(pathname);
    const extensionTarget = htmlPath ? REDIRECTS.get(htmlPath) : null;
    const canonical = canonicalOrigin(url);

    // Resolve mapped aliases before normalising the host or adding .html. This keeps
    // retired paths to a single permanent redirect, including on www.
    if (directTarget || extensionTarget) {
      return redirect(url, directTarget || extensionTarget, 301, canonical);
    }

    const indexAsset = DIRECTORY_INDEXES.get(pathname);
    if (indexAsset) {
      if (url.hostname === 'www.gettourvia.com') return redirect(url, pathname, 301, canonical);
      const assetRequest = new Request(new URL(indexAsset, request.url), {
        method: request.method,
        headers: request.headers,
      });
      const response = await env.ASSETS.fetch(assetRequest);
      return withHeaders(response, url.hostname, pathname);
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      if (url.hostname === 'www.gettourvia.com') return redirect(url, pathname, 301, canonical);
      return withHeaders(response, url.hostname, pathname);
    }

    // Keep existing public URLs canonical: extensionless requests redirect to .html when that asset exists.
    if (htmlPath) {
      const htmlUrl = new URL(htmlPath, url.origin);
      const htmlResponse = await env.ASSETS.fetch(htmlUrl);
      if (htmlResponse.status !== 404) return redirect(url, htmlPath, 301, canonical);
    }

    if (url.hostname === 'www.gettourvia.com') return redirect(url, pathname, 301, canonical);

    const notFound = await env.ASSETS.fetch(new URL('/404.html', url.origin));
    const headers = new Headers(notFound.headers);
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (url.hostname.endsWith('.workers.dev')) headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(notFound.body, { status: 404, headers });
  },
};
