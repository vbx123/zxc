/* التحويل الصوتي الافتراضي: عربي -> إنجليزي */
const Translit = (() => {
  const C = {ب:'b',ت:'t',ث:'th',ج:'j',ح:'h',خ:'kh',د:'d',ذ:'dh',ر:'r',ز:'z',س:'s',ش:'sh',ص:'s',ض:'d',ط:'t',ظ:'z',غ:'gh',ف:'f',ق:'q',ك:'k',ل:'l',م:'m',ن:'n',ه:'h',پ:'p',گ:'g',چ:'ch',ڤ:'v'};
  const DI = {'\u064E':'a','\u064F':'u','\u0650':'i'};
  const OPTS = [{u:'ou',i:'i',t:'a'},{u:'oo',i:'ee',t:'ah'},{u:'u',i:'i',t:'ah'},{u:'ou',i:'ee',t:'a'}];

  function word(w, o) {
    const hasD = /[\u064E\u064F\u0650]/.test(w);
    const ch = [...w.replace(/[\u0640\u0670]/g, '')];
    const t = [];
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i], n = ch[i + 1];
      if (DI[c]) { t.push({v: 1, s: DI[c]}); continue; }
      if (c === '\u0651') { const l = [...t].reverse().find(x => !x.v); if (l) l.s = l.s[0] + l.s; continue; }
      if (c === '\u0652') continue;
      if ('اأإآع'.includes(c) && DI[n]) continue;
      if (c === 'ا' || c === 'أ' || c === 'ى' || c === 'ع' || c === 'آ') { t.push({v: 1, s: 'a'}); continue; }
      if (c === 'إ') { t.push({v: 1, s: 'i'}); continue; }
      if (c === 'ء') continue;
      if (c === 'ئ') { t.push({v: 1, s: 'i'}); continue; }
      if (c === 'ؤ') { t.push({v: 1, s: 'o'}); continue; }
      if (c === 'ة') { t.push({v: 1, s: o.t}); continue; }
      if (c === 'و') {
        if (i === 0 || (n && 'اي'.includes(n))) t.push({s: 'w'}); else t.push({v: 1, s: o.u});
        continue;
      }
      if (c === 'ي') {
        if (i === 0 || (n && 'او'.includes(n))) t.push({s: 'y'}); else t.push({v: 1, s: o.i});
        continue;
      }
      if (C[c]) t.push({s: C[c]});
    }
    const m = [];
    t.forEach(x => { const l = m[m.length - 1]; if (l && l.v && x.v && !hasD && l.s === x.s) return; m.push(x); });
    let out = '';
    m.forEach((x, i) => { out += x.s; if (!hasD && !x.v && m[i + 1] && !m[i + 1].v) out += 'a'; });
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  function variants(name) {
    const words = name.trim().split(/\s+/), res = [];
    OPTS.forEach(o => { const s = words.map(w => word(w, o)).join(' '); if (s && !res.includes(s)) res.push(s); });
    return res;
  }
  return { word, variants };
})();
