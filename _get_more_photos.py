"""批量验证 Unsplash photo IDs 可用，生成 400+ 唯一 ID"""
import urllib.request, json, re

# 用 Unsplash API 或者简单的方式 — 已知能访问的 Unsplash photo IDs 模式
# Unsplash photo IDs 格式: photo-NNNNNNNN-xxxxxxxxxx 或 photo-NNNNNNNN-xxxxxxxxxxxxx
# 我用这种方式：生成一个大池，用 curl 验证 200 OK

# 方案：直接用 Unsplash 的 feature API 获取真实 photo IDs
def fetch_photo_ids(count=450):
    ids = []
    page = 1
    per_page = 30
    while len(ids) < count:
        url = f"https://api.unsplash.com/photos?page={page}&per_page={per_page}&client_id=YOUR_ACCESS_KEY"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "MYL/1.0"})
            resp = urllib.request.urlopen(req, timeout=10)
            break  # API 需要 key，跳过
        except:
            break
    
    # 改用手动收集的方式 — 我直接用已知的 Unsplash photo IDs
    # Unsplash 热门收藏里有几百万张图，我只需要 400 个唯一的
    # 用这种模式生成：photo-XXXXXXXXX-yyyyyyyyyyy
    # 每个不同的数字开头 + 不同的 hash
    
    # 实际上直接 hardcode 450 个不重复的 photo ID
    return None

print("用手动 photo ID 池方式...")
# 这个思路不对 — 我不能瞎编 Unsplash photo ID，会 404
# 正确方案：直接搜索 Unsplash "中国城市风景" 拿真实 photo IDs

import subprocess, os

# 用 WebFetch 搜索 Unsplash
# 或者用 curl 直接请求具体的已知可用 photo

# 更聪明：直接用 Wikimedia Commons 的图片！
# Wikimedia 有真实的各地景点图，URL 格式：
# https://upload.wikimedia.org/wikipedia/commons/thumb/.../...
# 但这样要指定具体图片路径，很麻烦

# 最简单可行方案：生成 Unsplash photo URL 的 "random query" 版本
# https://source.unsplash.com/800x600/?Beijing,China
# 但 source.unsplash.com 已经弃用了

# 最后方案：用 Unsplash 的直接 photo URL，但 photo ID 我可以从一个大的已知列表里选
# 让我从之前已确认可用的 POOL 扩展 — 搜索 Unsplash 拿更多

print("=== 直接 curl 验证 photo IDs ===")
# 我先硬编码一批已验证的，然后用脚本继续验证更多
KNOWN_POOL = [
    "photo-1535713875002-d1d0cf377fde", "photo-1512453979798-5ea266f8880c",
    "photo-1502602898657-3e91760cbb34", "photo-1464822759023-fed622ff2c3b",
    "photo-1507525428034-b723cf961d3e", "photo-1537996194471-e657df975ab4",
    "photo-1507003211169-0a1dd7228f2d", "photo-1552733407-5d5c46c3bb3b",
    "photo-1571896349842-33c89424de2d", "photo-1540959733332-eab4deabeeaf",
    "photo-1564501049412-61c2a3083791", "photo-1528164344705-47542687000d",
    "photo-1552465011-b4e21bf6e79a", "photo-1582719478250-c89cae4dc85b",
    "photo-1480796927426-f609979314bd", "photo-1538485399081-7191377e8241",
    "photo-1501594907352-04cda38ebc29", "photo-1528181304800-259b08848526",
    "photo-1508009603885-50cf7c579365", "photo-1548013146-72479768bada",
    "photo-1587974928442-77dc3e0dba72", "photo-1469521669194-babb45599def",
    "photo-1586375300773-8384e3e4916f", "photo-1486911278844-a81c5267e227",
    "photo-1582719508461-905c673771fd", "photo-1508739773434-c26b3d09e071",
    "photo-1618773928121-c32242e63f39", "photo-1552832230-c0197dd311b5",
    "photo-1467269204594-9661b134dd2b", "photo-1566073771259-6a8506099945",
    "photo-1542314831-068cd1dbfeeb", "photo-1551882547-ff40c63fe5fa",
    "photo-1494790108377-be9c29b29330", "photo-1514282401047-d79a71a590e8",
    "photo-1578683010236-d716f9a3f461", "photo-1438761681033-6461ffad8d80",
    "photo-1589394815804-964ed0be2eb5", "photo-1470770841072-f978cf4d019e",
    "photo-1506905925346-21bda4d32df4",
]
print(f"已验证池: {len(KNOWN_POOL)} 个")

# 用 curl 继续找新的
# Unsplash 搜索 "China city landscape" 能拿到更多 photo IDs
# 但更简单：直接 curl 一个已知的 Unsplash 页面，正则提取 photo IDs

import subprocess
result = subprocess.run(
    ['curl', '-s', '-L', '--max-time', '15',
     'https://unsplash.com/s/photos/china-landscape?orientation=landscape'],
    capture_output=True, text=True
)
ids_found = set(re.findall(r'photo-\d{8}-[a-z0-9]+', result.stdout))
# 清理成完整的 photo ID 格式
full_ids = set()
for m in re.findall(r'photo[\\"\s:]+(\d{8}-[a-z0-9]+)', result.stdout):
    full_ids.add(f"photo-{m}")
# 也试另一种格式
for m in re.findall(r'images\.unsplash\.com/(photo-\d{8}-[a-z0-9]+)', result.stdout):
    full_ids.add(m)

print(f"从 unsplash 搜索页拿到: {len(full_ids)} 个 photo IDs")
for i in list(full_ids)[:20]:
    print(f"  {i}")
