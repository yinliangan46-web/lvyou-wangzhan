/* =========================================================
   MYL · 拾迹寻宝 故事情节数据
   格式：每个景点一个 POI_STORY，含：
     - markerUrl   : MindAR .mind 识别图（去 https://hiukim.github.io/mind-ar-js-doc/tools/compile/ 上传景点照编译）
     - center       : 景点坐标 [lng, lat]（备用）
     - plot         : 主线故事（对话气泡，多段）
     - easterEggs   : 隐藏彩蛋（解锁条件 + 彩蛋剧情）
     - artifacts    : 寻宝线索（3D物体，需在AR里找到全部才算通关）
     - stamp        : 通关后获得的印记
     - posters      : 集齐一组后解锁的纪念海报组
   
   开发者替换素材：
   1. markerUrl: 编译 .mind 文件放 /markers/ 目录
   2. modelUrl : .glb 模型放 /models/ 目录
   3. bgm / sfx : 放 /audio/ 目录
   ========================================================= */
window.AR_POIS = [
{
  id: 'gugong',
  name: '故宫·太和殿',
  markerUrl: 'markers/gugong.mind',
  center: [116.3975, 39.915],
  modelUrl: null,   // 先用程序生成，换真实 GLB 填 URL
  modelScale: 0.08,
  modelHint: '太和殿脊兽群像',

  /* ============ 主线故事（原神式对话气泡） ============ */
  plot: [
    { id:'p01', speaker:'宫女', avatar:'👧', text:'大人，您看这屋脊上蹲的那些小兽，每一只都有讲究。', delay: 0 },
    { id:'p02', speaker:'导游', avatar:'🧑‍🏫', text:'太和殿脊兽一共有十个：龙、凤、狮子、天马、海马、狻猊、狎鱼、獬豸、斗牛、行什。', delay: 2500 },
    { id:'p03', speaker:'宫女', avatar:'👧', text:'行什排最后，长得像猴子带翅膀，据说雷雨天气会爬去避雷。', delay: 6000 },
    { id:'p04', speaker:'旁白', avatar:'📜', text:'【剧情提示】沿着故宫中轴线往南，穿过午门，就能看到真正的"龙"的入口。', delay: 9500, hint:'south_gate' }
  ],

  /* ============ 隐藏彩蛋 ============ */
  easterEggs: [
    { id:'e1', trigger:'found_artifact_3', name:'六百年前的工匠日记',
      plot: [
        { id:'e1a', speaker:'工匠', avatar:'🔨', text:'万历三十七年……我在这里刻了一行字，只有抬头看那只狮子的底座才能找到。', delay: 0 },
        { id:'e1b', speaker:'旁白', avatar:'📜', text:'【彩蛋解锁！】原来太和殿的狮子底座里藏着六百年前工匠的签名："张二、李三、陈六"。', delay: 3500 }
      ],
      reward: { name:'工匠秘记', icon:'📖', desc:'解锁彩蛋后才能查看' }
    }
  ],

  /* ============ 寻宝线索（AR里的3D漂浮物体） ============
     position: 相对于识别图锚点的 3D 坐标 [x, y, z]
     （MindAR 锚点 XY 是识别图平面，Z 是深度，单位米） */
  artifacts: [
    { id:'a1', name:'脊兽·龙',  position: [0.0, 0.35, 0.0],  model:'dragon',   hint:'抬头，屋脊第一只' },
    { id:'a2', name:'脊兽·行什', position: [0.6, 0.35, 0.0],  model:'monkey',   hint:'屋脊最末端那只像猴子的' },
    { id:'a3', name:'底座·签名', position: [0.3, -0.05, 0.1], model:'seal',     hint:'低头看太和殿基座' },
    { id:'a4', name:'午门·石狮', position: [-0.5, 0.0, -0.8], model:'lion',     hint:'午门方向的远处' }
  ],

  /* ============ 通关印记 ============ */
  stamp: { id:'stamp_gugong', name:'紫禁龙纹章', icon:'🏯',
    desc:'集齐太和殿全部线索，解锁故宫第一枚印记',
    color:'#c41e3a', bg:'linear-gradient(135deg,#c41e3a,#8b0000)' }
},

{
  id: 'bingmayong',
  name: '兵马俑·一号坑',
  markerUrl: 'markers/bingmayong.mind',
  center: [109.2785, 34.3848],
  modelUrl: null,
  modelScale: 0.1,

  plot: [
    { id:'p01', speaker:'考古学家', avatar:'🧑‍🔬', text:'这些俑每个都不一样，脸、发式、铠甲，连鞋都不一样。', delay: 0 },
    { id:'p02', speaker:'旁白', avatar:'📜', text:'【剧情】秦始皇花了 38 年、72 万工匠，修了自己的"地下军阵"。', delay: 2500 },
    { id:'p03', speaker:'考古学家', avatar:'🧑‍🔬', text:'二号坑出土的那个绿脸俑至今还是个谜，全世界独一份。', delay: 6500 }
  ],

  easterEggs: [
    { id:'e1', trigger:'found_artifact_2', name:'绿脸俑的秘密',
      plot: [{ id:'e1a', speaker:'旁白', avatar:'📜', text:'【彩蛋】绿脸俑可能是工匠做的试验品，烧制时窑里氧气不足，铜绿没烧红。', delay: 0 }],
      reward: { name:'考古笔记', icon:'📔' } }
  ],

  artifacts: [
    { id:'a1', name:'将军俑',  position: [0.0, 0.5, 0.0],   model:'general',   hint:'坑中央那个最高的' },
    { id:'a2', name:'绿脸俑',  position: [0.5, 0.4, 0.1],   model:'greenface', hint:'脸色发青的那个' },
    { id:'a3', name:'跪射俑',  position: [-0.3, 0.1, 0.0], model:'kneeling',  hint:'蹲着的那个' }
  ],

  stamp: { id:'stamp_bingmayong', name:'秦俑青铜印', icon:'🗡️',
    desc:'集齐兵马俑一号坑全部线索', color:'#8B7355', bg:'linear-gradient(135deg,#8B7355,#3d2914)' }
},

{
  id: 'xihu',
  name: '西湖·断桥',
  markerUrl: 'markers/xihu.mind',
  center: [120.1485, 30.2408],
  modelUrl: null,
  modelScale: 0.08,

  plot: [
    { id:'p01', speaker:'许仙', avatar:'👨', text:'娘子，这雨越下越大了……', delay: 0 },
    { id:'p02', speaker:'白娘子', avatar:'👩', text:'官人不必慌张，我有伞。', delay: 2000 },
    { id:'p03', speaker:'旁白', avatar:'📜', text:'【剧情】白蛇传的相遇，就在这座断桥上。桥断了，人没断。', delay: 4500 }
  ],

  easterEggs: [
    { id:'e1', trigger:'found_artifact_2', name:'小青的剑',
      plot: [{ id:'e1a', speaker:'小青', avatar:'🐍', text:'【彩蛋】姐姐救了我一命，这把剑跟着我几百年了。', delay: 0 }],
      reward: { name:'青蛇信笺', icon:'🐍' } }
  ],

  artifacts: [
    { id:'a1', name:'白蛇伞', position: [0.0, 0.4, 0.0],  model:'umbrella', hint:'许仙手里那把伞' },
    { id:'a2', name:'青蛇剑', position: [0.5, 0.2, 0.1],  model:'sword',    hint:'桥东边' },
    { id:'a3', name:'雷峰塔', position: [-0.8, 0.5, -0.3], model:'tower',    hint:'远处山顶' }
  ],

  stamp: { id:'stamp_xihu', name:'西湖月章', icon:'🌙',
    desc:'集齐西湖断桥全部线索', color:'#3b7dd8', bg:'linear-gradient(135deg,#3b7dd8,#1e3a5f)' }
},

{
  id: 'zhongshan',
  name: '中山陵',
  markerUrl: 'markers/zhongshan.mind',
  center: [118.8315, 32.0587],
  modelUrl: null,
  modelScale: 0.08,

  plot: [
    { id:'p01', speaker:'孙中山', avatar:'🎩', text:'革命尚未成功，同志仍需努力。', delay: 0 },
    { id:'p02', speaker:'旁白', avatar:'📜', text:'【剧情】392 级台阶象征当时的 3.92 亿同胞。', delay: 2500 }
  ],

  easterEggs: [
    { id:'e1', trigger:'found_artifact_2', name:'天下为公匾额',
      plot: [{ id:'e1a', speaker:'旁白', avatar:'📜', text:'【彩蛋】"天下为公"四个字，是孙先生的手迹。', delay: 0 }],
      reward: { name:'为公印', icon:'🏛️' } }
  ],

  artifacts: [
    { id:'a1', name:'博爱牌坊', position: [0.0, 0.5, 0.0],  model:'archway', hint:'入口那座牌坊' },
    { id:'a2', name:'天下为公', position: [0.5, 0.4, 0.1],  model:'tablet',  hint:'陵门上' },
    { id:'a3', name:'孙中山坐像', position: [0.0, 0.3, -0.8], model:'statue', hint:'最里面' }
  ],

  stamp: { id:'stamp_zhongshan', name:'紫金博爱印', icon:'🎖️',
    desc:'集齐中山陵全部线索', color:'#c41e3a', bg:'linear-gradient(135deg,#c41e3a,#2d0a0a)' }
},

{
  id: 'yulong',
  name: '玉龙雪山',
  markerUrl: 'markers/yulong.mind',
  center: [100.185, 27.1089],
  modelUrl: null,
  modelScale: 0.12,

  plot: [
    { id:'p01', speaker:'纳西族老人', avatar:'👴', text:'这山上住着三兄弟："丁巴什罗"。', delay: 0 },
    { id:'p02', speaker:'旁白', avatar:'📜', text:'【剧情】玉龙雪山是纳西族的神山，海拔 5596 米，没人登顶。', delay: 3000 }
  ],

  easterEggs: [
    { id:'e1', trigger:'found_artifact_3', name:'纳西象形文密码',
      plot: [{ id:'e1a', speaker:'旁白', avatar:'📜', text:'【彩蛋】纳西象形文是至今还在使用的最古老文字之一。', delay: 0 }],
      reward: { name:'东巴经卷', icon:'📗' } }
  ],

  artifacts: [
    { id:'a1', name:'冰川遗迹', position: [0.0, 0.5, 0.0],   model:'glacier',   hint:'冰川公园' },
    { id:'a2', name:'蓝月谷',  position: [0.6, 0.3, 0.1],   model:'lake',      hint:'山脚蓝色湖泊' },
    { id:'a3', name:'印象丽江', position: [-0.5, 0.0, -0.8], model:'stage',     hint:'山脚下的表演台' }
  ],

  stamp: { id:'stamp_yulong', name:'玉龙圣雪印', icon:'🏔️',
    desc:'集齐玉龙雪山全部线索', color:'#87ceeb', bg:'linear-gradient(135deg,#87ceeb,#1e4a6e)' }
},

{
  id: 'potala',
  name: '布达拉宫',
  markerUrl: 'markers/potala.mind',
  center: [91.1173, 29.6542],
  modelUrl: null,
  modelScale: 0.08,

  plot: [
    { id:'p01', speaker:'喇嘛', avatar:'🙏', text:'嗡嘛呢叭咪吽——', delay: 0 },
    { id:'p02', speaker:'旁白', avatar:'📜', text:'【剧情】布达拉宫建在红山上，13 层楼高 117 米，是世界屋脊上的宫殿。', delay: 2500 },
    { id:'p03', speaker:'喇嘛', avatar:'🙏', text:'里面有 8 座灵塔，每一座都裹着真正的金箔。', delay: 6000 }
  ],

  easterEggs: [
    { id:'e1', trigger:'found_artifact_2', name:'五世达赖的梦',
      plot: [{ id:'e1a', speaker:'旁白', avatar:'📜', text:'【彩蛋】红山上曾是松赞干布的行宫，后来才改建成宫殿。', delay: 0 }],
      reward: { name:'金箔', icon:'✨' } }
  ],

  artifacts: [
    { id:'a1', name:'红宫', position: [0.0, 0.5, 0.0],   model:'palace',   hint:'中央那栋红墙' },
    { id:'a2', name:'白宫', position: [0.5, 0.3, 0.1],   model:'whitehouse', hint:'旁边白墙' },
    { id:'a3', name:'金顶', position: [-0.3, 0.8, 0.0], model:'goldroof', hint:'最上面金顶' }
  ],

  stamp: { id:'stamp_potala', name:'雪域佛光印', icon:'☀️',
    desc:'集齐布达拉宫全部线索', color:'#f4a460', bg:'linear-gradient(135deg,#f4a460,#8b4513)' }
}
];

