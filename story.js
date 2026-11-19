
/* 3 条手写精品剧情 */
var HAND = [
  {id:'xian', city:'西安', name:'长安三日 · 古都线', desc:'从城墙根走到兵马俑，读懂周秦汉唐的层叠记忆。', meta:'西安 · 3天',
    chapters:[
      {title:'第一章 · 城墙下的晨光', loc:'西安城墙 · 钟鼓楼', scene:'清晨从南门登上城墙，砖石在脚下延伸，老城的屋脊与街巷在两侧铺开。城墙上骑行一圈，是认识这座城最快的方式。', nodes:[{n:'西安城墙', d:'明城墙现存最完整的古城墙之一，可步行或骑行。'},{n:'钟鼓楼', d:'古城中轴地标，晨钟暮鼓的方位原点。'}], know:'城墙周长约13.7公里，一圈骑下来约1.5小时，傍晚光线更适合拍照。'},
      {title:'第二章 · 博物院里的国宝', loc:'陕西历史博物馆', scene:'走进展馆，器物按年代排列：商周青铜、汉唐陶俑、金银器与壁画。慢慢看，一件文物就是一段被压缩的时间。', nodes:[{n:'陕西历史博物馆', d:'馆藏涵盖周秦汉唐，基本陈列免费但需提前预约。'},{n:'何家村窖藏', d:'唐代金银器代表，需看特展。'}], know:'博物馆周一闭馆，节假日票量紧张，建议提前在官方渠道分时段预约。'},
      {title:'第三章 · 临潼地下军阵', loc:'秦始皇兵马俑', scene:'离开城区向东到临潼，入坑道的瞬间会被军阵的规模压住。每一张面孔都不同，站坑边静静看，比听讲解更直接。', nodes:[{n:'一号坑', d:'主力军阵，视野最开阔。'},{n:'铜车马展', d:'工艺精细，建议预留时间。'}], know:'兵马俑距市区约40公里，地铁转公交或包车前往，整段行程预留半天以上。'},
      {title:'第四章 · 回民街的夜味', loc:'回民街 · 大皮院', scene:'夜色落下，街巷被食物的香气填满。泡馍、肉夹馍、凉皮、甑糕，边走边吃，为三天古都行程收尾。', nodes:[{n:'回民街', d:'老城美食片区，分主街与小巷。'},{n:'大皮院', d:'本地老店更集中的支路。'}], know:'热门主街价格偏高，想吃本地味可钻进旁边的支巷，看哪家本地人多。'}
    ]},
  {id:'chongqing', city:'重庆', name:'山城四日 · 立体线', desc:'爬坡上坎，在江景与梯坎之间感受一座长在山上的城市。', meta:'重庆 · 4天',
    chapters:[
      {title:'第一章 · 十八梯的层叠', loc:'十八梯 · 解放碑', scene:'重庆的路不在同一平面。从解放碑往下走十八梯，石阶把高城与低城接起来，一层一层是不同年代的生活。', nodes:[{n:'十八梯', d:'连接上下半城的传统梯坎老街。'},{n:'解放碑', d:'城市中心商圈与地标。'}], know:'这座城导航容易失效，认路多看楼层与出入口，步行比直线距离更准。'},
      {title:'第二章 · 洪崖洞亮灯时', loc:'洪崖洞 · 嘉陵江边', scene:'傍晚等到灯光亮起，吊脚楼沿崖壁层叠而上。别挤在正面，沿江边走一段，视角更完整。', nodes:[{n:'洪崖洞', d:'依山而建的吊脚楼式建筑群，夜景为主。'},{n:'千厮门大桥', d:'过街可拍全景。'}], know:'洪崖洞入夜人流大，观景位需排队；节假日建议错峰到江边或桥上。'},
      {title:'第三章 · 李子坝与南山', loc:'李子坝轻轨 · 南山一棵树', scene:'白天看轻轨穿楼，傍晚登南山一棵树，把两江与城景收进视野，夜景在入夜后达到最好。', nodes:[{n:'李子坝站', d:'轻轨穿楼的知名机位。'},{n:'南山一棵树', d:'俯瞰渝中半岛的观景台。'}], know:'南山距市区有一段距离，晚间下山注意公交与打车班次。'},
      {title:'第四章 · 火锅与江风', loc:'南滨路 · 火锅', scene:'最后一晚坐在南滨路，火锅滚着红汤，江风从江面吹来。山城的味道，麻、辣、热，和这座城一样直接。', nodes:[{n:'南滨路', d:'沿江餐饮与夜景观赏带。'},{n:'本地火锅', d:'优先选牛油锅底，不能吃辣提前说。'}], know:'火锅分量足，两人点小锅即可；备肠胃药，辣度循序渐进。'}
    ]},
  {id:'xiamen', city:'厦门', name:'海岛三日 · 慢游线', desc:'轮渡、老街与海岸，把节奏放慢，沿着海岸线看完这座城。', meta:'厦门 · 3天',
    chapters:[
      {title:'第一章 · 渡轮上的初见', loc:'轮渡码头 · 鼓浪屿', scene:'乘渡轮出海，海面风把城市推到身后。上岛后汽车消失，只剩步行、小巷和老建筑。', nodes:[{n:'鼓浪屿轮渡', d:'需提前购票，注意区分出发码头。'},{n:'岛上街巷', d:'步行游览，不通机动车。'}], know:'船票分本地与游客航线，买票时确认码头与班次，别走错码头。'},
      {title:'第二章 · 老别墅与日光岩', loc:'鼓浪屿老建筑群 · 日光岩', scene:'岛上老别墅藏在树影里，爬到日光岩高处，红屋顶与海面一起铺开。这里适合慢慢走，不必赶景点。', nodes:[{n:'万国建筑', d:'多国风格老建筑集中分布。'},{n:'日光岩', d:'岛上高处观景点。'}], know:'岛上台阶多、坡陡，拖行李不便，建议轻装登岛。'},
      {title:'第三章 · 环岛路的海岸', loc:'环岛路 · 曾厝垵', scene:'回到本岛沿环岛路慢行，沙滩、礁石与椰树交替。骑一段车，在海边等到日落。', nodes:[{n:'环岛路', d:'滨海步道与骑行道。'},{n:'曾厝垵', d:'渔村改造的文艺片区与民宿集中地。'}], know:'夏秋季关注台风与风浪预警，雨天与大风天海边行程需调整。'},
      {title:'第四章 · 闽南味收尾', loc:'中山路 · 沙茶面', scene:'最后走进老城街巷，一碗沙茶面、一份海蛎煎，把海岛的味道记住，行程在市井烟火里结束。', nodes:[{n:'中山路', d:'骑楼老街与商业区。'},{n:'闽南小吃', d:'沙茶面、海蛎煎、土笋冻等。'}], know:'海蛎煎趁热吃；土笋冻口感特殊，敢尝试再点。'}
    ]}
];

