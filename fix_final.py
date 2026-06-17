# -*- coding: utf-8 -*-
import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Fix cities with corrupted URLs by replacing any src=... with correct Wikimedia URL
city_fixes = {
    "昆明": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/%E4%BA%94%E5%8D%8E%E5%B1%B1_%E6%98%86%E6%98%8E_2023.jpg/960px-%E4%BA%94%E5%8D%8E%E5%B1%B1_%E6%98%86%E6%98%8E_2023.jpg",
    "福州": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Fuzhou_skyline_from_Yuhu_Island.jpg/960px-Fuzhou_skyline_from_Yuhu_Island.jpg",
    "南昌": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanchang_Skyline.jpeg/960px-Nanchang_Skyline.jpeg",
    "济南": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Skyline_of_Central_Jinan.jpg/960px-Skyline_of_Central_Jinan.jpg",
    "呼和浩特": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hohhot_Skyline.jpeg/960px-Hohhot_Skyline.jpeg",
    "南宁": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Skyline_of_City_of_Nanning.jpg/960px-Skyline_of_City_of_Nanning.jpg",
    "海口": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Haikou_montage.jpg/960px-Haikou_montage.jpg",
    "贵阳": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Guizhou_Financial_Towers.jpg/960px-Guizhou_Financial_Towers.jpg",
    "西宁": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Skyscrapers_in_Xining.jpg/960px-Skyscrapers_in_Xining.jpg",
    "乌鲁木齐": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Urumqi_skyline_2023.jpg/960px-Urumqi_skyline_2023.jpg",
    "九寨沟": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "敦煌": "https://images.unsplash.com/photo-1486911278844-a81c5267e227",
    "西双版纳": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    "黄果树": "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
}

for city, url in city_fixes.items():
    # Replace ANY src=... that has this alt text
    pattern = r'src="[^"]*" alt="' + re.escape(city) + r'"'
    replacement = 'src="' + url + '" alt="' + city + '"'
    html = re.sub(pattern, replacement, html)
    print(f"Fixed: {city}")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)
print("\nDone! Verifying...")

# Final verification
count = 0
for city in list(city_fixes.keys()):
    m = re.search(r'src="([^"]+)" alt="' + re.escape(city) + r'"', html)
    if m and ("upload.wikimedia" in m.group(1) or "unsplash" in m.group(1)):
        count += 1
    else:
        print(f"Still broken: {city}")

print(f"Fixed {count}/{len(city_fixes)} cities")