/* ============ 纪念海报解锁组 ============ */
// 集齐一组里的所有 stamp.id → 自动解锁海报
window.POSTER_GROUPS = [
  {
    id: 'beijing', name: '王者之门',
    title: '北京·千年帝都',
    required: ['stamp_gugong'],
    bg: 'linear-gradient(135deg,#c41e3a 0%,#8b0000 50%,#1a0000 100%)',
    desc: '集齐故宫印记，解锁帝王之门海报'
  },
  {
    id: 'china-golden', name: '华夏文明',
    title: '华夏文明之光',
    required: ['stamp_bingmayong','stamp_gugong'],
    bg: 'linear-gradient(135deg,#daa520 0%,#8b4513 100%)',
    desc: '集齐秦俑+故宫，解锁华夏文明海报'
  },
  {
    id: 'south-yangtze', name: '江南烟雨',
    title: '江南烟雨图',
    required: ['stamp_xihu','stamp_zhongshan'],
    bg: 'linear-gradient(135deg,#3b7dd8 0%,#228b22 100%)',
    desc: '集齐西湖+中山陵，解锁江南海报'
  },
  {
    id: 'plateau', name: '雪域高原',
    title: '雪域·圣光',
    required: ['stamp_potala','stamp_yulong'],
    bg: 'linear-gradient(135deg,#87ceeb 0%,#e0e0e0 50%,#f4a460 100%)',
    desc: '集齐布达拉宫+玉龙雪山，解锁高原海报'
  },
  {
    id: 'myl-complete', name: '拾迹满册',
    title: 'MYL·拾迹满册',
    required: ['stamp_gugong','stamp_bingmayong','stamp_xihu','stamp_zhongshan','stamp_potala','stamp_yulong'],
    bg: 'radial-gradient(circle at 50% 50%,#ffd700 0%,#c41e3a 50%,#1a0033 100%)',
    desc: '集齐全部 6 枚印记，解锁终极海报'
  }
];

