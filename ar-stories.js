/* =========================================================
   MYL · 拾迹集册 v2 · 景点故事 + 专属游戏数据
   每个景点一个独立玩法，不再是统一的"走近捡东西"
   ========================================================= */

window.AR_POIS = [

/* ========== 1. 故宫·太和殿 → 脊兽品级排序 ========== */
{
  id: 'gugong',
  name: '故宫·太和殿',
  subtitle: '紫禁之巅·脊兽之谜',
  center: [116.3975, 39.915],
  theme: 'imperial',
  accent: '#c41e3a',

  plot: [
    { speaker: '老匠人', avatar: '👴', text: '年轻人，你抬头看这屋脊——上面蹲的小兽，可是有严格品级的。', duration: 4000 },
    { speaker: '老匠人', avatar: '👴', text: '太和殿是紫禁城里唯一能放十只脊兽的地方，连皇帝自己都不能随便加。', duration: 4500 },
    { speaker: '旁白', avatar: '📜', text: '【任务】把十只脊兽按品级从高到低重新排列，排对了，才能解锁太和殿的秘密。', duration: 4000 }
  ],

  easterEgg: {
    name: '六百年前的签名',
    trigger: 'game_complete',
    plot: [
      { speaker: '旁白', avatar: '📜', text: '【彩蛋】你排对了脊兽，脚下传来一声轻响——基座石板下藏着一块刻字砖。', duration: 3500 },
      { speaker: '旁白', avatar: '📜', text: '上面刻着："万历三十七年，张二、李三、陈六造"——这是六百年前工匠的签名。', duration: 4000 }
    ],
    reward: { name: '工匠秘记', icon: '📖', desc: '太和殿基座下的工匠签名' }
  },

  game: {
    type: 'sort_puzzle',
    title: '脊兽品级排序',
    instruction: '把十只脊兽按品级从高到低排列（左边最大，右边最小）',
    items: [
      { id: 'long',    name: '龙',   emoji: '🐉', hint: '皇权象征，最高品级' },
      { id: 'feng',    name: '凤',   emoji: '🦅', hint: '百鸟之王，祥瑞之兆' },
      { id: 'shizi',   name: '狮子', emoji: '🦁', hint: '百兽之王，镇宅辟邪' },
      { id: 'tianma',  name: '天马', emoji: '🐎', hint: '日行千里，神通万里' },
      { id: 'haima',   name: '海马', emoji: '🐴', hint: '入海入渊，逢凶化吉' },
      { id: 'suanni',  name: '狻猊', emoji: '🐯', hint: '形似狮子，喜烟好坐' },
      { id: 'xiayu',   name: '狎鱼', emoji: '🐟', hint: '海中异兽，兴云作雨' },
      { id: 'xiezhi',  name: '獬豸', emoji: '🦄', hint: '能辨曲直，公正无私' },
      { id: 'douniu',  name: '斗牛', emoji: '🐂', hint: '虬龙属，镇火避灾' },
      { id: 'hingshi', name: '行什', emoji: '🐒', hint: '雷公化身，防雷避雷' }
    ],
    correctOrder: ['long','feng','shizi','tianma','haima','suanni','xiayu','xiezhi','douniu','hingshi'],
    reward: { name: '紫禁龙纹章', icon: '🏯', desc: '排列太和殿全部脊兽，解锁紫禁第一枚印记' }
  },

  stamp: { id: 'stamp_gugong', name: '紫禁龙纹章', icon: '🏯',
    desc: '排列太和殿全部十只脊兽，解锁帝王之巅印记',
    color: '#c41e3a', bg: 'linear-gradient(135deg,#c41e3a,#8b0000)' }
},

/* ========== 2. 兵马俑·一号坑 → 军阵对位复原 ========== */
{
  id: 'bingmayong',
  name: '兵马俑·一号坑',
  subtitle: '地下军阵·复原之战',
  center: [109.2785, 34.3848],
  theme: 'ancient',
  accent: '#8B7355',

  plot: [
    { speaker: '考古队长', avatar: '🧑‍🔬', text: '这就是秦始皇的地下军团——6000多个俑，排成前锋、主体、侧翼三军。', duration: 4500 },
    { speaker: '考古队长', avatar: '🧑‍🔬', text: '可惜经过两千多年的坍塌，很多俑都碎了、错位了。', duration: 3500 },
    { speaker: '旁白', avatar: '📜', text: '【任务】把散落的俑放回正确的军阵位置：前排是前锋弩兵，中间是主战步兵，两侧是护卫。', duration: 4500 }
  ],

  easterEgg: {
    name: '绿脸俑之谜',
    trigger: 'game_complete',
    plot: [
      { speaker: '旁白', avatar: '📜', text: '【彩蛋】你刚复原好军阵，角落里那个脸色发青的俑突然亮了起来——', duration: 3500 },
      { speaker: '旁白', avatar: '📜', text: '这就是传说中的"绿脸俑"，全世界仅此一件，至今没人知道为什么是绿的。', duration: 4000 }
    ],
    reward: { name: '绿脸俑拓片', icon: '📔', desc: '全世界独一份的绿脸俑' }
  },

  game: {
    type: 'placement',
    title: '军阵复原',
    instruction: '把散落的兵马俑拖到正确的军阵位置（前排=弩兵前锋，中排=步兵主体，后排=战车护卫）',
    grid: {
      rows: 3,
      cols: 4,
      rowLabels: ['前锋（弩兵）', '主体（步兵）', '后卫（战车）']
    },
    pieces: [
      { id: 'nu1',  name: '弩兵俑', emoji: '🏹', row: 0, hint: '前排射手' },
      { id: 'nu2',  name: '弩兵俑', emoji: '🏹', row: 0, hint: '前排射手' },
      { id: 'bu1',  name: '步兵俑', emoji: '🗡️', row: 1, hint: '主战步兵' },
      { id: 'bu2',  name: '步兵俑', emoji: '🗡️', row: 1, hint: '主战步兵' },
      { id: 'bu3',  name: '步兵俑', emoji: '🗡️', row: 1, hint: '主战步兵' },
      { id: 'che1', name: '战车俑', emoji: '🏇', row: 2, hint: '战车护卫' },
      { id: 'che2', name: '战车俑', emoji: '🏇', row: 2, hint: '战车护卫' },
      { id: 'jiang', name: '将军俑', emoji: '🤺', row: 1, hint: '军阵中央' }
    ],
    reward: { name: '秦俑青铜印', icon: '🗡️', desc: '复原秦俑军阵，解锁地下军团印记' }
  },

  stamp: { id: 'stamp_bingmayong', name: '秦俑青铜印', icon: '🗡️',
    desc: '复原兵马俑一号坑军阵，解锁地下军团印记',
    color: '#8B7355', bg: 'linear-gradient(135deg,#8B7355,#3d2914)' }
},

/* ========== 3. 西湖·断桥 → 伞下情缘·剧情选择 ========== */
{
  id: 'xihu',
  name: '西湖·断桥',
  subtitle: '烟雨江南·伞下情缘',
  center: [120.1485, 30.2408],
  theme: 'romantic',
  accent: '#3b7dd8',

  plot: [
    { speaker: '旁白', avatar: '📜', text: '暮春三月，西湖烟雨。一座断桥，两个人，一把伞。', duration: 4000 },
    { speaker: '许仙', avatar: '👨', text: '这位姑娘，雨这么大，不如共撑一伞？', duration: 3500 },
    { speaker: '旁白', avatar: '📜', text: '【任务】你将扮演许仙，在三个关键时刻做出选择——你的选择，决定这段情缘的结局。', duration: 4500 }
  ],

  easterEgg: {
    name: '小青的剑',
    trigger: 'game_complete',
    plot: [
      { speaker: '小青', avatar: '🐍', text: '姐姐救过我一命，这把剑跟了我五百年。', duration: 3000 },
      { speaker: '小青', avatar: '🐍', text: '你若真心待姐姐，这把剑，便是见证。', duration: 3500 }
    ],
    reward: { name: '青蛇信笺', icon: '🐍', desc: '小青赠你的见证之剑' }
  },

  game: {
    type: 'story_choice',
    title: '伞下情缘',
    instruction: '在关键节点做出你的选择，不同选择会导向不同结局',
    chapters: [
      {
        id: 'ch1',
        scene: '断桥初遇',
        text: '雨越下越大，白娘子站在桥头，没有伞。你口袋里只有一把伞。你会——',
        choices: [
          { id: 'a', text: '主动走上前去："姑娘，共撑一伞如何？"', next: 'ch2' },
          { id: 'b', text: '远远看着，等雨停再说', next: 'ch2_bad' },
          { id: 'c', text: '把伞放下，自己冒雨跑走', next: 'ch2_bad' }
        ]
      },
      {
        id: 'ch2',
        scene: '船中借伞',
        text: '你们同船渡湖，白娘子说："雨中借伞，是缘。"你回答——',
        choices: [
          { id: 'a', text: '"伞是小事，能遇见姑娘，才是大缘。"', next: 'ch3' },
          { id: 'b', text: '"一把伞而已，不必挂怀。"', next: 'ch3_mid' },
          { id: 'c', text: '默默不语，只是笑', next: 'ch3_mid' }
        ]
      },
      {
        id: 'ch3',
        scene: '雷峰塔下',
        text: '法海和尚拦住去路："她是蛇妖，你还执迷不悟？"你——',
        choices: [
          { id: 'a', text: '"她是好人，我信她。"挡在白娘子身前', next: 'good_ending' },
          { id: 'b', text: '犹豫后退，不知如何是好', next: 'mid_ending' },
          { id: 'c', text: '听法海的话，转身就走', next: 'bad_ending' }
        ]
      }
    ],
    endings: {
      good_ending: { title: '【圆满结局】断桥不断', text: '你选择了相信。千年修得同船渡，百年修得共枕眠。这段情缘，成了西湖千年的传说。' },
      mid_ending: { title: '【遗憾结局】擦肩而过', text: '你犹豫了。缘分就像这西湖的雨，说来就来，说走就走。' },
      bad_ending: { title: '【错过结局】烟雨断桥', text: '你转身走了。后来有人说，每年暮春，断桥上总有一个撑伞的白影，在等一个不会来的人。' }
    },
    reward: { name: '西湖月章', icon: '🌙', desc: '走完断桥情缘，解锁西湖印记' }
  },

  stamp: { id: 'stamp_xihu', name: '西湖月章', icon: '🌙',
    desc: '走完断桥情缘全剧情，解锁烟雨江南印记',
    color: '#3b7dd8', bg: 'linear-gradient(135deg,#3b7dd8,#1e3a5f)' }
},

/* ========== 4. 中山陵 → 392级台阶·历史问答 ========== */
{
  id: 'zhongshan',
  name: '中山陵',
  subtitle: '392级台阶·攀登之问',
  center: [118.8315, 32.0587],
  theme: 'revolution',
  accent: '#c41e3a',

  plot: [
    { speaker: '旁白', avatar: '📜', text: '从牌坊到祭堂，共392级台阶——象征当时全国3.92亿同胞。', duration: 4000 },
    { speaker: '旁白', avatar: '📜', text: '孙中山先生说："革命尚未成功，同志仍需努力。"', duration: 3500 },
    { speaker: '旁白', avatar: '📜', text: '【任务】每攀登一级，回答一道民国历史题。答对了，才能继续向上。', duration: 4000 }
  ],

  easterEgg: {
    name: '天下为公匾额',
    trigger: 'game_complete',
    plot: [
      { speaker: '旁白', avatar: '📜', text: '【彩蛋】你登到最高处，抬头看见那块"天下为公"匾额——', duration: 3000 },
      { speaker: '旁白', avatar: '📜', text: '这四个字，是孙中山先生亲手写的。也是他一生的理想。', duration: 3500 }
    ],
    reward: { name: '为公印', icon: '🏛️', desc: '孙中山手书"天下为公"' }
  },

  game: {
    type: 'quiz_climb',
    title: '392级台阶',
    instruction: '答对问题才能向上攀登，登顶即通关',
    totalSteps: 10,
    questions: [
      { step: 1, q: '孙中山先生创立的政党是？', options: ['华兴会', '同盟会', '兴中会', '光复会'], answer: 1, hint: '1905年成立于东京' },
      { step: 2, q: '辛亥革命爆发于哪一年？', options: ['1898年', '1911年', '1919年', '1921年'], answer: 1, hint: '武昌起义' },
      { step: 3, q: '"三民主义"不包括以下哪项？', options: ['民族', '民权', '民生', '民主'], answer: 3, hint: '三民主义是：民族、民权、民生' },
      { step: 4, q: '中山陵的设计者是？', options: ['梁思成', '吕彦直', '林徽因', '詹天佑'], answer: 1, hint: '年轻的中国建筑师' },
      { step: 5, q: '中山陵牌坊上刻的两个字是？', options: ['博爱', '共和', '革命', '大同'], answer: 0, hint: '"天下为公"的前两个字' },
      { step: 6, q: '孙中山先生的著作是？', options: ['《革命军》', '《建国方略》', '《猛回头》', '《警世钟》'], answer: 1, hint: '包含实业计划' },
      { step: 7, q: '中山陵祭堂里供奉的是？', options: ['孙中山坐像', '蒋介石像', '廖仲恺像', '未知'], answer: 0, hint: '白色大理石雕' },
      { step: 8, q: '"革命尚未成功"的下一句是？', options: ['同志仍需努力', '吾辈仍当自强', '前途是光明的', '道路是曲折的'], answer: 0, hint: '先生遗言' },
      { step: 9, q: '中山陵位于哪座山？', options: ['紫金山', '栖霞山', '钟山', '幕府山'], answer: 2, hint: '又名紫金山' },
      { step: 10, q: '392级台阶象征什么？', options: ['392位烈士', '当时3.92亿同胞', '392个县市', '392天工期'], answer: 1, hint: '全国人民' }
    ],
    reward: { name: '紫金博爱印', icon: '🎖️', desc: '登上中山陵392级台阶，解锁博爱印记' }
  },

  stamp: { id: 'stamp_zhongshan', name: '紫金博爱印', icon: '🎖️',
    desc: '答对全部历史题，登中山陵之巅',
    color: '#c41e3a', bg: 'linear-gradient(135deg,#c41e3a,#2d0a0a)' }
},

/* ========== 5. 玉龙雪山 → 东巴象形文破译 ========== */
{
  id: 'yulong',
  name: '玉龙雪山',
  subtitle: '神山密码·东巴文破译',
  center: [100.185, 27.1089],
  theme: 'mystic',
  accent: '#87ceeb',

  plot: [
    { speaker: '纳西老人', avatar: '👴', text: '这座雪山，是我们纳西族的神山。山上住着三朵神。', duration: 4000 },
    { speaker: '纳西老人', avatar: '👴', text: '我们的文字——东巴文，是世界上唯一还在使用的象形文字。', duration: 4000 },
    { speaker: '旁白', avatar: '📜', text: '【任务】石碑上刻着五组东巴象形文，把它们和对应的汉字配对，破译神山的封印。', duration: 4500 }
  ],

  easterEgg: {
    name: '东巴经卷',
    trigger: 'game_complete',
    plot: [
      { speaker: '旁白', avatar: '📜', text: '【彩蛋】你破译了全部象形文，石碑缓缓移开，露出一卷古老的东巴经。', duration: 3500 },
      { speaker: '旁白', avatar: '📜', text: '上面画着雪山、湖泊、和一个骑马的人——那是纳西族迁徙的故事。', duration: 4000 }
    ],
    reward: { name: '东巴经卷', icon: '📗', desc: '纳西族千年迁徙图' }
  },

  game: {
    type: 'symbol_match',
    title: '东巴文破译',
    instruction: '把左边的东巴象形文和右边对应的汉字连起来',
    pairs: [
      { id: 'm1', symbol: '🐉', meaning: '龙', emoji: '🐉' },
      { id: 'm2', symbol: '🏔️', meaning: '雪山', emoji: '🏔️' },
      { id: 'm3', symbol: '💧', meaning: '水', emoji: '💧' },
      { id: 'm4', symbol: '🌳', meaning: '树', emoji: '🌳' },
      { id: 'm5', symbol: '☀️', meaning: '太阳', emoji: '☀️' }
    ],
    reward: { name: '玉龙圣雪印', icon: '🏔️', desc: '破译东巴象形文，解锁神山印记' }
  },

  stamp: { id: 'stamp_yulong', name: '玉龙圣雪印', icon: '🏔️',
    desc: '破译全部东巴象形文，解锁神山封印',
    color: '#87ceeb', bg: 'linear-gradient(135deg,#87ceeb,#1e4a6e)' }
},

/* ========== 6. 布达拉宫 → 金顶转经·方位对齐 ========== */
{
  id: 'potala',
  name: '布达拉宫',
  subtitle: '雪域佛光·金顶转经',
  center: [91.1173, 29.6542],
  theme: 'spiritual',
  accent: '#f4a460',

  plot: [
    { speaker: '喇嘛', avatar: '🙏', text: '嗡嘛呢叭咪吽——', duration: 3000 },
    { speaker: '喇嘛', avatar: '🙏', text: '布达拉宫建在红山上，13层，高117米。是世界屋脊上的宫殿。', duration: 4500 },
    { speaker: '旁白', avatar: '📜', text: '【任务】转动转经筒，让四个金顶分别对准东南西北四个方位。对齐了，佛光就会降临。', duration: 4500 }
  ],

  easterEgg: {
    name: '五世达赖的梦',
    trigger: 'game_complete',
    plot: [
      { speaker: '旁白', avatar: '📜', text: '【彩蛋】你对齐了金顶，一道金光从山顶洒下——', duration: 3000 },
      { speaker: '旁白', avatar: '📜', text: '传说五世达赖喇嘛梦见观音菩萨，才决定在红山上建这座宫殿。', duration: 4000 }
    ],
    reward: { name: '金箔', icon: '✨', desc: '布达拉宫金顶上的一片金箔' }
  },

  game: {
    type: 'rotate_align',
    title: '金顶转经',
    instruction: '旋转转经筒，让四个金顶分别对准东南西北',
    totalRounds: 3,
    reward: { name: '雪域佛光印', icon: '☀️', desc: '对齐金顶方位，解锁雪域佛光印记' }
  },

  stamp: { id: 'stamp_potala', name: '雪域佛光印', icon: '☀️',
    desc: '对齐布达拉宫金顶方位，解锁雪域之光',
    color: '#f4a460', bg: 'linear-gradient(135deg,#f4a460,#8b4513)' }
}
];

/* ============ 纪念海报解锁组 ============ */
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
