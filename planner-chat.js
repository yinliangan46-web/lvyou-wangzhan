
/* 5 城手写路书；其余城市由索引真实数据生成 */
var DB = {
  '成都':{flight:'https://flights.ctrip.com/online/list/oneway-chengdu', train:'https://www.12306.cn',
    traffic:['飞机：双流/天府机场，地铁进城','高铁：成都东站，地铁2/7号线接驳','市内：地铁+打车，景点集中'],
    spots:[{n:'宽窄巷子',d:'老城巷弄喝茶闲逛',t:'免费'},{n:'大熊猫繁育基地',d:'建议上午前往看熊猫活跃',t:'¥55 · 需预约'},{n:'锦里古街',d:'傍晚看夜景吃小吃',t:'免费'}],
    foods:[{n:'串串香',d:'奎星楼街，吧台位友好',p:'¥60/人'},{n:'甜水面/凉粉',d:'文殊院旁老字号',p:'¥15/人'},{n:'盖碗茶',d:'人民公园鹤鸣茶社',p:'¥15/位'}],
    hotel:[{a:'春熙路/太古里',l:'商圈便利',p:'¥300–500/晚'},{a:'武侯祠/宽窄巷子',l:'近美食区',p:'¥260–420/晚'}],
    ctrip:'https://you.ctrip.com/sight/chengdu104.html', hotels:'https://hotels.ctrip.com/hotels/chengdu104.html'},
  '西安':{flight:'https://flights.ctrip.com/online/list/oneway-xian', train:'https://www.12306.cn',
    traffic:['飞机：咸阳机场，城际地铁进城','高铁：西安北站，地铁2号线直达钟楼','市内：地铁可达，兵马俑需赴临潼'],
    spots:[{n:'西安城墙',d:'骑行或散步看老城',t:'¥54'},{n:'陕西历史博物馆',d:'国宝研学，提前预约',t:'基本陈列免费'},{n:'秦始皇兵马俑',d:'临潼军阵，预留半天',t:'¥120 · 分时段预约'}],
    foods:[{n:'肉夹馍+凉皮',d:'老字号看本地客流',p:'¥15–25/份'},{n:'羊肉泡馍',d:'自己掰馍',p:'¥40/碗'},{n:'biangbiang面',d:'油泼辣子香',p:'¥20/碗'}],
    hotel:[{a:'钟楼/鼓楼',l:'老城中心',p:'¥280–450/晚'},{a:'大雁塔/小寨',l:'近博物馆',p:'¥260–420/晚'}],
    ctrip:'https://you.ctrip.com/sight/xian5.html', hotels:'https://hotels.ctrip.com/hotels/xian5.html'},
  '厦门':{flight:'https://flights.ctrip.com/online/list/oneway-xiamen', train:'https://www.12306.cn',
    traffic:['飞机：高崎机场，地铁进岛','高铁：厦门北站，地铁1号线进岛','市内：公交+BRT+打车，鼓浪屿需轮渡'],
    spots:[{n:'鼓浪屿',d:'轮渡上岛，步行游览',t:'船票¥35起 · 提前购票'},{n:'南普陀寺',d:'临海古刹，需预约',t:'免费'},{n:'环岛路',d:'滨海步道骑行',t:'免费'}],
    foods:[{n:'沙茶面',d:'本地早餐常见',p:'¥20/碗'},{n:'海蛎煎',d:'闽南特色趁热吃',p:'¥30/份'},{n:'土笋冻',d:'风味小吃',p:'¥15/份'}],
    hotel:[{a:'中山路/轮渡',l:'近码头老城',p:'¥280–450/晚'},{a:'曾厝垵/环岛路',l:'临海休闲',p:'¥300–500/晚'}],
    ctrip:'https://you.ctrip.com/sight/xiamen14.html', hotels:'https://hotels.ctrip.com/hotels/xiamen14.html'},
  '长沙':{flight:'https://flights.ctrip.com/online/list/oneway-changsha', train:'https://www.12306.cn',
    traffic:['飞机：黄花机场，磁浮快线进市区','高铁：长沙南站，地铁2/4号线接驳','市内：地铁覆盖商圈与景点'],
    spots:[{n:'橘子洲',d:'湘江江心洲，小火车另购',t:'免费 · 预约入园'},{n:'湖南省博物馆',d:'马王堆文物，周一闭馆',t:'免费 · 提前预约'},{n:'太平老街',d:'老城小吃街',t:'免费'}],
    foods:[{n:'小龙虾',d:'夜宵主力',p:'¥90/人'},{n:'臭豆腐',d:'街边老字号',p:'¥15/份'},{n:'糖油粑粑',d:'甜食小食趁热吃',p:'¥10/份'}],
    hotel:[{a:'五一广场/黄兴路',l:'夜生活核心',p:'¥260–420/晚'},{a:'岳麓山/溁湾镇',l:'安静近景区',p:'¥240–380/晚'}],
    ctrip:'https://you.ctrip.com/sight/changsha19.html', hotels:'https://hotels.ctrip.com/hotels/changsha19.html'},
  '重庆':{flight:'https://flights.ctrip.com/online/list/oneway-chongqing', train:'https://www.12306.cn',
    traffic:['飞机：江北机场，轨道进城','高铁：重庆西站/北站，轨道接驳','市内：轨道+打车，山城地形多爬坡'],
    spots:[{n:'洪崖洞',d:'吊脚楼夜景，入夜亮灯',t:'免费'},{n:'解放碑',d:'城市中心商圈',t:'免费'},{n:'李子坝',d:'轻轨穿楼机位',t:'免费'}],
    foods:[{n:'重庆火锅',d:'牛油锅底，不能吃辣提前说',p:'¥80/人'},{n:'小面',d:'街头早餐代表',p:'¥12/碗'},{n:'酸辣粉',d:'老城小吃',p:'¥15/份'}],
    hotel:[{a:'解放碑/洪崖洞',l:'夜景核心',p:'¥280–450/晚'},{a:'南滨路',l:'沿江观景',p:'¥300–480/晚'}],
    ctrip:'https://you.ctrip.com/sight/chongqing158.html', hotels:'https://hotels.ctrip.com/hotels/chongqing158.html'}
};

