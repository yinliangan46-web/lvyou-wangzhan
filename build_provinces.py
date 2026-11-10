"""
生成 5 省（江苏/安徽/浙江/湖南/四川）的省份+城市数据 — 简化版
"""
import json, re, urllib.parse, urllib.request, math

# ============================================================
# 省份定义
# ============================================================
PROVINCES = [
    {
        "key": "jiangsu", "name": "江苏省", "tag": "鱼米之乡·江南水乡",
        "rating": 4.7, "days": "7-10天", "price": "¥2,599起",
        "img": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
        "desc": "江苏，鱼米之乡，江南水乡。六朝古都金陵、人间天堂苏州、烟花三月扬州，长江南北各有千秋。MYL 精选江苏精华城市，带你一次游遍江南水乡风情。",
        "cities": [
            {"key": "nanjing", "name": "南京", "tag": "六朝古都", "days": "4天3晚", "price": "¥2,599起"},
            {"key": "suzhou",  "name": "苏州", "tag": "园林水乡", "days": "3天2晚", "price": "¥2,199起"},
            {"key": "wuxi",    "name": "无锡", "tag": "太湖明珠", "days": "2天1晚", "price": "¥1,299起"},
            {"key": "yangzhou","name": "扬州", "tag": "烟花三月", "days": "2天1晚", "price": "¥1,399起"},
            {"key": "zhenjiang","name": "镇江", "tag": "三山名胜", "days": "1天",   "price": "¥699起"},
            {"key": "xuzhou",  "name": "徐州", "tag": "汉风楚韵", "days": "2天1晚", "price": "¥1,199起"},
        ],
        "options": [
            {"name": "苏扬镇经典 5天4晚", "price": "¥3,599", "id": "jiangsu_suyangzhen", "desc": "苏州园林+烟花扬州+金山镇江，江南经典组合"},
            {"name": "南京+苏州 6天5晚", "price": "¥4,199", "id": "jiangsu_njsz", "desc": "六朝古都南京+园林水乡苏州，双城深度游"},
            {"name": "江苏全域 10天9晚",  "price": "¥5,999", "id": "jiangsu_full", "desc": "南京苏州无锡扬州一次游遍江苏精华"},
        ]
    },
    {
        "key": "anhui", "name": "安徽省", "tag": "黄山云海·徽派古韵",
        "rating": 4.6, "days": "5-8天", "price": "¥2,299起",
        "img": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        "desc": "安徽，黄山奇松云海甲天下，徽州牌坊古村落徽派建筑独树一帜。MYL 带你登黄山、游宏村、品徽菜，领略皖南的水墨画卷。",
        "cities": [
            {"key": "hefei",   "name": "合肥", "tag": "大湖名城", "days": "2天1晚", "price": "¥1,299起"},
            {"key": "huangshan","name": "黄山", "tag": "天下第一奇山", "days": "3天2晚", "price": "¥2,199起"},
            {"key": "luan",    "name": "六安", "tag": "大别山生态", "days": "3天2晚", "price": "¥1,599起"},
            {"key": "wuhu",    "name": "芜湖", "tag": "江城芜湖", "days": "2天1晚", "price": "¥1,199起"},
            {"key": "chizhou", "name": "池州", "tag": "九华山佛教", "days": "2天1晚", "price": "¥1,499起"},
        ],
        "options": [
            {"name": "黄山宏村 4天3晚",   "price": "¥2,799", "id": "anhui_huangshan", "desc": "黄山奇松云海+宏村水墨古村，皖南精华"},
            {"name": "合肥+黄山 5天4晚",  "price": "¥3,399", "id": "anhui_hefei_hs", "desc": "合肥科教名城+黄山天下奇山"},
            {"name": "安徽全域 8天7晚",    "price": "¥5,199", "id": "anhui_full", "desc": "合肥黄山六安池州一次游遍安徽"},
        ]
    },
    {
        "key": "zhejiang", "name": "浙江省", "tag": "人间天堂·浙江诗画",
        "rating": 4.8, "days": "6-10天", "price": "¥2,799起",
        "img": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
        "desc": "浙江，人间天堂在杭州，西湖淡妆浓抹总相宜。江南水乡乌镇西塘、观音道场普陀山、神仙居住的地方神仙居，每一处都是一幅水墨画。",
        "cities": [
            {"key": "hangzhou","name": "杭州", "tag": "人间天堂", "days": "3天2晚", "price": "¥2,399起"},
            {"key": "ningbo",  "name": "宁波", "tag": "港口名城", "days": "2天1晚", "price": "¥1,699起"},
            {"key": "shaoxing","name": "绍兴", "tag": "黄酒之乡", "days": "2天1晚", "price": "¥1,499起"},
            {"key": "wenzhou", "name": "温州", "tag": "瓯越山水", "days": "2天1晚", "price": "¥1,599起"},
            {"key": "jiaxing", "name": "嘉兴", "tag": "红船乌镇", "days": "2天1晚", "price": "¥1,299起"},
        ],
        "options": [
            {"name": "杭州+乌镇 4天3晚",   "price": "¥3,199", "id": "zhejiang_hzwz", "desc": "西湖十景+乌镇水乡，江南最经典组合"},
            {"name": "杭绍甬 5天4晚",       "price": "¥3,899", "id": "zhejiang_hznbsx", "desc": "杭州+宁波+绍兴，历史文化深度游"},
            {"name": "浙江全域 10天9晚",    "price": "¥6,199", "id": "zhejiang_full", "desc": "杭州宁波绍兴温州嘉兴一次游遍"},
        ]
    },
    {
        "key": "hunan", "name": "湖南省", "tag": "洞庭天下水·湘西风情",
        "rating": 4.6, "days": "5-8天", "price": "¥2,299起",
        "img": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
        "desc": "湖南，洞庭天下水，岳阳天下楼。张家界三千奇峰拔地而起，凤凰古城沱江边灯火摇曳，湘菜辣到过瘾。MYL 带你游遍湖南的山水与辣。",
        "cities": [
            {"key": "changsha","name": "长沙", "tag": "娱乐美食之都", "days": "2天1晚", "price": "¥1,399起"},
            {"key": "zhangjiajie","name": "张家界", "tag": "三千奇峰", "days": "3天2晚", "price": "¥2,399起"},
            {"key": "fenghuang","name": "凤凰", "tag": "古城烟雨", "days": "2天1晚", "price": "¥1,499起"},
            {"key": "yueyang", "name": "岳阳", "tag": "洞庭天下水", "days": "1天",   "price": "¥699起"},
            {"key": "hengyang", "name": "衡阳", "tag": "南岳衡山", "days": "2天1晚", "price": "¥1,199起"},
        ],
        "options": [
            {"name": "张家界凤凰 5天4晚",  "price": "¥3,599", "id": "hunan_zj_jh", "desc": "三千奇峰张家界+凤凰古城，湘西经典"},
            {"name": "长沙+张家界 4天3晚",  "price": "¥2,799", "id": "hunan_cs_zjj", "desc": "长沙美食+张家界风景，双城必玩"},
            {"name": "湖南全域 8天7晚",      "price": "¥5,299", "id": "hunan_full", "desc": "长沙张家界凤凰岳阳衡阳一次游遍"},
        ]
    },
    {
        "key": "sichuan", "name": "四川省", "tag": "天府之国·熊猫故乡",
        "rating": 4.7, "days": "7-12天", "price": "¥2,599起",
        "img": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
        "desc": "四川，天府之国，熊猫故乡。九寨沟的水蓝到心醉，稻城亚丁的神山震撼心灵，成都的火锅让人流口水。MYL 精选四川精华线路。",
        "cities": [
            {"key": "chengdu","name": "成都", "tag": "天府之国", "days": "3天2晚", "price": "¥2,399起"},
            {"key": "leshan",  "name": "乐山", "tag": "乐山大佛", "days": "1天",   "price": "¥599起"},
            {"key": "jiuzhaigou","name": "九寨沟", "tag": "人间仙境", "days": "2天1晚", "price": "¥1,399起"},
            {"key": "dujiangyan","name": "都江堰", "tag": "千年水利", "days": "1天",   "price": "¥599起"},
            {"key": "emeishan","name": "峨眉山", "tag": "佛教名山", "days": "2天1晚", "price": "¥1,299起"},
        ],
        "options": [
            {"name": "九寨黄龙 4天3晚",   "price": "¥3,199", "id": "sichuan_jzhl", "desc": "九寨沟人间仙境+黄龙瑶池，必玩组合"},
            {"name": "成都+乐山峨眉 4天3晚", "price": "¥2,799", "id": "sichuan_cd_lsem", "desc": "成都天府之国+乐山大佛+峨眉山"},
            {"name": "四川全域 12天11晚", "price": "¥7,999", "id": "sichuan_full", "desc": "成都九寨峨眉稻城亚丁一次玩遍四川"},
        ]
    }
]

