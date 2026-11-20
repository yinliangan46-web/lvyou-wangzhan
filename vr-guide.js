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

  var CSS = ''
    + '.myl-vr{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,0,0,.05)}'
    + '.myl-vr h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px;color:#222}'
    + '.myl-vr h3 .vr-badge{font-size:11px;font-weight:700;color:#0e9f8a;background:#e9f7f4;border:1px solid #bfe8df;border-radius:99px;padding:2px 9px}'
    + '.myl-vr h3 .vr-sub{font-size:12px;font-weight:400;color:#999;margin-left:auto}'
    + '.vr-intro{font-size:13px;color:#777;margin-bottom:12px}'
    + '.vr-stage{position:relative;border-radius:14px;overflow:hidden;background:#0d1321;aspect-ratio:16/9;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}'
    + '.vr-stage:active{cursor:grabbing}'
    + '.vr-stage canvas,.vr-immerse,.vr-street{position:absolute;inset:0;width:100%;height:100%}'
    + '.vr-immerse .vr-shot{position:absolute;inset:0;opacity:0;transition:opacity .85s ease}'
    + '.vr-immerse .vr-shot.show{opacity:1}'
    + '.vr-immerse .vr-shot img{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;max-width:none}'
    + '.vr-street iframe{position:absolute;inset:0;width:100%;height:100%;border:0}'
    + '.vr-compass{position:absolute;top:10px;left:12px;color:rgba(255,255,255,.85);font-size:11px;background:rgba(0,0,0,.35);border-radius:99px;padding:4px 12px;letter-spacing:2px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-modechip{position:absolute;top:10px;right:12px;color:#fff;font-size:11px;background:rgba(14,159,138,.82);border-radius:99px;padding:4px 12px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-modechip.google{background:rgba(30,110,235,.82)}'
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

  /* ---------- 解说器 ---------- */
  function Narrator(onSentence, onState) {
    this.queue = [];
    this.idx = 0;
    this.on = false;
    this.onSentence = onSentence;
    this.onState = onState;
    this._stopped = true;
  }
  Narrator.prototype.play = function (script) {
    var self = this;
    this.queue = script;
    this.idx = 0;
    this.on = true;
    this._stopped = false;
    this.onState(true);
    this._next();
  };
  Narrator.prototype._next = function () {
    var self = this;
    if (this._stopped || !('speechSynthesis' in window)) { this.onState(false); return; }
    if (this.idx >= this.queue.length) { this.onState(false); this.on = false; return; }
    var item = this.queue[this.idx++];
    try { speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(item.t);
    u.lang = item.lang || 'zh-CN';
    u.rate = u.lang === 'en-US' ? 0.92 : 0.95;
    u.pitch = 1;
    u.onend = function () { if (!self._stopped) setTimeout(function () { self._next(); }, 350); };
    u.onerror = function () { if (!self._stopped) setTimeout(function () { self._next(); }, 350); };
    speechSynthesis.speak(u);
    this.onSentence(item, this.idx, this.queue.length);
  };
  Narrator.prototype.stop = function () {
    this._stopped = true;
    this.on = false;
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
    if (this.zoom > 1) { this.zoom -= 0.0009; if (this.zoom < 1) this.zoom = 1; }
    var t = Date.now();
    var ox = this.cruiseOn ? Math.sin(t * 0.00023) * 0.38 : 0;
    var oy = this.cruiseOn ? Math.sin(t * 0.00016) * 0.22 : 0;
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

  /* ---------- POI 精确地理编码（Nominatim，3.5s 超时，缓存 7 天） ---------- */
  function geoCacheGet(k) {
    try {
      var c = JSON.parse(localStorage.getItem('myl_geo_cache') || '{}');
      var hit = c[k];
      if (hit && Date.now() - hit.t < 7 * 86400 * 1000) return hit.v;
    } catch (e) {}
    return null;
  }
  function geoCacheSet(k, v) {
    try {
      var c = JSON.parse(localStorage.getItem('myl_geo_cache') || '{}');
      c[k] = { t: Date.now(), v: v };
      localStorage.setItem('myl_geo_cache', JSON.stringify(c));
    } catch (e) {}
  }
  function geocodePoi(city, name) {
    var q = (city ? city + ' ' : '') + name;
    var ck = 'nom:' + q;
    var cached = geoCacheGet(ck);
    if (cached !== null) return Promise.resolve(cached);
    return new Promise(function (res) {
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; res(null); } }, 3500);
      fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=zh&limit=1&q=' + encodeURIComponent(q))
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (list) {
          if (done) return;
          done = true; clearTimeout(t);
          var v = (list && list[0]) ? [parseFloat(list[0].lon), parseFloat(list[0].lat)] : null;
          geoCacheSet(ck, v);
          res(v);
        })
        .catch(function () { if (!done) { done = true; clearTimeout(t); res(null); } });
    });
  }

  /* ---------- 全网真 360° 全景检索（Wikimedia Commons，免费无 Key） ---------- */
  function commonsPano(spot) {
    return new Promise(function (res) {
      var key = 'myl_cm_pano_' + (spot.city || '') + '_' + spot.name;
      try {
        var c = JSON.parse(localStorage.getItem(key) || 'null');
        if (c && Date.now() - c.t < 7 * 86400 * 1000) return res(c.v);
      } catch (e) {}
      function query(q, minRatio) {
        var url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
          encodeURIComponent(q) + '&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|size&iiurlwidth=1800&format=json&origin=*';
        return fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
          var best = null;
          var pages = (d && d.query && d.query.pages) || {};
          Object.keys(pages).forEach(function (k) {
            var ii = pages[k].imageinfo && pages[k].imageinfo[0];
            if (!ii || !ii.url || !/jpe?g$/i.test(ii.url)) return;
            var w = ii.width || 0, h = ii.height || 1;
            var ratio = w / h;
            if (w >= 1400 && ratio >= minRatio && ratio <= 4) {
              if (!best || w * h > best.w * best.h) {
                best = { src: ii.thumburl || ii.url, w: w, h: h, credit: String(pages[k].title || '').replace(/^File:/, '') };
              }
            }
          });
          return best;
        }).catch(function () { return null; });
      }
      /* 两轮检索：先「景点+panorama」找真全景，找不到再放宽比例搜宽幅实景 */
      query(spot.name + ' ' + (spot.city || '') + ' panorama', 2.0).then(function (hit1) {
        if (hit1) { try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: hit1 })); } catch (e) {} return res(hit1); }
        query(spot.name + ' ' + (spot.city || ''), 2.5).then(function (hit2) {
          try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: hit2 })); } catch (e) {}
          res(hit2);
        });
      });
    });
  }

  /* ---------- 模式 A：真实街景（Google 街景实景拍摄，POI 精确定位） ---------- */
  function StreetView(stage, lat, lng) {
    this.stage = stage;
    this.wrap = document.createElement('div');
    this.wrap.className = 'vr-street';
    var fr = document.createElement('iframe');
    fr.setAttribute('allowfullscreen', 'true');
    fr.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    fr.loading = 'eager';
    fr.src = 'https://maps.google.com/maps?q=&layer=c&cbll=' + lat + ',' + lng +
      '&cbp=11,0,0,0,0&output=svembed&hl=zh-CN';
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
      '<p class="vr-intro">画面可以上下左右自由环视；点「开始解说」，AI 导游带你边看边讲。境外城市自动接入真实街景，国内城市呈现沉浸式实景漫游。</p>' +
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

    var view = null, pano = null, mode = null, streetOK = false;
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
      Array.prototype.slice.call(stage.querySelectorAll('canvas,.vr-immerse,.vr-street')).forEach(function (el) { el.remove(); });
      shotChipEl.style.display = 'none';
    }

    /* --- 模式装配 --- */
    var pendingPano = null;
    function applyMode(m, streetCoord) {
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
        modeChip.textContent = '全网实景全景 · 360°';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '左右拖动环视 · 上下拖动调整视角';
        noteEl.innerHTML = '全景素材：' + esc(pendingPano.credit || 'Wikimedia Commons 实景拍摄');
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
        view = new StreetView(stage, streetCoord[1], streetCoord[0]);
        noteEl.innerHTML = '街景画面由 Google 街景实景拍摄车采集。若此处未覆盖街景，点上方「切换实景漫游」查看本站实拍镜头。';
        compassEl.textContent = '实景';
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
      if (streetOK) {
        swapBtn = btn('swap', 'fa-shuffle', mode === 'street' ? '切换实景漫游' : '切换真实街景', function () {
          if (narrator.on) narrator.stop();
          applyMode(mode === 'street' ? 'immerse' : 'street');
        });
      }
      if (mode !== 'street') {
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
      /* 官方 VR 全景直达（携程，覆盖全国景点） */
      var ext = document.createElement('a');
      ext.className = 'vr-btn ext';
      ext.target = '_blank';
      ext.rel = 'noopener';
      ext.innerHTML = '<i class="fas fa-cube"></i> 官方 VR 全景';
      ext.href = 'https://m.ctrip.com/webapp/you/gspoi/search?searchword=' + encodeURIComponent(spot.city ? spot.city + ' ' + spot.name : spot.name);
      ctrl.appendChild(ext);
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
        if (view.cruiseOn !== undefined && (act === 'cruise' || act === 'start' || act === 'end')) view.cruiseOn = true;
        if (pano) {
          pano.cruise = act === 'end' ? 0.0009 : 0.0006;
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

    /* --- 启动：站内全景 → 全网真 360° 全景 → 真实街景（POI 精确定位） → 沉浸漫游 --- */
    var PANO = window.PANO_DATA || {};
    if (PANO[spot.name] && PANO[spot.name].src) {
      applyMode('pano');
    } else {
      modeChip.textContent = '正在全网检索实景全景…';
      commonsPano(spot).then(function (hit) {
        if (hit) {
          pendingPano = hit;
          applyMode('net');
          return;
        }
        var wantStreet = country && country !== '中国';
        if (wantStreet) {
          probeGoogle().then(function (ok) {
            streetOK = ok;
            if (!ok) { applyMode('immerse'); return; }
            modeChip.textContent = '街景定位中…';
            geocodePoi(spot.city, spot.name).then(function (g) {
              var coord = g || findCoord(spot.city, spot.name);
              if (coord) applyMode('street', coord);
              else applyMode('immerse');
            });
          });
        } else {
          streetOK = false;
          applyMode('immerse');
        }
      });
    }
  }

  window.MYL_VR = { mount: mount };
})();
