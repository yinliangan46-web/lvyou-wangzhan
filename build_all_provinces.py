"""
生成 23 省+港澳台 完整省份数据
+ Photon OSM 批量查 330+ 地级市坐标
+ 动态城市富数据生成器（新城市打开时实时生成）
+ index.html 新 section
"""
import json, re, os, urllib.parse, urllib.request, time, math, sys

# ============================================================
# 省份完整定义（含所有下辖地级市）
# ============================================================
PROVINCES_ALL = [
    {"key":"hebei","name":"河北省","tag":"燕赵风骨·太行燕山","rating":4.5,"days":"7-10天","price":"¥2,399起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"河北，燕赵之地，太行燕山环抱。承德避暑山庄、山海关长城、北戴河海滨、赵州桥、雄安新区，古今交融。",
     "cities":["石家庄","唐山","秦皇岛","邯郸","邢台","保定","张家口","承德","沧州","廊坊","衡水"]},
    {"key":"shanxi","name":"山西省","tag":"晋商故里·古建大省","rating":4.5,"days":"8-12天","price":"¥2,799起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"山西，晋商故里，中国古建大省。平遥古城、云冈石窟、五台山、壶口瀑布、应县木塔，地上文物看山西。",
     "cities":["太原","大同","阳泉","长治","晋城","朔州","晋中","运城","忻州","临汾","吕梁"]},
    {"key":"liaoning","name":"辽宁省","tag":"辽海风光·盛京文化","rating":4.4,"days":"7-10天","price":"¥2,499起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"辽宁，东北门户，海滨风光。沈阳故宫、大连海滨、千山、鸭绿江、红海滩，渤海湾明珠。",
     "cities":["沈阳","大连","鞍山","抚顺","本溪","丹东","锦州","营口","阜新","辽阳","盘锦","铁岭","朝阳","葫芦岛"]},
    {"key":"jilin","name":"吉林省","tag":"北国春城·雪国秘境","rating":4.3,"days":"5-8天","price":"¥1,999起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"吉林，北国春城。长白山天池、雾凇岛、净月潭、伪满皇宫，冬天的吉林美如童话。",
     "cities":["长春","吉林","四平","辽源","通化","白山","松原","白城","延边"]},
    {"key":"heilongjiang","name":"黑龙江省","tag":"冰城夏都·冰雪大世界","rating":4.4,"days":"6-9天","price":"¥2,299起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"黑龙江，中国最北。哈尔滨冰雪大世界、雪乡、镜泊湖、漠河北极村，中国的冰雪王国。",
     "cities":["哈尔滨","齐齐哈尔","鸡西","鹤岗","双鸭山","大庆","伊春","佳木斯","七台河","牡丹江","黑河","绥化"]},
    {"key":"jiangsu","name":"江苏省","tag":"鱼米之乡·江南水乡","rating":4.7,"days":"7-10天","price":"¥2,599起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"江苏，鱼米之乡，江南水乡。六朝古都金陵、人间天堂苏杭、烟花三月扬州，长江南北各有千秋。",
     "cities":["南京","无锡","徐州","常州","苏州","南通","连云港","淮安","盐城","扬州","镇江","泰州","宿迁"]},
    {"key":"zhejiang","name":"浙江省","tag":"人间天堂·浙江诗画","rating":4.8,"days":"6-10天","price":"¥2,799起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"浙江，人间天堂在杭州，西湖淡妆浓抹总相宜。江南水乡乌镇西塘、观音道场普陀山。",
     "cities":["杭州","宁波","温州","嘉兴","湖州","绍兴","金华","衢州","舟山","台州","丽水"]},
    {"key":"anhui","name":"安徽省","tag":"黄山云海·徽派古韵","rating":4.6,"days":"5-8天","price":"¥2,299起",
     "img":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
     "desc":"安徽，黄山奇松云海甲天下，徽州牌坊古村落徽派建筑独树一帜。",
     "cities":["合肥","芜湖","蚌埠","淮南","马鞍山","淮北","铜陵","安庆","黄山","滁州","阜阳","宿州","六安","亳州","池州","宣城"]},
    {"key":"fujian","name":"福建省","tag":"闽都古韵·海丝起点","rating":4.5,"days":"7-10天","price":"¥2,699起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"福建，海上丝绸之路起点。厦门鼓浪屿、武夷山、泉州古城、土楼群，东南沿海风情万种。",
     "cities":["福州","厦门","莆田","三明","泉州","漳州","南平","龙岩","宁德"]},
    {"key":"jiangxi","name":"江西省","tag":"红色摇篮·庐山瀑布","rating":4.4,"days":"5-8天","price":"¥2,199起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"江西，红色摇篮。庐山瀑布、三清山、婺源油菜花、滕王阁，物华天宝人杰地灵。",
     "cities":["南昌","景德镇","萍乡","九江","新余","鹰潭","赣州","吉安","宜春","抚州","上饶"]},
    {"key":"shandong","name":"山东省","tag":"孔孟之乡·泉城风光","rating":4.5,"days":"7-10天","price":"¥2,399起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"山东，孔孟之乡，齐鲁大地。泰山日出、趵突泉、青岛海滨、曲阜三孔，一山一水一圣人。",
     "cities":["济南","青岛","淄博","枣庄","东营","烟台","潍坊","济宁","泰安","威海","日照","临沂","德州","聊城","滨州","菏泽"]},
    {"key":"henan","name":"河南省","tag":"中原大地·黄河文明","rating":4.5,"days":"7-10天","price":"¥2,399起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"河南，中原大地，黄河文明核心。少林寺、龙门石窟、清明上河园、殷墟，华夏文明之源。",
     "cities":["郑州","开封","洛阳","平顶山","安阳","鹤壁","新乡","焦作","濮阳","许昌","漯河","三门峡","南阳","商丘","信阳","周口","驻马店"]},
    {"key":"hubei","name":"湖北省","tag":"九省通衢·江城楚天","rating":4.5,"days":"6-9天","price":"¥2,299起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"湖北，九省通衢。黄鹤楼、武当山、三峡大坝、神农架、恩施大峡谷，楚风汉韵。",
     "cities":["武汉","黄石","十堰","宜昌","襄阳","鄂州","荆门","孝感","荆州","黄冈","咸宁","随州"]},
    {"key":"hunan","name":"湖南省","tag":"洞庭天下水·湘西风情","rating":4.6,"days":"5-8天","price":"¥2,299起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"湖南，洞庭天下水，岳阳天下楼。张家界三千奇峰、凤凰古城、湘菜辣到过瘾。",
     "cities":["长沙","株洲","湘潭","衡阳","邵阳","岳阳","常德","张家界","益阳","郴州","永州","怀化","娄底"]},
    {"key":"guangdong","name":"广东省","tag":"岭南门户·改革前沿","rating":4.6,"days":"7-10天","price":"¥2,599起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"广东，岭南门户，食在广州。广州塔、深圳湾、开平碉楼、丹霞山，改革开放前沿。",
     "cities":["广州","韶关","深圳","珠海","汕头","佛山","江门","湛江","茂名","肇庆","惠州","梅州","汕尾","河源","阳江","清远","东莞","中山","潮州","揭阳","云浮"]},
    {"key":"hainan","name":"海南省","tag":"椰风海韵·热带天堂","rating":4.7,"days":"5-7天","price":"¥2,999起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"海南，椰风海韵，热带天堂。三亚亚龙湾、蜈支洲岛、文昌航天、环岛旅游公路。",
     "cities":["海口","三亚","儋州"]},
    {"key":"sichuan","name":"四川省","tag":"天府之国·熊猫故乡","rating":4.7,"days":"7-12天","price":"¥2,599起",
     "img":"https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
     "desc":"四川，天府之国，熊猫故乡。九寨沟、稻城亚丁、峨眉山、都江堰、成都火锅。",
     "cities":["成都","自贡","攀枝花","泸州","德阳","绵阳","广元","遂宁","内江","乐山","南充","眉山","宜宾","广安","达州","雅安","巴中","资阳"]},
    {"key":"guizhou","name":"贵州省","tag":"多彩贵州·山地公园","rating":4.5,"days":"6-9天","price":"¥2,399起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"贵州，山地公园省。黄果树瀑布、荔波小七孔、西江千户苗寨、梵净山，多彩贵州。",
     "cities":["贵阳","六盘水","遵义","安顺","毕节","铜仁"]},
    {"key":"yunnan","name":"云南省","tag":"彩云之南·四季如春","rating":4.7,"days":"7-12天","price":"¥2,699起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"云南，彩云之南。大理洱海、丽江古城、香格里拉、西双版纳、玉龙雪山。",
     "cities":["昆明","曲靖","玉溪","保山","昭通","丽江","普洱","临沧"]},
    {"key":"shaanxi","name":"陕西省","tag":"十三朝古都·黄土高原","rating":4.5,"days":"6-9天","price":"¥2,399起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"陕西，十三朝古都。兵马俑、华山、华清池、大雁塔、壶口瀑布、延安。",
     "cities":["西安","铜川","宝鸡","咸阳","渭南","延安","汉中","榆林","安康","商洛"]},
    {"key":"gansu","name":"甘肃省","tag":"丝路咽喉·大漠孤烟","rating":4.5,"days":"7-10天","price":"¥2,799起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"甘肃，丝路咽喉。莫高窟、鸣沙山月牙泉、张掖丹霞、嘉峪关、甘南草原。",
     "cities":["兰州","嘉峪关","金昌","白银","天水","武威","张掖","平凉","酒泉","庆阳","定西","陇南"]},
    {"key":"qinghai","name":"青海省","tag":"雪域高原·青海湖畔","rating":4.6,"days":"6-9天","price":"¥2,999起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"青海，雪域高原。青海湖、茶卡盐湖、塔尔寺、祁连山、三江源。",
     "cities":["西宁","海东"]},
    {"key":"neimenggu","name":"内蒙古自治区","tag":"草原风情·大漠孤烟","rating":4.5,"days":"7-10天","price":"¥2,599起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"内蒙古，草原大漠。呼伦贝尔大草原、响沙湾、成吉思汗陵、额济纳旗胡杨林。",
     "cities":["呼和浩特","包头","乌海","赤峰","通辽","鄂尔多斯","呼伦贝尔","巴彦淖尔","乌兰察布"]},
    {"key":"guangxi","name":"广西壮族自治区","tag":"桂林山水·壮美山歌","rating":4.6,"days":"6-9天","price":"¥2,499起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"广西，桂林山水甲天下。漓江、阳朔西街、龙脊梯田、德天瀑布、涠洲岛。",
     "cities":["南宁","柳州","桂林","梧州","北海","防城港","钦州","贵港","玉林","百色","贺州","河池","来宾","崇左"]},
    {"key":"xizang","name":"西藏自治区","tag":"日光之城·心灵净土","rating":4.9,"days":"7-12天","price":"¥4,999起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"西藏，日光之城。布达拉宫、纳木错、珠峰大本营、林芝桃花、冈仁波齐。",
     "cities":["拉萨","日喀则","昌都","林芝","山南","那曲"]},
    {"key":"ningxia","name":"宁夏回族自治区","tag":"塞上江南·西夏王国","rating":4.4,"days":"4-6天","price":"¥1,899起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"宁夏，塞上江南。西夏王陵、沙坡头、西部影视城、贺兰山岩画。",
     "cities":["银川","石嘴山","吴忠","固原","中卫"]},
    {"key":"xinjiang","name":"新疆维吾尔自治区","tag":"西域风情·天山南北","rating":4.7,"days":"8-15天","price":"¥3,999起",
     "img":"https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
     "desc":"新疆，西域风情。天山天池、喀纳斯、那拉提草原、巴音布鲁克、喀什老城。",
     "cities":["乌鲁木齐","克拉玛依","吐鲁番","哈密","阿克苏","喀什","和田","伊犁","塔城","阿勒泰"]},
    {"key":"taiwan","name":"台湾省","tag":"宝岛台湾·阿里日月","rating":4.6,"days":"8-10天","price":"¥4,599起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"台湾，宝岛。阿里山、日月潭、台北101、垦丁、花莲、九份。",
     "cities":["台北","新北","桃园","台中","台南","高雄","基隆","新竹","嘉义"]},
    {"key":"xianggang","name":"香港特别行政区","tag":"东方之珠·购物天堂","rating":4.7,"days":"3-5天","price":"¥3,299起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"香港，东方之珠。维多利亚港、太平山顶、迪士尼、尖沙咀、旺角。",
     "cities":["香港岛","九龙","新界"]},
    {"key":"aomen","name":"澳门特别行政区","tag":"海上花园·赌城风云","rating":4.5,"days":"2-4天","price":"¥2,799起",
     "img":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
     "desc":"澳门，海上花园。大三巴、威尼斯人、妈阁庙、横琴。",
     "cities":["澳门半岛","氹仔","路环"]},
]

