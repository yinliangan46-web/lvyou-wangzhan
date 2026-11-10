// Fix v2: smarter fix - change old 返程 to 游玩, new last day = 返程
const fs = require('fs');

const content = fs.readFileSync('city-data.js', 'utf8');
const sandbox = { window: {} };
const vm = require('vm');
vm.runInNewContext(content, sandbox);
const data = sandbox.window.CITY_DETAIL;

// 国内城市 Day N-1 应该有的主题（替代原来的"返程"）
const domesticDayN1Themes = {
  // 按城市名给特色主题
  "北京": "颐和园·圆明园·鸟巢",
  "上海": "陆家嘴·上海中心·外滩夜游",
  "成都": "大熊猫繁育研究基地·宽窄巷子",
  "桂林": "漓江精华游·阳朔西街",
  "西安": "华清池·兵马俑·回民街",
  "重庆": "武隆天坑·磁器口古镇",
  "三亚": "亚龙湾·蜈支洲岛",
  "丽江": "玉龙雪山·蓝月谷",
  "杭州": "西溪湿地·宋城千古情",
  "苏州": "拙政园·周庄古镇",
  "长沙": "张家界森林公园·天门山",
  "大理": "苍山·双廊古镇",
  "拉萨": "纳木错·羊卓雍措",
  "敦煌": "莫高窟·雅丹魔鬼城",
  "黄山": "黄山日出·宏村",
  "九寨沟": "九寨沟深度游",
  "昆明": "石林风景区·九乡溶洞",
  "贵阳": "黄果树瀑布·千户苗寨",
  "哈尔滨": "雪乡·冰雪大世界",
  "西宁": "青海湖·茶卡盐湖",
  "乌鲁木齐": "天山天池·喀纳斯",
  "西双版纳": "野象谷·望天树",
  "张家界": "天门山·玻璃栈道",
  "厦门": "鼓浪屿·火山岛"
};

const internationalDayN1Themes = {
  "东京": "迪士尼乐园·台场",
  "伦敦": "温莎城堡·巨石阵",
  "迪拜": "哈利法塔·迪拜Mall疯狂购物",
  "曼谷": "大皇宫·四面佛·夜市",
  "巴厘岛": "乌布梯田·海神庙日落",
  "香港": "迪士尼·维多利亚港夜景",
  "巴黎": "凡尔赛宫·塞纳河游船",
  "罗马": "梵蒂冈·斗兽场"
};

// 通用 Day N-1 theme
const genericThemesDomestic = [
  "深度游玩·周边一日游", "自由活动·随心漫游", 
  "城市漫步·摄影打卡", "特色体验·文化探索"
];
const genericThemesIntl = [
  "深度游玩·周边一日游", "自由活动·随心购物",
  "城市漫步·摄影打卡", "特色体验·文化探索"
];

// Day N-1 timeline 模板（原来返程日应该是游玩日）
const dayN1TimelineDomestic = [
  { time: '08:00', activity: '酒店早餐', detail: '饱吃一顿为一天的游玩打好基础', duration: '1小时' },
  { time: '09:30', activity: '景区深度游览', detail: '前往核心景区，避开人流高峰', duration: '4小时', ticket: '¥100-300', tip: '建议提前线上购票' },
  { time: '12:00', activity: '景区内午餐', detail: '在景区附近吃当地特色', duration: '1小时' },
  { time: '13:30', activity: '下午自由活动', detail: '周边商圈逛街、拍照、自由体验', duration: '3小时' },
  { time: '17:00', activity: '晚餐', detail: '最后一次品尝当地特色美食', duration: '1.5小时' },
  { time: '19:00', activity: '返回酒店休息', detail: '收拾行李，准备明天返程', duration: '自由时间', tip: '早睡早起' }
];

const dayN1TimelineIntl = [
  { time: '08:00', activity: '酒店早餐', detail: '饱吃一顿为最后一天打好基础', duration: '1小时' },
  { time: '09:30', activity: '经典景区游览', detail: '前往必打卡景点，拍照留念', duration: '4小时', ticket: '¥100-500', tip: '遵守当地文化习俗' },
  { time: '12:00', activity: '当地特色午餐', detail: '在景区附近吃地道美食', duration: '1小时' },
  { time: '13:30', activity: '购物时间', detail: '在免税店或特产店购买伴手礼', duration: '3小时', tip: '注意退税政策' },
  { time: '17:00', activity: '告别晚宴', detail: '吃一顿最特别的当地料理', duration: '1.5小时' },
  { time: '19:00', activity: '返回酒店', detail: '整理行李，早点休息', duration: '自由时间', tip: '国际航班建议提前4小时' }
];

