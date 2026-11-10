#!/usr/bin/env python3
"""批量生成 MYL 旅行城市详细攻略数据"""

# ========== 城市详细攻略数据 ==========
# 每个城市包含: itinerary(timeline), routePins, hotels, transport, foods, tips, budget

CITIES = {
    # ===== 出境游 =====
    "paris": {
        "name": "巴黎", "country": "法国", "days": "7天6晚",
        "routePins": ["戴高乐机场", "香榭丽舍", "卢浮宫", "塞纳河", "埃菲尔铁塔", "凡尔赛宫", "蒙马特", "老佛爷"],
        "itinerary": [
            {"day": "Day 1", "theme": "抵达巴黎 · 浪漫初遇", "timeline": [
                {"time": "14:00", "activity": "抵达戴高乐机场", "detail": "乘 RER B 线或打车前往酒店，建议住在左岸 Saint-Germain 区域", "duration": "约45分钟", "tip": "打车约50-70€，RER 约10€"},
                {"time": "16:00", "activity": "入住酒店 + 稍作休整", "detail": "推荐住左岸（6号线）或香榭丽舍附近（1号线），地铁出行最方便"},
                {"time": "18:30", "activity": "香榭丽舍大街漫步", "detail": "从协和广场走到凯旋门，傍晚华灯初上最美", "duration": "约2小时"},
                {"time": "21:00", "activity": "埃菲尔铁塔亮灯", "detail": "每整点闪灯5分钟，找战神广场或 Trocadéro 台阶观赏", "duration": "约30分钟", "tip": "晚上9/10/11点各闪一次"},
                {"time": "22:00", "activity": "法式晚餐", "detail": "附近小酒馆点一份法式牛排配红酒", "price": "约40-60€/人"},
            ]},
            {"day": "Day 2", "theme": "艺术宝库 · 卢浮宫深度游", "timeline": [
                {"time": "08:30", "activity": "早餐 + 出发卢浮宫", "detail": "附近咖啡馆吃可颂+咖啡，8:30 提前赶往卢浮宫排队", "tip": "周一闭馆！避开周一"},
                {"time": "09:30", "activity": "卢浮宫参观", "detail": "先看蒙娜丽莎 → 维纳斯 → 胜利女神三大镇馆之宝，再逛东方馆/绘画馆", "duration": "约3-4小时", "ticket": "€17"},
                {"time": "13:30", "activity": "午餐", "detail": "博物馆附近 Chez L'Ami Jean Basque 菜", "price": "约25€/人"},
                {"time": "15:00", "activity": "杜乐丽花园 → 协和广场", "detail": "从卢浮宫侧门出去就是杜乐丽，可租小船在池子里划水", "duration": "约2小时"},
                {"time": "18:00", "activity": "塞纳河游船", "detail": "Bateaux Mouches 游船，一小时，含语音讲解，夜景超美", "duration": "约1.5小时", "price": "€16-25"},
            ]},
            {"day": "Day 3", "theme": "埃菲尔铁塔 · 战神广场", "timeline": [
                {"time": "09:00", "activity": "埃菲尔铁塔登顶", "detail": "提前官网预约时间段，爬楼梯到2层或电梯直达顶层", "duration": "约2小时", "ticket": "€11-29", "tip": "官网提前1-2周订票，省20%"},
                {"time": "11:30", "activity": "战神广场野餐", "detail": "Carrefour 买奶酪+红酒+法棍，在草坪上晒太阳", "price": "约15€/人"},
                {"time": "14:00", "activity": "巴黎圣母院 + 拉丁区", "detail": "圣母院修复中外观仍可看，周边拉丁区小酒馆密度最高", "duration": "约2小时"},
                {"time": "17:00", "activity": "圣日耳曼德佩闲逛", "detail": "花神咖啡馆喝一杯，萨特和波伏娃的最爱", "duration": "约2小时"},
            ]},
            {"day": "Day 4", "theme": "凡尔赛宫一日游", "timeline": [
                {"time": "08:00", "activity": "乘 RER C 线去凡尔赛", "detail": "从 Paris Invalides 站上车，Versailles Château 站下车", "duration": "约45分钟", "price": "€8.4"},
                {"time": "09:30", "activity": "凡尔赛宫参观", "detail": "先看镜厅 → 国王寝宫 → 王后寝宫，再逛花园和大小特里阿农", "duration": "约5小时", "ticket": "€19（含花园通票）", "tip": "花园夏季有喷泉表演"},
                {"time": "15:00", "activity": "花园小憩", "detail": "租自行车逛花园深处，或乘小火车", "price": "自行车€12/时"},
                {"time": "17:30", "activity": "返回巴黎 + 晚餐", "detail": "回到市区休息，晚上找个小酒馆吃勃艮第红酒炖牛肉", "price": "约35€/人"},
            ]},
            {"day": "Day 5", "theme": "蒙马特高地 · 艺术气息", "timeline": [
                {"time": "09:00", "activity": "圣心大教堂", "detail": "白色圆顶的拜占庭风格教堂，登穹顶可俯瞰巴黎全景", "duration": "约1.5小时", "ticket": "教堂免费，穹顶€8"},
                {"time": "11:00", "activity": "画家广场 + 阿贝斯小巷", "detail": "街头画家为你画像（15-30€），小街里藏着很多精品画廊", "duration": "约2小时", "tip": "小心黑车司机搭讪"},
                {"time": "13:00", "activity": "中餐/日料午餐", "detail": "蒙马特吃西餐稍贵，推荐地铁2号线回市中心吃中餐", "price": "约20€/人"},
                {"time": "15:00", "activity": "老佛爷百货购物", "detail": "奥斯曼大道旗舰店，顶楼露台可拍照巴黎全景", "duration": "约2.5小时"},
                {"time": "18:30", "activity": "红磨坊之夜（可选）", "detail": "世界最著名的康康舞表演，需提前网上订座", "duration": "约2小时", "ticket": "€95-165"},
            ]},
            {"day": "Day 6", "theme": "自由活动 · 深度体验", "timeline": [
                {"time": "09:00", "activity": "奥赛博物馆（可选）", "detail": "印象派大师作品集中地，莫奈/梵高/雷诺阿", "duration": "约3小时", "ticket": "€16"},
                {"time": "13:00", "activity": "玛莱区逛街", "detail": "巴黎最潮的街区，犹太美食+复古小店+同性恋酒吧一条街", "duration": "约3小时"},
                {"time": "16:00", "activity": "巧克力/甜品店打卡", "detail": "La Maison du Chocolat 或 Pierre Hermé 的马卡龙", "price": "约10-15€"},
                {"time": "19:00", "activity": "告别晚餐", "detail": "找一家米其林推荐的小餐馆犒劳自己", "price": "约80-120€/人"},
            ]},
            {"day": "Day 7", "theme": "返程", "timeline": [
                {"time": "09:00", "activity": "自由活动 + 买伴手礼", "detail": "LAFayette 买香水化妆品，或机场免税店更便宜"},
                {"time": "12:00", "activity": "午餐 + 退房", "detail": "收拾行李，退房寄存"},
                {"time": "14:00", "activity": "前往戴高乐机场", "detail": "RER B 线或打车，提前3小时到机场", "duration": "约45分钟"},
                {"time": "17:00", "activity": "登机返程", "detail": "安检后逛免税店补购"},
            ]},
        ],
        "hotels": [
            {"name": "Hôtel Odéon Saint-Germain", "tier": "舒适型", "price": "约 €180-280/晚", "area": "左岸·6号线 Odéon 站", "highlight": "位置绝佳，出门就是咖啡馆林立的圣日耳曼广场，步行到卢浮宫15分钟"},
            {"name": "Hôtel Le Scribe Paris Opéra MGallery", "tier": "奢华型", "price": "约 €350-500/晚", "area": "歌剧院区·9号线 Opéra 站", "highlight": "五星级历史建筑，紧邻老佛爷和旺多姆广场，顶楼露台能拍全景"},
            {"name": "Hôtel du Nord Le Parige", "tier": "经济型", "price": "约 €90-150/晚", "area": "圣马丁运河·5号线", "highlight": "文艺青年聚集地，周边小酒吧和独立书店林立，性价比很高"},
        ],
        "transport": [
            {"label": "机场→市区", "value": "CDG 机场乘 RER B 线直达市中心（约 €10/人，45分钟）；或打车约 €50-70（30分钟）。可提前预订接机"},
            {"label": "市内交通", "value": "地铁最方便，单张票 €2.1，建议买 Navigo Easy 卡（€5工本费）或 Mobilis 日票（€8.4）"},
            {"label": "打车注意", "value": "夜间打车加价 20%，不要在机场/景点门口拦黑车，用 Uber 或排队的出租车"},
        ],
        "foods": [
            {"name": "法式可颂（Croissant）", "desc": "早餐首选，搭配咖啡。推荐 Du Pain et des Idées（圣马丁运河区）", "price": "€1.5-2.5"},
            {"name": "法式蜗牛（Escargot）", "desc": "蒜香黄油焗蜗牛，法餐经典前菜", "price": "€12-18/份"},
            {"name": "鹅肝（Foie Gras）", "desc": "煎鹅肝配无花果酱，入口即化", "price": "€20-30/份"},
            {"name": "法式焦糖布丁（Crème Brûlée）", "desc": "用喷枪烤焦糖层，经典甜品", "price": "€8-12"},
            {"name": "可丽饼（Crêpe）", "desc": "甜口配草莓奶油，咸口配火腿奶酪", "price": "€5-12"},
        ],
        "tips": [
            "地铁票不要弄丢，出站不会查但被查无票罚款 €50",
            "周一很多博物馆闭馆（卢浮宫、奥赛、毕加索），行程要绕开",
            "Eiffel 塔门票官网提前订便宜，现场排队超1小时",
            "不要在蒙马特高地、圣心堂附近单独走偏僻小路，注意扒手",
            "法国餐厅小费：好服务给 5-10%，不是强制的",
            "餐厅午休时间 12:00-14:30，晚餐 19:00 后才开门",
            "买巴黎博物馆通票（Passeport 2天€42/4天€56），划算但排队",
        ],
        "budget": [
            {"label": "机票", "value": "¥3,500-5,500"},
            {"label": "住宿", "value": "¥800-2,500/晚"},
            {"label": "餐饮", "value": "¥300-600/天"},
            {"label": "门票", "value": "¥500-1,000"},
            {"label": "交通", "value": "¥100-200"},
            {"label": "购物", "value": "¥1,000+（可选）"},
            {"label": "合计", "value": "¥12,000-25,000"},
        ],
    },

    # ===== 亚洲热门 =====
    "tokyo": {
        "name": "东京", "country": "日本", "days": "6天5晚",
        "routePins": ["成田机场", "新宿", "涩谷", "浅草", "秋叶原", "富士山", "迪士尼", "银座"],
        "itinerary": [
            {"day": "Day 1", "theme": "抵达东京 · 新宿夜色", "timeline": [
                {"time": "14:00", "activity": "抵达成田/羽田机场", "detail": "羽田机场单轨电车到滨松町约30分钟¥480；成田机场 N'EX 到东京站约60分钟¥3,020", "duration": "约30-60分钟"},
                {"time": "16:00", "activity": "入住酒店 + 休息", "detail": "推荐住新宿/涩谷/银座附近，山手线沿线最方便"},
                {"time": "18:00", "activity": "新宿歌舞伎町 + 都厅夜景", "detail": "东京都厅45层免费展望台可俯瞰整个东京湾", "duration": "约2小时"},
                {"time": "20:00", "activity": "日式居酒屋晚餐", "detail": "新宿黄金街小酒馆，烤串+清酒，体验当地氛围", "price": "¥200-400/人"},
            ]},
            {"day": "Day 2", "theme": "浅草 · 秋叶原 · 传统与现代", "timeline": [
                {"time": "09:00", "activity": "浅草寺 + 雷门", "detail": "东京最古老的寺庙，仲见世商店街买和服、人形烧", "duration": "约2小时"},
                {"time": "11:00", "activity": "秋叶原动漫街", "detail": "手办、漫画、女仆咖啡、JR 模型、游戏机，逛3小时也不够", "duration": "约3小时", "tip": "女仆咖啡约¥1,500-2,000/人"},
                {"time": "14:00", "activity": "午餐：拉面/咖喱饭", "detail": "秋叶原拉面横町或 Coco Ichibanya 咖喱饭", "price": "¥80-150"},
                {"time": "15:30", "activity": "东京塔 or 晴空塔", "detail": "晴空塔350米天望回廊¥2,100，东京塔150米¥1,200", "duration": "约2小时", "ticket": "¥1,200-2,100"},
            ]},
            {"day": "Day 3", "theme": "涩谷 · 原宿 · 潮流街区", "timeline": [
                {"time": "09:00", "activity": "明治神宫 + 代代木公园", "detail": "市中心的自然绿洲，周末可能有传统日式婚礼", "duration": "约1.5小时"},
                {"time": "11:00", "activity": "原宿竹下通 + 表参道", "detail": "竹下通潮流小店，表参道高端品牌，中间有猫街", "duration": "约3小时"},
                {"time": "14:00", "activity": "涩谷十字路口 + 忠犬八公", "detail": "全球最著名的十字路口，SHIBUYA SKY 楼顶拍全景", "duration": "约2小时", "ticket": "SHIBUYA SKY ¥1,800"},
                {"time": "17:00", "activity": "银座购物 + 晚餐", "detail": "三越/松屋百货奢侈品，或博多一风堂拉面", "price": "购物¥500起，晚餐¥300"},
            ]},
            {"day": "Day 4", "theme": "富士山一日游", "timeline": [
                {"time": "07:30", "activity": "新宿出发去富士山", "detail": "富士回游号（Fuji Excursion）直达河口湖，或高速巴士", "duration": "约2.5小时", "price": "¥4,130（富士回游号）"},
                {"time": "10:00", "activity": "富士山五合目", "detail": "天气好能看到完美的倒富士，约2,305米海拔", "duration": "约2小时", "ticket": "观光巴士¥2,100"},
                {"time": "13:00", "activity": "忍野八海 + 河口湖", "detail": "忍野八海是8个清澈水池，河口湖边远眺富士山", "duration": "约3小时"},
                {"time": "16:30", "activity": "温泉体验 + 晚餐", "detail": "日式温泉旅馆住一晚或日归温泉", "price": "日归¥1,500-2,000"},
                {"time": "20:00", "activity": "返回东京", "detail": "建议大巴，富士回游号可能没票", "duration": "约3小时"},
            ]},
            {"day": "Day 5", "theme": "迪士尼乐园 / 海洋", "timeline": [
                {"time": "08:00", "activity": "JR 京叶线前往迪士尼", "detail": "东京站到舞滨站约15分钟¥210，乐园开门前30分钟到", "duration": "约15分钟"},
                {"time": "09:00", "activity": "迪士尼乐园 / 海洋", "detail": "Land 适合亲子，Sea 适合年轻人。先玩热门项目拿 FAST PASS", "duration": "全天", "ticket": "¥8,400-9,900"},
                {"time": "20:00", "activity": "烟花表演 + 返程", "detail": "晚上约21:00 烟花，不要错过。返程可能人多"},
            ]},
            {"day": "Day 6", "theme": "自由活动 · 返程", "timeline": [
                {"time": "09:00", "activity": "上野公园 + 阿美横町", "detail": "上野动物园、博物馆，阿美横町买电器/零食/药妆", "duration": "约3小时"},
                {"time": "12:00", "activity": "退房 + 午餐", "detail": "酒店退房，行李寄存在机场"},
                {"time": "14:00", "activity": "机场购物 + 返程", "detail": "成田/羽田机场免税店，安检后登机"},
            ]},
        ],
        "hotels": [
            {"name": "新宿格拉斯丽酒店 (Hotel Gracery Shinjuku)", "tier": "舒适型", "price": "约 ¥15,000-25,000/晚", "area": "新宿中心·8/9线换乘", "highlight": "楼顶有哥斯拉雕像，位置超便利，步行到歌舞伎町5分钟"},
            {"name": "东京柏悦酒店 (Park Hyatt Tokyo)", "tier": "奢华型", "price": "约 ¥60,000+/晚", "area": "西新宿·都厅旁", "highlight": "五星级奢华酒店，电影《迷失东京》取景地，顶楼新世界酒吧俯瞰东京"},
            {"name": "东横 INN（新宿歌舞伎町）", "tier": "经济型", "price": "约 ¥7,000-10,000/晚", "area": "新宿歌舞伎町·9号线", "highlight": "日本连锁商务酒店，干净便捷，早餐免费，每晚¥5000左右"},
        ],
        "transport": [
            {"label": "机场→市区", "value": "羽田：单轨电车¥480或京急¥410到滨松町；成田：N'EX直达东京站¥3,020（建议提前订）"},
            {"label": "市内交通", "value": "JR Pass（外国游客限定）¥29,650/7天可坐 JR 全线；SUICA/PASMO 卡（¥500押金）通用地铁+公交+便利店"},
            {"label": "打车注意", "value": "日本打车很贵！起步价¥710，2公里后¥90/300米，深夜加价20%。建议用地铁"},
        ],
        "foods": [
            {"name": "拉面", "desc": "豚骨酱油味噌三种，推荐一风堂/二郎/AFURI 柚子盐", "price": "¥800-1,500"},
            {"name": "寿司", "desc": "筑地市场/银座高级寿司店，回转寿司¥100/盘起", "price": "¥1,500-10,000+/人"},
            {"name": "天妇罗", "desc": "炸虾/蔬菜，蘸萝卜泥酱油", "price": "¥2,000-5,000"},
            {"name": "居酒屋烤串", "desc": "Yakitori 烤鸡肉串，配生啤", "price": "¥150-300/串"},
            {"name": "寿喜烧/怀石料理", "desc": "高级日式料理，需要提前预约", "price": "¥5,000-20,000/人"},
        ],
        "tips": [
            "日本所有地铁都有英文站名，不会迷路",
            "车站里的自动贩卖机是救命稻草，饮料¥100-150",
            "东京迪士尼建议购买 FAST PASS 避免排队2小时以上",
            "富士山五合目天气多变，夏天也要带薄外套",
            "日本便利店（7-11/全家/Lawson）可以交话费、打印、存行李，是万能的",
            "富士回游号是指定席，必须提前买！现场大概率没票",
            "日本酒店按人收费不是按房间，双人房单人住更划算",
        ],
        "budget": [
            {"label": "机票", "value": "¥1,500-3,500"},
            {"label": "住宿", "value": "¥400-1,500/晚"},
            {"label": "餐饮", "value": "¥200-500/天"},
            {"label": "门票", "value": "¥500-1,500"},
            {"label": "交通", "value": "¥500-1,500"},
            {"label": "购物", "value": "¥1,000+（药妆/数码）"},
            {"label": "合计", "value": "¥6,000-20,000"},
        ],
    },

    "bali": {
        "name": "巴厘岛", "country": "印尼", "days": "5天4晚",
        "routePins": ["登巴萨机场", "库塔", "金巴兰", "情人崖", "海神庙", "乌布", "蓝梦岛"],
        "itinerary": [
            {"day": "Day 1", "theme": "抵达 · 金巴兰日落海鲜", "timeline": [
                {"time": "14:00", "activity": "抵达登巴萨机场", "detail": "打车到金巴兰/库塔约30分钟，约RP 80,000-150,000（¥40-80）", "tip": "机场提前换点印尼盾或用 Grab 打车"},
                {"time": "16:00", "activity": "入住酒店 + 海滩漫步", "detail": "金巴兰公共海滩很干净，旁边就是海鲜大排档一条街"},
                {"time": "18:30", "activity": "金巴兰日落海鲜晚餐", "detail": "海边大排档吃烤虾烤蟹烤鱼配米饭，边看日落边吃", "price": "约¥80-150/人", "tip": "提前去占好靠近海边的位置"},
            ]},
            {"day": "Day 2", "theme": "情人崖 · 乌鲁瓦图", "timeline": [
                {"time": "09:00", "activity": "包车前往乌鲁瓦图情人崖", "detail": "酒店包车一日游RP 400,000-500,000（¥200-250）", "duration": "约1小时"},
                {"time": "10:30", "activity": "情人崖悬崖徒步", "detail": "壮观的印度洋悬崖，注意安全不要靠近边缘", "duration": "约1.5小时", "ticket": "RP 30,000"},
                {"time": "13:00", "activity": "午餐：Jimbaran Seafood", "detail": "乌鲁瓦图附近高档海鲜餐厅", "price": "¥100-150"},
                {"time": "15:00", "activity": "BALI SWING 大秋千（可选）", "detail": "网红打卡点，在悬崖上荡秋千拍照", "duration": "约1小时", "ticket": "¥80-120"},
                {"time": "18:00", "activity": "返回金巴兰", "detail": "途中经过超市买水果零食", "price": "热带水果超便宜"},
            ]},
            {"day": "Day 3", "theme": "乌布文化之旅", "timeline": [
                {"time": "08:30", "activity": "包车前往乌布", "detail": "约1.5小时车程，沿途可看梯田风光", "duration": "约1.5小时"},
                {"time": "10:30", "activity": "乌布皇宫 + 圣猴森林", "detail": "猴子会抢你手里的食物！戴太阳镜/帽子小心被摘", "duration": "约2小时", "ticket": "皇宫免费，猴林RP 50,000"},
                {"time": "13:00", "activity": "乌布艺术市场午餐", "detail": "传统印尼菜 Nasi Goreng 或 Bebek Betutu", "price": "¥50-100"},
                {"time": "14:30", "activity": "德格拉朗梯田 + 下午茶", "detail": "世界文化遗产，找一家梯田景观咖啡馆", "duration": "约1.5小时"},
                {"time": "17:00", "activity": "SPA 放松", "detail": "乌布是SPA之都，Balinese Massage 约¥80-200/90分钟", "price": "¥80-200"},
                {"time": "20:00", "activity": "乌布特色晚宴", "detail": "Lotus Pond 餐厅，传统舞蹈表演", "price": "¥120-200"},
            ]},
            {"day": "Day 4", "theme": "蓝梦岛浮潜一日游", "timeline": [
                {"time": "08:00", "activity": "包车到沙努尔码头 + 快艇上岛", "detail": "约20分钟快艇，记得吃晕船药", "duration": "约20分钟"},
                {"time": "09:00", "activity": "浮潜 / 潜水", "detail": "岛周围有三个浮潜点，能看到魔鬼鱼、珊瑚礁、热带鱼群", "duration": "约2-3小时", "price": "浮潜含装备¥80-150"},
                {"time": "12:00", "activity": "岛上午餐 + 自由活动", "detail": "岛上小餐馆，可选海边俱乐部休息", "price": "¥50-100"},
                {"time": "14:00", "activity": "环岛游 + 下午茶", "detail": "租摩托车或坐 buggy 环岛，看红树林、悬崖", "price": "摩托车¥50/天"},
                {"time": "16:30", "activity": "返回本岛 + 晚餐", "detail": "回酒店休息，晚上找个安静的海滩酒吧坐坐"},
            ]},
            {"day": "Day 5", "theme": "海神庙 · 返程", "timeline": [
                {"time": "09:00", "activity": "海神庙（可选）", "detail": "建在海上礁石上的寺庙，潮汐时被海水包围", "duration": "约1.5小时", "ticket": "RP 50,000"},
                {"time": "11:00", "activity": "库塔购物 + 午餐", "detail": "Discovery 商场买伴手礼（香氛/精油/蜡染）", "price": "约¥100-200"},
                {"time": "14:00", "activity": "前往机场返程", "detail": "提前2.5-3小时到机场，国内航班更松"},
            ]},
        ],
        "hotels": [
            {"name": "The Ritz-Carlton, Bali", "tier": "奢华型", "price": "约 ¥2,500-4,000/晚", "area": "金巴兰海湾·私人悬崖", "highlight": "五星级悬崖度假村，无边泳池正对印度洋，蜜月首选，每间别墅都有私人泳池"},
            {"name": "Bali Mandira Beach Resort & Spa", "tier": "舒适型", "price": "约 ¥800-1,500/晚", "area": "库塔海滩·步行2分钟", "highlight": "出门就是库塔海滩和购物街，泳池有小瀑布，性价比高"},
            {"name": "Puri Garden Hotel", "tier": "经济型", "price": "约 ¥200-400/晚", "area": "乌布·猴林门口", "highlight": "传统峇里风格，带小院和泳池，走路5分钟到猴林，早餐超好"},
        ],
        "transport": [
            {"label": "机场→市区", "value": "Grab/Gojek 打车约¥40-80（30分钟），机场官方出租贵一倍。包车一日游约¥200-300"},
            {"label": "市内交通", "value": "巴厘岛没有公共交通，主要靠：1. 包车（含司机¥200-300/天）2. Grab/Gojek 打车 3. 租摩托（¥50/天，需国际驾照）"},
            {"label": "蓝梦岛/佩尼达岛", "value": "沙努尔码头快艇20分钟，往返含浮潜¥80-150。淡季风浪大可能停航"},
        ],
        "foods": [
            {"name": "Nasi Goreng（印尼炒饭）", "desc": "加煎蛋和辣酱，全球最有名的印尼菜", "price": "¥15-30"},
            {"name": "Bebek Betutu（烤鸭）", "desc": "巴厘岛传统菜，鸭子用香茅等草药烹制4小时", "price": "¥40-80"},
            {"name": "沙爹（Satay）", "desc": "烤鸡肉串配花生酱和米饭", "price": "¥5-15/串"},
            {"name": "Babi Guling（烤乳猪）", "desc": "巴厘岛节庆必吃，酥脆外皮", "price": "¥50-100"},
            {"name": "Jamu（草药饮品）", "desc": "本地传统养生饮料，微苦但健康", "price": "¥5-10"},
        ],
        "tips": [
            "必须带防晒霜 SPF50+，巴厘岛紫外线超强，1小时就晒伤",
            "海边/寺庙对着装有要求：短裤/无袖需围纱笼进寺庙，门口可以租¥10",
            "给小费：SPA/包车/机场行李员给 Rp 10,000-20,000（¥5-10）足够",
            "不要喝自来水，买瓶装水（¥3-5）",
            "机场和景点的 ATM 优先取印尼盾，汇率最好",
            "蓝梦岛/佩尼达岛浮潜请穿救生衣，深水区有暗流",
            "Grab 打车用信用卡或绑定支付，比现金方便",
        ],
        "budget": [
            {"label": "机票", "value": "¥1,800-3,500"},
            {"label": "住宿", "value": "¥150-3,000/晚"},
            {"label": "餐饮", "value": "¥80-300/天"},
            {"label": "门票", "value": "¥200-500"},
            {"label": "交通", "value": "¥300-500（包车3天）"},
            {"label": "合计", "value": "¥4,500-15,000"},
        ],
    },

    # ===== 国内热门 =====
    "beijing": {
        "name": "北京", "country": "中国", "days": "5天4晚",
        "routePins": ["大兴/首都机场", "前门", "天安门", "故宫", "景山", "八达岭长城", "颐和园", "天坛", "什刹海"],
        "itinerary": [
            {"day": "Day 1", "theme": "中轴线 · 故宫紫禁城", "timeline": [
                {"time": "07:00", "activity": "天安门升旗仪式", "detail": "查好当日升旗时间（www.tiananmen.org.cn），提前1小时到广场，安检排队", "duration": "约30分钟", "tip": "安检不能带水、打火机、自拍杆"},
                {"time": "08:00", "activity": "故宫博物院", "detail": "提前7天在「故宫博物院」公众号约票（¥60），走午门进，先逛中轴线（太和-中和-保和-乾清-坤宁-御花园）", "duration": "约4小时", "ticket": "¥60（全馆通票）"},
                {"time": "12:00", "activity": "故宫内午餐", "detail": "冰窖餐厅/角楼咖啡（网红），或自带面包（景区里的餐厅都排队）", "price": "¥50-100"},
                {"time": "14:00", "activity": "珍宝馆 + 钟表馆", "detail": "各¥10，珍宝馆看九龙壁、金编钟，钟表馆每天11点、14点有钟表演示", "duration": "约1.5小时"},
                {"time": "15:30", "activity": "景山公园俯瞰故宫", "detail": "登万春亭（南门¥2、登塔¥10），拍故宫全景最佳位置", "duration": "约1小时", "ticket": "¥2"},
                {"time": "17:00", "activity": "什刹海 + 后海酒吧街", "detail": "胡同里坐三轮车，晚上找个小酒吧听听民谣", "price": "酒吧¥80-200"},
                {"time": "19:00", "activity": "晚饭 + 酒店休息", "detail": "什刹海南门全聚德烤鸭或南门涮肉", "price": "¥150-250/人"},
            ]},
            {"day": "Day 2", "theme": "八达岭长城 · 奥林匹克公园", "timeline": [
                {"time": "07:30", "activity": "出发八达岭长城", "detail": "德胜门坐877路空调公交（¥12现金），直达八达岭，约1.5小时。早走避免大部队", "duration": "约1.5小时"},
                {"time": "09:30", "activity": "八达岭长城", "detail": "建议买缆车票（¥40）上北八楼，步行下来（约3小时），好汉坡必打卡", "duration": "约4小时", "ticket": "¥40（门票）+¥40（缆车）"},
                {"time": "13:30", "activity": "返程 + 午餐", "detail": "回市区在德胜门下车，附近护国寺小吃吃京味小吃", "price": "¥50-100"},
                {"time": "15:30", "activity": "奥林匹克公园", "detail": "鸟巢¥50、水立方¥30，登鸟巢顶¥120。傍晚夜景更美", "duration": "约2小时", "ticket": "鸟巢¥50 水立方¥30"},
                {"time": "18:30", "activity": "鸟巢附近晚餐", "detail": "新奥购物中心美食广场，或打车回市区吃火锅", "price": "¥80-150"},
            ]},
            {"day": "Day 3", "theme": "颐和园 · 圆明园 · 清华北大", "timeline": [
                {"time": "08:30", "activity": "颐和园", "detail": "地铁4号线北宫门站出，进北宫门 → 苏州街 → 四大部洲 → 佛香阁 → 长廊 → 十七孔桥 → 东宫门出", "duration": "约5小时", "ticket": "¥30（旺季）+¥10（佛香阁）"},
                {"time": "13:30", "activity": "午餐：五道口", "detail": "清华/北大附近的留学生美食区，各国料理云集", "price": "¥50-100"},
                {"time": "15:00", "activity": "圆明园遗址公园", "detail": "走西洋楼遗址区，看大水法遗址。可以坐船", "duration": "约2小时", "ticket": "¥25（通票）"},
                {"time": "17:00", "activity": "清华/北大门口打卡", "detail": "疫情后需要提前预约入校，校外只能在门口拍照", "tip": "北大门口黄牛说能带进校别信"},
                {"time": "19:00", "activity": "晚餐：簋街", "detail": "小龙虾、麻辣烫、烤鱼一条街，营业到凌晨", "price": "¥100-200"},
            ]},
            {"day": "Day 4", "theme": "天坛 · 南锣鼓巷 · 胡同文化", "timeline": [
                {"time": "08:30", "activity": "天坛公园", "detail": "地铁5号线天坛东门站，买联票（¥34含祈年殿回音壁圜丘），看老北京晨练", "duration": "约3小时", "ticket": "¥15（门票）+¥19（联票）"},
                {"time": "11:30", "activity": "午餐：大碗居老北京菜", "detail": "天坛东门附近的老字号，炸酱面、驴打滚、焦圈", "price": "¥60-100"},
                {"time": "13:30", "activity": "南锣鼓巷 + 鼓楼 + 烟袋斜街", "detail": "胡同深度游！推荐坐三轮车（1小时¥150-200），或者自己逛。重点看帽儿胡同35/37号可园", "duration": "约4小时"},
                {"time": "16:30", "activity": "恭王府（可选）", "detail": "和珅的府邸，比故宫小但豪华，¥40门票", "duration": "约1.5小时", "ticket": "¥40"},
                {"time": "18:30", "activity": "晚餐：张妈妈烤肉/烤肉刘", "detail": "老北京炙子烤肉，配北冰洋汽水", "price": "¥100-200/人"},
            ]},
            {"day": "Day 5", "theme": "自由活动 · 返程", "timeline": [
                {"time": "09:00", "activity": "798艺术区（可选）", "detail": "文艺青年必去，免费，工厂改造的艺术区，有好咖啡", "duration": "约2小时"},
                {"time": "11:30", "activity": "午餐 + 收拾行李", "detail": "酒店退房，行李寄存在前台或车站"},
                {"time": "13:30", "activity": "国家博物馆（可选）", "detail": "免费但要提前1-7天公众号约票，周一闭馆", "duration": "约3小时"},
                {"time": "16:00", "activity": "前往机场/高铁站", "detail": "大兴机场：大兴机场线¥35直达。首都机场：机场快轨¥25。高铁建议北京南站", "duration": "约1-1.5小时"},
            ]},
        ],
        "hotels": [
            {"name": "北京华尔道夫酒店 (Waldorf Astoria Beijing)", "tier": "奢华型", "price": "约 ¥1,800-3,500/晚", "area": "王府井·8号线", "highlight": "就在王府井步行街北边，步行5分钟到天安门，五星级奢华服务，早餐有中式北京小吃"},
            {"name": "如家精选酒店（前门步行街店）", "tier": "舒适型", "price": "约 ¥400-600/晚", "area": "前门·2/8号线", "highlight": "出门就是前门步行街，步行15分钟到天安门，周边胡同多，早餐含烤鸭自助"},
            {"name": "青旅·北平国际青年旅舍", "tier": "经济型", "price": "约 ¥100-250/床位", "area": "南锣鼓巷·胡同里", "highlight": "四合院改造的青旅，氛围超棒，南锣鼓巷步行5分钟，公共区域认识各国旅行者"},
        ],
        "transport": [
            {"label": "机场→市区", "value": "大兴机场线（草桥/北京南站换）¥35；首都机场快轨（东直门换）¥25；打车¥80-150（约1小时）"},
            {"label": "市内交通", "value": "地铁2元起，推荐办北京一卡通或用亿通行APP。公交¥1-2（需刷码）。打车起步价¥13/3公里"},
            {"label": "长城", "value": "最方便：德胜门877路直达八达岭（¥12现金）。最舒服：包车¥500-800含司机。慕田峪长城风景更美"},
        ],
        "foods": [
            {"name": "北京烤鸭", "desc": "全聚德（老字号，¥300+/套）、大董（果木烤鸭，¥350+/套）、四季民福（性价比高）", "price": "¥150-400/套"},
            {"name": "炸酱面", "desc": "老北京早餐，六必居干黄酱+甜面酱，配黄瓜丝/心里美萝卜/豆芽", "price": "¥15-30"},
            {"name": "卤煮火烧", "desc": "小肠/肺/豆腐/火烧炖在一起，老北京深夜食堂", "price": "¥25-40"},
            {"name": "豆汁焦圈", "desc": "北京人最爱外地人最受不了，酸臭的绿豆汁配脆焦圈", "price": "¥10-20"},
            {"name": "涮羊肉", "desc": "东来顺/南门涮肉，铜锅炭火，麻酱小料", "price": "¥120-250/人"},
        ],
        "tips": [
            "故宫必须提前7天在公众号约！现场根本没票，黄牛票加价50%以上",
            "天安门升旗每天时间不同，www.tiananmen.org.cn查询，比日出时间早1小时到",
            "国庆/春节期间所有景点人爆满，建议避开；淡季1-2月反而有味道",
            "北京冬天冷到 -15°C，夏天热到 40°C，带好装备",
            "胡同游坐三轮车一定要提前讲好价，一个胡同绕一圈15分钟¥80-100",
            "长城游览尽量早出发，10点后大部队上来拍照都要排队",
            "国博免费但必须提前约票，约不上就看不成",
        ],
        "budget": [
            {"label": "大交通", "value": "¥800-1,500"},
            {"label": "住宿", "value": "¥250-1,800/晚"},
            {"label": "餐饮", "value": "¥150-300/天"},
            {"label": "门票", "value": "¥300-600"},
            {"label": "交通", "value": "¥200-500（长城包车）"},
            {"label": "合计", "value": "¥3,000-12,000"},
        ],
    },
}


