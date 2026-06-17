import re

# Read all image URLs from HTML
with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("script.js", "r", encoding="utf-8") as f:
    js = f.read()

# Find all city-image mappings from HTML
city_urls = re.findall(r'src="([^"]+)" alt="([^"]+)"', html)

print(f"Found {len(city_urls)} city-image mappings in HTML")

# For each city in HTML, fix the corresponding JS entry
for html_url, city in city_urls:
    if city in ["巴厘岛休闲游", "东京深度游", "巴黎浪漫之旅"]:
        continue  # Skip route items

    # Pattern: name:'CITY'...img:'ANYTHING'
    pattern = r"(name:'" + re.escape(city) + r"'.*?img:')[^']*(')"

    # Only replace if the current JS URL is empty or different
    m = re.search(pattern, js)
    if m:
        current_js_url = m.group(1) + m.group(2)[:-1]  # extract just the URL
        if current_js_url != html_url:
            js = re.sub(pattern, r'\1' + html_url + r'\2', js)
            print(f"Fixed JS: {city}")

with open("script.js", "w", encoding="utf-8") as f:
    f.write(js)

# Verify no empty img URLs remain
empty = re.findall(r"img:''", js)
print(f"\nEmpty img URLs remaining: {len(empty)}")

# Fix corrupted URLs (like "?w=800&q=80,description:q=80")
js = re.sub(r"\?w=800&q=80,description:q=80", "", js)
with open("script.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Corrupted URLs cleaned")

# Final comprehensive check
all_cities = re.findall(r"name:'([^']+)'.*?img:'([^']+)'", js)
empty_count = sum(1 for _, img in all_cities if not img)
print(f"Total JS city entries: {len(all_cities)}, empty imgs: {empty_count}")
