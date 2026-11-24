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
      '<button class="sb-btn" type="button" id="sb-open" hidden title="Mở/thu gọn mọi phần ẩn trong trang">⇕ <span class="sb-lbl">Mở hết</span></button>' +
      '<button class="sb-btn" type="button" id="sb-tts" hidden title="Đọc to từ đoạn đang xem">🔊 <span class="sb-lbl">Nghe</span></button>' +
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
      var h = c.querySelector('.qa-h'), chk = c.querySelector('.qa-chk');
      if (h && TTS_OK) {
        var sb = document.createElement('button');
        sb.type = 'button'; sb.className = 'qa-say'; sb.title = 'Nghe câu này'; sb.setAttribute('aria-label', 'Nghe câu này'); sb.textContent = '🔊';
        h.insertBefore(sb, chk);
        sb.addEventListener('click', function () { c.classList.add('shown'); ttsStart(c, null); });
      }
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
    if (all) all.addEventListener('click', function () { setAllOpen(!root.classList.contains('all-open')); });
    if (reset) reset.addEventListener('click', function () {
      cards.forEach(function (c) { delete done[c.dataset.q]; }); saveDone(); refresh();
    });
    refresh();
  }

  /* ----- Mở hết: mọi <details> + đáp án đang ẩn (chế độ tự kiểm tra) ----- */
  function pageDetails() {
    return [].slice.call(document.querySelectorAll('details')).filter(function (d) { return !d.closest('.sb,.toc,.tts-bar'); });
  }
  function setAllOpen(open) {
    pageDetails().forEach(function (d) { d.open = open; });
    document.querySelectorAll('.qa[data-q]').forEach(function (c) {
      if (open) c.classList.add('shown');
      else if (document.body.classList.contains('quiz')) c.classList.remove('shown');
    });
    root.classList.toggle('all-open', open);
    var b = document.getElementById('sb-open'), st = document.getElementById('st-all');
    if (b) b.querySelector('.sb-lbl').textContent = open ? 'Thu gọn' : 'Mở hết';
    if (st) { st.classList.toggle('on', open); st.textContent = open ? 'Thu gọn hết' : 'Mở hết'; }
  }

  /* ----- Nghe đọc (Web Speech API, giọng tiếng Việt của máy) ----- */
  var TTS_OK = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  var RATES = [0.8, 1, 1.2, 1.4, 1.7];
  var T = { parts: [], i: 0, token: 0, playing: false, bar: null, voice: null, rate: parseFloat(lsGet('ontap-rate')) || 1 };
  var BLOCK = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,summary,tr,dt,dd,figcaption,.honest,.mini,.trap';
  var SKIP = '.sb,.toc,.toc-fab,.toc-scrim,.tts-bar,.pager,.tabs,.study-bar,nav,script,style,pre,svg,button,.qa-chk,[aria-hidden="true"]';

  function pickVoice() {
    if (!TTS_OK) return null;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^vi/i.test(v.lang); });
    if (!vs.length) return null;
    function score(v) { return (/natural|online|neural/i.test(v.name) ? 4 : 0) + (/google/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1); }
    vs.sort(function (a, b) { return score(b) - score(a); });
    return vs[0];
  }
  if (TTS_OK) {
    T.voice = pickVoice();
    if (speechSynthesis.addEventListener) speechSynthesis.addEventListener('voiceschanged', function () { T.voice = pickVoice(); });
  }

  // Văn bản của một khối kèm bản đồ vị trí: mỗi ký tự đọc lên trỏ về đúng text node trên trang,
  // để tô được câu và chữ đang đọc.
  function rawText(el) {
    var nodes = [], s = '';
    function walk(n) {
      if (n.nodeType === 3) { nodes.push({ node: n, start: s.length }); s += n.nodeValue; return; }
      if (n.nodeType !== 1 || (n !== el && n.matches(BLOCK + ',' + SKIP))) return;
      var gap = n !== el && getComputedStyle(n).display !== 'inline';
      if (gap) s += ' ';
      for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
      if (gap) s += ' ';
    }
    if (el.tagName === 'TR') {
      [].forEach.call(el.children, function (td) { if (s && td.textContent.trim()) s += '. '; walk(td); });
    } else walk(el);
    return { s: s, nodes: nodes };
  }
  function sub(o, re, by) {
    var s = '', m = [], last = 0;
    o.s.replace(re, function () {
      var a = arguments, mt = a[0], idx = a[a.length - 2];
      var r = typeof by === 'function' ? by.apply(null, a) : by;
      s += o.s.slice(last, idx) + r; m = m.concat(o.m.slice(last, idx));
      for (var j = 0; j < r.length; j++) m.push(o.m[idx] != null ? o.m[idx] : o.m[o.m.length - 1]);
      last = idx + mt.length; return mt;
    });
    s += o.s.slice(last); m = m.concat(o.m.slice(last));
    return { s: s, m: m };
  }
  function cleanMapped(raw) {
    var o = { s: raw, m: [] };
    for (var i = 0; i < raw.length; i++) o.m.push(i);
    o = sub(o, /\s+/g, ' ');
    o = sub(o, /[→⇒➜←·]/g, ', ');
    o = sub(o, /≈|~(?=\s*\d)/g, 'khoảng ');
    o = sub(o, /≤/g, ' tối đa ');
    o = sub(o, /≥/g, ' ít nhất ');
    o = sub(o, /[✓✔✗✘]/g, '');
    o = sub(o, /\s+([,.;:!?])/g, function (x, p) { return p; });
    o = sub(o, / {2,}/g, ' ');
    return o;
  }
  // Tách câu, giữ vị trí bắt đầu (off) trong chuỗi đã làm sạch.
  function splitText(t) {
    var out = [], re = /[\s\S]+?(?:[.!?;:]+(?=\s|$)|$)/g, mt;
    function push(b, off) {
      var l = b.length - b.replace(/^\s+/, '').length; b = b.trim(); off += l;
      if (b) out.push({ text: b, off: off });
    }
    while ((mt = re.exec(t))) {
      if (!mt[0]) { re.lastIndex++; continue; }
      var b = mt[0], off = mt.index;
      var lead = b.length - b.replace(/^\s+/, '').length; b = b.slice(lead); off += lead;
      while (b.trim().length > 220) {
        var k = b.lastIndexOf(', ', 220); if (k < 60) k = b.lastIndexOf(' ', 220); if (k < 60) k = 220;
        push(b.slice(0, k + 1), off); off += k + 1; b = b.slice(k + 1);
      }
      push(b, off);
    }
    return out;
  }
  function collect(scope) {
    var parts = [];
    [].slice.call(scope.querySelectorAll(BLOCK)).forEach(function (el) {
      if (el.closest(SKIP)) return;
      if (el.tagName !== 'TR' && el.closest('tr')) return;
      if (!el.getClientRects().length) return;
      var raw = rawText(el), o = cleanMapped(raw.s);
      if (!/[\p{L}\d]/u.test(o.s)) return;
      splitText(o.s).forEach(function (p) { parts.push({ el: el, text: p.text, off: p.off, map: o.m, nodes: raw.nodes }); });
    });
    return parts;
  }

  /* Tô câu + chữ đang đọc bằng CSS Custom Highlight API (không sửa DOM). */
  var HL = !!(window.CSS && CSS.highlights && window.Highlight);
  function domPos(nodes, i, end) {
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k], len = n.node.nodeValue.length;
      if (i < n.start + len || (end && i === n.start + len)) return { node: n.node, off: Math.max(0, i - n.start) };
      if (i < n.start) return { node: n.node, off: 0 };
    }
    var l = nodes[nodes.length - 1]; return l ? { node: l.node, off: l.node.nodeValue.length } : null;
  }
  function rangeOf(p, a, b) {
    if (!p.nodes || !p.nodes.length || b <= a) return null;
    var ra = p.map[p.off + a], rb = p.map[p.off + b - 1];
    if (ra == null || rb == null) return null;
    var s = domPos(p.nodes, ra, false), e = domPos(p.nodes, rb + 1, true);
    if (!s || !e) return null;
    try { var r = document.createRange(); r.setStart(s.node, s.off); r.setEnd(e.node, e.off); return r; } catch (x) { return null; }
  }
  function hl(name, r) {
    if (!HL) return;
    if (r) CSS.highlights.set(name, new Highlight(r)); else CSS.highlights.delete(name);
  }
  function hlWord(p, ci, cl) {
    var t = p.text;
    if (!cl) { var m = /^[^\s]+/.exec(t.slice(ci)); cl = m ? m[0].length : 0; }
    while (cl > 0 && /[,.;:!?)"”]/.test(t.charAt(ci + cl - 1))) cl--;
    hl('tts-word', rangeOf(p, ci, ci + cl));
  }

  function buildTtsBar() {
    if (T.bar) return T.bar;
    var b = document.createElement('div');
    b.className = 'tts-bar'; b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Trình đọc');
    b.innerHTML = '<button type="button" data-a="prev" title="Đoạn trước">⏮</button>' +
      '<button type="button" data-a="play" title="Tạm dừng / tiếp tục">⏸</button>' +
      '<button type="button" data-a="next" title="Đoạn sau">⏭</button>' +
      '<button type="button" data-a="rate" title="Tốc độ đọc">1×</button>' +
      '<span class="tts-msg" aria-live="polite"></span>' +
      '<button type="button" data-a="stop" title="Tắt đọc">✕</button>';
    b.addEventListener('click', function (e) {
      var a = e.target.closest('button'); if (!a) return;
      var act = a.dataset.a;
      if (act === 'play') { if (T.playing) ttsPause(); else speakAt(T.i); }
      else if (act === 'next') jump(1);
      else if (act === 'prev') jump(-1);
      else if (act === 'stop') ttsStop();
      else if (act === 'rate') {
        var k = RATES.indexOf(T.rate); T.rate = RATES[(k + 1) % RATES.length]; lsSet('ontap-rate', String(T.rate));
        syncBar(); if (T.playing) speakAt(T.i);
      }
    });
    document.body.appendChild(b);
    T.bar = b; return b;
  }
  function warn(short, full) {
    var m = T.bar.querySelector('.tts-msg');
    m.dataset.warn = '1'; m.textContent = short; m.title = full;
    clearTimeout(T.wt); T.wt = setTimeout(function () { delete m.dataset.warn; m.title = ''; syncBar(); }, 7000);
  }
  function syncBar() {
    if (!T.bar) return;
    T.bar.querySelector('[data-a="play"]').textContent = T.playing ? '⏸' : '▶';
    T.bar.querySelector('[data-a="rate"]').textContent = String(T.rate).replace('.', ',') + '×';
    var m = T.bar.querySelector('.tts-msg');
    if (!m.dataset.warn) m.textContent = T.parts.length ? (T.i + 1) + '/' + T.parts.length : '';
    var sb = document.getElementById('sb-tts'); if (sb) sb.classList.toggle('on', root.classList.contains('tts-on'));
  }
  function mark(el) {
    var old = document.querySelector('.tts-cur'); if (old && old !== el) old.classList.remove('tts-cur');
    if (!el) return;
    el.classList.add('tts-cur');
    var r = el.getBoundingClientRect();
    if (r.top < 90 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  function speakAt(i) {
    var tok = ++T.token, busy = speechSynthesis.speaking || speechSynthesis.pending;
    speechSynthesis.cancel();
    if (i < 0) i = 0;
    if (i >= T.parts.length) { ttsStop(); return; }
    T.i = i; T.playing = true;
    var p = T.parts[i];
    mark(p.el);
    hl('tts-sent', rangeOf(p, 0, p.text.length)); hl('tts-word', null);
    var u = new SpeechSynthesisUtterance(p.text);
    u.onboundary = function (e) { if (tok === T.token && e.name !== 'sentence') hlWord(p, e.charIndex, e.charLength); };
    u.lang = 'vi-VN'; u.rate = T.rate;
    if (T.voice) u.voice = T.voice;
    u.onend = function () { if (tok === T.token && T.playing) speakAt(i + 1); };
    u.onerror = function (e) {
      if (tok !== T.token || e.error === 'interrupted' || e.error === 'canceled') return;
      ttsPause(); warn('Không đọc được (' + e.error + ')', 'Trình duyệt báo lỗi khi đọc. Thử Edge, Safari hoặc Chrome trên điện thoại.');
    };
    // iOS chỉ cho đọc câu đầu nếu gọi ngay trong cú bấm; Chrome hay nuốt câu nói ngay sau cancel nên chờ chút.
    if (busy) setTimeout(function () { if (tok === T.token) speechSynthesis.speak(u); }, 60);
    else speechSynthesis.speak(u);
    syncBar();
  }
  function jump(d) {
    var i = T.i, el = T.parts[i] && T.parts[i].el;
    if (d > 0) { while (i < T.parts.length && T.parts[i].el === el) i++; }
    else {
      while (i > 0 && T.parts[i - 1].el === el) i--;
      if (i > 0) { var pe = T.parts[i - 1].el; i--; while (i > 0 && T.parts[i - 1].el === pe) i--; }
    }
    speakAt(i);
  }
  function ttsPause() { T.token++; T.playing = false; speechSynthesis.cancel(); syncBar(); }
  function ttsStop() {
    T.token++; T.playing = false; speechSynthesis.cancel();
    hl('tts-sent', null); hl('tts-word', null);
    mark(null); var c = document.querySelector('.tts-cur'); if (c) c.classList.remove('tts-cur');
    root.classList.remove('tts-on'); T.parts = []; syncBar();
  }
  // Đọc một mục trên trang gốc: từ thẻ h2 tới trước thẻ h2 kế tiếp.
  function sectionParts(h, heads) {
    var k = heads.indexOf(h) + 1;
    while (k < heads.length && h.tagName === 'H2' && heads[k].tagName !== 'H2') k++;
    var nx = heads[k];
    return collect(document.body).filter(function (p) {
      var e = p.el;
      if (e !== h && !(h.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
      return !nx || !!(nx.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING);
    });
  }
  function addSectionButtons() {
    if (document.body.classList.contains('g-page')) return;
    var heads = [].slice.call(document.querySelectorAll('h2,h3')).filter(function (h) {
      return !h.closest(SKIP) && !h.closest('summary') && !h.closest('template') && h.getClientRects().length;
    });
    heads.forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sec-say' + (h.tagName === 'H3' ? ' sm' : ''); b.title = 'Nghe mục này'; b.setAttribute('aria-label', 'Nghe mục này'); b.textContent = '🔊';
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); ttsPlay(sectionParts(h, heads), 0); });
      h.appendChild(b);
    });
  }
  function ttsStart(scope, fromViewport) {
    var parts = collect(scope);
    if (!parts.length) return;
    var start = 0;
    if (fromViewport) {
      for (var k = 0; k < parts.length; k++) { if (parts[k].el.getBoundingClientRect().bottom > 70) { start = k; break; } }
    }
    ttsPlay(parts, start);
  }
  function ttsPlay(parts, start) {
    if (!parts.length) return;
    T.parts = parts;
    buildTtsBar(); root.classList.add('tts-on');
    if (!T.voice && speechSynthesis.getVoices().length) warn('Thiếu giọng tiếng Việt', 'Máy chưa cài giọng tiếng Việt. Dùng Edge (giọng HoaiMy/NamMinh), Safari hoặc điện thoại Android/iPhone.');
    speakAt(start);
  }

  function initTools() {
    var ob = document.getElementById('sb-open');
    if (ob && (pageDetails().length || document.querySelector('.qa[data-q]'))) {
      ob.hidden = false;
      ob.addEventListener('click', function () { setAllOpen(!root.classList.contains('all-open')); });
    }
    var tb = document.getElementById('sb-tts');
    if (tb && TTS_OK && cur) {
      tb.hidden = false;
      tb.addEventListener('click', function () {
        if (root.classList.contains('tts-on')) { ttsStop(); return; }
        ttsStart(document.querySelector('main') || document.body, true);
      });
    }
    if (TTS_OK && cur) addSectionButtons();
    window.addEventListener('pagehide', function () { if (TTS_OK) speechSynthesis.cancel(); });
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
    initTools();
    initIndex();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t && t.scrollIntoView) setTimeout(function () { t.scrollIntoView(); }, 30); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.addEventListener('load', applyTheme);
})();
