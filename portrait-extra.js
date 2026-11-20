/* 城市画像扩展模块：气质雷达 / 城市人格 / 相似对标（由 portrait.js 调用） */
function hashStr(s){var h=0;s=String(s||'');for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))>>>0;}return h;}
function fallbackC(c){
  c=c||{};
  var tags=c.tags||[];
  var foods=(c.foods||[]).map(function(f){return typeof f==='string'?f:(f.name||'');});
  var lands=c.landmarks||c.bLandmarks||[];
  var head=(c.name||'')+' '+tags.join(' ');
  var foodText=foods.join(' ');
  var landText=lands.join(' ');
  var hist=c.history||c.bHistory||'';
  var s={food:2,photo:2,relax:2,culture:2,night:2,value:3,fun:2};

  /* 美食：看本地美食清单数量与菜品名 */
  if(foods.length>=3 || /美食|小吃|火锅|面|馍|粑|锅|烤|茶|味|鹅|鱼|鸡|肉|酒|糕|粉/.test(foodText+head)) s.food=4;
  else if(foods.length>=1) s.food=3;

  /* 人文：只认头部与地标里的历史实体，简介裸“历史/文化”不抬高 */
  if(/古|寺|祠|宫|陵|博物|古镇|古城|巷|墙|窟|古都|遗址|故里|戏楼|窑|故居|书院|塔/.test(head+landText)) s.culture=4;
  else if(/古称|王朝|封地|置县|置郡|古都|都会/.test(hist)) s.culture=3;

  /* 出片：只认地标/头部里的强景观实体；简介里的裸江河水景不抬到 4 */
  if(/山|湖|海|岛|湾|滩|草原|沙漠|峡谷|林|瀑布|峰|寨|洞|湿地|花海|溪|谷|江景|河景|石林/.test(head+landText)) s.photo=4;
  else if(/江|河|风光|景/.test(hist)) s.photo=3;

  /* 松弛：度假/乡野/民宿/山水慢城 */
  if(/度假|慢|田园|民宿|山庄|森林|温泉|滨|湖|草原|村|乡|躺|湿地|花海/.test(head+landText+hist)) s.relax=4;

  /* 夜生活：看头部标签的都市/商圈/夜景属性 */
  if(/夜|都|潮|购物|商圈|都市|霓虹|夜景/.test(head)) s.night=4;
  else if(/境外|欧洲|日本|韩国|东南亚/.test(head)) s.night=3;

  /* 性价比：国内小城默认友好，境外偏高消 */
  if(/低成本|便宜|平价|性价比/.test(head)) s.value=4;
  else if(/境外|欧洲|日本|韩国/.test(head)) s.value=2;

  /* 玩乐：乐园/探险/户外节庆 */
  if(/乐园|主题|漂流|滑雪|戏水|节庆|热闹|游乐|探险|徒步|登山|滑雪/.test(head+landText)) s.fun=4;

  return s;
}
function ensureScore(c, sc){
  sc=sc||{};
  var real=!!sc.r;
  if(!sc.c) sc.c=fallbackC(c);
  sc.__name__=c?c.name:'';
  sc.__real=real;
  return sc;
}

function radarChart(sc){
  var c=(sc&&sc.c)||{};
  var D=[['food','美食'],['photo','出片'],['relax','松弛'],['culture','人文'],['night','夜生活'],['value','性价比']];
  var vals=D.map(function(d){return c[d[0]];});
  if(vals.every(function(v){return v==null;})) return '';
  var cx=120, cy=104, R=66, n=D.length;
  function pt(i,ratio){var ang=-Math.PI/2+i*2*Math.PI/n;return [cx+R*ratio*Math.cos(ang),cy+R*ratio*Math.sin(ang)];}
  var grid='';
  [1/3,2/3,1].forEach(function(r){var p=[];for(var i=0;i<n;i++){var q=pt(i,r);p.push(q[0].toFixed(1)+','+q[1].toFixed(1));}grid+='<polygon points="'+p.join(' ')+'" fill="none" stroke="#e6ecf5" stroke-width="1"/>';});
  var axes='',labels='',data=[],dots='';
  for(var i=0;i<n;i++){
    var q=pt(i,1);
    axes+='<line x1="'+cx+'" y1="'+cy+'" x2="'+q[0].toFixed(1)+'" y2="'+q[1].toFixed(1)+'" stroke="#e6ecf5"/>';
    var lv=pt(i,1.2);
    labels+='<text x="'+lv[0].toFixed(1)+'" y="'+lv[1].toFixed(1)+'" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="#6b7787">'+D[i][1]+'</text>';
    var v=vals[i]==null?0:vals[i]/5;
    var dq=pt(i,v);
    data.push(dq[0].toFixed(1)+','+dq[1].toFixed(1));
    if(vals[i]!=null) dots+='<circle cx="'+dq[0].toFixed(1)+'" cy="'+dq[1].toFixed(1)+'" r="3" fill="#2563eb"/>';
  }
  return '<svg class="radar" viewBox="0 0 240 208" width="100%" height="208">'+grid+axes+
    '<polygon points="'+data.join(' ')+'" fill="rgba(37,99,235,.16)" stroke="#2563eb" stroke-width="1.6"/>'+dots+labels+'</svg>';
}

