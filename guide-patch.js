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

  /* ---- 索引中缺失、但主题线路等页面需要的额外城市 ----
     仅补景点/美食/简介/行程框架；不编造具体航班班次、车次与酒店价格，
     交通住宿由页面保留携程 / 12306 通用查询入口。 */
  var EXTRA = {
    '凤凰': {
      name: '凤凰', country: '中国', tags: ['古镇', '江景', '慢游', '湘西'], days: '2–3天',
      routePins: ['沱江跳岩', '凤凰古城墙', '虹桥', '沈从文故居', '吊脚楼群', '万名塔'],
      itinerary: [
        { day: 'Day 1', theme: '抵达·沱江夜景', timeline: [
          { time: '14:00', activity: '抵达凤凰古城', detail: '先到吉首再转班车进古城，约1小时车程' },
          { time: '16:00', activity: '入住江边客栈', detail: '住沱江边吊脚楼，方便傍晚看江景' },
          { time: '18:30', activity: '沱江跳岩漫步', detail: '跳岩与沿江石板街，日落时分光线最好', duration: '1.5小时' },
          { time: '20:00', activity: '晚餐 · 血粑鸭与苗家菜', detail: '本地老字号，咸香软糯' }
        ]},
        { day: 'Day 2', theme: '古城街巷·人文地标', timeline: [
          { time: '08:30', activity: '沈从文故居', detail: '小院与手稿陈列，了解边城故事', duration: '1小时' },
          { time: '10:00', activity: '虹桥与古城墙', detail: '虹桥跨沱江，城墙可俯瞰江面', duration: '1.5小时' },
          { time: '13:00', activity: '午餐 · 苗家酸汤鱼', detail: '酸辣开胃，配米饭' },
          { time: '15:00', activity: '吊脚楼群与万名塔', detail: '沿江吊脚楼拍照，万名塔为地标' },
          { time: '19:00', activity: '晚餐 · 沱江小鱼干、腊肉', detail: '湘西风味家常菜' }
        ]},
        { day: 'Day 3', theme: '清晨沱江·返程', timeline: [
          { time: '07:30', activity: '沱江晨雾', detail: '清晨江面薄雾，适合拍照' },
          { time: '09:30', activity: '老街自由闲逛买手信', detail: '姜糖、腊肉等本地特产' },
          { time: '11:30', activity: '返程', detail: '班车回吉首后转高铁或长途车' }
        ]}
      ],
      foods: [
        { name: '血粑鸭', desc: '糯米血粑焖鸭肉，咸香软糯', price: '¥60-90/份' },
        { name: '凤凰姜糖', desc: '街头现做，甜脆带姜味', price: '¥15-25/袋' },
        { name: '苗家酸汤鱼', desc: '酸辣开胃的江鱼锅', price: '¥70-110/份' },
        { name: '沱江小鱼干', desc: '佐酒下饭的本地小菜', price: '¥20-35/份' },
        { name: '腊肉糍粑', desc: '湘西风味主食，咸香软糯', price: '¥10-20/个' }
      ],
      landmarks: ['沱江跳岩', '凤凰古城墙', '虹桥', '沈从文故居', '吊脚楼群', '万名塔'],
      history: '湘西土家族苗族自治州凤凰县，沱江穿城而过，明清石板街与吊脚楼沿江而建，是苗族、土家族聚居的千年古镇。',
      tips: ['古城内石板路多，建议穿平底鞋', '临江客栈旺季需提前预订', '周边苗寨可请本地向导同行']
    },
    '首尔': {
      name: '首尔', country: '韩国', tags: ['都市', '潮流', '美妆', '购物'], days: '3–4天',
      routePins: ['明洞', '弘大步行街', '景福宫', '北村韩屋村', '东大门', '南山首尔塔'],
      itinerary: [
        { day: 'Day 1', theme: '明洞·南山塔夜景', timeline: [
          { time: '14:00', activity: '抵达首尔', detail: '机场快线进城，约1小时' },
          { time: '16:00', activity: '明洞商圈', detail: '美妆店、潮流小店集中地，可逛市集', duration: '2.5小时' },
          { time: '19:00', activity: '南山首尔塔', detail: '上山观景台看城市夜景', duration: '1.5小时' },
          { time: '20:30', activity: '晚餐 · 韩式炸鸡配啤酒', detail: '本地人气炸鸡店' }
        ]},
        { day: 'Day 2', theme: '古宫·韩屋村', timeline: [
          { time: '09:00', activity: '景福宫', detail: '朝鲜王朝正宫，穿韩服可免门票', duration: '2小时' },
          { time: '12:00', activity: '午餐 · 韩式烤肉', detail: '炭火烤肉配生菜' },
          { time: '14:00', activity: '北村韩屋村', detail: '传统韩屋街巷，阶梯巷可俯瞰老城', duration: '2小时' },
          { time: '16:30', activity: '仁寺洞街巷', detail: '传统茶具、手作与画廊小店' },
          { time: '19:00', activity: '晚餐 · 部队锅', detail: '火腿、泡面、芝士一锅煮' }
        ]},
        { day: 'Day 3', theme: '弘大·东大门', timeline: [
          { time: '10:00', activity: '弘大步行街', detail: '街头表演、潮牌与年轻氛围', duration: '2.5小时' },
          { time: '13:00', activity: '午餐 · 炒年糕与紫菜包饭', detail: '街头小吃组合' },
          { time: '15:00', activity: '汉江公园', detail: '江边骑行或草坪野餐', duration: '2小时' },
          { time: '19:00', activity: '东大门夜市', detail: '批发商圈与夜市，通宵可逛' }
        ]}
      ],
      foods: [
        { name: '韩式炸鸡啤酒', desc: '外脆里嫩，配冰啤酒', price: '¥60-90/份' },
        { name: '韩式烤肉', desc: '炭火五花肉/牛肉，生菜包食', price: '¥90-150/人' },
        { name: '部队锅', desc: '火腿、泡面、芝士与辣酱同煮', price: '¥70-110/份' },
        { name: '街头炒年糕', desc: '甜辣酱打底，可加鱼饼', price: '¥20-35/份' },
        { name: '红豆雪冰', desc: '刨冰配红豆与年糕，甜品收尾', price: '¥30-45/份' }
      ],
      landmarks: ['明洞', '弘大步行街', '景福宫', '北村韩屋村', '东大门', '南山首尔塔'],
      history: '韩国首都，汉江穿城，古宫与现代商圈交错，明洞、弘大是潮流与夜生活集中地。',
      tips: ['地铁可购买 T-money 交通卡', '景福宫周二闭馆', '明洞多数店铺支持中文与移动支付']
    }
  };

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
    var landmarks = (c.bLandmarks || c.landmarks || []).slice();
    var history = c.bHistory || c.history || null;

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

    /* 单日堆叠超过 8 个节点时，均分到 Day 1 / Day 2，避免一天塞满 */
    if (itin.length === 1 && itin[0].timeline.length >= 8) {
      var tl = itin[0].timeline;
      var half = Math.ceil(tl.length / 2);
      var base = itin[0];
      itin = [
        Object.assign({}, base, { day: 'Day 1', timeline: tl.slice(0, half) }),
        Object.assign({}, base, { day: 'Day 2', timeline: tl.slice(half) })
      ];
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

  function extraCity(name) {
    if (!name) return null;
    var main = String(name).split(/[·—-]/)[0].trim();
    var hit = EXTRA[name] || EXTRA[main];
    return hit ? Object.assign({}, hit) : null;
  }

  var origIndex = M.indexCities, origSearch = M.searchCities, origGet = M.getCity;
  M.getCity = function (n) {
    var c = origGet ? origGet(n) : null;
    if (!c) c = extraCity(n);
    return cleanCity(c);
  };
  M.indexCities = function () {
    var list = (origIndex ? origIndex() : []).map(cleanCity);
    Object.keys(EXTRA).forEach(function (k) {
      if (!list.some(function (x) { return x.name === k; })) {
        list.push(cleanCity(Object.assign({}, EXTRA[k])));
      }
    });
    return list;
  };
  M.searchCities = function (q) {
    var list = (origSearch ? origSearch(q) : []).map(cleanCity);
    var s = (q || '').trim().toLowerCase();
    Object.keys(EXTRA).forEach(function (k) {
      var e = EXTRA[k];
      if (list.some(function (x) { return x.name === k; })) return;
      var hit = !s || k.toLowerCase().indexOf(s) >= 0 ||
        (e.tags || []).some(function (t) { return String(t).toLowerCase().indexOf(s) >= 0; });
      if (hit) list.push(cleanCity(Object.assign({}, e)));
    });
    return list;
  };
})();
