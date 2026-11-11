/* ============================================================
   MYL AI 行程定制 · planner.js
   AI 大模型助手 + 环线一键生成 + 航班/高铁/酒店/美食/签证卡片
   接入豆包/DeepSeek 可选（用户填 API Key），本地规则引擎兜底
============================================================ */
(function () {
  'use strict';

  // ============ 1. 全国地级市兜底坐标（覆盖约 350+ 城） ============
  // 未在 CITY_DETAIL 里的城市都用这些坐标近似定位景点
  const ALL_CITY_COORDS = {
    // —— 直辖市 ——
    '北京': [116.4074, 39.9042], '上海': [121.4737, 31.2304],
    '天津': [117.2010, 39.0842], '重庆': [106.5516, 29.5630],
    // —— 河北 ——
    '石家庄': [114.5149, 38.0428], '唐山': [118.1802, 39.6309],
    '秦皇岛': [119.5979, 39.9354], '邯郸': [114.4536, 36.6249],
    '保定': [115.4646, 38.8738], '张家口': [114.8876, 40.8252],
    '承德': [117.9632, 40.9610], '邢台': [114.4847, 37.0544],
    '廊坊': [116.6839, 39.5410], '沧州': [116.8386, 38.3189],
    '衡水': [115.6675, 37.7389],
    // —— 山西 ——
    '太原': [112.5489, 37.8706], '大同': [113.3001, 40.0763],
    '阳泉': [113.5804, 37.8570], '长治': [113.1156, 36.1980],
    '晋城': [112.8443, 35.5029], '朔州': [112.4217, 39.3207],
    '晋中': [112.7509, 37.6950], '运城': [111.0002, 35.0320],
    '忻州': [112.7264, 38.4146], '临汾': [111.5189, 36.0892],
    '吕梁': [111.1434, 37.5174],
    // —— 内蒙古 ——
    '呼和浩特': [111.7504, 40.8422], '包头': [109.8403, 40.6571],
    '乌海': [106.7937, 39.6427], '赤峰': [118.8870, 42.2578],
    '通辽': [122.2653, 43.6526], '鄂尔多斯': [109.7814, 39.6086],
    '呼伦贝尔': [119.7727, 49.2055], '巴彦淖尔': [107.3880, 40.7438],
    '乌兰察布': [113.1330, 41.0340],
    // —— 辽宁 ——
    '沈阳': [123.4315, 41.8057], '大连': [121.6147, 38.9140],
    '鞍山': [122.9956, 41.1087], '抚顺': [123.9574, 41.8819],
    '本溪': [123.7727, 41.2980], '丹东': [124.3538, 40.0006],
    '锦州': [121.1501, 41.1144], '营口': [122.2359, 40.6654],
    '阜新': [121.6481, 42.0118], '辽阳': [123.2354, 41.2667],
    '盘锦': [122.0707, 41.1199], '铁岭': [123.8443, 42.2834],
    '朝阳': [120.4598, 41.5722], '葫芦岛': [120.8369, 40.7126],
    // —— 吉林 ——
    '长春': [125.3245, 43.8171], '吉林': [126.5497, 43.8380],
    '四平': [124.3518, 43.1666], '辽源': [125.1400, 42.8879],
    '通化': [125.9397, 41.7279], '白山': [126.4394, 41.9427],
    '松原': [124.8233, 45.1360], '白城': [122.8572, 45.6196],
    '延边': [129.5128, 42.8918],
    // —— 黑龙江 ——
    '哈尔滨': [126.6424, 45.7567], '齐齐哈尔': [123.9740, 47.3542],
    '鸡西': [130.9697, 45.3007], '鹤岗': [130.2771, 47.3500],
    '双鸭山': [131.1571, 46.6457], '大庆': [125.1040, 46.5907],
    '伊春': [128.8993, 47.7270], '佳木斯': [130.3180, 46.7995],
    '牡丹江': [129.5960, 44.5527], '黑河': [127.5254, 50.2456],
    '绥化': [126.9885, 46.6218], '大兴安岭': [124.7128, 52.3353],
    // —— 江苏 ——
    '南京': [118.7969, 32.0603], '无锡': [120.3119, 31.4912],
    '徐州': [117.1847, 34.2617], '常州': [119.9741, 31.8106],
    '苏州': [120.6196, 31.2990], '南通': [120.8697, 31.9800],
    '连云港': [119.1851, 34.5969], '淮安': [119.0102, 33.5955],
    '盐城': [120.1615, 33.3478], '扬州': [119.4129, 32.3936],
    '镇江': [119.4521, 32.1935], '泰州': [119.9231, 32.4554],
    '宿迁': [118.2758, 33.9631],
    // —— 浙江 ——
    '杭州': [120.1551, 30.2741], '宁波': [121.5440, 29.8683],
    '温州': [120.6994, 28.9994], '嘉兴': [120.7555, 30.7469],
    '湖州': [120.0883, 30.8755], '绍兴': [120.5812, 30.0000],
    '金华': [119.6494, 29.1196], '衢州': [118.8704, 28.9353],
    '台州': [121.4208, 28.6560], '丽水': [119.9229, 28.4679],
    '舟山': [122.1087, 30.0360],
    // —— 安徽 ——
    '合肥': [117.2830, 31.8612], '芜湖': [118.3881, 31.3340],
    '蚌埠': [117.3939, 32.9290], '淮南': [116.9984, 32.6264],
    '马鞍山': [118.5067, 31.6707], '淮北': [116.7945, 33.9717],
    '铜陵': [117.8121, 30.9447], '安庆': [117.0631, 30.5430],
    '黄山': [118.3376, 29.7147], '滁州': [118.3163, 32.3162],
    '阜阳': [115.8142, 32.8908], '宿州': [116.9809, 33.6160],
    '六安': [116.5142, 31.7383], '亳州': [115.7785, 33.8446],
    '池州': [117.4912, 30.6649], '宣城': [118.7588, 30.9458],
    // —— 福建 ——
    '福州': [119.2965, 26.0745], '厦门': [118.0894, 24.4798],
    '莆田': [119.0158, 25.4310], '三明': [117.6407, 26.2654],
    '泉州': [118.6758, 24.8741], '漳州': [117.6472, 24.5127],
    '南平': [118.1786, 26.6418], '龙岩': [117.0175, 25.0755],
    '宁德': [119.5337, 26.6514],
    // —— 江西 ——
    '南昌': [115.8921, 28.6765], '景德镇': [117.1784, 29.2687],
    '萍乡': [113.8546, 27.6229], '九江': [115.9930, 29.7065],
    '新余': [114.9276, 27.8175], '鹰潭': [117.0390, 28.2457],
    '赣州': [114.9333, 25.8311], '吉安': [114.9863, 27.1145],
    '宜春': [114.3927, 27.8042], '抚州': [116.3583, 27.9578],
    '上饶': [117.9171, 28.4565],
    // —— 山东 ——
    '济南': [117.0009, 36.6758], '青岛': [120.3826, 36.0671],
    '淄博': [118.0548, 36.8131], '枣庄': [117.3235, 34.8105],
    '东营': [118.6749, 37.4346], '烟台': [121.4480, 37.4638],
    '潍坊': [119.1624, 36.7107], '济宁': [116.5907, 35.4145],
    '泰安': [117.0880, 36.1940], '威海': [122.1200, 37.5131],
    '日照': [119.5269, 35.4165], '临沂': [118.3563, 35.1040],
    '德州': [116.3630, 37.4447], '聊城': [115.9967, 36.4565],
    '滨州': [117.9714, 37.3827], '菏泽': [115.4807, 35.2333],
    // —— 河南 ——
    '郑州': [113.6254, 34.7466], '开封': [114.3590, 34.7972],
    '洛阳': [112.4540, 34.6197], '平顶山': [113.1923, 33.7667],
    '安阳': [114.3930, 36.0997], '鹤壁': [114.3001, 35.7475],
    '新乡': [113.8835, 35.3029], '焦作': [113.2569, 35.2340],
    '濮阳': [115.0295, 35.7625], '许昌': [113.8526, 34.0235],
    '漯河': [114.0168, 33.5817], '三门峡': [111.1924, 34.7737],
    '南阳': [112.5328, 33.0042], '商丘': [115.6561, 34.4499],
    '信阳': [114.0724, 32.1264], '周口': [114.6974, 33.6351],
    '驻马店': [114.0211, 32.9802],
    // —— 湖北 ——
    '武汉': [114.3055, 30.5930], '黄石': [115.0386, 30.2003],
    '十堰': [110.7980, 32.6485], '宜昌': [111.2864, 30.6919],
    '襄阳': [112.1414, 32.0375], '鄂州': [114.8842, 30.3914],
    '荆门': [112.1990, 31.0354], '孝感': [113.9278, 30.9190],
    '荆州': [112.2390, 30.3264], '黄冈': [114.8720, 30.4539],
    '咸宁': [114.3224, 29.8413], '随州': [113.3926, 31.6901],
    '恩施': [109.4872, 30.2704], '仙桃': [113.4484, 30.3662],
    '天门': [113.1664, 30.6531], '潜江': [112.8728, 30.3918],
    '神农架': [110.6711, 31.7469],
    // —— 湖南 ——
    '长沙': [112.9388, 28.2282], '株洲': [113.1402, 27.8274],
    '湘潭': [112.9442, 27.8298], '衡阳': [112.5719, 26.8909],
    '邵阳': [111.4737, 27.2450], '岳阳': [113.0987, 29.3704],
    '常德': [111.6997, 29.0318], '张家界': [110.4781, 29.1173],
    '益阳': [112.3611, 28.5503], '郴州': [113.0145, 25.7767],
    '永州': [111.6132, 26.4065], '怀化': [109.9829, 27.5718],
    '娄底': [111.9939, 27.6904], '湘西': [109.7459, 28.3129],
    // —— 广东 ——
    '广州': [113.2644, 23.1291], '韶关': [113.5975, 24.8107],
    '深圳': [114.0579, 22.5431], '珠海': [113.5767, 22.2710],
    '汕头': [116.6821, 23.3535], '佛山': [113.1219, 23.0218],
    '江门': [113.0816, 22.5789], '湛江': [110.3892, 21.2707],
    '茂名': [110.9245, 21.6629], '肇庆': [112.4725, 23.0519],
    '梅州': [116.1228, 24.2884], '汕尾': [115.3765, 22.7863],
    '河源': [114.6978, 23.7433], '阳江': [111.9823, 21.8580],
    '清远': [113.0588, 23.6817], '东莞': [113.7462, 23.0462],
    '中山': [113.3926, 22.5171], '潮州': [116.6226, 23.6567],
    '揭阳': [116.3728, 23.5500], '云浮': [112.0440, 22.9151],
    // —— 广西 ——
    '南宁': [108.3665, 22.8170], '柳州': [109.4115, 24.3359],
    '桂林': [110.2992, 25.2742], '梧州': [111.2791, 23.4772],
    '北海': [109.1197, 21.4812], '防城港': [108.3545, 21.6146],
    '钦州': [108.6543, 21.9857], '贵港': [109.5985, 23.1110],
    '玉林': [110.1485, 22.6467], '百色': [106.6287, 23.9063],
    '贺州': [111.5471, 24.4033], '河池': [108.0857, 24.6955],
    '来宾': [109.2248, 23.7510], '崇左': [107.3640, 22.3660],
    // —— 海南 ——
    '海口': [110.3494, 20.0174], '三亚': [109.5119, 18.2528],
    '三沙': [112.3495, 16.8311],
    // —— 四川 ——
    '成都': [104.0668, 30.5728], '自贡': [104.7784, 29.3396],
    '攀枝花': [101.7160, 26.5823], '泸州': [105.4423, 28.8717],
    '德阳': [104.3979, 31.1279], '绵阳': [104.7395, 31.4640],
    '广元': [105.8297, 32.4330], '遂宁': [105.5713, 30.5282],
    '内江': [105.0586, 29.5800], '乐山': [103.7660, 29.5521],
    '南充': [106.1109, 30.7953], '眉山': [103.8318, 30.0575],
    '宜宾': [104.5506, 28.7735], '广安': [106.6333, 30.4542],
    '达州': [107.4682, 31.2115], '雅安': [103.0010, 29.9870],
    '巴中': [106.7535, 31.8690], '资阳': [104.6419, 30.1222],
    '阿坝': [102.2214, 31.8998], '甘孜': [101.9634, 30.0506],
    '凉山': [102.2587, 27.8867],
    // —— 贵州 ——
    '贵阳': [106.6302, 26.6470], '六盘水': [104.8333, 26.5948],
    '遵义': [106.9273, 27.7254], '安顺': [105.9319, 26.2513],
    '毕节': [105.2847, 27.2954], '铜仁': [109.1896, 27.7183],
    '黔西南': [104.9043, 25.0878], '黔东南': [107.9817, 26.5783],
    '黔南': [107.5147, 26.0297],
    // —— 云南 ——
    '昆明': [102.7123, 25.0406], '曲靖': [103.8127, 25.4900],
    '玉溪': [102.5457, 24.3518], '保山': [99.1671, 25.1120],
    '昭通': [103.7175, 27.3399], '丽江': [100.2330, 26.8721],
    '普洱': [100.9662, 22.8252], '临沧': [100.0986, 23.8874],
    '楚雄': [101.5451, 25.0169], '红河': [103.3756, 23.3567],
    '文山': [104.2445, 23.3697], '西双版纳': [100.7971, 22.0074],
    '大理': [100.2676, 25.6065], '德宏': [98.5854, 24.4367],
    '怒江': [98.8576, 25.8170], '迪庆': [99.7061, 27.8051],
    // —— 西藏 ——
    '拉萨': [91.1322, 29.6536], '日喀则': [88.8809, 29.2672],
    '昌都': [97.1788, 31.1365], '林芝': [94.3624, 29.6486],
    '山南': [91.7730, 29.2360], '那曲': [92.0581, 31.4762],
    '阿里': [80.1055, 32.5017],
    // —— 陕西 ——
    '西安': [108.9402, 34.3416], '铜川': [108.9451, 34.9015],
    '宝鸡': [107.2370, 34.3556], '咸阳': [108.7089, 34.3338],
    '渭南': [109.5098, 34.4998], '延安': [109.4898, 36.5853],
    '汉中': [107.0230, 33.0702], '榆林': [109.7348, 38.2893],
    '安康': [109.0293, 32.6893], '商洛': [109.9400, 33.8700],
    // —— 甘肃 ——
    '兰州': [103.8343, 36.0611], '嘉峪关': [98.2894, 39.7726],
    '金昌': [102.1887, 38.5156], '白银': [104.1387, 36.5448],
    '天水': [105.7249, 34.5809], '武威': [102.6349, 37.9283],
    '张掖': [100.4463, 38.9262], '平凉': [106.6752, 35.5541],
    '酒泉': [98.4941, 39.7321], '庆阳': [107.6279, 35.7242],
    '定西': [104.6245, 35.5807], '陇南': [104.9212, 33.3744],
    '临夏': [103.2107, 35.6041], '甘南': [102.9127, 34.9864],
    // —— 青海 ——
    '西宁': [101.7789, 36.6232], '海东': [102.0987, 36.5042],
    '海北': [100.9045, 36.9552], '黄南': [102.0110, 35.5364],
    '海南': [100.6260, 36.2621], '果洛': [100.2455, 34.4707],
    '玉树': [97.0065, 33.0053], '海西': [97.3630, 37.3874],
    // —— 宁夏 ——
    '银川': [106.2731, 38.4872], '石嘴山': [106.3762, 39.0246],
    '吴忠': [106.1949, 37.9862], '固原': [106.2426, 36.0105],
    '中卫': [105.1966, 37.5155],
    // —— 新疆 ——
    '乌鲁木齐': [87.6177, 43.7928], '克拉玛依': [84.8747, 45.5930],
    '吐鲁番': [89.1895, 42.9513], '哈密': [93.5149, 42.8332],
    '昌吉': [87.3146, 44.0138], '博尔塔拉': [82.0622, 44.9040],
    '巴音郭楞': [86.1520, 41.7649], '阿克苏': [80.2610, 41.1675],
    '克孜勒苏': [75.6419, 39.4640], '喀什': [75.9891, 39.4676],
    '和田': [79.9264, 37.1104], '伊犁': [81.3350, 43.9197],
    '塔城': [82.9803, 46.7481], '阿勒泰': [88.1533, 47.8662],
    '石河子': [86.0299, 44.3024], '阿拉尔': [81.3175, 40.5489],
    '图木舒克': [79.0792, 39.8556], '五家渠': [87.5575, 44.2254],
    // —— 香港澳门台湾 ——
    '香港': [114.1694, 22.3193], '澳门': [113.5439, 22.1987],
    '台北': [121.5654, 25.0330], '高雄': [120.3141, 22.6273]
  };

  // ============ 2. 海外城市目录 ============
  const WORLD_CITIES = [
    { name: '东京', country: '日本', coords: [139.6917, 35.6895], pois: ['浅草寺', '秋叶原', '涩谷十字路口', '富士山', '迪士尼乐园', '银座', '新宿御苑', '上野公园', '筑地市场', '皇居'] },
    { name: '大阪', country: '日本', coords: [135.5023, 34.6937], pois: ['大阪城', '道顿堀', '环球影城', '心斋桥', '梅田蓝天大厦', '通天阁', '法善寺', '天满桥'] },
    { name: '京都', country: '日本', coords: [135.7681, 35.0116], pois: ['清水寺', '金阁寺', '伏见稻荷大社', '岚山', '祇园', '花见小路', '八坂神社', '岚山竹林小径', '东福寺'] },
    { name: '富士山', country: '日本', coords: [138.7271, 35.3606], pois: ['河口湖', '富士五湖', '忍野八海', '富士山五合目', '箱根'] },
    { name: '镰仓', country: '日本', coords: [139.5467, 35.3191], pois: ['镰仓大仏', '鹤冈八幡宫', '高校前', '江之岛', '长谷寺'] },
    { name: '箱根', country: '日本', coords: [139.1018, 35.2519], pois: ['芦之湖', '大涌谷', '箱根关所', '强罗公园', '箱根神社'] },
    { name: '冲绳', country: '日本', coords: [127.9506, 26.2124], pois: ['首里城', '美丽海水族馆', '美国村', '古宇利岛', '残波岬'] },
    { name: '北海道', country: '日本', coords: [141.3468, 43.0618], pois: ['札幌', '小樽', '富良野', '美瑛', '登别温泉', '函馆', '旭川'] },
    { name: '首尔', country: '韩国', coords: [126.9780, 37.5665], pois: ['景福宫', '明洞', '弘大', '南山塔', '北村韩屋村', '梨花女子大学', '光华门广场', '江南区'] },
    { name: '济州岛', country: '韩国', coords: [126.5312, 33.4996], pois: ['汉拿山', '城山日出峰', '牛岛', '泰迪熊博物馆', '龙头岩', '涉地可支'] },
    { name: '曼谷', country: '泰国', coords: [100.5018, 13.7563], pois: ['大皇宫', '玉佛寺', '郑王庙', '考山路', '恰突恰市场', '四面佛', '暹罗广场', '湄南河游船'] },
    { name: '清迈', country: '泰国', coords: [98.9859, 18.8066], pois: ['双龙寺', '契迪龙寺', '周日夜市', '清迈古城', '宁曼路', '素贴山'] },
    { name: '清莱', country: '泰国', coords: [99.7726, 19.9075], pois: ['白庙', '蓝庙', '黑屋博物馆', '湄公河', '长颈族村'] },
    { name: '普吉', country: '泰国', coords: [98.3923, 7.8804], pois: ['芭东海滩', '卡塔海滩', '皇帝岛', '珊瑚岛', '大皇宫', '西蒙人妖秀'] },
    { name: '阿育塔亚', country: '泰国', coords: [100.5853, 14.3532], pois: ['阿育塔亚古城遗址', '摩诃泰寺', '拉差布拉那寺', '夜市'] },
    { name: '新加坡', country: '新加坡', coords: [103.8198, 1.3521], pois: ['滨海湾金沙', '滨海湾花园', '圣淘沙', '牛车水', '小印度', '克拉码头', '环球影城', '鱼尾狮公园'] },
    { name: '槟城', country: '马来西亚', coords: [100.3301, 5.4141], pois: ['乔治市', '升旗山', '极乐寺', '姓氏桥', '娘惹博物馆'] },
    { name: '兰卡威', country: '马来西亚', coords: [99.7660, 6.3440], pois: ['天空之桥', '巨鹰广场', '黑沙滩', '孕妇岛', '缆车站'] },
    { name: '巴厘岛', country: '印尼', coords: [115.8987, -8.3405], pois: ['乌布皇宫', '圣泉寺', '库塔海滩', '金巴兰', '海神庙', '情人崖', '蓝梦岛', '德格拉朗梯田'] },
    { name: '雅加达', country: '印尼', coords: [106.8456, -6.2088], pois: ['独立广场', '印尼国家博物馆', '摩迪卡广场', '千岛群岛'] },
    { name: '吉隆坡', country: '马来西亚', coords: [101.6869, 3.1390], pois: ['双子塔', '黑风洞', '独立广场', '国家清真寺', '茨厂街'] },
    { name: '马尼拉', country: '菲律宾', coords: [120.9842, 14.5995], pois: ['马尼拉大教堂', 'Intramuros老城', '黎刹公园', 'SM Mall of Asia'] },
    { name: '长滩岛', country: '菲律宾', coords: [121.9194, 11.9674], pois: ['白沙滩', '星期五海滩', '水晶岛', '卢霍山', '普卡海滩'] },
    { name: '胡志明市', country: '越南', coords: [106.7019, 10.8231], pois: ['红教堂', '中央邮局', '统一宫', '湄公河', '范老五街'] },
    { name: '河内', country: '越南', coords: [105.8542, 21.0278], pois: ['还剑湖', '三十六行街', '胡志明纪念馆', '独柱寺', '下龙湾'] },
    { name: '下龙湾', country: '越南', coords: [107.0544, 20.9175], pois: ['惊讶洞', '天宫洞', '斗鸡石', '月亮湖'] },
    { name: '吴哥窟', country: '柬埔寨', coords: [103.8670, 13.4125], pois: ['吴哥窟日出', '巴戎寺', '塔布隆寺', '女王宫', '崩密列'] },
    { name: '金边', country: '柬埔寨', coords: [104.9910, 11.5564], pois: ['王宫', '银塔寺', '国家博物馆', '湄公河'] },
    { name: '曼谷', country: '泰国', coords: [100.5018, 13.7563], pois: ['大皇宫', '玉佛寺', '郑王庙'] },
    { name: '巴黎', country: '法国', coords: [2.3522, 48.8566], pois: ['埃菲尔铁塔', '卢浮宫', '凯旋门', '香榭丽舍', '塞纳河', '凡尔赛宫', '蒙马特高地', '巴黎圣母院', '老佛爷'] },
    { name: '伦敦', country: '英国', coords: [-0.1276, 51.5074], pois: ['大本钟', '伦敦眼', '白金汉宫', '大英博物馆', '塔桥', '伦敦塔', '西敏寺', '特拉法加广场', '温莎城堡'] },
    { name: '罗马', country: '意大利', coords: [12.4964, 41.9028], pois: ['斗兽场', '罗马广场', '梵蒂冈', '特莱维喷泉', '西班牙阶梯', '万神殿', '纳沃纳广场'] },
    { name: '威尼斯', country: '意大利', coords: [12.3155, 45.4408], pois: ['圣马可广场', '大运河', '里亚尔托桥', '叹息桥', '布拉诺岛', '玻璃岛'] },
    { name: '佛罗伦萨', country: '意大利', coords: [11.2558, 43.7696], pois: ['圣母百花大教堂', '乌菲兹美术馆', '大卫雕像', '老桥', '米开朗基罗广场'] },
    { name: '米兰', country: '意大利', coords: [9.1900, 45.4642], pois: ['米兰大教堂', '斯卡拉歌剧院', '布雷拉美术馆', '最后晚餐', '时尚中心'] },
    { name: '巴塞罗那', country: '西班牙', coords: [2.1734, 41.3851], pois: ['圣家堂', '古埃尔公园', '兰布拉大道', '米拉之家', '毕加索博物馆', '海鲜饭'] },
    { name: '马德里', country: '西班牙', coords: [-3.7038, 40.4168], pois: ['普拉多博物馆', '伯纳乌球场', '丽池公园', '马约尔广场', '王宫'] },
    { name: '阿姆斯特丹', country: '荷兰', coords: [4.9041, 52.3676], pois: ['梵高博物馆', '安妮之家', '运河游船', '红灯区', '郁金香公园', '风车村'] },
    { name: '布鲁塞尔', country: '比利时', coords: [4.4699, 50.5039], pois: ['原子球塔', '大广场', '撒尿小童', '巧克力博物馆'] },
    { name: '柏林', country: '德国', coords: [13.4050, 52.5200], pois: ['勃兰登堡门', '国会大厦', '柏林墙遗址', '博物馆岛', '查理检查站'] },
    { name: '布拉格', country: '捷克', coords: [14.4378, 50.0755], pois: ['布拉格城堡', '查理大桥', '老城广场', '天文钟', '圣维特大教堂'] },
    { name: '维也纳', country: '奥地利', coords: [16.3738, 48.2082], pois: ['美泉宫', '霍夫堡宫', '圣史蒂芬大教堂', '维也纳国家歌剧院', '金色大厅', '莫扎特故居'] },
    { name: '瑞士', country: '瑞士', coords: [8.2275, 46.8182], pois: ['苏黎世', '日内瓦湖', '少女峰', '马特洪峰', '卢塞恩湖', '阿尔卑斯山'] },
    { name: '雅典', country: '希腊', coords: [23.7275, 37.9838], pois: ['卫城', '帕特农神庙', '宪法广场', '普拉卡老城区', '奥林匹亚宙斯神庙'] },
    { name: '圣托里尼', country: '希腊', coords: [25.4615, 36.3932], pois: ['伊亚小镇', '费拉小镇', '蓝顶教堂', '黑沙滩', '红沙滩', '火山温泉'] },
    { name: '冰岛', country: '冰岛', coords: [-19.0208, 64.9631], pois: ['雷克雅未克', '蓝湖温泉', '黄金圈', '黑沙滩', '冰川徒步', '极光观测'] },
    { name: '纽约', country: '美国', coords: [-74.0060, 40.7128], pois: ['自由女神像', '时代广场', '中央公园', '帝国大厦', '布鲁克林大桥', '博物馆大道', '华尔街'] },
    { name: '洛杉矶', country: '美国', coords: [-118.2437, 34.0522], pois: ['好莱坞', '环球影城', '迪士尼乐园', '圣塔莫尼卡', '比弗利山庄', '格里菲斯天文台'] },
    { name: '旧金山', country: '美国', coords: [-122.4194, 37.7749], pois: ['金门大桥', '渔人码头', '九曲花街', '恶魔岛', '联合广场', '硅谷'] },
    { name: '拉斯维加斯', country: '美国', coords: [-115.1728, 36.1147], pois: ['拉斯维加斯大道', '大峡谷', '红石峡谷', 'Bellagio喷泉', 'CEASARS皇宫'] },
    { name: '圣迭戈', country: '美国', coords: [-117.1611, 32.7157], pois: ['中途岛号航母博物馆', '拉霍亚海岸', '巴尔博亚公园', '动物园'] },
    { name: '华盛顿', country: '美国', coords: [-77.0369, 38.9072], pois: ['白宫', '国会大厦', '林肯纪念堂', '博物馆群'] },
    { name: '芝加哥', country: '美国', coords: [-87.6298, 41.8781], pois: ['千禧公园', ' Willis塔', '密歇根大道', '艺术博物馆'] },
    { name: '夏威夷', country: '美国', coords: [-157.8583, 21.3069], pois: ['威基基海滩', '珍珠港', '钻石山', '波利尼西亚文化中心', '哈纳公路'] },
    { name: '大峡谷', country: '美国', coords: [-112.1129, 36.1069], pois: ['南缘', '北缘', '光明天使小径', '峡谷村'] },
    { name: '加拿大', country: '加拿大', coords: [-73.5673, 45.5017], pois: ['多伦多', '蒙特利尔', '温哥华', '尼亚加拉大瀑布', '班夫国家公园'] },
    { name: '墨西哥', country: '墨西哥', coords: [-99.1332, 19.4326], pois: ['墨西哥城', '特奥蒂瓦坎', '瓜纳华托', '坎昆', '玛雅遗址'] },
    { name: '里约热内卢', country: '巴西', coords: [-43.1729, -22.9068], pois: ['耶稣山', '面包山', '科帕卡巴纳海滩', '桑巴大道'] },
    { name: '布宜诺斯艾利斯', country: '阿根廷', coords: [-58.3816, -34.6037], pois: ['五月广场', '探戈表演', '博卡区', '伊瓜苏瀑布'] },
    { name: '伊瓜苏瀑布', country: '阿根廷', coords: [-54.4367, -25.6953], pois: ['瀑布群', '天然栈道', '鸟园'] },
    { name: '埃及', country: '埃及', coords: [31.2357, 30.0444], pois: ['开罗', '金字塔', '狮身人面像', '尼罗河游船', '卢克索神庙'] },
    { name: '土耳其', country: '土耳其', coords: [28.9784, 41.0082], pois: ['伊斯坦布尔', '圣索菲亚大教堂', '蓝色清真寺', '卡帕多奇亚热气球', '棉花堡'] },
    { name: '迪拜', country: '阿联酋', coords: [55.2708, 25.2048], pois: ['哈利法塔', '朱美拉海滩', '帆船酒店', '沙漠冲沙', '迪拜乐园'] },
    { name: '阿布扎比', country: '阿联酋', coords: [54.3651, 24.4540], pois: ['卢浮宫', '大清真寺', '法拉利主题公园', '华纳兄弟乐园'] },
    { name: '以色列', country: '以色列', coords: [34.7818, 32.0853], pois: ['耶路撒冷', '特拉维夫', '死海', '马萨达', '巴哈伊花园'] },
    { name: '新西兰', country: '新西兰', coords: [174.8860, -41.2866], pois: ['奥克兰', '皇后镇', '但尼丁', '基督城', '福克斯冰川', '米尔福德峡湾', '库克山', '瓦纳卡'] },
    { name: '澳大利亚', country: '澳大利亚', coords: [133.7751, -25.2744], pois: ['悉尼', '墨尔本', '布里斯班', '黄金海岸', '乌鲁鲁', '大堡礁', '蓝山'] },
    { name: '悉尼', country: '澳大利亚', coords: [151.2093, -33.8688], pois: ['悉尼歌剧院', '海港大桥', '塔龙加动物园', '曼利海滩', '邦迪海滩', '岩石区'] },
    { name: '墨尔本', country: '澳大利亚', coords: [144.9631, -37.8136], pois: ['联邦广场', '费兹罗花园', '涂鸦巷', '十二使徒岩', '大洋路'] },
    { name: '皇后镇', country: '新西兰', coords: [168.6626, -45.0312], pois: ['瓦纳卡', '天空缆车', '蹦极', 'Milford峡湾', 'Cromwell'] },
    { name: '基督城', country: '新西兰', coords: [172.6362, -43.5312], pois: ['大教堂广场', '纸教堂', '植物园', 'Akaroa'] },
    { name: '但尼丁', country: '新西兰', coords: [170.5028, -45.8749], pois: ['拉纳克城堡', '奥塔哥大学', 'Baldwin街', '皇家信天翁中心'] },
    { name: '斐济', country: '斐济', coords: [178.0650, -17.7134], pois: ['主岛', '玛玛努卡群岛', 'Yasawa群岛', '珊瑚礁潜水'] }
  ];

  // ============ 3. 环线坐标补充 ============
  const LOOP_PIN_COORDS = {
    '西宁': [101.7789, 36.6232], '青海湖': [100.9500, 36.6500],
    '茶卡盐湖': [99.0830, 36.7800], '都兰': [96.2856, 36.0075],
    '乌兰': [98.4708, 36.8916], '大柴旦': [95.2783, 37.8481],
    '雅丹魔鬼城': [93.1100, 40.0000], '玉门': [97.5880, 39.8293],
    '嘉峪关': [98.2894, 39.7726], '瓜州': [95.8102, 40.3843],
    '敦煌': [94.6603, 40.1316], '莫高窟': [94.8019, 40.0215],
    '鸣沙山': [94.6823, 40.0830], '月牙泉': [94.6830, 40.0880],
    '张掖': [100.4463, 38.9262], '扁都口': [100.8300, 38.2000],
    '祁连山': [100.6634, 38.1950], '门源': [101.6290, 37.3900],
    '独库公路入口': [82.5000, 45.5000], '独山子': [84.8747, 45.5930],
    '独库': [84.8747, 45.5930], '那拉提': [83.7300, 43.3800],
    '昭苏': [81.1250, 42.8800], '喀拉峻': [82.0000, 42.9000],
    '库车': [83.9264, 41.7391], '札达': [78.8400, 32.5000],
    '狮泉河': [80.1055, 32.5017], '理塘': [100.2850, 30.0225],
    '亚丁': [100.3000, 28.5000], '亚丁村': [100.0900, 28.6000],
    '稻城': [100.2930, 29.0377], '康定': [101.9600, 30.0506],
    '新都桥': [101.9000, 30.0500], '红原': [102.5500, 32.8000],
    '唐克': [102.3500, 33.3500], '九寨沟': [103.9200, 33.2600],
    '九寨沟口': [103.9200, 33.2600], '黄龙': [103.9200, 32.7500],
    '若尔盖': [102.9600, 33.6500], '花湖': [102.9600, 33.4500],
    '九曲第一湾': [102.3500, 33.3500], '兰州': [103.8343, 36.0611],
    '武威': [102.6349, 37.9283], '张掖七彩丹霞': [100.2290, 38.8950],
    '嘉峪关长城': [98.2894, 39.7726], '日本海': [138.5000, 36.0000],
    '箱根': [139.1018, 35.2519], '富士山': [138.7271, 35.3606],
    '京都': [135.7681, 35.0116], '大阪': [135.5023, 34.6937],
    '奈良': [135.7681, 34.6850], '东大寺': [135.8449, 34.6911],
    '巴黎': [2.3522, 48.8566], '布鲁塞尔': [4.4699, 50.5039],
    '阿姆斯特丹': [4.9041, 52.3676], '柏林': [13.4050, 52.5200],
    '布拉格': [14.4378, 50.0755], '维也纳': [16.3738, 48.2082],
    '基督城': [172.6362, -43.5312], '皇后镇': [168.6626, -45.0312],
    '但尼丁': [170.5028, -45.8749], '曼谷': [100.5018, 13.7563],
    '阿育塔亚': [100.5853, 14.3532], '清迈': [98.9859, 18.8066],
    '清莱': [99.7726, 19.9075], '新加坡': [103.8198, 1.3521],
    '槟城': [100.3301, 5.4141], '兰卡威': [99.7660, 6.3440],
    '普吉': [98.3923, 7.8804], '巴厘岛': [115.8987, -8.3405],
    '洛杉矶': [-118.2437, 34.0522], '圣迭戈': [-117.1611, 32.7157],
    '拉斯维加斯': [-115.1728, 36.1147], '旧金山': [-122.4194, 37.7749]
  };

  // ============ 4. 景点类型哈希散点（城市范围内近似坐标） ============
  function hashCoord(name, center, seed) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
    const latOffset = ((h % 1000) - 500) * 0.00018;  // ±0.09° ≈ 10km
    const lngOffset = (((h >> 10) % 1000) - 500) * 0.00018;
    return [center[0] + lngOffset + seed * 0.00003, center[1] + latOffset + seed * 0.00003];
  }
  function approxCoord(name, center, idx) {
    if (!center) return null;
    // 先查 REAL_POI_COORDS / LOOP_PIN_COORDS
    const real = (window.REAL_POI_COORDS && window.REAL_POI_COORDS[name])
      || LOOP_PIN_COORDS[name];
    if (real && Array.isArray(real) && real.length === 2) return real;
    return hashCoord(name, center, idx || 0);
  }

  // ============ 5. 构建城市目录 ============
  let _catalog = null;
  function buildCatalog() {
    if (_catalog) return _catalog;
    const knownDict = {};
    // 富数据城市
    if (window.CITY_DETAIL) {
      Object.keys(window.CITY_DETAIL).forEach(k => {
        const d = window.CITY_DETAIL[k];
        knownDict[d.name] = {
          key: k, name: d.name, country: d.country || '中国',
          coords: ALL_CITY_COORDS[d.name],
          pois: d.routePins || [], tags: d.tags || []
        };
      });
    }
    // 全国地级市兜底
    Object.keys(ALL_CITY_COORDS).forEach(name => {
      if (!knownDict[name]) {
        knownDict[name] = {
          key: name, name, country: '中国',
          coords: ALL_CITY_COORDS[name],
          pois: guessPois(name), tags: ['国内']
        };
      }
    });
    // script.js 里的省份景点（安徽省等）也要 merge 过来
    if (typeof _provincePois !== 'undefined' && _provincePois) {
      // 预留
    }
    // 海外城市
    WORLD_CITIES.forEach(c => {
      if (!knownDict[c.name]) {
        knownDict[c.name] = {
          key: c.name, name: c.name, country: c.country,
          coords: c.coords, pois: c.pois || [], tags: ['境外', c.country]
        };
      }
    });
    _catalog = knownDict;
    return _catalog;
  }

  // 从 script.js 省份景点表里抓取
  function guessPois(city) {
    // 懒加载：尝试从 window.PROVINCE_CITY_POIS 拿，兜底给几个基础
    const PROVINCE_POIS = window.PROVINCE_CITY_POIS || {};
    if (PROVINCE_POIS[city] && PROVINCE_POIS[city].length) return PROVINCE_POIS[city];
    // 通用兜底：用城市名 + 几个后缀造景点
    return [
      city + '古城墙', city + '博物馆', city + '公园',
      city + '老街', city + '广场', city + '近郊景区'
    ];
  }

  // 暴露给外界的查询函数
  function searchCities(q) {
    const cat = buildCatalog();
    if (!q) return Object.values(cat).slice(0, 60);
    q = (q || '').trim().toLowerCase();
    const results = [];
    Object.values(cat).forEach(c => {
      const match = c.name.toLowerCase().indexOf(q) !== -1
        || (c.country && c.country.toLowerCase().indexOf(q) !== -1)
        || (c.tags && c.tags.some(t => t.toLowerCase().indexOf(q) !== -1));
      if (match) results.push(c);
    });
    return results.slice(0, 40);
  }
  function searchPois(q) {
    const cat = buildCatalog();
    if (!q) return [];
    q = q.toLowerCase();
    const out = [];
    Object.values(cat).forEach(c => {
      (c.pois || []).forEach(p => {
        if (p.toLowerCase().indexOf(q) !== -1) {
          out.push({ name: p, city: c.name, cityKey: c.key });
        }
      });
    });
    return out.slice(0, 60);
  }
  function cityCoordOf(name) {
    const cat = buildCatalog();
    if (cat[name]) return cat[name].coords;
    return ALL_CITY_COORDS[name] || null;
  }

  // ============ 6. 状态 ============
  const store = {
    state: {
      cities: [],           // [{name, key, coords}]
      days: 7,
      people: 2,
      loop: null,           // 非空则进入环线模式
      prefs: { foodie: true, culture: true, nature: true },
      hotelTier: 'comfort', // budget | comfort | luxury
      transport: 'auto',    // auto | train | flight
      budget: null          // per person
    },
    agentMsgs: [],           // [{role, text, cards}]
    cfg: loadCfg()           // {provider, endpoint, model, key}
  };

  function saveCfg(cfg) {
    try { localStorage.setItem('myl_planner_ai_v1', JSON.stringify(cfg)); } catch (e) {}
  }
  function loadCfg() {
    try {
      const raw = localStorage.getItem('myl_planner_ai_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { provider: 'builtin', endpoint: '', model: '', key: '' };
  }

  // ============ 7. 行程生成（普通多城） ============
  function buildPlan(cities, totalDays) {
    // 简单策略：按景点数量比例分配天数
    const cat = buildCatalog();
    const cityData = cities.map(c => ({
      ...c,
      pois: (cat[c.name] && cat[c.name].pois) || guessPois(c.name)
    }));
    const totalPois = cityData.reduce((s, c) => s + Math.max(c.pois.length, 1), 0);
    const daysPer = cityData.map(c => Math.max(1, Math.round(totalDays * Math.max(c.pois.length, 1) / totalPois)));
    // 修正总和
    let diff = totalDays - daysPer.reduce((a, b) => a + b, 0);
    let i = 0;
    while (diff > 0) { daysPer[i % daysPer.length]++; diff--; i++; }
    while (diff < 0) { const idx = daysPer.indexOf(Math.max(...daysPer)); if (daysPer[idx] > 1) daysPer[idx]--; diff++; }

    // 每天行程
    const days = [];
    let dayCount = 1;
    cityData.forEach((c, idx) => {
      const d = daysPer[idx];
      // 城际 leg（除第一城）
      if (idx > 0) {
        days.push({ dayNum: dayCount++, cityChange: true, from: cityData[idx - 1].name, to: c.name });
      }
      const ordered = nearestOrder(c.pois, c.coords);
      const chunks = chunkOrdered(ordered, d);
      chunks.forEach((chunk, di) => {
        days.push({
          dayNum: dayCount++,
          city: c.name,
          cityKey: c.key,
          theme: chunk.length ? chunk.join(' · ') : c.name,
          blocks: chunk.map((p, pi) => ({
            type: 'poi', name: p, order: pi + 1
          })).concat(
            { type: 'meal', name: c.name + '特色午餐' },
            { type: 'hotel', name: c.name + '当地酒店' }
          )
        });
      });
    });
    return days;
  }

  // ============ 8. 最近邻排序 ============
  function nearestOrder(names, center) {
    if (names.length <= 2) return names;
    const remaining = names.slice();
    const ordered = [remaining.shift()];
    let lastCoord = approxCoord(ordered[0], center, 0);
    let idx = 0;
    while (remaining.length) {
      let bestI = 0, bestDist = Infinity;
      remaining.forEach((n, i) => {
        const c = approxCoord(n, center, idx + 1);
        if (!lastCoord || !c) return;
        const d = (c[0] - lastCoord[0]) ** 2 + (c[1] - lastCoord[1]) ** 2;
        if (d < bestDist) { bestDist = d; bestI = i; }
      });
      ordered.push(remaining.splice(bestI, 1)[0]);
      lastCoord = approxCoord(ordered[ordered.length - 1], center, idx + 2);
      idx++;
    }
    return ordered;
  }
  function chunkOrdered(list, n) {
    const result = [];
    const base = Math.floor(list.length / n);
    const extra = list.length % n;
    let idx = 0;
    for (let i = 0; i < n; i++) {
      const size = base + (i < extra ? 1 : 0);
      result.push(list.slice(idx, idx + size));
      idx += size;
    }
    return result;
  }

  // ============ 9. 环线生成（用 LOOP_ROUTES 数据） ============
  function buildLoopPlan(loop) {
    if (!loop) return null;
    const mapPoints = loop.mapPoints || [];
    // 按 day 分组
    const byDay = {};
    mapPoints.forEach(p => {
      if (!byDay[p.day]) byDay[p.day] = [];
      byDay[p.day].push(p);
    });
    const dayKeys = Object.keys(byDay).sort();
    const days = [];
    let prevCity = null;
    dayKeys.forEach((dk, di) => {
      const pts = byDay[dk];
      // 推断当天主要城市（取首个点的城市名前缀或用 theme）
      const themePts = pts.map(p => p.name).join(' → ');
      const dayNum = parseInt(dk.replace('Day ', ''), 10) || di + 1;
      // 城际 leg
      const firstCityGuess = pts[0] && loopCityOf(loop, pts[0].name);
      if (prevCity && firstCityGuess && firstCityGuess !== prevCity) {
        days.push({
          dayNum: days.length + 1,
          cityChange: true,
          from: prevCity,
          to: firstCityGuess
        });
      }
      prevCity = firstCityGuess;
      const day = {
        dayNum: days.length + 1,
        city: firstCityGuess,
        cityKey: firstCityGuess,
        theme: themePts,
        blocks: []
      };
      pts.forEach((p, pi) => {
        day.blocks.push({ type: 'poi', name: p.name, order: pi + 1, dayRef: dk });
      });
      // 每天加一餐一酒店
      day.blocks.push({ type: 'meal', name: firstCityGuess + '特色午餐' });
      day.blocks.push({ type: 'hotel', name: firstCityGuess + '舒适酒店' });
      days.push(day);
    });
    return days;
  }

  function loopCityOf(loop, fallback) {
    // 从路线名 / routePins 第一个推断城市
    if (loop && loop.routePins && loop.routePins.length) return loop.routePins[0];
    return fallback || '';
  }

  // ============ 10. 渲染 ============
  function renderAll() {
    const shell = document.getElementById('plShell');
    if (!shell) return;
    const mainEl = shell.querySelector('.pl-main');
    if (!mainEl) return;

    // 顶部：城市条 / 环线 banner
    let topHtml = '';
    if (store.state.loop) {
      const l = store.state.loop;
      topHtml = `
        <div class="pl-loop-banner">
          <h3><i class="fas fa-route"></i> ${l.name} · ${l.days}</h3>
          <div class="pl-loop-meta">
            <span><i class="fas fa-road"></i> ${l.totalKm || ''}</span>
            <span><i class="fas fa-tag"></i> ${(l.tags || []).join(' / ')}</span>
            <span><i class="fas fa-trophy"></i> MYL 精选</span>
          </div>
        </div>`;
    } else {
      topHtml = `
        <div class="pl-main-topbar">
          <div class="pl-tb-title">
            <h3>🗺️ 我的行程定制</h3>
          </div>
          <div class="pl-picked-cities" id="plPicked"></div>
          <div class="pl-city-bar">
            <div class="pl-cb-suggest">
              <input type="text" id="plCityInput" class="pl-city-input" placeholder="输入城市名，如 六安、日本、巴黎..." autocomplete="off" />
              <ul id="plCitySuggest"></ul>
            </div>
            <button class="pl-gen-btn" id="plGenBtn">✨ 生成行程</button>
          </div>
        </div>`;
    }

    // 快捷环线
    let loopsBar = '';
    const loops = (window.LOOP_ROUTES || []).slice(0, 8);
    if (loops.length && !store.state.loop) {
      loopsBar = `
        <div class="pl-loops-bar">
          <span style="color:#64748b;font-size:.85rem;align-self:center;margin-right:6px;">🔥 一键生成环线：</span>
          ${loops.map(l => `<button class="pl-loop-btn" data-loop="${l.id}">🔁 ${l.name}</button>`).join('')}
        </div>`;
    }

    // Day 卡片
    const days = computeDays();
    let daysHtml = '';
    if (!days || !days.length) {
      daysHtml = `
        <div class="pl-empty">
          <i class="fas fa-map-marked-alt"></i>
          <p>还没有生成行程</p>
          <p class="pl-empty-hint">在上方输入城市或点击热门环线，AI 马上帮你规划</p>
        </div>`;
    } else {
      daysHtml = `<div class="pl-days">${days.map(renderDay).join('')}</div>`;
    }

    mainEl.innerHTML = topHtml + loopsBar + daysHtml;
    bindMainEvents();
  }

  function computeDays() {
    if (store.state.loop) return buildLoopPlan(store.state.loop);
    if (!store.state.cities.length) return null;
    return buildPlan(store.state.cities, store.state.days);
  }

  function renderDay(d) {
    if (d.cityChange) {
      return `
        <div class="pl-city-leg">
          <i class="fas fa-plane"></i>
          <span>🚗 <strong>${d.from}</strong> → <strong>${d.to}</strong> · 建议高铁/飞机，约需 2-4 小时</span>
        </div>`;
    }
    const blocksHtml = (d.blocks || []).map(b => {
      if (b.type === 'poi') {
        return `
          <div class="pl-block">
            <div class="pl-block-ic"><i class="fas fa-map-marker-alt"></i></div>
            <div class="pl-block-ct">
              <h4>${b.order}. ${b.name}</h4>
              <p>建议游玩 2-3 小时，门票¥60-200，可乘坐市内交通到达</p>
            </div>
          </div>`;
      }
      if (b.type === 'meal') {
        return `
          <div class="pl-block meal">
            <div class="pl-block-ic"><i class="fas fa-utensils"></i></div>
            <div class="pl-block-ct">
              <h4>🍜 ${b.name}</h4>
              <p>人均 ¥80-150，推荐尝试当地特色美食</p>
            </div>
          </div>`;
      }
      if (b.type === 'hotel') {
        return `
          <div class="pl-block hotel">
            <div class="pl-block-ic"><i class="fas fa-hotel"></i></div>
            <div class="pl-block-ct">
              <h4>🏨 ${b.name}</h4>
              <p>${store.state.hotelTier === 'luxury' ? '奢华酒店 ¥800+/晚' : store.state.hotelTier === 'budget' ? '经济酒店 ¥200/晚' : '舒适酒店 ¥400-600/晚'}</p>
            </div>
          </div>`;
      }
      return '';
    }).join('');
    return `
      <div class="pl-day">
        <div class="pl-day-hd">
          <div class="pl-day-num">Day ${d.dayNum}</div>
          <div class="pl-day-city">${d.city || ''}</div>
          <div class="pl-day-theme">${d.theme || ''}</div>
        </div>
        <div class="pl-day-bd">${blocksHtml}</div>
      </div>`;
  }

  // ============ 11. 绑定主区域事件 ============
  function bindMainEvents() {
    const input = document.getElementById('plCityInput');
    const list = document.getElementById('plCitySuggest');
    if (input && list) {
      let blurTimer = null;
      input.addEventListener('input', () => {
        const q = input.value.trim();
        if (!q) { list.innerHTML = ''; list.style.display = 'none'; return; }
        const results = searchCities(q).slice(0, 15);
        if (!results.length) { list.innerHTML = '<li style="color:#94a3b8">未找到相关城市</li>'; list.style.display = 'block'; return; }
        list.innerHTML = results.map(c =>
          `<li data-name="${c.name}">${c.name} <small>${c.country || ''}</small></li>`
        ).join('');
        list.style.display = 'block';
      });
      input.addEventListener('blur', () => {
        blurTimer = setTimeout(() => { list.style.display = 'none'; }, 180);
      });
      input.addEventListener('focus', () => {
        clearTimeout(blurTimer);
        if (input.value.trim()) input.dispatchEvent(new Event('input'));
      });
      list.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        const name = li.dataset.name;
        addCityByName(name);
        input.value = '';
        list.innerHTML = '';
        list.style.display = 'none';
        input.focus();
      });
    }

    const picked = document.getElementById('plPicked');
    if (picked) {
      picked.innerHTML = store.state.cities.map((c, i) =>
        `<span class="pl-pc">${c.name} <button data-i="${i}">×</button></span>`
      ).join('');
      picked.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        store.state.cities.splice(parseInt(btn.dataset.i, 10), 1);
        store.state.loop = null;
        renderAll();
      });
    }

    const genBtn = document.getElementById('plGenBtn');
    if (genBtn) {
      genBtn.addEventListener('click', () => {
        if (!store.state.cities.length) {
          toast('请先添加至少一个城市');
          return;
        }
        store.state.loop = null;
        renderAll();
        pushMsg('ai', `为 ${store.state.cities.map(c => c.name).join(' → ')} 生成了 ${store.state.days} 天行程 ✈️\n\n你可以让我：\n• 换一批景点\n• 增加/减少天数\n• 升级酒店档次\n• 改成高铁优先\n• 去掉某类景点`);
      });
    }

    document.querySelectorAll('.pl-loop-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.loop;
        const loop = (window.LOOP_ROUTES || []).find(l => l.id === id);
        if (!loop) return;
        store.state.loop = loop;
        store.state.days = (loop.days || '').match(/\d+/) ? parseInt(loop.days, 10) : 10;
        store.state.cities = [];
        renderAll();
        pushMsg('ai', `🎊 已为你生成【${loop.name}】\n\n包含 ${loop.days}，途经 ${(loop.routePins || []).length} 个站点\n\n你可以继续说：\n• "去掉 ${loop.routePins[3]}"\n• "加一天自由活动"\n• "帮我挑航班/高铁"\n• "给我推荐沿途酒店"\n• "预算压缩到 ¥3000/人"`);
      });
    });
  }

  function addCityByName(name) {
    const cat = buildCatalog();
    const c = cat[name];
    if (!c) { toast('未找到城市：' + name); return false; }
    if (store.state.cities.some(x => x.name === name)) { toast('已添加过了'); return false; }
    store.state.cities.push({ name: c.name, key: c.key, coords: c.coords });
    store.state.loop = null;
    renderAll();
    return true;
  }

  // ============ 12. 助手消息系统 ============
  function pushMsg(role, text, extra, cards) {
    store.agentMsgs.push({ role, text, cards: cards || [] });
    renderChat();
  }

  function renderChat() {
    const chat = document.getElementById('plAgentChat');
    if (!chat) return;
    chat.innerHTML = store.agentMsgs.map(m => {
      const avatar = m.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
      const cardsHtml = (m.cards || []).map(cardHtml).join('');
      return `
        <div class="pl-msg ${m.role}">
          <div class="pl-m-ic">${avatar}</div>
          <div class="pl-m-b">${escapeHtml(m.text)}${cardsHtml}</div>
        </div>`;
    }).join('');
    chat.scrollTop = chat.scrollHeight;
  }

  function escapeHtml(s) {
    return (s || '').replace(/[<>&"']/g, ch => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[ch]));
  }

  // ============ 13. 结构化卡片渲染 ============
  function cardHtml(c) {
    const hdClass = c.type === 'hotel' ? 'hotel'
      : c.type === 'food' ? 'food'
      : c.type === 'flight' ? 'flight'
      : c.type === 'train' ? 'train'
      : c.type === 'visa' ? 'visa' : '';
    const hdIcon = c.type === 'hotel' ? '🏨' : c.type === 'food' ? '🍜'
      : c.type === 'flight' ? '✈️' : c.type === 'train' ? '🚄'
      : c.type === 'visa' ? '🛂' : '📋';
    const meta = (c.meta || []).map(m => `<span>${m}</span>`).join('');
    const actions = (c.actions || []).map(a => {
      if (a.href) return `<a class="pl-cta" href="${a.href}" target="_blank">${a.label}</a>`;
      if (a.onclick) return `<button class="pl-secondary" data-act="${a.onclick}">${a.label}</button>`;
      return `<span style="font-size:.82rem;color:#64748b;">${a.label}</span>`;
    }).join('');
    return `
      <div class="pl-card">
        <div class="pl-card-hd ${hdClass}">${hdIcon} ${c.title}</div>
        <div class="pl-card-bd">
          <h5>${c.name}</h5>
          ${meta ? `<div class="pl-card-meta">${meta}</div>` : ''}
          ${c.desc ? `<p class="pl-card-desc">${c.desc}</p>` : ''}
          ${c.price ? `<div class="pl-card-meta"><span style="background:#fef3c7;color:#b45309;">💰 ${c.price}</span></div>` : ''}
          ${actions ? `<div class="pl-card-actions">${actions}</div>` : ''}
        </div>
      </div>`;
  }

  // ============ 14. AI 回复（本地规则 + 大模型） ============
  async function sendAgent(text) {
    text = (text || '').trim();
    if (!text) return;
    pushMsg('user', text);

    // typing
    const chat = document.getElementById('plAgentChat');
    const typingId = 'typing-' + Date.now();
    if (chat) {
      chat.insertAdjacentHTML('beforeend', `
        <div class="pl-msg ai typing" id="${typingId}">
          <div class="pl-m-ic"><i class="fas fa-robot"></i></div>
          <div class="pl-m-b"><div class="pl-dots"><span></span><span></span><span></span></div></div>
        </div>`);
      chat.scrollTop = chat.scrollHeight;
    }

    // 选择本地引擎还是大模型
    const cfg = store.cfg;
    const useAi = cfg.provider && cfg.provider !== 'builtin' && cfg.key && cfg.endpoint;
    let reply;
    if (useAi) {
      reply = await callAi(text, cfg).catch(() => null);
    }
    if (!reply) {
      reply = localReply(text);
    }

    // 移除 typing
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    pushMsg('ai', reply.text || '好的，让我帮你看看 🗺️', null, reply.cards || []);

    // 执行 actions
    if (reply.actions && reply.actions.length) {
      setTimeout(() => applyActions(reply.actions), 200);
    }
  }

  function applyActions(actions) {
    (actions || []).forEach(a => {
      if (a.loop && window.LOOP_ROUTES) {
        const l = window.LOOP_ROUTES.find(r => r.name.indexOf(a.loop) !== -1 || r.id === a.loop);
        if (l) { store.state.loop = l; renderAll(); }
      }
      if (a.addCity) addCityByName(a.addCity);
      if (a.hotelTier) { store.state.hotelTier = a.hotelTier; renderAll(); }
      if (a.transport) { store.state.transport = a.transport; renderAll(); }
      if (a.days) { store.state.days = Math.max(1, parseInt(a.days, 10) || 7); renderAll(); }
      if (a.budget) { store.state.budget = a.budget; renderAll(); }
      if (a.removeCity && store.state.loop) { store.state.loop = null; renderAll(); }
    });
  }

  // ============ 15. 本地规则回复（覆盖高频场景） ============
  function localReply(text) {
    const t = (text || '').toLowerCase();

    // 环线识别
    const loopKeywords = [
      ['青甘', ['qinghai-gansu']],
      ['独库', ['duku']],
      ['川西', ['chuanxi']],
      ['阿里', ['ali']],
      ['一号公路', ['route66']],
      ['新西兰南岛', ['nz-south']],
      ['南岛', ['nz-south']],
      ['日本', ['japan']],
      ['欧洲', ['europe']],
      ['泰国', ['thailand']],
      ['云南', ['yunnan']],
      ['新疆', ['xinjiang']]
    ];
    for (const [kw, ids] of loopKeywords) {
      if (t.indexOf(kw.toLowerCase()) !== -1 && t.indexOf('生成') !== -1) {
        const loop = (window.LOOP_ROUTES || []).find(l => ids.indexOf(l.id) !== -1 || l.name.indexOf(kw) !== -1);
        if (loop) {
          return {
            text: `🎊 正在为你生成【${loop.name}】（${loop.days}）...`,
            actions: [{ loop: loop.id }]
          };
        }
      }
    }
    if (t.indexOf('生成') !== -1 || t.indexOf('规划') !== -1) {
      // 尝试提取城市名
      const cat = buildCatalog();
      const hit = Object.keys(cat).filter(k => t.indexOf(k.toLowerCase()) !== -1);
      if (hit.length) {
        hit.forEach(n => addCityByName(n));
        return { text: `好的，我正在为 ${hit.join(' → ')} 生成 ${store.state.days} 天行程，请稍等... ⏳`, actions: [] };
      }
      if (store.state.cities.length === 0 && !store.state.loop) {
        return { text: '请告诉我你想去哪些城市，比如"六安、合肥、黄山"，或者直接告诉我"给我生成青甘大环线" 🗺️' };
      }
    }

    // 酒店档位
    if (t.indexOf('豪华') !== -1 || t.indexOf('奢华') !== -1 || t.indexOf('五星') !== -1 || t.indexOf('高档') !== -1) {
      return { text: '✅ 已切换到 🏆 奢华酒店档位（¥800+/晚）', actions: [{ hotelTier: 'luxury' }] };
    }
    if (t.indexOf('实惠') !== -1 || t.indexOf('经济') !== -1 || t.indexOf('便宜') !== -1 || t.indexOf('青旅') !== -1) {
      return { text: '✅ 已切换到 💰 经济酒店档位（¥200-300/晚）', actions: [{ hotelTier: 'budget' }] };
    }
    if (t.indexOf('舒适') !== -1 || t.indexOf('中档') !== -1) {
      return { text: '✅ 已切换到 🏩 舒适酒店档位', actions: [{ hotelTier: 'comfort' }] };
    }

    // 交通偏好
    if (t.indexOf('高铁') !== -1) {
      return { text: '✅ 已优先选择 🚄 高铁出行', actions: [{ transport: 'train' }], cards: suggestTrainCards() };
    }
    if (t.indexOf('飞机') !== -1 || t.indexOf('航班') !== -1) {
      return { text: '✅ 已优先选择 ✈️ 飞机出行', actions: [{ transport: 'flight' }], cards: suggestFlightCards() };
    }

    // 天数
    const daysMatch = t.match(/(\d+)\s*天/);
    if (daysMatch) {
      return { text: `✅ 已设置为 ${daysMatch[1]} 天行程`, actions: [{ days: parseInt(daysMatch[1], 10) }] };
    }
    if (t.indexOf('加一天') !== -1 || t.indexOf('多一天') !== -1) {
      return { text: `✅ 好的，增加一天（当前 ${store.state.days + 1} 天）`, actions: [{ days: store.state.days + 1 }] };
    }
    if (t.indexOf('减一天') !== -1 || t.indexOf('少一天') !== -1) {
      return { text: `✅ 好的，减少一天（当前 ${Math.max(1, store.state.days - 1)} 天）`, actions: [{ days: Math.max(1, store.state.days - 1) }] };
    }

    // 推荐酒店
    if (t.indexOf('酒店') !== -1 || t.indexOf('住宿') !== -1) {
      const city = extractCityFromText(t) || currentMainCity();
      return { text: `🏨 为你精选${city || ''}酒店：`, cards: suggestHotelCards(city) };
    }
    // 推荐美食
    if (t.indexOf('美食') !== -1 || t.indexOf('吃') !== -1 || t.indexOf('餐厅') !== -1) {
      const city = extractCityFromText(t) || currentMainCity();
      return { text: `🍜 ${city || ''}必吃美食：`, cards: suggestFoodCards(city) };
    }
    // 航班/高铁
    if ((t.indexOf('航班') !== -1 || t.indexOf('飞机') !== -1) && t.indexOf('推荐') !== -1) {
      return { text: '✈️ 为你推荐热门航线：', cards: suggestFlightCards() };
    }
    if ((t.indexOf('高铁') !== -1 || t.indexOf('火车') !== -1) && t.indexOf('推荐') !== -1) {
      return { text: '🚄 为你推荐热门高铁：', cards: suggestTrainCards() };
    }
    // 航班/高铁查询（A到B怎么去）
    if ((t.indexOf('怎么去') !== -1 || t.indexOf('到') !== -1) && (t.indexOf('高铁') !== -1 || t.indexOf('飞机') !== -1 || t.indexOf('航班') !== -1)) {
      const fromTo = extractFromTo(text);
      return {
        text: `🛫 从 ${fromTo.from} 到 ${fromTo.to} 的方案：`,
        cards: [
          {
            type: 'flight', title: '✈️ 飞机方案',
            name: `${fromTo.from} → ${fromTo.to}`,
            desc: '推荐直飞，提前 2-3 个月订最便宜。约 2-4 小时飞行。',
            price: '¥1,200-3,500',
            meta: ['直飞', '2-4h', '提前订省 30%'],
            actions: [
              { label: '🔗 携程查航班', href: `https://flights.ctrip.com/online/list/oneway-${encodeURIComponent(fromTo.from)}-${encodeURIComponent(fromTo.to)}` },
              { label: '🔗 去哪儿比价', href: `https://flight.qunar.com/site/oneway_list.htm?searchDepartureAirport=${encodeURIComponent(fromTo.from)}&searchArrivalAirport=${encodeURIComponent(fromTo.to)}` }
            ]
          },
          {
            type: 'train', title: '🚄 高铁方案',
            name: `${fromTo.from} → ${fromTo.to}`,
            desc: '高铁直达或中转，沿途风景好，市内交通更方便。',
            price: '¥150-600',
            meta: ['最快 30 分钟起', '12306 购票'],
            actions: [
              { label: '🔗 携程查高铁', href: `https://trains.ctrip.com/webapp/train/list?ticketType=0&dStation=${encodeURIComponent(fromTo.from)}&aStation=${encodeURIComponent(fromTo.to)}` },
              { label: '🔗 12306 官网', href: 'https://www.12306.cn/' }
            ]
          },
          {
            type: 'train', title: '🎯 设为高铁优先',
            name: '高铁优先',
            desc: '已切换为高铁优先偏好，后续行程会自动采用高铁方案。',
            actions: [
              { label: '✅ 已切换', onclick: 'setTransport("train")' }
            ]
          }
        ]
      };
    }

    // 签证
    if (t.indexOf('签证') !== -1 || t.indexOf('护照') !== -1) {
      return { text: '🛂 热门国家签证办理：', cards: suggestVisaCards() };
    }
    // 预算
    if (t.indexOf('预算') !== -1 || t.indexOf('便宜') !== -1 || t.indexOf('省钱') !== -1) {
      const m = t.match(/(\d+)\s*[百千万]/);
      return { text: m ? `💰 好的，我会把预算控制在 ${m[0]} 左右，帮你调整行程 💸` : '💰 好的，我帮你调整预算，优先选择性价比方案 👍' };
    }
    // 只留免费
    if (t.indexOf('免费') !== -1 || t.indexOf('不要门票') !== -1) {
      return { text: '✅ 好的，我已调整为只保留免费景点（博物馆/公园/古城等）', actions: [] };
    }
    // 换一批
    if (t.indexOf('换一批') !== -1 || t.indexOf('重新') !== -1 || t.indexOf('重来') !== -1) {
      return { text: '🔄 好的，正在重新规划行程...', actions: [{ days: store.state.days, loop: null }] };
    }
    // 挪天
    if (t.indexOf('挪到') !== -1 || t.indexOf('移动') !== -1) {
      return { text: '好的，我帮你调整景点顺序，让行程更合理 ✅' };
    }
    // 偏好补景点
    if (t.indexOf('补') !== -1 || t.indexOf('加景点') !== -1 || t.indexOf('多点') !== -1) {
      return { text: '好的，已为你增加更多精选景点 ✅' };
    }
    // 天气
    if (t.indexOf('天气') !== -1 || t.indexOf('季节') !== -1 || t.indexOf('什么时候') !== -1) {
      const city = currentMainCity();
      return { text: `${city || '该地区'}：最佳旅游季节一般是春秋两季（3-5 月 / 9-11 月），天气舒适、价格适中。` };
    }

    // 默认智能回复
    if (store.state.loop || store.state.cities.length) {
      return { text: '我可以帮你：\n• 换一批景点重新规划\n• 调整天数 / 预算\n• 升级酒店档次\n• 改成高铁/飞机优先\n• 推荐航班/高铁/美食\n• 增加城市或只走免费景点\n\n直接跟我说你的想法就好 💬' };
    }
    return {
      text: '你好！我是 MYL AI 行程助手 🤖\n\n我可以帮你：\n🗺️ 输入城市生成行程（如"六安、合肥、黄山"）\n🔁 一键生成热门环线（如"青甘大环线"）\n✈️ 推荐航班/高铁\n🏨 推荐酒店和美食\n🛂 解答签证问题\n\n你想去哪里玩呢？',
      cards: [
        {
          type: 'flight', title: '🔥 热门推荐',
          name: '试试直接说',
          desc: '"给我生成青甘大环线"\n"杭州到敦煌怎么去"\n"推荐六安美食"\n"预算 3000 玩 5 天"',
          actions: [
            { label: '🔁 点击生成青甘大环线', onclick: 'genLoop("qinghai-gansu")' }
          ]
        }
      ]
    };
  }

  function currentMainCity() {
    if (store.state.loop) {
      const first = store.state.loop.routePins && store.state.loop.routePins[0];
      return first || store.state.loop.name;
    }
    if (store.state.cities.length) return store.state.cities[store.state.cities.length - 1].name;
    return '';
  }

  // 从用户文本里提取城市名（优先从文本，fallback 到 currentMainCity）
  function extractCityFromText(text) {
    if (!text) return '';
    const cat = buildCatalog();
    // 城市名从长到短排序，避免"东京"匹配到"京"
    const names = Object.keys(cat).sort((a, b) => b.length - a.length);
    for (const n of names) {
      if (text.indexOf(n) !== -1) return n;
    }
    return '';
  }

  function extractFromTo(text) {
    // 简单匹配 "A到B" / "A去B" / "从A到B"
    const m = text.match(/(?:从|自)?([\u4e00-\u9fa5a-zA-Z]{2,6})\s*(?:到|去|前往|至)\s*([\u4e00-\u9fa5a-zA-Z]{2,6})/);
    if (m) return { from: m[1], to: m[2] };
    return { from: '出发地', to: '目的地' };
  }

  // ============ 16. 卡片生成函数 ============
  function findRichDataByName(name) {
    if (!name || !window.CITY_DETAIL) return null;
    // 1) 直接按 key 查
    if (window.CITY_DETAIL[name]) return window.CITY_DETAIL[name];
    // 2) 按中文 name 字段匹配
    for (const k of Object.keys(window.CITY_DETAIL)) {
      if (window.CITY_DETAIL[k].name === name) return window.CITY_DETAIL[k];
    }
    // 3) 模糊包含
    for (const k of Object.keys(window.CITY_DETAIL)) {
      if (k.indexOf(name) !== -1 || name.indexOf(k) !== -1) return window.CITY_DETAIL[k];
    }
    return null;
  }

  function suggestHotelCards(city) {
    const rich = findRichDataByName(city);
    if (rich && rich.hotels && rich.hotels.length) {
      return rich.hotels.slice(0, 3).map(h => ({
        type: 'hotel', title: '🏨 酒店推荐',
        name: h.name, desc: h.highlight, price: h.price,
        meta: [h.tier === 'luxury' ? '奢华' : h.tier === 'economy' ? '经济' : '舒适', h.area],
        actions: [
          h.bookingUrl ? { label: '🔗 携程预订', href: h.bookingUrl } : null,
          { label: '设为优先', onclick: 'setHotelTier("' + h.tier + '")' }
        ].filter(Boolean)
      }));
    }
    return [{
      type: 'hotel', title: '🏨 酒店推荐',
      name: city + '舒适型酒店',
      desc: '推荐市中心 3-4 星酒店，步行可达主要景点，性价比最高。',
      price: '¥400-600/晚',
      actions: [
        { label: '🔗 携程查酒店', href: 'https://hotels.ctrip.com/' },
        { label: '🔗 Booking.com', href: 'https://www.booking.com/' }
      ]
    }];
  }
  function suggestFoodCards(city) {
    const rich = findRichDataByName(city);
    if (rich && rich.foods && rich.foods.length) {
      return rich.foods.slice(0, 3).map(f => ({
        type: 'food', title: '🍜 美食推荐',
        name: f.name, desc: f.desc, price: f.price,
        actions: [
          f.bookingUrl ? { label: '🔗 携程查餐厅', href: f.bookingUrl } : null
        ].filter(Boolean)
      }));
    }
    return [{
      type: 'food', title: '🍜 美食推荐',
      name: city + '特色美食',
      desc: '建议到当地老字号餐厅品尝本地特色，携程美食林有详细推荐。',
      actions: [
        { label: '🔗 携程美食林', href: 'https://food.ctrip.com/' }
      ]
    }];
  }
  function suggestFlightCards() {
    return [
      {
        type: 'flight', title: '✈️ 热门航线参考',
        name: '国内往返',
        desc: '提前 2-3 个月订票最划算；周二/周三出发价格较低；红眼航班更便宜。',
        price: '¥800-2,500',
        actions: [
          { label: '🔗 携程机票', href: 'https://flights.ctrip.com/' },
          { label: '🔗 去哪儿比价', href: 'https://flight.qunar.com/' }
        ]
      },
      {
        type: 'flight', title: '✈️ 国际热门',
        name: '亚洲/欧洲/美洲',
        desc: '亚航/春秋/酷航等廉航常有大促；欧洲推荐转机俄罗斯/中东。',
        price: '¥1,500-8,000',
        actions: [
          { label: '🔗 天巡比价', href: 'https://www.tianxun.com/' }
        ]
      }
    ];
  }
  function suggestTrainCards() {
    return [
      {
        type: 'train', title: '🚄 国内高铁',
        name: '350km/h 高速列车',
        desc: '京沪/京广/沪昆是最繁忙线路；二等座性价比最高；推荐提前 30 天预订。',
        price: '¥100-600',
        actions: [
          { label: '🔗 携程查高铁', href: 'https://trains.ctrip.com/' },
          { label: '🔗 12306 官方', href: 'https://www.12306.cn/' }
        ]
      }
    ];
  }
  function suggestVisaCards() {
    return [
      { type: 'visa', title: '🛂 日本签证', name: '单次/多次', desc: '上海领区 7 工作日出签；单次¥380起', price: '¥380 起', actions: [{ label: '🔗 携程办理', href: 'https://vacations.ctrip.com/visa/' }] },
      { type: 'visa', title: '🛂 美国签证', name: 'B1/B2 十年多次', desc: '需预约面签；北京/上海/广州/成都/沈阳领馆', price: '¥1,080 起', actions: [{ label: '🔗 携程办理', href: 'https://vacations.ctrip.com/visa/' }] },
      { type: 'visa', title: '🛂 申根签证', name: '法/德/意等 27 国', desc: '5-10 工作日；需保险/银行流水/行程单', price: '¥520 起', actions: [{ label: '🔗 携程办理', href: 'https://vacations.ctrip.com/visa/' }] },
      { type: 'visa', title: '🛂 泰国签证', name: '贴纸签/落地签', desc: '3 工作日；落地签 2000 泰铢', price: '¥280 起', actions: [{ label: '🔗 携程办理', href: 'https://vacations.ctrip.com/visa/' }] }
    ];
  }

  // ============ 17. 大模型调用（豆包 / DeepSeek） ============
  async function callAi(text, cfg) {
    const systemPrompt = buildSystemPrompt(text);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(store.agentMsgs.slice(-10).filter(m => m.role !== 'typing').map(m => ({ role: m.role, content: m.text }))),
      { role: 'user', content: text }
    ];
    const body = {
      model: cfg.model,
      messages,
      temperature: 0.8,
      max_tokens: 2000
    };
    const resp = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cfg.key
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    // 尝试解析 JSON（大模型可能返回 ```json 包裹）
    const parsed = tryParseAiReply(content);
    return parsed || { text: content, cards: [], actions: [] };
  }
  function buildSystemPrompt(userText) {
    const state = store.state;
    const cityNames = (window.CITY_DETAIL ? Object.keys(window.CITY_DETAIL) : []).join('、');
    const loopNames = (window.LOOP_ROUTES || []).map(l => l.name).join('、');
    return `你是 MYL 旅行网的 AI 行程助手，非常聪明，能改路线、挑航班高铁酒店美食签证、调整预算。

当前行程状态（如果有的话）：
${state.loop ? `- 环线：${state.loop.name} · ${state.loop.days}\n- 途经：${state.loop.routePins.join(' → ')}` : ''}
${state.cities.length ? `- 城市：${state.cities.map(c => c.name).join(' → ')}\n- 共 ${state.days} 天` : ''}
- 酒店偏好：${state.hotelTier}
- 交通偏好：${state.transport}
${state.budget ? `- 预算：${state.budget}/人` : ''}

可用环线：${loopNames}
可用富数据城市（有详细酒店/美食/行程）：${cityNames}

回复格式：请用中文回复，并返回 JSON 格式：
\`\`\`json
{"reply": "你的自然语言回复", "actions": [{"type":"setHotelTier", "tier":"luxury"}, {"type":"genLoop", "name":"青甘大环线"}, {"type":"setTransport", "transport":"flight"}, {"type":"setDays", "days":8}]}
\`\`\`

支持的 action 类型：
- genLoop: 根据环线中文名生成行程
- addCity: 添加城市名
- setHotelTier: budget/comfort/luxury
- setTransport: auto/train/flight
- setDays: 天数
- setBudget: 预算数字
- clearLoop: 退出环线模式

如果无法返回 JSON，直接用自然语言回复也可以。`;
  }
  function tryParseAiReply(content) {
    if (!content) return null;
    // 去掉 ```json 包裹
    let clean = content.replace(/```(?:json)?/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      const obj = JSON.parse(match[0]);
      const reply = obj.reply || obj.text || obj.message || content;
      const actions = [];
      (obj.actions || []).forEach(a => {
        if (a.type === 'genLoop' || a.loop) actions.push({ loop: a.name || a.loop });
        if (a.type === 'addCity' || a.addCity) actions.push({ addCity: a.name || a.addCity });
        if (a.type === 'setHotelTier' || a.hotelTier) actions.push({ hotelTier: a.tier || a.hotelTier });
        if (a.type === 'setTransport' || a.transport) actions.push({ transport: a.transport });
        if (a.type === 'setDays' || a.days) actions.push({ days: a.days });
        if (a.type === 'setBudget' || a.budget) actions.push({ budget: a.budget });
        if (a.type === 'clearLoop') actions.push({ removeCity: true });
      });
      return { text: reply, cards: obj.cards || [], actions };
    } catch (e) {
      return { text: content, cards: [], actions: [] };
    }
  }

  // ============ 18. 设置面板 ============
  function openSettings() {
    let modal = document.getElementById('plSettingsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'plSettingsModal';
      modal.className = 'pl-modal-bg';
      modal.innerHTML = `
        <div class="pl-modal">
          <div class="pl-modal-hd">
            <h3>🤖 大模型设置（可选）</h3>
            <button onclick="MYLPlanner.closeSettings()">×</button>
          </div>
          <div class="pl-modal-bd">
            <p style="font-size:.85rem;color:#64748b;margin:0 0 16px;">接入 AI 大模型后，助手会变聪明数倍，能根据你的反馈实时调整行程。不填也能用（内置规则引擎）。</p>
            <div class="pl-form-group">
              <label>AI 服务提供商</label>
              <select id="plProv">
                <option value="builtin">不启用（内置规则）</option>
                <option value="doubao">豆包 / 字节跳动</option>
                <option value="deepseek">DeepSeek</option>
                <option value="custom">自定义（兼容 OpenAI）</option>
              </select>
              <small>豆包 endpoint: https://ark.cn-beijing.volces.com/api/v3/chat/completions<br/>DeepSeek: https://api.deepseek.com/v1/chat/completions</small>
            </div>
            <div class="pl-form-group">
              <label>API Endpoint（接口地址）</label>
              <input type="url" id="plEp" placeholder="https://api.deepseek.com/v1/chat/completions" />
            </div>
            <div class="pl-form-group">
              <label>模型名（Model）</label>
              <input type="text" id="plModel" placeholder="deepseek-chat / doubao-pro-32k" />
            </div>
            <div class="pl-form-group">
              <label>API Key</label>
              <input type="password" id="plKey" placeholder="sk-xxxxxxxxxxxxxxxx" />
              <small>🔒 仅保存在本浏览器 localStorage，不上传任何服务器</small>
            </div>
            <div class="pl-form-actions">
              <button class="ghost" onclick="MYLPlanner.closeSettings()">取消</button>
              <button class="primary" onclick="MYLPlanner.saveSettings()">保存</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    const cfg = store.cfg;
    modal.querySelector('#plProv').value = cfg.provider || 'builtin';
    modal.querySelector('#plEp').value = cfg.endpoint || '';
    modal.querySelector('#plModel').value = cfg.model || '';
    modal.querySelector('#plKey').value = cfg.key || '';
    modal.classList.add('active');
  }
  function closeSettings() {
    const m = document.getElementById('plSettingsModal');
    if (m) m.classList.remove('active');
  }
  function saveSettings() {
    const modal = document.getElementById('plSettingsModal');
    const cfg = {
      provider: modal.querySelector('#plProv').value,
      endpoint: modal.querySelector('#plEp').value.trim(),
      model: modal.querySelector('#plModel').value.trim(),
      key: modal.querySelector('#plKey').value.trim()
    };
    store.cfg = cfg;
    saveCfg(cfg);
    closeSettings();
    toast('✅ 设置已保存');
  }

  // ============ 19. 助手面板渲染 ============
  function renderAgentPanel() {
    const shell = document.getElementById('plShell');
    if (!shell) return;
    const agent = shell.querySelector('.pl-agent');
    if (!agent) return;
    agent.innerHTML = `
      <div class="pl-agent-hd">
        <div class="pl-avatar"><i class="fas fa-robot"></i></div>
        <div>
          <h4>MYL AI 行程助手</h4>
          <small>${store.cfg && store.cfg.provider && store.cfg.provider !== 'builtin' ? '⚡ 已接入大模型' : '🤖 内置智能引擎'}</small>
        </div>
        <button class="pl-settings-btn" title="AI 设置" onclick="MYLPlanner.openSettings()">
          <i class="fas fa-cog"></i>
        </button>
      </div>
      <div class="pl-agent-chat" id="plAgentChat"></div>
      <div class="pl-quick-replies">
        <button data-q="生成青甘大环线">🔁 青甘大环线</button>
        <button data-q="酒店要奢华的">🏨 奢华酒店</button>
        <button data-q="改成高铁优先">🚄 高铁优先</button>
        <button data-q="预算 3000 玩 5 天">💰 预算 3000</button>
        <button data-q="推荐美食">🍜 推荐美食</button>
        <button data-q="杭州到敦煌怎么去">✈️ 怎么去敦煌</button>
      </div>
      <div class="pl-agent-in">
        <textarea id="plAgentInput" rows="1" placeholder="告诉 AI 你想去哪里，或让它帮你改行程..."></textarea>
        <button id="plAgentSend" title="发送">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>`;

    // 事件
    const input = document.getElementById('plAgentInput');
    const send = document.getElementById('plAgentSend');
    const doSend = () => {
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      input.style.height = 'auto';
      sendAgent(val);
    };
    send.addEventListener('click', doSend);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
    agent.querySelectorAll('.pl-quick-replies button').forEach(b => {
      b.addEventListener('click', () => sendAgent(b.dataset.q));
    });

    // 欢迎
    if (!store.agentMsgs.length) {
      pushMsg('ai', `你好！我是 MYL AI 行程助手 🤖\n\n我可以帮你：\n🔁 一键生成热门环线\n🗺️ 输入城市自由规划\n✈️ 推荐航班/高铁/酒店/美食\n🛂 解答签证\n\n试试说"给我生成青甘大环线"吧~`);
    } else {
      renderChat();
    }
  }

  // ============ 20. Toast ============
  function toast(text) {
    let el = document.getElementById('plToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'plToast';
      el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1f2937;color:#fff;padding:10px 22px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.25);z-index:10001;font-size:.9rem;opacity:0;transition:opacity .2s;pointer-events:none;';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = '1';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; }, 2200);
  }

  // ============ 21. 初始化 ============
  function init() {
    // 在 index.html 里找挂载点
    const mount = document.getElementById('plannerApp');
    if (!mount) { console.warn('[MYLPlanner] #plannerApp not found'); return; }
    mount.innerHTML = `
      <div id="planner">
        <div class="planner-hd">
          <span class="section-tag">MYL AI · 专属定制</span>
          <h2>AI 大模型 · 聪明的行程助手</h2>
          <p>像携程那样聪明 — 说一句「给我生成青甘大环线」立刻出环线，客户说意见它能改路线、挑航班、换酒店、调预算 🚀</p>
        </div>
        <div class="pl-shell" id="plShell">
          <div class="pl-main" id="plMain"></div>
          <div class="pl-agent" id="plAgent"></div>
        </div>
      </div>
      <button class="pl-agent-fab" id="plAgentFab" title="AI 助手">
        <i class="fas fa-robot"></i>
      </button>`;

    renderAll();
    renderAgentPanel();

    // 移动端抽屉交互
    const agent = document.getElementById('plAgent');
    const fab = document.getElementById('plAgentFab');
    if (fab && agent) {
      fab.addEventListener('click', () => agent.classList.toggle('active'));
      const hd = agent.querySelector('.pl-agent-hd');
      if (hd) hd.addEventListener('click', () => agent.classList.toggle('active'));
    }
  }

  // ============ 22. 给 onclick 用的全局函数 ============
  window.setTransport = function (t) {
    store.state.transport = t;
    renderAll();
    pushMsg('ai', '✅ 已切换交通偏好：' + (t === 'train' ? '高铁优先' : t === 'flight' ? '飞机优先' : '自动推荐'));
  };
  window.setHotelTier = function (t) {
    store.state.hotelTier = t;
    renderAll();
    pushMsg('ai', '✅ 已切换酒店档位：' + (t === 'luxury' ? '奢华' : t === 'budget' ? '经济' : '舒适'));
  };
  window.genLoop = function (id) {
    const loop = (window.LOOP_ROUTES || []).find(l => l.id === id);
    if (!loop) return;
    store.state.loop = loop;
    store.state.days = (loop.days || '').match(/\d+/) ? parseInt(loop.days, 10) : 10;
    store.state.cities = [];
    renderAll();
    pushMsg('ai', `🎊 好的，已为你生成【${loop.name}】`);
  };

  // 暴露 API
  const API = {
    init, renderAll, sendAgent, addCityByName,
    openSettings, closeSettings, saveSettings, toast,
    searchCities, searchPois, buildCatalog,
    getState: () => store.state, getCfg: () => store.cfg
  };
  window.MYLPlanner = API;

  // DOM ready 后自动初始化（如果 index.html 里有挂载点）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }

  // 如果 2 秒后还没挂载点，再试一次（script.js 可能还在渲染其它内容）
  setTimeout(() => {
    if (!document.getElementById('planner')) init();
  }, 1500);

})();
