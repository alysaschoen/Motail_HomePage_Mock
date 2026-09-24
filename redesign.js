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


  /* ---- Location picker (utility bar): choose a location; remembered per browser ---- */
  var pick = document.querySelector('.rd-locpick');
  if (pick) {
    var pbtn = pick.querySelector('.rd-loc'), pmenu = pick.querySelector('.rd-locmenu');
    var setMenu = function (open) { pmenu.hidden = !open; pbtn.setAttribute('aria-expanded', String(open)); };
    var applyLoc = function (opt) {
      if (!opt) return;
      document.querySelectorAll('[data-loc-name]').forEach(function (el) { el.textContent = opt.getAttribute('data-loc-label'); });
      document.querySelectorAll('[data-loc-phone]').forEach(function (el) {
        el.setAttribute('href', 'tel:' + opt.getAttribute('data-loc-tel'));
        var t = el.querySelector('span'); if (t) t.textContent = opt.getAttribute('data-loc-phone-text');
      });
      pmenu.querySelectorAll('[data-loc]').forEach(function (b) { b.setAttribute('aria-current', String(b === opt)); });
    };
    pbtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(pmenu.hidden); });
    pmenu.querySelectorAll('[data-loc]').forEach(function (b) {
      b.addEventListener('click', function () {
        applyLoc(b);
        try { localStorage.setItem('rd-loc', b.getAttribute('data-loc')); } catch (err) {}
        setMenu(false); pbtn.focus();
      });
    });
    document.addEventListener('click', function (e) { if (!pick.contains(e.target)) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pmenu.hidden) { setMenu(false); pbtn.focus(); } });
    var saved = null;
    try { saved = localStorage.getItem('rd-loc'); } catch (err) {}
    // A location's own page always shows that location, and becomes the remembered choice
    var pageLoc = document.querySelector('[data-loc-page]');
    if (pageLoc) { saved = pageLoc.getAttribute('data-loc-page'); try { localStorage.setItem('rd-loc', saved); } catch (err) {} }
    applyLoc(pmenu.querySelector('[data-loc="' + (saved || '') + '"]') || pmenu.querySelector('[data-loc]'));
  }

  /* ---- Locations finder: live search + state chips ---- */
  var finder = document.querySelector('[data-finder]');
  if (finder) {
    var q = finder.querySelector('[data-finder-q]'), chipsEl = document.querySelectorAll('[data-lside] [data-state]');
    var states = document.querySelectorAll('.rd-lstate'), empty = document.querySelector('[data-finder-empty]');
    var active = 'all';
    var run = function () {
      var term = (q.value || '').trim().toLowerCase(), shown = 0;
      states.forEach(function (sec) {
        var inState = active === 'all' || sec.getAttribute('data-state') === active, n = 0;
        sec.querySelectorAll('[data-search]').forEach(function (c) {
          var hit = inState && (!term || c.getAttribute('data-search').indexOf(term) > -1 || c.textContent.toLowerCase().indexOf(term) > -1);
          c.hidden = !hit; if (hit) n++;
        });
        sec.hidden = n === 0; shown += n;
      });
      if (empty) empty.hidden = shown > 0;
    };
    chipsEl.forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        active = c.getAttribute('data-state');
        chipsEl.forEach(function (x) { x.classList.toggle('is-on', x === c); x.setAttribute('aria-current', String(x === c)); });
        document.querySelectorAll('.rd-lstates').forEach(function (g) { g.classList.toggle('is-one-state', active !== 'all'); });
        run();
      });
    });
    q.addEventListener('input', run);
    finder.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    var h = (location.hash || '').replace('#state-', '');
    var pre = document.querySelector('[data-lside] [data-state="' + h + '"]');
    if (pre && h) pre.click();
  }

  /* ---- Blog: category chips filter the posts; sample post links show a note ---- */
  var bchips = document.querySelector('[data-bchips]');
  if (bchips) {
    var posts = document.querySelectorAll('.rd-bcard'), bempty = document.querySelector('[data-bempty]');
    var feat = document.querySelector('[data-bfeature]');
    bchips.querySelectorAll('[data-bcat]').forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.preventDefault();
        var cat = c.getAttribute('data-bcat'), n = 0;
        bchips.querySelectorAll('[data-bcat]').forEach(function (x) { x.classList.toggle('is-on', x === c); x.setAttribute('aria-current', String(x === c)); });
        posts.forEach(function (post) { var hit = cat === 'all' || post.getAttribute('data-cat') === cat; post.hidden = !hit; if (hit) n++; });
        if (feat) feat.hidden = feat.querySelector('.rd-bcard').hidden;
        if (bempty) bempty.hidden = n > 0;
      });
    });
  }
  document.querySelectorAll('[data-sample-post]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById('rd-mock-toast');
      if (!t) { t = document.createElement('div'); t.id = 'rd-mock-toast'; t.setAttribute('role', 'status');
        t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2001;background:#181C24;color:#fff;font:600 15px system-ui,sans-serif;padding:12px 18px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3)';
        document.body.appendChild(t); }
      t.textContent = 'Sample post: the article page is next on the list.';
      clearTimeout(t._h); t._h = setTimeout(function () { t.remove(); }, 2200);
    });
  });

  /* ---- Location tiles: click opens the location's pop-up (native <dialog>); #slug in the URL opens it too ---- */
  var openDlg = function (d, from) {
    if (!d || typeof d.showModal !== 'function') return;
    d._from = from || null; d.showModal();
  };
  document.querySelectorAll('[data-dlg]').forEach(function (t) {
    t.addEventListener('click', function () { openDlg(document.getElementById(t.getAttribute('data-dlg')), t); });
  });
  document.querySelectorAll('dialog.rd-ldlg').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-dlg-close]')) d.close(); });
    d.addEventListener('close', function () { if (d._from) d._from.focus(); });
  });
  var hashSlug = (location.hash || '').slice(1);
  if (hashSlug && document.getElementById('dlg-' + hashSlug)) openDlg(document.getElementById('dlg-' + hashSlug));

  /* ---- Careers: filter roles by location/team; "Apply" pre-fills the form; #slug pre-filters a location ---- */
  var jf = document.querySelector('[data-jobfilter]');
  if (jf) {
    var jl = jf.querySelector('[data-jf-loc]'), jd = jf.querySelector('[data-jf-dept]');
    var jobs = document.querySelectorAll('.rd-job'), jcount = document.querySelector('[data-jf-count]'), jempty = document.querySelector('[data-jf-empty]');
    var jrun = function () {
      var n = 0;
      jobs.forEach(function (j) {
        var hit = (jl.value === 'all' || j.getAttribute('data-loc') === jl.value) && (jd.value === 'all' || j.getAttribute('data-dept') === jd.value);
        j.hidden = !hit; if (hit) n++;
      });
      if (jcount) jcount.textContent = n + (n === 1 ? ' open role' : ' open roles');
      if (jempty) jempty.hidden = n > 0;
    };
    jl.addEventListener('change', jrun); jd.addEventListener('change', jrun);
    var jh = (location.hash || '').slice(1);
    if (jh && jl.querySelector('option[value="' + jh + '"]')) { jl.value = jh; jrun(); }
    document.querySelectorAll('[data-apply]').forEach(function (a) {
      a.addEventListener('click', function () {
        var v = a.getAttribute('data-apply').split('|');
        var al = document.querySelector('[data-apply-loc]'), ar = document.querySelector('[data-apply-role]');
        if (al) al.value = v[0]; if (ar) ar.value = v[1];
      });
    });
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
