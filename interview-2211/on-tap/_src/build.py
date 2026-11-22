#!/usr/bin/env python3
"""Sinh bộ trang ôn phỏng vấn trong on-tap/.

Chạy:  python3 on-tap/_src/build.py

- Câu hỏi lấy nguyên văn từ _src/ngan-hang.docx (đánh số 1..N theo thứ tự trong file).
- Câu trả lời, follow-up, cheat sheet viết trong _src/content/*.txt (cú pháp ở README.md).
- Trang cũ lấy từ thư mục cha (interview-2211/*.html), giữ nguyên nội dung; chỉ thay CSS
  (nếu có _src/restyle/<tên>.css) và gắn thanh điều hướng chung.
"""
import html, json, os, re, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ORIG = os.path.dirname(OUT)
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Be+Vietnam+Pro:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">')
ASSETS = '<link rel="stylesheet" href="assets/site.css"><script src="assets/manifest.js"></script><script src="assets/site.js"></script>'

GROUPS = {
    'start': 'Bắt đầu',
    'A': 'A · Câu hỏi theo CV',
    'B': 'B · Kỹ thuật nền tảng',
    'C': 'C · Use case & system design',
    'D': 'D · Tình huống & debug',
    'E': 'E · Behavioral',
    'F': 'F · HR',
    'G': 'G · Tiếng Anh & hỏi ngược',
    'tool': 'Công cụ',
}
GROUP_COLOR = {'A': 'var(--accent)', 'B': 'var(--blue)', 'C': 'var(--violet)', 'D': 'var(--bad)',
               'E': 'var(--ok)', 'F': 'var(--hi)', 'G': 'var(--accent)', 'start': 'var(--ink)', 'tool': 'var(--hi)'}

# ---------------------------------------------------------------- docx
def read_docx():
    z = zipfile.ZipFile(os.path.join(HERE, 'ngan-hang.docx'))
    x = z.read('word/document.xml').decode()
    lines = []
    for p in re.findall(r'<w:p[ >].*?</w:p>', x, flags=re.S):
        t = html.unescape(''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p))).strip()
        if t:
            lines.append(t)
    return lines


def parse_bank(lines):
    """-> groups: [{code,title,intro,subs:[{code,title,intro,qs:[{n,text,hint}]}]}]"""
    groups, g, s, n = [], None, None, 0
    started = False
    for ln in lines:
        mg = re.match(r'^([A-G])\. (.+)$', ln)
        ms = re.match(r'^([A-G]\d)\. (.+)$', ln)
        if mg:
            started = True
            g = {'code': mg.group(1), 'title': mg.group(2), 'intro': None, 'subs': []}
            groups.append(g)
            s = None
            continue
        if not started:
            continue
        if ms:
            s = {'code': ms.group(1), 'title': ms.group(2), 'intro': None, 'qs': []}
            g['subs'].append(s)
            continue
        if g['intro'] is None and s is None and not g['subs']:
            g['intro'] = ln
            continue
        if s is None:  # nhóm không có tiểu mục (E, F)
            s = {'code': g['code'], 'title': g['title'], 'intro': None, 'qs': []}
            g['subs'].append(s)
        if not s['qs'] and s['intro'] is None and re.match(r'^(Mỗi đề|Chuẩn bị ít nhất)', ln):
            s['intro'] = ln
            continue
        n += 1
        text, hint = ln, ''
        if ' Ý cần có: ' in ln:
            text, hint = ln.split(' Ý cần có: ', 1)
        s['qs'].append({'n': n, 'text': text.strip(), 'hint': hint.strip(), 'sub': s['code']})
    return groups

# ---------------------------------------------------------------- mini markdown
def inline(t):
    t = html.escape(t, quote=False)
    codes = []
    def keep(m):
        codes.append('<code>' + m.group(1) + '</code>')
        return '\x00%d\x00' % (len(codes) - 1)
    t = re.sub(r'`([^`]+)`', keep, t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<i>\1</i>', t)
    t = re.sub(r'\[\[(.+?)\]\]', r'<mark>\1</mark>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', r'<a href="\2">\1</a>', t)
    t = re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], t)
    return t


