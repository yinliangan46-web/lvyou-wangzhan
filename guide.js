
/* =====================================================================
   AI 路书：时间节点 + 景点/美食配图 + 携程/12306/抖音/微信预约链接
   （供 discover-data.js 的人格线路、剧游、Solo、最佳时节共用）
   ===================================================================== */
var aiGuideStore = [];
var MYL_DEP_KEY = 'mylDepartCity';

function mylEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

/* ---------- 图片：poi-img.js 按「景点/美食 + 所属城市」解析真实照片 ---------- */
function mylImgUrl(name, kind, city) {
    name = String(name || '旅行');
    if (typeof mylPOIImg === 'function') return mylPOIImg(name, kind, city);
    return kind === 'food' ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg';
}
function mylPic(src, name, kind) {
    var url = src || mylImgUrl(name, kind);
    var fb = kind === 'food' ? 'images/food-fallback.jpg' : 'images/city-fallback.jpg';
    return '<img class="guide-img" src="' + mylEsc(url) + '" alt="' + mylEsc(name)
        + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + fb + '\'">';
}

/* ---------- 预订链接 ---------- */
function ctripSightUrl(name, url) {
    return url || 'https://you.ctrip.com/searchresult?query=' + encodeURIComponent(name);
}
function douyinUrl(name) {
    return 'https://www.douyin.com/search/' + encodeURIComponent(name + ' 门票');
}
function wechatUrl(name) {
    return 'https://weixin.sogou.com/weixin?type=2&query=' + encodeURIComponent(name + ' 预约');
}
function ctripFlightUrl(from, to) {
    return 'https://flights.ctrip.com/online/list/oneway-' + encodeURIComponent(from) + '-' + encodeURIComponent(to);
}
function ctripTrainUrl(from, to) {
    return 'https://trains.ctrip.com/webapp/train/list?ticketType=0&dStation='
        + encodeURIComponent(from) + '&aStation=' + encodeURIComponent(to);
}
function openTransport(btn, kind) {
    var idx = btn.getAttribute('data-idx');
    var city = btn.getAttribute('data-city') || '';
    var input = document.getElementById('dep_' + idx);
    var dep = (input && input.value || '上海').trim() || '上海';
    try { localStorage.setItem(MYL_DEP_KEY, dep); } catch (e) { }
    var url = 'https://www.12306.cn/index/';
    if (kind === 'flight') url = ctripFlightUrl(dep, city);
    else if (kind === 'train') url = ctripTrainUrl(dep, city);
    window.open(url, '_blank', 'noopener');
}

/* ---------- 行程时间节点 ---------- */
function guideTimes(label) {
    var s = String(label || '');
    if (/上午/.test(s)) return ['09:00', '10:30', '12:00'];
    if (/下午/.test(s) && /晚上/.test(s)) return ['14:00', '15:30', '18:30', '20:00'];
    if (/下午/.test(s)) return ['14:00', '15:30', '17:30', '18:30'];
    if (/晚上|夜/.test(s)) return ['19:00', '20:30'];
    return ['09:00', '10:30', '12:00', '14:00', '15:30', '18:30', '20:00'];
}
function guidePickTime(times, i, n) {
    if (!times.length) return '';
    if (n <= 1) return times[0];
    var pos = Math.round(i / (n - 1) * (times.length - 1));
    return times[pos];
}
function guideCityOf(item) {
    var c = item.city || item.dest || '';
    c = String(c).split(/[·|｜]/)[0]
        .replace(/\s*[\d一二三四五六七八九十]+\s*[天日].*$/, '')
        .replace(/(冰雪大世界|油菜花|梯田|古镇|古城|草原|沙漠|瀑布|雪山|大峡谷|温泉|国家公园|风景名胜区|景区|博物馆|美术馆)$/, '')
        .replace(/(极光|治愈|小环线|大环线|环线|环岛|深度游|自由行|之旅|旅行|追光|慢游|滑雪|避冬|庙会|春节)$/, '')
        .replace(/([\u4e00-\u9fa5]{2,6})(?:市|县)$/, '$1')
        .trim();
    return c || '目的地';
}

