
var KEY = ['成都','西安','杭州','厦门','长沙','重庆','青岛','大理','哈尔滨','三亚','北京','上海','广州','南京','苏州','桂林','丽江','敦煌','武汉','昆明','兰州','拉萨'];

var P = {
  '成都':{slogan:'一座把“慢”和“辣”都写进日常的城市', who:'适合：美食爱好者、慢生活追求者、独行与休闲游',
    tags:['美食之都','慢节奏','茶馆文化','消费友好','熊猫','市井烟火'],
    strong:['小吃与火锅密度高，选择多','地铁方便，市区景点集中','生活气息浓，节奏松弛'],
    weak:['夏季闷热潮湿','网红餐排队较久','景点分散度一般'],
    match:'如果你不想赶路、想把时间花在吃上和茶馆里，成都的松弛感会很对味；偏好高强度观光的人可能觉得节奏偏慢。'},
  '西安':{slogan:'把周秦汉唐叠在一座城里的历史现场', who:'适合：人文研学、亲子教育、古迹爱好者',
    tags:['古都底蕴','博物馆','遗迹','研学','面食','城墙'],
    strong:['人文资源密集，讲解与展陈成熟','城区地铁可达，住宿选择多','美食以面食为主，性价比高'],
    weak:['热门场馆需提前预约','临潼景点路程较远','夏季户外较热'],
    match:'喜欢读历史、愿意花时间看文物的人会收获很大；只想拍照打卡、对古迹没兴趣的话，部分行程会偏枯燥。'},
  '厦门':{slogan:'海风、老街与慢节奏揉在一起的海岛', who:'适合：情侣度假、休闲放松、亲子海岛游',
    tags:['海滨休闲','文艺','慢节奏','情侣','闽南味','轮渡'],
    strong:['气候宜人，海岸步道适合散步骑行','城市干净，休闲配套成熟','美食偏闽南，口味温和'],
    weak:['旺季船票与住宿紧张','夏秋季受台风影响','岛上台阶多，拖行李不便'],
    match:'想找个海边城市放空、散步、喝咖啡，厦门很合适；追求刺激玩法或高密度景点的人会觉得偏安静。'},
  '长沙':{slogan:'夜宵、辣味与夜生活堆出来的年轻城市', who:'适合：年轻人、美食夜生活、短周末出行',
    tags:['夜宵之城','辣味','夜生活','市井','网红','低成本'],
    strong:['美食与夜生活密集，夜间热闹','地铁覆盖主要商圈','消费适中，短途性价比高'],
    weak:['湘菜偏辣，肠胃敏感需注意','网红店排队久','夏季闷热'],
    match:'能吃辣、喜欢热闹和夜宵的年轻人会玩得很尽兴；不吃辣、偏好安静休闲的人需要挑店出行。'},
  '重庆':{slogan:'长在山上、夜景立体的江湖城市', who:'适合：摄影、夜景爱好者、喜欢山城地形的游客',
    tags:['山城立体','夜景','江湖气','火锅','机位多','爬坡上坎'],
    strong:['夜景与立体地形独特，出片点多','火锅与小面风味鲜明','商圈集中，交通便利'],
    weak:['地形起伏大，走路爬坡多','导航在立体路况下易失效','夏季炎热'],
    match:'喜欢探索街巷、拍夜景、吃火锅的人会觉得重庆很有性格；腿脚不便或怕热的人需要控制步行强度。'},
  '大理':{slogan:'苍山洱海之间，用来放空的慢节奏目的地', who:'适合：摄影、放空度假、情侣与慢游',
    tags:['湖景田园','慢游','摄影','骑行','高原日晒','民宿'],
    strong:['洱海廊道与田园景观开阔','节奏慢，民宿与咖啡馆多','适合骑行与摄影出片'],
    weak:['海拔约2000米，需放缓节奏','雨季山路受天气影响','商业片区节假日较挤'],
    match:'想逃离快节奏、对着湖景发呆拍照的人会很放松；追求城市便利与密集景点的人可能觉得配套偏散。'}
};

var cur = null;
function $(id){return document.getElementById(id);}
function lpJoin(){var a=[].slice.call(arguments).filter(Boolean);return a.length?' <span class="lp">'+a.join(' · ')+'</span>':'';}

function pool(){
  var q=$('searchInput').value.trim();
  var all = window.MYL ? MYL.indexCities() : [];
  if(q) return MYL.searchCities(q);
  return all.filter(function(c){return KEY.indexOf(c.name)>=0;}).slice(0,12);
}

