import re

# Read URLs from file
urls = {}
with open("wiki_urls2.txt", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        idx = line.find(":https")
        if idx > 0:
            city = line[:idx]
            url = line[idx+1:]
            urls[city] = url

print(f"Read {len(urls)} city URLs")

for fname in ["index.html", "script.js"]:
    with open(fname, "r", encoding="utf-8") as f:
        content = f.read()

    for city, img_url in urls.items():
        # Replace src="ANYTHING" alt="CITY"
        pattern = r'src="[^"]*" alt="' + re.escape(city) + r'"'
        replacement = 'src="' + img_url + '" alt="' + city + '"'
        content = re.sub(pattern, replacement, content)

        # For JS: name:'CITY'...img:'ANYTHING'
        if fname == "script.js":
            pattern2 = r"(name:'" + re.escape(city) + r"'.*?img:')[^']*(')"
            replacement2 = r'\1' + img_url + r'\2'
            content = re.sub(pattern2, replacement2, content)

    with open(fname, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Fixed: {fname}")

# Verify
for city in urls.keys():
    m = re.search(r'src="([^"]+)" alt="' + re.escape(city) + r'"', open("index.html", encoding="utf-8").read())
    if m and m.group(1) == urls[city]:
        print(f"  MATCH: {city}")
    else:
        print(f"  FAIL: {city}")
