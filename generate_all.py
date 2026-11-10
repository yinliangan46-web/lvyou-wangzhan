#!/usr/bin/env python3
"""MYL 旅行 - 全量城市攻略 + 环线爆点产品 生成脚本"""

import json

def esc(s):
    """JS 字符串转义"""
    return str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ').replace('"', "'")

# ============ 全部城市详细攻略 ============
# 含: itinerary(timeline), routePins, hotels, transport, foods, tips, budget, tags(分类)

CITIES = {}

def add_city(key, **kwargs):
    CITIES[key] = kwargs

# ============ 出境热门 ============

add_city("paris", name="巴黎", country="法国", days="7天6晚", tags=["欧洲", "浪漫", "艺术"],
routePins=["戴高乐机场", "香榭丽舍", "卢浮宫", "塞纳河", "埃菲尔铁塔", "凡尔赛宫", "蒙马特", "老佛爷"],
itinerary=[
    {"day":"Day 1", "theme":"抵达巴黎·浪漫初遇", "timeline":[
        {"time":"14:00","activity":"抵达成田/羽田机场","detail":"RER B 线直达市区（约45分钟 €10），打车约€50-70","duration":"45分钟"},
        {"time":"16:00","activity":"入住 + 休息","detail":"推荐住左岸（St-Germain）或香榭丽舍附近"},
        {"time":"18:30","activity":"香榭丽舍漫步 + 凯旋门","detail":"步行15分钟到凯旋门顶（€13）俯瞰12条放射大道","duration":"2小时","ticket":"€13"},
        {"time":"21:00","activity":"埃菲尔铁塔亮灯","detail":"每整点闪灯5分钟，战神广场或Trocadéro台阶观赏","duration":"30分钟","tip":"晚上9/10/11点各闪一次"},
    ]},
    {"day":"Day 2", "theme":"卢浮宫·艺术宝库", "timeline":[
        {"time":"08:30","activity":"出发卢浮宫","detail":"RER A 线 Palais Royal 站，提前15分钟排队","tip":"周一闭馆！避开周一"},
        {"time":"09:30","activity":"卢浮宫参观","detail":"先看蒙娜丽莎→维纳斯→胜利女神三大镇馆之宝","duration":"3-4小时","ticket":"€17"},
        {"time":"14:00","activity":"杜乐丽花园野餐","detail":"Carrefour 买奶酪+红酒+法棍","price":"¥100/人"},
        {"time":"17:00","activity":"塞纳河游船","detail":"Bateaux Mouches 含语音讲解，夜景超美","duration":"1.5小时","price":"€16-25"},
    ]},
    {"day":"Day 3", "theme":"埃菲尔铁塔深度", "timeline":[
        {"time":"09:00","activity":"埃菲尔铁塔登顶","detail":"官网提前1-2周订便宜20%","duration":"2小时","ticket":"€11-29","tip":"官网订票省20%"},
        {"time":"12:00","activity":"战神广场午餐","detail":"附近小酒馆吃勃艮第红酒炖牛肉","price":"€25-40"},
        {"time":"14:00","activity":"巴黎圣母院 + 拉丁区","detail":"圣母院修复中外观可看，拉丁区咖啡馆密集","duration":"2小时"},
        {"time":"17:00","activity":"圣日耳曼咖啡","detail":"花神咖啡馆喝一杯，萨特波伏娃的最爱","price":"€8-15"},
    ]},
    {"day":"Day 4", "theme":"凡尔赛宫一日游", "timeline":[
        {"time":"08:00","activity":"RER C 去凡尔赛","detail":"Paris Invalides 站上车 Versaille 站下车","duration":"45分钟","price":"€8.4"},
        {"time":"09:30","activity":"凡尔赛宫参观","detail":"镜厅→国王寝宫→王后寝宫→大小特里阿农","duration":"5小时","ticket":"€19"},
        {"time":"15:00","activity":"花园自行车","detail":"夏天租自行车逛花园深处","price":"€12/时"},
        {"time":"17:30","activity":"返回 + 晚餐","detail":"回市区吃 La Tour d'Argent 银塔餐厅鸭胸","price":"约€80/人"},
    ]},
    {"day":"Day 5", "theme":"蒙马特·艺术高地", "timeline":[
        {"time":"09:00","activity":"圣心大教堂","detail":"白色圆顶，登穹顶俯瞰巴黎","duration":"1.5小时","ticket":"穹顶€8"},
        {"time":"11:00","activity":"画家广场 + 小巷","detail":"街头画家画像（€15-30），精品画廊","duration":"2小时","tip":"小心黑车司机搭讪"},
        {"time":"14:00","activity":"老佛爷百货购物","detail":"奥斯曼旗舰店，顶楼露台拍全景","duration":"2.5小时"},
        {"time":"19:00","activity":"红磨坊之夜（可选）","detail":"康康舞表演，需提前订座","duration":"2小时","ticket":"€95-165"},
    ]},
    {"day":"Day 6", "theme":"自由探索", "timeline":[
        {"time":"09:00","activity":"奥赛博物馆（可选）","detail":"印象派大师作品集中地","duration":"3小时","ticket":"€16"},
        {"time":"13:00","activity":"玛莱区逛吃","detail":"犹太美食+复古小店+同性恋酒吧街","duration":"3小时"},
        {"time":"17:00","activity":"巧克力/甜品店","detail":"La Maison du Chocolat 或 Pierre Hermé 马卡龙","price":"约€10"},
        {"time":"20:00","activity":"告别晚餐","detail":"米其林推荐小餐馆","price":"€80-120/人"},
    ]},
    {"day":"Day 7", "theme":"返程","timeline":[
        {"time":"09:00","activity":"自由活动 + 伴手礼","detail":"机场免税店更便宜"},
        {"time":"12:00","activity":"退房 + 午餐","duration":"1小时"},
        {"time":"14:00","activity":"前往戴高乐机场","detail":"RER B 线或打车，提前3小时到","duration":"45分钟"},
    ]},
],
hotels=[
    {"name":"Hôtel Odéon Saint-Germain","tier":"comfortable","price":"约€180-280/晚","area":"左岸·6号线 Odéon 站","highlight":"位置绝佳，出门就是咖啡馆林立的广场"},
    {"name":"Hôtel Le Scribe MGallery","tier":"luxury","price":"约€350-500/晚","area":"歌剧院区·9号线 Opéra 站","highlight":"历史建筑，紧邻老佛爷，顶楼露台能拍全景"},
    {"name":"Generator Hostel Paris","tier":"economy","price":"约€40-60/床位","area":"玛莱区·4号线","highlight":"文艺青旅，公共区域有酒吧和电影院"},
],
transport=[
    {"label":"机场→市区","value":"CDG 乘 RER B 直达市中心（€10/45分钟）；打车€50-70。提前预订接机更省心"},
    {"label":"市内交通","value":"地铁单张€2.1，推荐 Navigo Easy 卡（€5工本费）或 Mobilis 日票€8.4"},
    {"label":"打车注意","value":"夜间加价20%，不要拦黑车，用 Uber 或排队出租车"},
],
foods=[
    {"name":"法式可颂","desc":"早餐首选，配咖啡。推荐 Du Pain et des Idées","price":"€1.5-2.5"},
    {"name":"法式蜗牛","desc":"蒜香黄油焗蜗牛，法餐经典前菜","price":"€12-18"},
    {"name":"鹅肝","desc":"煎鹅肝配无花果酱，入口即化","price":"€20-30"},
    {"name":"焦糖布丁","desc":"喷枪烤焦糖层","price":"€8-12"},
    {"name":"可丽饼","desc":"甜口配草莓奶油，咸口配火腿奶酪","price":"€5-12"},
],
tips=[
    "地铁票别弄丢！被查无票罚款€50",
    "周一很多博物馆闭馆（卢浮宫、奥赛、毕加索）",
    "Eiffel 塔官网订票比现场便宜20%",
    "蒙马特高地偏僻小路不要单独走",
    "法国餐厅小费：好服务给5-10%，不是强制",
    "餐厅午休12:00-14:30，晚餐19:00后开门",
],
budget=[
    {"label":"机票","value":"¥3,500-5,500"},
    {"label":"住宿","value":"¥800-2,500/晚"},
    {"label":"餐饮","value":"¥300-600/天"},
    {"label":"门票","value":"¥500-1,000"},
    {"label":"交通","value":"¥100-200"},
    {"label":"购物","value":"¥1,000+（可选）"},
    {"label":"合计","value":"¥12,000-25,000"},
],
)

