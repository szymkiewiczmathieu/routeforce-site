/* Tourvia site system, "The Field Sheet": progressive enhancement only.
   Every page reads and works without this file. Shared with the homepage
   behaviours (menu, route line, lightbox, reveal) and adds the contents
   spy and reading progress used by long documents. */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------- */
  var menuBtn = doc.getElementById('mobile-menu-btn');
  var menu = doc.getElementById('mobile-menu');

  function setMenu(open) {
    if (!menu || !menuBtn) { return; }
    menu.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---------------------------------------------------------------
     The route line: drawn as the reader scrolls, stops fill when
     the pen passes them. Fully drawn when motion is reduced.
     --------------------------------------------------------------- */
  var main = doc.getElementById('main');
  var rail = doc.querySelector('.sheet-rail');
  var stops = Array.prototype.slice.call(doc.querySelectorAll('.stop'));
  var lastStop = doc.querySelector('.stop-last');
  var mainTop = 0;
  var railTop = 0;
  var railHeight = 1;
  var stopOffsets = [];
  var ticking = false;
  var resizeTimer = null;

  function drawRail() {
    if (!stops.length) { return; }
    var reduced = reduceMotion.matches;
    var pen = window.pageYOffset + window.innerHeight * 0.72 - mainTop;
    var ratio = reduced ? 1 : Math.min(1, Math.max(0, (pen - railTop) / railHeight));
    if (rail) { rail.style.setProperty('--rail-drawn', (ratio * 100).toFixed(2) + '%'); }
    var drawnTo = railTop + ratio * railHeight;
    stops.forEach(function (stop, index) {
      stop.classList.toggle('is-passed', reduced || stopOffsets[index] <= drawnTo + 1);
    });
  }

  function measureRail() {
    if (!main || !stops.length) { return; }
    var mainRect = main.getBoundingClientRect();
    mainTop = mainRect.top + window.pageYOffset;
    stopOffsets = stops.map(function (stop) {
      var rect = stop.getBoundingClientRect();
      return rect.top + window.pageYOffset - mainTop + rect.height / 2;
    });
    var first = Math.min.apply(null, stopOffsets);
    var last = lastStop ? stopOffsets[stops.indexOf(lastStop)] : Math.max.apply(null, stopOffsets);
    railTop = first;
    railHeight = Math.max(1, last - first);
    if (rail) {
      rail.style.top = Math.round(first) + 'px';
      rail.style.bottom = Math.round(Math.max(0, mainRect.height - last)) + 'px';
    }
    drawRail();
  }

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () {
      drawRail();
      updateProgress();
      spy();
      ticking = false;
    });
  }

  /* ---------------------------------------------------------------
     Reading progress on long documents (guides, legal, articles)
     --------------------------------------------------------------- */
  var progress = doc.querySelector('.progress');

  function updateProgress() {
    if (!progress) { return; }
    var total = doc.documentElement.scrollHeight - window.innerHeight;
    var ratio = total > 0 ? Math.min(1, Math.max(0, window.pageYOffset / total)) : 0;
    progress.style.setProperty('--progress', (ratio * 100).toFixed(1) + '%');
  }

  /* ---------------------------------------------------------------
     Contents spy: the current section is marked in the contents list
     --------------------------------------------------------------- */
  var tocLinks = Array.prototype.slice.call(doc.querySelectorAll('.guide-toc a[href^="#"], .doc-nav a[href^="#"], .longform > .on-page a[href^="#"]'));
  var tocTargets = [];
  var activeLink = null;

  function collectTargets() {
    tocTargets = [];
    tocLinks.forEach(function (link) {
      var id = decodeURIComponent(link.getAttribute('href').slice(1));
      var target = id ? doc.getElementById(id) : null;
      if (target) { tocTargets.push({ link: link, target: target }); }
    });
  }

  function spy() {
    if (!tocTargets.length) { return; }
    var line = window.pageYOffset + Math.max(96, window.innerHeight * 0.28);
    var current = null;
    tocTargets.forEach(function (item) {
      var top = item.target.getBoundingClientRect().top + window.pageYOffset;
      if (top <= line) { current = item.link; }
    });
    if (!current) { current = tocTargets[0].link; }
    if (current !== activeLink) {
      if (activeLink) {
        activeLink.classList.remove('is-active');
        activeLink.removeAttribute('aria-current');
      }
      current.classList.add('is-active');
      current.setAttribute('aria-current', 'location');
      activeLink = current;
    }
  }

  /* Collapse the contents list on narrow screens; it stays open without JS. */
  var tocDetails = doc.querySelector('.guide-toc details');
  if (tocDetails && window.matchMedia('(max-width: 1023px)').matches) {
    tocDetails.removeAttribute('open');
  }

  if (tocLinks.length) { collectTargets(); }

  if (stops.length || progress || tocTargets.length) {
    measureRail();
    updateProgress();
    spy();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () { measureRail(); updateProgress(); }, 120);
    });
    window.addEventListener('load', measureRail);
    if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(measureRail); }
    window.setTimeout(measureRail, 1200);
    if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', drawRail); }
  }

  /* ---------------------------------------------------------------
     Lightbox for plates
     --------------------------------------------------------------- */
  var lightbox = doc.getElementById('lightbox');
  var lightboxImg = doc.getElementById('lightbox-img');
  var lightboxClose = doc.getElementById('lightbox-close');
  var blankImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  var lastTrigger = null;

  function trapLightboxFocus(event) {
    if (!lightbox || !lightbox.classList.contains('active') || event.key !== 'Tab') { return; }
    var focusable = Array.prototype.slice.call(lightbox.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) { return; }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && (doc.activeElement === first || !lightbox.contains(doc.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (doc.activeElement === last || !lightbox.contains(doc.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  }

  function openLightbox(src, alt, trigger) {
    if (!lightbox || !lightboxImg) { return; }
    lightboxImg.src = src;
    lightboxImg.alt = alt || 'Full-size screenshot';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    doc.body.classList.add('lightbox-open');
    lastTrigger = trigger || null;
    if (lightboxClose) { lightboxClose.focus(); }
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('active')) { return; }
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    doc.body.classList.remove('lightbox-open');
    lightboxImg.src = blankImage;
    if (lastTrigger && typeof lastTrigger.focus === 'function') { lastTrigger.focus(); }
    lastTrigger = null;
  }

  Array.prototype.forEach.call(doc.querySelectorAll('.js-open-lightbox-direct'), function (button) {
    button.addEventListener('click', function () {
      openLightbox(button.getAttribute('data-lightbox-src'), button.getAttribute('data-lightbox-alt'), button);
    });
  });
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) { closeLightbox(); }
    });
  }
  if (lightboxClose) { lightboxClose.addEventListener('click', closeLightbox); }
  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { closeLightbox(); }
    else { trapLightboxFocus(event); }
  });

  /* ---------------------------------------------------------------
     Figures fade in once. Reduced motion: shown immediately.
     --------------------------------------------------------------- */
  var reveals = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------------
     One demo at a time: starting a video pauses the others
     --------------------------------------------------------------- */
  var videos = Array.prototype.slice.call(doc.querySelectorAll('video'));
  videos.forEach(function (video) {
    video.addEventListener('play', function () {
      videos.forEach(function (other) {
        if (other !== video && !other.paused) { other.pause(); }
      });
    });
  });

  /* ---------------------------------------------------------------
     Demo plates at rest: the poster and a paper play cue.
     A browser draws its control bar as a dark band across the poster;
     here the native controls only appear once the reader starts the
     video, and the plate returns to its poster when the video ends.
     Without this script the videos keep their native controls.
     --------------------------------------------------------------- */
  var playWord = doc.documentElement.lang === 'fr' ? 'Lire' : 'Play';
  var playSeparator = doc.documentElement.lang === 'fr' ? ' : ' : ': ';

  videos.forEach(function (video) {
    var plate = video.parentElement;
    if (!video.hasAttribute('controls') || !plate || !plate.classList.contains('plate')) { return; }

    var cue = doc.createElement('button');
    var title = video.getAttribute('aria-label');
    cue.type = 'button';
    cue.className = 'video-cue';
    cue.setAttribute('aria-label', title ? playWord + playSeparator + title : playWord);
    cue.innerHTML = '<span class="video-cue-disc" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M8.6 5.4v13.2L19.4 12z"/></svg></span>';
    plate.appendChild(cue);
    video.removeAttribute('controls');

    cue.addEventListener('click', function () {
      cue.hidden = true;
      video.setAttribute('controls', '');
      /* the cue had the focus: hand it to the video, in every browser, so the keyboard keeps its place */
      video.setAttribute('tabindex', '0');
      var started = video.play();
      if (started && typeof started.catch === 'function') { started.catch(function () {}); }
      video.focus();
    });

    video.addEventListener('ended', function () {
      /* in full screen the reader still needs the controls to leave it */
      if (doc.fullscreenElement || doc.webkitFullscreenElement || video.webkitDisplayingFullscreen) { return; }
      var hadFocus = doc.activeElement === video;
      /* the poster and the video do not share one ratio: keep the box the video gave the plate,
         so nothing below it moves when the poster comes back (the poster then fills that box) */
      if (video.videoWidth && video.videoHeight) {
        video.style.aspectRatio = video.videoWidth + ' / ' + video.videoHeight;
        video.style.objectFit = 'cover';
      }
      video.removeAttribute('controls');
      video.removeAttribute('tabindex');
      video.load();
      cue.hidden = false;
      if (hadFocus) { cue.focus(); }
    });
  });

  /* ---------------------------------------------------------------
     Wide tables: mark the edges that still hide content (the CSS
     draws a soft shadow there) and make an overflowing table
     reachable and scrollable from the keyboard.
     --------------------------------------------------------------- */
  var tableBoxes = Array.prototype.slice.call(doc.querySelectorAll('.tbl'));
  var french = doc.documentElement.lang === 'fr';

  /* Name a scrolling table after its caption, else after the heading it sits under. */
  function tableLabel(box) {
    var caption = box.querySelector('caption');
    if (caption && caption.textContent.trim()) { return caption.textContent.trim(); }
    var node = box;
    while (node && node !== main && node !== doc.body) {
      var previous = node.previousElementSibling;
      while (previous) {
        if (/^H[2-4]$/.test(previous.tagName) && previous.textContent.trim()) {
          return (french ? 'Tableau : ' : 'Table: ') + previous.textContent.trim().replace(/\s+/g, ' ');
        }
        previous = previous.previousElementSibling;
      }
      node = node.parentElement;
    }
    return french ? 'Tableau à faire défiler' : 'Scrollable table';
  }

  function markTable(box) {
    var max = box.scrollWidth - box.clientWidth;
    var more = [];
    if (max > 1) {
      if (box.scrollLeft > 1) { more.push('left'); }
      if (box.scrollLeft < max - 1) { more.push('right'); }
    }
    if (more.length) {
      box.setAttribute('data-more', more.join(' '));
    } else {
      box.removeAttribute('data-more');
    }
    if (max > 1 && !box.hasAttribute('tabindex')) {
      var labelled = box.hasAttribute('aria-label') || box.hasAttribute('aria-labelledby');
      box.setAttribute('tabindex', '0');
      box.setAttribute('role', 'region');
      if (!labelled) { box.setAttribute('aria-label', tableLabel(box)); }
      box.setAttribute('data-auto-region', labelled ? 'kept-label' : 'own-label');
    } else if (max <= 1 && box.hasAttribute('data-auto-region')) {
      if (box.getAttribute('data-auto-region') === 'own-label') { box.removeAttribute('aria-label'); }
      box.removeAttribute('tabindex');
      box.removeAttribute('role');
      box.removeAttribute('data-auto-region');
    }
  }

  if (tableBoxes.length) {
    var markTables = function () { tableBoxes.forEach(markTable); };
    tableBoxes.forEach(function (box) {
      box.addEventListener('scroll', function () { markTable(box); }, { passive: true });
    });
    markTables();
    window.addEventListener('resize', function () {
      window.clearTimeout(markTables.timer);
      markTables.timer = window.setTimeout(markTables, 120);
    });
    window.addEventListener('load', markTables);
    if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(markTables); }
  }

  /* ---------------------------------------------------------------
     Analytics hooks (Plausible), unchanged from the previous site:
     AppExchange clicks and trial-form submissions.
     --------------------------------------------------------------- */
  window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };

  Array.prototype.forEach.call(doc.querySelectorAll('a[href*="appexchange.salesforce.com/appxListingDetail"]'), function (link) {
    link.addEventListener('click', function () {
      window.plausible('AppExchange Click', {
        props: {
          page_path: window.location.pathname,
          link_text: (link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
        }
      });
    });
  });

  var contactForm = doc.querySelector('form[action*="formspree.io"]');
  if (contactForm) {
    contactForm.addEventListener('submit', function () {
      window.plausible('Lead Form Submit', {
        props: { page_path: window.location.pathname, form: 'site_contact' }
      });
    });
  }
})();
