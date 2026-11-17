// ============================================================
//  人格测试 —— 8种人格 + 线路配图 + AI路书
// ============================================================
const quizQuestions = [
    { q: '早上旅行时，你通常几点醒？', options: [
        { text: '🌅 7点前，爬起来看日出', score: 'A' },
        { text: '☕ 9-10点，慢慢起床觅食', score: 'B' },
        { text: '😴 12点后，睡到自然醒', score: 'C' }
    ]},
    { q: '旅行最重要的是什么？', options: [
        { text: '🏔️ 看到震撼到失语的风景', score: 'A' },
        { text: '🍜 吃到当地人排队的馆子', score: 'B' },
        { text: '📸 拍一组能封神的照片', score: 'C' },
        { text: '👥 认识有趣的旅伴故事', score: 'D' }
    ]},
    { q: '你更喜欢住哪里？', options: [
        { text: '🛏️ 青旅多人间，热闹拼饭', score: 'D' },
        { text: '🏠 设计感民宿，有故事', score: 'C' },
        { text: '🏨 五星酒店，躺平舒服', score: 'B' }
    ]},
    { q: '你能接受的旅行节奏？', options: [
        { text: '🏃 一天跑5个景点，特种兵', score: 'A' },
        { text: '🚶 一天2-3个，慢慢逛', score: 'C' },
        { text: '🛋️ 一天1个，躺平不赶路', score: 'B' }
    ]},
    { q: '你最怕遇到什么？', options: [
        { text: '👨‍👩‍👧‍👦 人挤人，拍不了照', score: 'A' },
        { text: '🗣️ 语言不通吃不到好吃的', score: 'D' },
        { text: '🛌 住得差影响心情', score: 'B' },
        { text: '📵 没网拍不了照发不了圈', score: 'C' }
    ]},
    { q: '旅行回来你最想发什么朋友圈？', options: [
        { text: '🏔️ 雪山/极光/星空大片', score: 'A' },
        { text: '🍱 九宫格美食图配文"绝了"', score: 'B' },
        { text: '🧏 文艺风景+一句短句', score: 'C' },
        { text: '🥂 和旅伴的合照+故事', score: 'D' }
    ]},
    { q: '你更喜欢哪种旅行方式？', options: [
        { text: '🏕️ 自驾/徒步，深入荒野', score: 'A' },
        { text: '🚌 坐公交逛菜市场吃小吃', score: 'B' },
        { text: '🏛️ 逛博物馆/老街区慢慢走', score: 'C' },
        { text: '👫 拼团/青旅，有人带', score: 'D' }
    ]},
    { q: '旅行预算你最愿意花在哪？', options: [
        { text: '🎫 门票/户外体验/跳伞', score: 'A' },
        { text: '🍜 吃！吃！吃！', score: 'B' },
        { text: '🛏️ 住有设计感的酒店/民宿', score: 'C' },
        { text: '🍹 酒吧/社交活动/拼餐', score: 'D' }
    ]},
    { q: '你最喜欢的旅行天气？', options: [
        { text: '❄️ 雪天/极光/极端天气', score: 'A' },
        { text: '☀️ 晴天，逛街吃小吃', score: 'B' },
        { text: '🌧️ 阴雨天，拍文艺照', score: 'C' },
        { text: '🤷 无所谓，关键是和谁', score: 'D' }
    ]},
    { q: '旅途中你最想做的事？', options: [
        { text: '🌅 看日出/日落/极光', score: 'A' },
        { text: '🥘 找当地老字号苍蝇馆', score: 'B' },
        { text: '📚 逛独立书店/咖啡馆', score: 'C' },
        { text: '🎉 参加当地人的聚会/夜市', score: 'D' }
    ]},
    { q: '你更喜欢哪种交通方式？', options: [
        { text: '🚗 自驾/徒步，自由掌控', score: 'A' },
        { text: '🚇 地铁/公交，穿梭市井', score: 'B' },
        { text: '🚞 高铁/慢车，看风景', score: 'C' },
        { text: '🚐 拼车/搭便车，认识人', score: 'D' }
    ]},
    { q: '旅行纪念品你会买什么？', options: [
        { text: '🪨 石头/树叶/自然标本', score: 'A' },
        { text: '🌶️ 当地调味料/零食伴手礼', score: 'B' },
        { text: '🖼️ 明信片/文创周边', score: 'C' },
        { text: '🤝 和旅伴的合影/签名', score: 'D' }
    ]},
    { q: '你更喜欢哪种类型的目的地？', options: [
        { text: '🏞️ 国家公园/荒野/无人区', score: 'A' },
        { text: '🍢 美食之都/夜市/小吃街', score: 'B' },
        { text: '🏘️ 古城/文艺小镇/美术馆', score: 'C' },
        { text: '🏄 派对城市/冲浪小镇', score: 'D' }
    ]},
    { q: '旅行中你最在意什么？', options: [
        { text: '🏔️ 看到别人没看过的风景', score: 'A' },
        { text: '🍜 吃到别人不知道的馆子', score: 'B' },
        { text: '📷 拍到别人拍不到的角度', score: 'C' },
        { text: '👥 认识别人不认识的朋友', score: 'D' }
    ]},
    { q: '如果只能选一个地方待一周，你选？', options: [
        { text: '🏔️ 雪山脚下的小木屋', score: 'A' },
        { text: '🌶️ 美食之都的市中心', score: 'B' },
        { text: '🌊 海边的文艺小镇', score: 'C' },
        { text: '🏝️ 有很多青旅的度假岛', score: 'D' }
    ]}
];