add_city("tokyo", name="东京", country="日本", days="6天5晚", tags=["亚洲热门", "都市", "动漫"],
routePins=["成田机场", "新宿", "涩谷", "浅草", "秋叶原", "富士山", "迪士尼", "银座"],
itinerary=[
    {"day":"Day 1", "theme":"抵达·新宿夜色", "timeline":[
        {"time":"14:00","activity":"抵达成田/羽田机场","detail":"羽田单轨电车¥480，成田 N'EX 直达¥3,020","duration":"30-60分钟"},
        {"time":"16:00","activity":"入住酒店","detail":"推荐住新宿/涩谷/银座附近（山手线沿线最方便）"},
        {"time":"18:00","activity":"新宿歌舞伎町 + 都厅夜景","detail":"东京都厅45层免费展望台，俯瞰整个东京湾","duration":"2小时"},
        {"time":"20:00","activity":"居酒屋晚餐","detail":"新宿黄金街小酒馆，烤串+清酒","price":"¥200-400/人"},
    ]},
    {"day":"Day 2", "theme":"浅草·秋叶原", "timeline":[
        {"time":"09:00","activity":"浅草寺 + 雷门","detail":"东京最古老寺庙，仲见世商店街买人形烧","duration":"2小时"},
        {"time":"11:00","activity":"秋叶原动漫街","detail":"手办/漫画/女仆咖啡/JR模型，逛3小时不够","duration":"3小时","tip":"女仆咖啡¥1,500-2,000"},
        {"time":"14:00","activity":"午餐：拉面","detail":"秋叶原拉面横町，一风堂/二郎/AFURI柚子盐","price":"¥80-150"},
        {"time":"15:30","activity":"晴空塔","detail":"350米天望回廊¥2,100，比东京塔新且高","duration":"2小时","ticket":"¥2,100"},
    ]},
    {"day":"Day 3", "theme":"涩谷·原宿·潮流", "timeline":[
        {"time":"09:00","activity":"明治神宫 + 代代木公园","detail":"市中心绿洲，周末可能有传统日式婚礼","duration":"1.5小时"},
        {"time":"11:00","activity":"原宿竹下通 + 表参道","detail":"潮流小店+高端品牌+猫街","duration":"3小时"},
        {"time":"14:00","activity":"涩谷十字路口 + SHIBUYA SKY","detail":"全球最著名十字路口，楼顶拍全景","duration":"2小时","ticket":"¥1,800"},
        {"time":"17:00","activity":"银座购物 + 晚餐","detail":"三越/松屋百货奢侈品，一风堂拉面","price":"¥300+/人"},
    ]},
    {"day":"Day 4", "theme":"富士山一日游", "timeline":[
        {"time":"07:30","activity":"新宿出发","detail":"富士回游号直达河口湖，或高速巴士","duration":"2.5小时","price":"¥4,130"},
        {"time":"10:00","activity":"富士山五合目","detail":"天气好能看到完美倒富士","duration":"2小时","ticket":"观光巴士¥2,100"},
        {"time":"13:00","activity":"忍野八海 + 河口湖","detail":"8个清澈水池，湖边远眺富士","duration":"3小时"},
        {"time":"17:00","activity":"温泉体验 + 返回","detail":"日归温泉¥1,500-2,000，或坐大巴回东京","duration":"约3小时"},
    ]},
    {"day":"Day 5", "theme":"迪士尼乐园/海洋", "timeline":[
        {"time":"08:00","activity":"前往迪士尼","detail":"JR 京叶线舞滨站15分钟¥210，开门前30分钟到","duration":"15分钟"},
        {"time":"09:00","activity":"畅玩一整天","detail":"Land 适合亲子，Sea 适合年轻人，先玩热门项目拿 FAST PASS","duration":"全天","ticket":"¥8,400-9,900"},
        {"time":"20:00","activity":"烟花 + 返程","detail":"21:00 烟花，返程可能人多"},
    ]},
    {"day":"Day 6", "theme":"自由活动·返程", "timeline":[
        {"time":"09:00","activity":"上野公园 + 阿美横町","detail":"动物园/博物馆，阿美横町买电器/药妆","duration":"3小时"},
        {"time":"12:00","activity":"退房 + 午餐","detail":"行李寄存在机场"},
        {"time":"14:00","activity":"机场返程","detail":"免税店逛完登机"},
    ]},
],
hotels=[
    {"name":"Hotel Gracery Shinjuku","tier":"comfortable","price":"¥1,500-2,500/晚","area":"新宿中心·8/9号线换乘","highlight":"楼顶有哥斯拉雕像，位置超便利"},
    {"name":"Park Hyatt Tokyo","tier":"luxury","price":"¥6,000+/晚","area":"西新宿·都厅旁","highlight":"《迷失东京》取景地，顶楼新世界酒吧俯瞰东京"},
    {"name":"东横INN 新宿歌舞伎町","tier":"economy","price":"¥700-1,000/晚","area":"新宿9号线","highlight":"日本连锁商务酒店，干净便捷，早餐免费"},
],
transport=[
    {"label":"机场→市区","value":"羽田：单轨电车¥480或京急¥410；成田：N'EX直达东京站¥3,020（建议提前订）"},
    {"label":"市内交通","value":"JR Pass（外国游客限定）¥29,650/7天可坐JR全线；SUICA/PASMO卡¥500押金通用地铁+便利店"},
    {"label":"打车注意","value":"日本打车很贵！起步价¥710，2公里后¥90/300米，深夜加价20%。优先地铁"},
],
foods=[
    {"name":"拉面","desc":"豚骨/酱油/味噌三种，推荐一风堂/二郎/AFURI","price":"¥800-1,500"},
    {"name":"寿司","desc":"筑地市场/银座高级店，回转寿司¥100/盘起","price":"¥1,500-10,000+"},
    {"name":"天妇罗","desc":"炸虾/蔬菜，蘸萝卜泥酱油","price":"¥2,000-5,000"},
    {"name":"居酒屋烤串","desc":"Yakitori 烤鸡肉串配生啤","price":"¥150-300/串"},
    {"name":"怀石料理","desc":"高级日式料理，需要提前预约","price":"¥5,000-20,000/人"},
],
tips=[
    "日本所有地铁都有英文站名，不会迷路",
    "富士回游号是指定席，必须提前买！现场大概率没票",
    "东京迪士尼建议买 FAST PASS 避免排队2小时以上",
    "日本便利店（7-11/全家/Lawson）万能：充电/打印/交话费",
    "日本酒店按人收费不是按房间，双人房单人住更划算",
    "手机卡建议买 b-mobile 或 WiFi 租赁器",
],
budget=[
    {"label":"机票","value":"¥1,500-3,500"},
    {"label":"住宿","value":"¥400-1,500/晚"},
    {"label":"餐饮","value":"¥200-500/天"},
    {"label":"门票","value":"¥500-1,500"},
    {"label":"交通","value":"¥500-1,500"},
    {"label":"合计","value":"¥6,000-20,000"},
],
)

