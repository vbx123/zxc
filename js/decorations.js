/* الزخارف: خطوط Unicode + مد عربي + القوالب + الخطوط المخصصة */
const Deco = (() => {
  const mk = (U, L, ex = {}) => t => [...t].map(c => {
    if (ex[c]) return ex[c];
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(U + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(L + c.charCodeAt(0) - 97);
    return c;
  }).join('');
  const SC = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
  const F = {
    boldItalic: mk(0x1D468, 0x1D482),
    script: mk(0x1D4D0, 0x1D4EA),
    bold: mk(0x1D400, 0x1D41A),
    dbl: mk(0x1D538, 0x1D552, {C:'ℂ',H:'ℍ',N:'ℕ',P:'ℙ',Q:'ℚ',R:'ℝ',Z:'ℤ'}),
    fraktur: mk(0x1D56C, 0x1D586),
    mono: mk(0x1D670, 0x1D68A),
    sansBI: mk(0x1D63C, 0x1D656),
    circled: mk(0x24B6, 0x24D0),
    small: t => [...t.toLowerCase()].map(c => SC[c] || c).join('')
  };

  // مد عربي متوازن: التطويل فقط بعد الحروف المتصلة بما بعدها
  const NC = new Set('ادذرزوءأإآؤةى');
  const AR = /[\u0621-\u064A]/;
  function madd(text, level) {
    const ch = [...text], slots = [];
    for (let i = 0; i < ch.length - 1; i++)
      if (AR.test(ch[i]) && !NC.has(ch[i]) && AR.test(ch[i + 1])) slots.push(i);
    if (!slots.length || !level) return text;
    const mid = slots[Math.floor((slots.length - 1) / 2)];
    const pick = level === 1 ? [mid] : level === 2 ? [...new Set([slots[0], slots[slots.length - 1]])] : [mid, mid];
    pick.forEach(p => ch[p] += '\u0640');
    return ch.join('');
  }

  function build(ar, en) {
    const A = (l, f) => ar ? f(madd(ar, l)) : '';
    const card = (a, e) => ({ ar: a, en: e });
    const base = [
      card(A(1, a => `♡ ${a}`), `♡ ${F.boldItalic(en)}`),
      card(A(2, a => `${a} ᥫ᭡`), `${F.script(en)} ♡`),
      card(A(1, a => `${a} 🦋`), `${F.bold(en)} ♡`),
      card(A(2, a => `${a} 🤍`), `${F.dbl(en)} ♡`),
      card(ar ? `♡ ${ar}` : '', F.boldItalic(en)),
      card(A(1, a => `${a} 💗`), `${F.script(en)} 💗`)
    ];
    const extra = [
      card(A(1, a => `꒰ ${a} ꒱`), `꒰ ${F.fraktur(en)} ꒱`),
      card(A(2, a => `⋆｡˚ ${a} ˚｡⋆`), `✧ ${F.small(en)} ✧`),
      card(A(1, a => `༺ ${a} ༻`), `༺ ${F.sansBI(en)} ༻`),
      card(A(3, a => `〖 ${a} 〗`), `〖 ${F.mono(en)} 〗`),
      card(A(1, a => `˚ʚ ${a} ɞ˚`), `˚ʚ ${F.circled(en)} ɞ˚`),
      card(A(2, a => `✦ ${a} ✦`), `✦ ${F.bold(en)} ✦`),
      card(A(1, a => `❝ ${a} ❞`), `❝ ${F.script(en)} ❞`),
      card(A(3, a => `🤍 ${a} 🤍`), `${F.dbl(en)} ⸝⸝`)
    ];
    const seen = new Set();
    const uniq = list => list.filter(c => { const k = c.ar + '|' + c.en; if (seen.has(k)) return false; seen.add(k); return true; });
    return { base: uniq(base), extra: uniq(extra) };
  }

  /* ===== الخطوط المخصصة: ضع الملفات في fonts/ ثم أضفها هنا =====
     type: 'ar' للعربي، 'en' للإنجليزي، 'both' للاثنين
     مثال: { name: 'MyArabic', file: 'MyArabic.woff2', type: 'ar' } */
  const CUSTOM_FONTS = [];
  async function loadFonts() {
    const ok = [];
    for (const f of CUSTOM_FONTS) {
      try {
        const ff = new FontFace(f.name, `url(fonts/${encodeURI(f.file)})`);
        document.fonts.add(await ff.load());
        ok.push(f);
      } catch (e) { console.warn('Font failed:', f.file); }
    }
    return ok;
  }
  return { build, loadFonts };
})();