const personalityTypes = {
    'A': {
        icon: '🏔️', title: '极地追光者', badge: '荒野血脉 · 视觉动物',
        desc: '你骨子里流着荒野的血。人多的地方你掉头就走，雪山脚下、极光下、无人区里才是你的主场。你旅行不是为了放松，是为了被震撼到说不出话。',
        routes: [
            { dest: '冰岛 · 极光环岛', days: '7天6晚', img: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '雷克雅未克落地 → 蓝湖温泉泡汤 → 市区漫步' },
                { d: 'Day2', t: '黄金圈：辛格维利尔 → 盖歇尔间歇泉 → 黄金瀑布' },
                { d: 'Day3', t: '南岸：塞里雅兰瀑布 → 斯科加瀑布 → 黑沙滩' },
                { d: 'Day4', t: '冰河湖 → 钻石冰沙滩 → 杰古沙龙游船' },
                { d: 'Day5', t: '东峡湾小镇 → 都皮沃古尔看海豹' },
                { d: 'Day6', t: '米湖地热 → 黛提瀑布 → 众神瀑布' },
                { d: 'Day7', t: '阿克雷里 → 返雷克雅未克追极光夜' }
              ],
              ai: { budget: '¥18,000-25,000/人（含机票+租车+住宿）', transport: '雷克雅未克租车自驾（SUV），环岛约1300km', hotel: '沿途乡村民宿+雷克雅未克市区酒店', bestTime: '9月-3月（极光季），2-3月最佳', tips: '极光是概率事件，至少留3晚在郊外追；加油站间隔远，每次加满；准备防风防水冲锋衣。' }
            },
            { dest: '新疆 · 北疆大环线', days: '8天7晚', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '乌鲁木齐集合 → 国际大巴扎' },
                { d: 'Day2', t: '布尔津 → 五彩滩日落' },
                { d: 'Day3', t: '喀纳斯湖 → 观鱼台 → 三湾徒步' },
                { d: 'Day4', t: '禾木村晨雾 → 图瓦人家访' },
                { d: 'Day5', t: '世界魔鬼城 → 克拉玛依' },
                { d: 'Day6', t: '赛里木湖环湖 → 果子沟大桥' },
                { d: 'Day7', t: '那拉提空中草原' },
                { d: 'Day8', t: '独库公路 → 返乌鲁木齐' }
              ],
              ai: { budget: '¥6,000-9,000/人（含包车+住宿+门票）', transport: '乌鲁木齐包车/SUV，8天约2500km', hotel: '布尔津/喀纳斯/那拉提当地酒店', bestTime: '6-9月，9月金秋最美', tips: '昼夜温差20°C，带羽绒服；独库公路仅6-10月开放；提前办边防证。' }
            },
            { dest: '新西兰 · 南岛自驾', days: '10天9晚', img: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '基督城落地 → 植物园 → 雅芳河撑篙' },
                { d: 'Day2', t: '格雷茅斯 → 薄饼岩 → 千层岩日出' },
                { d: 'Day3', t: '福克斯冰川徒步 → 马瑟森湖镜面倒影' },
                { d: 'Day4', t: '瓦纳卡 → 孤独的树 → 迷幻世界' },
                { d: 'Day5', t: '皇后镇 → 天空缆车 → 瓦卡蒂普湖' },
                { d: 'Day6', t: '米尔福德峡湾游船' },
                { d: 'Day7', t: '但尼丁 → 鲍德温街 → 拉纳克城堡' },
                { d: 'Day8', t: '蒂卡普湖 → 好牧羊人教堂 → 夜间观星' },
                { d: 'Day9', t: '基督城还车 → 南极中心' },
                { d: 'Day10', t: '返程' }
              ],
              ai: { budget: '¥20,000-28,000/人（含机票+租车+住宿）', transport: '基督城取车/还车，右舵左行，10天约2000km', hotel: '各小镇汽车旅馆(B&B)', bestTime: '11月-2月（南半球夏季）', tips: '右舵车需要适应；山路多减速慢行；加油接受信用卡；冰川徒步需穿防水裤。' }
            }
        ]
    },
    'B': {
        icon: '🍜', title: '碳水刺客', badge: '舌头侦探 · 城市猎人',
        desc: '你旅行的KPI就是吃遍当地。大众点评不看，专钻巷子找苍蝇馆。你能为了一碗面飞一座城，朋友圈九宫格全是吃的。',
        routes: [
            { dest: '成都 · 美食猎人之旅', days: '4天3晚', img: 'https://images.unsplash.com/photo-1565992441121-4367c29671e2?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '宽窄巷子 → 奎星楼街冒椒火辣 → 锦里夜市' },
                { d: 'Day2', t: '大熊猫基地 → 建设巷小吃街 → 春熙路' },
                { d: 'Day3', t: '人民公园鹤鸣茶社 → 玉林路小酒馆 → 地道火锅' },
                { d: 'Day4', t: '文殊院 → 洞子口张老二凉粉 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人（吃+住+市内交通）', transport: '地铁+打车，市区内无需租车', hotel: '春熙路/太古里附近舒适酒店', bestTime: '3-6月或9-11月（避开酷暑）', tips: '火锅提前在大众点评取号；兔头/折耳根谨慎尝试；熊猫基地一定要7点前到。' }
            },
            { dest: '曼谷 · 街头美食巡礼', days: '5天4晚', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '考山路夜市 → 芒果糯米饭 → 冬阴功汤' },
                { d: 'Day2', t: '恰图恰周末市场 → 海鲜烧烤 → 泰式奶茶' },
                { d: 'Day3', t: '唐人街耀华力路 → 鱼翅羹 → 燕窝汤' },
                { d: 'Day4', t: '安帕瓦水上市场 → 船面 → 萤火虫夜游' },
                { d: 'Day5', t: 'Terminal 21 → 泰式船面 → 返程' }
              ],
              ai: { budget: '¥3,500-5,000/人（含机票+吃+住）', transport: 'BTS轻轨+湄南河快船+突突车', hotel: '考山路/Sukhumvit区域青旅或经济酒店', bestTime: '11月-2月（凉季）', tips: '路边摊认准本地人多的；肠胃药必带；曼谷堵成狗，尽量坐BTS；给小费20泰铢起。' }
            },
            { dest: '大阪 · 天下厨房', days: '4天3晚', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '道顿堀 → 章鱼烧 → 御好烧 → 串炸' },
                { d: 'Day2', t: '黑门市场 → 和牛刺身 → 海胆饭' },
                { d: 'Day3', t: '新世界 → 通天阁 → 炸串老店' },
                { d: 'Day4', t: '梅田蓝天大厦 → 大阪烧 → 返程' }
              ],
              ai: { budget: '¥5,000-7,000/人（含机票+吃+住）', transport: '地铁/JR，关西机场Haruka号直达', hotel: '难波/心斋桥附近', bestTime: '3-5月或10-11月', tips: '串炸规则：不能二次蘸酱；黑门市场早上8点去最新鲜；药妆店松本清比大国便宜。' }
            }
        ]
    },
    'C': {
        icon: '📸', title: '胶片诗人', badge: '光线捕手 · 质感信徒',
        desc: '你旅行不是赶路，是等光。你会为了一束光在同一个地方蹲两小时。你住酒店先看窗边有没有光，拍照必须胶片滤镜。',
        routes: [
            { dest: '大理 · 有风的地方', days: '5天4晚', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '大理古城入住 → 人民路闲逛 → 黄昏洋人街' },
                { d: 'Day2', t: '洱海生态廊道骑行 → 喜洲稻田 → 海舌公园日落' },
                { d: 'Day3', t: '沙溪古镇 → 寺登街 → 先锋书局 → 石宝山' },
                { d: 'Day4', t: '凤阳邑茶马古道 → 无为寺 → 咖啡馆发呆' },
                { d: 'Day5', t: '苍山洗马潭索道 → 寂照庵吃素斋 → 返程' }
              ],
              ai: { budget: '¥2,500-4,000/人', transport: '大理站/机场到古城打车，环洱海租电动车', hotel: '古城内/才村洱海边民宿', bestTime: '3-5月（油菜花）或9-11月', tips: '洱海骑行选海西生态廊道（免费）；紫外线极强，防晒；节假日环海路堵车建议早出发。' }
            },
            { dest: '京都 · 侘寂巡礼', days: '5天4晚', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '清水寺 → 二年坂三年坂 → 祇园花见小路' },
                { d: 'Day2', t: '金阁寺 → 龙安寺石庭 → 仁和寺' },
                { d: 'Day3', t: '岚山竹林 → 天龙寺 → 渡月桥日落' },
                { d: 'Day4', t: '伏见稻荷大社千本鸟居 → 宇治抹茶体验' },
                { d: 'Day5', t: '哲学之道 → 南禅寺 → 平安神宫 → 返程' }
              ],
              ai: { budget: '¥6,000-9,000/人（含机票+JR Pass+住）', transport: '关西机场Haruka+京都巴士一日券', hotel: '京都站/祇园附近町屋', bestTime: '3-4月樱花或11月红叶', tips: '伏见稻荷早上6点去没人；巴士一日券500日元划算；町屋住宿提前3个月订。' }
            },
            { dest: '厦门 · 海岛慢生活', days: '4天3晚', img: 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab1ed?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '中山路骑楼 → 八市吃海鲜 → 沙坡尾艺术西区' },
                { d: 'Day2', t: '鼓浪屿全天 → 菽庄花园 → 日光岩日落' },
                { d: 'Day3', t: '曾厝垵 → 环岛路骑行 → 黄厝海滩看日出' },
                { d: 'Day4', t: '南普陀寺 → 厦大校园 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人', transport: 'BRT公交+打车，鼓浪屿轮渡', hotel: '思明区/沙坡尾附近设计民宿', bestTime: '10月-4月（避开台风季）', tips: '鼓浪屿船票提前在"厦门轮渡"公众号买；厦大需要提前预约；八市海鲜找加工店注意称重。' }
            }
        ]
    },
    'D': {
        icon: '🎉', title: '旅途交际花', badge: '搭子雷达 · 故事收集者',
        desc: '你一个人出门，但永远不会一个人吃饭。青旅客厅、拼餐局、夜市搭子……你走到哪聊到哪，旅行回来微信多了50个好友。',
        routes: [
            { dest: '巴厘岛 · 冲浪社交岛', days: '6天5晚', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '库塔入住青旅 → 海滩日落 → 青旅欢迎派对' },
                { d: 'Day2', t: '冲浪课（初学者）→ 海滩酒吧 → 篝火晚会' },
                { d: 'Day3', t: '乌布梯田 → 猴林 → 青旅烹饪课' },
                { d: 'Day4', t: '蓝梦岛浮潜 → 恶魔的眼泪 → 日落巡航' },
                { d: 'Day5', t: '水明漾咖啡馆 → 海滩俱乐部 → 派对夜' },
                { d: 'Day6', t: '告别早餐 → 返程' }
              ],
              ai: { budget: '¥4,500-7,000/人（含机票+住+活动）', transport: '机场接机+ Grab打车，岛上车程较长', hotel: '库塔/水明漾社交型青旅', bestTime: '4-10月（旱季）', tips: '冲浪课提前在Klook订；换钱去正规兑换点（不要在街上换）；女生夜间不要单独走偏僻海滩。' }
            },
            { dest: '清迈 · 慢城社交', days: '6天5晚', img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '古城入住 → 周日夜市 → 青旅拼饭' },
                { d: 'Day2', t: '素贴山双龙寺 → 宁曼路咖啡馆 → Live House' },
                { d: 'Day3', t: '泰菜烹饪课 → 夜市逛吃 → 酒吧街' },
                { d: 'Day4', t: '大象自然保护营（义工）→ 看星空' },
                { d: 'Day5', t: '拜县一日游 → 二战桥 → 草莓园 → 日落' },
                { d: 'Day6', t: '告别brunch → 返程' }
              ],
              ai: { budget: '¥3,500-5,000/人', transport: '古城内步行+双条车(red car)去素贴山', hotel: '古城内/宁曼路青旅', bestTime: '11月-2月（凉季）', tips: '大象营选不骑象的保护营；拜县山路762个弯，提前吃晕车药；周日夜市只在周日有。' }
            },
            { dest: '台北 · 友善之城', days: '5天4晚', img: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '西门町 → 红楼 → 宁夏夜市' },
                { d: 'Day2', t: '台北故宫 → 士林官邸 → 士林夜市' },
                { d: 'Day3', t: '九份一日游 → 十分放天灯 → 基隆庙口' },
                { d: 'Day4', t: '永康街 → 师大商圈 → 临江街夜市' },
                { d: 'Day5', t: '中正纪念堂 → 牯岭街 → 返程' }
              ],
              ai: { budget: '¥4,000-6,000/人（含机票+住+吃）', transport: '台北捷运(Tube)+台铁去九份', hotel: '西门町/台北车站附近', bestTime: '10月-次年4月', tips: '悠游卡便利店可买；故宫周一闭馆；九份黄昏最美但末班车上山早，注意时间；夜市比商场好吃。' }
            }
        ]
    },
    'AB': {
        icon: '⛰️', title: '山野饕客', badge: '为了一口吃的翻山越岭',
        desc: '你可以为了一碗农家土鸡翻两座山，也可以在山顶啃着干粮看日出。荒野和美食在你这里不矛盾。',
        routes: [
            { dest: '成都 → 川西 · 山野美食线', days: '7天6晚', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '成都集合 → 宽窄巷子吃小吃' },
                { d: 'Day2', t: '四姑娘山 → 藏家牦牛肉火锅' },
                { d: 'Day3', t: '长坪沟徒步 → 高山露营' },
                { d: 'Day4', t: '丹巴藏寨 → 酥油茶+糌粑体验' },
                { d: 'Day5', t: '塔公草原 → 雅拉雪山 → 手抓羊肉' },
                { d: 'Day6', t: '新都桥摄影 → 返回康定' },
                { d: 'Day7', t: '康定 → 成都返程' }
              ],
              ai: { budget: '¥5,000-7,500/人', transport: '成都包车SUV，海拔3000-4000m', hotel: '四姑娘山/丹巴/塔公当地酒店', bestTime: '5-10月', tips: '高原反应提前吃红景天；不要洗澡感冒；藏餐分量大，少点；新都桥日落18:00最美。' }
            },
            { dest: '云南 · 菌子美食线', days: '6天5晚', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '昆明落地 → 过桥米线总店' },
                { d: 'Day2', t: '大理 → 白族三道茶 → 乳扇' },
                { d: 'Day3', t: '香格里拉 → 松茸炖鸡 → 酥油茶' },
                { d: 'Day4', t: '普达措徒步 → 牦牛火锅' },
                { d: 'Day5', t: '丽江 → 纳西烤肉 → 腊排骨' },
                { d: 'Day6', t: '昆明返程' }
              ],
              ai: { budget: '¥4,000-6,000/人', transport: '昆明动车到大理，大理大巴到香格里拉', hotel: '大理古城/独克宗古城客栈', bestTime: '6-8月（菌子季）', tips: '野生菌必须煮熟！见手青没熟会中毒产生幻觉；香格里拉海拔3300m注意高反；丽江古城维护费已取消。' }
            }
        ]
    },
    'AC': {
        icon: '🏔️', title: '荒野艺术家', badge: '在无人处找光',
        desc: '你不满足于游客照。你要的是那种"这里竟然有这种地方"的震撼，加上"这个角度只有我拍到了"的骄傲。',
        routes: [
            { dest: '青海 · 大西北环线', days: '7天6晚', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '西宁集合 → 塔尔寺' },
                { d: 'Day2', t: '青海湖环湖 → 茶卡镇入住' },
                { d: 'Day3', t: '茶卡盐湖天空之镜 → 翡翠湖' },
                { d: 'Day4', t: 'U型公路 → 水上雅丹 → 南八仙' },
                { d: 'Day5', t: '莫高窟 → 鸣沙山月牙泉日落' },
                { d: 'Day6', t: '嘉峪关 → 张掖七彩丹霞' },
                { d: 'Day7', t: '祁连大草原 → 返西宁' }
              ],
              ai: { budget: '¥4,500-7,000/人', transport: '西宁包车SUV，7天约2800km', hotel: '沿途县城酒店', bestTime: '7-8月（油菜花）或9-10月（秋景）', tips: '茶卡盐湖要晴天上午去（无风如镜）；U型公路拍照注意来车；莫高窟票提前1个月抢；全程干燥多喝水。' }
            },
            { dest: '甘肃 · 河西走廊', days: '6天5晚', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '兰州 → 中山桥 → 牛肉面' },
                { d: 'Day2', t: '武威雷台汉墓 → 张掖大佛寺' },
                { d: 'Day3', t: '张掖丹霞日出 → 嘉峪关关城' },
                { d: 'Day4', t: '瓜州 → 榆林窟 → 敦煌' },
                { d: 'Day5', t: '莫高窟 → 鸣沙山露营看星空' },
                { d: 'Day6', t: '敦煌返程' }
              ],
              ai: { budget: '¥4,000-6,000/人', transport: '兰州/敦煌进出，火车或包车', hotel: '张掖/嘉峪关/敦煌酒店', bestTime: '5-10月', tips: '莫高窟特窟要另付费但值得；榆林窟比莫高窟人少壁画更原始；鸣沙山露营夜间极冷需睡袋。' }
            }
        ]
    },
    'BC': {
        icon: '🍜', title: '味蕾诗人', badge: '用舌头写旅行日记',
        desc: '你是那种会在咖啡馆写旅行手账的人。吃要吃得讲究，住要住得有味道，走要走得有节奏。你旅行不是打卡，是过日子。',
        routes: [
            { dest: '杭州 · 茶与食', days: '4天3晚', img: 'https://images.unsplash.com/photo-1599571234909-29ed2a27ba5b?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '西湖漫步 → 楼外楼西湖醋鱼 → 柳浪闻莺日落' },
                { d: 'Day2', t: '龙井村采茶 → 农家菜 → 九溪烟树徒步' },
                { d: 'Day3', t: '灵隐寺 → 法喜寺吃素面 → 小河直街咖啡馆' },
                { d: 'Day4', t: '西溪湿地 → 知味观 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人', transport: '地铁+公交+骑行，西湖景区步行', hotel: '西湖景区/河坊街附近', bestTime: '3-4月（春茶）或10月（桂花）', tips: '楼外楼提前订位；龙井村喝茶问清价格（按位/按杯）；法喜寺素面5元一碗超好吃；西湖周末限行。' }
            },
            { dest: '苏州 · 园林与面', days: '4天3晚', img: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '拙政园 → 同得兴苏式汤面 → 平江路夜游' },
                { d: 'Day2', t: '留园 → 虎丘 → 山塘街吃小吃' },
                { d: 'Day3', t: '网师园晨景 → 狮子林 → 金鸡湖日落' },
                { d: 'Day4', t: '诚品书店 → 哑巴生煎 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人', transport: '地铁+步行，古城区不大', hotel: '平江路/观前街附近', bestTime: '3-5月（园林春色）或9-11月', tips: '拙政园早上8点开门就进（旅行团9点到）；网师园小而精建议早上去；苏式面要吃"头汤面"；哑巴生煎排队但值得。' }
            }
        ]
    },
    'CD': {
        icon: '📸', title: '文艺社交家', badge: '一边拍照一边交朋友',
        desc: '你是朋友圈里最会玩的那个人。你能在咖啡馆和老板聊一下午，也能在青旅组局去夜市。你的旅行朋友圈永远是大片+有趣的故事。',
        routes: [
            { dest: '长沙 · 娱乐之都', days: '4天3晚', img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '五一广场 → 太平街 → 黄兴路步行街夜市' },
                { d: 'Day2', t: '岳麓山 → 橘子洲头 → 文和友' },
                { d: 'Day3', t: '谢子龙影像艺术馆 → 李自健美术馆 → 梅溪湖' },
                { d: 'Day4', t: '冬瓜山小吃 → 返程' }
              ],
              ai: { budget: '¥1,500-2,500/人', transport: '地铁+步行，市区景点集中', hotel: '五一广场/黄兴广场附近', bestTime: '3-5月或9-11月', tips: '茶颜悦色每隔50米一家不用排长队；文和友晚上7点后要排队；岳麓山索道看日落；谢子龙艺术馆免费但需预约。' }
            },
            { dest: '厦门 → 泉州 · 闽南文艺线', days: '5天4晚', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '厦门沙坡尾 → 环岛路日落' },
                { d: 'Day2', t: '鼓浪屿 → 老别墅咖啡馆' },
                { d: 'Day3', t: '泉州 → 西街 → 开元寺 → 姜母鸭' },
                { d: 'Day4', t: '蟳埔村簪花体验 → 洛阳桥 → 夜市' },
                { d: 'Day5', t: '泉州返程' }
              ],
              ai: { budget: '¥2,500-4,000/人', transport: '厦门动车到泉州（1小时）', hotel: '厦门沙坡尾/泉州西街民宿', bestTime: '10月-4月', tips: '蟳埔村簪花40元含衣服，拍照绝美；泉州牛肉面比厦门便宜一半；洛阳桥退潮时赶海；厦门到泉州动车票提前买。' }
            }
        ]
    }
};

