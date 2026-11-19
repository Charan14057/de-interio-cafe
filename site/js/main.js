/* =========================================================
   De Interio Cafe — site script
   Everything except the Design Ideas page (js/design-ideas.js).
   Search for a heading below to jump to it.

   HOME ............ INTRO, HERO SLIDER, NAVIGATION, SECTION 2 – 12,
                     FINAL CTA + FOOTER
   CONTACT ......... CONTACT object (phones, email, address, Formspree)
   ABOUT ........... ABOUT — #/about
   SERVICES ........ SERVICES — #/services
   PORTFOLIO ....... PORTFOLIO — #/portfolio (PF project data, case-study dialog)
   LEGAL ........... TERMS & PRIVACY
   ROUTER .......... PAGES — page switching, titles, deep links
   TESTIMONIALS .... STORY SPOTLIGHT, THE WALL, STORY POP-UP (TPS data)
========================================================= */
(() => {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const zoomF = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;   /* 0.85 on tablet & desktop */
  const body = document.body;

  /* ---------------------------------------------------------
     INTRO — one orchestrated load sequence once the first photo is ready
  --------------------------------------------------------- */
  const firstImg = $('.slide img');
  let introDone = false;
  function reveal() {
    if (introDone) return;
    introDone = true;
    requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('is-loaded')));
    setTimeout(() => body.classList.remove('is-intro'), reduceMotion ? 0 : 3000);
  }
  /* the hero sequence starts the moment the logo entry opens its doors */
  if (window.__plDone) reveal();
  else addEventListener('pl:done', reveal, { once: true });
  setTimeout(() => { if (!document.getElementById('pl') || window.__plDone) reveal(); }, 6000);

  /* ---------------------------------------------------------
     HERO SLIDER
  --------------------------------------------------------- */
  const hero       = $('#home');
  const slidesWrap = $('#slides');
  const slides     = $$('.slide', slidesWrap);
  const tabs       = $$('.tab');
  const ghost      = $('#ghost');
  const ghostWord  = $('#ghostWord');
  const headline   = $('#headline');
  const lines      = $$('.line-inner', headline);
  const ledeText   = $('#ledeText');
  const fcBody     = $('#fcBody');
  const fcTitle    = $('#fcTitle');
  const fcRoom     = $('#fcRoom');
  const fcText     = $('#fcText');
  const fcNext     = $('#fcNext');
  const fcThumb    = $('#fcThumb');
  const nextBtn    = $('#nextBtn');
  const cCur       = $('#cCur');
  const progress   = $('#progress');
  const playToggle = $('#playToggle');
  const card       = $('#featureCard');
  const bar        = $('.hero-bar');

  const data = slides.map(s => ({
    name:   s.dataset.name,
    ghost:  s.dataset.ghost,
    accent: s.dataset.accent,
    h1a:    s.dataset.h1a,
    h1b:    s.dataset.h1b,
    lede:   s.dataset.lede,
    room:   s.dataset.room,
    note:   s.dataset.note,
    img:    s.querySelector('img')
  }));

  const DURATION = 7500;
  const total = slides.length;
  let index = 0;
  let timer = 0;
  let startedAt = 0;
  let remaining = DURATION;
  let paused = false;
  let userPaused = reduceMotion;
  let hoverPaused = false;
  let menuPaused = false;
  let introPaused = true;

  const pad = n => String(n + 1).padStart(2, '0');
  const srcOf = i => data[i].img.currentSrc || data[i].img.src;
  const escapeHTML = str => str.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  /* split a headline line into words so each can rise in on its own */
  function wordsHTML(text, start) {
    return text.trim().split(/\s+/).map((w, k) => `<span class="w" style="--wi:${start + k}">${escapeHTML(w)}</span>`).join(' ');
  }
  function paintChip() {}

  /* per-element swap helper: fade out → apply → fade in */
  const swapTimers = new WeakMap();
  function swap(el, apply, delay) {
    clearTimeout(swapTimers.get(el));
    el.classList.add('is-swapping');
    swapTimers.set(el, setTimeout(() => {
      apply();
      requestAnimationFrame(() => el.classList.remove('is-swapping'));
    }, reduceMotion ? 0 : delay));
  }

  /* headline: lines exit upward, new lines rise in from below */
  let headTimer = 0;
  function swapHeadline(i) {
    clearTimeout(headTimer);
    headline.classList.remove('is-pre');
    headline.classList.add('is-out');
    headTimer = setTimeout(() => {
      const n1 = data[i].h1a.trim().split(/\s+/).length;
      lines[0].innerHTML = wordsHTML(data[i].h1a, 0);
      lines[1].innerHTML = wordsHTML(data[i].h1b, n1);
      paintChip(i);
      headline.classList.remove('is-out');
      headline.classList.add('is-pre');
      void headline.offsetWidth;
      headline.classList.remove('is-pre');
    }, reduceMotion ? 0 : 640);
  }

  function paintStatic(i) {
    const next = (i + 1) % total;
    hero.style.setProperty('--accent', data[i].accent);
    cCur.textContent = pad(i);
    fcThumb.src = srcOf(next);
    nextBtn.setAttribute('aria-label', 'Show next: ' + data[next].name);
  }

  function go(i, dir) {
    i = (i + total) % total;
    if (i === index) { restartTimer(); return; }
    dir = dir || (i > index ? 1 : -1);

    slides.forEach(s => { if (s.classList.contains('is-prev')) s.classList.remove('is-prev'); });
    const old = slides[index];
    old.classList.remove('is-active', 'wipe-next', 'wipe-prev');
    old.classList.add('is-prev');
    tabs[index].setAttribute('aria-selected', 'false');
    tabs[index].tabIndex = -1;

    index = i;
    const cur = slides[i];
    cur.classList.remove('wipe-next', 'wipe-prev');
    void cur.offsetWidth;
    cur.classList.add('is-active', dir > 0 ? 'wipe-next' : 'wipe-prev');
    tabs[i].setAttribute('aria-selected', 'true');
    tabs[i].tabIndex = 0;

    paintStatic(i);
    swapHeadline(i);
    swap(ledeText, () => { ledeText.textContent = data[i].lede; }, 420);
    swap(ghostWord, () => { ghostWord.textContent = data[i].ghost; }, 420);
    swap(fcBody, () => {
      fcTitle.textContent = data[i].name;
      fcRoom.textContent  = data[i].room;
      fcText.textContent  = data[i].note;
      fcNext.textContent  = data[(i + 1) % total].name;
    }, 340);

    restartTimer();
  }

  /* when the wipe finishes, release the slide underneath */
  slides.forEach(s => s.addEventListener('animationend', e => {
    if (e.target !== s || !s.classList.contains('is-active')) return;
    slides.forEach(o => { if (o !== s) o.classList.remove('is-prev'); });
  }));

  function schedule(ms) {
    clearTimeout(timer);
    if (paused) return;
    startedAt = performance.now();
    remaining = ms;
    timer = setTimeout(() => go(index + 1, 1), ms);
  }
  function restartTimer() {
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = `fill ${DURATION}ms linear forwards`;
    progress.style.animationPlayState = paused ? 'paused' : 'running';
    remaining = DURATION;
    schedule(DURATION);
  }
  function updatePaused() {
    const shouldPause = userPaused || hoverPaused || menuPaused || introPaused || document.hidden;
    if (shouldPause === paused) return;
    paused = shouldPause;
    if (paused) {
      clearTimeout(timer);
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
      progress.style.animationPlayState = 'paused';
    } else {
      progress.style.animationPlayState = 'running';
      schedule(remaining);
    }
  }
  function setUserPaused(v) {
    userPaused = v;
    playToggle.setAttribute('aria-pressed', String(v));
    playToggle.setAttribute('aria-label', v ? 'Play slideshow' : 'Pause slideshow');
    updatePaused();
  }

  /* initial paint */
  paused = true;
  hero.style.setProperty('--accent', data[0].accent);
  paintChip(0);
  paintStatic(0);
  data[0].img.addEventListener('load', () => { if (index === 0) paintChip(0); });
  data.forEach((d, i) => d.img.addEventListener('load', () => {
    if (i === (index + 1) % total) fcThumb.src = srcOf(i);
  }));
  playToggle.setAttribute('aria-pressed', String(userPaused));
  playToggle.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  restartTimer();

  /* autoplay starts only after the curtain has lifted */
  new MutationObserver((_, obs) => {
    if (!body.classList.contains('is-loaded')) return;
    obs.disconnect();
    setTimeout(() => { introPaused = false; restartTimer(); paused = true; updatePaused(); }, reduceMotion ? 0 : 1200);
  }).observe(body, { attributes: true, attributeFilter: ['class'] });

  /* controls */
  tabs.forEach((tab, i) => tab.addEventListener('click', () => go(i)));
  $('#tabs').addEventListener('keydown', e => {
    const map = { ArrowRight: 'next', ArrowLeft: 'prev', Home: 'first', End: 'last' };
    const k = map[e.key];
    if (!k) return;
    e.preventDefault();
    const n = k === 'first' ? 0 : k === 'last' ? total - 1 : (index + (k === 'next' ? 1 : -1) + total) % total;
    go(n, k === 'prev' || (k === 'first' && n < index) ? -1 : 1);
    tabs[n].focus();
  });
  nextBtn.addEventListener('click', () => go(index + 1, 1));
  playToggle.addEventListener('click', () => setUserPaused(!userPaused));

  [card, bar].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hoverPaused = true; updatePaused(); } });
    el.addEventListener('pointerleave', () => { hoverPaused = false; updatePaused(); });
  });
  document.addEventListener('visibilitychange', updatePaused);

  /* swipe on touch */
  let touchX = null, touchY = null;
  hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4 && !e.target.closest('.tabs')) {
      go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
    touchX = touchY = null;
  }, { passive: true });

  /* ---------------------------------------------------------
     POINTER PARALLAX + LAMPLIGHT — rAF-lerped, transform-only
  --------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    const glow = $('#glow');
    let tx = 0, ty = 0, cx = 0, cy = 0;
    let gx = 0, gy = 0, gtx = 0, gty = 0;
    let raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      gx += (gtx - gx) * 0.12;
      gy += (gty - gy) * 0.12;
      slidesWrap.style.transform = `translate3d(${(cx * -14).toFixed(2)}px, ${(cy * -9).toFixed(2)}px, 0)`;
      ghost.style.transform      = `translate3d(${(cx * 28).toFixed(2)}px, ${(cy * 14).toFixed(2)}px, 0)`;
      glow.style.transform       = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      const moving = Math.abs(tx - cx) > 0.0015 || Math.abs(ty - cy) > 0.0015 || Math.abs(gtx - gx) > 0.5 || Math.abs(gty - gy) > 0.5;
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    const stage = $('.stage');
    hero.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      const z = zoomF();
      gtx = (e.clientX - r.left) / z;
      gty = (e.clientY - r.top) / z;
      if (!glow.classList.contains('is-on')) { gx = gtx; gy = gty; glow.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      tx = ty = 0;
      glow.classList.remove('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* ---------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------- */
  const navShell = $('#navShell');
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      navShell.classList.toggle('is-scrolled', window.scrollY > 24);
      scrollTicking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Design Ideas mega panel */
  const megaItem    = $('#megaItem');
  const megaTrigger = $('#megaTrigger');
  const mega        = $('#megaIdeas');
  let megaOpen = false, megaOpenedAt = 0, hoverTimer = 0;

  function positionMega() {
    const shell = navShell.getBoundingClientRect();
    const t = megaTrigger.getBoundingClientRect();
    const z = zoomF(), w = mega.offsetWidth * z;
    let left = t.left + t.width / 2 - shell.left - w / 2;
    left = Math.max(0, Math.min(left, shell.width - w));
    mega.style.left = (left / z) + 'px';
  }
  function setMega(open) {
    if (open === megaOpen) return;
    megaOpen = open;
    if (open) { positionMega(); megaOpenedAt = performance.now(); }
    mega.classList.toggle('is-open', open);
    megaTrigger.setAttribute('aria-expanded', String(open));
  }
  megaTrigger.addEventListener('click', () => {
    if (megaOpen && performance.now() - megaOpenedAt < 400) return;
    setMega(!megaOpen);
  });
  if (finePointer) {
    const openSoon  = () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => setMega(true), 70); };
    const closeSoon = () => { clearTimeout(hoverTimer); hoverTimer = setTimeout(() => setMega(false), 220); };
    megaItem.addEventListener('pointerenter', openSoon);
    megaItem.addEventListener('pointerleave', closeSoon);
    mega.addEventListener('pointerenter', () => clearTimeout(hoverTimer));
    mega.addEventListener('pointerleave', closeSoon);
  }
  const focusLeaves = e => {
    const to = e.relatedTarget;
    if (to && (mega.contains(to) || to === megaTrigger)) return;
    setMega(false);
  };
  mega.addEventListener('focusout', focusLeaves);
  megaTrigger.addEventListener('focusout', e => { if (megaOpen) focusLeaves(e); });
  document.addEventListener('pointerdown', e => { if (megaOpen && !navShell.contains(e.target)) setMega(false); });
  mega.addEventListener('click', e => { if (e.target.closest('a')) setMega(false); });

  /* mobile menu */
  const menuBtn = $('#menuBtn');
  const panel   = $('#mobilePanel');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.inert = !open;
    menuPaused = open;
    updatePaused();
  }
  menuBtn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  panel.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (megaOpen) {
      const hadFocus = mega.contains(document.activeElement);
      setMega(false);
      if (hadFocus) megaTrigger.focus();
    }
    if (body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
  });

  let resizeRaf = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      if (megaOpen) positionMega();
      if (DIC_VW() > 1020 && body.classList.contains('menu-open')) setMenu(false);
    });
  });

  /* ---------------------------------------------------------
     SECTION 2 — BRAND INTRODUCTION
  --------------------------------------------------------- */
  const intro       = $('#about');
  const introHead   = $('#introHead');
  const introMedia  = $('#introMedia');
  const mediaImgs   = $$('.media-img', introMedia);
  const mediaTag    = $('#mediaTag');
  const storyItems  = $$('.story-item', intro);
  const heroStage   = $('.stage');
  const heroContent = $('.hero-content');

  /* scroll reveal */
  const revealTargets = [introHead, introMedia, ...$$('.rv', intro)];
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });
  revealTargets.forEach(el => io.observe(el));
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    intro.classList.add('is-lit');
  }, { threshold: 0.15 }).observe(intro);

  /* count-up facts */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  /* rolling odometer counters */
  $$('.odo').forEach(el => {
    const digits = el.dataset.to.split('');
    el.textContent = '';
    digits.forEach((d, k) => {
      const col = document.createElement('span');
      col.className = 'odo-col';
      const strip = document.createElement('span');
      strip.className = 'odo-strip';
      strip.dataset.d = d;
      strip.style.transitionDelay = (k * 0.12 + 0.25) + 's';
      for (let n = 0; n <= 9; n++) { const sp = document.createElement('span'); sp.textContent = n; strip.appendChild(sp); }
      col.setAttribute('aria-hidden', 'true');
      col.appendChild(strip);
      el.appendChild(col);
    });
    const sr = document.createElement('span');   /* the rolling digits are hidden from screen readers; this reads the number */
    sr.className = 'sr'; sr.textContent = el.dataset.to;
    el.appendChild(sr);
  });
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countIO.unobserve(entry.target);
      $$('.odo-strip', entry.target).forEach(st => { st.style.transform = `translateY(-${st.dataset.d}em)`; });
    });
  }, { threshold: 0.4 });
  countIO.observe($('#introFacts'));
  io.observe($('#introFacts'));

  /* story accordion ↔ media */
  let tagTimer = 0;
  /* split panel copy into words for a soft cascade */
  $$('.story-panel p', intro).forEach(p => {
    const words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map((w, k) => `<span class="sw" style="--k:${k}">${escapeHTML(w)}</span>`).join(' ');
  });
  const STORY_DUR = 6500;
  let storyIndex = 0, storyTimer = 0, storyStart = 0, storyLeft = STORY_DUR;
  let storyHover = false, storyVisible = false, storyUser = reduceMotion, storyPaused = true;
  intro.style.setProperty('--story-dur', STORY_DUR + 'ms');

  function openStory(n) {
    const prev = storyIndex;
    storyItems.forEach((item, i) => {
      const open = i === n;
      item.classList.toggle('is-open', open);
      item.classList.remove('is-timing');
      $('.story-trigger', item).setAttribute('aria-expanded', String(open));
    });
    mediaImgs.forEach(img => {
      const k = +img.dataset.story;
      img.classList.toggle('was-active', k === prev && k !== n);
      img.classList.toggle('is-active', k === n);
    });
    storyIndex = n;
    clearTimeout(tagTimer);
    mediaTag.classList.add('is-swapping');
    tagTimer = setTimeout(() => {
      mediaTag.textContent = $('.st-title', storyItems[n]).textContent;
      mediaTag.classList.remove('is-swapping');
    }, reduceMotion ? 0 : 300);
    storyRestart();
  }
  function storySchedule(ms) {
    clearTimeout(storyTimer);
    if (storyPaused) return;
    storyStart = performance.now(); storyLeft = ms;
    storyTimer = setTimeout(() => openStory((storyIndex + 1) % storyItems.length), ms);
  }
  function storyRestart() {
    const item = storyItems[storyIndex];
    item.classList.remove('is-timing'); void item.offsetWidth; item.classList.add('is-timing');
    storyLeft = STORY_DUR; storySchedule(STORY_DUR);
  }
  function storySync() {
    const should = storyHover || !storyVisible || storyUser || document.hidden;
    intro.classList.toggle('is-story-paused', should);
    if (should === storyPaused) return;
    storyPaused = should;
    if (storyPaused) { clearTimeout(storyTimer); storyLeft = Math.max(0, storyLeft - (performance.now() - storyStart)); }
    else storySchedule(storyLeft);
  }
  storyItems.forEach((item, i) => {
    $('.story-trigger', item).addEventListener('click', () => {
      if (!item.classList.contains('is-open')) openStory(i);
    });
  });
  [$('.intro-story', intro), introMedia].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { storyHover = true; storySync(); } });
    el.addEventListener('pointerleave', () => { storyHover = false; storySync(); });
  });
  new IntersectionObserver(entries => { storyVisible = entries[0].isIntersecting; storySync(); }, { threshold: 0.35 }).observe(intro);
  document.addEventListener('visibilitychange', storySync);
  storyRestart();
  /* warm the other story images once the section is near */
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    mediaImgs.forEach(img => { img.loading = 'eager'; });
  }, { rootMargin: '600px 0px' }).observe(intro);

  /* optional studio film */
  const filmURL    = (intro.dataset.film || '').trim();
  const filmBtn    = $('#filmBtn');
  const filmDialog = $('#filmDialog');
  const filmVideo  = $('#filmVideo');
  if (filmURL && typeof filmDialog.showModal === 'function') {
    filmBtn.hidden = false;
    filmBtn.addEventListener('click', () => {
      if (!filmVideo.src) filmVideo.src = filmURL;
      filmDialog.showModal();
      filmVideo.play().catch(() => {});
    });
    const closeFilm = () => { filmVideo.pause(); if (filmDialog.open) filmDialog.close(); };
    $('#filmClose').addEventListener('click', closeFilm);
    filmDialog.addEventListener('click', e => { if (e.target === filmDialog) closeFilm(); });
    filmDialog.addEventListener('close', () => filmVideo.pause());
  }

  /* scroll-linked depth: hero recedes, section media drifts — transform/opacity only */
  const mediaParallax = $('#mediaParallax');
  const rings = $('#introRings');
  let depthTicking = false;
  function depth() {
    depthTicking = false;
    const vh = innerHeight;
    const y = scrollY;
    if (y < vh * 1.2) {
      const p = Math.min(1, Math.max(0, y / vh));
      heroStage.style.transform = `scale(${(1 - p * 0.06).toFixed(4)})`;
      heroContent.style.opacity = String(Math.max(0, 1 - p * 1.6));
    }
    const r = intro.getBoundingClientRect();
    if (r.top < vh && r.bottom > 0) {
      const m = introMedia.getBoundingClientRect();
      const mp = (m.top + m.height / 2 - vh / 2) / vh;
      mediaParallax.style.transform = `translate3d(0, ${(mp * -60).toFixed(1)}px, 0)`;
      rings.style.transform = `translate3d(0, ${(r.top * 0.12).toFixed(1)}px, 0) rotate(${(r.top * 0.01).toFixed(2)}deg)`;
    }
  }
  if (!reduceMotion && DIC_VW() > 918 && matchMedia('(hover: hover)').matches) {
    addEventListener('scroll', () => {
      if (!depthTicking) { depthTicking = true; requestAnimationFrame(depth); }
    }, { passive: true });
    depth();
  }

  /* nav scroll-spy */
  const spyLinks = $$('.nav-links a[href^="#"]');
  const spyIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      if (!spyLinks.some(a => a.getAttribute('href') === id)) return;
      spyLinks.forEach(a => {
        const on = a.getAttribute('href') === id;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  [hero, intro, $('#services')].forEach(s => spyIO.observe(s));


  /* ---------------------------------------------------------
     SECTION 3 — WHAT WE DO (expanding deck)
  --------------------------------------------------------- */
  const work = $('#services');
  const cards = $$('.card', work);
  const wide  = matchMedia('(hover: hover) and (min-width:834px), (hover: none) and (min-width:981px)');
  let cardHover = 0;

  function openCard(n) {
    cards.forEach((c, i) => {
      const on = i === n;
      c.classList.toggle('is-open', on);   /* every card's text is always readable by screen readers; opening is visual */
    });
  }
  cards.forEach((c, i) => {
    c.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse' || !wide.matches) return;
      clearTimeout(cardHover);
      cardHover = setTimeout(() => openCard(i), 60);
    });
    c.addEventListener('pointerleave', () => clearTimeout(cardHover));
    c.addEventListener('click', e => {
      if (e.target.closest('.card-cta')) return;
      openCard(i);
    });
    c.addEventListener('focus', () => { if (wide.matches) openCard(i); });
    c.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(i); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length;
        cards[n].focus();
      }
    });
  });
  $$('.rv', work).forEach(el => io.observe(el));
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    $$('.card-img', work).forEach(img => { img.loading = 'eager'; });
  }, { rootMargin: '600px 0px' }).observe(work);

  /* live tour: next card every 3.5s on desktop; pauses on hover / focus / off-screen */
  const TOUR = 3500;
  let tourIdx = 0, tourTimer = 0, tourHover = false, tourVis = false;
  work.style.setProperty('--tour', TOUR + 'ms');
  const tourOpen = n => {
    tourIdx = n;
    openCard(n);
    cards.forEach(c => c.classList.remove('is-touring'));
    const c = cards[n]; void c.offsetWidth; c.classList.add('is-touring');
  };
  const tourRun = () => {
    clearTimeout(tourTimer);
    const run = wide.matches && tourVis && !tourHover && !reduceMotion && !document.hidden;
    work.classList.toggle('is-tour-paused', !run);
    if (!run) return;
    tourTimer = setTimeout(() => { tourOpen((tourIdx + 1) % cards.length); tourRun(); }, TOUR);
  };
  cards.forEach((c, i) => {
    c.addEventListener('click', () => { tourIdx = i; });
    c.addEventListener('focus', () => { tourIdx = i; });
  });
  const deckEl = $('#deck');
  deckEl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { tourHover = true; tourRun(); } });
  deckEl.addEventListener('pointerleave', () => {
    tourHover = false;
    tourIdx = Math.max(0, cards.findIndex(c => c.classList.contains('is-open')));
    tourOpen(tourIdx); tourRun();
  });
  new IntersectionObserver(entries => {
    tourVis = entries[0].isIntersecting;
    if (tourVis) tourOpen(tourIdx);
    tourRun();
  }, { threshold: 0.4 }).observe(work);
  document.addEventListener('visibilitychange', tourRun);
  wide.addEventListener('change', tourRun);


  /* ---------------------------------------------------------
     SECTION 4 — FEATURED PROJECTS
  --------------------------------------------------------- */
  const pj      = $('#portfolio');
  const picks   = $$('.pj-pick', pj);
  const pjImgs  = { hero: $('#pjHeroImg'), wide: $('#pjWideImg'), small: $('#pjSmallImg') };
  const pjSwaps = $$('.pj-swap', pj);
  let pjIndex = 0;

  const pjSwapTimers = new WeakMap();
  function pjSwapText(el, apply) {
    clearTimeout(pjSwapTimers.get(el));
    el.classList.add('is-swapping');
    pjSwapTimers.set(el, setTimeout(() => {
      apply();
      requestAnimationFrame(() => el.classList.remove('is-swapping'));
    }, reduceMotion ? 0 : 320));
  }
  function pjSwapImg(img, src, alt) {
    if (img.getAttribute('src') === src) return;
    img.classList.remove('is-on');
    setTimeout(() => {
      img.src = src;
      img.alt = alt;
      const on = () => img.classList.add('is-on');
      if (img.complete && img.naturalWidth) on();
      else img.addEventListener('load', on, { once: true });
      setTimeout(on, 1200);
    }, reduceMotion ? 0 : 340);
  }

  function showProject(n) {
    if (n === pjIndex) return;
    const d = picks[n].dataset;
    picks.forEach((p, i) => {
      p.setAttribute('aria-selected', String(i === n));
      p.tabIndex = i === n ? 0 : -1;
    });
    pjIndex = n;

    const no = String(n + 1).padStart(2, '0');
    const [cardA, cardB] = d.card.split('|');
    const [q1, q2] = d.quote.split('|');

    $('#pjBadge').textContent = `${no} / ${d.type}`;
    pjSwapText($('#pjHeroName'), () => {
      $('#pjCity').textContent = d.city;
      $('#pjName').textContent = d.name;
    });
    pjSwapText($('#pjQuote'), () => { $('#pjQuote').innerHTML = ''; $('#pjQuote').append(q1, Object.assign(document.createElement('em'), { textContent: q2 })); });
    pjSwapText($('#pjGhost'), () => { $('#pjGhost').textContent = no; });
    pjSwapText($('#pjEyebrow'), () => { $('#pjEyebrow').textContent = `${d.type} · ${d.city}`; });
    pjSwapText($('#pjCardName'), () => { $('#pjCardName').innerHTML = ''; $('#pjCardName').append(cardA, Object.assign(document.createElement('em'), { textContent: cardB })); });
    pjSwapText($('#pjBlurb'), () => { $('#pjBlurb').textContent = d.blurb; });
    pjSwapText($('#pjFeeling'), () => { $('b', $('#pjFeeling')).textContent = d.feeling; });
    pjSwapText($('#pjMeta'), () => {
      $('#pjClient').textContent = d.client;
      $('#pjSpaces').textContent = d.spaces;
      $('#pjKind').textContent   = d.kind;
    });
    $('#pjView').href = d.href;
    $('#pjView').setAttribute('aria-label', 'View project: ' + d.name);
    $('#pjHeroLink').href = d.href;
    $('#pjHeroLink').setAttribute('aria-label', 'View project: ' + d.name);

    pjSwapImg(pjImgs.hero,  d.hero,  d.name + ' — main view');
    pjSwapImg(pjImgs.wide,  d.wide,  d.name + ' — interior view');
    pjSwapImg(pjImgs.small, d.small, d.name + ' — detail');
  }

  picks.forEach((p, i) => {
    p.addEventListener('click', () => showProject(i));
    p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && wide.matches) showProject(i); });
  });
  $('.pj-rail', pj).addEventListener('keydown', e => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const n = (pjIndex + step + picks.length) % picks.length;
    showProject(n);
    picks[n].focus();
  });

  /* warm the other projects' photos once the section is close */
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    picks.slice(1).forEach(p => {
      [p.dataset.hero, p.dataset.wide, p.dataset.small].forEach(src => { new Image().src = src; });
    });
  }, { rootMargin: '500px 0px' }).observe(pj);

  $$('.rv', pj).forEach(el => io.observe(el));
  spyIO.observe(pj);


  /* ---------------------------------------------------------
     SECTION 5 — DESIGN PHILOSOPHY
  --------------------------------------------------------- */
  const phil = $('#process');
  io.observe($('#bento'));
  io.observe($('#phHead'));
  $$('.rv', phil).forEach(el => io.observe(el));
  const gRows = $$('.g-row', phil);
  gRows.forEach(r => r.addEventListener('pointerenter', () => gRows.forEach(x => x.classList.toggle('is-hot', x === r))));
  $('.gantt', phil).addEventListener('pointerleave', () => gRows.forEach((x, i) => x.classList.toggle('is-hot', i === gRows.length - 1)));
  spyIO.observe(phil);

  /* execute slideshow — a new frame every 2 seconds while visible */
  (() => {
    const show = $('#exShow');
    if (!show) return;
    const sl = $$('.ex-slide', show), dots = $$('.ex-dots i', show), cap = $('#exCap');
    let k = 0, t = 0, vis = false;
    const step = () => {
      sl[k].classList.remove('is-on'); dots[k].classList.remove('is-on');
      k = (k + 1) % sl.length;
      sl[k].classList.add('is-on'); dots[k].classList.add('is-on');
      cap.classList.add('is-swapping');
      setTimeout(() => { cap.textContent = sl[k].dataset.cap; cap.classList.remove('is-swapping'); }, 300);
    };
    const run = () => { clearInterval(t); if (vis && !reduceMotion && !document.hidden) t = setInterval(step, 2000); };
    new IntersectionObserver(e => { vis = e[0].isIntersecting; if (vis) sl.forEach(i => { i.loading = 'eager'; }); run(); }, { threshold: 0.3 }).observe(show);
    document.addEventListener('visibilitychange', run);
  })();


  /* ---------------------------------------------------------
     SECTION 6 — RESIDENTIAL INTERIORS (auto tour)
  --------------------------------------------------------- */
  const res       = $('#residential');
  const resImgs   = $$('#resBg img', res);
  const resCards  = $$('.res-card', res);
  const resTrack  = $('#resTrack');
  const resPlay   = $('#resPlay');
  const RES_DUR   = 3500;
  let resIndex = 0, resTimer = 0, resStart = 0, resLeft = RES_DUR;
  let resUser = reduceMotion, resHover = false, resVisible = false, resPaused = true;
  res.style.setProperty('--res-dur', RES_DUR + 'ms');

  new IntersectionObserver(entries => {
    resVisible = entries[0].isIntersecting;
    if (resVisible && !res.classList.contains('is-in')) {
      res.classList.add('is-in');
      resImgs.forEach(img => { img.loading = 'eager'; });
    }
    resSync();
  }, { threshold: 0.35 }).observe(res);

  function resSchedule(ms) {
    clearTimeout(resTimer);
    if (resPaused) return;
    resStart = performance.now();
    resLeft = ms;
    resTimer = setTimeout(() => showRoom(resIndex + 1, true), ms);
  }
  function resRestart() {
    resCards.forEach(c => c.classList.remove('is-timing'));
    const c = resCards[resIndex];
    void c.offsetWidth;
    c.classList.add('is-timing');
    resLeft = RES_DUR;
    resSchedule(RES_DUR);
  }
  function resSync() {
    const should = resUser || resHover || !resVisible || document.hidden;
    res.classList.toggle('is-paused', should);
    if (should === resPaused) return;
    resPaused = should;
    if (resPaused) {
      clearTimeout(resTimer);
      resLeft = Math.max(0, resLeft - (performance.now() - resStart));
    } else {
      resSchedule(resLeft);
    }
  }

  function showRoom(n, scrollCard) {
    n = (n + resCards.length) % resCards.length;
    if (n !== resIndex) {
      resImgs.forEach((img, i) => img.classList.toggle('is-on', i === n));
      resCards.forEach((c, i) => c.setAttribute('aria-current', String(i === n)));
      const c = resCards[n];
      const name = $('.res-card-name', c).textContent;
      $('#resCount').textContent = String(n + 1).padStart(2, '0');
      $('#resProgress').style.transform = `scaleX(${((n + 1) / resCards.length).toFixed(3)})`;
      const feat = $('#resFeature');
      feat.classList.add('is-swapping');
      clearTimeout(feat._t);
      feat._t = setTimeout(() => {
        $('#resEyebrow').textContent = `${String(n + 1).padStart(2, '0')} — ${name}`;
        $('#resHead').textContent = c.dataset.title;
        $('#resDesc').textContent = c.dataset.desc;
        requestAnimationFrame(() => feat.classList.remove('is-swapping'));
      }, reduceMotion ? 0 : 320);
      resIndex = n;
    }
    if (scrollCard) {
      const left = resCards[n].parentElement.offsetLeft - 4;
      resTrack.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    resRestart();
  }

  resCards.forEach((c, i) => {
    c.addEventListener('click', () => showRoom(i, false));
    c.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') showRoom(i, false); });
    c.addEventListener('focus', () => showRoom(i, false));
  });
  $('#resPrev').addEventListener('click', () => showRoom(resIndex - 1, true));
  $('#resNext').addEventListener('click', () => showRoom(resIndex + 1, true));
  resPlay.addEventListener('click', () => {
    resUser = !resUser;
    resPlay.setAttribute('aria-pressed', String(resUser));
    resPlay.setAttribute('aria-label', resUser ? 'Play room tour' : 'Pause room tour');
    resSync();
  });
  resPlay.setAttribute('aria-pressed', String(resUser));
  const resRail = $('.res-rail', res);
  resRail.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { resHover = true; resSync(); } });
  resRail.addEventListener('pointerleave', () => { resHover = false; resSync(); });
  res.addEventListener('focusin', () => { resHover = true; resSync(); });
  res.addEventListener('focusout', e => { if (!res.contains(e.relatedTarget)) { resHover = false; resSync(); } });
  document.addEventListener('visibilitychange', resSync);
  resRestart();

  /* drag to scroll the rail with a mouse */
  let dragX = null, dragLeft = 0, dragMoved = false;
  resTrack.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    dragX = e.clientX; dragLeft = resTrack.scrollLeft; dragMoved = false;
  });
  addEventListener('pointermove', e => {
    if (dragX === null) return;
    const dx = (e.clientX - dragX) / zoomF();
    if (Math.abs(dx) > 4) { dragMoved = true; resTrack.style.scrollSnapType = 'none'; }
    resTrack.scrollLeft = dragLeft - dx;
  });
  addEventListener('pointerup', () => {
    if (dragX === null) return;
    dragX = null; resTrack.style.scrollSnapType = '';
  });
  resTrack.addEventListener('click', e => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);

  /* slow parallax on the room photo */
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    const resBg = $('#resBg');
    let rt = false;
    addEventListener('scroll', () => {
      if (rt) return; rt = true;
      requestAnimationFrame(() => {
        rt = false;
        const r = res.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        resBg.style.transform = `translate3d(0, ${(p * -50).toFixed(1)}px, 0)`;
      });
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     SECTION 7 — COMMERCIAL INTERIORS (gallery streams)
     JS-driven drift: eases to a crawl on hover, speeds up with
     page scroll; cards tilt toward the cursor with a light sweep.
  --------------------------------------------------------- */
  const com = $('#commercial');
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    com.classList.add('is-in');
    $$('img', com).forEach(img => { img.loading = 'eager'; });
  }, { threshold: 0.2 }).observe(com);
  $$('.rv', com).forEach(el => io.observe(el));

  $$('.mq-card', com).forEach(card => {
    const shine = document.createElement('span');
    shine.className = 'mq-shine';
    card.appendChild(shine);
  });

  if (!reduceMotion) {
    const rows = $$('.mq', com).map((el, i) => ({
      el, track: $('.mq-track', el),
      dir: el.classList.contains('is-right') ? 1 : -1,
      base: i === 0 ? 38 : 46,
      x: 0, factor: 1, target: 1, half: 0
    }));
    const measure = () => rows.forEach(r => { r.half = r.track.scrollWidth / 2; if (r.dir > 0 && r.x === 0) r.x = -r.half; });
    measure();
    addEventListener('resize', measure);
    addEventListener('load', measure);

    rows.forEach(r => {
      r.el.addEventListener('pointerenter', () => { r.target = .12; });
      r.el.addEventListener('pointerleave', () => { r.target = 1; });
    });

    let boost = 0, lastY = scrollY, comOn = false, last = performance.now(), rafId = 0;
    addEventListener('scroll', () => {
      const dy = scrollY - lastY; lastY = scrollY;
      boost = Math.max(-6, Math.min(6, boost + dy * 0.02));
    }, { passive: true });

    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      boost *= 0.92;
      rows.forEach(r => {
        if (!r.half) return;
        r.factor += (r.target - r.factor) * 0.08;
        r.x += r.dir * r.base * dt * (r.factor + Math.abs(boost));
        if (r.x <= -r.half) r.x += r.half;
        if (r.x >= 0) r.x -= r.half;
        r.track.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
      });
      rafId = comOn ? requestAnimationFrame(tick) : 0;
    };
    new IntersectionObserver(entries => {
      comOn = entries[0].isIntersecting;
      if (comOn && !rafId) { last = performance.now(); rafId = requestAnimationFrame(tick); }
    }).observe(com);

    if (finePointer) {
      $$('.mq-card', com).forEach(card => {
        card.addEventListener('pointermove', e => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          card.style.setProperty('--ry', ((px - .5) * 10).toFixed(2) + 'deg');
          card.style.setProperty('--rx', ((.5 - py) * 8).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      });
    }
  }

  /* quick-view pop-up for each commercial space */
  const COM_INFO = [
    { lead: 'Sheik Office · Ranipet, Vellore', text: 'Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency.', points: ['Ergonomic workstations', 'Suspended open shelving', 'Integrated storage'] },
    { lead: 'Sheik Office · Ranipet, Vellore', text: 'Collaborative desk arrangements encourage productivity and teamwork, framed by warm wood finishes and sleek black metal frameworks.', points: ['Collaborative desk layouts', 'Warm wood & black metal', 'Linear ceiling lighting'] },
    { lead: 'Sheik Office · Ranipet, Vellore', text: 'Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience of a professional yet inviting meeting room.', points: ['Conference seating', 'Linear ceiling lighting', 'Accent illumination'] },
    { lead: 'Sheik Office · Ranipet, Vellore', text: 'Neutral cabinetry and timber-slat partitions give individual workstations their own space within a comfortable, modern office.', points: ['Timber-slat partitions', 'Neutral cabinetry', 'Ergonomic seating'] },
    { lead: 'Sheik Office · Ranipet, Vellore', text: 'Warm wood finishes and neutral cabinetry fold storage and a pantry counter into the walls, keeping the workspace clear.', points: ['Integrated storage', 'Pantry counter', 'Warm wood finishes'] },
    { lead: 'Senthil Residence · Adyar, Chennai', text: 'An elegant coffered ceiling, acoustic equipment and instrument displays in a warm, wood-panelled studio.', points: ['Coffered ceiling', 'Acoustic equipment', 'Instrument displays'] },
    { lead: 'Senthil Residence · Adyar, Chennai', text: 'A beautifully arranged devotional space within the music studio, with a compact pooja cabinet and decorative lattice shutters.', points: ['Devotional space', 'Lattice-shuttered pooja cabinet', 'Warm ambient lighting'] }
  ];
  const qv = $('#comQV');
  const comCards = $$('.mq-card', com);
  const comNames = comCards.slice(0, 7).map(c => $('.mq-body b', c).textContent);
  const comImgsBig = comCards.slice(0, 7).map(c => $('img', c).getAttribute('src'));
  let qvIndex = 0, qvLast = null;

  function fillQV(n) {
    qvIndex = (n + 7) % 7;
    const info = COM_INFO[qvIndex];
    const img = $('.pop-media img', qv);
    img.classList.remove('is-in');
    img.src = comImgsBig[qvIndex];
    img.alt = comNames[qvIndex] + ' — ' + COM_INFO[qvIndex].lead;
    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('is-in')));
    $('.pop-kicker', qv).textContent = `Commercial · ${String(qvIndex + 1).padStart(2, '0')} / 07`;
    $('.pop-title', qv).textContent = comNames[qvIndex];
    $('.pop-lead', qv).textContent = info.lead;
    $('.pop-text', qv).textContent = info.text;
    $('.pop-points', qv).innerHTML = '';
    info.points.forEach(pt => { const li = document.createElement('li'); li.textContent = pt; $('.pop-points', qv).appendChild(li); });
  }
  function openQV(n, from) {
    qvLast = from || null;
    fillQV(n);
    if (typeof qv.showModal === 'function') qv.showModal(); else qv.setAttribute('open', '');
    body.classList.add('pop-open');
  }
  function closeQV() {
    qv.classList.add('is-closing');
    setTimeout(() => {
      qv.classList.remove('is-closing');
      if (qv.open) qv.close();
    }, reduceMotion ? 0 : 260);
  }
  qv.addEventListener('close', () => {
    body.classList.remove('pop-open');
    if (qvLast && !qvLast.getAttribute('aria-hidden')) qvLast.focus();
  });
  comCards.forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const n = parseInt($('.mq-no', card).textContent, 10) - 1;
      openQV(n, card);
    });
  });
  $('.pop-close', qv).addEventListener('click', closeQV);
  $('.pop-prev', qv).addEventListener('click', () => fillQV(qvIndex - 1));
  $('.pop-next', qv).addEventListener('click', () => fillQV(qvIndex + 1));
  qv.addEventListener('click', e => { if (e.target === qv) closeQV(); });
  qv.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') fillQV(qvIndex + 1);
    if (e.key === 'ArrowLeft') fillQV(qvIndex - 1);
    if (e.key === 'Escape') { e.preventDefault(); closeQV(); }
  });
  $('.pop-cta', qv).addEventListener('click', () => closeQV());

  /* ---------------------------------------------------------
     MARQUEE STRIPS — pause while off-screen
  --------------------------------------------------------- */
  $$('.strip').forEach(strip => {
    new IntersectionObserver(entries => strip.classList.toggle('is-off', !entries[0].isIntersecting)).observe(strip);
  });


  /* ---------------------------------------------------------
     SECTION 8 — OUR DESIGN PROCESS
  --------------------------------------------------------- */
  const dp      = $('#design-process');
  const dpSteps = $$('.dp-step', dp);
  const dpDots  = $$('#dpDots button', dp);
  let dpIndex = 0;
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    dp.classList.add('is-in');
  }, { threshold: 0.12 }).observe(dp);
  $$('.rv', dp).forEach(el => io.observe(el));

  function setDp(n) {
    if (n === dpIndex) return;
    dpIndex = n;
    dpSteps.forEach((s, i) => {
      s.classList.toggle('is-active', i === n);
      s.classList.toggle('is-done', i < n);
    });
    dpDots.forEach((d, i) => { if (i === n) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    $('#dpBar').style.transform = `scaleX(${((n + 1) / dpSteps.length).toFixed(3)})`;
    const no = $('#dpNowNo'), title = $('#dpNowTitle');
    [no, title].forEach(el => el.classList.add('is-swapping'));
    clearTimeout(no._t);
    no._t = setTimeout(() => {
      no.textContent = String(n + 1).padStart(2, '0');
      title.innerHTML = dpSteps[n].dataset.title;
      requestAnimationFrame(() => [no, title].forEach(el => el.classList.remove('is-swapping')));
    }, reduceMotion ? 0 : 260);
  }
  const dpIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setDp(+e.target.dataset.i); });
  }, { rootMargin: '-46% 0px -46% 0px' });
  dpSteps.forEach(s => dpIO.observe(s));
  dpDots.forEach((d, i) => d.addEventListener('click', () => {
    const r = dpSteps[i].getBoundingClientRect();
    scrollTo({ top: scrollY + r.top - innerHeight / 2 + r.height / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------------------------------------------------------
     SECTION 9 — WHY DE INTERIO CAFE (comparison)
  --------------------------------------------------------- */
  const why = $('#why-us');
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    why.classList.add('is-in');
  }, { threshold: 0.15 }).observe(why);
  $$('.rv', why).forEach(el => io.observe(el));
  /* hover a row → highlight it across all three columns */
  const vsCells = $$('.vs-cell[data-row]', why);
  vsCells.forEach(c => {
    c.addEventListener('pointerenter', () => vsCells.forEach(x => x.classList.toggle('is-hot', x.dataset.row === c.dataset.row)));
  });
  $('#vs').addEventListener('pointerleave', () => vsCells.forEach(x => x.classList.remove('is-hot')));

  /* ---------------------------------------------------------
     SECTION 10 — CLIENT TESTIMONIALS
  --------------------------------------------------------- */
  const tst = $('#testimonials');
  const TST = [{"n": "Ms. Roshini Krishnan", "p": "Villa interiors", "l": "Bengaluru", "q": "De Interio Cafe designed our independent villa with a perfect balance of modern luxury and nature-inspired openness.", "f": "De Interio Cafe designed our independent villa with a perfect balance of modern luxury and nature-inspired openness. The spacious layouts, earthy textures, natural lighting, and seamless indoor-outdoor connection created a home that feels elegant, peaceful, and refreshing every single day. Their attention to detail, premium finishes, and thoughtful planning transformed the entire space into a warm and timeless living experience that truly exceeded our expectations.", "s": "Elegant, peaceful, and refreshing every single day.", "img": "images/projects/mukundhan/mukundhan-06.webp", "ph": "Mukundhan Residence · Keelkattalai", "m": "RK"}, {"n": "Mr. Arun Prakash", "p": "Home interiors", "l": "Chennai", "q": "De Interio Cafe designed our home with exceptional attention to detail. The spaces are both functional and stunning. Highly recommended!", "f": "De Interio Cafe designed our home with exceptional attention to detail. The spaces are both functional and stunning. Highly recommended!", "s": "Both functional and stunning.", "img": "images/projects/saveetha/saveetha-05.webp", "ph": "Saveetha Residence · Keelkattalai", "m": "AP"}, {"n": "Mrs. Nandhini Ramesh", "p": "Interiors", "l": "Bengaluru", "q": "They truly understood our vision and brought it to life beautifully. The team was professional, creative, and a pleasure to work with.", "f": "They truly understood our vision and brought it to life beautifully. The team was professional, creative, and a pleasure to work with.", "s": "Professional, creative, and a pleasure to work with.", "img": "images/projects/varun/varun-03.webp", "ph": "Varun Residence · Bengaluru", "m": "NR"}, {"n": "Mr. Vignesh S", "p": "Home interiors", "l": "Erode", "q": "From concept to execution, everything was seamless. Our home looks elegant, comfortable, and timeless. Thank you for the amazing work!", "f": "From concept to execution, everything was seamless. Our home looks elegant, comfortable, and timeless. Thank you for the amazing work!", "s": "Elegant, comfortable, and timeless.", "img": "images/projects/fayyaz/fayyaz-12.webp", "ph": "Fayyaz Manzil · Velachery", "m": "VS"}, {"n": "Dr. Kavya Balaji", "p": "Home interiors", "l": "Vellore", "q": "The design, the quality, and the finishing — everything exceeded our expectations. De Interio Cafe made our dream home a reality.", "f": "The design, the quality, and the finishing — everything exceeded our expectations. De Interio Cafe made our dream home a reality.", "s": "Everything exceeded our expectations.", "img": "images/projects/navin-2/navin-2-28.webp", "ph": "Navin Residence — Phase 2 · Katpadi", "m": "KB"}, {"n": "Mr. Harish Kumar", "p": "Villa interiors", "l": "Pondicherry", "q": "We loved the way natural light and space were blended in our villa. It feels peaceful, modern, and uniquely ours.", "f": "We loved the way natural light and space were blended in our villa. It feels peaceful, modern, and uniquely ours.", "s": "Peaceful, modern, and uniquely ours.", "img": "images/projects/fayyaz/fayyaz-09.webp", "ph": "Fayyaz Manzil · Velachery", "m": "HK"}, {"n": "Ms. Divya Suresh", "p": "Home interiors", "l": "Bengaluru", "q": "Their creativity and design sense are outstanding. Every corner of our home feels thoughtfully designed and so inviting.", "f": "Their creativity and design sense are outstanding. Every corner of our home feels thoughtfully designed and so inviting.", "s": "Every corner of our home feels thoughtfully designed.", "img": "images/projects/nihitha/nihitha-09.webp", "ph": "Nihitha Sinha Residence · Bengaluru", "m": "DS"}, {"n": "Dr. Sridhar Rajan", "p": "Interiors", "l": "Chennai", "q": "A wonderful experience working with such a dedicated team. They delivered beyond what we imagined. Truly happy with the outcome!", "f": "A wonderful experience working with such a dedicated team. They delivered beyond what we imagined. Truly happy with the outcome!", "s": "They delivered beyond what we imagined.", "img": "images/projects/mukundhan/mukundhan-08.webp", "ph": "Mukundhan Residence · Keelkattalai", "m": "SR"}, {"n": "Mrs. Meera Krishnan", "p": "Home interiors", "l": "Erode", "q": "The team’s professionalism and passion for design reflect in their work. Our home is beautiful and practical — just the way we wanted.", "f": "The team’s professionalism and passion for design reflect in their work. Our home is beautiful and practical — just the way we wanted.", "s": "Beautiful and practical — just the way we wanted.", "img": "images/projects/karthik/karthik-01.webp", "ph": "Karthik Residence · Erode", "m": "MK"}, {"n": "Mr. Aravind Kumar", "p": "Home interiors", "l": "Chennai", "q": "A fantastic experience from start to finish.", "f": "A fantastic experience from start to finish. The team understood our requirements perfectly and transformed our home beautifully. We absolutely loved the final outcome!", "s": "We absolutely loved the final outcome!", "img": "images/projects/venkateswara/venkateswara-01.webp", "ph": "Venkateswara Rao Residence · Ponmar", "m": "AK"}, {"n": "Mrs. Priya Narayanan", "p": "Kitchen & living", "l": "Vellore", "q": "Excellent craftsmanship and attention to detail throughout the project.", "f": "Excellent craftsmanship and attention to detail throughout the project. Our modular kitchen and living room turned out beautifully. Truly satisfied with their work!", "s": "Excellent craftsmanship and attention to detail.", "img": "images/projects/navin-2/navin-2-11.webp", "ph": "Navin Residence — Phase 2 · Katpadi", "m": "PN"}, {"n": "Mr. Karthik Rajan", "p": "Interiors", "l": "Ranipet", "q": "Very professional and supportive throughout the entire process.", "f": "Very professional and supportive throughout the entire process. They brought our ideas to life with beautiful designs and quality finishes. Highly recommended!", "s": "Beautiful designs and quality finishes.", "img": "images/projects/sandhya/sandhya-01.webp", "ph": "Sandhya Residence · Katpadi", "m": "KR"}, {"n": "Dr. Meenakshi Sundaram", "p": "Home interiors", "l": "Katpadi", "q": "Wonderful experience working with De Interio Cafe.", "f": "Wonderful experience working with De Interio Cafe. Their thoughtful designs, material choices and dedication made our dream home exactly how we imagined!", "s": "Exactly how we imagined!", "img": "images/projects/kalpana-2/kalpana-2-01.webp", "ph": "Kalpana Residence — Phase 2 · Katpadi", "m": "MS"}, {"n": "Mrs. Lakshmi Prakash", "p": "Interiors", "l": "Chennai", "q": "From planning to final execution, everything was handled with great care.", "f": "From planning to final execution, everything was handled with great care. The interiors look elegant, functional and welcoming. We are extremely happy!", "s": "Elegant, functional and welcoming.", "img": "images/projects/senthil/senthil-04.webp", "ph": "Senthil Residence · Adyar", "m": "LP"}, {"n": "Mr. Suresh Babu", "p": "Interiors", "l": "Chennai", "q": "Impressive designs and excellent finishing across every room.", "f": "Impressive designs and excellent finishing across every room. The team listened patiently to our suggestions and delivered a beautiful, comfortable living space!", "s": "Impressive designs and excellent finishing.", "img": "images/projects/mukundhan/mukundhan-14.webp", "ph": "Mukundhan Residence · Keelkattalai", "m": "SB"}, {"n": "Ms. Divya Krishnan", "p": "Interiors", "l": "Vellore", "q": "A truly satisfying experience with a dedicated team.", "f": "A truly satisfying experience with a dedicated team. Their creativity, professionalism and commitment to quality exceeded our expectations. Absolutely delighted with the results!", "s": "Exceeded our expectations.", "img": "images/projects/navin-2/navin-2-21.webp", "ph": "Navin Residence — Phase 2 · Katpadi", "m": "DK"}];
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    tst.classList.add('is-in');
  }, { threshold: 0.12 }).observe(tst);
  new IntersectionObserver(entries => tst.classList.toggle('is-off', !entries[0].isIntersecting)).observe(tst);
  $$('.rv', tst).forEach(el => io.observe(el));

  const tPop = $('#tstPop');
  let tIndex = 0, tLast = null;
  function fillT(n) {
    tIndex = (n + TST.length) % TST.length;
    const t = TST[tIndex];
    const img = $('.pop-media img', tPop);
    img.classList.remove('is-in');
    img.src = t.img;
    img.alt = 'An interior from the De Interio Cafe portfolio';
    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('is-in')));
    $('.pop-kicker', tPop).textContent = `Client story · ${String(tIndex + 1).padStart(2, '0')} / ${String(TST.length).padStart(2, '0')}`;
    $('.pop-quote', tPop).textContent = '“' + t.q + '”';
    $('.pop-text', tPop).textContent = t.f;
    const tags = $('.pop-tags', tPop);
    tags.innerHTML = '';
    [t.p, t.l].forEach((label, k) => {
      const sp = document.createElement('span');
      sp.innerHTML = k ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
                       : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V10l7-6 7 6v11"/></svg>';
      sp.appendChild(document.createTextNode(label));
      tags.appendChild(sp);
    });
    $('.pop-who .mono', tPop).textContent = t.m;
    $('.pop-who b', tPop).textContent = t.n;
    $('.pop-who small', tPop).textContent = `${t.p} · ${t.l}`;
  }
  function openT(n, from) {
    tLast = from || null;
    fillT(n);
    if (typeof tPop.showModal === 'function') tPop.showModal(); else tPop.setAttribute('open', '');
    body.classList.add('pop-open');
  }
  function closeT() {
    tPop.classList.add('is-closing');
    setTimeout(() => { tPop.classList.remove('is-closing'); if (tPop.open) tPop.close(); }, reduceMotion ? 0 : 260);
  }
  tPop.addEventListener('close', () => {
    body.classList.remove('pop-open');
    if (tLast && !tLast.getAttribute('aria-hidden')) tLast.focus();
  });
  $$('[data-t]', tst).forEach(btn => btn.addEventListener('click', () => openT(+btn.dataset.t, btn)));
  $('.pop-close', tPop).addEventListener('click', closeT);
  $('.pop-prev', tPop).addEventListener('click', () => fillT(tIndex - 1));
  $('.pop-next', tPop).addEventListener('click', () => fillT(tIndex + 1));
  $('.pop-cta', tPop).addEventListener('click', closeT);
  tPop.addEventListener('click', e => { if (e.target === tPop) closeT(); });
  tPop.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') fillT(tIndex + 1);
    if (e.key === 'ArrowLeft') fillT(tIndex - 1);
    if (e.key === 'Escape') { e.preventDefault(); closeT(); }
  });
  [dp, why, tst].forEach(s => spyIO.observe(s));


  /* ---------------------------------------------------------
     SECTION 12 — RECENT SPACES (filters)
  --------------------------------------------------------- */
  const igPosts = $$('.ig-post');
  const igBtns  = $$('.ig-filters button');
  igBtns.forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    igBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    igPosts.forEach(p => {
      const show = f === 'All' || p.dataset.cat === f || p.dataset.platform === f;
      if (show && p.classList.contains('is-hidden')) {
        p.classList.remove('is-hidden');
        p.classList.add('is-enter');
        requestAnimationFrame(() => requestAnimationFrame(() => p.classList.remove('is-enter')));
      } else if (!show) {
        p.classList.add('is-hidden');
      }
    });
  }));

  /* ---------------------------------------------------------
     FINAL CTA + FOOTER
  --------------------------------------------------------- */
  const closing = $('#contact');
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    closing.classList.add('is-in');
  }, { threshold: 0.2 }).observe(closing);
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    $('#footer').classList.add('is-in');
  }, { threshold: 0.3 }).observe($('#footer'));

  $('#ctaBook').addEventListener('click', e => {
    e.preventDefault();
    const form = $('#enquiry');
    form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => $('input', form).focus({ preventScroll: true }), reduceMotion ? 0 : 600);
  });

  /* quick enquiry → Formspree (sendEnquiry and CONTACT live in the contact module) */
  $('#enquiry').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = form.elements.name, phone = form.elements.phone, send = $('.cta-send', form), err = $('.cta-err', form);
    if (!name.value.trim()) { name.focus(); return; }
    if (phone.value.replace(/\D/g, '').length < 10) { phone.focus(); return; }
    send.disabled = true; err.hidden = true;
    sendEnquiry(form, `Quick enquiry — ${form.elements.space.value} — ${name.value.trim()}`).then(ok => {
      if (ok) { form.classList.add('is-sent'); return; }
      send.disabled = false; err.hidden = false;
    });
  });

  /* live studio time (Chennai) */
  const footTime = $('#footTime');
  function tickTime() {
    const now = new Date();
    const t = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    const h = +now.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false });
    const day = now.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short' });
    const hrs = CONTACT.hours[['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day)];   /* same hours as the contact page */
    const open = !!hrs && h >= hrs[0] && h < hrs[1];
    footTime.classList.toggle('is-closed', !open);
    $('span', footTime).textContent = `Office · ${t} · ${open ? 'Open' : 'Closed'}`;
  }
  queueMicrotask(tickTime);   /* CONTACT is declared further down this file */
  setInterval(tickTime, 30000);
  $('#year').textContent = new Date().getFullYear();

  $('#toTop').addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  [$('#gallery'), closing].forEach(s => spyIO.observe(s));


  /* footer signature: size the full name to the content line, centred */
  const footWord = $('#footWord');
  /* the signature is placed by its real ink, not its text box:
     equal margins left/right, and equal space above (from the
     social row) and below (to the bottom rule) */
  const footSign = footWord.parentElement;
  const fwA = $('span', footWord), fwB = $('em', footWord);
  const fwBase = document.createElement('i');
  fwBase.className = 'fw-base'; fwBase.setAttribute('aria-hidden', 'true');
  footWord.appendChild(fwBase);
  const fwCtx = document.createElement('canvas').getContext('2d');
  const fwInk = fs => {
    const ff = getComputedStyle(footWord).fontFamily;
    if ('letterSpacing' in fwCtx) fwCtx.letterSpacing = (-0.035 * fs).toFixed(2) + 'px';
    fwCtx.font = `500 ${fs}px ${ff}`;
    const a = fwCtx.measureText(fwA.textContent);
    fwCtx.font = `italic 500 ${fs}px ${ff}`;
    const b = fwCtx.measureText(fwB.textContent);
    return {
      l: fwA.offsetLeft - a.actualBoundingBoxLeft,
      r: fwB.offsetLeft + b.actualBoundingBoxRight,
      asc: Math.max(a.actualBoundingBoxAscent, b.actualBoundingBoxAscent),
      desc: Math.max(a.actualBoundingBoxDescent, b.actualBoundingBoxDescent)
    };
  };
  const fitWord = () => {
    const box = footSign.clientWidth;
    if (!box) return;
    footWord.style.fontSize = '100px';
    let m = fwInk(100);
    /* the name spans exactly the navbar's length */
    const z = zoomF(), nav = navShell.getBoundingClientRect(), sign = footSign.getBoundingClientRect();
    const span = nav.width / z, start = (nav.left - sign.left) / z;
    const fs = 100 * span / (m.r - m.l);
    footWord.style.fontSize = fs.toFixed(2) + 'px';
    m = fwInk(fs);
    const mid = $('.foot-mid');
    const above = mid ? parseFloat(getComputedStyle(mid).paddingBottom) || 0 : 0;
    const gap = Math.max(28, fs * 0.2);                    /* visible space above the letters */
    const topGap = Math.max(0, gap - above);
    const below = Math.max(8, fs * 0.045);                 /* the name rests close to the bottom rule */
    footSign.style.height = (topGap + m.asc + m.desc + below).toFixed(1) + 'px';
    footWord.style.top = (topGap + m.asc - fwBase.offsetTop).toFixed(1) + 'px';
    footWord.style.left = (start - m.l).toFixed(1) + 'px';
    /* lower half fades away: solid to the middle of the letters, gone by the bottom of the descender */
    const top = fwBase.offsetTop - m.asc, base = fwBase.offsetTop, bottom = base + m.desc;
    footWord.style.setProperty('--fw-a', (top + (base - top) * 0.46).toFixed(1) + 'px');
    footWord.style.setProperty('--fw-c', base.toFixed(1) + 'px');
    footWord.style.setProperty('--fw-b', bottom.toFixed(1) + 'px');
  };
  fitWord();
  addEventListener('resize', fitWord);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWord);



  /* =========================================================
     CONTACT — one place for every contact detail on the site.
     The contact page, footer, WhatsApp buttons and every enquiry
     form read from here.
  ========================================================= */
  const CONTACT = {
    phone: '+91 95000 78674',          /* shown on the page */
    tel: '+919500078674',              /* dialled */
    phone2: '+91 73053 12201', tel2: '+917305312201',   /* second line */
    whatsapp: '919500078674',          /* country code + number, digits only */
    email: 'mohanaraodeinteriocafe@gmail.com',
    address: ['No. 52, G-1, Jeyaraj Homes, 2nd Cross Street', 'Thirumalai Nagar Main Road, Perungudi', 'Chennai 600096'],
    city: 'Chennai',
    mapQuery: '52, G-1, Jeyaraj Homes, 2nd Cross Street, East Coast Rd, Thirumalai Nagar Annexe, Perungudi, Chennai, Tamil Nadu 600096',
    formspree: 'https://formspree.io/f/mkgewzeg',   /* every enquiry form posts here */
    timeZone: 'Asia/Kolkata',
    /* 24-hour opening times, Sunday first; null = closed / by appointment */
    hours: [null, [9, 19], [9, 19], [9, 19], [9, 19], [9, 19], [9, 19]]
  };
  const CT_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const ctFmtH = h => { const p = h >= 12 ? 'pm' : 'am', v = h % 12 || 12; return v + ' ' + p; };
  const esc = str => String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const ctVals = {
    phone: CONTACT.phone,
    whatsappLabel: CONTACT.phone,
    email: CONTACT.email,
    city: CONTACT.city,
    addressShort: 'Perungudi, ' + CONTACT.city,
    addressFull: CONTACT.address.join(', '),
    hoursShort: (() => {
      const open = CONTACT.hours.map((h, i) => h ? i : -1).filter(i => i >= 0);
      if (!open.length) return 'By appointment';
      const h = CONTACT.hours[open[0]];
      return CT_DAYS[open[0]].slice(0, 3) + ' – ' + CT_DAYS[open[open.length - 1]].slice(0, 3) + ' · ' + ctFmtH(h[0]) + ' – ' + ctFmtH(h[1]);
    })()
  };
  const ctHref = {
    tel: 'tel:' + CONTACT.tel,
    wa: 'https://wa.me/' + CONTACT.whatsapp,
    mail: 'mailto:' + CONTACT.email,
    map: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CONTACT.mapQuery)
  };
  $$('[data-ct]').forEach(el => {
    const k = el.dataset.ct;
    if (k === 'addressLines') { el.innerHTML = CONTACT.address.map(esc).join('<br>'); return; }
    if (ctVals[k] != null) el.textContent = ctVals[k];
  });
  $$('[data-ct-href]').forEach(el => { const h = ctHref[el.dataset.ctHref]; if (h) el.href = h; });
  /* the shared footer and closing card read from the same source */
  $$('a[href^="tel:"]:not([data-tel2])').forEach(a => { a.href = ctHref.tel; if (/^\+?[\d\s]+$/.test(a.textContent.trim())) a.textContent = CONTACT.phone; });
  $$('a[href^="mailto:"]:not([data-keep])').forEach(a => { a.href = ctHref.mail; if (a.textContent.includes('@')) a.innerHTML = esc(CONTACT.email).replace('@', '@<wbr>'); });
  $$('a[href^="https://wa.me/"]').forEach(a => { if (a.id !== 'ctSentWa') a.href = ctHref.wa; });
  const footAddr = $('.foot-contact p');
  if (footAddr) footAddr.innerHTML = CONTACT.address.map(esc).join('<br>');

  /* enquiries → Formspree (CONTACT.formspree). Resolves true when the message is delivered. */
  function sendEnquiry(form, subject, extra) {
    const data = new FormData(form);
    data.append('_subject', subject);
    data.append('page', location.href.split('#')[0] + (location.hash || ''));
    Object.entries(extra || {}).forEach(([k, v]) => { if (v) data.append(k, v); });
    const email = (data.get('email') || '').trim();
    if (email) data.append('_replyto', email);
    return fetch(CONTACT.formspree, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(r => r.ok)
      .catch(() => false);
  }

  const ctView = $('#contactView');
  const ctState = $('#ctState'), ctClock = $('#ctClock'), ctNext = $('#ctNext'), ctHours = $('#ctHours');
  ctHours.innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = CONTACT.hours[d];
    return `<li data-d="${d}"><b>${CT_DAYS[d]}</b><span>${h ? ctFmtH(h[0]) + ' – ' + ctFmtH(h[1]) : 'By appointment'}</span></li>`;
  }).join('');
  function ctTick() {
    const now = new Date();
    const parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: CONTACT.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(now).forEach(p => { parts[p.type] = p.value; });
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const hh = +parts.hour % 24, mm = +parts.minute;
    const today = CONTACT.hours[day];
    const open = !!today && hh >= today[0] && hh < today[1];
    ctState.classList.toggle('is-closed', !open);
    $('span', ctState).textContent = open ? 'Open now' : 'Closed now';
    ctClock.innerHTML = `${(hh % 12 || 12)}:${String(mm).padStart(2, '0')}<small>${hh >= 12 ? 'pm' : 'am'}</small>`;
    let next = '';
    if (open) next = `Closes at ${ctFmtH(today[1])} today`;
    else {
      for (let k = 0; k < 7; k++) {
        const d = (day + k) % 7, h = CONTACT.hours[d];
        if (!h || (k === 0 && hh >= h[0])) continue;
        next = `Opens ${k === 0 ? 'today' : k === 1 ? 'tomorrow' : 'on ' + CT_DAYS[d]} at ${ctFmtH(h[0])}`;
        break;
      }
    }
    ctNext.textContent = (next || 'By appointment') + ' · ' + CONTACT.city + ' time';
    $$('li', ctHours).forEach(li => li.classList.toggle('is-today', +li.dataset.d === day));
  }
  let ctTimer = 0, ctMapSet = false;
  function ctShow() {
    ctTick();
    clearInterval(ctTimer);
    ctTimer = setInterval(ctTick, 20000);
    if (!ctMapSet) {
      ctMapSet = true;
      const map = $('#ctMap');
      map.addEventListener('load', () => map.classList.add('is-ld'), { once: true });
      map.src = 'https://www.google.com/maps?q=' + encodeURIComponent(CONTACT.mapQuery) + '&z=15&output=embed';
    }
  }
  function ctHide() { clearInterval(ctTimer); }

  /* reveals */
  $$('.rv, .ct-head, .ct-form, .ct-faq-side', ctView).forEach(el => io.observe(el));

  /* copy to clipboard */
  ctView.addEventListener('click', e => {
    const b = e.target.closest('.ct-copy');
    if (!b) return;
    const text = ctVals[b.dataset.copy] || '';
    const done = () => {
      const label = $('span', b), was = label.textContent;
      b.classList.add('is-done'); label.textContent = 'Copied';
      clearTimeout(b._t);
      b._t = setTimeout(() => { b.classList.remove('is-done'); label.textContent = was === 'Copied' ? 'Copy' : was; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, done);
    else {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) { /* nothing else to try */ }
      ta.remove(); done();
    }
  });

  /* FAQ accordion: one answer open at a time */
  const ctQs = $$('.ct-q', ctView);
  ctQs.forEach(q => $('.ct-q-btn', q).addEventListener('click', () => {
    const open = !q.classList.contains('is-open');
    ctQs.forEach(o => { o.classList.remove('is-open'); $('.ct-q-btn', o).setAttribute('aria-expanded', 'false'); });
    if (open) { q.classList.add('is-open'); $('.ct-q-btn', q).setAttribute('aria-expanded', 'true'); }
  }));
  ctQs[0].classList.add('is-open');
  $('.ct-q-btn', ctQs[0]).setAttribute('aria-expanded', 'true');

  /* enquiry */
  const ctForm = $('#ctForm');
  const ctField = n => ctForm.elements[n];
  const ctMark = (input, bad) => { input.closest('.fld').classList.toggle('is-bad', bad); input.setAttribute('aria-invalid', String(bad)); };
  ['name', 'phone'].forEach(n => ctField(n).addEventListener('input', () => ctMark(ctField(n), false)));
  ctForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = ctField('name').value.trim(), phone = ctField('phone').value.trim();
    const badName = name.length < 2, badPhone = phone.replace(/\D/g, '').length < 8;
    ctMark(ctField('name'), badName); ctMark(ctField('phone'), badPhone);
    if (badName) { ctField('name').focus(); return; }
    if (badPhone) { ctField('phone').focus(); return; }
    const v = n => (ctField(n).value || '').trim();
    const lines = [
      `Hello De Interio Cafe, I'm ${name}.`,
      `Service: ${v('service')}`,
      v('city') && `City: ${v('city')}`,
      `Budget: ${v('budget')}` + (v('date') ? ` · Preferred date: ${v('date')}` : ''),
      v('message') && `Project details: ${v('message')}`,
      `Phone: ${phone}` + (v('email') ? ` · Email: ${v('email')}` : ''),
      `Best way to reach me: ${v('reach')}`
    ].filter(Boolean);
    const send = $('.ct-send', ctForm), fine = $('#ctFine');
    send.disabled = true; ctForm.classList.add('is-busy');
    sendEnquiry(ctForm, `Website enquiry — ${v('service')} — ${name}`).then(ok => {
      send.disabled = false; ctForm.classList.remove('is-busy');
      if (!ok) {
        fine.innerHTML = 'Sorry — the message did not go through. Please <a href="' + ctHref.wa + '?text=' + encodeURIComponent(lines.join('\n')) + '" target="_blank" rel="noopener">send it on WhatsApp</a> or call ' + esc(CONTACT.phone) + '.';
        fine.classList.add('is-bad');
        return;
      }
      fine.classList.remove('is-bad');
      $('#ctSentName').textContent = name.split(/\s+/)[0];
      $('#ctSentWa').href = ctHref.wa + '?text=' + encodeURIComponent(lines.join('\n'));
      ctForm.classList.add('is-sent');
      const top = ctForm.getBoundingClientRect().top;
      if (top < 0) ctForm.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
  $('#ctAgain').addEventListener('click', () => {
    ctForm.reset();
    ctForm.classList.remove('is-sent');
    setTimeout(() => ctField('name').focus({ preventScroll: true }), 400);
  });


  /* =========================================================
     ABOUT — #/about
  ========================================================= */
  const abView = $('#aboutView');
  const abPad = n => String(n).padStart(2, '0');
  const abAfterIntro = fn => { if (window.__plDone || !document.getElementById('pl')) fn(); else addEventListener('pl:done', fn, { once: true }); };
  const abRestart = el => { el.classList.remove('is-run'); void el.offsetWidth; el.classList.add('is-run'); };
  const AB_JR = [["2008", "June", "Founded in Chennai", "De Interio Cafe was founded in Chennai by Mohanarao DV to bridge the gap between design drafts and site execution."], ["2012", "October", "Workplaces &amp; commercial", "From homes into offices and commercial interiors — balancing workspace ergonomics with client-facing aesthetics."], ["2016", "March", "Joined Zenith77", "De Interio Cafe became a group brand of Zenith77 Multi Business Pvt. Ltd., strengthening material supply and execution across South India."], ["2019", "September", "300+ projects", "Crossed 300 completed residential, modular kitchen and commercial projects, built on trust and word of mouth."], ["2022", "January", "Kitchens &amp; renovation", "Modular kitchens, wardrobes and renovation grew into dedicated services alongside complete turnkey interiors."], ["2026", "Today", "500+ projects", "More than 500 projects completed, from Chennai to Vellore, Erode and Bengaluru — with careful planning and disciplined execution leading every one."]];
    const ST_DUR = 4200, JR_DUR = 2600, VM_DUR = 7000;
  let abLive = false;
  const mouseIn = (el, on, off) => {
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') on(); });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') off(); });
  };
  const pointerVars = (el, set) => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  }, { passive: true });
  const abTilt = (el, target, k) => {          /* smooth pointer values → --px/--py (or --tx/--ty) on target */
    if (!finePointer || reduceMotion) return;
    const [vx, vy] = target === el ? ['--tx', '--ty'] : ['--px', '--py'];
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      target.style.setProperty(vx, cx.toFixed(3)); target.style.setProperty(vy, cy.toFixed(3));
      raf = (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) ? requestAnimationFrame(loop) : 0;
    };
    pointerVars(el, (x, y) => { tx = x * 2 - 1; ty = y * 2 - 1; if (!raf) raf = requestAnimationFrame(loop); });
    el.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  };
  const abCountUp = (el, delay) => {
    const raw = el.dataset.hcount || el.dataset.count || '0', to = +raw;
    if (reduceMotion) { el.textContent = String(to); return; }
    el.textContent = '0';
    setTimeout(() => {
      const t0 = performance.now(), dur = 1600;
      const step = now => {
        const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(to * k));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
  };
  const abOnce = (el, cls, threshold, fn) => new IntersectionObserver((e, o) => {
    if (!e[0].isIntersecting) return;
    o.disconnect(); el.classList.add(cls); if (fn) fn();
  }, { threshold }).observe(el);

  /* ---------- hero: the drafting table tilts with the pointer ---------- */
  const abStage = $('#abStage');
  abTilt(abStage, $('.ab-table', abView), .06);

  /* ---------- scroll parallax for marked layers ---------- */
  const abPar = $$('[data-abpar]', abView);
  let abParTick = false;
  const abParRun = () => {
    abParTick = false;
    if (abView.hidden || reduceMotion || !matchMedia('(hover: hover)').matches) return;
    const vh = innerHeight;
    /* read every box first, then write — no layout thrash */
    const rs = abPar.map(el => el.parentElement.getBoundingClientRect());
    abPar.forEach((el, i) => {
      const r = rs[i];
      if (r.bottom < 0 || r.top > vh) return;
      el.style.setProperty('--par', ((r.top + r.height / 2 - vh / 2) * -(+el.dataset.abpar)).toFixed(1) + 'px');
    });
  };
  addEventListener('scroll', () => { if (!abParTick && !abView.hidden) { abParTick = true; requestAnimationFrame(abParRun); } }, { passive: true });

  /* ---------- 01 story: draft-to-built panels ---------- */
  const spWrap = $('#stPanels'), spP = $$('.chp-p', abView);
  let stI = 0, stTimer = 0, stVis = false, stHover = false, abFlying = false;
  spWrap.style.setProperty('--st-dur', ST_DUR + 'ms');
  function stGo(n, focus) {
    stI = (n + spP.length) % spP.length;
    spP.forEach((p, i) => {
      const on = i === stI;
      p.classList.toggle('is-on', on);
      p.setAttribute('aria-selected', String(on));
      p.tabIndex = on ? 0 : -1;
    });
    const bar = $('.chp-prog i', spP[stI]);
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    if (focus) spP[stI].focus({ preventScroll: true });
    stQueue();
  }
  function stQueue() {
    clearTimeout(stTimer);
    const auto = !reduceMotion && stVis && !stHover && abLive && !abFlying;
    spWrap.classList.toggle('is-auto', auto);
    if (auto) stTimer = setTimeout(() => stGo(stI + 1), ST_DUR);
  }
  spP.forEach(p => {
    p.addEventListener('click', () => { if (+p.dataset.i !== stI) stGo(+p.dataset.i); });
    p.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stGo(+p.dataset.i); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stGo(stI + 1, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stGo(stI - 1, true); }
    });
  });
  mouseIn(spWrap, () => { stHover = true; spWrap.classList.add('is-paused'); clearTimeout(stTimer); },
                  () => { stHover = false; spWrap.classList.remove('is-paused'); stGo(stI); });
  new IntersectionObserver(e => { stVis = e[0].isIntersecting; if (stVis) spWrap.classList.add('is-in'); stQueue(); }, { threshold: .25 }).observe(spWrap);
  let stTouch = null;
  spWrap.addEventListener('touchstart', e => { stTouch = [e.touches[0].clientX, e.touches[0].clientY]; }, { passive: true });
  spWrap.addEventListener('touchend', e => {
    if (!stTouch) return;
    const dx = e.changedTouches[0].clientX - stTouch[0], dy = e.changedTouches[0].clientY - stTouch[1]; stTouch = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) stGo(stI + (dx < 0 ? 1 : -1));
  }, { passive: true });
  abOnce($('.ab-story', abView), 'is-lit', .12);

  /* measured in numbers: the tape pulls out of the reel; each figure lights up as the hook passes it */
  const abMeasure = $('#abMeasure'), msSlide = $('#msSlide'), msReel = $('#msReel'), msSpool = $('.ms-spool', abMeasure);
  const msItems = $$('.ms-i', abMeasure), msNums = $$('[data-count]', abMeasure);
  let msP = 0, msRaf = 0, msMarks = [];
  const msMeasure = () => {
    const t = $('.ms-tape', abMeasure).getBoundingClientRect();
    msMarks = msItems.map(it => t.width ? Math.max(.02, (it.getBoundingClientRect().left - t.left) / t.width) : 0);
  };
  const msSet = p => {
    msP = p;
    msSlide.style.transform = `translate3d(${((p - 1) * 100).toFixed(3)}%,0,0)`;
    msSpool.style.setProperty('--spin', (p * 1080).toFixed(1) + 'deg');
    msItems.forEach((it, i) => {
      const on = p >= msMarks[i];
      if (on && !it.classList.contains('is-on')) { it.classList.add('is-on'); abCountUp(msNums[i], 0); }
      if (!on && it.classList.contains('is-on')) { it.classList.remove('is-on'); msNums[i].textContent = '0'; }
    });
  };
  function msRun(to, done) {
    cancelAnimationFrame(msRaf);
    abMeasure.classList.remove('is-locked');
    const from = msP, dur = to > from ? 2100 : 650, t0 = performance.now();
    const ease = to > from ? (t => 1 - Math.pow(1 - t, 3.2)) : (t => t * t * t);
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      msSet(from + (to - from) * ease(k));
      if (k < 1) msRaf = requestAnimationFrame(step);
      else { if (to === 1) abMeasure.classList.add('is-locked'); if (done) done(); }
    };
    msRaf = requestAnimationFrame(step);
  }
  const msStart = () => {
    msMeasure();
    if (reduceMotion) { msMarks = msMarks.map(() => 0); msSet(1); abMeasure.classList.add('is-locked'); return; }
    msRun(1);
  };
  abOnce(abMeasure, 'is-in', .5, msStart);
  msReel.addEventListener('click', () => {
    if (reduceMotion) return;
    msMeasure();
    msRun(0, () => setTimeout(() => msRun(1), 160));
  });
  addEventListener('resize', () => { if (!abView.hidden && msP) msMeasure(); });

  /* ---------- hero prints: each one is a real design — tap it, the print lifts off the
     table to the middle of the screen, then the Design Ideas viewer opens on that design ---------- */
  const abPlane = $('#abPlane');
  let abPicking = false;
  function abPick(a, e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;      /* new tab / window: let the browser handle it */
    e.preventDefault();
    if (abPicking) return;
    const go = () => { location.href = a.href; };
    if (reduceMotion) { go(); return; }
    abPicking = true;
    const pic = $('img', a);
    const fly = document.createElement('div');
    fly.className = 'ab-fly';
    fly.setAttribute('aria-hidden', 'true');
    fly.innerHTML = `<img alt="" src="${pic.currentSrc || pic.src}"><span class="ab-fly-cap">${$('.ab-print-cap', a).innerHTML}</span>`;
    fly.style.cssText = 'left:0;top:0;width:100px;height:100px;visibility:hidden';
    body.appendChild(fly);
    const c = fly.getBoundingClientRect(), k = c.width / 100 || 1;     /* zoomed page vs viewport units */
    const box = r => ({ left: (r.left - c.left) / k + 'px', top: (r.top - c.top) / k + 'px', width: r.width / k + 'px', height: r.height / k + 'px' });
    const r0 = $('.ab-print-ph', a).getBoundingClientRect();
    const vw = innerWidth, vh = innerHeight, h = Math.min(vh * .62, vw * .7 * 1.25), w = h * .8;
    const from = box(r0), to = box({ left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h });
    Object.assign(fly.style, from, { visibility: '' });
    a.classList.add('is-gone');
    abStage.classList.add('is-picking');
    fly.animate([
      { ...from, transform: 'rotate(-3deg)', boxShadow: '0 0 0 6px #f4eee3, 0 30px 50px rgba(0,0,0,.45)' },
      { ...to, transform: 'rotate(0deg)', boxShadow: '0 0 0 10px #f4eee3, 0 60px 120px rgba(0,0,0,.6)' }
    ], { duration: 640, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' }).onfinish = () => setTimeout(go, 120);
  }
  $$('.ab-print', abView).forEach(a => a.addEventListener('click', e => abPick(a, e)));
  /* the table feels alive: a spotlight drifts from print to print until the pointer takes over */
  const abPrints = $$('.ab-print', abView);
  let abSpotI = -1, abSpotT = 0, abOnTable = false;
  const abSpot = () => {
    clearTimeout(abSpotT);
    abPrints.forEach(p => p.classList.remove('is-spot'));
    if (reduceMotion || abOnTable || abView.hidden || !abLive || scrollY > innerHeight * .8) { abSpotT = setTimeout(abSpot, 2200); return; }
    let n; do { n = Math.floor(Math.random() * abPrints.length); } while (n === abSpotI && abPrints.length > 1);
    abSpotI = n; abPrints[n].classList.add('is-spot');
    abSpotT = setTimeout(abSpot, 2200);
  };
  const abTable = $('.ab-table', abView);
  abTable.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse' || !e.target.closest('.ab-print')) return;
    abOnTable = true; abPlane.classList.add('is-focus'); abPrints.forEach(p => p.classList.remove('is-spot'));
  });
  abTable.addEventListener('pointerout', e => {
    if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.ab-print')) return;
    abOnTable = false; abPlane.classList.remove('is-focus');
  });
  /* coming back with the browser's back button: put the table back as it was */
  addEventListener('pageshow', () => {
    abPicking = false;
    $$('.ab-fly').forEach(f => f.remove());
    $$('.ab-print.is-gone', abView).forEach(a => a.classList.remove('is-gone'));
    abStage.classList.remove('is-picking');
  });
  addEventListener('hashchange', () => { if (!abPicking) return; abPicking = false; setTimeout(() => { $$('.ab-fly').forEach(f => f.remove()); $$('.ab-print.is-gone', abView).forEach(a => a.classList.remove('is-gone')); abStage.classList.remove('is-picking'); }, 900); });

  /* ---------- 02 journey: coverflow + a living timeline ----------
     the gold beam runs from this milestone to the next while the slide plays,
     the pin hops along the ruler and the ticks swell around it */
  const jrStage = $('#jrStage'), jrRuler = $('#jrRuler');
  const jvCards = $$('.jv-card', abView), jrNodes = $$('.jr-node', abView), jrStrips = $$('.jr-strip', abView);
  const jvGhost = $('#jvGhost'), jrPin = $('#jrPin'), jrSeg = $('#jrSeg'), jrWhen = $('#jrWhen'), jrLive = $('#jrLive');
  const jrTicks = $$('.jr-ticks i', abView);
  const JR_X = AB_JR.map(m => (m[0] - 2008) / (2026 - 2008) * 100);
  const JN = AB_JR.length;
  let jrI = 0, jrTimer = 0, jrVis = false, jrHover = false;
  jrStage.style.setProperty('--jr-dur', JR_DUR + 'ms');
  function jvLayout() {
    jvCards.forEach((c, i) => {
      let off = i - jrI;
      if (off > JN / 2) off -= JN;
      if (off < -JN / 2) off += JN;
      const ab = Math.abs(off);
      c.style.setProperty('--off', off);
      c.style.setProperty('--ab', ab);
      c.style.setProperty('--op', ab === 0 ? 1 : ab === 1 ? .85 : ab === 2 ? .35 : 0);
      c.style.setProperty('--br', ab === 0 ? 1 : ab === 1 ? .7 : .5);
      c.style.setProperty('--z', 10 - ab);
      c.style.pointerEvents = ab > 1 ? 'none' : '';
      c.classList.toggle('is-on', ab === 0);
    });
  }
  /* ticks swell like a magnifier around a point on the ruler (0–100) */
  const jrSwell = (at, scan) => {
    jrRuler.classList.toggle('is-scan', !!scan);
    jrTicks.forEach((t, i) => {
      const d = Math.abs(i / 72 * 100 - at), k = Math.max(0, 1 - d / 9);
      t.style.setProperty('--s', (1 + k * k * 2.2).toFixed(3));
      t.classList.toggle('is-hot', k > .35);
    });
  };
  function jrBeam() {
    const next = jrI + 1;
    jrSeg.style.setProperty('--s0', JR_X[jrI] + '%');
    jrSeg.style.setProperty('--sw', (next < JN ? JR_X[next] - JR_X[jrI] : 0) + '%');
    const bar = $('i', jrSeg);
    bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
  }
  function jrGo(n) {
    const prev = jrI;
    jrI = (n + JN) % JN;
    const m = AB_JR[jrI];
    jvLayout();
    m[0].split('').forEach((d, k) => jrStrips[k].style.setProperty('--d', d));
    jrNodes.forEach((b, i) => {
      b.classList.toggle('is-on', i === jrI); b.classList.toggle('is-past', i < jrI); b.classList.toggle('is-next', i === jrI + 1);
      b.setAttribute('aria-selected', String(i === jrI)); b.tabIndex = i === jrI ? 0 : -1;
    });
    jrRuler.style.setProperty('--p', JR_X[jrI] + '%');
    $('#jrCursorY').textContent = m[0];
    $('#jrCount').textContent = abPad(jrI + 1);
    if (prev !== jrI && !reduceMotion) { jrPin.classList.remove('is-hop'); void jrPin.offsetWidth; jrPin.classList.add('is-hop'); }
    jrSwell(JR_X[jrI]);
    jrBeam();
    [jrWhen, jvGhost].forEach(p => p.classList.add('is-swap'));
    clearTimeout(jrGo.t);
    jrGo.t = setTimeout(() => {
      jrWhen.innerHTML = `<span>${m[1]}</span><i></i><span>${abPad(jrI + 1)} / ${abPad(JN)}</span>`;
      jvGhost.textContent = m[0];
      [jrWhen, jvGhost].forEach(p => p.classList.remove('is-swap'));
    }, 220);
    jrLive.textContent = `${m[0]} — ${m[2].replace('&amp;', '&')}`;
    if (DIC_VW() < 650 && jrVis) jrRuler.scrollTo({ left: jrNodes[jrI].offsetLeft - 12, behavior: reduceMotion ? 'auto' : 'smooth' });
    abRestart($('#jrRing'));
    jrQueue();
  }
  function jrQueue() {
    clearTimeout(jrTimer);
    const auto = !reduceMotion && jrVis && !jrHover && abLive && !abFlying;
    jrStage.classList.toggle('is-run', auto);
    if (auto) jrTimer = setTimeout(() => jrGo(jrI + 1), JR_DUR);
  }
  jvCards.forEach((c, i) => c.addEventListener('click', () => jrGo(i === jrI ? jrI + 1 : i)));
  jrNodes.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); jrGo(+b.dataset.i); }));
  jrRuler.addEventListener('click', e => {
    if (DIC_VW() < 650) return;
    const r = jrRuler.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100;
    let best = 0; JR_X.forEach((v, i) => { if (Math.abs(v - x) < Math.abs(JR_X[best] - x)) best = i; });
    jrGo(best);
  });
  /* hovering the ruler: the magnifier follows the pointer */
  let jrScanRaf = 0, jrScanX = 0;
  jrRuler.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || DIC_VW() < 650) return;
    const r = jrRuler.getBoundingClientRect();
    jrScanX = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    if (!jrScanRaf) jrScanRaf = requestAnimationFrame(() => { jrScanRaf = 0; jrSwell(jrScanX, true); });
  }, { passive: true });
  jrRuler.addEventListener('pointerleave', () => { cancelAnimationFrame(jrScanRaf); jrScanRaf = 0; jrSwell(JR_X[jrI]); });
  $('#jrPrev').addEventListener('click', () => jrGo(jrI - 1));
  $('#jrNext').addEventListener('click', () => jrGo(jrI + 1));
  jrRuler.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault(); jrGo(jrI + (e.key === 'ArrowRight' ? 1 : -1)); jrNodes[jrI].focus();
  });
  mouseIn(jrStage, () => { jrHover = true; jrStage.classList.add('is-paused'); clearTimeout(jrTimer); },
                   () => { jrHover = false; jrStage.classList.remove('is-paused'); jrGo(jrI); });
  new IntersectionObserver(e => { jrVis = e[0].isIntersecting; jrQueue(); }, { threshold: .3 }).observe(jrStage);
  abOnce($('.ab-journey', abView), 'is-lit', .2);
  let jrTouch = null;
  const jvFlow = $('#jvFlow');
  jvFlow.addEventListener('touchstart', e => { jrTouch = e.touches[0].clientX; }, { passive: true });
  jvFlow.addEventListener('touchend', e => {
    if (jrTouch === null) return;
    const dx = e.changedTouches[0].clientX - jrTouch; jrTouch = null;
    if (Math.abs(dx) > 40) jrGo(jrI + (dx < 0 ? 1 : -1));
  }, { passive: true });
  jvLayout();
  jrSwell(0);

  /* ---------- 03 vision & mission ---------- */
  const vmTabs = $$('.vm-tab', abView), vmSlides = $$('.vm-slide', abView), vmPill = $('.vm-tab-pill', abView), vmProg = $('#vmProg');
  let vmI = 0, vmTimer = 0, vmUser = false, vmVis = false;
  vmProg.style.setProperty('--vm-dur', VM_DUR + 'ms');
  const vmPlace = () => {
    const t = vmTabs[vmI];
    vmPill.style.setProperty('--l', t.offsetLeft + 'px');
    vmPill.style.setProperty('--w', t.offsetWidth + 'px');
  };
  function vmGo(n) {
    vmI = (n + vmSlides.length) % vmSlides.length;
    vmTabs.forEach((t, i) => { t.classList.toggle('is-on', i === vmI); t.setAttribute('aria-selected', String(i === vmI)); });
    vmSlides.forEach((s, i) => { s.classList.toggle('is-on', i === vmI); s.setAttribute('aria-hidden', String(i !== vmI)); });
    vmPlace();
    vmQueue();
  }
  function vmQueue() {
    clearTimeout(vmTimer);
    vmProg.classList.remove('is-run');
    if (!reduceMotion && !vmUser && vmVis && abLive) { abRestart(vmProg); vmTimer = setTimeout(() => vmGo(vmI + 1), VM_DUR); }
  }
  vmTabs.forEach(t => t.addEventListener('click', () => { vmUser = true; vmGo(+t.dataset.i); }));
  new IntersectionObserver(e => { vmVis = e[0].isIntersecting; vmQueue(); }, { threshold: .35 }).observe($('#vmStage'));
  addEventListener('resize', () => { if (!abView.hidden) vmPlace(); });
  $$('.vm-media', abView).forEach(m => pointerVars(m, (x, y) => { m.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); m.style.setProperty('--my', (y * 100).toFixed(1) + '%'); }));

  /* ---------- 04 leadership: cover tilt + light ---------- */
  const fdCover = $('#fdCover');
  abTilt(fdCover, fdCover, .1);
  pointerVars(fdCover, (x, y) => { fdCover.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); fdCover.style.setProperty('--my', (y * 100).toFixed(1) + '%'); });

  /* ---------- closing band: a slow, drawn backdrop behind the contact card (about page only) ---------- */
  const abClosing = $('.closing');
  if (abClosing && !$('.ab-clo', abClosing)) {
    const big = ['Let’s design <em>your space</em>', 'Drawn to scale', 'Made in <em>Chennai</em>'].map(t => `<span>${t}<i>✦</i></span>`).join('');
    const small = ['Consultation', 'Design approval', 'Turnkey execution', 'Quality checks', 'Since 2008', 'Handover'].map(t => `<span>${t}<i></i></span>`).join('');
    abClosing.insertAdjacentHTML('afterbegin', `<div class="ab-clo" aria-hidden="true"><div class="ab-clo-dim"><b>Your space — let’s measure it</b></div><div class="ab-clo-row ab-clo-a">${big}${big}</div><div class="ab-clo-row ab-clo-b">${small}${small}${small}${small}</div></div>`);
  }

  /* ---------- reveals ---------- */
  $$('.rv, .ab-head', abView).forEach(el => io.observe(el));

  function abShow() {
    abLive = true;
    setTimeout(() => { abPlane.classList.add('ab-ready'); abSpot(); }, reduceMotion ? 0 : 2700);
    $$('[data-hcount]', abView).forEach((el, i) => abCountUp(el, 1100 + i * 120));
    stQueue(); jrGo(jrI); vmQueue();
    requestAnimationFrame(() => { vmPlace(); abParRun(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!abView.hidden) vmPlace(); });
  }
  function abHide() {
    abLive = false;
    [stTimer, jrTimer, vmTimer, abSpotT].forEach(clearTimeout);
  }
  document.addEventListener('visibilitychange', () => {
    if (abView.hidden) return;
    if (document.hidden) abHide(); else { abLive = true; stQueue(); jrQueue(); vmQueue(); }
  });


  /* =========================================================
     SERVICES — #/services
  ========================================================= */
  const svView = $('#svView');
  const SV_PH = [{"n": "01", "t": "Consult & Measure", "tag": "Steps 01–02", "s": 1, "e": 2, "d": "We understand your lifestyle, requirements, expectations and budget. Our team studies and measures the space.", "dl": ["Lifestyle & requirement discussion", "Expectations & budget", "Site study & measurement"], "hl": "One conversation · accurate site details", "lead": "Design team", "diary": ["Consultation — We understand your lifestyle, requirements, expectations and budget.", "Site Measurement — Our team studies and measures the space."]}, {"n": "02", "t": "Plan & Approve", "tag": "Steps 03–04", "s": 3, "e": 4, "d": "We develop functional layouts around your requirements. Concepts, materials and detailed drawings bring the space to life.", "dl": ["Functional space planning", "Design concepts & materials", "Design review &amp; approval"], "hl": "Approve the design before execution begins", "lead": "Designers & planners", "diary": ["Space Planning — We develop functional layouts around your requirements.", "Design & Planning — Concepts, materials and detailed drawings bring the space to life."]}, {"n": "03", "t": "Estimate & Select", "tag": "Steps 05–06", "s": 5, "e": 6, "d": "Clear scope and costing before execution begins. Choose finishes, colours, hardware and materials with our guidance.", "dl": ["Detailed estimate", "Clear scope & costing", "Finishes, colours & hardware"], "hl": "Clear scope and costing before execution begins", "lead": "Design team", "diary": ["Detailed Estimate — Clear scope and costing before execution begins.", "Material Selection — Choose finishes, colours, hardware and materials with our guidance."]}, {"n": "04", "t": "Execution", "tag": "Step 07", "s": 7, "e": 7, "d": "Our teams coordinate and execute the approved design.", "dl": ["Coordinated site work", "Approved design, executed", "Design · procurement · site"], "hl": "Our teams coordinate and execute the approved design", "lead": "Execution team", "diary": ["Execution — Our teams coordinate and execute the approved design."]}, {"n": "05", "t": "Quality Checks", "tag": "Step 08", "s": 8, "e": 8, "d": "Work is reviewed at important stages of execution.", "dl": ["Stage-wise reviews", "Finishing checks", "Material & workmanship review"], "hl": "Work is reviewed at important stages of execution", "lead": "Project management", "diary": ["Quality Checks — Work is reviewed at important stages of execution."]}, {"n": "06", "t": "Inspect & Hand over", "tag": "Steps 09–10", "s": 9, "e": 10, "d": "Finishing, functionality and pending details are inspected. Your completed space is handed over ready to enjoy.", "dl": ["Final inspection", "Pending details closed", "Handover, ready to enjoy"], "hl": "Your completed space, handed over ready to enjoy", "lead": "Project management", "diary": ["Final Inspection — Finishing, functionality and pending details are inspected.", "Handover — Your completed space is handed over ready to enjoy."]}];
  const SV_STAGES = [2, 7, 7, 8, 10];
  const SV_RES = {"tabs": ["full-home", "kitchens", "rooms"], "data": {"full-home": [{"id": "mukundhan", "t": "Mukundhan Residence", "loc": "Keelkattalai, Chennai", "client": "Mr. Mukundhan", "kind": "Completed project", "scope": "Complete home", "d": "A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting.", "alt": ["Pooja space with carved wooden pillars", "Floating TV unit", "Glossy modular kitchen with illuminated storage", "Marble-inspired flooring"], "mat": [["Ivory", "#efe7d8"], ["Sage green", "#9fae96"], ["Carved wood", "#6e4527"], ["Golden detail", "#c9a24e"]], "views": [["mukundhan-01", "Living Room"], ["mukundhan-05", "Living Room"], ["mukundhan-09", "Kitchen"], ["mukundhan-14", "Bedrooms"], ["mukundhan-02", "Pooja Area"]], "proj": "Mukundhan Residence"}, {"id": "fayyaz", "t": "Fayyaz Manzil", "loc": "Velachery, Chennai", "client": "Mrs. Fayyaz", "kind": "Completed project", "scope": "Complete home", "d": "A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents.", "alt": ["Plush emerald seating", "Graceful arched detailing", "Intricate ceiling patterns", "Elegant pendant lighting"], "mat": [["Ivory", "#efe8db"], ["Emerald green", "#1f5b45"], ["Warm wood", "#a0643a"], ["Golden accent", "#c9a35c"]], "views": [["fayyaz-01", "Living Room"], ["fayyaz-09", "Dining Area"], ["fayyaz-11", "Kitchen"], ["fayyaz-12", "Bedrooms"], ["fayyaz-04", "Foyer Area"]], "proj": "Fayyaz Manzil"}, {"id": "navin-2", "t": "Navin Residence — Phase 2", "loc": "Katpadi, Vellore", "client": "Mr. Navin", "kind": "Completed project", "scope": "Complete home", "d": "A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing.", "alt": ["Pooja unit with illuminated lattice shutters", "Floating TV console", "Curved wooden accents", "Fluted display cabinet"], "mat": [["Warm ivory", "#f1e9db"], ["Rich wood", "#a9692f"], ["Lattice glow", "#d4b277"], ["Mouldings", "#e9dccb"]], "views": [["navin-2-06", "Living Room"], ["navin-2-28", "Living Room"], ["navin-2-14", "Kitchen"], ["navin-2-25", "Bedrooms"], ["navin-2-09", "Pooja Area"]], "proj": "Navin Residence — Phase 2"}, {"id": "saveetha", "t": "Saveetha Residence", "loc": "Keelkattalai, Chennai", "client": "Mrs. Saveetha", "kind": "Completed project", "scope": "Complete home", "d": "A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details.", "alt": ["Intricately crafted wooden pooja unit", "Classic wall mouldings", "Taupe modular kitchen with integrated lighting", "Soft cove lighting"], "mat": [["Warm neutral", "#f1eadf"], ["Rich wood", "#5b3a26"], ["Taupe", "#a38f7c"], ["Cove glow", "#e5c27a"]], "views": [["saveetha-01", "Living Room"], ["saveetha-05", "Living Room"], ["saveetha-08", "Kitchen"], ["saveetha-12", "Bedrooms"], ["saveetha-02", "Pooja Area"]], "proj": "Saveetha Residence"}, {"id": "venkateswara", "t": "Venkateswara Rao Residence", "loc": "Ponmar, Chennai", "client": "Mr. Venkateswara Rao", "kind": "Completed project", "scope": "Complete home", "d": "A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting.", "alt": ["Corner pooja mandapam with lattice detailing", "Illuminated display niches", "Wood-grain modular kitchen", "Dark countertops"], "mat": [["Cream", "#efe6d6"], ["Wood grain", "#8a4f2a"], ["Dark countertop", "#2b2522"], ["Warm light", "#e3b866"]], "views": [["venkateswara-01", "Living Room"], ["venkateswara-05", "TV Units"], ["venkateswara-03", "Kitchen"], ["venkateswara-02", "Pooja Area"], ["venkateswara-08", "Wardrobes"]], "proj": "Venkateswara Rao Residence"}], "kitchens": [{"id": "k-mukundhan", "t": "Sage parallel kitchen", "loc": "Keelkattalai, Chennai", "client": "Mr. Mukundhan", "kind": "Completed project", "scope": "Modular kitchen", "d": "The modular kitchen combines glossy cabinetry, dark countertops and illuminated storage.", "alt": ["Pooja space with carved wooden pillars", "Floating TV unit", "Glossy modular kitchen with illuminated storage", "Marble-inspired flooring"], "mat": [["Ivory", "#efe7d8"], ["Sage green", "#9fae96"], ["Carved wood", "#6e4527"], ["Golden detail", "#c9a24e"]], "views": [["mukundhan-09", "Kitchen"], ["mukundhan-08", "Kitchen"], ["mukundhan-03", "Kitchen"]], "proj": "Mukundhan Residence"}, {"id": "k-navin-2", "t": "Lit U-shaped kitchen", "loc": "Katpadi, Vellore", "client": "Mr. Navin", "kind": "Completed project", "scope": "Modular kitchen", "d": "A modular kitchen with warm under-cabinet lighting, glass-fronted wall units and efficient storage.", "alt": ["Pooja unit with illuminated lattice shutters", "Floating TV console", "Curved wooden accents", "Fluted display cabinet"], "mat": [["Warm ivory", "#f1e9db"], ["Rich wood", "#a9692f"], ["Lattice glow", "#d4b277"], ["Mouldings", "#e9dccb"]], "views": [["navin-2-14", "Kitchen"], ["navin-2-11", "Kitchen"], ["navin-2-12", "Kitchen"], ["navin-2-15", "Kitchen"]], "proj": "Navin Residence — Phase 2"}, {"id": "k-saveetha", "t": "Taupe L-shaped kitchen", "loc": "Keelkattalai, Chennai", "client": "Mrs. Saveetha", "kind": "Completed project", "scope": "Modular kitchen", "d": "The modular kitchen combines elegant taupe cabinetry, streamlined storage and integrated lighting, creating a harmonious balance of heritage, comfort and contemporary functionality.", "alt": ["Intricately crafted wooden pooja unit", "Classic wall mouldings", "Taupe modular kitchen with integrated lighting", "Soft cove lighting"], "mat": [["Warm neutral", "#f1eadf"], ["Rich wood", "#5b3a26"], ["Taupe", "#a38f7c"], ["Cove glow", "#e5c27a"]], "views": [["saveetha-08", "Kitchen"], ["saveetha-03", "Kitchen"]], "proj": "Saveetha Residence"}, {"id": "k-venkateswara", "t": "Wood-grain kitchen", "loc": "Ponmar, Chennai", "client": "Mr. Venkateswara Rao", "kind": "Completed project", "scope": "Modular kitchen", "d": "The modular kitchen showcases wood-grain cabinetry, dark countertops and practical storage solutions.", "alt": ["Corner pooja mandapam with lattice detailing", "Illuminated display niches", "Wood-grain modular kitchen", "Dark countertops"], "mat": [["Cream", "#efe6d6"], ["Wood grain", "#8a4f2a"], ["Dark countertop", "#2b2522"], ["Warm light", "#e3b866"]], "views": [["venkateswara-03", "Kitchen"], ["venkateswara-04", "Kitchen"]], "proj": "Venkateswara Rao Residence"}, {"id": "k-kalpana-2", "t": "Kitchen & crockery unit", "loc": "Katpadi, Vellore", "client": "Mrs. Kalpana", "kind": "Completed project", "scope": "Modular kitchen", "d": "A compact modular kitchen with a matching crockery unit and practical storage.", "alt": ["Gold-accented partitions", "Fluted panelling", "Sage-green headboard", "Graceful curved detailing"], "mat": [["Soft neutral", "#f0ebe3"], ["Grey", "#8a8d8f"], ["Sage green", "#a7b498"], ["Gold accent", "#c8a45a"]], "views": [["kalpana-2-08", "Kitchen"], ["kalpana-2-09", "Kitchen"], ["kalpana-2-16", "Kitchen"], ["kalpana-2-10", "Crockery & Utility"]], "proj": "Kalpana Residence — Phase 2"}], "rooms": [{"id": "r-pooja", "t": "Lattice pooja unit", "loc": "Katpadi, Vellore", "client": "Mr. Navin", "kind": "Completed project", "scope": "Pooja unit", "d": "An intricately crafted pooja unit with illuminated lattice shutters adds spiritual warmth, while a stylish display cabinet with fluted panelling and soft lighting creates a harmonious balance of heritage, elegance and modern functionality.", "alt": ["Pooja unit with illuminated lattice shutters", "Floating TV console", "Curved wooden accents", "Fluted display cabinet"], "mat": [["Warm ivory", "#f1e9db"], ["Rich wood", "#a9692f"], ["Lattice glow", "#d4b277"], ["Mouldings", "#e9dccb"]], "views": [["navin-2-09", "Pooja Area"], ["navin-2-03", "Pooja Area"]], "proj": "Navin Residence — Phase 2"}, {"id": "r-mandapam", "t": "Corner pooja mandapam", "loc": "Ponmar, Chennai", "client": "Mr. Venkateswara Rao", "kind": "Completed project", "scope": "Pooja unit", "d": "A beautifully crafted corner pooja mandapam with intricate lattice detailing and warm illumination adds spiritual elegance.", "alt": ["Corner pooja mandapam with lattice detailing", "Illuminated display niches", "Wood-grain modular kitchen", "Dark countertops"], "mat": [["Cream", "#efe6d6"], ["Wood grain", "#8a4f2a"], ["Dark countertop", "#2b2522"], ["Warm light", "#e3b866"]], "views": [["venkateswara-02", "Pooja Area"]], "proj": "Venkateswara Rao Residence"}, {"id": "r-studio", "t": "Music studio", "loc": "Adyar, Chennai", "client": "Mr. Senthil", "kind": "Completed project", "scope": "Studio", "d": "The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space.", "alt": ["Music studio with coffered ceiling", "Instrument displays", "Wood-panelled wall with illuminated circular mirror", "Pooja cabinet with lattice shutters"], "mat": [["Cream", "#efe4d3"], ["Rich wood", "#6b4428"], ["Golden drape", "#d7b04c"], ["Teak panel", "#7e5536"]], "views": [["senthil-08", "Music Studio"], ["senthil-01", "Music Studio"], ["senthil-05", "Details & Décor"]], "proj": "Senthil Residence"}, {"id": "r-wardrobe", "t": "Full-height wardrobes", "loc": "Keelkattalai, Chennai", "client": "Mrs. Saveetha", "kind": "Completed project", "scope": "Wardrobes", "d": "Custom wardrobes and lofts built to measure, finished to match the rest of the home.", "alt": ["Intricately crafted wooden pooja unit", "Classic wall mouldings", "Taupe modular kitchen with integrated lighting", "Soft cove lighting"], "mat": [["Warm neutral", "#f1eadf"], ["Rich wood", "#5b3a26"], ["Taupe", "#a38f7c"], ["Cove glow", "#e5c27a"]], "views": [["saveetha-17", "Wardrobes"], ["saveetha-10", "Wardrobes"]], "proj": "Saveetha Residence"}, {"id": "r-kids", "t": "Kids’ study & bedroom", "loc": "Velachery, Chennai", "client": "Mrs. Fayyaz", "kind": "Completed project", "scope": "Kids room", "d": "A study corner with a window seat and open shelving, beside a bedroom in rich, playful colour.", "alt": ["Plush emerald seating", "Graceful arched detailing", "Intricate ceiling patterns", "Elegant pendant lighting"], "mat": [["Ivory", "#efe8db"], ["Emerald green", "#1f5b45"], ["Warm wood", "#a0643a"], ["Golden accent", "#c9a35c"]], "views": [["fayyaz-14", "Study Corner"], ["fayyaz-13", "Bedrooms"]], "proj": "Fayyaz Manzil"}]}};
  const SV_COM = {"tabs": ["workstations", "meeting", "storage", "studio"], "data": {"workstations": [{"id": "c-open", "t": "Open workstations", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Workstations", "d": "Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-01", "Workstations"], ["sheik-05", "Workstations"]], "proj": "Sheik Office"}, {"id": "c-team", "t": "Collaborative desks", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Workstations", "d": "Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-02", "Conference Room"], ["sheik-08", "Workstations"]], "proj": "Sheik Office"}, {"id": "c-focus", "t": "Partitioned workstations", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Workstations", "d": "Warm wood finishes, sleek black metal frameworks and neutral cabinetry create a professional yet inviting atmosphere.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-09", "Cabins"], ["sheik-06", "Cabins"]], "proj": "Sheik Office"}], "meeting": [{"id": "c-conf", "t": "Conference room", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Meeting", "d": "Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-13", "Conference Room"], ["sheik-14", "Conference Room"], ["sheik-15", "Conference Room"]], "proj": "Sheik Office"}, {"id": "c-board", "t": "Boardroom table", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Meeting", "d": "Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-11", "Conference Room"], ["sheik-12", "Conference Room"]], "proj": "Sheik Office"}, {"id": "c-meet", "t": "Meeting corner", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Meeting", "d": "Warm wood finishes, sleek black metal frameworks and neutral cabinetry create a professional yet inviting atmosphere.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-10", "Conference Room"]], "proj": "Sheik Office"}], "storage": [{"id": "c-pantry", "t": "Pantry & storage", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Storage", "d": "Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-04", "Workstations"], ["sheik-03", "Workstations"]], "proj": "Sheik Office"}, {"id": "c-shelf", "t": "Suspended shelving", "loc": "Ranipet, Vellore", "client": "Mr. Sheik", "kind": "Design concept", "scope": "Storage", "d": "Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency.", "alt": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "mat": [["Neutral", "#efe9df"], ["Warm wood", "#b98a56"], ["Black metal", "#22201d"], ["Carpet grey", "#4f5a52"]], "views": [["sheik-07", "Workstations"]], "proj": "Sheik Office"}], "studio": [{"id": "c-music", "t": "Music studio", "loc": "Adyar, Chennai", "client": "Mr. Senthil", "kind": "Completed project", "scope": "Studio", "d": "The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space.", "alt": ["Music studio with coffered ceiling", "Instrument displays", "Wood-panelled wall with illuminated circular mirror", "Pooja cabinet with lattice shutters"], "mat": [["Cream", "#efe4d3"], ["Rich wood", "#6b4428"], ["Golden drape", "#d7b04c"], ["Teak panel", "#7e5536"]], "views": [["senthil-08", "Music Studio"], ["senthil-01", "Music Studio"]], "proj": "Senthil Residence"}, {"id": "c-devotional", "t": "Devotional space", "loc": "Adyar, Chennai", "client": "Mr. Senthil", "kind": "Completed project", "scope": "Studio", "d": "A wood-panelled feature wall with an illuminated circular mirror adds character, while a compact pooja cabinet with decorative lattice shutters creates a harmonious blend of spirituality, artistry and modern functionality.", "alt": ["Music studio with coffered ceiling", "Instrument displays", "Wood-panelled wall with illuminated circular mirror", "Pooja cabinet with lattice shutters"], "mat": [["Cream", "#efe4d3"], ["Rich wood", "#6b4428"], ["Golden drape", "#d7b04c"], ["Teak panel", "#7e5536"]], "views": [["senthil-06", "Pooja Area"], ["senthil-02", "Pooja Area"]], "proj": "Senthil Residence"}, {"id": "c-mirror", "t": "Feature wall & details", "loc": "Adyar, Chennai", "client": "Mr. Senthil", "kind": "Completed project", "scope": "Studio", "d": "A wood-panelled feature wall with an illuminated circular mirror adds character, while a compact pooja cabinet with decorative lattice shutters creates a harmonious blend of spirituality, artistry and modern functionality.", "alt": ["Music studio with coffered ceiling", "Instrument displays", "Wood-panelled wall with illuminated circular mirror", "Pooja cabinet with lattice shutters"], "mat": [["Cream", "#efe4d3"], ["Rich wood", "#6b4428"], ["Golden drape", "#d7b04c"], ["Teak panel", "#7e5536"]], "views": [["senthil-03", "Details & Décor"], ["senthil-05", "Details & Décor"], ["senthil-07", "Details & Décor"]], "proj": "Senthil Residence"}]}};
  const SV_DISC = [{"t": "Living & dining", "sp": "Living rooms, TV walls, dining &amp; foyers", "n": 7, "href": "#ideas-living-dining", "rooms": [["Living Room", "#ideas-living-room"], ["TV Units", "#ideas-tv-units"], ["Dining Area", "#ideas-dining-area"], ["Foyer Area", "#ideas-foyer-area"]]}, {"t": "Kitchens", "sp": "Modular kitchens &amp; utility", "n": 4, "href": "#ideas-kitchens", "rooms": [["Kitchen", "#ideas-kitchen"], ["Crockery & Utility", "#ideas-crockery-utility"]]}, {"t": "Bedrooms & wardrobes", "sp": "Bedrooms, wardrobes &amp; study", "n": 7, "href": "#ideas-bedrooms-wardrobes", "rooms": [["Bedrooms", "#ideas-bedrooms"], ["Kids Bedroom", "#ideas-kids-bedroom"], ["Wardrobes", "#ideas-wardrobes"], ["Study Corner", "#ideas-study-corner"]]}, {"t": "Pooja spaces", "sp": "Pooja units &amp; mandapams", "n": 2, "href": "#ideas-pooja-spaces", "rooms": [["Pooja Area", "#ideas-pooja-area"]]}, {"t": "Workspaces & studios", "sp": "Offices &amp; a music studio", "n": 4, "href": "#ideas-workspaces-studios", "rooms": [["Workstations", "#ideas-workstations"], ["Conference Room", "#ideas-conference-room"], ["Cabins", "#ideas-cabins"], ["Music Studio", "#ideas-music-studio"]]}, {"t": "Details & storage", "sp": "Craft, vanities &amp; display", "n": 3, "href": "#ideas-details-storage", "rooms": [["Details & Décor", "#ideas-details-d-cor"], ["Vanity Units", "#ideas-vanity-units"], ["Display Units", "#ideas-display-units"]]}];
  const SV_TOTAL = 10;
  const SV_STEP_MS = 2600, SV_RS_DUR = 6500, SV_CZ_DUR = 4000;
  const svPad = n => String(n).padStart(2, '0');
  const svSrc = id => DIC_PHOTO(id);          /* photos live in site/images */
  const svSetImg = (im, id) => { im.src = svSrc(id); };
  const svReady = (im, ms) => new Promise(res => {
    let done = false; const end = () => { if (!done) { done = true; res(); } };
    setTimeout(end, ms);
    if (im.complete && im.naturalWidth) { (im.decode ? im.decode() : Promise.resolve()).then(end, end); return; }
    im.addEventListener('load', () => (im.decode ? im.decode() : Promise.resolve()).then(end, end), { once: true });
    im.addEventListener('error', end, { once: true });
  });
  const svEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svCheck = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg>';
  const svGlow = el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, { passive: true });
  /* a wipe between two stacked images */
  const svWipe = (imgs, a, alt, key) => {
    const cur = imgs.find(im => im.classList.contains('is-on')) || imgs[0], nxt = imgs.find(im => im !== cur);
    if (cur.dataset.key === key) return;
    svSetImg(nxt, a); nxt.alt = alt; nxt.dataset.key = key;
    const tok = (imgs.t = (imgs.t || 0) + 1);
    svReady(nxt, 900).then(() => {
      if (tok !== imgs.t) return;
      imgs.forEach(im => im.classList.remove('is-prev'));
      cur.classList.add('is-prev'); cur.classList.remove('is-on');
      void nxt.offsetWidth; nxt.classList.add('is-on');
      setTimeout(() => { if (tok === imgs.t) cur.classList.remove('is-prev'); }, 950);
    });
  };
  const svCountTo = (el, from, to, dur) => {
    if (reduceMotion) { el.textContent = svPad(to); return; }
    const t0 = performance.now();
    cancelAnimationFrame(el._raf);
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = svPad(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  };
  let svLive = false;

  /* ---------- hero: the room builds itself ---------- */
  const svIso = $('#svIso'), svStBtns = $$('.sv-st', svView), svBDay = $('#svBDay'), svBBar = $('#svBBar'), svBPlay = $('#svBPlay');
  const svHs = $$('.sv-hs', svView);
  const SV_STAGE_MS = [1800, 1600, 1600, 1600, 1700], SV_HOLD = 7600;
  let svS = -1, svBTimer = 0, svBPaused = false, svBVis = true, svDayNow = 1, svTipT = 0, svTipI = 0, svOnHs = false;
  function svStage(s) {
    svS = s;
    const cls = ['sv-iso'];
    for (let k = 0; k <= s; k++) cls.push('s' + k);
    svIso.className = cls.join(' ');
    if (s >= 0) svIso.dataset.cur = s; else delete svIso.dataset.cur;
    svStBtns.forEach((b, k) => { b.classList.toggle('is-on', k === s); b.classList.toggle('is-past', k < s); b.setAttribute('aria-pressed', String(k === s)); });
    if (s >= 0) { svCountTo(svBDay, svDayNow, SV_STAGES[s], 900); svDayNow = SV_STAGES[s]; }
    svBBar.parentElement.style.setProperty('--bp', ((s + 1) / SV_STAGES.length).toFixed(3));
    clearTimeout(svStage.done); clearInterval(svTipT);
    svHs.forEach(h => h.classList.remove('is-tip'));
    if (s === SV_STAGES.length - 1) svStage.done = setTimeout(() => { svIso.classList.add('is-done'); svTips(); }, reduceMotion ? 0 : 1400);
  }
  function svTips() {
    clearInterval(svTipT);
    if (reduceMotion || svBPaused) return;
    const tick = () => {
      if (svOnHs) return;
      svHs.forEach((h, i) => h.classList.toggle('is-tip', i === svTipI));
      svTipI = (svTipI + 1) % svHs.length;
    };
    tick(); svTipT = setInterval(tick, 1500);
  }
  function svBuildQueue() {
    clearTimeout(svBTimer);
    if (reduceMotion || svBPaused || !svBVis || !svLive || document.hidden) return;
    if (svS < SV_STAGES.length - 1) {
      svBTimer = setTimeout(() => { svStage(svS + 1); svBuildQueue(); }, svS < 0 ? 200 : SV_STAGE_MS[svS]);
    } else {
      svBTimer = setTimeout(() => {                              /* clear the room, then build it again */
        svIso.classList.add('is-reset');
        svIso.className = 'sv-iso is-reset'; delete svIso.dataset.cur;
        svStBtns.forEach(b => b.classList.remove('is-on', 'is-past'));
        clearInterval(svTipT);
        svBTimer = setTimeout(() => { svIso.classList.remove('is-reset'); svS = -1; svDayNow = 1; svBDay.textContent = '01'; svBuildQueue(); }, 750);
      }, SV_HOLD);
    }
  }
  svStBtns.forEach((b, k) => b.addEventListener('click', () => {
    svBPaused = true; svBPlay.setAttribute('aria-pressed', 'true'); svBPlay.setAttribute('aria-label', 'Play the build');
    clearTimeout(svBTimer); svStage(k);
  }));
  svBPlay.addEventListener('click', () => {
    svBPaused = !svBPaused;
    svBPlay.setAttribute('aria-pressed', String(svBPaused));
    svBPlay.setAttribute('aria-label', svBPaused ? 'Play the build' : 'Pause the build');
    if (!svBPaused && svS === SV_STAGES.length - 1) svTips();
    svBuildQueue();
  });
  svHs.forEach(h => {
    h.addEventListener('pointerenter', () => { svOnHs = true; svHs.forEach(x => x !== h && x.classList.remove('is-tip')); });
    h.addEventListener('pointerleave', () => { svOnHs = false; });
  });
  new IntersectionObserver(e => { svBVis = e[0].isIntersecting; svBuildQueue(); }, { threshold: .25 }).observe(svIso);
  /* the model turns slightly with the pointer, like a maquette on a turntable */
  if (finePointer && !reduceMotion) {
    const st = $('#svStage');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      svIso.style.setProperty('--tx', cx.toFixed(3)); svIso.style.setProperty('--ty', cy.toFixed(3));
      raf = (Math.abs(tx - cx) > .002 || Math.abs(ty - cy) > .002) ? requestAnimationFrame(loop) : 0;
    };
    st.addEventListener('pointermove', e => {
      const r = st.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    st.addEventListener('pointerleave', () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }
  const svCount = el => {
    const to = +el.dataset.svcount;
    if (reduceMotion) { el.textContent = String(to); return; }
    const t0 = performance.now() + 1100, dur = 1500;
    const step = now => {
      const p = Math.max(0, Math.min(1, (now - t0) / dur));
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    el.textContent = '0'; requestAnimationFrame(step);
  };

  /* ---------- 01 pillars: light follows the pointer ---------- */
  if (finePointer) $$('.sv-p', svView).forEach(svGlow);

  /* ---------- 02 turnkey programme ---------- */
  const svG = $('#svGantt'), svGRows = $$('.sv-g-row', svView), svGRowsBox = $('.sv-g-rows', svView), svGPlay = $('#svGPlay');
  const svPh = $('#svPhase'), svDiary = $('#svDiary');
  const SV_MSGS = [];
  SV_PH.forEach((p, k) => p.diary.forEach((t, j) => SV_MSGS.push({ id: SV_MSGS.length, k, t, day: p.s + j })));
  const SV_TINT = [['#8a7444', '#3a3026'], ['#5f7a7c', '#22313a'], ['#a36d43', '#3a2618'], ['#7a7a6a', '#2f2f28'], ['#6d8a62', '#26331f'], ['#c9a466', '#4a3920']];
  const SV_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3v11H4Z"/><circle cx="12" cy="13" r="3.5"/></svg>';
  let svDay = 1, svPI = -1, svGOn = true, svGVis = false, svGRaf = 0, svGLast = 0, svDiaryKey = '';
  const svPhaseAt = d => { let k = 0; SV_PH.forEach((p, i) => { if (d >= p.s) k = i; }); return k; };
  function svFillPhase(i, instant) {
    const p = SV_PH[i];
    const put = () => {
      $('#svPhK').textContent = 'Phase ' + p.n;
      $('#svPhTag').textContent = p.tag;
      $('#svPhT').textContent = p.t;
      $('#svPhLead').textContent = p.lead;
      $('#svPhD').textContent = p.d;
      $('#svPhDl').innerHTML = p.dl.map((x, k) => `<li style="--i:${k}"><i aria-hidden="true">${svCheck}</i>${svEsc(x)}</li>`).join('');
      $('#svPhHl').textContent = p.hl;
      svPh.classList.remove('is-swap');
    };
    if (instant || reduceMotion) { put(); return; }
    svPh.classList.add('is-swap'); setTimeout(put, 260);
  }
  function svDiaryDraw(d) {
    const seen = SV_MSGS.filter(m => m.day <= d).slice(-2);
    const key = seen.map(m => m.id).join(',');
    if (key === svDiaryKey) return;
    const fresh = svDiaryKey && seen.length && !svDiaryKey.split(',').includes(String(seen[seen.length - 1].id));
    svDiaryKey = key;
    svDiary.innerHTML = seen.map((m, j) => {
      const tint = SV_TINT[m.k];
      return `<li class="sv-msg" style="${fresh || j === seen.length - 1 ? '' : 'animation:none'}"><span class="sv-msg-ph" style="--c1:${tint[0]};--c2:${tint[1]}">${SV_ICON}</span><p>${svEsc(m.t)}<small>Step ${svPad(m.day)} · ${svEsc(SV_PH[m.k].t)}</small></p></li>`;
    }).join('');
  }
  function svGDraw() {
    const k = svPhaseAt(Math.floor(svDay));
    if (k !== svPI) { const first = svPI < 0; svPI = k; svFillPhase(k, first); }
    svGRows.forEach((r, i) => {
      const p = SV_PH[i];
      r.classList.toggle('is-on', i === k); r.classList.toggle('is-past', i < k);
      r.setAttribute('aria-selected', String(i === k));
      const f = i < k ? 1 : i > k ? 0 : Math.max(0, Math.min(1, (svDay - p.s) / (p.e - p.s + 1)));
      $('.sv-g-fill', r).style.setProperty('--f', f.toFixed(4));
    });
    svGRowsBox.style.setProperty('--dp', ((svDay - 1) / SV_TOTAL).toFixed(4));
    const d = Math.min(SV_TOTAL, Math.floor(svDay));
    $('#svGDay').textContent = svPad(d);
    $('#svGHeadD').textContent = 'Step ' + d;
    svPh.style.setProperty('--pp', (d / SV_TOTAL).toFixed(4));
    $('#svPhPct').innerHTML = Math.round(d / SV_TOTAL * 100) + '<small>%</small>';
    svDiaryDraw(d);
  }
  function svGLoop(now) {
    const dt = svGLast ? Math.min(100, now - svGLast) : 0;
    svGLast = now;
    if (svGOn && !reduceMotion) { svDay += dt / SV_STEP_MS; if (svDay >= SV_TOTAL + 1) { svDay = 1; svDiaryKey = ''; } svGDraw(); }
    svGRaf = (svGVis && svLive && !document.hidden) ? requestAnimationFrame(svGLoop) : 0;
    if (!svGRaf) svGLast = 0;
  }
  const svGKick = () => { if (!svGRaf && svGVis && svLive && !document.hidden) { svGLast = 0; svGRaf = requestAnimationFrame(svGLoop); } };
  svGRows.forEach((r, i) => r.addEventListener('click', () => { svDay = SV_PH[i].s; svGDraw(); }));
  svGPlay.addEventListener('click', () => {
    svGOn = !svGOn;
    svGPlay.setAttribute('aria-pressed', String(!svGOn));
    svGPlay.setAttribute('aria-label', svGOn ? 'Pause the timeline' : 'Play the timeline');
    svG.classList.toggle('is-hold', !svGOn);
    $('#svGState').textContent = svGOn ? 'Programme live' : 'Paused';
  });
  svGRowsBox.addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = Math.max(0, Math.min(SV_PH.length - 1, svPI + (e.key === 'ArrowDown' ? 1 : -1)));
    svDay = SV_PH[i].s; svGDraw(); svGRows[i].focus();
  });
  new IntersectionObserver(e => { svGVis = e[0].isIntersecting; svGKick(); }, { threshold: .2 }).observe(svG);
  svGDraw();

  /* ---------- lightbox ---------- */
  const svLb = $('#svLb');
  let svLbList = [], svLbI = 0;
  function svLbShow(i) {
    svLbI = (i + svLbList.length) % svLbList.length;
    const s = svLbList[svLbI], im = $('#svLbImg');
    svSetImg(im, s.a); im.alt = s.t + ' — ' + s.c;
    $('#svLbT').textContent = s.t;
    $('#svLbC').textContent = `${s.c} · ${svPad(svLbI + 1)} / ${svPad(svLbList.length)}`;
    const many = svLbList.length > 1;
    $('#svLbP').hidden = !many; $('#svLbN').hidden = !many;
  }
  function svLbOpen(list, i) { svLbList = list; svLbShow(i); if (!svLb.open) { svLb.showModal(); body.classList.add('pop-open'); } }
  svLb.addEventListener('close', () => body.classList.remove('pop-open'));
  svLb.addEventListener('click', e => { if (e.target === svLb || e.target.classList.contains('sv-lb-in')) svLb.close(); });
  svLb.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); svLbShow(svLbI + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); svLbShow(svLbI - 1); }
  });
  $('#svLbX').addEventListener('click', () => svLb.close());
  $('#svLbP').addEventListener('click', () => svLbShow(svLbI - 1));
  $('#svLbN').addEventListener('click', () => svLbShow(svLbI + 1));

  /* ---------- 03 residential: practice rail + a card you can turn over ---------- */
  const svRsGrid = $('.sv-rs-grid', svView), svRsTabs = $$('.sv-rs-tab', svView), svRsList = $('#svRsList'), svFlip = $('#svFlip');
  const svFis = $$('.sv-fi', svView), svRsViews = $('#svRsViews');
  let svRsTab = SV_RES.tabs[0], svRsI = 0, svRsK = 0, svRsT = 0, svRsHold = false, svRsVis = false;
  svRsGrid.style.setProperty('--rs-dur', SV_RS_DUR + 'ms');
  const svRsL = () => SV_RES.data[svRsTab];
  function svRsBuild() {
    svRsList.innerHTML = svRsL().map((it, j) => `<li><button type="button" class="sv-rs-it is-enter" data-i="${j}" style="--k:${j}"><span class="n">${svPad(j + 1)}</span><b>${svEsc(it.t)}</b><small>${svEsc(it.loc)}</small><i aria-hidden="true"></i></button></li>`).join('');
  }
  function svRsPhoto(k) {
    const it = svRsL()[svRsI], v = it.views;
    svRsK = (k + v.length) % v.length;
    $$('.sv-rs-v', svView).forEach((b, i) => b.classList.toggle('is-on', i === svRsK));
    svWipe(svFis, v[svRsK][0], it.t + ' — ' + v[svRsK][1], it.id + ':' + svRsK);
  }
  function svRsShow(i, quiet) {
    svRsI = i;
    const it = svRsL()[i];
    $$('.sv-rs-it', svView).forEach((b, j) => b.classList.toggle('is-on', j === i));
    const put = () => {
      $('#svRsScope').textContent = it.scope;
      $('#svRsLoc').textContent = it.loc; $('#svRsArea').textContent = it.client; $('#svRsTime').textContent = it.kind;
      $('#svRsT').textContent = it.t; $('#svRsD').textContent = it.d;
      $('#svBkN').textContent = svPad(i + 1) + ' / ' + svPad(svRsL().length);
      $('#svBkT').textContent = it.t;
      $('#svBkFacts').innerHTML = [['Location', it.loc], ['Client', it.client], ['Imagery', it.kind], ['Scope', it.scope]].map(f => `<div><dt>${f[0]}</dt><dd>${svEsc(f[1])}</dd></div>`).join('');
      $('#svBkAlt').innerHTML = it.alt.map(x => `<li>${svEsc(x)}</li>`).join('');
      $('#svBkMat').innerHTML = it.mat.map(m => `<li><i style="--c:${m[1]}"></i>${svEsc(m[0])}</li>`).join('');
      svRsViews.innerHTML = it.views.length > 1 ? it.views.map((v, j) => `<button type="button" class="sv-rs-v${j === 0 ? ' is-on' : ''}" data-k="${j}" aria-label="${svEsc(v[1])}"><img src="${svSrc(v[0])}" alt="" loading="lazy"></button>`).join('') : '';
      svFlip.classList.remove('is-swap');
    };
    if (quiet || reduceMotion) put(); else { svFlip.classList.add('is-swap'); setTimeout(put, 240); }
    svRsPhoto(0);
    svRsQueue();
  }
  function svRsQueue() {
    clearTimeout(svRsT);
    const auto = !reduceMotion && svRsVis && svLive && !svRsHold && !svFlip.classList.contains('is-flipped') && !document.hidden;
    svRsGrid.classList.toggle('is-auto', auto);
    svRsGrid.classList.toggle('is-hold', svRsHold);
    const bar = $('.sv-rs-it.is-on i', svView);
    if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    if (auto) svRsT = setTimeout(() => svRsShow((svRsI + 1) % svRsL().length), SV_RS_DUR);
  }
  svRsTabs.forEach(t => t.addEventListener('click', () => {
    if (t.dataset.tab === svRsTab) return;
    svRsTab = t.dataset.tab;
    svRsTabs.forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
    svFlip.classList.remove('is-flipped'); svFaces();
    svRsBuild(); svRsShow(0);
  }));
  svRsList.addEventListener('click', e => { const b = e.target.closest('.sv-rs-it'); if (b && +b.dataset.i !== svRsI) svRsShow(+b.dataset.i); });
  svRsViews.addEventListener('click', e => { const b = e.target.closest('.sv-rs-v'); if (b) svRsPhoto(+b.dataset.k); });
  const svFaces = () => {
    const f = svFlip.classList.contains('is-flipped');
    $('.sv-front', svFlip).setAttribute('aria-hidden', String(f));
    $('.sv-back', svFlip).setAttribute('aria-hidden', String(!f));
    $('.sv-front', svFlip).inert = f;    /* the hidden face cannot take keyboard focus */
    $('.sv-back', svFlip).inert = !f;
  };
  $$('[data-flip]', svFlip).forEach(b => b.addEventListener('click', () => {
    svFlip.classList.toggle('is-flipped'); svFaces(); svRsQueue();
    const face = $(svFlip.classList.contains('is-flipped') ? '.sv-back' : '.sv-front', svFlip);
    const to = $('[data-flip]', face); if (to) to.focus({ preventScroll: true });   /* keep keyboard focus on the visible face */
  }));
  $('#svRsZoom').addEventListener('click', () => { const it = svRsL()[svRsI]; svLbOpen(it.views.map(v => ({ a: v[0], t: it.t, c: v[1] })), svRsK); });
  svRsGrid.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; svRsHold = true; clearTimeout(svRsT); svRsGrid.classList.add('is-hold'); });
  svRsGrid.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; svRsHold = false; svRsQueue(); });
  new IntersectionObserver(e => { svRsVis = e[0].isIntersecting; svRsQueue(); }, { threshold: .35 }).observe(svRsGrid);
  let svRsX = null;
  svFlip.addEventListener('touchstart', e => { svRsX = e.touches[0].clientX; }, { passive: true });
  svFlip.addEventListener('touchend', e => {
    if (svRsX === null) return;
    const dx = e.changedTouches[0].clientX - svRsX; svRsX = null;
    if (Math.abs(dx) > 50 && !svFlip.classList.contains('is-flipped')) svRsShow((svRsI + (dx < 0 ? 1 : -1) + svRsL().length) % svRsL().length);
  }, { passive: true });
  svRsBuild(); svRsShow(0, true);
  $('.sv-fi', svView).dataset.key = svRsL()[0].id + ':0';

  /* ---------- 04 commercial ---------- */
  const svCm = $('#svCom'), svCmTabs = $$('.sv-tab', svCm), svCmPill = $('.sv-tab-pill', svCm), svCz = $('.sv-cz', svCm), svCzPicks = $('#svCzPicks');
  const svCis = $$('.sv-ci', svCm);
  let svCzTab = SV_COM.tabs[0], svCzI = 0, svCzT = 0, svCzHold = false, svCzVis = false;
  svCzPicks.style.setProperty('--cz-dur', SV_CZ_DUR + 'ms');
  const svCzTm = $('#svCzTm'), svCzSec = $('#svCzSec'), svCzNext = $('#svCzNext'), svCzTmK = $('#svCzTmK'), svCzArcEl = $('.sv-cz-tm-arc', svCzTm);
  let svCzStop = false, svCzEnd = 0, svCzTick = 0, svCzLast = 0;
  svCzTm.style.setProperty('--cz-dur', SV_CZ_DUR + 'ms');
  const svCzSecs = () => {
    const n = Math.max(1, Math.ceil((svCzEnd - performance.now()) / 1000));
    if (n !== svCzLast) { svCzLast = n; svCzSec.textContent = n; svCzTm.classList.remove('is-tick'); void svCzTm.offsetWidth; svCzTm.classList.add('is-tick'); }
  };
  const svCzTmState = () => {
    svCzTm.classList.toggle('is-stop', svCzStop);
    svCzTm.classList.toggle('is-hold', svCzHold && !svCzStop);
    svCzTmK.textContent = svCzStop ? 'Paused · play' : svCzHold ? 'Paused · up next' : 'Up next';
    svCzTm.setAttribute('aria-label', svCzStop ? 'Play the slideshow' : 'Pause the slideshow');
  };
  const svCzL = () => SV_COM.data[svCzTab];
  const svCmPlace = () => {
    const b = svCmTabs.find(t => t.classList.contains('is-on'));
    if (!b) return;
    svCmPill.style.setProperty('--l', b.offsetLeft + 'px'); svCmPill.style.setProperty('--t', b.offsetTop + 'px');
    svCmPill.style.setProperty('--w', b.offsetWidth + 'px'); svCmPill.style.setProperty('--h', b.offsetHeight + 'px');
  };
  function svCzBuild() {
    svCzPicks.innerHTML = svCzL().map((it, j) => `<button type="button" class="sv-cp is-enter" role="tab" aria-selected="false" data-i="${j}" style="--k:${j}"><span class="sv-cp-ph"><img src="${svSrc(it.views[0][0])}" alt="" loading="lazy"></span><span><span class="sv-cp-n">${svPad(j + 1)}</span><span class="sv-cp-t">${svEsc(it.t)}</span></span><i aria-hidden="true"></i></button>`).join('');
  }
  function svCzShow(i, quiet) {
    svCzI = i;
    const L = svCzL(), it = L[i], maxV = Math.max(...L.map(x => x.views.length));
    $$('.sv-cp', svCm).forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-selected', String(j === i)); });
    const put = () => {
      $('#svCzN').textContent = `${svPad(i + 1)} / ${svPad(L.length)}`;
      $('#svCzLoc').textContent = it.loc;
      $('#svCzT').textContent = it.t;
      $('#svCzD').textContent = it.d;
      $('#svCzAlt').innerHTML = it.alt.slice(0, 3).map(x => `<li>${svEsc(x)}</li>`).join('');
      $('#svCzMat').innerHTML = it.mat.map(m => `<li><i style="--c:${m[1]}"></i>${svEsc(m[0])}</li>`).join('');
      $('#svCzScope').textContent = it.scope;
      const n = (i + 1) % L.length;
      svCzNext.textContent = `${svPad(n + 1)} · ${L[n].t}`;
      svCz.classList.remove('is-swap');
    };
    if (quiet || reduceMotion) put(); else { svCz.classList.add('is-swap'); setTimeout(put, 240); }
    $('#svCzDays').textContent = it.views.length;
    $('.sv-cz-ring', svCm).style.setProperty('--rp', (it.views.length / maxV).toFixed(3));
    $('#svCzArea').textContent = it.proj;
    $('#svCzBar').parentElement.style.setProperty('--ap', (it.views.length / maxV).toFixed(3));
    $('#svCzRel').textContent = it.loc;
    svWipe(svCis, it.views[0][0], it.t, it.id + ':0');
    svCzQueue();
  }
  function svCzQueue() {
    clearTimeout(svCzT); clearInterval(svCzTick);
    const auto = !reduceMotion && svCzVis && svLive && !svCzHold && !svCzStop && !document.hidden;
    svCzPicks.classList.toggle('is-auto', auto);
    svCzPicks.classList.toggle('is-hold', svCzHold);
    const bar = $('.sv-cp.is-on > i', svCm);
    if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    svCzTm.classList.toggle('is-run', auto);
    svCzArcEl.style.animation = 'none'; svCzArcEl.getBoundingClientRect(); svCzArcEl.style.animation = '';
    svCzTmState();
    if (auto) {
      svCzEnd = performance.now() + SV_CZ_DUR; svCzLast = 0; svCzSecs();
      svCzTick = setInterval(svCzSecs, 200);
      svCzT = setTimeout(() => svCzShow((svCzI + 1) % svCzL().length), SV_CZ_DUR);
    } else if (!svCzHold) { svCzSec.textContent = Math.round(SV_CZ_DUR / 1000); svCzLast = 0; }
  }
  svCzTm.addEventListener('click', () => {
    svCzStop = !svCzStop;
    if (!svCzStop) svCzHold = false;
    svCzQueue();
  });
  svCmTabs.forEach(t => t.addEventListener('click', () => {
    if (t.dataset.tab === svCzTab) return;
    svCzTab = t.dataset.tab;
    svCmTabs.forEach(x => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
    svCmPlace(); svCzBuild(); svCzShow(0);
  }));
  svCzPicks.addEventListener('click', e => { const b = e.target.closest('.sv-cp'); if (b && +b.dataset.i !== svCzI) svCzShow(+b.dataset.i); });
  $('#svCzZoom').addEventListener('click', () => { const it = svCzL()[svCzI]; svLbOpen(it.views.map(v => ({ a: v[0], t: it.t, c: v[1] })), 0); });
  [svCz, svCzPicks].forEach(el => {
    el.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; svCzHold = true; clearTimeout(svCzT); clearInterval(svCzTick); svCzPicks.classList.add('is-hold'); svCzTmState(); });
    el.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; svCzHold = false; svCzQueue(); });
  });
  new IntersectionObserver(e => { svCzVis = e[0].isIntersecting; svCzQueue(); }, { threshold: .35 }).observe(svCz);
  svCzBuild(); svCzShow(0, true);
  $('.sv-ci', svCm).dataset.key = svCzL()[0].id + ':0';

  /* ---------- 05 engagement: light follows the pointer on each step ---------- */
  if (finePointer) $$('.sv-tier', svView).forEach(svGlow);

  /* ---------- 06 typologies: a live wave of rooms across the arches ---------- */
  const svTy = $('#svIdeas'), svArcs = $$('.sv-arc', svTy);
  const SV_ARC_MS = 1500;
  let svArcK = 0, svArcT = 0, svArcVis = false;
  svArcs.forEach(a => { try { a._reel = JSON.parse(a.dataset.reel || '[]'); } catch (_) { a._reel = []; } a._i = -1; });
  const svArcLoad = (img, src) => new Promise(res => {
    const done = () => { img.onload = img.onerror = null; res(); };
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(done);
    img.onerror = done;
    img.src = src;
  });
  async function svArcTurn(a) {
    const reel = a._reel;
    if (!reel.length || a._busy) return;
    a._busy = true;
    a._i = (a._i + 1) % reel.length;
    const [room, , pid] = reel[a._i];
    const base = $('.sv-arc-ph img:not(.sv-arc-nx)', a), nx = $('.sv-arc-nx', a), lbl = $('.sv-arc-room', a);
    let src = svSrc(pid);
    await svArcLoad(nx, src);
    if (!nx.naturalWidth) { src = svSrc(a.dataset.fb); await svArcLoad(nx, src); }
    a.classList.add('is-live', 'is-turn');
    lbl.classList.add('is-out');
    setTimeout(() => { lbl.textContent = room; lbl.classList.remove('is-out'); }, 260);
    $$('.sv-arc-rooms a', a).forEach(l => l.classList.toggle('is-now', l.textContent === room));
    setTimeout(async () => {
      base.removeAttribute('data-fallback'); base.onerror = null;
      await svArcLoad(base, src);
      a.classList.remove('is-turn');
      a._busy = false;
    }, reduceMotion ? 0 : 1150);
    setTimeout(() => a.classList.remove('is-live'), 1700);
  }
  function svArcQueue() {
    clearTimeout(svArcT);
    if (reduceMotion || !svArcVis || !svLive || document.hidden) return;
    svArcT = setTimeout(() => {
      const a = svArcs[svArcK];
      svArcK = (svArcK + 1) % svArcs.length;
      if (!a.matches(':hover')) svArcTurn(a);
      svArcQueue();
    }, SV_ARC_MS);
  }
  new IntersectionObserver(e => { svArcVis = e[0].isIntersecting; svArcQueue(); }, { threshold: .2 }).observe($('#svArcs'));
  /* a warm light that follows the pointer through the colonnade */
  if (finePointer && !reduceMotion) {
    const lt = $('.sv-ty-light', svTy);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const step = () => {
      cx += (tx - cx) * .12; cy += (ty - cy) * .12;
      lt.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      raf = (Math.abs(tx - cx) + Math.abs(ty - cy) > .5) ? requestAnimationFrame(step) : 0;
    };
    svTy.addEventListener('pointermove', e => {
      const r = svTy.getBoundingClientRect(), z = zoomF();
      tx = (e.clientX - r.left) / z; ty = (e.clientY - r.top) / z;
      svTy.classList.add('is-lit');
      if (!raf) raf = requestAnimationFrame(step);
    });
    svTy.addEventListener('pointerleave', () => svTy.classList.remove('is-lit'));
  }

  /* ---------- closing band: a drawn backdrop behind the contact card (services only) ---------- */
  const svClosing = $('.closing');
  if (svClosing && !$('.sv-clo', svClosing)) {
    const words = ['Design', 'Execute', 'Deliver'].map(t => `<span>${t}<i>✦</i></span>`).join('');
    const tags = ['One point of coordination', 'Detailed estimate', 'Design approval', 'Quality checks', 'After-handover support'].map(t => `<span><i></i>${t}</span>`).join('');
    svClosing.insertAdjacentHTML('afterbegin', `<div class="sv-clo" aria-hidden="true"><div class="sv-clo-row sv-clo-a">${words}${words}${words}${words}</div><div class="sv-clo-tags">${tags}</div></div>`);
    io.observe(svClosing);
  }

  /* ---------- reveals + page life ---------- */
  $$('.rv, .ab-head, .sv-bento, .sv-st3, .sv-arcs', svView).forEach(el => io.observe(el));
  addEventListener('resize', () => { if (!svView.hidden) svCmPlace(); });
  function svShowPage() {
    svLive = true;
    svView.classList.add('sv-on');
    $$('[data-svcount]', svView).forEach(svCount);
    svCmPlace();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!svView.hidden) svCmPlace(); });
    if (reduceMotion) { svStage(SV_STAGES.length - 1); svIso.classList.add('is-done'); }
    svBuildQueue(); svGKick(); svRsQueue(); svCzQueue(); svArcQueue();
  }
  function svHidePage() {
    svLive = false;
    [svBTimer, svRsT, svCzT, svArcT].forEach(clearTimeout); clearInterval(svCzTick);
    svView.classList.remove('sv-on');
  }
  document.addEventListener('visibilitychange', () => { if (svView.hidden) return; svBuildQueue(); svGKick(); svRsQueue(); svCzQueue(); svArcQueue(); });


  /* =========================================================
     PORTFOLIO — #/portfolio
  ========================================================= */
  const pfView = $('#pfView');
  const PF = [{"id": "mukundhan", "name": "Mukundhan Residence", "client": "Mr. Mukundhan", "cat": "Residential", "kind": "Residence", "city": "Keelkattalai", "ct": "Chennai", "place": "Keelkattalai, Chennai", "spaces": ["Living", "Kitchen", "Pooja", "Bedrooms", "Study", "Wardrobes"], "feel": "Heritage · Sage · Serene", "blurb": "A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting.", "story": "A graceful blend of traditional heritage and contemporary sophistication, this residence showcases soothing sage-green tones, rich wooden detailing and warm ambient lighting. The living area features a sleek floating TV unit, marble-inspired flooring and elegant devotional accents. The modular kitchen combines glossy cabinetry, dark countertops and illuminated storage. An intricately designed pooja space with carved wooden pillars, traditional artwork and golden detailing creates a serene atmosphere of spiritual elegance and modern comfort.", "hl": ["Pooja space with carved wooden pillars", "Floating TV unit", "Glossy modular kitchen with illuminated storage", "Marble-inspired flooring"], "pal": [["#efe7d8", "Ivory"], ["#9fae96", "Sage green"], ["#6e4527", "Carved wood"], ["#c9a24e", "Golden detail"]], "img": ["mukundhan-01", "mukundhan-02", "mukundhan-03", "mukundhan-04", "mukundhan-05", "mukundhan-06", "mukundhan-08", "mukundhan-09", "mukundhan-10", "mukundhan-12", "mukundhan-13", "mukundhan-14", "mukundhan-15", "mukundhan-16", "mukundhan-17", "mukundhan-18", "mukundhan-19", "mukundhan-20", "mukundhan-21", "mukundhan-22", "mukundhan-23"]}, {"id": "fayyaz", "name": "Fayyaz Manzil", "client": "Mrs. Fayyaz", "cat": "Residential", "kind": "Residence", "city": "Velachery", "ct": "Chennai", "place": "Velachery, Chennai", "spaces": ["Living", "Dining", "Kitchen", "Bedrooms", "Study", "Foyer"], "feel": "Arabic · Emerald · Luxurious", "blurb": "A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents.", "story": "A captivating blend of Arabic-inspired elegance and contemporary luxury, this residence showcases rich emerald-green tones, warm wooden textures and sophisticated golden accents. The living area features plush green seating, graceful arched detailing, decorative wall textures and elegant pendant lighting. Intricate ceiling patterns, illuminated display niches and thoughtfully curated décor add distinctive character.", "hl": ["Plush emerald seating", "Graceful arched detailing", "Intricate ceiling patterns", "Elegant pendant lighting"], "pal": [["#efe8db", "Ivory"], ["#1f5b45", "Emerald green"], ["#a0643a", "Warm wood"], ["#c9a35c", "Golden accent"]], "img": ["fayyaz-01", "fayyaz-04", "fayyaz-05", "fayyaz-06", "fayyaz-07", "fayyaz-08", "fayyaz-09", "fayyaz-10", "fayyaz-11", "fayyaz-12", "fayyaz-13", "fayyaz-14", "fayyaz-16", "fayyaz-17", "fayyaz-02", "fayyaz-03"]}, {"id": "navin-2", "name": "Navin Residence — Phase 2", "client": "Mr. Navin · Phase 2", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Living", "Kitchen", "Pooja", "Bedrooms", "Study", "Wardrobes", "Foyer"], "feel": "Heritage · Ivory · Elegant", "blurb": "A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing.", "story": "A graceful blend of traditional craftsmanship and contemporary sophistication, this residence showcases rich wooden textures, warm ivory tones and elegant architectural detailing. The living area features classic wall mouldings, a floating TV console, decorative lighting and beautifully curved wooden accents. An intricately crafted pooja unit with illuminated lattice shutters adds spiritual warmth, while a stylish display cabinet with fluted panelling and soft lighting creates a harmonious balance of heritage, elegance and modern functionality.", "hl": ["Pooja unit with illuminated lattice shutters", "Floating TV console", "Curved wooden accents", "Fluted display cabinet"], "pal": [["#f1e9db", "Warm ivory"], ["#a9692f", "Rich wood"], ["#d4b277", "Lattice glow"], ["#e9dccb", "Mouldings"]], "img": ["navin-2-06", "navin-2-01", "navin-2-02", "navin-2-03", "navin-2-04", "navin-2-05", "navin-2-07", "navin-2-08", "navin-2-09", "navin-2-10", "navin-2-11", "navin-2-12", "navin-2-13", "navin-2-14", "navin-2-15", "navin-2-16", "navin-2-17", "navin-2-18", "navin-2-19", "navin-2-20", "navin-2-21", "navin-2-22", "navin-2-23", "navin-2-24", "navin-2-25", "navin-2-26", "navin-2-28", "navin-2-29", "navin-2-30"]}, {"id": "saveetha", "name": "Saveetha Residence", "client": "Mrs. Saveetha", "cat": "Residential", "kind": "Residence", "city": "Keelkattalai", "ct": "Chennai", "place": "Keelkattalai, Chennai", "spaces": ["Living", "Kitchen", "Pooja", "Bedrooms", "Wardrobes", "Foyer"], "feel": "Classic · Warm · Balanced", "blurb": "A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details.", "story": "A beautiful fusion of traditional craftsmanship and modern elegance, this residence showcases warm neutral tones, rich wooden textures and refined architectural details. The living area features classic wall mouldings, a sleek floating TV unit, fluted wooden accents and soft cove lighting. An intricately crafted wooden pooja unit adds spiritual warmth and timeless character. The modular kitchen combines elegant taupe cabinetry, streamlined storage and integrated lighting, creating a harmonious balance of heritage, comfort and contemporary functionality.", "hl": ["Intricately crafted wooden pooja unit", "Classic wall mouldings", "Taupe modular kitchen with integrated lighting", "Soft cove lighting"], "pal": [["#f1eadf", "Warm neutral"], ["#5b3a26", "Rich wood"], ["#a38f7c", "Taupe"], ["#e5c27a", "Cove glow"]], "img": ["saveetha-01", "saveetha-02", "saveetha-03", "saveetha-04", "saveetha-05", "saveetha-07", "saveetha-08", "saveetha-10", "saveetha-11", "saveetha-12", "saveetha-13", "saveetha-14", "saveetha-16", "saveetha-17", "saveetha-18"]}, {"id": "senthil", "name": "Senthil Residence", "client": "Mr. Senthil", "cat": "Residential", "kind": "Residence & music studio", "city": "Adyar", "ct": "Chennai", "place": "Adyar, Chennai", "spaces": ["Living", "Pooja", "Music studio"], "feel": "Artistic · Rich · Cultural", "blurb": "A distinctive fusion of artistic expression and traditional elegance, this interior celebrates creativity through rich wooden textures, cultural detailing and warm ambient lighting.", "story": "A distinctive fusion of artistic expression and traditional elegance, this interior celebrates creativity through rich wooden textures, cultural detailing and warm ambient lighting. The music studio features an elegant coffered ceiling, acoustic equipment, instrument displays and a beautifully arranged devotional space. A wood-panelled feature wall with an illuminated circular mirror adds character, while a compact pooja cabinet with decorative lattice shutters creates a harmonious blend of spirituality, artistry and modern functionality.", "hl": ["Music studio with coffered ceiling", "Instrument displays", "Wood-panelled wall with illuminated circular mirror", "Pooja cabinet with lattice shutters"], "pal": [["#efe4d3", "Cream"], ["#6b4428", "Rich wood"], ["#d7b04c", "Golden drape"], ["#7e5536", "Teak panel"]], "img": ["senthil-01", "senthil-02", "senthil-03", "senthil-04", "senthil-05", "senthil-06", "senthil-07", "senthil-08", "senthil-09"]}, {"id": "venkateswara", "name": "Venkateswara Rao Residence", "client": "Mr. Venkateswara Rao", "cat": "Residential", "kind": "Residence", "city": "Ponmar", "ct": "Chennai", "place": "Ponmar, Chennai", "spaces": ["Living", "Kitchen", "Pooja", "Study", "Wardrobes"], "feel": "Traditional · Warm · Inviting", "blurb": "A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting.", "story": "A charming blend of traditional warmth and contemporary functionality, this residence celebrates rich wooden textures, elegant detailing and inviting ambient lighting. The living area features a sleek TV unit, illuminated display niches and thoughtfully arranged decorative accents. The modular kitchen showcases wood-grain cabinetry, dark countertops and practical storage solutions. A beautifully crafted corner pooja mandapam with intricate lattice detailing and warm illumination adds spiritual elegance.", "hl": ["Corner pooja mandapam with lattice detailing", "Illuminated display niches", "Wood-grain modular kitchen", "Dark countertops"], "pal": [["#efe6d6", "Cream"], ["#8a4f2a", "Wood grain"], ["#2b2522", "Dark countertop"], ["#e3b866", "Warm light"]], "img": ["venkateswara-01", "venkateswara-02", "venkateswara-03", "venkateswara-04", "venkateswara-05", "venkateswara-06", "venkateswara-07", "venkateswara-08", "venkateswara-09", "venkateswara-10"]}, {"id": "kalpana-2", "name": "Kalpana Residence — Phase 2", "client": "Mrs. Kalpana · Phase 2", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Living", "Kitchen", "Bedrooms", "Study", "Wardrobes", "Foyer"], "feel": "Minimal · Sage · Calm", "blurb": "A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting.", "story": "A beautiful expression of contemporary minimalism and understated luxury, this residence embraces soothing neutral tones, elegant wall textures and warm ambient lighting. The living area features graceful curved detailing, a sleek TV unit, fluted panelling and sophisticated gold-accented partitions. Comfortable grey seating creates an inviting atmosphere, while the bedroom showcases a refreshing sage-green headboard, delicate floral patterns and practical furnishings. Thoughtfully balanced textures and lighting bring warmth, elegance and everyday comfort.", "hl": ["Gold-accented partitions", "Fluted panelling", "Sage-green headboard", "Graceful curved detailing"], "pal": [["#f0ebe3", "Soft neutral"], ["#8a8d8f", "Grey"], ["#a7b498", "Sage green"], ["#c8a45a", "Gold accent"]], "img": ["kalpana-2-14", "kalpana-2-01", "kalpana-2-02", "kalpana-2-04", "kalpana-2-05", "kalpana-2-07", "kalpana-2-08", "kalpana-2-09", "kalpana-2-10", "kalpana-2-11", "kalpana-2-12", "kalpana-2-13", "kalpana-2-15", "kalpana-2-16"]}, {"id": "sheik", "name": "Sheik Office", "client": "Mr. Sheik", "cat": "Commercial", "kind": "Office", "city": "Ranipet", "ct": "Vellore", "place": "Ranipet, Vellore", "spaces": ["Workstations", "Conference", "Cabins"], "feel": "Professional · Warm · Collaborative", "blurb": "A sophisticated approach to contemporary office design, this workspace combines functionality, comfort and modern aesthetics.", "story": "A sophisticated approach to contemporary office design, this workspace combines functionality, comfort and modern aesthetics. Warm wood finishes, sleek black metal frameworks and neutral cabinetry create a professional yet inviting atmosphere. Ergonomic workstations, suspended open shelving and thoughtfully integrated storage maximise space efficiency. Linear ceiling lighting, subtle accent illumination and indoor greenery enhance the ambience, while collaborative desk arrangements encourage productivity and seamless teamwork.", "hl": ["Ergonomic workstations", "Suspended open shelving", "Linear ceiling lighting", "Collaborative desk arrangements"], "pal": [["#efe9df", "Neutral"], ["#b98a56", "Warm wood"], ["#22201d", "Black metal"], ["#4f5a52", "Carpet grey"]], "img": ["sheik-01", "sheik-02", "sheik-03", "sheik-04", "sheik-05", "sheik-06", "sheik-07", "sheik-08", "sheik-09", "sheik-10", "sheik-11", "sheik-12", "sheik-13", "sheik-14", "sheik-15"]}, {"id": "sandhya", "name": "Sandhya Residence", "client": "Mrs. Sandhya", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Living", "Kitchen", "Pooja", "Bedrooms", "Study"], "feel": "Heritage · Luxurious · Warm", "blurb": "A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing.", "story": "A graceful fusion of traditional heritage and contemporary luxury, this residence showcases refined craftsmanship, warm neutral tones and elegant architectural detailing. The living area features sophisticated wall panelling, a sleek TV unit, illuminated display shelves and soft ambient lighting. The modular kitchen combines muted sage cabinetry with marble-inspired finishes and functional storage. An intricately carved wooden pooja mandapam, enriched with traditional artwork and golden accents, adds spiritual warmth and timeless grandeur.", "hl": ["Carved wooden pooja mandapam", "Illuminated display shelves", "Muted sage modular kitchen", "Marble-inspired finishes"], "pal": [["#f0e8da", "Warm neutral"], ["#a7b39a", "Muted sage"], ["#ddd5c8", "Marble"], ["#c79a45", "Golden accent"]], "img": ["sandhya-01", "sandhya-02", "sandhya-03", "sandhya-04", "sandhya-05", "sandhya-06", "sandhya-07", "sandhya-09", "sandhya-10", "sandhya-11", "sandhya-12", "sandhya-13", "sandhya-14"]}, {"id": "vaibhav", "name": "Vaibhav Residence", "client": "Mr. Vaibhav", "cat": "Residential", "kind": "Residence", "city": "Keelkattalai", "ct": "Chennai", "place": "Keelkattalai, Chennai", "spaces": ["Living", "Kitchen", "Pooja", "Bedrooms", "Foyer"], "feel": "Heritage · Botanical · Vibrant", "blurb": "A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design.", "story": "A captivating celebration of traditional elegance, this residence blends heritage-inspired craftsmanship with vibrant, nature-inspired design. The living area features ornate wooden furniture, delicate botanical wallpapers, peacock motifs and refreshing mint-green accents. The bedroom showcases rich green cabinetry, warm wooden furnishings and an artistic peacock-themed feature wall. A beautifully detailed devotional corner is complemented by traditional artwork and fluted wooden panelling.", "hl": ["Botanical wallpapers and peacock motifs", "Ornate wooden furniture", "Peacock-themed feature wall", "Devotional corner with fluted wooden panelling"], "pal": [["#f0eadd", "Ivory"], ["#9fcfb8", "Mint green"], ["#2f5b46", "Rich green"], ["#8a5a34", "Carved wood"]], "img": ["vaibhav-01", "vaibhav-02", "vaibhav-03", "vaibhav-04", "vaibhav-05", "vaibhav-06", "vaibhav-07", "vaibhav-08", "vaibhav-09"]}, {"id": "srinivasan", "name": "Srinivasan Residence", "client": "Mr. Srinivasan", "cat": "Residential", "kind": "Residence", "city": "Keelkattalai", "ct": "Chennai", "place": "Keelkattalai, Chennai", "spaces": ["Living", "Dining", "Kitchen", "Pooja", "Bedrooms", "Study", "Wardrobes"], "feel": "Traditional · Contemporary · Warm", "blurb": "A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort.", "story": "A harmonious blend of traditional craftsmanship and contemporary elegance, this residence celebrates timeless design with modern comfort. The living area features an intricately detailed wooden pooja unit, classic wall mouldings, warm ambient lighting and vibrant mustard-yellow seating that adds character to the space. The bedroom embraces a soothing neutral palette, complemented by elegant vertical panelling, integrated lighting and thoughtfully designed storage.", "hl": ["Intricately detailed wooden pooja unit", "Classic wall mouldings", "Mustard-yellow seating", "Vertical panelling with integrated lighting"], "pal": [["#efe7da", "Ivory"], ["#8b5a35", "Carved teak"], ["#cf9d33", "Mustard yellow"], ["#b9ab98", "Soft taupe"]], "img": ["srinivasan-01", "srinivasan-02", "srinivasan-03", "srinivasan-04", "srinivasan-05", "srinivasan-06", "srinivasan-07", "srinivasan-08", "srinivasan-09", "srinivasan-10", "srinivasan-11", "srinivasan-12", "srinivasan-14", "srinivasan-15", "srinivasan-16"]}, {"id": "navin", "name": "Navin Residence", "client": "Mr. Navin", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Living", "Dining", "Kitchen", "Pooja", "Bedrooms", "Study", "Wardrobes", "Foyer"], "feel": "Heritage · Classic · Harmonious", "blurb": "A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details.", "story": "A sophisticated fusion of traditional artistry and modern classic design, this residence showcases timeless elegance through warm wooden accents and refined architectural details. The living area features graceful wall mouldings, fluted detailing, soft neutral furnishings and elegant cove lighting. A beautifully crafted wooden pooja unit adds a distinctive traditional character, while the contemporary TV wall, coordinated cabinetry and thoughtfully arranged dining space create a harmonious balance of heritage, comfort and functionality.", "hl": ["Graceful wall mouldings and fluted detailing", "Elegant cove lighting", "Crafted wooden pooja unit", "Contemporary TV wall"], "pal": [["#efe6d8", "Warm ivory"], ["#9b6a3f", "Warm wood"], ["#c8ad84", "Fluted oak"], ["#d8b56a", "Cove glow"]], "img": ["navin-01", "navin-02", "navin-03", "navin-04", "navin-05", "navin-06", "navin-07", "navin-08", "navin-09", "navin-10", "navin-11", "navin-12", "navin-13", "navin-14", "navin-15", "navin-16", "navin-17"]}, {"id": "jeyashree", "name": "Jeyashree Residence", "client": "Mrs. Jeyashree", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Living", "Dining", "Kitchen", "Pooja", "Bedrooms", "Kids' room", "Study", "Wardrobes", "Foyer"], "feel": "Contemporary · Earthy · Elegant", "blurb": "A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents.", "story": "A beautiful expression of contemporary elegance, this residence blends warm neutrals, natural wood textures and refreshing earthy accents. The living area features sculptural wall detailing, delicate metallic décor, soft ivory seating and subtle ambient lighting. The modular kitchen combines olive-green cabinetry with warm wooden finishes and marble-inspired surfaces. A thoughtfully crafted pooja unit with decorative glass shutters adds traditional charm, creating a harmonious balance of modern comfort and timeless character.", "hl": ["Sculptural wall detailing", "Olive-green modular kitchen", "Pooja unit with decorative glass shutters", "Warm wooden finishes"], "pal": [["#f1eadf", "Ivory"], ["#b88a5a", "Natural wood"], ["#7d8455", "Olive green"], ["#b9a57e", "Metallic"]], "img": ["jeyashree-01", "jeyashree-02", "jeyashree-04", "jeyashree-05", "jeyashree-06", "jeyashree-07", "jeyashree-08", "jeyashree-09", "jeyashree-10", "jeyashree-11", "jeyashree-12", "jeyashree-13", "jeyashree-14", "jeyashree-15", "jeyashree-16", "jeyashree-17", "jeyashree-18", "jeyashree-19", "jeyashree-20", "jeyashree-21", "jeyashree-22"]}, {"id": "karthik", "name": "Karthik Residence", "client": "Dr. Karthik", "cat": "Residential", "kind": "Residence", "city": "Erode", "ct": "Erode", "place": "Erode", "spaces": ["Living", "Dining", "Kitchen", "Bedrooms", "Study", "Wardrobes"], "feel": "Fresh · Pastel · Cosy", "blurb": "A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details.", "story": "A refreshing interpretation of contemporary living, this residence combines soothing neutrals with playful pastel accents and elegant architectural details. The living area features textured sage-green wall panels, circular decorative elements, soft ivory seating and graceful curved openings. The bedroom introduces warm coral cabinetry, refined wall panelling and coordinated furnishings, creating a cosy retreat. A stylish window-side seating area with marble-inspired surfaces adds sophistication and functionality to this thoughtfully curated home.", "hl": ["Textured sage-green wall panels", "Graceful curved openings", "Warm coral cabinetry", "Window-side seating with marble-inspired surfaces"], "pal": [["#f1ebe0", "Soft ivory"], ["#a9b59a", "Sage green"], ["#e3a48d", "Warm coral"], ["#ddd6cb", "Marble"]], "img": ["karthik-03", "karthik-01", "karthik-02", "karthik-04", "karthik-05", "karthik-06", "karthik-07", "karthik-08", "karthik-09", "karthik-10", "karthik-11", "karthik-12", "karthik-13", "karthik-14"]}, {"id": "karthik-2", "name": "Karthik Residence — Phase 2", "client": "Dr. Karthik · Phase 2", "cat": "Residential", "kind": "Residence", "city": "Erode", "ct": "Erode", "place": "Erode", "spaces": ["Living"], "feel": "Minimal · Ivory · Serene", "blurb": "A refined celebration of contemporary minimalism, this residence embraces soft ivory tones, natural wood textures and refreshing green accents.", "story": "A refined celebration of contemporary minimalism, this residence embraces soft ivory tones, natural wood textures and refreshing green accents. The living area features elegant wall mouldings, floor-length curtains, plush seating and thoughtfully arranged accent lighting. A sophisticated TV feature wall with subtle metallic detailing and a floating console adds modern character. Warm wooden doors, layered textures and understated furnishings create a harmonious atmosphere of comfort, simplicity and timeless elegance.", "hl": ["Elegant wall mouldings", "TV feature wall with metallic detailing", "Floating console", "Warm wooden doors"], "pal": [["#f2ece2", "Soft ivory"], ["#a6784a", "Natural wood"], ["#93a07c", "Fresh green"], ["#b89a64", "Metallic trim"]], "img": ["karthik-2-01", "karthik-2-02", "karthik-2-04", "karthik-2-06", "karthik-2-07"]}, {"id": "kalpana", "name": "Kalpana Residence", "client": "Mrs. Kalpana", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Living", "Dining", "Kitchen", "Bedrooms", "Kids' room", "Wardrobes", "Foyer"], "feel": "Minimal · Soft · Understated", "blurb": "A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance.", "story": "A refined expression of modern minimalism, this residence embraces soft neutral tones, graceful curves and understated elegance. The living area features sculptural furniture, textured feature walls, subtle architectural detailing and warm ambient lighting. The bedroom combines elegant wall panelling with muted coral accents, creating a restful atmosphere. A contemporary modular kitchen with sleek cabinetry and a playful terrazzo-inspired backsplash adds functionality and character to this thoughtfully designed home.", "hl": ["Sculptural furniture and textured feature walls", "Wall panelling with muted coral accents", "Terrazzo-inspired kitchen backsplash", "Sleek modular cabinetry"], "pal": [["#f0e9df", "Soft neutral"], ["#d9c7b0", "Textured beige"], ["#d98b74", "Muted coral"], ["#cfc6bb", "Terrazzo"]], "img": ["kalpana-01", "kalpana-02", "kalpana-03", "kalpana-04", "kalpana-05", "kalpana-06", "kalpana-07", "kalpana-08", "kalpana-09", "kalpana-10", "kalpana-11", "kalpana-12", "kalpana-13", "kalpana-14", "kalpana-15", "kalpana-16"]}, {"id": "varun", "name": "Varun Residence", "client": "Mr. Varun", "cat": "Residential", "kind": "Residence", "city": "Bengaluru", "ct": "Bengaluru", "place": "Bengaluru", "spaces": ["Living", "Dining", "Kitchen", "Bedrooms", "Foyer"], "feel": "Japandi · Natural · Serene", "blurb": "A harmonious blend of Japandi-inspired simplicity and contemporary elegance, this residence celebrates natural textures, warm wood tones and understated luxury.", "story": "A harmonious blend of Japandi-inspired simplicity and contemporary elegance, this residence celebrates natural textures, warm wood tones and understated luxury. The living area features sleek TV panelling, floating cabinetry, soft neutral furnishings and a beautifully coordinated dining space. The bedroom showcases woven-texture wardrobe panels, delicate botanical artwork and soothing ambient lighting. Custom wooden cabinetry, intricate lattice detailing and refined finishes create a serene atmosphere of timeless comfort and sophistication.", "hl": ["Japandi-inspired living and dining", "Woven-texture wardrobe panels", "Intricate lattice detailing", "Floating cabinetry"], "pal": [["#ece5d9", "Neutral linen"], ["#b88c5e", "Warm wood"], ["#c9b896", "Woven texture"], ["#7c8a6a", "Botanical green"]], "img": ["varun-01", "varun-02", "varun-03", "varun-04", "varun-05", "varun-06", "varun-07", "varun-08", "varun-09", "varun-10", "varun-11", "varun-12", "varun-13", "varun-14", "varun-15"]}, {"id": "nihitha", "name": "Nihitha Sinha Residence", "client": "Mrs. Nihitha Sinha", "cat": "Residential", "kind": "Residence", "city": "Bengaluru", "ct": "Bengaluru", "place": "Bengaluru", "spaces": ["Living", "Dining", "Kitchen", "Bedrooms", "Study"], "feel": "Earthy · Green · Stylish", "blurb": "A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing.", "story": "A stylish interpretation of contemporary living, this residence combines earthy green tones, warm neutrals and refined architectural detailing. The living area features elegant fluted wall panelling, a sleek floating TV unit, illuminated display shelving and soft ambient lighting. The modular kitchen showcases sage-green cabinetry, contrasting ivory finishes and a textured backsplash. Decorative glass-front cabinets, warm wooden accents and thoughtfully arranged dining spaces create a welcoming atmosphere of modern comfort and sophistication.", "hl": ["Fluted wall panelling", "Illuminated display shelving", "Sage-green modular kitchen", "Decorative glass-front cabinets"], "pal": [["#efe9df", "Warm neutral"], ["#8f9c7e", "Sage green"], ["#f6f1e7", "Ivory"], ["#9c6c43", "Wood accent"]], "img": ["nihitha-01", "nihitha-02", "nihitha-03", "nihitha-05", "nihitha-06", "nihitha-07", "nihitha-09", "nihitha-10", "nihitha-11", "nihitha-12", "nihitha-13", "nihitha-14", "nihitha-16", "nihitha-17", "nihitha-18"]}, {"id": "naren", "name": "Naren Residence", "client": "Mr. Naren", "cat": "Residential", "kind": "Residence", "city": "Katpadi", "ct": "Vellore", "place": "Katpadi, Vellore", "spaces": ["Bedrooms", "Wardrobes"], "feel": "Minimal · Blush · Geometric", "blurb": "A sophisticated expression of modern minimalism, this residence embraces soft beige tones, delicate blush accents and elegant geometric detailing.", "story": "A sophisticated expression of modern minimalism, this residence embraces soft beige tones, delicate blush accents and elegant geometric detailing. The bedroom features a plush upholstered headboard, coordinated furnishings and floor-length curtains, creating a serene retreat. Custom wardrobes showcase graceful arched patterns with subtle metallic accents, while the contemporary TV unit mirrors the same design language. Clean lines, understated textures and thoughtful storage solutions create a harmonious balance of comfort, elegance and functionality.", "hl": ["Plush upholstered headboard", "Arched-pattern custom wardrobes", "Matching TV unit", "Geometric detailing"], "pal": [["#ece2d4", "Soft beige"], ["#e6c3b9", "Blush"], ["#c7a26a", "Metallic accent"], ["#8f7a66", "Warm taupe"]], "img": ["naren-01", "naren-02", "naren-03"]}];
  const PF_DET = [[0, 3, "Carved wooden pillar", "Pooja space, with an elephant bracket", "#7a4a28"], [1, 2, "Fluted wall & brass clock", "Decorative wall texture", "#a9b28e"], [1, 5, "Pendant lighting", "Pierced brass pendants in the living room", "#c9a35c"], [2, 3, "Lattice pooja unit", "Illuminated lattice shutters", "#a8692f"], [4, 2, "Illuminated circular mirror", "Wood-panelled feature wall", "#a0643a"], [4, 4, "Coffered ceiling", "Music studio, with linear lighting", "#6b4428"], [5, 1, "Corner pooja mandapam", "Intricate lattice, warm illumination", "#7a3e1e"], [9, 1, "Devotional corner", "Traditional artwork, fluted wooden panelling", "#24365e"]];
  const pfPad = n => String(n).padStart(2, '0');
  const pfZ = () => (typeof zoomF === 'function' ? zoomF() : 1);
  const pfSrc = id => DIC_PHOTO(id);          /* photos live in site/images */
  const pfSetImg = (im, id) => { im.src = pfSrc(id); };
  const pfReady = (im, ms) => new Promise(res => {          /* image decoded — or give up after ms */
    let done = false; const end = () => { if (!done) { done = true; res(); } };
    setTimeout(end, ms);
    if (im.complete && im.naturalWidth) { (im.decode ? im.decode() : Promise.resolve()).then(end, end); return; }
    im.addEventListener('load', () => (im.decode ? im.decode() : Promise.resolve()).then(end, end), { once: true });
    im.addEventListener('error', end, { once: true });
  });
  const pfEsc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let pfLive = false;

  const pfNum = s => parseInt(String(s).replace(/[^\d]/g, ''), 10) || 0;
  const pfFmt = n => n.toLocaleString('en-US');
  function pfCount(el) {
    if (el.dataset.done) return;
    const to = +el.dataset.pfcount;
    if (!to || (to >= 1900 && to <= 2100)) return;
    el.dataset.done = '1';
    if (reduceMotion) { el.textContent = pfFmt(to); return; }
    const t0 = performance.now(), dur = 1600;
    const step = now => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = pfFmt(Math.round(to * e));
      if (t < 1) requestAnimationFrame(step);
    };
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  const pfCountIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { pfCount(e.target); pfCountIO.unobserve(e.target); } }), { threshold: .6 });

  /* ---------- hero: the portfolio, bound as a magazine — paper pages that peel, curl and can be dragged ---------- */
  const pfMzDesk = $('#pfMzDesk'), pfMz = $('#pfMz'), pfMzL = $('#pfMzL'), pfMzR = $('#pfMzR'), pfMzLeaf = $('#pfMzLeaf');
  const pfMzF = $('.pf-mz-face.is-f .pf-mz-fc', pfMz), pfMzB = $('.pf-mz-face.is-b .pf-mz-fc', pfMz);
  const pfMzShF = $('.pf-mz-face.is-f .pf-mz-sh', pfMz), pfMzShB = $('.pf-mz-face.is-b .pf-mz-sh', pfMz);
  const pfMzTurn = $('#pfMzTurn'), pfMzTF = $('.pf-mz-tf', pfMzTurn), pfMzTFc = $('.pf-mz-tf .pf-mz-tc', pfMzTurn), pfMzLift = $('.pf-mz-lift', pfMzTurn);
  const pfMzTB = $('.pf-mz-tb', pfMzTurn), pfMzTBc = $('.pf-mz-tb .pf-mz-tc', pfMzTurn), pfMzCrease = $('.pf-mz-crease', pfMzTurn);
  const pfMzCast = $('.pf-mz-cast', pfMzTurn), pfMzCastI = $('.pf-mz-cast i', pfMzTurn);
  const pfMzRib = $('.pf-mz-ribbon', pfMz), pfMzTabs = $$('.pf-mz-tab', pfMz), pfMzTicks = $('#pfMzTicks'), pfMzChips = $$('.pf-mz-chips span', pfView), pfMzChipBox = $('.pf-mz-chips', pfView);
  const PF_MZ_DUR = 6000, PF_MZ_FLIP = 1300;
  const PF_MZ_W = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty', 'Twenty-one', 'Twenty-two', 'Twenty-three', 'Twenty-four'];
  const pfMzCities = [...new Set(PF.map(p => p.ct))];
  const pfMzArw = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9.5M8.5 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const pfMzClip = '<svg class="mz-clip" viewBox="0 0 24 70" aria-hidden="true"><path d="M8 58V16a5.5 5.5 0 0 1 11 0v44a9 9 0 0 1-18 0V22" fill="none" stroke="#7d6236" stroke-width="3.4" stroke-linecap="round"/><path d="M8 58V16a5.5 5.5 0 0 1 11 0v44a9 9 0 0 1-18 0V22" fill="none" stroke="#f1dcaa" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const pfMzBars = (() => {
    let x = 0, s = '';
    '21132112311221321131221312112311322'.split('').forEach((d, i) => { if (i % 2 === 0) s += `<rect x="${x}" width="${d}" height="40"/>`; x += +d; });
    return `<svg class="mz-bc" viewBox="0 0 ${x} 40" preserveAspectRatio="none" aria-hidden="true">${s}</svg>`;
  })();
  let pfMzCalm = 0, pfMzHintT = 0, pfMzSingle = false, pfMzI = 0, pfMzBusy = false, pfMzOpened = false, pfMzT = 0, pfMzVis = true, pfMzPaused = false, pfMzHold = false, pfMzUid = 0;

  const pfMzImg = (id, alt) => `<img src="${pfSrc(id)}" alt="${alt ? pfEsc(alt) : ''}" decoding="async">`;
  function pfMzBadge() {
    const id = 'pfMzArc' + (++pfMzUid), w = (PF_MZ_W[PF.length] || String(PF.length)).toUpperCase(), c = (PF_MZ_W[pfMzCities.length] || String(pfMzCities.length)).toUpperCase();
    return `<span class="mz-badge" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0"/></defs><text><textPath href="#${id}">• NEW ISSUE • ${w} SPACES • ${c} CITIES </textPath></text></svg><b><span>No.${PF.length}<small>Inside</small></span></b></span>`;
  }
  function pfMzFace(f) {
    if (f === 'leather') return `<div class="mz-leather"><span class="mz-lt-mono">DI</span><span class="mz-lt-t">De Interio</span><span class="mz-lt-r"></span><span class="mz-lt-s">The Portfolio</span><span class="mz-lt-y">${PF.length} projects · ${pfMzCities.length} cities</span></div>`;
    if (f === 'blank') return '<div class="mz-paper mz-blank"></div>';
    if (Array.isArray(f) && f[0] === 'back') return `<div class="mz-paper mz-blank"></div><div class="mz-thru">${pfMzFace(f[1])}</div>`;
    if (f === 'cover') {
      const lines = [2, 7, 1].filter(k => PF[k]).map(k => `<li><b>p.${pfPad(2 * k + 2)}</b><span>${pfEsc(PF[k].name)} <small>${pfEsc(PF[k].ct)}</small></span></li>`).join('');
      return `<div class="mz-cover">${pfMzImg(PF[0].img[1], PF[0].name)}<div class="mz-cv"><span class="mz-mast">De Interio</span><p class="mz-issue"><span>The Portfolio Issue</span><span>No. ${PF.length}</span><span>South India</span></p><p class="mz-cv-side"><b>Cover story</b>${pfEsc(PF[0].name)}, ${pfEsc(PF[0].place)}</p>${pfMzBadge()}<p class="mz-cv-big">${PF_MZ_W[PF.length] || PF.length} spaces,<br><em>${(PF_MZ_W[pfMzCities.length] || String(pfMzCities.length)).toLowerCase()} cities.</em></p><ul class="mz-cv-ls">${lines}</ul><div class="mz-cv-foot"><span>${pfMzCities.map(pfEsc).join(' · ')}</span>${pfMzBars}</div></div></div>`;
    }
    if (f === 'toc') return `<div class="mz-paper mz-toc"><p class="mz-run"><span>De Interio · The Portfolio</span><span>Contents</span></p><p class="mz-kick">In this issue</p><p class="mz-toc-h">${PF_MZ_W[PF.length] || PF.length} spaces, <em>start to finish.</em></p><ol class="mz-toc-l">${PF.map((p, k) => `<li><button type="button" data-go="${k}"><b>${pfPad(2 * k + 2)}</b><span>${pfEsc(p.name)}</span><small>${pfEsc(p.ct)}</small></button></li>`).join('')}</ol><p class="mz-folio"><span>De Interio</span><span>01</span></p></div>`;
    const t = f[0], k = f[1], p = PF[k];
    const facts = `<dl class="mz-facts"><div><dt>Client</dt><dd>${pfEsc(p.client)}</dd></div><div><dt>Locality</dt><dd>${pfEsc(p.city)}</dd></div><div><dt>Spaces</dt><dd>${p.spaces.length} areas</dd></div></dl>`;
    const read = `<button type="button" class="mz-read" data-open="${k}">Read the full story <i>${pfMzArw}</i></button>`;
    const body = `<p class="mz-body"><span class="mz-dc" aria-hidden="true">${pfEsc(p.blurb.charAt(0))}</span>${pfEsc(p.blurb.slice(1))}</p>`;
    if (t === 'ph') return `<div class="mz-ph">${pfMzImg(p.img[0], p.name)}<span class="mz-ph-no">No. ${pfPad(k + 1)} · ${pfEsc(p.kind)}</span><span class="mz-inset">${pfMzClip}${pfMzImg(p.img[1])}<em>${pfEsc(p.city)}</em></span><div class="mz-cap"><div><em>${pfEsc(p.feel)}</em><small>p. ${pfPad(2 * k + 2)} · ${pfEsc(p.client)}, ${pfEsc(p.place)}</small></div><button type="button" class="mz-view" data-open="${k}">View project ${pfMzArw}</button></div></div>`;
    if (t === 'tx') {
      const pal = p.pal.map(([c, n]) => `<li><i style="--c:${c}"></i><span>${pfEsc(n)}</span></li>`).join('');
      return `<div class="mz-paper mz-tx"><p class="mz-run"><span>De Interio · The Portfolio</span><span>${pfEsc(p.ct)}</span></p><span class="mz-no" aria-hidden="true">${pfPad(k + 1)}</span><p class="mz-kick">${pfEsc(p.place)}</p><p class="mz-t">${pfEsc(p.name)}</p><p class="mz-feel">${pfEsc(p.feel)}</p>${body}<div class="mz-end">${facts}<div class="mz-mat"><p>Material notes</p><ul>${pal}</ul></div>${read}</div><p class="mz-folio"><span>De Interio</span><span>${pfPad(2 * k + 3)}</span></p></div>`;
    }
    return `<div class="mz-paper mz-pg1"><div class="mz-pg1-ph">${pfMzImg(p.img[0], p.name)}<span class="mz-ph-no">No. ${pfPad(k + 1)} · ${pfEsc(p.kind)}</span></div><div class="mz-pg1-tx"><p class="mz-kick">${pfEsc(p.place)}</p><p class="mz-t">${pfEsc(p.name)}</p><p class="mz-feel">${pfEsc(p.feel)}</p>${body}${facts}<div class="mz-pg1-end">${read}<span class="mz-pg1-f">p. ${pfPad(2 * k + 2)}</span></div></div></div>`;
  }

  /* spreads (desktop): 0 = cover + contents, 1…n = photograph + story.  pages (phones): 0 cover, 1 contents, 2…n+1 projects */
  const pfMzN = () => PF.length + (pfMzSingle ? 2 : 1);
  const pfMzWrap = j => ((j % pfMzN()) + pfMzN()) % pfMzN();
  const pfMzLeft = j => (j ? ['ph', j - 1] : 'cover');
  const pfMzRight = j => (j ? ['tx', j - 1] : 'toc');
  const pfMzOne = j => (j === 0 ? 'cover' : j === 1 ? 'toc' : ['pg', j - 2]);
  const pfMzProj = j => j - (pfMzSingle ? 2 : 1);
  const pfMzMode = () => getComputedStyle(pfMzL).display === 'none';
  const pfMzWait = (box, ms) => Promise.all($$('img', box).map(im => pfReady(im, ms)));
  function pfMzBuildTicks() {
    const n = pfMzN();
    pfMzTicks.innerHTML = Array.from({ length: n }, (_, j) => {
      const k = pfMzProj(j);
      return `<button type="button" data-t="${j}" aria-label="${k >= 0 ? 'Turn to ' + pfEsc(PF[k].name) : (j === 0 ? 'Turn to the cover' : 'Turn to the contents')}"></button>`;
    }).join('');
  }
  let pfMzPalK = -2;
  function pfMzMeta(j) {
    j = j === undefined ? pfMzI : j;
    const k = pfMzProj(j);
    pfMz.style.setProperty('--mzp', (j / (pfMzN() - 1)).toFixed(3));
    pfMz.classList.toggle('is-first', j === 0);
    $('#pfMzNo').textContent = k >= 0 ? `No. ${pfPad(k + 1)}` : (pfMzSingle && j === 1 ? 'p. 01' : 'Cover');
    $('#pfMzNt').textContent = k >= 0 ? PF[k].name : (pfMzSingle && j === 1 ? 'Contents' : 'Contents & cover story');
    pfMzTabs.forEach(t => t.classList.toggle('is-on', k >= 0 && PF[k].ct === t.dataset.ct));
    $$('button', pfMzTicks).forEach((b, i) => { b.classList.toggle('is-on', i === j); b.setAttribute('aria-current', i === j ? 'page' : 'false'); });
    const pk = Math.max(0, k);
    if (pk !== pfMzPalK && pfMzChipBox) {
      const first = pfMzPalK === -2; pfMzPalK = pk;
      const put = () => PF[pk].pal.forEach((c, i) => { const s = pfMzChips[i]; if (!s) return; $('i', s).style.setProperty('--c', c[0]); $('b', s).textContent = c[1]; });
      if (first || reduceMotion) put();
      else { pfMzChipBox.classList.add('is-swap'); setTimeout(() => { put(); pfMzChipBox.classList.remove('is-swap'); }, 520); }
    }
  }
  function pfMzPaint() {
    if (pfMzSingle) { pfMzR.innerHTML = pfMzFace(pfMzOne(pfMzI)); pfMzL.innerHTML = ''; }
    else { pfMzL.innerHTML = pfMzFace(pfMzLeft(pfMzI)); pfMzR.innerHTML = pfMzFace(pfMzRight(pfMzI)); }
    pfMzMeta();
  }
  function pfMzPre() {                       /* warm the photographs either side */
    [1, -1].forEach(s => {
      const k = pfMzProj(pfMzWrap(pfMzI + s));
      if (k < 0 || k >= PF.length) return;
      const im = new Image(); im.decoding = 'async'; im.src = pfSrc(PF[k].img[0]);
      if (!pfMzSingle) { const i2 = new Image(); i2.src = pfSrc(PF[k].img[1]); }
    });
  }

  /* ===== the paper engine =====
     Book space: origin at the top of the spine, x to the right, y down. The turning sheet is folded along the
     perpendicular bisector of its corner and the point the corner is pulled to. The flat part stays (front, clipped),
     the folded flap shows the reverse of the sheet (back, mirrored then reflected = a rigid rotation), and the page
     underneath is revealed with a soft cast shadow along the fold. */
  const pfMzG = { on: false, peek: false, raf: 0, P: [0, 0] };
  function pfMzHalf(poly, mid, n, keep) {
    const out = [], f = p => ((p[0] - mid[0]) * n[0] + (p[1] - mid[1]) * n[1]) * keep;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  const pfMzPoly = (pts, ox) => (pts.length > 2 ? 'polygon(' + pts.map(p => `${(p[0] - ox).toFixed(2)}px ${p[1].toFixed(2)}px`).join(',') + ')' : 'polygon(0 0,0 0,0 0)');
  function pfMzClamp(P) {
    const { W, H, cy } = pfMzG, oy = cy ? 0 : H, D = Math.hypot(W, H);
    let x = P[0], y = P[1], dx = x, dy = y - cy, r = Math.hypot(dx, dy);
    if (r > W) { x = dx * W / r; y = cy + dy * W / r; }              /* the sheet can't stretch away from the spine */
    dx = x; dy = y - oy; r = Math.hypot(dx, dy);
    if (r > D) { x = dx * D / r; y = oy + dy * D / r; }
    return [x, y];
  }
  const pfMzBand = (el, x, y, ang, w, h, o) => { el.style.width = w + 'px'; el.style.height = h + 'px'; el.style.transform = `translate(${x}px,${y}px) rotate(${ang}rad) translateY(-50%)`; el.style.opacity = o; };
  function pfMzSet(P) {
    const g = pfMzG; P = pfMzClamp(P); g.P = P;
    const { W, H, d, cy } = g, C0 = [d * W, cy], vx = C0[0] - P[0], vy = C0[1] - P[1], len = Math.hypot(vx, vy);
    const sheet = d > 0 ? [[0, 0], [W, 0], [W, H], [0, H]] : [[-W, 0], [0, 0], [0, H], [-W, H]];
    const offF = d > 0 ? 0 : -W, offB = d > 0 ? -W : 0, diag = Math.hypot(W, H);
    if (len < .5) {
      pfMzTF.style.clipPath = 'none'; pfMzTB.style.clipPath = 'polygon(0 0,0 0,0 0)';
      pfMzCrease.style.opacity = 0; pfMzCastI.style.opacity = 0; pfMzLift.style.opacity = 0; return;
    }
    const n = [vx / len, vy / len], mid = [(C0[0] + P[0]) / 2, (C0[1] + P[1]) / 2];
    const N = pfMzHalf(sheet, mid, n, -1), F = pfMzHalf(sheet, mid, n, 1);
    pfMzTF.style.clipPath = pfMzPoly(N, offF);
    const a = -(1 - 2 * n[0] * n[0]), b = 2 * n[0] * n[1], c = -2 * n[0] * n[1], dd = 1 - 2 * n[1] * n[1];
    const k2 = 2 * (mid[0] * n[0] + mid[1] * n[1]), t0 = k2 * n[0], t1 = k2 * n[1];
    pfMzTB.style.transform = `matrix(${a},${b},${c},${dd},${a * offB + t0 - offB},${b * offB + t1})`;
    pfMzTB.style.clipPath = pfMzPoly(F.map(p => [-p[0], p[1]]), offB);
    const prog = Math.min(1, Math.abs(vx) / (2 * W)), k = Math.min(1, len / (W * .28)) * (1 - Math.pow(prog, 2.4));
    pfMzBand(pfMzCrease, -mid[0] - offB, mid[1], Math.atan2(n[1], -n[0]), Math.min(len * .62, W * .8) + 1, diag * 4, k);
    pfMzBand(pfMzCastI, mid[0] - offF, mid[1], Math.atan2(n[1], n[0]), Math.min(len * .5, W * .42) + 1, diag * 4, k);
    pfMzBand(pfMzLift, mid[0] - offF, mid[1], Math.atan2(-n[1], -n[0]), Math.min(len * .35, W * .3) + 1, diag * 4, k * .9);
  }
  function pfMzBegin(to, d, cy) {
    const g = pfMzG, one = pfMzSingle, W = one ? pfMz.offsetWidth : pfMz.offsetWidth / 2, H = pfMz.offsetHeight, sx = one ? 0 : W, from = pfMzI;
    cancelAnimationFrame(g.raf);
    Object.assign(g, { on: true, peek: false, to, from, d, cy: cy ? H : 0, W, H, one });
    let front, back;
    if (one) { front = d > 0 ? pfMzOne(from) : null; back = d > 0 ? ['back', pfMzOne(from)] : pfMzOne(to); }
    else if (d > 0) { front = pfMzRight(from); back = pfMzLeft(to); }
    else { front = pfMzLeft(from); back = pfMzRight(to); }
    pfMzTFc.innerHTML = front ? pfMzFace(front) : '';
    pfMzTF.style.display = front ? '' : 'none';
    pfMzTF.classList.toggle('is-l', d < 0 && !one);
    pfMzCast.style.display = front ? '' : 'none';
    pfMzTBc.innerHTML = pfMzFace(back);
    const fl = d > 0 ? sx : sx - W, bl = d > 0 ? sx - W : sx;
    [pfMzTF, pfMzCast].forEach(el => { el.style.left = fl + 'px'; el.style.width = W + 'px'; });
    pfMzTB.style.left = bl + 'px'; pfMzTB.style.width = W + 'px';
    pfMzTurn.classList.add('is-on'); pfMz.classList.add('is-turning');
    pfMzSet([d * W, g.cy]);
    /* the page underneath, revealed as the sheet lifts (the old page is kept aside, already decoded, in case the turn is let go) */
    g.under = one ? (d > 0 ? pfMzR : null) : (d > 0 ? pfMzR : pfMzL);
    g.stash = g.under ? [...g.under.childNodes] : null;
    if (g.under) g.under.innerHTML = pfMzFace(one ? pfMzOne(to) : d > 0 ? pfMzRight(to) : pfMzLeft(to));
  }
  function pfMzAnim(target, dur, arc) {
    const g = pfMzG, P0 = g.P.slice(), lift = arc ? g.H * .1 * (g.cy ? -1 : 1) : 0;
    cancelAnimationFrame(g.raf);
    return new Promise(res => {
      const t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / dur), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        pfMzSet([P0[0] + (target[0] - P0[0]) * e, P0[1] + (target[1] - P0[1]) * e + lift * Math.sin(Math.PI * e)]);
        if (t < 1) g.raf = requestAnimationFrame(step); else res();
      };
      g.raf = requestAnimationFrame(step);
    });
  }
  function pfMzClose() {
    const g = pfMzG;
    pfMzTurn.classList.remove('is-on'); pfMz.classList.remove('is-turning');
    pfMzTFc.innerHTML = ''; pfMzTBc.innerHTML = '';
    g.on = false; g.peek = false;
  }
  function pfMzRevert() { const g = pfMzG; if (g.under && g.stash) g.under.replaceChildren(...g.stash); }
  function pfMzAbort() { cancelAnimationFrame(pfMzG.raf); if (pfMzG.on) { pfMzRevert(); pfMzClose(); } }
  function pfMzFinish(commit) {
    const g = pfMzG;
    if (commit) {
      /* the flap now lies flat on the opposite page: hand its (decoded) page over to that slot */
      const dest = g.one ? (g.d < 0 ? pfMzR : null) : (g.d > 0 ? pfMzL : pfMzR);
      if (dest) dest.replaceChildren(...pfMzTBc.childNodes);
      pfMzI = g.to;
      pfMzRib.classList.remove('is-kick'); void pfMzRib.offsetWidth; pfMzRib.classList.add('is-kick');
    } else pfMzRevert();
    pfMzClose(); pfMzMeta(); pfMzBusy = false;
    if (pfMzMode() !== pfMzSingle) pfMzReflow(); else pfMzPre();
    pfMzQueue();
  }
  function pfMzGo(to, dir, auto) {
    if (!auto) pfMzTouched();
    to = pfMzWrap(to);
    const g = pfMzG;
    if (pfMzBusy || !pfMzOpened || to === pfMzI) { pfMzQueue(); return; }
    dir = dir || (to > pfMzI ? 1 : -1);
    clearTimeout(pfMzT); pfMzDesk.classList.remove('is-auto');
    if (reduceMotion) { if (g.on) pfMzAbort(); pfMzI = to; pfMzPaint(); pfMzQueue(); return; }
    pfMzBusy = true;
    const cont = g.on && g.peek && g.to === to && g.d === dir;
    if (g.on && !cont) pfMzAbort();
    if (!cont) pfMzBegin(to, dir, 1);
    g.peek = false;
    pfMzMeta(to);
    const run = () => pfMzAnim([-dir * g.W, g.cy], PF_MZ_FLIP, true).then(() => pfMzFinish(true));
    if (cont) run();
    else Promise.all([pfMzWait(pfMzTurn, 700), pfMzWait(dir > 0 ? pfMzR : pfMzL, 700)]).then(run);
  }
  function pfMzPeek(d, on) {                 /* a mouse resting on a corner lifts it a little */
    const g = pfMzG;
    if (reduceMotion || !pfMzOpened || pfMzDrag) return;
    if (on) {
      if (pfMzBusy || g.on || (d < 0 && pfMzI === 0)) return;
      pfMzBegin(pfMzWrap(pfMzI + d), d, 1); g.peek = true;
      pfMzAnim([d * g.W * .8, g.H * .9], 480, false);
    } else if (g.on && g.peek) {
      pfMzAnim([d * g.W, g.H], 320, false).then(() => { if (g.on && g.peek) pfMzAbort(); });
    }
  }

  function pfMzTouched() {               /* someone is reading: hide the hint and give them longer before the next automatic turn */
    pfMzCalm = performance.now() + 9000;
    clearTimeout(pfMzHintT); pfMz.parentElement.classList.remove('is-hint');
  }

  /* the hard cover opens once, the first time the page is shown */
  function pfMzOpen() {
    if (pfMzOpened) return;
    pfMzOpened = true;
    pfMzSingle = pfMzMode(); pfMzI = 0; pfMzBuildTicks(); pfMzPaint();
    if (reduceMotion) { pfMz.classList.remove('is-closed'); pfMzLeaf.classList.remove('is-on'); pfMzQueue(); return; }
    pfMzBusy = true;
    pfMzF.innerHTML = pfMzFace('leather'); pfMzB.innerHTML = pfMzFace(pfMzSingle ? 'blank' : 'cover');
    pfMzLeaf.classList.remove('is-back'); pfMzLeaf.classList.add('is-on');
    Promise.all([pfMzWait(pfMzB, 1200), pfMzWait(pfMzR, 1200)]).then(() => {
      pfMz.classList.add('is-opening');
      pfMz.classList.remove('is-closed');
      const kf = pfMzSingle
        ? [{ transform: 'rotateY(0deg)', opacity: 1 }, { opacity: 1, offset: .62 }, { transform: 'rotateY(-180deg)', opacity: 0 }]
        : [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }];
      const a = pfMzLeaf.animate(kf, { duration: 1600, easing: 'cubic-bezier(.6,.02,.2,1)', fill: 'forwards' });
      const s1 = pfMzShF.animate([{ opacity: 0 }, { opacity: .5 }], { duration: 800, easing: 'ease-in', fill: 'forwards' });
      const s2 = pfMzShB.animate([{ opacity: .5 }, { opacity: 0 }], { duration: 800, delay: 800, easing: 'ease-out', fill: 'both' });
      a.onfinish = () => {
        pfMz.classList.remove('is-opening');
        pfMzLeaf.classList.remove('is-on');
        a.cancel(); s1.cancel(); s2.cancel();
        pfMzF.innerHTML = ''; pfMzB.innerHTML = '';
        pfMzRib.classList.add('is-kick');
        pfMzBusy = false; pfMzPre();
        pfMzQueue(4800);
        if (!reduceMotion) { pfMzHintT = setTimeout(() => { pfMz.parentElement.classList.add('is-hint'); pfMzHintT = setTimeout(() => pfMz.parentElement.classList.remove('is-hint'), 6000); }, 900); }
      };
    });
  }
  function pfMzReflow() {                    /* spread ↔ single page when the screen changes */
    const s = pfMzMode();
    if (s === pfMzSingle) return;
    if (pfMzBusy && !(pfMzG.on && pfMzG.peek)) return;
    if (pfMzG.on) pfMzAbort();
    pfMzI = s ? (pfMzI ? pfMzI + 1 : 0) : Math.max(0, pfMzI - 1);
    pfMzSingle = s; pfMzPalK = -2;
    pfMzBuildTicks(); pfMzPaint();
  }
  function pfMzQueue(first) {
    clearTimeout(pfMzT);
    const cs = document.getElementById('pfCs');
    const auto = !reduceMotion && pfMzOpened && !pfMzBusy && !pfMzG.on && pfMzVis && pfLive && !pfMzPaused && !pfMzHold && !document.hidden && !(cs && cs.open);
    const d = first || (performance.now() < pfMzCalm ? 12000 : PF_MZ_DUR);
    pfMzDesk.classList.remove('is-auto'); void pfMzDesk.offsetWidth;
    pfMzDesk.style.setProperty('--mzdur', d + 'ms');
    pfMzDesk.classList.toggle('is-auto', auto);
    pfMzDesk.classList.toggle('is-paused', pfMzPaused);
    $('#pfMzPause').setAttribute('aria-label', pfMzPaused ? 'Resume page turning' : 'Pause page turning');
    if (auto) pfMzT = setTimeout(() => { const c = document.getElementById('pfCs'); if (c && c.open) { pfMzQueue(); return; } pfMzGo(pfMzI + 1, 1, true); }, d);
  }

  /* drag a page by hand — mouse or finger, from anywhere on the page */
  let pfMzDrag = null, pfMzNoClick = false;
  pfMz.addEventListener('pointerdown', e => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || reduceMotion || !pfMzOpened) return;
    if (pfMzBusy && !(pfMzG.on && pfMzG.peek)) return;
    if (e.target.closest('.pf-mz-tabs')) return;
    const r = pfMz.getBoundingClientRect(), z = pfZ();
    pfMzDrag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, bx: (e.clientX - r.left) / z, by: (e.clientY - r.top) / z, on: false, t0: performance.now() };
  });
  pfMz.addEventListener('pointermove', e => {
    const D = pfMzDrag;
    if (!D || e.pointerId !== D.id) return;
    const dx = e.clientX - D.x0, dy = e.clientY - D.y0, z = pfZ();
    if (!D.on) {
      if (Math.abs(dx) < 9 || Math.abs(dx) < Math.abs(dy) * 1.15) { if (Math.abs(dy) > 16) pfMzDrag = null; return; }
      const d = dx < 0 ? 1 : -1, half = pfMz.offsetWidth / 2;
      if (!pfMzSingle && ((d > 0 && D.bx < half) || (d < 0 && D.bx > half))) { pfMzDrag = null; return; }
      const g = pfMzG, cy = D.by > pfMz.offsetHeight * .42 ? 1 : 0;
      if (!(g.on && g.peek && g.d === d && !!g.cy === !!cy)) { if (g.on) pfMzAbort(); pfMzBegin(pfMzWrap(pfMzI + d), d, cy); }
      cancelAnimationFrame(g.raf); g.peek = false;
      pfMzBusy = true; clearTimeout(pfMzT); pfMzDesk.classList.remove('is-auto');
      pfMzTouched();
      D.on = true; D.d = d; D.P0 = g.P.slice(); D.x1 = e.clientX; D.t1 = performance.now(); D.v = 0;
      try { pfMz.setPointerCapture(e.pointerId); } catch (_) { }
    }
    const now = performance.now();
    D.v = (e.clientX - D.x1) / Math.max(1, now - D.t1); D.x1 = e.clientX; D.t1 = now;
    const gain = pfMzSingle ? 1.7 : 1.2;
    pfMzSet([D.P0[0] + dx / z * gain, D.P0[1] + dy / z * gain * .8]);
  });
  const pfMzUp = e => {
    const D = pfMzDrag;
    if (!D || e.pointerId !== D.id) return;
    pfMzDrag = null;
    if (!D.on) return;
    pfMzNoClick = true; setTimeout(() => { pfMzNoClick = false; }, 60);
    const g = pfMzG, prog = (g.d * g.W - g.P[0]) * g.d / (2 * g.W);
    const flick = performance.now() - D.t1 < 120 && D.v * -g.d > .45;
    const commit = e.type !== 'pointercancel' && (prog > .32 || flick);
    if (commit) pfMzMeta(g.to);
    pfMzAnim(commit ? [-g.d * g.W, g.cy] : [g.d * g.W, g.cy], Math.max(260, (commit ? 1 - prog : prog) * 900), commit).then(() => pfMzFinish(commit));
  };
  pfMz.addEventListener('pointerup', pfMzUp);
  pfMz.addEventListener('pointercancel', pfMzUp);
  pfMz.addEventListener('click', e => { if (pfMzNoClick) { e.stopPropagation(); e.preventDefault(); } }, true);

  const pfMzNext = () => pfMzGo(pfMzI + 1, 1), pfMzPrev = () => pfMzGo(pfMzI - 1, -1);
  $('#pfMzNext').addEventListener('click', pfMzNext);
  $('#pfMzPrev').addEventListener('click', pfMzPrev);
  $('#pfMzEarN').addEventListener('click', pfMzNext);
  $('#pfMzEarP').addEventListener('click', pfMzPrev);
  [['#pfMzEarN', 1], ['#pfMzEarP', -1]].forEach(([s, d]) => {
    $(s).addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pfMzPeek(d, true); });
    $(s).addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pfMzPeek(d, false); });
  });
  $('#pfMzToc').addEventListener('click', () => pfMzGo(pfMzSingle ? 1 : 0, -1));
  $('#pfMzPause').addEventListener('click', () => { pfMzPaused = !pfMzPaused; pfMzQueue(); });
  pfMzTicks.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { const j = +b.dataset.t; pfMzGo(j, j > pfMzI ? 1 : -1); } });
  pfMzTabs.forEach(t => t.addEventListener('click', () => {
    const k = PF.findIndex(p => p.ct === t.dataset.ct);
    if (k >= 0) { const j = k + (pfMzSingle ? 2 : 1); pfMzGo(j, j > pfMzI ? 1 : -1); }
  }));
  pfMz.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) pfMzGo(+b.dataset.go + (pfMzSingle ? 2 : 1), 1); });
  pfMz.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); pfMzNext(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pfMzPrev(); }
  });
  pfMz.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { pfMzHold = true; pfMzQueue(); } });
  pfMz.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { pfMzHold = false; pfMzQueue(); } });
  new IntersectionObserver(e => { pfMzVis = e[0].isIntersecting; pfMzQueue(); }, { threshold: .35 }).observe(pfMz);
  let pfMzRz = 0;
  addEventListener('resize', () => { clearTimeout(pfMzRz); pfMzRz = setTimeout(pfMzReflow, 160); });
  document.getElementById('pfCs').addEventListener('close', () => { if (pfLive) pfMzQueue(); });

  pfMzSingle = pfMzMode();
  pfMzBuildTicks();
  pfMzPaint();
  if (reduceMotion) { pfMz.classList.remove('is-closed'); pfMzOpened = true; }
  else { pfMzF.innerHTML = pfMzFace('leather'); pfMzLeaf.classList.add('is-on'); }

  /* ---------- 01 selected works: cards stack like a sample book ---------- */
  const pfFsCards = $$('.pf-fs-card', pfView);
  let pfFsTick = false;
  const pfFsIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-vis'); pfFsIO.unobserve(e.target); } }), { threshold: .22 });
  pfFsCards.forEach(c => pfFsIO.observe(c));
  function pfFsRun() {
    pfFsTick = false;
    if (DIC_VW() <= 860 || reduceMotion || pfView.hidden) return;
    const n = pfFsCards.length;
    pfFsCards.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      c.style.setProperty('--py', (((r.top + r.height / 2) / innerHeight - .5) * -46).toFixed(1) + 'px');
      if (i < n - 1) {
        const nx = pfFsCards[i + 1].getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (r.bottom - nx.top) / r.height));
        c.style.setProperty('--sc', (1 - p * .07).toFixed(4));
        c.style.setProperty('--dim', (p * .5).toFixed(3));
      }
    });
  }
  addEventListener('scroll', () => { if (!pfFsTick) { pfFsTick = true; requestAnimationFrame(pfFsRun); } }, { passive: true });

  /* ---------- 02 the portfolio: projects and their details on one grid — two rows first, "Show all" for the rest ---------- */
  const pfTg = $('#pfTg'), pfTgCells = $$('.pf-tg-c', pfTg), pfTgFs = $$('.pf-tg-f', pfView), pfTgLine = $('.pf-tg-line', pfView);
  const pfTgAll = $('#pfTgAll'), pfTgAllW = pfTgAll.parentElement;
  let pfTgF = 'all', pfTgOpen = false, pfTgRz = 0;
  const pfTgMatch = c => pfTgF === 'all' || (pfTgF === 'detail' ? c.dataset.kind === 'detail' : c.dataset.cat === pfTgF);
  function pfTgCols() {
    const v = getComputedStyle(pfTg).gridTemplateColumns, m = /repeat\((\d+)/.exec(v);
    return m ? +m[1] : Math.max(1, v.split(' ').filter(Boolean).length);
  }
  function pfTgLay() {
    const cols = pfTgCols(), lim = Math.max(6, cols * 2), vis = pfTgCells.filter(pfTgMatch);
    pfTgCells.forEach(c => { c.hidden = !vis.includes(c); });
    vis.forEach((c, k) => { c.classList.toggle('is-cut', !pfTgOpen && k >= lim); c.style.setProperty('--k', k % cols); });
    pfTgAllW.hidden = vis.length <= lim;
    $('#pfTgAllN').textContent = vis.length;
    pfTgAll.classList.toggle('is-open', pfTgOpen);
    pfTgAll.setAttribute('aria-expanded', String(pfTgOpen));
    $('#pfTgN').textContent = pfPad(vis.filter(c => c.dataset.kind === 'project').length);
    $('#pfTgD').textContent = pfPad(vis.filter(c => c.dataset.kind === 'detail').length);
    const b = pfTgFs.find(x => x.classList.contains('is-on'));
    if (b && pfTgLine) { pfTgLine.style.setProperty('--l', b.offsetLeft + 'px'); pfTgLine.style.setProperty('--w', b.offsetWidth + 'px'); pfTgLine.style.top = (b.offsetTop + b.offsetHeight - 1) + 'px'; }
  }
  function pfTgApply(f) {
    if (f === pfTgF) return;
    pfTgF = f; pfTgOpen = false;
    pfTgFs.forEach(b => { const on = b.dataset.f === f; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    const swap = () => {
      pfTgCells.forEach(c => c.classList.remove('is-enter'));
      pfTgLay();
      void pfTg.offsetWidth;
      pfTgCells.filter(c => !c.hidden && !c.classList.contains('is-cut')).forEach(c => c.classList.add('is-vis', 'is-enter'));
      pfTg.classList.remove('is-swap');
    };
    if (reduceMotion) { swap(); return; }
    const b = pfTgFs.find(x => x.classList.contains('is-on'));
    if (b && pfTgLine) { pfTgLine.style.setProperty('--l', b.offsetLeft + 'px'); pfTgLine.style.setProperty('--w', b.offsetWidth + 'px'); }
    pfTg.classList.add('is-swap');
    setTimeout(swap, 280);
  }
  pfTgFs.forEach(b => b.addEventListener('click', () => pfTgApply(b.dataset.f)));
  pfTgAll.addEventListener('click', () => {
    pfTgOpen = !pfTgOpen;
    if (pfTgOpen) { pfTgLay(); return; }                      /* the newly shown cards reveal as they scroll in */
    pfTgLay();
    const y = pfTg.getBoundingClientRect().top;
    if (y < 0) scrollTo({ top: scrollY + y - 140, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  const pfTgIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-vis'); pfTgIO.unobserve(e.target); } }), { threshold: .14 });
  pfTgCells.forEach(c => pfTgIO.observe(c));
  addEventListener('resize', () => { clearTimeout(pfTgRz); pfTgRz = setTimeout(pfTgLay, 150); });
  pfTgLay();

  /* ---------- 03 where we've built: map, routes and city panels ---------- */
  const pfMapArt = $('#pfMapArt'), pfPins = $$('.pf-pin', pfView), pfCpts = $$('.pf-cpt', pfView), pfCps = $$('.pf-cp', pfView);
  const pfPops = $$('.pf-pop', pfView), pfArcs = $$('.pf-arc, .pf-km', pfView);
  const PF_CITIES = pfCpts.map(b => b.dataset.city);
  let pfCityT = 0, pfCityVis = false, pfCityUser = false, pfCityK = 0;
  function pfPopPlace() {
    const box = pfMapArt.getBoundingClientRect(), z = pfZ();
    pfPops.forEach(pp => {
      const pin = pfPins.find(pn => pn.dataset.city === pp.dataset.city);
      if (!pin) return;
      const r = $('.pf-pin-d', pin).getBoundingClientRect();
      pp.style.setProperty('--px', ((r.left + r.width / 2 - box.left) / z).toFixed(1) + 'px');
      pp.style.setProperty('--py', ((r.top - box.top) / z).toFixed(1) + 'px');
    });
  }
  function pfCity(c) {
    pfCityK = Math.max(0, PF_CITIES.indexOf(c));
    const on = el => el.dataset.city === c;
    pfCpts.forEach(b => { b.classList.toggle('is-on', on(b)); b.setAttribute('aria-selected', String(on(b))); });
    pfCps.forEach(p => p.classList.toggle('is-on', on(p)));
    pfPins.forEach(p => p.classList.toggle('is-on', on(p)));
    pfPops.forEach(p => p.classList.toggle('is-on', on(p)));
    pfArcs.forEach(a => a.classList.toggle('is-on', on(a)));
  }
  function pfCityQueue() {
    clearTimeout(pfCityT);
    if (reduceMotion || pfCityUser || !pfCityVis || !pfLive || document.hidden) return;
    pfCityT = setTimeout(() => { pfCity(PF_CITIES[(pfCityK + 1) % PF_CITIES.length]); pfCityQueue(); }, 4200);
  }
  const pfCityPick = c => { pfCityUser = true; clearTimeout(pfCityT); pfCity(c); };
  pfPins.forEach(pn => {
    pn.addEventListener('pointerenter', () => pfCityPick(pn.dataset.city));
    pn.addEventListener('click', () => pfCityPick(pn.dataset.city));
  });
  pfCpts.forEach(b => b.addEventListener('click', () => pfCityPick(b.dataset.city)));
  $('.pf-map-side', pfView).addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { pfCityUser = true; clearTimeout(pfCityT); } });
  new IntersectionObserver(e => { pfCityVis = e[0].isIntersecting; if (pfCityVis) pfPopPlace(); pfCityQueue(); }, { threshold: .3 }).observe($('#pfMap'));
  pfCity(PF_CITIES[0]);

  /* ---------- detail zoom viewer: tap a detail tile in the grid to open it under the loupe (touch, mouse and keys) ---------- */
  const pfMag = $('#pfMag'), pfMagView = $('#pfMagView'), pfMagImg = $('#pfMagImg'), pfMagHint = $('#pfMagHint');
  const PF_MAX = 4;
  let pfMk = 0, pfMs = 1, pfMx = 0, pfMy = 0, pfMb = { w: 0, h: 0, vw: 0, vh: 0 }, pfMagOpener = null;
  function pfMagFit() {
    const v = pfMagView.getBoundingClientRect(), z = pfZ();
    const vw = v.width / z, vh = v.height / z, nw = pfMagImg.naturalWidth || 1600, nh = pfMagImg.naturalHeight || 1000;
    const k = Math.min(vw / nw, vh / nh);
    pfMb = { w: nw * k, h: nh * k, vw, vh };
    pfMagImg.style.width = pfMb.w.toFixed(1) + 'px'; pfMagImg.style.height = pfMb.h.toFixed(1) + 'px';
  }
  function pfMagApply(anim) {
    const sw = pfMb.w * pfMs, sh = pfMb.h * pfMs;
    const mx = Math.max(0, (sw - pfMb.vw) / 2), my = Math.max(0, (sh - pfMb.vh) / 2);
    pfMx = Math.max(-mx, Math.min(mx, pfMx)); pfMy = Math.max(-my, Math.min(my, pfMy));
    pfMagImg.style.transition = anim && !reduceMotion ? 'transform .45s cubic-bezier(.22,1,.36,1)' : 'none';
    pfMagImg.style.transform = `translate(-50%,-50%) translate(${pfMx.toFixed(1)}px,${pfMy.toFixed(1)}px) scale(${pfMs.toFixed(3)})`;
    $('#pfMagLv').textContent = (Math.round(pfMs * 10) / 10) + '×';
    pfMagView.classList.toggle('is-zoom', pfMs > 1.01);
    $('#pfMagOut').disabled = pfMs <= 1.01; $('#pfMagIn').disabled = pfMs >= PF_MAX - .01;
  }
  function pfMagZoom(s2, cx = 0, cy = 0, anim = true) {
    s2 = Math.max(1, Math.min(PF_MAX, s2));
    pfMx = cx + (pfMx - cx) * (s2 / pfMs); pfMy = cy + (pfMy - cy) * (s2 / pfMs);
    pfMs = s2; pfMagApply(anim);
    pfMagHint.classList.add('is-off');
  }
  const pfMagC = (x, y) => { const v = pfMagView.getBoundingClientRect(), z = pfZ(); return { x: (x - v.left - v.width / 2) / z, y: (y - v.top - v.height / 2) / z }; };
  function pfMagShow(k) {
    pfMk = (k + PF_DET.length) % PF_DET.length;
    const [pi, ii, m, note, sw] = PF_DET[pfMk], p = PF[pi];
    pfMs = 1; pfMx = pfMy = 0;
    pfMagImg.style.opacity = '0';
    pfSetImg(pfMagImg, p.img[ii]);
    pfMagImg.alt = `${m} — ${p.name}`;
    pfReady(pfMagImg, 2500).then(() => { pfMagFit(); pfMagApply(false); pfMagImg.style.transition = 'opacity .35s ease'; pfMagImg.style.opacity = '1'; });
    $('#pfMagK').textContent = `${pfPad(pfMk + 1)} / ${pfPad(PF_DET.length)} · ${p.name}`;
    $('#pfMagT').textContent = m;
    $('#pfMagD').textContent = note;
    $('#pfMagSw').style.setProperty('--c', sw);
    $('#pfMagGo').dataset.p = String(pi);
  }
  function pfMagOpen(k, opener) {
    pfMagOpener = opener || document.activeElement;
    pfMag.classList.remove('is-closing');
    if (!pfMag.open) pfMag.showModal();
    body.classList.add('pop-open');
    pfMagHint.classList.remove('is-off');
    pfMagShow(k);
  }
  function pfMagClose() {
    if (!pfMag.open) return;
    pfMag.classList.add('is-closing');
    setTimeout(() => { pfMag.classList.remove('is-closing'); if (pfMag.open) pfMag.close(); }, reduceMotion ? 0 : 260);
  }
  pfMag.addEventListener('close', () => { body.classList.remove('pop-open'); if (pfMagOpener && document.contains(pfMagOpener)) pfMagOpener.focus({ preventScroll: true }); });
  pfMag.addEventListener('cancel', e => { e.preventDefault(); pfMagClose(); });
  pfMag.addEventListener('click', e => { if (e.target === pfMag) pfMagClose(); });
  $('#pfMagX').addEventListener('click', pfMagClose);
  $('#pfMagIn').addEventListener('click', () => pfMagZoom(pfMs * 1.6));
  $('#pfMagOut').addEventListener('click', () => pfMagZoom(pfMs / 1.6));
  $('#pfMagPrev').addEventListener('click', () => pfMagShow(pfMk - 1));
  $('#pfMagNext').addEventListener('click', () => pfMagShow(pfMk + 1));
  $('#pfMagGo').addEventListener('click', e => { const i = +e.currentTarget.dataset.p; pfMagClose(); setTimeout(() => pfOpen(i), reduceMotion ? 0 : 300); });
  pfMag.addEventListener('keydown', e => {
    if (e.key === '+' || e.key === '=') { e.preventDefault(); pfMagZoom(pfMs * 1.6); }
    else if (e.key === '-') { e.preventDefault(); pfMagZoom(pfMs / 1.6); }
    else if (e.key === 'ArrowRight' && pfMs <= 1.01) { e.preventDefault(); pfMagShow(pfMk + 1); }
    else if (e.key === 'ArrowLeft' && pfMs <= 1.01) { e.preventDefault(); pfMagShow(pfMk - 1); }
  });
  /* drag to pan, pinch or double-tap to zoom, wheel on desktop */
  const pfPts = new Map();
  let pfPinch = 0, pfS0 = 1, pfTap = 0, pfDx = 0, pfDy = 0, pfMx0 = 0, pfMy0 = 0, pfMoved = false;
  pfMagView.addEventListener('pointerdown', e => {
    pfMagView.setPointerCapture(e.pointerId);
    pfPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pfPts.size === 2) {
      const [a, b] = [...pfPts.values()];
      pfPinch = Math.hypot(a.x - b.x, a.y - b.y); pfS0 = pfMs;
    } else {
      pfDx = e.clientX; pfDy = e.clientY; pfMx0 = pfMx; pfMy0 = pfMy; pfMoved = false;
      pfMagView.classList.add('is-drag');
    }
  });
  pfMagView.addEventListener('pointermove', e => {
    if (!pfPts.has(e.pointerId)) return;
    pfPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pfPts.size === 2) {
      const [a, b] = [...pfPts.values()], c = pfMagC((a.x + b.x) / 2, (a.y + b.y) / 2);
      pfMagZoom(pfS0 * Math.hypot(a.x - b.x, a.y - b.y) / (pfPinch || 1), c.x, c.y, false);
      pfMoved = true;
    } else if (pfMs > 1.01) {
      const z = pfZ();
      pfMx = pfMx0 + (e.clientX - pfDx) / z; pfMy = pfMy0 + (e.clientY - pfDy) / z;
      if (Math.abs(e.clientX - pfDx) + Math.abs(e.clientY - pfDy) > 6) pfMoved = true;
      pfMagApply(false);
    } else if (Math.abs(e.clientX - pfDx) > 8) pfMoved = true;
  });
  const pfUp = e => {
    if (!pfPts.has(e.pointerId)) return;
    const single = pfPts.size === 1;
    pfPts.delete(e.pointerId);
    pfMagView.classList.remove('is-drag');
    if (!single) return;
    const dx = e.clientX - pfDx;
    if (pfMs <= 1.01 && Math.abs(dx) > 60 && e.type === 'pointerup') { pfMagShow(pfMk + (dx < 0 ? 1 : -1)); return; }
    if (pfMoved || e.type !== 'pointerup') return;
    const now = performance.now();
    if (now - pfTap < 320) { const c = pfMagC(e.clientX, e.clientY); pfMagZoom(pfMs > 1.01 ? 1 : 2.5, c.x, c.y); pfTap = 0; }
    else {
      pfTap = now;
      if (e.pointerType === 'mouse' && pfMs <= 1.01) { const c = pfMagC(e.clientX, e.clientY); pfMagZoom(2.5, c.x, c.y); pfTap = 0; }
    }
  };
  pfMagView.addEventListener('pointerup', pfUp);
  pfMagView.addEventListener('pointercancel', pfUp);
  pfMagView.addEventListener('wheel', e => { e.preventDefault(); const c = pfMagC(e.clientX, e.clientY); pfMagZoom(pfMs * (e.deltaY < 0 ? 1.18 : 1 / 1.18), c.x, c.y, false); }, { passive: false });
  addEventListener('resize', () => { if (pfMag.open) { pfMagFit(); pfMagApply(false); } });
  $$('.pf-tg-hit[data-mag]', pfView).forEach(b => b.addEventListener('click', () => pfMagOpen(+b.dataset.mag, b)));

  /* ---------- closing band: a film strip of the work (portfolio only) ---------- */
  const pfClosing = $('.closing');
  if (pfClosing && !$('.pf-clo', pfClosing)) {
    const th = PF.map(p => `<span><img src="${pfSrc(p.img[0])}" alt="" loading="lazy"></span>`).join('');
    const th2 = PF.map(p => `<span><img src="${pfSrc(p.img[1])}" alt="" loading="lazy"></span>`).join('');
    pfClosing.insertAdjacentHTML('afterbegin', `<div class="pf-clo" aria-hidden="true"><div class="pf-clo-row">${th}${th}</div><div class="pf-clo-row is-b">${th2}${th2}</div></div>`);
  }

  let pfRs = 0;
  addEventListener('resize', () => { clearTimeout(pfRs); pfRs = setTimeout(() => { if (!pfView.hidden) { pfTgLay(); pfPopPlace(); } }, 120); });

  /* ---------- case study ---------- */
  const pfCs = $('#pfCs'), pfCsImgs = $$('.pf-cs-img', pfCs), pfCsThumbs = $('#pfCsThumbs');
  let pfCsI = -1, pfCsK = 0, pfCsOpener = null, pfCsHash = '';
  function pfPhoto(k) {
    const p = PF[pfCsI], n = p.img.length;
    pfCsK = (k + n) % n;
    const cur = pfCsImgs.find(im => im.classList.contains('is-on')) || pfCsImgs[0], nxt = pfCsImgs.find(im => im !== cur);
    pfSetImg(nxt, p.img[pfCsK]);
    nxt.alt = `${p.name} — view ${pfCsK + 1}`;
    const token = pfPhoto.t = (pfPhoto.t || 0) + 1;
    pfReady(nxt, 900).then(() => { if (token !== pfPhoto.t) return; cur.classList.remove('is-on'); nxt.classList.add('is-on'); });
    $('#pfCsCount').textContent = `${pfPad(pfCsK + 1)} / ${pfPad(n)}`;
    $$('.pf-cs-th', pfCs).forEach((t, i) => t.classList.toggle('is-on', i === pfCsK));
  }
  function pfFill(i) {
    const p = PF[i], n = PF.length;
    pfCsI = i;
    $('#pfCsK').textContent = `${p.kind} · ${p.place}`;
    $('#pfCsTitle').textContent = p.name;
    $('#pfCsF').textContent = p.feel;
    $('#pfCsFacts').innerHTML = [['Client', p.client], ['Location', p.place], ['Type', p.kind], ['Spaces', p.spaces.join(' · ')]].map(f => `<div><dt>${f[0]}</dt><dd>${pfEsc(f[1])}</dd></div>`).join('');
    $('#pfCsStory').textContent = p.story;
    $('#pfCsHl').innerHTML = p.hl.map(h => `<li>${pfEsc(h)}</li>`).join('');
    $('#pfCsPal').innerHTML = p.pal.map(c => `<li><i style="--c:${c[0]}"></i>${pfEsc(c[1])}</li>`).join('');
    pfCsThumbs.innerHTML = p.img.map((im, k) => `<button type="button" class="pf-cs-th" data-k="${k}" aria-label="Photo ${k + 1}"><img src="${pfSrc(im)}" alt="" loading="lazy"></button>`).join('');
    $('#pfCsPrevP b').textContent = PF[(i - 1 + n) % n].name;
    $('#pfCsNextP b').textContent = PF[(i + 1) % n].name;
    $('#pfCsScroll').scrollTop = 0;
    pfPhoto(0);
    try { history.replaceState(null, '', '#project/' + p.id); } catch (err) { /* file previews may refuse */ }
  }
  function pfOpen(i, opener) {
    if (!PF[i]) return;
    if (!pfCs.open) {
      pfCsOpener = opener || document.activeElement;
      pfCsHash = /^#project\//.test(location.hash) ? '#pfWork' : (location.hash || '#pfWork');
      pfCs.classList.remove('is-closing', 'is-swap');
      pfCs.showModal();
      body.classList.add('pop-open');
      pfFill(i);
      return;
    }
    pfCs.classList.add('is-swap');
    setTimeout(() => { pfFill(i); pfCs.classList.remove('is-swap'); }, reduceMotion ? 0 : 260);
  }
  function pfClose() {
    if (!pfCs.open) return;
    pfCs.classList.add('is-closing');
    setTimeout(() => { pfCs.classList.remove('is-closing'); if (pfCs.open) pfCs.close(); }, reduceMotion ? 0 : 270);
  }
  pfCs.addEventListener('close', () => {
    body.classList.remove('pop-open');
    try { history.replaceState(null, '', pfCsHash || '#pfWork'); } catch (err) { /* see above */ }
    if (pfCsOpener && document.contains(pfCsOpener)) pfCsOpener.focus({ preventScroll: true });
  });
  pfCs.addEventListener('cancel', e => { e.preventDefault(); pfClose(); });
  pfCs.addEventListener('click', e => {
    if (e.target === pfCs) { pfClose(); return; }
    const th = e.target.closest('.pf-cs-th');
    if (th) pfPhoto(+th.dataset.k);
  });
  pfCs.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); pfPhoto(pfCsK + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); pfPhoto(pfCsK - 1); }
  });
  $('#pfCsClose').addEventListener('click', pfClose);
  $('#pfCsPrev').addEventListener('click', () => pfPhoto(pfCsK - 1));
  $('#pfCsNext').addEventListener('click', () => pfPhoto(pfCsK + 1));
  $('#pfCsPrevP').addEventListener('click', () => pfOpen((pfCsI - 1 + PF.length) % PF.length));
  $('#pfCsNextP').addEventListener('click', () => pfOpen((pfCsI + 1) % PF.length));
  $$('.pf-cs-cta', pfCs).forEach(a => a.addEventListener('click', () => pfClose()));
  let pfCsTouch = null;
  $('.pf-cs-media', pfCs).addEventListener('touchstart', e => { pfCsTouch = e.touches[0].clientX; }, { passive: true });
  $('.pf-cs-media', pfCs).addEventListener('touchend', e => {
    if (pfCsTouch === null) return;
    const dx = e.changedTouches[0].clientX - pfCsTouch; pfCsTouch = null;
    if (Math.abs(dx) > 40) pfPhoto(pfCsK + (dx < 0 ? 1 : -1));
  }, { passive: true });
  pfView.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (b) pfOpen(+b.dataset.open, b);
  });

  /* ---------- reveals + page life ---------- */
  $$('.rv, .ab-head', pfView).forEach(el => io.observe(el));
  function pfShowPage() {
    pfLive = true;
    pfView.classList.add('pf-on');
    pfTgLay();
    pfFsRun();
    pfMzQueue();
    setTimeout(pfMzOpen, reduceMotion ? 0 : 650);
    setTimeout(() => $$('.pf-stats [data-pfcount], .pf-mz-stats [data-pfcount]', pfView).forEach(pfCount), reduceMotion ? 0 : 1300);
    pfCityQueue();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!pfView.hidden) { pfTgLay(); pfPopPlace(); } });
    const m = /^#project\/(.+)$/.exec(location.hash);
    if (m) { const i = PF.findIndex(p => p.id === m[1]); if (i >= 0) setTimeout(() => pfOpen(i), 400); }
  }
  function pfHidePage() {
    pfLive = false; clearTimeout(pfCityT); clearTimeout(pfMzT);
    if (pfMag.open) pfMag.close();
    pfView.classList.remove('pf-on');
    if (pfCs.open) pfCs.close();
  }
  document.addEventListener('visibilitychange', () => { if (!pfView.hidden) { pfCityQueue(); pfMzQueue(); } });


  /* =========================================================
     TERMS & PRIVACY — #/terms and #/privacy
  ========================================================= */
  const lgView = $('#legalView'), lgToc = $('#lgToc');
  const lgDocs = $$('.lg-doc', lgView), lgTabs = $$('.lg-tab', lgView), lgPill = $('.lg-tab-pill', lgView);
  let lgKey = '', lgSpy = null;
  function lgPillTo() {
    const on = lgTabs.find(t => t.classList.contains('is-on'));
    if (!on) return;
    lgPill.style.setProperty('--tl', on.offsetLeft + 'px');
    lgPill.style.setProperty('--tw', on.offsetWidth + 'px');
  }
  function lgShow(k) {
    k = k === 'privacy' ? 'privacy' : 'terms';
    const changed = k !== lgKey;
    lgKey = k;
    document.title = (k === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions') + ' — De Interio Cafe';
    lgTabs.forEach(t => { const on = t.dataset.k === k; t.classList.toggle('is-on', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
    lgPillTo();
    const doc = lgDocs.find(d => d.dataset.k === k);
    lgDocs.forEach(d => { d.hidden = d !== doc; });
    if (changed && !reduceMotion) { doc.classList.remove('is-swap'); void doc.offsetWidth; doc.classList.add('is-swap'); }
    const hs = $$('h2', doc);
    lgToc.innerHTML = hs.map(h => `<li><button type="button" data-to="${h.id}">${esc(h.textContent)}</button></li>`).join('');
    if (lgSpy) lgSpy.disconnect();
    lgSpy = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        $$('button', lgToc).forEach(b => b.classList.toggle('is-on', b.dataset.to === e.target.id));
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    hs.forEach(h => lgSpy.observe(h));
    requestAnimationFrame(() => { $$('.lg-hero-in', lgView).forEach(x => x.classList.add('is-in')); });
  }
  lgToc.addEventListener('click', e => {
    const b = e.target.closest('button[data-to]');
    if (!b) return;
    const t = document.getElementById(b.dataset.to);
    if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });
  addEventListener('resize', lgPillTo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lgPillTo);

  /* =========================================================
     PORTFOLIO — the book turns its pages while it is on screen
  ========================================================= */
  (function () {
    const bk = $('#bk');
    if (!bk) return;
    const leaves = $$('.bk-leaf', bk), cap = $('#bkPage');
    const N = leaves.length;
    let k = 0, tm = 0, vis = false, back = false;
    const label = () => { cap.textContent = k === 0 ? 'Cover' : 'Pages ' + String(k * 2).padStart(2, '0') + '–' + String(k * 2 + 1).padStart(2, '0'); };
    const z = () => leaves.forEach((l, i) => { l.style.zIndex = i < k ? 10 + i : 40 - i; });
    function step() {
      if (!vis) return;
      if (!back) {
        const l = leaves[k];
        l.style.zIndex = 60;
        l.classList.add('is-flip');
        k++;
        setTimeout(z, 640);
        if (k >= N) back = true;
        label();
        tm = setTimeout(step, k >= N ? 3200 : 2100);
      } else {
        k--;
        const l = leaves[k];
        l.style.zIndex = 60;
        l.classList.remove('is-flip');
        setTimeout(z, 640);
        if (k <= 0) back = false;
        label();
        tm = setTimeout(step, k <= 0 ? 2600 : 380);
      }
    }
    if (reduceMotion) { leaves[0].classList.add('is-flip'); k = 1; z(); label(); return; }
    z();
    new IntersectionObserver(es => {
      vis = es[0].isIntersecting;
      clearTimeout(tm);
      if (vis) tm = setTimeout(step, 900);
    }, { threshold: .35 }).observe(bk);
    bk.closest('.pfb-stage').addEventListener('click', () => { if (!vis) return; clearTimeout(tm); step(); });
  })();

  /* SERVICES — craftsmanship: point at a craft (or let it run) */
  (function () {
    const list = $('#crfList');
    if (!list) return;
    const its = $$('.crf-it', list), ims = $$('.crf-img'), no = $('#crfNo'), nm = $('#crfName'), gp = $('#crfGroup');
    let cur = 0, tm = 0, hold = false, vis = false;
    function go(i) {
      cur = (i + its.length) % its.length;
      its.forEach((b, j) => b.classList.toggle('is-on', j === cur));
      ims.forEach((m, j) => m.classList.toggle('is-on', j === cur));
      no.textContent = String(cur + 1).padStart(2, '0');
      nm.innerHTML = $('.crf-t', its[cur]).innerHTML;
      gp.textContent = its[cur].dataset.g === 'Workplace' ? 'Commercial craft' : 'Residential craft';
    }
    const run = () => { clearTimeout(tm); if (!vis || hold || reduceMotion) return; tm = setTimeout(() => { go(cur + 1); run(); }, 2600); };
    its.forEach((b, j) => {
      b.addEventListener('mouseenter', () => { hold = true; go(j); });
      b.addEventListener('focus', () => { hold = true; go(j); });
      b.addEventListener('click', () => { hold = true; go(j); });
    });
    list.addEventListener('mouseleave', () => { hold = false; run(); });
    new IntersectionObserver(es => { vis = es[0].isIntersecting; run(); }, { threshold: .3 }).observe(list);
  })();

  /* DESIGN IDEAS — materials: pick a swatch, filter by group, or let it run */
  (function () {
    const grid = $('#mtlGrid');
    if (!grid) return;
    const sec = grid.closest('.mtl');
    const sws = $$('.mtl-sw', grid), bts = $$('button', grid), bigs = $$('.mtl-big', sec), fs = $$('.mtl-f', sec);
    const no = $('#mtlNo'), nm = $('#mtlName'), gp = $('#mtlGroup');
    const G = { bd: 'Boards & surfaces', hw: 'Hardware & fittings' };
    let cur = 0, grp = 'all', tm = 0, hold = false, vis = false;
    const pool = () => bts.map((b, i) => i).filter(i => grp === 'all' || sws[i].dataset.g === grp);
    function go(i) {
      cur = i;
      bts.forEach((b, j) => b.classList.toggle('is-on', j === i));
      bigs.forEach((m, j) => m.classList.toggle('is-on', j === i));
      no.textContent = String(i + 1).padStart(2, '0');
      nm.textContent = bts[i].getAttribute('aria-label');
      gp.textContent = G[sws[i].dataset.g];
    }
    const run = () => {
      clearTimeout(tm);
      if (!vis || hold || reduceMotion) return;
      tm = setTimeout(() => { const p = pool(); go(p[(p.indexOf(cur) + 1) % p.length]); run(); }, 2400);
    };
    bts.forEach((b, j) => {
      b.addEventListener('mouseenter', () => { hold = true; go(j); });
      b.addEventListener('focus', () => { hold = true; go(j); });
      b.addEventListener('click', () => { hold = true; go(j); });
    });
    grid.addEventListener('mouseleave', () => { hold = false; run(); });
    fs.forEach(f => f.addEventListener('click', () => {
      grp = f.dataset.g;
      fs.forEach(x => { const on = x === f; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); });
      sws.forEach(s => s.classList.toggle('is-dim', grp !== 'all' && s.dataset.g !== grp));
      const p = pool(); if (!p.includes(cur)) go(p[0]);
      hold = false; run();
    }));
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) sec.classList.add('is-in'); run(); }, { threshold: .25 }).observe(grid);
  })();

  /* reveal for the sections added in this round */
  (function () {
    const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); tio.unobserve(e.target); } }), { threshold: .14, rootMargin: '0px 0px -8% 0px' });
    $$('.wcu, .pf-book, .sv-craft .rv, .sv-craft .ab-head, .mtl .rv, .mtl .ab-head, .pf-book .rv').forEach(el => tio.observe(el));
    /* count-up for the book's facts */
    const facts = $$('.pfb-facts b[data-to]');
    if (facts.length && !reduceMotion) {
      const fio = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return; fio.unobserve(e.target);
        const el = e.target, to = +el.dataset.to, t0 = performance.now();
        const tick = now => { const p = Math.min(1, (now - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - p, 3))); el.textContent = v + (p >= 1 ? (el.dataset.suf || '') : ''); if (p < 1) requestAnimationFrame(tick); };
        el.textContent = '0'; requestAnimationFrame(tick);
      }), { threshold: .6 });
      facts.forEach(f => fio.observe(f));
    }
  })();

  /* =========================================================
     PAGES — home, testimonials, design ideas, contact, about, services and portfolio live in this one file.
     #/testimonials and #/design-ideas show those pages; any home anchor
     brings home back. A curtain carries the visitor between them.
  ========================================================= */
  const homeView = $('#homeView'), tpView = $('#tpView'), ideasView = $('#ideasView'), contactView = $('#contactView'), aboutView = $('#aboutView'), legalView = $('#legalView');
  /* svView and pfView are declared with the services and portfolio scripts above */
  const ideasPage = window.DIC_IDEAS;
  const TPS  = [{"n": "Ms. Roshini Krishnan", "p": "Villa interiors", "l": "Bengaluru", "q": "De Interio Cafe designed our independent villa with a perfect balance of modern luxury and nature-inspired openness.", "f": "De Interio Cafe designed our independent villa with a perfect balance of modern luxury and nature-inspired openness. The spacious layouts, earthy textures, natural lighting, and seamless indoor-outdoor connection created a home that feels elegant, peaceful, and refreshing every single day. Their attention to detail, premium finishes, and thoughtful planning transformed the entire space into a warm and timeless living experience that truly exceeded our expectations.", "s": "Elegant, peaceful, and refreshing every single day.", "img": "images/projects/mukundhan/mukundhan-06.webp", "ph": "Mukundhan Residence · Keelkattalai", "m": "RK", "c": "Bengaluru"}, {"n": "Mr. Arun Prakash", "p": "Home interiors", "l": "Chennai", "q": "De Interio Cafe designed our home with exceptional attention to detail. The spaces are both functional and stunning. Highly recommended!", "f": "De Interio Cafe designed our home with exceptional attention to detail. The spaces are both functional and stunning. Highly recommended!", "s": "Both functional and stunning.", "img": "images/projects/saveetha/saveetha-05.webp", "ph": "Saveetha Residence · Keelkattalai", "m": "AP", "c": "Chennai"}, {"n": "Mrs. Nandhini Ramesh", "p": "Interiors", "l": "Bengaluru", "q": "They truly understood our vision and brought it to life beautifully. The team was professional, creative, and a pleasure to work with.", "f": "They truly understood our vision and brought it to life beautifully. The team was professional, creative, and a pleasure to work with.", "s": "Professional, creative, and a pleasure to work with.", "img": "images/projects/varun/varun-03.webp", "ph": "Varun Residence · Bengaluru", "m": "NR", "c": "Bengaluru"}, {"n": "Mr. Vignesh S", "p": "Home interiors", "l": "Erode", "q": "From concept to execution, everything was seamless. Our home looks elegant, comfortable, and timeless. Thank you for the amazing work!", "f": "From concept to execution, everything was seamless. Our home looks elegant, comfortable, and timeless. Thank you for the amazing work!", "s": "Elegant, comfortable, and timeless.", "img": "images/projects/fayyaz/fayyaz-12.webp", "ph": "Fayyaz Manzil · Velachery", "m": "VS", "c": "Erode"}, {"n": "Dr. Kavya Balaji", "p": "Home interiors", "l": "Vellore", "q": "The design, the quality, and the finishing — everything exceeded our expectations. De Interio Cafe made our dream home a reality.", "f": "The design, the quality, and the finishing — everything exceeded our expectations. De Interio Cafe made our dream home a reality.", "s": "Everything exceeded our expectations.", "img": "images/projects/navin-2/navin-2-28.webp", "ph": "Navin Residence — Phase 2 · Katpadi", "m": "KB", "c": "Vellore"}, {"n": "Mr. Harish Kumar", "p": "Villa interiors", "l": "Pondicherry", "q": "We loved the way natural light and space were blended in our villa. It feels peaceful, modern, and uniquely ours.", "f": "We loved the way natural light and space were blended in our villa. It feels peaceful, modern, and uniquely ours.", "s": "Peaceful, modern, and uniquely ours.", "img": "images/projects/fayyaz/fayyaz-09.webp", "ph": "Fayyaz Manzil · Velachery", "m": "HK", "c": "Pondicherry"}, {"n": "Ms. Divya Suresh", "p": "Home interiors", "l": "Bengaluru", "q": "Their creativity and design sense are outstanding. Every corner of our home feels thoughtfully designed and so inviting.", "f": "Their creativity and design sense are outstanding. Every corner of our home feels thoughtfully designed and so inviting.", "s": "Every corner of our home feels thoughtfully designed.", "img": "images/projects/nihitha/nihitha-16.webp", "ph": "Nihitha Sinha Residence · Bengaluru", "m": "DS", "c": "Bengaluru"}, {"n": "Dr. Sridhar Rajan", "p": "Interiors", "l": "Chennai", "q": "A wonderful experience working with such a dedicated team. They delivered beyond what we imagined. Truly happy with the outcome!", "f": "A wonderful experience working with such a dedicated team. They delivered beyond what we imagined. Truly happy with the outcome!", "s": "They delivered beyond what we imagined.", "img": "images/projects/mukundhan/mukundhan-08.webp", "ph": "Mukundhan Residence · Keelkattalai", "m": "SR", "c": "Chennai"}, {"n": "Mrs. Meera Krishnan", "p": "Home interiors", "l": "Erode", "q": "The team’s professionalism and passion for design reflect in their work. Our home is beautiful and practical — just the way we wanted.", "f": "The team’s professionalism and passion for design reflect in their work. Our home is beautiful and practical — just the way we wanted.", "s": "Beautiful and practical — just the way we wanted.", "img": "images/projects/karthik/karthik-01.webp", "ph": "Karthik Residence · Erode", "m": "MK", "c": "Erode"}, {"n": "Mr. Aravind Kumar", "p": "Home interiors", "l": "Chennai", "q": "A fantastic experience from start to finish.", "f": "A fantastic experience from start to finish. The team understood our requirements perfectly and transformed our home beautifully. We absolutely loved the final outcome!", "s": "We absolutely loved the final outcome!", "img": "images/projects/venkateswara/venkateswara-01.webp", "ph": "Venkateswara Rao Residence · Ponmar", "m": "AK", "c": "Chennai"}, {"n": "Mrs. Priya Narayanan", "p": "Kitchen & living", "l": "Vellore", "q": "Excellent craftsmanship and attention to detail throughout the project.", "f": "Excellent craftsmanship and attention to detail throughout the project. Our modular kitchen and living room turned out beautifully. Truly satisfied with their work!", "s": "Excellent craftsmanship and attention to detail.", "img": "images/projects/navin-2/navin-2-11.webp", "ph": "Navin Residence — Phase 2 · Katpadi", "m": "PN", "c": "Vellore"}, {"n": "Mr. Karthik Rajan", "p": "Interiors", "l": "Ranipet", "q": "Very professional and supportive throughout the entire process.", "f": "Very professional and supportive throughout the entire process. They brought our ideas to life with beautiful designs and quality finishes. Highly recommended!", "s": "Beautiful designs and quality finishes.", "img": "images/projects/sandhya/sandhya-01.webp", "ph": "Sandhya Residence · Katpadi", "m": "KR", "c": "Vellore"}, {"n": "Dr. Meenakshi Sundaram", "p": "Home interiors", "l": "Katpadi", "q": "Wonderful experience working with De Interio Cafe.", "f": "Wonderful experience working with De Interio Cafe. Their thoughtful designs, material choices and dedication made our dream home exactly how we imagined!", "s": "Exactly how we imagined!", "img": "images/projects/kalpana-2/kalpana-2-01.webp", "ph": "Kalpana Residence — Phase 2 · Katpadi", "m": "MS", "c": "Vellore"}, {"n": "Mrs. Lakshmi Prakash", "p": "Interiors", "l": "Chennai", "q": "From planning to final execution, everything was handled with great care.", "f": "From planning to final execution, everything was handled with great care. The interiors look elegant, functional and welcoming. We are extremely happy!", "s": "Elegant, functional and welcoming.", "img": "images/projects/senthil/senthil-04.webp", "ph": "Senthil Residence · Adyar", "m": "LP", "c": "Chennai"}, {"n": "Mr. Suresh Babu", "p": "Interiors", "l": "Chennai", "q": "Impressive designs and excellent finishing across every room.", "f": "Impressive designs and excellent finishing across every room. The team listened patiently to our suggestions and delivered a beautiful, comfortable living space!", "s": "Impressive designs and excellent finishing.", "img": "images/projects/mukundhan/mukundhan-14.webp", "ph": "Mukundhan Residence · Keelkattalai", "m": "SB", "c": "Chennai"}, {"n": "Ms. Divya Krishnan", "p": "Interiors", "l": "Vellore", "q": "A truly satisfying experience with a dedicated team.", "f": "A truly satisfying experience with a dedicated team. Their creativity, professionalism and commitment to quality exceeded our expectations. Absolutely delighted with the results!", "s": "Exceeded our expectations.", "img": "images/projects/navin-2/navin-2-21.webp", "ph": "Navin Residence — Phase 2 · Katpadi", "m": "DK", "c": "Vellore"}];
  const SPOT = [0, 1, 4, 3, 9];
  const curtain = $('#curtain');
  const tpNavLinks = $$('a[href="#/testimonials"]');
  let view = 'home';

  const TITLES = { home: 'De Interio Cafe — Interior Design & Execution, Chennai', tp: 'Client Stories — De Interio Cafe', ideas: 'Design Ideas — De Interio Cafe', contact: 'Contact — De Interio Cafe', about: 'About — De Interio Cafe', services: 'Services — De Interio Cafe', portfolio: 'Portfolio — De Interio Cafe', legal: 'Terms & Privacy — De Interio Cafe' };
  const CURTAIN = { home: 'De Interio <em>Cafe</em>', tp: 'Client <em>stories</em>', ideas: 'Design <em>ideas</em>', contact: 'Get in <em>touch</em>', about: 'Our <em>story</em>', services: 'Our <em>services</em>', portfolio: 'The <em>portfolio</em>', legal: 'Terms &amp; <em>privacy</em>' };
  const isIdeasHash = h => h.startsWith('#/design-ideas') || h.startsWith('#ideas-') || h.startsWith('#idea/');
  function setNavActive(v) {
    $$('.nav-cta, .m-cta a').forEach(a => { a.classList.toggle('is-current', v === 'contact'); if (v === 'contact') a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $$('.nav-links a').forEach(a => {
      const on = (v === 'tp' && a.getAttribute('href') === '#/testimonials') || (v === 'about' && a.getAttribute('href') === '#/about') || (v === 'services' && a.getAttribute('href') === '#/services') || (v === 'portfolio' && a.getAttribute('href') === '#/portfolio');
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else if (v !== 'home') a.removeAttribute('aria-current');
    });
    megaTrigger.classList.toggle('is-current', v === 'ideas');
    if (v === 'ideas') megaTrigger.setAttribute('aria-current', 'page'); else megaTrigger.removeAttribute('aria-current');
    if (v === 'home') { const h = $('.nav-links a[href="#home"]'); if (h && scrollY < innerHeight) { h.classList.add('active'); h.setAttribute('aria-current', 'page'); } }
  }
  function showView(next, target, sub) {
    view = next;
    homeView.hidden = next !== 'home';
    tpView.hidden = next !== 'tp';
    ideasView.hidden = next !== 'ideas';
    contactView.hidden = next !== 'contact';
    legalView.hidden = next !== 'legal';
    document.body.classList.toggle('is-legal', next === 'legal');
    aboutView.hidden = next !== 'about';
    document.body.classList.toggle('is-about', next === 'about');
    aboutView.classList.remove('ab-on');
    svView.hidden = next !== 'services';
    document.body.classList.toggle('is-services', next === 'services');
    pfView.hidden = next !== 'portfolio';
    document.body.classList.toggle('is-portfolio', next === 'portfolio');
    document.body.classList.toggle('is-contact', next === 'contact');
    contactView.classList.remove('ct-on');
    document.title = TITLES[next];
    setNavActive(next);
    tpView.classList.remove('tp-on');
    if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    else scrollTo(0, 0);
    if (next === 'tp') requestAnimationFrame(() => requestAnimationFrame(() => tpView.classList.add('tp-on')));
    if (next === 'ideas') ideasPage.show(sub || ''); else ideasPage.hide();
    if (next === 'legal') lgShow(sub);
    if (next === 'about') abAfterIntro(() => { if (view !== 'about') return; abShow(); requestAnimationFrame(() => requestAnimationFrame(() => aboutView.classList.add('ab-on'))); }); else abHide();
    if (next === 'services') abAfterIntro(() => { if (view !== 'services') return; requestAnimationFrame(() => requestAnimationFrame(svShowPage)); }); else svHidePage();
    if (next === 'portfolio') abAfterIntro(() => { if (view !== 'portfolio') return; requestAnimationFrame(() => requestAnimationFrame(pfShowPage)); }); else pfHidePage();
    if (next === 'contact') { ctShow(); requestAnimationFrame(() => requestAnimationFrame(() => contactView.classList.add('ct-on'))); } else ctHide();
    dispatchEvent(new Event('resize'));
  }
  function wanted() {
    const h = location.hash;
    if (h.startsWith('#/testimonials')) return { v: 'tp', el: null };
    if (h.startsWith('#/contact')) return { v: 'contact', el: null };
    if (h.startsWith('#/terms')) return { v: 'legal', el: null, sub: 'terms' };
    if (h.startsWith('#/privacy')) return { v: 'legal', el: null, sub: 'privacy' };
    if (h.startsWith('#/about')) return { v: 'about', el: null };
    if (h.startsWith('#/services')) return { v: 'services', el: null };
    if (h.startsWith('#/portfolio') || h.startsWith('#project/')) return { v: 'portfolio', el: null };
    if (isIdeasHash(h)) return { v: 'ideas', el: null, sub: h };
    const id = h.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (el && tpView.contains(el)) return { v: 'tp', el };
    if (el && ideasView.contains(el)) return { v: 'ideas', el };
    if (el && contactView.contains(el)) return { v: 'contact', el };
    if (el && aboutView.contains(el)) return { v: 'about', el };
    if (el && svView.contains(el)) return { v: 'services', el };
    if (el && pfView.contains(el)) return { v: 'portfolio', el };
    if (el && homeView.contains(el)) return { v: 'home', el };
    return { v: view, el };            /* shared bits (contact, footer) keep the current page */
  }
  function route(first) {
    const w = wanted();
    if (w.v === view && !first) {            /* same page: let the browser scroll, or steer the catalogue */
      if (w.v === 'legal') { lgShow(w.sub); scrollTo(0, 0); }
      else if (w.sub) ideasPage.go(w.sub);
      return;
    }
    if (first || reduceMotion) { showView(w.v, w.el, w.sub); return; }
    curtain.classList.remove('is-out');
    $('.curtain span', curtain).innerHTML = CURTAIN[w.v];
    void curtain.offsetWidth;
    curtain.classList.add('is-in');
    setTimeout(() => {
      showView(w.v, w.el, w.sub);
      const lift = () => {
        curtain.classList.remove('is-in');
        curtain.classList.add('is-out');
        setTimeout(() => curtain.classList.remove('is-out'), 540);
      };
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const vh = innerHeight;
        const first = $$('img').filter(im => {
          if (!im.getAttribute('src')) return false;
          const r = im.getBoundingClientRect();
          return r.width > 40 && r.bottom > 0 && r.top < vh;
        }).slice(0, 10);
        first.forEach(im => { if (im.loading === 'lazy') im.loading = 'eager'; });
        Promise.race([
          Promise.allSettled(first.map(im => (im.decode ? im.decode() : Promise.resolve()))),
          new Promise(r => setTimeout(r, 650))
        ]).then(lift);
      }));
    }, 470);
  }
  addEventListener('hashchange', () => route(false));
  if (wanted().v !== 'home') route(true);

  /* ---- reveals inside the view ---- */
  $$('.rv, .tp-spot, .tp-wall, .wc-reveal', tpView).forEach(el => io.observe(el));

  /* ---- hero: the story wall needs no script — it drifts on its own; tiles open stories via the shared click handler ---- */

  /* ---------------------------------------------------------
     2 — STORY SPOTLIGHT (auto-advancing, 7s)
  --------------------------------------------------------- */
  const spot = $('#spotlight'), sp = $('#sp');
  const spImgs = $$('.sp-media img', sp), spBars = $$('#spBars button');
  const SP_DUR = 7000;
  spot.style.setProperty('--sp-dur', SP_DUR + 'ms');
  let spI = 0, spTimer = 0, spStart = 0, spLeft = SP_DUR, spUser = reduceMotion, spHover = false, spVis = false, spPaused = true;

  function spFill(k) {
    const t = TPS[SPOT[k]];
    $('#spQuote').innerHTML = t.q.split(/\s+/).map((w, i) => `<span class="w" style="--wi:${i}">${esc(w)}</span>`).join(' ');
    $('#spTags').innerHTML = [t.p, t.l].map(x => `<span>${esc(x)}</span>`).join('');
    $('#spMono').textContent = t.m;
    $('#spName').textContent = t.n;
    $('#spMeta').textContent = `${t.p} · ${t.l}`;
    $('#spLabel').textContent = t.ph;
    $('#spRead').dataset.tp = SPOT[k];
    $('#spNo').textContent = String(k + 1).padStart(2, '0');
  }
  function spGo(k) {
    k = (k + SPOT.length) % SPOT.length;
    if (k === spI) { spRestart(); return; }
    spImgs.forEach((im, i) => { im.classList.toggle('was-on', i === spI); im.classList.toggle('is-on', i === k); });
    spBars.forEach((b, i) => { b.classList.toggle('is-done', i < k); b.classList.remove('is-on'); });
    sp.classList.add('is-swapping');
    spI = k;
    setTimeout(() => {
      spFill(k);
      requestAnimationFrame(() => requestAnimationFrame(() => sp.classList.remove('is-swapping')));
    }, reduceMotion ? 0 : 280);
    spRestart();
  }
  function spSchedule(ms) { clearTimeout(spTimer); if (spPaused) return; spStart = performance.now(); spLeft = ms; spTimer = setTimeout(() => spGo(spI + 1), ms); }
  function spRestart() {
    const b = spBars[spI]; b.classList.remove('is-on'); void b.offsetWidth; b.classList.add('is-on');
    spLeft = SP_DUR; spSchedule(SP_DUR);
  }
  function spSync() {
    const should = spUser || spHover || !spVis || document.hidden;
    spot.classList.toggle('is-paused', should);
    if (should === spPaused) return;
    spPaused = should;
    if (spPaused) { clearTimeout(spTimer); spLeft = Math.max(0, spLeft - (performance.now() - spStart)); }
    else spSchedule(spLeft);
  }
  $('#spPrev').addEventListener('click', () => spGo(spI - 1));
  $('#spNext').addEventListener('click', () => spGo(spI + 1));
  spBars.forEach((b, i) => b.addEventListener('click', () => spGo(i)));
  const spPlay = $('#spPlay');
  spPlay.addEventListener('click', () => {
    spUser = !spUser;
    spPlay.setAttribute('aria-pressed', String(spUser));
    spPlay.setAttribute('aria-label', spUser ? 'Play spotlight' : 'Pause spotlight');
    spSync();
  });
  spPlay.setAttribute('aria-pressed', String(spUser));
  sp.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { spHover = true; spSync(); } });
  sp.addEventListener('pointerleave', () => { spHover = false; spSync(); });
  new IntersectionObserver(e => { spVis = e[0].isIntersecting; spSync(); }, { threshold: .35 }).observe(sp);
  document.addEventListener('visibilitychange', spSync);
  spRestart();


  /* tp stats */
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    $('#tpStats').classList.add('is-in');
    $$('#tpStats .odo-strip').forEach(st => { st.style.transform = `translateY(-${st.dataset.d}em)`; });
  }, { threshold: .4 }).observe($('#tpStats'));

  /* ---------------------------------------------------------
     4 — THE WALL: filters + show more
  --------------------------------------------------------- */
  const wlCards = $$('.wc', tpView), wlCount = $('#wlCount'), wlMore = $('#wlMore');
  const PAGE = 9;
  let filter = 'All', limit = PAGE;
  function renderWall(animate) {
    const match = wlCards.filter(c => filter === 'All' || c.dataset.cat === filter);
    wlCards.forEach(c => c.classList.add('is-hidden'));
    match.forEach((c, i) => {
      if (i >= limit) return;
      const wasHidden = c.classList.contains('is-hidden');
      c.classList.remove('is-hidden');
      if (animate && wasHidden) {
        c.classList.add('is-enter');
        setTimeout(() => c.classList.remove('is-enter'), 30 + i * 40);
      }
    });
    const shown = Math.min(limit, match.length);
    wlCount.innerHTML = `Showing <b>${shown}</b> of <b>${match.length}</b> ${match.length === 1 ? 'story' : 'stories'}`;
    wlMore.hidden = shown >= match.length;
  }
  $$('.wl-filters button').forEach(btn => btn.addEventListener('click', () => {
    $$('.wl-filters button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    filter = btn.dataset.filter.replace('&amp;', '&');
    limit = PAGE;
    renderWall(true);
  }));
  $('button', wlMore).addEventListener('click', () => { limit += PAGE; renderWall(true); });
  renderWall(false);

  /* ---------------------------------------------------------
     STORY POP-UP (shared by hero portraits, spotlight and wall)
  --------------------------------------------------------- */
  const tpPopEl = $('#tpPop');
  let tpIdx = 0, tpLast = null;
  function tpFill(n) {
    tpIdx = (n + TPS.length) % TPS.length;
    const t = TPS[tpIdx], im = $('.pop-media img', tpPopEl);
    im.classList.remove('is-in');
    im.src = t.img; im.alt = `${t.ph}, from the De Interio Cafe portfolio`;
    requestAnimationFrame(() => requestAnimationFrame(() => im.classList.add('is-in')));
    $('.pop-kicker', tpPopEl).textContent = `Client story · ${String(tpIdx + 1).padStart(2, '0')} / ${TPS.length}`;
    $('.pop-quote', tpPopEl).textContent = '“' + t.q + '”';
    $('.pop-text', tpPopEl).textContent = t.f;
    $('.pop-tags', tpPopEl).innerHTML = [t.p, t.l].map(x => `<span>${esc(x)}</span>`).join('');
    $('.pop-who .mono', tpPopEl).textContent = t.m;
    $('.pop-who b', tpPopEl).textContent = t.n;
    $('.pop-who small', tpPopEl).textContent = `${t.p} · ${t.l}`;
  }
  function tpOpen(n, from) {
    tpLast = from || null; tpFill(n);
    if (typeof tpPopEl.showModal === 'function') tpPopEl.showModal(); else tpPopEl.setAttribute('open', '');
    body.classList.add('pop-open');
  }
  function tpClose() {
    tpPopEl.classList.add('is-closing');
    setTimeout(() => { tpPopEl.classList.remove('is-closing'); if (tpPopEl.open) tpPopEl.close(); }, reduceMotion ? 0 : 260);
  }
  tpPopEl.addEventListener('close', () => { body.classList.remove('pop-open'); if (tpLast) tpLast.focus(); });
  tpView.addEventListener('click', e => {
    const b = e.target.closest('[data-tp]');
    if (!b) return;
    tpOpen(+b.dataset.tp, b);
  });
  $('.pop-close', tpPopEl).addEventListener('click', tpClose);
  $('.pop-prev', tpPopEl).addEventListener('click', () => tpFill(tpIdx - 1));
  $('.pop-next', tpPopEl).addEventListener('click', () => tpFill(tpIdx + 1));
  $('.pop-cta', tpPopEl).addEventListener('click', tpClose);
  tpPopEl.addEventListener('click', e => { if (e.target === tpPopEl) tpClose(); });
  tpPopEl.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') tpFill(tpIdx + 1);
    if (e.key === 'ArrowLeft') tpFill(tpIdx - 1);
    if (e.key === 'Escape') { e.preventDefault(); tpClose(); }
  });


  /* ---- links to the testimonials page from anywhere ---- */
  $$('.strip', tpView).forEach(strip => new IntersectionObserver(e => strip.classList.toggle('is-off', !e[0].isIntersecting)).observe(strip));

  /* ---- sideways-scrolling rows (strips with reduced motion, "why us" cards on phones)
          take keyboard focus only while they can actually scroll ---- */
  const scrollRows = $$('.strip-mq, .wcu-grid');
  const markScrollRows = () => scrollRows.forEach(el => {
    const scrolls = getComputedStyle(el).overflowX !== 'hidden' && el.scrollWidth > el.clientWidth + 2;
    if (scrolls) el.tabIndex = 0; else el.removeAttribute('tabindex');
  });
  let scrollRowsT = 0;
  addEventListener('resize', () => { clearTimeout(scrollRowsT); scrollRowsT = setTimeout(markScrollRows, 200); });
  addEventListener('hashchange', () => setTimeout(markScrollRows, 900));
  setTimeout(markScrollRows, 1200);

})();
