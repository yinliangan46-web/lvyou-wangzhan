import re

# Fix Bali - wrong photo (shows Fuji)
bali_url = "https://images.unsplash.com/photo-1514282401047-d79a71a590e8"

# Fix corrupted/manual override URLs for cities that need correction
overrides = {
    "九寨沟": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    "西双版纳": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
    "黄果树": "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb",
    "敦煌": "https://images.unsplash.com/photo-1486911278844-a81c5267e227",
}

for fname in ["index.html", "script.js"]:
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fix Bali
    # In HTML
    content = re.sub(
        r'(src=")https?://[^"]*(" alt="巴厘岛")',
        r'\1' + bali_url + r'\2',
        content
    )
    # In JS
    content = re.sub(
        r"(name:'巴厘岛'.*?img:')[^']*(')",
        r'\1' + bali_url + r'\2',
        content
    )

    # 2. Fix override cities (JS only - HTML should already be correct)
    if fname == "script.js":
        for city, url in overrides.items():
            pattern = r"(name:'" + re.escape(city) + r"'.*?img:')[^']*(')"
            content = re.sub(pattern, r'\1' + url + r'\2', content)

    # 3. Fix any MISMATCH: for each city, get the HTML URL and apply to JS
    if fname == "script.js":
        # Read the HTML URLs
        with open("index.html", "r", encoding="utf-8") as hf:
            html = hf.read()

        # Find all city->URL mappings from HTML
        html_matches = re.findall(r'src="([^"]+)" alt="([^"]+)"', html)
        for url, city in html_matches:
            if city in ["巴厘岛", "东京", "巴黎", "伦敦", "迪拜", "曼谷", "巴厘岛"]:
                continue  # Already handled
            # Fix JS to match HTML
            pattern = r"(name:'" + re.escape(city) + r"'.*?img:')[^']*(')"
            replacement = r'\1' + url + r'\2'
            content = re.sub(pattern, replacement, content)

    with open(fname, "w", encoding="utf-8") as f:
        f.write(content)

print("All fixes applied!")
