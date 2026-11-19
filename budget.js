
/* 9 城精细基准（单人单日，元）；其余 A 级城用中性参考档 */
var BASE = {
  '成都':{flight:600, hotel:{budget:220,comfort:360,luxury:600}, food:{budget:70,comfort:110,luxury:180}, ticket:{budget:60,comfort:100,luxury:160}, local:{budget:30,comfort:50,luxury:90}},
  '西安':{flight:600, hotel:{budget:220,comfort:340,luxury:560}, food:{budget:60,comfort:100,luxury:160}, ticket:{budget:80,comfort:120,luxury:180}, local:{budget:30,comfort:50,luxury:90}},
  '厦门':{flight:700, hotel:{budget:240,comfort:380,luxury:620}, food:{budget:70,comfort:110,luxury:170}, ticket:{budget:50,comfort:90,luxury:140}, local:{budget:30,comfort:50,luxury:90}},
  '青岛':{flight:650, hotel:{budget:220,comfort:360,luxury:600}, food:{budget:70,comfort:110,luxury:170}, ticket:{budget:50,comfort:90,luxury:140}, local:{budget:30,comfort:50,luxury:90}},
  '大理':{flight:700, hotel:{budget:200,comfort:340,luxury:560}, food:{budget:70,comfort:100,luxury:160}, ticket:{budget:60,comfort:100,luxury:150}, local:{budget:40,comfort:60,luxury:100}},
  '哈尔滨':{flight:800, hotel:{budget:260,comfort:400,luxury:660}, food:{budget:70,comfort:110,luxury:170}, ticket:{budget:100,comfort:150,luxury:220}, local:{budget:30,comfort:50,luxury:90}},
  '三亚':{flight:900, hotel:{budget:300,comfort:560,luxury:900}, food:{budget:90,comfort:150,luxury:240}, ticket:{budget:70,comfort:120,luxury:200}, local:{budget:40,comfort:70,luxury:110}},
  '长沙':{flight:500, hotel:{budget:200,comfort:320,luxury:520}, food:{budget:70,comfort:100,luxury:160}, ticket:{budget:30,comfort:60,luxury:100}, local:{budget:25,comfort:40,luxury:80}},
  '重庆':{flight:550, hotel:{budget:200,comfort:320,luxury:520}, food:{budget:70,comfort:100,luxury:160}, ticket:{budget:40,comfort:70,luxury:110}, local:{budget:25,comfort:40,luxury:80}}
};
var DEF = {flight:650, hotel:{budget:200,comfort:340,luxury:560}, food:{budget:70,comfort:110,luxury:170}, ticket:{budget:50,comfort:90,luxury:150}, local:{budget:30,comfort:50,luxury:90}};
var COLORS = ['#2563eb','#4f86f7','#7fb0ff','#a8c8ff','#c9dcfd'];
var tier='comfort';

function $(id){return document.getElementById(id);}
function lp(v){return v?' <span class="lp">'+v+'</span>':'';}
function lpJoin(){var a=[].slice.call(arguments).filter(Boolean);return a.length?' <span class="lp">'+a.join(' · ')+'</span>':'';}
function cityList(){ return window.MYL ? MYL.indexCities() : []; }
function baseOf(name){ return BASE[name] || DEF; }

function renderCities(){
  var all=cityList();
  $('cityList').innerHTML=all.map(function(c){return '<option value="'+c.name+'">';}).join('');
  if(!$('cityInput').value && all.length) $('cityInput').value=all[0].name;
}