var QS = [
  {key:'city', q:'第一站，你想去哪座城市？（可输入搜索）'},
  {key:'days', q:'打算玩几天？', opts:[{v:'2',label:'2 天'},{v:'3',label:'3 天'},{v:'4',label:'4 天'},{v:'5',label:'5 天以上'}]},
  {key:'ppl', q:'几个人出行？', opts:[{v:'1',label:'1 人独行'},{v:'2',label:'2 人同行'},{v:'3',label:'3 人及以上'}]},
  {key:'budget', q:'预算偏向哪一档？', opts:[{v:'budget',label:'经济省钱'},{v:'comfort',label:'舒适适中'},{v:'luxury',label:'品质度假'}]},
  {key:'pref', q:'行程更看重什么？', opts:[{v:'food',label:'美食优先'},{v:'sight',label:'景观拍照'},{v:'culture',label:'人文研学'},{v:'relax',label:'轻松休闲'}]}
];

var ans={};
var qi=0;
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function tag(v){return v?'<span class="tag">'+v+'</span>':'';}
var LABEL={city:'城市',days:'天数',ppl:'人数',budget:'预算',pref:'偏好'};
var A = window.MYL ? MYL.indexCities() : [];

function renderSteps(){
  $('steps').innerHTML=QS.map(function(q,i){return '<span class="step'+(i<=qi?' on':'')+'">'+(i+1)+'.'+LABEL[q.key]+'</span>';}).join(' · ');
}

function ask(){
  /* 跳过已回答的问题（智能输入补答后不重复提问） */
  while(qi<QS.length&&ans[QS[qi].key]){qi++;}
  if(qi>=QS.length){generate();return;}
  var q=QS[qi];
  if(q.key==='city'){
    var opts=A.map(function(c){return '<option value="'+c.name+'">';}).join('');
    $('chat').innerHTML+='<div class="bubble bot"><div class="q">'+q.q+'</div>'+
      '<div class="city-input"><input list="cityList" id="cityInput" placeholder="输入城市名，如：杭州" autocomplete="off" /><datalist id="cityList">'+opts+'</datalist>'+
      '<button class="opt" id="cityOk">确认</button></div></div>';
    $('cityOk').onclick=function(){
      var v=$('cityInput').value.trim();
      if(!MYL.getCity(v)){alert('请从列表中选择一座收录城市');return;}
      ans.city=v;
      $('chat').innerHTML+='<div class="bubble me">'+v+'</div>';
      qi++;renderSteps();ask();
    };
    return;
  }
  var opts=q.opts.map(function(o){return '<button class="opt" data-v="'+o.v+'">'+o.label+'</button>';}).join('');
  $('chat').innerHTML+='<div class="bubble bot"><div class="q">'+q.q+'</div><div class="opts">'+opts+'</div></div>';
  Array.prototype.forEach.call(document.querySelectorAll('.opt'),function(b){
    if(b.id==='cityOk')return;
    b.onclick=function(){
      ans[q.key]=b.dataset.v;
      $('chat').innerHTML+='<div class="bubble me">'+b.textContent+'</div>';
      qi++;renderSteps();ask();
    };
  });
}

