
var SHEETS = window.MYLSHEETS || [];

var cur = null;
function $(id){return document.getElementById(id);}
function tag(v){return v?'<span class="tag">'+v+'</span>':'';}
var GENERIC_PACK=['舒服的步行鞋','身份证、手机充电宝','常备肠胃药与常用药','薄外套，按目的地温差准备'];

function genSheet(c){
  var isA=c.tier==='A';
  var flight=(c.airfare&&c.airfare[0])?c.airfare[0].bookingUrl:'https://flights.ctrip.com';
  var train=(c.trains&&c.trains[0])?c.trains[0].bookingUrl:'https://www.12306.cn';
  var hotelsUrl=(c.hotels&&c.hotels[0]&&c.hotels[0].bookingUrl)||'https://hotels.ctrip.com';
  var ticket=[],hotel=[],foods=[],go=[],local='',tips=(c.tips||[]).slice();
  if(isA){
    ticket=(c.itinerary||[]).reduce(function(a,day){
      (day.timeline||[]).forEach(function(t){
        a.push({spot:t.activity||'',open:t.duration||'以景区当日公示为准',price:t.ticket||'见现场公示',reserve:'出行前线上/现场确认',channel:'携程购票'});
      });
      return a;
    },[]);
    hotel=(c.hotels||[]).map(function(h){return {area:h.name,level:h.area||h.highlight||'',price:h.price||''};});
    foods=(c.foods||[]).map(function(f){return {name:f.name,price:f.price||'',note:f.desc||''};});
    go=(c.transport||[]).filter(function(t){return /飞机|高铁|火车/.test(t.label||'');}).map(function(t){return t.label+'：'+t.value;});
    local=(c.transport||[]).filter(function(t){return !/飞机|高铁|火车/.test(t.label||'');}).map(function(t){return t.label+'：'+t.value;}).join('；')||'市内交通建议以地图导航为准。';
  } else {
    ticket=(c.bLandmarks||[]).map(function(x){return {spot:x,open:'以现场公示为准',price:'见景区公示',reserve:'出行前线上确认',channel:'携程购票'};});
    foods=(c.bFoods||[]).map(function(f){return {name:f,price:'',note:'当地特色饮食'};});
    local='该城交通方案整理中，建议出行前用地图与票务平台核对班次。';
    if(!tips.length) tips=['该城详细备忘整理中，交通、门票与开放时间请以平台当日公示为准'];
  }
  return {name:c.name,tag:(c.country||'中国')+(isA?' · 完整参考':' · 轻量参考'),summary:c.bHistory||(c.tags&&c.tags.join('、'))||'目的地备忘整理中，下方入口可查询交通与住宿。',
    ticket:ticket,transport:{go:go.length?go:['飞机/高铁：请在下方机票与火车票入口查询班次'],local:local,flight:flight,train:train},
    hotel:hotel,foods:foods,pack:GENERIC_PACK,tips:tips,
    links:[{t:'携程 · '+c.name+'酒店',u:hotelsUrl},{t:'携程 · '+c.name+'景点',u:'https://you.ctrip.com'},{t:'12306 火车票',u:'https://www.12306.cn'}]};
}

function pick(name){
  var s=SHEETS.find(function(x){return x.id===name;});
  if(s) return s;
  var c=MYL.getCity(name);
  return c?genSheet(c):null;
}

function chipList(){
  var q=$('searchInput').value.trim();
  return q ? MYL.searchCities(q).slice(0,30) : [];
}

function renderChips(){
  var list=chipList();
  if(cur&&!list.some(function(c){return c.name===cur;})) cur=list[0]?list[0].name:null;
  if(!cur&&list.length) cur=list[0].name;
  if(!list.length){ $('chips').innerHTML='<div style="color:var(--muted);font-size:13px">输入城市名或标签，从匹配结果中选择目的地生成备忘单。</div>'; return; }
  $('chips').innerHTML=list.map(function(c){
    return '<button class="chip'+(cur===c.name?' active':'')+'" data-id="'+c.name+'">'+c.name+'</button>';
  }).join('');
  Array.prototype.forEach.call(document.querySelectorAll('.chip'),function(b){
    b.onclick=function(){cur=b.dataset.id;renderChips();renderSheet();};
  });
}

