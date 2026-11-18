/* القاموس: تحميل names.json والبحث العربي/الإنجليزي */
const Dict = {
  data: {}, rev: {}, ok: false,
  norm(s) {
    return s.replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا')
            .replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
  },
  async load() {
    try {
      const r = await fetch('data/names.json');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      for (const k in j) {
        this.data[this.norm(k)] = j[k];
        [j[k].default, ...(j[k].alternatives || [])].forEach(e => {
          const l = e.toLowerCase();
          (this.rev[l] = this.rev[l] || []).push(k);
        });
      }
      this.ok = true;
    } catch (e) { console.error('Dictionary load failed:', e); this.ok = false; }
    return this.ok;
  },
  lookup(ar) { return this.data[this.norm(ar)] || null; },
  options(e) { return [...new Set([e.default, ...(e.alternatives || [])])]; },
  reverse(en) {
    const parts = en.trim().toLowerCase().split(/\s+/);
    const out = parts.map(p => (this.rev[p] || [])[0]);
    return out.every(Boolean) ? out.join(' ') : null;
  }
};
