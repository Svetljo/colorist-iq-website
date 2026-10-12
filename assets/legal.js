// Shared behaviour for the legal pages (terms.html, privacy.html).
// Keep the consent logic in sync with the inline script in index.html.

// Google Consent Mode (Advanced) for Google Analytics
(function () {
  const measurementId = 'G-8BEMRYF0NV';
  const consentKey = 'coloristiq-analytics-consent';
  const banner = document.getElementById('cookie-banner');
  const footerSettingsButton = document.getElementById('footer-cookie-settings');
  const acceptButton = document.getElementById('cookie-accept');
  const rejectButton = document.getElementById('cookie-reject');
  const inlineSettingsButtons = document.querySelectorAll('[data-open-cookie-settings]');
  let analyticsLoaded = false;

  function initializeAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    // Advanced Consent Mode: tags can load, but storage is denied by default.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function updateAnalyticsConsent(value) {
    const granted = value === 'granted';
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function saveConsent(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (storageError) {
      console.warn('Could not save cookie consent preference:', storageError);
    }
  }

  function revokeAnalytics() {
    updateAnalyticsConsent('denied');
    const cookieNames = ['_ga', '_ga_' + measurementId.replace(/-/g, '')];
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (cookieNames.includes(name)) {
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + window.location.hostname;
      }
    });
  }

  function showBanner() {
    banner.hidden = false;
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setConsent(value) {
    saveConsent(value);
    updateAnalyticsConsent(value);
    if (value === 'denied') revokeAnalytics();
    banner.hidden = true;
  }

  let savedConsent = null;
  try {
    savedConsent = window.localStorage.getItem(consentKey);
  } catch (storageError) {
    console.warn('Could not read cookie consent preference:', storageError);
  }

  initializeAnalytics();
  if (savedConsent === 'granted') {
    updateAnalyticsConsent('granted');
    banner.hidden = true;
  } else if (savedConsent === 'denied') {
    revokeAnalytics();
    banner.hidden = true;
  } else {
    banner.hidden = false;
  }

  acceptButton.addEventListener('click', () => setConsent('granted'));
  rejectButton.addEventListener('click', () => setConsent('denied'));
  footerSettingsButton.addEventListener('click', showBanner);
  inlineSettingsButtons.forEach(btn => btn.addEventListener('click', showBanner));
})();

// Nav on scroll
(function () {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
    navbar.style.paddingTop = scrolled ? '0.75rem' : '';
    navbar.style.paddingBottom = scrolled ? '0.75rem' : '';
  }, { passive: true });
})();

// Mobile menu
(function () {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const icoOpen = document.getElementById('ico-open');
  const icoClose = document.getElementById('ico-close');

  function setOpen(open) {
    mobileMenu.classList.toggle('open', open);
    icoOpen.classList.toggle('hidden', open);
    icoClose.classList.toggle('hidden', !open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  hamburger.addEventListener('click', () => setOpen(!mobileMenu.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
})();

// Table of contents: highlight the section currently in view
(function () {
  const links = document.querySelectorAll('[data-toc] a[href^="#"]');
  if (!links.length) return;

  const byId = new Map();
  links.forEach(link => {
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(link);
  });

  function setActive(id) {
    links.forEach(link => {
      link.classList.remove('toc-active');
      link.removeAttribute('aria-current');
    });
    (byId.get(id) || []).forEach(link => {
      link.classList.add('toc-active');
      link.setAttribute('aria-current', 'location');
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-120px 0px -65% 0px', threshold: 0 });

  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });

  // Close the mobile table of contents after choosing a section
  const mobileToc = document.getElementById('mobile-toc');
  if (mobileToc) {
    mobileToc.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mobileToc.open = false;
    }));
  }
})();