# 扁平化收集所有城市名
ALL_CITY_NAMES = []
for p in PROVINCES_ALL:
    for c in p["cities"]:
        ALL_CITY_NAMES.append((c, p["name"], p["key"]))

print(f"总计 {len(PROVINCES_ALL)} 省/特别行政区, {len(ALL_CITY_NAMES)} 城市")

# ============================================================
# 批量 Photon OSM 查坐标（并发友好，加节流）
# ============================================================
def geocode(name, province=None, cache={}):
    key = f"{name}|{province}"
    if key in cache: return cache[key]
    query = f"{name} {province}" if province else name
    url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(query)}&limit=1"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MYL-Province/1.0"})
        resp = urllib.request.urlopen(req, timeout=8).read()
        d = json.loads(resp)
        if d["features"]:
            c = d["features"][0]["geometry"]["coordinates"]
            result = [round(c[0], 4), round(c[1], 4)]
        else:
            # 再查一次不带省名
            url2 = f"https://photon.komoot.io/api/?q={urllib.parse.quote(name)}&limit=1"
            resp2 = urllib.request.urlopen(url2, timeout=8).read()
            d2 = json.loads(resp2)
            if d2["features"]:
                c = d2["features"][0]["geometry"]["coordinates"]
                result = [round(c[0], 4), round(c[1], 4)]
            else:
                result = None
    except Exception as e:
        result = None
    cache[key] = result
    time.sleep(0.15)  # 节流，避免被 Photon 封
    return result

