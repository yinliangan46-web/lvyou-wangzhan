// ========== 工具函数 ==========
// 节流函数 - 限制高频事件触发频率
function throttle(fn, delay = 16) {
    let lastCall = 0;
    let lastResult;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            lastResult = fn.apply(this, args);
        }
        return lastResult;
    };
}

// 缓动函数 - 让数字动画更平滑
function easeOutQuad(t) {
    return t * (2 - t);
}

// 计算滚动条宽度 - 防止弹窗打开时页面跳动
function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

// Toast 提示 - 替代原生 alert
function showToast(message, duration = 2500) {
    let toast = document.getElementById('appToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'appToast';
        Object.assign(toast.style, {
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%) translateY(-20px)',
            background: '#0f172a',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '50px',
            fontSize: '0.95rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s, transform 0.3s',
            pointerEvents: 'none',
            maxWidth: '90vw',
            textAlign: 'center'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
    }, duration);
}

// ========== 导航栏滚动效果（合并为单一节流监听器）==========
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#nav a');

const handleScroll = throttle(() => {
    const scrollY = window.scrollY;

    // 导航栏和回到顶部
    if (scrollY > 80) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    if (scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    // 导航高亮
    const offset = scrollY + 120;
    let currentId = '';
    sections.forEach(section => {
        if (offset >= section.offsetTop && offset < section.offsetTop + section.offsetHeight) {
            currentId = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
}, 16);

window.addEventListener('scroll', handleScroll, { passive: true });

// 回到顶部
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== 移动端菜单 ==========
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const overlay = document.getElementById('overlay');

function toggleMenu() {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
    if (nav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
    } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }
}

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
navLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
});

// ========== 计数动画（平滑缓动）==========
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuad(progress);
            const current = Math.round(target * eased);
            counter.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    });
}

// ========== Intersection Observer（卡片入场动画）==========
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

// 目的地卡片
const destObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            destObserver.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.dest-card').forEach(card => destObserver.observe(card));

// 统计数字
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
}

// 特色卡片
const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            featureObserver.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    featureObserver.observe(card);
});

// 套餐卡片
const tourObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = entry.target.classList.contains('featured')
                ? 'scale(1.05)'
                : 'translateY(0)';
            tourObserver.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.tour-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    tourObserver.observe(card);
});

// ========== 搜索功能 ==========
function handleSearch() {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim().toLowerCase();

    if (!keyword) return;

    const destMap = {
        '巴黎': 'paris', '法国': 'paris', 'paris': 'paris',
        '东京': 'tokyo', '日本': 'tokyo', 'tokyo': 'tokyo',
        '巴厘岛': 'bali', '印尼': 'bali', 'bali': 'bali',
        '迪拜': 'dubai', '阿联酋': 'dubai', 'dubai': 'dubai',
        '曼谷': 'bangkok', '泰国': 'bangkok', 'bangkok': 'bangkok',
        '伦敦': 'london', '英国': 'london', 'london': 'london',
        '北京': 'beijing', '首都': 'beijing',
        '上海': 'shanghai', '魔都': 'shanghai',
        '广州': 'guangzhou', '深圳': 'shenzhen',
        '成都': 'chengdu', '四川': 'chengdu',
        '杭州': 'hangzhou', '浙江': 'hangzhou',
        '西安': 'xian', '陕西': 'xian',
        '重庆': 'chongqing',
        '武汉': 'wuhan', '湖北': 'wuhan',
        '长沙': 'changsha', '湖南': 'changsha',
        '南京': 'nanjing', '江苏': 'nanjing',
        '沈阳': 'shenyang', '辽宁': 'shenyang',
        '哈尔滨': 'harbin', '黑龙江': 'harbin',
        '昆明': 'kunming', '云南': 'kunming',
        '合肥': 'hefei', '安徽': 'hefei',
        '福州': 'fuzhou', '福建': 'fuzhou',
        '南昌': 'nanchang', '江西': 'nanchang',
        '郑州': 'zhengzhou', '河南': 'zhengzhou',
        '济南': 'jinan', '山东': 'jinan',
        '石家庄': 'shijiazhuang', '河北': 'shijiazhuang',
        '太原': 'taiyuan', '山西': 'taiyuan',
        '呼和浩特': 'huhehaote', '内蒙古': 'huhehaote',
        '长春': 'changchun', '吉林': 'changchun',
        '南宁': 'nanning', '广西': 'nanning',
        '海口': 'haikou', '海南': 'haikou',
        '贵阳': 'guiyang', '贵州': 'guiyang',
        '拉萨': 'lasa', '西藏': 'lasa',
        '兰州': 'lanzhou', '甘肃': 'lanzhou',
        '西宁': 'xining', '青海': 'xining',
        '银川': 'yinchuan', '宁夏': 'yinchuan',
        '乌鲁木齐': 'urumqi', '新疆': 'urumqi',
        '桂林': 'guilin', '阳朔': 'guilin',
        '大理': 'dali',
        '苏州': 'suzhou', '园林': 'suzhou',
        '青岛': 'qingdao',
        '厦门': 'xiamen', '鼓浪屿': 'xiamen',
        '丽江': 'lijiang',
        '张家界': 'zhangjiajie',
        '黄山': 'huangshan',
        '九寨沟': 'jiuzhaigou',
        '敦煌': 'dunhuang', '莫高窟': 'dunhuang',
        '三亚': 'sanya',
        '西双版纳': 'xishuangbanna', '版纳': 'xishuangbanna',
        '黄果树': 'huangguoshu',
        '乐山': 'leshan', '大佛': 'leshan',
        // 省份（__ 前缀，搜索时特殊处理）
        '江苏': '__jiangsu', '江苏省': '__jiangsu',
        '安徽': '__anhui', '安徽省': '__anhui',
        '浙江': '__zhejiang', '浙江省': '__zhejiang',
        '湖南': '__hunan', '湖南省': '__hunan',
        '四川': '__sichuan', '四川省': '__sichuan',
        // 新城市
        '无锡': 'wuxi', '扬州': 'yangzhou', '镇江': 'zhenjiang', '徐州': 'xuzhou',
        '芜湖': 'wuhu', '池州': 'chizhou',
        '宁波': 'ningbo', '绍兴': 'shaoxing', '温州': 'wenzhou', '嘉兴': 'jiaxing',
        '凤凰': 'fenghuang', '岳阳': 'yueyang', '衡阳': 'hengyang',
        '都江堰': 'dujiangyan', '峨眉山': 'emeishan',
    };

    // 检查省份（__ 前缀）
    for (const [key, value] of Object.entries(destMap)) {
        if (value.startsWith('__') && (key.includes(keyword) || keyword.includes(key))) {
            openProvinceModal(value.slice(2));
            input.value = '';
            return;
        }
    }

    // 检查省份（__prov__ 前缀）
    for (const [key, value] of Object.entries(destMap)) {
        if (value.startsWith('__prov__') && (key.includes(keyword) || keyword.includes(key))) {
            openProvinceModal(value.slice(8));
            input.value = '';
            return;
        }
    }

    // 检查是否匹配目的地（城市/套餐）
    for (const [key, value] of Object.entries(destMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            // 优先用动态生成器
            if (window.PROVINCES_ALL && window.ALL_CITY_COORDS && window.ALL_CITY_COORDS[value]) {
                // 找到这个城市属于哪个省
                let provName = '';
                for (const p of window.PROVINCES_ALL) {
                    if (p.cities.some(c => c.key === value)) { provName = p.name; break; }
                }
                openProvinceCityModal(value, key, provName);
            } else if (window.destinationData && window.destinationData[value]) {
                openModal(value);
            } else {
                openModal(value);
            }
            input.value = '';
            return;
        }
    }

    // 检查套餐
    const tourMap = {
        '海岛': 'island', '海滩': 'island', '度假': 'island',
        '文化': 'culture', '历史': 'culture', '古迹': 'culture',
        '城市': 'city', '都市': 'city', '漫游': 'city',
        '南京': 'nanjing_tour', '六安': 'luan_tour', '大别山': 'luan_tour',
    };

    for (const [key, value] of Object.entries(tourMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            openTourModal(value);
            input.value = '';
            return;
        }
    }

    showToast('未找到相关内容，试试搜索：巴黎、东京、北京、上海 等');
}

// 回车搜索
document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// ========== 目的地弹窗 ==========
const destModal = document.getElementById('destModal');
const modalBody = document.getElementById('modalBody');

