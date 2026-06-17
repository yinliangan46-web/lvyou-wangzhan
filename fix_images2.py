# -*- coding: utf-8 -*-
import re

# Wikimedia Commons real landmark images for each Chinese city
# All URLs verified to return HTTP 200
city_images = {}

# Add all cities - Wikimedia images
city_images["北京"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Skyline_of_Beijing_CBD_with_B-5906_approaching_%252821011016171955%2529_%25281%2529.jpg/960px-Skyline_of_Beijing_CBD_with_B-5906_approaching_%252821011016171955%2529_%25281%2529.jpg"

city_images["上海"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Huangpu_Park_20124-Shanghai_%252832208802494%2529.jpg/960px-Huangpu_Park_20124-Shanghai_%252832208802494%2529.jpg"

city_images["广州"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Canton_Tower_20241027.jpg/960px-Canton_Tower_20241027.jpg"

city_images["深圳"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Commercial_area_of_futian_to_east2020.jpg/960px-Commercial_area_of_futian_to_east2020.jpg"

city_images["成都"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%25E9%259B%25AA%25E5%25B1%25B1%25E4%25B8%258B%25E7%259A%2584%25E6%2588%2590%25E9%2583%25BD%25E5%25B8%2582%25E5%25A4%25A9%25E9%2599%2585%25E7%25BA%25BF_Chengdu_skyline_with_snow_capped_mountains.jpg/960px-%25E9%259B%25AA%25E5%25B1%25B1%25E4%25B8%258B%25E7%259A%2584%25E6%2588%2590%25E9%2583%25BD%25E5%25B8%2582%25E5%25A4%25A9%25E9%2599%2585%25E7%25BA%25BF_Chengdu_skyline_with_snow_capped_mountains.jpg"

city_images["杭州"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/%25E6%259D%25AD%25E5%25B7%259E%25E9%2592%25B1%25E6%25B1%259F%25E6%2596%25B0%25E5%259F%258E_4_%2528cropped%2529.jpg/960px-%25E6%259D%25AD%25E5%25B7%259E%25E9%2592%25B1%25E6%25B1%259F%25E6%2596%25B0%25E5%259F%258E_4_%2528cropped%2529.jpg"

city_images["西安"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/City_wall_of_Xi_an_51550-Xian_%252827959363326%2529.jpg/960px-City_wall_of_Xi_an_51550-Xian_%252827959363326%2529.jpg"

city_images["重庆"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Chongqing_Skyline_2025.jpg/960px-Chongqing_Skyline_2025.jpg"

city_images["武汉"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/%25E6%25AD%25A6%25E6%25B1%2589%25E9%25BB%2584%25E9%25B9%25A4%25E6%25A5%25BC%25E4%25BF%25AF%25E7%259E%25B0.jpg/960px-%25E6%25AD%25A6%25E6%25B1%2589%25E9%25BB%2584%25E9%25B9%25A4%25E6%25A5%25BC%25E4%25BF%25AF%25E7%259E%25B0.jpg"

city_images["长沙"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/%25E7%2588%25B1%25E6%2599%259A%25E4%25BA%25AD%25EF%25BC%2588%25E7%25A7%258B-%25E4%25BE%25A7%25E9%259D%25A2%25EF%25BC%2589.jpg/960px-%25E7%2588%25B1%25E6%2599%259A%25E4%25BA%25AD%25EF%25BC%2588%25E7%25A7%258B-%25E4%25BE%25A7%25E9%259D%25A2%25EF%25BC%2589.jpg"

city_images["南京"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanjing_CBD_night.jpg/960px-Nanjing_CBD_night.jpg"

city_images["沈阳"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/%25E6%25B2%2588%25E9%2598%25B3%25E6%2595%2585%25E5%25AE%25AB%25E5%25A4%25A7%25E6%2594%25BF%25E6%25AE%25BF%25E6%25BB%25A1%25E6%2596%2587%25E5%258C%25BA%25E6%2599%25AF.jpg/960px-%25E6%25B2%2588%25E9%2598%25B3%25E6%2595%2585%25E5%25AE%25AB%25E5%25A4%25A7%25E6%2594%25BF%25E6%25AE%25BF%25E6%25BB%25A1%25E6%2596%2587%25E5%258C%25BA%25E6%2599%25AF.jpg"

city_images["哈尔滨"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/26935-Harbin_Saint_Sophia_Cathedral.jpg/960px-26935-Harbin_Saint_Sophia_Cathedral.jpg"

city_images["昆明"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/%25E4%25BA%2594%25E5%258D%258E%25E5%25B1%25B1_%25E6%2598%2586%25E6%2598%258E_2023.jpg/960px-%25E4%25BA%2594%25E5%258D%258E%25E5%25B1%25B1_%25E6%2598%2586%25E6%2598%258E_2023.jpg"

city_images["合肥"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/%25E5%25A4%25A9%25E9%2598%2599%25E5%259C%2588%25E5%2595%2586%25E5%258A%25A1%25E5%258C%25BA2020.jpg/960px-%25E5%25A4%25A9%25E9%2598%2599%25E5%259C%2588%25E5%2595%2586%25E5%258A%25A1%25E5%258C%25BA2020.jpg"

city_images["福州"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Fuzhou_skyline_from_Yuhu_Island.jpg/960px-Fuzhou_skyline_from_Yuhu_Island.jpg"

city_images["南昌"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanchang_Skyline.jpeg/960px-Nanchang_Skyline.jpeg"

city_images["郑州"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Zhengdong_CBD_Skyline.jpg/960px-Zhengdong_CBD_Skyline.jpg"

city_images["济南"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Skyline_of_Central_Jinan.jpg/960px-Skyline_of_Central_Jinan.jpg"

city_images["石家庄"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Zhuangli_Commercial_Area.jpg/960px-Zhuangli_Commercial_Area.jpg"

city_images["太原"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Taiyuan_skyline_2020.jpg/960px-Taiyuan_skyline_2020.jpg"

city_images["呼和浩特"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hohhot_Skyline.jpeg/960px-Hohhot_Skyline.jpeg"

city_images["长春"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/%25E9%2581%25A5%25E6%259C%259B%25E5%2581%2587%25E6%2597%25A5%25E5%2585%2589%25E5%258D%258E%25E8%25B7%25AF.jpg/960px-%25E9%2581%25A5%25E6%259C%259B%25E5%2581%2587%25E6%2597%25A5%25E5%2585%2589%25E5%258D%258E%25E8%25B7%25AF.jpg"

city_images["南宁"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Skyline_of_City_of_Nanning.jpg/960px-Skyline_of_City_of_Nanning.jpg"

city_images["海口"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Haikou_montage.jpg/960px-Haikou_montage.jpg"

city_images["贵阳"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Guizhou_Financial_Towers.jpg/960px-Guizhou_Financial_Towers.jpg"

city_images["拉萨"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lhassa_Potala.jpg/960px-Lhassa_Potala.jpg"

city_images["兰州"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Skyline_Lanzhou_China.jpg/960px-Skyline_Lanzhou_China.jpg"

city_images["西宁"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Skyscrapers_in_Xining.jpg/960px-Skyscrapers_in_Xining.jpg"

city_images["银川"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Skyline_of_Jinfeng_District_Yinchuan.jpg/960px-Skyline_of_Jinfeng_District_Yinchuan.jpg"

city_images["乌鲁木齐"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Urumqi_skyline_2023.jpg/960px-Urumqi_skyline_2023.jpg"

city_images["桂林"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Xiangshan_Scenic_Area.jpg/960px-Xiangshan_Scenic_Area.jpg"

city_images["大理"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Three_Pagodas_of_Chongsheng_Temple.jpg/960px-Three_Pagodas_of_Chongsheng_Temple.jpg"

city_images["苏州"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Suzhou_skyline_from_Gusu.jpg/960px-Suzhou_skyline_from_Gusu.jpg"

city_images["青岛"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Qingdao_skyline_2021.jpg/960px-Qingdao_skyline_2021.jpg"

city_images["厦门"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Xiamen_University_Lulin_Bay.jpg/960px-Xiamen_University_Lulin_Bay.jpg"

city_images["丽江"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Lijiang_gucheng_2012.jpg/960px-Lijiang_gucheng_2012.jpg"

city_images["张家界"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Avatar_Hallelujah_Mountain.jpg/960px-Avatar_Hallelujah_Mountain.jpg"

city_images["黄山"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Mount_Huangshan_Sea_of_Clouds.jpg/960px-Mount_Huangshan_Sea_of_Clouds.jpg"

city_images["三亚"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Sanya_Bay_view_2024.jpg/960px-Sanya_Bay_view_2024.jpg"

city_images["乐山"] = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Leshan_Buddha_2023.jpg/960px-Leshan_Buddha_2023.jpg"

# Remaining cities use working Unsplash photos as fallback
city_images["九寨沟"] = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
city_images["敦煌"] = "https://images.unsplash.com/photo-1486911278844-a81c5267e227"
city_images["西双版纳"] = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05"
city_images["黄果树"] = "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb"

# ========== Update HTML ==========
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

for city, url in city_images.items():
    # In HTML: src="OLD_URL" alt="CITY" loading="lazy"
    pattern = r'(src=")https?://[^"]+(\?w=400&q=80" alt="' + re.escape(city) + r')'
    replacement = r'\1' + url + r'\2'
    html = re.sub(pattern, replacement, html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("HTML updated!")

# ========== Update JS ==========
with open("script.js", "r", encoding="utf-8") as f:
    js = f.read()

for city, url in city_images.items():
    # In JS: name:'CITY'...img:'OLD_URL?w=800&q=80'
    pattern = r"(name:'" + re.escape(city) + r"'.*?img:')https?://[^']+(\?w=800&q=80')"
    replacement = r'\1' + url + r'\2'
    js = re.sub(pattern, replacement, js)

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js)
print("JS updated!")

# ========== Verify ==========
print("\n--- Verification ---")
for city in ["北京", "上海", "广州", "成都", "西安", "南京", "重庆", "武汉", "拉萨", "桂林"]:
    if city in city_images:
        # Check HTML
        p = r'src="https?://[^"]+" alt="' + re.escape(city) + r'"'
        m = re.search(p, html)
        if m:
            url = m.group(0)
            if "upload.wikimedia.org" in url:
                print(f"OK: {city} = Wikimedia")
            elif "unsplash.com" in url:
                print(f"OK: {city} = Unsplash (fallback)")
            else:
                print(f"??: {city} = {url[:40]}")
        else:
            print(f"ERR: {city} not found in HTML!")
