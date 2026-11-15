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

    var html = '';

    if (!IS_FOOD) {
        // 位置交通
        var locBase = info.loc
            ? (/环线|自驾/.test(info.city) ? info.loc : info.city + '，' + info.loc)
            : (info.city || info.region);
        var locText = '位于' + locBase + '。';
        var routeText = '从市区出发，打车约 20-40 分钟；公交可到景区门口，自驾建议提前确认停车位。'
            + (nextSpot ? '与「' + nextSpot + '」串成半日线，路线更顺。' : '把周边点位安排在同一段步行范围内，能省下不少来回。');
        var loc2 = '建议把' + NAME + '安排在' + bestTime[cat] + '，光线和人流都更友好。';
        html += sec('location', '01', '位置交通', 'Location', p(locText) + p(routeText) + p(loc2));

        // 核心亮点
        html += sec('highlights', '02', '核心亮点', 'Highlights',
            list(HIGHLIGHT[cat].map(function (h) { return [h[0], h[1]]; })));

        // 文化故事
        var story1 = info.desc || (NAME + '是' + (info.city || info.region) + '很有代表性的一站，'
            + '它的价值不只在画面，也在它和这座城的关系。');
        html += sec('story', '03', '文化故事', 'Story', p(story1) + p(STORY[cat]) + factBlock(cat));

        // 打卡贴士
        html += sec('tips', '04', '打卡贴士', 'Tips', list(TIPS[cat]));

        // 适配人群
        var whoBody = '<div class="sd-person">' + WHO[cat].map(function (w) {
            return '<span><i class="fas ' + w[0] + '"></i>' + esc(w[1]) + '</span>';
        }).join('') + '</div>' + '<p class="sd-note">'
            + esc('适合安排在' + (info.city || info.region) + '行程的第 1-2 天，作为当天主线；如果只有半天，优先保核心亮点，周边点位留到下次。')
            + '</p>';
        html += sec('who', '05', '适配人群', 'Who', whoBody)
            + '<p class="sd-note">门票、开放时间与预约政策以景区当日公告为准。</p>';

        var relList = relSpots.slice(0, 3).map(function (n) { return relCard(n, 'spot'); })
            .concat(relFoods.slice(0, 2).map(function (n) { return relCard(n, 'food'); }));
        if (relList.length) {
            html += sec('nearby', '06', '顺路再去', 'Nearby',
                '<div class="sd-rel-grid">' + relList.join('') + '</div>');
        }
        html += sec('check', relList.length ? '07' : '06', '打卡清单', 'Checklist',
            checkBlock(['到现场拍一张构图舒展的照片', '走完主线，找到一处自己的私藏机位', '在周边吃一顿本地味道']));
    } else {
        // 原料工艺
        var craft = info.desc || (NAME + '是' + info.city + '很有代表性的本地味道，核心在于食材新鲜和火候准确。');
        html += sec('craft', '01', '原料工艺', 'Craft',
            p(craft) + p('以本地常见食材为主，讲究现做现吃；调味不复杂，火候和出锅时间才是成败关键。') + factBlock('food'));

        // 口感
        var fl = { name: '本地风味', score: 74 };
        FLAVOR.forEach(function (f) { if (f[0].test(NAME)) fl = { name: f[1], score: f[2] }; });
        var flavorHtml = '<div class="sd-flavor">' +
            '<div><b>主调</b><span>' + esc(fl.name) + '</span></div>' +
            '<div><b>辣度</b><span>' + (/辣|椒|火锅|麻辣/.test(NAME) ? '明显' : '轻') + '</span></div>' +
            '<div><b>甜度</b><span>' + (/甜|糖|糕|蜜|奶/.test(NAME) ? '明显' : '轻') + '</span></div>' +
            '<div><b>口感</b><span>' + (/面|粉|饭|馍|饼|饺|包/.test(NAME) ? '扎实' : '鲜嫩') + '</span></div>' +
            '</div>';
        html += sec('taste', '02', '口感', 'Taste',
            flavorHtml + p('入口先是' + fl.name + '，随后是食材本身的鲜味；整体不腻，趁热吃差别最大。余味干净，适合作为一餐的主味。'));

        // 地道吃法
        html += sec('howto', '03', '地道吃法', 'How to Eat', steps([
            ['先按默认来', '第一次吃请店家按本地默认做法上，先尝原味，再决定加辣、加醋或加汤。'],
            ['小份多样', '主食点基础款，配一份本地小菜或汤；不够再加，避免一次点太多。'],
            ['趁热吃完', '出锅到入口的时间越短越好，放凉后口感和香气都会明显下降。']
        ]));

        // 本地小贴士
        var tipsFood = [
            ['时段', '午餐 11:00-12:00、晚餐 17:30-19:00 更从容，避开正点高峰。'],
            ['价格', info.price ? '人均参考 ' + info.price + '，按店铺与点单浮动。' : '人均约 ¥30-80，社区店通常更实惠。'],
            ['选店', '优先选本地人排队、菜单不复杂的店，避开景区正门第一排。'],
            ['搭配', '配一杯本地茶饮或清汤，整顿饭的节奏更舒服。']
        ];
        html += sec('tips', '04', '本地小贴士', 'Tips', list(tipsFood));

        var relFood = relFoods.slice(0, 4).map(function (n) { return relCard(n, 'food'); });
        if (relFood.length) {
            html += sec('nearby', '05', '顺路再去', 'Nearby',
                '<div class="sd-rel-grid">' + relFood.join('') + '</div>');
        }
        html += sec('check', relFood.length ? '06' : '05', '打卡清单', 'Checklist',
            checkBlock(['按本地默认吃法先尝原味', '找到一家本地人排队的店', '记住这一口的味道']));
    }

    $('sdMain').innerHTML = html;

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

    /* ---------- 打卡清单 ---------- */
    var CHECK_KEY = 'myl_check_' + TYPE + '_' + NAME;
    var checkBoxes = Array.prototype.slice.call(document.querySelectorAll('#sdCheck input'));
    function readCheck() {
        try { return JSON.parse(localStorage.getItem(CHECK_KEY) || '{}') || {}; } catch (e) { return {}; }
    }
    function paintCheck() {
        var done = checkBoxes.filter(function (c) { return c.checked; }).length;
        $('sdCheckCount').textContent = done + '/' + checkBoxes.length;
        $('sdCheckBar').style.width = (checkBoxes.length ? (done / checkBoxes.length) * 100 : 0) + '%';
        checkBoxes.forEach(function (c) {
            c.closest('li').classList.toggle('on', c.checked);
        });
    }
    var savedCheck = readCheck();
    checkBoxes.forEach(function (c) {
        c.checked = !!savedCheck[c.getAttribute('data-i')];
        c.addEventListener('change', function () {
            savedCheck[c.getAttribute('data-i')] = c.checked;
            try { localStorage.setItem(CHECK_KEY, JSON.stringify(savedCheck)); } catch (e) {}
            paintCheck();
        });
    });
    paintCheck();

    /* ---------- 大图 ---------- */
    function openLightbox(src) {
        $('sdLightboxImg').src = src;
        $('sdLightbox').classList.add('in');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        $('sdLightbox').classList.remove('in');
        document.body.style.overflow = '';
    }
    $('sdExpand').addEventListener('click', function () { openLightbox(heroSrc); });
    $('sdHeroImg').addEventListener('click', function () { openLightbox(heroSrc); });
    $('sdLightboxClose').addEventListener('click', closeLightbox);
    $('sdLightbox').addEventListener('click', function (e) { if (e.target === $('sdLightbox')) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });

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