let currentQ = 0, answers = [];
function startQuiz() {
    currentQ = 0; answers = [];
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizPlaying').style.display = 'block';
    showQuestion();
}
function showQuestion() {
    const q = quizQuestions[currentQ];
    document.getElementById('quizProgress').style.width = (currentQ / quizQuestions.length * 100) + '%';
    document.getElementById('quizQuestion').textContent = `Q${currentQ + 1}. ${q.q}`;
    const optsEl = document.getElementById('quizOptions');
    optsEl.innerHTML = '';
    q.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'quiz-option';
        div.textContent = opt.text;
        div.onclick = () => selectOption(opt.score, div);
        optsEl.appendChild(div);
    });
}
function selectOption(score, el) {
    document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    answers.push(score);
    setTimeout(() => { currentQ++; if (currentQ < quizQuestions.length) showQuestion(); else showResult(); }, 250);
}
function showResult() {
    document.getElementById('quizPlaying').style.display = 'none';
    const resultEl = document.getElementById('quizResult');
    resultEl.style.display = 'block';
    const counts = {A:0,B:0,C:0,D:0};
    answers.forEach(a => counts[a]++);
    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
    let typeKey;
    if (sorted[0][1] >= sorted[1][1] + 3) typeKey = sorted[0][0];
    else typeKey = sorted[0][0] + sorted[1][0];
    const r = personalityTypes[typeKey] || personalityTypes[sorted[0][0]];
    let html = `<div class="quiz-result"><div class="quiz-result-icon">${r.icon}</div><h2 class="quiz-result-title">${r.title}</h2><div class="quiz-result-badge">${r.badge}</div><p class="quiz-result-desc">${r.desc}</p><div style="text-align:left;margin:24px 0"><h4 style="font-size:1.1rem;margin-bottom:16px;text-align:center">🎯 为你定制的专属线路</h4>`;
    r.routes.forEach((rt, i) => {
        const aiIdx = aiGuideStore.length;
        aiGuideStore.push(rt.ai);
        html += `<div class="route-detail-card"><div class="route-card-img" style="background-image:url('${rt.img}')"><span class="days-badge">${rt.days}</span></div><div class="route-card-body"><h5>${rt.dest}</h5><div class="route-sub">MYL 专属定制线路 · 含住宿+门票+交通</div>${rt.itinerary.map(day => `<div class="route-day"><span class="route-day-label">${day.d}</span> <span class="route-day-text">${day.t}</span></div>`).join('')}<button class="ai-guide-btn" onclick="toggleAIGuide(this,'pGuide${aiIdx}',${aiIdx})">✨ AI 生成详细路书</button><div class="ai-guide-panel" id="pGuide${aiIdx}"></div></div></div>`;
    });
    html += `</div><button class="btn" onclick="startQuiz()">重新测试</button><a href="index.html#china" class="btn btn-outline" style="margin-left:8px">看看更多目的地</a></div>`;
    resultEl.innerHTML = html;
}