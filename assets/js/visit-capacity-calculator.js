/* Field-sales visit capacity calculator. All scenario math stays in the current browser tab. */
(function () {
  'use strict';

  var doc = document;
  var form = doc.getElementById('capacity-form');
  var results = doc.getElementById('results');
  var formStatus = doc.getElementById('form-status');
  var loadExample = doc.getElementById('load-example');
  var resetCalculator = doc.getElementById('reset-calculator');
  var clearResults = doc.getElementById('clear-results');
  var downloadSummary = doc.getElementById('download-summary');
  var lastScenario = null;
  var tiers = [
    { key: 'a', name: 'Priority tier A' },
    { key: 'b', name: 'Standard tier B' },
    { key: 'c', name: 'Coverage tier C' }
  ];

  function byId(id) { return doc.getElementById(id); }
  function numberFormat(value, decimals) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals === undefined ? 1 : decimals }).format(value);
  }
  function setStatus(message, isError) {
    formStatus.textContent = message;
    formStatus.classList.toggle('is-error', Boolean(isError));
  }
  function markInvalid(element, invalid) {
    element.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }
  function readNumber(id, label, options) {
    var element = byId(id);
    var raw = String(element.value || '').trim();
    var value = Number(raw);
    var min = options && options.min !== undefined ? options.min : -Infinity;
    var max = options && options.max !== undefined ? options.max : Infinity;
    var integer = Boolean(options && options.integer);
    if (!raw || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
      markInvalid(element, true);
      throw new Error(label + ' must be ' + (integer ? 'a whole number' : 'a number') + ' between ' + numberFormat(min, 2) + ' and ' + numberFormat(max, 2) + '.');
    }
    markInvalid(element, false);
    return value;
  }
  function clearInvalid() {
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (element) { markInvalid(element, false); });
  }
  function tierPreview(tier) {
    var accounts = Number(byId('tier-' + tier.key + '-accounts').value || 0);
    var cadence = Number(byId('tier-' + tier.key + '-cadence').value || 0);
    var output = byId('tier-' + tier.key + '-required');
    output.textContent = accounts && cadence ? numberFormat(accounts * cadence) : '—';
  }
  function updateTierPreviews() { tiers.forEach(tierPreview); }
  function readTier(tier) {
    var accountsElement = byId('tier-' + tier.key + '-accounts');
    var cadenceElement = byId('tier-' + tier.key + '-cadence');
    var accountsRaw = String(accountsElement.value || '').trim();
    var cadenceRaw = String(cadenceElement.value || '').trim();
    if (!accountsRaw && !cadenceRaw) { return { name: tier.name, accounts: 0, cadence: 0, required: 0 }; }
    var accounts = readNumber('tier-' + tier.key + '-accounts', tier.name + ' accounts', { min: 0, max: 10000000, integer: true });
    var cadence = readNumber('tier-' + tier.key + '-cadence', tier.name + ' visits per period', { min: 0, max: 365 });
    return { name: tier.name, accounts: accounts, cadence: cadence, required: accounts * cadence };
  }
  function readScenario(isIllustrative) {
    var period = byId('period').value;
    if (!period) {
      markInvalid(byId('period'), true);
      throw new Error('Select the planning period used by this scenario.');
    }
    markInvalid(byId('period'), false);
    var scenario = {
      period: period,
      reps: readNumber('rep-count', 'Field reps', { min: 1, max: 100000, integer: true }),
      fieldDays: readNumber('field-days', 'Field days per rep', { min: 0.1, max: 366 }),
      fieldHours: readNumber('field-hours', 'Field hours', { min: 0.1, max: 24 }),
      adminHours: readNumber('admin-hours', 'Admin hours', { min: 0, max: 23.9 }),
      buffer: readNumber('buffer-percent', 'Absence / contingency buffer', { min: 0, max: 95 }),
      travelMinutes: readNumber('travel-minutes', 'Average travel', { min: 0, max: 1440 }),
      visitMinutes: readNumber('visit-minutes', 'Average visit duration', { min: 1, max: 1440 }),
      tiers: tiers.map(readTier),
      isIllustrative: Boolean(isIllustrative)
    };
    if (scenario.adminHours >= scenario.fieldHours) {
      markInvalid(byId('admin-hours'), true);
      throw new Error('Admin hours must be lower than field hours so that this scenario has field time available.');
    }
    scenario.requiredVisits = scenario.tiers.reduce(function (sum, tier) { return sum + tier.required; }, 0);
    if (!scenario.requiredVisits) {
      throw new Error('Enter at least one account tier with a visit cadence greater than zero.');
    }
    scenario.minutesPerVisit = scenario.visitMinutes + scenario.travelMinutes;
    scenario.effectiveMinutesPerRep = scenario.fieldDays * (scenario.fieldHours - scenario.adminHours) * 60 * (1 - (scenario.buffer / 100));
    scenario.teamMinutes = scenario.reps * scenario.effectiveMinutesPerRep;
    scenario.capacity = Math.floor(scenario.teamMinutes / scenario.minutesPerVisit);
    scenario.balance = scenario.capacity - scenario.requiredVisits;
    scenario.repEquivalent = (scenario.requiredVisits * scenario.minutesPerVisit) / scenario.effectiveMinutesPerRep;
    scenario.coveragePercent = (scenario.capacity / scenario.requiredVisits) * 100;
    return scenario;
  }
  function definitionList(container, rows) {
    container.replaceChildren();
    rows.forEach(function (row) {
      var wrap = doc.createElement('div');
      var term = doc.createElement('dt');
      var detail = doc.createElement('dd');
      term.textContent = row[0];
      detail.textContent = row[1];
      wrap.append(term, detail);
      container.appendChild(wrap);
    });
  }
  function renderScenario(scenario) {
    lastScenario = scenario;
    results.hidden = false;
    byId('result-period').textContent = scenario.isIllustrative ? 'Illustrative ' + scenario.period + ' scenario · replace every input with your own operating assumptions.' : 'Current ' + scenario.period + ' scenario · all values come from the inputs above.';
    byId('visits-required').textContent = numberFormat(scenario.requiredVisits);
    byId('visit-capacity').textContent = numberFormat(scenario.capacity, 0);
    byId('coverage-balance').textContent = (scenario.balance > 0 ? '+' : '') + numberFormat(scenario.balance);
    byId('rep-equivalent').textContent = numberFormat(scenario.repEquivalent) + ' reps';
    var balanceMetric = byId('coverage-balance').closest('.metric');
    balanceMetric.setAttribute('data-tone', scenario.balance >= 0 ? 'good' : 'gap');
    var status = byId('scenario-status');
    var marker = byId('scenario-marker');
    if (scenario.balance >= 0) {
      status.setAttribute('data-tone', 'good');
      marker.textContent = '✓';
      byId('scenario-title').textContent = scenario.isIllustrative ? 'Illustrative scenario: modeled slots cover its entered demand' : 'Modeled slots cover the entered visit demand';
      byId('scenario-copy').textContent = (scenario.isIllustrative ? 'The example is not a benchmark. ' : '') + numberFormat(scenario.capacity) + ' modeled slots versus ' + numberFormat(scenario.requiredVisits) + ' visits required. Geography, route sequence and appointments still need a field-level check.';
    } else {
      status.setAttribute('data-tone', 'gap');
      marker.textContent = '!';
      byId('scenario-title').textContent = scenario.isIllustrative ? 'Illustrative scenario: modeled capacity gap' : 'The scenario has a modeled capacity gap';
      byId('scenario-copy').textContent = (scenario.isIllustrative ? 'The example is not a benchmark. ' : '') + numberFormat(Math.abs(scenario.balance)) + ' more visit slots are required under the assumptions entered. This is a planning prompt, not a staffing recommendation.';
    }
    definitionList(byId('tier-summary'), scenario.tiers.map(function (tier) {
      return [tier.name, numberFormat(tier.accounts) + ' accounts × ' + numberFormat(tier.cadence, 2) + ' = ' + numberFormat(tier.required) + ' visits'];
    }).concat([['Total demand', numberFormat(scenario.requiredVisits) + ' visits per ' + scenario.period]]));
    definitionList(byId('time-summary'), [
      ['Time per visit', numberFormat(scenario.minutesPerVisit, 1) + ' minutes'],
      ['Effective time per rep', numberFormat(scenario.effectiveMinutesPerRep / 60, 1) + ' hours per ' + scenario.period],
      ['Effective team time', numberFormat(scenario.teamMinutes / 60, 1) + ' hours per ' + scenario.period],
      ['Modeled capacity ratio', numberFormat(scenario.coveragePercent, 0) + '% of visit demand']
    ]);
    results.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  function calculate(event, isIllustrative) {
    if (event) { event.preventDefault(); }
    clearInvalid();
    try {
      var scenario = readScenario(isIllustrative);
      renderScenario(scenario);
      setStatus('Scenario calculated locally. Nothing was stored or sent.', false);
    } catch (error) {
      results.hidden = true;
      setStatus(error.message, true);
    }
  }
  function fillExample() {
    var values = {
      period: 'month', 'rep-count': 4, 'field-days': 18, 'field-hours': 7, 'admin-hours': 1,
      'buffer-percent': 10, 'travel-minutes': 30, 'visit-minutes': 45,
      'tier-a-accounts': 80, 'tier-a-cadence': 1, 'tier-b-accounts': 140, 'tier-b-cadence': 0.5,
      'tier-c-accounts': 200, 'tier-c-cadence': 0.25
    };
    Object.keys(values).forEach(function (id) { byId(id).value = values[id]; });
    updateTierPreviews();
    calculate(null, true);
  }
  function clearAll() {
    form.reset();
    lastScenario = null;
    results.hidden = true;
    clearInvalid();
    updateTierPreviews();
    setStatus('Inputs cleared. Nothing is stored or sent.', false);
  }
  function downloadLocalSummary() {
    if (!lastScenario) { return; }
    var s = lastScenario;
    var lines = [
      'Field-sales visit capacity scenario',
      'Scenario source: ' + (s.isIllustrative ? 'illustrative example — replace with your own assumptions' : 'current browser inputs'),
      'Planning period: ' + s.period,
      'Field reps: ' + s.reps,
      'Field days per rep: ' + s.fieldDays,
      'Field hours per day: ' + s.fieldHours,
      'Admin hours per day: ' + s.adminHours,
      'Absence / contingency buffer: ' + s.buffer + '%',
      'Average visit duration: ' + s.visitMinutes + ' minutes',
      'Average travel: ' + s.travelMinutes + ' minutes',
      '',
      'Visits required: ' + s.requiredVisits,
      'Modeled visit slots: ' + s.capacity,
      'Coverage balance: ' + s.balance,
      'Rep-equivalent demand: ' + s.repEquivalent.toFixed(2),
      '',
      'This local scenario is not a forecast, hiring recommendation, route calculation or savings claim.'
    ];
    s.tiers.forEach(function (tier) { lines.push(tier.name + ': ' + tier.accounts + ' accounts × ' + tier.cadence + ' = ' + tier.required + ' visits'); });
    var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    var link = doc.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'field-sales-visit-capacity-scenario.txt';
    doc.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  form.addEventListener('submit', calculate);
  form.querySelectorAll('input').forEach(function (input) { input.addEventListener('input', updateTierPreviews); });
  loadExample.addEventListener('click', fillExample);
  resetCalculator.addEventListener('click', clearAll);
  clearResults.addEventListener('click', clearAll);
  downloadSummary.addEventListener('click', downloadLocalSummary);
  updateTierPreviews();
  window.TourviaVisitCapacity = { calculateScenario: readScenario, loadIllustrativeScenario: fillExample };
}());
