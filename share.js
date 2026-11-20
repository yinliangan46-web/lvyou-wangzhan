/* ============================================================
 * MYL 分享中心 · 海报生成（纯前端 Canvas，无外部依赖）
 * 三种模式：spot 目的地种草卡 / footprint 足迹战绩 / plan 行程路书
 * ============================================================ */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  var canvas = $('poster');
  var ctx = canvas.getContext('2d');
  var currentMode = 'spot';

  var params = new URLSearchParams(location.search);

  /* ---------- 字体加载 ---------- */
  function ready() {
    if (document.fonts && document.fonts.ready) return document.fonts.ready;
    return Promise.resolve();
  }

  /* ---------- 基础绘制工具 ---------- */
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
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
  function deco(c) {
    /* 顶部装饰圆 */
    var g1 = c.createRadialGradient(950, -60, 20, 950, -60, 420);
    g1.addColorStop(0, 'rgba(255,255,255,.35)');
    g1.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g1;
    c.beginPath(); c.arc(950, -60, 420, 0, Math.PI * 2); c.fill();
    var g2 = c.createRadialGradient(60, 1650, 10, 60, 1650, 380);
    g2.addColorStop(0, 'rgba(255,255,255,.28)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g2;
    c.beginPath(); c.arc(60, 1650, 380, 0, Math.PI * 2); c.fill();
  }
  function bg(c, stops) {
    var g = c.createLinearGradient(0, 0, 1080, 1620);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    c.fillStyle = g;
    c.fillRect(0, 0, 1080, 1620);
    deco(c);
  }
  function brand(c, light) {
    c.fillStyle = light ? 'rgba(255,255,255,.92)' : '#3a4653';
    c.font = '600 30px "Noto Sans SC"';
    c.fillText('MYL 旅行 · 分享', 64, 1600);
    c.fillStyle = light ? 'rgba(255,255,255,.55)' : '#9aa4ae';
    c.font = '400 24px "Noto Sans SC"';
    c.fillText('发现世界之美 · myl travel', 330, 1600);
  }
  function dateLine(c, x, y, light) {
    var d = new Date();
    var s = d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
    c.fillStyle = light ? 'rgba(255,255,255,.7)' : '#8b95a0';
    c.font = '400 26px "Noto Sans SC"';
    c.fillText(s, x, y);
  }

  /* ---------- 海报 1：目的地种草卡 ---------- */
  function drawSpot(o) {
    bg(ctx, [[0, '#ff8a5c'], [0.45, '#ff5e7e'], [1, '#7b4397']]);
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '600 30px "Noto Sans SC"';
    ctx.fillText('📍 我的目的地种草', 64, 130);
    dateLine(ctx, 880, 130, true);

    ctx.fillStyle = '#fff';
    ctx.font = '700 96px "Noto Serif SC"';
    ctx.fillText(o.spot || '未知目的地', 64, 300);

    ctx.font = '500 44px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText('· ' + (o.city || '') + ' ·', 64, 372);

    /* 大卡片 */
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    roundRect(ctx, 64, 430, 952, 560, 32);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 2;
    roundRect(ctx, 64, 430, 952, 560, 32);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '500 38px "Noto Sans SC"';
    var used = wrapText(ctx, o.desc || '一个值得专门安排一天慢慢逛的地方。', 104, 520, 860, 62, 7);

    if (o.ticket) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = '400 32px "Noto Sans SC"';
      wrapText(ctx, '🎫 ' + o.ticket, 104, 560 + used * 62 + 40, 860, 48, 3);
    }

    /* emoji 装饰 */
    ['🗺️', '📸', '🍜', '🚄'].forEach(function (e, i) {
      ctx.font = '52px serif';
      ctx.fillText(e, 150 + i * 200, 930);
    });

    /* 引导语 */
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '700 46px "Noto Sans SC"';
    ctx.fillText('这个假期，一起去看看？', 64, 1180);
    ctx.font = '400 30px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillText('完整攻略、天气、地图导航，都在 MYL 旅行', 64, 1240);

    brand(ctx, true);
  }

  /* ---------- 海报 2：足迹战绩 ---------- */
  function drawFootprint(st) {
    bg(ctx, [[0, '#1c2f4a'], [0.5, '#2f5f8f'], [1, '#3fa796']]);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '600 30px "Noto Sans SC"';
    ctx.fillText('🧭 我的旅行足迹 · 战绩', 64, 130);
    dateLine(ctx, 880, 130, true);

    ctx.fillStyle = '#fff';
    ctx.font = '700 76px "Noto Serif SC"';
    ctx.fillText('去过 ' + st.cities + ' 座城', 64, 280);
    ctx.font = '500 40px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText('盖下 ' + st.spots + ' 枚印记，种草 ' + st.wishes + ' 个心愿', 64, 350);

    /* 数字卡片 */
    var cards = [
      [st.cities, '城市'], [st.spots, '打卡印记'], [st.wishes, '心愿单'], [st.days, '累计期待天数']
    ];
    cards.forEach(function (it, i) {
      var x = 64 + (i % 2) * 496, y = 460 + Math.floor(i / 2) * 260;
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      roundRect(ctx, x, y, 456, 220, 28);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '700 84px "Noto Serif SC"';
      ctx.fillText(String(it[0]), x + 40, y + 118);
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.font = '400 32px "Noto Sans SC"';
      ctx.fillText(it[1], x + 40, y + 172);
    });

    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '700 44px "Noto Sans SC"';
    ctx.fillText(st.cities > 0 ? '下一站，继续把地图点亮 ✨' : '从第一枚印记开始 🧳', 64, 1120);
    ctx.font = '400 30px "Noto Sans SC"';
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.fillText('集章打卡 · 足迹地图 · 分享战绩，尽在 MYL 旅行', 64, 1180);

    if (st.cityList && st.cityList.length) {
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.font = '400 30px "Noto Sans SC"';
      wrapText(ctx, '足迹：' + st.cityList.join(' · '), 64, 1300, 950, 46, 4);
    }
    brand(ctx, true);
  }

  /* ---------- 海报 3：行程路书卡 ---------- */
  function drawPlan(o) {
    bg(ctx, [[0, '#0f4c5c'], [0.5, '#3a7ca5'], [1, '#76b5a8']]);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = '600 30px "Noto Sans SC"';
    ctx.fillText('🧳 我的行程路书', 64, 130);
    dateLine(ctx, 880, 130, true);

    ctx.fillStyle = '#fff';
    ctx.font = '700 64px "Noto Serif SC"';
    var tl = wrapText(ctx, o.title || '旅行计划', 64, 250, 950, 84, 2);

    /* 行程条目 */
    var y = 360 + tl * 84;
    (o.lines || []).slice(0, 14).forEach(function (l, i) {
      ctx.fillStyle = 'rgba(255,255,255,.13)';
      roundRect(ctx, 64, y, 952, 64, 16);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = '600 28px "Noto Sans SC"';
      ctx.fillText(String(i + 1).padStart(2, '0'), 92, y + 42);
      ctx.fillStyle = '#fff';
      ctx.font = '400 29px "Noto Sans SC"';
      var line = l.length > 36 ? l.slice(0, 35) + '…' : l;
      ctx.fillText(line, 160, y + 42);
      y += 80;
    });

    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.font = '700 42px "Noto Sans SC"';
    ctx.fillText('收藏这份路书，说走就走 🚀', 64, Math.min(y + 90, 1400));
    brand(ctx, true);
  }

  /* ---------- 足迹数据 ---------- */
  function footprintStats() {
    var stamps = [];
    try { stamps = JSON.parse(localStorage.getItem('myl-stamps') || '[]') || []; } catch (e) {}
    var wish = [];
    try { wish = JSON.parse(localStorage.getItem('myl_wishlist') || '[]') || []; } catch (e) {}
    var citySet = {};
    var spotCount = 0;
    stamps.forEach(function (s) {
      spotCount++;
      if (s && s.key) {
        var city = String(s.key).split('-')[0];
        if (city) citySet[city] = 1;
      }
    });
    var cityList = Object.keys(citySet);
    var days = 0;
    stamps.forEach(function (s) {
      if (s && s.date) {
        var d = new Date(s.date);
        if (!isNaN(d)) days++;
      }
    });
    return { cities: cityList.length, spots: spotCount, wishes: wish.length, days: days || cityList.length, cityList: cityList };
  }

  function showPreview() {
    $('preview').style.display = 'block';
    $('preview').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- 生成入口 ---------- */
  function genSpot() {
    drawSpot({
      spot: $('fSpot').value.trim() || params.get('spot') || '未知目的地',
      city: $('fCity').value.trim() || params.get('city') || '',
      desc: $('fDesc').value.trim() || params.get('desc') || '',
      ticket: $('fTicket').value.trim() || params.get('ticket') || ''
    });
    showPreview();
  }
  function genFootprint() {
    var st = footprintStats();
    if (!st.spots && !st.wishes) {
      if (!confirm('你还没有集章记录。仍要生成一张空白战绩海报吗？')) return;
    }
    drawFootprint(st);
    showPreview();
  }
  function genPlan() {
    var title = $('pTitle').value.trim() || params.get('title') || '旅行计划';
    var raw = $('pLines').value.trim() || params.get('lines') || '';
    var lines = raw ? raw.split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean) : [];
    if (!lines.length) { alert('请先填写至少一行行程要点'); return; }
    drawPlan({ title: title, lines: lines });
    showPreview();
  }

  /* ---------- 导出 ---------- */
  function saveImage() {
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'myl-' + currentMode + '-' + Date.now() + '.png';
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
