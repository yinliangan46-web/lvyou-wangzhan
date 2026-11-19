// 人格测试 20 型 · 新人格 K-P
Object.assign(personalityTypes, {
    'K': {
        icon: '🗺️', title: '秘境猎奇党', badge: '地图边缘的探险者',
        desc: '热门景点排队的时候你已经在找下一个小众入口。你偏爱地图边缘、交通不便但值得抵达的地方，愿意为一片未被打扰的海子或雪山多走几小时山路。',
        routes: [
            { dest: '稻城亚丁 · 秘境徒步', days: '5天4晚', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达稻城 → 适应海拔 → 休整' },
                { d: 'Day2', t: '亚丁景区 → 冲古寺 → 珍珠海' },
                { d: 'Day3', t: '洛绒牛场 → 牛奶海 → 五色海徒步' },
                { d: 'Day4', t: '村寨慢逛 → 适应下撤' },
                { d: 'Day5', t: '返程' }
              ],
              ai: { budget: '¥3,500-5,000/人', transport: '成都/香格里拉方向班车或包车进沟，景区电瓶车', hotel: '香格里拉镇酒店，海拔较低利于休息', bestTime: '4-5月或9-10月，避开雨季冬季封路',
                timeline: [
                  { d: 'Day1 下午', t: '抵达稻城 → 入住休整适应海拔，不剧烈运动' },
                  { d: 'Day2 全天', t: '亚丁景区 → 冲古寺 → 珍珠海短线徒步' },
                  { d: 'Day3 全天', t: '洛绒牛场 → 牛奶海 → 五色海长线徒步' },
                  { d: 'Day4 上午', t: '村寨与河谷慢逛 → 下撤休整' },
                  { d: 'Day5 上午', t: '返程' }
                ],
                attractions: [
                  { name: '牛奶海', desc: '雪山环抱的蓝绿色海子，长线徒步终点', price: '景区门票¥146+电瓶车¥120', ctripUrl: 'https://you.ctrip.com/sight/daocheng14/5600.html' },
                  { name: '洛绒牛场', desc: '高山草甸，远眺三神山', price: '含景区票' }
                ],
                foods: [
                  { name: '牦牛肉汤锅', desc: '高原暖身补给，肉实汤浓', price: '¥90/人' },
                  { name: '青稞饼', desc: '粗粮主食，耐饿适合徒步', price: '¥10/块' }
                ],
                hotels: [
                  { name: '香格里拉镇酒店', desc: '海拔低于景区，睡眠更稳', price: '¥300/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/daocheng14.html' }
                ],
                tips: '长线徒步量力而行，高反不适及时下撤；带登山杖、护膝、雨衣；景区内物资贵，自备干粮和水；雨季注意落石与路况。' }
            }
        ]
    },
    'L': {
        icon: '🛍️', title: '潮流买手', badge: '都市审美猎手',
        desc: '你旅行一半在看风景，一半在挑东西。独立买手店、限定款、设计陈列、街区招牌都是你的观察对象，你的行李箱回来时永远比出发时更重。',
        routes: [
            { dest: '香港 · 潮流购物设计线', days: '4天3晚', img: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '尖沙咀海港城 → 维港夜景' },
                { d: 'Day2', t: '铜锣湾 → 中环街市 → 半山扶梯' },
                { d: 'Day3', t: '旺角/深水埗潮流小店 → 文创街区' },
                { d: 'Day4', t: '茶餐厅早茶 → 返程' }
              ],
              ai: { budget: '¥2,500-4,000/人（不含购物）', transport: '港铁为主，过江渡轮体验', hotel: '尖沙咀/旺角附近，近地铁', bestTime: '10月-12月天气较干爽，换季折扣季',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '尖沙咀海港城逛街 → 维港星光大道夜景' },
                  { d: 'Day2 全天', t: '铜锣湾商圈 → 中环街市 → 半山扶梯街拍' },
                  { d: 'Day3 全天', t: '旺角/深水埗潮流小店 → 文创与印刷街区' },
                  { d: 'Day4 上午', t: '茶餐厅早茶 → 返程' }
                ],
                attractions: [
                  { name: '中环街市', desc: '旧街市改造的潮流集合空间', price: '免费' },
                  { name: '维港夜景', desc: '星光大道看港岛灯火与摩天楼', price: '免费' }
                ],
                foods: [
                  { name: '菠萝油', desc: '热酥皮包冰牛油，茶餐厅标配', price: '¥12/个' },
                  { name: '港式奶茶', desc: '丝滑浓厚，冻饮更经典', price: '¥18/杯' }
                ],
                hotels: [
                  { name: '尖沙咀地铁酒店', desc: '逛街过江都方便', price: '¥500/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/hongkong14.html' }
                ],
                tips: '提前办好港澳通行证及签注；港铁按路程计费；大额购物留意退税与保修；小店现金与八达通更方便。' }
            }
        ]
    },
    'M': {
        icon: '🚶', title: '独行观察员', badge: '一个人看世界的人',
        desc: '你享受一个人旅行的节奏：想停就停，想改路线就改。你习惯坐在小馆里看人来人往，用旁观者的眼光记录这座城市，孤独对你来说不是缺点，是视角。',
        routes: [
            { dest: '青岛 · 独自散步看海', days: '4天3晚', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '栈桥海边散步 → 老城区教堂' },
                { d: 'Day2', t: '八大关梧桐街巷 → 第二海水浴场' },
                { d: 'Day3', t: '信号山看红瓦绿树 → 独立咖啡馆' },
                { d: 'Day4', t: '海边早餐 → 返程' }
              ],
              ai: { budget: '¥1,200-2,000/人', transport: '公交+步行，老城片区集中', hotel: '老城区青年旅舍或精品小酒店', bestTime: '5-10月，夏季海边最舒适',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '栈桥海边散步 → 老城教堂广场' },
                  { d: 'Day2 全天', t: '八大关梧桐街巷慢走 → 第二海水浴场' },
                  { d: 'Day3 全天', t: '信号山观景台看红瓦绿树 → 独立咖啡馆久坐' },
                  { d: 'Day4 上午', t: '海边早餐 → 返程' }
                ],
                attractions: [
                  { name: '八大关', desc: '万国建筑与梧桐道，适合一个人 citywalk', price: '免费', ctripUrl: 'https://you.ctrip.com/sight/qingdao14/5700.html' },
                  { name: '信号山公园', desc: '旋转观景台俯瞰老城红瓦与海湾', price: '¥15/人' }
                ],
                foods: [
                  { name: '海鲜水饺', desc: '鲅鱼馅鲜，一人食分量友好', price: '¥35/份' },
                  { name: '青岛啤酒配蛤蜊', desc: '夜市标配，清爽下酒', price: '¥40/份' }
                ],
                hotels: [
                  { name: '老城精品青旅', desc: '公共区域容易搭话，独自出行友好', price: '¥150/床', ctripUrl: 'https://hotels.ctrip.com/hotels/qingdao14.html' }
                ],
                tips: '独行注意随身物品；老城坡路多穿舒适鞋；海鲜先问价；海边风大备外套；夜归选明亮主路。' }
            }
        ]
    },
    'N': {
        icon: '💞', title: '情侣漫游家', badge: '两个人的治愈航线',
        desc: '你的旅行以两个人舒服为前提：不必塞满行程，重在一起慢慢走。江边并肩、竹筏同坐、傍晚找家小馆子分一份菜，照片里最好看的是两个人同框的松弛感。',
        routes: [
            { dest: '桂林 · 双人山水漫游', days: '4天3晚', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达桂林 → 两江四湖夜游' },
                { d: 'Day2', t: '漓江竹筏 → 阳朔西街晚餐' },
                { d: 'Day3', t: '遇龙河双人竹筏 → 田园骑行' },
                { d: 'Day4', t: '晨光山水 → 返程' }
              ],
              ai: { budget: '¥1,800-3,000/人', transport: '市区打车+景区车，双人竹筏与骑行', hotel: '阳朔河畔民宿，带景观房', bestTime: '4-10月，山水绿意最足',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '抵达桂林 → 两江四湖夜游看桥影' },
                  { d: 'Day2 全天', t: '漓江竹筏漂流 → 阳朔西街双人晚餐' },
                  { d: 'Day3 全天', t: '遇龙河双人竹筏 → 田园骑行' },
                  { d: 'Day4 上午', t: '河畔晨光 → 返程' }
                ],
                attractions: [
                  { name: '漓江', desc: '山水画卷，竹筏上并肩看峰林', price: '竹筏¥160/筏', ctripUrl: 'https://you.ctrip.com/sight/guilin14/5800.html' },
                  { name: '遇龙河', desc: '平缓河段，适合双人慢漂', price: '竹筏¥160/筏' }
                ],
                foods: [
                  { name: '桂林米粉', desc: '两人分一碗加双份码', price: '¥15/碗' },
                  { name: '田螺酿', desc: '广西特色，田螺里塞肉馅', price: '¥40/份' }
                ],
                hotels: [
                  { name: '河畔景观民宿', desc: '双人露台看山景，拍照温馨', price: '¥350/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/guilin14.html' }
                ],
                tips: '竹筏提前订双人位；行程留松弛时间；民宿景观房旺季紧张；傍晚河边蚊虫多，备驱蚊。' }
            }
        ]
    },
    'O': {
        icon: '👨‍👩‍👧', title: '亲子松弛派', badge: '带娃也能玩得不累',
        desc: '你出门首要考虑孩子能不能玩得开心、大人能不能歇得下来。行程松、节奏慢、吃住方便、配套友好，那些推车可达、娃有得放电、大人能坐着喝杯东西的地方最合你心意。',
        routes: [
            { dest: '珠海 · 亲子海洋度假', days: '4天3晚', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达珠海 → 海滨情侣路散步' },
                { d: 'Day2', t: '海洋主题乐园全天（亲子项目）' },
                { d: 'Day3', t: '横琴滨海公园 → 亲子酒店休整' },
                { d: 'Day4', t: '早茶 → 返程' }
              ],
              ai: { budget: '¥2,500-3,500/人（儿童票价另计）', transport: '市区打车+乐园接驳车，全程少换乘', hotel: '乐园周边亲子主题酒店，含早餐与班车', bestTime: '3-5月或9-11月，避开酷暑与节假日高峰',
                timeline: [
                  { d: 'Day1 下午', t: '抵达珠海 → 情侣路海滨散步看海' },
                  { d: 'Day2 全天', t: '海洋主题乐园亲子项目全天游玩' },
                  { d: 'Day3 上午-下午', t: '横琴滨海公园放电 → 酒店泳池与亲子设施休整' },
                  { d: 'Day4 上午', t: '粤式早茶 → 返程' }
                ],
                attractions: [
                  { name: '海洋主题乐园', desc: '鲸鲨馆与亲子游乐项目，推车友好', price: '门票约¥395/成人', ctripUrl: 'https://you.ctrip.com/sight/zhuhai14/5900.html', wechatUrl: 'https://mp.weixin.qq.com/s/zhuhai-ocean' },
                  { name: '情侣路', desc: '滨海步道平缓，适合推婴儿车散步', price: '免费' }
                ],
                foods: [
                  { name: '粤式早茶', desc: '虾饺烧卖，孩子也吃得惯', price: '¥60/人' },
                  { name: '白灼海鲜', desc: '清淡鲜甜，适合亲子餐桌', price: '¥70/人' }
                ],
                hotels: [
                  { name: '乐园亲子主题酒店', desc: '含班车与亲子房，免去奔波', price: '¥700/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/zhuhai14.html' }
                ],
                tips: '乐园提前购票并查演出时间；带推车与备用衣物；亲子酒店早餐高峰错峰；行程不要排第二天满场；常备儿童常用药。' }
            }
        ]
    },
    'P': {
        icon: '♨️', title: '温泉养生派', badge: '把行程交给一池热水',
        desc: '你旅行的终点是放松：泡汤、早睡、慢吃、深呼吸。景点在其次，住得舒服、吃得清淡、身体被暖到才是重点，回程时要比出发时更疲惫感清零。',
        routes: [
            { dest: '腾冲 · 温泉康养慢旅', days: '5天4晚', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达腾冲 → 温泉酒店泡汤休整' },
                { d: 'Day2', t: '和顺古镇慢逛 → 家常菜' },
                { d: 'Day3', t: '热海温泉群 → 泡汤理疗' },
                { d: 'Day4', t: '湿地田园散步 → 下午茶' },
                { d: 'Day5', t: '睡到自然醒 → 返程' }
              ],
              ai: { budget: '¥2,000-3,000/人', transport: '县城打车+温泉酒店接驳，慢节奏不赶路', hotel: '带私汤的温泉度假酒店', bestTime: '10月-次年4月，秋冬泡汤最舒服',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '抵达腾冲 → 温泉酒店入住 → 泡汤休整' },
                  { d: 'Day2 全天', t: '和顺古镇慢逛 → 本地家常菜' },
                  { d: 'Day3 全天', t: '热海温泉群 → 泡汤与理疗' },
                  { d: 'Day4 上午-下午', t: '湿地田园散步 → 酒店下午茶' },
                  { d: 'Day5 上午', t: '自然醒 → 返程' }
                ],
                attractions: [
                  { name: '热海温泉', desc: '地热温泉群，多个汤池可选', price: '¥180/人', ctripUrl: 'https://you.ctrip.com/sight/tengchong14/6000.html' },
                  { name: '和顺古镇', desc: '安静侨乡，老宅与稻田环绕', price: '¥55/人' }
                ],
                foods: [
                  { name: '腾冲土锅子', desc: '炭火慢炖的本地杂锅，暖身', price: '¥70/人' },
                  { name: '稀豆粉', desc: '豆类磨浆配油条，清淡早餐', price: '¥12/碗' }
                ],
                hotels: [
                  { name: '私汤温泉度假酒店', desc: '房间带独立泡池，休息质量优先', price: '¥500/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/tengchong14.html' }
                ],
                tips: '泡汤前后多喝水、避免空腹与酒后入池；一次泡汤别超过20分钟；行程留白；秋冬早晚温差大，备保暖衣物。' }
            }
        ]
    }
});
