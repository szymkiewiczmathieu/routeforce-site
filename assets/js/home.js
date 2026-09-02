/* Tourvia homepage, "The Field Sheet": progressive enhancement only.
   Everything on the page reads and works without this file. */
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
    if (!rail || !stops.length) { return; }
    var reduced = reduceMotion.matches;
    var pen = window.pageYOffset + window.innerHeight * 0.72 - mainTop;
    var ratio = reduced ? 1 : Math.min(1, Math.max(0, (pen - railTop) / railHeight));
    rail.style.setProperty('--rail-drawn', (ratio * 100).toFixed(2) + '%');
    var drawnTo = railTop + ratio * railHeight;
    stops.forEach(function (stop, index) {
      stop.classList.toggle('is-passed', reduced || stopOffsets[index] <= drawnTo + 1);
    });
  }

  function measureRail() {
    if (!main || !rail || !stops.length) { return; }
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
    rail.style.top = Math.round(first) + 'px';
    rail.style.bottom = Math.round(Math.max(0, mainRect.height - last)) + 'px';
    drawRail();
  }

  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    window.requestAnimationFrame(function () {
      drawRail();
      ticking = false;
    });
  }

  if (rail && stops.length) {
    measureRail();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureRail, 120);
    });
    window.addEventListener('load', measureRail);
    if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(measureRail); }
    window.setTimeout(measureRail, 1200);
    if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', drawRail); }
  }

  /* ---------------------------------------------------------------
     Plates strip: buttons scroll the native, keyboard-reachable strip
     --------------------------------------------------------------- */
  var strip = doc.querySelector('.strip');
  Array.prototype.forEach.call(doc.querySelectorAll('.strip-btn'), function (button) {
    button.addEventListener('click', function () {
      if (!strip) { return; }
      var direction = parseInt(button.getAttribute('data-strip'), 10) || 1;
      strip.scrollBy({
        left: direction * Math.round(strip.clientWidth * 0.8),
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    });
  });

  /* ---------------------------------------------------------------
     Lightbox for plates
     --------------------------------------------------------------- */
  var lightbox = doc.getElementById('lightbox');
  var lightboxImg = doc.getElementById('lightbox-img');
  var lightboxClose = doc.getElementById('lightbox-close');
  var blankImage = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  var lastTrigger = null;

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
})();
