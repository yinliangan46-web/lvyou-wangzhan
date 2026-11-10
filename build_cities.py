#!/usr/bin/env python3
"""MYL 旅行 - 52 城市全量升级 · 真实景点主题 · 酒店图 · 机票 · 预订链接"""
import json

HOTEL_IMGS = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    "https://images.unsplash.com/photo-1556812711-b3eede05a1bd?w=800&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
]
def hi(i): return HOTEL_IMGS[i % len(HOTEL_IMGS)]

CITIES = {}
def add_city(key, **kw): CITIES[key] = kw

# ========================================
# Paris - 详细版
# ========================================
add_city("paris", name="巴黎", country="法国", days="7天6晚", tags=["境外","欧洲","浪漫"],
routePins=["戴高乐机场","香榭丽舍","卢浮宫","塞纳河","埃菲尔铁塔","凡尔赛宫","蒙马特","老佛爷"],
airfare=[{"from":"北京","to":"巴黎","price":"¥4500-6500","time":"提前2-3月订最便宜"},{"from":"上海","to":"巴黎","price":"¥3500-5500","time":"海航直飞或经转"}],
hotels=[
    {"name":"Hôtel Le Scribe MGallery","tier":"luxury","price":"¥2800-4000/晚","area":"歌剧院区·9号线Opéra站","highlight":"历史建筑，紧邻老佛爷，顶楼露台能拍全景","image":hi(0),"bookingUrl":"https://www.booking.com/hotel/fr/le-scribe-mgallery.html"},
    {"name":"Hôtel Odéon Saint-Germain","tier":"comfortable","price":"¥1500-2500/晚","area":"左岸·6号线Odéon站","highlight":"出门就是圣日耳曼广场咖啡馆林立","image":hi(1),"bookingUrl":"https://www.booking.com"},
    {"name":"Generator Hostel Paris","tier":"economy","price":"¥350-600/床位","area":"玛莱区·4号线","highlight":"文艺青旅，公共区有酒吧和电影院","image":hi(2),"bookingUrl":"https://www.hostelworld.com"},
],
transport=[
    {"label":"机场→市区","value":"RER B线¥70直达45分钟；打车¥400-560；提前预订接机更省心"},
    {"label":"市内交通","value":"地铁¥15单次；推荐Navigo卡¥35/月或Mobilis日票¥58"},
    {"label":"凡尔赛","value":"RER C线¥59直达Versailles Château站约1小时"},
],
foods=[
    {"name":"可颂","desc":"早餐标配配咖啡，推荐 Du Pain et des Idées","price":"¥12-20"},
    {"name":"法式蜗牛","desc":"蒜香黄油焗蜗牛，法餐经典前菜","price":"¥90-140"},
    {"name":"鹅肝","desc":"煎鹅肝配无花果酱，入口即化","price":"¥150-220"},
    {"name":"焦糖布丁","desc":"喷枪烤焦糖层","price":"¥60-90"},
    {"name":"红酒","desc":"勃艮第/波尔多产，餐厅一杯¥50-120","price":"¥50-120/杯"},
],
tips=[
    "地铁票别弄丢！被查无票罚款¥380",
    "周一很多博物馆闭馆（卢浮宫、奥赛、毕加索）",
    "埃菲尔塔官网订比现场便宜20%",
    "蒙马特高地偏僻小路不要单独走",
    "法国餐厅午休12:00-14:30，晚餐19:00后开门",
    "小费不是强制，好服务给5-10%",
],
budget=[{"label":"机票","value":"¥3500-6500"},{"label":"住宿","value":"¥1500-4000/晚"},{"label":"餐饮","value":"¥300-600/天"},{"label":"门票","value":"¥800-1500"},{"label":"合计","value":"¥15000-40000"}],
itinerary=[
    {"day":"Day 1","theme":"抵达·香榭丽舍·凯旋门·埃菲尔铁塔","timeline":[
        {"time":"14:00","activity":"抵达戴高乐机场","detail":"RER B 线直达市区¥70/45分钟；打车¥400-560"},
        {"time":"16:00","activity":"入住酒店","detail":"推荐住左岸（St-Germain）或香榭丽舍附近"},
        {"time":"18:30","activity":"香榭丽舍漫步+凯旋门","detail":"步行15分钟到凯旋门顶¥13俯瞰12条放射大道","duration":"2小时","ticket":"¥13"},
        {"time":"21:00","activity":"埃菲尔铁塔亮灯","detail":"每整点闪灯5分钟，战神广场或Trocadéro台阶观赏","tip":"晚上9/10/11点各闪一次"},
    ]},
    {"day":"Day 2","theme":"卢浮宫·奥赛·塞纳河游船","timeline":[
        {"time":"08:30","activity":"卢浮宫","detail":"周一闭馆！提前网上买票¥17，先看蒙娜丽莎→维纳斯→胜利女神三大镇馆之宝","duration":"4小时","ticket":"¥17"},
        {"time":"14:00","activity":"杜乐丽花园野餐","detail":"Carrefour 买奶酪+红酒+法棍","price":"¥50-100"},
        {"time":"17:00","activity":"奥赛博物馆","detail":"印象派大师作品集中地¥16","duration":"3小时","ticket":"¥16"},
        {"time":"20:00","activity":"塞纳河游船","detail":"Bateaux Mouches 夜景¥100-180","duration":"1.5小时"},
    ]},
    {"day":"Day 3","theme":"埃菲尔铁塔登顶·战神广场·蒙马特","timeline":[
        {"time":"09:00","activity":"埃菲尔铁塔登顶","detail":"官网提前订便宜20%，¥80-210看方案","duration":"2小时","ticket":"¥80-210"},
        {"time":"12:00","activity":"战神广场午餐","detail":"附近小酒馆吃勃艮第红酒炖牛肉","price":"¥150-250"},
        {"time":"14:30","activity":"巴黎圣母院+拉丁区","detail":"圣母院修复中外观可看，拉丁区咖啡馆密集","duration":"2小时"},
        {"time":"17:00","activity":"蒙马特·圣心大教堂","detail":"白色圆顶登穹顶¥40俯瞰巴黎","duration":"2小时","ticket":"¥40"},
    ]},
    {"day":"Day 4","theme":"凡尔赛宫一日游","timeline":[
        {"time":"08:00","activity":"RER C 去凡尔赛","detail":"Paris Invalides站上车Versailles站¥42/1小时"},
        {"time":"09:30","activity":"凡尔赛宫参观","detail":"¥110含镜厅+国王寝宫+王后寝宫+大小特里阿农","duration":"5小时","ticket":"¥110"},
        {"time":"15:00","activity":"花园自行车","detail":"夏天租自行车逛花园深处¥85/小时","price":"¥85"},
        {"time":"17:30","activity":"返回巴黎","duration":"1小时"},
        {"time":"19:30","activity":"晚餐：法式蜗牛+鹅肝","detail":"Chez L'Ami Jean 人均¥300","price":"¥300-400"},
    ]},
    {"day":"Day 5","theme":"老佛爷购物·玛莱区·红磨坊","timeline":[
        {"time":"10:00","activity":"老佛爷百货购物","detail":"奥斯曼旗舰店，顶楼露台拍全景","duration":"3小时"},
        {"time":"13:30","activity":"玛莱区逛吃","detail":"犹太美食+复古小店+同性恋酒吧街","duration":"3小时"},
        {"time":"17:00","activity":"圣日耳曼咖啡馆","detail":"花神咖啡馆喝一杯¥50-100"},
        {"time":"19:30","activity":"红磨坊之夜（可选）","detail":"康康舞表演¥470-800需提前订座","price":"¥470-800"},
    ]},
    {"day":"Day 6","theme":"自由探索·布鲁塞尔一日游（可选）","timeline":[
        {"time":"08:00","activity":"Thalys 火车去布鲁塞尔","detail":"¥300-500/1.5小时"},
        {"time":"10:00","activity":"布鲁塞尔大广场+撒尿小童","detail":"小于连雕像+市政厅广场","duration":"2小时"},
        {"time":"12:00","activity":"午餐：比利时华夫饼","price":"¥80-120"},
        {"time":"14:00","activity":"原子球塔参观","detail":"1958年世博会遗址¥180","duration":"2小时"},
        {"time":"18:00","activity":"返回巴黎","duration":"1.5小时"},
    ]},
    {"day":"Day 7","theme":"返程","timeline":[
        {"time":"09:00","activity":"自由活动+伴手礼","detail":"机场免税店更便宜"},
        {"time":"12:00","activity":"退房+午餐","duration":"1小时"},
        {"time":"14:00","activity":"前往戴高乐机场","detail":"RER B线或打车，提前3小时到","duration":"45分钟"},
    ]},
],
)

