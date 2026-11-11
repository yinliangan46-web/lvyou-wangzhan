/* ============================================================
 * MYL · AI 定制行程
 * 选城市 → 勾景点 → 自动生成路线图与每日行程 → 右侧 AI 助手随时改
 * 依赖：leaflet、loop-data.js(REAL_POI_COORDS)、province-data-all.js(ALL_CITY_COORDS)、
 *       script.js(_knownDict)
 * 说明：内置规划引擎开箱即用；也可在「接入设置」里填写豆包/DeepSeek 等
 *       OpenAI 兼容接口，由大模型来理解修改意图（密钥仅存本机 localStorage）。
 * ============================================================ */
(function () {
    'use strict';

    /* ==================== 常量 ==================== */
    var LS_PLAN = 'myl_planner_plan_v1';
    var LS_AI = 'myl_planner_ai_v1';
    var DAY_COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
    var HOT_CITIES = ['北京', '上海', '杭州', '成都', '西安', '南京', '重庆', '厦门',
        '青岛', '苏州', '长沙', '广州', '深圳', '武汉', '昆明', '三亚', '大理', '丽江', '桂林', '张家界'];

    var PREFS = [
        { key: 'nature', label: '自然风光', icon: 'fa-mountain' },
        { key: 'history', label: '历史人文', icon: 'fa-landmark' },
        { key: 'food', label: '美食', icon: 'fa-utensils' },
        { key: 'family', label: '亲子', icon: 'fa-child' },
        { key: 'photo', label: '出片', icon: 'fa-camera' },
        { key: 'relax', label: '慢节奏', icon: 'fa-mug-hot' }
    ];

    var AI_PRESETS = {
        builtin: { label: '内置规划引擎（无需配置，推荐）', endpoint: '', model: '' },
        doubao: { label: '豆包 · 火山方舟', endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', model: 'doubao-seed-1-6-250615' },
        deepseek: { label: 'DeepSeek', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
        custom: { label: '自定义 OpenAI 兼容接口 / 代理', endpoint: '', model: '' }
    };

    var TIER1 = ['北京', '上海', '广州', '深圳'];
    var TIER2 = ['杭州', '成都', '重庆', '西安', '南京', '苏州', '武汉', '长沙', '天津', '青岛',
        '厦门', '郑州', '昆明', '大连', '宁波', '合肥', '福州', '济南', '沈阳', '无锡',
        '佛山', '东莞', '珠海', '三亚'];

    /* 门票估算（按名称子串匹配，取最长命中） */
    var TICKETS = {
        '故宫': 60, '八达岭长城': 40, '颐和园': 30, '天坛': 15, '圆明园': 10, '鸟巢': 50,
        '秦始皇兵马俑': 120, '兵马俑': 120, '大雁塔': 50, '华清池': 120, '华山': 160,
        '鼓浪屿': 35, '拙政园': 80, '虎丘': 60, '周庄': 100, '乌镇': 150, '西塘': 100, '南浔': 100,
        '灵山大佛': 210, '黄山': 190, '千岛湖': 130, '西溪湿地': 80, '宋城': 300, '雷峰塔': 40,
        '灵隐寺': 75, '上海迪士尼': 475, '迪士尼': 475, '长隆': 300, '世界之窗': 220, '欢乐谷': 230,
        '东部华侨城': 200, '锦绣中华': 220, '张家界国家森林公园': 228, '天门山': 278, '玻璃桥': 138,
        '九寨沟': 190, '都江堰': 80, '大熊猫繁育研究基地': 55, '熊猫': 55, '峨眉山': 160, '乐山': 80,
        '布达拉宫': 200, '纳木错': 120, '青海湖': 90, '茶卡': 60, '莫高窟': 238, '鸣沙山': 110,
        '张掖': 74, '嘉峪关': 110, '天山天池': 125, '喀纳斯': 230, '蜈支洲岛': 144, '天涯海角': 68,
        '南山': 108, '玉龙雪山': 100, '苍山': 40, '漓江': 215, '龙脊梯田': 80, '泰山': 125,
        '崂山': 90, '蓬莱阁': 100, '刘公岛': 138, '云台山': 120, '龙门石窟': 90, '少林寺': 80,
        '老君山': 100, '殷墟': 70, '红旗渠': 100, '三峡大坝': 105, '恩施大峡谷': 120, '衡山': 110,
        '岳阳楼': 70, '丹霞山': 100, '开平碉楼': 80, '罗浮山': 60, '广州塔': 150, '陈家祠': 10,
        '白云山': 5, '青海湖二郎剑': 110, '塔尔寺': 70, '沙坡头': 100, '镇北堡': 100,
        '西夏王陵': 75, '崆峒山': 120, '麦积山': 90, '炳灵寺': 50, '黄帝陵': 90, '壶口瀑布': 90,
        '西递': 104, '宏村': 104, '九华山': 160, '天柱山': 130, '天堂寨': 115, '庐山': 160,
        '井冈山': 190, '三清山': 150, '婺源': 210, '龙虎山': 260, '武功山': 70, '武夷山': 140,
        '福建土楼': 90, '客家土楼': 90, '雁荡山': 140, '普陀山': 160, '南山文化旅游区': 108
    };
    var FREE_POI = ['外滩', '陆家嘴', '前门', '什刹海', '西湖', '宽窄巷子', '锦里', '回民街',
        '洪崖洞', '解放碑', '磁器口', '中山路', '环岛路', '深圳湾', '莲花山', '大梅沙', '沙面',
        '上下九', '北京路', '户部巷', '太平老街', '橘子洲', '大理古城', '丽江古城', '阳朔西街',
        '栈桥', '八大关', '五四广场', '东关街', '观前街', '平江路', '老门东', '曾厝垵',
        '南锣鼓巷', '翠湖', '大鹏所城', '车公庙', '鼓楼', '昙华林', '武大樱花园', '南普陀寺',
        '白堤', '苏堤', '中山陵', '夫子庙', '总统府', '玄武湖', '雨花台', '老门东', '金鸡湖',
        '同里古镇', '山塘街', '西湖文化广场', '黄浦江', '南京路', '王府井', '三里屯', '南长街'];

    /* ==================== 小工具 ==================== */
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function $(id) { return document.getElementById(id); }
    function num(n) { return Math.round(n).toLocaleString('zh-CN'); }
    function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

    function distKm(a, b) {
        var R = 6371, dLat = (b[1] - a[1]) * Math.PI / 180, dLng = (b[0] - a[0]) * Math.PI / 180;
        var la1 = a[1] * Math.PI / 180, la2 = b[1] * Math.PI / 180;
        var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    /* WGS-84 → GCJ-02（高德瓦片用） */
    function wgs2gcj(lng, lat) {
        var a = 6378245.0, ee = 0.00669342162296594323;
        function outOfChina(lng, lat) {
            return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
        }
        function tLat(x, y) {
            var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
            r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
            r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
            r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
            return r;
        }
        function tLng(x, y) {
            var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
            r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
            r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
            return r;
        }
        if (outOfChina(lng, lat)) return [lng, lat];
        var dLat = tLat(lng - 105, lat - 35), dLng = tLng(lng - 105, lat - 35);
        var radLat = lat / 180 * Math.PI, magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
        dLng = (dLng * 180) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
        return [lng + dLng, lat + dLat];
    }

    /* ==================== 数据目录 ==================== */
    var CATALOG = {};      // city -> {name, center, items[]}
    var CITY_PROV = {};    // city -> province name

    function classify(name) {
        var tags = [];
        if (/山|湖|海|岛|湾|林|湿地|草原|沙漠|峡谷|瀑布|溪|洞|泉|江|河|滩|峰|岭|谷|冰川|梯田|地质/.test(name)) tags.push('nature');
        if (/古镇|古城|寺|塔|宫|陵|博物|纪念馆|遗址|长城|祠|庙|府|关|楼|阁|园|书院|大佛|石窟|庙|城墙|皇陵|帅府|故居/.test(name)) tags.push('history');
        if (/街|夜市|小吃|美食|巷|集市|老城|食/.test(name)) tags.push('food');
        if (/锦里|宽窄巷子|回民街|户部巷|太平老街|曾厝垵|南锣鼓巷|夫子庙|观前街|东关街/.test(name) && tags.indexOf('food') < 0) tags.push('food');
        if (/乐园|海洋|动物|欢乐谷|方特|迪士尼|世界之窗|科技馆|水族|儿童|锦绣中华|极地|游乐园|影视城/.test(name)) tags.push('family');
        if (/景|湾|海|日落|观景|塔|峰|湖|岛|夜游|夜景/.test(name)) tags.push('photo');
        if (/温泉|古镇|湖|公园|度假|庄园|茶园|湿地|草原/.test(name)) tags.push('relax');
        return tags;
    }

    function buildCatalog() {
        var known = window._knownDict || {};
        var R = window.REAL_POI_COORDS || {};
        var centers = window.ALL_CITY_COORDS || {};
        var out = {};
        Object.keys(known).forEach(function (city) {
            var center = centers[city];
            if (!center || !isFinite(center[0])) return;
            var items = [], seen = {};
            (known[city] || []).forEach(function (name, idx) {
                if (!name || seen[name]) return;
                var c = R[city + '·' + name] || R[name];
                if (!c || !isFinite(c[0]) || !isFinite(c[1])) return;
                if (distKm(c, center) > 240) return;   // 明显不属于该城的坐标直接剔除
                seen[name] = 1;
                items.push({ name: name, city: city, lng: +c[0], lat: +c[1], idx: idx, cat: classify(name) });
            });
            if (items.length >= 3) out[city] = { name: city, center: center, items: items };
        });
        return out;
    }

    function buildProvMap() {
        var map = {};
        (window.PROVINCES_ALL || []).forEach(function (p) {
            (p.cities || []).forEach(function (c) {
                if (c && c.name) map[c.name] = p.name;
            });
        });
        return map;
    }

    function provShort(city) {
        var p = CITY_PROV[city] || '';
        return p.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区/g, '') || '中国';
    }

    /* ==================== 状态 ==================== */
    var state = {
        cities: [],
        days: 4,
        people: 2,
        prefs: [],
        picks: {},          // city -> [poiName]
        pace: 'normal',     // relaxed | normal | packed
        plan: null,
        msgs: [],
        aiCfg: null,
        map: null,
        busy: false
    };

    /* ==================== 行程引擎 ==================== */
    function prefScore(item) {
        var s = 0;
        (item.cat || []).forEach(function (t) {
            if (state.prefs.indexOf(t) >= 0) s += 3;
        });
        if (state.pace === 'relaxed' && (item.cat || []).indexOf('relax') >= 0) s += 1;
        return s;
    }

    function orderedForCity(city, names) {
        var cat = CATALOG[city];
        if (!cat) return [];
        var picked = [];
        names.forEach(function (n) {
            var hit = null;
            cat.items.forEach(function (it) { if (it.name === n) hit = it; });
            if (hit) picked.push(hit);
        });
        if (picked.length <= 2) return picked;
        // 起点选偏好分最高（同分取靠前），之后按最近邻串成顺路路线
        var startIdx = 0, best = -1;
        picked.forEach(function (p, i) {
            var sc = prefScore(p) * 10 - p.idx;
            if (sc > best) { best = sc; startIdx = i; }
        });
        var rest = picked.slice(), res = [];
        var cur = rest.splice(startIdx, 1)[0];
        res.push(cur);
        while (rest.length) {
            var bi = 0, bd = Infinity;
            rest.forEach(function (p, i) {
                var d = distKm([cur.lng, cur.lat], [p.lng, p.lat]);
                if (d < bd) { bd = d; bi = i; }
            });
            cur = rest.splice(bi, 1)[0];
            res.push(cur);
        }
        return res;
    }

    function chunkOrdered(arr, k) {
        var res = [], idx = 0;
        for (var i = 0; i < k; i++) {
            var remain = arr.length - idx;
            var parts = k - i;
            var size = Math.ceil(remain / Math.max(1, parts));
            res.push(arr.slice(idx, idx + size));
            idx += size;
        }
        return res;
    }

    function capPerDay() {
        return state.pace === 'relaxed' ? 2 : (state.pace === 'packed' ? 4 : 3);
    }

    function intercity(fromCity, toCity) {
        var a = CATALOG[fromCity] && CATALOG[fromCity].center;
        var b = CATALOG[toCity] && CATALOG[toCity].center;
        if (!a || !b) return { km: 0, mode: '高铁', hours: 1, cost: 0 };
        var km = Math.round(distKm(a, b) * 1.28);
        if (km <= 900) {
            return {
                km: km, mode: '高铁', hours: km / 230 + 0.6,
                cost: Math.round(km * 0.46 + 15)
            };
        }
        return { km: km, mode: '飞机', hours: km / 700 + 2.2, cost: Math.round(km * 0.55 + 180) };
    }

    function ticketOf(name) {
        var best = -1, price = 60;
        Object.keys(TICKETS).forEach(function (k) {
            if (name.indexOf(k) >= 0 && k.length > best) { best = k.length; price = TICKETS[k]; }
        });
        if (best < 0) {
            for (var i = 0; i < FREE_POI.length; i++) {
                if (name.indexOf(FREE_POI[i]) >= 0) { price = 0; break; }
            }
        }
        return price;
    }

    function hotelPrice(city) {
        if (TIER1.indexOf(city) >= 0) return 560;
        if (TIER2.indexOf(city) >= 0) return 380;
        return 260;
    }

    function buildPlan() {
        var cities = state.cities.filter(function (c) { return CATALOG[c]; });
        if (!cities.length) return null;

        var nDays = clamp(Math.max(state.days, cities.length), 1, 20);
        var picks = {};
        cities.forEach(function (c) {
            picks[c] = (state.picks[c] || []).filter(function (n) {
                return CATALOG[c].items.some(function (i) { return i.name === n; });
            });
            if (picks[c].length < 2) {
                // 至少补两个经典景点，保证行程可用
                var sorted = CATALOG[c].items.slice().sort(function (a, b) {
                    return (prefScore(b) * 10 - b.idx) - (prefScore(a) * 10 - a.idx);
                });
                sorted.forEach(function (it) {
                    if (picks[c].length < 2 && picks[c].indexOf(it.name) < 0) picks[c].push(it.name);
                });
            }
        });

        // 按节奏兜底：景点太多时自动拉长天数，避免一天排 5、6 个
        var totalSel = cities.reduce(function (s, c) { return s + picks[c].length; }, 0);
        var minDays = Math.ceil(totalSel / capPerDay());
        var autoExtended = false;
        if (minDays > nDays) {
            nDays = clamp(minDays, 1, 20);
            state.days = nDays;
            autoExtended = true;
        }

        // 天数分配：每城先保底 1 天，剩余天数按景点数量比例分
        var alloc = {};
        cities.forEach(function (c) { alloc[c] = 1; });
        var extra = nDays - cities.length;
        if (extra > 0) {
            var totalP = cities.reduce(function (s, c) { return s + picks[c].length; }, 0) || 1;
            var shares = cities.map(function (c) {
                return { c: c, v: extra * picks[c].length / totalP };
            });
            var given = 0;
            shares.forEach(function (s) {
                var add = Math.floor(s.v);
                alloc[s.c] += add;
                given += add;
            });
            var left = extra - given;
            shares.sort(function (a, b) { return (b.v - Math.floor(b.v)) - (a.v - Math.floor(a.v)); });
            for (var si = 0; si < left; si++) alloc[shares[si % shares.length].c]++;
        }

        var daysList = [];
        var dayNo = 0, totalKm = 0, ticketSum = 0, trainSum = 0, prevCity = null;
        var hotelNights = 0;

        cities.forEach(function (city, ci) {
            var ordered = orderedForCity(city, picks[city]);
            var chunks = chunkOrdered(ordered, alloc[city]);
            chunks.forEach(function (poiArr, di) {
                dayNo++;
                var leg = null;
                if (prevCity && prevCity !== city) {
                    leg = intercity(prevCity, city);
                    trainSum += leg.cost;
                    totalKm += leg.km;
                }
                var dayKm = 0;
                for (var i = 1; i < poiArr.length; i++) {
                    dayKm += distKm([poiArr[i - 1].lng, poiArr[i - 1].lat], [poiArr[i].lng, poiArr[i].lat]) * 1.35;
                }
                totalKm += dayKm;
                poiArr.forEach(function (p) { ticketSum += ticketOf(p.name); });

                var times = poiTimes(poiArr.length);
                var blocks = [];
                poiArr.forEach(function (p, i) {
                    blocks.push({
                        time: times[i], type: 'poi', title: p.name,
                        desc: poiDesc(city, p),
                        poi: p
                    });
                    if (i === 0) blocks.push({ time: '12:30', type: 'meal', title: '午餐 · ' + lunchName(city) });
                });
                blocks.push({ time: '18:30', type: 'meal', title: '晚餐 · ' + dinnerName(city) });
                var lastPoi = poiArr[poiArr.length - 1];
                blocks.push({
                    time: '21:00', type: 'hotel',
                    title: '入住 · ' + (lastPoi ? lastPoi.name + '附近' : city + '市中心'),
                    desc: '参考价 ¥' + hotelPrice(city) + '/晚（双床）· 可查携程实时房价',
                    hotelCity: city
                });
                if (!poiArr.length) {
                    var spare = CATALOG[city].items.filter(function (it) { return picks[city].indexOf(it.name) < 0; })[0];
                    blocks = [
                        {
                            time: '10:00', type: 'free', title: city + '深度漫游 · 自由活动',
                            desc: '睡到自然醒，逛老城 / 咖啡馆 / 补拍照片' + (spare ? '；如果还想玩，可以去「' + spare.name + '」' : '')
                        },
                        { time: '18:30', type: 'meal', title: '晚餐 · ' + dinnerName(city) },
                        { time: '21:00', type: 'hotel', title: '入住 · ' + city + '市中心', hotelCity: city }
                    ];
                }

                if (dayNo < nDays) hotelNights++;
                daysList.push({
                    dayNo: dayNo,
                    city: city,
                    cityChange: leg ? { from: prevCity, to: city, mode: leg.mode, hours: leg.hours, km: leg.km, cost: leg.cost } : null,
                    theme: poiArr.length ? poiArr.slice(0, 3).map(function (p) { return p.name; }).join(' · ') : city + '自由活动',
                    pois: poiArr,
                    blocks: blocks,
                    km: Math.round(dayKm),
                    ticket: poiArr.reduce(function (s, p) { return s + ticketOf(p.name); }, 0)
                });
                prevCity = city;
            });
        });

        var rooms = Math.ceil(state.people / 2);
        var hotelCost = 0;
        daysList.forEach(function (d, i) {
            if (i < daysList.length - 1) hotelCost += hotelPrice(d.city) * rooms;
        });
        var mealPerDay = TIER1.indexOf(daysList[0].city) >= 0 ? 180 : 140;
        var meals = mealPerDay * nDays * state.people;
        var local = 70 * nDays * state.people;
        var tickets = ticketSum * state.people;
        var inter = trainSum * state.people;
        var total = hotelCost + meals + local + tickets + inter;

        return {
            days: nDays,
            people: state.people,
            pace: state.pace,
            autoExtended: autoExtended,
            cities: cities,
            daysList: daysList,
            totals: {
                km: Math.round(totalKm),
                tickets: tickets,
                hotels: Math.round(hotelCost),
                meals: Math.round(meals),
                local: Math.round(local),
                intercity: Math.round(inter),
                total: Math.round(total),
                nights: hotelNights
            }
        };
    }

    function poiTimes(n) {
        var map = {
            1: ['10:00'],
            2: ['09:30', '14:00'],
            3: ['09:00', '13:00', '16:00'],
            4: ['08:30', '11:00', '14:30', '17:00'],
            5: ['08:30', '10:30', '13:30', '15:30', '17:30'],
            6: ['08:30', '10:15', '12:00', '14:30', '16:15', '18:00']
        };
        return map[n] || map[6];
    }

    function poiDesc(city, p) {
        var bits = [];
        var t = ticketOf(p.name);
        if (p.cat && p.cat.indexOf('nature') >= 0) bits.push('自然风光，建议留 2 小时慢慢走');
        else if (p.cat && p.cat.indexOf('family') >= 0) bits.push('亲子友好，适合半天');
        else if (p.cat && p.cat.indexOf('history') >= 0) bits.push('人文景点，建议配合讲解');
        else if (p.cat && p.cat.indexOf('food') >= 0) bits.push('边逛边吃，适合傍晚');
        else bits.push('经典打卡点，建议 1.5-2 小时');
        if (t > 0) bits.push('门票约 ¥' + t);
        else bits.push('免费开放');
        return bits.join(' · ');
    }

    function lunchName(city) {
        var cat = CATALOG[city];
        var food = cat ? cat.items.filter(function (i) { return (i.cat || []).indexOf('food') >= 0; })[0] : null;
        return (food ? food.name + '一带' : city + '老城区') + ' · 人均 ¥45-70';
    }
    function dinnerName(city) {
        var cat = CATALOG[city];
        var food = cat ? cat.items.filter(function (i) { return (i.cat || []).indexOf('food') >= 0; })[0] : null;
        return (food ? food.name : city + '特色小吃街') + ' · 人均 ¥60-100';
    }

    /* ==================== 推荐/自动挑选 ==================== */
    function autoPickCity(city, n) {
        var cat = CATALOG[city];
        if (!cat) return [];
        var sorted = cat.items.slice().sort(function (a, b) {
            return (prefScore(b) * 10 - b.idx) - (prefScore(a) * 10 - a.idx);
        });
        return sorted.slice(0, n || Math.min(4, sorted.length)).map(function (i) { return i.name; });
    }

    /* ==================== 渲染：城市 ==================== */
    function renderCityZone() {
        // 热门城市
        var hot = $('plHot');
        if (hot) {
            hot.innerHTML = HOT_CITIES.filter(function (c) { return CATALOG[c]; }).map(function (c) {
                var on = state.cities.indexOf(c) >= 0;
                return '<button class="pl-hot-chip" data-hot="' + esc(c) + '"' + (on ? ' style="opacity:.45;cursor:default"' : '') + '>' +
                    (on ? '✓ ' : '+ ') + esc(c) + '</button>';
            }).join('');
        }
        // 已选
        var tags = $('plCityTags');
        if (tags) {
            if (!state.cities.length) {
                tags.innerHTML = '<div class="pl-city-empty"><i class="fas fa-location-dot"></i> 还没选城市，先从上面的热门城市里挑一个吧</div>';
            } else {
                tags.innerHTML = state.cities.map(function (c) {
                    return '<span class="pl-city-tag"><i class="fas fa-location-dot" style="font-size:.72rem;opacity:.7"></i>' +
                        esc(c) + ' <small style="font-weight:400;opacity:.65">' + esc(provShort(c)) + '</small>' +
                        '<button data-rmcity="' + esc(c) + '" title="移除">✕</button></span>';
                }).join('');
            }
        }
        var dEl = $('plDays'), pEl = $('plPeople');
        if (dEl && document.activeElement !== dEl) dEl.value = state.days;
        if (pEl && document.activeElement !== pEl) pEl.value = state.people;

        var prefsEl = $('plPrefs');
        if (prefsEl) {
            prefsEl.innerHTML = PREFS.map(function (p) {
                var on = state.prefs.indexOf(p.key) >= 0;
                return '<button class="pl-pref' + (on ? ' on' : '') + '" data-pref="' + p.key + '">' +
                    '<i class="fas ' + p.icon + '"></i>' + p.label + '</button>';
            }).join('');
        }
    }

    /* ==================== 渲染：景点 ==================== */
    function renderPoiZone() {
        var wrap = $('plPoiGroups');
        if (!wrap) return;
        if (!state.cities.length) {
            wrap.innerHTML = '<div class="pl-empty"><i class="fas fa-map-location-dot"></i>选择城市后，这里会列出可加入行程的景点</div>';
        } else {
            wrap.innerHTML = state.cities.map(function (city) {
                var cat = CATALOG[city];
                if (!cat) return '';
                var items = cat.items.slice().sort(function (a, b) {
                    return (prefScore(b) * 10 - b.idx) - (prefScore(a) * 10 - a.idx);
                });
                var chosen = state.picks[city] || [];
                return '<div class="pl-poi-group">' +
                    '<div class="pl-poi-group-head"><i class="fas fa-location-dot" style="color:#2563eb"></i>' + esc(city) +
                    ' <span class="count">' + chosen.length + '/' + items.length + ' 已选</span>' +
                    '<button class="pl-mini-btn" data-pickall="' + esc(city) + '">帮我挑经典的</button></div>' +
                    '<div class="pl-poi-list">' + items.map(function (it) {
                        var on = chosen.indexOf(it.name) >= 0;
                        return '<button class="pl-poi-chip' + (on ? ' on' : '') + '" data-poi="' + esc(it.name) + '" data-city="' + esc(city) + '">' +
                            esc(it.name) + '<span class="plus">' + (on ? '✓' : '+') + '</span></button>';
                    }).join('') + '</div></div>';
            }).join('');
        }
        var cnt = $('plPoiCount');
        if (cnt) {
            var total = state.cities.reduce(function (s, c) { return s + (state.picks[c] || []).length; }, 0);
            cnt.textContent = '已选 ' + total + ' 个景点';
        }
    }

    /* ==================== 渲染：结果 ==================== */
    function renderResult() {
        var card = $('plResultCard');
        var body = $('plResultBody');
        if (!card || !body) return;
        var plan = state.plan;
        if (!plan || !plan.daysList.length) {
            card.hidden = true;
            state.map = null;
            return;
        }
        card.hidden = false;

        var t = plan.totals;
        var paceText = plan.pace === 'relaxed' ? '轻松' : (plan.pace === 'packed' ? '紧凑' : '标准');
        body.innerHTML =
            '<div class="pl-result-head">' +
            '<div style="flex:1 1 240px"><h3 class="pl-result-title">' + esc(plan.cities.join(' → ')) + ' · ' + plan.days + '天' + (plan.days - 1) + '晚</h3>' +
            '<p class="pl-result-sub">' + plan.daysList.length + ' 天行程 · ' + plan.cities.length + ' 座城市 · ' + paceText + '节奏 · ' + plan.people + ' 人出行' +
            (plan.autoExtended ? ' · <span style="color:#f59e0b">已按节奏自动放宽到 ' + plan.days + ' 天</span>' : '') + '</p></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
            '<span class="pl-lg-chip"><b style="background:#2563eb">路</b>换城市 ' + plan.cities.length + ' 次</span>' +
            '</div></div>' +
            '<div class="pl-stats">' +
            '<div class="pl-stat"><b>' + num(t.km) + ' km</b><span>总里程（含市内）</span></div>' +
            '<div class="pl-stat"><b>¥' + num(t.total) + '</b><span>人均预估总花费</span></div>' +
            '<div class="pl-stat"><b>' + plan.days + ' 天</b><span>行程天数</span></div>' +
            '<div class="pl-stat"><b>' + (plan.daysList.reduce(function (s, d) { return s + d.pois.length; }, 0)) + ' 个</b><span>必去景点</span></div>' +
            '</div>' +
            '<div class="pl-map-wrap"><div id="plMap" class="pl-map"></div><div class="pl-map-legend" id="plMapLegend"></div></div>' +
            '<div class="pl-days" id="plDaysList">' + plan.daysList.map(renderDay).join('') + '</div>' +
            '<div class="pl-cost">' +
            '<div class="pl-cost-title"><i class="fas fa-receipt" style="color:#2563eb;margin-right:6px"></i>费用估算（' + plan.people + ' 人 / 全程）</div>' +
            '<div class="pl-cost-grid">' +
            costCell('住宿 ' + t.nights + ' 晚', t.hotels) +
            costCell('餐饮', t.meals) +
            costCell('市内交通', t.local) +
            costCell('门票', t.tickets) +
            costCell('城际交通', t.intercity) +
            costCell('合计（人均）', Math.round(t.total / plan.people)) +
            '</div>' +
            '<div class="pl-note">※ 以上为估算值：住宿按双人房、门票按公开票价、城际按二等座/经济舱计算，实际以携程/12306 为准。拖动地图可查看每个点的位置。</div>' +
            '</div>' +
            '<div class="pl-actions">' +
            '<button class="pl-btn-primary" id="plCopyBtn"><i class="fas fa-copy"></i> 复制行程文案</button>' +
            '<a class="pl-btn-ghost" id="plAmapBtn" target="_blank" rel="noopener"><i class="fas fa-map-location-dot"></i> 在高德看整条路线</a>' +
            '<button class="pl-btn-ghost" id="plSaveBtn"><i class="fas fa-bookmark"></i> 保存到本机</button>' +
            '<button class="pl-btn-ghost" id="plRegenBtn"><i class="fas fa-rotate"></i> 重新生成</button>' +
            '</div>';

        setTimeout(function () { drawMap(plan); }, 30);
        bindResultActions();
    }

    function costCell(label, v) {
        return '<div class="pl-cost-cell">' + esc(label) + '<b>¥' + num(v) + '</b></div>';
    }

    function renderDay(d) {
        var color = DAY_COLORS[(d.dayNo - 1) % DAY_COLORS.length];
        var blocks = d.blocks.map(function (b) {
            var ico = b.type === 'meal' ? 'fa-utensils' : (b.type === 'hotel' ? 'fa-hotel' : (b.type === 'free' ? 'fa-mug-hot' : 'fa-location-dot'));
            var cls = b.type === 'meal' ? ' is-meal' : (b.type === 'hotel' ? ' is-hotel' : '');
            var link = b.hotelCity ? ' <a href="https://hotels.ctrip.com/hotels/list?keyword=' + encodeURIComponent(b.hotelCity) + '" target="_blank" rel="noopener" style="color:#2563eb;font-size:.76rem;text-decoration:none">携程查房价 →</a>' : '';
            return '<div class="pl-tl-item' + cls + '"><div class="pl-tl-time">' + esc(b.time) + '</div>' +
                '<div class="pl-tl-body"><div class="pl-tl-title"><i class="fas ' + ico + ' pl-tl-ico"></i>' + esc(b.title) + link + '</div>' +
                (b.desc ? '<div class="pl-tl-desc">' + esc(b.desc) + '</div>' : '') + '</div></div>';
        }).join('');

        var legHtml = '';
        if (d.cityChange) {
            var c = d.cityChange;
            var url = c.mode === '飞机'
                ? 'https://flights.ctrip.com/online/list/oneway-' + encodeURIComponent(c.from) + '-' + encodeURIComponent(c.to)
                : 'https://trains.ctrip.com/TrainBooking/SearchTrain.aspx?from=' + encodeURIComponent(c.from) + '&to=' + encodeURIComponent(c.to);
            legHtml = '<div class="pl-transport"><i class="fas ' + (c.mode === '飞机' ? 'fa-plane' : 'fa-train') + '"></i>' +
                esc(c.from) + ' → ' + esc(c.to) + ' · ' + esc(c.mode) + ' 约 ' + c.hours.toFixed(1) + ' 小时 · ' + num(c.km) + ' km · 参考 ¥' + num(c.cost) +
                '<a href="' + url + '" target="_blank" rel="noopener">携程订票 →</a></div>';
        }

        return '<div class="pl-day">' +
            '<div class="pl-day-head"><span class="pl-day-badge" style="background:' + color + '">Day ' + d.dayNo + '</span>' +
            '<span class="pl-day-city">' + esc(d.city) + '</span>' +
            '<span class="pl-day-theme">' + esc(d.theme) + '</span>' +
            '<span class="pl-day-meta"><span><i class="fas fa-route"></i> ' + d.km + ' km</span>' +
            '<span><i class="fas fa-ticket"></i> ¥' + d.ticket + '</span></span></div>' +
            legHtml + '<div class="pl-timeline">' + blocks + '</div></div>';
    }

    /* ==================== 地图 ==================== */
    function drawMap(plan) {
        var el = $('plMap');
        if (!el || !window.L) return;
        if (state.map) { try { state.map.remove(); } catch (e) { } state.map = null; }
        var map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
        state.map = map;
        L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
            { subdomains: ['1', '2', '3', '4'], maxZoom: 18, minZoom: 3, attribution: '&copy; 高德地图' }).addTo(map);

        var bounds = [], globalNo = 0, legend = [];
        plan.daysList.forEach(function (d, di) {
            var color = DAY_COLORS[di % DAY_COLORS.length];
            var pts = [];
            d.pois.forEach(function (p) {
                var g = wgs2gcj(p.lng, p.lat);
                pts.push([g[1], g[0]]);
            });
            if (pts.length > 1) {
                L.polyline(pts, { color: color, weight: 4, opacity: .88, lineJoin: 'round' }).addTo(map);
            }
            d.pois.forEach(function (p, i) {
                globalNo++;
                var ll = pts[i];
                bounds.push(ll);
                var marker = L.marker(ll, {
                    icon: L.divIcon({
                        className: 'pl-pin-wrap',
                        html: '<div class="pl-pin" style="background:' + color + '">' + globalNo + '</div>',
                        iconSize: [26, 26], iconAnchor: [13, 13]
                    }),
                    title: p.name
                }).addTo(map);
                marker.bindTooltip('Day ' + d.dayNo + ' · ' + p.name, { direction: 'top', offset: [0, -12] });
            });
            if (d.pois.length) {
                legend.push('<span class="pl-lg-chip"><b style="background:' + color + '">D' + d.dayNo + '</b>' + esc(d.city) + '</span>');
            }
        });
        var lg = $('plMapLegend');
        if (lg) lg.innerHTML = legend.join('');
        try {
            if (bounds.length === 1) map.setView(bounds[0], 12);
            else map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 12 });
        } catch (e) { }
        setTimeout(function () { map.invalidateSize(); }, 120);
        setTimeout(function () { map.invalidateSize(); }, 480);
    }

    /* ==================== 结果操作 ==================== */
    function bindResultActions() {
        var copy = $('plCopyBtn');
        if (copy) copy.onclick = copyPlanText;
        var save = $('plSaveBtn');
        if (save) save.onclick = function () { saveLocal(); toast('已保存到本机，下次打开自动恢复'); };
        var regen = $('plRegenBtn');
        if (regen) regen.onclick = function () { regenerate(); toast('已按当前偏好重新生成'); };
        var amap = $('plAmapBtn');
        if (amap) amap.href = amapUrl();
    }

    function amapUrl() {
        var plan = state.plan;
        if (!plan) return '#';
        var pts = [];
        plan.daysList.forEach(function (d) {
            d.pois.forEach(function (p) {
                var g = wgs2gcj(p.lng, p.lat);
                pts.push({ lng: g[0], lat: g[1], name: p.name });
            });
        });
        if (pts.length < 2) return '#';
        var from = pts[0], to = pts[pts.length - 1];
        var via = pts.slice(1, -1).slice(0, 16).map(function (p) {
            return p.lng + ',' + p.lat + ',' + encodeURIComponent(p.name);
        }).join('|');
        return 'https://uri.amap.com/navigation?from=' + from.lng + ',' + from.lat + ',' + encodeURIComponent(from.name || '起点') +
            '&to=' + to.lng + ',' + to.lat + ',' + encodeURIComponent(to.name || '终点') +
            (via ? '&via=' + via : '') + '&mode=car&policy=1&src=mylvyou&coordinate=gaode&callnative=0';
    }

    function copyPlanText() {
        var plan = state.plan;
        if (!plan) return;
        var lines = [];
        lines.push('【MYL 定制行程】' + plan.cities.join(' → ') + ' · ' + plan.days + '天' + (plan.days - 1) + '晚');
        lines.push('人数：' + plan.people + ' 人 ｜ 总里程约 ' + plan.totals.km + ' km ｜ 人均预估 ¥' + num(Math.round(plan.totals.total / plan.people)));
        lines.push('');
        plan.daysList.forEach(function (d) {
            lines.push('Day ' + d.dayNo + ' · ' + d.city + ' · ' + d.theme);
            if (d.cityChange) lines.push('  城际：' + d.cityChange.from + '→' + d.cityChange.to + ' ' + d.cityChange.mode + ' 约' + d.cityChange.hours.toFixed(1) + '小时');
            d.blocks.forEach(function (b) {
                lines.push('  ' + b.time + '  ' + b.title + (b.desc ? '（' + b.desc + '）' : ''));
            });
            lines.push('');
        });
        lines.push('费用估算（人均）：住宿 ¥' + num(Math.round(plan.totals.hotels / plan.people)) +
            ' / 餐饮 ¥' + num(Math.round(plan.totals.meals / plan.people)) +
            ' / 市内交通 ¥' + num(Math.round(plan.totals.local / plan.people)) +
            ' / 门票 ¥' + num(Math.round(plan.totals.tickets / plan.people)) +
            ' / 城际 ¥' + num(Math.round(plan.totals.intercity / plan.people)));
        lines.push('酒店：https://hotels.ctrip.com/hotels/list?keyword=' + encodeURIComponent(plan.cities[0]));

        var text = lines.join('\n');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { toast('行程已复制，可直接粘贴给同行的人'); },
                function () { legacyCopy(text); });
        } else legacyCopy(text);
    }

    function legacyCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); toast('行程已复制'); } catch (e) { toast('复制失败，请手动选择文本'); }
        document.body.removeChild(ta);
    }

    function toast(msg) {
        if (typeof window.showToast === 'function') { window.showToast(msg); return; }
        var t = document.createElement('div');
        t.textContent = msg;
        t.style.cssText = 'position:fixed;left:50%;bottom:36px;transform:translateX(-50%);background:#0f172a;color:#fff;padding:11px 20px;border-radius:10px;font-size:.86rem;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.25)';
        document.body.appendChild(t);
        setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 1800);
        setTimeout(function () { t.remove(); }, 2300);
    }

    /* ==================== 本地存储 ==================== */
    function saveLocal() {
        try {
            localStorage.setItem(LS_PLAN, JSON.stringify({
                cities: state.cities, days: state.days, people: state.people,
                prefs: state.prefs, picks: state.picks, pace: state.pace
            }));
        } catch (e) { }
    }
    function loadLocal() {
        try {
            var raw = localStorage.getItem(LS_PLAN);
            if (!raw) return false;
            var d = JSON.parse(raw);
            if (!d || !d.cities || !d.cities.length) return false;
            state.cities = d.cities.filter(function (c) { return CATALOG[c]; });
            state.days = clamp(+d.days || 4, 1, 20);
            state.people = clamp(+d.people || 2, 1, 20);
            state.prefs = Array.isArray(d.prefs) ? d.prefs : [];
            state.picks = d.picks || {};
            state.pace = d.pace || 'normal';
            return state.cities.length > 0;
        } catch (e) { return false; }
    }
    function loadAiCfg() {
        try {
            var raw = localStorage.getItem(LS_AI);
            state.aiCfg = raw ? JSON.parse(raw) : { provider: 'builtin', endpoint: '', model: '', key: '' };
        } catch (e) {
            state.aiCfg = { provider: 'builtin', endpoint: '', model: '', key: '' };
        }
    }

    /* ==================== 生成 / 重新生成 ==================== */
    function regenerate() {
        state.plan = buildPlan();
        renderResult();
        saveLocal();
    }

    /* ==================== AI 助手 ==================== */
    function pushMsg(role, text, extra) {
        state.msgs.push({ role: role, text: text, extra: extra || null });
        if (state.msgs.length > 40) state.msgs.shift();
        renderMsgs();
    }

    function renderMsgs() {
        var body = $('plAgentBody');
        if (!body) return;
        body.innerHTML = state.msgs.map(function (m) {
            if (m.role === 'user') {
                return '<div class="pl-msg user"><div class="bubble">' + esc(m.text) + '</div></div>';
            }
            return '<div class="pl-msg' + (m.typing ? ' typing' : '') + '"><div class="who">AI</div><div class="bubble">' + m.text + '</div></div>';
        }).join('');
        body.scrollTop = body.scrollHeight;
    }

    function agentQuickChips() {
        var el = $('plAgentChips');
        if (!el) return;
        var chips = ['推荐经典路线', '第三天太赶了', '加一天', '推荐酒店', '换成轻松一点', '去掉最远的景点', '预算控制在 5000'];
        el.innerHTML = chips.map(function (c) {
            return '<button class="pl-ag-chip" data-chip="' + esc(c) + '">' + esc(c) + '</button>';
        }).join('');
    }

    /* ---------- 内置自然语言引擎 ---------- */
    function findPoiInText(text, scopeCities) {
        var best = null;
        var scope = (scopeCities && scopeCities.length) ? scopeCities : Object.keys(CATALOG);
        scope.forEach(function (city) {
            var cat = CATALOG[city];
            if (!cat) return;
            cat.items.forEach(function (it) {
                if (text.indexOf(it.name) >= 0 && (!best || it.name.length > best.name.length)) best = it;
            });
        });
        return best;
    }

    function findCityInText(text) {
        var best = null;
        Object.keys(CATALOG).forEach(function (c) {
            if (text.indexOf(c) >= 0 && (!best || c.length > best.length)) best = c;
        });
        return best;
    }

    function dayNoFrom(text) {
        var m = text.match(/第\s*([一二三四五六七八九十\d]+)\s*天/);
        if (!m) return 0;
        var s = m[1];
        var map = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
        if (/^\d+$/.test(s)) return parseInt(s, 10);
        if (s.length === 1) return map[s] || 0;
        if (s.indexOf('十') === 0) return 10 + (map[s[1]] || 0);
        if (s.length === 3 && s[1] === '十') return (map[s[0]] || 0) * 10 + (map[s[2]] || 0);
        return 0;
    }

    function localReply(raw) {
        var text = String(raw || '').trim();
        var actions = [], reply = '';
        var selected = state.cities.slice();
        var catCities = Object.keys(CATALOG);
        var poiSel = findPoiInText(text, selected);
        var poiAny = poiSel || findPoiInText(text, catCities);
        var city = findCityInText(text);
        var nDay = dayNoFrom(text);

        if (/怎么用|帮助|能做什么|你会什么|介绍.*自己/.test(text)) {
            return {
                reply: '我可以帮你改行程：<br>· 「加一天 / 少一天」调整天数<br>· 「加上{景点}」加入景点，「去掉{景点}」删掉<br>· 「换掉{景点}」自动换同城替代<br>· 「第三天太赶了」自动放宽节奏<br>· 「推荐酒店 / 预算 / 交通」给出对应建议<br>· 「重新生成 / 清空」重来。选了城市后点「生成我的行程」即可。',
                actions: actions
            };
        }

        if (/(清空|重新开始|全部删掉|重来)/.test(text)) {
            actions.push({ type: 'clear' });
            return { reply: '好的，已清空，我们重新开始。先告诉我这次想去哪几座城市？', actions: actions };
        }

        if (/加.*天|多.*天|延长|再多待/.test(text)) {
            actions.push({ type: 'setDays', days: state.days + (parseInt((text.match(/(\d+)\s*天/) || [])[1], 10) || 1) });
        } else if (/少.*天|减.*天|缩短|太长了/.test(text)) {
            actions.push({ type: 'setDays', days: Math.max(1, state.days - (parseInt((text.match(/(\d+)\s*天/) || [])[1], 10) || 1)) });
        }

        if (/太赶|太累|轻松|慢一点|悠闲|带娃|老人|休息/.test(text)) actions.push({ type: 'setPace', pace: 'relaxed' });
        else if (/紧凑|多逛|多去|充实|特种兵/.test(text)) actions.push({ type: 'setPace', pace: 'packed' });

        if (/(删|去掉|不要|移除|取消)/.test(text) && poiAny) {
            actions.push({ type: 'removePoi', poi: poiAny.name, city: poiAny.city });
        } else if (/(换|替换|改成)/.test(text) && poiAny) {
            actions.push({ type: 'replacePoi', poi: poiAny.name, city: poiAny.city });
        } else if (/(加|添加|加上|增加|想去|还要|顺路去)/.test(text) && poiAny) {
            actions.push({ type: 'addPoi', poi: poiAny.name, city: poiAny.city });
            if (selected.indexOf(poiAny.city) < 0) actions.push({ type: 'addCity', city: poiAny.city });
        } else if (/(加|添加|去|带我去)/.test(text) && city && selected.indexOf(city) < 0) {
            actions.push({ type: 'addCity', city: city });
        }

        if (/第\s*[一二三四五六七八九十\d]+\s*天/.test(text) && /(删|去掉|不要|取消)/.test(text) && nDay && !poiAny) {
            actions.push({ type: 'removeDay', day: nDay });
        }
        if (/顺路|优化|重排|按距离|路线.*调整/.test(text)) actions.push({ type: 'reorder' });

        if (/酒店|住哪|住宿|民宿|订房/.test(text)) {
            var cities = selected.length ? selected : [state.cities[0] || '杭州'];
            reply = '给你按城市找了住宿建议：<br>' + cities.map(function (c) {
                var area = state.plan && state.plan.daysList.length
                    ? (function () {
                        var d = state.plan.daysList.filter(function (x) { return x.city === c; }).pop();
                        return d && d.pois.length ? d.pois[d.pois.length - 1].name + '附近' : '市中心商圈';
                    })() : '市中心商圈';
                return '· <b>' + esc(c) + '</b>：' + esc(area) + '，参考 ¥' + hotelPrice(c) + '/晚 · ' +
                    '<a href="https://hotels.ctrip.com/hotels/list?keyword=' + encodeURIComponent(c) + '" target="_blank" rel="noopener">携程查酒店 →</a>';
            }).join('<br>') + '<br>旺季（节假日/暑期）建议提前 2-3 周订，可免费取消的房型更稳。';
            return { reply: reply, actions: actions };
        }

        if (/吃|美食|小吃|餐厅/.test(text)) {
            var cs = selected.length ? selected : [state.cities[0] || '杭州'];
            reply = '按城市给你标了几处吃的：<br>' + cs.map(function (c) {
                var cat = CATALOG[c];
                var foods = cat ? cat.items.filter(function (i) { return (i.cat || []).indexOf('food') >= 0; }).slice(0, 2) : [];
                return '· <b>' + esc(c) + '</b>：' + (foods.length ? foods.map(function (f) { return esc(f.name); }).join('、') : '本地老城区小吃街') + '（人均 ¥40-80）';
            }).join('<br>') + '<br>想吃特色菜可以直接问「{城市}吃什么」。';
            return { reply: reply, actions: actions };
        }

        if (/交通|怎么去|高铁|飞机|开车|自驾/.test(text)) {
            if (!state.plan || !state.plan.daysList.length) {
                return { reply: '先生成行程，我再按城市顺序给你算城际交通（高铁/飞机时长和参考价）。', actions: actions };
            }
            var legs = state.plan.daysList.filter(function (d) { return d.cityChange; });
            reply = legs.length
                ? '城际交通建议：<br>' + legs.map(function (d) {
                    var c = d.cityChange;
                    return '· ' + esc(c.from) + ' → ' + esc(c.to) + '：' + esc(c.mode) + '约 ' + c.hours.toFixed(1) + ' 小时，' + num(c.km) + ' km，参考 ¥' + num(c.cost) +
                        ' · <a href="' + (c.mode === '飞机'
                            ? 'https://flights.ctrip.com/online/list/oneway-' + encodeURIComponent(c.from) + '-' + encodeURIComponent(c.to)
                            : 'https://trains.ctrip.com/TrainBooking/SearchTrain.aspx?from=' + encodeURIComponent(c.from) + '&to=' + encodeURIComponent(c.to)) +
                        '" target="_blank" rel="noopener">携程查票 →</a>';
                }).join('<br>')
                : '这次是单城深度游，市内地铁+打车就够了，不用买城际票。';
            return { reply: reply, actions: actions };
        }

        if (/预算|多少钱|花费|费用|贵/.test(text)) {
            if (!state.plan) return { reply: '先生成行程，我就能给你算人均花费了。', actions: actions };
            var t = state.plan.totals, p = state.plan.people;
            reply = '人均预估 <b>¥' + num(Math.round(t.total / p)) + '</b>：住宿 ¥' + num(Math.round(t.hotels / p)) +
                '、餐饮 ¥' + num(Math.round(t.meals / p)) + '、市内交通 ¥' + num(Math.round(t.local / p)) +
                '、门票 ¥' + num(Math.round(t.tickets / p)) + '、城际 ¥' + num(Math.round(t.intercity / p)) +
                '。<br>想压预算：换 2 个付费景点为免费景点、酒店选地铁沿线非核心区，通常能省 20%-30%。';
            return { reply: reply, actions: actions };
        }

        if (/(推荐|经典|必去|怎么安排|帮我规划|规划一下)/.test(text)) {
            if (!selected.length && city) actions.push({ type: 'addCity', city: city });
            var target = city && CATALOG[city] ? [city] : (selected.length ? selected : []);
            if (target.length) {
                reply = '根据你的偏好，我优先推荐：<br>' + target.map(function (c) {
                    return '· <b>' + esc(c) + '</b>：' + autoPickCity(c, 4).join('、');
                }).join('<br>') + '<br>已经按地理位置串成顺路路线，点上方「生成我的行程」即可看到地图和每天安排。';
            }
            return { reply: reply || '告诉我目的地和大概天数，我来排一条顺路的路线。', actions: actions };
        }

        if (!actions.length) {
            return {
                reply: '我暂时没理解这句。可以这样说：<br>· 「加上{景点名}」· 「去掉{景点名}」<br>· 「第三天太赶了」· 「加一天」<br>· 「推荐酒店」· 「预算多少」',
                actions: actions
            };
        }
        // 只返回动作，由调用方统一执行一次，避免重复应用
        return { reply: reply, actions: actions };
    }

    /* ---------- 执行动作 ---------- */
    function applyActions(actions, silent) {
        var notes = [];
        actions.forEach(function (a) {
            if (!a || !a.type) return;
            switch (a.type) {
                case 'addCity':
                    if (a.city && CATALOG[a.city] && state.cities.indexOf(a.city) < 0) {
                        if (state.cities.length >= 4) { notes.push('最多同时排 4 座城市，已跳过「' + a.city + '」'); break; }
                        state.cities.push(a.city);
                        if (!state.picks[a.city] || !state.picks[a.city].length) state.picks[a.city] = autoPickCity(a.city, 3);
                        notes.push('已加入 ' + a.city + '，默认挑了 ' + state.picks[a.city].join('、'));
                    }
                    break;
                case 'removeCity':
                    if (a.city) {
                        state.cities = state.cities.filter(function (c) { return c !== a.city; });
                        delete state.picks[a.city];
                        notes.push('已移除 ' + a.city);
                    }
                    break;
                case 'addPoi':
                    if (a.city && CATALOG[a.city] && a.poi) {
                        if (state.cities.indexOf(a.city) < 0) state.cities.push(a.city);
                        state.picks[a.city] = state.picks[a.city] || [];
                        if (state.picks[a.city].indexOf(a.poi) < 0) {
                            state.picks[a.city].push(a.poi);
                            notes.push('已把「' + a.poi + '」加进 ' + a.city + ' 的行程');
                        } else {
                            notes.push('「' + a.poi + '」本来就在行程里');
                        }
                    } else if (a.poi) {
                        notes.push('景点库里没找到「' + a.poi + '」');
                    }
                    break;
                case 'removePoi':
                    if (a.city && state.picks[a.city]) {
                        var before = state.picks[a.city].length;
                        state.picks[a.city] = state.picks[a.city].filter(function (n) { return n !== a.poi; });
                        if (state.picks[a.city].length < before) notes.push('已去掉「' + a.poi + '」');
                        else notes.push('「' + a.poi + '」不在当前行程里');
                    }
                    break;
                case 'replacePoi':
                    if (a.city && state.picks[a.city]) {
                        var cat = CATALOG[a.city];
                        if (!cat) break;
                        var cur = state.picks[a.city];
                        var alt = cat.items.filter(function (i) {
                            return cur.indexOf(i.name) < 0 && i.name !== a.poi;
                        }).sort(function (x, y) {
                            return (prefScore(y) * 10 - y.idx) - (prefScore(x) * 10 - x.idx);
                        })[0];
                        if (alt) {
                            state.picks[a.city] = cur.map(function (n) { return n === a.poi ? alt.name : n; });
                            notes.push('把「' + a.poi + '」换成了「' + alt.name + '」');
                        }
                    }
                    break;
                case 'setDays':
                    state.days = clamp(+a.days || state.days, 1, 20);
                    notes.push('天数调整为 ' + state.days + ' 天');
                    break;
                case 'setPace':
                    state.pace = a.pace === 'relaxed' ? 'relaxed' : (a.pace === 'packed' ? 'packed' : 'normal');
                    notes.push(a.pace === 'relaxed' ? '已调成轻松节奏（每天最多 2 个景点）' : '已调成紧凑节奏（每天最多 4 个景点）');
                    break;
                case 'removeDay':
                    if (state.plan && a.day) {
                        var d = state.plan.daysList.filter(function (x) { return x.dayNo === a.day; })[0];
                        if (d) {
                            d.pois.forEach(function (p) {
                                if (state.picks[d.city]) state.picks[d.city] = state.picks[d.city].filter(function (n) { return n !== p.name; });
                            });
                            notes.push('已清空第 ' + a.day + ' 天的景点，并压缩行程');
                            state.days = Math.max(1, state.days - 1);
                        }
                    }
                    break;
                case 'reorder':
                    notes.push('已按地理位置重新排序，路线更顺');
                    break;
                case 'clear':
                    state.cities = [];
                    state.picks = {};
                    state.plan = null;
                    notes.push('已清空');
                    break;
            }
        });
        if (!silent) {
            var beforeDays = state.days;
            state.plan = buildPlan();
            if (state.days !== beforeDays) notes.push('行程已自动放宽到 ' + state.days + ' 天，避免每天太赶');
            renderAll();
            if (state.plan) saveLocal();
        }
        return notes.join('；');
    }

    /* ---------- 大模型接口 ---------- */
    function buildSystemPrompt() {
        var plan = state.plan;
        var compact = plan ? {
            days: plan.days,
            people: plan.people,
            cities: plan.cities,
            pace: plan.pace,
            stops: plan.daysList.map(function (d) {
                return { day: d.dayNo, city: d.city, pois: d.pois.map(function (p) { return p.name; }) };
            })
        } : null;
        var candidates = {};
        state.cities.forEach(function (c) {
            if (!CATALOG[c]) return;
            var chosen = state.picks[c] || [];
            candidates[c] = CATALOG[c].items.filter(function (i) { return chosen.indexOf(i.name) < 0; })
                .slice(0, 12).map(function (i) { return i.name; });
        });
        return [
            '你是 MYL 旅行网站的行程规划助手，服务中文用户。',
            '当前行程 JSON：' + JSON.stringify(compact || {}),
            '可加入的候选景点（按城市）：' + JSON.stringify(candidates),
            '可选城市：' + Object.keys(CATALOG).join('、'),
            '用户会提出修改需求。请只输出一个 JSON 对象，不要输出 markdown 代码块，不要输出多余解释。格式：',
            '{"reply":"给用户看的中文回复，可用<br>换行","actions":[{"type":"addPoi","city":"杭州","poi":"灵隐寺"}]}',
            '可用 action 类型：addCity{city}、removeCity{city}、addPoi{city,poi}、removePoi{city,poi}、replacePoi{city,poi}、setDays{days}、setPace{pace:relaxed|normal|packed}、reorder、clear。',
            '约束：城市最多 4 座；只能使用候选景点或可选城市中出现的名字；不要编造景点。'
        ].join('\n');
    }

    function callAI(userText) {
        var cfg = state.aiCfg || {};
        var endpoint = cfg.endpoint || (AI_PRESETS[cfg.provider] || {}).endpoint;
        var model = cfg.model || (AI_PRESETS[cfg.provider] || {}).model;
        if (!endpoint) throw new Error('未填写接口地址');
        return fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (cfg.key || '')
            },
            body: JSON.stringify({
                model: model,
                temperature: 0.3,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    { role: 'user', content: userText }
                ]
            })
        }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        }).then(function (j) {
            var content = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
            content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
            var start = content.indexOf('{'), end = content.lastIndexOf('}');
            var obj = JSON.parse(content.slice(start, end + 1));
            return obj;
        });
    }

    async function sendAgent(text) {
        if (state.busy) return;
        text = String(text || '').trim();
        if (!text) return;
        pushMsg('user', text);
        var input = $('plAgentInput');
        if (input) input.value = '';

        var cfg = state.aiCfg || {};
        var useAi = cfg.provider && cfg.provider !== 'builtin' && cfg.key && (cfg.endpoint || (AI_PRESETS[cfg.provider] || {}).endpoint);

        state.busy = true;
        state.msgs.push({ role: 'ai', text: '', typing: true });
        renderMsgs();

        if (useAi) {
            try {
                var res = await callAI(text);
                state.msgs.pop();
                var reply = (res && res.reply) ? sanitizeAi(res.reply) : '';
                var acts = Array.isArray(res && res.actions) ? res.actions.slice(0, 8) : [];
                var changedAi = applyActions(acts);
                if (!reply) reply = '已按你的要求更新行程。';
                pushMsg('ai', reply + (changedAi ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(changedAi) + '</div>' : ''));
            } catch (e) {
                state.msgs.pop();
                var fb = localReply(text);
                var ch = applyActions(fb.actions);
                pushMsg('ai', (fb.reply || '已按你的要求更新行程。') + (ch ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(ch) + '</div>' : '') +
                    '<div style="margin-top:6px;font-size:.74rem;color:#f59e0b">接口调用失败（' + esc(e.message) + '，可能是浏览器跨域限制），已改用内置引擎处理。</div>');
            } finally {
                state.busy = false;
            }
        } else {
            setTimeout(function () {
                state.msgs.pop();
                var fb = localReply(text);
                var changed = applyActions(fb.actions);
                var out = fb.reply || '已按你的要求更新行程。';
                if (changed) out += '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(changed) + '</div>';
                pushMsg('ai', out);
                state.busy = false;
            }, 320);
        }
    }

    // 模型回复只保留安全的换行与加粗，其余转义
    function sanitizeAi(s) {
        return esc(s).replace(/&lt;br\s*\/?&gt;/gi, '<br>').replace(/&lt;b&gt;/gi, '<b>').replace(/&lt;\/b&gt;/gi, '</b>');
    }

    /* ==================== 渲染全集 ==================== */
    function renderAll() {
        renderCityZone();
        renderPoiZone();
        renderResult();
    }

    /* ==================== 绑定事件 ==================== */
    function bindEvents() {
        // 城市搜索
        var cityInput = $('plCityInput');
        var suggest = $('plSuggest');
        if (cityInput && suggest) {
            var refreshSuggest = function () {
                var q = cityInput.value.trim();
                if (!q) { suggest.classList.remove('open'); return; }
                var hits = Object.keys(CATALOG).filter(function (c) {
                    return c.indexOf(q) >= 0 || provShort(c).indexOf(q) >= 0;
                }).slice(0, 12);
                suggest.innerHTML = hits.length ? hits.map(function (c) {
                    var on = state.cities.indexOf(c) >= 0;
                    return '<div class="pl-suggest-item" data-addcity="' + esc(c) + '"><i class="fas fa-location-dot" style="color:#93c5fd"></i>' +
                        esc(c) + '<small>' + esc(provShort(c)) + (on ? ' · 已选' : '') + '</small></div>';
                }).join('') : '<div class="pl-suggest-empty">没找到这个城市，试试"杭州""成都"</div>';
                suggest.classList.add('open');
            };
            cityInput.addEventListener('input', refreshSuggest);
            cityInput.addEventListener('focus', refreshSuggest);
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.pl-city-search')) suggest.classList.remove('open');
            });
            suggest.addEventListener('click', function (e) {
                var it = e.target.closest('[data-addcity]');
                if (!it) return;
                addCity(it.getAttribute('data-addcity'));
                cityInput.value = '';
                suggest.classList.remove('open');
            });
        }

        // 热门城市
        var hot = $('plHot');
        if (hot) hot.addEventListener('click', function (e) {
            var b = e.target.closest('[data-hot]');
            if (b) addCity(b.getAttribute('data-hot'));
        });

        // 移除城市
        var tags = $('plCityTags');
        if (tags) tags.addEventListener('click', function (e) {
            var b = e.target.closest('[data-rmcity]');
            if (!b) return;
            var c = b.getAttribute('data-rmcity');
            state.cities = state.cities.filter(function (x) { return x !== c; });
            delete state.picks[c];
            state.plan = buildPlan();
            renderAll();
            saveLocal();
        });

        // 天数/人数
        var dEl = $('plDays'), pEl = $('plPeople');
        if (dEl) dEl.addEventListener('change', function () {
            state.days = clamp(parseInt(dEl.value, 10) || 4, 1, 20);
            dEl.value = state.days;
            if (state.plan) { state.plan = buildPlan(); renderResult(); }
            saveLocal();
        });
        if (pEl) pEl.addEventListener('change', function () {
            state.people = clamp(parseInt(pEl.value, 10) || 2, 1, 20);
            pEl.value = state.people;
            if (state.plan) { state.plan = buildPlan(); renderResult(); }
            saveLocal();
        });

        // 偏好
        var prefs = $('plPrefs');
        if (prefs) prefs.addEventListener('click', function (e) {
            var b = e.target.closest('[data-pref]');
            if (!b) return;
            var k = b.getAttribute('data-pref');
            var i = state.prefs.indexOf(k);
            if (i >= 0) state.prefs.splice(i, 1); else state.prefs.push(k);
            renderPoiZone();
            renderCityZone();
            saveLocal();
        });

        // 景点
        var groups = $('plPoiGroups');
        if (groups) groups.addEventListener('click', function (e) {
            var chip = e.target.closest('[data-poi]');
            if (chip) {
                var poi = chip.getAttribute('data-poi'), city = chip.getAttribute('data-city');
                state.picks[city] = state.picks[city] || [];
                var idx = state.picks[city].indexOf(poi);
                if (idx >= 0) state.picks[city].splice(idx, 1);
                else state.picks[city].push(poi);
                renderPoiZone();
                saveLocal();
                return;
            }
            var all = e.target.closest('[data-pickall]');
            if (all) {
                var c = all.getAttribute('data-pickall');
                var cat = CATALOG[c];
                if (!cat) return;
                state.picks[c] = (state.prefs.length ? autoPickCity(c, 4) : cat.items.slice(0, 4).map(function (i) { return i.name; }));
                renderPoiZone();
                saveLocal();
            }
        });

        // 生成
        var gen = $('plGenerate');
        if (gen) gen.addEventListener('click', function () {
            if (!state.cities.length) { toast('先选一座城市吧'); return; }
            if (!state.picks || !Object.keys(state.picks).length) {
                state.cities.forEach(function (c) { state.picks[c] = autoPickCity(c, 3); });
            }
            state.plan = buildPlan();
            if (!state.plan) { toast('生成失败，请检查选择'); return; }
            renderResult();
            saveLocal();
            var card = $('plResultCard');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            pushMsg('ai', '行程已生成：' + state.plan.cities.join(' → ') + '，' + state.plan.days + ' 天。想改哪里直接跟我说，比如「第三天太赶了」或「加上' +
                (autoPickCity(state.plan.cities[0], 6)[4] || '另一个景点') + '」。');
        });

        // 助手
        var send = $('plAgentSend');
        var input = $('plAgentInput');
        if (send) send.addEventListener('click', function () { sendAgent(input ? input.value : ''); });
        if (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAgent(input.value); }
            });
            input.addEventListener('input', function () {
                input.style.height = 'auto';
                input.style.height = Math.min(96, input.scrollHeight) + 'px';
            });
        }
        var chips = $('plAgentChips');
        if (chips) chips.addEventListener('click', function (e) {
            var b = e.target.closest('[data-chip]');
            if (b) sendAgent(b.getAttribute('data-chip'));
        });

        // 接入设置
        var gear = $('plAgentSettings');
        var panel = $('plAiPanel');
        if (gear && panel) gear.addEventListener('click', function () { panel.classList.toggle('open'); });

        var provSel = $('plAiProvider');
        if (provSel) provSel.addEventListener('change', function () {
            var p = AI_PRESETS[provSel.value] || AI_PRESETS.builtin;
            var ep = $('plAiEndpoint'), md = $('plAiModel');
            if (ep) ep.value = p.endpoint || '';
            if (md) md.value = p.model || '';
        });

        var saveAi = $('plAiSave');
        if (saveAi) saveAi.addEventListener('click', function () {
            var provider = ($('plAiProvider') || {}).value || 'builtin';
            var endpoint = (($('plAiEndpoint') || {}).value || '').trim();
            var model = (($('plAiModel') || {}).value || '').trim();
            var key = (($('plAiKey') || {}).value || '').trim();
            state.aiCfg = { provider: provider, endpoint: endpoint, model: model, key: key };
            try { localStorage.setItem(LS_AI, JSON.stringify(state.aiCfg)); } catch (e) { }
            updateAgentStatus();
            toast(provider === 'builtin' ? '已切换回内置引擎' : '已保存，下一句就会走 ' + ((AI_PRESETS[provider] || {}).label || provider));
        });

        var clearAi = $('plAiClear');
        if (clearAi) clearAi.addEventListener('click', function () {
            state.aiCfg = { provider: 'builtin', endpoint: '', model: '', key: '' };
            try { localStorage.removeItem(LS_AI); } catch (e) { }
            var ps = $('plAiProvider'); if (ps) ps.value = 'builtin';
            var ep = $('plAiEndpoint'); if (ep) ep.value = '';
            var md = $('plAiModel'); if (md) md.value = '';
            var ky = $('plAiKey'); if (ky) ky.value = '';
            updateAgentStatus();
            toast('已清除接入配置');
        });
    }

    function addCity(city) {
        if (!CATALOG[city]) return;
        if (state.cities.indexOf(city) >= 0) { toast(city + ' 已经在行程里了'); return; }
        if (state.cities.length >= 4) { toast('最多同时安排 4 座城市'); return; }
        state.cities.push(city);
        state.picks[city] = autoPickCity(city, 3);
        if (state.days < state.cities.length * 2) state.days = state.cities.length * 2;
        renderCityZone();
        renderPoiZone();
        if (state.plan) { state.plan = buildPlan(); renderResult(); }
        saveLocal();
        toast('已加入 ' + city + '，默认挑了 ' + state.picks[city].join('、'));
    }

    function updateAgentStatus() {
        var el = $('plAgentStatus');
        if (!el) return;
        var cfg = state.aiCfg || {};
        if (cfg.provider && cfg.provider !== 'builtin') {
            var label = (AI_PRESETS[cfg.provider] || {}).label || cfg.provider;
            el.textContent = label + (cfg.model ? ' · ' + cfg.model : '') + ' 已接入';
        } else {
            el.textContent = '内置规划引擎 · 实时可用';
        }
    }

    /* ==================== 初始化 ==================== */
    function mount() {
        var root = $('plannerApp');
        if (!root) return;

        root.innerHTML = [
            '<div class="pl-shell">',
            '  <div class="pl-main">',
            '    <div class="pl-card">',
            '      <div class="pl-card-head"><span class="pl-step">1</span><div><h3>选择目的地</h3><p>可以多选，最多 4 座城市，跨城会自动排高铁/飞机</p></div></div>',
            '      <div class="pl-city-search"><i class="fas fa-search"></i><input id="plCityInput" type="text" placeholder="搜索城市，如：杭州、成都、西安…" autocomplete="off"><div class="pl-suggest" id="plSuggest"></div></div>',
            '      <div class="pl-hot-label">热门城市</div><div class="pl-hot" id="plHot"></div>',
            '      <div class="pl-city-tags" id="plCityTags"></div>',
            '      <div class="pl-row">',
            '        <label class="pl-field">天数 <input id="plDays" type="number" min="1" max="20" value="4"> 天</label>',
            '        <label class="pl-field">人数 <input id="plPeople" type="number" min="1" max="20" value="2"> 人</label>',
            '        <div class="pl-prefs" id="plPrefs"></div>',
            '      </div>',
            '    </div>',
            '    <div class="pl-card">',
            '      <div class="pl-card-head"><span class="pl-step">2</span><div><h3>勾选想去的景点</h3><p>点右侧 + 加入行程，AI 会自动按地理位置排顺路</p></div><div class="pl-poi-actions"><span class="pl-poi-count" id="plPoiCount">已选 0 个景点</span></div></div>',
            '      <div class="pl-poi-groups" id="plPoiGroups"></div>',
            '      <div class="pl-cta"><button class="pl-btn-primary" id="plGenerate">✨ 生成我的行程</button><button class="pl-btn-ghost" id="plDemo">看示例</button></div>',
            '    </div>',
            '    <div class="pl-card pl-result" id="plResultCard" hidden><div id="plResultBody"></div></div>',
            '  </div>',
            '  <aside class="pl-agent">',
            '    <div class="pl-agent-head"><div class="pl-avatar">AI</div><div style="min-width:0"><strong>AI 行程助手</strong><span id="plAgentStatus">内置规划引擎 · 实时可用</span></div>',
            '      <button id="plAgentSettings" title="接入豆包/大模型"><i class="fas fa-sliders-h"></i></button></div>',
            '    <div class="pl-agent-body" id="plAgentBody"></div>',
            '    <div class="pl-agent-chips" id="plAgentChips"></div>',
            '    <div class="pl-agent-input"><textarea id="plAgentInput" rows="1" placeholder="想怎么改？例如：第三天太赶了"></textarea><button id="plAgentSend" aria-label="发送"><i class="fas fa-paper-plane"></i></button></div>',
            '    <div class="pl-ai-panel" id="plAiPanel">',
            '      <h4>接入大模型（可选）</h4>',
            '      <p class="hint">不配置也能用内置引擎。填入自己的 API Key 后，修改意图交给豆包/DeepSeek 理解，效果更自然。Key 只保存在你的浏览器本地，不会上传到 MYL 服务器。</p>',
            '      <div class="pl-ai-field"><label>服务商</label><select id="plAiProvider">',
            '        <option value="builtin">内置规划引擎（无需配置）</option>',
            '        <option value="doubao">豆包 · 火山方舟</option>',
            '        <option value="deepseek">DeepSeek</option>',
            '        <option value="custom">自定义 OpenAI 兼容接口 / 代理</option>',
            '      </select></div>',
            '      <div class="pl-ai-field"><label>接口地址（可换成自建代理）</label><input id="plAiEndpoint" type="text" placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"></div>',
            '      <div class="pl-ai-field"><label>模型 / 推理接入点 ID</label><input id="plAiModel" type="text" placeholder="doubao-seed-1-6-250615"></div>',
            '      <div class="pl-ai-field"><label>API Key</label><input id="plAiKey" type="password" placeholder="只存本机 localStorage" autocomplete="off"></div>',
            '      <div class="pl-ai-btns"><button class="pl-btn-primary" id="plAiSave">保存</button><button class="pl-btn-ghost" id="plAiClear">清除</button></div>',
            '    </div>',
            '  </aside>',
            '</div>'
        ].join('');

        // 示例按钮
        var demo = $('plDemo');
        if (demo) demo.addEventListener('click', function () { loadDemo(); });

        bindEvents();

        // 回填已保存的接入配置
        if (state.aiCfg) {
            var ps = $('plAiProvider'); if (ps) ps.value = state.aiCfg.provider || 'builtin';
            var ep = $('plAiEndpoint'); if (ep) ep.value = state.aiCfg.endpoint || '';
            var md = $('plAiModel'); if (md) md.value = state.aiCfg.model || '';
            var ky = $('plAiKey'); if (ky) ky.value = state.aiCfg.key || '';
        }

        // 恢复上次 / 首次示例
        var restored = loadLocal();
        if (!restored) loadDemo(true);
        else {
            renderAll();
            if (state.cities.length) {
                state.plan = buildPlan();
                renderResult();
            }
        }
        if (!state.msgs.length) {
            pushMsg('ai', '你好，我是行程助手 👋<br>先选城市、勾景点，点「生成我的行程」，地图和每天安排会自动出来。<br>之后想改哪里直接说，比如「第三天太赶了」「加上灵隐寺」「推荐酒店」。');
        }
        updateAgentStatus();
    }

    function loadDemo(quiet) {
        state.cities = ['杭州', '苏州'];
        state.days = 4;
        state.people = 2;
        state.prefs = ['nature', 'history'];
        state.pace = 'normal';
        state.picks = {
            '杭州': ['西湖', '灵隐寺', '西溪湿地'],
            '苏州': ['拙政园', '平江路', '虎丘']
        };
        state.plan = buildPlan();
        renderAll();
        saveLocal();
        if (!quiet) {
            var card = $('plResultCard');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            toast('已载入示例：杭州 → 苏州 4 天');
        }
    }

    /* 启动 */
    function boot() {
        CATALOG = buildCatalog();
        CITY_PROV = buildProvMap();
        loadAiCfg();
        mount();
        agentQuickChips();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

    // 供调试/外部调用
    window.MYLPlanner = {
        state: state,
        catalog: function () { return CATALOG; },
        regenerate: regenerate,
        __debug: {
            buildPlan: buildPlan,
            localReply: localReply,
            applyActions: applyActions,
            autoPickCity: autoPickCity,
            ticketOf: ticketOf
        }
    };
})();
