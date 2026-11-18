/* logo entry — runs before the page script so the hero waits for it */
(() => {
  const pl = document.getElementById('pl');
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the full logo entry plays once per visit; later opens in the same tab get the short one */
  let seen = false;
  try { seen = sessionStorage.getItem('dic:pl') === '1'; sessionStorage.setItem('dic:pl', '1'); } catch (e) {}
  const finish = () => { window.__plDone = true; window.dispatchEvent(new Event('pl:done')); };
  if (reduce) { pl.classList.add('is-gone'); finish(); return; }
  body.classList.add('is-preloading');
  if (seen) pl.classList.add('is-quick');
  else pl.style.setProperty('--pls', '.72');
  const MIN = seen ? 900 : 2000, MAX = seen ? 1800 : 3600;
  const t0 = performance.now();
  let ready = 0, shown = 0, done = false;
  const need = 2, tick = () => { ready++; };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(tick);
  const hookImg = () => {
    const img = document.querySelector('.slide img');
    if (!img) return setTimeout(hookImg, 30);
    if (img.complete && img.naturalWidth) tick();
    else { img.addEventListener('load', tick, { once: true }); img.addEventListener('error', tick, { once: true }); }
  };
  hookImg();
  const pct = document.getElementById('plPct'), bar = document.getElementById('plBar');
  function leave() {
    if (done) return;
    done = true;
    pct.textContent = '100';
    bar.style.transform = 'scaleX(1)';
    pl.classList.add('is-leaving');
    setTimeout(() => {
      pl.classList.add('is-exit');
      body.classList.remove('is-preloading');
      finish();
      setTimeout(() => pl.classList.add('is-gone'), 1250);
    }, 520);
  }
  function loop(now) {
    if (done) return;
    const t = now - t0;
    const timeP = Math.min(1, t / MIN);
    const loadP = ready >= need ? 1 : 0.55 + 0.4 * (ready / need) * Math.min(1, t / MAX);
    const target = Math.min(timeP, loadP) * 100;
    shown += (target - shown) * 0.12;
    pct.textContent = Math.round(shown);
    bar.style.transform = 'scaleX(' + (shown / 100).toFixed(3) + ')';
    if ((t >= MIN && ready >= need && shown > 98.5) || t >= MAX) { leave(); return; }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  const skip = () => { if (performance.now() - t0 > 400) leave(); };
  document.getElementById('plSkip').addEventListener('click', skip);
  pl.addEventListener('click', skip);
  addEventListener('keydown', function k() { skip(); removeEventListener('keydown', k); });
})();
