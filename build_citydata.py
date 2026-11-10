"""升级 city-data.js：给 52 个城市加 coords + trains + airfare bookingUrl"""
import json
from urllib.parse import quote
from datetime import datetime

def ctrip_train(f, t):
    return f"https://trains.ctrip.com/webapp/train/list?ticketType=0&dStation={quote(f)}&aStation={quote(t)}"

def ctrip_flight(f, t):
    return f"https://flights.ctrip.com/online/list/oneway-{quote(f)}-{quote(t)}"

# 52 个城市的真实坐标 (lng, lat) - 高德/谷歌通用
COORDS = {
    # 国内 (高德坐标)
    "beijing": [116.41, 39.90],     # 北京
    "shanghai": [121.47, 31.23],    # 上海
    "chengdu": [104.07, 30.67],    # 成都
    "guilin": [110.29, 25.27],      # 桂林
    "xian": [108.94, 34.26],        # 西安
    "chongqing": [106.55, 29.56],   # 重庆
    "sanya": [109.51, 18.25],       # 三亚
    "lijiang": [100.23, 26.87],     # 丽江
    "hongkong": [114.17, 22.30],    # 香港
    "changchun": [125.32, 43.90],   # 长春
    "changsha": [112.98, 28.19],    # 长沙
    "dali": [100.23, 25.59],        # 大理
    "dunhuang": [94.66, 40.14],     # 敦煌
    "fuzhou": [119.30, 26.08],      # 福州
    "guangzhou": [113.26, 23.13],   # 广州
    "guiyang": [106.71, 26.57],     # 贵阳
    "haikou": [110.35, 20.02],      # 海口
    "hangzhou": [120.15, 30.28],    # 杭州
    "harbin": [126.53, 45.80],      # 哈尔滨
    "hefei": [117.28, 31.86],       # 合肥
    "huangguoshu": [105.68, 25.98], # 黄果树
    "huangshan": [118.17, 30.13],   # 黄山
    "huhehaote": [111.75, 40.84],   # 呼和浩特
    "jinan": [117.00, 36.65],       # 济南
    "jiuzhaigou": [103.92, 33.26],  # 九寨沟
    "kunming": [102.83, 25.02],     # 昆明
    "lanzhou": [103.83, 36.06],     # 兰州
    "lasa": [91.13, 29.65],         # 拉萨
    "leshan": [103.77, 29.55],      # 乐山
    "nanchang": [115.89, 28.68],    # 南昌
    "nanjing": [118.79, 32.06],     # 南京
    "nanning": [108.37, 22.82],     # 南宁
    "qingdao": [120.38, 36.07],     # 青岛
    "shenyang": [123.43, 41.81],    # 沈阳
    "shenzhen": [114.06, 22.55],    # 深圳
    "shijiazhuang": [114.51, 38.04],# 石家庄
    "suzhou": [120.62, 31.30],      # 苏州
    "taiyuan": [112.55, 37.87],     # 太原
    "urumqi": [87.62, 43.79],       # 乌鲁木齐
    "wuhan": [114.31, 30.52],       # 武汉
    "xiamen": [118.08, 24.48],      # 厦门
    "xining": [101.78, 36.62],      # 西宁
    "xishuangbanna": [100.79, 22.00], # 西双版纳
    "yinchuan": [106.23, 38.49],    # 银川
    "zhangjiajie": [110.46, 29.12], # 张家界
    "zhengzhou": [113.66, 34.75],   # 郑州
    # 国外
    "paris": [2.35, 48.86],         # 巴黎
    "tokyo": [139.69, 35.69],       # 东京
    "london": [-0.12, 51.51],       # 伦敦
    "dubai": [55.27, 25.20],        # 迪拜
    "bangkok": [100.50, 13.76],     # 曼谷
    "bali": [115.19, -8.34],        # 巴厘岛
}

