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
    var out = [], i = 0;
    function next() {
      if (i >= cands.length || out.length >= n) return Promise.resolve(out);
      return loadImg(cands[i++]).then(function (im) { if (im) out.push(im); return next(); });
    }
    return next();
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

  /* ---------- 风格 1：封面大片 ---------- */
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
      g0.addColorStop(0, '#ff8a5c'); g0.addColorStop(0.5, '#ff5e7e'); g0.addColorStop(1, '#7b4397');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
    }
    /* 压暗渐变：上浅下深，保证文字可读 */
    var g1 = ctx.createLinearGradient(0, 0, 0, H);
    g1.addColorStop(0, 'rgba(0,0,0,.42)');
    g1.addColorStop(0.35, 'rgba(0,0,0,.10)');
    g1.addColorStop(0.62, 'rgba(0,0,0,.30)');
    g1.addColorStop(1, 'rgba(0,0,0,.78)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);
    /* 细边框 */
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, W - 56, H - 56);

    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = '600 30px "Noto Sans SC"';
    ctx.fillText('📍 我的目的地种草', 64, 120);
    ctx.textAlign = 'right';
    ctx.font = '400 26px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.fillText(dateStr(), W - 64, 120);
    ctx.textAlign = 'left';

    /* 城市徽章 */
    if (o.city) {
      chip(ctx, '📍 ' + o.city, 64, 1020, { bg: 'rgba(255,255,255,.20)', stroke: 'rgba(255,255,255,.5)', h: 60 });
    }
    /* 主标题 */
    ctx.fillStyle = '#fff';
    ctx.font = '700 ' + (String(o.spot || '').length > 6 ? 88 : 108) + 'px "Noto Serif SC"';
    var title = o.spot || '未知目的地';
    if (ctx.measureText(title).width > W - 128) {
      ctx.font = '700 76px "Noto Serif SC"';
    }
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = 18;
    ctx.fillText(title, 64, 1150);
    ctx.shadowColor = 'transparent';

    /* 玻璃信息卡 */
    ctx.fillStyle = 'rgba(255,255,255,.14)';
    roundRect(ctx, 64, 1210, W - 128, o.ticket ? 260 : 210, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.30)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, 64, 1210, W - 128, o.ticket ? 260 : 210, 28);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.font = '500 36px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 104, 1278, 860, 56, 3);
    if (o.ticket) {
      ctx.fillStyle = 'rgba(255,255,255,.82)';
      ctx.font = '400 30px "Noto Sans SC"';
      wrapText(ctx, '🎫 ' + o.ticket, 104, 1278 + used * 56 + 34, 860, 44, 2);
    }

    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '700 40px "Noto Sans SC"';
    ctx.fillText('这个假期，一起去看看？', 64, 1500);
    brand(ctx, true);
  }

  /* ---------- 风格 2：杂志画报 ---------- */
  function drawMagazine(o, img) {
    ctx.clearRect(0, 0, W, H);
    /* 纸质底 */
    var gp = ctx.createLinearGradient(0, 0, 0, H);
    gp.addColorStop(0, '#faf6ef'); gp.addColorStop(1, '#f1e9db');
    ctx.fillStyle = gp;
    ctx.fillRect(0, 0, W, H);
    /* 上部大图 */
    var ph = 860;
    ctx.save();
    ctx.shadowColor = 'rgba(40,30,20,.28)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 12;
    if (img) {
      ctx.beginPath();
      ctx.rect(0, 0, W, ph);
      ctx.clip();
      drawCover(ctx, img, 0, 0, W, ph, { zoom: 1.06, focusY: 0.45 });
      ctx.restore();
    } else {
      ctx.fillStyle = '#ff5e7e';
      ctx.fillRect(0, 0, W, ph);
      ctx.restore();
    }
    /* 图底渐变 + 标题压图 */
    var g1 = ctx.createLinearGradient(0, ph - 320, 0, ph);
    g1.addColorStop(0, 'rgba(0,0,0,0)');
    g1.addColorStop(1, 'rgba(0,0,0,.66)');
    ctx.save();
    ctx.beginPath(); ctx.rect(0, ph - 320, W, 320); ctx.clip();
    ctx.fillStyle = g1; ctx.fillRect(0, ph - 320, W, 320);
    ctx.restore();

    ctx.fillStyle = '#fff';
    ctx.font = '600 28px "Noto Sans SC"';
    ctx.fillText('MYL 旅行画报 · TRAVEL PICTORIAL', 64, 92);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.font = '400 26px "Noto Sans SC"';
    ctx.fillText('Vol.' + (new Date().getMonth() + 1) + ' · ' + dateStr(), W - 64, 92);
    ctx.textAlign = 'left';

    /* 红色刊号印章 */
    ctx.save();
    ctx.translate(W - 160, 210);
    ctx.rotate(8 * Math.PI / 180);
    ctx.fillStyle = '#d43f3a';
    roundRect(ctx, -74, -50, 148, 100, 14);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 40px "Noto Serif SC"';
    ctx.textAlign = 'center';
    ctx.fillText('种草', 0, 8);
    ctx.font = '600 22px "Noto Sans SC"';
    ctx.fillText('热推', 0, 38);
    ctx.restore();
    ctx.textAlign = 'left';

    /* 压图标题 */
    ctx.fillStyle = '#fff';
    ctx.font = '700 ' + (String(o.spot || '').length > 6 ? 84 : 100) + 'px "Noto Serif SC"';
    var title = o.spot || '未知目的地';
    if (ctx.measureText(title).width > W - 128) ctx.font = '700 74px "Noto Serif SC"';
    ctx.fillText(title, 64, ph - 92);
    if (o.city) {
      chip(ctx, o.city + ' · 实景直击', 64, ph - 64, { bg: 'rgba(255,255,255,.18)', stroke: 'rgba(255,255,255,.45)', h: 54 });
    }

    /* 下部编辑排版 */
    var by = ph + 84;
    ctx.fillStyle = '#2c3540';
    ctx.font = '700 34px "Noto Serif SC"';
    ctx.fillText('「 ' + (o.desc ? o.desc.slice(0, 14) : '值得专程前往') + (o.desc && o.desc.length > 14 ? '…' : ' 」'), 64, by);
    ctx.fillStyle = '#4a5561';
    ctx.font = '400 32px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 64, by + 66, 952, 54, 4);
    var ty = by + 66 + used * 54 + 26;
    if (o.ticket) {
      ctx.fillStyle = '#fff';
      ctx.font = '500 28px "Noto Sans SC"';
      var tw = ctx.measureText('🎫 ' + o.ticket).width + 52;
      ctx.fillStyle = '#2f6e5e';
      roundRect(ctx, 64, ty, Math.min(tw, 952), 62, 14);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎫 ' + o.ticket.slice(0, 24), 90, ty + 33);
      ctx.textBaseline = 'alphabetic';
      ty += 96;
    }
    /* 装饰分隔线 */
    ctx.strokeStyle = '#d9cdb6';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(64, ty + 24); ctx.lineTo(W - 64, ty + 24); ctx.stroke();
    ctx.fillStyle = '#8a7f6d';
    ctx.font = '400 28px "Noto Sans SC"';
    ctx.fillText('完整攻略 · 实时天气 · 地图导航，尽在 MYL 旅行', 64, ty + 78);
    brand(ctx, false);
  }

  /* ---------- 风格 3：拍立得拼贴 ---------- */
  function drawCollage(o, imgs) {
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#fdf1e3'); g.addColorStop(0.55, '#fde7ef'); g.addColorStop(1, '#ece7fb');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    /* 淡格纹 */
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 54) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (var gy = 0; gy < H; gy += 54) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }

    ctx.fillStyle = '#3a4653';
    ctx.font = '600 32px "Noto Sans SC"';
    ctx.fillText('📍 我的目的地种草', 64, 120);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9aa4ae';
    ctx.font = '400 26px "Noto Sans SC"';
    ctx.fillText(dateStr(), W - 64, 120);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#2c3540';
    ctx.font = '700 92px "Noto Serif SC"';
    var title = o.spot || '未知目的地';
    if (ctx.measureText(title).width > W - 128) ctx.font = '700 72px "Noto Serif SC"';
    ctx.fillText(title, 64, 236);
    if (o.city) chip(ctx, '📍 ' + o.city, 66, 268, { bg: 'rgba(255,94,126,.14)', color: '#d6406b', h: 54 });

    /* 三张拍立得 */
    var main = imgs[0] || null, s1 = imgs[1] || null, s2 = imgs[2] || null;
    if (main) photoCard(ctx, main, 130, 380, 620, 620, 10, -3, (o.spot || '') + ' · 实拍');
    if (s1) photoCard(ctx, s1, 560, 700, 420, 430, 10, 4, (o.city || '') + ' · 城市漫游');
    if (s2) photoCard(ctx, s2, 120, 950, 400, 410, 10, -2, '在地瞬间');
    /* 胶带装饰 */
    ctx.fillStyle = 'rgba(255,214,150,.75)';
    ctx.save();
    ctx.translate(700, 350); ctx.rotate(-14 * Math.PI / 180);
    ctx.fillRect(-70, -22, 140, 44);
    ctx.restore();
    ctx.save();
    ctx.translate(360, 1330); ctx.rotate(6 * Math.PI / 180);
    ctx.fillRect(-70, -22, 140, 44);
    ctx.restore();

    /* 文案区 */
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    roundRect(ctx, 64, 1368, W - 128, 150, 24);
    ctx.fill();
    ctx.fillStyle = '#4a5561';
    ctx.font = '400 30px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 96, 1424, 820, 46, 2);
    if (o.ticket && used < 2) {
      ctx.fillStyle = '#8a94a0';
      ctx.font = '400 26px "Noto Sans SC"';
      ctx.fillText('🎫 ' + o.ticket.slice(0, 30), 96, 1424 + used * 46 + 12);
    }
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
    ctx.clearRect(0, 0, W, H);
    /* 上部城市大图 */
    var ph = 620;
    if (img) {
      ctx.save();
      drawCover(ctx, img, 0, 0, W, ph, { zoom: 1.06, focusY: 0.45 });
      ctx.restore();
    } else {
      var g0 = ctx.createLinearGradient(0, 0, W, ph);
      g0.addColorStop(0, '#0f4c5c'); g0.addColorStop(1, '#76b5a8');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, W, ph);
    }
    var g1 = ctx.createLinearGradient(0, ph - 300, 0, ph);
    g1.addColorStop(0, 'rgba(0,0,0,0)');
    g1.addColorStop(1, 'rgba(0,0,0,.7)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, ph - 300, W, 300);

    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.font = '600 30px "Noto Sans SC"';
    ctx.fillText('🧳 我的行程路书', 64, 110);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,.65)';
    ctx.font = '400 26px "Noto Sans SC"';
    ctx.fillText(dateStr(), W - 64, 110);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#fff';
    ctx.font = '700 64px "Noto Serif SC"';
    var tl = wrapText(ctx, o.title || '旅行计划', 64, ph - 130, 950, 80, 2);
    if (o.cityName) chip(ctx, '📍 ' + o.cityName + ' · 实景', 64, ph - 74, { bg: 'rgba(255,255,255,.18)', stroke: 'rgba(255,255,255,.45)', h: 54 });

    /* 下部纸面行程条 */
    var gp = ctx.createLinearGradient(0, ph, 0, H);
    gp.addColorStop(0, '#faf7f0'); gp.addColorStop(1, '#f0ebdf');
    ctx.fillStyle = gp;
    ctx.fillRect(0, ph, W, H - ph);

    var y = ph + 64;
    var maxRows = Math.floor((H - ph - 210) / 74);
    (o.lines || []).slice(0, maxRows).forEach(function (l, i) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      roundRect(ctx, 64, y, 952, 60, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,168,140,.4)';
      ctx.lineWidth = 1;
      roundRect(ctx, 64, y, 952, 60, 14);
      ctx.stroke();
      ctx.fillStyle = '#d6406b';
      ctx.font = '700 28px "Noto Sans SC"';
      ctx.fillText(String(i + 1).padStart(2, '0'), 92, y + 40);
      ctx.fillStyle = '#2c3540';
      ctx.font = '400 28px "Noto Sans SC"';
      var line = l.length > 34 ? l.slice(0, 33) + '…' : l;
      ctx.fillText(line, 158, y + 40);
      y += 74;
    });

    ctx.fillStyle = '#2c3540';
    ctx.font = '700 40px "Noto Sans SC"';
    ctx.fillText('收藏这份路书，说走就走 🚀', 64, Math.min(y + 60, 1500));
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
        loadMulti(spotImgCandidates(o.spot, o.city).concat(
          o.city ? ['images/city-fallback.jpg'] : []), 3).then(function (imgs) {
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
  function genPlan() {
    var title = $('pTitle').value.trim() || params.get('title') || '旅行计划';
    var raw = $('pLines').value.trim() || params.get('lines') || '';
    var lines = raw ? raw.split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
    if (!lines.length) { alert('请先填写至少一行行程要点'); return; }
    var cityName = cityFromTitle(title);
    showPreview();
    ctx.fillStyle = '#1a222c'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '600 34px "Noto Sans SC"';
    ctx.fillText('正在取景目的地照片…', 64, 800);
    loadFirst(cityName ? spotImgCandidates(cityName, cityName) : ['images/city-fallback.jpg']).then(function (img) {
      drawPlan({ title: title, lines: lines, cityName: cityName }, img);
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
  if ((urlMode === 'spot' && params.get('spot')) || (urlMode === 'plan' && (params.get('lines') || params.get('title')))) {
    ready().then(function () {
      if (urlMode === 'spot') genSpot(); else genPlan();
    });
  }
})();
