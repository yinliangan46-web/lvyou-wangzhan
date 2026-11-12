/* ============ MYL 智能客服 v2（24小时在线，无需电话） ============ */
(function () {
    'use strict';

    var STORE_KEY = 'myl_cs_history_v2';
    var page, body, input, chipsBar, fab, badge, tip, toBottom, sendBtn;
    var history = [];
    var greeted = false;
    var tipTimer = null;
    var ctx = { dest: null, spot: null };
    var spotIndex = null;
    var ticketIndex = null;

    var MENU_ITEMS = [
        { q: '怎么预约门票', icon: 'fa-ticket-alt', title: '门票预约', desc: '实名预约/购票入口' },
        { q: '帮我规划行程', icon: 'fa-route', title: '行程定制', desc: '按天数排路线' },
        { q: '退改政策', icon: 'fa-undo-alt', title: '退改签', desc: '退款/改期规则' },
        { q: '交通和住宿', icon: 'fa-hotel', title: '交通住宿', desc: '怎么去/住哪里' },
        { q: '发票怎么开', icon: 'fa-file-invoice', title: '发票报销', desc: '电子发票开具' },
        { q: '转人工客服', icon: 'fa-user-tie', title: '人工客服', desc: '邮箱/电话' }
    ];

    var FAQS = [
        '故宫怎么预约',
        '南京博物院要预约吗',
        '门票能退吗',
        '怎么开发票',
        '带老人怎么安排',
        '几月去新疆最好',
        '支付方式',
        '怎么联系人工'
    ];

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

    /* 中文城市名 → city-data key（CITY_DETAIL） */
    var CITY_KEY = {
        '北京': 'beijing', '上海': 'shanghai', '成都': 'chengdu', '重庆': 'chongqing',
        '西安': 'xian', '杭州': 'hangzhou', '南京': 'nanjing', '苏州': 'suzhou',
        '长沙': 'changsha', '厦门': 'xiamen', '青岛': 'qingdao', '桂林': 'guilin',
        '张家界': 'zhangjiajie', '黄山': 'huangshan', '丽江': 'lijiang', '大理': 'dali',
        '昆明': 'kunming', '拉萨': 'lasa', '三亚': 'sanya', '海口': 'haikou',
        '哈尔滨': 'harbin', '武汉': 'wuhan', '广州': 'guangzhou', '深圳': 'shenzhen',
        '香港': 'hongkong', '天津': 'tianjin', '福州': 'fuzhou', '贵阳': 'guiyang',
        '兰州': 'lanzhou', '西宁': 'xining', '银川': 'yinchuan', '乌鲁木齐': 'urumqi',
        '敦煌': 'dunhuang', '九寨沟': 'jiuzhaigou', '乐山': 'leshan', '西双版纳': 'xishuangbanna',
        '郑州': 'zhengzhou', '济南': 'jinan', '合肥': 'hefei', '南昌': 'nanchang',
        '太原': 'taiyuan', '石家庄': 'shijiazhuang', '沈阳': 'shenyang', '长春': 'changchun',
        '呼和浩特': 'huhehaote', '南宁': 'nanning', '巴黎': 'paris', '东京': 'tokyo',
        '伦敦': 'london', '迪拜': 'dubai', '曼谷': 'bangkok', '巴厘岛': 'bali'
    };

    /* 交通关键词 —— 出现这些词优先走交通意图 */
    var TRANSPORT_KW = /航班|机票|飞机|飞|高铁|动车|火车|列车|地铁|打车|网约车|包车|自驾|租车|轮渡|船票|怎么去|怎么到|如何去|到达|出发|从.{0,4}到|↔|->|→/;

    /* 行程关键词 —— "X日游"明确要日程 */
    var ITINERARY_KW = /日游|天游|天行程|日行程|安排一下|具体行程|详细安排|每天怎么玩|每天安排/;

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
                    '<div class="cs-card"><h5>需要我帮你查具体景点？</h5>直接说名字，例如「故宫怎么预约」「黄山门票怎么买」</div>';
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
                return '可以开发票。把「订单号 + 抬头 + 税号 + 邮箱」发到 <b>2377411629@qq.com</b>，1 个工作日内开出电子普票，专票需另附开户信息。';
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
                return '已为你转接人工通道（7×24 值守）：' +
                    '<div class="cs-card"><h5>人工客服</h5>' +
                    '邮箱：<b>2377411629@qq.com</b>（1 个工作日内回复）<br>' +
                    '如需打电话：<a href="tel:17708491297"><b>17708491297</b></a></div>' +
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

    /* ---------- 基础工具 ---------- */
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

    function metaHTML(m) {
        var h = '<div class="cs-meta"><span class="cs-time">' + esc(m.t || '') + '</span>';
        h += '<button type="button" class="cs-act" data-cs-copy title="复制"><i class="fas fa-copy"></i></button>';
        if (m.from !== 'me') {
            h += '<button type="button" class="cs-act" data-cs-fb="up" title="有帮助"><i class="far fa-thumbs-up"></i></button>' +
                '<button type="button" class="cs-act" data-cs-fb="down" title="没帮助"><i class="far fa-thumbs-down"></i></button>';
        }
        return h + '</div>';
    }

    function appendMsg(m, animate) {
        var wrap = document.createElement('div');
        wrap.className = 'cs-msg' + (m.from === 'me' ? ' me' : '');
        wrap.innerHTML = '<div class="cs-ava"><i class="fas fa-' + (m.from === 'me' ? 'user' : 'headset') + '"></i></div>' +
            '<div class="cs-bubblewrap"><div class="cs-bubble">' + bubbleHTML(m) + '</div>' + metaHTML(m) + '</div>';
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
        scrollBottom(m.from === 'me');
    }

    function scrollBottom(force) {
        if (!body) return;
        var near = body.scrollHeight - body.scrollTop - body.clientHeight < 140;
        if (force || near) body.scrollTop = body.scrollHeight;
        updateToBottom();
    }

    function updateToBottom() {
        if (!body || !toBottom) return;
        var far = body.scrollHeight - body.scrollTop - body.clientHeight > 200;
        toBottom.classList.toggle('show', far);
    }

    function renderChips(list) {
        if (!chipsBar) return;
        var arr = Array.isArray(list) ? list : CHIPS_DEFAULT;
        chipsBar.innerHTML = arr.map(function (t) {
            return '<button class="cs-chip" type="button" data-cs-send="' + esc(t) + '">' + esc(t) + '</button>';
        }).join('');
    }

    function typing() {
        var wrap = document.createElement('div');
        wrap.className = 'cs-msg';
        wrap.id = 'csTyping';
        wrap.innerHTML = '<div class="cs-ava"><i class="fas fa-headset"></i></div>' +
            '<div class="cs-bubblewrap"><div class="cs-bubble cs-typing-wrap">' +
            '<span class="cs-typing"><i></i><i></i><i></i></span><span class="cs-typing-txt">客服正在输入</span>' +
            '</div></div>';
        body.appendChild(wrap);
        scrollBottom(true);
    }

    function stopTyping() {
        var t = document.getElementById('csTyping');
        if (t) t.remove();
    }

    function botSay(r) {
        history.push({ from: 'bot', text: r.text, t: nowTime() });
        appendMsg({ from: 'bot', text: r.text, t: nowTime() }, true);
        renderChips(r.chips);
        save();
    }

    /* ---------- 服务导航 / 常见问题 ---------- */
    function menuHTML() {
        return '<div class="cs-menu">' + MENU_ITEMS.map(function (m) {
            return '<button type="button" class="cs-tile" data-cs-send="' + esc(m.q) + '">' +
                '<i class="fas ' + m.icon + '"></i><b>' + esc(m.title) + '</b><small>' + esc(m.desc) + '</small></button>';
        }).join('') + '</div>';
    }

    function welcomeText() {
        return '你好呀，我是 MYL 智能客服 👋<br>门票预约、行程规划、退改政策、交通住宿都能问我，7×24 小时在线。' +
            '<div class="cs-hint-line">你可以点下面的服务，也可以直接输入问题</div>' + menuHTML();
    }

    function faqAnswer() {
        return {
            text: '<b>常见问题</b><span class="cs-line"></span>点一条直接问我，也可以输入景点名查门票和预约：' +
                '<div class="cs-faq">' + FAQS.map(function (q) {
                    return '<button type="button" data-cs-send="' + esc(q) + '"><i class="fas fa-question-circle"></i>' + esc(q) + '</button>';
                }).join('') + '</div>',
            chips: CHIPS_DEFAULT
        };
    }

    /* ---------- 景点数据 ---------- */
    function buildSpotIndex() {
        spotIndex = [];
        var co = window.REAL_POI_COORDS || {};
        for (var k in co) {
            var city = '';
            var name = k;
            var i = k.indexOf('·');
            if (i > 0) { city = k.slice(0, i); name = k.slice(i + 1); }
            if (name.length < 2 || name === city) continue;
            spotIndex.push({ name: name, city: city });
        }
        spotIndex.sort(function (a, b) { return b.name.length - a.name.length; });
    }

    /* ---------- 城市数据 ---------- */
    function cityKeyOf(name) { return CITY_KEY[name] || null; }
    function cityDataOf(name) {
        var k = cityKeyOf(name);
        if (!k) return null;
        var cd = window.CITY_DETAIL || {};
        return cd[k] || null;
    }

    /* 解析 "A到B 的 航班/高铁" */
    function parseRoute(text) {
        var t = String(text);
        var found = [];
        for (var cn in CITY_KEY) {
            if (t.indexOf(cn) >= 0) found.push({ name: cn, idx: t.indexOf(cn) });
        }
        found.sort(function (a, b) { return a.idx - b.idx; });
        if (found.length < 2) return null;
        var dirIdx = -1;
        var dirs = ['到', '至', '飞', '前往', '去', '→', '->', '↔'];
        for (var d = 0; d < dirs.length; d++) {
            var p = t.indexOf(dirs[d]);
            if (p >= 0 && (dirIdx < 0 || p < dirIdx)) dirIdx = p;
        }
        var from, to;
        if (dirIdx < 0) { from = found[0].name; to = found[found.length - 1].name; }
        else if (found[0].idx < dirIdx) { from = found[0].name; to = found[1].name; }
        else { from = found[1].name; to = found[0].name; }
        if (from === to) return null;
        return { from: from, to: to };
    }

    /* 航班/火车 回复 */
    function transportAnswer(route, kind) {
        var fromD = cityDataOf(route.from);
        var toD = cityDataOf(route.to);
        var html = '<b>' + esc(route.from) + ' → ' + esc(route.to) + '</b>';
        html += '<span class="cs-line"></span><span class="cs-tag cs-tag-paid">' + (kind === 'flight' ? '航班' : '火车') + '</span>';

        if (kind === 'flight') {
            var links = [];
            if (toD && toD.airfare) {
                for (var i = 0; i < toD.airfare.length; i++) {
                    if (toD.airfare[i].from.indexOf(route.from) >= 0) links.push(toD.airfare[i]);
                }
            }
            if (links.length === 0 && fromD && fromD.airfare) {
                for (var j = 0; j < fromD.airfare.length; j++) {
                    if (fromD.airfare[j].to.indexOf(route.to) >= 0) links.push(fromD.airfare[j]);
                }
            }
            if (links.length > 0) {
                for (var k = 0; k < links.length; k++) {
                    var l = links[k];
                    html += '<div class="cs-t-row"><b>' + esc(l.from) + '→' + esc(l.to) + '</b> ' +
                        '<span class="cs-t-p">¥' + esc(l.price.replace(/[¥￥]/g, '')) + '</span> ' +
                        '<span class="cs-t-tip">' + esc(l.time) + '</span> ' +
                        '<a href="' + esc(l.bookingUrl) + '" target="_blank" rel="noopener">' +
                        '<i class="fas fa-external-link"></i> ' + esc(l.platform) + '</a></div>';
                }
            } else {
                html += '本站暂未收录这条线路的实时机票信息。建议：' +
                    '<span class="cs-line"></span>· 在携程/去哪儿搜「' + esc(route.from) + ' → ' + esc(route.to) + '」' +
                    '<span class="cs-line"></span>· 国际航班通常需中转（北京/上海/香港/首尔/迪拜等）' +
                    '<span class="cs-line"></span>· 提前 2-3 个月订票最便宜，留意廉航促销' +
                    '<span class="cs-line"></span><a href="https://flights.ctrip.com" target="_blank" rel="noopener"><i class="fas fa-external-link"></i> 携程机票</a>';
            }
            if (toD && toD.transport) {
                html += '<span class="cs-line"></span><b>' + esc(route.to) + ' 市内交通</b>';
                toD.transport.forEach(function (t) {
                    html += '<div class="cs-t-row"><b>' + esc(t.label) + '</b>：' + esc(t.value) + '</div>';
                });
            }
        } else {
            var trains = [];
            if (toD && toD.trains) {
                for (var t = 0; t < toD.trains.length; t++) {
                    if (toD.trains[t].from.indexOf(route.from) >= 0) trains.push(toD.trains[t]);
                }
            }
            if (trains.length > 0) {
                for (var m = 0; m < trains.length; m++) {
                    var tr = trains[m];
                    html += '<div class="cs-t-row"><b>' + esc(tr.from) + '→' + esc(tr.to) + '</b> ' +
                        '<span class="cs-t-p">¥' + esc(tr.price.replace(/[¥￥]/g, '')) + '</span> ' +
                        '<span class="cs-t-tip">' + esc(tr.duration) + '，' + esc(tr.time) + '</span> ' +
                        '<a href="' + esc(tr.bookingUrl) + '" target="_blank" rel="noopener">' +
                        '<i class="fas fa-external-link"></i> ' + esc(tr.platform) + '</a></div>';
                }
            } else {
                html += '这条线路暂无直达高铁数据，可在 12306 / 携程 火车票频道查询，或考虑飞机。';
            }
        }
        return { text: html, chips: ['酒店多少钱一晚', '怎么预约门票', '转人工客服'] };
    }

    /* X日游 → 直接输出每日行程 */
    function itineraryAnswer(city, dayNum) {
        var cd = cityDataOf(city);
        var days = cd && cd.itinerary ? cd.itinerary.slice(0, dayNum) : [];
        var html = '<b>' + esc(city) + ' · ' + dayNum + ' 日行程安排</b>';

        if (days.length === 0) {
            var info = DESTS[city];
            if (!info) {
                return { text: '抱歉，' + esc(city) + ' 的详细行程数据暂未收录。在 AI 行程助手里输入「' + esc(city) + ' ' + dayNum + ' 日游」能直接生成带地图的方案。', chips: ['帮我规划行程', '转人工客服'] };
            }
            html += '<span class="cs-line"></span>值得去：' + esc(info[1]) +
                '<span class="cs-line"></span>' + esc(info[2]) +
                '<div class="cs-card"><h5>完整每日安排</h5>在 AI 行程助手里输入「' + esc(city) + ' ' + dayNum + ' 日游」会生成带地图路线的详细方案</div>';
            return { text: html, chips: [city + ' ' + dayNum + ' 日游', '帮我规划行程', '转人工客服'] };
        }

        days.forEach(function (d) {
            html += '<span class="cs-line"></span><b>' + esc(d.day || ('Day ' + (days.indexOf(d) + 1))) + '</b>' +
                (d.theme ? ' <span class="cs-t-tip">' + esc(d.theme) + '</span>' : '');
            var items = (d.timeline || []).slice(0, 5);
            items.forEach(function (it) {
                var time = it.time ? '<span class="cs-t-time">' + esc(it.time) + '</span>' : '';
                var act = esc(it.activity || '');
                var det = it.detail ? '<span class="cs-t-detail"> ' + esc(it.detail) + '</span>' : '';
                var tic = it.ticket ? ' <span class="cs-tag cs-tag-paid">门票 ' + esc(it.ticket) + '</span>' : '';
                html += '<div class="cs-d-item">' + time + ' <b>' + act + '</b>' + det + tic + '</div>';
            });
        });

        if (cd.transport) {
            html += '<span class="cs-line"></span><b>' + esc(city) + ' 交通</b>';
            cd.transport.forEach(function (t) {
                html += '<div class="cs-t-row"><b>' + esc(t.label) + '</b>：' + esc(t.value) + '</div>';
            });
        }
        if (cd.tips && cd.tips.length) {
            html += '<span class="cs-line"></span><b>小贴士</b>';
            cd.tips.slice(0, 3).forEach(function (tp, idx) {
                html += '<div class="cs-t-row">' + (idx + 1) + '. ' + esc(tp) + '</div>';
            });
        }

        html += '<div class="cs-card"><h5>想更灵活一点？</h5>在 AI 行程助手里输入「' + esc(city) + ' ' + dayNum + ' 日游」可以地图上拖拽调整景点顺序</div>';
        return { text: html, chips: ['帮我规划行程', '怎么预约门票', '酒店多少钱一晚', '转人工客服'] };
    }

    function findSpot(text) {
        if (!spotIndex) buildSpotIndex();
        for (var i = 0; i < spotIndex.length; i++) {
            if (text.indexOf(spotIndex[i].name) >= 0) return spotIndex[i];
        }
        return null;
    }

    function findTicketPrice(name) {
        if (ticketIndex === null) {
            ticketIndex = {};
            var routes = window.LOOP_ROUTES || [];
            for (var r = 0; r < routes.length; r++) {
                var days = (routes[r] && routes[r].itinerary) || [];
                for (var d = 0; d < days.length; d++) {
                    var list = (days[d] && days[d].timeline) || [];
                    for (var j = 0; j < list.length; j++) {
                        var it = list[j] || {};
                        var m = String(it.ticket || '').match(/[¥￥]\s*(\d{1,4})/);
                        if (m && it.activity) {
                            var key = String(it.activity);
                            if (!ticketIndex[key]) ticketIndex[key] = m[1];
                        }
                    }
                }
            }
        }
        var found = '', prices = {};
        for (var act in ticketIndex) {
            if (act.indexOf(name) >= 0) {
                if (!found || act.length < found.length) found = act;
                prices[ticketIndex[act]] = 1;
            }
        }
        var keys = Object.keys(prices);
        if (!found || keys.length !== 1) return '';
        return { price: keys[0], activity: found };
    }

    function miniNameFor(name) {
        try {
            var html = String(window._wechatReserveBtn ? window._wechatReserveBtn(name) : '');
            var m = html.match(/mylWechatReserve\('([^']*)','([^']*)'\)/);
            return m ? m[2] : '';
        } catch (e) { return ''; }
    }

    function ticketLinksFor(name) {
        try {
            return String(window._ticketLinks ? window._ticketLinks(name, '', '') : '');
        } catch (e) { return ''; }
    }

    function spotAnswer(s) {
        ctx.spot = s.name;
        if (s.city) ctx.dest = s.city;
        var html = '<b>' + esc(s.name) + '</b>' + (s.city ? ' <span class="cs-spot-city">' + esc(s.city) + '</span>' : '') + '<span class="cs-line"></span>';
        var mini = miniNameFor(s.name);
        var links = ticketLinksFor(s.name);

        if (mini) {
            html += '<span class="cs-tag cs-tag-wx"><i class="fas fa-check-circle"></i> 需实名预约</span>' +
                '微信搜索小程序「<b>' + esc(mini) + '</b>」，建议提前 3-7 天预约，节假日更早。';
        } else if (/携程购票/.test(links)) {
            html += '<span class="cs-tag cs-tag-paid">收费景点</span>购票入口：' + links;
        } else {
            html += '<span class="cs-tag cs-tag-free">免费开放</span>通常无需购票' +
                (/博物馆|博物院|纪念馆|美术馆|遗址/.test(s.name)
                    ? '，但多数场馆仍需实名预约，出发前在官方公众号/小程序确认。'
                    : '，个别体验项目单独收费，以现场公示为准。');
        }

        var t = findTicketPrice(s.name);
        if (t) {
            html += '<span class="cs-line"></span>行程参考门票：<b>¥' + t.price + '</b>' +
                '<span class="cs-note">（来自站内「' + esc(t.activity) + '」，以景区当日票价为准）</span>';
        }

        html += '<div class="cs-card"><h5>下一步</h5>' +
            '想看完整路线？回复「' + esc(s.city || s.name) + ' 3 日游」，或用站内 AI 行程助手生成带地图的方案。</div>';
        return {
            text: html,
            chips: ['帮我规划行程', '怎么预约门票', '转人工客服']
        };
    }

    /* ---------- 意图匹配 ---------- */
    function matchDest(text) {
        for (var d in DESTS) if (text.indexOf(d) >= 0) return d;
        return null;
    }

    function destAnswer(d) {
        ctx.dest = d;
        var info = DESTS[d];
        return {
            text: '<b>' + d + ' · 建议 ' + info[0] + '</b><span class="cs-line"></span>' +
                '值得去：' + info[1] + '<span class="cs-line"></span>' +
                '小提示：' + info[2] +
                '<div class="cs-card"><h5>要我直接排行程吗？</h5>回复「' + d + ' 3 日游」或在 AI 行程助手里输入，会生成带地图路线的完整方案</div>',
            chips: [d + ' 3 日游', '帮我规划行程', '怎么预约门票', '转人工客服']
        };
    }

    function firstSpotOf(city) {
        if (!spotIndex) buildSpotIndex();
        for (var i = 0; i < spotIndex.length; i++) {
            if (spotIndex[i].city === city) return spotIndex[i].name;
        }
        return '';
    }

    function followUpAnswer(t) {
        if (!ctx.dest || !DESTS[ctx.dest]) return null;
        var d = ctx.dest;
        if (/门票|预约|买票|购票/.test(t)) {
            var s = firstSpotOf(d);
            var pr = findTicketPrice(d);
            return {
                text: '你问的是 <b>' + d + '</b>：' + DESTS[d][2] +
                    (pr ? '<span class="cs-line"></span>参考门票：<b>¥' + pr.price + '</b><span class="cs-note">（来自站内「' + esc(pr.activity) + '」，以景区当日票价为准）</span>' : '') +
                    '<span class="cs-line"></span>具体景点直接说名字，比如「' + (s || d) + '门票」，我给你查预约入口和购票方式。',
                chips: ['怎么预约门票', '转人工客服']
            };
        }
        if (/(住|酒店|民宿)/.test(t)) {
            return {
                text: '去 <b>' + d + '</b> 住宿：建议住地铁沿线或古城/景区周边 2-3 站的位置，比景区门口便宜一半，出行也方便。' +
                    '<span class="cs-line"></span>选酒店看三点：近 3 个月评价、是否含早、能否免费取消。',
                chips: ['帮我规划行程', '预算 5000 怎么玩']
            };
        }
        if (/(怎么去|交通|高铁|飞机|自驾|包车)/.test(t)) {
            return {
                text: '去 <b>' + d + '</b> 的交通：能高铁就优先高铁，3 小时内比飞机省心；' +
                    '到当地后地铁/网约车为主。如果走环线，建议包车或拼车，山路和高海拔路段别夜间自驾。',
                chips: ['帮我规划行程', '转人工客服']
            };
        }
        if (/(几天|玩几天|安排|行程|怎么玩)/.test(t)) return destAnswer(d);
        return null;
    }

    function refundAnswer() {
        for (var i = 0; i < INTENTS.length; i++) {
            if (INTENTS[i].k[0] === '退') return { text: INTENTS[i].a(), chips: INTENTS[i].c };
        }
        return null;
    }

    function ticketIntentAnswer() {
        for (var i = 0; i < INTENTS.length; i++) {
            if (INTENTS[i].k[0] === '门票') return { text: INTENTS[i].a(), chips: INTENTS[i].c };
        }
        return null;
    }

    function reply(text) {
        var t = String(text || '').trim();

        if (/常见问题|faq|帮助|能做什么|会什么/i.test(t)) return faqAnswer();

        /* ===== 1. 交通关键词优先 ===== */
        if (TRANSPORT_KW.test(t)) {
            var route = parseRoute(t);
            if (route) {
                var isFlight = /航班|机票|飞机|飞|航空/.test(t);
                var kind = /高铁|动车|火车|列车/.test(t) ? 'train' : (isFlight ? 'flight' : 'flight');
                return transportAnswer(route, kind);
            }
        }

        /* ===== 2. X日游 → 直接出每日行程 ===== */
        var dayMatch = t.match(/(\d+)\s*(天|日)\s*游/);
        var days = dayMatch ? parseInt(dayMatch[1], 10) : null;
        if (days && days >= 1 && days <= 30) {
            var city = null;
            for (var cn in CITY_KEY) {
                if (t.indexOf(cn) >= 0) { city = cn; break; }
            }
            if (!city) city = matchDest(t);
            if (city) { ctx.dest = city; return itineraryAnswer(city, days); }
        } else if (ITINERARY_KW.test(t)) {
            var city2 = matchDest(t);
            if (city2) {
                ctx.dest = city2;
                var suggest = DESTS[city2] ? parseInt(DESTS[city2][0], 10) || 3 : 3;
                return itineraryAnswer(city2, suggest);
            }
        }

        /* ===== 3. 退票退款 ===== */
        var refund = /退票|退款|退改|能退|改期|改签|取消/.test(t);
        if (refund) {
            var rr = refundAnswer();
            if (rr) return rr;
        }

        /* ===== 4. 景点查询 ===== */
        var spot = findSpot(t);
        if (spot) return spotAnswer(spot);

        /* ===== 5. 目的地名称 ===== */
        var dest = matchDest(t);
        if (dest) { ctx.dest = dest; return destAnswer(dest); }

        /* ===== 6. 上下文追问 ===== */
        var fu = followUpAnswer(t);
        if (fu) return fu;

        /* ===== 7. 意图匹配 ===== */
        if (/门票|预约|购票|买票|抢票/.test(t)) {
            var ti = ticketIntentAnswer();
            if (ti) return ti;
        }

        for (var i = 0; i < INTENTS.length; i++) {
            var it = INTENTS[i];
            for (var j = 0; j < it.k.length; j++) {
                if (t.toLowerCase().indexOf(it.k[j].toLowerCase()) >= 0) {
                    return { text: it.a(), chips: it.c };
                }
            }
        }

        return {
            text: '这个问题我先记下来，你可以这样问我会更准：<span class="cs-line"></span>' +
                '· 「故宫怎么预约」· 「黄山门票多少」· 「南京 3 日游怎么安排」<span class="cs-line"></span>' +
                '· 「北京到长沙的高铁」· 「伦敦到长沙的航班」· 「转人工客服」' +
                '<div class="cs-card"><h5>也可以直接转人工</h5>邮箱 <b>2377411629@qq.com</b> ｜ 电话 <b>17708491297</b>，7×24 值守</div>',
            chips: CHIPS_DEFAULT
        };
    }

    /* ---------- 发送 ---------- */
    function send(text) {
        text = String(text || '').trim();
        if (!text) return;
        history.push({ from: 'me', text: text, t: nowTime() });
        appendMsg({ from: 'me', text: text, t: nowTime() }, true);
        save();
        input.value = '';
        toggleSend();

        typing();
        var r = reply(text);
        var plain = String(r.text).replace(/<[^>]+>/g, '');
        var delay = 480 + Math.min(700, plain.length * 4);
        setTimeout(function () {
            stopTyping();
            botSay(r);
        }, delay);
    }

    function toggleSend() {
        if (sendBtn && input) sendBtn.disabled = !input.value.trim();
    }

    /* ---------- 角标 ---------- */
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

    /* ---------- 打开/关闭/重启 ---------- */
    function openChat() {
        if (!page) return;
        page.classList.add('open');
        page.setAttribute('aria-hidden', 'false');
        document.body.classList.add('cs-lock');
        clearBadge();
        closeMore();
        if (!greeted) {
            greeted = true;
            setTimeout(function () {
                botSay({ text: welcomeText(), chips: CHIPS_DEFAULT });
            }, 260);
        } else {
            setTimeout(function () { scrollBottom(true); }, 60);
        }
        setTimeout(function () { if (input) input.focus(); }, 420);
        if (tip) tip.classList.remove('show');
    }

    function closeChat() {
        if (!page) return;
        page.classList.remove('open');
        page.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('cs-lock');
        closeMore();
    }

    function restartChat() {
        history = [];
        greeted = true;
        ctx = { dest: null, spot: null };
        try { sessionStorage.removeItem(STORE_KEY); } catch (e) { }
        body.innerHTML = '';
        renderChips([]);
        closeMore();
        setTimeout(function () { botSay({ text: welcomeText(), chips: CHIPS_DEFAULT }); }, 120);
    }

    /* ---------- 更多菜单 ---------- */
    function closeMore() {
        var list = document.getElementById('csMoreList');
        if (list) list.classList.remove('open');
    }

    /* ---------- 工具：复制 / 反馈 ---------- */
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        ta.remove();
    }

    function handleBodyClick(e) {
        var target = e.target;
        if (!target || !target.closest) return;

        var sendEl = target.closest('[data-cs-send]');
        if (sendEl) {
            send(sendEl.getAttribute('data-cs-send'));
            return;
        }

        var copyEl = target.closest('[data-cs-copy]');
        if (copyEl) {
            var wrap = copyEl.closest('.cs-bubblewrap');
            var bubble = wrap && wrap.querySelector('.cs-bubble');
            if (bubble) {
                copyText(bubble.innerText || bubble.textContent || '');
                copyEl.innerHTML = '<i class="fas fa-check"></i>';
                copyEl.classList.add('on');
                setTimeout(function () {
                    copyEl.innerHTML = '<i class="fas fa-copy"></i>';
                    copyEl.classList.remove('on');
                }, 1600);
            }
            return;
        }

        var fbEl = target.closest('[data-cs-fb]');
        if (fbEl) {
            var w = fbEl.closest('.cs-bubblewrap');
            if (!w || w.getAttribute('data-fb-done')) return;
            w.setAttribute('data-fb-done', '1');
            var kind = fbEl.getAttribute('data-cs-fb');
            Array.prototype.forEach.call(w.querySelectorAll('[data-cs-fb]'), function (b) { b.remove(); });
            var meta = w.querySelector('.cs-meta');
            if (meta) {
                var done = document.createElement('span');
                done.className = 'cs-fb-done';
                done.innerHTML = kind === 'up' ? '<i class="fas fa-check"></i> 谢谢反馈' : '<i class="fas fa-check"></i> 已记录';
                meta.appendChild(done);
            }
            if (kind === 'down') {
                setTimeout(function () {
                    botSay({
                        text: '抱歉没帮到你。可以补充一下具体城市/景点，或者直接转人工，我们会尽快跟进。',
                        chips: ['转人工客服', '常见问题']
                    });
                }, 260);
            }
        }
    }

    /* ---------- 初始化 ---------- */
    function init() {
        page = document.getElementById('csPage');
        body = document.getElementById('csBody');
        input = document.getElementById('csInput');
        chipsBar = document.getElementById('csChips');
        fab = document.getElementById('csFab');
        badge = document.getElementById('csBadge');
        tip = document.getElementById('csFabTip');
        toBottom = document.getElementById('csToBottom');
        sendBtn = document.getElementById('csSend');
        if (!page || !body) return;

        load();
        if (history.length) {
            history.forEach(function (m) { appendMsg(m); });
            greeted = history.some(function (m) { return m.from === 'bot'; });
            renderChips(CHIPS_DEFAULT);
        }

        if (fab) {
            fab.addEventListener('click', openChat);
            setTimeout(function () {
                if (tip && !page.classList.contains('open')) tip.classList.add('show');
                tipTimer = setTimeout(function () { if (tip) tip.classList.remove('show'); }, 6000);
            }, 2600);
        }

        var closer = document.getElementById('csClose');
        if (closer) closer.addEventListener('click', closeChat);
        page.addEventListener('click', function (e) { if (e.target === page) closeChat(); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && page.classList.contains('open')) closeChat();
        });

        if (sendBtn) sendBtn.addEventListener('click', function () { send(input.value); });
        if (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); }
            });
            input.addEventListener('input', toggleSend);
        }
        toggleSend();

        var human = document.getElementById('csHuman');
        if (human) human.addEventListener('click', function () { send('转人工客服'); });

        var moreBtn = document.getElementById('csMore');
        if (moreBtn) moreBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var list = document.getElementById('csMoreList');
            if (list) list.classList.toggle('open');
        });

        var moreList = document.getElementById('csMoreList');
        if (moreList) moreList.addEventListener('click', function (e) {
            var b = e.target.closest ? e.target.closest('[data-cs-act]') : null;
            if (!b) return;
            var act = b.getAttribute('data-cs-act');
            closeMore();
            if (act === 'faq') {
                botSay(faqAnswer());
            } else if (act === 'restart') {
                restartChat();
            }
        });

        document.addEventListener('click', function (e) {
            var wrap = document.querySelector('.cs-more-wrap');
            if (wrap && !wrap.contains(e.target)) closeMore();
        });

        if (toBottom) toBottom.addEventListener('click', function () { scrollBottom(true); });
        body.addEventListener('scroll', updateToBottom);
        page.addEventListener('click', handleBodyClick);

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
