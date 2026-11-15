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

    /* ---------- 数据解析 ---------- */
    var info = {
        name: NAME, city: CITY, region: '', loopName: '', desc: '', ticket: '',
        price: '', q: '', loc: '', day: '', tip: ''
    };
    var related = { spots: [], foods: [] };

    function fillRegionByProvince(cityName, fallback) {
        var provs = window.PROVINCES_ALL || [];
        for (var i = 0; i < provs.length; i++) {
            var cs = provs[i].cities || [];
            for (var j = 0; j < cs.length; j++) {
                if (cs[j].name === cityName) return provs[i].name;
            }
        }
        return fallback || '';
    }

    // 环线数据
    var guides = window.LOOP_GUIDES || {};
    if (LOOP && guides[LOOP]) {
        var g = guides[LOOP];
        info.loopName = g.name || LOOP;
        info.region = g.province || g.region || fillRegionByProvince(CITY, '');
        var gList = (IS_FOOD ? g.foods : g.spots) || [];
        gList.forEach(function (x) {
            if (!x) return;
            if (x.n === NAME) {
                info.desc = txt(x.d || x.desc);
                info.q = txt(x.q);
                info.loc = txt(x.loc || x.w);
                info.ticket = txt(x.ticket);
                info.price = txt(x.p || x.price);
                info.tip = txt(x.tip);
            } else {
                (IS_FOOD ? related.foods : related.spots).push(x);
            }
        });
        (IS_FOOD ? g.spots : g.foods || []).forEach(function (x) {
            if (x) (IS_FOOD ? related.spots : related.foods).push(x);
        });
    }

    // 城市富数据
    var CD = window.CITY_DETAIL || {};
    var detail = null;
    if (CITY) {
        Object.keys(CD).forEach(function (k) {
            var d = CD[k];
            if (!detail && d && (d.name === CITY || k === CITY)) detail = d;
        });
    }
    if (!detail) {
        Object.keys(CD).forEach(function (k) {
            var d = CD[k];
            if (!d) return;
            var hit = (d.routePins || []).indexOf(NAME) >= 0;
            if (!hit && (IS_FOOD ? d.foods : []) .length) {
                hit = (d.foods || []).some(function (f) { return f && f.name === NAME; });
            }
            if (!hit) {
                (d.itinerary || []).forEach(function (day) {
                    (day.timeline || []).forEach(function (t) {
                        if (String(t.activity || '').indexOf(NAME) >= 0) hit = true;
                    });
                });
            }
            if (hit && !detail) detail = d;
        });
    }
    if (detail) {
        info.city = info.city || detail.name || '';
        info.region = info.region || (detail.country && detail.country !== '中国'
            ? detail.country
            : fillRegionByProvince(info.city, detail.country)) || '';
        if (IS_FOOD) {
            (detail.foods || []).forEach(function (f) {
                if (!f) return;
                if (f.name === NAME) {
                    info.desc = info.desc || txt(f.desc || f.d);
                    info.price = info.price || txt(f.price || f.p);
                } else {
                    related.foods.push(f);
                }
            });
        } else {
            (detail.routePins || []).forEach(function (p) {
                if (p && p !== NAME) related.spots.push({ n: p });
            });
            (detail.itinerary || []).forEach(function (day) {
                (day.timeline || []).forEach(function (t) {
                    var act = String(t.activity || '');
                    if (act.indexOf(NAME) >= 0) {
                        info.desc = info.desc || txt(t.detail);
                        info.ticket = info.ticket || txt(t.ticket);
                        info.price = info.price || txt(t.price);
                        info.tip = info.tip || txt(t.tip);
                        info.day = info.day || (day.day || day.title || '');
                        info.region = info.region || fillRegionByProvince(info.city, '');
                    }
                });
            });
            (detail.foods || []).forEach(function (f) { if (f) related.foods.push(f); });
        }
    }
    if (!info.city && info.loopName) info.city = info.loopName;
    if (!info.region) info.region = '中国';

    // 去重 + 排除自身
    function dedupe(list) {
        var seen = {}, out = [];
        (list || []).forEach(function (x) {
            var n = txt(x && x.n ? x.n : x && x.name ? x.name : '');
            if (!n || n === NAME || seen[n]) return;
            seen[n] = 1;
            out.push(x.n ? x : { n: n, d: txt(x.desc || x.d) });
        });
        return out;
    }
    related.spots = dedupe(related.spots);
    related.foods = dedupe(related.foods);

    /* ---------- 文案画像 ---------- */
    function catOf(n) {
        if (/博物馆|博物院|纪念馆|美术馆|科技馆|展览馆|图书馆/.test(n)) return 'museum';
        if (/古镇|古城|老街|古街|街|巷|夜市|广场|商圈|步行街/.test(n)) return 'street';
        if (/寺|庙|宫|祠|塔|陵|楼|阁|关|城墙|书院|遗址|石窟|府|故居|教堂/.test(n)) return 'heritage';
        if (/山|峰|湖|海|岛|湾|峡|谷|江|河|湿地|森林|草原|沙漠|瀑布|温泉|洞|滩|岭|溪|潭|岩|梯田|冰川/.test(n)) return 'nature';
        return 'landmark';
    }
    var catLabel = { nature: '自然山水', heritage: '人文古迹', museum: '博物馆 / 展馆', street: '街区 / 夜游', landmark: '城市地标' };
    var catEmoji = { nature: '山水', heritage: '古迹', museum: '展馆', street: '街区', landmark: '地标' };
    var cat = catOf(NAME);

    var DURATION = { nature: '3-4 小时', heritage: '2-3 小时', museum: '2-3 小时', street: '2-3 小时', landmark: '1.5-2 小时' };
    var BESTTIME = {
        nature: '清晨或日落前，光线和体感都更好',
        heritage: '上午 9:00-11:00，人少、侧光好',
        museum: '开馆后 1 小时内入场，避开团队',
        street: '傍晚到夜间，店陆续开齐',
        landmark: '傍晚亮灯前后，一次看两种面貌'
    };

    var HL = {
        nature: [
            ['fa-mountain-sun', '看什么', '先抓住主景的层次：远山轮廓、水面反光与近处植被，是这类地方最出片的三个元素。'],
            ['fa-sun', '光线时间', '尽量避开正午硬光，清晨与日落前的侧光会让' + NAME + '的立体感明显更强。'],
            ['fa-person-hiking', '体力节奏', '把爬升或长距离步行放在前面，中段安排休息，返程留出缓冲，不必追求走满全程。']
        ],
        heritage: [
            ['fa-landmark', '建筑细节', '先看整体格局再退回细节：屋檐、梁柱、碑刻与门楣，往往比打卡点更能说明' + NAME + '的来路。'],
            ['fa-scroll', '历史线索', '顺着时间线看，会比单独看某座建筑更有意思；遇到讲解牌不妨停两分钟。'],
            ['fa-route', '参观顺序', '按中轴或主线走到底，再折回看偏殿、侧院，避免来回折返。']
        ],
        museum: [
            ['fa-gem', '镇馆之宝', '进门先拿导览图，锁定一到两件必看展品，再按楼层动线补齐其他展厅。'],
            ['fa-clock', '动线安排', '大馆至少留 2 小时；先看常设精华，再看临展，避免时间被入口展区吃掉。'],
            ['fa-headphones', '讲解与预约', '热门馆通常需要提前预约，语音导览或人工讲解能显著提升信息密度。']
        ],
        street: [
            ['fa-store', '街巷肌理', '主街适合快速认识' + NAME + '，真正有意思的小店通常在支巷里。'],
            ['fa-utensils', '在地生活', '看本地人排队买什么，跟着买一小份，比按攻略打卡更接近真实味道。'],
            ['fa-moon', '夜色与小吃', '傍晚之后再走一遍，灯亮起来后街区气质会完全不同。']
        ],
        landmark: [
            ['fa-camera', '城市符号', NAME + '是这座城市最容易被认出的画面之一，先找到经典机位，再慢慢逛周边。'],
            ['fa-image', '拍照机位', '正面广角拍全景，侧后方拍结构线条；夜间用长曝光更容易出片。'],
            ['fa-map-location-dot', '周边串联', '把周边两三个点串成一条步行线，比单独来一次更划算。']
        ]
    };

    var QUOTE = {
        nature: '好风景不急着一次看完：留一点时间坐着，反而记得更久。',
        heritage: '先理解它为什么在这里，再决定拍哪一张。',
        museum: '展柜里的每件东西，都值得你用一分钟去读完说明牌。',
        street: '旅行的味道，常常藏在主街拐进去的那条巷子里。',
        landmark: '地标负责被看见，周边的生活负责被记住。'
    };

    function foods_lead() {
        return info.desc || ('到' + info.city + '，这口' + NAME + '值得专门留出一顿饭的时间。');
    }

    var FLAVOR = [
        [/辣|椒|火锅|冒菜|麻辣/, '香辣', 86],
        [/甜|糖|糕|蜜|冰|奶/, '甜香', 72],
        [/酸|醋|腌|泡/, '酸爽', 66],
        [/鲜|海鲜|汤|蒸|清/, '鲜味', 82],
        [/面|粉|饭|馍|饼|饺子|包/, '主食感', 88],
        [/烤|烧|炸|煎|卤/, '焦香', 80]
    ];

    /* ---------- 图片 ---------- */
    function photo(q, w, h) {
        return 'https://tse1-mm.cn.bing.net/th?q=' + encodeURIComponent(q) + '&w=' + w + '&h=' + h + '&c=7&rs=1&p=0&dpr=1.5&pid=1.7';
    }
    function photoQ(subject) {
        if (info.q) return info.q;
        var ctx = info.city || info.loopName || '';
        return ctx + ' ' + subject + (IS_FOOD ? ' 美食 菜品' : ' 景点 实景');
    }
    function fallback() { return IS_FOOD ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg'; }
    function imgTag(src, alt, cls) {
        return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + fallback() + '\';" />';
    }

    var heroSrc = photo(photoQ(NAME), 1600, 1000);

    /* ---------- 头部 ---------- */
    document.title = NAME + ' · ' + (info.city || info.loopName || '旅行') + ' | MYL 旅行';
    $('sdHeroImg').src = heroSrc;
    $('sdHeroImg').alt = NAME;
    $('sdHeroImg').onerror = function () { this.onerror = null; this.src = fallback(); };
    $('sdKicker').textContent = [info.region, info.loopName || info.city, '旅行百科'].filter(Boolean).join(' · ');
    $('sdType').textContent = IS_FOOD ? '美食 · FOOD' : catEmoji[cat] + ' · ' + catLabel[cat];
    $('sdTitle').textContent = NAME;
    $('sdSub').textContent = IS_FOOD
        ? foods_lead()
        : (info.desc || (NAME + ' 是' + info.city + '行程里值得留出半天的一站，适合按"先主景、再细节、最后周边"的顺序慢慢走。'));

    var quick = IS_FOOD
        ? [['人均', info.price || '¥30-80'], ['风味', info.desc ? txt(info.desc).slice(0, 8) : '本地风味'], ['最佳时段', '午餐 / 晚餐'], ['推荐地点', info.loc || info.city || '当地老店']]
        : [['类型', catLabel[cat]], ['建议时长', DURATION[cat]], ['门票', info.ticket || '以景区公告为准'], ['最佳时段', BESTTIME[cat].split('，')[0]]];
    $('sdQuick').innerHTML = quick.map(function (q) {
        return '<div><b>' + esc(q[0]) + '</b><span>' + esc(q[1]) + '</span></div>';
    }).join('');

    var backHtml = '<i class="fas fa-arrow-left"></i> 返回' + (LOOP ? '环线百科' : '城市百科');
    $('sdBack').href = BACK;
    $('sdBack').innerHTML = backHtml;
    $('sdFootBack').href = BACK;

    /* ---------- 面板 ---------- */
    var tabs = IS_FOOD
        ? [['overview', '味道档案'], ['play', '怎么吃'], ['info', '实用信息'], ['nearby', '周边推荐']]
        : [['overview', '概览'], ['play', '怎么玩'], ['info', '实用信息'], ['nearby', '周边推荐']];
    $('sdTabs').innerHTML = tabs.map(function (t, i) {
        return '<button type="button" role="tab" data-panel="' + t[0] + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '">' + esc(t[1]) + '</button>';
    }).join('');

    function panelHead(kicker, title) {
        return '<h2 class="sd-h2">' + esc(title) + '<small>' + esc(kicker) + '</small></h2>';
    }

    function overviewHtml() {
        if (IS_FOOD) {
            var lead = foods_lead();
            var flavorName = '', flavorScore = 70;
            FLAVOR.forEach(function (f) { if (f[0].test(NAME)) { flavorName = f[1]; flavorScore = f[2]; } });
            var bars = [
                ['鲜香', flavorName === '鲜味' ? 92 : 74],
                ['辣度', /辣|椒|火锅|麻辣/.test(NAME) ? 90 : 38],
                ['甜度', /甜|糖|糕|蜜|奶/.test(NAME) ? 84 : 32],
                ['层次', flavorScore]
            ];
            var taste = '<div class="sd-taste">' + bars.map(function (b) {
                return '<div class="sd-taste-item"><b>' + b[0] + '</b><div class="sd-bar"><span data-w="' + b[1] + '"></span></div><em>' + b[1] + ' / 100</em></div>';
            }).join('') + '</div>';
            var p1 = info.desc
                ? info.desc + ' 这类味道通常讲究现做现吃，出锅到入口的时间越短，口感越接近本地人的日常。'
                : NAME + '属于' + info.city + '很有代表性的本地味道，核心在于' + (flavorName || '火候与调味') + '，不必追求复杂，吃的就是一口地道。';
            var p2 = '点单时建议先来基础款，确认口味轻重后再加配料；第一次吃可以请店家按本地默认做法来，更容易理解它为什么受欢迎。';
            var p3 = '想吃得从容，尽量避开 12:00-13:00 和 18:30-20:00 的高峰；同样的店，错峰半小时体验会好很多。';
            return panelHead('Taste Profile', '味道档案')
                + '<p class="sd-lead">' + esc(lead) + '</p>'
                + '<p class="sd-p">' + esc(p1) + '</p>'
                + '<p class="sd-p">' + esc(p2) + '</p>'
                + '<p class="sd-p">' + esc(p3) + '</p>'
                + '<div class="sd-h2" style="margin-top:34px">口味维度<small>Flavor</small></div>'
                + taste
                + '<div class="sd-quote">' + esc('一份好吃的' + NAME + '，往往只需要三件事：食材新鲜、火候准确、趁热吃。') + '</div>';
        }
        var paragraphs = [
            info.desc || (NAME + '是' + info.city + '的代表性景点之一，适合作为当天行程的主线来安排。'),
            HL[cat][0][2],
            BESTTIME[cat] + '；如果时间紧张，优先保住主景，把周边点位留到下次。'
        ];
        if (info.tip) paragraphs.push(info.tip);
        return panelHead('Overview', '关于' + NAME)
            + '<p class="sd-lead">' + esc(paragraphs[0]) + '</p>'
            + paragraphs.slice(1).map(function (p) { return '<p class="sd-p">' + esc(p) + '</p>'; }).join('')
            + '<div class="sd-h2" style="margin-top:38px">三个看点<small>Highlights</small></div>'
            + '<div class="sd-cards">' + HL[cat].map(function (h) {
                return '<div class="sd-card"><div class="ico"><i class="fas ' + h[0] + '"></i></div><h3>' + esc(h[1]) + '</h3><p>' + esc(h[2]) + '</p></div>';
            }).join('') + '</div>'
            + '<div class="sd-quote">' + esc(QUOTE[cat]) + '</div>';
    }

    function playHtml() {
        if (IS_FOOD) {
            var steps = [
                ['找店', '优先选本地人排队、菜单不复杂的店；景区门口第一排通常不是最优解。'],
                ['点单', '先点基础款 + 一份本地小菜，确认口味后再加主食或加料，避免一次点太多。'],
                ['吃法', '按店家默认吃法先尝原味，再决定加辣、加醋或加汤；趁热吃是关键。'],
                ['搭配', '配一杯本地茶饮或汤，整顿饭的节奏会更舒服；饭后留 20 分钟散步。']
            ];
            return panelHead('How to Eat', '怎么吃更地道')
                + '<p class="sd-p">把' + esc(NAME) + '吃明白，不需要复杂攻略，按下面四步走就够了。</p>'
                + '<div class="sd-steps">' + steps.map(function (s, i) {
                    return '<div class="sd-step"><time>Step ' + (i + 1) + '</time><h3>' + esc(s[0]) + '</h3><p>' + esc(s[1]) + '</p></div>';
                }).join('') + '</div>';
        }
        var route = {
            nature: [
                ['07:30-08:30', '出发与抵达', '尽量早到，避开团队和正午高温；先确认返程交通与末班时间。'],
                ['09:00-11:30', '主景游览', '把体力最好的时段留给核心景观，按主步道走，不急着每个岔路都去。'],
                ['11:30-13:00', '午餐与休整', '在景区外或镇上吃饭，价格和口味通常更稳。'],
                ['13:30-16:00', '次景与返程', '选一到两个顺路点位收尾，给返程留出缓冲。']
            ],
            heritage: [
                ['09:00-09:30', '入园与导览', '先看总览图或导览牌，确定主线与必看建筑。'],
                ['09:30-11:30', '主线参观', '按中轴或主线路走完，遇到讲解牌停下来读一读。'],
                ['11:30-13:00', '午餐', '景区周边用餐，避开正门口最拥挤的时段。'],
                ['13:30-15:30', '细节与周边', '折回看偏院、碑刻或附近老街，收尾更从容。']
            ],
            museum: [
                ['09:00-09:20', '入馆准备', '提前预约、过安检，拿导览图，锁定镇馆之宝的位置。'],
                ['09:20-11:30', '常设精华', '先看核心展厅，按楼层动线走，避免来回折返。'],
                ['11:30-13:00', '午餐与休息', '出馆用餐，给下午留出精力。'],
                ['13:30-15:30', '临展与文创', '看临展、逛文创，最后再回補漏掉的展厅。']
            ],
            street: [
                ['10:00-11:30', '主街初探', '先走一遍主街，记住想回访的店和巷口。'],
                ['11:30-13:00', '小吃午餐', '挑两三家小份尝味，不要一次性吃饱。'],
                ['14:00-17:00', '支巷慢逛', '钻进支巷看老建筑、小店和本地生活。'],
                ['18:30-20:30', '夜色与晚餐', '亮灯后再走一遍，选一家顺眼的店坐下。']
            ],
            landmark: [
                ['09:30-10:30', '经典机位', '先到最佳拍摄点完成打卡，光线和人流都更友好。'],
                ['10:30-12:00', '周边步行', '把周边两三个点串起来走，别只停留在一个角度。'],
                ['12:00-13:30', '午餐', '避开景区正门，往居民区方向找吃的。'],
                ['16:30-18:30', '傍晚二刷', '如果时间允许，傍晚再回来拍一次亮灯后的样子。']
            ]
        }[cat];
        return panelHead('How to Visit', '一条顺路的走法')
            + '<p class="sd-p">下面这条动线按“先主景、再细节、最后周边”的节奏排，实际可根据开放时间和体力调整。</p>'
            + '<div class="sd-steps">' + route.map(function (s) {
                return '<div class="sd-step"><time>' + esc(s[0]) + '</time><h3>' + esc(s[1]) + '</h3><p>' + esc(s[2]) + '</p></div>';
            }).join('') + '</div>';
    }

    function infoHtml() {
        var rows;
        if (IS_FOOD) {
            rows = [
                ['fa-coins', '人均参考', info.price || '约 ¥30-80，按店铺和点单浮动'],
                ['fa-pepper-hot', '风味', (info.desc ? txt(info.desc).slice(0, 22) : '本地家常风味') + '，第一次建议按默认做法'],
                ['fa-clock', '推荐时段', '午餐 11:00-12:00 / 晚餐 17:30-19:00，错峰体验更好'],
                ['fa-location-dot', '去哪吃', info.loc || (info.city + '的本地老店、社区店，优先避开景区正门')],
                ['fa-lightbulb', '点单提示', '先基础款再加料；不确定分量时先点小份，不够再加']
            ];
        } else {
            rows = [
                ['fa-ticket', '门票', info.ticket || '以景区当日公告为准，部分点位免费'],
                ['fa-clock', '开放时间', '通常 08:00-18:00，博物馆类多为 09:00-17:00，周一可能闭馆'],
                ['fa-hourglass-half', '建议时长', DURATION[cat] + '，深度游可再加 1 小时'],
                ['fa-route', '到达方式', '在' + (info.city || '市区') + '打车 / 公交前往，自驾需留意停车位'],
                ['fa-calendar-check', '预约提醒', /博物馆|博物院|纪念馆/.test(NAME) ? '热门展馆通常需要提前 1-3 天预约' : '节假日建议提前查限流与预约政策'],
                ['fa-triangle-exclamation', '避坑', '避开正午和旅行团高峰；景区门口餐饮偏贵，往居民区多走几步']
            ];
        }
        return panelHead('Practical', '实用信息')
            + '<div class="sd-info">' + rows.map(function (r) {
                return '<div class="sd-info-row"><b><i class="fas ' + r[0] + '"></i>' + esc(r[1]) + '</b><span>' + esc(r[2]) + '</span></div>';
            }).join('') + '</div>'
            + '<p class="sd-p" style="margin-top:16px;font-size:12.5px;color:var(--sd-muted)">门票、开放时间与预约政策会随季节调整，出行前建议再核对一次官方信息。</p>';
    }

    function detailUrl(kind, name, item) {
        var p = new URLSearchParams();
        p.set('type', kind);
        p.set('name', name);
        if (info.city) p.set('city', info.city);
        if (LOOP) p.set('loop', LOOP);
        p.set('back', BACK);
        return 'spot-detail.html?' + p.toString();
    }

    function miniCard(kind, item) {
        var n = txt(item.n || item.name);
        var d = txt(item.d || item.desc || (kind === 'food' ? '本地风味，适合安排一顿' : '顺路可搭配的一站'));
        var q = txt(item.q) || ((info.city || info.loopName || '') + ' ' + n + (kind === 'food' ? ' 美食' : ' 实景'));
        return '<a class="sd-mini" href="' + detailUrl(kind, n, item) + '">'
            + '<div class="sd-mini-media">' + imgTag(photo(q, 720, 480), n) + '<i class="fas ' + (kind === 'food' ? 'fa-utensils' : 'fa-location-dot') + '"></i></div>'
            + '<div class="sd-mini-body"><h3>' + esc(n) + '</h3><p>' + esc(d) + '</p></div></a>';
    }

    function nearbyHtml() {
        var spots = related.spots.slice(0, 3);
        var foods = related.foods.slice(0, 3);
        if (IS_FOOD) { spots = related.spots.slice(0, 3); foods = related.foods.slice(0, 3); }
        var html = panelHead('Nearby', '顺路一起逛');
        if (!spots.length && !foods.length) {
            return html + '<p class="sd-p">暂时没有更多关联点位，可以返回百科查看完整行程。</p>';
        }
        if (spots.length) {
            html += '<div class="sd-nearby-group"><div class="sd-h2" style="margin-top:22px">附近景点<small>Spots</small></div>'
                + '<div class="sd-nearby-grid">' + spots.map(function (s) { return miniCard('spot', s); }).join('') + '</div></div>';
        }
        if (foods.length) {
            html += '<div class="sd-nearby-group"><div class="sd-h2" style="margin-top:34px">可以顺路吃<small>Food</small></div>'
                + '<div class="sd-nearby-grid">' + foods.map(function (f) { return miniCard('food', f); }).join('') + '</div></div>';
        }
        return html;
    }

    $('panel-overview').innerHTML = overviewHtml();
    $('panel-play').innerHTML = playHtml();
    $('panel-info').innerHTML = infoHtml();
    $('panel-nearby').innerHTML = nearbyHtml();

    /* ---------- 交互 ---------- */
    function animateBars() {
        Array.prototype.forEach.call(document.querySelectorAll('#panel-overview .sd-bar span'), function (b) {
            b.style.width = '0';
            var w = b.getAttribute('data-w') || 0;
            setTimeout(function () { b.style.width = w + '%'; }, 60);
        });
    }

    function selectTab(key) {
        Array.prototype.forEach.call(document.querySelectorAll('#sdTabs button'), function (b) {
            b.setAttribute('aria-selected', b.getAttribute('data-panel') === key ? 'true' : 'false');
        });
        Array.prototype.forEach.call(document.querySelectorAll('.sd-panel'), function (p) {
            p.classList.toggle('in', p.id === 'panel-' + key);
        });
        if (key === 'overview') animateBars();
        window.scrollTo({ top: Math.max(0, $('sdHero').offsetHeight - 54), behavior: 'smooth' });
    }
    document.querySelectorAll('#sdTabs button').forEach(function (b) {
        b.addEventListener('click', function () { selectTab(b.getAttribute('data-panel')); });
    });

    // 滚动进度 + 导航底色 + 初始 tab 高亮
    function onScroll() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        $('sdProgress').style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
        document.querySelector('.sd-nav').classList.toggle('solid', h.scrollTop > ($('sdHero').offsetHeight - 90));
        if (!document.body.getAttribute('data-tab-init')) {
            document.body.setAttribute('data-tab-init', '1');
            animateBars();
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 大图
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

    // 复制链接
    $('sdShare').addEventListener('click', function () {
        var url = location.href;
        function done() { toast('链接已复制，可直接分享'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done, function () { toast('复制失败，请手动复制地址栏'); });
        } else {
            var i = document.createElement('input');
            i.value = url; document.body.appendChild(i); i.select();
            try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动复制地址栏'); }
            document.body.removeChild(i);
        }
    });
    var toastTimer;
    function toast(msg) {
        var t = $('sdToast');
        t.textContent = msg;
        t.classList.add('in');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { t.classList.remove('in'); }, 2200);
    }
})();
