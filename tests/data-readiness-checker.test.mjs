import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function checkerApi() {
  const source = readFileSync(new URL('../assets/js/data-readiness-checker.js', import.meta.url), 'utf8');
  const context = vm.createContext({
    window: {},
    document: { getElementById: () => null },
    console
  });
  vm.runInContext(source, context, { filename: 'data-readiness-checker.js' });
  return context.window.TourviaDataReadiness;
}

const api = checkerApi();

test('rejects text after a quoted CSV field closes', () => {
  assert.throws(
    () => api.parseCsv('A,B\n"abc"x,def'),
    /text after its closing quote/
  );
});

test('keeps quoted commas and CRLF CSV rows intact', () => {
  const parsed = api.parseCsv('Name,BillingLatitude,BillingLongitude\r\n"Acme, North",48.8,2.3\r\n');
  assert.equal(parsed.rows[0][0], 'Acme, North');
  assert.equal(parsed.rows[0][1], '48.8');
});

test('does not merge coordinate families into a false pair', () => {
  const parsed = api.parseCsv('BillingLatitude,ShippingLongitude\n48,2');
  const report = api.analyse(parsed.headers, parsed.rows);
  assert.equal(report.coordinate.available, false);
  assert.equal(report.status.title, 'Coordinate fields were not detected');
});

test('counts exact numeric duplicate coordinates without rounding distinct pairs together', () => {
  const distinct = api.parseCsv('Latitude,Longitude\n48.12345640,2\n48.12345649,2');
  const distinctReport = api.analyse(distinct.headers, distinct.rows);
  assert.equal(distinctReport.coordinate.valid, 2);
  assert.equal(distinctReport.coordinate.repeated, 0);

  const duplicate = api.parseCsv('Latitude,Longitude\n48.1234564,2\n48.123456400,2');
  const duplicateReport = api.analyse(duplicate.headers, duplicate.rows);
  assert.equal(duplicateReport.coordinate.repeated, 2);
});

test('keeps GeocodeAccuracy values out of the report model while retaining aggregate coverage', () => {
  const parsed = api.parseCsv('Latitude,Longitude,GeocodeAccuracy\n48.8,2.3,Address\n48.9,2.4,secret-value');
  const report = api.analyse(parsed.headers, parsed.rows);
  assert.equal(report.accuracyFilled, 2);
  assert.equal(Object.hasOwn(report, 'accuracyDistribution'), false);
  assert.equal(JSON.stringify(report).includes('secret-value'), false);
});

test('classifies invalid ranges, zero pairs, and missing coordinate pairs separately', () => {
  const parsed = api.parseCsv('Id,Latitude,Longitude\ninvalid,91,2\nzero,0,0\nmissing,,\nvalid,48.8,2.3');
  const report = api.analyse(parsed.headers, parsed.rows);
  assert.deepEqual(
    { valid: report.coordinate.valid, invalid: report.coordinate.invalid, zero: report.coordinate.zero, missing: report.coordinate.missing },
    { valid: 1, invalid: 1, zero: 1, missing: 1 }
  );
});
