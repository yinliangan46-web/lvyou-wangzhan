/* ========== MYL 城市三条线路生成器 ==========
   每条线路是一种“走法”，不是景点的简单拼接：
   线路1 地铁纵贯（城市名片）、线路2 步行慢游（山水街巷）、线路3 市井烟火（从早市到夜市）。
   每条线路只保留 5 个节点：早餐 → 景点 → 午餐 → 景点 → 晚餐。
   抵达、入住、退房、送站、返程等与线路无关的节点一律不出现。 */
(function () {
    var STYLES = [
        {
            no: '线路 01', mode: '地铁纵贯', icon: 'fa-subway', color: '#2563eb',
            audience: '适合第一次来、只有一整天',
            slogan: '用地铁把城市名片串成一条直线：少走路，多看地方，把“第一次来”该看的都看到。',
            move: '这一程优先地铁，出站后按导航步行 5–10 分钟；早晚高峰避开换乘大站。'
        },
        {
            no: '线路 02', mode: '步行慢游', icon: 'fa-person-walking', color: '#0f9d76',
            audience: '适合住两晚、想慢慢逛的人',
            slogan: '少坐车、多走两步。上午只安排一处风景，下午拐进街巷，把时间留给自己。',
            move: '这一程以步行和共享单车为主，景点之间控制在 2 公里内，走累了就找家店坐下。'
        },
        {
            no: '线路 03', mode: '市井烟火', icon: 'fa-bowl-rice', color: '#e2673a',
            audience: '适合吃货、傍晚才有力气的人',
            slogan: '从早市吃到夜市，景点只是消食的间隔。这条线不赶路，只赶热气腾腾的摊子。',
            move: '这一程跟着菜市场和老街走，公交一两站或直接打车，留出排队和加餐的时间。'
        }
    ];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function cleanName(v) {
        return String(v || '').trim().replace(/市$/, '');
    }

    function cleanSpots(list, city) {
        var seen = {};
        return (list || []).map(function (s) { return String(s || '').trim(); }).filter(function (s) {
            if (!s || s === city) return false;
            if (/机场|车站|高铁|火车站|汽车站|客运站|站$|抵达|返程|送站|接站|入住|退房|酒店|民宿|自由活动|集合|解散|午餐|晚餐|早餐|夜宵/.test(s)) return false;
            // 近义去重：已有「双塔」时不再收「双塔寺」，已有「宽窄巷子」时不再收「宽窄巷」
            var near = Object.keys(seen).filter(function (k) {
                return k !== s && (k.indexOf(s) === 0 || s.indexOf(k) === 0);
            })[0];
            if (near) return false;
            if (seen[s]) return false;
            seen[s] = 1;
            return true;
        });
    }

    function cleanFoods(list) {
        var seen = {};
        return (list || []).map(function (f) {
            return typeof f === 'string' ? { name: f } : f;
        }).filter(function (f) {
            var n = f && String(f.name || '').trim();
            if (!n || n.length > 18) return false;
            if (/招牌菜|特色菜|特色小吃|必喝饮品|当地特色|本地风味|当季本地|必吃|美食$/.test(n)) return false;
            if (seen[n]) return false;
            seen[n] = 1;
            return true;
        }).map(function (f) {
            return { name: String(f.name).trim(), desc: f.desc || '', price: f.price || '' };
        });
    }

    function food(f, fallbackName) {
        return f || { name: fallbackName, desc: '', price: '' };
    }

    // 从原有逐日行程里补充可游览地点（柳巷、食品街、汾河公园这类），
    // 让三条线路有足够素材，同时过滤掉餐饮、交通和住宿节点。
    window.citySpotsFromDays = function (days) {
        var out = [], seen = {};
        var tail = /(街|巷|公园|广场|博物馆|美术馆|纪念馆|书院|古镇|古城|城墙|楼|宫|园|谷|峡|岛|湿地|村|祠|寺|塔|山|湖|河|桥|湾|林|寺)$/;
        (days || []).forEach(function (d) {
            (d.timeline || []).forEach(function (it) {
                var a = String(it.activity || '').trim();
                a = a.replace(/^(游览|前往|参观|逛|打卡|夜游|漫步|登|看|去|走进)\s*/, '');
                a.split(/[+·、/]|→|—/).forEach(function (s) {
                    s = s.replace(/[（(].*?[)）]/g, '').replace(/^\s*[：:]\s*/, '').trim();
                    if (!s || s.length > 12) return;
                    if (/机场|车站|高铁|火车|酒店|民宿|客栈|入住|退房|返程|抵达|出发|午餐|晚餐|早餐|夜宵|自由活动|集合|解散|味道|美食|小吃/.test(s)) return;
                    if (!tail.test(s)) return;
                    if (seen[s]) return;
                    seen[s] = 1;
                    out.push(s);
                });
            });
        });
        return out.slice(0, 8);
    };

    // 站内景点库（script.js 的 _knownLandmarks / city-landmarks.js）作为补充，
    // 让三类走法尽量用上不同地点，避免三条线路反复出现同一个景点。
    function extraSpots(city) {
        var pools = [window.CITY_EXTRA_SPOTS, window._knownLandmarks, window.CITY_LANDMARKS];
        for (var i = 0; i < pools.length; i++) {
            var d = pools[i];
            if (!d) continue;
            var list = d[city] || d[city + '市'];
            if (list && list.length) return list;
        }
        return [];
    }

    window.buildCityRoutePlans = function (input) {
        input = input || {};
        var city = cleanName(input.name) || '这座城';
        var spots = cleanSpots((input.spots || []).concat(extraSpots(city)), city);
        var foods = cleanFoods(input.foods);
        var tag = String(input.tag || '').replace(/^[^·]*·/, '').trim();

        if (!spots.length) spots = [city + '老城', city + '博物馆', city + '河畔', city + '夜市'];
        if (spots.length < 2) spots.push(spots[0]);
        if (!foods.length) foods = [{ name: '本地早餐' }, { name: '招牌菜' }, { name: '夜市小吃' }];

        // 按“适不适合这一餐”挑菜，而不是死板轮转（避免元宵、烤鸭、口味虾当早餐）
        var BF_RE = /可颂|面包|吐司|咖啡|粥|豆浆|油条|包子|汤包|蒸饺|馄饨|烧麦|烧卖|肠粉|糁|胡辣汤|锅巴菜|豆花|米粉|米线|面|粉|饼|馍|粑|川|头脑|杂割|麦片|酸奶|果汁|蛋|早茶|茶/;
        var BF_BAD = /虾|蟹|火锅|烤鸭|烤鸡|蜗牛|鸭|鸡|酒|醋|鱼/;
        var LUNCH_RE = /面|粉|饺|饭|米|小吃|馍|饼|包|馄饨|杂割|汤|粑/;
        var DINNER_RE = /菜|火锅|烤|卤|炖|烧|肉|鱼|鸭|鸡|虾|蟹|杂割|煲|锅|酒|宴/;
        var DINNER_BAD = /马卡龙|可颂|奶茶|冰淇淋|甜品|蛋糕/;
        function idxPool(re) {
            var out = [];
            foods.forEach(function (f, i) { if (re.test(f.name)) out.push(i); });
            return out;
        }
        var bfPool = idxPool(BF_RE).filter(function (i) { return !BF_BAD.test(foods[i].name); });
        var lunchPool = idxPool(LUNCH_RE);
        var dinnerPool = idxPool(DINNER_RE).filter(function (i) { return !DINNER_BAD.test(foods[i].name); });
        var globalUse = {};
        // 同类菜品在三条线路间尽量轮换，避免三张卡片的晚餐一模一样
        function pickFood(pref, used, seed, allowWide, avoid) {
            function lowest(list) {
                var min = Infinity, top = [];
                list.forEach(function (i) {
                    var c = globalUse[i] || 0;
                    if (c < min) { min = c; top = [i]; }
                    else if (c === min) top.push(i);
                });
                return top[seed % top.length];
            }
            function bump(i) {
                globalUse[i] = (globalUse[i] || 0) + 1;
                return i;
            }
            function remain() {
                var list = [];
                foods.forEach(function (f, i) {
                    if (used[i]) return;
                    if (avoid && avoid.test(f.name)) return;
                    list.push(i);
                });
                return list;
            }
            var cand = pref.filter(function (i) { return !used[i]; });
            if (cand.length) {
                var hit = lowest(cand);
                if (!allowWide || !globalUse[hit]) return bump(hit);
                var alt = remain();
                return bump(alt.length ? lowest(alt) : hit);
            }
            var all = remain();
            return bump(all.length ? lowest(all) : (seed % foods.length));
        }
        function mealOf(i) {
            var used = {};
            var bi = pickFood(bfPool, used, i, false, BF_BAD); used[bi] = 1;
            var li = pickFood(lunchPool, used, i); used[li] = 1;
            var di = pickFood(dinnerPool, used, i, true, DINNER_BAD);
            return [food(foods[bi], '本地早餐'), food(foods[li], '本地午饭'), food(foods[di], '本地晚饭')];
        }

        // 按线路气质分配景点：烟火线优先街巷/夜市，慢行线优先公园/山水，初见线留给城市名片
        var used = {};
        function takeBy(re, n) {
            var out = [];
            spots.forEach(function (s) {
                if (out.length < n && !used[s] && re.test(s)) { out.push(s); used[s] = 1; }
            });
            return out;
        }
        var r1spots = [];
        while (r1spots.length < 2) {
            var top = spots.filter(function (s) { return !used[s]; })[0];
            if (!top) break;
            used[top] = 1;
            r1spots.push(top);
        }
        var r3spots = takeBy(/街|巷|夜市|市场|古城|古镇|老街|小吃|市集|胡同/, 2);
        var r2spots = takeBy(/公园|湖|山|河|湿地|植物园|动物园|寺|塔|园林|园|岛|湾|林/, 2);
        function fill(list) {
            while (list.length < 2) {
                var hit = spots.filter(function (s) { return !used[s]; })[0];
                if (!hit) {
                    // 景点不够时允许跨线路复用，但同一条线路内不出现重复
                    hit = spots.filter(function (s) { return list.indexOf(s) < 0; })[0] || spots[0];
                }
                used[hit] = 1;
                list.push(hit);
            }
        }
        fill(r1spots); fill(r3spots); fill(r2spots);

        var pairs = [r1spots, r2spots, r3spots];
        var meals = [mealOf(0), mealOf(1), mealOf(2)];
        var nickname = tag || city;

        var titles = [
            nickname + '初见',
            nickname + '慢行 · 半日人间',
            nickname + '烟火 · 从早市到夜宵'
        ];
        var poems = [
            '第一次来' + city + '，先把最有代表性的地方走一遍：' + pairs[0][0] + '、' + pairs[0][1] + '，' +
                '地铁串起来，一天就够。',
            '不追景点数量，从' + pairs[1][0] + '慢慢走到' + pairs[1][1] + '，把半天交给街巷、公园和一杯茶。',
            '从' + meals[2][0].name + '开场，到' + meals[2][2].name + '收尾，中间用' + pairs[2][0] + '与' +
                pairs[2][1] + '消食。吃是主线，风景是配菜。'
        ];

        var times = [
            ['07:40', '09:10', '12:20', '14:00', '18:30'],
            ['08:30', '09:50', '12:40', '14:30', '18:10'],
            ['07:00', '10:30', '12:00', '16:30', '20:20']
        ];

        var mealDetail = [
            ['早点吃扎实一点，今天靠地铁串起城市名片。找本地人排队的早餐铺，别在酒店吃。',
             '在下一站附近解决午饭，把时间留给景点；点一份招牌主食加一碗汤就够。',
             '收尾用一顿正经本地菜，吃完顺着夜景走一段，把这一天慢慢收住。'],
            ['不赶时间，慢慢吃完再出门。上午只安排一处风景，吃饱了才有力气走。',
             '找一家有窗的小馆，吃完坐一会儿，看看街上的人怎么生活。',
             '晚餐清淡一点，饭后沿河边或老街散步，让一天的节奏慢下来。'],
            ['跟着本地人进早市，先吃一轮再逛；看到现做现卖的摊子就停下来。',
             '午饭专挑巷子里的小馆，点招牌不点套餐，人多的地方通常不会错。',
             '夜市开吃，从街头吃到街尾；少量多样，留一点肚子给下一摊。']
        ];

        var spotDetail = [
            ['第一眼就该记住的地方。建议开门就到，避开旅行团；拍照往侧门或高处走，人少构图也舒展。',
             '下午留给第二处地标，逛完正好接上晚餐。门票与开放时间以景区当日公示为准。'],
            ['把脚步放慢，绕开主路走一圈，树荫、长椅和本地人的日常比打卡点更值得。',
             '傍晚光线最好的时候到第二处，坐一会儿再走，不急着赶下一个点。'],
            ['白天先看它的样子，晚上再回来吃一圈；老街的店铺下午才陆续开门。',
             '傍晚是这类地方最好看的时候，逛完直接接上夜市晚餐。']
        ];

        var plans = STYLES.map(function (st, i) {
            var p = pairs[i];
            var t = times[i];
            var m = mealDetail[i];
            var s = spotDetail[i];
            var b = meals[i][0], l = meals[i][1], d = meals[i][2];

            function mealNode(type, icon, hh, f, detail) {
                var price = f.price ? ('人均 ' + f.price) : '';
                return {
                    type: type, icon: icon, time: hh,
                    title: (type === 'breakfast' ? '早餐 · ' : type === 'lunch' ? '午餐 · ' : '晚餐 · ') + f.name,
                    detail: detail + (f.desc ? (' ' + f.desc) : ''),
                    meta: price
                };
            }

            var nodes = [
                mealNode('breakfast', 'fa-mug-hot', t[0], b, m[0]),
                {
                    type: 'spot', icon: 'fa-camera-retro', time: t[1], title: p[0],
                    detail: s[0], meta: '建议 2–2.5 小时 · 门票以景区公示为准'
                },
                mealNode('lunch', 'fa-bowl-food', t[2], l, m[1]),
                {
                    type: 'spot', icon: 'fa-camera-retro', time: t[3], title: p[1],
                    detail: s[1], meta: '建议 2 小时 · 傍晚光线更好'
                },
                mealNode('dinner', 'fa-moon', t[4], d, m[2])
            ];

            return {
                index: i, no: st.no, mode: st.mode, icon: st.icon, color: st.color,
                audience: st.audience, title: titles[i], poem: poems[i],
                move: st.move, nodes: nodes
            };
        });

        return plans;
    };

    function nodeHtml(n) {
        return '<li class="cr-node is-' + n.type + '">' +
            '<span class="cr-time">' + esc(n.time) + '</span>' +
            '<span class="cr-dot"></span>' +
            '<div class="cr-body"><b><i class="fas ' + n.icon + '"></i> ' + esc(n.title) + '</b>' +
            '<p>' + esc(n.detail) + '</p>' +
            (n.meta ? '<span class="cr-meta">' + esc(n.meta) + '</span>' : '') +
            '</div></li>';
    }

    window.renderCityRoutePlans = function (plans, opt) {
        opt = opt || {};
        if (!plans || !plans.length) return '';
        var clickable = !!opt.clickable;
        var cards = plans.map(function (p) {
            return '<article class="cr-card' + (clickable ? ' is-clickable' : '') + '" data-route="' + p.index + '"' +
                ' style="--rc:' + p.color + '"' +
                (clickable ? ' role="button" tabindex="0" aria-pressed="false" aria-controls="cgDayList"' : '') + '>' +
                '<div class="cr-card-top"><span class="cr-no">' + esc(p.no) + '</span>' +
                '<span class="cr-mode"><i class="fas ' + p.icon + '"></i> ' + esc(p.mode) + '</span></div>' +
                '<h4>' + esc(p.title) + '</h4>' +
                '<p class="cr-slogan">' + esc(p.poem) + '</p>' +
                '<div class="cr-audience">' + esc(p.audience) + '</div>' +
                '<ol class="cr-nodes">' + p.nodes.map(nodeHtml).join('') + '</ol>' +
                '</article>';
        }).join('');

        var head = opt.bare ? '' :
            '<div class="cr-head"><h3><i class="fas fa-route"></i> 三条线路 · 三种走法</h3>' +
            '<p>同一个城市，三种节奏。每条线路只安排「早餐 → 一处风景 → 午餐 → 一处风景 → 晚餐」，' +
            '按你手里的时间选一条走。</p></div>';

        return '<div class="cr-wrap' + (opt.bare ? ' is-bare' : '') + '">' + head +
            '<div class="cr-grid">' + cards + '</div></div>';
    };

    window.renderCityRouteDetails = function (plans) {
        if (!plans || !plans.length) return '';
        return plans.map(function (p) {
            return '<details class="cr-detail" data-route="' + p.index + '"' + (p.index === 0 ? ' open' : '') + '>' +
                '<summary><span class="cr-dno" style="--rc:' + p.color + '">' + esc(p.no) + '</span>' +
                '<b>' + esc(p.title) + '</b>' +
                '<span class="cr-dmode">' + esc(p.mode) + ' · 5 个节点</span>' +
                '<i class="fas fa-chevron-down cr-arrow"></i></summary>' +
                '<div class="cr-detail-body">' +
                '<p class="cr-move"><i class="fas fa-route"></i> ' + esc(p.move) + '</p>' +
                '<ol class="cr-nodes">' + p.nodes.map(nodeHtml).join('') + '</ol>' +
                '</div></details>';
        }).join('');
    };
})();