# 简化批量添加国内城市
SIMPLE_CITIES = {
    "bali": {"name":"巴厘岛","country":"印尼","days":"5天4晚","tags":["海岛","蜜月","度假"],
             "routePins":["登巴萨机场","库塔","金巴兰","情人崖","海神庙","乌布","蓝梦岛"],
             "hotels":[{"name":"Ritz-Carlton Bali","tier":"luxury","price":"¥2,500-4,000/晚","area":"金巴兰悬崖","highlight":"五星级悬崖度假村，无边泳池正对印度洋"},
                       {"name":"Bali Mandira","tier":"comfortable","price":"¥800-1,500/晚","area":"库塔海滩","highlight":"出门就是海滩和购物街"},
                       {"name":"Puri Garden","tier":"economy","price":"¥200-400/晚","area":"乌布猴林门口","highlight":"传统峇里风格小院，步行5分钟到猴林"}],
             "transport":[{"label":"机场→市区","value":"Grab 打车约¥40-80（30分钟），包车一日游约¥200-300"},
                          {"label":"市内交通","value":"没有公共交通，主要靠包车/Grab/租摩托（¥50/天）"},
                          {"label":"蓝梦岛","value":"沙努尔码头快艇20分钟，往返含浮潜¥80-150"}],
             "foods":[{"name":"Nasi Goreng","desc":"印尼炒饭+煎蛋+辣酱","price":"¥15-30"},{"name":"Bebek Betutu","desc":"烤鸭配香茅草药","price":"¥40-80"},{"name":"沙爹 Satay","desc":"烤鸡肉串配花生酱","price":"¥5-15/串"}],
             "tips":["防晒霜SPF50+必须带，紫外线超强","寺庙需围纱笼进（门口可租¥10）","不要喝自来水，买瓶装水¥3-5","蓝梦岛浮潜穿救生衣，有暗流"],
             "budget":[{"label":"机票","value":"¥1,800-3,500"},{"label":"住宿","value":"¥150-3,000/晚"},{"label":"餐饮","value":"¥80-300/天"},{"label":"合计","value":"¥4,500-15,000"}]},
    "dubai": {"name":"迪拜","country":"阿联酋","days":"6天5晚","tags":["中东","奢华","沙漠"],
             "routePins":["迪拜机场","哈利法塔","Dubai Mall","棕榈岛","沙漠","老城区","黄金市场"],
             "hotels":[{"name":"Burj Al Arab","tier":"luxury","price":"¥15,000+/晚","area":"朱美拉海滩","highlight":"七星级帆船酒店，私人海滩和管家服务"},
                       {"name":"Sheraton Mall of Emirates","tier":"comfortable","price":"¥800-1,500/晚","area":"谢赫扎伊德路","highlight":"门口就是迪拜购物中心，位置绝佳"},
                       {"name":"Ibis Budget Deira","tier":"economy","price":"¥300-500/晚","area":"德拉老城区","highlight":"性价比高，靠近地铁和黄金市场"}],
             "transport":[{"label":"机场→市区","value":"迪拜机场快线DXB Metro到BurJuman站约¥50，出租车约¥150-200"},
                          {"label":"市内交通","value":"地铁+轻轨+出租车，推荐用RTA卡刷卡¥2-7/次"},
                          {"label":"沙漠冲沙","value":"包车一日游¥400-600/人，含骑骆驼+晚餐+表演"}],
             "foods":[{"name":"沙瓦玛 Shawarma","desc":"烤肉卷饼配酸奶酱","price":"¥15-30"},{"name":"Hummus","desc":"鹰嘴豆泥配烤饼","price":"¥20-40"},{"name":"Biriyani","desc":"香料羊肉/鸡肉饭","price":"¥40-80"}],
             "tips":["沙漠地区紫外线+50度高温，带好防晒和补水","迪拜公共场所着装保守，不要过于暴露","周五是迪拜休息日，部分店铺可能关门","酒精只能在酒店/餐馆，不能在公共场合喝"],
             "budget":[{"label":"机票","value":"¥2,500-4,500"},{"label":"住宿","value":"¥400-3,000/晚"},{"label":"餐饮","value":"¥150-400/天"},{"label":"合计","value":"¥6,000-20,000"}]},
    "bangkok": {"name":"曼谷","country":"泰国","days":"5天4晚","tags":["东南亚","美食","佛教"],
                "routePins":["素万那普机场","大皇宫","玉佛寺","卧佛寺","考山路","暹罗商圈","火车夜市"],
                "hotels":[{"name":"Anantara Siam","tier":"luxury","price":"¥1,200-2,000/晚","area":"暹罗商圈","highlight":"五星级酒店，出门就是暹罗中心购物商场"},
                          {"name":"Holiday Inn Express Siam","tier":"comfortable","price":"¥400-700/晚","area":"暹罗BTS站旁","highlight":"BTS空铁直达，位置便利"},
                          {"name":"Lub d Siam Square","tier":"economy","price":"¥80-150/床位","area":"暹罗商圈","highlight":"曼谷最潮青旅，楼顶酒吧有DJ"}],
                "transport":[{"label":"机场→市区","value":"机场快线Airport Link到Phayathai站约¥30，出租车约¥100-150"},
                             {"label":"市内交通","value":"BTS空铁+MRT地铁+Tuk-Tuk三蹦子，推荐用BTS日票¥50"},
                             {"label":"水上交通","value":"昭披耶河游船¥30-150，或坐交通船¥10"}],
                "foods":[{"name":"冬阴功汤","desc":"酸辣虾汤，国汤级美食","price":"¥30-60"},{"name":"芒果糯米饭","desc":"椰汁糯米饭配熟芒果","price":"¥20-40"},{"name":"泰式炒河粉","desc":"Pad Thai 配花生碎和青柠","price":"¥15-30"},{"name":"绿咖喱鸡","desc":"椰汁绿咖喱配米饭","price":"¥40-80"}],
                "tips":["打车一定要打表！不打表下车","大皇宫着装要求：不能露膝露肩","泰国小费：按摩后给¥10-20","考山路夜间小心扒手","泰国人用合十礼问好，不要用脚指物"],
                "budget":[{"label":"机票","value":"¥1,200-2,500"},{"label":"住宿","value":"¥150-1,200/晚"},{"label":"餐饮","value":"¥50-150/天"},{"label":"合计","value":"¥3,000-10,000"}]},
    "london": {"name":"伦敦","country":"英国","days":"8天7晚","tags":["欧洲","英伦","文化"],
               "routePins":["希思罗机场","大本钟","国会大厦","大英博物馆","伦敦眼","白金汉宫","塔桥","剑桥"],
               "hotels":[{"name":"The Savoy","tier":"luxury","price":"¥5,000-8,000/晚","area":"科文特花园","highlight":"传奇奢华酒店，白金汉宫步行可达"},
                         {"name":"Premier Inn King's Cross","tier":"comfortable","price":"¥700-1,200/晚","area":"国王十字站旁","highlight":"伦敦市中心黄金位置，步行10分钟到大英博物馆"},
                         {"name":"St Christopher's Inn","tier":"economy","price":"¥150-250/床位","area":"桥区 Borough","highlight":"河畔青旅，楼顶酒吧有伦敦眼全景"}],
               "transport":[{"label":"机场→市区","value":"希思罗快线Heathrow Express¥20直达帕丁顿站，出租车¥150-200"},
                            {"label":"市内交通","value":"地铁+公交，Oyster卡¥5押金，日常约¥150/天"},
                            {"label":"一日游","value":"剑桥/牛津火车约1小时¥80-120，建议提前订便宜"}],
               "foods":[{"name":"Fish & Chips","desc":"炸鱼薯条+醋，英国国菜","price":"¥60-100"},{"name":"英式早餐","desc":"Full English：培根/香肠/煎蛋/烤豆","price":"¥50-80"},{"name":"下午茶","desc":"奶油司康配茶，必体验","price":"¥200-400/人"},{"name":"印度咖喱","desc":"Biryani 或 Korma，伦敦印度菜超有名","price":"¥100-200"}],
               "tips":["大英博物馆/国家美术馆免费！其他博物馆收费","伦敦地铁晚上11点停运，周五六有通宵线","白金汉宫换岗每天11:30（需查官网）","英国小费：餐厅给10%，出租车给车费整数","不要在地铁/公交上给手机放外音，会被鄙视"],
               "budget":[{"label":"机票","value":"¥4,000-6,000"},{"label":"住宿","value":"¥600-4,000/晚"},{"label":"餐饮","value":"¥200-500/天"},{"label":"合计","value":"¥15,000-35,000"}]},
}

