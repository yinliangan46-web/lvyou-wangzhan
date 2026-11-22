/* ============================================================
 * MYL · 实景云游板块（v2 全新改版）
 * 位置：景点详情页地图卡片下方
 * 三种实景模式（自动选择，可手动切换）：
 *   A) 真实街景（境外城市）：接入 Google 街景实景拍摄车画面，真实可环视
 *   B) 真实 VR 全景 360°：芊云专属作品（挂载前检测背景音乐，含 BGM 一律不自动嵌入）/ Wikimedia 坐标周边真全景
 *   C) 手动全景：PANO_DATA 命中的景点用真宽幅全景图
 * 无真素材的景点明确提示"暂无专属全景"，绝不用无关照片冒充（已删除旧版
 * "上一张/下一镜头"照片漫游格式）
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
    /* 网站城市名 → 芊云数据键名（地级州/地区全称） */
    var ALIAS = {
      '大理': '大理白族自治州', '西双版纳': '西双版纳傣族自治州', '恩施': '恩施土家族苗族自治州',
      '湘西': '湘西土家族苗族自治州', '喀什': '喀什地区', '伊犁': '伊犁哈萨克自治州',
      '阿勒泰': '阿勒泰地区', '甘孜': '甘孜藏族自治州', '阿坝': '阿坝藏族羌族自治州',
      '凉山': '凉山彝族自治州', '迪庆': '迪庆藏族自治州', '北京': '北京', '上海': '上海',
      '天津': '天津', '重庆': '重庆'
    };
    var list = CD[(ALIAS[spot.city] || spot.city || '').replace(/市$/, '')] || CD[spot.city || ''] || [];
    if (!list.length) return null;
    var nm = spot.name || '';
    /* 垃圾作品过滤（住宅/门店/会议等），专属匹配同样适用 */
    var junk = /(验收|家装|小区|房间|婚礼|测试|室内|样板|装修|店铺|宿舍|报告厅|直播间|工地|车位|办公室|校园|学校|学院|大学|中学|小学|会场|会议|成立|大会|典礼|开业|楼盘|号楼|单元|室$|门店|食堂|教学|实训|培训|售楼|样板间|营业厅|宿舍楼|公寓|客房|酒店|宾馆|餐厅|火锅|面馆|奶茶|烘焙|美容|理发|洗车|4S|展厅|汽车服务|维修|手机|电脑|电器|五金|建材|汽配|\d室\d厅|平米|平方|户型|门面|●|◎|售房|旗舰店|服务中心)/;
    /* 归一化：去掉「景区/风景区/旅游区/公园/步行街/古镇/古城」等后缀再双向包含匹配 */
    var bare = nm.replace(/(风景名胜)?(旅游)?(景区|风景区|度假区|步行街|历史街区|公园|古镇|古城|老街|旅游区)$/g, '');
    var i, wname;
    if (bare && bare.length >= 2 && bare !== nm) {
      for (i = 0; i < list.length; i++) {
        wname = list[i][1] || '';
        if (junk.test(wname)) continue;
        if (wname.indexOf(bare) > -1 || bare.indexOf(wname) > -1) return { id: list[i][0], name: wname };
      }
    }
    if (nm) {
      for (i = 0; i < list.length; i++) {
        wname = list[i][1] || '';
        if (junk.test(wname)) continue;
        if (wname.indexOf(nm) > -1 || nm.indexOf(wname) > -1) return { id: list[i][0], name: wname };
      }
    }
    /* 严格原则：只认本景点专属作品（名称双向包含）。
       没有专属作品就不提供芊云——绝不用同城其他景区的作品冒充 */
    return null;
  }

  var CSS = ''
    + '.myl-vr{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,0,0,.05)}'
    + '.myl-vr h3{margin:0 0 6px;font-size:17px;display:flex;align-items:center;gap:8px;color:#222}'
    + '.myl-vr h3 .vr-badge{font-size:11px;font-weight:700;color:#0e9f8a;background:#e9f7f4;border:1px solid #bfe8df;border-radius:99px;padding:2px 9px}'
    + '.myl-vr h3 .vr-sub{font-size:12px;font-weight:400;color:#999;margin-left:auto}'
    + '.vr-intro{font-size:13px;color:#777;margin-bottom:12px}'
    + '.vr-stage{position:relative;border-radius:14px;overflow:hidden;background:#0d1321;aspect-ratio:16/9;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}'
    + '.vr-stage:active{cursor:grabbing}'
    + '.vr-stage canvas,.vr-street{position:absolute;inset:0;width:100%;height:100%}'
    + '.vr-qy-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}'
    + '.vr-qy-cover{position:absolute;left:0;right:0;height:56px;z-index:2;pointer-events:none}'
    + '.vr-qy-cover.top{top:0;background:linear-gradient(to bottom,rgba(5,8,16,.92) 0%,rgba(5,8,16,.55) 55%,rgba(5,8,16,0) 100%)}'
    + '.vr-qy-cover.bottom{bottom:0;background:linear-gradient(to top,rgba(5,8,16,.92) 0%,rgba(5,8,16,.55) 55%,rgba(5,8,16,0) 100%)}'
    + '.vr-street iframe{position:absolute;inset:0;width:100%;height:100%;border:0}'
    + '.vr-compass{position:absolute;top:10px;left:12px;color:rgba(255,255,255,.85);font-size:11px;background:rgba(0,0,0,.35);border-radius:99px;padding:4px 12px;letter-spacing:2px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-modechip{position:absolute;top:10px;right:12px;color:#fff;font-size:11px;background:rgba(14,159,138,.82);border-radius:99px;padding:4px 12px;backdrop-filter:blur(4px);pointer-events:none;z-index:3}'
    + '.vr-modechip.google{background:rgba(30,110,235,.82)}'
    + '.vr-modechip.tx{background:rgba(55,130,255,.85)}'
    + '.vr-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:rgba(255,255,255,.55);font-size:13px;text-align:center;padding:0 24px}'
    + '.vr-empty i{font-size:34px;color:rgba(255,255,255,.25)}'
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

  /* ---------- 芊云作品背景音乐检测（公开 API，无需登录） ----------
     部分作品作者配置了背景音乐，芊云播放器会自动播放且跨域 iframe 无法从外部静音，
     故挂载前先检测：含 BGM 的作品一律不自动嵌入（结果缓存 7 天）。 */
  function qyBgmCheck(id) {
    return new Promise(function (res) {
      var key = 'myl_qy_bgm_' + id;
      try {
        var c = JSON.parse(localStorage.getItem(key) || 'null');
        if (c && Date.now() - c.t < 7 * 86400 * 1000) return res(c.v);
      } catch (e) {}
      var done = false;
      var t = setTimeout(function () { if (!done) { done = true; res(true); } }, 5000);
      fetch('https://api.9kvr.cn/api/tour/getAllConfig.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=' + encodeURIComponent(id)
      }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        if (done) return; done = true; clearTimeout(t);
        var mp3 = d && d.info && d.info.config_music && d.info.config_music.mp3;
        var v = !!mp3;
        try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: v })); } catch (e) {}
        res(v);
      }).catch(function () { if (done) return; done = true; clearTimeout(t); res(true); });
    });
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
    var drawW = Math.round(drawH * (im.width / im.height) * (this.stretch || 1.35));
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
  PanoView.prototype.loadCanvas = function (cv) {
    this.img = cv; this.ok = true; this.resize();
    this._raf = requestAnimationFrame(this._loop);
  };

  /* ---------- 伪全景合成：普通实拍照片 → 2:1 球面全景图 ----------
     中央为原照，左右循环镜像对称延展（360° 一整圈只见主体一次），
     顶/底用原图边缘行拉伸补天空/地面，拖动环视观感接近真实全景球面。
     返回离屏 canvas，直接作为 PanoView 绘制源（无需导出，跨域图也能用）。 */
  function fakeEquirect(img) {
    var W = Math.max(1024, Math.min(2048, Math.round((img.width || 1600) * 2.2)));
    var H = W >> 1;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');
    var ar = (img.width || 16) / (img.height || 10);
    var ph = Math.round(H * 0.74);
    var pw = Math.round(ph * ar);
    if (pw > W * 0.56) { pw = Math.round(W * 0.56); ph = Math.round(pw / ar); }
    var px = Math.round((W - pw) / 2), py = Math.round((H - ph) / 2);
    x.fillStyle = '#101828';
    x.fillRect(0, 0, W, H);
    /* 天/地带：原图顶/底边缘拉伸 */
    try {
      if (img.width) {
        x.drawImage(img, 0, 0, img.width, 6, 0, 0, W, py + 1);
        x.drawImage(img, 0, img.height - 6, img.width, 6, 0, py + ph - 1, W, H - py);
      }
    } catch (e) {}
    /* 循环镜像平铺填满左右 */
    function seg(sx, fl) {
      x.save();
      if (fl) {
        x.translate(sx + pw, py);
        x.scale(-1, 1);
        x.drawImage(img, 0, 0, img.width, img.height, 0, 0, pw, ph);
      } else {
        x.drawImage(img, 0, 0, img.width, img.height, sx, py, pw, ph);
      }
      x.restore();
    }
    var flip = true, cx = px;
    while (cx > 0) { seg(cx - pw, flip); cx -= pw; flip = !flip; }
    flip = true; cx = px + pw;
    while (cx < W) { seg(cx, flip); cx += pw; flip = !flip; }
    /* 中央原照最后覆盖（消除中心接缝） */
    x.drawImage(img, 0, 0, img.width, img.height, px, py, pw, ph);
    return c;
  }

  /* ---------- 本景点实拍照片收集（用于照片全景化） ----------
     只收本景点自己的画面：POI 主图 + 详情页图库，绝不用周边景点/美食图冒充。 */
  function collectPhotos(spot) {
    var poi = window.mylPOIImg || function () { return ''; };
    var list = [], seen = {};
    /* 剔除 images/cities/ 城市通用图（与本景点无关且多为 404），只留本景点画面 */
    function add(src, label) { if (src && !seen[src] && !/\/images\/cities\//.test(src)) { seen[src] = 1; list.push({ src: src, label: label }); } }
    /* bing 图搜词重写：原词含「写实风光 氛围感」等模糊修饰，泛称景点
       （大蜀山/包公园等）极易搜偏（大蜀山→雪山图）。重写为
       「城市+景点名+实景锚定词」，把搜索牢牢锚定在本景点上 */
    var QMAP = { '主图': '实拍全景', '全景': '外景', '细节': '近景', '特写': '近景特写', '清晨': '清晨风光', '黄昏': '黄昏风光', '人文': '游人', '夜景': '夜景' };
    function bingFix(src, suffix) {
      if (!/cn\.bing\.net\/th\?/.test(src) || typeof URL === 'undefined') return src;
      try {
        var u = new URL(src);
        u.searchParams.set('q', (spot.city ? spot.city + ' ' : '') + spot.name + ' ' + suffix);
        return u.toString();
      } catch (e) { return src; }
    }
    (spot.gallery || []).forEach(function (g) {
      var label = String(g.label || '');
      var tail = label.split('·').pop().trim();
      add(bingFix(g.src, QMAP[tail] || '实景'), label);
    });
    add(bingFix(spot.hero, '实拍'), spot.name + ' · 主图');
    add(poi(spot.name, spot.type, spot.city), spot.name + ' · 实拍');
    return list;
  }

  /* ---------- 全网真 360° 全景检索（Wikimedia Commons，免费无 Key） ----------
     只认 2:1 附近的等距柱状全景（equirectangular），宽幅普通照片一律不冒充 VR：
     点进「VR 全景」必须是可 360° 环视的真全景，否则明确提示暂无专属全景。
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
      var overall = setTimeout(function () { res(null); }, 5000);
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

  /* ---------- Commons 坐标周边实拍照片（用于照片全景化） ----------
     与 commonsPano 不同：不要求 2:1 等距全景，普通实拍照片也收。
     坐标周边 600 米的照片地理上保证属于本景点（比图搜可靠得多）。 */
  function commonsPhotos(spot) {
    return new Promise(function (res) {
      var key = 'myl_cm_photos_' + (spot.city || '') + '_' + spot.name;
      try {
        var c = JSON.parse(localStorage.getItem(key) || 'null');
        if (c && Date.now() - c.t < 7 * 86400 * 1000) return res(c.v);
      } catch (e) {}
      var out = [], done = false;
      var overall = setTimeout(finish, 5000);
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(overall);
        try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: out })); } catch (e) {}
        res(out);
      }
      function pick(d) {
        var pages = (d && d.query && d.query.pages) || {};
        Object.keys(pages).forEach(function (k) {
          var ii = pages[k].imageinfo && pages[k].imageinfo[0];
          if (!ii || !ii.url || !/jpe?g$/i.test(ii.url)) return;
          var w = ii.width || 0, h = ii.height || 1;
          if (w >= 900 && w / h >= 1.25 && w / h <= 3.2) {
            out.push({ src: ii.thumburl || ii.url, credit: String(pages[k].title || '').replace(/^File:/, '') });
          }
        });
      }
      function fetchUrl(url) {
        var ac = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        var timer = ac ? setTimeout(function () { ac.abort(); }, 5000) : null;
        return fetch(url, ac ? { signal: ac.signal } : undefined).then(function (r) {
          if (timer) clearTimeout(timer);
          return r.ok ? r.json() : null;
        }).then(pick).catch(function () { if (timer) clearTimeout(timer); });
      }
      var coord = findCoord(spot.city, spot.name);
      var p1 = coord
        ? fetchUrl('https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=' +
            coord[1] + '|' + coord[0] + '&ggsradius=600&ggsnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|size&iiurlwidth=1600&format=json&origin=*')
        : Promise.resolve();
      var p2 = fetchUrl('https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
        encodeURIComponent(spot.name + ' ' + (spot.city || '')) + '&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|size&iiurlwidth=1600&format=json&origin=*');
      Promise.all([p1, p2]).then(finish, finish);
    });
  }

  /* ---------- 模式 A：真实街景（Google 街景实景拍摄） ----------
     有精确坐标时用 cbll 定位（直接进入实景画面，境外城市效果好）；
     无坐标时按名称搜索引用。国内城市无 Google 街景覆盖，不作为默认模式。 */
  function StreetView(stage, spec) {
    this.stage = stage;
    this.wrap = document.createElement('div');
    this.wrap.className = 'vr-street';
    var fr = document.createElement('iframe');
    fr.setAttribute('allowfullscreen', 'true');
    fr.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    fr.loading = 'eager';
    if (spec && spec.cbll) {
      fr.src = 'https://maps.google.com/maps?q=&layer=c&cbll=' + spec.cbll +
        '&cbp=11,0,0,0,0&output=svembed&hl=zh-CN';
    } else {
      fr.src = 'https://maps.google.com/maps?q=' + encodeURIComponent((spec && spec.q) || '') +
        '&layer=c&output=svembed&hl=zh-CN';
    }
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
      '<p class="vr-intro">点「开始解说」，AI 导游用真人语音带你边看边讲（中英双语）。境外城市接入 Google 实景街景；国内城市展示本景点专属的真实 360° 全景，无专属全景的景点用本景点实拍照片渲染成 360° 环幕。全程无声，站内直接观看。</p>' +
      '<div class="vr-stage" id="vrStage">' +
        '<span class="vr-compass" id="vrCompass">0°</span>' +
        '<span class="vr-modechip" id="vrMode">加载中</span>' +
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
    var ctrl = root.querySelector('#vrCtrl');
    var noteEl = root.querySelector('#vrNote');

    var view = null, pano = null, mode = null, streetOK = false;
    /* Google 实景搜索关键词：景点名 + 城市（境外无坐标时用） */
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
      Array.prototype.slice.call(stage.querySelectorAll('canvas,.vr-street,.vr-qy-frame,.vr-qy-cover,.vr-empty')).forEach(function (el) { el.remove(); });
    }

    /* --- 模式装配 ---
       芊云转换原则：任何模式都可一键进入芊云全景；退出时回到进入前的模式。
       国内景点绝不自动展示 Google 地图（无街景覆盖只会显示地图，不是街景）。 */
    var pendingPano = null;
    var lastNonQy = null;      /* 进入芊云前的模式 */
    var lastStreetSpec = null; /* 街景参数（cbll 坐标 或 q 名称） */
    function applyMode(m, streetSpec) {
      clearView();
      mode = m;
      view = null; pano = null;
      if (m !== 'qy') lastNonQy = m;
      if (streetSpec) lastStreetSpec = streetSpec;
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
          /* 手动全景图加载失败：本景点芊云全景 → 检索真全景 → 照片全景化 */
          if (qyHit) { applyMode('qy'); return; }
          commonsPano(spot).then(function (h) {
            if (h) { pendingPano = h; applyMode('net'); } else applyMode('photo');
          });
        });
      } else if (m === 'net') {
        modeChip.textContent = '真实 VR · 360° 全景实拍';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '左右拖动环视 · 上下拖动调整视角';
        noteEl.innerHTML = '<i class="fas fa-vr-cardboard"></i> 本景点 360° 实拍全景：' + esc(pendingPano.credit || 'Wikimedia Commons');
        pano = new PanoView(stage);
        view = pano;
        view.compass = setCompassText;
        bindDrag(pano);
        pano.load(pendingPano.src, function () {
          stage.querySelector('canvas') && stage.querySelector('canvas').remove();
          pano.destroy();
          if (qyHit) applyMode('qy'); else applyMode('photo');
        });
      } else if (m === 'street') {
        modeChip.textContent = '真实街景 · 实景拍摄';
        modeChip.className = 'vr-modechip google';
        hintEl.textContent = '在街景画面内拖动即可环视 · 双指缩放';
        var spec = streetSpec || lastStreetSpec || { q: streetQuery };
        lastStreetSpec = spec;
        view = new StreetView(stage, spec);
        noteEl.innerHTML = '画面为 Google 街景实拍。' + (qyHit ? '可点「切换芊云全景」互换。' : '');
        compassEl.textContent = '实景';
      } else       if (m === 'qy') {
        /* 芊云全景 VR 作品（仅限检测无背景音乐的作品）：iframe 页面内嵌入，上下遮幅屏蔽平台品牌标识 */
        var qyId = qyHit ? qyHit.id : '';
        modeChip.textContent = '真实 VR · 720° 全景漫游';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '画面内自由拖动环视 · 场景间热点切换';
        var fr = document.createElement('iframe');
        fr.className = 'vr-qy-frame';
        fr.setAttribute('allowfullscreen', 'true');
        /* autoplay 'none'：浏览器层面禁止芊云播放器自动播放音频（双保险；
           含 BGM 的作品已在挂载前被拦截，不会进入本模式） */
        fr.setAttribute('allow', "autoplay 'none'; gyroscope; accelerometer; xr-spatial-tracking");
        fr.src = 'https://9kvr.cn/tour/index?id=' + encodeURIComponent(qyId);
        stage.appendChild(fr);
        var cTop = document.createElement('div');
        cTop.className = 'vr-qy-cover top';
        stage.appendChild(cTop);
        var cBottom = document.createElement('div');
        cBottom.className = 'vr-qy-cover bottom';
        stage.appendChild(cBottom);
        var qyLabel = qyHit && qyHit.name ? esc(qyHit.name) : esc(spot.name);
        noteEl.innerHTML = '「' + esc(spot.name) + '」专属全景作品：' + qyLabel + ' · 实景拍摄可 360° 环视' +
          '。打开时已静音；若点按画面后出现背景音乐，点画面右上角菜单的「音乐」图标即可关闭。';
      } else if (m === 'photo') {
        /* 照片全景化：本景点实拍照片 → 合成 2:1 伪全景球面图 → 全景播放器渲染
           （无声 · 站内直看；仅在无真 VR 素材时使用）。来源优先 Commons 坐标周边实拍 */
        modeChip.textContent = '正在合成 360° 全景…';
        modeChip.className = 'vr-modechip';
        commonsPhotos(spot).then(function (cl) {
          if (mode !== 'photo') return;
          var phList = (cl || []).concat(collectPhotos(spot));
          var phIdx = 0;
          function tryPhoto() {
            if (phIdx >= phList.length) { applyMode('none'); return; }
            var item = phList[phIdx];
            var im = new Image();
            im.onload = function () {
              if (mode !== 'photo') return;
              modeChip.textContent = '景点实拍 · 360° 全景';
              hintEl.textContent = '左右拖动环视 · 上下拖动调整视角';
              noteEl.innerHTML = item.credit
                ? '<i class="fas fa-camera"></i> 本景点实拍照片全景化：' + esc(item.credit) + '（Wikimedia Commons）'
                : '';
              pano = new PanoView(stage);
              pano.stretch = 1;   /* 2:1 全景图正好环绕一圈 */
              view = pano;
              view.compass = setCompassText;
              bindDrag(pano);
              pano.loadCanvas(fakeEquirect(im));
            };
            im.onerror = function () { phIdx++; tryPhoto(); };
            im.src = item.src;
          }
          tryPhoto();
        });
      } else {
        /* 无任何素材（图库也为空）才提示，绝不拿无关照片冒充 */
        modeChip.textContent = '暂无专属全景';
        modeChip.className = 'vr-modechip';
        hintEl.textContent = '';
        var empty = document.createElement('div');
        empty.className = 'vr-empty';
        empty.innerHTML = '<i class="fas fa-vr-cardboard"></i>' +
          '<div>「' + esc(spot.name) + '」暂无 360° 全景素材。</div>' +
          '<div>本站只展示真实素材：境外实景街景、本景点专属全景作品，绝不用无关照片冒充。</div>';
        stage.appendChild(empty);
        noteEl.innerHTML = '';
      }
      /* 控制按钮统一在 view 就绪后重建（修复漫游模式镜头切换按钮不出现的问题） */
      rebuildCtrl();
    }

    /* --- 控制按钮（view 就绪后重建） --- */
    var playBtn = null, swapBtn = null, cruiseBtn = null, gyroBtn = null, fsBtn = null, langBtn = null;
    var vrLang = 'zh';
    function rebuildCtrl() {
      ctrl.innerHTML = '';
      playBtn = btn('play', 'fa-play', '开始解说', function () {
        if (narrator.on) { narrator.stop(); }
        else { narrator.play(buildScript(spot, vrLang)); }
      });
      langBtn = btn('lang', 'fa-language', vrLang === 'zh' ? 'English 解说' : '中文解说', function () {
        vrLang = vrLang === 'zh' ? 'en' : 'zh';
        langBtn.innerHTML = '<i class="fas fa-language"></i> ' + (vrLang === 'zh' ? 'English 解说' : '中文解说');
        if (narrator.on) { narrator.stop(); narrator.play(buildScript(spot, vrLang)); }
      });
      /* 360° 全景模式（手动全景 / 网络真全景）提供自动漫游与陀螺仪；街景/芊云/空态不需要 */
      if (mode === 'pano' || mode === 'net' || mode === 'photo') {
        cruiseBtn = btn('cruise', 'fa-route', '自动漫游', function () {
          var on = !cruiseBtn.classList.contains('on');
          cruiseBtn.classList.toggle('on', on);
          if (pano) pano.cruise = on ? 0.0006 : 0;
        });
        gyroBtn = btn('gyro', 'fa-mobile-screen', '陀螺仪', function () { toggleGyro(); });
      }
      /* 芊云全景转换：任何模式一键进入，退出回到进入前的模式 */
      if (qyHit) {
        swapBtn = btn('swap', 'fa-shuffle', mode === 'qy' ? '退出芊云全景' : '切换芊云全景', function () {
          if (narrator.on) narrator.stop();
          if (mode === 'qy') {
            applyMode(lastNonQy || (streetOK ? 'street' : 'none'), lastStreetSpec);
          } else {
            applyMode('qy');
          }
        });
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
        /* 画面保持静止，用户拖动才动（旧版照片镜头联动已随"上一张/下一镜头"一并删除） */
        if (pano && mode !== 'street') {
          pano.cruise = 0;
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

    /* --- 启动调度（严格执行：绝不显示无关景区、国内绝不出谷歌地图） ---
       国内：本景点专属芊云全景作品直接嵌入（真 VR，打开时浏览器禁止其自动播放声音）
             → 其次 Commons 坐标周边真全景 → 都没有则本景点实拍照片全景化。
       （谷歌大陆无街景覆盖，检索只会出平面地图，故国内不接入。）
       境外：谷歌街景（精确坐标直达景点本体，海外坐标见 city-spot-coords-intl.js），
       芊云专属作品可互换。 */
    var PANO = window.PANO_DATA || {};
    var qyHit = qyvrMatch(spot);
    var country = countryOf(spot.city);
    var isCN = !country || country === '中国' || country.indexOf('中国') > -1;
    if (PANO[spot.name] && PANO[spot.name].src) {
      applyMode('pano');
    } else if (isCN) {
      if (qyHit) {
        /* 本景点专属芊云全景作品：直接嵌入（打开时由浏览器禁止其自动播放声音） */
        applyMode('qy');
      } else {
        modeChip.textContent = '正在检索 360° 真全景…';
        commonsPano(spot).then(function (hit) {
          if (mode !== null) return;
          if (hit) { pendingPano = hit; applyMode('net'); }
          else applyMode('photo');
        });
      }
    } else {
      modeChip.textContent = '正在检索真实街景…';
      var pCommons = commonsPano(spot);
      probeGoogle().then(function (ok) {
        streetOK = ok;
        if (ok) {
          pCommons.then(function (hit) { if (hit) pendingPano = hit; });
          var coord = findCoord(spot.city, spot.name);
          applyMode('street', coord ? { cbll: coord[1] + ',' + coord[0] } : { q: streetQuery });
        } else {
          pCommons.then(function (hit) {
            if (mode !== null) return;
            if (hit) { pendingPano = hit; applyMode('net'); return; }
            if (qyHit) applyMode('qy'); else applyMode('photo');
          });
        }
      });
    }
  }

  window.MYL_VR = { mount: mount };
})();