function cleanTheme(t){return (t||'').replace(/深度(游玩|游览|体验|游)/g,'当地休闲体验');}

function planData(name){
  var c=MYL.getCity(name);
  var d=DB[name];
  var isA=c&&c.tier==='A';
  var spots, foods, hotels, traffic, dayGroups=[];
  if(d){
    spots=d.spots; foods=d.foods; hotels=d.hotel; traffic=d.traffic;
    dayGroups=[{label:'推荐行程', nodes:d.spots}];
    return {spots:spots,foods:foods,hotels:hotels,traffic:traffic,dayGroups:dayGroups,
      flight:d.flight,train:d.train,ctrip:d.ctrip,hotelsUrl:d.hotels,isA:true};
  }
  if(isA){
    dayGroups=(c.itinerary||[]).map(function(day){
      return {label:day.day+' · '+cleanTheme(day.theme), nodes:(day.timeline||[]).map(function(t){
        return {n:t.activity||'', d:t.detail||'', t:[t.ticket,t.duration].filter(Boolean).join(' · ')};
      })};
    });
    spots=dayGroups.reduce(function(a,g){return a.concat(g.nodes);},[]);
    foods=(c.foods||[]).map(function(f){return {n:f.name,d:f.desc||'',p:f.price||''};});
    hotels=(c.hotels||[]).map(function(h){return {a:h.name,l:h.area||h.highlight||'',p:h.price||''};});
    traffic=(c.transport||[]).map(function(t){return t.label+'：'+t.value;});
  } else {
    spots=(c.bLandmarks||[]).map(function(x){return {n:x,d:'当地代表性地标',t:''};});
    foods=(c.bFoods||[]).map(function(f){return {n:f,d:'',p:''};});
    hotels=[]; traffic=[];
    dayGroups=[{label:'当地概览', nodes:spots}];
  }
  var flight=(c.airfare&&c.airfare[0])?c.airfare[0].bookingUrl:'https://flights.ctrip.com';
  var train=(c.trains&&c.trains[0])?c.trains[0].bookingUrl:'https://www.12306.cn';
  var hotelsUrl=(c.hotels&&c.hotels[0]&&c.hotels[0].bookingUrl)||'https://hotels.ctrip.com';
  return {spots:spots,foods:foods,hotels:hotels,traffic:traffic,dayGroups:dayGroups,flight:flight,train:train,ctrip:'https://you.ctrip.com',hotelsUrl:hotelsUrl,isA:isA};
}

/* ============ 行程组装：天数严格对齐 + 跨城景点 + 兜底补齐 ============ */
var curExcursions=[];

function buildDayGroups(pd, reqDays, excursions, cityName){
  var groups=(pd.dayGroups||[]).filter(function(g){return g.nodes&&g.nodes.length&&g.nodes.some(function(n){return n.n;});});
  var out=groups.slice(0, reqDays);
  var usedNodes={};
  out.forEach(function(g){g.nodes.forEach(function(n){if(n.n)usedNodes[n.n]=1;});});
  /* 跨城一日游排在本地行程之后 */
  excursions.forEach(function(ex){
    out.push({label:'Day X · '+ex.city+'·'+ex.name+' 跨城一日', nodes:[
      {n:ex.name, d:'从'+cityName+'出发的跨城一日游：早班车出发，'+ex.city+'往返。'+ex.name+'建议预留大半天，门票/索道类提前在线预订。', t:'跨城 · 提前预约'},
      {n:'交通 · '+cityName+' ⇄ '+ex.city, d:'高铁/动车或自驾往返（单程约2-3小时，具体班次以12306为准），到达后打车或公交直达景区。', t:'当日往返'}
    ]});
  });
  /* 补齐到请求天数：轮转未用到的景点与美食 */
  var pool=[];
  groups.forEach(function(g){g.nodes.forEach(function(n){if(n.n&&!usedNodes[n.n])pool.push(n);});});
  pd.foods.forEach(function(f){pool.push({n:f.n, d:(f.d||'')+'（美食补排）', t:f.p||''});});
  var pi=0;
  while(out.length<reqDays){
    var nodes=[];
    for(var i=0;i<3&&pi<pool.length;i++,pi++)nodes.push(pool[pi]);
    if(!nodes.length)nodes=[{n:'自由活动', d:'慢节奏的一天：睡到自然醒，附近街巷随性逛逛，把前几天的遗憾补上。', t:''}];
    out.push({label:'Day X · 深度慢游', nodes:nodes});
  }
  out=out.slice(0, reqDays);
  out.forEach(function(g,i){ g.label='Day '+(i+1)+' · '+String(g.label).replace(/^Day\s*[X\d]+\s*(?:·\s*)?/,'').replace(/^·\s*/,''); });
  return out;
}

