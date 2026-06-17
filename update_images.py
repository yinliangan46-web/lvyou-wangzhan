import re, json

# Wikimedia Commons images for each Chinese city
wikimedia = {
    "北京": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg/960px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg",
    "上海": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg/960px-Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg",
    "广州": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Canton_Tower_20241027.jpg/960px-Canton_Tower_20241027.jpg",
    "深圳": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Commercial_area_of_futian_to_east2020.jpg/960px-Commercial_area_of_futian_to_east2020.jpg",
    "成都": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg/960px-%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg",
    "杭州": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg/960px-%E6%9D%AD%E5%B7%9E%E9%92%B1%E6%B1%9F%E6%96%B0%E5%9F%8E_4_%28cropped%29.jpg",
    "西安": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg/960px-City_wall_of_Xi%27an_51550-Xian_%2827959363326%29.jpg",
    "重庆": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Chongqing_Skyline_2025.jpg/960px-Chongqing_Skyline_2025.jpg",
    "武汉": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/%E6%AD%A6%E6%B1%89%E9%BB%84%E9%B9%A4%E6%A5%BC%E4%BF%AF%E7%9E%B0.jpg/960px-%E6%AD%A6%E6%B1%89%E9%BB%84%E9%B9%A4%E6%A5%BC%E4%BF%AF%E7%9E%B0.jpg",
    "长沙": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/%E7%88%B1%E6%99%9A%E4%BA%AD%EF%BC%88%E7%A7%8B-%E4%BE%A7%E9%9D%A2%EF%BC%89.jpg/960px-%E7%88%B1%E6%99%9A%E4%BA%AD%EF%BC%88%E7%A7%8B-%E4%BE%A7%E9%9D%A2%EF%BC%89.jpg",
    "南京": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanjing_CBD_night.jpg/960px-Nanjing_CBD_night.jpg",
    "沈阳": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/%E6%B2%88%E9%98%B3%E6%95%85%E5%AE%AB%E5%A4%A7%E6%94%BF%E6%AE%BF%E6%BB%A1%E6%96%87%E5%8C%BA%E6%99%AF.jpg/960px-%E6%B2%88%E9%98%B3%E6%95%85%E5%AE%AB%E5%A4%A7%E6%94%BF%E6%AE%BF%E6%BB%A1%E6%96%87%E5%8C%BA%E6%99%AF.jpg",
    "哈尔滨": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/26935-Harbin_Saint_Sophia_Cathedral.jpg/960px-26935-Harbin_Saint_Sophia_Cathedral.jpg",
    "昆明": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/%E4%BA%94%E5%8D%8E%E5%B1%B1_%E6%98%86%E6%98%8E_2023.jpg/960px-%E4%BA%94%E5%8D%8E%E5%B1%B1_%E6%98%86%E6%98%8E_2023.jpg",
    "合肥": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/%E5%A4%A9%E9%98%99%E5%9C%88%E5%95%86%E5%8A%A1%E5%8C%BA2020.jpg/960px-%E5%A4%A9%E9%98%99%E5%9C%88%E5%95%86%E5%8A%A1%E5%8C%BA2020.jpg",
    "福州": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Fuzhou_skyline_from_Yuhu_Island.jpg/960px-Fuzhou_skyline_from_Yuhu_Island.jpg",
    "南昌": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanchang_Skyline.jpeg/960px-Nanchang_Skyline.jpeg",
    "郑州": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Zhengdong_CBD_Skyline.jpg/960px-Zhengdong_CBD_Skyline.jpg",
    "济南": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Skyline_of_Central_Jinan.jpg/960px-Skyline_of_Central_Jinan.jpg",
    "石家庄": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zhuangli_Commercial_Area.jpg/960px-Zhuangli_Commercial_Area.jpg",
    "太原": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Taiyuan_skyline_2020.jpg/960px-Taiyuan_skyline_2020.jpg",
    "呼和浩特": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hohhot_Skyline.jpeg/960px-Hohhot_Skyline.jpeg",
    "长春": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/%E9%81%A5%E6%9C%9B%E5%81%87%E6%97%A5%E5%85%89%E5%8D%8E%E8%B7%AF.jpg/960px-%E9%81%A5%E6%9C%9B%E5%81%87%E6%97%A5%E5%85%89%E5%8D%8E%E8%B7%AF.jpg",
    "南宁": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Skyline_of_City_of_Nanning.jpg/960px-Skyline_of_City_of_Nanning.jpg",
    "海口": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Haikou_montage.jpg/960px-Haikou_montage.jpg",
    "贵阳": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Guizhou_Financial_Towers.jpg/960px-Guizhou_Financial_Towers.jpg",
    "拉萨": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lhassa_Potala.jpg/960px-Lhassa_Potala.jpg",
    "兰州": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Skyline_Lanzhou_China.jpg/960px-Skyline_Lanzhou_China.jpg",
    "西宁": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Skyscrapers_in_Xining.jpg/960px-Skyscrapers_in_Xining.jpg",
    "银川": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Skyline_of_Jinfeng_District%2C_Yinchuan.jpg/960px-Skyline_of_Jinfeng_District%2C_Yinchuan.jpg",
    "乌鲁木齐": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Urumqi_skyline_2023.jpg/960px-Urumqi_skyline_2023.jpg",
    "桂林": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Xiangshan_Scenic_Area.jpg/960px-Xiangshan_Scenic_Area.jpg",
    "大理": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Three_Pagodas_of_Chongsheng_Temple.jpg/960px-Three_Pagodas_of_Chongsheng_Temple.jpg",
    "苏州": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Suzhou_skyline_from_Gusu.jpg/960px-Suzhou_skyline_from_Gusu.jpg",
    "青岛": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Qingdao_skyline_2021.jpg/960px-Qingdao_skyline_2021.jpg",
    "厦门": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Xiamen_University_%26_Lulin_Bay.jpg/960px-Xiamen_University_%26_Lulin_Bay.jpg",
    "丽江": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Lijiang_gucheng_2012.jpg/960px-Lijiang_gucheng_2012.jpg",
    "张家界": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Avatar_Hallelujah_Mountain.jpg/960px-Avatar_Hallelujah_Mountain.jpg",
    "黄山": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Mount_Huangshan_%26_Sea_of_Clouds.jpg/960px-Mount_Huangshan_%26_Sea_of_Clouds.jpg",
    "三亚": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Sanya_Bay_view_2024.jpg/960px-Sanya_Bay_view_2024.jpg",
    "乐山": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Leshan_Buddha_2023.jpg/960px-Leshan_Buddha_2023.jpg",
    "九寨沟": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "敦煌": "https://images.unsplash.com/photo-1486911278844-a81c5267e227",
    "西双版纳": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    "黄果树": "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
}

# Update JS
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

for city, img_url in wikimedia.items():
    # Replace in thumbnails (w=400)
    pattern = r'(alt="' + re.escape(city) + r'"[^>]*src=")https?://[^"]+?(\?w=400&q=80")'
    replacement = r"\1" + img_url + r"\2"
    html = re.sub(pattern, replacement, html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("HTML updated")

# Update JS
with open("script.js", "r", encoding="utf-8") as f:
    js = f.read()

for city, img_url in wikimedia.items():
    # Replace the img URL in destinationData
    pattern = r"(name:'" + re.escape(city) + r"'.*?img:')https?://[^']+(\?w=800&q=80')"
    replacement = r"\1" + img_url + r"\2"
    js = re.sub(pattern, replacement, js)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js)
print("JS updated")