# ============================================================
# 新城市定义（用于 search + mapCoords + 富数据补充）
# ============================================================
NEW_CITIES = {
    "wuxi":    {"name": "无锡",    "province": "江苏省", "tag": "太湖明珠"},
    "yangzhou": {"name": "扬州",    "province": "江苏省", "tag": "烟花三月"},
    "zhenjiang": {"name": "镇江",  "province": "江苏省", "tag": "三山名胜"},
    "xuzhou":  {"name": "徐州",    "province": "江苏省", "tag": "汉风楚韵"},
    "wuhu":    {"name": "芜湖",    "province": "安徽省", "tag": "江城芜湖"},
    "chizhou": {"name": "池州",    "province": "安徽省", "tag": "九华山佛教"},
    "ningbo":  {"name": "宁波",    "province": "浙江省", "tag": "港口名城"},
    "shaoxing": {"name": "绍兴",   "province": "浙江省", "tag": "黄酒之乡"},
    "wenzhou": {"name": "温州",    "province": "浙江省", "tag": "瓯越山水"},
    "jiaxing": {"name": "嘉兴",    "province": "浙江省", "tag": "红船乌镇"},
    "fenghuang": {"name": "凤凰",  "province": "湖南省", "tag": "古城烟雨"},
    "yueyang": {"name": "岳阳",    "province": "湖南省", "tag": "洞庭天下水"},
    "hengyang": {"name": "衡阳",   "province": "湖南省", "tag": "南岳衡山"},
    "dujiangyan": {"name": "都江堰", "province": "四川省", "tag": "千年水利"},
    "emeishan": {"name": "峨眉山", "province": "四川省", "tag": "佛教名山"},
}

