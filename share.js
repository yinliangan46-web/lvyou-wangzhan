/* ============================================================
 * MYL 分享中心 · 海报生成 v2（真实图片大片版）
 * 三种模式：spot 目的地种草卡（3 种风格）/ footprint 足迹战绩 / plan 行程路书
 * 全部海报以目的地真实图片为核心画面，纯前端 Canvas，无外部依赖
 * ============================================================ */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  var canvas = $('poster');
  var ctx = canvas.getContext('2d');
  var currentMode = 'spot';
  var currentStyle = (new URLSearchParams(location.search).get('style')) || 'cover';
  var params = new URLSearchParams(location.search);
  var W = 1080, H = 1620;

  function ready() {
    if (document.fonts && document.fonts.ready) return document.fonts.ready;
    return Promise.resolve();
  }

  /* ---------- 图片解析与加载 ---------- */
  function loadImg(src, timeout) {
    return new Promise(function (res) {
      if (!src) { res(null); return; }
      var img = new Image();
      if (String(src).indexOf('http') === 0) img.crossOrigin = 'anonymous';
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; res(null); } }, timeout || 7000);
      img.onload = function () { if (!done) { done = true; clearTimeout(t); res(img); } };
      img.onerror = function () { if (!done) { done = true; clearTimeout(t); res(null); } };
      img.src = src;
    });
  }
  /* 景点/城市真实图片候选链：景点精确图 → 城市实拍 → 站内兜底 */
  function spotImgCandidates(spot, city) {
    var list = [];
    var poi = window.mylPOIImg || function () { return ''; };
    function push(s) { if (s && list.indexOf(s) < 0) list.push(s); }
    push(poi(String(spot || ''), 'spot', city));
    if (city) {
      push(poi(String(city), 'spot', city));           /* 城市实拍 images/cities/xx.jpg */
      push(poi(String(city) + '城市风光', 'spot', city));
      push('images/city-fallback.jpg');
    } else {
      push('images/city-fallback.jpg');
    }
    return list;
  }
  /* 依次尝试直到加载成功一张 */
  function loadFirst(cands) {
    var i = 0;
    function tryNext() {
      if (i >= cands.length) return Promise.resolve(null);
      return loadImg(cands[i++]).then(function (img) { return img || tryNext(); });
    }
    return tryNext();
  }
  function loadMulti(cands, n) {
    var out = [], seen = {}, i = 0;
    function next() {
      if (i >= cands.length || out.length >= n) return Promise.resolve(out);
      return loadImg(cands[i++]).then(function (im) {
        if (im && !seen[im.src]) { seen[im.src] = 1; out.push(im); }
        return next();
      });
    }
    return next();
  }
  /* 城市实拍候选链：城市本地图 → 城市风光/街景/天际线（落城市池）→ 站内兜底 */
  function cityImgCandidates(city) {
    var list = [];
    var poi = window.mylPOIImg || function () { return ''; };
    function push(s) { if (s && list.indexOf(s) < 0) list.push(s); }
    if (city) {
      push(poi(String(city), 'spot', city));
      push(poi(String(city) + '城市', 'spot', city));
      push(poi(String(city) + '街景', 'spot', city));
      push(poi(String(city) + '天际线', 'spot', city));
      push('images/city-fallback.jpg');
    } else {
      push('images/city-fallback.jpg');
    }
    return list;
  }
  /* 从路书标题里解析城市名 → 城市图 */
  function cityFromTitle(title) {
    var names = [];
    try {
      if (window.MYL && window.MYL.indexCities) {
        window.MYL.indexCities().forEach(function (c) { names.push(typeof c === 'string' ? c : (c.name || '')); });
      }
    } catch (e) {}
    var t = String(title || '');
    for (var i = 0; i < names.length; i++) {
      if (names[i] && t.indexOf(names[i]) >= 0) return names[i];
    }
    var m = t.match(/([\u4e00-\u9fa5]{2,4})(?=\s*·|\s*\d|\s*$)/);
    return m ? m[1] : '';
  }

  /* ---------- 绘制工具 ---------- */
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }
  /* cover 裁剪绘制：photo 铺满目标区域（可整体调焦/缩放） */
  function drawCover(c, img, x, y, w, h, opts) {
    opts = opts || {};
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var scale = Math.max(w / iw, h / ih) * (opts.zoom || 1);
    var dw = iw * scale, dh = ih * scale;
    var dx = x - (dw - w) / 2, dy = y - (dh - h) * (opts.focusY != null ? opts.focusY : 0.5);
    c.drawImage(img, dx, dy, dw, dh);
  }
  function photoCard(c, img, x, y, w, h, r, rot, cap) {
    c.save();
    c.translate(x + w / 2, y + h / 2);
    if (rot) c.rotate(rot * Math.PI / 180);
    c.shadowColor = 'rgba(0,0,0,.30)';
    c.shadowBlur = 36;
    c.shadowOffsetY = 14;
    c.fillStyle = '#fff';
    roundRect(c, -w / 2, -h / 2, w, h, r);
    c.fill();
    c.shadowColor = 'transparent';
    c.save();
    roundRect(c, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20 - (cap ? 56 : 0), r * 0.8);
    c.clip();
    drawCover(c, img, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20 - (cap ? 56 : 0));
    c.restore();
    if (cap) {
      c.fillStyle = '#3a4653';
      c.font = '500 26px "Noto Sans SC"';
      c.textAlign = 'center';
      c.fillText(cap, 0, h / 2 - 18);
      c.textAlign = 'left';
    }
    c.restore();
  }
  function wrapText(c, text, x, y, maxW, lineH, maxLines) {
    var lines = [];
    String(text || '').split(/\n/).forEach(function (seg) {
      var cur = '';
      for (var i = 0; i < seg.length; i++) {
        if (c.measureText(cur + seg[i]).width > maxW) {
          lines.push(cur); cur = seg[i];
          if (lines.length >= (maxLines || 99) - 1) { cur += '…'; break; }
        } else cur += seg[i];
      }
      lines.push(cur);
    });
    lines.slice(0, maxLines || 99).forEach(function (l, i) {
      c.fillText(l, x, y + i * lineH);
    });
    return lines.length;
  }
  function brand(c, light) {
    c.textAlign = 'left';
    c.fillStyle = light ? 'rgba(255,255,255,.92)' : '#3a4653';
    c.font = '600 30px "Noto Sans SC"';
    c.fillText('MYL 旅行 · 分享', 64, 1596);
    c.fillStyle = light ? 'rgba(255,255,255,.55)' : '#9aa4ae';
    c.font = '400 24px "Noto Sans SC"';
    c.fillText('发现世界之美 · myl travel', 330, 1596);
  }
  function dateStr() {
    var d = new Date();
    return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
  }
  function chip(c, text, x, y, opts) {
    opts = opts || {};
    c.font = opts.font || '600 30px "Noto Sans SC"';
    var w = c.measureText(text).width + 44;
    var h = opts.h || 56;
    c.fillStyle = opts.bg || 'rgba(255,255,255,.22)';
    roundRect(c, x, y, w, h, h / 2);
    c.fill();
    if (opts.stroke) { c.strokeStyle = opts.stroke; c.lineWidth = 1.5; roundRect(c, x, y, w, h, h / 2); c.stroke(); }
    c.fillStyle = opts.color || '#fff';
    c.textBaseline = 'middle';
    c.fillText(text, x + 22, y + h / 2 + 2);
    c.textBaseline = 'alphabetic';
    return w;
  }

  /* ---------- 年轻化涂鸦工具 ---------- */
  var PAL = { yellow: '#FFD23F', coral: '#FF5E7E', pink: '#FF8FB1', mint: '#3FBF9F', sky: '#4FA8E8', purple: '#8B7CF6', ink: '#1E2430', cream: '#FFF8EC', orange: '#FF8A3D' };

  /* 波点满铺背景 */
  function dotBg(c, gap, color, alpha) {
    c.save();
    c.globalAlpha = alpha == null ? 0.12 : alpha;
    c.fillStyle = color;
    for (var x = gap / 2; x < W; x += gap) {
      for (var y = gap / 2; y < H; y += gap) {
        c.beginPath(); c.arc(x, y, gap * 0.09, 0, Math.PI * 2); c.fill();
      }
    }
    c.restore();
  }
  /* 五角星涂鸦 */
  function star(c, x, y, r, color, rot) {
    c.save(); c.translate(x, y); c.rotate((rot || 0) * Math.PI / 180);
    c.beginPath();
    for (var i = 0; i < 10; i++) {
      var rr = i % 2 === 0 ? r : r * 0.45;
      var a = -Math.PI / 2 + i * Math.PI / 5;
      c[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath(); c.fillStyle = color; c.fill(); c.restore();
  }
  /* 爱心涂鸦 */
  function heart(c, x, y, s, color) {
    c.save(); c.translate(x, y); c.scale(s / 30, s / 30);
    c.beginPath();
    c.moveTo(0, 10);
    c.bezierCurveTo(-22, -8, -10, -24, 0, -10);
    c.bezierCurveTo(10, -24, 22, -8, 0, 10);
    c.closePath(); c.fillStyle = color; c.fill(); c.restore();
  }
  /* 小太阳（圆 + 射线） */
  function sun(c, x, y, R, color) {
    c.save(); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.arc(x, y, R, 0, Math.PI * 2); c.fill();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4;
      c.beginPath();
      c.moveTo(x + Math.cos(a) * (R + 6), y + Math.sin(a) * (R + 6));
      c.lineTo(x + Math.cos(a) * (R + 18), y + Math.sin(a) * (R + 18));
      c.stroke();
    }
    c.restore();
  }
  /* 定位水滴标 */
  function pin(c, x, y, s, color) {
    c.save(); c.translate(x, y); c.scale(s / 40, s / 40);
    c.beginPath();
    c.moveTo(0, 26);
    c.bezierCurveTo(-18, 4, -16, -16, 0, -16);
    c.bezierCurveTo(16, -16, 18, 4, 0, 26);
    c.closePath(); c.fillStyle = color; c.fill();
    c.beginPath(); c.arc(0, -4, 6, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill();
    c.restore();
  }
  /* 手绘波浪下划线 */
  function squiggle(c, x, y, w, color, amp) {
    c.save(); c.strokeStyle = color; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath();
    var n = Math.max(4, Math.round(w / 26));
    for (var i = 0; i <= n; i++) {
      var px = x + w * i / n, py = y + (i % 2 === 0 ? -amp : amp);
      i === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
    }
    c.stroke(); c.restore();
  }
  /* 胶带条 */
  function tape(c, x, y, w, rot, color, alpha) {
    c.save(); c.translate(x, y); c.rotate((rot || 0) * Math.PI / 180);
    c.globalAlpha = alpha == null ? 0.8 : alpha;
    c.fillStyle = color;
    c.fillRect(-w / 2, -18, w, 36);
    c.globalAlpha = 0.25; c.fillStyle = '#fff';
    c.fillRect(-w / 2, -18, w, 12);
    c.restore();
  }
  /* 荧光笔高亮底（略歪斜的半透明色块） */
  function hlBlock(c, x, y, w, h, color, rot) {
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((rot || -1.5) * Math.PI / 180);
    c.globalAlpha = 0.85; c.fillStyle = color;
    roundRect(c, -w / 2, -h / 2, w, h, h * 0.3); c.fill();
    c.restore();
  }
  /* 粗描边大字：先描边再填充 */
  function outlineText(c, text, x, y, size, fill, stroke, lineW, align) {
    c.save();
    c.font = '800 ' + size + 'px "Noto Sans SC", sans-serif';
    c.textAlign = align || 'left'; c.lineJoin = 'round';
    c.lineWidth = lineW || 10; c.strokeStyle = stroke || PAL.ink;
    c.strokeText(text, x, y);
    c.fillStyle = fill || '#fff'; c.fillText(text, x, y);
    c.restore();
  }
  /* 圆形贴纸印章 */
  function stampCircle(c, x, y, r, t1, t2, color) {
    c.save(); c.translate(x, y); c.rotate(8 * Math.PI / 180);
    c.fillStyle = color; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.setLineDash([8, 6]);
    c.beginPath(); c.arc(0, 0, r - 8, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#fff'; c.textAlign = 'center';
    c.font = '800 ' + Math.round(r * 0.5) + 'px "Noto Sans SC"';
    c.fillText(t1, 0, t2 ? -4 : 8);
    if (t2) { c.font = '600 ' + Math.round(r * 0.28) + 'px "Noto Sans SC"'; c.fillText(t2, 0, r * 0.42); }
    c.restore();
  }
  /* 便签纸（微旋转 + 阴影 + 顶部胶条） */
  function note(c, x, y, w, h, rot, bg) {
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate((rot || 0) * Math.PI / 180);
    c.shadowColor = 'rgba(60,40,20,.25)'; c.shadowBlur = 22; c.shadowOffsetY = 10;
    c.fillStyle = bg || '#fff'; roundRect(c, -w / 2, -h / 2, w, h, 14); c.fill();
    c.shadowColor = 'transparent';
    c.globalAlpha = 0.5; c.fillStyle = PAL.yellow; c.fillRect(-w / 2 + 24, -h / 2, w - 48, 18);
    c.restore();
  }
  /* 一排 hashtag 小胶囊，返回总宽 */
  function hashTags(c, arr, x, y, opts) {
    opts = opts || {};
    c.font = opts.font || '600 26px "Noto Sans SC"';
    var gap = 18, cx = x, h = opts.h || 46;
    arr.forEach(function (t) {
      if (!t) return;
      var w = c.measureText(t).width + 34;
      c.fillStyle = opts.bg || 'rgba(255,255,255,.16)';
      roundRect(c, cx, y, w, h, h / 2); c.fill();
      if (opts.stroke) { c.strokeStyle = opts.stroke; c.lineWidth = 1.5; roundRect(c, cx, y, w, h, h / 2); c.stroke(); }
      c.fillStyle = opts.color || '#fff';
      c.textBaseline = 'middle'; c.fillText(t, cx + 17, y + h / 2 + 2); c.textBaseline = 'alphabetic';
      cx += w + gap;
    });
    return cx - x;
  }
  /* 手绘对勾 */
  function checkMark(c, x, y, s, color) {
    c.save(); c.strokeStyle = color; c.lineWidth = Math.max(4, s * 0.16); c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.35, y + s * 0.38); c.lineTo(x + s, y - s * 0.3); c.stroke();
    c.restore();
  }
  /* hashtag 标签集合：城市 + 通用话题 */
  function tagSet(o) {
    var arr = [];
    if (o.city) arr.push('#' + o.city);
    arr.push('#旅行日记', '#目的地打卡');
    return arr;
  }

  /* ---------- 风格 1：封面大片 · 潮流撞色 ---------- */
  function drawCoverStyle(o, img) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, W, H);
    if (img) {
      ctx.save();
      drawCover(ctx, img, 0, -30, W, H + 60, { zoom: 1.08, focusY: 0.42 });
      ctx.restore();
    } else {
      var g0 = ctx.createLinearGradient(0, 0, W, H);
      g0.addColorStop(0, PAL.sky); g0.addColorStop(0.5, PAL.coral); g0.addColorStop(1, PAL.purple);
      ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
    }
    /* 压暗渐变：上浅下深，保证文字可读 */
    var g1 = ctx.createLinearGradient(0, 0, 0, H);
    g1.addColorStop(0, 'rgba(0,0,0,.38)');
    g1.addColorStop(0.35, 'rgba(0,0,0,.08)');
    g1.addColorStop(0.62, 'rgba(0,0,0,.32)');
    g1.addColorStop(1, 'rgba(0,0,0,.80)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    /* 撞色几何色块 */
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath(); ctx.arc(W - 110, 340, 128, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PAL.coral;
    ctx.beginPath(); ctx.moveTo(-60, H - 360); ctx.lineTo(360, H - 120); ctx.lineTo(-60, H - 40); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.mint;
    ctx.beginPath(); ctx.arc(120, 430, 56, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    /* 涂鸦点缀 */
    star(ctx, W - 200, 150, 34, PAL.yellow, 12);
    heart(ctx, 150, 300, 34, PAL.coral);
    sun(ctx, W - 180, 560, 30, PAL.yellow);
    star(ctx, 90, 620, 24, '#fff', -10);
    checkMark(ctx, W - 150, 316, 42, '#fff');

    /* 顶部刊头 */
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = '700 28px "Noto Sans SC"';
    ctx.fillText('📍 我的目的地种草', 64, 120);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.font = '600 24px "Noto Sans SC"';
    ctx.fillText('TRAVEL DIARY', 64, 158);
    squiggle(ctx, 64, 174, 220, PAL.yellow, 5);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.font = '500 26px "Noto Sans SC"';
    ctx.fillText(dateStr(), W - 64, 120);
    ctx.textAlign = 'left';

    /* 城市徽章（撞色胶囊） */
    if (o.city) {
      pin(ctx, 96, 980, 34, PAL.yellow);
      chip(ctx, o.city, 124, 956, { bg: PAL.coral, color: '#fff', h: 60, font: '700 30px "Noto Sans SC"' });
    }

    /* 主标题：荧光高亮底 + 描边大字 */
    var title = o.spot || '未知目的地';
    var tSize = String(title).length > 6 ? 84 : 104;
    ctx.font = '800 ' + tSize + 'px "Noto Sans SC", sans-serif';
    if (ctx.measureText(title).width > W - 128) tSize = 72;
    var tw = ctx.measureText(title).width;
    hlBlock(ctx, 64, 1006, Math.min(tw + 50, W - 128), 110, PAL.yellow, -1.5);
    outlineText(ctx, title, 64, 1098, tSize, '#fff', PAL.ink, 12);

    /* 白色信息卡：动态高度，正文与票券分行留足间距 */
    var cardY = 1150;
    ctx.fillStyle = PAL.ink;
    ctx.font = '500 34px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 104, 1218, 860, 58, 2);
    var descBottom = 1218 + used * 58;
    var ticketY = descBottom + 24;
    var cardH = o.ticket ? (ticketY + 58 + 30 - cardY) : (descBottom + 30 - cardY);
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    roundRect(ctx, 64, cardY, W - 128, cardH, 28);
    ctx.fill();
    ctx.fillStyle = PAL.ink;
    ctx.font = '500 34px "Noto Sans SC"';
    wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 104, 1218, 860, 58, 2);
    if (o.ticket) {
      ctx.fillStyle = PAL.orange;
      var tw2 = ctx.measureText('🎫 ' + o.ticket).width + 48;
      roundRect(ctx, 104, ticketY, Math.min(tw2, 860), 58, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '600 28px "Noto Sans SC"';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎫 ' + o.ticket.slice(0, 26), 128, ticketY + 29);
      ctx.textBaseline = 'alphabetic';
    }

    /* 底部 slogan */
    ctx.fillStyle = '#fff';
    ctx.font = '800 42px "Noto Sans SC"';
    ctx.fillText('这个假期，一起去看看？', 64, 1500);
    ctx.fillStyle = PAL.yellow;
    ctx.font = '700 28px "Noto Sans SC"';
    ctx.fillText("LET'S GO ✈", 64, 1544);
    brand(ctx, true);
  }

  /* ---------- 风格 2：杂志画报 · 年轻编辑拼贴 ---------- */
  function drawMagazine(o, img) {
    ctx.clearRect(0, 0, W, H);
    /* 暖白纸底 + 波点 */
    var gp = ctx.createLinearGradient(0, 0, 0, H);
    gp.addColorStop(0, '#FFF8EC'); gp.addColorStop(1, '#FCEFE0');
    ctx.fillStyle = gp;
    ctx.fillRect(0, 0, W, H);
    dotBg(ctx, 58, PAL.orange, 0.10);

    /* 背景超大英文水印 */
    ctx.save();
    ctx.fillStyle = 'rgba(20,36,48,.06)';
    ctx.font = '900 220px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TRAVEL', W / 2, H - 120);
    ctx.restore();

    /* 上部倾斜白边相纸 */
    var ph = 740;
    ctx.save();
    ctx.translate(W / 2, ph / 2 + 20);
    ctx.rotate(-2.2 * Math.PI / 180);
    ctx.shadowColor = 'rgba(40,30,20,.30)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#fff';
    roundRect(ctx, -W / 2 + 24, -ph / 2, W - 48, ph, 22);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    if (img) {
      ctx.save();
      roundRect(ctx, -W / 2 + 44, -ph / 2 + 20, W - 88, ph - 40, 14);
      ctx.clip();
      drawCover(ctx, img, -W / 2 + 44, -ph / 2 + 20, W - 88, ph - 40, { zoom: 1.06, focusY: 0.45 });
      ctx.restore();
    } else {
      ctx.fillStyle = PAL.coral;
      roundRect(ctx, -W / 2 + 44, -ph / 2 + 20, W - 88, ph - 40, 14);
      ctx.fill();
    }
    ctx.restore();

    /* 图底渐变 + 标题压图 */
    var g1 = ctx.createLinearGradient(0, ph - 300, 0, ph + 20);
    g1.addColorStop(0, 'rgba(0,0,0,0)');
    g1.addColorStop(1, 'rgba(0,0,0,.62)');
    ctx.save();
    ctx.beginPath(); ctx.rect(0, ph - 300, W, 320); ctx.clip();
    ctx.fillStyle = g1; ctx.fillRect(0, ph - 300, W, 320);
    ctx.restore();

    /* 刊头 */
    ctx.fillStyle = '#fff';
    ctx.font = '700 28px "Noto Sans SC"';
    ctx.fillText('MYL 旅行画报', 64, 92);
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.font = '600 24px "Noto Sans SC"';
    ctx.fillText('PIC OF THE CITY', 64, 126);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.font = '500 26px "Noto Sans SC"';
    ctx.fillText('Vol.' + (new Date().getMonth() + 1) + ' · ' + dateStr(), W - 64, 92);
    ctx.textAlign = 'left';

    /* 圆形贴纸印章 */
    stampCircle(ctx, W - 168, 236, 84, '种草', 'HOT', PAL.coral);

    /* 压图标题 */
    var title = o.spot || '未知目的地';
    var mSize = String(title).length > 6 ? 80 : 98;
    ctx.font = '800 ' + mSize + 'px "Noto Sans SC", sans-serif';
    if (ctx.measureText(title).width > W - 128) mSize = 72;
    outlineText(ctx, title, 64, ph - 96, mSize, '#fff', 'rgba(0,0,0,.55)', 8);
    if (o.city) {
      chip(ctx, '📍 ' + o.city + ' · 实景直击', 64, ph - 56, { bg: PAL.yellow, color: PAL.ink, h: 54, font: '700 28px "Noto Sans SC"' });
    }

    /* 下部编辑排版：栏目编号 + 正文（编号行不重复正文） */
    var by = ph + 72;
    tape(ctx, 200, by - 18, 180, -6, PAL.yellow, 0.8);
    ctx.fillStyle = PAL.purple;
    ctx.font = '800 34px "Noto Sans SC"';
    ctx.fillText('01', 64, by + 20);
    ctx.fillStyle = PAL.ink;
    ctx.font = '700 32px "Noto Serif SC"';
    ctx.fillText('城市直击 · CITY GUIDE', 130, by + 20);
    ctx.fillStyle = '#4a5561';
    ctx.font = '400 32px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 64, by + 74, 952, 56, 3);
    var ty = by + 74 + used * 56 + 28;

    if (o.ticket) {
      /* 虚线撕边票券 */
      var tkw = Math.min(ctx.measureText('🎫 ' + o.ticket).width + 56, 952);
      ctx.fillStyle = PAL.mint;
      roundRect(ctx, 64, ty, tkw, 64, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      roundRect(ctx, 64, ty, tkw, 64, 14);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.font = '700 28px "Noto Sans SC"';
      ctx.fillText('🎫 ' + o.ticket.slice(0, 24), 92, ty + 34);
      ctx.textBaseline = 'alphabetic';
      ty += 96;
    }
    /* 装饰：星星 + 虚线分隔 */
    star(ctx, W - 110, ty + 20, 26, PAL.coral, 8);
    ctx.strokeStyle = '#d9cdb6';
    ctx.lineWidth = 2; ctx.setLineDash([12, 10]);
    ctx.beginPath(); ctx.moveTo(64, ty + 24); ctx.lineTo(W - 64, ty + 24); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#8a7f6d';
    ctx.font = '500 28px "Noto Sans SC"';
    ctx.fillText('完整攻略 · 实时天气 · 地图导航，尽在 MYL 旅行', 64, ty + 72);
    hashTags(ctx, tagSet(o), 64, ty + 112, { bg: 'rgba(139,124,246,.12)', stroke: 'rgba(139,124,246,.35)', color: PAL.purple, h: 46 });
    brand(ctx, false);
  }

  /* ---------- 风格 3：拍立得拼贴 ---------- */
  function drawCollage(o, imgs) {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#fdf1e3'); g.addColorStop(0.55, '#fde7ef'); g.addColorStop(1, '#ece7fb');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    dotBg(ctx, 56, PAL.purple, 0.10);
    /* 撕纸色块 */
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = PAL.yellow;
    ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(260, 260); ctx.lineTo(220, 420); ctx.lineTo(0, 460); ctx.closePath(); ctx.fill();
    ctx.fillStyle = PAL.mint;
    ctx.beginPath(); ctx.moveTo(W, 1080); ctx.lineTo(W - 240, 1040); ctx.lineTo(W - 200, 1200); ctx.lineTo(W, 1240); ctx.closePath(); ctx.fill();
    ctx.restore();

    /* 顶部刊头 */
    ctx.fillStyle = '#3a4653';
    ctx.font = '700 32px "Noto Sans SC"';
    ctx.fillText('📍 我的目的地种草', 64, 120);
    ctx.fillStyle = '#9aa4ae';
    ctx.font = '600 24px "Noto Sans SC"';
    ctx.fillText('PLOG · TRAVEL DIARY', 64, 156);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9aa4ae';
    ctx.font = '500 26px "Noto Sans SC"';
    ctx.fillText(dateStr(), W - 64, 120);
    ctx.textAlign = 'left';

    /* 标题：高亮底 + 描边大字 */
    var title = o.spot || '未知目的地';
    var cSize = String(title).length > 6 ? 84 : 96;
    ctx.font = '800 ' + cSize + 'px "Noto Sans SC", sans-serif';
    if (ctx.measureText(title).width > W - 128) cSize = 70;
    var cw = ctx.measureText(title).width;
    hlBlock(ctx, 64, 176, Math.min(cw + 46, W - 128), 104, PAL.yellow, -1.5);
    outlineText(ctx, title, 64, 262, cSize, PAL.ink, '#fff', 6);
    var cityW = o.city ? chip(ctx, '📍 ' + o.city, 66, 292, { bg: PAL.coral, color: '#fff', h: 54, font: '700 28px "Noto Sans SC"' }) : 0;
    chip(ctx, '#出片打卡', 66 + cityW + 18, 292, { bg: PAL.mint, color: '#fff', h: 54, font: '700 28px "Noto Sans SC"' });

    /* 三张拍立得：主图居左，两张城市副图居右上下排布 */
    var main = imgs[0] || null, s1 = imgs[1] || null, s2 = imgs[2] || null;
    if (main) photoCard(ctx, main, 80, 370, 560, 540, 10, -3, (o.spot || '') + ' · 实拍');
    if (s1) photoCard(ctx, s1, 580, 400, 380, 380, 10, 4, (o.city || '') + ' · 城市漫游');
    if (s2) photoCard(ctx, s2, 560, 820, 380, 360, 10, -2, (o.city || '') + ' · 街角');

    /* 彩色胶带 */
    tape(ctx, 300, 356, 150, -14, PAL.yellow, 0.85);
    tape(ctx, 760, 388, 130, 8, PAL.mint, 0.8);
    tape(ctx, 740, 808, 130, -6, PAL.coral, 0.8);

    /* 手写便签（左下留白处） */
    note(ctx, 120, 980, 300, 150, -4, '#FFFDF4');
    ctx.fillStyle = PAL.coral;
    ctx.font = '800 34px "Noto Sans SC"';
    ctx.textAlign = 'center';
    ctx.fillText('must go!', 270, 1052);
    ctx.fillStyle = '#4a5561';
    ctx.font = '500 24px "Noto Sans SC"';
    ctx.fillText('出片率超高 ✨', 270, 1092);
    ctx.textAlign = 'left';
    checkMark(ctx, 430, 1046, 30, PAL.mint);

    /* 涂鸦环绕 */
    heart(ctx, 110, 880, 32, PAL.coral);
    star(ctx, W - 96, 470, 30, PAL.yellow, 12);
    sun(ctx, 120, 1180, 26, PAL.orange);
    star(ctx, 500, 1150, 22, PAL.purple, -8);
    heart(ctx, W - 120, 1200, 26, PAL.pink);
    /* 手绘箭头指向主图 */
    ctx.strokeStyle = PAL.coral; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(520, 560); ctx.quadraticCurveTo(460, 520, 410, 490); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(410, 490); ctx.lineTo(440, 490); ctx.moveTo(410, 490); ctx.lineTo(426, 516); ctx.stroke();

    /* 圆形日期戳（文案卡上方右侧，不压相纸与卡片） */
    stampCircle(ctx, W - 130, 1196, 54, dateStr(), 'PLOG', PAL.ink);

    /* 文案便签卡（虚线边框） */
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    roundRect(ctx, 64, 1250, W - 128, 150, 24);
    ctx.fill();
    ctx.strokeStyle = PAL.coral; ctx.lineWidth = 2.5; ctx.setLineDash([14, 10]);
    roundRect(ctx, 64, 1250, W - 128, 150, 24);
    ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#4a5561';
    ctx.font = '400 30px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 96, 1306, 820, 46, 2);
    if (o.ticket && used < 2) {
      ctx.fillStyle = '#8a94a0';
      ctx.font = '400 26px "Noto Sans SC"';
      ctx.fillText('🎫 ' + o.ticket.slice(0, 30), 96, 1306 + used * 46 + 12);
    }
    hashTags(ctx, tagSet(o), 64, 1440, { bg: 'rgba(255,255,255,.92)', stroke: 'rgba(255,143,177,.45)', color: PAL.coral, h: 44 });
    brand(ctx, false);
  }

  /* ---------- 海报：足迹战绩（照片胶片带版） ---------- */
  function drawFootprint(st, imgs) {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16283f'); g.addColorStop(0.55, '#28527f'); g.addColorStop(1, '#3fa796');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    var g2 = ctx.createRadialGradient(W - 120, 140, 30, W - 120, 140, 480);
    g2.addColorStop(0, 'rgba(255,255,255,.22)'); g2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, 700);

    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.font = '600 30px "Noto Sans SC"';
    ctx.fillText('🧭 我的旅行足迹 · 战绩', 64, 128);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.font = '400 26px "Noto Sans SC"';
    ctx.fillText(dateStr(), W - 64, 128);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#fff';
    ctx.font = '700 78px "Noto Serif SC"';
    ctx.fillText('去过 ' + st.cities + ' 座城', 64, 262);
    ctx.font = '500 38px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText('盖下 ' + st.spots + ' 枚印记，种草 ' + st.wishes + ' 个心愿', 64, 330);

    /* 城市照片胶片带 */
    if (imgs.length) {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      roundRect(ctx, 40, 420, W - 80, 420, 24);
      ctx.fill();
      var n = Math.min(imgs.length, 4);
      var cw = (W - 160 - (n - 1) * 24) / n;
      imgs.slice(0, n).forEach(function (im, i) {
        var x = 80 + i * (cw + 24), y = 450;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#fff';
        roundRect(ctx, x, y, cw, 300, 12);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.save();
        roundRect(ctx, x + 8, y + 8, cw - 16, 240, 8);
        ctx.clip();
        drawCover(ctx, im, x + 8, y + 8, cw - 16, 240);
        ctx.restore();
        ctx.fillStyle = '#3a4653';
        ctx.font = '600 24px "Noto Sans SC"';
        ctx.textAlign = 'center';
        var nm = (st.cityList && st.cityList[i]) || '足迹 ' + (i + 1);
        ctx.fillText(nm.slice(0, 6), x + cw / 2, y + 282);
        ctx.textAlign = 'left';
        ctx.restore();
      });
    }

    /* 数字卡片 */
    var cy = imgs.length ? 900 : 430;
    var cards = [
      [st.cities, '城市'], [st.spots, '打卡印记'], [st.wishes, '心愿单'], [st.days, '累计期待天数']
    ];
    cards.forEach(function (it, i) {
      var x = 64 + (i % 2) * 496, y = cy + Math.floor(i / 2) * 220;
      ctx.fillStyle = 'rgba(255,255,255,.13)';
      roundRect(ctx, x, y, 456, 190, 24);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 76px "Noto Serif SC"';
      ctx.fillText(String(it[0]), x + 40, y + 100);
      ctx.fillStyle = 'rgba(255,255,255,.72)';
      ctx.font = '400 30px "Noto Sans SC"';
      ctx.fillText(it[1], x + 40, y + 152);
    });

    var fy = cy + 2 * 220 + 70;
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '700 44px "Noto Sans SC"';
    ctx.fillText(st.cities > 0 ? '下一站，继续把地图点亮 ✨' : '从第一枚印记开始 🧳', 64, fy);
    if (st.cityList && st.cityList.length) {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = '400 29px "Noto Sans SC"';
      wrapText(ctx, '足迹：' + st.cityList.join(' · '), 64, fy + 64, 950, 44, 3);
    }
    brand(ctx, true);
  }

  /* ---------- 海报：行程路书（目的地横幅大图版） ---------- */
  function drawPlan(o, img) {
    o.city = o.cityName;
    ctx.clearRect(0, 0, W, H);
    /* 奶油纸面底 + 波点 */
    var gp = ctx.createLinearGradient(0, 0, 0, H);
    gp.addColorStop(0, '#FFF8EC'); gp.addColorStop(1, '#FCEFE0');
    ctx.fillStyle = gp; ctx.fillRect(0, 0, W, H);
    dotBg(ctx, 64, PAL.orange, 0.08);

    var ph = 460;
    /* 城市实景图 */
    if (img) {
      ctx.save(); drawCover(ctx, img, 0, 0, W, ph, { zoom: 1.06, focusY: 0.45 }); ctx.restore();
    } else {
      var g0 = ctx.createLinearGradient(0, 0, W, ph);
      g0.addColorStop(0, '#0f4c5c'); g0.addColorStop(1, '#76b5a8');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, W, ph);
    }
    var g1 = ctx.createLinearGradient(0, ph - 300, 0, ph + 10);
    g1.addColorStop(0, 'rgba(0,0,0,0)');
    g1.addColorStop(1, 'rgba(0,0,0,.72)');
    ctx.fillStyle = g1; ctx.fillRect(0, ph - 300, W, 310);

    /* 刊头 */
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '600 28px "Noto Sans SC"';
    ctx.fillText('MYL 行程路书', 64, 96);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '500 24px "Noto Sans SC"';
    ctx.fillText(dateStr(), W - 64, 96); ctx.textAlign = 'left';

    /* 描边大标题 */
    var title = o.title || '旅行计划';
    var tSize = title.length > 8 ? 58 : 70;
    if (ctx.measureText(title).width > W - 128) tSize = 52;
    outlineText(ctx, title, 64, ph - 150, tSize, '#fff', 'rgba(0,0,0,.5)', 8);

    /* 城市 chip */
    if (o.cityName) chip(ctx, '📍 ' + o.cityName + (o.meta && o.meta.country ? ' · ' + o.meta.country : ''), 64, ph - 88, { bg: 'rgba(255,255,255,.18)', stroke: 'rgba(255,255,255,.45)', h: 50, font: '700 26px "Noto Sans SC"' });

    /* 速览徽章条 */
    var meta = o.meta || {};
    var daysN = meta.daysNum || (title.match(/(\d+)\s*天/) || [])[1] || '';
    var pplN = meta.ppl || (title.match(/(\d+)\s*人/) || [])[1] || '';
    var badges = [];
    if (daysN) badges.push(daysN + ' 天行程');
    if (pplN) badges.push(pplN + ' 人同行');
    if (meta.pref) badges.push(meta.pref + '优先');
    if (meta.budget) badges.push(meta.budget + '档');
    var bx = 64;
    badges.forEach(function (b) {
      var w = ctx.measureText(b).width + 38;
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      roundRect(ctx, bx, ph - 20, w, 44, 22); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5;
      roundRect(ctx, bx, ph - 20, w, 44, 22); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '600 24px "Noto Sans SC"'; ctx.textBaseline = 'middle';
      ctx.fillText(b, bx + 19, ph + 3); ctx.textBaseline = 'alphabetic';
      bx += w + 15;
    });

    /* 小节标题 */
    var y = ph + 42;
    ctx.fillStyle = PAL.ink; ctx.font = '800 34px "Noto Sans SC"';
    ctx.fillText('每日行程', 64, y + 10);
    star(ctx, W - 110, y, 26, PAL.coral, 8);
    squiggle(ctx, 64, y + 26, 260, PAL.yellow, 5);

    /* 每日卡片 */
    var pal = [PAL.coral, PAL.sky, PAL.mint, PAL.purple, PAL.orange, PAL.pink];
    var days = o.days || [];
    var availTop = y + 48, availBot = 1120, infoTop = 1136;
    var k = days.length <= 4 ? 3 : (days.length <= 6 ? 3 : 2);
    var rowH = 32, headH = 44, pad = 18, gap = 16;
    var cardH = function (n) { return pad + headH + Math.min(n, k) * rowH + 8; };
    var total = days.reduce(function (s, g) { return s + cardH(g.nodes.length); }, 0) + gap * Math.max(0, days.length - 1);
    if (total > availBot - availTop) { rowH = 24; headH = 36; pad = 12; gap = 10; }

    var cy = availTop;
    days.slice(0, 8).forEach(function (g, i) {
      var color = pal[i % pal.length];
      var nodes = g.nodes || [];
      var n = Math.min(nodes.length, k);
      var h = pad + headH + n * rowH + 8;
      /* 卡片阴影白底 */
      ctx.save();
      ctx.shadowColor = 'rgba(60,40,20,.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 7;
      ctx.fillStyle = '#fff'; roundRect(ctx, 64, cy, 952, h, 20); ctx.fill();
      ctx.shadowColor = 'transparent';
      /* 左侧色条 */
      ctx.fillStyle = color; roundRect(ctx, 64, cy, 10, h, 5); ctx.fill();
      /* 编号圆 */
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(126, cy + pad + headH / 2, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '800 26px "Noto Sans SC"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), 126, cy + pad + headH / 2 + 1);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      /* 主题 */
      ctx.fillStyle = PAL.ink; ctx.font = '800 29px "Noto Sans SC"';
      var theme = g.label || ('Day ' + (i + 1));
      theme = theme.length > 18 ? theme.slice(0, 17) + '…' : theme;
      ctx.fillText(theme, 176, cy + pad + headH / 2 + 2);
      /* 节点链 */
      var ny = cy + pad + headH + 4;
      nodes.slice(0, k).forEach(function (s) {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(126, ny + rowH / 2, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2c3540'; ctx.font = '500 25px "Noto Sans SC"';
        var nm = (s.n || '').length > 16 ? (s.n || '').slice(0, 15) + '…' : (s.n || '');
        ctx.fillText(nm, 156, ny + rowH / 2 + 3);
        if (s.t) {
          ctx.fillStyle = '#9aa4ae'; ctx.font = '400 21px "Noto Sans SC"';
          ctx.fillText(s.t, Math.min(156 + ctx.measureText(nm).width + 32, 780), ny + rowH / 2 + 3);
        }
        ny += rowH;
      });
      cy += h + gap;
    });

    /* 美食 / 住宿 / 交通 速览小卡：三类各取代表优先 */
    var infos = [];
    var ff = o.foods || [], hh = o.hotels || [], tt = o.traffic || [];
    if (ff[0]) infos.push({ ic: '🍜', t: ff[0].n, s: ff[0].p || '本地美食' });
    if (hh[0]) infos.push({ ic: '🏨', t: hh[0].a, s: hh[0].l || hh[0].p || '推荐住宿' });
    if (tt[0]) infos.push({ ic: '🚄', t: String(tt[0]).slice(0, 12), s: String(tt[0]).slice(12, 26) });
    if (ff[1]) infos.push({ ic: '🍜', t: ff[1].n, s: ff[1].p || '' });
    if (ff[2]) infos.push({ ic: '🍜', t: ff[2].n, s: ff[2].p || '' });
    if (hh[1]) infos.push({ ic: '🏨', t: hh[1].a, s: hh[1].l || hh[1].p || '' });
    if (tt[1]) infos.push({ ic: '🚄', t: String(tt[1]).slice(0, 12), s: String(tt[1]).slice(12, 26) });
    var infoY = cy + 16;
    if (infos.length && infoY < infoTop) {
      var iw = 302, igap = 23, ix = 64;
      infos.slice(0, 3).forEach(function (inf) {
        ctx.fillStyle = '#fff'; roundRect(ctx, ix, infoY, iw, 116, 18); ctx.fill();
        ctx.fillStyle = PAL.coral; ctx.font = '30px "Noto Sans SC"';
        ctx.fillText(inf.ic, ix + 24, infoY + 42);
        ctx.fillStyle = PAL.ink; ctx.font = '700 25px "Noto Sans SC"';
        var tt = inf.t.length > 9 ? inf.t.slice(0, 8) + '…' : inf.t;
        ctx.fillText(tt, ix + 24, infoY + 76);
        ctx.fillStyle = '#8a7f6d'; ctx.font = '400 21px "Noto Sans SC"';
        var ss = (inf.s || '').length > 12 ? (inf.s || '').slice(0, 11) + '…' : (inf.s || '');
        ctx.fillText(ss, ix + 24, infoY + 102);
        ix += iw + igap;
      });
    }

    /* 底部标语 + 话题 + 品牌 */
    ctx.fillStyle = PAL.ink; ctx.font = '800 37px "Noto Sans SC"';
    ctx.fillText('收藏这份路书，说走就走 🚀', 64, 1416);
    hashTags(ctx, tagSet(o), 64, 1466, { bg: 'rgba(139,124,246,.12)', stroke: 'rgba(139,124,246,.35)', color: PAL.purple, h: 44 });
    brand(ctx, false);
  }

  /* ---------- 足迹数据 ---------- */
  function footprintStats() {
    var stamps = [];
    try { stamps = JSON.parse(localStorage.getItem('myl-stamps') || '[]') || []; } catch (e) {}
    var wish = [];
    try { wish = JSON.parse(localStorage.getItem('myl_wishlist') || '[]') || []; } catch (e) {}
    var citySet = {}, spotCount = 0;
    stamps.forEach(function (s) {
      spotCount++;
      if (s && s.key) {
        var city = String(s.key).split('-')[0];
        if (city) citySet[city] = 1;
      }
    });
    var cityList = Object.keys(citySet);
    var days = 0;
    stamps.forEach(function (s) { if (s && s.date) { var d = new Date(s.date); if (!isNaN(d)) days++; } });
    return { cities: cityList.length, spots: spotCount, wishes: wish.length, days: days || cityList.length, cityList: cityList };
  }

  function showPreview() {
    $('preview').style.display = 'block';
    $('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 生成入口 ---------- */
  function genSpot() {
    var o = {
      spot: $('fSpot').value.trim() || params.get('spot') || '未知目的地',
      city: $('fCity').value.trim() || params.get('city') || '',
      desc: $('fDesc').value.trim() || params.get('desc') || '',
      ticket: $('fTicket').value.trim() || params.get('ticket') || ''
    };
    showPreview();
    ctx.fillStyle = '#1a222c'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '600 34px "Noto Sans SC"';
    ctx.fillText('正在取景 ' + o.spot + ' 的真实照片…', 64, 800);
    loadFirst(spotImgCandidates(o.spot, o.city)).then(function (main) {
      if (currentStyle === 'magazine') { drawMagazine(o, main); }
      else if (currentStyle === 'collage') {
        loadMulti(cityImgCandidates(o.city), 2).then(function (side) {
          var imgs = [main].concat(side);
          drawCollage(o, imgs.length ? imgs : [null, null, null]);
        });
      } else drawCoverStyle(o, main);
    });
  }
  function genFootprint() {
    var st = footprintStats();
    if (!st.spots && !st.wishes) {
      if (!confirm('你还没有集章记录。仍要生成一张空白战绩海报吗？')) return;
    }
    /* 取已打卡城市的实拍图做胶片带 */
    var cands = st.cityList.slice(0, 4).map(function (cn) {
      return (window.mylPOIImg || function () { return ''; })(cn, 'spot', cn);
    }).filter(Boolean);
    if (!cands.length) cands.push('images/city-fallback.jpg');
    loadMulti(cands, 4).then(function (imgs) {
      drawFootprint(st, imgs);
      showPreview();
    });
  }
  /* 解析路书结构化数据：优先 URL 里的 data，回退文本 lines */
  function parsePlanData(title) {
    var data = null;
    try { var d = params.get('data'); if (d) data = JSON.parse(d); } catch (e) { data = null; }
    var days = [], foods = [], hotels = [], traffic = [], meta = {};
    if (data && Array.isArray(data.days) && data.days.length) {
      days = data.days;
      foods = data.foods || []; hotels = data.hotels || []; traffic = data.traffic || [];
      meta = { daysNum: data.daysN, ppl: data.ppl, pref: data.pref, budget: data.budget, country: data.country, city: data.city };
    } else {
      var raw = $('pLines').value.trim() || params.get('lines') || '';
      var lines = raw ? raw.split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
      days = lines.map(function (l, i) {
        var m = l.match(/^第?\s*\d+\s*天\s*(.*?)[：:](.*)$/);
        var theme = m ? m[1].trim() : '';
        var nodes = (m ? m[2] : l).split(/→|->|·/).map(function (s) { return { n: s.trim(), d: '', t: '' }; }).filter(function (x) { return x.n; });
        return { label: theme || ('Day ' + (i + 1)), nodes: nodes };
      });
    }
    return { days: days, foods: foods, hotels: hotels, traffic: traffic, meta: meta };
  }

  function genPlan() {
    var title = $('pTitle').value.trim() || params.get('title') || '旅行计划';
    var pd = parsePlanData(title);
    if (!pd.days.length) { alert('请先填写至少一行行程要点'); return; }
    var cityName = cityFromTitle(title) || (pd.meta.city || '');
    showPreview();
    ctx.fillStyle = '#1a222c'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '600 34px "Noto Sans SC"';
    ctx.fillText('正在取景目的地照片…', 64, 800);
    loadFirst(cityName ? spotImgCandidates(cityName, cityName) : ['images/city-fallback.jpg']).then(function (img) {
      drawPlan({ title: title, cityName: cityName, meta: pd.meta, days: pd.days, foods: pd.foods, hotels: pd.hotels, traffic: pd.traffic }, img);
    });
  }

  /* ---------- 导出 ---------- */
  function saveImage() {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'myl-' + currentMode + '-' + currentStyle + '-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    }, 'image/png');
  }
  function webShare() {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], 'myl-travel.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'MYL 旅行分享卡' }).catch(function () {});
      } else {
        alert('当前浏览器不支持直接分享图片，已为你保存到本地，可手动分享。');
        saveImage();
      }
    }, 'image/png');
  }
  function copyLink() {
    var url = location.origin && location.origin !== 'null' ? location.origin + location.pathname : location.href.split('?')[0];
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { alert('链接已复制：' + url); },
        function () { prompt('复制以下链接：', url); });
    } else prompt('复制以下链接：', url);
  }

  /* ---------- 事件绑定 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.mode-btn'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.mode-btn'), function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      currentMode = b.dataset.mode;
      $('formSpot').style.display = currentMode === 'spot' ? 'block' : 'none';
      $('formFootprint').style.display = currentMode === 'footprint' ? 'block' : 'none';
      $('formPlan').style.display = currentMode === 'plan' ? 'block' : 'none';
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.style-btn'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.style-btn'), function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      currentStyle = b.dataset.style;
      if (currentMode === 'spot') genSpot();
    });
  });
  $('genSpot').onclick = genSpot;
  $('genFootprint').onclick = genFootprint;
  $('genPlan').onclick = genPlan;
  $('btnSave').onclick = saveImage;
  $('btnShare').onclick = webShare;
  $('btnCopy').onclick = copyLink;

  /* ---------- 初始化：URL 参数预填 ---------- */
  var urlMode = params.get('mode') || 'spot';
  if (['spot', 'footprint', 'plan'].indexOf(urlMode) >= 0) {
    currentMode = urlMode;
    Array.prototype.forEach.call(document.querySelectorAll('.mode-btn'), function (b) {
      b.classList.toggle('on', b.dataset.mode === urlMode);
    });
    $('formSpot').style.display = urlMode === 'spot' ? 'block' : 'none';
    $('formFootprint').style.display = urlMode === 'footprint' ? 'block' : 'none';
    $('formPlan').style.display = urlMode === 'plan' ? 'block' : 'none';
  }
  var urlStyle = params.get('style');
  if (urlStyle && ['cover', 'magazine', 'collage'].indexOf(urlStyle) >= 0) {
    currentStyle = urlStyle;
    Array.prototype.forEach.call(document.querySelectorAll('.style-btn'), function (b) {
      b.classList.toggle('on', b.dataset.style === urlStyle);
    });
  }
  if (params.get('spot')) $('fSpot').value = params.get('spot');
  if (params.get('city')) $('fCity').value = params.get('city');
  if (params.get('desc')) $('fDesc').value = params.get('desc');
  if (params.get('ticket')) $('fTicket').value = params.get('ticket');
  if (params.get('title')) $('pTitle').value = params.get('title');
  if (params.get('lines')) {
    try {
      var ls = JSON.parse(params.get('lines'));
      if (Array.isArray(ls)) $('pLines').value = ls.join('\n');
    } catch (e) { $('pLines').value = params.get('lines'); }
  }
  if (urlMode === 'footprint') {
    var st = footprintStats();
    $('fpStats').innerHTML =
      '<div class="st"><b>' + st.cities + '</b><span>城市</span></div>' +
      '<div class="st"><b>' + st.spots + '</b><span>打卡印记</span></div>' +
      '<div class="st"><b>' + st.wishes + '</b><span>心愿单</span></div>';
  }

  /* URL 带完整参数时自动生成 */
  if ((urlMode === 'spot' && params.get('spot')) || (urlMode === 'plan' && (params.get('lines') || params.get('title') || params.get('data')))) {
    ready().then(function () {
      if (urlMode === 'spot') genSpot(); else genPlan();
    });
  }
})();
