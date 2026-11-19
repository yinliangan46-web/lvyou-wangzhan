// 人格测试 20 型 · 新人格 E-J
Object.assign(personalityTypes, {
    'E': {
        icon: '🚀', title: '城市特种兵', badge: '钢筋水泥打卡机器',
        desc: '你的旅行表比上班还满：地铁换乘、地标连刷、咖啡边走边喝。一天五个景点不喊累，回来相册里全是定位和打卡照，效率高到朋友以为你是来出差的。',
        routes: [
            { dest: '上海 · 都市高密度打卡', days: '3天2晚', img: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '外滩 → 南京路 → 陆家嘴三件套 → 滨江夜景' },
                { d: 'Day2', t: '武康路梧桐区 → 安福路 → 豫园 → 田子坊' },
                { d: 'Day3', t: '迪士尼/博物馆 → 返程' }
              ],
              ai: { budget: '¥1,800-3,000/人（吃+住+市内交通）', transport: '地铁2/10号线为主，市区步行+换乘', hotel: '人民广场/南京东路附近连锁酒店', bestTime: '3-5月或9-11月，避开梅雨季',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '外滩万国建筑 → 南京路步行街 → 陆家嘴三件套 → 黄浦江滨江夜景' },
                  { d: 'Day2 全天', t: '武康路梧桐区 → 安福路咖啡街 → 豫园老城厢 → 田子坊' },
                  { d: 'Day3 上午', t: '迪士尼乐园或城市博物馆 → 返程' }
                ],
                attractions: [
                  { name: '外滩', desc: '万国建筑群，傍晚亮灯最出片', price: '免费', ctripUrl: 'https://you.ctrip.com/sight/shanghai2/494.html' },
                  { name: '武康路', desc: '梧桐老洋房一条街，适合 citywalk', price: '免费' }
                ],
                foods: [
                  { name: '生煎包', desc: '底脆汤多，早餐或下午茶首选', price: '¥20/两' },
                  { name: '本帮红烧肉', desc: '浓油赤酱，甜口下饭', price: '¥68/份' }
                ],
                hotels: [
                  { name: '人民广场连锁酒店', desc: '地铁交汇，去哪都快，适合特种兵', price: '¥350/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/shanghai2.html' }
                ],
                tips: '地铁是上海出行主力，避开早晚高峰换乘；武康路工作日人少；热门展馆提前在公众号预约；行程排得满，记得留一顿正餐时间。' }
            }
        ]
    },
    'F': {
        icon: '🛋️', title: '慢游放空派', badge: '把日子过成假期',
        desc: '你出门不是为了赶景点，是为了把平时绷着的那根弦松下来。行程表上一天只写一件事，剩下的时间交给江边发呆、咖啡馆看书和临时起意的小路。',
        routes: [
            { dest: '阳朔 · 漓江慢住', days: '5天4晚', img: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达阳朔 → 西街闲逛 → 江边晚餐' },
                { d: 'Day2', t: '漓江竹筏 → 遇龙河沿岸骑行' },
                { d: 'Day3', t: '酒店躺平 → 田园散步 → 下午茶' },
                { d: 'Day4', t: '十里画廊慢走 → 月亮山' },
                { d: 'Day5', t: '睡到自然醒 → 返程' }
              ],
              ai: { budget: '¥1,500-2,500/人', transport: '县城打车+骑行，不赶景点', hotel: '遇龙河沿岸民宿，带院子最好', bestTime: '4-10月，雨季注意天气',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '抵达阳朔 → 西街慢逛 → 漓江边晚餐' },
                  { d: 'Day2 全天', t: '漓江竹筏漂流 → 遇龙河沿岸骑行' },
                  { d: 'Day3 全天', t: '民宿休息躺平 → 田园散步 → 河边下午茶' },
                  { d: 'Day4 上午-下午', t: '十里画廊慢走 → 月亮山观景' },
                  { d: 'Day5 上午', t: '自然醒 → 返程' }
                ],
                attractions: [
                  { name: '遇龙河', desc: '比漓江更安静，竹筏漂流看田园山水', price: '竹筏¥160/筏', ctripUrl: 'https://you.ctrip.com/sight/yangshuo14/5100.html' },
                  { name: '十里画廊', desc: '沿公路骑行，喀斯特峰林一路相伴', price: '免费' }
                ],
                foods: [
                  { name: '啤酒鱼', desc: '阳朔招牌，漓江鱼配啤酒焖煮', price: '¥80/份' },
                  { name: '桂林米粉', desc: '早餐来一碗，锅烧牛肉最香', price: '¥15/碗' }
                ],
                hotels: [
                  { name: '遇龙河田园民宿', desc: '带院子和山景，适合住下慢养', price: '¥300/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/yangshuo14.html' }
                ],
                tips: '慢游不用排满，留半天什么都不做；竹筏提前一天订；骑行注意防晒；民宿选遇龙河一带比西街安静。' }
            }
        ]
    },
    'G': {
        icon: '🏮', title: '古镇寻幽客', badge: '钻进巷子里找旧时光',
        desc: '你不爱宽阔的新街区，偏爱被岁月磨旧的石板路。老宅的木门、巷口的茶馆、傍晚亮起的灯笼，这些细节比网红打卡点更让你心动。',
        routes: [
            { dest: '乌镇 · 江南古镇寻幽', days: '3天2晚', img: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '西栅夜景 → 老茶馆 → 摇橹船' },
                { d: 'Day2', t: '东栅清晨 → 老宅作坊 → 巷弄慢逛' },
                { d: 'Day3', t: '水乡早餐 → 返程' }
              ],
              ai: { budget: '¥1,200-2,000/人', transport: '景区内步行+摇橹船，镇间班车', hotel: '西栅内临水民宿，夜景方便', bestTime: '3-5月或10-11月，春秋最舒服',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '入住西栅 → 老茶馆喝茶 → 摇橹船夜游水乡' },
                  { d: 'Day2 全天', t: '东栅清晨人少 → 老宅作坊 → 巷弄慢逛' },
                  { d: 'Day3 上午', t: '水乡早餐 → 返程' }
                ],
                attractions: [
                  { name: '西栅', desc: '夜景灯笼临水，摇橹船穿桥而过', price: '¥150/联票', ctripUrl: 'https://you.ctrip.com/sight/wuzhen14/5200.html' },
                  { name: '东栅', desc: '原住民生活气息更浓，适合早上逛', price: '含联票' }
                ],
                foods: [
                  { name: '乌镇酱鸭', desc: '江南卤味，咸甜入味', price: '¥50/份' },
                  { name: '定胜糕', desc: '粉色米糕，软糯带豆沙', price: '¥10/块' }
                ],
                hotels: [
                  { name: '西栅临水民宿', desc: '开窗见河，夜景步行可达', price: '¥400/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/wuzhen14.html' }
                ],
                tips: '住西栅内可多次进出；东栅建议早上先去避开团队；摇橹船傍晚排队久；穿好走的鞋，石板路多。' }
            }
        ]
    },
    'H': {
        icon: '🌊', title: '海岛冲浪手', badge: '浪尖上的自由派',
        desc: '你的假期要有海、有风、有晒到发烫的沙滩。白天下海冲浪或浮潜，傍晚坐在岸边等日落，晚上就着海鲜和海风聊天，节奏跟着浪走。',
        routes: [
            { dest: '三亚 · 海岛冲浪度假', days: '5天4晚', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达三亚 → 三亚湾日落 → 海鲜晚餐' },
                { d: 'Day2', t: '亚龙湾沙滩 → 浮潜/游泳' },
                { d: 'Day3', t: '后海村冲浪体验 → 夜市' },
                { d: 'Day4', t: '蜈支洲岛一日游' },
                { d: 'Day5', t: '海边早餐 → 返程' }
              ],
              ai: { budget: '¥2,500-4,000/人', transport: '机场打车+景区班车，海岛可租电动车', hotel: '亚龙湾/后海村滨海酒店', bestTime: '10月-次年4月，避开台风季',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '抵达三亚 → 三亚湾椰梦长廊日落 → 海鲜排档晚餐' },
                  { d: 'Day2 全天', t: '亚龙湾沙滩 → 浮潜游泳 → 海边午休' },
                  { d: 'Day3 全天', t: '后海村冲浪体验课 → 海边夜市' },
                  { d: 'Day4 全天', t: '蜈支洲岛一日游（水上项目）' },
                  { d: 'Day5 上午', t: '海边早餐 → 返程' }
                ],
                attractions: [
                  { name: '亚龙湾', desc: '沙细水清，适合游泳和日光浴', price: '免费（项目另付）', ctripUrl: 'https://you.ctrip.com/sight/sanya14/5300.html' },
                  { name: '蜈支洲岛', desc: '海水能见度高，水上项目集中', price: '船票+门票¥144', ctripUrl: 'https://you.ctrip.com/sight/sanya14/5301.html' }
                ],
                foods: [
                  { name: '清补凉', desc: '椰奶冰沙配杂粮，解暑必备', price: '¥15/碗' },
                  { name: '海鲜糟粕醋', desc: '酸辣汤底涮海鲜，当地特色', price: '¥60/人' }
                ],
                hotels: [
                  { name: '亚龙湾滨海酒店', desc: '推窗见海，沙滩步行可达', price: '¥600/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/sanya14.html' }
                ],
                tips: '防晒做到位；海鲜先问价再点；冲浪新手选后海村；出海提前看天气和风浪；旺季机票酒店提前订。' }
            }
        ]
    },
    'I': {
        icon: '❄️', title: '冰雪追雪族', badge: '为一场雪奔赴远方',
        desc: '别人怕冷你追雪。你愿意为一片林海雪原、一座冰雕城堡坐很久的车，在零下的空气里看雪花落在肩头，那种通透感是夏天给不了的。',
        routes: [
            { dest: '哈尔滨 · 冰雪童话追雪', days: '4天3晚', img: 'https://images.unsplash.com/photo-1516731564534-6f6e6d8e8f63?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '中央大街 → 圣索菲亚教堂 → 马迭尔冰棍' },
                { d: 'Day2', t: '哈尔滨冰雪大世界 → 冰滑梯夜场' },
                { d: 'Day3', t: '雪乡穿越/亚布力滑雪' },
                { d: 'Day4', t: '早市逛吃 → 返程' }
              ],
              ai: { budget: '¥2,500-4,000/人', transport: '市区地铁+打车，雪乡/亚布力包车或旅游车', hotel: '中央大街附近酒店，保暖优先', bestTime: '12月-次年2月，冰雪大世界12月底开园',
                timeline: [
                  { d: 'Day1 下午-晚上', t: '中央大街面包石路 → 圣索菲亚教堂 → 马迭尔冰棍夜景' },
                  { d: 'Day2 全天', t: '哈尔滨冰雪大世界 → 冰滑梯与冰灯夜场' },
                  { d: 'Day3 全天', t: '雪乡穿越 或 亚布力滑雪场体验' },
                  { d: 'Day4 上午', t: '道外早市逛吃 → 返程' }
                ],
                attractions: [
                  { name: '哈尔滨冰雪大世界', desc: '巨型冰雕城堡，夜场灯光最壮观', price: '¥328/人', ctripUrl: 'https://you.ctrip.com/sight/harbin14/5400.html', wechatUrl: 'https://mp.weixin.qq.com/s/harbin-ice' },
                  { name: '圣索菲亚教堂', desc: '拜占庭风格红砖教堂，广场喂鸽子', price: '免费' }
                ],
                foods: [
                  { name: '锅包肉', desc: '酸甜酥脆，东北菜代表', price: '¥48/份' },
                  { name: '红肠', desc: '蒜香烟熏，可当伴手礼', price: '¥30/根' }
                ],
                hotels: [
                  { name: '中央大街暖炕酒店', desc: '市区核心，供暖好，出行方便', price: '¥350/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/harbin14.html' }
                ],
                tips: '羽绒服、帽子、手套、暖宝宝配齐；冰雪大世界晚上更冷；手机注意低温掉电；雪乡住宿提前订；滑雪装备可现场租。' }
            }
        ]
    },
    'J': {
        icon: '🚗', title: '公路漫游者', badge: '方向盘上的诗人',
        desc: '对你来说，路上的风景和目的地一样重要。你喜欢自己掌控车速，在开阔的公路上看云层移动，随时为一个值得停车的观景台靠边，环线才是你要的旅行。',
        routes: [
            { dest: '甘南 · 高原公路环线', days: '6天5晚', img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
              itinerary: [
                { d: 'Day1', t: '抵达兰州 → 取车 → 前往夏河' },
                { d: 'Day2', t: '拉卜楞寺 → 桑科草原' },
                { d: 'Day3', t: '扎尕那 → 山谷观景' },
                { d: 'Day4', t: '郎木寺镇 → 草原公路' },
                { d: 'Day5', t: '青海湖方向返程 → 沿途湖泊' },
                { d: 'Day6', t: '还车 → 返程' }
              ],
              ai: { budget: '¥3,000-4,500/人（含租车+油费+住宿）', transport: '兰州取还车SUV，环线约1500km，注意高反', hotel: '夏河/郎木寺镇客栈，条件简朴但干净', bestTime: '6-9月草原最绿，10月秋色',
                timeline: [
                  { d: 'Day1 下午', t: '抵达兰州 → 取车 → 驱车前往夏河入住' },
                  { d: 'Day2 全天', t: '拉卜楞寺转经 → 桑科草原公路慢行' },
                  { d: 'Day3 全天', t: '扎尕那石城 → 山谷观景台' },
                  { d: 'Day4 全天', t: '郎木寺镇 → 草原与河谷公路' },
                  { d: 'Day5 全天', t: '沿环线返程 → 沿途湖泊停靠拍照' },
                  { d: 'Day6 上午', t: '兰州还车 → 返程' }
                ],
                attractions: [
                  { name: '扎尕那', desc: '石城围合的藏寨，晨雾山谷出片', price: '¥80/人', ctripUrl: 'https://you.ctrip.com/sight/gannan14/5500.html' },
                  { name: '拉卜楞寺', desc: '藏传佛教格鲁派大寺，转经长廊很长', price: '¥40/人' }
                ],
                foods: [
                  { name: '藏式火锅', desc: '牦牛肉配高原蔬菜，暖身', price: '¥80/人' },
                  { name: '酥油茶', desc: '咸口暖身，初喝可尝试甜口', price: '¥15/壶' }
                ],
                hotels: [
                  { name: '郎木寺镇客栈', desc: '小镇集中，自驾落脚方便', price: '¥250/晚', ctripUrl: 'https://hotels.ctrip.com/hotels/gannan14.html' }
                ],
                tips: '高原行程慢开慢行，警惕高反；出发前检查车况与备胎；环线加油站提前规划；防晒防风；住宿条件有限，不要期待大城市标准。' }
            }
        ]
    },
});
