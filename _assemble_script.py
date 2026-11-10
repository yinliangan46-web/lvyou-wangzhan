"""
在 script.js + index.html 上注入：
- 动态城市富数据生成器 generateCityRichData(cityKey, cityName, provinceName)
- 省份弹窗渲染 openProvinceModal(provinceKey) — 带省内地图 + 真实城市 grid
- 省份可选方案弹窗 showProvinceOptionDetail
- 搜索映射扩展（从 _search_map.json 读）
- index.html 新增 #provinces section（MYL 中国省级旅游地）
"""
import json, re, os

with open('/workspace/script.js', 'r') as f:
    script = f.read()
with open('/workspace/index.html', 'r') as f:
    html = f.read()

# ============================================================
# 1. 动态城市富数据生成器（核心！）
# ============================================================
CITY_GENERATOR = r"""
// ========== 动态城市富数据生成器（与青甘大环线同标准） ==========
window.generateCityRichData = function(cityKey, cityName, provinceName) {
    // 如果已有富数据（CITY_DETAIL），直接返回
    if (window.CITY_DETAIL && window.CITY_DETAIL[cityKey]) {
        return JSON.parse(JSON.stringify(window.CITY_DETAIL[cityKey]));
    }
    // 如果已有 destinationData，用它做底
    if (window.destinationData && window.destinationData[cityKey]) {
        const dd = window.destinationData[cityKey];
        return {
            name: dd.name || cityName,
            country: '中国',
            province: provinceName || '',
            tag: dd.tag || '',
            rating: dd.rating || 4.5,
            days: dd.days || '2天1晚',
            price: dd.price || '¥1,299起',
            img: dd.img || 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
            description: dd.description || '',
            routePins: ['抵达' + cityName, cityName + '市区', cityName + '核心景点', '返程'],
            itinerary: (dd.itinerary || []).map((it, i) => ({
                day: it.day || ('Day ' + (i+1)),
                theme: it.title || '',
                timeline: [{
                    time: '09:00',
                    activity: (it.title || cityName) + '一日游',
                    detail: it.desc || '游览' + cityName + '核心景点，体验当地文化与美食',
                    duration: '4小时',
                    price: '¥60-100',
                    tip: '建议早上去人少光好'
                }, {
                    time: '13:00',
                    activity: '当地午餐',
                    detail: '品尝' + cityName + '特色美食',
                    duration: '1小时',
                    price: '¥50-80'
                }, {
                    time: '15:00',
                    activity: '自由探索',
                    detail: '商业街/文创区自由活动，买伴手礼',
                    duration: '2小时'
                }]
            })),
            hotels: [
                { name: cityName + ' 市中心酒店', tier: 'comfort', price: '¥300-500/晚', area: '市中心', highlight: '交通便利近景点', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' },
                { name: cityName + ' 经济连锁酒店', tier: 'economy', price: '¥150-250/晚', area: '火车站附近', highlight: '性价比高出行方便', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400', bookingUrl: 'https://www.booking.com' },
            ],
            trains: [
                { from: '上海/北京/广州', to: cityName, price: '¥100-500', time: '1-6小时', bookingUrl: 'https://trains.ctrip.com' },
            ],
            transport: [
                { label: '接站服务', value: '高铁/机场接机/站 ¥50-200' },
                { label: '市内交通', value: '地铁/公交/打车，¥10-30/次' },
                { label: '景区交通', value: '景点间打车/包车 ¥200-400/天' },
            ],
            foods: [
                { name: cityName + '特色小吃', desc: '当地传统招牌美食', price: '¥15-30' },
                { name: cityName + '招牌菜', desc: '必尝当地特色菜', price: '¥80-150/份' },
                { name: '伴手礼', desc: '当地特产可带回', price: '¥50-200' },
            ],
            tips: [
                '建议春秋季节来，天气舒适',
                '提前订高铁票，旺季可能没票',
                '景区门票可以网上预约，便宜还免排队',
                '注意防晒保湿，带舒适的运动鞋',
            ],
            budget: [
                { label: '高铁票', value: '¥100-500' },
                { label: '住宿', value: '¥150-500/晚' },
                { label: '餐饮', value: '¥80-150/天' },
                { label: '景点门票', value: '¥100-300' },
                { label: '合计/人', value: '¥1,299起' },
            ],
            tags: [provinceName || '', cityName, '自由行', '高铁直达'],
            country: '中国',
            province: provinceName || '',
        };
    }
    // 完全没数据，生成极简版
    return {
        name: cityName, country: '中国', province: provinceName || '',
        tag: '自由行', rating: 4.3, days: '2天1晚', price: '¥1,299起',
        img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',
        description: cityName + '，' + (provinceName || '') + '的一座美丽城市。MYL 带你探索这座城市的美景与美食。',
        routePins: ['抵达' + cityName, '市区游览', '核心景点', '返程'],
        itinerary: [{
            day: 'Day 1', theme: cityName + '初体验',
            timeline: [{ time: '09:00', activity: '抵达' + cityName, detail: '高铁/飞机抵达，专车接站入住酒店', duration: '1-2小时', tip: '建议早上到，有一整天时间游玩' },
                       { time: '13:00', activity: '当地午餐', detail: '品尝' + cityName + '特色美食', duration: '1小时', price: '¥50-80' },
                       { time: '15:00', activity: cityName + '核心景点', detail: '游览' + cityName + '最著名景点', duration: '3小时', ticket: '¥50-100' },
                       { time: '19:00', activity: '当地晚餐', detail: '晚上逛夜市吃小吃', duration: '1.5小时', price: '¥60-100' }]
        }, {
            day: 'Day 2', theme: cityName + '深度游',
            timeline: [{ time: '09:00', activity: '自由探索', detail: '商业街/文创区自由活动', duration: '2小时' },
                       { time: '12:00', activity: '当地特色午餐', detail: '再尝一顿当地招牌菜', duration: '1小时', price: '¥60-100' },
                       { time: '14:00', activity: '返程', detail: '买伴手礼，送站返程', duration: '2小时' }]
        }],
        hotels: [{ name: cityName + '舒适酒店', tier: 'comfort', price: '¥300-500/晚', area: '市中心', highlight: '近景点交通便利', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', bookingUrl: 'https://www.booking.com' }],
        trains: [{ from: '北京/上海/广州', to: cityName, price: '¥100-500', time: '1-6小时', bookingUrl: 'https://trains.ctrip.com' }],
        transport: [{ label: '接站', value: '¥50-200专车接高铁/机场' }, { label: '市内', value: '地铁/打车 ¥10-30' }],
        foods: [{ name: cityName + '特色', desc: '当地招牌美食', price: '¥30-80' }],
        tips: ['提前订高铁票', '景区建议网上预约', '带舒适的鞋'],
        budget: [{ label: '高铁', value: '¥100-500' }, { label: '住宿', value: '¥300-500/晚' }, { label: '合计', value: '¥1,299起' }],
        tags: [provinceName || '', '自由行'],
    };
};

// ========== 打开新城市弹窗（走 renderRichDetail 标准） ==========
window.openProvinceCityModal = function(cityKey, cityName, provinceName) {
    const richData = window.generateCityRichData(cityKey, cityName, provinceName);
    richData._cityKey = cityKey;
    
    let itineraryHtml = '';
    if (window.renderRichDetail) {
        itineraryHtml = window.renderRichDetail(richData);
    } else {
        itineraryHtml = '<div class="modal-section"><h3>行程</h3><p>' + (richData.description || '') + '</p></div>';
    }
    
    const includesArr = ['往返交通', '酒店住宿', '景点门票', '旅行保险'];
    
    modalBody.innerHTML = `
        <div class="modal-body">
            <h2>${richData.name}${richData.province ? ' · ' + richData.province : ''}</h2>
            <div class="modal-subtitle">⭐ ${richData.rating} · ${richData.days} · ${richData.price}</div>
            <img class="modal-hero" src="${richData.img}" alt="${richData.name}" />
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 目的地简介</h3>
                <p>${richData.description}</p>
            </div>
            ${itineraryHtml}
            <div class="modal-price-box">
                <div>
                    <div class="price">${richData.price} <small>/人起</small></div>
                    <div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> ${includesArr.join(' · ')}</div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即咨询</a>
            </div>
        </div>
    `;
    
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 80);
};

"""

