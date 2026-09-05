/* Tourvia data readiness checker: all parsing stays in the browser.
   It intentionally reports counts and field names only, never record values. */
(function () {
  'use strict';

  var MAX_FILE_BYTES = 12 * 1024 * 1024;
  var MAX_ROWS = 100000;
  var MAX_COLUMNS = 250;
  var DEMO_CSV = [
    'Id,BillingStreet,BillingCity,BillingPostalCode,BillingCountry,BillingLatitude,BillingLongitude,GeocodeAccuracy,OwnerName,Territory2Name',
    'REC-001,12 Rue des Fleurs,Paris,75001,France,48.8647,2.3490,Address,Sales East,Paris',
    'REC-002,8 Avenue Victor Hugo,Paris,75016,France,48.8699,2.2934,Address,Sales East,Paris',
    'REC-003,45 Rue Nationale,Lille,59800,France,,,None,Sales North,Lille',
    'REC-004,1 Place Bellecour,Lyon,69002,France,0,0,None,Sales South,Lyon',
    'REC-005,24 Quai de la Fosse,Nantes,44000,France,47.2122,-1.5561,Address,,Nantes',
    'REC-006,12 Rue des Fleurs,Paris,75001,France,48.8647,2.3490,Address,Sales East,Paris'
  ].join('\n');

  var doc = document;
  var fileInput = doc.getElementById('csv-file');
  var dropzone = doc.getElementById('dropzone');
  var fileStatus = doc.getElementById('file-status');
  var useDemo = doc.getElementById('use-demo');
  var clearButton = doc.getElementById('clear-results');
  var downloadButton = doc.getElementById('download-summary');
  var results = doc.getElementById('results');
  var resultsSource = doc.getElementById('results-source');
  var scoreline = doc.getElementById('scoreline');
  var scoreTitle = doc.getElementById('score-title');
  var scoreCopy = doc.getElementById('score-copy');
  var metrics = doc.getElementById('metrics');
  var fieldFindings = doc.getElementById('field-findings');
  var dataFindings = doc.getElementById('data-findings');
  var nextChecks = doc.getElementById('next-checks');
  var lastReport = null;

  function normalise(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function esc(value) {
    // Dynamic values passed to innerHTML are escaped; record values never enter rendering.
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function countLabel(count, one, many) {
    return count === 1 ? one : many;
  }

  function parseCsv(text) {
    if (text.indexOf('\u0000') !== -1) {
      throw new Error('This file contains unsupported binary characters. Export it again as a UTF-8 CSV.');
    }
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    var i;

    for (i = 0; i < text.length; i += 1) {
      var char = text[i];
      if (inQuotes) {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          field += char;
        }
      } else if (char === '"') {
        if (field.length !== 0) {
          throw new Error('A quote starts in the middle of a CSV field. Export the file again as CSV UTF-8.');
        }
        inQuotes = true;
      } else if (char === ',') {
        row.push(field);
        field = '';
      } else if (char === '\n') {
        row.push(field.replace(/\r$/, ''));
        if (row.some(function (cell) { return cell !== ''; })) {
          rows.push(row);
        }
        row = [];
        field = '';
      } else {
        field += char;
      }
    }
    if (inQuotes) {
      throw new Error('This CSV has an unclosed quoted field. Export it again before checking the data.');
    }
    row.push(field.replace(/\r$/, ''));
    if (row.some(function (cell) { return cell !== ''; })) {
      rows.push(row);
    }
    if (!rows.length) {
      throw new Error('The file is empty. Choose a CSV export with a header row and records.');
    }
    var headers = rows.shift().map(function (header) { return header.trim().replace(/^\uFEFF/, ''); });
    if (!headers.length || !headers.some(function (header) { return header; })) {
      throw new Error('No header row was found. Export the field names with the CSV.');
    }
    if (headers.length > MAX_COLUMNS) {
      throw new Error('This export has more than ' + MAX_COLUMNS + ' columns. Choose a narrower CSV before checking it locally.');
    }
    if (!rows.length) {
      throw new Error('The header was read, but this CSV has no data rows. Export records before checking it.');
    }
    if (rows.length > MAX_ROWS) {
      throw new Error('This export has more than ' + MAX_ROWS.toLocaleString() + ' rows. Filter it before checking it locally.');
    }
    var seenHeaders = {};
    headers.forEach(function (header) {
      var key = normalise(header);
      if (key && seenHeaders[key]) {
        throw new Error('Two CSV headers normalize to the same field. Export one unambiguous column for each field.');
      }
      if (key) { seenHeaders[key] = true; }
    });
    if (rows.some(function (dataRow) { return dataRow.length !== headers.length; })) {
      throw new Error('This CSV has inconsistent column counts. Export it again as a comma-delimited CSV.');
    }
    return { headers: headers, rows: rows };
  }

  function buildHeaderIndex(headers) {
    var index = {};
    headers.forEach(function (header, position) {
      var key = normalise(header);
      if (key && index[key] === undefined) {
        index[key] = position;
      }
    });
    return index;
  }

  function firstHeader(index, aliases) {
    var found = null;
    aliases.some(function (alias) {
      if (index[alias] !== undefined) {
        found = { key: alias, index: index[alias] };
        return true;
      }
      return false;
    });
    return found;
  }

  function valueAt(row, header) {
    return header && row[header.index] !== undefined ? String(row[header.index]).trim() : '';
  }

  function presentCount(rows, header) {
    if (!header) { return null; }
    return rows.reduce(function (count, row) { return count + (valueAt(row, header) ? 1 : 0); }, 0);
  }

  function numeric(value) {
    if (!value || !/^-?(?:\d+|\d*\.\d+)$/.test(value.trim())) { return null; }
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function buildAddressGroups(index) {
    var definitions = [
      {
        name: 'Billing address',
        fields: { street: ['billingstreet'], city: ['billingcity'], state: ['billingstate'], postal: ['billingpostalcode'], country: ['billingcountry'] }
      },
      {
        name: 'Shipping address',
        fields: { street: ['shippingstreet'], city: ['shippingcity'], state: ['shippingstate'], postal: ['shippingpostalcode'], country: ['shippingcountry'] }
      },
      {
        name: 'Mailing address',
        fields: { street: ['mailingstreet'], city: ['mailingcity'], state: ['mailingstate'], postal: ['mailingpostalcode'], country: ['mailingcountry'] }
      },
      {
        name: 'Other address',
        fields: { street: ['otherstreet'], city: ['othercity'], state: ['otherstate'], postal: ['otherpostalcode'], country: ['othercountry'] }
      },
      {
        name: 'Generic address',
        fields: { street: ['street', 'addressstreet'], city: ['city', 'addresscity'], state: ['state', 'addressstate'], postal: ['postalcode', 'zipcode', 'addresspostalcode'], country: ['country', 'addresscountry'] }
      }
    ];
    return definitions.map(function (definition) {
      var found = {};
      Object.keys(definition.fields).forEach(function (field) {
        found[field] = firstHeader(index, definition.fields[field]);
      });
      var detected = Object.keys(found).some(function (field) { return Boolean(found[field]); });
      return detected ? { name: definition.name, fields: found } : null;
    }).filter(Boolean);
  }

  function accuracyDistribution(rows, header) {
    if (!header) { return []; }
    var known = {
      address: 'Address', nearaddress: 'NearAddress', block: 'Block', street: 'Street', extendedzip: 'ExtendedZip',
      zip: 'Zip', zippostalcode: 'Zip', neighborhood: 'Neighborhood', city: 'City', county: 'County',
      state: 'State', stateprovince: 'State', unknown: 'Unknown'
    };
    var counts = {};
    rows.forEach(function (row) {
      var raw = valueAt(row, header);
      var label = raw ? (known[normalise(raw)] || 'Unrecognised') : 'Blank';
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); }).map(function (label) {
      return { label: label, count: counts[label] };
    });
  }

  function analyse(headers, rows, source) {
    var index = buildHeaderIndex(headers);
    var lat = firstHeader(index, ['latitude', 'billinglatitude', 'shippinglatitude', 'mailinglatitude', 'otherlatitude', 'geocodelatitude', 'lat']);
    var lng = firstHeader(index, ['longitude', 'billinglongitude', 'shippinglongitude', 'mailinglongitude', 'otherlongitude', 'geocodelongitude', 'lng', 'long']);
    var accuracy = firstHeader(index, ['geocodeaccuracy', 'billinggeocodeaccuracy', 'shippinggeocodeaccuracy', 'mailinggeocodeaccuracy']);
    var owner = firstHeader(index, ['ownername', 'ownerid', 'owner']);
    var territory = firstHeader(index, ['territory2name', 'territory2id', 'territoryname', 'territory']);
    var addresses = buildAddressGroups(index);
    var coordinate = { valid: 0, missing: 0, invalid: 0, zero: 0, repeated: 0, available: Boolean(lat && lng) };
    var coordinateCounts = {};

    if (coordinate.available) {
      rows.forEach(function (row) {
        var rawLat = valueAt(row, lat);
        var rawLng = valueAt(row, lng);
        if (!rawLat || !rawLng) {
          coordinate.missing += 1;
          return;
        }
        var latValue = numeric(rawLat);
        var lngValue = numeric(rawLng);
        if (latValue === null || lngValue === null || latValue < -90 || latValue > 90 || lngValue < -180 || lngValue > 180) {
          coordinate.invalid += 1;
          return;
        }
        if (latValue === 0 && lngValue === 0) {
          coordinate.zero += 1;
          return;
        }
        coordinate.valid += 1;
        var pair = latValue.toFixed(6) + ',' + lngValue.toFixed(6);
        coordinateCounts[pair] = (coordinateCounts[pair] || 0) + 1;
      });
      Object.keys(coordinateCounts).forEach(function (pair) {
        if (coordinateCounts[pair] > 1) {
          coordinate.repeated += coordinateCounts[pair];
        }
      });
    }

    var addressResults = addresses.map(function (group) {
      var counts = {};
      Object.keys(group.fields).forEach(function (field) {
        counts[field] = presentCount(rows, group.fields[field]);
      });
      var usable = rows.reduce(function (count, row) {
        var street = valueAt(row, group.fields.street);
        var city = valueAt(row, group.fields.city);
        return count + (street && city ? 1 : 0);
      }, 0);
      return { name: group.name, fields: group.fields, counts: counts, usable: usable };
    });

    var ownership = owner ? { header: owner, filled: presentCount(rows, owner) } : null;
    var territories = territory ? { header: territory, filled: presentCount(rows, territory) } : null;
    var status;
    if (!rows.length) {
      status = { tone: 'watch', mark: '—', title: 'No records to assess', copy: 'The header was read, but the CSV contains no data rows.' };
    } else if (!coordinate.available) {
      status = { tone: 'watch', mark: '!', title: 'Coordinate fields were not detected', copy: 'This checker found no recognised latitude and longitude pair. Review the export fields or choose the address source that your geocoding process uses.' };
    } else if (coordinate.valid === rows.length) {
      status = { tone: 'ready', mark: '✓', title: 'Every row has a usable coordinate pair', copy: 'The coordinate screen found no blank, invalid, or zero pairs. Confirm that the coordinates match the records and your intended routing scope before using them.' };
    } else if (coordinate.valid > 0) {
      status = { tone: 'watch', mark: '!', title: 'Some records need a coordinate review', copy: 'The CSV includes usable pairs, but not for every row. Resolve blanks, invalid values, and zero pairs before you use the export for route planning.' };
    } else {
      status = { tone: 'missing', mark: '×', title: 'No usable coordinate pairs were found', copy: 'Address fields may still be present, but this export has no usable latitude and longitude pair for route planning.' };
    }

    return {
      source: source,
      headers: headers,
      rowCount: rows.length,
      lat: lat,
      lng: lng,
      accuracy: accuracy,
      owner: ownership,
      territory: territories,
      coordinate: coordinate,
      addresses: addressResults,
      accuracyDistribution: accuracyDistribution(rows, accuracy),
      status: status
    };
  }

  function list(items, empty) {
    if (!items.length) { return '<li><span>' + esc(empty) + '</span></li>'; }
    return items.map(function (item) {
      return '<li><span>' + item.label + '</span><span class="num">' + esc(item.count) + '</span></li>';
    }).join('');
  }

  function metric(label, value, copy, tone) {
    return '<article class="metric ' + (tone ? 'is-' + tone : '') + '"><span class="metric-label">' + esc(label) + '</span><strong class="metric-value">' + esc(value) + '</strong><span class="metric-copy">' + esc(copy) + '</span></article>';
  }

  function fieldRow(label, count, total) {
    return {
      label: '<strong>' + esc(label) + '</strong><br><span class="small-muted">Recognised field</span>',
      count: count + ' / ' + total
    };
  }

  function render(report) {
    lastReport = report;
    results.hidden = false;
    resultsSource.textContent = report.source + ' · ' + report.rowCount + ' ' + countLabel(report.rowCount, 'record', 'records') + ' · Results show aggregate counts only.';
    scoreline.setAttribute('data-tone', report.status.tone);
    scoreline.querySelector('.score-marker').textContent = report.status.mark;
    scoreTitle.textContent = report.status.title;
    scoreCopy.textContent = report.status.copy;

    var coordinate = report.coordinate;
    var validPercent = report.rowCount ? Math.round((coordinate.valid / report.rowCount) * 100) : 0;
    var coordinateCopy = coordinate.available ? 'A latitude and longitude pair was recognised.' : 'No recognised Latitude / Longitude pair';
    metrics.innerHTML = [
      metric('Records read', report.rowCount, 'The checker read the header and data rows locally.', 'ready'),
      metric('Usable coordinate pairs', coordinate.available ? validPercent + '%' : '—', coordinate.available ? coordinate.valid + ' of ' + report.rowCount + ' pairs are in range and not 0,0.' : coordinateCopy, coordinate.valid === report.rowCount && report.rowCount ? 'ready' : 'watch'),
      metric('No valid pair', coordinate.available ? coordinate.missing + coordinate.invalid + coordinate.zero : '—', coordinate.available ? coordinate.missing + ' blank · ' + coordinate.invalid + ' invalid · ' + coordinate.zero + ' at 0,0' : 'Add a coordinate pair to the export.', coordinate.available && (coordinate.missing + coordinate.invalid + coordinate.zero) ? 'missing' : 'ready'),
      metric('Repeated pairs', coordinate.available ? coordinate.repeated : '—', coordinate.available ? 'Rows sharing a non-zero pair. Review them; shared locations can be legitimate.' : 'Only assessed when coordinates are present.', coordinate.repeated ? 'watch' : 'ready')
    ].join('');

    var fields = [];
    if (report.lat) { fields.push(fieldRow('Latitude', coordinate.valid + coordinate.invalid + coordinate.zero, report.rowCount)); }
    if (report.lng) { fields.push(fieldRow('Longitude', coordinate.valid + coordinate.invalid + coordinate.zero, report.rowCount)); }
    if (report.accuracy) { fields.push(fieldRow('Geocode accuracy', report.rowCount, report.rowCount)); }
    if (report.owner) { fields.push(fieldRow('Owner', report.owner.filled, report.rowCount)); }
    if (report.territory) { fields.push(fieldRow('Territory', report.territory.filled, report.rowCount)); }
    report.addresses.forEach(function (group) {
      fields.push({ label: '<strong>' + esc(group.name) + '</strong><br><span class="small-muted">Street + city present</span>', count: group.usable + ' / ' + report.rowCount });
    });
    fieldFindings.innerHTML = list(fields.filter(Boolean), 'No recognised address, coordinate, owner, territory, or GeocodeAccuracy fields were found.');

    var checks = [];
    if (coordinate.available) {
      checks.push({ label: '<strong>Coordinate pairs</strong><br><span class="small-muted">Blank, invalid, or 0,0</span>', count: coordinate.missing + coordinate.invalid + coordinate.zero });
      checks.push({ label: '<strong>Repeated coordinate pairs</strong><br><span class="small-muted">Not an error by itself</span>', count: coordinate.repeated });
    }
    if (report.owner) {
      checks.push({ label: '<strong>Owner coverage</strong><br><span class="small-muted">Recognised owner field</span>', count: (report.rowCount - report.owner.filled) + ' blank' });
    }
    if (report.territory) {
      checks.push({ label: '<strong>Territory coverage</strong><br><span class="small-muted">Recognised territory field</span>', count: (report.rowCount - report.territory.filled) + ' blank' });
    }
    report.accuracyDistribution.slice(0, 6).forEach(function (item) {
      checks.push({ label: '<strong>GeocodeAccuracy: ' + esc(item.label) + '</strong>', count: item.count });
    });
    dataFindings.innerHTML = list(checks, 'No additional field-quality checks were available from this export.');

    var guidance = [];
    if (!coordinate.available) {
      guidance.push('<b>Choose the coordinate source.</b> Add the latitude and longitude fields that your mapping or geocoding process actually uses to the export.');
    } else if (coordinate.missing || coordinate.invalid || coordinate.zero) {
      guidance.push('<b>Resolve unusable pairs.</b> Blank, invalid, and 0,0 pairs need review before they are used as planned visit locations.');
    } else {
      guidance.push('<b>Validate the location meaning.</b> A syntactically valid pair is not proof that it points to the intended customer location.');
    }
    if (report.addresses.length) {
      guidance.push('<b>Check the selected address source.</b> This screen reports field presence, not postal-address quality. Compare the address fields with the coordinates before routing.');
    }
    if (coordinate.repeated) {
      guidance.push('<b>Review shared locations.</b> Repeated pairs may be a headquarters, a geocoding fallback, or a valid shared site. Do not delete them automatically.');
    }
    guidance.push('<b>Run a small map validation.</b> Inspect a representative sample in Salesforce before planning a full field day.');
    nextChecks.innerHTML = '<h3>What to check next</h3><ol>' + guidance.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ol>';
    // Move directly to the count-only report after the browser has laid it out.
    results.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  function setStatus(message, isError) {
    fileStatus.textContent = message;
    fileStatus.classList.toggle('is-error', Boolean(isError));
  }

  function runCsv(text, source) {
    try {
      var parsed = parseCsv(text);
      render(analyse(parsed.headers, parsed.rows, source));
      setStatus(source === 'Synthetic demonstration file' ? 'Synthetic demonstration scanned locally.' : 'CSV scanned locally. Nothing was uploaded.', false);
    } catch (error) {
      results.hidden = true;
      setStatus(error.message, true);
    }
  }

  function inspectFile(file) {
    if (!file) { return; }
    if (file.size > MAX_FILE_BYTES) {
      setStatus('Choose a CSV smaller than 12 MB for this in-browser checker.', true);
      return;
    }
    if (!/\.csv$/i.test(file.name) && file.type && file.type !== 'text/csv') {
      setStatus('Choose a .csv export. The checker does not accept spreadsheets or uploads.', true);
      return;
    }
    var reader = new FileReader();
    reader.onerror = function () { setStatus('The browser could not read that file. Export it again as a CSV.', true); };
    reader.onload = function () { runCsv(String(reader.result || ''), 'Local CSV'); };
    setStatus('Reading the CSV locally…', false);
    reader.readAsText(file);
  }

  function clear() {
    lastReport = null;
    results.hidden = true;
    if (fileInput) { fileInput.value = ''; }
    setStatus('No CSV selected. Choose an export or run the synthetic demonstration.', false);
  }

  function downloadSummary() {
    if (!lastReport) { return; }
    var c = lastReport.coordinate;
    var lines = [
      'Salesforce route-planning data readiness summary',
      'Source: ' + lastReport.source,
      'Records read: ' + lastReport.rowCount,
      'Status: ' + lastReport.status.title,
      'Usable coordinate pairs: ' + c.valid,
      'Blank coordinate pairs: ' + c.missing,
      'Invalid coordinate pairs: ' + c.invalid,
      'Zero coordinate pairs: ' + c.zero,
      'Rows with repeated coordinate pairs: ' + c.repeated,
      '',
      'This local summary contains only counts and recognised field names. It does not contain record values.'
    ];
    var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    var link = doc.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'salesforce-route-data-readiness-summary.txt';
    doc.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  if (fileInput) { fileInput.addEventListener('change', function () { inspectFile(fileInput.files[0]); }); }
  if (useDemo) { useDemo.addEventListener('click', function () { runCsv(DEMO_CSV, 'Synthetic demonstration file'); }); }
  if (clearButton) { clearButton.addEventListener('click', clear); }
  if (downloadButton) { downloadButton.addEventListener('click', downloadSummary); }
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (event) { event.preventDefault(); dropzone.classList.add('is-dragging'); });
    });
    ['dragleave', 'drop'].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (event) { event.preventDefault(); dropzone.classList.remove('is-dragging'); });
    });
    dropzone.addEventListener('drop', function (event) { inspectFile(event.dataTransfer.files[0]); });
  }

  window.TourviaDataReadiness = { parseCsv: parseCsv, analyse: analyse, demoCsv: DEMO_CSV };
}());