/* ============ 3D 模型程序生成器（Three.js Mesh 数组） ============
   每个 model key 返回 [geometry, material]，ar-viewer 会 new Mesh 挂上去
   真实 GLB 模型替换：把 key 改成 { url: '/models/xxx.glb' } 即可 */
window.ARTIFACT_MODELS = {
  // 故宫
  dragon: function(THREE) {
    // 简化龙：金色立方体 + 尖刺
    const geo = new THREE.BoxGeometry(0.15, 0.06, 0.15);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.3, emissive: 0x443300 });
    return [geo, mat];
  },
  monkey: function(THREE) {
    const geo = new THREE.SphereGeometry(0.06, 16, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.6 });
    return [geo, mat];
  },
  seal: function(THREE) {
    const geo = new THREE.BoxGeometry(0.05, 0.02, 0.05);
    const mat = new THREE.MeshStandardMaterial({ color: 0xc41e3a, metalness: 0.5, roughness: 0.3 });
    return [geo, mat];
  },
  lion: function(THREE) {
    const geo = new THREE.ConeGeometry(0.04, 0.12, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });
    return [geo, mat];
  },
  // 兵马俑
  general: function(THREE) {
    const geo = new THREE.CylinderGeometry(0.03, 0.04, 0.25, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.8 });
    return [geo, mat];
  },
  greenface: function(THREE) {
    const geo = new THREE.SphereGeometry(0.035, 16, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a7c4f, roughness: 0.6, emissive: 0x1a331a, emissiveIntensity: 0.3 });
    return [geo, mat];
  },
  kneeling: function(THREE) {
    const geo = new THREE.CylinderGeometry(0.025, 0.03, 0.15, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x6b5344, roughness: 0.8 });
    return [geo, mat];
  },
  // 西湖
  umbrella: function(THREE) {
    const geo = new THREE.ConeGeometry(0.08, 0.06, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    return [geo, mat];
  },
  sword: function(THREE) {
    const geo = new THREE.BoxGeometry(0.005, 0.2, 0.005);
    const mat = new THREE.MeshStandardMaterial({ color: 0x8888ff, metalness: 0.9, roughness: 0.1 });
    return [geo, mat];
  },
  tower: function(THREE) {
    const geo = new THREE.CylinderGeometry(0.03, 0.04, 0.2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xaa4444, roughness: 0.5 });
    return [geo, mat];
  },
  // 中山陵
  archway: function(THREE) {
    const geo = new THREE.BoxGeometry(0.15, 0.08, 0.04);
    const mat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.6 });
    return [geo, mat];
  },
  tablet: function(THREE) {
    const geo = new THREE.BoxGeometry(0.06, 0.04, 0.01);
    const mat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffd700, emissiveIntensity: 0.2 });
    return [geo, mat];
  },
  statue: function(THREE) {
    const geo = new THREE.CylinderGeometry(0.025, 0.035, 0.2, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.3 });
    return [geo, mat];
  },
  // 玉龙雪山
  glacier: function(THREE) {
    const geo = new THREE.ConeGeometry(0.12, 0.3, 5);
    const mat = new THREE.MeshStandardMaterial({ color: 0xeeeeff, roughness: 0.1 });
    return [geo, mat];
  },
  lake: function(THREE) {
    const geo = new THREE.CircleGeometry(0.1, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0x4488cc, metalness: 0.6, roughness: 0.2 });
    return [geo, mat];
  },
  stage: function(THREE) {
    const geo = new THREE.BoxGeometry(0.15, 0.02, 0.1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xdd8866, roughness: 0.5 });
    return [geo, mat];
  },
  // 布达拉宫
  palace: function(THREE) {
    const geo = new THREE.BoxGeometry(0.12, 0.18, 0.08);
    const mat = new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: 0.6 });
    return [geo, mat];
  },
  whitehouse: function(THREE) {
    const geo = new THREE.BoxGeometry(0.08, 0.12, 0.06);
    const mat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4 });
    return [geo, mat];
  },
  goldroof: function(THREE) {
    const geo = new THREE.ConeGeometry(0.04, 0.06, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.95, roughness: 0.05, emissive: 0x665500, emissiveIntensity: 0.4 });
    return [geo, mat];
  }
};