def md(src):
    out, lines, i = [], src.strip('\n').split('\n'), 0
    while i < len(lines):
        ln = lines[i]
        if not ln.strip():
            i += 1; continue
        if ln.startswith('```'):
            j = i + 1; buf = []
            while j < len(lines) and not lines[j].startswith('```'):
                buf.append(lines[j]); j += 1
            out.append('<pre><code>' + html.escape('\n'.join(buf), quote=False) + '</code></pre>')
            i = j + 1; continue
        if ln.startswith('### '):
            out.append('<h4>' + inline(ln[4:]) + '</h4>'); i += 1; continue
        if ln.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.match(r'^:?-+:?$', c) for c in cells):
                    rows.append(cells)
                i += 1
            h = '<div class="tw"><table><thead><tr>' + ''.join('<th>' + inline(c) + '</th>' for c in rows[0]) + '</tr></thead><tbody>'
            for r in rows[1:]:
                h += '<tr>' + ''.join('<td>' + inline(c) + '</td>' for c in r) + '</tr>'
            out.append(h + '</tbody></table></div>'); continue
        m = re.match(r'^(\s*)(- |\d+\. )', ln)
        if m:
            tag = 'ol' if m.group(2)[0].isdigit() else 'ul'
            items = []
            while i < len(lines) and lines[i].strip():
                mm = re.match(r'^\s*(- |\d+\. )(.*)$', lines[i])
                if mm:
                    items.append(mm.group(2))
                elif items:
                    items[-1] += ' ' + lines[i].strip()
                i += 1
            out.append('<%s>' % tag + ''.join('<li>' + inline(x) + '</li>' for x in items) + '</%s>' % tag)
            continue
        buf = []
        while i < len(lines) and lines[i].strip() and not re.match(r'^(```|\||### |\s*- |\d+\. )', lines[i]):
            buf.append(lines[i].strip()); i += 1
        out.append('<p>' + inline(' '.join(buf)) + '</p>')
    return '\n'.join(out)

# ---------------------------------------------------------------- content files
def parse_content(path):
    page = {'qs': [], 'cheat': None, 'intro': None, 'subs': None}
    cur, field = None, None
    buf = []

    def flush():
        nonlocal buf
        txt = '\n'.join(buf).strip('\n')
        buf = []
        if field is None:
            return
        kind, target = field
        if kind == 'meta':
            page[target] = txt.strip()
        elif kind == 'intro':
            page['intro'] = txt
        elif kind == 'cheat':
            page['cheat'] = txt
        elif kind == 'ans':
            cur['ans'] = txt
        elif kind == 'fu':
            cur['fus'].append((target, txt))
        elif kind in ('trap', 'mini', 'honest'):
            cur[kind] = txt

    for raw in open(path, encoding='utf-8').read().split('\n'):
        m = re.match(r'^@(\w+)\s?(.*)$', raw)
        if m and m.group(1) in ('page', 'file', 'code', 'title', 'lede', 'desc', 'group', 'subs', 'after',
                                'intro', 'q', 'time', 'ans', 'fu', 'trap', 'mini', 'honest', 'cheat'):
            flush()
            k, v = m.group(1), m.group(2).strip()
            if k in ('page', 'file', 'code', 'title', 'lede', 'desc', 'group', 'subs', 'after'):
                page[k] = v; field = None
            elif k == 'intro':
                field = ('intro', None); buf = [v] if v else []
            elif k == 'q':
                cur = {'n': int(v), 'time': '', 'ans': '', 'fus': [], 'trap': '', 'mini': '', 'honest': ''}
                page['qs'].append(cur); field = None
            elif k == 'time':
                cur['time'] = v; field = None
            elif k == 'ans':
                field = ('ans', None); buf = [v] if v else []
            elif k == 'fu':
                field = ('fu', v)
            elif k in ('trap', 'mini', 'honest'):
                field = (k, None); buf = [v] if v else []
            elif k == 'cheat':
                field = ('cheat', None); page['cheat_title'] = v
            continue
        buf.append(raw)
    flush()
    return page

# ---------------------------------------------------------------- page shell
def shell(title, body, desc=''):
    return ('<!doctype html>\n<html lang="vi"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<title>%s</title>%s%s%s</head>\n<body class="g-page">\n%s\n</body></html>\n') % (
        html.escape(title), ('<meta name="description" content="%s">' % html.escape(desc)) if desc else '',
        FONTS, ASSETS, body)