for k, v in SIMPLE_CITIES.items():
    add_city(k, **v)

# ============ 国内城市 ============
add_city("beijing", name="北京", country="中国", days="5天4晚", tags=["国内", "古都", "文化"],
routePins=["大兴机场", "前门", "天安门", "故宫", "景山", "八达岭长城", "颐和园", "天坛", "什刹海"],
itinerary=[
    {"day":"Day 1","theme":"中轴线·紫禁城","timeline":[
        {"time":"07:00","activity":"天安门升旗","detail":"查好当日时间，提前1小时到广场排队","duration":"30分钟","tip":"安检不能带水、自拍杆"},
        {"time":"08:00","activity":"故宫博物院","detail":"公众号提前7天约¥60，午门进走中轴线","duration":"4小时","ticket":"¥60"},
        {"time":"12:00","activity":"珍宝馆 + 钟表馆","detail":"各¥10，11点/14点有钟表演示","duration":"1.5小时","ticket":"¥20"},
        {"time":"13:30","activity":"故宫内午餐","detail":"冰窖餐厅/角楼咖啡，或自带面包","price":"¥50-100"},
        {"time":"15:30","activity":"景山公园俯瞰故宫","detail":"登万春亭（¥2+登塔¥10），拍故宫全景最佳位置","duration":"1小时","ticket":"¥12"},
        {"time":"17:00","activity":"什刹海 + 后海","detail":"胡同坐三轮车，晚上找个小酒吧","price":"酒吧¥80-200"},
    ]},
    {"day":"Day 2","theme":"八达岭长城·奥林匹克","timeline":[
        {"time":"07:30","activity":"德胜门坐877路","detail":"¥12现金直达八达岭1.5小时，早走避大部队","duration":"1.5小时"},
        {"time":"09:30","activity":"八达岭长城","detail":"买缆车票¥40上北八楼步行下来，约3小时","duration":"4小时","ticket":"¥80"},
        {"time":"13:30","activity":"返程 + 护国寺小吃","detail":"回市区在德胜门下车吃老北京小吃","price":"¥50-100"},
        {"time":"15:30","activity":"奥林匹克公园","detail":"鸟巢¥50水立方¥30，傍晚夜景更美","duration":"2小时","ticket":"¥80"},
    ]},
    {"day":"Day 3","theme":"颐和园·圆明园·清华北大","timeline":[
        {"time":"08:30","activity":"颐和园","detail":"4号线北宫门站出，走四大部洲→佛香阁→长廊→十七孔桥","duration":"5小时","ticket":"¥40"},
        {"time":"13:30","activity":"午餐：五道口","detail":"清华北大附近美食区","price":"¥50-100"},
        {"time":"15:00","activity":"圆明园","detail":"西洋楼遗址区看大水法遗址","duration":"2小时","ticket":"¥25"},
        {"time":"17:00","activity":"清华/北大门口打卡","detail":"需提前预约入校，校外门口拍照即可"},
        {"time":"19:00","activity":"晚餐：簋街","detail":"小龙虾/麻辣烫/烤鱼一条街","price":"¥100-200"},
    ]},
    {"day":"Day 4","theme":"天坛·南锣鼓巷·胡同","timeline":[
        {"time":"08:30","activity":"天坛公园","detail":"5号线天坛东门站，买联票¥34（含祈年殿）","duration":"3小时","ticket":"¥34"},
        {"time":"11:30","activity":"午餐：大碗居老北京菜","detail":"天坛东门老字号，炸酱面驴打滚焦圈","price":"¥60-100"},
        {"time":"13:30","activity":"南锣鼓巷 + 鼓楼 + 烟袋斜街","detail":"坐三轮车1小时¥150-200","duration":"4小时"},
        {"time":"16:30","activity":"恭王府（可选）","detail":"和珅府邸，¥40门票","duration":"1.5小时","ticket":"¥40"},
        {"time":"18:30","activity":"晚餐：烤肉刘","detail":"老北京炙子烤肉配北冰洋","price":"¥100-200/人"},
    ]},
    {"day":"Day 5","theme":"自由活动·返程","timeline":[
        {"time":"09:00","activity":"798艺术区（可选）","detail":"文艺青年必去，免费","duration":"2小时"},
        {"time":"11:30","activity":"午餐 + 退房","detail":"行李寄存"},
        {"time":"13:30","activity":"国家博物馆（可选）","detail":"免费但提前1-7天公众号约票，周一闭馆","duration":"3小时"},
        {"time":"16:00","activity":"前往机场/高铁","detail":"大兴机场线¥35，首都机场快轨¥25","duration":"1-1.5小时"},
    ]},
],
hotels=[
    {"name":"北京华尔道夫酒店","tier":"luxury","price":"¥1,800-3,500/晚","area":"王府井·8号线","highlight":"五星级奢华服务，步行5分钟到天安门"},
    {"name":"如家精选前门步行街店","tier":"comfortable","price":"¥400-600/晚","area":"前门·2/8号线","highlight":"出门就是步行街，步行15分钟到天安门"},
    {"name":"北平国际青年旅舍","tier":"economy","price":"¥100-250/床位","area":"南锣鼓巷·胡同里","highlight":"四合院改造，氛围超棒"},
],
transport=[
    {"label":"机场→市区","value":"大兴机场线¥35直达草桥；首都机场快轨¥25东直门换；打车¥80-150"},
    {"label":"市内交通","value":"地铁2元起，亿通行APP或一卡通，打车起步¥13"},
    {"label":"长城","value":"德胜门877路直达八达岭¥12；包车¥500-800含司机"},
],
foods=[
    {"name":"北京烤鸭","desc":"全聚德¥300+/套、四季民福¥250/套性价比高","price":"¥150-400/套"},
    {"name":"炸酱面","desc":"老北京早餐，六必居黄酱+黄瓜丝豆芽","price":"¥15-30"},
    {"name":"卤煮火烧","desc":"小肠/肺/豆腐/火烧炖一起","price":"¥25-40"},
    {"name":"豆汁焦圈","desc":"外地人最受不了，酸臭绿豆汁配脆焦圈","price":"¥10-20"},
    {"name":"涮羊肉","desc":"东来顺/南门涮肉，铜锅炭火麻酱小料","price":"¥120-250/人"},
],
tips=[
    "故宫必须提前7天公众号约票！现场根本没票",
    "升旗每天时间不同，www.tiananmen.org.cn 查",
    "国庆/春节所有景点人爆满，建议避开",
    "胡同三轮车提前讲价，一个胡同绕一圈¥80-100",
    "长城尽量早出发，10点后大部队上来拍照排队",
    "冬天冷到-15°C，夏天热到40°C，带好装备",
],
budget=[
    {"label":"大交通","value":"¥800-1,500"},{"label":"住宿","value":"¥250-1,800/晚"},
    {"label":"餐饮","value":"¥150-300/天"},{"label":"门票","value":"¥300-600"},
    {"label":"合计","value":"¥3,000-12,000"},
],
)

