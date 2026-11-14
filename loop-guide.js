/* ========== MYL 环线旅行百科（loop-guide） ========== */
(function () {
    'use strict';

    var GUIDES = window.LOOP_GUIDES || {};
    var KEYS = Object.keys(GUIDES);
    var params = new URLSearchParams(location.search);
    var key = params.get('key') || '';
    if (!GUIDES[key]) key = KEYS[0];
    var g = GUIDES[key];
    if (!g) return;

    function $(id) { return document.getElementById(id); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function photo(q, w, h) {
        return 'https://tse1-mm.cn.bing.net/th?q=' + encodeURIComponent(q) +
            '&w=' + (w || 720) + '&h=' + (h || 480) + '&c=7&rs=1&p=0&dpr=1.5&pid=1.7';
    }
    function imgTag(q, alt, fallback, eager) {
        return '<img src="' + esc(photo(q)) + '" alt="' + esc(alt) + '"' +
            (eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') +
            ' onerror="this.onerror=null;this.src=\'' + esc(fallback) + '\'">';
    }

    /* ---------- 主题与文档信息 ---------- */
    document.documentElement.style.setProperty('--accent', g.accent || '#b45309');
    document.documentElement.style.setProperty('--accent-soft', g.accentSoft || '#fef3c7');
    document.title = g.name + '旅行百科 | MYL 旅行';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', g.name + '旅行百科：介绍、历史、地理、人文、美食与必游景点，一页读懂这条环线。');

    /* ---------- 首屏 ---------- */
    var hero = $('lgHeroImg');
    hero.alt = g.name + '沿线风景';
    hero.onerror = function () { this.onerror = null; this.src = g.heroFallback || 'images/city-fallback.jpg'; };
    hero.src = photo(g.heroQ, 1600, 1000);

    $('lgKicker').textContent = 'MYL 环线旅行百科 · ' + g.region;
    $('lgTitle').textContent = g.name;
    $('lgEn').textContent = g.en || '';
    $('lgTags').innerHTML = (g.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    $('lgMeta').innerHTML = [
        ['行程', g.days],
        ['里程', g.km],
        ['最佳季节', g.bestTime],
        ['参考预算', g.price]
    ].map(function (x) { return '<div><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>'; }).join('');
    $('lgFootLeft').textContent = g.region + ' · ' + g.days;
    $('lgFootBot').textContent = 'MYL 环线旅行百科 · ' + g.name;

    /* ---------- 01 介绍 ---------- */
    $('lgLead').textContent = g.intro.lead;
    $('lgIntroParas').innerHTML = (g.intro.paras || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    $('lgFacts').innerHTML = (g.intro.facts || []).map(function (f) {
        return '<div><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>';
    }).join('');
    $('lgTagline').innerHTML = (g.tags || []).map(function (t) { return '<span>#' + esc(t) + '</span>'; }).join('');

    /* ---------- 02 历史 ---------- */
    $('lgHistorySummary').textContent = g.history.summary;
    $('lgTimeline').innerHTML = (g.history.eras || []).map(function (e) {
        return '<li><time>' + esc(e.t) + '</time><h3>' + esc(e.h) + '</h3><p>' + esc(e.p) + '</p></li>';
    }).join('');

    /* ---------- 03 地理 ---------- */
    $('lgGeoLead').textContent = g.geography.lead;
    $('lgGeoParas').innerHTML = (g.geography.paras || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    $('lgGeoFacts').innerHTML = (g.geography.facts || []).map(function (f) {
        return '<div><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>';
    }).join('');
    $('lgGeoKeywords').innerHTML = (g.geography.keywords || []).map(function (k) { return '<span>' + esc(k) + '</span>'; }).join('');

    /* ---------- 04 人文 ---------- */
    $('lgCultureLead').textContent = g.culture.lead;
    $('lgCultureParas').innerHTML = (g.culture.paras || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    $('lgCultureCards').innerHTML = (g.culture.cards || []).map(function (c, i) {
        return '<article class="lg-culture-card" data-i="' + String(i + 1).padStart(2, '0') + '">' +
            '<h3>' + esc(c.t) + '</h3><p>' + esc(c.p) + '</p></article>';
    }).join('');

    /* ---------- 05 美食 ---------- */
    $('lgFoodGrid').innerHTML = (g.foods || []).map(function (f, i) {
        return '<article class="lg-card">' +
            '<div class="lg-card-media">' + imgTag(f.q, g.name + ' · ' + f.n, 'images/food-fallback.jpg') +
            '<span class="lg-num">' + String(i + 1).padStart(2, '0') + '</span></div>' +
            '<div class="lg-card-body"><h3>' + esc(f.n) + '</h3><p>' + esc(f.d) + '</p>' +
            '<div class="lg-card-meta"><span><i class="fas fa-location-dot"></i>' + esc(f.w || '沿途') + '</span></div></div></article>';
    }).join('');

    /* ---------- 06 景点 ---------- */
    $('lgSpotGrid').innerHTML = (g.spots || []).map(function (s, i) {
        return '<article class="lg-card">' +
            '<div class="lg-card-media">' + imgTag(s.q, g.name + ' · ' + s.n, 'images/city-fallback.jpg') +
            '<span class="lg-num">' + String(i + 1).padStart(2, '0') + '</span></div>' +
            '<div class="lg-card-body"><h3>' + esc(s.n) + '</h3><p>' + esc(s.d) + '</p>' +
            '<div class="lg-card-meta"><span><i class="fas fa-location-dot"></i>' + esc(s.loc || '沿线') + '</span>' +
            '<span><i class="fas fa-ticket"></i>' + esc(s.ticket || '以景区公告为准') + '</span></div></div></article>';
    }).join('');

    /* ---------- 07 其他环线 ---------- */
    $('lgSwitch').innerHTML = KEYS.map(function (k) {
        var x = GUIDES[k];
        return '<a href="loop-guide.html?key=' + encodeURIComponent(k) + '"' + (k === key ? ' class="on"' : '') + '>' +
            '<span>' + esc(x.name) + '</span><small>' + esc(x.days + ' · ' + x.km) + '</small></a>';
    }).join('');

    /* ---------- 阅读进度与入场 ---------- */
    var progress = $('lgProgress');
    function onScroll() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var revealTargets = document.querySelectorAll('.lg-sec .lg-head, .lg-intro-grid, .lg-history-grid, .lg-geo-grid, .lg-culture-grid, .lg-card-grid, .lg-switch');
    revealTargets.forEach(function (el) { el.classList.add('lg-reveal'); });
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
            });
        }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(function (el) { io.observe(el); });
    } else {
        revealTargets.forEach(function (el) { el.classList.add('in'); });
    }
})();
