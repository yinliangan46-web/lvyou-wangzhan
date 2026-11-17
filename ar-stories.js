/* ============================================================
   AR 故事导览 + 拾迹寻宝 — 统一数据配置
   ============================================================
   新增景点只需在 AR_POIS 里加一条，格式见下方注释。
   markerUrl 指向 MindAR .mind 标记文件（可用 MindAR 官方生成器从图片生成），
   没有 .mind 文件时会自动降级为"无 AR 模式"（纯故事 + 寻宝）。
   ============================================================ */

window.AR_POIS = [
    /* ---------- 故宫（北京）---------- */
    {
        id: 'gugong',
        city: '北京',
        name: '故宫博物院',
        nameEn: 'Forbidden City',
        markerUrl: '', /* ← 替换位：MindAR 图片识别 .mind 文件，留空则走无AR */
        posterUrl: 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=1200&q=80',
        lat: 39.9163, lng: 116.3972,
        stamp: { name: '龙纹玉章', emoji: '🏯', color: '#c0392b' },
        poster: {
            id: 'beijing_palace',
            title: '王者之门',
            subtitle: '集齐北京三大皇家印记解锁',
            cities: ['北京'],
            requiredStamps: ['gugong', 'tiananmen', 'yishanyuan'],
            bg: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=80',
            caption: '天子脚下，六百年帝王气象。'
        },
        storyMain: [
            { time: '00:03', text: '紫禁城的黄昏，是六百年帝王最后的背影。', duration: 4000 },
            { time: '00:08', text: '这里曾住过二十四位皇帝，每一块金砖都浸透了权谋与荣耀。', duration: 5000 },
            { time: '00:15', text: '你现在站的地方，太和殿前的白玉台基，', duration: 3500 },
            { time: '00:19', text: '是当年百官跪拜、山呼万岁的位置。', duration: 4000 },
            { time: '00:25', text: '低头看看地砖，缝隙里嵌着当年工匠的名字。', duration: 4500 },
            { time: '00:31', text: '他们或许不会想到，自己的名字会被未来的旅人轻声念起。', duration: 5000 }
        ],
        storyEgg: [
            { time: '00:02', text: '【彩蛋】你知道吗？', duration: 2000 },
            { time: '00:05', text: '故宫至今有一半以上的区域，从 1925 年开放以来，从未对公众开放过。', duration: 5000 },
            { time: '00:12', text: '那些被木板封住的宫门后面，藏着什么？', duration: 4500 },
            { time: '00:17', text: '也许只有风知道答案。', duration: 3500 }
        ],
        hunt: {
            markerDesc: '在太和殿前找到一枚发光的「琉璃瓦」标记',
            markers: [
                { id: 'g1', hint: '红色宫墙的倒影里', answer: '琉璃瓦' },
                { id: 'g2', hint: '太和殿的台阶正中央', answer: '龙纹' }
            ],
            quizzes: [
                { q: '故宫里「皇帝」每天是怎么被叫醒的？', options: ['打更人敲梆子', '太监在窗外喊「万岁爷，起驾了」', '自鸣钟响', '御膳房烧炭升温'], answer: 1 },
                { q: '故宫共有多少间房？（含廊）', options: ['9999 间半', '10000 间', '8888 间', '6666 间'], answer: 0 },
                { q: '传说中故宫的屋顶上住着几排「仙人走兽」，走兽数量最多的大殿是？', options: ['乾清宫', '太和殿', '保和殿', '午门'], answer: 1 }
            ]
        }
    },

    /* ---------- 西湖（杭州）---------- */
    {
        id: 'xihu',
        city: '杭州',
        name: '西湖',
        nameEn: 'West Lake',
        markerUrl: '',
        posterUrl: 'https://images.unsplash.com/photo-1599708103759-5c14db858cd5?w=1200&q=80',
        lat: 30.2416, lng: 120.2413,
        stamp: { name: '苏堤春晓', emoji: '🌿', color: '#16a085' },
        poster: null,
        storyMain: [
            { time: '00:03', text: '烟雨朦胧的西湖，苏东坡曾在这里写道——', duration: 3000 },
            { time: '00:07', text: '「欲把西湖比西子，淡妆浓抹总相宜。」', duration: 4500 },
            { time: '00:13', text: '站在断桥之上，你脚下的这块石板，', duration: 3000 },
            { time: '00:17', text: '据传是白蛇与许仙相遇之处。', duration: 4000 },
            { time: '00:22', text: '而那一株株垂柳，', duration: 2500 },
            { time: '00:25', text: '是白居易在任时亲手栽种的。', duration: 3500 }
        ],
        storyEgg: [
            { time: '00:02', text: '【彩蛋】西湖为什么是「西」湖？', duration: 3000 },
            { time: '00:06', text: '因为在杭州城的西边。就这么简单。', duration: 3500 },
            { time: '00:11', text: '但一千多年来，', duration: 2000 },
            { time: '00:14', text: '这个简单的名字承载了太多不简单的故事。', duration: 4500 }
        ],
        hunt: {
            markerDesc: '在苏堤上找到「桃枝」与「柳枝」两枚标记',
            markers: [
                { id: 'x1', hint: '苏堤第二桥的栏杆上', answer: '桃枝' },
                { id: 'x2', hint: '白堤东段的柳荫里', answer: '柳枝' }
            ],
            quizzes: [
                { q: '「断桥残雪」是西湖十景之一，「断桥」其实指的是？', options: ['桥断了', '冬天雪融化后像断了', '桥名就叫断桥', '残桥的意思'], answer: 1 },
                { q: '西湖最著名的特产——龙井茶，主要产自哪座山？', options: ['凤凰山', '灵隐山', '狮峰山', '宝石山'], answer: 2 },
                { q: '苏东坡修的那条长堤现在叫什么？', options: ['白堤', '苏堤', '杨公堤', '金沙堤'], answer: 1 }
            ]
        }
    },

    /* ---------- 兵马俑（西安）---------- */
    {
        id: 'bingmayong',
        city: '西安',
        name: '秦始皇兵马俑',
        nameEn: 'Terracotta Warriors',
        markerUrl: '',
        posterUrl: 'https://images.unsplash.com/photo-1552960562-daf630e9278b?w=1200&q=80',
        lat: 34.3843, lng: 109.2785,
        stamp: { name: '秦俑武士', emoji: '🛡️', color: '#8e6e3a' },
        poster: {
            id: 'xian_terracotta',
            title: '地下军团',
            subtitle: '集齐西安历史印记解锁',
            cities: ['西安'],
            requiredStamps: ['bingmayong', 'xian_anmen', 'huashan'],
            bg: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1600&q=80',
            caption: '两千年前的沉默军团，静静守望着他们的帝王。'
        },
        storyMain: [
            { time: '00:03', text: '你看到的每一张脸，', duration: 2500 },
            { time: '00:06', text: '都属于一个真实存在过的秦人。', duration: 3500 },
            { time: '00:11', text: '他们可能是关中平原上某个村庄里的青年，', duration: 3500 },
            { time: '00:16', text: '被征召入伍，', duration: 2000 },
            { time: '00:19', text: '烧制成陶，', duration: 2000 },
            { time: '00:22', text: '埋入地下，', duration: 2000 },
            { time: '00:25', text: '等待两千年后与你相遇。', duration: 4500 }
        ],
        storyEgg: [
            { time: '00:02', text: '【彩蛋】', duration: 1500 },
            { time: '00:04', text: '兵马俑刚出土时，身上其实有鲜艳的彩色！', duration: 4000 },
            { time: '00:10', text: '但一接触空气，颜色在几分钟内就氧化消失了。', duration: 4500 },
            { time: '00:16', text: '所以现在你看到的，是他们真实颜色褪掉后的样子。', duration: 4500 }
        ],
        hunt: {
            markerDesc: '在一号坑找到「将军俑」和「弩机」标记',
            markers: [
                { id: 'b1', hint: '一号坑最前排的高个子士兵', answer: '将军俑' },
                { id: 'b2', hint: '出土时完整的青铜兵器旁', answer: '弩机' }
            ],
            quizzes: [
                { q: '兵马俑的「俑」字是什么意思？', options: ['陶俑', '人偶陪葬品', '士兵', '皇帝的替身'], answer: 1 },
                { q: '目前兵马俑已发掘的三个坑，哪个规模最大？', options: ['一号坑', '二号坑', '三号坑', '一样大'], answer: 0 },
                { q: '为什兵马俑的身高普遍比现代人高？', options: ['古时候人更高', '陶俑夸张艺术', '士兵是从高个子里选的', '测量误差'], answer: 2 }
            ]
        }
    },

    /* ---------- 中山陵（南京）---------- */
    {
        id: 'zhongshanling',
        city: '南京',
        name: '中山陵',
        nameEn: 'Sun Yat-sen Mausoleum',
        markerUrl: '',
        posterUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80',
        lat: 32.0589, lng: 118.8795,
        stamp: { name: '博爱之印', emoji: '🌲', color: '#27ae60' },
        poster: null,
        storyMain: [
            { time: '00:03', text: '三百九十二级台阶，', duration: 2500 },
            { time: '00:06', text: '是从博爱坊到祭堂的全部距离。', duration: 3500 },
            { time: '00:11', text: '走得越慢，听得越清。', duration: 3000 },
            { time: '00:15', text: '先生说：「博爱。」', duration: 2500 },
            { time: '00:19', text: '这两个字，刻在每一块青石板上。', duration: 4000 }
        ],
        storyEgg: [
            { time: '00:02', text: '【彩蛋】中山陵的台阶有一个秘密：', duration: 3500 },
            { time: '00:07', text: '从下往上看，全是台阶，看不到平台。', duration: 4000 },
            { time: '00:13', text: '从上往下看，全是平台，看不到台阶。', duration: 4000 }
        ],
        hunt: {
            markerDesc: '在祭堂和博爱坊各找一枚标记',
            markers: [
                { id: 'z1', hint: '祭堂门上的大字', answer: '博爱' },
                { id: 'z2', hint: '音乐台的白鸽群中', answer: '和平' }
            ],
            quizzes: [
                { q: '中山陵的设计者是著名建筑师？', options: ['吕彦直', '贝聿铭', '梁思成', '杨廷宝'], answer: 0 },
                { q: '中山陵共有多少级台阶？', options: ['392 级', '360 级', '284 级', '400 级'], answer: 0 },
                { q: '「三民主义」是指？', options: ['民族、民权、民生', '民主、自由、平等', '独立、富强、文明', '爱国、敬业、诚信'], answer: 0 }
            ]
        }
    },

    /* ---------- 布达拉宫（拉萨）---------- */
    {
        id: 'budala',
        city: '拉萨',
        name: '布达拉宫',
        nameEn: 'Potala Palace',
        markerUrl: '',
        posterUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1200&q=80',
        lat: 29.6554, lng: 91.1173,
        stamp: { name: '雪域圣宫', emoji: '⛰️', color: '#9b59b6' },
        poster: null,
        storyMain: [
            { time: '00:03', text: '红山之巅的这座宫殿，', duration: 2500 },
            { time: '00:06', text: '已经在这里守望了一千三百多年。', duration: 4000 },
            { time: '00:11', text: '松赞干布为迎娶文成公主，', duration: 3000 },
            { time: '00:15', text: '在此修建了最初的宫殿。', duration: 3000 },
            { time: '00:20', text: '现在你看到的红宫白宫，', duration: 3000 },
            { time: '00:24', text: '是历代达赖喇嘛的灵塔殿。', duration: 4500 }
        ],
        storyEgg: [
            { time: '00:02', text: '【彩蛋】布达拉宫的墙体有多厚？', duration: 3500 },
            { time: '00:07', text: '最厚的地方有 5 米！', duration: 3000 },
            { time: '00:11', text: '而且墙体每年还会用牛奶和白糖重新刷一遍。', duration: 4500 }
        ],
        hunt: {
            markerDesc: '在白宫广场和红宫金顶各找一枚标记',
            markers: [
                { id: 'bd1', hint: '白宫广场的经轮旁', answer: '经轮' },
                { id: 'bd2', hint: '红宫屋顶的金顶下', answer: '金顶' }
            ],
            quizzes: [
                { q: '布达拉宫始建于公元哪一年？', options: ['公元 7 世纪', '公元 10 世纪', '公元 15 世纪', '公元 17 世纪'], answer: 0 },
                { q: '布达拉宫分为哪两大部分？', options: ['红宫和白宫', '东宫和西宫', '上宫和下宫', '金宫和银宫'], answer: 0 },
                { q: '去布达拉宫参观需要提前多久预约？', options: ['当天即可', '提前 1 天', '提前 7 天', '提前 30 天'], answer: 2 }
            ]
        }
    },

    /* ---------- 玉龙雪山（丽江）---------- */
    {
        id: 'yulong',
        city: '丽江',
        name: '玉龙雪山',
        nameEn: 'Jade Dragon Snow Mountain',
        markerUrl: '',
        posterUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        lat: 27.1047, lng: 100.2077,
        stamp: { name: '雪龙之魄', emoji: '🏔️', color: '#2980b9' },
        poster: {
            id: 'lijiang_snow',
            title: '雪龙跃金',
            subtitle: '集齐丽江雪山印记解锁',
            cities: ['丽江', '大理'],
            requiredStamps: ['yulong', 'lijiang_old', 'dali_erhai'],
            bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
            caption: '纳西族的神山，守护滇西千年。'
        },
        storyMain: [
            { time: '00:03', text: '纳西族人称它为「欧鲁」，', duration: 2500 },
            { time: '00:06', text: '意为「银色的山岩」。', duration: 3000 },
            { time: '00:10', text: '十三座雪峰连绵起伏，', duration: 3000 },
            { time: '00:14', text: '像一条银色巨龙横卧云端。', duration: 3500 },
            { time: '00:19', text: '传说中，这里是纳西族保护神「三朵」的化身。', duration: 5000 }
        ],
        storyEgg: [
            { time: '00:02', text: '【彩蛋】玉龙雪山最高峰海拔多少？', duration: 3000 },
            { time: '00:06', text: '5596 米！', duration: 2500 },
            { time: '00:10', text: '但至今还没有人成功登顶过。', duration: 3500 },
            { time: '00:15', text: '纳西族人说：神山不让凡人惊扰。', duration: 4000 }
        ],
        hunt: {
            markerDesc: '在蓝月谷和冰川公园各找一枚标记',
            markers: [
                { id: 'y1', hint: '蓝月谷的水潭中央', answer: '蓝宝石' },
                { id: 'y2', hint: '冰川公园观景台旁', answer: '雪龙' }
            ],
            quizzes: [
                { q: '玉龙雪山主峰的名字是？', options: ['扇子陡', '金字塔峰', '银龙峰', '三朵峰'], answer: 0 },
                { q: '蓝月谷的水为什么是蓝色的？', options: ['湖水含矿物', '倒映天空', '藻类物质', '人工染色'], answer: 0 },
                { q: '纳西族每年什么时候会祭祀玉龙雪山？', options: ['农历二月初八', '农历五月初五', '农历八月十五', '元旦'], answer: 0 }
            ]
        }
    }
];

