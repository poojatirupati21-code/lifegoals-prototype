// Usage: node tools/report/render-pages.js <data.json> <outDir>
// Renders every report page of the standalone renderer to <outDir>/p-NN.png (794x1123) and prints overflow checks.
const path = require('path'), fs = require('fs');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const R = require('./report-renderer.js');
(async () => {
  const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), out = process.argv[3];
  fs.mkdirSync(out, { recursive: true });
  const root = path.resolve(__dirname, '../..');
  const fd = process.env.LMR_FONT_DIR;  // optional: dir with bric.woff2 + fig.woff2 (variable fonts) for offline runs
  const fontCss = fd ? '<style>@font-face{font-family:"Bricolage Grotesque";font-weight:200 800;src:url(file://' + fd + '/bric.woff2)}@font-face{font-family:"Figtree";font-weight:300 900;src:url(file://' + fd + '/fig.woff2)}</style>' : '';
  const html = R.reportDocument(data, { photoSrc: n => 'file://' + root + '/media/' + n + '.jpg' }).replace(/<link[^>]*fonts[^>]*>/g, fontCss);
  const f = path.join(out, 'report.html'); fs.writeFileSync(f, html);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 900, height: 1200 } });
  const errs = []; pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  const els = await pg.$$('.lmr-pg');
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(out, 'p-' + String(i + 1).padStart(2, '0') + '.png') });
  const issues = await pg.evaluate(() => {
    const res = [];
    document.querySelectorAll('.lmr-pg').forEach((p, i) => {
      const pr = p.getBoundingClientRect(), footEl = p.querySelector('.lmr-rf'), foot = footEl ? footEl.getBoundingClientRect() : { top: 99999 };
      p.querySelectorAll('*').forEach(e => {
        if (e.closest('svg') && e.tagName !== 'svg') return;
        const r = e.getBoundingClientRect(); if (!r.width && !r.height) return;
        if (e.closest('.lmr-rh') || e.closest('.lmr-rf') || e.closest('.lmr-cv-dark')) return;
        if (r.right > pr.right + 0.5 || r.left < pr.left - 0.5 || r.bottom > pr.bottom + 0.5) res.push('p' + (i + 1) + ' outside page: ' + e.className + ' ' + (e.textContent || '').slice(0, 30));
        else if (r.bottom > foot.top + 0.5 && !e.closest('.lmr-n9') && e.tagName !== 'SECTION' && !e.classList.contains('lmr-body') && !e.classList.contains('lmr-cv-photo')) res.push('p' + (i + 1) + ' over footer: ' + e.className + ' ' + (e.textContent || '').slice(0, 30));
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible' && !e.closest('svg') && e.tagName !== 'IMG') res.push('p' + (i + 1) + ' clipped x: ' + e.className);
        if (e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflow !== 'visible' && !e.classList.contains('lmr-pg') && !e.closest('svg') && !/clamp/.test(e.className) && e.tagName !== 'IMG') res.push('p' + (i + 1) + ' clipped y: ' + e.className);
      });
    });
    return res;
  });
  console.log('pages', els.length, 'console errors', errs.length, errs.slice(0, 3));
  console.log('issues', issues.length); issues.slice(0, 40).forEach(x => console.log(' ', x));
  await b.close();
})();
