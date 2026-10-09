// Shared page checks for the report renderer tests. Usage: const issues = await runChecks(page)
// Runs inside Chromium on a document that contains .lmr-pg sections.
async function runChecks(page, opts) {
  opts = opts || {};
  return page.evaluate((opts) => {
    const res = [];
    const lum = (r, g, b) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
    const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const bgOf = e => { if (e.closest('.lmr-cover') && !e.closest('.lmr-cv-tiles') && !e.closest('.lmr-cv-foot')) { const rr = e.getBoundingClientRect(); const pr0 = e.closest('.lmr-pg').getBoundingClientRect(); if (rr.top - pr0.top < 760 && !e.closest('.lmr-cv-badge')) return { r: 17, g: 45, b: 85, a: 1 }; } let n = e, acc = null; while (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (cs.backgroundImage !== 'none') return 'image'; const c = parse(cs.backgroundColor); if (c && c.a > 0) { if (c.a >= .99) return c; acc = acc || c; } n = n.parentElement; } return { r: 255, g: 255, b: 255, a: 1 }; };
    const pages = [...document.querySelectorAll('.lmr-pg')];
    pages.forEach((p, i) => {
      const n = i + 1, pr = p.getBoundingClientRect();
      if (Math.abs(pr.width - 794) > .5 || Math.abs(pr.height - 1123) > .5) res.push(['size', n, pr.width + 'x' + pr.height]);
      const txt = p.innerText || '';
      if (/undefined|NaN|\[object|\bnull\b/.test(txt)) res.push(['badtext', n, (txt.match(/.{0,20}(undefined|NaN|\[object|\bnull\b).{0,20}/) || [''])[0]]);
      const footEl = p.querySelector('.lmr-rf'), foot = footEl ? footEl.getBoundingClientRect() : { top: 99999 };
      p.querySelectorAll('*').forEach(e => {
        if (e.closest('svg') && e.tagName !== 'svg') return;
        if (e.closest('.lmr-rh') || e.closest('.lmr-rf') || e.closest('.lmr-cv-dark')) return;
        const r = e.getBoundingClientRect(); if (!r.width && !r.height) return;
        const cls = (e.className && e.className.baseVal !== undefined) ? e.className.baseVal : e.className;
        if (r.right > pr.right + .5 || r.left < pr.left - .5 || r.bottom > pr.bottom + .5) res.push(['outside', n, cls + ' ' + (e.textContent || '').slice(0, 25)]);
        else if (r.bottom > foot.top + .5 && !e.closest('.lmr-n9') && e.tagName !== 'SECTION' && !/lmr-body|lmr-cv-photo/.test(cls)) res.push(['footer', n, cls + ' ' + (e.textContent || '').slice(0, 25)]);
        const cs = getComputedStyle(e);
        if (e.tagName !== 'IMG' && e.tagName !== 'svg' && cs.overflow !== 'visible' && !/clamp|lmr-pg|lmr-roadcard|lmr-cv-photo|lmr-n9|lmr-plant|lmr-lv|ph/.test(cls)) {
          if (e.scrollWidth > e.clientWidth + 1) res.push(['clipx', n, cls]);
          if (e.scrollHeight > e.clientHeight + 1) res.push(['clipy', n, cls]);
        }
        if (/lmr-clamp/.test(cls) && e.scrollHeight > e.clientHeight + 2) res.push(['clamped', n, (e.textContent || '').slice(0, 25)]);
        // text overflow of boxes with text that is wider than the parent
        if (!e.children.length && (e.textContent || '').trim()) {
          if (e.scrollWidth > e.clientWidth + 2 && cs.display !== 'inline' && cs.overflow === 'visible' && e.clientWidth > 0) res.push(['textwide', n, cls + ' ' + (e.textContent || '').slice(0, 25)]);
          // contrast
          const bg = bgOf(e), fg = parse(cs.color);
          if (bg !== 'image' && fg && opts.contrast !== false) {
            const L1 = lum(fg.r, fg.g, fg.b), L2 = lum(bg.r, bg.g, bg.b), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
            const fs = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700, large = fs >= 24 || (fs >= 18.66 && bold);
            if (cr < (large ? 3 : 4.5)) res.push(['contrast', n, cr.toFixed(2) + ' ' + cls + ' ' + (e.textContent || '').slice(0, 20)]);
          }
        }
      });
      p.querySelectorAll('img').forEach(im => { if (!im.complete || !im.naturalWidth) res.push(['img', n, im.getAttribute('src')]); if (!im.alt) res.push(['imgalt', n, im.getAttribute('src')]); });
      // empty chips
      p.querySelectorAll('.lmr-chip,.lmr-tchips span,.lmr-gchip,.lmr-miss').forEach(c => { if (!(c.textContent || '').trim()) res.push(['emptychip', n, c.className]); });
    });
    return { issues: res, pages: pages.length };
  }, opts);
}
module.exports = { runChecks };