# ========================================
# 简化版城市生成器
# ========================================

DEFS = {
    "beijing": ["北京","中国","5天4晚","国内",["大兴机场","前门","天安门","故宫","景山","八达岭长城","颐和园","天坛","什刹海"],
                [("北京华尔道夫","luxury","¥1800-3500/晚","王府井·8号线","五星奢华，步行5分钟到天安门"),
                 ("如家精选前门步行街","comfortable","¥400-600/晚","前门·2/8号线","出门就是步行街"),
                 ("北平国际青旅","economy","¥100-250/床位","南锣鼓巷胡同","四合院改造氛围超棒")]],
    "shanghai": ["上海","中国","4天3晚","国内",["虹桥机场","外滩","陆家嘴","东方明珠","豫园","迪士尼","南京路"],
                 [("外滩华尔道夫","luxury","¥1500-2800/晚","外滩·10号线","江景房正对陆家嘴天际线"),
                  ("全季南京东路","comfortable","¥400-600/晚","南京东路","步行5分钟到外滩"),
                  ("老船长青旅","economy","¥100-200/床位","外滩云南路","天台露台看外滩夜景")]],
    "chengdu": ["成都","中国","5天4晚","国内",["双流机场","锦里","宽窄巷子","熊猫基地","都江堰","青城山","武侯祠"],
                 [("成都香格里拉","luxury","¥1200-2000/晚","春熙路2号线","步行10分钟到春熙路IFS"),
                  ("全季春熙路太古里","comfortable","¥300-500/晚","春熙路","出门就是太古里"),
                  ("天堂鸟青旅","economy","¥80-150/床位","春熙路地铁口","楼顶露天电影")]],
    "guilin": ["桂林","中国","5天4晚","国内",["两江机场","漓江","阳朔","龙脊梯田","象鼻山","遇龙河"],
               [("桂林香格里拉","luxury","¥900-1500/晚","七星区","步行到訾洲公园"),
                ("全季中心广场","comfortable","¥300-500/晚","市中心","出门就是步行街"),
                ("老地方青旅","economy","¥60-120/床位","阳朔西街","西街步行5分钟")]],
    "xian": ["西安","中国","5天4晚","国内",["咸阳机场","大雁塔","兵马俑","华清池","回民街","古城墙","华山"],
             [("西安威斯汀","luxury","¥1000-2000/晚","大雁塔","步行到大雁塔不夜城"),
              ("全季钟楼店","comfortable","¥350-550/晚","钟楼","步行5分钟到回民街"),
              ("湘子门青旅","economy","¥80-150/床位","南门城墙下","明清客栈")]],
    "chongqing": ["重庆","中国","4天3晚","国内",["江北机场","洪崖洞","解放碑","李子坝轻轨","磁器口","长江索道","鹅岭二厂"],
                  [("解放碑威斯汀","luxury","¥1500-2500/晚","解放碑","江景房俯瞰嘉陵江"),
                   ("全季解放碑","comfortable","¥350-550/晚","解放碑","出门就是步行街"),
                   ("玺院青旅","economy","¥80-150/床位","磁器口轻轨站旁","江边小别墅")]],
    "sanya": ["三亚","中国","5天4晚","国内",["凤凰机场","亚龙湾","蜈支洲岛","天涯海角","南山","大东海"],
              [("三亚亚特兰蒂斯","luxury","¥2500-4000/晚","海棠湾","水族馆+水上乐园+私人海滩"),
               ("全季大东海","comfortable","¥300-500/晚","大东海海滩","出门就是公共海滩"),
               ("天涯青旅","economy","¥80-150/床位","天涯海角海边","步行3分钟到天涯海角")]],
    "lijiang": ["丽江","中国","5天4晚","国内",["三义机场","大研古城","玉龙雪山","束河古镇","拉市海","泸沽湖"],
                [("丽江悦榕庄","luxury","¥3000-5000/晚","白沙古镇雪山脚下","每间房能看玉龙雪山"),
                 ("全季大研古城","comfortable","¥300-600/晚","古城南门","步行5分钟进古城"),
                 ("泸沽湖里格青旅","economy","¥80-150/床位","泸沽湖里格岛","湖景房醒来就是泸沽湖")]],
    "tokyo": ["东京","日本","6天5晚","境外",["成田机场","新宿","涩谷","浅草寺","秋叶原","富士山","东京迪士尼","银座"],
              [("Park Hyatt Tokyo","luxury","¥6000+/晚","西新宿·都厅旁","迷失东京取景地"),
               ("Hotel Gracery Shinjuku","comfortable","¥1500-2500/晚","新宿中心·8/9号线","楼顶哥斯拉雕像"),
               ("东横INN新宿","economy","¥700-1000/晚","新宿9号线","早餐免费")]],
    "london": ["伦敦","英国","7天6晚","境外",["希思罗机场","大本钟","大英博物馆","伦敦眼","白金汉宫","塔桥","剑桥"],
               [("The Savoy","luxury","¥5000-8000/晚","科文特花园","传奇奢华酒店"),
                ("Premier Inn King's Cross","comfortable","¥700-1200/晚","国王十字站","步行到大英博物馆"),
                ("St Christopher's Inn","economy","¥150-250/床位","桥区Borough","楼顶酒吧能看伦敦眼")]],
    "dubai": ["迪拜","阿联酋","6天5晚","境外",["迪拜机场","哈利法塔","Dubai Mall","棕榈岛","沙漠","老城区"],
              [("Burj Al Arab 帆船酒店","luxury","¥15000+/晚","朱美拉海滩","七星级私人海滩+管家服务"),
               ("Sheraton Mall of Emirates","comfortable","¥800-1500/晚","谢赫扎伊德路","门口就是滑雪场Mall"),
               ("Ibis Budget Deira","economy","¥300-500/晚","德拉老城区","近地铁和黄金市场")]],
    "bangkok": ["曼谷","泰国","5天4晚","境外",["素万那普机场","大皇宫","玉佛寺","卧佛寺","考山路","暹罗商圈"],
                [("Anantara Siam","luxury","¥1200-2000/晚","暹罗商圈","出门就是暹罗中心"),
                 ("Holiday Inn Express Siam","comfortable","¥400-700/晚","暹罗BTS旁","BTS轻轨直达"),
                 ("Lub d Siam Square","economy","¥80-150/床位","暹罗商圈","楼顶DJ酒吧")]],
    "bali": ["巴厘岛","印尼","5天4晚","境外",["登巴萨机场","库塔","金巴兰","情人崖","乌布","蓝梦岛"],
             [("Ritz-Carlton Bali","luxury","¥2500-4000/晚","金巴兰悬崖","无边泳池正对印度洋"),
              ("Bali Mandira","comfortable","¥800-1500/晚","库塔海滩","出门就是公共海滩"),
              ("Puri Garden Hotel","economy","¥200-400/晚","乌布猴林门口","传统峇里小院")]],
    "hongkong": ["香港","中国","4天3晚","国内",["HK机场","尖沙咀","中环","太平山","迪士尼","铜锣湾"],
                 [("香港丽思卡尔顿","luxury","¥3000-5000/晚","尖沙咀ICC","维港海景无敌"),
                  ("全季香港旺角","comfortable","¥600-1000/晚","旺角地铁口","步行5分钟购物街"),
                  ("悦思青旅","economy","¥80-150/床位","尖沙咀","离星光大道2分钟")]],
}

