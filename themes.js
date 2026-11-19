
var THEMES = window.MYTHEMES || [];

function $(id){return document.getElementById(id);}
function tag(v){return v?'<span class="tag">'+v+'</span>':'';}

function findCity(name){
  if(!window.MYL) return null;
  var hit=MYL.getCity(name);
  if(hit) return hit;
  var main=name.split(/[·—-]/)[0].trim();
  return MYL.getCity(main);
}

function routeData(route){
  var c=findCity(route.city);
  var isA=c&&c.tier==='A';
  var nodes=[], foods=[], traffic=[];
  if(isA){
    nodes=(c.itinerary||[]).reduce(function(a,day){
      (day.timeline||[]).forEach(function(t){a.push({n:t.activity||'',d:t.detail||'',t:[t.ticket,t.duration].filter(Boolean).join(' · ')});});
      return a;
    },[]);
    foods=(c.foods||[]).map(function(f){return {n:f.name,d:f.desc||'',p:f.price||''};});
    traffic=(c.transport||[]).map(function(t){return t.label+'：'+t.value;});
  } else if(c){
    nodes=(c.bLandmarks||[]).map(function(x){return {n:x,d:'当地代表性地标',t:''};});
    foods=(c.bFoods||[]).map(function(f){return {n:f,d:'',p:''};});
  }
  var flight=(c&&c.airfare&&c.airfare[0])?c.airfare[0].bookingUrl:'https://flights.ctrip.com';
  var train=(c&&c.trains&&c.trains[0])?c.trains[0].bookingUrl:'https://www.12306.cn';
  var hotelsUrl=(c&&c.hotels&&c.hotels[0]&&c.hotels[0].bookingUrl)||'https://hotels.ctrip.com';
  return {c:c,isA:isA,nodes:nodes,foods:foods,traffic:traffic,flight:flight,train:train,hotelsUrl:hotelsUrl};
}

function viewThemes(){
  $('view').innerHTML='<section class="theme-grid">'+THEMES.map(function(t){
    return '<div class="theme-card" data-id="'+t.id+'">'+
      '<div class="theme-icon"><i class="fas '+t.icon+'"></i></div>'+
      '<h3>'+t.name+'</h3><div class="desc">'+t.desc+'</div>'+
      '<div class="theme-meta"><span><i class="fas fa-users"></i> '+t.who+'</span><span><i class="fas fa-wallet"></i> '+t.budget+'</span><span><i class="far fa-clock"></i> '+t.days+'</span></div>'+
    '</div>';
  }).join('')+'</section>';
  Array.prototype.forEach.call(document.querySelectorAll('.theme-card'),function(el){
    el.onclick=function(){location.hash='#/theme/'+el.dataset.id;};
  });
}

function viewTheme(id){
  var t=THEMES.find(function(x){return x.id===id;});
  if(!t){location.hash='#/themes';return;}
  $('view').innerHTML='<a class="back" href="#/themes"><i class="fas fa-arrow-left"></i> 返回主题列表</a>'+
    '<section class="route-grid">'+t.routes.map(function(r,i){
      return '<div class="route-card" data-t="'+t.id+'" data-i="'+i+'">'+
        '<div class="route-top"><span class="city-tag"><i class="fas fa-map-marker-alt"></i> '+r.city+'</span><span class="price">'+r.price+'</span></div>'+
        '<h4>'+r.name+'</h4><div class="hl">'+r.hl+'</div>'+
        '<div class="route-tags">'+r.tags.map(function(x){return '<span class="rtag">'+x+'</span>';}).join('')+'<span class="rtag">'+r.days+'</span></div>'+
        '<a class="route-link">查看线路详情 →</a>'+
      '</div>';
    }).join('')+'</section>';
  Array.prototype.forEach.call(document.querySelectorAll('.route-card'),function(el){
    el.onclick=function(){location.hash='#/route/'+el.dataset.t+'/'+el.dataset.i;};
  });
}

function viewRoute(tid,idx){
  var t=THEMES.find(function(x){return x.id===tid;});
  var r=t?t.routes[+idx]:null;
  if(!r){location.hash='#/themes';return;}
  var pd=routeData(r);
  var nodes=pd.nodes.map(function(s){return '<div class="node"><div class="t">'+s.n+tag(s.t)+'</div><div class="d">'+(s.d||'')+'</div></div>';}).join('')
    ||'<div class="node"><div class="d">该城景点节点整理中，可参考下方入口查询。</div></div>';
  var foods=pd.foods.map(function(f){return '<div class="node"><div class="t">'+f.n+tag(f.p)+'</div><div class="d">'+(f.d||'')+'</div></div>';}).join('')
    ||'<div class="node"><div class="d">本地美食清单整理中。</div></div>';
  var traffic=pd.traffic.map(function(x){return '<div class="node"><div class="d"><i class="fas fa-arrow-right" style="color:var(--primary)"></i> '+x+'</div></div>';}).join('')
    ||'<div class="node"><div class="d">该城交通方案整理中，可点下方机票与火车票入口查询班次。</div></div>';
  $('view').innerHTML='<a class="back" href="#/theme/'+t.id+'"><i class="fas fa-arrow-left"></i> 返回「'+t.name+'」线路</a>'+
  '<div class="detail">'+
    '<div class="detail-cover"><h2>'+r.name+'</h2><div class="sub">'+r.city+' · '+r.days+' · '+r.price+' · 主题：'+t.name+'</div></div>'+
    '<div class="section"><h3><i class="fas fa-star"></i> 线路亮点</h3><div class="node"><div class="d">'+r.hl+'</div><div class="route-tags" style="margin-top:8px">'+r.tags.map(function(x){return '<span class="rtag">'+x+'</span>';}).join('')+'</div></div></div>'+
    '<div class="section"><h3><i class="fas fa-map-location-dot"></i> 景点节点</h3>'+nodes+'</div>'+
    '<div class="section"><h3><i class="fas fa-utensils"></i> 美食推荐</h3>'+foods+'</div>'+
    '<div class="section"><h3><i class="fas fa-plane-departure"></i> 交通安排</h3>'+traffic+
      '<div class="link-grid" style="margin-top:12px">'+
        '<a class="link-card" href="'+pd.flight+'" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>'+
        '<a class="link-card" href="'+pd.train+'" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>'+
      '</div></div>'+
    '<div class="section"><h3><i class="fas fa-link"></i> 预订入口</h3><div class="link-grid">'+
      '<a class="link-card" href="https://you.ctrip.com" target="_blank" rel="noopener"><b>携程景点</b><span>门票与预约查询</span></a>'+
      '<a class="link-card" href="'+pd.hotelsUrl+'" target="_blank" rel="noopener"><b>携程酒店</b><span>查询住宿价格</span></a>'+
      '<a class="link-card" href="https://www.12306.cn" target="_blank" rel="noopener"><b>12306</b><span>火车票预订</span></a>'+
    '</div></div>'+
  '</div>';
}

function route(){
  var h=(location.hash.replace(/^#\//,'')||'themes');
  var seg=h.split('/');
  if(seg[0]==='themes') viewThemes();
  else if(seg[0]==='theme') viewTheme(seg[1]);
  else if(seg[0]==='route') viewRoute(seg[1],seg[2]);
  else viewThemes();
  window.scrollTo({top:0,behavior:'smooth'});
}
window.addEventListener('hashchange',route);
route();
