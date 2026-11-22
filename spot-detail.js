(function () {
    'use strict';

    function $(id) { return document.getElementById(id); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function txt(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

    var params = new URLSearchParams(location.search);
    var NAME = txt(params.get('name')) || '目的地';
    var TYPE = params.get('type') === 'food' ? 'food' : 'spot';
    var CITY = txt(params.get('city'));
    var LOOP = txt(params.get('loop'));
    var BACK = params.get('back') || (LOOP ? 'loop-guide.html?key=' + encodeURIComponent(LOOP) : 'index.html');
    var IS_FOOD = TYPE === 'food';

    /* ---------- 数据 ---------- */
    var info = { name: NAME, city: CITY, region: '', loopName: '', desc: '', ticket: '', price: '', q: '', loc: '', tip: '' };
    var detail = null;
    var nextSpot = '';
    var relSpots = [];
    var relFoods = [];

    function provinceOf(cityName, fallback) {
        var provs = window.PROVINCES_ALL || [];
        for (var i = 0; i < provs.length; i++) {
            var cs = provs[i].cities || [];
            for (var j = 0; j < cs.length; j++) {
                if (cs[j].name === cityName) return provs[i].name;
            }
        }
        return fallback || '';
    }

    var guides = window.LOOP_GUIDES || {};
    if (LOOP && guides[LOOP]) {
        var g = guides[LOOP];
        info.loopName = g.name || LOOP;
        info.region = g.province || g.region || provinceOf(CITY, '');
        var items = (IS_FOOD ? g.foods : g.spots) || [];
        var peers = [];
        items.forEach(function (x) {
            if (!x) return;
            if (x.n === NAME) {
                info.desc = txt(x.d || x.desc);
                info.q = txt(x.q);
                info.loc = txt(x.loc || x.w);
                info.ticket = txt(x.ticket);
                info.price = txt(x.p || x.price);
                info.tip = txt(x.tip);
            } else {
                peers.push(x);
            }
        });
        if (!IS_FOOD && peers[0]) nextSpot = txt(peers[0].n);
        if (!IS_FOOD) {
            relSpots = peers.slice(0, 4).map(function (x) { return txt(x.n); }).filter(Boolean);
            relFoods = (g.foods || []).slice(0, 3).map(function (x) { return txt(x.name || x.n); }).filter(Boolean);
        } else {
            relFoods = peers.slice(0, 4).map(function (x) { return txt(x.name || x.n); }).filter(Boolean);
        }
    }

    var CD = window.CITY_DETAIL || {};
    var cityByName = {};
    Object.keys(CD).forEach(function (k) {
        var d = CD[k];
        if (d && d.name) cityByName[d.name] = d;
    });
    if (CITY && (CD[CITY] || cityByName[CITY])) detail = CD[CITY] || cityByName[CITY];
    if (!detail) {
        Object.keys(CD).forEach(function (k) {
            var d = CD[k];
            if (!d || detail) return;
            var hit = (d.routePins || []).indexOf(NAME) >= 0;
            if (!hit) {
                hit = (d.itinerary || []).some(function (day) {
                    return (day.timeline || []).some(function (t) {
                        return String(t.activity || '').indexOf(NAME) >= 0;
                    });
                });
            }
            if (!hit && IS_FOOD) {
                hit = (d.foods || []).some(function (f) { return f && f.name === NAME; });
            }
            if (hit) detail = d;
        });
    }

    if (detail) {
        info.city = info.city || detail.name || '';
        info.region = info.region || (detail.country && detail.country !== '中国'
            ? detail.country
            : provinceOf(info.city, detail.country)) || '';
        if (IS_FOOD) {
            (detail.foods || []).forEach(function (f) {
                if (f && f.name === NAME) {
                    info.desc = info.desc || txt(f.desc || f.d);
                    info.price = info.price || txt(f.price || f.p);
                }
            });
            if (!relFoods.length) {
                relFoods = (detail.foods || []).map(function (f) { return f && f.name; })
                    .filter(function (n) { return n && n !== NAME; }).slice(0, 4);
            }
        } else {
            var pins = detail.routePins || [];
            var at = pins.indexOf(NAME);
            if (at >= 0 && pins[at + 1] && !nextSpot) nextSpot = pins[at + 1];
            if (!relSpots.length) {
                relSpots = pins.filter(function (p) {
                    return p && p !== NAME && !/自由活动|抵达|返程|退房|前往|出发|入住|午餐|晚餐|早餐|机场|车站|高铁|火车站|地铁|酒店|民宿|客栈|集合/.test(p);
                }).slice(0, 5);
            }
            if (!relFoods.length) {
                relFoods = (detail.foods || []).map(function (f) { return f && f.name; })
                    .filter(Boolean).slice(0, 3);
            }
            (detail.itinerary || []).forEach(function (day) {
                (day.timeline || []).forEach(function (t) {
                    if (String(t.activity || '').indexOf(NAME) < 0) return;
                    info.desc = info.desc || txt(t.detail);
                    info.ticket = info.ticket || txt(t.ticket);
                    info.price = info.price || txt(t.price);
                    info.tip = info.tip || txt(t.tip);
                });
            });
        }
    }
    if (!info.city && info.loopName) info.city = info.loopName;
    if (!info.region) info.region = '中国';

    /* ---------- 本地名录兜底：归属反查 + 同类串联 ---------- */
    var LOCAL_FOODS = window.CITY_FOODS || {};
    var LOCAL_LANDMARKS = window.CITY_LANDMARKS || {};
    var LOCAL_POI = window.CITY_POI_BANK || {};
    function localsOf(city) {
        var out = [];
        [LOCAL_LANDMARKS, LOCAL_POI].forEach(function (tb) {
            (tb[city] || []).forEach(function (n) { if (n && out.indexOf(n) < 0) out.push(n); });
        });
        return out;
    }
    function localFoodsOf(city) { return (LOCAL_FOODS[city] || []).slice(); }
    if (!info.city) {
        var banks = IS_FOOD ? [LOCAL_FOODS] : [LOCAL_LANDMARKS, LOCAL_POI];
        var foundCity = '';
        outer: for (var bi = 0; bi < banks.length; bi++) {
            var bk = Object.keys(banks[bi]);
            for (var ci = 0; ci < bk.length; ci++) {
                if ((banks[bi][bk[ci]] || []).indexOf(NAME) >= 0) { foundCity = bk[ci]; break outer; }
            }
        }
        if (foundCity) info.city = foundCity;
    }
    if (info.city && (!info.region || info.region === '中国')) {
        var prov = provinceOf(info.city, '');
        if (prov) info.region = prov;
    }
    if (IS_FOOD) {
        if (!relFoods.length) relFoods = localFoodsOf(info.city).filter(function (n) { return n !== NAME; }).slice(0, 4);
    } else {
        if (!relSpots.length) relSpots = localsOf(info.city).filter(function (n) { return n !== NAME; }).slice(0, 5);
        if (!relFoods.length) relFoods = localFoodsOf(info.city).slice(0, 3);
    }

    /* ---------- 分类 ---------- */
    function catOf(n) {
        if (/博物馆|博物院|纪念馆|美术馆|科技馆|展览馆|图书馆|陈列馆/.test(n)) return 'museum';
        if (/广州塔|东方明珠|电视塔|明珠|摩天轮|大桥|大厦|大楼|摩天|观景台/.test(n)) return 'landmark';
        if (/古镇|古城|老街|古街|街|巷|夜市|广场|商圈|步行街|外滩|大道/.test(n)) return 'street';
        if (/寺|庙|宫|殿|祠|塔|陵|墓|俑|楼|阁|关|城墙|书院|遗址|石窟|窟|府|故居|教堂|园|苑|村|牌坊|桥/.test(n)) return 'heritage';
        if (/山|峰|湖|海|岛|湾|峡|谷|江|河|洲|湿地|森林|草原|沙漠|瀑布|温泉|洞|沙滩|海滩|滩涂|岭|溪|潭|岩|梯田|冰川/.test(n)) return 'nature';
        return 'landmark';
    }
    var cat = catOf(NAME);
    var catName = { nature: '自然山水', heritage: '人文古迹', museum: '博物馆 / 展馆', street: '街区 / 夜游', landmark: '城市地标' };
    var duration = { nature: '3-4 小时', heritage: '2-3 小时', museum: '2-3 小时', street: '2-3 小时', landmark: '1.5-2 小时' };
    var bestTime = {
        nature: '清晨或日落前', heritage: '上午 9:00-11:00', museum: '开馆后 1 小时内',
        street: '傍晚到夜间', landmark: '傍晚亮灯前后'
    };

    var SLOGAN = {
        nature: '把山水的辽阔，留给愿意慢下来的人。',
        heritage: '一眼千年，从这里读懂一座城的来路。',
        museum: '一馆之内，收好这座城的记忆。',
        street: '拐进巷子，才算真正到过这里。',
        landmark: '先认出它，再认识这座城市。'
    };
    function foodPlace() {
        if (/环线|自驾|深度/.test(info.city) && info.loc) return info.loc.split(/[、，,/]/)[0];
        return info.city;
    }
    function foodSlogan() {
        var place = foodPlace();
        if (/辣|椒|火锅|麻辣/.test(NAME)) return '辣得直接，香得坦荡，这就是' + place + '的脾气。';
        if (/甜|糖|糕|蜜|奶/.test(NAME)) return '甜得不腻，是' + place + '留给旅人的温柔。';
        if (/面|粉|饭|馍|饼|饺|包/.test(NAME)) return '一碗下肚，才算真正走进' + place + '。';
        return '到' + place + '，先吃一口' + NAME + '再说。';
    }

    var HIGHLIGHT = {
        nature: [
            ['看什么', '远山轮廓、水面反光与近处植被，是这类山水最耐看的三个层次。'],
            ['什么光', '避开正午硬光，清晨和日落前的侧光会把层次拉开。'],
            ['怎么走', '把爬升和长距离步行放在前段，中段休息，返程留缓冲。']
        ],
        heritage: [
            ['看格局', '先看整体格局，再退回看屋檐、梁柱、碑刻与门楣。'],
            ['读线索', '顺着时间线看，比单看某座建筑更容易读懂它的来路。'],
            ['走顺序', '沿中轴或主线走到底，再折回看偏院与侧殿，少走回头路。']
        ],
        museum: [
            ['先锁定', '进门拿导览图，先定一到两件必看展品，再按动线补其他展厅。'],
            ['控节奏', '大馆至少留两小时，先常设精华，再看临展。'],
            ['听讲解', '语音导览或人工讲解能显著提升信息密度，热门馆记得提前预约。']
        ],
        street: [
            ['主街与支巷', '主街用来认路，真正有意思的小店多在支巷里。'],
            ['跟着本地人', '看本地人排队买什么，跟着买一小份，比按攻略打卡更接近真实。'],
            ['再来一次', '傍晚亮灯后再走一遍，街区气质会完全不同。']
        ],
        landmark: [
            ['先认符号', '先找到经典机位完成打卡，再慢慢逛周边。'],
            ['换角度', '正面广角拍全景，侧后方拍结构线条，夜里用长曝光。'],
            ['串成线', '把周边两三个点串成步行线，比单独来一次更值。']
        ]
    };

    var STORY = {
        nature: '山水的形状来自缓慢的地质过程，水汽、光线和季节又不断改写它的表情。同一片湖、同一座山，早晚完全是两种气质，这也是值得多留一会儿的原因。',
        heritage: '这类古迹大多经历过修建、损毁与重修的循环，今天看到的格局，是不同年代层层叠加的结果。看懂它，也就看懂了这座城市对待历史的方式。',
        museum: '一座好的博物馆，会把城市的来路拆成可读的线索：器物、文字、图像与生活痕迹。按时间顺序走一遍，比记住某件展品更有收获。',
        street: '街区因人的往来而生长，店铺、院落和巷口一起构成了它的性格。它不属于某一个景点，而是属于每天在这里生活的普通人。',
        landmark: '它是城区里辨识度较高的一处建筑或节点；先看它的位置、朝向与周边道路的关系，再理解它在本地日常里承担的功能。'
    };

    var TIPS = {
        nature: [
            ['时间', '尽量 9 点前进景区，避开团队与正午高温。'],
            ['机位', '找前景（石、草、栈道）压住画面，比单纯拍远山更有层次。'],
            ['人流', '节假日走反向路线，先到最远的观景点再往回玩。'],
            ['准备', '山里温差大，带一件外套；防晒和饮用水按全天量准备。']
        ],
        heritage: [
            ['时间', '上午侧光最适合看建筑细节，也更凉快。'],
            ['机位', '用门洞、廊柱做画框，比正面平拍更有纵深。'],
            ['人流', '团队多集中在 10:30 后，早到半小时体验差别明显。'],
            ['礼仪', '殿内不喧哗、不逆行拍摄；需要预约的殿宇提前查好。']
        ],
        museum: [
            ['时间', '开馆后一小时内入场，先看最想看的展厅。'],
            ['机位', '展柜前关掉闪光灯，贴近玻璃容易反光，斜一点拍。'],
            ['人流', '周末下午最挤，工作日或闭馆前两小时更从容。'],
            ['准备', '带身份证、提前预约；大馆穿舒适的鞋。']
        ],
        street: [
            ['时间', '傍晚到夜间最热闹，白天适合拍建筑和街景。'],
            ['机位', '找招牌、灯笼、巷口做前景，画面更有烟火气。'],
            ['人流', '主街挤的时候往支巷走，常有更本地的小店。'],
            ['消费', '先看价再点单，小份多样比一次点满更划算。']
        ],
        landmark: [
            ['时间', '傍晚亮灯前后一次能看两种面貌。'],
            ['机位', '经典机位人多，侧后方或高处往往更干净。'],
            ['人流', '节假日尽量错峰，早上通常最好拍。'],
            ['串联', '把周边点位安排在同一段步行范围内，省时间。']
        ]
    };

    var WHO = {
        nature: [['fa-camera', '摄影爱好者'], ['fa-person-hiking', '轻度徒步'], ['fa-children', '亲子自然'], ['fa-heart', '情侣出行']],
        heritage: [['fa-scroll', '历史爱好者'], ['fa-camera', '建筑摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
        museum: [['fa-child-reaching', '亲子研学'], ['fa-book', '历史爱好者'], ['fa-cloud-rain', '雨天备选'], ['fa-person', '独自旅行']],
        street: [['fa-moon', '夜游散步'], ['fa-utensils', '吃货'], ['fa-shoe-prints', '城市漫步'], ['fa-users', '朋友结伴']],
        landmark: [['fa-location-dot', '第一次到访'], ['fa-camera', '拍照打卡'], ['fa-heart', '情侣'], ['fa-clock', '短时停留']]
    };

    var FLAVOR = [
        [/辣|椒|火锅|冒菜|麻辣/, '香辣', 88],
        [/甜|糖|糕|蜜|冰|奶/, '甜香', 74],
        [/酸|醋|腌|泡/, '酸爽', 66],
        [/鲜|海鲜|汤|蒸|清/, '鲜味', 84],
        [/面|粉|饭|馍|饼|饺|包/, '扎实', 86],
        [/烤|烧|炸|煎|卤/, '焦香', 82]
    ];

    /* ---------- 图片 ---------- */
    function photo(q) {
        return 'https://tse1-mm.cn.bing.net/th?q=' + encodeURIComponent(q) + '&w=1600&h=1000&c=7&rs=1&p=0&dpr=1.5&pid=1.7';
    }
    var fallbackImg = IS_FOOD ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg';
    /* 搜索词构造：具体景点名直接搜（巢湖→巢湖实拍）；只有泛称（人民公园/博物馆等）
       才附加城市名，避免图搜被城市带偏（巢湖→合肥天鹅湖CBD） */
    var isGeneric = /公园|广场|步行街|博物馆|博物院|图书馆|美术馆|体育|大学|中学|医院|商圈|新区|开发区/.test(NAME) ||
        (NAME.length <= 2 && !/[湖山海关岛江河瀑泉寺塔桥楼宫园巷街镇村洞崖滩谷峡庙祠阁渡]/.test(NAME));
    var cityPart = (info.city && isGeneric) ? (info.city + ' ') : '';
    var heroQ = info.q || (NAME + ' ' + cityPart +
        (IS_FOOD ? '美食 自然光 特写 实拍' : '写实风光 氛围感 高清 构图舒展'));
    var heroSrc = photo(heroQ);

    document.title = NAME + ' · ' + (info.city || info.loopName || '旅行') + ' | MYL 旅行';
    $('sdHeroImg').src = heroSrc;
    $('sdHeroImg').alt = NAME;
    $('sdHeroImg').onerror = function () { this.onerror = null; this.src = fallbackImg; };
    $('sdKicker').textContent = [info.region, info.loopName || info.city].filter(Boolean).join(' · ');
    $('sdTitle').textContent = NAME;
    $('sdSlogan').textContent = IS_FOOD ? foodSlogan() : SLOGAN[cat];

    var meta = IS_FOOD
        ? [['fa-utensils', (txt(info.desc) && !badFoodDesc(txt(info.desc))) ? txt(info.desc).slice(0, 10) : '本地风味'],
           ['fa-coins', info.price || '人均 ¥30-80'],
           ['fa-clock', '午餐 / 晚餐'],
           ['fa-location-dot', info.loc || info.city || '当地老店']]
        : [['fa-tag', catName[cat]],
           ['fa-hourglass-half', duration[cat]],
           ['fa-ticket', info.ticket || '以景区公告为准'],
           ['fa-sun', bestTime[cat]]];
    $('sdMeta').innerHTML = meta.filter(function (m) { return m[1]; }).map(function (m) {
        return '<span><i class="fas ' + m[0] + '"></i>' + esc(m[1]) + '</span>';
    }).join('');

    $('sdBack').href = BACK;
    $('sdBack').innerHTML = '<i class="fas fa-arrow-left"></i> 返回' + (LOOP ? '环线百科' : '城市百科');
    $('sdFootBack').href = BACK;

    /* ---------- 正文 ---------- */
    function sec(id, no, title, en, body) {
        return '<section class="sd-sec" id="sec-' + id + '">' +
            '<div class="sd-sec-head"><em>' + no + '</em><h2>' + title + '</h2><small>' + en + '</small></div>' +
            '<div class="sd-sec-body">' + body + '</div></section>';
    }
    function p(text) { return '<p>' + esc(text) + '</p>'; }
    function list(items) {
        return '<ul class="sd-list">' + items.map(function (it) {
            return '<li><b>' + esc(it[0]) + '：</b>' + esc(it[1]) + '</li>';
        }).join('') + '</ul>';
    }
    function steps(items) {
        return '<div class="sd-steps">' + items.map(function (it, i) {
            return '<div class="sd-step"><em>0' + (i + 1) + '</em><div><h3>' + esc(it[0]) + '</h3><p>' + esc(it[1]) + '</p></div></div>';
        }).join('') + '</div>';
    }

    var FACTS = {
        nature: [
            '湖水的蓝并非染料，而是水深与矿物质对光线的选择性吸收。',
            '高原湖一天里会换三次颜色：清晨偏灰、正午偏蓝、日落偏金。',
            '“天空之镜”需要无风、浅水和一个够低的机位同时成立。',
            '山口的风通常比湖边大两级，拍照前先护住帽子和镜头。'
        ],
        heritage: [
            '老建筑的木构件多靠榫卯咬合，可以不用一颗铁钉。',
            '屋檐下的斗拱既是装饰，也是实打实的承重结构。',
            '不少殿宇的朝向会顺着山势或水口微调，并非严格正南。',
            '碑刻上的字，往往比建筑本身更能确定确切年代。'
        ],
        museum: [
            '展柜多用低反射玻璃，镜头斜一点就能避开倒影。',
            '一级文物未必最大，年代与稀缺性才是关键。',
            '不少镇馆之宝长期轮换展出，出发前先查官网。',
            '讲解器里的推荐路线，通常比随便逛省一半时间。'
        ],
        street: [
            '老街的门面常翻新，真正的老墙多半藏在巷子深处。',
            '夜市最热闹的是 19:30-21:00，摊主状态也最好。',
            '排队最长的不一定最好吃，本地人打包带走的才是。',
            '同一条街白天和夜里是两种气质，值得走两遍。'
        ],
        landmark: [
            '地标的高度常被误记，真正的观景点反而在远处。',
            '亮灯时间随季节调整，日落后 15-30 分钟是最佳窗口。',
            '隔一条街拍同一栋楼，线条往往更完整。',
            '地标周边的老街区，常常比地标本身更好逛。'
        ],
        food: [
            '同一道菜，早餐店和夜宵摊的做法常常完全不同。',
            '本地人点单会说“少辣”“走青”，是行话也是暗号。',
            '很多招牌菜的最佳赏味期，只有出锅后的十分钟。',
            '看一家店好不好，先看本地人打包带走的是什么。'
        ]
    };

    function relHref(name, kind) {
        var qs = 'type=' + kind + '&name=' + encodeURIComponent(name);
        qs += LOOP ? '&loop=' + encodeURIComponent(LOOP) : '&city=' + encodeURIComponent(info.city);
        qs += '&back=' + encodeURIComponent(BACK);
        return 'spot-detail.html?' + qs;
    }
    function relCard(name, kind) {
        var q = (info.city || '') + ' ' + name + (kind === 'food' ? ' 美食 实拍' : ' 景点 实景');
        return '<a class="sd-rel-card" href="' + relHref(name, kind) + '">' +
            '<img src="' + photo(q) + '" alt="' + esc(name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' +
            (kind === 'food' ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg') + '\'">' +
            '<div><b>' + esc(name) + '</b><span>' + (kind === 'food' ? '美食 · 查看详情' : '景点 · 查看详情') + '</span></div></a>';
    }
    function factBlock(kind) {
        return '<div class="sd-fact" data-kind="' + kind + '">' +
            '<b><i class="fas fa-lightbulb"></i> 冷知识</b>' +
            '<p id="sdFactText">' + esc(FACTS[kind][0]) + '</p>' +
            '<button type="button" id="sdFactBtn"><i class="fas fa-arrows-rotate"></i> 换一条</button></div>';
    }
    function checkBlock(items) {
        return '<div class="sd-check" id="sdCheck">' +
            '<div class="sd-check-head"><b>出发前打卡清单</b><em id="sdCheckCount">0/' + items.length + '</em></div>' +
            '<ul>' + items.map(function (t, i) {
                return '<li><label><input type="checkbox" data-i="' + i + '">' + esc(t) + '</label></li>';
            }).join('') + '</ul>' +
            '<div class="sd-check-bar"><span id="sdCheckBar"></span></div></div>';
    }

    /* ---------- 确定性评分（同一名称每次一致） ---------- */
    function hashStr(s) {
        var h = 0;
        s = String(s || '');
        for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
        return h;
    }
    var seed = hashStr(NAME + '|' + cat + '|' + TYPE);
    function sc(offset, min, max) {
        return min + ((seed + offset * 137) % (max - min + 1));
    }

    /* ---------- 实景图集 ---------- */
    var GAL_LABELS = IS_FOOD
        ? ['刚上桌', '特写质感', '街边小店', '制作过程', '本地餐桌']
        : ['全景', '近景细节', '清晨光线', '黄昏氛围', '人文一角'];
    var GAL_MODS = IS_FOOD
        ? [' 美食 实拍 自然光', ' 特写 质感 干净', ' 街边 小店 烟火气', ' 制作 过程', ' 餐桌 氛围']
        : [' 实景 全景', ' 细节 特写', ' 清晨 光线', ' 黄昏 日落', ' 人文 街景'];
    var galItems = [{ label: '主图', src: heroSrc }].concat(GAL_LABELS.map(function (l, i) {
        return { label: l, src: photo(((info.city || info.loopName || '') + ' ' + NAME + GAL_MODS[i]).trim()) };
    }));
    function galleryBlock() {
        return '<section class="sd-sec sd-gallery-sec" id="sec-gallery">' +
            '<div class="sd-sec-head"><em>LOOK</em><h2>实景速览</h2><small>' + (IS_FOOD ? 'On the Table' : 'Gallery') + '</small></div>' +
            '<div class="sd-sec-body"><div class="sd-gal">' + galItems.map(function (it, i) {
                return '<button type="button" data-i="' + i + '" aria-label="查看' + esc(it.label) + '大图">' +
                    '<img src="' + it.src + '" alt="' + esc(NAME + ' ' + it.label) + '" loading="' + (i ? 'lazy' : 'eager') + '"' +
                    ' onerror="this.onerror=null;this.src=\'' + fallbackImg + '\'"><span>' + esc(it.label) + '</span></button>';
            }).join('') + '</div></div></section>';
    }

    /* ---------- 侧栏 ---------- */
    function scoreRows() {
        var pairs = IS_FOOD
            ? [['本地人口味', sc(5, 78, 97)], ['游客出片度', sc(8, 52, 92)], ['性价比', sc(6, 58, 92)], ['排队热度', sc(7, 38, 88)]]
            : [['游客出片度', sc(1, 72, 97)], ['人流拥挤', sc(2, 42, 92)], ['步行强度', sc(3, 28, 85)], ['性价比', sc(4, 58, 94)]];
        return pairs.map(function (p) {
            return '<div class="sd-score-row"><span>' + p[0] + '</span>' +
                '<div class="sd-score-track"><i style="width:' + p[1] + '%"></i></div>' +
                '<em>' + (p[1] / 20).toFixed(1) + '</em></div>';
        }).join('');
    }

    var MONTH_BEST = {
        nature: [[0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0], '4-10 月景色在线，7-9 月最盛；旺季人多，早进景区。'],
        heritage: [[0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0], '春秋两季气温与光线最舒服，夏季注意避正午。'],
        museum: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], '全年可去，雨雪天与高温天的最佳备选。'],
        street: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], '全年可去，傍晚到夜间最有烟火气。'],
        landmark: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], '全年可去，日落亮灯前后最上镜。']
    };
    function monthBlock() {
        var conf = MONTH_BEST[cat] || MONTH_BEST.landmark;
        return '<div class="sd-card"><h3><i class="fas fa-calendar-days"></i>季节历</h3>' +
            '<div class="sd-months">' + conf[0].map(function (on, i) {
                return '<span class="' + (on ? 'on' : '') + '">' + (i + 1) + '月</span>';
            }).join('') + '</div>' +
            '<div class="sd-legend"><span><i class="best"></i>最佳</span><span><i></i>可去 / 次选</span></div>' +
            '<p class="sd-aside-note">' + esc(conf[1]) + '</p>' +
            '<p class="sd-aside-note">错峰：' + esc(cat === 'nature'
                ? '开园后两小时与闭园前两小时最从容，节假日避开 10:30-15:00。'
                : (cat === 'museum' ? '工作日开馆后一小时或闭馆前两小时人最少。' : '清晨与 21:00 后人最少，正午与 19:30-21:00 最挤。')) + '</p></div>';
    }
    function mealBlock() {
        return '<div class="sd-card"><h3><i class="fas fa-clock"></i>什么时候吃</h3>' +
            '<div class="sd-months"><span>早餐</span><span class="on">午餐</span><span class="on">晚餐</span><span>夜宵</span><span>错峰</span><span>打包</span></div>' +
            '<p class="sd-aside-note">午市 11:00-12:00、晚市 17:30-19:00 更从容，正点高峰通常要排。</p></div>';
    }
    function quickFacts() {
        var rows = IS_FOOD
            ? [['人均', dishPrice()], ['菜系', cuisineOf()], ['适合餐次', dishScene()],
               ['主味', dishProfile().main], ['辣度', dishProfile().spicy], ['赏味期', dishSeason()]]
            : [['建议停留', duration[cat]], ['最佳时段', bestTime[cat]], ['门票', ticketText()],
               ['级别', levelText()], ['预约', needReserve(NAME) ? '需实名预约' : '一般无需预约'], ['经纬度', COORD]];
        return '<div class="sd-card"><h3><i class="fas fa-circle-info"></i>速览</h3><dl class="sd-facts">' +
            rows.map(function (r) {
                return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
            }).join('') + '</dl></div>';
    }
    function mapCard() {
        var q = encodeURIComponent(((info.city || info.loopName || '') + ' ' + NAME).trim());
        return '<div class="sd-card"><h3><i class="fas fa-map-location-dot"></i>在地图里打开</h3>' +
            '<div class="sd-mapbtns">' +
            '<a href="https://uri.amap.com/search?keyword=' + q + '&view=map" target="_blank" rel="noopener">高德地图</a>' +
            '<a href="https://www.google.com/maps/search/?api=1&query=' + q + '" target="_blank" rel="noopener">Google 地图</a>' +
            '</div><p class="sd-aside-note">导航到官方入口或点评定位，避免被带到侧门与私人停车场。</p></div>';
    }
    function quoteCard() {
        var NOTE = {
            nature: '别把行程排满，这类山水最值钱的是等一场好光。',
            heritage: '进门前先抬头看一眼屋檐，故事常常从那里开始。',
            museum: '与其看完所有展厅，不如认真看懂三件展品。',
            street: '白天记路，晚上再来一次，巷子会换一张脸。',
            landmark: '拍完照别急着走，往旁边多走两条街。',
            food: '先吃本地默认做法，再谈加辣加醋；第一口最诚实。'
        };
        return '<div class="sd-quote"><b>编辑手记</b><p>「' + esc(NOTE[IS_FOOD ? 'food' : cat]) + '」</p><span>MYL 旅行编辑部</span></div>';
    }
    function asideBlock() {
        return '<aside class="sd-aside">' + quickFacts() +
            '<div class="sd-card"><h3><i class="fas fa-star-half-stroke"></i>' + (IS_FOOD ? '口味参考分（编辑）' : '编辑参考分') + '</h3>' +
            '<div class="sd-score">' + scoreRows() + '</div>' +
            '<p class="sd-aside-note">编辑参考分：按本地口碑、出片度与性价比分层估算，不是平台真实用户评分；拥挤与步行强度越高越需注意。<br>核查日期 ' + CHECK_DATE + '。</p></div>' +
            (IS_FOOD ? mealBlock() : monthBlock()) +
            (IS_FOOD ? '' : mapCard()) + quoteCard() + sourceCard() + '</aside>';
    }

    /* ---------- FAQ ---------- */
    function faqBlock(items) {
        return '<div class="sd-faq">' + items.map(function (q, i) {
            return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q[0]) +
                '<i class="fas fa-plus"></i></summary><p>' + esc(q[1]) + '</p></details>';
        }).join('') + '</div>';
    }

    /* ================= 事实层与内容生成 ================= */
    var CHECK_DATE = '2026-11-18';
    var PROV = info.region || provinceOf(info.city, '') || '';
    var CITY_SHORT = (info.city || info.loopName || '').replace(/市$/, '');

    var PRICE_TABLE = {
        '故宫': 60, '八达岭长城': 40, '颐和园': 30, '天坛': 15, '圆明园': 10, '鸟巢': 50,
        '秦始皇兵马俑': 120, '兵马俑': 120, '大雁塔': 50, '华清池': 120, '华山': 160,
        '鼓浪屿': 35, '拙政园': 80, '虎丘': 60, '周庄': 100, '乌镇': 150, '西塘': 100, '南浔': 100,
        '灵山大佛': 210, '黄山': 190, '千岛湖': 130, '西溪湿地': 80, '宋城': 300, '雷峰塔': 40,
        '灵隐寺': 75, '上海迪士尼': 475, '迪士尼': 475, '长隆': 300, '世界之窗': 220, '欢乐谷': 230,
        '张家界国家森林公园': 228, '天门山': 278, '九寨沟': 190, '都江堰': 80, '熊猫': 55,
        '峨眉山': 160, '乐山': 80, '布达拉宫': 200, '纳木错': 120, '青海湖': 90, '茶卡': 60,
        '莫高窟': 238, '鸣沙山': 110, '张掖': 74, '嘉峪关': 110, '天山天池': 125, '喀纳斯': 230,
        '蜈支洲岛': 144, '天涯海角': 68, '南山': 108, '玉龙雪山': 100, '苍山': 40, '漓江': 215,
        '龙脊梯田': 80, '泰山': 125, '崂山': 90, '蓬莱阁': 100, '刘公岛': 138, '云台山': 120,
        '龙门石窟': 90, '少林寺': 80, '老君山': 100, '三峡大坝': 105, '恩施大峡谷': 120,
        '衡山': 110, '岳阳楼': 70, '丹霞山': 100, '开平碉楼': 80, '广州塔': 150, '陈家祠': 10,
        '塔尔寺': 70, '沙坡头': 100, '镇北堡': 100, '西夏王陵': 75, '麦积山': 90, '壶口瀑布': 90,
        '西递': 104, '宏村': 104, '九华山': 160, '天柱山': 130, '庐山': 160, '井冈山': 190,
        '三清山': 150, '婺源': 210, '龙虎山': 260, '武功山': 70, '武夷山': 140, '福建土楼': 90,
        '雁荡山': 140, '普陀山': 160
    };
    var FREE_KEYS = ['外滩', '陆家嘴', '前门', '什刹海', '西湖', '宽窄巷子', '锦里', '回民街',
        '洪崖洞', '解放碑', '磁器口', '中山路', '环岛路', '深圳湾', '莲花山', '大梅沙', '沙面',
        '上下九', '北京路', '户部巷', '太平老街', '橘子洲', '大理古城', '丽江古城', '阳朔西街',
        '栈桥', '八大关', '五四广场', '东关街', '观前街', '平江路', '老门东', '曾厝垵',
        '南锣鼓巷', '翠湖', '大鹏所城', '鼓楼', '昙华林', '南普陀寺', '白堤', '苏堤', '中山陵',
        '夫子庙', '总统府', '玄武湖', '雨花台', '金鸡湖', '同里古镇', '山塘街', '黄浦江',
        '南京路', '王府井', '三里屯', '南长街', '先锋书店', '太古里', '大唐不夜城'];
    var RESERVE_KW = ['故宫', '国家博物馆', '南京博物院', '陕西历史博物馆', '上海博物馆', '苏州博物馆',
        '湖南省博物馆', '湖北省博物馆', '三星堆', '金沙遗址', '莫高窟', '布达拉宫', '中山陵',
        '大屠杀遇难同胞纪念馆', '侵华日军', '上海科技馆', '中国科技馆', '南京大屠杀', '兵马俑',
        '秦始皇陵', '云冈石窟', '龙门石窟', '拙政园', '狮子林', '留园', '西湖', '灵隐寺'];
    var WECHAT_MINI = {
        '故宫': '故宫博物院', '中国国家博物馆': '国家博物馆', '南京博物院': '南京博物院',
        '陕西历史博物馆': '陕西历史博物馆', '上海博物馆': '上海博物馆', '苏州博物馆': '苏州博物馆',
        '湖南省博物馆': '湖南博物院', '湖北省博物馆': '湖北省博物馆', '三星堆': '三星堆博物馆',
        '莫高窟': '莫高窟预约', '布达拉宫': '布达拉宫票务', '中山陵': '钟山风景区',
        '拙政园': '苏州园林旅游', '狮子林': '苏州园林旅游', '留园': '苏州园林旅游',
        '西湖': '西湖旅游', '灵隐寺': '灵隐寺'
    };
    var HOURS = {
        '故宫': '08:30-17:00（16:10 停止入馆；周一闭馆）',
        '中国国家博物馆': '09:00-17:00（16:00 停止入馆；周一闭馆）',
        '南京博物院': '09:00-17:00（16:00 停止入馆；周一闭馆）',
        '陕西历史博物馆': '08:30-18:00（周一闭馆，需预约）',
        '上海博物馆': '09:00-17:00（16:00 停止入馆；周一闭馆）',
        '苏州博物馆': '09:00-17:00（周一闭馆，需预约）',
        '中山陵': '08:30-17:00（周一祭堂闭馆，需预约）',
        '西湖': '全天开放；收费小景点约 08:00-17:00',
        '灵隐寺': '07:00-18:15（飞来峰景区另计）',
        '兵马俑': '08:30-17:00（旺季延长至 18:00）',
        '莫高窟': '08:00-18:00（按预约场次入场）',
        '布达拉宫': '09:30-15:00（需实名预约，旺季限流）',
        '黄山': '06:30-16:30（索道另计，恶劣天气调整）',
        '泰山': '全天开放；夜爬需预约，索道约 06:30-17:30',
        '张家界国家森林公园': '07:00-18:00（环保车另计）',
        '九寨沟': '08:30-17:00（需预约，冬季部分区域关闭）',
        '峨眉山': '06:00-18:30（金顶索道另计）',
        '都江堰': '08:00-18:00（旺季至 18:30）',
        '鼓浪屿': '全天开放；轮渡约 07:10-18:30',
        '外滩': '全天开放；亮灯约 18:00-22:00',
        '大唐不夜城': '全天开放；亮灯与演出集中在 19:00 后',
        '广州塔': '09:30-22:30（22:00 停止售票）',
        '上海迪士尼': '08:30-20:30（以当日运营公告为准）'
    };
    var POI_NOTE = {
        '故宫': '三大殿看礼制，东西六宫看生活；钟表馆与珍宝馆需另购票，别把时间全花在中轴线上。',
        '八达岭长城': '北八楼视野最好但坡陡，南线人少；缆车与滑车分开收费，按体力选。',
        '颐和园': '长廊—排云殿—佛香阁是主线，想看安静的一面去西堤与后山。',
        '天坛': '祈年殿看的是三层蓝色琉璃檐与榫卯结构，回音壁要两人分站两端才有效。',
        '外滩': '万国建筑博览群从南到北逐栋看，日落前到北端，亮灯后往回走。',
        '豫园': '园林与城隍庙商圈是两种节奏，先看园再逛市，避开正午团队高峰。',
        '西湖': '断桥—白堤—孤山是经典线；想安静去杨公堤、茅家埠，清晨与雨后最好。',
        '灵隐寺': '飞来峰造像在进寺之前，先看石窟再进殿；殿内不喧哗、不逆行拍摄。',
        '拙政园': '中部水景是精华，借景北寺塔在梧竹幽居一带；开园即入，避开 10 点后团队。',
        '中山陵': '392 级台阶对应一段纪念叙事，从博爱坊到祭堂是一条完整轴线，别只拍顶部。',
        '南京博物院': '历史馆按年代走，民国馆是复原街景；镇馆之宝在特展与历史馆，别只逛民国馆。',
        '夫子庙': '秦淮河夜景是主菜，贡院与乌衣巷在支巷；游船分白天与夜航，价格不同。',
        '先锋书店': '五台山店由地下车库改造，十字架与斜坡书廊是最出名的两个构图。',
        '兵马俑': '一号坑看规模，三号坑看指挥系统；先看铜车马馆再进坑，信息更完整。',
        '大雁塔': '塔身看唐代砖构，登塔另收费；北广场音乐喷泉按场次开放，提前查时间。',
        '大唐不夜城': '主街看灯与演出，支巷看小吃；19:00 后最热闹，也最挤。',
        '宽窄巷子': '宽巷子看院落，窄巷子看小店，井巷子看墙；往支巷走价格更正常。',
        '锦里': '傍晚亮灯后最有氛围，小吃按份买、多样尝；正门第一排通常最贵。',
        '熊猫基地': '早上 7:30-9:30 最活跃，先冲月亮产房再逛成年熊猫别墅。',
        '洪崖洞': '从顶层往下逛更省力，最佳机位在千厮门大桥与对岸；亮灯约 19:00 后。',
        '磁器口': '主街商业化重，往码头与支巷走；陈麻花排队结构比味道更能说明问题。',
        '鼓浪屿': '轮渡需实名，岛上靠步行；日光岩看全景，菽庄花园看海，别只走龙头路。',
        '曾厝垵': '小吃线适合两人分食，主街贵、支巷稳；晚上比白天热闹。',
        '黄山': '前山看雄伟、后山看秀气；云海看运气，日出需住山上，索道另计。',
        '张家界国家森林公园': '袁家界看峰林，金鞭溪看溪谷；环保车分段坐，先远后近。',
        '漓江': '杨堤—兴坪段最经典，20 元人民币取景地在兴坪；游船与竹筏是两种体验。',
        '布达拉宫': '按预约时段入场，内部不走回头路；台阶多，提前一天适应海拔。',
        '莫高窟': '先看数字展示中心再进洞窟，洞内禁闪光；旺季需提前多日预约。',
        '平遥古城': '城墙—票号—县衙是主线，通票按景点计；晚上看《又见平遥》需另购票。',
        '丽江古城': '四方街是入口，往五一街与七一街走更安静；清晨与夜里是两种气质。',
        '橘子洲': '青年毛泽东雕像在洲头，步行往返约 2 小时；小火车另收费。',
        '黄鹤楼': '登楼看长江与大桥，蛇山步道可串成一条线；夜游另售票。',
        '广州塔': '日落前上塔能看白天与夜景两种面貌；摩天轮与观景台分开收费。',
        '陈家祠': '看三雕两塑一铸，屋脊陶塑是最容易被错过的细节；门票便宜，值得细看。'
    };

    /* ---------- 景点专属史实与看点（按公开共识撰写，未收录的景点走类别线索兜底） ----------
       bg 建成背景 / form 形制与结构看点 / role 地位与城市角色 / link 周边联动 /
       audience 适配人群 / angle 专属观看角度。只写有把握的年代、形制与相邻点位，不虚构事件。 */
    var SPOT_PROFILE = {
        '天安门': {
            bg: '始建于明永乐十五年（1417），原名承天门，是明清两代北京皇城的正门；清顺治年间改称天安门。',
            form: '城楼建于汉白玉台基之上，为九开间重檐歇山顶木构城楼，城台开五阙券门；前有金水河、汉白玉石桥与华表构成前导空间。',
            role: '北京城中轴线上的正门与国家象征，也是重大庆典与集会的核心场所。',
            link: '向北出端门即故宫午门，西侧中山公园原为明清社稷坛，向南可接前门大街，串成中轴一线。',
            audience: [['fa-scroll', '历史研学'], ['fa-camera', '建筑摄影'], ['fa-children', '亲子研学'], ['fa-users', '首次到访']],
            angle: '先在金水桥前看中轴城楼与五阙门，再侧望广场与人民英雄纪念碑，理解它在整条中轴线上的位置。'
        },
        '故宫': {
            bg: '明永乐十八年（1420）建成，旧称紫禁城，是明清两代的皇家宫殿，1987 年列入世界文化遗产。',
            form: '南北中轴线贯通前朝后寝，前三殿、后三宫与东西六宫沿轴线对称展开；看台基、殿顶形制、开间数量与梁柱彩画对应的等级礼制。',
            role: '中国现存规模最大、保存最完整的古代宫殿建筑群，理解明清宫廷礼制与工艺的核心样本。',
            link: '午门进、神武门出；东侧可接太庙（今劳动人民文化宫），西侧为社稷坛（今中山公园）。',
            audience: [['fa-scroll', '历史研学'], ['fa-camera', '建筑摄影'], ['fa-children', '亲子研学'], ['fa-landmark', '国风打卡']],
            angle: '先站在太和殿广场看院落尺度与台基层级，再退回看屋檐、斗拱与彩画；钟表馆、珍宝馆需另购票。'
        },
        '天坛': {
            bg: '明永乐十八年（1420）始建，明清两代皇帝祭天祈谷的场所，1998 年列入世界文化遗产。',
            form: '祈年殿为三层蓝色琉璃檐圆形攒尖顶木构建筑，圜丘坛与皇穹宇分置南北；看环形坛面、回音壁与声学设计。',
            role: '中国现存最完整的古代祭天建筑群，体现古代祭天礼制与天人相应的空间观念。',
            link: '园内丹陛桥串联祈年殿—皇穹宇—圜丘；西门外可接先农坛（北京古代建筑博物馆）。',
            audience: [['fa-scroll', '历史研学'], ['fa-camera', '建筑摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
            angle: '先看祈年殿三重檐与蓝色琉璃瓦，再到圜丘坛站天心石感受环形声场，回音壁需两人分站两端体验。'
        },
        '颐和园': {
            bg: '清乾隆十五年（1750）建清漪园，1860 年遭焚毁，光绪十四年（1888）重建并改名颐和园，1998 年列入世界文化遗产。',
            form: '以昆明湖、万寿山为骨架，长廊沿湖北岸展开，排云殿—佛香阁构成山上主轴；看借景、水面层次与园林建筑布局。',
            role: '中国现存规模最大的皇家园林，集江南园林意趣与皇家规制于一体的范本。',
            link: '长廊—排云殿—佛香阁是主线；想安静可去西堤与后山，北门可接苏州街。',
            audience: [['fa-camera', '园林摄影'], ['fa-children', '亲子游'], ['fa-mug-hot', '慢旅行'], ['fa-users', '结伴出游']],
            angle: '先在东岸隔湖望万寿山与佛香阁建立全景，再沿长廊走到排云殿登山，西堤看水面与柳岸层次。'
        },
        '八达岭长城': {
            bg: '明长城的重要隘口之一，居庸关北口，明代在北魏、北齐旧长城基础上修筑加固。',
            form: '城墙沿山脊蜿蜒，敌楼、垛口、马道与关城依次排布；看墙砖铭文、马面间距与随山势起伏的走向。',
            role: '明代北方边防体系的代表性段落，也是长城最具代表性的游览段之一。',
            link: '可与居庸关、关沟一线串联；北线海拔高、视野开阔，南线相对平缓。',
            audience: [['fa-person-hiking', '轻度徒步'], ['fa-camera', '风光摄影'], ['fa-children', '亲子研学'], ['fa-users', '结伴出游']],
            angle: '先登城楼看长城沿山脊延展的整体走向，再找一处垛口近看墙砖与敌楼结构；北八楼视野最好但坡陡。'
        },
        '圆明园': {
            bg: '清康熙四十八年（1709）始建，经雍正、乾隆扩建为圆明三园，1860 年遭英法联军焚毁，现存为遗址园林。',
            form: '西洋楼遗址区残存大理石雕柱与喷泉构件，长春园、绮春园以水系与湖岸为主；看残柱雕饰与园林水系格局。',
            role: '清代大型皇家御园遗址，见证近代历史变迁，也是凭吊与了解近代史的场所。',
            link: '与颐和园同属西北郊皇家园林带，可安排同一天先后游览；园内福海周边可环湖步行。',
            audience: [['fa-scroll', '历史研学'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行'], ['fa-camera', '遗址摄影']],
            angle: '先看西洋楼残柱的雕饰与排布，再到福海周边看水系格局；遗址区不凭想象复原建筑，以现存遗存为准。'
        },
        '兵马俑': {
            bg: '秦始皇陵的陪葬军俑坑，1974 年当地打井时发现，为秦代遗存，1987 年随秦始皇陵列入世界文化遗产。',
            form: '一号坑呈长方形步兵军阵，三号坑为指挥场所；看俑人的甲胄、发式、面容差异与陶制工艺。',
            role: '研究秦代军队编制、兵器装备与雕塑艺术的珍贵实证，中国古代陪葬俑的代表。',
            link: '可与秦始皇陵封土、铜车马馆一并安排；先看铜车马馆再进坑，信息更完整。',
            audience: [['fa-scroll', '历史研学'], ['fa-children', '亲子研学'], ['fa-camera', '文物摄影'], ['fa-book', '历史爱好者']],
            angle: '一号坑看整体军阵规模，三号坑看指挥系统；站在坑前缘对比前排与后排俑人的姿态与甲胄差别。'
        },
        '大雁塔': {
            bg: '唐永徽三年（652）为玄奘主持修建，位于长安慈恩寺内，用于藏经与译经，唐代四方士子题名雁塔于此。',
            form: '方形七层砖构楼阁式塔，塔身逐层收分，南门额石刻有褚遂良书大唐三藏圣教序；看唐代砖构与塔檐收分。',
            role: '唐代长安佛教文化与中外交流的标志性遗存，西安唐代遗存的代表建筑之一。',
            link: '寺内可看玄奘事迹与碑刻；北广场音乐喷泉按场次开放，相邻大唐不夜城夜景集中在 19:00 后。',
            audience: [['fa-scroll', '历史研学'], ['fa-camera', '古建筑摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
            angle: '先在寺前广场望塔身整体轮廓与层数，再进南门看圣教序碑刻；登塔另收费，北广场喷泉提前查场次。'
        },
        '华山': {
            bg: '西岳华山，五岳之一，属秦岭东段花岗岩断块山，以险峻著称，自古有华山一条路的说法。',
            form: '五峰环峙，南峰最高，苍龙岭、长空栈道沿山脊与崖壁开凿；看花岗岩节理、山脊刃脊形态与崖壁栈道。',
            role: '五岳中以险峻与花岗岩峰林见长的名山，也是道教名山与徒步观日出的胜地。',
            link: '东山门乘索道或徒步上山；西峰、南峰、东峰可沿山脊环线串走，日出需住山上或夜爬。',
            audience: [['fa-person-hiking', '登山徒步'], ['fa-camera', '风光摄影'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先在北峰或云台峰望五峰轮廓与山脊走向，再沿苍龙岭看刃脊两侧绝壁；量力而行，崖壁栈道不勉强。'
        },
        '西安城墙': {
            bg: '明洪武年间在唐长安城皇城旧址上扩建而成，是国内现存规模最大、保存较完整的古代城垣之一。',
            form: '城墙环绕老城一周，城门、敌楼、马面与护城河配套；看墙砖包砌、马面间距与瓮城形制。',
            role: '西安老城的边界骨架，理解古代都城防御格局与明清城市格局的直观样本。',
            link: '永宁门（南门）登城最方便，可环城步行或骑行；城下可接书院门、回民街与钟鼓楼片区。',
            audience: [['fa-person-walking', '城市漫步'], ['fa-camera', '建筑摄影'], ['fa-children', '亲子游'], ['fa-mug-hot', '慢旅行']],
            angle: '先在南门瓮城看城门层级与马面布置，再登城俯看城内街巷与城外道路；傍晚亮灯前后城墙上光线最好。'
        },
        '外滩': {
            bg: '上海黄浦江西岸的近代街区，19 世纪中叶起形成租界商贸区，沿岸留存一批近代银行、洋行与酒店建筑。',
            form: '从南到北依次排布哥特式、巴洛克、新古典主义等风格的万国建筑群；看立面构图、石材墙面与檐口装饰。',
            role: '近代上海金融商贸中心的载体，近代建筑博览群与城市形象地标。',
            link: '隔江对望陆家嘴东方明珠与摩天楼；北端苏州河口可接外白渡桥，夜里沿江西行看亮灯。',
            audience: [['fa-camera', '建筑摄影'], ['fa-users', '首次到访'], ['fa-moon', '夜游散步'], ['fa-heart', '情侣出行']],
            angle: '日落前到北端，先逐栋看西岸立面，天黑亮灯后往回走；江对岸陆家嘴天际线作背景对照。'
        },
        '豫园': {
            bg: '明代嘉靖、万历年间始建的江南古典园林，原是潘氏私家园林，相邻城隍庙与城隍庙商圈。',
            form: '以水面为中心，亭廊、假山、花木与院墙错落；看黄石假山叠石、漏窗与曲廊的借景层次。',
            role: '上海老城厢保存至今的古典园林样本，与城隍庙商圈共同构成老城厢记忆。',
            link: '先看园再逛城隍庙商圈，两者节奏不同；避开正午团队高峰，园内与商圈分开安排时间。',
            audience: [['fa-camera', '园林摄影'], ['fa-mug-hot', '慢旅行'], ['fa-children', '亲子游'], ['fa-utensils', '顺路小吃']],
            angle: '站在亭榭处回望假山与水面最能看出层次；留意漏窗框景与曲廊转折，别只沿主路走一遍。'
        },
        '中山陵': {
            bg: '孙中山先生陵寝，1926 年动工、1929 年落成，由建筑师吕彦直设计，坐落南京钟山南麓。',
            form: '从博爱坊经墓道、牌坊到祭堂沿一条缓坡轴线抬升，392 级台阶对应纪念叙事；看石阶坡度、牌坊与祭堂建筑形制。',
            role: '近代纪念建筑与陵园规划的代表，南京钟山风景区的核心人文地标。',
            link: '与明孝陵、灵谷寺同属钟山风景区；可顺道逛美龄宫与紫金山步道。',
            audience: [['fa-scroll', '历史研学'], ['fa-children', '亲子研学'], ['fa-person-walking', '步行游览'], ['fa-camera', '建筑摄影']],
            angle: '从博爱坊起步沿台阶上行，到祭堂回望山下城市与林带；别只拍顶部祭堂，整条轴线的抬升节奏才是设计重点。'
        },
        '夫子庙': {
            bg: '南京秦淮河畔的孔庙与明清江南贡院所在地，是秦淮风光带的核心，旧时为科举与市井繁华之地。',
            form: '庙宇、学宫与贡院沿秦淮河岸排布，乌衣巷、文德桥在支巷与桥头；看秦淮画舫、马头墙与沿河街市格局。',
            role: '南京秦淮文化与科举记忆的集中承载地，老城厢夜游与小吃的集中片区。',
            link: '秦淮河夜景是主菜，贡院与乌衣巷在支巷；游船分白天与夜航，价格不同，可与老门东串联。',
            audience: [['fa-moon', '夜游散步'], ['fa-utensils', '吃货'], ['fa-users', '结伴出游'], ['fa-camera', '街景摄影']],
            angle: '傍晚先沿河岸看灯笼与街市亮灯，再钻乌衣巷支巷；夜航船看两岸灯火，白天看建筑与碑刻细节。'
        },
        '拙政园': {
            bg: '明正德年间始建，苏州古典园林的代表，1997 年列入世界文化遗产，与留园、网师园、沧浪亭并称苏州名园。',
            form: '中部水景为精华，亭榭临池、假山与花木错落；梧竹幽居一带可借景北寺塔，看水面、廊桥与漏窗框景。',
            role: '江南文人园林的典范，体现虽由人作、宛自天开的造园思路。',
            link: '可与苏州博物馆、狮子林串成姑苏古城东北线；开园即入，避开 10 点后团队高峰。',
            audience: [['fa-camera', '园林摄影'], ['fa-mug-hot', '慢旅行'], ['fa-scroll', '园林研学'], ['fa-heart', '情侣出行']],
            angle: '中部水景是精华，站在亭榭处回望最能看出层次；注意借景北寺塔的机位，荷期与淡季各有面貌。'
        },
        '苏州博物馆': {
            bg: '由建筑师贝聿铭设计，2006 年开放，馆址毗邻太平天国忠王府旧址，是地方历史艺术综合馆。',
            form: '白墙灰瓦与几何天窗、水池片石结合，新馆与忠王府古建筑相邻；看立面构图、采光中庭与展陈动线。',
            role: '现代建筑与传统园林意趣结合的地方博物馆，苏州人文与藏品的展示窗口。',
            link: '紧邻拙政园与忠王府，三者可步行串联；需提前预约，周末名额紧张。',
            audience: [['fa-book', '文博爱好者'], ['fa-camera', '建筑摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
            angle: '先看中庭采光片石与水池构图，再按常设展动线看藏品；忠王府古建筑部分留意梁架与彩画。'
        },
        '瘦西湖': {
            bg: '扬州城河演变而成的湖上园林，清代盐商沿湖营建亭台园林，是扬州园林的集中展示带。',
            form: '狭长湖面串联五亭桥、白塔、二十四桥等景点，长堤柳岸与岛屿亭阁错落；看水面收放、桥塔比例与借景。',
            role: '扬州湖上园林的代表，体现清代江南私家园林沿水布局的特色。',
            link: '南门长堤春柳起步，沿湖步行或乘船；可接大明寺、个园与何园。',
            audience: [['fa-camera', '园林摄影'], ['fa-mug-hot', '慢旅行'], ['fa-heart', '情侣出行'], ['fa-person-walking', '步行游览']],
            angle: '先在长堤望湖面收放与远处桥塔轮廓，再到五亭桥畔看白塔与水面倒影；乘船看两岸柳岸与亭阁层次。'
        },
        '西湖': {
            bg: '杭州城西的天然潟湖，经历代疏浚整治形成今日格局，2011 年列入世界文化遗产。',
            form: '白堤、苏堤横贯湖面，孤山、三潭印月与北山街环湖分布；看湖面水域层次、堤岛关系与远山（宝石山、南屏山）借景。',
            role: '中国江南湖泊园林与山水审美结合的代表，杭州城市意象的核心。',
            link: '断桥—白堤—孤山是经典线；想安静去杨公堤、茅家埠，清晨与雨后湖面最稳。',
            audience: [['fa-camera', '风光摄影'], ['fa-heart', '情侣出行'], ['fa-person-walking', '环湖步行'], ['fa-mug-hot', '慢旅行']],
            angle: '先在湖滨或断桥望湖面与北山街、宝石山建立全景，再走白堤或苏堤看两侧水域；清晨、雨后与黄昏光线差别很大。'
        },
        '灵隐寺': {
            bg: '东晋咸和元年（326）始建，杭州最早的名刹之一，坐落西湖以西飞来峰山麓。',
            form: '飞来峰石窟造像在进寺之前，沿溪山崖开凿；寺内沿山门—天王殿—大殿轴线排布，看造像题记、岩洞与殿宇格局。',
            role: '江南著名禅宗寺院，飞来峰造像为江南石窟遗存的重要代表。',
            link: '先看飞来峰造像再进殿；可接永福寺、韬光寺与北高峰，景区与寺院门票分别计。',
            audience: [['fa-scroll', '宗教研学'], ['fa-camera', '古建摄影'], ['fa-mug-hot', '慢旅行'], ['fa-children', '亲子游']],
            angle: '进寺前先沿溪看飞来峰石刻造像与岩洞，再沿轴线进殿；殿内不喧哗、不逆行拍摄。'
        },
        '雷峰塔': {
            bg: '北宋太平兴国二年（977）吴越王钱俶始建，原塔废圮，2002 年在旧址重建新塔。',
            form: '新塔为八角五层楼阁式塔身，立于夕照山岗上；旧塔残砖层叠于塔基展厅，看塔刹、檐角与俯瞰西湖的视角。',
            role: '西湖十景雷峰夕照的主体，与北山保俶塔隔湖相望的杭州地标。',
            link: '净慈寺在塔南麓，南屏晚钟相邻；可沿南山路接柳浪闻莺与长桥公园。',
            audience: [['fa-camera', '风光摄影'], ['fa-users', '首次到访'], ['fa-heart', '情侣出行'], ['fa-mug-hot', '慢旅行']],
            angle: '登塔望西湖湖面与对岸北山街、保俶塔；黄昏夕照时分塔影与湖面光线最好，塔基展厅可看旧塔残砖。'
        },
        '乌镇': {
            bg: '江南水乡古镇，位于京杭大运河沿线，以水巷、石桥与沿河民居为格局，分东栅、西栅两片。',
            form: '河道纵横，石桥跨水，民居沿河临水而建，廊棚与石阶埠头错落；看水巷走向、石桥拱券与临水民居尺度。',
            role: '江南水乡古镇保护与旅游开发的代表，水乡生活风貌的集中展示。',
            link: '西栅夜景与河道游船最具特色；可与西塘、南浔串联成浙北水乡线。',
            audience: [['fa-camera', '水乡摄影'], ['fa-moon', '夜游散步'], ['fa-heart', '情侣出行'], ['fa-mug-hot', '慢旅行']],
            angle: '先沿主河看水巷与石桥整体格局，再钻支巷看临水民居与埠头；夜里亮灯后乘摇橹船看两岸廊棚倒影。'
        },
        '黄山': {
            bg: '皖南花岗岩峰林，1990 年列入世界文化与自然双重遗产，以奇松、怪石、云海、温泉四绝闻名。',
            form: '花岗岩峰柱拔起，山脊与峡谷交错，迎客松等造型松生于崖缝；看峰林节理、山脊线与云海填充峡谷的层次。',
            role: '中国山水审美与山水画意象的典型原型，名山山岳的代表。',
            link: '前山看雄伟、后山看秀气；云海看运气，日出需住山上，索道另计。',
            audience: [['fa-person-hiking', '登山徒步'], ['fa-camera', '风光摄影'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先到视野开阔处记住山脊线与峰林范围，再落到奇松怪石细节；雨后初晴与清晨最易见云海，提前查天气。'
        },
        '宏村': {
            bg: '皖南徽州古村落，南宋初年始建，明清扩建，2000 年随皖南古村落列入世界文化遗产。',
            form: '村落按牛形水系规划，水圳、月沼、南湖串联民居与祠堂；看马头墙、青瓦粉墙、水系走向与街巷骨架。',
            role: '徽州村落规划与徽派建筑的代表，古水系与村落共生的样本。',
            link: '与西递同属黟县徽州古村；可接塔川秋色与南屏村，徽州一线串联。',
            audience: [['fa-camera', '古村摄影'], ['fa-scroll', '建筑研学'], ['fa-mug-hot', '慢旅行'], ['fa-children', '亲子游']],
            angle: '先沿水圳走一圈看水系如何穿村入户，再到月沼、南湖看民居倒影；清晨与傍晚游客少、水面最静。'
        },
        '鼓浪屿': {
            bg: '厦门西南海面的小岛，近代租界时期留存一批西式宅院，素有钢琴之岛之称，2017 年列入世界文化遗产。',
            form: '丘陵巷道依山起伏，华侨宅院、教堂与领事馆旧址散落林间；看万国建筑立面、环岛海岸与古树步道。',
            role: '近代华侨文化与闽南海岛风情结合的历史社区，厦门城市名片。',
            link: '轮渡需实名上岛，岛上靠步行；日光岩看全景，菽庄花园看海，别只走龙头路。',
            audience: [['fa-camera', '海岛摄影'], ['fa-heart', '情侣出行'], ['fa-mug-hot', '慢旅行'], ['fa-users', '结伴出游']],
            angle: '先登日光岩俯瞰全岛与厦门海峡，再钻丘陵巷看老宅与树木；菽庄花园看海景与假山，傍晚环岛路看落日。'
        },
        '武夷山': {
            bg: '闽赣交界的丹霞山地，1999 年列入世界文化与自然双重遗产，是武夷岩茶产地与朱子理学讲学地。',
            form: '红色砂砾岩峰柱沿九曲溪排布，竹筏顺溪而下；看丹霞赤壁、曲溪水岸与茶园植被层次。',
            role: '丹霞地貌、茶文化与理学文化叠加的名山，闽北山水代表。',
            link: '九曲溪竹筏是主线；天游峰可俯瞰九曲溪弯转，大红袍景区看茶树与岩谷。',
            audience: [['fa-person-hiking', '山水徒步'], ['fa-camera', '风光摄影'], ['fa-mug-hot', '慢旅行'], ['fa-utensils', '茶事体验']],
            angle: '竹筏上看两岸丹霞峰壁与水岸弯转，登天游峰回望九曲溪整体走向；岩茶可在茶寨按品饮方式了解。'
        },
        '泰山': {
            bg: '东岳泰山，五岳之首，自古帝王封禅祭天之地，1987 年列入世界文化与自然双重遗产。',
            form: '花岗岩山体拔起，中路登山盘道贯穿庙宇、牌坊与摩崖石刻，玉皇顶为峰顶；看山势体量、石刻题刻与登顶视野。',
            role: '中国山岳文化与封禅祭祀传统的核心名山，东方山水文化的象征之一。',
            link: '红门中路徒步或天外村乘车到中天门；夜爬看日出需租大衣，索道另计。',
            audience: [['fa-person-hiking', '登山徒步'], ['fa-camera', '风光摄影'], ['fa-scroll', '文化研学'], ['fa-users', '结伴出游']],
            angle: '先看中路盘道两侧庙宇与摩崖石刻的序列，再登顶望群山与云海；日出与云海受天气影响大，提前看预报。'
        },
        '崂山': {
            bg: '青岛黄海之滨的道教名山，山势临海而起，是海岸线少见的滨海山岳。',
            form: '花岗岩山峦与海岸岬角衔接，道观藏于山谷，滨海步道绕山而行；看山海相接的轮廓、花岗岩礁石与松林。',
            role: '海上名山第一，滨海山岳与道教文化结合的青岛地标。',
            link: '仰口看海景与岬角，太清看道观与临海古道；可沿滨海公路串起垭口与青山渔村。',
            audience: [['fa-person-hiking', '山海徒步'], ['fa-camera', '风光摄影'], ['fa-heart', '情侣出行'], ['fa-mug-hot', '慢旅行']],
            angle: '先找高处望山体与黄海相接的轮廓，再走滨海段看礁石与松林；道观内留意碑刻与古柏，海边风大注意衣物。'
        },
        '张家界国家森林公园': {
            bg: '武陵山脉中的石英砂岩峰林，1992 年列入世界自然遗产，是国内首个国家森林公园。',
            form: '数千座石英砂岩柱峰拔起于峡谷云雾间，金鞭溪沿谷底穿行；看峰柱节理、峡谷纵深与植被垂直层次。',
            role: '砂岩峰林地貌的典型代表，也是电影与山水意象常取材的山岳景观。',
            link: '袁家界看峰林，金鞭溪看溪谷；环保车分段坐，先远后近，百龙天梯另计。',
            audience: [['fa-person-hiking', '峡谷徒步'], ['fa-camera', '风光摄影'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先在观景台记住峰林整体排布与峡谷走向，再下金鞭溪沿溪水看两侧峰壁；雨后云雾绕峰柱最出片。'
        },
        '橘子洲': {
            bg: '长沙湘江江心的狭长沙洲，因盛产橘柑得名，洲头立有青年毛泽东雕像，是长沙城市地标。',
            form: '长岛纵贯湘江，草坪、林木与步道沿洲分布，两端各有观景平台；看湘江两岸城市天际线与洲岛绿带关系。',
            role: '长沙湘江风光带的中心节点，城市公共休闲与红色纪念地。',
            link: '步行往返约 2 小时，小火车另收费；可与岳麓山隔江对望，串联湘江两岸。',
            audience: [['fa-person-walking', '滨江步行'], ['fa-camera', '城市摄影'], ['fa-heart', '情侣出行'], ['fa-children', '亲子游']],
            angle: '先沿洲中轴走到洲头看雕像与湘江江面，再回望两岸岳麓山与长沙城；傍晚江面与城市灯光层次最好。'
        },
        '岳阳楼': {
            bg: '洞庭湖畔的江南名楼，北宋滕子京谪守巴陵郡时重修，范仲淹作《岳阳楼记》，楼历代屡毁屡建。',
            form: '三层盔顶木结构楼阁，立于湖畔台基，登楼俯瞰洞庭湖水面与远处君山岛；看木构层叠、盔顶曲线与湖景视野。',
            role: '江南三大名楼之一，因《岳阳楼记》文名与洞庭湖景并称的人文名楼。',
            link: '湖边可乘船往君山岛；与洞庭湖大桥、汴河街相邻，可安排湖畔半日。',
            audience: [['fa-scroll', '人文研学'], ['fa-camera', '古楼摄影'], ['fa-mug-hot', '慢旅行'], ['fa-users', '结伴出游']],
            angle: '先在湖畔望楼阁三层轮廓与盔顶，登楼凭栏看洞庭湖开阔水面与君山岛；文中洞庭天下水、岳阳天下楼的意境要凭湖面体会。'
        },
        '九寨沟': {
            bg: '岷山山脉南段的高山峡谷，因沟内藏寨得名，1992 年列入世界自然遗产，以高山湖泊与钙华彩池著称。',
            form: '树正、日则、则查洼三沟串联梯级海子，钙华堤埂拦水成池；看湖水蓝绿层次、瀑滩叠水与针叶林带。',
            role: '高寒钙华湖泊与森林生态的典型代表，山地水景的顶级样本。',
            link: '景区内观光车按沟线停靠；长海、五彩池、诺日朗瀑布为重点，冬季部分区域关闭。',
            audience: [['fa-camera', '风光摄影'], ['fa-person-hiking', '峡谷徒步'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先乘车到高海拔海子看整体沟谷走向，再沿栈道逐站看彩池与叠瀑；晴天湖面色彩最饱和，高海拔注意保暖。'
        },
        '峨眉山': {
            bg: '普贤菩萨道场，中国四大佛教名山之一，1996 年随乐山大佛列入世界文化与自然双重遗产。',
            form: '主峰金顶云海日出，山麓报国寺、万年寺沿登山轴线分布；看山地植被垂直分带、寺院建筑与山顶云海佛光。',
            role: '佛教名山与高山生态结合的代表，川西山岳与人文景观地标。',
            link: '金顶索道另计；半山万年寺、清音阁可步行游览，山下可接乐山。',
            audience: [['fa-person-hiking', '登山徒步'], ['fa-camera', '风光摄影'], ['fa-scroll', '宗教研学'], ['fa-heart', '情侣出行']],
            angle: '先在半山看植被随海拔变化，再上金顶望云海与雪峰；日出、佛光受天气影响，猴群不投喂不逗弄。'
        },
        '乐山大佛': {
            bg: '岷江、青衣江、大渡河汇流处的岩壁石刻弥勒坐像，唐代开凿，1996 年随峨眉山列入世界文化与自然双重遗产。',
            form: '大佛依凌云山崖壁凿成，脚踏江流，螺髻、双耳与袈裟纹路刻于岩面；看石刻尺度、崖壁排水结构与江湾地形。',
            role: '中国现存规模最大的摩崖石刻弥勒造像，唐代石刻工程与江防文化的遗存。',
            link: '可乘船在江面仰望大佛全貌，也可沿栈道下到佛脚；与峨眉山安排在同一线。',
            audience: [['fa-scroll', '石刻研学'], ['fa-camera', '文物摄影'], ['fa-children', '亲子游'], ['fa-users', '首次到访']],
            angle: '江上游船看大佛整体比例与临江姿态，再到佛脚抬头仰望体量；留意崖壁上的排水沟渠如何保护石刻。'
        },
        '都江堰': {
            bg: '战国秦昭王时期由李冰父子主持修建的岷江水利工程，沿用至今，2000 年列入世界文化遗产。',
            form: '鱼嘴分水堤、飞沙堰、宝瓶口三段配合分流排沙；看内江外江分流、弯道地形与渠首工程布局。',
            role: '中国古代水利工程的经典范例，体现顺势治水的工程智慧，成都平原灌区的源头。',
            link: '与青城山同属青城山—都江堰世界遗产；可安澜索桥跨内江，二王庙纪念李冰父子。',
            audience: [['fa-scroll', '工程研学'], ['fa-children', '亲子研学'], ['fa-person-walking', '步行游览'], ['fa-mug-hot', '慢旅行']],
            angle: '先在鱼嘴处看岷江如何被分流内外江，再到宝瓶口观察内江进入平原的收口；读懂分水—排沙—引水三段配合。'
        },
        '青城山': {
            bg: '道教名山，东汉张道陵在此创立五斗米道，2000 年随都江堰列入世界文化遗产，分前山道观区与后山幽林区。',
            form: '山道藏于浓荫翠谷，道观沿登山轴线排布，山门、天师洞、上清宫依次而上；看山道古木、道观院落与山林幽气。',
            role: '道教发源地之一，山林清幽与道教宫观结合的川西名山。',
            link: '前山看道观文化，后山看峡谷幽林；与都江堰安排同一天。',
            audience: [['fa-person-hiking', '山林徒步'], ['fa-mug-hot', '慢旅行'], ['fa-scroll', '宗教研学'], ['fa-heart', '情侣出行']],
            angle: '前山沿轴线看道观与碑刻，后山沿溪谷听泉看林；山道阴凉湿润，穿防滑鞋，别错过天师洞古桧。'
        },
        '丽江古城': {
            bg: '纳西族聚居的古城，宋元时期形成集镇，1997 年列入世界文化遗产，依山傍水而建。',
            form: '四方街为中心，玉河水分支穿街过巷，石桥、水车与纳西民居错落；看水系街巷骨架、瓦屋顶院落与铺面格局。',
            role: '西南少数民族古城与茶马古道商贸记忆的代表，纳西文化展示窗口。',
            link: '四方街是入口，往五一街、七一街走更安静；清晨与夜里是两种气质，可接玉龙雪山。',
            audience: [['fa-camera', '古城摄影'], ['fa-mug-hot', '慢旅行'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先沿玉河看水系如何分叉穿村入户，再钻支巷看院落与铺面；清晨无团队时水面与街巷最安静。'
        },
        '大理古城': {
            bg: '苍山洱海间的古城，唐代南诏、宋代大理国都城所在，现存城池为明清格局延续。',
            form: '南北城楼与棋盘街巷贯通，城墙、门楼与白族民居照壁、门头错落；看街巷格局、白族建筑彩绘与苍山方向的视线。',
            role: '苍山洱海间的历史城址，白族文化与茶马古道商贸的集中片区。',
            link: '洱海门步行可达洱海西岸，苍山门接苍山索道；可接喜洲古镇与双廊沿海一线。',
            audience: [['fa-camera', '古城摄影'], ['fa-heart', '情侣出行'], ['fa-mug-hot', '慢旅行'], ['fa-users', '结伴出游']],
            angle: '先在城门或五华楼望苍山横亘与城内瓦顶，再走人民路、洋人街看白族铺面；傍晚往洱海西岸看落日映苍山。'
        },
        '漓江': {
            bg: '桂林至阳朔段的喀斯特江流，两岸峰林环抱，是桂林山水的主体，20 元人民币背景取景于兴坪段。',
            form: '河道弯曲穿行于石灰岩峰丛之间，江岸滩涂、竹林与渔村错落；看峰林临水的倒影、江湾弯转与山岸层次。',
            role: '中国喀斯特山水与山水画意境的典型代表，桂北山水意象原型。',
            link: '杨堤—兴坪段最经典，20 元取景地在兴坪；游船与竹筏是两种体验，可接遇龙河。',
            audience: [['fa-camera', '风光摄影'], ['fa-heart', '情侣出行'], ['fa-person-hiking', '江畔徒步'], ['fa-users', '结伴出游']],
            angle: '船上先记住两岸峰林整体走向与江面弯转，再拍山峰倒影与渔村竹林；清晨江面有薄雾，光线柔和。'
        },
        '黄果树瀑布': {
            bg: '贵州白水河上的喀斯特大瀑布，是贵州标志性自然景观，属珠江水系打邦河支流。',
            form: '河水从断崖跌落成宽幅水帘，瀑后有水帘洞可穿行，周围犀牛潭、螺蛳滩叠水相连；看瀑面宽度、水势与钙华崖壁。',
            role: '中国西南喀斯特瀑布的代表，黔中山水地标。',
            link: '大瀑布、陡坡塘、天星桥三景区相连；水帘洞需排队，丰水期水势最壮。',
            audience: [['fa-camera', '风光摄影'], ['fa-person-hiking', '峡谷徒步'], ['fa-children', '亲子游'], ['fa-users', '结伴出游']],
            angle: '先在对岸观景台看瀑布整体宽幅与跌落弧线，再穿水帘洞从瀑后看外水；丰水期水雾大，备好防雨衣物。'
        },
        '黄鹤楼': {
            bg: '武昌蛇山临长江的江南名楼，历史上屡毁屡建，现存建筑为 1985 年在旧址附近重建。',
            form: '五层攒尖顶楼阁，层层外展回廊，立于蛇山头江高地；看楼体层叠轮廓、飞檐与俯瞰长江大桥与江面的视野。',
            role: '江南三大名楼之一，因诗文传说与长江胜景并称的武汉地标。',
            link: '蛇山步道可串联长春观；楼下长江大桥可步行过江，接汉口江滩与户部巷。',
            audience: [['fa-scroll', '人文研学'], ['fa-camera', '古楼摄影'], ['fa-heart', '情侣出行'], ['fa-users', '首次到访']],
            angle: '先在江边望楼阁五层轮廓与蛇山位置，登楼俯瞰长江与大桥交汇；傍晚江风与落日江面最开阔，夜游另售票。'
        },
        '武当山': {
            bg: '鄂西北道教名山，供奉真武大帝，明代大修宫观，1994 年古建筑群列入世界文化遗产。',
            form: '金顶建于天柱峰绝顶，紫霄宫、南岩宫沿登山古道排布，宫观依山就势；看山林宫观布局、古殿木构与峰顶石城。',
            role: '真武信仰与道教建筑体系的代表，山岳道教建筑群的典范。',
            link: '乌鸦岭至金顶古道串联南岩、朝天宫；山脚玉虚宫、遇真宫可作补充参观。',
            audience: [['fa-person-hiking', '登山徒步'], ['fa-scroll', '宗教研学'], ['fa-camera', '古建摄影'], ['fa-mug-hot', '慢旅行']],
            angle: '先看山脚宫观的规制布局，再沿古道上行看建筑随山势跌落；金顶天柱峰绝顶看金殿与云海，台阶较长量力而行。'
        },
        '平遥古城': {
            bg: '明清时期的晋中县城，城墙街巷与票号商号保存完整，1997 年列入世界文化遗产，是晋商票号的发源地之一。',
            form: '方形城墙围合老城，南大街贯通南北，票号、镖局、县衙与庙宇沿街分布；看城砖城墙、四合院门楼与商铺铺面格局。',
            role: '中国北方明清县城格局与晋商金融文化的活态标本，古城保护代表。',
            link: '城墙—票号—县衙是主线，通票按景点计；晚上可看《又见平遥》，需另购票。',
            audience: [['fa-scroll', '晋商研学'], ['fa-camera', '古城摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
            angle: '先登城墙看老城方正格局与街巷肌理，再钻南大街看票号铺面与四合院门楼；镖局、票号的柜台与账房比门面更有信息。'
        },
        '云冈石窟': {
            bg: '北魏皇家开凿的石窟群，位于大同武周山，始凿于北魏文成帝时期，2001 年列入世界文化遗产。',
            form: '东部、中部、西部洞窟沿砂岩山崖排布，大像浮雕与供养人、佛龛并列；看造像面相、衣纹、洞窟形制与石刻风化痕迹。',
            role: '北魏佛教艺术与中西雕刻融合的代表，中国早期石窟艺术的重要遗存。',
            link: '可与大同市内华严寺、善化寺串联；石窟沿崖壁一字展开，按编号顺序参观最连贯。',
            audience: [['fa-scroll', '石刻研学'], ['fa-camera', '文物摄影'], ['fa-children', '亲子研学'], ['fa-book', '历史爱好者']],
            angle: '先看中部大像窟的主尊体量与面相，再退到侧面看比例与衣纹；西小窟看佛龛与供养人题记，洞内禁闪光。'
        },
        '龙门石窟': {
            bg: '北魏至唐代连续开凿的石窟群，沿伊河两岸西山、东山分布，2000 年列入世界文化遗产。',
            form: '宾阳三洞、奉先寺卢舍那大佛等沿崖壁排布，造像由北魏秀骨清像转向唐代丰满圆润；看龛像布局、造像面相与题记刻字。',
            role: '中国石窟艺术鼎盛期的代表，唐代石刻造像与龙门题记书法的珍贵遗存。',
            link: '西山石窟为主线，隔河望东山与香山寺；可接洛阳老城与白马寺一线。',
            audience: [['fa-scroll', '石刻研学'], ['fa-camera', '文物摄影'], ['fa-children', '亲子研学'], ['fa-book', '历史爱好者']],
            angle: '先在对岸望西山崖壁窟龛整体排布，再沿步道逐洞看奉先寺大佛面相与唐代造像；留意崖壁题记与碑刻，洞内禁闪光。'
        },
        '少林寺': {
            bg: '嵩山少室山下的禅宗寺院，北魏太和十九年（495）始建，是汉传佛教禅宗祖庭，也是少林武术的发源地。',
            form: '山门—天王殿—大雄宝殿—方丈院沿轴线排布，塔林存放历代高僧墓塔；看寺院木构、碑刻与墓塔砖雕形制。',
            role: '禅宗祖庭与少林武术文化的代表，嵩山人文核心地标。',
            link: '塔林在寺西约一里；可接嵩山中岳庙、观星台，武术表演按场次开放。',
            audience: [['fa-scroll', '宗教研学'], ['fa-users', '首次到访'], ['fa-children', '亲子游'], ['fa-camera', '古建摄影']],
            angle: '先沿寺院轴线看殿堂与碑刻，再到塔林看高低错落的高僧墓塔；武术表演提前查场次，寺内不喧哗。'
        },
        '莫高窟': {
            bg: '敦煌鸣沙山东麓的石窟寺，前秦建元二年（366）始凿，历北魏至元连续营建，1987 年列入世界文化遗产。',
            form: '七百多个洞窟沿崖壁分层排布，壁画、彩塑与藻井保存于窟内；看泥塑佛像、经变壁画构图与飞天、供养人像。',
            role: '丝绸之路佛教艺术与中西文化交流的宝库，中国壁画彩塑艺术的最高代表之一。',
            link: '先看数字展示中心再进洞窟；旺季需提前多日预约，洞窟内禁闪光、禁录像。',
            audience: [['fa-scroll', '艺术研学'], ['fa-camera', '壁画观赏'], ['fa-children', '亲子研学'], ['fa-book', '历史爱好者']],
            angle: '按预约场次跟随讲解员进指定洞窟，先记住整窟构图中心再看彩塑与壁画细节；壁画颜色与线条在窟内暗光下细看。'
        },
        '鸣沙山月牙泉': {
            bg: '敦煌城南沙漠中的沙丘与泉水共生景观，沙岭环抱一弯泉水，是河西走廊沙漠奇观。',
            form: '高大沙山环抱月牙形泉水，芦苇与灌木沿泉岸生长；看沙丘山脊曲线、沙坡纹理与泉水在沙地中的轮廓。',
            role: '西北沙漠地貌与绿洲泉水共生的代表，敦煌西线沙景地标。',
            link: '与莫高窟同在敦煌南郊，可安排同一天；骑骆驼、滑沙为体验项目，日落沙丘光线最好。',
            audience: [['fa-camera', '沙漠摄影'], ['fa-person-hiking', '沙丘徒步'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先登沙山山脊望月牙泉全貌与沙丘环抱关系，再下到泉岸看芦苇与水面；傍晚侧光下沙脊明暗分明，注意防沙护好相机。'
        },
        '嘉峪关': {
            bg: '明长城西端的重要关隘，明初洪武年间修筑，扼守河西走廊咽喉，号称天下第一雄关。',
            form: '内城、瓮城、罗城与城墙关楼层层套叠，城墙包砖、敌楼与马面完备；看城门层级、垛口与戈壁上的城垣走向。',
            role: '明代西北边防体系与长城关城建筑的代表，丝路咽喉的军事遗存。',
            link: '关城可悬壁长城、长城第一墩串成西线；城外戈壁望祁连雪山方向视野开阔。',
            audience: [['fa-scroll', '长城研学'], ['fa-camera', '关城摄影'], ['fa-children', '亲子研学'], ['fa-users', '首次到访']],
            angle: '先在关外望关城层层套叠的轮廓，再进瓮城看城门回转结构；登城望戈壁与远处雪山，理解其扼守走廊的地形位置。'
        },
        '布达拉宫': {
            bg: '拉萨红山之上的宫堡式建筑群，吐蕃时期松赞干布为文成公主始建，现存主体为清初重建，1994 年列入世界文化遗产。',
            form: '白宫、红宫叠山而建，金顶殿宇与厚实宫墙顺山势抬升；看宫堡层级、碉房墙体与金顶铜瓦装饰。',
            role: '藏传佛教政教合一的核心建筑，西藏宗教与建筑艺术的最高代表。',
            link: '按预约时段入场，内部不走回头路；山下可接药王山观景台拍经典布达拉宫视角，大昭寺、八廓街相邻。',
            audience: [['fa-scroll', '藏文化研学'], ['fa-camera', '宫堡摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
            angle: '先在药王山或广场望红山宫堡整体层级，再按预约动线进殿看灵塔、壁画与金顶；台阶较多，提前一天适应海拔，殿内不拍照。'
        },
        '大昭寺': {
            bg: '拉萨八廓街中心的吐蕃时期寺院，供奉释迦牟尼十二岁等身像，是藏传佛教各教派共尊的圣地。',
            form: '金顶、碉房院落与经堂沿中心佛殿展开，回廊壁画与转经道环绕；看鎏金铜瓦屋顶、梁柱彩绘与佛殿布局。',
            role: '藏传佛教信仰中心与拉萨城市起源的核心，八廓古城的精神地标。',
            link: '寺外环形八廓街是转经道；可接小昭寺、药王山与布达拉宫步行一线。',
            audience: [['fa-scroll', '宗教研学'], ['fa-camera', '古建摄影'], ['fa-mug-hot', '慢旅行'], ['fa-users', '首次到访']],
            angle: '先绕八廓街一圈看寺内金顶与信徒转经，再进主殿看等身像与壁画；跟随顺时针方向，殿内保持安静不拍照。'
        },
        '喀纳斯': {
            bg: '阿尔泰山深处的泰加林与冰川湖群落，布尔津河上游，图瓦人村落坐落湖畔，是北疆山地生态代表。',
            form: '月牙形湖泊嵌于针叶林山谷，观鱼台可俯瞰湖湾，禾木、白哈巴村落散布林间；看湖水色带、林线与山谷层次。',
            role: '西伯利亚泰加林在中国境内的典型片段，北疆高山湖泊与村落景观代表。',
            link: '景区车分换乘段；观鱼台登台阶看全湖，神仙湾、月亮湾、卧龙湾沿河谷依次停靠。',
            audience: [['fa-camera', '风光摄影'], ['fa-person-hiking', '山谷徒步'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先到观鱼台记住湖湾与山谷整体走向，再沿三湾栈道看河水与森林色彩；晨雾绕林湾最出片，秋季金黄与夏季浓绿差别明显。'
        },
        '广州塔': {
            bg: '珠江新城珠江南岸的现代观光高塔，2010 年建成，是广州城市新中轴线与珠江岸线的地标。',
            form: '扭曲网格钢结构塔身，观景平台与摩天轮分置不同高度；看塔身网格线条、悬臂结构与俯瞰珠江两岸的视野。',
            role: '现代广州城市形象的代表，珠江夜游与城市高空观景地标。',
            link: '日落前上塔能看白天与夜景两种面貌；花城广场、海心沙在北岸，珠江游轮在塔下码头。',
            audience: [['fa-users', '首次到访'], ['fa-camera', '城市摄影'], ['fa-heart', '情侣出行'], ['fa-children', '亲子游']],
            angle: '先在花城广场望塔与珠江新城天际线整体关系，再上观景层俯瞰珠江与两岸；摩天轮与观景台分开收费，黄昏上塔最划算。'
        },
        '陈家祠': {
            bg: '清光绪年间建成的陈氏宗族宗祠，又称陈氏书院，是岭南祠堂建筑与装饰工艺的集大成者。',
            form: '三进院落聚贤堂为主轴，屋脊陶塑、砖雕、石雕、木雕、灰塑与铸铁遍布梁柱檐墙；看三雕两塑一铸的细部装饰。',
            role: '岭南民间建筑装饰艺术的代表，广州民俗与宗族文化的重要场馆。',
            link: '位于荔湾西关，可接荔湾湖、永庆坊与沙面；祠内常设岭南工艺与民俗陈列。',
            audience: [['fa-scroll', '建筑研学'], ['fa-camera', '细部摄影'], ['fa-children', '亲子研学'], ['fa-mug-hot', '慢旅行']],
            angle: '先看三进院落中轴格局，再低头看屋脊陶塑与抬头看梁架木雕；屋脊陶塑是最容易被错过的细节，门票便宜值得细看。'
        },
        '洪崖洞': {
            bg: '嘉陵江畔的山地吊脚楼建筑群，依山就势层层叠叠，是重庆山城地貌与江景夜景的代表片区。',
            form: '十一层建筑顺崖壁抬升，吊脚楼阳台、栈道与廊檐错落，顶部接滨海路、底部临嘉陵江；看山城层叠立面与临江栈道。',
            role: '重庆立体山城风貌与江景夜景的城市地标，巴渝吊脚楼风格的现代重构。',
            link: '从顶层往下逛更省力；最佳机位在千厮门大桥与对岸江北嘴，亮灯约 19:00 后。',
            audience: [['fa-camera', '夜景摄影'], ['fa-moon', '夜游散步'], ['fa-heart', '情侣出行'], ['fa-users', '结伴出游']],
            angle: '先在千厮门大桥或对岸望整组吊脚楼层叠临江的轮廓，再从上往下逐层逛；亮灯后灯火与江面倒影最出片，高峰时段挤。'
        },
        '磁器口': {
            bg: '嘉陵江畔的明清码头古镇，昔为川东水运商贸集镇，如今保留老街、作坊与茶馆格局。',
            form: '主街沿坡而上，两侧木结构铺面与吊脚楼错落，巷巷通向江边码头；看青石板街面、木铺面与临江巷道骨架。',
            role: '川东码头商埠与老重庆市井生活的遗存片区，巴渝古镇代表。',
            link: '主街商业化重，往码头与支巷走；陈麻花等老店排队结构比味道更能说明问题，可接歌乐山。',
            audience: [['fa-mug-hot', '慢旅行'], ['fa-camera', '古镇摄影'], ['fa-utensils', '顺路小吃'], ['fa-users', '结伴出游']],
            angle: '先沿主街记住街巷坡向与铺面格局，再钻支巷找通向江边的码头巷；茶馆看本地人的日常摆龙门阵，比主街打卡更接近真实。'
        },
        '宽窄巷子': {
            bg: '成都清代少城留存的街巷片区，宽巷子、窄巷子、井巷子平行排布，由清代八旗营房格局演变而来。',
            form: '青砖墙院门与川西院落错落，宽巷子看院落茶铺，窄巷子看小店工坊，井巷子看文化墙；看少城街巷肌理与院门门头。',
            role: '成都少城历史街巷与慢生活方式的代表，川西市井与休闲文化窗口。',
            link: '往支巷走价格更正常；可接琴台路、锦里与武侯祠一线。',
            audience: [['fa-mug-hot', '慢旅行'], ['fa-camera', '街巷摄影'], ['fa-utensils', '茶馆小吃'], ['fa-heart', '情侣出行']],
            angle: '宽巷子看院落与茶铺，窄巷子看小店门头，井巷子看砖墙装饰；往侧支巷走避开主街人流，盖碗茶坐下来比穿行更成都。'
        },
        '锦里': {
            bg: '武侯祠旁的仿古商业街，以三国文化与川西小吃为主题，与武侯祠文物区相邻连通。',
            form: '老街铺面、红灯笼与川西木结构廊檐错落，小吃铺、戏台与茶馆沿街排布；看川西街市立面与夜间灯笼氛围。',
            role: '成都三国文化市井体验与川西小吃集中片区，武侯祠历史街区的延伸。',
            link: '紧邻武侯祠，可一并参观；傍晚亮灯后最有氛围，小吃按份买、多样尝，正门第一排通常最贵。',
            audience: [['fa-utensils', '吃货'], ['fa-moon', '夜游散步'], ['fa-camera', '街景摄影'], ['fa-users', '结伴出游']],
            angle: '先逛武侯祠看三国史迹，再进锦里看街市与小吃；傍晚灯笼亮起后氛围最好，多走支巷比价，别在正门第一排一次点满。'
        }
    };

    function profileOfSpot(n) {
        var best = '';
        Object.keys(SPOT_PROFILE).forEach(function (k) {
            if (n && n.indexOf(k) >= 0 && k.length > best.length) best = k;
        });
        return best ? SPOT_PROFILE[best] : null;
    }
    var DISH_NOTE = {
        '盐水鸭': '南京人中秋前后吃桂花鸭，讲究皮白肉嫩、咸鲜回甜；切片冷吃，别加热。',
        '小笼包': '先开窗、后喝汤，再蘸醋吃皮；刚出笼最烫，别一口吞。',
        '生煎': '底脆、汤足，先咬小口放气；趁热吃，放凉后底部会回软。',
        '白切鸡': '看的是皮爽肉滑与骨中带血，蘸姜葱蓉最地道；冷吃比热吃更见功力。',
        '烧鹅': '看皮脆、汁清、肉不柴，斩件后趁热吃；配酸梅酱解腻。',
        '叉烧': '半肥瘦最香，焦边是灵魂；配白饭或捞面，别只当冷盘。',
        '火锅': '先荤后素、先淡后浓；牛油锅越煮越辣，中途加汤别加冷水。',
        '小面': '重庆小面吃的是麻辣鲜香，面条偏硬；先拌匀再吃，别让汤泡软。',
        '串串': '按签计价，先问清每签价格；干碟与油碟是两种吃法。',
        '兔头': '成都人吃兔头讲“掰、啃、吸”，麻辣与五香各一半最稳；戴手套。',
        '麻婆豆腐': '麻、辣、烫、香、酥、嫩、鲜、活八字诀；配米饭，趁烫吃。',
        '回锅肉': '灯盏窝是标准，肥而不腻；蒜苗最后下锅，断生就起。',
        '担担面': '干拌为主，芝麻酱与红油要拌匀；面少料足，吃完再加面。',
        '肉夹馍': '腊汁肉肥瘦相间，白吉馍要现烤；先咬一口再灌肉汁。',
        '羊肉泡馍': '自己掰馍越小越入味，掰完再煮；配糖蒜与辣酱。',
        '热干面': '芝麻酱要拌匀，趁热吃；配蛋酒或豆浆解干。',
        '豆皮': '三鲜豆皮看蛋皮金黄、糯米软糯；趁热吃，凉了会硬。',
        '臭豆腐': '闻着臭吃着香，外脆内嫩；现炸现吃，酱汁别泡太久。',
        '螺蛳粉': '酸笋是灵魂，先喝汤再吃粉；辣度可调，第一次别点特辣。',
        '过桥米线': '先下生肉再下菜，最后下米线；汤面有油封着，别急着喝。',
        '酸汤鱼': '先喝酸汤开胃，再吃鱼；蘸水是第二层味道，别省略。',
        '肠粉': '看米皮薄滑、酱油清甜；现蒸现吃，放凉会变韧。',
        '虾饺': '看皮薄透亮、褶子均匀；趁热吃，凉了皮会硬。',
        '牛肉丸': '潮汕牛肉丸讲弹牙，清汤煮最见本味；蘸沙茶酱。',
        '佛跳墙': '汤浓而不腻，先喝汤再吃料；价格高，按人份点。',
        '沙茶面': '沙茶酱是主味，加海鲜或猪肝按喜好；先喝一口汤再拌面。',
        '烤鸭': '片鸭先蘸糖，再卷饼配葱丝黄瓜；鸭架可做汤或椒盐。',
        '炸酱面': '酱要炸透，菜码要齐；拌匀后大口吃，配蒜更地道。',
        '锅包肉': '看外壳酥脆、酸甜平衡；趁热吃，放凉会回软。',
        '大盘鸡': '先吃鸡，再下皮带面拌汤汁；中份通常够 3-4 人。',
        '手抓饭': '羊肉、胡萝卜与米一起焖，油香足；配酸奶解腻。',
        '羊肉串': '现穿现烤，肥瘦相间；孜然与辣椒面最后撒。',
        '酥油茶': '咸香浓郁，第一口可能不习惯；配糌粑小口喝。'
    };
    function pickNote(table, n) {
        var best = '';
        Object.keys(table).forEach(function (k) {
            if (n.indexOf(k) >= 0 && k.length > best.length) best = k;
        });
        return best ? table[best] : '';
    }
    var LEVEL5 = ['故宫', '颐和园', '天坛', '八达岭长城', '明孝陵', '中山陵', '夫子庙', '西湖',
        '拙政园', '黄山', '泰山', '华山', '峨眉山', '乐山大佛', '九寨沟', '黄龙', '张家界',
        '天门山', '漓江', '布达拉宫', '大昭寺', '青海湖', '鸣沙山', '月牙泉', '云冈石窟',
        '龙门石窟', '平遥古城', '丽江古城', '鼓浪屿', '武夷山', '庐山', '三清山', '千岛湖',
        '普陀山', '乌镇', '周庄', '同里', '长白山', '喀纳斯', '天山天池', '都江堰', '青城山',
        '武当山', '神农架', '恩施大峡谷', '蜈支洲岛', '西递', '宏村', '龙脊梯田', '黄果树',
        '荔波小七孔', '梵净山', '麦积山', '崆峒山', '沙坡头', '镇北堡', '喀什古城', '崂山',
        '蓬莱阁', '刘公岛', '台儿庄', '瘦西湖', '鼋头渚', '木兰围场', '承德避暑山庄'];
    var WORLD_HERITAGE = ['故宫', '长城', '颐和园', '天坛', '明孝陵', '苏州古典园林', '拙政园',
        '留园', '西湖', '黄山', '泰山', '华山', '峨眉山', '乐山大佛', '九寨沟', '黄龙', '武当山',
        '布达拉宫', '大昭寺', '莫高窟', '云冈石窟', '龙门石窟', '平遥古城', '丽江古城', '鼓浪屿',
        '武夷山', '庐山', '三清山', '开平碉楼', '福建土楼', '西递', '宏村', '龙脊梯田', '都江堰',
        '青城山', '大足石刻', '元阳梯田', '丝绸之路', '京杭大运河'];

    function hasAny(list, n) {
        for (var i = 0; i < list.length; i++) if (n.indexOf(list[i]) >= 0) return true;
        return false;
    }
    function ticketFor(n) {
        if (n === NAME && txt(info.ticket)) {
            var raw = txt(info.ticket);
            if (/免费/.test(raw)) return 0;
            var m = raw.match(/(\d{2,5})/);
            if (m) return parseInt(m[1], 10);
        }
        if (catOf(n) === 'museum') return 0;
        var best = '', price = -1;
        Object.keys(PRICE_TABLE).forEach(function (k) {
            if (n.indexOf(k) >= 0 && k.length > best.length) { best = k; price = PRICE_TABLE[k]; }
        });
        if (price >= 0) return price;
        if (hasAny(FREE_KEYS, n)) return 0;
        return -1;
    }
    var TICKET = ticketFor(NAME);
    function ticketText() {
        if (txt(info.ticket)) return info.ticket;
        if (TICKET === 0) return '免费开放（体验项目另计）';
        if (TICKET > 0) return '¥' + TICKET + ' 起（参考）';
        return '以景区公告为准';
    }
    function needReserve(n) { return hasAny(RESERVE_KW, n); }
    function miniOf(n) {
        var mini = '';
        Object.keys(WECHAT_MINI).forEach(function (k) {
            if (n.indexOf(k) >= 0 && k.length > mini.length) mini = WECHAT_MINI[k];
        });
        return mini || (CITY_SHORT + '文旅') + '';
    }
    function levelText() {
        if (IS_FOOD) return '';
        if (hasAny(LEVEL5, NAME)) return '国家 5A 级景区（参考）';
        if (hasAny(WORLD_HERITAGE, NAME)) return '世界文化遗产（参考）';
        if (cat === 'museum') return '公共文化场馆（多为免费预约）';
        if (cat === 'heritage') return '人文古迹 / 重点文保单位';
        if (cat === 'nature') return '风景名胜区 / 自然保护地';
        return '城市代表性景点';
    }
    function hoursText() {
        var hit = pickNote(HOURS, NAME);
        if (hit) return hit;
        if (cat === 'museum') return '09:00-17:00（16:00 停止入馆；周一闭馆，节假日除外）';
        if (cat === 'nature') return '旺季 07:00-18:00 / 淡季 08:00-17:00';
        if (cat === 'heritage') return '旺季 08:00-17:30 / 淡季 08:30-17:00';
        if (cat === 'street') return '街区全天开放；店铺约 10:00-22:00';
        return '全天开放；亮灯/观景约 18:00-22:00';
    }
    function intensityOf(c) {
        return { nature: '中高 · 有步行与爬升', heritage: '中等 · 以步行为主',
            museum: '轻松 · 室内步行', street: '轻松 · 城市漫步', landmark: '轻松 · 短时停留' }[c] || '中等';
    }
    function familyOf(c) {
        return { nature: '亲子友好，避开长距离爬升', heritage: '适合亲子研学，台阶较多',
            museum: '亲子友好，可推车', street: '亲子友好，注意夜间人流',
            landmark: '亲子友好，停留时间短' }[c] || '一般';
    }
    function coordsOf() {
        var map = window.CITY_SPOT_COORDS || {};
        var c = map[(info.city || '') + '·' + NAME] || map[NAME] ||
            (detail && detail.coords) || null;
        if (!c || c.length < 2) return '以地图导航为准';
        return (+c[1]).toFixed(4) + '°N, ' + (+c[0]).toFixed(4) + '°E';
    }
    var COORD = coordsOf();
    var CH = (window.CITY_HISTORY || {})[info.city] || (window.CITY_HISTORY || {})[CITY_SHORT] || null;
    function cityHistoryBlock() {
        if (!CH) return '';
        var eras = (CH.eras || []).slice(0, 3).map(function (e) {
            return '<li><b>' + esc(e[1]) + '</b><span>' + esc(e[0]) + ' · ' + esc(e[2]) + '</span></li>';
        }).join('');
        return '<div class="sd-cityhist"><b>' + esc(CITY_SHORT || info.city) + '的城市背景</b>' +
            '<p>' + esc(CH.summary || '') + '</p>' +
            (eras ? '<ul>' + eras + '</ul>' : '') +
            '<p class="sd-aside-note">以上为所在城市的历史沿革，用于理解景点所处的城市语境；景点自身的年代、形制与地位，以本条上方的历史与人文卡片为准。</p></div>';
    }

    var NATURE_TYPES = [
        [/湖|潭|海子/, '湖泊'], [/峡|谷/, '峡谷'], [/瀑布/, '瀑布'], [/湿地/, '湿地'],
        [/草原/, '草原'], [/沙漠|沙坡|戈壁|沙湖/, '沙漠 / 沙地'], [/岛|湾|沙滩|海滩|海岸/, '海岸 / 海岛'],
        [/冰川/, '冰川'], [/梯田/, '梯田'], [/森林/, '森林'], [/洞/, '溶洞'],
        [/温泉/, '温泉'], [/江|河|溪|洲/, '河流'], [/山|峰|岭|岩/, '山地']
    ];
    var NATURE_FORM = {
        '湖泊': '湖泊的形态来自断陷、堰塞或冰川作用，水深、矿物质与岸边植被共同决定水色。看湖不只看水面，岸线曲线、浅滩与远山层次才是构图关键。',
        '峡谷': '峡谷是河流长期下切与地壳抬升共同雕刻的结果。谷壁的岩层像书页一样记录地质年代，越靠近谷底越能看清水流侵蚀的痕迹。',
        '瀑布': '瀑布出现在河床硬度差异明显的河段：软岩被冲走，硬岩形成坎。水量随季节变化，雨季气势最足，枯水期则更容易看清岩壁结构。',
        '湿地': '湿地是水与陆地之间的过渡带，芦苇、浅滩与水道构成复杂生境。它也是候鸟停歇地，观鸟要远、要静，不要投喂。',
        '草原': '草原的形成取决于降水与放牧历史，草甸、坡地与远处山脊构成层次。花期集中在夏季，秋季则转为金黄色调。',
        '沙漠 / 沙地': '沙丘的走向由主导风向决定，迎风坡缓、背风坡陡。沙面纹理每天都被风改写，清晨侧光最容易拍出层次。',
        '海岸 / 海岛': '海岸线的形态由海浪、潮汐与岩石硬度共同决定。潮间带生态脆弱，退潮时不要翻石捉蟹，也不要踩踏珊瑚与海草。',
        '冰川': '冰川是多年积雪压实后缓慢流动的冰体，冰舌末端的颜色与裂隙记录着消融速度。冰川区域禁止越过警戒线，气候变暖使敏感度更高。',
        '梯田': '梯田是山地农业长期适应坡地的结果，水路、田埂与村落共同构成系统。灌水期镜面效果最好，收稻前后则是金色层次。',
        '森林': '森林的层次从林冠到地被，光线穿过树冠形成斑驳光影。看森林要抬头看冠层，也要低头看腐殖质与菌类。',
        '溶洞': '溶洞由地下水溶蚀可溶性岩石形成，钟乳石与石笋的生长速度极慢，触摸会终止其生长。洞内湿滑，跟紧步道。',
        '温泉': '温泉水来自深部地热，矿物质组成决定水色与气味。泡汤前后补水，单次不超过 20 分钟。',
        '河流': '河流塑造了河谷与冲积平原，弯道、浅滩与河心洲是最有信息量的地貌。汛期水流快，不要下河。',
        '山地': '山地由地壳抬升与风化剥蚀共同塑造，岩性、坡向与海拔决定植被差异。同一座山，阴坡与阳坡常常是两种景观。'
    };
    var HERITAGE_TYPES = [
        [/石窟|窟/, '石窟'], [/塔/, '古塔'], [/陵|墓|俑|坑/, '陵寝'], [/城墙|关|门/, '城防'],
        [/古镇|古城|村/, '聚落'], [/园|苑|圃/, '古典园林'], [/书院/, '书院'],
        [/寺|庙|庵|观/, '宗教建筑'], [/宫|殿|衙|署/, '宫殿官署'],
        [/祠|故居|府|纪念馆/, '名人纪念'], [/楼|阁|桥/, '楼阁 / 桥梁'], [/教堂/, '教堂']
    ];
    var HERITAGE_FORM = {
        '石窟': '石窟的价值集中在窟形、造像组合与衣纹风格。先看大像的轮廓与手印，再退到侧面看比例；题记与供养人像往往在窟门两侧，最容易被忽略。',
        '古塔': '塔的层数、平面形状（方形/八角）与檐下斗拱是断代的三条线索。绕塔一周，注意每层门窗的收分与砖雕细节。',
        '陵寝': '陵寝看的是轴线：神道—陵门—享殿—宝顶依次展开，石像生的排列与题材反映礼制。先走轴线再回头补细节，最不容易乱。',
        '城防': '现存城墙多为明清包砖，墙砖铭文、马面间距与瓮城形制是判断年代的硬线索。登城后先看整体走向，再找一处垛口看城外。',
        '聚落': '古镇的骨架是街巷、水系、宗祠与码头。主街做买卖，支巷才是日常生活；祠堂与庙宇通常落在风水与交通的关键位置。',
        '书院': '书院的空间秩序是讲堂—藏书—祭祀—生活，院落尺度克制。看匾额、碑记与楹联，比看建筑本身更能读出它的学术脉络。',
        '宗教建筑': '寺院多沿山门—天王殿—大雄宝殿—藏经楼的轴线展开，现存殿宇常见明清重修痕迹。始建年代与重修记录，通常能在山门内或殿前的碑廊核对。',
        '名人纪念': '这类建筑的价值在于人物与地方的关系：出生、任职、贬谪或归隐。看展陈里的书信、手稿与旧照，比看复原家具更有信息量。',
        '楼阁 / 桥梁': '楼阁与桥梁往往是地方工程与审美的结合。看结构（木构/石拱）、看题刻、看它与水口或城市轴线的位置关系。',
        '教堂': '近代教堂常见哥特式、罗马式或折衷样式，看立面构图、玫瑰花窗与材料工艺，也能读到当时的建造技术。',
        '古典园林': '园林以水为中心，亭廊、假山与花木互相借景。先看整体水面与布局，再留意漏窗、廊架与题额；移步换景，站在亭榭处回望最能看出层次。',
        '宫殿官署': '宫殿沿中轴线对称展开，前朝后寝、主次分明。先看台基、殿顶形制与开间数量，再看梁柱彩画与陈设，它们对应等级与礼制。'
    };
    function typeOf(list, table, fallback) {
        for (var i = 0; i < list.length; i++) if (list[i][0].test(NAME)) return list[i][1];
        return fallback;
    }
    var NATURE_TYPE = typeOf(NATURE_TYPES, null, '山地');
    var HERITAGE_TYPE = typeOf(HERITAGE_TYPES, null, '聚落');

    /* ---------- FAQ 与小模块 ---------- */
    function p(text) { return '<p>' + esc(text) + '</p>'; }
    function list(items) {
        return '<ul class="sd-list">' + items.map(function (it) {
            return '<li><b>' + esc(it[0]) + '：</b>' + esc(it[1]) + '</li>';
        }).join('') + '</ul>';
    }
    function steps(items) {
        return '<div class="sd-steps">' + items.map(function (it, i) {
            return '<div class="sd-step"><em>0' + (i + 1) + '</em><div><h3>' + esc(it[0]) + '</h3><p>' + esc(it[1]) + '</p></div></div>';
        }).join('') + '</div>';
    }
    function accList(items) {
        return '<div class="sd-acc">' + items.map(function (it, i) {
            return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(it[0]) +
                '<i class="fas fa-plus"></i></summary><p>' + esc(it[1]) + '</p></details>';
        }).join('') + '</div>';
    }
    function factsGrid(rows) {
        return '<dl class="sd-factgrid">' + rows.filter(function (r) { return r[0] && r[1]; }).map(function (r) {
            return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        }).join('') + '</dl>';
    }
    function tagRow(tags) {
        return '<div class="sd-tags">' + tags.filter(Boolean).map(function (t) {
            return '<span>' + esc(t) + '</span>';
        }).join('') + '</div>';
    }
    function bookingBlock() {
        var q = encodeURIComponent(NAME);
        var out = '<div class="sd-book">';
        if (IS_FOOD) {
            out += '<a href="https://you.ctrip.com/searchsite/food/?query=' + q + '" target="_blank" rel="noopener"><i class="fas fa-utensils"></i>携程找店</a>' +
                '<a href="https://www.douyin.com/search/' + q + encodeURIComponent(' 美食 团购') + '" target="_blank" rel="noopener"><i class="fab fa-tiktok"></i>抖音团购</a>' +
                '<a href="https://uri.amap.com/search?keyword=' + encodeURIComponent((info.city || '') + ' ' + NAME) + '&view=map" target="_blank" rel="noopener"><i class="fas fa-location-dot"></i>高德导航</a>';
        } else {
            if (TICKET !== 0) {
                out += '<a href="https://you.ctrip.com/searchsite/scenic/?query=' + q + '" target="_blank" rel="noopener"><i class="fas fa-ticket"></i>携程门票</a>' +
                    '<a href="https://www.douyin.com/search/' + q + encodeURIComponent(' 门票 团购') + '" target="_blank" rel="noopener"><i class="fab fa-tiktok"></i>抖音团购</a>';
            }
            if (needReserve(NAME)) {
                var mini = miniOf(NAME);
                out += '<button type="button" class="sd-book-wx" onclick="window.mylDetailWx(\'' + mini + '\')"><i class="fab fa-weixin"></i>微信预约 · ' + esc(mini) + '</button>';
            }
            out += '<a href="https://uri.amap.com/search?keyword=' + encodeURIComponent((info.city || '') + ' ' + NAME) + '&view=map" target="_blank" rel="noopener"><i class="fas fa-location-dot"></i>高德导航</a>';
        }
        out += '</div><p class="sd-note">票价、余票与预约规则以官方渠道当日显示为准；第三方平台适合比价，不保证最低价。</p>';
        return out;
    }
    window.mylDetailWx = function (mini) {
        var tip = '已复制「' + mini + '」· 打开微信搜索该小程序即可预约';
        function done() { toast(tip); }
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(mini).then(done, done);
                return;
            }
        } catch (e) { }
        done();
    };

    /* ---------- 场景 / 生态 ---------- */
    var SCENES = {
        nature: [['清晨', '水面最稳、雾气未散，适合拍倒影与空镜；人也最少。'],
            ['正午', '光线硬、反差大，不适合拍大水景；适合走林下步道或找背阴处休息。'],
            ['黄昏', '侧逆光把山脊和水面染成暖色，是一天里最出片的窗口。'],
            ['夜间', '多数自然景区不开放夜游；若住在景区内，注意照明与结伴。']],
        heritage: [['清晨', '开门首批人少，适合拍空院与门洞；光线柔和，细节清楚。'],
            ['正午', '游客集中，殿内偏暗；适合看展陈与碑刻，拍照靠廊下散射光。'],
            ['黄昏', '屋檐与墙面出现暖色侧光，适合拍建筑轮廓与街巷。'],
            ['夜间', '亮灯的楼阁与街区气质完全不同；注意闭园时间与返程。']],
        museum: [['清晨', '开馆首批入场，热门展厅几乎不用排队。'],
            ['正午', '团队集中，建议错开主展厅，先看临展或专题厅。'],
            ['黄昏', '闭馆前两小时人最少，适合回看重点展品。'],
            ['夜间', '多数博物馆不开放夜场，留意官网的特别场次。']],
        street: [['清晨', '店铺未开，适合拍建筑立面与街巷肌理。'],
            ['正午', '人流适中，适合进店吃饭与逛市场。'],
            ['黄昏', '亮灯前后是街区最好看的时候，烟火气开始上来。'],
            ['夜间', '主街最热闹；想安静就往支巷走，注意保管随身物品。']],
        landmark: [['清晨', '人少、空气通透，适合拍全景与城市天际线。'],
            ['正午', '光线平，适合逛周边街区，不适合拍建筑。'],
            ['黄昏', '日落前后 30 分钟是黄金窗口，亮灯后又是另一种气质。'],
            ['夜间', '灯光秀与夜景时段，提前占机位，留意末班地铁。']]
    };
    var ECO = {
        nature: {
            sensitive: '水岸、草甸、苔藓与浅滩最容易被踩踏；多数景区禁飞无人机，湖水与溪流不要下水。',
            low: ['只走既有步道与木栈道，不抄近路穿越草甸。', '垃圾全部带走，果皮也不要留在野外。', '与野生动物保持距离，不投喂、不追逐、不使用闪光灯。', '无人机先查禁飞区，风口不要起飞。'],
            community: '优先选择本地向导、村民经营的小店与接驳车；买一份本地农产品，比在景区门口买纪念品更能让消费留在当地。',
            capacity: '节假日 10:30-15:00 是峰值，开园后两小时与闭园前两小时最从容；单日承载量以景区公告为准。'
        },
        heritage: {
            sensitive: '木构件、壁画、彩塑怕触摸、怕潮、怕闪光灯；殿内护栏与“禁止入内”区域不要跨越。',
            low: ['拍照关闭闪光灯，不倚靠栏杆与柱础。', '不触摸碑刻、雕像与展柜玻璃。', '殿内保持安静，不逆行、不长时间占机位。', '香烛在指定区域使用，不随意点火。'],
            community: '请本地讲解员、买本地手作，比只拍照更能让古建维护有持续收入；对居民院落保持距离，先征得同意再拍人。',
            capacity: '团队集中在 10:30 后，早到半小时体验差别明显；节假日建议预约首场或闭园前时段。'
        },
        museum: {
            sensitive: '展柜玻璃、纸质与纺织品展品对光敏感；展厅内不要饮食、不要触摸展品。',
            low: ['关闭闪光灯，不用自拍杆越过展线。', '按单向动线参观，不在展柜前久留。', '儿童参观提前约定“只看不摸”。', '临展手册看完放回，不带走。'],
            community: '在馆内商店购买本地文创，或参加馆方组织的社区讲解与工作坊，让文化消费留在本地。',
            capacity: '周末下午与假期最挤，工作日开馆后一小时或闭馆前两小时更从容；热门馆务必提前预约。'
        },
        street: {
            sensitive: '夜间噪音、油烟与垃圾是街区最直接的环境压力；居民院落与私人巷道不要擅自进入。',
            low: ['小吃尽量堂食，减少一次性包装。', '垃圾投入分类桶，不随手丢在巷口。', '拍居民与店铺先示意，不堵门、不追拍。', '夜间控制音量，尊重仍在休息的住户。'],
            community: '优先光顾本地人经营的小店与摊档，按标价消费、不恶意砍价；参与本地手作体验，而不是只看表演。',
            capacity: '19:30-21:00 是夜市峰值，想拍空镜就清晨来，想感受烟火气则错峰到 21:00 后。'
        },
        landmark: {
            sensitive: '观景平台与高处风大，人流密集时不要翻越护栏；周边历史街区同样需要安静与尊重。',
            low: ['不攀爬护栏与雕塑，不在车行道停留拍照。', '垃圾带走或投入分类桶。', '夜间拍摄不长时间占用公共通道。', '优先步行或公共交通到达。'],
            community: '把消费放在地标周边的老街区，而不是只在观景台买水；支持本地小店与讲解服务。',
            capacity: '日落前 1 小时与亮灯后 30 分钟最挤，建议提前到达或改到清晨；节假日优先公共交通。'
        }
    };

    function sceneLink() {
        var spots = relSpots.slice(0, 2), foods = relFoods.slice(0, 1);
        if (!spots.length && !foods.length) return '';
        var seg = '同片区可串联：' +
            (spots.length ? ('景点 ' + spots.join('、')) : '') +
            (spots.length && foods.length ? '，' : '') +
            (foods.length ? ('顺带尝一口 ' + foods.join('、')) : '') + '。';
        return '<p class="sd-note"><b>本地串联：</b>' + esc(seg) + '</p>';
    }
    function sceneBlock() {
        var sc = SCENES[cat] || SCENES.landmark;
        return '<p>在「' + esc(NAME) + '」，一天里不同时段的气质大致如下，按光线与人流安排停留。</p>' +
            '<div class="sd-scenes">' + sc.map(function (s) {
                return '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>';
            }).join('') + '</div>' +
            '<div class="sd-two">' +
            '<div><b>晴天</b><p>' + esc(cat === 'nature' ? '通透度高，适合拍远景与水面；正午找背阴处，防晒按全天准备。' : '适合看建筑外立面与街巷，光线硬时多用廊下与阴影做前景。') + '</p></div>' +
            '<div><b>雨天</b><p>' + esc(cat === 'museum' ? '博物馆与展馆几乎不受影响，反而人少；带好伞套与防滑鞋。' : (cat === 'nature' ? '小雨更有氛围，但山路湿滑、水边涨水，量力而行；大雨改期。' : '雨天游客少、石板路反光好看；注意台阶湿滑与闭园时间。')) + '</p></div>' +
            '</div>' +
            sceneLink() +
            '<p class="sd-note">跟团多在 10:30-15:00 集中抵达；自由行把主景点放在开园后或闭园前，体感差别最大。</p>';
    }
    function ecoBlock() {
        var e = ECO[cat] || ECO.landmark;
        return '<div class="sd-eco"><div class="sd-eco-head"><b>可持续游览</b><span>MYL 可持续旅行准则</span></div>' +
            '<div class="sd-eco-grid">' +
            '<div><em>环境敏感点</em><p>' + esc(e.sensitive) + '</p></div>' +
            '<div><em>低干扰行为</em><ul>' + e.low.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
            '<div><em>社区与在地</em><p>' + esc(e.community) + '</p></div>' +
            '<div><em>承载力与错峰</em><p>' + esc(e.capacity) + '</p></div>' +
            '</div></div>';
    }

    /* ---------- 美食数据 ---------- */
    var CUISINE = {
        '江苏': '淮扬菜', '浙江': '浙菜', '上海': '本帮菜', '安徽': '徽菜', '福建': '闽菜',
        '江西': '赣菜', '山东': '鲁菜', '河南': '豫菜', '湖北': '楚菜', '湖南': '湘菜',
        '广东': '粤菜', '广西': '桂菜', '海南': '琼菜', '四川': '川菜', '重庆': '渝派川菜',
        '贵州': '黔菜', '云南': '滇菜', '陕西': '陕菜', '甘肃': '陇菜', '青海': '青海风味',
        '宁夏': '宁夏清真菜', '新疆': '新疆菜', '西藏': '藏餐', '北京': '京菜', '天津': '津菜',
        '河北': '冀菜', '山西': '晋菜', '内蒙古': '蒙餐', '辽宁': '辽菜', '吉林': '吉菜',
        '黑龙江': '龙江菜', '香港': '港式粤菜', '澳门': '澳门土生菜', '台湾': '台菜'
    };
    var CUISINE_TEXT = {
        '淮扬菜': '讲究刀工、火候与本味，咸甜适中，汤清而不寡。',
        '川菜': '以麻辣、椒麻与复合味见长，重油重香但讲究层次。',
        '粤菜': '重食材本味与鲜度，清蒸、白灼、煲汤是基本功。',
        '鲁菜': '咸鲜为主，重火候与高汤，葱烧、爆炒见功力。',
        '浙菜': '清鲜脆嫩、咸甜适中，讲究时令与水产。',
        '湘菜': '香辣、酸辣并重，腊味与剁椒是标志。',
        '徽菜': '重油、重色、重火功，善用山珍与腌制食材。',
        '闽菜': '汤菜见长，善用海鲜与红糟，口味清鲜。',
        '本帮菜': '浓油赤酱、咸甜适口，讲究“留芡”和火候。',
        '京菜': '融合宫廷与市井，讲究酱香、酥脆与涮烤。',
        '滇菜': '善用菌菇、香草与酸辣，风味清奇。',
        '新疆菜': '羊肉、孜然、皮牙子与面食构成主线，香气直接。',
        '藏餐': '以糌粑、酥油、牦牛肉为主，高热量适应高原。',
        '东北菜': '分量足、咸鲜浓香，炖菜与酸菜是日常。'
    };
    var DISH_MAIN = [
        [/鸭/, '鸭肉为主料，常配姜、葱、料酒去腥，靠火候与卤水定味'],
        [/鸡/, '鸡肉为主料，讲究汤底、火候与蘸料'],
        [/牛/, '牛肉为主料，多配香料慢炖或快炒'],
        [/羊/, '羊肉为主料，靠香料与火候压膻提鲜'],
        [/鱼/, '鲜鱼为主料，讲究现杀、火候与汤底'],
        [/虾/, '虾为主料，突出鲜甜与弹性'],
        [/蟹/, '蟹为主料，时令性极强，秋季最佳'],
        [/猪|肉|排骨|肘/, '猪肉为主料，肥瘦比例与火候决定口感'],
        [/面/, '面粉为主料，和面、醒面与汤底决定成败'],
        [/粉/, '米粉或淀粉为主料，汤底与浇头是灵魂'],
        [/米|饭|粥/, '米为主料，米种与水比决定口感'],
        [/豆|腐/, '豆制品为主料，讲究点卤与入味'],
        [/奶|酪/, '奶制品为主料，突出乳香与质地'],
        [/茶/, '以茶入馔，重在香气与回甘']
    ];
    var DISH_CRAFT = [
        [/烤|烧|炙|串/, '腌制—风干或挂炉—控火，外皮与内部熟度要分开判断'],
        [/卤|酱|盐水/, '老卤或盐水浸煮—浸泡入味—收汁，时间比火力更重要'],
        [/腌|糟|醉|泡/, '盐、酒或糟低温浸渍，用时间换风味，卫生与温度是关键'],
        [/蒸/, '大火定型—中火入味，出锅后要立刻上桌'],
        [/炖|煲|汤/, '先焯水去杂味—小火慢煨，汤色与浓度靠时间'],
        [/面|粉/, '和面/泡粉—煮制—浇头或汤底，三步都不能省'],
        [/火锅|涮/, '底料炒香—按先荤后素、先淡后浓的顺序涮煮'],
        [/炸|煎|酥/, '挂糊或拍粉—两段油温，先定型再复炸上色'],
        [/拌|凉/, '食材预处理—调味—现拌现吃，久放会出水走味']
    ];
    function dishMain() {
        for (var i = 0; i < DISH_MAIN.length; i++) if (DISH_MAIN[i][0].test(NAME)) return DISH_MAIN[i][1];
        return '以本地常见主料与时令配菜为主，具体用料以店家做法为准';
    }
    function dishCraft() {
        for (var i = 0; i < DISH_CRAFT.length; i++) if (DISH_CRAFT[i][0].test(NAME)) return DISH_CRAFT[i][1];
        return '选料—预处理—调味—出锅，讲究现做现吃';
    }
    function sceneOf(n) {
        n = n || NAME;
        if (/面|粉|粥|包|饺|馍|饼|豆浆|油条|早茶/.test(n)) return '早餐 / 午餐';
        if (/烧烤|火锅|串|夜宵|小龙虾|啤酒/.test(n)) return '晚餐 / 夜宵';
        if (/糕|饼|酥|糖|茶|酱|腊|干货/.test(n)) return '小吃 / 伴手礼';
        return '午餐 / 晚餐';
    }
    function dishScene() { return sceneOf(NAME); }
    function dishSeason() {
        if (/蟹|蟹黄|大闸蟹/.test(NAME)) return '秋季（9-11 月）最肥美';
        if (/笋|春|荠菜|香椿/.test(NAME)) return '春季（3-5 月）最佳';
        if (/羊肉|羊汤|火锅/.test(NAME)) return '秋冬最合适';
        if (/凉|冷面|冰|酸梅/.test(NAME)) return '夏季更舒服';
        return '全年可吃；本地时令蔬菜上市时风味更好';
    }
    function profileOf(n) {
        n = n || NAME;
        var spicy = /辣|椒|火锅|麻辣|剁椒|酸辣/.test(n) ? '明显' : (/胡椒|微辣/.test(n) ? '轻微' : '无');
        var sweet = /甜|糖|蜜|糕|奶|芋|豆沙/.test(n) ? '明显' : (/红烧|酱|卤/.test(n) ? '轻' : '无');
        var texture = /面|粉|饭|馍|饼|饺|包|糕/.test(n) ? '扎实 / 软糯' :
            (/脆|酥|炸|烤/.test(n) ? '外脆内嫩' : (/汤|羹|粥/.test(n) ? '汤感顺滑' : '紧实 / 鲜嫩'));
        var main = /酸|醋|泡/.test(n) ? '酸爽' : (/咸|卤|酱|盐水/.test(n) ? '咸鲜' :
            (/甜|糖|蜜/.test(n) ? '甜香' : (/辣|椒/.test(n) ? '香辣' : '鲜香')));
        var aroma = [];
        if (/烤|烧|炙/.test(n)) aroma.push('焦香');
        if (/卤|酱|盐水/.test(n)) aroma.push('卤香');
        if (/辣|椒/.test(n)) aroma.push('椒香');
        if (/蒜/.test(n)) aroma.push('蒜香');
        if (/茶/.test(n)) aroma.push('茶香');
        if (/奶|酪/.test(n)) aroma.push('乳香');
        if (!aroma.length) aroma.push('食材本香');
        return { main: main, spicy: spicy, sweet: sweet, texture: texture, aroma: aroma };
    }
    function dishProfile() { return profileOf(NAME); }
    function cuisineOf() {
        return CUISINE[PROV] || '地方风味';
    }
    function dishPrice() {
        if (txt(info.price)) return info.price;
        var ps = { '早餐 / 午餐': '¥12-30', '晚餐 / 夜宵': '¥50-120', '小吃 / 伴手礼': '¥15-60' };
        return ps[sceneOf(NAME)] || '¥30-80';
    }
    function dishOrigin() {
        if (NAME.indexOf(CITY_SHORT) >= 0 && CITY_SHORT) return '以地名命名，说明它与' + CITY_SHORT + '的饮食传统直接绑定；具体起源有民间说法与店家演绎多个版本。';
        if (/烤|卤|腌|蒸|炸|炒|拌|炖|煮/.test(NAME)) return '以核心做法命名，做法本身就是这道菜的身份标识。';
        if (/鸭|鸡|牛|羊|鱼|虾|蟹|猪|面|粉|米|豆/.test(NAME)) return '以主料命名，名字越朴素，越考验选料与火候。';
        return '名字来自本地人的日常叫法，具体源流以地方饮食志与老店说法为准。';
    }

    /* ---------- 后厨工序：按主料类别 + 工艺类别分步生成 ---------- */
    function mainKind() {
        if (/鸭/.test(NAME)) return 'duck';
        if (/鸡/.test(NAME)) return 'chicken';
        if (/牛/.test(NAME)) return 'beef';
        if (/羊/.test(NAME)) return 'lamb';
        if (/鱼/.test(NAME)) return 'fish';
        if (/虾/.test(NAME)) return 'shrimp';
        if (/蟹/.test(NAME)) return 'crab';
        if (/包|饺|馄饨|扁食|燕皮|肉燕|烧卖|烧麦/.test(NAME)) return 'stuffed';
        if (/猪|肉|排骨|肘|肚|肠|肝/.test(NAME)) return 'pork';
        if (/面/.test(NAME)) return 'noodle';
        if (/粉|线|米线/.test(NAME)) return 'riceNoodle';
        if (/米|饭|粥/.test(NAME)) return 'rice';
        if (/豆|腐/.test(NAME)) return 'tofu';
        if (/奶|酪|酥油/.test(NAME)) return 'dairy';
        if (/茶/.test(NAME)) return 'tea';
        return 'mixed';
    }
    function craftKind() {
        if (/酥油茶|油茶/.test(NAME)) return 'teaBeat';
        if (/烤|烧|炙|串/.test(NAME)) return 'roast';
        if (/卤|酱|盐水/.test(NAME)) return 'braise';
        if (/腌|糟|醉|泡/.test(NAME)) return 'pickle';
        if (/蒸/.test(NAME)) return 'steam';
        if (/炖|煲|汤/.test(NAME)) return 'stew';
        if (/火锅|涮/.test(NAME)) return 'hotpot';
        if (/炸|煎|酥脆|酥炸/.test(NAME)) return 'fry';
        if (/拌|凉/.test(NAME)) return 'cold';
        if (/面|粉|线/.test(NAME)) return 'noodle';
        return 'general';
    }
    var MAIN_PREP = {
        duck: '鸭肉治净，斩块或整只，用姜、葱、料酒去除腥膻；按部位分开皮与肉备用。',
        chicken: '鸡肉洗净切块、沥干水分；用姜葱、料酒或盐先打底去腥，按需去皮。',
        beef: '牛肉按纹理逆纹切块或切片，冷水泡去血水；避免久洗流失肉中鲜味。',
        lamb: '羊肉冷水下锅焯水去膻，撇净血沫；配姜、葱、花椒备用，控干水分。',
        fish: '鲜鱼现杀洗净，去鳞、内脏与腹内黑膜，沥干；改刀后用少许盐与料酒腌底味。',
        shrimp: '虾剪须、去虾线，冲洗沥干；按做法保留整只或开背，控去表层水分。',
        crab: '蟹刷洗干净，认准时令；蒸前捆扎蟹脚，避免受热脱落影响品相。',
        stuffed: '面皮（或米皮）与馅料分别备好；肉馅调味搅打上劲，包捏成型，注意收口不露馅。',
        pork: '猪肉肥瘦分开切配，去皮去毛；按菜肴需要切块、切片或剁馅，沥干血水。',
        noodle: '面粉加水和面、揉匀醒面，擀片或压成面条；汤面另备汤底与浇头。',
        riceNoodle: '米粉按软硬要求泡发或现煮，过凉水防粘连；汤底与浇头分别备好。',
        rice: '米淘洗后按水比浸泡，熬粥则先大火煮开再转小火慢熬。',
        tofu: '豆腐切块后焯水去豆腥、控干；嫩豆腐与老豆腐按做法选用。',
        dairy: '奶类、酥油或乳酪按用量备好，注意温控；盐、糖或茶叶等配料分装备用。',
        tea: '茶叶按用量备齐，控制水温与冲泡时间；入馔时先取茶香再下料。',
        mixed: '主料与时令配菜分别洗净、切配；葱姜蒜等小料分装备用。'
    };
    var CRAFT_PRE = {
        roast: '主料腌渍入味，风干或挂起控干；烤具提前预热，外皮上色与内部熟度分开判断。',
        braise: '老卤或盐水调好底味，主料先焯水或煸炒，再下入卤汤浸泡入味。',
        pickle: '盐、酒、糟或酱料按比例调配，低温浸渍；控制温度与时间，注意卫生。',
        steam: '主料摆盘定型，配料与汤汁另备；蒸锅水先烧开再上笼，避免蒸汽不足。',
        stew: '主料焯水去杂味，配料切块；砂锅或炖锅先爆香底料，再下料慢煨。',
        hotpot: '底料炒香熬成锅底，荤素食材分盘装好；餐具与蘸料提前调齐。',
        teaBeat: '茶叶先熬煮取浓茶汤，过滤去渣；酥油（或奶类）与搅拌器具洗净备好。',
        fry: '主料挂糊或拍粉，备好两段油温；配菜与蘸料同步就位，现炸现做。',
        cold: '食材煮或焯至刚熟，过凉沥干；调味汁单独调匀，现拌现吃。',
        noodle: '汤底熬好，浇头分别炒制；粉面现煮，沥干后再合汤或拌酱。',
        general: '主料预处理到位，小料与调味料按顺序备好，讲究现做现吃。'
    };
    var CRAFT_COOK = {
        roast: '控火烤制，先大火锁色、再小火烘熟；中途翻面或刷料，做到外皮酥脆而内部不柴。',
        braise: '小火浸煮入味，关火后继续浸泡让鲜味回渗；入味时间比火力更关键。',
        pickle: '低温腌渍，用时间换风味；中途翻动一次使其入味均匀，观察色泽与口感。',
        steam: '大火定型、中火入味，蒸制时间按主料厚薄控制；出锅后立刻上桌。',
        stew: '小火慢煨，汤色与浓度靠时间；中途少开盖，保持锅内温度稳定。',
        hotpot: '先荤后素、先淡后浓下锅；按食材易熟程度分批涮煮，避免一锅煮老。',
        teaBeat: '热茶汤与酥油一同捣打或搅打至融合乳化，汤色均匀后趁热倒出。',
        fry: '两段油温：先低温定型，再升高油温复炸上色；煎制则单面定型后再翻面。',
        cold: '调味汁与食材现拌，拌匀即食；久放会出水、走味，影响口感。',
        noodle: '粉面煮到断生，捞出合汤或拌面；浇头趁热盖上，拌匀后即食。',
        general: '按本地传统火候烹制，主料断生即出锅，尽量保持本味与口感。'
    };
    function seasonStep() {
        var fp = dishProfile();
        if (fp.main === '香辣') return '出锅前调香辣口，辣椒与椒香在后段下入，避免久炒焦苦；趁热装盘上桌。';
        if (fp.main === '甜香') return '甜味在后段收住，避免齁腻；出锅装盘，保留菜品表面光泽。';
        if (fp.main === '酸爽') return '酸味临出锅再调入，保留清亮口感；搭配蘸料或配菜一并上桌。';
        if (fp.main === '咸鲜') return '以咸鲜打底，盐与酱料分次加入尝味；主料入味后即可出锅。';
        return '突出食材本鲜，调味从简；出锅趁热装盘，香气在刚上桌时最足。';
    }
    function cookSteps() {
        var mk = mainKind(), ck = craftKind();
        return [
            ['备料', MAIN_PREP[mk]],
            ['预处理', CRAFT_PRE[ck]],
            ['关键烹制', CRAFT_COOK[ck]],
            ['调味出锅', seasonStep()]
        ];
    }
    function pairSuggest() {
        var mk = mainKind();
        var base = {
            duck: '配荷叶饼或白米饭，蘸酸梅酱、甜面酱解腻；主食选清淡口。',
            chicken: '配米饭或面条，蘸姜葱蓉或辣椒粉；汤菜可再配一碗清汤。',
            beef: '配米饭或饼，蘸卤汁或干碟；重口味配解腻的茶水。',
            lamb: '配椒盐、蒜泥或辣酱；主食选面食，佐一碗清汤压膻。',
            fish: '配米饭，蘸蒸鱼豉油或酸辣蘸水；调味不宜过重，以免盖住鲜味。',
            shrimp: '配清淡主食，蘸姜醋或蒜蓉酱；佐茶解腥。',
            crab: '配姜醋汁，主食从简；可配黄酒或姜茶暖胃。',
            stuffed: '配一碗清汤或原汤同食，蘸姜醋、辣酱；趁热吃，放凉皮子会发硬。',
            pork: '配米饭或白馍，浓油赤酱类搭配青菜解腻。',
            noodle: '本身即主食，配一份小菜或卤味；汤面佐面汤同食。',
            riceNoodle: '本身即主食，配卤味或凉拌小菜；干拌类另配一碗汤。',
            rice: '配荤菜或汤菜组成一餐；粥品配小咸菜与面点。',
            tofu: '配米饭，重口做法配青菜；清淡做法佐一杯清茶。',
            dairy: '配茶或主食小点；甜口可搭配坚果与水果。',
            tea: '本身即饮品或入馔主料，配清淡茶点，避免重味叠加。',
            mixed: '按干湿搭配：干碟配主食，汤菜配米饭；两人以上小份多样。'
        };
        return base[mk];
    }

    /* ---------- 对比 / 小测 / 人格 ---------- */
    function stableScore(s, offset, min, max) {
        return min + ((hashStr(s + '|' + offset) * 7) % (max - min + 1));
    }
    function compareBlock() {
        var list = IS_FOOD ? [NAME].concat(relFoods.slice(0, 2)) : [NAME].concat(relSpots.slice(0, 2));
        if (list.length < 2) return '';
        var head = IS_FOOD
            ? ['菜品', '人均', '主调', '辣度', '最佳餐次', '适合']
            : ['景点', '参考门票', '建议停留', '强度', '出片', '适合'];
        var body = list.map(function (n, i) {
            var c = catOf(n);
            if (IS_FOOD) {
                var fp = profileOf(n);
                var sc = sceneOf(n);
                var ps = { '早餐 / 午餐': '¥12-30', '晚餐 / 夜宵': '¥50-120', '小吃 / 伴手礼': '¥15-60' };
                return '<tr class="' + (i === 0 ? 'cur' : '') + '"><td>' + esc(n) + '</td>' +
                    '<td>' + esc(i === 0 ? dishPrice() : (ps[sc] || '¥30-80')) + '</td>' +
                    '<td>' + esc(fp.main) + '</td>' +
                    '<td>' + esc(fp.spicy) + '</td>' +
                    '<td>' + esc(sc) + '</td>' +
                    '<td>' + esc(i === 0 ? '本地口碑' : (stableScore(n, 2, 60, 92) > 80 ? '游客打卡' : '顺路小份')) + '</td></tr>';
            }
            var t = ticketFor(n);
            return '<tr class="' + (i === 0 ? 'cur' : '') + '"><td>' + esc(n) + '</td>' +
                '<td>' + esc(t === 0 ? '免费' : (t > 0 ? '¥' + t + ' 起' : '以公告为准')) + '</td>' +
                '<td>' + esc(duration[c] || duration.landmark) + '</td>' +
                '<td>' + esc(intensityOf(c)) + '</td>' +
                '<td>' + stableScore(n, 1, 70, 96) + '</td>' +
                '<td>' + esc(familyOf(c)) + '</td></tr>';
        }).join('');
        return '<div class="sd-compare"><table><thead><tr>' + head.map(function (h) {
            return '<th>' + esc(h) + '</th>';
        }).join('') + '</tr></thead><tbody>' + body + '</tbody></table>' +
            '<p class="sd-note">对比为编辑参考，门票与时长以官方公告和实际动线为准。带底色的一行为当前页面。</p></div>';
    }

    function quizBlock() {
        var qs;
        if (IS_FOOD) {
            qs = [
                { q: '第一次吃「' + NAME + '」，更稳妥的打开方式？', opts: ['先按本地默认做法尝原味', '先加辣加醋再吃', '放凉后再吃'], a: 0 },
                { q: '它更适合安排在哪一餐？', opts: [dishScene(), '必须当早餐', '只适合夜宵'], a: 0 },
                { q: '想少吃辣，点单时怎么说？', opts: ['少辣 / 不辣，不要香菜', '多放辣椒', '随便'], a: 0 }
            ];
        } else {
            var tq = ['现场排队买票', '官方渠道提前预约 / 购票', '找门口拉客的人'];
            qs = [
                { q: '「' + NAME + '」的门票怎么买更稳？', opts: tq, a: 1 },
                { q: '相对更好的到访时段？', opts: [bestTime[cat], '正午 12:00-14:00', '闭园前 10 分钟'], a: 0 },
                { q: '这类景点的步行强度更接近？', opts: [intensityOf(cat), '全程无需走路', '需要专业登山装备'], a: 0 }
            ];
        }
        return '<div class="sd-quiz" id="sdQuiz"><div class="sd-quiz-head"><b>行前认知小测</b><span>3 题 · 答对再出发</span></div>' +
            qs.map(function (item, qi) {
                return '<div class="sd-q"><p>' + (qi + 1) + '. ' + esc(item.q) + '</p>' +
                    item.opts.map(function (o, oi) {
                        return '<label><input type="radio" name="sdq' + qi + '" value="' + oi + '" data-q="' + qi + '" data-a="' + item.a + '">' + esc(o) + '</label>';
                    }).join('') + '</div>';
            }).join('') +
            '<button type="button" class="sd-quiz-btn" id="sdQuizBtn">对答案</button>' +
            '<div class="sd-quiz-result" id="sdQuizResult"></div></div>';
    }

    var PERSONAS = [
        ['A', '极地追光者'], ['B', '碳水刺客'], ['C', '胶片诗人'], ['D', '旅途交际花'],
        ['AB', '山野饕客'], ['AC', '荒野艺术家'], ['BC', '味蕾诗人'], ['CD', '文艺社交家']
    ];
    var PERSONA_MATCH = {
        A: { nature: 5, heritage: 2, museum: 2, street: 1, landmark: 2, food: 2 },
        B: { nature: 2, heritage: 2, museum: 2, street: 4, landmark: 3, food: 5 },
        C: { nature: 4, heritage: 4, museum: 3, street: 4, landmark: 4, food: 2 },
        D: { nature: 2, heritage: 3, museum: 2, street: 5, landmark: 3, food: 4 },
        AB: { nature: 5, heritage: 2, museum: 1, street: 3, landmark: 2, food: 4 },
        AC: { nature: 5, heritage: 3, museum: 3, street: 2, landmark: 3, food: 2 },
        BC: { nature: 3, heritage: 3, museum: 3, street: 4, landmark: 2, food: 5 },
        CD: { nature: 2, heritage: 4, museum: 3, street: 5, landmark: 3, food: 3 }
    };
    function personaBlock() {
        var saved = '';
        try { saved = localStorage.getItem('mylPersona') || ''; } catch (e) { }
        var cur = PERSONAS.filter(function (p) { return p[0] === saved; })[0];
        var val = cur ? cur[1] : '未选择';
        var m = saved && PERSONA_MATCH[saved] ? PERSONA_MATCH[saved][IS_FOOD ? 'food' : cat] : 0;
        return '<div class="sd-persona"><div class="sd-persona-head"><b>旅行人格匹配</b>' +
            '<select id="sdPersonaSel"><option value="">选择你的人格</option>' +
            PERSONAS.map(function (p) {
                return '<option value="' + p[0] + '"' + (saved === p[0] ? ' selected' : '') + '>' + p[1] + '（' + p[0] + '）</option>';
            }).join('') + '</select></div>' +
            '<div class="sd-persona-body"><span id="sdPersonaName">' + esc(val) + '</span>' +
            '<div class="sd-persona-track"><i id="sdPersonaBar" style="width:' + (m ? m * 20 : 0) + '%"></i></div>' +
            '<p id="sdPersonaText">' + esc(personaText(saved, m)) + '</p></div>' +
            '<p class="sd-note">人格结果来自发现 MYL 的旅行人格测试；这里只做点位适配参考。</p></div>';
    }
    function personaText(code, m) {
        if (!code) return '选择你的人格后，会给出这个点位的推荐指数与玩法侧重。';
        if (m >= 4) return '匹配度 ' + m + '/5：正对你的旅行方式，建议放在当天主线，留足时间。';
        if (m === 3) return '匹配度 3/5：适合作为当天主线或顺路点，按体力决定停留长度。';
        return '匹配度 ' + (m || 2) + '/5：时间紧可以换成更对味的同类点位，或只作短时停留。';
    }

    function sourceCard() {
        return '<div class="sd-card sd-srccard"><h3><i class="fas fa-shield-halved"></i>信息说明</h3>' +
            '<p>' + (IS_FOOD
                ? '菜系归属、主料、工艺与赏味期按菜品品类推断并参照地方饮食志整理，核查日期 ' + CHECK_DATE + '；具体用料配比与口味以本地老店实际做法为准。'
                : '票价、开放时间、预约政策整理自景区官网、文旅部门与公开资料，核查日期 ' + CHECK_DATE + '。') + '</p>' +
            '<p>编辑参考不替代官方公告；出行前请再确认一次' + (IS_FOOD ? '店铺营业与当日供应。' : '当日票价、闭园日与预约余量。') + '</p>' +
            '<span>MYL 旅行编辑部</span></div>';
    }


    /* ---------- 内容推导 ---------- */
    function verdictOf() {
        if (hasAny(LEVEL5, NAME) || hasAny(WORLD_HERITAGE, NAME)) return ['必看', '同类里的第一梯队，值得专门留出半天到一天。'];
        if (cat === 'museum') return ['值得专程', '免费或低价的公共文化场馆，是理解这座城市最快的入口。'];
        if (cat === 'nature') return ['值得专程', '自然景观吃天气，光线好的时候价值远高于门票本身。'];
        if (cat === 'heritage') return ['值得专程', '信息密度高，慢慢看比多打卡更值。'];
        if (cat === 'street') return ['可顺路', '适合作为当天行程的收尾，不必单独安排一整天。'];
        return ['可顺路', '作为城市第一站建立方位感，顺路看即可。'];
    }

    /* ---------- 景点专属文案：按真实素材优先，类别模板仅兜底 ---------- */
    function badPlaceDesc(d) {
        return /上午|下午|抵达|前往|出发|自由活动|核心景点|延续|另一|入住|退房|早餐|午餐|晚餐|机场|车站|高铁|火车/.test(d);
    }
    function badFoodDesc(d) {
        return /当地最有名|本地最有名|老字号必吃|特色奶茶|特色咖啡|特色茶饮|必喝饮品|招牌菜|特色小吃|当地特色|本地特色|传统美食/.test(d);
    }
    function whyStory() {
        var prof = profileOfSpot(NAME);
        if (prof && prof.bg) return prof.bg;
        var note = pickNote(POI_NOTE, NAME);
        var d = txt(info.desc);
        if (note) return note;
        if (d && !badPlaceDesc(d)) return d;
        var place = CITY_SHORT || info.city || '';
        if (CH && CH.summary) {
            return NAME + (place ? '坐落在' + place + '。' : '') + CH.summary;
        }
        var base = STORY[cat];
        return (place ? NAME + '位于' + place + '。' : NAME + '。') + base;
    }
    function firstSentence(t) { return String(t || '').split(/[。！？]/)[0]; }
    function spotAngle() {
        var prof = profileOfSpot(NAME);
        if (prof && prof.angle) return prof.angle;
        if (cat === 'nature') {
            var nf = NATURE_FORM[NATURE_TYPE];
            return NAME + '是一处典型的' + NATURE_TYPE + '；' + (nf ? firstSentence(nf) + '。' : '先记住整体轮廓与水岸、山脊线，再落到近景细节。');
        }
        if (cat === 'heritage') {
            var hf = HERITAGE_FORM[HERITAGE_TYPE];
            return NAME + '是一处' + HERITAGE_TYPE + '；' + (hf ? firstSentence(hf) + '。' : '先看整体格局与轴线，再退回细看屋檐、梁柱与题刻。');
        }
        if (cat === 'museum') return '在' + NAME + '，先在导览图上锁定一到两件必看展品，再按动线补其他展厅，比从头到尾平推更有收获。';
        if (cat === 'street') return '逛' + NAME + '，主街用来认路，真正有意思的小店多在支巷；傍晚亮灯后再来一次，是两种逛法。';
        return '在' + NAME + '先找到经典机位完成打卡，再慢慢逛周边，避免一直绕着地标本身转。';
    }
    function readSteps() {
        var base = READ[cat].slice();
        var first;
        if (cat === 'nature') {
            var clue = { '湖泊': '水面范围、岸线曲线与远山层次', '峡谷': '谷壁岩层走向与水流侵蚀痕迹',
                '瀑布': '落差、水流量与岩壁结构', '湿地': '水道、芦苇与浅滩走向', '草原': '草甸、坡地与远处山脊',
                '沙漠 / 沙地': '沙丘走向与迎风背风坡', '海岸 / 海岛': '海岸线、潮间带与礁石分布', '河流': '弯道、浅滩与河心洲',
                '山地': '山脊线、植被分带与观景方位' };
            first = ['先定亚型', '这是一处典型的' + NATURE_TYPE + '，先按这类地貌找方位：' + (clue[NATURE_TYPE] || '整体轮廓与主要观景位置') + '。'];
        } else if (cat === 'heritage') {
            var hclue = { '石窟': '先看大像轮廓与手印，再退到侧面看比例，题记与供养人像多在窟门两侧',
                '古塔': '绕塔一周，看层数、平面形状与檐下斗拱，对照门窗收分与砖雕细节',
                '陵寝': '沿神道—陵门—享殿—宝顶轴线走，看石像生的排列与题材所反映的礼制',
                '城防': '看墙砖铭文、马面间距与瓮城形制，登城后先看整体走向再找一处垛口',
                '聚落': '先认街巷、水系、宗祠与码头的骨架，主街做买卖、支巷才是日常生活',
                '书院': '按讲堂—藏书—祭祀—生活的秩序看，留意匾额、碑记与楹联里的学术脉络',
                '宗教建筑': '沿山门—天王殿—大殿—藏经楼轴线看，碑廊可核对始建与重修年代',
                '名人纪念': '重点看书信、手稿与旧照，理解人物与这座城之间的真实关系',
                '楼阁 / 桥梁': '看结构（木构/石拱）、题刻，以及它和水口或城市轴线的位置关系',
                '教堂': '看立面构图、玫瑰花窗与材料工艺，读出当时的建造技术',
                '古典园林': '以水面为中心看亭廊、假山与花木借景，站在亭榭处回望最能看出层次',
                '宫殿官署': '看台基、殿顶形制与开间数量，再看梁柱彩画与陈设对应的等级礼制' };
            first = ['先定形制', '这是一处' + HERITAGE_TYPE + '，' + (hclue[HERITAGE_TYPE] || '先找中轴或主线，再对照年代、材料与题记线索判断它的来路') + '。'];
        }
        if (first) base[0] = first;
        return base;
    }

    var READ = {
        nature: [
            ['先看全景', '先到视野最开的位置，记住山脊线与水面范围，后面所有细节都挂在这张底图上。'],
            ['再看层次', '近景（石、草、栈道）→中景（水面、林带）→远景（山脊），一层层看，画面才不塌。'],
            ['找地质线索', '留意岩层走向、水蚀痕迹与植被分带，它们比“好看”更能解释这片山水为什么长这样。'],
            ['留一段空白', '找背阴处坐 15 分钟，看光线与人流变化，比多赶两个点更有收获。']
        ],
        heritage: [
            ['先看格局', '站在中轴线上看整体院落关系，再退回来看屋檐、梁柱、碑刻与门楣。'],
            ['顺着年代走', '把“始建—重修—现存”串起来看，比单看某座建筑更容易读懂它的来路。'],
            ['盯住细节', '斗拱、柱础、砖雕、题刻是最容易被错过的信息，站在檐下往上看两分钟。'],
            ['出门再回看', '参观完从街对面回望一次，建筑与城市的关系会突然清楚。']
        ],
        museum: [
            ['先锁定目标', '进门拿导览图，先定一到两件必看展品，再按动线补其他展厅。'],
            ['按时间走', '常设展通常按年代或主题排布，顺着走一遍，再回头细看重点。'],
            ['看说明牌', '展签上的出土地点、年代与材质，比展品本身更能说明问题。'],
            ['留出临展', '闭馆前 40 分钟去临展或文创区，节奏更从容。']
        ],
        street: [
            ['主街认路', '先沿主街走一遍，记住出入口、公共厕所与地铁站位置。'],
            ['钻进支巷', '真正有意思的小店与老墙多在支巷，主街只负责把人带进来。'],
            ['跟着本地人', '看本地人排队买什么，跟着买一小份，比按攻略打卡更接近真实。'],
            ['夜里再来', '亮灯后再走一遍，街区气质会完全不同。']
        ],
        landmark: [
            ['先认符号', '先找到经典机位完成打卡，再慢慢逛周边，避免一直绕着它转。'],
            ['换角度看结构', '正面广角拍全景，侧后方拍线条，夜里用长曝光或慢门。'],
            ['串成步行线', '把周边两三个点串成一条步行线，比单独来一次更值。']
        ]
    };

    function natureEcology() {
        switch (NATURE_TYPE) {
            case '湖泊': case '河流': case '瀑布': case '湿地':
                return '水位随季节涨落：丰水期水面开阔，枯水期更容易看清岸线、滩涂与岩层；水边以湿生草本与林木为主。';
            case '山地': case '森林': case '草原':
                return '植被随海拔与坡向分带明显：阴坡湿润、阳坡干燥；春季花期、夏季浓绿、秋季彩叶，是最直观的三季变化。';
            case '沙漠 / 沙地':
                return '沙地植被稀疏耐旱，昼夜温差大；草类与灌丛多长在沙脊背风处，观沙景最好在清晨或傍晚侧光下。';
            case '海岸 / 海岛':
                return '潮间带分布礁石、沙滩与潮沟，随潮汐涨落显现；近海生物对踩踏与捡拾很敏感，以远观为主。';
            case '梯田':
                return '灌水期水面如镜，耕作期层层翠绿，收稻前后转为金黄；田埂、水路与村落共同构成完整农业景观。';
            default:
                return '随海拔与坡向变化明显；季节更替带来花期、叶色与水量的直观差别。';
        }
    }

    function deepRows() {
        var peers = relSpots.slice(0, 3).join('、');
        var prof = profileOfSpot(NAME);
        if (prof) {
            var profRows = [];
            if (prof.bg) profRows.push(['建成背景', prof.bg]);
            if (prof.form) profRows.push(['造型与结构', prof.form]);
            if (prof.role) profRows.push(['城市角色', prof.role]);
            if (prof.link) profRows.push(['周边联动', prof.link]);
            if (profRows.length) return profRows;
        }
        if (cat === 'nature') {
            var ecoLine = natureEcology();
            return [
                ['地貌类型', NATURE_TYPE + '地貌'],
                ['形成过程', NATURE_FORM[NATURE_TYPE] || STORY.nature],
                ['植被与物种', ecoLine],
                ['季节变化', '光线与人气随一天时间改变：清晨水面/林面最稳、黄昏侧光最出片；水量、叶色随季节涨落，出发前看一次实时预报。'],
                ['周边节点', peers ? peers + '，适合串成一条自然线。' : '同片区的山、湖、步道与观景台，适合串成一条自然线。']
            ];
        }
        if (cat === 'heritage') {
            return [
                ['建筑类型', HERITAGE_TYPE],
                ['始建与重修', (HERITAGE_FORM[HERITAGE_TYPE] || STORY.heritage) + ' 具体始建年代与历代修缮，通常能在山门内或殿前碑廊核对。'],
                ['核心看点', '先看轴线与主体建筑，再退回来看屋檐、斗拱、柱础与题刻；' + (peers ? '可与' + peers + '串成一条人文线。' : '把同类建筑放在一起看，差异会更清楚。')],
                ['人物与事件', '把本地历史人物、重大事件与建筑功能对应起来看，展陈里的书信、碑记与旧照往往比复原陈设更有信息量。'],
                ['民俗关联', '留意节庆、庙会与日常祭祀仍在使用哪些空间，活着的使用方式比静态陈列更能说明它为什么重要。']
            ];
        }
        if (cat === 'museum') {
            return [
                ['馆藏方向', '常设展通常覆盖本地历史、民俗与近现代发展，先看常设再看临展。'],
                ['必看清单', '进门先确认镇馆之宝是否在展；重点展品前多停两分钟，读完成组说明牌。'],
                ['参观动线', '按楼层与年代顺序单向参观，避免来回折返；大馆至少留两小时。'],
                ['讲解方式', '语音导览适合独行，人工讲解适合家庭；免费讲解场次通常在大厅公示。'],
                ['周边联动', peers ? '出馆后可与' + peers + '串成半日线。' : '出馆后沿周边老街走一段，能把展陈里的城市对上现实。']
            ];
        }
        if (cat === 'street') {
            return [
                ['形成脉络', '街区多沿水系、码头或城门生长，主街做买卖、支巷住人，格局至今仍在。'],
                ['空间结构', '注意街宽、檐口高度与转角处理，这些尺度决定了它为什么好逛。'],
                ['本地生活', '菜市场、社区小店与修鞋摊，比网红店更能说明这里的日常。'],
                ['夜间气质', '亮灯后招牌与灯笼成为主要光源，主街热闹、支巷安静，是两种逛法。'],
                ['周边联动', peers ? '可与' + peers + '安排在同一晚。' : '把周边点位安排在同一段步行范围内。']
            ];
        }
        return [
            ['建成背景', '始建年代与历代修缮以现场碑刻、官方介绍或资料为准；先分清它是原构、重修还是迁建，不凭外观臆测年份。'],
            ['造型与结构', '看整体轮廓、用材与连接方式，再对照同时期同类建筑，差别常落在开间、檐角与细部装饰上。'],
            ['城市角色', '它在本地所处的位置与原有功能，决定了周边道路、街巷与后来的建设如何围绕它展开。'],
            ['周边联动', peers ? '可与' + peers + '串成一条城市漫步线。' : '把周边两三个点串成步行线。']
        ];
    }

    function accessItems() {
        var items = [];
        if (detail && detail.transport && detail.transport.length) {
            detail.transport.slice(0, 3).forEach(function (t) {
                if (t && t.label) items.push([t.label, txt(t.value)]);
            });
        }
        if (!items.length) {
            var arrive = {
                nature: '落地后先到县城或景区门户镇，再换景区班车 / 直通车进山；进山班次比市区少，先确认末班。',
                heritage: '多在老城区，高铁或火车到站后换地铁、公交即可抵达，最后一段跟着导航步行。',
                museum: '多在市区，落地后乘地铁或机场大巴进城，按馆址再换乘公交或打车。',
                street: '位于市中心，落地后乘地铁到最近商圈，剩下的路步行即可。',
                landmark: '多在城区或江边，公共交通可达；定位到官方观景入口，避免被带到侧门。'
            }[cat] || '落地后优先选地铁或机场大巴进城，再换乘公交或打车到目的地。';
            items.push(['到达方式', arrive]);
            var local = {
                nature: '进山段多为班车或包车，旺季要排队；提前问清发车点与返程末班。',
                heritage: '老城区街巷窄，打车到附近路口后步行进入更顺。',
                museum: '地铁最稳，馆周边常有公交站；留意周一闭馆与末班车时间。',
                street: '步行加短途打车为主，傍晚人流大，预留找路时间。',
                landmark: '公交、地铁直达周边，节假日停车紧张，优先公共交通。'
            }[cat] || '市区打车约 20-40 分钟；公交多有直达线路，留意末班车时间。';
            items.push(['市内交通', local]);
        }
        items.push(['自驾 / 停车', '导航到官方停车场，旺季车位紧张，尽量在 9 点前到达。']);
        items.push(['景区内换乘', cat === 'nature'
            ? '面积大的自然景区通常有观光车，按段收费，先确认末班车与换乘点。'
            : '以步行为主；讲解器与轮椅租借多在游客中心，先到先得。']);
        items.push(['返程', '末班公交 / 地铁通常在 21:00-22:30，夜游后预留 30 分钟余量。']);
        return items;
    }

    function costText() {
        var t = TICKET === 0 ? 0 : (TICKET > 0 ? TICKET : 80);
        var ticketLabel = TICKET === 0 ? '免费' : (TICKET > 0 ? '¥' + TICKET : '以公告为准（按 ¥80 估算）');
        return '门票 ' + ticketLabel + ' + 市内交通 ¥20-60 + 餐饮 ¥60-120' +
            (needReserve(NAME) ? ' + 讲解 ¥30-80' : '') +
            '，半天人均约 ¥' + (t + 80) + '-¥' + (t + 200) + '。';
    }

    function avoidItems() {
        var base = [
            ['入口', '认准官方入口与官方停车场，路边拉客的“内部通道”“不用排队”不要跟。'],
            ['票价', '现场加价、捆绑销售的套票先算清楚；线上购票看清是否含观光车。']
        ];
        if (cat === 'nature') base.push(['装备', '别穿新鞋与拖鞋，山路湿滑；无人机先确认禁飞区。']);
        if (cat === 'heritage') base.push(['拍照', '殿内关闭闪光灯，不触摸碑刻与彩塑；需要预约的殿宇提前查。']);
        if (cat === 'museum') base.push(['时间', '周一多为闭馆日，热门馆不预约大概率进不去。']);
        if (cat === 'street') base.push(['消费', '景区正门第一排通常最贵，往里走两条巷子价格会正常很多。']);
        if (cat === 'landmark') base.push(['机位', '收费拍照点先问清价格；节假日排队按 40 分钟以上预留。']);
        base.push(['高峰', '节假日 10:30-15:00 最挤，开园后两小时或闭园前两小时体验最好。']);
        return base;
    }

    function foodCulture() {
        var prov = PROV || cuisineOf();
        var srcKind = /鱼|虾|蟹|贝|海鲜|江鲜|湖鲜/.test(NAME) ? '本地水产'
            : /牛|羊|猪|鸡|鸭|鹅|肉|腊|卤/.test(NAME) ? '本地畜禽与肉作'
            : /面|粉|米|粮|豆|薯|馍|饼|糕/.test(NAME) ? '本地谷物与杂粮'
            : '本地出产的食材';
        return '在' + (CITY_SHORT || '当地') + '，' + NAME + '常出现在' + dishScene() + '的场景里。' +
            '它与本地的节气、集市和家庭餐桌绑定：' + (/腌|腊|糟|酱/.test(NAME)
                ? '过去靠腌制与风干延长保存期，如今成了地方风味的记忆点。'
                : (/面|粉|饭|馍|饼/.test(NAME) ? '主食形态稳定，最能反映本地人的日常口味。'
                    : '节庆与待客时更常见，做法往往比日常更讲究。')) +
            '食材多来自' + prov + '的' + srcKind + '，点单时问一句“今天什么最新鲜”，通常能得到更地道的推荐。';
    }
    function phraseTags() {
        var arr = ['少辣 / 不辣', '不要香菜', '走青', '少油', '汤汁多一点', '打包带走'];
        if (/面|粉/.test(NAME)) arr.unshift('面硬一点 / 软一点');
        if (/汤|煲/.test(NAME)) arr.push('汤少一点');
        return arr;
    }

    /* ---------- 正文 ---------- */
    var html = '';
    var secNo = 0;
    function S(id, title, en, body) {
        secNo++;
        return sec(id, ('0' + secNo).slice(-2), title, en, body);
    }

    if (!IS_FOOD) {
        if (window.MYL_PANO && window.MYL_PANO.has(NAME)) {
            html += S('pano', '全景漫游', 'Panorama', window.MYL_PANO.render(NAME));
        }
        var v = verdictOf();
        html += S('identity', '身份档案', 'Identity',
            factsGrid([
                ['名称', NAME],
                ['别名 / 古称', '以景区标识与地方志为准'],
                ['所在城市', (info.city || info.region || '') + (PROV && PROV !== info.city ? ' · ' + PROV : '')],
                ['景区级别', levelText()],
                ['开放时间', hoursText()],
                ['门票', ticketText()],
                ['预约', needReserve(NAME) ? '需实名预约（' + miniOf(NAME) + '）' : '一般无需预约，旺季建议提前购票'],
                ['建议停留', duration[cat]],
                ['最佳时段', bestTime[cat]],
                ['游览强度', intensityOf(cat)],
                ['无障碍 / 亲子', familyOf(cat)],
                ['经纬度', COORD]
            ]) +
            tagRow([catName[cat], levelText(), needReserve(NAME) ? '需预约' : '可现场购票',
                TICKET === 0 ? '免费' : (TICKET > 0 ? '¥' + TICKET + ' 起' : '票价以公告为准'), familyOf(cat)]));

        var cmp = compareBlock();
        html += S('why', '为什么值得去', 'Why Go',
            '<div class="sd-verdict"><b>' + esc(v[0]) + '</b><p>' + esc(v[1]) + '</p></div>' +
            p(whyStory()) +
            '<div class="sd-note"><b>专属看点：</b>' + esc(spotAngle()) + '</div>' +
            (cmp ? p('同类横向对比见下表，带底色的一行为当前页面。') + cmp : ''));

        html += S('read', '怎么看才看懂', 'How to Read', steps(readSteps()));

        var poiNote = pickNote(POI_NOTE, NAME);
        html += S(cat === 'nature' ? 'geo' : 'history', cat === 'nature' ? '地理与成因' : '历史与人文',
            cat === 'nature' ? 'Landform' : 'History',
            accList(deepRows()) +
            (poiNote ? p('本景点看点：' + poiNote) : '') +
            cityHistoryBlock() +
            (txt(info.desc) && !badPlaceDesc(txt(info.desc)) ? p(info.desc) : ''));

        html += S('eco', '可持续游览', 'Sustainable Travel', ecoBlock());
        html += S('scene', '真实体验场景', 'Scenes', sceneBlock());

        var relList = relSpots.slice(0, 3).map(function (n) { return relCard(n, 'spot'); })
            .concat(relFoods.slice(0, 2).map(function (n) { return relCard(n, 'food'); }));
        html += S('access', '到达与周边串联', 'Access',
            list(accessItems()) +
            p('半日线建议：' + NAME + '（' + duration[cat] + '）→ ' +
                (relFoods[0] || '本地小馆') + '（1 小时）→ ' +
                (relSpots[0] || '周边街区') + '（1.5 小时）；先远后近，返程不赶。') +
            (relList.length ? '<div class="sd-rel-grid" style="margin-top:16px">' + relList.join('') + '</div>' : ''));

        html += S('plan', '消费 · 避坑 · 预订', 'Plan',
            p(costText()) +
            '<div class="sd-two"><div><b>讲解与体验</b><p>' +
            esc(needReserve(NAME) ? '官方讲解通常需在游客中心预约，价格按场次或人数计；语音导览更自由。' : '语音导览与人工讲解多在 ¥30-80，按需选择。') +
            '</p></div><div><b>周边消费</b><p>' +
            esc('景区门口餐饮溢价明显，往居民区走两条街，价格与口味都更接近本地。') +
            '</p></div></div>' +
            list(avoidItems()) +
            '<div class="sd-book-wrap"><h3><i class="fas fa-ticket"></i>预订入口</h3>' + bookingBlock() + '</div>');

        var profWho = (profileOfSpot(NAME) || {}).audience || WHO[cat];
        html += S('who', '人群适配 · 人格联动', 'Who',
            '<div class="sd-person">' + profWho.map(function (w) {
                return '<span><i class="fas ' + w[0] + '"></i>' + esc(w[1]) + '</span>';
            }).join('') + '</div>' +
            list([
                ['亲子', familyOf(cat) + '；提前约定集合点，避开正午与长距离爬升。'],
                ['老人', '优先选有观光车或平缓主线的走法，每 40 分钟安排一次休息。'],
                ['摄影', '把' + bestTime[cat] + '留给主景，其余时间拍细节与人。'],
                ['独行', '轻装、按主线走，夜间返程优先公共交通。']
            ]) + personaBlock());

        html += S('quiz', '行前认知小测', 'Quiz', quizBlock());

        var faqSpot = [
            ['需要提前预约吗？', needReserve(NAME)
                ? '需要。多数热门场馆实行实名预约，建议提前 1-7 天在官方小程序「' + miniOf(NAME) + '」查看余量。'
                : '一般现场购票即可；旺季与节假日建议提前 1-3 天在官方渠道买票，出发前再确认一次当日公告。'],
            ['大概要留多久？', '按' + duration[cat] + '安排比较从容；只有半天的话，优先保主线，周边点位留到下次。'],
            ['带老人或小孩合适吗？', familyOf(cat) + '。推车与轮椅建议先确认无障碍入口位置。'],
            ['下雨天还值得去吗？', (cat === 'museum' || cat === 'heritage')
                ? '值得，室内与廊下空间受天气影响小，反而更容易拍到干净的画面。'
                : '小雨可以，大雨建议改期；山野与湖边天气变化快，出发前看一次实时预报。'],
            ['停车方便吗？', '官方停车场旺季 9 点后常满，建议早到或直接坐公共交通；不要跟随路边拉客去私人停车场。'],
            ['讲解怎么选？', needReserve(NAME)
                ? '热门馆优先约官方人工讲解或租语音导览；免费讲解场次通常在大厅公示，先到先得。'
                : '语音导览更自由，人工讲解适合家庭；价格多在 ¥30-80，按需选择。']
        ];
        if (poiNote) faqSpot.unshift(['这里最值得看什么？', poiNote]);
        html += S('faq', '常见问题', 'FAQ', faqBlock(faqSpot));
    } else {
        var fp = dishProfile();
        var cuisine = cuisineOf();
        html += S('file', '菜品档案', 'Profile',
            factsGrid([
                ['菜系 / 归属', cuisine + (PROV && PROV !== '中国' ? ' · ' + PROV : '')],
                ['名称由来', dishOrigin()],
                ['主料', dishMain()],
                ['核心工艺', dishCraft()],
                ['搭配建议', pairSuggest()],
                ['赏味期', dishSeason()],
                ['人均参考', dishPrice()]
            ]) +
            p((CUISINE_TEXT[cuisine] || '以本地食材与本味为主，调味克制。') + ' 了解这类菜的口味底子，再尝' + NAME + '更有参照。') +
            (txt(info.desc) && !badFoodDesc(txt(info.desc)) ? p(info.desc) : ''));

        html += S('taste', '口感画像', 'Taste',
            '<div class="sd-flavor">' +
            '<div><b>主味</b><span>' + esc(fp.main) + '</span></div>' +
            '<div><b>辣度</b><span>' + esc(fp.spicy) + '</span></div>' +
            '<div><b>甜度</b><span>' + esc(fp.sweet) + '</span></div>' +
            '<div><b>口感</b><span>' + esc(fp.texture) + '</span></div>' +
            '</div>' +
            factsGrid([
                ['气味特征', fp.aroma.join(' / ')],
                ['适合餐次', dishScene()],
                ['分量建议', '2-3 人点小份多样，主食按人头点半份起']
            ]) +
            tagRow(fp.aroma.concat([fp.main, dishScene()])) +
            p('入口先感到' + fp.main + '，随后是食材本身的鲜味与' + fp.aroma[0] + '；' +
                (/面|粉|饭|馍|饼|饺|包|糕/.test(NAME) ? '趁热吃，放凉后口感会明显变硬。' : '趁热吃差别最大，放凉后香气会散。')));

        html += S('cook', '后厨做法工序', 'How It Is Made',
            steps(cookSteps()) +
            (txt(info.desc) && !badFoodDesc(txt(info.desc)) ? p('店家做法参考：' + txt(info.desc)) : '') +
            '<p class="sd-note">以上为这类菜品的通用工序与火候逻辑，具体用料配比、下锅顺序与火候时长以本地老店实际做法为准；不同店家会有自家调整。</p>');

        html += S('howto', '地道吃法', 'How to Eat', steps([
            ['先按默认来', '第一次请店家按本地默认做法上，先尝原味，再决定加辣、加醋或加汤。'],
            ['按顺序吃', /火锅|涮/.test(NAME)
                ? '先荤后素、先淡后浓，避免一开始就下重味食材。'
                : '先吃主料，再配主食或汤；' + (/汤|羹/.test(NAME) ? '汤先趁热喝一口。' : '让主食吸收最后一点汤汁。')],
            ['温度与分量', '出锅到入口的时间越短越好；2-3 人点小份多样，比一次点满更划算。'],
            ['点单行话', '少辣 / 不辣、不要香菜、走青、少油，直接说清楚即可，多数店家都会配合。']
        ]) + '<div class="sd-phrases">' + phraseTags().map(function (t) {
            return '<span>' + esc(t) + '</span>';
        }).join('') + '</div>');

        html += S('scene', '什么场景吃 · 怎么选店', 'Scene & Pick',
            factsGrid([
                ['适合场景', dishScene()],
                ['本地时段', '早餐 06:30-09:00 / 午餐 11:30-13:00 / 晚餐 17:30-19:30'],
                ['适合人数', '2-3 人分食最合适，单人建议点小份配一份汤'],
                ['预算', dishPrice() + '，景区周边通常比社区店高 30%-50%']
            ]) +
            list([
                ['选老店', '优先居民区开了多年的老店，菜单越简单越可靠。'],
                ['看排队', '本地人打包带走多的店更稳；游客长队不一定代表好吃。'],
                ['避开位置', '景区正门第一排、主街正中段的店，价格通常最高。'],
                ['看细节', '透明厨房、现做现卖、餐具干净，比招牌和装修更能说明问题。']
            ]) +
            p('有真实店铺后再补名称、地址、人均与营业时间；这里先给筛选方法，不编造店名。'));

        var dishNote = pickNote(DISH_NOTE, NAME);
        html += S('culture', '文化与在地联结', 'Culture',
            (dishNote ? p('这一口：' + dishNote) : '') + p(foodCulture()) +
            list([
                ['上桌场合', '本地早餐、正餐或伴手礼各有对应吃法；先看店家默认配什么主食与蘸料，再按口味调整。'],
                ['口味来由', '辣、酸、腌、鲜等口味多与本地气候、保存习惯和食材来源有关；具体流派以老店做法为准。'],
                ['食材时令', '优先选当季与本地食材的店，食材新鲜度比招牌装修更能决定一口味道。'],
                ['按需点单', '小份多样、减少浪费，优先支持本地老店与家庭作坊。']
            ]));

        html += S('avoid', '避坑与适配', 'Avoid',
            list([
                ['不适宜人群', /辣|椒|火锅|麻辣/.test(NAME)
                    ? '肠胃敏感、儿童与老人建议少辣或不辣；先点原味试口。'
                    : (/蟹|虾|海鲜/.test(NAME) ? '海鲜过敏者避开；痛风人群控制分量。' : '高油高盐，三高人群建议少量尝试。')],
                ['点单提醒', '景区正门第一排通常价格偏高、分量偏大；先看价目与计价方式，问清本地人怎么点再下单。'],
                ['同城互补', (relFoods.slice(0, 2).join('、') || '同城其他小吃') + '，一荤一素或一干一汤，组成一餐或一条小吃线最合适。'],
                ['点单前确认', '先问清计价方式（按份 / 按斤），再点；时令海鲜与称重菜品尤其要确认。']
            ]) +
            (relFoods.length ? '<div class="sd-rel-grid" style="margin-top:16px">' +
                relFoods.slice(0, 3).map(function (n) { return relCard(n, 'food'); }).join('') + '</div>' : ''));

        var fcmp = compareBlock();
        if (fcmp) html += S('compare', '同类对比', 'Compare', fcmp);
        html += S('quiz', '行前认知小测', 'Quiz', quizBlock());
        html += S('book', '预订入口', 'Booking', bookingBlock());

        var faqFood = [
            ['人均大概多少？', dishPrice() + '，按店铺与点单浮动；社区店通常比景区周边便宜 30% 左右。'],
            ['不能吃辣怎么办？', '点单时直接说“不辣 / 少辣”，多数本地店都会调整；也可以先点一份原味试口。'],
            ['哪一餐吃最合适？', dishScene() + '。想吃得从容选开市头半小时，想感受烟火气选正点高峰之后。'],
            ['怎么判断一家店好不好？', '看本地人打包带走什么、菜单是否简单、有没有透明厨房；避开景区正门第一排。'],
            ['可以打包带走吗？', '多数店支持打包；汤类与现炸类建议尽快吃，带回复热后口感会下降。'],
            ['有什么忌口要注意？', '常见忌口是辣、香菜、葱蒜与油量，直接说“走青”“少油”即可；海鲜类先确认过敏情况。']
        ];
        if (dishNote) faqFood.unshift(['这道菜怎么吃最地道？', dishNote]);
        html += S('faq', '常见问题', 'FAQ', faqBlock(faqFood));
    }

    $('sdMain').innerHTML = galleryBlock() +
        '<div class="sd-grid"><div class="sd-col">' + html + '</div>' + asideBlock() + '</div>';

    if (window.MYL_PANO) window.MYL_PANO.mountAll();

    /* ---------- 新功能增强：天气 / 地图导航 / 分享 / VR 云游 ---------- */
    if (window.MYL_ENRICH) window.MYL_ENRICH.run({
        name: NAME, city: info.city, loop: LOOP,
        type: IS_FOOD ? 'food' : 'spot',
        desc: info.desc, ticket: info.ticket || info.price,
        tip: info.tip, cat: cat,
        facts: (FACTS[IS_FOOD ? 'food' : cat] || []).slice(0, 4),
        relSpots: relSpots.slice(), relFoods: relFoods.slice(),
        hero: typeof heroSrc !== 'undefined' ? heroSrc : '',
        gallery: (typeof galItems !== 'undefined' ? galItems : []).map(function (g) {
            return { src: g.src, label: NAME + ' · ' + g.label };
        })
    });

    /* ---------- 导航 ---------- */
    var secs = Array.prototype.slice.call(document.querySelectorAll('.sd-sec'));
    $('sdLinks').innerHTML = secs.map(function (s) {
        var h = s.querySelector('h2').textContent;
        return '<a href="#' + s.id + '">' + esc(h) + '</a>';
    }).join('');

    function onScroll() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        $('sdProgress').style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
        var solid = h.scrollTop > $('sdHero').offsetHeight - 90;
        document.querySelector('.sd-nav').classList.toggle('solid', solid);
        var current = secs[0] ? secs[0].id : '';
        secs.forEach(function (s) {
            if (s.getBoundingClientRect().top < 150) current = s.id;
        });
        Array.prototype.forEach.call(document.querySelectorAll('#sdLinks a'), function (a) {
            a.classList.toggle('on', a.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- 冷知识轮换 ---------- */
    var factIdx = 0;
    var factBtn = $('sdFactBtn');
    if (factBtn) {
        factBtn.addEventListener('click', function () {
            var list = FACTS[IS_FOOD ? 'food' : cat] || [];
            if (!list.length) return;
            factIdx = (factIdx + 1) % list.length;
            var node = $('sdFactText');
            node.style.opacity = 0;
            setTimeout(function () { node.textContent = list[factIdx]; node.style.opacity = 1; }, 140);
        });
    }

    /* ---------- 心愿单 ---------- */
    var WISH_KEY = 'myl_wishlist';
    var wishId = TYPE + '|' + NAME + '|' + (LOOP || info.city);
    function readWish() {
        try { return JSON.parse(localStorage.getItem(WISH_KEY) || '[]') || []; } catch (e) { return []; }
    }
    function paintWish(on) {
        var b = $('sdWish');
        if (!b) return;
        b.classList.toggle('on', on);
        b.querySelector('i').className = (on ? 'fas' : 'far') + ' fa-heart';
        b.querySelector('span').textContent = on ? '已加入心愿单' : '加入心愿单';
    }
    paintWish(readWish().indexOf(wishId) >= 0);
    $('sdWish').addEventListener('click', function () {
        var arr = readWish();
        var at = arr.indexOf(wishId);
        if (at >= 0) { arr.splice(at, 1); paintWish(false); toast('已从心愿单移除'); }
        else { arr.push(wishId); paintWish(true); toast('已加入心愿单，可在本机查看'); }
        try { localStorage.setItem(WISH_KEY, JSON.stringify(arr)); } catch (e) {}
    });

    /* ---------- 行前小测 / 人格联动 ---------- */
    var quizBtn = $('sdQuizBtn');
    if (quizBtn) {
        quizBtn.addEventListener('click', function () {
            var qs = Array.prototype.slice.call(document.querySelectorAll('#sdQuiz .sd-q'));
            var correct = 0;
            var answered = 0;
            qs.forEach(function (q) {
                var picked = q.querySelector('input:checked');
                var a = q.querySelector('input').getAttribute('data-a');
                q.classList.remove('ok', 'bad');
                if (!picked) return;
                answered++;
                if (picked.value === a) { correct++; q.classList.add('ok'); }
                else q.classList.add('bad');
            });
            var res = $('sdQuizResult');
            if (!res) return;
            res.textContent = answered < qs.length
                ? '还有 ' + (qs.length - answered) + ' 题没答，选完再对答案。'
                : '答对 ' + correct + '/' + qs.length + '。' + (correct === qs.length
                    ? '可以出发了，出发前再看一眼当日公告。'
                    : '别急，回到上面的解说再看一遍，重点都在里面。');
            res.classList.add('in');
        });
    }
    var pSel = $('sdPersonaSel');
    if (pSel) {
        pSel.addEventListener('change', function () {
            var code = pSel.value;
            try { localStorage.setItem('mylPersona', code); } catch (e) {}
            var m = code && PERSONA_MATCH[code] ? PERSONA_MATCH[code][IS_FOOD ? 'food' : cat] : 0;
            var p = PERSONAS.filter(function (x) { return x[0] === code; })[0];
            var nameEl = $('sdPersonaName');
            var barEl = $('sdPersonaBar');
            var textEl = $('sdPersonaText');
            if (nameEl) nameEl.textContent = p ? p[1] : '未选择';
            if (barEl) barEl.style.width = (m ? m * 20 : 0) + '%';
            if (textEl) textEl.textContent = personaText(code, m);
        });
    }

    /* ---------- 大图 / 图集 ---------- */
    var galIdx = -1;
    function paintLightbox() {
        var it = galIdx >= 0 ? galItems[galIdx] : { src: heroSrc, label: '主图' };
        $('sdLightboxImg').src = it.src;
        $('sdLightboxImg').alt = NAME + ' ' + it.label;
        $('sdLightboxCap').textContent = (galIdx >= 0 ? (galIdx + 1) + ' / ' + galItems.length + ' · ' : '') + it.label;
        var multi = galIdx >= 0 && galItems.length > 1;
        $('sdPrev').style.display = multi ? '' : 'none';
        $('sdNext').style.display = multi ? '' : 'none';
    }
    function openLightbox(idx) {
        galIdx = typeof idx === 'number' ? idx : -1;
        paintLightbox();
        $('sdLightbox').classList.add('in');
        document.body.style.overflow = 'hidden';
    }
    function stepLightbox(n) {
        if (galIdx < 0) return;
        galIdx = (galIdx + n + galItems.length) % galItems.length;
        paintLightbox();
    }
    function closeLightbox() {
        $('sdLightbox').classList.remove('in');
        document.body.style.overflow = '';
    }
    $('sdExpand').addEventListener('click', function () { openLightbox(0); });
    $('sdHeroImg').addEventListener('click', function () { openLightbox(0); });
    Array.prototype.forEach.call(document.querySelectorAll('.sd-gal button'), function (b) {
        b.addEventListener('click', function () { openLightbox(Number(b.getAttribute('data-i')) || 0); });
    });
    $('sdPrev').addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(-1); });
    $('sdNext').addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(1); });
    $('sdLightboxClose').addEventListener('click', closeLightbox);
    $('sdLightbox').addEventListener('click', function (e) { if (e.target === $('sdLightbox')) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
        if (!$('sdLightbox').classList.contains('in')) return;
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
    });

    /* ---------- 复制链接 ---------- */
    var toastTimer;
    function toast(msg) {
        var t = $('sdToast');
        t.textContent = msg;
        t.classList.add('in');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('in'); }, 2200);
    }
    $('sdShare').addEventListener('click', function () {
        var url = location.href;
        function done() { toast('链接已复制，可直接分享'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done, function () { toast('复制失败，请手动复制地址栏'); });
        } else {
            var i = document.createElement('input');
            i.value = url;
            document.body.appendChild(i);
            i.select();
            try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动复制地址栏'); }
            document.body.removeChild(i);
        }
    });
})();