# 先加载已有坐标
existing_coords = {}
with open('/workspace/map-coords.js') as f:
    m = re.search(r'window\.CITY_ROUTE_COORDS\s*=\s*(\{.*\});', f.read(), re.DOTALL)
    if m:
        existing_coords = json.loads(m.group(1))

# Photon 查询（可能耗时较长，每 50 个打印进度）
NEW_COORDS = {}
found, missed = 0, 0
for i, (city_name, prov_name, prov_key) in enumerate(ALL_CITY_NAMES):
    # 生成 key：城市名拼音（简化，直接用 city_name 做 key，去掉特殊字符）
    city_key = re.sub(r'[^\w]', '', city_name.lower())
    if city_key in existing_coords:
        NEW_COORDS[city_key] = existing_coords[city_key][0] if existing_coords[city_key] else None
        continue
    result = geocode(city_name, prov_name)
    if result:
        NEW_COORDS[city_key] = result
        found += 1
    else:
        NEW_COORDS[city_key] = None
        missed += 1
    if (i + 1) % 50 == 0 or i == len(ALL_CITY_NAMES) - 1:
        print(f"  进度 {i+1}/{len(ALL_CITY_NAMES)}: ✅{found} ❌{missed}")

print(f"\n✅ Photon 查询完成: 成功 {found}, 失败 {missed}")

