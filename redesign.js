/* Mo'Tail & Spaw redesign mockup — header, booking modal, hero video, pricing tabs */
(function () {
  var APP = 'https://pawsandpints.app.link/app';

  /* ---- Dropdowns: real buttons with aria-expanded; click, Esc and outside-click [A4] ---- */
  document.querySelectorAll('.rd-nav__item').forEach(function (item) {
    var btn = item.querySelector('.rd-nav__parent');
    if (!btn) return;
    var hoveredAt = 0;
    btn.addEventListener('click', function () {
      // A click that lands right after hover-open should keep it open, not toggle it shut
      var open = !item.classList.contains('is-open') || Date.now() - hoveredAt < 400;
      closeMenus();
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    if (window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) {
      item.addEventListener('mouseenter', function () { hoveredAt = Date.now(); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); });
      item.addEventListener('mouseleave', function () { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); });
    }
  });
  function closeMenus() {
    document.querySelectorAll('.rd-nav__item.is-open').forEach(function (i) {
      i.classList.remove('is-open');
      var b = i.querySelector('.rd-nav__parent'); if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  document.addEventListener('click', function (e) { if (!e.target.closest('.rd-nav__item')) closeMenus(); });

  /* ---- Mobile drawer ---- */
  var nav = document.querySelector('.rd-nav'), burger = document.querySelector('.rd-burger:not(.rd-nav__close)'), scrim = document.querySelector('.rd-scrim');
  function drawer(open) {
    if (!nav) return;
    nav.classList.toggle('is-open', open);
    if (scrim) scrim.classList.toggle('is-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (open) { var f = nav.querySelector('a,button'); if (f) f.focus(); } else if (burger) burger.focus();
  }
  if (burger) burger.addEventListener('click', function () { drawer(true); });
  document.querySelectorAll('.rd-nav__close, .rd-scrim').forEach(function (el) { el.addEventListener('click', function () { drawer(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeMenus();
    if (nav && nav.classList.contains('is-open')) drawer(false);
  });

  /* ---- Book: phones go straight to the app; desktop gets QR + phone [A7] ---- */
  var modal = document.getElementById('rd-book');
  var isPhone = /iPhone|iPad|Android/i.test(navigator.userAgent);
  document.querySelectorAll('[data-book]').forEach(function (a) {
    var intent = a.getAttribute('data-book') || 'general';
    var url = APP + '?utm_source=website&utm_medium=cta&utm_campaign=' + encodeURIComponent(intent); // per-service attribution
    a.setAttribute('href', url);
    a.addEventListener('click', function (e) {
      if (isPhone || !modal || !modal.showModal) return;
      e.preventDefault();
      var label = modal.querySelector('[data-intent]');
      if (label) label.textContent = a.getAttribute('data-book-label') || 'your visit';
      var open = modal.querySelector('[data-open-app]');
      if (open) open.setAttribute('href', url);
      var qr = modal.querySelector('.rd-modal__qr');
      if (qr && window.QRCode) { qr.innerHTML = ''; new QRCode(qr, { text: url, width: 160, height: 160, colorDark: '#252A36', colorLight: '#ffffff' }); }
      modal.showModal();
    });
  });
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
    var c = modal.querySelector('.rd-modal__close'); if (c) c.addEventListener('click', function () { modal.close(); });
  }

  /* ---- Hero video: visible pause control (WCAG 2.2.2) and respect reduced motion ---- */
  var vid = document.querySelector('.rd-hero video'), pause = document.querySelector('.rd-hero__pause');
  if (vid && pause) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { vid.removeAttribute('autoplay'); vid.pause(); setPause(true); }
    pause.addEventListener('click', function () { if (vid.paused) { vid.play(); setPause(false); } else { vid.pause(); setPause(true); } });
  }
  function setPause(paused) {
    pause.setAttribute('aria-pressed', String(paused));
    pause.querySelector('span').textContent = paused ? 'Play video' : 'Pause video';
  }

  /* ---- Pricing tab bar: highlight the section in view ---- */
  var tabs = document.querySelectorAll('.rd-tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    var map = {};
    tabs.forEach(function (t) { var id = t.getAttribute('href').slice(1); var s = document.getElementById(id); if (s) map[id] = t; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { tabs.forEach(function (t) { t.classList.remove('is-active'); }); map[en.target.id].classList.add('is-active'); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---- Mockup forms don't submit anywhere ---- */
  document.querySelectorAll('form[data-mock]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('[data-mock-msg]');
      if (msg) { msg.hidden = false; msg.focus(); }
    });
  });
})();