function detailSection(c){
  if(!c) return '';
  var isA=c.tier==='A';
  var budget=(c.budget||[]).map(function(b){return '<div class="li">'+b.label+lp(b.value)+'</div>';}).join('');
  var foods=isA
    ? (c.foods||[]).map(function(f){return '<div class="li">'+f.name+lp(f.price)+'</div>';}).join('')
    : (c.bFoods||[]).map(function(f){return '<div class="li">'+f+'</div>';}).join('');
  var spots=(c.landmarks||[]).map(function(x){return '<div class="li">'+x+'</div>';}).join('');
  var history=c.history?'<div class="li">'+c.history+'</div>':'';
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
  var html='';
  if(budget) html+='<div class="dsec"><h4><i class="fas fa-wallet"></i> 站内预算参考</h4>'+budget+'</div>';
  if(spots) html+='<div class="dsec"><h4><i class="fas fa-map-location-dot"></i> 地标景点</h4>'+spots+'</div>';
  if(foods) html+='<div class="dsec"><h4><i class="fas fa-utensils"></i> 当地美食</h4>'+foods+'</div>';
  if(history) html+='<div class="dsec"><h4><i class="fas fa-landmark"></i> 城市简介</h4>'+history+'</div>';
  if(hotels) html+='<div class="dsec"><h4><i class="fas fa-hotel"></i> 住宿建议</h4><div class="link-grid">'+hotels+'</div></div>';
  if(air) html+='<div class="dsec"><h4><i class="fas fa-plane-departure"></i> 航班入口</h4><div class="link-grid">'+air+'</div></div>';
  if(rail) html+='<div class="dsec"><h4><i class="fas fa-train"></i> 高铁/火车入口</h4><div class="link-grid">'+rail+'</div></div>';
  if(c.generic){
    html+='<div class="dsec"><h4><i class="fas fa-link"></i> 通用预订入口</h4><div class="link-grid">'+
      '<a class="link-card" href="https://flights.ctrip.com" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>'+
      '<a class="link-card" href="https://www.12306.cn" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>'+
      '<a class="link-card" href="https://hotels.ctrip.com" target="_blank" rel="noopener"><b>携程酒店</b><span>查询住宿价格</span></a>'+
    '</div></div>';
  }
  return html;
}

function calc(){
  var name=$('cityInput').value.trim();
  var c=MYL.getCity(name);
  var city=c?baseOf(c.name):DEF;
  var days=+$('days').value, ppl=+$('ppl').value;
  var nights=days-1;
  var rooms = ppl===1?1:ppl===2?1:2;
  var flight=city.flight*ppl;
  var hotel=city.hotel[tier]*nights*rooms;
  var food=city.food[tier]*days*ppl;
  var ticket=city.ticket[tier]*days*ppl;
  var local=city.local[tier]*days*ppl;
  var items=[
    {label:'往返机票', val:flight, d:'按人均往返估算'},
    {label:'住宿', val:hotel, d:nights+' 晚 × '+rooms+' 间房'},
    {label:'餐饮', val:food, d:days+' 天 × '+ppl+' 人'},
    {label:'门票/活动', val:ticket, d:'景点与体验项目'},
    {label:'当地交通', val:local, d:'地铁/打车/接驳'}
  ];
  var total=items.reduce(function(a,b){return a+b.val;},0);
  var per=Math.round(total/ppl);

  var r=70, cx=90, cy=90, C=2*Math.PI*r, offset=0;
  var arcs=items.map(function(it,i){
    var frac=total?it.val/total:0;
    var seg='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+COLORS[i]+'" stroke-width="22" stroke-dasharray="'+(frac*C).toFixed(1)+' '+(C).toFixed(1)+'" stroke-dashoffset="'+(-offset*C).toFixed(1)+'"/>';
    offset+=frac; return seg;
  }).join('');
  var legend=items.map(function(it,i){
    return '<div class="lg"><i style="background:'+COLORS[i]+'"></i>'+it.label+'<span class="v">¥'+it.val.toLocaleString()+'</span></div>';
  }).join('');
  var details=items.map(function(it){
    return '<div class="detail-item"><div>'+it.label+'<div class="d">'+it.d+'</div></div><div>¥'+it.val.toLocaleString()+'</div></div>';
  }).join('');

  var plans=planCards(city,days,ppl);

  /* 分项占比条形图（点击行可显隐该项） */
  var maxItem=Math.max.apply(null,items.map(function(x){return x.val;}));
  var bars=items.map(function(it,i){
    var w=total?(it.val/total*100).toFixed(1):0;
    return '<div class="bar-row" data-i="'+i+'"><div class="bar-head"><span>'+it.label+'</span><span class="v">¥'+it.val.toLocaleString()+'</span></div><div class="bar-track"><div class="bar-fill" style="width:'+w+'%;background:'+COLORS[i]+'"></div></div></div>';
  }).join('');

  /* 三档预算对比条形图 */
  var tierTotals=['budget','comfort','luxury'].map(function(t){
    var f=city.flight*ppl, h=city.hotel[t]*nights*(ppl===3?2:1), fo=city.food[t]*days*ppl, ti=city.ticket[t]*days*ppl, lo=city.local[t]*days*ppl;
    return {t:t,label:t==='budget'?'经济':t==='comfort'?'舒适':'品质',total:f+h+fo+ti+lo};
  });
  var maxTier=Math.max.apply(null,tierTotals.map(function(x){return x.total;}));
  var tbars=tierTotals.map(function(x){
    var w=(x.total/maxTier*100).toFixed(1);
    var hot=x.t===tier;
    return '<div class="tier-row'+(hot?' hot':'')+'"><div class="tier-label">'+x.label+'</div><div class="bar-track"><div class="bar-fill" style="width:'+w+'%"></div></div><div class="v">¥'+x.total.toLocaleString()+'</div></div>';
  }).join('');

  $('out').innerHTML =
    '<div class="panel"><div class="total-row"><span class="num">¥'+total.toLocaleString()+'</span><span class="per">合计 · 人均 ¥'+per.toLocaleString()+'（'+(c?c.name:'所选城市')+' · '+days+' 天 '+ppl+' 人）</span></div>'+
      '<div class="wrap"><svg width="180" height="180" viewBox="0 0 180 180">'+arcs+'<text x="90" y="86" text-anchor="middle" font-size="18" font-weight="900" fill="#1a2433">¥'+per.toLocaleString()+'</text><text x="90" y="106" text-anchor="middle" font-size="11" fill="#6b7787">人均</text></svg><div class="legend">'+legend+'</div></div>'+
      '<div class="chart-sec"><h4><i class="fas fa-chart-bar"></i> 分项占比条形图（点击行可显隐）</h4><div class="bars">'+bars+'</div></div>'+
      '<div class="chart-sec"><h4><i class="fas fa-scale-balanced"></i> 三档预算对比</h4><div class="tbars">'+tbars+'</div></div>'+
      '<div style="margin-top:16px">'+details+'</div>'+
      '<div class="note">未列入精细基准的城市为中性参考价，实际以平台实时报价为准。</div>'+
      detailSection(c)+
    '</div>'+
    '<div class="plans">'+plans+'</div>';

  Array.prototype.forEach.call(document.querySelectorAll('.bar-row'),function(row){
    row.onclick=function(){row.classList.toggle('off');};
  });
}

