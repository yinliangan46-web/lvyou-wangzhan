// ========== 导航栏滚动效果 ==========
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

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
});

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== 移动端菜单 ==========
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const overlay = document.getElementById('overlay');
const navLinks = nav.querySelectorAll('a');

function toggleMenu() {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
}

menuToggle.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

navLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
});

// ========== 导航高亮 ==========
const sections = document.querySelectorAll('section[id]');

function updateActiveNav() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollY >= top && scrollY < top + height) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);

// ========== 计数动画 ==========
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = Math.ceil(target / 60);
        let current = 0;

        const update = () => {
            current += increment;
            if (current < target) {
                counter.textContent = current.toLocaleString();
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString();
            }
        };

        update();
    });
}

// ========== Intersection Observer ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
};

// 卡片动画
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.dest-card').forEach(card => {
    observer.observe(card);
});

// 统计动画触发
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// 特色卡片入场
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

// 套餐卡片入场
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
    };

    // 检查是否匹配目的地
    for (const [key, value] of Object.entries(destMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            openModal(value);
            input.value = '';
            return;
        }
    }

    // 检查套餐
    const tourMap = {
        '海岛': 'island', '海滩': 'island', '度假': 'island',
        '文化': 'culture', '历史': 'culture', '古迹': 'culture',
        '城市': 'city', '都市': 'city', '漫游': 'city',
    };

    for (const [key, value] of Object.entries(tourMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            openTourModal(value);
            input.value = '';
            return;
        }
    }

    alert('未找到 "' + keyword + '" 相关内容。试试搜索：巴黎、东京、巴厘岛、迪拜、曼谷、伦敦');
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
        price: '¥8,999',
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
        price: '¥5,999',
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
        price: '¥4,599',
        img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
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
        price: '¥6,999',
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
        price: '¥2,599',
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
        price: '¥9,999',
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
    }
};