# 剩余缺失城市自动生成
ALL_NEEDED = [
    "changchun","changsha","dali","dunhuang","fuzhou","guangzhou","guiyang","haikou","hangzhou","harbin",
    "hefei","huangguoshu","huangshan","huhehaote","jinan","jiuzhaigou","kunming","lanzhou","lasa","leshan",
    "nanchang","nanjing","nanning","qingdao","shenyang","shenzhen","shijiazhuang","suzhou","taiyuan","urumqi",
    "wuhan","xiamen","xining","xishuangbanna","yinchuan","zhangjiajie","zhengzhou",
]

NAME_MAP = {
    "changchun":"长春","changsha":"长沙","dali":"大理","dunhuang":"敦煌","fuzhou":"福州",
    "guangzhou":"广州","guiyang":"贵阳","haikou":"海口","hangzhou":"杭州","harbin":"哈尔滨",
    "hefei":"合肥","huangguoshu":"黄果树","huangshan":"黄山","huhehaote":"呼和浩特","jinan":"济南",
    "jiuzhaigou":"九寨沟","kunming":"昆明","lanzhou":"兰州","lasa":"拉萨","leshan":"乐山",
    "nanchang":"南昌","nanjing":"南京","nanning":"南宁","qingdao":"青岛","shenyang":"沈阳",
    "shenzhen":"深圳","shijiazhuang":"石家庄","suzhou":"苏州","taiyuan":"太原","urumqi":"乌鲁木齐",
    "wuhan":"武汉","xiamen":"厦门","xining":"西宁","xishuangbanna":"西双版纳","yinchuan":"银川",
    "zhangjiajie":"张家界","zhengzhou":"郑州",
}
DAYS_MAP = {
    "changchun":"4天3晚","changsha":"4天3晚","dali":"4天3晚","dunhuang":"5天4晚","fuzhou":"4天3晚",
    "guangzhou":"4天3晚","guiyang":"5天4晚","haikou":"5天4晚","hangzhou":"4天3晚","harbin":"5天4晚",
    "hefei":"4天3晚","huangguoshu":"5天4晚","huangshan":"4天3晚","huhehaote":"4天3晚","jinan":"4天3晚",
    "jiuzhaigou":"5天4晚","kunming":"5天4晚","lanzhou":"4天3晚","lasa":"7天6晚","leshan":"4天3晚",
    "nanchang":"3天2晚","nanjing":"4天3晚","nanning":"4天3晚","qingdao":"4天3晚","shenyang":"4天3晚",
    "shenzhen":"4天3晚","shijiazhuang":"3天2晚","suzhou":"4天3晚","taiyuan":"4天3晚","urumqi":"6天5晚",
    "wuhan":"4天3晚","xiamen":"4天3晚","xining":"5天4晚","xishuangbanna":"5天4晚","yinchuan":"4天3晚",
    "zhangjiajie":"5天4晚","zhengzhou":"4天3晚",
}
PINS_MAP = {
    "changchun":["龙嘉机场","伪满皇宫","净月潭","长春电影世纪城"],
    "changsha":["黄花机场","橘子洲","岳麓山","太平老街","湖南省博"],
    "dali":["凤仪机场","大理古城","洱海","喜洲古镇","苍山"],
    "dunhuang":["敦煌机场","莫高窟","鸣沙山","月牙泉","玉门关"],
    "fuzhou":["长乐机场","三坊七巷","鼓山","平潭岛","青云山"],
    "guangzhou":["白云机场","珠江","广州塔","沙面","长隆"],
    "guiyang":["龙洞堡机场","甲秀楼","黔灵山","黄果树瀑布","荔波小七孔"],
    "haikou":["美兰机场","骑楼老街","万绿园","博鳌","蜈支洲岛"],
    "hangzhou":["萧山机场","西湖","灵隐寺","龙井村","西溪湿地"],
    "harbin":["太平机场","中央大街","索菲亚教堂","冰雪大世界","太阳岛"],
    "hefei":["新桥机场","李鸿章故居","三河古镇","巢湖","大蜀山"],
    "huangguoshu":["安顺机场","黄果树瀑布","天星桥","陡坡塘","龙宫"],
    "huangshan":["黄山北站","黄山","宏村","西递","塔川"],
    "huhehaote":["白塔机场","成吉思汗陵","昭君墓","辉腾锡勒草原","响沙湾"],
    "jinan":["遥墙机场","大明湖","趵突泉","千佛山","泉城广场"],
    "jiuzhaigou":["九寨机场","九寨沟","黄龙","牟尼沟","甲蕃古城"],
    "kunming":["长水机场","滇池","石林","翠湖","民族村"],
    "lanzhou":["中川机场","黄河母亲","中山桥","黄河石林","兴隆山"],
    "lasa":["贡嘎机场","布达拉宫","大昭寺","纳木错","羊卓雍措"],
    "leshan":["乐山北站","乐山大佛","峨眉山","报国寺","金顶"],
    "nanchang":["昌北机场","滕王阁","八一起义纪念馆","鄱阳湖","庐山"],
    "nanjing":["禄口机场","中山陵","夫子庙","玄武湖","总统府"],
    "nanning":["吴圩机场","青秀山","大明山","德天瀑布","通灵大峡谷"],
    "qingdao":["胶东机场","栈桥","八大关","崂山","啤酒博物馆"],
    "shenyang":["桃仙机场","沈阳故宫","大帅府","棋盘山","东陵"],
    "shenzhen":["宝安机场","深圳湾","世界之窗","欢乐谷","大鹏半岛"],
    "shijiazhuang":["正定机场","西柏坡","正定古城","嶂石岩","苍岩山"],
    "suzhou":["硕放机场","拙政园","虎丘","周庄","金鸡湖"],
    "taiyuan":["武宿机场","晋祠","双塔","平遥古城","乔家大院"],
    "urumqi":["地窝堡机场","红山公园","大巴扎","天山天池","喀纳斯"],
    "wuhan":["天河机场","黄鹤楼","东湖","户部巷","湖北省博"],
    "xiamen":["高崎机场","鼓浪屿","南普陀寺","中山路","环岛路"],
    "xining":["曹家堡机场","塔尔寺","青海湖","茶卡盐湖","祁连山"],
    "xishuangbanna":["嘎洒机场","野象谷","傣族园","望天树","曼听公园"],
    "yinchuan":["河东机场","西夏王陵","沙湖","镇北堡西部影城","贺兰山岩画"],
    "zhangjiajie":["荷花机场","张家界国家森林公园","天门山","玻璃桥","大峡谷"],
    "zhengzhou":["新郑机场","少林寺","龙门石窟","云台山","清明上河园"],
}

