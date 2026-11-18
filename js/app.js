(() => {
  const $ = s => document.querySelector(s);
  const inp = $('#name'), sug = $('#sug'), res = $('#res'), toast = $('#toast');
  const st = { ar: '', cands: [], sel: 0, found: false, latin: false, custom: null, editing: false };
  let fonts = [], timer;

  const cap = s => s.replace(/(^|\s)[a-z]/g, m => m.toUpperCase());
  const curEn = () => (st.custom !== null ? st.custom : st.cands[st.sel]) || '';
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };

  function combos(lists) {
    const n = Math.max(...lists.map(l => l.length)), out = [];
    for (let k = 0; k < n; k++) {
      const s = lists.map(l => l[Math.min(k, l.length - 1)]).join(' ');
      if (!out.includes(s)) out.push(s);
    }
    return out;
  }

  function analyze(v) {
    st.custom = null; st.editing = false; st.sel = 0;
    const words = v.split(/\s+/);
    if (/[\u0600-\u06FF]/.test(v)) {
      st.latin = false; st.ar = v;
      let all = true;
      const lists = words.map(w => {
        const e = Dict.lookup(w);
        if (e) return Dict.options(e);
        all = false; return Translit.variants(w);
      });
      st.found = all; st.cands = combos(lists);
    } else {
      st.latin = true;
      const ar = Dict.ok ? Dict.reverse(v) : null;
      st.ar = ar || ''; st.found = !!ar;
      const c = [cap(v.toLowerCase())];
      if (ar && words.length === 1) { const e = Dict.lookup(ar); if (e) Dict.options(e).forEach(o => { if (!c.includes(o)) c.push(o); }); }
      st.cands = c;
    }
  }

  function renderSug() {
    sug.innerHTML = '';
    if (!st.cands.length) { sug.classList.add('hidden'); return; }
    sug.classList.remove('hidden');
    if (!Dict.ok) sug.append(el('p', 'msg warn', '⚠️ تعذر تحميل القاموس، نستخدم التحويل التلقائي فقط.'));
    const n = st.cands.length;
    if (st.latin) {
      sug.append(el('p', 'msg' + (st.found ? '' : ' warn'),
        st.found ? `الاسم بالعربية: ${st.ar}` : 'لم نجد المقابل العربي في القاموس، اكتب الاسم بالعربية لتظهر زخارف الاسمين.'));
    } else if (st.found) {
      sug.append(el('p', 'msg', n > 1 ? `وجدنا ${n} طرق لكتابة الاسم بالإنجليزية.` : 'وجدنا كتابة واحدة للاسم بالإنجليزية.'));
    } else {
      sug.append(el('p', 'msg warn', 'لم نجد الاسم في القاموس، لكن هذه أقرب طرق كتابته بالإنجليزية.'));
      sug.append(el('p', 'msg', 'الكتابة اقتراح تقريبي، ويمكنك تعديلها.'));
    }
    if (n > 1 || !st.found) sug.append(el('p', 'q', 'هل تقصد أي كتابة؟'));
    const chips = el('div', 'chips');
    st.cands.forEach((c, i) => {
      const b = el('button', 'chip' + (st.custom === null && i === st.sel ? ' on' : ''), c);
      b.onclick = () => { st.sel = i; st.custom = null; st.editing = false; renderSug(); renderRes(); };
      chips.append(b);
    });
    if (st.custom !== null) chips.append(el('button', 'chip on', st.custom));
    sug.append(chips);
    const eb = el('button', 'link', st.editing ? 'إغلاق التعديل' : '✎ تعديل الكتابة الإنجليزية');
    eb.onclick = () => { st.editing = !st.editing; renderSug(); };
    sug.append(eb);
    if (st.editing) {
      const i = el('input', 'edit'); i.value = curEn(); i.setAttribute('dir', 'ltr');
      i.oninput = () => { st.custom = i.value.trim() || null; renderRes(); };
      sug.append(i); setTimeout(() => i.focus(), 0);
    }
  }

  function cardEl(c) {
    const d = el('div', 'card deco');
    if (c.ar) { const a = el('div', 'l', c.ar); a.dir = 'rtl'; d.append(a); }
    const e = el('div', 'l', c.en); e.dir = 'ltr'; d.append(e);
    const b = el('button', 'btn', 'نسخ الاسمين ♡');
    b.onclick = () => copy([c.ar, c.en].filter(Boolean).join('\n'));
    d.append(b);
    return d;
  }

  function renderRes() {
    res.innerHTML = '';
    const en = curEn();
    if (!en) return;
    const { base, extra } = Deco.build(st.ar, en);
    base.forEach(c => res.append(cardEl(c)));
    res.append(el('h2', '', 'زخارف إضافية ✨'));
    extra.forEach(c => res.append(cardEl(c)));
    if (fonts.length) {
      res.append(el('h2', '', 'معاينة بالخطوط المخصصة'));
      res.append(el('p', 'note', 'المعاينة فقط؛ الخط لا ينتقل عند النسخ إلى واتساب.'));
      fonts.forEach(f => {
        const d = el('div', 'card deco');
        if (st.ar && f.type !== 'en') { const a = el('div', 'l', st.ar); a.style.fontFamily = `'${f.name}',Cairo`; a.dir = 'rtl'; d.append(a); }
        if (f.type !== 'ar') { const e = el('div', 'l', en); e.style.fontFamily = `'${f.name}',Cairo`; e.dir = 'ltr'; d.append(e); }
        res.append(d);
      });
    }
  }

  function copy(text) {
    const done = () => { toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1500); };
    const fallback = () => {
      const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select();
      try { document.execCommand('copy'); done(); } catch (e) {} t.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }

  function onInput() {
    const v = inp.value.trim();
    if (!v) { st.cands = []; st.ar = ''; renderSug(); renderRes(); return; }
    analyze(v); renderSug(); renderRes();
  }

  inp.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(onInput, 120); });
  Dict.load().then(() => { if (inp.value.trim()) onInput(); });
  Deco.loadFonts().then(f => { fonts = f; renderRes(); });
})();