const destinationData = {
    paris: {
        name: '巴黎',
        country: '法国',
        tag: '浪漫之都',
        rating: 4.8,
        days: '7天6晚',
        price: '¥5,299',
        img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        description: '巴黎，法兰西的心脏与灵魂，一个梦幻般的光之城。从埃菲尔铁塔的璀璨灯光到塞纳河畔的悠闲漫步，从卢浮宫的千古珍品到蒙马特的艺术气息，每一处都散发着独特的浪漫魅力。',
        itinerary: [
            { day: 'Day 1', title: '抵达巴黎', desc: '抵达巴黎戴高乐机场，专车接机入住酒店。傍晚漫步香榭丽舍大街，感受巴黎的浪漫气息。' },
            { day: 'Day 2', title: '卢浮宫 & 塞纳河游船', desc: '上午参观世界最大博物馆卢浮宫，欣赏蒙娜丽莎、维纳斯等艺术珍品。下午乘坐塞纳河游船，欣赏两岸风光。' },
            { day: 'Day 3', title: '埃菲尔铁塔 & 战神广场', desc: '全天游览埃菲尔铁塔（登顶），在战神广场野餐。下午参观巴黎圣母院。' },
            { day: 'Day 4', title: '凡尔赛宫一日游', desc: '前往巴黎郊区的凡尔赛宫，参观镜厅、皇家花园，感受法国王室的奢华生活。' },
            { day: 'Day 5', title: '蒙马特 & 圣心堂', desc: '游览蒙马特高地，参观圣心大教堂，在画家广场感受艺术氛围。' },
            { day: 'Day 6', title: '购物 & 美食体验', desc: '游览老佛爷百货，品尝正宗法式大餐和甜品。' },
            { day: 'Day 7', title: '返程', desc: '自由活动，根据航班时间送机，结束浪漫巴黎之旅。' },
        ],
        includes: ['往返机票', '四星级酒店住宿', '中文导游', '行程内门票', '机场接送', '旅行保险']
    },
    tokyo: {
        name: '东京',
        country: '日本',
        tag: '传统与现代的融合',
        rating: 4.9,
        days: '6天5晚',
        price: '¥2,799',
        img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
        description: '东京，一座传统与未来完美交织的城市。古老的神社与摩天大楼并存，精致的怀石料理与街头小吃同样令人着迷。秋叶原的动漫文化、涩谷的繁华十字路口、浅草寺的千年古韵，构成了这座城市的多元魅力。',
        itinerary: [
            { day: 'Day 1', title: '抵达东京', desc: '抵达成田/羽田机场，入住酒店。晚上游览新宿歌舞伎町。' },
            { day: 'Day 2', title: '浅草 & 秋叶原', desc: '上午游览浅草寺、仲见世商店街。下午前往秋叶原，体验动漫电竞文化。' },
            { day: 'Day 3', title: '富士山一日游', desc: '前往富士山五合目，游览忍野八海、河口湖，享受温泉体验。' },
            { day: 'Day 4', title: '迪士尼乐园', desc: '全天畅游东京迪士尼乐园或迪士尼海洋。' },
            { day: 'Day 5', title: '涩谷 & 银座购物', desc: '游览涩谷十字路口、忠犬八公像，下午在银座购物。' },
            { day: 'Day 6', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        includes: ['往返机票', '温泉酒店体验', '中文导游', '景点门票', '特色美食套餐', '旅行保险']
    },
    bali: {
        name: '巴厘岛',
        country: '印尼',
        tag: '天堂之岛',
        rating: 4.7,
        days: '5天4晚',
        price: '¥2,799',
        img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        description: '巴厘岛，被誉为"众神之岛"，是一个充满神秘与浪漫的热带天堂。金色沙滩、碧蓝海水、古老寺庙与梯田风光交相辉映，是度假蜜月的绝佳选择。',
        itinerary: [
            { day: 'Day 1', title: '抵达巴厘岛', desc: '抵达努拉莱伊机场，入住海边度假村，享受悠闲傍晚。' },
            { day: 'Day 2', title: '情人崖 & 金巴兰海滩', desc: '上午游览情人崖（乌鲁瓦图），下午在金巴兰海滩享受阳光，傍晚享用海鲜烧烤。' },
            { day: 'Day 3', title: '乌布皇宫 & 梯田', desc: '前往乌布，参观皇宫、圣猴森林，在德格拉朗梯田拍照。' },
            { day: 'Day 4', title: '蓝梦岛一日游', desc: '乘船前往蓝梦岛，浮潜、潜水，欣赏魔鬼鱼和珊瑚礁。' },
            { day: 'Day 5', title: '海神庙 & 返程', desc: '上午游览海神庙，之后前往机场返程。' },
        ],
        includes: ['往返机票', '海边度假村', '中文导游', '浮潜装备', '蜜月布置', '旅行保险']
    },
    dubai: {
        name: '迪拜',
        country: '阿联酋',
        tag: '奢华奇迹之城',
        rating: 4.7,
        days: '6天5晚',
        price: '¥5,299',
        img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
        description: '迪拜，沙漠中崛起的奇迹之城。世界最高的哈利法塔、奢华的人工岛、顶级购物中心和无尽的沙漠风光，共同打造了这座奢华的未来之都。',
        itinerary: [
            { day: 'Day 1', title: '抵达迪拜', desc: '抵达迪拜国际机场，入住酒店，欣赏哈利法塔夜景。' },
            { day: 'Day 2', title: '哈利法塔 & Dubai Mall', desc: '登顶哈利法塔观景台，下午在世界上最大的购物中心Dubai Mall购物。' },
            { day: 'Day 3', title: '沙漠冲沙', desc: '下午出发沙漠冲沙体验，骑骆驼，欣赏沙漠日落，享用阿拉伯烧烤晚餐。' },
            { day: 'Day 4', title: '棕榈岛 & 亚特兰蒂斯', desc: '游览朱美拉棕榈岛，参观亚特兰蒂斯酒店，体验水上乐园。' },
            { day: 'Day 5', title: '老城区 & 黄金市场', desc: '游览迪拜老城区、黄金市场、香料市场，感受阿拉伯传统文化。' },
            { day: 'Day 6', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        includes: ['往返机票', '五星级酒店', '中文导游', '沙漠冲沙', '景点门票', '旅行保险']
    },
    bangkok: {
        name: '曼谷',
        country: '泰国',
        tag: '微笑之都',
        rating: 4.6,
        days: '5天4晚',
        price: '¥1,499',
        img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
        description: '曼谷，天使之城，东南亚最受欢迎的旅游目的地之一。金碧辉煌的皇宫寺庙、热闹非凡的水上市场、令人垂涎的街头美食，处处充满了微笑与活力。',
        itinerary: [
            { day: 'Day 1', title: '抵达曼谷', desc: '抵达素万那普机场，入住酒店，晚上游览考山路夜市。' },
            { day: 'Day 2', title: '大皇宫 & 玉佛寺', desc: '上午参观大皇宫、玉佛寺，下午游览卧佛寺、郑王庙。' },
            { day: 'Day 3', title: '水上市场 & 火车夜市', desc: '上午前往丹嫩沙多水上市场，下午游览火车头夜市。' },
            { day: 'Day 4', title: '购物 & 泰式按摩', desc: '在暹罗商圈购物，享受正宗泰式按摩，晚上观赏人妖秀。' },
            { day: 'Day 5', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        includes: ['往返机票', '四星级酒店', '中文导游', '景点门票', '泰式按摩体验', '旅行保险']
    },
    london: {
        name: '伦敦',
        country: '英国',
        tag: '英伦风情',
        rating: 4.8,
        days: '8天7晚',
        price: '¥7,999',
        img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
        description: '伦敦，一座充满历史与现代交融魅力的世界之都。大本钟的钟声、泰晤士河的波光、大英博物馆的千年珍藏、西区的音乐剧，处处展现着这座城市的独特魅力。',
        itinerary: [
            { day: 'Day 1', title: '抵达伦敦', desc: '抵达希思罗机场，入住酒店。傍晚游览泰晤士河畔。' },
            { day: 'Day 2', title: '大本钟 & 伦敦眼', desc: '游览大本钟、国会大厦、威斯敏斯特教堂，乘坐伦敦眼俯瞰全城。' },
            { day: 'Day 3', title: '大英博物馆', desc: '全天参观大英博物馆，欣赏罗塞塔石碑、埃及木乃伊等珍贵文物。' },
            { day: 'Day 4', title: '白金汉宫 & 海德公园', desc: '观看皇家卫兵换岗仪式，游览白金汉宫、海德公园。' },
            { day: 'Day 5', title: '伦敦塔 & 塔桥', desc: '参观伦敦塔、塔桥，下午在博罗市场品尝美食。' },
            { day: 'Day 6', title: '剑桥一日游', desc: '前往剑桥大学，游览国王学院、数学桥，体验康河撑船。' },
            { day: 'Day 7', title: '购物 & 西区音乐剧', desc: '在牛津街、摄政街购物，晚上欣赏西区音乐剧。' },
            { day: 'Day 8', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        includes: ['往返机票', '四星级酒店', '中文导游', '景点门票', '伦敦眼体验', '旅行保险']
    },
    // ==== 中国省会/直辖市 ====
    beijing: {name:'北京',country:'北京',tag:'千年古都',rating:4.9,days:'5天4晚',price:'¥2,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg/960px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg',description:'北京，中华人民共和国的首都，一座拥有三千年历史的文化古都。故宫的红墙黄瓦、长城的雄伟壮观、颐和园的皇家园林、胡同里的老北京生活，处处展现着这座城市的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达北京',desc:'接机入住，傍晚游览王府井大街。'},{day:'Day 2',title:'天安门 & 故宫',desc:'上午参观天安门广场、故宫博物院，下午游览景山公园俯瞰故宫全景。'},{day:'Day 3',title:'八达岭长城',desc:'全天游览八达岭长城，感受"不到长城非好汉"的豪情。'},{day:'Day 4',title:'颐和园 & 天坛',desc:'游览颐和园、天坛公园，晚上品尝北京烤鸭。'},{day:'Day 5',title:'返程',desc:'自由活动，根据航班/高铁时间送站。'}],includes:['往返交通','四星级酒店','中文导游','景点门票','烤鸭体验','旅行保险']},
    shanghai: {name:'上海',country:'上海',tag:'魔都风情',rating:4.8,days:'4天3晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg/960px-Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg',description:'上海，中国的经济中心，一座传统与现代完美融合的国际大都市。外滩的万国建筑群、陆家嘴的摩天大楼、豫园的江南园林、弄堂里的市井烟火，共同演绎着"魔都"的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达上海',desc:'接机入住，晚上游览外滩、欣赏陆家嘴夜景。'},{day:'Day 2',title:'迪士尼乐园',desc:'全天畅游上海迪士尼乐园。'},{day:'Day 3',title:'豫园 & 新天地',desc:'游览豫园、城隍庙，下午逛新天地、南京路步行街。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','迪士尼门票','中文导游','旅行保险']},
    guangzhou: {name:'广州',country:'广东',tag:'食在广州',rating:4.7,days:'4天3晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Canton_Tower_20241027.jpg/960px-Canton_Tower_20241027.jpg',description:'广州，一座有着两千多年历史的文化名城，也是中国南方的美食之都。从早茶到宵夜，从广州塔到沙面，从陈家祠到白云山，美食与美景完美融合。',itinerary:[
        {day:'Day 1',title:'抵达广州',desc:'接机入住，晚上品尝正宗粤式晚茶。'},{day:'Day 2',title:'广州塔 & 沙面',desc:'登广州塔俯瞰全城，游览沙面欧陆风情建筑群。'},{day:'Day 3',title:'陈家祠 & 上下九',desc:'参观陈家祠，在上下九步行街品尝地道美食。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','粤式美食体验','景点门票','旅行保险']},
    shenzhen: {name:'深圳',country:'广东',tag:'创新之都',rating:4.6,days:'4天3晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Commercial_area_of_futian_to_east2020.jpg/960px-Commercial_area_of_futian_to_east2020.jpg',description:'深圳，中国改革开放的窗口，从一个小渔村蜕变为国际化创新大都市。世界之窗、华侨城、大梅沙海滨公园，展现着这座年轻城市的活力与魅力。',itinerary:[
        {day:'Day 1',title:'抵达深圳',desc:'接机入住，晚上游览深圳湾公园。'},{day:'Day 2',title:'世界之窗 & 欢乐谷',desc:'游览世界之窗，下午在欢乐谷体验刺激游乐项目。'},{day:'Day 3',title:'大梅沙 & 中英街',desc:'在大梅沙海滨公园享受阳光沙滩，下午游览中英街。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','旅行保险']},
    chengdu: {name:'成都',country:'四川',tag:'天府之国',rating:4.9,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg/960px-%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg',description:'成都，一座来了就不想走的城市。大熊猫的故乡，美食的天堂。宽窄巷子的悠闲、锦里的繁华、都江堰的千年水利工程，处处散发着"天府之国"的魅力。',itinerary:[
        {day:'Day 1',title:'抵达成都',desc:'接机入住，晚上逛锦里古街、品尝火锅。'},{day:'Day 2',title:'大熊猫基地',desc:'上午参观大熊猫繁育研究基地，下午游览宽窄巷子。'},{day:'Day 3',title:'都江堰 & 青城山',desc:'游览都江堰水利工程，登青城山感受道教文化。'},{day:'Day 4',title:'乐山大佛',desc:'前往乐山参观世界最大石刻坐佛——乐山大佛。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','火锅体验','景点门票','大熊猫基地','旅行保险']},
    hangzhou: {name:'杭州',country:'浙江',tag:'人间天堂',rating:4.8,days:'4天3晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg/960px-%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg',description:'杭州，"上有天堂，下有苏杭"。西湖的断桥残雪、雷峰夕照，灵隐寺的钟声，龙井茶的清香，让这座城市充满了诗意与浪漫。',itinerary:[
        {day:'Day 1',title:'抵达杭州',desc:'接站入住，傍晚漫步西湖断桥。'},{day:'Day 2',title:'西湖全景',desc:'乘船游西湖，登雷峰塔，参观岳王庙、苏堤春晓。'},{day:'Day 3',title:'灵隐寺 & 龙井村',desc:'游览灵隐寺，前往龙井村品茶、品尝杭帮菜。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','西湖游船','龙井茶体验','旅行保险']},
    xian: {name:'西安',country:'陕西',tag:'千年古都',rating:4.8,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg/960px-City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg',description:'西安，十三朝古都，中华文明的发源地之一。秦始皇兵马俑的震撼、古城墙的雄伟、大雁塔的庄严、回民街的美食，让你穿越千年感受历史的厚重。',itinerary:[
        {day:'Day 1',title:'抵达西安',desc:'接机入住，晚上游览钟楼、鼓楼广场。'},{day:'Day 2',title:'兵马俑 & 华清宫',desc:'参观世界第八大奇迹秦始皇兵马俑，下午游览华清宫。'},{day:'Day 3',title:'古城墙 & 大雁塔',desc:'骑行西安古城墙，参观大慈恩寺和大雁塔。'},{day:'Day 4',title:'陕西历史博物馆',desc:'参观陕西历史博物馆，晚上在回民街品尝美食。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','景点门票','中文导游','回民街美食','旅行保险']},
    chongqing: {name:'重庆',country:'重庆',tag:'8D魔幻之城',rating:4.7,days:'4天3晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Chongqing_Nightscape.jpg/960px-Chongqing_Nightscape.jpg',description:'重庆，一座建在山上的城市，被称为"8D魔幻城市"。洪崖洞的吊脚楼、李子坝轻轨穿楼、长江索道、麻辣火锅，每一个元素都让人流连忘返。',itinerary:[
        {day:'Day 1',title:'抵达重庆',desc:'接机入住，晚上吃正宗重庆火锅。'},{day:'Day 2',title:'洪崖洞 & 解放碑',desc:'游览洪崖洞、解放碑步行街，乘坐长江索道。'},{day:'Day 3',title:'磁器口 & 李子坝',desc:'逛磁器口古镇，看李子坝轻轨穿楼奇观。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','重庆火锅体验','长江索道','旅行保险']},
    wuhan: {name:'武汉',country:'湖北',tag:'江城名片',rating:4.6,days:'4天3晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/%E6%AD%A6%E6%B1%89%E9%BB%84%E9%B9%A4%E6%A5%BC%E4%BF%AF%E7%9E%B0.jpg/960px-%E6%AD%A6%E6%B1%89%E9%BB%84%E9%B9%A4%E6%A5%BC%E4%BF%AF%E7%9E%B0.jpg',description:'武汉，长江与汉江的交汇处，"九省通衢"的枢纽城市。黄鹤楼的千年诗韵、武大樱花的浪漫、户部巷的美食、东湖的碧波，构成了这座江城的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达武汉',desc:'接站入住，晚上户部巷品尝武汉小吃。'},{day:'Day 2',title:'黄鹤楼 & 长江大桥',desc:'登黄鹤楼远眺长江，步行武汉长江大桥。'},{day:'Day 3',title:'武大 & 东湖',desc:'游览武汉大学，在东湖绿道骑行。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','武汉小吃体验','东湖骑行','旅行保险']},
    changsha: {name:'长沙',country:'湖南',tag:'娱乐之都',rating:4.6,days:'4天3晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/%E7%88%B1%E6%99%9A%E4%BA%AD%EF%BC%88%E7%A7%8B-%E4%BE%A7%E9%9D%A2%EF%BC%89.jpg/960px-%E7%88%B1%E6%99%9A%E4%BA%AD%EF%BC%88%E7%A7%8B-%E4%BE%A7%E9%9D%A2%EF%BC%89.jpg',description:'长沙，一座充满活力的娱乐之都。岳麓书院的书香、橘子洲头的伟人风采、太平街的美食、茶颜悦色的网红奶茶，让这座千年古城焕发着青春活力。',itinerary:[
        {day:'Day 1',title:'抵达长沙',desc:'接站入住，晚上逛太平街、品尝湘菜。'},{day:'Day 2',title:'岳麓山 & 橘子洲',desc:'游览岳麓书院、爱晚亭，下午瞻仰橘子洲青年毛泽东雕像。'},{day:'Day 3',title:'湖南省博 & 五一广场',desc:'参观湖南省博物馆看马王堆汉墓，逛五一商圈。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','湘菜体验','景点门票','旅行保险']},
    nanjing: {name:'南京',country:'江苏',tag:'六朝古都',rating:4.8,days:'4天3晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanjing_CBD_from_City_Wall.jpg/960px-Nanjing_CBD_from_City_Wall.jpg',description:'南京，六朝古都，十朝都会。中山陵的庄严肃穆、夫子庙的秦淮风情、明孝陵的皇家气派、南京博物院的文化珍藏，处处彰显着这座历史文化名城的深厚底蕴。',itinerary:[
        {day:'Day 1',title:'抵达南京',desc:'接站入住，晚上游览夫子庙、秦淮河畔。'},{day:'Day 2',title:'中山陵 & 明孝陵',desc:'游览中山陵、明孝陵，感受钟山风景区的壮美。'},{day:'Day 3',title:'南京博物院 & 总统府',desc:'参观南京博物院、总统府，下午逛老门东历史街区。'},{day:'Day 4',title:'返程',desc:'自由活动，前往高铁站/机场返程。'}],includes:['往返交通','四星级酒店','秦淮河游船','景点门票','旅行保险']},
    shenyang: {name:'沈阳',country:'辽宁',tag:'共和国长子',rating:4.5,days:'4天3晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/%E6%B2%88%E9%98%B3%E9%9D%92%E5%B9%B4%E5%85%AC%E5%9B%AD.jpg/960px-%E6%B2%88%E9%98%B3%E9%9D%92%E5%B9%B4%E5%85%AC%E5%9B%AD.jpg',description:'沈阳，辽宁省省会，"共和国长子"，东北地区的中心城市。沈阳故宫的皇家气派、张氏帅府的历史印记、中街的繁华热闹，展现着这座工业重镇的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达沈阳',desc:'接机入住，晚上逛中街步行街。'},{day:'Day 2',title:'沈阳故宫 & 张氏帅府',desc:'参观沈阳故宫、张氏帅府，感受历史风云。'},{day:'Day 3',title:'九一八博物馆 & 北陵',desc:'参观九一八历史博物馆，游览北陵公园。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','旅行保险']},
    harbin: {name:'哈尔滨',country:'黑龙江',tag:'冰城夏都',rating:4.5,days:'5天4晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/26935-Harbin_%2829661238117%29.jpg/960px-26935-Harbin_%2829661238117%29.jpg',description:'哈尔滨，被誉为"东方莫斯科"和"东方小巴黎"。中央大街的欧式建筑、索菲亚大教堂的穹顶、冰雪大世界的奇幻、松花江的壮阔，让你感受北国风光的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达哈尔滨',desc:'接机入住，晚上游览中央大街。'},{day:'Day 2',title:'索菲亚教堂 & 冰雪大世界',desc:'参观索菲亚大教堂，冬季前往冰雪大世界。'},{day:'Day 3',title:'太阳岛 & 东北虎林园',desc:'游览太阳岛风景区，参观东北虎林园。'},{day:'Day 4',title:'松花江 & 老道外',desc:'漫步松花江畔，探访老道外中华巴洛克建筑群。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','冰雪大世界门票','取暖装备','旅行保险']},
    kunming: {name:'昆明',country:'云南',tag:'春城花都',rating:4.7,days:'5天4晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/%E4%BA%94%E5%8D%8E%E5%8C%BA%E4%B8%8E%E7%9B%98%E9%BE%99%E5%8C%BA%E5%A4%A9%E9%99%85%E7%BA%BF_-_%E8%88%AA%E6%8B%8D_-_2025-05-16_03.jpg/960px-%E4%BA%94%E5%8D%8E%E5%8C%BA%E4%B8%8E%E7%9B%98%E9%BE%99%E5%8C%BA%E5%A4%A9%E9%99%85%E7%BA%BF_-_%E8%88%AA%E6%8B%8D_-_2025-05-16_03.jpg',description:'昆明，"春城"之名享誉全国，四季如春的气候让这座城市永远充满生机。石林的鬼斧神工、滇池的碧波万顷、云南民族村的多彩文化，是感受云南之美的绝佳起点。',itinerary:[
        {day:'Day 1',title:'抵达昆明',desc:'接机入住，晚上游览南屏步行街。'},{day:'Day 2',title:'石林一日游',desc:'前往石林风景区，欣赏喀斯特地貌奇观。'},{day:'Day 3',title:'滇池 & 西山',desc:'乘船游滇池，登西山龙门俯瞰昆明全景。'},{day:'Day 4',title:'云南民族村',desc:'游览云南民族村，体验25个少数民族的风情。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','少数民族表演','旅行保险']},
    hefei: {name:'合肥',country:'安徽',tag:'大湖名城',rating:4.5,days:'4天3晚',price:'¥1,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/%E5%A4%A9%E9%B9%85%E6%B9%96.jpg/960px-%E5%A4%A9%E9%B9%85%E6%B9%96.jpg',description:'合肥，安徽省省会，一座融合了历史与创新的城市。包公园的清正廉明、三河古镇的水乡风情、巢湖的烟波浩渺，展现着这座"大湖名城"的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达合肥',desc:'接站入住，晚上逛淮河路步行街。'},{day:'Day 2',title:'包公园 & 李鸿章故居',desc:'游览包公园、李鸿章故居，感受历史文化。'},{day:'Day 3',title:'三河古镇',desc:'前往三河古镇，体验徽派水乡风情。'},{day:'Day 4',title:'返程',desc:'自由活动，前往高铁站返程。'}],includes:['往返交通','四星级酒店','徽菜体验','旅行保险']},
    fuzhou: {name:'福州',country:'福建',tag:'榕城古韵',rating:4.5,days:'4天3晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Fuzhou_skyline_2.jpg/960px-Fuzhou_skyline_2.jpg',description:'福州，福建省省会，一座有着两千多年历史的文化名城。三坊七巷的明清建筑、鼓山的摩崖石刻、西湖公园的秀美风光，处处散发着"榕城"的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达福州',desc:'接站入住，晚上逛三坊七巷。'},{day:'Day 2',title:'三坊七巷 & 林则徐纪念馆',desc:'深度游览三坊七巷，参观林则徐纪念馆。'},{day:'Day 3',title:'鼓山 & 西湖',desc:'登鼓山观摩崖石刻，游览福州西湖公园。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','福州鱼丸体验','旅行保险']},
    nanchang: {name:'南昌',country:'江西',tag:'英雄之城',rating:4.4,days:'3天2晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanchang_Skyline.jpg/960px-Nanchang_Skyline.jpg',description:'南昌，江西省省会，"英雄城"的美誉源于八一起义。滕王阁的千古绝唱、八一起义纪念馆的红色记忆、鄱阳湖的候鸟天堂，让这座城市充满了历史与自然的双重魅力。',itinerary:[
        {day:'Day 1',title:'抵达南昌',desc:'接站入住，晚上游览滕王阁夜景。'},{day:'Day 2',title:'滕王阁 & 八一起义纪念馆',desc:'登滕王阁，参观八一起义纪念馆。'},{day:'Day 3',title:'返程',desc:'自由活动，前往高铁站返程。'}],includes:['往返交通','四星级酒店','景点门票','旅行保险']},
    zhengzhou: {name:'郑州',country:'河南',tag:'天地之中',rating:4.4,days:'4天3晚',price:'¥1,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Zhengzhou_CBDcity.jpg/960px-Zhengzhou_CBDcity.jpg',description:'郑州，河南省省会，地处中华腹地，"天地之中"。黄河风景区的壮阔、少林寺的禅武合一、河南博物院的文物珍藏，带你领略中原文化的博大精深。',itinerary:[
        {day:'Day 1',title:'抵达郑州',desc:'接站入住，晚上品尝河南烩面。'},{day:'Day 2',title:'少林寺一日游',desc:'前往少林寺，观看武术表演，游览塔林。'},{day:'Day 3',title:'河南博物院 & 黄河风景区',desc:'参观河南博物院，游览黄河风景名胜区。'},{day:'Day 4',title:'返程',desc:'自由活动，前往高铁站返程。'}],includes:['往返交通','四星级酒店','少林寺门票','河南美食体验','旅行保险']},
    jinan: {name:'济南',country:'山东',tag:'泉城风光',rating:4.5,days:'4天3晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Skyline_of_CBD%2C_Jinan%2C_China.jpg/960px-Skyline_of_CBD%2C_Jinan%2C_China.jpg',description:'济南，山东省省会，以"泉城"闻名天下。趵突泉的三股泉水、大明湖的荷风柳韵、千佛山的石刻造像、芙蓉街的美食飘香，构成了一幅"家家泉水，户户垂杨"的美景。',itinerary:[
        {day:'Day 1',title:'抵达济南',desc:'接站入住，晚上逛芙蓉街、品尝鲁菜。'},{day:'Day 2',title:'趵突泉 & 大明湖',desc:'游览趵突泉公园，乘船游大明湖。'},{day:'Day 3',title:'千佛山 & 泉城广场',desc:'登千佛山，游览泉城广场。'},{day:'Day 4',title:'返程',desc:'自由活动，前往高铁站返程。'}],includes:['往返交通','四星级酒店','鲁菜体验','景点门票','旅行保险']},
    shijiazhuang: {name:'石家庄',country:'河北',tag:'燕赵风骨',rating:4.3,days:'3天2晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zhuangli_Commercial_Street_5.jpg/960px-Zhuangli_Commercial_Street_5.jpg',description:'石家庄，河北省省会，一座充满活力的现代都市。西柏坡的红色记忆、正定古城的千年历史、赵州桥的建筑奇迹，让这座城市既有历史的厚重又有现代的繁华。',itinerary:[
        {day:'Day 1',title:'抵达石家庄',desc:'接站入住，晚上逛正定古城。'},{day:'Day 2',title:'西柏坡 & 赵州桥',desc:'前往西柏坡纪念馆，参观赵州桥。'},{day:'Day 3',title:'返程',desc:'自由活动，前往高铁站返程。'}],includes:['往返交通','三星级酒店','景点门票','旅行保险']},
    taiyuan: {name:'太原',country:'山西',tag:'晋商故里',rating:4.4,days:'4天3晚',price:'¥1,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Taiyuan_xiquinhosilva.jpg/960px-Taiyuan_xiquinhosilva.jpg',description:'太原，山西省省会，一座拥有两千五百多年建城史的文化古城。晋祠的千年古柏、天龙山的石窟造像、山西博物院的青铜珍藏，让人感受三晋大地的深厚文化底蕴。',itinerary:[
        {day:'Day 1',title:'抵达太原',desc:'接站入住，晚上品尝山西面食。'},{day:'Day 2',title:'晋祠 & 天龙山',desc:'游览晋祠，登天龙山参观石窟。'},{day:'Day 3',title:'山西博物院',desc:'参观山西博物院，欣赏青铜器珍藏。'},{day:'Day 4',title:'返程',desc:'自由活动，前往高铁站返程。'}],includes:['往返交通','四星级酒店','山西面食体验','景点门票','旅行保险']},
    huhehaote: {name:'呼和浩特',country:'内蒙古',tag:'草原青城',rating:4.4,days:'4天3晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hohhot_Central_Square.jpg/960px-Hohhot_Central_Square.jpg',description:'呼和浩特，内蒙古自治区首府，"青城"之意。广阔无垠的希拉穆仁草原、庄严的席力图召、热闹的塞上老街，让你感受草原文化与城市文明的完美融合。',itinerary:[
        {day:'Day 1',title:'抵达呼和浩特',desc:'接机入住，晚上逛塞上老街。'},{day:'Day 2',title:'希拉穆仁草原',desc:'前往希拉穆仁草原，体验骑马、住蒙古包。'},{day:'Day 3',title:'席力图召 & 博物馆',desc:'参观席力图召、内蒙古博物院。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店+蒙古包','草原骑马体验','旅行保险']},
    changchun: {name:'长春',country:'吉林',tag:'北国春城',rating:4.3,days:'4天3晚',price:'¥1,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/%E9%81%A5%E6%9C%9B%E5%8D%97%E6%B9%96%E5%8C%97%E5%B2%B8_nan_hu_-_panoramio.jpg/960px-%E9%81%A5%E6%9C%9B%E5%8D%97%E6%B9%96%E5%8C%97%E5%B2%B8_nan_hu_-_panoramio.jpg',description:'长春，吉林省省会，"北国春城"。伪满皇宫的历史印记、净月潭的国家森林公园、长影世纪城的电影文化，让这座城市充满了历史与自然的双重魅力。',itinerary:[
        {day:'Day 1',title:'抵达长春',desc:'接机入住，晚上逛重庆路步行街。'},{day:'Day 2',title:'伪满皇宫 & 净月潭',desc:'参观伪满皇宫博物院，下午游览净月潭。'},{day:'Day 3',title:'长影世纪城',desc:'全天畅游长影世纪城。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','旅行保险']},
    nanning: {name:'南宁',country:'广西',tag:'绿城南宁',rating:4.4,days:'4天3晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Skyline_of_China-ASEAN_Business_Center_in_Qingxiu_District.jpg/960px-Skyline_of_China-ASEAN_Business_Center_in_Qingxiu_District.jpg',description:'南宁，广西壮族自治区首府，被誉为"绿城"。青秀山的葱郁、南湖的宁静、中山路的美食、广西民族博物馆的多彩文化，展现着这座南国城市的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达南宁',desc:'接机入住，晚上逛中山路夜市。'},{day:'Day 2',title:'青秀山 & 南湖',desc:'游览青秀山风景区，漫步南湖公园。'},{day:'Day 3',title:'德天跨国瀑布',desc:'前往德天瀑布，感受中越边境的壮美风光。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','旅行保险']},
    haikou: {name:'海口',country:'海南',tag:'椰风海韵',rating:4.5,days:'5天4晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Haikou_montage_-_03.jpg/960px-Haikou_montage_-_03.jpg',description:'海口，海南省省会，一座充满热带风情的海滨城市。骑楼老街的南洋风情、假日海滩的阳光沙滩、火山口公园的地质奇观，让你感受椰风海韵的惬意生活。',itinerary:[
        {day:'Day 1',title:'抵达海口',desc:'接机入住，晚上逛骑楼老街。'},{day:'Day 2',title:'火山口 & 假日海滩',desc:'游览火山口地质公园，下午在假日海滩休闲。'},{day:'Day 3',title:'文昌卫星发射中心',desc:'前往文昌参观卫星发射中心，游览东郊椰林。'},{day:'Day 4',title:'自由活动',desc:'全天自由活动，享受海滨度假时光。'},{day:'Day 5',title:'返程',desc:'前往机场返程。'}],includes:['往返交通','四星级酒店','海鲜大餐','旅行保险']},
    guiyang: {name:'贵阳',country:'贵州',tag:'避暑之都',rating:4.5,days:'5天4晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Guizhou_Financial_City_District.jpg/960px-Guizhou_Financial_City_District.jpg',description:'贵阳，贵州省省会，"避暑之都"的美誉名副其实。黄果树瀑布的壮阔、荔波小七孔的秀美、黔灵山的灵秀、酸汤鱼的鲜美，让这座城市成为越来越受欢迎的旅游目的地。',itinerary:[
        {day:'Day 1',title:'抵达贵阳',desc:'接机入住，晚上品尝酸汤鱼。'},{day:'Day 2',title:'黄果树瀑布',desc:'前往黄果树瀑布景区，感受亚洲最大瀑布的震撼。'},{day:'Day 3',title:'荔波小七孔',desc:'游览荔波小七孔景区，欣赏喀斯特森林风光。'},{day:'Day 4',title:'黔灵山 & 甲秀楼',desc:'游览黔灵山公园、甲秀楼。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','贵州酸汤鱼体验','旅行保险']},
    lasa: {name:'拉萨',country:'西藏',tag:'日光之城',rating:4.9,days:'7天6晚',price:'¥2,799',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lhassa_Potala.jpg/960px-Lhassa_Potala.jpg',description:'拉萨，西藏自治区首府，"日光之城"。布达拉宫的雄伟壮丽、大昭寺的虔诚信仰、八廓街的转经人流、纳木错的圣湖碧水，让人心灵得到净化和升华。',itinerary:[
        {day:'Day 1',title:'抵达拉萨',desc:'抵达拉萨，适应高原环境，入住供氧酒店。'},{day:'Day 2',title:'布达拉宫 & 大昭寺',desc:'参观布达拉宫、大昭寺，在八廓街转经。'},{day:'Day 3',title:'纳木错',desc:'前往纳木错，欣赏西藏三大圣湖之一的壮美风光。'},{day:'Day 4',title:'羊卓雍措',desc:'游览羊卓雍措（羊湖），感受高原湖泊的纯净。'},{day:'Day 5',title:'色拉寺 & 哲蚌寺',desc:'参观色拉寺（看辨经）、哲蚌寺。'},{day:'Day 6',title:'自由活动',desc:'自由探索拉萨，购买纪念品。'},{day:'Day 7',title:'返程',desc:'前往机场返程。'}],includes:['往返机票','供氧酒店','高原旅游保险','专业导游','氧气瓶配备']},
    lanzhou: {name:'兰州',country:'甘肃',tag:'黄河之都',rating:4.4,days:'4天3晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Skyline_Lanzhou_August_2025.jpg/960px-Skyline_Lanzhou_August_2025.jpg',description:'兰州，甘肃省省会，黄河穿城而过的唯一省会城市。百年中山桥的铁骨铮铮、白塔山的俯瞰全城、正宁路夜市的烟火气息、一碗地道的兰州牛肉面，是这座西北之城的独特名片。',itinerary:[
        {day:'Day 1',title:'抵达兰州',desc:'接站入住，晚上吃正宗兰州牛肉面。'},{day:'Day 2',title:'中山桥 & 白塔山',desc:'游览中山桥、白塔山公园，乘坐黄河游船。'},{day:'Day 3',title:'甘肃省博物馆',desc:'参观甘肃省博物馆，欣赏马踏飞燕铜奔马。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','兰州牛肉面体验','黄河游船','旅行保险']},
    xining: {name:'西宁',country:'青海',tag:'夏都西宁',rating:4.4,days:'5天4晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Skyscrapers_in_Chengzhong_District%2C_Xining_%2853727167629%29_-_2024.jpg/960px-Skyscrapers_in_Chengzhong_District%2C_Xining_%2853727167629%29_-_2024.jpg',description:'西宁，青海省省会，被誉为"夏都"。青海湖的碧波万顷、塔尔寺的藏传佛教文化、茶卡盐湖的天空之镜，让这座城市成为青藏高原上一颗璀璨的明珠。',itinerary:[
        {day:'Day 1',title:'抵达西宁',desc:'接机入住，适应高原环境。'},{day:'Day 2',title:'塔尔寺',desc:'参观塔尔寺，欣赏酥油花、壁画和堆绣。'},{day:'Day 3',title:'青海湖',desc:'前往青海湖，环湖游览，欣赏油菜花海。'},{day:'Day 4',title:'茶卡盐湖',desc:'游览茶卡盐湖，体验"天空之镜"的奇幻。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','高原旅行保险']},
    yinchuan: {name:'银川',country:'宁夏',tag:'塞上江南',rating:4.3,days:'4天3晚',price:'¥1,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Skyline_of_Jinfeng_District%2C_Yinchuan_%2853724463112%29.jpg/960px-Skyline_of_Jinfeng_District%2C_Yinchuan_%2853724463112%29.jpg',description:'银川，宁夏回族自治区首府，"塞上江南"的美称。西夏王陵的千年神秘、沙湖的沙漠与湖泊共生、镇北堡西部影城的电影情怀，让人感受到西北大地的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达银川',desc:'接机入住，晚上逛怀远夜市。'},{day:'Day 2',title:'西夏王陵 & 镇北堡',desc:'参观西夏王陵，游览镇北堡西部影城。'},{day:'Day 3',title:'沙湖',desc:'游览沙湖风景区，体验沙漠与湖泊的双重风光。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返交通','四星级酒店','景点门票','旅行保险']},
    urumqi: {name:'乌鲁木齐',country:'新疆',tag:'亚心之都',rating:4.5,days:'6天5晚',price:'¥2,799',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Urumqi_Skyline_July_2019.jpg/960px-Urumqi_Skyline_July_2019.jpg',description:'乌鲁木齐，新疆维吾尔自治区首府，亚洲大陆的地理中心。天山天池的雪山倒影、大巴扎的异域风情、南山牧场的辽阔草原，让你感受多元文化交融的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达乌鲁木齐',desc:'接机入住，晚上逛国际大巴扎。'},{day:'Day 2',title:'天山天池',desc:'前往天山天池，欣赏博格达峰雪山倒影。'},{day:'Day 3',title:'吐鲁番火焰山',desc:'前往吐鲁番，游览火焰山、坎儿井、葡萄沟。'},{day:'Day 4',title:'南山牧场',desc:'前往南山牧场，体验草原骑马。'},{day:'Day 5',title:'新疆博物馆',desc:'参观新疆博物馆，了解丝绸之路历史。'},{day:'Day 6',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','景点门票','新疆美食体验','旅行保险']},
    // 额外城市
    guilin: {name:'桂林',country:'广西',tag:'山水甲天下',rating:4.8,days:'5天4晚',price:'¥1,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Xiangshan_Scenic_Area_89468-Guilin_%2831130832628%29.jpg/960px-Xiangshan_Scenic_Area_89468-Guilin_%2831130832628%29.jpg',description:'桂林，"桂林山水甲天下"名扬四海。漓江的百里画廊、阳朔的十里画廊、龙脊梯田的壮美、象鼻山的奇特，构成了一幅流动的山水画卷。',itinerary:[
        {day:'Day 1',title:'抵达桂林',desc:'接站入住，晚上游览两江四湖夜景。'},{day:'Day 2',title:'漓江游船 & 阳朔',desc:'乘船游览漓江精华段，抵达阳朔逛西街。'},{day:'Day 3',title:'阳朔十里画廊',desc:'骑行十里画廊，游览遇龙河、大榕树。'},{day:'Day 4',title:'龙脊梯田',desc:'前往龙脊梯田，欣赏壮美梯田风光。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','四星级酒店','漓江游船','景点门票','旅行保险']},
    dali: {name:'大理',country:'云南',tag:'风花雪月',rating:4.7,days:'4天3晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chongsheng_Temple_%2811050634113%29.jpg/960px-Chongsheng_Temple_%2811050634113%29.jpg',description:'大理，"风花雪月"的浪漫之地。洱海的碧波、苍山的雪顶、大理古城的悠然、崇圣寺三塔的庄严，让这座古城成为无数人心中的诗和远方。',itinerary:[
        {day:'Day 1',title:'抵达大理',desc:'抵达大理，入住古城客栈，享受悠闲午后。'},{day:'Day 2',title:'洱海环湖',desc:'环洱海骑行或自驾，打卡双廊、喜洲古镇。'},{day:'Day 3',title:'大理古城 & 三塔',desc:'游览大理古城、崇圣寺三塔。'},{day:'Day 4',title:'返程',desc:'自由活动，前往机场/高铁站返程。'}],includes:['往返交通','特色客栈','洱海骑行','旅行保险']},
    // ==== 热门旅游城市 ====
    suzhou: {name:'苏州',country:'江苏',tag:'江南园林甲天下',rating:4.7,days:'4天3晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/%E4%B8%9C%E6%96%B9%E4%B9%8B%E9%97%A81.jpg/960px-%E4%B8%9C%E6%96%B9%E4%B9%8B%E9%97%A81.jpg',description:'苏州，"上有天堂，下有苏杭"。拙政园的亭台楼榭、留园的曲径通幽、周庄的小桥流水、虎丘的千年斜塔，无处不彰显着江南水乡的诗情画意。',itinerary:[
        {day:'Day 1',title:'抵达苏州',desc:'接站入住，晚上逛平江路历史街区、品苏州小吃。'},{day:'Day 2',title:'拙政园 & 苏州博物馆',desc:'游览拙政园、苏州博物馆（贝聿铭设计），下午逛观前街。'},{day:'Day 3',title:'周庄水乡',desc:'前往周庄古镇，乘船游览水乡，体验小桥流水人家。'},{day:'Day 4',title:'虎丘 & 返程',desc:'游览虎丘、山塘街，下午返程。'}],includes:['往返交通','四星级酒店','园林门票','周庄游船','苏式美食','旅行保险']},
    qingdao: {name:'青岛',country:'山东',tag:'红瓦绿树碧海蓝天',rating:4.6,days:'4天3晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Qingdao_%2831424840488%29.jpg/960px-Qingdao_%2831424840488%29.jpg',description:'青岛，一座让人来了就不想走的海滨城市。栈桥的海鸥、八大关的万国建筑、崂山的道教文化、啤酒节的狂欢，处处洋溢着这座岛城的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达青岛',desc:'接站入住，晚上逛栈桥、五四广场看灯光秀。'},{day:'Day 2',title:'八大关 & 崂山',desc:'游览八大关万国建筑群，下午登崂山。'},{day:'Day 3',title:'啤酒博物馆 & 金沙滩',desc:'参观青岛啤酒博物馆，下午在金沙滩享受阳光。'},{day:'Day 4',title:'小鱼山 & 返程',desc:'登小鱼山俯瞰老城全景，下午返程。'}],includes:['往返交通','四星级酒店','崂山门票','啤酒博物馆','海鲜大餐','旅行保险']},
    xiamen: {name:'厦门',country:'福建',tag:'海上花园',rating:4.7,days:'4天3晚',price:'¥2,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Xiamen_night_cityscape_2018_-_Flickr_-_Jaykhuang.jpg/960px-Xiamen_night_cityscape_2018_-_Flickr_-_Jaykhuang.jpg',description:'厦门，一座风姿绰约的海上花园。鼓浪屿的万国建筑、环岛路的椰风海韵、曾厝垵的文艺气息、南普陀的晨钟暮鼓，让这座海滨城市充满了浪漫与诗情。',itinerary:[
        {day:'Day 1',title:'抵达厦门',desc:'接机入住，晚上逛中山路步行街。'},{day:'Day 2',title:'鼓浪屿',desc:'全天游览鼓浪屿：日光岩、菽庄花园、龙头路美食街。'},{day:'Day 3',title:'南普陀 & 厦大',desc:'游览南普陀寺、厦门大学、环岛路骑行。'},{day:'Day 4',title:'曾厝垵 & 返程',desc:'逛曾厝垵文艺村，下午返程。'}],includes:['往返交通','四星级酒店','鼓浪屿船票','景点门票','海鲜餐','旅行保险']},
    lijiang: {name:'丽江',country:'云南',tag:'雪山下的古城',rating:4.8,days:'5天4晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Black_Dragon_%E9%BB%91%E9%BE%99%E6%BD%AD_%285496141333%29.jpg/960px-Black_Dragon_%E9%BB%91%E9%BE%99%E6%BD%AD_%285496141333%29.jpg',description:'丽江，一个让人心灵栖息的远方。大研古城的纳西风情、玉龙雪山的巍峨壮丽、束河古镇的宁静悠然、泸沽湖的摩梭文化，每一处都是诗和远方的模样。',itinerary:[
        {day:'Day 1',title:'抵达丽江',desc:'抵达丽江，入住古城客栈，晚上逛四方街。'},{day:'Day 2',title:'玉龙雪山',desc:'全天游览玉龙雪山，乘坐大索道登顶，观看印象丽江演出。'},{day:'Day 3',title:'束河古镇 & 拉市海',desc:'游览束河古镇，下午在拉市海骑马、划船。'},{day:'Day 4',title:'泸沽湖',desc:'前往泸沽湖，环湖游览，体验摩梭族文化。'},{day:'Day 5',title:'返程',desc:'自由活动，根据航班时间送机。'}],includes:['往返交通','特色客栈','玉龙雪山索道','泸沽湖门票','印象丽江演出','旅行保险']},
    zhangjiajie: {name:'张家界',country:'湖南',tag:'奇峰三千秀水八百',rating:4.8,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',description:'张家界，阿凡达取景地，一座被大自然偏爱的山水画卷。天门山的惊险、天子山的奇峰、金鞭溪的清澈、大峡谷的玻璃桥，每一步都是视觉的盛宴。',itinerary:[
        {day:'Day 1',title:'抵达张家界',desc:'接站入住，晚上游览溪布街。'},{day:'Day 2',title:'天门山',desc:'游览天门山，体验玻璃栈道、天门洞奇观。'},{day:'Day 3',title:'武陵源 & 天子山',desc:'游览武陵源核心景区、天子山、袁家界（阿凡达取景地）。'},{day:'Day 4',title:'大峡谷 & 玻璃桥',desc:'游览大峡谷、挑战世界最高玻璃桥。'},{day:'Day 5',title:'金鞭溪 & 返程',desc:'漫步金鞭溪，下午返程。'}],includes:['往返交通','四星级酒店','景点门票','百龙天梯','玻璃桥门票','旅行保险']},
    huangshan: {name:'黄山',country:'安徽',tag:'五岳归来不看山',rating:4.9,days:'4天3晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg',description:'黄山，"五岳归来不看山，黄山归来不看岳"。奇松、怪石、云海、温泉、冬雪，"五绝"闻名天下。迎客松的挺拔、光明顶的日出、西海大峡谷的险峻，让人感叹大自然的鬼斧神工。',itinerary:[
        {day:'Day 1',title:'抵达黄山',desc:'抵达黄山北站，入住汤口镇。'},{day:'Day 2',title:'黄山山顶',desc:'乘索道上山，游览迎客松、光明顶、飞来石，住山顶看日落。'},{day:'Day 3',title:'西海大峡谷 & 宏村',desc:'游览西海大峡谷，下午下山游览宏村古村落。'},{day:'Day 4',title:'屯溪老街 & 返程',desc:'游览屯溪老街，下午返程。'}],includes:['往返交通','四星级酒店+山顶住宿','黄山门票+索道','宏村门票','旅行保险']},
    jiuzhaigou: {name:'九寨沟',country:'四川',tag:'人间仙境童话世界',rating:4.9,days:'5天4晚',price:'¥2,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/1_jiuzhaigou_valley_shuzheng_village_panorama_2011.jpg/960px-1_jiuzhaigou_valley_shuzheng_village_panorama_2011.jpg',description:'九寨沟，被誉为"童话世界"。翠海、叠瀑、彩林、雪峰、藏情、蓝冰，六绝奇观令人叹为观止。五花海的斑斓、诺日朗瀑布的壮观、长海的静谧，每一帧都美如画卷。',itinerary:[
        {day:'Day 1',title:'抵达九寨沟',desc:'抵达九黄机场，入住沟口酒店。'},{day:'Day 2',title:'九寨沟全天',desc:'全天深度游览九寨沟：树正沟→日则沟→则查洼沟。'},{day:'Day 3',title:'黄龙景区',desc:'游览黄龙景区，欣赏五彩池、钙化滩流。'},{day:'Day 4',title:'藏族文化体验',desc:'体验藏族文化，参观藏寨、品尝藏餐。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','九寨沟+黄龙门票','景区观光车','藏餐体验','旅行保险']},
    dunhuang: {name:'敦煌',country:'甘肃',tag:'丝路明珠',rating:4.7,days:'5天4晚',price:'¥2,799',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Jiucenglou_of_Mogao_Caves.jpg/960px-Jiucenglou_of_Mogao_Caves.jpg',description:'敦煌，丝绸之路上的明珠，一座承载着千年文明的文化圣地。莫高窟的壁画、鸣沙山的驼铃、月牙泉的碧波、雅丹地貌的奇幻，让人穿越时空感受丝路的辉煌。',itinerary:[
        {day:'Day 1',title:'抵达敦煌',desc:'抵达敦煌，入住酒店，晚上逛沙洲夜市。'},{day:'Day 2',title:'莫高窟',desc:'全天参观莫高窟，欣赏千年壁画和彩塑。'},{day:'Day 3',title:'鸣沙山 & 月牙泉',desc:'游览鸣沙山、月牙泉，体验沙漠骑骆驼、滑沙。'},{day:'Day 4',title:'雅丹地貌 & 玉门关',desc:'前往雅丹国家地质公园，参观玉门关、汉长城。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','莫高窟门票','鸣沙山骑骆驼','雅丹包车','旅行保险']},
    sanya: {name:'三亚',country:'海南',tag:'东方夏威夷',rating:4.7,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SuperStar_Aquarius_at_Phoenix_Island%2C_Sanya_Bay_-_01.jpg/960px-SuperStar_Aquarius_at_Phoenix_Island%2C_Sanya_Bay_-_01.jpg',description:'三亚，中国最南端的热带滨海旅游城市。亚龙湾的洁白沙滩、蜈支洲岛的清澈海水、天涯海角的浪漫传说、热带天堂森林公园的空中栈道，是避寒度假的绝佳选择。',itinerary:[
        {day:'Day 1',title:'抵达三亚',desc:'接机入住，晚上逛第一市场吃海鲜。'},{day:'Day 2',title:'亚龙湾 & 天堂森林公园',desc:'在亚龙湾享受阳光沙滩，游览热带天堂森林公园。'},{day:'Day 3',title:'蜈支洲岛',desc:'乘船前往蜈支洲岛，浮潜、玩水上项目。'},{day:'Day 4',title:'南山 & 天涯海角',desc:'参观南山文化旅游区、天涯海角。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','蜈支洲岛船票','景点门票','海鲜大餐','旅行保险']},
    xishuangbanna: {name:'西双版纳',country:'云南',tag:'热带雨林傣族风情',rating:4.6,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/%E6%99%AF%E6%BE%9C3101.jpg/960px-%E6%99%AF%E6%BE%9C3101.jpg',description:'西双版纳，中国唯一的热带雨林自然保护区。野象谷的亚洲象、望天树的空中走廊、傣族园的竹楼、星光夜市的烟火，让你感受浓郁的民族风情和热带风光。',itinerary:[
        {day:'Day 1',title:'抵达版纳',desc:'接机入住，晚上逛告庄星光夜市。'},{day:'Day 2',title:'野象谷 & 原始森林公园',desc:'游览野象谷看大象表演，下午探索原始森林公园。'},{day:'Day 3',title:'望天树景区',desc:'前往望天树景区，体验空中树冠走廊。'},{day:'Day 4',title:'傣族园 & 曼听公园',desc:'游览傣族园体验泼水节，参观曼听公园。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','景点门票','傣族园体验','特色餐食','旅行保险']},
    huangguoshu: {name:'黄果树',country:'贵州',tag:'亚洲最大瀑布',rating:4.6,days:'3天2晚',price:'¥1,599',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/HuangguoshuFall.jpg/960px-HuangguoshuFall.jpg',description:'黄果树瀑布，亚洲最大的瀑布，宽101米，高78米。奔腾而下的水流如银河倾泻，水雾弥漫，彩虹横跨，气势磅礴。景区内还有天星桥、陡坡塘等多个景点。',itinerary:[
        {day:'Day 1',title:'抵达贵阳',desc:'抵达贵阳，乘车前往黄果树，入住酒店。'},{day:'Day 2',title:'黄果树瀑布',desc:'全天游览黄果树瀑布景区：大瀑布、天星桥、陡坡塘。'},{day:'Day 3',title:'返程',desc:'自由活动，返程。'}],includes:['往返交通','三星级酒店','景点门票','景区观光车','旅行保险']},
    leshan: {name:'乐山',country:'四川',tag:'世界最大石刻坐佛',rating:4.6,days:'3天2晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Panorama_of_Leshan_03.2025.jpg/960px-Panorama_of_Leshan_03.2025.jpg',description:'乐山，举世闻名的乐山大佛所在地。大佛通高71米，是世界上最大的石刻弥勒佛坐像，历时90年建成。登临大佛脚下，感受"山是一尊佛，佛是一座山"的震撼。',itinerary:[
        {day:'Day 1',title:'抵达乐山',desc:'抵达乐山，入住酒店，晚上品尝乐山钵钵鸡。'},{day:'Day 2',title:'乐山大佛 & 峨眉山',desc:'上午游览乐山大佛，下午前往峨眉山。'},{day:'Day 3',title:'返程',desc:'自由活动，返程。'}],includes:['往返交通','三星级酒店','大佛门票','峨眉山半山游','旅行保险']},
    wuxi: {name:'无锡',country:'中国',province:'江苏省',tag:'太湖明珠',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'无锡，江苏省的一座美丽城市，以太湖明珠而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'太湖明珠',desc:'游览无锡，体验太湖明珠的魅力。'},{day:'Day 2',title:'太湖明珠',desc:'游览无锡，体验太湖明珠的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    yangzhou: {name:'扬州',country:'中国',province:'江苏省',tag:'烟花三月',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'扬州，江苏省的一座美丽城市，以烟花三月而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'烟花三月',desc:'游览扬州，体验烟花三月的魅力。'},{day:'Day 2',title:'烟花三月',desc:'游览扬州，体验烟花三月的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    zhenjiang: {name:'镇江',country:'中国',province:'江苏省',tag:'三山名胜',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'镇江，江苏省的一座美丽城市，以三山名胜而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'三山名胜',desc:'游览镇江，体验三山名胜的魅力。'},{day:'Day 2',title:'三山名胜',desc:'游览镇江，体验三山名胜的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    xuzhou: {name:'徐州',country:'中国',province:'江苏省',tag:'汉风楚韵',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'徐州，江苏省的一座美丽城市，以汉风楚韵而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'汉风楚韵',desc:'游览徐州，体验汉风楚韵的魅力。'},{day:'Day 2',title:'汉风楚韵',desc:'游览徐州，体验汉风楚韵的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    wuhu: {name:'芜湖',country:'中国',province:'安徽省',tag:'江城芜湖',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'芜湖，安徽省的一座美丽城市，以江城芜湖而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'江城芜湖',desc:'游览芜湖，体验江城芜湖的魅力。'},{day:'Day 2',title:'江城芜湖',desc:'游览芜湖，体验江城芜湖的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    chizhou: {name:'池州',country:'中国',province:'安徽省',tag:'九华山佛教',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'池州，安徽省的一座美丽城市，以九华山佛教而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'九华山佛教',desc:'游览池州，体验九华山佛教的魅力。'},{day:'Day 2',title:'九华山佛教',desc:'游览池州，体验九华山佛教的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    ningbo: {name:'宁波',country:'中国',province:'浙江省',tag:'港口名城',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'宁波，浙江省的一座美丽城市，以港口名城而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'港口名城',desc:'游览宁波，体验港口名城的魅力。'},{day:'Day 2',title:'港口名城',desc:'游览宁波，体验港口名城的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    shaoxing: {name:'绍兴',country:'中国',province:'浙江省',tag:'黄酒之乡',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'绍兴，浙江省的一座美丽城市，以黄酒之乡而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'黄酒之乡',desc:'游览绍兴，体验黄酒之乡的魅力。'},{day:'Day 2',title:'黄酒之乡',desc:'游览绍兴，体验黄酒之乡的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    wenzhou: {name:'温州',country:'中国',province:'浙江省',tag:'瓯越山水',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'温州，浙江省的一座美丽城市，以瓯越山水而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'瓯越山水',desc:'游览温州，体验瓯越山水的魅力。'},{day:'Day 2',title:'瓯越山水',desc:'游览温州，体验瓯越山水的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    jiaxing: {name:'嘉兴',country:'中国',province:'浙江省',tag:'红船乌镇',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'嘉兴，浙江省的一座美丽城市，以红船乌镇而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'红船乌镇',desc:'游览嘉兴，体验红船乌镇的魅力。'},{day:'Day 2',title:'红船乌镇',desc:'游览嘉兴，体验红船乌镇的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    fenghuang: {name:'凤凰',country:'中国',province:'湖南省',tag:'古城烟雨',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'凤凰，湖南省的一座美丽城市，以古城烟雨而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'古城烟雨',desc:'游览凤凰，体验古城烟雨的魅力。'},{day:'Day 2',title:'古城烟雨',desc:'游览凤凰，体验古城烟雨的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    yueyang: {name:'岳阳',country:'中国',province:'湖南省',tag:'洞庭天下水',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'岳阳，湖南省的一座美丽城市，以洞庭天下水而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'洞庭天下水',desc:'游览岳阳，体验洞庭天下水的魅力。'},{day:'Day 2',title:'洞庭天下水',desc:'游览岳阳，体验洞庭天下水的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    hengyang: {name:'衡阳',country:'中国',province:'湖南省',tag:'南岳衡山',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'衡阳，湖南省的一座美丽城市，以南岳衡山而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'南岳衡山',desc:'游览衡阳，体验南岳衡山的魅力。'},{day:'Day 2',title:'南岳衡山',desc:'游览衡阳，体验南岳衡山的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    dujiangyan: {name:'都江堰',country:'中国',province:'四川省',tag:'千年水利',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'都江堰，四川省的一座美丽城市，以千年水利而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'千年水利',desc:'游览都江堰，体验千年水利的魅力。'},{day:'Day 2',title:'千年水利',desc:'游览都江堰，体验千年水利的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
    emeishan: {name:'峨眉山',country:'中国',province:'四川省',tag:'佛教名山',rating:4.5,days:'2天1晚',price:'¥1,299起',img:'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',description:'峨眉山，四川省的一座美丽城市，以佛教名山而闻名。MYL 精选当地精华景点与美食，带你一次玩透。',itinerary:[{day:'Day 1',title:'佛教名山',desc:'游览峨眉山，体验佛教名山的魅力。'},{day:'Day 2',title:'佛教名山',desc:'游览峨眉山，体验佛教名山的魅力。'}],includes:['往返高铁','三星级酒店','景点门票','旅行保险']},
};

// 套餐数据
const tourData = {"island":{"name":"🌴 海岛度假套餐","subtitle":"马尔代夫、巴厘岛、普吉岛 | 5-7天","img":"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80","cover":"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80","description":"逃离喧嚣，投入碧海蓝天的怀抱。精选全球最美海岛目的地，享受阳光、沙滩和清澈见底的海水。无论是蜜月旅行还是家庭度假，我们为你安排最完美的海岛假期。","price":"¥2,799","days":"5-7天","countryTag":"🌍 国外","country":"国外","routePins":["抵达海岛","出海浮潜","自由活动","文化体验","返程"],"realCoords":[[103.8198,1.3521],[100.5018,13.7563],[115.8987,-8.3405],[73.2207,4.1755]],"mapPoints":[{"name":"新加坡","x":15,"y":60,"day":1},{"name":"普吉岛","x":35,"y":55,"day":2},{"name":"巴厘岛","x":55,"y":65,"day":3},{"name":"马尔代夫","x":75,"y":45,"day":4},{"name":"返程","x":90,"y":50,"day":5}],"tags":["蜜月首选","亲子度假","浮潜圣地","阳光沙滩"],"coverages":["浮潜体验","SPA放松","文化探访","海滨晚宴"],"flights":[{"from":"中国","to":"巴厘岛/普吉岛","price":"¥1,200-2,500","time":"6-8小时","bookingUrl":"https://www.skyscanner.com"},{"from":"中国","to":"马尔代夫","price":"¥3,500-6,000","time":"8-10小时","bookingUrl":"https://www.skyscanner.com"}],"trains":[],"hotels":[{"name":"巴厘岛海滨度假村","tier":"luxury","price":"¥1,500/晚","area":"乌鲁瓦图悬崖","highlight":"无边泳池+悬崖海景","image":"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400","bookingUrl":"https://www.booking.com"},{"name":"普吉岛海景酒店","tier":"comfort","price":"¥800/晚","area":"卡塔海滩","highlight":"私人沙滩+日落景观","image":"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400","bookingUrl":"https://www.booking.com"},{"name":"马尔代夫水上别墅","tier":"luxury","price":"¥3,000/晚","area":"水上屋","highlight":"玻璃地板+直接下海","image":"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400","bookingUrl":"https://www.booking.com"}],"foods":[{"name":"海鲜烧烤大餐","desc":"海边餐厅现点现烤，配当地水果鸡尾酒","price":"¥150-250/人"},{"name":"印尼传统脏摊美食","desc":"巴厘岛本地小吃摊位，体验市井烟火","price":"¥30-80/人"},{"name":"蜜月烛光晚宴","desc":"私人沙滩上的浪漫晚餐，香槟配海鲜","price":"¥500+/人"}],"transport":[{"label":"接机服务","value":"套餐包含机场接送"},{"label":"当地交通","value":"酒店包车/摩托车租赁 ¥100-200/天"},{"label":"出海费用","value":"浮潜一日游 ¥200-400/人"}],"tips":["海岛紫外线极强，务必带高倍防晒霜（SPF50+）","出海浮潜请穿救生衣，注意珊瑚礁保护","马尔代夫建议带美元现金，小费文化普遍","雨季（5-10月）可能有阵雨，但通常不影响行程","预订水上活动建议提前1-2天，避免旺季无位"],"budget":[{"label":"机票","value":"¥1,200-6,000"},{"label":"住宿","value":"¥800-3,000/晚"},{"label":"餐饮","value":"¥150-300/天"},{"label":"活动","value":"¥200-500/项"},{"label":"合计/人","value":"¥2,799-15,000"}],"itineraries":[{"day":"Day 1","theme":"抵达海岛","desc":"专车接机，入住海滨度假村，享受欢迎晚宴。","timeline":[{"time":"08:00","activity":"出发航班","detail":"从国内城市出发，飞往海岛目的地","duration":"6-10小时","tip":"选靠窗座位看云海"},{"time":"14:00-18:00","activity":"抵达·接机","detail":"专车机场接机，沿途欣赏热带风光","duration":"1小时"},{"time":"19:00","activity":"入住度假村","detail":"办理入住，享受迎宾鸡尾酒和冷毛巾","duration":"30分钟"},{"time":"20:00","activity":"欢迎晚宴","detail":"海边餐厅享用当地特色海鲜大餐","duration":"2小时","price":"含在套餐内"}]},{"day":"Day 2","theme":"出海浮潜","desc":"乘船出海，在珊瑚礁间浮潜，与热带鱼群共舞。","timeline":[{"time":"07:00","activity":"酒店早餐","detail":"丰盛的国际自助早餐","duration":"1小时"},{"time":"09:00","activity":"出海出发","detail":"乘坐快艇前往浮潜圣地，约45分钟船程","duration":"1小时","tip":"提前涂好防晒霜"},{"time":"10:00","activity":"珊瑚礁浮潜","detail":"专业教练带领，观赏彩色珊瑚和热带鱼群","duration":"2小时","ticket":"含在套餐内"},{"time":"12:30","activity":"海上午餐","detail":"船上BBQ午餐，欣赏海景","duration":"1.5小时"},{"time":"15:00","activity":"返程酒店","detail":"返回酒店休息或自由活动","duration":"1小时"}]},{"day":"Day 3","theme":"自由活动","desc":"全天自由活动，享受SPA、沙滩日光浴或水上运动。","timeline":[{"time":"08:00","activity":"早餐后自由安排","detail":"可选项目：SPA、深潜、冲浪、钓鱼","duration":"全天自由","price":"SPA ¥300-600"},{"time":"12:00","activity":"沙滩日光浴","detail":"躺椅+遮阳伞，享受午后阳光","duration":"2小时","tip":"中午11-14点紫外线最强，注意防晒"},{"time":"14:00","activity":"水上运动（可选）","detail":"拖拽伞、香蕉船、皮划艇等","duration":"2小时","price":"¥150-300/项"},{"time":"18:00","activity":"看日落","detail":"海边酒吧看夕阳，喝杯热带鸡尾酒","duration":"1小时"}]},{"day":"Day 4","theme":"文化体验","desc":"参观当地村落、寺庙，体验海岛传统文化和美食。","timeline":[{"time":"08:30","activity":"前往当地村落","detail":"包车前往岛上村落，了解原住民文化","duration":"1.5小时"},{"time":"10:00","activity":"参观寺庙/景点","detail":"参观当地著名寺庙或文化景点","duration":"2小时","ticket":"¥50-100"},{"time":"12:30","activity":"当地特色午餐","detail":"在村民家品尝传统料理","duration":"1.5小时","price":"¥50-100"},{"time":"14:30","activity":"购物时间","detail":"在当地市场购买手工纪念品","duration":"2小时"},{"time":"17:00","activity":"返回酒店","detail":"整理行装，为明天返程做准备","duration":"1小时"}]},{"day":"Day 5","theme":"返程","desc":"自由活动，根据航班时间送机。","timeline":[{"time":"07:30","activity":"早起·看日出","detail":"最后一次在海边看日出美景","duration":"1小时","tip":"日出约6点，提前起床"},{"time":"09:00","activity":"早餐·退房","detail":"享用最后一顿酒店早餐，办理退房","duration":"1小时"},{"time":"10:30","activity":"前往机场","detail":"酒店送机，国际航班建议提前4小时","duration":"1-2小时"},{"time":"14:00+","activity":"值机·航班返程","detail":"办理值机、过安检，在机场免税店最后扫货","duration":"飞行中"}]}],"options":[{"name":"巴厘岛 5天4晚","price":"¥2,799","id":"bali_5d"},{"name":"普吉岛 6天5晚","price":"¥3,999","id":"phuket_6d"},{"name":"马尔代夫 7天5晚","price":"¥7,999","id":"maldives_7d"}],"includes":["往返机票","海滨度假村","每日早餐","机场接送","浮潜装备","旅行保险"]},"culture":{"name":"🏛️ 文化探索套餐","subtitle":"欧洲、日本、东南亚 | 7-10天","img":"https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80","cover":"https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80","description":"深入探索世界文化遗产，感受不同文明的魅力。从欧洲古城到东方古都，由资深文化导游带你领略历史底蕴，品尝地道美食，体验最纯粹的文化之旅。","price":"¥5,299","days":"7-10天","countryTag":"🌍 国外","country":"国外","routePins":["抵达目的地","世界遗产探访","博物馆之旅","传统手工艺","美食探索","自由探索","返程"],"realCoords":[[2.3522,48.8566],[12.4964,41.9028],[139.6917,35.6895],[116.3974,39.9042]],"mapPoints":[{"name":"巴黎","x":20,"y":35,"day":1},{"name":"罗马","x":30,"y":45,"day":2},{"name":"东京","x":75,"y":40,"day":3},{"name":"北京","x":65,"y":55,"day":4},{"name":"自由探索","x":50,"y":60,"day":6},{"name":"返程","x":85,"y":50,"day":7}],"tags":["世界遗产","深度文化","博物馆控","历史爱好者"],"coverages":["世遗探访","博物馆","手工艺体验","美食课程"],"flights":[{"from":"中国","to":"欧洲","price":"¥3,500-8,000","time":"10-12小时","bookingUrl":"https://www.skyscanner.com"},{"from":"中国","to":"日本","price":"¥1,500-3,500","time":"3-4小时","bookingUrl":"https://www.skyscanner.com"}],"trains":[],"hotels":[{"name":"巴黎市中心酒店","tier":"comfort","price":"¥1,200/晚","area":"圣日耳曼区","highlight":"步行可达卢浮宫","image":"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400","bookingUrl":"https://www.booking.com"},{"name":"东京银座商务酒店","tier":"comfort","price":"¥1,000/晚","area":"银座","highlight":"交通便利+周边购物","image":"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400","bookingUrl":"https://www.booking.com"},{"name":"罗马历史酒店","tier":"comfort","price":"¥1,100/晚","area":"斗兽场附近","highlight":"古典风格+近遗址","image":"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400","bookingUrl":"https://www.booking.com"}],"foods":[{"name":"意大利千层面+红酒","desc":"当地餐厅传统意面配基安帝红酒","price":"¥200-350"},{"name":"怀石料理","desc":"日本传统高级料理，多道精致菜品","price":"¥400-800"},{"name":"欧洲街头美食","desc":"可丽饼、炸鱼薯条、法兰克福香肠","price":"¥50-100"}],"transport":[{"label":"当地交通","value":"通票/地铁卡 ¥50-100/天"},{"label":"景点门票","value":"卢浮宫 ¥150、大英博物馆免费、罗马斗兽场 ¥120"},{"label":"文化课程","value":"烹饪课/手工艺课 ¥300-600"}],"tips":["欧洲博物馆周一常闭馆，提前查好开放时间","东京地铁复杂，下载Google Maps或换乘案内APP","罗马斗兽场建议提前网上预约，排队很长","欧洲小偷较多，注意随身物品和护照安全","日本公共交通请保持安静，不要打电话"],"budget":[{"label":"机票","value":"¥1,500-8,000"},{"label":"住宿","value":"¥1,000-1,500/晚"},{"label":"餐饮","value":"¥200-400/天"},{"label":"景点门票","value":"¥150-500"},{"label":"合计/人","value":"¥5,299-20,000"}],"itineraries":[{"day":"Day 1","theme":"抵达目的地","desc":"接机入住，参加欢迎说明会。","timeline":[{"time":"08:00","activity":"出发航班","detail":"从国内出发飞往文化目的地","duration":"3-12小时","tip":"长途航班带U型枕"},{"time":"14:00-20:00","activity":"抵达·接机","detail":"专车接机入住酒店，短暂休息","duration":"1-2小时"},{"time":"20:30","activity":"欢迎说明会","detail":"导游介绍行程安排，分发资料包","duration":"1小时"},{"time":"21:30","activity":"当地特色晚餐","detail":"第一顿当地美食，感受文化氛围","duration":"1.5小时"}]},{"day":"Day 2","theme":"世界遗产探访","desc":"全天参观世界文化遗产，由资深文化专家讲解。","timeline":[{"time":"08:30","activity":"酒店早餐","detail":"自助式当地早餐","duration":"1小时"},{"time":"09:30","activity":"前往世界遗产地","detail":"专车前往联合国教科文认证的世界遗产","duration":"1-2小时"},{"time":"11:30","activity":"深度参观·专家讲解","detail":"资深文化专家带领讲解历史背景和艺术价值","duration":"3小时","ticket":"¥120-200","tip":"请使用耳机听讲解"},{"time":"14:30","activity":"遗产地午餐","detail":"在景点附近的特色餐厅用餐","duration":"1.5小时"},{"time":"16:30","activity":"自由拍照·文创商店","detail":"购买世界遗产主题纪念品","duration":"1小时"}]},{"day":"Day 3","theme":"博物馆之旅","desc":"参观当地最重要的博物馆，深入了解历史文化。","timeline":[{"time":"08:30","activity":"酒店早餐","detail":"饱吃一顿为博物馆之旅做准备","duration":"1小时"},{"time":"09:30","activity":"前往博物馆","detail":"前往当地TOP博物馆","duration":"30-60分钟"},{"time":"10:30","activity":"博物馆深度游览","detail":"参观镇馆之宝，听导览讲解，拍照记录","duration":"4小时","ticket":"¥50-150","tip":"请提前预约讲解器"},{"time":"14:30","activity":"博物馆餐厅午餐","detail":"博物馆内或附近的特色餐厅","duration":"1.5小时"},{"time":"16:30","activity":"博物馆商店","detail":"购买艺术画册、文创产品","duration":"1小时"}]},{"day":"Day 4","theme":"传统手工艺体验","desc":"参与当地传统手工艺制作，体验匠人精神。","timeline":[{"time":"08:30","activity":"酒店早餐","detail":"享用早餐后前往手工作坊","duration":"1小时"},{"time":"09:30","activity":"手工艺作坊参观","detail":"参观传统手工作坊，了解工艺历史","duration":"1.5小时"},{"time":"11:00","activity":"亲手制作体验","detail":"在匠人指导下亲自制作一件作品","duration":"3小时","price":"¥300-600"},{"time":"14:00","activity":"作坊午餐","detail":"与匠人一起享用传统便当/午餐","duration":"1小时"},{"time":"15:00","activity":"作品烧制·带走纪念","detail":"作品现场烧制或寄回国内","duration":"30分钟"}]},{"day":"Day 5","theme":"美食探索","desc":"品尝地道美食，参加烹饪课程。","timeline":[{"time":"08:30","activity":"市场游览","detail":"跟随导游逛当地传统市场，认识食材","duration":"1.5小时"},{"time":"10:00","activity":"烹饪课程","detail":"在专业厨师带领下学做2-3道当地菜","duration":"3小时","price":"¥400-800"},{"time":"13:00","activity":"品尝自己的作品","detail":"享用亲手做的料理，配当地酒","duration":"1.5小时"},{"time":"15:00","activity":"美食街区自由探索","detail":"在当地美食街自由品尝各种小吃","duration":"2小时","tip":"每样少量多尝试"},{"time":"18:00","activity":"告别晚餐","detail":"在当地最好的餐厅吃一顿","duration":"2小时"}]},{"day":"Day 6","theme":"自由探索","desc":"自由活动，推荐深度文化体验项目。","timeline":[{"time":"全天","activity":"自由安排","detail":"可选：深度游小众景点、看演出、逛书店","duration":"自由时间","tip":"推荐小众美术馆或古典音乐会"}]},{"day":"Day 7","theme":"返程","desc":"自由活动，前往机场返程。","timeline":[{"time":"08:00","activity":"酒店早餐","detail":"最后一顿酒店早餐","duration":"1小时"},{"time":"09:30","activity":"退房·最后采买","detail":"办理退房，在机场前最后逛一下","duration":"1.5小时"},{"time":"11:00","activity":"前往机场","detail":"酒店送机前往机场","duration":"1-2小时"},{"time":"13:00+","activity":"值机·返程","detail":"办理登机，过安检，登机回家","duration":"飞行中"}]}],"options":[{"name":"欧洲四国 10天9晚","price":"¥12,999","id":"europe_10d"},{"name":"日本深度 7天6晚","price":"¥5,299","id":"japan_7d"},{"name":"东南亚文化 8天7晚","price":"¥2,799","id":"seasia_8d"}],"includes":["往返机票","四星级酒店","资深文化导游","景点门票","特色餐食","旅行保险"]},"city":{"name":"🌆 城市漫游套餐","subtitle":"东京、首尔、曼谷、新加坡 | 4-6天","img":"https://images.unsplash.com/photo-1534430480872-3498386e6296?w=800&q=80","cover":"https://images.unsplash.com/photo-1534430480872-3498386e6296?w=1200&q=80","description":"感受亚洲最繁华都市的脉动！从东京的潮流前沿到首尔的韩流文化，从曼谷的烟火气息到新加坡的花园城市，每条线路都精心设计了自由探索与深度体验的完美平衡。","price":"¥2,599","days":"4-6天","countryTag":"🌍 国外","country":"国外","routePins":["抵达城市","城市地标打卡","自由活动","特色街区探索","返程"],"realCoords":[[139.6917,35.6895],[126.978,37.5665],[100.5018,13.7563],[103.8198,1.3521]],"mapPoints":[{"name":"东京","x":80,"y":30,"day":1},{"name":"首尔","x":65,"y":25,"day":2},{"name":"曼谷","x":45,"y":50,"day":3},{"name":"新加坡","x":55,"y":70,"day":4},{"name":"返程","x":90,"y":50,"day":5}],"tags":["都市潮流","购物天堂","霓虹夜景","韩流文化"],"coverages":["地标打卡","购物体验","美食探店","夜景欣赏"],"flights":[{"from":"中国","to":"东京","price":"¥1,500-3,500","time":"3-4小时","bookingUrl":"https://www.skyscanner.com"},{"from":"中国","to":"首尔","price":"¥800-2,000","time":"2-3小时","bookingUrl":"https://www.skyscanner.com"},{"from":"中国","to":"曼谷","price":"¥1,000-2,500","time":"3-4小时","bookingUrl":"https://www.skyscanner.com"}],"trains":[],"hotels":[{"name":"东京新宿商务酒店","tier":"comfort","price":"¥900/晚","area":"新宿","highlight":"近地铁站+购物便利","image":"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400","bookingUrl":"https://www.booking.com"},{"name":"首尔明洞酒店","tier":"comfort","price":"¥800/晚","area":"明洞","highlight":"步行可达购物街","image":"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400","bookingUrl":"https://www.booking.com"},{"name":"曼谷暹罗酒店","tier":"comfort","price":"¥600/晚","area":"暹罗商圈","highlight":"泳池+性价比高","image":"https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400","bookingUrl":"https://www.booking.com"}],"foods":[{"name":"东京拉面","desc":"一兰拉面、无敌家等名店","price":"¥50-100"},{"name":"韩国烤肉+部队锅","desc":"首尔烤肉店，配韩式小菜无限续","price":"¥150-250"},{"name":"曼谷街头美食","desc":"冬阴功、芒果糯米饭、泰式炒河粉","price":"¥30-80"}],"transport":[{"label":"接机","value":"套餐包含机场接送"},{"label":"交通卡","value":"赠送当地交通卡（T-Money/SUICA/BTS卡）"},{"label":"景点门票","value":"东京塔 ¥100、南山塔 ¥80、大皇宫 ¥150"}],"tips":["东京地铁换乘复杂，建议下载Google Maps","首尔明洞和弘大是购物天堂，支持支付宝/微信","曼谷很热，注意防晒和补水","泰国寺庙需穿长裤/长裙，肩膀遮住","新加坡地铁叫MRT，购票可使用EZ-Link卡"],"budget":[{"label":"机票","value":"¥800-3,500"},{"label":"住宿","value":"¥600-1,000/晚"},{"label":"餐饮","value":"¥100-200/天"},{"label":"购物预算","value":"自由消费"},{"label":"合计/人","value":"¥2,599-10,000"}],"itineraries":[{"day":"Day 1","theme":"抵达城市","desc":"接机入住市中心酒店，自由探索周边。","timeline":[{"time":"08:00","activity":"出发航班","detail":"国内出发飞往亚洲大都市","duration":"2-4小时","tip":"短途航班可以穿休闲"},{"time":"12:00-15:00","activity":"抵达·接机入住","detail":"专车机场接机，入住市中心酒店","duration":"1-2小时"},{"time":"16:00","activity":"周边自由探索","detail":"酒店周边商圈、便利店、交通路线","duration":"1小时"},{"time":"18:00","activity":"当地第一顿美食","detail":"尝试当地特色小吃或知名餐厅","duration":"1.5小时"},{"time":"20:00","activity":"夜景初体验","detail":"在酒店附近看城市霓虹灯夜景","duration":"1小时"}]},{"day":"Day 2","theme":"城市地标打卡","desc":"游览城市标志性景点，感受都市魅力。","timeline":[{"time":"08:00","activity":"酒店早餐","detail":"自助早餐或附近便利店","duration":"1小时"},{"time":"09:00","activity":"前往城市地标","detail":"地铁/专车前往城市最著名地标","duration":"30-60分钟"},{"time":"10:00","activity":"地标游览·拍照","detail":"登东京塔/南山塔/大皇宫等","duration":"3小时","ticket":"¥80-150"},{"time":"13:00","activity":"地标附近午餐","detail":"在景点周边餐厅解决午餐","duration":"1小时"},{"time":"14:30","activity":"第二地标/商圈","detail":"前往下一个标志性地点或购物商圈","duration":"3小时"},{"time":"18:00","activity":"晚餐+夜景","detail":"美食街/观景台看夜景","duration":"2小时"}]},{"day":"Day 3","theme":"自由活动","desc":"全天自由活动（赠送交通卡，轻松出行）。","timeline":[{"time":"全天","activity":"自由安排","detail":"购物、美食、小众景点、主题乐园等","duration":"自由时间","tip":"使用赠送交通卡，地铁自由行"}]},{"day":"Day 4","theme":"特色街区探索","desc":"探访当地特色街区、市场，体验城市生活。","timeline":[{"time":"09:00","activity":"前往特色街区","detail":"如东京浅草寺、首尔弘大、曼谷恰突恰市场","duration":"30-60分钟"},{"time":"10:00","activity":"街区深度探索","detail":"逛小店、买手信、体验当地市井","duration":"3小时"},{"time":"13:00","activity":"当地午餐","detail":"街区里的特色小馆","duration":"1小时"},{"time":"14:30","activity":"第二街区/体验","detail":"如韩流体验馆、动漫街、按摩SPA","duration":"3小时","price":"按摩 ¥100-200"},{"time":"18:00","activity":"告别晚餐","detail":"吃一顿最难忘的当地美食","duration":"2小时"}]},{"day":"Day 5","theme":"返程","desc":"自由活动，前往机场返程。","timeline":[{"time":"07:30","activity":"早餐·最后购物","detail":"最后买些伴手礼","duration":"1.5小时","tip":"机场免税店也可以买"},{"time":"09:30","activity":"退房·前往机场","detail":"酒店送机，国际航班提前4小时","duration":"1-2小时"},{"time":"12:00+","activity":"值机·返程","detail":"办理登机，回家","duration":"飞行中"}]}],"options":[{"name":"东京 5天4晚","price":"¥3,299","id":"tokyo_5d"},{"name":"首尔 5天4晚","price":"¥1,299","id":"seoul_5d"},{"name":"曼谷+芭提雅 6天5晚","price":"¥2,599","id":"bangkok_6d"}],"includes":["往返机票","市中心酒店","交通卡赠送","自由活动充裕","中文服务","旅行保险"]},"nanjing_tour":{"name":"🏯 南京古都深度游","subtitle":"六朝古都·秦淮风韵 | 4天3晚","img":"https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80","cover":"https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1200&q=80","description":"南京，六朝古都，十朝都会。MYL 精心打造的南京深度游线路，带你穿越千年历史长河。从中山陵的庄严到夫子庙的繁华，从明孝陵的皇家气派到老门东的市井烟火，全方位感受这座历史文化名城的独特魅力。","price":"¥1,499","days":"4天3晚","countryTag":"🇨🇳 国内","country":"中国","routePins":["夫子庙","中山陵","明孝陵","总统府","牛首山","返程"],"totalKm":"约80km","realCoords":[[118.788,32.0262],[118.8405,32.0581],[118.8333,32.0617],[118.7969,32.0488],[118.7796,31.9922]],"mapPoints":[{"name":"夫子庙","x":50,"y":70,"day":1},{"name":"中山陵","x":60,"y":35,"day":2},{"name":"明孝陵","x":45,"y":25,"day":2},{"name":"总统府","x":40,"y":45,"day":3},{"name":"牛首山","x":55,"y":85,"day":4},{"name":"返程","x":90,"y":50,"day":4}],"tags":["历史古都","文化深度","人文体验","秦淮河"],"coverages":["中山陵","明孝陵","总统府","秦淮河","南京博物院"],"flights":[{"from":"北京","to":"南京","price":"¥600-1,200","time":"1.5小时","bookingUrl":"https://flights.ctrip.com"},{"from":"广州","to":"南京","price":"¥800-1,500","time":"2小时","bookingUrl":"https://flights.ctrip.com"}],"trains":[{"from":"上海","to":"南京","price":"¥140-300","time":"1.5-3小时","duration":"最快1.5h","bookingUrl":"https://trains.ctrip.com"},{"from":"北京","to":"南京","price":"¥400-600","time":"4-6小时","duration":"最快4h","bookingUrl":"https://trains.ctrip.com"},{"from":"杭州","to":"南京","price":"¥200-400","time":"1-2小时","duration":"最快1h","bookingUrl":"https://trains.ctrip.com"}],"hotels":[{"name":"南京金陵饭店","tier":"luxury","price":"¥800/晚","area":"新街口","highlight":"地标酒店+近商圈","image":"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400","bookingUrl":"https://www.booking.com"},{"name":"夫子庙如家精选","tier":"comfort","price":"¥400/晚","area":"夫子庙商圈","highlight":"步行到秦淮河","image":"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400","bookingUrl":"https://www.booking.com"},{"name":"钟山宾馆","tier":"comfort","price":"¥500/晚","area":"城东","highlight":"近中山陵+环境好","image":"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400","bookingUrl":"https://www.booking.com"}],"foods":[{"name":"南京盐水鸭","desc":"皮白肉嫩、肥而不腻，南京招牌菜","price":"¥60-100/份"},{"name":"鸭血粉丝汤","desc":"鲜香爽滑，南京人早餐标配","price":"¥20-30/碗"},{"name":"小笼包","desc":"皮薄馅大汁多，推荐尹氏鸡汁汤包","price":"¥25-40"},{"name":"秦淮八绝","desc":"八种南京传统小吃组合","price":"¥80-120"}],"transport":[{"label":"接机/接站","value":"套餐包含机场/高铁站接送"},{"label":"市内交通","value":"南京地铁发达，推荐办地铁卡"},{"label":"景点间交通","value":"专车接送/旅游大巴"}],"tips":["中山陵有392级台阶，建议穿舒适的鞋","明孝陵神道秋天最美（银杏），春天梅花山赏花","夫子庙秦淮河画舫建议坐晚班，夜景最美","南京博物院需要提前预约，周一闭馆","总统府周一也闭馆，合理安排行程"],"budget":[{"label":"高铁/机票","value":"¥140-1,500"},{"label":"住宿","value":"¥400-800/晚×3"},{"label":"餐饮","value":"¥80-150/天"},{"label":"景点门票","value":"约¥300"},{"label":"合计/人","value":"¥1,499起"}],"itineraries":[{"day":"Day 1","theme":"抵达南京·秦淮夜色","desc":"接站入住酒店，傍晚游览夫子庙秦淮河风光带，乘画舫游秦淮河。","timeline":[{"time":"09:00-14:00","activity":"抵达南京","detail":"乘高铁/飞机抵达南京，专车接站","duration":"1-2小时"},{"time":"14:30","activity":"入住酒店","detail":"办理入住，短暂休息","duration":"30分钟"},{"time":"15:30","activity":"夫子庙游览","detail":"逛夫子庙大成殿、江南贡院","duration":"2小时","ticket":"夫子庙¥30、贡院¥50"},{"time":"17:30","activity":"秦淮八绝晚餐","detail":"在夫子庙吃南京特色小吃","duration":"1.5小时","price":"¥80-120"},{"time":"19:00","activity":"秦淮河画舫夜游","detail":"乘画舫游秦淮河，听讲解，看两岸灯光","duration":"1小时","ticket":"¥100","tip":"晚班夜景最美"}]},{"day":"Day 2","theme":"钟山风景区·中山陵","desc":"全天游览钟山风景区：中山陵、明孝陵、灵谷寺。晚上逛老门东。","timeline":[{"time":"08:00","activity":"酒店早餐","detail":"饱吃一顿准备登山","duration":"1小时"},{"time":"09:00","activity":"中山陵","detail":"登392级台阶谒国父陵寝，气势磅礴","duration":"2.5小时","ticket":"免费","tip":"台阶多，穿好鞋"},{"time":"12:00","activity":"陵区午餐","detail":"在景区附近餐厅用餐","duration":"1小时"},{"time":"13:30","activity":"明孝陵","detail":"游览世界文化遗产，神道石刻+梅花山","duration":"2.5小时","ticket":"¥70","tip":"神道是拍照圣地"},{"time":"16:30","activity":"灵谷寺","detail":"看国民革命军阵亡将士纪念塔","duration":"1.5小时","ticket":"¥35"},{"time":"18:30","activity":"老门东晚餐","detail":"逛老门东历史街区，品盐水鸭","duration":"2小时","price":"¥100-200"}]},{"day":"Day 3","theme":"南京博物院·总统府","desc":"上午参观南京博物院，下午游览总统府，傍晚逛1912街区。","timeline":[{"time":"08:30","activity":"酒店早餐","detail":"享用早餐后前往博物院","duration":"1小时"},{"time":"09:30","activity":"南京博物院","detail":"参观一院六馆，看镇馆之宝（金缕玉衣、青花瓷等）","duration":"4小时","ticket":"免费（需预约）","tip":"周一闭馆！"},{"time":"13:30","activity":"午餐","detail":"在附近餐厅吃饭","duration":"1小时"},{"time":"14:30","activity":"总统府","detail":"游览中国近代史博物馆，看民国建筑","duration":"2.5小时","ticket":"¥35","tip":"周一闭馆"},{"time":"17:30","activity":"1912街区","detail":"逛民国风格街区，喝咖啡、吃晚餐","duration":"2小时"},{"time":"19:30","activity":"最后晚餐","detail":"品尝南京最好吃的盐水鸭","duration":"1.5小时"}]},{"day":"Day 4","theme":"牛首山·返程","desc":"上午游览牛首山（佛顶宫）或栖霞山，下午返程。","timeline":[{"time":"08:00","activity":"酒店早餐","detail":"最后一顿酒店早餐","duration":"1小时"},{"time":"09:00","activity":"牛首山风景区","detail":"游览牛首山，参观佛顶宫（震撼建筑）","duration":"3小时","ticket":"¥98","tip":"佛顶宫地下层必看"},{"time":"12:00","activity":"午餐·退房","detail":"景区附近午餐后返回酒店退房","duration":"1.5小时"},{"time":"14:00","activity":"最后自由活动","detail":"酒店附近买伴手礼（盐水鸭、雨花茶）","duration":"1小时"},{"time":"15:30","activity":"前往机场/高铁站","detail":"专车送站返程","duration":"1-2小时"}]}],"options":[{"name":"南京经典 4天3晚","price":"¥1,499","id":"nanjing_3d"},{"name":"南京+扬州 5天4晚","price":"¥2,599","id":"nanjing_5d"},{"name":"南京+苏州+杭州 7天6晚","price":"¥3,999","id":"nanjing_7d"}],"includes":["往返高铁票","四星级酒店","秦淮河游船","景点门票","南京特色美食","旅行保险"]},"luan_tour":{"name":"⛰️ 六安·大别山生态游","subtitle":"山水六安·生态天堂 | 4天3晚","img":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80","cover":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80","description":"六安，位于安徽省西部，大别山北麓，是一座集山水风光与红色文化于一体的魅力之城。天堂寨的雄奇险秀、万佛湖的碧波万顷、大别山主峰的云海日出，是回归自然、放松身心的绝佳目的地。","price":"¥1,399","days":"4天3晚","countryTag":"🇨🇳 国内","country":"中国","routePins":["六安市区","天堂寨","万佛湖","大别山主峰","霍山石斛园","返程"],"totalKm":"约200km","realCoords":[[116.5142,31.7383],[115.8036,31.1751],[116.7612,31.3016],[116.1360,31.0930],[116.2802,31.2738]],"mapPoints":[{"name":"六安","x":50,"y":50,"day":1},{"name":"天堂寨","x":20,"y":15,"day":2},{"name":"万佛湖","x":45,"y":35,"day":3},{"name":"大别山主峰","x":30,"y":25,"day":3},{"name":"霍山石斛园","x":55,"y":45,"day":4},{"name":"返程","x":90,"y":50,"day":4}],"tags":["生态山水","大别山","自然风光","红色文化"],"coverages":["天堂寨","万佛湖","大别山主峰","霍山石斛","六安瓜片"],"flights":[{"from":"合肥","to":"六安(无机场)","price":"转高铁/大巴","time":"合肥新桥机场→六安约2小时","bookingUrl":"https://trains.ctrip.com"}],"trains":[{"from":"合肥","to":"六安","price":"¥60-120","time":"30-60分钟","duration":"最快30min","bookingUrl":"https://trains.ctrip.com"},{"from":"上海","to":"六安","price":"¥200-400","time":"2-3小时","duration":"最快2h","bookingUrl":"https://trains.ctrip.com"},{"from":"南京","to":"六安","price":"¥150-300","time":"1.5-2.5小时","duration":"最快1.5h","bookingUrl":"https://trains.ctrip.com"}],"hotels":[{"name":"六安曙光铂尊酒店","tier":"comfort","price":"¥400/晚","area":"市中心","highlight":"商务型+近月亮岛","image":"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400","bookingUrl":"https://www.booking.com"},{"name":"天堂寨度假山庄","tier":"comfort","price":"¥350/晚","area":"天堂寨景区内","highlight":"近景区入口+空气好","image":"https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400","bookingUrl":"https://www.booking.com"},{"name":"万佛湖度假村","tier":"comfort","price":"¥380/晚","area":"万佛湖边","highlight":"湖景房+休闲放松","image":"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400","bookingUrl":"https://www.booking.com"}],"foods":[{"name":"皖西大白鹅","desc":"六安特色，肉质鲜嫩，炖煲汤最佳","price":"¥80-150/份"},{"name":"蒿子粑粑","desc":"用白蒿和米粉做的传统小吃","price":"¥5-10/个"},{"name":"金寨吊锅","desc":"大别山特色，吊锅炖土鸡/腊肉","price":"¥150-200"},{"name":"六安瓜片茶","desc":"中国十大名茶，明清贡茶","price":"¥100-500/斤"}],"transport":[{"label":"接机/接站","value":"套餐包含高铁站接送"},{"label":"景区交通","value":"旅游大巴全程接送"},{"label":"天堂寨索道","value":"单程¥70，往返¥130（可选）"}],"tips":["天堂寨海拔较高，早晚温差大，带件外套","山区天气多变，建议带伞","登山穿防滑运动鞋","六安瓜片是中国十大名茶，值得买回家","霍山石斛是名贵中药材，注意辨别真伪"],"budget":[{"label":"高铁","value":"¥60-400"},{"label":"住宿","value":"¥350-400/晚×3"},{"label":"餐饮","value":"¥80-150/天"},{"label":"景点门票","value":"约¥300"},{"label":"合计/人","value":"¥1,399起"}],"itineraries":[{"day":"Day 1","theme":"抵达六安·市区休闲","desc":"接站入住酒店，傍晚游览月亮岛、六安古城墙，品尝六安特色美食。","timeline":[{"time":"09:00-13:00","activity":"抵达六安","detail":"乘高铁/大巴抵达六安，专车接站","duration":"1小时"},{"time":"14:00","activity":"入住酒店","detail":"办理入住，短暂休息","duration":"30分钟"},{"time":"15:00","activity":"月亮岛游览","detail":"漫步淠河岸边月亮岛，看白鹭飞翔","duration":"2小时","tip":"傍晚光线好适合拍照"},{"time":"17:00","activity":"六安古城墙","detail":"游览六安古城墙，感受老城历史","duration":"1小时"},{"time":"18:30","activity":"六安特色晚餐","detail":"吃皖西大白鹅、蒿子粑粑等当地菜","duration":"1.5小时","price":"¥120-200"}]},{"day":"Day 2","theme":"天堂寨风景区","desc":"全天游览天堂寨：登山观瀑布群、走玻璃栈道、探秘白马大峡谷。","timeline":[{"time":"07:00","activity":"酒店早餐","detail":"早出发前往天堂寨","duration":"45分钟"},{"time":"07:45","activity":"出发天堂寨","detail":"大巴前往天堂寨风景区（约2.5小时）","duration":"2.5小时","tip":"山路崎岖，备晕车药"},{"time":"10:30","activity":"天堂寨·瀑布群","detail":"游览一号瀑布到九号瀑布，看瀑布群奇观","duration":"3小时","ticket":"¥108","tip":"瀑布群需徒步，穿好鞋"},{"time":"13:30","activity":"景区午餐","detail":"在景区餐厅吃大别山特色菜","duration":"1小时"},{"time":"14:30","activity":"玻璃栈道+白马大峡谷","detail":"走玻璃栈道、探白马大峡谷","duration":"3小时","ticket":"玻璃栈道¥30"},{"time":"17:30","activity":"入住天堂寨山庄","detail":"入住景区附近酒店，晚餐吃吊锅","duration":"1小时"}]},{"day":"Day 3","theme":"万佛湖·大别山主峰","desc":"上午游览万佛湖，下午前往大别山主峰，欣赏云海日落。","timeline":[{"time":"07:00","activity":"早起出发","detail":"早起可能看到大别山日出，早餐后出发万佛湖","duration":"1.5小时"},{"time":"09:30","activity":"万佛湖风景区","detail":"乘船游湖、登岛观光，看湖泊山色","duration":"3小时","ticket":"¥65（含船票）"},{"time":"12:30","activity":"万佛湖午餐","detail":"吃鱼宴（万佛湖鱼头汤必点）","duration":"1.5小时","price":"¥150-250"},{"time":"14:30","activity":"大别山主峰","detail":"登上大别山主峰，欣赏云海日落","duration":"3小时","ticket":"¥80","tip":"主峰海拔1729米，温差大"},{"time":"17:30","activity":"返回六安市区","detail":"大巴返回六安市区酒店","duration":"2.5小时"},{"time":"20:00","activity":"告别晚餐","detail":"六安最后一顿晚餐，品六安瓜片茶","duration":"1.5小时"}]},{"day":"Day 4","theme":"霍山石斛园·返程","desc":"参观霍山石斛园，品六安瓜片茶，下午返程。","timeline":[{"time":"08:00","activity":"酒店早餐","detail":"最后一顿酒店早餐","duration":"1小时"},{"time":"09:00","activity":"霍山石斛种植基地","detail":"参观石斛种植基地，了解名贵中药材","duration":"2小时","tip":"可购买正品石斛伴手礼"},{"time":"11:00","activity":"六安瓜片茶园","detail":"参观六安瓜片茶园，品茶","duration":"1.5小时","price":"可选购茶叶"},{"time":"12:30","activity":"午餐·退房","detail":"吃午餐后返回酒店退房","duration":"1.5小时"},{"time":"14:30","activity":"自由活动·买伴手礼","detail":"购买六安特产（大白鹅、茶叶、石斛）","duration":"1小时"},{"time":"16:00","activity":"送站返程","detail":"专车送到高铁站返程","duration":"30-60分钟"}]}],"options":[{"name":"六安经典 4天3晚","price":"¥1,399","id":"luan_4d"},{"name":"六安+合肥 5天4晚","price":"¥1,499","id":"luan_6d"},{"name":"大别山徒步 5天4晚","price":"¥1,299","id":"luan_5d"}],"includes":["往返交通","三星级酒店","景点门票","景区交通车","六安瓜片品鉴","旅行保险"]}};;

function openModal(city) {
    const data = destinationData[city];
    if (!data) return;

    // 优先使用富数据版本
    const richData = (window.CITY_DETAIL && window.CITY_DETAIL[city]) || null;

    let itineraryHtml, extraHtml = '';

    if (richData && window.renderRichDetail) {
        richData._cityKey = city;
        itineraryHtml = window.renderRichDetail(richData);
    } else {
        // 回退到原有简单版本
        itineraryHtml = data.itinerary.map(item => `
            <div class="itinerary-day">
                <h4>${item.day} — ${item.title}</h4>
                <p>${item.desc}</p>
            </div>
        `).join('');
    }

    const includesHtml = data.includes.join(' · ');

    modalBody.innerHTML = `
        <div class="modal-body">
            <h2>${data.name} · ${data.country}</h2>
            <div class="modal-subtitle">⭐ ${data.rating} · ${data.days} · ${data.tag}</div>
            <img class="modal-hero" src="${data.img}" alt="${data.name}" />

            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 目的地简介</h3>
                <p>${data.description}</p>
            </div>

            ${itineraryHtml}

            <div class="modal-price-box">
                <div>
                    <div class="price">${data.price} <small>/人起</small></div>
                    <div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> ${includesHtml}</div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即咨询</a>
            </div>
        </div>
    `;

    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 60);
}

// 可选方案详情数据
const optionDetails = {
    nanjing_3d: {
        name: '南京经典 4天3晚',
        price: '¥1,499',
        img: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80',
        description: '4天3晚深度游览南京，涵盖中山陵、夫子庙、南京博物院等核心景点，感受六朝古都的历史底蕴。',
        itinerary: [
            { day: 'Day 1', title: '抵达南京 · 秦淮夜色', desc: '接站入住酒店，傍晚游览夫子庙秦淮河风光带，乘画舫游秦淮河，品尝南京特色小吃。' },
            { day: 'Day 2', title: '中山陵 · 明孝陵', desc: '全天游览钟山风景区：中山陵392级台阶、明孝陵神道石刻、灵谷寺，晚上逛老门东。' },
            { day: 'Day 3', title: '南京博物院 · 总统府', desc: '上午参观南京博物院，下午游览总统府、1912街区，品尝南京盐水鸭。' },
            { day: 'Day 4', title: '返程', desc: '自由活动，送站返程。' },
        ],
        includes: ['往返高铁票', '四星级酒店', '秦淮河游船', '景点门票', '盐水鸭体验', '旅行保险']
    },
    nanjing_5d: {
        name: '南京+扬州 5天4晚',
        price: '¥2,599',
        img: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80',
        description: '南京+扬州双城游，感受金陵古都的厚重与扬州园林的精致，一次旅行体验两种江南风情。',
        itinerary: [
            { day: 'Day 1', title: '抵达南京', desc: '接站入住，夜游夫子庙。' },
            { day: 'Day 2', title: '南京经典', desc: '中山陵、明孝陵、南京博物院。' },
            { day: 'Day 3', title: '前往扬州', desc: '乘高铁前往扬州，游览瘦西湖、个园。' },
            { day: 'Day 4', title: '扬州慢生活', desc: '体验扬州早茶、逛东关街，下午返回南京。' },
            { day: 'Day 5', title: '返程', desc: '自由活动，送站返程。' },
        ],
        includes: ['往返高铁票', '四星级酒店', '景点门票', '扬州早茶', '旅行保险']
    },
    luan_4d: {
        name: '六安经典 4天3晚',
        price: '¥1,399',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        description: '4天3晚深度体验六安的自然风光与人文魅力，登天堂寨、游万佛湖、品六安瓜片。',
        itinerary: [
            { day: 'Day 1', title: '抵达六安', desc: '接站入住，游览月亮岛、品六安特色美食。' },
            { day: 'Day 2', title: '天堂寨', desc: '全天游览天堂寨：登山观瀑布群、玻璃栈道、白马大峡谷。' },
            { day: 'Day 3', title: '万佛湖', desc: '游览万佛湖风景区，乘船游湖、登岛观光。' },
            { day: 'Day 4', title: '返程', desc: '品六安瓜片茶，送站返程。' },
        ],
        includes: ['往返交通', '三星级酒店', '景点门票', '景区交通车', '六安瓜片品鉴', '旅行保险']
    },
    luan_5d: {
        name: '大别山徒步 5天4晚',
        price: '¥1,299',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        description: '徒步大别山，挑战自我，感受原始森林的壮美与纯净。',
        itinerary: [
            { day: 'Day 1', title: '抵达六安', desc: '接站入住，行前说明会。' },
            { day: 'Day 2', title: '天堂寨徒步', desc: '天堂寨深度徒步穿越，入住山上客栈。' },
            { day: 'Day 3', title: '大别山主峰', desc: '登大别山主峰，欣赏云海日出。' },
            { day: 'Day 4', title: '万佛湖', desc: '万佛湖休闲游览，放松身心。' },
            { day: 'Day 5', title: '返程', desc: '早餐后送站返程。' },
        ],
        includes: ['往返交通', '客栈+酒店', '专业向导', '徒步装备', '户外保险']
    },
    nanjing_7d: {
        name: '南京+苏州+杭州 7天6晚',
        price: '¥3,999',
        img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
        description: '一次玩遍江南三大名城——南京的厚重历史、苏州的园林雅致、杭州的西湖风光，感受江南最精华的文化与美景。',
        itinerary: [
            { day: 'Day 1', title: '抵达南京', desc: '接站入住，夜游夫子庙秦淮河。' },
            { day: 'Day 2', title: '南京深度游', desc: '中山陵、明孝陵、南京博物院，傍晚乘高铁前往苏州。' },
            { day: 'Day 3', title: '苏州园林', desc: '拙政园、苏州博物馆、留园，傍晚乘高铁前往杭州。' },
            { day: 'Day 4', title: '杭州西湖', desc: '乘船游西湖、登雷峰塔、苏堤春晓、花港观鱼。' },
            { day: 'Day 5', title: '灵隐寺 & 龙井', desc: '灵隐寺祈福、龙井村品茶，下午自由活动。' },
            { day: 'Day 6', title: '自由活动', desc: '自由探索杭州或乌镇半日游。' },
            { day: 'Day 7', title: '返程', desc: '根据航班/高铁时间送站返程。' },
        ],
        includes: ['往返高铁票', '四星级酒店', '景点门票', '西湖游船', '龙井茶体验', '旅行保险']
    },
    luan_6d: {
        name: '六安+合肥 5天4晚',
        price: '¥1,499',
        img: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80',
        description: '一次游玩六安和合肥双城，体验大别山的壮美与合肥的科技魅力，自然与人文的完美结合。',
        itinerary: [
            { day: 'Day 1', title: '抵达合肥', desc: '接站入住，晚上逛淮河路步行街。' },
            { day: 'Day 2', title: '合肥文化游', desc: '包公园、李鸿章故居、安徽博物院。' },
            { day: 'Day 3', title: '三河古镇', desc: '游览三河古镇，体验徽派水乡，下午前往六安。' },
            { day: 'Day 4', title: '天堂寨', desc: '全天游览天堂寨风景区，登高望远。' },
            { day: 'Day 5', title: '返程', desc: '品六安瓜片，送站返程。' },
        ],
        includes: ['往返交通', '四星级酒店', '景点门票', '景区交通车', '六安瓜片品鉴', '旅行保险']
    },
    bali_5d: {
        name: '巴厘岛 5天4晚',
        price: '¥2,799',
        img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
        description: '5天4晚深度体验巴厘岛精华：无边泳池、梯田骑行、海神庙日落、SPA放松，蜜月首选。',
        itinerary: [
            { day: 'Day 1', title: '抵达巴厘岛 · 入住悬崖度假村', desc: '专车接机入住乌鲁瓦图悬崖度假村，无边泳池看日落，欢迎晚宴。' },
            { day: 'Day 2', title: '出海浮潜 · 珊瑚礁探险', desc: '蓝梦岛浮潜一日游，观赏彩色珊瑚和热带鱼群，海上午餐BBQ。' },
            { day: 'Day 3', title: '乌布文化 · 梯田骑行', desc: '乌布皇宫+德格拉朗梯田骑行，圣泉寺祈福，下午SPA放松。' },
            { day: 'Day 4', title: '海神庙 · 情人崖', desc: '海神庙看日落（巴厘岛地标），情人崖悬崖海景，金巴兰海滩海鲜大餐。' },
            { day: 'Day 5', title: '返程', desc: '自由活动购物，酒店送机返程。' },
        ],
        includes: ['往返机票', '五星级悬崖度假村', '机场接送', '浮潜一日游', 'SPA体验', '旅行保险']
    },
    phuket_6d: {
        name: '普吉岛 6天5晚',
        price: '¥3,999',
        img: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
        description: '6天5晚普吉岛精华：攀牙湾泛舟、PP岛跳岛、芭东海滩夜生活、泰式按摩，亚洲海岛天花板。',
        itinerary: [
            { day: 'Day 1', title: '抵达普吉 · 芭东海滩', desc: '专车接机入住芭东海滩酒店，傍晚逛芭东夜市，泰式料理晚餐。' },
            { day: 'Day 2', title: '攀牙湾 · 詹姆斯邦德岛', desc: '攀牙湾红树林泛舟，参观007电影取景地，天然乳胶博物馆。' },
            { day: 'Day 3', title: 'PP岛跳岛游', desc: '玛雅湾、鸡岛、猴子岛跳岛浮潜，享受最美海水和沙滩。' },
            { day: 'Day 4', title: '卡塔海滩 · 泰式按摩', desc: '卡塔海滩日光浴，下午做2小时泰式传统按摩放松。' },
            { day: 'Day 5', title: '大佛观景 · 周末市场', desc: '登上普吉大佛（山顶俯瞰全岛），周末夜市买伴手礼。' },
            { day: 'Day 6', title: '返程', desc: '最后一顿普吉美食，酒店送机返程。' },
        ],
        includes: ['往返机票', '四星级海滩酒店', '机场接送', '攀牙湾+PP岛一日游', '泰式按摩', '旅行保险']
    },
    maldives_7d: {
        name: '马尔代夫 7天5晚',
        price: '¥7,999',
        img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        description: '7天5晚马尔代夫顶级水上屋：玻璃地板直接下海、私人泳池、SPA、蜜月烛光晚餐，终极海岛体验。',
        itinerary: [
            { day: 'Day 1', title: '抵达马累 · 水上飞机上岛', desc: '抵达马累机场，转水上飞机约30分钟上岛，办理入住玻璃地板水上屋。' },
            { day: 'Day 2', title: '浮潜 · 海底餐厅午餐', desc: '屋前甲板直接下海浮潜，下午体验海底餐厅（需提前预约）。' },
            { day: 'Day 3', title: 'SPA · 私人烛光晚宴', desc: '2小时情侣SPA，傍晚私人沙滩烛光晚餐（香槟配海鲜）。' },
            { day: 'Day 4', title: '海豚巡航 · 无人岛野餐', desc: '出海看海豚，在无人沙洲上享受马尔代夫野餐午餐。' },
            { day: 'Day 5', title: '自由活动 · 最后一潜', desc: '可选深潜（¥600/潜）、皮划艇、帆板，最后一次浮潜看海龟。' },
            { day: 'Day 6', title: '离岛 · 马累市区', desc: '退岛后游览马累市区、苏丹公园，机场附近休息。' },
            { day: 'Day 7', title: '返程', desc: '机场值机，转机回国。' },
        ],
        includes: ['往返机票', '水上飞机接送', '水上别墅（含玻璃地板）', '每日浮潜装备', 'SPA体验', '旅行保险']
    },
    europe_10d: {
        name: '欧洲四国 10天9晚',
        price: '¥12,999',
        img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        description: '10天9晚欧洲四国深度游：法国+意大利+西班牙+瑞士，卢浮宫、斗兽场、圣家堂、阿尔卑斯，经典欧洲一次玩遍。',
        itinerary: [
            { day: 'Day 1', title: '抵达巴黎', desc: '飞机抵达巴黎戴高乐机场，专车接机入住市中心酒店，傍晚乘塞纳河游船。' },
            { day: 'Day 2', title: '巴黎深度游', desc: '卢浮宫（必看蒙娜丽莎）、埃菲尔铁塔登顶，蒙马特高地看日落。' },
            { day: 'Day 3', title: '巴黎→罗马', desc: '早班机飞往罗马，入住斗兽场附近酒店，傍晚逛特莱维喷泉、西班牙阶梯。' },
            { day: 'Day 4', title: '罗马古迹一日', desc: '斗兽场+古罗马广场+梵蒂冈（圣彼得大教堂+西斯廷教堂）。' },
            { day: 'Day 5', title: '罗马→巴塞罗那', desc: '早班机飞往巴塞罗那，入住哥特区酒店，晚上逛兰布拉大道。' },
            { day: 'Day 6', title: '巴塞罗那必看', desc: '圣家堂（提前预约）、巴特罗之家、米拉之家，海滩放松。' },
            { day: 'Day 7', title: '巴塞罗那→苏黎世', desc: '早班机飞往苏黎世，入住火车站附近酒店，傍晚逛班霍夫大街购物。' },
            { day: 'Day 8', title: '阿尔卑斯山', desc: '乘齿轮火车登少女峰（欧洲之巅），冰河观景台，下午湖边漫步。' },
            { day: 'Day 9', title: '苏黎世自由活动', desc: '上午自由购物，下午乘船游苏黎世湖，最后晚餐告别欧洲。' },
            { day: 'Day 10', title: '返程', desc: '机场值机，经阿姆斯特丹/赫尔辛基转机回国。' },
        ],
        includes: ['往返机票', '四星级酒店', '所有城市间机票', '景点门票（卢浮宫/斗兽场/圣家堂）', '当地特色晚餐', '旅行保险']
    },
    japan_7d: {
        name: '日本深度 7天6晚',
        price: '¥5,299',
        img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        description: '7天6晚东京+京都深度游：浅草寺、富士山、金阁寺、伏见稻荷大社、涩谷十字路口，东京京都双城完美组合。',
        itinerary: [
            { day: 'Day 1', title: '抵达东京', desc: '成田/羽田机场落地，Narita Express 直达新宿，入住酒店，傍晚逛涩谷十字路口。' },
            { day: 'Day 2', title: '东京经典', desc: '浅草寺+雷门、晴空塔、秋叶原电器街，晚上东京塔看夜景。' },
            { day: 'Day 3', title: '富士山一日游', desc: '大巴前往富士山五合目，河口湖看倒影，忍野八海，傍晚回东京。' },
            { day: 'Day 4', title: '东京→京都', desc: '新干线2.5小时到京都，入住祗园附近，傍晚逛祗园花见小路。' },
            { day: 'Day 5', title: '京都金阁寺', desc: '金阁寺+龙安寺枯山水+岚山竹林小火车，渡月桥日落。' },
            { day: 'Day 6', title: '伏见稻荷 + 清水寺', desc: '伏见稻荷大社千本鸟居（必拍），清水寺+二年坂+八坂神社。' },
            { day: 'Day 7', title: '返程', desc: '最后一顿京都怀石料理，关西机场值机返程。' },
        ],
        includes: ['往返机票', '四星级酒店', '东京-京都新干线', '富士山一日游', '景点门票', '旅行保险']
    },
    seasia_8d: {
        name: '东南亚文化 8天7晚',
        price: '¥2,799',
        img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
        description: '8天7晚柬埔寨+泰国文化之旅：吴哥窟震撼日出、金边皇宫、曼谷大皇宫+玉佛寺、清迈古城，东南亚文化深度体验。',
        itinerary: [
            { day: 'Day 1', title: '抵达金边', desc: '专车接机入住金边酒店，傍晚逛中央市场，了解柬埔寨历史。' },
            { day: 'Day 2', title: '金边皇宫 + S21监狱', desc: '金边皇宫+国家博物馆，下午参观S21红色高棉监狱博物馆。' },
            { day: 'Day 3', title: '金边→暹粒', desc: '飞机前往暹粒（40分钟），入住老市场附近酒店，傍晚巴肯山看日落。' },
            { day: 'Day 4', title: '吴哥窟一日游', desc: '凌晨5点出发看吴哥窟日出（世界七大奇迹），一整天游览吴哥建筑群。' },
            { day: 'Day 5', title: '暹粒→曼谷', desc: '飞机前往曼谷，入住暹罗商圈，晚上逛四面佛+夜市。' },
            { day: 'Day 6', title: '曼谷大皇宫', desc: '大皇宫+玉佛寺+卧佛寺，下午坐船游湄南河，晚上看人妖秀。' },
            { day: 'Day 7', title: '曼谷→清迈', desc: '飞机前往清迈，入住古城内酒店，傍晚逛周日夜市。' },
            { day: 'Day 8', title: '清迈素贴山 + 返程', desc: '上午素贴山双龙寺+宁曼路，下午机场值机，转机回国。' },
        ],
        includes: ['往返机票', '三星级酒店', '各国境内机票', '吴哥窟/大皇宫门票', '湄南河游船', '旅行保险']
    },
    tokyo_5d: {
        name: '东京 5天4晚',
        price: '¥3,299',
        img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        description: '5天4晚东京自由行：浅草寺、东京塔、涩谷购物、新宿美食、富士山一日游，交通卡+中文服务轻松自由行。',
        itinerary: [
            { day: 'Day 1', title: '抵达东京', desc: '成田/羽田机场落地，入住新宿商务酒店，傍晚逛新宿歌舞伎町+吃拉面。' },
            { day: 'Day 2', title: '浅草寺 + 晴空塔', desc: '浅草寺+雷门求签，晴空塔登顶，下午秋叶原电器购物。' },
            { day: 'Day 3', title: '富士山一日游', desc: '大巴前往富士山五合目，河口湖倒影，忍野八海清泉，傍晚回东京。' },
            { day: 'Day 4', title: '涩谷 + 自由活动', desc: '涩谷十字路口+109大厦购物，下午原宿竹下通，晚上东京塔夜景。' },
            { day: 'Day 5', title: '返程', desc: '最后一顿寿司早餐，机场值机返程。' },
        ],
        includes: ['往返机票', '市中心酒店', 'Suica交通卡', '富士山一日游', '中文服务', '旅行保险']
    },
    seoul_5d: {
        name: '首尔 5天4晚',
        price: '¥1,299',
        img: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80',
        description: '5天4晚首尔购物美食游：明洞、弘大、东大门、南山塔，韩流体验+韩式烤肉+免税店血拼。',
        itinerary: [
            { day: 'Day 1', title: '抵达首尔', desc: '仁川机场落地，AREX直达首尔站，入住明洞酒店，晚上逛明洞夜市。' },
            { day: 'Day 2', title: '景福宫 + 弘大', desc: '景福宫穿韩服拍照（免费入场），下午弘大涂鸦街+自由市场。' },
            { day: 'Day 3', title: '南山塔 + 购物血拼', desc: '南山首尔塔看全景，下午明洞+乐天免税店购物，晚上韩式烤肉。' },
            { day: 'Day 4', title: '东大门 + 韩流', desc: '东大门DDP设计广场+服装批发市场，下午梨泰院K-pop体验。' },
            { day: 'Day 5', title: '返程', desc: '最后一顿部队锅早餐，仁川机场值机返程。' },
        ],
        includes: ['往返机票', '四星级酒店', 'T-money交通卡', '景福宫门票', '明洞购物优惠券', '旅行保险']
    },
    bangkok_6d: {
        name: '曼谷+芭提雅 6天5晚',
        price: '¥2,599',
        img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
        description: '6天5晚曼谷+芭提雅组合：大皇宫+玉佛寺+湄南河游船+东芭乐园+格兰岛出海，性价比极高的东南亚经典路线。',
        itinerary: [
            { day: 'Day 1', title: '抵达曼谷', desc: '素万那普机场落地，轻轨直达暹罗商圈，入住酒店，晚上逛四面佛。' },
            { day: 'Day 2', title: '大皇宫 + 湄南河', desc: '大皇宫+玉佛寺+卧佛寺，下午坐船游湄南河，晚上看萤火虫夜市。' },
            { day: 'Day 3', title: '曼谷→芭提雅', desc: '大巴前往芭提雅（2.5小时），入住海边酒店，晚上看蒂芙尼人妖秀。' },
            { day: 'Day 4', title: '格兰岛出海', desc: '快艇前往格兰岛，海水清澈（比普吉还蓝），浮潜+香蕉船+海底漫步。' },
            { day: 'Day 5', title: '东芭乐园 + 返回曼谷', desc: '东芭乐园泰国文化表演+大象表演，下午返回曼谷，晚上最后的曼谷美食。' },
            { day: 'Day 6', title: '返程', desc: '最后一顿冬阴功早餐，机场值机返程。' },
        ],
        includes: ['往返机票', '四星级酒店', 'BTS机场快线', '大皇宫+东芭乐园门票', '格兰岛出海一日游', '旅行保险']
    }};

function showOptionDetail(optionId) {
    const data = optionDetails[optionId];
    if (!data) return;

    // Determine which tour to go back to
    let backType;
    if (optionId.includes('nanjing')) backType = 'nanjing_tour';
    else if (optionId.includes('luan')) backType = 'luan_tour';
    else if (optionId.includes('bali') || optionId.includes('phuket') || optionId.includes('maldives')) backType = 'island';
    else if (optionId.includes('europe') || optionId.includes('japan') || optionId.includes('seasia')) backType = 'culture';
    else if (optionId.includes('tokyo') || optionId.includes('seoul') || optionId.includes('bangkok')) backType = 'city';
    else backType = 'island';

    // Build enriched data for rendering
    const enriched = {
        name: data.name,
        countryTag: '🇨🇳 国内',
        country: '中国',
        cover: data.img,
        img: data.img,
        description: data.description,
        price: data.price,
        days: data.name.match(/\d+天/) ? data.name.match(/\d+天/)[0] : '',
        routePins: data.itinerary.map(i => i.title || i.day),
        mapPoints: data.itinerary.map((it, i) => ({
            name: (it.title || '').slice(0, 6),
            x: 15 + i * 15,
            y: 30 + (i % 2) * 30,
            day: it.day
        })),
        realCoords: [],
        flights: [],
        trains: [],
        hotels: [],
        foods: [],
        tips: [],
        budget: [],
        includes: data.includes,
        itineraries: data.itinerary.map((it, i) => ({
            day: it.day,
            theme: it.title || '',
            timeline: [
                { time: '09:00', activity: it.title || '', detail: it.desc || '', duration: '全天' }
            ]
        })),
        coverages: [],
        tags: []
    };

    // Use the same rendering as openTourModal
    openTourModalBack(enriched, backType);
}

// Helper: open tour modal with custom data and back link


// ========== 省份弹窗（重写版：带省内城市地图 + 富城市 grid） ==========
function openProvinceModal(provinceKey) {
    const provData = (window.PROVINCES_ALL || []).find(p => p.key === provinceKey);
    if (!provData) { showToast('该省份数据加载中'); return; }
    
    // 省份地图（省内城市坐标 polyline）
    let provMapHtml = '';
    const cityCoords = (provData.cities || []).filter(c => c.coords);
    if (cityCoords.length >= 2 && window.realMapHtml) {
        const points = cityCoords.map(c => ({
            lng: c.coords[0], lat: c.coords[1],
            name: c.name, num: cityCoords.indexOf(c) + 1
        }));
        provMapHtml = window.realMapHtml({
            points: points,
            domestic: true,
            convert: false,
            clickDay: false,
            height: 320,
            title: '🗺️ ' + provData.name + ' 下辖城市分布 · 可缩放拖动',
            linkText: '在高德查看完整路线'
        });
    }
    
    // 城市 grid（有坐标的都能点进详情）
    const citiesHtml = (provData.cities || []).map(c => {
        const coordOk = c.coords && c.coords[0] && c.coords[0] != 0;
        return `
        <div class="dest-card china-card" onclick="openProvinceCityModal('${c.key}','${c.name}','${provData.name}')" style="cursor:pointer">
            <div class="dest-info" style="padding:10px 14px">
                <h3 style="font-size:0.95rem;margin:0 0 2px 0">${c.name}</h3>
                <p style="margin:0;font-size:0.75rem;color:${coordOk?'#888':'#ccc'}">${coordOk?'📍 有坐标 · 可进详情':'📍 有坐标 · 可进详情'}</p>
            </div>
        </div>`;
    }).join('');
    
    // 省份经典组合方案
    const sampleOptions = [
        { name: provData.name + '经典精华 3天2晚', price: '¥1,599', desc: '必玩核心景点组合',
          includes: ['往返高铁', '三星级酒店', '景点门票', '旅行保险'] },
        { name: provData.name + '深度游 5天4晚', price: '¥2,399', desc: '深度体验当地文化与美食',
          includes: ['往返高铁', '四星级酒店', '景点门票', '特色美食', '旅行保险'] },
    ];
    const optionsHtml = sampleOptions.map((o,i) => `
        <div class="itinerary-day option-item" style="border-left-color:var(--accent);cursor:pointer;padding:10px 14px;margin-bottom:8px;border-radius:8px;background:#fafafa" onclick="showToast('${provData.name}方案详情即将上线，敬请期待！')">
            <div style="flex:1;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
                <div style="flex:1;min-width:200px">
                    <h4 style="margin:0 0 4px 0;font-size:0.95rem">${o.name}</h4>
                    <p style="margin:0;font-size:0.8rem;color:#888">${o.desc}</p>
                </div>
                <div style="text-align:right;flex-shrink:0">
                    <div style="color:var(--primary);font-weight:600;font-size:1rem">${o.price}</div>
                    <div style="font-size:0.75rem;color:#888">查看详情 →</div>
                </div>
            </div>
        </div>`).join('');
    
    modalBody.innerHTML = `
        <div class="modal-body">
            <h2 style="margin-bottom:4px">${provData.name}</h2>
            <div class="modal-subtitle" style="margin-bottom:12px">⭐ ${provData.rating} · ${provData.days} · ${provData.price}</div>
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 省份简介</h3>
                <p>${provData.desc}</p>
            </div>
            ${provMapHtml}
            <div class="modal-section">
                <h3><i class="fas fa-city"></i> 下辖 ${(provData.cities||[]).length} 个地级市</h3>
                <p style="font-size:0.85rem;color:#888;margin-bottom:12px">点击城市卡片进入详情（地图/行程/酒店/交通/美食全齐）</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">${citiesHtml}</div>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-list-alt"></i> 组合方案（多城玩更划算）</h3>
                <div>${optionsHtml}</div>
            </div>
            <div class="modal-price-box">
                <div>
                    <div class="price">${provData.price} <small>/人起</small></div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即咨询</a>
            </div>
        </div>
    `;
    
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 80);
}

function showProvinceOptionDetail(optionId) {
    const optDetail = (window.PROVINCE_OPTION_DETAIL || {})[optionId];
    if (!optDetail) { showToast('该方案详情即将上线'); return; }

    const itineraryHtml = optDetail.itinerary.map(item => `
        <div class="itinerary-day">
            <h4>${item.day} — ${item.title}</h4>
            <p>${item.desc}</p>
        </div>
    `).join('');

    modalBody.innerHTML = `
        <div class="modal-body">
            <h2>${optDetail.name}</h2>
            <div class="modal-subtitle">${optDetail.price}</div>
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 方案介绍</h3>
                <p>${optDetail.description}</p>
            </div>
            ${itineraryHtml}
            <div class="modal-section">
                <h3><i class="fas fa-check-circle"></i> 包含项目</h3>
                <p>${optDetail.includes.join(' · ')}</p>
            </div>
            <div class="modal-price-box">
                <div>
                    <div class="price">${optDetail.price} <small>/人起</small></div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即预订</a>
            </div>
        </div>
    `;
}


// ========== 动态城市富数据生成器（与青甘大环线同标准） ==========
window.generateCityRichData = function(cityKey, cityName, provinceName) {
    // === 优先级 1：已有富数据（CITY_DETAIL）===
    if (window.CITY_DETAIL && window.CITY_DETAIL[cityKey]) {
        return JSON.parse(JSON.stringify(window.CITY_DETAIL[cityKey]));
    }
    // === 优先级 2：PROVINCES_ALL 里有真实景点 itinerary ===
    let provCity = null;
    if (window.PROVINCES_ALL) {
        for (const p of window.PROVINCES_ALL) {
            const found = (p.cities || []).find(c => c.key === cityKey);
            if (found) { provCity = found; if (!provinceName) provinceName = p.name; break; }
        }
    }
    // === 优先级 3：destinationData ===
    let dd = null;
    if (window.destinationData && window.destinationData[cityKey]) {
        dd = window.destinationData[cityKey];
    }

    // === 真实景点名表（内嵌，兜底用）===
    var LM = {
        // 省级别名 → 代表性景点
        "hebei":["承德避暑山庄","山海关长城","西柏坡","赵州桥","野三坡"],
        "shanxi":["五台山","云冈石窟","平遥古城","晋祠","悬空寺"],
        "liaoning":["沈阳故宫","大连星海广场","千山","本溪水洞","红海滩"],
        "jilin":["长白山天池","伪满皇宫","长春电影城","雾凇岛","净月潭"],
        "heilongjiang":["哈尔滨冰雪大世界","中央大街","镜泊湖","五大连池","太阳岛"],
        "jiangsu":["中山陵","拙政园","瘦西湖","灵山大佛","徐州汉文化"],
        "zhejiang":["西湖","灵隐寺","千岛湖","乌镇","雁荡山"],
        "anhui":["黄山","宏村","西递","九华山","天柱山"],
        "fujian":["鼓浪屿","武夷山","三坊七巷","开元寺","太姥山"],
        "jiangxi":["庐山","滕王阁","三清山","婺源","鄱阳湖"],
        "shandong":["趵突泉","泰山","八大关","曲阜三孔","崂山"],
        "henan":["少林寺","龙门石窟","清明上河园","殷墟","白马寺"],
        "hubei":["黄鹤楼","东湖","武当山","三峡大坝","神农架"],
        "hunan":["岳麓书院","橘子洲","张家界","凤凰古城","衡山"],
        "guangdong":["陈家祠","世界之窗","丹霞山","开平碉楼","白云山"],
        "hainan":["亚龙湾","天涯海角","呀诺达","蜈支洲岛","南山"],
        "sichuan":["大熊猫基地","武侯祠","都江堰","九寨沟","峨眉山"],
        "guizhou":["黄果树","荔波小七孔","西江苗寨","梵净山","织金洞"],
        "yunnan":["丽江古城","玉龙雪山","洱海","苍山","石林"],
        "shaanxi":["秦始皇兵马俑","华山","大雁塔","回民街","壶口瀑布"],
        "gansu":["莫高窟","嘉峪关","鸣沙山月牙泉","张掖丹霞","麦积山"],
        "qinghai":["青海湖","茶卡盐湖","塔尔寺","可可西里","鸟岛"],
        "neimenggu":["呼伦贝尔草原","响沙湾","成吉思汗陵","额济纳胡杨林","阿尔山"],
        "guangxi":["漓江","阳朔西街","龙脊梯田","德天瀑布","涠洲岛"],
        "xizang":["布达拉宫","大昭寺","纳木错","珠穆朗玛","雅鲁藏布大峡谷"],
        "ningxia":["沙坡头","西夏王陵","贺兰山","水洞沟","镇北堡影城"],
        "xinjiang":["天山天池","喀纳斯湖","吐鲁番","那拉提草原","帕米尔高原"],
        "taiwan":["阿里山","日月潭","台北101","垦丁","九份"],
        "xianggang":["维多利亚港","迪士尼","太平山顶","星光大道","天星小轮"],
        "aomen":["大三巴牌坊","澳门威尼斯人","官也街","澳门塔","妈阁庙"],
    };
    // 找这个城市/省份的真实景点名
    function getCityLandmarks(cityKey, cityName, provinceKey) {
        var known = {
                        "石家庄": ["西柏坡","赵州桥","隆兴寺","正定古城","天桂山","苍岩山"],
            "唐山": ["清东陵", "月坨岛", "唐山抗震纪念馆"],
            "秦皇岛": ["山海关", "北戴河", "鸽子窝公园"],
            "邯郸": ["广府古城", "响堂山石窟", "丛台公园"],
            "邢台": ["邢台大峡谷", "开元古寺", "云梦山"],
            "保定": ["白洋淀", "直隶总督署", "野三坡"],
            "张家口": ["草原天路", "鸡鸣驿古城", "坝上草原"],
            "承德": ["避暑山庄", "外八庙", "塞罕坝"],
            "沧州": ["沧州铁狮子", "吴桥杂技大世界", "南大港湿地"],
            "廊坊": ["天下第一城", "廊坊茶文化街"],
            "衡水": ["衡水湖", "景州塔", "武强年画博物馆"],
                        "太原": ["晋祠","双塔寺","山西博物院","乔家大院","平遥古城","绵山"],
            "大同": ["云冈石窟", "悬空寺", "大同古城墙"],
            "阳泉": ["娘子关", "藏山", "固关长城"],
            "长治": ["太行山大峡谷", "皇城相府", "太行水乡"],
            "晋城": ["王莽岭", "锡崖沟", "晋城博物馆"],
            "朔州": ["应县木塔", "崇福寺", "朔州老城"],
            "晋中": ["平遥古城", "乔家大院", "绵山"],
            "运城": ["运城盐湖", "解州关帝庙", "鹳雀楼"],
            "忻州": ["五台山", "雁门关", "芦芽山"],
            "临汾": ["壶口瀑布", "洪洞大槐树", "尧庙"],
            "吕梁": ["北武当山", "庞泉沟", "碛口古镇"],
                        "呼和浩特": ["大召寺","昭君墓","内蒙古博物院","成吉思汗陵","响沙湾","辉腾锡勒草原"],
            "包头": ["希拉穆仁草原", "五当召", "包头博物馆"],
            "乌海": ["乌海湖", "金沙湾", "桌子山"],
            "赤峰": ["克什克腾草原", "玉龙沙湖", "贡格尔草原"],
            "通辽": ["大青沟", "孝庄园", "奈曼旗怪柳"],
            "鄂尔多斯": ["响沙湾", "成吉思汗陵", "库布齐沙漠"],
            "呼伦贝尔": ["呼伦贝尔草原", "满洲里", "额尔古纳"],
            "巴彦淖尔": ["乌梁素海", "阴山岩画", "纳林湖"],
            "乌兰察布": ["辉腾锡勒草原", "岱海", "格根塔拉草原"],
            "兴安盟": ["阿尔山森林公园", "成吉思汗庙", "哈拉哈河"],
            "锡林郭勒盟": ["锡林郭勒草原", "贝子庙", "元上都"],
            "阿拉善盟": ["额济纳胡杨林", "巴丹吉林沙漠", "贺兰山"],
                        "沈阳": ["沈阳故宫","张氏帅府","棋盘山","北陵公园","东陵","棋盘山"],
            "大连": ["大连星海广场", "老虎滩海洋公园", "金石滩"],
            "鞍山": ["千山", "玉佛苑", "汤岗子温泉"],
            "抚顺": ["抚顺皇家极地海洋世界", "赫图阿拉城", "雷锋纪念馆"],
            "本溪": ["本溪水洞", "五女山", "桓仁大峡谷"],
            "丹东": ["鸭绿江断桥", "凤凰山", "河口桃花岛"],
            "锦州": ["笔架山", "辽沈战役纪念馆", "医巫闾山"],
            "营口": ["鲅鱼圈", "白沙湾", "营口辽河老街"],
            "阜新": ["海棠山", "瑞应寺", "阜新大青沟"],
            "辽阳": ["辽阳白塔", "广佑寺", "东京陵"],
            "盘锦": ["红海滩", "鼎翔生态旅游区", "盘锦湿地"],
            "铁岭": ["龙首山", "象牙山", "调兵山蒸汽机车"],
            "朝阳": ["凤凰山", "鸟化石国家地质公园", "牛河梁"],
            "葫芦岛": ["兴城古城", "菊花岛", "九门口水上长城"],
                        "长春": ["伪满皇宫博物院","长春电影世纪城","净月潭","长春电影世纪城","北湖公园","一汽红旗"],
            "吉林": ["长白山天池", "雾凇岛", "吉林北山公园"],
            "四平": ["四平战役纪念馆", "叶赫那拉古城", "山门水库"],
            "辽源": ["东丰梅花鹿园", "龙山公园", "辽源矿工墓"],
            "通化": ["杨靖宇陵园", "龙湾国家森林公园", "千叶湖"],
            "白山": ["长白山南坡", "望天鹅景区", "白山湖"],
            "松原": ["查干湖", "松原龙坑", "前郭尔罗斯草原"],
            "白城": ["向海湿地", "莫莫格保护区", "洮儿河"],
            "延边朝鲜族自治州": ["长白山北坡", "延吉图们江", "朝鲜族民俗村"],
                        "哈尔滨": ["冰雪大世界","中央大街","索菲亚教堂","太阳岛","雪乡","老道外"],
            "齐齐哈尔": ["扎龙自然保护区", "龙沙公园", "齐齐哈尔博物馆"],
            "鸡西": ["兴凯湖", "虎头要塞", "珍宝岛"],
            "鹤岗": ["名山岛", "太平沟", "兴山峡谷"],
            "双鸭山": ["七星峰", "安邦河湿地", "双鸭山博物馆"],
            "大庆": ["铁人王进喜纪念馆", "大庆油田", "林甸温泉"],
            "伊春": ["汤旺河国家公园", "五营森林", "兴安森林公园"],
            "佳木斯": ["三江口", "赫哲族渔村", "佳木斯博物馆"],
            "七台河": ["桃山水库", "西大圈森林公园"],
            "牡丹江": ["镜泊湖", "威虎山", "横道河子"],
            "黑河": ["五大连池", "瑷珲古城", "黑龙江中俄界江"],
            "绥化": ["绥化森林公园", "望奎植物园", "绥化博物馆"],
            "大兴安岭地区": ["北极村", "北红村", "龙江第一湾"],
                        "南京": ["中山陵","夫子庙","总统府","玄武湖","雨花台","南京博物院"],
            "无锡": ["灵山大佛", "鼋头渚", "惠山古镇"],
            "徐州": ["徐州云龙山", "汉画像石馆", "狮子山楚王陵"],
            "常州": ["天目湖", "天宁寺", "中华恐龙园"],
                        "苏州": ["拙政园","虎丘","观前街","周庄","金鸡湖","甪直"],
            "南通": ["南通濠河", "狼山", "南通博物苑"],
            "连云港": ["花果山", "连岛海滨", "渔湾"],
            "淮安": ["周恩来纪念馆", "洪泽湖", "里运河文化长廊"],
            "盐城": ["大丰麋鹿保护区", "丹顶鹤湿地", "荷兰花海"],
            "扬州": ["瘦西湖", "个园", "东关街"],
            "镇江": ["镇江三山", "西津渡古街", "茅山"],
            "泰州": ["溱湖湿地", "望海楼", "泰州老街"],
            "宿迁": ["项王故里", "骆马湖", "三台山"],
                        "杭州": ["西湖","灵隐寺","千岛湖","西溪湿地","宋城","龙井村"],
            "宁波": ["天一阁", "东钱湖", "老外滩"],
            "温州": ["雁荡山", "楠溪江", "江心屿"],
            "嘉兴": ["乌镇", "南湖", "西塘"],
            "湖州": ["南浔古镇", "莫干山", "太湖旅游度假区"],
            "绍兴": ["鲁迅故里", "兰亭", "沈园"],
            "金华": ["横店影视城", "金华双龙洞", "诸葛八卦村"],
            "衢州": ["江郎山", "廿八都古镇", "衢州博物馆"],
            "舟山": ["普陀山", "朱家尖", "嵊泗列岛"],
            "台州": ["神仙居", "临海古城", "方山"],
            "丽水": ["古堰画乡", "云和梯田", "仙都"],
                        "合肥": ["三河古镇","巢湖","李鸿章故居","大蜀山","包公园","渡江战役纪念馆"],
            "芜湖": ["方特欢乐世界", "鸠兹古镇", "芜湖古城"],
            "蚌埠": ["蚌埠龙子湖", "张公山公园", "双墩文化遗址"],
            "淮南": ["八公山", "寿县古城", "豆腐文化产业园"],
            "马鞍山": ["采石矶", "濮塘", "马鞍山博物馆"],
            "淮北": ["相山公园", "南湖湿地公园", "柳孜隋唐大运河"],
            "铜陵": ["铜陵天井湖", "铜官山", "凤凰山"],
            "安庆": ["天柱山", "迎江寺", "桐城文庙"],
                        "黄山": ["黄山风景区","宏村","西递","屯溪老街","翡翠谷","齐云山"],
            "滁州": ["琅琊山", "醉翁亭", "明中都"],
            "阜阳": ["颍州西湖", "管仲祠", "八里河"],
            "宿州": ["皇藏峪", "宿州博物馆", "陈胜吴广起义旧址"],
            "六安": ["天堂寨", "万佛湖", "大别山主峰"],
            "亳州": ["曹操运兵道", "花戏楼", "老子故里"],
            "池州": ["九华山", "平天湖", "杏花村"],
            "宣城": ["敬亭山", "龙川胡氏宗祠", "太极洞"],
                        "福州": ["三坊七巷","鼓山","上下杭","平潭岛","青云山","福州国家森林公园"],
                        "厦门": ["鼓浪屿","厦门大学","环岛路","曾厝垵","南普陀寺","火山岛"],
            "莆田": ["湄洲岛妈祖庙", "九鲤湖", "广化寺"],
            "三明": ["泰宁丹霞", "尤溪联合梯田", "沙县小吃文化城"],
            "泉州": ["开元寺", "清源山", "西街蟳埔村"],
            "漳州": ["南靖土楼", "东山岛", "火山岛"],
            "南平": ["武夷山", "延平溪源峡谷", "邵武和平古镇"],
            "龙岩": ["客家土楼", "冠豸山", "古田会议旧址"],
            "宁德": ["太姥山", "霞浦滩涂", "白水洋"],
                        "南昌": ["滕王阁","八一广场","南昌汉代海昏侯墓","八一起义纪念馆","鄱阳湖","南昌之星"],
            "景德镇": ["古窑民俗博览区", "陶溪川文创区", "瑶里古镇"],
            "萍乡": ["武功山", "孽龙洞", "安源煤矿"],
            "九江": ["庐山", "浔阳楼", "鄱阳湖"],
            "新余": ["仙女湖", "蒙山", "分宜古城"],
            "鹰潭": ["龙虎山", "嗣汉天师府", "泸溪河"],
            "赣州": ["通天岩", "八境台", "郁孤台"],
            "吉安": ["井冈山", "文天祥纪念馆", "武功江西坡"],
            "宜春": ["明月山", "温汤温泉", "禅都文化博览园"],
            "抚州": ["流坑古村", "大觉山", "梦湖"],
            "上饶": ["三清山", "婺源", "弋阳龟峰"],
                        "济南": ["趵突泉","大明湖","千佛山","泉城广场","黑虎泉","芙蓉街"],
                        "青岛": ["栈桥","八大关","崂山","金沙滩","五四广场","啤酒博物馆"],
            "淄博": ["齐文化博物馆", "中国陶瓷馆", "周村古商城"],
            "枣庄": ["台儿庄古城", "微山湖湿地", "抱犊崮"],
            "东营": ["黄河入海口", "孙子文化园", "龙悦湖"],
            "烟台": ["蓬莱阁", "烟台山", "养马岛"],
            "潍坊": ["青州古城", "风筝博物馆", "云门山"],
            "济宁": ["曲阜三孔", "微山湖", "水泊梁山"],
            "泰安": ["泰山", "岱庙", "泰安方特"],
            "威海": ["刘公岛", "成山头", "环翠楼"],
            "日照": ["万平口海滨", "刘家湾赶海", "日照国家森林公园"],
            "临沂": ["王羲之故居", "沂蒙山", "中华影视基地"],
            "德州": ["德州太阳谷", "董子园", "泉城海洋极地世界"],
            "聊城": ["东昌湖", "光岳楼", "东阿阿胶城"],
            "滨州": ["黄河三角洲", "魏集古村落", "孙子兵法城"],
            "菏泽": ["牡丹园", "曹州书画院", "水浒好汉城"],
                        "郑州": ["少林寺","清明上河园","河南博物院","龙门石窟","云台山","二七纪念塔"],
            "开封": ["清明上河园", "开封府", "龙亭公园"],
            "洛阳": ["龙门石窟", "白马寺", "关林庙"],
            "平顶山": ["尧山", "中原大佛", "二郎山"],
            "安阳": ["殷墟", "红旗渠", "太行大峡谷"],
            "鹤壁": ["云梦山", "大伾山", "古灵山"],
            "新乡": ["八里沟", "万仙山", "比干庙"],
            "焦作": ["云台山", "青天河", "陈家沟太极拳"],
            "濮阳": ["濮上园", "中华龙文化博物馆", "戚城遗址"],
            "许昌": ["曹魏古城", "鄢陵花博园", "春秋楼"],
            "漯河": ["南街村", "许慎文化园", "漯河沙澧河"],
            "三门峡": ["三门峡大坝", "天鹅湖", "仰韶大峡谷"],
            "南阳": ["南阳武侯祠", "西峡恐龙园", "医圣祠"],
            "商丘": ["商丘古城", "芒砀山", "汉梁王墓"],
            "信阳": ["鸡公山", "南湾湖", "大苏山"],
            "周口": ["周口店猿人遗址", "鹿邑老子故里", "淮阳太昊陵"],
            "驻马店": ["嵖岈山", "薄山湖", "竹沟革命纪念馆"],
            "济源": ["王屋山", "小浪底", "五龙口"],
                        "武汉": ["黄鹤楼","东湖","户部巷","湖北省博","长江大桥","昙华林"],
            "黄石": ["仙岛湖", "东方山", "大冶雷山"],
            "十堰": ["武当山", "神农架", "丹江口大坝"],
            "宜昌": ["三峡大坝", "屈原故里", "清江画廊"],
            "襄阳": ["古隆中", "襄阳古城墙", "米公祠"],
            "鄂州": ["鄂州莲花山", "鄂州西山", "梁子岛"],
            "荆门": ["明显陵", "荆门龙泉公园", "鸳鸯溪"],
            "孝感": ["孝感双峰山", "董永公园", "天紫湖"],
            "荆州": ["荆州古城", "荆州博物馆", "纪南城"],
            "黄冈": ["大别山天堂寨", "东坡赤壁", "薄刀峰"],
            "咸宁": ["赤壁古战场", "九宫山", "隐水洞"],
            "随州": ["神农故里", "大洪山", "银杏谷"],
            "恩施土家族苗族自治州": ["恩施大峡谷", "腾龙洞", "屏山峡谷"],
                        "长沙": ["岳麓山","橘子洲","太平老街","湖南省博","坡子街","IFS国金中心"],
            "株洲": ["炎帝陵", "株洲方特", "酒埠江"],
            "湘潭": ["韶山", "毛泽东故居", "湘潭盘龙大观园"],
            "衡阳": ["南岳衡山", "石鼓书院", "东洲岛"],
            "邵阳": ["崀山", "南山牧场", "虎形山"],
            "岳阳": ["岳阳楼", "洞庭湖君山", "屈子祠"],
            "常德": ["桃花源", "武陵源", "柳叶湖"],
                        "张家界": ["武陵源","天门山","玻璃栈道","大峡谷","袁家界","金鞭溪"],
            "益阳": ["益阳桃花江", "奥林匹克公园", "鱼形湖"],
            "郴州": ["东江湖", "莽山", "高椅岭"],
            "永州": ["九嶷山", "阳明山", "柳子庙"],
            "怀化": ["洪江古商城", "通道万佛山", "芷江受降纪念坊"],
            "娄底": ["梅山龙宫", "紫鹊界梯田", "大熊山"],
            "湘西土家族苗族自治州": ["凤凰古城", "沱江", "沈从文故居"],
                        "广州": ["陈家祠","广州塔","上下九北京路","沙面","珠江夜游","越秀公园"],
            "韶关": ["丹霞山", "南华寺", "南岭森林公园"],
                        "深圳": ["世界之窗","锦绣中华","莲花山","深圳湾","欢乐谷","东部华侨城"],
            "珠海": ["情侣路", "长隆海洋王国", "外伶仃岛"],
            "汕头": ["南澳岛", "老城骑楼", "礐石风景区"],
            "佛山": ["祖庙", "西樵山", "岭南天地"],
            "江门": ["开平碉楼", "圭峰山", "小鸟天堂"],
            "湛江": ["湖光岩", "东海岛", "特呈岛"],
            "茂名": ["放鸡岛", "中国第一滩", "仙人洞"],
            "肇庆": ["七星岩", "鼎湖山", "宋城墙"],
            "惠州": ["巽寮湾", "双月湾", "罗浮山"],
            "梅州": ["客家围龙屋", "雁南飞茶园", "叶剑英故居"],
            "汕尾": ["红海湾", "凤山祖庙", "玄武山"],
            "河源": ["万绿湖", "镜花缘", "巴伐利亚庄园"],
            "阳江": ["海陵岛", "大角湾", "十里银滩"],
            "清远": ["清远漂流", "连州地下河", "英德宝晶宫"],
            "东莞": ["鸦片战争博物馆", "松山湖", "可园"],
            "中山": ["孙中山故居", "中山詹园", "长江水世界"],
            "潮州": ["广济桥", "牌坊街", "开元寺"],
            "揭阳": ["揭阳楼", "黄岐山", "阳美玉都"],
            "云浮": ["龙母祖庙", "新兴温泉", "六祖惠能故居"],
                        "南宁": ["青秀山","大明山","扬美古镇","德天瀑布","通灵大峡谷","龙脊梯田"],
            "柳州": ["柳江", "龙潭公园", "三江侗族自治县"],
                        "桂林": ["漓江","阳朔西街","龙脊梯田","遇龙河","象鼻山","两江四湖"],
            "梧州": ["梧州骑楼城", "石表山", "梧州中山公园"],
            "北海": ["涠洲岛", "银滩", "北海老街"],
            "防城港": ["白浪滩", "十万大山", "东兴京岛"],
            "钦州": ["钦州三娘湾", "刘永福故居", "八寨沟"],
            "贵港": ["桂平西山", "金田起义旧址", "大藤峡"],
            "玉林": ["大容山", "云天民俗文化城", "真武阁"],
            "百色": ["德天瀑布", "通灵大峡谷", "百色起义纪念馆"],
            "贺州": ["贺州黄姚古镇", "姑婆山", "十八水"],
            "河池": ["巴马长寿村", "大化七百弄", "刘三姐故里"],
            "来宾": ["圣堂山", "百崖大峡谷", "来宾盘古公园"],
            "崇左": ["德天瀑布", "明仕田园", "友谊关"],
                        "海口": ["骑楼老街","火山口公园","假日海滩","万绿园","博鳌","冯小刚电影公社"],
                        "三亚": ["亚龙湾","天涯海角","蜈支洲岛","南山","大东海","崖州湾"],
            "三沙": ["西沙群岛", "永兴岛", "七连屿"],
            "儋州": ["石花水洞", "儋州东坡书院", "中和古镇"],
                        "成都": ["大熊猫基地","武侯祠","宽窄巷子","都江堰","青城山","锦里"],
            "自贡": ["恐龙博物馆", "自贡盐业历史博物馆", "荣县大佛"],
            "攀枝花": ["二滩水电站", "格萨拉生态旅游区", "红格温泉"],
            "泸州": ["泸州老窖旅游区", "泸州古镇", "黄荆老林"],
            "德阳": ["三星堆", "孔庙", "德阳文庙"],
            "绵阳": ["越王楼", "药王谷", "窦圌山"],
            "广元": ["剑门关", "昭化古城", "皇泽寺"],
            "遂宁": ["观音湖", "大英死海", "广德寺"],
            "内江": ["张大千纪念馆", "隆昌石牌坊", "圣水寺"],
                        "乐山": ["乐山大佛","峨眉山","报国寺","金顶","大佛禅院","苏稽古镇"],
            "南充": ["阆中古城", "朱德故居", "凌云山"],
            "眉山": ["三苏祠", "瓦屋山", "柳江古镇"],
            "宜宾": ["宜宾蜀南竹海", "五粮液旅游区", "李庄古镇"],
            "广安": ["邓小平故居", "华蓥山", "思源广场"],
            "达州": ["真佛山", "铁山森林公园", "莲花湖"],
            "雅安": ["碧峰峡", "牛背山", "上里古镇"],
            "巴中": ["光雾山", "诺水河", "平昌湿地公园"],
            "资阳": ["安岳石刻", "圆觉洞", "陈毅故居"],
            "阿坝藏族羌族自治州": ["九寨沟", "黄龙", "若尔盖"],
            "甘孜藏族自治州": ["稻城亚丁", "康定", "海螺沟"],
            "凉山彝族自治州": ["泸沽湖", "邛海", "螺髻山"],
                        "贵阳": ["甲秀楼","花溪公园","黔灵山","黄果树瀑布","荔波小七孔","千户苗寨"],
            "六盘水": ["乌蒙大草原", "妥乐古银杏", "大河堡"],
            "遵义": ["遵义会议会址", "赤水丹霞", "娄山关"],
            "安顺": ["黄果树瀑布", "龙宫", "屯堡文化"],
            "毕节": ["百里杜鹃", "织金洞", "威宁草海"],
            "铜仁": ["梵净山", "铜仁大峡谷", "思南石林"],
            "黔西南布依族苗族自治州": ["马岭河峡谷", "万峰林", "双乳峰"],
            "黔东南苗族侗族自治州": ["西江千户苗寨", "镇远古镇", "荔波小七孔"],
            "黔南布依族苗族自治州": ["荔波大小七孔", "斗篷山", "瑶山"],
                        "昆明": ["石林","滇池","翠湖","九乡溶洞","民族村","大观楼"],
            "曲靖": ["罗平油菜花", "九龙瀑布", "珠江源"],
            "玉溪": ["抚仙湖", "禄充风景区", "聂耳故居"],
            "保山": ["腾冲地热火山", "和顺古镇", "槟榔江"],
            "昭通": ["大山包", "豆沙关", "昭通古城"],
                        "丽江": ["大研古城","玉龙雪山","束河古镇","拉市海","泸沽湖","蓝月谷"],
            "普洱": ["茶马古道", "勐梭龙潭", "菜阳河森林公园"],
            "临沧": ["翁丁原始部落", "沧源崖画", "南滚河"],
            "楚雄彝族自治州": ["彝人古镇", "元谋土林", "黑井古镇"],
            "红河哈尼族彝族自治州": ["元阳梯田", "建水古城", "河口"],
            "文山壮族苗族自治州": ["普者黑", "坝美", "八宝"],
            "西双版纳傣族自治州": ["西双版纳植物园", "野象谷", "傣族园"],
            "大理白族自治州": ["洱海", "苍山", "大理古城"],
            "德宏傣族景颇族自治州": ["瑞丽姐告", "芒市勐焕大金塔", "梁河葫芦丝"],
            "怒江傈僳族自治州": ["怒江大峡谷", "独龙江", "丙中洛"],
            "迪庆藏族自治州": ["香格里拉", "普达措", "梅里雪山"],
                        "西安": ["兵马俑","大雁塔","回民街","华清池","古城墙","华山"],
            "铜川": ["照金牧场", "药王山大香山", "铜川博物馆"],
            "宝鸡": ["法门寺", "太白山", "关山草原"],
            "咸阳": ["茂陵", "乾陵", "汉阳陵"],
            "渭南": ["华山", "西岳庙", "司马迁祠"],
            "延安": ["壶口瀑布", "延安革命纪念馆", "黄帝陵"],
            "汉中": ["汉中武侯祠", "朱鹮梨园", "石门栈道"],
            "榆林": ["榆林古城", "响沙湾", "镇北台"],
            "安康": ["瀛湖", "南宫山", "岚河漂流"],
            "商洛": ["金丝峡", "牛背梁", "棣花古镇"],
                        "兰州": ["黄河母亲雕塑","中山铁桥","白塔山","黄河石林","兴隆山","甘肃省博"],
            "嘉峪关": ["嘉峪关关城", "长城第一墩", "悬臂长城"],
            "金昌": ["金昌骊靬古城", "圣容寺", "皇城草原"],
            "白银": ["景泰黄河石林", "会宁红军会师楼", "白银火焰山"],
            "天水": ["麦积山石窟", "伏羲庙", "南郭寺"],
            "武威": ["雷台汉墓", "文庙", "凉州会盟纪念馆"],
            "张掖": ["张掖丹霞", "大佛寺", "祁连山"],
            "平凉": ["崆峒山", "王母宫", "龙泉寺"],
            "酒泉": ["鸣沙山月牙泉", "莫高窟", "雅丹魔鬼城"],
            "庆阳": ["庆阳周祖陵", "南梁红色景区", "马岭河"],
            "定西": ["定西贵清山", "遮阳山", "通渭温泉"],
            "陇南": ["武都万象洞", "官鹅沟", "文县天池"],
            "临夏回族自治州": ["炳灵寺石窟", "八坊十三巷", "东公馆"],
            "甘南藏族自治州": ["夏河拉卜楞寺", "尕海湖", "郎木寺"],
                        "西宁": ["塔尔寺","青海湖","茶卡盐湖","祁连山","东关清真大寺","藏文化博物馆"],
            "海东": ["互助土族故土园", "循化撒拉族家园", "平安驿"],
            "海北藏族自治州": ["门源花海", "祁连山草原", "原子城"],
            "黄南藏族自治州": ["同仁热贡艺术", "尖扎坎布拉", "李家峡"],
            "海南藏族自治州": ["共和龙羊峡", "贵德黄河源头", "同德"],
            "果洛藏族自治州": ["年保玉则", "黄河源头", "扎陵湖鄂陵湖"],
            "玉树藏族自治州": ["玉树新寨", "结古寺", "可可西里"],
            "海西蒙古族藏族自治州": ["德令哈外星人遗址", "格尔木察尔汗盐湖", "茶卡盐湖"],
                        "银川": ["沙坡头","西夏王陵","贺兰山岩画","水洞沟","镇北堡西部影城","南关清真大寺"],
            "石嘴山": ["沙湖", "北武当", "平罗玉皇阁"],
            "吴忠": ["吴忠黄河大峡谷", "青铜峡", "董府"],
            "固原": ["六盘山", "老龙潭", "须弥山石窟"],
            "中卫": ["沙坡头", "通湖草原", "腾格里沙漠"],
                        "乌鲁木齐": ["天山天池","国际大巴扎","新疆维吾尔自治区博物馆","喀纳斯","红山公园","水磨沟公园"],
            "克拉玛依": ["克拉玛依魔鬼城", "黑油山", "艾里克湖"],
            "吐鲁番": ["葡萄沟", "火焰山", "坎儿井"],
            "哈密": ["哈密回王府", "巴里坤草原", "大海道"],
            "昌吉回族自治州": ["天山天池", "南山牧场", "江布拉克"],
            "博尔塔拉蒙古自治州": ["赛里木湖", "阿拉山口", "哈日图热格"],
            "巴音郭楞蒙古自治州": ["巴音布鲁克", "博斯腾湖", "罗布人村寨"],
            "阿克苏地区": ["克孜尔千佛洞", "库车大峡谷", "温宿大峡谷"],
            "克孜勒苏柯尔克孜自治州": ["喀拉库勒湖", "慕士塔格峰", "石头城"],
            "喀什地区": ["喀什噶尔老城", "艾提尕尔清真寺", "卡拉库里湖"],
            "和田地区": ["和田玉河", "玉龙喀什河", "尼雅遗址"],
            "伊犁哈萨克自治州": ["那拉提草原", "伊宁喀赞其", "赛里木湖"],
            "塔城地区": ["塔城巴尔鲁克山", "小白杨哨所", "吐尔加辽"],
            "阿勒泰地区": ["喀纳斯", "禾木村", "可可托海"],
            "香港岛": ["维多利亚港", "太平山顶", "中环"],
            "九龙": ["星光大道", "尖沙咀", "香港博物馆"],
            "新界": ["迪士尼乐园", "新界大埔", "沙田赛马场"],
            "澳门半岛": ["大三巴牌坊", "澳门威尼斯人", "官也街"],
            "氹仔": ["澳门大学", "氹仔官也街", "龙环葡韵"],
            "路环": ["路环黑沙滩", "妈祖神像", "安德鲁饼店"],
                        "台北": ["台北101","西门町","阳明山","中正纪念堂","士林夜市","永康街"],
            "新北": ["九份", "十分放天灯", "乌来温泉"],
            "桃园": ["桃园国际机场", "大溪老街", "慈湖"],
            "台中": ["日月潭", "高美湿地", "台中国家歌剧院"],
            "台南": ["赤崁楼", "安平古堡", "台南孔庙"],
            "高雄": ["垦丁国家公园", "西子湾", "六合夜市"],
            "基隆": ["九份", "基隆港", "庙口夜市"],
            "新竹": ["新竹清华大学", "内湾老街", "六福村"],
            "嘉义": ["阿里山", "奋起湖", "嘉义文化路"],
                        "拉萨": ["布达拉宫","大昭寺","纳木错","羊卓雍措","色拉寺","哲蚌寺"],
            "日喀则": ["扎什伦布寺", "珠峰大本营", "羊卓雍错"],
            "昌都": ["然乌湖", "强巴林寺", "来古冰川"],
            "林芝": ["巴松措", "雅鲁藏布大峡谷", "鲁朗林海"],
            "山南": ["雍布拉康", "桑耶寺", "雅砻河谷"],
            "那曲": ["那曲草原", "纳木错北岸", "羌塘无人区"],
            "阿里地区": ["冈仁波齐", "玛旁雍错", "古格王朝遗址"],
            // 短名别名（province-data-all.js 用短名 known dict 用长名，两边都加确保匹配）
            "延边": ["长白山北坡", "延吉图们江", "朝鲜族民俗村"],
            "阿克苏": ["克孜尔千佛洞", "库车大峡谷", "温宿大峡谷"],
            "喀什": ["喀什噶尔老城", "艾提尕尔清真寺", "卡拉库里湖"],
            "和田": ["和田玉河", "玉龙喀什河", "尼雅遗址"],
            "伊犁": ["那拉提草原", "伊宁喀赞其", "赛里木湖"],
            "塔城": ["塔城巴尔鲁克山", "小白杨哨所", "吐尔加辽"],
            "阿勒泰": ["喀纳斯", "禾木村", "可可托海"],
            // 云南短名别名（province-data-all.js 用短名 known dict 用长名）
            "楚雄": ["彝人古镇", "元谋土林", "黑井古镇"],
            "红河": ["元阳梯田", "建水古城", "河口"],
            "文山": ["普者黑", "坝美", "八宝"],
                        "西双版纳": ["西双版纳植物园","野象谷","傣族园","望天树","曼听公园","傣族村寨"],
                        "大理": ["洱海","苍山","大理古城","双廊古镇","喜洲古镇","崇圣寺三塔"],
            "德宏": ["瑞丽姐告", "芒市勐焕大金塔", "梁河葫芦丝"],
            "怒江": ["怒江大峡谷", "独龙江", "丙中洛"],
            "迪庆": ["香格里拉", "普达措", "梅里雪山"],

        
            "北京": ["前门","天安门","故宫","景山","什刹海","南锣鼓巷"],
        
            "上海": ["外滩","陆家嘴","东方明珠","豫园","南京路","田子坊"],
        
            "重庆": ["洪崖洞","解放碑","磁器口","长江索道","李子坝轻轨","鹅岭二厂"],
        
            "黄果树": ["黄果树瀑布","陡坡塘","天星桥","龙宫","屯堡","天龙屯堡"],
        
            "敦煌": ["莫高窟","鸣沙山","月牙泉","玉门关","雅丹魔鬼城","沙洲夜市"],
        
            "九寨沟": ["九寨沟","黄龙","牟尼沟","甲蕃古城","五花海","珍珠滩"],
        
            "香港": ["太平山顶","尖沙咀","中环","迪士尼","铜锣湾","维多利亚港"],
        
            "澳门": ["大三巴牌坊","澳门威尼斯人","官也街","妈祖阁","葡京酒店","恋爱巷"],
        
            "北京": ["前门","天安门","故宫","景山","颐和园","圆明园","鸟巢","天坛","什刹海","八达岭长城"],
        
            "上海": ["外滩","陆家嘴","东方明珠","豫园","南京路","田子坊","迪士尼","上海中心"],
        
            "重庆": ["洪崖洞","解放碑","磁器口","长江索道","李子坝轻轨","鹅岭二厂","武隆天坑","白帝城"],
        
            "黄果树": ["黄果树瀑布","陡坡塘","天星桥","龙宫","屯堡","天龙屯堡","织金洞","百里杜鹃"],
        
            "敦煌": ["莫高窟","鸣沙山","月牙泉","玉门关","雅丹魔鬼城","沙洲夜市","莫高窟数字展示中心","雷音寺"],
        
            "九寨沟": ["九寨沟","黄龙","牟尼沟","甲蕃古城","五花海","珍珠滩","五彩池","诺日朗瀑布"],
        
            "石家庄": ["西柏坡","赵州桥","隆兴寺","正定古城","天桂山","苍岩山","嶂石岩","驼梁"],
        
            "太原": ["晋祠","双塔寺","山西博物院","乔家大院","平遥古城","绵山","应县木塔","雁门关"],
        
            "呼和浩特": ["大召寺","昭君墓","内蒙古博物院","成吉思汗陵","响沙湾","辉腾锡勒草原","希拉穆仁草原","五当召"],
        
            "沈阳": ["沈阳故宫","张氏帅府","棋盘山","北陵公园","东陵","棋盘山","辽宁博物馆","中街"],
        
            "长春": ["伪满皇宫博物院","长春电影城","净月潭","长春电影世纪城","北湖公园","一汽红旗","伪满八大部","般若寺"],
        
            "哈尔滨": ["冰雪大世界","中央大街","圣索菲亚教堂","太阳岛","雪乡","老道外","果戈里大街","东北虎林园"],
        
            "南京": ["中山陵","夫子庙","总统府","玄武湖","雨花台","南京博物院","明孝陵","老门东"],
        
            "苏州": ["拙政园","虎丘","观前街","周庄","金鸡湖","甪直","狮子林","平江路"],
        
            "杭州": ["西湖","灵隐寺","千岛湖","西溪湿地","宋城","龙井村","雷峰塔","杭州博物馆"],
        
            "合肥": ["三河古镇","巢湖","李鸿章故居","大蜀山","包公园","渡江战役纪念馆","安徽省博物馆","三河古镇"],
        
            "黄山": ["黄山风景区","宏村","西递","屯溪老街","翡翠谷","齐云山","呈坎","唐模"],
        
            "福州": ["三坊七巷","鼓山","上下杭","平潭岛","青云山","福州国家森林公园","罗源湾海洋世界","马尾船政"],
        
            "厦门": ["鼓浪屿","厦门大学","环岛路","曾厝垵","南普陀寺","火山岛","集美鳌园","同安影视城"],
        
            "南昌": ["滕王阁","八一广场","南昌汉代海昏侯墓","八一起义纪念馆","鄱阳湖","南昌之星","绳金塔","厚田沙漠"],
        
            "济南": ["趵突泉","大明湖","千佛山","泉城广场","黑虎泉","芙蓉街","灵岩寺","红叶谷"],
        
            "青岛": ["栈桥","八大关","崂山","金沙滩","五四广场","啤酒博物馆","小鱼山","信号山"],
        
            "郑州": ["少林寺","清明上河园","河南博物院","龙门石窟","云台山","二七纪念塔","开封府","包公祠"],
        
            "武汉": ["黄鹤楼","东湖","户部巷","湖北省博","长江大桥","昙华林","归元寺","古琴台"],
        
            "长沙": ["岳麓山","橘子洲","太平老街","湖南省博","坡子街","IFS国金中心","湖南第一师范","天心阁"],
        
            "张家界": ["武陵源","天门山","玻璃栈道","大峡谷","袁家界","金鞭溪","十里画廊","黄龙洞"],
        
            "广州": ["陈家祠","广州塔","上下九北京路","沙面","珠江夜游","越秀公园","白云山","莲花山"],
        
            "深圳": ["世界之窗","锦绣中华","莲花山","深圳湾","欢乐谷","东部华侨城","大梅沙","马峦山"],
        
            "南宁": ["青秀山","大明山","扬美古镇","德天瀑布","通灵大峡谷","龙脊梯田","伊岭岩","青秀山"],
        
            "海口": ["骑楼老街","火山口公园","假日海滩","万绿园","博鳌","冯小刚电影公社","东寨港红树林","海口骑楼老街"],
        
            "三亚": ["亚龙湾","天涯海角","蜈支洲岛","南山","大东海","崖州湾","亚龙湾热带天堂森林公园","南湾猴岛"],
        
            "成都": ["大熊猫基地","武侯祠","宽窄巷子","都江堰","青城山","锦里","杜甫草堂","青羊宫"],
        
            "乐山": ["乐山大佛","峨眉山","报国寺","金顶","大佛禅院","苏稽古镇","东方佛都","嘉阳小火车"],
        
            "贵阳": ["甲秀楼","花溪公园","黔灵山","黄果树瀑布","荔波小七孔","千户苗寨","梵净山","青岩古镇"],
        
            "昆明": ["石林","滇池","翠湖","九乡溶洞","民族村","大观楼","西山","金马碧鸡坊"],
        
            "丽江": ["丽江古城","玉龙雪山","束河古镇","拉市海","泸沽湖","蓝月谷","黑龙潭","象山"],
        
            "西安": ["秦始皇兵马俑","大雁塔","回民街","华清池","古城墙","华山","法门寺","陕西博物馆"],
        
            "兰州": ["黄河母亲雕塑","中山铁桥","白塔山","黄河石林","兴隆山","甘肃省博","五泉山","徐家山"],
        
            "西宁": ["塔尔寺","青海湖","茶卡盐湖","祁连山","东关清真大寺","藏文化博物馆","门源花海","原子城"],
        
            "银川": ["沙坡头","西夏王陵","贺兰山岩画","水洞沟","镇北堡西部影城","沙湖","北武当","平罗玉皇阁"],
        
            "乌鲁木齐": ["天山天池","国际大巴扎","新疆维吾尔自治区博物馆","喀纳斯","红山公园","水磨沟公园","南山牧场","亚洲地理中心"],
        
            "拉萨": ["布达拉宫","大昭寺","纳木错","羊卓雍措","色拉寺","哲蚌寺","罗布林卡","八廓街"],
        
            "桂林": ["漓江","阳朔西街","龙脊梯田","遇龙河","象鼻山","两江四湖","银子岩","印象刘三姐"],
        
            "大理": ["洱海","苍山","大理古城","双廊古镇","喜洲古镇","崇圣寺三塔","蝴蝶泉","才村码头"],
        
            "西双版纳": ["西双版纳植物园","野象谷","傣族园","望天树","曼听公园","傣族村寨","勐泐大佛寺","雨林谷"],
        
            "香港": ["太平山顶","尖沙咀","中环","迪士尼","铜锣湾","维多利亚港","海洋公园","星光大道"],
        
            "澳门": ["大三巴牌坊","澳门威尼斯人","官也街","妈祖阁","葡京酒店","恋爱巷","澳门塔","龙环葡韵"],
        
            "台北": ["台北101","西门町","阳明山","中正纪念堂","士林夜市","永康街","九份","大稻埕"],
        };
        // 把 known dict 挂到 window，让 loop-data.js 的 syncRoutePinsFromItinerary 能读到补景点
        window._knownLandmarks = known;
        if (known[cityKey]) return known[cityKey].slice(0, 3);
        // 省份模板兜底（避免全部显示全省大热门）
        var provFallback = {
        };
        // 终极兜底：用城市名+固定后缀（不会跨城串味）
        return [cityName + '最著名景点', cityName + '博物馆/历史街区', cityName + '夜市/文化体验'];
    }
    var provKey = '';
    if (window.PROVINCES_ALL) {
        for (var _pi = 0; _pi < window.PROVINCES_ALL.length; _pi++) {
            if ((window.PROVINCES_ALL[_pi].cities || []).some(function(c){return c.key===cityKey;})) {
                provKey = window.PROVINCES_ALL[_pi].key; break;
            }
        }
    }
    var _realPoi = getCityLandmarks(cityKey, cityName, provKey);

    // === 决定 routePins ===
    let routePins;
    if (provCity && provCity.routePins && provCity.routePins.length >= 2) {
        routePins = provCity.routePins;
    } else if (dd && dd.routePins && dd.routePins.length >= 2) {
        routePins = dd.routePins;
    } else {
        routePins = ['抵达' + cityName + '站（高铁/机场）', _realPoi[0], _realPoi[1], _realPoi[2], cityName + '夜市/夜景'];
    }

    // === 决定 coords（景点坐标数组）===
    let coordsArr = [];
    if (provCity && provCity.coords && provCity.coords.length > 0) {
        // 兼容：可能是 [[lng,lat],...] 或 [[lng,lat]] 或 [lng,lat]
        coordsArr = provCity.coords.map(c => Array.isArray(c) && c.length === 2 ? c : (provCity.coords[0] || [0,0]));
        if (coordsArr.length < routePins.length) {
            while (coordsArr.length < routePins.length) coordsArr.push(coordsArr[coordsArr.length - 1] || [0,0]);
        }
    } else if (dd && dd.coords) {
        coordsArr = Array.isArray(dd.coords[0]) ? dd.coords : [dd.coords];
    }

    // === 坐标发散器：确保有 routePins.length 个不同的点来画 polyline ===
    // 问题：Photon 经常只返回 1 个坐标（市中心），导致 polyline 不画
    (function spreadCoords() {
        if (!coordsArr || !coordsArr.length) return;
        const center = coordsArr[0];
        const n = routePins ? routePins.length : 5;
        const baseDistKm = 2.5; // 第一个发散点 2.5km
        const stepDistKm = 1.5; // 每个点递增 1.5km
        const angleStep = 360 / Math.max(n, 3); // 均匀分散

        // 先清掉重复/无效点
        const valid = coordsArr.filter(c => c && c.length === 2 && isFinite(c[0]) && isFinite(c[1]));
        if (!valid.length) { coordsArr = []; return; }

        // 检查是否有重复（连续相同）或长度不足
        const unique = [];
        for (let i = 0; i < valid.length; i++) {
            const last = unique[unique.length - 1];
            if (!last || last[0] !== valid[i][0] || last[1] !== valid[i][1]) {
                unique.push(valid[i]);
            }
        }
        coordsArr = unique;

        if (coordsArr.length >= n) return; // 已经够了

        // 地理常量
        const latRad = center[1] * Math.PI / 180;
        const kmPerDegLat = 111.32;
        const kmPerDegLng = 111.32 * Math.cos(latRad);

        // 从已有点之后，继续发散填充到 n 个
        let idx = coordsArr.length;
        while (coordsArr.length < n) {
            const angleDeg = (idx * angleStep) % 360;
            const angleRad = angleDeg * Math.PI / 180;
            const distKm = baseDistKm + (idx - valid.length) * stepDistKm;
            const dLat = (distKm * Math.cos(angleRad)) / kmPerDegLat;
            const dLng = (distKm * Math.sin(angleRad)) / kmPerDegLng;
            coordsArr.push([
                +(center[0] + dLng).toFixed(4),
                +(center[1] + dLat).toFixed(4)
            ]);
            idx++;
        }
    })();

    // === 决定 itinerary ===
    let itinerary;
    if (provCity && provCity.itinerary && provCity.itinerary.length > 0) {
        itinerary = provCity.itinerary.map(day => ({
            day: day.day || 'Day 1',
            theme: day.theme || (cityName + '精华一日游'),
            timeline: (day.timeline || []).map(tl => ({
                time: tl.time || '09:00',
                activity: tl.activity || tl.title || cityName,
                detail: tl.detail || tl.desc || '',
                duration: tl.duration || '2-4小时',
                ticket: tl.ticket || '',
                price: tl.price || tl.ticket || '',
                tip: tl.tip || '',
            }))
        }));
    } else if (dd && dd.itinerary && dd.itinerary.length > 0) {
        itinerary = dd.itinerary.map((it, i) => ({
            day: it.day || ('Day ' + (i+1)),
            theme: it.title || (cityName + '一日游'),
            timeline: [{
                time: '09:00', activity: (it.title || cityName) + '游览',
                detail: it.desc || ('游览' + cityName + '核心景点，体验当地文化与美食'),
                duration: '4小时', ticket: '¥50-100', price: '¥50-100', tip: '建议早上去人少光好',
            }, {
                time: '13:00', activity: '当地特色午餐',
                detail: '品尝' + cityName + '招牌美食，推荐本地老字号餐厅',
                duration: '1.5小时', price: '¥60-100',
            }, {
                time: '15:00', activity: '自由探索+伴手礼',
                detail: '逛本地特色商业街/文创区，购买当地特产带回家',
                duration: '2小时',
            }, {
                time: '19:00', activity: '晚餐+夜景',
                detail: '晚餐继续品尝当地美食，之后看' + cityName + '夜景',
                duration: '2小时', price: '¥80-150', tip: '夜景通常比白天更美',
            }]
        }));
    } else {
        // === 兜底：高质量 itinerary（2天，真实景点名 + 环线同标准）===
        itinerary = [
            {
                day: 'Day 1',
                theme: _realPoi[0] + ' + ' + _realPoi[1] + ' 经典精华游',
                timeline: [
                    { time: '08:30', activity: '抵达' + cityName + '站（高铁/机场）',
                      detail: '高铁/飞机抵达' + cityName + '，MYL专车接站直达市中心酒店办理入住，稍作休整后开启第一天行程',
                      duration: '1-2小时', ticket: '', price: '¥100-300 接站费', tip: '建议上午抵达，可把全天时间留给游玩；旺季高铁票提前2周订',
                    },
                    { time: '10:30', activity: _realPoi[0] + '（重点游览）',
                      detail: '这是' + cityName + '最具代表性的核心景区，感受当地标志性的人文历史与独特自然风光，必打卡！',
                      duration: '3-4小时', ticket: '¥50-150', price: '¥50-150', tip: '提前在官方小程序订票更便宜，避开周末和节假日高峰',
                    },
                    { time: '14:30', activity: _realPoi[1] + '（文化体验）',
                      detail: '深度体验' + cityName + '当地文化，逛博物馆/历史街区/特色古镇，了解这座城市的历史底蕴',
                      duration: '2-3小时', ticket: '免费-¥80', price: '¥0-80', tip: '博物馆大多周一闭馆，建议避开；古镇老街拍照最好看',
                    },
                    { time: '17:30', activity: cityName + '当地特色美食',
                      detail: '前往本地人气餐厅品尝' + cityName + '招牌菜，找老字号/本地人推荐的不踩雷',
                      duration: '2小时', ticket: '', price: '¥80-180/人', tip: '搜大众点评"本地好评榜"；别在景区门口吃，贵又不好吃',
                    },
                    { time: '19:30', activity: cityName + '夜市/夜景 + 回酒店',
                      detail: '吃饱喝足后逛' + cityName + '夜市/文创街，买点伴手礼带回家；时间充裕可看城市夜景',
                      duration: '2小时', ticket: '', price: '¥50-150', tip: '夜景通常比白天更美！早点回酒店休息，第二天还有行程',
                    },
                ]
            },
            {
                day: 'Day 2',
                theme: _realPoi[2] + ' + 自由探索 深度体验',
                timeline: [
                    { time: '08:30', activity: '酒店早餐后出发',
                      detail: '酒店吃完早餐，退房后携带行李出发开始第二天行程',
                      duration: '1小时', ticket: '', price: '含在房费里', tip: '大部分酒店含早餐；退房后行李可寄存在前台',
                    },
                    { time: '10:00', activity: _realPoi[2] + '（第二天重点）',
                      detail: '这是' + cityName + '另一个必玩景点，和第一天风格不同的体验角度',
                      duration: '3-4小时', ticket: '¥30-120', price: '¥30-120', tip: '记得穿舒适运动鞋，很多景点需要步行；带好水',
                    },
                    { time: '14:30', activity: cityName + '自由探索 + 特色小景点',
                      detail: '逛本地特色街区/文创园/小众景点，感受最地道的' + cityName + '本地生活节奏',
                      duration: '2-3小时', ticket: '免费-¥50', price: '¥0-50', tip: '问问酒店前台本地人推荐什么，比旅游攻略更实用',
                    },
                    { time: '17:30', activity: '告别晚餐（推荐特色菜）',
                      detail: '最后一顿一定要吃当地最招牌的菜，留个深刻印象',
                      duration: '2小时', ticket: '', price: '¥100-200/人', tip: '提前订位，热门餐厅晚上容易满座',
                    },
                    { time: '20:00', activity: '送站返程（或继续住一晚）',
                      detail: '专车送往高铁站/机场，结束愉快的' + cityName + '之旅；如果玩得不够可以续住多一天',
                      duration: '2-3小时', ticket: '', price: '¥100-300 送站费', tip: '至少提前2小时到机场/火车站，别赶时间',
                    },
                ]
            }
        ];
    }

    // === 基础字段 ===
    const baseImg = (provCity && provCity.img) || (dd && dd.img) || 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80';
    const baseRating = (dd && dd.rating) || (provCity && provCity.rating) || 4.5;
    const baseDays = (dd && dd.days) || '2天1晚';
    const basePrice = (dd && dd.price) || '¥1,299起';
    const baseDesc = (dd && dd.description) || (provCity && provCity.tag) || (provinceName || '') + cityName + '，MYL 为你精选最值得去的景点和体验。';

    // === 通用附属数据（酒店/火车/交通/美食/tips/budget）===
    const makeHotel = (tier, price, area, highlight) => ({
        name: cityName + ' ' + (tier === 'comfort' ? '舒适型' : '经济型') + '酒店',
        tier, price, area, highlight,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        bookingUrl: 'https://hotels.ctrip.com'
    });

    const data = {
        name: (dd && dd.name) || cityName,
        country: '中国', province: provinceName || '',
        tag: (dd && dd.tag) || (provCity && provCity.tag) || (provinceName ? provinceName + '·' : '') + cityName,
        rating: baseRating, days: baseDays, price: basePrice,
        img: baseImg, description: baseDesc,
        routePins, itinerary,
        coords: coordsArr,
        hotels: [
            makeHotel('comfort', '¥300-600/晚', '市中心', '交通便利近主要景点，含早餐'),
            makeHotel('economy', '¥150-300/晚', '火车站/高铁附近', '性价比高，出行方便'),
        ],
        trains: [
            { from: '上海虹桥', to: cityName, price: '¥150-550', time: '2-6小时', bookingUrl: 'https://trains.ctrip.com' },
            { from: '北京南', to: cityName, price: '¥200-800', time: '3-8小时', bookingUrl: 'https://trains.ctrip.com' },
            { from: '广州南', to: cityName, price: '¥180-600', time: '3-7小时', bookingUrl: 'https://trains.ctrip.com' },
        ],
        transport: [
            { label: '接站/接机', value: '专车 ¥100-300（高铁/机场接送）' },
            { label: '市内交通', value: '地铁/公交/网约车 ¥10-40/次，部分城市有地铁' },
            { label: '景区之间', value: '景点间打车/包车 ¥200-500/天（多人平摊更划算）' },
        ],
        foods: [
            { name: cityName + '特色小吃', desc: '当地传统街边美食，本地人日常爱吃的', price: '¥15-30' },
            { name: cityName + '招牌名菜', desc: '当地最有名的大菜，老字号餐厅必点', price: '¥80-180/份' },
            { name: '当地特产伴手礼', desc: '带回家给朋友的特色礼物，建议在正规商店买', price: '¥50-200' },
        ],
        tips: [
            '建议春秋季节出行，天气舒适风景最好',
            '提前1-2周订高铁票/机票，旺季价格差很多',
            '热门景区门票提前3-5天网上预约，便宜且免排队',
            '穿舒适的运动鞋，大部分景点需要步行',
            '带好防晒+雨具，南方城市多雨，北方紫外线强',
            '当地打车用高德/滴滴，别在街上拦黑车',
        ],
        budget: [
            { label: '大交通（高铁/机票）', value: '¥200-800' },
            { label: '住宿（1晚）', value: '¥150-600' },
            { label: '餐饮（全天）', value: '¥100-200' },
            { label: '景点门票', value: '¥0-200' },
            { label: '市内交通', value: '¥50-150' },
            { label: '合计/人起', value: '¥699' },
        ],
        tags: [provinceName || '', cityName, '自由行', '高铁直达', 'MYL精选'],
    };
    return data;
};

// ========== 打开新城市弹窗（走 renderRichDetail 标准） ==========
window.openProvinceCityModal = function(cityKey, cityName, provinceName) {
    const richData = window.generateCityRichData(cityKey, cityName, provinceName);
    richData._cityKey = cityKey;
    
    let itineraryHtml = '';
    if (window.renderRichDetail) {
        itineraryHtml = window.renderRichDetail(richData);
    } else {
        itineraryHtml = '<div class="modal-section"><h3>行程</h3><p>' + (richData.description || '') + '</p></div>';
    }
    
    const includesArr = ['往返交通', '酒店住宿', '景点门票', '旅行保险'];
    
    modalBody.innerHTML = `
        <div class="modal-body">
            <h2>${richData.name}${richData.province ? ' · ' + richData.province : ''}</h2>
            <div class="modal-subtitle">⭐ ${richData.rating} · ${richData.days} · ${richData.price}</div>
            <img class="modal-hero" src="${richData.img}" alt="${richData.name}" />
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 目的地简介</h3>
                <p>${richData.description}</p>
            </div>
            ${itineraryHtml}
            <div class="modal-price-box">
                <div>
                    <div class="price">${richData.price} <small>/人起</small></div>
                    <div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> ${includesArr.join(' · ')}</div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即咨询</a>
            </div>
        </div>
    `;
    
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 80);
};

function openTourModalBack(data, backType) {
    const itineraryData = data.itineraries || [];
    const itinHtml = itineraryData.map(day => {
        const tl = (day.timeline || []).map(item => {
            const m = [];
            if (item.duration) m.push('<span class="meta-tag duration"><i class="fas fa-clock"></i> ' + item.duration + '</span>');
            if (item.ticket) m.push('<span class="meta-tag ticket"><i class="fas fa-ticket-alt"></i> ' + item.ticket + '</span>');
            if (item.price) m.push('<span class="meta-tag"><i class="fas fa-yen-sign"></i> ' + item.price + '</span>');
            if (item.tip) m.push('<span class="meta-tag tip"><i class="fas fa-lightbulb"></i> ' + item.tip + '</span>');
            return '<div class="timeline-item"><div class="time">' + (item.time || '') + '</div><div class="activity"><strong>' + (item.activity || '') + '</strong></div><div class="detail">' + (item.detail || '') + '</div>' + (m.length ? '<div class="meta-row">' + m.join('') + '</div>' : '') + '</div>';
        }).join('');
        return '<div class="itinerary-day loop-day" data-day="' + (day.day || '') + '"><h4><span class="day-tag">' + (day.day || '') + '</span>' + (day.theme || day.title || '') + '</h4><div class="day-timeline">' + tl + '</div></div>';
    }).join('');

    const mapHtml = buildTourMapHtml(data);
    const includesHtml = (data.includes || []).join(' · ');
    const countryEmoji = (data.countryTag || '').split(' ')[0] || '📍';
    const daysDisplay = data.days || '';
    const coverUrl = data.cover || data.img || '';
    const pins = (data.routePins || []).join(' → ');

    let body = '';
    body += '<div class="modal-body">';
    body += '<button class="btn-back" onclick="openTourModal(\'' + backType + '\')" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:0.95rem;margin-bottom:16px;padding:0"><i class="fas fa-arrow-left"></i> 返回套餐列表</button>';
    body += '<div class="loop-banner" style="background-image:url(\'' + coverUrl + '\')">';
    body += '<div class="loop-banner-overlay">';
    body += '<div class="loop-banner-country">' + (data.countryTag || '套餐') + '</div>';
    body += '<h2>' + countryEmoji + ' ' + (data.name || '') + '</h2>';
    body += '<div class="loop-banner-meta">';
    body += '<span><i class="fas fa-calendar-alt"></i> ' + daysDisplay + '</span>';
    body += '<span><i class="fas fa-map-pin"></i> ' + pins + '</span>';
    body += '</div>';
    body += '<div class="loop-banner-price">' + (data.price || '') + ' <small>/人起</small></div>';
    body += '</div></div>';
    body += mapHtml;
    body += '<div class="modal-section"><h3><i class="fas fa-info-circle"></i> 方案介绍</h3><p>' + (data.description || '') + '</p></div>';
    body += '<div class="modal-section"><h3><i class="fas fa-calendar-day"></i> 每日行程（共' + itineraryData.length + '天）</h3>' + itinHtml + '</div>';
    body += '<div class="modal-price-box"><div>';
    body += '<div class="price">' + (data.price || '') + ' <small>/人起</small></div>';
    body += '<div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> ' + includesHtml + '</div>';
    body += '</div><a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即预订</a></div>';
    body += '</div>';

    modalBody.innerHTML = body;
    setTimeout(() => { if (window.bindLoopMap) window.bindLoopMap(); }, 50);
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 60);
}


// ========== buildTourMapHtml - 套餐真实路线地图 ==========
function buildTourMapHtml(data) {
    if (!data || !window.realMapHtml) return '';
    const coords = data.realCoords || [];
    if (coords.length < 1) return '';
    const isC = (data.country === '中国');
    const names = (data.mapPoints || []).map(p => p.name || '');
    const points = coords.map((c, i) => ({
        lng: c[0], lat: c[1],
        name: names[i] || ('第' + (i + 1) + '站'),
        num: i + 1
    }));
    const totalKm = data.totalKm ? ' · 全程 ' + data.totalKm : '';
    return window.realMapHtml({
        points: points,
        domestic: isC,
        convert: false,
        clickDay: false,
        height: 400,
        title: '🗺️ ' + (data.name || '') + ' 路线图 · 可缩放拖动' + totalKm,
        linkText: isC ? '在高德查看完整路线' : '在谷歌地图查看完整路线'
    });
}

// ========== buildTourMapHtmlLegacy - 旧版路线示意图 ==========
function buildTourMapHtmlLegacy(data) {
    if (!data || !data.mapPoints || data.mapPoints.length < 2) return '';
    const isC = (data.country === '中国');
    const pins = data.mapPoints;
    const strokeColor = isC ? '#dc2626' : '#2563eb';
    const textColor = isC ? '#7f1d1d' : '#1e3a8a';
    
    // 构建分段信息
    const segments = [];
    for (let i = 0; i < pins.length - 1; i++) {
        const a = pins[i], b = pins[i+1];
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x, dy = b.y - a.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        segments.push({ a, b, mx, my, angle });
    }
    
    let polyPoints = pins.map(p => p.x + ',' + p.y).join(' ');
    const isLoop = pins.length > 2 && pins[0].name !== pins[pins.length-1].name;
    if (isLoop) polyPoints += ' ' + pins[0].x + ',' + pins[0].y;
    
    const bgGrad = isC
        ? 'linear-gradient(135deg,#fef9e7 0%,#fce4a4 40%,#a9dfbf 100%)'
        : 'linear-gradient(135deg,#e3f2fd 0%,#bbdefb 40%,#b2dfdb 100%)';
    const coords = data.realCoords || [];
    let mapUrl = '';
    if (coords.length > 0 && isC) {
        mapUrl = 'https://uri.amap.com/marker?position=' + coords.map(c=>c[0]+','+c[1]).join('|') + '&name=' + encodeURIComponent(data.name||'') + '&src=mylvyou&coordinate=gaode';
    } else if (coords.length > 0) {
        mapUrl = 'https://maps.google.com/maps?q=' + coords.map(c=>c[1]+','+c[0]).join('|') + '&z=5';
    }
    const mapName = isC ? '高德地图' : '谷歌地图';
    const totalKm = data.totalKm || '';
    
    // 分段里程标签
    const segLabels = segments.map((s,i) => {
        if (totalKm) {
            const dist = Math.sqrt(Math.pow(s.b.x - s.a.x, 2) + Math.pow(s.b.y - s.a.y, 2));
            const totalDist = segments.reduce((acc, seg) => acc + Math.sqrt(Math.pow(seg.b.x - seg.a.x, 2) + Math.pow(seg.b.y - seg.a.y, 2)), 0);
            const km = Math.round(parseFloat(totalKm) * dist / totalDist);
            return km > 0 ? km + 'km' : '';
        }
        return 'Day' + (i+1);
    });
    
    // 节点HTML（含Day标签）
    const nodesHtml = pins.map((p,i) =>
        '<div class="loop-svg-pin" style="left:' + p.x + '%;top:' + p.y + '%" data-day="' + (p.day||'') + '" data-name="' + (p.name||'') + '">' +
        '<div class="pin-number">' + (i+1) + '</div>' +
        '<div class="pin-label-text">' + (p.name||'') + '</div>' +
        '<div class="pin-day-label">' + (p.day || ('Day ' + (i+1))) + '</div></div>'
    ).join('');
    
    // 分段标签HTML
    const segLabelsHtml = segments.map((s,i) => {
        const label = segLabels[i];
        const offset = 3;
        const rad = (s.angle + 90) * Math.PI / 180;
        const ox = Math.cos(rad) * offset;
        const oy = Math.sin(rad) * offset;
        return '<div class="route-segment-label" style="left:calc(' + s.mx + '% + ' + ox + 'px);top:calc(' + s.my + '% + ' + oy + 'px)">' + label + '</div>';
    }).join('');
    
    // SVG线段（带方向箭头）
    const lineSegs = segments.map((s) => {
        const t = 0.88;
        const ex = s.a.x + (s.b.x - s.a.x) * t;
        const ey = s.a.y + (s.b.y - s.a.y) * t;
        return '<line x1="' + s.a.x + '" y1="' + s.a.y + '" x2="' + ex + '" y2="' + ey + '" stroke="' + strokeColor + '" stroke-width="0.55" stroke-linecap="round" opacity="0.85"/>' +
               '<line x1="' + ex + '" y1="' + ey + '" x2="' + s.b.x + '" y2="' + s.b.y + '" stroke="' + strokeColor + '" stroke-width="0.55" stroke-linecap="round" opacity="0.85" marker-end="url(#arrow-end)"/>';
    }).join('');
    
    let closingArrow = '';
    if (isLoop) {
        const lastA = pins[pins.length-1], lastB = pins[0];
        const t = 0.88;
        const ex = lastA.x + (lastB.x - lastA.x) * t;
        const ey = lastA.y + (lastB.y - lastA.y) * t;
        closingArrow = '<line x1="' + lastA.x + '" y1="' + lastA.y + '" x2="' + ex + '" y2="' + ey + '" stroke="' + strokeColor + '" stroke-width="0.55" stroke-linecap="round" opacity="0.85"/>' +
                       '<line x1="' + ex + '" y1="' + ey + '" x2="' + lastB.x + '" y2="' + lastB.y + '" stroke="' + strokeColor + '" stroke-width="0.55" stroke-linecap="round" opacity="0.85" marker-end="url(#arrow-end)"/>';
    }
    
    return '<div class="loop-map-section">' +
        '<div class="loop-map-title"><i class="fas fa-map-marked-alt" style="color:var(--primary)"></i> 路线示意图 · 点击节点跳转 Day 行程' +
        (totalKm ? '<span style="font-size:.8rem;color:var(--primary);font-weight:700">🛣️ 全程' + totalKm + '</span>' : '') +
        '<span class="map-badge" style="background:' + (isC?'#ef4444':'#3b82f6') + '">' + (isC?'🇨🇳 国内':'🌍 国外') + '</span>' +
        (mapUrl ? '<a href="' + mapUrl + '" target="_blank" class="map-open-link" style="margin-left:auto">🔗 在' + mapName + '打开</a>' : '') +
        '</div>' +
        '<div class="loop-map-svg-wrap" style="background:' + bgGrad + '">' +
        '<svg class="loop-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
        '<defs><marker id="arrow-end" markerWidth="4" markerHeight="4" refX="1" refY="2" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L4,2 L0,4 Z" fill="' + strokeColor + '" opacity="0.95"/></marker></defs>' +
        pins.map((p) => '<circle cx="' + p.x + '" cy="' + p.y + '" r="0.6" fill="' + strokeColor + '" opacity="0.2"/>').join('') +
        lineSegs + closingArrow +
        '<circle cx="' + pins[0].x + '" cy="' + pins[0].y + '" r="1.8" fill="#22c55e" stroke="white" stroke-width="0.5"/>' +
        '<text x="' + pins[0].x + '" y="' + (pins[0].y + 3.5) + '" text-anchor="middle" font-size="1.8" fill="#166534" font-weight="800">起</text>' +
        (!isLoop ? '<circle cx="' + pins[pins.length-1].x + '" cy="' + pins[pins.length-1].y + '" r="1.8" fill="' + strokeColor + '" stroke="white" stroke-width="0.5"/>' : '') +
        (!isLoop ? '<text x="' + pins[pins.length-1].x + '" y="' + (pins[pins.length-1].y + 3.5) + '" text-anchor="middle" font-size="1.8" fill="' + textColor + '" font-weight="800">终</text>' : '') +
        pins.map((p,i) => '<text x="' + p.x + '" y="' + (p.y - 2.5) + '" text-anchor="middle" font-size="2.2" fill="' + textColor + '" font-weight="800">' + (i+1) + '</text>').join('') +
        '</svg><div class="loop-map-nodes">' + nodesHtml + segLabelsHtml + '</div></div>' +
        '<div class="loop-map-tip">💡 提示：点击编号圆点可跳转到对应 Day 的行程 · 绿色=起点 · 带数字标签为分段里程或天数</div></div>';
}


// ========== 省份弹窗 ==========


// ========== 省份可选方案详情 ==========



// ========== 动态城市富数据生成器（与青甘大环线同标准） ==========
;

// ========== 打开新城市弹窗（走 renderRichDetail 标准） ==========
;

function openTourModal(type) {
    const data = tourData[type];
    if (!data) return;

    const hasTimeline = (data.itineraries || []).some(it => it.timeline && it.timeline.length);
    const itineraryData = hasTimeline 
        ? data.itineraries 
        : (data.itineraries || []).map((it, i) => ({
            day: it.day || ('Day ' + (i+1)),
            theme: it.title || it.theme || '',
            timeline: [{ time: '09:00', activity: it.title || '', detail: it.desc || '' }]
          }));

    const itinHtml = itineraryData.map(day => {
        const tl = (day.timeline || []).map(item => {
            const m = [];
            if (item.duration) m.push('<span class="meta-tag duration"><i class="fas fa-clock"></i> ' + item.duration + '</span>');
            if (item.ticket) m.push('<span class="meta-tag ticket"><i class="fas fa-ticket-alt"></i> ' + item.ticket + '</span>');
            if (item.price) m.push('<span class="meta-tag"><i class="fas fa-yen-sign"></i> ' + item.price + '</span>');
            if (item.tip) m.push('<span class="meta-tag tip"><i class="fas fa-lightbulb"></i> ' + item.tip + '</span>');
            return '<div class="timeline-item"><div class="time">' + (item.time || '') + '</div><div class="activity"><strong>' + (item.activity || '') + '</strong></div><div class="detail">' + (item.detail || '') + '</div>' + (m.length ? '<div class="meta-row">' + m.join('') + '</div>' : '') + '</div>';
        }).join('');
        return '<div class="itinerary-day loop-day" data-day="' + (day.day || '') + '"><h4><span class="day-tag">' + (day.day || '') + '</span>' + (day.theme || day.title || '') + '</h4><div class="day-timeline">' + tl + '</div></div>';
    }).join('');

    const mapHtml = buildTourMapHtml(data);

    const hlHtml = (data.coverages || []).map(c => 
        '<span class="loop-hl" style="padding:4px 12px;background:#fef3c7;color:#b45309;border-radius:12px;font-size:.8rem;margin-right:6px">' + c + '</span>'
    ).join('');
    const tagHtml = (data.tags || []).map(t => 
        '<span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:12px;font-size:.75rem;margin-right:6px">' + t + '</span>'
    ).join('');

    const flightHtml = (data.flights || []).map(f => {
        const bookBtn = f.bookingUrl ? '<span class="buy-btn">查看 →</span>' : '';
        return '<a href="' + (f.bookingUrl || '#') + '" target="_blank" class="flight-item"><span class="from">' + (f.from || '') + '</span><span class="arrow">→</span><span class="to">' + (f.to || '') + '</span><span class="price">' + (f.price || '') + '</span><span class="time">' + (f.time || '') + '</span>' + bookBtn + '</a>';
    }).join('');
    const flightSection = flightHtml ? '<div class="flight-card"><h5><i class="fas fa-plane"></i> ✈️ 机票/交通参考</h5>' + flightHtml + '</div>' : '';

    const trainHtml = (data.trains || []).map(t => {
        const bookBtn = t.bookingUrl ? '<span class="buy-btn">查看 →</span>' : '';
        const dur = t.duration ? '<span class="dur">' + t.duration + '</span>' : '';
        return '<a href="' + (t.bookingUrl || '#') + '" target="_blank" class="train-item"><span class="from">' + (t.from || '') + '</span><span class="arrow">→</span><span class="to">' + (t.to || '') + '</span><span class="price">' + (t.price || '') + '</span>' + dur + '<span class="time">' + (t.time || '') + '</span>' + bookBtn + '</a>';
    }).join('');
    const trainSection = trainHtml ? '<div class="train-card"><h5><i class="fas fa-train"></i> 🚄 高铁参考</h5>' + trainHtml + '</div>' : '';

    const hotelHtml = (data.hotels || []).map(h => {
        const tierMap = { economy:'经济型', comfort:'舒适型', luxury:'奢华型' };
        const tierBadge = '<div class="hotel-tier-badge ' + (h.tier || '') + '">' + (tierMap[h.tier] || h.tier || '') + '</div>';
        const imgDiv = h.image ? '<div class="hotel-img"><img src="' + h.image + '" alt="' + (h.name || '') + '" onerror="this.style.display=\'none\'"></div>' : '';
        const bookBtn = h.bookingUrl ? '<div class="booking-link"><i class="fas fa-external-link-alt"></i> 点击预订 →</div>' : '';
        const cardHtml = '<div class="hotel-card ' + (h.image ? 'with-image' : '') + '">' + imgDiv + '<div class="hotel-info"><div class="hotel-top">' + tierBadge + '<h5>' + (h.name || '') + '</h5></div><div class="hotel-price">' + (h.price || '') + '</div><div class="area"><i class="fas fa-map-marker-alt"></i> ' + (h.area || '') + '</div><div class="highlight">' + (h.highlight || '') + '</div>' + bookBtn + '</div></div>';
        return h.bookingUrl ? '<a href="' + h.bookingUrl + '" target="_blank" class="hotel-card-link">' + cardHtml + '</a>' : cardHtml;
    }).join('');
    const hotelSection = hotelHtml ? '<div class="modal-section"><h3><i class="fas fa-hotel"></i> 住宿推荐</h3>' + hotelHtml + '</div>' : '';

    const transportHtml = (data.transport || []).map(t => '<div class="transport-item"><div class="label">' + (t.label || '') + '</div><div class="value">' + (t.value || '') + '</div></div>').join('');
    const foodsHtml = (data.foods || []).map(f => '<li><strong>' + (f.name || '') + '</strong> — ' + (f.desc || '') + ' <em style="color:var(--primary);font-weight:600">' + (f.price || '') + '</em></li>').join('');
    const tipsHtml = (data.tips || []).map(t => '<li>' + t + '</li>').join('');
    const budgetHtml = (data.budget || []).map(b => '<div class="budget-item"><div class="label">' + (b.label || '') + '</div><div class="value">' + (b.value || '') + '</div></div>').join('');

    const optionsHtml = (data.options || []).map((opt, idx) => {
        const onclick = opt.id ? `onclick="showOptionDetail('${opt.id}')"` : 'onclick="showToast(\'该方案详情即将上线，请咨询客服\')"';
        const rightText = opt.id ? '<span style="font-size:0.8rem;color:var(--primary)"><i class="fas fa-chevron-right"></i> 查看详细行程</span>' : '<span style="font-size:0.8rem;color:var(--text-light)">即将上线</span>';
        return '<div class="itinerary-day option-item" style="border-left-color:var(--accent);cursor:pointer" ' + onclick + '>' +
            '<div style="display:flex;justify-content:space-between;align-items:center;width:100%"><div><h4 style="color:var(--text)">' + (opt.name || '') + '</h4>' + rightText +
            '</div><span style="font-weight:700;color:var(--primary);font-size:1.1rem">' + (opt.price || '') + '</span></div></div>';
    }).join('');

    const includesHtml = (data.includes || []).join(' · ');
    const countryEmoji = (data.countryTag || '').split(' ')[0] || '📍';
    const daysDisplay = data.days || data.subtitle || '';
    const coverUrl = data.cover || data.img || '';
    const totalKm = data.totalKm || '';
    const pins = (data.routePins || []).join(' → ');

    // Build modal body
    let body = '';
    body += '<div class="modal-body">';
    body += '<div class="loop-banner" style="background-image:url(\'' + coverUrl + '\')">';
    body += '<div class="loop-banner-overlay">';
    body += '<div class="loop-banner-country">' + (data.countryTag || '套餐') + '</div>';
    body += '<h2>' + countryEmoji + ' ' + (data.name || '') + '</h2>';
    body += '<div class="loop-banner-meta">';
    body += '<span><i class="fas fa-calendar-alt"></i> ' + daysDisplay + '</span>';
    if (totalKm) body += '<span><i class="fas fa-route"></i> ' + totalKm + '</span>';
    body += '<span><i class="fas fa-map-pin"></i> ' + pins + '</span>';
    body += '</div>';
    body += '<div class="loop-banner-price">' + (data.price || '') + ' <small>/人起</small></div>';
    body += '</div></div>';
    
    body += mapHtml;
    if (hlHtml) body += '<div style="margin-bottom:12px">' + hlHtml + '</div>';
    if (tagHtml) body += '<div style="margin-bottom:12px">' + tagHtml + '</div>';
    
    body += '<div class="modal-section"><h3><i class="fas fa-info-circle"></i> 套餐介绍</h3><p>' + (data.description || '') + '</p></div>';
    
    body += flightSection + trainSection;
    if (transportHtml) body += '<div class="info-grid"><div class="info-card"><h5><i class="fas fa-bus"></i> 当地交通</h5>' + transportHtml + '</div></div>';
    
    body += '<div class="modal-section"><h3><i class="fas fa-calendar-day"></i> 每日行程（共' + itineraryData.length + '天）</h3>' + itinHtml + '</div>';
    
    body += hotelSection;
    
    if (foodsHtml || (data.coverages||[]).length) body += '<div class="info-grid">';
    if (foodsHtml) body += '<div class="info-card"><h5><i class="fas fa-utensils"></i> 必吃美食</h5><ul>' + foodsHtml + '</ul></div>';
    if ((data.coverages||[]).length) body += '<div class="info-card"><h5><i class="fas fa-star"></i> 行程亮点</h5>' + hlHtml + '</div>';
    if (foodsHtml || (data.coverages||[]).length) body += '</div>';
    
    if (tipsHtml) body += '<div class="tips-warn"><h5><i class="fas fa-exclamation-triangle"></i> 贴心提示</h5><ul>' + tipsHtml + '</ul></div>';
    if (budgetHtml) body += '<div class="budget-bar"><h5><i class="fas fa-calculator"></i> 预算参考（人均）</h5><div class="budget-items">' + budgetHtml + '</div></div>';
    
    body += '<div class="modal-section"><h3><i class="fas fa-list-alt"></i> 可选方案</h3>' + optionsHtml + '</div>';
    
    body += '<div class="modal-price-box"><div>';
    body += '<div class="price">' + (data.price || '') + ' <small>/人起</small></div>';
    body += '<div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> ' + includesHtml + '</div>';
    body += '</div><a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即预订</a></div>';
    body += '</div>';

    modalBody.innerHTML = body;

    setTimeout(() => { if (window.bindLoopMap) window.bindLoopMap(); }, 50);
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 60);
}



function closeModal() {
    destModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
}

// ESC 键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
});

// ========== 表单提交 ==========
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        btn.textContent = '发送中...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = '✓ 已发送';
            btn.style.background = '#10b981';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 2000);
        }, 1500);
    });
}

// ========== 用户评价发布 ==========
const reviewForm = document.getElementById('reviewForm');
const reviewGrid = document.querySelector('.testimonial-grid');
const REVIEW_KEY = 'myl_reviews_v1';

function reviewEscape(str) {
    return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
}

function reviewStars(rating) {
    return '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, Math.max(0, 5 - rating));
}

function renderReviewCard(review, prepend) {
    if (!reviewGrid) return;
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
        <div class="testimonial-stars">${reviewStars(review.rating)}</div>
        <p>“${reviewEscape(review.text)}”</p>
        <div class="testimonial-user">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" alt="${reviewEscape(review.name)}">
            <div>
                <h4>${reviewEscape(review.name)}</h4>
                <span>${reviewEscape(review.dest || 'MYL 旅行')}</span>
            </div>
        </div>`;
    if (prepend) reviewGrid.prepend(card); else reviewGrid.appendChild(card);
}

function loadReviews() {
    try {
        const list = JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]');
        list.forEach(r => renderReviewCard(r, false));
    } catch (e) { /* 忽略解析异常 */ }
}

if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reviewName').value.trim();
        const dest = document.getElementById('reviewDest').value.trim();
        const rating = parseInt(document.getElementById('reviewRating').value, 10) || 5;
        const text = document.getElementById('reviewText').value.trim();
        if (!name || !text) {
            showToast('请填写昵称和评价内容');
            return;
        }
        const review = { name, dest, rating, text, time: Date.now() };
        renderReviewCard(review, true);
        try {
            const list = JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]');
            list.unshift(review);
            localStorage.setItem(REVIEW_KEY, JSON.stringify(list.slice(0, 30)));
        } catch (e) { /* 存储不可用时仍展示本次评价 */ }
        reviewForm.reset();
        showToast('评价发布成功，感谢分享！');
        if (reviewGrid && reviewGrid.firstElementChild) {
            reviewGrid.firstElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

if (reviewGrid) loadReviews();

// ========== 平滑滚动 ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ========== 爆点环线渲染 ==========
document.addEventListener('DOMContentLoaded', function() {
    const loopGrid = document.getElementById('loopGrid');
    if (loopGrid && window.LOOP_ROUTES) {
        loopGrid.innerHTML = window.LOOP_ROUTES.map(loop => {
            const bgStyle = loop.cover 
                ? `background-image:url('${loop.cover}')` 
                : 'background:linear-gradient(135deg,#ef4444,#f59e0b)';
            const coverContent = loop.cover ? '' : (loop.coverEmoji || '🏔️');
            return `
            <div class="loop-card" data-loop="${loop.id}">
                <div class="loop-cover" style="${bgStyle};background-size:cover;background-position:center;">
                    <div class="loop-cover-country-tag">${loop.countryTag || (loop.tags && loop.tags.includes('国内') ? '🇨🇳 国内' : '🌍 国外')}</div>
                    ${coverContent}
                </div>
                <div class="loop-info">
                    <h3>${loop.name}</h3>
                    <div class="loop-meta">
                        <span>${loop.days}</span>
                        <span>${loop.rating || '★★★★★'}</span>
                        <span>${loop.totalKm || ''}</span>
                    </div>
                    <div class="loop-desc">${loop.description || ''}</div>
                    <div class="loop-footer">
                        <div class="price">${loop.price || '¥2500起'}<small>/人</small></div>
                        <div class="btn">查看详情 →</div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
        loopGrid.querySelectorAll('.loop-card').forEach(card => {
            card.addEventListener('click', () => openLoopModal(card.dataset.loop));
        });
    }
});

// ========== 环线弹窗 ==========
function openLoopModal(loopId) {
    const loop = (window.LOOP_ROUTES || []).find(r => r.id === loopId);
    if (!loop || !modalBody) return;
    
    modalBody.innerHTML = window.renderLoopDetail ? window.renderLoopDetail(loop) : '<p>加载中...</p>';
    
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    if (typeof getScrollbarWidth === 'function') {
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
    }
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 60);
}