function autoPortrait(c){
  var isA=c.tier==='A';
  var tags=(c.tags&&c.tags.length)?c.tags.slice(0,6):((c.bLandmarks||[]).slice(0,4).length?c.bLandmarks.slice(0,4):['目的地','休闲出行']);
  var strong=[], weak=[];
  if(isA){
    if(c.foods.length>=3) strong.push('本地美食选择丰富（'+c.foods.length+' 道参考）');
    if(c.hotels.length) strong.push('住宿档位齐全（'+c.hotels.length+' 家参考）');
    if(c.airfare.length||c.trains.length) strong.push('往返航班与高铁方案齐全');
    if(c.itinerary.length) strong.push('行程节点完整，可按天规划');
  } else {
    if((c.bFoods||[]).length) strong.push('本地特色美食 '+(c.bFoods||[]).length+' 道参考');
    if((c.bLandmarks||[]).length) strong.push('收录地标景点 '+(c.bLandmarks||[]).length+' 处');
    if(c.bHistory) strong.push('有城市历史简介可参考');
  }
  if(!strong.length) strong.push('配套信息已收录，可参考下方贴士安排');
  var kw=/排队|提前|预约|防晒|高原|距离|炎热|闷热|雨|台风|温差|爬坡|山路/;
  (c.tips||[]).forEach(function(t){ if(kw.test(t)) weak.push(t); });
  if(weak.length<3) weak.push('旺季部分场馆与餐店建议提前预约');
  return {
    slogan:'以“'+tags[0]+'”为标签的'+(c.country||'中国')+'目的地',
    who:'适合：对'+tags.slice(0,3).join('、')+'感兴趣的游客',
    tags:tags, strong:strong, weak:weak.slice(0,4),
    match:'综合标签与配套看，这座城偏向'+tags.slice(0,3).join('、')+'；出行前可结合天数、同行人与预算，参考下方贴士和交通入口。'
  };
}

function detailBlock(c){
  var isA=c.tier==='A';
  var foods;
  if(isA){
    foods=(c.foods||[]).map(function(f){
      return '<div class="li">'+f.name+lpJoin(f.price,f.desc)+'</div>';
    }).join('');
  } else {
    foods=(c.bFoods||[]).map(function(f){return '<div class="li">'+f+'</div>';}).join('');
  }
  var spots = isA ? '' : (c.bLandmarks||[]).map(function(x){return '<div class="li">'+x+'</div>';}).join('');
  var history = (!isA && c.bHistory) ? '<div class="li">'+c.bHistory+'</div>' : '';
  var hotels=(c.hotels||[]).map(function(h){
    return h.bookingUrl
      ? '<a class="link-card" href="'+h.bookingUrl+'" target="_blank" rel="noopener"><b>'+h.name+'</b><span>'+(h.area||'')+' · '+(h.price||'')+'</span></a>'
      : '<div class="link-card"><b>'+h.name+'</b><span>'+(h.area||'')+' · '+(h.price||'')+'</span></div>';
  }).join('');
  var air=(c.airfare||[]).map(function(a){
    return '<a class="link-card" href="'+a.bookingUrl+'" target="_blank" rel="noopener"><b>'+a.platform+'</b><span>'+a.from+' → '+a.to+' · '+a.price+'</span></a>';
  }).join('');
  var rail=(c.trains||[]).map(function(t){
    return '<a class="link-card" href="'+t.bookingUrl+'" target="_blank" rel="noopener"><b>'+t.platform+'</b><span>'+t.from+' → '+t.to+' · '+t.price+'</span></a>';
  }).join('');
  var tips=(c.tips||[]).map(function(t){return '<div class="li"><i class="fas fa-circle-info" style="color:var(--primary)"></i> '+t+'</div>';}).join('');
  var stats=[
    '<span class="badge"><i class="fas fa-route"></i> '+(c.itinerary.length)+' 节点</span>',
    '<span class="badge"><i class="fas fa-utensils"></i> '+(isA?c.foods.length:(c.bFoods||[]).length)+' 美食</span>',
    '<span class="badge"><i class="fas fa-hotel"></i> '+(c.hotels.length)+' 住宿</span>'
  ];
  if(c.airfare.length) stats.push('<span class="badge"><i class="fas fa-plane"></i> 航班</span>');
  if(c.trains.length) stats.push('<span class="badge"><i class="fas fa-train"></i> 高铁</span>');
  var html='';
  if(!isA) html+='<div class="note">轻量参考：该城完整路书整理中，下方为已有地标、美食与通用交通住宿入口。</div>';
  html+='<div class="dsec"><h4>配套概况</h4><div class="stats">'+stats.join('')+'</div></div>';
  if(spots) html+='<div class="dsec"><h4><i class="fas fa-map-location-dot"></i> 地标景点</h4>'+spots+'</div>';
  if(foods) html+='<div class="dsec"><h4><i class="fas fa-utensils"></i> 美食</h4>'+foods+'</div>';
  if(history) html+='<div class="dsec"><h4><i class="fas fa-landmark"></i> 城市简介</h4>'+history+'</div>';
  if(hotels) html+='<div class="dsec"><h4><i class="fas fa-hotel"></i> 住宿建议</h4><div class="link-grid">'+hotels+'</div></div>';
  if(air) html+='<div class="dsec"><h4><i class="fas fa-plane-departure"></i> 航班入口</h4><div class="link-grid">'+air+'</div></div>';
  if(rail) html+='<div class="dsec"><h4><i class="fas fa-train"></i> 高铁/火车入口</h4><div class="link-grid">'+rail+'</div></div>';
  if(!isA){
    html+='<div class="dsec"><h4><i class="fas fa-link"></i> 通用预订入口</h4><div class="link-grid">'+
      '<a class="link-card" href="https://flights.ctrip.com" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>'+
      '<a class="link-card" href="https://www.12306.cn" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>'+
      '<a class="link-card" href="https://hotels.ctrip.com" target="_blank" rel="noopener"><b>携程酒店</b><span>查询住宿价格</span></a>'+
    '</div></div>';
  }
  if(tips) html+='<div class="dsec"><h4><i class="fas fa-lightbulb"></i> 出行贴士</h4>'+tips+'</div>';
  return html;
}

