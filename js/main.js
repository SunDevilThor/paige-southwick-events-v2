/* ==========================================================================
   Paige Southwick Events
   Shared behaviour: navigation, scroll reveal, gallery lightbox, and the
   inquiry composer. No dependencies, no build step.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------------- header */

  var header = document.querySelector('.site-header');
  if (header) {
    var setStuck = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* ------------------------------------------------------------ mobile nav */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var closeNav = function () {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { closeNav(); }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) { closeNav(); }
    });
  }

  /* --------------------------------------------------------- scroll reveal */

  var revealables = document.querySelectorAll('.reveal');

  if (!revealables.length) {
    // nothing to do
  } else if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* --------------------------------------------------------------- footer */

  var yearSlot = document.querySelector('[data-year]');
  if (yearSlot) { yearSlot.textContent = String(new Date().getFullYear()); }

  /* ------------------------------------------------------------- lightbox */

  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var box = document.getElementById('lightbox');

  if (triggers.length && box) {
    var boxImg = box.querySelector('.lightbox__img');
    var boxCaption = box.querySelector('.lightbox__caption-text');
    var boxCount = box.querySelector('.lightbox__count');
    var btnClose = box.querySelector('.lightbox__close');
    var btnPrev = box.querySelector('.lightbox__prev');
    var btnNext = box.querySelector('.lightbox__next');
    var current = 0;
    var lastFocus = null;

    var render = function (index) {
      current = (index + triggers.length) % triggers.length;
      var trigger = triggers[current];
      var img = trigger.querySelector('img');
      boxImg.src = trigger.getAttribute('data-lightbox');
      boxImg.alt = img ? img.alt : '';
      boxCaption.textContent = trigger.getAttribute('data-caption') || (img ? img.alt : '');
      boxCount.textContent = (current + 1) + ' of ' + triggers.length;
    };

    var open = function (index) {
      lastFocus = document.activeElement;
      render(index);
      box.classList.add('is-open');
      document.body.classList.add('is-locked');
      box.setAttribute('aria-hidden', 'false');
      window.requestAnimationFrame(function () { box.classList.add('is-visible'); });
      btnClose.focus();
    };

    var close = function () {
      box.classList.remove('is-visible');
      var finish = function () {
        box.classList.remove('is-open');
        box.setAttribute('aria-hidden', 'true');
        boxImg.removeAttribute('src');
        document.body.classList.remove('is-locked');
        if (lastFocus) { lastFocus.focus(); }
      };
      if (reduceMotion.matches) { finish(); } else { window.setTimeout(finish, 240); }
    };

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () { open(index); });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { render(current - 1); });
    btnNext.addEventListener('click', function () { render(current + 1); });

    box.addEventListener('click', function (event) {
      if (event.target === box || event.target.classList.contains('lightbox__figure')) {
        close();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (!box.classList.contains('is-open')) { return; }
      if (event.key === 'Escape') { close(); }
      if (event.key === 'ArrowLeft') { render(current - 1); }
      if (event.key === 'ArrowRight') { render(current + 1); }
      if (event.key === 'Tab') {
        // keep focus inside the dialog
        var focusable = [btnClose, btnPrev, btnNext];
        var idx = focusable.indexOf(document.activeElement);
        event.preventDefault();
        var next = event.shiftKey ? idx - 1 : idx + 1;
        focusable[(next + focusable.length) % focusable.length].focus();
      }
    });

    // Touch swipe
    var startX = 0, startY = 0;
    box.addEventListener('touchstart', function (event) {
      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    }, { passive: true });

    box.addEventListener('touchend', function (event) {
      var dx = event.changedTouches[0].clientX - startX;
      var dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        render(dx < 0 ? current + 1 : current - 1);
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------- inquiry composer */

  var composer = document.getElementById('inquiry-form');

  if (composer) {
    var recipient = composer.getAttribute('data-recipient');
    var preview = document.getElementById('inquiry-preview');

    // Preselect the package when arriving from a services page link
    var packageField = composer.querySelector('[name="package"]');
    if (packageField) {
      var slugs = {
        'full-service': 'Full Service Planning',
        'partial': 'Partial Planning',
        'day-of': 'Day Of Coordination'
      };
      var requested = new URLSearchParams(window.location.search).get('package');
      if (requested && slugs[requested]) {
        packageField.value = slugs[requested];
      }
    }

    var buildMailto = function () {
      var data = new FormData(composer);
      var name = (data.get('name') || '').toString().trim();
      var pkg = (data.get('package') || '').toString().trim();
      var date = (data.get('date') || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var venue = (data.get('venue') || '').toString().trim();
      var notes = (data.get('notes') || '').toString().trim();

      var subject = 'Wedding inquiry' + (name ? ' from ' + name : '');
      if (pkg) { subject += ', ' + pkg; }

      var lines = ['Hi Paige,', ''];
      lines.push('I would love to talk about my wedding.');
      lines.push('');
      if (name) { lines.push('Name: ' + name); }
      if (phone) { lines.push('Phone: ' + phone); }
      if (pkg) { lines.push('Package I am interested in: ' + pkg); }
      if (date) { lines.push('Wedding date: ' + date); }
      if (venue) { lines.push('Venue or location: ' + venue); }
      if (notes) { lines.push('', 'A little about the day:', notes); }
      lines.push('', 'Thank you,', name || '');

      return 'mailto:' + recipient +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    };

    var syncPreview = function () {
      if (preview) { preview.setAttribute('href', buildMailto()); }
    };

    composer.addEventListener('input', syncPreview);
    composer.addEventListener('change', syncPreview);
    syncPreview();

    composer.addEventListener('submit', function (event) {
      event.preventDefault();
      window.location.href = buildMailto();
    });
  }
}());
