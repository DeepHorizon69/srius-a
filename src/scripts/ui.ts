/** Lightweight UI — no React / Framer Motion */

import { sections as profileSections } from '../data/profile';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobile(): boolean {
  return window.matchMedia('(max-width: 768px)').matches;
}

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  const dark = saved !== 'light';

  const apply = (isDark: boolean) => {
    document.documentElement.classList.toggle('light-mode', !isDark);
    document.body.classList.toggle('light-mode', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = btn?.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    btn?.setAttribute('title', isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode');
  };

  apply(dark);

  btn?.addEventListener('click', () => {
    const beforeToggle = new Event('theme:before-toggle', { cancelable: true });
    if (!document.dispatchEvent(beforeToggle)) return;
    apply(document.documentElement.classList.contains('light-mode'));
  });
}

function hideWipBanner() {
  const banner = document.getElementById('wip-banner');
  document.documentElement.classList.add('hide-wip-banner');
  sessionStorage.setItem('hideBanner', 'true');
  if (!banner) return;
  banner.hidden = true;
  banner.remove();
}

function initBanner() {
  const banner = document.getElementById('wip-banner');
  const close = document.getElementById('banner-close');
  if (!banner) return;

  if (sessionStorage.getItem('hideBanner') === 'true') {
    hideWipBanner();
    return;
  }

  close?.addEventListener('click', hideWipBanner);
}

const NAV_OFFSET = 88;

type NavScrollSpy = {
  sections: HTMLElement[];
  links: NodeListOf<HTMLAnchorElement>;
  currentId: string;
  locked: boolean;
};

let navSpy: NavScrollSpy | null = null;

function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

function applyNavActive(id: string) {
  if (!navSpy) return;
  if (id === navSpy.currentId) return;

  navSpy.currentId = id;
  navSpy.links.forEach((link) => {
    const href = link.getAttribute('href');
    const match = href === `#${id}` || (id === 'hero' && href === '#hero');
    link.classList.toggle('nav-link--active', match);
  });
}

/** Section terdekat di bawah garis probe (lebih stabil daripada intersection ratio). */
function getActiveSectionFromScroll(): string {
  if (!navSpy || navSpy.sections.length === 0) return 'hero';

  const probe = window.scrollY + NAV_OFFSET + 20;
  let activeId = navSpy.sections[0].id;

  for (const section of navSpy.sections) {
    if (section.offsetTop <= probe) activeId = section.id;
  }

  return activeId;
}

function lockNavSpy(targetId: string) {
  if (!navSpy) return;
  navSpy.locked = true;
  applyNavActive(targetId);
}

function unlockNavSpy() {
  if (!navSpy) return;
  navSpy.locked = false;
  applyNavActive(getActiveSectionFromScroll());
}

function waitForScrollSettle(onDone: () => void) {
  const maxWaitMs = 2000;
  const idleMs = 150;
  const minLockMs = 100;
  let settled = false;
  const startedAt = Date.now();
  let lastScrollAt = startedAt;

  const finish = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('scrollend', onScrollEnd);
    clearTimeout(fallbackTimer);
    clearInterval(pollTimer);
    onDone();
  };

  const onScrollEnd = () => finish();
  const onScroll = () => {
    lastScrollAt = Date.now();
  };

  const fallbackTimer = setTimeout(finish, maxWaitMs);
  const pollTimer = setInterval(() => {
    const now = Date.now();
    if (now - startedAt < minLockMs) return;
    if (now - lastScrollAt >= idleMs) finish();
  }, 50);

  window.addEventListener('scroll', onScroll, { passive: true });
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', onScrollEnd, { once: true });
  }
}

function navigateToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  lockNavSpy(id);
  scrollToSection(id, behavior);
  history.replaceState(null, '', `#${id}`);

  if (behavior === 'auto') {
    unlockNavSpy();
    return;
  }

  waitForScrollSettle(unlockNavSpy);
}

