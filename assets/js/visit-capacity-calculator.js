/* Field-sales visit capacity calculator. All scenario math stays in the current browser tab. */
(function () {
  'use strict';

  var DECIMAL = /^(?:\d+|\d*[.,]\d{1,2})$/;
  var INTEGER = /^\d+$/;

  function numberFormat(value, decimals) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals === undefined ? 2 : decimals,
      minimumFractionDigits: 0
    }).format(value);
  }

  function parseValue(rawValue, label, options) {
    var raw = String(rawValue === undefined || rawValue === null ? '' : rawValue).trim();
    if (!raw) {
      throw new Error('Enter ' + label + '.');
    }
    var integer = Boolean(options.integer);
    if (!(integer ? INTEGER : DECIMAL).test(raw)) {
      throw new Error(integer ? 'Use a whole number.' : 'Use a number with up to 2 decimal places.');
    }
    var value = Number(raw.replace(',', '.'));
    if (!Number.isFinite(value) || value < options.min || value > options.max) {
      throw new Error('Enter a value from ' + numberFormat(options.min, 2) + ' to ' + numberFormat(options.max, 2) + '.');
    }
    if (options.positive && value === 0) {
      throw new Error('Enter a visit duration greater than 0 and no more than 1,440 minutes.');
    }
    return value;
  }

  function centiMinutes(minutes) {
    return Math.round(minutes * 100);
  }

  function calculateScenario(input) {
    var scenario = {
      teamSize: parseValue(input.teamSize, 'Field reps', { integer: true, min: 0, max: 100000 }),
      fieldDaysPerRepPerWeek: parseValue(input.fieldDaysPerRepPerWeek, 'Field days per rep per week', { min: 0, max: 7 }),
      fieldHoursPerDay: parseValue(input.fieldHoursPerDay, 'Field hours per day', { min: 0, max: 24 }),
      visitMinutes: parseValue(input.visitMinutes, 'Average visit duration', { min: 0, max: 1440, positive: true }),
      travelMinutesBetweenVisits: parseValue(input.travelMinutesBetweenVisits, 'Average travel between consecutive visits', { min: 0, max: 1440 }),
      fixedNonVisitMinutes: parseValue(input.fixedNonVisitMinutes, 'Reserved non-visit time per field day', { min: 0, max: 1440 }),
      accountsInScope: parseValue(input.accountsInScope, 'Accounts in scope', { integer: true, min: 0, max: 100000000 }),
      targetVisitsPerAccount: parseValue(input.targetVisitsPerAccount, 'Target visits per account in the period', { integer: true, min: 0, max: 10000 }),
      planningHorizonWeeks: parseValue(input.planningHorizonWeeks, 'Planning period in weeks', { integer: true, min: 1, max: 520 })
    };

    var windowCenti = Math.round(scenario.fieldHoursPerDay * 60 * 100);
    var fixedCenti = centiMinutes(scenario.fixedNonVisitMinutes);
    var visitCenti = centiMinutes(scenario.visitMinutes);
    var travelCenti = centiMinutes(scenario.travelMinutesBetweenVisits);
    var usableCenti = Math.max(0, windowCenti - fixedCenti);
    var dailyVisits = usableCenti < visitCenti ? 0 : Math.floor((usableCenti + travelCenti) / (visitCenti + travelCenti));
    var visitsPerRepPerWeek = dailyVisits * scenario.fieldDaysPerRepPerWeek;
    var teamVisitsPerWeek = visitsPerRepPerWeek * scenario.teamSize;
    var teamVisitsInPeriod = teamVisitsPerWeek * scenario.planningHorizonWeeks;
    var requiredVisitsInPeriod = scenario.accountsInScope * scenario.targetVisitsPerAccount;
    var balance = teamVisitsInPeriod - requiredVisitsInPeriod;
    var targetLoadPercent = requiredVisitsInPeriod > 0 && teamVisitsInPeriod > 0
      ? (requiredVisitsInPeriod / teamVisitsInPeriod) * 100
      : null;
    var cadence = scenario.accountsInScope > 0 && teamVisitsPerWeek > 0
      ? {
          visitsPerAccountPerWeek: teamVisitsPerWeek / scenario.accountsInScope,
          weeksPerVisit: scenario.accountsInScope / teamVisitsPerWeek
        }
      : null;
    var minimumReps = requiredVisitsInPeriod === 0
      ? 0
      : visitsPerRepPerWeek === 0
        ? null
        : Math.ceil((requiredVisitsInPeriod / scenario.planningHorizonWeeks) / visitsPerRepPerWeek);

    return Object.assign(scenario, {
      usableMinutesPerDay: usableCenti / 100,
      dailyVisits: dailyVisits,
      visitsPerRepPerWeek: visitsPerRepPerWeek,
      teamVisitsPerWeek: teamVisitsPerWeek,
      teamVisitsInPeriod: teamVisitsInPeriod,
      requiredVisitsInPeriod: requiredVisitsInPeriod,
      balance: balance,
      targetLoadPercent: targetLoadPercent,
      cadence: cadence,
      minimumReps: minimumReps,
      reservedTimeExhaustsDay: fixedCenti >= windowCenti,
      status: requiredVisitsInPeriod === 0
        ? 'No target visit volume entered'
        : teamVisitsInPeriod >= requiredVisitsInPeriod
          ? 'Modeled capacity meets the entered target'
          : 'Modeled capacity is below the entered target'
    });
  }

  if (typeof window !== 'undefined') {
    window.TourviaVisitCapacity = { calculateScenario: calculateScenario, parseValue: parseValue };
  }

  if (typeof document === 'undefined') {
    return;
  }

  var doc = document;
  var form = doc.getElementById('capacity-form');
  if (!form) {
    return;
  }
  var results = doc.getElementById('results');
  var formStatus = doc.getElementById('form-status');
  var download = doc.getElementById('download-summary');
  var reset = doc.getElementById('reset-calculator');
  var lastScenario = null;

  function byId(id) { return doc.getElementById(id); }
  function readInput() {
    return {
      teamSize: byId('team-size').value,
      fieldDaysPerRepPerWeek: byId('field-days-per-rep-per-week').value,
      fieldHoursPerDay: byId('field-hours-per-day').value,
      visitMinutes: byId('visit-minutes').value,
      travelMinutesBetweenVisits: byId('travel-minutes-between-visits').value,
      fixedNonVisitMinutes: byId('fixed-non-visit-minutes').value,
      accountsInScope: byId('accounts-in-scope').value,
      targetVisitsPerAccount: byId('target-visits-per-account').value,
      planningHorizonWeeks: byId('planning-horizon-weeks').value
    };
  }
  function clearInvalid() {
    form.querySelectorAll('[aria-invalid="true"]').forEach(function (element) {
      element.setAttribute('aria-invalid', 'false');
    });
  }
  function setStatus(message, error) {
    formStatus.textContent = message;
    formStatus.classList.toggle('is-error', Boolean(error));
  }
  function showValue(id, value, decimals) {
    byId(id).textContent = value === null ? 'Not available' : numberFormat(value, decimals);
  }
  function definitionList(container, rows) {
    container.replaceChildren();
    rows.forEach(function (row) {
      var line = doc.createElement('div');
      var term = doc.createElement('dt');
      var detail = doc.createElement('dd');
      term.textContent = row[0];
      detail.textContent = row[1];
      line.append(term, detail);
      container.appendChild(line);
    });
  }
  function cadenceText(cadence) {
    if (!cadence) { return 'Not available'; }
    if (cadence.visitsPerAccountPerWeek > 1) {
      return numberFormat(cadence.visitsPerAccountPerWeek, 2) + ' visits per account per week';
    }
    return '1 visit per account every ' + numberFormat(cadence.weeksPerVisit, 2) + ' weeks';
  }
  function hideStaleResult() {
    if (!lastScenario) { return; }
    lastScenario = null;
    results.hidden = true;
    download.disabled = true;
    setStatus('Inputs changed — calculate again. Nothing is stored or sent.', false);
  }
  function renderScenario(scenario) {
    lastScenario = scenario;
    results.hidden = false;
    download.disabled = false;
    byId('scenario-title').textContent = scenario.status;
    byId('scenario-copy').textContent = scenario.requiredVisitsInPeriod === 0
      ? 'No entered target volume is being compared. Capacity remains a modeled planning rate.'
      : scenario.status === 'Modeled capacity meets the entered target'
        ? 'The model has ' + numberFormat(scenario.balance, 2) + ' more visits than the entered target under these assumptions.'
        : 'The entered target exceeds modeled capacity by ' + numberFormat(Math.abs(scenario.balance), 2) + ' visits under these assumptions.';
    byId('scenario-status').setAttribute('data-tone', scenario.requiredVisitsInPeriod === 0 ? 'watch' : scenario.balance >= 0 ? 'good' : 'gap');
    byId('scenario-marker').textContent = scenario.requiredVisitsInPeriod === 0 ? '—' : scenario.balance >= 0 ? '✓' : '!';

    showValue('usable-minutes', scenario.usableMinutesPerDay, 2);
    showValue('daily-visits', scenario.dailyVisits, 0);
    showValue('rep-weekly-visits', scenario.visitsPerRepPerWeek, 2);
    showValue('team-weekly-visits', scenario.teamVisitsPerWeek, 2);
    showValue('period-visits', scenario.teamVisitsInPeriod, 2);
    showValue('required-visits', scenario.requiredVisitsInPeriod, 0);
    byId('coverage-balance').textContent = (scenario.balance > 0 ? '+' : scenario.balance < 0 ? '−' : '') + numberFormat(Math.abs(scenario.balance), 2);
    byId('coverage-balance').closest('.metric').setAttribute('data-tone', scenario.balance >= 0 ? 'good' : 'gap');
    byId('target-load').textContent = scenario.targetLoadPercent === null ? 'Not available' : numberFormat(scenario.targetLoadPercent, 2) + '%';
    byId('even-share-cadence').textContent = cadenceText(scenario.cadence);
    byId('minimum-reps').textContent = scenario.minimumReps === null ? 'Cannot be estimated: per-rep capacity is 0.' : numberFormat(scenario.minimumReps, 0);
    byId('reserved-time-warning').hidden = !scenario.reservedTimeExhaustsDay;

    definitionList(byId('time-summary'), [
      ['Field window', numberFormat(scenario.fieldHoursPerDay * 60, 2) + ' minutes per field day'],
      ['Reserved non-visit time', numberFormat(scenario.fixedNonVisitMinutes, 2) + ' minutes per field day'],
      ['Visit duration', numberFormat(scenario.visitMinutes, 2) + ' minutes'],
      ['Travel between consecutive visits', numberFormat(scenario.travelMinutesBetweenVisits, 2) + ' minutes'],
      ['Calculation', 'floor((usable time + travel) ÷ (visit duration + travel))']
    ]);
    definitionList(byId('target-summary'), [
      ['Accounts in scope', numberFormat(scenario.accountsInScope, 0)],
      ['Entered target visits per account', numberFormat(scenario.targetVisitsPerAccount, 0) + ' in ' + numberFormat(scenario.planningHorizonWeeks, 0) + ' weeks'],
      ['Required visit volume', numberFormat(scenario.requiredVisitsInPeriod, 0)],
      ['Even-share cadence at full modeled capacity', cadenceText(scenario.cadence)]
    ]);
    results.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  function calculate(event) {
    if (event) { event.preventDefault(); }
    clearInvalid();
    try {
      var scenario = calculateScenario(readInput());
      renderScenario(scenario);
      setStatus('Scenario calculated locally. Nothing was stored or sent.', false);
    } catch (error) {
      results.hidden = true;
      download.disabled = true;
      var firstInput = form.querySelector('input:not([value=""])');
      var raw = String(error.message || 'Cannot calculate this scenario.');
      var labels = Array.from(form.querySelectorAll('label'));
      var target = labels.map(function (label) {
        var input = label.querySelector('input');
        return input && raw.indexOf(label.childNodes[0].textContent.trim()) === 0 ? input : null;
      }).find(Boolean);
      if (target) {
        target.setAttribute('aria-invalid', 'true');
        target.focus();
      } else if (firstInput) {
        firstInput.focus();
      }
      setStatus(raw, true);
    }
  }
  function quoteCsv(value) {
    var text = String(value === null || value === undefined ? '' : value);
    if (/^\s*[=+\-@]/.test(text)) { text = "'" + text; }
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function downloadCsv() {
    if (!lastScenario) { return; }
    var s = lastScenario;
    var header = [
      'calculation_version', 'team_size', 'field_days_per_rep_per_week', 'field_hours_per_day', 'visit_minutes',
      'travel_minutes_between_visits', 'fixed_non_visit_minutes_per_field_day', 'accounts_in_scope',
      'target_visits_per_account_in_period', 'planning_horizon_weeks', 'usable_minutes_per_full_field_day',
      'modeled_visits_per_full_field_day', 'modeled_visits_per_rep_per_week', 'modeled_team_visits_per_week',
      'modeled_team_visits_in_period', 'required_visits_in_period', 'capacity_balance_visits', 'target_load_percent',
      'even_share_visits_per_account_per_week', 'even_share_weeks_per_visit', 'minimum_reps_for_target'
    ];
    var row = [
      '1.0', s.teamSize, s.fieldDaysPerRepPerWeek, s.fieldHoursPerDay, s.visitMinutes,
      s.travelMinutesBetweenVisits, s.fixedNonVisitMinutes, s.accountsInScope, s.targetVisitsPerAccount,
      s.planningHorizonWeeks, s.usableMinutesPerDay, s.dailyVisits, s.visitsPerRepPerWeek, s.teamVisitsPerWeek,
      s.teamVisitsInPeriod, s.requiredVisitsInPeriod, s.balance, s.targetLoadPercent,
      s.cadence && s.cadence.visitsPerAccountPerWeek, s.cadence && s.cadence.weeksPerVisit, s.minimumReps
    ];
    var payload = '\ufeff' + header.map(quoteCsv).join(',') + '\r\n' + row.map(quoteCsv).join(',') + '\r\n';
    var link = doc.createElement('a');
    link.href = URL.createObjectURL(new Blob([payload], { type: 'text/csv;charset=utf-8' }));
    link.download = 'field-sales-visit-capacity-' + new Date().toISOString().slice(0, 10) + '.csv';
    doc.body.appendChild(link);
    link.click();
    var url = link.href;
    link.remove();
    URL.revokeObjectURL(url);
  }
  function resetScenario() {
    if (!form.querySelector('input').value && !lastScenario) { return; }
    if (window.confirm('Clear the inputs and result for this scenario?')) {
      form.reset();
      clearInvalid();
      lastScenario = null;
      results.hidden = true;
      download.disabled = true;
      setStatus('Inputs cleared. Nothing is stored or sent.', false);
      byId('team-size').focus();
    }
  }

  form.addEventListener('submit', calculate);
  form.querySelectorAll('input').forEach(function (input) { input.addEventListener('input', hideStaleResult); });
  reset.addEventListener('click', resetScenario);
  download.addEventListener('click', downloadCsv);
  download.disabled = true;
  window.TourviaVisitCapacity = { calculateScenario: calculateScenario, parseValue: parseValue };
}());
