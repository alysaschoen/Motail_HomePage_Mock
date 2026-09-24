/* Mo'Tail & Spaw redesign mockup — header, booking modal, hero video, pricing tabs */
(function () {
  var APP = 'https://pawsandpints.app.link/app';

  /* ---- Dropdowns: real buttons with aria-expanded; click, Esc and outside-click [A4] ---- */
  document.querySelectorAll('.rd-nav__item').forEach(function (item) {
    var btn = item.querySelector('.rd-nav__parent');
    if (!btn) return;
    var closeTimer = null;
    function setOpen(open) {
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (!open) item.classList.remove('is-pinned');
    }
    // Click pins the menu open (a click after hover-open no longer shuts it); a second click on a pinned menu closes it
    btn.addEventListener('click', function () {
      var pinned = item.classList.contains('is-pinned');
      closeMenus(item);
      if (pinned) { setOpen(false); return; }
      setOpen(true);
      item.classList.add('is-pinned');
    });
    // Hover opens on desktop; leaving waits a moment so the pointer can travel to the menu
    item.addEventListener('mouseenter', function () {
      if (!window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) return;
      clearTimeout(closeTimer);
      closeMenus(item);
      setOpen(true);
    });
    item.addEventListener('mouseleave', function () {
      if (!window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) return;
      if (item.classList.contains('is-pinned')) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { setOpen(false); }, 350);
    });
  });
  function closeMenus(except) {
    document.querySelectorAll('.rd-nav__item.is-open').forEach(function (i) {
      if (i === except) return;
      i.classList.remove('is-open', 'is-pinned');
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


  /* ---- Membership savings calculator (one dog, Des Moines prices) ---- */
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var $ = function (sel) { return calc.querySelector(sel); };
    var money = function (n) { return (n < 0 ? '−$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); };
    var out = function (k, v) { calc.querySelectorAll('[data-out="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
    var update = function () {
      var days = +$('#calc-days').value, rate = +$('input[name="calc-length"]:checked').value;
      var nights = +$('#calc-nights').value, suite = +$('#calc-suite').value;
      var grooms = +$('#calc-grooms').value, groom = +$('#calc-groom').value;
      var spend = days * 52 * rate + nights * suite + grooms * groom;
      var discount = spend * 0.10, credits = 120;
      var annual = discount + credits - 264, monthly = discount + credits - 288;
      out('days', days); out('nights', nights); out('grooms', grooms);
      out('spend', money(spend)); out('discount', money(discount));
      out('verdict', annual >= 0 ? "You'd come out ahead by" : "You'd be short by");
      out('net', money(Math.abs(annual)));
      out('monthly', (monthly >= 0 ? money(monthly) + ' ahead' : money(Math.abs(monthly)) + ' short'));
      calc.classList.toggle('is-ahead', annual >= 0);
    };
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    update();
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