function renderTabs(){
  var listArr=pool();
  var allCount = window.MYL ? MYL.indexCities().length : 0;
  $('count').textContent='共 '+allCount+' 城';
  if(cur && !listArr.some(function(c){return c.name===cur;})) cur=listArr[0]?listArr[0].name:null;
  if(!cur && listArr.length) cur=listArr[0].name;
  $('tabs').innerHTML=listArr.map(function(c){
    return '<button class="ct'+(cur===c.name?' active':'')+'" data-name="'+c.name+'">'+c.name+'</button>';
  }).join('');
  Array.prototype.forEach.call(document.querySelectorAll('.ct'),function(b){
    b.onclick=function(){cur=b.dataset.name;renderTabs();render();};
  });
}

function render(){
  var c = cur ? MYL.getCity(cur) : null;
  if(!c){$('portrait').innerHTML='<div class="empty">没有匹配的城市</div>';return;}
  var p = P[c.name] || autoPortrait(c);
  var cloud=p.tags.map(function(t,i){return '<span class="cloud'+(i===0?' big':'')+'">'+t+'</span>';}).join('');
  var strong=p.strong.map(function(x){return '<li><i class="fas fa-check"></i>'+x+'</li>';}).join('');
  var weak=p.weak.map(function(x){return '<li><i class="fas fa-xmark"></i>'+x+'</li>';}).join('');
  var lightTag = c.tier!=='A' ? ' · 轻量参考' : '';
  $('portrait').innerHTML=
  '<div class="card">'+
    '<div class="cover"><h2>'+c.name+lightTag+'</h2><div class="slogan">“'+p.slogan+'”</div><div class="who"><i class="fas fa-users"></i> '+p.who+'</div></div>'+
    '<div class="body">'+
      '<div class="tag-cloud">'+cloud+'</div>'+
      '<div class="cols">'+
        '<div class="col"><h3><i class="fas fa-thumbs-up"></i> 强项</h3><ul>'+strong+'</ul></div>'+
        '<div class="col"><h3><i class="fas fa-thumbs-down"></i> 需要注意</h3><ul>'+weak+'</ul></div>'+
      '</div>'+
      '<div class="match"><h3><i class="fas fa-heart"></i> 匹配判断</h3><p>'+p.match+'</p></div>'+
      detailBlock(c)+
    '</div>'+
  '</div>';
}

$('searchInput').addEventListener('input',function(){renderTabs();render();});
renderTabs();render();