// 套餐数据
const tourData = {
    island: {
        name: '🌴 海岛度假套餐',
        subtitle: '马尔代夫、巴厘岛、普吉岛 | 5-7天',
        img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        description: '逃离喧嚣，投入碧海蓝天的怀抱。精选全球最美海岛目的地，享受阳光、沙滩和清澈见底的海水。无论是蜜月旅行还是家庭度假，我们为你安排最完美的海岛假期。',
        price: '¥4,599',
        itineraries: [
            { day: 'Day 1', title: '抵达海岛', desc: '专车接机，入住海滨度假村，享受欢迎晚宴。' },
            { day: 'Day 2', title: '出海浮潜', desc: '乘船出海，在珊瑚礁间浮潜，与热带鱼群共舞。' },
            { day: 'Day 3', title: '自由活动', desc: '全天自由活动，享受SPA、沙滩日光浴或水上运动。' },
            { day: 'Day 4', title: '文化体验', desc: '参观当地村落、寺庙，体验海岛传统文化和美食。' },
            { day: 'Day 5', title: '返程', desc: '自由活动，根据航班时间送机。' },
        ],
        options: [
            { name: '巴厘岛 5天4晚', price: '¥4,599' },
            { name: '普吉岛 6天5晚', price: '¥3,999' },
            { name: '马尔代夫 7天5晚', price: '¥12,999' },
        ],
        includes: ['往返机票', '海滨度假村', '每日早餐', '机场接送', '浮潜装备', '旅行保险']
    },
    culture: {
        name: '🏛️ 文化探索套餐',
        subtitle: '欧洲、日本、东南亚 | 7-10天',
        img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
        description: '深入探索世界文化遗产，感受不同文明的魅力。从欧洲古城到东方古都，由资深文化导游带你领略历史底蕴，品尝地道美食，体验最纯粹的文化之旅。',
        price: '¥6,999',
        itineraries: [
            { day: 'Day 1', title: '抵达目的地', desc: '接机入住，参加欢迎说明会。' },
            { day: 'Day 2', title: '世界遗产探访', desc: '全天参观世界文化遗产，由资深文化专家讲解。' },
            { day: 'Day 3', title: '博物馆之旅', desc: '参观当地最重要的博物馆，深入了解历史文化。' },
            { day: 'Day 4', title: '传统手工艺体验', desc: '参与当地传统手工艺制作，体验匠人精神。' },
            { day: 'Day 5', title: '美食探索', desc: '品尝地道美食，参加烹饪课程。' },
            { day: 'Day 6', title: '自由探索', desc: '自由活动，推荐深度文化体验项目。' },
            { day: 'Day 7', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        options: [
            { name: '欧洲四国 10天9晚', price: '¥16,999' },
            { name: '日本深度 7天6晚', price: '¥8,999' },
            { name: '东南亚文化 8天7晚', price: '¥5,999' },
        ],
        includes: ['往返机票', '四星级酒店', '资深文化导游', '景点门票', '特色餐食', '旅行保险']
    },
    city: {
        name: '🌆 城市漫游套餐',
        subtitle: '东京、首尔、曼谷、新加坡 | 4-6天',
        img: 'https://images.unsplash.com/photo-1534430480872-3498386e6296?w=800&q=80',
        description: '感受亚洲最繁华都市的脉动！从东京的潮流前沿到首尔的韩流文化，从曼谷的烟火气息到新加坡的花园城市，每条线路都精心设计了自由探索与深度体验的完美平衡。',
        price: '¥3,299',
        itineraries: [
            { day: 'Day 1', title: '抵达城市', desc: '接机入住市中心酒店，自由探索周边。' },
            { day: 'Day 2', title: '城市地标打卡', desc: '游览城市标志性景点，感受都市魅力。' },
            { day: 'Day 3', title: '自由活动', desc: '全天自由活动（赠送交通卡，轻松出行）。' },
            { day: 'Day 4', title: '特色街区探索', desc: '探访当地特色街区、市场，体验城市生活。' },
            { day: 'Day 5', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        options: [
            { name: '东京 5天4晚', price: '¥4,299' },
            { name: '首尔 5天4晚', price: '¥2,999' },
            { name: '曼谷+芭提雅 6天5晚', price: '¥3,299' },
        ],
        includes: ['往返机票', '市中心酒店', '交通卡赠送', '自由活动充裕', '中文服务', '旅行保险']
    }
};

function openModal(city) {
    const data = destinationData[city];
    if (!data) return;

    const itineraryHtml = data.itinerary.map(item => `
        <div class="itinerary-day">
            <h4>${item.day} — ${item.title}</h4>
            <p>${item.desc}</p>
        </div>
    `).join('');

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

            <div class="modal-section">
                <h3><i class="fas fa-route"></i> 详细行程安排</h3>
                ${itineraryHtml}
            </div>

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
}

function openTourModal(type) {
    const data = tourData[type];
    if (!data) return;

    const itineraryHtml = data.itineraries.map(item => `
        <div class="itinerary-day">
            <h4>${item.day} — ${item.title}</h4>
            <p>${item.desc}</p>
        </div>
    `).join('');

    const optionsHtml = data.options.map(opt => `
        <div class="itinerary-day" style="border-left-color:var(--accent);display:flex;justify-content:space-between;align-items:center">
            <h4 style="color:var(--text)">${opt.name}</h4>
            <span style="font-weight:700;color:var(--primary);font-size:1.1rem">${opt.price}</span>
        </div>
    `).join('');

    const includesHtml = data.includes.join(' · ');

    modalBody.innerHTML = `
        <div class="modal-body">
            <h2>${data.name}</h2>
            <div class="modal-subtitle">${data.subtitle}</div>
            <img class="modal-hero" src="${data.img}" alt="${data.name}" />

            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 套餐介绍</h3>
                <p>${data.description}</p>
            </div>

            <div class="modal-section">
                <h3><i class="fas fa-route"></i> 参考行程</h3>
                ${itineraryHtml}
            </div>

            <div class="modal-section">
                <h3><i class="fas fa-tags"></i> 可选方案</h3>
                ${optionsHtml}
            </div>

            <div class="modal-price-box">
                <div>
                    <div class="price">${data.price} <small>/人起</small></div>
                    <div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> ${includesHtml}</div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即预订</a>
            </div>
        </div>
    `;

    destModal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal() {
    destModal.classList.remove('active');
    document.body.classList.remove('modal-open');
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
