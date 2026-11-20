/* ============================================================
 * MYL 景点详情页 · 增强模块（v1 新功能集成）
 * 功能：1) 目的地 7 天天气卡片（Open-Meteo，免费无 Key）
 *       2) Leaflet 交互地图 + 高德/百度/腾讯一键导航
 *       3) 生成分享海报入口（share.html）
 * 由 spot-detail.js 在渲染完成后调用：MYL_ENRICH.run(spot)
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function coordKey(city, name) {
    return city + '·' + name;
  }

  /* WGS-84 -> GCJ-02（高德/腾讯坐标体系） */
  function wgs2gcj(lat, lng) {
    var a = 6378245.0, ee = 0.00669342162296594323;
    function tLat(x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
      return ret;
    }
    function tLng(x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
      return ret;
    }
    var dLat = tLat(lng - 105.0, lat - 35.0);
    var dLng = tLng(lng - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * Math.PI;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng];
  }

  /* ---------- 坐标查找 ---------- */
  function findCoord(city, name) {
    var C = window.CITY_SPOT_COORDS || {};
    var keys = [];
    if (city && name) keys.push(coordKey(city, name));
    if (name) keys.push(name);
    for (var i = 0; i < keys.length; i++) {
      if (C[keys[i]]) return C[keys[i]];
    }
    /* 城市级兜底：取该城市任一景点坐标 */
    if (city) {
      for (var k in C) {
        if (k.indexOf(city + '·') === 0 && C[k]) return C[k];
      }
    }
    return null;
  }

  /* ---------- 天气 ---------- */
  var WMO = {
    0: ['晴', '☀️'], 1: ['大体晴朗', '🌤️'], 2: ['多云', '⛅'], 3: ['阴', '☁️'],
    45: ['雾', '🌫️'], 48: ['雾凇', '🌫️'],
    51: ['毛毛雨', '🌦️'], 53: ['小雨', '🌦️'], 55: ['中雨', '🌧️'],
    56: ['冻雨', '🌧️'], 57: ['冻雨', '🌧️'],
    61: ['小雨', '🌦️'], 63: ['中雨', '🌧️'], 65: ['大雨', '🌧️'],
    66: ['冻雨', '🌧️'], 67: ['强冻雨', '🌧️'],
    71: ['小雪', '🌨️'], 73: ['中雪', '🌨️'], 75: ['大雪', '❄️'], 77: ['雪粒', '🌨️'],
    80: ['阵雨', '🌦️'], 81: ['阵雨', '🌧️'], 82: ['强阵雨', '⛈️'],
    85: ['阵雪', '🌨️'], 86: ['阵雪', '❄️'],
    95: ['雷阵雨', '⛈️'], 96: ['雷阵雨伴冰雹', '⛈️'], 99: ['强雷雨冰雹', '⛈️']
  };
  function wmoInfo(code) {
    return WMO[code] || ['—', '🌡️'];
  }
  function outfitTip(min, max, rainy) {
    if (rainy) return '有雨，记得带伞，室内景点更稳妥';
    if (min <= 0) return '寒冷，羽绒服 + 保暖内搭';
    if (min <= 10) return '偏冷，外套/风衣 + 长袖';
    if (min <= 18) return '舒适，薄外套早晚备用';
    if (max >= 32) return '炎热，防晒 + 补水，避开正午暴晒';
    return '温度宜人，轻装出行即可';
  }
  var weatherCache = {};
  function cacheGet(key) {
    try {
      var c = JSON.parse(localStorage.getItem('myl_weather_cache') || '{}');
      var hit = c[key];
      if (hit && Date.now() - hit.t < 6 * 3600 * 1000) return hit.v;
    } catch (e) {}
    return null;
  }
  function cacheSet(key, val) {
    try {
      var c = JSON.parse(localStorage.getItem('myl_weather_cache') || '{}');
      c[key] = { t: Date.now(), v: val };
      localStorage.setItem('myl_weather_cache', JSON.stringify(c));
    } catch (e) {}
  }
  function fetchJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function getWeather(city, name) {
    var cKey = city + '|' + name;
    var cached = cacheGet(cKey);
    if (cached) return Promise.resolve(cached);
    var coord = findCoord(city, name);
    var p = coord
      ? Promise.resolve({ lat: coord[1], lng: coord[0] })
      : fetchJSON('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city || name) + '&count=1&language=zh&format=json')
          .then(function (g) {
            var hit = g && g.results && g.results[0];
            if (!hit) throw new Error('no geocode');
            return { lat: hit.latitude, lng: hit.longitude };
          });
    return p.then(function (c) {
      return fetchJSON('https://api.open-meteo.com/v1/forecast?latitude=' + c.lat + '&longitude=' + c.lng +
        '&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7')
        .then(function (w) {
          var d = w.daily || {};
          var days = (d.time || []).map(function (t, i) {
            return {
              date: t,
              code: d.weather_code[i],
              max: Math.round(d.temperature_2m_max[i]),
              min: Math.round(d.temperature_2m_min[i]),
              pop: d.precipitation_probability_max == null ? null : d.precipitation_probability_max[i]
            };
          });
          var minAll = Math.min.apply(null, days.map(function (x) { return x.min; }).concat([99]));
          var maxAll = Math.max.apply(null, days.map(function (x) { return x.max; }).concat([0]));
          var rainy = days.some(function (x) { return x.pop != null && x.pop >= 50; });
          var out = {
            now: w.current ? { t: Math.round(w.current.temperature_2m), info: wmoInfo(w.current.weather_code) } : null,
            days: days, tip: outfitTip(minAll, maxAll, rainy)
          };
          cacheSet(cKey, out);
          return out;
        });
    });
  }

  /* ---------- 样式 ---------- */
  var CSS =
    '.myl-enrich{max-width:1080px;margin:26px auto 0;padding:0 18px;font-family:inherit}' +
    '.myl-enrich .me-card{background:#fff;border:1px solid rgba(0,0,0,.07);border-radius:16px;padding:20px 22px;margin-bottom:16px;box-shadow:0 4px 18px rgba(0,0,0,.05)}' +
    '.myl-enrich h3{margin:0 0 14px;font-size:17px;display:flex;align-items:center;gap:8px;color:#222}' +
    '.myl-enrich h3 .me-sub{font-size:12px;font-weight:400;color:#999;margin-left:auto}' +
    '.me-wrow{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}' +
    '.me-wday{flex:0 0 auto;min-width:78px;text-align:center;background:#f7f8fa;border-radius:12px;padding:10px 6px}' +
    '.me-wday .ic{font-size:22px}.me-wday .d{font-size:12px;color:#666;margin-top:4px}' +
    '.me-wday .t{font-size:13px;font-weight:600;color:#222}.me-wday .p{font-size:11px;color:#4a90d9}' +
    '.me-tip{margin-top:12px;font-size:13px;color:#555;background:#f0f7ff;border-radius:10px;padding:9px 12px}' +
    '.me-map{height:300px;border-radius:12px;overflow:hidden;position:relative;z-index:0}' +
    '.me-navrow{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}' +
    '.me-btn{display:inline-flex;align-items:center;gap:6px;border:none;cursor:pointer;border-radius:10px;padding:9px 16px;font-size:13.5px;font-weight:600;color:#fff;text-decoration:none;transition:opacity .15s}' +
    '.me-btn:hover{opacity:.85}.me-btn.amap{background:#0e6feb}.me-btn.bmap{background:#e2585b}.me-btn.qqmap{background:#2c9ca8}.me-btn.share{background:linear-gradient(120deg,#ff7a45,#ff4d6d)}' +
    '.me-empty{font-size:13px;color:#999}' +
    '@media(max-width:640px){.myl-enrich{padding:0 12px}.me-map{height:240px}}';

  function injectStyle() {
    if (document.getElementById('myl-enrich-css')) return;
    var s = document.createElement('style');
    s.id = 'myl-enrich-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function loadLeaflet(cb) {
    if (window.L) { cb(); return; }
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'vendor/leaflet/leaflet.css';
    document.head.appendChild(css);
    var sc = document.createElement('script');
    sc.src = 'vendor/leaflet/leaflet.js';
    sc.onload = cb;
    document.head.appendChild(sc);
  }

  /* ---------- 注入 ---------- */
  function run(spot) {
    if (!spot || !spot.name) return;
    injectStyle();
    var host = document.getElementById('sdMain');
    if (!host) return;
    var root = document.createElement('div');
    root.className = 'myl-enrich';
    root.innerHTML =
      '<div class="me-card" id="meWeather"><h3><i class="fas fa-cloud-sun" style="color:#f5a623"></i> 未来 7 天天气' +
        '<span class="me-sub">' + esc(spot.city || spot.name) + ' · Open-Meteo</span></h3><div class="me-body"><div class="me-empty">天气加载中…</div></div></div>' +
      '<div class="me-card" id="meMap"><h3><i class="fas fa-map-location-dot" style="color:#2c9ca8"></i> 位置与导航' +
        '<span class="me-sub">OpenStreetMap</span></h3><div class="me-body"><div class="me-empty">地图加载中…</div></div></div>';
    host.insertBefore(root, host.firstChild);

    /* 天气卡片 */
    var wBody = root.querySelector('#meWeather .me-body');
    getWeather(spot.city, spot.name).then(function (w) {
      var rows = w.days.map(function (d) {
        var info = wmoInfo(d.code);
        var dt = new Date(d.date + 'T12:00:00');
        var label = (d.date === w.days[0].date) ? '今天' : ['周日','周一','周二','周三','周四','周五','周六'][dt.getDay()];
        return '<div class="me-wday"><div class="d">' + label + '</div><div class="ic">' + info[1] + '</div>' +
          '<div class="t">' + d.min + '° / ' + d.max + '°</div>' +
          (d.pop != null ? '<div class="p">降水 ' + d.pop + '%</div>' : '') + '</div>';
      }).join('');
      var nowLine = w.now ? '<div class="d" style="text-align:right;font-size:12px;color:#888;margin-bottom:8px">当前 ' + w.now.t + '°C ' + w.now.info[0] + '</div>' : '';
      wBody.innerHTML = nowLine + '<div class="me-wrow">' + rows + '</div><div class="me-tip"><i class="fas fa-shirt"></i> ' + esc(w.tip) + '</div>';
    }).catch(function () {
      wBody.innerHTML = '<div class="me-empty">天气服务暂不可用（离线或网络受限）</div>';
    });

    /* 地图与导航 */
    loadLeaflet(function () {
      var mBody = root.querySelector('#meMap .me-body');
      var coord = findCoord(spot.city, spot.name);
      if (!coord) {
        mBody.innerHTML = '<div class="me-empty">暂无该景点精确坐标，可直接用下方按城市导航。</div>';
        coord = findCoord(spot.city, spot.city) || findCoord(spot.city, '');
        if (!coord) return;
      }
      var lat = coord[1], lng = coord[0];
      var gcj = wgs2gcj(lat, lng);
      var q = encodeURIComponent(spot.name);
      var links =
        '<a class="me-btn amap" target="_blank" rel="noopener" href="https://uri.amap.com/marker?position=' + gcj[1] + ',' + gcj[0] + '&name=' + q + '&src=myl&callnative=1"><i class="fas fa-location-arrow"></i> 高德导航</a>' +
        '<a class="me-btn bmap" target="_blank" rel="noopener" href="https://api.map.baidu.com/marker?location=' + lat + ',' + lng + '&title=' + q + '&content=' + q + '&output=html&coord_type=wgs84&src=myl"><i class="fas fa-map-pin"></i> 百度地图</a>' +
        '<a class="me-btn qqmap" target="_blank" rel="noopener" href="https://apis.map.qq.com/uri/v1/marker?marker=coord:' + gcj[0] + ',' + gcj[1] + ';title:' + q + ';addr:' + q + '&referer=myl"><i class="fas fa-compass"></i> 腾讯地图</a>' +
        '<a class="me-btn share" href="share.html?mode=spot&spot=' + encodeURIComponent(spot.name) + '&city=' + encodeURIComponent(spot.city || '') + '&desc=' + encodeURIComponent(spot.desc || '') + '&ticket=' + encodeURIComponent(spot.ticket || '') + '"><i class="fas fa-share-nodes"></i> 生成分享卡</a>';
      mBody.innerHTML = '<div id="meMapBox" class="me-map"></div><div class="me-navrow">' + links + '</div>';
      try {
        var map = L.map('meMapBox', { scrollWheelZoom: false });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18, attribution: '© OpenStreetMap'
        }).addTo(map);
        L.marker([lat, lng]).addTo(map).bindPopup('<b>' + esc(spot.name) + '</b>' + (spot.city ? '<br>' + esc(spot.city) : ''));
        map.setView([lat, lng], 14);
        var box = document.getElementById('meMapBox');
        box.addEventListener('click', function () { map.scrollWheelZoom.enable(); });
        box.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });
        setTimeout(function () { map.invalidateSize(); }, 60);
      } catch (e) {
        mBody.innerHTML = '<div class="me-empty">地图初始化失败</div>' + mBody.innerHTML;
      }
      /* VR 云游板块：紧跟地图卡片之下 */
      if (window.MYL_VR) window.MYL_VR.mount(spot);
    });
  }

  window.MYL_ENRICH = { run: run };
})();
