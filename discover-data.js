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
              ai: { budget: '¥18,000-25,000/人（含机票+租车+住宿）', transport: '雷克雅未克租车自驾（SUV），环岛约1300km', hotel: '沿途乡村民宿+雷克雅未克市区酒店', bestTime: '9月-3月（极光季），2-3月最佳',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '雷克雅未克落地 → 蓝湖温泉泡汤（落地后先泡）→ 市区漫步哈尔格林姆教堂' },
                  { d: 'Day2 全天', t: '黄金圈：辛格维利尔国家公园 → 盖歇尔间歇泉 → 黄金瀑布' },
                  { d: 'Day3 全天', t: '南岸：塞里雅兰瀑布（可以走到瀑布后面）→ 斯科加瀑布 → 黑沙滩' },
                  { d: 'Day4 全天', t: '冰河湖杰古沙龙 → 钻石冰沙滩 → 杰古沙龙游船' },
                  { d: 'Day5 全天', t: '东峡湾小镇 → 都皮沃古尔看海豹' },
                  { d: 'Day6 全天', t: '米湖地热区 → 黛提瀑布（欧洲最强瀑布）→ 众神瀑布' },
                  { d: 'Day7 晚上', t: '阿克雷里 → 返雷克雅未克 → 郊外追极光夜' }
                ],
                attractions: [
                  { name: '蓝湖温泉', desc: '落地第一站！地热奶蓝色温泉， silica面膜免费', price: '¥600/人', img: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/reykjavik207/13500.html', wechatUrl: 'https://mp.weixin.qq.com/s/bluelake-booking' },
                  { name: '黄金圈', desc: '辛格维利尔+间歇泉+黄金瀑布，冰岛必打卡', price: '免费（游船另付）', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/reykjavik207/13501.html' },
                  { name: '冰河湖', desc: '钻石冰沙滩！超大冰块在黑沙滩上超美', price: '游船¥500/人', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/reykjavik207/13502.html' }
                ],
                foods: [
                  { name: '冰岛羊肉汤', desc: '北欧特色，浓汤配面包超暖', price: '¥150/碗', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80' },
                  { name: '热狗', desc: 'Bæjarins Beztu Pylsur，克林顿同款', price: '¥30/个', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: 'Skyr酸奶', desc: '冰岛国宝，高蛋白低脂，超市买', price: '¥20/盒', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
                ],
                hotels: [
                  { name: '雷克雅未克市区酒店', desc: '市中心，吃饭逛街方便', price: '¥800/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/reykjavik207.html' },
                  { name: '乡村民宿（Guesthouse）', desc: '沿途小镇，追极光方便', price: '¥500/晚含早餐', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/reykjavik207.html' }
                ],
                tips: '极光是概率事件，至少留3晚在郊外追（市区光污染看不到）；加油站间隔远，每次看到加油站就加满；准备防风防水冲锋衣+羽绒服；右舵车不适用（冰岛左舵）；导航用Google Maps；冬天路滑，租SUV带防滑链。' }
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
              ai: { budget: '¥6,000-9,000/人（含包车+住宿+门票）', transport: '乌鲁木齐包车/SUV，8天约2500km', hotel: '布尔津/喀纳斯/那拉提当地酒店', bestTime: '6-9月，9月金秋最美',
                timeline: [
                  { d: 'Day1 下午', t: '乌鲁木齐集合 → 国际大巴扎逛吃 → 入住' },
                  { d: 'Day2 全天', t: '乌鲁木齐 → 布尔津 → 五彩滩看日落（雅丹+额尔齐斯河）' },
                  { d: 'Day3 全天', t: '喀纳斯湖 → 观鱼台俯瞰全景 → 三湾徒步（神仙湾/月亮湾/卧龙湾）' },
                  { d: 'Day4 上午-下午', t: '禾木村晨雾（神仙的自留地）→ 图瓦人家访 → 住禾木' },
                  { d: 'Day5 全天', t: '禾木 → 世界魔鬼城（乌尔禾风城）→ 克拉玛依' },
                  { d: 'Day6 全天', t: '赛里木湖环湖（大西洋最后一滴眼泪）→ 果子沟大桥' },
                  { d: 'Day7 全天', t: '那拉提空中草原 → 骑马体验' },
                  { d: 'Day8 上午', t: '独库公路 → 返乌鲁木齐返程' }
                ],
                attractions: [
                  { name: '喀纳斯湖', desc: '人间仙境！湖水会变色，观鱼台看全景', price: '¥230（含区间车）', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kanas105/5500.html', wechatUrl: 'https://mp.weixin.qq.com/s/kanas-booking' },
                  { name: '禾木村', desc: '中国第一村！晨雾+木屋+白桦林', price: '¥160（含区间车）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kanas105/5501.html' },
                  { name: '赛里木湖', desc: '大西洋最后一滴眼泪，蓝到不真实', price: '¥145', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/boertala106/5502.html' }
                ],
                foods: [
                  { name: '大盘鸡', desc: '新疆灵魂！配皮带面，两人点半份够', price: '¥80/份', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '烤羊肉串', desc: '红柳烤肉！羊肉不膻超香', price: '¥10/串', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '手抓饭', desc: '胡萝卜+羊肉+米饭，油香四溢', price: '¥30/份', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' }
                ],
                hotels: [
                  { name: '布尔津酒店', desc: '县城最好的酒店，条件不错', price: '¥300/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/burqin107.html' },
                  { name: '禾木村民宿', desc: '图瓦人木屋，清晨推开窗就是晨雾', price: '¥400/晚含早', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/kanas105.html' }
                ],
                tips: '昼夜温差20°C，带羽绒服（9月晚上0度）；独库公路仅6-10月开放（天气不好随时关）；提前办边防证（哈巴河/白哈巴需要）；喀纳斯/禾木区间车必须坐（私家车不让进）；9月金秋最美但住宿翻倍，提前1个月订。' }
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
              ai: { budget: '¥20,000-28,000/人（含机票+租车+住宿）', transport: '基督城取车/还车，右舵左行，10天约2000km', hotel: '各小镇汽车旅馆(B&B)', bestTime: '11月-2月（南半球夏季）',
                timeline: [
                  { d: 'Day1 下午', t: '基督城落地 → 植物园散步 → 雅芳河撑篙游船' },
                  { d: 'Day2 全天', t: '基督城 → 格雷茅斯 → 薄饼岩千层岩日出 → 海边小镇' },
                  { d: 'Day3 全天', t: '福克斯冰川徒步（专业向导带）→ 马瑟森湖镜面倒影' },
                  { d: 'Day4 全天', t: '瓦纳卡 → 孤独的树（网红打卡）→ 迷幻世界Puzzling World' },
                  { d: 'Day5 全天', t: '皇后镇 → 天空缆车看全景 → 瓦卡蒂普湖散步' },
                  { d: 'Day6 全天', t: '米尔福德峡湾游船（世界第八大奇迹）' },
                  { d: 'Day7 全天', t: '但尼丁 → 鲍德温街（世界最陡街道）→ 拉纳克城堡' },
                  { d: 'Day8 全天', t: '蒂卡普湖 → 好牧羊人教堂 → 夜间观星（黑暗天空保护区）' },
                  { d: 'Day9 上午', t: '基督城还车 → 南极中心' },
                  { d: 'Day10 上午', t: '返程' }
                ],
                attractions: [
                  { name: '米尔福德峡湾', desc: '世界第八大奇迹！瀑布+海豹+峡湾风光', price: '¥800/人（游船）', img: 'https://images.unsplash.com/photo-1469521669194-babb45599def?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/queenstown440/13600.html' },
                  { name: '福克斯冰川', desc: '世界唯一可徒步的冰川！蓝冰洞超美', price: '¥1500/人（徒步团）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/foxglacier441/13601.html' },
                  { name: '蒂卡普湖观星', desc: '国际黑暗天空保护区，银河肉眼可见', price: '¥500/人（观星团）', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/laketekapo442/13602.html' }
                ],
                foods: [
                  { name: '绿唇贻贝', desc: '新西兰特产！清蒸最鲜', price: '¥150/份', img: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80' },
                  { name: '羊肉派', desc: '新西兰国民美食，加油站/面包店都有', price: '¥40/个', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: 'Flat White咖啡', desc: '新西兰咖啡文化，比美式更浓', price: '¥30/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
                ],
                hotels: [
                  { name: '皇后镇湖畔酒店', desc: '开窗就是瓦卡蒂普湖，位置绝佳', price: '¥1000/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/queenstown440.html' },
                  { name: '小镇汽车旅馆(B&B)', desc: '沿途小镇，含早餐，干净舒适', price: '¥500/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/christchurch439.html' }
                ],
                tips: '右舵左行需要适应（前2天慢点开）；山路多减速慢行（尤其皇后镇周边）；加油接受信用卡（不用现金）；冰川徒步需穿防水裤+登山鞋（向导会给冰爪）；米尔福德峡湾路上会下雨，带雨衣；11-2月是夏季，白天很长（晚上9点才天黑）。' }
            }
        ]
    },
    'B': {
        icon: '🍜', title: '碳水刺客', badge: '舌头侦探 · 城市猎人',
        desc: '你旅行的KPI就是吃遍当地。大众点评不看，专钻巷子找苍蝇馆。你能为了一碗面飞一座城，朋友圈九宫格全是吃的。',
        routes: [
            { dest: '成都 · 美食猎人之旅', days: '4天3晚', img: 'images/cities/chengdu.jpg',
              itinerary: [
                { d: 'Day1', t: '宽窄巷子 → 奎星楼街冒椒火辣 → 锦里夜市' },
                { d: 'Day2', t: '大熊猫基地 → 建设巷小吃街 → 春熙路' },
                { d: 'Day3', t: '人民公园鹤鸣茶社 → 玉林路小酒馆 → 地道火锅' },
                { d: 'Day4', t: '文殊院 → 洞子口张老二凉粉 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人（吃+住+市内交通）', transport: '地铁+打车，市区内无需租车', hotel: '春熙路/太古里附近舒适酒店', bestTime: '3-6月或9-11月（避开酷暑）',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '宽窄巷子逛老成都 → 奎星楼街冒椒火辣（坐吧台）→ 锦里夜景+小吃' },
                  { d: 'Day2 全天', t: '7:30到熊猫基地看熊猫吃早餐 → 建设巷小吃街 → 春熙路IFS爬墙熊猫' },
                  { d: 'Day3 上午-晚上', t: '人民公园鹤鸣茶社喝盖碗茶 → 玉林路小酒馆 → 地道火锅' },
                  { d: 'Day4 上午', t: '文殊院拜佛 → 洞子口张老二凉粉 → 返程' }
                ],
                attractions: [
                  { name: '大熊猫繁育基地', desc: '一定要早去！熊猫早上最活跃（9点后就睡觉了）', price: '¥55', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/chengdu104/1354.html' },
                  { name: '宽窄巷子', desc: '老成都名片，宽巷子逛+窄巷子吃', price: '免费', img: 'images/cities/chengdu.jpg' },
                  { name: '锦里古街', desc: '晚上灯笼亮起最美，小吃多但偏贵', price: '免费', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80' }
                ],
                foods: [
                  { name: '冒椒火辣', desc: '奎星楼街网红串串，坐吧台一个人友好', price: '¥60/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '张老二凉粉', desc: '文殊院旁老字号，甜水面必点', price: '¥15/人', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: '鹤鸣茶社', desc: '人民公园内百年老茶馆，盖碗茶15元', price: '¥15/位', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
                ],
                hotels: [
                  { name: '春熙路智选假日', desc: '地铁口，逛街吃饭方便', price: '¥350', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chengdu104.html' },
                  { name: '太古里博舍', desc: '设计感顶级，网红打卡', price: '¥1800', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chengdu104.html' }
                ],
                tips: '火锅提前大众点评取号（工作日1小时，周末2小时）；兔头/折耳根谨慎尝试（黑暗料理）；熊猫基地7点前到（晚了熊猫都在睡觉）；一个人吃火锅选小火锅店或坐吧台（冒椒火辣/六年二班都有吧台）；成都地铁覆盖大部分景点。' }
            },
            { dest: '曼谷 · 街头美食巡礼', days: '5天4晚', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '考山路夜市 → 芒果糯米饭 → 冬阴功汤' },
                { d: 'Day2', t: '恰图恰周末市场 → 海鲜烧烤 → 泰式奶茶' },
                { d: 'Day3', t: '唐人街耀华力路 → 鱼翅羹 → 燕窝汤' },
                { d: 'Day4', t: '安帕瓦水上市场 → 船面 → 萤火虫夜游' },
                { d: 'Day5', t: 'Terminal 21 → 泰式船面 → 返程' }
              ],
              ai: { budget: '¥3,500-5,000/人（含机票+吃+住）', transport: 'BTS轻轨+湄南河快船+突突车', hotel: '考山路/Sukhumvit区域青旅或经济酒店', bestTime: '11月-2月（凉季）',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '考山路夜市逛吃 → 芒果糯米饭+冬阴功汤 → 青旅认识旅伴' },
                  { d: 'Day2 全天', t: '恰图恰周末市场（周末才开）→ 海鲜烧烤 → 泰式奶茶' },
                  { d: 'Day3 全天', t: '唐人街耀华力路 → 鱼翅羹+燕窝汤 → 湄南河夜游' },
                  { d: 'Day4 全天', t: '安帕瓦水上市场 → 船面午餐 → 萤火虫夜游' },
                  { d: 'Day5 上午', t: 'Terminal 21逛街 → 泰式船面午餐 → 返程' }
                ],
                attractions: [
                  { name: '大皇宫', desc: '曼谷地标，注意着装（长裤+遮肩）', price: '¥500泰铢', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/bangkok207/12600.html' },
                  { name: '恰图恰周末市场', desc: '全球最大周末市场，15000个摊位', price: '免费', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80' },
                  { name: '安帕瓦水上市场', desc: '坐船逛市场，晚上看萤火虫', price: '船票¥60泰铢', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/bangkok207/12602.html' }
                ],
                foods: [
                  { name: '芒果糯米饭', desc: '泰国必吃！甜糯米+新鲜芒果+椰浆', price: '¥60泰铢', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '冬阴功汤', desc: '酸辣虾汤，泰国国汤', price: '¥80泰铢', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '泰式奶茶', desc: '橙色奶茶，甜到上头但好喝', price: '¥40泰铢', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
                ],
                hotels: [
                  { name: '考山路青旅', desc: '背包客天堂，容易认识朋友', price: '¥80/床位', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/bangkok207.html' },
                  { name: 'Sukhumvit经济型酒店', desc: 'BTS旁，干净安全', price: '¥250', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/bangkok207.html' }
                ],
                tips: '路边摊认准本地人多的；肠胃药必带；曼谷堵车坐BTS；给小费20泰铢起；恰图恰只在周末开；突突车砍价对半砍。' }
            },
            { dest: '大阪 · 天下厨房', days: '4天3晚', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '道顿堀 → 章鱼烧 → 御好烧 → 串炸' },
                { d: 'Day2', t: '黑门市场 → 和牛刺身 → 海胆饭' },
                { d: 'Day3', t: '新世界 → 通天阁 → 炸串老店' },
                { d: 'Day4', t: '梅田蓝天大厦 → 大阪烧 → 返程' }
              ],
              ai: { budget: '¥5,000-7,000/人（含机票+吃+住）', transport: '地铁/JR，关西机场Haruka号直达', hotel: '难波/心斋桥附近', bestTime: '3-5月或10-11月',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '道顿堀逛吃 → 章鱼烧+御好烧+串炸 → 格力高广告牌拍照' },
                  { d: 'Day2 全天', t: '黑门市场（早上8点去最新鲜）→ 和牛刺身+海胆饭' },
                  { d: 'Day3 全天', t: '新世界通天阁 → 炸串老店 → 梅田蓝天大厦看夜景' },
                  { d: 'Day4 上午', t: '心斋桥药妆店采购 → 大阪烧午餐 → 返程' }
                ],
                attractions: [
                  { name: '道顿堀', desc: '大阪美食心脏，格力高广告牌必拍', price: '免费', img: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400&q=80' },
                  { name: '通天阁', desc: '新世界地标，大阪复古风情', price: '¥900日元', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/osaka453/12700.html' },
                  { name: '梅田蓝天大厦', desc: '空中庭院展望台，看大阪全景', price: '¥1500日元', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/osaka453/12701.html' }
                ],
                foods: [
                  { name: '章鱼烧', desc: '大阪灵魂美食，木鱼花会跳舞', price: '¥500日元/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '串炸', desc: '规则：不能二次蘸酱！', price: '¥1000日元/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '和牛刺身', desc: '黑门市场现切，入口即化', price: '¥3000日元/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
                ],
                hotels: [
                  { name: '难波站前酒店', desc: '交通方便，逛街吃饭近', price: '¥400', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/osaka453.html' },
                  { name: '心斋桥设计酒店', desc: '购物方便，药妆店旁边', price: '¥500', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/osaka453.html' }
                ],
                tips: '串炸规则：不能二次蘸酱（卫生原因）；黑门市场早上8点去最新鲜；药妆店松本清比大国便宜；大阪人热情豪爽，和东京风格完全不同。' }
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
              ai: { budget: '¥2,500-4,000/人', transport: '大理站/机场到古城打车，环洱海租电动车', hotel: '古城内/才村洱海边民宿', bestTime: '3-5月（油菜花）或9-11月',
                timeline: [
                  { d: 'Day1 下午', t: '大理古城入住 → 人民路闲逛 → 黄昏洋人街看夕阳' },
                  { d: 'Day2 全天', t: '洱海生态廊道骑行 → 喜洲稻田 → 海舌公园日落' },
                  { d: 'Day3 全天', t: '沙溪古镇 → 寺登街 → 先锋书局 → 石宝山' },
                  { d: 'Day4 全天', t: '凤阳邑茶马古道 → 无为寺 → 咖啡馆发呆' },
                  { d: 'Day5 上午', t: '苍山洗马潭索道 → 寂照庵吃素斋 → 返程' }
                ],
                attractions: [
                  { name: '洱海生态廊道', desc: '免费骑行道，才村到龙龛段最美', price: '免费', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80' },
                  { name: '喜洲古镇', desc: '白族民居建筑群，喜洲粑粑必吃', price: '免费', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dali45/5288.html' },
                  { name: '沙溪古镇', desc: '茶马古道上唯一幸存的古集市，比大理古城更安静', price: '免费', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80' }
                ],
                foods: [
                  { name: '喜洲粑粑', desc: '甜/咸两种，现烤外酥里软', price: '¥10/个', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: '白族石板烧', desc: '大理特色，自己烤着吃', price: '¥60/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '乳扇沙琪玛', desc: '白族特色奶制品，当零食吃', price: '¥20/盒', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' }
                ],
                hotels: [
                  { name: '才村洱海边民宿', desc: '推开窗就是洱海，看日出绝佳', price: '¥400', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali45.html' },
                  { name: '古城内青旅', desc: '人民路附近，方便认识旅伴', price: '¥80/床位', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali45.html' }
                ],
                tips: '洱海骑行选海西生态廊道（免费，不让机动车进）；紫外线极强，防晒必备（SPF50+）；节假日环海路堵车建议早出发（8点前）；喜洲稻田最佳季节是9-10月；沙溪古镇从大理古城坐车1.5小时，当天往返即可。' }
            },
            { dest: '京都 · 侘寂巡礼', days: '5天4晚', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '清水寺 → 二年坂三年坂 → 祇园花见小路' },
                { d: 'Day2', t: '金阁寺 → 龙安寺石庭 → 仁和寺' },
                { d: 'Day3', t: '岚山竹林 → 天龙寺 → 渡月桥日落' },
                { d: 'Day4', t: '伏见稻荷大社千本鸟居 → 宇治抹茶体验' },
                { d: 'Day5', t: '哲学之道 → 南禅寺 → 平安神宫 → 返程' }
              ],
              ai: { budget: '¥6,000-9,000/人（含机票+JR Pass+住）', transport: '关西机场Haruka+京都巴士一日券', hotel: '京都站/祇园附近町屋', bestTime: '3-4月樱花或11月红叶',
                timeline: [
                  { d: 'Day1 全天', t: '清水寺 → 二年坂三年坂逛小店 → 祇园花见小路找艺伎' },
                  { d: 'Day2 全天', t: '金阁寺（金碧辉煌）→ 龙安寺石庭 → 仁和寺' },
                  { d: 'Day3 全天', t: '岚山竹林小径 → 天龙寺 → 渡月桥看日落' },
                  { d: 'Day4 全天', t: '伏见稻荷大社千本鸟居（早上6点去没人）→ 宇治抹茶体验' },
                  { d: 'Day5 上午', t: '哲学之道散步 → 南禅寺 → 平安神宫 → 返程' }
                ],
                attractions: [
                  { name: '伏见稻荷大社', desc: '千本鸟居！早上6点去没人，拍照绝美', price: '免费', img: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kyoto454/12800.html' },
                  { name: '金阁寺', desc: '舍利殿贴满金箔，倒映在湖中', price: '¥500日元', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kyoto454/12801.html' },
                  { name: '岚山竹林', desc: '《卧虎藏龙》取景地，竹林小径超治愈', price: '免费', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kyoto454/12802.html' }
                ],
                foods: [
                  { name: '怀石料理', desc: '京都米其林级，一餐2小时', price: '¥8000日元起', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '宇治抹茶', desc: '抹茶パフェ抹茶拉面都要试', price: '¥1000日元', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' },
                  { name: '汤豆腐', desc: '南禅寺旁奥丹，豆腐鲜嫩', price: '¥3000日元', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' }
                ],
                hotels: [
                  { name: '京都站附近酒店', desc: '交通方便，去景点都近', price: '¥600', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/kyoto454.html' },
                  { name: '祇园町屋', desc: '传统日式旅馆，体验榻榻米', price: '¥1200', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/kyoto454.html' }
                ],
                tips: '伏见稻荷早上6点去没人（旅行团9点到）；巴士一日券500日元划算；町屋住宿提前3个月订；樱花季/红叶季住宿翻倍。' }
            },
            { dest: '厦门 · 海岛慢生活', days: '4天3晚', img: 'images/cities/xiamen.jpg',
              itinerary: [
                { d: 'Day1', t: '中山路骑楼 → 八市吃海鲜 → 沙坡尾艺术西区' },
                { d: 'Day2', t: '鼓浪屿全天 → 菽庄花园 → 日光岩日落' },
                { d: 'Day3', t: '曾厝垵 → 环岛路骑行 → 黄厝海滩看日出' },
                { d: 'Day4', t: '南普陀寺 → 厦大校园 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人', transport: 'BRT公交+打车，鼓浪屿轮渡', hotel: '思明区/沙坡尾附近设计民宿', bestTime: '10月-4月（避开台风季）',
                timeline: [
                  { d: 'Day1 下午', t: '中山路骑楼逛吃 → 八市吃海鲜 → 沙坡尾艺术西区拍照' },
                  { d: 'Day2 全天', t: '鼓浪屿全天：菽庄花园 → 日光岩日落 → 小巷咖啡馆发呆' },
                  { d: 'Day3 全天', t: '曾厝垵 → 环岛路骑行 → 黄厝海滩看日出' },
                  { d: 'Day4 上午', t: '南普陀寺 → 厦大校园 → 返程' }
                ],
                attractions: [
                  { name: '鼓浪屿', desc: '万国建筑博物馆，小巷迷路是乐趣', price: '船票¥35', img: 'images/cities/xiamen.jpg', ctripUrl: 'https://you.ctrip.com/sight/xiamen23/4723.html', wechatUrl: 'https://mp.weixin.qq.com/s/xiamen-ferry' },
                  { name: '日光岩', desc: '鼓浪屿最高点，看日落绝美', price: '¥50', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/xiamen23/4725.html' },
                  { name: '南普陀寺', desc: '闽南佛教圣地，素饼必买', price: '免费（需预约）', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', wechatUrl: 'https://mp.weixin.qq.com/s/nanputuo' }
                ],
                foods: [
                  { name: '八市海鲜', desc: '厦门最接地气的海鲜市场，找加工店', price: '¥80/人', img: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80' },
                  { name: '沙茶面', desc: '厦门灵魂早餐，乌糖/月华都正宗', price: '¥25/碗', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '海蛎煎', desc: '闽南特色，配甜辣酱绝了', price: '¥20/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
                ],
                hotels: [
                  { name: '沙坡尾设计民宿', desc: '艺术西区旁，拍照出片', price: '¥300', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xiamen23.html' },
                  { name: '鼓浪屿磐诺假日', desc: '岛上住一晚，清晨没人时最美', price: '¥500', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xiamen23.html' }
                ],
                tips: '鼓浪屿船票提前在"厦门轮渡"公众号买（节假日提前3天）；厦大需要提前预约（公众号"厦门大学"）；八市海鲜找加工店注意称重（先问价再买）；晚上鼓浪屿人少建议天黑前返回市区；台风季7-9月不要去（船会停航）。' }
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
              ai: { budget: '¥4,500-7,000/人（含机票+住+活动）', transport: '机场接机+ Grab打车，岛上车程较长', hotel: '库塔/水明漾社交型青旅', bestTime: '4-10月（旱季）',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '库塔入住青旅 → 海滩看日落 → 青旅欢迎派对认识朋友' },
                  { d: 'Day2 全天', t: '冲浪课（初学者2小时）→ 海滩酒吧 → 篝火晚会' },
                  { d: 'Day3 全天', t: '乌布梯田 → 猴林 → 青旅烹饪课（学做泰国菜）' },
                  { d: 'Day4 全天', t: '蓝梦岛浮潜 → 恶魔的眼泪 → 日落巡航派对' },
                  { d: 'Day5 全天', t: '水明漾咖啡馆打卡 → 海滩俱乐部 → 派对夜' },
                  { d: 'Day6 上午', t: '告别早餐 → 返程' }
                ],
                attractions: [
                  { name: '库塔海滩', desc: '冲浪入门圣地，日落超美', price: '免费', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80' },
                  { name: '乌布梯田', desc: '德格拉朗梯田，《美食祈祷恋爱》取景地', price: '¥20人民币', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/bali438/12900.html' },
                  { name: '蓝梦岛', desc: '浮潜看小丑鱼，恶魔的眼泪海浪超壮观', price: '船票¥200', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/bali438/12901.html' }
                ],
                foods: [
                  { name: '印尼炒饭', desc: '国民美食，加煎蛋和虾片', price: '¥30/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '沙嗲肉串', desc: '花生酱蘸料，夜市必吃', price: '¥20/10串', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '猫屎咖啡', desc: '巴厘岛特产，一定要试（虽然贵）', price: '¥50/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
                ],
                hotels: [
                  { name: '库塔社交青旅', desc: '欢迎派对+活动多，容易认识朋友', price: '¥100/床位', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/bali438.html' },
                  { name: '水明漾精品酒店', desc: '设计感强，海滩俱乐部旁', price: '¥600', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/bali438.html' }
                ],
                tips: '冲浪课提前在Klook订（比现场便宜）；换钱去正规兑换点（不要在街上换，假钞多）；女生夜间不要单独走偏僻海滩；Grab打车比出租车便宜。' }
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
              ai: { budget: '¥3,500-5,000/人', transport: '古城内步行+双条车(red car)去素贴山', hotel: '古城内/宁曼路青旅', bestTime: '11月-2月（凉季）',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '古城入住青旅 → 周日夜市（只在周日！）逛吃 → 青旅拼饭' },
                  { d: 'Day2 全天', t: '素贴山双龙寺 → 宁曼路咖啡馆打卡 → Live House听歌' },
                  { d: 'Day3 全天', t: '泰菜烹饪课（学做冬阴功+芒果糯米饭）→ 夜市逛吃 → 酒吧街' },
                  { d: 'Day4 全天', t: '大象自然保护营（义工，不骑象！）→ 给大象洗澡 → 看星空' },
                  { d: 'Day5 全天', t: '拜县一日游 → 二战桥 → 草莓园 → 拜县日落' },
                  { d: 'Day6 上午', t: '告别brunch → 返程' }
                ],
                attractions: [
                  { name: '双龙寺', desc: '素贴山顶，金顶佛塔俯瞰清迈全城', price: '¥50泰铢', img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/chiangmai439/13000.html' },
                  { name: '大象自然保护营', desc: '不骑象！给大象洗澡喂食物，真正的保护', price: '¥200/人', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/chiangmai439/13001.html' },
                  { name: '拜县', desc: '小山城，咖啡馆+彩虹房+二战桥，拍照天堂', price: '免费', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/pai1255/13002.html' }
                ],
                foods: [
                  { name: '泰式炒河粉', desc: 'Pad Thai，泰国国民主食', price: '¥50泰铢', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '芒果糯米饭', desc: '清迈的比曼谷的还好吃！', price: '¥60泰铢', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: '青木瓜沙拉', desc: '酸辣爽口，夜市必点', price: '¥40泰铢', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' }
                ],
                hotels: [
                  { name: '古城青旅', desc: '步行到夜市，活动多', price: '¥70/床位', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chiangmai439.html' },
                  { name: '宁曼路精品酒店', desc: '咖啡馆一条街，设计感强', price: '¥350', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chiangmai439.html' }
                ],
                tips: '大象营选不骑象的保护营（ ethical ）；拜县山路762个弯，提前吃晕车药；周日夜市只在周日有；清迈比曼谷更慢更舒服，适合多待几天。' }
            },
            { dest: '台北 · 友善之城', days: '5天4晚', img: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '西门町 → 红楼 → 宁夏夜市' },
                { d: 'Day2', t: '台北故宫 → 士林官邸 → 士林夜市' },
                { d: 'Day3', t: '九份一日游 → 十分放天灯 → 基隆庙口' },
                { d: 'Day4', t: '永康街 → 师大商圈 → 临江街夜市' },
                { d: 'Day5', t: '中正纪念堂 → 牯岭街 → 返程' }
              ],
              ai: { budget: '¥4,000-6,000/人（含机票+住+吃）', transport: '台北捷运(Tube)+台铁去九份', hotel: '西门町/台北车站附近', bestTime: '10月-次年4月',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '西门町逛吃 → 红楼看电影 → 宁夏夜市（冬瓜茶+蚵仔煎）' },
                  { d: 'Day2 全天', t: '台北故宫（藏品60万件，3小时看不完）→ 士林官邸 → 士林夜市' },
                  { d: 'Day3 全天', t: '九份一日游（《千与千寻》取景地）→ 十分放天灯 → 基隆庙口' },
                  { d: 'Day4 全天', t: '永康街（芒果冰+牛肉面）→ 师大商圈 → 临江街夜市' },
                  { d: 'Day5 上午', t: '中正纪念堂 → 牯岭街书街 → 返程' }
                ],
                attractions: [
                  { name: '台北故宫', desc: '中华文物宝库！翠玉白菜+肉形石必看', price: '¥250新台币', img: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/taipei202/14000.html' },
                  { name: '九份', desc: '《千与千寻》原型！黄昏最美，红灯笼亮起超治愈', price: '免费', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/ruifang203/14001.html' },
                  { name: '十分天灯', desc: '平溪线放天灯！写愿望放上天超浪漫', price: '¥200新台币/个', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/ruifang203/14002.html' }
                ],
                foods: [
                  { name: '牛肉面', desc: '永康街林东坊，半筋半肉超绝', price: '¥200新台币/碗', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '芒果冰', desc: '永康街冰馆，夏天必吃！', price: '¥150新台币/份', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: '蚵仔煎', desc: '夜市必吃！海蛎+鸡蛋+蔬菜', price: '¥60新台币/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
                ],
                hotels: [
                  { name: '西门町酒店', desc: '逛街方便，夜市旁边', price: '¥400/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/taipei202.html' },
                  { name: '台北车站民宿', desc: '交通方便，去九份/机场都近', price: '¥300/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/taipei202.html' }
                ],
                tips: '悠游卡便利店可买（捷运+公交+便利店都能刷）；故宫周一闭馆；九份黄昏最美但末班车上山早（注意时间）；夜市比商场好吃（士林/宁夏/临江）；台湾用新台币（1人民币≈4.5新台币）；带转换插头（台湾是110V）。' }
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
              ai: { budget: '¥5,000-7,500/人', transport: '成都包车SUV，海拔3000-4000m', hotel: '四姑娘山/丹巴/塔公当地酒店', bestTime: '5-10月',
                timeline: [
                  { d: 'Day1 下午', t: '成都集合 → 宽窄巷子吃小吃 → 入住' },
                  { d: 'Day2 全天', t: '成都 → 四姑娘山（双桥沟）→ 藏家牦牛肉火锅' },
                  { d: 'Day3 全天', t: '长坪沟徒步（木骡子营地）→ 高山露营' },
                  { d: 'Day4 全天', t: '丹巴藏寨（甲居/中路）→ 酥油茶+糌粑体验' },
                  { d: 'Day5 全天', t: '塔公草原 → 雅拉雪山观景 → 手抓羊肉' },
                  { d: 'Day6 全天', t: '新都桥摄影（光影世界）→ 返回康定' },
                  { d: 'Day7 上午', t: '康定 → 成都返程' }
                ],
                attractions: [
                  { name: '四姑娘山', desc: '东方阿尔卑斯！双桥沟+长坪沟必去', price: '¥150（双桥沟）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/abazhou108/5600.html' },
                  { name: '丹巴藏寨', desc: '中国最美乡村！甲居藏寨+中路藏寨', price: '¥50', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/danba109/5601.html' },
                  { name: '塔公草原', desc: '塔公寺+雅拉雪山，藏区风光', price: '¥20', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/daofu110/5602.html' }
                ],
                foods: [
                  { name: '牦牛肉火锅', desc: '高原特色，牛肉紧实有嚼劲', price: '¥80/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '酥油茶+糌粑', desc: '藏区主食，抗高反神器', price: '¥20/套', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' },
                  { name: '手抓羊肉', desc: '塔公草原藏家，原汁原味', price: '¥60/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' }
                ],
                hotels: [
                  { name: '四姑娘山酒店', desc: '日隆镇，条件最好', price: '¥300/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xiaojin108.html' },
                  { name: '丹巴藏家民宿', desc: '住藏寨里，体验藏族生活', price: '¥200/晚含早', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/danba109.html' }
                ],
                tips: '高原反应提前吃红景天（出发前一周）；到高原第一天不要洗澡（容易感冒引发高反）；藏餐分量大，少点；新都桥日落18:00最美；海拔3000-4000m，走路慢一点；紫外线极强，防晒必备。' }
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
              ai: { budget: '¥4,000-6,000/人', transport: '昆明动车到大理，大理大巴到香格里拉', hotel: '大理古城/独克宗古城客栈', bestTime: '6-8月（菌子季）',
                timeline: [
                  { d: 'Day1 下午', t: '昆明落地 → 过桥米线总店（建新园）→ 入住' },
                  { d: 'Day2 全天', t: '昆明动车到大理 → 白族三道茶体验 → 乳扇+饵块' },
                  { d: 'Day3 全天', t: '大理大巴到香格里拉 → 松茸炖鸡 → 独克宗古城转经筒' },
                  { d: 'Day4 全天', t: '普达措国家公园徒步 → 牦牛火锅' },
                  { d: 'Day5 全天', t: '香格里拉大巴到丽江 → 纳西烤肉 → 腊排骨火锅' },
                  { d: 'Day6 上午', t: '丽江三义机场返程' }
                ],
                attractions: [
                  { name: '普达措国家公园', desc: '中国第一个国家公园！属都湖+碧塔海', price: '¥138（含观光车）', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/zhongdian111/5700.html' },
                  { name: '独克宗古城', desc: '中国保存最好的藏民居古城，大转经筒', price: '免费', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
                  { name: '丽江古城', desc: '世界文化遗产，四方街+大水车', price: '免费（维护费已取消）', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/lijiang18/5701.html' }
                ],
                foods: [
                  { name: '松茸炖鸡', desc: '菌子季必吃！香格里拉松茸最正宗', price: '¥200/锅', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '见手青炒肉', desc: '勇敢者游戏！没煮熟会中毒幻觉', price: '¥80/份', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '腊排骨火锅', desc: '丽江特色，腊排骨+洋芋+韭菜', price: '¥70/人', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' }
                ],
                hotels: [
                  { name: '大理古城客栈', desc: '人民路附近，白族庭院', price: '¥250/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali45.html' },
                  { name: '独克宗古城藏式客栈', desc: '藏式风格，烤火聊天', price: '¥200/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/zhongdian111.html' }
                ],
                tips: '野生菌必须煮熟！见手青没熟会中毒产生幻觉（看到小人），一定要在正规餐厅吃；香格里拉海拔3300m注意高反；丽江古城维护费已取消；菌子季6-8月，松茸7月最贵；大理到香格里拉大巴4小时，山路弯多容易晕车。' }
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
              ai: { budget: '¥4,500-7,000/人', transport: '西宁包车SUV，7天约2800km', hotel: '沿途县城酒店', bestTime: '7-8月（油菜花）或9-10月（秋景）',
                timeline: [
                  { d: 'Day1 下午', t: '西宁集合 → 塔尔寺（藏传佛教格鲁派六大寺之一）' },
                  { d: 'Day2 全天', t: '青海湖环湖（油菜花海+蓝湖）→ 茶卡镇入住' },
                  { d: 'Day3 全天', t: '茶卡盐湖天空之镜（上午无风最美）→ 翡翠湖' },
                  { d: 'Day4 全天', t: 'U型公路（G315网红公路）→ 水上雅丹 → 南八仙' },
                  { d: 'Day5 全天', t: '莫高窟（提前1个月抢票！）→ 鸣沙山月牙泉日落' },
                  { d: 'Day6 全天', t: '嘉峪关关城 → 张掖七彩丹霞日落' },
                  { d: 'Day7 全天', t: '祁连大草原 → 门源油菜花 → 返西宁' }
                ],
                attractions: [
                  { name: '茶卡盐湖', desc: '天空之镜！晴天上午去（无风如镜）', price: '¥60', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/surface/chaka112/5800.html', wechatUrl: 'https://mp.weixin.qq.com/s/chaka-booking' },
                  { name: '莫高窟', desc: '世界文化遗产！壁画+雕塑，提前1个月抢票', price: '¥238（正常票）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dunhuang113/5801.html', wechatUrl: 'https://mp.weixin.qq.com/s/mogaozu' },
                  { name: '张掖七彩丹霞', desc: '上帝打翻的调色盘！日落最美', price: '¥74', img: 'images/cities/zhangye.jpg', ctripUrl: 'https://you.ctrip.com/sight/zhangye114/5802.html' }
                ],
                foods: [
                  { name: '手抓羊肉', desc: '青海特色，羊肉不膻，蘸蒜酱吃', price: '¥80/斤', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '青海老酸奶', desc: '西宁街边5元一碗，比内地的酸', price: '¥5/碗', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' },
                  { name: '牦牛肉串', desc: '沿途服务区都有，10元一串', price: '¥10/串', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' }
                ],
                hotels: [
                  { name: '西宁市区酒店', desc: '集合/解散都方便', price: '¥300/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xining24.html' },
                  { name: '敦煌酒店', desc: '鸣沙山附近，晚上可以看星空', price: '¥350/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dunhuang113.html' }
                ],
                tips: '茶卡盐湖要晴天上午去（无风如镜，下午起风就糊了）；U型公路拍照注意来车（大货车很快！）；莫高窟票提前1个月抢（正常票238，应急票100只能看4个窟）；全程干燥多喝水；紫外线极强，防晒必备；海拔2000-3000m，一般不会高反。' }
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
              ai: { budget: '¥4,000-6,000/人', transport: '兰州/敦煌进出，火车或包车', hotel: '张掖/嘉峪关/敦煌酒店', bestTime: '5-10月',
                timeline: [
                  { d: 'Day1 下午', t: '兰州落地 → 中山桥黄河铁桥 → 牛肉面（马子禄/磨沟沿）' },
                  { d: 'Day2 全天', t: '兰州 → 武威雷台汉墓（马踏飞燕出土地）→ 张掖大佛寺' },
                  { d: 'Day3 全天', t: '张掖丹霞日出 → 嘉峪关关城（天下第一雄关）' },
                  { d: 'Day4 全天', t: '瓜州（吃哈密瓜！）→ 榆林窟 → 敦煌' },
                  { d: 'Day5 全天', t: '莫高窟 → 鸣沙山露营看星空' },
                  { d: 'Day6 上午', t: '敦煌返程' }
                ],
                attractions: [
                  { name: '莫高窟', desc: '世界文化遗产！壁画+雕塑，提前1个月抢票', price: '¥238（正常票）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dunhuang113/5801.html', wechatUrl: 'https://mp.weixin.qq.com/s/mogaozu' },
                  { name: '鸣沙山月牙泉', desc: '沙漠中的绿洲！骑骆驼+滑沙+看星空', price: '¥110', img: 'images/cities/zhangye.jpg', ctripUrl: 'https://you.ctrip.com/sight/dunhuang113/5900.html' },
                  { name: '榆林窟', desc: '莫高窟姊妹窟！人少壁画更原始', price: '¥55', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/guazhou115/5901.html' }
                ],
                foods: [
                  { name: '兰州牛肉面', desc: '马子禄/磨沟沿，早上吃最正宗', price: '¥15/碗', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '羊肉垫卷子', desc: '张掖特色，羊肉+面卷一锅出', price: '¥60/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '李广杏皮水', desc: '敦煌特色，酸梅汤替代品', price: '¥8/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
                ],
                hotels: [
                  { name: '敦煌酒店', desc: '鸣沙山附近，晚上看星空方便', price: '¥350/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dunhuang113.html' },
                  { name: '张掖丹霞附近民宿', desc: '看日出方便', price: '¥200/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/zhangye114.html' }
                ],
                tips: '莫高窟特窟要另付费（200-500/窟）但值得看；榆林窟比莫高窟人少壁画更原始；鸣沙山露营夜间极冷需睡袋（夏天晚上也只有10度）；瓜州8月哈密瓜甜到爆，路边随便买；全程干燥，每天喝2L水。' }
            }
        ]
    },
    'BC': {
        icon: '🍜', title: '味蕾诗人', badge: '用舌头写旅行日记',
        desc: '你是那种会在咖啡馆写旅行手账的人。吃要吃得讲究，住要住得有味道，走要走得有节奏。你旅行不是打卡，是过日子。',
        routes: [
            { dest: '杭州 · 茶与食', days: '4天3晚', img: 'images/cities/hangzhou.jpg',
              itinerary: [
                { d: 'Day1', t: '西湖漫步 → 楼外楼西湖醋鱼 → 柳浪闻莺日落' },
                { d: 'Day2', t: '龙井村采茶 → 农家菜 → 九溪烟树徒步' },
                { d: 'Day3', t: '灵隐寺 → 法喜寺吃素面 → 小河直街咖啡馆' },
                { d: 'Day4', t: '西溪湿地 → 知味观 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人', transport: '地铁+公交+骑行，西湖景区步行', hotel: '西湖景区/河坊街附近', bestTime: '3-4月（春茶）或10月（桂花）',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '西湖漫步（柳浪闻莺→断桥→白堤）→ 楼外楼西湖醋鱼 → 湖滨夜景' },
                  { d: 'Day2 全天', t: '龙井村采茶体验 → 农家菜（龙井虾仁）→ 九溪烟树徒步' },
                  { d: 'Day3 全天', t: '灵隐寺 → 法喜寺吃素面（5元一碗！）→ 小河直街咖啡馆' },
                  { d: 'Day4 上午', t: '西溪湿地 → 知味观小吃 → 返程' }
                ],
                attractions: [
                  { name: '西湖', desc: '世界文化遗产！免费，游船另付', price: '免费（游船¥55）', img: 'images/cities/hangzhou.jpg', ctripUrl: 'https://you.ctrip.com/sight/hangzhou14/5010.html' },
                  { name: '灵隐寺', desc: '千年古刹！飞来峰+灵隐寺', price: '¥75（含飞来峰）', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/hangzhou14/5011.html', wechatUrl: 'https://mp.weixin.qq.com/s/lingyin' },
                  { name: '龙井村', desc: '西湖龙井产地！采茶体验+喝茶', price: '采茶体验¥100/人', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/hangzhou14/5012.html' }
                ],
                foods: [
                  { name: '西湖醋鱼', desc: '楼外楼招牌！酸甜口，不喜欢的人觉得腥', price: '¥88/条', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '龙井虾仁', desc: '春茶季节限定！茶香+虾仁鲜', price: '¥128/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
                  { name: '法喜寺素面', desc: '5元一碗！超好吃，法喜寺必吃', price: '¥5/碗', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' }
                ],
                hotels: [
                  { name: '西湖边酒店', desc: '步行到西湖，位置绝佳', price: '¥600/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/hangzhou14.html' },
                  { name: '河坊街民宿', desc: '古色古香，逛街方便', price: '¥300/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/hangzhou14.html' }
                ],
                tips: '楼外楼提前订位（周末排队2小时）；龙井村喝茶问清价格（按位/按杯差别很大）；法喜寺素面5元一碗超好吃（法喜寺比灵隐寺人少更安静）；西湖周末限行（单双号）；3-4月春茶季最推荐，10月桂花飘香也很美。' }
            },
            { dest: '苏州 · 园林与面', days: '4天3晚', img: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '拙政园 → 同得兴苏式汤面 → 平江路夜游' },
                { d: 'Day2', t: '留园 → 虎丘 → 山塘街吃小吃' },
                { d: 'Day3', t: '网师园晨景 → 狮子林 → 金鸡湖日落' },
                { d: 'Day4', t: '诚品书店 → 哑巴生煎 → 返程' }
              ],
              ai: { budget: '¥2,000-3,500/人', transport: '地铁+步行，古城区不大', hotel: '平江路/观前街附近', bestTime: '3-5月（园林春色）或9-11月',
                timeline: [
                  { d: 'Day1 上午-晚上', t: '拙政园（早上8点开门就进！）→ 同得兴苏式汤面 → 平江路夜游' },
                  { d: 'Day2 全天', t: '留园 → 虎丘（斜塔+剑池）→ 山塘街吃小吃' },
                  { d: 'Day3 全天', t: '网师园晨景（小而精，早上没人）→ 狮子林（假山迷宫）→ 金鸡湖日落' },
                  { d: 'Day4 上午', t: '诚品书店 → 哑巴生煎 → 返程' }
                ],
                attractions: [
                  { name: '拙政园', desc: '中国四大名园之首！早上8点开门就进（旅行团9点到）', price: '¥70', img: 'https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/suzhou11/5100.html' },
                  { name: '留园', desc: '中国四大名园之一！建筑+假山', price: '¥55', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/suzhou11/5101.html' },
                  { name: '平江路', desc: '苏州古城缩影！小桥流水+咖啡馆', price: '免费', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80' }
                ],
                foods: [
                  { name: '苏式汤面', desc: '同得兴/朱鸿兴，头汤面最香！', price: '¥30/碗', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '哑巴生煎', desc: '苏州生煎天花板！底脆汤多', price: '¥20/两', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: '松鼠桂鱼', desc: '松鹤楼招牌！酸甜酥脆', price: '¥128/条', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' }
                ],
                hotels: [
                  { name: '平江路民宿', desc: '古城区里，小桥流水', price: '¥400/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/suzhou11.html' },
                  { name: '观前街全季', desc: '连锁品质，逛街方便', price: '¥350/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/suzhou11.html' }
                ],
                tips: '拙政园早上8点开门就进（旅行团9点到，人挤人）；网师园小而精建议早上去（比拙政园安静10倍）；苏式面要吃"头汤面"（早上第一锅汤最鲜）；哑巴生煎排队但值得（15分钟以内）；苏州园林都是早上人少，下午旅行团爆满。' }
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
              ai: { budget: '¥1,500-2,500/人', transport: '地铁+步行，市区景点集中', hotel: '五一广场/黄兴广场附近', bestTime: '3-5月或9-11月',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '五一广场 → 太平街逛吃 → 黄兴路步行街夜市 → 坡子街' },
                  { d: 'Day2 全天', t: '岳麓山（索道上山）→ 橘子洲头看毛主席像 → 文和友怀旧场景' },
                  { d: 'Day3 上午-下午', t: '谢子龙影像艺术馆 → 李自健美术馆 → 梅溪湖艺术中心拍照' },
                  { d: 'Day4 上午', t: '冬瓜山小吃街 → 返程' }
                ],
                attractions: [
                  { name: '橘子洲头', desc: '毛主席青年艺术雕塑，坐小火车上岛', price: '免费（小火车¥40）', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/changsha148/5302.html' },
                  { name: '岳麓山', desc: '索道看长沙全景，爱晚亭秋色绝美', price: '免费', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/changsha148/5305.html' },
                  { name: '谢子龙影像艺术馆', desc: '网红建筑，拍照出片', price: '免费（特展另购）', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', wechatUrl: 'https://mp.weixin.qq.com/s/xzl-museum' }
                ],
                foods: [
                  { name: '茶颜悦色', desc: '长沙灵魂茶饮，幽兰拿铁必点', price: '¥16/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' },
                  { name: '文和友', desc: '怀旧市井场景，小龙虾+老长沙味道', price: '¥100/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '冬瓜山肉肠', desc: '长沙夜宵界天花板，配糖油粑粑', price: '¥20/人', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' }
                ],
                hotels: [
                  { name: '五一广场附近酒店', desc: '地铁1/2号线交汇，去哪都方便', price: '¥300', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/changsha148.html' },
                  { name: 'IFS国金中心酒店', desc: '顶楼看全景，购物方便', price: '¥800', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/changsha148.html' }
                ],
                tips: '茶颜悦色每隔50米一家不用排长队；文和友晚上7点后要排队；岳麓山索道看日落；谢子龙艺术馆免费但需公众号预约。' }
            },
            { dest: '厦门 → 泉州 · 闽南文艺线', days: '5天4晚', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '厦门沙坡尾 → 环岛路日落' },
                { d: 'Day2', t: '鼓浪屿 → 老别墅咖啡馆' },
                { d: 'Day3', t: '泉州 → 西街 → 开元寺 → 姜母鸭' },
                { d: 'Day4', t: '蟳埔村簪花体验 → 洛阳桥 → 夜市' },
                { d: 'Day5', t: '泉州返程' }
              ],
              ai: { budget: '¥2,500-4,000/人', transport: '厦门动车到泉州（1小时）', hotel: '厦门沙坡尾/泉州西街民宿', bestTime: '10月-4月',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '厦门沙坡尾艺术西区 → 环岛路日落 → 曾厝垵夜市' },
                  { d: 'Day2 全天', t: '鼓浪屿全天 → 老别墅咖啡馆发呆 → 日光岩日落' },
                  { d: 'Day3 全天', t: '厦门动车到泉州 → 西街逛吃 → 开元寺 → 姜母鸭晚餐' },
                  { d: 'Day4 全天', t: '蟳埔村簪花体验（40元含衣服！）→ 洛阳桥 → 泉州夜市' },
                  { d: 'Day5 上午', t: '泉州返程' }
                ],
                attractions: [
                  { name: '鼓浪屿', desc: '万国建筑博物馆，小巷迷路是乐趣', price: '船票¥35', img: 'images/cities/xiamen.jpg', ctripUrl: 'https://you.ctrip.com/sight/xiamen23/4723.html', wechatUrl: 'https://mp.weixin.qq.com/s/xiamen-ferry' },
                  { name: '泉州开元寺', desc: '福建最大佛教建筑东西塔！免费', price: '免费', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80' },
                  { name: '蟳埔村', desc: '簪花体验！40元含衣服+拍照，出片绝美', price: '簪花¥40', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/quanzhou116/6000.html' }
                ],
                foods: [
                  { name: '姜母鸭', desc: '泉州必吃！砂锅慢炖，鸭肉超香', price: '¥50/份', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
                  { name: '泉州牛肉面', desc: '比厦门便宜一半！料超足', price: '¥15/碗', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
                  { name: '土笋冻', desc: '泉州黑暗料理！沙虫做的，勇敢者尝试', price: '¥10/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
                ],
                hotels: [
                  { name: '沙坡尾设计民宿', desc: '艺术西区旁，拍照出片', price: '¥300/晚', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xiamen23.html' },
                  { name: '泉州西街民宿', desc: '古城里，逛吃方便', price: '¥200/晚', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/quanzhou116.html' }
                ],
                tips: '蟳埔村簪花40元含衣服+化妆（拍照绝美，小红书爆款）；泉州牛肉面比厦门便宜一半（15元 vs 30元）；洛阳桥退潮时赶海（小螃蟹+小螺）；厦门到泉州动车票提前买（1小时，¥25）；泉州是世界文化遗产城市，比厦门更有文化底蕴。' }
            }
        ]
    }
};

let currentQ = 0, answers = [], quizLocked = false;
function startQuiz() {
    currentQ = 0; answers = []; quizLocked = false;
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
    if (quizLocked) return;
    quizLocked = true;
    document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    answers[currentQ] = score;
    setTimeout(() => {
        currentQ++;
        quizLocked = false;
        if (currentQ < quizQuestions.length) showQuestion(); else showResult();
    }, 250);
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
        aiGuideStore.push({ dest: rt.dest, ai: rt.ai });
        html += `<div class="route-detail-card"><div class="route-card-img" style="background-image:url('${rt.img || mylImgUrl(rt.dest,'sight')}')"><span class="days-badge">${rt.days}</span></div><div class="route-card-body"><h5>${rt.dest}</h5><div class="route-sub">MYL 专属定制线路 · 含住宿+门票+交通</div>${rt.itinerary.map(day => `<div class="route-day"><span class="route-day-label">${day.d}</span> <span class="route-day-text">${day.t}</span></div>`).join('')}<button class="ai-guide-btn" onclick="toggleAIGuide(this,'pGuide${aiIdx}',${aiIdx})">✨ AI 生成详细路书</button><div class="ai-guide-panel" id="pGuide${aiIdx}"></div></div></div>`;
    });
    html += `</div><button class="btn" onclick="startQuiz()">重新测试</button><a href="index.html#china" class="btn btn-outline" style="margin-left:8px">看看更多目的地</a></div>`;
    resultEl.innerHTML = html;
}

// ============================================================
//  必去清单 —— 上传真实图片打卡
// ============================================================
let bucketMapInitialized = false, bucketMap;
let bucketPhotos = JSON.parse(localStorage.getItem('myBucketPhotos') || '{}');

const bucketList = [
    { name: '冰岛·极光', lat: 64.96, lng: -19.02, icon: '🌌', route: '7天环岛，雷克雅未克→黄金圈→南岸→冰河湖→追极光' },
    { name: '新西兰·皇后镇', lat: -45.03, lng: 168.66, icon: '🏔️', route: '10天南岛自驾，基督城→福克斯冰川→皇后镇→米尔福德峡湾' },
    { name: '日本·京都', lat: 35.01, lng: 135.77, icon: '⛩️', route: '5天深度，清水寺→金阁寺→岚山→伏见稻荷→哲学之道' },
    { name: '泰国·清迈', lat: 18.79, lng: 98.98, icon: '🛕', route: '6天慢城，古城→素贴山→烹饪课→大象营→拜县' },
    { name: '巴厘岛·乌布', lat: -8.51, lng: 115.26, icon: '🌴', route: '6天，库塔冲浪→乌布梯田→蓝梦岛浮潜→水明漾' },
    { name: '澳大利亚·大堡礁', lat: -18.29, lng: 147.70, icon: '🐠', route: '凯恩斯3天，大堡礁游船→库兰达热带雨林→棕榈湾' },
    { name: '埃及·金字塔', lat: 29.98, lng: 31.13, icon: '🔺', route: '8天，开罗→金字塔→卢克索神庙→阿斯旺' },
    { name: '肯尼亚·马赛马拉', lat: -1.48, lng: 35.14, icon: '🦁', route: '7天野生动物之旅，内罗毕→马赛马拉→安博塞利' },
    { name: '土耳其·卡帕多奇亚', lat: 38.64, lng: 34.83, icon: '🎈', route: '热气球日出→地下城→格雷梅露天博物馆→日落ATV' },
    { name: '法国·巴黎', lat: 48.86, lng: 2.35, icon: '🗼', route: '7天，埃菲尔铁塔→卢浮宫→塞纳河→凡尔赛宫→蒙马特' },
    { name: '意大利·威尼斯', lat: 45.44, lng: 12.33, icon: '🚤', route: '3天主岛→彩色岛→玻璃岛→贡多拉夜游' },
    { name: '西班牙·巴塞罗那', lat: 41.39, lng: 2.17, icon: '🏖️', route: '5天，圣家堂→古埃尔公园→兰布拉大道→海边' },
    { name: '美国·纽约', lat: 40.71, lng: -74.01, icon: '🗽', route: '5天，曼哈顿→自由女神→中央公园→布鲁克林大桥' },
    { name: '美国·大峡谷', lat: 36.11, lng: -112.11, icon: '🏜️', route: '拉斯维加斯出发3天，西峡→南峡→胡佛水坝' },
    { name: '秘鲁·马丘比丘', lat: -13.16, lng: -72.55, icon: '⛰️', route: '7天，库斯科→神圣山谷→马丘比丘日出→的的喀喀湖' },
    { name: '巴西·里约', lat: -22.91, lng: -43.17, icon: '🏖️', route: '5天，基督像→面包山→科帕卡巴纳海滩→塞勒隆阶梯' },
    { name: '中国·西藏拉萨', lat: 29.65, lng: 91.14, icon: '🛕', route: '7天，布达拉宫→大昭寺→纳木错→羊卓雍措→林芝' },
    { name: '中国·新疆喀什', lat: 39.47, lng: 75.99, icon: '🏜️', route: '8天南疆，喀什古城→帕米尔高原→塔县→盘龙古道' },
    { name: '中国·云南大理', lat: 25.61, lng: 100.27, icon: '🌊', route: '5天，古城→洱海骑行→喜洲→沙溪→苍山' },
    { name: '中国·四川稻城', lat: 28.44, lng: 100.33, icon: '🏔️', route: '6天，成都→新都桥→稻城亚丁→牛奶海→五色海' },
    { name: '中国·甘肃敦煌', lat: 40.17, lng: 94.67, icon: '🏜️', route: '5天，莫高窟→鸣沙山月牙泉→玉门关→雅丹魔鬼城' },
    { name: '中国·张家界', lat: 29.12, lng: 110.48, icon: '⛰️', route: '5天，国家森林公园→天门山→大峡谷玻璃桥→凤凰古城' },
    { name: '中国·三亚', lat: 18.25, lng: 109.51, icon: '🏝️', route: '5天，亚龙湾→蜈支洲岛→天涯海角→南山寺→海棠湾' },
    { name: '中国·哈尔滨', lat: 45.80, lng: 126.53, icon: '❄️', route: '5天冰雪季，中央大街→冰雪大世界→太阳岛→索菲亚教堂' },
    { name: '韩国·首尔', lat: 37.57, lng: 126.98, icon: '🏯', route: '5天，景福宫→明洞→弘大→江南→北村韩屋村' },
    { name: '新加坡', lat: 1.35, lng: 103.82, icon: '🏙️', route: '4天，滨海湾花园→圣淘沙→乌节路→克拉码头→Night Safari' },
    { name: '瑞士·阿尔卑斯', lat: 46.52, lng: 6.57, icon: '🏔️', route: '8天少女峰线，日内瓦→蒙特勒→因特拉肯→少女峰→苏黎世' },
    { name: '希腊·圣托里尼', lat: 36.39, lng: 25.46, icon: '⛪', route: '5天，伊亚日落→费拉小镇→红沙滩→火山温泉→Oia晚宴' },
    { name: '加拿大·班夫', lat: 51.18, lng: -115.57, icon: '🏔️', route: '7天落基山，卡尔加里→班夫镇→露易丝湖→贾斯珀' },
    { name: '南极', lat: -82.00, lng: 0.00, icon: '🐧', route: '15天邮轮，乌斯怀亚出发→德雷克海峡→南极半岛→企鹅栖息地' }
];

/* WGS84 → GCJ-02 火星坐标转换：高德瓦片使用 GCJ-02，不转换标记会偏移约 500 米 */
function __wgs2gcj(lat, lng) {
    const a = 6378245.0, ee = 0.00669342162296594323;
    const tLat = (x, y) => {
        let r = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        r += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
        r += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
        r += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
        return r;
    };
    const tLng = (x, y) => {
        let r = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        r += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
        r += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
        r += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
        return r;
    };
    let dLat = tLat(lng - 105.0, lat - 35.0), dLng = tLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng];
}

function initBucketMap() {
    bucketMapInitialized = true;
    bucketMap = L.map('bucketMap').setView([30, 10], 2);
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { subdomains: ['1','2','3','4'], attribution: '© 高德地图' }).addTo(bucketMap);
    renderBucketMarkers();
    updateBucketStats();
}

let pendingUploadIdx = null;
function renderBucketMarkers() {
    bucketMap.eachLayer(layer => { if (layer instanceof L.Marker) bucketMap.removeLayer(layer); });
    bucketList.forEach((place, idx) => {
        const hasPhoto = bucketPhotos[idx];
        const icon = L.divIcon({
            html: `<div style="font-size:24px;cursor:pointer;${hasPhoto ? '' : 'opacity:.5'}">${place.icon}</div>`,
            className: 'bucket-marker', iconSize: [24, 24]
        });
        const g = __wgs2gcj(place.lat, place.lng);
        const marker = L.marker(g, { icon }).addTo(bucketMap);
        const photo = hasPhoto || (typeof mylImgUrl === 'function' ? mylImgUrl(place.name, 'sight') : 'images/city-fallback.jpg');
        marker.bindPopup(`<div style="text-align:center;min-width:190px"><div style="font-size:26px;margin-bottom:4px">${place.icon}</div><div style="font-weight:700;margin-bottom:6px">${place.name}</div><img src="${photo}" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px" alt="${place.name}" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />${hasPhoto ? '<div style="font-size:.72rem;color:#22c55e;margin-bottom:6px">✓ 你已打卡</div>' : ''}<div style="font-size:.78rem;color:#64748b;margin-bottom:8px;text-align:left;background:#f8fafc;padding:8px;border-radius:6px">🗺️ ${place.route}</div><button onclick="openUpload(${idx})" style="background:${hasPhoto ? '#22c55e' : '#ef4444'};color:#fff;border:none;padding:6px 16px;border-radius:20px;cursor:pointer;font-size:.85rem;">${hasPhoto ? '✓ 已打卡 · 换照片' : '上传照片打卡'}</button></div>`);
    });
}

function openUpload(idx) {
    pendingUploadIdx = idx;
    document.getElementById('uploadPlaceName').textContent = '上传你在「' + bucketList[idx].name + '」拍的真实照片';
    document.getElementById('uploadModal').classList.add('open');
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadInput').value = '';
}
function closeUpload() {
    document.getElementById('uploadModal').classList.remove('open');
    pendingUploadIdx = null;
}

document.getElementById('uploadInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxW = 300;
            const scale = Math.min(1, maxW / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            const preview = document.getElementById('uploadPreview');
            preview.src = compressed;
            preview.style.display = 'block';
            window._uploadData = compressed;
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
});

function confirmUpload() {
    if (!window._uploadData || pendingUploadIdx === null) { alert('请先选择一张照片'); return; }
    try {
        bucketPhotos[pendingUploadIdx] = window._uploadData;
        localStorage.setItem('myBucketPhotos', JSON.stringify(bucketPhotos));
        renderBucketMarkers();
        updateBucketStats();
        closeUpload();
    } catch(e) {
        alert('照片太大了，存储空间不足。请压缩后再试。');
    }
    window._uploadData = null;
}

function updateBucketStats() {
    const count = Object.keys(bucketPhotos).length;
    document.getElementById('visitedCount').textContent = count;
    document.getElementById('percentText').textContent = Math.round(count / bucketList.length * 100) + '%';
}

function resetBucket() {
    if (confirm('确定要清空所有打卡照片吗？')) {
        bucketPhotos = {};
        localStorage.setItem('myBucketPhotos', '{}');
        renderBucketMarkers(); updateBucketStats();
    }
}

// ============================================================
//  剧游 —— 展开线路 + AI路书
// ============================================================
const dramaData = [
    { title: '《去有风的地方》', tag: '热播剧', loc: '云南 · 大理',
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
      desc: '许红豆在大理洱海边的民宿里治愈了自己。如果你也累了，去有风的地方走走吧。',
      spots: ['洱海生态廊道','喜洲古镇','沙溪古镇','凤阳邑'],
      route: { name: '大理治愈 5 日线路', days: [
          { d: 'Day1', t: '大理古城入住 → 人民路闲逛 → 黄昏洋人街' },
          { d: 'Day2', t: '洱海生态廊道骑行 → 喜洲稻田 → 海舌公园日落' },
          { d: 'Day3', t: '沙溪古镇 → 寺登街 → 先锋书局 → 石宝山' },
          { d: 'Day4', t: '凤阳邑茶马古道 → 无为寺 → 咖啡馆发呆' },
          { d: 'Day5', t: '苍山洗马潭索道 → 寂照庵吃素斋 → 返程' }
      ]},
      ai: { budget: '¥2,500-4,000/人（5天含住）', transport: '大理站/机场打车，环洱海租电动车', hotel: '古城内/才村洱海边民宿', bestTime: '3-5月或9-11月',
        timeline: [
          { d: 'Day1 下午', t: '大理古城入住 → 人民路闲逛 → 黄昏洋人街看夕阳' },
          { d: 'Day2 全天', t: '洱海生态廊道骑行 → 喜洲稻田 → 海舌公园日落' },
          { d: 'Day3 全天', t: '沙溪古镇 → 寺登街 → 先锋书局 → 石宝山' },
          { d: 'Day4 全天', t: '凤阳邑茶马古道 → 无为寺 → 咖啡馆发呆' },
          { d: 'Day5 上午', t: '苍山洗马潭索道 → 寂照庵吃素斋 → 返程' }
        ],
        attractions: [
          { name: '洱海生态廊道', desc: '骑行/散步都美，剧中许红豆常去', price: '免费', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80' },
          { name: '喜洲古镇', desc: '稻田+白族民居，剧中有风小院取景地', price: '免费', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dali45/5288.html' },
          { name: '沙溪古镇', desc: '茶马古道上唯一幸存的古集市', price: '免费', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80' },
          { name: '苍山洗马潭', desc: '索道上山看洱海全景', price: '¥282（索道）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dali45/5290.html' }
        ],
        foods: [
          { name: '喜洲粑粑', desc: '甜咸都好吃，现烤最香', price: '¥10/个', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '白族石板烧', desc: '大理特色，自己烤着吃', price: '¥60/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '乳扇沙琪玛', desc: '白族特色奶制品，当零食吃', price: '¥20/盒', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' }
        ],
        hotels: [
          { name: '才村洱海边民宿', desc: '推开窗就是洱海，看日出绝佳', price: '¥400', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali45.html' },
          { name: '古城内青旅', desc: '人民路附近，方便认识旅伴', price: '¥80/床位', img: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali45.html' }
        ],
        tips: '洱海骑行选海西生态廊道（免费）；紫外线极强，防晒必备；节假日环海路堵车建议早出发；喜洲稻田最佳季节是9-10月。' }
    },
    { title: '《漫长的季节》', tag: '爆款', loc: '辽宁 · 沈阳',
      img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
      desc: '"往前看，别回头。"东北老工业基地的秋天，有一种苍凉的浪漫。',
      spots: ['铁西区','沈阳故宫','北陵公园','西塔街'],
      route: { name: '沈阳怀旧 3 日线路', days: [
          { d: 'Day1', t: '铁西区工业博物馆 → 1905文创园 → 西塔街吃烤肉' },
          { d: 'Day2', t: '沈阳故宫 → 张氏帅府 → 中街 → 老边饺子馆' },
          { d: 'Day3', t: '北陵公园昭陵 → 辽宁省博物馆 → 返程' }
      ]},
      ai: { budget: '¥1,500-2,500/人（3天含住）', transport: '地铁+打车，市区景点集中', hotel: '中街/太原街附近', bestTime: '9-10月（秋景）或12-1月（冰雪）',
        timeline: [
          { d: 'Day1 下午', t: '铁西区工业博物馆 → 1905文创园 → 西塔街吃朝鲜族烤肉' },
          { d: 'Day2 全天', t: '沈阳故宫 → 张氏帅府 → 中街逛街 → 老边饺子馆晚餐' },
          { d: 'Day3 上午', t: '北陵公园昭陵 → 辽宁省博物馆 → 返程' }
        ],
        attractions: [
          { name: '沈阳故宫', desc: '清朝入关前的皇宫，比北京故宫小但精致', price: '¥50', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/shenyang155/4740.html' },
          { name: '张氏帅府', desc: '张作霖张学良父子的官邸，民国建筑风', price: '¥48', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/shenyang155/4741.html' },
          { name: '北陵公园（昭陵）', desc: '皇太极陵墓，沈阳最大公园，秋天银杏绝美', price: '¥50', img: 'images/cities/shenyang.jpg', ctripUrl: 'https://you.ctrip.com/sight/shenyang155/4742.html' }
        ],
        foods: [
          { name: '西塔街烤肉', desc: '朝鲜族聚居区，烤肉正宗又便宜', price: '¥80/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '老边饺子馆', desc: '百年老字号，蒸饺子皮薄馅大', price: '¥50/人', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '锅包肉', desc: '东北菜代表，酸甜酥脆必点', price: '¥45/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
        ],
        hotels: [
          { name: '中街附近快捷酒店', desc: '逛街吃饭方便，地铁口', price: '¥250', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/shenyang155.html' },
          { name: '太原街全季酒店', desc: '连锁品质，干净舒适', price: '¥350', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/shenyang155.html' }
        ],
        tips: '西塔街朝鲜族烤肉正宗；东北菜分量大两人点三个菜够；冬天零下20度注意保暖；9-10月秋景最美，故宫红墙配银杏。' }
    },
    { title: '《繁花》', tag: '年代剧', loc: '上海',
      img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80',
      desc: '黄河路的烟火气，至真园的本帮菜，90年代上海的繁华一梦。',
      spots: ['黄河路','外滩','和平饭店','永康路'],
      route: { name: '上海繁花 3 日线路', days: [
          { d: 'Day1', t: '黄河路（至真园取景地）→ 国际饭店西饼屋 → 外滩夜游' },
          { d: 'Day2', t: '和平饭店下午茶 → 永康路咖啡馆 → 武康路 → 思南公馆' },
          { d: 'Day3', t: '上海博物馆 → 豫园城隍庙 → 老正兴本帮菜 → 返程' }
      ]},
      ai: { budget: '¥2,500-4,000/人（3天含住）', transport: '地铁全覆盖，打车起步价14元', hotel: '南京西路/外滩附近', bestTime: '3-5月或9-11月',
        timeline: [
          { d: 'Day1 下午-晚上', t: '黄河路打卡至真园 → 国际饭店买蝴蝶酥 → 外滩夜游看陆家嘴灯光' },
          { d: 'Day2 全天', t: '和平饭店下午茶 → 永康路咖啡馆 → 武康路大楼拍照 → 思南公馆' },
          { d: 'Day3 上午', t: '上海博物馆 → 豫园城隍庙 → 老正兴本帮菜午餐 → 返程' }
        ],
        attractions: [
          { name: '外滩', desc: '万国建筑博览群，夜景绝美', price: '免费', img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80' },
          { name: '和平饭店', desc: '费尔蒙旗下，90年代上海的象征', price: '下午茶¥298/人', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/shanghai2.html' },
          { name: '武康路', desc: '武康大楼打卡，网红咖啡馆一条街', price: '免费', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80' }
        ],
        foods: [
          { name: '老正兴本帮菜', desc: '百年老字号，红烧肉+草头圈子', price: '¥120/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '国际饭店蝴蝶酥', desc: '黄河路排队王，奶香酥脆', price: '¥20/盒', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '永康路咖啡', desc: '%Arabica/Manner，网红咖啡一条街', price: '¥35/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
        ],
        hotels: [
          { name: '和平饭店', desc: '繁花同款，住进去就是戏', price: '¥1800', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/shanghai2.html' },
          { name: '南京西路全季', desc: '性价比高，地铁口', price: '¥450', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/shanghai2.html' }
        ],
        tips: '和平饭店下午茶提前预约；本帮菜偏甜；武康路大楼拍照人多排队；豫园老街比城隍庙便宜；蝴蝶酥下午3点后可能卖完。' }
    },
    { title: '《灌篮高手》', tag: '日剧圣地', loc: '日本 · 镰仓',
      img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
      desc: '樱木花道挥手的那个路口，是多少人的青春回忆。',
      spots: ['镰仓高校前站','江之岛','湘南海岸','鹤冈八幡宫'],
      route: { name: '镰仓青春 2 日线路', days: [
          { d: 'Day1', t: '东京出发 → 镰仓高校前站打卡 → 湘南海岸骑行 → 江之岛日落' },
          { d: 'Day2', t: '鹤冈八幡宫 → 小町通商店街 → 镰仓大佛 → 返东京' }
      ]},
      ai: { budget: '¥6,000-9,000/人（含东京住宿分摊）', transport: '东京藤泽站坐江之电，一日券800日元', hotel: '东京市区住，镰仓当日往返', bestTime: '3-4月樱花或11月红叶',
        timeline: [
          { d: 'Day1 上午-晚上', t: '东京出发 → 镰仓高校前站打卡（樱木花道路口）→ 湘南海岸骑行 → 江之岛日落' },
          { d: 'Day2 全天', t: '鹤冈八幡宫 → 小町通商店街吃小吃 → 镰仓大佛 → 返东京' }
        ],
        attractions: [
          { name: '镰仓高校前站', desc: '灌篮高手片头那个路口！', price: '免费', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80' },
          { name: '江之岛', desc: '海边小岛，日落绝美', price: '免费', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kamakura436/12568.html' },
          { name: '镰仓大佛', desc: '高德院镰仓大佛，日本国宝', price: '¥300', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kamakura436/12569.html' }
        ],
        foods: [
          { name: '江之岛海鲜丼', desc: '新鲜海胆+三文鱼，海边现做', price: '¥2000/碗', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
          { name: '小町通小吃', desc: '烤团子/抹茶冰淇淋/仙贝', price: '¥800/人', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '镰仓啤酒', desc: '当地精酿，海边喝超爽', price: '¥600/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
        ],
        hotels: [
          { name: '东京新宿民宿', desc: '交通方便，去镰仓当日往返', price: '¥500', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/tokyo208.html' },
          { name: '镰仓海滨酒店', desc: '住一晚看海，清晨没人时拍照', price: '¥800', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/kamakura436.html' }
        ],
        tips: '镰仓高校前站路口拍照注意交通安全（有电车通过）；江之电一日券800日元划算；末班车18:00左右；海水浴场7-8月开放。' }
    },
    { title: '《卧虎藏龙》', tag: '电影', loc: '安徽 · 宏村',
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
      desc: '李慕白和玉娇龙在竹海间飞来飞去，水墨丹青般的徽派古村。',
      spots: ['宏村','西递','木坑竹海','塔川'],
      route: { name: '宏村水墨 3 日线路', days: [
          { d: 'Day1', t: '宏村全天 → 南湖书院 → 月沼 → 承志堂 → 住民宿看星空' },
          { d: 'Day2', t: '木坑竹海（电影取景地）→ 塔川秋色 → 西递古村' },
          { d: 'Day3', t: '黄山一日游 → 迎客松→光明顶→西海大峡谷 → 返程' }
      ]},
      ai: { budget: '¥1,500-2,500/人（3天含住）', transport: '黄山北站大巴到宏村（1小时）', hotel: '宏村内徽派民宿', bestTime: '11月（塔川秋色）或3-4月（油菜花）',
        timeline: [
          { d: 'Day1 全天', t: '宏村全天：南湖书院 → 月沼倒影 → 承志堂 → 住民宿看星空' },
          { d: 'Day2 全天', t: '木坑竹海（卧虎藏龙取景地）→ 塔川秋色 → 西递古村' },
          { d: 'Day3 全天', t: '黄山一日游：迎客松 → 光明顶 → 西海大峡谷 → 返程' }
        ],
        attractions: [
          { name: '宏村', desc: '中国画里的乡村，月沼倒影必拍', price: '¥104', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/yixian845/4920.html' },
          { name: '木坑竹海', desc: '卧虎藏龙竹林打斗取景地', price: '¥40', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/yixian845/4921.html' },
          { name: '塔川', desc: '秋天红叶+白墙黑瓦，中国四大秋色之一', price: '¥55', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/yixian845/4922.html' }
        ],
        foods: [
          { name: '臭鳜鱼', desc: '徽州招牌，闻着臭吃着香', price: '¥68/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
          { name: '毛豆腐', desc: '徽州特色，煎着吃外酥里嫩', price: '¥25/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' },
          { name: '黄山烧饼', desc: '梅干菜肉馅，咸香酥脆', price: '¥15/袋', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' }
        ],
        hotels: [
          { name: '宏村内徽派民宿', desc: '住在古村里，清晨没人时拍照', price: '¥300', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/yixian845.html' },
          { name: '黄山山顶酒店', desc: '看日出方便，但条件简陋', price: '¥800', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/huangshan19.html' }
        ],
        tips: '宏村早上6点没人适合拍照；黄山索道提前买；臭鳜鱼闻着臭吃着香；民宿通常含早餐；塔川11月中旬红叶最盛。' }
    },
    { title: '《小森林》', tag: '治愈系', loc: '日本 · 秋田',
      img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
      desc: '一年四季，稻田、木屋、手作料理。这是理想中的乡村生活。',
      spots: ['横手市','羽後町','奥州平泉','秋田内陆线'],
      route: { name: '秋田治愈 4 日线路', days: [
          { d: 'Day1', t: '东京→秋田 → 横手市 → 入住乡村民宿' },
          { d: 'Day2', t: '羽後町稻田散步 → 手作料理体验 → 秋田内陆线小火车' },
          { d: 'Day3', t: '奥州平泉 → 中尊寺 → 毛越寺庭园 → 白鹭温泉' },
          { d: 'Day4', t: '乳头高原 → 乳头温泉乡 → 返东京' }
      ]},
      ai: { budget: '¥8,000-12,000/人（含机票+JR Pass）', transport: '东京新干线到秋田（3小时），当地坐内陆线', hotel: '乡村民宿+温泉旅馆', bestTime: '9-10月（稻田金黄）或1-2月（雪景）',
        timeline: [
          { d: 'Day1 下午', t: '东京新干线→秋田 → 横手市 → 入住乡村民宿 → 老板娘手作晚餐' },
          { d: 'Day2 全天', t: '羽後町稻田散步 → 手作料理体验 → 秋田内陆线小火车（超治愈）' },
          { d: 'Day3 全天', t: '奥州平泉 → 中尊寺金色堂 → 毛越寺庭园 → 白鹭温泉泡汤' },
          { d: 'Day4 上午', t: '乳头高原散步 → 乳头温泉乡 → 返东京' }
        ],
        attractions: [
          { name: '羽後町稻田', desc: '小森林取景地，秋天金黄绝美', price: '免费', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
          { name: '中尊寺', desc: '平泉世界遗产，金色堂金碧辉煌', price: '¥1000', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/hiraizumi1254/12570.html' },
          { name: '乳头温泉乡', desc: '7个秘境温泉，深山里的治愈', price: '¥800/次', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/akita437/12571.html' }
        ],
        foods: [
          { name: '秋田手作料理', desc: '民宿老板娘做的，用当地食材', price: '含在民宿费里', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
          { name: '稻庭乌冬', desc: '日本三大乌冬之一，超滑', price: '¥1200/碗', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '秋田牛肉', desc: '和牛品种，铁板烧超香', price: '¥3000/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' }
        ],
        hotels: [
          { name: '乡村民宿（民泊）', desc: '小森林同款，和老板娘一起做饭', price: '¥600/晚含两餐', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80' },
          { name: '乳头温泉乡旅馆', desc: '秘汤体验，深山温泉', price: '¥1200/晚含怀石', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/akita437.html' }
        ],
        tips: '秋田内陆线班次少提前查时刻表；民宿体验料理需提前预约；温泉旅馆建议住一晚含怀石料理；9-10月稻田金黄最美，1-2月雪景也很治愈。' }
    }
];

function renderDrama() {
    let html = '';
    dramaData.forEach((d, i) => {
        const aiIdx = aiGuideStore.length;
        aiGuideStore.push({ dest: d.title, city: String(d.loc || '').split('·').pop().trim(), ai: d.ai });
        html += `<div class="drama-card"><div class="drama-img" style="background-image:url('${d.img || mylImgUrl(d.title,'sight')}')" onclick="toggleDramaRoute(${i})"><span class="drama-tag">${d.tag}</span><span class="drama-expand-hint">${d.route.name} ▾</span></div><div class="drama-body"><h3 onclick="toggleDramaRoute(${i})">${d.title}</h3><div class="drama-loc"><i class="fas fa-map-marker-alt"></i> ${d.loc}</div><p>${d.desc}</p><div class="drama-spots">${d.spots.map(s => `<span class="drama-spot">${s}</span>`).join('')}</div><div class="drama-route-detail" id="dramaRoute${i}"><h5>🗺️ ${d.route.name}</h5>${d.route.days.map(day => `<div class="route-day" style="margin-bottom:8px"><span class="route-day-label">${day.d}</span> <span class="route-day-text">${day.t}</span></div>`).join('')}<button class="ai-guide-btn" onclick="toggleAIGuide(this,'dramaGuide${aiIdx}',${aiIdx})">✨ AI 生成详细路书</button><div class="ai-guide-panel" id="dramaGuide${aiIdx}"></div></div><button class="btn btn-outline btn-sm" style="width:100%" onclick="toggleDramaRoute(${i})" id="dramaToggle${i}">展开线路行程 ▾</button></div></div>`;
    });
    document.getElementById('dramaGrid').innerHTML = html;
}
function toggleDramaRoute(i) {
    const detail = document.getElementById('dramaRoute' + i);
    const btn = document.getElementById('dramaToggle' + i);
    detail.classList.toggle('open');
    btn.textContent = detail.classList.contains('open') ? '收起线路 ▴' : '展开线路行程 ▾';
}

// ============================================================
//  Solo —— 展开行程 + AI路书（全部补图）
// ============================================================
const soloData = [
    { city: '成都 · 美食 Solo 之旅', img: 'images/cities/chengdu.jpg',
      desc: '一个人也能吃火锅！串串、冒菜、担担面，美食之都最适合独自觅食。',
      tags: ['🍜 美食友好','🚇 地铁方便','💰 消费低'],
      itinerary: [
          { d: 'Day1', t: '宽窄巷子 → 奎星楼街冒椒火辣（坐吧台）→ 锦里夜市' },
          { d: 'Day2', t: '大熊猫基地（早去）→ 建设巷小吃街 → 春熙路IFS' },
          { d: 'Day3', t: '人民公园鹤鸣茶社 → 玉林路小酒馆 → 地道串串香' },
          { d: 'Day4', t: '文殊院 → 洞子口张老二凉粉 → 返程' }
      ],
      safety: '成都安全指数高，夜市热闹但注意随身物品。一个人吃火锅可以选小火锅店或坐吧台。',
      ai: { budget: '¥2,000-3,500/人（4天含住）', transport: '地铁+打车，无需租车', hotel: '春熙路/太古里附近', bestTime: '3-6月或9-11月',
        timeline: [
          { d: 'Day1 下午', t: '宽窄巷子逛老成都 → 奎星楼街吃冒椒火辣（坐吧台）→ 锦里夜景+小吃' },
          { d: 'Day2 全天', t: '7:30到熊猫基地看熊猫吃早餐 → 建设巷小吃街 → 春熙路IFS爬墙熊猫' },
          { d: 'Day3 上午-晚上', t: '人民公园鹤鸣茶社喝盖碗茶 → 玉林路小酒馆 → 地道串串香' },
          { d: 'Day4 上午', t: '文殊院拜佛 → 洞子口张老二凉粉 → 返程' }
        ],
        attractions: [
          { name: '大熊猫繁育基地', desc: '一定要早去！熊猫早上最活跃', price: '¥55', img: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/chengdu104/1354.html' },
          { name: '宽窄巷子', desc: '老成都名片，宽巷子逛+窄巷子吃', price: '免费', img: 'images/cities/chengdu.jpg' },
          { name: '锦里古街', desc: '晚上灯笼亮起最美，小吃多但偏贵', price: '免费', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80' }
        ],
        foods: [
          { name: '冒椒火辣', desc: '奎星楼街网红串串，坐吧台一个人友好', price: '¥60/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '张老二凉粉', desc: '文殊院旁老字号，甜水面必点', price: '¥15/人', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '鹤鸣茶社', desc: '人民公园内百年老茶馆，盖碗茶15元', price: '¥15/位', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
        ],
        hotels: [
          { name: '春熙路智选假日', desc: '地铁口，逛街吃饭方便', price: '¥350', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chengdu104.html' },
          { name: '太古里博舍', desc: '设计感顶级，网红打卡', price: '¥1800', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chengdu104.html' }
        ],
        tips: '火锅提前大众点评取号；兔头/折耳根谨慎尝试；熊猫基地7点前到；一个人吃火锅选小火锅店或坐吧台。' }
    },
    { city: '厦门 · 文艺 Solo 之旅', img: 'images/cities/xiamen.jpg',
      desc: '鼓浪屿的小巷、曾厝垵的咖啡馆，适合一个人散步发呆的慢生活城市。',
      tags: ['☕ 咖啡馆多','🌊 海边散步','🛡️ 安全'],
      itinerary: [
          { d: 'Day1', t: '中山路骑楼 → 八市吃海鲜 → 沙坡尾艺术西区' },
          { d: 'Day2', t: '鼓浪屿全天 → 菽庄花园 → 日光岩日落 → 咖啡馆发呆' },
          { d: 'Day3', t: '曾厝垵 → 环岛路骑行 → 黄厝海滩看日出' },
          { d: 'Day4', t: '南普陀寺 → 厦大校园 → 返程' }
      ],
      safety: '厦门非常安全，适合女生 solo。鼓浪屿晚上人少，建议天黑前返回市区。',
      ai: { budget: '¥2,000-3,500/人（4天含住）', transport: 'BRT+打车+鼓浪屿轮渡', hotel: '思明区/沙坡尾设计民宿', bestTime: '10月-4月',
        timeline: [
          { d: 'Day1 下午', t: '中山路骑楼逛吃 → 八市吃海鲜 → 沙坡尾艺术西区拍照' },
          { d: 'Day2 全天', t: '鼓浪屿全天：菽庄花园 → 日光岩日落 → 小巷咖啡馆发呆' },
          { d: 'Day3 全天', t: '曾厝垵 → 环岛路骑行 → 黄厝海滩看日出' },
          { d: 'Day4 上午', t: '南普陀寺 → 厦大校园 → 返程' }
        ],
        attractions: [
          { name: '鼓浪屿', desc: '万国建筑博物馆，小巷迷路是乐趣', price: '船票¥35', img: 'images/cities/xiamen.jpg', ctripUrl: 'https://you.ctrip.com/sight/xiamen23/4723.html', wechatUrl: 'https://mp.weixin.qq.com/s/xiamen-ferry' },
          { name: '日光岩', desc: '鼓浪屿最高点，看日落绝美', price: '¥50', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/xiamen23/4725.html' },
          { name: '南普陀寺', desc: '闽南佛教圣地，素饼必买', price: '免费（需预约）', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', wechatUrl: 'https://mp.weixin.qq.com/s/nanputuo' }
        ],
        foods: [
          { name: '八市海鲜', desc: '厦门最接地气的海鲜市场，找加工店', price: '¥80/人', img: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=400&q=80' },
          { name: '沙茶面', desc: '厦门灵魂早餐，乌糖/月华都正宗', price: '¥25/碗', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '海蛎煎', desc: '闽南特色，配甜辣酱绝了', price: '¥20/份', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
        ],
        hotels: [
          { name: '沙坡尾设计民宿', desc: '艺术西区旁，拍照出片', price: '¥300', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xiamen23.html' },
          { name: '鼓浪屿磐诺假日', desc: '岛上住一晚，清晨没人时最美', price: '¥500', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/xiamen23.html' }
        ],
        tips: '鼓浪屿船票提前在"厦门轮渡"公众号买；厦大需要提前预约；八市海鲜找加工店注意称重；晚上鼓浪屿人少建议天黑前返回市区。' }
    },
    { city: '重庆 · 魔幻 Solo 之旅', img: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=600&q=80',
      desc: '8D 魔幻城市，一个人坐轻轨穿楼、过江索道，探索感拉满。',
      tags: ['🌶️ 火锅之都','🎮 探索感强','💰 消费低'],
      itinerary: [
          { d: 'Day1', t: '解放碑 → 洪崖洞夜景 → 千厮门大桥散步' },
          { d: 'Day2', t: '李子坝轻轨穿楼 → 鹅岭二厂 → 南山一棵树看夜景' },
          { d: 'Day3', t: '长江索道 → 磁器口古镇 → 地道老火锅' },
          { d: 'Day4', t: '武隆天生三桥一日游 → 返程' }
      ],
      safety: '重庆地形复杂，导航经常"骗人"，跟着问路人更靠谱。晚上走梯坎注意脚下。',
      ai: { budget: '¥1,500-2,800/人（4天含住）', transport: '轨道交通+打车', hotel: '解放碑/洪崖洞附近', bestTime: '3-6月或9-11月',
        timeline: [
          { d: 'Day1 下午-晚上', t: '解放碑打卡 → 洪崖洞夜景 → 千厮门大桥散步看两江夜景' },
          { d: 'Day2 全天', t: '李子坝轻轨穿楼 → 鹅岭二厂文创园 → 南山一棵树看夜景' },
          { d: 'Day3 全天', t: '长江索道 → 磁器口古镇 → 地道老火锅（一个人坐吧台）' },
          { d: 'Day4 全天', t: '武隆天生三桥一日游 → 返程' }
        ],
        attractions: [
          { name: '洪崖洞', desc: '千与千寻同款夜景，亮灯到22:00', price: '免费', img: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/chongqing158/4900.html' },
          { name: '李子坝轻轨站', desc: '轻轨穿楼而过，魔幻8D城市代表', price: '免费', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80' },
          { name: '武隆天生三桥', desc: '满城尽带黄金甲取景地，世界自然遗产', price: '¥125', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/wulong1102/4901.html' }
        ],
        foods: [
          { name: '地道老火锅', desc: '一个人点小锅或坐吧台，九宫格必点', price: '¥80/人', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '酸辣粉', desc: '解放碑八一路好吃街，酸辣开胃', price: '¥12/碗', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '磁器口陈麻花', desc: '现炸现卖，椒盐味最香', price: '¥20/袋', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
        ],
        hotels: [
          { name: '解放碑全季酒店', desc: '地铁口，逛街方便', price: '¥350', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chongqing158.html' },
          { name: '洪崖洞江景民宿', desc: '开窗就是洪崖洞夜景', price: '¥450', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/chongqing158.html' }
        ],
        tips: '导航在重庆经常不准（8D城市），跟着问路人更靠谱；长江索道提前在公众号买票（排队2小时）；洪崖洞夜景亮灯到22:00；武隆一日游报当地团更省心。' }
    },
    { city: '大理 · 治愈 Solo 之旅', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80',
      desc: '洱海边骑车、在人民路发呆，大理是 solo 旅行者的天堂，容易认识朋友。',
      tags: ['👥 容易认识人','🚲 骑行友好','🧘 治愈'],
      itinerary: [
          { d: 'Day1', t: '古城入住青旅 → 人民路闲逛 → 青旅拼饭' },
          { d: 'Day2', t: '洱海生态廊道骑行 → 喜洲古镇 → 海舌公园日落' },
          { d: 'Day3', t: '沙溪古镇一日游 → 认识旅伴 → 咖啡馆发呆' },
          { d: 'Day4', t: '苍山徒步 → 寂照庵 → 返程' }
      ],
      safety: '大理 solo 氛围极好，青旅经常组局。注意防晒，紫外线很强。',
      ai: { budget: '¥2,000-3,500/人（4天含住）', transport: '大理站打车到古城，环洱海租电动车', hotel: '古城青旅（多人间便宜）', bestTime: '3-5月或9-11月',
        timeline: [
          { d: 'Day1 下午-晚上', t: '古城入住青旅 → 人民路闲逛逛小店 → 青旅拼饭认识旅伴' },
          { d: 'Day2 全天', t: '洱海生态廊道骑行（免费段最美）→ 喜洲古镇吃喜洲粑粑 → 海舌公园看日落' },
          { d: 'Day3 全天', t: '沙溪古镇一日游（比大理古城更安静）→ 咖啡馆发呆' },
          { d: 'Day4 上午', t: '苍山徒步 → 寂照庵（中国最文艺尼姑庵）→ 返程' }
        ],
        attractions: [
          { name: '洱海生态廊道', desc: '免费骑行道，才村到龙龛段最美', price: '免费', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80' },
          { name: '喜洲古镇', desc: '白族民居建筑群，喜洲粑粑必吃', price: '免费', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dali28/5000.html' },
          { name: '苍山', desc: '洗马潭大索道登顶，俯瞰洱海', price: '¥282（索道）', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/dali28/5001.html' }
        ],
        foods: [
          { name: '喜洲粑粑', desc: '甜/咸两种，现烤外酥里软', price: '¥10/个', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '大理生皮', desc: '白族特色，猪肉半生蘸料（勇敢者游戏）', price: '¥40/份', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
          { name: '凉鸡米线', desc: '古城老字号，酸辣爽口', price: '¥12/碗', img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' }
        ],
        hotels: [
          { name: '古城青旅多人间', desc: '床位50-80/晚，容易认识朋友', price: '¥60', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali28.html' },
          { name: '才村洱海边民宿', desc: '开窗就是洱海，看日出绝美', price: '¥300', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/dali28.html' }
        ],
        tips: '青旅多人间床位50-80/晚，拼饭在人民路找搭子；环洱海电动车满电约80km，骑一半就够；紫外线极强，防晒必备；沙溪古镇比大理古城更安静治愈。' }
    },
    { city: '镰仓 · 青春 Solo 之旅', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80',
      desc: '跟着灌篮高手的脚步，在湘南海岸骑车，一个人也能很热血。',
      tags: ['🚃 电车文化','🌅 看海','📸 出片'],
      itinerary: [
          { d: 'Day1', t: '东京出发 → 镰仓高校前站打卡 → 湘南海岸骑行 → 江之岛日落' },
          { d: 'Day2', t: '鹤冈八幡宫 → 小町通商店街 → 镰仓大佛 → 返东京' }
      ],
      safety: '日本治安极好，适合 solo。电车班次固定，提前查好末班车时间。',
      ai: { budget: '¥6,000-9,000/人（含东京住）', transport: '东京藤泽站江之电一日券', hotel: '东京市区住当日往返', bestTime: '3-4月或11月',
        timeline: [
          { d: 'Day1 上午-晚上', t: '东京出发 → 镰仓高校前站打卡（樱木花道路口）→ 湘南海岸骑行 → 江之岛看日落' },
          { d: 'Day2 全天', t: '鹤冈八幡宫 → 小町通商店街吃小吃 → 镰仓大佛 → 返东京' }
        ],
        attractions: [
          { name: '镰仓高校前站', desc: '灌篮高手片头路口！青春回忆杀', price: '免费', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80' },
          { name: '江之岛', desc: '海边小岛，日落绝美，海鲜丼必吃', price: '免费', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kamakura436/12568.html' },
          { name: '镰仓大佛', desc: '高德院大佛，日本国宝', price: '¥300', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/kamakura436/12569.html' }
        ],
        foods: [
          { name: '江之岛海鲜丼', desc: '新鲜海胆+三文鱼，海边现做', price: '¥2000/碗', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
          { name: '小町通烤团子', desc: '日式烤麻薯，蘸黄豆粉', price: '¥300/串', img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
          { name: '镰仓啤酒', desc: '当地精酿，海边喝超爽', price: '¥600/杯', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
        ],
        hotels: [
          { name: '东京新宿民宿', desc: '交通方便，去镰仓当日往返', price: '¥500', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/tokyo208.html' },
          { name: '镰仓海滨酒店', desc: '住一晚看海，清晨没人时拍照', price: '¥800', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/kamakura436.html' }
        ],
        tips: '江之电一日券800日元划算；高校前路口拍照注意电车（有车通过！）；末班车18:00左右；海水浴场7-8月开放。日本治安极好，一个人很安全。' }
    },
    { city: '曼谷 · 美食 Solo 之旅', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
      desc: '街头美食天堂，一个人逛街边摊、逛夜市，泰国是 solo 旅行者的入门首选。',
      tags: ['🍜 街头美食','💊 签证简单','💰 消费低'],
      itinerary: [
          { d: 'Day1', t: '考山路夜市 → 芒果糯米饭 → 冬阴功汤 → 青旅认识旅伴' },
          { d: 'Day2', t: '恰图恰周末市场 → 泰式按摩 → 唐人街吃海鲜' },
          { d: 'Day3', t: '大皇宫 → 卧佛寺 → 湄南河游船 → 夜市' },
          { d: 'Day4', t: '安帕瓦水上市场 → 萤火虫夜游 → 返程' }
      ],
      safety: '曼谷 solo 友好，但注意防晒和补水。夜市看好手机，突突车砍价对半砍。',
      ai: { budget: '¥3,500-5,000/人（4天含机票）', transport: 'BTS+湄南河快船+突突车', hotel: '考山路/Sukhumvit青旅', bestTime: '11月-2月凉季',
        timeline: [
          { d: 'Day1 下午-晚上', t: '考山路夜市逛吃 → 芒果糯米饭+冬阴功汤 → 青旅认识旅伴' },
          { d: 'Day2 全天', t: '恰图恰周末市场（周末才开！）→ 泰式按摩200泰铢 → 唐人街吃海鲜' },
          { d: 'Day3 全天', t: '大皇宫 → 卧佛寺（躺佛）→ 湄南河游船 → 夜市继续吃' },
          { d: 'Day4 全天', t: '安帕瓦水上市场 → 萤火虫夜游 → 返程' }
        ],
        attractions: [
          { name: '大皇宫', desc: '曼谷地标，注意着装（长裤+遮肩）', price: '¥500泰铢', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/bangkok207/12600.html' },
          { name: '卧佛寺', desc: '46米长躺佛，泰式按摩发源地', price: '¥300泰铢', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80', ctripUrl: 'https://you.ctrip.com/sight/bangkok207/12601.html' },
          { name: '恰图恰周末市场', desc: '全球最大周末市场，15000个摊位', price: '免费', img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&q=80' }
        ],
        foods: [
          { name: '芒果糯米饭', desc: '泰国必吃！甜糯米+新鲜芒果+椰浆', price: '¥60泰铢', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
          { name: '冬阴功汤', desc: '酸辣虾汤，泰国国汤', price: '¥80泰铢', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80' },
          { name: '泰式奶茶', desc: '橙色奶茶，甜到上头但好喝', price: '¥40泰铢', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80' }
        ],
        hotels: [
          { name: '考山路青旅', desc: '背包客天堂，容易认识朋友', price: '¥80/床位', img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/bangkok207.html' },
          { name: 'Sukhumvit经济型酒店', desc: 'BTS旁，干净安全', price: '¥250', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', ctripUrl: 'https://hotels.ctrip.com/hotels/bangkok207.html' }
        ],
        tips: '路边摊认准本地人多的；肠胃药必带（辣+冰容易拉肚子）；曼谷堵车坐BTS；突突车砍价对半砍；大皇宫着装要求长裤+遮肩；恰图恰只在周末开！' }
    }
];

function renderSolo() {
    let html = '';
    soloData.forEach((s, i) => {
        const aiIdx = aiGuideStore.length;
        aiGuideStore.push({ dest: s.city, ai: s.ai });
        html += `<div class="solo-card"><div class="solo-card-img" style="background-image:url('${s.img || mylImgUrl(s.city,'sight')}')" onclick="toggleSoloRoute(${i})"></div><div class="solo-card-body"><h4 onclick="toggleSoloRoute(${i})">${s.city}</h4><p>${s.desc}</p><div class="solo-tags">${s.tags.map(t => `<span class="solo-tag">${t}</span>`).join('')}</div><div class="solo-route-detail" id="soloRoute${i}">${s.itinerary.map(day => `<div class="route-day" style="margin-bottom:8px"><span class="route-day-label">${day.d}</span> <span class="route-day-text">${day.t}</span></div>`).join('')}<div class="solo-safety"><strong>🛡️ Solo 安全提示</strong>${s.safety}</div><button class="ai-guide-btn" onclick="toggleAIGuide(this,'soloGuide${aiIdx}',${aiIdx})" style="margin-top:12px">✨ AI 生成详细路书</button><div class="ai-guide-panel" id="soloGuide${aiIdx}"></div></div><button class="btn btn-outline btn-sm" style="width:100%" onclick="toggleSoloRoute(${i})" id="soloToggle${i}">展开专属行程 ▾</button></div></div>`;
    });
    document.getElementById('soloGrid').innerHTML = html;
}
function toggleSoloRoute(i) {
    const detail = document.getElementById('soloRoute' + i);
    const btn = document.getElementById('soloToggle' + i);
    detail.classList.toggle('open');
    btn.textContent = detail.classList.contains('open') ? '收起行程 ▴' : '展开专属行程 ▾';
}

// ============================================================
//  最佳时节 —— 12个月 + 点击展开详细线路/美食/景点/交通
// ============================================================
const seasonData = [
    { month: '1月', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: '❄️', dests: [
        { emoji: '🏔️', name: '哈尔滨冰雪大世界', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=80', reason: '一年一度冰雪童话，冰雕世界2月前结束',
          itinerary: ['Day1: 中央大街 → 索菲亚教堂 → 松花江冰上活动','Day2: 冰雪大世界全天 → 兆麟公园冰灯','Day3: 太阳岛雪博会 → 东北虎林园 → 返程'],
          food: ['锅包肉','铁锅炖大鹅','红肠','马迭尔冰棍'],
          spots: ['冰雪大世界','中央大街','索菲亚教堂','太阳岛雪博会'],
          transport: '太平机场大巴/地铁，市区公交+打车',
          budget: '¥2,500-4,000/人（5天含住）' },
        { emoji: '🌴', name: '三亚避冬', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', reason: '全国唯一冬天还能穿短袖的地方',
          itinerary: ['Day1: 亚龙湾海滩 → 酒店度假','Day2: 蜈支洲岛一日游 → 潜水/摩托艇','Day3: 天涯海角 → 南山寺 → 第一市场吃海鲜','Day4: 海棠湾免税店 → 返程'],
          food: ['清补凉','椰子鸡','和乐蟹','抱罗粉'],
          spots: ['亚龙湾','蜈支洲岛','南山寺','天涯海角'],
          transport: '凤凰机场打车，市区公交+打车',
          budget: '¥3,000-5,000/人（5天含住）' },
        { emoji: '🇯🇵', name: '北海道滑雪', img: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=600&q=80', reason: '粉雪天堂，新千岁机场直达',
          itinerary: ['Day1: 札幌落地 → 薄野欢乐街 → 螃蟹宴','Day2: 二世古滑雪全天 → 温泉酒店','Day3: 小樽运河 → 白色恋人公园 → 札幌','Day4: 旭川动物园 → 返程'],
          food: ['螃蟹宴','成吉思汗烤羊肉','汤咖喱','白色恋人'],
          spots: ['二世古滑雪场','小樽运河','旭川动物园','札幌'],
          transport: '新千岁机场JR，北海道铁路周游券',
          budget: '¥8,000-12,000/人（含机票）' }
    ]},
    { month: '2月', color: 'linear-gradient(135deg,#f43f5e,#fb7185)', icon: '🏮', dests: [
        { emoji: '🌸', name: '云南罗平油菜花', img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80', reason: '中国最早的春天，80万亩花海',
          itinerary: ['Day1: 罗平县城 → 金鸡峰丛日落','Day2: 九龙瀑布群 → 螺丝田油菜花','Day3: 多依河风景区 → 返程'],
          food: ['五色花米饭','布依酸笋鱼','罗平烟熏肉'],
          spots: ['金鸡峰丛','九龙瀑布','螺丝田','多依河'],
          transport: '昆明大巴/高铁到罗平，县城打车',
          budget: '¥1,500-2,500/人（3天含住）' },
        { emoji: '🏮', name: '北京春节庙会', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80', reason: '地坛/厂甸庙会，老北京年味',
          itinerary: ['Day1: 地坛庙会 → 雍和宫祈福 → 南锣鼓巷','Day2: 故宫 → 景山公园 → 什刹海滑冰','Day3: 八达岭长城 → 返程'],
          food: ['北京烤鸭','涮羊肉','驴打滚','豌豆黄'],
          spots: ['地坛庙会','故宫','八达岭长城','什刹海'],
          transport: '地铁全覆盖，公交方便',
          budget: '¥2,500-4,000/人（5天含住）' },
        { emoji: '🇯🇵', name: '东京河津樱', img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80', reason: '2月底河津樱抢先开',
          itinerary: ['Day1: 东京 → 河津町 → 河畔樱并木散步','Day2: 下田海岸 → 城崎温泉 → 返东京','Day3: 浅草寺 → 秋叶原 → 返程'],
          food: ['寿司','拉面','天妇罗','抹茶甜品'],
          spots: ['河津樱并木','下田海岸','浅草寺'],
          transport: '东京JR东ikawa站到河津，巴士',
          budget: '¥6,000-9,000/人（含机票）' }
    ]},
    { month: '3月', color: 'linear-gradient(135deg,#ec4899,#f472b6)', icon: '🌸', dests: [
        { emoji: '🌸', name: '京都樱花', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', reason: '3月底满开，哲学之道/圆山公园',
          itinerary: ['Day1: 清水寺 → 二年坂三年坂 → 祇园花见小路','Day2: 金阁寺 → 龙安寺 → 哲学之道夜樱','Day3: 岚山竹林 → 天龙寺 → 渡月桥','Day4: 伏见稻荷 → 宇治平等院 → 返程'],
          food: ['怀石料理','抹茶甜品','汤豆腐','京风咖喱'],
          spots: ['清水寺','哲学之道','岚山','伏见稻荷'],
          transport: '关西机场Haruka+京都巴士一日券',
          budget: '¥6,000-9,000/人（含机票+JR Pass）' },
        { emoji: '🌺', name: '林芝桃花', img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&q=80', reason: '西藏江南，雪山下的桃花沟',
          itinerary: ['Day1: 拉萨 → 林芝 → 尼洋河风光','Day2: 索松村桃花 → 南迦巴瓦峰观景','Day3: 鲁朗林海 → 鲁朗石锅鸡 → 返程'],
          food: ['鲁朗石锅鸡','酥油茶','青稞酒','藏面'],
          spots: ['索松村','尼洋河','鲁朗林海','南迦巴瓦'],
          transport: '拉萨飞林芝（1小时），当地包车',
          budget: '¥4,000-6,000/人（5天含住）' },
        { emoji: '🌷', name: '无锡鼋头渚', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', reason: '中国最美樱花胜地，3月中满开',
          itinerary: ['Day1: 鼋头渚樱花谷全天 → 太湖仙岛','Day2: 灵山大佛 → 拈花湾小镇 → 返程'],
          food: ['无锡酱排骨','小笼包','清水油面筋','太湖三白'],
          spots: ['鼋头渚','灵山大佛','拈花湾'],
          transport: '上海高铁到无锡（30分钟），公交+打车',
          budget: '¥1,500-2,500/人（3天含住）' }
    ]},
    { month: '4月', color: 'linear-gradient(135deg,#10b981,#34d399)', icon: '🌿', dests: [
        { emoji: '⛰️', name: '新疆伊犁杏花沟', img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80', reason: '中世纪遗留野杏林，4月初最盛',
          itinerary: ['Day1: 伊宁集合 → 吐尔根杏花沟','Day2: 那拉提草原 → 新源县','Day3: 赛里木湖 → 果子沟大桥 → 返程'],
          food: ['手抓饭','烤包子','大盘鸡','马奶子'],
          spots: ['吐尔根杏花沟','那拉提','赛里木湖'],
          transport: '伊宁包车SUV，全程约800km',
          budget: '¥4,000-6,000/人（5天含住）' },
        { emoji: '🍃', name: '江南采茶', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80', reason: '杭州龙井/苏州碧螺春开采季',
          itinerary: ['Day1: 杭州龙井村采茶体验 → 西湖漫步','Day2: 九溪烟树徒步 → 梅家坞喝茶','Day3: 苏州东山碧螺春村 → 返程'],
          food: ['西湖醋鱼','龙井虾仁','碧螺春茶','松鼠桂鱼'],
          spots: ['龙井村','九溪烟树','东山碧螺春村'],
          transport: '杭州地铁+公交，苏州地铁',
          budget: '¥2,000-3,500/人（4天含住）' },
        { emoji: '🏯', name: '西安春游', img: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80', reason: '城墙骑行+大唐不夜城，不冷不热',
          itinerary: ['Day1: 兵马俑 → 华清宫 → 长恨歌演出','Day2: 西安城墙骑行 → 回民街 → 大唐不夜城','Day3: 陕西历史博物馆 → 大雁塔 → 返程'],
          food: ['肉夹馍','羊肉泡馍','biangbiang面','甑糕'],
          spots: ['兵马俑','西安城墙','大唐不夜城','陕博'],
          transport: '地铁+打车，景点集中',
          budget: '¥2,000-3,500/人（4天含住）' }
    ]},
    { month: '5月', color: 'linear-gradient(135deg,#f59e0b,#fbbf24)', icon: '☀️', dests: [
        { emoji: '🏞️', name: '稻城亚丁', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', reason: '积雪初融，牛奶海开始化冰',
          itinerary: ['Day1: 成都 → 新都桥 → 雅江','Day2: 香格里拉镇 → 亚丁景区 → 冲古寺','Day3: 牛奶海 → 五色海 → 洛绒牛场','Day4: 稻城 → 理塘 → 成都返程'],
          food: ['酥油茶','糌粑','牦牛肉火锅','青稞饼'],
          spots: ['牛奶海','五色海','洛绒牛场','新都桥'],
          transport: '成都包车SUV，全程约1500km',
          budget: '¥5,000-7,000/人（6天含住）' },
        { emoji: '🎒', name: '川西线开放', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', reason: '雨季前最后的窗口期',
          itinerary: ['Day1: 成都 → 四姑娘山','Day2: 丹巴藏寨 → 塔公草原','Day3: 新都桥 → 稻城亚丁','Day4: 亚丁景区 → 理塘','Day5: 康定 → 成都返程'],
          food: ['牦牛肉火锅','酥油茶','藏餐','成都火锅'],
          spots: ['四姑娘山','塔公草原','新都桥','亚丁'],
          transport: '成都包车SUV，5天约2000km',
          budget: '¥4,500-6,500/人（6天含住）' },
        { emoji: '🏖️', name: '厦门海边', img: 'images/cities/xiamen.jpg', reason: '避开暑期人潮，水温刚好',
          itinerary: ['Day1: 中山路 → 八市 → 沙坡尾','Day2: 鼓浪屿全天 → 日光岩日落','Day3: 曾厝垵 → 环岛路骑行 → 黄厝日出','Day4: 南普陀 → 厦大 → 返程'],
          food: ['沙茶面','海蛎煎','土笋冻','花生汤'],
          spots: ['鼓浪屿','环岛路','沙坡尾','南普陀'],
          transport: 'BRT+打车+鼓浪屿轮渡',
          budget: '¥2,000-3,500/人（4天含住）' }
    ]},
    { month: '6月', color: 'linear-gradient(135deg,#06b6d4,#22d3ee)', icon: '🌧️', dests: [
        { emoji: '🍄', name: '云南菌子季', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=80', reason: '雨季开始，松茸/鸡枞/见手青上市',
          itinerary: ['Day1: 昆明 → 木水花野生菌市场','Day2: 大理 → 大理古城 → 洱海边','Day3: 丽江 → 束河古镇 → 菌子火锅','Day4: 香格里拉 → 普达措 → 返程'],
          food: ['松茸炖鸡','见手青炒肉','鸡枞油','腊排骨火锅'],
          spots: ['木水花市场','大理古城','束河古镇','普达措'],
          transport: '昆明动车到大理，大理大巴到丽江',
          budget: '¥3,500-5,500/人（6天含住）' },
        { emoji: '🏔️', name: '青海湖油菜花', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '7月最盛但6月人少价低',
          itinerary: ['Day1: 西宁 → 塔尔寺 → 青海湖','Day2: 青海湖环湖骑行 → 茶卡镇','Day3: 茶卡盐湖 → 翡翠湖 → 返程'],
          food: ['手抓羊肉','青海老酸奶','糌粑','尕面片'],
          spots: ['青海湖','茶卡盐湖','翡翠湖','塔尔寺'],
          transport: '西宁包车SUV，3天约800km',
          budget: '¥2,500-4,000/人（4天含住）' },
        { emoji: '☔', name: '江南梅雨', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&q=80', reason: '雨中乌镇/西塘，人少如包场',
          itinerary: ['Day1: 乌镇西栅全天 → 夜景','Day2: 西塘古镇 → 烟雨长廊 → 返程'],
          food: ['乌镇酱鸭','定胜糕','钱塘人家酒','南湖蟹粉'],
          spots: ['乌镇西栅','西塘古镇'],
          transport: '上海大巴到乌镇（1.5小时）',
          budget: '¥1,200-2,000/人（2天含住）' }
    ]},
    { month: '7月', color: 'linear-gradient(135deg,#ef4444,#f87171)', icon: '🏕️', dests: [
        { emoji: '🌻', name: '青海湖环湖', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '油菜花+蓝湖+雪山，中国最美夏天',
          itinerary: ['Day1: 西宁 → 塔尔寺 → 青海湖','Day2: 青海湖日出 → 茶卡盐湖 → 德令哈','Day3: 翡翠湖 → 水上雅丹 → 大柴旦','Day4: 祁连大草原 → 门源油菜花 → 返西宁'],
          food: ['手抓羊肉','青海老酸奶','牦牛肉串','青稞酒'],
          spots: ['青海湖','茶卡盐湖','翡翠湖','门源油菜花'],
          transport: '西宁包车SUV，4天约1500km',
          budget: '¥3,500-5,000/人（5天含住）' },
        { emoji: '🏔️', name: '甘南草原', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '扎尕那/郎木寺，避暑天堂',
          itinerary: ['Day1: 兰州 → 拉卜楞寺 → 夏河','Day2: 桑科草原 → 郎木寺','Day3: 扎尕那徒步 → 花湖','Day4: 若尔盖 → 返兰州'],
          food: ['藏包','手抓羊肉','酥油茶','牦牛酸奶'],
          spots: ['拉卜楞寺','郎木寺','扎尕那','花湖'],
          transport: '兰州包车SUV，4天约1200km',
          budget: '¥3,000-4,500/人（5天含住）' },
        { emoji: '🌊', name: '威海/青岛', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', reason: '北方海滨，25度的夏天',
          itinerary: ['Day1: 青岛八大关 → 栈桥 → 啤酒博物馆','Day2: 崂山一日游 → 台东夜市','Day3: 威海刘公岛 → 国际海水浴场','Day4: 成山头看日出 → 返程'],
          food: ['青岛啤酒','海鲜大咖','鲅鱼水饺','威海大馅饺子'],
          spots: ['八大关','崂山','刘公岛','成山头'],
          transport: '高铁+公交+打车',
          budget: '¥2,500-4,000/人（5天含住）' }
    ]},
    { month: '8月', color: 'linear-gradient(135deg,#f97316,#fb923c)', icon: '🌊', dests: [
        { emoji: '🏄', name: '巴厘岛旱季末', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', reason: '旱季末尾雨水少，冲浪最佳',
          itinerary: ['Day1: 库塔海滩 → 冲浪课 → 日落','Day2: 乌布梯田 → 猴林 → 皇宫','Day3: 蓝梦岛浮潜 → 恶魔的眼泪','Day4: 水明漾咖啡馆 → 海滩俱乐部','Day5: 金巴兰海滩日落晚餐 → 返程'],
          food: ['脏鸭餐','沙嗲肉串','椰浆饭','烤乳猪'],
          spots: ['库塔海滩','乌布梯田','蓝梦岛','水明漾'],
          transport: '机场接机+Grab打车',
          budget: '¥4,500-7,000/人（含机票）' },
        { emoji: '🏔️', name: '西藏', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', reason: '含氧量最高的季节，适合第一次去',
          itinerary: ['Day1: 拉萨落地 → 布达拉宫广场','Day2: 布达拉宫 → 大昭寺 → 八廓街','Day3: 羊卓雍措 → 卡若拉冰川 → 江孜','Day4: 纳木错 → 返程'],
          food: ['藏面','酥油茶','甜茶','牦牛肉火锅'],
          spots: ['布达拉宫','大昭寺','羊卓雍措','纳木错'],
          transport: '拉萨包车，机场大巴',
          budget: '¥5,000-8,000/人（7天含住）' },
        { emoji: '🌾', name: '呼伦贝尔大草原', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '草最绿的时候，7-8月最佳',
          itinerary: ['Day1: 海拉尔 → 莫日格勒河 → 金帐汗部落','Day2: 额尔古纳 → 白桦林 → 恩和俄罗斯族乡','Day3: 室韦 → 九卡七卡边境公路 → 黑山头骑马','Day4: 满洲里 → 国门景区 → 返程'],
          food: ['烤全羊','手把肉','俄式列巴','奶茶'],
          spots: ['莫日格勒河','白桦林','室韦','黑山头','满洲里'],
          transport: '海拉尔包车SUV，4天约1000km',
          budget: '¥3,500-5,500/人（5天含住）' }
    ]},
    { month: '9月', color: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', icon: '🍂', dests: [
        { emoji: '🍁', name: '北疆喀纳斯', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', reason: '9月中金秋，中国最美秋天',
          itinerary: ['Day1: 乌鲁木齐 → 布尔津','Day2: 喀纳斯湖 → 观鱼台 → 三湾徒步','Day3: 禾木村晨雾 → 图瓦人家访','Day4: 白哈巴村 → 五彩滩日落 → 返程'],
          food: ['大盘鸡','烤羊肉串','手抓饭','馕'],
          spots: ['喀纳斯湖','禾木村','白哈巴','五彩滩'],
          transport: '乌鲁木齐包车SUV，4天约1200km',
          budget: '¥5,000-8,000/人（6天含住）' },
        { emoji: '🍇', name: '新疆吐鲁番', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80', reason: '葡萄成熟季，避开7月酷暑',
          itinerary: ['Day1: 乌鲁木齐 → 葡萄沟 → 坎儿井','Day2: 火焰山 → 交河故城 → 苏公塔','Day3: 库木塔格沙漠 → 返程'],
          food: ['烤全羊','抓饭','葡萄','馕坑肉'],
          spots: ['葡萄沟','火焰山','交河故城','库木塔格'],
          transport: '乌鲁木齐动车到吐鲁番（1小时）',
          budget: '¥1,500-2,500/人（3天含住）' },
        { emoji: '🏔️', name: '牛背山/四姑娘山', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', reason: '雨季结束，看到云海概率最高',
          itinerary: ['Day1: 成都 → 雅安 → 牛背山星云帐篷','Day2: 牛背山日出云海 → 下山','Day3: 四姑娘山双桥沟 → 返程'],
          food: ['雅安雅鱼','藏式火锅','牦牛肉串','酥油茶'],
          spots: ['牛背山','四姑娘山双桥沟'],
          transport: '成都包车SUV，3天约600km',
          budget: '¥2,500-4,000/人（4天含住）' }
    ]},
    { month: '10月', color: 'linear-gradient(135deg,#dc2626,#ef4444)', icon: '🎑', dests: [
        { emoji: '🍁', name: '九寨沟', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '10月中秋叶最彩，水最蓝',
          itinerary: ['Day1: 成都 → 九寨沟口','Day2: 九寨沟全天：树正沟→日则沟→则查洼沟','Day3: 黄龙景区 → 返程'],
          food: ['藏式火锅','牦牛肉','青稞饼','酥油茶'],
          spots: ['九寨沟','黄龙','树正群海','五花海'],
          transport: '成都飞九寨（1小时）或大巴（8小时）',
          budget: '¥3,500-5,500/人（5天含住）' },
        { emoji: '🏯', name: '额济纳胡杨林', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '一年只黄20天，10月初最佳',
          itinerary: ['Day1: 银川 → 额济纳旗','Day2: 胡杨林一道桥→八道桥全天','Day3: 黑城遗址 → 怪树林日落','Day4: 居延海日出 → 返程'],
          food: ['手抓羊肉','居廷蜜瓜','骆驼肉','奶酪'],
          spots: ['胡杨林','黑城','怪树林','居延海'],
          transport: '银川包车SUV，4天约1500km',
          budget: '¥4,000-6,000/人（5天含住）' },
        { emoji: '🌾', name: '皖南秋色', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '塔川/宏村/篁岭晒秋',
          itinerary: ['Day1: 黄山北站 → 宏村','Day2: 塔川秋色 → 木坑竹海 → 西递','Day3: 篁岭晒秋 → 返程'],
          food: ['臭鳜鱼','毛豆腐','黄山烧饼','石耳炖鸡'],
          spots: ['宏村','塔川','篁岭','西递'],
          transport: '黄山北站大巴到宏村（1小时）',
          budget: '¥2,000-3,500/人（4天含住）' }
    ]},
    { month: '11月', color: 'linear-gradient(135deg,#78716c,#a8a29e)', icon: '🍁', dests: [
        { emoji: '⛩️', name: '京都红叶', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80', reason: '11月底红叶满开，比樱花人少',
          itinerary: ['Day1: 清水寺 → 二年坂三年坂 → 祇园','Day2: 金阁寺 → 龙安寺 → 妙心寺','Day3: 岚山红叶 → 天龙寺 → 渡月桥','Day4: 哲学之道 → 南禅寺 → 返程'],
          food: ['怀石料理','汤豆腐','抹茶甜品','京风渍物'],
          spots: ['清水寺','金阁寺','岚山','哲学之道'],
          transport: '关西机场Haruka+京都巴士一日券',
          budget: '¥6,000-9,000/人（含机票+JR Pass）' },
        { emoji: '🦢', name: '鄱阳湖/盐城丹顶鹤', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80', reason: '候鸟迁徙季，观鸟胜地',
          itinerary: ['Day1: 南昌 → 鄱阳湖湿地公园','Day2: 吴城古镇观鸟 → 返程'],
          food: ['鄱阳湖大闸蟹','粉蒸肉','瓦罐汤','拌粉'],
          spots: ['鄱阳湖湿地公园','吴城古镇'],
          transport: '南昌大巴到吴城（2小时）',
          budget: '¥1,000-1,800/人（2天含住）' },
        { emoji: '🌴', name: '泰国凉季开始', img: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80', reason: '11月泰国降温，旅游最佳季',
          itinerary: ['Day1: 曼谷 → 大皇宫 → 卧佛寺','Day2: 清迈 → 古城 → 周日夜市','Day3: 素贴山双龙寺 → 宁曼路','Day4: 大象保护营 → 返程'],
          food: ['冬阴功','芒果糯米饭','泰式奶茶','船面'],
          spots: ['大皇宫','清迈古城','素贴山','宁曼路'],
          transport: '曼谷飞清迈（1.5小时）',
          budget: '¥3,500-5,000/人（含机票）' }
    ]},
    { month: '12月', color: 'linear-gradient(135deg,#1e40af,#3b82f6)', icon: '🎄', dests: [
        { emoji: '🌌', name: '冰岛极光', img: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80', reason: '极夜开始，极光概率最高',
          itinerary: ['Day1: 雷克雅未克 → 蓝湖温泉','Day2: 黄金圈 → 间歇泉 → 黄金瀑布','Day3: 南岸瀑布 → 黑沙滩 → 追极光','Day4: 冰河湖 → 钻石沙滩 → 追极光','Day5: 返雷克雅未克 → 返程'],
          food: ['冰岛龙虾汤','羊肉汤','热狗','Skyr酸奶'],
          spots: ['蓝湖温泉','黄金圈','黑沙滩','冰河湖'],
          transport: '雷克雅未克租车自驾',
          budget: '¥18,000-25,000/人（含机票+租车）' },
        { emoji: '🎿', name: '东北雪乡', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600&q=80', reason: '12月雪最厚，雪蘑菇成型',
          itinerary: ['Day1: 哈尔滨 → 雪乡','Day2: 雪乡全天 → 雪韵大街 → 棒槌山观景','Day3: 雪乡 → 亚布力滑雪 → 哈尔滨返程'],
          food: ['铁锅炖','杀猪菜','冻梨冻柿子','马迭尔冰棍'],
          spots: ['雪乡雪韵大街','棒槌山','亚布力滑雪场'],
          transport: '哈尔滨大巴到雪乡（5小时）',
          budget: '¥2,500-4,000/人（4天含住）' },
        { emoji: '🌅', name: '澳大利亚/新西兰', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', reason: '我们的冬天是他们的夏天',
          itinerary: ['Day1: 悉尼 → 歌剧院 → 海港大桥','Day2: 蓝山国家公园 → 三姐妹峰','Day3: 邦迪海滩 → 皇家植物园','Day4: 墨尔本 → 大洋路一日游','Day5: 返程'],
          food: ['澳洲龙虾','和牛',' Meat Pie','Flat White咖啡'],
          spots: ['悉尼歌剧院','蓝山','邦迪海滩','大洋路'],
          transport: '悉尼/墨尔本城市内火车+公交',
          budget: '¥15,000-20,000/人（含机票）' }
    ]}
];

function renderSeason() {
    let html = '';
    seasonData.forEach((s, mi) => {
        html += `<div class="season-card"><div class="season-card-header" style="background:${s.color}"><span>${s.icon} ${s.month}</span><span style="font-size:.8rem;opacity:.8">最佳出行月</span></div><div class="season-card-body">`;
        s.dests.forEach((d, di) => {
            const aiIdx = aiGuideStore.length;
            aiGuideStore.push({ dest: d.name, city: d.name, ai: {
                budget: d.budget,
                bestTime: s.month + ' 最佳出行月',
                transport: d.transport,
                hotel: '建议住在景区或市区交通枢纽附近，节假日提前预订',
                timeline: d.itinerary.map((t, dayIdx) => ({
                    d: 'Day' + (dayIdx + 1),
                    t: String(t).replace(/^Day\d+\s*[:：]\s*/, '')
                })),
                attractions: d.spots.map(n => ({ name: n, desc: '热门打卡点，建议预留 1–3 小时', price: '' })),
                foods: d.food.map(n => ({ name: n, desc: '当地人气美食，就近选本地人常去的小店', price: '' })),
                tips: d.reason + '。门票、开放时间与预约要求以景区当日公告为准。'
            } });
            html += `<div class="season-dest" id="seasonDest-${mi}-${di}" onclick="toggleSeasonDest(${mi},${di})"><div class="season-dest-header"><div class="season-dest-img" style="background-image:url('${d.img || mylImgUrl(d.name,'sight')}')"></div><div class="season-dest-info"><h5>${d.name}</h5><p>${d.reason}</p></div><i class="fas fa-chevron-down season-dest-arrow"></i></div><div class="season-dest-detail"><div class="season-detail-section"><div class="season-detail-label"><i class="fas fa-map"></i> 详细线路</div>${d.itinerary.map(day => `<div class="season-detail-text" style="margin-bottom:6px">📅 ${day}</div>`).join('')}</div><div class="season-detail-section"><div class="season-detail-label"><i class="fas fa-utensils"></i> 必吃美食</div><div class="season-detail-food">${d.food.map(f => `<span class="food-tag">${f}</span>`).join('')}</div></div><div class="season-detail-section"><div class="season-detail-label"><i class="fas fa-camera"></i> 主要景点</div><div class="season-detail-text">${d.spots.join(' · ')}</div></div><div class="season-detail-section"><div class="season-detail-label"><i class="fas fa-car"></i> 交通建议</div><div class="season-detail-text">${d.transport}</div></div><div class="season-detail-section"><div class="season-detail-label"><i class="fas fa-yen-sign"></i> 预估预算</div><div class="season-detail-text" style="font-weight:700;color:var(--primary)">${d.budget}</div></div><button class="ai-guide-btn" onclick="event.stopPropagation();toggleAIGuide(this,'seasonGuide${aiIdx}',${aiIdx})">✨ AI 生成详细路书</button><div class="ai-guide-panel" id="seasonGuide${aiIdx}" onclick="event.stopPropagation()"></div></div></div>`;
        });
        html += `</div></div>`;
    });
    document.getElementById('seasonGrid').innerHTML = html;
}

function toggleSeasonDest(mi, di) {
    const el = document.getElementById('seasonDest-' + mi + '-' + di);
    el.classList.toggle('open');
}

// ============================================================
//  预算测算器
// ============================================================
const budgetData = {
    domestic: { flight: 1500, ticket: 800, food: 150, transport: 100, label: '国内长线' },
    domestic_short: { flight: 800, ticket: 400, food: 120, transport: 60, label: '国内短线' },
    sea: { flight: 2000, ticket: 600, food: 150, transport: 100, label: '海岛游' },
    jp: { flight: 2500, ticket: 800, food: 200, transport: 80, label: '日本/韩国' },
    eu: { flight: 5000, ticket: 1000, food: 300, transport: 150, label: '欧洲长线' },
    seaasia: { flight: 1500, ticket: 500, food: 100, transport: 60, label: '东南亚' }
};

function calcBudget() {
    const dest = document.getElementById('budgDest').value;
    const days = parseInt(document.getElementById('budgDays').value);
    const ppl = document.getElementById('budgPpl').value;
    const hotel = document.getElementById('budgHotel').value;
    const b = budgetData[dest];
    const hotelPerNight = hotel === 'budget' ? 200 : hotel === 'comfort' ? 400 : 800;
    const nights = days - 1;
    const flight = b.flight;
    const hotelTotal = hotelPerNight * nights;
    const food = b.food * days;
    const ticket = b.ticket;
    const transport = b.transport * days;
    const total = flight + hotelTotal + food + ticket + transport;
    const pplMult = ppl === '1' ? 1 : ppl === '2' ? 1.1 : 1.15;
    const perPerson = Math.round(total * pplMult);
    document.getElementById('budgetBreakdown').innerHTML = `<div class="budget-item"><div class="label">✈️ 往返机票</div><div class="value">¥${flight}</div></div><div class="budget-item"><div class="label">🏨 住宿（${nights}晚）</div><div class="value">¥${hotelTotal}</div></div><div class="budget-item"><div class="label">🍜 餐饮（${days}天）</div><div class="value">¥${food}</div></div><div class="budget-item"><div class="label">🎫 门票/活动</div><div class="value">¥${ticket}</div></div><div class="budget-item"><div class="label">🚗 当地交通</div><div class="value">¥${transport}</div></div><div class="budget-item"><div class="label">👥 人数系数</div><div class="value">${pplMult}x</div></div>`;
    document.getElementById('budgetTotal').textContent = '¥' + perPerson.toLocaleString();
    document.getElementById('budgetResult').classList.add('open');
}

// ============================================================
//  旅行穿搭指南 —— 按目的地类型推荐穿搭，拍照出片
// ============================================================
const outfitData = [
    { type: '🏔️ 雪山/高原', img: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=400&q=80',
      tips: ['冲锋衣+抓绒内胆（防风防水）', '登山鞋（防滑）', '墨镜+防晒霜（紫外线极强）', '红色/白色围巾拍照出片', '帽子+手套（高海拔很冷）'],
      colors: ['🧥 红色/白色', '👖 卡其/黑色', '👟 棕色登山鞋'] },
    { type: '🌊 海边/海岛', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      tips: ['白色/米色连衣裙（沙滩出片）', '草帽+墨镜（防晒+拍照）', '平底凉鞋（沙滩走路）', '防晒衣（海边紫外线强）', '泳衣+外搭罩衫'],
      colors: ['👗 白色/米色/碎花', '👒 草编帽', '👡 棕色凉鞋'] },
    { type: '🏯 古城/古镇', img: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400&q=80',
      tips: ['棉麻质地（透气+拍照有质感）', '新中式/汉服元素', '布鞋/马丁靴（走路舒适）', '帆布包/编织包', '素色为主，避免大logo'],
      colors: ['👘 麻色/藏蓝/墨绿', '👢 棕色马丁靴', '👜 帆布包'] },
    { type: '🌆 城市/都市', img: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
      tips: ['简约基础款（黑白灰）', '一双好走的鞋（城市走很多路）', '斜挎包（解放双手）', '薄外套（商场/地铁空调冷）', '精致配饰提升质感'],
      colors: ['🧥 黑/白/灰', '👟 小白鞋', '👜 小黑包'] },
    { type: '🍂 秋天/红叶', img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80',
      tips: ['焦糖色/大地色系（和红叶呼应）', '针织毛衣+风衣', '短靴（秋天穿刚好）', '贝雷帽/围巾（氛围感）', '胶片感滤镜'],
      colors: ['🧥 焦糖/驼色/燕麦色', '👢 棕色短靴', '🧣 格纹围巾'] },
    { type: '🌧️ 江南/雨天', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&q=80',
      tips: ['素色棉麻（雨天拍照有氛围感）', '透明伞（拍照不挡脸）', '防水鞋/雨靴', '暖色调内搭（阴天地暖）', '咖啡馆拍室内照'],
      colors: ['🧥 米白/浅灰', '☂️ 透明伞', '👢 黑色雨靴'] }
];

function renderOutfit() {
    let html = '';
    outfitData.forEach((o, i) => {
        html += `<div class="outfit-card">
            <div class="outfit-img" style="background-image:url('${o.img || mylImgUrl(o.type,'sight')}')">
                <span class="outfit-type">${o.type}</span>
            </div>
            <div class="outfit-body">
                <div class="outfit-tips">${o.tips.map(t => `<div style="font-size:.82rem;margin-bottom:4px">✓ ${t}</div>`).join('')}</div>
                <div class="outfit-colors" style="margin-top:10px;padding-top:10px;border-top:1px dashed #e2e8f0">
                    <div style="font-size:.75rem;font-weight:700;color:var(--purple-dark);margin-bottom:6px">🎨 推荐配色</div>
                    <div style="font-size:.8rem">${o.colors.join(' · ')}</div>
                </div>
            </div>
        </div>`;
    });
    document.getElementById('outfitGrid').innerHTML = html;
}

// 初始化
renderDrama();
renderSolo();
renderSeason();
renderOutfit();

// ============================================================
//  新项目1：旅行后遗症测试
// ============================================================
const aftermathQuestions = [
    { q: '你走在办公室/教室里，突然觉得自己应该在哪里？', options: [
        { text: '🏔️ 在雪山脚下，而不是在工位上', score: 3 },
        { text: '🍜 在路边摊吃当地小吃', score: 2 },
        { text: '🛏️ 在床上躺着', score: 0 },
        { text: '🤷 没感觉，我早就回来了', score: -1 }
    ]},
    { q: '你最近刷手机最多在看什么？', options: [
        { text: '✈️ 机票/酒店价格，想买票再走', score: 3 },
        { text: '📷 旅行博主的攻略视频', score: 2 },
        { text: '🛒 淘宝拼多多，买日常用品', score: 0 },
        { text: '📱 短视频，没特定内容', score: 1 }
    ]},
    { q: '你听到哪种声音会突然恍惚？', options: [
        { text: '🚞 电车/火车报站声', score: 3 },
        { text: '🌊 海浪声/风声', score: 2 },
        { text: '🍜 食物滋滋的声音', score: 1 },
        { text: '🤷 没有特别的声音', score: 0 }
    ]},
    { q: '你最近的购物车最多的是？', options: [
        { text: '🧥 旅行装备（冲锋衣/背包/鞋子）', score: 3 },
        { text: '📚 关于那个地方的书/纪录片', score: 2 },
        { text: '🛍️ 衣服化妆品，日常用品', score: 0 },
        { text: '🤷 没买什么', score: 0 }
    ]},
    { q: '你和朋友聊天最多在聊什么？', options: [
        { text: '🗺️ "下次我们去哪里"', score: 3 },
        { text: '📸 "你看我上次拍的那张照片"', score: 2 },
        { text: '💼 工作/学习/感情', score: 0 },
        { text: '🎮 游戏/综艺/明星', score: 1 }
    ]},
    { q: '你看到日历上的周末，第一反应是？', options: [
        { text: '🚗 "要不周末去周边走走？"', score: 3 },
        { text: '😴 "终于可以躺两天了"', score: 1 },
        { text: '📝 "还有好多事要做"', score: 0 },
        { text: '🤷 没特别感觉', score: 0 }
    ]},
    { q: '你最近一次哭/情绪波动是因为？', options: [
        { text: '🎬 看到旅行相关的电影/视频', score: 3 },
        { text: '💼 工作/学习压力大', score: 1 },
        { text: '🎵 听到一首歌', score: 2 },
        { text: '🤷 没什么情绪波动', score: 0 }
    ]},
    { q: '你觉得自己现在的状态像什么？', options: [
        { text: '🦋 心已经飞走了，身体还在这', score: 3 },
        { text: '🐌 慢慢恢复中', score: 2 },
        { text: '🐻 正常生活状态', score: 0 },
        { text: '🤷 不知道', score: 1 }
    ]}
];

let aftermathAnswers = [];
function startAftermath() {
    aftermathAnswers = [];
    document.getElementById('aftermathStart').style.display = 'none';
    document.getElementById('aftermathPlaying').style.display = 'block';
    showAftermathQuestion(0);
}
function showAftermathQuestion(idx) {
    const q = aftermathQuestions[idx];
    document.getElementById('aftermathProgress').style.width = ((idx) / aftermathQuestions.length * 100) + '%';
    document.getElementById('aftermathQuestion').textContent = q.q;
    const optsHtml = q.options.map((o, i) => `<div class="quiz-option" onclick="answerAftermath(${idx}, ${o.score})">${o.text}</div>`).join('');
    document.getElementById('aftermathOptions').innerHTML = optsHtml;
}
function answerAftermath(idx, score) {
    aftermathAnswers[idx] = score;
    if (idx < aftermathQuestions.length - 1) {
        showAftermathQuestion(idx + 1);
    } else {
        showAftermathResult();
    }
}
function showAftermathResult() {
    document.getElementById('aftermathPlaying').style.display = 'none';
    document.getElementById('aftermathResult').style.display = 'block';
    const total = aftermathAnswers.reduce((a, b) => a + (b || 0), 0);
    const maxScore = aftermathQuestions.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0);
    const percent = Math.min(100, Math.round(total / maxScore * 100));
    let emoji, title, desc, reco;
    if (percent >= 70) {
        emoji = '🦋'; title = '重度旅行后遗症';
        desc = '你的身体已经回到了日常，但你的灵魂还在远方。你走在路上会突然恍惚，看到机票就想买，朋友聊天三句不离旅行。这不是病，这是旅行上瘾的表现。';
        reco = { place: '敦煌', reason: '你需要一次真正的"荒野治愈"，在戈壁与石窟前把灵魂找回来' };
    } else if (percent >= 40) {
        emoji = '🐌'; title = '中度旅行后遗症';
        desc = '你已经开始恢复日常了，但旅行的余韵还在。你会偶尔刷到那个地方的视频就停下来，会和朋友翻出上次的照片看半天。这是正常的，慢慢就好了。';
        reco = { place: '大理', reason: '你需要一次慢节奏的短途旅行，把状态调回来' };
    } else if (percent >= 15) {
        emoji = '🐻'; title = '轻度旅行后遗症';
        desc = '你已经基本回到日常了，旅行对你来说就是一段美好的回忆。偶尔想起来会笑一笑，但不会影响生活。这是最好的状态——既热爱旅行，也热爱生活。';
        reco = { place: '成都', reason: '你适合一次美食之旅，用味觉唤醒旅行的快乐' };
    } else {
        emoji = '🤖'; title = '无旅行后遗症';
        desc = '你是一个非常理性的人，旅行对你来说就是换个地方睡觉吃饭。回来就回来，不会有任何情绪波动。你可能需要一次真正打动你的旅行。';
        reco = { place: '西安', reason: '你需要一次震撼到失语的旅行，重新唤醒对世界的好奇' };
    }
    document.getElementById('aftermathResult').innerHTML = `
        <div class="aftermath-result">
            <img class="result-banner" src="${typeof mylImgUrl === 'function' ? mylImgUrl('旅行归来整理照片与纪念品，午后阳光', 'sight') : 'images/city-fallback.jpg'}" alt="旅行后遗症" loading="lazy" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />
            <div class="aftermath-emoji">${emoji}</div>
            <div class="aftermath-title">${title}</div>
            <div class="aftermath-score">余韵指数：${percent}%</div>
            <div class="aftermath-desc">${desc}</div>
            <div class="aftermath-reco">
                <h4>✨ MYL 建议你的下一站</h4>
                <div style="font-size:.95rem"><strong>${reco.place}</strong> — ${reco.reason}</div>
                <div style="margin-top:12px"><a href="index.html#planner" class="btn btn-sm">让 MYL 帮你规划 →</a></div>
            </div>
            <div id="aftermathRoutes"></div>
            <div style="margin-top:20px">
                <button class="btn btn-outline btn-sm" onclick="startAftermath()">重新测试</button>
            </div>
        </div>
    `;
    try { renderPersonaRoutes('aftermath', title, 'aftermathRoutes'); } catch (e) { console.error(e); }
}

// ============================================================
//  新项目2：城市隐藏玩法生成器
// ============================================================
const hiddenCities = {
    '成都': [
        { name: '奎星楼街的深夜串串', desc: '不是游客去的宽窄巷子，是本地人晚上排队的串串店。坐吧台一个人也友好。', tip: '晚上9点后去，不用排队' },
        { name: '玉林路的小酒馆后门', desc: '赵雷唱的那家小酒馆，正门排队2小时，后门进去不用等。', tip: '从玉林西路绕到后街' },
        { name: '望江楼公园的竹林', desc: '不是锦里那种人挤人的地方，是成都本地人喝茶打麻将的公园。', tip: '带杯盖碗茶坐一下午' },
        { name: '建设巷小吃街', desc: '电子科大旁边的小吃街，5块钱一份锅巴土豆，学生价。', tip: '中午去，晚上人太多' },
        { name: '东郊记忆的旧工厂', desc: '不是网红打卡地，是真正的旧工厂改造，有独立书店和小剧场。', tip: '周末有免费演出' },
        { name: '浣花溪公园的杜甫草堂后门', desc: '正门门票90，后门免费进，风景一样好。', tip: '从青羊宫旁边的小路进' }
    ],
    '厦门': [
        { name: '八市的海鲜加工', desc: '不是曾厝垵那种游客街，是厦门本地人买菜的海鲜市场。买完找加工店。', tip: '注意称重，问清楚加工费' },
        { name: '沙坡尾艺术西区的下午', desc: '不是鼓浪屿，是老渔港改造的艺术区，有独立咖啡馆和画廊。', tip: '下午3点去，光线最好' },
        { name: '黄厝海滩的日出', desc: '不是曾厝垵的海滩，是厦门本地人看日出的地方，早上没人。', tip: '5点半到，带件外套' },
        { name: '南普陀寺的素饼', desc: '不是游客买的那种，是寺里自己做的，只有周末有。', tip: '中午11点去，刚出炉' },
        { name: '集美学村的龙舟池', desc: '不是厦大，是陈嘉庚建的学村，建筑很有特色，人少。', tip: '坐BRT到嘉庚体育馆' },
        { name: '溪岸路的花鸟市场', desc: '老厦门的花鸟市场，旁边有很多老咖啡馆。', tip: '周末去，有花市' }
    ],
    '重庆': [
        { name: '李子坝轻轨站的观景台', desc: '不是站在马路对面拍，是专门修的观景台，角度最好。', tip: '下午4点去，光线好' },
        { name: '山城步道的老巷子', desc: '不是洪崖洞，是重庆本地人走的老巷子，有老火锅。', tip: '从中兴路进去，慢慢走' },
        { name: '黄桷坪涂鸦街', desc: '不是磁器口，是整条街都画满涂鸦的艺术街，有交通茶馆。', tip: '交通茶馆10块钱一碗茶' },
        { name: '南山一棵树的夜景', desc: '不是洪崖洞看夜景，是在南山上看整个重庆。', tip: '晚上8点去，灯全亮了' },
        { name: '解放碑的八一路好吃街', desc: '不是游客去的火锅店，是本地人吃小吃的街。', tip: '好又来酸辣粉必点' },
        { name: '磁器口的后门', desc: '正门人挤人，从后门进，人少还有老茶馆。', tip: '从金碧正街进' }
    ],
    '大理': [
        { name: '喜洲古镇的早市', desc: '不是大理古城，是喜洲的白族早市，5块钱一份稀豆粉。', tip: '早上8点去，最新鲜' },
        { name: '环海西路的骑行', desc: '不是环海东路，是环海西路，人少风景好，有稻田。', tip: '租电动车，半天够了' },
        { name: '周城的扎染体验', desc: '不是古城里的纪念品店，是白族村子里真正的扎染坊。', tip: '找张仕绅家，非遗传承人' },
        { name: '巍山古城的饵丝', desc: '不是大理古城，是巍山的古城，人少，饵丝超好吃。', tip: '下关坐车1小时到' },
        { name: '才村码头的日落', desc: '不是双廊，是才村，看日落最好的地方，人少。', tip: '晚上6点去' },
        { name: '床单厂艺术区', desc: '旧床单厂改造的艺术区，有独立书店和小剧场。', tip: '周末有市集' }
    ],
    '镰仓': [
        { name: '镰仓高校前站的清晨', desc: '不是中午去打卡，是早上7点去，没人，随便拍。', tip: '7点到，8点后人就多了' },
        { name: '江之岛的黄昏', desc: '不是白天去，是黄昏去，看日落超美。', tip: '坐江之电到江之岛站' },
        { name: '小町通商店街的小吃', desc: '不是游客街，是本地人买东西的商店街，有现烤仙贝。', tip: '中午去，刚出炉' },
        { name: '鹤冈八幡宫的红叶', desc: '不是春天去，是11月红叶季，超美。', tip: '11月下旬最佳' },
        { name: '镰仓大佛的后门', desc: '正门门票300日元，后门可以绕到后面看大佛。', tip: '从寺院后面的小路进' },
        { name: '湘南海岸的骑行', desc: '不是坐电车，是租自行车骑，沿海公路超爽。', tip: '在镰仓站租自行车' }
    ],
    '北京': [
        { name: '国子监街的下午', desc: '不是南锣鼓巷，是国子监街，人少，有老咖啡馆。', tip: '下午2点去，光线好' },
        { name: '杨梅竹斜街的书店', desc: '不是南锣鼓巷，是杨梅竹斜街，有独立书店和手作店。', tip: '模范书局必去' },
        { name: '景山公园的日落', desc: '不是故宫，是景山公园，5块钱门票看整个故宫。', tip: '下午4点半去' },
        { name: '牛街的清真小吃', desc: '不是王府井，是牛街，本地人吃的清真小吃。', tip: '聚宝源涮肉必吃' },
        { name: '798的周末市集', desc: '不是工作日去，是周末去，有市集和演出。', tip: '周六下午去' },
        { name: '什刹海的后海酒吧街后门', desc: '不是正门的酒吧街，是后海的胡同里，有安静的小酒馆。', tip: '从烟袋斜街绕进去' }
    ]
};

// 扩展更多著名城市（隐藏玩法）
Object.assign(hiddenCities, {
    '西安': [
        { name: '大皮院的小巷', desc: '不是回民街主街，是大皮院，本地人吃泡馍的地方。', tip: '晚上7点去，人少' },
        { name: '湘子庙街的咖啡馆', desc: '城墙根下的老街，有独立咖啡馆和旧书店。', tip: '下午去，光线好' },
        { name: '书院门的旧书摊', desc: '碑林旁边的老街，有旧书、毛笔和拓片。', tip: '周末摊子最多' },
        { name: '半坡国际艺术区', desc: '旧纺织厂改造，有展览和小剧场。', tip: '周六下午有市集' },
        { name: '骡马市夜市', desc: '本地年轻人吃的夜市，不是游客街。', tip: '晚上9点后最热闹' },
        { name: '兴庆宫公园的清晨', desc: '本地人打太极、唱秦腔的公园，免费。', tip: '早上6点半去' }
    ],
    '杭州': [
        { name: '馒头山社区', desc: '老杭州的生活区，有菜市场和苍蝇馆子。', tip: '早上8点去吃早点' },
        { name: '茅家埠', desc: '不是西湖边，是西湖上游的村子，人少水清。', tip: '坐公交到茅家埠站' },
        { name: '小河直街', desc: '运河边的老街区，有咖啡馆和手作店。', tip: '傍晚去，灯亮起来' },
        { name: '中国美院象山校区', desc: '王澍设计的校园，建筑本身就是展品。', tip: '工作日可进，带身份证' },
        { name: '大马弄的早餐', desc: '本地人排队的早餐街，葱包桧5块。', tip: '早上7点去' },
        { name: '九溪烟树的溪水', desc: '不是西湖，是山里的小溪，夏天踩水。', tip: '从九溪公交站走进去' }
    ],
    '青岛': [
        { name: '大学路的黄县路', desc: '老舍故居旁的小路，有独立咖啡馆。', tip: '下午3点去' },
        { name: '团岛农贸市场', desc: '本地人买海鲜的市场，买完旁边加工。', tip: '早上最鲜' },
        { name: '小麦岛公园', desc: '不是栈桥，是本地人野餐看日落的草地。', tip: '日落前一小时去' },
        { name: '纺织谷', desc: '旧纺织厂改造的艺术区，有展览和市集。', tip: '周末有市集' },
        { name: '中山路劈柴院后巷', desc: '主街是游客的，后巷才是本地人的小馆。', tip: '从河北路绕进去' },
        { name: '浮山后的野路', desc: '本地人爬的野山，能俯瞰整个青岛。', tip: '穿运动鞋，别走夜路' }
    ],
    '哈尔滨': [
        { name: '老道外中华巴洛克', desc: '不是中央大街，是真正的老哈尔滨街区。', tip: '上午去，人少' },
        { name: '红专街早市', desc: '本地人买菜吃早点的市场，冻梨冻柿子。', tip: '早上7点去' },
        { name: '果戈里书店', desc: '老建筑里的书店，有俄文旧书。', tip: '下午去喝咖啡' },
        { name: '群力音乐公园', desc: '松花江边的公园，本地人遛弯看江。', tip: '傍晚去看落日' },
        { name: '师大夜市', desc: '学生价夜市，烤冷面5块。', tip: '晚上6点后' },
        { name: '中华巴洛克的老澡堂', desc: '百年澡堂，体验东北搓澡文化。', tip: '下午人少' }
    ],
    '长沙': [
        { name: '化龙池的夜', desc: '不是解放西，是化龙池的小酒吧，本地人。', tip: '晚上10点后' },
        { name: '西园北里', desc: '老长沙的公馆区，有咖啡馆和旧宅。', tip: '下午去，安静' },
        { name: '后湖艺术园', desc: '湖边的艺术区，有展览和独立书店。', tip: '周末有市集' },
        { name: '四方坪夜市', desc: '本地人吃的夜市，不是游客街。', tip: '晚上8点后' },
        { name: '潮宗街', desc: '老街区改造，有书店和咖啡馆。', tip: '下午去' },
        { name: '岳麓山后山的小路', desc: '不是正门，是后山的野路，人少。', tip: '从湖大后山进' }
    ],
    '上海': [
        { name: '武康路与安福路', desc: '梧桐区，本地人遛狗买咖啡的地方。', tip: '工作日下午去' },
        { name: '永康路的咖啡', desc: '一条街上十家咖啡馆，都是本地客。', tip: '下午2点去' },
        { name: 'M50创意园', desc: '苏州河边的旧厂房，有画廊和工作室。', tip: '工作日人少' },
        { name: '定海桥的旧弄堂', desc: '杨浦滨江的老弄堂，有展览和社区食堂。', tip: '周末去' },
        { name: '昌里路夜市', desc: '浦东本地人的夜市，不是城隍庙。', tip: '晚上7点后' },
        { name: '苏州河步道', desc: '从外白渡桥走到长寿路，人少景好。', tip: '傍晚去' }
    ],
    '桂林': [
        { name: '訾洲公园看象鼻山', desc: '不用买象鼻山门票，公园里能看到全景。', tip: '早上8点去' },
        { name: '东西巷后街', desc: '不是正街，是后街的小馆和旧书店。', tip: '傍晚去' },
        { name: '大圩古镇', desc: '不是阳朔，是大圩，本地人赶集的古镇。', tip: '赶集日更热闹' },
        { name: '乌桕滩', desc: '漓江边的野滩，秋天红叶，本地人野餐。', tip: '11月最好看' },
        { name: '尚水街夜市', desc: '本地人吃的夜市，米粉5块。', tip: '晚上7点后' },
        { name: '会仙湿地的玻璃田', desc: '不是龙脊，是会仙的田野，人少。', tip: '清晨有雾最美' }
    ]
});

function renderHiddenCities() {
    const cities = Object.keys(hiddenCities);
    const html = cities.map(c => `<div class="hidden-city-btn" onclick="generateHidden('${c}', this)">${c}</div>`).join('');
    document.getElementById('hiddenCityGrid').innerHTML = html;
}

function generateHidden(city, el) {
    document.querySelectorAll('.hidden-city-btn').forEach(b => b.classList.remove('selected'));
    (el || window.event && window.event.target || { classList: { add() { } } }).classList.add('selected');
    const spots = hiddenCities[city] || [];
    const randomSpots = spots.slice().sort(() => Math.random() - 0.5).slice(0, 3);
    let html = `<div class="hidden-result-card">
        <h4>🎲 ${city} · 本地人才知道的隐藏玩法</h4>`;
    randomSpots.forEach(s => {
        const img = typeof mylImgUrl === 'function' ? mylImgUrl(s.name, 'sight', city) : 'images/city-fallback.jpg';
        html += `<div class="hidden-spot">
            <img class="hidden-spot-img" src="${img}" alt="${s.name}" loading="lazy" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />
            <div class="hidden-spot-body">
                <div class="hidden-spot-name">📍 ${s.name}</div>
                <div class="hidden-spot-desc">${s.desc}</div>
                <div class="hidden-spot-tip">💡 ${s.tip}</div>
            </div>
        </div>`;
    });
    html += `<div style="text-align:center;margin:16px 0">
        <button class="btn btn-outline btn-sm" onclick="generateHidden('${city}', this)">🔄 再生成一组</button>
    </div>`;
    if (typeof renderPack === 'function' && ROUTE_LIBRARY && ROUTE_LIBRARY[city]) {
        html += `<div class="hidden-route-title">🗺️ ${city} · 3 天隐藏线路（点开看地图与时间轴）</div>
            ${renderPack(city, { label: city + ' · 深度玩法线路' })}`;
    }
    html += `</div>`;
    document.getElementById('hiddenResult').innerHTML = html;
    document.getElementById('hiddenResult').style.display = 'block';
}

let regrets = [
    { city: '冰岛', text: '待了7天，只看到10分钟极光，还是在云缝里。', likes: 23 },
    { city: '京都', text: '那家米其林寿司店提前一个月预约都没约上，在门口哭了。', likes: 18 },
    { city: '新疆', text: '独库公路封路了，没走成，在酒店待了三天。', likes: 15 },
    { city: '大理', text: '去的时候下雨，双廊什么都没看到，就回来了。', likes: 12 },
    { city: '镰仓', text: '去的时候是工作日，灌篮高手那个路口全是人，根本拍不到。', likes: 9 }
];

function renderRegrets() {
    const html = regrets.map((r, i) => `
        <div class="regret-card">
            <div class="regret-main">
                <img class="regret-img" src="${typeof mylImgUrl === 'function' ? mylImgUrl(r.city, 'sight') : 'images/city-fallback.jpg'}" alt="${r.city}" loading="lazy" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />
                <div class="regret-body">
                    <div class="regret-city">📍 ${r.city}</div>
                    <div class="regret-text">${r.text}</div>
                    <div class="regret-actions">
                        <span class="regret-like" onclick="likeRegret(${i})">❤️ ${r.likes} 人有同感</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('regretList').innerHTML = html;
}
function showRegretForm() {
    document.getElementById('regretForm').style.display = 'block';
}
function submitRegret() {
    const city = document.getElementById('regretCity').value.trim();
    const text = document.getElementById('regretText').value.trim();
    if (!city || !text) { alert('请填写完整'); return; }
    regrets.unshift({ city, text, likes: 0 });
    renderRegrets();
    document.getElementById('regretForm').style.display = 'none';
    document.getElementById('regretCity').value = '';
    document.getElementById('regretText').value = '';
}
function likeRegret(idx) {
    regrets[idx].likes++;
    renderRegrets();
}

// ============================================================
//  新项目4：和谁去匹配测试
// ============================================================
const matchQuestions = [
    { q: '旅行的时候，你更喜欢？', options: [
        { text: '🏃 一个人想走就走，不用等人', score: 'solo' },
        { text: '👯 和好朋友一起，热闹', score: 'friend' },
        { text: '💕 和对象一起，浪漫', score: 'couple' },
        { text: '👨‍👩‍👧 和家人一起，温馨', score: 'family' }
    ]},
    { q: '你旅行的时候会做攻略吗？', options: [
        { text: '📝 做超级详细的攻略，精确到分钟', score: 'planner' },
        { text: '🗺️ 大概看一下，到了再说', score: 'free' },
        { text: '🤷 完全不做，跟着别人走', score: 'follower' }
    ]},
    { q: '你旅行的时候更喜欢吃？', options: [
        { text: '🍜 当地老字号苍蝇馆子', score: 'foodie' },
        { text: '🍽️ 网红餐厅打卡', score: 'social' },
        { text: '🛏️ 酒店点餐，不出门', score: 'lazy' }
    ]},
    { q: '你旅行的时候更喜欢住？', options: [
        { text: '🛏️ 青旅多人间，认识新朋友', score: 'social' },
        { text: '🏠 设计感民宿，拍照出片', score: 'aesthetic' },
        { text: '🏨 五星酒店，躺平舒服', score: 'luxury' }
    ]},
    { q: '你旅行的时候更喜欢拍照吗？', options: [
        { text: '📸 疯狂拍照，九宫格不够发', score: 'photographer' },
        { text: '📷 随便拍几张记录一下', score: 'casual' },
        { text: '🙅 不拍照，用眼睛看', score: 'present' }
    ]},
    { q: '你旅行的时候更喜欢？', options: [
        { text: '🏔️ 去人少的地方，荒野', score: 'wild' },
        { text: '🏙️ 去城市，逛街吃美食', score: 'city' },
        { text: '🏘️ 去古镇/文艺小镇，发呆', score: 'slow' }
    ]}
];

let matchAnswers = [];
function startMatch() {
    matchAnswers = [];
    document.getElementById('matchStart').style.display = 'none';
    document.getElementById('matchPlaying').style.display = 'block';
    showMatchQuestion(0);
}
function showMatchQuestion(idx) {
    const q = matchQuestions[idx];
    document.getElementById('matchProgress').style.width = ((idx) / matchQuestions.length * 100) + '%';
    document.getElementById('matchQuestion').textContent = q.q;
    const optsHtml = q.options.map((o, i) => `<div class="quiz-option" onclick="answerMatch(${idx}, '${o.score}')">${o.text}</div>`).join('');
    document.getElementById('matchOptions').innerHTML = optsHtml;
}
function answerMatch(idx, score) {
    matchAnswers[idx] = score;
    if (idx < matchQuestions.length - 1) {
        showMatchQuestion(idx + 1);
    } else {
        showMatchResult();
    }
}
function showMatchResult() {
    document.getElementById('matchPlaying').style.display = 'none';
    document.getElementById('matchResult').style.display = 'block';
    const counts = {};
    matchAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1);
    const topType = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    let emoji, title, desc, compat;
    if (topType === 'solo' || topType === 'wild' || topType === 'present') {
        emoji = '🎒'; title = '独行侠型旅伴';
        desc = '你适合一个人旅行！你不喜欢等人，不喜欢迁就别人，你有自己的节奏。你享受一个人在路上的自由，一个人吃饭、一个人看风景、一个人发呆，对你来说就是最好的旅行。';
        compat = [
            { type: 'Solo 旅行', percent: 95 },
            { type: '好朋友（同样独立型）', percent: 70 },
            { type: '情侣', percent: 40 },
            { type: '家人', percent: 30 }
        ];
    } else if (topType === 'foodie' || topType === 'city') {
        emoji = '🍜'; title = '美食搭子型旅伴';
        desc = '你适合和同样爱吃的朋友一起旅行！你们可以一起找苍蝇馆子，一起排队吃网红店，一起为了一碗面跨半座城。旅行对你来说就是换个地方吃好吃的。';
        compat = [
            { type: '美食搭子', percent: 95 },
            { type: '好朋友（吃货型）', percent: 85 },
            { type: '情侣', percent: 75 },
            { type: 'Solo', percent: 50 }
        ];
    } else if (topType === 'aesthetic' || topType === 'photographer') {
        emoji = '📸'; title = '拍照搭子型旅伴';
        desc = '你适合和会拍照的朋友一起旅行！你们可以一起找机位，一起等光线，一起拍九宫格。旅行对你来说就是换个地方拍照出片。';
        compat = [
            { type: '拍照搭子', percent: 95 },
            { type: '情侣（会拍照的）', percent: 80 },
            { type: '好朋友（同样爱拍照）', percent: 75 },
            { type: 'Solo', percent: 40 }
        ];
    } else if (topType === 'social' || topType === 'follower') {
        emoji = '🎉'; title = '社交型旅伴';
        desc = '你适合和一群朋友一起旅行！你喜欢热闹，喜欢认识新朋友，喜欢有人带。你不喜欢做攻略，你喜欢跟着别人走，然后享受过程。';
        compat = [
            { type: '一群好朋友', percent: 95 },
            { type: '情侣', percent: 85 },
            { type: '家人', percent: 75 },
            { type: 'Solo', percent: 30 }
        ];
    } else {
        emoji = '🧘'; title = '慢节奏型旅伴';
        desc = '你适合和同样慢节奏的朋友一起旅行！你们可以一起在咖啡馆发呆一下午，一起在古镇小巷里迷路，一起不赶时间。旅行对你来说就是换个地方放松。';
        compat = [
            { type: '慢节奏好朋友', percent: 95 },
            { type: '情侣', percent: 85 },
            { type: '家人', percent: 80 },
            { type: 'Solo', percent: 60 }
        ];
    }
    let compatHtml = compat.map(c => `
        <div class="compat-row">
            <span style="width:120px">${c.type}</span>
            <div class="compat-bar"><div class="compat-fill" style="width:${c.percent}%"></div></div>
            <span style="width:40px;text-align:right;font-weight:700">${c.percent}%</span>
        </div>
    `).join('');
    document.getElementById('matchResult').innerHTML = `
        <div class="match-result">
            <img class="result-banner" src="${typeof mylImgUrl === 'function' ? mylImgUrl('旅行伙伴在机场出发大厅合影', 'sight') : 'images/city-fallback.jpg'}" alt="旅伴" loading="lazy" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />
            <div class="match-emoji">${emoji}</div>
            <div class="match-title">${title}</div>
            <div class="match-type">最佳旅伴类型</div>
            <div class="match-desc">${desc}</div>
            <div class="match-compat">
                <h4>📊 你的旅伴匹配度</h4>
                ${compatHtml}
            </div>
            <div id="matchRoutes"></div>
            <div style="margin-top:20px">
                <button class="btn btn-outline btn-sm" onclick="startMatch()">重新测试</button>
            </div>
        </div>
    `;
    try { renderPersonaRoutes('match', topType, 'matchRoutes', title); } catch (e) { console.error(e); }
}

// ============================================================
//  如何到达 - 交通数据库
// ============================================================
const transportData = {
    '冰岛': { flight: '北京/上海 → 雷克雅未克（约12小时，推荐芬兰航空/北欧航空中转）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-bjs-rkv', trainUrl: '' },
    '新疆': { flight: '各地 → 乌鲁木齐地窝堡机场（3-5小时）', train: '各地 → 乌鲁木齐站（20-40小时，推荐飞机）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-ctu-urc', trainUrl: 'https://www.12306.cn/index/' },
    '北疆': { flight: '各地 → 乌鲁木齐（3-5小时）', train: '各地 → 乌鲁木齐站（20-40小时）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-ctu-urc', trainUrl: 'https://www.12306.cn/index/' },
    '新西兰': { flight: '北京/上海/广州 → 奥克兰（约12小时，直飞/中转）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-bjs-akl', trainUrl: '' },
    '成都': { flight: '各地 → 成都双流/天府机场（2-3小时）', train: '各地 → 成都东站（4-10小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-ctu', trainUrl: 'https://www.12306.cn/index/' },
    '曼谷': { flight: '各地 → 曼谷素万那普/廊曼（3-5小时，直飞）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-bkk', trainUrl: '' },
    '大阪': { flight: '各地 → 大阪关西机场（2-4小时，直飞）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-osa', trainUrl: '' },
    '大理': { flight: '各地 → 大理凤仪机场（3-5小时）', train: '各地 → 大理站（8-15小时，推荐高铁到昆明再转）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-dlu', trainUrl: 'https://www.12306.cn/index/' },
    '京都': { flight: '各地 → 大阪关西机场（2-4小时），再坐HARuka特急到京都（1小时）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-osa', trainUrl: '' },
    '厦门': { flight: '各地 → 厦门高崎/翔安机场（2-3小时）', train: '各地 → 厦门北站（5-10小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-xmn', trainUrl: 'https://www.12306.cn/index/' },
    '巴厘岛': { flight: '各地 → 巴厘岛登巴萨（5-7小时，中转）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-dps', trainUrl: '' },
    '清迈': { flight: '各地 → 清迈机场（4-6小时，中转曼谷）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-cnx', trainUrl: '' },
    '台北': { flight: '各地 → 台北桃园（2-3小时，直飞）', train: '不适用（需大通证+入台证）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-tpe', trainUrl: '' },
    '川西': { flight: '各地 → 成都（2-3小时），再包车/自驾', train: '各地 → 成都东站（4-10小时），再转汽车', flightUrl: 'https://flights.ctrip.com/online/list/oneway-ctu', trainUrl: 'https://www.12306.cn/index/' },
    '云南': { flight: '各地 → 昆明长水（2-3小时）', train: '各地 → 昆明南站（6-12小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-kmg', trainUrl: 'https://www.12306.cn/index/' },
    '青海': { flight: '各地 → 西宁曹家堡（2-4小时）', train: '各地 → 西宁站（8-15小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-xnn', trainUrl: 'https://www.12306.cn/index/' },
    '河西走廊': { flight: '各地 → 兰州中川（2-3小时），再转高铁', train: '各地 → 兰州西站（6-12小时），再转兰新高铁', flightUrl: 'https://flights.ctrip.com/online/list/oneway-lhw', trainUrl: 'https://www.12306.cn/index/' },
    '杭州': { flight: '各地 → 杭州萧山（2-3小时）', train: '各地 → 杭州东站（4-8小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-hgh', trainUrl: 'https://www.12306.cn/index/' },
    '苏州': { flight: '各地 → 上海虹桥/浦东（2-3小时），再转高铁到苏州（30分钟）', train: '各地 → 苏州站/北站（4-10小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-sha', trainUrl: 'https://www.12306.cn/index/' },
    '长沙': { flight: '各地 → 长沙黄花（2-3小时）', train: '各地 → 长沙南站（4-8小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-can', trainUrl: 'https://www.12306.cn/index/' },
    '泉州': { flight: '各地 → 泉州晋江（2-3小时）', train: '各地 → 泉州站（5-10小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-jjn', trainUrl: 'https://www.12306.cn/index/' },
    '重庆': { flight: '各地 → 重庆江北（2-3小时）', train: '各地 → 重庆北站/西站（4-10小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-ckg', trainUrl: 'https://www.12306.cn/index/' },
    '镰仓': { flight: '各地 → 东京成田/羽田（3-4小时），再坐JR到镰仓（1小时）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-tyo', trainUrl: '' },
    '哈尔滨': { flight: '各地 → 哈尔滨太平（2-3小时）', train: '各地 → 哈尔滨站（8-15小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-hrb', trainUrl: 'https://www.12306.cn/index/' },
    '三亚': { flight: '各地 → 三亚凤凰（2-4小时）', train: '各地 → 三亚站（10-15小时，推荐飞机）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-syx', trainUrl: 'https://www.12306.cn/index/' },
    '北海道': { flight: '各地 → 札幌新千岁（4-6小时，中转东京）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-spk', trainUrl: '' },
    '北京': { flight: '各地 → 北京首都/大兴（2-3小时）', train: '各地 → 北京南站/西站（4-10小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-bjs', trainUrl: 'https://www.12306.cn/index/' },
    '罗平': { flight: '各地 → 昆明长水（2-3小时），再转大巴到罗平（3小时）', train: '各地 → 昆明南站（6-12小时），再转火车到罗平（3小时）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-kmg', trainUrl: 'https://www.12306.cn/index/' },
    '东京': { flight: '各地 → 东京成田/羽田（3-4小时，直飞）', train: '不适用（海外目的地）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-tyo', trainUrl: '' },
    '林芝': { flight: '各地 → 拉萨贡嘎（3-5小时），再转汽车到林芝（4小时）', train: '不适用（推荐飞机）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-lxa', trainUrl: '' },
    '无锡': { flight: '各地 → 无锡硕放（2-3小时）', train: '各地 → 无锡站（4-8小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-wux', trainUrl: 'https://www.12306.cn/index/' },
    '西安': { flight: '各地 → 西安咸阳（2-3小时）', train: '各地 → 西安北站（4-8小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-xiy', trainUrl: 'https://www.12306.cn/index/' },
    '兰州': { flight: '各地 → 兰州中川（2-3小时）', train: '各地 → 兰州西站（6-12小时，推荐高铁）', flightUrl: 'https://flights.ctrip.com/online/list/oneway-lhw', trainUrl: 'https://www.12306.cn/index/' }
};

// 根据目的地名称匹配交通信息
function getTransportInfo(destName) {
    for (const key in transportData) {
        if (destName.includes(key)) {
            return transportData[key];
        }
    }
    // 默认返回国内通用
    return {
        flight: '各地 → 目的地机场（2-3小时）',
        train: '各地 → 目的地高铁站（4-10小时）',
        flightUrl: 'https://flights.ctrip.com/',
        trainUrl: 'https://www.12306.cn/index/'
    };
}

// ============================================================
//  MYL 精选线路库（后遗症 / 旅伴匹配 / 隐藏玩法 共用）
//  每条线路：地图 + 时间轴 + 景点(图/价/预订) + 美食(图) + 交通
// ============================================================
const ROUTE_LIBRARY = {
    '大理': {
        theme: '风花雪月的慢生活', lat: 25.606, lng: 100.267, hotel: '洱海门白族民宿 ¥320/晚',
        attrs: [
            { name: '大理古城', price: '免费', desc: '人民路、洋人街随便逛', lat: 25.693, lng: 100.161, day: 1, time: '14:00' },
            { name: '洱海生态廊道', price: '免费', desc: '骑行看苍山洱海', lat: 25.72, lng: 100.19, day: 1, time: '17:00' },
            { name: '喜洲古镇', price: '免费', desc: '白族早市与稻田', lat: 25.856, lng: 100.127, day: 2, time: '09:30' },
            { name: '苍山洗马潭', price: '¥282（含索道）', desc: '索道直上4000米', lat: 25.68, lng: 100.11, day: 2, time: '14:00' },
            { name: '沙溪古镇', price: '免费', desc: '茶马古道上最后的集市', lat: 26.32, lng: 99.85, day: 3, time: '09:30' }
        ],
        foods: [
            { name: '喜洲粑粑', desc: '现烤，甜咸都好吃', price: '¥10', day: 1, time: '12:00' },
            { name: '白族石板烧', desc: '自己动手烤', price: '¥68', day: 1, time: '18:30' },
            { name: '乳扇沙琪玛', desc: '奶香十足的白族零食', price: '¥15', day: 2, time: '12:00' },
            { name: '洱海酸辣鱼', desc: '酸木瓜煮鱼', price: '¥88', day: 2, time: '18:30' }
        ]
    },
    '成都': {
        theme: '巴适得板的市井成都', lat: 30.5728, lng: 104.0668, hotel: '春熙路亚朵 ¥380/晚',
        attrs: [
            { name: '宽窄巷子', price: '免费', desc: '老成都街巷肌理', lat: 30.669, lng: 104.055, day: 1, time: '09:30' },
            { name: '人民公园鹤鸣茶社', price: '¥30 茶位', desc: '竹椅盖碗茶，本地人打牌', lat: 30.657, lng: 104.057, day: 1, time: '14:00' },
            { name: '大熊猫繁育基地', price: '¥55', desc: '早上看熊猫吃竹子', lat: 30.735, lng: 104.145, day: 2, time: '08:30' },
            { name: '都江堰', price: '¥80', desc: '两千年水利工程', lat: 31.008, lng: 103.606, day: 2, time: '14:00' },
            { name: '望江楼公园', price: '免费', desc: '竹林里喝茶发呆', lat: 30.63, lng: 104.09, day: 3, time: '09:30' }
        ],
        foods: [
            { name: '锅巴土豆', desc: '建设巷5块一份', price: '¥8', day: 1, time: '12:00' },
            { name: '冷锅串串', desc: '本地人排队那家', price: '¥45', day: 1, time: '18:30' },
            { name: '甜水面', desc: '筷子粗的面，甜辣', price: '¥12', day: 2, time: '12:00' },
            { name: '老火锅', desc: '九宫格牛油锅', price: '¥98', day: 2, time: '18:30' }
        ]
    },
    '西安': {
        theme: '十三朝古都的烟火', lat: 34.3416, lng: 108.9398, hotel: '钟楼附近 ¥300/晚',
        attrs: [
            { name: '西安城墙', price: '¥54', desc: '永宁门租车骑一圈', lat: 34.261, lng: 108.941, day: 1, time: '15:00' },
            { name: '回民街', price: '免费', desc: '大皮院比主街好吃', lat: 34.265, lng: 108.94, day: 1, time: '18:30' },
            { name: '秦始皇兵马俑', price: '¥120', desc: '一定要请讲解', lat: 34.385, lng: 109.278, day: 2, time: '08:30' },
            { name: '大雁塔', price: '¥40', desc: '北广场音乐喷泉', lat: 34.219, lng: 108.964, day: 2, time: '15:00' },
            { name: '华山', price: '¥160', desc: '长空栈道看日出', lat: 34.48, lng: 110.08, day: 3, time: '07:30' }
        ],
        foods: [
            { name: '肉夹馍', desc: '腊汁肉现剁', price: '¥12', day: 1, time: '12:00' },
            { name: '羊肉泡馍', desc: '自己掰馍才香', price: '¥38', day: 2, time: '12:00' },
            { name: '甑糕', desc: '枣泥糯米，早上吃', price: '¥8', day: 1, time: '09:00' },
            { name: '葫芦鸡', desc: '西安名菜，皮酥', price: '¥88', day: 2, time: '18:30' }
        ]
    },
    '杭州': {
        theme: '一半西湖一半烟火', lat: 30.2741, lng: 120.1551, hotel: '龙井路茶山民宿 ¥420/晚',
        attrs: [
            { name: '西湖', price: '免费', desc: '断桥—白堤—孤山', lat: 30.243, lng: 120.15, day: 1, time: '09:00' },
            { name: '灵隐寺', price: '¥75', desc: '飞来峰石窟造像', lat: 30.24, lng: 120.102, day: 1, time: '14:00' },
            { name: '龙井村', price: '免费', desc: '茶山上喝一杯明前', lat: 30.221, lng: 120.104, day: 2, time: '10:00' },
            { name: '西溪湿地', price: '¥80', desc: '摇橹船穿芦苇荡', lat: 30.267, lng: 120.07, day: 2, time: '14:30' },
            { name: '千岛湖', price: '¥130', desc: '环湖骑行一天', lat: 29.60, lng: 119.04, day: 3, time: '09:00' }
        ],
        foods: [
            { name: '片儿川', desc: '雪菜笋片面', price: '¥22', day: 1, time: '12:00' },
            { name: '西湖醋鱼', desc: '楼外楼经典', price: '¥128', day: 1, time: '18:30' },
            { name: '龙井虾仁', desc: '茶香清口', price: '¥168', day: 2, time: '12:00' },
            { name: '葱包桧', desc: '巷口小吃', price: '¥10', day: 2, time: '16:00' }
        ]
    },
    '厦门': {
        theme: '海风、老街和沙茶味', lat: 24.4798, lng: 118.0894, hotel: '沙坡尾设计民宿 ¥360/晚',
        attrs: [
            { name: '鼓浪屿', price: '船票¥35', desc: '早上第一班上岛', lat: 24.447, lng: 118.067, day: 1, time: '09:00' },
            { name: '沙坡尾艺术西区', price: '免费', desc: '老渔港改造的艺术区', lat: 24.44, lng: 118.08, day: 1, time: '15:00' },
            { name: '黄厝海滩', price: '免费', desc: '本地人看日出的海滩', lat: 24.43, lng: 118.12, day: 2, time: '05:30' },
            { name: '南普陀寺', price: '免费', desc: '素饼周末才有', lat: 24.44, lng: 118.09, day: 2, time: '10:00' },
            { name: '集美学村', price: '免费', desc: '嘉庚建筑，人少', lat: 24.57, lng: 118.10, day: 3, time: '09:30' }
        ],
        foods: [
            { name: '沙茶面', desc: '乌糖沙茶面', price: '¥18', day: 1, time: '12:00' },
            { name: '八市海鲜加工', desc: '自己买自己挑', price: '¥120', day: 1, time: '18:30' },
            { name: '土笋冻', desc: '配芥末酱油', price: '¥15', day: 2, time: '12:00' },
            { name: '花生汤', desc: '甜口收尾', price: '¥8', day: 2, time: '16:00' }
        ]
    },
    '青岛': {
        theme: '红瓦绿树，啤酒蛤蜊', lat: 36.0671, lng: 120.3826, hotel: '八大关海景房 ¥400/晚',
        attrs: [
            { name: '栈桥', price: '免费', desc: '清晨看海鸥', lat: 36.06, lng: 120.32, day: 1, time: '09:00' },
            { name: '八大关', price: '免费', desc: '万国建筑群', lat: 36.05, lng: 120.35, day: 1, time: '14:00' },
            { name: '小麦岛', price: '免费', desc: '日落草坪', lat: 36.05, lng: 120.42, day: 1, time: '18:00' },
            { name: '崂山', price: '¥95', desc: '海上第一名山', lat: 36.16, lng: 120.63, day: 2, time: '08:30' },
            { name: '青岛啤酒博物馆', price: '¥60', desc: '含两杯原浆', lat: 36.07, lng: 120.35, day: 2, time: '15:30' }
        ],
        foods: [
            { name: '排骨米饭', desc: '青岛人的快餐', price: '¥28', day: 1, time: '12:00' },
            { name: '辣炒蛤蜊', desc: '配袋装原浆', price: '¥38', day: 1, time: '19:00' },
            { name: '鲅鱼水饺', desc: '皮薄馅大', price: '¥32', day: 2, time: '12:00' },
            { name: '袋装原浆', desc: '塑料袋装才是正宗', price: '¥15', day: 2, time: '17:00' }
        ]
    },
    '重庆': {
        theme: '8D魔幻与麻辣江湖', lat: 29.5630, lng: 106.5516, hotel: '解放碑江景房 ¥360/晚',
        attrs: [
            { name: '李子坝轻轨站', price: '免费', desc: '观景台看轻轨穿楼', lat: 29.55, lng: 106.53, day: 1, time: '09:30' },
            { name: '山城步道', price: '免费', desc: '老巷子里的火锅味', lat: 29.55, lng: 106.57, day: 1, time: '14:00' },
            { name: '洪崖洞', price: '免费', desc: '晚上8点灯全亮', lat: 29.562, lng: 106.579, day: 1, time: '19:30' },
            { name: '磁器口', price: '免费', desc: '从后门进人少', lat: 29.58, lng: 106.45, day: 2, time: '09:30' },
            { name: '南山一棵树', price: '¥30', desc: '俯瞰整个渝中半岛', lat: 29.55, lng: 106.60, day: 2, time: '19:00' }
        ],
        foods: [
            { name: '重庆小面', desc: '二两豌杂', price: '¥10', day: 1, time: '08:00' },
            { name: '酸辣粉', desc: '好又来', price: '¥12', day: 1, time: '12:00' },
            { name: '老火锅', desc: '九宫格毛肚鸭肠', price: '¥90', day: 1, time: '18:00' },
            { name: '毛血旺', desc: '麻辣重口', price: '¥58', day: 2, time: '12:00' }
        ]
    },
    '长沙': {
        theme: '不夜城的辣与甜', lat: 28.2282, lng: 112.9388, hotel: '五一广场 ¥300/晚',
        attrs: [
            { name: '橘子洲', price: '免费', desc: '青年毛泽东雕像', lat: 28.19, lng: 112.96, day: 1, time: '09:00' },
            { name: '岳麓山', price: '免费', desc: '爱晚亭与书院', lat: 28.18, lng: 112.94, day: 1, time: '14:00' },
            { name: '太平老街', price: '免费', desc: '晚上最热闹', lat: 28.19, lng: 112.97, day: 1, time: '18:30' },
            { name: '湖南博物院', price: '免费（需预约）', desc: '马王堆汉墓', lat: 28.21, lng: 112.99, day: 2, time: '09:00' },
            { name: '超级文和友', price: '免费', desc: '复古市井空间', lat: 28.19, lng: 112.98, day: 2, time: '17:00' }
        ],
        foods: [
            { name: '臭豆腐', desc: '黑色经典', price: '¥10', day: 1, time: '12:00' },
            { name: '茶颜悦色', desc: '幽兰拿铁', price: '¥18', day: 1, time: '15:00' },
            { name: '口味虾', desc: '夜宵主角', price: '¥98', day: 1, time: '20:00' },
            { name: '长沙米粉', desc: '早上嗦一碗', price: '¥12', day: 2, time: '08:00' }
        ]
    },
    '北京': {
        theme: '皇城根下的四季', lat: 39.9042, lng: 116.4074, hotel: '前门四合院 ¥450/晚',
        attrs: [
            { name: '故宫博物院', price: '¥60', desc: '提前7天预约', lat: 39.916, lng: 116.397, day: 1, time: '08:30' },
            { name: '景山公园', price: '¥2', desc: '万春亭看故宫全景', lat: 39.923, lng: 116.396, day: 1, time: '13:00' },
            { name: '南锣鼓巷', price: '免费', desc: '钻进胡同里', lat: 39.937, lng: 116.403, day: 1, time: '16:00' },
            { name: '八达岭长城', price: '¥40', desc: '早班车避开人流', lat: 40.36, lng: 116.02, day: 2, time: '08:00' },
            { name: '颐和园', price: '¥30', desc: '昆明湖长廊', lat: 39.999, lng: 116.275, day: 2, time: '14:00' }
        ],
        foods: [
            { name: '卤煮火烧', desc: '老北京重口', price: '¥25', day: 1, time: '12:00' },
            { name: '铜锅涮肉', desc: '聚宝源排队也值', price: '¥120', day: 1, time: '18:30' },
            { name: '豆汁焦圈', desc: '勇敢者早餐', price: '¥12', day: 2, time: '08:00' },
            { name: '牛街小吃', desc: '清真一条街', price: '¥35', day: 2, time: '12:00' }
        ]
    },
    '上海': {
        theme: '梧桐区与摩天楼之间', lat: 31.2304, lng: 121.4737, hotel: '静安设计酒店 ¥480/晚',
        attrs: [
            { name: '武康路', price: '免费', desc: '梧桐树下的老洋房', lat: 31.21, lng: 121.44, day: 1, time: '09:30' },
            { name: '外滩', price: '免费', desc: '18:00 亮灯最出片', lat: 31.24, lng: 121.49, day: 1, time: '18:00' },
            { name: '豫园', price: '¥40', desc: '老城厢与九曲桥', lat: 31.227, lng: 121.492, day: 2, time: '09:30' },
            { name: '朱家角', price: '免费', desc: '地铁可达的江南水乡', lat: 31.11, lng: 121.06, day: 2, time: '14:00' },
            { name: '上海迪士尼', price: '¥475', desc: '早鸟入园刷项目', lat: 31.14, lng: 121.66, day: 3, time: '08:30' }
        ],
        foods: [
            { name: '生煎包', desc: '大壶春', price: '¥15', day: 1, time: '08:00' },
            { name: '本帮红烧肉', desc: '浓油赤酱', price: '¥68', day: 1, time: '12:00' },
            { name: '蟹壳黄', desc: '酥到掉渣', price: '¥8', day: 2, time: '10:00' },
            { name: '小笼包', desc: '先咬一小口', price: '¥35', day: 2, time: '12:00' }
        ]
    },
    '桂林': {
        theme: '山水之间的慢船', lat: 25.2736, lng: 110.2900, hotel: '阳朔遇龙河民宿 ¥330/晚',
        attrs: [
            { name: '象鼻山', price: '免费', desc: '桂林城徽', lat: 25.26, lng: 110.30, day: 1, time: '09:00' },
            { name: '东西巷', price: '免费', desc: '老城墙下的街区', lat: 25.28, lng: 110.30, day: 1, time: '15:00' },
            { name: '漓江竹筏', price: '¥215', desc: '杨堤—兴坪精华段', lat: 24.95, lng: 110.45, day: 2, time: '08:30' },
            { name: '阳朔西街', price: '免费', desc: '晚上最有烟火气', lat: 24.78, lng: 110.49, day: 2, time: '19:00' },
            { name: '龙脊梯田', price: '¥80', desc: '金坑大寨看日落', lat: 25.75, lng: 110.13, day: 3, time: '08:00' }
        ],
        foods: [
            { name: '桂林米粉', desc: '卤菜粉加锅烧', price: '¥12', day: 1, time: '12:00' },
            { name: '啤酒鱼', desc: '阳朔招牌', price: '¥88', day: 1, time: '18:30' },
            { name: '荔浦芋扣肉', desc: '粉糯香', price: '¥58', day: 2, time: '12:00' },
            { name: '恭城油茶', desc: '又苦又香', price: '¥15', day: 2, time: '16:00' }
        ]
    },
    '敦煌': {
        theme: '大漠、石窟与星空', lat: 40.1421, lng: 94.6619, hotel: '鸣沙山下客栈 ¥300/晚',
        attrs: [
            { name: '莫高窟', price: '¥238', desc: '需提前预约，含数字电影', lat: 40.04, lng: 94.80, day: 1, time: '09:00' },
            { name: '鸣沙山月牙泉', price: '¥110', desc: '骑骆驼看日落', lat: 40.09, lng: 94.68, day: 1, time: '17:00' },
            { name: '雅丹魔鬼城', price: '¥120', desc: '戈壁里的风蚀城堡', lat: 40.50, lng: 93.10, day: 2, time: '07:30' },
            { name: '玉门关', price: '¥40', desc: '春风不度玉门关', lat: 40.36, lng: 93.87, day: 2, time: '14:00' },
            { name: '沙洲夜市', price: '免费', desc: '杏皮水配烤串', lat: 40.14, lng: 94.66, day: 2, time: '20:00' }
        ],
        foods: [
            { name: '驴肉黄面', desc: '敦煌第一名吃', price: '¥25', day: 1, time: '12:00' },
            { name: '杏皮水', desc: '解暑酸甜', price: '¥8', day: 1, time: '16:00' },
            { name: '烤羊排', desc: '夜市必点', price: '¥88', day: 1, time: '20:00' },
            { name: '胡杨焖饼', desc: '面饼吸满肉汁', price: '¥45', day: 2, time: '12:00' }
        ]
    },
    '哈尔滨': {
        theme: '冰城、教堂与俄式面包', lat: 45.8038, lng: 126.5340, hotel: '中央大街俄式酒店 ¥420/晚',
        attrs: [
            { name: '中央大街', price: '免费', desc: '面包石路面', lat: 45.77, lng: 126.62, day: 1, time: '09:30' },
            { name: '圣索菲亚教堂', price: '¥20', desc: '拜占庭穹顶', lat: 45.77, lng: 126.62, day: 1, time: '14:00' },
            { name: '冰雪大世界', price: '¥328', desc: '17:30 入园看亮灯', lat: 45.78, lng: 126.58, day: 1, time: '17:30' },
            { name: '太阳岛', price: '¥30', desc: '雪博会与松花江', lat: 45.79, lng: 126.60, day: 2, time: '09:30' },
            { name: '老道外', price: '免费', desc: '中华巴洛克街区', lat: 45.77, lng: 126.65, day: 2, time: '14:00' }
        ],
        foods: [
            { name: '锅包肉', desc: '酸甜脆', price: '¥48', day: 1, time: '12:00' },
            { name: '红肠', desc: '秋林里道斯', price: '¥20', day: 1, time: '15:00' },
            { name: '铁锅炖', desc: '大鹅配贴饼子', price: '¥88', day: 1, time: '19:00' },
            { name: '马迭尔冰棍', desc: '零下20度也吃', price: '¥10', day: 2, time: '16:00' }
        ]
    },
    '喀什': {
        theme: '西域古城与帕米尔', lat: 39.4704, lng: 75.9898, hotel: '古城民宿 ¥260/晚',
        attrs: [
            { name: '喀什古城', price: '免费', desc: '开城仪式10:30', lat: 39.47, lng: 75.99, day: 1, time: '09:30' },
            { name: '艾提尕尔清真寺', price: '¥45', desc: '新疆最大清真寺', lat: 39.47, lng: 75.98, day: 1, time: '14:00' },
            { name: '香妃园', price: '¥30', desc: '维吾尔建筑与歌舞', lat: 39.49, lng: 76.02, day: 2, time: '10:00' },
            { name: '白沙湖', price: '¥50', desc: '帕米尔高原的蓝', lat: 38.75, lng: 75.06, day: 2, time: '14:00' },
            { name: '帕米尔高原', price: '免费', desc: '慕士塔格峰下', lat: 38.50, lng: 75.00, day: 3, time: '08:00' }
        ],
        foods: [
            { name: '烤包子', desc: '馕坑现烤', price: '¥5', day: 1, time: '12:00' },
            { name: '手抓饭', desc: '羊肉胡萝卜', price: '¥35', day: 1, time: '18:30' },
            { name: '缸子肉', desc: '搪瓷缸炖羊肉', price: '¥25', day: 2, time: '12:00' },
            { name: '馕坑肉', desc: '外焦里嫩', price: '¥68', day: 2, time: '18:30' }
        ]
    }
};

// 后遗症 / 旅伴匹配 → 线路推荐
const AFTERMATH_ROUTES = {
    '重度旅行后遗症': ['敦煌', '喀什', '哈尔滨'],
    '中度旅行后遗症': ['大理', '杭州', '厦门'],
    '轻度旅行后遗症': ['成都', '长沙', '重庆'],
    '无旅行后遗症': ['西安', '北京', '上海']
};
const MATCH_ROUTES = {
    'solo': ['敦煌', '大理', '哈尔滨', '桂林'],
    'foodie': ['成都', '长沙', '重庆', '西安'],
    'aesthetic': ['厦门', '青岛', '杭州'],
    'social': ['上海', '北京', '重庆', '长沙'],
    'slow': ['大理', '桂林', '杭州']
};
const MATCH_ROUTE_ALIAS = {
    solo: 'solo', wild: 'solo', present: 'solo',
    foodie: 'foodie', city: 'foodie',
    aesthetic: 'aesthetic', photographer: 'aesthetic',
    social: 'social', follower: 'social', friend: 'social', family: 'social', couple: 'social',
    slow: 'slow', planner: 'slow', lazy: 'slow', luxury: 'slow', free: 'slow', casual: 'slow'
};

let packSeq = 0;
const __packGeo = {};

function renderPack(city, opts) {
    opts = opts || {};
    const p = ROUTE_LIBRARY[city];
    if (!p) return '';
    const seq = ++packSeq;
    __packGeo[seq] = {
        center: [p.lat, p.lng],
        stops: p.attrs.map(a => [a.lat, a.lng, a.name])
    };
    const nodes = [];
    p.attrs.forEach(a => nodes.push({ day: a.day, time: a.time, kind: 'attr', data: a }));
    p.foods.forEach(f => nodes.push({ day: f.day, time: f.time, kind: 'food', data: f }));
    const days = {};
    nodes.forEach(n => { (days[n.day] = days[n.day] || []).push(n); });
    const dayNums = Object.keys(days).map(Number).sort((a, b) => a - b);

    let timeline = '';
    dayNums.forEach(dn => {
        timeline += `<div class="pack-day"><div class="pack-day-title">Day ${dn}</div>`;
        days[dn].sort((a, b) => a.time < b.time ? -1 : 1).forEach(n => {
            timeline += `<div class="pack-node">
                <span class="pack-time">${n.time}</span>
                <span class="pack-line"><i class="pack-dot ${n.kind}"></i></span>
                <span class="pack-text">${n.data.name}<em>${n.data.desc || ''}</em></span>
            </div>`;
        });
        timeline += '</div>';
    });

    const attrCards = p.attrs.map(a => {
        const paid = a.price && !/免费|无需/.test(a.price);
        const needReserve = /博物馆|故宫|兵马俑|温泉|索道|轮渡|游船|竹筏|国家公园|大峡谷|雪山|剧院|迪士尼|博物院/.test(a.name);
        let links = `<a class="gl" href="https://you.ctrip.com/searchsite/?query=${encodeURIComponent(a.name)}" target="_blank" rel="noopener">🎫 携程</a>`;
        if (paid) links += `<a class="gl gl-douyin" href="https://www.douyin.com/search/${encodeURIComponent(a.name)}?type=general" target="_blank" rel="noopener">🎵 抖音</a>`;
        if (needReserve) links += `<a class="gl gl-wechat" href="https://weixin.sogou.com/weixin?type=2&query=${encodeURIComponent(a.name + ' 预约')}" target="_blank" rel="noopener">💬 微信预约</a>`;
        return `<div class="pack-place">
            <img src="${mylImgUrl(a.name, 'sight', city)}" alt="${a.name}" loading="lazy" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />
            <div class="pp-body">
                <div class="pp-name">${a.name}</div>
                <div class="pp-desc">${a.desc || ''}</div>
                <div class="pp-price">${a.price || '门票见携程'}</div>
                <div class="pp-links">${links}</div>
            </div>
        </div>`;
    }).join('');

    const foodCards = p.foods.map(f => `<div class="pack-food">
            <img src="${mylImgUrl(f.name, 'food')}" alt="${f.name}" loading="lazy" onerror="this.onerror=null;this.src='images/food-fallback.jpg'" />
            <div class="pf-body"><div class="pf-name">${f.name}</div><div class="pf-desc">${f.desc || ''}</div><div class="pf-price">${f.price || ''}</div></div>
        </div>`).join('');

    const stopCount = p.attrs.length;
    return `<div class="pack-card" id="pack_${seq}">
        <div class="pack-head" onclick="togglePack(${seq})">
            <img class="pack-cover" src="${mylImgUrl(city + ' 城市风景', 'sight', city)}" alt="${city}" loading="lazy" onerror="this.onerror=null;this.src='images/city-fallback.jpg'" />
            <div class="pack-head-info">
                <div class="pack-city">${opts.label || city}</div>
                <div class="pack-theme">${p.theme}</div>
                <div class="pack-meta">3 天 2 晚 · ${stopCount} 个景点 · 含地图/时间轴/美食/交通</div>
            </div>
            <span class="pack-arrow">›</span>
        </div>
        <div class="pack-body">
            <div class="pack-map" id="pmap_${seq}"></div>
            <div class="pack-block"><div class="pack-block-title">🕘 每日时间轴</div>${timeline}</div>
            <div class="pack-block"><div class="pack-block-title">🏞️ 必去景点</div><div class="pack-grid">${attrCards}</div></div>
            <div class="pack-block"><div class="pack-block-title">🍜 必吃美食</div><div class="pack-grid food">${foodCards}</div></div>
            <div class="pack-block pack-transport">
                <div class="pack-block-title">🚄 大交通</div>
                <div class="pack-dep">
                    <label>出发城市</label>
                    <input id="pdep_${seq}" data-seq="${seq}" placeholder="例如：上海" />
                </div>
                <div class="pack-tbtns">
                    <button class="gl gl-flight" onclick="openPackTransport(this,'flight')" data-seq="${seq}" data-city="${city}">✈️ 携程机票</button>
                    <button class="gl gl-train" onclick="openPackTransport(this,'train')" data-seq="${seq}" data-city="${city}">🚄 携程高铁</button>
                    <button class="gl" onclick="openPackTransport(this,'rail')" data-seq="${seq}" data-city="${city}">🚉 12306</button>
                </div>
                <div class="pack-hotel">🏨 住宿建议：${p.hotel || '市中心交通便利处'}</div>
            </div>
        </div>
    </div>`;
}

function togglePack(seq) {
    const card = document.getElementById('pack_' + seq);
    if (!card) return;
    const opening = !card.classList.contains('open');
    card.classList.toggle('open', opening);
    if (opening && !card.dataset.mapReady) {
        card.dataset.mapReady = '1';
        setTimeout(() => initPackMap(seq), 80);
    }
}

function initPackMap(seq) {
    const el = document.getElementById('pmap_' + seq);
    const geo = __packGeo[seq];
    if (!el || !geo || typeof L === 'undefined' || el.dataset.inited) return;
    el.dataset.inited = '1';
    const map = L.map(el, { zoomControl: false, scrollWheelZoom: false }).setView(__wgs2gcj(geo.center[0], geo.center[1]), 11);
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { subdomains: ['1','2','3','4'], attribution: '© 高德地图' }).addTo(map);
    const latlngs = [];
    geo.stops.forEach((s, i) => {
        const icon = L.divIcon({
            className: 'pack-marker',
            html: `<span>${i + 1}</span>`,
            iconSize: [26, 26], iconAnchor: [13, 13]
        });
        const gs = __wgs2gcj(s[0], s[1]);
        L.marker(gs, { icon }).addTo(map).bindPopup(s[2]);
        latlngs.push(gs);
    });
    if (latlngs.length > 1) {
        L.polyline(latlngs, { color: '#8b5cf6', weight: 3, opacity: .7, dashArray: '6 6' }).addTo(map);
        map.fitBounds(latlngs, { padding: [28, 28] });
    }
    setTimeout(() => map.invalidateSize(), 120);
}

function openPackTransport(btn, kind) {
    const seq = btn.getAttribute('data-seq');
    const city = btn.getAttribute('data-city');
    const input = document.getElementById('pdep_' + seq);
    const dep = ((input && input.value) || '上海').trim() || '上海';
    try { localStorage.setItem('mylDepartCity', dep); } catch (e) { }
    let url = 'https://www.12306.cn/index/';
    if (kind === 'flight' && typeof ctripFlightUrl === 'function') url = ctripFlightUrl(dep, city);
    else if (kind === 'train' && typeof ctripTrainUrl === 'function') url = ctripTrainUrl(dep, city);
    window.open(url, '_blank', 'noopener');
}

function renderPersonaRoutes(kind, key, elId, label) {
    const el = document.getElementById(elId);
    if (!el) return;
    const key2 = kind === 'match' ? (MATCH_ROUTE_ALIAS[key] || 'slow') : key;
    const cities = (kind === 'aftermath' ? AFTERMATH_ROUTES[key] : MATCH_ROUTES[key2]) || [];
    if (!cities.length) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="persona-routes">
        <div class="persona-routes-title">🧭 为「${label || key}」定制的 ${cities.length} 条线路</div>
        <div class="persona-routes-sub">点击线路展开：地图 · 时间轴 · 景点美食 · 交通预订</div>
        ${cities.map(c => renderPack(c)).join('')}
    </div>`;
}

// 初始化新项目（暂时关闭，先恢复网站正常）
// window.addEventListener('load', function() {
//     try {
//         renderHiddenCities();
//         renderRegrets();
//     } catch(e) {
//         console.log('新项目初始化失败:', e);
//     }
// });