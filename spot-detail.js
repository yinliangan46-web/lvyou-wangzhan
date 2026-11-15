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
    }

    var CD = window.CITY_DETAIL || {};
    if (CITY && CD[CITY]) detail = CD[CITY];
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
        } else {
            var pins = detail.routePins || [];
            var at = pins.indexOf(NAME);
            if (at >= 0 && pins[at + 1] && !nextSpot) nextSpot = pins[at + 1];
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

    var html = '';

    if (!IS_FOOD) {
        // 位置交通
        var locText = '位于' + (info.city || info.region) + (info.loc ? '，' + info.loc : '') + '。';
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
        html += sec('story', '03', '文化故事', 'Story', p(story1) + p(STORY[cat]));

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
    } else {
        // 原料工艺
        var craft = info.desc || (NAME + '是' + info.city + '很有代表性的本地味道，核心在于食材新鲜和火候准确。');
        html += sec('craft', '01', '原料工艺', 'Craft',
            p(craft) + p('以本地常见食材为主，讲究现做现吃；调味不复杂，火候和出锅时间才是成败关键。'));

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
