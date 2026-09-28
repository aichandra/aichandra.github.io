(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  qsa('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  qsa('.person__photo[data-initials]').forEach(function (img) {
    img.addEventListener('error', function () {
      var box = document.createElement('div');
      box.className = 'person__photo person__photo--empty';
      box.textContent = img.getAttribute('data-initials') || '';
      box.setAttribute('aria-hidden', 'true');
      img.replaceWith(box);
    });
  });

  var seen = false;
  try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (e) {}
  function markSeen() { try { sessionStorage.setItem('introSeen', '1'); } catch (e) {} }

  var paras = qsa('.lede > p[data-q]');
  var willType = paras.length > 0 && !reduce && !seen;

  var NEWS   = '.news h2, .news ul > li';
  var REVEAL = '.page__intro, .section > h2, .pub, .rows > li, .people > li, ' +
               '.venues > li, .news h2, .news ul > li, .footnote';

  var targets = qsa(REVEAL).filter(function (el) {
    return !(willType && el.matches(NEWS));
  });

  function revealNews() {
    qsa(NEWS).forEach(function (el, i) {
      setTimeout(function () { el.classList.add('is-in'); }, i * 135);
    });
  }

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
    if (reduce) qsa(NEWS).forEach(function (el) { el.classList.add('is-in'); });
  } else {
    targets.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
        return c.matches && c.matches(REVEAL);
      });
      el.style.transitionDelay = Math.min(sibs.indexOf(el) * 125, 520) + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      var h = window.innerHeight || document.documentElement.clientHeight;
      targets.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < h && r.bottom > 0) { el.classList.add('is-in'); io.unobserve(el); }
      });
    }, 60);
  }

  if (!paras.length) return;

  if (!willType) {
    paras.forEach(function (p) { p.style.visibility = 'visible'; });
    if (!reduce) qsa(NEWS).forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  markSeen();

  var plan = paras.map(function (p) {
    var nodes = [], walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = walker.nextNode())) nodes.push({ node: n, full: n.data });
    return {
      p: p,
      nodes: nodes,
      total: nodes.reduce(function (s, x) { return s + x.full.length; }, 0),
      height: p.getBoundingClientRect().height
    };
  });

  plan.forEach(function (s) {
    s.p.style.minHeight = s.height + 'px';
    s.nodes.forEach(function (x) { x.node.data = ''; });
    s.p.style.visibility = 'visible';
  });

  function render(s, count) {
    var left = count;
    for (var i = 0; i < s.nodes.length; i++) {
      var take = Math.max(0, Math.min(left, s.nodes[i].full.length));
      s.nodes[i].node.data = s.nodes[i].full.slice(0, take);
      left -= take;
    }
  }

  var caret = document.createElement('span');
  caret.className = 'caret';
  caret.setAttribute('aria-hidden', 'true');

  var done = false;
  function finishNow() {
    if (done) return;
    done = true;
    plan.forEach(function (s) {
      render(s, s.total);
      s.p.style.minHeight = '';
      var q = s.p.querySelector('.typed-q');
      if (q) q.parentNode.removeChild(q);
    });
    if (caret.parentNode) caret.parentNode.removeChild(caret);
    revealNews();
  }

  ['click', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
    window.addEventListener(ev, finishNow, { once: true, passive: true });
  });

  var START      = 600,
      Q_CHAR      = 48,
      Q_CHAR_FIRST = 76,
      Q_HOLD      = 560,
      Q_DEL       = 26,
      AFTER       = 220,
      GAP         = 470,
      ANSWER      = 3200;

  function typeQuestion(s, then, first) {
    if (done) return;
    var rate = first ? Q_CHAR_FIRST : Q_CHAR;
    var span = document.createElement('span');
    span.className = 'typed-q';
    s.p.insertBefore(span, s.p.firstChild);
    s.p.appendChild(caret);

    var text = s.p.getAttribute('data-q'), i = 0;
    (function tick() {
      if (done) return;
      span.textContent = text.slice(0, ++i);
      if (i < text.length) return setTimeout(tick, rate);
      setTimeout(function erase() {
        if (done) return;
        span.textContent = text.slice(0, --i);
        if (i > 0) return setTimeout(erase, Q_DEL);
        if (span.parentNode) span.parentNode.removeChild(span);
        setTimeout(then, AFTER);
      }, Q_HOLD);
    })();
  }

  function typeAnswer(s, then) {
    if (done) return;
    s.p.appendChild(caret);
    var perTick = Math.max(1, Math.ceil(s.total / (ANSWER / 16)));
    var shown = 0;
    (function frame() {
      if (done) return;
      shown = Math.min(s.total, shown + perTick);
      render(s, shown);
      if (shown < s.total) return setTimeout(frame, 16);
      s.p.style.minHeight = '';
      setTimeout(then, GAP);
    })();
  }

  setTimeout(function run(i) {
    if (done) return;
    if (i >= plan.length) {
      if (caret.parentNode) caret.parentNode.removeChild(caret);
      revealNews();
      return;
    }
    typeQuestion(plan[i], function () {
      typeAnswer(plan[i], function () { run(i + 1); });
    }, i === 0);
  }, START, 0);
})();
