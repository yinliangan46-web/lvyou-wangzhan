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
        '南京': 'nanjing_tour', '六安': 'luan_tour', '大别山': 'luan_tour',
    };

    for (const [key, value] of Object.entries(tourMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            openTourModal(value);
            input.value = '';
            return;
        }
    }

    alert('未找到 "' + keyword + '" 相关内容。试试搜索城市名：巴黎、东京、北京、上海、南京、成都、西安等');
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
    qingdao: {name:'青岛',country:'山东',tag:'红瓦绿树碧海蓝天',rating:4.6,days:'4天3晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg/960px-Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg',description:'青岛，一座让人来了就不想走的海滨城市。栈桥的海鸥、八大关的万国建筑、崂山的道教文化、啤酒节的狂欢，处处洋溢着这座岛城的独特魅力。',itinerary:[
        {day:'Day 1',title:'抵达青岛',desc:'接站入住，晚上逛栈桥、五四广场看灯光秀。'},{day:'Day 2',title:'八大关 & 崂山',desc:'游览八大关万国建筑群，下午登崂山。'},{day:'Day 3',title:'啤酒博物馆 & 金沙滩',desc:'参观青岛啤酒博物馆，下午在金沙滩享受阳光。'},{day:'Day 4',title:'小鱼山 & 返程',desc:'登小鱼山俯瞰老城全景，下午返程。'}],includes:['往返交通','四星级酒店','崂山门票','啤酒博物馆','海鲜大餐','旅行保险']},
    xiamen: {name:'厦门',country:'福建',tag:'海上花园',rating:4.7,days:'4天3晚',price:'¥2,499',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/20121031_Xiamen_University_01.jpg/960px-20121031_Xiamen_University_01.jpg',description:'厦门，一座风姿绰约的海上花园。鼓浪屿的万国建筑、环岛路的椰风海韵、曾厝垵的文艺气息、南普陀的晨钟暮鼓，让这座海滨城市充满了浪漫与诗情。',itinerary:[
        {day:'Day 1',title:'抵达厦门',desc:'接机入住，晚上逛中山路步行街。'},{day:'Day 2',title:'鼓浪屿',desc:'全天游览鼓浪屿：日光岩、菽庄花园、龙头路美食街。'},{day:'Day 3',title:'南普陀 & 厦大',desc:'游览南普陀寺、厦门大学、环岛路骑行。'},{day:'Day 4',title:'曾厝垵 & 返程',desc:'逛曾厝垵文艺村，下午返程。'}],includes:['往返交通','四星级酒店','鼓浪屿船票','景点门票','海鲜餐','旅行保险']},
    lijiang: {name:'丽江',country:'云南',tag:'雪山下的古城',rating:4.8,days:'5天4晚',price:'¥1,299',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Black_Dragon_%E9%BB%91%E9%BE%99%E6%BD%AD_%285496141333%29.jpg/960px-Black_Dragon_%E9%BB%91%E9%BE%99%E6%BD%AD_%285496141333%29.jpg',description:'丽江，一个让人心灵栖息的远方。大研古城的纳西风情、玉龙雪山的巍峨壮丽、束河古镇的宁静悠然、泸沽湖的摩梭文化，每一处都是诗和远方的模样。',itinerary:[
        {day:'Day 1',title:'抵达丽江',desc:'抵达丽江，入住古城客栈，晚上逛四方街。'},{day:'Day 2',title:'玉龙雪山',desc:'全天游览玉龙雪山，乘坐大索道登顶，观看印象丽江演出。'},{day:'Day 3',title:'束河古镇 & 拉市海',desc:'游览束河古镇，下午在拉市海骑马、划船。'},{day:'Day 4',title:'泸沽湖',desc:'前往泸沽湖，环湖游览，体验摩梭族文化。'},{day:'Day 5',title:'返程',desc:'自由活动，根据航班时间送机。'}],includes:['往返交通','特色客栈','玉龙雪山索道','泸沽湖门票','印象丽江演出','旅行保险']},
    zhangjiajie: {name:'张家界',country:'湖南',tag:'奇峰三千秀水八百',rating:4.8,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg/960px-1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',description:'张家界，阿凡达取景地，一座被大自然偏爱的山水画卷。天门山的惊险、天子山的奇峰、金鞭溪的清澈、大峡谷的玻璃桥，每一步都是视觉的盛宴。',itinerary:[
        {day:'Day 1',title:'抵达张家界',desc:'接站入住，晚上游览溪布街。'},{day:'Day 2',title:'天门山',desc:'游览天门山，体验玻璃栈道、天门洞奇观。'},{day:'Day 3',title:'武陵源 & 天子山',desc:'游览武陵源核心景区、天子山、袁家界（阿凡达取景地）。'},{day:'Day 4',title:'大峡谷 & 玻璃桥',desc:'游览大峡谷、挑战世界最高玻璃桥。'},{day:'Day 5',title:'金鞭溪 & 返程',desc:'漫步金鞭溪，下午返程。'}],includes:['往返交通','四星级酒店','景点门票','百龙天梯','玻璃桥门票','旅行保险']},
    huangshan: {name:'黄山',country:'安徽',tag:'五岳归来不看山',rating:4.9,days:'4天3晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Huangshan_pic_4.jpg/960px-Huangshan_pic_4.jpg',description:'黄山，"五岳归来不看山，黄山归来不看岳"。奇松、怪石、云海、温泉、冬雪，"五绝"闻名天下。迎客松的挺拔、光明顶的日出、西海大峡谷的险峻，让人感叹大自然的鬼斧神工。',itinerary:[
        {day:'Day 1',title:'抵达黄山',desc:'抵达黄山北站，入住汤口镇。'},{day:'Day 2',title:'黄山山顶',desc:'乘索道上山，游览迎客松、光明顶、飞来石，住山顶看日落。'},{day:'Day 3',title:'西海大峡谷 & 宏村',desc:'游览西海大峡谷，下午下山游览宏村古村落。'},{day:'Day 4',title:'屯溪老街 & 返程',desc:'游览屯溪老街，下午返程。'}],includes:['往返交通','四星级酒店+山顶住宿','黄山门票+索道','宏村门票','旅行保险']},
    jiuzhaigou: {name:'九寨沟',country:'四川',tag:'人间仙境童话世界',rating:4.9,days:'5天4晚',price:'¥2,599',img:'https://images.unsplash.com/photo-1486870591958-9b9d0d1dacea?w=800&q=80,description:q=80',description:'九寨沟，被誉为"童话世界"。翠海、叠瀑、彩林、雪峰、藏情、蓝冰，六绝奇观令人叹为观止。五花海的斑斓、诺日朗瀑布的壮观、长海的静谧，每一帧都美如画卷。',itinerary:[
        {day:'Day 1',title:'抵达九寨沟',desc:'抵达九黄机场，入住沟口酒店。'},{day:'Day 2',title:'九寨沟全天',desc:'全天深度游览九寨沟：树正沟→日则沟→则查洼沟。'},{day:'Day 3',title:'黄龙景区',desc:'游览黄龙景区，欣赏五彩池、钙化滩流。'},{day:'Day 4',title:'藏族文化体验',desc:'体验藏族文化，参观藏寨、品尝藏餐。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','九寨沟+黄龙门票','景区观光车','藏餐体验','旅行保险']},
    dunhuang: {name:'敦煌',country:'甘肃',tag:'丝路明珠',rating:4.7,days:'5天4晚',price:'¥2,799',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Jiucenglou_of_Mogao_Caves.jpg/960px-Jiucenglou_of_Mogao_Caves.jpg',description:'敦煌，丝绸之路上的明珠，一座承载着千年文明的文化圣地。莫高窟的壁画、鸣沙山的驼铃、月牙泉的碧波、雅丹地貌的奇幻，让人穿越时空感受丝路的辉煌。',itinerary:[
        {day:'Day 1',title:'抵达敦煌',desc:'抵达敦煌，入住酒店，晚上逛沙洲夜市。'},{day:'Day 2',title:'莫高窟',desc:'全天参观莫高窟，欣赏千年壁画和彩塑。'},{day:'Day 3',title:'鸣沙山 & 月牙泉',desc:'游览鸣沙山、月牙泉，体验沙漠骑骆驼、滑沙。'},{day:'Day 4',title:'雅丹地貌 & 玉门关',desc:'前往雅丹国家地质公园，参观玉门关、汉长城。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','莫高窟门票','鸣沙山骑骆驼','雅丹包车','旅行保险']},
    sanya: {name:'三亚',country:'海南',tag:'东方夏威夷',rating:4.7,days:'5天4晚',price:'¥1,699',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SuperStar_Aquarius_at_Phoenix_Island%2C_Sanya_Bay_-_01.jpg/960px-SuperStar_Aquarius_at_Phoenix_Island%2C_Sanya_Bay_-_01.jpg',description:'三亚，中国最南端的热带滨海旅游城市。亚龙湾的洁白沙滩、蜈支洲岛的清澈海水、天涯海角的浪漫传说、热带天堂森林公园的空中栈道，是避寒度假的绝佳选择。',itinerary:[
        {day:'Day 1',title:'抵达三亚',desc:'接机入住，晚上逛第一市场吃海鲜。'},{day:'Day 2',title:'亚龙湾 & 天堂森林公园',desc:'在亚龙湾享受阳光沙滩，游览热带天堂森林公园。'},{day:'Day 3',title:'蜈支洲岛',desc:'乘船前往蜈支洲岛，浮潜、玩水上项目。'},{day:'Day 4',title:'南山 & 天涯海角',desc:'参观南山文化旅游区、天涯海角。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','蜈支洲岛船票','景点门票','海鲜大餐','旅行保险']},
    xishuangbanna: {name:'西双版纳',country:'云南',tag:'热带雨林傣族风情',rating:4.6,days:'5天4晚',price:'¥1,699',img:'https://images.unsplash.com/photo-1518173946687-9277050a3e6b?w=800&q=80,description:q=80',description:'西双版纳，中国唯一的热带雨林自然保护区。野象谷的亚洲象、望天树的空中走廊、傣族园的竹楼、星光夜市的烟火，让你感受浓郁的民族风情和热带风光。',itinerary:[
        {day:'Day 1',title:'抵达版纳',desc:'接机入住，晚上逛告庄星光夜市。'},{day:'Day 2',title:'野象谷 & 原始森林公园',desc:'游览野象谷看大象表演，下午探索原始森林公园。'},{day:'Day 3',title:'望天树景区',desc:'前往望天树景区，体验空中树冠走廊。'},{day:'Day 4',title:'傣族园 & 曼听公园',desc:'游览傣族园体验泼水节，参观曼听公园。'},{day:'Day 5',title:'返程',desc:'自由活动，前往机场返程。'}],includes:['往返机票','四星级酒店','景点门票','傣族园体验','特色餐食','旅行保险']},
    huangguoshu: {name:'黄果树',country:'贵州',tag:'亚洲最大瀑布',rating:4.6,days:'3天2晚',price:'¥1,599',img:'https://images.unsplash.com/photo-1469479069859-2f5c9640e0e0?w=800&q=80,description:q=80',description:'黄果树瀑布，亚洲最大的瀑布，宽101米，高78米。奔腾而下的水流如银河倾泻，水雾弥漫，彩虹横跨，气势磅礴。景区内还有天星桥、陡坡塘等多个景点。',itinerary:[
        {day:'Day 1',title:'抵达贵阳',desc:'抵达贵阳，乘车前往黄果树，入住酒店。'},{day:'Day 2',title:'黄果树瀑布',desc:'全天游览黄果树瀑布景区：大瀑布、天星桥、陡坡塘。'},{day:'Day 3',title:'返程',desc:'自由活动，返程。'}],includes:['往返交通','三星级酒店','景点门票','景区观光车','旅行保险']},
    leshan: {name:'乐山',country:'四川',tag:'世界最大石刻坐佛',rating:4.6,days:'3天2晚',price:'¥1,399',img:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/36275-Leshan_%2849067653383%29.jpg/960px-36275-Leshan_%2849067653383%29.jpg',description:'乐山，举世闻名的乐山大佛所在地。大佛通高71米，是世界上最大的石刻弥勒佛坐像，历时90年建成。登临大佛脚下，感受"山是一尊佛，佛是一座山"的震撼。',itinerary:[
        {day:'Day 1',title:'抵达乐山',desc:'抵达乐山，入住酒店，晚上品尝乐山钵钵鸡。'},{day:'Day 2',title:'乐山大佛 & 峨眉山',desc:'上午游览乐山大佛，下午前往峨眉山。'},{day:'Day 3',title:'返程',desc:'自由活动，返程。'}],includes:['往返交通','三星级酒店','大佛门票','峨眉山半山游','旅行保险']}
};

