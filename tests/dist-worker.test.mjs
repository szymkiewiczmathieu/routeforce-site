import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workerSource = readFileSync(path.join(root, 'dist-worker.js'), 'utf8');
const worker = (await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString('base64')}`)).default;
const legacySource = readFileSync(path.join(root, 'redirect-worker.js'), 'utf8');
const legacyWorker = (await import(`data:text/javascript;base64,${Buffer.from(legacySource).toString('base64')}`)).default;
const redirectSection = workerSource.slice(
  workerSource.indexOf('const REDIRECTS = new Map(['),
  workerSource.indexOf(']);\n\nconst DIRECTORY_INDEXES'),
);
const redirectEntries = [...redirectSection.matchAll(/\['([^']+)', '([^']+)'\]/g)].map(([, source, target]) => [source, target]);
const legacySection = legacySource.slice(
  legacySource.indexOf('const LEGACY_REDIRECTS = new Map(['),
  legacySource.indexOf(']);\n\nfunction extensionlessHtmlPath'),
);
const legacyEntries = [...legacySection.matchAll(/\['([^']+)', '([^']+)'\]/g)].map(([, source, target]) => [source, target]);
const query = '?tag=one&tag=two&next=%2Fdocs%2F&campaign=summer%20field';

function sourcePathForAsset(pathname) {
  if (pathname === '/') return path.join(root, 'index.html');
  if (pathname.endsWith('/')) return path.join(root, pathname.slice(1), 'index.html');
  return path.join(root, pathname.slice(1));
}

const env = {
  ASSETS: {
    async fetch(input) {
      const url = new URL(input.url || input);
      const status = existsSync(sourcePathForAsset(url.pathname)) ? 200 : 404;
      return new Response(status === 200 ? 'asset' : 'missing', { status, headers: { 'content-type': 'text/html' } });
    },
  },
};

async function fetchWorker(url) {
  return worker.fetch(new Request(url), env);
}

async function assertOneHop(host, pathname, target) {
  const response = await fetchWorker(`https://${host}${pathname}${query}`);
  assert.equal(response.status, 301, `${host}${pathname} must redirect`);
  assert.equal(
    response.headers.get('location'),
    `https://gettourvia.com${target}${query}`,
    `${host}${pathname} must resolve to the final canonical URL`,
  );
  const final = await fetchWorker(response.headers.get('location'));
  assert.equal(final.status, 200, `${target} must be served after its one redirect`);
  assert.equal(final.headers.get('location'), null, `${target} must not redirect again`);
}

test('each explicit redirect resolves in one hop on apex and www while preserving repeated and encoded query values', async () => {
  for (const [source, target] of redirectEntries) {
    for (const host of ['gettourvia.com', 'www.gettourvia.com']) {
      await assertOneHop(host, source, target);
    }
  }
});

test('mapped extensionless aliases resolve directly to the mapped canonical URL', async () => {
  for (const [source, target] of redirectEntries.filter(([source]) => source.endsWith('.html'))) {
    const extensionless = source.slice(0, -'.html'.length);
    for (const host of ['gettourvia.com', 'www.gettourvia.com']) {
      await assertOneHop(host, extensionless, target);
    }
  }
});

test('every sitemap HTML URL has a one-hop extensionless canonical form on apex and www', async () => {
  const sitemap = readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const paths = [...sitemap.matchAll(/<loc>https:\/\/gettourvia\.com([^<]+\.html)<\/loc>/g)]
    .map(([, pathname]) => pathname);
  assert.ok(paths.length > 0, 'sitemap must contain HTML URLs');

  for (const htmlPath of paths) {
    const extensionless = htmlPath.slice(0, -'.html'.length);
    for (const host of ['gettourvia.com', 'www.gettourvia.com']) {
      await assertOneHop(host, extensionless, htmlPath);
    }
  }
});

test('no-slash language and directory aliases resolve in one hop', async () => {
  const expected = new Map([
    ['/en', '/'],
    ['/en/docs', '/docs/'],
    ['/en/blog', '/blog/'],
    ['/es', '/'],
    ['/es/docs', '/docs/'],
    ['/es/blog', '/blog/'],
    ['/docs', '/docs/'],
    ['/blog', '/blog/'],
  ]);

  for (const [source, target] of expected) {
    for (const host of ['gettourvia.com', 'www.gettourvia.com']) {
      await assertOneHop(host, source, target);
    }
  }
});

test('canonical assets serve directly and unknown www paths normalize once before a 404', async () => {
  for (const pathname of ['/', '/pricing.html', '/docs/']) {
    const response = await fetchWorker(`https://gettourvia.com${pathname}${query}`);
    assert.equal(response.status, 200, `${pathname} must serve on apex`);
    assert.equal(response.headers.get('location'), null, `${pathname} must not redirect on apex`);
  }

  const wwwUnknown = await fetchWorker(`https://www.gettourvia.com/definitely-not-a-page${query}`);
  assert.equal(wwwUnknown.status, 301);
  assert.equal(wwwUnknown.headers.get('location'), `https://gettourvia.com/definitely-not-a-page${query}`);
  const apexUnknown = await fetchWorker(wwwUnknown.headers.get('location'));
  assert.equal(apexUnknown.status, 404);
});

test('legacy Worker map stays in parity and resolves known extensionless paths to their final canonical target', async () => {
  assert.deepEqual(legacyEntries, redirectEntries, 'legacy and primary Workers must carry the same alias map');

  for (const [source, target] of legacyEntries) {
    const exact = await legacyWorker.fetch(new Request(`https://routeforce.app${source}${query}`));
    assert.equal(exact.status, 301);
    assert.equal(exact.headers.get('location'), `https://gettourvia.com${target}${query}`);

    if (source.endsWith('.html')) {
      const extensionless = source.slice(0, -'.html'.length);
      const derived = await legacyWorker.fetch(new Request(`https://routeforce.app${extensionless}${query}`));
      assert.equal(derived.status, 301);
      assert.equal(derived.headers.get('location'), `https://gettourvia.com${target}${query}`);
    }
  }

  const sitemap = readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const canonicalHtmlPaths = [...sitemap.matchAll(/<loc>https:\/\/gettourvia\.com([^<]+\.html)<\/loc>/g)]
    .map(([, pathname]) => pathname);
  for (const htmlPath of canonicalHtmlPaths) {
    const extensionless = htmlPath.slice(0, -'.html'.length);
    const response = await legacyWorker.fetch(new Request(`https://routeforce.app${extensionless}${query}`));
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), `https://gettourvia.com${htmlPath}${query}`);
  }
});
