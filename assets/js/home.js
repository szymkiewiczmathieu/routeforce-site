/* ==========================================================================
   Tourvia V4 — Continuous Cinema Camera & Persistent 5-Object Film Engine
   One continuous 2D rotated/scaled camera flight over real Paris / La Défense
   OpenStreetMap cartography + dual-LOD street dive + persistent 5-stop morph.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var french = doc.documentElement.lang === 'fr';
  var ASSET_PREFIX = french ? '/assets/' : 'assets/';

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */
  var menuBtn = doc.getElementById('mobile-menu-btn');
  var menu = doc.getElementById('mobile-menu');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Accessible Screenshot Lightbox
     ------------------------------------------------------------------------ */
  var lightbox = doc.getElementById('lightbox');
  var lightboxImg = doc.getElementById('lightbox-img');
  var lightboxClose = doc.getElementById('lightbox-close');
  var blankGif = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  var lastTrigger = null;

  function openLightbox(src, alt, trigger) {
    if (!lightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || (french ? 'Capture en taille réelle' : 'Full-size screenshot');
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('lightbox-open');
    lastTrigger = trigger || null;
    if (lightboxClose) lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('lightbox-open');
    lightboxImg.src = blankGif;
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    lastTrigger = null;
  }
  doc.querySelectorAll('.js-open-lightbox-direct').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openLightbox(btn.getAttribute('data-lightbox-src'), btn.getAttribute('data-lightbox-alt'), btn);
    });
  });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (!lightbox || !lightbox.classList.contains('active') || e.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(lightbox.querySelectorAll('button:not([disabled]), a[href]'));
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && (doc.activeElement === first || !lightbox.contains(doc.activeElement))) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (doc.activeElement === last || !lightbox.contains(doc.activeElement))) {
      e.preventDefault(); first.focus();
    }
  });

  /* ------------------------------------------------------------------------
     Math, easing & continuous RGB color morphing
     ------------------------------------------------------------------------ */
  function clamp(v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function seg(t, a, b) { return clamp((t - a) / (b - a)); }
  function easeOut(k) { var x = clamp(k); return 1 - Math.pow(1 - x, 3); }
  function easeIO(k) { var x = clamp(k); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function smoothstep(x) { var c = clamp(x); return c * c * (3 - 2 * c); }

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mixRgb(a, b, k) {
    var t = clamp(k);
    return [
      Math.round(lerp(a[0], b[0], t)),
      Math.round(lerp(a[1], b[1], t)),
      Math.round(lerp(a[2], b[2], t))
    ];
  }
  function rgbCss(rgb, alpha) {
    if (alpha === undefined) return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + clamp(alpha).toFixed(3) + ')';
  }

  /* ------------------------------------------------------------------------
     DOM References
     ------------------------------------------------------------------------ */
  var film = doc.getElementById('day-in-the-field');
  var canvas = doc.getElementById('stage-canvas');
  if (!film || !canvas) return;
  var ctx = canvas.getContext('2d');

  var siteHead = doc.querySelector('.site-head');
  var chapterHud = doc.getElementById('chapter-hud');
  var progressBar = doc.getElementById('scroll-progress-value');
  var hudNum = doc.getElementById('chapter-current');
  var hudName = doc.getElementById('chapter-name');
  var stageBadge = doc.getElementById('stage-badge');
  var stageBadgeText = doc.getElementById('stage-badge-text');

  var steps = Array.prototype.slice.call(film.querySelectorAll('[data-film-step]'));
  var cards = steps.map(function (el) { return el.querySelector('.story-card'); });
  var railDots = Array.prototype.slice.call(film.querySelectorAll('.rail-dot'));
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav-main [data-nav-target]'));
  var postSections = ['architecture', 'pricing', 'showcase', 'features'].map(function (id) {
    return { id: id, el: doc.getElementById(id) };
  }).filter(function (s) { return !!s.el; });

  var payoffSelect = doc.getElementById('payoff-select');
  var payoffOptimize = doc.getElementById('payoff-optimize');
  var payoffCalendar = doc.getElementById('payoff-calendar');
  var payoffConflicts = doc.getElementById('payoff-conflicts');
  var payoffAgenda = doc.getElementById('payoff-agenda');
  var payoffExecute = doc.getElementById('payoff-execute');
  var execSpatialDock = doc.getElementById('exec-spatial-dock');
  var execStageCheckin = doc.getElementById('exec-stage-checkin');
  var execStageReport = doc.getElementById('exec-stage-report');
  var payoffComplete = doc.getElementById('payoff-complete');

  var calStoryCard = doc.getElementById('cal-story-card');
  var calPhasePill = doc.getElementById('cal-phase-pill');
  var calStepItems = Array.prototype.slice.call(doc.querySelectorAll('#cal-steps li'));

  var execStoryCard = doc.getElementById('exec-story-card');
  var execPhasePill = doc.getElementById('exec-phase-pill');
  var execStepItems = Array.prototype.slice.call(doc.querySelectorAll('#exec-steps li'));

  var CHAPTER_NAMES = french
    ? ['Journée dispersée', 'Sélection du secteur', 'Optimisation de tournée', 'Création d’agenda', 'Exécution terrain', 'Journée bouclée']
    : ['Scattered day', 'Territory selection', 'Route optimization', 'Calendar creation', 'Field execution', 'Completed day'];

  var LABELS = french ? {
    illustrative: 'ORG D’EXEMPLE PARIS · ANIMATION ILLUSTRATIVE',
    real: 'PRODUIT RÉEL TOURVIA · ORG D’EXEMPLE PARIS',
    departure: 'DÉPART 08:00',
    lunch: '08:15–11:45 · AVANT DÉJEUNER',
    areaTag: 'ZONE · 5 ARRÊTS ISOLÉS',
    chaosTag: 'NON ORDONNÉ · ALLERS-RETOURS',
    optTag: '24,5 KM · 1H 00 · 5 ARRÊTS (EXEMPLE)',
    conflictScan: 'CONTRÔLE DES CONFLITS AGENDA',
    agendaReady: '5 ÉVÉNEMENTS LIÉS À LA CARTE',
    proximity: 'PROXIMITÉ GPS CONFIGURABLE · LA DÉFENSE',
    proximityMob: 'PROXIMITÉ GPS · LA DÉFENSE',
    written: 'EXEMPLE DE RAPPORT ENREGISTRÉ DANS SALESFORCE ✓',
    writtenMob: 'EXEMPLE RAPPORT SALESFORCE ✓',
    stop1Title: '01 · La Défense',
    stop1Checkin: 'Financia Patrimoine · 08:15–08:45',
    stop1Done: 'Check-in enregistré ✓',
    completeBanner: '5 VISITES CLÔTURÉES · ÉVÉNEMENTS + RAPPORTS DANS SALESFORCE',
    calPhase1: 'Étape 01 · Contrôle conflits',
    calPhase2: 'Étape 02 · Agenda du jour',
    execPhase1: 'Étape 01 · Check-in sur place',
    execPhase2: 'Étape 02 · Rapport sur mobile',
    objAcc: 'Compte',
    objOpp: 'Opportunité',
    objLead: 'Prospect',
    objCamp: 'Membre camp.'
  } : {
    illustrative: 'PARIS SAMPLE ORG · ILLUSTRATIVE MOTION',
    real: 'REAL TOURVIA PRODUCT · PARIS SAMPLE ORG',
    departure: 'START 08:00',
    lunch: '08:15–11:45 · BEFORE LUNCH',
    areaTag: 'SELECT AREA · 5 STOPS ISOLATED',
    chaosTag: 'UNORDERED · BACKTRACKING',
    optTag: '24.5 KM · 1H 00 · 5 STOPS (SAMPLE)',
    conflictScan: 'CHECKING EXISTING CALENDAR CONFLICTS',
    agendaReady: '5 TIMED EVENTS BOUND TO MAP',
    proximity: 'CONFIGURABLE GPS PROXIMITY · LA DÉFENSE',
    proximityMob: 'GPS PROXIMITY · LA DÉFENSE',
    written: 'SAMPLE VISIT REPORT SAVED TO SALESFORCE ✓',
    writtenMob: 'SAMPLE REPORT SAVED ✓',
    stop1Title: '01 · La Défense',
    stop1Checkin: 'Financia Patrimoine · 08:15–08:45',
    stop1Done: 'Check-in recorded ✓',
    completeBanner: '5 VISITS COMPLETED · EVENTS & REPORTS IN SALESFORCE',
    calPhase1: 'Step 01 · Conflict check',
    calPhase2: 'Step 02 · Today’s Agenda',
    execPhase1: 'Step 01 · On-site check-in',
    execPhase2: 'Step 02 · Mobile visit report',
    objAcc: 'Account',
    objOpp: 'Opportunity',
    objLead: 'Lead',
    objCamp: 'Campaign Mbr'
  };

  var COL = {
    void: '#090C10',
    slate: '#121720',
    chalk: '#F2EFE8',
    mist: '#B2BBC9',
    signal: '#FF6E40',
    pulse: '#3DD6C6',
    gold: '#F5C451',
    acc: '#5B8CFF',
    camp: '#B87CFF',
    chaos: '#FF5E63'
  };
  var RGB = {
    slate: hexToRgb(COL.slate),
    signal: hexToRgb(COL.signal),
    pulse: hexToRgb(COL.pulse),
    gold: hexToRgb(COL.gold),
    acc: hexToRgb(COL.acc),
    camp: hexToRgb(COL.camp)
  };
  var SANS = '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif';
  var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  /* ------------------------------------------------------------------------
     Dual-LOD Real Paris Cartography:
     - LOD 0: paris-stage-map.webp (1454x766) — Greater Paris basin
     - LOD 1: ladefense-street-lod.webp (1073x657) — 8.0x OpenStreetMap street
              zoom extracted from genuine Tourvia checkin-form.png, exact
              cartographic anchor at Stop 1 (u=22.8, v=22.8 <-> 566, 418)
     ------------------------------------------------------------------------ */
  var mapImg = new Image();
  var darkMapCanvas = doc.createElement('canvas');
  var mapReady = false;
  var MAP_W = 1454, MAP_H = 766;

  var lodImg = new Image();
  var darkLodCanvas = doc.createElement('canvas');
  var lodReady = false;
  var LOD_W = 1073, LOD_H = 657;
  var LOD_SCALE_RATIO = 8.0;
  var LOD_PIN_X = 566, LOD_PIN_Y = 418;

  mapImg.onload = function () {
    MAP_W = mapImg.naturalWidth || 1454;
    MAP_H = mapImg.naturalHeight || 766;
    darkMapCanvas.width = MAP_W;
    darkMapCanvas.height = MAP_H;
    var dctx = darkMapCanvas.getContext('2d');
    dctx.filter = 'grayscale(0.70) contrast(1.18) brightness(0.46) saturate(0.88)';
    dctx.drawImage(mapImg, 0, 0, MAP_W, MAP_H);
    dctx.filter = 'none';
    dctx.globalCompositeOperation = 'multiply';
    dctx.fillStyle = '#5e769c';
    dctx.fillRect(0, 0, MAP_W, MAP_H);
    dctx.globalCompositeOperation = 'source-over';

    // Soft outer vignette into --void
    var edgeX = Math.round(MAP_W * 0.08);
    var edgeY = Math.round(MAP_H * 0.10);
    var gl = dctx.createLinearGradient(0, 0, edgeX, 0);
    gl.addColorStop(0, COL.void); gl.addColorStop(1, 'rgba(9,12,16,0)');
    dctx.fillStyle = gl; dctx.fillRect(0, 0, edgeX, MAP_H);
    var gr = dctx.createLinearGradient(MAP_W - edgeX, 0, MAP_W, 0);
    gr.addColorStop(0, 'rgba(9,12,16,0)'); gr.addColorStop(1, COL.void);
    dctx.fillStyle = gr; dctx.fillRect(MAP_W - edgeX, 0, edgeX, MAP_H);
    var gt = dctx.createLinearGradient(0, 0, 0, edgeY);
    gt.addColorStop(0, COL.void); gt.addColorStop(1, 'rgba(9,12,16,0)');
    dctx.fillStyle = gt; dctx.fillRect(0, 0, MAP_W, edgeY);
    var gb = dctx.createLinearGradient(0, MAP_H - edgeY, 0, MAP_H);
    gb.addColorStop(0, 'rgba(9,12,16,0)'); gb.addColorStop(1, COL.void);
    dctx.fillStyle = gb; dctx.fillRect(0, MAP_H - edgeY, MAP_W, edgeY);

    mapReady = true;
  };
  mapImg.src = ASSET_PREFIX + 'screenshots-2026/paris-stage-map.webp';

  lodImg.onload = function () {
    LOD_W = lodImg.naturalWidth || 1073;
    LOD_H = lodImg.naturalHeight || 657;
    darkLodCanvas.width = LOD_W;
    darkLodCanvas.height = LOD_H;
    var lctx = darkLodCanvas.getContext('2d');
    // High-clarity street grading: real OSM streets, blocks & labels stay unmistakably legible in dark cinema mode
    lctx.filter = 'grayscale(0.42) contrast(1.32) brightness(0.74) saturate(0.95)';
    lctx.drawImage(lodImg, 0, 0, LOD_W, LOD_H);
    lctx.filter = 'none';
    lctx.globalCompositeOperation = 'source-atop';
    lctx.fillStyle = 'rgba(42, 74, 122, 0.26)';
    lctx.fillRect(0, 0, LOD_W, LOD_H);
    lctx.globalCompositeOperation = 'source-over';
    lodReady = true;
  };
  lodImg.src = ASSET_PREFIX + 'screenshots-2026/ladefense-street-lod.webp';

  /* 11 Real Salesforce Records calibrated to paris-stage-map.webp
     5-visit schedule matches genuine Schedule Conflicts, Today's Agenda & La Défense Check-in (08:15..11:15) */
  var ORIGIN = { u: 13.8, v: 13.8, name: 'Nanterre' };
  var RECORDS = [
    // 5 persistent selected stops — travel & morph through EVERY act (00 -> 05)
    { id: 0, u: 22.8, v: 22.8, type: 'acc',  label: 'La Défense',       time: '08:15', sel: true,  order: 1, chip: true,  dx: 16,  dy: -36, routeFrac: 0.14 },
    { id: 1, u: 43.5, v: 20.6, type: 'acc',  label: 'Levallois-Perret', time: '09:00', sel: true,  order: 2, chip: false, dx: 0,   dy: -36, routeFrac: 0.42 },
    { id: 2, u: 48.9, v: 44.2, type: 'opp',  label: 'Paris 8e',         time: '09:45', sel: true,  order: 3, chip: true,  dx: -18, dy: 34,  routeFrac: 0.65 },
    { id: 3, u: 61.5, v: 43.2, type: 'opp',  label: 'Opéra',            time: '10:30', sel: true,  order: 4, chip: false, dx: 4,   dy: -36, routeFrac: 0.82 },
    { id: 4, u: 70.2, v: 54.4, type: 'lead', label: 'Paris 3e',         time: '11:15', sel: true,  order: 5, chip: true,  dx: -24, dy: -36, routeFrac: 1.00 },
    // 6 scattered outside records (visibly dim & recede when lasso isolates the 5 above)
    { id: 5, u: 35.8, v: 31.4, type: 'acc',  label: 'Neuilly',          sel: false, chip: false },
    { id: 6, u: 42.6, v: 42.2, type: 'acc',  label: 'Porte Maillot',    sel: false, chip: false },
    { id: 7, u: 38.7, v: 63.4, type: 'camp', label: 'Passy',            sel: false, chip: true,  dx: -8,  dy: 32  },
    { id: 8, u: 24.3, v: 83.4, type: 'acc',  label: 'Boulogne',         sel: false, chip: false },
    { id: 9, u: 69.4, v: 64.1, type: 'opp',  label: 'Le Marais',        sel: false, chip: false },
    { id: 10, u: 77.2, v: 71.3, type: 'opp', label: 'Bastille',         sel: false, chip: false }
  ];

  var CHAOS_PATH = [ORIGIN, RECORDS[3], RECORDS[0], RECORDS[4], RECORDS[1], RECORDS[2]];

  var OPT_LEGS = [
    [ { u: 13.8, v: 13.8 }, { u: 18.6, v: 18.6 }, { u: 22.8, v: 22.8 } ],
    [ { u: 22.8, v: 22.8 }, { u: 29.5, v: 28.4 }, { u: 34.4, v: 27.6 }, { u: 39.2, v: 23.0 }, { u: 43.5, v: 20.6 } ],
    [ { u: 43.5, v: 20.6 }, { u: 45.2, v: 29.8 }, { u: 47.4, v: 37.5 }, { u: 48.9, v: 44.2 } ],
    [ { u: 48.9, v: 44.2 }, { u: 54.0, v: 45.0 }, { u: 58.2, v: 44.0 }, { u: 61.5, v: 43.2 } ],
    [ { u: 61.5, v: 43.2 }, { u: 65.8, v: 47.5 }, { u: 68.5, v: 51.0 }, { u: 70.2, v: 54.4 } ]
  ];

  var FULL_ROUTE_PTS = [];
  OPT_LEGS.forEach(function (leg, li) {
    leg.forEach(function (pt, pi) {
      if (li === 0 || pi > 0) FULL_ROUTE_PTS.push(pt);
    });
  });

  // Precompute arc-length table for smooth route camera flight & tangent heading angle
  var ROUTE_CUM = [0];
  var ROUTE_TOTAL = 0;
  for (var ri = 0; ri < FULL_ROUTE_PTS.length - 1; ri++) {
    var du = (FULL_ROUTE_PTS[ri + 1].u - FULL_ROUTE_PTS[ri].u) * (MAP_W / 100);
    var dv = (FULL_ROUTE_PTS[ri + 1].v - FULL_ROUTE_PTS[ri].v) * (MAP_H / 100);
    ROUTE_TOTAL += Math.hypot(du, dv);
    ROUTE_CUM.push(ROUTE_TOTAL);
  }
  function sampleRoute(progress) {
    var target = ROUTE_TOTAL * clamp(progress);
    for (var i = 0; i < FULL_ROUTE_PTS.length - 1; i++) {
      if (target <= ROUTE_CUM[i + 1] || i === FULL_ROUTE_PTS.length - 2) {
        var span = Math.max(0.0001, ROUTE_CUM[i + 1] - ROUTE_CUM[i]);
        var frac = clamp((target - ROUTE_CUM[i]) / span);
        var p0 = FULL_ROUTE_PTS[i], p1 = FULL_ROUTE_PTS[i + 1];
        var dx = (p1.u - p0.u) * (MAP_W / 100);
        var dy = (p1.v - p0.v) * (MAP_H / 100);
        return {
          u: lerp(p0.u, p1.u, frac),
          v: lerp(p0.v, p1.v, frac),
          angle: Math.atan2(dy, dx)
        };
      }
    }
    var last = FULL_ROUTE_PTS[FULL_ROUTE_PTS.length - 1];
    return { u: last.u, v: last.v, angle: 0 };
  }

  var LASSO_PTS = [
    { u: 17.5, v: 18.5 }, { u: 29.5, v: 13.5 }, { u: 46.8, v: 13.8 },
    { u: 57.5, v: 27.5 }, { u: 68.0, v: 36.8 }, { u: 75.0, v: 52.0 },
    { u: 71.2, v: 60.2 }, { u: 57.0, v: 51.5 }, { u: 45.8, v: 49.5 },
    { u: 39.6, v: 34.0 }, { u: 25.0, v: 30.2 }, { u: 18.0, v: 26.8 }
  ];

  /* ------------------------------------------------------------------------
     Viewport & True 2D Cinema Camera Projection (Pan + Scale + Rotation!)
     ------------------------------------------------------------------------ */
  var W = 1440, H = 900, DPR = 1;
  var isMobile = false;
  var cam = { u: 48, v: 49.5, z: 0.86, rot: 0 };
  var stageRect = { x: 432, y: 60, w: 948, h: 820 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    isMobile = W < 900;

    if (isMobile) {
      var maxNeed = 0;
      cards.forEach(function (c) {
        if (!c) return;
        var prevMax = c.style.maxHeight;
        c.style.maxHeight = 'none';
        maxNeed = Math.max(maxNeed, c.scrollHeight + 6);
        c.style.maxHeight = prevMax;
      });
      var cardTop = Math.min(H * 0.52, Math.max(H * 0.42, H * 0.97 - maxNeed));
      doc.documentElement.style.setProperty('--card-top', Math.round(cardTop) + 'px');
      stageRect = { x: 0, y: 54, w: W, h: Math.max(210, cardTop - 54) };
    } else {
      doc.documentElement.style.removeProperty('--card-top');
      var leftEdge = Math.max(430, W * 0.325);
      stageRect = { x: leftEdge, y: 62, w: Math.max(440, W - leftEdge - 56), h: H - 78 };
    }
  }
  window.addEventListener('resize', resize);
  resize();

  function mapScale() {
    if (isMobile) return (W / (MAP_W * 0.66)) * cam.z;
    var fitW = (stageRect.w * 0.96) / (MAP_W * 0.60);
    var fitH = (H - 36) / MAP_H;
    return Math.min(fitW, fitH) * cam.z;
  }
  function screenCenter() {
    if (isMobile) return { cx: W * 0.50, cy: stageRect.y + stageRect.h * 0.50 };
    return { cx: stageRect.x + stageRect.w * 0.50, cy: stageRect.y + stageRect.h * 0.50 };
  }
  function worldToScreen(u, v) {
    var sc = mapScale(), c = screenCenter();
    var dx = ((u - cam.u) / 100) * MAP_W * sc;
    var dy = ((v - cam.v) / 100) * MAP_H * sc;
    var cr = Math.cos(cam.rot), sr = Math.sin(cam.rot);
    return {
      x: c.cx + dx * cr - dy * sr,
      y: c.cy + dx * sr + dy * cr
    };
  }
  function toX(u, v) { return worldToScreen(u, v).x; }
  function toY(u, v) { return worldToScreen(u, v).y; }

  /* ------------------------------------------------------------------------
     CONTINUOUS ONE-TAKE CAMERA CHOREOGRAPHY (gs in [0.0 .. 5.999])
     Guaranteed C0 continuous across every act boundary — zero hard map cuts!
     ------------------------------------------------------------------------ */
  function computeCamera(gs) {
    var u, v, z, rot;
    if (gs < 1) {
      // ACT 00: Wide Greater Paris establishing field -> gentle push-in as scroll begins
      var k0 = easeIO(gs);
      u = lerp(48.0, 46.2, k0);
      v = lerp(49.5, 44.5, k0);
      z = lerp(isMobile ? 0.85 : 0.86, isMobile ? 0.95 : 0.98, k0);
      rot = lerp(0, -0.014, k0);
    } else if (gs < 2) {
      // ACT 01: Physically push INTO the selected 5-stop territory as lasso closes!
      var t1 = gs - 1;
      var k1 = easeIO(seg(t1, 0.04, 0.62));
      u = lerp(46.2, isMobile ? 45.2 : 45.6, k1);
      v = lerp(44.5, isMobile ? 35.5 : 36.2, k1);
      z = lerp(isMobile ? 0.95 : 0.98, isMobile ? 1.24 : 1.38, k1);
      rot = lerp(-0.014, isMobile ? 0.018 : 0.026, k1);
    } else if (gs < 3) {
      // ACT 02: UNMISTAKABLE ROUTE FLIGHT — swing to Nanterre/La Défense, fly ALONG all 5 stops
      //         with visible scale + road-heading bank, then pull up cleanly beside Plan a route!
      var t2 = gs - 2;
      var startU = isMobile ? 45.2 : 45.6;
      var startV = isMobile ? 35.5 : 36.2;
      var startZ = isMobile ? 1.24 : 1.38;
      var startRot = isMobile ? 0.018 : 0.026;

      var launchU = 19.2, launchV = 20.0;
      var launchZ = isMobile ? 1.66 : 1.96;
      var launchRot = isMobile ? -0.075 : -0.105;

      var endU = isMobile ? 44.5 : 64.5;
      var endV = isMobile ? 38.5 : 39.2;
      var endZ = isMobile ? 0.92 : 0.66;

      if (t2 < 0.14) {
        var ka = easeIO(seg(t2, 0.0, 0.14));
        u = lerp(startU, launchU, ka);
        v = lerp(startV, launchV, ka);
        z = lerp(startZ, launchZ, ka);
        rot = lerp(startRot, launchRot, ka);
      } else if (t2 < 0.64) {
        var fp = easeIO(seg(t2, 0.14, 0.64));
        var pt = sampleRoute(fp);
        var ptAhead = sampleRoute(Math.min(1, fp + 0.055));
        // Smooth look-ahead framing along the route
        var blendIn = smoothstep(seg(t2, 0.14, 0.22));
        var targetU = lerp(pt.u, ptAhead.u, 0.45);
        var targetV = lerp(pt.v, ptAhead.v, 0.45);
        u = lerp(launchU, targetU, blendIn);
        v = lerp(launchV, targetV, blendIn);
        // Dynamic zoom breathe along the route (peaks through La Défense -> Levallois -> 8e)
        var zWave = Math.sin(fp * Math.PI);
        z = (isMobile ? 1.64 : 1.94) + zWave * (isMobile ? 0.18 : 0.22);
        // Real road-heading camera bank (gentle, readable, unmistakably alive!)
        var headingBank = clamp(-Math.sin(pt.angle - 0.18) * (isMobile ? 0.085 : 0.125), -0.13, 0.11);
        rot = lerp(launchRot, headingBank, blendIn);
      } else {
        // Pull up smoothly from Stop 5 (Paris 3e) to reveal the full 5-stop corridor beside Plan a route!
        var kb = easeIO(seg(t2, 0.64, 0.88));
        var endPt = sampleRoute(1);
        var endRotStart = clamp(-Math.sin(endPt.angle - 0.18) * (isMobile ? 0.085 : 0.125), -0.13, 0.11);
        u = lerp(endPt.u, endU, kb);
        v = lerp(endPt.v, endV, kb);
        z = lerp(isMobile ? 1.64 : 1.94, endZ, kb);
        rot = lerp(endRotStart, 0, kb);
      }
    } else if (gs < 4) {
      // ACT 03: Rise & reframe into Calendar/Time plane -> pan cleanly so ALL 5 stops (1..5) stay 100% visible
      //         between the left story card and right-docked Today's Agenda on both 1440px and 1280px!
      var t3 = gs - 3;
      var k3a = easeIO(seg(t3, 0.0, 0.28));
      var k3b = easeIO(seg(t3, 0.46, 0.68));
      var u0 = isMobile ? 44.5 : 64.5;
      var v0 = isMobile ? 38.5 : 39.2;
      var z0 = isMobile ? 0.92 : 0.66;
      var uA = lerp(u0, 45.8, k3a);
      var vA = lerp(v0, isMobile ? 42.0 : 49.5, k3a);
      var zA = lerp(z0, isMobile ? 0.90 : 0.90, k3a);
      var rA = lerp(0, isMobile ? 0.010 : 0.018, k3a);

      u = isMobile ? uA : lerp(uA, 64.5, k3b);
      v = isMobile ? vA : lerp(vA, 38.5, k3b);
      z = isMobile ? zA : lerp(zA, 0.66, k3b);
      rot = lerp(rA, 0, k3b);
    } else if (gs < 5) {
      // ACT 04: UNMISTAKABLE STREET-LEVEL DIVE INTO LA DÉFENSE (STOP 1)
      //         Zoom multiplies >8x from 0.66 -> 5.55 revealing crisp real La Défense OpenStreetMap streets!
      var t4 = gs - 4;
      var kDive = easeIO(seg(t4, 0.0, 0.30));
      var kReportGlide = easeIO(seg(t4, 0.50, 0.70));
      var startU4 = isMobile ? 45.8 : 64.5;
      var startV4 = isMobile ? 42.0 : 38.5;
      var startZ4 = isMobile ? 0.90 : 0.66;

      // Keep Stop 1 (u=22.8, v=22.8) positioned cleanly in left-center of stageRect
      // so the zoomed La Défense streets + right-side mobile dock both breathe cleanly!
      var targetU4 = isMobile ? 22.8 : lerp(25.1, 25.6, kReportGlide);
      var targetV4 = isMobile ? 22.8 : lerp(22.8, 22.7, kReportGlide);
      var targetZ4 = isMobile ? lerp(3.75, 3.95, kReportGlide) : lerp(5.45, 5.70, kReportGlide);

      u = lerp(startU4, targetU4, kDive);
      v = lerp(startV4, targetV4, kDive);
      // Exponential-feel zoom curve so the dive accelerates optically like a real drone drop!
      var logZ = lerp(Math.log(startZ4), Math.log(targetZ4), kDive);
      z = Math.exp(logZ);
      // Subtle cinema dive bank peaking mid-descent then leveling cleanly at street level
      var diveBank = -Math.sin(kDive * Math.PI) * (isMobile ? 0.065 : 0.105);
      rot = diveBank + lerp(-0.020, 0, kReportGlide) * kDive;
    } else {
      // ACT 05: GRAND AERIAL PULLBACK from La Défense streets to all of Paris -> CALM FINAL HOLD!
      var t5 = gs - 5;
      var kPull = easeIO(seg(t5, 0.0, 0.38));
      var fromU5 = isMobile ? 22.8 : 25.6;
      var fromV5 = isMobile ? 22.8 : 22.7;
      var fromZ5 = isMobile ? 3.95 : 5.70;
      var toU5 = isMobile ? 46.5 : 45.2;
      var toV5 = isMobile ? 82.0 : 50.5;
      var toZ5 = isMobile ? 0.72 : 0.95;

      u = lerp(fromU5, toU5, kPull);
      v = lerp(fromV5, toV5, kPull);
      z = Math.exp(lerp(Math.log(fromZ5), Math.log(toZ5), kPull));
      rot = Math.sin(kPull * Math.PI) * (isMobile ? 0.025 : 0.042);
    }

    return { u: u, v: v, z: z, rot: rot };
  }

  /* ------------------------------------------------------------------------
     Drawing Primitives
     ------------------------------------------------------------------------ */
  function typeColor(type) {
    if (type === 'opp') return COL.signal;
    if (type === 'lead') return COL.pulse;
    if (type === 'camp') return COL.camp;
    return COL.acc;
  }
  function typeRgb(type) {
    if (type === 'opp') return RGB.signal;
    if (type === 'lead') return RGB.pulse;
    if (type === 'camp') return RGB.camp;
    return RGB.acc;
  }
  function typeLabel(type) {
    if (type === 'opp') return LABELS.objOpp;
    if (type === 'lead') return LABELS.objLead;
    if (type === 'camp') return LABELS.objCamp;
    return LABELS.objAcc;
  }
  function typeLetter(type) {
    if (type === 'opp') return 'O';
    if (type === 'lead') return 'L';
    if (type === 'camp') return 'C';
    return 'A';
  }

  function drawRoundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  /* Dual-LOD Rotated & Scaled Real Paris Basemap + Crisp La Défense Street Zoom */
  function drawMapBase() {
    ctx.fillStyle = COL.void;
    ctx.fillRect(0, 0, W, H);
    if (!mapReady) return;

    var sc = mapScale(), c = screenCenter();
    var dw = MAP_W * sc, dh = MAP_H * sc;
    var lodAlpha = easeIO(seg(cam.z, 2.05, 3.45));
    var wideAlpha = lerp(0.90, 0.34, lodAlpha);

    ctx.save();
    ctx.translate(c.cx, c.cy);
    ctx.rotate(cam.rot);

    // LOD 0: Wide Greater Paris atlas
    ctx.globalAlpha = wideAlpha;
    ctx.drawImage(darkMapCanvas, -(cam.u / 100) * dw, -(cam.v / 100) * dh, dw, dh);

    // LOD 1: Genuine 8.0x street-level La Défense map aligned to exact real roads!
    if (lodReady && lodAlpha > 0.01) {
      var lodSc = sc / LOD_SCALE_RATIO;
      var pinX = ((22.8 - cam.u) / 100) * dw;
      var pinY = ((22.8 - cam.v) / 100) * dh;
      ctx.globalAlpha = lodAlpha * 0.96;
      ctx.drawImage(
        darkLodCanvas,
        pinX - LOD_PIN_X * lodSc,
        pinY - LOD_PIN_Y * lodSc,
        LOD_W * lodSc,
        LOD_H * lodSc
      );
    }

    ctx.restore();
  }

  /* Partial polyline renderer in rotated/scaled camera space */
  function drawPolylineProgress(pts, progress, stroke, width, dash, glow) {
    if (progress <= 0.001 || pts.length < 2) return null;
    var screenPts = pts.map(function (p) { return worldToScreen(p.u, p.v); });
    var segLens = [], total = 0;
    for (var i = 0; i < screenPts.length - 1; i++) {
      var d = Math.hypot(screenPts[i + 1].x - screenPts[i].x, screenPts[i + 1].y - screenPts[i].y);
      segLens.push(d); total += d;
    }
    var targetDist = total * clamp(progress);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    var acc = 0, head = screenPts[0];
    for (var j = 0; j < segLens.length; j++) {
      if (acc + segLens[j] <= targetDist) {
        ctx.lineTo(screenPts[j + 1].x, screenPts[j + 1].y);
        acc += segLens[j];
        head = screenPts[j + 1];
      } else {
        var frac = segLens[j] > 0 ? (targetDist - acc) / segLens[j] : 0;
        var hx = lerp(screenPts[j].x, screenPts[j + 1].x, frac);
        var hy = lerp(screenPts[j].y, screenPts[j + 1].y, frac);
        ctx.lineTo(hx, hy);
        head = { x: hx, y: hy };
        break;
      }
    }
    if (glow) { ctx.shadowColor = stroke; ctx.shadowBlur = glow; }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    return head;
  }

  function drawAnchoredChip(rec, alphaVal, opts) {
    if (alphaVal <= 0.02) return;
    opts = opts || {};
    var sp = worldToScreen(rec.u, rec.v);
    var px = sp.x, py = sp.y;
    var col = opts.color || typeColor(rec.type);
    var title = opts.title || typeLabel(rec.type);
    var sub = opts.sub || rec.label;
    var badge = opts.badge || typeLetter(rec.type);
    var dx = (opts.dx !== undefined ? opts.dx : (rec.dx || 0)) * (isMobile ? 0.65 : 1);
    var dy = (opts.dy !== undefined ? opts.dy : (rec.dy || -34)) * (isMobile ? 0.78 : 1);

    ctx.save();
    ctx.globalAlpha = clamp(alphaVal);
    var fs = isMobile ? 11 : 12.5;
    var subFs = isMobile ? 10 : 11;
    ctx.font = '600 ' + fs + 'px ' + SANS;
    var tw = ctx.measureText(title).width;
    ctx.font = '500 ' + subFs + 'px ' + MONO;
    var sw = ctx.measureText(sub).width;
    var bw = Math.max(tw, sw) + (isMobile ? 40 : 48);
    var bh = isMobile ? 32 : 38;

    var minX = isMobile ? 10 : stageRect.x + 12;
    var maxX = (isMobile ? W : stageRect.x + stageRect.w) - bw - 10;
    var minY = isMobile ? stageRect.y + 38 : stageRect.y + 12;
    var maxY = (isMobile ? stageRect.y + stageRect.h : H - 46) - bh - 10;

    var bx = clamp(px + dx - bw / 2, minX, Math.max(minX, maxX));
    var by = clamp(py + dy - bh / 2, minY, Math.max(minY, maxY));

    var attachY = by > py ? by : by + bh;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(clamp(px, bx + 12, bx + bw - 12), attachY);
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    drawRoundRect(bx, by, bw, bh, 8);
    ctx.fillStyle = 'rgba(12, 17, 25, 0.94)';
    ctx.fill();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = col;
    ctx.stroke();

    var iconS = isMobile ? 19 : 23;
    drawRoundRect(bx + 6, by + (bh - iconS) / 2, iconS, iconS, 5);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.fillStyle = COL.void;
    ctx.font = '700 ' + (isMobile ? 10.5 : 11.5) + 'px ' + MONO;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(badge, bx + 6 + iconS / 2, by + bh / 2 + 0.5);

    ctx.textAlign = 'left';
    ctx.fillStyle = COL.chalk;
    ctx.font = '600 ' + fs + 'px ' + SANS;
    ctx.fillText(title, bx + iconS + 13, by + bh * 0.36);
    ctx.fillStyle = COL.mist;
    ctx.font = '500 ' + subFs + 'px ' + MONO;
    ctx.fillText(sub, bx + iconS + 13, by + bh * 0.72);
    ctx.restore();
  }

  function drawStagePill(text, x, y, col, a) {
    if (a <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = clamp(a);
    var fs = isMobile ? 10.5 : 11.8;
    ctx.font = '600 ' + fs + 'px ' + MONO;
    var w = ctx.measureText(text).width + 24;
    var h = isMobile ? 25 : 29;
    var minX = isMobile ? 10 : stageRect.x + 12;
    var maxX = (isMobile ? W : stageRect.x + stageRect.w) - w - 10;
    var minY = isMobile ? stageRect.y + 36 : stageRect.y + 10;
    var maxY = (isMobile ? stageRect.y + stageRect.h : H - 46) - h - 10;

    var rx = clamp(x - w / 2, minX, Math.max(minX, maxX));
    var ry = clamp(y - h / 2, minY, Math.max(minY, maxY));

    drawRoundRect(rx, ry, w, h, h / 2);
    ctx.fillStyle = 'rgba(11, 15, 22, 0.93)';
    ctx.fill();
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = col;
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, rx + w / 2, ry + h / 2 + 0.5);
    ctx.restore();
  }

  function drawOriginMarker(alpha, color) {
    if (alpha <= 0.02) return;
    var p = worldToScreen(ORIGIN.u, ORIGIN.v);
    ctx.save();
    ctx.globalAlpha = clamp(alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = COL.slate;
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     UNIFIED PERSISTENT 5-OBJECT MORPH RENDERER (Requirement #2)
     The EXACT SAME 5 Salesforce records visibly morph in place across all 6 acts:
     CRM Record Dot -> Selected Coral -> Gold Numbered Stop (1..5)
                    -> Teal Calendar Event (orbital clock ring) -> Completed ✓
     ------------------------------------------------------------------------ */
  function drawPersistentRecords(gs, T, globalDim) {
    // Outside 6 records smoothly recede as lasso closes & stay subtle during street dive
    var outLock = easeOut(seg(gs, 1.38, 1.62));
    var diveFadeOut = 1 - easeIO(seg(gs, 4.04, 4.24)) + easeIO(seg(gs, 5.06, 5.34));
    var outAlpha = lerp(0.92, 0.14, outLock) * clamp(diveFadeOut) * globalDim;

    RECORDS.forEach(function (r, idx) {
      if (r.sel) return;
      if (outAlpha <= 0.02) return;
      var sp = worldToScreen(r.u, r.v);
      var col = typeColor(r.type);
      var rad = lerp(isMobile ? 6.5 : 8, isMobile ? 4.5 : 5, outLock);
      ctx.save();
      ctx.globalAlpha = outAlpha;
      if (gs < 0.9 && r.chip) {
        var ph = (T * 0.45 + idx * 0.17) % 1;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, rad + 6 + ph * 14, 0, Math.PI * 2);
        ctx.strokeStyle = col;
        ctx.globalAlpha = outAlpha * (1 - ph) * 0.5;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = outAlpha;
      }
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = COL.slate;
      ctx.fill();
      ctx.lineWidth = 1.9;
      ctx.strokeStyle = col;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rad * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
    });

    // The 5 persistent target stops (id 0..4, order 1..5)
    RECORDS.forEach(function (r, idx) {
      if (!r.sel) return;
      var sp = worldToScreen(r.u, r.v);
      // Skip stops cleanly far outside screen bounds during deep La Défense zoom
      if (sp.x < -80 || sp.x > W + 80 || sp.y < -80 || sp.y > H + 80) return;

      // Continuous morph weights strictly derived from gs
      var selW = easeOut(seg(gs, 1.08 + idx * 0.068, 1.24 + idx * 0.068));
      var hitGs = 2.14 + r.routeFrac * 0.48;
      var optW = easeOut(seg(gs, hitGs - 0.02, hitGs + 0.06));
      var calW = easeOut(seg(gs, 3.02 + idx * 0.032, 3.22 + idx * 0.032));
      var doneW = idx === 0
        ? easeOut(seg(gs, 4.49, 4.58)) // Stop 1 completes right at La Défense Check-in -> Report!
        : easeOut(seg(gs, 5.08 + (idx - 1) * 0.055, 5.20 + (idx - 1) * 0.055)); // Stops 2..5 cascade on pullback!
      var execFocusW = idx === 0
        ? easeIO(seg(gs, 4.04, 4.30)) * (1 - easeIO(seg(gs, 5.0, 5.30)))
        : 0;

      // Smooth RGB color journey: native CRM hue -> Signal Coral -> Gold -> Pulse Teal
      var rgb = typeRgb(r.type);
      rgb = mixRgb(rgb, RGB.signal, selW);
      rgb = mixRgb(rgb, RGB.gold, optW);
      rgb = mixRgb(rgb, RGB.pulse, calW);
      var strokeCss = rgbCss(rgb);

      // Core disc fill morphs smoothly from dark slate -> solid luminous badge as optW arrives
      var solidW = Math.max(selW * 0.45, optW);
      var fillRgb = mixRgb(RGB.slate, rgb, solidW);
      var fillCss = rgbCss(fillRgb);

      // Continuous geometry morph
      var baseR = isMobile ? 6.8 : 8.2;
      var rad = baseR
        + selW * (isMobile ? 2.0 : 2.6)
        + optW * (isMobile ? 1.5 : 2.2)
        - calW * (isMobile ? 0.5 : 0.7)
        + execFocusW * (isMobile ? 3.2 : 5.2)
        + doneW * (isMobile ? 0.5 : 0.8);

      // Transition shockwave bursts (lasso catch, route hit, check-in confirmation)
      var burstSel = seg(gs, 1.12 + idx * 0.068, 1.32 + idx * 0.068);
      var burstOpt = seg(gs, hitGs, hitGs + 0.14);
      var burstDone = idx === 0
        ? seg(gs, 4.49, 4.68)
        : seg(gs, 5.08 + (idx - 1) * 0.055, 5.30 + (idx - 1) * 0.055);

      ctx.save();
      ctx.globalAlpha = globalDim;

      // 1) Transient arrival shockwave rings
      [burstSel, burstOpt, burstDone].forEach(function (b) {
        if (b > 0.01 && b < 0.99) {
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, rad + b * (isMobile ? 22 : 34), 0, Math.PI * 2);
          ctx.strokeStyle = strokeCss;
          ctx.globalAlpha = globalDim * (1 - b) * 0.78;
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.globalAlpha = globalDim;
        }
      });

      // 2) Ambient halo glow
      var glowR = rad * (2.6 + execFocusW * 0.9);
      var grad = ctx.createRadialGradient(sp.x, sp.y, rad * 0.25, sp.x, sp.y, glowR);
      grad.addColorStop(0, strokeCss);
      grad.addColorStop(1, 'rgba(9,12,16,0)');
      ctx.fillStyle = grad;
      ctx.globalAlpha = globalDim * (0.34 + execFocusW * 0.16);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = globalDim;

      // 3) Calendar Event orbital clock-arc ring (visible during calW before completion!)
      var clockRingW = calW * (1 - doneW * 0.65) * (1 - execFocusW * 0.4);
      if (clockRingW > 0.04) {
        ctx.save();
        ctx.globalAlpha = globalDim * clockRingW * 0.85;
        ctx.beginPath();
        var orbitR = rad + 4.5;
        var aStart = -Math.PI / 2 + T * 0.55 + idx * 0.9;
        ctx.arc(sp.x, sp.y, orbitR, aStart, aStart + Math.PI * 1.45);
        ctx.strokeStyle = COL.pulse;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
      }

      // 4) Ambient rhythmic pulse on active stops
      if (selW > 0.4 || (gs < 1 && r.chip)) {
        var ph = (T * 0.52 + idx * 0.19) % 1;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, rad + 5 + ph * 14, 0, Math.PI * 2);
        ctx.strokeStyle = strokeCss;
        ctx.globalAlpha = globalDim * (1 - ph) * 0.42;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = globalDim;
      }

      // 5) Main persistent circle body
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = fillCss;
      ctx.fill();
      ctx.lineWidth = 2.2 + execFocusW * 0.6;
      ctx.strokeStyle = execFocusW > 0.3 ? COL.chalk : strokeCss;
      ctx.stroke();

      // 6) Smooth glyph cross-morph inside the SAME pin: dot -> 1..5 -> ✓
      var dotAlpha = 1 - optW;
      var numAlpha = optW * (1 - doneW);
      var chkAlpha = doneW;

      if (dotAlpha > 0.04) {
        ctx.save();
        ctx.globalAlpha = globalDim * dotAlpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, rad * 0.36, 0, Math.PI * 2);
        ctx.fillStyle = solidW > 0.45 ? COL.void : strokeCss;
        ctx.fill();
        ctx.restore();
      }
      if (numAlpha > 0.04) {
        ctx.save();
        ctx.globalAlpha = globalDim * numAlpha;
        ctx.translate(sp.x, sp.y);
        var ns = lerp(0.65, 1.0, optW) * lerp(1.0, 0.55, doneW);
        ctx.scale(ns, ns);
        ctx.fillStyle = COL.void;
        ctx.font = '700 ' + Math.round(rad * 1.12) + 'px ' + MONO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(r.order), 0, 0.6);
        ctx.restore();
      }
      if (chkAlpha > 0.04) {
        ctx.save();
        ctx.globalAlpha = globalDim * chkAlpha;
        ctx.translate(sp.x, sp.y);
        var cs = lerp(0.55, 1.0, chkAlpha);
        ctx.scale(cs, cs);
        ctx.fillStyle = COL.void;
        ctx.font = '700 ' + Math.round(rad * 1.18) + 'px ' + MONO;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', 0, 0.6);
        ctx.restore();
      }

      ctx.restore();
    });
  }

  /* ------------------------------------------------------------------------
     DOM Payoff Visibility & Live Phase Indicators
     ------------------------------------------------------------------------ */
  function setPayoff(el, opacity, tx, ty, scale, extraPrefix) {
    if (!el) return;
    var o = clamp(opacity);
    el.style.opacity = o.toFixed(3);
    el.classList.toggle('is-live', o > 0.02);
    el.classList.toggle('is-interactive', o > 0.55);
    var prefix = extraPrefix ? extraPrefix + ' ' : '';
    if (tx !== undefined || ty !== undefined || scale !== undefined || prefix) {
      el.style.transform = prefix + 'translate3d(' + (tx || 0).toFixed(1) + 'px,' + (ty || 0).toFixed(1) + 'px,0) scale(' + (scale || 1).toFixed(3) + ')';
    }
  }

  function resetAllPayoffs() {
    setPayoff(payoffSelect, 0, 0, 20, 0.96);
    setPayoff(payoffOptimize, 0, 32, 0, 0.97);
    setPayoff(payoffCalendar, 0, 0, 0, 1);
    setPayoff(payoffConflicts, 0, 0, 18, 0.96, isMobile ? 'translate(-50%,-50%)' : 'translateX(-50%)');
    setPayoff(payoffAgenda, 0, 28, 0, 0.97);
    setPayoff(payoffExecute, 0, 0, 0, 1);
    setPayoff(execStageCheckin, 0, 0, 10, 0.97);
    setPayoff(execStageReport, 0, 0, 10, 0.97);
    setPayoff(payoffComplete, 0, 0, 18, 0.97);
  }

  var lastCalPhase = '';
  function setCalPhase(isAgenda) {
    var phase = isAgenda ? 'agenda' : 'conflicts';
    if (phase === lastCalPhase) return;
    lastCalPhase = phase;
    if (calStoryCard) calStoryCard.setAttribute('data-cal-phase', phase);
    if (calPhasePill) {
      calPhasePill.classList.toggle('phase-pill--gold', !isAgenda);
      var sp = calPhasePill.querySelector('span');
      if (sp) sp.textContent = isAgenda ? LABELS.calPhase2 : LABELS.calPhase1;
    }
    calStepItems.forEach(function (li) {
      var st = li.getAttribute('data-step');
      li.classList.toggle('is-active', (!isAgenda && st === '1') || (isAgenda && st === '2'));
      li.classList.toggle('is-done', isAgenda && st === '1');
    });
  }

  var lastExecPhase = '';
  function setExecPhase(isReport) {
    var phase = isReport ? 'report' : 'checkin';
    if (phase === lastExecPhase) return;
    lastExecPhase = phase;
    if (execStoryCard) execStoryCard.setAttribute('data-exec-phase', phase);
    if (execSpatialDock) execSpatialDock.setAttribute('data-phase', phase);
    if (execPhasePill) {
      var sp = execPhasePill.querySelector('span');
      if (sp) sp.textContent = isReport ? LABELS.execPhase2 : LABELS.execPhase1;
    }
    execStepItems.forEach(function (li) {
      var st = li.getAttribute('data-step');
      li.classList.toggle('is-active', (!isReport && st === '1') || (isReport && st === '2'));
      li.classList.toggle('is-done', isReport && st === '1');
    });
  }

  /* ------------------------------------------------------------------------
     MAIN CONTINUOUS FILM RENDERER (gs in [0.000 .. 5.999])
     ------------------------------------------------------------------------ */
  var T = 0;

  function renderFilm(gs) {
    var act = clamp(Math.floor(gs), 0, 5);
    var t = clamp(gs - act, 0, 1);
    var realMode = false;

    resetAllPayoffs();

    // 1) Continuous one-take camera update + subtle cinema focus mode during pure flight & dive beats
    cam = computeCamera(gs);
    var inCinemaFocus = !isMobile && ((gs >= 2.08 && gs <= 2.66) || (gs >= 4.04 && gs <= 4.26));
    film.classList.toggle('is-cinema-focus', inCinemaFocus);
    window.__tourviaState = {
      gs: Number(gs.toFixed(4)),
      act: act,
      t: Number(t.toFixed(4)),
      cam: {
        u: Number(cam.u.toFixed(2)),
        v: Number(cam.v.toFixed(2)),
        z: Number(cam.z.toFixed(3)),
        rotDeg: Number((cam.rot * 180 / Math.PI).toFixed(2))
      }
    };

    // 2) Draw dual-LOD rotated/scaled real Paris cartography
    drawMapBase();

    // 3) Continuous Chaotic Backtracking Path (Act 00 -> dissolves smoothly at Act 02 launch)
    var chaosA = (gs < 1)
      ? 0.44 * (1 - seg(gs, 0.85, 1.0) * 0.4)
      : (gs < 2)
        ? 0.26 * (1 - seg(gs, 1.08, 1.38))
        : (gs < 2.24)
          ? 0.72 * (1 - easeOut(seg(gs, 2.06, 2.22)))
          : 0;
    if (chaosA > 0.02) {
      ctx.save();
      ctx.globalAlpha = chaosA;
      var chaosProg = gs < 1 ? (0.35 + 0.65 * easeOut(seg(gs, 0, 0.55))) : 1;
      var cPath = gs < 2 ? [RECORDS[8], RECORDS[4], RECORDS[0], RECORDS[10], RECORDS[7], RECORDS[1], RECORDS[2]] : CHAOS_PATH;
      drawPolylineProgress(cPath, chaosProg, COL.chaos, gs >= 2 ? 2.2 : 1.6, [6, 7], 0);
      ctx.restore();
    }

    // 4) Continuous Lasso Polygon (Act 01, fades cleanly as Act 02 launches)
    if (gs >= 1.0 && gs < 2.18) {
      var drawP = easeIO(seg(gs, 1.04, 1.46));
      var lockP = easeOut(seg(gs, 1.40, 1.62));
      var lassoFade = 1 - easeOut(seg(gs, 1.92, 2.16));
      if (drawP > 0.01 && lassoFade > 0.01) {
        var lassoClosed = LASSO_PTS.concat([LASSO_PTS[0]]);
        ctx.save();
        ctx.globalAlpha = lassoFade;
        if (lockP > 0.01) {
          ctx.beginPath();
          LASSO_PTS.forEach(function (p, i) {
            var sp = worldToScreen(p.u, p.v);
            if (i === 0) ctx.moveTo(sp.x, sp.y); else ctx.lineTo(sp.x, sp.y);
          });
          ctx.closePath();
          ctx.fillStyle = 'rgba(255, 110, 64, ' + (0.14 * lockP).toFixed(3) + ')';
          ctx.fill();
        }
        var head = drawPolylineProgress(lassoClosed, drawP, COL.signal, 2.6, [9, 5], 12);
        if (head && drawP < 0.99) {
          ctx.beginPath();
          ctx.arc(head.x, head.y, 5.5, 0, Math.PI * 2);
          ctx.fillStyle = COL.chalk;
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = COL.signal;
          ctx.stroke();
        }
        LASSO_PTS.forEach(function (p, pi) {
          var vp = seg(drawP, pi / LASSO_PTS.length, (pi + 0.5) / LASSO_PTS.length);
          if (vp > 0.05) {
            var vsp = worldToScreen(p.u, p.v);
            ctx.beginPath();
            ctx.arc(vsp.x, vsp.y, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = COL.chalk;
            ctx.fill();
            ctx.strokeStyle = COL.signal;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        });
        ctx.restore();
      }
    }

    // 5) Continuous Optimized Route Corridor (draws across Act 02 flight, morphs gold -> teal in Act 03, stays alive through Act 04 & 05!)
    if (gs >= 2.10) {
      var routeDraw = gs < 2.64 ? easeIO(seg(gs, 2.12, 2.62)) : 1;
      var calMix = easeIO(seg(gs, 3.00, 3.24));
      var routeRgb = mixRgb(RGB.gold, RGB.pulse, calMix);
      var routeStroke = rgbCss(routeRgb);
      var routeGlow = rgbCss(routeRgb, 0.30);
      var routeAlpha = (act === 4) ? 0.65 : 1.0;

      ctx.save();
      ctx.globalAlpha = routeAlpha;
      drawPolylineProgress(FULL_ROUTE_PTS, routeDraw, routeGlow, act === 5 ? 12 : 9.5, null, 18);
      var beamHead = drawPolylineProgress(FULL_ROUTE_PTS, routeDraw, routeStroke, 3.8, null, 12);
      if (beamHead && routeDraw < 0.99) {
        ctx.beginPath();
        ctx.arc(beamHead.x, beamHead.y, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = COL.chalk;
        ctx.shadowColor = COL.gold;
        ctx.shadowBlur = 16;
        ctx.fill();
      }

      // Act 05 calm continuous light pulse running along the completed day
      if (act === 5) {
        var travelP = (T * 0.18) % 1;
        var runner = drawPolylineProgress(FULL_ROUTE_PTS, travelP, 'rgba(242,239,232,0)', 1, null, 0);
        if (runner) {
          ctx.beginPath();
          ctx.arc(runner.x, runner.y, 4.8, 0, Math.PI * 2);
          ctx.fillStyle = COL.chalk;
          ctx.shadowColor = COL.pulse;
          ctx.shadowBlur = 16;
          ctx.fill();
        }
      }
      ctx.restore();

      // Origin marker (Nanterre)
      var originA = act === 4 ? 0 : (act === 2 ? easeOut(seg(t, 0.04, 0.16)) : 0.9);
      drawOriginMarker(originA, act >= 3 ? COL.pulse : COL.chalk);
    }

    // 6) Act 03: Time-Plane Axis Horizon + Live Binding Threads to Today's Agenda
    var conflictIn = 0, agendaIn = 0;
    if (act === 3) {
      conflictIn = easeOut(seg(t, 0.14, 0.28)) * (1 - easeOut(seg(t, 0.46, 0.54)));
      agendaIn = easeOut(seg(t, 0.50, 0.64)) * (1 - seg(t, 0.94, 1));
      setCalPhase(t >= 0.49);

      // Subtle luminous calendar time-axis rising beneath the Paris corridor during Phase A
      var axisA = easeOut(seg(t, 0.04, 0.20)) * (1 - agendaIn * 0.85);
      if (!isMobile && axisA > 0.02) {
        var axisY = stageRect.y + stageRect.h * 0.57;
        var axisX0 = stageRect.x + 42;
        var axisX1 = stageRect.x + stageRect.w - 42;
        ctx.save();
        ctx.globalAlpha = axisA * 0.55;
        ctx.beginPath();
        ctx.moveTo(axisX0, axisY);
        ctx.lineTo(axisX1, axisY);
        ctx.strokeStyle = COL.pulse;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ['08:15', '09:00', '09:45', '10:30', '11:15'].forEach(function (tm, i) {
          var tx = lerp(axisX0 + 36, axisX1 - 36, i / 4);
          var sp = worldToScreen(RECORDS[i].u, RECORDS[i].v);
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y + 12);
          ctx.lineTo(tx, axisY - 8);
          ctx.strokeStyle = 'rgba(61, 214, 198, 0.32)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = COL.pulse;
          ctx.font = '600 10.5px ' + MONO;
          ctx.textAlign = 'center';
          ctx.fillText(tm, tx, axisY + 14);
        });
        ctx.restore();
      }

      // Phase B on desktop: animated teal binding arcs connecting ALL 5 visible Paris pins
      // directly into their exact 5 corresponding event rows (08:15..11:15) inside Today's Agenda!
      if (!isMobile && agendaIn > 0.06) {
        var agCardRect = payoffAgenda ? payoffAgenda.getBoundingClientRect() : null;
        var agImg = payoffAgenda ? payoffAgenda.querySelector('img') : null;
        var agRect = agImg ? agImg.getBoundingClientRect() : null;
        var dockLeft = agCardRect && agCardRect.width > 40 ? (agCardRect.left - 2) : (stageRect.x + stageRect.w - Math.min(320, stageRect.w * 0.38) - 8);
        // Exact vertical row fractions inside agenda-5-events-crop.webp (260x638): 08:15, 09:00, 09:45, 10:30, 11:15
        var rowFracs = [0.375, 0.495, 0.612, 0.730, 0.846];
        RECORDS.forEach(function (r, idx) {
          if (!r.sel) return;
          var sp = worldToScreen(r.u, r.v);
          var ty = (agRect && agRect.height > 100)
            ? (agRect.top + agRect.height * rowFracs[idx])
            : (stageRect.y + 190 + idx * 62);
          var ctrlX = lerp(sp.x, dockLeft, 0.56);
          var ctrlY = lerp(sp.y, ty, 0.38) - (idx < 2 ? 22 : 10);
          ctx.save();
          ctx.globalAlpha = agendaIn * 0.92;
          ctx.beginPath();
          ctx.moveTo(sp.x, sp.y);
          ctx.quadraticCurveTo(ctrlX, ctrlY, dockLeft, ty);
          ctx.strokeStyle = COL.pulse;
          ctx.lineWidth = 2.0;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Target anchor dot right at the outer left edge of Today's Agenda frame
          ctx.beginPath();
          ctx.arc(dockLeft, ty, 4.0, 0, Math.PI * 2);
          ctx.fillStyle = COL.pulse;
          ctx.fill();

          // Flowing light bead traveling from map stop -> agenda event
          var bt = (T * 0.45 + idx * 0.18) % 1;
          var inv = 1 - bt;
          var bx = inv * inv * sp.x + 2 * inv * bt * ctrlX + bt * bt * dockLeft;
          var by = inv * inv * sp.y + 2 * inv * bt * ctrlY + bt * bt * ty;
          ctx.beginPath();
          ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = COL.chalk;
          ctx.shadowColor = COL.pulse;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        });
      }
    }

    // 7) Act 04: Live Street-Level GPS Proximity Radar & Spatial Tether Line to Stop 1!
    var execWrap = 0, checkinA = 0, reportA = 0, isReportPhase = false;
    if (act === 4) {
      execWrap = easeOut(seg(t, 0.22, 0.34)) * (1 - seg(t, 0.94, 1));
      checkinA = easeOut(seg(t, 0.24, 0.35)) * (1 - easeOut(seg(t, 0.47, 0.55)));
      reportA = easeOut(seg(t, 0.52, 0.62)) * (1 - seg(t, 0.94, 1));
      isReportPhase = t >= 0.51;
      setExecPhase(isReportPhase);

      var s1 = worldToScreen(RECORDS[0].u, RECORDS[0].v);
      var proxA = easeOut(seg(t, 0.14, 0.32)) * (1 - seg(t, 0.94, 1));
      if (proxA > 0.02) {
        var baseR = isMobile ? 42 : 76;
        ctx.save();
        // Outer translucent proximity zone
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, baseR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(61, 214, 198, ' + (0.11 * proxA).toFixed(3) + ')';
        ctx.fill();
        ctx.strokeStyle = 'rgba(61, 214, 198, ' + (0.76 * proxA).toFixed(3) + ')';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([6, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Rotating live GPS sonar sweep wedge
        var sweepAng = T * 1.15;
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.arc(s1.x, s1.y, baseR, sweepAng, sweepAng + 0.52);
        ctx.closePath();
        ctx.fillStyle = 'rgba(61, 214, 198, ' + (0.16 * proxA).toFixed(3) + ')';
        ctx.fill();

        // Expanding radar pulse ring
        var wave = (T * 0.52) % 1;
        ctx.beginPath();
        ctx.arc(s1.x, s1.y, lerp(16, baseR * 1.4, wave), 0, Math.PI * 2);
        ctx.strokeStyle = COL.pulse;
        ctx.globalAlpha = proxA * (1 - wave) * 0.55;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Live glowing spatial tether line connects Stop 1 (La Défense) directly to Stop 1's Check-in popup (Beat 01)
        // Smoothly releases during Beat 02 when displaying the separate Paris sample Visit Report (Eco-Energie France)
        if (!isMobile && checkinA > 0.05) {
          var dockW = Math.min(378, stageRect.w * 0.42);
          var dockAnchorX = stageRect.x + stageRect.w - dockW - 2;
          var dockAnchorY = stageRect.y + stageRect.h * 0.50;
          var midX = lerp(s1.x, dockAnchorX, 0.5);
          ctx.globalAlpha = checkinA * 0.90;
          ctx.beginPath();
          ctx.moveTo(s1.x + 18, s1.y);
          ctx.bezierCurveTo(midX, s1.y, midX, dockAnchorY, dockAnchorX, dockAnchorY);
          ctx.strokeStyle = COL.pulse;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Flowing data pulse dot from Stop 1 -> Check-in popup
          var dtPos = (T * 0.65) % 1;
          var inv3 = 1 - dtPos;
          var px = inv3 * inv3 * inv3 * (s1.x + 18)
                 + 3 * inv3 * inv3 * dtPos * midX
                 + 3 * inv3 * dtPos * dtPos * midX
                 + dtPos * dtPos * dtPos * dockAnchorX;
          var py = inv3 * inv3 * inv3 * s1.y
                 + 3 * inv3 * inv3 * dtPos * s1.y
                 + 3 * inv3 * dtPos * dtPos * dockAnchorY
                 + dtPos * dtPos * dtPos * dockAnchorY;
          ctx.beginPath();
          ctx.arc(px, py, 3.8, 0, Math.PI * 2);
          ctx.fillStyle = COL.chalk;
          ctx.shadowColor = COL.pulse;
          ctx.shadowBlur = 12;
          ctx.fill();
        }
        ctx.restore();
      }
    }

    // 8) Draw ALL 11 persistent records with continuous state morphing!
    var mobileOverlayDim = isMobile && (
      (act === 2 && seg(t, 0.68, 0.80) > 0.1) ||
      (act === 3 && Math.max(conflictIn, agendaIn) > 0.15) ||
      (act === 4 && execWrap > 0.15)
    ) ? 0.34 : 1.0;
    drawPersistentRecords(gs, T, mobileOverlayDim);

    // 9) Contextual Chips, Stage Pills & Real Product Payoffs per Act
    if (act === 0) {
      RECORDS.forEach(function (r, idx) {
        if (!r.chip) return;
        var aIn = easeOut(seg(t + 0.25, idx * 0.04, 0.28 + idx * 0.04));
        var aOut = 1 - seg(t, 0.82, 1);
        drawAnchoredChip(r, aIn * aOut);
      });
      if (!isMobile) {
        var cPill = worldToScreen(47, 11);
        drawStagePill(LABELS.chaosTag, cPill.x, cPill.y, COL.chaos, 0.84 * (1 - seg(t, 0.78, 1)));
      }
    } else if (act === 1) {
      var lockP1 = easeOut(seg(t, 0.40, 0.62));
      var modalIn = easeOut(seg(t, 0.50, 0.68)) * (1 - seg(t, 0.92, 1));
      var mobChipClear = isMobile ? clamp(1 - modalIn * 1.35) : 1;
      RECORDS.forEach(function (r, idx) {
        if (!r.sel) return;
        if (lockP1 > 0.16 && mobChipClear > 0.04 && (!isMobile || idx === 0 || idx === 4)) {
          drawAnchoredChip(r, lockP1 * (1 - seg(t, 0.88, 1)) * mobChipClear, {
            color: typeColor(r.type),
            sub: r.label,
            dy: isMobile && idx === 4 ? 30 : r.dy
          });
        }
      });
      var aPos = isMobile ? { x: W * 0.50, y: stageRect.y + stageRect.h - 20 } : worldToScreen(45, 9.5);
      drawStagePill(LABELS.areaTag, aPos.x, aPos.y, COL.signal, Math.max(seg(t, 0.32, 0.56), lockP1) * (1 - seg(t, 0.90, 1)));

      setPayoff(payoffSelect, modalIn, 0, lerp(26, 0, modalIn), lerp(0.95, 1, modalIn));
      if (modalIn > 0.45) realMode = true;
    } else if (act === 2) {
      var drawerIn = easeOut(seg(t, 0.68, 0.82)) * (1 - seg(t, 0.94, 1));
      if (!isMobile) {
        var depP = worldToScreen(ORIGIN.u, ORIGIN.v);
        drawStagePill(LABELS.departure, depP.x + 34, depP.y - 26, COL.chalk, easeOut(seg(t, 0.06, 0.16)) * (1 - seg(t, 0.35, 0.48)));
      }
      // Show live arriving stop chips during the flight & calm sequence summary when pulled back
      RECORDS.forEach(function (r, idx) {
        if (!r.sel) return;
        var hitAt = 0.14 + r.routeFrac * 0.48;
        var popped = easeOut(seg(t, hitAt - 0.01, hitAt + 0.07));
        if (popped > 0.25 && (!isMobile || (idx === 0 || idx === 2 || idx === 4))) {
          // During close-up flight, spotlight active stop; when pulled back beside drawer, keep clean non-overlapping stops
          var distToHead = Math.abs(t - hitAt);
          var flightBoost = t < 0.64 ? clamp(1.3 - distToHead * 3.4) : (idx === 0 || idx === 2 || idx === 4 ? 0.92 : 0);
          var chipA = popped * (isMobile ? (1 - drawerIn) * (idx === 2 ? 1 : 0) : Math.max(flightBoost, 0));
          drawAnchoredChip(r, chipA, {
            color: COL.gold,
            badge: String(r.order),
            title: r.time + ' · ' + r.label,
            sub: typeLabel(r.type),
            dx: isMobile ? -40 : r.dx,
            dy: isMobile ? 36 : r.dy
          });
        }
      });

      var lunchP = easeOut(seg(t, 0.48, 0.62)) * (1 - (isMobile ? drawerIn : 0));
      if (isMobile) {
        drawStagePill(LABELS.lunch, W * 0.72, stageRect.y + stageRect.h - 22, COL.gold, lunchP);
      } else {
        drawStagePill(LABELS.lunch, stageRect.x + stageRect.w * 0.34, stageRect.y + stageRect.h - 28, COL.gold, lunchP * (1 - seg(t, 0.92, 1)));
        drawStagePill(LABELS.optTag, stageRect.x + stageRect.w * 0.34, stageRect.y + 22, COL.gold, easeOut(seg(t, 0.56, 0.72)) * (1 - seg(t, 0.92, 1)));
      }

      setPayoff(payoffOptimize, drawerIn, lerp(36, 0, drawerIn), 0, lerp(0.96, 1, drawerIn));
      if (drawerIn > 0.42) realMode = true;
    } else if (act === 3) {
      RECORDS.forEach(function (r, idx) {
        if (!r.sel) return;
        if (!isMobile && agendaIn < 0.35 && (idx === 0 || idx === 1 || idx === 4)) {
          drawAnchoredChip(r, 0.92 * (1 - agendaIn * 2.5), {
            color: COL.pulse,
            badge: String(r.order),
            title: r.time + ' · ' + r.label,
            sub: LABELS.objAcc
          });
        }
      });

      if (!isMobile) {
        if (conflictIn > 0.12) {
          drawStagePill(LABELS.conflictScan, screenCenter().cx, stageRect.y + 22, COL.gold, conflictIn);
        } else if (agendaIn > 0.12) {
          drawStagePill(LABELS.agendaReady, stageRect.x + stageRect.w * 0.32, stageRect.y + 22, COL.pulse, agendaIn);
        }
      }

      var calWrapA = Math.max(conflictIn, agendaIn);
      setPayoff(payoffCalendar, calWrapA, 0, 0, 1);
      setPayoff(
        payoffConflicts,
        conflictIn,
        0,
        lerp(20, 0, conflictIn),
        lerp(0.96, 1, conflictIn),
        isMobile ? 'translate(-50%,-50%)' : 'translateX(-50%)'
      );
      setPayoff(payoffAgenda, agendaIn, lerp(32, 0, agendaIn), 0, lerp(0.96, 1, agendaIn));
      if (calWrapA > 0.4) realMode = true;
    } else if (act === 4) {
      // Crisp floating Stop 1 location badge anchored directly above La Défense pin (stays visible during BOTH check-in & report!)
      var badgeA = easeOut(seg(t, 0.18, 0.32)) * (1 - seg(t, 0.94, 1)) * (isMobile ? Math.max(0, 1 - execWrap) : 1);
      if (badgeA > 0.05) {
        drawAnchoredChip(RECORDS[0], badgeA, {
          color: COL.pulse,
          badge: isReportPhase ? '✓' : '1',
          title: LABELS.stop1Title,
          sub: isReportPhase ? LABELS.stop1Done : LABELS.stop1Checkin,
          dx: 0,
          dy: -60
        });
      }

      var pillAlpha = easeOut(seg(t, 0.12, 0.26)) * (1 - seg(t, 0.92, 1)) * (isMobile ? Math.max(0, 1 - execWrap) : 0.98);
      var pillText = isReportPhase
        ? (isMobile ? LABELS.writtenMob : LABELS.written)
        : (isMobile ? LABELS.proximityMob : LABELS.proximity);
      if (pillAlpha > 0.05) {
        drawStagePill(pillText, isMobile ? screenCenter().cx : stageRect.x + stageRect.w * 0.36, isMobile ? stageRect.y + 42 : stageRect.y + 22, COL.pulse, pillAlpha);
      }

      setPayoff(payoffExecute, execWrap, lerp(22, 0, execWrap), 0, lerp(0.97, 1, execWrap));
      setPayoff(execStageCheckin, checkinA, 0, lerp(10, 0, checkinA), lerp(0.97, 1, checkinA));
      setPayoff(execStageReport, reportA, 0, lerp(12, 0, reportA), lerp(0.97, 1, reportA));
      if (execWrap > 0.4) realMode = true;
    } else if (act === 5) {
      // Pullback resolves by t = 0.38, then HOLDS cleanly until t = 1.00!
      var revealAll = easeOut(seg(t, 0.14, 0.38));
      RECORDS.forEach(function (r, idx) {
        if (!r.sel) return;
        var doneChip = easeOut(seg(t, 0.18 + idx * 0.04, 0.34 + idx * 0.04));
        if (!isMobile && doneChip > 0.35 && (idx === 0 || idx === 1 || idx === 3)) {
          drawAnchoredChip(r, doneChip * 0.96, {
            color: COL.pulse,
            badge: '✓',
            title: r.label,
            sub: r.time + ' · OK'
          });
        }
      });

      if (!isMobile) {
        drawStagePill(LABELS.completeBanner, screenCenter().cx, stageRect.y + 22, COL.pulse, revealAll);
      }

      var dockIn = easeOut(seg(t, 0.22, 0.40));
      setPayoff(payoffComplete, dockIn, 0, lerp(22, 0, dockIn), lerp(0.96, 1, dockIn));
      if (dockIn > 0.45) realMode = true;
    }

    if (stageBadge && stageBadgeText) {
      stageBadge.classList.toggle('is-real', realMode);
      stageBadgeText.textContent = realMode ? LABELS.real : LABELS.illustrative;
    }
  }

  /* ------------------------------------------------------------------------
     Scroll -> Continuous Film Time + Dynamic Story Card Choreography (Desktop)
     ------------------------------------------------------------------------ */
  var lastChapter = -1;
  var lastNavId = '';

  function updateNavHighlight(activeId) {
    if (activeId === lastNavId) return;
    lastNavId = activeId;
    navLinks.forEach(function (link) {
      link.classList.toggle('is-current', link.getAttribute('data-nav-target') === activeId);
    });
  }

  function computeTarget() {
    var vh = window.innerHeight || doc.documentElement.clientHeight;
    var mid = vh * (isMobile ? 0.52 : 0.48);
    var g = 0;

    steps.forEach(function (el, i) {
      var rect = el.getBoundingClientRect();
      var local = (mid - rect.top) / Math.max(1, rect.height);
      if (rect.top < mid) g = i + clamp(local, 0, 1);

      var card = cards[i];
      if (!card) return;
      var o;
      if (i === steps.length - 1) {
        var exitFade = rect.bottom < vh * 0.42 ? clamp((rect.bottom - vh * 0.10) / (vh * 0.32)) : 1;
        o = clamp((local + 0.05) / 0.09) * exitFade;
      } else {
        o = clamp(Math.min((local + 0.05) / 0.09, (0.96 - local) / 0.10));
      }
      card.style.opacity = o.toFixed(3);

      // Editorial card choreography on desktop: steps smoothly aside when cinema needs panoramic space!
      var tx = 0;
      var ty = o < 1 ? (local < 0.5 ? lerp(18, 0, o) : lerp(-14, 0, o)) : 0;
      var sc = 1;
      if (!isMobile) {
        if (i === 2) {
          // Act 02 Route Flight: glide smoothly lower-left & compact while flying across Paris,
          // then float gracefully back up as Plan a route docks on the right!
          var flightDuck = easeIO(seg(local, 0.08, 0.22)) * (1 - easeIO(seg(local, 0.60, 0.76)));
          tx = lerp(0, -14, flightDuck);
          ty += lerp(0, vh * 0.18, flightDuck);
          sc = lerp(1, 0.93, flightDuck);
        } else if (i === 3) {
          // Act 03 Agenda: lift gently to balance the time horizon and right-docked events
          ty += -vh * 0.025;
        } else if (i === 4) {
          // Act 04 Street Dive: dock compact upper-left with safe navbar margin on 800px+ viewports
          tx = -8;
          ty += -vh * 0.028;
          sc = 0.94;
        }
      }
      card.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(3) + ')';
      card.classList.toggle('is-active', o > 0.18);
    });

    var filmRect = film.getBoundingClientRect();
    var postFilm = filmRect.bottom <= vh * 0.72;

    if (siteHead) {
      siteHead.classList.toggle('is-solid', postFilm || window.pageYOffset > 40);
    }
    if (chapterHud) {
      chapterHud.classList.toggle('is-post-film', postFilm);
    }

    if (!postFilm) {
      updateNavHighlight('day-in-the-field');
    } else {
      var activeSec = 'architecture';
      postSections.forEach(function (sec) {
        if (sec.el.getBoundingClientRect().top <= vh * 0.38) activeSec = sec.id;
      });
      updateNavHighlight(activeSec);
    }

    if (progressBar) {
      var maxScroll = Math.max(1, doc.documentElement.scrollHeight - vh);
      progressBar.style.transform = 'scaleX(' + clamp(window.pageYOffset / maxScroll).toFixed(5) + ')';
    }

    return Math.min(g, steps.length - 0.0001);
  }

  /* Chapter Scrubber Click Navigation */
  railDots.forEach(function (dot, idx) {
    dot.addEventListener('click', function () {
      var targetStep = steps[idx];
      if (!targetStep) return;
      var rect = targetStep.getBoundingClientRect();
      var offset = idx === 0 ? 0 : Math.min(rect.height * 0.28, window.innerHeight * 0.35);
      window.scrollTo({
        top: Math.max(0, window.pageYOffset + rect.top + offset),
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    });
  });

  function updateChapterHud(act) {
    if (act === lastChapter) return;
    lastChapter = act;
    film.setAttribute('data-chapter', String(act));
    if (hudNum) hudNum.textContent = String(act).padStart(2, '0');
    if (hudName) hudName.textContent = CHAPTER_NAMES[act] || '';
    railDots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === act);
      dot.classList.toggle('is-passed', i < act);
      dot.setAttribute('aria-current', i === act ? 'step' : 'false');
    });
  }

  /* Main Animation Loop */
  var gs = computeTarget();
  var lastTime = performance.now();

  function frame(now) {
    var dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (reduceMotion.matches) {
      var gStatic = computeTarget();
      updateChapterHud(clamp(Math.floor(gStatic), 0, 5));
      return;
    }

    T += dt;
    var g = computeTarget();
    gs = gs + (g - gs) * Math.min(1, dt * 10.5);
    var act = clamp(Math.floor(gs), 0, 5);
    updateChapterHud(act);

    var fr = film.getBoundingClientRect();
    if (fr.bottom > -100 && fr.top < window.innerHeight + 100) {
      renderFilm(gs);
    }
    window.requestAnimationFrame(frame);
  }

  if (reduceMotion.matches) {
    window.addEventListener('scroll', function () {
      var gStatic = computeTarget();
      updateChapterHud(clamp(Math.floor(gStatic), 0, 5));
    }, { passive: true });
    updateChapterHud(clamp(Math.floor(computeTarget()), 0, 5));
  } else {
    renderFilm(gs);
    window.requestAnimationFrame(frame);
  }

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', function () {
      resize();
      if (!reduceMotion.matches) {
        lastTime = performance.now();
        window.requestAnimationFrame(frame);
      }
    });
  }
})();
