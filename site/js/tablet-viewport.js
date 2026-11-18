/* Touch tablets — iPad, Android tablets, and phones turned sideways.
   Laptops and desktops draw the layout at 85% with CSS zoom (see "85% ZOOM" in css/styles.css).
   Safari handles CSS zoom poorly on touch screens (slow scrolling, fixed layers drifting), so on a
   touch screen at least 761 px wide the page asks for a viewport 1/0.85 wider than the screen
   instead; the browser then scales the whole page down to fit — the same picture, drawn natively.
   Runs straight after the viewport <meta>, before anything is laid out. */
/* Screen width in the units the layout breakpoints were written for (scripts use this,
   not innerWidth, so they agree with the stylesheet on every device). */
window.DIC_VW = function () {
  return innerWidth * (document.documentElement.classList.contains('dic-tablet') ? 0.85 : 1);
};
(function () {
  var meta = document.querySelector('meta[name="viewport"]');
  if (!meta || !window.matchMedia || !matchMedia('(hover: none)').matches) return;
  var NATIVE = 'width=device-width, initial-scale=1, viewport-fit=cover';
  function screenWidth() {
    var a = screen.width, b = screen.height;
    var land = matchMedia('(orientation: landscape)').matches;
    return land ? Math.max(a, b) : Math.min(a, b);
  }
  function fit() {
    var w = screenWidth();
    if (w >= 761) {
      meta.setAttribute('content', 'width=' + Math.round(w / 0.85) + ', viewport-fit=cover');
      document.documentElement.classList.add('dic-tablet');
    } else {
      meta.setAttribute('content', NATIVE);
      document.documentElement.classList.remove('dic-tablet');
    }
  }
  fit();
  addEventListener('orientationchange', function () { setTimeout(fit, 60); });
  if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', function () { setTimeout(fit, 60); });
})();