/* ============ 海报合集（集齐一组印记解锁） ============ */
window.AR_POSTERS = [
    {
        id: 'beijing_palace',
        title: '王者之门',
        subtitle: '集齐北京皇家三印',
        required: ['gugong', 'tiananmen', 'yishanyuan'],
        bg: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1600&q=80',
        caption: '天子脚下，六百年帝王气象。'
    },
    {
        id: 'xian_terracotta',
        title: '地下军团',
        subtitle: '集齐西安历史印记',
        required: ['bingmayong', 'xian_anmen', 'huashan'],
        bg: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1600&q=80',
        caption: '两千年前的沉默军团，静静守望着他们的帝王。'
    },
    {
        id: 'lijiang_snow',
        title: '雪龙跃金',
        subtitle: '集齐滇西雪山印记',
        required: ['yulong', 'lijiang_old', 'dali_erhai'],
        bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80',
        caption: '纳西族的神山，守护滇西千年。'
    }
];

/* ============ 素材替换说明（开发者用） ============
 * markerUrl 字段：填入 MindAR 生成的 .mind 文件 URL
 *   - 去 https://hiukim.github.io/mind-ar-js-doc/tools/compile/ 上传一张景点正面照
 *   - 下载生成的 .mind 文件，放到 /workspace/markers/ 目录
 *   - 填入 markerUrl: 'markers/gugong.mind'
 * posterUrl / bg / 图片 URL：建议下载后放到 /workspace/assets/ 目录
 *   - GitHub Pages 从根目录直接引用
 *   - 在线图片可用 Unsplash 格式
 * storyMain / storyEgg：每段一个 {time, text, duration(ms)} 自动分段播放
 * hunt.markers：AR 模式下的虚拟标记提示，非 AR 模式下转化为线索文字
 * hunt.quizzes：答题，答对一个解锁一个拼图块，全部答对发印记
 * stamp：每个景点的电子印记 {name, emoji, color}
 * poster：一组景点集齐后解锁的纪念海报
 */