# 行程模板生成
def gen_itin(days, pins):
    D = days
    P = pins
    if D == "3天2晚":
        return [
            {"day":"Day 1","theme":"抵达·"+P[1],"timeline":[
                {"time":"14:00","activity":"抵达机场/车站","detail":"打车¥60-100到市区约40分钟"},
                {"time":"16:00","activity":"入住酒店","detail":"推荐住地铁附近方便出行"},
                {"time":"18:00","activity":P[1]+"傍晚漫步","detail":"日落时分拍照最佳","duration":"2小时"},
                {"time":"20:00","activity":"当地招牌晚餐","detail":"推荐本地人常去的店"},
            ]},
            {"day":"Day 2","theme":P[2]+"·"+P[3],"timeline":[
                {"time":"08:30","activity":P[2],"detail":"必打卡第一站！早上去人少体验好","duration":"3小时"},
                {"time":"12:00","activity":"午餐","detail":"附近餐厅吃当地特色"},
                {"time":"14:00","activity":P[3],"detail":"上午核心景点延续或另一核心","duration":"2.5小时"},
                {"time":"17:00","activity":"自由闲逛+下午茶","detail":"找家咖啡馆休息一下"},
                {"time":"19:00","activity":"告别晚餐","detail":"当地口碑餐厅"},
            ]},
            {"day":"Day 3","theme":"返程","timeline":[
                {"time":"09:00","activity":"最后打卡+购物","detail":"P[1]附近或当地市场"},
                {"time":"12:00","activity":"退房+午餐","detail":"行李寄存"},
                {"time":"14:00","activity":"前往机场/车站","detail":"提前3小时机场/1小时高铁"},
            ]},
        ]
    # 4天起自动生成
    template_day2_theme = P[2] + "·" + P[3] if len(P) > 3 else "精华游"
    itins = [
        {"day":"Day 1","theme":"抵达·"+P[1],"timeline":[
            {"time":"14:00","activity":"抵达机场/车站","detail":"打车¥60-100或地铁直达，约40分钟"},
            {"time":"16:00","activity":"入住酒店","detail":"推荐住交通枢纽附近方便出行"},
            {"time":"18:00","activity":P[1]+"傍晚漫步","detail":"日落时分拍照最佳，别错过","duration":"2小时"},
            {"time":"20:00","activity":"当地招牌晚餐","detail":"推荐本地老字号或网红店"},
        ]},
        {"day":"Day 2","theme":template_day2_theme,"timeline":[
            {"time":"08:30","activity":P[2] if len(P)>2 else "核心景点一","detail":"第一核心景点！早上去人少体验好","duration":"3小时"},
            {"time":"12:00","activity":"午餐","detail":"附近餐厅吃当地特色"},
            {"time":"14:00","activity":P[3] if len(P)>3 else "核心景点二","detail":"上午核心景点的延续或另一核心区","duration":"2.5小时"},
            {"time":"17:00","activity":"自由闲逛+下午茶","detail":"找家本地咖啡馆休息一下"},
            {"time":"19:00","activity":"晚餐时间","detail":"当地口碑餐厅"},
        ]},
    ]
    if D in ["5天4晚","6天5晚","7天6晚"]:
        p4 = P[4] if len(P) > 4 else "周边核心景点"
        itins.append({"day":"Day 3","theme":"周边一日游·"+p4,"timeline":[
            {"time":"08:00","activity":"出发"+p4,"detail":"包车/跟团，约1-2小时车程"},
            {"time":"10:00","activity":p4,"detail":"全天游览自然风光或人文景点","duration":"6小时"},
            {"time":"18:00","activity":"返回市区+休息","detail":"晚上泡个脚放松"},
        ]})
    if D in ["6天5晚","7天6晚"]:
        p5 = P[5] if len(P) > 5 else "深度文化景点"
        itins.append({"day":"Day 4","theme":"深度体验·"+p5,"timeline":[
            {"time":"09:00","activity":p5,"detail":"深度景点全天游览","duration":"4小时"},
            {"time":"13:00","activity":"特色午餐","detail":"当地名店"},
            {"time":"15:00","activity":"城市漫步/购物","detail":"走街串巷发现小惊喜，买伴手礼"},
            {"time":"19:00","activity":"告别晚餐","detail":"推荐网红店或老字号"},
        ]})
    if D == "7天6晚":
        p6 = P[6] if len(P) > 6 else "休闲放松"
        itins.append({"day":"Day 5","theme":p6+"·休闲放松","timeline":[
            {"time":"09:00","activity":"最后精华景点","detail":"城市里还有遗漏的景点补一下","duration":"3小时"},
            {"time":"14:00","activity":"SPA/咖啡馆/书店","detail":"放松一下，别太累"},
        ]})
    itins.append({"day":"Day "+str(len(itins)+1),"theme":"返程","timeline":[
        {"time":"09:00","activity":"最后打卡+购物","detail":P[1]+"附近或当地市场买伴手礼"},
        {"time":"12:00","activity":"退房+午餐","detail":"行李寄存后再逛一轮"},
        {"time":"14:00","activity":"前往机场/车站","detail":"提前3小时机场/1小时高铁"},
    ]})
    return itins

