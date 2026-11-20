/* ============================================================
 * MYL · VR 云游板块（v1）
 * 位置：景点详情页地图卡片下方
 * 特性：
 *   1) 全景模式：PANO_DATA 命中的景点用真宽幅全景图，
 *      左右无限拖拽 + 上下俯仰 + 惯性滑动
 *   2) 环绕模式：其余全部景点自动生成 CSS 3D 八方位照片环
 *      （主图 + 周边景点 + 特色美食），左右转环、上下调整视角
 *   3) AI 解说：Web Speech 本地语音（免费无 Key），字幕同步，
 *      解说联动画面（自动巡航 / 转到对应方位）
 *   4) 陀螺仪模式：转动手机即可环视四周（iOS 需授权）
 * 由 enrich.js 调用：MYL_VR.mount(spot)
 * ============================================================ */
(function () {
  'use strict';

  var T = (function () {
    var s = {};
    return function (k, v) { if (arguments.length === 2) { s[k] = v; return v; } return s[k]; };
  })();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var CSS = ''
    + '.myl-vr{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,0,0,.05)}'
    + '.myl-vr h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px;color:#222}'
    + '.myl-vr h3 .vr-badge{font-size:11px;font-weight:700;color:#7c3aed;background:#f3ecff;border:1px solid #ddd0ff;border-radius:99px;padding:2px 9px}'
    + '.myl-vr h3 .vr-sub{font-size:12px;font-weight:400;color:#999;margin-left:auto}'
    + '.vr-intro{font-size:13px;color:#777;margin-bottom:12px}'
    + '.vr-stage{position:relative;border-radius:14px;overflow:hidden;background:#0d1321;aspect-ratio:16/9;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}'
    + '.vr-stage:active{cursor:grabbing}'
    + '.vr-stage canvas,.vr-ring3d{position:absolute;inset:0;width:100%;height:100%}'
    + '.vr-ring3d{perspective:920px;overflow:hidden}'
    + '.vr-ring3d .vr-spin{position:absolute;left:50%;top:50%;transform-style:preserve-3d;width:0;height:0}'
    + '.vr-ring3d .vr-face{position:absolute;left:-150px;top:-105px;width:300px;height:210px;border-radius:12px;overflow:hidden;'
    + 'box-shadow:0 10px 30px rgba(0,0,0,.45);backface-visibility:hidden;background:#111}'
    + '.vr-ring3d .vr-face img{width:100%;height:100%;object-fit:cover;pointer-events:none}'
    + '.vr-ring3d .vr-face .vr-cap{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff;font-size:12px;padding:16px 10px 8px;text-align:center}'
    + '.vr-compass{position:absolute;top:10px;left:12px;color:rgba(255,255,255,.85);font-size:11px;background:rgba(0,0,0,.35);border-radius:99px;padding:4px 12px;letter-spacing:2px;backdrop-filter:blur(4px);pointer-events:none}'
    + '.vr-modechip{position:absolute;top:10px;right:12px;color:#fff;font-size:11px;background:rgba(124,58,237,.8);border-radius:99px;padding:4px 12px;backdrop-filter:blur(4px);pointer-events:none}'
    + '.vr-hint{position:absolute;bottom:12px;left:0;right:0;text-align:center;color:rgba(255,255,255,.55);font-size:11px;pointer-events:none}'
    + '.vr-ctrl{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;align-items:center}'
    + '.vr-btn{display:inline-flex;align-items:center;gap:6px;border:none;cursor:pointer;border-radius:10px;padding:9px 15px;font-size:13.5px;font-weight:600;color:#fff;transition:opacity .15s;font-family:inherit}'
    + '.vr-btn:hover{opacity:.85}'
    + '.vr-btn.play{background:linear-gradient(120deg,#7c3aed,#4f46e5)}'
    + '.vr-btn.gyro{background:#0e9f8a}.vr-btn.gyro.on{background:#0c7f70}'
    + '.vr-btn.cruise{background:#475569}.vr-btn.cruise.on{background:#1e293b}'
    + '.vr-btn.fs{background:#334155}'
    + '.vr-cap-bar{margin-top:10px;background:#f6f3ff;border:1px solid #e6ddff;border-radius:12px;padding:10px 14px;min-height:44px;font-size:13.5px;color:#3b2f66;line-height:1.7;display:flex;gap:10px;align-items:flex-start}'
    + '.vr-cap-bar .ic{color:#7c3aed;margin-top:3px}'
    + '.vr-cap-bar.idle{background:#f6f7fa;border-color:#e6e9ef;color:#666}'
    + '@media(max-width:640px){.myl-vr{padding:16px 12px}.vr-stage{aspect-ratio:4/3}}';

  function injectStyle() {
    if (document.getElementById('myl-vr-css')) return;
    var s = document.createElement('style');
    s.id = 'myl-vr-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- 图片收集（环绕模式） ---------- */
  function collectPhotos(spot) {
    var poi = window.mylPOIImg || function () { return ''; };
    var cand = [];
    function add(src, label) { if (src) cand.push({ src: src, label: label }); }
    add(spot.hero, spot.name + ' · 主视角');
    add(poi(spot.name, spot.type, spot.city), spot.name);
    (spot.relSpots || []).forEach(function (n) { add(poi(n, 'spot', spot.city), n); });
    (spot.relFoods || []).forEach(function (n) { add(poi(n, 'food', spot.city), n + ' · 本地味'); });
    var fallback = spot.type === 'food' ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg';
    add(fallback, spot.city + ' · 风物');
    /* 去重保序 */
    var seen = {}, list = [];
    cand.forEach(function (c) { if (!seen[c.src]) { seen[c.src] = 1; list.push(c); } });
    /* 不足 8 方位时循环补位 */
    var base = list.slice();
    while (list.length < 8 && base.length) {
      var b = base[list.length % base.length];
      list.push({ src: b.src, label: b.label });
    }
    return list.slice(0, 8);
  }

  /* ---------- 解说词生成 ---------- */
  function buildScript(spot) {
    var s = [];
    s.push({ t: '欢迎来到' + (spot.city || '') + (spot.city ? '的' : '') + spot.name + '。现在，请跟着我的声音，转动手中的画面，我们一起云游这一站。', act: 'start' });
    if (spot.desc) s.push({ t: spot.desc, act: 'cruise' });
    if (spot.tip) s.push({ t: '小贴士：' + spot.tip, act: 'cruise' });
    if (spot.ticket && spot.ticket !== spot.tip) s.push({ t: '门票与预约：' + spot.ticket + '。出行前记得先确认开放时间。', act: 'cruise' });
    (spot.facts || []).slice(0, 2).forEach(function (f) {
      s.push({ t: '一个有意思的冷知识——' + f, act: 'cruise' });
    });
    (spot.relSpots || []).slice(0, 3).forEach(function (n, i) {
      s.push({ t: '看完这里，不妨把' + n + '也排进同一天的行程，距离不远，顺路刚刚好。', act: 'focus:' + (3 + i), poi: n });
    });
    if ((spot.relFoods || []).length) {
      s.push({ t: '逛累了？' + spot.city + '的' + spot.relFoods[0] + '就在不远处，转一圈的功夫刚好吃上一顿。', act: 'food' });
    }
    s.push({ t: '这就是' + spot.name + '。等你真正站在这里的时候，记得回来告诉我，眼前的实景比云游更美。', act: 'end' });
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
    u.lang = 'zh-CN';
    u.rate = 0.95;
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

  /* ---------- 全景视图（canvas 圆柱投影） ---------- */
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
    /* 圆柱：把图按 yaw 偏移平铺三次实现无缝环绕 */
    var ratio = H / W;
    var sliceW = Math.max(1, Math.round(im.width * (im.height / im.width > ratio ? ratio * im.width / im.width : 1)));
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
    /* 暗角 */
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
  PanoView.prototype.destroy = function () { this._raf && cancelAnimationFrame(this._raf); this.ok = false; };

  /* ---------- 环绕视图（CSS 3D 八方位） ---------- */
  function RingView(stage, photos) {
    var self = this;
    this.stage = stage;
    this.wrap = document.createElement('div');
    this.wrap.className = 'vr-ring3d';
    var spin = document.createElement('div');
    spin.className = 'vr-spin';
    this.spin = spin;
    var N = photos.length || 8;
    var R = 380;
    photos.forEach(function (p, i) {
      var f = document.createElement('div');
      f.className = 'vr-face';
      f.style.transform = 'rotateY(' + (i * 360 / N) + 'deg) translateZ(-' + R + 'px)';
      f.innerHTML = '<img src="' + esc(p.src) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<span class="vr-cap">' + esc(p.label || '') + '</span>';
      spin.appendChild(f);
    });
    this.wrap.appendChild(spin);
    stage.appendChild(this.wrap);
    this.yaw = 0; this.pitch = 0; this.vyaw = 0; this.vpitch = 0;
    this.cruise = 0; this.N = N; this.R = R;
    this._raf = requestAnimationFrame(function () { self.frame(); });
    this._loopOn = true;
    this._loop = function () { if (!self._loopOn) return; self.frame(); requestAnimationFrame(self._loop); };
    requestAnimationFrame(this._loop);
  }
  RingView.prototype.frame = function () {
    var k = 0.004;
    this.yaw += this.vyaw * k + this.cruise;
    this.pitch += this.vpitch * k;
    this.vyaw *= 0.94; this.vpitch *= 0.94;
    if (this.pitch > 18) this.pitch = 18;
    if (this.pitch < -18) this.pitch = -18;
    this.spin.style.transform = 'rotateX(' + this.pitch + 'deg) rotateY(' + this.yaw + 'deg) translateZ(140px)';
    var deg = ((this.yaw % 360) + 360) % 360;
    this.compass && this.compass(deg.toFixed(0) + '° · 方位 ' + (Math.round(deg / (360 / this.N)) + 1) + '/' + this.N);
  };
  RingView.prototype.drag = function (dx, dy) {
    this.vyaw -= dx * 4.2;
    this.vpitch += dy * 2.2;
  };
  RingView.prototype.faceTo = function (index) {
    var self = this;
    var target = 360 - index * (360 / this.N);
    var from = this.yaw;
    var steps = 60, cur = 0;
    var timer = setInterval(function () {
      cur++;
      self.yaw = from + (target - from) * (cur / steps);
      if (cur >= steps) clearInterval(timer);
    }, 16);
  };
  RingView.prototype.destroy = function () { this._loopOn = false; };

  /* ---------- 挂载 ---------- */
  function mount(spot) {
    if (!spot || !spot.name) return;
    injectStyle();
    var host = document.getElementById('meMap');
    if (!host) return;
    var root = document.createElement('div');
    root.className = 'myl-vr';
    root.innerHTML =
      '<h3><i class="fas fa-vr-cardboard" style="color:#7c3aed"></i> VR 云游 · AI 解说' +
        '<span class="vr-badge">陀螺仪环视 · 语音导览</span><span class="vr-sub">' + esc(spot.name) + '</span></h3>' +
      '<p class="vr-intro">画面可以上下左右自由拖动；点「开始解说」，AI 导游带你边转边讲；手机上还能开启陀螺仪，转动手机看四周。</p>' +
      '<div class="vr-stage" id="vrStage">' +
        '<span class="vr-compass" id="vrCompass">0°</span>' +
        '<span class="vr-modechip" id="vrMode">加载中</span>' +
        '<span class="vr-hint">左右拖动环视 · 上下拖动调整视角</span>' +
      '</div>' +
      '<div class="vr-ctrl">' +
        '<button class="vr-btn play" id="vrPlay"><i class="fas fa-play"></i> 开始解说</button>' +
        '<button class="vr-btn gyro" id="vrGyro"><i class="fas fa-mobile-screen"></i> 陀螺仪</button>' +
        '<button class="vr-btn cruise" id="vrCruise"><i class="fas fa-route"></i> 自动巡航</button>' +
        '<button class="vr-btn fs" id="vrFs"><i class="fas fa-expand"></i> 全屏</button>' +
      '</div>' +
      '<div class="vr-cap-bar idle" id="vrCap"><i class="fas fa-comment-dots ic"></i><span>解说字幕会显示在这里——欢迎语、景点故事、冷知识、顺路推荐，全都讲给你听。</span></div>';

    var mapCard = host.querySelector ? host : host;
    if (host.nextSibling && host.nextSibling.parentNode) {
      host.parentNode.insertBefore(root, host.nextSibling);
    } else if (host.parentElement) {
      host.parentElement.appendChild(root);
    }

    var stage = root.querySelector('#vrStage');
    var capBar = root.querySelector('#vrCap');
    var modeChip = root.querySelector('#vrMode');
    var view = null, pano = null;

    function setCompass(fn) { if (view && view.compass === undefined) view.compass = fn; else if (view) view.compass = fn; }

    function caption(text, busy) {
      capBar.className = 'vr-cap-bar' + (busy ? '' : ' idle');
      capBar.innerHTML = '<i class="fas fa-comment-dots ic"></i><span>' + esc(text) + '</span>';
    }

    /* --- 全景优先，失败回退环绕 --- */
    var PANO = window.PANO_DATA || {};
    var pd = PANO[spot.name];
    function initRing() {
      modeChip.textContent = '360° 环绕 · AI 生成';
      var photos = collectPhotos(spot);
      view = new RingView(stage, photos);
      setCompass(function (t) { root.querySelector('#vrCompass').textContent = t; });
      bindDrag(view);
    }
    if (pd && pd.src) {
      modeChip.textContent = '实景全景 · 360°';
      pano = new PanoView(stage);
      view = pano;
      setCompass(function (t) { root.querySelector('#vrCompass').textContent = t; });
      bindDrag(pano);
      pano.load(pd.src, function () { stage.querySelector('canvas') && stage.querySelector('canvas').remove(); pano.destroy(); initRing(); });
    } else {
      initRing();
    }

    /* --- 拖拽（Pointer 事件，兼容触摸） --- */
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
        if (!view) return;
        if (view.cruiseOn !== undefined) view.cruiseOn = true;
        if (item.act === 'cruise' || item.act === 'start') {
          if (pano) pano.cruise = 0.0006;
          else view.cruise = 0.12;
        } else if (item.act && item.act.indexOf('focus:') === 0) {
          if (pano) pano.cruise = 0.0012;
          else view.cruise = 0;
          var fi = parseInt(item.act.split(':')[1], 10);
          if (!pano && view.faceTo) view.faceTo(Math.min(fi, view.N - 1));
        } else if (item.act === 'food') {
          if (pano) pano.cruise = 0.0009;
          else if (view.faceTo) view.faceTo(view.N - 1);
        } else if (item.act === 'end') {
          if (pano) pano.cruise = 0;
          else view.cruise = 0.1;
        }
      },
      function (playing) {
        var btn = root.querySelector('#vrPlay');
        if (playing) { btn.innerHTML = '<i class="fas fa-stop"></i> 停止解说'; }
        else { btn.innerHTML = '<i class="fas fa-play"></i> 开始解说'; caption('解说结束。想再来一遍？点上方按钮。', false); }
      }
    );
    root.querySelector('#vrPlay').onclick = function () {
      if (narrator.on) { narrator.stop(); }
      else { narrator.play(buildScript(spot)); }
    };

    /* --- 自动巡航开关 --- */
    var cruiseBtn = root.querySelector('#vrCruise');
    cruiseBtn.onclick = function () {
      var on = !cruiseBtn.classList.contains('on');
      cruiseBtn.classList.toggle('on', on);
      if (pano) pano.cruise = on ? 0.0006 : 0;
      else if (view) view.cruise = on ? 0.12 : 0;
    };

    /* --- 陀螺仪 --- */
    var gyroBtn = root.querySelector('#vrGyro');
    var gyroOn = false;
    function gyroHandler(e) {
      if (!view || !gyroOn) return;
      var g = e.gamma || 0, b = e.beta || 0;
      view.yaw = -(g / 90) * 180;
      if (pano) { pano.yaw = ((-(g / 90)) % 1 + 1) % 1; pano.pitch = Math.max(-1, Math.min(1, (b - 45) / 60)); }
      else { view.pitch = Math.max(-18, Math.min(18, (b - 55) / 3)); }
    }
    gyroBtn.onclick = function () {
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
    };

    /* --- 全屏 --- */
    root.querySelector('#vrFs').onclick = function () {
      if (!document.fullscreenElement) {
        (stage.requestFullscreen || stage.webkitRequestFullscreen || function(){}).call(stage);
      } else {
        document.exitFullscreen && document.exitFullscreen();
      }
      setTimeout(function () { pano && pano.resize(); }, 300);
    };
  }

  window.MYL_VR = { mount: mount };
})();