// Day N（真正返程）模板
const finalDayTimelineDomestic = [
  { time: '07:30', activity: '起床·整理行李', detail: '最后检查行李，不要遗漏贵重物品', duration: '30分钟', tip: '护照/证件随身带' },
  { time: '08:00', activity: '酒店早餐', detail: '如果赶早航班/高铁可以请酒店打包', duration: '30分钟' },
  { time: '09:00', activity: '退房', detail: '办理退房手续，行李寄存或带走', duration: '15分钟' },
  { time: '09:30', activity: '前往机场/火车站', detail: '打车/地铁/机场大巴，提前3小时到机场/1小时到高铁站', duration: '1-3小时', tip: '早高峰注意路况' },
  { time: '12:00-14:00', activity: '值机·安检', detail: '办理登机牌，过安检，到候机/候车厅休息', duration: '1-2小时', tip: '液体物品托运' },
  { time: '14:00+', activity: '登机·出发', detail: '在候机厅可以逛逛免税店或纪念品店', duration: '飞行中' }
];

const finalDayTimelineIntl = [
  { time: '07:00', activity: '起床·整理行李', detail: '最后检查护照、签证、机票，行李重量', duration: '1小时', tip: '提前查好登机时间' },
  { time: '08:00', activity: '酒店早餐', detail: '如果赶早航班可以请酒店打包', duration: '30分钟' },
  { time: '09:00', activity: '退房·出发', detail: '办理退房，提前预约送机服务', duration: '30分钟' },
  { time: '09:30', activity: '前往国际机场', detail: '国际航班建议提前4小时到机场', duration: '1-2小时', tip: '早高峰注意堵车' },
  { time: '11:30', activity: '值机·退税·过海关', detail: '办理登机牌、购物退税、过海关安检', duration: '2-3小时', tip: '注意退税截止时间' },
  { time: '14:30+', activity: '登机·出发', detail: '在机场免税店最后扫货，登机返程', duration: '飞行中' }
];

let fixed = 0;
const keys = Object.keys(data);
for (const key of keys) {
  const c = data[key];
  if (!c.days || !c.itinerary) continue;
  const m = c.days.match(/(\d+)/);
  const stated = m ? parseInt(m[1]) : 0;
  const actual = c.itinerary.length;
  
  if (stated !== actual) {
    const isDomestic = (c.country === '中国' || c.country === undefined);
    
    // Step 1: 把原来最后一条 itinerary 的 theme 改掉（如果是"返程"）
    const lastOld = c.itinerary[c.itinerary.length - 1];
    if ((lastOld.theme || '').includes('返程')) {
      // 改成 Day N-1 的游玩主题
      const name = c.name;
      const dayN1Theme = isDomestic 
        ? (domesticDayN1Themes[name] || genericThemesDomestic[fixed % genericThemesDomestic.length])
        : (internationalDayN1Themes[name] || genericThemesIntl[fixed % genericThemesIntl.length]);
      lastOld.theme = dayN1Theme;
      // 替换 timeline 为游玩模板
      lastOld.timeline = JSON.parse(JSON.stringify(isDomestic ? dayN1TimelineDomestic : dayN1TimelineIntl));
    }
    
    // Step 2: 新增 Day N（真正返程）
    c.itinerary.push({
      day: `Day ${stated}`,
      theme: '返程 · 再见',
      timeline: JSON.parse(JSON.stringify(isDomestic ? finalDayTimelineDomestic : finalDayTimelineIntl))
    });
    
    // Step 3: 重新编号所有 Day
    c.itinerary.forEach((it, idx) => {
      it.day = `Day ${idx + 1}`;
    });
    
    fixed++;
    console.log(`Fixed ${key} (${c.name}): ${actual} -> ${c.itinerary.length}`);
  }
}

console.log(`\nTotal fixed: ${fixed}`);

// Verify
let stillBad = 0;
for (const key of keys) {
  const c = data[key];
  if (!c.days || !c.itinerary) continue;
  const m = c.days.match(/(\d+)/);
  const stated = m ? parseInt(m[1]) : 0;
  if (stated !== c.itinerary.length) {
    console.log(`STILL BAD: ${key} stated=${stated} actual=${c.itinerary.length}`);
    stillBad++;
  }
}
console.log(`Still bad: ${stillBad}`);

// Show sample
const bj = data['beijing'];
console.log('\n=== Beijing (5天4晚) ===');
bj.itinerary.forEach(it => console.log(`  ${it.day} ${it.theme} (${(it.timeline||[]).length} activities)`));

const tokyo = data['tokyo'];
console.log('\n=== Tokyo (6天5晚) ===');
tokyo.itinerary.forEach(it => console.log(`  ${it.day} ${it.theme} (${(it.timeline||[]).length} activities)`));

const london = data['london'];
console.log('\n=== London (7天6晚) ===');
london.itinerary.forEach(it => console.log(`  ${it.day} ${it.theme} (${(it.timeline||[]).length} activities)`));

// Write output
const newContent = 'window.CITY_DETAIL = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync('city-data.js.bak2', content);
fs.writeFileSync('city-data.js', newContent);
console.log('\nWritten city-data.js (v2)');
