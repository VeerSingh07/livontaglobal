/* =============================================
   Livonta Global — Healthcare Medical Tourism
   Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. STICKY HEADER SHADOW
  ========================================== */
  const header = document.getElementById('site-header');
  const backToTop = document.getElementById('back-to-top');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 24);

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

    if (backToTop) {
      backToTop.classList.toggle('show', scrollPercent >= 80);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ==========================================
     2. RIGHT-SIDE DRAWER NAVIGATION
  ========================================== */
  const menuBtn       = document.getElementById('menu-btn');
  const drawer        = document.getElementById('nav-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerClose   = document.getElementById('drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    menuBtn.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  drawerClose.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  // Close on any drawer link click
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
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

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countStarted) {
        countStarted = true;
        runCounters();
        counterObserver.disconnect();
      }
    }, { threshold: 0.3 });
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
     7. CONSULTATION FORM VALIDATION
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
     8. BACK TO TOP BUTTON
  ========================================== */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    });
  }


  /* ==========================================
     9. FOOTER YEAR
  ========================================== */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ==========================================
     10. LAZY LOAD IMAGES (data-src)
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
