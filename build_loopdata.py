"""生成完整的 loop-data.js：10 条环线（4 国内 + 6 国外）+ 渲染函数
运行: python3 build_loopdata.py
"""
import json, sys
from urllib.parse import quote

def CTH(name): return f"https://hotels.ctrip.com/hotels/list?keyword={quote(name)}"
def CTF(f,t): return f"https://flights.ctrip.com/online/list/oneway-{quote(f)}-{quote(t)}"
def CTT(f,t): return f"https://trains.ctrip.com/webapp/train/list?ticketType=0&dStation={quote(f)}&aStation={quote(t)}"
def H(n,t,p,a,h,i): return {"name":n,"tier":t,"price":p,"area":a,"highlight":h,"image":i,"bookingUrl":CTH(n)}
def F(f,t,p,note=""): return {"from":f,"to":t,"price":p,"time":note,"bookingUrl":CTF(f,t),"platform":"携程机票"}
def T(f,t,p,dur,note=""): return {"from":f,"to":t,"price":p,"duration":dur,"time":note,"bookingUrl":CTT(f,t),"platform":"携程/12306"}

# 坐标 (lng, lat)
C = {
    "西宁":[101.78,36.62],"青海湖":[100.99,36.90],"茶卡盐湖":[99.05,36.70],
    "都兰":[98.10,36.30],"乌兰":[98.48,36.92],"大柴旦":[95.31,37.85],
    "雅丹魔鬼城":[93.00,40.50],"玉门":[97.02,40.28],"嘉峪关":[98.29,39.77],
    "瓜州":[95.77,40.49],"敦煌":[94.66,40.14],"张掖":[100.45,38.93],
    "扁都口":[100.95,38.20],"祁连山":[100.23,38.09],"门源":[101.62,37.36],
    "乌鲁木齐":[87.62,43.79],"独山子":[84.87,44.33],"独库公路北段":[83.50,44.50],
    "那拉提":[83.99,43.37],"赛里木湖":[81.10,44.70],"昭苏":[81.11,43.19],
    "喀拉峻":[82.00,42.90],"库车":[83.00,41.72],"吐鲁番":[89.19,42.95],
    "拉萨":[91.13,29.65],"日喀则":[88.88,29.25],"珠峰大本营":[86.85,28.15],
    "冈仁波齐":[81.32,31.00],"札达":[79.69,32.34],"狮泉河":[80.10,32.50],
    "纳木错":[90.17,30.70],
    "成都":[104.07,30.67],"新都桥":[101.52,30.05],
    "理塘":[100.28,30.00],"稻城":[100.17,29.04],"亚丁村":[100.23,28.70],
    "香格里拉":[99.71,27.83],"丽江":[100.23,26.87],
    "东京":[139.69,35.69],"镰仓":[139.55,35.31],"箱根":[139.10,35.23],
    "富士山":[138.73,35.36],"京都":[135.77,35.01],"大阪":[135.50,34.70],"奈良":[135.85,34.69],
    "巴黎":[2.35,48.86],"布鲁塞尔":[4.35,50.85],"阿姆斯特丹":[4.90,52.37],
    "柏林":[13.40,52.52],"布拉格":[14.42,50.08],"维也纳":[16.37,48.21],
    "新加坡":[103.82,1.35],"槟城":[100.33,5.41],"兰卡威":[99.85,6.35],
    "普吉岛":[98.39,7.90],"巴厘岛":[115.19,-8.34],
    "洛杉矶":[-118.24,34.05],"圣迭戈":[-117.16,32.72],
    "拉斯维加斯":[-115.17,36.17],"旧金山":[-122.42,37.77],
    "基督城":[172.63,-43.53],"皇后镇":[168.65,-45.03],
    "米尔福德峡湾":[167.97,-44.62],"但尼丁":[170.50,-45.87],
    "曼谷":[100.50,13.76],"阿育塔亚":[100.58,14.35],
    "清迈":[98.98,18.79],"清莱":[99.88,19.85],
}

def coords(names): return [C.get(n, [0,0]) for n in names]
def pts(names, xy_pairs, day_prefix="Day"):
    out = []
    for i, (name, (x,y)) in enumerate(zip(names, xy_pairs)):
        out.append({"name":name,"x":round(x,1),"y":round(y,1),"day":f"{day_prefix} {i+1}"})
    return out