function planCards(city,days,ppl){
  var nights=days-1;
  function pack(t,label,hot,opts){
    var flight=city.flight*ppl, hotel=city.hotel[t]*nights*(ppl===3?2:1), food=city.food[t]*days*ppl, ticket=city.ticket[t]*days*ppl, local=city.local[t]*days*ppl;
    var total=flight+hotel+food+ticket+local;
    return '<div class="plan'+(hot?' hot':'')+'"><h4>'+label+'</h4><div class="p">¥'+total.toLocaleString()+' <span style="font-size:12px;color:var(--muted);font-weight:400">人均 ¥'+Math.round(total/ppl).toLocaleString()+'</span></div><ul>'+
      opts.map(function(o){return '<li><i class="fas fa-check" style="color:var(--primary)"></i> '+o+'</li>';}).join('')+'</ul></div>';
  }
  var b=pack('budget','经济档',false,['住宿：连锁酒店或青旅标间','餐饮：本地小吃与家常菜','交通：地铁公交为主','适合学生与独行游客']);
  var c=pack('comfort','舒适档',true,['住宿：商圈中档酒店','餐饮：正餐+特色店兼顾','交通：打车与地铁结合','含主要景点与一次特色体验']);
  return b+c;
}

Array.prototype.forEach.call(document.querySelectorAll('#tier button'),function(b){
  b.onclick=function(){
    tier=b.dataset.t;
    Array.prototype.forEach.call(document.querySelectorAll('#tier button'),function(x){x.classList.remove('active');});
    b.classList.add('active');calc();
  };
});
$('calcBtn').onclick=calc;
$('cityInput').addEventListener('change',calc);
renderCities();calc();
