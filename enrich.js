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

  /* ---------- 坐标查找（多级兜底：内置景点库 → 热点库 → 城市中心） ---------- */
  function fuzzySpotKey(map, city, name) {
    /* 模糊匹配：城市前缀一致且景点名互含（兼容「夫子庙」↔「夫子庙步行街」这类差异） */
    var prefix = city ? city + '·' : '';
    var best = null, bestLen = -1;
    for (var k in map) {
      if (prefix && k.indexOf(prefix) !== 0) continue;
      var spotPart = prefix ? k.slice(prefix.length) : k.split('·').pop();
      if (spotPart === name) return map[k];
      if (spotPart.indexOf(name) > -1 || name.indexOf(spotPart) > -1) {
        /* 越短越精确，取重叠最短的避免「夫子庙」错配到超长名称 */
        if (best === null || spotPart.length < bestLen) { best = map[k]; bestLen = spotPart.length; }
      }
    }
    return best;
  }
  function findCoord(city, name) {
    var C = window.CITY_SPOT_COORDS || {};
    var H = window.CITY_HOTSPOT_COORDS || {};
    var keys = [];
    if (city && name) keys.push(coordKey(city, name));
    if (name) keys.push(name);
    for (var i = 0; i < keys.length; i++) {
      if (C[keys[i]]) return C[keys[i]];
      if (H[keys[i]]) return H[keys[i]];
    }
    /* 模糊匹配两张表（防止「夫子庙」因后缀差异查不到而落到错误兜底） */
    if (name) {
      var fz = fuzzySpotKey(C, city, name) || fuzzySpotKey(H, city, name);
      if (fz) return fz;
    }
    /* 城市级兜底：优先城市中心（保证在正确城市内），再用任一城市景点坐标 */
    if (city) {
      if (window.MYL_CITY_CENTERS && window.MYL_CITY_CENTERS[city]) {
        return window.MYL_CITY_CENTERS[city];
      }
      for (var k in C) {
        if (k.indexOf(city + '·') === 0 && C[k]) return C[k];
      }
      for (var h in H) {
        if (h.indexOf(city + '·') === 0 && H[h]) return H[h];
      }
    }
    return null;
  }

  var geoCache = {};
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
  /* 城市中心解析（离线表 → Nominatim），用于给景点搜索加视野框限定 */
  function cityCenter(city) {
    var CC = window.MYL_CITY_CENTERS || {};
    if (city && CC[city]) return Promise.resolve(CC[city]);
    var C = window.CITY_SPOT_COORDS || {};
    if (city) {
      for (var k in C) {
        if (k.indexOf(city + '·') === 0 && C[k]) return Promise.resolve(C[k]);
      }
    }
    return geocode(city || '');
  }
  function geocode(q, center) {
    var ck = 'nom:' + q + (center ? '|b' : '');
    var cached = geoCacheGet(ck);
    if (cached !== null) return Promise.resolve(cached);
    /* center 传入时限定 ±2° 视野框并强制结果落在框内，杜绝同名/异地错配（如"独库公路"→宿迁） */
    var box = '';
    if (center) {
      var d = 2;
      box = '&viewbox=' + (center[0] - d) + ',' + (center[1] + d) + ',' + (center[0] + d) + ',' + (center[1] - d) + '&bounded=1';
    }
    var ac = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ac ? setTimeout(function () { ac.abort(); }, 8000) : null;
    return fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=zh&limit=1' + box + '&q=' + encodeURIComponent(q), ac ? { signal: ac.signal } : undefined)
      .then(function (r) { if (timer) clearTimeout(timer); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function (e) { if (timer) clearTimeout(timer); throw e; })
      .then(function (list) {
        var v = (list && list[0]) ? [parseFloat(list[0].lon), parseFloat(list[0].lat)] : null;
        geoCacheSet(ck, v);
        return v;
      })
      .catch(function () { return null; });
  }
  /* 返回 {coord:[lng,lat], kind:'spot'|'geocoded'|'city'}，确保地图总能显示 */
  function resolveCoord(city, name, cb) {
    var c = findCoord(city, name);
    if (c) { cb({ coord: c, kind: 'spot' }); return; }
    cityCenter(city).then(function (center) {
      geocode(city + ' ' + name, center).then(function (g1) {
        if (g1) { cb({ coord: g1, kind: 'geocoded' }); return; }
        geocode(name, center).then(function (g1b) {
          if (g1b) { cb({ coord: g1b, kind: 'geocoded' }); return; }
          cb({ coord: center, kind: center ? 'city' : null });
        });
      });
    });
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
    var ac = (typeof AbortController !== 'undefined') ? new AbortController() : null;
    var timer = ac ? setTimeout(function () { ac.abort(); }, 8000) : null;
    return fetch(url, ac ? { signal: ac.signal } : undefined).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function (e) {
      if (timer) clearTimeout(timer);
      throw e;
    });
  }
  /* 备用源：wttr.in（Open-Meteo 国内网络不稳时自动降级） */
  /* wttr 的天气码是自家编码（113=晴），转成 WMO 码复用现有图标表 */
  var WTTR2WMO = {
    113:0, 116:2, 119:3, 122:3, 143:45, 176:61, 179:71, 182:67, 185:56,
    200:95, 227:71, 230:75, 248:45, 260:45, 263:51, 266:51, 281:56,
    293:61, 296:61, 299:63, 302:63, 305:65, 308:65, 311:66, 314:67,
    317:67, 320:67, 323:71, 326:71, 329:73, 332:73, 335:75, 338:75,
    350:77, 353:80, 356:81, 359:82, 362:66, 365:67, 368:85, 371:85,
    374:77, 377:77, 386:95, 389:95, 392:95, 395:95
  };
  function wttrToWmo(c) { return WTTR2WMO[c] != null ? WTTR2WMO[c] : 3; }
  function wttrWeather(city, name) {
    var q = encodeURIComponent(city || name || '北京');
    return fetch('https://wttr.in/' + q + '?format=j1&lang=zh').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      if (!d || !d.weather || !d.weather.length) throw new Error('empty');
      var cc = (d.current_condition || [])[0] || {};
      var days = d.weather.slice(0, 7).map(function (w) {
        var hrs = w.hourly || [];
        var noon = hrs.filter(function (h) { return +h.time === 1200; })[0] || hrs[0] || {};
        var pops = hrs.map(function (h) { return +h.chanceofrain || 0; });
        return {
          date: w.date,
          code: wttrToWmo(+noon.weatherCode),
          max: Math.round(+w.maxtempC),
          min: Math.round(+w.mintempC),
          pop: pops.length ? Math.max.apply(null, pops) : null
        };
      });
      var minAll = Math.min.apply(null, days.map(function (x) { return x.min; }).concat([99]));
      var maxAll = Math.max.apply(null, days.map(function (x) { return x.max; }).concat([0]));
      var rainy = days.some(function (x) { return x.pop != null && x.pop >= 50; });
      return {
        src: 'wttr.in',
        now: cc.temp_C != null ? { t: Math.round(+cc.temp_C), info: wmoInfo(wttrToWmo(+cc.weatherCode)) } : null,
        days: days, tip: outfitTip(minAll, maxAll, rainy)
      };
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
            src: 'Open-Meteo',
            now: w.current ? { t: Math.round(w.current.temperature_2m), info: wmoInfo(w.current.weather_code) } : null,
            days: days, tip: outfitTip(minAll, maxAll, rainy)
          };
          cacheSet(cKey, out);
          return out;
        });
    }).catch(function () {
      /* 主源失败 → 备用源 wttr.in，同样写入缓存 */
      return wttrWeather(city, name).then(function (w) {
        cacheSet(cKey, w);
        return w;
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
    '.me-retry{margin-left:10px;border:1px solid #2c9ca8;background:#fff;color:#2c9ca8;border-radius:8px;padding:4px 12px;font-size:12.5px;cursor:pointer;font-weight:600}' +
    '.me-retry:hover{background:#2c9ca8;color:#fff}' +
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

  function loadLeaflet(cb, onFail) {
    if (window.L) { cb(); return; }
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'vendor/leaflet/leaflet.css';
    document.head.appendChild(css);
    var sc = document.createElement('script');
    sc.src = 'vendor/leaflet/leaflet.js';
    sc.onload = cb;
    sc.onerror = function () { onFail && onFail(); };
    document.head.appendChild(sc);
  }

  /* ---------- 注入 ---------- */
  function run(spot) {
    if (!spot || !spot.name) return;
    /* 美食详情页不挂天气卡、地图卡与 VR 全景：这些与菜品本身无关，
       美食页只保留菜品档案、口感、工序、吃法与选店内容。 */
    if (spot.type === 'food') return;
    injectStyle();
    var host = document.getElementById('sdMain');
    if (!host) return;
    var root = document.createElement('div');
    root.className = 'myl-enrich';
    root.innerHTML =
      '<div class="me-card" id="meWeather"><h3><i class="fas fa-cloud-sun" style="color:#f5a623"></i> 未来 7 天天气' +
        '<span class="me-sub">' + esc(spot.city || spot.name) + ' · Open-Meteo</span></h3><div class="me-body"><div class="me-empty">天气加载中…</div></div></div>' +
      '<div class="me-card" id="meMap"><h3><i class="fas fa-map-location-dot" style="color:#2c9ca8"></i> 位置与导航' +
        '<span class="me-sub">高德地图</span></h3><div class="me-body"><div class="me-empty">地图加载中…</div></div></div>';
    host.insertBefore(root, host.firstChild);

    /* 天气卡片（双源降级：Open-Meteo → wttr.in，均失败显示重试按钮） */
    var wBody = root.querySelector('#meWeather .me-body');
    function weatherFail() {
      wBody.innerHTML = '<div class="me-empty">天气加载失败（可能是网络波动，两个数据源都没连通）' +
        '<button type="button" class="me-retry" id="wxRetry">↻ 重试</button></div>';
      var rb = wBody.querySelector('#wxRetry');
      if (rb) rb.addEventListener('click', function () {
        wBody.innerHTML = '<div class="me-empty">天气加载中…</div>';
        try {
          var c = JSON.parse(localStorage.getItem('myl_weather_cache') || '{}');
          delete c[(spot.city || '') + '|' + spot.name];
          localStorage.setItem('myl_weather_cache', JSON.stringify(c));
        } catch (e) {}
        getWeather(spot.city, spot.name).then(renderW).catch(weatherFail);
      });
    }
    function renderW(w) {
      var sub = root.querySelector('#meWeather .me-sub');
      if (sub && w.src) sub.textContent = esc(spot.city || spot.name) + ' · ' + w.src;
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
    }
    getWeather(spot.city, spot.name).then(renderW).catch(weatherFail);

    /* 地图与导航（三级坐标兜底，确保每个景点都有地图）
       体验原则：导航按钮先渲染（零依赖），地图与定位异步补齐；
       VR 板块立即挂载，绝不等待地图/定位脚本 */
    var mBody = root.querySelector('#meMap .me-body');
    var q = encodeURIComponent(spot.name);
    var cityQ = encodeURIComponent(spot.city || spot.name);
    /* 无坐标时导航退化为「关键词搜索」URI，依然可用 */
    function navLinks(kind, lat, lng) {
      if (kind === 'spot' || kind === 'geocoded') {
        var gcj = wgs2gcj(lat, lng);
        return '<a class="me-btn amap" target="_blank" rel="noopener" href="https://uri.amap.com/marker?position=' + gcj[1] + ',' + gcj[0] + '&name=' + q + '&src=myl&callnative=1"><i class="fas fa-location-arrow"></i> 高德导航</a>' +
          '<a class="me-btn bmap" target="_blank" rel="noopener" href="https://api.map.baidu.com/marker?location=' + lat + ',' + lng + '&title=' + q + '&content=' + q + '&output=html&coord_type=wgs84&src=myl"><i class="fas fa-map-pin"></i> 百度地图</a>' +
          '<a class="me-btn qqmap" target="_blank" rel="noopener" href="https://apis.map.qq.com/uri/v1/marker?marker=coord:' + gcj[0] + ',' + gcj[1] + ';title:' + q + ';addr:' + q + '&referer=myl"><i class="fas fa-compass"></i> 腾讯地图</a>';
      }
      return '<a class="me-btn amap" target="_blank" rel="noopener" href="https://uri.amap.com/search?keyword=' + q + '&city=' + cityQ + '&src=myl&callnative=1"><i class="fas fa-location-arrow"></i> 高德导航</a>' +
        '<a class="me-btn bmap" target="_blank" rel="noopener" href="https://api.map.baidu.com/place/search?query=' + q + '&region=' + cityQ + '&output=html&src=myl"><i class="fas fa-map-pin"></i> 百度地图</a>' +
        '<a class="me-btn qqmap" target="_blank" rel="noopener" href="https://apis.map.qq.com/uri/v1/geocoder?keyword=' + q + '&region=' + cityQ + '&referer=myl"><i class="fas fa-compass"></i> 腾讯地图</a>';
    }
    var shareLink = '<a class="me-btn share" href="share.html?mode=spot&spot=' + encodeURIComponent(spot.name) + '&city=' + encodeURIComponent(spot.city || '') + '&desc=' + encodeURIComponent(spot.desc || '') + '&ticket=' + encodeURIComponent(spot.ticket || '') + '"><i class="fas fa-share-nodes"></i> 生成分享卡</a>';

    /* ① 导航按钮立即渲染（不依赖 Leaflet / 定位 / 网络） */
    mBody.innerHTML = '<div id="meMapBox" class="me-map"><div class="me-empty" style="display:flex;align-items:center;justify-content:center;height:100%">定位加载中…</div></div>' +
      '<div class="me-navrow">' + navLinks('search') + shareLink + '</div>';

    /* ② VR 板块立即挂载（紧跟地图卡片之下，任何景点必定挂载，不等地图） */
    if (window.MYL_VR) window.MYL_VR.mount(spot);

    /* ③ 地图异步补齐：Leaflet 就绪 + 定位成功后替换占位区 */
    loadLeaflet(function () {
      resolveCoord(spot.city, spot.name, function (res) {
        if (!window.L) return;
        var box = document.getElementById('meMapBox');
        if (!box) return;        if (!res || !res.coord) {
          /* 极端情况（无网且无缓存）：导航按钮已渲染，仅提示地图不可用 */
          box.innerHTML = '<div class="me-empty" style="display:flex;align-items:center;justify-content:center;height:100%">地图服务暂不可用（离线或网络受限），可直接用下方按钮导航。</div>';
          return;
        }
        var kind = res.kind, lat = res.coord[1], lng = res.coord[0];
        var gcj = wgs2gcj(lat, lng);
        box.innerHTML = '';
        /* 用精确定位链接替换初始占位的搜索链接 */
        var oldRow = mBody.querySelector('.me-navrow');
        if (oldRow) oldRow.outerHTML = '<div class="me-navrow">' + navLinks(kind, lat, lng) + shareLink + '</div>';
        try {
          var map = L.map('meMapBox', { scrollWheelZoom: false });
          /* 高德瓦片：国内直连可靠（OSM 瓦片服务器在国内大面积被墙导致地图全灰），
             坐标同步转 GCJ-02 对齐瓦片，避免定位针偏移到相邻街区 */
          L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
            subdomains: ['1', '2', '3', '4'], maxZoom: 18, attribution: '© 高德地图'
          }).addTo(map);
          var popHtml = kind === 'city'
            ? '<b>' + esc(spot.city || '') + '市中心</b><br><span style="color:#888">未定位到「' + esc(spot.name) + '」精确位置，导航按钮按名称搜索</span>'
            : '<b>' + esc(spot.name) + '</b>' + (spot.city ? '<br>' + esc(spot.city) : '');
          /* 内联 SVG 定位针：不依赖 marker-icon.png（该文件缺失曾导致 404 且无图钉） */
          var pin = L.divIcon({
            className: '',
            html: '<div style="filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))">' +
              '<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">' +
              '<path d="M15 1C7.8 1 2 6.8 2 14c0 9.4 11.1 21.2 12.3 22.4a1 1 0 0 0 1.4 0C16.9 35.2 28 23.4 28 14 28 6.8 22.2 1 15 1z" fill="#e2585b" stroke="#fff" stroke-width="1.6"/>' +
              '<circle cx="15" cy="14" r="5.5" fill="#fff"/></svg></div>',
            iconSize: [30, 42],
            iconAnchor: [15, 40],
            popupAnchor: [0, -40]
          });
          L.marker([gcj[0], gcj[1]], { icon: pin }).addTo(map).bindPopup(popHtml);
          map.setView([gcj[0], gcj[1]], kind === 'city' ? 12 : 14);
          box.addEventListener('click', function () { map.scrollWheelZoom.enable(); });
          box.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });
          setTimeout(function () { map.invalidateSize(); }, 60);
        } catch (e) {
          box.innerHTML = '<div class="me-empty" style="display:flex;align-items:center;justify-content:center;height:100%">地图初始化失败，可直接用下方按钮导航。</div>';
        }
      });
    }, function () {
      /* Leaflet 脚本加载失败（弱网/被墙）：导航按钮已可用，仅更新占位提示 */
      var box = document.getElementById('meMapBox');
      if (box) box.innerHTML = '<div class="me-empty" style="display:flex;align-items:center;justify-content:center;height:100%">地图脚本加载失败（网络受限），可直接用下方按钮导航。</div>';
    });
  }

  window.MYL_ENRICH = { run: run };
})();
