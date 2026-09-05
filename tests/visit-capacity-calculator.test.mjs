import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function calculatorApi() {
  const source = readFileSync(new URL('../assets/js/visit-capacity-calculator.js', import.meta.url), 'utf8');
  const context = vm.createContext({ window: {}, document: { getElementById: () => null } });
  vm.runInContext(source, context, { filename: 'visit-capacity-calculator.js' });
  return context.window.TourviaVisitCapacity;
}

const api = calculatorApi();
const calculate = (input) => api.calculateScenario(input);
const baseline = {
  teamSize: '1', fieldDaysPerRepPerWeek: '5', fieldHoursPerDay: '8', visitMinutes: '60',
  travelMinutesBetweenVisits: '30', fixedNonVisitMinutes: '60', accountsInScope: '20',
  targetVisitsPerAccount: '1', planningHorizonWeeks: '4'
};

test('calculates the published daily, weekly, period, target, and cadence model', () => {
  const s = calculate(baseline);
  assert.deepEqual(
    { usable: s.usableMinutesPerDay, daily: s.dailyVisits, repWeek: s.visitsPerRepPerWeek, teamWeek: s.teamVisitsPerWeek, period: s.teamVisitsInPeriod, required: s.requiredVisitsInPeriod, balance: s.balance, load: s.targetLoadPercent, minReps: s.minimumReps },
    { usable: 420, daily: 5, repWeek: 25, teamWeek: 25, period: 100, required: 20, balance: 80, load: 20, minReps: 1 }
  );
  assert.equal(s.cadence.visitsPerAccountPerWeek, 1.25);
  assert.equal(s.status, 'Modeled capacity meets the entered target');
});

test('accepts a zero-team scenario as entered, not as missing', () => {
  const s = calculate({ ...baseline, teamSize: '0' });
  assert.equal(s.dailyVisits, 5);
  assert.equal(s.teamVisitsInPeriod, 0);
  assert.equal(s.balance, -20);
  assert.equal(s.targetLoadPercent, null);
  assert.equal(s.minimumReps, 1);
});

test('handles zero day allocation and a zero capacity without invented values', () => {
  const s = calculate({ ...baseline, teamSize: '10', fieldDaysPerRepPerWeek: '0', fieldHoursPerDay: '0', visitMinutes: '30', travelMinutesBetweenVisits: '0', fixedNonVisitMinutes: '0', accountsInScope: '10', targetVisitsPerAccount: '1' });
  assert.equal(s.usableMinutesPerDay, 0);
  assert.equal(s.dailyVisits, 0);
  assert.equal(s.teamVisitsInPeriod, 0);
  assert.equal(s.cadence, null);
  assert.equal(s.minimumReps, null);
  assert.equal(s.reservedTimeExhaustsDay, false);
});

test('supports fractional field days and hours using travel only between visits', () => {
  const s = calculate({ ...baseline, teamSize: '3', fieldDaysPerRepPerWeek: '2.5', fieldHoursPerDay: '7.25', visitMinutes: '45', travelMinutesBetweenVisits: '20', fixedNonVisitMinutes: '35', accountsInScope: '50', targetVisitsPerAccount: '2', planningHorizonWeeks: '6' });
  assert.deepEqual(
    { usable: s.usableMinutesPerDay, daily: s.dailyVisits, repWeek: s.visitsPerRepPerWeek, teamWeek: s.teamVisitsPerWeek, period: s.teamVisitsInPeriod, required: s.requiredVisitsInPeriod, balance: s.balance, load: Number(s.targetLoadPercent.toFixed(2)), minReps: s.minimumReps },
    { usable: 400, daily: 6, repWeek: 15, teamWeek: 45, period: 270, required: 100, balance: 170, load: 37.04, minReps: 2 }
  );
  assert.equal(Number(s.cadence.weeksPerVisit.toFixed(2)), 1.11);
});

test('accepts zero travel and reserved time', () => {
  const s = calculate({ ...baseline, teamSize: '2', fieldDaysPerRepPerWeek: '4', fieldHoursPerDay: '4', visitMinutes: '60', travelMinutesBetweenVisits: '0', fixedNonVisitMinutes: '0', accountsInScope: '32', targetVisitsPerAccount: '1' });
  assert.equal(s.usableMinutesPerDay, 240);
  assert.equal(s.dailyVisits, 4);
  assert.equal(s.teamVisitsInPeriod, 128);
  assert.equal(s.balance, 96);
});

test('clamps an impossible time window to zero with a warning flag', () => {
  const s = calculate({ ...baseline, teamSize: '5', fieldDaysPerRepPerWeek: '5', fieldHoursPerDay: '2', visitMinutes: '30', travelMinutesBetweenVisits: '15', fixedNonVisitMinutes: '150', accountsInScope: '10', targetVisitsPerAccount: '1' });
  assert.equal(s.usableMinutesPerDay, 0);
  assert.equal(s.dailyVisits, 0);
  assert.equal(s.reservedTimeExhaustsDay, true);
  assert.equal(s.minimumReps, null);
});

test('accepts an exact daily time boundary', () => {
  const s = calculate({ ...baseline, teamSize: '1', fieldDaysPerRepPerWeek: '1', fieldHoursPerDay: '2', visitMinutes: '30', travelMinutesBetweenVisits: '15', fixedNonVisitMinutes: '0', accountsInScope: '3', targetVisitsPerAccount: '1', planningHorizonWeeks: '1' });
  assert.equal(s.dailyVisits, 3);
  assert.equal(s.teamVisitsInPeriod, 3);
  assert.equal(s.balance, 0);
  assert.equal(s.targetLoadPercent, 100);
});

test('keeps a zero target distinct from a missing target', () => {
  const s = calculate({ ...baseline, teamSize: '2', fieldDaysPerRepPerWeek: '5', fieldHoursPerDay: '8', visitMinutes: '60', travelMinutesBetweenVisits: '30', fixedNonVisitMinutes: '60', accountsInScope: '0', targetVisitsPerAccount: '0' });
  assert.equal(s.teamVisitsInPeriod, 200);
  assert.equal(s.requiredVisitsInPeriod, 0);
  assert.equal(s.status, 'No target visit volume entered');
  assert.equal(s.targetLoadPercent, null);
  assert.equal(s.minimumReps, 0);
});

test('rejects zero visit duration, unsafe values, and scientific notation', () => {
  assert.throws(() => calculate({ ...baseline, visitMinutes: '0' }), /visit duration greater than 0/);
  assert.throws(() => calculate({ ...baseline, teamSize: '999999999999' }), /Enter a value from 0 to 100,000/);
  assert.throws(() => calculate({ ...baseline, fieldHoursPerDay: '24.01' }), /Enter a value from 0 to 24/);
  assert.throws(() => calculate({ ...baseline, fieldDaysPerRepPerWeek: '1e3' }), /up to 2 decimal places/);
});
