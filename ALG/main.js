/* ═══════════════════════════════════════════
   ALG OTOMATİK KAPI SİSTEMLERİ — main.js
   Redesigned: Clean · Modular · Performant
═══════════════════════════════════════════ */

window.addEventListener('load', () => {

  /* ── PRELOADER LOGIC (En başa alındı) ── */
  const preloader = document.getElementById('preloader');
  const preloaderLogo = document.getElementById('preloaderLogo');
  const preloaderBar = document.getElementById('preloaderBar');
  const mainContent = document.getElementById('main-content');
  
  // Animasyonları başlat (Logo fade-in/scale ve Bar progress)
  setTimeout(() => {
    if (preloaderLogo) preloaderLogo.classList.add('animate');
    if (preloaderBar) preloaderBar.classList.add('animate');
  }, 100);

  const closePreloader = () => {
    if (preloader && !preloader.classList.contains('fade-out')) {
      preloader.classList.add('fade-out');
      document.body.classList.remove('preloader-active');
      if (mainContent) {
        mainContent.style.visibility = 'visible';
        mainContent.style.opacity = '1';
      }
      // Remove preloader from DOM after its fade-out transition
      preloader.addEventListener('transitionend', () => {
        preloader.remove();
      }, { once: true });
    }
  };
  // Trigger closePreloader after 2 seconds (logo and bar animations are 1s and 2s respectively)
  setTimeout(closePreloader, 2000);

  /* ── MULTI-LANGUAGE ── */
  const setLanguage = (lang) => {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations?.[lang]?.[key]) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(5px)';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
          el.innerHTML = translations[lang][key];
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 150);
      }
    });
    
    document.querySelectorAll('.lang-toggle').forEach(toggle => {
      const slider = toggle.querySelector('.lang-toggle-slider');
      const isEn = lang === 'en';
      if (slider) slider.style.transform = isEn ? 'translateX(40px)' : 'translateX(0)';
      toggle.querySelectorAll('.lang-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
      });
    });
  };
  window.changeLang = (lang) => setLanguage(lang);
  setLanguage(localStorage.getItem('preferredLang') || 'tr');

  /* ── NAVBAR ── */
  const navbar = document.getElementById('navbar');
  let scrollTimeout;
  const onScroll = () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(() => {
      navbar?.classList.toggle('scrolled', window.scrollY > 60);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── HERO BACKGROUND PARALLAX HINT ── */
  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(() => hero.classList.add('loaded'), 100);
  }

  /* ── HAMBURGER / MOBILE MENU ── */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu   = document.getElementById('mobileMenu');
  const mobileClose  = document.getElementById('mobileClose');

  function openMobileMenu() {
    mobileMenu?.classList.add('open');
    hamburgerBtn?.classList.add('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeMobileMenu() {
    mobileMenu?.classList.remove('open');
    hamburgerBtn?.classList.remove('active');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.contains('open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });
  mobileClose?.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });
  // Close on backdrop tap
  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  /* ── FLOATING CTA ── */
  const floatCta = document.getElementById('floatCta');
  // Show float CTA after scrolling 400px (mobile only, CSS handles display:none on desktop)
  let lastScrollY = 0;
  const handleFloatCta = () => {
    if (!floatCta) return;
    // Hide when at contact section
    const contactSection = document.getElementById('iletisim');
    if (contactSection) {
      const rect = contactSection.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.6) {
        floatCta.style.transform = 'translateY(100%)';
        return;
      }
    }
    floatCta.style.transform = window.scrollY > 200 ? 'translateY(0)' : 'translateY(100%)';
  };
  if (floatCta) {
    floatCta.style.transform = 'translateY(100%)';
    floatCta.style.transition = 'transform 0.3s ease';
    window.addEventListener('scroll', handleFloatCta, { passive: true });
    handleFloatCta();
  }

  /* ── SCROLL REVEAL ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── PROJECT SLIDER ── */
  const track    = document.getElementById('projectsTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');
  const GAP = 20;
  let currentSlide = 0;
  let autoTimer = null;
  let isTransitioning = false;

  // SONSUZ DÖNGÜ İÇİN KLONLAMA (Programatik)
  if (track) {
    const originalCards = Array.from(track.querySelectorAll('.project-card'));
    originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  function getCards() { return track ? Array.from(track.querySelectorAll('.project-card')) : []; }
  function getOriginalCount() { return getCards().length / 2; }

  function getVisible() {
    const w = window.innerWidth;
    return w > 1024 ? 3 : w > 640 ? 2 : 1;
  }

  function goTo(idx) {
    if (isTransitioning) return;
    const cards = getCards();
    const originalCount = getOriginalCount();
    if (!cards.length || originalCount === 0) return;

    currentSlide = idx;
    track.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Proje fotoğraf geçiş hızı artırıldı
    
    const cardW = cards[0].offsetWidth + GAP;
    track.style.transform = `translateX(-${currentSlide * cardW}px)`;

    // Eğer klonlanmış ilk karta (ikinci setin başı) geldiysek
    if (currentSlide >= originalCount) {
      isTransitioning = true;
      setTimeout(() => {
        track.style.transition = 'none';
        currentSlide = 0;
        track.style.transform = `translateX(0)`;
        isTransitioning = false;
        updateDots();
      }, 300); // Geçiş süresiyle senkronize edildi
    } else {
      updateDots();
    }
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const count = getOriginalCount();
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { goTo(i); restartAuto(); });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(currentSlide + 1), 4000);
  }

  prevBtn?.addEventListener('click', () => { goTo(currentSlide - 1); restartAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(currentSlide + 1); restartAuto(); });

  // Touch / Swipe
  let touchStartX = null;
  track?.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track?.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(currentSlide + (diff > 0 ? 1 : -1)); restartAuto(); }
    touchStartX = null;
  });

  if (getCards().length) { buildDots(); restartAuto(); }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(currentSlide); }, 200);
  });

  /* ── LIGHTBOX ── */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbMeta    = document.getElementById('lbMeta');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  let lbImages = [], lbCurrent = 0;

  function buildLbImages() {
    lbImages = [];
    document.querySelectorAll('.project-card, .gallery-card').forEach(card => {
      const img   = card.querySelector('.project-img, .gallery-img');
      const label = card.querySelector('.project-label')?.textContent || '';
      const name  = card.querySelector('.project-name')?.textContent  || '';
      if (img) lbImages.push({ src: img.src, label, name });
    });
  }

  function showLbSlide(idx) {
    lbCurrent = (idx + lbImages.length) % lbImages.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = lbImages[lbCurrent].src;
      lbImg.alt = lbImages[lbCurrent].name;
      if (lbMeta)    lbMeta.textContent    = [lbImages[lbCurrent].label, lbImages[lbCurrent].name].filter(Boolean).join(' — ');
      if (lbCounter) lbCounter.textContent = `${lbCurrent + 1} / ${lbImages.length}`;
      lbImg.style.opacity = '1';
    }, 150);
    lbImg.style.transition = 'opacity 0.2s ease';
  }

  function openLightbox(index) {
    buildLbImages();
    showLbSlide(index);
    lightbox?.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeLightbox() {
    lightbox?.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  document.querySelectorAll('.project-card, .gallery-card').forEach((card, idx) => {
    card.addEventListener('click', () => openLightbox(idx));
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => showLbSlide(lbCurrent - 1));
  lbNext?.addEventListener('click', () => showLbSlide(lbCurrent + 1));
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Touch swipe for lightbox
  let lbTouchX = null;
  lbImg?.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lbImg?.addEventListener('touchend', e => {
    if (lbTouchX === null) return;
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) showLbSlide(lbCurrent + (diff > 0 ? 1 : -1));
    lbTouchX = null;
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (lightbox?.classList.contains('open')) {
      if (e.key === 'ArrowLeft')  showLbSlide(lbCurrent - 1);
      if (e.key === 'ArrowRight') showLbSlide(lbCurrent + 1);
      if (e.key === 'Escape')     closeLightbox();
    } else {
      if (e.key === 'ArrowLeft')  goTo(currentSlide - 1);
      if (e.key === 'ArrowRight') goTo(currentSlide + 1);
    }
  });

  /* ── WHATSAPP CLICK ANIMATION ── */
  document.querySelectorAll('.whatsapp-float').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('clicked');
      // Animasyon bittikten sonra sınıfı kaldır ki tekrar tıklanabilsin
      setTimeout(() => btn.classList.remove('clicked'), 400);
    });
  });

  /* ── CONTACT FORM ── */
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (form && submitBtn) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitBtn.innerHTML = '✓ Gönderildi!';
      submitBtn.style.background = '#16a34a';
      submitBtn.style.boxShadow = '0 4px 24px rgba(22,163,74,0.45)';
      submitBtn.disabled = true;
      setTimeout(() => {
        submitBtn.innerHTML = '<span data-i18n="form_submit">Mesaj Gönder</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
        submitBtn.style.background = '';
        submitBtn.style.boxShadow = '';
        submitBtn.disabled = false;
        form.reset();
        // Re-apply i18n on the button label
        const lang = localStorage.getItem('preferredLang') || 'tr';
        setLanguage(lang);
      }, 3500);
    });
  }

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      const target = href === '#' ? null : document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMobileMenu();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 74;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── COUNTER ANIMATION (hero stats) ── */
  function animateCounter(el, target, suffix = '') {
    let start = 0;
    const duration = 1400;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.hero-stat-num').forEach(numEl => {
          const text = numEl.textContent.trim();
          const hasPlus = text.includes('+');
          const val = parseInt(text.replace(/\D/g, ''));
          const span = numEl.querySelector('span');
          numEl.textContent = '';
          if (span) numEl.appendChild(span);
          animateCounter(numEl, val, hasPlus ? '+' : '');
          if (span) numEl.appendChild(span);
        });
        statsObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObs.observe(statsSection);

  /* ── REFERENCES SLIDER (OK TUŞLARI MANTIĞI) ── */
  const refsTrack    = document.getElementById('refsTrack');
  const refsPrevBtn  = document.getElementById('refsPrevBtn');
  const refsNextBtn  = document.getElementById('refsNextBtn');
  const REF_LOGO_WIDTH = 250; // Her logonun genişliği
  let currentRefPos  = 0;
  let refsResumeTimeout = null;
  const TOTAL_LOGOS = 20;
  const MAX_SHIFT = TOTAL_LOGOS * REF_LOGO_WIDTH; // 5000px
  const ANIM_DURATION = 35; // Referans logo hızı 35 saniyeye ayarlandı

  function moveRefs(direction) {
    if (!refsTrack) return;
    
    clearTimeout(refsResumeTimeout);

    // 1. MEVCUT KONUMU YAKALA: Animasyonun o anki piksel değerini al
    if (refsTrack.style.animation !== 'none') {
      const style = window.getComputedStyle(refsTrack);
      const matrix = new DOMMatrixReadOnly(style.transform);
      currentRefPos = Math.abs(matrix.m41) % MAX_SHIFT;
    }

    // 2. ANIMASYONU DURDUR
    refsTrack.style.animation = 'none';
    refsTrack.style.transition = 'transform 0.4s ease-out';

    // 3. YENİ KONUMU HESAPLA
    if (direction === 'next') {
      currentRefPos = Math.ceil((currentRefPos + 1) / REF_LOGO_WIDTH) * REF_LOGO_WIDTH;
      if (currentRefPos >= MAX_SHIFT) currentRefPos = 0;
    } else {
      currentRefPos = Math.floor((currentRefPos - 1) / REF_LOGO_WIDTH) * REF_LOGO_WIDTH;
      if (currentRefPos < 0) currentRefPos = MAX_SHIFT - REF_LOGO_WIDTH;
    }
    
    refsTrack.style.transform = `translateX(-${currentRefPos}px)`;

    // 4. 2 SANIYE SONRA KALDIĞI YERDEN DEVAM ET
    refsResumeTimeout = setTimeout(() => {
      // Mevcut piksellik konumu saniyeye çevir (delay olarak)
      const delay = (currentRefPos / MAX_SHIFT) * ANIM_DURATION;
      
      refsTrack.style.transition = 'none'; 
      refsTrack.style.transform = ''; 
      refsTrack.style.animation = `scroll-marquee ${ANIM_DURATION}s linear infinite`;
      refsTrack.style.animationDelay = `-${delay}s`; 
    }, 2000);
  }

  refsPrevBtn?.addEventListener('click', () => moveRefs('prev'));
  refsNextBtn?.addEventListener('click', () => moveRefs('next'));

  /* ── PARTNERS SLIDER (OK TUŞLARI MANTIĞI) ── */
  const partnersTrack    = document.getElementById('partnersTrack');
  const partnersPrevBtn  = document.getElementById('partnersPrevBtn');
  const partnersNextBtn  = document.getElementById('partnersNextBtn');
  const PARTNER_LOGO_WIDTH = 250; // Her logonun genişliği
  let currentPartnerPos  = 0;
  let partnersResumeTimeout = null;
  const TOTAL_PARTNERS = 5;
  const MAX_PARTNER_SHIFT = TOTAL_PARTNERS * PARTNER_LOGO_WIDTH; // 1250px
  const PARTNER_ANIM_DURATION = 35; // Partner logo hızı 35 saniyeye ayarlandı

  function movePartners(direction) {
    if (!partnersTrack) return;
    
    clearTimeout(partnersResumeTimeout);

    // 1. MEVCUT KONUMU YAKALA: Animasyonun o anki piksel değerini al
    if (partnersTrack.style.animation !== 'none') {
      const style = window.getComputedStyle(partnersTrack);
      const matrix = new DOMMatrixReadOnly(style.transform);
      currentPartnerPos = Math.abs(matrix.m41) % MAX_PARTNER_SHIFT;
    }

    // 2. ANIMASYONU DURDUR
    partnersTrack.style.animation = 'none';
    partnersTrack.style.transition = 'transform 0.4s ease-out';

    // 3. YENİ KONUMU HESAPLA
    if (direction === 'next') {
      currentPartnerPos = Math.ceil((currentPartnerPos + 1) / PARTNER_LOGO_WIDTH) * PARTNER_LOGO_WIDTH;
      if (currentPartnerPos >= MAX_PARTNER_SHIFT) currentPartnerPos = 0;
    } else {
      currentPartnerPos = Math.floor((currentPartnerPos - 1) / PARTNER_LOGO_WIDTH) * PARTNER_LOGO_WIDTH;
      if (currentPartnerPos < 0) currentPartnerPos = MAX_PARTNER_SHIFT - PARTNER_LOGO_WIDTH;
    }
    
    partnersTrack.style.transform = `translateX(-${currentPartnerPos}px)`;

    // 4. 2 SANIYE SONRA KALDIĞI YERDEN DEVAM ET
    partnersResumeTimeout = setTimeout(() => {
      // Mevcut piksellik konumu saniyeye çevir (delay olarak)
      const delay = (currentPartnerPos / MAX_PARTNER_SHIFT) * PARTNER_ANIM_DURATION;
      
      partnersTrack.style.transition = 'none'; 
      partnersTrack.style.transform = ''; 
      partnersTrack.style.animation = `scroll-marquee ${PARTNER_ANIM_DURATION}s linear infinite`;
      partnersTrack.style.animationDelay = `-${delay}s`; 
    }, 2000);
  }

  partnersPrevBtn?.addEventListener('click', () => movePartners('prev'));
  partnersNextBtn?.addEventListener('click', () => movePartners('next'));
}); // End of window.addEventListener('load', ...)