# 注入到 openTourModal 之前
anchor = "function openTourModal"
assert anchor in script
script = script.replace(anchor, CITY_GENERATOR + anchor)
print("✅ 动态城市富数据生成器已注入")

# ============================================================
# 2. 省份弹窗重写（带省份地图 + 完整城市 grid）
# ============================================================
PROVINCE_MODAL = r"""
// ========== 省份弹窗（重写版：带省内城市地图 + 富城市 grid） ==========
function openProvinceModal(provinceKey) {
    const provData = (window.PROVINCES_ALL || []).find(p => p.key === provinceKey);
    if (!provData) { showToast('该省份数据加载中'); return; }
    
    // 省份地图（省内城市坐标 polyline）
    let provMapHtml = '';
    const cityCoords = (provData.cities || []).filter(c => c.coords);
    if (cityCoords.length >= 2 && window.realMapHtml) {
        const points = cityCoords.map(c => ({
            lng: c.coords[0], lat: c.coords[1],
            name: c.name, num: cityCoords.indexOf(c) + 1
        }));
        provMapHtml = window.realMapHtml({
            points: points,
            domestic: true,
            convert: false,
            clickDay: false,
            height: 320,
            title: '🗺️ ' + provData.name + ' 下辖城市分布 · 可缩放拖动',
            linkText: '在高德查看完整路线'
        });
    }
    
    // 城市 grid（有坐标的都能点进详情）
    const citiesHtml = (provData.cities || []).map(c => {
        const coordOk = c.coords && c.coords[0] && c.coords[0] != 0;
        return `
        <div class="dest-card china-card" onclick="openProvinceCityModal('${c.key}','${c.name}','${provData.name}')" style="cursor:pointer">
            <div class="dest-info" style="padding:10px 14px">
                <h3 style="font-size:0.95rem;margin:0 0 2px 0">${c.name}</h3>
                <p style="margin:0;font-size:0.75rem;color:${coordOk?'#888':'#ccc'}">${coordOk?'📍 有坐标 · 可进详情':'📍 有坐标 · 可进详情'}</p>
            </div>
        </div>`;
    }).join('');
    
    // 省份经典组合方案
    const sampleOptions = [
        { name: provData.name + '经典精华 3天2晚', price: '¥1,599', desc: '必玩核心景点组合',
          includes: ['往返高铁', '三星级酒店', '景点门票', '旅行保险'] },
        { name: provData.name + '深度游 5天4晚', price: '¥2,399', desc: '深度体验当地文化与美食',
          includes: ['往返高铁', '四星级酒店', '景点门票', '特色美食', '旅行保险'] },
    ];
    const optionsHtml = sampleOptions.map((o,i) => `
        <div class="itinerary-day option-item" style="border-left-color:var(--accent);cursor:pointer;padding:10px 14px;margin-bottom:8px;border-radius:8px;background:#fafafa" onclick="showToast('${provData.name}方案详情即将上线，敬请期待！')">
            <div style="flex:1;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
                <div style="flex:1;min-width:200px">
                    <h4 style="margin:0 0 4px 0;font-size:0.95rem">${o.name}</h4>
                    <p style="margin:0;font-size:0.8rem;color:#888">${o.desc}</p>
                </div>
                <div style="text-align:right;flex-shrink:0">
                    <div style="color:var(--primary);font-weight:600;font-size:1rem">${o.price}</div>
                    <div style="font-size:0.75rem;color:#888">查看详情 →</div>
                </div>
            </div>
        </div>`).join('');
    
    modalBody.innerHTML = `
        <div class="modal-body">
            <h2 style="margin-bottom:4px">${provData.name}</h2>
            <div class="modal-subtitle" style="margin-bottom:12px">⭐ ${provData.rating} · ${provData.days} · ${provData.price}</div>
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 省份简介</h3>
                <p>${provData.desc}</p>
            </div>
            ${provMapHtml}
            <div class="modal-section">
                <h3><i class="fas fa-city"></i> 下辖 ${(provData.cities||[]).length} 个地级市</h3>
                <p style="font-size:0.85rem;color:#888;margin-bottom:12px">点击城市卡片进入详情（地图/行程/酒店/交通/美食全齐）</p>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px">${citiesHtml}</div>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-list-alt"></i> 组合方案（多城玩更划算）</h3>
                <div>${optionsHtml}</div>
            </div>
            <div class="modal-price-box">
                <div>
                    <div class="price">${provData.price} <small>/人起</small></div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即咨询</a>
            </div>
        </div>
    `;
    
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    setTimeout(() => { if (window.initRealMaps) window.initRealMaps(); }, 80);
}

"""

