/* =============================================
   MediGlobal — Healthcare Medical Tourism
   Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. STICKY HEADER SHADOW
  ========================================== */
  const header = document.getElementById('site-header');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);
    backToTop.classList.toggle('show', window.scrollY > 420);
  };
  window.addEventListener('scroll', onScroll, { passive: true });


  /* ==========================================
     2. MOBILE MENU TOGGLE
  ========================================== */
  const menuBtn   = document.getElementById('menu-btn');
  const mobileNav = document.getElementById('mobile-menu');
  const iconOpen  = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    iconOpen.classList.toggle('hidden', isOpen);
    iconClose.classList.toggle('hidden', !isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on any nav link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });


  /* ==========================================
     3. SMOOTH SCROLL (offset for sticky header)
  ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 16;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });


  /* ==========================================
     4. SCROLL FADE-UP ANIMATION
  ========================================== */
  const fadeEls = document.querySelectorAll('.fade-up');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));


  /* ==========================================
     5. HERO COUNTER ANIMATION
  ========================================== */
  const counters   = document.querySelectorAll('[data-count]');
  let countStarted = false;

  function runCounters() {
    counters.forEach(el => {
      const target   = parseInt(el.dataset.count, 10);
      const duration = 1800;
      const start    = performance.now();

      const tick = (now) => {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target.toLocaleString();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  const statsSection = document.getElementById('hero-stats');
  if (statsSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countStarted) {
        countStarted = true;
        runCounters();
        counterObserver.disconnect();
      }
    }, { threshold: 0.5 });
    counterObserver.observe(statsSection);
  }


  /* ==========================================
     6. FAQ ACCORDION (one open at a time)
  ========================================== */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn  = item.querySelector('.faq-trigger');
    const body = item.querySelector('.faq-body');

    btn.addEventListener('click', () => {
      const alreadyOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-body').classList.remove('open');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!alreadyOpen) {
        item.classList.add('open');
        body.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ==========================================
     7. TESTIMONIAL CAROUSEL
  ========================================== */
  const track     = document.getElementById('t-track');
  const slides    = Array.from(document.querySelectorAll('.t-slide'));
  const dotsWrap  = document.getElementById('t-dots');
  const prevBtn   = document.getElementById('t-prev');
  const nextBtn   = document.getElementById('t-next');

  let currentGroup  = 0;
  let autoTimer     = null;
  let perView       = 1;
  let totalGroups   = 1;
  let slideW        = 0;

  const GAP = 24;

  function calcPerView() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640)  return 2;
    return 1;
  }

  function initCarousel() {
    perView     = calcPerView();
    totalGroups = Math.ceil(slides.length / perView);
    const cw    = track.parentElement.offsetWidth;
    slideW      = (cw - GAP * (perView - 1)) / perView;

    slides.forEach(s => {
      s.style.width      = slideW + 'px';
      s.style.flexShrink = '0';
    });

    buildDots();
    goTo(0, false);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalGroups; i++) {
      const d = document.createElement('button');
      d.setAttribute('aria-label', `Slide group ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(d);
    }
    updateDots();
  }

  function updateDots() {
    dotsWrap.querySelectorAll('button').forEach((d, i) => {
      if (i === currentGroup) {
        d.className = 'h-2.5 w-6 rounded-full bg-blue-600 transition-all duration-300';
      } else {
        d.className = 'h-2.5 w-2.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-all duration-300';
      }
    });
  }

  function goTo(idx, animate = true) {
    currentGroup = Math.max(0, Math.min(idx, totalGroups - 1));
    const offset = currentGroup * perView * (slideW + GAP);
    track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none';
    track.style.transform  = `translateX(-${offset}px)`;
    updateDots();
  }

  function next() { goTo(currentGroup < totalGroups - 1 ? currentGroup + 1 : 0); }
  function prev() { goTo(currentGroup > 0 ? currentGroup - 1 : totalGroups - 1); }

  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  initCarousel();
  startAuto();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initCarousel, 200);
  });


  /* ==========================================
     8. CONSULTATION FORM VALIDATION
  ========================================== */
  const form       = document.getElementById('consult-form');
  const formWrap   = document.getElementById('form-wrap');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.form-field').forEach(f => f.classList.remove('err'));
      form.querySelectorAll('.field-error').forEach(f => f.classList.remove('show'));

      // Validate required fields
      form.querySelectorAll('[data-required]').forEach(field => {
        const val = field.value.trim();
        const err = field.closest('.field-group')?.querySelector('.field-error');

        if (!val) {
          field.classList.add('err');
          if (err) err.classList.add('show');
          valid = false;
          return;
        }

        if (field.type === 'email') {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          if (!ok) {
            field.classList.add('err');
            if (err) { err.textContent = 'Enter a valid email address.'; err.classList.add('show'); }
            valid = false;
          }
        }

        if (field.type === 'tel') {
          const digits = val.replace(/\D/g, '');
          if (digits.length < 7) {
            field.classList.add('err');
            if (err) { err.textContent = 'Enter a valid phone number.'; err.classList.add('show'); }
            valid = false;
          }
        }
      });

      if (valid) {
        formWrap.style.display  = 'none';
        successMsg.classList.add('show');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Live clear on input
    form.querySelectorAll('.form-field').forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          field.classList.remove('err');
          const err = field.closest('.field-group')?.querySelector('.field-error');
          if (err) err.classList.remove('show');
        }
      });
    });
  }


  /* ==========================================
     9. BACK TO TOP BUTTON
  ========================================== */
  const backToTop = document.getElementById('back-to-top');

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ==========================================
     10. FOOTER YEAR
  ========================================== */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ==========================================
     11. LAZY LOAD IMAGES (data-src)
  ========================================== */
  if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[data-src]');

    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    lazyImgs.forEach(img => imgObserver.observe(img));
  } else {
    // Fallback — load all images
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  }

});
