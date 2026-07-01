// Scroll-reveal + small interaction polish. Progressive enhancement:
//
//  * Without JS, nothing here runs and every element renders fully visible.
//  * The reveal *hiding* is done in CSS, but only under `html.js-anim`, and
//    that class is added by a tiny inline snippet in each page's <head> that
//    ALSO checks prefers-reduced-motion. So people who ask for reduced motion
//    (or have JS disabled) never get hidden content and never see motion.
//
// This file only ever *reveals* (adds `is-visible`) and toggles a scrolled
// state on the header, so a failure here can't leave content stranded for the
// reduced-motion / no-JS paths.
(function () {
  var root = document.documentElement;
  var reduce = !window.matchMedia ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Add a gentle drop shadow to the sticky header once the page scrolls,
  // so it lifts off the content. Motion-free, safe for everyone.
  (function () {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false;
    function apply() {
      header.classList.toggle('is-scrolled', window.pageYOffset > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(apply);
    }, { passive: true });
    apply();
  })();

  // Everything below is entrance motion; skip it entirely when unwanted or
  // unsupported. (When reduce is true, html.js-anim is absent, so the CSS
  // never hid these elements in the first place.)
  if (reduce || !('IntersectionObserver' in window) || !window.Map) return;

  // Kept in sync with the reveal selector list in styles.css.
  var groups = [
    '.hero-copy > *',
    '.hero-art',
    '.section-head > *',
    '.grid > .card',
    '.split > *',
    '.maker-grid > .card',
    '.product-grid > .product-card',
    '.flavor-grid > *',
    '.tabs > .tab',
    '.event-list > .event',
    '.order-step',
    '.callout-note',
    '.legal > *',
    '.faq-item',
    '.page-hero > *',
    '.testimonials .carousel'
  ];

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  // Stagger siblings within the same parent so groups cascade in, capped so
  // long lists (product tables, legal prose) don't crawl.
  var targets = document.querySelectorAll(groups.join(','));
  var perParent = new Map();
  Array.prototype.forEach.call(targets, function (el) {
    var parent = el.parentNode;
    var n = perParent.get(parent) || 0;
    perParent.set(parent, n + 1);
    el.style.setProperty('--reveal-delay', (Math.min(n, 6) * 70) + 'ms');
    io.observe(el);
  });
})();