def esc(s):
    """转义 JS 字符串中的特殊字符"""
    return str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('\r', ' ')


def generate_city_js():
    """生成 city-data.js"""
    lines = []
    lines.append("// ========== MYL 旅行 - 城市详细攻略数据 ==========")
    lines.append("// 每个城市包含: 行程时间线 / 路线可视化 / 酒店推荐 / 交通 / 美食 / 小贴士 / 预算")
    lines.append("")
    lines.append("window.CITY_DETAIL = {")

    for key, city in CITIES.items():
        lines.append(f"    // ===== {city['name']} ===== ")
        lines.append(f"    '{key}': {{")
        lines.append(f"        name: '{esc(city['name'])}',")
        lines.append(f"        country: '{esc(city['country'])}',")
        lines.append(f"        days: '{esc(city['days'])}',")

        # routePins
        pins_str = "', '".join(esc(p) for p in city['routePins'])
        lines.append(f"        routePins: ['{pins_str}'],")
        lines.append("")

        # itinerary with timeline
        lines.append("        itinerary: [")
        for day in city['itinerary']:
            lines.append(f"            {{ day: '{esc(day['day'])}', theme: '{esc(day['theme'])}', timeline: [")
            for t in day['timeline']:
                meta_parts = [f"time: '{esc(t['time'])}'", f"activity: '{esc(t['activity'])}'", f"detail: '{esc(t['detail'])}'"]
                if 'duration' in t:
                    meta_parts.append(f"duration: '{esc(t['duration'])}'")
                if 'ticket' in t:
                    meta_parts.append(f"ticket: '{esc(t['ticket'])}'")
                if 'price' in t:
                    meta_parts.append(f"price: '{esc(t['price'])}'")
                if 'tip' in t:
                    meta_parts.append(f"tip: '{esc(t['tip'])}'")
                lines.append(f"                {{ {', '.join(meta_parts)} }},")
            lines.append(f"            ] }},")
        lines.append("        ],")
        lines.append("")

        # hotels
        lines.append("        hotels: [")
        for h in city['hotels']:
            lines.append(f"            {{ name: '{esc(h['name'])}', tier: '{esc(h['tier'])}', price: '{esc(h['price'])}', area: '{esc(h['area'])}', highlight: '{esc(h['highlight'])}' }},")
        lines.append("        ],")
        lines.append("")

        # transport
        lines.append("        transport: [")
        for t in city['transport']:
            lines.append(f"            {{ label: '{esc(t['label'])}', value: '{esc(t['value'])}' }},")
        lines.append("        ],")
        lines.append("")

        # foods
        lines.append("        foods: [")
        for f in city['foods']:
            lines.append(f"            {{ name: '{esc(f['name'])}', desc: '{esc(f['desc'])}', price: '{esc(f['price'])}' }},")
        lines.append("        ],")
        lines.append("")

        # tips
        lines.append("        tips: [")
        for tip in city['tips']:
            lines.append(f"            '{esc(tip)}',")
        lines.append("        ],")
        lines.append("")

        # budget
        lines.append("        budget: [")
        for b in city['budget']:
            lines.append(f"            {{ label: '{esc(b['label'])}', value: '{esc(b['value'])}' }},")
        lines.append("        ],")

        lines.append("    },")
        lines.append("")

    # 富数据渲染函数（HTML 属性用双引号，避免和 JS 单引号冲突）
    render_fn = r'''
// ========== 富数据渲染函数 ==========
window.renderRichDetail = function(data) {
    if (!data) return '';

    const safe = (v) => String(v == null ? '' : v).replace(/[<>"&]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c])
    );

    // 路线可视化
    const routePins = (data.routePins || []).map((pin, i) =>
        `<span class="route-pin"><span class="pin-num">${i + 1}</span>${safe(pin)}</span>`
    ).join('<span class="route-arrow">→</span>');
    const routeHtml = routePins ? `
        <div class="route-visual">
            <div class="route-visual-title"><i class="fas fa-route"></i> 推荐游玩路线</div>
            <div class="route-pins">${routePins}</div>
        </div>` : '';

    // 行程时间线
    const itineraryHtml = (data.itinerary || []).map(day => {
        const timeline = (day.timeline || []).map(item => {
            const metas = [];
            if (item.duration) metas.push(`<span class="meta-tag duration"><i class="fas fa-clock"></i> ${safe(item.duration)}</span>`);
            if (item.ticket) metas.push(`<span class="meta-tag ticket"><i class="fas fa-ticket-alt"></i> ${safe(item.ticket)}</span>`);
            if (item.price) metas.push(`<span class="meta-tag"><i class="fas fa-yen-sign"></i> ${safe(item.price)}</span>`);
            if (item.tip) metas.push(`<span class="meta-tag tip"><i class="fas fa-lightbulb"></i> ${safe(item.tip)}</span>`);
            return `
                <div class="timeline-item">
                    <div class="time">${safe(item.time)}</div>
                    <div class="activity">${safe(item.activity)}</div>
                    <div class="detail">${safe(item.detail)}</div>
                    ${metas.length ? `<div class="meta-row">${metas.join('')}</div>` : ''}
                </div>`;
        }).join('');
        return `
            <div class="itinerary-day">
                <h4><span class="day-tag">${safe(day.day)}</span>${safe(day.theme || '')}</h4>
                <div class="day-timeline">${timeline}</div>
            </div>`;
    }).join('');

    // 酒店推荐
    const tierMap = { economy: '经济型', comfort: '舒适型', luxury: '奢华型' };
    const hotelsHtml = (data.hotels || []).map(h => `
            <div class="hotel-card">
                <div class="hotel-tier-badge ${safe(h.tier)}">${tierMap[h.tier] || safe(h.tier)}</div>
                <div class="hotel-info">
                    <h5>${safe(h.name)} <span class="price">${safe(h.price)}</span></h5>
                    <div class="area"><i class="fas fa-map-marker-alt"></i> ${safe(h.area)}</div>
                    <div class="highlight">${safe(h.highlight)}</div>
                </div>
            </div>`).join('');

    // 交通指南
    const transportHtml = (data.transport || []).map(t => `
        <div class="transport-item">
            <div class="label">${safe(t.label)}</div>
            <div class="value">${safe(t.value)}</div>
        </div>`).join('');

    // 美食推荐
    const foodsHtml = (data.foods || []).map(f =>
        `<li><strong>${safe(f.name)}</strong> — ${safe(f.desc)} <em style="color:var(--primary);font-weight:600">${safe(f.price)}</em></li>`
    ).join('');

    // 小贴士
    const tipsHtml = (data.tips || []).map(t => `<li>${safe(t)}</li>`).join('');

    // 预算
    const budgetHtml = (data.budget || []).map(b => `
        <div class="budget-item"><div class="label">${safe(b.label)}</div><div class="value">${safe(b.value)}</div></div>
    `).join('');

    return `
        ${routeHtml}

        <div class="modal-section">
            <h3><i class="fas fa-calendar-day"></i> 每日行程安排</h3>
            ${itineraryHtml}
        </div>

        <div class="modal-section">
            <h3><i class="fas fa-hotel"></i> 酒店推荐</h3>
            ${hotelsHtml}
        </div>

        <div class="info-grid">
            <div class="info-card">
                <h5><i class="fas fa-bus"></i> 交通指南</h5>
                ${transportHtml}
            </div>
            <div class="info-card">
                <h5><i class="fas fa-utensils"></i> 美食推荐</h5>
                <ul>${foodsHtml}</ul>
            </div>
        </div>

        <div class="tips-warn">
            <h5><i class="fas fa-exclamation-triangle"></i> 避坑小贴士</h5>
            <ul>${tipsHtml}</ul>
        </div>

        <div class="budget-bar">
            <h5><i class="fas fa-calculator"></i> 预算参考</h5>
            <div class="budget-items">${budgetHtml}</div>
        </div>
    `;
};
'''

    return '\n'.join(lines) + '\n};\n' + render_fn


if __name__ == '__main__':
    result = generate_city_js()
    with open('/workspace/city-data.js', 'w', encoding='utf-8') as f:
        f.write(result)
    print(f"✓ city-data.js 生成成功！共 {len(CITIES)} 个城市")
    print(f"  文件大小: {len(result)/1024:.1f} KB")
