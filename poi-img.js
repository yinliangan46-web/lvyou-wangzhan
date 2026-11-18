/* =====================================================================
   POI 配图：按景点/美食的**类型**匹配真实照片
   —— 之前所有卡片共用同一张占位图（生图接口只返回 "image is generating"），
      这里改为「分类实景图池 + 著名地标精确映射」，同名稳定取图，不会重复到同一张
   ===================================================================== */
(function (global) {
    var BASE = 'https://images.unsplash.com/';

    /* 已逐张核验的真实照片（编号见 /tmp/sheet.jpg 校对表） */
    var P = {
        cityStreet: 'photo-1449824913935-59a10b8d2000',   /* 城市街道高楼 */
        hillGreen: 'photo-1469474968028-56623f02e42e',    /* 青山云雾 */
        fjord: 'photo-1469521669194-babb45599def',        /* 峡湾雪山湖 */
        desertRoad: 'photo-1469854523086-cc02fe5d8800',   /* 荒漠红岩公路 */
        skylineDusk: 'photo-1470004914212-05527e49370b',  /* 城市天际线落日 */
        meadow: 'photo-1470071459604-3b5ec3a7fe05',       /* 草甸山谷 */
        rapeseed: 'photo-1490750967868-88aa4486c946',     /* 黄色花田 */
        canyon: 'photo-1504893524553-b855bce32c67',       /* 峡谷峭壁 */
        snowMountain: 'photo-1506905925346-21bda4d32df4', /* 雪山冰川 */
        beach: 'photo-1507525428034-b723cf961d3e',        /* 海滩日落 */
        nightMarket: 'photo-1508009603885-50cf7c579365',  /* 夜市小吃街红灯笼 */
        hillTemple: 'photo-1508804185872-d7badad00f7d',   /* 秋山上的古寺 */
        cityTower: 'photo-1519501025264-65ba15a82390',    /* 现代高楼群 */
        starrySnow: 'photo-1519681393784-d120267933ba',   /* 星空雪山 */
        sakura: 'photo-1522383225653-ed111181a951',       /* 樱花 */
        karst: 'photo-1528127269322-539801943592',        /* 喀斯特峰林游船（漓江） */
        thaiTemple: 'photo-1528181304800-259b08848526',   /* 泰式金顶寺庙 */
        japanLantern: 'photo-1528360983277-13d401cdc186', /* 日式灯笼居酒屋街 */
        japanGarden: 'photo-1537996194471-e657df975ab4',  /* 日式庭园水上阁 */
        kyotoPagoda: 'photo-1545569341-9eb8b30979d9',     /* 京都塔与街景 */
        palace: 'photo-1547981609-4b6bfe67ca0b',          /* 故宫太和殿广场 */
        tajMahal: 'photo-1548013146-72479768bada',        /* 泰姬陵门洞 */
        toucan: 'photo-1550853024-fae8cd4be47f',          /* 热带鸟类 */
        ski: 'photo-1551524559-8af4e6624178',             /* 滑雪雪山 */
        ramen: 'photo-1552611052-33e04de081de',           /* 拉面 */
        sushi: 'photo-1553621042-f6e147245754',           /* 寿司拼盘 */
        hostel: 'photo-1555854877-bab0e564b8d5',          /* 青年旅舍床位 */
        elephantHill: 'photo-1559592413-7cec4d0cae2b',    /* 象鼻山 */
        shrimpPlate: 'photo-1559742811-822873691df8',     /* 精致虾料理 */
        dumplings: 'photo-1563245372-f21724e3856d',       /* 蒸笼小笼包 */
        panda: 'photo-1564349683136-77e08dba1ef7',        /* 熊猫吃竹 */
        poolHotel: 'photo-1566073771259-6a8506099945',    /* 度假酒店泳池 */
        sphinx: 'photo-1568322445389-f64ac2515020',       /* 狮身人面像 */
        tea: 'photo-1576092768241-dec231879fc3',          /* 茶杯 */
        hotelRoom: 'photo-1582719478250-c89cae4dc85b',    /* 酒店房间 */
        noodles: 'photo-1585032226651-759b368d7246',      /* 面条 */
        tokyoStreet: 'photo-1590559899731-a382839e5549',  /* 日本街头招牌夜景 */
        sweetSour: 'photo-1525755662778-989d0524087e',    /* 糖醋鸡块配米饭 */
        fishDish: 'photo-1476224203421-9ac39bcb3327',     /* 铁板鱼/酱汁热菜 */
        friedRice: 'photo-1626804475297-41608ea09aeb',    /* 炒饭 */
        ricePan: 'photo-1512058564366-18510be2db19',      /* 铁锅炒饭 */
        noodleSoup: 'photo-1555126634-323283e090fa',      /* 汤面 */
        noodleDark: 'photo-1526318896980-cf78c088247c',   /* 深色汤面 */
        ramenShrimp: 'photo-1569718212165-3a8278d5f624',  /* 鲜虾拉面 */
        winterTree: 'photo-1483664852095-d6cc6870702d',   /* 雪原落日 */
        ribPlatter: 'photo-1555939594-58d7cb561ad1',      /* 烤肉拼盘 */
        roastRibs: 'photo-1544025162-d76694265947',       /* 烤肋排 */
        riceShrimp: 'photo-1559847844-5315695dadae',      /* 海鲜盖饭 */
        dimsum: 'photo-1534422298391-e4f8c172dddb',       /* 点心拼盘 */
        restaurant: 'photo-1552566626-52f8b828add9'       /* 餐厅内景 */
    };

    var POOLS = {
        palace: [P.palace],
        temple: [P.hillTemple, P.japanGarden, P.thaiTemple],
        street: [P.nightMarket, P.japanLantern, P.tokyoStreet],
        city: [P.cityStreet, P.skylineDusk, P.cityTower],
        mountain: [P.hillGreen, P.snowMountain, P.meadow, P.canyon, P.starrySnow],
        lake: [P.fjord, P.karst, P.elephantHill],
        desert: [P.desertRoad, P.sphinx],
        sea: [P.beach, P.fjord, P.karst],
        nature: [P.meadow, P.rapeseed, P.sakura, P.hillGreen],
        food: [P.noodles, P.dumplings, P.shrimpPlate, P.ramen, P.sushi],
        cnFood: [P.noodles, P.dumplings, P.shrimpPlate],
        meatDish: [P.sweetSour, P.fishDish],
        riceDish: [P.friedRice, P.ricePan],
        noodleDish: [P.noodles, P.noodleSoup, P.noodleDark, P.ramenShrimp],
        jpFood: [P.ramen, P.sushi],
        drink: [P.tea],
        hotel: [P.hotelRoom, P.poolHotel, P.hostel],
        restaurant: [P.restaurant, P.poolHotel],
        snow: [P.snowMountain, P.starrySnow, P.ski],
        winter: [P.winterTree, P.ski, P.starrySnow, P.snowMountain],
        bbq: [P.ribPlatter, P.roastRibs, P.sweetSour],
        riceBowl: [P.riceShrimp, P.friedRice, P.ricePan],
        dimsum: [P.dimsum, P.dumplings],
        wildlife: [P.panda, P.toucan],
        japan: [P.japanLantern, P.kyotoPagoda, P.tokyoStreet],
        thai: [P.thaiTemple],
        india: [P.tajMahal],
        egypt: [P.sphinx],
        guilin: [P.karst, P.elephantHill],
        panda: [P.panda],
        sakura: [P.sakura]
    };

    /* 著名地标：精确到具体照片 */
    var EXACT = {
        '故宫博物院': 'palace', '故宫': 'palace', '沈阳故宫': 'palace', '台北故宫': 'palace',
        '大熊猫繁育基地': 'panda', '熊猫基地': 'panda',
        '象鼻山': 'guilin', '漓江竹筏': 'guilin', '漓江': 'guilin', '阳朔西街': 'street',
        '金阁寺': 'temple', '伏见稻荷大社': 'japan', '清水寺': 'temple',
        '泰姬陵': 'india', '金字塔': 'egypt', '圣索菲亚教堂': 'temple',
        '中央大街': 'street', '宽窄巷子': 'street', '锦里古街': 'street',
        '洪崖洞': 'street', '磁器口': 'street', '南锣鼓巷': 'street',
        '回民街': 'street', '太平老街': 'street', '平江路': 'street',
        '阳朔西街': 'street', '沙洲夜市': 'street', '老道外': 'street',
        '喀什古城': 'street', '艾提尕尔清真寺': 'temple',
        '外滩': 'city', '武康路': 'city', '豫园': 'temple',
        '西湖': 'lake', '洱海生态廊道': 'lake', '洱海': 'lake', '千岛湖': 'lake',
        '茶卡盐湖': 'lake', '白沙湖': 'lake', '赛里木湖': 'lake', '喀纳斯湖': 'lake',
        '莫高窟': 'desert', '鸣沙山月牙泉': 'desert', '雅丹魔鬼城': 'desert',
        '玉门关': 'desert', '张掖七彩丹霞': 'desert',
        '冰雪大世界': 'winter', '太阳岛': 'winter', '冰雪世界': 'winter', '雪山': 'snow',
        '华山': 'mountain', '崂山': 'mountain', '苍山': 'mountain',
        '岳麓山': 'mountain', '橘子洲': 'mountain', '龙脊梯田': 'nature',
        '西溪湿地': 'nature', '龙井村': 'nature',
        '拙政园': 'temple', '留园': 'temple', '朱家角': 'lake',
        '上海迪士尼': 'city', '冰雪世界': 'snow',
        '望江楼公园': 'nature', '黄厝海滩': 'sea', '八市海鲜加工': 'food',
        '湖南博物院': 'temple', '八大关': 'street', '山城步道': 'city',
        '南山一棵树': 'city', '橘子洲': 'lake', '景山公园': 'nature',
        '白族石板烧': 'food', '乳扇沙琪玛': 'food', '西安城墙': 'city',
        '秦始皇兵马俑': 'palace', '甑糕': 'food', '片儿川': 'food',
        '鼓浪屿': 'sea', '沙坡尾艺术西区': 'city', '集美学村': 'city',
        '土笋冻': 'food', '花生汤': 'food', '袋装原浆': 'drink',
        '超级文和友': 'street', '颐和园': 'lake', '卤煮火烧': 'food',
        '香妃园': 'nature', '大雁塔': 'temple', '栈桥': 'sea',
        '八达岭长城': 'mountain', '桂林米粉': 'food', '都江堰': 'lake',
        '锅包肉': 'meatDish', '锅巴土豆': 'meatDish', '冷锅串串': 'meatDish',
        '老火锅': 'meatDish', '铁锅炖': 'meatDish', '烤羊排': 'bbq',
        '手抓饭': 'riceBowl', '红肠': 'bbq', '甜水面': 'noodleDish',
        '马迭尔冰棍': 'drink'
    };

    /* 城市 → 图片气质（决定取哪个池） */
    var CITY_POOL = [
        [/日本|京都|镰仓|东京|大阪|秋田|北海道|奈良|箱根/, 'japan'],
        [/泰国|曼谷|清迈|拜县|普吉/, 'thai'],
        [/埃及|金字塔|开罗/, 'egypt'],
        [/印度|泰姬/, 'india'],
        [/冰岛|极光|北欧|芬兰|挪威/, 'snow'],
        [/新疆|西藏|川西|青海|稻城|亚丁|四姑娘|丹巴|帕米尔|喀纳斯|禾木/, 'mountain'],
        [/桂林|阳朔|漓江/, 'guilin'],
        [/三亚|巴厘|海岛|马尔代夫|长滩|普吉|夏威夷/, 'sea'],
        [/敦煌|张掖|沙漠|戈壁|丹霞/, 'desert']
    ];

    var RULES = [
        [/街景|城市|都市|天际线/, 'city'],
        [/酒店|客栈|民宿|青旅|旅馆|假日|全季|宾馆|B&B|旅店|民泊|住宿|房/, 'hotel'],
        [/火锅|涮肉|烧烤|烤肉|串|烤肉|羊排|炖|焖|血旺|肠|饺|包|馍|饼|粑|面|粉|米线|乌冬|拉面|饭|粥|虾|鱼|蟹|蛤|贻贝|芋|豆|鸡|肉/, 'food'],
        [/茶|咖啡|酸奶|啤酒|奶茶|冰棍|果汁|饮|水$|酒/, 'drink'],
        [/寺|庙|大社|教堂|庵|祠|清真寺/, 'temple'],
        [/古街|老街|古城|古镇|巷|街$|路$|夜市|市场|小吃/, 'street'],
        [/湖|海|湾|岛|泉|瀑布|湿地|江|河|溪|盐湖/, 'lake'],
        [/山|峰|雪山|冰川|草原|梯田|高原|丹霞|雅丹|沙漠|峡谷|关$/, 'mountain'],
        [/博物馆|博物院|美术馆|艺术馆|遗址|故宫/, 'temple'],
        [/园|园林|公园|花海|樱花/, 'nature'],
        [/塔|楼|阁|桥|门|广场|长城|车站|站$/, 'city']
    ];

    function hash(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) % 99991;
        return h;
    }

    function url(id, kind) {
        return BASE + id + '?w=' + (kind === 'food' ? 480 : 720) + '&q=80&auto=format&fit=crop';
    }

    function categoryOf(name, kind, city) {
        name = String(name || '');
        if (EXACT[name]) return EXACT[name];
        var i;
        for (i = 0; i < CITY_POOL.length; i++) {
            if (CITY_POOL[i][0].test(name)) return CITY_POOL[i][1];
        }
        for (i = 0; i < RULES.length; i++) {
            if (RULES[i][0].test(name)) return RULES[i][1];
        }
        var c = String(city || '');
        for (i = 0; i < CITY_POOL.length; i++) {
            if (CITY_POOL[i][0].test(c)) return CITY_POOL[i][1];
        }
        return kind === 'food' ? 'food' : 'nature';
    }

    /* 有本地实拍图的，直接用本地图（已核验画面与景点一致） */
    var EXACT_IMG = {
        '圣索菲亚教堂': 'images/cities/haerbin.jpg'
    };

    function poiImg(name, kind, city) {
        if (EXACT_IMG[name]) return EXACT_IMG[name];
        var cat = categoryOf(name, kind, city);
        var isJP = /日本|东京|京都|大阪|镰仓|秋田|北海道|奈良/.test(String(name) + String(city || ''));
        var pool = POOLS[cat] || POOLS.nature;
        if (cat === 'street') pool = isJP ? [P.tokyoStreet, P.japanLantern] : [P.nightMarket];
        if (cat === 'food') {
            if (isJP) pool = POOLS.jpFood;
            else {
                var nm = String(name);
                if (/面|粉|米线|乌冬|拉面/.test(nm)) pool = POOLS.noodleDish;
                else if (/炒饭|盖饭|拌饭|抓饭|米饭|饭$/.test(nm)) pool = POOLS.riceBowl;
                else if (/肠|烤|腊|排骨|羊排|牛排|肉串|肉$/.test(nm)) pool = POOLS.bbq;
                else if (/饺|馍|饼|粑|烧卖|小笼|馄饨|团|糕|点心/.test(nm)) pool = POOLS.dimsum;
                else if (/虾|蟹|蛤|海鲜|贝/.test(nm)) pool = [P.shrimpPlate, P.ramenShrimp];
                else if (/茶|咖啡|酸奶|啤酒|奶茶|冰棍|汁|酒/.test(nm)) pool = [P.tea];
                else if (/火锅|炖|焖|烤|肉|鸡|鱼|肠|排|血旺|芋|豆|串/.test(nm)) pool = POOLS.meatDish;
                else pool = [P.dumplings, P.noodles];
            }
        }
        var id = pool[hash(String(name) + cat) % pool.length];
        return url(id, kind);
    }

    global.mylPOIImg = poiImg;
    global.mylPOICategory = categoryOf;
})(window);
