// script.js — final theme toggle with memory, safety, smooth transition, and ARIA
(function () {
  const TOGGLE_ID = 'theme-toggle';
  const STORAGE_KEY = 'preferred-theme-dark';
  const TRANSITION_CLASS = 'theme-transition';
  const TRANSITION_MS = 420;

  const btn = document.getElementById(TOGGLE_ID);
  const body = document.body;

  if (!btn || !body) return; // safe guard

  // ensure decorative icon exists (keeps visible label text unchanged)
  if (!btn.querySelector('.icon')) {
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    btn.insertBefore(icon, btn.firstChild);
  }

  function setAria(pressed) {
    btn.setAttribute('aria-pressed', String(pressed));
  }

  // apply theme (true = dark)
  function applyTheme(isDark, skipSave = false) {
    if (isDark) body.classList.add('dark');
    else body.classList.remove('dark');

    setAria(isDark);

    if (!skipSave) {
      try {
        localStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false');
      } catch (e) {
        // ignore storage errors
      }
    }
  }

  function withTransition(cb) {
    body.classList.add(TRANSITION_CLASS);
    window.clearTimeout(body._themeTimeout);
    body._themeTimeout = window.setTimeout(() => {
      body.classList.remove(TRANSITION_CLASS);
      body._themeTimeout = null;
    }, TRANSITION_MS);
    cb();
  }

  // read saved preference, otherwise respect system preference
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    saved = null;
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialIsDark = saved === 'true' ? true : (saved === 'false' ? false : prefersDark);

  // apply initial theme and set ARIA
  applyTheme(initialIsDark, true);

  // ensure button's aria and visual are correct on load
  setAria(initialIsDark);

  // click toggles theme with transition and small icon nudge
  btn.addEventListener('click', () => {
    const isDarkNow = body.classList.contains('dark');
    const toDark = !isDarkNow;

    withTransition(() => applyTheme(toDark));

    const icon = btn.querySelector('.icon');
    if (icon) {
      icon.style.transform = 'scale(0.86) translateY(1px)';
      window.setTimeout(() => (icon.style.transform = ''), 160);
    }
  });

  // respond to system preference changes only if user hasn't saved a choice
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    // use addEventListener if available, fallback to addListener for older browsers
    const handler = (e) => {
      try {
        const hasSaved = localStorage.getItem(STORAGE_KEY) !== null;
        if (!hasSaved) {
          withTransition(() => applyTheme(e.matches, true));
        }
      } catch (err) {
        // ignore
      }
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();