# 从 DEFS 添加（已经有详细行程的）
for k, d in DEFS.items():
    if k == "paris": continue  # paris 已经单独加了
    nm, country, days, tag_type, pins, hotels = d
    itin = gen_itin(days, pins)
    hs = []
    for i, h in enumerate(hotels):
        hs.append({
            "name": h[0], "tier": h[1], "price": h[2], "area": h[3], "highlight": h[4],
            "image": hi(i), "bookingUrl": "https://hotels.ctrip.com"
        })
    
    add_city(k, name=nm, country=country, days=days,
             tags=["国内" if country == "中国" else "境外", tag_type],
             routePins=pins, itinerary=itin,
             airfare=[
                 {"from":"北京","to":nm,"price":"¥400-1500","time":"提前1-2月订最便宜"},
                 {"from":"上海","to":nm,"price":"¥400-1500","time":"推荐直飞或高铁"},
             ],
             hotels=hs,
             transport=[
                 {"label":"机场→市区","value":"机场大巴¥20直达或地铁¥3-10，打车¥60-150"},
                 {"label":"市内交通","value":"地铁¥2-10起步，公交¥1-2，打车起步¥10-15"},
                 {"label":"周边游","value":"景区大巴/高铁/包车¥400-800/天"},
             ],
             foods=[
                 {"name": nm+"招牌菜","desc":"当地最有名的传统美食","price":"¥50-120"},
                 {"name": nm+"特色小吃","desc":"街边老字号必吃","price":"¥10-30"},
                 {"name": nm+"必喝饮品","desc":"当地特色奶茶/咖啡/茶饮","price":"¥15-30"},
             ],
             tips=[
                 nm+"主要景点建议提前1-3天网上预约更便宜",
                 "避开五一/十一节假日，人多价贵",
                 "推荐下载高德/百度地图离线包",
             ],
             budget=[
                 {"label":"机票/高铁","value":"¥300-1500"},
                 {"label":"住宿","value":"¥150-800/晚"},
                 {"label":"餐饮","value":"¥60-150/天"},
                 {"label":"合计","value":"¥1500-6000"},
             ])