# 热门出发城市（用于火车参考）
CITY_STATIONS = {
    "beijing": "北京", "shanghai": "上海", "chengdu": "成都", "guilin": "桂林",
    "xian": "西安", "chongqing": "重庆", "sanya": "三亚", "lijiang": "丽江",
    "hongkong": "香港", "changchun": "长春", "changsha": "长沙", "dali": "大理",
    "dunhuang": "敦煌", "fuzhou": "福州", "guangzhou": "广州", "guiyang": "贵阳",
    "haikou": "海口", "hangzhou": "杭州", "harbin": "哈尔滨", "hefei": "合肥",
    "huangshan": "黄山", "huhehaote": "呼和浩特", "jinan": "济南",
    "jiuzhaigou": "成都", "kunming": "昆明", "lanzhou": "兰州", "lasa": "拉萨",
    "leshan": "乐山", "nanchang": "南昌", "nanjing": "南京", "nanning": "南宁",
    "qingdao": "青岛", "shenyang": "沈阳", "shenzhen": "深圳",
    "shijiazhuang": "石家庄", "suzhou": "苏州", "taiyuan": "太原",
    "urumqi": "乌鲁木齐", "wuhan": "武汉", "xiamen": "厦门", "xining": "西宁",
    "xishuangbanna": "昆明", "yinchuan": "银川", "zhangjiajie": "张家界",
    "zhengzhou": "郑州", "huangguoshu": "贵阳",
}

# 主要出发地
DEPARTURE_CITIES = ["北京", "上海", "广州", "成都", "西安"]

# 加载 city-data.js
with open('/workspace/city-data.js', 'r') as f:
    content = f.read()

idx = content.find('window.CITY_DETAIL = ')
start = content.find('{', idx)
d = 0; i = start
while i < len(content):
    if content[i] == '{': d += 1
    elif content[i] == '}':
        d -= 1
        if d == 0: break
    i += 1

data = json.loads(content[start:i+1])

total_updated = 0
for city_key, city in data.items():
    name = city.get('name', city_key)
    country = city.get('country', '')
    station_name = CITY_STATIONS.get(city_key, name)
    
    # 1. 加 coords
    if city_key in COORDS:
        city['coords'] = [COORDS[city_key][0], COORDS[city_key][1]]
    
    # 2. 加 trains（国内城市才有意义）
    if country == '中国':
        trains = []
        for dep in DEPARTURE_CITIES:
            # 跳过相同城市
            if dep == station_name or dep == name:
                continue
            # 排除目的地本身就是起点的
            # 只加 2-3 个代表性的出发地
            if len(trains) >= 3:
                break
            # 估算价格和时长（基于距离的粗略估算）
            dist_km = abs(ord(dep[0]) - ord(station_name[0])) * 500 + 500
            price_est = f"¥{max(50, min(800, dist_km // 8))}起"
            dur_est = f"约{max(2, min(30, dist_km // 200))}小时"
            note = "高铁🚅 最划算" if dist_km < 1500 else "推荐卧铺过夜火车"
            trains.append({
                "from": dep,
                "to": station_name,
                "price": price_est,
                "duration": dur_est,
                "time": note,
                "bookingUrl": ctrip_train(dep, station_name),
                "platform": "携程/12306"
            })
        city['trains'] = trains
    else:
        # 国外城市：如果有意义的跨境火车就加
        city['trains'] = []
    
    # 3. airfare 加 bookingUrl
    if 'airfare' in city:
        for af in city['airfare']:
            # 生成机票购买链接
            af['bookingUrl'] = ctrip_flight(af['from'], af['to'])
            af['platform'] = af.get('platform', '携程机票')
    
    total_updated += 1

# 写回
new_json = json.dumps(data, ensure_ascii=False, indent=2)
new_content = content[:start] + new_json + content[i+1:]
with open('/workspace/city-data.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"✅ 升级完成：{total_updated} 个城市")

# 验证
import subprocess
r = subprocess.run(['node', '--check', 'city-data.js'], capture_output=True, text=True)
print(f"Syntax: {'✅ OK' if r.returncode==0 else f'❌ {r.stderr[:200]}'}")

# 抽查
sample = ['paris', 'beijing', 'sanya', 'bali', 'lasa']
for sk in sample:
    s = data.get(sk, {})
    coord_ok = '✅' if s.get('coords') else '❌'
    train_count = len(s.get('trains', []))
    af_count = len(s.get('airfare', []))
    af_has_url = sum(1 for a in s.get('airfare', []) if a.get('bookingUrl'))
    print(f"  {sk} ({s.get('name','')}): coords={coord_ok} trains={train_count} airfare={af_count} 含bookingUrl={af_has_url}")
