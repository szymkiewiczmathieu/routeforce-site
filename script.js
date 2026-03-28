// ============================================
// RouteForce — Site Web
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Language suggestion / first-visit redirect ---
    const path = window.location.pathname;
    const isRoot = path === '/' || path.endsWith('/index.html');
    const isEn = path.startsWith('/en/');
    const isEs = path.startsWith('/es/');
    const langKey = 'routeforce_lang_pref';

    document.querySelectorAll('.lang-switch').forEach(link => {
        link.addEventListener('click', () => {
            try {
                const href = link.getAttribute('href') || '';
                if (href.includes('/en/') || href === 'en/index.html' || href === '../en/index.html') localStorage.setItem(langKey, 'en');
                else if (href.includes('/es/') || href === 'es/index.html' || href === '../es/index.html') localStorage.setItem(langKey, 'es');
                else localStorage.setItem(langKey, 'fr');
            } catch (_) {}
        });
    });

    try {
        const saved = localStorage.getItem(langKey);
        const browserLang = (navigator.language || '').toLowerCase();
        const browserPref = browserLang.startsWith('es') ? 'es' : browserLang.startsWith('en') ? 'en' : 'fr';
        const desired = saved || browserPref;

        if (isRoot && desired === 'en' && !sessionStorage.getItem('routeforce_lang_redirect_done')) {
            sessionStorage.setItem('routeforce_lang_redirect_done', '1');
            window.location.replace('/en/');
            return;
        }
        if (isRoot && desired === 'es' && !sessionStorage.getItem('routeforce_lang_redirect_done')) {
            sessionStorage.setItem('routeforce_lang_redirect_done', '1');
            window.location.replace('/es/');
            return;
        }
        if ((isEn || isEs) && !saved) {
            localStorage.setItem(langKey, isEn ? 'en' : 'es');
        }
    } catch (_) {}

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // --- Mobile menu ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('open');
        });
    });

    // --- Scroll animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .pricing-card, .process-step, .problem-card, .solution-card, .screenshot-card').forEach(el => {
        observer.observe(el);
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- Lightbox for screenshots ---
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img src="" alt="">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');

    document.querySelectorAll('.screenshot-img img, .hero-screenshot img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // --- FAQ accordion ---
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.classList.contains('open');
            // Close all others
            document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
            btn.setAttribute('aria-expanded', !isOpen);
        });
    });

    // --- Contact form handling ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // If Formspree is configured, submit normally
        const action = contactForm.getAttribute('action');
        if (action && !action.includes('YOUR_FORM_ID')) {
            contactForm.submit();
            return;
        }

        // Demo mode: show confirmation
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Demande envoyée !';
        btn.style.background = '#059669';
        btn.style.borderColor = '#059669';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);
    });
});
