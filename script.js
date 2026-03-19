(() => {
  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore storage failures so the rest of the page keeps working.
      }
    }
  };

  const selectors = {
    navToggle: '.nav-toggle',
    siteNav: '.site-nav',
    faqDetails: '.faq-list details',
    currentYear: '#current-year'
  };

  const navToggle = document.querySelector(selectors.navToggle);
  const siteNav = document.querySelector(selectors.siteNav);
  const faqItems = Array.from(document.querySelectorAll(selectors.faqDetails));
  const currentYear = document.querySelector(selectors.currentYear);

  const setNavState = isOpen => {
    if (!navToggle || !siteNav) {
      return;
    }

    siteNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    document.body.classList.toggle('nav-open', isOpen);
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      setNavState(!siteNav.classList.contains('open'));
    });

    siteNav.addEventListener('click', event => {
      if (event.target instanceof HTMLElement && event.target.matches('a')) {
        setNavState(false);
      }
    });

    document.addEventListener('click', event => {
      if (!siteNav.classList.contains('open')) {
        return;
      }

      const target = event.target;
      if (target instanceof Node && !siteNav.contains(target) && !navToggle.contains(target)) {
        setNavState(false);
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setNavState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) {
        setNavState(false);
      }
    });
  }

  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) {
        return;
      }

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.open = false;
        }
      });
    });
  });

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }

  const consentKey = 'gert_cookie_choice';
  const consentValue = storage.get(consentKey);

  if (!consentValue) {
    const banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.innerHTML = `
      <div class="cookie-copy">
        <p class="cookie-title">Cookie preferences</p>
        <p>We use optional cookies to improve the browsing experience for families visiting Gert the SEE Turtle.</p>
      </div>
      <div class="cookie-actions">
        <button class="btn btn-primary cookie-btn" type="button" data-choice="accepted">Accept</button>
        <button class="btn btn-secondary cookie-btn" type="button" data-choice="declined">Decline</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.addEventListener('click', event => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const button = target.closest('[data-choice]');
      if (!button) {
        return;
      }

      const choice = button.getAttribute('data-choice');
      if (!choice) {
        return;
      }

      storage.set(consentKey, choice);
      banner.remove();
    });
  }
})();