function renderGuide(item) {
    var dest = item.dest || '目的地';
    var ai = item.ai || {};
    var attractions = ai.attractions || [];
    var foods = ai.foods || [];
    var hotels = ai.hotels || [];
    var timeline = ai.timeline || ai.days || [];
    var city = guideCityOf(item);
    var dep = '上海';
    try { dep = localStorage.getItem(MYL_DEP_KEY) || '上海'; } catch (e) { }
    var idx = item._idx;

    var html = '<div class="guide-head"><div class="guide-title">📖 ' + mylEsc(dest) + ' · AI 详细路书</div>'
        + '<div class="guide-sub">时间节点 · 景点门票 · 美食 · 大交通预订</div></div>';

    /* 概览 */
    var facts = [];
    if (ai.budget) facts.push(['💰 预算', ai.budget]);
    if (ai.bestTime) facts.push(['🌤️ 最佳时间', ai.bestTime]);
    if (ai.transport) facts.push(['🚗 当地交通', ai.transport]);
    if (ai.hotel) facts.push(['🏨 住宿', ai.hotel]);
    if (facts.length) {
        html += '<div class="guide-facts">' + facts.map(function (f) {
            return '<div class="guide-fact"><b>' + f[0] + '</b><span>' + mylEsc(f[1]) + '</span></div>';
        }).join('') + '</div>';
    }

    /* 每日时间节点 */
    if (timeline.length) {
        html += '<h4 class="guide-h">🗓️ 每日行程 · 时间节点</h4><div class="guide-days">';
        timeline.forEach(function (day, di) {
            var label = String(day.d || ('Day ' + (di + 1)));
            var text = String(day.t || '');
            var parts = text.split(/\s*→\s*|\s*->\s*/).filter(Boolean);
            if (!parts.length) parts = [text];
            var times = guideTimes(label);
            var nodes = parts.map(function (p, i) {
                var t = guidePickTime(times, i, parts.length);
                var attr = null;
                for (var k = 0; k < attractions.length; k++) {
                    var an = String(attractions[k].name || '');
                    if (an && (p.indexOf(an) >= 0 || an.indexOf(p) >= 0)) { attr = attractions[k]; break; }
                }
                return { time: t, text: p, attr: attr };
            });
            // 补午/晚餐节点
            var lunchFood = foods.length ? foods[di * 2 % foods.length] : null;
            var dinnerFood = foods.length ? foods[(di * 2 + 1) % foods.length] : null;
            var usedTimes = {};
            nodes.forEach(function (n) { usedTimes[n.time] = true; });
            var coversLunch = times.indexOf('12:00') >= 0 && !usedTimes['12:00'];
            var coversDinner = (times.indexOf('18:30') >= 0 || times.indexOf('20:00') >= 0)
                && !usedTimes['18:30'] && !usedTimes['19:00'];
            if (coversLunch && lunchFood) {
                nodes.push({ time: '12:00', text: '午餐 · ' + lunchFood.name + (lunchFood.desc ? '（' + lunchFood.desc + '）' : ''), food: lunchFood });
            }
            if (coversDinner && dinnerFood) {
                nodes.push({ time: '18:30', text: '晚餐 · ' + dinnerFood.name + (dinnerFood.desc ? '（' + dinnerFood.desc + '）' : ''), food: dinnerFood });
            }
            nodes.sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });

            html += '<div class="guide-day"><div class="guide-day-title">' + mylEsc(label) + '</div>';
            nodes.forEach(function (n) {
                var thumb = '';
                if (n.attr) {
                    thumb = '<div class="guide-node-media">' + mylPic(n.attr.img, n.attr.name, 'sight')
                        + '<div class="guide-node-links">'
                        + '<a href="' + mylEsc(ctripSightUrl(n.attr.name, n.attr.ctripUrl)) + '" target="_blank" rel="noopener">🎫 携程</a>'
                        + (n.attr.price && !/免费/.test(n.attr.price) ? '<a href="' + douyinUrl(n.attr.name) + '" target="_blank" rel="noopener">🎵 抖音</a>' : '')
                        + '</div></div>';
                } else if (n.food) {
                    thumb = '<div class="guide-node-media food">' + mylPic(n.food.img, n.food.name, 'food') + '</div>';
                }
                html += '<div class="guide-node"><span class="guide-time">' + n.time + '</span>'
                    + '<div class="guide-node-body"><div class="guide-node-text">' + mylEsc(n.text) + '</div>' + thumb + '</div></div>';
            });
            html += '</div>';
        });
        html += '</div>';
    }

    /* 景点 */
    if (attractions.length) {
        html += '<h4 class="guide-h">🎫 必去景点 · 门票/预约</h4><div class="guide-grid">';
        attractions.forEach(function (a) {
            var name = String(a.name || '');
            var paid = a.price && !/免费|无需/.test(a.price);
            var reserve = !!a.wechatUrl || /博物馆|故宫|兵马俑|纪念馆|美术馆|科技馆|索道|轮渡|游船|温泉|国家公园|大峡谷|雪山|环球|迪士尼|预约/.test(name);
            var links = '<a class="gl gl-ctrip" href="' + mylEsc(ctripSightUrl(name, a.ctripUrl)) + '" target="_blank" rel="noopener">🎫 携程' + (paid ? '门票' : '详情') + '</a>';
            if (paid) links += '<a class="gl gl-douyin" href="' + douyinUrl(name) + '" target="_blank" rel="noopener">🎵 抖音看票</a>';
            if (reserve) links += '<a class="gl gl-wechat" href="' + mylEsc(a.wechatUrl || wechatUrl(name)) + '" target="_blank" rel="noopener">💬 微信预约</a>';
            html += '<div class="guide-card">' + mylPic(mylImgUrl(name, 'sight', city), name, 'sight')
                + '<div class="guide-card-body"><div class="guide-card-top"><b>' + mylEsc(name) + '</b>'
                + (a.price ? '<span class="guide-price' + (paid ? ' paid' : '') + '">' + mylEsc(a.price) + '</span>' : '') + '</div>'
                + (a.desc ? '<p>' + mylEsc(a.desc) + '</p>' : '')
                + '<div class="guide-links">' + links + '</div></div></div>';
        });
        html += '</div>';
    }

    /* 美食 */
    if (foods.length) {
        html += '<h4 class="guide-h">🍜 必吃美食</h4><div class="guide-grid">';
        foods.forEach(function (f) {
            html += '<div class="guide-card food">' + mylPic(mylImgUrl(f.name, 'food'), f.name, 'food')
                + '<div class="guide-card-body"><div class="guide-card-top"><b>' + mylEsc(f.name) + '</b>'
                + (f.price ? '<span class="guide-price">' + mylEsc(f.price) + '</span>' : '') + '</div>'
                + (f.desc ? '<p>' + mylEsc(f.desc) + '</p>' : '') + '</div></div>';
        });
        html += '</div>';
    }

    /* 住宿 */
    if (hotels.length) {
        html += '<h4 class="guide-h">🏨 住宿推荐</h4><div class="guide-grid">';
        hotels.forEach(function (h) {
            html += '<div class="guide-card">' + mylPic(h.img, h.name, 'sight')
                + '<div class="guide-card-body"><div class="guide-card-top"><b>' + mylEsc(h.name) + '</b>'
                + (h.price ? '<span class="guide-price">' + mylEsc(h.price) + '</span>' : '') + '</div>'
                + (h.desc ? '<p>' + mylEsc(h.desc) + '</p>' : '')
                + '<div class="guide-links"><a class="gl gl-ctrip" href="' + mylEsc(h.ctripUrl || 'https://hotels.ctrip.com/') + '" target="_blank" rel="noopener">🏨 携程酒店</a></div>'
                + '</div></div>';
        });
        html += '</div>';
    }

    /* 大交通 */
    html += '<h4 class="guide-h">🚄 大交通 · 机票/高铁</h4>'
        + '<div class="guide-transport">'
        + '<label class="guide-dep">出发城市 <input id="dep_' + idx + '" type="text" value="' + mylEsc(dep) + '" placeholder="如：上海" /></label>'
        + '<div class="guide-transport-links">'
        + '<button class="gl gl-ctrip" type="button" data-idx="' + idx + '" data-city="' + mylEsc(city) + '" onclick="openTransport(this,\'flight\')">✈️ 携程机票</button>'
        + '<button class="gl gl-ctrip" type="button" data-idx="' + idx + '" data-city="' + mylEsc(city) + '" onclick="openTransport(this,\'train\')">🚄 携程高铁</button>'
        + '<button class="gl gl-12306" type="button" data-idx="' + idx + '" data-city="' + mylEsc(city) + '" onclick="openTransport(this,\'rail\')">🚉 12306</button>'
        + '</div>'
        + '<div class="guide-dep-tip">当前：' + mylEsc(dep) + ' → ' + mylEsc(city) + '（点开后在携程/12306 里可改日期与车次）</div>'
        + '</div>';

    if (ai.tips) html += '<div class="guide-tips"><b>💡 贴心提示</b><span>' + mylEsc(ai.tips) + '</span></div>';
    html += '<div class="guide-note">＊ 门票价格、开放时间、班次与预约要求可能随季节调整，以景区及平台当日公告为准。</div>';
    return html;
}

function toggleAIGuide(btn, panelId, idx) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        btn.textContent = '✨ AI 生成详细路书';
        return;
    }
    var item = aiGuideStore[idx] || {};
    item._idx = idx;
    btn.disabled = true;
    btn.textContent = '⏳ AI 正在生成路书...';
    setTimeout(function () {
        panel.innerHTML = renderGuide(item);
        panel.classList.add('open');
        panel.onclick = function (e) { e.stopPropagation(); };
        btn.disabled = false;
        btn.textContent = '📕 收起 AI 路书';
    }, 500);
}

/* =====================================================================
   Tab 切换
   ===================================================================== */
(function () {
    var btns = document.querySelectorAll('.tab-btn');
    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            btns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
            var panel = document.getElementById('panel-' + btn.dataset.tab);
            if (panel) panel.classList.add('active');
            window.scrollTo({ top: document.querySelector('.tabs').offsetTop - 70, behavior: 'smooth' });
        });
    });
})();
