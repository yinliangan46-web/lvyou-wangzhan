"""批量查询 312 地级市真实景点坐标"""
import urllib.request, json, urllib.parse, time, re

def photon_search(query, limit=1):
    url = f"https://photon.komoot.io/api/?q={urllib.parse.quote(query)}&limit={limit}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "MYL-Travel/1.0"})
        resp = urllib.request.urlopen(req, timeout=8).read()
        d = json.loads(resp)
        for f in d.get("features", []):
            c = f["geometry"]["coordinates"]
            props = f["properties"]
            city_name = props.get("city", "") or props.get("state", "")
            # 粗略过滤：结果里最好提到我们要找的景点名
            name_lower = props.get("name", "").lower()
            q_lower = query.lower().split()[0]  # 取第一个关键词
            if q_lower in name_lower or len(d["features"]) == 1:
                return [round(c[0], 4), round(c[1], 4)]
        if d["features"]:
            c = d["features"][0]["geometry"]["coordinates"]
            return [round(c[0], 4), round(c[1], 4)]
        return None
    except:
        return None

# 每个城市 3-4 个必玩景点（我硬编码，因为知道哪些景点是哪个城市的）
CITY_POIS = {
    # ===== 河北 =====
    "hebei": {  # 只列 key 映射
        "shijiazhuang": ["西柏坡", "隆兴寺", "赵州桥", "河北博物院"],
        "tangshan": ["清东陵", "唐山地震遗址", "遵化温泉", "月坨岛"],
        "qinhuangdao": ["秦皇岛山海关", "北戴河", "鸽子窝公园", "黄金海岸"],
        "handan": ["广府古城", "丛台公园", "响堂山石窟"],
        "xingtai": ["邢台大峡谷", "开元古寺", "云梦山"],
        "baoding": ["白洋淀", "野三坡", "满城汉墓", "直隶总督署"],
        "zhangjiakou": ["张家口草原天路", "坝上草原", "鸡鸣驿古城", "太舞小镇"],
        "chengde": ["承德避暑山庄", "外八庙", "塞罕坝", "金山岭长城"],
        "cangzhou": ["沧州铁狮子", "吴桥杂技大世界", "南大港湿地"],
        "langfang": ["天下第一城", "廊坊茶文化街"],
        "hengshui": ["衡水湖", "景州塔", "武强年画博物馆"],
    },
    # ===== 山西 =====
    "shanxi": {
        "taiyuan": ["晋祠", "双塔寺", "山西博物院", "柳巷"],
        "datong": ["云冈石窟", "大同古城墙", "华严寺", "悬空寺"],
        "yangquan": ["娘子关", "藏山", "关王庙"],
        "changzhi": ["太行山大峡谷", "皇城相府", "太行水乡"],
        "jincheng": ["王莽岭", "锡崖沟", "晋城博物馆"],
        "shuozhou": ["应县木塔", "崇福寺", "朔州老城"],
        "jinzhong": ["平遥古城", "乔家大院", "绵山", "榆次老城"],
        "yuncheng": ["运城盐湖", "解州关帝庙", "永乐宫", "鹳雀楼"],
        "xinzhou": ["五台山", "雁门关", "宁武关", "芦芽山"],
        "linfen": ["壶口瀑布", "临汾尧庙", "洪洞大槐树"],
        "lvliang": ["吕梁北武当山", "庞泉沟", "碛口古镇"],
    },
}
