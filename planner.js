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
        site: { label: '站点 AI（已接入豆包 / DeepSeek，无需填 Key）', endpoint: '/api/chat', model: 'auto' },
        builtin: { label: '内置规划引擎（无需配置，推荐）', endpoint: '', model: '' },
        doubao: { label: '豆包 · 火山方舟（填自己的 Key）', endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', model: 'doubao-seed-1-6-250615' },
        deepseek: { label: 'DeepSeek（填自己的 Key）', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
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
        if (/街|夜市|小吃|美食|巷|集市|老城|食|吊锅|粑粑|瓜片|板栗|米酒/.test(name)) tags.push('food');
        if (/锦里|宽窄巷子|回民街|户部巷|太平老街|曾厝垵|南锣鼓巷|夫子庙|观前街|东关街/.test(name) && tags.indexOf('food') < 0) tags.push('food');
        if (/乐园|海洋|动物|欢乐谷|方特|迪士尼|世界之窗|科技馆|水族|儿童|锦绣中华|极地|游乐园|影视城/.test(name)) tags.push('family');
        if (/景|湾|海|日落|观景|塔|峰|湖|岛|夜游|夜景/.test(name)) tags.push('photo');
        if (/温泉|古镇|湖|公园|度假|庄园|茶园|湿地|草原/.test(name)) tags.push('relax');
        return tags;
    }

    /* 全球主要城市：城市中心 + 代表景点，保证「全国 + 全世界」都搜得到 */
    var WORLD_CITIES = [
        { n: '纽约', c: '美国', x: -74.0060, y: 40.7128, p: [['自由女神像', -74.0445, 40.6892], ['时代广场', -73.9855, 40.7580], ['中央公园', -73.9654, 40.7829]] },
        { n: '洛杉矶', c: '美国', x: -118.2437, y: 34.0522, p: [['好莱坞环球影城', -118.3534, 34.1381], ['格里菲斯天文台', -118.3004, 34.1184], ['圣莫尼卡海滩', -118.4965, 34.0195]] },
        { n: '旧金山', c: '美国', x: -122.4194, y: 37.7749, p: [['金门大桥', -122.4783, 37.8199], ['渔人码头', -122.4177, 37.8080], ['九曲花街', -122.4187, 37.8021]] },
        { n: '拉斯维加斯', c: '美国', x: -115.1398, y: 36.1699, p: [['拉斯维加斯大道', -115.1728, 36.1147]] },
        { n: '华盛顿', c: '美国', x: -77.0369, y: 38.9072, p: [['白宫', -77.0365, 38.8977], ['林肯纪念堂', -77.0502, 38.8893]] },
        { n: '芝加哥', c: '美国', x: -87.6298, y: 41.8781, p: [['千禧公园', -87.6223, 41.8827]] },
        { n: '波士顿', c: '美国', x: -71.0589, y: 42.3601 },
        { n: '西雅图', c: '美国', x: -122.3321, y: 47.6062, p: [['派克市场', -122.3425, 47.6097], ['太空针塔', -122.3493, 47.6205]] },
        { n: '夏威夷', c: '美国', x: -157.8583, y: 21.3069, p: [['威基基海滩', -157.8275, 21.2793]] },
        { n: '温哥华', c: '加拿大', x: -123.1207, y: 49.2827, p: [['斯坦利公园', -123.1413, 49.3017]] },
        { n: '多伦多', c: '加拿大', x: -79.3832, y: 43.6532, p: [['CN塔', -79.3871, 43.6426]] },
        { n: '墨西哥城', c: '墨西哥', x: -99.1332, y: 19.4326 },
        { n: '里约热内卢', c: '巴西', x: -43.1729, y: -22.9068, p: [['基督像', -43.2105, -22.9519], ['科帕卡巴纳海滩', -43.1822, -22.9711]] },
        { n: '布宜诺斯艾利斯', c: '阿根廷', x: -58.3816, y: -34.6037 },
        { n: '首尔', c: '韩国', x: 126.9780, y: 37.5665, p: [['景福宫', 126.9770, 37.5796], ['明洞', 126.9850, 37.5636], ['N首尔塔', 126.9882, 37.5512]] },
        { n: '釜山', c: '韩国', x: 129.0756, y: 35.1796, p: [['海云台', 129.1604, 35.1587]] },
        { n: '济州岛', c: '韩国', x: 126.5312, y: 33.4996 },
        { n: '大阪', c: '日本', x: 135.5023, y: 34.6937, p: [['大阪城', 135.5259, 34.6873], ['道顿堀', 135.5011, 34.6687], ['日本环球影城', 135.4323, 34.6654]] },
        { n: '京都', c: '日本', x: 135.7681, y: 35.0116, p: [['清水寺', 135.7850, 34.9949], ['伏见稻荷大社', 135.7727, 34.9671], ['金阁寺', 135.7292, 35.0394]] },
        { n: '北海道', c: '日本', x: 141.3545, y: 43.0618, p: [['大通公园', 141.3468, 43.0606], ['白色恋人公园', 141.3450, 43.1000]] },
        { n: '冲绳', c: '日本', x: 127.6809, y: 26.2124, p: [['首里城', 127.7195, 26.2170], ['美丽海水族馆', 127.9520, 26.6940]] },
        { n: '新加坡', c: '新加坡', x: 103.8198, y: 1.3521, p: [['滨海湾金沙', 103.8607, 1.2834], ['鱼尾狮公园', 103.8545, 1.2868], ['圣淘沙岛', 103.8238, 1.2494]] },
        { n: '吉隆坡', c: '马来西亚', x: 101.6869, y: 3.1390, p: [['双子塔', 101.7116, 3.1578], ['独立广场', 101.6935, 3.1478]] },
        { n: '沙巴', c: '马来西亚', x: 116.0735, y: 5.9804 },
        { n: '清迈', c: '泰国', x: 98.9853, y: 18.7883, p: [['双龙寺', 98.9217, 18.8047], ['清迈古城', 98.9880, 18.7870]] },
        { n: '普吉岛', c: '泰国', x: 98.3923, y: 7.8804, p: [['芭东海滩', 98.2966, 7.8965]] },
        { n: '河内', c: '越南', x: 105.8342, y: 21.0278, p: [['还剑湖', 105.8524, 21.0287]] },
        { n: '胡志明市', c: '越南', x: 106.6297, y: 10.8231 },
        { n: '岘港', c: '越南', x: 108.2022, y: 16.0544 },
        { n: '暹粒', c: '柬埔寨', x: 103.8667, y: 13.3671, p: [['吴哥窟', 103.8670, 13.4125]] },
        { n: '加德满都', c: '尼泊尔', x: 85.3240, y: 27.7172 },
        { n: '科伦坡', c: '斯里兰卡', x: 79.8612, y: 6.9271 },
        { n: '马尔代夫', c: '马尔代夫', x: 73.5093, y: 4.1755 },
        { n: '悉尼', c: '澳大利亚', x: 151.2093, y: -33.8688, p: [['悉尼歌剧院', 151.2153, -33.8568], ['海港大桥', 151.2108, -33.8523], ['邦迪海滩', 151.2743, -33.8908]] },
        { n: '墨尔本', c: '澳大利亚', x: 144.9631, y: -37.8136, p: [['大洋路', 143.5000, -38.6800]] },
        { n: '奥克兰', c: '新西兰', x: 174.7633, y: -36.8485 },
        { n: '皇后镇', c: '新西兰', x: 168.6626, y: -45.0312, p: [['米尔福德峡湾', 167.9200, -44.6700]] },
        { n: '多哈', c: '卡塔尔', x: 51.5310, y: 25.2854 },
        { n: '伊斯坦布尔', c: '土耳其', x: 28.9784, y: 41.0082, p: [['圣索菲亚大教堂', 28.9802, 41.0086], ['蓝色清真寺', 28.9768, 41.0054]] },
        { n: '卡帕多奇亚', c: '土耳其', x: 34.8280, y: 38.6431 },
        { n: '莫斯科', c: '俄罗斯', x: 37.6173, y: 55.7558, p: [['红场', 37.6208, 55.7539], ['克里姆林宫', 37.6178, 55.7520]] },
        { n: '圣彼得堡', c: '俄罗斯', x: 30.3351, y: 59.9343, p: [['冬宫', 30.3146, 59.9398]] },
        { n: '雅典', c: '希腊', x: 23.7275, y: 37.9838, p: [['雅典卫城', 23.7257, 37.9715], ['圣托里尼', 25.4310, 36.3932]] },
        { n: '罗马', c: '意大利', x: 12.4964, y: 41.9028, p: [['古罗马斗兽场', 12.4922, 41.8902], ['特雷维喷泉', 12.4833, 41.9009], ['梵蒂冈', 12.4534, 41.9029]] },
        { n: '米兰', c: '意大利', x: 9.1900, y: 45.4642, p: [['米兰大教堂', 9.1916, 45.4641]] },
        { n: '威尼斯', c: '意大利', x: 12.3155, y: 45.4408, p: [['圣马可广场', 12.3388, 45.4341]] },
        { n: '佛罗伦萨', c: '意大利', x: 11.2558, y: 43.7696, p: [['圣母百花大教堂', 11.2558, 43.7731]] },
        { n: '巴塞罗那', c: '西班牙', x: 2.1734, y: 41.3851, p: [['圣家堂', 2.1744, 41.4036], ['巴特罗之家', 2.1649, 41.3917]] },
        { n: '马德里', c: '西班牙', x: -3.7038, y: 40.4168 },
        { n: '里斯本', c: '葡萄牙', x: -9.1393, y: 38.7223 },
        { n: '阿姆斯特丹', c: '荷兰', x: 4.9041, y: 52.3676, p: [['荷兰国立博物馆', 4.8852, 52.3599], ['桑斯安斯风车村', 4.8150, 52.4730]] },
        { n: '柏林', c: '德国', x: 13.4050, y: 52.5200, p: [['勃兰登堡门', 13.3777, 52.5163]] },
        { n: '慕尼黑', c: '德国', x: 11.5820, y: 48.1351, p: [['新天鹅堡', 10.7498, 47.5576]] },
        { n: '苏黎世', c: '瑞士', x: 8.5417, y: 47.3769, p: [['少女峰', 7.9620, 46.5475]] },
        { n: '维也纳', c: '奥地利', x: 16.3738, y: 48.2082, p: [['美泉宫', 16.3122, 48.1845]] },
        { n: '布拉格', c: '捷克', x: 14.4378, y: 50.0755, p: [['查理大桥', 14.4114, 50.0865], ['布拉格城堡', 14.4000, 50.0910]] },
        { n: '布达佩斯', c: '匈牙利', x: 19.0402, y: 47.4979 },
        { n: '开罗', c: '埃及', x: 31.2357, y: 30.0444, p: [['吉萨金字塔', 31.1342, 29.9792], ['埃及博物馆', 31.2336, 30.0478]] },
        { n: '开普敦', c: '南非', x: 18.4241, y: -33.9249, p: [['桌山', 18.4035, -33.9628]] },
        { n: '马拉喀什', c: '摩洛哥', x: -7.9811, y: 31.6295 },
        { n: '关岛', c: '美国', x: 144.7937, y: 13.4443 }
    ];

    /* 冷门城市补全：主站数据里景点偏少的城市，在规划器里补足可选项 */
    var CITY_EXTRA_POIS = {
        '六安': ['天堂寨', '万佛湖', '大别山主峰', '燕子河大峡谷', '皖西大裂谷',
            '大别山石窟', '佛子岭水库', '铜锣寨', '九公寨', '六安瓜片茶园',
            '独山革命旧址群', '皖西博物馆', '皋陶墓', '月亮岛', '万佛山', '龙井沟',
            '大别山吊锅', '蒿子粑粑', '六安瓜片'],
        '亳州': ['曹操运兵道', '花戏楼', '老子故里', '华祖庵', '南京巷钱庄', '曹操公园'],
        '池州': ['九华山', '平天湖', '杏花村', '牯牛降', '蓬莱仙洞', '秋浦河'],
        '宣城': ['敬亭山', '龙川胡氏宗祠', '太极洞', '查济古村', '桃花潭', '水东古镇'],
        '滁州': ['琅琊山', '醉翁亭', '明中都', '小岗村', '狼巷迷谷'],
        '宿州': ['皇藏峪', '宿州博物馆', '陈胜吴广起义旧址', '砀山梨园', '五柳风景区']
    };
    /* 上面的补充景点尽量给真实经纬度，地图上不会全挤在市中心 */
    var CITY_EXTRA_COORDS = {
        '六安·天堂寨': [115.77, 31.08], '六安·万佛湖': [116.99, 31.30],
        '六安·大别山主峰': [116.10, 31.11], '六安·燕子河大峡谷': [115.95, 31.28],
        '六安·皖西大裂谷': [116.38, 31.44], '六安·大别山石窟': [116.42, 31.53],
        '六安·佛子岭水库': [116.28, 31.39], '六安·铜锣寨': [116.02, 31.20],
        '六安·九公寨': [116.30, 31.62], '六安·六安瓜片茶园': [116.27, 31.66],
        '六安·独山革命旧址群': [116.29, 31.60], '六安·皖西博物馆': [116.51, 31.75],
        '六安·皋陶墓': [116.50, 31.76], '六安·月亮岛': [116.49, 31.76],
        '六安·万佛山': [116.60, 31.20], '六安·龙井沟': [116.35, 31.72]
    };

    /* 环线途经点坐标（环线数据里只有示意图相对坐标，这里补真实经纬度） */
    var LOOP_PIN_COORDS = {
        '都兰': [98.089, 36.302], '乌兰': [98.480, 36.929], '大柴旦': [95.358, 37.852],
        '玉门': [97.045, 40.291], '瓜州': [95.782, 40.520], '扁都口': [100.984, 38.204], '门源': [101.622, 37.376],
        '独山子': [84.886, 44.328], '独库公路北段': [84.600, 43.520], '那拉提': [84.008, 43.312],
        '昭苏': [81.126, 43.158], '喀拉峻': [82.300, 43.100], '库车': [82.963, 41.717],
        '札达': [79.803, 31.479], '狮泉河': [80.105, 32.503], '理塘': [100.270, 30.000], '亚丁村': [100.340, 28.440],
        '东京': [139.6917, 35.6895], '镰仓': [139.5467, 35.3192], '箱根': [139.1069, 35.2324],
        '富士山': [138.7274, 35.3606], '京都': [135.7681, 35.0116], '大阪': [135.5023, 34.6937], '奈良': [135.8048, 34.6851],
        '巴黎': [2.3522, 48.8566], '布鲁塞尔': [4.3517, 50.8503], '阿姆斯特丹': [4.9041, 52.3676],
        '柏林': [13.4050, 52.5200], '布拉格': [14.4378, 50.0755], '维也纳': [16.3738, 48.2082],
        '基督城': [172.6362, -43.5321], '皇后镇': [168.6626, -45.0312], '米尔福德峡湾': [167.9256, -44.6717], '但尼丁': [170.5028, -45.8788],
        '曼谷': [100.5018, 13.7563], '阿育塔亚': [100.5689, 14.3533], '清迈': [98.9853, 18.7883], '清莱': [99.8325, 19.9105],
        '新加坡': [103.8198, 1.3521], '槟城': [100.3327, 5.4141], '兰卡威': [99.8567, 6.1754], '普吉岛': [98.7784, 7.8804], '巴厘岛': [115.1889, -8.4095],
        '洛杉矶': [-118.2437, 34.0522], '圣迭戈': [-117.1611, 32.7157], '拉斯维加斯': [-115.1398, 36.1699], '旧金山': [-122.4194, 37.7749]
    };

    /* 无精确坐标时的近似落点：城市范围内分散排布，保证同名景点不重叠 */
    function approxCoord(name, center, idx) {
        var h = 0;
        for (var i = 0; i < String(name).length; i++) h = (h * 131 + String(name).charCodeAt(i)) % 99991;
        var ang = ((h % 360) + (idx || 0) * 47) * Math.PI / 180;
        var r = 0.006 + (h % 9) * 0.0032;
        var lat = center[1] + Math.sin(ang) * r;
        var lng = center[0] + Math.cos(ang) * r / Math.max(0.35, Math.cos(center[1] * Math.PI / 180));
        return [lng, lat];
    }

    /* 各地代表菜说明，用于美食卡片 */
    var FOOD_DESC = {
        '西湖醋鱼': '草鱼氽熟浇糖醋汁，杭州名菜，楼外楼最出名',
        '龙井虾仁': '明前龙井配河虾仁，清香回甘',
        '葱包桧': '春饼卷油条小葱，路边摊经典早点',
        '东坡肉': '慢炖五花，酥而不腻',
        '叫花鸡': '荷叶黄泥裹烤，杭州老菜',
        '生煎': '底部焦脆，咬开先吸汤',
        '蟹壳黄': '油酥小烧饼，蟹粉馅最香',
        '小笼包': '皮薄汁多，先咬破吸汤',
        '盐水鸭': '南京名物，皮白肉嫩咸鲜',
        '鸭血粉丝汤': '鸭血鸭肠配粉丝，早餐首选',
        '松鼠桂鱼': '苏州名菜，外酥里嫩浇酸甜汁',
        '奥灶面': '昆山红油爆鱼面，汤头见功力',
        '蟹黄汤包': '靖江吃法，插管吸汤',
        '扬州早茶': '三丁包、千层油糕、翡翠烧卖',
        '蟹粉狮子头': '扬州刀工菜，入口即化',
        '肉夹馍': '腊汁肉配白吉馍，西安标配',
        '羊肉泡馍': '自己掰馍，配糖蒜和辣酱',
        'biangbiang面': '裤带宽面，油泼辣子一浇',
        '凉皮': '米皮配醋辣，夏天必吃'
    };

    function buildCatalog() {
        var src = window._knownDict || {};
        var known = {};
        Object.keys(src).forEach(function (k) { known[k] = (src[k] || []).slice(); });
        /* 合并补充景点，保证冷门城市也有足够可选项 */
        Object.keys(CITY_EXTRA_POIS).forEach(function (city) {
            var arr = known[city] || (known[city] = []);
            CITY_EXTRA_POIS[city].forEach(function (n) { if (arr.indexOf(n) < 0) arr.push(n); });
        });
        var R = window.REAL_POI_COORDS || {};
        var centers = window.ALL_CITY_COORDS || {};
        var out = {};
        Object.keys(known).forEach(function (city) {
            var center = centers[city];
            if (!center || !isFinite(center[0])) return;
            var items = [], seen = {};
            (known[city] || []).forEach(function (name, idx) {
                if (!name || seen[name]) return;
                var extra = CITY_EXTRA_COORDS[city + '·' + name];
                var c = R[city + '·' + name] || R[name] || extra;
                if (c && (!isFinite(c[0]) || !isFinite(c[1]))) c = null;
                if (c && distKm(c, center) > 400) c = null;
                if (!c) c = approxCoord(name, center, idx);   // 没有精确坐标：按城市范围近似，保证可搜索可排线
                seen[name] = 1;
                items.push({
                    name: name, city: city, lng: +c[0], lat: +c[1], idx: idx,
                    cat: classify(name), approx: !(R[city + '·' + name] || R[name] || extra)
                });
            });
            if (items.length >= 1) out[city] = { name: city, center: center, items: items };
        });

        // 境外富数据城市（巴黎/东京/伦敦/迪拜/曼谷/巴厘岛…）
        var detail = window.CITY_DETAIL || {};
        var routeCoords = window.CITY_ROUTE_COORDS || {};
        Object.keys(detail || {}).forEach(function (key) {
            var d = detail[key];
            if (!d || !d.name || out[d.name] || centers[d.name]) return;
            var coords = routeCoords[key] || [];
            var items = [], seen2 = {};
            (d.routePins || []).forEach(function (p, i) {
                var c = coords[i];
                if (!c || !isFinite(c[0]) || seen2[p]) return;
                seen2[p] = 1;
                items.push({ name: p, city: d.name, lng: +c[0], lat: +c[1], idx: i, cat: classify(p) });
            });
            if (!items.length) return;
            var sx = 0, sy = 0;
            items.forEach(function (it) { sx += it.lng; sy += it.lat; });
            out[d.name] = {
                name: d.name, center: [sx / items.length, sy / items.length],
                items: items, overseas: true
            };
            CITY_PROV[d.name] = d.country || '海外';
        });

        // 全球主要城市（可搜索、可排线）
        WORLD_CITIES.forEach(function (w) {
            if (out[w.n]) return;
            var items = (w.p || []).map(function (p, i) {
                return { name: p[0], city: w.n, lng: p[1], lat: p[2], idx: i, cat: classify(p[0]) };
            });
            if (!items.length) {
                items.push({
                    name: w.n + '城区漫步', city: w.n, lng: w.x, lat: w.y,
                    idx: 0, cat: ['relax'], generic: true
                });
            }
            out[w.n] = { name: w.n, center: [w.x, w.y], items: items, overseas: true };
            CITY_PROV[w.n] = w.c;
        });

        // 全国地级市兜底：暂无景点数据的城市也能搜到、能排线
        Object.keys(centers).forEach(function (city) {
            if (out[city]) return;
            var c = centers[city];
            if (!c || !isFinite(c[0])) return;
            out[city] = {
                name: city, center: c, generic: true,
                items: [{
                    name: city + '城区漫步', city: city, lng: +c[0], lat: +c[1],
                    idx: 0, cat: ['relax'], generic: true
                }]
            };
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
        hotelTier: 'comfort', // budget | comfort | luxury
        transport: 'auto',  // auto | train | flight
        budget: 0,          // 人均预算上限，0 = 不限
        loop: null,         // 当前环线 {id,name}
        plan: null,
        msgs: [],
        aiCfg: null,
        siteAiReady: false,
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
        var byTrain = km <= 900, forced = state.transport || 'auto';
        if (forced === 'train') byTrain = km <= 2200;   // 愿意坐长高铁
        if (forced === 'flight') byTrain = km <= 300;   // 尽量飞
        if (byTrain) {
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

    function baseHotel(city) {
        return TIER1.indexOf(city) >= 0 ? 560 : (TIER2.indexOf(city) >= 0 ? 380 : 260);
    }
    function hotelPrice(city) {
        var base = baseHotel(city);
        var t = state.hotelTier || 'comfort';
        if (t === 'budget') return Math.round(base * 0.55);
        if (t === 'luxury') return Math.round(base * 2.1);
        return base;
    }

    /* ---------- 携程预订入口 ---------- */
    function ctripFood(q) {
        return 'https://you.ctrip.com/searchsite/food/?query=' + encodeURIComponent(q);
    }

    function buildPlan() {
        if (state.loop) {
            var lp = (window.LOOP_ROUTES || []).filter(function (x) { return x.id === state.loop.id; })[0];
            if (lp) return buildLoopPlan(lp);
            state.loop = null;
        }
        var cities = state.cities.filter(function (c) { return CATALOG[c]; });
        if (!cities.length) return null;

        var nDays = clamp(Math.max(state.days, cities.length), 1, 20);
        var picks = {};
        cities.forEach(function (c) {
            picks[c] = (state.picks[c] || []).filter(function (n) {
                return CATALOG[c].items.some(function (i) { return i.name === n; });
            });
            if (!picks[c].length) {
                // 只选了城市没选景点时，补两个经典景点保证能出图
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

    /* ---------- 环线行程：把站内环线数据直接变成可编辑行程 ---------- */
    function loopCoordOf(name) {
        var R = window.REAL_POI_COORDS || {};
        var C = window.ALL_CITY_COORDS || {};
        if (R[name] && isFinite(R[name][0])) return R[name];
        if (C[name] && isFinite(C[name][0])) return C[name];
        if (LOOP_PIN_COORDS[name]) return LOOP_PIN_COORDS[name];
        if (CATALOG[name]) return CATALOG[name].center;
        return null;
    }

    function loopCityOf(theme, fallback) {
        var parts = String(theme || '').split(/[·→>、]/);
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i].trim().replace(/[（(].*?[）)]/g, '');
            if (!p) continue;
            if (CATALOG[p] || (window.ALL_CITY_COORDS || {})[p]) return p;
            var hit = Object.keys(CATALOG).filter(function (c) { return p.indexOf(c) >= 0; })[0];
            if (hit) return hit;
        }
        return fallback;
    }

    function buildLoopPlan(loop) {
        var fallbackCity = loopCityOf(loop.mapPoints[0] && loop.mapPoints[0].name, '西宁') || '西宁';
        var byDay = {};
        (loop.mapPoints || []).forEach(function (p) {
            var dn = parseInt(String(p.day || 'Day 1').replace(/[^\d]/g, ''), 10) || 1;
            var c = loopCoordOf(p.name) || approxCoord(p.name, CATALOG[fallbackCity] ? CATALOG[fallbackCity].center : [101.78, 36.62], dn);
            (byDay[dn] = byDay[dn] || []).push({ name: p.name, lng: +c[0], lat: +c[1] });
        });

        var daysList = [], citiesSeen = [], totalKm = 0, ticketSum = 0, hotelNights = 0;
        (loop.itinerary || []).forEach(function (it, i) {
            var dayNo = i + 1;
            var city = loopCityOf(it.theme, fallbackCity);
            if (citiesSeen.indexOf(city) < 0) citiesSeen.push(city);
            var pois = (byDay[dayNo] || []).filter(function (p, idx, arr) {
                return arr.findIndex(function (x) { return x.name === p.name; }) === idx;
            });
            if (pois.length > 1) {
                // 同日多点按距离串联，去掉折返
                var ord = [pois[0]];
                var rest = pois.slice(1);
                while (rest.length) {
                    var last = ord[ord.length - 1];
                    rest.sort(function (a, b) {
                        return distKm([last.lng, last.lat], [a.lng, a.lat]) - distKm([last.lng, last.lat], [b.lng, b.lat]);
                    });
                    ord.push(rest.shift());
                }
                pois = ord;
            }
            var dayKm = 0;
            for (var k = 1; k < pois.length; k++) {
                dayKm += distKm([pois[k - 1].lng, pois[k - 1].lat], [pois[k].lng, pois[k].lat]) * 1.35;
            }
            totalKm += dayKm;

            var blocks = (it.timeline || []).map(function (t) {
                var act = String(t.activity || '');
                var type = /午餐|晚餐|早餐|吃|餐/.test(act) ? 'meal' : (/入住|酒店|住宿|休息/.test(act) ? 'hotel' : (/自由|休整|可选/.test(act) ? 'free' : 'poi'));
                var desc = [];
                if (t.detail) desc.push(t.detail);
                if (t.duration) desc.push('时长 ' + t.duration);
                if (t.ticket) desc.push('门票 ' + t.ticket);
                if (t.price) desc.push('参考 ' + t.price);
                if (t.tip) desc.push('提示 ' + t.tip);
                return {
                    time: t.time || '', type: type, title: act, desc: desc.join(' · '),
                    hotelCity: type === 'hotel' ? city : null
                };
            });
            if (!blocks.length) {
                blocks = [{ time: '10:00', type: 'free', title: city + '自由活动', desc: '按自己的节奏逛' }];
            }
            var ticket = 0;
            (it.timeline || []).forEach(function (t) {
                var m = String(t.ticket || t.price || '').match(/(\d+)/);
                if (m && /票|¥/.test(String(t.ticket || t.price))) ticket += parseInt(m[1], 10);
            });
            ticketSum += ticket;
            if (i < (loop.itinerary || []).length - 1) hotelNights++;

            daysList.push({
                dayNo: dayNo,
                city: city,
                cityChange: null,
                theme: it.theme || ('第 ' + dayNo + ' 天'),
                pois: pois,
                blocks: blocks,
                km: Math.round(dayKm),
                ticket: ticket
            });
        });

        var nDays = daysList.length;
        var rooms = Math.ceil(state.people / 2);
        var hotelCost = 0;
        daysList.forEach(function (d, i) {
            if (i < daysList.length - 1) hotelCost += hotelPrice(d.city) * rooms;
        });
        var mealPerDay = TIER1.indexOf(daysList[0] && daysList[0].city) >= 0 ? 180 : 140;
        var meals = mealPerDay * nDays * state.people;
        var local = 90 * nDays * state.people;
        var tickets = ticketSum * state.people;
        var loopKm = parseInt(String(loop.totalKm || '').replace(/[^\d]/g, ''), 10) || Math.round(totalKm);
        var inter = Math.round(loopKm * 0.9 * state.people);   // 自驾/包车/接驳估算

        return {
            days: nDays,
            people: state.people,
            pace: state.pace,
            autoExtended: false,
            loop: true,
            title: loop.name + ' · ' + nDays + '天' + (nDays - 1) + '晚',
            cities: citiesSeen,
            daysList: daysList,
            totals: {
                km: loopKm,
                tickets: Math.round(tickets),
                hotels: Math.round(hotelCost),
                meals: Math.round(meals),
                local: Math.round(local),
                intercity: inter,
                total: Math.round(hotelCost + meals + local + tickets + inter),
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
        if (state.loop) {
            wrap.innerHTML = '<div class="pl-loop-banner"><div><b><i class="fas fa-route"></i> ' + esc(state.loop.name) + '</b>' +
                '<span>环线已生成，右侧助手可以继续改：加/减天数、换住宿档次、查航班高铁、推荐美食。</span></div>' +
                '<button class="pl-mini-btn" data-exitloop="1">退出环线，自己挑城市</button></div>';
            var cnt0 = $('plPoiCount');
            if (cnt0) cnt0.textContent = '环线模式';
            return;
        }
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
            '<div style="flex:1 1 240px"><h3 class="pl-result-title">' + esc(plan.title || (plan.cities.join(' → ') + ' · ' + plan.days + '天' + (plan.days - 1) + '晚')) + '</h3>' +
            '<p class="pl-result-sub">' + plan.daysList.length + ' 天行程 · ' + plan.cities.length + ' 座城市 · ' + paceText + '节奏 · ' + plan.people + ' 人 · ' +
            ({ budget: '经济住宿', comfort: '舒适住宿', luxury: '高档住宿' }[state.hotelTier || 'comfort']) +
            (state.budget ? ' · 预算 ¥' + num(state.budget) + '/人' : '') +
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
        var prevPt = null;
        plan.daysList.forEach(function (d, di) {
            var color = DAY_COLORS[di % DAY_COLORS.length];
            var pts = [];
            d.pois.forEach(function (p) {
                var g = wgs2gcj(p.lng, p.lat);
                pts.push([g[1], g[0]]);
            });
            // 跨天衔接：把上一天最后一个点和今天第一个点连起来（虚线），保证整条路线连续
            if (prevPt && pts.length) {
                L.polyline([prevPt, pts[0]], {
                    color: color, weight: 3, opacity: .7, dashArray: '7 8', lineJoin: 'round'
                }).addTo(map);
            }
            if (pts.length > 1) {
                L.polyline(pts, { color: color, weight: 4, opacity: .88, lineJoin: 'round' }).addTo(map);
            }
            if (pts.length) prevPt = pts[pts.length - 1];
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
                prefs: state.prefs, picks: state.picks, pace: state.pace,
                hotelTier: state.hotelTier, transport: state.transport, budget: state.budget,
                loop: state.loop
            }));
        } catch (e) { }
    }
    function loadLocal() {
        try {
            var raw = localStorage.getItem(LS_PLAN);
            if (!raw) return false;
            var d = JSON.parse(raw);
            if (!d) return false;
            if (d.loop && d.loop.id) {
                var l0 = (window.LOOP_ROUTES || []).filter(function (x) { return x.id === d.loop.id; })[0];
                if (l0) {
                    state.loop = { id: l0.id, name: l0.name };
                    state.days = l0.itinerary.length;
                    state.people = clamp(+d.people || 2, 1, 20);
                    state.hotelTier = d.hotelTier || 'comfort';
                    state.transport = d.transport || 'auto';
                    state.budget = +d.budget || 0;
                    return true;
                }
            }
            if (!d.cities || !d.cities.length) return false;
            state.cities = d.cities.filter(function (c) { return CATALOG[c]; });
            state.days = clamp(+d.days || 4, 1, 20);
            state.people = clamp(+d.people || 2, 1, 20);
            state.prefs = Array.isArray(d.prefs) ? d.prefs : [];
            state.picks = d.picks || {};
            state.pace = d.pace || 'normal';
            state.hotelTier = d.hotelTier || 'comfort';
            state.transport = d.transport || 'auto';
            state.budget = +d.budget || 0;
            return state.cities.length > 0;
        } catch (e) { return false; }
    }
    function loadAiCfg() {
        var raw = null;
        try {
            raw = localStorage.getItem(LS_AI);
            state.aiCfg = raw ? JSON.parse(raw) : { provider: 'builtin', endpoint: '', model: '', key: '' };
        } catch (e) {
            state.aiCfg = { provider: 'builtin', endpoint: '', model: '', key: '' };
        }
        if (!raw) probeSiteAI();
    }
    /* 站点配置了 DEEPSEEK_API_KEY / ARK_API_KEY 时，自动启用站点 AI，用户无需填 Key */
    function probeSiteAI() {
        if (!/^https?:$/.test(location.protocol)) return;
        fetch('/api/chat', { method: 'GET' }).then(function (r) { return r.json(); }).then(function (j) {
            if (!j || !j.configured) return;
            if (state.aiCfg && state.aiCfg.provider && state.aiCfg.provider !== 'builtin') return;
            state.aiCfg = { provider: 'site', endpoint: '/api/chat', model: 'auto', key: '' };
            state.siteAiReady = true;
            var ps = $('plAiProvider'); if (ps) ps.value = 'site';
            updateAgentStatus();
        }).catch(function () { /* 纯静态托管没有 /api/chat，继续用内置引擎 */ });
    }

    /* ==================== 生成 / 重新生成 ==================== */
    function regenerate() {
        state.plan = buildPlan();
        renderResult();
        saveLocal();
    }

    /* ==================== AI 助手 ==================== */
    function pushMsg(role, text, extra, cards) {
        state.msgs.push({ role: role, text: text, extra: extra || null, cards: cards || null });
        if (state.msgs.length > 40) state.msgs.shift();
        renderMsgs();
    }

    function cardsHtml(cards) {
        if (!cards || !cards.length) return '';
        return '<div class="pl-cards">' + cards.map(function (c) {
            var icon = c.type === 'flight' ? 'plane' : (c.type === 'train' ? 'train' : (c.type === 'hotel' ? 'hotel' : (c.type === 'food' ? 'utensils' : 'location-dot')));
            var head = '<div class="pl-card-main"><div class="pl-card-title"><i class="fas fa-' + icon + '"></i> ' + esc(c.title || '') + '</div>' +
                (c.meta ? '<div class="pl-card-meta">' + esc(c.meta) + '</div>' : '') + '</div>';
            var price = c.price ? '<div class="pl-card-price">' + esc(c.price) + '</div>' : '';
            var btn = c.link ? '<a class="pl-card-btn" href="' + esc(c.link) + '" target="_blank" rel="noopener">' + esc(c.linkText || '去携程看看') + ' →</a>' : '';
            var pickLabel = (c.apply === 'flight' || c.apply === 'train') ? '设为优先' : '用这个档次';
            var pick = c.apply ? '<button class="pl-card-pick" data-cardapply="' + esc(c.apply) + '">' + pickLabel + '</button>' : '';
            return '<div class="pl-mini-card">' + head + price + pick + btn + '</div>';
        }).join('') + '</div>';
    }

    function renderMsgs() {
        var body = $('plAgentBody');
        if (!body) return;
        body.innerHTML = state.msgs.map(function (m) {
            if (m.role === 'user') {
                return '<div class="pl-msg user"><div class="bubble">' + esc(m.text) + '</div></div>';
            }
            return '<div class="pl-msg' + (m.typing ? ' typing' : '') + '"><div class="who">AI</div><div class="bubble">' + m.text + cardsHtml(m.cards) + '</div></div>';
        }).join('');
        body.scrollTop = body.scrollHeight;
    }

    function agentQuickChips() {
        var el = $('plAgentChips');
        if (!el) return;
        var chips = ['给我生成青甘大环线', '川西环线', '查航班和高铁', '订酒店',
            '找美食', '住好点', '第三天太赶了', '预算 5000'];
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

    function cityListInText(text) {
        var found = [];
        Object.keys(CATALOG).forEach(function (c) {
            var i = text.indexOf(c);
            if (i >= 0) found.push({ c: c, i: i });
        });
        found.sort(function (a, b) { return a.i - b.i || b.c.length - a.c.length; });
        var names = [];
        found.forEach(function (f) { if (names.indexOf(f.c) < 0) names.push(f.c); });
        return names;
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
                reply: '我不只会改行程，还能当你的旅行规划师：<br>' +
                    '· <b>改日程</b>：加/少一天、第 N 天太赶、把某景点放第一天、先去某城<br>' +
                    '· <b>调景点</b>：加上/去掉/换掉某景点、多来点自然/人文/美食、换一批、只要免费的<br>' +
                    '· <b>订票订房</b>：查航班高铁、推荐酒店（分档次）、控预算、签证指引<br>' +
                    '· <b>问当地</b>：最佳季节、吃什么、玩几天合适<br>' +
                    '搜景点/城市支持全国 400+ 城和全球 60 国主要城市。',
                actions: actions
            };
        }

        if (/(清空|重新开始|全部删掉|重来)/.test(text)) {
            actions.push({ type: 'clear' });
            return { reply: '好的，已清空，我们重新开始。先告诉我这次想去哪几座城市？', actions: actions };
        }

        /* ---- 环线一键生成 ---- */
        if (/环线|自驾线|青甘|独库|川西|阿里|一号公路|南岛/.test(text)) {
            var loops = window.LOOP_ROUTES || [];
            var hitLoop = null;
            loops.forEach(function (l) {
                if (hitLoop) return;
                var short = l.name.replace(/（.*?）/g, '').replace(/大环线|环线|自驾|深度|经典/g, '');
                if (text.indexOf(l.name) >= 0 || (short && text.indexOf(short) >= 0)) hitLoop = l;
            });
            if (!hitLoop && /环线/.test(text)) {
                loops.forEach(function (l) {
                    if (hitLoop) return;
                    var short = l.name.replace(/（.*?）/g, '').replace(/大环线|环线|自驾|深度|经典/g, '');
                    if (short && short.length >= 2 && text.indexOf(short.slice(0, 2)) >= 0) hitLoop = l;
                });
            }
            /* 只说「给我生成环线」没说地名：直接按最热门的环线生成，不让用户再选一次 */
            if (!hitLoop && /(生成|来|推荐|规划|想要|走).*环线|环线.*(生成|推荐|来)/.test(text) &&
                cityListInText(text).length === 0) {
                hitLoop = loops[0];
            }
            if (hitLoop) {
                actions.push({ type: 'loadLoop', id: hitLoop.id });
                return {
                    reply: '给你生成「<b>' + esc(hitLoop.name) + '</b>」' + hitLoop.itinerary.length + ' 天环线，地图上已按顺序标好途经点。<br>' +
                        '接着可以让我：「住好点」「第三天别太赶」「推荐美食」「预算控制在 6000」，或者问我「西宁到敦煌怎么去」。',
                    actions: actions
                };
            }
            return {
                reply: '我手上现成的环线：<br>' + loops.map(function (l) {
                    return '· ' + esc(l.name) + '（' + l.itinerary.length + ' 天）';
                }).join('<br>') + '<br>说个名字我就生成；想去别的地方，也可以直接说「杭州+苏州 5 天」。',
                actions: actions
            };
        }

        /* ---- 城市介绍 / 有什么好玩 ---- */
        if (/(有什么|哪些|好玩|景点|介绍|值得去|怎么玩|攻略)/.test(text) && !/(酒店|住|吃|美食|餐厅)/.test(text)) {
            var csIntro = cityListInText(text);
            if (csIntro.length) {
                var cityI = csIntro[0], catI = CATALOG[cityI];
                if (catI) {
                    var topI = catI.items.slice().sort(function (a, b) {
                        return (prefScore(b) * 10 - b.idx) - (prefScore(a) * 10 - a.idx);
                    }).slice(0, 8);
                    var foodI = catI.items.filter(function (i) { return (i.cat || []).indexOf('food') >= 0; }).slice(0, 2);
                    var intro = '<b>' + esc(cityI) + '</b> 一共收录了 ' + catI.items.length + ' 个值得去的地方，先给你挑 8 个：<br>' +
                        topI.map(function (p) { return '· ' + esc(p.name); }).join('<br>');
                    if (foodI.length) intro += '<br>本地吃：' + foodI.map(function (f) { return esc(f.name); }).join('、');
                    intro += '<br>想直接排进行程，说「' + esc(cityI) + ' 玩 3 天」或「加上' + esc(topI[0] ? topI[0].name : cityI) + '」。';
                    return { reply: intro, actions: actions };
                }
            }
        }

        if (/加.*天|多.*天|延长|再多待/.test(text)) {
            actions.push({ type: 'setDays', days: state.days + (parseInt((text.match(/(\d+)\s*天/) || [])[1], 10) || 1) });
        } else if (/少.*天|减.*天|缩短|太长了/.test(text)) {
            actions.push({ type: 'setDays', days: Math.max(1, state.days - (parseInt((text.match(/(\d+)\s*天/) || [])[1], 10) || 1)) });
        }

        if (/太赶|太累|轻松|慢一点|悠闲|带娃|老人|休息/.test(text)) actions.push({ type: 'setPace', pace: 'relaxed' });
        else if (/紧凑|多逛|多去|充实|特种兵/.test(text)) actions.push({ type: 'setPace', pace: 'packed' });

        /* ---- 住宿档次 ---- */
        if (/(青旅|穷游|住便宜|经济型|省钱.*住|便宜.*酒店)/.test(text)) {
            actions.push({ type: 'setHotelTier', tier: 'budget' });
            return { reply: '好，住宿按经济型（青旅/快捷，约普通价的 55%）重算，还是给你携程实时房价链接。', actions: actions };
        }
        if (/(住好点|住好一点|高档|五星|奢华|升级.*酒店|住得舒服|度假酒店)/.test(text)) {
            actions.push({ type: 'setHotelTier', tier: 'luxury' });
            return { reply: '安排上，住宿升级到高档/五星档（约普通价的 2.1 倍），预算会明显上浮，要压总价随时说。', actions: actions };
        }

        /* ---- 城际交通偏好 ---- */
        if (/(坐高铁|高铁优先|不坐飞机|火车优先|动车优先)/.test(text)) {
            actions.push({ type: 'setTransport', value: 'train' });
            return { reply: '好，城际优先高铁（2200km 内都算高铁），已重新计时长和票价。', actions: actions };
        }
        if (/(坐飞机|飞机优先|航班优先|不坐高铁)/.test(text)) {
            actions.push({ type: 'setTransport', value: 'flight' });
            return { reply: '好，城际优先飞机（300km 以上都按航班算），已重新计时长和票价。', actions: actions };
        }

        /* ---- 预算上限 ---- */
        var bm = text.match(/(\d{3,6})/);
        if (bm && /(预算|人均|控制|不超过|以内|压到|降到|省到)/.test(text)) {
            actions.push({ type: 'setBudget', amount: parseInt(bm[1], 10) });
            return {
                reply: '收到，人均预算按 <b>¥' + num(parseInt(bm[1], 10)) + '</b> 控制。我会先降住宿档次，再挑掉贵的门票景点，最后给你算差多少。',
                actions: actions
            };
        }

        /* ---- 调整城市顺序 ---- */
        if (city && /(先去|第一站|从.+出发|先到|最后去)/.test(text) && selected.indexOf(city) >= 0) {
            actions.push({ type: 'startCity', city: city });
        }

        /* ---- 把某个景点挪到某天 ---- */
        if (poiAny && /(放|排|挪|调|改)/.test(text) && nDay) {
            actions.push({ type: 'movePoiTo', poi: poiAny.name, city: poiAny.city, day: nDay });
        }

        /* ---- 按偏好补景点 / 只要免费 / 换一批 ---- */
        var prefAdd = '';
        if (/(多|再加|来点|增加|加点)/.test(text)) {
            if (/(自然|风景|山水|海岛|户外|爬山)/.test(text)) prefAdd = 'nature';
            else if (/(人文|历史|古迹|博物馆|寺庙)/.test(text)) prefAdd = 'history';
            else if (/(美食|小吃|吃)/.test(text)) prefAdd = 'food';
            else if (/(亲子|孩子|小朋友|乐园|动物)/.test(text)) prefAdd = 'family';
            else if (/(出片|拍照|网红|打卡)/.test(text)) prefAdd = 'photo';
        }
        if (prefAdd) actions.push({ type: 'addByPref', pref: prefAdd });
        if (/(只要免费|全部免费|不要门票|免费景点|省门票)/.test(text)) actions.push({ type: 'dropPaid' });
        if (/(换一批|换几个|换些景点|重新挑|刷新景点|来点不一样的)/.test(text)) actions.push({ type: 'refreshPois' });

        /* ---- 签证 ---- */
        if (/(签证|护照|免签|落地签)/.test(text)) {
            return {
                reply: '签证这块站内有专门板块（首页菜单「签证服务」），常见情况：<br>' +
                    '· 日本/韩国/东南亚：材料简单，5-7 个工作日出签<br>' +
                    '· 申根/英国/美国：建议提前 1-2 个月预约，需流水与在职证明<br>' +
                    '· 迪拜/马尔代夫/泰国等：免签或落地签，带好往返机票和酒店单<br>' +
                    '点这里看 <a href="#visa">签证服务</a>，或直接问我某个国家的材料清单。',
                actions: actions
            };
        }

        /* ---- 最佳季节 ---- */
        if (/(几月|什么季节|天气|什么时候去|旺季|淡季)/.test(text)) {
            var cs0 = cityListInText(text);
            var pool = cs0.length ? cs0 : (selected.length ? selected : ['杭州']);
            var seasonTips = {
                '杭州': '3-5 月春暖、9-11 月桂花季最好',
                '北京': '4-5 月、9-10 月，避开 7-8 月高温',
                '西安': '3-5 月、9-11 月，夏天较晒',
                '成都': '3-6 月、9-11 月，夏天闷热',
                '厦门': '10-12 月、3-5 月，7-9 月台风多',
                '三亚': '10-3 月最佳，夏天太晒',
                '哈尔滨': '12-2 月冰雪，7-8 月避暑',
                '敦煌': '5-10 月，7-8 月最热但瓜果最甜',
                '拉萨': '5-10 月，冬天高反更明显',
                '香港': '10-12 月最舒服，夏天湿热多雨',
                '东京': '3-4 月樱花、10-11 月红叶',
                '巴黎': '4-6 月、9-10 月，8 月很多店休假',
                '伦敦': '5-9 月，其余月份多雨阴冷',
                '曼谷': '11-2 月凉季最佳，4-5 月最热',
                '巴厘岛': '4-10 月旱季最佳'
            };
            reply = '按城市给你说：<br>' + pool.map(function (c) {
                return '· <b>' + esc(c) + '</b>：' + esc(seasonTips[c] || '春秋两季（3-5 月、9-11 月）普遍最舒服');
            }).join('<br>') + '<br>想避开人流，尽量错开法定假日和暑期周末。';
            return { reply: reply, actions: actions };
        }

        /* ---- 玩几天合适 ---- */
        if (/(几天合适|玩几天|够不够|时间够|要几天)/.test(text)) {
            var cs1 = cityListInText(text);
            var pool1 = cs1.length ? cs1 : selected;
            if (!pool1.length) return { reply: '告诉我城市，我按「每城 2-3 天」帮你算需要几天。', actions: actions };
            var need = pool1.length * 2;
            reply = pool1.map(function (c) {
                var big = (CATALOG[c] && CATALOG[c].items.length >= 8);
                return '· <b>' + esc(c) + '</b>：' + (big ? '2-3 天' : '1-2 天') + '（' + (big ? '景点多，值得住两晚' : '核心点集中，一天也能走完') + '）';
            }).join('<br>') +
                '<br>合计建议 <b>' + need + '-' + (need + pool1.length) + ' 天</b>，现在设的是 ' + state.days + ' 天' +
                (state.days < need ? '，偏紧，我可以帮你加天数。' : '，节奏够用。');
            return { reply: reply, actions: actions };
        }

        /* ---- 指定两地：航班 / 高铁查询 ---- */
        if (/(怎么去|怎么到|坐什么|查.*(航班|机票|高铁|动车|车票|票))|((航班|机票|高铁|动车|火车).*(多少钱|价格|几小时))/.test(text)) {
            var cs2 = cityListInText(text);
            var from = cs2[0] || state.cities[0];
            var to = cs2[1] || (cs2.length ? null : state.cities[1]);
            if (!from || !to) {
                return { reply: '告诉我「从哪到哪」，比如「杭州到敦煌怎么去」，我给你高铁/航班的时长、价格和订票入口。', actions: actions };
            }
            var leg = intercity(from, to);
            var flyH = leg.km / 700 + 2.2, trainH = leg.km / 230 + 0.6;
            var flyC = Math.round(leg.km * 0.55 + 180), trainC = Math.round(leg.km * 0.46 + 15);
            var flyLink = 'https://flights.ctrip.com/online/list/oneway-' + encodeURIComponent(from) + '-' + encodeURIComponent(to);
            var trainLink = 'https://trains.ctrip.com/TrainBooking/SearchTrain.aspx?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
            reply = '<b>' + esc(from) + ' → ' + esc(to) + '</b>，约 ' + num(leg.km) + ' km：<br>' +
                '· ✈️ 飞机：约 ' + flyH.toFixed(1) + ' 小时（含往返机场），参考 ¥' + num(flyC) + ' · ' +
                '<a href="' + flyLink + '" target="_blank" rel="noopener">携程查航班 →</a><br>' +
                '· 🚄 高铁：约 ' + trainH.toFixed(1) + ' 小时，参考 ¥' + num(trainC) + ' · ' +
                '<a href="' + trainLink + '" target="_blank" rel="noopener">携程查高铁 →</a><br>' +
                (leg.km > 900 ? '距离较远，建议飞机，能省 4 小时以上。' : '距离不远，高铁更省心，市区到市区不用提前值机。');
            return {
                reply: reply, actions: actions,
                cards: [
                    {
                        type: 'flight', title: from + ' → ' + to + ' · 飞机',
                        meta: '约 ' + flyH.toFixed(1) + ' 小时（含往返机场）· 每日多班',
                        price: '¥' + num(flyC) + ' 起', link: flyLink, linkText: '携程查航班', apply: 'flight'
                    },
                    {
                        type: 'train', title: from + ' → ' + to + ' · 高铁',
                        meta: '约 ' + trainH.toFixed(1) + ' 小时 · 建议选上午班次',
                        price: '¥' + num(trainC) + ' 起', link: trainLink, linkText: '携程查高铁', apply: 'train'
                    }
                ]
            };
        }

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
            var hotelCards = [];
            reply = '给你按城市找了住宿建议：<br>' + cities.map(function (c) {
                var area = state.plan && state.plan.daysList.length
                    ? (function () {
                        var d = state.plan.daysList.filter(function (x) { return x.city === c; }).pop();
                        return d && d.pois.length ? d.pois[d.pois.length - 1].name + '附近' : '市中心商圈';
                    })() : '市中心商圈';
                var base = hotelPrice(c);
                hotelCards.push({
                    type: 'hotel',
                    title: c + ' · ' + (TIER1.indexOf(c) >= 0 ? '核心商圈' : '市中心'),
                    meta: area + ' · 经济 ¥' + Math.round(base * 0.55) + ' / 舒适 ¥' + base + ' / 高档 ¥' + Math.round(base * 2.1) + ' 每晚',
                    price: '¥' + Math.round(base * 0.55) + ' 起',
                    link: 'https://hotels.ctrip.com/hotels/list?keyword=' + encodeURIComponent(c),
                    linkText: '携程查酒店'
                });
                return '· <b>' + esc(c) + '</b>：' + esc(area) + '，参考 ¥' + base + '/晚 · ' +
                    '<a href="https://hotels.ctrip.com/hotels/list?keyword=' + encodeURIComponent(c) + '" target="_blank" rel="noopener">携程查酒店 →</a>';
            }).join('<br>') + '<br>旺季（节假日/暑期）建议提前 2-3 周订，可免费取消的房型更稳。';
            return { reply: reply, actions: actions, cards: hotelCards };
        }

        if (/吃|美食|小吃|餐厅/.test(text)) {
            var cs = cityListInText(text);
            if (!cs.length) cs = selected.length ? selected : [state.cities[0] || '杭州'];
            var foodCards = [];
            reply = '按城市给你标了几处吃的：<br>' + cs.map(function (c) {
                var cat = CATALOG[c];
                var foods = cat ? cat.items.filter(function (i) { return (i.cat || []).indexOf('food') >= 0; }).slice(0, 2) : [];
                foods.forEach(function (f) {
                    foodCards.push({
                        type: 'food',
                        title: c + ' · ' + f.name,
                        meta: FOOD_DESC[f.name] || ('本地人气店，人均 ¥40-80'),
                        price: '¥40-80/人',
                        link: ctripFood(c + ' ' + f.name),
                        linkText: '携程美食林'
                    });
                });
                return '· <b>' + esc(c) + '</b>：' + (foods.length ? foods.map(function (f) { return esc(f.name); }).join('、') : '本地老城区小吃街') + '（人均 ¥40-80）';
            }).join('<br>') + '<br>想吃特色菜可以直接问「六安吃什么」这种带城市名的问题。';
            return { reply: reply, actions: actions, cards: foodCards };
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
        var exitLoopTypes = {
            addCity: 1, removeCity: 1, addPoi: 1, removePoi: 1, replacePoi: 1, setDays: 1,
            startCity: 1, movePoiTo: 1, addByPref: 1, dropPaid: 1, refreshPois: 1, clear: 1
        };
        actions.forEach(function (a) {
            if (!a || !a.type) return;
            if (state.loop && exitLoopTypes[a.type] && a.type !== 'loadLoop') state.loop = null;
            switch (a.type) {
                case 'loadLoop': {
                    var lp = (window.LOOP_ROUTES || []).filter(function (x) { return x.id === a.id; })[0];
                    if (lp) {
                        state.loop = { id: lp.id, name: lp.name };
                        state.cities = [];
                        state.picks = {};
                        state.days = lp.itinerary.length;
                        notes.push('已生成「' + lp.name + '」' + lp.itinerary.length + ' 天环线');
                    }
                    break;
                }
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
                case 'setHotelTier':
                    state.hotelTier = a.tier === 'budget' ? 'budget' : (a.tier === 'luxury' ? 'luxury' : 'comfort');
                    notes.push(a.tier === 'budget' ? '住宿降到经济型' : (a.tier === 'luxury' ? '住宿升到高档/五星档' : '住宿回到舒适型'));
                    break;
                case 'setTransport':
                    state.transport = a.value === 'train' ? 'train' : (a.value === 'flight' ? 'flight' : 'auto');
                    notes.push(a.value === 'train' ? '城际优先高铁' : '城际优先飞机');
                    break;
                case 'setBudget':
                    state.budget = Math.max(0, +a.amount || 0);
                    if (state.budget && state.budget < 3000) {
                        state.hotelTier = 'budget';
                        notes.push('人均预算 ¥' + num(state.budget) + ' 偏紧，住宿已切到经济型');
                    } else if (state.budget) {
                        notes.push('人均预算锁定 ¥' + num(state.budget));
                    } else {
                        notes.push('已取消预算上限');
                    }
                    break;
                case 'startCity':
                    if (a.city && state.cities.indexOf(a.city) >= 0) {
                        state.cities = [a.city].concat(state.cities.filter(function (c) { return c !== a.city; }));
                        notes.push('行程改为从 ' + a.city + ' 开始');
                    }
                    break;
                case 'movePoiTo':
                    if (a.city && a.poi && state.picks[a.city]) {
                        var arr0 = state.picks[a.city];
                        var idx0 = arr0.indexOf(a.poi);
                        if (idx0 >= 0) {
                            arr0.splice(idx0, 1);
                            var target = Math.min(Math.max(0, (a.day - 1)), arr0.length);
                            arr0.splice(target, 0, a.poi);
                            notes.push('已把「' + a.poi + '」挪到 ' + a.city + ' 的第 ' + (target + 1) + ' 个景点位（决定它出现在第几天）');
                        }
                    }
                    break;
                case 'addByPref': {
                    var prefKey = a.pref;
                    var added = 0;
                    state.cities.forEach(function (c) {
                        if (!CATALOG[c]) return;
                        var cur = state.picks[c] || [];
                        var cand = CATALOG[c].items.filter(function (i) {
                            return cur.indexOf(i.name) < 0 && !i.generic && i.cat.indexOf(prefKey) >= 0;
                        }).sort(function (x, y) { return y.idx - x.idx; }).slice(0, 2);
                        cand.forEach(function (i) {
                            if (state.picks[c].length < 8) { state.picks[c].push(i.name); added++; }
                        });
                    });
                    notes.push(added ? '按偏好补了 ' + added + ' 个景点' : '这些城市暂时没有更多同类景点，可以换个偏好试试');
                    break;
                }
                case 'dropPaid': {
                    var dropped = 0;
                    state.cities.forEach(function (c) {
                        if (!CATALOG[c] || !state.picks[c]) return;
                        var keep = state.picks[c].filter(function (nm) {
                            var paid = ticketOf(nm) > 0;
                            if (paid && state.picks[c].length > 1) { dropped++; return false; }
                            return true;
                        });
                        state.picks[c] = keep;
                    });
                    notes.push(dropped ? '去掉了 ' + dropped + ' 个收费景点，只留免费/低价点' : '当前行程门票已经很少了');
                    break;
                }
                case 'refreshPois': {
                    var changed = 0;
                    state.cities.forEach(function (c) {
                        if (!CATALOG[c] || !state.picks[c]) return;
                        var cur = state.picks[c];
                        var alts = CATALOG[c].items.filter(function (i) {
                            return cur.indexOf(i.name) < 0 && !i.generic;
                        }).sort(function (x, y) { return (prefScore(y) * 10 - y.idx) - (prefScore(x) * 10 - x.idx); });
                        var n = Math.min(2, cur.length, alts.length);
                        for (var i = 0; i < n; i++) { cur[i] = alts[i].name; changed++; }
                    });
                    notes.push(changed ? '换了 ' + changed + ' 个景点，给行程换个口味' : '没有更多可替换的景点了');
                    break;
                }
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
            if (state.budget && state.plan) {
                var pp = Math.round(state.plan.totals.total / Math.max(1, state.plan.people));
                if (pp > state.budget && state.hotelTier !== 'budget') {
                    state.hotelTier = 'budget';
                    state.plan = buildPlan();
                    pp = Math.round(state.plan.totals.total / Math.max(1, state.plan.people));
                    notes.push('超预算了，住宿已自动降到经济型');
                }
                if (pp > state.budget) {
                    notes.push('当前人均约 ¥' + num(pp) + '，仍比预算高 ¥' + num(pp - state.budget) + '：可以少去一座城、或少 1-2 天');
                } else {
                    notes.push('预算内完成，当前人均约 ¥' + num(pp) + '（上限 ¥' + num(state.budget) + '）');
                }
            }
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
            '你是 MYL 旅行网站的 AI 行程助手，也是资深旅行规划师，中文回答。你什么旅行问题都能答：目的地推荐、签证、季节、交通、美食、预算、路线优化等。',
            '当前行程 JSON：' + JSON.stringify(compact || {}),
            '偏好：住宿=' + (state.hotelTier || 'comfort') + '，城际偏好=' + (state.transport || 'auto') + '，人均预算=' + (state.budget || '不限'),
            '可加入的候选景点（按城市）：' + JSON.stringify(candidates),
            '可选城市（全国及全球主要城市）：' + Object.keys(CATALOG).join('、'),
            '现成环线：' + (window.LOOP_ROUTES || []).map(function (l) { return l.id + '=' + l.name; }).join('；'),
            '用户可能只是提问（不必改行程），也可能要求生成/修改行程。请只输出一个 JSON 对象，不要 markdown 代码块。格式：',
            '{"reply":"给用户看的中文回复，可用<br>换行","actions":[],"cards":[{"type":"flight|train|hotel|food","title":"标题","meta":"说明","price":"¥xxx","link":"https://...","linkText":"携程查价"}]}',
            'actions 可选：addCity{city}、removeCity{city}、addPoi{city,poi}、removePoi{city,poi}、replacePoi{city,poi}、setDays{days}、setPace{pace:relaxed|normal|packed}、setHotelTier{tier:budget|comfort|luxury}、setTransport{value:auto|train|flight}、setBudget{amount}、startCity{city}、movePoiTo{city,poi,day}、addByPref{pref:nature|history|food|family|photo}、dropPaid、refreshPois、loadLoop{id}、clear。',
            '需要用户可以点选航班/高铁/酒店/美食时，用 cards 返回 2-6 张卡，链接使用携程搜索页。',
            '约束：城市最多 4 座；改行程时尽量只使用候选景点或可选城市中的名字；纯知识问答可直接回答，不要硬塞 action。回复要具体、像真人规划师。'
        ].join('\n');
    }

    function callAI(userText) {
        var cfg = state.aiCfg || {};
        var preset = AI_PRESETS[cfg.provider] || {};
        var endpoint = cfg.endpoint || preset.endpoint;
        var model = cfg.model || preset.model;
        if (!endpoint) throw new Error('未填写接口地址');
        var isSite = cfg.provider === 'site' || endpoint === '/api/chat';
        var headers = { 'Content-Type': 'application/json' };
        if (!isSite) headers['Authorization'] = 'Bearer ' + (cfg.key || '');
        return fetch(endpoint, {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin',
            body: JSON.stringify({
                model: model,
                provider: isSite ? 'auto' : undefined,
                temperature: 0.3,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    { role: 'user', content: userText }
                ]
            })
        }).then(function (r) {
            if (!r.ok) {
                return r.text().then(function (t) {
                    var msg = 'HTTP ' + r.status;
                    try { msg = (JSON.parse(t).error || msg); } catch (e2) {}
                    throw new Error(msg);
                });
            }
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
        var agEl = document.querySelector('.pl-agent');
        if (agEl && window.innerWidth <= 640) { agEl.classList.add('pl-agent-open'); document.body.classList.add('pl-agent-expanded'); }
        pushMsg('user', text);
        var input = $('plAgentInput');
        if (input) input.value = '';

        var cfg = state.aiCfg || {};
        var useAi = cfg.provider && cfg.provider !== 'builtin' &&
            (cfg.provider === 'site' || !!cfg.key) &&
            (cfg.endpoint || (AI_PRESETS[cfg.provider] || {}).endpoint);

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
                var aiCards = Array.isArray(res && res.cards) ? res.cards.slice(0, 8) : null;
                if (!reply) reply = '已按你的要求更新行程。';
                pushMsg('ai', reply + (changedAi ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(changedAi) + '</div>' : ''), null, aiCards);
            } catch (e) {
                state.msgs.pop();
                var fb = localReply(text);
                var ch = applyActions(fb.actions);
                pushMsg('ai', (fb.reply || '已按你的要求更新行程。') + (ch ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(ch) + '</div>' : '') +
                    '<div style="margin-top:6px;font-size:.74rem;color:#f59e0b">接口调用失败（' + esc(e.message) + '，可能是浏览器跨域限制），已改用内置引擎处理。</div>', null, fb.cards);
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
                pushMsg('ai', out, null, fb.cards);
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
                var hits = searchCities(q).slice(0, 12);
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

        // 景点搜索（跨城市，选中即上图）
        var poiInput = $('plPoiInput');
        var poiSug = $('plPoiSuggest');
        if (poiInput && poiSug) {
            var refreshPoi = function () {
                var q = poiInput.value.trim();
                if (!q) { poiSug.classList.remove('open'); return; }
                var hits = searchPois(q);
                poiSug.innerHTML = hits.length ? hits.map(function (h) {
                    return '<div class="pl-suggest-item" data-addpoi="' + esc(h.it.name) + '" data-city="' + esc(h.it.city) + '">' +
                        '<i class="fas fa-map-pin" style="color:#f59e0b"></i><b style="font-weight:600">' + esc(h.it.name) + '</b>' +
                        '<small>' + esc(h.it.city) + (h.on ? ' · 已选' : '') + '</small></div>';
                }).join('') : '<div class="pl-suggest-empty">没找到这个景点，换个关键词试试（如"西湖""莫高窟"）</div>';
                poiSug.classList.add('open');
            };
            poiInput.addEventListener('input', refreshPoi);
            poiInput.addEventListener('focus', refreshPoi);
            poiInput.addEventListener('keydown', function (e) {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                var first = poiSug.querySelector('[data-addpoi]');
                if (first) {
                    addPoiToPlan(first.getAttribute('data-city'), first.getAttribute('data-addpoi'));
                    poiInput.value = '';
                    poiSug.classList.remove('open');
                }
            });
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.pl-poi-search')) poiSug.classList.remove('open');
            });
            poiSug.addEventListener('click', function (e) {
                var it = e.target.closest('[data-addpoi]');
                if (!it) return;
                addPoiToPlan(it.getAttribute('data-city'), it.getAttribute('data-addpoi'));
                poiInput.value = '';
                poiSug.classList.remove('open');
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
            renderAll();
            syncPlan();
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
                syncPlan();
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
                syncPlan();
                saveLocal();
                return;
            }
            if (e.target.closest('[data-exitloop]')) {
                state.loop = null;
                state.plan = null;
                renderPoiZone();
                renderResult();
                saveLocal();
                toast('已退出环线，可以自己挑城市了');
            }
        });

        // 生成
        var gen = $('plGenerate');
        if (gen) gen.addEventListener('click', function () {
            if (!state.cities.length && !state.loop) { toast('先选一座城市吧'); return; }
            if (!state.picks || !Object.keys(state.picks).length) {
                state.cities.forEach(function (c) { state.picks[c] = autoPickCity(c, 3); });
            }
            state.plan = buildPlan();
            if (!state.plan) { toast('生成失败，请检查选择'); return; }
            renderResult();
            saveLocal();
            var card = $('plResultCard');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            pushMsg('ai', '行程已生成：<b>' + esc(state.plan.title || (state.plan.cities.join(' → ') + ' · ' + state.plan.days + ' 天')) +
                '</b>。想改哪里直接跟我说，比如「第三天太赶了」「住好点」「加一天」「推荐美食」。');
        });

        // 助手
        var send = $('plAgentSend');
        var input = $('plAgentInput');
        var agBody = $('plAgentBody');
        if (agBody) agBody.addEventListener('click', function (e) {
            var pickBtn = e.target.closest('[data-cardapply]');
            if (!pickBtn) return;
            var v = pickBtn.getAttribute('data-cardapply');
            if (v === 'flight' || v === 'train') {
                var n = applyActions([{ type: 'setTransport', value: v }]);
                pushMsg('ai', '已把城际交通设为<b>' + (v === 'train' ? '优先高铁' : '优先飞机') + '</b>，行程时长和花费已重算。' +
                    (n ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">' + esc(n) + '</div>' : ''));
            } else if (v === 'budget' || v === 'comfort' || v === 'luxury') {
                applyActions([{ type: 'setHotelTier', tier: v }]);
                pushMsg('ai', '住宿已切到<b>' + ({ budget: '经济型', comfort: '舒适型', luxury: '高档型' }[v]) + '</b>，预算已重算。点酒店卡去携程看实时房价。');
            }
        });
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
        if (gear && panel) gear.addEventListener('click', function () {
            if (window.innerWidth <= 640) {
                var ag = document.querySelector('.pl-agent');
                if (ag) { ag.classList.add('pl-agent-open'); document.body.classList.add('pl-agent-expanded'); }
            }
            panel.classList.toggle('open');
        });

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
            try { localStorage.setItem(LS_AI, JSON.stringify(state.aiCfg)); } catch (e) { }
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

    /* ---------- 跨城景点搜索：搜到即上图 ---------- */
    var POI_INDEX = null;
    function poiIndex() {
        if (POI_INDEX) return POI_INDEX;
        POI_INDEX = [];
        Object.keys(CATALOG).forEach(function (c) {
            CATALOG[c].items.forEach(function (it) {
                POI_INDEX.push({ city: c, name: it.name, prov: provShort(c) });
            });
        });
        return POI_INDEX;
    }
    function searchPois(q) {
        q = String(q || '').trim();
        if (!q) return [];
        var res = [];
        poiIndex().forEach(function (it) {
            var sc = -1;
            if (it.name === q) sc = 0;
            else if (it.name.indexOf(q) === 0) sc = 1;
            else if (it.city === q) sc = 2;
            else if (it.name.indexOf(q) >= 0) sc = 3;
            else if (it.city.indexOf(q) >= 0) sc = 4;
            else if (it.prov.indexOf(q) >= 0) sc = 5;
            if (sc < 0) return;
            res.push({
                it: it, sc: sc,
                on: (state.picks[it.city] || []).indexOf(it.name) >= 0
            });
        });
        res.sort(function (a, b) { return a.sc - b.sc || a.it.name.length - b.it.name.length; });
        return res.slice(0, 14);
    }
    function syncPlan() {
        var total = 0;
        state.cities.forEach(function (c) { total += (state.picks[c] || []).length; });
        state.plan = (state.cities.length && total) ? buildPlan() : null;
        renderResult();
    }
    function addPoiToPlan(city, poi) {
        if (!CATALOG[city]) return;
        if (state.cities.indexOf(city) < 0) {
            if (state.cities.length >= 4) { toast('最多同时安排 4 座城市，先移除一个再搜'); return; }
            state.cities.push(city);
            state.picks[city] = [];
            if (state.days < state.cities.length) state.days = state.cities.length;
        }
        var arr = state.picks[city] || (state.picks[city] = []);
        if (arr.indexOf(poi) >= 0) { toast(poi + ' 已经在行程里了'); return; }
        arr.push(poi);
        renderPoiZone();
        renderCityZone();
        syncPlan();
        saveLocal();
        toast('已加入「' + poi + '」· ' + city + '，地图已更新');
    }

    /* ---------- 城市搜索：全国 400+ 城 + 全球主要城市 ---------- */
    function searchCities(q) {
        q = String(q || '').trim();
        if (!q) return [];
        var res = [];
        Object.keys(CATALOG).forEach(function (c) {
            var prov = provShort(c);
            var sc = -1;
            if (c === q) sc = 0;
            else if (c.indexOf(q) === 0) sc = 1;
            else if (c.indexOf(q) > 0) sc = 2;
            else if (prov === q) sc = 3;
            else if (prov.indexOf(q) >= 0) sc = 4;
            if (sc >= 0) res.push({ c: c, sc: sc, ov: !!(CATALOG[c] && CATALOG[c].overseas) });
        });
        res.sort(function (a, b) { return a.sc - b.sc || a.c.length - b.c.length; });
        return res.map(function (x) { return x.c; });
    }

    function updateAgentStatus() {
        var el = $('plAgentStatus');
        if (!el) return;
        var cfg = state.aiCfg || {};
        if (cfg.provider === 'site') {
            el.textContent = state.siteAiReady ? '站点 AI · 豆包 / DeepSeek 已接入' : '站点 AI · 待管理员配置 Key';
        } else if (cfg.provider && cfg.provider !== 'builtin') {
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
            '      <div class="pl-card-head"><span class="pl-step">2</span><div><h3>挑景点 · 生成线路</h3><p>直接搜景点就行（跨城市也可以），选中即上图；也可在下面按城市勾</p></div><div class="pl-poi-actions"><span class="pl-poi-count" id="plPoiCount">已选 0 个景点</span></div></div>',
            '      <div class="pl-city-search pl-poi-search"><i class="fas fa-magnifying-glass"></i><input id="plPoiInput" type="text" placeholder="搜景点，如：西湖、莫高窟、迪士尼、兵马俑…" autocomplete="off"><div class="pl-suggest" id="plPoiSuggest"></div></div>',
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
            '    <div class="pl-agent-input"><textarea id="plAgentInput" rows="1" placeholder="想怎么改？例如：帮我生成川西环线"></textarea><button id="plAgentSend" aria-label="发送"><i class="fas fa-paper-plane"></i></button></div>',
            '    <div class="pl-ai-panel" id="plAiPanel">',
            '      <h4>接入大模型</h4>',
            '      <p class="hint">站点已内置 AI 代理：管理员在 Vercel 环境变量配置 DEEPSEEK_API_KEY 或 ARK_API_KEY 后，所有访客无需填 Key 即可使用豆包 / DeepSeek。也可以填自己的 Key（只存本机浏览器）。</p>',
            '      <div class="pl-ai-field"><label>服务商</label><select id="plAiProvider">',
            '        <option value="site">站点 AI（豆包 / DeepSeek，无需填 Key）</option>',
            '        <option value="builtin">内置规划引擎（无需配置）</option>',
            '        <option value="doubao">豆包 · 火山方舟（自己的 Key）</option>',
            '        <option value="deepseek">DeepSeek（自己的 Key）</option>',
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
            pushMsg('ai', '你好，我是 AI 行程助手 👋<br>· 想省事：直接说「给我生成环线」「青甘大环线」「川西环线」，我一次排好<br>· 想自定义：选城市、搜景点勾选，点「生成我的行程」<br>· 排好后我会顺手挑好<b>航班 / 高铁 / 酒店 / 美食</b>，点卡片直接去携程比价<br>· 之后随时改：「住好点」「第三天太赶了」「加一天」「预算 6000」「找美食」');
        }
        /* 手机端：助手做成底部抽屉，点标题展开/收起 */
        var agentEl = document.querySelector('.pl-agent');
        var agentHead = agentEl && agentEl.querySelector('.pl-agent-head');
        if (agentHead) agentHead.addEventListener('click', function (e) {
            if (window.innerWidth > 640) return;
            if (e.target.closest('button')) return;
            agentEl.classList.toggle('pl-agent-open');
            document.body.classList.toggle('pl-agent-expanded', agentEl.classList.contains('pl-agent-open'));
        });
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
        CITY_PROV = buildProvMap();
        CATALOG = buildCatalog();
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
        searchCities: searchCities,
        searchPois: searchPois,
            autoPickCity: autoPickCity,
            ticketOf: ticketOf
        }
    };
})();