function cleanTheme(t){ return (t||'').replace(/深度(游玩|游览|体验|游)/g,'当地休闲体验'); }

/* 由 A 级城市数据程序化生成线路，补足到 20 条 */
function buildAuto(){
  var exist={'西安':1,'重庆':1,'厦门':1};
  var A = window.MYL ? MYL.indexA级().filter(function(c){return !exist[c.name];}) : [];
  return A.slice(0,17).map(function(c){
    var chapters=(c.itinerary||[]).map(function(d,di){
      var nodes=(d.timeline||[]).map(function(t){
        return {n:t.activity, d:(t.detail||'')+(t.ticket?' · '+t.ticket:'')};
      });
      return {
        title: d.day+' · '+cleanTheme(d.theme),
        loc: (d.timeline&&d.timeline[0])?d.timeline[0].activity:(c.name+' 行程'),
        scene:'围绕'+c.name+'展开：'+((c.tags&&c.tags[0])?c.tags[0]:'当地')+'主题，按天安排游览、用餐与体验节点。',
        nodes:nodes,
        know:(c.tips&&c.tips[di])?c.tips[di]:'出行前确认开放时间、票价与预约渠道。'
      };
    });
    if(!chapters.length){
      chapters=[{title:'当地概览',loc:c.name,scene:(c.bHistory||'该城完整路书整理中，可参考下方地标与美食安排。'),nodes:(c.bLandmarks||[]).map(function(x){return {n:x,d:'当地代表性地标'};}),know:'完整行程节点整理中，建议通过下方交通入口查询班次与住宿。'}];
    }
    return {id:'auto-'+c.key, city:c.name, name:c.name+' · '+(c.days||'3天')+'日线', desc:(c.tags||[]).join('、'), meta:(c.country||'中国')+' · '+(c.days||'3天'), chapters:chapters};
  });
}

