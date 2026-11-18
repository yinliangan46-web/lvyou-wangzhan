/* =====================================================================
   POI 配图：按景点/美食的**类型**匹配真实照片
   —— 之前所有卡片共用同一张占位图（生图接口只返回 "image is generating"），
      这里改为「分类实景图池 + 著名地标精确映射」，同名稳定取图，不会重复到同一张
   ===================================================================== */
(function (global) {
    var BASE = 'https://images.unsplash.com/';

    /* 已逐张核验的真实照片（编号见 /tmp/sheet.jpg 校对表） */
    var P = {
        cityStreet: 'photo-1449824913935-59a10b8d2000',   /* 城市街道高楼 */
        hillGreen: 'photo-1469474968028-56623f02e42e',    /* 青山云雾 */
        fjord: 'photo-1469521669194-babb45599def',        /* 峡湾雪山湖 */
        desertRoad: 'photo-1469854523086-cc02fe5d8800',   /* 荒漠红岩公路 */
        skylineDusk: 'photo-1470004914212-05527e49370b',  /* 城市天际线落日 */
        meadow: 'photo-1470071459604-3b5ec3a7fe05',       /* 草甸山谷 */
        rapeseed: 'photo-1490750967868-88aa4486c946',     /* 黄色花田 */
        canyon: 'photo-1504893524553-b855bce32c67',       /* 峡谷峭壁 */
        snowMountain: 'photo-1506905925346-21bda4d32df4', /* 雪山冰川 */
        beach: 'photo-1507525428034-b723cf961d3e',        /* 海滩日落 */
        nightMarket: 'photo-1508009603885-50cf7c579365',  /* 夜市小吃街红灯笼 */
        hillTemple: 'photo-1508804185872-d7badad00f7d',   /* 秋山上的古寺 */
        cityTower: 'photo-1519501025264-65ba15a82390',    /* 现代高楼群 */
        starrySnow: 'photo-1519681393784-d120267933ba',   /* 星空雪山 */
        sakura: 'photo-1522383225653-ed111181a951',       /* 樱花 */
        karst: 'photo-1528127269322-539801943592',        /* 喀斯特峰林游船（漓江） */
        thaiTemple: 'photo-1528181304800-259b08848526',   /* 泰式金顶寺庙 */
        japanLantern: 'photo-1528360983277-13d401cdc186', /* 日式灯笼居酒屋街 */
        japanGarden: 'photo-1537996194471-e657df975ab4',  /* 日式庭园水上阁 */
        kyotoPagoda: 'photo-1545569341-9eb8b30979d9',     /* 京都塔与街景 */
        palace: 'photo-1547981609-4b6bfe67ca0b',          /* 故宫太和殿广场 */
        tajMahal: 'photo-1548013146-72479768bada',        /* 泰姬陵门洞 */
        toucan: 'photo-1550853024-fae8cd4be47f',          /* 热带鸟类 */
        ski: 'photo-1551524559-8af4e6624178',             /* 滑雪雪山 */
        ramen: 'photo-1552611052-33e04de081de',           /* 拉面 */
        sushi: 'photo-1553621042-f6e147245754',           /* 寿司拼盘 */
        hostel: 'photo-1555854877-bab0e564b8d5',          /* 青年旅舍床位 */
        elephantHill: 'photo-1559592413-7cec4d0cae2b',    /* 象鼻山 */
        shrimpPlate: 'photo-1559742811-822873691df8',     /* 精致虾料理 */
        dumplings: 'photo-1563245372-f21724e3856d',       /* 蒸笼小笼包 */
        panda: 'photo-1564349683136-77e08dba1ef7',        /* 熊猫吃竹 */
        poolHotel: 'photo-1566073771259-6a8506099945',    /* 度假酒店泳池 */
        sphinx: 'photo-1568322445389-f64ac2515020',       /* 狮身人面像 */
        tea: 'photo-1576092768241-dec231879fc3',          /* 茶杯 */
        hotelRoom: 'photo-1582719478250-c89cae4dc85b',    /* 酒店房间 */
        noodles: 'photo-1585032226651-759b368d7246',      /* 面条 */
        tokyoStreet: 'photo-1590559899731-a382839e5549',  /* 日本街头招牌夜景 */
        sweetSour: 'photo-1525755662778-989d0524087e',    /* 糖醋鸡块配米饭 */
        fishDish: 'photo-1476224203421-9ac39bcb3327',     /* 铁板鱼/酱汁热菜 */
        friedRice: 'photo-1626804475297-41608ea09aeb',    /* 炒饭 */
        ricePan: 'photo-1512058564366-18510be2db19',      /* 铁锅炒饭 */
        noodleSoup: 'photo-1555126634-323283e090fa',      /* 汤面 */
        noodleDark: 'photo-1526318896980-cf78c088247c',   /* 深色汤面 */
        ramenShrimp: 'photo-1569718212165-3a8278d5f624',  /* 鲜虾拉面 */
        winterTree: 'photo-1483664852095-d6cc6870702d',   /* 雪原落日 */
        ribPlatter: 'photo-1555939594-58d7cb561ad1',      /* 烤肉拼盘 */
        roastRibs: 'photo-1544025162-d76694265947',       /* 烤肋排 */
        riceShrimp: 'photo-1559847844-5315695dadae',      /* 海鲜盖饭 */
        dimsum: 'photo-1534422298391-e4f8c172dddb',       /* 点心拼盘 */
        iceCream: 'photo-1497034825429-c343d7c6a68f',     /* 手持冰淇淋甜筒 */
        beer: 'photo-1608270586620-248524c67de9',         /* 扎啤 */
        sausage: 'photo-1607623814075-e51df1bdc82f',      /* 冷切香肠拼盘 */
        cutlet: 'photo-1585325701956-60dd9c8553bc',       /* 炸肉排 */
        friedChicken: 'photo-1626082927389-6cd097cdc6ec', /* 炸鸡 */
        restaurant: 'photo-1552566626-52f8b828add9'       /* 餐厅内景 */
    };

    /* 城市实拍图（来自本地 images/cities，314 城） */
    var CITY_IMG = {
        '七台河': 'images/cities/qitaihe.jpg',
        '三亚': 'images/cities/sanya.jpg',
        '三明': 'images/cities/sanming.jpg',
        '三门峡': 'images/cities/sanmenxia.jpg',
        '上饶': 'images/cities/shangrao.jpg',
        '东莞': 'images/cities/dongguan.jpg',
        '东营': 'images/cities/dongying.jpg',
        '中卫': 'images/cities/zhongwei.jpg',
        '中山': 'images/cities/zhongshan.jpg',
        '临汾': 'images/cities/linfen.jpg',
        '临沂': 'images/cities/linyi.jpg',
        '临沧': 'images/cities/lincang.jpg',
        '丹东': 'images/cities/dandong.jpg',
        '丽水': 'images/cities/lishui.jpg',
        '丽江': 'images/cities/lijiang.jpg',
        '乌兰察布': 'images/cities/wulanchabu.jpg',
        '乌海': 'images/cities/wuhai.jpg',
        '乌鲁木齐': 'images/cities/wulumuqi.jpg',
        '乐山': 'images/cities/leshan.jpg',
        '九江': 'images/cities/jiujiang.jpg',
        '九龙': 'images/cities/jiulong.jpg',
        '云浮': 'images/cities/yunfu.jpg',
        '亳州': 'images/cities/bozhou.jpg',
        '伊春': 'images/cities/yichun.jpg',
        '伊犁': 'images/cities/yili.jpg',
        '佛山': 'images/cities/foshan.jpg',
        '佳木斯': 'images/cities/jiamusi.jpg',
        '保定': 'images/cities/baoding.jpg',
        '保山': 'images/cities/baoshan.jpg',
        '信阳': 'images/cities/xinyang.jpg',
        '儋州': 'images/cities/danzhou.jpg',
        '克拉玛依': 'images/cities/kelamayi.jpg',
        '六安': 'images/cities/luan.jpg',
        '六盘水': 'images/cities/liupanshui.jpg',
        '兰州': 'images/cities/lanzhou.jpg',
        '内江': 'images/cities/neijiang.jpg',
        '包头': 'images/cities/baotou.jpg',
        '北海': 'images/cities/beihai.jpg',
        '十堰': 'images/cities/shiyan.jpg',
        '南京': 'images/cities/nanjing.jpg',
        '南充': 'images/cities/nanchong.jpg',
        '南宁': 'images/cities/nanning.jpg',
        '南平': 'images/cities/nanping.jpg',
        '南昌': 'images/cities/nanchang.jpg',
        '南通': 'images/cities/nantong.jpg',
        '南阳': 'images/cities/nanyang.jpg',
        '厦门': 'images/cities/xiamen.jpg',
        '双鸭山': 'images/cities/shuangyashan.jpg',
        '台中': 'images/cities/taizhong.jpg',
        '台北': 'images/cities/taibei.jpg',
        '台南': 'images/cities/tainan.jpg',
        '台州': 'images/cities/taizhou.jpg',
        '合肥': 'images/cities/hefei.jpg',
        '吉安': 'images/cities/jian.jpg',
        '吉林': 'images/cities/jilin.jpg',
        '吐鲁番': 'images/cities/tulufan.jpg',
        '吕梁': 'images/cities/lvliang.jpg',
        '吴忠': 'images/cities/wuzhong.jpg',
        '周口': 'images/cities/zhoukou.jpg',
        '呼伦贝尔': 'images/cities/hulunbeier.jpg',
        '呼和浩特': 'images/cities/huhehaote.jpg',
        '和田': 'images/cities/hetian.jpg',
        '咸宁': 'images/cities/xianning.jpg',
        '咸阳': 'images/cities/xianyang.jpg',
        '哈密': 'images/cities/hami.jpg',
        '哈尔滨': 'images/cities/haerbin.jpg',
        '唐山': 'images/cities/tangshan.jpg',
        '商丘': 'images/cities/shangqiu.jpg',
        '商洛': 'images/cities/shangluo.jpg',
        '喀什': 'images/cities/kashi.jpg',
        '嘉义': 'images/cities/jiayi.jpg',
        '嘉兴': 'images/cities/jiaxing.jpg',
        '嘉峪关': 'images/cities/jiayuguan.jpg',
        '四平': 'images/cities/siping.jpg',
        '固原': 'images/cities/guyuan.jpg',
        '基隆': 'images/cities/jilong.jpg',
        '塔城': 'images/cities/tacheng.jpg',
        '大同': 'images/cities/datong.jpg',
        '大庆': 'images/cities/daqing.jpg',
        '大连': 'images/cities/dalian.jpg',
        '天水': 'images/cities/tianshui.jpg',
        '太原': 'images/cities/taiyuan.jpg',
        '威海': 'images/cities/weihai.jpg',
        '娄底': 'images/cities/loudi.jpg',
        '孝感': 'images/cities/xiaogan.jpg',
        '宁德': 'images/cities/ningde.jpg',
        '宁波': 'images/cities/ningbo.jpg',
        '安庆': 'images/cities/anqing.jpg',
        '安康': 'images/cities/ankang.jpg',
        '安阳': 'images/cities/anyang.jpg',
        '安顺': 'images/cities/anshun.jpg',
        '定西': 'images/cities/dingxi.jpg',
        '宜宾': 'images/cities/yibin.jpg',
        '宜昌': 'images/cities/yichang.jpg',
        '宜春': 'images/cities/yichun.jpg',
        '宝鸡': 'images/cities/baoji.jpg',
        '宣城': 'images/cities/xuancheng.jpg',
        '宿州': 'images/cities/suzhou.jpg',
        '宿迁': 'images/cities/suqian.jpg',
        '山南': 'images/cities/shannan.jpg',
        '岳阳': 'images/cities/yueyang.jpg',
        '崇左': 'images/cities/chongzuo.jpg',
        '巴中': 'images/cities/bazhong.jpg',
        '巴彦淖尔': 'images/cities/bayannaoer.jpg',
        '常州': 'images/cities/changzhou.jpg',
        '常德': 'images/cities/changde.jpg',
        '平凉': 'images/cities/pingliang.jpg',
        '平顶山': 'images/cities/pingdingshan.jpg',
        '广元': 'images/cities/guangyuan.jpg',
        '广安': 'images/cities/guangan.jpg',
        '广州': 'images/cities/guangzhou.jpg',
        '庆阳': 'images/cities/qingyang.jpg',
        '廊坊': 'images/cities/langfang.jpg',
        '延安': 'images/cities/yanan.jpg',
        '延边': 'images/cities/yanbian.jpg',
        '开封': 'images/cities/kaifeng.jpg',
        '张家口': 'images/cities/zhangjiakou.jpg',
        '张家界': 'images/cities/zhangjiajie.jpg',
        '张掖': 'images/cities/zhangye.jpg',
        '徐州': 'images/cities/xuzhou.jpg',
        '德州': 'images/cities/dezhou.jpg',
        '德阳': 'images/cities/deyang.jpg',
        '忻州': 'images/cities/xinzhou.jpg',
        '怀化': 'images/cities/huaihua.jpg',
        '惠州': 'images/cities/huizhou.jpg',
        '成都': 'images/cities/chengdu.jpg',
        '扬州': 'images/cities/yangzhou.jpg',
        '承德': 'images/cities/chengde.jpg',
        '抚州': 'images/cities/fuzhou.jpg',
        '抚顺': 'images/cities/fushun.jpg',
        '拉萨': 'images/cities/lasa.jpg',
        '揭阳': 'images/cities/jieyang.jpg',
        '攀枝花': 'images/cities/panzhihua.jpg',
        '新乡': 'images/cities/xinxiang.jpg',
        '新余': 'images/cities/xinyu.jpg',
        '新北': 'images/cities/xinbei.jpg',
        '新界': 'images/cities/xinjie.jpg',
        '新竹': 'images/cities/xinzhu.jpg',
        '无锡': 'images/cities/wuxi.jpg',
        '日喀则': 'images/cities/rikaze.jpg',
        '日照': 'images/cities/rizhao.jpg',
        '昆明': 'images/cities/kunming.jpg',
        '昌都': 'images/cities/changdou.jpg',
        '昭通': 'images/cities/zhaotong.jpg',
        '晋中': 'images/cities/jinzhong.jpg',
        '晋城': 'images/cities/jincheng.jpg',
        '普洱': 'images/cities/puer.jpg',
        '景德镇': 'images/cities/jingdezhen.jpg',
        '曲靖': 'images/cities/qujing.jpg',
        '朔州': 'images/cities/shuozhou.jpg',
        '朝阳': 'images/cities/zhaoyang.jpg',
        '本溪': 'images/cities/benxi.jpg',
        '来宾': 'images/cities/laibin.jpg',
        '杭州': 'images/cities/hangzhou.jpg',
        '松原': 'images/cities/songyuan.jpg',
        '林芝': 'images/cities/linzhi.jpg',
        '枣庄': 'images/cities/zaozhuang.jpg',
        '柳州': 'images/cities/liuzhou.jpg',
        '株洲': 'images/cities/zhuzhou.jpg',
        '桂林': 'images/cities/guilin.jpg',
        '桃园': 'images/cities/taoyuan.jpg',
        '梅州': 'images/cities/meizhou.jpg',
        '梧州': 'images/cities/wuzhou.jpg',
        '榆林': 'images/cities/yulin.jpg',
        '武威': 'images/cities/wuwei.jpg',
        '武汉': 'images/cities/wuhan.jpg',
        '毕节': 'images/cities/bijie.jpg',
        '永州': 'images/cities/yongzhou.jpg',
        '氹仔': 'images/cities/dangzai.jpg',
        '汉中': 'images/cities/hanzhong.jpg',
        '汕头': 'images/cities/shantou.jpg',
        '汕尾': 'images/cities/shanwei.jpg',
        '江门': 'images/cities/jiangmen.jpg',
        '池州': 'images/cities/chizhou.jpg',
        '沈阳': 'images/cities/shenyang.jpg',
        '沧州': 'images/cities/cangzhou.jpg',
        '河池': 'images/cities/hechi.jpg',
        '河源': 'images/cities/heyuan.jpg',
        '泉州': 'images/cities/quanzhou.jpg',
        '泰安': 'images/cities/taian.jpg',
        '泰州': 'images/cities/taizhou.jpg',
        '泸州': 'images/cities/luzhou.jpg',
        '洛阳': 'images/cities/luoyang.jpg',
        '济南': 'images/cities/jinan.jpg',
        '济宁': 'images/cities/jining.jpg',
        '海东': 'images/cities/haidong.jpg',
        '海口': 'images/cities/haikou.jpg',
        '淄博': 'images/cities/zibo.jpg',
        '淮北': 'images/cities/huaibei.jpg',
        '淮南': 'images/cities/huainan.jpg',
        '淮安': 'images/cities/huaian.jpg',
        '深圳': 'images/cities/shenzhen.jpg',
        '清远': 'images/cities/qingyuan.jpg',
        '温州': 'images/cities/wenzhou.jpg',
        '渭南': 'images/cities/weinan.jpg',
        '湖州': 'images/cities/huzhou.jpg',
        '湘潭': 'images/cities/xiangtan.jpg',
        '湛江': 'images/cities/zhanjiang.jpg',
        '滁州': 'images/cities/chuzhou.jpg',
        '滨州': 'images/cities/binzhou.jpg',
        '漯河': 'images/cities/tahe.jpg',
        '漳州': 'images/cities/zhangzhou.jpg',
        '潍坊': 'images/cities/weifang.jpg',
        '潮州': 'images/cities/chaozhou.jpg',
        '澳门半岛': 'images/cities/aomenbandao.jpg',
        '濮阳': 'images/cities/puyang.jpg',
        '烟台': 'images/cities/yantai.jpg',
        '焦作': 'images/cities/jiaozuo.jpg',
        '牡丹江': 'images/cities/mudanjiang.jpg',
        '玉林': 'images/cities/yulin.jpg',
        '玉溪': 'images/cities/yuxi.jpg',
        '珠海': 'images/cities/zhuhai.jpg',
        '白城': 'images/cities/baicheng.jpg',
        '白山': 'images/cities/baishan.jpg',
        '白银': 'images/cities/baiyin.jpg',
        '百色': 'images/cities/baise.jpg',
        '益阳': 'images/cities/yiyang.jpg',
        '盐城': 'images/cities/yancheng.jpg',
        '盘锦': 'images/cities/panjin.jpg',
        '眉山': 'images/cities/meishan.jpg',
        '石嘴山': 'images/cities/shizuishan.jpg',
        '石家庄': 'images/cities/shijiazhuang.jpg',
        '福州': 'images/cities/fuzhou.jpg',
        '秦皇岛': 'images/cities/qinhuangdao.jpg',
        '绍兴': 'images/cities/shaoxing.jpg',
        '绥化': 'images/cities/suihua.jpg',
        '绵阳': 'images/cities/mianyang.jpg',
        '聊城': 'images/cities/liaocheng.jpg',
        '肇庆': 'images/cities/zhaoqing.jpg',
        '自贡': 'images/cities/zigong.jpg',
        '舟山': 'images/cities/zhoushan.jpg',
        '芜湖': 'images/cities/wuhu.jpg',
        '苏州': 'images/cities/suzhou.jpg',
        '茂名': 'images/cities/maoming.jpg',
        '荆州': 'images/cities/jingzhou.jpg',
        '荆门': 'images/cities/jingmen.jpg',
        '莆田': 'images/cities/putian.jpg',
        '菏泽': 'images/cities/heze.jpg',
        '萍乡': 'images/cities/pingxiang.jpg',
        '营口': 'images/cities/yingkou.jpg',
        '葫芦岛': 'images/cities/huludao.jpg',
        '蚌埠': 'images/cities/bengbu.jpg',
        '衡水': 'images/cities/hengshui.jpg',
        '衡阳': 'images/cities/hengyang.jpg',
        '衢州': 'images/cities/quzhou.jpg',
        '襄阳': 'images/cities/xiangyang.jpg',
        '西宁': 'images/cities/xining.jpg',
        '西安': 'images/cities/xian.jpg',
        '许昌': 'images/cities/xuchang.jpg',
        '贵港': 'images/cities/guigang.jpg',
        '贵阳': 'images/cities/guiyang.jpg',
        '贺州': 'images/cities/hezhou.jpg',
        '资阳': 'images/cities/ziyang.jpg',
        '赣州': 'images/cities/ganzhou.jpg',
        '赤峰': 'images/cities/chifeng.jpg',
        '路环': 'images/cities/luhuan.jpg',
        '辽源': 'images/cities/liaoyuan.jpg',
        '辽阳': 'images/cities/liaoyang.jpg',
        '达州': 'images/cities/dazhou.jpg',
        '运城': 'images/cities/yuncheng.jpg',
        '连云港': 'images/cities/lianyungang.jpg',
        '通化': 'images/cities/tonghua.jpg',
        '通辽': 'images/cities/tongliao.jpg',
        '遂宁': 'images/cities/suining.jpg',
        '遵义': 'images/cities/zunyi.jpg',
        '邢台': 'images/cities/xingtai.jpg',
        '那曲': 'images/cities/naqu.jpg',
        '邯郸': 'images/cities/handan.jpg',
        '邵阳': 'images/cities/shaoyang.jpg',
        '郑州': 'images/cities/zhengzhou.jpg',
        '郴州': 'images/cities/chenzhou.jpg',
        '鄂尔多斯': 'images/cities/eerduosi.jpg',
        '鄂州': 'images/cities/ezhou.jpg',
        '酒泉': 'images/cities/jiuquan.jpg',
        '金华': 'images/cities/jinhua.jpg',
        '金昌': 'images/cities/jinchang.jpg',
        '钦州': 'images/cities/qinzhou.jpg',
        '铁岭': 'images/cities/tieling.jpg',
        '铜仁': 'images/cities/tongren.jpg',
        '铜川': 'images/cities/tongchuan.jpg',
        '铜陵': 'images/cities/tongling.jpg',
        '银川': 'images/cities/yinchuan.jpg',
        '锦州': 'images/cities/jinzhou.jpg',
        '镇江': 'images/cities/zhenjiang.jpg',
        '长春': 'images/cities/changchun.jpg',
        '长沙': 'images/cities/changsha.jpg',
        '长治': 'images/cities/zhangzhi.jpg',
        '阜新': 'images/cities/fuxin.jpg',
        '阜阳': 'images/cities/fuyang.jpg',
        '防城港': 'images/cities/fangchenggang.jpg',
        '阳江': 'images/cities/yangjiang.jpg',
        '阳泉': 'images/cities/yangquan.jpg',
        '阿克苏': 'images/cities/akesu.jpg',
        '阿勒泰': 'images/cities/aleitai.jpg',
        '陇南': 'images/cities/longnan.jpg',
        '随州': 'images/cities/suizhou.jpg',
        '雅安': 'images/cities/yaan.jpg',
        '青岛': 'images/cities/qingdao.jpg',
        '鞍山': 'images/cities/anshan.jpg',
        '韶关': 'images/cities/shaoguan.jpg',
        '香港岛': 'images/cities/xianggangdao.jpg',
        '马鞍山': 'images/cities/maanshan.jpg',
        '驻马店': 'images/cities/zhumadian.jpg',
        '高雄': 'images/cities/gaoxiong.jpg',
        '鸡西': 'images/cities/jixi.jpg',
        '鹤壁': 'images/cities/hebi.jpg',
        '鹤岗': 'images/cities/hegang.jpg',
        '鹰潭': 'images/cities/yingtan.jpg',
        '黄冈': 'images/cities/huanggang.jpg',
        '黄山': 'images/cities/huangshan.jpg',
        '黄石': 'images/cities/huangshi.jpg',
        '黑河': 'images/cities/heihe.jpg',
        '齐齐哈尔': 'images/cities/qiqihaer.jpg',
        '龙岩': 'images/cities/longyan.jpg'
    };

    /* 去掉水印/播放按钮后重新裁剪的版本 */
    var CITY_POI = {
        '成都': 'images/poi/chengdu.jpg',
        '杭州': 'images/poi/hangzhou.jpg',
        '青岛': 'images/poi/qingdao.jpg'
    };

    /* 本地没有城市实拍图的 5 座城市，用城市地标照片兜底 */
    var CITY_FALLBACK = {
        '北京': 'palace', '上海': 'skylineDusk', '重庆': 'nightMarket',
        '敦煌': 'desertRoad', '大理': 'fjord'
    };

    /* 具有唯一对应实拍/高辨识度的地标，优先于城市图 */
    var ICONIC = {
        '故宫博物院': 'palace', '故宫': 'palace', '沈阳故宫': 'palace', '台北故宫': 'palace',
        '大熊猫繁育基地': 'panda', '熊猫基地': 'panda',
        '象鼻山': 'guilin', '漓江竹筏': 'guilin', '漓江': 'guilin',
        '泰姬陵': 'india', '金字塔': 'egypt', '金阁寺': 'temple', '伏见稻荷大社': 'japan',
        '张掖七彩丹霞': 'desert', '鸣沙山月牙泉': 'desert', '玉门关': 'desert', '雅丹魔鬼城': 'desert'
    };

    var POOLS = {
        palace: [P.palace],
        temple: [P.hillTemple, P.japanGarden, P.thaiTemple],
        street: [P.nightMarket, P.japanLantern, P.tokyoStreet],
        city: [P.cityStreet, P.skylineDusk, P.cityTower],
        mountain: [P.hillGreen, P.snowMountain, P.meadow, P.canyon, P.starrySnow],
        lake: [P.fjord, P.karst, P.elephantHill],
        desert: [P.desertRoad, P.sphinx],
        sea: [P.beach, P.fjord, P.karst],
        nature: [P.meadow, P.rapeseed, P.sakura, P.hillGreen],
        food: [P.noodles, P.dumplings, P.shrimpPlate, P.ramen, P.sushi],
        cnFood: [P.noodles, P.dumplings, P.shrimpPlate],
        meatDish: [P.sweetSour, P.fishDish],
        riceDish: [P.friedRice, P.ricePan],
        noodleDish: [P.noodles, P.noodleSoup, P.noodleDark, P.ramenShrimp],
        jpFood: [P.ramen, P.sushi],
        drink: [P.tea],
        hotel: [P.hotelRoom, P.poolHotel, P.hostel],
        restaurant: [P.restaurant, P.poolHotel],
        snow: [P.snowMountain, P.starrySnow, P.ski],
        winter: [P.winterTree, P.ski, P.starrySnow, P.snowMountain],
        bbq: [P.ribPlatter, P.roastRibs, P.sweetSour],
        riceBowl: [P.riceShrimp, P.friedRice, P.ricePan],
        dimsum: [P.dimsum, P.dumplings],
        drink: [P.beer, P.tea],
        iceCream: [P.iceCream],
        beer: [P.beer],
        sausage: [P.sausage],
        cutlet: [P.cutlet],
        friedChicken: [P.friedChicken],
        wildlife: [P.panda, P.toucan],
        japan: [P.japanLantern, P.kyotoPagoda, P.tokyoStreet],
        thai: [P.thaiTemple],
        india: [P.tajMahal],
        egypt: [P.sphinx],
        guilin: [P.karst, P.elephantHill],
        panda: [P.panda],
        sakura: [P.sakura]
    };

    /* 著名地标：精确到具体照片 */
    var EXACT = {
        '故宫博物院': 'palace', '故宫': 'palace', '沈阳故宫': 'palace', '台北故宫': 'palace',
        '大熊猫繁育基地': 'panda', '熊猫基地': 'panda',
        '象鼻山': 'guilin', '漓江竹筏': 'guilin', '漓江': 'guilin', '阳朔西街': 'street',
        '金阁寺': 'temple', '伏见稻荷大社': 'japan', '清水寺': 'temple',
        '泰姬陵': 'india', '金字塔': 'egypt', '圣索菲亚教堂': 'temple',
        '中央大街': 'street', '宽窄巷子': 'street', '锦里古街': 'street',
        '洪崖洞': 'street', '磁器口': 'street', '南锣鼓巷': 'street',
        '回民街': 'street', '太平老街': 'street', '平江路': 'street',
        '阳朔西街': 'street', '沙洲夜市': 'street', '老道外': 'street',
        '喀什古城': 'street', '艾提尕尔清真寺': 'temple',
        '外滩': 'city', '武康路': 'city', '豫园': 'temple',
        '西湖': 'lake', '洱海生态廊道': 'lake', '洱海': 'lake', '千岛湖': 'lake',
        '茶卡盐湖': 'lake', '白沙湖': 'lake', '赛里木湖': 'lake', '喀纳斯湖': 'lake',
        '莫高窟': 'desert', '鸣沙山月牙泉': 'desert', '雅丹魔鬼城': 'desert',
        '玉门关': 'desert', '张掖七彩丹霞': 'desert',
        '冰雪大世界': 'winter', '太阳岛': 'winter', '冰雪世界': 'winter', '雪山': 'snow',
        '华山': 'mountain', '崂山': 'mountain', '苍山': 'mountain',
        '岳麓山': 'mountain', '橘子洲': 'mountain', '龙脊梯田': 'nature',
        '西溪湿地': 'nature', '龙井村': 'nature',
        '拙政园': 'temple', '留园': 'temple', '朱家角': 'lake',
        '上海迪士尼': 'city', '冰雪世界': 'snow',
        '望江楼公园': 'nature', '黄厝海滩': 'sea', '八市海鲜加工': 'food',
        '湖南博物院': 'temple', '八大关': 'street', '山城步道': 'city',
        '南山一棵树': 'city', '橘子洲': 'lake', '景山公园': 'nature',
        '白族石板烧': 'food', '乳扇沙琪玛': 'food', '西安城墙': 'city',
        '秦始皇兵马俑': 'palace', '甑糕': 'food', '片儿川': 'food',
        '鼓浪屿': 'sea', '沙坡尾艺术西区': 'city', '集美学村': 'city',
        '土笋冻': 'food', '花生汤': 'food', '袋装原浆': 'drink',
        '超级文和友': 'street', '颐和园': 'lake', '卤煮火烧': 'food',
        '香妃园': 'nature', '大雁塔': 'temple', '栈桥': 'sea',
        '八达岭长城': 'mountain', '桂林米粉': 'food', '都江堰': 'lake',
        '锅包肉': 'cutlet', '锅巴土豆': 'meatDish', '冷锅串串': 'meatDish',
        '老火锅': 'meatDish', '铁锅炖': 'meatDish', '烤羊排': 'bbq',
        '手抓饭': 'riceBowl', '红肠': 'sausage', '甜水面': 'noodleDish',
        '马迭尔冰棍': 'iceCream'
    };

    /* 城市 → 图片气质（决定取哪个池） */
    var CITY_POOL = [
        [/日本|京都|镰仓|东京|大阪|秋田|北海道|奈良|箱根/, 'japan'],
        [/泰国|曼谷|清迈|拜县|普吉/, 'thai'],
        [/埃及|金字塔|开罗/, 'egypt'],
        [/印度|泰姬/, 'india'],
        [/冰岛|极光|北欧|芬兰|挪威/, 'snow'],
        [/新疆|西藏|川西|青海|稻城|亚丁|四姑娘|丹巴|帕米尔|喀纳斯|禾木/, 'mountain'],
        [/桂林|阳朔|漓江/, 'guilin'],
        [/三亚|巴厘|海岛|马尔代夫|长滩|普吉|夏威夷/, 'sea'],
        [/敦煌|张掖|沙漠|戈壁|丹霞/, 'desert']
    ];

    var RULES = [
        [/街景|城市|都市|天际线/, 'city'],
        [/酒店|客栈|民宿|青旅|旅馆|假日|全季|宾馆|B&B|旅店|民泊|住宿|房/, 'hotel'],
        [/火锅|涮肉|烧烤|烤肉|串|烤肉|羊排|炖|焖|血旺|肠|饺|包|馍|饼|粑|面|粉|米线|乌冬|拉面|饭|粥|虾|鱼|蟹|蛤|贻贝|芋|豆|鸡|肉/, 'food'],
        [/茶|咖啡|酸奶|啤酒|奶茶|冰棍|果汁|饮|水$|酒/, 'drink'],
        [/寺|庙|大社|教堂|庵|祠|清真寺/, 'temple'],
        [/古街|老街|古城|古镇|巷|街$|路$|夜市|市场|小吃/, 'street'],
        [/湖|海|湾|岛|泉|瀑布|湿地|江|河|溪|盐湖/, 'lake'],
        [/山|峰|雪山|冰川|草原|梯田|高原|丹霞|雅丹|沙漠|峡谷|关$/, 'mountain'],
        [/博物馆|博物院|美术馆|艺术馆|遗址|故宫/, 'temple'],
        [/园|园林|公园|花海|樱花/, 'nature'],
        [/塔|楼|阁|桥|门|广场|长城|车站|站$/, 'city']
    ];

    function hash(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) h = (h * 131 + s.charCodeAt(i)) % 99991;
        return h;
    }

    function url(id, kind) {
        return BASE + id + '?w=' + (kind === 'food' ? 480 : 720) + '&q=80&auto=format&fit=crop';
    }

    function categoryOf(name, kind, city) {
        name = String(name || '');
        if (EXACT[name]) return EXACT[name];
        var i;
        for (i = 0; i < CITY_POOL.length; i++) {
            if (CITY_POOL[i][0].test(name)) return CITY_POOL[i][1];
        }
        for (i = 0; i < RULES.length; i++) {
            if (RULES[i][0].test(name)) return RULES[i][1];
        }
        var c = String(city || '');
        for (i = 0; i < CITY_POOL.length; i++) {
            if (CITY_POOL[i][0].test(c)) return CITY_POOL[i][1];
        }
        return kind === 'food' ? 'food' : 'nature';
    }

    /* 有本地实拍图的，直接用本地图（已核验画面与景点一致） */
    var EXACT_IMG = {
        '圣索菲亚教堂': 'images/cities/haerbin.jpg'
    };

    function cityOf(name, city) {
        var c = String(city || '').replace(/[^\u4e00-\u9fa5]/g, '');
        if (c && (CITY_IMG[c] || CITY_POI[c] || CITY_FALLBACK[c])) return c;
        /* 无明确城市时，只认「以城市名开头」的字符串，避免“中山路”误配“中山” */
        name = String(name || '');
        var k;
        for (k in CITY_POI) { if (name.indexOf(k) === 0) return k; }
        for (k in CITY_IMG) { if (name.indexOf(k) === 0) return k; }
        for (k in CITY_FALLBACK) { if (name.indexOf(k) === 0) return k; }
        /* “繁花 · 上海”这类「主题 · 城市」写法，取城市段 */
        var parts = name.split(/[·｜|、,，\/\s]+/);
        if (parts.length > 1) {
            for (var p = 1; p < parts.length; p++) {
                for (k in CITY_FALLBACK) { if (parts[p].indexOf(k) === 0) return k; }
            }
        }
        return '';
    }

    function poiImg(name, kind, city) {
        if (EXACT_IMG[name]) return EXACT_IMG[name];
        if (kind !== 'food' && !ICONIC[name]) {
            var hitCity = cityOf(name, city);
            if (hitCity) {
                if (CITY_POI[hitCity]) return CITY_POI[hitCity];
                if (CITY_IMG[hitCity]) return CITY_IMG[hitCity];
                /* 没有本地实拍的城市：只在“城市风景/城市名”封面场景用气质图，
                   具体景点继续按景点类型取图，避免长城配成故宫 */
                var pureName = String(name).replace(/[^\u4e00-\u9fa5]/g, '');
                if (CITY_FALLBACK[hitCity] && (name.indexOf('城市') >= 0 || name.indexOf('·') >= 0 || pureName === hitCity)) {
                    return url(P[CITY_FALLBACK[hitCity]], kind);
                }
            }
        }
        var cat = categoryOf(name, kind, city);
        var isJP = /日本|东京|京都|大阪|镰仓|秋田|北海道|奈良/.test(String(name) + String(city || ''));
        var pool = POOLS[cat] || POOLS.nature;
        if (cat === 'drink') {
            if (/啤酒|扎啤|精酿|生啤|原浆/.test(String(name))) pool = POOLS.beer;
            else if (/冰棍|冰激凌|冰淇淋|雪糕|冰糕/.test(String(name))) pool = POOLS.iceCream;
            else pool = [P.tea];
        }
        if (cat === 'street') pool = isJP ? [P.tokyoStreet, P.japanLantern] : [P.nightMarket];
        if (cat === 'food') {
            if (isJP) pool = POOLS.jpFood;
            else {
                var nm = String(name);
                if (/面|粉|米线|乌冬|拉面/.test(nm)) pool = POOLS.noodleDish;
                else if (/炒饭|盖饭|拌饭|抓饭|米饭|饭$/.test(nm)) pool = POOLS.riceBowl;
                else if (/冰棍|冰激凌|冰淇淋|雪糕|冰糕|刨冰/.test(nm)) pool = POOLS.iceCream;
                else if (/啤酒|扎啤|精酿|生啤|原浆/.test(nm)) pool = POOLS.beer;
                else if (/红肠|腊肠|香肠|火腿|熏肉/.test(nm)) pool = POOLS.sausage;
                else if (/锅包肉|猪排|鸡排|炸肉|炸鸡/.test(nm)) pool = POOLS.cutlet;
                else if (/肠|烤|腊|排骨|羊排|牛排|肉串|肉$/.test(nm)) pool = POOLS.bbq;
                else if (/饺|馍|饼|粑|烧卖|小笼|馄饨|团|糕|点心/.test(nm)) pool = POOLS.dimsum;
                else if (/虾|蟹|蛤|海鲜|贝/.test(nm)) pool = [P.shrimpPlate, P.ramenShrimp];
                else if (/茶|咖啡|酸奶|奶茶|果汁|茶饮|酒/.test(nm)) pool = [P.tea];
                else if (/火锅|炖|焖|烤|肉|鸡|鱼|肠|排|血旺|芋|豆|串/.test(nm)) pool = POOLS.meatDish;
                else pool = [P.dumplings, P.noodles];
            }
        }
        var id = pool[hash(String(name) + cat) % pool.length];
        return url(id, kind);
    }

    global.mylPOIImg = poiImg;
    global.mylPOICategory = categoryOf;
})(window);
