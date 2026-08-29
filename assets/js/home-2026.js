(function () {
  'use strict';

  var header = document.querySelector('[data-site-header]');
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-workflow-tab]'));
  var panel = document.getElementById('workflow-panel');
  var stageStep = document.querySelector('[data-stage-step]');
  var stageTitle = document.querySelector('[data-stage-title]');
  var stageCopy = document.querySelector('[data-stage-copy]');
  var stageImage = document.querySelector('[data-stage-image]');
  var stageVisual = document.querySelector('[data-stage-visual]');
  var expandButton = document.querySelector('[data-lightbox-src]');
  var lightbox = document.querySelector('[data-lightbox]');
  var lightboxImage = document.querySelector('[data-lightbox-image]');
  var lightboxClose = document.querySelector('[data-lightbox-close]');
  var trialForm = document.querySelector('[data-trial-form]');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastLightboxTrigger = null;

  var fullScreens = {
    '/assets/home/workflow-filter-detail.webp': '/assets/screenshots-2026/screen-02.jpg',
    '/assets/home/workflow-plan-detail.webp': '/assets/screenshots-2026/screen-04.jpg',
    '/assets/home/workflow-mobile.webp': '/assets/screenshots-2026/mobile-map.png',
    '/assets/home/workflow-report-detail.webp': '/assets/screenshots-2026/screen-07.jpg'
  };

  function track(name, properties) {
    if (typeof window.plausible !== 'function') return;
    var options = properties ? { props: properties } : undefined;
    window.plausible(name, options);
  }

  function closeNavigation() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(willOpen));
      siteNav.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('nav-open', willOpen);
    });

    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNavigation();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNavigation();
    });
  }

  function updateHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 16);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  function setActiveTab(nextTab, shouldFocus) {
    if (!nextTab || !stageImage) return;
    var nextSource = nextTab.dataset.src;
    var selectedIndex = tabs.indexOf(nextTab);

    tabs.forEach(function (tab, index) {
      var selected = tab === nextTab;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && shouldFocus) tab.focus();
      if (selected && panel) panel.setAttribute('aria-labelledby', tab.id);
    });

    stageImage.classList.add('is-changing');
    if (stageCopy && stageCopy.parentElement) stageCopy.parentElement.classList.add('is-changing');

    window.setTimeout(function () {
      stageStep.textContent = nextTab.dataset.step;
      stageTitle.textContent = nextTab.dataset.title;
      stageCopy.textContent = nextTab.dataset.copy;
      stageImage.src = nextSource;
      stageImage.alt = nextTab.dataset.alt;
      if (expandButton) expandButton.dataset.lightboxSrc = fullScreens[nextSource] || nextSource;

      stageImage.addEventListener('load', function onLoad() {
        stageImage.classList.remove('is-changing');
        if (stageCopy && stageCopy.parentElement) stageCopy.parentElement.classList.remove('is-changing');
        stageImage.removeEventListener('load', onLoad);
      });
    }, prefersReducedMotion ? 0 : 110);

    track('Workflow Step Viewed', {
      step: nextTab.dataset.step,
      position: String(selectedIndex + 1)
    });
  }

  tabs.forEach(function (tab, index) {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;
    tab.addEventListener('click', function () { setActiveTab(tab, false); });
    tab.addEventListener('keydown', function (event) {
      var nextIndex = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex !== null) {
        event.preventDefault();
        setActiveTab(tabs[nextIndex], true);
      }
    });

    if (tab.dataset.src && index > 0) {
      var preload = new Image();
      preload.src = tab.dataset.src;
    }
  });

  function openLightbox(source, alt, trigger) {
    if (!lightbox || !lightboxImage) return;
    lastLightboxTrigger = trigger || null;
    lightboxImage.src = source;
    lightboxImage.alt = alt || 'Tourvia product screenshot';
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    if (lightboxClose) lightboxClose.focus();
    track('Product Screenshot Expanded', { screen: source.split('/').pop() });
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.classList.remove('lightbox-open');
    if (lastLightboxTrigger) lastLightboxTrigger.focus();
  }

  if (expandButton) {
    expandButton.addEventListener('click', function () {
      openLightbox(expandButton.dataset.lightboxSrc, stageImage ? stageImage.alt : '', expandButton);
    });
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeNavigation();
      closeLightbox();
    }
  });

  document.querySelectorAll('a[href="#contact"]').forEach(function (link) {
    link.addEventListener('click', function () {
      var section = link.closest('section');
      track('Trial CTA Click', { location: section ? section.id || section.className.split(' ')[0] : 'header-or-footer' });
    });
  });

  document.querySelectorAll('a[href*="appexchange.salesforce.com"]').forEach(function (link) {
    link.addEventListener('click', function () {
      track('AppExchange Link Click', { location: 'homepage' });
    });
  });

  if (trialForm) {
    trialForm.addEventListener('submit', function () {
      track('Trial Form Submit', { location: 'homepage-contact' });
    });
  }

  if ('IntersectionObserver' in window) {
    var pricing = document.getElementById('pricing');
    if (pricing) {
      var pricingSeen = false;
      var pricingObserver = new IntersectionObserver(function (entries) {
        if (!pricingSeen && entries[0].isIntersecting) {
          pricingSeen = true;
          track('Pricing Section Viewed', { page: 'homepage' });
          pricingObserver.disconnect();
        }
      }, { threshold: 0.45 });
      pricingObserver.observe(pricing);
    }
  }
})();
