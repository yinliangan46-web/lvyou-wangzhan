// ============================================================
//  人格测试 —— 8种人格 + 线路配图 + AI路书
// ============================================================
const quizQuestions = [
    { q: '早上旅行时，你通常几点醒？', options: [
        { text: '🌅 7点前，爬起来看日出', score: 'A' },
        { text: '☕ 9-10点，慢慢起床觅食', score: 'B' },
        { text: '😴 12点后，睡到自然醒', score: 'C' }
    ]},
    { q: '旅行最重要的是什么？', options: [
        { text: '🏔️ 看到震撼到失语的风景', score: 'A' },
        { text: '🍜 吃到当地人排队的馆子', score: 'B' },
        { text: '📸 拍一组能封神的照片', score: 'C' },
        { text: '👥 认识有趣的旅伴故事', score: 'D' }
    ]},
    { q: '你更喜欢住哪里？', options: [
        { text: '🛏️ 青旅多人间，热闹拼饭', score: 'D' },
        { text: '🏠 设计感民宿，有故事', score: 'C' },
        { text: '🏨 五星酒店，躺平舒服', score: 'B' }
    ]},
    { q: '你能接受的旅行节奏？', options: [
        { text: '🏃 一天跑5个景点，特种兵', score: 'A' },
        { text: '🚶 一天2-3个，慢慢逛', score: 'C' },
        { text: '🛋️ 一天1个，躺平不赶路', score: 'B' }
    ]},
    { q: '你最怕遇到什么？', options: [
        { text: '👨‍👩‍👧‍👦 人挤人，拍不了照', score: 'A' },
        { text: '🗣️ 语言不通吃不到好吃的', score: 'D' },
        { text: '🛌 住得差影响心情', score: 'B' },
        { text: '📵 没网拍不了照发不了圈', score: 'C' }
    ]},
    { q: '旅行回来你最想发什么朋友圈？', options: [
        { text: '🏔️ 雪山/极光/星空大片', score: 'A' },
        { text: '🍱 九宫格美食图配文"绝了"', score: 'B' },
        { text: '🧏 文艺风景+一句短句', score: 'C' },
        { text: '🥂 和旅伴的合照+故事', score: 'D' }
    ]},
    { q: '你更喜欢哪种旅行方式？', options: [
        { text: '🏕️ 自驾/徒步，深入荒野', score: 'A' },
        { text: '🚌 坐公交逛菜市场吃小吃', score: 'B' },
        { text: '🏛️ 逛博物馆/老街区慢慢走', score: 'C' },
        { text: '👫 拼团/青旅，有人带', score: 'D' }
    ]},
    { q: '旅行预算你最愿意花在哪？', options: [
        { text: '🎫 门票/户外体验/跳伞', score: 'A' },
        { text: '🍜 吃！吃！吃！', score: 'B' },
        { text: '🛏️ 住有设计感的酒店/民宿', score: 'C' },
        { text: '🍹 酒吧/社交活动/拼餐', score: 'D' }
    ]},
    { q: '你最喜欢的旅行天气？', options: [
        { text: '❄️ 雪天/极光/极端天气', score: 'A' },
        { text: '☀️ 晴天，逛街吃小吃', score: 'B' },
        { text: '🌧️ 阴雨天，拍文艺照', score: 'C' },
        { text: '🤷 无所谓，关键是和谁', score: 'D' }
    ]},
    { q: '旅途中你最想做的事？', options: [
        { text: '🌅 看日出/日落/极光', score: 'A' },
        { text: '🥘 找当地老字号苍蝇馆', score: 'B' },
        { text: '📚 逛独立书店/咖啡馆', score: 'C' },
        { text: '🎉 参加当地人的聚会/夜市', score: 'D' }
    ]},
    { q: '你更喜欢哪种交通方式？', options: [
        { text: '🚗 自驾/徒步，自由掌控', score: 'A' },
        { text: '🚇 地铁/公交，穿梭市井', score: 'B' },
        { text: '🚞 高铁/慢车，看风景', score: 'C' },
        { text: '🚐 拼车/搭便车，认识人', score: 'D' }
    ]},
    { q: '旅行纪念品你会买什么？', options: [
        { text: '🪨 石头/树叶/自然标本', score: 'A' },
        { text: '🌶️ 当地调味料/零食伴手礼', score: 'B' },
        { text: '🖼️ 明信片/文创周边', score: 'C' },
        { text: '🤝 和旅伴的合影/签名', score: 'D' }
    ]},
    { q: '你更喜欢哪种类型的目的地？', options: [
        { text: '🏞️ 国家公园/荒野/无人区', score: 'A' },
        { text: '🍢 美食之都/夜市/小吃街', score: 'B' },
        { text: '🏘️ 古城/文艺小镇/美术馆', score: 'C' },
        { text: '🏄 派对城市/冲浪小镇', score: 'D' }
    ]},
    { q: '旅行中你最在意什么？', options: [
        { text: '🏔️ 看到别人没看过的风景', score: 'A' },
        { text: '🍜 吃到别人不知道的馆子', score: 'B' },
        { text: '📷 拍到别人拍不到的角度', score: 'C' },
        { text: '👥 认识别人不认识的朋友', score: 'D' }
    ]},
    { q: '如果只能选一个地方待一周，你选？', options: [
        { text: '🏔️ 雪山脚下的小木屋', score: 'A' },
        { text: '🌶️ 美食之都的市中心', score: 'B' },
        { text: '🌊 海边的文艺小镇', score: 'C' },
        { text: '🏝️ 有很多青旅的度假岛', score: 'D' }
    ]}
];

// PLACEHOLDER - full content is 125KB, pushing in chunks
console.log('discover-data.js loaded');