def mast(eyebrow, title, lede, meta=()):
    m = ''.join('<span>%s</span>' % html.escape(x) for x in meta)
    return ('<header class="mast"><div class="wrap"><p class="eyebrow">%s</p><h1>%s</h1>%s%s</div></header><div class="tape"></div>'
            % (html.escape(eyebrow), html.escape(title), ('<p class="lede">%s</p>' % inline(lede)) if lede else '',
               ('<div class="mast-meta">%s</div>' % m) if m else ''))

# ---------------------------------------------------------------- render answer page
def render_page(pg, qmap, subinfo):
    qs = pg['qs']
    tabs = ''.join('<a href="#q%d">%d</a>' % (q['n'], q['n']) for q in qs)
    if pg.get('cheat'):
        tabs += '<a href="#cheat">Cheat sheet</a>'
    parts = []
    parts.append('<nav class="tabs" aria-label="Các câu trong trang"><div class="wrap">%s</div></nav>' % tabs)
    parts.append('<main class="g-main wrap">')
    parts.append('<div class="study-bar"><div class="prog"><div class="meter"><i></i></div><span></span></div>'
                 '<button class="btn sm" id="st-quiz" type="button">Tự kiểm tra (ẩn đáp án)</button>'
                 '<button class="btn sm" id="st-all" type="button">Mở hết follow-up</button>'
                 '<button class="btn sm" id="st-reset" type="button" title="Bỏ đánh dấu mọi câu trong trang">Đặt lại</button></div>')
    if pg.get('intro'):
        parts.append('<div class="intro-box">%s</div>' % md(pg['intro']))
    last_sub = None
    for q in qs:
        info = qmap[q['n']]
        if info['sub'] != last_sub and len({qmap[x['n']]['sub'] for x in qs}) > 1:
            si = subinfo[info['sub']]
            parts.append('<div class="sec-h"><h2>%s · %s</h2>%s</div>' % (si['code'], html.escape(si['title']),
                         ('<p>%s</p>' % inline(si['intro'])) if si.get('intro') else ''))
            last_sub = info['sub']
        h = ['<article class="qa" id="q%d" data-q="q%d">' % (q['n'], q['n'])]
        h.append('<div class="qa-h"><span class="qa-n">%d</span><h3>%s</h3>'
                 '<label class="qa-chk"><input type="checkbox"> Đã thuộc</label></div>' % (q['n'], inline(info['text'])))
        if info['hint']:
            h.append('<div class="hint"><b>Ý cần có:</b> %s</div>' % inline(info['hint']))
        h.append('<button class="btn sm reveal" type="button">Hiện đáp án</button>')
        if q['ans']:
            h.append('<div class="ans"><p class="lbl">Trả lời mẫu%s</p>%s</div>' % (
                ('<span class="t">' + html.escape(q['time']) + '</span>') if q['time'] else '', md(q['ans'])))
        if q['honest']:
            h.append('<div class="honest">%s</div>' % inline(q['honest'].replace('\n', ' ')))
        if q['fus']:
            h.append('<div class="fus"><p class="lbl">Nếu bị hỏi tiếp</p>' + ''.join(
                '<details class="fu"><summary>%s</summary><div class="a">%s</div></details>' % (inline(fq), md(fa))
                for fq, fa in q['fus']) + '</div>')
        if q['mini']:
            h.append('<div class="mini">%s</div>' % inline(q['mini'].replace('\n', ' ')))
        if q['trap']:
            h.append('<div class="trap">%s</div>' % inline(q['trap'].replace('\n', ' ')))
        h.append('</article>')
        parts.append('\n'.join(h))
    if pg.get('cheat'):
        parts.append(cheat_block(pg))
    parts.append('</main>')
    meta = ['%d câu' % len(qs), 'Mỗi câu 60–120 giây']
    body = mast(GROUPS.get(pg['group'], ''), pg['code'] + ' · ' + pg['title'], pg.get('lede', ''), meta) + '\n'.join(parts)
    return shell(pg['code'] + ' · ' + pg['title'], body, pg.get('desc', ''))


