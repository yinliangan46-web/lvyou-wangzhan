// Fix city itinerary day counts - add missing final day
const fs = require('fs');

const content = fs.readFileSync('city-data.js', 'utf8');
const sandbox = { window: {} };
const vm = require('vm');
vm.runInNewContext(content, sandbox);
const data = sandbox.window.CITY_DETAIL;

// Templates for final day (返程) based on city type
const finalDayTemplates = {
  domestic: [
    { time: '08:00', activity: '酒店早餐', detail: '享用最后一顿酒店早餐，收拾行李退房', duration: '1小时', tip: '提前整理好行李' },
    { time: '09:30', activity: '最后自由活动', detail: '在酒店附近或市中心商圈自由活动，拍些最后的纪念照', duration: '2小时' },
    { time: '12:00', activity: '特色午餐', detail: '品尝当地特色美食，为旅程画上句号', duration: '1.5小时' },
    { time: '14:00', activity: '前往机场/火车站', detail: '酒店送机或自行前往，提前3小时到机场/1小时到高铁站', duration: '1.5小时' },
    { time: '16:00', activity: '办理登机/候车', detail: '值机、过安检，稍作休息准备返程', duration: '1小时' },
    { time: '17:00+', activity: '登机出发', detail: '正式踏上归途，期待下次再见', duration: '飞行中' }
  ],
  international: [
    { time: '08:00', activity: '酒店早餐', detail: '享用最后一顿酒店早餐，收拾行李退房', duration: '1小时', tip: '提前整理好行李，留足安检时间' },
    { time: '09:30', activity: '最后自由活动', detail: '在热门景点或商圈做最后一次逛街拍照，购买伴手礼', duration: '2.5小时' },
    { time: '12:30', activity: '特色午餐', detail: '品尝当地经典料理，为旅程画上句号', duration: '1.5小时' },
    { time: '14:30', activity: '前往机场', detail: '酒店送机或自行前往国际机场，国际航班建议提前4小时', duration: '2小时' },
    { time: '16:30', activity: '办理登机+过安检', detail: '值机、退税、过海关安检，在免税店继续扫货', duration: '2小时' },
    { time: '18:30+', activity: '登机出发', detail: '正式踏上归途，期待下次再见', duration: '飞行中' }
  ]
};

const airportCityHints = {
  // 一些城市有特色的最后活动
  "beijing": "可以去首都机场T3看航站楼设计，或最后一次在798艺术区逛逛",
  "shanghai": "最后一次在外滩看黄浦江，或去浦东机场的购物中心",
  "chengdu": "最后一顿火锅或串串香，推荐小龙坎或屋头",
  "xian": "最后一次看大雁塔夜景，或回民街最后一碗泡馍",
  "guilin": "最后一次游两江四湖，或机场买些三花酒",
  "lijiang": "最后一次逛丽江古城忠义市场买伴手礼",
  "dali": "最后一次环洱海骑行，或古城白族三道茶",
  "sanya": "最后一次去亚龙湾海滩晒太阳，或第一市场海鲜",
  "hangzhou": "最后一次西湖泛舟，或去机场前吃一顿杭帮菜",
  "suzhou": "最后一次逛拙政园或山塘街，买些苏绣伴手礼",
  "chongqing": "最后一次在洪崖洞看夜景，或李子坝轻轨穿楼",
  "changsha": "最后一次吃小龙虾或臭豆腐，推荐文和友",
  "tokyo": "最后一次去秋叶原买动漫周边，或成田机场免税店",
  "london": "最后一次逛大英博物馆或哈罗德百货，希思罗机场免税",
  "dubai": "最后一次去哈利法塔登顶，或迪拜Mall购物",
  "bangkok": "最后一次去四面佛还愿，或素万那普机场免税店",
  "bali": "最后一次去乌布传统市场买手工艺品",
  "hongkong": "最后一次登顶太平山或尖沙咀海港城购物",
  "lasa": "最后一次去八廓街转经，或布达拉宫广场拍照",
  "urumqi": "最后一次逛国际大巴扎买新疆干果",
  "dunhuang": "最后一次去鸣沙山看日出或月牙泉",
  "huangshan": "最后一次在宏村或西递古村闲逛拍照"
};

let fixed = 0;
const keys = Object.keys(data);
for (const key of keys) {
  const c = data[key];
  if (!c.days || !c.itinerary) continue;
  const m = c.days.match(/(\d+)/);
  const stated = m ? parseInt(m[1]) : 0;
  const actual = c.itinerary.length;
  
  if (stated !== actual) {
    // Determine domestic vs international
    const isDomestic = (c.country === '中国' || c.country === undefined);
    const template = isDomestic ? finalDayTemplates.domestic : finalDayTemplates.international;
    
    // Add hint if available
    const hint = airportCityHints[key];
    let timeline = template.map(t => ({...t}));
    if (hint) {
      // Add hint to the "最后自由活动" activity
      timeline = timeline.map(t => {
        if (t.activity.includes('最后自由活动') || t.activity.includes('最后一次')) {
          return {...t, detail: t.detail + '。' + hint};
        }
        return t;
      });
    }
    
    // Theme for the last day
    const themes = ['返程 · 再见', '离开·归途', '告别·返程', '回程·再见', '最后一天·返程'];
    const theme = themes[fixed % themes.length];
    
    // Check if the last itinerary already has "返程" theme
    const lastItin = c.itinerary[c.itinerary.length - 1];
    const existingIsReturn = lastItin && (lastItin.theme || '').includes('返程');
    
    if (existingIsReturn) {
      // If last day already says 返程 but day number is wrong, we need to shift
      // Actually the issue is simpler: the itinerary has N-1 entries for N days
      // So we just add one more day at the end
    }
    
    c.itinerary.push({
      day: `Day ${stated}`,
      theme: existingIsReturn ? '最后一天·深度体验' : '返程',
      timeline: timeline
    });
    
    // Renumber all days to be consistent
    c.itinerary.forEach((it, idx) => {
      it.day = `Day ${idx + 1}`;
    });
    
    fixed++;
    console.log(`Fixed ${key} (${c.name}): ${actual} -> ${c.itinerary.length}, stated=${stated}`);
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

// Now generate the output file
// Convert back to JS source
function stringify(obj, indent = 2) {
  return JSON.stringify(obj, null, indent);
}

// Build the JS file content
const newContent = 'window.CITY_DETAIL = ' + stringify(data) + ';\n';

// Backup original
fs.writeFileSync('city-data.js.bak', content);
fs.writeFileSync('city-data.js', newContent);
console.log('\nWritten city-data.js');
console.log('Backup at city-data.js.bak');