function ruleData(pd, name, reqDays){
  return {days:buildDayGroups(pd, reqDays, curExcursions, name), foods:pd.foods, hotels:pd.hotels, traffic:pd.traffic};
}

/* ============ 站点 AI 代理（后台 DeepSeek，Key 不出后端，无需访客填 Key） ============ */
var SITE_API='https://lvyou-wangzhan.vercel.app/api/chat';
function siteChat(messages, cb){
  var ctrl=new AbortController();
  var timer=setTimeout(function(){ctrl.abort();},45000);
  fetch(SITE_API,{
    method:'POST',
    signal:ctrl.signal,
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'auto', messages:messages, temperature:0.7, max_tokens:3000})
  }).then(function(r){
    clearTimeout(timer);
    if(!r.ok)throw new Error('HTTP '+r.status);
    return r.json();
  }).then(function(d){
    var text=d&&d.choices&&d.choices[0]&&d.choices[0].message&&d.choices[0].message.content;
    if(!text)throw new Error('空响应');
    cb(null,text);
  }).catch(function(e){clearTimeout(timer);cb(e);});
}
function llmGenerate(name,c,pd,reqDays,cb,fromTune,tuneText){
  var ctx={
    城市:name, 国家:c.country||'中国', 天数:reqDays, 人数:ans.ppl||2,
    预算档:({budget:'经济',comfort:'舒适',luxury:'品质'})[ans.budget]||'舒适',
    偏好:({food:'美食',sight:'景观',culture:'人文',relax:'休闲'})[ans.pref]||'综合',
    跨城景点:curExcursions.map(function(e){return e.city+'·'+e.name;}),
    站内景点库:pd.spots.slice(0,12).map(function(s){return s.n+(s.d?'：'+s.d:'');}),
    站内美食库:pd.foods.slice(0,8).map(function(f){return f.n;}),
    站内酒店库:pd.hotels.slice(0,4).map(function(h){return h.a+(h.p?'（'+h.p+'）':'');})
  };
  var sys='你是一名专业旅行规划师，根据用户需求结合站内景点/美食/酒店库生成贴近真实的中文路书。严格输出纯 JSON（不要 markdown 代码块、不要任何解释文字），格式：{"days":[{"label":"Day 1 · 主题","nodes":[{"n":"节点名","d":"一句话说明","t":"门票或时长"}]}],"foods":[{"n":"","d":"","p":""}],"hotels":[{"a":"","l":"","p":""}],"traffic":["交通方式：说明"]}. 要求：1) days 数量必须正好等于指定天数；2) 若给出跨城景点，每个安排一整天跨城行程并写清往返交通；3) 内容贴近真实地理与门票常识；4) 全部中文。';
  var user='请生成行程 JSON，需求：'+JSON.stringify(ctx)+(fromTune?('\n\n用户调整要求：'+tuneText+'（在原行程基础上修改后输出完整 JSON）'):'');
  siteChat([{role:'system',content:sys},{role:'user',content:user}],function(err,text){
    if(err)return cb(false,null,err.message||String(err));
    try{
      var t2=text.trim().replace(/^```(json)?\s*/i,'').replace(/```\s*$/,'').trim();
      var j=JSON.parse(t2);
      if(!j.days||!j.days.length)throw new Error('days 为空');
      j.days=j.days.slice(0,reqDays);
      while(j.days.length<reqDays)j.days.push({label:'Day X · 自由深度', nodes:[{n:'自由活动', d:'慢节奏补充一天，逛吃为主。', t:''}]});
      j.days.forEach(function(g,i){g.label='Day '+(i+1)+' · '+String(g.label||'行程').replace(/^Day\s*\d+\s*(?:·\s*)?/,'').replace(/^·\s*/,'');});
      j.foods=(j.foods&&j.foods.length?j.foods:pd.foods).map(function(f){return {n:f.n||f.name||'', d:f.d||f.desc||'', p:f.p||f.price||''};});
      j.hotels=(j.hotels&&j.hotels.length?j.hotels:pd.hotels).map(function(h){return {a:h.a||h.name||'', l:h.l||h.area||'', p:h.p||h.price||''};});
      j.traffic=(j.traffic&&j.traffic.length)?j.traffic.map(String):pd.traffic;
      cb(true,j);
    }catch(e){cb(false,null,'AI 返回解析失败：'+e.message);}
  });
}

