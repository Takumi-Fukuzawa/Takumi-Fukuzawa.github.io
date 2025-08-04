document.addEventListener("DOMContentLoaded", () => {
    // =======================
    // DOM要素の取得
    // =======================
    const infoPanel = document.getElementById("infoPanel"); // 情報パネル
    const infoContent = document.getElementById("infoContent"); // 情報の詳細コンテンツ
    const minimizeBtn = document.getElementById("minimizeBtn"); // 最小化ボタン
    const closeBtn = document.getElementById("closeBtn"); // 閉じるボタン
    const searchBox = document.getElementById("searchBox"); // 検索ボックス
    const searchButton = document.getElementById("searchButton"); // 検索ボタン
    const searchResults = document.getElementById("searchResults"); // 検索結果コンテナ
    const infoNumber = document.getElementById("infoNumber"); // 情報番号
    const infoTitle = document.getElementById("infoName"); // 情報のタイトル
    const markersContainer = document.getElementById("markers"); // マーカー用のコンテナ
    const contentWrapper = document.querySelector(".content-wrapper"); // 追加

    // =======================
    // 状態管理用の変数
    // =======================
    let activeInfo = null; // 現在表示中の情報ID
    let isMinimized = false; // パネルが最小化されているかどうか
    let isAnimating = false; // アニメーション実行中かどうか（連続操作防止）

    // 検索の遅延実行用のタイマー
    let searchTimeout = null;

    // =======================
    // 情報データ（各建物の詳細情報）
    // =======================
    // キー: 建物番号
    // 値: 建物の詳細情報（タイトル、説明文、画像パス、マーカーの座標）
    const infoData = {
        1: { 
            title: "理工13号館", 
            text: "理工13号館です。", 
            img: "assets/cm_photo_01.jpg",
            floorImg: "assets/floorImg/r_13.jpeg", 
            x: 27, y: 33,
            keywords: ["理工13号館", "電気電子工学科棟", "電子第2演習室",
                "電子第二演習室", "建築学コース実験室", "第1実験室", "第一実験室",
                "第2実験室", "第二実験室"],
            tag: ["理工学部"],
            lat:33.174131, 
            lng:131.607804
        },
        2: { 
            title: "理工9号館", 
            text: "理工9号館です。", 
            img: "assets/cm_photo_02.jpg",
            floorImg: "assets/floorImg/r_9.jpeg",
            x: 110, y: 73, 
            keywords: ["理工9号館", "機械・エネルギーシステム工学科棟",
                "エネルギー工学科棟", "第1学生実験室", "第一学生実験室",
                "第2学生実験室", "第二学生実験室"],
            tag: ["理工学部"],
            lat:33.174334, 
            lng:131.608685
        },
        3: { 
            title: "建築構造材料実験室棟A、B", 
            text: "建築構造材料実験室棟A、Bの詳細情報です。", 
            img: "assets/cm_photo_03.jpg", 
            x: 94, y: 92, 
            keywords: ["建築構造材料実験室棟", "実験室棟A", "実験室棟B"],
            tag: ["理工学部"],
            lat:33.173968, 
            lng:131.608655
        },
        4: { 
            title: "理工第2講義棟", 
            text: "理工第2講義棟", 
            img: "assets/cm_photo_04.jpg",
            floorImg: "assets/floorImg/r_dai2_net.png", 
            x: 118, y: 111, 
            keywords: ["理工第2講義棟", "105号室", "106号室", "206号室", "207号室"],
            tag: ["理工学部"],
            lat:33.174025, 
            lng:131.609073
        },
        5: { 
            title: "理工10号館", 
            text: "理工10号館の詳細情報です。", 
            img: "assets/cm_photo_05.jpg",
            floorImg: "assets/floorImg/r_10.jpeg", 
            x: 80, y: 130, 
            keywords: ["理工10号館", "福祉環境工学棟", "建築コース棟"],
            tag: ["理工学部"],
            lat:33.173818, 
            lng:131.608892
        },
        6: { 
            title: "理工11号館", 
            text: "理工11号館の詳細情報です。", 
            img: "assets/cm_photo_06.jpg", 
            x: 115, y: 135, 
            keywords: ["理工11号館"],
            tag: ["理工学部"],
            lat:33.173866, 
            lng:131.609195
        },
        7: { 
            title: "理工12号館", 
            text: "理工12号館の詳細情報です。", 
            img: "assets/cm_photo_07.jpg",
            floorImg: "assets/floorImg/r_12.jpeg", 
            x: 95, y: 162, 
            keywords: ["理工12号館", "全学研究推進機構"],
            tag: ["理工学部"],
            lat:33.173597, 
            lng:131.609211
        },
        8: { 
            title: "計算機棟（情報基盤センター、知能棟）", 
            text: "計算機棟（情報基盤センター、知能棟）の詳細情報です。", 
            img: "assets/cm_photo_08.jpg",
            floorImg: "assets/floorImg/r_keisanki.jpeg", 
            x: 149, y: 122, 
            keywords: ["計算機棟", "基盤センター", "知能棟", "情報基盤センター", "計算機演習室", "第1実習室", "第2実習室", "第3実習室"],
            tag: ["理工学部"],
            lat:33.17425, 
            lng:131.60948
        },
        9: { 
            title: "理工8号館", 
            text: "理工8号館の詳細情報です。", 
            img: "assets/cm_photo_09.jpg",
            floorImg: "assets/floorImg/r_8_net.png", 
            x: 122, y: 169, 
            keywords: ["理工8号館", "107号室 ", "108号室", "109号室"],
            tag: ["理工学部"],
            lat:33.17380, 
            lng:131.60962
        },
        10: { 
            title: "理工大講義棟（104号室）", 
            text: "理工大講義棟（104号室）の詳細情報です。", 
            img: "assets/cm_photo_10.jpg", 
            x: 185, y: 135, 
            keywords: ["104号室", "理工大講義棟"],
            tag: ["理工学部"],
            lat:33.174346, 
            lng:131.609936
        },
        11: { 
            title: "理工6号館", 
            text: "理工6号館の詳細情報です。", 
            img: "assets/cm_photo_11.jpg",
            floorImg: "assets/floorImg/r_6.jpg", 
            x: 175, y: 168, 
            keywords: ["理工6号館", "情報資料室", "計算機演習室1", "計算機演習室2"],
            tag: ["理工学部"],
            lat:33.17413, 
            lng:131.61000
        },       
        12: { 
            title: "理工7号館", 
            text: "理工7号館の詳細情報です。", 
            img: "assets/cm_photo_12.jpg",
            floorImg: "assets/floorImg/r_7.jpeg", 
            x: 135, y: 196, 
            keywords: ["理工7号館", "応用科学棟"],
            tag: ["理工学部"],
            lat:33.173814, 
            lng:131.609878
        },        
        13: { 
            title: "理工第3講義棟", 
            text: "理工第3講義棟の詳細情報です。", 
            img: "assets/cm_photo_13.jpg",
            floorImg: "assets/floorImg/r_dai3_net.png", 
            x: 128, y: 230, 
            keywords: ["理工第3講義棟", "理工第三講義棟", "111号室"], // 1??号室を追加
            tag: ["理工学部"],
            lat:33.173581, 
            lng:131.609967
        },
        14: { 
            title: "理工第1講義棟", 
            text: "理工第1講義棟の詳細情報です。", 
            img: "assets/cm_photo_14.jpg",
            floorImg: "assets/floorImg/r_dai1_net.png", 
            x: 203, y: 169, 
            keywords: ["理工第1講義棟", "理工第一講義棟", "メカトロ実験室",
                "ものづくり工房", "205号室", "204号室", "203号室",
                "メカトロ実験室", "エネルギーレーザー実験室", "エネルギーセミナー室"],
            tag: ["理工学部"],
            lat:33.174284, 
            lng:131.610187
        },        
        15: { 
            title: "理工5号館（基盤技術支援センター）", 
            text: "理工5号館（基盤技術支援センター）の詳細情報です。", 
            img: "assets/cm_photo_15.jpg", 
            x: 169, y: 216, 
            keywords: ["基板技術支援センター", "理工5号館"],
            tag: ["理工学部"],
            lat: 33.173918, 
            lng:131.610321
        },        
        16: { 
            title: "理工2号館", 
            text: "理工2号館の詳細情報です。", 
            img: "assets/cm_photo_16.jpg",
            floorImg: "assets/floorImg/r_2.jpeg", 
            x: 243, y: 169, 
            keywords: ["理工2号館", "計測工学第1実験室", "計測工学第一実験室",
                "機械第2セミナー室", "機械第二セミナー室", "放電プラズマ第3実験室",
                "放電プラズマ第三実験室", "放電プラズマ第2実験室", "放電プラズマ第二実験室",
                "放電プラズマ第1実験室", "放電プラズマ第一実験室", "機械コース就職支援室",
                "機械講義室", "機械セミナー室", "磁気工学第1実験室", "磁気工学第一実験室",
                "磁気工学第2実験室", "磁気工学第二実験室", "電気機器実験室",
                "材料力学第1実験室", "材料力学第一実験室", "高電圧実験室",
                "放電プラズマ第5実験室", "放電プラズマ第五実験室"],
            tag: ["理工学部"],
            lat:33.174645, 
            lng:131.610552
        },
        17: { 
            title: "理工3号館", 
            text: "理工3号館の詳細情報です。", 
            img: "assets/cm_photo_17.jpg", 
            x: 230, y: 196, 
            keywords: [ "理工3号館"],
            tag: ["理工学部"],
            lat:33.174305, 
            lng:131.610628
        },
        18: { 
            title: "理工4号館", 
            text: "理工4号館の詳細情報です。", 
            img: "assets/cm_photo_18.jpg", 
            x: 209, y: 216, 
            keywords: ["理工4号館"],
            tag: ["理工学部"],
            lat:33.174082, 
            lng:131.610570
        }, 
        19: { 
            title: "理工1号館（事務棟）", 
            text: "理工1号館（事務棟）の詳細情報です。", 
            img: "assets/cm_photo_19.jpg", 
            x: 270, y: 135, 
            keywords: ["理工1号館", "事務室", "事務棟"],
            tag: ["理工学部"],
            lat:33.174928, 
            lng:131.610510
        },
        20: { 
            title: "クライシスマネジメント機構", 
            text: "クライシスマネジメント機構の詳細情報です。", 
            img: "assets/cm_photo_20.jpg", 
            x: 220, y: 95,
            keywords: ["クライシスマネジメント機構", "減災・復興デザイン教育研究センター"],
            tag: ["その他"],　 // タグ内容の検討が必要
            lat: 33.17491, 
            lng:131.60962
        },
        21: { 
            title: "研究マネジメント機構", 
            text: "研究マネジメント機構の詳細情報です。", 
            img: "assets/cm_photo_21.jpg", 
            x: 195, y: 75,  
            keywords: ["研究マネジメント機構", "研究推進課"],
            tag: ["その他"], // タグ内容の検討が必要
            lat:33.174690, 
            lng:131.609533
        },
        22: { 
            title: "合唱共用施設", 
            text: "合唱共用施設の詳細情報です。", 
            img: "assets/cm_photo_22.jpg",  /*画像はノーイメージ*/
            x: 344, y: 74, 
            keywords: ["合唱共用施設"],
            tag: ["福利厚生サークル施設"],
            /*
            グーグルマップで案内できない。別の処理が必要
            */
        },
        23: { 
            title: "器楽共用施設", 
            text: "器楽共用施設の詳細情報です。", 
            img: "assets/cm_photo_23.jpg", 
            x: 365, y: 199, 
            keywords: ["器楽共用施設"],
            tag: ["福利厚生サークル施設"],
            lat:33.175052, 
            lng:131.611654
        },
        24: { 
            title: "文化系課外活動共用施設", 
            text: "文化系課外活動共用施設の詳細情報です。", 
            img: "assets/cm_photo_24.jpg", 
            x: 342, y: 245, 
            keywords: ["課外活動共用施設"],
            tag: ["福利厚生サークル施設"],
            lat:33.17478, 
            lng:131.61185
        },
        25: { 
            title: "ファミリーマート", 
            text: "ファミリーマートの詳細情報です。", 
            img: "assets/cm_photo_25.jpg", 
            x: 330, y: 268, 
            keywords: ["ファミリーマート", "コンビニエンスストア", "ファミマ"],
            tag: ["福利厚生サークル施設"],
            lat:33.17446, 
            lng:131.61182
        },
        26: { 
            title: "大分大学生活協同組合", 
            text: "大分大学生活協同組合の詳細情報です。", 
            img: "assets/cm_photo_26.jpg", 
            x: 305, y: 287, 
            keywords: ["売店", "大学生協", "大分大学生活協同組合"],
            tag: ["福利厚生サークル施設"],
            lat:33.17436, 
            lng:131.61189
        },
        27: { 
            title: "学生交流会館 B-Forêt（食堂）", 
            text: "学生交流会館 B-Forêt（食堂）の詳細情報です。", 
            img: "assets/cm_photo_27.jpg", 
            x: 297, y: 351, 
            keywords: ["食堂", "ビフォーレ"],
            tag: ["福利厚生サークル施設"],
            lat:33.17366, 
            lng:131.61219
        },
        28: { 
            title: "第3体育館", 
            text: "第3体育館の詳細情報です。", 
            img: "assets/cm_photo_28.jpg", 
            x: 250, y: 371, 
            keywords: ["第3体育館", "第三体育館"],
            tag: ["体育施設"],
            lat:33.173460, 
            lng:131.612226
        },
        29: { 
            title: "武道場", 
            text: "武道場の詳細情報です。", 
            img: "assets/cm_photo_29.jpg", 
            x: 300, y: 405, 
            keywords: ["武道場"],
            tag: ["体育施設"],
            lat:33.173413, 
            lng:131.612776
        },
        30: { 
            title: "合宿研修室", 
            text: "合宿研修室の詳細情報です。", 
            img: "assets/cm_photo_30.jpg", 
            x: 320, y: 415, 
            keywords: ["合宿研修室"],
            tag: ["体育施設"],
            lat:33.173442, 
            lng:131.613057
        },
        31: { 
            title: "第2体育館", 
            text: "第2体育館の詳細情報です。", 
            img: "assets/cm_photo_31.jpg", 
            x: 292, y: 432, 
            keywords: ["第2体育館", "第二体育館"],
            tag: ["体育施設"],
            lat:33.17328, lng:131.61293 
        },
        32: { 
            title: "第1体育館・剣道場", 
            text: "第1体育館・剣道場の詳細情報です。", 
            img: "assets/cm_photo_32.jpg", 
            x: 358, y: 473, 
            keywords: ["第1体育館・剣道場", "第一体育館"],
            tag: ["体育施設"],
            lat:33.17336, 
            lng:131.61407

        },
        33: { 
            title: "卓球場", 
            text: "卓球場の詳細情報です。", 
            img: "assets/cm_photo_33.jpg", 
            x: 314, y: 480, 
            keywords: ["卓球場"],
            tag: ["体育施設"],
            lat:33.17312, lng:131.61370

        },
        34: { 
            title: "体育系課外活動部室C", 
            text: "体育系課外活動部室C", 
            img: "assets/cm_photo_34.jpg", 
            x: 328, y: 500, 
            keywords: ["体育系課外活動部室C"],
            tag: ["体育施設"],
            lat:33.173064, 
            lng:131.613884
        },
        35: { 
            title: "プール更衣室", 
            text: "プール更衣室の詳細情報です。", 
            img: "assets/cm_photo_35.jpg", 
            x: 340, y: 516, 
            keywords: ["プール更衣室"],
            tag: ["体育施設"],
            lat:33.173064, 
            lng:131.613884
        },
        36: { 
            title: "体育課外活動共用施設", 
            text: "体育課外活動共用施設の詳細情報です。", 
            img: "assets/cm_photo_36.jpg", 
            x: 426, y: 426, 
            keywords: ["体育課外活動共用施設"],
            tag: ["福利厚生サークル施設"],
            lat:33.17411, lng:131.61385
        },
        37: { 
            title: "体育系課外活動部室A・B", 
            text: "体育系課外活動部室A・Bの詳細情報です。", 
            img: "assets/cm_photo_37.jpg", 
            x: 419, y: 500, 
            keywords: ["体育系課外活動部室A", "体育系課外活動部室B"],
            tag: ["体育施設"],
            lat:33.173845, lng:131.614433
        },
        38: { 
            title: "水泳プール", 
            text: "水泳プールの詳細情報です。", 
            img: "assets/cm_photo_38.jpg", 
            x: 365, y: 527, 
            keywords: ["水泳プール"],
            tag: ["体育施設"],
            lat:33.17302, lng:131.61429
        },
        39: { 
            title: "テニスコート", 
            text: "テニスコートの詳細情報です。", 
            img: "assets/cm_photo_39.jpg", 
            x: 385, y: 581, 
            keywords: ["テニスコート"],
            tag: ["体育施設"],
            lat:33.173426, lng:131.614157
        },
        40: { 
            title: "弓道場", 
            text: "弓道場の詳細情報です。", 
            img: "assets/cm_photo_40.jpg",  //ちゃんとした画像がない
            x: 425, y: 614, 
            keywords: ["弓道場"],
            tag: ["体育施設"],
            lat:33.17297, lng:131.61571
        },
        41: { 
            title: "陸上競技場", 
            text: "陸上競技場の詳細情報です。", 
            img: "assets/cm_photo_41.jpg", 
            x: 520, y: 452, 
            keywords: ["陸上競技場"],
            tag: ["体育施設"],
            lat:33.17480, lng:131.61508
        },
        42: { 
            title: "ラグビー場", 
            text: "ラグビー場の詳細情報です。", 
            img: "assets/cm_photo_42.jpg", 
            x: 533, y: 560, 
            keywords: ["ラグビー場"],
            tag: ["体育施設"],
            lat:33.174050, lng:131.615921
        },
        43: { 
            title: "技術・美術棟", 
            text: "技術・美術棟の詳細情報です。", 
            img: "assets/cm_photo_43.jpg",
            floorImg: "assets/floorImg/gizyutu_bizyutu.png", 
            x: 440, y: 149, 
            keywords: ["技術・美術棟", "技術棟"],
            tag: ["教育学部"],
            lat:33.176056, lng:131.612155
        },
        44: { 
            title: "音楽室棟", 
            text: "音楽室棟の詳細情報です。", 
            img: "assets/cm_photo_44.jpg",
            floorImg: "assets/floorImg/ongakutou.png", 
            x: 490, y: 122, 
            keywords: ["音楽室棟", "音楽棟"],
            tag: ["教育学部"],
            lat:33.176474, lng:131.612343
        },
        45: { 
            title: "多目的棟", 
            text: "多目的棟の詳細情報です。", 
            img: "assets/cm_photo_45.jpg", 
            x: 520, y: 162, 
            keywords: ["多目的棟"],
            tag: ["福祉健康科学部"],
            lat:33.176604, lng:131.612756

        },
        46: { 
            title: "研究棟", 
            text: "研究棟の詳細情報です。", 
            img: "assets/cm_photo_46.jpg", 
            x: 547, y: 150, 
            keywords: ["研究棟"],
            tag: ["福祉健康科学部"],
            lat:33.176751, lng:131.612951
        },
        47: { 
            title: "管理棟（事務部）", 
            text: "管理棟（事務部）の詳細情報です。", 
            img: "assets/cm_photo_47.jpg", 
            x: 540, y: 169, 
            keywords: ["管理棟", "事務部"],
            tag: ["福祉健康科学部"],
            lat:33.176612, lng:131.612995
        },
        48: { 
            title: "福祉健康・教育合同棟（家庭棟）", 
            text: "福祉健康・教育合同棟（家庭棟）の詳細情報です。", 
            img: "assets/cm_photo_48.jpg",
            floorImg: "assets/floorImg/kateitou.png", 
            x: 482, y: 168, 
            keywords: ["福祉健康棟", "教育合同棟", "家庭棟",
                "111講義室", "112講義室", "113講義室", "114講義室",
                "211講義室", "212講義室", "213講義室", "214講義室",
                "義肢装具室","実習室", "水治療学実習室", "評価学実習室",
                "治療学実習室", "実験室1", "実験室2", "神経機能計測実習室",
                "呼気ガス分析実習室", "運動療法実習室", "動作解析室",
                "ADL実習室", "調理実習室", "演習室9", "演習室10", "被服実習室"],
            tag: ["福祉健康科学部", "教育学部"], // タグ内容の検討が必要
            lat:33.176425, lng:131.612569
        },
        49: { 
            title: "実習棟", 
            text: "実習棟の詳細情報です。", 
            img: "assets/cm_photo_49.jpg", 
            x: 513, y: 203, 
            keywords: ["実習棟"],
            tag: ["福祉健康科学部"],
            lat:33.176195, lng:131.613191
        },
        50: { 
            title: "教育学部棟", 
            text: "教育学部棟の詳細情報です。", 
            img: "assets/cm_photo_50.jpg",
            floorImg: "assets/floorImg/kyouiku_net.png", 
            x: 452, y: 230, 
            keywords: ["教育学部棟", "100号室", "200号室", "201号室", "202号室",
                "203号室", "204号室", "300号室", "301号室", "302号室", "303号室",
                "304号室", "401号室", "402号室", "403号室", "404号室"],
            tag: ["教育学部"],
            lat:33.17553, lng:131.61296
        },
        51: { 
            title: "教育支援課・地域連携プラットフォーム", 
            text: "教育支援課・地域連携プラットフォーム推進機構の詳細情報です", 
            img: "assets/cm_photo_51.jpg",
            floorImg: "assets/floorImg/kyouikusienka.png", 
            x: 439, y: 294, 
            keywords: ["地域連携プラットフォーム推進機構", "教育支援課",
                ""],
            tag: ["福祉健康科学部", "教育学部"], // タグ内容の検討が必要
            lat:33.17516, lng:131.61317
        },
        52: { 
            title: "第2大講義室", 
            text: "第2大講義室", 
            img: "assets/cm_photo_52.jpg",
            floorImg: "assets/floorImg/dai2daikougisitu.png", 
            x: 412, y: 304, 
            keywords: ["第2大講義室", "第二大講義室"],
            tag: ["教養教育/学生支援部"],
            lat:33.174825, lng:131.613092
        },
        53: { 
            title: "キャリア支援室", 
            text: "キャリア支援室", 
            img: "assets/cm_photo_53.jpg",
            floorImg: "assets/floorImg/kyariasien.png", 
            x: 432, y: 317, 
            keywords: ["キャリア支援室"],
            tag: ["教養教育/学生支援部"],
            lat:33.17482, lng:131.61331
        },
        54: { 
            title: "第1大講義室", 
            text: "第1大講義室", 
            img: "assets/cm_photo_54.jpg",
            floorImg: "assets/floorImg/dai1daikougisitu.png", 
            x: 452, y: 331, 
            keywords: ["第1大講義室", "第一大講義室"],
            tag: ["教養教育/学生支援部"],
            lat:33.175108, lng:131.613548
        },
        55: { 
            title: "入試課／学生・留学生支援課", 
            text: "入試課／学生・留学生支援課の詳細情報です。", 
            img: "assets/cm_photo_55.jpg",
            floorImg: "assets/floorImg/nyuusika.png", 
            x: 435, y: 376, 
            keywords: ["入試課", "学生支援課", "留学生支援課", "学生・留学生支援課"],
            tag: ["教養教育/学生支援部"],
            lat:33.17477, lng:131.61353
        },
        56: { 
            title: "図書館／学術情報課", 
            text: "図書館／学術情報課の詳細情報です。", 
            img: "assets/cm_photo_56.jpg",
            floorImg: "assets/floorImg/tosyokan.png", 
            x: 479, y: 344, 
            keywords: ["図書館", "学術情報課"],
            tag: ["学術情報拠点"],
            lat:33.175368528588905, lng:131.61398306681764
        },
        57: { 
            title: "経済学部棟", 
            text:  "経済学部棟の詳細情報です。", 
            img: "assets/cm_photo_57.jpg",
            floorImg: "assets/floorImg/keizai_net.png", 
            x: 540, y: 310, 
            keywords: ["経済学部棟", "104号", "管理研究棟", "大講義棟", "演習棟"],
            tag: ["経済学部"],
            lat:33.175623011539734, lng:131.61401126671598
        },
        58: { 
            title: "保健管理センター", 
            text: "保健管理センターの詳細情報です。", 
            img: "assets/cm_photo_58.jpg", 
            x: 560, y: 257, 
            keywords: ["保険センター", "保健管理センター"],
            tag: ["その他"], // タグ内容の検討が必要
            lat:33.176107, lng:131.613994
        },
        59: { 
            title: "ダイバーシティ推進本部（男女共同参画推進室）", 
            text: "ダイバーシティ推進本部（男女共同参画推進室）の詳細情報です。", 
            img: "assets/cm_photo_59.jpg", 
            x: 573, y: 233, 
            keywords: ["ダイバーシティー推進本部", "男女共同参画推進室"],
            tag: ["本部管理棟"],
            lat:33.176566, lng:131.613836
        },
        60: { 
            title: "学生会館", 
            text: "学生会館の詳細情報です。", 
            img: "assets/cm_photo_60.jpg", 
            x: 601, y: 265, 
            keywords: ["学生会館"],
            tag: ["福利厚生サークル施設"],
            lat:33.176488369583815, lng:131.61436189551517
        },
        61: { 
            title: "ぴあROOM", 
            text: "ぴあROOMの詳細情報です。", 
            img: "assets/cm_photo_61.jpg", 
            x: 614, y: 277, 
            keywords: ["ぴあROOM"],
            tag: ["福利厚生サークル施設"],
            lat:33.17651081937326, lng:131.6143565310975
        },
        62: { 
            title: "門衛所", 
            text: "門衛所の詳細情報です。", 
            img: "assets/cm_photo_62.jpg", 
            x: 655, y: 351, //x: 485, y: 260
            keywords: ["門衛所", "守衛"],
            tag: ["本部管理棟"],
            lat:33.17669424214466, lng:131.61528999910917
        },
        63: { 
            title: "学生寮／業務支援室", 
            text: "学生寮／業務支援室の詳細情報です。", 
            img: "assets/cm_photo_63.jpg", 
            x: 655, y: 486, //x: 485, y: 360
            keywords: ["学生寮", "業務支援室"],
            tag: ["寄宿舎"],
            lat:33.175393, lng:131.616316
        },
        64: { 
            title: "備蓄庫", 
            text: "備蓄庫の詳細情報です。", 
            img: "assets/cm_photo_64.jpg", //工事中画像
            x: 614, y: 587, //x: 455, y: 435
            keywords: ["備蓄庫"],
            tag: ["その他"],
            lat:33.174738, lng:131.616938
        },
        65: { 
            title: "本部管理棟", 
            text: "本部管理棟の詳細情報です。", 
            img: "assets/cm_photo_65.jpg", 
            x: 716, y: 257, //x: 530, y: 190
            keywords: ["総務課", "企画課", "人事課", "財務企画課",
                "経理課","施設企画課", "監視室", "IRセンター",
                "研究マネジメント機構実務総括本部", "URA室"],
            tag: ["本部管理棟"],
            lat: 33.17745858696872, lng: 131.61504464894128
        },
        66: { 
            title: "野球場", 
            text: "野球場の詳細情報です。", 
            img: "assets/cm_photo_66.jpg", 
            x: 763, y: 392, //x: 565, y: 290
            keywords: ["野球場"],
            tag: ["体育施設"],
            lat:33.17682101760607, lng:131.6168149067704

        },
        67: { 
            title: "留学生寄宿舎", 
            text: "留学生寄宿舎の詳細情報です。", 
            img: "assets/cm_photo_67.jpg", 
            x: 851, y: 486, // 630, 360
            keywords: ["留学生寄宿舎"],
            tag: ["寄宿舎"],
            lat:33.176738661312505, lng:131.61815473181832
        },
        68: { 
            title: "ローソン 大分大学駅前店", 
            text: "ローソン 大分大学駅前店の詳細情報です。", 
            img: "assets/cm_photo_68.jpg", 
            x: 878, y: 540, // x: 650, y: 400
            keywords: ["ローソン", "コンビニエンスストア"],
            tag: ["福利厚生サークル施設"],
            lat:33.17678669728281, lng:131.61863632668695
        },
        69: { 
            title: "B-Core", 
            text: "B-Coreの詳細情報です。", 
            img: "assets/ビコア.jpg", 
            x: 290, y: 307, 
            keywords: ["B-core", "ビーコア"],
            tag: ["理工学部"], // タグ内容の検討が必要
            lat:33.1737596,lng:131.6127838
        },
        70: { 
            title: "教養棟", 
            text: "教養棟の詳細情報です。", 
            img: "assets/教養棟.jpg",
            x: 418, y: 342, 
            keywords: ["教養棟", "13号室", "14号室", "21号室", "22号室",
                "23号室", "24号室", "25号室", "26号室", "27号室", "28号室",
                "31号室","32号室", "35号室", "41号室", "42号室"],
            tag: ["教養教育/学生支援部"],
            lat:33.17477, lng:131.61353
        },
    };

    /**
     * マーカーを生成してマップ上に配置する関数
     * 各建物の位置にクリック可能なマーカーを作成し、
     * クリックイベントを設定して建物情報の表示を可能にする
     */
    function generateMarkers() {
        Object.keys(infoData).forEach((id) => {
            const info = infoData[id];

            // マーカー要素の作成
            const marker = document.createElement("div");
            marker.classList.add("marker");
            marker.setAttribute("data-info", id);
            if (isMobileDevice()) {
                marker.style.top = `${info.y / 1.5}px`;
                marker.style.left = `${info.x / 1.5}px`;
            }
            else {
                marker.style.top = `${info.y}px`;
                marker.style.left = `${info.x}px`;
            }

            // マーカー番号の表示
            const markerText = document.createElement("span");
            markerText.textContent = id;
            marker.appendChild(markerText);
            markersContainer.appendChild(marker);

            // マーカークリック時のイベントリスナー追加
            marker.addEventListener("click", () => showInfo(id));
        });
    }

    function searchAndShowInfo(query) {
        const normalizedQuery = query.toLowerCase().trim();
        if (!normalizedQuery) {
            searchResults.classList.remove("active");
            return;
        }

        const results = [];
        const seenTitles = new Set(); // 追加：重複チェック用

        // 1. 建物番号で検索
        if (!isNaN(normalizedQuery) && infoData[normalizedQuery]) {
            const title = infoData[normalizedQuery].title;
            if (!seenTitles.has(title)) {
                seenTitles.add(title);
                results.push({
                    id: normalizedQuery,
                    title: title
                });
            }
        }

        // 2. タイトルとキーワードで検索
        for (const id in infoData) {
            const info = infoData[id];
            const title = info.title;

            // 既に同じタイトルが登録されている場合はスキップ
            if (seenTitles.has(title)) continue;

            if (title.toLowerCase() === normalizedQuery ||
                info.keywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))) {
                seenTitles.add(title);
                results.push({
                    id: id,
                    title: title
                });
            }
        }

        // 検索結果の表示
        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => `
                <div class="search-result-item" data-id="${result.id}">
                    <span class="result-number">${result.id}</span>
                    <span class="result-title">${result.title}</span>
                </div>
            `).join("");
            searchResults.classList.add("active");

            // 検索結果アイテムのクリックイベント
            searchResults.querySelectorAll(".search-result-item").forEach(item => {
                item.addEventListener("click", () => {
                    const id = item.getAttribute("data-id");
                    showInfo(id);
                    searchResults.classList.remove("active");
                    searchBox.value = "";
                });
            });
        } else {
            searchResults.classList.remove("active");
        }
    }

    /**
     * タグによって検索結果を絞る関数
     * 
     * 検索ボックスの下部にあるタグボタンをクリックすると、
     * 現在表示されている検索結果一覧をタグと一致するものだけに絞る
     */
    function narrowSearch(setTag, results) { // 選んだtag, 配列の中身
        if (results.length > 0) {
            // 配列の中身を取得
            // tag情報を一つずつチェックする
            // 選んだtagと配列内の要素の持つtagが一致しなかったら配列から削除する
        } else {

        }
    }

    /**
     * デバイスがモバイルかどうかを判定する関数
     * ビューポートの幅に基づいてデバイスタイプを判定
     * 
     * @returns {boolean} モバイル端末の場合はtrue、それ以外はfalse
     */
    function isMobileDevice() {
        return window.innerWidth <= 768; // 768px以下をモバイルとして扱う
    }

    /**
     * 指定された建物情報を表示する関数
     * デバイスタイプに応じて、サイドパネルまたはボトムシートで情報を表示
     * 
     * @param {number} infoId - 表示する建物情報のID
     */
    function showInfo(infoId) {
        // アニメーション実行中は新たな表示を防止
        if (isAnimating) return;

        // 同じ情報が表示中の場合は閉じる
        if (activeInfo === infoId) {
            closeInfoPanel();
            return;
        }

        // モバイルで同じ情報が表示中の場合はボトムシートを閉じる
        if(isMobileDevice() && activeInfo === infoId){
            window.closeBottomSheet();
            return;
        }

        // 指定されたIDの建物情報を取得
        const info = infoData[infoId];
        if (!info) return;

        // モバイルデバイスの場合
        if (isMobileDevice()) {
            // BottomSheetの内容を更新
            window.updateBottomSheetContent(
                { number: infoId, text: info.title},
                `<img src="${info.img}" alt="情報${infoId}" class="info-image">
                <p>${info.text}</p>${info.floorImg ? `<button class="floor-button" type="button" data-img="${info.floorImg}">フロアマップ</button>` : ''}`              
            );

            const navigationButton = document.querySelector(".navigation-button");
            if (navigationButton) {
                // 名前付き関数でイベントリスナーを定義し直す
                function handleNavClick() {
                    const googleMapUrl = `https://www.google.com/maps?q=${info.lat},${info.lng}`;
                    window.open(googleMapUrl, "_blank");
                }
                
                let newNavigationButton = navigationButton.cloneNode(true);
                navigationButton.parentNode.replaceChild(newNavigationButton, navigationButton);
                newNavigationButton.addEventListener("click", handleNavClick);
            }
    

            // BottomSheetを表示
            window.openBottomSheet();
            return;
        }
        // デスクトップの場合
        else {
            // infoPanelの内容を更新
            infoNumber.textContent = infoId;
            infoTitle.textContent = info.title;
            //infoTag.textContent = info.tag; delete
            infoContent.innerHTML = `
                <img src="${info.img}" alt="情報${infoId}" class="info-image">
                <p>${info.text}</p>${info.floorImg ? `<button class="floor-button" data-img="${info.floorImg}">フロアマップ</button>` : ''}
            `;

            // パネルとマップの位置を調整
            infoPanel.classList.add("active");
            infoPanel.classList.remove("minimized");
            contentWrapper.classList.add("panel-active");
        }

        const navigationButton = document.querySelector(".panel-navigation-button"); // デスクトップ用のナビゲーションボタンを選択
        if (navigationButton) {
            // 名前付き関数でイベントリスナーを定義
            function handleNavClick() {
                // Google MapsのURLを作成し、リンクを新しいタブで開く
                const googleMapUrl = `https://www.google.com/maps?q=${info.lat},${info.lng}`;
                window.open(googleMapUrl, "_blank");
        }

            // 既存のボタンをクローンして新しいボタンに置き換え
            let newNavigationButton = navigationButton.cloneNode(true);
            navigationButton.parentNode.replaceChild(newNavigationButton, navigationButton);

            // 新しくクローンしたボタンにクリックイベントを追加
            newNavigationButton.addEventListener("click", handleNavClick);
        }


        // 状態を更新
        isAnimating = true;
        isMinimized = false;
        activeInfo = infoId;

        // アニメーション完了後にフラグをリセット
        setTimeout(() => {
            isAnimating = false;
        }, 100);
    }

    /**
     * 情報パネルを閉じる関数
     * パネルを非表示にし、関連する状態をリセットする
     */
    function closeInfoPanel() {
        if (isAnimating) return;

        isAnimating = true;
        // パネルを非表示にし、最小化状態も解除
        infoPanel.classList.remove("active", "minimized");
        contentWrapper.classList.remove("panel-active"); // 追加

        // アニメーション完了後に内容をクリア
        setTimeout(() => {
            infoContent.textContent = "";
            isAnimating = false;
        }, 100);

        // 状態をリセット
        isMinimized = false;
        activeInfo = null;
    }

    // 平面図モーダル表示
    ["click", "pointerup"].forEach(eventType => {
        document.addEventListener(eventType, (e) => {
            if (e.target.classList.contains("floor-button")) {
                e.preventDefault();
                const imgSrc = e.target.getAttribute("data-img");

                // すでにモーダルがあったら消す
                const existingModal = document.querySelector(".image-modal");
                if (existingModal) {
                    existingModal.remove();
                }

                // 新しくモーダルを作る
                const modal = document.createElement("div");
                modal.className = "image-modal";
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">×</span>
                        <img src="${imgSrc}" class="modal-image">
                    </div>
                `;
                document.body.appendChild(modal);

                // バツボタンでモーダルを閉じる
                modal.querySelector(".close-modal").addEventListener("click", () => {
                    modal.remove();
                });
            }
        }, { passive: false });
    });

    /**
     * ウィンドウリサイズ時の処理
     * デバイスの種類が変更された場合に表示方法を切り替える
     */ 
    window.addEventListener('resize', () => {
        markersContainer.innerHTML = "";
        generateMarkers();
        
        if (!activeInfo) return;

        if (isMobileDevice()) {
            // デスクトップからモバイルに切り替わった場合
            infoPanel.classList.remove("active", "minimized");
            contentWrapper.classList.remove("panel-active");
            showInfo(activeInfo);
        } else {
            // モバイルからデスクトップに切り替わった場合
            window.closeBottomSheet();
            showInfo(activeInfo);
        }
    });

    // =======================
    // イベントリスナーの設定
    // =======================

    // 検索ボックスからフォーカスが外れた時に検索結果を非表示
    document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove("active");
        }
    });

    // 検索ボックスの入力値が変更された時に検索を実行（遅延付き）
    searchBox.addEventListener("input", () => {
        // 前回のタイマーをクリア
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        // 新しいタイマーを設定（300ms後に検索を実行）
        searchTimeout = setTimeout(() => {
            searchAndShowInfo(searchBox.value);
        }, 300);
    });

    // 検索ボタンのクリックイベント
    searchButton.addEventListener("click", () => {
        searchAndShowInfo(searchBox.value);
    });

    // 検索ボックスでEnterキーを押した時のイベント
    searchBox.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            searchAndShowInfo(searchBox.value);
        }
    });

    // 最小化ボタンのクリックイベント
    minimizeBtn.addEventListener("click", () => {
        if (isAnimating) return;

        isAnimating = true;
        // パネルの最小化状態を切り替え
        infoPanel.classList.toggle("minimized");
        
        // 最小化状態に応じてマップの位置を調整
        if (!isMinimized) {
            contentWrapper.classList.remove("panel-active");
        } else {
            contentWrapper.classList.add("panel-active");
        }
        
        isMinimized = !isMinimized;

        // アニメーション完了後にフラグをリセット
        setTimeout(() => {
            isAnimating = false;
        }, 100);
    });

    // 閉じるボタンのクリックイベント
    closeBtn.addEventListener("click", () => {
        closeInfoPanel();
    });

    // 初期化時にマーカーを生成
    generateMarkers();
});