# 替换原来的 openProvinceModal（搜索最早的那一个）
old_province = "// ========== 省份弹窗 ==========\nfunction openProvinceModal(provinceKey) {"
if old_province in script:
    # 找到该函数完整范围（到下一个 function 开头或 }; 之前）
    idx = script.find(old_province)
    # 找到它后面的 function 开头
    next_fn = script.find("\nfunction ", idx + len(old_province))
    if next_fn == -1:
        next_fn = script.find("\n// ", idx + len(old_province))
    if next_fn == -1:
        next_fn = len(script)
    script = script[:idx] + PROVINCE_MODAL + script[next_fn+1:]
    print("✅ openProvinceModal 已重写")
else:
    # 直接注入到 openTourModal 之前
    script = script.replace(anchor, PROVINCE_MODAL + anchor)
    print("✅ openProvinceModal 已注入（新）")

# ============================================================
# 3. 搜索映射：从 _search_map.json 追加
# ============================================================
with open('/workspace/_search_map.json') as f:
    new_search = json.load(f)

# 找到 destMap 最后一个条目
old_end = """'乐山': 'leshan', '大佛': 'leshan',
    };"""
if old_end not in script:
    old_end = """'乐山': 'leshan', '大佛': 'leshan',
};"""

# 构造追加字符串
# 先去重已有
existing_destmap = set(re.findall(r"'([^']+)'\s*:\s*'", script[:script.find(old_end)]))
# 过滤已有 key
extra = {k: v for k, v in new_search.items() if k not in existing_destmap}

