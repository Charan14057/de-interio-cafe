/* Where a photo lives, from its id:
     mukundhan-05            -> images/projects/mukundhan/mukundhan-05.webp
     book-04                 -> images/catalogue-pages/book-04.webp
     why- / svc- / craft- / mat-  -> images/why-choose-us | services | craftsmanship | materials/
   Smaller copies for phones and thumbnails are generated into images/_sizes/800 and /400
   (run: python3 tools/make_image_sizes.py). */
window.DIC_PHOTO = function (id) {
  var g = { book: 'catalogue-pages', why: 'why-choose-us', svc: 'services', craft: 'craftsmanship', mat: 'materials' }[id.split('-')[0]];
  return 'images/' + (g || 'projects/' + id.replace(/-\d+$/, '')) + '/' + id + '.webp';
};
/* Responsive photos. Every photo exists in three widths: images/_sizes/400/<id>.webp,
   images/_sizes/800/<id>.webp and the full copy in its own folder (up to 1600 px). Each <img>
   that points at a photo gets a srcset, and its sizes follow the slot it actually fills, so the
   browser downloads and decodes the smallest copy that still looks sharp. Static markup,
   script-built cards, lightboxes and swapped slides are all covered. */
(function () {
  var re = /(?:^|\/)images\/(?:[\w-]+\/)*([a-z0-9-]+)\.webp(?:$|[?#])/;
  /* past 2x the eye cannot tell, so 3x phones get 2x copies: lighter downloads, less memory */
  var cap = Math.min(1, 2 / (window.devicePixelRatio || 1));
  var GUESS = '(max-width:760px) ' + Math.round(100 * cap) + 'vw, 50vw';
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) {
    es.forEach(function (e) {
      /* photos are cropped to fill their slot (object-fit: cover), so a tall slot needs a wider
         copy than its own width: most photos are ~16:9, hence height × 1.8 */
      var r = e.contentRect, w = Math.ceil(Math.max(r.width, r.height * 1.8) * cap), el = e.target;
      if (w > 0 && w > (+el.dataset.ssw || 0)) { el.dataset.ssw = w; el.sizes = w + 'px'; }
    });
  }) : null;
  var desc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  var setAttr = Element.prototype.setAttribute;
  function apply(img, v) {
    var m = re.exec(v || '');
    if (!m) { if (img.dataset.ss) { img.removeAttribute('srcset'); delete img.dataset.ss; } return v; }
    var id = m[1];
    if (img.dataset.ss !== id) {
      img.dataset.ss = id;
      if (!img.getAttribute('sizes')) setAttr.call(img, 'sizes', img.dataset.ssw ? img.dataset.ssw + 'px' : GUESS);
      setAttr.call(img, 'srcset', 'images/_sizes/400/' + id + '.webp 400w, images/_sizes/800/' + id + '.webp 800w, ' + DIC_PHOTO(id) + ' 1600w');
      if (ro) ro.observe(img);
    }
    return DIC_PHOTO(id);
  }
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    configurable: true, enumerable: desc.enumerable,
    get: function () { return desc.get.call(this); },
    set: function (v) { desc.set.call(this, apply(this, String(v))); }
  });
  Element.prototype.setAttribute = function (n, v) {
    if (n === 'src' && this instanceof HTMLImageElement) v = apply(this, String(v));
    return setAttr.call(this, n, v);
  };
  function sweep(el) { var v = el.getAttribute('src'); if (v && el.dataset.ss !== (re.exec(v) || [])[1]) apply(el, v); }
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.type === 'attributes') { if (m.target.tagName === 'IMG') sweep(m.target); continue; }
      for (var j = 0; j < m.addedNodes.length; j++) {
        var n = m.addedNodes[j];
        if (n.nodeType !== 1) continue;
        if (n.tagName === 'IMG') sweep(n);
        else if (n.getElementsByTagName) { var l = n.getElementsByTagName('img'); for (var k = 0; k < l.length; k++) sweep(l[k]); }
      }
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
})();