def cheat_block(pg, anchor=True):
    t = pg.get('cheat_title') or ('Cheat sheet ' + pg['code'])
    boxes = re.split(r'\n(?=### )', '\n' + pg['cheat'].strip('\n'))
    inner = ''
    for b in boxes:
        b = b.strip('\n')
        if not b:
            continue
        full = b.startswith('### !')
        if full:
            b = '### ' + b[5:].lstrip()
        inner += '<div%s>%s</div>' % (' class="full"' if full else '', md(b))
    return ('<section class="cheat"%s><div class="cheat-h"><h2>%s</h2><span>%s</span></div><div class="cheat-b">%s</div></section>'
            % (' id="cheat"' if anchor else ' id="cheat-%s"' % pg['page'], html.escape(t), html.escape(pg['code']), inner))

# ---------------------------------------------------------------- old pages
OLD = [
    # file, code, title, group, desc, {old_anchor: question number}
    ('tra-loi-phong-van-wms.html', 'A2', 'WMS · 8 câu trả lời chính', 'A', 'Giới thiệu WMS, concurrency, cơ chế sửa, tối ưu query, batch chạy lại, coverage, lỗi production.',
     {'q1': 4, 'q2': 9, 'q3': 10, 'q4': 6, 'q5': 11, 'q7': 12, 'q8': 13}),
    ('cheat-sheet-phong-van.html', 'A2·CS', 'WMS · Cheat sheet', 'A', 'Một trang ý chính cho 8 câu WMS và 3 case.', {}),
    ('so-tay-nhap-kho-xuat-b2b.html', 'A2·NV', 'Sổ tay nghiệp vụ kho', 'A', 'Nhập kho, xuất B2B, tồn kho, khóa, batch và API, có hoạt họa.', {}),
    ('api-batch-hoat-hoa.html', 'A2·HH', 'API đổ khay & batch nhặt', 'A', 'Hoạt họa hai con của bạn và các tình huống chạy đồng thời.', {}),
    ('case-mau-index-join.html', 'A2·C1', 'Case SQL: index & JOIN', 'A', 'Quét thùng thiếu index; tạo lượt nhặt chậm vì JOIN nhiều bảng lớn.', {}),
    ('case-hieu-nang-phan-bo.html', 'A2·C2', 'Case job phân bổ chậm', 'A', 'Job phân bổ cuối ngày chậm dần và cách viết lại.', {}),
    ('case-kien-retired.html', 'A2·C3', 'Case kiện Retired', 'A', 'Race condition làm tồn kho âm và cách sửa.', {}),
    ('on-tap-phong-van.html', 'A3', 'Nền tảng AI nội bộ', 'A', '6 câu về nền tảng AI hỗ trợ phát triển, kèm cheat sheet.',
     {'c1': 16, 'c2': 17, 'c3': 18, 'c4': 19, 'c5': 20, 'c6': 21}),
    ('kestrel-interview.html', 'A5', 'Kestrel', 'A', 'Crawl, pgvector, lớp LLM, chống bịa CV, billing, chịu tải.',
     {'q%d' % i: i for i in range(26, 33)}),
    ('interview-qa.html', 'A6', 'Notification Hub', 'A', 'Kafka, idempotency, DLQ, Saga, rate limit, 50k/s, gRPC.',
     {'q%d' % i: i for i in range(33, 41)}),
    ('Interview_Prompts.html', 'AI', 'Prompt luyện với AI', 'tool', '28 prompt để AI đóng vai người phỏng vấn, có chấm điểm.', {}),
]


def patch_old(fname):
    src = open(os.path.join(ORIG, fname), encoding='utf-8').read()
    css_path = os.path.join(HERE, 'restyle', fname.replace('.html', '.css'))
    if os.path.exists(css_path):
        new_css = open(css_path, encoding='utf-8').read()
        blocks = list(re.finditer(r'<style[^>]*>.*?</style>', src, flags=re.S))
        # bỏ mọi <style> cũ, đặt CSS mới vào vị trí block đầu tiên
        first = True
        def repl(m):
            nonlocal first
            if first:
                first = False
                return '<style>\n' + new_css + '\n</style>'
            return ''
        src = re.sub(r'<style[^>]*>.*?</style>', repl, src, flags=re.S)
        # font: bỏ link Google Fonts cũ, dùng bộ chung
        src = re.sub(r'<link[^>]+fonts\.(googleapis|gstatic)\.com[^>]*>', '', src)
        inject = FONTS + ASSETS
    else:
        inject = ASSETS
    if '</head>' in src and src.index('</head>') < src.index('<body'):
        src = src.replace('</head>', inject + '</head>', 1)
    else:
        src = re.sub(r'(<body[^>]*>)', r'\1' + inject, src, count=1)
    open(os.path.join(OUT, fname), 'w', encoding='utf-8').write(src)

