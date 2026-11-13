/* ========== MYL 城市旅行百科（city-guide） ========== */
(function () {
    'use strict';

    function $(id) { return document.getElementById(id); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function cut(s, n) {
        s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
        return s.length > n ? s.slice(0, n - 1) + '…' : s;
    }
    function unique(arr) {
        var seen = {}, out = [];
        (arr || []).forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; out.push(x); } });
        return out;
    }
    function priceText(p) {
        return String(p == null ? '' : p).replace(/[¥￥]/g, '').trim();
    }

    var params = new URLSearchParams(location.search);
    var qKey = params.get('key') || '';
    var qName = params.get('name') || '';
    var qProv = params.get('province') || '';
    var qPk = params.get('pk') || '';
    var qCi = parseInt(params.get('ci'), 10);

    var CD = window.CITY_DETAIL || {};
    var detail = CD[qKey] || null;
    if (!detail && qName) {
        Object.keys(CD).forEach(function (k) {
            if (!detail && CD[k] && CD[k].name === qName) detail = CD[k];
        });
    }

    var prov = null, cityRec = null;
    // 省级下钻城市：通过「省 key + 城市序号」定位，URL 全 ASCII
    if (qPk) {
        (window.PROVINCES_ALL || []).forEach(function (p) {
            if (p.key === qPk) prov = p;
        });
        if (prov && isFinite(qCi) && prov.cities && prov.cities[qCi]) cityRec = prov.cities[qCi];
    }
    (window.PROVINCES_ALL || []).forEach(function (p) {
        if (qProv && p.name === qProv && !prov) prov = p;
        (p.cities || []).forEach(function (c) {
            if (c.key === qKey || (qName && c.name === qName)) {
                if (!cityRec) cityRec = c;
                if (!prov) prov = p;
            }
        });
        if (!qProv && cityRec && !prov) prov = p;
    });

    // 省级城市若站内有同名富数据（如合肥/杭州/苏州），优先使用，保证景点/美食/交通更完整
    if (!detail && cityRec) {
        Object.keys(CD).forEach(function (k) {
            if (!detail && CD[k] && CD[k].name === cityRec.name) detail = CD[k];
        });
    }

    var name = (detail && detail.name) || (cityRec && cityRec.name) || qName || '这座城';
    var region = (prov && prov.name) || (detail && detail.country) || qProv || '';
    var tags = (detail && detail.tags) ? detail.tags.slice(0, 3) : [];
    var daysText = (detail && detail.days) || (cityRec ? '2-3天' : (prov && prov.days)) || '2-3天';

    /* ---------- 基础素材 ---------- */
    var pins = [];
    var landmarks = (window.CITY_LANDMARKS || {})[name] || [];
    if (detail && detail.routePins && detail.routePins.length) {
        pins = detail.routePins.slice(0, 9);
    } else if (landmarks.length) {
        pins = landmarks.slice(0, 9);
    }
    if (!pins.length) pins = [name + '博物馆', name + '历史街区', name + '城市公园'];
    // 去掉机场、车站、返程等交通节点，景点区只保留可游览地点
    var realPins = pins.filter(function (p) { return !/机场|高铁站|火车站|汽车站|返程|抵达|入住|集合|出发/.test(p); });
    if (realPins.length) pins = realPins;

    var foods = [];
    var foodsFromProv = false;
    if (detail && detail.foods && detail.foods.length) {
        foods = detail.foods.map(function (f) {
            if (typeof f === 'string') return { name: f };
            return { name: f.name || '', desc: f.desc || '', price: f.price || '' };
        });
    } else if (prov && prov.foods && prov.foods.length) {
        foodsFromProv = true;
        foods = prov.foods.map(function (f) { return typeof f === 'string' ? { name: f } : f; });
    }

    var tips = (detail && detail.tips && detail.tips.length) ? detail.tips.slice() : [];
    if (!tips.length) {
        tips = [
            '热门景点和博物馆多数需要实名预约，节假日建议提前 3–7 天在官方渠道确认。',
            '山区或沿海天气变化快，出发前看实时预报，按昼夜温差准备外套。',
            '景区门口的餐饮和特产通常溢价，往镇上或居民区多走几步更实在。'
        ];
    }

    var cityCoord = null;
    if (detail && detail.coords && isFinite(detail.coords[0])) cityCoord = detail.coords;
    else if (cityRec && cityRec.coords && cityRec.coords.length) {
        var cc = cityRec.coords[cityRec.coords.length - 1];
        if (Array.isArray(cc) && isFinite(cc[0])) cityCoord = cc;
    }

    function coordOf(pin) {
        var R = window.REAL_POI_COORDS || {};
        var A = window.ALL_CITY_COORDS || {};
        var c = R[pin] || A[pin];
        return (c && isFinite(c[0]) && isFinite(c[1])) ? c : null;
    }

    /* ---------- 行程数据 ---------- */
    var arriveRe = /抵达|返程|入住|退房|前往机场|值机|登机|酒店早餐/;

    function synthDays() {
        var count = Math.max(3, Math.ceil(pins.length / 2));
        var extras = ['城市博物馆/历史街区', '本地夜市/老街', '城市公园/滨水步道', '周边古镇/自然景区'];
        var out = [];
        for (var i = 0; i < count; i++) {
            var a = pins[i * 2] || extras[i % extras.length];
            var b = pins[i * 2 + 1] || extras[(i + 1) % extras.length];
            out.push({
                day: 'Day ' + (i + 1),
                theme: a + (b ? ' · ' + b : ''),
                timeline: [
                    { time: '09:00', activity: '游览 ' + a, detail: '城市代表景点，建议预留 2–3 小时；出发前确认开放时间与预约要求。' },
                    { time: '12:00', activity: '本地午餐', detail: '找本地人常去的餐馆，避开景区门口，试试当季食材。' },
                    { time: '14:30', activity: '前往 ' + b, detail: '与上午景点就近安排，减少来回通勤。' },
                    { time: '19:00', activity: '夜市或老街', detail: '尝本地小吃，感受城市的夜间生活节奏。' }
                ]
            });
        }
        return out;
    }

    var days = (detail && detail.itinerary && detail.itinerary.length) ? detail.itinerary.slice() : synthDays();

    function padDays(list, target) {
        var out = list.slice();
        var used = '';
        out.forEach(function (d) {
            (d.timeline || []).forEach(function (it) { used += '|' + String(it.activity || ''); });
        });
        var pool = pins.filter(function (p) { return used.indexOf(p) < 0; });
        var pi = 0;
        while (out.length < target) {
            var a = pool[pi++] || '城市漫步';
            var b = pool[pi++] || '本地美食';
            out.push({
                day: 'Day ' + (out.length + 1),
                theme: a + (b ? ' · ' + b : ''),
                timeline: [
                    { time: '09:00', activity: '游览 ' + a, detail: '建议预留 2–3 小时，出发前确认开放时间与预约要求。' },
                    { time: '12:00', activity: '本地午餐', detail: '找本地人常去的餐馆，避开景区门口。' },
                    { time: '14:30', activity: '前往 ' + b, detail: '与上午景点就近安排，减少来回通勤。' },
                    { time: '19:00', activity: '夜市或老街', detail: '尝本地小吃，感受城市的夜间生活。' }
                ]
            });
        }
        return out;
    }

    function scoreDay(d) {
        return (d.timeline || []).filter(function (it) { return !arriveRe.test(String(it.activity || '')); }).length;
    }
    function allNodes() {
        var n = 0;
        days.forEach(function (d) { n += (d.timeline || []).length; });
        return n;
    }
    function bestDay() {
        var best = days[0], bs = -1;
        days.forEach(function (d) {
            var s = scoreDay(d);
            if (s > bs) { bs = s; best = d; }
        });
        return best;
    }
    function twoDays() {
        if (days.length >= 2) {
            var ranked = days.map(function (d, i) { return { d: d, i: i, s: scoreDay(d) }; })
                .sort(function (a, b) { return b.s - a.s; })
                .slice(0, 2)
                .sort(function (a, b) { return a.i - b.i; })
                .map(function (x) { return x.d; });
            if (ranked.length === 2) return ranked;
        }
        return padDays(days, 2);
    }

    var oneDay = [bestDay()];
    var twoDay = twoDays();
    var deepTarget = Math.max(3, days.length);
    var deepDays = padDays(days, deepTarget);

    /* ---------- 景点信息 ---------- */
    function pinInfo(pin) {
        var out = { desc: '', ticket: '', day: 0, time: '' };
        days.forEach(function (d, di) {
            (d.timeline || []).forEach(function (it) {
                var a = String(it.activity || '');
                var det = String(it.detail || '');
                if (!out.day && (a.indexOf(pin) >= 0 || det.indexOf(pin) >= 0)) {
                    out.day = di + 1;
                    out.time = it.time || '';
                }
                if (!out.desc && (a.indexOf(pin) >= 0 || det.indexOf(pin) >= 0)) out.desc = det;
                if (!out.ticket && (a.indexOf(pin) >= 0) && it.ticket) out.ticket = it.ticket;
            });
        });
        if (!out.desc) out.desc = name + ' 的代表性景点之一，建议预留 1.5–3 小时；出发前确认开放时间与预约要求。';
        out.desc = cut(out.desc, 105);
        return out;
    }

    var spots = pins.map(function (p, i) {
        var info = pinInfo(p);
        return { name: p, idx: i + 1, coord: coordOf(p), desc: info.desc, ticket: info.ticket, day: info.day };
    });

    /* ---------- 图片与首屏 ---------- */
    function heroImage() {
        var raw = (detail && detail.img) || (cityRec && cityRec.img) || (prov && prov.img);
        if (raw) return raw;
        var prompt = name + ' ' + (region || '') + ' 城市地标 天际线 旅行摄影 真实光影 高清';
        return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' + encodeURIComponent(prompt) + '&image_size=landscape_16_9';
    }

    document.title = name + '旅行百科 · 景点/美食/交通/住宿一页看懂 | MYL 旅行';
    var descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', name + '旅行百科：必游景点、地道美食、交通、住宿、预算与逐日行程建议。');

    var heroImg = $('cgHeroImg');
    heroImg.src = heroImage();
    heroImg.alt = name + '城市风景';

    $('cgKicker').textContent = (region ? region + ' · ' : '') + 'MYL 城市旅行百科';
    $('cgTitle').innerHTML = esc(name) + '<br><em>旅行百科</em>';

    var budgetTotal = '';
    if (detail && detail.budget) {
        detail.budget.forEach(function (b) { if (/合计|总计/.test(String(b.label || ''))) budgetTotal = b.value || ''; });
    }
    if (!budgetTotal && prov && prov.price && !cityRec) budgetTotal = prov.price;

    $('cgSub').textContent = name + (region ? ' 位于' + region : '') + '，建议停留 ' + daysText +
        '。下面用一页把景点、美食、交通、住宿和每天怎么走讲清楚，出发前 3 分钟就能建立整体印象。';

    $('cgHeroFacts').innerHTML = [
        ['建议停留', daysText],
        ['核心景点', pins.length + ' 个'],
        ['人均参考', budgetTotal || '按行程定'],
        ['所属', region || '—']
    ].map(function (x) {
        return '<div class="cg-hf"><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>';
    }).join('');

    $('cgHeroLinks').innerHTML = [
        { href: '#cgSpots', idx: '01', color: 'var(--cg-r1)', title: '必游景点', small: pins.slice(0, 3).join(' · '), d: pins.length + ' 个' },
        { href: '#cgFood', idx: '02', color: 'var(--cg-r2)', title: '地道美食', small: foods.slice(0, 3).map(function (f) { return f.name; }).join(' · '), d: foods.length + ' 种' },
        { href: '#cgPlan', idx: '03', color: 'var(--cg-r3)', title: '行程建议', small: '1 日 / 2 日 / ' + deepTarget + ' 日', d: deepTarget + ' 天' }
    ].map(function (x) {
        return '<a class="cg-hr" href="' + x.href + '"><span class="idx">' + x.idx + '</span>' +
            '<span class="bar" style="background:' + x.color + '"></span>' +
            '<span class="t"><b>' + esc(x.title) + '</b><small>' + esc(x.small) + '</small></span>' +
            '<span class="d">' + esc(x.d) + '</span></a>';
    }).join('');

    $('cgFootLeft').textContent = name + ' · ' + pins.length + ' 个景点 · ' + foods.length + ' 种味道 · ' + deepTarget + ' 天走法';
    $('cgFootTitle').textContent = '把 ' + name + ' 压缩成一页可以带走的旅行印象。';
    $('cgFootBot').textContent = 'MYL 城市旅行百科 · ' + name;

    /* ---------- 速览 ---------- */
    $('cgOvTitle').textContent = name + '，一页读懂';
    $('cgOvDesc').textContent = '从景点分布到吃住行，再到每天怎么安排，下面按顺序展开。时间紧就先看速览和地图。';

    var firstTip = tips[0] || '';
    var introHtml = '' +
        '<p><strong>' + esc(name) + '</strong>' + (region ? ' 位于' + esc(region) : '') + '，建议停留 <strong>' + esc(daysText) + '</strong>。这份旅行百科把必游景点、地道美食、交通、住宿和行前贴士整理在一页，帮你快速建立对这座城市的第一印象。</p>' +
        '<p>核心看点集中在 <strong>' + esc(pins.slice(0, 4).join('、')) + '</strong>' + (pins.length > 4 ? ' 等' : '') + '。第一次来不必贪多，先挑 2–3 个最想去的，再按地图安排顺路。</p>' +
        (firstTip ? '<p><strong>本地提醒：</strong>' + esc(firstTip) + '</p>' : '');
    if (tags.length) introHtml += '<div class="cg-quote">' + esc(name) + '：' + esc(tags.join(' · ')) + '</div>';
    $('cgLead').innerHTML = introHtml;

    $('cgFacts').innerHTML = [
        ['建议停留', daysText],
        ['核心景点', pins.length + ' 个'],
        ['人均参考', budgetTotal || '按行程定'],
        ['美食代表', foods.length ? foods.length + ' 种' : '本地风味']
    ].map(function (x) {
        return '<div class="cg-fact"><b>' + esc(x[1]).replace(/^(\d+)/, '$1<i>' + esc(x[0]) + '</i>') + '</b><span>' + esc(x[0]) + '</span></div>';
    }).join('');

    var firstFlight = (detail && detail.airfare && detail.airfare[0]) || null;
    var firstTrain = (detail && detail.trains && detail.trains[0]) || null;
    var firstLocal = (detail && detail.transport && detail.transport[0]) || null;
    var firstTransfer = (prov && prov.transfers && prov.transfers[0]) || '';
    var goText = '';
    if (firstFlight) goText = '例如 ' + firstFlight.from + '→' + firstFlight.to + ' ' + firstFlight.price;
    else if (firstTrain) goText = '例如 ' + firstTrain.from + '→' + firstTrain.to + ' ' + firstTrain.price;
    else if (firstTransfer) goText = firstTransfer;
    else if (firstLocal) goText = firstLocal.label + '：' + firstLocal.value;
    else goText = '跨城交通与市内移动见下文。';

    var stayText = '';
    if (detail && detail.hotels && detail.hotels[0]) stayText = (detail.hotels[0].area || '') + ' ' + (detail.hotels[0].price || '');
    else if (prov && prov.hotels && prov.hotels[0]) stayText = prov.hotels[0];
    else stayText = '优先选择交通便利的市区商圈，或景区门口 2–3 公里内。';

    $('cgQuick').innerHTML = [
        { icon: 'fa-route', h: '怎么玩', p: daysText + ' · ' + pins.length + ' 个核心景点', s: pins.slice(0, 3).join('、') + (pins.length > 3 ? ' 等' : '') },
        { icon: 'fa-plane', h: '怎么去', p: goText, s: '机票/火车价格以平台实时为准' },
        { icon: 'fa-utensils', h: '吃什么', p: foods.length ? foods.slice(0, 3).map(function (f) { return f.name; }).join('、') : '本地小吃与老字号', s: '避开景区门口，往居民区多走两步' },
        { icon: 'fa-bed', h: '住哪里', p: stayText, s: '先定区域，再比价格与取消政策' }
    ].map(function (x) {
        return '<div class="cg-q"><span class="ico"><i class="fas ' + x.icon + '"></i></span><h3>' + esc(x.h) + '</h3><p>' + esc(x.p) + '</p><span>' + esc(x.s) + '</span></div>';
    }).join('');

    /* ---------- 节奏图 ---------- */
    var nodes = allNodes();
    var avg = (nodes / Math.max(days.length, 1)).toFixed(1);
    $('cgRhythmDesc').textContent = '全程 ' + days.length + ' 天、' + nodes + ' 个节点，平均每天 ' + avg +
        ' 个。想轻松就一天挑 2–3 个，想多看就按时间轴顺路加，别为了打卡把时间花在路上。';
    renderChart();

    function renderChart() {
        var list = days.slice(0, 8);
        var vals = list.map(function (d) { return (d.timeline || []).length; });
        var max = Math.max.apply(null, vals.concat([4]));
        var n = list.length;
        var left = 56, right = 24, top = 26, bottom = 246;
        var span = 640 - left - right;
        var step = span / n;
        var barW = Math.max(18, Math.min(48, step * .46));
        var svg = '<svg viewBox="0 0 640 290" preserveAspectRatio="none" role="img" aria-label="逐日行程节点数量">';
        svg += '<defs><linearGradient id="cgBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#1e40af"/></linearGradient></defs>';
        [0, 1, 2, 3, 4].forEach(function (i) {
            var y = bottom - (bottom - top) * i / 4;
            svg += '<line x1="' + left + '" y1="' + y + '" x2="' + (640 - right) + '" y2="' + y + '" stroke="#101b2c" stroke-opacity=".08" stroke-width="1"/>';
        });
        list.forEach(function (d, i) {
            var v = vals[i];
            var h = (bottom - top) * v / max;
            var x = left + step * i + (step - barW) / 2;
            svg += '<rect x="' + x.toFixed(1) + '" y="' + (bottom - h).toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) +
                '" rx="3" fill="url(#cgBar)" opacity="' + (i === 0 ? '.95' : '.82') + '"/>';
            svg += '<text x="' + (x + barW / 2).toFixed(1) + '" y="' + (bottom - h - 7).toFixed(1) + '" text-anchor="middle" font-size="11" fill="#33415a">' + v + '</text>';
        });
        svg += '<line x1="' + left + '" y1="' + bottom + '" x2="' + (640 - right) + '" y2="' + bottom + '" stroke="#101b2c" stroke-opacity=".22" stroke-width="1"/>';
        svg += '</svg>';
        var labels = list.map(function (d, i) {
            var cx = left + step * i + step / 2;
            var pct = cx / 640 * 100;
            return '<span class="cg-chart-lbl" style="left:' + pct.toFixed(2) + '%;bottom:-24px"><b>D' + (i + 1) + '</b>' + vals[i] + ' 个</span>';
        }).join('');
        $('cgChart').innerHTML = svg + labels;
        $('cgChart').style.marginBottom = '28px';
    }

    /* ---------- 景点 ---------- */
    $('cgSpotsDesc').textContent = '共整理 ' + pins.length + ' 个核心景点/区域，地图编号与下方卡片一一对应。' +
        (spots.some(function (s) { return s.coord; }) ? '点地图圆点可以查看景点名称与建议。' : '部分景点暂无精确坐标，地图仅作城市方位参考。');

    var mapPoints = [];
    spots.forEach(function (s, i) {
        var c = s.coord || (cityCoord && i === 0 ? cityCoord : null);
        if (c) mapPoints.push({ name: s.name, coord: c, day: s.day, idx: s.idx, desc: s.desc });
    });

    $('cgSpotGrid').innerHTML = spots.map(function (s) {
        var meta = [];
        if (s.day) meta.push('<span>行程 Day ' + s.day + '</span>');
        if (s.ticket) meta.push('<span>门票 ' + esc(priceText(s.ticket)) + '</span>');
        if (s.coord) meta.push('<span>地图可定位</span>');
        return '<div class="cg-spot"><span class="n">' + s.idx + '</span><div><h3>' + esc(s.name) + '</h3>' +
            '<p>' + esc(s.desc) + '</p>' + (meta.length ? '<div class="meta">' + meta.join('') + '</div>' : '') + '</div></div>';
    }).join('');

    /* 地图筛选按钮 */
    var daySet = unique(mapPoints.map(function (p) { return p.day; }).filter(Boolean)).sort(function (a, b) { return a - b; });
    var bar = $('cgMapBar');
    bar.innerHTML = '<button class="cg-mapbtn" data-day="all" aria-pressed="true">全部景点</button>' +
        daySet.map(function (d) {
            return '<button class="cg-mapbtn" data-day="' + d + '" aria-pressed="false"><i style="background:#2563eb"></i>Day ' + d + '</button>';
        }).join('');

    function initMap() {
        if (!window.L || !$('cgMap') || !mapPoints.length) {
            var frame = document.querySelector('.cg-map-frame');
            if (frame) frame.innerHTML = '<div style="padding:40px 20px;text-align:center;color:#748196;font-size:13px">地图加载失败或暂无坐标，请查看下方景点列表。</div>';
            return;
        }
        var map = L.map('cgMap', { scrollWheelZoom: false, attributionControl: false, zoomControl: true, zoomSnap: .5 });
        L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}', {
            subdomains: ['1', '2', '3', '4'], maxZoom: 18, minZoom: 5
        }).addTo(map);

        var latlngs = [], markers = [];
        mapPoints.forEach(function (p) {
            var ll = [p.coord[1], p.coord[0]];
            latlngs.push(ll);
            var marker = L.marker(ll, {
                icon: L.divIcon({
                    className: 'cg-marker',
                    html: '<div class="cg-dot" style="--c:#2563eb">' + p.idx + '</div>',
                    iconSize: [24, 24], iconAnchor: [12, 12]
                }),
                title: p.name
            });
            marker.bindPopup('<div class="cg-pop"><b>' + esc(p.name) + '</b><span>' + esc(p.desc) + '</span></div>', { closeButton: false });
            marker.addTo(map);
            markers.push({ day: p.day, marker: marker, el: null });
        });
        if (latlngs.length > 1) {
            L.polyline(latlngs, { color: '#2563eb', weight: 3, opacity: .75, lineCap: 'round', lineJoin: 'round' }).addTo(map);
        }
        if (latlngs.length === 1) map.setView(latlngs[0], 11);
        else map.fitBounds(L.latLngBounds(latlngs).pad(.16), { padding: [24, 24], animate: false });

        bar.addEventListener('click', function (e) {
            var btn = e.target.closest('.cg-mapbtn');
            if (!btn) return;
            var sel = btn.getAttribute('data-day');
            Array.prototype.forEach.call(bar.querySelectorAll('.cg-mapbtn'), function (b) {
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            markers.forEach(function (m) {
                if (!m.el) m.el = m.marker.getElement() && m.marker.getElement().querySelector('.cg-dot');
                if (!m.el) return;
                var dim = sel !== 'all' && String(m.day) !== sel;
                m.el.classList.toggle('dim', dim);
            });
        });
    }

    /* ---------- 美食 ---------- */
    $('cgFoodDesc').textContent = foods.length
        ? (foodsFromProv
            ? '以下为省内代表性风味，可作为点菜参考；具体到本市，优先找居民区老店和本地人常去的馆子。'
            : '按本地人常吃、游客容易接受的标准挑选，价格为人均参考；份量通常偏大，点菜前可以先问。')
        : '站内暂未收录这座城市的具体美食清单，可以先从本地小吃、老字号和夜市入手。';
    if (foods.length) {
        $('cgFoodGrid').innerHTML = foods.slice(0, 9).map(function (f) {
            return '<div class="cg-food"><div class="top"><h3>' + esc(f.name) + '</h3>' +
                (f.price ? '<span class="price">' + esc(f.price) + '</span>' : '') + '</div>' +
                (f.desc ? '<p>' + esc(f.desc) + '</p>' : '<p>本地代表味道，建议找居民区老店或本地人常去的馆子。</p>') + '</div>';
        }).join('');
    } else {
        $('cgFoodGrid').innerHTML = '<div class="cg-food"><p>可以先尝本地早餐、夜市小吃和当季食材；具体店铺以本地人推荐为准。</p></div>';
    }

    /* ---------- 交通 ---------- */
    var flights = (detail && detail.airfare) || [];
    var trains = (detail && detail.trains) || [];
    var local = (detail && detail.transport) || [];

    $('cgTransportDesc').textContent = '跨城交通与市内移动分开看。机票、火车价格来自站内参考数据，实际以携程/12306 当日价格为准。';

    var tHtml = '';
    if (flights.length) {
        tHtml += '<div class="cg-tcard"><h3><i class="fas fa-plane"></i> 航班参考</h3>' + flights.map(function (f) {
            return '<div class="cg-row"><b>' + esc(f.from) + '→' + esc(f.to) + '</b>' +
                '<span class="p">' + esc(f.price || '') + '</span>' +
                (f.time ? '<span class="tip">' + esc(f.time) + '</span>' : '') +
                (f.bookingUrl ? '<a href="' + esc(f.bookingUrl) + '" target="_blank" rel="noopener">' + esc(f.platform || '携程机票') + ' →</a>' : '') + '</div>';
        }).join('') + '</div>';
    }
    if (trains.length) {
        tHtml += '<div class="cg-tcard"><h3><i class="fas fa-train"></i> 火车 / 高铁</h3>' + trains.map(function (t) {
            return '<div class="cg-row"><b>' + esc(t.from) + '→' + esc(t.to) + '</b>' +
                '<span class="p">' + esc(t.price || '') + '</span>' +
                (t.duration ? '<span class="tip">' + esc(t.duration) + '</span>' : '') +
                (t.bookingUrl ? '<a href="' + esc(t.bookingUrl) + '" target="_blank" rel="noopener">' + esc(t.platform || '12306') + ' →</a>' : '') + '</div>';
        }).join('') + '</div>';
    }
    if (local.length) {
        tHtml += '<div class="cg-tcard"><h3><i class="fas fa-bus"></i> 市内交通</h3>' + local.map(function (t) {
            return '<div class="cg-row"><b>' + esc(t.label) + '</b><span>' + esc(t.value) + '</span></div>';
        }).join('') + '</div>';
    }
    if (!detail) {
        tHtml += '<div class="cg-tcard"><h3><i class="fas fa-train"></i> 怎么到 ' + esc(name) + '</h3>' +
            '<div class="cg-row"><b>航空 + 高铁/大巴</b><span>先飞抵' + esc(prov ? prov.name : '省内') + '的主要机场，再换乘高铁或大巴前往' + esc(name) + '</span></div>' +
            '<div class="cg-row"><b>周边中转</b><span>从省会及邻近城市乘高铁/大巴通常最方便，班次与票价以 12306 / 携程当日为准</span></div></div>';
    }
    if (!tHtml) {
        tHtml = '<div class="cg-tcard"><h3><i class="fas fa-info-circle"></i> 交通信息</h3><p class="cg-tempty">站内暂未收录这座城市的详细交通数据。建议先在携程/12306 查询大交通，再按“市区住地铁沿线、景区住换乘中心附近”的原则安排。</p></div>';
    }
    $('cgTransportGrid').innerHTML = tHtml;

    /* ---------- 住宿 ---------- */
    var hotels = (detail && detail.hotels) || [];
    $('cgStayDesc').textContent = hotels.length
        ? '按区域而不是按酒店品牌选：先确定住在哪一片，再比较价格、评价和取消政策。'
        : '站内暂未收录具体酒店，建议优先选交通便利、评价稳定的商圈酒店或景区周边民宿。';
    var hHtml = '';
    var tierMap = { luxury: '奢华型', comfortable: '舒适型', economy: '经济型' };
    if (hotels.length) {
        hHtml = hotels.slice(0, 6).map(function (h) {
            return '<div class="cg-hotel"><span class="tier">' + esc(tierMap[h.tier] || h.tier || '住宿推荐') + '</span>' +
                '<h3>' + esc(h.name || '推荐住宿') + '</h3>' +
                (h.area ? '<div class="area"><i class="fas fa-map-marker-alt"></i> ' + esc(h.area) + '</div>' : '') +
                (h.price ? '<div class="price">' + esc(h.price) + '</div>' : '') +
                (h.highlight ? '<div class="hl">' + esc(h.highlight) + '</div>' : '') +
                (h.bookingUrl ? '<a href="' + esc(h.bookingUrl) + '" target="_blank" rel="noopener">查看预订 <i class="fas fa-arrow-right"></i></a>' : '') + '</div>';
        }).join('');
    } else if (!cityRec && prov && prov.hotels && prov.hotels.length) {
        hHtml = prov.hotels.slice(0, 6).map(function (s) {
            var m = String(s).match(/^\s*([^：:]+?)\s*[：:]\s*(.+)$/);
            var city = m ? m[1] : '';
            var rest = m ? m[2] : String(s);
            var pm = rest.match(/(¥[^\s，,]+.*)$/);
            var areaText = pm ? rest.replace(pm[1], '').trim() : rest;
            return '<div class="cg-hotel"><span class="tier">' + esc(city || '住宿区域') + '</span>' +
                '<h3>' + esc(areaText || '市区商圈') + '</h3>' +
                (pm ? '<div class="price">' + esc(pm[1]) + '</div>' : '') +
                '<div class="hl">优先看最近 3 个月评价、是否含早、能否免费取消。</div></div>';
        }).join('');
    }
    if (!hHtml) {
        hHtml = '<div class="cg-hotel"><h3>怎么选住宿</h3><p class="hl">城市游住地铁 2–3 站内的商圈，别住景区门口；环线游住县城中心；山区住换乘中心附近，第二天不用赶路。</p></div>';
    }
    $('cgHotelGrid').innerHTML = hHtml;

    /* ---------- 行程建议 ---------- */
    var planDefs = [
        { k: '线路 01', color: 'var(--cg-r1)', title: '一日精华', p: '适合中转停留或时间只有一天：只挑最能代表这座城市的一条线。', list: oneDay },
        { k: '线路 02', color: 'var(--cg-r2)', title: '两日经典', p: '覆盖核心景点与一顿本地味道，节奏不赶，适合周末。', list: twoDay },
        { k: '线路 03', color: 'var(--cg-r3)', title: deepTarget + ' 日深度', p: '按 ' + deepTarget + ' 天把城市及周边完整走一遍，适合小长假。', list: deepDays }
    ];
    $('cgPlanCards').innerHTML = planDefs.map(function (p) {
        var stops = [];
        p.list.forEach(function (d) { stops = stops.concat((d.timeline || []).map(function (it) { return String(it.activity || ''); }).filter(Boolean)); });
        stops = unique(stops).slice(0, 4);
        return '<div class="cg-plan" style="--rc:' + p.color + '"><span class="k">' + p.k + '</span><h3>' + esc(p.title) + '</h3>' +
            '<p>' + esc(p.p) + '</p><div class="line"><b>节奏：</b>' + p.list.length + ' 天 · ' + stops.join(' → ') + '</div></div>';
    }).join('');

    function timelineHtml(d) {
        return '<div class="cg-tl">' + (d.timeline || []).map(function (it) {
            var tags = [];
            if (it.duration) tags.push(String(it.duration));
            if (it.ticket) tags.push('门票 ' + priceText(it.ticket));
            if (it.price) tags.push(priceText(it.price));
            return '<div class="cg-tl-time">' + esc(it.time || '') + '</div>' +
                '<div class="cg-tl-axis"><span class="pt"></span></div>' +
                '<div class="cg-tl-body"><h4>' + esc(it.activity || '') + '</h4>' +
                (it.detail ? '<p>' + esc(it.detail) + '</p>' : '') +
                (tags.length ? '<div class="tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') + '</div>';
        }).join('') + '</div>';
    }

    $('cgDayList').innerHTML = days.map(function (d, i) {
        return '<details class="cg-day"' + (i === 0 ? ' open' : '') + '><summary>' +
            '<span class="dn">Day ' + (i + 1) + '</span>' +
            '<b>' + esc(d.theme || '城市漫步') + '</b>' +
            '<span class="cnt">' + ((d.timeline || []).length) + ' 个节点</span>' +
            '<span class="arrow"><i class="fas fa-chevron-right"></i></span></summary>' +
            '<div class="inner">' + timelineHtml(d) + '</div></details>';
    }).join('');

    /* ---------- 贴士与预算 ---------- */
    var groups = [
        { title: '预约与门票', re: /预约|门票|闭馆|开放|购票|抢票|实名/, list: [] },
        { title: '天气与装备', re: /天气|温|雨|雪|防晒|穿衣|季节|海拔|冷|热/, list: [] },
        { title: '安全与消费', re: /小心|注意|谨防|安全|罚款|贵|溢价|骗|防|不要/, list: [] }
    ];
    var others = [];
    tips.forEach(function (t) {
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].re.test(String(t))) { groups[i].list.push(t); return; }
        }
        others.push(t);
    });
    if (others.length) groups.push({ title: '其他提醒', re: null, list: others });
    var tipHtml = groups.filter(function (g) { return g.list.length; }).map(function (g, i) {
        return '<div class="cg-tip"><span class="no">0' + (i + 1) + ' / 提醒</span><h3>' + esc(g.title) + '</h3><ul>' +
            g.list.slice(0, 6).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
    $('cgTipGrid').innerHTML = tipHtml || '<div class="cg-tip"><h3>行前提醒</h3><ul><li>提前确认预约、开放时间与交通班次。</li></ul></div>';

    var bud = (detail && detail.budget) ? detail.budget.slice() : [];
    if (!bud.length && prov && prov.price && !cityRec) bud = [{ label: '参考起价', value: prov.price }];
    if (!bud.length) bud = [
        { label: '城市 2–3 日', value: '¥800–1,800' },
        { label: '省内环线 5–7 日', value: '¥2,500–4,500' }
    ];
    $('cgBudget').innerHTML = bud.map(function (b) {
        return '<div class="cg-bud' + (/合计|总计/.test(String(b.label || '')) ? ' total' : '') + '"><span>' + esc(b.label) +
            '</span><b>' + esc(b.value) + '</b></div>';
    }).join('');

    /* ---------- 导航与地图 ---------- */
    initMap();

    var nav = $('cgNav'), progress = $('cgProgress');
    var links = Array.prototype.slice.call(document.querySelectorAll('#cgLinks a'));
    var targets = links.map(function (a) {
        var id = a.getAttribute('href');
        return (id && id.length > 1) ? document.querySelector(id) : null;
    });
    var lastY = window.scrollY;

    function updateActive(y) {
        var mid = y + window.innerHeight * .34;
        var current = -1;
        targets.forEach(function (t, i) { if (t && t.offsetTop <= mid) current = i; });
        links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    }

    function onScroll() {
        var y = window.scrollY;
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
        if (y > 140 && y > lastY + 6) nav.classList.add('hide');
        else if (y < lastY - 6 || y < 140) nav.classList.remove('hide');
        lastY = y;
        updateActive(y);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
})();
