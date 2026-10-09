/*
 * LifeMap plan report renderer (journey-spec section 28, docs/report-spec.md).
 *
 *   LifeMapReport.reportPages(data, opts) -> { css, pages: [html, ...], count }
 *   LifeMapReport.reportDocument(data, opts) -> full standalone HTML string
 *
 * Pure: no engine access, no DOM, no network. `data` follows docs/report-data.schema.json.
 * The renderer never calculates money or sentences. It only turns raw numbers into geometry and
 * formats a few raw numbers (chart axes, appendix rows).
 * opts.photoSrc(name) -> URL or data URI for media/<name>.jpg   (default 'media/<name>.jpg')
 * Each page is a 794 x 1123 px (A4 at 96 dpi) <section class="lmr-pg">.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LifeMapReport = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = '1.0.0';
  var W = 794, H = 1123;
  var COL = {
    navy: '#0b2545', navy2: '#13315c', teal: '#0a7068', tealMid: '#0f9d8f', mint: '#6be3d3',
    gold: '#f2b134', goldText: '#7a5200', coral: '#e8674a', coralText: '#b23a1f', blue: '#4a90d9',
    blueText: '#1f5f9f', muted: '#51627a', line: '#dfe5ea', bg: '#f3f7f9', tealTint: '#d9f2ee',
    tealTint2: '#e4f4f2', goldTint: '#fdf0d2', coralTint: '#fbe4dd', blueTint: '#e3eefa', grey: '#8a97a6'
  };

  // ---------- helpers ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function has(s) { return s !== undefined && s !== null && String(s).trim() !== ''; }
  function commas(n) { return String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function eur(n) { return (n < 0 ? '-' : '') + '€' + commas(n); }
  function numOrDash(n) { return (!n || Math.round(n) === 0) ? '—' : commas(n); }
  function tone(t) { return t === 'alert' ? 'coral' : (t || 'navy'); }
  function bandTone(b) { return b === 'alert' ? 'coral' : b; }
  function pctTone(p) { return p >= 95 ? 'good' : (p >= 70 ? 'gold' : 'coral'); }
  function fillOf(t) {
    t = tone(t);
    return { good: COL.tealMid, teal: COL.teal, gold: COL.gold, coral: COL.coral, blue: COL.blue, navy: COL.navy, grey: COL.grey }[t] || COL.navy;
  }
  function textOf(t) {
    t = tone(t);
    return { good: COL.teal, teal: COL.teal, gold: COL.goldText, coral: COL.coralText, blue: COL.blueText, navy: COL.navy, grey: COL.muted }[t] || COL.navy;
  }
  function tintOf(t) {
    t = tone(t);
    return { good: COL.tealTint, teal: COL.tealTint, gold: COL.goldTint, coral: COL.coralTint, blue: COL.blueTint, navy: COL.bg, grey: COL.bg }[t] || COL.bg;
  }
  function arr(a) { return Array.isArray(a) ? a : []; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : (d || 0); }

  // ---------- icons (24 x 24, stroke based) ----------
  function ico(name, size, color, sw) {
    size = size || 22; color = color || 'currentColor'; sw = sw || 1.8;
    var p;
    switch (name) {
      case 'sun':
        p = '<circle cx="12" cy="12" r="3.6"/><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7"/>'; break;
      case 'partly':
        p = '<circle cx="8" cy="8" r="2.6"/><path d="M8 2.4v1.2M2.4 8h1.2M3.9 3.9l.9.9M12.1 3.9l-.9.9"/><path d="M8.5 20.5h8.8a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3 3 3 0 0 0 .2 5.7z"/>'; break;
      case 'storm':
        p = '<path d="M7.5 15.5a4 4 0 0 1-.3-7.9 5.2 5.2 0 0 1 9.9 1 3.5 3.5 0 0 1 .4 6.9"/><path d="M12.6 12.2 10.4 16h3.2l-2 4"/>'; break;
      case 'sunrise': case 'retire':
        p = '<path d="M5.5 17a6.5 6.5 0 0 1 13 0"/><path d="M3 17h18M12 5v2.4M4.6 9.6l1.7 1.5M19.4 9.6l-1.7 1.5M7 21h10"/>'; break;
      case 'family':
        p = '<circle cx="8" cy="7.5" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.8 20c.2-3.6 2.4-5.8 5.2-5.8s5 2.2 5.2 5.8M14.6 14.7c.8-.4 1.5-.5 2.4-.5 2.3 0 3.9 1.9 4.1 5"/>'; break;
      case 'compass':
        p = '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2 5.6-5.6 2 2-5.6z"/>'; break;
      case 'home': case 'house':
        p = '<path d="M3.5 11 12 4l8.5 7M5.5 9.8V20h13V9.8M10 20v-5.5h4V20"/>'; break;
      case 'car':
        p = '<path d="M4 16.5V12l1.8-4.5a1.5 1.5 0 0 1 1.4-1h9.6a1.5 1.5 0 0 1 1.4 1L20 12v4.5M4 12h16M4 16.5h16"/><circle cx="7.8" cy="16.6" r="1.6"/><circle cx="16.2" cy="16.6" r="1.6"/>'; break;
      case 'plane': case 'holiday':
        p = '<path d="M3 13.5 21 5l-4.5 15-4.2-5.2L9 18.5l.2-4.4z"/>'; break;
      case 'book': case 'education':
        p = '<path d="M3 6.5C5.5 5.2 8.3 5.2 12 7c3.7-1.8 6.5-1.8 9-.5V19c-2.5-1.3-5.3-1.3-9 .5-3.7-1.8-6.5-1.8-9-.5zM12 7v12.5"/>'; break;
      case 'shield':
        p = '<path d="M12 3 4.5 6v5.5c0 4.6 3 7.8 7.5 9.5 4.5-1.7 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>'; break;
      case 'heart':
        p = '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>'; break;
      case 'check':
        p = '<path d="m5 12.5 4.3 4.3L19 7.2"/>'; break;
      case 'target':
        p = '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.2"/>'; break;
      default:
        p = '<path d="M12 3.5 14.6 9l5.9.7-4.4 4 1.2 5.8L12 16.7 6.7 19.5l1.2-5.8-4.4-4L9.4 9z"/>';
    }
    return '<svg class="lmr-ico" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color +
      '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + p + '</svg>';
  }
  function goalIcon(g) {
    var k = String(g.icon || g.kind || g.name || '').toLowerCase();
    var map = ['family', 'retire', 'home', 'house', 'car', 'plane', 'holiday', 'book', 'education', 'shield', 'heart', 'target', 'sun', 'partly', 'storm', 'compass', 'sunrise'];
    for (var i = 0; i < map.length; i++) if (k === map[i]) return map[i];
    if (/famil|baby|child/.test(k)) return 'family';
    if (/retire|pension/.test(k)) return 'retire';
    if (/home|house|mortgage|deposit/.test(k)) return 'home';
    if (/car|vehicle/.test(k)) return 'car';
    if (/holiday|travel|trip/.test(k)) return 'plane';
    if (/educat|school|college|study/.test(k)) return 'book';
    if (/emergen|protect|safe/.test(k)) return 'shield';
    if (/wedding|love|marr/.test(k)) return 'heart';
    return 'target';
  }
  function circleIcon(name, tn, size, inner) {
    size = size || 44;
    return '<span class="lmr-circ" style="width:' + size + 'px;height:' + size + 'px;background:' + tintOf(tn) + ';color:' + textOf(tn) + '">' +
      ico(name, inner || Math.round(size * 0.5), 'currentColor') + '</span>';
  }
  function logo(dark) {
    return '<span class="lmr-logo"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="' + COL.teal +
      '"/><path d="M8.2 16.4 14.6 7.8" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="14.9" cy="7.5" r="1.4" fill="#fff"/></svg><b>LifeMap</b></span>';
  }

  // ---------- CSS ----------
  var CSS = [
    '.lmr-pg{box-sizing:border-box;position:relative;width:794px;height:1123px;overflow:hidden;background:#fff;color:' + COL.navy + ';font-family:"Figtree","Helvetica Neue",Arial,sans-serif;font-size:14px;line-height:1.4;padding:0 56px;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}',
    '.lmr-pg *{box-sizing:border-box}',
    '.lmr-pg h1,.lmr-pg h2,.lmr-pg h3,.lmr-pg p{margin:0}',
    '.lmr-h,.lmr-big,.lmr-pg .lmr-hd{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;letter-spacing:-.01em}',
    '.lmr-rh{position:absolute;left:56px;right:56px;top:32px;height:24px;display:flex;justify-content:space-between;align-items:center;z-index:3}',
    '.lmr-logo{display:inline-flex;align-items:center;gap:8px;font-size:16px;font-weight:700}',
    '.lmr-logo b{font-weight:700}',
    '.lmr-rr{font-size:12px;color:' + COL.muted + '}',
    '.lmr-rf{position:absolute;left:56px;right:56px;bottom:0;height:55px;padding-top:11px;border-top:1px solid ' + COL.line + ';display:flex;justify-content:space-between;align-items:flex-start;font-size:11.5px;color:' + COL.muted + ';background:#fff}',
    '.lmr-body{flex:1;display:flex;flex-direction:column;min-height:0;padding-top:73px;padding-bottom:67px}',
    '.lmr-tb{display:flex;align-items:center;gap:26px;padding-bottom:15px;border-bottom:1px solid ' + COL.navy + ';flex:none}',
    '.lmr-bn{flex:none;max-width:330px}',
    '.lmr-bnum{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:64px;line-height:.98;letter-spacing:-.02em;white-space:nowrap;font-feature-settings:"tnum";font-variation-settings:"opsz" 96}',
    '.lmr-bl{font-size:12.5px;font-weight:700;color:' + COL.muted + ';margin-top:1px;line-height:1.2}',
    '.lmr-tx{min-width:0;flex:1}',
    '.lmr-ey{font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:' + COL.teal + ';margin-bottom:5px}',
    '.lmr-title{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:27.5px;line-height:1.12;letter-spacing:-.01em}',
    '.lmr-lead{font-size:14.5px;line-height:1.45;margin-top:12px;color:' + COL.navy + '}',
    '.lmr-chip{display:inline-flex;align-items:center;gap:6px;border-radius:99px;font-weight:800;font-size:12px;padding:4px 10px;white-space:nowrap}',
    '.lmr-circ{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;flex:none}',
    '.lmr-ico{display:block;flex:none}',
    '.lmr-muted{color:' + COL.muted + '}',
    '.lmr-clamp2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.lmr-clamp3{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}',
    /* cover */
    '.lmr-cover{padding:0;background:#fff}',
    '.lmr-cv-dark{position:absolute;left:0;top:0;width:794px;height:766px;background:linear-gradient(180deg,#0e2a52,#112d55 60%,#0f2a50)}',
    '.lmr-cv-bar{position:absolute;left:0;top:0;width:794px;height:7px;display:flex;z-index:4}',
    '.lmr-cv-photo{position:absolute;right:0;top:0;width:333px;height:341px;border-bottom-left-radius:200px;overflow:hidden}',
    '.lmr-cv-photo img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.9) brightness(.82)}',
    '.lmr-cv-photo:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(11,37,69,.55),rgba(11,37,69,0) 55%)}',
    '.lmr-cv-badge{position:absolute;right:57px;top:50px;background:#0e2a4f;color:#fff;font-size:11px;font-weight:800;letter-spacing:.22em;padding:7px 14px;border-radius:10px;z-index:3}',
    '.lmr-cv-logo{position:absolute;left:56px;top:50px;color:#fff;z-index:3}',
    '.lmr-cv-ey{position:absolute;left:56px;top:136px;color:' + COL.mint + ';font-size:12px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;z-index:3}',
    '.lmr-cv-title{position:absolute;left:54px;top:166px;width:430px;color:#fff;font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:80px;line-height:.98;letter-spacing:-.025em;z-index:3;font-variation-settings:"opsz" 96}',
    '.lmr-cv-lead{position:absolute;left:56px;top:338px;width:440px;color:#e3eaf4;font-size:16.8px;line-height:1.42;z-index:3}',
    '.lmr-cv-road{position:absolute;left:0;top:380px;z-index:2}',
    '.lmr-cv-tiles{position:absolute;left:56px;right:56px;top:796px;display:flex;gap:20px}',
    '.lmr-cv-tile{flex:1;background:#f3f7f9;border-radius:22px;padding:16px 18px;display:flex;align-items:center;gap:12px;min-height:94px}',
    '.lmr-cv-tile .b{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:23px;line-height:1.1}',
    '.lmr-cv-tile .s{font-size:13px;color:' + COL.navy + ';line-height:1.3;margin-top:2px}',
    '.lmr-cv-foot{position:absolute;left:56px;right:56px;bottom:26px;font-size:11.5px;color:' + COL.muted + '}',
    /* p2 */
    '.lmr-goals{flex:1;display:flex;flex-direction:column;justify-content:space-around;min-height:0;padding:6px 0}',
    '.lmr-goal{display:flex;gap:20px;align-items:center;padding:14px 0}',
    '.lmr-goal+.lmr-goal{border-top:1px solid ' + COL.line + '}',
    '.lmr-goal .gc{flex:1;min-width:0}',
    '.lmr-goal .gn{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:20px;line-height:1.15}',
    '.lmr-goal .gm{font-size:12.5px;font-weight:700;margin-top:3px}',
    '.lmr-track{height:14px;background:#f3f6f8;border-radius:9px;overflow:hidden;margin:9px 0 8px}',
    '.lmr-fill{height:100%;border-radius:9px;min-width:12px}',
    '.lmr-goal .gs{font-size:13.5px;line-height:1.4}',
    '.lmr-goal .gp{width:126px;text-align:right;flex:none}',
    '.lmr-goal .gp .pc{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:46px;line-height:1;letter-spacing:-.02em}',
    '.lmr-goal .gp .lmr-chip{background:none;padding:6px 0 0;font-size:12px;justify-content:flex-end}',
    '.lmr-goal.cp{padding:7px 0;gap:14px}.lmr-goal.cp .gn{font-size:15px}.lmr-goal.cp .gm{font-size:11.5px;margin-top:1px}.lmr-goal.cp .lmr-track{margin:4px 0 0;height:9px}.lmr-goal.cp .gs{display:none}.lmr-goal.cp .gp{width:128px}.lmr-goal.cp .gp .pc{font-size:26px}.lmr-goal.cp .gp .lmr-chip{padding-top:2px;font-size:11px}.lmr-goal.cp .lmr-circ{width:34px!important;height:34px!important}',
    '.lmr-goals{overflow:hidden}.lmr-goal.cp .gp .lmr-chip{white-space:nowrap}.lmr-goal.cp{padding:5px 0}.lmr-goal.cp .lmr-track{height:8px;margin:3px 0 0}.lmr-goal.cp .gp .pc{font-size:24px}',
    '.lmr-more{font-size:13px;color:' + COL.muted + ';padding:6px 0 0;text-align:center}',
    '.lmr-gap{background:' + COL.navy2 + ';color:#fff;border-radius:20px;padding:22px 24px;display:flex;flex:none}',
    '.lmr-gap.pos{background:' + COL.teal + '}',
    '.lmr-gap .c{flex:1;padding:0 20px;border-left:1px solid rgba(255,255,255,.18)}',
    '.lmr-gap .c:first-child{padding-left:0;border-left:0}',
    '.lmr-gap .b{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:31px;line-height:1.1}',
    '.lmr-gap .s{font-size:13px;color:#cfdbec;margin-top:4px;line-height:1.35}',
    '.lmr-gap.pos .s{color:#e1f5f2}',
    '.lmr-close{margin-top:24px;flex:none}',
    '.lmr-h3{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:17px}',
    '.lmr-cols3{display:flex;gap:20px;margin-top:14px}',
    '.lmr-cols3>div{flex:1;border-top:6px solid;padding-top:12px;min-width:0}',
    '.lmr-cols3 .p{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:28px;line-height:1.1}',
    '.lmr-cols3 .t{font-weight:800;font-size:14.5px;margin-top:4px}',
    '.lmr-cols3 .x{font-size:13px;margin-top:3px;line-height:1.4}',
    '.lmr-banner{background:#eaf5f4;border-radius:22px;padding:22px 24px 22px 26px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:24px;flex:none}',
    '.lmr-banner .t{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:17px}',
    '.lmr-banner .x{font-size:13.5px;margin-top:3px}',
    '.lmr-btn{background:' + COL.teal + ';color:#fff;font-weight:800;font-size:14.5px;border-radius:99px;padding:14px 28px;white-space:nowrap;flex:none}',
    /* p3 */
    '.lmr-tiles{display:flex;gap:4px;margin-top:20px;height:112px;flex:none}',
    '.lmr-tile{border-radius:20px;padding:0 15px 15px;display:flex;flex-direction:column;justify-content:flex-end;min-width:0}',
    '.lmr-tile .l{font-size:12.5px;font-weight:800}',
    '.lmr-tile .v{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:24px;line-height:1.2;margin-top:6px}',
    '.lmr-tile.navy{background:' + COL.navy2 + ';color:#fff}.lmr-tile.teal{background:' + COL.teal + ';color:#fff}.lmr-tile.white{background:#fff;border:1px solid ' + COL.line + '}',
    '.lmr-sent{font-size:14.5px;line-height:1.5;margin-top:14px;flex:none}',
    '.lmr-ex{display:inline-block;background:' + COL.goldTint + ';border:1px solid #e9c46e;color:' + COL.goldText + ';font-size:11px;font-weight:800;border-radius:99px;padding:1px 9px;margin-left:4px;vertical-align:1px}',
    '.lmr-two{display:flex;gap:30px;margin-top:20px;flex:1;min-height:0}',
    '.lmr-two>.l{flex:0 0 340px;min-width:0}.lmr-two>.r{flex:1;min-width:0}',
    '.lmr-led-t{font-size:11px;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:' + COL.teal + ';border-bottom:1px solid ' + COL.navy + ';padding:8px 0 6px;margin-top:6px}',
    '.lmr-row{display:flex;justify-content:space-between;align-items:center;gap:10px;height:44px;border-bottom:1px solid ' + COL.line + ';font-size:14px}',
    '.lmr-row b{font-weight:800}',
    '.lmr-miss{border:1px dashed ' + COL.grey + ';color:' + COL.muted + ';font-size:11px;font-weight:800;border-radius:99px;padding:2px 10px;white-space:nowrap}',
    '.lmr-nw{display:flex;justify-content:space-between;align-items:center;border-top:1px solid ' + COL.navy + ';margin-top:8px;padding-top:12px;font-weight:800;font-size:14.5px}',
    '.lmr-plant{border-radius:22px;overflow:hidden;background:' + COL.navy2 + ';color:#fff}',
    '.lmr-plant img{display:block;width:100%;height:150px;object-fit:cover}',
    '.lmr-plant .in{padding:18px 20px 18px}',
    '.lmr-plant .e{font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.mint + ';text-transform:uppercase}',
    '.lmr-plant .n{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:46px;line-height:1.1;margin-top:6px}.lmr-plant .n small{font-family:"Figtree",sans-serif;font-weight:500;font-size:18px;color:#b9c7dc;margin-left:6px}',
    '.lmr-prog{height:13px;border-radius:9px;background:#2c4670;margin:8px 0 12px;overflow:hidden}.lmr-prog i{display:block;height:100%;background:' + COL.mint + ';border-radius:9px}',
    '.lmr-plant .sb{font-size:13.5px}',
    '.lmr-it{display:flex;justify-content:space-between;align-items:center;gap:12px;height:57px;border-bottom:1px solid ' + COL.line + '}',
    '.lmr-it .t{font-weight:800;font-size:14.5px}.lmr-it .s{font-size:12.5px;color:' + COL.muted + '}',
    /* p4 */
    '.lmr-roadcard{background:' + COL.bg + ';border-radius:22px;margin-top:24px;height:190px;position:relative;flex:none;overflow:hidden}',
    '.lmr-dec{flex:1;display:flex;flex-direction:column;margin-top:16px;min-height:0}',
    '.lmr-drow{flex:1 1 auto;display:flex;align-items:stretch;min-height:0}',
    '.lmr-drow .a{flex:0 0 146px;display:flex;align-items:center;gap:12px}',
    '.lmr-drow .a .d{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:26px;line-height:1}',
    '.lmr-drow .a .r{font-size:12px;color:' + COL.muted + ';margin-top:2px}',
    '.lmr-drow .rail{flex:0 0 12px;margin-left:6px;margin-right:14px}',
    '.lmr-drow .m{flex:1;min-width:0;padding:10px 0;border-top:1px solid ' + COL.line + ';display:flex;flex-direction:column;justify-content:center}',
    '.lmr-drow:first-child .m{border-top:0}',
    '.lmr-drow .m .h{font-weight:800;font-size:15.5px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    '.lmr-drow .m .x{font-size:13.5px;line-height:1.42;margin-top:2px}',
    '.lmr-gchip{display:inline-block;border:1px solid;border-radius:99px;font-size:12px;padding:2px 10px;margin-top:6px;margin-right:6px}',
    '.lmr-gchip b{font-weight:800;margin-right:4px}',
    '.lmr-drow .sp{flex:0 0 150px;padding:10px 0 10px 22px;border-top:1px solid ' + COL.line + ';font-size:11.5px;color:' + COL.muted + '}',
    '.lmr-drow:first-child .sp{border-top:0}',
    /* p5 */
    '.lmr-gcards{flex:1;display:flex;flex-direction:column;gap:16px;margin-top:16px;min-height:0}',
    '.lmr-gcard{display:flex;gap:0;min-height:0;position:relative}',
    '.lmr-gcard .rl{flex:0 0 8px;border-radius:3px;margin-right:8px;margin-left:-3px;margin-right:0}',
    '.lmr-gcard .l{flex:0 0 164px;padding:14px 0 0 22px}',
    '.lmr-gcard .l .pc{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:58px;line-height:1;letter-spacing:-.02em;margin-top:12px}',
    '.lmr-gcard .l .lmr-chip{background:none;padding:8px 0 0;font-size:12.5px}',
    '.lmr-gcard .rr2{flex:1;min-width:0;padding:10px 0 0 6px}',
    '.lmr-gcard .top{display:flex;gap:16px;align-items:flex-start}',
    '.lmr-gcard .top>div{flex:1;min-width:0}',
    '.lmr-gcard .gn{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:21px;line-height:1.15}',
    '.lmr-gcard .gm{font-size:13px;font-weight:700;margin-top:5px}',
    '.lmr-gcard .gs{font-size:13.5px;margin-top:6px;line-height:1.45}',
    '.lmr-gcard .ph{flex:0 0 160px;height:136px;border-radius:16px;overflow:hidden}.lmr-gcard .ph img{width:100%;height:100%;object-fit:cover;display:block}',
    '.lmr-bar{margin-top:14px}.lmr-bar .t{display:flex;justify-content:space-between;font-size:13.5px}.lmr-bar .t b{font-weight:800}',
    '.lmr-bar .lmr-track{height:15px;margin:7px 0 0;border-radius:9px;background:#f3f6f8}',
    '.lmr-note{font-size:12px;color:' + COL.muted + ';margin-top:10px;line-height:1.4}',
    '.lmr-yrs{margin-top:20px}',
    '.lmr-yrs .t{display:flex;justify-content:space-between;font-size:13px;font-weight:800;margin-bottom:8px}.lmr-yrs .t span:last-child{font-weight:500}',
    '.lmr-cells{display:flex;gap:3px;height:40px}.lmr-cells i{flex:1;border-radius:4px;min-width:1px}',
    '.lmr-yrs .lb{display:flex;justify-content:space-between;font-size:12px;font-weight:800;margin-top:8px}',
    '.lmr-how{background:' + COL.bg + ';border-radius:18px;padding:16px 20px;font-size:13.5px;line-height:1.5;flex:none;margin-top:16px}',
    /* p6 */
    '.lmr-card{background:' + COL.bg + ';border-radius:22px;padding:18px 16px 18px;margin-top:18px;flex:none}',
    '.lmr-card .ct{display:flex;justify-content:space-between;align-items:center;padding:0 0 2px 16px}',
    '.lmr-card .ct b{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:17px}',
    '.lmr-card .cap{font-size:13.5px;font-weight:800;margin:6px 0 0 16px}',
    '.lmr-leg{display:flex;gap:16px;font-size:12px;color:' + COL.navy + '}.lmr-leg span{display:inline-flex;align-items:center;gap:6px}.lmr-leg i{width:12px;height:12px;border-radius:3px;display:inline-block}',
    /* p7 */
    '.lmr-sc{background:' + COL.bg + ';border-radius:22px;padding:20px 18px 12px;margin-top:20px;flex:none}',
    '.lmr-sc .hd{display:flex;align-items:flex-end;border-bottom:1px solid ' + COL.navy + ';padding:0 0 8px 0;font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.muted + ';text-transform:uppercase}',
    '.lmr-sc .hd .a{flex:1}.lmr-sc .hd .b{width:90px;text-align:right}.lmr-sc .hd .c{width:92px;text-align:right;line-height:1.3}',
    '.lmr-sc .gt{font-size:11px;font-weight:800;letter-spacing:.17em;color:' + COL.teal + ';text-transform:uppercase;padding:14px 0 6px}',
    '.lmr-sc .rw{display:flex;align-items:center;min-height:46px;padding:5px 0}',
    '.lmr-sc .rw .a{flex:0 0 268px;min-width:0}.lmr-sc .rw .a b{display:block;font-weight:800;font-size:14.5px;line-height:1.25}.lmr-sc .rw .a span{display:block;font-size:12px;color:' + COL.muted + ';line-height:1.3;margin-top:1px}',
    '.lmr-sc .rw .bar{flex:1;height:14px;background:#fff;border-radius:9px;overflow:hidden;margin:0 16px 0 14px}.lmr-sc .rw .bar i{display:block;height:100%;border-radius:9px;min-width:10px}',
    '.lmr-sc .rw .p{width:56px;text-align:right;font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:18px}',
    '.lmr-sc .rw .g{width:86px;text-align:right;font-size:14px;color:' + COL.muted + '}',
    '.lmr-explore{background:' + COL.navy + ';color:#fff;border-radius:22px;padding:22px 24px;margin-top:22px;flex:none}',
    '.lmr-explore .t{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:18px;color:' + COL.mint + '}',
    '.lmr-explore .x{font-size:15px;line-height:1.5;margin-top:7px}',
    '.lmr-foot2{font-size:12px;color:' + COL.muted + ';margin-top:16px;line-height:1.5;flex:none}',
    /* p8 */
    '.lmr-f1{display:flex;gap:20px;margin-top:20px;flex:none}',
    '.lmr-pyr{flex:0 0 432px;background:#f8f5ee;border-radius:22px;padding:14px 0;display:flex;flex-direction:column;justify-content:space-between;height:472px}',
    '.lmr-lv{margin:0 auto;border:1px solid;border-radius:14px;padding:11px 14px;display:flex;gap:10px;align-items:center;min-height:62px}',
    '.lmr-lv .t{font-weight:800;font-size:14.5px;line-height:1.25}.lmr-lv .s{font-size:12px;font-weight:700;line-height:1.3;margin-top:2px}',
    '.lmr-prot{flex:1;min-width:0}',
    '.lmr-prot .ph{height:113px;border-radius:16px;overflow:hidden}.lmr-prot .ph img{width:100%;height:100%;object-fit:cover;display:block}',
    '.lmr-prot .pt{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:18px;margin:14px 0 4px}',
    '.lmr-prot .pr{display:flex;justify-content:space-between;height:41px;align-items:center;border-bottom:1px solid ' + COL.line + ';font-size:14px}.lmr-prot .pr b{font-weight:800}',
    '.lmr-nb{background:' + COL.bg + ';border-radius:14px;padding:13px 15px;margin-top:14px}.lmr-nb .e{font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.teal + ';text-transform:uppercase}.lmr-nb .x{font-size:13.5px;line-height:1.4;margin-top:3px}',
    '.lmr-pers{background:' + COL.bg + ';border-radius:22px;padding:22px 22px 18px;margin-top:20px;flex:none}',
    '.lmr-pers .ph{display:flex;gap:16px;align-items:center}',
    '.lmr-pers .n{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:28px;line-height:1.1}',
    '.lmr-pers .st{font-size:14px;color:' + COL.muted + ';margin-top:3px}',
    '.lmr-quad{display:grid;grid-template-columns:1fr 1fr;gap:16px 36px;margin-top:20px}',
    '.lmr-quad .q{font-size:11px;font-weight:800;letter-spacing:.14em;color:' + COL.muted + ';text-transform:uppercase}.lmr-quad .v{font-weight:800;font-size:14.5px;margin-top:4px;line-height:1.3}',
    '.lmr-risk{margin-top:18px;font-size:12.5px;color:' + COL.muted + '}',
    '.lmr-scale{display:flex;gap:6px;margin-top:8px}.lmr-scale div{flex:1;background:#fff;border:1.5px solid #fff;border-radius:12px;min-height:46px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:12.5px;padding:4px 6px;color:' + COL.muted + ';line-height:1.2}',
    '.lmr-scale div.on{border-color:' + COL.teal + ';background:' + COL.tealTint + ';color:' + COL.teal + ';font-weight:800}',
    '.lmr-pers .nt{font-size:13.5px;line-height:1.45;margin-top:10px}',
    /* p9 */
    '.lmr-n9{background:' + COL.navy + ';height:394px;margin:0 -56px;position:relative;flex:none;overflow:hidden;color:#fff}',
    '.lmr-n9 .ph{position:absolute;right:0;top:0;width:370px;height:394px}.lmr-n9 .ph img{width:100%;height:100%;object-fit:cover;display:block;filter:brightness(.8)}',
    '.lmr-n9 .ph:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,' + COL.navy + ',rgba(11,37,69,0) 40%)}',
    '.lmr-n9 .tx{position:absolute;left:56px;top:84px;width:350px;z-index:2}',
    '.lmr-n9 .ey{font-size:11px;font-weight:800;letter-spacing:.17em;color:' + COL.mint + ';text-transform:uppercase}',
    '.lmr-n9 .tt{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:37px;line-height:1.08;margin-top:8px;letter-spacing:-.01em}',
    '.lmr-n9 .ld{font-size:16.5px;line-height:1.45;margin-top:14px;color:#dfe7f1}',
    '.lmr-n9 .bt{display:inline-block;background:' + COL.mint + ';color:' + COL.navy + ';font-weight:800;font-size:15.5px;border-radius:99px;padding:16px 28px;margin-top:26px}',
    '.lmr-body9{padding-top:0}',
    '.lmr-steps{display:flex;gap:20px;margin-top:18px;flex:none}',
    '.lmr-steps>div{flex:1;border-top:6px solid ' + COL.tealMid + ';padding-top:12px;display:flex;gap:10px;min-width:0}',
    '.lmr-steps .n{flex:0 0 28px;height:28px;border-radius:50%;background:' + COL.navy + ';color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}',
    '.lmr-steps .t{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:800;font-size:15.5px;line-height:1.2}.lmr-steps .x{font-size:13px;line-height:1.35;margin-top:3px}',
    '.lmr-two9{display:flex;gap:34px;margin-top:26px;flex:none}.lmr-two9>div{flex:1;min-width:0}',
    '.lmr-tchips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.lmr-tchips span{background:' + COL.tealTint + ';color:' + COL.teal + ';font-weight:800;font-size:13px;border-radius:99px;padding:7px 14px}',
    '.lmr-ck{display:flex;gap:12px;margin-top:12px;font-size:14px;line-height:1.4}.lmr-ck i{flex:0 0 20px;height:20px;border:1.8px solid ' + COL.navy + ';border-radius:5px;margin-top:1px}',
    '.lmr-qs{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.lmr-qs div{background:' + COL.bg + ';border-radius:16px;padding:16px 18px;font-size:14px;line-height:1.4}',
    '.lmr-sp{flex:1}',
    /* p10 */
    '.lmr-as{display:flex;gap:34px;margin-top:20px;flex:none}.lmr-as>div{flex:1;min-width:0}',
    '.lmr-ar{display:flex;justify-content:space-between;align-items:center;gap:14px;min-height:44px;padding:8px 0;border-bottom:1px solid ' + COL.line + ';font-size:14px}',
    '.lmr-ar b{font-weight:800}.lmr-ar .k{flex:0 0 auto;max-width:96px}.lmr-ar .v{margin-left:auto;text-align:right}.lmr-ar.lg .v{text-align:left;margin-left:0;flex:1}',
    '.lmr-two10{display:flex;gap:34px;margin-top:26px;flex:none}.lmr-two10>div{flex:1;min-width:0}',
    '.lmr-two10 ul{margin:10px 0 0;padding-left:20px;font-size:14px;line-height:1.5}.lmr-two10 li{margin-bottom:6px}.lmr-two10 p{font-size:14px;line-height:1.5;margin-top:10px}',
    '.lmr-src{font-size:12.5px;color:' + COL.muted + ';margin-top:22px;line-height:1.45}',
    '.lmr-gl{display:grid;grid-template-columns:repeat(3,1fr);gap:0 20px;margin-top:12px}',
    '.lmr-gl div{border-top:1px solid ' + COL.line + ';padding:7px 0 10px;min-height:59px}.lmr-gl b{display:block;font-size:13px;font-weight:800;line-height:1.25}.lmr-gl span{display:block;font-size:12.5px;line-height:1.35;color:' + COL.navy + ';margin-top:2px}',
    /* p11 */
    '.lmr-ap{display:flex;gap:34px;margin-top:18px;flex:none}.lmr-ap>div{flex:1;min-width:0}',
    '.lmr-ap table{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums}',
    '.lmr-ap th{font-size:11px;font-weight:800;color:' + COL.muted + ';text-align:right;padding:6px 3px;border-bottom:1.5px solid ' + COL.navy + '}',
    '.lmr-ap th:first-child,.lmr-ap td:first-child{text-align:left;padding-left:0}',
    '.lmr-ap td{text-align:right;padding:0 3px;height:22.8px;border-bottom:1px solid ' + COL.line + '}',
    '.lmr-ap td.na{color:#5f6f84}.lmr-ap td.sf{color:' + COL.coralText + ';font-weight:800}',
    /* v5 fidelity overrides */
    '.lmr-goal .gn,.lmr-gcard .gn,.lmr-h3,.lmr-cols3 .t,.lmr-it .t,.lmr-drow .m .h,.lmr-banner .t,.lmr-steps .t,.lmr-sc .rw .a b,.lmr-lv .t,.lmr-prot .pt,.lmr-explore .t,.lmr-card .ct b,.lmr-gl b,.lmr-pers .n{font-family:"Bricolage Grotesque","Figtree",sans-serif;font-weight:700}',
    '.lmr-goal .gn{font-size:19.5px}.lmr-gcard .gn{font-size:19.5px}.lmr-cols3 .t{font-size:15px}.lmr-it .t{font-size:15px}',
    '.lmr-banner{padding:16px 24px 16px 26px}.lmr-gap{padding:19px 24px}.lmr-close{margin-top:17px}.lmr-cols3{margin-top:22px}',
    '.lmr-sent{font-size:14px;margin-top:20px}.lmr-tiles{height:113px}',
    '.lmr-plant img{height:160px}.lmr-plant .n{font-size:40px;margin-top:2px}.lmr-plant .in{padding:16px 20px 16px}.lmr-prog{height:12px;margin:6px 0 10px}.lmr-plant .sb{font-size:13px}',
    '.lmr-plant{margin-bottom:12px}',
    '.lmr-gcard .top>div:first-child{flex:1;min-width:0}.lmr-gcard .top>.ph{flex:0 0 160px}',
    '.lmr-gcard .l .pc{font-size:47px}.lmr-gcard .gm{font-size:12.5px}.lmr-gcard .gs{font-size:13px}.lmr-bar .t{font-size:13px}.lmr-how{font-size:13px;padding:14px 20px;line-height:1.5}',
    '.lmr-sc .rw{min-height:50px}.lmr-sc .rw .a{flex:0 0 298px;padding-right:10px}.lmr-sc .rw .a span{font-size:11.5px}.lmr-sc .rw .bar{flex:0 0 188px;margin:0 0 0 0}.lmr-sc .rw .p{width:69px}.lmr-sc .rw .g{width:87px}.lmr-sc .hd .b{width:71px}.lmr-sc .hd .c{width:85px}',
    '.lmr-explore{padding:18px 24px;margin-top:20px}.lmr-explore .x{font-size:14.5px;line-height:1.5}',
    '.lmr-quad{gap:12px 36px;margin-top:14px}.lmr-risk{margin-top:14px}',
    '.lmr-n9 .ld{font-size:16px}.lmr-n9 .tx{top:80px}.lmr-ck{font-size:13.5px}.lmr-qs div{font-size:13.5px}.lmr-steps .x{font-size:12.5px}',
    '.lmr-ar.lg .k{width:92px;max-width:92px}.lmr-ar .k{max-width:none}.lmr-two10 ul,.lmr-two10 p{font-size:14px;line-height:1.5}.lmr-ar{min-height:46px}',
    '.lmr-gl span{font-size:11.5px;color:' + COL.muted + '}.lmr-gl b{font-size:12.5px}.lmr-src{font-size:12px}',
    '.lmr-ap table{font-size:11.5px}.lmr-ap th{font-size:10.5px;padding:5px 3px}.lmr-ap td{height:22.8px}.lmr-ap th:first-child{width:78px}',
    '.lmr-roadcard svg,.lmr-cv-road svg,.lmr-card svg{display:block}',
    '.lmr-ap{margin-top:12px}.lmr-arrow{display:inline-block;vertical-align:middle;margin:0 18px}',
    '@media print{.lmr-pg{break-after:page;page-break-after:always}}',
    '@page{size:A4;margin:0}'
  ].join('\n');

  // ---------- page frame ----------
  function frame(d, n, total, label, inner, extraCls) {
    return '<section class="lmr-pg ' + (extraCls || '') + '" data-page="' + n + '" role="group" aria-label="Page ' + n + ' of ' + total + ': ' + esc(label) + '">' +
      '<div class="lmr-rh">' + logo() + '<span class="lmr-rr">' + esc(d.meta.headerRight) + '</span></div>' +
      inner +
      '<div class="lmr-rf"><span>' + esc(d.footer.line) + '</span><span>' + n + ' / ' + total + '</span></div></section>';
  }
  function titleBlock(o) {
    return '<div class="lmr-tb"><div class="lmr-bn"><div class="lmr-bnum" style="color:' + textOf(o.bigTone || 'navy') + '">' + esc(o.big) + '</div>' +
      (has(o.bigLabel) ? '<div class="lmr-bl">' + esc(o.bigLabel) + '</div>' : '') + '</div>' +
      '<div class="lmr-tx">' + (has(o.eyebrow) ? '<div class="lmr-ey">' + esc(o.eyebrow) + '</div>' : '') +
      '<h1 class="lmr-title">' + esc(o.title) + '</h1>' + (has(o.lead) ? '<p class="lmr-lead">' + esc(o.lead) + '</p>' : '') + '</div></div>';
  }
  function photo(opts, name, alt) {
    if (!has(name)) return '';
    var src = opts.photoSrc ? opts.photoSrc(name) : 'media/' + name + '.jpg';
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '">';
  }
  var ALT = {
    'money-plant': 'A potted money plant growing by a window',
    'retired-reading': 'A retired man reading a newspaper in an armchair',
    'car-and-calculator': 'A toy car, calculator and insurance papers',
    'house-for-sale': 'A house with a for-sale sign',
    'team-with-charts': 'A team of advisers around a table of charts',
    'magnifier-map': 'A hand holding a magnifying glass over a map'
  };

  // ---------- road (cover + page 4) ----------
  function roadSVG(road, o) {
    o = o || {};
    var w = o.w || 794, h = o.h || 270, x0 = o.x0, x1 = o.x1;
    var span = Math.max(1, road.endAge - road.startAge);
    var X = function (a) { return x0 + (a - road.startAge) / span * (x1 - x0); };
    // decorative S-wave, normalised heights (0 top .. 1 bottom), as in v5
    var pts = [[0, 0], [.21, 43], [.43, -11], [.61, -53], [.74, -37], [1, 30]];
    var k = o.k || 1, y0 = o.y0;
    function Yt(t) {
      var n = pts.length, i = 0;
      while (i < n - 2 && t > pts[i + 1][0]) i++;
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
      var h = p2[0] - p1[0], u = clamp((t - p1[0]) / h, 0, 1);
      var m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * h, m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * h;
      var u2 = u * u, u3 = u2 * u;
      var v = (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
      return y0 + v * k;
    }
    function Y(a) { return Yt((a - road.startAge) / span); }
    function pathBetween(a, b) {
      var n = Math.max(6, Math.round((b - a) / span * 120)), d = '';
      for (var i = 0; i <= n; i++) { var ag = a + (b - a) * i / n; d += (i ? 'L' : 'M') + X(ag).toFixed(1) + ' ' + Y(ag).toFixed(1); }
      return d;
    }
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Your road from age ' + road.startAge + ' to ' + road.endAge + '">';
    var full = pathBetween(road.startAge, road.endAge);
    s += '<path d="' + full + '" stroke="' + (o.glow || 'rgba(255,255,255,.28)') + '" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    arr(road.segments).forEach(function (sg) {
      s += '<path d="' + pathBetween(sg.fromAge, sg.toAge) + '" stroke="' + fillOf(sg.tone) + '" stroke-width="10" fill="none" stroke-linecap="butt" stroke-linejoin="round"/>';
    });
    // rounded start / end caps in segment colours
    var segs = arr(road.segments);
    if (segs.length) {
      s += '<circle cx="' + X(segs[0].fromAge).toFixed(1) + '" cy="' + Y(segs[0].fromAge).toFixed(1) + '" r="5" fill="' + fillOf(segs[0].tone) + '"/>';
      var L = segs[segs.length - 1];
      s += '<circle cx="' + X(L.toAge).toFixed(1) + '" cy="' + Y(L.toAge).toFixed(1) + '" r="5" fill="' + fillOf(L.tone) + '"/>';
    }
    s += '<circle cx="' + X(road.startAge).toFixed(1) + '" cy="' + Y(road.startAge).toFixed(1) + '" r="8.5" fill="' + (o.dot || '#fff') + '" stroke="' + (o.dotStroke || COL.navy) + '" stroke-width="3"/>';
    // milestones: resolve collisions
    var ms = arr(road.milestones).slice().sort(function (a, b) { return a.age - b.age; });
    var lastSide = null, lastX = -999;
    ms.forEach(function (m) {
      var side = m.side === 'below' ? 'below' : 'above', mx = X(m.age);
      if (side === lastSide && Math.abs(mx - lastX) < 120) side = side === 'above' ? 'below' : 'above';
      lastSide = side; lastX = mx; m._side = side;
    });
    var tc = o.labelColor || '#fff', sc = o.subColor || '#cdd8e8';
    ms.forEach(function (m) {
      var mx = X(m.age), my = Y(m.age), up = m._side === 'above', cy = up ? my - (o.off || 64) : my + (o.off || 64);
      var col = fillOf(m.tone);
      s += '<line x1="' + mx.toFixed(1) + '" y1="' + (up ? cy + 15 : cy - 15) + '" x2="' + mx.toFixed(1) + '" y2="' + my.toFixed(1) + '" stroke="' + (o.stem || 'rgba(255,255,255,.55)') + '" stroke-width="1.2" stroke-dasharray="2 3"/>';
      s += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="5.2" fill="#fff" stroke="' + col + '" stroke-width="2.5"/>';
      s += '<circle cx="' + mx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="15" fill="#fff" stroke="' + col + '" stroke-width="4"/>';
      s += '<text x="' + mx.toFixed(1) + '" y="' + (cy + 4.6).toFixed(1) + '" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + COL.navy + '">' + esc(m.badge) + '</text>';
      if (o.labels !== false) {
        var ly = up ? cy - 38 : cy + 33;
        s += '<text x="' + mx.toFixed(1) + '" y="' + ly + '" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="14" fill="' + tc + '">' + esc(m.label) + '</text>';
        s += '<text x="' + mx.toFixed(1) + '" y="' + (ly + 16) + '" text-anchor="middle" font-family="Figtree,sans-serif" font-size="12" fill="' + sc + '">' + esc(m.sub) + '</text>';
      }
    });
    s += '<text x="' + (x0 - 8) + '" y="' + (h - 6) + '" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + tc + '">' + esc(road.startLabel) + '</text>';
    s += '<text x="' + ((o.endX || x1 + 8)) + '" y="' + (h - 6) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + (o.endColor || sc) + '">' + esc(road.endLabel) + '</text>';
    return s + '</svg>';
  }

  // ---------- page 1 ----------
  function pCover(d, o, n, total) {
    var c = d.cover, h = '<section class="lmr-pg lmr-cover" data-page="1" role="group" aria-label="Page 1 of ' + total + ': Cover">';
    h += '<div class="lmr-cv-dark"></div>';
    h += '<div class="lmr-cv-bar"><i style="flex:3;background:' + COL.tealMid + '"></i><i style="flex:1;background:' + COL.gold + '"></i><i style="flex:1;background:' + COL.coral + '"></i></div>';
    h += '<div class="lmr-cv-photo">' + photo(o, 'magnifier-map', ALT['magnifier-map']) + '</div>';
    h += '<div class="lmr-cv-badge">' + esc(c.badge) + '</div>';
    h += '<div class="lmr-cv-logo">' + logo() + '</div>';
    h += '<div class="lmr-cv-ey">' + esc(c.eyebrow) + '</div>';
    h += '<h1 class="lmr-cv-title">' + esc(c.title) + '</h1>';
    h += '<p class="lmr-cv-lead">' + esc(c.lead) + '</p>';
    h += '<div class="lmr-cv-road">' + roadSVG(d.road, { w: 794, h: 282, x0: 111, x1: 747, y0: 148, off: 50, endX: 744 }) + '</div>';
    h += '<div class="lmr-cv-tiles">' + arr(c.tiles).map(function (t) {
      return '<div class="lmr-cv-tile">' + circleIcon(t.icon, t.tone, 36, 20) + '<div><div class="b lmr-hd" style="color:' + COL.navy + '">' + esc(t.big) + '</div><div class="s">' + esc(t.small) + '</div></div></div>';
    }).join('') + '</div>';
    h += '<div class="lmr-cv-foot">' + esc(d.footer.coverLine) + '</div></section>';
    return h;
  }

  // ---------- page 2 ----------
  function goalRow(g, compact) {
    var tn = bandTone(g.band), pc = clamp(num(g.pct), 0, 100);
    return '<div class="lmr-goal' + (compact ? ' cp' : '') + '">' + circleIcon(goalIcon(g), tn, 56, 26) +
      '<div class="gc"><div class="gn lmr-clamp2">' + esc(g.name) + '</div><div class="gm">' + esc(g.meta) + '</div>' +
      '<div class="lmr-track"><div class="lmr-fill" style="width:' + pc + '%;background:' + (tn === 'good' ? COL.teal : fillOf(tn)) + '"></div></div>' +
      '<div class="gs">' + esc(g.sentence) + '</div></div>' +
      '<div class="gp"><div class="pc" style="color:' + textOf(tn) + '">' + pc + '%</div><span class="lmr-chip" style="color:' + textOf(tn) + '">' +
      circleIcon(tn === 'good' ? 'sun' : (tn === 'gold' ? 'partly' : 'storm'), tn, 22, 14) + esc(g.bandText) + '</span></div></div>';
  }
  function pPlan(d, o, n, total) {
    var p = d.plan, gs = arr(p.goals), compact = gs.length > 4, rows, more = '';
    if (gs.length > 5) { rows = gs.slice(0, 4); more = '<div class="lmr-more">and ' + (gs.length - 4) + ' more goals. See the goal pages.</div>'; }
    else rows = gs;
    var body = titleBlock(p) + '<div class="lmr-goals">' + rows.map(function (g) { return goalRow(g, compact); }).join('') + more + '</div>';
    var cells = arr(p.band && p.band.cells);
    if (cells.length) body += '<div class="lmr-gap' + (p.band.kind === 'none' ? ' pos' : '') + '">' + cells.map(function (c) {
      return '<div class="c"><div class="b">' + esc(c.big) + '</div><div class="s">' + esc(c.small) + '</div></div>'; }).join('') + '</div>';
    var items = arr(p.close && p.close.items);
    if (items.length) body += '<div class="lmr-close"><div class="lmr-h3">' + esc(p.close.title) + '</div><div class="lmr-cols3">' + items.map(function (it) {
      return '<div style="border-color:' + fillOf(it.tone) + '"><div class="p">' + esc(it.points) + '</div><div class="t">' + esc(it.title) + '</div><div class="x">' + esc(it.text) + '</div></div>'; }).join('') + '</div></div>';
    if (p.next) body += '<div class="lmr-banner"><div><div class="t">' + esc(p.next.title) + '</div><div class="x">' + esc(p.next.text) + '</div></div><span class="lmr-btn">' + esc(p.next.button) + '</span></div>';
    return frame(d, n, total, 'Your plan on a page', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 3 ----------
  function ledger(l) {
    var rows = arr(l.rows);
    if (!rows.length) return '';
    return '<div class="lmr-led-t">' + esc(l.title) + '</div>' + rows.map(function (r) {
      var v = (r.status === 'missing') ? '<span class="lmr-miss">Missing</span>' : '<b>' + esc(r.value) + '</b>';
      return '<div class="lmr-row"><span>' + esc(r.label) + '</span>' + v + '</div>'; }).join('');
  }
  function pMoney(d, o, n, total) {
    var m = d.money, t = arr(m.tiles), tot = t.reduce(function (a, x) { return a + Math.max(0, num(x.amount)); }, 0) || 1;
    var sh = t.map(function (x) { return Math.max(0.19, Math.max(0, num(x.amount)) / tot); });
    var big = 0; sh.forEach(function (v, i) { if (v > sh[big]) big = i; });
    var rest = sh.reduce(function (a, v, i) { return i === big ? a : a + v; }, 0); sh[big] = 1 - rest;
    var body = titleBlock(m);
    body += '<div class="lmr-tiles">' + t.map(function (x, i) {
      return '<div class="lmr-tile ' + esc(x.tone) + '" style="flex:0 0 calc(' + (sh[i] * 100).toFixed(2) + '% - 3px)"><div class="l">' + esc(x.label) + '</div><div class="v">' + esc(x.value) + '</div></div>'; }).join('') + '</div>';
    body += '<p class="lmr-sent">' + esc(m.sentence) + ' ' + esc(m.takeHome) + (has(m.exampleChip) ? ' <span class="lmr-ex">' + esc(m.exampleChip) + '</span>' : '') + '</p>';
    var c = m.complete, pct = clamp(num(c.have) / Math.max(1, num(c.total)) * 100, 0, 100);
    var nw = m.netWorth || {};
    body += '<div class="lmr-two"><div class="l">' + ledger(m.own) + ledger(m.owe) +
      '<div class="lmr-nw"><span>' + esc(nw.label) + '</span>' + (has(nw.value) ? '<b>' + esc(nw.value) + '</b>' : '<span class="lmr-miss">' + esc(nw.status || 'not yet known') + '</span>') + '</div></div>' +
      '<div class="r"><div class="lmr-plant">' + photo(o, c.photo, ALT[c.photo]) + '<div class="in"><div class="e">' + esc(c.eyebrow) + '</div><div class="n">' + esc(c.have) + '<small>of ' + esc(c.total) + '</small></div><div class="lmr-prog"><i style="width:' + pct.toFixed(1) + '%"></i></div><div class="sb">' + esc(c.sub) + '</div></div></div>' +
      arr(c.items).map(function (it) {
        var pt = it.priority === 'High' ? 'coral' : (it.priority === 'Medium' ? 'gold' : 'good');
        return '<div class="lmr-it"><div><div class="t">' + esc(it.title) + '</div><div class="s">' + esc(it.sub) + '</div></div><span class="lmr-chip" style="background:' + tintOf(pt) + ';color:' + textOf(pt) + '">' + esc(it.priority) + '</span></div>'; }).join('') +
      '</div></div>';
    return frame(d, n, total, 'Your money today', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- sparkline ----------
  function spark(sp) {
    var v = arr(sp.values), g = arr(sp.gapYears), w = 128, h = 44, pad = 3;
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">';
    var mx = Math.max.apply(null, v.concat([0]));
    var n = v.length;
    if (!n) return s + '</svg>';
    var allGap = g.length && g.every(Boolean);
    function X(i) { return n === 1 ? w / 2 : pad + i * (w - 2 * pad) / (n - 1); }
    function Yv(x) { return mx <= 0 ? h - pad : (h - pad) - (x / mx) * (h - 2 * pad - 2); }
    if (mx <= 0) {
      var yy = allGap ? h - 14 : h - pad - 1;
      return s + '<line x1="' + pad + '" y1="' + yy + '" x2="' + (w - pad) + '" y2="' + yy + '" stroke="' + (allGap ? COL.coral : COL.grey) + '" stroke-width="2.6" stroke-linecap="round"/></svg>';
    }
    var anyGap = g.some(Boolean), col = anyGap ? COL.coral : COL.tealMid;
    var pts = v.map(function (x, i) { return X(i).toFixed(1) + ' ' + Yv(x).toFixed(1); });
    s += '<path d="M' + X(0).toFixed(1) + ' ' + (h - pad) + ' L' + pts.join(' L') + ' L' + X(n - 1).toFixed(1) + ' ' + (h - pad) + 'Z" fill="' + (anyGap ? COL.coralTint : COL.tealTint) + '"/>';
    s += '<path d="M' + pts.join(' L') + '" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    s += '<line x1="' + pad + '" y1="' + (h - pad) + '" x2="' + (w - pad) + '" y2="' + (h - pad) + '" stroke="' + (anyGap ? COL.coral : COL.tealMid) + '" stroke-width="' + (anyGap ? 2.2 : 0) + '"/>';
    return s + '</svg>';
  }

  // ---------- page 4 ----------
  function pRoadmap(d, o, n, total) {
    var r = d.roadmap, body = titleBlock(r);
    body += '<div class="lmr-roadcard">' + roadSVG(d.road, { w: 681, h: 190, x0: 36, x1: 648, y0: 102, k: 0.72, off: 46, endX: 640, labelColor: COL.navy, subColor: COL.muted, glow: '#dce5ec', stem: '#9aa8b8', endColor: COL.muted, labels: false }) + '</div>';
    body += '<div class="lmr-dec">' + arr(r.decades).map(function (x) {
      var tn = tone(x.tone);
      return '<div class="lmr-drow"><div class="a">' + circleIcon(x.icon, tn, 52, 26) + '<div><div class="d">' + esc(x.label) + '</div><div class="r">' + esc(x.range) + '</div></div></div>' +
        '<div class="rail" style="background:' + fillOf(tn) + '"></div>' +
        '<div class="m"><div class="h">' + esc(x.title) + '<span class="lmr-chip" style="background:' + tintOf(tn) + ';color:' + textOf(tn) + '">' + esc(x.chip) + '</span></div><div class="x">' + esc(x.text) + '</div>' +
        (arr(x.goalChips).length ? '<div>' + arr(x.goalChips).slice(0, 3).map(function (gc) { return '<span class="lmr-gchip" style="border-color:' + fillOf(gc.tone) + '"><b>' + esc(gc.age) + '</b>' + esc(gc.text) + '</span>'; }).join('') + '</div>' : '') + '</div>' +
        '<div class="sp"><div>' + esc(x.spark && x.spark.label) + '</div>' + (x.spark ? spark(x.spark) : '') + '</div></div>'; }).join('') + '</div>';
    return frame(d, n, total, 'Your roadmap', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 5 (goal cards, repeats) ----------
  function goalCard(g, o, weight) {
    var tn = bandTone(g.band), col = tn === 'good' ? COL.tealMid : fillOf(tn), b = g.bars || {}, pc = clamp(num(g.pct), 0, 100);
    var h = '<div class="lmr-gcard" style="flex:' + weight + ' 1 0"><div class="rl" style="background:' + col + '"></div><div class="l">' + circleIcon(goalIcon(g), tn, 46, 24) +
      '<div class="pc" style="color:' + textOf(tn) + '">' + pc + '%</div><span class="lmr-chip" style="color:' + textOf(tn) + '">' + circleIcon(tn === 'good' ? 'sun' : (tn === 'gold' ? 'partly' : 'storm'), tn, 22, 14) + esc(g.bandText) + '</span></div>' +
      '<div class="rr2"><div class="top"><div><div class="gn lmr-clamp2">' + esc(g.name) + '</div><div class="gm">' + esc(g.meta) + '</div><div class="gs">' + esc(g.sentence) + '</div></div>' +
      (g.photo ? '<div class="ph">' + photo(o, g.photo, ALT[g.photo]) + '</div>' : '') + '</div>';
    function bar(l, v, p, c) {
      return '<div class="lmr-bar"><div class="t"><span>' + esc(l) + '</span><b>' + esc(v) + '</b></div><div class="lmr-track"><div class="lmr-fill" style="width:' + clamp(num(p), 0, 100) + '%;background:' + c + '"></div></div></div>'; }
    if (b.type === 'retire') {
      h += bar(b.costLabel, b.costValue, b.costPct, COL.navy) + bar(b.coverLabel, b.coverValue, b.coverPct, col === COL.tealMid ? COL.teal : col);
    } else if (b.type === 'saving') {
      h += bar(b.needLabel, b.needValue, b.needPct, COL.navy) + bar(b.putLabel, b.putValue, b.putPct, col === COL.tealMid ? COL.teal : col);
    }
    if (has(b.note)) h += '<div class="lmr-note">' + esc(b.note) + '</div>';
    var y = g.years;
    if (y && arr(y.cells).length) {
      h += '<div class="lmr-yrs"><div class="t"><span>' + esc(y.title) + '</span><span>' + esc(y.summary) + '</span></div><div class="lmr-cells" role="img" aria-label="' + esc(y.title + ': ' + y.summary) + '">' +
        y.cells.map(function (c) { return '<i style="background:' + ({ pension: COL.tealMid, savings: COL.gold, gap: COL.coral, none: '#e3e8ed' }[c.state] || '#e3e8ed') + '"></i>'; }).join('') + '</div>' +
        '<div class="lb"><span style="color:' + COL.goldText + '">' + esc(y.leftLabel) + '</span><span style="color:' + COL.coralText + '">' + esc(y.rightLabel) + '</span></div></div>';
    }
    return h + '</div></div>';
  }
  function goalPages(d, o) {
    var g = arr(d.goalsDetail.goals), pages = [], cur = [], units = 0;
    g.forEach(function (x) {
      var wgt = (x.bars && x.bars.type === 'retire') || (x.years && arr(x.years.cells).length) ? 2.1 : 1;
      if (cur.length && units + wgt > 3.2) { pages.push(cur); cur = []; units = 0; }
      cur.push({ g: x, w: wgt }); units += wgt;
    });
    if (cur.length) pages.push(cur);
    return pages;
  }
  function pGoals(d, o, n, total, pg, idx, cnt) {
    var gd = d.goalsDetail, tb = titleBlock(gd);
    var body = tb + '<div class="lmr-gcards">' + pg.map(function (x) { return goalCard(x.g, o, pg.length === 1 ? 1 : x.w); }).join('') + '</div>';
    if (idx === cnt - 1 && has(gd.howToRead)) body += '<div class="lmr-how">' + howHTML(gd.howToRead) + '</div>';
    return frame(d, n, total, 'Your goals in detail' + (cnt > 1 ? ' (' + (idx + 1) + ' of ' + cnt + ')' : ''), '<div class="lmr-body">' + body + '</div>');
  }
  function howHTML(s) {
    // bold the lead-in phrases the way v5 does: "How to read this page." and the two money terms
    var t = esc(s);
    t = t.replace(/^(How to read this page\.)/, '<b>$1</b>').replace(/(Today’s money)(?= shows)/, '<b>$1</b>').replace(/(future euros)(?= add)/, '<b>$1</b>').replace(/(Covered)(?= is)/, '<b>$1</b>');
    return t;
  }

  // ---------- page 6 charts ----------
  function money(v) { return v === 0 ? '€0' : (v >= 1e6 ? '€' + (v / 1e6) + 'm' : '€' + (v / 1000) + 'k'); }
  function zoneRects(zones, X, y0, y1, labelY) {
    var s = '';
    arr(zones).forEach(function (z) {
      var col = { good: COL.tealTint2, gold: '#f8f3e3', coral: '#f7ece9' }[z.tone] || '#eee';
      s += '<rect x="' + X(z.fromAge).toFixed(1) + '" y="' + y0 + '" width="' + Math.max(0, X(z.toAge) - X(z.fromAge)).toFixed(1) + '" height="' + (y1 - y0) + '" fill="' + col + '"/>';
    });
    arr(zones).forEach(function (z) {
      if (has(z.label)) s += '<text x="' + ((X(z.fromAge) + X(z.toAge)) / 2).toFixed(1) + '" y="' + labelY + '" text-anchor="middle" font-family="Figtree,sans-serif" font-weight="800" font-size="12" letter-spacing="1.4" fill="' + textOf(z.tone) + '">' + esc(z.label) + '</text>';
    });
    return s;
  }
  function savingsSVG(c) {
    var w = 649, h = 300, L = 54, R = 640, T = 31, B = 269;
    var ser = arr(c.series); if (!ser.length) return '';
    var a0 = ser[0].age, a1 = ser[ser.length - 1].age, span = Math.max(1, a1 - a0);
    var X = function (a) { return L + (a - a0) / span * (R - L); };
    var Y = function (v) { return B - clamp(v / c.yMax, 0, 1) * (B - T); };
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(c.caption) + '"><defs><linearGradient id="lmrSg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + COL.tealMid + '" stop-opacity=".45"/><stop offset="1" stop-color="' + COL.tealMid + '" stop-opacity=".05"/></linearGradient></defs>';
    s += zoneRects(c.zones, X, T - 3, B, 18);
    arr(c.yTicks).forEach(function (t) {
      s += '<line x1="' + L + '" y1="' + Y(t).toFixed(1) + '" x2="' + R + '" y2="' + Y(t).toFixed(1) + '" stroke="#fff" stroke-width="1.4"/><text x="' + (L - 12) + '" y="' + (Y(t) + 4).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + money(t) + '</text>'; });
    var ro = c.runOut, endIdx = ser.length - 1;
    var lastPos = -1; ser.forEach(function (p, i) { if (p.value > 0) lastPos = i; });
    var upto = ro ? ser.filter(function (p) { return p.age <= ro.age; }) : ser;
    var pts = upto.map(function (p) { return X(p.age).toFixed(1) + ' ' + Y(p.value).toFixed(1); });
    if (upto.length > 1) {
      s += '<path d="M' + X(upto[0].age).toFixed(1) + ' ' + B + ' L' + pts.join(' L') + ' L' + X(upto[upto.length - 1].age).toFixed(1) + ' ' + B + 'Z" fill="url(#lmrSg)"/>';
      s += '<path d="M' + pts.join(' L') + '" fill="none" stroke="' + COL.teal + '" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    if (ro) {
      s += '<line x1="' + X(ro.age).toFixed(1) + '" y1="' + B + '" x2="' + R + '" y2="' + B + '" stroke="' + COL.coral + '" stroke-width="4" stroke-linecap="round"/>';
      s += '<text x="' + R + '" y="' + (B - 11) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="12.5" fill="' + COL.coralText + '">' + esc(ro.label) + '</text>';
    }
    if (c.peak) {
      var px = X(c.peak.age), py = Y(c.peak.value), left = px > L + (R - L) * 0.4;
      s += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="5.5" fill="' + COL.navy + '" stroke="#fff" stroke-width="2"/>';
      var tx = left ? px - 14 : px + 14, anch = left ? 'end' : 'start';
      s += '<text x="' + tx.toFixed(1) + '" y="' + (py + 4).toFixed(1) + '" text-anchor="' + anch + '" font-family="Figtree,sans-serif" font-weight="800" font-size="13" fill="' + COL.navy + '">' + esc(c.peak.label) + '</text>';
      if (has(c.peak.sub)) s += '<text x="' + tx.toFixed(1) + '" y="' + (py + 19).toFixed(1) + '" text-anchor="' + anch + '" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + esc(c.peak.sub) + '</text>';
    }
    s += xTicks(a0, a1, X, B + 23, null);
    return s + '</svg>';
  }
  function xTicks(a0, a1, X, y, slot) {
    var s = '';
    for (var a = Math.ceil(a0 / 10) * 10; a <= a1; a += 10) s += '<text x="' + (slot ? slot(a) : X(a)).toFixed(1) + '" y="' + y + '" text-anchor="middle" font-family="Figtree,sans-serif" font-size="12.5" fill="' + COL.muted + '">' + a + '</text>';
    return s;
  }
  function paidSVG(c) {
    var w = 649, h = 300, L = 54, R = 640, T = 31, B = 269, bars = arr(c.bars); if (!bars.length) return '';
    var a0 = bars[0].age, a1 = bars[bars.length - 1].age, nb = bars.length, slot = (R - L) / nb;
    var X = function (a) { return L + (a - a0) * slot; };
    var XC = function (a) { return L + (a - a0 + .5) * slot; };
    var Y = function (v) { return B - clamp(v / c.yMax, 0, 1) * (B - T); };
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(c.caption) + '"><defs><pattern id="lmrHatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="' + COL.coral + '"/><rect width="2" height="5" fill="#fff" fill-opacity=".38"/></pattern></defs>';
    s += zoneRects(c.zones, function (a) { return a <= a0 ? L : (a >= a1 ? R : X(a)); }, T - 3, B, 18);
    arr(c.yTicks).forEach(function (t) {
      s += '<line x1="' + L + '" y1="' + Y(t).toFixed(1) + '" x2="' + R + '" y2="' + Y(t).toFixed(1) + '" stroke="#fff" stroke-width="1.4"/><text x="' + (L - 12) + '" y="' + (Y(t) + 4).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-size="12" fill="' + COL.muted + '">' + money(t) + '</text>'; });
    var bw = Math.max(1.2, slot - 1.6);
    bars.forEach(function (b) {
      var x = XC(b.age) - bw / 2, y = B, hh;
      hh = (num(b.fromIncome) / c.yMax) * (B - T); if (hh > 0) { s += '<rect x="' + x.toFixed(1) + '" y="' + (y - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + COL.tealMid + '"/>'; y -= hh; }
      hh = (num(b.fromSavings) / c.yMax) * (B - T); if (hh > 0) { s += '<rect x="' + x.toFixed(1) + '" y="' + (y - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="' + COL.gold + '"/>'; y -= hh; }
      hh = (num(b.shortfall) / c.yMax) * (B - T); if (hh > 0) { s += '<rect x="' + x.toFixed(1) + '" y="' + (y - hh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + hh.toFixed(1) + '" fill="url(#lmrHatch)"/>'; }
    });
    if (c.stopMarker) {
      var sx = X(c.stopMarker.age);
      s += '<text x="' + (sx - 8).toFixed(1) + '" y="' + (Y(c.yMax * 0.64) - 10).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="12.5" fill="' + COL.navy + '">' + esc(c.stopMarker.label) + '</text>';
    }
    if (c.lastLabel) {
      var lb = bars[bars.length - 1], tot = num(lb.fromIncome) + num(lb.fromSavings) + num(lb.shortfall);
      s += '<text x="' + R + '" y="' + (Y(tot) - 9).toFixed(1) + '" text-anchor="end" font-family="Figtree,sans-serif" font-weight="800" font-size="12.5" fill="' + COL.navy + '">' + esc(c.lastLabel.label) + '</text>';
    }
    s += xTicks(a0, a1, X, B + 23, XC);
    return s + '</svg>';
  }
  function pCash(d, o, n, total) {
    var c = d.cashflow, s = c.savingsChart, p = c.paidChart;
    var body = titleBlock(c);
    body += '<div class="lmr-card"><div class="ct"><b>' + esc(s.title) + '</b><span class="lmr-muted" style="font-size:12px">' + esc(s.subtitle) + '</span></div>' + savingsSVG(s) + '<div class="cap">' + esc(s.caption) + '</div></div>';
    body += '<div class="lmr-card"><div class="ct"><b>' + esc(p.title) + '</b><span class="lmr-leg">' + arr(p.legend).map(function (l) {
      return '<span><i style="background:' + (l.tone === 'coral' ? COL.coral : fillOf(l.tone === 'good' ? 'teal' : l.tone)) + '"></i>' + esc(l.label) + '</span>'; }).join('') + '</span></div>' + paidSVG(p) + '<div class="cap">' + esc(p.caption) + '</div></div>';
    return frame(d, n, total, 'Cashflow', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 7 ----------
  function pScen(d, o, n, total) {
    var sc = d.scenarios;
    var big = esc(sc.fromPct) + '% <span style="color:' + COL.coralText + ';font-size:44px">→</span> ' + esc(sc.toPct) + '%';
    var tb = '<div class="lmr-tb"><div class="lmr-bn"><div class="lmr-bnum"><span style="color:' + textOf(sc.fromTone) + '">' + esc(sc.fromPct) + '%</span> <svg class="lmr-arrow" width="40" height="22" viewBox="0 0 40 22" aria-hidden="true"><path d="M2 11h33M26 3l9 8-9 8" stroke="' + COL.coralText + '" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg> <span style="color:' + textOf(sc.toTone) + '">' + esc(sc.toPct) + '%</span></div><div class="lmr-bl">retirement covered</div></div><div class="lmr-tx"><div class="lmr-ey">' + esc(sc.eyebrow) + '</div><h1 class="lmr-title">' + esc(sc.title) + '</h1></div></div>';
    var body = tb;
    if (arr(sc.groups).length) {
      body += '<div class="lmr-sc"><div class="hd"><span class="a">' + esc(sc.columns.what) + '</span><span class="b">' + esc(sc.columns.covered) + '</span><span class="c">' + esc(sc.columns.gap) + '</span></div>';
      sc.groups.forEach(function (g) {
        body += '<div class="gt">' + esc(g.title) + '</div>';
        arr(g.rows).forEach(function (r) {
          var pc = clamp(num(r.pct), 0, 100), tn = pctTone(pc);
          body += '<div class="lmr-sc"><div class="rw" style="display:flex"></div></div>'.slice(0, 0) +
            '<div class="rw"><div class="a"><b style="' + (r.emphasis ? 'color:' + COL.coralText : '') + '">' + esc(r.title) + '</b><span>' + esc(r.sub) + '</span></div>' +
            '<div class="bar"><i style="width:' + pc + '%;background:' + fillOf(tn) + '"></i></div><div class="p">' + pc + '%</div><div class="g">' + (r.gapStartsAge == null ? 'None' : esc(r.gapStartsAge)) + '</div></div>';
        });
      });
      body += '</div>';
    }
    if (sc.explore) body += '<div class="lmr-explore"><div class="t">' + esc(sc.explore.title) + '</div><div class="x">' + esc(sc.explore.text) + '</div></div>';
    if (has(sc.footnote)) body += '<div class="lmr-foot2">' + esc(sc.footnote) + '</div>';
    return frame(d, n, total, 'What could change the answer', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 8 ----------
  function pFound(d, o, n, total) {
    var f = d.foundations, lv = arr(f.levels).slice().sort(function (a, b) { return b.level - a.level; });
    var body = titleBlock(f);
    var sty = { good: [COL.tealTint, COL.tealMid, COL.teal], gold: [COL.goldTint, COL.gold, COL.goldText], coral: [COL.coralTint, COL.coral, COL.coralText], grey: [COL.bg, '#bdc4cd', COL.muted], blue: [COL.blueTint, COL.blue, COL.blueText], navy: [COL.bg, '#bdc4cd', COL.navy], teal: [COL.tealTint, COL.tealMid, COL.teal] };
    var wid = [58, 66, 74, 83, 91];
    var pyr = lv.map(function (l, i) {
      var st = sty[tone(l.tone)] || sty.grey, wi = wid[Math.min(4, Math.max(0, 5 - (lv.length - i)) + (5 - lv.length >= 0 ? 0 : 0))];
      wi = wid[Math.round(i * 4 / Math.max(1, lv.length - 1))];
      return '<div class="lmr-lv" style="width:' + wi + '%;background:' + st[0] + ';border-color:' + st[1] + '">' + circleIcon(l.icon, tone(l.tone) === 'grey' ? 'gold' : l.tone, 32, 20) +
        '<div><div class="t">' + esc(l.title) + '</div><div class="s" style="color:' + st[2] + '">' + esc(l.status) + '</div></div></div>'; }).join('');
    var pr = f.protection || {};
    body += '<div class="lmr-f1"><div class="lmr-pyr" role="img" aria-label="Five foundations from the bottom up">' + pyr + '</div><div class="lmr-prot"><div class="ph">' + photo(o, pr.photo, ALT[pr.photo]) + '</div><div class="pt">' + esc(pr.title) + '</div>' +
      arr(pr.rows).map(function (r) { var c = r.good === true ? COL.teal : (r.good === false ? COL.coralText : COL.navy); return '<div class="pr"><span>' + esc(r.label) + '</span><b style="color:' + c + '">' + esc(r.value) + '</b></div>'; }).join('') +
      (pr.nextBest ? '<div class="lmr-nb"><div class="e">' + esc(pr.nextBest.label) + '</div><div class="x">' + esc(pr.nextBest.text) + '</div></div>' : '') + '</div></div>';
    var pe = f.personality || {};
    body += '<div class="lmr-pers"><div class="ph">' + circleIcon(pe.icon, 'gold', 52, 26) + '<div><div class="lmr-ey" style="margin:0 0 3px">' + esc(pe.eyebrow) + '</div><div class="n">' + esc(pe.name) + '</div><div class="st">' + esc(pe.strap) + '</div></div></div>' +
      '<div class="lmr-quad">' + arr(pe.quadrants).map(function (q) { return '<div><div class="q">' + esc(q.label) + '</div><div class="v">' + esc(q.value) + '</div></div>'; }).join('') + '</div>';
    if (pe.riskScale) body += '<div class="lmr-risk">' + esc(pe.riskScale.title) + '<div class="lmr-scale">' + arr(pe.riskScale.labels).map(function (l, i) { return '<div' + (i === pe.riskScale.activeIndex ? ' class="on" aria-current="true"' : '') + '>' + esc(l) + '</div>'; }).join('') + '</div></div>';
    body += (has(pe.note) ? '<div class="nt">' + esc(pe.note) + '</div>' : '') + '</div>';
    return frame(d, n, total, 'Foundations and you', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 9 ----------
  function pNext(d, o, n, total) {
    var x = d.next, h = '<section class="lmr-pg" data-page="' + n + '" role="group" aria-label="Page ' + n + ' of ' + total + ': Share with an expert">';
    h += '<div class="lmr-n9"><div class="ph">' + photo(o, x.photo, ALT[x.photo]) + '</div><div class="tx"><div class="ey">' + esc(x.eyebrow) + '</div><h1 class="tt">' + esc(x.title) + '</h1><p class="ld">' + esc(x.lead) + '</p><span class="bt">' + esc(x.button) + '</span></div></div>';
    h += '<div class="lmr-rh"><span class="lmr-logo" style="color:#fff"><svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="' + COL.teal + '"/><path d="M8.2 16.4 14.6 7.8" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="14.9" cy="7.5" r="1.4" fill="#fff"/></svg><b>LifeMap</b></span><span class="lmr-rr" style="color:#cfd9e6">' + esc(d.meta.headerRight) + '</span></div>';
    h += '<div class="lmr-body lmr-body9" style="padding-top:0">';
    h += '<div class="lmr-steps">' + arr(x.steps).map(function (s) { return '<div><span class="n">' + esc(s.n) + '</span><div><div class="t">' + esc(s.title) + '</div><div class="x">' + esc(s.text) + '</div></div></div>'; }).join('') + '</div>';
    h += '<div class="lmr-two9"><div><div class="lmr-h3">' + esc(x.topics.title) + '</div><div class="lmr-tchips">' + arr(x.topics.chips).map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div></div>' +
      '<div><div class="lmr-h3">' + esc(x.checklist.title) + '</div>' + arr(x.checklist.items).map(function (c) { return '<div class="lmr-ck"><i></i><span>' + esc(c) + '</span></div>'; }).join('') + '</div></div>';
    h += '<div style="margin-top:30px"><div class="lmr-h3">' + esc(x.questions.title) + '</div><div class="lmr-qs">' + arr(x.questions.items).map(function (q) { return '<div>' + esc(typeof q === 'string' ? q : (q.q || q.text || '')) + '</div>'; }).join('') + '</div></div>';
    h += '<div class="lmr-sp"></div><div class="lmr-banner" style="margin-top:0"><div><div class="t">' + esc(x.ready.title) + '</div><div class="x">' + esc(x.ready.text) + '</div></div><span class="lmr-btn">' + esc(x.ready.button) + '</span></div>';
    h += '</div><div class="lmr-rf"><span>' + esc(d.footer.line) + '</span><span>' + n + ' / ' + total + '</span></div></section>';
    return h;
  }

  // ---------- page 10 ----------
  function asRows(list) {
    return arr(list).map(function (r) {
      var long = String(r[1]).length > 31;
      return '<div class="lmr-ar' + (long ? ' lg' : '') + '"><b class="k">' + esc(r[0]) + '</b><b class="v">' + esc(r[1]) + '</b></div>'; }).join('');
  }
  function pAssume(d, o, n, total) {
    var a = d.assumptions, body = titleBlock(a);
    body += '<div class="lmr-as"><div>' + asRows(a.left) + '</div><div>' + asRows(a.right) + '</div></div>';
    body += '<div class="lmr-two10"><div><div class="lmr-h3">' + esc(a.knownLimits.title) + '</div><ul>' + arr(a.knownLimits.items).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div>' +
      '<div><div class="lmr-h3">' + esc(a.pleaseNote.title) + '</div><p>' + esc(a.pleaseNote.text) + '</p></div></div>';
    if (has(a.sources)) body += '<div class="lmr-src">' + esc(a.sources) + '</div>';
    var gl = arr(a.glossary.items);
    if (gl.length) body += '<div style="margin-top:22px" class="lmr-h3">' + esc(a.glossary.title) + '</div><div class="lmr-gl">' + gl.map(function (g) { return '<div><b>' + esc(g[0]) + '</b><span>' + esc(g[1]) + '</span></div>'; }).join('') + '</div>';
    return frame(d, n, total, 'What your plan assumes', '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- page 11 (repeats) ----------
  function appRows(rows) {
    return rows.map(function (r) {
      var sf = num(r.shortfall) > 0;
      return '<tr><td>' + esc(r.age) + ' (' + esc(r.year) + ')</td><td class="' + (r.income ? '' : 'na') + '">' + numOrDash(r.income) + '</td><td class="' + (r.needs ? '' : 'na') + '">' + numOrDash(r.needs) + '</td><td class="' + (sf ? 'sf' : 'na') + '">' + numOrDash(r.shortfall) + '</td><td class="' + (r.savingsLeft ? '' : 'na') + '">' + numOrDash(r.savingsLeft) + '</td></tr>'; }).join('');
  }
  function appTable(cols, rows) {
    return '<table><thead><tr>' + cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + appRows(rows) + '</tbody></table>';
  }
  function pApp(d, o, n, total, chunk, idx, cnt) {
    var a = d.appendix, half = Math.ceil(chunk.length / 2), body = titleBlock(cnt > 1 ? { big: a.big, bigLabel: a.bigLabel, eyebrow: a.eyebrow, title: a.title + ' (' + (idx + 1) + ' of ' + cnt + ')' } : a);
    body += '<div class="lmr-ap"><div>' + appTable(a.columns, chunk.slice(0, 27)) + '</div><div>' + (chunk.length > 27 ? appTable(a.columns, chunk.slice(27)) : '') + '</div></div>';
    if (idx === cnt - 1 && has(a.note)) body += '<div class="lmr-src" style="margin-top:14px">' + esc(a.note) + '</div>';
    return frame(d, n, total, 'Appendix' + (cnt > 1 ? ' (' + (idx + 1) + ' of ' + cnt + ')' : ''), '<div class="lmr-body">' + body + '</div>');
  }

  // ---------- assemble ----------
  function reportPages(data, opts) {
    var o = opts || {}, d = data;
    if (!d || !d.meta) throw new Error('reportPages: data missing');
    var gp = goalPages(d, o), rows = arr(d.appendix.rows), ap = [];
    for (var i = 0; i < rows.length; i += 54) ap.push(rows.slice(i, i + 54));
    if (!ap.length) ap.push([]);
    var total = 6 + gp.length + 4 + ap.length - 0;
    // order: cover, plan, money, roadmap, goals..., cashflow, scenarios, foundations, next, assumptions, appendix...
    total = 4 + gp.length + 5 + ap.length;
    var pages = [], n = 1;
    pages.push(pCover(d, o, n++, total));
    pages.push(pPlan(d, o, n++, total));
    pages.push(pMoney(d, o, n++, total));
    pages.push(pRoadmap(d, o, n++, total));
    gp.forEach(function (pg, i) { pages.push(pGoals(d, o, n++, total, pg, i, gp.length)); });
    pages.push(pCash(d, o, n++, total));
    pages.push(pScen(d, o, n++, total));
    pages.push(pFound(d, o, n++, total));
    pages.push(pNext(d, o, n++, total));
    pages.push(pAssume(d, o, n++, total));
    ap.forEach(function (ch, i) { pages.push(pApp(d, o, n++, total, ch, i, ap.length)); });
    return { css: CSS, pages: pages, count: pages.length, schemaVersion: VERSION };
  }

  var FONT_LINK = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400..800&display=swap" rel="stylesheet">';
  function reportDocument(data, opts) {
    var r = reportPages(data, opts);
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>' + esc(data.meta.headerRight) + '</title><meta name="viewport" content="width=device-width,initial-scale=1">' + FONT_LINK +
      '<style>html,body{margin:0;background:#e9edf1}.lmr-doc{display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px 0}@media print{html,body{background:#fff}.lmr-doc{display:block;padding:0;gap:0}}' + r.css + '</style></head><body><main class="lmr-doc">' + r.pages.join('\n') + '</main></body></html>';
  }

  return { reportPages: reportPages, reportDocument: reportDocument, VERSION: VERSION, PAGE: { w: W, h: H } };
});