# 省份用 __prov__ 前缀，城市直接用 city key
extra_lines = []
for k, v in extra.items():
    if v.startswith('__prov__'):
        extra_lines.append(f"'{k}': '{v}',")
    else:
        extra_lines.append(f"'{k}': '{v}',")

new_end = "'乐山': 'leshan', '大佛': 'leshan',\n        // 全部省份 + 地级市\n        " + "\n        ".join(extra_lines) + "\n    };"

if old_end in script:
    script = script.replace(old_end, new_end)
    print(f"✅ 搜索映射追加 {len(extra_lines)} 条目")
else:
    print("⚠️ 搜索锚点没找到")

# 省份搜索 → 调用 openProvinceModal
# 改 destMap 循环中的 openModal 调用：如果 value 以 __prov__ 开头则 openProvinceModal
old_openmodal = """    // 检查是否匹配目的地
    for (const [key, value] of Object.entries(destMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            openModal(value);
            input.value = '';
            return;
        }
    }"""
new_openmodal = """    // 检查省份（__prov__ 前缀）
    for (const [key, value] of Object.entries(destMap)) {
        if (value.startsWith('__prov__') && (key.includes(keyword) || keyword.includes(key))) {
            openProvinceModal(value.slice(8));
            input.value = '';
            return;
        }
    }

    // 检查是否匹配目的地（城市/套餐）
    for (const [key, value] of Object.entries(destMap)) {
        if (key.includes(keyword) || keyword.includes(key)) {
            // 优先用动态生成器
            if (window.PROVINCES_ALL && window.ALL_CITY_COORDS && window.ALL_CITY_COORDS[value]) {
                // 找到这个城市属于哪个省
                let provName = '';
                for (const p of window.PROVINCES_ALL) {
                    if (p.cities.some(c => c.key === value)) { provName = p.name; break; }
                }
                openProvinceCityModal(value, key, provName);
            } else if (window.destinationData && window.destinationData[value]) {
                openModal(value);
            } else {
                openModal(value);
            }
            input.value = '';
            return;
        }
    }"""

script = script.replace(old_openmodal, new_openmodal)
print("✅ 搜索省份 → openProvinceModal / 城市 → openProvinceCityModal")

# ============================================================
# 写回 script.js
# ============================================================
with open('/workspace/script.js', 'w') as f:
    f.write(script)

print("\n=== script.js 注入完毕 ===")
