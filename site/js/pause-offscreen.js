(() => {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-asleep', !e.isIntersecting)),
    { rootMargin: '30% 0px 30% 0px' });
  document.querySelectorAll('section, footer').forEach(el => io.observe(el));
})();
