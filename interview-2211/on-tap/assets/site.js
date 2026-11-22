/* Ôn phỏng vấn – điều hướng chung, giao diện sáng/tối, chế độ ôn tập.
   Cần assets/manifest.js (sinh bởi _src/build.py) nạp trước file này. */
(function () {
  var KEY_THEME = 'ontap-theme', KEY_DONE = 'ontap-done';
  var root = document.documentElement;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function applyTheme() {
    var t = lsGet(KEY_THEME);
    if (t === 'light' || t === 'dark') root.setAttribute('data-theme', t);
    else if (root.getAttribute('data-theme') !== 'auto') root.removeAttribute('data-theme');
  }
  applyTheme();

  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var done = {};
  try { (JSON.parse(lsGet(KEY_DONE) || '[]') || []).forEach(function (q) { done[q] = 1; }); } catch (e) {}
  function saveDone() { lsSet(KEY_DONE, JSON.stringify(Object.keys(done))); }
  function countDone(qids) { var n = 0; (qids || []).forEach(function (q) { if (done[q]) n++; }); return n; }

  var PAGES = window.ONTAP_PAGES || [];
  var GROUPS = window.ONTAP_GROUPS || {};
  var file = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
  var idx = -1;
  PAGES.forEach(function (p, i) { if (p.file === file) idx = i; });
  var cur = PAGES[idx];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function buildBar() {
    var bar = document.createElement('div');
    bar.className = 'sb';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Điều hướng bộ ôn tập');
    var prev = idx > 0 ? PAGES[idx - 1] : null, next = idx >= 0 && idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
    bar.innerHTML =
      '<div class="sb-in">' +
      '<a class="sb-home" href="index.html" title="Về trang mục lục"><i></i>Ôn phỏng vấn</a>' +
      '<div class="sb-crumb">' + (cur ? '<b>' + esc(cur.code) + '</b><span>' + esc(cur.title) + '</span>' : '') + '</div>' +
      '<a class="sb-btn" href="' + (prev ? esc(prev.file) : '#') + '"' + (prev ? ' title="' + esc(prev.title) + '"' : ' aria-disabled="true"') + '>‹ <span class="sb-lbl">Trước</span></a>' +
      '<a class="sb-btn" href="' + (next ? esc(next.file) : '#') + '"' + (next ? ' title="' + esc(next.title) + '"' : ' aria-disabled="true"') + '><span class="sb-lbl">Sau</span> ›</a>' +
      '<button class="sb-btn" type="button" id="sb-toc" title="Mở/đóng mục lục">☰ <span class="sb-lbl">Mục lục</span></button>' +
      '<button class="sb-btn" type="button" id="sb-theme" title="Đổi giao diện sáng/tối">◐ <span class="sb-lbl">Sáng/Tối</span></button>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('#sb-theme').addEventListener('click', function () {
      var t = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', t); lsSet(KEY_THEME, t);
    });
    bar.querySelector('#sb-toc').addEventListener('click', toggleToc);

    if (cur) {
      var pg = document.createElement('div');
      pg.className = 'pager';
      pg.setAttribute('role', 'navigation');
      pg.setAttribute('aria-label', 'Trang trước và sau');
      pg.innerHTML =
        (prev ? '<a class="prev" href="' + esc(prev.file) + '"><small>‹ Trang trước · ' + esc(prev.code) + '</small><span>' + esc(prev.title) + '</span></a>' : '') +
        (next ? '<a class="next" href="' + esc(next.file) + '"><small>Trang sau · ' + esc(next.code) + ' ›</small><span>' + esc(next.title) + '</span></a>' : '');
      document.body.appendChild(pg);
    }
  }


  /* ----- Mục lục ghim (sidebar) ----- */
  var KEY_PIN = 'ontap-pin', KEY_GRP = 'ontap-grp';
  var WIDE = window.matchMedia ? matchMedia('(min-width: 1180px)') : { matches: false, addListener: function () {} };
  /* Các trang gộp vào một mục "A2 · WMS" (trừ Sổ tay nghiệp vụ A2·NV) */
  function inWmsGroup(p) { return p.code.indexOf('A2') === 0 && p.code !== 'A2·NV'; }
  var toc, scrim;

  function item(p) {
    var prog = p.qids && p.qids.length ? '<small>' + countDone(p.qids) + '/' + p.qids.length + '</small>' : '';
    return '<a href="' + esc(p.file) + '"' + (p === cur ? ' class="on" aria-current="page"' : '') + '><code>' + esc(p.code) + '</code><span>' + esc(p.title) + '</span>' + prog + '</a>';
  }

  function buildToc() {
    var html = '', lastG = '', wmsDone = false;
    var wms = PAGES.filter(inWmsGroup);
    var wmsOpen = wms.indexOf(cur) >= 0 || lsGet(KEY_GRP) === '1';
    PAGES.forEach(function (p) {
      if (p.group !== lastG) { html += '<div class="toc-h">' + esc(GROUPS[p.group] || p.group) + '</div>'; lastG = p.group; }
      if (inWmsGroup(p)) {
        if (wmsDone) return;
        wmsDone = true;
        var q = []; wms.forEach(function (w) { q = q.concat(w.qids || []); });
        html += '<div class="toc-grp' + (wmsOpen ? ' open' : '') + '">' +
          '<button type="button" class="toc-grp-b" aria-expanded="' + wmsOpen + '"><code>A2</code><span>WMS · ' + wms.length + ' trang</span>' +
          (q.length ? '<small>' + countDone(q) + '/' + q.length + '</small>' : '') + '<i aria-hidden="true">▸</i></button>' +
          '<div class="toc-sub">' + wms.map(item).join('') + '</div></div>';
        return;
      }
      html += item(p);
    });
    toc = document.createElement('div');
    toc.className = 'toc';
    toc.setAttribute('role', 'navigation');
    toc.setAttribute('aria-label', 'Mục lục');
    toc.innerHTML =
      '<div class="toc-top"><a href="index.html" class="toc-home"><i></i>Mục lục</a>' +
      '<button type="button" class="toc-pin" title="Ghim mục lục bên trái">Ghim</button>' +
      '<button type="button" class="toc-x" title="Đóng" aria-label="Đóng mục lục">✕</button></div>' +
      '<div class="toc-list">' + html + '</div>';
    scrim = document.createElement('div');
    scrim.className = 'toc-scrim';
    var fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'toc-fab'; fab.setAttribute('aria-label', 'Mở mục lục'); fab.textContent = '☰';
    document.body.appendChild(scrim); document.body.appendChild(toc); document.body.appendChild(fab);

    toc.querySelector('.toc-grp-b') && toc.querySelector('.toc-grp-b').addEventListener('click', function () {
      var g = this.parentNode, o = !g.classList.contains('open');
      g.classList.toggle('open', o); this.setAttribute('aria-expanded', o); lsSet(KEY_GRP, o ? '1' : '');
    });
    toc.querySelector('.toc-pin').addEventListener('click', function () {
      var pinned = root.classList.contains('toc-pin');
      lsSet(KEY_PIN, pinned ? '0' : '1'); applyPin();
    });
    toc.querySelector('.toc-x').addEventListener('click', closeToc);
    scrim.addEventListener('click', closeToc);
    fab.addEventListener('click', toggleToc);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeToc(); });
    (WIDE.addEventListener ? WIDE.addEventListener.bind(WIDE, 'change') : WIDE.addListener.bind(WIDE))(applyPin);
    applyPin();
    var on = toc.querySelector('a.on');
    if (on) { var l = toc.querySelector('.toc-list'); l.scrollTop = on.offsetTop - l.clientHeight / 3; }
  }
  function applyPin() {
    var pin = WIDE.matches && lsGet(KEY_PIN) !== '0';
    root.classList.toggle('toc-pin', pin);
    if (toc) { var b = toc.querySelector('.toc-pin'); b.textContent = pin ? 'Bỏ ghim' : 'Ghim'; b.style.display = WIDE.matches ? '' : 'none'; }
    if (pin) closeToc();
  }
  function openToc() { root.classList.add('toc-open'); }
  function closeToc() { root.classList.remove('toc-open'); }
  function toggleToc() {
    if (root.classList.contains('toc-pin')) { lsSet(KEY_PIN, '0'); applyPin(); return; }
    if (root.classList.contains('toc-open')) closeToc(); else openToc();
  }

  /* ----- Chế độ ôn tập trên trang câu trả lời ----- */
  function initStudy() {
    var cards = [].slice.call(document.querySelectorAll('.qa[data-q]'));
    if (!cards.length) return;
    var meter = document.querySelector('.study-bar .meter i'), txt = document.querySelector('.study-bar .prog span');
    function refresh() {
      var n = 0;
      cards.forEach(function (c) { var d = !!done[c.dataset.q]; c.classList.toggle('done', d); var cb = c.querySelector('.qa-chk input'); if (cb) cb.checked = d; if (d) n++; });
      if (meter) meter.style.width = (100 * n / cards.length) + '%';
      if (txt) txt.textContent = n + '/' + cards.length + ' câu đã thuộc';
    }
    cards.forEach(function (c) {
      var cb = c.querySelector('.qa-chk input');
      if (cb) cb.addEventListener('change', function () { if (cb.checked) done[c.dataset.q] = 1; else delete done[c.dataset.q]; saveDone(); refresh(); });
      var rv = c.querySelector('.reveal');
      if (rv) rv.addEventListener('click', function () { c.classList.add('shown'); });
    });
    var quiz = document.getElementById('st-quiz'), all = document.getElementById('st-all'), reset = document.getElementById('st-reset');
    if (quiz) quiz.addEventListener('click', function () {
      var on = !document.body.classList.contains('quiz');
      document.body.classList.toggle('quiz', on);
      cards.forEach(function (c) { c.classList.remove('shown'); });
      quiz.classList.toggle('on', on);
      quiz.textContent = on ? 'Tắt tự kiểm tra' : 'Tự kiểm tra (ẩn đáp án)';
      lsSet('ontap-quiz', on ? '1' : '');
    });
    if (lsGet('ontap-quiz') === '1' && quiz) quiz.click();
    if (all) all.addEventListener('click', function () {
      var ds = document.querySelectorAll('details.fu'), open = !all.classList.contains('on');
      ds.forEach(function (d) { d.open = open; });
      all.classList.toggle('on', open);
      all.textContent = open ? 'Thu gọn follow-up' : 'Mở hết follow-up';
    });
    if (reset) reset.addEventListener('click', function () {
      cards.forEach(function (c) { delete done[c.dataset.q]; }); saveDone(); refresh();
    });
    refresh();
  }

  /* ----- Index: tiến độ + tìm kiếm ----- */
  function initIndex() {
    document.querySelectorAll('[data-prog]').forEach(function (el) {
      var p = PAGES.filter(function (x) { return x.file === el.dataset.prog; })[0];
      if (!p || !p.qids || !p.qids.length) return;
      var n = countDone(p.qids);
      var i = el.querySelector('.meter i'), s = el.querySelector('.pnum');
      if (i) i.style.width = (100 * n / p.qids.length) + '%';
      if (s) s.textContent = n + '/' + p.qids.length + ' đã thuộc';
    });
    var tot = document.getElementById('tot-prog');
    if (tot) {
      var all = [], n;
      PAGES.forEach(function (p) { all = all.concat(p.qids || []); });
      n = countDone(all);
      tot.querySelector('.meter i').style.width = (all.length ? 100 * n / all.length : 0) + '%';
      tot.querySelector('span').textContent = n + '/' + all.length + ' câu đã đánh dấu thuộc';
    }
    var inp = document.getElementById('q-search'), out = document.getElementById('q-results');
    var Q = window.ONTAP_Q || [];
    function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); }
    Q.forEach(function (q) { q._n = norm(q.code + ' ' + q.text + ' ' + (q.hint || '')); });
    if (inp && out) inp.addEventListener('input', function () {
      var v = norm(inp.value.trim());
      if (v.length < 2) { out.innerHTML = ''; return; }
      var ws = v.split(/\s+/), hits = Q.filter(function (q) { return ws.every(function (w) { return q._n.indexOf(w) >= 0; }); }).slice(0, 40);
      out.innerHTML = hits.length ? hits.map(function (q) {
        return '<a href="' + esc(q.href) + '"><code>' + esc(q.code) + '</code><span>' + esc(q.text) + '</span></a>';
      }).join('') : '<p class="muted" style="color:var(--muted)">Không tìm thấy câu nào.</p>';
    });
    document.querySelectorAll('.bank-sec li[data-q]').forEach(function (li) { if (done[li.dataset.q]) li.classList.add('done'); });
  }

  function start() {
    applyTheme();
    buildBar();
    buildToc();
    initStudy();
    initIndex();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.scrollIntoView) setTimeout(function () { t.scrollIntoView(); }, 30); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('load', applyTheme);
})();
