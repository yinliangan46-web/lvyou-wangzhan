#!/usr/bin/env python3
"""生成城市攻略数据"""
import json, sys, os
sys.path.insert(0, '/workspace')
# 复用上一个脚本的数据定义
exec(open('/workspace/generate_all.py').read().split("if __name__")[0])

# 输出纯数据
out = "// MYL 旅行 - 全量城市详细攻略\n// 数据驱动：按 tags 分类\n\n"
out += "window.CITY_DETAIL = "
out += json.dumps(CITIES, ensure_ascii=False, indent=2)
out += ";\n"

with open('/workspace/city-data.js', 'w', encoding='utf-8') as f:
    f.write(out)
print(f"✓ city-data.js 已生成，{len(CITIES)} 个城市，{len(out)//1024} KB")