function renderSheet(){
  if(!cur){$('sheetBox').innerHTML='<div class="sheet" style="text-align:center;color:var(--muted);padding:50px 20px"><i class="fas fa-file-lines" style="font-size:32px;color:#c7d3e6"></i><div style="margin-top:10px">选择上方城市，生成对应的行前备忘单。</div></div>';return;}
  var d=pick(cur);
  if(!d){$('sheetBox').innerHTML='<div class="empty">未找到该城市。</div>';return;}
  var today=new Date().toLocaleDateString('zh-CN');
  var ticket=(d.ticket||[]).map(function(t){
    var free=/免费/.test(t.price||'');
    var ch=free?'微信预约':'携程购票';
    return '<div class="item"><div class="t">'+t.spot+tag(ch)+'</div><div class="d">开放：'+t.open+' ｜ 票价：'+t.price+' ｜ '+t.reserve+'</div></div>';
  }).join('')||'<div class="item"><div class="d">景点预约信息整理中，可点下方入口查询。</div></div>';
  var hotel=(d.hotel||[]).map(function(h){return '<div class="item"><div class="t">'+h.area+'</div><div class="d">'+h.level+' ｜ '+h.price+'</div></div>';}).join('')||'<div class="item"><div class="d">住宿推荐整理中，可点下方酒店入口查询。</div></div>';
  var food=(d.foods||[]).map(function(f){return '<div class="item"><div class="t">'+f.name+tag(f.price)+'</div><div class="d">'+(f.note||'')+'</div></div>';}).join('')||'<div class="item"><div class="d">本地美食清单整理中。</div></div>';
  var pack=(d.pack||[]).map(function(p){return '<li><i class="fas fa-check"></i>'+p+'</li>';}).join('');
  var tips=(d.tips||[]).map(function(t){return '<div class="item"><div class="d"><i class="fas fa-circle-info" style="color:var(--primary)"></i> '+t+'</div></div>';}).join('');
  var links=(d.links||[]).map(function(l){return '<a class="link-card" href="'+l.u+'" target="_blank" rel="noopener"><b>'+l.t+'</b><span>前往平台查询/预订</span></a>';}).join('');
  links+='<a class="link-card" href="'+d.transport.flight+'" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>';
  links+='<a class="link-card" href="'+d.transport.train+'" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>';

  $('sheetBox').innerHTML =
  '<div class="sheet" id="printSheet">'+
    '<div class="sheet-cover"><h2>'+d.name+' · 行前备忘单</h2><div class="sub">'+d.tag+' ｜ '+d.summary+'</div><div class="meta"><span><i class="far fa-calendar"></i> 生成于 '+today+'</span><span><i class="fas fa-location-dot"></i> '+d.name+'</span></div></div>'+
    '<div class="section"><h3><i class="fas fa-map-location-dot"></i> 景点 · 门票与预约</h3>'+ticket+'</div>'+
    '<div class="section"><h3><i class="fas fa-plane-departure"></i> 交通</h3>'+
      '<div class="item"><div class="t">到达大交通</div><div class="d">'+(d.transport.go||[]).join('<br>')+'</div></div>'+
      '<div class="item"><div class="t">市内交通</div><div class="d">'+d.transport.local+'</div></div>'+
    '</div>'+
    '<div class="section"><h3><i class="fas fa-hotel"></i> 住宿建议</h3>'+hotel+'</div>'+
    '<div class="section"><h3><i class="fas fa-utensils"></i> 必吃美食</h3>'+food+'</div>'+
    '<div class="section"><h3><i class="fas fa-suitcase-rolling"></i> 必备物品</h3><ul class="pack">'+pack+'</ul></div>'+
    '<div class="section"><h3><i class="fas fa-triangle-exclamation"></i> 注意事项</h3>'+tips+'</div>'+
    '<div class="section"><h3><i class="fas fa-link"></i> 预订入口</h3><div class="link-grid">'+links+'</div></div>'+
    '<div class="note">信息由 MYL 编辑整理，票价、开放时间与预约政策可能调整，出行前请以景区/平台当日公示为准。</div>'+
  '</div>';
}

$('genBtn').onclick=function(){if(!cur){alert('先选择一个城市');return;}renderSheet();window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});};
$('printBtn').onclick=function(){if(!cur){alert('先选择一个城市');return;}window.print();};
$('copyBtn').onclick=function(){
  if(!cur){alert('先选择一个城市');return;}
  var t=document.getElementById('printSheet').innerText;
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){alert('已复制备忘单文本');});}
  else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('已复制备忘单文本');}
};
$('searchInput').addEventListener('input',function(){renderChips();renderSheet();});

renderChips();renderSheet();