// 套餐数据
const tourData = {
    island: {
        name: '🌴 海岛度假套餐',
        subtitle: '马尔代夫、巴厘岛、普吉岛 | 5-7天',
        img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        description: '逃离喧嚣，投入碧海蓝天的怀抱。精选全球最美海岛目的地，享受阳光、沙滩和清澈见底的海水。无论是蜜月旅行还是家庭度假，我们为你安排最完美的海岛假期。',
        price: '¥2,799',
        itineraries: [
            { day: 'Day 1', title: '抵达海岛', desc: '专车接机，入住海滨度假村，享受欢迎晚宴。' },
            { day: 'Day 2', title: '出海浮潜', desc: '乘船出海，在珊瑚礁间浮潜，与热带鱼群共舞。' },
            { day: 'Day 3', title: '自由活动', desc: '全天自由活动，享受SPA、沙滩日光浴或水上运动。' },
            { day: 'Day 4', title: '文化体验', desc: '参观当地村落、寺庙，体验海岛传统文化和美食。' },
            { day: 'Day 5', title: '返程', desc: '自由活动，根据航班时间送机。' },
        ],
        options: [
            { name: '巴厘岛 5天4晚', price: '¥2,799', id: 'bali_5d' },
            { name: '普吉岛 6天5晚', price: '¥3,999', id: 'phuket_6d' },
            { name: '马尔代夫 7天5晚', price: '¥7,999', id: 'maldives_7d' },
        ],
        includes: ['往返机票', '海滨度假村', '每日早餐', '机场接送', '浮潜装备', '旅行保险']
    },
    culture: {
        name: '🏛️ 文化探索套餐',
        subtitle: '欧洲、日本、东南亚 | 7-10天',
        img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
        description: '深入探索世界文化遗产，感受不同文明的魅力。从欧洲古城到东方古都，由资深文化导游带你领略历史底蕴，品尝地道美食，体验最纯粹的文化之旅。',
        price: '¥5,299',
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
            { name: '欧洲四国 10天9晚', price: '¥12,999', id: 'europe_10d' },
            { name: '日本深度 7天6晚', price: '¥5,299', id: 'japan_7d' },
            { name: '东南亚文化 8天7晚', price: '¥2,799', id: 'seasia_8d' },
        ],
        includes: ['往返机票', '四星级酒店', '资深文化导游', '景点门票', '特色餐食', '旅行保险']
    },
    city: {
        name: '🌆 城市漫游套餐',
        subtitle: '东京、首尔、曼谷、新加坡 | 4-6天',
        img: 'https://images.unsplash.com/photo-1534430480872-3498386e6296?w=800&q=80',
        description: '感受亚洲最繁华都市的脉动！从东京的潮流前沿到首尔的韩流文化，从曼谷的烟火气息到新加坡的花园城市，每条线路都精心设计了自由探索与深度体验的完美平衡。',
        price: '¥2,599',
        itineraries: [
            { day: 'Day 1', title: '抵达城市', desc: '接机入住市中心酒店，自由探索周边。' },
            { day: 'Day 2', title: '城市地标打卡', desc: '游览城市标志性景点，感受都市魅力。' },
            { day: 'Day 3', title: '自由活动', desc: '全天自由活动（赠送交通卡，轻松出行）。' },
            { day: 'Day 4', title: '特色街区探索', desc: '探访当地特色街区、市场，体验城市生活。' },
            { day: 'Day 5', title: '返程', desc: '自由活动，前往机场返程。' },
        ],
        options: [
            { name: '东京 5天4晚', price: '¥3,299', id: 'tokyo_5d' },
            { name: '首尔 5天4晚', price: '¥1,299', id: 'seoul_5d' },
            { name: '曼谷+芭提雅 6天5晚', price: '¥2,599', id: 'bangkok_6d' },
        ],
        includes: ['往返机票', '市中心酒店', '交通卡赠送', '自由活动充裕', '中文服务', '旅行保险']
    },
    // 南京精选游
    nanjing_tour: {
        name: '🏯 南京古都深度游',
        subtitle: '六朝古都·秦淮风韵 | 4天3晚',
        img: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80',
        description: '南京，六朝古都，十朝都会。MYL 精心打造的南京深度游线路，带你穿越千年历史长河。从中山陵的庄严到夫子庙的繁华，从明孝陵的皇家气派到老门东的市井烟火，全方位感受这座历史文化名城的独特魅力。',
        price: '¥1,499',
        itineraries: [
            { day: 'Day 1', title: '抵达南京 · 秦淮夜色', desc: '接站入住酒店，傍晚游览夫子庙秦淮河风光带，乘画舫游秦淮河，品尝南京特色小吃（鸭血粉丝汤、小笼包）。' },
            { day: 'Day 2', title: '钟山风景区 · 中山陵', desc: '全天游览钟山风景区：中山陵（392级台阶）、明孝陵（神道石刻）、灵谷寺。晚上逛老门东历史街区，品南京盐水鸭。' },
            { day: 'Day 3', title: '南京博物院 · 总统府', desc: '上午参观南京博物院（一院六馆，看镇馆之宝），下午游览总统府（中国近代史博物馆），傍晚逛1912街区。' },
            { day: 'Day 4', title: '牛首山/栖霞山 · 返程', desc: '上午游览牛首山（佛顶宫）或栖霞山（秋季赏枫），下午根据航班/高铁时间送站返程。' },
        ],
        options: [
            { name: '南京经典 4天3晚', price: '¥1,499', id: 'nanjing_3d' },
            { name: '南京+扬州 5天4晚', price: '¥2,599', id: 'nanjing_5d' },
            { name: '南京+苏州+杭州 7天6晚', price: '¥3,999', id: 'nanjing_7d' },
        ],
        includes: ['往返高铁票', '四星级酒店', '秦淮河游船', '景点门票', '南京特色美食', '旅行保险']
    },
    // 六安大别山之旅
    luan_tour: {
        name: '⛰️ 六安·大别山生态游',
        subtitle: '山水六安·生态天堂 | 4天3晚',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        description: '六安，位于安徽省西部，大别山北麓，是一座集山水风光与红色文化于一体的魅力之城。天堂寨的雄奇险秀、万佛湖的碧波万顷、大别山主峰的云海日出，是回归自然、放松身心的绝佳目的地。',
        price: '¥1,399',
        itineraries: [
            { day: 'Day 1', title: '抵达六安 · 市区休闲', desc: '接站入住酒店，傍晚游览月亮岛、六安古城墙，品尝六安特色美食（皖西大白鹅、蒿子粑粑）。' },
            { day: 'Day 2', title: '天堂寨风景区', desc: '全天游览天堂寨：登山观瀑布群、走玻璃栈道、探秘白马大峡谷。感受"吴楚东南第一关"的雄奇壮美。' },
            { day: 'Day 3', title: '万佛湖 · 大别山主峰', desc: '上午游览万佛湖风景区（乘船游湖、登岛观光），下午前往大别山主峰景区，欣赏云海日落。' },
            { day: 'Day 4', title: '霍山石斛园 · 返程', desc: '参观霍山石斛种植基地，品六安瓜片茶，下午根据时间送站返程。' },
        ],
        options: [
            { name: '六安经典 4天3晚', price: '¥1,399', id: 'luan_4d' },
            { name: '六安+合肥 5天4晚', price: '¥1,499', id: 'luan_6d' },
            { name: '大别山徒步 5天4晚', price: '¥1,299', id: 'luan_5d' },
        ],
        includes: ['往返交通', '三星级酒店', '景点门票', '景区交通车', '六安瓜片品鉴', '旅行保险']
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
};