function initAnchorNav() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-nav-link], a[href^="#"]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href?.startsWith('#') || href.length < 2) return;

    link.addEventListener('click', (e) => {
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      navigateToSection(id);
    });
  });

  if (window.location.hash) {
    const id = window.location.hash.slice(1);
    requestAnimationFrame(() => navigateToSection(id, 'auto'));
  }
}

function initScrollSpy() {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a.nav-link[data-nav-link], a.mobile-nav__link[data-nav-link]'
  );
  const sections = profileSections
    .map((section) => document.getElementById(section.id))
    .filter((el): el is HTMLElement => el != null);

  if (sections.length === 0 || links.length === 0) return;

  navSpy = {
    sections,
    links,
    currentId: '',
    locked: false,
  };

  let scrollRaf = 0;
  const onScroll = () => {
    const nav = document.getElementById('site-nav');
    nav?.classList.toggle('nav--scrolled', window.scrollY > 24);

    if (navSpy?.locked) return;

    cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(() => {
      applyNavActive(getActiveSectionFromScroll());
    });
  };

  applyNavActive(getActiveSectionFromScroll());
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileNav() {
  const root = document.getElementById('mobile-nav');
  const toggle = document.getElementById('nav-toggle');
  if (!root || !toggle) return;

  const closeTriggers = root.querySelectorAll('[data-nav-close]');
  const links = root.querySelectorAll<HTMLAnchorElement>('a[data-nav-link]');

  const isOpen = () => root.dataset.state === 'open';

  const setOpen = (open: boolean) => {
    root.dataset.state = open ? 'open' : 'closed';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi');
    document.body.classList.toggle('nav-open', open);

    if (open) {
      root.removeAttribute('hidden');
      root.removeAttribute('inert');
    } else {
      root.setAttribute('hidden', '');
      root.setAttribute('inert', '');
    }
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!isOpen());
  });

  closeTriggers.forEach((el) => {
    el.addEventListener('click', () => setOpen(false));
  });

  links.forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
}

function initScrollReveal() {
  if (prefersReducedMotion()) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
    return;
  }

  const reduceMotion = isMobile();
  const mobile = isMobile();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: mobile ? '0px 0px -5% 0px' : '-40px 0px',
      threshold: mobile ? 0.02 : 0.08,
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    if (reduceMotion) {
      el.classList.add('active');
    } else {
      observer.observe(el);
    }
  });
}

function initTypewriter() {
  const el = document.querySelector<HTMLElement>('[data-typewriter]');
  if (!el) return;

  const words = (el.dataset.words ?? '').split('|').filter(Boolean);
  if (words.length === 0) return;

  if (prefersReducedMotion()) {
    el.textContent = words[0];
    return;
  }

  const mobile = isMobile();
  const typingSpeed = mobile ? 55 : 100;
  const deletingSpeed = mobile ? 28 : 50;
  const pauseTime = mobile ? 2200 : 2000;
  let wordIndex = 0;
  let text = '';
  let isDeleting = false;
  let timer: ReturnType<typeof setTimeout>;
  let running = true;

  const tick = () => {
    if (!running) return;

    const current = words[wordIndex];
    if (isDeleting) {
      text = current.substring(0, text.length - 1);
    } else {
      text = current.substring(0, text.length + 1);
    }
    el.textContent = text;

    if (!isDeleting && text === current) {
      timer = setTimeout(() => {
        isDeleting = true;
        tick();
      }, pauseTime);
      return;
    }
    if (isDeleting && text === '') {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      timer = setTimeout(tick, mobile ? 400 : 500);
      return;
    }
    timer = setTimeout(tick, isDeleting ? deletingSpeed : typingSpeed);
  };

  el.textContent = '';
  tick();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(timer);
      return;
    }
    if (!running) return;
    clearTimeout(timer);
    tick();
  });

  window.addEventListener('pagehide', () => {
    running = false;
    clearTimeout(timer);
  });
}

function init() {
  initTheme();
  initBanner();
  initAnchorNav();
  initScrollSpy();
  initMobileNav();
  initScrollReveal();
  initTypewriter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