# ---------------------------------------------------------------- main
def main():
    groups = parse_bank(read_docx())
    qmap, subinfo, allq = {}, {}, []
    for g in groups:
        for s in g['subs']:
            subinfo[s['code']] = s
            for q in s['qs']:
                qmap[q['n']] = q
                allq.append(q)
    print('docx: %d câu, %d tiểu mục' % (len(allq), len(subinfo)))

    pages = []
    for fn in sorted(os.listdir(os.path.join(HERE, 'content'))):
        if fn.endswith('.txt'):
            pages.append(parse_content(os.path.join(HERE, 'content', fn)))
    pages.sort(key=lambda p: p.get('order', p['page']))

    # vị trí trả lời của mỗi câu (để làm link)
    where = {}
    for fname, code, title, grp, desc, amap in OLD:
        for a, n in amap.items():
            where[n] = '%s#%s' % (fname, a)
    for p in pages:
        for q in p['qs']:
            if q['n'] not in qmap:
                raise SystemExit('%s: câu %d không có trong docx' % (p['page'], q['n']))
            where[q['n']] = '%s#q%d' % (p['file'], q['n'])

    # thứ tự trang trong bộ
    order = [('index.html', 'MỤC LỤC', 'Mục lục & tiến độ', 'start', 'Trang chủ', []),
             ('ngan-hang-cau-hoi.html', '192', 'Ngân hàng câu hỏi', 'start', 'Toàn bộ câu hỏi, bấm để tới câu trả lời.', [])]
    newp = {p['page']: p for p in pages}
    old = {o[0]: o for o in OLD}

    def add_new(key):
        p = newp[key]
        order.append((p['file'], p['code'], p['title'], p['group'], p.get('desc', ''), ['q%d' % q['n'] for q in p['qs']]))

    def add_old(fn):
        o = old[fn]
        order.append((o[0], o[1], o[2], o[3], o[4], []))

    seq = ['@a1', 'tra-loi-phong-van-wms.html', '@a2', 'cheat-sheet-phong-van.html', 'so-tay-nhap-kho-xuat-b2b.html',
           'api-batch-hoat-hoa.html', 'case-mau-index-join.html', 'case-hieu-nang-phan-bo.html', 'case-kien-retired.html',
           'on-tap-phong-van.html', '@a4', 'kestrel-interview.html', 'interview-qa.html', '@a7',
           '@b1', '@b2', '@b3', '@b4', '@b5', '@b6', '@b7', '@c1', '@c2', '@c3', '@c4', '@d1', '@d2', '@e', '@f', '@g']
    for k in seq:
        if k.startswith('@'):
            if k[1:] in newp:
                add_new(k[1:])
        else:
            add_old(k)
    for k in newp:
        if '@' + k not in seq:
            add_new(k)
    order.append(('tong-hop-cheat-sheet.html', 'CHEAT', 'Tổng hợp cheat sheet', 'tool', 'Mọi cheat sheet của phần mới trên một trang để đọc lướt.', []))
    add_old('Interview_Prompts.html')

    manifest = [{'file': f, 'code': c, 'title': t, 'group': g, 'desc': d, 'qids': q} for f, c, t, g, d, q in order]
    qjs = [{'code': 'Câu %d' % q['n'], 'text': q['text'], 'hint': q['hint'], 'href': where.get(q['n'], 'ngan-hang-cau-hoi.html#n%d' % q['n'])}
           for q in allq]
    with open(os.path.join(OUT, 'assets', 'manifest.js'), 'w', encoding='utf-8') as f:
        f.write('/* Sinh tự động bởi _src/build.py */\n')
        f.write('window.ONTAP_GROUPS=' + json.dumps(GROUPS, ensure_ascii=False) + ';\n')
        f.write('window.ONTAP_PAGES=' + json.dumps(manifest, ensure_ascii=False) + ';\n')
        f.write('window.ONTAP_Q=' + json.dumps(qjs, ensure_ascii=False) + ';\n')

    # trang mới
    for p in pages:
        open(os.path.join(OUT, p['file']), 'w', encoding='utf-8').write(render_page(p, qmap, subinfo))

    # trang cũ
    for o in OLD:
        patch_old(o[0])

    # ngân hàng câu hỏi
    body = [mast('Bắt đầu', 'Ngân hàng câu hỏi', 'Nguyên văn %d câu trong file “Ngân hàng câu hỏi ôn phỏng vấn Zalo (Backend, Media)”. Bấm **Trả lời →** để tới câu trả lời. Câu đã đánh dấu thuộc hiện số màu xanh.' % len(allq),
                 ['%d câu' % len(allq), '7 nhóm'])]
    body.append('<nav class="tabs"><div class="wrap">' + ''.join('<a href="#g%s">%s</a>' % (g['code'], g['code']) for g in groups) + '</div></nav>')
    body.append('<main class="g-main wrap">')
    for g in groups:
        body.append('<div class="grp" id="g%s"><div class="grp-h"><b>%s</b><h2>%s</h2></div>%s' % (
            g['code'], g['code'], html.escape(g['title']), ('<p class="intro-box">%s</p>' % inline(g['intro'])) if g['intro'] else ''))
        for s in g['subs']:
            items = ''
            for q in s['qs']:
                link = where.get(q['n'])
                items += '<li id="n%d" data-q="q%d"><code>%d</code><div>%s%s</div>%s</li>' % (
                    q['n'], q['n'], q['n'], inline(q['text']),
                    ('<small>Ý cần có: %s</small>' % inline(q['hint'])) if q['hint'] else '',
                    ('<a class="go" href="%s">Trả lời →</a>' % link) if link else '<span></span>')
            title = s['title'] if s['code'] != g['code'] else 'Câu hỏi'
            body.append('<section class="bank-sec"><h3>%s · %s</h3>%s<ol>%s</ol></section>' % (
                s['code'], html.escape(title), ('<p class="hint">%s</p>' % inline(s['intro'])) if s.get('intro') else '', items))
        body.append('</div>')
    body.append('</main>')
    open(os.path.join(OUT, 'ngan-hang-cau-hoi.html'), 'w', encoding='utf-8').write(
        shell('Ngân hàng câu hỏi', '\n'.join(body), 'Toàn bộ câu hỏi ôn phỏng vấn Zalo, có link tới câu trả lời.'))

    # tổng hợp cheat sheet
    body = [mast('Công cụ', 'Tổng hợp cheat sheet', 'Mọi cheat sheet của các phần A1–G trên một trang, để đọc lướt trước giờ phỏng vấn. Cheat sheet của WMS, nền tảng AI, Kestrel và Notification Hub nằm trong trang riêng của từng phần (link bên dưới).')]
    body.append('<nav class="tabs"><div class="wrap">' + ''.join('<a href="#cheat-%s">%s</a>' % (p['page'], p['code']) for p in pages if p.get('cheat')) + '</div></nav>')
    body.append('<main class="g-main wrap">')
    body.append('<div class="intro-box"><p><b>Cheat sheet trong trang cũ:</b> <a href="cheat-sheet-phong-van.html">WMS</a> · '
                '<a href="on-tap-phong-van.html">Nền tảng AI (tab Cheat sheet)</a> · <a href="kestrel-interview.html">Kestrel (tab Cheat sheet)</a> · '
                '<a href="interview-qa.html">Notification Hub (tab Cheat sheet)</a></p></div>')
    for p in pages:
        if p.get('cheat'):
            body.append(cheat_block(p, anchor=False).replace('<span>%s</span>' % html.escape(p['code']),
                        '<span><a href="%s#cheat" style="color:inherit">%s · mở trang →</a></span>' % (p['file'], html.escape(p['code'])), 1))
    body.append('</main>')
    open(os.path.join(OUT, 'tong-hop-cheat-sheet.html'), 'w', encoding='utf-8').write(
        shell('Tổng hợp cheat sheet', '\n'.join(body)))

    # index
    body = [mast('Zalo · Software Engineer, Media', 'Bộ ôn phỏng vấn',
                 'Một chỗ cho mọi trang ôn: câu trả lời mẫu, câu hỏi đào sâu, cheat sheet, hoạt họa nghiệp vụ kho và prompt luyện với AI. Đánh dấu **Đã thuộc** ở từng câu, tiến độ lưu trong trình duyệt này.',
                 ['%d câu hỏi' % len(allq), '%d trang' % len(manifest)])]
    body.append('<main class="g-main wrap">')
    body.append('<div class="study-bar" id="tot-prog" style="position:static"><div class="prog"><div class="meter" style="width:220px"><i></i></div><span></span></div>'
                '<a class="btn sm pri" href="ngan-hang-cau-hoi.html">Ngân hàng câu hỏi</a><a class="btn sm" href="tong-hop-cheat-sheet.html">Tổng hợp cheat sheet</a>'
                '<a class="btn sm" href="Interview_Prompts.html">Luyện với AI</a></div>')
    body.append('<div class="search"><p class="lbl">Tìm câu hỏi</p><input id="q-search" type="search" placeholder="Gõ từ khóa, ví dụ: idempotent, HashMap, replica lag, lương…" autocomplete="off"><div class="results" id="q-results"></div></div>')
    body.append('<div class="sec-h"><h2>Cách ôn</h2></div><div class="steps">'
                '<div><b>Đọc to, bấm giờ.</b> Mỗi câu 60–90 giây theo khung: kết luận, bối cảnh, việc của em, trade-off, kết quả.</div>'
                '<div><b>Tự kiểm tra.</b> Bật “Tự kiểm tra” để ẩn đáp án, tự nói trước rồi mới mở.</div>'
                '<div><b>Follow-up.</b> Mở từng câu hỏi đào sâu, tập trả lời 2–3 câu ngắn.</div>'
                '<div><b>Chỗ tô vàng.</b> Đó là chỗ cần thay bằng số liệu hoặc chuyện thật của bạn trước khi đi phỏng vấn.</div>'
                '<div><b>Trước giờ G.</b> Đọc lướt trang Tổng hợp cheat sheet và cheat sheet WMS.</div></div>')
    lastg = None
    for m in manifest:
        if m['file'] == 'index.html':
            continue
        if m['group'] != lastg:
            if lastg is not None:
                body.append('</div></section>')
            gq = sum(len(x['qids']) for x in manifest if x['group'] == m['group'])
            body.append('<section class="grp"><div class="grp-h"><b>%s</b><h2>%s</h2>%s</div><div class="cards">' % (
                m['group'] if len(m['group']) == 1 else '•', html.escape(GROUPS[m['group']].split(' · ')[-1]),
                ('<p>%d câu có đánh dấu tiến độ</p>' % gq) if gq else ''))
            lastg = m['group']
        kind = 'tool' if m['group'] in ('tool', 'start') else ('new' if m['qids'] else 'old')
        kind_lbl = {'tool': 'Công cụ', 'new': 'Trả lời mới', 'old': 'Trang có sẵn'}[kind]
        prog = ('<div class="meter"><i></i></div><p class="pnum"></p>') if m['qids'] else ''
        body.append('<a class="pcard" style="--c:%s" href="%s" data-prog="%s"><div class="k"><code>%s</code><span class="kind %s">%s</span></div><h3>%s</h3><p>%s</p>%s</a>' % (
            GROUP_COLOR.get(m['group'], 'var(--accent)'), m['file'], m['file'], html.escape(m['code']), kind, kind_lbl,
            html.escape(m['title']), html.escape(m['desc']), prog))
    body.append('</div></section></main>')
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(
        shell('Bộ ôn phỏng vấn', '\n'.join(body), 'Mục lục bộ ôn phỏng vấn Backend Zalo Media.'))

    missing = [q['n'] for q in allq if q['n'] not in where]
    print('trang mới: %d, tổng trang: %d' % (len(pages), len(manifest)))
    print('câu chưa có trả lời:', missing or 'không')


if __name__ == '__main__':
    main()