function showOptionDetail(optionId) {
    const data = optionDetails[optionId];
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
            <button class="btn-back" onclick="openTourModal('${optionId.includes('nanjing') ? 'nanjing_tour' : 'luan_tour'}')" style="background:none;border:none;color:var(--primary);cursor:pointer;font-size:0.95rem;margin-bottom:16px;padding:0"><i class="fas fa-arrow-left"></i> 返回套餐列表</button>
            <h2>${data.name}</h2>
            <div class="modal-subtitle">详细行程 · ${data.price}</div>
            <img class="modal-hero" src="${data.img}" alt="${data.name}" />
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 方案介绍</h3>
                <p>${data.description}</p>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-route"></i> 详细行程</h3>
                ${itineraryHtml}
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

    const optionsHtml = data.options.map((opt, idx) => `
        <div class="itinerary-day option-item" style="border-left-color:var(--accent);cursor:pointer" onclick="${opt.id ? `showOptionDetail('${opt.id}')` : `alert('该方案详情即将上线，请咨询客服')`}">
            <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
                <div>
                    <h4 style="color:var(--text)">${opt.name}</h4>
                    ${opt.id ? '<span style="font-size:0.8rem;color:var(--primary)"><i class="fas fa-chevron-right"></i> 查看详细行程</span>' : '<span style="font-size:0.8rem;color:var(--text-light)">即将上线</span>'}
                </div>
                <span style="font-weight:700;color:var(--primary);font-size:1.1rem">${opt.price}</span>
            </div>
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
