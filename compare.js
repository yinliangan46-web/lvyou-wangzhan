
/* 评分统一取自 city-score 分片；缺省城市用中性参考分 */
var DEF = {tag:'目的地',price:'参考预算（以平台实时为准）',days:'2–3天',drive:'见市内交通',season:'见出行贴士',who:'—',avoid:'—',transport:'见交通方案',risk:'参考评分，最终以实际为准',food:3,value:3,relax:3,photo:3,scenery:3,culture:3,night:2,walk:3};

var DIM = [
  {k:'food', label:'美食密度'},{k:'value', label:'性价比'},{k:'relax', label:'轻松度'},
  {k:'photo', label:'出片度'},{k:'scenery', label:'景观风光'},{k:'culture', label:'文化浓度'},
  {k:'night', label:'夜生活'},{k:'walk', label:'步行强度（越高越累）'}
];
var RADAR = ['scenery','food','value','relax','photo'];
var COLORS = ['#2563eb','#16a34a','#d97706','#7c3aed'];
var selected = [];

function $(id){return document.getElementById(id);}
function scoreOf(c){
  var s = window.MYLSCORE && window.MYLSCORE.get(c.name);
  if(!s) return DEF;
  return Object.assign({food:s.c.food,value:s.c.value,relax:s.c.relax,photo:s.c.photo,scenery:s.c.scenery,culture:s.c.culture,night:s.c.night,walk:s.c.walk}, s);
}

function renderChips(){
  var q = $('searchInput').value.trim();
  var all = window.MYL ? MYL.indexCities() : [];
  var list = q ? (window.MYL ? MYL.searchCities(q) : []) : [];
  $('count').textContent = '共 ' + all.length + ' 城';
  if(!q){
    $('chips').innerHTML = '<div class="empty">输入城市名或标签（如：海边、古都、美食），从匹配结果中选择要对比的目的地。</div>';
  } else {
    $('chips').innerHTML = list.map(function(c){
      var on = selected.indexOf(c.name) >= 0;
      if (c.tier !== 'A') {
        return '<button class="chip'+(on?' active':'')+'" data-name="'+c.name+'">'+c.name+'<span class="cnt">轻量</span></button>';
      }
      return '<button class="chip'+(on?' active':'')+'" data-name="'+c.name+'">'+c.name+'<span class="cnt">'+(scoreOf(c).tag)+'</span></button>';
    }).join('') || '<div class="empty">没有匹配的城市</div>';
  }
  Array.prototype.forEach.call(document.querySelectorAll('.chip'),function(btn){
    btn.onclick=function(){
      var name=btn.dataset.name, i=selected.indexOf(name);
      if(i>=0){selected.splice(i,1);}
      else{
        if(selected.length>=4){alert('最多对比 4 个目的地');return;}
        selected.push(name);
      }
      renderChips(); renderResult();
    };
  });
  $('basket').innerHTML = selected.length? '已选 <b>'+selected.length+'</b> 个：'+selected.join('、')+'（可再点取消）' : '还未选择，勾选城市后这里生成对比表与详情。';
}

function bar(n){return '<div class="score"><div class="bar"><i style="width:'+(n/5*100)+'%"></i></div><span>'+n+'/5</span></div>';}

