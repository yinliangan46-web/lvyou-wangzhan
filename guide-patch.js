/* ============================================================
 * MYL 前端占位兜底补丁（在 city-index.js 之后、页面脚本之前加载）
 * 1. 清理无文字的空胶囊节点
 * 2. 把“景区深度游览”等占位活动替换为该城 routePins 真实景点名
 * 3. 规整三餐占位活动文案；泛化详情兜底为本地特色餐食提示
 * 4. 全量城市统一按 A 级口径对齐：美食/地标/简介/兜底行程节点补齐，
 *    缺航班高铁酒店的城市标记 generic，由页面保留通用查询入口。
 * 不改动大数据文件；不编造具体班次、票价与酒店价格。
 * ============================================================ */
(function () {
  var M = window.MYL;
  if (!M) return;

  var AUG = window.CITY_AUGMENT || {};

  function mergeAug(c) {
    if (!c) return c;
    var a = AUG[c.name];
    if (!a) return c;
    var out = Object.assign({}, c);
    if (a.foods) out.foods = a.foods;
    if (a.itinerary) out.itinerary = a.itinerary;
    if (a.hotels) out.hotels = a.hotels;
    if (a.tags) out.tags = a.tags;
    return out;
  }

  var SCENE = ['景区深度游览', '全天游览自然风光或人文景点', '前往核心景区'];
  var LUNCH = ['午餐', '景区内午餐'];
  var DINNER = ['晚餐', '晚餐时间', '当地招牌晚餐', '当地口碑餐厅', '最后一次品尝当地特色美食'];
  var GENERIC = ['附近餐厅吃当地特色', '在景区附近吃当地特色', '找家本地咖啡馆休息一下',
    '推荐本地老字号或网红店', '当地口碑餐厅', '最后一次品尝当地特色美食'];

  function cleanCity(c) {
    if (!c) return c;
    c = mergeAug(c);
    var pins = (c.routePins || []).slice();
    var used = {};
    var itin = (c.itinerary || []).map(function (d) {
      var tl = (d.timeline || []).filter(function (t) {
        return t && ((t.activity && t.activity.trim()) || (t.detail && t.detail.trim()));
      }).map(function (t) {
        var node = Object.assign({}, t);
        var act = (node.activity || '').trim();
        pins.forEach(function (p) { if (act.indexOf(p) >= 0) used[p] = true; });

        if (SCENE.some(function (w) { return act.indexOf(w) >= 0; })) {
          var pin = pins.find(function (p) { return !used[p]; });
          if (pin) { node.activity = pin; used[pin] = true; }
        }
        if (LUNCH.indexOf(act) >= 0) node.activity = '午餐 · 本地特色';
        if (DINNER.indexOf(act) >= 0) node.activity = '晚餐 · 本地特色';

        var det = (node.detail || '').trim();
        if (GENERIC.some(function (w) { return det.indexOf(w) >= 0; })) {
          node.detail = '可安排本地特色餐食，具体参考下方美食推荐';
        }
        return node;
      });
      return Object.assign({}, d, { timeline: tl });
    });

    /* ---- 全量 A 级口径对齐 ---- */
    var bFoods = (c.bFoods || []).map(function (x) {
      return typeof x === 'string' ? { name: x, desc: '', price: '' } : x;
    });
    var foods = (c.foods || []).length ? c.foods : bFoods;
    var landmarks = (c.bLandmarks || []).slice();
    var history = c.bHistory || null;

    /* 行程节点为空时，用地标生成一天概览兜底行程 */
    if (!itin.length && landmarks.length) {
      itin = [{
        day: '当地概览',
        theme: '当地休闲体验',
        timeline: landmarks.map(function (n) {
          return { time: '', activity: n, detail: '当地代表性地标' };
        })
      }];
    }

    var hasTraffic = (c.airfare && c.airfare.length) || (c.trains && c.trains.length);
    var hasHotel = c.hotels && c.hotels.length;

    return Object.assign({}, c, {
      itinerary: itin,
      foods: foods,
      landmarks: landmarks,
      history: history,
      tier: 'A',
      generic: !hasTraffic && !hasHotel
    });
  }

  var origIndex = M.indexCities, origSearch = M.searchCities, origGet = M.getCity;
  M.indexCities = function () { return (origIndex ? origIndex() : []).map(cleanCity); };
  M.searchCities = function (q) { return (origSearch ? origSearch(q) : []).map(cleanCity); };
  M.getCity = function (n) { return cleanCity(origGet ? origGet(n) : null); };
})();