/* ============ 生成入口：配置了大模型走 AI，否则规则引擎 ============ */
function generate(fromTune, tuneText){
  var name=ans.city;
  var c=MYL.getCity(name);
  var pd=planData(name);
  var reqDays=Math.max(1,Math.min(15,parseInt(ans.days,10)||3));
  curExcursions=(curExcursions||[]).filter(function(e){return e.city!==name;});
  $('planBox').innerHTML='<div class="plan"><div class="plan-cover"><h2>🤖 '+esc(name)+' · '+reqDays+'天路书生成中…</h2><div class="sub">DeepSeek 规划中，通常 5-15 秒</div></div></div>';
  $('planBox').scrollIntoView({behavior:'smooth'});
  llmGenerate(name,c,pd,reqDays,function(ok,data,err){
    if(ok)renderPlan(name,c,pd,data,reqDays,'llm');
    else renderPlan(name,c,pd,ruleData(pd,name,reqDays),reqDays,'rule',err);
  },fromTune,tuneText);
}

function renderPlan(name,c,pd,data,reqDays,src,err){
  var ppl=ans.ppl;
  var prefLabel=(QS[4].opts.find(function(o){return o.v===ans.pref;})||{}).label||'综合';
  var bname=ans.budget==='budget'?'经济':ans.budget==='comfort'?'舒适':'品质';
  var dayHtml=data.days.map(function(g){
    var nodes=g.nodes.map(function(s){return '<div class="node"><div class="t">'+s.n+tag(s.t)+'</div><div class="d">'+(s.d||'')+'</div></div>';}).join('');
    return '<div class="node"><div class="t">'+g.label+'</div>'+nodes+'</div>';
  }).join('')||'<div class="node"><div class="d">该城行程节点整理中，可参考下方景点与交通安排。</div></div>';
  var foods=data.foods.map(function(f){return '<div class="node"><div class="t">'+f.n+tag(f.p)+'</div><div class="d">'+(f.d||'')+'</div></div>';}).join('')||'<div class="node"><div class="d">本地美食清单整理中。</div></div>';
  var hotels=data.hotels.map(function(h){return '<div class="node"><div class="t">'+h.a+tag(h.p)+'</div><div class="d">'+(h.l||'')+'</div></div>';}).join('')||'<div class="node"><div class="d">住宿推荐整理中，可点下方酒店入口查询。</div></div>';
  var traffic=data.traffic.map(function(t){return '<div class="node"><div class="d"><i class="fas fa-arrow-right" style="color:var(--primary)"></i> '+t+'</div></div>';}).join('');
  if(!traffic){traffic='<div class="node"><div class="d">该城交通方案整理中，可点下方机票与火车票入口查询班次。</div></div>';}
  var excNote=curExcursions.length?(' · 顺路跨城：'+curExcursions.map(function(e){return e.city+'·'+e.name;}).join('、')):'';
  var srcNote=src==='llm'
    ? ' · DeepSeek 生成'
    : (' · MYL 规划引擎'+(err?('（AI 兜底：'+esc(String(err).slice(0,50))+'）'):''));

  var shareLines=[];
  data.days.forEach(function(g,i){
    shareLines.push('第'+(i+1)+'天 '+String(g.label).replace(/^Day\s*\d+\s*·\s*/,'')+'：'+g.nodes.map(function(s){return s.n;}).filter(Boolean).slice(0,4).join(' → '));
  });
  var shareUrl='share.html?mode=plan&title='+encodeURIComponent(name+' '+reqDays+'天'+ppl+'人路书')+'&lines='+encodeURIComponent(JSON.stringify(shareLines.slice(0,12)));
  $('planBox').innerHTML=
  '<div class="plan">'+
    '<div class="plan-cover"><h2>'+name+' · '+reqDays+'天'+ppl+'人路书</h2><div class="sub">'+bname+'档 · 偏好：'+prefLabel+' · '+(c.country||'中国')+excNote+srcNote+'</div></div>'+
    '<div class="section"><h3><i class="fas fa-plane-departure"></i> 交通安排</h3>'+traffic+
      '<div class="link-grid" style="margin-top:12px">'+
        '<a class="link-card" href="'+pd.flight+'" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>'+
        '<a class="link-card" href="'+pd.train+'" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>'+
      '</div></div>'+
    '<div class="section"><h3><i class="fas fa-map-location-dot"></i> 景点节点（按天分段）</h3>'+dayHtml+'</div>'+
    '<div class="section"><h3><i class="fas fa-utensils"></i> 美食推荐</h3>'+foods+'</div>'+
    '<div class="section"><h3><i class="fas fa-hotel"></i> 住宿建议</h3>'+hotels+'</div>'+
    '<div class="section"><h3><i class="fas fa-link"></i> 预订入口</h3><div class="link-grid">'+
      '<a class="link-card" href="'+pd.ctrip+'" target="_blank" rel="noopener"><b>携程景点</b><span>门票与预约查询</span></a>'+
      '<a class="link-card" href="'+pd.hotelsUrl+'" target="_blank" rel="noopener"><b>携程酒店</b><span>查询住宿价格</span></a>'+
      '<a class="link-card" href="https://www.12306.cn" target="_blank" rel="noopener"><b>12306</b><span>火车票预订</span></a>'+
    '</div></div>'+
  '</div>'+
  '<div class="plan tune-box" id="tuneBox">'+
    '<h3><i class="fas fa-wand-magic-sparkles"></i> 对话式调整 <span class="tune-new">AI 增强 · 新</span></h3>'+
    '<div class="tune-row"><input id="tuneInput" placeholder="如：改成5天 / 加一天去玉龙雪山 / 预算紧凑一点 / 换成美食优先" autocomplete="off" /><button id="tuneGo"><i class="fas fa-arrows-rotate"></i> 调整</button></div>'+
    '<div class="tune-tip">支持：改天数、改预算档、改偏好、换城市、点名跨城景点（如「加一天去玉龙雪山」）；调整后立即重新生成路书。</div>'+
  '</div>'+
  '<div style="margin-bottom:30px"><button class="btn btn-ghost" onclick="location.reload()"><i class="fas fa-rotate-left"></i> 重新生成一份</button>'+
  ' <a class="btn btn-ghost" href="'+shareUrl+'" target="_blank" rel="noopener"><i class="fas fa-share-nodes"></i> 生成分享海报</a></div>';
  bindTune();
  $('planBox').scrollIntoView({behavior:'smooth'});
}

