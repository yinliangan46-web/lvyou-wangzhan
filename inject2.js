// Simple inject script
const fs = require('fs');

const script = fs.readFileSync('script.js.bak3', 'utf8');
const tourJson = fs.readFileSync('tourdata_json.txt', 'utf8').trim();

// Validate JSON
JSON.parse(tourJson); // will throw if invalid

// Find tourData boundaries
const startMarker = 'const tourData = {';
const startIdx = script.indexOf(startMarker);
if (startIdx < 0) { console.log('ERROR: tourData start not found'); process.exit(1); }

let depth = 0, endIdx = -1;
for (let i = startIdx + startMarker.length - 1; i < script.length; i++) {
  if (script[i] === '{') depth++;
  else if (script[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
}
if (endIdx < 0) { console.log('ERROR: tourData end not found'); process.exit(1); }

const beforeTourData = script.slice(0, startIdx);
const afterTourData = script.slice(endIdx);

// Build new tourData - use "const tourData = <JSON>;"
const newTourData = 'const tourData = ' + tourJson + ';';

// Now find and replace openTourModal function
const funcName = 'function openTourModal(type) {';
const funcStart = afterTourData.indexOf(funcName);
if (funcStart < 0) { console.log('ERROR: openTourModal not found in afterTourData'); process.exit(1); }

let fDepth = 0, fEnd = -1;
for (let i = funcStart + funcName.length - 1; i < afterTourData.length; i++) {
  if (afterTourData[i] === '{') fDepth++;
  else if (afterTourData[i] === '}') { fDepth--; if (fDepth === 0) { fEnd = i + 1; break; } }
}
if (fEnd < 0) { console.log('ERROR: openTourModal end not found'); process.exit(1); }

const beforeFunc = afterTourData.slice(0, funcStart);
const afterFunc = afterTourData.slice(fEnd);

// Build new openTourModal + helper function
const newFuncCode = `
// ========== buildTourMapHtml - 套餐路线示意图 ==========
function buildTourMapHtml(data) {
    if (!data || !data.mapPoints || data.mapPoints.length < 2) return '';
    const isC = (data.country === '中国');
    const pins = data.mapPoints;
    let polyPoints = pins.map(p => p.x + ',' + p.y).join(' ');
    if (pins.length > 2 && pins[0].name !== pins[pins.length-1].name) {
        polyPoints += ' ' + pins[0].x + ',' + pins[0].y;
    }
    const bgGrad = isC
        ? 'linear-gradient(135deg,#fef9e7 0%,#fce4a4 40%,#a9dfbf 100%)'
        : 'linear-gradient(135deg,#e3f2fd 0%,#bbdefb 40%,#b2dfdb 100%)';
    const coords = data.realCoords || [];
    let mapUrl = '';
    if (coords.length > 0 && isC) {
        mapUrl = 'https://uri.amap.com/marker?position=' + coords.map(c=>c[0]+','+c[1]).join('|') + '&name=' + encodeURIComponent(data.name||'') + '&src=mylvyou&coordinate=gaode';
    } else if (coords.length > 0) {
        mapUrl = 'https://maps.google.com/maps?q=' + coords.map(c=>c[1]+','+c[0]).join('|') + '&z=5';
    }
    const mapName = isC ? '高德地图' : '谷歌地图';
    const nodesHtml = pins.map((p,i) =>
        '<div class="loop-svg-pin" style="left:' + p.x + '%;top:' + p.y + '%" data-day="' + (p.day||'') + '" data-name="' + (p.name||'') + '">' +
        '<div class="pin-number">' + (i+1) + '</div>' +
        '<div class="pin-label-text">' + (p.name||'') + '</div></div>'
    ).join('');
    return '<div class="loop-map-section">' +
        '<div class="loop-map-title"><i class="fas fa-map-marked-alt" style="color:var(--primary)"></i> 路线示意图 · 点击节点跳转 Day 行程' +
        '<span class="map-badge" style="background:' + (isC?'#ef4444':'#3b82f6') + '">' + (isC?'🇨🇳 国内':'🌍 国外') + '</span>' +
        (mapUrl ? '<a href="' + mapUrl + '" target="_blank" class="map-open-link" style="margin-left:auto">🔗 在' + mapName + '打开</a>' : '') +
        '</div>' +
        '<div class="loop-map-svg-wrap" style="background:' + bgGrad + '">' +
        '<svg class="loop-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
        pins.map((p,i) => '<circle cx="' + p.x + '" cy="' + p.y + '" r="0.8" fill="' + (isC?'#dc2626':'#2563eb') + '" stroke="white" stroke-width="0.3"/>').join('') +
        '<polyline points="' + polyPoints + '" fill="none" stroke="' + (isC?'#dc2626':'#2563eb') + '" stroke-width="0.6" stroke-dasharray="1.2,0.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>' +
        pins.map((p,i) => '<circle cx="' + p.x + '" cy="' + p.y + '" r="1.2" fill="' + (isC?'#dc2626':'#2563eb') + '" stroke="white" stroke-width="0.4"/>').join('') +
        pins.map((p,i) => '<text x="' + p.x + '" y="' + (p.y - 2) + '" text-anchor="middle" font-size="2" fill="' + (isC?'#7f1d1d':'#1e3a8a') + '" font-weight="700">' + (i+1) + '</text>').join('') +
        '</svg><div class="loop-map-nodes">' + nodesHtml + '</div></div>' +
        '<div class="loop-map-tip">💡 提示：点击地图上的编号圆点可以跳转到对应的 Day 行程详情 · 右上角链接可以在真实的' + mapName + '上查看完整路线</div></div>';
}

function openTourModal(type) {
    const data = tourData[type];
    if (!data) return;

    // 检查是否有timeline化的itinerary
    const hasTimeline = (data.itineraries || []).some(it => it.timeline && it.timeline.length);
    
    // 统一行程数据结构
    const itineraryData = hasTimeline 
        ? data.itineraries 
        : (data.itineraries || []).map((it, i) => ({
            day: it.day || ('Day ' + (i+1)),
            theme: it.title || it.theme || '',
            timeline: [{ time: '09:00', activity: it.title || '', detail: it.desc || '' }]
          }));

    // 渲染行程timeline
    const itinHtml = itineraryData.map(day => {
        const tl = (day.timeline || []).map(item => {
            const m = [];
            if (item.duration) m.push('<span class="meta-tag duration"><i class="fas fa-clock"></i> ' + item.duration + '</span>');
            if (item.ticket) m.push('<span class="meta-tag ticket"><i class="fas fa-ticket-alt"></i> ' + item.ticket + '</span>');
            if (item.price) m.push('<span class="meta-tag"><i class="fas fa-yen-sign"></i> ' + item.price + '</span>');
            if (item.tip) m.push('<span class="meta-tag tip"><i class="fas fa-lightbulb"></i> ' + item.tip + '</span>');
            return '<div class="timeline-item"><div class="time">' + (item.time || '') + '</div><div class="activity"><strong>' + (item.activity || '') + '</strong></div><div class="detail">' + (item.detail || '') + '</div>' + (m.length ? '<div class="meta-row">' + m.join('') + '</div>' : '') + '</div>';
        }).join('');
        return '<div class="itinerary-day loop-day" data-day="' + (day.day || '') + '"><h4><span class="day-tag">' + (day.day || '') + '</span>' + (day.theme || day.title || '') + '</h4><div class="day-timeline">' + tl + '</div></div>';
    }).join('');

    // 路线示意图（SVG）
    const mapHtml = buildTourMapHtml(data);

    // 亮点标签
    const hlHtml = (data.coverages || []).map(c => 
        '<span class="loop-hl" style="padding:4px 12px;background:#fef3c7;color:#b45309;border-radius:12px;font-size:.8rem;margin-right:6px">' + c + '</span>'
    ).join('');
    const tagHtml = (data.tags || []).map(t => 
        '<span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:12px;font-size:.75rem;margin-right:6px">' + t + '</span>'
    ).join('');

    // 航班
    const flightHtml = (data.flights || []).map(f => {
        const bookBtn = f.bookingUrl ? '<span class="buy-btn">查看 →</span>' : '';
        return '<a href="' + (f.bookingUrl || '#') + '" target="_blank" class="flight-item"><span class="from">' + (f.from || '') + '</span><span class="arrow">→</span><span class="to">' + (f.to || '') + '</span><span class="price">' + (f.price || '') + '</span><span class="time">' + (f.time || '') + '</span>' + bookBtn + '</a>';
    }).join('');
    const flightSection = flightHtml ? '<div class="flight-card"><h5><i class="fas fa-plane"></i> ✈️ 机票/交通参考</h5>' + flightHtml + '</div>' : '';

    // 火车
    const trainHtml = (data.trains || []).map(t => {
        const bookBtn = t.bookingUrl ? '<span class="buy-btn">查看 →</span>' : '';
        const dur = t.duration ? '<span class="dur">' + t.duration + '</span>' : '';
        return '<a href="' + (t.bookingUrl || '#') + '" target="_blank" class="train-item"><span class="from">' + (t.from || '') + '</span><span class="arrow">→</span><span class="to">' + (t.to || '') + '</span><span class="price">' + (t.price || '') + '</span>' + dur + '<span class="time">' + (t.time || '') + '</span>' + bookBtn + '</a>';
    }).join('');
    const trainSection = trainHtml ? '<div class="train-card"><h5><i class="fas fa-train"></i> 🚄 高铁参考</h5>' + trainHtml + '</div>' : '';

    // 酒店
    const hotelHtml = (data.hotels || []).map(h => {
        const tierMap = { economy:'经济型', comfort:'舒适型', luxury:'奢华型' };
        const tierBadge = '<div class="hotel-tier-badge ' + (h.tier || '') + '">' + (tierMap[h.tier] || h.tier || '') + '</div>';
        const imgDiv = h.image ? '<div class="hotel-img"><img src="' + h.image + '" alt="' + (h.name || '') + '" onerror="this.style.display=\\'none\\'"></div>' : '';
        const bookBtn = h.bookingUrl ? '<div class="booking-link"><i class="fas fa-external-link-alt"></i> 点击预订 →</div>' : '';
        const cardHtml = '<div class="hotel-card ' + (h.image ? 'with-image' : '') + '">' + imgDiv + '<div class="hotel-info"><div class="hotel-top">' + tierBadge + '<h5>' + (h.name || '') + '</h5></div><div class="hotel-price">' + (h.price || '') + '</div><div class="area"><i class="fas fa-map-marker-alt"></i> ' + (h.area || '') + '</div><div class="highlight">' + (h.highlight || '') + '</div>' + bookBtn + '</div></div>';
        return h.bookingUrl ? '<a href="' + h.bookingUrl + '" target="_blank" class="hotel-card-link">' + cardHtml + '</a>' : cardHtml;
    }).join('');
    const hotelSection = hotelHtml ? '<div class="modal-section"><h3><i class="fas fa-hotel"></i> 住宿推荐</h3>' + hotelHtml + '</div>' : '';

    // 其他
    const transportHtml = (data.transport || []).map(t => '<div class="transport-item"><div class="label">' + (t.label || '') + '</div><div class="value">' + (t.value || '') + '</div></div>').join('');
    const foodsHtml = (data.foods || []).map(f => '<li><strong>' + (f.name || '') + '</strong> — ' + (f.desc || '') + ' <em style="color:var(--primary);font-weight:600">' + (f.price || '') + '</em></li>').join('');
    const tipsHtml = (data.tips || []).map(t => '<li>' + t + '</li>').join('');
    const budgetHtml = (data.budget || []).map(b => '<div class="budget-item"><div class="label">' + (b.label || '') + '</div><div class="value">' + (b.value || '') + '</div></div>').join('');

    // 可选方案
    const optionsHtml = (data.options || []).map((opt, idx) => 
        '<div class="itinerary-day option-item" style="border-left-color:var(--accent);cursor:pointer" onclick="' + (opt.id ? \\`showOptionDetail('\\${opt.id}')\\` : 'showToast(\\'该方案详情即将上线，请咨询客服\\')') + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;width:100%"><div><h4 style="color:var(--text)">' + (opt.name || '') + '</h4>' +
        (opt.id ? '<span style="font-size:0.8rem;color:var(--primary)"><i class="fas fa-chevron-right"></i> 查看详细行程</span>' : '<span style="font-size:0.8rem;color:var(--text-light)">即将上线</span>') +
        '</div><span style="font-weight:700;color:var(--primary);font-size:1.1rem">' + (opt.price || '') + '</span></div></div>'
    ).join('');

    const includesHtml = (data.includes || []).join(' · ');
    const countryEmoji = (data.countryTag || '').split(' ')[0] || '📍';
    const daysDisplay = data.days || data.subtitle || '';
    const coverUrl = data.cover || data.img || '';
    const totalKm = data.totalKm || '';
    const pins = (data.routePins || []).join(' → ');

    // Build modal body HTML using template literal
    modalBody.innerHTML = \\`
        <div class="modal-body">
            <div class="loop-banner" style="background-image:url('\\${coverUrl}')">
                <div class="loop-banner-overlay">
                    <div class="loop-banner-country">\\${data.countryTag || '套餐'}</div>
                    <h2>\\${countryEmoji} \\${data.name || ''}</h2>
                    <div class="loop-banner-meta">
                        <span><i class="fas fa-calendar-alt"></i> \\${daysDisplay}</span>
                        \\${totalKm ? '<span><i class="fas fa-route"></i> ' + totalKm + '</span>' : ''}
                        <span><i class="fas fa-map-pin"></i> \\${pins}</span>
                    </div>
                    <div class="loop-banner-price">\\${data.price || ''} <small>/人起</small></div>
                </div>
            </div>
            \\${mapHtml}
            \\${hlHtml ? '<div style="margin-bottom:12px">' + hlHtml + '</div>' : ''}
            \\${tagHtml ? '<div style="margin-bottom:12px">' + tagHtml + '</div>' : ''}
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> 套餐介绍</h3>
                <p>\\${data.description || ''}</p>
            </div>
            \\${flightSection}${trainSection}${transportHtml ? '<div class="info-grid"><div class="info-card"><h5><i class="fas fa-bus"></i> 当地交通</h5>' + transportHtml + '</div></div>' : ''}
            <div class="modal-section">
                <h3><i class="fas fa-calendar-day"></i> 每日行程（共\\${itineraryData.length}天）</h3>
                \\${itinHtml}
            </div>
            \\${hotelSection}
            \\${foodsHtml || (data.coverages||[]).length ? '<div class="info-grid">' : ''}
            \\${foodsHtml ? '<div class="info-card"><h5><i class="fas fa-utensils"></i> 必吃美食</h5><ul>' + foodsHtml + '</ul></div>' : ''}
            \\${(data.coverages||[]).length ? '<div class="info-card"><h5><i class="fas fa-star"></i> 行程亮点</h5>' + hlHtml + '</div>' : ''}
            \\${foodsHtml || (data.coverages||[]).length ? '</div>' : ''}
            \\${tipsHtml ? '<div class="tips-warn"><h5><i class="fas fa-exclamation-triangle"></i> 贴心提示</h5><ul>' + tipsHtml + '</ul></div>' : ''}
            \\${budgetHtml ? '<div class="budget-bar"><h5><i class="fas fa-calculator"></i> 预算参考（人均）</h5><div class="budget-items">' + budgetHtml + '</div></div>' : ''}
            <div class="modal-section">
                <h3><i class="fas fa-list-alt"></i> 可选方案</h3>
                \\${optionsHtml}
            </div>
            <div class="modal-price-box">
                <div>
                    <div class="price">\\${data.price || ''} <small>/人起</small></div>
                    <div class="includes" style="margin-top:4px"><i class="fas fa-check-circle"></i> \\${includesHtml}</div>
                </div>
                <a href="#contact" class="btn" style="background:white;color:var(--primary);flex-shrink:0" onclick="closeModal()">立即预订</a>
            </div>
        </div>
    \\`;

    setTimeout(() => { if (window.bindLoopMap) window.bindLoopMap(); }, 50);
    destModal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
}
`;

const finalScript = beforeTourData + newTourData + beforeFunc + newFuncCode + afterFunc;

fs.writeFileSync('script.js.new', finalScript);
console.log('Written script.js.new');
console.log('Original:', script.length, 'New:', finalScript.length);
