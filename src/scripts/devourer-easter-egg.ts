const DESKTOP_QUERY = '(min-width: 769px)';
const REQUIRED_THEME_TOGGLES = 8;
const DIALOG_DURATION_MS = 7200;
const DIALOG_TYPING_DURATION_MS = 4200;

function initDevourerEasterEgg() {
  const themeToggle = document.getElementById('theme-toggle');
  const layer = document.getElementById('dog-event');
  const dialog = document.getElementById('dog-dialog');
  const skipButton = document.getElementById('dog-skip');
  if (!themeToggle || !layer || !dialog) return;

  let themeToggleCount = 0;
  let active = false;
  let typeTimer: ReturnType<typeof setTimeout> | undefined;
  let hideDialogTimer: ReturnType<typeof setTimeout> | undefined;
  const dialogMessage = dialog.dataset.message ?? '';
  dialog.setAttribute('aria-label', dialogMessage);

  const setActive = (nextActive: boolean) => {
    active = nextActive;
    layer.classList.toggle('is-active', nextActive);
    layer.setAttribute('aria-hidden', nextActive ? 'false' : 'true');
    document.documentElement.classList.toggle('dog-event-active', nextActive);
    document.body.classList.toggle('dog-event-active', nextActive);
    themeToggle.toggleAttribute('disabled', nextActive);
  };

  const clearDialogTimers = () => {
    clearTimeout(typeTimer);
    clearTimeout(hideDialogTimer);
  };

  const hideDialog = () => {
    clearDialogTimers();
    dialog.textContent = '';
    dialog.classList.remove('is-visible');
  };

  const typeDialog = () => {
    hideDialog();
    dialog.classList.add('is-visible');
    if (!dialogMessage) return;

    const typingSpeed = Math.max(30, Math.floor(DIALOG_TYPING_DURATION_MS / dialogMessage.length));
    let index = 0;
    const typeNextCharacter = () => {
      index += 1;
      dialog.textContent = dialogMessage.slice(0, index);
      if (index < dialogMessage.length) {
        typeTimer = setTimeout(typeNextCharacter, typingSpeed);
      }
    };

    typeNextCharacter();
    hideDialogTimer = setTimeout(hideDialog, DIALOG_DURATION_MS);
  };

  const stopEvent = () => {
    if (!active) return;
    hideDialog();
    setActive(false);
    window.dispatchEvent(new CustomEvent('devourer:skip'));
  };

  document.addEventListener('theme:before-toggle', (event) => {
    if (active) {
      event.preventDefault();
      return;
    }

    if (!window.matchMedia(DESKTOP_QUERY).matches) {
      themeToggleCount = 0;
      return;
    }

    themeToggleCount += 1;
    if (themeToggleCount !== REQUIRED_THEME_TOGGLES) return;

    event.preventDefault();
    themeToggleCount = 0;
    setActive(true);
    typeDialog();
    window.dispatchEvent(new CustomEvent('devourer:summon'));
  });

  window.addEventListener('devourer:complete', () => {
    hideDialog();
    setActive(false);
  });

  skipButton?.addEventListener('click', stopEvent);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') stopEvent();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDevourerEasterEgg);
} else {
  initDevourerEasterEgg();
}