function renderTable(list){
  var head = '<tr><th>对比维度</th>'+list.map(function(c){
    var s=scoreOf(c);
    return '<td class="obj"><div class="obj-head"><span>'+c.name+'</span><span class="tag">'+s.tag+'</span></div></td>';
  }).join('')+'</tr>';
  function row(label, fn){ return '<tr><th>'+label+'</th>'+list.map(function(c){return '<td>'+fn(c)+'</td>';}).join('')+'</tr>'; }
  function bestCell(key, reverse){
    return list.map(function(c){
      var v=scoreOf(c)[key];
      var max=Math.max.apply(null,list.map(function(x){return scoreOf(x)[key];}));
      var min=Math.min.apply(null,list.map(function(x){return scoreOf(x)[key];}));
      var cls=(!reverse&&v===max)||(reverse&&v===min)?'best':'';
      return '<td class="'+cls+'">'+bar(v)+'</td>';
    }).join('');
  }
  var rows = head
    + row('人均参考', function(c){return scoreOf(c).price;})
    + row('建议天数', function(c){return scoreOf(c).days;})
    + row('交通强度', function(c){return scoreOf(c).drive;})
    + '<tr><th>美食密度</th>'+bestCell('food')+'</tr>'
    + '<tr><th>性价比</th>'+bestCell('value')+'</tr>'
    + '<tr><th>轻松度</th>'+bestCell('relax')+'</tr>'
    + '<tr><th>出片度</th>'+bestCell('photo')+'</tr>'
    + '<tr><th>景观风光</th>'+bestCell('scenery')+'</tr>'
    + '<tr><th>文化浓度</th>'+bestCell('culture')+'</tr>'
    + '<tr><th>夜生活</th>'+bestCell('night')+'</tr>'
    + '<tr><th>步行强度</th>'+bestCell('walk', true)+'</tr>'
    + row('最佳季节', function(c){return scoreOf(c).season;})
    + row('适合人群', function(c){return scoreOf(c).who;})
    + row('不太适合', function(c){return scoreOf(c).avoid;})
    + row('交通成本', function(c){return scoreOf(c).transport;})
    + row('避坑提示', function(c){return scoreOf(c).risk;});
  return '<div class="card"><h3><i class="fas fa-table"></i> 对比矩阵</h3><div class="table-wrap"><table>'+rows+'</table></div><div class="note">绿色标注为该维度表现更优项；未列入精细评分的城市为中性参考分。价格与强度为站内参考口径，出行前以平台实时信息为准。</div></div>';
}