# 自动生成剩余城市
for k in ALL_NEEDED:
    if k in CITIES: continue
    nm = NAME_MAP.get(k, k.title())
    days = DAYS_MAP.get(k, "4天3晚")
    pins = PINS_MAP.get(k, [nm+"机场",nm+"核心1",nm+"核心2",nm+"核心3"])
    itin = gen_itin(days, pins)
    
    add_city(k, name=nm, country="中国", days=days,
             tags=["国内", "当地"],
             routePins=pins, itinerary=itin,
             airfare=[
                 {"from":"北京","to":nm,"price":"¥300-1200","time":"提前1月订"},
                 {"from":"上海","to":nm,"price":"¥300-1200","time":"推荐高铁或直飞"},
             ],
             hotels=[
                 {"name":nm+"全季酒店","tier":"comfort","price":"¥300-500/晚","area":"市中心·地铁口","highlight":"连锁品质出行方便","image":hi(0),"bookingUrl":"https://hotels.ctrip.com"},
                 {"name":nm+"如家精选","tier":"economy","price":"¥150-300/晚","area":"交通枢纽附近","highlight":"性价比高靠近高铁站/机场","image":hi(1),"bookingUrl":"https://hotels.ctrip.com"},
                 {"name":nm+"青年旅舍","tier":"economy","price":"¥50-120/床位","area":"老城区景点附近","highlight":"文艺氛围认识各地旅行者","image":hi(2),"bookingUrl":"https://hostelworld.com"},
             ],
             transport=[
                 {"label":"机场→市区","value":"机场大巴¥20直达或地铁¥3-10，打车¥60-150"},
                 {"label":"市内交通","value":"地铁¥2-10起步，公交¥1-2，打车起步¥10-15"},
                 {"label":"周边游","value":"景区大巴/高铁/包车¥400-800/天"},
             ],
             foods=[
                 {"name":nm+"招牌菜","desc":"当地最有名的传统美食","price":"¥50-120"},
                 {"name":nm+"特色小吃","desc":"街边老字号必吃","price":"¥10-30"},
                 {"name":nm+"必喝饮品","desc":"当地特色奶茶/咖啡/茶饮","price":"¥15-30"},
             ],
             tips=[
                 nm+"主要景点建议提前1-3天网上预约更便宜",
                 "避开五一/十一节假日，人多价贵",
                 "推荐下载高德/百度地图离线包",
             ],
             budget=[
                 {"label":"机票/高铁","value":"¥300-1500"},
                 {"label":"住宿","value":"¥150-800/晚"},
                 {"label":"餐饮","value":"¥60-150/天"},
                 {"label":"合计","value":"¥1500-6000"},
             ])

result = "window.CITY_DETAIL = " + json.dumps(CITIES, ensure_ascii=False, indent=2) + ";\n"
with open('/workspace/city-data.js', 'w', encoding='utf-8') as f:
    f.write(result)

# 验证 Paris 详细
paris_ok = "凯旋门" in result and "凡尔赛宫" in result
print(f"✓ city-data.js: {len(CITIES)} 城市, {len(result)//1024} KB")
print(f"✓ Paris 详细行程保留: {paris_ok}")

# 验证没有「核心1/核心2」这种 generic theme
import re
generic = re.findall(r'"theme": "核心|"theme": "精华游|"theme": "深度游|"theme": "抵达·核心|"theme": "周边·核心', result)
print(f"✓ generic theme 数量: {len(generic)}（应为 0）")
