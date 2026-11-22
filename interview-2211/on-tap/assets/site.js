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
    var menu = '', lastG = '';
    PAGES.forEach(function (p) {
      if (p.group !== lastG) { menu += '<h6>' + esc(GROUPS[p.group] || p.group) + '</h6>'; lastG = p.group; }
      var prog = p.qids && p.qids.length ? '<small>' + countDone(p.qids) + '/' + p.qids.length + '</small>' : '';
      menu += '<a href="' + esc(p.file) + '"' + (p === cur ? ' class="on"' : '') + '><code>' + esc(p.code) + '</code><span>' + esc(p.title) + '</span>' + prog + '</a>';
    });
    bar.innerHTML =
      '<div class="sb-in">' +
      '<a class="sb-home" href="index.html" title="Về trang mục lục"><i></i>Ôn phỏng vấn</a>' +
      '<div class="sb-crumb">' + (cur ? '<b>' + esc(cur.code) + '</b><span>' + esc(cur.title) + '</span>' : '') + '</div>' +
      '<a class="sb-btn" href="' + (prev ? esc(prev.file) : '#') + '"' + (prev ? ' title="' + esc(prev.title) + '"' : ' aria-disabled="true"') + '>‹ <span class="sb-lbl">Trước</span></a>' +
      '<a class="sb-btn" href="' + (next ? esc(next.file) : '#') + '"' + (next ? ' title="' + esc(next.title) + '"' : ' aria-disabled="true"') + '><span class="sb-lbl">Sau</span> ›</a>' +
      '<details class="sb-menu"><summary class="sb-btn">☰ <span class="sb-lbl">Mục lục</span></summary><div class="sb-pop">' + menu + '</div></details>' +
      '<button class="sb-btn" type="button" id="sb-theme" title="Đổi giao diện sáng/tối">◐ <span class="sb-lbl">Sáng/Tối</span></button>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);
    bar.querySelector('#sb-theme').addEventListener('click', function () {
      var t = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', t); lsSet(KEY_THEME, t);
    });
    document.addEventListener('click', function (e) {
      var m = bar.querySelector('.sb-menu');
      if (m.open && !m.contains(e.target)) m.open = false;
    });

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
    initStudy();
    initIndex();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.scrollIntoView) setTimeout(function () { t.scrollIntoView(); }, 30); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('load', applyTheme);
})();
