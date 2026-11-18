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

    /* ---------- 分类 ---------- */
    function catOf(n) {
        if (/博物馆|博物院|纪念馆|美术馆|科技馆|展览馆|图书馆/.test(n)) return 'museum';
        if (/古镇|古城|老街|古街|街|巷|夜市|广场|商圈|步行街/.test(n)) return 'street';
        if (/寺|庙|宫|祠|塔|陵|楼|阁|关|城墙|书院|遗址|石窟|府|故居|教堂/.test(n)) return 'heritage';
        if (/山|峰|湖|海|岛|湾|峡|谷|江|河|湿地|森林|草原|沙漠|瀑布|温泉|洞|滩|岭|溪|潭|岩|梯田|冰川/.test(n)) return 'nature';
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
        landmark: '地标先是被看见，然后才被记住。它承载的不只是建筑本身，还有一座城市想对外表达的形象。'
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
    var heroQ = info.q || ((info.city || info.loopName || '') + ' ' + NAME +
        (IS_FOOD ? ' 美食 自然光 特写 实拍' : ' 写实风光 氛围感 高清 构图舒展'));
    var heroSrc = photo(heroQ);

    document.title = NAME + ' · ' + (info.city || info.loopName || '旅行') + ' | MYL 旅行';
    $('sdHeroImg').src = heroSrc;
    $('sdHeroImg').alt = NAME;
    $('sdHeroImg').onerror = function () { this.onerror = null; this.src = fallbackImg; };
    $('sdKicker').textContent = [info.region, info.loopName || info.city].filter(Boolean).join(' · ');
    $('sdTitle').textContent = NAME;
    $('sdSlogan').textContent = IS_FOOD ? foodSlogan() : SLOGAN[cat];

    var meta = IS_FOOD
        ? [['fa-utensils', info.desc ? txt(info.desc).slice(0, 10) : '本地风味'],
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
            '<div class="sd-card"><h3><i class="fas fa-star-half-stroke"></i>' + (IS_FOOD ? '口味参考' : '编辑评分') + '</h3>' +
            '<div class="sd-score">' + scoreRows() + '</div>' +
            '<p class="sd-aside-note">按本地人口味、出片度与性价比分层展示，不替代真实评价；拥挤与步行强度越高越需注意。<br>核查日期 ' + CHECK_DATE + '。</p></div>' +
            (IS_FOOD ? mealBlock() : monthBlock()) +
            mapCard() + quoteCard() + sourceCard() + '</aside>';
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

    var NATURE_TYPES = [
        [/湖|潭|海子/, '湖泊'], [/峡|谷/, '峡谷'], [/瀑布/, '瀑布'], [/湿地/, '湿地'],
        [/草原/, '草原'], [/沙漠|沙坡|戈壁|沙湖/, '沙漠 / 沙地'], [/岛|湾|沙滩|海滩|海岸/, '海岸 / 海岛'],
        [/冰川/, '冰川'], [/梯田/, '梯田'], [/森林/, '森林'], [/洞/, '溶洞'],
        [/温泉/, '温泉'], [/江|河|溪/, '河流'], [/山|峰|岭|岩/, '山地']
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
        [/石窟/, '石窟'], [/塔/, '古塔'], [/陵|墓/, '陵寝'], [/城墙|关|门/, '城防'],
        [/古镇|古城|村/, '聚落'], [/书院/, '书院'], [/寺|庙|庵|观/, '宗教建筑'],
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
        '教堂': '近代教堂常见哥特式、罗马式或折衷样式，看立面构图、玫瑰花窗与材料工艺，也能读到当时的建造技术。'
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

    function sceneBlock() {
        var sc = SCENES[cat] || SCENES.landmark;
        return '<div class="sd-scenes">' + sc.map(function (s) {
            return '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>';
        }).join('') + '</div>' +
            '<div class="sd-two">' +
            '<div><b>晴天</b><p>' + esc(cat === 'nature' ? '通透度高，适合拍远景与水面；正午找背阴处，防晒按全天准备。' : '适合看建筑外立面与街巷，光线硬时多用廊下与阴影做前景。') + '</p></div>' +
            '<div><b>雨天</b><p>' + esc(cat === 'museum' ? '博物馆与展馆几乎不受影响，反而人少；带好伞套与防滑鞋。' : (cat === 'nature' ? '小雨更有氛围，但山路湿滑、水边涨水，量力而行；大雨改期。' : '雨天游客少、石板路反光好看；注意台阶湿滑与闭园时间。')) + '</p></div>' +
            '</div>' +
            '<p class="sd-note">跟团多在 10:30-15:00 集中抵达；自由行把主景点放在开园后或闭园前，体感差别最大。</p>';
    }
    function ecoBlock() {
        var e = ECO[cat] || ECO.landmark;
        return '<div class="sd-eco"><div class="sd-eco-head"><b>可持续游览</b><span>MYL 生态旅行准则</span></div>' +
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
        [/烤|烧|炙/, '腌制—风干或挂炉—控火，外皮与内部熟度要分开判断'],
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
    function dishScene() {
        if (/面|粉|粥|包|饺|馍|饼|豆浆|油条|早茶/.test(NAME)) return '早餐 / 午餐';
        if (/烧烤|火锅|串|夜宵|小龙虾|啤酒/.test(NAME)) return '晚餐 / 夜宵';
        if (/糕|饼|酥|糖|茶|酱|腊|干货/.test(NAME)) return '小吃 / 伴手礼';
        return '午餐 / 晚餐';
    }
    function dishSeason() {
        if (/蟹|蟹黄|大闸蟹/.test(NAME)) return '秋季（9-11 月）最肥美';
        if (/笋|春|荠菜|香椿/.test(NAME)) return '春季（3-5 月）最佳';
        if (/羊肉|羊汤|火锅/.test(NAME)) return '秋冬最合适';
        if (/凉|冷面|冰|酸梅/.test(NAME)) return '夏季更舒服';
        return '全年可吃；本地时令蔬菜上市时风味更好';
    }
    function dishProfile() {
        var spicy = /辣|椒|火锅|麻辣|剁椒|酸辣/.test(NAME) ? '明显' : (/胡椒|微辣/.test(NAME) ? '轻微' : '无');
        var sweet = /甜|糖|蜜|糕|奶|芋|豆沙/.test(NAME) ? '明显' : (/红烧|酱|卤/.test(NAME) ? '轻' : '无');
        var texture = /面|粉|饭|馍|饼|饺|包|糕/.test(NAME) ? '扎实 / 软糯' :
            (/脆|酥|炸|烤/.test(NAME) ? '外脆内嫩' : (/汤|羹|粥/.test(NAME) ? '汤感顺滑' : '紧实 / 鲜嫩'));
        var main = /酸|醋|泡/.test(NAME) ? '酸爽' : (/咸|卤|酱|盐水/.test(NAME) ? '咸鲜' :
            (/甜|糖|蜜/.test(NAME) ? '甜香' : (/辣|椒/.test(NAME) ? '香辣' : '鲜香')));
        var aroma = [];
        if (/烤|烧|炙/.test(NAME)) aroma.push('焦香');
        if (/卤|酱|盐水/.test(NAME)) aroma.push('卤香');
        if (/辣|椒/.test(NAME)) aroma.push('椒香');
        if (/蒜/.test(NAME)) aroma.push('蒜香');
        if (/茶/.test(NAME)) aroma.push('茶香');
        if (/奶|酪/.test(NAME)) aroma.push('乳香');
        if (!aroma.length) aroma.push('食材本香');
        return { main: main, spicy: spicy, sweet: sweet, texture: texture, aroma: aroma };
    }
    function cuisineOf() {
        return CUISINE[PROV] || '地方风味';
    }
    function dishPrice() {
        if (txt(info.price)) return info.price;
        var ps = { '早餐 / 午餐': '¥12-30', '晚餐 / 夜宵': '¥50-120', '小吃 / 伴手礼': '¥15-60' };
        return ps[dishScene()] || '¥30-80';
    }
    function dishOrigin() {
        if (NAME.indexOf(CITY_SHORT) >= 0 && CITY_SHORT) return '以地名命名，说明它与' + CITY_SHORT + '的饮食传统直接绑定；具体起源有民间说法与店家演绎多个版本。';
        if (/烤|卤|腌|蒸|炸|炒|拌|炖|煮/.test(NAME)) return '以核心做法命名，做法本身就是这道菜的身份标识。';
        if (/鸭|鸡|牛|羊|鱼|虾|蟹|猪|面|粉|米|豆/.test(NAME)) return '以主料命名，名字越朴素，越考验选料与火候。';
        return '名字来自本地人的日常叫法，具体源流以地方饮食志与老店说法为准。';
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
                var fp = dishProfile();
                return '<tr class="' + (i === 0 ? 'cur' : '') + '"><td>' + esc(n) + '</td>' +
                    '<td>' + esc(i === 0 ? dishPrice() : '¥30-80') + '</td>' +
                    '<td>' + esc(i === 0 ? fp.main : ['鲜香', '咸鲜', '香辣'][i % 3]) + '</td>' +
                    '<td>' + esc(i === 0 ? fp.spicy : ['无', '轻微', '明显'][i % 3]) + '</td>' +
                    '<td>' + esc(i === 0 ? dishScene() : '午餐 / 晚餐') + '</td>' +
                    '<td>' + esc(['本地口碑', '游客打卡', '顺路小份'][i % 3]) + '</td></tr>';
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
                ? '菜系归属、工艺与赏味期整理自地方饮食志与公开资料，核查日期 ' + CHECK_DATE + '。'
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

    function deepRows() {
        var peers = relSpots.slice(0, 3).join('、');
        if (cat === 'nature') {
            return [
                ['地貌类型', NATURE_TYPE + '地貌'],
                ['形成过程', NATURE_FORM[NATURE_TYPE] || STORY.nature],
                ['植被与物种', '随海拔与坡向变化明显：阴坡湿润、阳坡干燥；春季花期、夏季浓绿、秋季彩叶，是最直观的三季变化。'],
                ['季节变化', '水量与光线随季节改变：丰水期水面开阔，枯水期更容易看清岸线与岩层；一天之内清晨与黄昏的差别也很大。'],
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
            ['建成背景', '地标往往对应一次城市事件：开埠、赛事、纪念或城市更新。'],
            ['造型与结构', '看比例、材料与结构逻辑，再对比同一时期的其他建筑。'],
            ['城市角色', '它既是拍照对象，也是本地人约定见面的坐标。'],
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
            items.push(['飞机 / 高铁', '落地后优先选地铁或机场大巴进城，再换乘公交或打车到景区。']);
            items.push(['市内交通', '市区打车约 20-40 分钟；公交多有直达线路，留意末班车时间。']);
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
        return '在' + (CITY_SHORT || '当地') + '，' + NAME + '常出现在' + dishScene() + '的场景里。' +
            '它与本地的节气、集市和家庭餐桌绑定：' + (/腌|腊|糟|酱/.test(NAME)
                ? '过去靠腌制与风干延长保存期，如今成了地方风味的记忆点。'
                : (/面|粉|饭|馍|饼/.test(NAME) ? '主食形态稳定，最能反映本地人的日常口味。'
                    : '节庆与待客时更常见，做法往往比日常更讲究。')) +
            '食材多来自' + prov + '本地的农业与水产，点单时问一句“今天什么最新鲜”，通常能得到更地道的推荐。';
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
            p(STORY[cat]) +
            (cmp ? p('同类横向对比见下表，带底色的一行为当前页面。') + cmp : ''));

        html += S('read', '怎么看才看懂', 'How to Read', steps(READ[cat]));

        html += S(cat === 'nature' ? 'geo' : 'history', cat === 'nature' ? '地理与成因' : '历史与人文',
            cat === 'nature' ? 'Landform' : 'History',
            accList(deepRows()) + (info.desc ? p(info.desc) : ''));

        html += S('eco', '生态旅游解说', 'Eco Travel', ecoBlock());
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

        html += S('who', '人群适配 · 人格联动', 'Who',
            '<div class="sd-person">' + WHO[cat].map(function (w) {
                return '<span><i class="fas ' + w[0] + '"></i>' + esc(w[1]) + '</span>';
            }).join('') + '</div>' +
            list([
                ['亲子', familyOf(cat) + '；提前约定集合点，避开正午与长距离爬升。'],
                ['老人', '优先选有观光车或平缓主线的走法，每 40 分钟安排一次休息。'],
                ['摄影', '把' + bestTime[cat] + '留给主景，其余时间拍细节与人。'],
                ['独行', '轻装、按主线走，夜间返程优先公共交通。']
            ]) + personaBlock());

        html += S('quiz', '行前认知小测', 'Quiz', quizBlock());

        html += S('faq', '常见问题', 'FAQ', faqBlock([
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
        ]));
    } else {
        var fp = dishProfile();
        var cuisine = cuisineOf();
        html += S('file', '菜品档案', 'Profile',
            factsGrid([
                ['菜系 / 归属', cuisine + (PROV ? ' · ' + PROV : '')],
                ['名称由来', dishOrigin()],
                ['主料', dishMain()],
                ['核心工艺', dishCraft()],
                ['赏味期', dishSeason()],
                ['人均参考', dishPrice()]
            ]) +
            p((CUISINE_TEXT[cuisine] || '以本地食材与本味为主，调味克制。') + ' ' + NAME + '是其中最有代表性的一口。') +
            (info.desc ? p(info.desc) : ''));

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

        html += S('culture', '文化与在地联结', 'Culture', p(foodCulture()) +
            list([
                ['节庆与习俗', '留意这道菜在节气、婚宴与待客中的位置；同样的做法，场合不同讲究也不同。'],
                ['迁徙与商道', '口味往往随人口迁徙与商路变化，辣、酸、腌的使用常与保存条件和气候有关。'],
                ['食材与农业', '本地农业、渔业与手作决定了它的上限；优先选当季与本地食材的店。'],
                ['可持续', '按需点单、减少浪费，优先支持本地小店与家庭作坊。']
            ]));

        html += S('avoid', '避坑与适配', 'Avoid',
            list([
                ['不适宜人群', /辣|椒|火锅|麻辣/.test(NAME)
                    ? '肠胃敏感、儿童与老人建议少辣或不辣；先点原味试口。'
                    : (/蟹|虾|海鲜/.test(NAME) ? '海鲜过敏者避开；痛风人群控制分量。' : '高油高盐，三高人群建议少量尝试。')],
                ['常见踩雷', '景区正门第一排价格偏高、分量偏大；改良版口味可能不正宗，先问本地人怎么点。'],
                ['同城互补', (relFoods.slice(0, 2).join('、') || '同城其他小吃') + '，一荤一素或一干一汤，组成一餐或一条小吃线最合适。'],
                ['点单前确认', '先问清计价方式（按份 / 按斤），再点；时令海鲜与称重菜品尤其要确认。']
            ]) +
            (relFoods.length ? '<div class="sd-rel-grid" style="margin-top:16px">' +
                relFoods.slice(0, 3).map(function (n) { return relCard(n, 'food'); }).join('') + '</div>' : ''));

        var fcmp = compareBlock();
        if (fcmp) html += S('compare', '同类对比', 'Compare', fcmp);
        html += S('quiz', '行前认知小测', 'Quiz', quizBlock());
        html += S('book', '预订入口', 'Booking', bookingBlock());

        html += S('faq', '常见问题', 'FAQ', faqBlock([
            ['人均大概多少？', dishPrice() + '，按店铺与点单浮动；社区店通常比景区周边便宜 30% 左右。'],
            ['不能吃辣怎么办？', '点单时直接说“不辣 / 少辣”，多数本地店都会调整；也可以先点一份原味试口。'],
            ['哪一餐吃最合适？', dishScene() + '。想吃得从容选开市头半小时，想感受烟火气选正点高峰之后。'],
            ['怎么判断一家店好不好？', '看本地人打包带走什么、菜单是否简单、有没有透明厨房；避开景区正门第一排。'],
            ['可以打包带走吗？', '多数店支持打包；汤类与现炸类建议尽快吃，带回复热后口感会下降。'],
            ['有什么忌口要注意？', '常见忌口是辣、香菜、葱蒜与油量，直接说“走青”“少油”即可；海鲜类先确认过敏情况。']
        ]));
    }

    $('sdMain').innerHTML = galleryBlock() +
        '<div class="sd-grid"><div class="sd-col">' + html + '</div>' + asideBlock() + '</div>';

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
