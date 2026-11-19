/* ============================================================
 * MYL 统一城市索引
 * 聚合站内现有数据源，按等级对外提供城市清单与详情。
 * 不重写大数据文件；各数据源在页面中以 <script src> 先行加载，
 * 本脚本读取其上挂在 window 上的全局变量，缺失时自动降级。
 *
 * 等级口径：
 *  A 级：CITY_DETAIL 内城市，具备行程节点/美食/酒店/交通/航班/高铁/预算/贴士
 *  B 级：仅在美食/历史/地标/坐标等库中出现，缺行程化详情与交通方案
 * ============================================================ */
(function () {
  var DET = window.CITY_DETAIL || {};
  var FOODS = window.CITY_FOODS || {};
  var HIST = window.CITY_HISTORY || {};
  var LAND = window.CITY_LANDMARKS || {};
  var COORDS = window.ALL_CITY_COORDS || {};
  var BANK = window.CITY_POI_BANK || {};

  function arr(v) { return Array.isArray(v) ? v : []; }

  /* A 级：完整详情 */
  var aList = Object.keys(DET).map(function (k) {
    var c = DET[k] || {};
    return {
      key: k,
      name: c.name || k,
      country: c.country || '',
      tier: 'A',
      tags: arr(c.tags),
      days: c.days || '',
      routePins: arr(c.routePins),
      itinerary: arr(c.itinerary),
      foods: arr(c.foods),
      hotels: arr(c.hotels),
      airfare: arr(c.airfare),
      trains: arr(c.trains),
      transport: arr(c.transport),
      budget: arr(c.budget),
      tips: arr(c.tips),
      coords: c.coords || null,
      bFoods: [],
      bLandmarks: [],
      bHistory: null
    };
  });

  var aNames = {};
  aList.forEach(function (c) { aNames[c.name] = true; });

  /* B 级：部分数据，按名称归并 */
  var bMap = {};
  function bCity(name) {
    if (aNames[name]) return null;
    if (!bMap[name]) {
      bMap[name] = {
        key: 'b-' + name,
        name: name,
        country: '',
        tier: 'B',
        tags: [],
        days: '',
        routePins: [],
        itinerary: [],
        foods: [],
        hotels: [],
        airfare: [],
        trains: [],
        transport: [],
        budget: [],
        tips: [],
        coords: COORDS[name] || null,
        bFoods: arr(FOODS[name]),
        bLandmarks: arr(LAND[name]).concat(arr(BANK[name])),
        bHistory: HIST[name] ? (HIST[name].summary || HIST[name].alias || null) : null
      };
    }
    return bMap[name];
  }
  Object.keys(FOODS).forEach(bCity);
  Object.keys(HIST).forEach(bCity);
  Object.keys(LAND).forEach(bCity);
  Object.keys(COORDS).forEach(bCity);
  Object.keys(BANK).forEach(bCity);

  var bList = Object.keys(bMap).map(function (n) { return bMap[n]; });
  var ALL = aList.concat(bList);

  function search(q) {
    var s = (q || '').trim().toLowerCase();
    if (!s) return ALL.slice();
    return ALL.filter(function (c) {
      return c.name.toLowerCase().indexOf(s) >= 0 ||
        (c.country || '').toLowerCase().indexOf(s) >= 0 ||
        c.tags.some(function (t) { return String(t).toLowerCase().indexOf(s) >= 0; });
    });
  }

  window.MYL = window.MYL || {};
  window.MYL.indexCities = function () { return ALL.slice(); };
  window.MYL.indexA级 = function () { return aList.slice(); };
  window.MYL.indexB级 = function () { return bList.slice(); };
  window.MYL.getCity = function (name) {
    return ALL.find(function (c) { return c.name === name; }) || null;
  };
  window.MYL.searchCities = search;
})();
