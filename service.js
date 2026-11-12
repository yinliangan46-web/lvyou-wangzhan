/* ============ MYL 智能客服（24小时在线，无需电话） ============ */
(function () {
    'use strict';

    var STORE_KEY = 'myl_cs_history_v1';
    var page, body, input, fab, badge, tip;
    var history = [];
    var greeted = false;
    var tipTimer = null;

    var WELCOME = '你好呀，我是 MYL 智能客服 👋<br>门票预约、行程规划、退改政策、交通住宿都能问我，7×24 小时在线。';

    var CHIPS_DEFAULT = ['怎么预约门票', '帮我规划行程', '退改政策', '交通和住宿', '转人工客服'];

    /* 目的地速答：名称 → [天数建议, 亮点, 一句话建议] */
    var DESTS = {
        '北京': ['4-5天', '故宫、八达岭长城、颐和园、天坛、南锣鼓巷', '故宫和国家博物馆要提前 7 天预约，周一多数博物馆闭馆'],
        '上海': ['3-4天', '外滩、武康路、豫园、迪士尼、朱家角', '迪士尼建议买早享卡，工作日人少一半'],
        '成都': ['4-5天', '大熊猫基地、宽窄巷子、都江堰、青城山、九寨沟', '熊猫基地早上 7:30 开园，越早越活跃'],
        '重庆': ['3-4天', '洪崖洞、解放碑、磁器口、武隆天坑、大足石刻', '洪崖洞晚上 19:00 后亮灯最好看，别在景区吃火锅'],
        '西安': ['3-4天', '兵马俑、城墙、大雁塔、回民街、华山', '兵马俑建议请讲解，否则就是看三个坑'],
        '杭州': ['3天', '西湖、灵隐寺、西溪湿地、龙井村、宋城', '西湖环湖骑行最舒服，周末灵隐寺要预约'],
        '南京': ['3天', '中山陵、南京博物院、总统府、夫子庙、牛首山', '中山陵和南博都需实名预约，周一南博闭馆'],
        '苏州': ['2-3天', '拙政园、苏州博物馆、平江路、同里、虎丘', '拙政园和蘇博要提前约，园林早上去人少'],
        '云南': ['7-9天', '昆明、大理、洱海、丽江、玉龙雪山、香格里拉', '经典昆大丽 7 天，海拔爬升慢一点更舒服'],
        '新疆': ['8-12天', '乌鲁木齐、天山天池、喀纳斯、伊犁、独库公路', '北疆看风景、南疆看人文，独库公路 6-9 月开放'],
        '西藏': ['7-10天', '拉萨、布达拉宫、纳木错、林芝、羊卓雍措', '布达拉宫需提前预约，进藏前 3 天别剧烈运动'],
        '海南': ['5-7天', '三亚、亚龙湾、蜈支洲岛、天涯海角、海口', '11 月-次年 3 月最舒服，台风季留意航班'],
        '张家界': ['3-4天', '森林公园、天门山、大峡谷玻璃桥、凤凰古城', '森林公园门票 4 天有效，建议住武陵源'],
        '哈尔滨': ['3-4天', '中央大街、索菲亚教堂、冰雪大世界、太阳岛', '冰雪大世界 12 月下旬开园，中央大街免费不用买票'],
        '厦门': ['3天', '鼓浪屿、环岛路、曾厝垵、南普陀、沙坡尾', '鼓浪屿船票要提前买，岛上不通车'],
        '青岛': ['3天', '栈桥、八大关、崂山、五四广场、啤酒博物馆', '栈桥和八大关免费，崂山要买票'],
        '长沙': ['2-3天', '橘子洲、岳麓山、太平老街、湖南省博物馆、文和友', '湖南省博物馆免费但要预约，周一闭馆'],
        '黄山': ['3天', '黄山风景区、宏村、西递、屯溪老街', '黄山建议后山上前山下，山上住一晚看日出'],
        '桂林': ['3-4天', '漓江、阳朔西街、遇龙河、龙脊梯田、象山', '漓江竹筏选杨堤-兴坪段，风景最集中'],
        '青海': ['6-8天', '西宁、青海湖、茶卡盐湖、大柴旦、敦煌', '青甘大环线 7 天最经典，注意防晒和海拔']
    };

    var INTENTS = [
        {
            k: ['你好', '您好', '在吗', 'hello', 'hi', '哈喽', '早上好', '晚上好'],
            a: function () {
                return '你好！我在的，24 小时都有人值守 🙂<br>可以直接说需求，比如「帮我生成南京 3 日游」「故宫怎么预约」「门票能退吗」。';
                    },
                    c: CHIPS_DEFAULT
        },
        {
            k: ['门票', '购票', '订票', '买票', '预约', '抢票', '预约不上'],
            a: function () {
                return '门票和预约这样处理：<span class="cs-line"></span>' +
                    '· <b>收费景点</b>：行程里点「携程购票」或「抖音看票」，直接到对应平台的购票页<span class="cs-line"></span>' +
                    '· <b>免费但需实名预约</b>（如南京博物院、中山陵、湖南省博物馆）：点绿色的「微信预约」，会自动复制小程序名，打开微信搜索即可<span class="cs-line"></span>' +
                    '· <b>热门景点</b>建议提前 3-7 天约，故宫、国博、莫高窟节假日基本秒空' +
                    '<div class="cs-card"><h5>需要我帮你查具体景点？</h5>直接说名字，例如「故宫怎么预约」「黄山门票多少」</div>';
                    },
                    c: ['故宫怎么预约', '南京博物院要预约吗', '黄山门票怎么买', '转人工客服']
        },
        {
            k: ['退', '退款', '退票', '改期', '取消', '改签'],
            a: function () {
                return '退改规则分两种：<span class="cs-line"></span>' +
                    '· <b>景点门票</b>：以携程/抖音/景区小程序的规则为准，多数「未使用可退」，部分特价票不可退<span class="cs-line"></span>' +
                    '· <b>行程定制</b>：出行前 7 天可全额退，3-7 天退 70%，48 小时内退 50%，具体看合同条款<span class="cs-line"></span>' +
                    '本站不收取任何预付款，所有支付都走平台或对公账户，谨防私下转账。';
                    },
                    c: ['怎么联系人工', '门票能退吗', '支付方式']
        },
        {
            k: ['发票', '报销', '开票'],
            a: function () {
                return '可以开发票。把「订单号 + 抬头 + 税号 + 邮箱」发到 <b>service@myl-travel.com</b>，1 个工作日内开出电子普票，专票需另附开户信息。';
                    },
                    c: ['转人工客服', '支付方式']
        },
        {
            k: ['行程', '路线', '规划', '日游', '几日游', '几天', '环线', '攻略', '怎么玩', '安排'],
            a: function () {
                return '行程规划用站内的 <b>AI 行程助手</b> 最快：<span class="cs-line"></span>' +
                    '· 输入「南京一日游」「川西 5 日游」→ 直接出完整行程 + 地图路线<span class="cs-line"></span>' +
                    '· 点「确认此方案」→ 上方生成时间线，含门票、美食、交通<span class="cs-line"></span>' +
                    '· 想微调就说「住好一点」「预算 5000」「加一天」' +
                    '<div class="cs-card"><h5>也可以告诉我</h5>出发城市 + 天数 + 偏好（亲子/出片/慢节奏），我给你排个方向</div>';
                    },
                    c: ['南京一日游', '川西 5 日游', '带老人怎么安排', '预算 5000 怎么玩']
        },
        {
            k: ['价格', '多少钱', '报价', '预算', '费用', '贵'],
            a: function () {
                return '人均参考（不含大交通）：<span class="cs-line"></span>' +
                    '· 城市 2-3 日：¥800-1,800<span class="cs-line"></span>' +
                    '· 省内环线 5-7 日：¥2,500-4,500<span class="cs-line"></span>' +
                    '· 新疆/西藏 8-12 日：¥6,000-12,000<span class="cs-line"></span>' +
                    '影响最大的是住宿档次和是否包车。你把「人数 + 天数 + 想住什么档次」发我，我给个更准的区间。';
                    },
                    c: ['预算 5000 怎么玩', '住好一点', '包车贵吗']
        },
        {
            k: ['酒店', '住宿', '住哪', '民宿', '住好'],
            a: function () {
                return '住宿建议：<span class="cs-line"></span>' +
                    '· 城市游：住地铁 2-3 站内的商圈，别住景区门口（贵且吵）<span class="cs-line"></span>' +
                    '· 环线游：住县城中心，比景区内便宜一半<span class="cs-line"></span>' +
                    '· 张家界住武陵源、黄山住汤口、九寨沟住沟口，通勤最省时间' +
                    '<div class="cs-card"><h5>选酒店三看</h5>看最近 3 个月评价、看是否含早、看能否免费取消</div>';
                    },
                    c: ['帮我规划行程', '预算 5000 怎么玩']
        },
        {
            k: ['交通', '高铁', '航班', '机票', '火车', '怎么去', '包车', '自驾', '租车'],
            a: function () {
                return '交通这块：<span class="cs-line"></span>' +
                    '· 跨城优先高铁，3 小时内比飞机省心<span class="cs-line"></span>' +
                    '· 环线（川西/青甘/新疆）建议包车或拼车，自驾注意高反和限速<span class="cs-line"></span>' +
                    '· 景区内多用官方摆渡车，别信门口拉客的「私家车直达」<span class="cs-line"></span>' +
                    '本站不代订机酒票，行程里会给到交通方式和时长参考。';
                    },
                    c: ['包车贵吗', '川西 5 日游', '转人工客服']
        },
        {
            k: ['天气', '穿衣', '几月去', '季节', '雨季', '冷'],
            a: function () {
                return '季节建议：<span class="cs-line"></span>' +
                    '· 3-5 月：江南、云南、川西都好<span class="cs-line"></span>' +
                    '· 6-8 月：避暑去青海、甘南、东北；南方注意台风<span class="cs-line"></span>' +
                    '· 9-11 月：全国最稳，新疆喀纳斯、内蒙胡杨林正当时<span class="cs-line"></span>' +
                    '· 12-2 月：哈尔滨冰雪、三亚避寒、云南晒太阳<span class="cs-line"></span>' +
                    '具体出发前 3 天看实时预报，山区昼夜温差按 10℃ 准备。';
                    },
                    c: ['几月去新疆最好', '帮我规划行程']
        },
        {
            k: ['老人', '小孩', '亲子', '带娃', '孕妇', '高反', '高原'],
            a: function () {
                return '带老人小孩的建议：<span class="cs-line"></span>' +
                    '· 每天安排 1-2 个主景点，中午留 2 小时休息<span class="cs-line"></span>' +
                    '· 高原（西藏/川西/青海）6 岁以下和 70 岁以上谨慎，先去西宁或林芝过渡<span class="cs-line"></span>' +
                    '· 亲子优先：动物园、科技馆、海洋馆、乐园，博物馆控制在 1.5 小时内<span class="cs-line"></span>' +
                    '· 随身带常用药、保温杯，行程别排太满。';
                    },
                    c: ['帮我规划行程', '转人工客服']
        },
        {
            k: ['安全', '靠谱', '诈骗', '被骗', '正规'],
            a: function () {
                return '安全提醒：<span class="cs-line"></span>' +
                    '· 本站不收取预付款，不会让你转账到个人账户<span class="cs-line"></span>' +
                    '· 所有门票走携程/抖音/景区官方小程序，行程确认后再付款<span class="cs-line"></span>' +
                    '· 遇到要求「私下加微信转账」的一律拒绝，并可回来找我们核实。';
                    },
                    c: ['支付方式', '转人工客服']
        },
        {
            k: ['支付', '付款', '定金', '转账', '怎么付'],
            a: function () {
                return '支付方式：<span class="cs-line"></span>' +
                    '· 门票/酒店：在携程、抖音、景区官方渠道自行支付<span class="cs-line"></span>' +
                    '· 定制服务：签合同后走对公账户或平台担保交易<span class="cs-line"></span>' +
                    '· 本站页面不收集银行卡信息，也不会索要验证码。';
                    },
                    c: ['退改政策', '转人工客服']
        },
        {
            k: ['人工', '转人工', '真人', '客服电话', '投诉', '建议', '反馈', '在线留言', '留言'],
            a: function () {
                return '已为你转接人工通道（7×24 值守，不需要打电话）：' +
                    '<div class="cs-card"><h5>人工客服</h5>' +
                    '微信：<b>MYL-Travel</b>（备注「来自网站」优先处理）<br>' +
                    '邮箱：<b>service@myl-travel.com</b>（1 个工作日内回复）<br>' +
                    '急事可在下方「在线留言」提交，附上手机号我们会回拨</div>' +
                    '也可以直接把问题发我，我能处理的会立刻给方案。';
                    },
                    c: ['在线留言', '退改政策']
        },
        {
            k: ['你是谁', '你们是谁', '关于', '公司', '靠谱吗', '介绍'],
            a: function () {
                return 'MYL 旅行是一个行程规划工具站：<span class="cs-line"></span>' +
                    '· 覆盖全国 300+ 城市、60+ 条经典环线<span class="cs-line"></span>' +
                    '· 免费生成行程、地图路线、门票与预约入口<span class="cs-line"></span>' +
                    '· 不卖机票酒店，不做预付，只把信息和工具做好。';
                    },
                    c: ['帮我规划行程', '怎么预约门票']
        },
        {
            k: ['谢谢', '感谢', '好的', '收到', 'ok', '嗯'],
            a: function () {
                return '不客气～ 还有问题随时喊我，24 小时都在 🙂';
            },
            c: CHIPS_DEFAULT
        }
    ];

    function nowTime() {
        var d = new Date();
        return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function save() {
        try {
            sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-60)));
        } catch (e) { }
    }

    function load() {
        try {
            var raw = sessionStorage.getItem(STORE_KEY);
            if (raw) history = JSON.parse(raw) || [];
        } catch (e) { history = []; }
    }

    /* ---------- 渲染 ---------- */
    function bubbleHTML(m) {
        if (m.from === 'me') return esc(m.text).replace(/\n/g, '<br>');
        return m.text;
    }

    function appendMsg(m, animate) {
        var wrap = document.createElement('div');
        wrap.className = 'cs-msg' + (m.from === 'me' ? ' me' : '');
        wrap.innerHTML = '<div class="cs-ava"><i class="fas fa-' + (m.from === 'me' ? 'user' : 'headset') + '"></i></div>' +
            '<div class="cs-bubble">' + bubbleHTML(m) + '</div>';
        if (animate) {
            wrap.style.opacity = '0';
            wrap.style.transform = 'translateY(8px)';
            wrap.style.transition = 'all .25s ease';
        }
        body.appendChild(wrap);
        if (animate) requestAnimationFrame(function () {
            wrap.style.opacity = '1';
            wrap.style.transform = 'translateY(0)';
        });
        body.scrollTop = body.scrollHeight;
    }

    function renderChips(list) {
        var bar = document.getElementById('csChips');
        if (!bar) return;
        bar.innerHTML = (list || CHIPS_DEFAULT).map(function (t) {
            return '<button class="cs-chip" type="button">' + esc(t) + '</button>';
        }).join('');
        Array.prototype.forEach.call(bar.querySelectorAll('.cs-chip'), function (b) {
            b.addEventListener('click', function () { send(b.textContent); });
        });
    }

    function typing() {
        var wrap = document.createElement('div');
        wrap.className = 'cs-msg';
        wrap.id = 'csTyping';
        wrap.innerHTML = '<div class="cs-ava"><i class="fas fa-headset"></i></div>' +
            '<div class="cs-bubble"><span class="cs-typing"><i></i><i></i><i></i></span></div>';
        body.appendChild(wrap);
        body.scrollTop = body.scrollHeight;
    }

    function stopTyping() {
        var t = document.getElementById('csTyping');
        if (t) t.remove();
    }

    /* ---------- 意图识别 ---------- */
    function matchDest(text) {
        for (var d in DESTS) if (text.indexOf(d) >= 0) return d;
        return null;
    }

    function reply(text) {
        var t = String(text || '');
        // 明确的购票/预约/退改问题优先，避免被城市名带偏
        var strong = /门票|购票|订票|买票|预约|退票|退款|改期|改签/.test(t);
        var dest = strong ? null : matchDest(t);
        if (dest) {
            var info = DESTS[dest];
            return {
                text: '<b>' + dest + ' · 建议 ' + info[0] + '</b><span class="cs-line"></span>' +
                    '值得去：' + info[1] + '<span class="cs-line"></span>' +
                    '小提示：' + info[2] +
                    '<div class="cs-card"><h5>要我直接排行程吗？</h5>回复「' + dest + ' 3 日游」或在 AI 行程助手里输入，会生成带地图路线的完整方案</div>',
                chips: [dest + ' 3 日游', '帮我规划行程', '怎么预约门票', '转人工客服']
            };
        }
        if (strong && /退|改期|改签|取消/.test(t)) {
            for (var r0 = 0; r0 < INTENTS.length; r0++) {
                if (INTENTS[r0].k[0] === '退') {
                    return { text: INTENTS[r0].a(), chips: INTENTS[r0].c };
                }
            }
        }
        for (var i = 0; i < INTENTS.length; i++) {
            var it = INTENTS[i];
            for (var j = 0; j < it.k.length; j++) {
                if (t.toLowerCase().indexOf(it.k[j].toLowerCase()) >= 0) {
                    var r = it.a();
                    return { text: r, chips: it.c };
                }
            }
        }
        return {
            text: '这个问题我先记下来，你可以这样问我会更准：<span class="cs-line"></span>' +
                '· 「故宫怎么预约」· 「黄山门票多少」· 「南京 3 日游怎么安排」<span class="cs-line"></span>' +
                '· 「门票能退吗」· 「预算 5000 怎么玩」· 「转人工客服」' +
                '<div class="cs-card"><h5>也可以直接转人工</h5>微信 <b>MYL-Travel</b> ｜ 邮箱 <b>service@myl-travel.com</b>，7×24 值守，不用打电话</div>',
            chips: CHIPS_DEFAULT
        };
    }

    /* ---------- 发送 ---------- */
    function send(text) {
        text = String(text || '').trim();
        if (!text) return;
        history.push({ from: 'me', text: text, t: nowTime() });
        appendMsg({ from: 'me', text: text }, true);
        save();
        input.value = '';

        typing();
        var r = reply(text);
        var delay = 420 + Math.min(600, r.text.length * 6);
        setTimeout(function () {
            stopTyping();
            history.push({ from: 'bot', text: r.text, t: nowTime() });
            appendMsg({ from: 'bot', text: r.text }, true);
            renderChips(r.chips);
            save();
            if (page && !page.classList.contains('open')) bumpBadge();
        }, delay);
    }

    /* ---------- 气泡提示 ---------- */
    function bumpBadge(n) {
        if (!badge) return;
        var cur = parseInt(badge.textContent || '0', 10) || 0;
        badge.textContent = String(cur + (n || 1));
        badge.classList.add('show');
    }

    function clearBadge() {
        if (!badge) return;
        badge.classList.remove('show');
        badge.textContent = '0';
    }

    /* ---------- 打开/关闭 ---------- */
    function openChat() {
        if (!page) return;
        page.classList.add('open');
        page.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cs-lock');
        clearBadge();
        if (!greeted) {
            greeted = true;
            setTimeout(function () {
                history.push({ from: 'bot', text: WELCOME, t: nowTime() });
                appendMsg({ from: 'bot', text: WELCOME }, true);
                renderChips(CHIPS_DEFAULT);
                save();
            }, 260);
        } else {
            setTimeout(function () { body.scrollTop = body.scrollHeight; }, 60);
        }
        setTimeout(function () { if (input) input.focus(); }, 420);
        if (tip) tip.classList.remove('show');
    }

    function closeChat() {
        if (!page) return;
        page.classList.remove('open');
        page.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cs-lock');
    }

    /* ---------- 初始化 ---------- */
    function init() {
        page = document.getElementById('csPage');
        body = document.getElementById('csBody');
        input = document.getElementById('csInput');
        fab = document.getElementById('csFab');
        badge = document.getElementById('csBadge');
        tip = document.getElementById('csFabTip');
        if (!page || !body) return;

        load();
        if (history.length) {
            history.forEach(function (m) { appendMsg(m); });
            renderChips(CHIPS_DEFAULT);
        }

        /* 底部动态头像 */
        if (fab) {
            fab.addEventListener('click', openChat);
            setTimeout(function () {
                if (tip && !page.classList.contains('open')) tip.classList.add('show');
                tipTimer = setTimeout(function () { if (tip) tip.classList.remove('show'); }, 6000);
            }, 2600);
        }

        /* 关闭 */
        var closer = document.getElementById('csClose');
        if (closer) closer.addEventListener('click', closeChat);
        page.addEventListener('click', function (e) { if (e.target === page) closeChat(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && page.classList.contains('open')) closeChat();
        });

        /* 发送 */
        var sendBtn = document.getElementById('csSend');
        if (sendBtn) sendBtn.addEventListener('click', function () { send(input.value); });
        if (input) input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
        });

        /* 人工客服按钮 */
        var human = document.getElementById('csHuman');
        if (human) human.addEventListener('click', function () { send('转人工客服'); });

        /* 一级页面入口 */
        Array.prototype.forEach.call(document.querySelectorAll('[data-open-cs]'), function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                openChat();
            });
        });
    }

    window.openServiceChat = openChat;
    window.closeServiceChat = closeChat;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