var STORIES = HAND.concat(buildAuto());
var cur = STORIES[0].id;
var KEY='myl-story-album';
function $(id){return document.getElementById(id);}
function lpJoin(){var a=[].slice.call(arguments).filter(Boolean);return a.length?' <span class="lp">'+a.join(' · ')+'</span>':'';}
function getAlbum(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
function saveAlbum(a){localStorage.setItem(KEY,JSON.stringify(a));}

function filtered(){
  var q=$('searchInput').value.trim();
  if(!q) return STORIES;
  return STORIES.filter(function(s){return (s.name+s.desc+s.meta).indexOf(q)>=0;});
}

function cityOf(s){ return s.city ? MYL.getCity(s.city) : null; }

function renderRoutes(){
  var list=filtered();
  $('routeList').innerHTML=list.map(function(s){
    return '<div class="route-card" data-id="'+s.id+'"><h3>'+s.name+'</h3><div class="desc">'+s.desc+'</div><div class="meta"><i class="fas fa-location-dot"></i> '+s.meta+'</div><div class="go">查看线路详情 →</div></div>';
  }).join('');
  Array.prototype.forEach.call(document.querySelectorAll('.route-card'),function(c){
    c.onclick=function(){openStory(c.dataset.id);};
  });
}

function openStory(id){
  cur=id;
  $('listView').style.display='none';
  $('detailView').style.display='block';
  renderDetailHead();
  renderChapters();
  window.scrollTo({top:0,behavior:'smooth'});
}

function closeStory(){
  $('detailView').style.display='none';
  $('listView').style.display='block';
  renderRoutes();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderDetailHead(){
  var s=STORIES.find(function(x){return x.id===cur;});
  if(!s){$('detailHead').innerHTML='';return;}
  $('detailHead').innerHTML='<div class="detail-cover"><h2>'+s.name+'</h2><div class="desc">'+s.desc+'</div><div class="meta"><i class="fas fa-location-dot"></i> '+s.meta+'</div></div>';
}

function supportPanel(c){
  if(!c) return '';
  var isA=c.tier==='A';
  var foods=isA
    ? (c.foods||[]).map(function(f){return '<div class="li">'+f.name+lpJoin(f.price,f.desc)+'</div>';}).join('')
    : (c.bFoods||[]).map(function(f){return '<div class="li">'+f+'</div>';}).join('');
  var air=(c.airfare||[]).map(function(a){
    return '<a class="link-card" href="'+a.bookingUrl+'" target="_blank" rel="noopener"><b>'+a.platform+'</b><span>'+a.from+' → '+a.to+' · '+a.price+'</span></a>';
  }).join('');
  var rail=(c.trains||[]).map(function(t){
    return '<a class="link-card" href="'+t.bookingUrl+'" target="_blank" rel="noopener"><b>'+t.platform+'</b><span>'+t.from+' → '+t.to+' · '+t.price+'</span></a>';
  }).join('');
  var html='';
  if(foods) html+='<div class="panel"><h3><i class="fas fa-utensils"></i> 当地美食</h3>'+foods+'</div>';
  if(air) html+='<div class="panel"><h3><i class="fas fa-plane-departure"></i> 航班入口</h3><div class="link-grid">'+air+'</div></div>';
  if(rail) html+='<div class="panel"><h3><i class="fas fa-train"></i> 高铁/火车入口</h3><div class="link-grid">'+rail+'</div></div>';
  if(!isA){
    html+='<div class="panel"><h3><i class="fas fa-link"></i> 通用预订入口</h3><div class="link-grid">'+
      '<a class="link-card" href="https://flights.ctrip.com" target="_blank" rel="noopener"><b>携程机票</b><span>查询往返航班</span></a>'+
      '<a class="link-card" href="https://www.12306.cn" target="_blank" rel="noopener"><b>12306 火车票</b><span>查询高铁/动车</span></a>'+
      '<a class="link-card" href="https://hotels.ctrip.com" target="_blank" rel="noopener"><b>携程酒店</b><span>查询住宿价格</span></a>'+
    '</div></div>';
  }
  return html;
}

function renderChapters(){
  var s=STORIES.find(function(x){return x.id===cur;});
  if(!s){$('chapters').innerHTML='';return;}
  var c=cityOf(s);
  var album=getAlbum();
  var panels=supportPanel(c);
  var chapters=s.chapters.map(function(ch,ci){
    var key=s.id+'-'+ci;
    var hit=album[key];
    var nodes=ch.nodes.map(function(n){return '<div class="node"><b>'+n.n+'</b> — '+n.d+'</div>';}).join('');
    return '<div class="chapter">'+
      '<div class="ch-head" data-ci="'+ci+'"><div class="ch-no">'+(ci+1)+'</div>'+
      '<div class="ch-title"><h4>'+ch.title+'</h4><div class="loc">'+ch.loc+'</div></div>'+
      '<i class="fas fa-chevron-down ch-toggle"></i></div>'+
      '<div class="ch-body" id="body-'+ci+'">'+
        '<div class="scene">'+ch.scene+'</div>'+
        '<div class="nodes">'+nodes+'</div>'+
        '<div class="know"><i class="fas fa-lightbulb"></i> '+ch.know+'</div>'+
        '<div class="collect"><button class="btn '+(hit?'btn-ghost':'btn-primary')+'" data-key="'+key+'" data-title="'+ch.title+'">'+(hit?'<i class="fas fa-bookmark"></i> 已收入收集册':'<i class="far fa-bookmark"></i> 收入收集册')+'</button></div>'+
      '</div></div>';
  }).join('');
  $('chapters').innerHTML=panels+chapters;

  Array.prototype.forEach.call(document.querySelectorAll('.ch-head'),function(h){
    h.onclick=function(){var b=$('body-'+h.dataset.ci);b.classList.toggle('open');h.classList.toggle('open');};
  });
  Array.prototype.forEach.call(document.querySelectorAll('.collect .btn'),function(b){
    b.onclick=function(){
      var a=getAlbum();
      if(a[b.dataset.key]){delete a[b.dataset.key];}else{a[b.dataset.key]=b.dataset.title;}
      saveAlbum(a);renderChapters();renderAlbum();
    };
  });
  renderAlbum();
}

function renderAlbum(){
  var a=getAlbum();
  var keys=Object.keys(a);
  if(!keys.length){$('album').innerHTML='<div class="stamp">还没有收藏章节，读完一段就收入来吧。</div>';return;}
  $('album').innerHTML=keys.map(function(k){return '<div class="stamp hit"><i class="fas fa-bookmark"></i> '+a[k]+'</div>';}).join('');
}

$('searchInput').addEventListener('input',function(){
  if($('detailView').style.display!=='none'){closeStory();} else {renderRoutes();}
});
$('backBtn').onclick=closeStory;
renderRoutes();
