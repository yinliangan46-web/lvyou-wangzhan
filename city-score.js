/* MYL 城市评分聚合壳：先加载 city-score-a.js / city-score-b.js，再由本壳提供 get */
window.MYLSCORE = window.MYLSCORE || {};
window.MYLSCORE.get = function(name){ return window.MYLSCORE[name] || null; };
