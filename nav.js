// Mobile navigation toggle. Progressive enhancement: the markup ships with
// the full nav visible, and this script adds the `nav-js` class that switches
// the small-screen layout to a collapsible menu behind a hamburger button.
// Without JS the menu stays fully visible (it simply wraps), so navigation
// never depends on this script.
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('primary-nav');
  if (!header || !toggle || !links) return;

  header.classList.add('nav-js');

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    links.classList.remove('is-open');
  }

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    links.classList.add('is-open');
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') close();
    else open();
  });

  // Close after tapping a destination so the menu doesn't linger.
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  // Escape closes the menu and returns focus to the button.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
      toggle.focus();
    }
  });

  // If the viewport grows back to desktop, reset to a clean state.
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) close();
  });
})();
