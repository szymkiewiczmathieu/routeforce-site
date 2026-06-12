const { google } = require('googleapis');
const path = require('path');

const KEY_PATH = '/home/node/.openclaw/secrets/gsc-mcp-routeforce.json';

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  // Calculate date range: last 28 days (GSC data has ~3 day lag)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 3);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 27);

  const fmt = (d) => d.toISOString().split('T')[0];

  console.log(`Date range: ${fmt(startDate)} to ${fmt(endDate)}\n`);

  // Try both possible site URL formats
  const siteUrls = ['sc-domain:routeforce.app', 'https://routeforce.app/'];

  for (const siteUrl of siteUrls) {
    try {
      console.log(`Trying site URL: ${siteUrl}`);
      const res = await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: ['query', 'page'],
          rowLimit: 500,
          startRow: 0,
        },
      });

      const rows = res.data.rows || [];
      if (rows.length === 0) {
        console.log('No data returned.\n');
        continue;
      }

      // Sort by impressions descending
      rows.sort((a, b) => b.impressions - a.impressions);

      // Aggregate by query (since we have query+page dimensions)
      const queryMap = new Map();
      for (const row of rows) {
        const query = row.keys[0];
        if (!queryMap.has(query)) {
          queryMap.set(query, { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0, count: 0 });
        }
        const q = queryMap.get(query);
        q.clicks += row.clicks;
        q.impressions += row.impressions;
        q.count += 1;
        // Weighted position by impressions
        q.posSum += row.position * row.impressions;
      }

      // Convert to array and sort by impressions
      const queries = Array.from(queryMap.entries())
        .map(([query, d]) => ({
          query,
          clicks: d.clicks,
          impressions: d.impressions,
          ctr: d.clicks / d.impressions,
          position: d.posSum / d.impressions,
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 50);

      console.log(`\nSuccess! ${rows.length} rows fetched, ${queryMap.size} unique queries.\n`);
      console.log('TOP 50 QUERIES BY IMPRESSIONS');
      console.log('='.repeat(120));
      console.log(
        '#'.padStart(3) + '  ' +
        'Query'.padEnd(45) +
        'Clicks'.padStart(8) +
        'Impressions'.padStart(13) +
        'CTR'.padStart(8) +
        'Avg Position'.padStart(14)
      );
      console.log('-'.repeat(120));

      queries.forEach((q, i) => {
        const queryStr = q.query.length > 43 ? q.query.substring(0, 43) + '..' : q.query;
        console.log(
          String(i + 1).padStart(3) + '  ' +
          queryStr.padEnd(45) +
          String(q.clicks).padStart(8) +
          String(q.impressions).padStart(13) +
          (q.ctr * 100).toFixed(1).padStart(7) + '%' +
          q.position.toFixed(1).padStart(14)
        );
      });

      // Also show top pages
      const pageMap = new Map();
      for (const row of rows) {
        const page = row.keys[1];
        if (!pageMap.has(page)) {
          pageMap.set(page, { clicks: 0, impressions: 0, posSum: 0 });
        }
        const p = pageMap.get(page);
        p.clicks += row.clicks;
        p.impressions += row.impressions;
        p.posSum += row.position * row.impressions;
      }

      const pages = Array.from(pageMap.entries())
        .map(([page, d]) => ({
          page,
          clicks: d.clicks,
          impressions: d.impressions,
          ctr: d.clicks / d.impressions,
          position: d.posSum / d.impressions,
        }))
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 20);

      console.log('\n\nTOP 20 PAGES BY IMPRESSIONS');
      console.log('='.repeat(120));
      console.log(
        '#'.padStart(3) + '  ' +
        'Page'.padEnd(60) +
        'Clicks'.padStart(8) +
        'Impressions'.padStart(13) +
        'CTR'.padStart(8) +
        'Avg Position'.padStart(14)
      );
      console.log('-'.repeat(120));

      pages.forEach((p, i) => {
        const pageStr = p.page.length > 58 ? p.page.substring(0, 58) + '..' : p.page;
        console.log(
          String(i + 1).padStart(3) + '  ' +
          pageStr.padEnd(60) +
          String(p.clicks).padStart(8) +
          String(p.impressions).padStart(13) +
          (p.ctr * 100).toFixed(1).padStart(7) + '%' +
          p.position.toFixed(1).padStart(14)
        );
      });

      console.log('\n\nTotals:');
      const totalClicks = queries.reduce((s, q) => s + q.clicks, 0);
      const totalImpressions = queries.reduce((s, q) => s + q.impressions, 0);
      console.log(`  Total clicks: ${totalClicks}`);
      console.log(`  Total impressions: ${totalImpressions}`);
      console.log(`  Overall CTR: ${(totalClicks / totalImpressions * 100).toFixed(1)}%`);

      return; // Success, stop trying other URLs
    } catch (err) {
      console.log(`Error with ${siteUrl}: ${err.message}\n`);
    }
  }
}

main().catch(console.error);
