(function () {
  const TOGGLE_ID = 'theme-toggle';
  const STORAGE_KEY = 'preferred-theme-dark';
  const TRANSITION_CLASS = 'theme-transition';
  const TRANSITION_MS = 420;

  const btn = document.getElementById(TOGGLE_ID);
  const body = document.body;
  if (!btn || !body) return;

  if (!btn.querySelector('.icon')) {
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.setAttribute('aria-hidden', 'true');
    btn.insertBefore(icon, btn.firstChild);
  }

  function setAria(pressed) {
    btn.setAttribute('aria-pressed', String(pressed));
  }

  function cssVar(name, fallback = '') {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return val || fallback;
  }

  function applyButtonInlineStyles() {
    const bg = cssVar('--toggle-bg', '#000000');
    const text = cssVar('--toggle-text', '#ffffff');

    btn.style.background = bg;
    btn.style.color = text;
    btn.style.backgroundImage = 'none';
    const icon = btn.querySelector('.icon');
    if (icon) icon.style.background = text;
  }

  function applyTheme(isDark, skipSave = false) {
    if (isDark) body.classList.add('dark');
    else body.classList.remove('dark');

    setAria(isDark);
    applyButtonInlineStyles();

    if (!skipSave) {
      try { localStorage.setItem(STORAGE_KEY, isDark ? 'true' : 'false'); } catch (e) {}
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

  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialIsDark = saved === 'true' ? true : (saved === 'false' ? false : prefersDark);

  applyTheme(initialIsDark, true);

  window.addEventListener('load', applyButtonInlineStyles);
  window.addEventListener('resize', applyButtonInlineStyles);

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

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      try {
        const hasSaved = localStorage.getItem(STORAGE_KEY) !== null;
        if (!hasSaved) withTransition(() => applyTheme(e.matches, true));
      } catch (err) {}
    };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();
