// Script to generate enriched tourData
const fs = require('fs');

const tourData = {
    island: {
        name: '🌴 海岛度假套餐',
        subtitle: '马尔代夫、巴厘岛、普吉岛 | 5-7天',
        img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        cover: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80',
        description: '逃离喧嚣，投入碧海蓝天的怀抱。精选全球最美海岛目的地，享受阳光、沙滩和清澈见底的海水。无论是蜜月旅行还是家庭度假，我们为你安排最完美的海岛假期。',
        price: '¥2,799',
        days: '5-7天',
        countryTag: '🌍 国外',
        country: '国外',
        routePins: ['抵达海岛', '出海浮潜', '自由活动', '文化体验', '返程'],
        realCoords: [[103.8198,1.3521],[100.5018,13.7563],[115.8987,-8.3405],[73.2207,4.1755]],
        mapPoints: [
            { name: '新加坡', x: 15, y: 60, day: 1 },
            { name: '普吉岛', x: 35, y: 55, day: 2 },
            { name: '巴厘岛', x: 55, y: 65, day: 3 },
            { name: '马尔代夫', x: 75, y: 45, day: 4 },
            { name: '返程', x: 90, y: 50, day: 5 }
        ],
        tags: ['蜜月首选', '亲子度假', '浮潜圣地', '阳光沙滩'],
        coverages: ['浮潜体验', 'SPA放松', '文化探访', '海滨晚宴'],
        flights: [
            { from: '中国', to: '巴厘岛/普吉岛', price: '¥1,200-2,500', time: '6-8小时', bookingUrl: 'https://www.skyscanner.com' },
            { from: '中国', to: '马尔代夫', price: '¥3,500-6,000', time: '8-10小时', bookingUrl: 'https://www.skyscanner.com' }
        ],
        trains: [],
        hotels: [
            { name: '巴厘岛海滨度假村', tier: 'luxury', price: '¥1,500/晚', area: '乌鲁瓦图悬崖', highlight: '无边泳池+悬崖海景', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '普吉岛海景酒店', tier: 'comfort', price: '¥800/晚', area: '卡塔海滩', highlight: '私人沙滩+日落景观', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '马尔代夫水上别墅', tier: 'luxury', price: '¥3,000/晚', area: '水上屋', highlight: '玻璃地板+直接下海', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', bookingUrl: 'https://www.booking.com' }
        ],
        foods: [
            { name: '海鲜烧烤大餐', desc: '海边餐厅现点现烤，配当地水果鸡尾酒', price: '¥150-250/人' },
            { name: '印尼传统脏摊美食', desc: '巴厘岛本地小吃摊位，体验市井烟火', price: '¥30-80/人' },
            { name: '蜜月烛光晚宴', desc: '私人沙滩上的浪漫晚餐，香槟配海鲜', price: '¥500+/人' }
        ],
        transport: [
            { label: '接机服务', value: '套餐包含机场接送' },
            { label: '当地交通', value: '酒店包车/摩托车租赁 ¥100-200/天' },
            { label: '出海费用', value: '浮潜一日游 ¥200-400/人' }
        ],
        tips: [
            '海岛紫外线极强，务必带高倍防晒霜（SPF50+）',
            '出海浮潜请穿救生衣，注意珊瑚礁保护',
            '马尔代夫建议带美元现金，小费文化普遍',
            '雨季（5-10月）可能有阵雨，但通常不影响行程',
            '预订水上活动建议提前1-2天，避免旺季无位'
        ],
        budget: [
            { label: '机票', value: '¥1,200-6,000' },
            { label: '住宿', value: '¥800-3,000/晚' },
            { label: '餐饮', value: '¥150-300/天' },
            { label: '活动', value: '¥200-500/项' },
            { label: '合计/人', value: '¥2,799-15,000' }
        ],
        itineraries: [
            { day: 'Day 1', theme: '抵达海岛', desc: '专车接机，入住海滨度假村，享受欢迎晚宴。', timeline: [
                { time: '08:00', activity: '出发航班', detail: '从国内城市出发，飞往海岛目的地', duration: '6-10小时', tip: '选靠窗座位看云海' },
                { time: '14:00-18:00', activity: '抵达·接机', detail: '专车机场接机，沿途欣赏热带风光', duration: '1小时' },
                { time: '19:00', activity: '入住度假村', detail: '办理入住，享受迎宾鸡尾酒和冷毛巾', duration: '30分钟' },
                { time: '20:00', activity: '欢迎晚宴', detail: '海边餐厅享用当地特色海鲜大餐', duration: '2小时', price: '含在套餐内' }
            ]},
            { day: 'Day 2', theme: '出海浮潜', desc: '乘船出海，在珊瑚礁间浮潜，与热带鱼群共舞。', timeline: [
                { time: '07:00', activity: '酒店早餐', detail: '丰盛的国际自助早餐', duration: '1小时' },
                { time: '09:00', activity: '出海出发', detail: '乘坐快艇前往浮潜圣地，约45分钟船程', duration: '1小时', tip: '提前涂好防晒霜' },
                { time: '10:00', activity: '珊瑚礁浮潜', detail: '专业教练带领，观赏彩色珊瑚和热带鱼群', duration: '2小时', ticket: '含在套餐内' },
                { time: '12:30', activity: '海上午餐', detail: '船上BBQ午餐，欣赏海景', duration: '1.5小时' },
                { time: '15:00', activity: '返程酒店', detail: '返回酒店休息或自由活动', duration: '1小时' }
            ]},
            { day: 'Day 3', theme: '自由活动', desc: '全天自由活动，享受SPA、沙滩日光浴或水上运动。', timeline: [
                { time: '08:00', activity: '早餐后自由安排', detail: '可选项目：SPA、深潜、冲浪、钓鱼', duration: '全天自由', price: 'SPA ¥300-600' },
                { time: '12:00', activity: '沙滩日光浴', detail: '躺椅+遮阳伞，享受午后阳光', duration: '2小时', tip: '中午11-14点紫外线最强，注意防晒' },
                { time: '14:00', activity: '水上运动（可选）', detail: '拖拽伞、香蕉船、皮划艇等', duration: '2小时', price: '¥150-300/项' },
                { time: '18:00', activity: '看日落', detail: '海边酒吧看夕阳，喝杯热带鸡尾酒', duration: '1小时' }
            ]},
            { day: 'Day 4', theme: '文化体验', desc: '参观当地村落、寺庙，体验海岛传统文化和美食。', timeline: [
                { time: '08:30', activity: '前往当地村落', detail: '包车前往岛上村落，了解原住民文化', duration: '1.5小时' },
                { time: '10:00', activity: '参观寺庙/景点', detail: '参观当地著名寺庙或文化景点', duration: '2小时', ticket: '¥50-100' },
                { time: '12:30', activity: '当地特色午餐', detail: '在村民家品尝传统料理', duration: '1.5小时', price: '¥50-100' },
                { time: '14:30', activity: '购物时间', detail: '在当地市场购买手工纪念品', duration: '2小时' },
                { time: '17:00', activity: '返回酒店', detail: '整理行装，为明天返程做准备', duration: '1小时' }
            ]},
            { day: 'Day 5', theme: '返程', desc: '自由活动，根据航班时间送机。', timeline: [
                { time: '07:30', activity: '早起·看日出', detail: '最后一次在海边看日出美景', duration: '1小时', tip: '日出约6点，提前起床' },
                { time: '09:00', activity: '早餐·退房', detail: '享用最后一顿酒店早餐，办理退房', duration: '1小时' },
                { time: '10:30', activity: '前往机场', detail: '酒店送机，国际航班建议提前4小时', duration: '1-2小时' },
                { time: '14:00+', activity: '值机·航班返程', detail: '办理值机、过安检，在机场免税店最后扫货', duration: '飞行中' }
            ]}
        ],
        options: [
            { name: '巴厘岛 5天4晚', price: '¥2,799', id: 'bali_5d' },
            { name: '普吉岛 6天5晚', price: '¥3,999', id: 'phuket_6d' },
            { name: '马尔代夫 7天5晚', price: '¥7,999', id: 'maldives_7d' }
        ],
        includes: ['往返机票', '海滨度假村', '每日早餐', '机场接送', '浮潜装备', '旅行保险']
    },
    culture: {
        name: '🏛️ 文化探索套餐',
        subtitle: '欧洲、日本、东南亚 | 7-10天',
        img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
        cover: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80',
        description: '深入探索世界文化遗产，感受不同文明的魅力。从欧洲古城到东方古都，由资深文化导游带你领略历史底蕴，品尝地道美食，体验最纯粹的文化之旅。',
        price: '¥5,299',
        days: '7-10天',
        countryTag: '🌍 国外',
        country: '国外',
        routePins: ['抵达目的地', '世界遗产探访', '博物馆之旅', '传统手工艺', '美食探索', '自由探索', '返程'],
        realCoords: [[2.3522,48.8566],[12.4964,41.9028],[139.6917,35.6895],[116.3974,39.9042]],
        mapPoints: [
            { name: '巴黎', x: 20, y: 35, day: 1 },
            { name: '罗马', x: 30, y: 45, day: 2 },
            { name: '东京', x: 75, y: 40, day: 3 },
            { name: '北京', x: 65, y: 55, day: 4 },
            { name: '自由探索', x: 50, y: 60, day: 6 },
            { name: '返程', x: 85, y: 50, day: 7 }
        ],
        tags: ['世界遗产', '深度文化', '博物馆控', '历史爱好者'],
        coverages: ['世遗探访', '博物馆', '手工艺体验', '美食课程'],
        flights: [
            { from: '中国', to: '欧洲', price: '¥3,500-8,000', time: '10-12小时', bookingUrl: 'https://www.skyscanner.com' },
            { from: '中国', to: '日本', price: '¥1,500-3,500', time: '3-4小时', bookingUrl: 'https://www.skyscanner.com' }
        ],
        trains: [],
        hotels: [
            { name: '巴黎市中心酒店', tier: 'comfort', price: '¥1,200/晚', area: '圣日耳曼区', highlight: '步行可达卢浮宫', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '东京银座商务酒店', tier: 'comfort', price: '¥1,000/晚', area: '银座', highlight: '交通便利+周边购物', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '罗马历史酒店', tier: 'comfort', price: '¥1,100/晚', area: '斗兽场附近', highlight: '古典风格+近遗址', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', bookingUrl: 'https://www.booking.com' }
        ],
        foods: [
            { name: '意大利千层面+红酒', desc: '当地餐厅传统意面配基安帝红酒', price: '¥200-350' },
            { name: '怀石料理', desc: '日本传统高级料理，多道精致菜品', price: '¥400-800' },
            { name: '欧洲街头美食', desc: '可丽饼、炸鱼薯条、法兰克福香肠', price: '¥50-100' }
        ],
        transport: [
            { label: '当地交通', value: '通票/地铁卡 ¥50-100/天' },
            { label: '景点门票', value: '卢浮宫 ¥150、大英博物馆免费、罗马斗兽场 ¥120' },
            { label: '文化课程', value: '烹饪课/手工艺课 ¥300-600' }
        ],
        tips: [
            '欧洲博物馆周一常闭馆，提前查好开放时间',
            '东京地铁复杂，下载Google Maps或换乘案内APP',
            '罗马斗兽场建议提前网上预约，排队很长',
            '欧洲小偷较多，注意随身物品和护照安全',
            '日本公共交通请保持安静，不要打电话'
        ],
        budget: [
            { label: '机票', value: '¥1,500-8,000' },
            { label: '住宿', value: '¥1,000-1,500/晚' },
            { label: '餐饮', value: '¥200-400/天' },
            { label: '景点门票', value: '¥150-500' },
            { label: '合计/人', value: '¥5,299-20,000' }
        ],
        itineraries: [
            { day: 'Day 1', theme: '抵达目的地', desc: '接机入住，参加欢迎说明会。', timeline: [
                { time: '08:00', activity: '出发航班', detail: '从国内出发飞往文化目的地', duration: '3-12小时', tip: '长途航班带U型枕' },
                { time: '14:00-20:00', activity: '抵达·接机', detail: '专车接机入住酒店，短暂休息', duration: '1-2小时' },
                { time: '20:30', activity: '欢迎说明会', detail: '导游介绍行程安排，分发资料包', duration: '1小时' },
                { time: '21:30', activity: '当地特色晚餐', detail: '第一顿当地美食，感受文化氛围', duration: '1.5小时' }
            ]},
            { day: 'Day 2', theme: '世界遗产探访', desc: '全天参观世界文化遗产，由资深文化专家讲解。', timeline: [
                { time: '08:30', activity: '酒店早餐', detail: '自助式当地早餐', duration: '1小时' },
                { time: '09:30', activity: '前往世界遗产地', detail: '专车前往联合国教科文认证的世界遗产', duration: '1-2小时' },
                { time: '11:30', activity: '深度参观·专家讲解', detail: '资深文化专家带领讲解历史背景和艺术价值', duration: '3小时', ticket: '¥120-200', tip: '请使用耳机听讲解' },
                { time: '14:30', activity: '遗产地午餐', detail: '在景点附近的特色餐厅用餐', duration: '1.5小时' },
                { time: '16:30', activity: '自由拍照·文创商店', detail: '购买世界遗产主题纪念品', duration: '1小时' }
            ]},
            { day: 'Day 3', theme: '博物馆之旅', desc: '参观当地最重要的博物馆，深入了解历史文化。', timeline: [
                { time: '08:30', activity: '酒店早餐', detail: '饱吃一顿为博物馆之旅做准备', duration: '1小时' },
                { time: '09:30', activity: '前往博物馆', detail: '前往当地TOP博物馆', duration: '30-60分钟' },
                { time: '10:30', activity: '博物馆深度游览', detail: '参观镇馆之宝，听导览讲解，拍照记录', duration: '4小时', ticket: '¥50-150', tip: '请提前预约讲解器' },
                { time: '14:30', activity: '博物馆餐厅午餐', detail: '博物馆内或附近的特色餐厅', duration: '1.5小时' },
                { time: '16:30', activity: '博物馆商店', detail: '购买艺术画册、文创产品', duration: '1小时' }
            ]},
            { day: 'Day 4', theme: '传统手工艺体验', desc: '参与当地传统手工艺制作，体验匠人精神。', timeline: [
                { time: '08:30', activity: '酒店早餐', detail: '享用早餐后前往手工作坊', duration: '1小时' },
                { time: '09:30', activity: '手工艺作坊参观', detail: '参观传统手工作坊，了解工艺历史', duration: '1.5小时' },
                { time: '11:00', activity: '亲手制作体验', detail: '在匠人指导下亲自制作一件作品', duration: '3小时', price: '¥300-600' },
                { time: '14:00', activity: '作坊午餐', detail: '与匠人一起享用传统便当/午餐', duration: '1小时' },
                { time: '15:00', activity: '作品烧制·带走纪念', detail: '作品现场烧制或寄回国内', duration: '30分钟' }
            ]},
            { day: 'Day 5', theme: '美食探索', desc: '品尝地道美食，参加烹饪课程。', timeline: [
                { time: '08:30', activity: '市场游览', detail: '跟随导游逛当地传统市场，认识食材', duration: '1.5小时' },
                { time: '10:00', activity: '烹饪课程', detail: '在专业厨师带领下学做2-3道当地菜', duration: '3小时', price: '¥400-800' },
                { time: '13:00', activity: '品尝自己的作品', detail: '享用亲手做的料理，配当地酒', duration: '1.5小时' },
                { time: '15:00', activity: '美食街区自由探索', detail: '在当地美食街自由品尝各种小吃', duration: '2小时', tip: '每样少量多尝试' },
                { time: '18:00', activity: '告别晚餐', detail: '在当地最好的餐厅吃一顿', duration: '2小时' }
            ]},
            { day: 'Day 6', theme: '自由探索', desc: '自由活动，推荐深度文化体验项目。', timeline: [
                { time: '全天', activity: '自由安排', detail: '可选：深度游小众景点、看演出、逛书店', duration: '自由时间', tip: '推荐小众美术馆或古典音乐会' }
            ]},
            { day: 'Day 7', theme: '返程', desc: '自由活动，前往机场返程。', timeline: [
                { time: '08:00', activity: '酒店早餐', detail: '最后一顿酒店早餐', duration: '1小时' },
                { time: '09:30', activity: '退房·最后采买', detail: '办理退房，在机场前最后逛一下', duration: '1.5小时' },
                { time: '11:00', activity: '前往机场', detail: '酒店送机前往机场', duration: '1-2小时' },
                { time: '13:00+', activity: '值机·返程', detail: '办理登机，过安检，登机回家', duration: '飞行中' }
            ]}
        ],
        options: [
            { name: '欧洲四国 10天9晚', price: '¥12,999', id: 'europe_10d' },
            { name: '日本深度 7天6晚', price: '¥5,299', id: 'japan_7d' },
            { name: '东南亚文化 8天7晚', price: '¥2,799', id: 'seasia_8d' }
        ],
        includes: ['往返机票', '四星级酒店', '资深文化导游', '景点门票', '特色餐食', '旅行保险']
    },
    city: {
        name: '🌆 城市漫游套餐',
        subtitle: '东京、首尔、曼谷、新加坡 | 4-6天',
        img: 'https://images.unsplash.com/photo-1534430480872-3498386e6296?w=800&q=80',
        cover: 'https://images.unsplash.com/photo-1534430480872-3498386e6296?w=1200&q=80',
        description: '感受亚洲最繁华都市的脉动！从东京的潮流前沿到首尔的韩流文化，从曼谷的烟火气息到新加坡的花园城市，每条线路都精心设计了自由探索与深度体验的完美平衡。',
        price: '¥2,599',
        days: '4-6天',
        countryTag: '🌍 国外',
        country: '国外',
        routePins: ['抵达城市', '城市地标打卡', '自由活动', '特色街区探索', '返程'],
        realCoords: [[139.6917,35.6895],[126.9780,37.5665],[100.5018,13.7563],[103.8198,1.3521]],
        mapPoints: [
            { name: '东京', x: 80, y: 30, day: 1 },
            { name: '首尔', x: 65, y: 25, day: 2 },
            { name: '曼谷', x: 45, y: 50, day: 3 },
            { name: '新加坡', x: 55, y: 70, day: 4 },
            { name: '返程', x: 90, y: 50, day: 5 }
        ],
        tags: ['都市潮流', '购物天堂', '霓虹夜景', '韩流文化'],
        coverages: ['地标打卡', '购物体验', '美食探店', '夜景欣赏'],
        flights: [
            { from: '中国', to: '东京', price: '¥1,500-3,500', time: '3-4小时', bookingUrl: 'https://www.skyscanner.com' },
            { from: '中国', to: '首尔', price: '¥800-2,000', time: '2-3小时', bookingUrl: 'https://www.skyscanner.com' },
            { from: '中国', to: '曼谷', price: '¥1,000-2,500', time: '3-4小时', bookingUrl: 'https://www.skyscanner.com' }
        ],
        trains: [],
        hotels: [
            { name: '东京新宿商务酒店', tier: 'comfort', price: '¥900/晚', area: '新宿', highlight: '近地铁站+购物便利', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '首尔明洞酒店', tier: 'comfort', price: '¥800/晚', area: '明洞', highlight: '步行可达购物街', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '曼谷暹罗酒店', tier: 'comfort', price: '¥600/晚', area: '暹罗商圈', highlight: '泳池+性价比高', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', bookingUrl: 'https://www.booking.com' }
        ],
        foods: [
            { name: '东京拉面', desc: '一兰拉面、无敌家等名店', price: '¥50-100' },
            { name: '韩国烤肉+部队锅', desc: '首尔烤肉店，配韩式小菜无限续', price: '¥150-250' },
            { name: '曼谷街头美食', desc: '冬阴功、芒果糯米饭、泰式炒河粉', price: '¥30-80' }
        ],
        transport: [
            { label: '接机', value: '套餐包含机场接送' },
            { label: '交通卡', value: '赠送当地交通卡（T-Money/SUICA/BTS卡）' },
            { label: '景点门票', value: '东京塔 ¥100、南山塔 ¥80、大皇宫 ¥150' }
        ],
        tips: [
            '东京地铁换乘复杂，建议下载Google Maps',
            '首尔明洞和弘大是购物天堂，支持支付宝/微信',
            '曼谷很热，注意防晒和补水',
            '泰国寺庙需穿长裤/长裙，肩膀遮住',
            '新加坡地铁叫MRT，购票可使用EZ-Link卡'
        ],
        budget: [
            { label: '机票', value: '¥800-3,500' },
            { label: '住宿', value: '¥600-1,000/晚' },
            { label: '餐饮', value: '¥100-200/天' },
            { label: '购物预算', value: '自由消费' },
            { label: '合计/人', value: '¥2,599-10,000' }
        ],
        itineraries: [
            { day: 'Day 1', theme: '抵达城市', desc: '接机入住市中心酒店，自由探索周边。', timeline: [
                { time: '08:00', activity: '出发航班', detail: '国内出发飞往亚洲大都市', duration: '2-4小时', tip: '短途航班可以穿休闲' },
                { time: '12:00-15:00', activity: '抵达·接机入住', detail: '专车机场接机，入住市中心酒店', duration: '1-2小时' },
                { time: '16:00', activity: '周边自由探索', detail: '酒店周边商圈、便利店、交通路线', duration: '1小时' },
                { time: '18:00', activity: '当地第一顿美食', detail: '尝试当地特色小吃或知名餐厅', duration: '1.5小时' },
                { time: '20:00', activity: '夜景初体验', detail: '在酒店附近看城市霓虹灯夜景', duration: '1小时' }
            ]},
            { day: 'Day 2', theme: '城市地标打卡', desc: '游览城市标志性景点，感受都市魅力。', timeline: [
                { time: '08:00', activity: '酒店早餐', detail: '自助早餐或附近便利店', duration: '1小时' },
                { time: '09:00', activity: '前往城市地标', detail: '地铁/专车前往城市最著名地标', duration: '30-60分钟' },
                { time: '10:00', activity: '地标游览·拍照', detail: '登东京塔/南山塔/大皇宫等', duration: '3小时', ticket: '¥80-150' },
                { time: '13:00', activity: '地标附近午餐', detail: '在景点周边餐厅解决午餐', duration: '1小时' },
                { time: '14:30', activity: '第二地标/商圈', detail: '前往下一个标志性地点或购物商圈', duration: '3小时' },
                { time: '18:00', activity: '晚餐+夜景', detail: '美食街/观景台看夜景', duration: '2小时' }
            ]},
            { day: 'Day 3', theme: '自由活动', desc: '全天自由活动（赠送交通卡，轻松出行）。', timeline: [
                { time: '全天', activity: '自由安排', detail: '购物、美食、小众景点、主题乐园等', duration: '自由时间', tip: '使用赠送交通卡，地铁自由行' }
            ]},
            { day: 'Day 4', theme: '特色街区探索', desc: '探访当地特色街区、市场，体验城市生活。', timeline: [
                { time: '09:00', activity: '前往特色街区', detail: '如东京浅草寺、首尔弘大、曼谷恰突恰市场', duration: '30-60分钟' },
                { time: '10:00', activity: '街区深度探索', detail: '逛小店、买手信、体验当地市井', duration: '3小时' },
                { time: '13:00', activity: '当地午餐', detail: '街区里的特色小馆', duration: '1小时' },
                { time: '14:30', activity: '第二街区/体验', detail: '如韩流体验馆、动漫街、按摩SPA', duration: '3小时', price: '按摩 ¥100-200' },
                { time: '18:00', activity: '告别晚餐', detail: '吃一顿最难忘的当地美食', duration: '2小时' }
            ]},
            { day: 'Day 5', theme: '返程', desc: '自由活动，前往机场返程。', timeline: [
                { time: '07:30', activity: '早餐·最后购物', detail: '最后买些伴手礼', duration: '1.5小时', tip: '机场免税店也可以买' },
                { time: '09:30', activity: '退房·前往机场', detail: '酒店送机，国际航班提前4小时', duration: '1-2小时' },
                { time: '12:00+', activity: '值机·返程', detail: '办理登机，回家', duration: '飞行中' }
            ]}
        ],
        options: [
            { name: '东京 5天4晚', price: '¥3,299', id: 'tokyo_5d' },
            { name: '首尔 5天4晚', price: '¥1,299', id: 'seoul_5d' },
            { name: '曼谷+芭提雅 6天5晚', price: '¥2,599', id: 'bangkok_6d' }
        ],
        includes: ['往返机票', '市中心酒店', '交通卡赠送', '自由活动充裕', '中文服务', '旅行保险']
    },
    nanjing_tour: {
        name: '🏯 南京古都深度游',
        subtitle: '六朝古都·秦淮风韵 | 4天3晚',
        img: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=800&q=80',
        cover: 'https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1200&q=80',
        description: '南京，六朝古都，十朝都会。MYL 精心打造的南京深度游线路，带你穿越千年历史长河。从中山陵的庄严到夫子庙的繁华，从明孝陵的皇家气派到老门东的市井烟火，全方位感受这座历史文化名城的独特魅力。',
        price: '¥1,499',
        days: '4天3晚',
        countryTag: '🇨🇳 国内',
        country: '中国',
        routePins: ['夫子庙', '中山陵', '明孝陵', '总统府', '牛首山', '返程'],
        totalKm: '约80km',
        realCoords: [[118.7880,32.0262],[118.8405,32.0581],[118.8333,32.0617],[118.7969,32.0488],[118.7796,31.9922]],
        mapPoints: [
            { name: '夫子庙', x: 50, y: 70, day: 1 },
            { name: '中山陵', x: 60, y: 35, day: 2 },
            { name: '明孝陵', x: 45, y: 25, day: 2 },
            { name: '总统府', x: 40, y: 45, day: 3 },
            { name: '牛首山', x: 55, y: 85, day: 4 },
            { name: '返程', x: 90, y: 50, day: 4 }
        ],
        tags: ['历史古都', '文化深度', '人文体验', '秦淮河'],
        coverages: ['中山陵', '明孝陵', '总统府', '秦淮河', '南京博物院'],
        flights: [
            { from: '北京', to: '南京', price: '¥600-1,200', time: '1.5小时', bookingUrl: 'https://flights.ctrip.com' },
            { from: '广州', to: '南京', price: '¥800-1,500', time: '2小时', bookingUrl: 'https://flights.ctrip.com' }
        ],
        trains: [
            { from: '上海', to: '南京', price: '¥140-300', time: '1.5-3小时', duration: '最快1.5h', bookingUrl: 'https://trains.ctrip.com' },
            { from: '北京', to: '南京', price: '¥400-600', time: '4-6小时', duration: '最快4h', bookingUrl: 'https://trains.ctrip.com' },
            { from: '杭州', to: '南京', price: '¥200-400', time: '1-2小时', duration: '最快1h', bookingUrl: 'https://trains.ctrip.com' }
        ],
        hotels: [
            { name: '南京金陵饭店', tier: 'luxury', price: '¥800/晚', area: '新街口', highlight: '地标酒店+近商圈', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '夫子庙如家精选', tier: 'comfort', price: '¥400/晚', area: '夫子庙商圈', highlight: '步行到秦淮河', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '钟山宾馆', tier: 'comfort', price: '¥500/晚', area: '城东', highlight: '近中山陵+环境好', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', bookingUrl: 'https://www.booking.com' }
        ],
        foods: [
            { name: '南京盐水鸭', desc: '皮白肉嫩、肥而不腻，南京招牌菜', price: '¥60-100/份' },
            { name: '鸭血粉丝汤', desc: '鲜香爽滑，南京人早餐标配', price: '¥20-30/碗' },
            { name: '小笼包', desc: '皮薄馅大汁多，推荐尹氏鸡汁汤包', price: '¥25-40' },
            { name: '秦淮八绝', desc: '八种南京传统小吃组合', price: '¥80-120' }
        ],
        transport: [
            { label: '接机/接站', value: '套餐包含机场/高铁站接送' },
            { label: '市内交通', value: '南京地铁发达，推荐办地铁卡' },
            { label: '景点间交通', value: '专车接送/旅游大巴' }
        ],
        tips: [
            '中山陵有392级台阶，建议穿舒适的鞋',
            '明孝陵神道秋天最美（银杏），春天梅花山赏花',
            '夫子庙秦淮河画舫建议坐晚班，夜景最美',
            '南京博物院需要提前预约，周一闭馆',
            '总统府周一也闭馆，合理安排行程'
        ],
        budget: [
            { label: '高铁/机票', value: '¥140-1,500' },
            { label: '住宿', value: '¥400-800/晚×3' },
            { label: '餐饮', value: '¥80-150/天' },
            { label: '景点门票', value: '约¥300' },
            { label: '合计/人', value: '¥1,499起' }
        ],
        itineraries: [
            { day: 'Day 1', theme: '抵达南京·秦淮夜色', desc: '接站入住酒店，傍晚游览夫子庙秦淮河风光带，乘画舫游秦淮河。', timeline: [
                { time: '09:00-14:00', activity: '抵达南京', detail: '乘高铁/飞机抵达南京，专车接站', duration: '1-2小时' },
                { time: '14:30', activity: '入住酒店', detail: '办理入住，短暂休息', duration: '30分钟' },
                { time: '15:30', activity: '夫子庙游览', detail: '逛夫子庙大成殿、江南贡院', duration: '2小时', ticket: '夫子庙¥30、贡院¥50' },
                { time: '17:30', activity: '秦淮八绝晚餐', detail: '在夫子庙吃南京特色小吃', duration: '1.5小时', price: '¥80-120' },
                { time: '19:00', activity: '秦淮河画舫夜游', detail: '乘画舫游秦淮河，听讲解，看两岸灯光', duration: '1小时', ticket: '¥100', tip: '晚班夜景最美' }
            ]},
            { day: 'Day 2', theme: '钟山风景区·中山陵', desc: '全天游览钟山风景区：中山陵、明孝陵、灵谷寺。晚上逛老门东。', timeline: [
                { time: '08:00', activity: '酒店早餐', detail: '饱吃一顿准备登山', duration: '1小时' },
                { time: '09:00', activity: '中山陵', detail: '登392级台阶谒国父陵寝，气势磅礴', duration: '2.5小时', ticket: '免费', tip: '台阶多，穿好鞋' },
                { time: '12:00', activity: '陵区午餐', detail: '在景区附近餐厅用餐', duration: '1小时' },
                { time: '13:30', activity: '明孝陵', detail: '游览世界文化遗产，神道石刻+梅花山', duration: '2.5小时', ticket: '¥70', tip: '神道是拍照圣地' },
                { time: '16:30', activity: '灵谷寺', detail: '看国民革命军阵亡将士纪念塔', duration: '1.5小时', ticket: '¥35' },
                { time: '18:30', activity: '老门东晚餐', detail: '逛老门东历史街区，品盐水鸭', duration: '2小时', price: '¥100-200' }
            ]},
            { day: 'Day 3', theme: '南京博物院·总统府', desc: '上午参观南京博物院，下午游览总统府，傍晚逛1912街区。', timeline: [
                { time: '08:30', activity: '酒店早餐', detail: '享用早餐后前往博物院', duration: '1小时' },
                { time: '09:30', activity: '南京博物院', detail: '参观一院六馆，看镇馆之宝（金缕玉衣、青花瓷等）', duration: '4小时', ticket: '免费（需预约）', tip: '周一闭馆！' },
                { time: '13:30', activity: '午餐', detail: '在附近餐厅吃饭', duration: '1小时' },
                { time: '14:30', activity: '总统府', detail: '游览中国近代史博物馆，看民国建筑', duration: '2.5小时', ticket: '¥35', tip: '周一闭馆' },
                { time: '17:30', activity: '1912街区', detail: '逛民国风格街区，喝咖啡、吃晚餐', duration: '2小时' },
                { time: '19:30', activity: '最后晚餐', detail: '品尝南京最好吃的盐水鸭', duration: '1.5小时' }
            ]},
            { day: 'Day 4', theme: '牛首山·返程', desc: '上午游览牛首山（佛顶宫）或栖霞山，下午返程。', timeline: [
                { time: '08:00', activity: '酒店早餐', detail: '最后一顿酒店早餐', duration: '1小时' },
                { time: '09:00', activity: '牛首山风景区', detail: '游览牛首山，参观佛顶宫（震撼建筑）', duration: '3小时', ticket: '¥98', tip: '佛顶宫地下层必看' },
                { time: '12:00', activity: '午餐·退房', detail: '景区附近午餐后返回酒店退房', duration: '1.5小时' },
                { time: '14:00', activity: '最后自由活动', detail: '酒店附近买伴手礼（盐水鸭、雨花茶）', duration: '1小时' },
                { time: '15:30', activity: '前往机场/高铁站', detail: '专车送站返程', duration: '1-2小时' }
            ]}
        ],
        options: [
            { name: '南京经典 4天3晚', price: '¥1,499', id: 'nanjing_3d' },
            { name: '南京+扬州 5天4晚', price: '¥2,599', id: 'nanjing_5d' },
            { name: '南京+苏州+杭州 7天6晚', price: '¥3,999', id: 'nanjing_7d' }
        ],
        includes: ['往返高铁票', '四星级酒店', '秦淮河游船', '景点门票', '南京特色美食', '旅行保险']
    },
    luan_tour: {
        name: '⛰️ 六安·大别山生态游',
        subtitle: '山水六安·生态天堂 | 4天3晚',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
        cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        description: '六安，位于安徽省西部，大别山北麓，是一座集山水风光与红色文化于一体的魅力之城。天堂寨的雄奇险秀、万佛湖的碧波万顷、大别山主峰的云海日出，是回归自然、放松身心的绝佳目的地。',
        price: '¥1,399',
        days: '4天3晚',
        countryTag: '🇨🇳 国内',
        country: '中国',
        routePins: ['六安市区', '天堂寨', '万佛湖', '大别山主峰', '霍山石斛园', '返程'],
        totalKm: '约200km',
        realCoords: [[116.5116,31.7340],[115.5378,31.1881],[116.3408,31.3886],[115.9028,31.0836],[116.3383,31.3486]],
        mapPoints: [
            { name: '六安', x: 50, y: 50, day: 1 },
            { name: '天堂寨', x: 20, y: 15, day: 2 },
            { name: '万佛湖', x: 45, y: 35, day: 3 },
            { name: '大别山主峰', x: 30, y: 25, day: 3 },
            { name: '霍山石斛园', x: 55, y: 45, day: 4 },
            { name: '返程', x: 90, y: 50, day: 4 }
        ],
        tags: ['生态山水', '大别山', '自然风光', '红色文化'],
        coverages: ['天堂寨', '万佛湖', '大别山主峰', '霍山石斛', '六安瓜片'],
        flights: [
            { from: '合肥', to: '六安(无机场)', price: '转高铁/大巴', time: '合肥新桥机场→六安约2小时', bookingUrl: 'https://trains.ctrip.com' }
        ],
        trains: [
            { from: '合肥', to: '六安', price: '¥60-120', time: '30-60分钟', duration: '最快30min', bookingUrl: 'https://trains.ctrip.com' },
            { from: '上海', to: '六安', price: '¥200-400', time: '2-3小时', duration: '最快2h', bookingUrl: 'https://trains.ctrip.com' },
            { from: '南京', to: '六安', price: '¥150-300', time: '1.5-2.5小时', duration: '最快1.5h', bookingUrl: 'https://trains.ctrip.com' }
        ],
        hotels: [
            { name: '六安曙光铂尊酒店', tier: 'comfort', price: '¥400/晚', area: '市中心', highlight: '商务型+近月亮岛', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '天堂寨度假山庄', tier: 'comfort', price: '¥350/晚', area: '天堂寨景区内', highlight: '近景区入口+空气好', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400', bookingUrl: 'https://www.booking.com' },
            { name: '万佛湖度假村', tier: 'comfort', price: '¥380/晚', area: '万佛湖边', highlight: '湖景房+休闲放松', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', bookingUrl: 'https://www.booking.com' }
        ],
        foods: [
            { name: '皖西大白鹅', desc: '六安特色，肉质鲜嫩，炖煲汤最佳', price: '¥80-150/份' },
            { name: '蒿子粑粑', desc: '用白蒿和米粉做的传统小吃', price: '¥5-10/个' },
            { name: '金寨吊锅', desc: '大别山特色，吊锅炖土鸡/腊肉', price: '¥150-200' },
            { name: '六安瓜片茶', desc: '中国十大名茶，明清贡茶', price: '¥100-500/斤' }
        ],
        transport: [
            { label: '接机/接站', value: '套餐包含高铁站接送' },
            { label: '景区交通', value: '旅游大巴全程接送' },
            { label: '天堂寨索道', value: '单程¥70，往返¥130（可选）' }
        ],
        tips: [
            '天堂寨海拔较高，早晚温差大，带件外套',
            '山区天气多变，建议带伞',
            '登山穿防滑运动鞋',
            '六安瓜片是中国十大名茶，值得买回家',
            '霍山石斛是名贵中药材，注意辨别真伪'
        ],
        budget: [
            { label: '高铁', value: '¥60-400' },
            { label: '住宿', value: '¥350-400/晚×3' },
            { label: '餐饮', value: '¥80-150/天' },
            { label: '景点门票', value: '约¥300' },
            { label: '合计/人', value: '¥1,399起' }
        ],
        itineraries: [
            { day: 'Day 1', theme: '抵达六安·市区休闲', desc: '接站入住酒店，傍晚游览月亮岛、六安古城墙，品尝六安特色美食。', timeline: [
                { time: '09:00-13:00', activity: '抵达六安', detail: '乘高铁/大巴抵达六安，专车接站', duration: '1小时' },
                { time: '14:00', activity: '入住酒店', detail: '办理入住，短暂休息', duration: '30分钟' },
                { time: '15:00', activity: '月亮岛游览', detail: '漫步淠河岸边月亮岛，看白鹭飞翔', duration: '2小时', tip: '傍晚光线好适合拍照' },
                { time: '17:00', activity: '六安古城墙', detail: '游览六安古城墙，感受老城历史', duration: '1小时' },
                { time: '18:30', activity: '六安特色晚餐', detail: '吃皖西大白鹅、蒿子粑粑等当地菜', duration: '1.5小时', price: '¥120-200' }
            ]},
            { day: 'Day 2', theme: '天堂寨风景区', desc: '全天游览天堂寨：登山观瀑布群、走玻璃栈道、探秘白马大峡谷。', timeline: [
                { time: '07:00', activity: '酒店早餐', detail: '早出发前往天堂寨', duration: '45分钟' },
                { time: '07:45', activity: '出发天堂寨', detail: '大巴前往天堂寨风景区（约2.5小时）', duration: '2.5小时', tip: '山路崎岖，备晕车药' },
                { time: '10:30', activity: '天堂寨·瀑布群', detail: '游览一号瀑布到九号瀑布，看瀑布群奇观', duration: '3小时', ticket: '¥108', tip: '瀑布群需徒步，穿好鞋' },
                { time: '13:30', activity: '景区午餐', detail: '在景区餐厅吃大别山特色菜', duration: '1小时' },
                { time: '14:30', activity: '玻璃栈道+白马大峡谷', detail: '走玻璃栈道、探白马大峡谷', duration: '3小时', ticket: '玻璃栈道¥30' },
                { time: '17:30', activity: '入住天堂寨山庄', detail: '入住景区附近酒店，晚餐吃吊锅', duration: '1小时' }
            ]},
            { day: 'Day 3', theme: '万佛湖·大别山主峰', desc: '上午游览万佛湖，下午前往大别山主峰，欣赏云海日落。', timeline: [
                { time: '07:00', activity: '早起出发', detail: '早起可能看到大别山日出，早餐后出发万佛湖', duration: '1.5小时' },
                { time: '09:30', activity: '万佛湖风景区', detail: '乘船游湖、登岛观光，看湖泊山色', duration: '3小时', ticket: '¥65（含船票）' },
                { time: '12:30', activity: '万佛湖午餐', detail: '吃鱼宴（万佛湖鱼头汤必点）', duration: '1.5小时', price: '¥150-250' },
                { time: '14:30', activity: '大别山主峰', detail: '登上大别山主峰，欣赏云海日落', duration: '3小时', ticket: '¥80', tip: '主峰海拔1729米，温差大' },
                { time: '17:30', activity: '返回六安市区', detail: '大巴返回六安市区酒店', duration: '2.5小时' },
                { time: '20:00', activity: '告别晚餐', detail: '六安最后一顿晚餐，品六安瓜片茶', duration: '1.5小时' }
            ]},
            { day: 'Day 4', theme: '霍山石斛园·返程', desc: '参观霍山石斛园，品六安瓜片茶，下午返程。', timeline: [
                { time: '08:00', activity: '酒店早餐', detail: '最后一顿酒店早餐', duration: '1小时' },
                { time: '09:00', activity: '霍山石斛种植基地', detail: '参观石斛种植基地，了解名贵中药材', duration: '2小时', tip: '可购买正品石斛伴手礼' },
                { time: '11:00', activity: '六安瓜片茶园', detail: '参观六安瓜片茶园，品茶', duration: '1.5小时', price: '可选购茶叶' },
                { time: '12:30', activity: '午餐·退房', detail: '吃午餐后返回酒店退房', duration: '1.5小时' },
                { time: '14:30', activity: '自由活动·买伴手礼', detail: '购买六安特产（大白鹅、茶叶、石斛）', duration: '1小时' },
                { time: '16:00', activity: '送站返程', detail: '专车送到高铁站返程', duration: '30-60分钟' }
            ]}
        ],
        options: [
            { name: '六安经典 4天3晚', price: '¥1,399', id: 'luan_4d' },
            { name: '六安+合肥 5天4晚', price: '¥1,499', id: 'luan_6d' },
            { name: '大别山徒步 5天4晚', price: '¥1,299', id: 'luan_5d' }
        ],
        includes: ['往返交通', '三星级酒店', '景点门票', '景区交通车', '六安瓜片品鉴', '旅行保险']
    }
};

console.log(JSON.stringify(tourData));
