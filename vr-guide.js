/* ============================================================
 * MYL · 实景云游板块（v2 全新改版）
 * 位置：景点详情页地图卡片下方
 * 三种实景模式（自动选择，可手动切换）：
 *   A) 真实街景（境外城市）：接入 Google 街景实景拍摄车画面，
 *      像高德街景一样真实可环视（网络可达时自动启用，可一键切换）
 *   B) 实景漫游（国内城市 / 街景不可达时）：全幅沉浸式实景大图，
 *      上下左右拖动环视 + 多镜头切换 + 电影感运镜，替代旧版照片环
 *   C) 实景全景 360°：PANO_DATA 命中的景点用真宽幅全景图
 * 解说：Web Speech 本地语音（免费无 Key），字幕同步，解说联动镜头
 * 由 enrich.js 调用：MYL_VR.mount(spot)
 * ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 芊云全景 VR 作品（公开聚合页索引，自动按景点名匹配后页面内嵌入，不跳转网站） ---------- */
  function qyvrMatch(spot) {
    try {
      var q = new URLSearchParams(location.search).get('qyvr');
      if (q) return { id: q, name: '' };
    } catch (e) {}
    var D = window.QYVR_DATA || {};
    if (D[spot.name]) return { id: D[spot.name], name: spot.name };
    var CD = window.QYVR_CITY_DATA || {};
    var list = CD[(spot.city || '').replace(/市$/, '')] || [];
    if (!list.length) return null;
    var nm = spot.name || '';
    /* 归一化：去掉「景区/风景区/旅游区/公园/步行街/古镇/古城」等后缀再双向包含匹配 */
    var bare = nm.replace(/(风景名胜)?(旅游)?(景区|风景区|度假区|步行街|历史街区|公园|古镇|古城|老街|旅游区)$/g, '');
    var i, wname;
    if (bare && bare !== nm) {
      for (i = 0; i < list.length; i++) {
        wname = list[i][1] || '';
        if (wname.indexOf(bare) > -1 || bare.indexOf(wname) > -1) return { id: list[i][0], name: wname };
      }
    }
    if (nm) {
      for (i = 0; i < list.length; i++) {
        wname = list[i][1] || '';
        if (wname.indexOf(nm) > -1 || nm.indexOf(wname) > -1) return { id: list[i][0], name: wname };
      }
    }
    /* 城市级兜底：本景点无专属作品时，选该城市最像「景点实拍」的作品，
       保证所有景点都有芊云全景可切换（Google 街景失效时的保底体验） */
    var good = /(景区|风景区|古镇|古城|公园|湖|山|寺|塔|园|街|博物馆|纪念馆|广场|大桥|湿地|峡谷|森林|老街|街区|码头|遗址|石窟|乐园|世界|都|城|村|湾|岛|滩|泉|梯田|瀑布|草原)/;
    var bad = /(验收|家装|小区|房间|家乡|婚礼|测试|室内|样板|装修|民宿|店铺|幼儿园|宿舍|报告厅|直播间|工地|车位|办公室)/;
    var best = null, bestScore = -1;
    for (i = 0; i < list.length; i++) {
      wname = list[i][1] || '';
      if (bad.test(wname)) continue;
      var s = good.test(wname) ? 2 : 0;
      if (s > bestScore) { bestScore = s; best = list[i]; }
    }
    if (best) return { id: best[0], name: best[1], cityFallback: true };
    return { id: list[0][0], name: list[0][1], cityFallback: true };
  }

  var CSS = ''
    + '.myl-vr{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,0,0,.05)}'
    + '.myl-vr h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px;color:#222}'
    + '.myl-vr h3 .vr-badge{font-size:11px;font-weight:700;color:#0e9f8a;background:#e9f7f4;border:1px solid #bfe8df;border-radius:99px;padding:2px 9px}'
    + '.myl-vr h3 .vr-sub{font-size:12px;font-weight:400;color:#999;margin-left:auto}'
    + '.vr-intro{font-size:13px;color:#777;margin-bottom:12px}'
    + '.vr-stage{position:relative;border-radius:14px;overflow:hidden;background:#0d1321;aspect-ratio:16/9;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}'
    + '.vr-stage:active{cursor:grabbing}'
    + '.vr-stage canvas,.vr-immerse,.vr-street{position:absolute;inset:0;width:100%;height:100%}'
    + '.vr-qy-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}'
    + '.vr-qy-cover{position:absolute;left:0;right:0;height:56px;z-index:2;pointer-events:none}'
    + '.vr-qy-cover.top{top:0;background:linear-gradient(to bottom,rgba(5,8,16,.92) 0%,rgba(5,8,16,.55) 55%,rgba(5,8,16,0) 100%)}'
    + '.vr-qy-cover.bottom{bottom:0;background:linear-gradient(to top,rgba(5,8,16,.92) 0%,rgba(5,8,16,.55) 55%,rgba(5,8,16,0) 100%)}'
    + '.vr-immerse .vr-shot{position:absolute;inset:0;opacity:0;transition:opacity .85s ease}'
    + '.vr-immerse .vr-shot.show{opacity:1}'
    + '.vr-immerse .vr-shot img{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;max-width:none}'
    + '.vr-street iframe{position:absolute;inset:0;width:100%;height:100%;border:0}'
    + '.vr-compass{position:absolute;top:10px;left:12px;color:rgba(255,255,255,.85);font-size:11px;background:rgba(0,0,0,.35);border-radius:99px;padding:4px 12px;letter-spacing:2px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-modechip{position:absolute;top:10px;right:12px;color:#fff;font-size:11px;background:rgba(14,159,138,.82);border-radius:99px;padding:4px 12px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-modechip.google{background:rgba(30,110,235,.82)}'
    + '.vr-modechip.tx{background:rgba(55,130,255,.85)}'
    + '.vr-shotchip{position:absolute;bottom:12px;left:12px;color:rgba(255,255,255,.9);font-size:11px;background:rgba(0,0,0,.4);border-radius:99px;padding:4px 12px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-hint{position:absolute;bottom:12px;left:0;right:0;text-align:center;color:rgba(255,255,255,.55);font-size:11px;pointer-events:none;z-index:3}'
    + '.vr-ctrl{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;align-items:center}'
    + '.vr-btn{display:inline-flex;align-items:center;gap:6px;border:none;cursor:pointer;border-radius:10px;padding:9px 15px;font-size:13.5px;font-weight:600;color:#fff;transition:opacity .15s;font-family:inherit}'
    + '.vr-btn:hover{opacity:.85}'
    + '.vr-btn.play{background:linear-gradient(120deg,#7c3aed,#4f46e5)}'
    + '.vr-btn.swap{background:linear-gradient(120deg,#1e6eeb,#0e9f8a)}'
    + '.vr-btn.gyro{background:#0e9f8a}.vr-btn.gyro.on{background:#0c7f70}'
    + '.vr-btn.cruise{background:#475569}.vr-btn.cruise.on{background:#1e293b}'
    + '.vr-btn.fs{background:#334155}'
    + '.vr-cap-bar{margin-top:10px;background:#eefaf7;border:1px solid #c9ece4;border-radius:12px;padding:10px 14px;min-height:44px;font-size:13.5px;color:#155e51;line-height:1.7;display:flex;gap:10px;align-items:flex-start}'
    + '.vr-cap-bar .ic{color:#0e9f8a;margin-top:3px}'
    + '.vr-cap-bar.idle{background:#f6f7fa;border-color:#e6e9ef;color:#666}'
    + '.vr-note{margin-top:8px;font-size:12px;color:#a0a6b0}'
    + '@media(max-width:640px){.myl-vr{padding:16px 12px}.vr-stage{aspect-ratio:4/3}}'
    + '.vr-btn.lang{background:#6d28d9}.vr-btn.lang.on{background:#4c1d95}'
    + '.vr-btn.ext{background:linear-gradient(120deg,#e0761b,#d6406b);text-decoration:none;display:inline-flex;align-items:center;gap:6px;border:none;cursor:pointer;border-radius:10px;padding:9px 15px;font-size:13.5px;font-weight:600;color:#fff}'
    + '/* 伪全屏（iOS 等不支持原生全屏时的兜底） */'
    + '.myl-vr.vr-fsx{position:fixed;inset:0;z-index:99999;border-radius:0;margin:0;overflow-y:auto;padding:14px 14px 18px;background:#0d1321}'
    + '.myl-vr.vr-fsx h3,.myl-vr.vr-fsx .vr-intro{color:#eee}'
    + '.myl-vr.vr-fsx .vr-stage{aspect-ratio:auto;height:72vh}'
    + '.myl-vr.vr-fsx .vr-cap-bar{background:rgba(255,255,255,.12)}'
    + '.myl-vr.vr-fsx .vr-cap-bar span{color:#fff}';

  function injectStyle() {
    if (document.getElementById('myl-vr-css')) return;
    var s = document.createElement('style');
    s.id = 'myl-vr-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- 实景镜头收集（优先详情页图库全套实拍，再补周边） ---------- */
  function collectPhotos(spot) {
    var poi = window.mylPOIImg || function () { return ''; };
    var cand = [];
    function add(src, label) { if (src) cand.push({ src: src, label: label }); }
    /* 详情页图库：主图+全景+细节+晨昏+人文，全是该景点真实实拍 */
    (spot.gallery || []).forEach(function (g) { add(g.src, g.label); });
    add(poi(spot.name, spot.type, spot.city), spot.name + ' · 实景主视角');
    (spot.relSpots || []).slice(0, 3).forEach(function (n) { add(poi(n, 'spot', spot.city), n + ' · 实拍'); });
    (spot.relFoods || []).slice(0, 2).forEach(function (n) { add(poi(n, 'food', spot.city), n + ' · 本地味'); });
    var fallback = spot.type === 'food' ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg';
    add(fallback, spot.city + ' · 街头实景');
    /* 去重保序 */
    var seen = {}, list = [];
    cand.forEach(function (c) { if (!seen[c.src]) { seen[c.src] = 1; list.push(c); } });
    return list.slice(0, 8);
  }

  /* ---------- 城市国家归属 ---------- */
  function countryOf(city) {
    var D = window.CITY_DETAIL || {};
    for (var k in D) {
      if (D[k] && D[k].name === city) return D[k].country || '';
    }
    return '';
  }
  function findCoord(city, name) {
    var C = window.CITY_SPOT_COORDS || {};
    if (city && name && C[city + '·' + name]) return C[city + '·' + name];
    if (name && C[name]) return C[name];
    if (city) {
      for (var k in C) {
        if (k.indexOf(city + '·') === 0 && C[k]) return C[k];
      }
      if (window.MYL_CITY_CENTERS && window.MYL_CITY_CENTERS[city]) {
        return window.MYL_CITY_CENTERS[city];
      }
    }
    return null;
  }
  window.MYL_findCoord = findCoord; /* 供其他板块（地图等）复用坐标查找 */

  /* ---------- Google 可达性探测（2.5s 超时） ---------- */
  function probeGoogle() {
    return new Promise(function (res) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; res(false); } }, 2500);
      var im = new Image();
      im.onload = function () { if (!done) { done = true; clearTimeout(t); res(true); } };
      im.onerror = function () { if (!done) { done = true; clearTimeout(t); res(false); } };
      im.src = 'https://www.gstatic.com/images/branding/product/1x/maps_96dp.png?v=' + Date.now();
    });
  }

  /* ---------- 解说词生成（中 / EN 双语） ---------- */
  function buildScript(spot, lang) {
    var s = [];
    var en = lang === 'en';
    var nm = spot.name, ct = spot.city || '';
    function zh(t, act) { s.push({ t: t, act: act || 'cruise', lang: 'zh-CN' }); }
    function enx(t, act) { s.push({ t: t, act: act || 'cruise', lang: 'en-US' }); }
    if (en) {
      enx('Welcome to ' + nm + (ct ? ', ' + ct : '') + '. You are now viewing real photos of this place. Feel free to drag around while I walk you through.', 'start');
    } else {
      zh('欢迎来到' + ct + (ct ? '的' : '') + nm + '。眼前是这里的实景画面，请跟着我的声音，转动视线，我们一起云游这一站。', 'start');
    }
    if (spot.desc) {
      s.push({ t: spot.desc, act: 'cruise', lang: en ? 'zh-CN' : 'zh-CN' });
      if (en) enx('That was the local introduction, read in Chinese. Let me continue.', 'cruise');
    }
    if (spot.tip) zh((en ? 'Travel tip: ' : '小贴士：') + spot.tip);
    if (spot.ticket && spot.ticket !== spot.tip) {
      if (en) enx('Tickets and booking: ');
      zh(spot.ticket + '。出行前记得先确认开放时间。');
    }
    (spot.facts || []).slice(0, 2).forEach(function (f) {
      if (en) enx('Here is an interesting fact about this place——');
      zh(f);
    });
    (spot.relSpots || []).slice(0, 3).forEach(function (n, i) {
      if (en) enx('Nearby, you can also visit ' + n + '. It is close by and perfect for the same day.', 'focus:' + (i + 1));
      else zh('看完这里，不妨把' + n + '也排进同一天的行程，距离不远，顺路刚刚好。', 'focus:' + (i + 1));
    });
    if ((spot.relFoods || []).length) {
      if (en) enx('Feeling hungry? Try the famous local food ' + spot.relFoods[0] + (ct ? ' in ' + ct : '') + ', just around the corner.', 'food');
      else zh('逛累了？' + ct + '的' + spot.relFoods[0] + '就在不远处，逛完这一圈刚好吃上一顿。', 'food');
    }
    if (en) {
      enx('That is ' + nm + '. When you finally stand here in person, come back and tell me — the real view is even better than this virtual tour.', 'end');
    } else {
      zh('这就是' + nm + '。等你真正站在这里的时候，记得回来告诉我，眼前的实景比云游更美。', 'end');
    }
    return s;
  }

  /* ---------- 解说器（v3：百度语音合成 mp3 为主引擎，Web Speech 备用） ----------
     背景：Web Speech API 在很多手机浏览器（微信内置、部分安卓 WebView）里没有
     可用语音包，表现为“点开始解说没声音”。改用百度 TTS 音频引擎：
     返回真实 mp3 音频，任何设备都能出声；若音频加载失败再降级 Web Speech，
     最后兜底字幕按节奏推进，解说永不卡住。 */
  function chunkText(t, max) {
    t = String(t == null ? '' : t).trim();
    if (!t) return [];
    if (t.length <= max) return [t];
    var parts = [], buf = '';
    var seps = t.match(/[^。！？；\n]+[。！？；\n]?/g) || [t];
    seps.forEach(function (p) {
      while (p.length > max) {
        var cut = p.lastIndexOf('，', max) > 12 ? p.lastIndexOf('，', max) + 1 : max;
        parts.push(p.slice(0, cut));
        p = p.slice(cut);
      }
      if ((buf + p).length > max) { if (buf) parts.push(buf); buf = p; }
      else buf += p;
    });
    if (buf) parts.push(buf);
    return parts;
  }
  function ttsUrl(text, lang) {
    return 'https://fanyi.baidu.com/gettts?lan=' + (lang === 'en-US' ? 'en' : 'zh') +
      '&text=' + encodeURIComponent(text) + '&spd=' + (lang === 'en-US' ? 3 : 4) + '&source=web';
  }
  function Narrator(onSentence, onState) {
    this.queue = [];
    this.idx = 0;
    this.on = false;
    this.engine = 'audio'; /* audio=百度TTS音频 / web=浏览器本地语音 */
    this._a = null;
    this.onSentence = onSentence;
    this.onState = onState;
    this._stopped = true;
  }
  Narrator.prototype.play = function (script) {
    this.queue = script;
    this.idx = 0;
    this.on = true;
    this.engine = 'audio';
    this._stopped = false;
    this.onState(true);
    this._next();
  };
  Narrator.prototype._advance = function (delay) {
    var self = this;
    if (this._stopped) return;
    setTimeout(function () { self._next(); }, delay || 380);
  };
  Narrator.prototype._next = function () {
    var self = this;
    if (this._stopped) { this.onState(false); return; }
    if (this.idx >= this.queue.length) { this.on = false; this.onState(false); return; }
    var item = this.queue[this.idx];
    var parts = chunkText(item.t, 190);
    var pi = 0;
    this.onSentence(item, this.idx + 1, this.queue.length);
    (function nextPart() {
      if (self._stopped) return;
      if (pi >= parts.length) { self.idx++; self._advance(); return; }
      var text = parts[pi++];
      if (self.engine === 'audio') {
        self._speakAudio(text, item.lang, nextPart, function () {
          self.engine = 'web';
          nextPart();
        });
      } else {
        self._speakWeb(text, item.lang, nextPart, function () { self._advance(650); });
      }
    })();
  };
  /* 引擎 1：百度 TTS 音频（真实 mp3，全设备出声）
     关键：必须 no-referrer！百度 TTS 接口拦截带外部 Referer 的请求返回空内容
     （这正是"点开始解说没声音"的根因），不带 Referer 则正常返回 mp3。 */
  Narrator.prototype._speakAudio = function (text, lang, done, fail) {
    var self = this;
    var attempt = 0;
    function start() {
      attempt++;
      try { self._a && self._a.pause(); } catch (e) {}
      var a = new Audio();
      a.src = ttsUrl(text, lang) + (attempt > 1 ? '&r=' + attempt : '');
      a.volume = 1;
      a.preload = 'auto';
      try { a.referrerPolicy = 'no-referrer'; } catch (e) {}
      a.setAttribute('referrerpolicy', 'no-referrer');
      self._a = a;
      var started = false, over = false;
      var guard = setTimeout(function () { if (!started && !over) { over = true; if (attempt < 2) start(); else fail(); } }, 6000);
      a.onplaying = function () { started = true; clearTimeout(guard); };
      a.onended = function () { if (!over) { over = true; clearTimeout(guard); done(); } };
      a.onerror = function () {
        if (over) return;
        over = true; clearTimeout(guard);
        if (attempt < 2) setTimeout(start, 200);
        else fail();
      };
      try {
        var p = a.play();
        if (p && p.catch) p.catch(function () {
          if (over) return;
          over = true; clearTimeout(guard);
          if (attempt < 2) setTimeout(start, 200);
          else fail();
        });
      } catch (e) {
        if (!over) { over = true; clearTimeout(guard); if (attempt < 2) setTimeout(start, 200); else fail(); }
      }
      /* 音频停留看门狗：开始播放但超时未结束（网络卡顿）→ 放行继续，绝不卡解说 */
      setTimeout(function () {
        if (!over && started && !self._stopped) { over = true; done(); }
      }, Math.max(9000, text.length * 480));
    }
    start();
  };
  /* 引擎 2：浏览器本地语音（备用）；无语音包时静音看门狗放行字幕 */
  Narrator.prototype._speakWeb = function (text, lang, done, fail) {
    var self = this;
    if (!('speechSynthesis' in window)) { fail(); return; }
    try { speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'zh-CN';
    u.rate = u.lang === 'en-US' ? 0.92 : 0.95;
    u.pitch = 1;
    var fin = false;
    function finish() { if (!fin) { fin = true; done(); } }
    u.onend = finish;
    u.onerror = finish;
    setTimeout(function () {
      if (self._stopped) return;
      try { speechSynthesis.speak(u); } catch (e) { finish(); return; }
      setTimeout(function () {
        if (!fin && !(speechSynthesis.speaking || speechSynthesis.pending)) finish();
      }, 1300);
    }, 120);
  };
  Narrator.prototype.stop = function () {
    this._stopped = true;
    this.on = false;
    try { this._a && this._a.pause(); } catch (e) {}
    try { speechSynthesis.cancel(); } catch (e) {}
    this.onState(false);
  };

  /* ---------- 模式 C：实景全景 360°（canvas 圆柱投影） ---------- */
  function PanoView(stage) {
    this.stage = stage;
    this.cv = document.createElement('canvas');
    stage.appendChild(this.cv);
    this.ctx = this.cv.getContext('2d');
    this.yaw = 0.25; this.pitch = 0; this.vyaw = 0; this.vpitch = 0;
    this.img = null; this.ok = false;
    this.cruise = 0;
    this._raf = null;
    var self = this;
    this._loop = function () { self.frame(); self._raf = requestAnimationFrame(self._loop); };
  }
  PanoView.prototype.load = function (src, onFail) {
    var self = this;
    var im = new Image();
    im.onload = function () { self.img = im; self.ok = true; self.resize(); self._raf = requestAnimationFrame(self._loop); };
    im.onerror = function () { onFail && onFail(); };
    im.src = src;
  };
  PanoView.prototype.resize = function () {
    var r = this.stage.getBoundingClientRect();
    this.cv.width = Math.max(320, Math.round(r.width * (window.devicePixelRatio || 1)));
    this.cv.height = Math.max(180, Math.round(r.height * (window.devicePixelRatio || 1)));
  };
  PanoView.prototype.frame = function () {
    if (!this.ok) return;
    var k = 0.004;
    this.yaw += this.vyaw * k + this.cruise;
    this.pitch += this.vpitch * k;
    this.vyaw *= 0.94; this.vpitch *= 0.94;
    if (this.pitch > 1) this.pitch = 1;
    if (this.pitch < -1) this.pitch = -1;
    var ctx = this.ctx, W = this.cv.width, H = this.cv.height;
    var im = this.img;
    var ratio = H / W;
    var drawH = H;
    var drawW = Math.round(drawH * (im.width / im.height) * 1.35);
    var shift = ((this.yaw % 1) + 1) % 1;
    var x0 = -shift * drawW;
    var vOff = -this.pitch * H * 0.5 + (drawH - H) * 0.5;
    ctx.fillStyle = '#0d1321';
    ctx.fillRect(0, 0, W, H);
    for (var x = x0 - drawW; x < W; x += drawW) {
      ctx.drawImage(im, x, vOff * 0.4, drawW, drawH * 1.15);
    }
    var g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,.4)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    this.compass && this.compass((shift * 360).toFixed(0) + '°');
  };
  PanoView.prototype.drag = function (dx, dy) {
    this.vyaw -= dx * 0.18;
    this.vpitch += dy * 0.3;
  };
  PanoView.prototype.gyro = function (g, b) {
    this.yaw = ((-(g / 90)) % 1 + 1) % 1;
    this.pitch = Math.max(-1, Math.min(1, (b - 45) / 60));
  };
  PanoView.prototype.destroy = function () { this._raf && cancelAnimationFrame(this._raf); this.ok = false; };

  /* ---------- 模式 B：实景漫游（全幅大图环视 + 多镜头） ---------- */
  function ImmersiveView(stage, shots) {
    var self = this;
    this.stage = stage;
    this.shots = shots;
    this.idx = 0;
    this.wrap = document.createElement('div');
    this.wrap.className = 'vr-immerse';
    this.layerA = document.createElement('div');
    this.layerB = document.createElement('div');
    [this.layerA, this.layerB].forEach(function (l) {
      l.className = 'vr-shot';
      var im = document.createElement('img');
      im.alt = '';
      im.draggable = false;
      l.appendChild(im);
      self.wrap.appendChild(l);
    });
    this.cur = this.layerA;
    this.bak = this.layerB;
    this.yaw = 0; this.pitch = 0; this.vyaw = 0; this.vpitch = 0;
    this.s0 = 1; this.maxX = 0; this.maxY = 0;
    this.cruiseOn = false;
    this.zoom = 1.08;
    this._raf = null;
    this._loopOn = true;
    this._loop = function () { if (!self._loopOn) return; self.frame(); self._raf = requestAnimationFrame(self._loop); };
    stage.appendChild(this.wrap);
    window.addEventListener('resize', this._onResize = function () { self.resize(); });
    this.resize();
    requestAnimationFrame(this._loop);
    this._raf = requestAnimationFrame(this._loop);
    this.show(0);
  }
  ImmersiveView.prototype.resize = function () {
    var r = this.stage.getBoundingClientRect();
    this.sw = Math.max(300, r.width);
    this.sh = Math.max(170, r.height);
    var img = this.cur.querySelector('img');
    this._fit(img);
  };
  ImmersiveView.prototype._fit = function (img) {
    if (!img || !img.naturalWidth) return;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var cover = Math.max(this.sw / iw, this.sh / ih);
    /* 留出水平环视余量，同时限制最大裁切 */
    var s = Math.max(cover, Math.min(this.sw * 1.7 / iw, cover * 2.1));
    this.s0 = s;
    this.maxX = Math.max(0, (iw * s - this.sw) / 2);
    this.maxY = Math.max(0, (ih * s - this.sh) / 2);
    img._iw = iw; img._ih = ih;
  };
  ImmersiveView.prototype._apply = function (img, panX, panY) {
    if (!img || !img._iw) return;
    var s = this.s0 * this.zoom;
    var x = this.sw / 2 - img._iw * s / 2 + panX;
    var y = this.sh / 2 - img._ih * s / 2 + panY;
    img.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
  };
  ImmersiveView.prototype.show = function (i) {
    var self = this;
    if (!this.shots.length) return;
    i = ((i % this.shots.length) + this.shots.length) % this.shots.length;
    this.idx = i;
    var shot = this.shots[i];
    var back = this.bak;
    var img = back.querySelector('img');
    img.onload = function () {
      self._fit(img);
      img.onload = null;
      back.classList.add('show');
      self.cur.classList.remove('show');
      var t = self.cur;
      self.cur = back;
      self.bak = t;
      self.zoom = 1.07;
      if (self.shotChip) self.shotChip.textContent = '📷 实景镜头 ' + (self.idx + 1) + '/' + self.shots.length + ' · ' + (shot.label || '');
    };
    img.onerror = function () { /* 加载失败静默跳过 */ };
    img.src = shot.src;
  };
  ImmersiveView.prototype.frame = function () {
    var k = 0.004;
    this.yaw += this.vyaw * k;
    this.pitch += this.vpitch * k;
    this.vyaw *= 0.94; this.vpitch *= 0.94;
    if (this.yaw > 1) this.yaw = 1; if (this.yaw < -1) this.yaw = -1;
    if (this.pitch > 1) this.pitch = 1; if (this.pitch < -1) this.pitch = -1;
    /* 去掉自动呼吸缩放：不拖动时画面完全静止 */
    var t = Date.now();
    var ox = 0, oy = 0;
    var px = Math.max(-1, Math.min(1, this.yaw + ox)) * this.maxX;
    var py = Math.max(-1, Math.min(1, this.pitch + oy)) * this.maxY;
    this._apply(this.cur.querySelector('img'), px, py);
    if (this.maxX > 0) {
      var deg = Math.round(180 + (px / this.maxX) * 90);
      this.compass && this.compass(deg + '°');
    }
  };
  ImmersiveView.prototype.drag = function (dx, dy) {
    if (this.maxX > 0) this.vyaw -= dx * 0.045;
    if (this.maxY > 0) this.vpitch += dy * 0.045;
  };
  ImmersiveView.prototype.gyro = function (g, b) {
    this.yaw = Math.max(-1, Math.min(1, -(g / 90)));
    this.pitch = Math.max(-1, Math.min(1, (b - 45) / 60));
  };
  ImmersiveView.prototype.destroy = function () {
    this._loopOn = false;
    this._raf && cancelAnimationFrame(this._raf);
    this._onResize && window.removeEventListener('resize', this._onResize);
  };

  /* ---------- 全网真 360° 全景检索（Wikimedia Commons，免费无 Key） ----------
     只认 2:1 附近的等距柱状全景（equirectangular），宽幅普通照片一律不冒充 VR：
     点进「VR 全景」必须是可 360° 环视的真全景，否则降级走沉浸实景漫游。
     检索顺序：坐标周边（geo 圆心=景点坐标，一定属于本景点）→ 名称精确匹配 → 名称兜底。 */
  function commonsPano(spot) {
    return new Promise(function (res) {
      var key = 'myl_cm_pano_' + (spot.city || '') + '_' + spot.name;
      try {
        var c = JSON.parse(localStorage.getItem(key) || 'null');
        if (c && Date.now() - c.t < 7 * 86400 * 1000) return res(c.v);
      } catch (e) {}
      function pickFrom(d) {
        var best = null;
        var pages = (d && d.query && d.query.pages) || {};
        Object.keys(pages).forEach(function (k) {
          var ii = pages[k].imageinfo && pages[k].imageinfo[0];
          if (!ii || !ii.url || !/jpe?g$/i.test(ii.url)) return;
          var w = ii.width || 0, h = ii.height || 1;
          var ratio = w / h;
          if (w >= 1400 && ratio >= 1.9 && ratio <= 2.6) {
            if (!best || w * h > best.w * best.h) {
              best = { src: ii.thumburl || ii.url, w: w, h: h, credit: String(pages[k].title || '').replace(/^File:/, '') };
            }
          }
        });
        return best;
      }
      function fetchUrl(url) {
        var ac = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        var timer = ac ? setTimeout(function () { ac.abort(); }, 6000) : null;
        return fetch(url, ac ? { signal: ac.signal } : undefined).then(function (r) {
          if (timer) clearTimeout(timer);
          return r.ok ? r.json() : null;
        }).then(pickFrom).catch(function () { if (timer) clearTimeout(timer); return null; });
      }
      function query(q, minRatio) {
        var url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
          encodeURIComponent(q) + '&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|size&iiurlwidth=1800&format=json&origin=*';
        return fetchUrl(url);
      }
      /* 坐标周边检索：以景点坐标为圆心找真全景（地理上保证属于本景点） */
      function geoNear() {
        var coord = findCoord(spot.city, spot.name);
        if (!coord) return Promise.resolve(null);
        var url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=' +
          coord[1] + '|' + coord[0] + '&ggsradius=800&ggsnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|size&iiurlwidth=1800&format=json&origin=*';
        return fetchUrl(url);
      }
      function keep(hit) {
        try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: hit })); } catch (e) {}
        res(hit);
      }
      var city = spot.city || '';
      /* 轮 1：坐标周边 800 米真全景；轮 2：明确标注 equirectangular；轮 3：360 panorama；
         轮 4：退回景点名检索，比例仍限制在 2:1 附近。全部空 → 确认无真全景。
         整体 12 秒竞速，超时直接放弃（绝不卡住板块） */
      var overall = setTimeout(function () { res(null); }, 12000);
      var chain = geoNear().then(function (hit0) {
        if (hit0) { clearTimeout(overall); return keep(hit0); }
        return query(spot.name + ' ' + city + ' panorama equirectangular', 1.9).then(function (hit1) {
          if (hit1) { clearTimeout(overall); return keep(hit1); }
          return query(spot.name + ' ' + city + ' 360 panorama', 1.9).then(function (hit2) {
            if (hit2) { clearTimeout(overall); return keep(hit2); }
            return query(spot.name + ' ' + city, 2.0).then(function (hit3) {
              clearTimeout(overall);
              keep(hit3);
            });
          });
        });
      });
      chain && chain.catch && chain.catch(function () { clearTimeout(overall); res(null); });
    });
  }

  /* ---------- 模式 A：真实街景（按景点名称在 Google 地图实景搜索并引用） ----------
     不再按坐标抓“最近全景”——坐标定位会把邻近其他景点（如玄武湖）的全景错配过来。
     改用 Google 地图对「景点名 + 城市」的实景搜索结果，命中的一定是该景点本体的画面。 */
  function StreetView(stage, query) {
    this.stage = stage;
    this.wrap = document.createElement('div');
    this.wrap.className = 'vr-street';
    var fr = document.createElement('iframe');
    fr.setAttribute('allowfullscreen', 'true');
    fr.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    fr.loading = 'eager';
    fr.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(query) +
      '&layer=c&output=svembed&hl=zh-CN';
    this.wrap.appendChild(fr);
    stage.appendChild(this.wrap);
  }
  StreetView.prototype.drag = function () {};
  StreetView.prototype.gyro = function () {};
  StreetView.prototype.destroy = function () { try { this.wrap.remove(); } catch (e) {} };


  /* ---------- 挂载 ---------- */
  function mount(spot) {
    if (!spot || !spot.name) return;
    injectStyle();
    var host = document.getElementById('meMap');
    if (!host) return;

    var root = document.createElement('div');
    root.className = 'myl-vr';
    root.innerHTML =
      '<h3><i class="fas fa-vr-cardboard" style="color:#0e9f8a"></i> 实景云游 · AI 解说' +
        '<span class="vr-badge">实景拍摄 · 语音导览</span><span class="vr-sub">' + esc(spot.name) + '</span></h3>' +
      '<p class="vr-intro">画面可以上下左右自由环视；点「开始解说」，AI 导游用真人语音带你边看边讲（中英双语）。实景画面来自 Google 地图对该景点的实景搜索结果，语音由百度语音合成提供，任何手机都能出声。</p>' +
      '<div class="vr-stage" id="vrStage">' +
        '<span class="vr-compass" id="vrCompass">0°</span>' +
        '<span class="vr-modechip" id="vrMode">加载中</span>' +
        '<span class="vr-shotchip" id="vrShotChip" style="display:none"></span>' +
        '<span class="vr-hint" id="vrHint">左右拖动环视 · 上下拖动调整视角</span>' +
      '</div>' +
      '<div class="vr-ctrl" id="vrCtrl"></div>' +
      '<div class="vr-cap-bar idle" id="vrCap"><i class="fas fa-comment-dots ic"></i><span>解说字幕会显示在这里——欢迎语、景点故事、冷知识、顺路推荐，全都讲给你听。</span></div>' +
      '<div class="vr-note" id="vrNote"></div>';

    if (host.nextSibling && host.nextSibling.parentNode) {
      host.parentNode.insertBefore(root, host.nextSibling);
    } else if (host.parentElement) {
      host.parentElement.appendChild(root);
    }

    var stage = root.querySelector('#vrStage');
    var capBar = root.querySelector('#vrCap');
    var modeChip = root.querySelector('#vrMode');
    var compassEl = root.querySelector('#vrCompass');
    var hintEl = root.querySelector('#vrHint');
    var shotChipEl = root.querySelector('#vrShotChip');
    var ctrl = root.querySelector('#vrCtrl');
    var noteEl = root.querySelector('#vrNote');

    var view = null, pano = null, mode = null, streetOK = false, lastStreetCoord = null;
    /* Google 实景搜索关键词：景点名 + 城市（引用该景点自己的画面，杜绝邻近景点错配） */
    var streetQuery = (spot.city ? spot.city + ' ' : '') + spot.name;
    var country = countryOf(spot.city);

    function setCompassText(t) { compassEl.textContent = t; }

    function caption(text, busy) {
      capBar.className = 'vr-cap-bar' + (busy ? '' : ' idle');
      capBar.innerHTML = '<i class="fas fa-comment-dots ic"></i><span>' + esc(text) + '</span>';
    }

    function btn(cls, icon, label, onclick) {
      var b = document.createElement('button');
      b.className = 'vr-btn ' + cls;
      b.innerHTML = '<i class="fas ' + icon + '"></i> ' + label;
      b.onclick = onclick;
      ctrl.appendChild(b);
      return b;
    }

    function clearView() {
      if (view) { view.destroy && view.destroy(); view = null; pano = null; }
      Array.prototype.slice.call(stage.querySelectorAll('canvas,.vr-immerse,.vr-street,.vr-qy-frame,.vr-qy-cover')).forEach(function (el) { el.remove(); });
      shotChipEl.style.display = 'none';
    }

    /* --- 模式装配 --- */
    var pendingPano = null;
    function applyMode(m, streetQuery) {
      clearView();
      mode = m;
      cruiseBtn = null; gyroBtn = null;
      rebuildCtrl();
      if (m === 'pano') {
        var PANO = window.PANO_DATA || {};
        var pd = PANO[spot.name];
        modeChip.textContent = '实景全景 · 360°';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '左右拖动环视 · 上下拖动调整视角';
        pano = new PanoView(stage);
        view = pano;
        view.compass = setCompassText;
        bindDrag(pano);
        pano.load(pd.src, function () {
          stage.querySelector('canvas') && stage.querySelector('canvas').remove();
          pano.destroy();
          applyMode('immerse');
        });
      } else if (m === 'net') {
        modeChip.textContent = '真实 VR · 360° 全景实拍';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '左右拖动环视 · 上下拖动调整视角';
        noteEl.innerHTML = '<i class="fas fa-vr-cardboard"></i> 真实 VR 全景：' + esc(pendingPano.credit || 'Wikimedia Commons 实景拍摄') + ' · 想看官方全景可点「官方 VR 全景」直达';
        pano = new PanoView(stage);
        view = pano;
        view.compass = setCompassText;
        bindDrag(pano);
        pano.load(pendingPano.src, function () {
          stage.querySelector('canvas') && stage.querySelector('canvas').remove();
          pano.destroy();
          applyMode('immerse');
        });
      } else if (m === 'street') {
        modeChip.textContent = '真实街景 · 实景拍摄';
        modeChip.className = 'vr-modechip google';
        hintEl.textContent = '在街景画面内拖动即可环视 · 双指缩放';
        lastStreetCoord = streetQuery;
        view = new StreetView(stage, streetQuery);
        noteEl.innerHTML = '画面为 Google 地图对「' + esc(streetQuery) + '」的实景搜索结果（该景点实拍）。若此处未覆盖街景，点上方「切换实景漫游」查看本站实拍镜头。';
        compassEl.textContent = '实景';
      } else if (m === 'qy') {
        /* 芊云全景 VR 作品：iframe 页面内嵌入（不跳转网站），上下遮幅屏蔽平台品牌标识 */
        var qyId = qyHit ? qyHit.id : '';
        modeChip.textContent = '真实 VR · 720° 全景漫游';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '画面内自由拖动环视 · 场景间热点切换';
        var fr = document.createElement('iframe');
        fr.className = 'vr-qy-frame';
        fr.setAttribute('allowfullscreen', 'true');
        fr.setAttribute('allow', 'xr-spatial-tracking; gyroscope; accelerometer');
        fr.src = 'https://9kvr.cn/tour/index?id=' + encodeURIComponent(qyId);
        stage.appendChild(fr);
        var cTop = document.createElement('div');
        cTop.className = 'vr-qy-cover top';
        stage.appendChild(cTop);
        var cBottom = document.createElement('div');
        cBottom.className = 'vr-qy-cover bottom';
        stage.appendChild(cBottom);
        var qyLabel = qyHit && qyHit.name ? esc(qyHit.name) : esc(spot.name);
        noteEl.innerHTML = '全景作品：' + qyLabel +
          (qyHit && qyHit.cityFallback ? '（' + esc(spot.city || '') + '城市实拍）' : '') + ' · 实景拍摄可 360° 环视';
      } else {
        modeChip.textContent = '沉浸实景漫游';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '左右拖动环视 · 上下拖动调整视角 · 解说自动切镜头';
        view = new ImmersiveView(stage, collectPhotos(spot));
        view.compass = setCompassText;
        view.shotChip = shotChipEl;
        shotChipEl.style.display = '';
        bindDrag(view);
        noteEl.innerHTML = '';
      }
    }

    /* --- 控制按钮（随模式重建） --- */
    var playBtn = null, swapBtn = null, cruiseBtn = null, gyroBtn = null, fsBtn = null, langBtn = null;
    var vrLang = 'zh';
    function rebuildCtrl() {
      ctrl.innerHTML = '';
      playBtn = btn('play', 'fa-play', '开始解说', function () {
        if (narrator.on) { narrator.stop(); }
        else { narrator.play(buildScript(spot, vrLang)); }
      });
      langBtn = btn('lang', vrLang === 'zh' ? 'fa-language' : 'fa-language', vrLang === 'zh' ? 'English 解说' : '中文解说', function () {
        vrLang = vrLang === 'zh' ? 'en' : 'zh';
        langBtn.innerHTML = '<i class="fas fa-language"></i> ' + (vrLang === 'zh' ? 'English 解说' : '中文解说');
        if (narrator.on) { narrator.stop(); narrator.play(buildScript(spot, vrLang)); }
      });
      /* 模式互换：街景 ↔ 芊云全景（页面内嵌入，不跳转）↔ 实景漫游 */
      if (streetOK && qyHit) {
        swapBtn = btn('swap', 'fa-shuffle', mode === 'qy' ? '切换真实街景' : '切换芊云全景', function () {
          if (narrator.on) narrator.stop();
          if (mode === 'qy') applyMode('street', lastStreetCoord);
          else applyMode('qy');
        });
      } else if (streetOK || mode === 'qy') {
        swapBtn = btn('swap', 'fa-shuffle', mode === 'immerse' ? (streetOK ? '切换真实街景' : '切换实景漫游') : '切换实景漫游', function () {
          if (narrator.on) narrator.stop();
          if (mode === 'immerse' && streetOK) applyMode('street', lastStreetCoord);
          else applyMode('immerse');
        });
      }
      if (mode === 'immerse' && view && view.shots && view.shots.length > 1) {
        btn('prev', 'fa-arrow-left', '上一镜头', function () { view.show(view.idx - 1); });
        btn('next', 'fa-arrow-right', '下一镜头', function () { view.show(view.idx + 1); });
      }
      if (mode !== 'street' && mode !== 'qy') {
        cruiseBtn = btn('cruise', 'fa-route', '自动漫游', function () {
          var on = !cruiseBtn.classList.contains('on');
          cruiseBtn.classList.toggle('on', on);
          if (pano) pano.cruise = on ? 0.0006 : 0;
          else if (view && view.cruiseOn !== undefined) view.cruiseOn = on;
        });
        gyroBtn = btn('gyro', 'fa-mobile-screen', '陀螺仪', function () { toggleGyro(); });
      }
      fsBtn = btn('fs', 'fa-expand', '全屏', function () {
        var nativeFs = stage.requestFullscreen || stage.webkitRequestFullscreen || stage.msRequestFullscreen;
        if (!isFs()) {
          if (nativeFs) {
            try {
              var p = nativeFs.call(stage);
              if (p && p.catch) p.catch(function () { pseudoFs(); });
            } catch (e) { pseudoFs(); }
          } else pseudoFs();
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else unPseudoFs();
        }
        setTimeout(function () { pano && pano.resize(); view && view.resize && view.resize(); }, 350);
      });
      function isFs() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement) || root.classList.contains('vr-fsx');
      }
      function pseudoFs() {
        root.classList.add('vr-fsx');
        document.body.style.overflow = 'hidden';
        fsBtn.innerHTML = '<i class="fas fa-compress"></i> 退出全屏';
        pano && pano.resize && pano.resize();
        view && view.resize && view.resize();
      }
      function unPseudoFs() {
        root.classList.remove('vr-fsx');
        document.body.style.overflow = '';
        fsBtn.innerHTML = '<i class="fas fa-expand"></i> 全屏';
        setTimeout(function () { pano && pano.resize(); view && view.resize && view.resize(); }, 120);
      }
      document.addEventListener('fullscreenchange', fsSync);
      document.addEventListener('webkitfullscreenchange', fsSync);
      function fsSync() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          fsBtn.innerHTML = '<i class="fas fa-expand"></i> 全屏';
        }
      }
      /* 芊云匹配时即使街景不可用，也提供芊云/漫游互换 */
      if (!streetOK && qyHit && mode !== 'qy') {
        swapBtn = btn('swap', 'fa-shuffle', '切换芊云全景', function () {
          if (narrator.on) narrator.stop();
          applyMode('qy');
        });
      }
    }

    /* --- 拖拽 --- */
    function bindDrag(v) {
      var down = false, lx = 0, ly = 0, pid = null;
      stage.addEventListener('pointerdown', function (e) {
        down = true; pid = e.pointerId; lx = e.clientX; ly = e.clientY;
        stage.setPointerCapture && stage.setPointerCapture(pid);
      });
      stage.addEventListener('pointermove', function (e) {
        if (!down || !view) return;
        view.drag(e.clientX - lx, e.clientY - ly);
        lx = e.clientX; ly = e.clientY;
      });
      function up() { down = false; }
      stage.addEventListener('pointerup', up);
      stage.addEventListener('pointercancel', up);
      stage.addEventListener('pointerleave', up);
    }

    /* --- 解说 --- */
    var narrator = new Narrator(
      function (item, idx, total) {
        caption('（' + idx + '/' + total + '）' + item.t, true);
        if (!view || mode === 'street') return;
        var act = item.act || '';
        /* 不再自动开启漫游/摇移：画面保持静止，用户拖动才动（避免“照片来回播放”感） */
        if (pano) {
          pano.cruise = act === 'end' ? 0 : 0;
        } else if (view.show) {
          var n = view.shots.length;
          if (act.indexOf('focus:') === 0) {
            view.show(parseInt(act.split(':')[1], 10) % n);
          } else if (act === 'food') {
            view.show(n - 1);
          }
        }
      },
      function (playing) {
        if (playing && playBtn) { playBtn.innerHTML = '<i class="fas fa-stop"></i> 停止解说'; }
        else if (playBtn) {
          playBtn.innerHTML = '<i class="fas fa-play"></i> 开始解说';
          caption('解说结束。想再来一遍？点上方按钮。', false);
        }
      }
    );

    /* --- 陀螺仪 --- */
    var gyroOn = false;
    function gyroHandler(e) {
      if (!view || !gyroOn || mode === 'street') return;
      view.gyro && view.gyro(e.gamma || 0, e.beta || 0);
    }
    function toggleGyro() {
      function start() {
        gyroOn = !gyroOn;
        gyroBtn.classList.toggle('on', gyroOn);
        if (gyroOn) window.addEventListener('deviceorientation', gyroHandler, true);
        else window.removeEventListener('deviceorientation', gyroHandler, true);
        gyroBtn.innerHTML = gyroOn ? '<i class="fas fa-mobile-screen-button"></i> 陀螺仪开' : '<i class="fas fa-mobile-screen"></i> 陀螺仪';
        caption(gyroOn ? '陀螺仪已开启：像拿望远镜一样转动手机环视四周。' : '陀螺仪已关闭。', false);
      }
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        DeviceOrientationEvent.requestPermission().then(function (r) {
          if (r === 'granted') start();
          else caption('陀螺仪权限未授权，可在浏览器设置中开启。', false);
        }).catch(function () { caption('当前设备不支持陀螺仪。', false); });
      } else if (window.DeviceOrientationEvent) {
        start();
      } else {
        caption('当前设备不支持陀螺仪。', false);
      }
    }

    /* --- 启动：Google 实景搜索优先（按景点名引用该景点自己的画面），并网检索真全景互为备选 ---
       probeGoogle 与 commonsPano 同时发起，任何一路都不阻塞另一路，板块永不卡住
       芊云城市兜底作品（cityFallback）只保留在手动切换按钮里，绝不自动顶替景点 */
    var PANO = window.PANO_DATA || {};
    var qyHit = qyvrMatch(spot);
    var qyOwn = qyHit && !qyHit.cityFallback ? qyHit : null;
    if (PANO[spot.name] && PANO[spot.name].src) {
      applyMode('pano');
    } else {
      modeChip.textContent = '正在检索真实街景…';
      var pCommons = commonsPano(spot);
      probeGoogle().then(function (ok) {
        streetOK = ok;
        if (ok) {
          pCommons.then(function (hit) { if (hit) pendingPano = hit; });
          applyMode('street', streetQuery);
        } else {
          pCommons.then(function (hit) {
            if (hit) { pendingPano = hit; applyMode('net'); return; }
            if (qyOwn) applyMode('qy');
            else applyMode('immerse');
          });
        }
      });
    }
  }

  window.MYL_VR = { mount: mount };
})();