# ============ 10 条环线数据 ============
LOOPS = [

# ============ 1. 青甘大环线 ============
{
  "id":"qinghai-gansu","name":"青甘大环线","countryTag":"🇨🇳 国内","days":"15天14晚",
  "cover":"https://images.unsplash.com/photo-1606112219146-f13f07505fa4?w=1600&q=80",
  "price":"¥4,200/人起","rating":"★★★★★","tag":"西北经典","tags":["国内","自驾","环线","摄影"],
  "routePins":["西宁","青海湖","茶卡盐湖","都兰","乌兰","大柴旦翡翠湖","雅丹魔鬼城","玉门","嘉峪关长城","瓜州","敦煌莫高窟","鸣沙山月牙泉","张掖七彩丹霞","扁都口","祁连山","门源油菜花","西宁"],
  "totalKm":"约4,200公里","bestTime":"7-8月油菜花/9-10月秋景",
  "coverages":["青海湖","茶卡天空之镜","莫高窟","鸣沙山月牙泉","张掖七彩丹霞","祁连山草原"],
  "description":"中国最著名的西北大环线！穿越青海甘肃两省，途经青藏高原边缘的湖光山色、沙漠戈壁、千年石窟、彩色丹霞。",
  "mapPoints":[
    {"name":"西宁","x":77.3,"y":47.6,"day":"Day 1"},{"name":"青海湖","x":63.6,"y":66.7,"day":"Day 2"},
    {"name":"茶卡盐湖","x":50.0,"y":81.0,"day":"Day 3"},{"name":"大柴旦","x":13.6,"y":76.2,"day":"Day 5"},
    {"name":"雅丹魔鬼城","x":0.0,"y":57.1,"day":"Day 5"},{"name":"嘉峪关","x":45.5,"y":9.5,"day":"Day 7"},
    {"name":"敦煌","x":4.5,"y":9.5,"day":"Day 9"},{"name":"张掖","x":68.2,"y":23.8,"day":"Day 12"},
    {"name":"门源","x":90.9,"y":52.4,"day":"Day 14"},{"name":"西宁","x":77.3,"y":47.6,"day":"Day 15"},
  ],
  "realCoords":coords(["西宁","青海湖","茶卡盐湖","大柴旦","雅丹魔鬼城","嘉峪关","敦煌","张掖","门源","西宁"]),
  "flights":[F("北京","西宁","¥800-1500","提前1个月订"),F("上海","西宁","¥1000-1800"),F("广州","西宁","¥1200-2000")],
  "trains":[T("西安","西宁","¥236起","约8小时","Z字头直达"),T("兰州","西宁","¥61起","约1.5小时","高铁🚅")],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海→西宁 ¥800-2000，提前1个月最便宜"},
    {"label":"🚄 火车","value":"西安/兰州/成都→西宁直达，高铁最快1.5小时"},
    {"label":"🚗 租车","value":"SUV ¥500-800/天含保险，油费+过路费约¥2400"},
    {"label":"🚐 包车","value":"含司机 ¥2500-3500/天，4人拼车人均更划算"},
  ],
  "hotels":[
    H("西宁新华联索菲特大酒店","luxury","¥600-900","城西区","法式奢华，步行到唐道637美食街","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("黑马河牧民家宾馆","comfort","¥400-700","黑马河乡","看青海湖日出最佳位置","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80"),
    H("敦煌丝绸驿酒店","comfort","¥400-700","鸣沙山景区旁","步行到鸣沙山月牙泉","https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80"),
    H("张掖七彩丹霞民宿","economy","¥200-400","景区入口","早上进景区看日出日落","https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80"),
  ],
  "foods":[{"name":"青海土火锅","desc":"牛羊肉+高原蔬菜，暖胃驱寒","price":"¥80-150/人"},{"name":"手抓羊肉","desc":"肉质细嫩无膻味","price":"¥120-180/斤"},{"name":"尕面片","desc":"短面条炒或烩","price":"¥20-35/碗"}],
  "tips":["7-8月昼夜温差大，白天30℃晚上10℃","海拔3000-3800米别剧烈运动","莫高窟必须提前1个月预约","全程建议SUV/越野车"],
  "budget":[{"label":"机票","value":"¥800-2000"},{"label":"交通","value":"¥2800-4500"},{"label":"住宿","value":"¥3000-6000"},{"label":"门票","value":"¥1200-1800"},{"label":"合计人均","value":"¥9000-16800"}],
  "itinerary":[
    {"day":"Day 1","theme":"西宁集结","dayNum":1,"timeline":[{"time":"全天","activity":"西宁集合+租车+补给","detail":"机场落地，提前1天到休整"}]},
    {"day":"Day 2","theme":"西宁→青海湖·环湖","dayNum":2,"timeline":[{"time":"08:00","activity":"前往青海湖","detail":"西宁→二郎剑150公里约2.5小时"},{"time":"12:00","activity":"青海湖畔野餐","detail":"7月油菜花盛开，蓝湖+金海","price":"门票¥100"}]},
    {"day":"Day 3","theme":"茶卡盐湖·天空之镜","dayNum":3,"timeline":[{"time":"07:30","activity":"黑马河日出","detail":"青海湖黑马河乡看日出"},{"time":"10:00","activity":"茶卡盐湖拍照","detail":"穿红色裙子拍倒影","price":"门票¥70"}]},
    {"day":"Day 5","theme":"大柴旦翡翠湖+雅丹魔鬼城","dayNum":5,"timeline":[{"time":"08:00","activity":"翡翠湖拍照","detail":"大小盐湖翡翠绿","price":"门票¥50"},{"time":"16:00","activity":"雅丹魔鬼城日落","detail":"风蚀地貌像外星","price":"门票¥60"}]},
    {"day":"Day 7","theme":"嘉峪关长城","dayNum":7,"timeline":[{"time":"09:00","activity":"关城游玩","detail":"明长城西端起点","price":"门票¥110"}]},
    {"day":"Day 9","theme":"敦煌莫高窟+鸣沙山月牙泉","dayNum":9,"timeline":[{"time":"08:00","activity":"莫高窟参观","detail":"千年壁画，A票8个窟需预约","price":"门票¥190起"},{"time":"16:00","activity":"鸣沙山骑骆驼","detail":"黄昏看沙山日落","price":"门票¥110"}]},
    {"day":"Day 12","theme":"张掖七彩丹霞","dayNum":12,"timeline":[{"time":"15:00","activity":"4号观景台日落","detail":"色带最丰富","price":"门票¥60"}]},
    {"day":"Day 15","theme":"返回西宁·解散","dayNum":15,"timeline":[{"time":"全天","activity":"返回西宁还车","detail":"根据航班安排返程"}]},
  ],
},

# ============ 2. 新疆独库大环线 ============
{
  "id":"xinjiang-duku","name":"新疆独库大环线","countryTag":"🇨🇳 国内","days":"14天13晚",
  "cover":"https://images.unsplash.com/photo-1528164344705-47542687000d?w=1600&q=80",
  "price":"¥7,800/人起","rating":"★★★★★","tag":"此生必走","tags":["国内","自驾","独库公路"],
  "routePins":["乌鲁木齐","独山子","独库公路北段","那拉提","赛里木湖","昭苏","喀拉峻","库车","吐鲁番","乌鲁木齐"],
  "totalKm":"约3,500公里","bestTime":"6-9月独库开放期",
  "coverages":["独库公路","那拉提空中草原","赛里木湖蓝眼泪","喀拉峻人体草原","昭苏油菜花"],
  "description":"每年只开放4个月的独库公路！穿越天山南北，那拉提、赛里木湖、喀拉峻、昭苏、库车大峡谷，每一公里都是大片。",
  "mapPoints":[
    {"name":"乌鲁木齐","x":100.0,"y":0.0,"day":"Day 1"},{"name":"独山子","x":77.8,"y":16.0,"day":"Day 2"},
    {"name":"独库公路北段","x":55.6,"y":32.0,"day":"Day 3"},{"name":"那拉提","x":22.2,"y":52.0,"day":"Day 4"},
    {"name":"赛里木湖","x":0.0,"y":40.0,"day":"Day 5"},{"name":"昭苏","x":27.8,"y":68.0,"day":"Day 6"},
    {"name":"喀拉峻","x":38.9,"y":80.0,"day":"Day 7"},{"name":"库车","x":61.1,"y":100.0,"day":"Day 10"},
    {"name":"吐鲁番","x":88.9,"y":20.0,"day":"Day 12"},{"name":"乌鲁木齐","x":100.0,"y":0.0,"day":"Day 14"},
  ],
  "realCoords":coords(["乌鲁木齐","独山子","独库公路北段","那拉提","赛里木湖","昭苏","喀拉峻","库车","吐鲁番","乌鲁木齐"]),
  "flights":[F("北京","乌鲁木齐","¥1500-3000","提前2个月订"),F("上海","乌鲁木齐","¥2000-3500")],
  "trains":[T("兰州","乌鲁木齐","¥263起","约20小时"),T("西安","乌鲁木齐","¥312起","约24小时")],
  "transport":[
    {"label":"✈️ 机票","value":"北京→乌鲁木齐 ¥1500-3000"},
    {"label":"🚄 火车","value":"兰州/西安直达乌鲁木齐，20-30小时硬卧"},
    {"label":"🚗 租车","value":"硬派SUV/越野车 ¥600-1000/天"},
    {"label":"🚐 包车","value":"含司机 ¥800-1200/天，4人拼车人均划算"},
  ],
  "hotels":[
    H("乌鲁木齐希尔顿","luxury","¥600-900","友好路","离大巴扎步行10分钟","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("那拉提草原毡房","economy","¥200-400","那拉提镇","体验哈萨克族毡房","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("赛里木湖民宿","comfort","¥300-600","赛湖景区门口","出门看湖看日出","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"手抓饭","desc":"羊肉+胡萝卜+洋葱","price":"¥30-50/份"},{"name":"烤全羊","desc":"外酥里嫩皮脆肉多汁","price":"¥80-150/人"},{"name":"大盘鸡","desc":"鸡肉+土豆+宽面","price":"¥80-120/份"}],
  "tips":["独库6-9月开放，每天查路况","山区信号差，下载离线地图","那拉提/赛里木湖晚上0℃带厚羽绒服","身份证随身携带"],
  "budget":[{"label":"机票","value":"¥1500-3500"},{"label":"交通","value":"¥4500-8000"},{"label":"住宿","value":"¥2500-5000"},{"label":"合计人均","value":"¥10800-20500"}],
  "itinerary":[
    {"day":"Day 1","theme":"乌鲁木齐集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达乌市","detail":"逛国际大巴扎+新疆博物馆"}]},
    {"day":"Day 2","theme":"乌鲁木齐→独山子","dayNum":2,"timeline":[{"time":"上午","activity":"出发独山子","detail":"约250公里高速3小时"}]},
    {"day":"Day 3","theme":"独库公路北段","dayNum":3,"timeline":[{"time":"全天","activity":"穿越独库北段","detail":"翻越哈希勒根达坂3390米"}]},
    {"day":"Day 4","theme":"那拉提空中草原","dayNum":4,"timeline":[{"time":"全天","activity":"空中草原骑马","detail":"哈萨克风情+辽阔草原"}]},
    {"day":"Day 5","theme":"赛里木湖","dayNum":5,"timeline":[{"time":"全天","activity":"环湖自驾","detail":"蓝宝石一样的湖，拍日落+星空"}]},
    {"day":"Day 6","theme":"昭苏油菜花","dayNum":6,"timeline":[{"time":"上午","activity":"草原花海","detail":"7-8月万亩油菜花"}]},
    {"day":"Day 7","theme":"喀拉峻人体草原","dayNum":7,"timeline":[{"time":"全天","activity":"东西喀拉峻景区","detail":"草原起伏像人体曲线"}]},
    {"day":"Day 10","theme":"库车古城+克孜尔","dayNum":10,"timeline":[{"time":"全天","activity":"穿越到库车","detail":"克孜尔千佛洞+库车大寺"}]},
    {"day":"Day 12","theme":"吐鲁番火焰山","dayNum":12,"timeline":[{"time":"全天","activity":"吐鲁番一日游","detail":"火焰山+葡萄沟摘葡萄"}]},
    {"day":"Day 14","theme":"返回乌鲁木齐","dayNum":14,"timeline":[{"time":"全天","activity":"还车+返程","detail":"机场送机"}]},
  ],
},

# ============ 3. 西藏阿里大北线 ============
{
  "id":"tibet-ali","name":"西藏阿里大北线","countryTag":"🇨🇳 国内","days":"13天12晚",
  "cover":"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=80",
  "price":"¥12,000/人起","rating":"★★★★★","tag":"神山圣湖","tags":["国内","自驾","高反","阿里"],
  "routePins":["拉萨","日喀则","珠峰大本营","冈仁波齐","札达","狮泉河","纳木错","拉萨"],
  "totalKm":"约4,800公里","bestTime":"5-9月旺季但安全",
  "coverages":["布达拉宫","珠峰大本营","冈仁波齐","玛旁雍措","古格王朝","纳木错"],
  "description":"中国海拔最高的环线！穿越平均海拔4500米的阿里无人区，抵达神山冈仁波齐脚下，看圣湖玛旁雍措，古格王朝遗址。",
  "mapPoints":[
    {"name":"拉萨","x":91.3,"y":33.3,"day":"Day 1"},{"name":"日喀则","x":65.2,"y":55.6,"day":"Day 3"},
    {"name":"珠峰大本营","x":47.8,"y":100.0,"day":"Day 4"},{"name":"冈仁波齐","x":21.7,"y":66.7,"day":"Day 7"},
    {"name":"札达","x":8.7,"y":22.2,"day":"Day 9"},{"name":"狮泉河","x":0.0,"y":0.0,"day":"Day 10"},
    {"name":"纳木错","x":100.0,"y":0.0,"day":"Day 13"},{"name":"拉萨","x":91.3,"y":33.3,"day":"Day 13"},
  ],
  "realCoords":coords(["拉萨","日喀则","珠峰大本营","冈仁波齐","札达","狮泉河","纳木错","拉萨"]),
  "flights":[F("北京","拉萨","¥1500-3500","提前1-2月订"),F("成都","拉萨","¥800-1800","每天多班")],
  "trains":[T("西宁","拉萨","¥224起","约21小时","Z字头直达"),T("成都","拉萨","¥250起","约36小时")],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海/成都→拉萨，提前2个月订最便宜"},
    {"label":"🚄 火车","value":"西宁/成都→拉萨，Z223次21小时硬座¥224"},
    {"label":"🚐 包车","value":"必须硬派SUV+带司机 ¥1500-2500/天"},
  ],
  "hotels":[
    H("拉萨瑞吉度假酒店","luxury","¥1500-2500","八廓街","步行到大昭寺+供氧","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("珠峰大本营板房","economy","¥500-800","大本营","海拔5100米，看日出","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("狮泉河阿里花园酒店","comfort","¥400-700","狮泉河镇","带氧气，条件最好的宾馆","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"藏面","desc":"牦牛肉汤面","price":"¥15-25/碗"},{"name":"酥油茶","desc":"咸香解腻抗缺氧","price":"¥10-20/壶"},{"name":"手抓牛肉","desc":"牦牛肉煮熟蘸盐","price":"¥50-80/份"}],
  "tips":["必须办边防证，阿里地区必查","平均海拔4500米，准备氧气瓶+红景天","藏区限速多，实际车速慢","尊重当地风俗，玛尼堆不踩不跨"],
  "budget":[{"label":"机票","value":"¥1500-3500"},{"label":"包车","value":"¥15000-25000（含司机油费）"},{"label":"住宿","value":"¥5000-8000"},{"label":"合计人均","value":"¥25000-45000（4人拼车）"}],
  "itinerary":[
    {"day":"Day 1","theme":"拉萨集结","dayNum":1,"timeline":[{"time":"全天","activity":"适应高原","detail":"布达拉宫+大昭寺+八廓街"}]},
    {"day":"Day 3","theme":"日喀则·扎什伦布寺","dayNum":3,"timeline":[{"time":"全天","activity":"拉萨→日喀则","detail":"380公里约6小时"}]},
    {"day":"Day 4","theme":"珠峰大本营","dayNum":4,"timeline":[{"time":"全天","activity":"前往珠峰","detail":"海拔5100米，看日落星空+日出"}]},
    {"day":"Day 7","theme":"冈仁波齐转山","dayNum":7,"timeline":[{"time":"全天","activity":"转山第一天","detail":"52公里分2天完成"}]},
    {"day":"Day 9","theme":"札达·古格王朝遗址","dayNum":9,"timeline":[{"time":"全天","activity":"古格遗址+托林寺","detail":"废墟中藏着千年壁画"}]},
    {"day":"Day 10","theme":"狮泉河休整","dayNum":10,"timeline":[{"time":"全天","activity":"补充物资","detail":"阿里补给点，最后大城市"}]},
    {"day":"Day 13","theme":"纳木错·返回拉萨","dayNum":13,"timeline":[{"time":"全天","activity":"纳木错游玩→拉萨","detail":"圣湖扎西半岛+返程"}]},
  ],
},

# ============ 4. 川西稻城亚丁深度环线 ============
{
  "id":"sichuan-daocheng","name":"川西稻城亚丁深度环线","countryTag":"🇨🇳 国内","days":"9天8晚",
  "cover":"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80",
  "price":"¥4,500/人起","rating":"★★★★★","tag":"最后香格里拉","tags":["国内","自驾","摄影","川西"],
  "routePins":["成都","新都桥","理塘","稻城","亚丁村","香格里拉","丽江","成都"],
  "totalKm":"约2,600公里","bestTime":"9-10月秋景最美/5-6月花海",
  "coverages":["新都桥光影","贡嘎山远眺","理塘毛垭草原","稻城亚丁三神山","香格里拉普达措","丽江古城"],
  "description":"从成都到香格里拉，穿越4000米海拔的川西高原。贡嘎山、新都桥、理塘、稻城亚丁三神山——地球上最后一片净土。",
  "mapPoints":[
    {"name":"成都","x":100.0,"y":15.4,"day":"Day 1"},{"name":"新都桥","x":70.8,"y":0.0,"day":"Day 2"},
    {"name":"理塘","x":41.7,"y":23.1,"day":"Day 3"},{"name":"稻城","x":20.8,"y":30.8,"day":"Day 4"},
    {"name":"亚丁村","x":12.5,"y":46.2,"day":"Day 5"},{"name":"香格里拉","x":0.0,"y":69.2,"day":"Day 6"},
    {"name":"丽江","x":20.8,"y":100.0,"day":"Day 7"},{"name":"成都","x":100.0,"y":15.4,"day":"Day 9"},
  ],
  "realCoords":coords(["成都","新都桥","理塘","稻城","亚丁村","香格里拉","丽江","成都"]),
  "flights":[F("北京","成都","¥800-1500"),F("上海","成都","¥1000-1800"),F("广州","成都","¥900-1600")],
  "trains":[T("西安","成都","¥200起","约8小时","高铁"),T("重庆","成都","¥99起","约2小时","高铁")],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海/广州→成都 ¥800-1800"},
    {"label":"🚄 火车","value":"全国高铁直达成都，西安2小时就到"},
    {"label":"🚗 租车","value":"SUV ¥400-700/天，川西山路需要性能车"},
    {"label":"🚐 包车","value":"含司机 ¥800-1200/天"},
  ],
  "hotels":[
    H("稻城亚丁智选假日","comfort","¥500-800","稻城县","带供氧，性价比最高","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("新都桥摄影主题民宿","comfort","¥400-700","新都桥镇","摄影发烧友聚集地","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("丽江古城客栈","comfort","¥400-800","古城内","纳西风格四合院","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"藏式火锅","desc":"牦牛肉+酥油茶","price":"¥80-150/人"},{"name":"酥油茶","desc":"咸香解腻抗高原反应","price":"¥15-30/壶"},{"name":"石锅炖鸡","desc":"高原土鸡石锅慢炖","price":"¥150-200/份"}],
  "tips":["理塘海拔4000米，别剧烈运动","稻城亚丁牛奶海海拔4600米带氧气瓶","亚丁景区徒步分短线长线","尊重藏族习俗不踩门槛不摸头"],
  "budget":[{"label":"机票","value":"¥800-1800"},{"label":"交通","value":"¥3000-5000"},{"label":"住宿","value":"¥3000-5600"},{"label":"合计人均","value":"¥9000-15000"}],
  "itinerary":[
    {"day":"Day 1","theme":"成都集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达成都","detail":"锦里+宽窄巷子+火锅"}]}  ,
    {"day":"Day 2","theme":"成都→雅安→康定→新都桥","dayNum":2,"timeline":[{"time":"全天","activity":"折多山垭口","detail":"海拔4298米，新都桥拍光影"}]},
    {"day":"Day 3","theme":"新都桥→理塘","dayNum":3,"timeline":[{"time":"全天","activity":"毛垭大草原","detail":"世界高城理塘，海拔4000米"}]},
    {"day":"Day 4","theme":"理塘→稻城","dayNum":4,"timeline":[{"time":"全天","activity":"海子山自然保护区","detail":"兔儿山+波瓦山垭口"}]},
    {"day":"Day 5","theme":"亚丁村·短线冲牛奶海","dayNum":5,"timeline":[{"time":"全天","activity":"冲古寺+珍珠海","detail":"短线轻松，长线五色海需要体力"}]},
    {"day":"Day 6","theme":"稻城→香格里拉","dayNum":6,"timeline":[{"time":"全天","activity":"独克宗古城","detail":"龟山公园21吨大转经筒"}]},
    {"day":"Day 7","theme":"香格里拉→丽江","dayNum":7,"timeline":[{"time":"全天","activity":"丽江古城","detail":"束河古镇+玉龙雪山"}]},
    {"day":"Day 9","theme":"丽江→成都","dayNum":9,"timeline":[{"time":"全天","activity":"返回成都","detail":"大理中转+返程"}]}  ,
  ],
},

# ============ 5. 日本本州经典环线（国外） ============
{
  "id":"japan-classic","name":"日本本州经典环线","countryTag":"🌍 国外","days":"9天8晚",
  "cover":"https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600&q=80",
  "price":"¥7,500/人起","rating":"★★★★★","tag":"樱花红叶","tags":["国外","日本","经典","高铁"],
  "routePins":["东京","镰仓","箱根","富士山","京都","大阪","奈良"],
  "totalKm":"约1,800公里","bestTime":"3-4月樱花季/11月红叶季",
  "coverages":["浅草寺","富士山五合目","清水寺","岚山竹林","大阪环球影城","奈良小鹿"],
  "description":"东京→镰仓→箱根→富士山→京都→大阪→奈良的经典环线。樱花季看樱、红叶季看枫，一年四季都有不同的日本味道。",
  "mapPoints":[
    {"name":"东京","x":100.0,"y":15.0,"day":"Day 1"},{"name":"镰仓","x":60.0,"y":30.0,"day":"Day 2"},
    {"name":"箱根","x":30.0,"y":45.0,"day":"Day 3"},{"name":"富士山","x":15.0,"y":60.0,"day":"Day 4"},
    {"name":"京都","x":20.0,"y":85.0,"day":"Day 5"},{"name":"大阪","x":15.0,"y":92.0,"day":"Day 7"},
    {"name":"奈良","x":30.0,"y":100.0,"day":"Day 8"},
  ],
  "realCoords":coords(["东京","镰仓","箱根","富士山","京都","大阪","奈良"]),
  "flights":[F("北京","东京","¥2000-4000","提前3个月订特价票"),F("上海","东京","¥1500-3500"),F("广州","东京","¥2500-4500")],
  "trains":[T("东京","京都","¥900起","约2.5小时","新干线🚅 Nozomi号"),T("京都","大阪","¥150起","约30分钟","新干线")],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海→东京成田/羽田 ¥1500-4000"},
    {"label":"🚄 新干线","value":"东京→京都新干线2.5小时¥900，买JR Pass更划算"},
    {"label":"🚌 市内交通","value":"地铁/巴士一日券¥50-80，Suica/Pasmo卡通用"},
  ],
  "hotels":[
    H("东京新宿格拉斯丽酒店","luxury","¥1200-2000","新宿","机器人餐厅就在楼下","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("京都四季酒店","luxury","¥2000-3500","东山","俯瞰祗园和鸭川","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("大阪难波格拉斯丽酒店","comfort","¥800-1200","难波","心斋桥步行5分钟","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"拉面","desc":"豚骨/酱油/味噌三种流派","price":"¥60-100/碗"},{"name":"寿司","desc":"新鲜握寿司拼盘","price":"¥200-500/份"},{"name":"怀石料理","desc":"京都传统多道菜套餐","price":"¥500-1500/人"}],
  "tips":["JR Pass在国内买比日本买便宜","樱花季酒店提前2-3个月订","日本地铁按线路收费，一日券省钱","大阪环球影城提前买快速券"],
  "budget":[{"label":"机票","value":"¥1500-4500"},{"label":"交通","value":"¥1500-2500（含JR Pass）"},{"label":"住宿","value":"¥6000-10000（8晚）"},{"label":"合计人均","value":"¥12000-22000"}],
  "itinerary":[
    {"day":"Day 1","theme":"东京集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达东京","detail":"浅草寺+晴空塔+秋叶原"}]}  ,
    {"day":"Day 2","theme":"东京→镰仓一日游","dayNum":2,"timeline":[{"time":"全天","activity":"镰仓高校前+大佛","detail":"灌篮高手圣地巡礼"}]}  ,
    {"day":"Day 3","theme":"箱根温泉","dayNum":3,"timeline":[{"time":"全天","activity":"芦之湖+海盗船","detail":"箱根汤本温泉旅馆住宿"}]}  ,
    {"day":"Day 4","theme":"富士山五合目","dayNum":4,"timeline":[{"time":"全天","activity":"河口湖+忍野八海","detail":"天气好能看到富士山倒影"}]}  ,
    {"day":"Day 5","theme":"京都经典","dayNum":5,"timeline":[{"time":"全天","activity":"清水寺+伏见稻荷","detail":"千本鸟居+二年坂三年坂"}]}  ,
    {"day":"Day 6","theme":"京都深度","dayNum":6,"timeline":[{"time":"全天","activity":"岚山竹林+金阁寺","detail":"天龙寺+渡月桥"}]}  ,
    {"day":"Day 7","theme":"大阪环球影城","dayNum":7,"timeline":[{"time":"全天","activity":"USJ","detail":"哈利波特园区必去"}]}  ,
    {"day":"Day 8","theme":"奈良小鹿","dayNum":8,"timeline":[{"time":"上午","activity":"奈良公园","detail":"买鹿仙贝喂小鹿"}]}  ,
    {"day":"Day 9","theme":"大阪返程","dayNum":9,"timeline":[{"time":"全天","activity":"大阪关西机场","detail":"心斋桥最后购物"}]}  ,
  ],
},

# ============ 6. 欧洲五国自驾环线（国外） ============
{
  "id":"europe-five","name":"欧洲五国经典自驾","countryTag":"🌍 国外","days":"12天11晚",
  "cover":"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
  "price":"¥28,000/人起","rating":"★★★★★","tag":"浪漫欧洲","tags":["国外","欧洲","自驾","经典"],
  "routePins":["巴黎","布鲁塞尔","阿姆斯特丹","柏林","布拉格","维也纳"],
  "totalKm":"约2,800公里","bestTime":"5-6月春暖花开/9-10月秋高气爽",
  "coverages":["埃菲尔铁塔","布鲁塞尔大广场","阿姆斯特丹运河","柏林墙遗址","布拉格城堡","维也纳金色大厅"],
  "description":"巴黎→布鲁塞尔→阿姆斯特丹→柏林→布拉格→维也纳，12天自驾穿越欧洲五国，每个城市都是世界著名景点聚集地。",
  "mapPoints":[
    {"name":"巴黎","x":0.0,"y":50.0,"day":"Day 1"},{"name":"布鲁塞尔","x":25.0,"y":30.0,"day":"Day 3"},
    {"name":"阿姆斯特丹","x":30.0,"y":55.0,"day":"Day 5"},{"name":"柏林","x":55.0,"y":15.0,"day":"Day 7"},
    {"name":"布拉格","x":70.0,"y":45.0,"day":"Day 9"},{"name":"维也纳","x":100.0,"y":55.0,"day":"Day 11"},
  ],
  "realCoords":coords(["巴黎","布鲁塞尔","阿姆斯特丹","柏林","布拉格","维也纳"]),
  "flights":[F("北京","巴黎","¥4000-8000","提前3个月订特价票"),F("上海","巴黎","¥4500-8500"),F("广州","巴黎","¥5000-9000")],
  "trains":[T("巴黎","阿姆斯特丹","¥800起","约3小时","Thalys高铁"),T("柏林","布拉格","¥300起","约4小时","ICE火车")],
  "transport":[
    {"label":"✈️ 机票","value":"北京→巴黎直飞10小时¥4000-8000"},
    {"label":"🚄 欧洲之星","value":"巴黎→阿姆斯特丹Thalys高铁3小时¥800"},
    {"label":"🚗 租车","value":"自动挡轿车/旅行车 ¥300-600/天，含保险不限里程"},
    {"label":"🚌 市内交通","value":"地铁/巴士/有轨电车，通票¥50-100/天"},
  ],
  "hotels":[
    H("巴黎香榭丽舍万豪酒店","luxury","¥2500-4000","香榭丽舍大街","步行到凯旋门+老佛爷","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("阿姆斯特丹运河酒店","luxury","¥2000-3500","运河区","运河边4星+自行车免费","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("柏林米特区精品酒店","comfort","¥1200-2000","米特区","步行到柏林墙遗址","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"法餐","desc":"鹅肝/松露/红酒烩鸡","price":"¥300-800/人"},{"name":"比利时啤酒+华夫饼","desc":"300多种啤酒+现烤华夫饼","price":"¥100-300"},{"name":"德式猪肘","desc":"外脆里嫩配酸菜和啤酒","price":"¥150-300/份"},{"name":"维也纳炸牛排","desc":"Schnitzel配土豆沙拉","price":"¥200-400/份"}],
  "tips":["租车需要国际驾照翻译件","欧洲高速收费，预留过路费","5-6月游客多酒店提前3个月订","每天换城市提前查停车信息","欧洲小偷多看好随身包"],
  "budget":[{"label":"机票","value":"¥4000-9000"},{"label":"交通","value":"¥6000-10000（租车+油费+过路费）"},{"label":"住宿","value":"¥15000-25000（11晚）"},{"label":"合计人均","value":"¥28000-50000"}],
  "itinerary":[
    {"day":"Day 1","theme":"巴黎集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达巴黎","detail":"埃菲尔铁塔+香榭丽舍+凯旋门"}]}  ,
    {"day":"Day 3","theme":"巴黎→布鲁塞尔","dayNum":3,"timeline":[{"time":"全天","activity":"自驾2.5小时","detail":"布鲁塞尔大广场+撒尿小童+巧克力店"}]}  ,
    {"day":"Day 5","theme":"布鲁塞尔→阿姆斯特丹","dayNum":5,"timeline":[{"time":"全天","activity":"自驾2小时","detail":"运河游船+安妮之家+梵高博物馆"}]}  ,
    {"day":"Day 7","theme":"阿姆斯特丹→柏林","dayNum":7,"timeline":[{"time":"全天","activity":"高铁4小时","detail":"柏林墙遗址+勃兰登堡门+博物馆岛"}]}  ,
    {"day":"Day 9","theme":"柏林→布拉格","dayNum":9,"timeline":[{"time":"全天","activity":"自驾4小时","detail":"布拉格城堡+查理大桥+天文钟"}]}  ,
    {"day":"Day 11","theme":"布拉格→维也纳","dayNum":11,"timeline":[{"time":"全天","activity":"自驾5小时","detail":"美泉宫+金色大厅+圣史蒂芬大教堂"}]}  ,
    {"day":"Day 12","theme":"维也纳返程","dayNum":12,"timeline":[{"time":"全天","activity":"机场送机","detail":"最后购物+返程"}]}  ,
  ],
},

# ============ 7. 东南亚海岛环线（国外） ============
{
  "id":"seasia-islands","name":"东南亚海岛深度","countryTag":"🌍 国外","days":"10天9晚",
  "cover":"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&q=80",
  "price":"¥6,500/人起","rating":"★★★★★","tag":"海岛度假","tags":["国外","东南亚","海岛","度假"],
  "routePins":["新加坡","槟城","兰卡威","普吉岛","巴厘岛"],
  "totalKm":"约500公里（含3次飞行）","bestTime":"11-4月干季（避开雨季）",
  "coverages":["滨海湾金沙","槟城老城","兰卡威缆车","普吉岛芭东海滩","巴厘岛乌布梯田"],
  "description":"新加坡→槟城→兰卡威→普吉岛→巴厘岛的海岛之旅。城市+海岛+美食+SPA，一站式东南亚体验。",
  "mapPoints":[
    {"name":"新加坡","x":60.0,"y":55.0,"day":"Day 1"},{"name":"槟城","x":50.0,"y":45.0,"day":"Day 3"},
    {"name":"兰卡威","x":40.0,"y":35.0,"day":"Day 5"},{"name":"普吉岛","x":20.0,"y":30.0,"day":"Day 7"},
    {"name":"巴厘岛","x":0.0,"y":100.0,"day":"Day 9"},
  ],
  "realCoords":coords(["新加坡","槟城","兰卡威","普吉岛","巴厘岛"]),
  "flights":[F("北京","新加坡","¥2500-4500","新航/国航直飞6小时"),F("上海","新加坡","¥2000-4000"),F("广州","新加坡","¥1500-3000")],
  "trains":[{"from":"吉隆坡","to":"新加坡","price":"¥80起","duration":"约5小时","time":"KTMB国际火车（到新山后过关）","bookingUrl":"https://www.ktmb.com.my","platform":"KTMB"}],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海→新加坡直飞¥2000-4500"},
    {"label":"🚗 本地交通","value":"Grab打车/巴士/机场快线，比国内便宜"},
    {"label":"✈️ 段间飞行","value":"新加坡→槟城→兰卡威→普吉岛→巴厘岛亚航/酷航¥200-500/段"},
    {"label":"🚢 轮渡","value":"兰卡威↔槟城轮渡¥100-200"},
  ],
  "hotels":[
    H("新加坡滨海湾金沙","luxury","¥2500-4000","滨海湾","无边泳池看烟花秀","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("槟城乔治市精品酒店","comfort","¥600-1000","乔治市","老城街头艺术+娘惹菜","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("普吉岛芭东海滩度假村","comfort","¥500-900","芭东","出门就是海滩+夜市","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"新加坡辣椒蟹","desc":"螃蟹+辣椒酱料","price":"¥200-300/份"},{"name":"槟城炒粿条","desc":"河粉炒蚶+豆芽","price":"¥15-30/份"},{"name":"冬阴功汤","desc":"泰式酸辣汤虾","price":"¥60-120/碗"},{"name":"印尼沙爹","desc":"烤肉串配花生酱","price":"¥30-50/份"}],
  "tips":["东南亚签证落地签/电子签，提前办","热带地区带防晒霜+驱蚊液","小费文化，酒店/餐厅给10%","避免榴莲带上酒店和飞机"],
  "budget":[{"label":"机票","value":"¥2000-4500"},{"label":"段间飞行","value":"¥1500-3000"},{"label":"住宿","value":"¥5000-9000（9晚）"},{"label":"合计人均","value":"¥11000-20000"}],
  "itinerary":[
    {"day":"Day 1","theme":"新加坡集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达新加坡","detail":"滨海湾金沙+ Gardens by the Bay 超级树"}]}  ,
    {"day":"Day 3","theme":"新加坡→槟城","dayNum":3,"timeline":[{"time":"上午","activity":"飞槟城1小时","detail":"乔治市老城壁画+娘惹菜"}]}  ,
    {"day":"Day 5","theme":"槟城→兰卡威","dayNum":5,"timeline":[{"time":"上午","activity":"飞兰卡威45分钟","detail":"天空之桥缆车+海滩"}]}  ,
    {"day":"Day 7","theme":"兰卡威→普吉岛","dayNum":7,"timeline":[{"time":"上午","activity":"飞普吉1.5小时","detail":"芭东海滩+人妖秀"}]}  ,
    {"day":"Day 9","theme":"普吉岛→巴厘岛","dayNum":9,"timeline":[{"time":"上午","activity":"飞巴厘岛2.5小时","detail":"乌布梯田+库塔海滩"}]}  ,
    {"day":"Day 10","theme":"巴厘岛返程","dayNum":10,"timeline":[{"time":"全天","activity":"机场送机","detail":"最后 SPA + 购物"}]}  ,
  ],
},

# ============ 8. 美西1号公路（国外） ============
{
  "id":"uswest-coast","name":"美西1号公路自驾","countryTag":"🌍 国外","days":"10天9晚",
  "cover":"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80",
  "price":"¥22,000/人起","rating":"★★★★★","tag":"公路旅行","tags":["国外","美国","自驾","公路"],
  "routePins":["洛杉矶","圣迭戈","棕榈泉","拉斯维加斯","旧金山"],
  "totalKm":"约2,800公里","bestTime":"4-6月春天气候舒适",
  "coverages":["好莱坞星光大道","圣迭戈动物园","大峡谷","金门大桥","硅谷"],
  "description":"洛杉矶→圣迭戈→棕榈泉→拉斯维加斯→旧金山，走著名的加州1号公路海景路线，大峡谷+羚羊彩穴+鲍威尔湖都在沿途。",
  "mapPoints":[
    {"name":"洛杉矶","x":10.0,"y":30.0,"day":"Day 1"},{"name":"圣迭戈","x":5.0,"y":45.0,"day":"Day 2"},
    {"name":"棕榈泉","x":35.0,"y":35.0,"day":"Day 4"},{"name":"拉斯维加斯","x":55.0,"y":50.0,"day":"Day 6"},
    {"name":"旧金山","x":100.0,"y":20.0,"day":"Day 9"},
  ],
  "realCoords":coords(["洛杉矶","圣迭戈","棕榈泉","拉斯维加斯","旧金山"]),
  "flights":[F("北京","洛杉矶","¥4000-8000","直飞12小时/转机便宜"),F("上海","洛杉矶","¥4000-8000")],
  "trains":[{"from":"洛杉矶","to":"旧金山","price":"¥600起","duration":"约12小时","time":"Amtrak海岸星光号","bookingUrl":"https://www.amtrak.com/routes/california-zephyr-train","platform":"Amtrak"}],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海→洛杉矶直飞12小时¥4000-8000"},
    {"label":"🚗 租车","value":"SUV ¥300-600/天含保险，加州一号公路必须自驾"},
    {"label":"🚌 市内交通","value":"洛杉矶/旧金山地铁巴士，Uber/Lyft打车方便"},
  ],
  "hotels":[
    H("洛杉矶好莱坞W酒店","luxury","¥1800-3000","好莱坞","步行到星光大道","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("拉斯维加斯贝拉吉奥度假村","luxury","¥2000-4000","拉斯维加斯大道","喷泉表演+赌场","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("旧金山联合广场酒店","comfort","¥1000-1800","联合广场","步行到唐人街+金门大桥","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"In-N-Out汉堡","desc":"加州特产三层汉堡","price":"¥80-120/份"},{"name":"墨西哥卷饼","desc":"Burrito/Taco","price":"¥40-80/份"},{"name":"阿拉斯加帝王蟹腿","desc":"拉斯维加斯自助餐","price":"¥200-400/人"}],
  "tips":["美国开车靠右侧，中国驾照可临时用","大峡谷建议住一晚看日出日落","拉斯维加斯酒店最好提前半年订","小费习惯：餐厅/司机/酒店每天都要给"],
  "budget":[{"label":"机票","value":"¥4000-8000"},{"label":"交通","value":"¥6000-9000（租车+油费）"},{"label":"住宿","value":"¥12000-25000（9晚）"},{"label":"合计人均","value":"¥22000-42000"}],
  "itinerary":[
    {"day":"Day 1","theme":"洛杉矶集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达洛杉矶","detail":"星光大道+环球影城+比弗利山庄"}]}  ,
    {"day":"Day 2","theme":"洛杉矶→圣迭戈","dayNum":2,"timeline":[{"time":"全天","activity":"自驾2小时","detail":"圣迭戈动物园+中途岛号航母"}]}  ,
    {"day":"Day 4","theme":"洛杉矶→棕榈泉","dayNum":4,"timeline":[{"time":"全天","activity":"自驾2小时","detail":"沙漠绿洲+缆车看全景"}]}  ,
    {"day":"Day 6","theme":"棕榈泉→拉斯维加斯","dayNum":6,"timeline":[{"time":"全天","activity":"自驾5小时","detail":"长街夜游+贝拉吉奥喷泉+赌场"}]}  ,
    {"day":"Day 7","theme":"拉斯维加斯→大峡谷","dayNum":7,"timeline":[{"time":"全天","activity":"自驾4小时","detail":"大峡谷西缘+空中走廊"}]}  ,
    {"day":"Day 9","theme":"大峡谷→旧金山","dayNum":9,"timeline":[{"time":"全天","activity":"自驾7小时","detail":"金门大桥+渔人码头+九曲花街"}]}  ,
    {"day":"Day 10","theme":"旧金山返程","dayNum":10,"timeline":[{"time":"全天","activity":"机场送机","detail":"斯坦福+硅谷最后参观"}]}  ,
  ],
},

# ============ 9. 新西兰南岛自驾（国外） ============
{
  "id":"nz-south","name":"新西兰南岛自驾","countryTag":"🌍 国外","days":"12天11晚",
  "cover":"https://images.unsplash.com/photo-1469521669194-babb45599def?w=1600&q=80",
  "price":"¥20,000/人起","rating":"★★★★★","tag":"中土世界","tags":["国外","新西兰","自驾","风景"],
  "routePins":["基督城","皇后镇","米尔福德峡湾","但尼丁","基督城"],
  "totalKm":"约3,000公里","bestTime":"12-2月夏天（可以滑雪+海滩）",
  "coverages":["皇后镇蹦极","米尔福德峡湾游船","福克斯冰川","但尼丁城堡","牧羊人教堂"],
  "description":"新西兰南岛是《指环王》中土世界的取景地！基督城→皇后镇→米尔福德峡湾→但尼丁的环线，湖光山色、雪山冰川、野生动物全有。",
  "mapPoints":[
    {"name":"基督城","x":20.0,"y":30.0,"day":"Day 1"},{"name":"皇后镇","x":0.0,"y":40.0,"day":"Day 3"},
    {"name":"米尔福德峡湾","x":10.0,"y":70.0,"day":"Day 5"},{"name":"但尼丁","x":80.0,"y":100.0,"day":"Day 9"},
    {"name":"基督城","x":100.0,"y":30.0,"day":"Day 11"},
  ],
  "realCoords":coords(["基督城","皇后镇","米尔福德峡湾","但尼丁","基督城"]),
  "flights":[F("北京","基督城","¥6000-12000","经奥克兰转机"),F("上海","基督城","¥6000-12000")],
  "trains":[{"from":"基督城","to":"但尼丁","price":"¥600起","duration":"约5小时","time":"Coastal Pacific观光","bookingUrl":"https://www.kiwirail.co.nz","platform":"Kiwirail"}],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海→基督城经奥克兰转机¥6000-12000"},
    {"label":"🚗 租车","value":"四驱SUV ¥400-700/天含保险，南岛山路多建议四驱"},
    {"label":"🚢 峡湾游船","value":"米尔福德峡湾游船¥500-800/人"},
  ],
  "hotels":[
    H("基督城赫尔顿酒店","luxury","¥1200-2000","市中心","重建后的现代风格","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("皇后镇湖边精品酒店","luxury","¥1500-2500","瓦纳卡湖景","湖景房看日落","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("但尼丁历史酒店","comfort","¥800-1400","市中心","维多利亚风格","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"三文鱼","desc":"新西兰冷水鲑鱼生吃最佳","price":"¥200-400/份"},{"name":"羊排","desc":"羔牛排配薄荷酱","price":"¥200-400/份"},{"name":"Hangi","desc":"毛利传统地底蒸肉","price":"¥300-500/人"},{"name":"Fergburger","desc":"皇后镇必吃网红汉堡","price":"¥60-100/份"}],
  "tips":["新西兰自驾必须GPS，信号差+路段险","皇后镇租车公司多对比价格","米尔福德峡湾提前半年订船票","南岛偏远地区小镇少，加油站提前加满","尊重毛利文化不碰碰鼻礼"],
  "budget":[{"label":"机票","value":"¥6000-12000"},{"label":"交通","value":"¥6000-8000"},{"label":"住宿","value":"¥10000-20000（11晚）"},{"label":"合计人均","value":"¥20000-40000"}],
  "itinerary":[
    {"day":"Day 1","theme":"基督城集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达基督城","detail":"重建的城市园林+植物园"}]}  ,
    {"day":"Day 3","theme":"基督城→皇后镇","dayNum":3,"timeline":[{"time":"全天","activity":"自驾3小时","detail":"特卡波湖+好牧羊人教堂星空"}]}  ,
    {"day":"Day 5","theme":"皇后镇→米尔福德峡湾","dayNum":5,"timeline":[{"time":"全天","activity":"自驾4小时+游船","detail":"峡湾壮丽景色+海豚海豹"}]}  ,
    {"day":"Day 7","theme":"皇后镇深度","dayNum":7,"timeline":[{"time":"全天","activity":"蹦极+跳伞+缆车","detail":"AJ Hackett蹦极发源地"}]}  ,
    {"day":"Day 9","theme":"皇后镇→但尼丁","dayNum":9,"timeline":[{"time":"全天","activity":"自驾4小时","detail":"但尼丁城堡+灯塔+企鹅"}]}  ,
    {"day":"Day 11","theme":"但尼丁→基督城","dayNum":11,"timeline":[{"time":"全天","activity":"自驾4小时","detail":"最后购物+返程"}]}  ,
    {"day":"Day 12","theme":"基督城返程","dayNum":12,"timeline":[{"time":"全天","activity":"机场送机","detail":"返程"}]}  ,
  ],
},

# ============ 10. 泰国北部深度（国外） ============
{
  "id":"thai-north","name":"泰国北部深度","countryTag":"🌍 国外","days":"8天7晚",
  "cover":"https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=80",
  "price":"¥5,800/人起","rating":"★★★★★","tag":"清新泰北","tags":["国外","泰国","文化","美食"],
  "routePins":["曼谷","阿育塔亚","清迈","清莱"],
  "totalKm":"约500公里（含2次飞行）","bestTime":"11-2月凉季（避开4-5月烧山季）",
  "coverages":["大皇宫","阿育塔亚佛像","清迈古城","蓝庙白庙","大象营","宁曼路"],
  "description":"曼谷→阿育塔亚→清迈→清莱，泰国北部精华环线。从繁华都市到千年古都再到山林秘境，佛教文化+美食SPA一网打尽。",
  "mapPoints":[
    {"name":"曼谷","x":100.0,"y":100.0,"day":"Day 1"},{"name":"阿育塔亚","x":80.0,"y":85.0,"day":"Day 2"},
    {"name":"清迈","x":20.0,"y":40.0,"day":"Day 4"},{"name":"清莱","x":0.0,"y":15.0,"day":"Day 7"},
  ],
  "realCoords":coords(["曼谷","阿育塔亚","清迈","清莱"]),
  "flights":[F("北京","曼谷","¥1500-3500","提前3个月订特价票"),F("上海","曼谷","¥1500-3500"),F("广州","曼谷","¥1000-2500")],
  "trains":[{"from":"曼谷","to":"清迈","price":"¥80起","duration":"约12小时","time":"卧铺过夜火车","bookingUrl":"https://www.railway.co.th","platform":"泰国国家铁路/SRT"}],
  "transport":[
    {"label":"✈️ 机票","value":"北京/上海→曼谷直飞¥1500-3500"},
    {"label":"🚄 火车","value":"曼谷→清迈卧铺火车12小时，晚上发车睡一觉到"},
    {"label":"🚗 包车","value":"清迈包车一日游¥300-500含司机导游"},
    {"label":"✈️ 段间飞行","value":"曼谷→清迈亚航¥200-500/1小时，比火车快得多"},
  ],
  "hotels":[
    H("曼谷香格里拉大酒店","luxury","¥1000-1800","是隆路","河边+露台无边泳池","https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
    H("清迈四季度假村","luxury","¥1500-2500","湄林","稻田中的奢华度假酒店","https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
    H("清莱精品民宿","comfort","¥400-800","清莱古城","蓝庙附近+设计感","https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80"),
  ],
  "foods":[{"name":"冬阴功","desc":"酸辣虾汤，泰国国汤","price":"¥40-80/份"},{"name":"芒果糯米饭","desc":"椰汁+糯米+青芒","price":"¥30-50/份"},{"name":"青木瓜沙拉","desc":"Som Tum 酸咸辣开胃","price":"¥20-40/份"},{"name":"街头烧烤","desc":"烤串+糯米配青木瓜","price":"¥20-40/份"}],
  "tips":["落地签免费到2026年，带上白底照片","泰国过马路靠左，注意摩托车","SPA体验多但选正规店","大皇宫不能穿短裤背心，门口有出租"],
  "budget":[{"label":"机票","value":"¥1000-3500"},{"label":"段间交通","value":"¥1500-3000"},{"label":"住宿","value":"¥4500-7000（7晚）"},{"label":"合计人均","value":"¥9000-16000"}],
  "itinerary":[
    {"day":"Day 1","theme":"曼谷集结","dayNum":1,"timeline":[{"time":"全天","activity":"抵达曼谷","detail":"大皇宫+玉佛寺+考山路夜市"}]}  ,
    {"day":"Day 2","theme":"曼谷→阿育塔亚","dayNum":2,"timeline":[{"time":"全天","activity":"大巴1.5小时","detail":"阿育塔亚古城遗址+卧佛"}]}  ,
    {"day":"Day 4","theme":"清迈深度","dayNum":4,"timeline":[{"time":"全天","activity":"飞清迈1小时","detail":"双龙寺+古城+宁曼路+SPA"}]}  ,
    {"day":"Day 5","theme":"清迈大象营","dayNum":5,"timeline":[{"time":"全天","activity":"湄林大象营","detail":"骑大象+大象洗澡"}]}  ,
    {"day":"Day 7","theme":"清莱蓝庙白庙","dayNum":7,"timeline":[{"time":"全天","activity":"飞清莱1.5小时","detail":"白庙+蓝庙+黑屋博物馆"}]}  ,
    {"day":"Day 8","theme":"清莱返程","dayNum":8,"timeline":[{"time":"全天","activity":"清莱→曼谷→国内","detail":"机场送机"}]}  ,
  ],
},

]  # END of LOOPS

print(f"✅ 生成 {len(LOOPS)} 条环线数据")

# Dump JSON
json_str = json.dumps(LOOPS, ensure_ascii=False, indent=2)

# ============ 渲染函数 ============
RENDER_JS = r"""

// ========== 环线地图渲染（SVG 路线 + 高德/谷歌真实地图跳转）==========
window.renderLoopMap = function(data) {
    if (!data) return '';
    const safe = (v) => String(v == null ? '' : v);
    const isCN = (data.tags || []).includes('国内');
    const coordSys = isCN ? 'gaode' : 'google';
    
    // SVG 路线节点（百分比坐标）
    const pins = (data.mapPoints || []);
    const lastX = pins[pins.length-1].x;
    const lastY = pins[pins.length-1].y;
    const firstX = pins[0].x;
    const firstY = pins[0].y;
    // 构建 SVG polyline 点（从起点到终点+回到起点形成闭环）
    const closed = pins[0].x === pins[pins.length-1].x && pins[0].y === pins[pins.length-1].y;
    let svgPoints = pins.map(p => `${p.x},${p.y}`).join(' ');
    if (!closed) svgPoints += ` ${firstX},${firstY}`;
    
    // 真实地图链接
    const coords = data.realCoords || [];
    let mapUrl = '';
    if (coords.length > 0 && isCN) {
        // 高德 marker
        mapUrl = `https://uri.amap.com/marker?position=${coords.map(c=>c[0]+','+c[1]).join('|')}&name=${encodeURIComponent(data.name||'')}&src=mylvyou&coordinate=gaode`;
    } else if (coords.length > 0 && !isCN) {
        // Google Maps
        mapUrl = `https://maps.google.com/maps?q=${coords.map(c=>c[1]+','+c[0]).join('|')}&z=5`;
    }
    
    const mapName = isCN ? '高德地图' : '谷歌地图';
    const tagColor = isCN ? '#ef4444' : '#3b82f6';
    const bgStyle = isCN ? 'linear-gradient(135deg,#fef3c7 0%,#fde68a 50%,#d9f99d 100%)' : 'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 50%,#a7f3d0 100%)';
    
    // 节点 HTML
    const nodesHtml = pins.map((p,i) => `
        <div class="loop-svg-pin" style="left:${p.x}%;top:${p.y}%" data-day="${safe(p.day)}" data-name="${safe(p.name)}">
            <div class="pin-number">${i+1}</div>
            <div class="pin-label-text">${safe(p.name)}</div>
        </div>
    `).join('');
    
    return `
        <div class="loop-map-section">
            <div class="loop-map-title">
                <i class="fas fa-map-marked-alt"></i>
                路线示意图 · 点击节点跳转 Day 行程
                <span class="map-badge" style="background:${tagColor}">${isCN?'🇨🇳 国内坐标':'🌍 国际坐标'}</span>
                <a href="${mapUrl}" target="_blank" class="map-open-link">🔗 在${mapName}打开真实路线</a>
            </div>
            <div class="loop-map-svg-wrap" style="background:${bgStyle}">
                <svg class="loop-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <!-- 背景网格 -->
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="0.2"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)"/>
                    <!-- 路线 -->
                    <polyline points="${svgPoints}" fill="none" stroke="${tagColor}" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1.5,0.5" style="filter:drop-shadow(0 0 0.3px rgba(0,0,0,0.2))"/>
                    <!-- 节点圆点 -->
                    ${pins.map((p,i)=>`<circle cx="${p.x}" cy="${p.y}" r="1.2" fill="${tagColor}" stroke="white" stroke-width="0.3" class="svg-map-dot" data-day="${safe(p.day)}"/>`).join('')}
                </svg>
                <div class="loop-map-nodes">
                    ${nodesHtml}
                </div>
            </div>
            <div class="loop-map-tip">💡 这是示意图，真实路线请点击上方「在${mapName}打开」查看</div>
        </div>
    `;
};

// ========== 环线详情弹窗渲染 ==========
window.renderLoopDetail = function(data) {
    if (!data) return '';
    const safe = (v) => String(v == null ? '' : v).replace(/[<>"&]/g, (c) => ({ '<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;' }[c]));

    // 封面横幅
    const banner = data.cover ? `
        <div class="loop-banner" style="background-image:url('${safe(data.cover)}')">
            <div class="loop-banner-overlay">
                <span class="loop-banner-country">${safe(data.countryTag || '')}</span>
                <h2>${safe(data.name)}</h2>
                <div class="loop-banner-meta">
                    <span>📅 ${safe(data.days)}</span>
                    <span>⭐ ${safe(data.rating || '')}</span>
                    <span>🛣️ ${safe(data.totalKm || '')}</span>
                </div>
                <div class="loop-banner-price">${safe(data.price || '¥2500起')}<small>/人</small></div>
            </div>
        </div>` : '';

    const mapHtml = window.renderLoopMap ? window.renderLoopMap(data) : '';

    // 亮点标签
    const hl = (data.coverages || []).map(h => 
        `<span class="meta-tag loop-hl"><i class="fas fa-star"></i> ${safe(h)}</span>`).join('');
    const hlHtml = hl ? `<div class="meta-row" style="margin-bottom:12px">${hl}</div>` : '';

    // 标签
    const tagHtml = (data.tags || []).map(t => `<span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:12px;font-size:.75rem;margin-right:6px">${safe(t)}</span>`).join('');

    // 行程
    const itin = (data.itinerary || []).map(day => {
        const tl = (day.timeline || []).map(item => {
            const m = [];
            if (item.duration) m.push(`<span class="meta-tag duration"><i class="fas fa-clock"></i> ${safe(item.duration)}</span>`);
            if (item.ticket) m.push(`<span class="meta-tag ticket"><i class="fas fa-ticket-alt"></i> ${safe(item.ticket)}</span>`);
            if (item.price) m.push(`<span class="meta-tag"><i class="fas fa-yen-sign"></i> ${safe(item.price)}</span>`);
            if (item.tip) m.push(`<span class="meta-tag tip"><i class="fas fa-lightbulb"></i> ${safe(item.tip)}</span>`);
            return `<div class="timeline-item"><div class="time">${safe(item.time)}</div><div class="activity">${safe(item.activity)}</div><div class="detail">${safe(item.detail)}</div>${m.length?`<div class="meta-row">${m.join('')}</div>`:''}</div>`;
        }).join('');
        const dn = (day.dayNum || (day.day ? parseInt(day.day.replace('Day ','')) : ''));
        return `<div class="itinerary-day loop-day" data-day="Day ${dn}"><h4><span class="day-tag loop-tag">${safe(day.day)}</span>${safe(day.theme || '')}</h4><div class="day-timeline">${tl}</div></div>`;
    }).join('');

    // 酒店（带图片+可点击）
    const tierMap = { economy:'经济型', comfort:'舒适型', luxury:'奢华型' };
    const hotels = (data.hotels || []).map(h => {
        const card = `<div class="hotel-card with-image">
            ${h.image ? `<div class="hotel-img"><img src="${safe(h.image)}" alt=""></div>` : ''}
            <div class="hotel-info">
                <div class="hotel-top">
                    <div class="hotel-tier-badge ${safe(h.tier)}">${tierMap[h.tier] || safe(h.tier)}</div>
                    <h5>${safe(h.name)}</h5>
                </div>
                <div class="hotel-price">${safe(h.price)}</div>
                <div class="area"><i class="fas fa-map-marker-alt"></i> ${safe(h.area)}</div>
                <div class="highlight">${safe(h.highlight)}</div>
                ${h.bookingUrl ? `<div class="booking-link"><i class="fas fa-external-link-alt"></i> 点击预订 →</div>` : ''}
            </div>
        </div>`;
        return h.bookingUrl ? `<a href="${safe(h.bookingUrl)}" target="_blank" class="hotel-card-link">${card}</a>` : card;
    }).join('');

    // 机票卡片（可点击购票）
    const flightCard = data.flights ? `<div class="flight-card"><h5><i class="fas fa-plane"></i> 机票参考（点击购票）</h5>${data.flights.map(f=>`<a href="${safe(f.bookingUrl)}" target="_blank" class="flight-item"><span class="from">${safe(f.from)}</span>→<span class="to">${safe(f.to)}</span><span class="price">${safe(f.price)}</span><span class="time">${safe(f.time || '')}</span><span class="buy-btn">去买 →</span></a>`).join('')}</div>` : '';

    // 火车卡片
    const trainCard = data.trains ? `<div class="train-card"><h5><i class="fas fa-train"></i> 火车/高铁参考（点击购票）</h5>${data.trains.map(t=>`<a href="${safe(t.bookingUrl)}" target="_blank" class="train-item"><span class="from">${safe(t.from)}</span>→<span class="to">${safe(t.to)}</span><span class="price">${safe(t.price)}</span><span class="dur">${safe(t.duration||'')}</span><span class="buy-btn">去买 →</span></a>`).join('')}</div>` : '';

    // 交通方式
    const transport = (data.transport || []).map(t => `<div class="transport-item"><div class="label">${safe(t.label)}</div><div class="value">${safe(t.value)}</div></div>`).join('');
    const foods = (data.foods || []).map(f => `<li><strong>${safe(f.name)}</strong> — ${safe(f.desc)} <em style="color:var(--primary);font-weight:600">${safe(f.price)}</em></li>`).join('');
    const tips = (data.tips || []).map(t => `<li>${safe(t)}</li>`).join('');
    const budget = (data.budget || []).map(b => `<div class="budget-item"><div class="label">${safe(b.label)}</div><div class="value">${safe(b.value)}</div></div>`).join('');

    setTimeout(() => { if (window.bindLoopMap) window.bindLoopMap(); }, 50);

    return `
        ${banner}
        ${mapHtml}
        ${hlHtml}
        ${tagHtml ? `<div style="margin-bottom:12px">${tagHtml}</div>` : ''}

        <div class="modal-section"><h3><i class="fas fa-info-circle"></i> 行程简介</h3><p>${safe(data.description)}</p><p style="color:var(--text-light);font-size:.85rem;margin-top:8px"><i class="fas fa-calendar-check"></i> 最佳时间：${safe(data.bestTime || '')}</p></div>

        ${flightCard}
        ${trainCard}

        <div class="modal-section"><h3><i class="fas fa-calendar-day"></i> ${safe(data.days)} 每日行程（共${(data.itinerary||[]).length}天）</h3>${itin}</div>

        <div class="modal-section"><h3><i class="fas fa-hotel"></i> 沿途住宿推荐</h3>${hotels}</div>

        <div class="info-grid">
            <div class="info-card"><h5><i class="fas fa-car"></i> 交通方案</h5>${transport}</div>
            <div class="info-card"><h5><i class="fas fa-utensils"></i> 必吃美食</h5><ul>${foods}</ul></div>
        </div>

        <div class="tips-warn"><h5><i class="fas fa-exclamation-triangle"></i> 避坑/安全提示</h5><ul>${tips}</ul></div>

        <div class="budget-bar"><h5><i class="fas fa-calculator"></i> 预算参考（人均）</h5><div class="budget-items">${budget}</div></div>
    `;
};

// ========== 城市弹窗渲染（含地图+机票+火车）==========
window.renderRichDetail = function(data) {
    if (!data) return '';
    const safe = (v) => String(v == null ? '' : v).replace(/[<>"&]/g, (c) => ({ '<':'&lt;','>':'&gt;','"':'&quot;','&':'&amp;' }[c]));

    const pins = (data.routePins || []).map((p,i) => `<span class="route-pin"><span class="pin-num">${i+1}</span>${safe(p)}</span>`).join('<span class="route-arrow">→</span>');
    const routeHtml = pins ? `<div class="route-visual"><div class="route-visual-title"><i class="fas fa-map-marked-alt"></i> 推荐游玩路线</div><div class="route-pins">${pins}</div></div>` : '';

    // 地图（城市静态示意 + 真实地图跳转）
    const foreignCountries = ['法国','日本','英国','美国','德国','泰国','印尼','印度尼西亚','阿联酋','新加坡','韩国','澳大利亚'];
    const isCN = !foreignCountries.includes((data.country || ''));
    const coords = data.coords || [];
    let cityMapHtml = '';
    if (coords.length >= 2) {
        let mapUrl = '';
        if (isCN) {
            mapUrl = `https://uri.amap.com/marker?position=${coords.map(c=>c[0]+','+c[1]).join('|')}&name=${encodeURIComponent(data.name||'')}&src=mylvyou&coordinate=gaode`;
        } else {
            mapUrl = `https://maps.google.com/maps?q=${coords.map(c=>c[1]+','+c[0]).join('|')}&z=12`;
        }
        const mapName = isCN ? '高德地图' : '谷歌地图';
        cityMapHtml = `
            <div class="loop-map-section">
                <div class="loop-map-title"><i class="fas fa-map-marked-alt"></i> ${safe(data.name)} 地图 <a href="${mapUrl}" target="_blank" class="map-open-link">🔗 在${mapName}打开</a></div>
                <div class="city-map-preview" style="background:${isCN?'linear-gradient(135deg,#fef3c7,#fde68a)':'linear-gradient(135deg,#dbeafe,#a7f3d0)'}">
                    <div class="city-map-pins">
                        ${(data.routePins || []).map((p,i)=>`<div class="city-map-pin" style="left:${10+i*80/Math.max(1,(data.routePins.length||1))}%;top:${20+(i%2)*40}%"><span class="pin-num">${i+1}</span><span class="pin-label">${safe(p)}</span></div>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    const itin = (data.itinerary || []).map(day => {
        const tl = (day.timeline || []).map(item => {
            const m = [];
            if (item.duration) m.push(`<span class="meta-tag duration"><i class="fas fa-clock"></i> ${safe(item.duration)}</span>`);
            if (item.ticket) m.push(`<span class="meta-tag ticket"><i class="fas fa-ticket-alt"></i> ${safe(item.ticket)}</span>`);
            if (item.price) m.push(`<span class="meta-tag"><i class="fas fa-yen-sign"></i> ${safe(item.price)}</span>`);
            if (item.tip) m.push(`<span class="meta-tag tip"><i class="fas fa-lightbulb"></i> ${safe(item.tip)}</span>`);
            return `<div class="timeline-item"><div class="time">${safe(item.time)}</div><div class="activity">${safe(item.activity)}</div><div class="detail">${safe(item.detail)}</div>${m.length?`<div class="meta-row">${m.join('')}</div>`:''}</div>`;
        }).join('');
        return `<div class="itinerary-day"><h4><span class="day-tag">${safe(day.day)}</span>${safe(day.theme || '')}</h4><div class="day-timeline">${tl}</div></div>`;
    }).join('');

    const tierMap = { economy:'经济型', comfort:'舒适型', luxury:'奢华型' };
    const hotels = (data.hotels || []).map(h => {
        const card = `<div class="hotel-card ${h.image ? 'with-image' : ''}">
            ${h.image ? `<div class="hotel-img"><img src="${safe(h.image)}" alt=""></div>` : ''}
            <div class="hotel-info">
                <div class="hotel-top">
                    <div class="hotel-tier-badge ${safe(h.tier)}">${tierMap[h.tier] || safe(h.tier)}</div>
                    <h5>${safe(h.name)}</h5>
                </div>
                <div class="hotel-price">${safe(h.price)}</div>
                <div class="area"><i class="fas fa-map-marker-alt"></i> ${safe(h.area)}</div>
                <div class="highlight">${safe(h.highlight)}</div>
                ${h.bookingUrl ? `<div class="booking-link"><i class="fas fa-external-link-alt"></i> 点击预订 →</div>` : ''}
            </div>
        </div>`;
        return h.bookingUrl ? `<a href="${safe(h.bookingUrl)}" target="_blank" class="hotel-card-link">${card}</a>` : card;
    }).join('');

    // 机票
    const airfare = data.airfare ? `<div class="flight-card"><h5><i class="fas fa-plane"></i> 机票参考（点击购票）</h5>${data.airfare.map(a=>`<a href="${safe(a.bookingUrl || (window.CTF ? '' : ''))}" target="_blank" class="flight-item"><span class="from">${safe(a.from)}</span>→<span class="to">${safe(a.to)}</span><span class="price">${safe(a.price)}</span><span class="time">${safe(a.time || '')}</span>${a.bookingUrl?'<span class="buy-btn">去买 →</span>':''}</a>`).join('')}</div>` : '';
    
    // 火车
    const trains = data.trains ? `<div class="train-card"><h5><i class="fas fa-train"></i> 火车/高铁参考（点击购票）</h5>${data.trains.map(t=>`<a href="${safe(t.bookingUrl)}" target="_blank" class="train-item"><span class="from">${safe(t.from)}</span>→<span class="to">${safe(t.to)}</span><span class="price">${safe(t.price)}</span><span class="dur">${safe(t.duration||'')}</span><span class="buy-btn">去买 →</span></a>`).join('')}</div>` : '';

    const transport = (data.transport || []).map(t => `<div class="transport-item"><div class="label">${safe(t.label)}</div><div class="value">${safe(t.value)}</div></div>`).join('');
    const foods = (data.foods || []).map(f => `<li><strong>${safe(f.name)}</strong> — ${safe(f.desc)} <em style="color:var(--primary);font-weight:600">${safe(f.price)}</em></li>`).join('');
    const tips = (data.tips || []).map(t => `<li>${safe(t)}</li>`).join('');
    const budget = (data.budget || []).map(b => `<div class="budget-item"><div class="label">${safe(b.label)}</div><div class="value">${safe(b.value)}</div></div>`).join('');
    const tagHtml = (data.tags || []).map(t => `<span style="background:var(--primary-light);color:var(--primary);padding:2px 10px;border-radius:12px;font-size:.75rem;margin-right:6px">${safe(t)}</span>`).join('');

    return `${routeHtml}
        ${tagHtml ? `<div style="margin-top:12px">${tagHtml}</div>` : ''}
        ${cityMapHtml}
        ${airfare}
        ${trains}
        <div class="modal-section"><h3><i class="fas fa-calendar-day"></i> 每日行程安排</h3>${itin}</div>
        <div class="modal-section"><h3><i class="fas fa-hotel"></i> 酒店推荐</h3>${hotels}</div>
        <div class="info-grid"><div class="info-card"><h5><i class="fas fa-bus"></i> 交通指南</h5>${transport}</div><div class="info-card"><h5><i class="fas fa-utensils"></i> 美食推荐</h5><ul>${foods}</ul></div></div>
        <div class="tips-warn"><h5><i class="fas fa-exclamation-triangle"></i> 避坑小贴士</h5><ul>${tips}</ul></div>
        <div class="budget-bar"><h5><i class="fas fa-calculator"></i> 预算参考</h5><div class="budget-items">${budget}</div></div>
    `;
};

// ========== 地图节点点击联动 ==========
window.bindLoopMap = function() {
    document.querySelectorAll('.loop-svg-pin').forEach(pin => {
        pin.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const target = document.querySelector(`.itinerary-day[data-day="${day}"]`);
            if (target) {
                document.querySelectorAll('.itinerary-day').forEach(d => d.style.boxShadow = 'none');
                target.style.boxShadow = '0 0 0 3px var(--primary)';
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => { target.style.boxShadow = 'none'; }, 3000);
            }
        });
    });
    document.querySelectorAll('.svg-map-dot').forEach(dot => {
        dot.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            const target = document.querySelector(`.itinerary-day[data-day="${day}"]`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
};
"""

# 写入文件
with open('/workspace/loop-data.js', 'w', encoding='utf-8') as f:
    f.write('window.LOOP_ROUTES = ')
    f.write(json_str)
    f.write('\n')
    f.write(RENDER_JS)

print(f"\n✅ loop-data.js 写入完成")
print(f"   - {len(LOOPS)} 条环线")
print(f"   - 含 renderLoopMap / renderLoopDetail / renderRichDetail / bindLoopMap")
