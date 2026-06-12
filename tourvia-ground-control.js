(() => {
  const nav = document.querySelector('.gc-nav');
  const menuButton = document.querySelector('.gc-menu-btn');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('menu-open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  const revealTargets = document.querySelectorAll('.pipeline article,.constraint-grid article,.use-grid article,.product-frame,.metric-console,.blueprint,.final-card');
  revealTargets.forEach((el) => el.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealTargets.forEach((el) => observer.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const target = Number(el.getAttribute('data-count')) || 0;
      const isPercent = raw.includes('%');
      const isTime = raw.includes('h');
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(target * eased);
        if (isTime) {
          const minutes = Math.round(90 * eased);
          const h = Math.floor(minutes / 60);
          const m = String(minutes % 60).padStart(2, '0');
          el.textContent = `−${h} h ${m}`;
        } else if (isPercent) {
          el.textContent = `−${value} %`;
        } else {
          el.textContent = String(value);
        }
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => counterObserver.observe(el));

  const heroMap = document.querySelector('.hero-map');
  const coords = document.querySelector('.map-coordinates');
  if (heroMap && coords && matchMedia('(pointer:fine)').matches) {
    heroMap.addEventListener('mousemove', (event) => {
      const rect = heroMap.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18 + 2.3522;
      const y = (0.5 - (event.clientY - rect.top) / rect.height) * 0.12 + 48.8566;
      coords.textContent = `${y.toFixed(4)} N · ${x.toFixed(4)} E · live cursor`;
    });
    heroMap.addEventListener('mouseleave', () => {
      coords.textContent = '48.8566 N · 2.3522 E · Paris sector';
    });
  }
})();
