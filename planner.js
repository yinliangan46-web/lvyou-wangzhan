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
        doubao: { label: '豆包 · 火山方舟（直连，填自己的 Key）', endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', model: 'doubao-seed-2-1-lite-260915' },
        deepseek: { label: 'DeepSeek（填自己的 Key）', endpoint: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', needsCORSProxy: true },
        kimi: { label: 'Kimi · 月之暗面（填自己的 Key）', endpoint: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k', needsCORSProxy: true },
        glm: { label: '智谱 GLM（填自己的 Key）', endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash', needsCORSProxy: true },
        ollama: { label: '本地 Ollama 开源大模型（无需 Key）', endpoint: 'http://localhost:11434/v1/chat/completions', model: 'qwen2.5:7b', needsCORSProxy: true },
        proxy: { label: '站点云端 AI（Worker 代理 · 豆包）', endpoint: '', model: '', isProxy: true, target: 'https://ark.cn-beijing.volces.com/api/v3' },
        custom: { label: '自定义 OpenAI 兼容接口 / 代理', endpoint: '', model: '' }
    };

    // 站点默认 AI：直连火山方舟（该接口支持浏览器 CORS，国内网络可直连，不需要 Worker 代理）
    // API Key 不入库（公开仓库会泄露）：用户在本机 ⚙️ 填一次即可，只存 localStorage
    var ARK_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
    var ARK_MODEL = 'doubao-seed-2-1-lite-260915';
    var DEFAULT_AI_CFG = {
        provider: 'doubao',
        endpoint: ARK_ENDPOINT,
        model: ARK_MODEL,
        key: ''
    };

    var TIER1 = ['北京', '上海', '广州', '深圳'];
    var TIER2 = ['杭州', '成都', '重庆', '西安', '南京', '苏州', '武汉', '长沙', '天津', '青岛',
        '厦门', '郑州', '昆明', '大连', '宁波', '合肥', '福州', '济南', '沈阳', '无锡',
        '佛山', '东莞', '珠海', '三亚'];

    /* 门票估算（按名称子串匹配，取最长命中） */
    var TICKETS = {
        '故宫': 60, '八达岭长城': 40, '颐和园': 30, '天坛': 15, '圆明园': 10, '鸟巢': 50,
        '总统府': 40, '明孝陵': 70, '牛首山': 98, '大报恩寺': 90,
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
        '白堤', '苏堤', '中山陵', '夫子庙', '玄武湖', '雨花台', '老门东', '金鸡湖',
        '同里古镇', '山塘街', '西湖文化广场', '黄浦江', '南京路', '王府井', '三里屯', '南长街',
        /* 免费开放的博物馆/纪念馆（多数需预约但不收门票） */
        '南京博物院', '上海博物馆', '国家博物馆', '中国国家博物馆', '陕西历史博物馆', '湖北省博物馆',
        '苏州博物馆', '首都博物馆', '湖南博物院', '河南博物院', '浙江省博物馆', '广东省博物馆',
        '四川博物院', '三峡博物馆', '天津博物馆', '河北博物院', '山西博物院', '辽宁省博物馆',
        '安徽省博物院', '安徽博物院', '福建博物院', '江西省博物馆', '贵州省博物馆', '云南省博物馆',
        '甘肃省博物馆', '青海省博物馆', '宁夏博物馆', '新疆博物馆', '西藏博物馆', '中国美术馆',
        '南京大屠杀', '侵华日军', '南京长江大桥', '天安门广场', '五四广场', '奥林匹克公园'];

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

    /* 各城市代表美食，用于每日「吃」板块 */
    var CITY_FOOD = {
        '北京': ['北京烤鸭', '炸酱面', '铜锅涮肉', '卤煮火烧', '豆汁焦圈', '宫廷奶酪'],
        '上海': ['生煎', '南翔小笼', '本帮红烧肉', '葱油拌面', '排骨年糕', '蟹壳黄'],
        '天津': ['狗不理包子', '煎饼果子', '耳朵眼炸糕', '锅巴菜', '十八街麻花', '嘎巴菜'],
        '重庆': ['重庆火锅', '重庆小面', '毛血旺', '酸辣粉', '豆花饭', '山城汤圆'],
        '哈尔滨': ['锅包肉', '哈尔滨红肠', '马迭尔冰棍', '杀猪菜', '大列巴', '烤冷面'],
        '长春': ['锅包肉', '朝鲜冷面', '东北烤串', '雪衣豆沙', '鸡汤豆腐串', '鼎丰真糕点'],
        '沈阳': ['老边饺子', '李连贵熏肉大饼', '沈阳鸡架', '西塔冷面', '马家烧麦', '雪绵豆沙'],
        '大连': ['海鲜焖子', '铁板鱿鱼', '咸鱼饼子', '海肠捞饭', '烤扇贝', '蚬子面'],
        '呼和浩特': ['手把肉', '烧麦', '莜面', '羊杂碎', '奶茶', '焙子'],
        '石家庄': ['驴肉火烧', '牛肉罩饼', '缸炉烧饼', '正定八大碗', '崩肝', '熏肉'],
        '太原': ['刀削面', '莜面栲栳栳', '过油肉', '头脑', '剔尖', '碗托'],
        '济南': ['把子肉', '甜沫', '油旋', '九转大肠', '糖醋鲤鱼', '甏肉干饭'],
        '青岛': ['辣炒蛤蜊', '鲅鱼水饺', '海菜凉粉', '排骨米饭', '流亭猪蹄', '青岛啤酒'],
        '郑州': ['烩面', '胡辣汤', '灌汤包', '葛记焖饼', '烩羊肉', '炒凉粉'],
        '西安': ['肉夹馍', '羊肉泡馍', '凉皮', 'biangbiang面', '葫芦头', '甑糕'],
        '兰州': ['兰州牛肉面', '酿皮', '灰豆子', '甜醅子', '手抓羊肉', '牛奶鸡蛋醪糟'],
        '西宁': ['手抓羊肉', '酿皮', '青海酸奶', '尕面片', '羊肠面', '甜醅'],
        '银川': ['手抓羊肉', '羊杂碎', '辣糊糊', '蒿子面', '烩小吃', '羊肉臊子面'],
        '乌鲁木齐': ['大盘鸡', '烤包子', '手抓饭', '馕', '羊肉串', '拉条子'],
        '拉萨': ['藏面', '甜茶', '牦牛肉', '酥油茶', '糌粑', '藏式火锅'],
        '成都': ['四川火锅', '串串香', '担担面', '龙抄手', '钟水饺', '甜水面'],
        '昆明': ['过桥米线', '汽锅鸡', '烧饵块', '鲜花饼', '小锅米线', '炸洋芋'],
        '贵阳': ['丝娃娃', '肠旺面', '酸汤鱼', '恋爱豆腐果', '牛肉粉', '烙锅'],
        '南宁': ['老友粉', '柠檬鸭', '卷筒粉', '酸嘢', '粉饺', '螺蛳粉'],
        '桂林': ['桂林米粉', '阳朔啤酒鱼', '田螺酿', '荔浦芋扣肉', '油茶', '马蹄糕'],
        '海口': ['海南粉', '清补凉', '椰子饭', '文昌鸡', '老爸茶', '海鲜'],
        '三亚': ['椰子鸡', '清补凉', '文昌鸡', '和乐蟹', '抱罗粉', '海鲜烧烤'],
        '广州': ['早茶虾饺', '烧鹅', '肠粉', '云吞面', '煲仔饭', '双皮奶'],
        '深圳': ['光明乳鸽', '沙井蚝', '潮汕牛肉火锅', '椰子鸡', '肠粉', '糖水'],
        '珠海': ['横琴蚝', '斗门重壳蟹', '白蕉海鲈', '艇仔粥', '虾饺', '双皮奶'],
        '厦门': ['沙茶面', '海蛎煎', '土笋冻', '花生汤', '烧肉粽', '姜母鸭'],
        '福州': ['佛跳墙', '福州鱼丸', '锅边糊', '荔枝肉', '肉燕', '芋泥'],
        '南昌': ['瓦罐汤', '南昌拌粉', '藜蒿炒腊肉', '白糖糕', '炒粉', '糊羹'],
        '长沙': ['臭豆腐', '口味虾', '糖油粑粑', '剁椒鱼头', '长沙米粉', '茶颜悦色'],
        '武汉': ['热干面', '三鲜豆皮', '鸭脖', '糊汤粉', '面窝', '排骨藕汤'],
        '合肥': ['庐州烤鸭', '李鸿章大杂烩', '包公鱼', '三河米饺', '鸭油烧饼', '吴山贡鹅'],
        '黄山': ['臭鳜鱼', '毛豆腐', '黄山烧饼', '刀板香', '石耳炖鸡', '问政山笋'],
        '南京': ['盐水鸭', '鸭血粉丝汤', '牛肉锅贴', '皮肚面', '梅花糕', '小笼包'],
        '苏州': ['松鼠桂鱼', '响油鳝糊', '苏式汤面', '生煎', '酒酿饼', '蟹壳黄'],
        '无锡': ['无锡排骨', '小笼馒头', '油面筋塞肉', '玉兰饼', '银丝面', '梁溪脆鳝'],
        '常州': ['银丝面', '天目湖鱼头', '大麻糕'],
        '扬州': ['扬州炒饭', '蟹粉狮子头', '大煮干丝', '三丁包', '文思豆腐', '翡翠烧卖'],
        '徐州': ['地锅鸡', '把子肉', '烙馍'],
        '杭州': ['西湖醋鱼', '东坡肉', '片儿川', '龙井虾仁', '定胜糕', '葱包桧'],
        '宁波': ['宁波汤圆', '红膏炝蟹', '雪菜大黄鱼', '油赞子', '年糕', '苔菜小方烤'],
        '温州': ['温州鱼丸', '糯米饭', '灯盏糕', '江蟹生', '瘦肉丸', '猪脏粉'],
        '绍兴': ['绍兴臭豆腐', '梅干菜扣肉', '茴香豆', '酱鸭', '糟鸡', '黄酒'],
        '嘉兴': ['粽子', '南湖菱', '糟蛋'],
        '湖州': ['千张包子', '太湖蟹', '安吉白茶'],
        '舟山': ['海鲜面', '沈家门海鲜', '呛蟹'],
        '金华': ['金华火腿', '酥饼', '东河肉饼'],
        '台州': ['食饼筒', '姜汤面', '三门青蟹'],
        '丽水': ['缙云烧饼', '敲肉羹', '山粉饺'],
        '衢州': ['三头一掌', '麻饼', '龙游发糕'],
        '泉州': ['面线糊', '土笋冻', '姜母鸭', '润饼', '牛肉羹', '石花膏'],
        '洛阳': ['洛阳水席', '牛肉汤', '不翻汤', '浆面条', '牡丹燕菜', '锅贴'],
        '开封': ['灌汤包', '鲤鱼焙面', '羊肉炕馍'],
        '大同': ['刀削面', '羊杂', '浑源凉粉'],
        '晋中': ['平遥牛肉', '莜面栲栳栳', '碗托'],
        '敦煌': ['驴肉黄面', '杏皮水', '羊肉粉汤', '胡羊焖饼', '沙葱牛肉饼', '泡儿油糕'],
        '张掖': ['搓鱼子', '羊肉粉汤', '炒炮'],
        '嘉峪关': ['烤羊肉', '糊锅', '粉皮'],
        '喀什': ['烤全羊', '抓饭', '馕'],
        '伊宁': ['烤包子', '手抓饭', '马肠子'],
        '大理': ['乳扇', '酸辣鱼', '喜洲粑粑', '烤饵块', '白族三道茶', '凉鸡米线'],
        '丽江': ['腊排骨火锅', '鸡豆凉粉', '丽江粑粑', '纳西烤鱼', '米灌肠', '酥油茶'],
        '香格里拉': ['牦牛火锅', '酥油茶', '青稞饼'],
        '遵义': ['羊肉粉', '豆花面', '折耳根炒腊肉'],
        '唐山': ['麻糖', '棋子烧饼', '万里香烧鸡'],
        '承德': ['鲜花玫瑰饼', '碗坨', '羊汤'],
        '秦皇岛': ['四条包子', '皮皮虾', '回记绿豆糕'],
        '汕头': ['牛肉火锅', '牛肉丸', '蚝烙', '粿条汤', '卤鹅', '甘草水果'],
        '潮州': ['潮州牛肉丸', '卤鹅', '蚝烙', '砂锅粥', '春卷', '鸭母捻'],
        '张家界': ['土家三下锅', '土家腊肉', '酸鱼', '葛根粉', '社饭', '血豆腐'],
        '保定': ['驴肉火烧', '牛肉罩饼', '白运章包子', '锅贴饼子', '熏肉', '糖葫芦']
    };

    var FOOD_GENERIC = ['老字号早点', '本地人常去的苍蝇馆子', '老城夜市小吃街', '人气商圈餐厅', '当地招牌农家菜', '特色面馆'];
    /* 每天从美食池轮换，避免多天推荐重复 */
    function foodsFor(city) {
        var arr = CITY_FOOD[city];
        if (arr && arr.length) return arr;
        var cat = CATALOG[city];
        var picks = cat ? cat.items.filter(function (i) { return (i.cat || []).indexOf('food') >= 0; }).map(function (i) { return i.name; }) : [];
        return picks.concat(FOOD_GENERIC.map(function (g) { return city + g; }));
    }
    function pickFood(city, dayIdx, n) {
        var arr = foodsFor(city);
        var out = [];
        for (var i = 0; i < (n || 1); i++) out.push(arr[(((dayIdx || 0) * 2 + i) % arr.length + arr.length) % arr.length]);
        return out;
    }


    /* 需要实名/提前预约的热门景区（命中即提示） */
    var RESERVE_POIS = ['故宫', '莫高窟', '布达拉宫', '九寨沟', '兵马俑', '秦始皇', '泰山', '黄山',
        '张家界', '迪士尼', '环球影城', '长白山', '敦煌', '龙门石窟', '云冈石窟', '乐山大佛',
        '都江堰', '峨眉山', '华山', '普陀山', '灵隐寺', '拙政园', '上海博物馆', '国家博物馆',
        '陕西历史博物馆', '南京博物院', '湖北省博物馆', '苏州博物馆', '三星堆',
        '湖南省博物馆', '湖南博物院', '河南博物院', '浙江省博物馆', '广东省博物馆', '四川博物院',
        '三峡博物馆', '天津博物馆', '河北博物院', '山西博物院', '辽宁省博物馆', '安徽博物院',
        '福建博物院', '江西省博物馆', '云南省博物馆', '甘肃省博物馆', '青海省博物馆',
        '宁夏博物馆', '西藏博物馆', '新疆博物馆', '首都博物馆', '中国美术馆', '南京大屠杀',
        '大运河博物馆', '金沙遗址', '六朝博物馆', '扬州博物馆',
        '中山陵', '明孝陵', '天安门广场', '毛主席纪念堂', '人民大会堂', '国家大剧院'];

    function cityFoods(city) {
        return CITY_FOOD[city] || ['本地老字号小吃', '当地招牌菜', '夜市小吃街'];
    }

    function needReserve(name) {
        for (var i = 0; i < RESERVE_POIS.length; i++) {
            if (name.indexOf(RESERVE_POIS[i]) >= 0) return true;
        }
        return false;
    }

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
                if (c && distKm(c, center) > 600) c = null;   // 超过 600km 视为脏数据；敦煌/羌塘等远景点保留
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
        var n = String(name || '');
        for (var i = 0; i < FREE_POI.length; i++) {
            if (n.indexOf(FREE_POI[i]) >= 0) return 0;
        }
        /* 博物馆/博物院/纪念馆/公园/街区类默认免费开放 */
        if (/博物馆|博物院|纪念馆|美术馆|公园|广场|步行街|老街|古街|小吃街|夜市|码头|观景台$/.test(n)) return 0;
        var best = -1, price = 60;
        Object.keys(TICKETS).forEach(function (k) {
            if (n.indexOf(k) >= 0 && k.length > best) { best = k.length; price = TICKETS[k]; }
        });
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
                    if (i === 0) blocks.push({ time: '12:30', type: 'meal', title: '午餐 · ' + lunchName(city, dayNo) });
                });
                blocks.push({ time: '18:30', type: 'meal', title: '晚餐 · ' + dinnerName(city, dayNo) });
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
                        { time: '18:30', type: 'meal', title: '晚餐 · ' + dinnerName(city, dayNo) },
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

    function lunchName(city, dayIdx) {
        return pickFood(city, (dayIdx || 0) * 2, 2).join('、') + ' · 人均 ¥45-70';
    }
    function dinnerName(city, dayIdx) {
        return pickFood(city, (dayIdx || 0) * 2 + 1, 2).join('、') + ' · 人均 ¥60-100';
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
            if (b.type === 'poi') {
                var kw = encodeURIComponent(b.title);
                if (needReserve(b.title) && window._wechatReserveBtn) {
                    /* 需预约：只给微信小程序入口，不再给携程/抖音 */
                    link += ' ' + window._wechatReserveBtn(b.title);
                } else {
                    link += ' <a href="https://you.ctrip.com/searchsite/scenic/?query=' + kw + '" target="_blank" rel="noopener" ' +
                        'style="display:inline-block;margin-left:6px;padding:1px 7px;border-radius:9px;background:#eef4ff;color:#2563eb;font-size:.72rem;text-decoration:none">携程购票</a>' +
                        ' <a href="https://www.douyin.com/search/' + kw + encodeURIComponent(' 门票') + '" target="_blank" rel="noopener" ' +
                        'style="display:inline-block;margin-left:4px;padding:1px 7px;border-radius:9px;background:#fff0f6;color:#fe2c55;font-size:.72rem;text-decoration:none">抖音看票</a>';
                }
            }
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

        var extraHtml = dayExtraHtml(d);

        return '<div class="pl-day">' +
            '<div class="pl-day-head"><span class="pl-day-badge" style="background:' + color + '">Day ' + d.dayNo + '</span>' +
            '<span class="pl-day-city">' + esc(d.city) + '</span>' +
            '<span class="pl-day-theme">' + esc(d.theme) + '</span>' +
            '<span class="pl-day-meta"><span><i class="fas fa-route"></i> ' + d.km + ' km</span>' +
            '<span><i class="fas fa-ticket"></i> ¥' + d.ticket + '</span></span></div>' +
            legHtml + '<div class="pl-timeline">' + blocks + '</div>' + extraHtml + '</div>';
    }

    /* 每日配套：门票预约 / 当地美食 / 道路交通 */
    function dayExtraHtml(d) {
        var pois = (d.blocks || []).filter(function (b) { return b.type === 'poi'; });

        var ticketRows = pois.map(function (b) {
            var kw = encodeURIComponent(b.title);
            var wx = window._wechatReserveBtn ? window._wechatReserveBtn(b.title) : '';
            /* 需预约的只给微信入口，不再给携程/抖音 */
            var free = ticketOf(b.title) <= 0 && !needReserve(b.title);
            var buy = (free || wx) ? '' :
                '<a href="https://you.ctrip.com/searchsite/scenic/?query=' + kw + '" target="_blank" rel="noopener">携程票</a>' +
                '<a href="https://www.douyin.com/search/' + kw + encodeURIComponent(' 门票') + '" target="_blank" rel="noopener">抖音票</a>';
            return '<div class="pl-ex-row"><span class="pl-ex-name">' + esc(b.title) +
                (ticketOf(b.title) > 0 ? '<em class="pl-ex-fee">¥' + ticketOf(b.title) + '</em>' : '<em class="pl-ex-free">免费</em>') +
                (needReserve(b.title) ? '<em class="pl-ex-tag">需预约</em>' : '') + '</span>' +
                buy + wx + '</div>';
        }).join('');

        var reserveTips = pois.filter(function (b) { return needReserve(b.title); }).map(function (b) { return b.title; });
        var ticketNote = reserveTips.length
            ? '<div class="pl-ex-note">⚠ ' + esc(reserveTips.slice(0, 3).join('、')) + ' 需实名预约，建议出行前 1-3 天在景区微信小程序或携程预约时段。</div>'
            : '<div class="pl-ex-note">热门景区旺季可能限流，建议出发前在携程或景区公众号确认余票。</div>';

        var cityKw = encodeURIComponent(d.city);
        var foodChips = cityFoods(d.city).map(function (f) {
            return '<a class="pl-ex-chip" href="https://www.dianping.com/search/keyword/0/0_' + encodeURIComponent(d.city + f) +
                '" target="_blank" rel="noopener">' + esc(f) + '</a>';
        }).join('');

        var km = d.km || 0;
        var taxi = Math.round(km * 2.4 + 12);
        var roadText = '市内移动约 ' + km + ' km，打车约 ¥' + taxi + '；景区之间建议网约车或景区直通车。' +
            (d.cityChange ? '城际段见上方「' + esc(d.cityChange.from) + ' → ' + esc(d.cityChange.to) + '」，建议提前 1-3 天订票。' : '') +
            '节假日高峰请预留 30-60 分钟堵车时间。';

        return '<div class="pl-extra">' +
            '<div class="pl-ex-col"><div class="pl-ex-h"><i class="fas fa-ticket"></i> 门票 · 预约</div>' +
            (ticketRows || '<div class="pl-ex-note">今日以免费景点为主，无需购票。</div>') + ticketNote + '</div>' +
            '<div class="pl-ex-col"><div class="pl-ex-h"><i class="fas fa-utensils"></i> 当地美食</div>' +
            '<div class="pl-ex-chips">' + foodChips + '</div>' +
            '<div class="pl-ex-note">点菜名看附近餐厅：<a href="https://www.dianping.com/search/keyword/0/0_' + cityKw +
            encodeURIComponent('美食') + '" target="_blank" rel="noopener">大众点评</a> · ' +
            '<a href="https://www.douyin.com/search/' + cityKw + encodeURIComponent(' 美食 探店') +
            '" target="_blank" rel="noopener">抖音探店</a></div></div>' +
            '<div class="pl-ex-col"><div class="pl-ex-h"><i class="fas fa-car"></i> 道路交通</div>' +
            '<div class="pl-ex-note" style="margin-top:2px">' + roadText + '</div></div>' +
            '</div>';
    }

    /* ==================== 地图 ==================== */
    function drawMap(plan) {
        var el = $('plMap');
        if (!el || !window.L) return;
        if (state.map) { try { state.map.remove(); } catch (e) { } state.map = null; }
        var map = L.map(el, { scrollWheelZoom: false, zoomControl: true });
        state.map = map;
        // 行程包含境外城市时高德底图无境外细节（会是一片空白），改用 OSM 全球底图
        var hasAbroad = false;
        plan.daysList.forEach(function (d) {
            (d.pois || []).forEach(function (p) {
                if (p.lng < 72 || p.lng > 137.9 || p.lat < 0.5 || p.lat > 55.5) hasAbroad = true;
            });
        });
        if (hasAbroad) {
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                { maxZoom: 19, minZoom: 2, attribution: '&copy; OpenStreetMap' }).addTo(map);
        } else {
            L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                { subdomains: ['1', '2', '3', '4'], maxZoom: 18, minZoom: 3, attribution: '&copy; 高德地图' }).addTo(map);
        }

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
            var pois = d.blocks.filter(function (b) { return b.type === 'poi'; });
            var needR = pois.filter(function (b) { return needReserve(b.title); }).map(function (b) { return b.title; });
            if (pois.length) lines.push('  门票：' + pois.map(function (b) { return b.title; }).join('、') + '（携程/抖音可查票）');
            if (needR.length) lines.push('  预约：' + needR.join('、') + ' 需实名预约，提前 1-3 天在景区公众号或携程预约');
            lines.push('  美食：' + cityFoods(d.city).join('、'));
            lines.push('  交通：市内约 ' + d.km + ' km，打车约 ¥' + Math.round((d.km || 0) * 2.4 + 12));
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
        var def = {
            provider: DEFAULT_AI_CFG.provider,
            endpoint: DEFAULT_AI_CFG.endpoint,
            model: DEFAULT_AI_CFG.model,
            target: DEFAULT_AI_CFG.target,
            key: DEFAULT_AI_CFG.key
        };
        try {
            raw = localStorage.getItem(LS_AI);
            state.aiCfg = raw ? JSON.parse(raw) : def;
        } catch (e) {
            state.aiCfg = def;
        }
        // 旧配置迁移：Ollama(localhost) / Worker(workers.dev) 在手机上都连不通，自动切到火山方舟直连
        if (state.aiCfg && (state.aiCfg.provider === 'ollama' || state.aiCfg.provider === 'proxy')) {
            state.aiCfg = { provider: 'doubao', endpoint: ARK_ENDPOINT, model: ARK_MODEL, key: state.aiCfg.key || '' };
        }
        if (state.aiCfg && state.aiCfg.provider === 'doubao') {
            if (!state.aiCfg.endpoint || state.aiCfg.endpoint.indexOf('workers.dev') >= 0) state.aiCfg.endpoint = ARK_ENDPOINT;
            if (!state.aiCfg.model || state.aiCfg.model === 'doubao-seed-1-6-250615') state.aiCfg.model = ARK_MODEL;
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
        if (!state.cities.length && !state.loop) { toast('先选一个城市，再生成行程'); return; }
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

    function tripDraftHtml(d) {
        if (!d) return '';
        var cs = (d.cities || []).join('|');
        var dy = parseInt(d.days, 10) || 1;
        return '<div style="margin-top:9px;display:flex;gap:8px;flex-wrap:wrap">' +
            '<button class="pl-btn-primary pl-trip-confirm" data-cities="' + esc(cs) + '" data-days="' + dy + '">✅ 确认生成行程</button>' +
            '<button class="pl-btn-ghost pl-trip-cancel">先不生成</button></div>';
    }

    function renderMsgs() {
        var body = $('plAgentBody');
        if (!body) return;
        body.innerHTML = state.msgs.map(function (m) {
            if (m.role === 'user') {
                return '<div class="pl-msg user"><div class="bubble">' + esc(m.text) + '</div></div>';
            }
            return '<div class="pl-msg' + (m.typing ? ' typing' : '') + '"><div class="who">AI</div><div class="bubble">' + m.text + cardsHtml(m.cards) + tripDraftHtml(m.extra) + '</div></div>';
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

    /* ---------- 一日游 / N 日游 意图解析 ---------- */
    var CN_NUM = { '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
    // 从全国省市库里找句子里提到的省
    function provinceInText(text) {
        var names = {};
        Object.keys(CITY_PROV).forEach(function (c) { if (CITY_PROV[c]) names[CITY_PROV[c]] = 1; });
        var hit = null;
        Object.keys(names).forEach(function (full) {
            var short = full.replace(/省$|市$|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '');
            if (short && text.indexOf(short) >= 0) hit = full;
        });
        return hit;
    }
    // 少数知名城市/景区不在省级地级市清单里，手工补上省份归属
    var PROV_EXTRA = {
        '大理': '云南省', '西双版纳': '云南省', '敦煌': '甘肃省',
        '黄果树': '贵州省', '九寨沟': '四川省',
        '北京': '北京市', '上海': '上海市', '重庆': '重庆市'
    };
    // 该省的城市，优先"有真实景点数据"的，其次地级市兜底
    function citiesOfProvince(full) {
        var p = (window.PROVINCES_ALL || []).filter(function (x) { return x.name === full; })[0];
        var out = [];
        if (p) {
            (p.cities || []).forEach(function (pc) {
                var n = pc.name || '';
                var hit = Object.keys(CATALOG).filter(function (c) {
                    return c === n || (CITY_PROV[c] === full && n.indexOf(c) === 0);
                })[0];
                if (hit && out.indexOf(hit) < 0) out.push(hit);
            });
        }
        Object.keys(PROV_EXTRA).forEach(function (c) {
            if (PROV_EXTRA[c] === full && CATALOG[c] && out.indexOf(c) < 0) out.push(c);
        });
        return out;
    }
    function provTopCities(full) {
        var list = citiesOfProvince(full);
        var rich = list.filter(function (c) { return CATALOG[c] && !CATALOG[c].generic && CATALOG[c].items.length >= 3; });
        rich.sort(function (a, b) { return CATALOG[b].items.length - CATALOG[a].items.length; });
        // 只要有真实景点数据的城市，就只用它们（避免把「六安/亳州」这种只有 1 个兜底景点的城市排进行程）
        return rich.length ? rich : list;
    }
    function cnNum(s) {
        if (!s) return 0;
        if (/^\d+$/.test(s)) return parseInt(s, 10);
        if (s.length === 1) return CN_NUM[s] || 0;
        if (s.charAt(0) === '十') return 10 + (CN_NUM[s.charAt(1)] || 0);
        if (s.charAt(1) === '十') return (CN_NUM[s.charAt(0)] || 1) * 10 + (CN_NUM[s.charAt(2)] || 0);
        return CN_NUM[s.charAt(0)] || 0;
    }
    // 识别「一日游 / 三日游 / 北京玩 5 天 / 安徽 4 日游」这类"从零生成行程"的请求
    function parseTripRequest(text) {
        // 排除"改行程"类指令（加一天、减一天、第三天太赶…）
        if (/(加|多|少|减|延长|缩短|太赶|太累|改成|换成|第\s*[一二两三四五六七八九十\d]+\s*天)/.test(text)) return null;
        var days = 0;
        var m = text.match(/([0-9]{1,2}|[一二两三四五六七八九十]{1,3})\s*(?:日游|日\s*[0-9一二两三四五六七八九十]*\s*夜)/);
        if (m) days = cnNum(m[1]);
        if (!days) {
            var hasVerb = /(帮我|给我|生成|规划|安排|做个|来条|来一个|去|玩|怎么玩|想要|打算|准备)/.test(text);
            var hasPlace = cityListInText(text).length > 0 || !!provinceInText(text);
            if (hasVerb || hasPlace) {
                m = text.match(/([0-9]{1,2}|[一二两三四五六七八九十]{1,3})\s*天/);
                if (m) days = cnNum(m[1]);
            }
        }
        if (!days && /一日游|一天游/.test(text)) days = 1;
        if (!days || days < 1 || days > 20) return null;

        var cities = cityListInText(text).slice(0, 4);
        if (!cities.length) {
            var fullProv = provinceInText(text);
            if (fullProv) cities = provTopCities(fullProv).slice(0, 4);
        }
        if (!cities.length) cities = state.cities.slice(0, 4);
        // 天数不够分给每座城时，砍掉多余城市，保证每城至少 1 天
        if (cities.length > days) cities = cities.slice(0, days);
        if (!cities.length) return { days: days, cities: [], needCity: true };
        return { days: days, cities: cities };
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

        /* ---- 一日游 / N 日游：一键生成，并在结果区地图上画出路线 ---- */
        var tripReq = parseTripRequest(text);
        if (tripReq && tripReq.needCity) {
            return {
                reply: '好，给你排 <b>' + tripReq.days + ' 天</b>行程——告诉我去哪座城市或哪个省？<br>' +
                    '例如「杭州一日游」「安徽 4 日游」「成都玩 3 天」「云南 5 天」。',
                actions: actions
            };
        }
        if (tripReq) {
            return {
                reply: '行程草稿已排好：<b>' + esc(tripReq.cities.join(' → ')) + ' · ' + tripReq.days + ' 天</b><br>' +
                    '点下面的<b>「确认生成行程」</b>，我就在上方排出完整时间线，并在地图上按顺序画出路线。',
                actions: actions,
                tripDraft: tripReq
            };
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
                    var localDishes = foodsFor(cityI).slice(0, 4);
                    if (foodI.length || localDishes.length) intro += '<br>本地吃：' + (localDishes.length ? localDishes.join('、') : foodI.map(function (f) { return esc(f.name); }).join('、'));
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

        /* ---- 指定两地：航班 / 高铁 / 酒店 / 美食（国内外通用） ---- */
        var _cs2 = cityListInText(text);
        var _routeAsk = _cs2.length >= 2 || /(从|由).{1,12}(到|去|飞|前往)/.test(text);
        if (_routeAsk && !/(哪个|还是|比较|值得|好玩|推荐哪个)/.test(text)) {
            var from = _cs2[0] || state.cities[0];
            var to = _cs2[1] || (state.cities.length > 1 ? state.cities[1] : null);
            if (!from || !to) {
                return { reply: '告诉我「从哪到哪」，比如「从长沙到伦敦」，我给你航班、酒店和当地美食。', actions: actions };
            }
            if (from === to) return { reply: '出发地和目的地一样啦，换一个目的地试试。', actions: actions };

            var leg = intercity(from, to);
            var _first = function (c) { var it = CATALOG[c] && CATALOG[c].items && CATALOG[c].items[0]; return it || null; };
            var _inCN = function (c) { var it = _first(c); return !it || (it.lng > 72 && it.lng < 138 && it.lat > 17 && it.lat < 54.5); };
            var isCN = _inCN(from) && _inCN(to);
            var IATA = {
                '北京': 'BJS', '上海': 'SHA', '广州': 'CAN', '深圳': 'SZX', '成都': 'CTU', '杭州': 'HGH', '南京': 'NKG', '武汉': 'WUH',
                '西安': 'XIY', '重庆': 'CKG', '青岛': 'TAO', '厦门': 'XMN', '昆明': 'KMG', '天津': 'TSN', '郑州': 'CGO', '沈阳': 'SHE',
                '大连': 'DLC', '哈尔滨': 'HRB', '济南': 'TNA', '乌鲁木齐': 'URC', '长沙': 'CSX', '福州': 'FOC', '南宁': 'NNG',
                '伦敦': 'LON', '巴黎': 'PAR', '东京': 'TYO', '纽约': 'NYC', '迪拜': 'DXB', '曼谷': 'BKK', '新加坡': 'SIN', '首尔': 'SEL',
                '洛杉矶': 'LAX', '旧金山': 'SFO', '悉尼': 'SYD', '罗马': 'ROM', '巴塞罗那': 'BCN', '阿姆斯特丹': 'AMS',
                '法兰克福': 'FRA', '莫斯科': 'MOW', '伊斯坦布尔': 'IST', '香港': 'HKG', '台北': 'TPE', '巴厘岛': 'DPS'
            };
            var _code = function (c) { return IATA[c] || null; };
            var flyLink = (_code(from) && _code(to))
                ? 'https://flights.ctrip.com/online/list/oneway-' + _code(from).toLowerCase() + '-' + _code(to).toLowerCase()
                : 'https://flights.ctrip.com/online/channel/international';
            var hotelLink = 'https://hotels.ctrip.com/hotels/list?keyword=' + encodeURIComponent(to);
            var foodLink = 'https://you.ctrip.com/searchsite/food/?query=' + encodeURIComponent(to);

            // 目的地资料（酒店/美食/提示）
            var det = null;
            try {
                Object.keys(window.CITY_DETAIL || {}).forEach(function (k) {
                    var d = window.CITY_DETAIL[k];
                    if (d && d.name === to) det = d;
                });
            } catch (e) { }
            var foods = (det && det.foods || []).slice(0, 3);
            var foodTxt = foods.length
                ? foods.map(function (f) { return esc(f.name) + (f.price ? '（' + esc(f.price) + '）' : ''); }).join('、')
                : '当地招牌菜、特色小吃和夜市';
            var hotelTxt = det && det.hotels && det.hotels.length
                ? det.hotels.slice(0, 2).map(function (h) { return esc(h.name || h); }).join('、')
                : (isCN ? '市中心连锁酒店 ¥300-600/晚' : '市中心 4 星 ¥700-1500/晚');

            if (isCN) {
                var flyH = leg.km / 700 + 2.2, trainH = leg.km / 230 + 0.6;
                var flyC = Math.round(leg.km * 0.55 + 180), trainC = Math.round(leg.km * 0.46 + 15);
                var trainLink = 'https://trains.ctrip.com/TrainBooking/SearchTrain.aspx?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
                reply = '<b>' + esc(from) + ' → ' + esc(to) + '</b>，约 ' + num(leg.km) + ' km：<br>' +
                    '· ✈️ 飞机：约 ' + flyH.toFixed(1) + ' 小时（含往返机场），参考 ¥' + num(flyC) + ' · ' +
                    '<a href="' + flyLink + '" target="_blank" rel="noopener">携程查航班 →</a><br>' +
                    '· 🚄 高铁：约 ' + trainH.toFixed(1) + ' 小时，参考 ¥' + num(trainC) + ' · ' +
                    '<a href="' + trainLink + '" target="_blank" rel="noopener">携程查高铁 →</a><br>' +
                    '· 🏨 酒店：' + hotelTxt + ' · <a href="' + hotelLink + '" target="_blank" rel="noopener">携程查酒店 →</a><br>' +
                    '· 🍜 美食：' + foodTxt + ' · <a href="' + foodLink + '" target="_blank" rel="noopener">携程找餐厅 →</a><br>' +
                    (leg.km > 900 ? '距离较远，建议飞机，能省 4 小时以上。' : '距离不远，高铁更省心，市区到市区不用提前值机。');
                return {
                    reply: reply, actions: actions,
                    cards: [
                        { type: 'flight', title: from + ' → ' + to + ' · 飞机', meta: '约 ' + flyH.toFixed(1) + ' 小时（含往返机场）· 每日多班', price: '¥' + num(flyC) + ' 起', link: flyLink, linkText: '携程查航班', apply: 'flight' },
                        { type: 'train', title: from + ' → ' + to + ' · 高铁', meta: '约 ' + trainH.toFixed(1) + ' 小时 · 建议选上午班次', price: '¥' + num(trainC) + ' 起', link: trainLink, linkText: '携程查高铁', apply: 'train' },
                        { type: 'hotel', title: to + ' · 酒店', meta: hotelTxt, price: isCN ? '¥300 起/晚' : '¥700 起/晚', link: hotelLink, linkText: '携程查酒店' },
                        { type: 'food', title: to + ' · 必吃美食', meta: foodTxt, price: '人均 ¥50-150', link: foodLink, linkText: '携程找餐厅' }
                    ]
                };
            }

            // 跨国/境外：只有航班，另配酒店与美食（用直线距离估算，避免陆路系数放大）
            var _ca = CATALOG[from] && CATALOG[from].center;
            var _cb = CATALOG[to] && CATALOG[to].center;
            var gcKm = (_ca && _cb) ? Math.round(distKm(_ca, _cb)) : Math.round(leg.km / 1.28);
            var flyH2 = gcKm / 850 + 2.0;
            var flyC2 = Math.round(Math.max(2600, gcKm * 0.5) / 100) * 100;
            var tips = det && det.tips && det.tips.length ? esc(det.tips[0]) : '需护照+签证，建议提前 1-2 个月订票';
            reply = '<b>' + esc(from) + ' → ' + esc(to) + '</b>，约 ' + num(gcKm) + ' km（直线），跨国行程：<br>' +
                '· ✈️ 航班：直飞/中转约 ' + flyH2.toFixed(1) + ' 小时，参考 ¥' + num(flyC2) + ' · ' +
                '<a href="' + flyLink + '" target="_blank" rel="noopener">携程查航班 →</a><br>' +
                '· 🏨 酒店：' + hotelTxt + ' · <a href="' + hotelLink + '" target="_blank" rel="noopener">携程查酒店 →</a><br>' +
                '· 🍜 美食：' + foodTxt + ' · <a href="' + foodLink + '" target="_blank" rel="noopener">携程找餐厅 →</a><br>' +
                '· 📌 ' + tips + '。';
            return {
                reply: reply, actions: actions,
                cards: [
                    { type: 'flight', title: from + ' → ' + to + ' · 国际航班', meta: '约 ' + flyH2.toFixed(1) + ' 小时 · 直飞或一次中转', price: '¥' + num(flyC2) + ' 起', link: flyLink, linkText: '携程查航班' },
                    { type: 'hotel', title: to + ' · 酒店', meta: hotelTxt, price: '¥700 起/晚', link: hotelLink, linkText: '携程查酒店' },
                    { type: 'food', title: to + ' · 必吃美食', meta: foodTxt, price: '人均 ¥80-200', link: foodLink, linkText: '携程找餐厅' }
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
                var dishes = foodsFor(c).slice(0, 4);
                dishes.forEach(function (d) {
                    foodCards.push({
                        type: 'food',
                        title: c + ' · ' + d,
                        meta: FOOD_DESC[d] || ('本地招牌，人均 ¥40-80'),
                        price: '¥40-80/人',
                        link: ctripFood(c + ' ' + d),
                        linkText: '携程美食林'
                    });
                });
                return '· <b>' + esc(c) + '</b>：' + esc(dishes.join('、')) + '（人均 ¥40-80）';
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
            // 问候语 → 友好引导
            if (/^(你好|您好|hi|hello|嗨|在吗|嗯|ok|好的|谢谢|多谢|早|晚安)/i.test(text)) {
                return { reply: '你好呀 👋 我是 AI 行程助手。现在还差一步：在下方「接入大模型」里把豆包 Key 粘进去并保存，我就能回答任何问题（行程、生活、知识都行）。<br>' +
                    '· 还没填 Key 时，我也能用内置引擎帮你规划：说「给我生成青甘大环线」「川西环线」→ 一键出完整行程<br>' +
                    '· 选完城市后问「预算 5000」「住好点」「加一天」→ 调细节', actions: actions };
            }
            // 通用"XX 环线/路线"请求 → 自动识别省名/城市名做串联
            if (/环线|路线|线路|行程|攻略/.test(text)) {
                // 尝试从文本里提取省份或城市名
                var provNames = ['安徽','浙江','江苏','广东','四川','云南','贵州','山东','河南','河北','山西','陕西','甘肃','青海','新疆','西藏','内蒙古','黑龙江','吉林','辽宁','湖南','湖北','江西','福建','广西','海南','宁夏','重庆','北京','上海','天津','香港','澳门','台湾'];
                var hitProv = provNames.find(function (p) { return text.indexOf(p) >= 0; });
                var cityNames = Object.keys(CATALOG);
                var hitCities = cityNames.filter(function (c) { return text.indexOf(c) >= 0; }).slice(0, 4);
                if (hitProv || hitCities.length) {
                    var citiesPlan = hitCities.length ? hitCities.join('、') : hitProv + '主要城市';
                    actions.push({ type: 'clear' });
                    hitCities.forEach(function (c) { actions.push({ type: 'addCity', city: c }); });
                    // 如果只识别到省没识别到具体城市，默认选几个知名的
                    if (!hitCities.length && hitProv) {
                        var provTop = {
                            '安徽': ['黄山','徽州','九华山','天柱山'],
                            '浙江': ['杭州','乌镇','雁荡山','普陀山'],
                            '江苏': ['南京','苏州','无锡','镇江'],
                            '广东': ['广州','深圳','珠海','肇庆'],
                            '四川': ['成都','九寨沟','都江堰','稻城'],
                            '云南': ['昆明','大理','丽江','香格里拉'],
                            '贵州': ['贵阳','黄果树','西江千户苗寨','梵净山'],
                            '山东': ['济南','青岛','泰安','曲阜'],
                            '河南': ['郑州','洛阳','开封','少林寺'],
                            '河北': ['石家庄','保定','承德','秦皇岛'],
                            '山西': ['太原','平遥','大同','壶口瀑布'],
                            '陕西': ['西安','华山','延安','咸阳'],
                            '甘肃': ['兰州','敦煌','张掖','嘉峪关'],
                            '青海': ['西宁','青海湖','茶卡盐湖','祁连山'],
                            '新疆': ['乌鲁木齐','喀纳斯','赛里木湖','独库公路'],
                            '西藏': ['拉萨','林芝','纳木错','日喀则'],
                            '内蒙古': ['呼和浩特','呼伦贝尔','响沙湾','成吉思汗陵'],
                            '黑龙江': ['哈尔滨','雪乡','五大连池','漠河'],
                            '吉林': ['长春','长白山','雾凇岛','吉林'],
                            '辽宁': ['沈阳','大连','鞍山','丹东'],
                            '湖南': ['长沙','张家界','凤凰古城','衡山'],
                            '湖北': ['武汉','恩施','神农架','武当山'],
                            '江西': ['南昌','庐山','婺源','三清山'],
                            '福建': ['福州','厦门','武夷山','泉州'],
                            '广西': ['桂林','阳朔','龙脊梯田','北海'],
                            '海南': ['海口','三亚','蜈支洲岛','五指山'],
                            '宁夏': ['银川','贺兰山','水洞沟','中卫']
                        };
                        var defaults = provTop[hitProv] || [];
                        defaults.forEach(function (c) { actions.push({ type: 'addCity', city: c }); });
                        citiesPlan = defaults.length ? defaults.join('、') : hitProv;
                    }
                    actions.push({ type: 'setDays', days: Math.max(6, (hitCities.length || defaults.length) * 1.5 | 0) });
                    return { reply: '好的，给你规划<b>' + esc(citiesPlan) + '</b>这条线，地图上已排好路线。接着可以说「预算多少」「住好点」「加一天」来调整。', actions: actions };
                }
            }
            // 任何其他输入 → 给点有建设性的引导，不说"没理解"
            var sampleCities = ['杭州','成都','西安','三亚','大理'];
            return {
                reply: '明白，不过我需要多点线索来帮你 😊 试试这样说：<br>' +
                    '· 「给我生成川西环线」 「青甘大环线」<br>' +
                    '· 「杭州+苏州 3 天怎么玩」 「' + sampleCities[Math.floor(Math.random()*sampleCities.length)] + '有什么好玩」<br>' +
                    '· 「预算 6000 去云南」 「查从北京到成都的机票」',
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
            startCity: 1, movePoiTo: 1, addByPref: 1, dropPaid: 1, refreshPois: 1, clear: 1, planTrip: 1
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
                case 'planTrip': {
                    var tCs = (a.cities || []).filter(function (c) { return !!CATALOG[c]; }).slice(0, 4);
                    if (!tCs.length) { notes.push('没识别到可规划的城市'); break; }
                    var tDays = Math.max(1, parseInt(a.days, 10) || 1);
                    if (tCs.length > tDays) tCs = tCs.slice(0, tDays);
                    state.loop = null;
                    state.cities = tCs;
                    state.picks = {};
                    // 天数按城市均分，剩下的给前面的城市；每城按天数挑景点（每天约 2-3 个）
                    var perBase = Math.floor(tDays / tCs.length), perExtra = tDays % tCs.length;
                    var cap = state.pace === 'relaxed' ? 2 : (state.pace === 'packed' ? 4 : 3);
                    tCs.forEach(function (c, i) {
                        var d = perBase + (i < perExtra ? 1 : 0);
                        if (d < 1) d = 1;
                        var totalPoi = CATALOG[c].items.length;
                        var want = Math.min(totalPoi, Math.max(2, d * cap));
                        state.picks[c] = autoPickCity(c, want);
                    });
                    state.days = tDays;
                    notes.push('已生成 ' + tCs.join(' → ') + ' · ' + tDays + ' 天行程');
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
            // 新生成行程（一日游/多日游）后，把结果卡片滚到视野内，让地图直接可见
            var askedTrip = false;
            actions.forEach(function (a) { if (a && a.type === 'planTrip') askedTrip = true; });
            if (askedTrip && state.plan) {
                setTimeout(function () {
                    var rc = $('plResultCard');
                    if (!rc) return;
                    try { rc.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                    catch (e3) { rc.scrollIntoView(); }
                }, 150);
            }
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
            '你是一个通用 AI 助手，也是 MYL 旅行网站的资深旅行规划师，中文回答。用户什么问题都能问你：旅行/签证/交通/美食/预算/路线/住宿/攻略，也可以是编程/生活/学习/娱乐/闲聊/知识问答/翻译/写作等任何话题。',
            '当前行程 JSON：' + JSON.stringify(compact || {}),
            '偏好：住宿=' + (state.hotelTier || 'comfort') + '，城际偏好=' + (state.transport || 'auto') + '，人均预算=' + (state.budget || '不限'),
            '可加入的候选景点（按城市）：' + JSON.stringify(candidates),
            '可选城市（全国及全球主要城市）：' + Object.keys(CATALOG).join('、'),
            '现成环线：' + (window.LOOP_ROUTES || []).map(function (l) { return l.id + '=' + l.name; }).join('；'),
            '用户可能只是提问（不必改行程），也可能要求生成/修改行程。请只输出一个 JSON 对象，不要 markdown 代码块。格式：',
            '{"reply":"给用户看的中文回复，可用<br>换行","actions":[],"cards":[{"type":"flight|train|hotel|food","title":"标题","meta":"说明","price":"¥xxx","link":"https://...","linkText":"携程查价"}]}',
            'actions 可选：planTrip{cities:[城市1,城市2],days:天数}（用户说"N日游/玩N天"时用于从零生成行程，会自动挑景点并在地图出路线）、addCity{city}、removeCity{city}、addPoi{city,poi}、removePoi{city,poi}、replacePoi{city,poi}、setDays{days}、setPace{pace:relaxed|normal|packed}、setHotelTier{tier:budget|comfort|luxury}、setTransport{value:auto|train|flight}、setBudget{amount}、startCity{city}、movePoiTo{city,poi,day}、addByPref{pref:nature|history|food|family|photo}、dropPaid、refreshPois、loadLoop{id}、clear。',
            '需要用户可以点选航班/高铁/酒店/美食时，用 cards 返回 2-6 张卡，链接使用携程搜索页。',
            '约束：城市最多 4 座；改行程时尽量只使用候选景点或可选城市中的名字；纯知识问答可直接回答，不要硬塞 action。回复要具体、像真人规划师。'
        ].join('\n');
    }

    function callAI(userText) {
        var cfg = state.aiCfg || {};
        var preset = AI_PRESETS[cfg.provider] || {};
        var model = cfg.model || preset.model;
        var isProxy = preset.isProxy;
        // proxy 模式：endpoint 就是 Worker URL（不带路径），自动拼默认后端
        var endpoint;
        if (isProxy) {
            endpoint = (cfg.endpoint || DEFAULT_AI_CFG.endpoint || '').replace(/\/+$/, '');
            if (!endpoint) throw new Error('请先在 ⚙️ 里填 Cloudflare Worker 地址（部署一次后长期用）');
            // 转发目标：cfg.target → 预设 target → 豆包
            var target = (cfg.target || preset.target || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/+$/, '');
            // Worker 内部逻辑：去掉路径的 /api 前缀后拼到 target 后面
            endpoint = endpoint + '/api/chat/completions?target=' + encodeURIComponent(target);
            model = model || 'doubao-seed-1-6-250615';
        } else {
            endpoint = cfg.endpoint || preset.endpoint;
            if (!endpoint) throw new Error('未填写接口地址');
        }
        var isSite = cfg.provider === 'site' || endpoint === '/api/chat';
        var isOllama = cfg.provider === 'ollama' || (endpoint && endpoint.indexOf('ollama') >= 0) || isProxy;
        var headers = { 'Content-Type': 'application/json' };
        // proxy 模式：如果用户填了 key 就带上（转发给后端），没填就不带
        if (!isSite && !isOllama && cfg.key) headers['Authorization'] = 'Bearer ' + cfg.key;
        if (isProxy && cfg.key) headers['Authorization'] = 'Bearer ' + cfg.key;

        // 用 Promise.race 加 60s 超时
        var fetchPromise = fetch(endpoint, {
            method: 'POST',
            headers: headers,
            credentials: 'same-origin',
            mode: isSite ? 'cors' : 'cors',
            body: JSON.stringify({
                model: model,
                provider: isSite ? 'auto' : undefined,
                temperature: 0.3,
                messages: [
                    { role: 'system', content: buildSystemPrompt() },
                    { role: 'user', content: userText }
                ]
            })
        });
        var timeoutPromise = new Promise(function (_, reject) {
            setTimeout(function () { reject(new Error('TIMEOUT')); }, 60000);
        });

        return Promise.race([fetchPromise, timeoutPromise]).then(function (r) {
            if (!r.ok) {
                return r.text().then(function (t) {
                    var msg = 'HTTP ' + r.status, apiCode = '';
                    try {
                        var ej = JSON.parse(t);
                        if (ej && ej.error) { apiCode = ej.error.code || ''; msg = ej.error.message || apiCode || msg; }
                    } catch (e2) {}
                    var err = new Error(msg);
                    err.code = 'HTTP_' + r.status;
                    err.apiCode = apiCode;
                    throw err;
                });
            }
            return r.json();
        }).then(function (j) {
            var content = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
            content = content.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
            // 先尝试找 JSON 对象
            var start = content.indexOf('{'), end = content.lastIndexOf('}');
            if (start >= 0 && end > start) {
                try {
                    var obj = JSON.parse(content.slice(start, end + 1));
                    // 有 reply 字段 → 标准 JSON 格式
                    if (obj.reply !== undefined) return obj;
                    // 没有 reply → 当作纯文本 reply 处理
                } catch (e) { /* JSON 解析失败，走纯文本 */ }
            }
            // 纯文本回复：包装成 { reply: ... }
            return { reply: content };
        }).catch(function (e) {
            // 错误分类：让上层能给出针对性引导
            var isCORS = e && (e.name === 'TypeError' || e.message === 'Failed to fetch' || e.message.indexOf('NetworkError') >= 0);
            var isTimeout = e && e.message === 'TIMEOUT';
            var err = e instanceof Error ? e : new Error(String(e));
            err.isCORS = !!isCORS;
            err.isTimeout = !!isTimeout;
            err.provider = cfg.provider;
            err.model = model;
            err.endpoint = endpoint;
            throw err;
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
        var preset = AI_PRESETS[cfg.provider] || {};
        var endpoint = cfg.endpoint || preset.endpoint || (cfg.provider === 'proxy' ? DEFAULT_AI_CFG.endpoint : '');
        var needsKey = cfg.provider !== 'site' && cfg.provider !== 'ollama' && cfg.provider !== 'proxy';
        var hasKey = cfg.key || !needsKey;
        var useAi = cfg.provider && cfg.provider !== 'builtin' &&
            hasKey && !!endpoint;

        state.busy = true;
        state.msgs.push({ role: 'ai', text: '', typing: true });
        renderMsgs();

        if (useAi) {
            try {
                var res = await callAI(text);
                state.msgs.pop();
                var reply = (res && res.reply) ? sanitizeAi(res.reply) : '';
                var acts = Array.isArray(res && res.actions) ? res.actions.slice(0, 8) : [];
                var draftAi = null, actsRest = [];
                acts.forEach(function (a) {
                    if (a && a.type === 'planTrip') draftAi = { cities: a.cities || [], days: a.days || 1 };
                    else actsRest.push(a);
                });
                var changedAi = applyActions(actsRest);
                var aiCards = Array.isArray(res && res.cards) ? res.cards.slice(0, 8) : null;
                if (!reply) reply = '已按你的要求更新行程。';
                pushMsg('ai', reply + (changedAi ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(changedAi) + '</div>' : ''), draftAi, aiCards);
            } catch (e) {
                state.msgs.pop();
                var fb = localReply(text);
                var ch = applyActions(fb.actions);
                var hint = '';
                if (e.isCORS) {
                    if (e.provider === 'ollama') {
                        hint = '浏览器无法直接访问 localhost（跨域+CORS限制）。<br>' +
                            '<b>解决方法</b>：在电脑启动 Ollama 时设置 CORS：<br>' +
                            'Mac/Linux: <code>OLLAMA_ORIGINS="*" ollama serve</code><br>' +
                            'Windows: <code>$env:OLLAMA_ORIGINS="*"; ollama serve</code><br>' +
                            '⚠ 手机上无法用 Ollama（手机 localhost ≠ 电脑），请用豆包/DeepSeek 云端 API';
                    } else if (e.provider === 'site') {
                        hint = '站点代理暂不可用。改用 Ollama（需本地启动）或豆包/DeepSeek 填自己的 Key。';
                    } else if (e.provider === 'proxy') {
                        hint = '连不上 Worker（<code>*.workers.dev</code> 在国内常被 DNS 污染 / 屏蔽）。<br>' +
                            '<b>处理</b>：① 换 Wi-Fi / 手机流量再试；② 强烈建议在 Cloudflare 给 Worker 绑定自己的域名（Workers → Settings → Domains & Routes → Add custom domain），之后在 ⚙️ 把接口地址换成该域名。';
                    } else {
                        hint = '云端 AI API 不支持浏览器跨域直连。<br>' +
                            '<b>简单方案</b>：用 Ollama 本地模型（需启动并设置 <code>OLLAMA_ORIGINS="*"</code>）<br>' +
                            '<b>正规方案</b>：搭个免费 Cloudflare Worker 转发请求（2分钟部署），选「自定义代理」填 Worker URL<br>' +
                            '<b>临时方案</b>：换个 API endpoint 试试，有些镜像站允许跨域';
                    }
                } else if (e.isTimeout) {
                    hint = '请求超时（60s），大模型可能在忙。可以换个模型或稍后再试。';
                } else if (e.apiCode === 'ModelNotOpen') {
                    hint = '豆包账号还没开通模型 <code>' + esc(e.model || '') + '</code>：打开火山方舟控制台 →「开通管理」→ 找到该模型点「开通」（有免费额度），然后重试。<br>' +
                        '<a href="https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement" target="_blank" rel="noopener">→ 去开通</a>';
                } else if (e.apiCode === 'InvalidEndpointOrModel.NotFound') {
                    hint = '模型 ID 不存在或没有权限：在控制台「开通管理」复制可用模型 ID，填到 ⚙️ 的「模型」栏。';
                } else if (e.code === 'HTTP_401' || e.code === 'HTTP_403') {
                    hint = e.provider === 'proxy'
                        ? 'Worker 端还没有可用 Key：Cloudflare → 你的 Worker → Settings → Variables → 添加密钥 <code>ARK_API_KEY</code>；或在 ⚙️ 里填 Key（只存本机）。'
                        : 'API Key 无效或权限不足。请在 ⚙️ 设置里检查 Key 是否正确粘贴。';
                } else if (e.code === 'HTTP_404') {
                    hint = e.provider === 'proxy'
                        ? '模型名不对：豆包一般是 <code>doubao-seed-1-6-250615</code>，或在火山方舟控制台用你的推理接入点 ID（ep-xxx）。'
                        : '接口地址或模型名不对。检查 endpoint 和 model 字段。';
                } else {
                    hint = '调用失败：' + esc(e.message || '') + '。检查接口地址和 Key 是否正确。';
                }
                var hintHtml = hint ? '<div style="margin-top:6px;font-size:.74rem;color:#f59e0b">' + hint + '</div>' : '';
                pushMsg('ai', (fb.reply || '已按你的要求更新行程。') + (ch ? '<div style="margin-top:6px;font-size:.76rem;color:#94a3b8">已执行：' + esc(ch) + '</div>' : '') + hintHtml, fb.tripDraft || null, fb.cards);
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
                // 云端 AI 未填 Key 时，提示一步即通
                var _c = state.aiCfg || {};
                if (_c.provider && _c.provider !== 'builtin' && !_c.key && _c.provider !== 'site' && _c.provider !== 'proxy') {
                    out += '<div style="margin-top:6px;font-size:.74rem;color:#f59e0b">想让我什么都能答：在下方「接入大模型」粘贴豆包 Key → 保存（只存你手机，不会上传）。</div>';
                }
                pushMsg('ai', out, fb.tripDraft || null, fb.cards);
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
                '</b>。每天的「门票·预约 / 当地美食 / 道路交通」都放在行程卡里了，景点旁点「携程票 / 抖音票」可直接查票。' +
                '想改哪里直接跟我说，比如「第三天太赶了」「住好点」「加一天」「推荐美食」。');
        });

        // 助手
        var send = $('plAgentSend');
        var input = $('plAgentInput');
        var agBody = $('plAgentBody');
        if (agBody) agBody.addEventListener('click', function (e) {
            var tripBtn = e.target.closest('.pl-trip-confirm');
            if (tripBtn) {
                var cs = (tripBtn.getAttribute('data-cities') || '').split('|').filter(Boolean);
                var dy = parseInt(tripBtn.getAttribute('data-days'), 10) || 1;
                applyActions([{ type: 'planTrip', cities: cs, days: dy }]);
                state.plan = buildPlan();
                renderResult();
                saveLocal();
                tripBtn.disabled = true;
                tripBtn.textContent = '✅ 已生成，看上方行程';
                toast('行程已生成，地图上已画出路线');
                setTimeout(function () {
                    var rc = $('plResultCard');
                    if (rc) { try { rc.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (err) { rc.scrollIntoView(); } }
                }, 120);
                return;
            }
            var cancelBtn = e.target.closest('.pl-trip-cancel');
            if (cancelBtn) {
                var wrap = cancelBtn.parentNode;
                if (wrap) wrap.innerHTML = '<span style="font-size:.76rem;color:#94a3b8">已取消，想生成时再说一次就好</span>';
                return;
            }
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

        // 接入设置（只有站长设备能改：首次点齿轮需输入管理口令，口令正确后本机记住）
        var ADMIN_CODE = 'myl2026';
        var LS_ADMIN = 'myl_admin_ok';
        var isAdminDevice = function () {
            try { return localStorage.getItem(LS_ADMIN) === '1'; } catch (e) { return false; }
        };
        var gear = $('plAgentSettings');
        var panel = $('plAiPanel');
        if (gear && panel) gear.addEventListener('click', function () {
            if (!isAdminDevice()) {
                var code = window.prompt('模型设置仅站长可改，请输入管理口令：');
                if (code === null) return;
                if (String(code).trim() !== ADMIN_CODE) { toast('口令不正确，无法修改模型设置'); return; }
                try { localStorage.setItem(LS_ADMIN, '1'); } catch (e) { }
                toast('已解锁模型设置（仅本设备有效）');
            }
            if (window.innerWidth <= 640) {
                var ag = document.querySelector('.pl-agent');
                if (ag) { ag.classList.add('pl-agent-open'); document.body.classList.add('pl-agent-expanded'); }
            }
            // 打开时把当前配置回填到表单，避免看到空字段
            var cur = state.aiCfg || {};
            var pv = AI_PRESETS[cur.provider] || AI_PRESETS.doubao;
            if (provSel && cur.provider) provSel.value = cur.provider;
            if ($('plAiEndpoint')) $('plAiEndpoint').value = cur.endpoint || pv.endpoint || '';
            if ($('plAiModel')) $('plAiModel').value = cur.model || pv.model || '';
            if ($('plAiKey')) $('plAiKey').value = cur.key || '';
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
            var ready = cfg.key || cfg.provider === 'site' || cfg.provider === 'proxy' || cfg.provider === 'ollama';
            el.textContent = label + (cfg.model ? ' · ' + cfg.model : '') + (ready ? ' 已接入' : ' · 待填 Key');
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
            '      <p class="hint">接入大模型后可以<b>什么问题都能答</b>（旅行、生活、知识、写作都行）。Key 只存在你自己的浏览器，不上传服务器。<br>豆包直连可用（国内网络），只需填一次 Key。</p>',
            '      <div class="pl-ai-field"><label>服务商</label><select id="plAiProvider">',
            '        <option value="doubao">豆包 · 火山方舟（直连，推荐）</option>',
            '        <option value="builtin">内置规划引擎（适合简单改行程）</option>',
            '        <option value="site">站点 AI（需管理员配置）</option>',
            '        <option value="proxy">Cloudflare Worker 代理（workers.dev 国内可能被墙）</option>',
            '        <option value="ollama">本地 Ollama 开源大模型（无需 Key，电脑上跑）</option>',
            '        <option value="deepseek">DeepSeek（自己的 Key，需代理）</option>',
            '        <option value="kimi">Kimi · 月之暗面（自己的 Key，需代理）</option>',
            '        <option value="glm">智谱 GLM（自己的 Key，需代理）</option>',
            '        <option value="custom">自定义 OpenAI 兼容接口 / 代理</option>',
            '      </select></div>',
            '      <div class="pl-ai-field"><label>接口地址</label><input id="plAiEndpoint" type="text" placeholder="豆包：https://ark.cn-beijing.volces.com/api/v3/chat/completions"></div>',
            '      <div class="pl-ai-field"><label>模型 ID</label><input id="plAiModel" type="text" placeholder="豆包：doubao-seed-2-1-lite-260915"></div>',
            '      <div class="pl-ai-field"><label>API Key</label><input id="plAiKey" type="password" placeholder="粘贴火山方舟 API Key（ark- 开头），只存本机" autocomplete="off"></div>',
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

        // 恢复上次 / 首次进入不预设行程，让用户自己选城市
        var restored = loadLocal();
        if (!restored) {
            state.cities = [];
            state.picks = {};
            state.plan = null;
            renderAll();
        } else {
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