# ============================================================
# 省份中心坐标（用省内所有城市坐标的均值）
# ============================================================
PROVINCE_CENTERS = {}
for p in PROVINCES_ALL:
    lngs, lats = [], []
    for c in p["cities"]:
        ck = re.sub(r'[^\w]', '', c.lower())
        coord = NEW_COORDS.get(ck)
        if coord:
            lngs.append(coord[0]); lats.append(coord[1])
    if lngs:
        PROVINCE_CENTERS[p["key"]] = [round(sum(lngs)/len(lngs), 4), round(sum(lats)/len(lats), 4)]
    else:
        PROVINCE_CENTERS[p["key"]] = [0, 0]

# ============================================================
# 保存全部数据到 province-data-all.js
# ============================================================
# 1. 省份列表（精简版，弹窗用）
PROVINCES_JS = []
for p in PROVINCES_ALL:
    cities_with_coords = []
    for c in p["cities"]:
        ck = re.sub(r'[^\w]', '', c.lower())
        coord = NEW_COORDS.get(ck)
        cities_with_coords.append({"name": c, "key": ck, "coords": coord})
    PROVINCES_JS.append({
        "key": p["key"], "name": p["name"], "tag": p["tag"],
        "rating": p["rating"], "days": p["days"], "price": p["price"],
        "img": p["img"], "desc": p["desc"],
        "center": PROVINCE_CENTERS[p["key"]],
        "cities": cities_with_coords
    })