function radarSVG(list){
  var size=300, cx=size/2, cy=size/2, R=100, n=RADAR.length;
  function pt(i,r){var ang=-Math.PI/2+i*2*Math.PI/n;return [cx+r*Math.cos(ang),cy+r*Math.sin(ang)];}
  var grid='';
  [1,0.66,0.33].forEach(function(f){var pts=[];for(var i=0;i<n;i++){var p=pt(i,R*f);pts.push(p[0]+','+p[1]);}grid+='<polygon points="'+pts.join(' ')+'" fill="none" stroke="#e6ecf5"/>';});
  var axes='';
  for(var i=0;i<n;i++){var p=pt(i,R);axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" stroke="#e6ecf5"/>';var lp=pt(i,R+22);axes+='<text x="'+lp[0]+'" y="'+lp[1]+'" text-anchor="middle" font-size="11" fill="#6b7787">'+RADAR[i]+'</text>';}
  var polys=list.map(function(c,idx){var s=scoreOf(c);var pts=RADAR.map(function(k,i){var p=pt(i,R*s[k]/5);return p[0]+','+p[1];}).join(' ');return '<polygon points="'+pts+'" fill="'+COLORS[idx%COLORS.length]+'" fill-opacity="0.15" stroke="'+COLORS[idx%COLORS.length]+'" stroke-width="2"/>';}).join('');
  var legend='<div class="legend">'+list.map(function(c,i){return '<span><i class="dot" style="background:'+COLORS[i%COLORS.length]+'"></i>'+c.name+'</span>';}).join('')+'</div>';
  return '<div class="card radar-box"><h3><i class="fas fa-chart-radar"></i> 五维画像</h3><svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">'+grid+axes+polys+'</svg>'+legend+'</div>';
}

function conclusion(list){
  if(list.length<2) return '';
  function top(key){var b=list[0];list.forEach(function(c){if(scoreOf(c)[key]>scoreOf(b)[key])b=c;});return b;}
  var food=top('food'),relax=top('relax'),value=top('value'),photo=top('photo'),scenery=top('scenery'),culture=top('culture');
  var tips=[
    {i:'fa-utensils',t:'想吃得尽兴，优先选 <b>'+food.name+'</b>（美食密度 '+scoreOf(food).food+'/5）。'},
    {i:'fa-couch',t:'想轻松度假不赶路，优先选 <b>'+relax.name+'</b>（轻松度 '+scoreOf(relax).relax+'/5）。'},
    {i:'fa-wallet',t:'看重性价比，优先选 <b>'+value.name+'</b>（性价比 '+scoreOf(value).value+'/5）。'},
    {i:'fa-camera',t:'想拍照出片，优先选 <b>'+photo.name+'</b>（出片度 '+scoreOf(photo).photo+'/5）。'},
    {i:'fa-mountain',t:'想看自然风光，优先选 <b>'+scenery.name+'</b>（景观 '+scoreOf(scenery).scenery+'/5）。'},
    {i:'fa-landmark',t:'想了解历史文化，优先选 <b>'+culture.name+'</b>（文化浓度 '+scoreOf(culture).culture+'/5）。'}
  ];
  return '<div class="card conclusion"><h3><i class="fas fa-lightbulb"></i> 对比结论</h3>'+tips.map(function(x){return '<div class="concl-item"><i class="fas '+x.i+'"></i><span>'+x.t+'</span></div>';}).join('')+'<div class="note">结论由站内标签规则生成，仅供方向参考；最终请结合同行人、天数和预算决定。</div></div>';
}

/* ===== 详情卡：行程节点 / 美食 / 住宿 / 交通 / 航班高铁 ===== */
function detailCard(c){
  var s=scoreOf(c);
  var isA=c.tier==='A';
  var itinerary=(c.itinerary||[]).map(function(d){
    var tl=(d.timeline||[]).map(function(t){
      var extra=(t.duration?' · '+t.duration:'')+(t.ticket?' · '+t.ticket:'')+(t.tip?'（'+t.tip+'）':'');
      return '<div class="tl"><span class="tm">'+(t.time||'')+'</span><span class="ta">'+(t.activity||'')+'</span><span class="td">'+(t.detail||'')+extra+'</span></div>';
    }).join('');
    return '<div class="day"><div class="day-t">'+(d.day||'')+' · '+(d.theme||'')+'</div>'+tl+'</div>';
  }).join('');

  var foods;
  if(isA){
    foods=(c.foods||[]).map(function(f){
      return '<div class="li">'+f.name+' <span class="lp">'+(f.price||'')+(f.desc?' · '+f.desc:'')+'</span></div>';
    }).join('');
  } else {
    foods=(c.bFoods||[]).map(function(f){return '<div class="li">'+f+'</div>';}).join('');
  }
  var spots = isA ? '' : (c.bLandmarks||[]).map(function(x){return '<div class="li">'+x+'</div>';}).join('');
  var history = (!isA && c.bHistory) ? '<div class="li">'+c.bHistory+'</div>' : '';

  var hotels=(c.hotels||[]).map(function(h){
    var link=h.bookingUrl?'<a class="link-card" href="'+h.bookingUrl+'" target="_blank" rel="noopener"><b>'+h.name+'</b><span>'+(h.area||'')+' · '+(h.price||'')+'</span><span>'+(h.highlight||'')+'</span></a>':'<div class="link-card"><b>'+h.name+'</b><span>'+(h.area||'')+' · '+(h.price||'')+'</span></div>';
    return link;
  }).join('');

  var transport=(c.transport||[]).map(function(t){return '<div class="li"><b>'+t.label+'</b> <span class="lp">'+t.value+'</span></div>';}).join('');

  var air=(c.airfare||[]).map(function(a){
    return '<a class="link-card" href="'+a.bookingUrl+'" target="_blank" rel="noopener"><b>'+a.platform+'</b><span>'+a.from+' → '+a.to+' · '+a.price+'</span><span>'+(a.time||'')+'</span></a>';
  }).join('');

  var rail=(c.trains||[]).map(function(t){
    return '<a class="link-card" href="'+t.bookingUrl+'" target="_blank" rel="noopener"><b>'+t.platform+'</b><span>'+t.from+' → '+t.to+' · '+t.price+'</span><span>'+(t.duration||'')+' '+(t.time||'')+'</span></a>';
  }).join('');

  var generic='';
  if(!isA){
    generic='<div class="link-grid">'+
      '<a class="link-card" href="https://flights.ctrip.com" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>'+
      '<a class="link-card" href="https://www.12306.cn" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>'+
      '<a class="link-card" href="https://hotels.ctrip.com" target="_blank" rel="noopener"><b>携程酒店</b><span>查询住宿价格</span></a>'+
    '</div>';
  }

  var budget=(c.budget||[]).map(function(b){return '<div class="li">'+b.label+' <span class="lp">'+b.value+'</span></div>';}).join('');
  var tips=(c.tips||[]).map(function(t){return '<div class="li"><i class="fas fa-circle-info" style="color:var(--primary)"></i> '+t+'</div>';}).join('');
  var lightTag = isA?'':' · 轻量参考';

  return '<div class="dcard"><div class="dhead"><h3>'+c.name+'</h3><div class="sub">'+(c.country||'中国')+' · '+(c.days||s.days)+' · '+s.tag+lightTag+'</div></div><div class="dbody">'
    + (!isA?'<div class="note" style="margin-bottom:12px">轻量参考：该城完整路书整理中，下方为已有地标、美食与通用交通住宿入口。</div>':'')
    + (itinerary?'<div class="dsec"><h4><i class="fas fa-route"></i> 行程节点</h4>'+itinerary+'</div>':'')
    + (spots?'<div class="dsec"><h4><i class="fas fa-map-location-dot"></i> 地标景点</h4>'+spots+'</div>':'')
    + (foods?'<div class="dsec"><h4><i class="fas fa-utensils"></i> 美食</h4>'+foods+'</div>':'')
    + (history?'<div class="dsec"><h4><i class="fas fa-landmark"></i> 城市简介</h4>'+history+'</div>':'')
    + (hotels?'<div class="dsec"><h4><i class="fas fa-hotel"></i> 住宿建议</h4><div class="link-grid">'+hotels+'</div></div>':'')
    + (transport?'<div class="dsec"><h4><i class="fas fa-bus"></i> 市内交通</h4>'+transport+'</div>':'')
    + (air?'<div class="dsec"><h4><i class="fas fa-plane-departure"></i> 航班入口</h4><div class="link-grid">'+air+'</div></div>':'')
    + (rail?'<div class="dsec"><h4><i class="fas fa-train"></i> 高铁/火车入口</h4><div class="link-grid">'+rail+'</div></div>':'<div class="dsec"><h4><i class="fas fa-train"></i> 高铁/火车</h4><div class="note">该城暂无火车直达参考，可在 12306 查询出发地线路。</div></div>')
    + (generic?'<div class="dsec"><h4><i class="fas fa-link"></i> 通用预订入口</h4>'+generic+'</div>':'')
    + (budget?'<div class="dsec"><h4><i class="fas fa-wallet"></i> 预算拆分</h4>'+budget+'</div>':'')
    + (tips?'<div class="dsec"><h4><i class="fas fa-lightbulb"></i> 出行贴士</h4>'+tips+'</div>':'')
    + '</div></div>';
}

function renderResult(){
  var box=$('result');
  if(!selected.length){box.innerHTML='<div class="card empty"><i class="fas fa-route"></i><div>勾选上方城市后，这里会出现对比矩阵、五维画像、选择建议和各城详情。</div></div>';return;}
  var list=selected.map(function(n){return MYL.getCity(n);}).filter(Boolean);
  var layout=list.length<=2?'<div class="grid"><div>'+renderTable(list)+'</div>'+radarSVG(list)+'</div>':renderTable(list)+'<div style="margin-top:18px">'+radarSVG(list)+'</div>';
  var details='<div class="card"><h3><i class="fas fa-map-location-dot"></i> 所选目的地详情</h3><div class="detail-grid">'+list.map(detailCard).join('')+'</div></div>';
  box.innerHTML=layout+conclusion(list)+details;
}

$('searchInput').addEventListener('input',renderChips);
renderChips(); renderResult();