/* ============ AI 增强：意图解析 + 对话式调整（新增模块） ============ */
function matchCity(text){
  if(!window.MYL||!text) return null;
  var best=null;
  MYL.indexCities().forEach(function(c){
    var n=c&&c.name||'';
    if(n.length>=2 && text.indexOf(n)>=0 && (!best||n.length>best.length)) best=n;
  });
  return best;
}
function detectDays(t){
  var m=t.match(/(\d+)\s*天/);
  if(m){var n=parseInt(m[1],10);if(n>=1)return String(Math.min(n,15));}
  /* 中文数字：十X / X十 */
  m=t.match(/十([一二三四五六七八九]?)\s*天/);
  if(m){
    if(!m[1])return '10';
    return String(10+({'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9}[m[1]]||0));
  }
  m=t.match(/([一二两三四五六七八九])\s*天/);
  if(m){return String({'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9}[m[1]]);}
  if(/半个月|半月/.test(t))return '15';
  if(/一周|一个星期|一星期/.test(t))return '7';
  if(/周末|两天|2天/.test(t))return '2';
  if(/三天|3天/.test(t))return '3';
  if(/四天|4天/.test(t))return '4';
  if(/五天|5天/.test(t))return '5';
  /* 旅居/长住未说天数：默认按 7 天规划 */
  if(/旅居|长住|慢生活|住上一段/.test(t))return '7';
  return null;
}
function detectPpl(t){
  if(/独行|一个人|自己去|独自|单人/.test(t))return '1';
  if(/对象|情侣|闺蜜|夫妻|爱人|女朋友|男朋友|老婆|老公|蜜月|求婚|两个人|二人|双人|2人|两人/.test(t))return '2';
  if(/爸妈|父母|家人|家庭|孩子|娃|老人|一群|朋友|团队|3人|四人|一家/.test(t))return '3';
  var m=t.match(/(\d+)\s*人/);
  if(m){var n=parseInt(m[1],10);return n<=1?'1':(n===2?'2':'3');}
  return null;
}
function detectBudget(t){
  var m=t.match(/(\d{3,6})\s*(?:块|元|预算)?/);
  if(m){
    var n=parseInt(m[1],10);
    if(n<=1500)return 'budget';
    if(n<=5000)return 'comfort';
    return 'luxury';
  }
  if(/穷游|省钱|经济|便宜|紧凑|省着/.test(t))return 'budget';
  if(/豪华|高端|品质|奢华|不差钱|预算充足|住好/.test(t))return 'luxury';
  if(/舒适|适中|标准/.test(t))return 'comfort';
  return null;
}
function detectPref(t){
  if(/美食|吃|小吃|火锅|面食|夜市|逛吃/.test(t))return 'food';
  if(/拍照|出片|打卡|风景|景观|景色|看海|雪山|日落|日出/.test(t))return 'sight';
  if(/博物馆|人文|历史|研学|文化|古建|寺庙|遗址|研学/.test(t))return 'culture';
  if(/休闲|躺|慢游|放松|度假|泡酒店|发呆|不赶/.test(t))return 'relax';
  return null;
}
function parseIntent(t){
  return {
    city:matchCity(t),
    days:detectDays(t),
    ppl:detectPpl(t),
    budget:detectBudget(t),
    pref:detectPref(t)
  };
}
/* ---- 跨城景点识别：用户提到邻城景点（如去大理却提玉龙雪山）时自动安排跨城 ---- */
function spotCityIndex(){
  if(window._mylSpotIdx)return window._mylSpotIdx;
  var idx={};
  var C=window.CITY_SPOT_COORDS||{};
  Object.keys(C).forEach(function(k){
    var p=k.split('·');
    if(p.length===2&&p[1]&&!/机场|车站|站$/.test(p[1]))idx[p[1]]=p[0];
  });
  var D=window.CITY_DETAIL||{};
  Object.keys(D).forEach(function(k){
    var city=D[k]&&D[k].name;
    (D[k].routePins||[]).forEach(function(n){
      if(n&&!/机场|车站/.test(n)&&!idx[n])idx[n]=city;
    });
  });
  window._mylSpotIdx=idx;
  return idx;
}
function findExcursions(text){
  if(!window.MYL||!text||!ans.city)return [];
  var idx=spotCityIndex(),out=[],seen={};
  Object.keys(idx).forEach(function(n){
    if(n.length>=2&&text.indexOf(n)>=0&&idx[n]!==ans.city&&!seen[n]&&!MYL.getCity(n)){
      seen[n]=1;out.push({name:n,city:idx[n]});
    }
  });
  return out;
}
function smartStart(raw){
  var text=(raw||'').trim();
  if(!text){alert('先输入你的旅行想法吧');return;}
  var iv=parseIntent(text);
  Object.keys(iv).forEach(function(k){ if(iv[k]) ans[k]=iv[k]; });
  var got=['city','days','ppl','budget','pref'].filter(function(k){return ans[k];});
  if(!got.length){
    $('chat').style.display='block';
    $('chat').innerHTML+='<div class="bubble bot"><div class="q">这句话里的信息我还没读懂 😅</div><div>可以带上城市、天数、偏好，比如「带爸妈去西安玩4天，人文研学」；或者点击下方按钮改用分步问答。</div></div>';
    return;
  }
  $('smartBox').style.display='none';
  $('steps').style.display='block';
  $('chat').style.display='block';
  $('chat').innerHTML+='<div class="bubble me">'+text+'</div>';
  curExcursions=findExcursions(text);
  var excTag=curExcursions.length?(' 🚄 顺路：'+curExcursions.map(function(e){return e.name+'（'+e.city+'）';}).join('、')):'';
  var tags=got.map(function(k){
    if(k==='city')return '📍 '+ans.city;
    if(k==='days')return '🗓️ '+ans.days+'天';
    if(k==='ppl')return '👥 '+ans.ppl+'人';
    if(k==='budget')return '💰 '+({budget:'经济',comfort:'舒适',luxury:'品质'})[ans.budget];
    return '🎯 '+({food:'美食',sight:'景观',culture:'人文',relax:'休闲'})[ans.pref];
  }).join(' ')+excTag;
  if(curExcursions.length){
    $('chat').innerHTML+='<div class="bubble bot"><div class="q">你提到的'+curExcursions.map(function(e){return e.name;}).join('、')+'在'+curExcursions.map(function(e){return e.city;}).join('、')+'，我已经为你在路书里安排好跨城一日游 🚄</div></div>';
  }
  var missing=QS.filter(function(q){return !ans[q.key];}).map(function(q){return LABEL[q.key];});
  $('chat').innerHTML+='<div class="bubble bot"><div class="q">已识别你的需求：'+tags+'</div>'+
    (missing.length?('还差：'+missing.join('、')+'，我继续问你 👇'):'信息齐全，正在生成路书…')+'</div>';
  qi=QS.findIndex(function(q){return !ans[q.key];});
  if(qi<0){generate();}else{renderSteps();ask();}
}
function parseTune(t){
  var msgs=[], iv=parseIntent(t);
  if(iv.city && iv.city!==ans.city){ans.city=iv.city;msgs.push('目的地 → '+iv.city);}
  if(iv.days && iv.days!==ans.days){ans.days=iv.days;msgs.push('天数 → '+ans.days+'天');}
  if(iv.ppl && iv.ppl!==ans.ppl){ans.ppl=iv.ppl;msgs.push('人数 → '+ans.ppl+'人');}
  if(iv.budget && iv.budget!==ans.budget){ans.budget=iv.budget;msgs.push('预算 → '+({budget:'经济',comfort:'舒适',luxury:'品质'})[ans.budget]);}
  if(iv.pref && iv.pref!==ans.pref){ans.pref=iv.pref;msgs.push('偏好 → '+({food:'美食',sight:'景观',culture:'人文',relax:'休闲'})[ans.pref]);}
  var exc=findExcursions(t);
  if(exc.length){
    exc.forEach(function(e){
      if(!curExcursions.some(function(x){return x.name===e.name;}))curExcursions.push(e);
    });
    msgs.push('跨城安排 → '+exc.map(function(e){return e.city+'·'+e.name;}).join('、'));
  }
  /* 用户明确要求去掉跨城 */
  if(/不去|去掉|删除|取消/.test(t)){
    var removed=[];
    curExcursions=curExcursions.filter(function(e){
      if(t.indexOf(e.name)>=0){removed.push(e.name);return false;}
      return true;
    });
    if(removed.length)msgs.push('已移除 → '+removed.join('、'));
  }
  return msgs;
}
function bindTune(){
  var input=$('tuneInput'), go=$('tuneGo');
  if(!input||!go)return;
  function doTune(){
    var t=input.value.trim();
    if(!t)return;
    var msgs=parseTune(t);
    if(!msgs.length){
      $('tuneBox').querySelector('.tune-tip').textContent='没听懂这个调整，试试：改成5天 / 加一天去玉龙雪山 / 预算紧凑一点 / 换成美食优先 / 换个城市去杭州';
      return;
    }
    $('tuneBox').querySelector('.tune-tip').textContent='已按「'+msgs.join('，')+'」重新生成 ✅';
    generate(true, t);
  }
  go.onclick=doTune;
  input.addEventListener('keydown',function(e){if(e.key==='Enter')doTune();});
}
function initSmart(){
  var input=$('smartInput'), go=$('smartGo');
  if(!input||!go)return;
  go.onclick=function(){smartStart(input.value);};
  input.addEventListener('keydown',function(e){if(e.key==='Enter')smartStart(input.value);});
  Array.prototype.forEach.call(document.querySelectorAll('.chip'),function(c){
    c.onclick=function(){input.value=c.dataset.t;smartStart(c.dataset.t);};
  });
  $('skipSmart').onclick=function(){
    $('smartBox').style.display='none';
    $('steps').style.display='block';
    $('chat').style.display='block';
    qi=0;renderSteps();ask();
  };
}
initSmart();
