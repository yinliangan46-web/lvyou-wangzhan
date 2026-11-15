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
            if (/机场|车站|高铁|火车站|抵达|返程|送站|接站|入住|退房|酒店|民宿|自由活动|集合|解散|午餐|晚餐|早餐|夜宵/.test(s)) return false;
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

    window.buildCityRoutePlans = function (input) {
        input = input || {};
        var city = cleanName(input.name) || '这座城';
        var spots = cleanSpots(input.spots, city);
        var foods = cleanFoods(input.foods);
        var tag = String(input.tag || '').replace(/^[^·]*·/, '').trim();

        if (!spots.length) spots = [city + '老城', city + '博物馆', city + '河畔', city + '夜市'];
        if (spots.length < 2) spots.push(spots[0]);
        if (!foods.length) foods = [{ name: '本地早餐' }, { name: '招牌菜' }, { name: '夜市小吃' }];

        function spot(i) { return spots[i % spots.length]; }
        function fd(i) { return food(foods[i % foods.length], '本地味道'); }

        var pairs = [
            [spot(0), spot(1)],
            [spot(2), spot(3)],
            [spot(4), spot(5)]
        ];

        var titles = [
            (tag ? tag + '初见' : city + '初见'),
            '慢行 · 半日人间',
            '烟火 · 从早市到夜宵'
        ];
        var poems = [
            '第一次来' + city + '，先把最有代表性的地方走一遍：' + pairs[0][0] + '、' + pairs[0][1] + '，' +
                '地铁串起来，一天就够。',
            '不追景点数量，从' + pairs[1][0] + '慢慢走到' + pairs[1][1] + '，把半天交给街巷、公园和一杯茶。',
            '从' + fd(0).name + '开场，到' + fd(2).name + '收尾，中间用' + pairs[2][0] + '与' +
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
            var b = fd(i), l = fd(i + 1), d = fd(i + 2);

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