# 其余国内城市简化版
OTHER_CITIES = [
    ("shanghai", "上海", "中国", "4天3晚", ["国内", "都市", "魔都"],
     ["虹桥机场", "外滩", "陆家嘴", "东方明珠", "豫园", "迪士尼", "南京路"],
     [{"name":"上海外滩华尔道夫","tier":"luxury","price":"¥1,500-2,800/晚","area":"外滩·10号线","highlight":"江景房正对陆家嘴天际线"},
      {"name":"如家精选南京东路","tier":"comfortable","price":"¥400-600/晚","area":"南京东路·2/10号线","highlight":"步行5分钟到外滩"},
      {"name":"老船长青旅","tier":"economy","price":"¥100-200/床位","area":"外滩·云南路","highlight":"天台露台能看外滩夜景"}],
     ["机场磁悬浮¥50直达龙阳路8分钟；地铁¥3-14","地铁+公交¥2起步；打车¥14/3公里","迪士尼地铁11号线直达¥4"],
     [("生煎包","皮不焦底焦汤汁多¥10-20"),("小笼包","南翔/鼎泰丰¥20-40"),("本帮红烧肉","浓油赤酱¥60-100"),("葱油拌面","早餐标配¥15-25")],
     ["外滩人多注意钱包","迪士尼 FAST PASS 必拿","豫园城隍庙是旅游区，贵又一般","上海话听不懂别慌，普通话通行"],
     [("机票","¥600-1,200"),("住宿","¥250-1,500/晚"),("餐饮","¥100-250/天"),("合计","¥2,500-10,000")]),
    ("chengdu", "成都", "中国", "5天4晚", ["国内", "熊猫", "美食"],
     ["双流机场", "锦里", "宽窄巷子", "熊猫基地", "都江堰", "青城山", "武侯祠"],
     [{"name":"成都香格里拉","tier":"luxury","price":"¥1,200-2,500/晚","area":"春熙路·2号线","highlight":"市中心五星酒店，步行10分钟到春熙路"},
      {"name":"全季春熙路","tier":"comfortable","price":"¥300-500/晚","area":"春熙路·2/3号线","highlight":"出门就是春熙路太古里"},
      {"name":"天堂鸟青旅","tier":"economy","price":"¥80-150/床位","area":"春熙路·地铁口","highlight":"成都最潮青旅，认识各国驴友"}],
     ["机场地铁10号线¥4直达市区；打车¥80-120","地铁¥2-7；打车¥9/2公里","都江堰地铁2号线¥10可达"],
     [("火锅","巴蜀大宅门/小龙坎¥120-200/人"),("串串香","玉林串串¥80-150"),("冰粉/糍粑","¥10-20"),("兔头/钟水饺","¥15-30")],
     ["熊猫基地提前1小时开门就去","宽窄巷子晚上去才热闹","都江堰建议和青城山一起","成都机场提前2小时到就够了"],
     [("机票","¥500-1,200"),("住宿","¥200-1,200/晚"),("餐饮","¥80-200/天"),("合计","¥2,000-8,000")]),
    ("hangzhou", "杭州", "中国", "4天3晚", ["国内", "西湖", "江南"],
     ["萧山机场", "断桥", "雷峰塔", "灵隐寺", "龙井村", "西溪湿地"],
     [{"name":"四季酒店西湖","tier":"luxury","price":"¥3,000-6,000/晚","area":"西湖边","highlight":"私家西湖码头，酒店内乘船游湖"},
      {"name":"全季西湖银泰","tier":"comfortable","price":"¥400-700/晚","area":"延安路·1号线","highlight":"步行15分钟到西湖断桥"},
      {"name":"吴山驿青旅","tier":"economy","price":"¥100-200/床位","area":"吴山·步行西湖10分钟","highlight":"河坊街边上，文艺小院"}],
     ["机场大巴¥20/地铁7号线¥6直达市区","地铁¥2-8；打车¥13/3公里","西湖游览车¥40/站，步行也很好"],
     [("西湖醋鱼","酸酸甜甜¥80-120"),("东坡肉","肥而不腻¥60-90"),("龙井虾仁","杭州名菜¥100-150"),("桂花糖藕","甜品¥25-40")],
     ["西湖景区免费！雷峰塔¥40需登塔","灵隐寺¥75（飞来峰¥45+寺¥30）","龙井村品茶别被强买","周末西湖人巨多建议工作日"],
     [("机票","¥500-1,200"),("住宿","¥250-3,000/晚"),("餐饮","¥100-250/天"),("合计","¥2,500-12,000")]),
    ("xian", "西安", "中国", "5天4晚", ["国内", "古都", "兵马俑"],
     ["咸阳机场", "大雁塔", "兵马俑", "华清池", "回民街", "古城墙", "华山"],
     [{"name":"西安威斯汀","tier":"luxury","price":"¥1,000-2,000/晚","area":"大雁塔·3号线","highlight":"出门就是大雁塔，大唐不夜城步行可达"},
      {"name":"全季钟楼店","tier":"comfortable","price":"¥350-550/晚","area":"钟楼·2号线","highlight":"市中心黄金位置，步行5分钟到回民街"},
      {"name":"湘子门青旅","tier":"economy","price":"¥80-150/床位","area":"南门·城墙下","highlight":"明清客栈改造，院子里有兵马俑模型"}],
     ["机场地铁14号线¥7直达市区；打车¥120-180","地铁¥2-7；打车¥9/2公里","兵马俑地铁9号线直达¥10，华山高铁¥54/25分钟"],
     [("羊肉泡馍","自己掰馍才正宗¥25-40"),("肉夹馍","腊汁/腊牛肉¥15-30"),("biangbiang面","油泼辣子¥20-35"),("凉皮","肉夹馍搭档¥10-20")],
     ["兵马俑请讲解¥100-150，有故事才有趣","古城墙骑自行车¥45/3小时","华清池现在更像现代公园","华山一日游够了，索道往返¥160"],
     [("机票","¥500-1,200"),("住宿","¥200-1,000/晚"),("餐饮","¥80-200/天"),("合计","¥2,000-8,000")]),
    ("chongqing", "重庆", "中国", "4天3晚", ["国内", "8D魔幻", "火锅"],
     ["江北机场", "洪崖洞", "解放碑", "李子坝轻轨", "磁器口", "长江索道", "鹅岭二厂"],
     [{"name":"重庆解放碑威斯汀","tier":"luxury","price":"¥1,500-2,500/晚","area":"解放碑·2号线","highlight":"江景房俯瞰解放碑和嘉陵江"},
      {"name":"全季解放碑","tier":"comfortable","price":"¥350-550/晚","area":"解放碑·1/2号线","highlight":"出门就是解放碑步行街"},
      {"name":"玺院青旅","tier":"economy","price":"¥80-150/床位","area":"磁器口·轻轨站旁","highlight":"重庆最火青旅，江边小别墅"}],
     ["机场轻轨10号线¥7直达市区；打车¥60-100","地铁¥2-9；打车¥10/3公里","长江索道¥20单程¥30往返，嘉陵江索道¥10"],
     [("火锅","佩姐/晓宇¥120-200/人"),("小面","重庆早餐灵魂¥10-20"),("酸辣粉","解放碑好吃街¥15-25"),("豆花饭","川菜¥40-60")],
     ["李子坝轻轨穿楼在观景台看（不要在轻轨上拍）","洪崖洞人太多建议晚上8点后","重庆爬坡上坎多，穿舒服的鞋","磁器口古镇商业化严重，下午去"],
     [("机票","¥400-1,000"),("住宿","¥180-1,500/晚"),("餐饮","¥80-200/天"),("合计","¥2,000-7,000")]),
    ("sanya", "三亚", "中国", "5天4晚", ["国内", "海岛", "度假"],
     ["凤凰机场", "亚龙湾", "蜈支洲岛", "天涯海角", "南山", "大东海"],
     [{"name":"三亚亚特兰蒂斯","tier":"luxury","price":"¥2,500-4,000/晚","area":"海棠湾","highlight":"五星级度假酒店，水族馆+水上乐园+私人海滩"},
      {"name":"全季大东海","tier":"comfortable","price":"¥300-500/晚","area":"大东海海滩","highlight":"出门就是大东海公共海滩，步行5分钟"},
      {"name":"天涯青旅","tier":"economy","price":"¥80-150/床位","area":"天涯海角·海边","highlight":"海边青旅，步行3分钟到天涯海角"}],
     ["机场打车¥60-100到市区；公交¥2-15","三亚打车¥10起步；公交车多","蜈支洲岛船票¥144/人，南山门票¥129"],
     [("海南鸡饭","椰汁鸡汤¥40-60"),("和乐蟹","清蒸¥60-100/斤"),("清补凉","夏日甜品¥15-25"),("水果","三亚芒果/莲雾超便宜¥5-15/斤")],
     ["防晒霜防水SPF50+是必须的","蜈支洲岛浮潜穿救生衣，有暗流","三亚海鲜大排档看菜单问清价格","避开春节/国庆旺季（价格翻倍）"],
     [("机票","¥800-1,800"),("住宿","¥300-2,500/晚"),("餐饮","¥100-250/天"),("合计","¥3,000-12,000")]),
    ("guilin", "桂林", "中国", "5天4晚", ["国内", "山水", "漓江"],
     ["两江机场", "漓江", "阳朔", "龙脊梯田", "象鼻山", "遇龙河"],
     [{"name":"桂林香格里拉","tier":"luxury","price":"¥900-1,500/晚","area":"七星区","highlight":"五星级酒店，步行10分钟到訾洲公园"},
      {"name":"全季中心广场","tier":"comfortable","price":"¥300-500/晚","area":"市中心·1号线","highlight":"出门就是正阳步行街和象山公园"},
      {"name":"老地方青旅","tier":"economy","price":"¥60-120/床位","area":"阳朔西街","highlight":"阳朔最火青旅，西街步行5分钟"}],
     ["机场大巴¥20/机场专线¥20；打车¥80-120","公交¥2-20；漓江船票¥215起","龙脊梯田专线¥50往返"],
     [("桂林米粉","早餐标配¥10-15"),("啤酒鱼","漓江鱼烹饪¥60-120"),("田螺酿","阳朔特色¥40-60"),("油茶","三江侗族特色¥20-30")],
     ["漓江游船¥215起（普通船）¥400+（豪华船）","龙脊梯田建议住一晚看日出","遇龙河竹筏¥160/2人，性价比高","阳朔西街商业化严重，小心被拉客"],
     [("机票","¥500-1,200"),("住宿","¥150-900/晚"),("餐饮","¥80-200/天"),("合计","¥2,000-8,000")]),
    ("lijiang", "丽江", "中国", "5天4晚", ["国内", "古城", "雪山"],
     ["三义机场", "大研古城", "玉龙雪山", "束河古镇", "拉市海", "泸沽湖"],
     [{"name":"丽江悦榕庄","tier":"luxury","price":"¥3,000-5,000/晚","area":"白沙古镇·雪山脚下","highlight":"私密度假，每间房都能看玉龙雪山"},
      {"name":"全季大研古城","tier":"comfortable","price":"¥300-600/晚","area":"古城南门","highlight":"步行5分钟进古城，不用走石板路拖箱子"},
      {"name":"泸沽湖里格半岛青旅","tier":"economy","price":"¥80-150/床位","area":"泸沽湖里格岛","highlight":"湖景青旅，早上醒来就是泸沽湖全景"}],
     ["机场大巴¥20直达古城；打车¥80-120","古城内步行；拉市海骑马¥200-300","玉龙雪山大索道¥120；泸沽湖包车¥500往返"],
     [("腊排骨火锅","丽江特产¥120-180"),("鸡豆凉粉","早餐小吃¥10-15"),("纳西烤鱼","¥50-80"),("酥油茶","¥10-20/壶")],
     ["玉龙雪山氧气瓶¥30/瓶，买上","古城维护费¥50必须交（古城里住）","丽江海拔2400米，初到别剧烈运动","泸沽湖往返8小时，建议住一晚"],
     [("机票","¥600-1,500"),("住宿","¥150-3,000/晚"),("餐饮","¥80-200/天"),("合计","¥2,500-12,000")]),
]

