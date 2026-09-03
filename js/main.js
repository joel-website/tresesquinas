/* Milonga Las Tres Esquinas — minimal vanilla JS.
   No dependencies. All behaviour degrades gracefully without JS. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Mobile navigation ---------------------------------- */
  (function nav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav]');
    if (!toggle || !menu) return;

    var desktop = window.matchMedia('(min-width: 901px)');

    function setOpen(open) {
      menu.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(menu.dataset.open !== 'true');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.dataset.open === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    desktop.addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  })();

  /* ---------- 2. Scroll reveal ------------------------------------- */
  (function reveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.classList.add('is-in');
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  })();

  /* ---------- 3. Privacy Policy gate on ticket buttons ----------- */
  (function ticketGate() {
    var buttons = document.querySelectorAll('[data-checkout]');

    buttons.forEach(function (btn) {
      var boxId = btn.getAttribute('aria-controls');
      var box = boxId && document.getElementById(boxId);
      var hintId = box && box.getAttribute('aria-describedby');
      var hint = hintId && document.getElementById(hintId);
      if (!box) return;

      function sync() {
        var ok = box.checked;
        btn.disabled = !ok;
        if (hint) {
          hint.textContent = ok
            ? 'Ready. This opens the ticket checkout.'
            : 'Accept the Privacy Policy to continue.';
        }
      }

      box.addEventListener('change', sync);
      sync();

      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var url = btn.getAttribute('data-checkout-url');
        if (url && url !== '#') {
          window.location.href = url;
        }
      });
    });
  })();

  /* ---------- 4. Sticky mobile CTA ------------------------------- */
  (function stickyCta() {
    var bar = document.querySelector('[data-sticky-cta]');
    var hero = document.querySelector('.hero');
    var tickets = document.getElementById('tickets');
    var tail = document.querySelector('.final-cta');
    if (!bar || !hero || !tickets || !('IntersectionObserver' in window)) return;

    var link = bar.querySelector('a');
    var pastHero = false;
    var nearTickets = false;

    function update() {
      var show = pastHero && !nearTickets;
      bar.dataset.visible = String(show);
      bar.setAttribute('aria-hidden', String(!show));
      if (link) link.tabIndex = show ? 0 : -1;
    }

    new IntersectionObserver(
      function (e) {
        pastHero = !e[0].isIntersecting;
        update();
      },
      { threshold: 0 }
    ).observe(hero);

    // Hide the bar once the reader reaches the tickets / final CTA area —
    // they already have the CTAs in view there.
    var atZone = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          en.target.dataset.inview = String(en.isIntersecting);
        });
        nearTickets =
          tickets.dataset.inview === 'true' ||
          (tail && tail.dataset.inview === 'true');
        update();
      },
      { threshold: 0 }
    );
    atZone.observe(tickets);
    if (tail) atZone.observe(tail);
  })();

  /* ---------- 4b. Hero slideshow -------------------------------- */
  (function heroSlides() {
    var root = document.querySelector('[data-hero-slides]');
    if (!root) return;

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero__slide'));
    if (slides.length < 2 || reduceMotion) return;

    var video = root.querySelector('[data-hero-video]');
    var HOLD = 7000; // image slides stay ~7s
    var HOLD_VIDEO = 10000; // the venue video slide stays ~10s
    var i = slides.indexOf(root.querySelector('.hero__slide.is-active'));
    if (i < 0) i = 0;
    var timer;

    function playCurrentVideo() {
      if (!video || !slides[i].contains(video)) return;
      if (video.preload === 'none') video.preload = 'auto';
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    function show(next) {
      slides[i].classList.remove('is-active');
      if (video && slides[i].contains(video)) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (e) {}
      }
      i = next;
      slides[i].classList.add('is-active');
      playCurrentVideo();
    }

    function schedule() {
      clearTimeout(timer);
      var hold = video && slides[i].contains(video) ? HOLD_VIDEO : HOLD;
      timer = setTimeout(function () {
        show((i + 1) % slides.length);
        schedule();
      }, hold);
    }

    function start() {
      playCurrentVideo();
      if (timer) return;
      schedule();
    }

    function stop() {
      clearTimeout(timer);
      timer = null;
      if (video) video.pause();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (e) {
          if (e[0].isIntersecting) start();
          else stop();
        },
        { threshold: 0 }
      ).observe(root);
    } else {
      start();
    }
  })();

  /* ---------- 5. Venue carousel (video + parking photo) ---------- */
  (function carousel() {
    var root = document.querySelector('[data-carousel]');
    if (!root) return;
    var track = root.querySelector('[data-carousel-track]');
    var dots = Array.prototype.slice.call(
      root.querySelectorAll('[data-carousel-dots] button')
    );
    var video = root.querySelector('[data-venue-video]');
    if (!track || dots.length < 2) return;

    var onScreen = false;

    // With reduced motion we do not autoplay. Show controls and the first
    // frame instead so the clip is still reachable.
    if (reduceMotion && video) {
      video.autoplay = false;
      video.pause();
      video.controls = true;
      video.preload = 'metadata';
    }

    function currentIndex() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }

    function playVideo() {
      if (!video || !onScreen || reduceMotion) return;
      if (video.preload === 'none') video.preload = 'metadata';
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    function setActive(i) {
      dots.forEach(function (d, di) {
        d.setAttribute('aria-current', di === i ? 'true' : 'false');
      });
      if (video) {
        if (i === 0) playVideo();
        else video.pause();
      }
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        track.scrollTo({
          left: i * track.clientWidth,
          behavior: reduceMotion ? 'auto' : 'smooth',
        });
      });
    });

    var raf;
    track.addEventListener('scroll', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        setActive(currentIndex());
      });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (e) {
          onScreen = e[0].isIntersecting;
          if (onScreen && currentIndex() === 0) playVideo();
          else if (video) video.pause();
        },
        { threshold: 0.35 }
      ).observe(root);
    } else {
      onScreen = true;
    }

    setActive(0);
  })();
})();