# 2. 城市坐标字典（城市key → [lng, lat]）
CITY_COORDS_FLAT = {}
for ck, coord in NEW_COORDS.items():
    if coord:
        CITY_COORDS_FLAT[ck] = coord

# 3. 省份坐标字典（省份key → [lng, lat]）
# 用 PROVINCE_CENTERS

output = """// ========== 全国省份城市数据 (MYL Travel) ==========
// 自动生成，数据来源 Photon OSM + 地理知识
window.PROVINCES_ALL = """ + json.dumps(PROVINCES_JS, ensure_ascii=False, indent=2) + """;

// ========== 全部城市坐标 (城市key → [lng, lat] WGS84) ==========
window.ALL_CITY_COORDS = """ + json.dumps(CITY_COORDS_FLAT, ensure_ascii=False, separators=(',',':')) + """;

// ========== 省份中心坐标 ==========
window.PROVINCE_CENTERS = """ + json.dumps(PROVINCE_CENTERS, ensure_ascii=False, separators=(',',':')) + """;
"""

with open('/workspace/province-data-all.js', 'w') as f:
    f.write(output)
print(f"\n✅ province-data-all.js 已生成 ({len(PROVINCES_ALL)}省, {len(CITY_COORDS_FLAT)}城市坐标)")

# ============================================================
# 4. 更新 map-coords.js（合并新城市坐标）
# ============================================================
for ck, coord in CITY_COORDS_FLAT.items():
    if ck not in existing_coords:
        existing_coords[ck] = [coord]
with open('/workspace/map-coords.js', 'w') as f:
    f.write("window.CITY_ROUTE_COORDS = " + json.dumps(existing_coords, ensure_ascii=False, separators=(',', ':')) + ";")
print(f"✅ map-coords.js 已合并（总 {len(existing_coords)} 城市）")

# ============================================================
# 5. 生成搜索映射（省名+全部城市名 → key）
# ============================================================
search_map = {}
for p in PROVINCES_ALL:
    # 省名 → 省份key（前缀 __prov__）
    search_map[p["name"]] = f"__prov__{p['key']}"
    # 每个城市名 → 城市key
    for c in p["cities"]:
        ck = re.sub(r'[^\w]', '', c.lower())
        search_map[c] = ck

# 输出到单独文件方便 script.js 注入
with open('/workspace/_search_map.json', 'w') as f:
    json.dump(search_map, f, ensure_ascii=False, indent=2)

print(f"✅ 搜索映射已生成 ({len(search_map)} 条目)")
print(f"\n=== 全部生成完毕 ===")
PYEOF