# ============================================================
# Photon OSM 地理编码
# ============================================================
def geocode(query):
    url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(query)}&limit=1"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MYL/1.0"})
        resp = urllib.request.urlopen(req, timeout=8).read()
        d = json.loads(resp)
        if d["features"]:
            c = d["features"][0]["geometry"]["coordinates"]
            return [round(c[0], 4), round(c[1], 4)]
    except:
        pass
    return None

print("=== 查新城市坐标 ===")
COORD_ADDITIONS = {}
for key, city in NEW_CITIES.items():
    result = geocode(f"{city['name']} {city['province']}")
    if result:
        COORD_ADDITIONS[key] = result
        print(f"  ✅ {city['name']}({key}): {result}")
    else:
        print(f"  ❌ {city['name']}({key}): 未找到")
        COORD_ADDITIONS[key] = [0, 0]

# ============================================================
# 1. 更新 map-coords.js
# ============================================================
with open('/workspace/map-coords.js', 'r') as f:
    mc_content = f.read()
m = re.search(r'window\.CITY_ROUTE_COORDS\s*=\s*(\{.*\});', mc_content, re.DOTALL)
if m:
    existing = json.loads(m.group(1))
    for k, v in COORD_ADDITIONS.items():
        if k not in existing:
            existing[k] = [v]  # 单元素数组（城市中心点）
    new_json = "window.CITY_ROUTE_COORDS = " + json.dumps(existing, ensure_ascii=False, separators=(',', ':')) + ";"
    with open('/workspace/map-coords.js', 'w') as f:
        f.write(new_json)
    print(f"\n✅ map-coords.js 已更新 ({len(COORD_ADDITIONS)} 新城市)")