for city in OTHER_CITIES:
    key, name, country, days, tags, pins, hotels, transport, foods, tips, budget = city
    f0 = foods[0] if len(foods) > 0 else ("美食", "推荐当地美食", "¥50-80")
    f1 = foods[1] if len(foods) > 1 else ("午餐", "推荐当地特色", "¥30-50")
    f2 = foods[2] if len(foods) > 2 else ("晚餐", "推荐当地特色", "¥40-60")
    t0 = transport[0] if len(transport) > 0 else "机场打车约¥80-120"
    
    itinerary = [
        {"day":"Day 1","theme":"抵达·初遇","timeline":[
            {"time":"14:00","activity":f"抵达{name}机场/车站","detail":t0,"duration":"约40分钟"},
            {"time":"16:00","activity":"入住酒店","detail":f"推荐住 {hotels[1]['area']} 附近（交通方便）"},
            {"time":"18:00","activity":f"{pins[1]} 傍晚漫步","detail":"享受当地黄昏氛围，拍照最佳时间","duration":"约2小时"},
            {"time":"20:00","activity":"品尝当地招牌美食","detail":f0[1],"price":f0[2]},
        ]},
        {"day":"Day 2","theme":"精华核心游","timeline":[
            {"time":"08:30","activity":f"{pins[2]}","detail":"城市必打卡第一站！建议早上人少的时候去","duration":"约3小时"},
            {"time":"12:00","activity":"午餐时间","detail":f1[1],"price":f1[2]},
            {"time":"14:00","activity":f"{pins[3]}","detail":"上午景点的延续或另一个核心区","duration":"约2.5小时"},
            {"time":"17:00","activity":"自由闲逛 + 下午茶","detail":"找家本地咖啡馆休息一下，感受当地生活"},
        ]},
        {"day":"Day 3","theme":"深度体验","timeline":[
            {"time":"09:00","activity":f"{pins[4]}","detail":"市区/周边深度景点，可能需要半天时间","duration":"约4小时"},
            {"time":"13:00","activity":"当地特色午餐","detail":f1[1],"price":f1[2]},
            {"time":"15:00","activity":"城市漫步 / 购物","detail":"走街串巷发现本地小惊喜，买伴手礼"},
            {"time":"19:00","activity":"告别晚餐","detail":f2[1],"price":f2[2]},
        ]},
        {"day":"Day 4","theme":"自由活动·返程","timeline":[
            {"time":"09:00","activity":f"最后一处打卡 / 购物","detail":f"{pins[5]} 或逛逛当地市场买伴手礼","duration":"约2小时"},
            {"time":"12:00","activity":"退房 + 午餐","detail":"收拾行李退房寄存"},
            {"time":"14:00","activity":"前往机场/车站","detail":t0 + "，建议提前3小时到机场/1小时到高铁站"},
        ]},
    ]
    # 5天版多一个周边游
    if days == "5天4晚":
        itinerary.insert(3, {"day":"Day 4","theme":"周边一日游","timeline":[
            {"time":"08:00","activity":f"{pins[-1]}（周边/自然/郊区）","detail":"包车/跟团一日游，体验自然风光","duration":"全天"},
            {"time":"18:00","activity":"返回市区 + 休息","detail":"放松一整天的疲惫"},
            {"time":"20:00","activity":"晚餐时间","detail":f2[1],"price":f2[2]},
        ]})
    
    add_city(key, name=name, country=country, days=days, tags=tags,
             routePins=pins,
             itinerary=itinerary,
             hotels=[{"name":h[0],"tier":h[1],"price":h[2],"area":h[3],"highlight":h[4]} for h in hotels],
             transport=[{"label":t[0],"value":t[1]} for t in transport],
             foods=[{"name":f[0],"desc":f[1],"price":f[2]} for f in foods],
             tips=list(tips),
             budget=[{"label":b[0],"value":b[1]} for b in budget],
    )