function cityPersona(sc){
  var c=(sc&&sc.c)||{}, r=(sc&&sc.r)||{};
  var pool=[
    ['culture',(c.culture||r.culture)||0,'历史课代表','走到哪儿都想先翻一翻这座城的来历','fa-landmark'],
    ['food',(c.food||r.food)||0,'追味干饭人','行程可以松，胃不能受委屈','fa-bowl-food'],
    ['photo',(c.photo||r.sight)||0,'出片侦察兵','先找机位和光线，再谈逛哪儿','fa-camera-retro'],
    ['relax',(c.relax||r.pace)||0,'节奏缓冲家','能坐下来喝杯东西，比赶景点重要','fa-leaf'],
    ['night',c.night||0,'夜行动物','白天养精蓄锐，晚上才开始进城','fa-moon'],
    ['budget',(c.value||r.budget)||0,'精明划算派','每一笔花销都要花在刀刃上','fa-coins'],
    ['fun',(c.fun||r.fun)||0,'玩乐冒险家','哪里热闹往哪儿钻，主打一个尽兴','fa-face-grin-stars']
  ];
  var max=Math.max.apply(null,pool.map(function(x){return x[1];}));
  /* 真实评分城只认严格最高分；兜底城在接近最高的候选集里按城市名哈希打散，避免同型扎堆 */
  var strict=!!(sc&&sc.__real);
  var bucket=max<=2?pool:pool.filter(function(x){return x[1]>=max-(strict?0:1);});
  var pick=bucket[hashStr(sc&&sc.__name__)%bucket.length];
  if(!pick||pick[1]<=0) return {name:'随性漫游者',line:'不设固定路线，跟着心情和偶遇走',icon:'fa-compass'};
  return {name:pick[2],line:pick[3],icon:pick[4]};
}
function personaBanner(sc){
  var p=cityPersona(sc);
  return '<div class="persona-banner"><i class="fas '+p.icon+'"></i><div><b>'+p.name+'</b><span>'+p.line+'</span></div></div>';
}

function similarTo(c){
  var S=window.MYLSCORE; if(!S) return [];
  var me=S[c.name];
  var keys=Object.keys(S).filter(function(k){return k!=='get'&&k!==c.name&&S[k];});
  if(me&&me.r){
    var dims=['food','sight','culture','budget','pace','fun'];
    function dist(a,b){var s=0;dims.forEach(function(d){var x=(a[d]||0)-(b[d]||0);s+=x*x;});return Math.sqrt(s);}
    return keys.filter(function(k){return S[k].r;}).map(function(k){return {name:k,d:dist(me.r,S[k].r),hit:0};}).sort(function(a,b){return a.d-b.d;}).slice(0,2);
  }
  var myTags=(c.tags||[]).join(' ');
  function tagScore(k){var t=(S[k].tag||'')+' '+(S[k].who||'');var hit=0;myTags.split(/\s+/).forEach(function(w){if(w&&t.indexOf(w)>=0)hit++;});return hit;}
  var byTag=keys.map(function(k){return {name:k,d:0,hit:tagScore(k)};}).filter(function(x){return x.hit>0;}).sort(function(a,b){return b.hit-a.hit;});
  if(byTag.length) return byTag.slice(0,2);
  function total(k){var r=S[k].r||{};return Object.keys(r).reduce(function(s,x){return s+(r[x]||0);},0);}
  return keys.filter(function(k){return S[k].r;}).map(function(k){return {name:k,d:0,hit:-1,score:total(k)};}).sort(function(a,b){return b.score-a.score;}).slice(0,2);
}
function similarBlock(c){
  var list=similarTo(c); if(!list.length) return '';
  return '<div class="dsec"><h4><i class="fas fa-clone"></i> 气质相近的目的地</h4><div class="sim-row">'+
    list.map(function(x){var tag=x.hit===-1?'推荐':(x.hit>0?'同类':(x.d<1.2?'很像':(x.d<2?'较像':'相近')));return '<button class="sim" data-name="'+x.name+'">'+x.name+'<span>'+tag+'</span></button>';}).join('')+
  '</div></div>';
}