else:
    print("❌ 找不到 CITY_ROUTE_COORDS")

# ============================================================
# 2. 生成 province-data.js（省份数据 + 可选方案详情）
# ============================================================
# 生成省份可选方案详情
opt_details_dict = {}
for p in PROVINCES:
    for o in p["options"]:
        days = 5
        dm = re.search(r'(\d+)天', o["name"])
        if dm:
            days = int(dm.group(1))
        itinerary = [
            {"day": f"Day {i+1}", "title": "核心景点游玩", "desc": f"第{i+1}天游览{p['name']}相关景点，体验{p['tag']}的魅力。"}
            for i in range(days)
        ]
        opt_details_dict[o["id"]] = {
            "name": o["name"],
            "price": o["price"],
            "img": p["img"],
            "description": f"{o['desc']}。MYL精选{p['name']}最佳组合线路。",
            "itinerary": itinerary,
            "includes": ["往返高铁", "四星级酒店", "景点门票", "导游服务", "旅行保险"]
        }

PROVINCE_DATA_JS = (
    "// ========== 省份数据 (MYL Travel) ==========\n"
    "window.PROVINCE_DATA = " + json.dumps(PROVINCES, ensure_ascii=False, indent=2) + ";\n\n"
    "// ========== 省份可选方案详情 ==========\n"
    "window.PROVINCE_OPTION_DETAIL = " + json.dumps(opt_details_dict, ensure_ascii=False, indent=2) + ";\n"
)

with open('/workspace/province-data.js', 'w') as f:
    f.write(PROVINCE_DATA_JS)
print("✅ province-data.js 已生成")

# ============================================================
# 3. 生成 index.html 中的省份卡片 HTML
# ============================================================
print("\n=== 省份卡片 HTML (粘到 china section 末尾) ===")
cards_html = ""
for p in PROVINCES:
    cards_html += f'''                <div class="dest-card china-card" onclick="openProvinceModal('{p['key']}')">
                    <div class="dest-img"><img src="{p['img']}" alt="{p['name']}" loading="lazy" /><span class="dest-price">{p['price']}</span></div>
                    <div class="dest-info"><h3>{p['name']}</h3><p>{p['tag']}</p><div class="dest-meta"><span><i class="fas fa-star"></i> {p['rating']}</span><span><i class="far fa-clock"></i> {p['days']}</span></div></div>
                </div>
'''
print(cards_html)

# 写入 _province_cards.html 方便后面 Edit
with open('/workspace/_province_cards.html', 'w') as f:
    f.write(cards_html)

# ============================================================
# 4. 生成 script.js 的 destinationData 补充 + 搜索映射补充
# ============================================================
DESTDATA_ADDITIONS = {}
for key, city in NEW_CITIES.items():
    days_count = 2
    DESTDATA_ADDITIONS[key] = {
        "name": city["name"],
        "country": "中国",
        "province": city["province"],
        "tag": city["tag"],
        "rating": 4.5,
        "days": f"{days_count}天{days_count-1}晚" if days_count > 1 else "1天",
        "price": "¥1,299起",
        "img": "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80",
        "description": f"{city['name']}，{city['province']}的一座美丽城市，以{city['tag']}而闻名。MYL 精选当地精华景点与美食，带你一次玩透。",
        "itinerary": [
            {"day": f"Day {i+1}", "title": city["tag"], "desc": f"游览{city['name']}，体验{city['tag']}的魅力。"}
            for i in range(days_count)
        ],
        "includes": ["往返高铁", "三星级酒店", "景点门票", "旅行保险"],
    }

with open('/workspace/_destdata_additions.json', 'w') as f:
    json.dump(DESTDATA_ADDITIONS, f, ensure_ascii=False, indent=2)
print(f"✅ _destdata_additions.json ({len(DESTDATA_ADDITIONS)} 新城市)")

print("\n=== 全部生成完毕 ===")