# 导出
if __name__ == '__main__':
    import json
    
    # 生成主数据文件
    output = []
    output.append("// ========== MYL 旅行 - 全量城市详细攻略 ==========\n")
    output.append("// 每个城市: routePins / itinerary(timeline) / hotels / transport / foods / tips / budget / tags\n\n")
    output.append("window.CITY_DETAIL = {")
    
    for key, city in CITIES.items():
        output.append(f"\n    // ===== {city['name']}（{city['country']}）=====")
        output.append(f"    '{key}': {{")
        output.append(f"        name: '{esc(city['name'])}',")
        output.append(f"        country: '{esc(city['country'])}',")
        output.append(f"        days: '{esc(city['days'])}',")
        output.append(f"        tags: {json.dumps(city['tags'], ensure_ascii=False)},")
        output.append(f"        routePins: {json.dumps(city['routePins'], ensure_ascii=False)},")
        output.append(f"        itinerary: {json.dumps(city['itinerary'], ensure_ascii=False)},")
        output.append(f"        hotels: {json.dumps(city['hotels'], ensure_ascii=False)},")
        output.append(f"        transport: {json.dumps(city['transport'], ensure_ascii=False)},")
        output.append(f"        foods: {json.dumps(city['foods'], ensure_ascii=False)},")
        output.append(f"        tips: {json.dumps(city['tips'], ensure_ascii=False)},")
        output.append(f"        budget: {json.dumps(city['budget'], ensure_ascii=False)},")
        output.append("    },")
    
    output.append("\n};")
    
    # 富数据渲染函数
    render_fn = open('/workspace/render_fn.js', 'r').read() if False else ''
    # 内联一个简洁的 renderRichDetail
    output.append('''

// ========== 富数据渲染函数 ==========
window.renderRichDetail = function(data) {
    if (!data) return '';
    const safe = (v) => String(v == null ? '' : v).replace(/[<>"&]/g, (c) =>
        ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' }[c]));
    
    // 路线可视化
    const pins = (data.routePins || []).map((p, i) =>
        `<span class="route-pin"><span class="pin-num">${i+1}</span>${safe(p)}</span>`
    ).join('<span class="route-arrow">→</span>');
    const routeHtml = pins ? `
        <div class="route-visual">
            <div class="route-visual-title"><i class="fas fa-map-marked-alt"></i> 推荐路线（示意图）</div>
            <div class="route-pins">${pins}</div>
            <div class="route-map-hint">📍 仅为示意图，实际路线请参考高德/谷歌地图</div>
        </div>` : '';

    // 行程时间线
    const itineraryHtml = (data.itinerary || []).map(day => {
        const tl = (day.timeline || []).map(item => {
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
                <div class="day-timeline">${tl}</div>
            </div>`;
    }).join('');

    // 酒店
    const tierMap = { economy: '经济型', comfortable: '舒适型', luxury: '奢华型' };
    const hotelsHtml = (data.hotels || []).map(h => `
            <div class="hotel-card">
                <div class="hotel-tier-badge ${safe(h.tier)}">${tierMap[h.tier] || safe(h.tier)}</div>
                <div class="hotel-info">
                    <h5>${safe(h.name)} <span class="price">${safe(h.price)}</span></h5>
                    <div class="area"><i class="fas fa-map-marker-alt"></i> ${safe(h.area)}</div>
                    <div class="highlight">${safe(h.highlight)}</div>
                </div>
            </div>`).join('');

    // 交通
    const transportHtml = (data.transport || []).map(t => `
        <div class="transport-item">
            <div class="label">${safe(t.label)}</div>
            <div class="value">${safe(t.value)}</div>
        </div>`).join('');

    // 美食
    const foodsHtml = (data.foods || []).map(f =>
        `<li><strong>${safe(f.name)}</strong> — ${safe(f.desc)} <em style="color:var(--primary);font-weight:600">${safe(f.price)}</em></li>`
    ).join('');

    // 小贴士
    const tipsHtml = (data.tips || []).map(t => `<li>${safe(t)}</li>`).join('');

    // 预算
    const budgetHtml = (data.budget || []).map(b => `
        <div class="budget-item"><div class="label">${safe(b.label)}</div><div class="value">${safe(b.value)}</div></div>
    `).join('');

    // 标签
    const tagHtml = (data.tags || []).map(t =>
        `<span style="background:var(--primary-light);color:var(--primary);padding:2px 10px;border-radius:12px;font-size:0.75rem;margin-right:6px">${safe(t)}</span>`
    ).join('');

    return `
        ${routeHtml}
        
        <div style="margin-top:12px">${tagHtml}</div>

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
'''.strip()
    
    result = '\n'.join(output)
    with open('/workspace/city-data.js', 'w', encoding='utf-8') as f:
        f.write(result)
    print(f"✓ city-data.js 生成成功！共 {len(CITIES)} 个城市")
    print(f"  文件大小: {len(result)/1024:.1f} KB")
