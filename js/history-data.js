'use strict';

// 「了解歷史」內文與標題,原樣複製自 game_live 專案 (src/core/i18n.js) 的 about.* 條目(中 / 日 / 英)。
// 段落開頭的 # • ◦ > 是樣式標記:標題 / 項目 / 次項目 / 次項目接續。
const HISTORY_LINKS = { fanPage: 'https://www.facebook.com/profile.php?id=61594197187795' };

const HISTORY_TEXT = {
  zh: {
      'about.0': '關於賽車遊戲', 'about.1': '概念結構', 'about.2': '關於Arc遊戲庫', 'about.soon': '（內容準備中）',
      'about.body.0':
        '賽車遊戲（Racing Games）的發展史是一部從「像素方塊」走向「現實模擬」與「開放世界」的科技演進史。 自 1970 年代誕生以來，賽車遊戲不僅滿足了人類對速度與改裝的渴望，更無數次將遊戲硬體與圖形技術推向極限。\n' +
        '賽車遊戲歷史發展的四大核心階段：\n' +
        '# 第一階段：街機的黃金啟航（1970s – 1990s）\n' +
        '在電腦與家用主機普及前，賽車遊戲的舞台完全屬於街機（Arcade）。這時期的遊戲核心在於刺激的速度感與時間倒數的壓迫感。\n' +
        '• 1974 年《Gran Trak 10》： 由 Atari 推出的街機，被廣泛視為史上第一款投幣式賽車遊戲。它使用黑白點陣畫面，並首次引進了實體方向盤、排檔桿與腳踏板。\n' +
        '• 1982 年《Pole Position》： 由萬代南夢宮（Bandai Namco）推出，這款遊戲奠定了現代賽車遊戲的基石。它擺脫了鳥瞰視角，首創追尾第三人稱視角，並加入了排位賽機制。\n' +
        '• 1986 年《OutRun》： SEGA 的傳奇作品，帶來非線性的分歧賽道、法拉利跑車、悠閒的加州海岸風情與可自由切換的廣播音樂。它讓賽車遊戲從「冰冷的競技」轉變為一種「駕駛的享受」。\n' +
        '# 第二階段：模擬劃分與百花齊放（1990s 後半 – 2000s）\n' +
        '隨著 3D 繪圖晶片（如 3dfx Voodoo）與家用主機的效能爆炸性突破，賽車遊戲在 1997 年前後出現了巨大的流派劃分，一夜之間從單一類別演變成三大市場：\n' +
        '• 硬派真實模擬（Sim Racing）： 1997 年 SONY 推出 PlayStation 獨佔的《Gran Turismo》（跑車浪漫旅）。它不再只是踩油門，而是強調輪胎抓地力、車重轉移、考取虛擬駕照與真實車廠授權，證明了「擬真汽車生活」擁有無比龐大的市場。\n' +
        '• 街頭文化與改裝（Arcade/Street）： 隨著電影《玩命關頭》風靡全球，EA 於 2003、2004 年相繼推出《極速快感：飆風再起》（Need for Speed: Underground 1 & 2）。遊戲引入豐富的霓虹燈、車體改裝系統與警匪追逐，將街頭賽車文化推向巔峰。\n' +
        '• 道具與閤家歡樂（Party/Kart）： 1992 年誕生的《馬力歐賽車》（Mario Kart）系列在這一時期穩定奠定其「派對王者」地位，用友情破壞的道具機制和極高的流暢度，成為全家大小的娛樂首選。\n' +
        '# 裂痕與硬體革命：娛樂與專業的兩極化（2000s 末 – 2010s 初）\n' +
        '在這個時期，基礎的 3D 街機逐漸式微，賽車遊戲走向了更加極端的兩極化分工。\n' +
        '• 核心線上模擬： 2008 年《iRacing》上線，它採取高昂的訂閱制與嚴格的硬體門檻（必須配備方向盤），專門服務真實車手與狂熱硬派玩家，後來甚至成為許多 F1 車手在現實賽季外的虛擬訓練工具。\n' +
        '• 輕度擬真（Simcade）： 傳統大作如《Gran Turismo》與微軟的《Forza Motorsport》（極限競速）系列則在中間築起高牆，既保有逼真的物理，又能讓玩家用手把輕鬆遊玩。\n' +
        '# 第四階段：開放世界與現代主導（2012 – 至今）\n' +
        '現代玩家不再滿足於固定的封閉賽道，「把整個國家變成你的賽車場」成為了近十年的顯學。\n' +
        '• 《Forza Horizon》（極限競速：地平線）系列： 自 2012 年首作誕生以來，該系列逐漸成為全球影響力最大的賽車遊戲。它開創了極致美麗的開放世界、歡樂的音樂節氛圍，以及極高自由度的駕駛體驗。\n' +
        '• 多功能地圖與電競化： 諸如《The Crew》（飆酷車神）等作品甚至將整個美國地圖縮小放入遊戲中。同時，現代賽車遊戲與虛擬賽車電競（Sim Racing Esports）高度結合，優秀的虛擬賽車手現在甚至有機會直接被職業車隊簽下，成為真正的賽車手。',
      // 「概念結構」內文（作者提供）。開頭的 # • ◦ > 是樣式標記（標題 / 項目 / 次項目 / 次項目接續），說明見 menu-scene.js 的 aboutLayout
      'about.body.1':
        '製作 2D 賽車遊戲，可以分成幾個簡單的步驟。\n' +
        '# 1. 先決定遊戲內容\n' +
        '首先要想好遊戲的基本玩法，例如玩家要駕駛汽車在賽道上比賽，完成指定圈數後結束比賽。也可以設定不同的車子、賽道和遊戲模式。\n' +
        '# 2. 設計賽道\n' +
        '接著製作遊戲中的賽道，可以設計彎道、直線、障礙物和起點等。賽道需要設定碰撞範圍，避免車子跑出道路。\n' +
        '# 3. 製作玩家車輛\n' +
        '製作一台可以由玩家控制的車子。玩家可以使用鍵盤或其他控制方式讓車子加速、減速和轉彎。\n' +
        '# 4. 加入車輛碰撞\n' +
        '當玩家的車子撞到牆壁或障礙物時，可以讓車子減速或改變行駛方向，增加遊戲的真實感。\n' +
        '# 5. 製作電腦對手\n' +
        '加入由電腦控制的車子，讓它們沿著賽道行駛。玩家可以和這些電腦車輛一起比賽，增加遊戲的挑戰性。\n' +
        '# 6. 加入比賽規則\n' +
        '設定比賽的規則，例如完成三圈後結束比賽，並根據車子到達終點的順序決定名次。同時可以加入計時器，記錄玩家完成比賽所花的時間。\n' +
        '# 7. 製作遊戲介面\n' +
        '在畫面上顯示速度、目前圈數、比賽時間和排名等資訊，讓玩家可以清楚知道目前的比賽狀況。\n' +
        '# 8. 加入音效和特效\n' +
        '最後加入汽車引擎聲、煞車聲、碰撞聲和背景音樂，也可以加入煙霧、加速等特效，讓遊戲更加有趣。\n' +
        '# 9. 測試遊戲\n' +
        '完成後進行測試，確認車子是否能正常控制、賽道是否有問題、AI 車輛是否正常行駛，以及比賽結束和排名是否正確。\n' +
        '# 簡單來說\n' +
        '2D 賽車遊戲的製作流程就是：\n' +
        '規劃遊戲 → 設計賽道 → 製作車子 → 加入控制 → 加入碰撞 → 製作電腦對手 → 加入比賽規則 → 製作介面 → 加入音效特效 → 測試遊戲\n' +
        '這樣就可以逐步完成一款基本的 2D 賽車遊戲。',
      // 「關於Arc遊戲庫」內文（作者提供）
      'about.body.2':
        '「ARCの概遊庫」這個名字，發想起源於諧音「蓋油庫」(即:概念遊戲保藏庫)。期望自己，以及所有開發者所開發的作品，都能夠像「蓋油庫」一樣，賺大錢！\n' +
        '同時也可以很自豪、很酷地說出自己開發遊戲的喜悅，以及一路走來的心路歷程。除了可以從遊戲中遊玩雛型範本之外，同時可透過內建的歷史功能，了解各系列類型遊戲的組成與開發構成等相關知識，進而對遊戲開發產生興趣。\n' +
        '目前年過50的作者，回頭一看，進入遊戲業界也將近25年了。這一路走來，雖然參與、開發過不少遊戲，卻始終沒有真正做出一款讓自己「超級成名」的TITLE。\n' +
        '近年來AI開發盛行，遊戲產業也正面臨前所未有的變化。「選擇走遊戲這條路，究竟是正確的嗎？」這個問題開始不斷浮現在我的腦海裡。\n' +
        '因此我不得不重新思考——人生走到這個階段，我存在的意義究竟是什麼？而其中，我最常問自己的一個問題就是：「我能為這個產業留下什麼？」\n' +
        '常常在想，是否能夠運用自己這25年來所學到的東西，讓那些對遊戲開發有興趣的新生代，重新產生一點「想做遊戲」的衝動？但要怎麼做？\n' +
        '「不然，就來做一本可以玩的遊戲書吧！」從小，我就是個很不愛看「有字的書」的人。（漫畫除外！）與其坐在那裡讀一大堆文字，不如先親身體驗看看。覺得有興趣，再回頭鑽研。就這樣——「ARCの概遊庫」誕生了！\n' +
        '就像我常常形容的：大多數的遊戲開發者，幾乎很難能成為第二個宮本茂，也未必能像神話般屢屢敗部復活的小島秀夫桑一樣，成為世人熟知的大師。難道就因此喪志、放棄嗎？我想不必。\n' +
        '因為每一個開發者，都曾經擁有那顆熱愛遊戲的赤子之心。曾經捧著遊戲雜誌，期待下一款新作的到來；曾經跑進電玩店，投下硬幣，和朋友一起打《快打旋風》，為了輸贏大呼小叫；曾經為了一款遊戲可以興奮上一整天。\n' +
        '那些年華與時光，也許就像短暫的流星般一閃而過。但直到現在，我還是相信——玩遊戲，是因為好玩；而做遊戲，不也就是因為好玩嗎？\n' +
        '即使我們未必能成為那個站在聚光燈下的人，至少，也可以留下自己曾經努力做過、曾經熱愛過的作品。這，就是我想做「ARCの概遊庫」的理由。\n' +
        '「ARCの概遊庫」，一款可以玩的遊戲書、一段屬於遊戲開發者的故事。也是一群喜歡遊戲的人所留下的足跡。希望各位喜歡。感謝！！',
      'about.fb': '前往 Facebook 粉絲團', 'about.fb.blocked': '瀏覽器擋住了新視窗，請手動開啟粉絲團網址',
  },
  ja: {
      'about.0': 'レースゲームについて', 'about.1': 'コンセプト構成', 'about.2': 'Arcゲームライブラリ', 'about.soon': '（準備中）',
      'about.body.0':
        'レーシングゲーム（Racing Games）の発展史は、「ピクセルのブロック」から「リアルなシミュレーション」、そして「オープンワールド」へと進化してきた、テクノロジー発展の歴史でもあります。1970年代に誕生して以来、レーシングゲームは人々の「スピード」や「カスタマイズ」への欲求を満たすだけでなく、ゲームハードウェアやグラフィックス技術を何度も限界まで押し上げてきました。\n' +
        'レーシングゲームの歴史における4つの主要な段階\n' +
        '# 第1段階：アーケード黄金期の幕開け（1970年代～1990年代）\n' +
        'コンピューターや家庭用ゲーム機が普及する以前、レーシングゲームの舞台は完全にアーケードでした。この時期のゲームの中心にあったのは、刺激的なスピード感と制限時間によるプレッシャーです。\n' +
        '• 1974年『Gran Trak 10』： Atariが発売したアーケードゲームで、史上初のコイン式レーシングゲームとして広く知られています。白黒のドットマトリクス画面を採用し、初めて実物のステアリングホイール、シフトレバー、ペダルを導入しました。\n' +
        '• 1982年『Pole Position』： バンダイナムコ（Bandai Namco）が発売した作品で、現代のレーシングゲームの基礎を築いたタイトルです。従来の俯瞰視点から脱却し、初めて後方から追従する三人称視点を採用。また、予選システムも導入されました。\n' +
        '• 1986年『OutRun』： SEGAの伝説的な作品です。分岐する非線形のコース、フェラーリのスポーツカー、開放的なカリフォルニア海岸の雰囲気、そして自由に切り替えられるBGMを特徴としています。これによってレーシングゲームは、単なる「冷たい競技」から「ドライブそのものを楽しむ体験」へと変化しました。\n' +
        '# 第2段階：シミュレーションの分化と多様化（1990年代後半～2000年代）\n' +
        '3Dグラフィックスチップ（3dfx Voodooなど）や家庭用ゲーム機の性能が爆発的に向上すると、1997年前後からレーシングゲームは大きくジャンル分化し、一気に3つの主要市場へと発展していきました。\n' +
        '• ハードコア・リアルシミュレーション（Sim Racing）： 1997年、SONYはPlayStation専用タイトルとして『Gran Turismo（グランツーリスモ）』を発売しました。単にアクセルを踏むだけではなく、タイヤのグリップ、荷重移動、仮想ライセンス取得、実在自動車メーカーの正式ライセンスなどを重視。「リアルな自動車生活」を体験するゲームに巨大な市場が存在することを証明しました。\n' +
        '• ストリートカルチャーとカスタマイズ（Arcade/Street）： 映画『ワイルド・スピード』が世界的な人気を博す中、EAは2003年と2004年に『Need for Speed: Underground 1 & 2（ニード・フォー・スピード アンダーグラウンド）』を相次いで発売しました。豊富なネオン演出、車両カスタマイズシステム、警察とのカーチェイスなどを導入し、ストリートレース文化を最高潮へと押し上げました。\n' +
        '• アイテムとファミリー向け（Party/Kart）： 1992年に誕生した『マリオカート（Mario Kart）』シリーズは、この時期に「パーティーゲームの王者」としての地位を確立しました。友情を壊しかねないアイテムシステムと高い操作性によって、家族みんなで楽しめる定番エンターテインメントとなりました。\n' +
        '# 分裂とハードウェア革命：エンターテインメントとプロフェッショナルの二極化（2000年代後半～2010年代初頭）\n' +
        'この時期になると、従来型の3Dアーケードレーシングは徐々に勢いを失い、レーシングゲームはより極端な二極化へと進んでいきました。\n' +
        '• コア向けオンラインシミュレーション： 2008年に『iRacing』がサービスを開始しました。高額なサブスクリプション制と厳格なハードウェア要件（ステアリングホイールが必須）を採用し、実際のレーシングドライバーやハードコアなファンを対象としました。その後、多くのF1ドライバーが現実のシーズン外に利用するバーチャル・トレーニングツールとしても知られるようになりました。\n' +
        '• ライトシミュレーション（Simcade）： 『Gran Turismo』やMicrosoftの『Forza Motorsport（フォルツァ モータースポーツ）』シリーズなどの大型タイトルは、その中間に位置するスタイルを確立しました。リアルな物理演算を維持しながらも、コントローラーだけで気軽にプレイできる設計となっています。\n' +
        '# 第4段階：オープンワールドと現代の主流（2012年～現在）\n' +
        '現代のプレイヤーは、もはや固定された閉鎖型のサーキットだけでは満足しなくなりました。「国全体を自分のレース場にする」というコンセプトが、ここ10年以上にわたってレーシングゲームの大きな潮流となっています。\n' +
        '• 『Forza Horizon（フォルツァ ホライゾン）』シリーズ： 2012年に第1作が登場して以来、このシリーズは世界的に大きな影響力を持つレーシングゲームへと成長しました。美しく作り込まれたオープンワールド、陽気な音楽フェスティバルの雰囲気、そして非常に自由度の高いドライビング体験を確立しました。\n' +
        '• 多機能マップとeスポーツ化： 『The Crew（ザ クルー）』のように、アメリカ全土を縮小してゲーム内に再現した作品も登場しました。同時に、現代のレーシングゲームはバーチャルレーシングのeスポーツ（Sim Racing Esports）とも強く結びついています。優れたバーチャルレーシングドライバーが、実際のプロレーシングチームからスカウトされ、本物のレーシングドライバーになる機会さえ生まれています。',
      // 「コンセプト構成」内文（日文）。行頭の # • ◦ > はスタイル記号（見出し / 項目 / 副項目 / 副項目の続き）
      'about.body.1':
        '# 2Dレーシングゲームの制作過程\n' +
        '2Dレーシングゲームは、いくつかの簡単なステップに分けて作ることができます。\n' +
        '# 1. ゲームの内容を決める\n' +
        'まず、ゲームの基本的な遊び方を考えます。例えば、プレイヤーが車を運転してコースを走り、決められた周回数を終えるとレースが終了するようにします。車やコース、ゲームモードなどを設定することもできます。\n' +
        '# 2. コースを作る\n' +
        '次に、ゲームのコースを作ります。カーブや直線、障害物、スタート地点などを設計します。また、車がコースの外に出ないように、壁などの当たり判定を設定します。\n' +
        '# 3. プレイヤーの車を作る\n' +
        'プレイヤーが操作できる車を作ります。キーボードなどを使って、車を加速・減速させたり、左右に曲がったりできるようにします。\n' +
        '# 4. 車の衝突を設定する\n' +
        '車が壁や障害物にぶつかったときに、速度が落ちたり、進む方向が変わったりするようにします。これによって、よりリアルなゲームになります。\n' +
        '# 5. コンピューターの対戦車を作る\n' +
        'コンピューターが操作する車を追加します。対戦車がコースに沿って走るように設定し、プレイヤーと競争できるようにします。\n' +
        '# 6. レースのルールを設定する\n' +
        '例えば、3周するとレースが終了するように設定します。そして、ゴールした順番によって順位を決めます。また、タイマーを使って、レースにかかった時間を記録することもできます。\n' +
        '# 7. ゲーム画面を作る\n' +
        '画面に速度、現在の周回数、レース時間、順位などを表示します。これによって、プレイヤーが現在のレース状況を簡単に確認できます。\n' +
        '# 8. 音やエフェクトを追加する\n' +
        '車のエンジン音、ブレーキ音、衝突音、BGMなどを追加します。また、煙や加速などのエフェクトを加えることで、ゲームをより楽しくすることができます。\n' +
        '# 9. ゲームをテストする\n' +
        '完成したらゲームを実際にプレイしてテストします。車を正常に操作できるか、コースに問題がないか、コンピューターの車が正常に走るか、レース終了や順位が正しく表示されるかなどを確認します。\n' +
        '# 簡単にまとめると\n' +
        '2Dレーシングゲームの制作の流れは、\n' +
        'ゲームの企画 → コース制作 → 車の制作 → 操作機能の追加 → 衝突処理 → コンピューターの対戦車 → レースルールの設定 → ゲーム画面の制作 → 音やエフェクトの追加 → テスト\n' +
        'という順番で進めることができます。',
      // 「Arcゲームライブラリ」内文（日文）
      'about.body.2':
        '「ARCの概遊庫（がいゆうこ）」という名前は、台湾華語の「蓋油庫（ガイヨウクー：油槽所を建てる）」という言葉の語呂合わせから生まれました（その真の意味は「概念ゲームの保藏庫」です）。自分自身、そしてすべての開発者が生み出す作品が、この「蓋油庫」の言葉通り、大儲けできる（油田を掘り当てる）ような存在になってほしいという願いが込められています。\n' +
        '同時に、自分がゲームを開発する喜びや、これまでの道のりを、誇らしく、そしてクールに語れる場所でもあります。ここではゲームのプロトタイプを実際に遊べるだけでなく、内蔵された「歴史機能」を通じて、様々なジャンルのゲームがどのように構成され、開発されてきたかという知識を学ぶことができます。そこから、ゲーム開発に興味を持つきっかけになれば幸いです。\n' +
        '現在、50歳を超えた私がふと振り返ると、ゲーム業界に入ってからもうすぐ25年になります。これまでの道のりで、数多くのゲームに関わり、開発してきましたが、自分を「超有名」にするような代表作（タイトル）には、ついに巡り合えませんでした。\n' +
        '近年、AI開発が盛んになり、ゲーム産業はかつてない変革期を迎えています。「ゲームの道を選んだことは、果たして正しかったのだろうか？」そんな問いが、最近頭をよぎるようになりました。\n' +
        '人生のこのステージに至り、「自分が存在する意味とは一体何だろう？」と、改めて考えざるを得なくなったのです。その中で、私が最も自分に問いかけたのは、「自分はこの産業に何を残せるだろうか？」ということでした。\n' +
        '自分がこの25年間で学んできたことを活かし、ゲーム開発に興味を持つ次世代の若者たちに、もう一度「ゲームを作りたい！」という衝動を呼び起こすことはできないだろうか？ ――そう常々考えていました。しかし、一体どうすればいいのか？\n' +
        '「それなら、“遊べるゲームの参考書”を作ってみよう！」幼い頃から、私は「文字ばかりの本」を読むのが大の苦手でした（漫画は別ですが！）。机に向かって膨大な文字を読むくらいなら、まずは体感してみる。面白いと思ったら、そこから深く掘り下げればいい。そうして生まれたのが、この「ARCの概遊庫」です。\n' +
        '私がよく口にする言葉があります。ほとんどのゲーム開発者は、第二の宮本茂氏になることは難しいですし、神話のように何度も窮地から復活を遂げた小島秀夫氏のように、世界に名を馳せる巨匠になれるわけでもありません。だからといって、志を失い、諦めるべきでしょうか？ 私はそうは思いません。\n' +
        'なぜなら、すべての開発者が、かつてゲームを純粋に愛する少年のような心を持っていたからです。ゲーム雑誌を握りしめ、新作の発売を心待ちにしていた日々。ゲームセンターに駆け込み、コインを投入し、友達と『ストリートファイター』で勝った負けたと大騒ぎしたこと。たった一本のゲームのために、丸一日中興奮していられたあの頃。\n' +
        'あの輝かしい青春や時間は、一瞬で駆け抜ける流れ星のようだったかもしれません。それでも私は今でも信じています。「ゲームを遊ぶのは楽しいからであり、ゲームを作るのもまた、楽しいからではないか」と。\n' +
        'たとえ私たちがスポットライトを浴びる存在になれなかったとしても、少なくとも、自分がかつて必死に作り、心から愛した作品をここに残すことはできる。それこそが、私が「ARCの概遊庫」を作ろうと思った理由です。\n' +
        '「ARCの概遊庫」――それは遊べるゲームの参考書であり、ゲーム開発者の物語。そして、ゲームを愛する者たちが残した足跡（そくせき）でもあります。皆さんに楽しんでいただけることを願っています。ありがとうございました！！',
      'about.fb': 'Facebook ファンページへ', 'about.fb.blocked': '新しいウィンドウがブロックされました。手動でURLを開いてください',
  },
  en: {
      'about.0': 'About Racing Games', 'about.1': 'Concept Structure', 'about.2': 'About Arc Games', 'about.soon': '(Coming soon)',
      'about.body.0':
        'The history of racing games is also a history of technological evolution—from "pixelated blocks" to "realistic simulation" and eventually to "open worlds." Since their emergence in the 1970s, racing games have not only satisfied people\'s desire for speed and vehicle customization, but have also repeatedly pushed gaming hardware and graphics technology to their limits.\n' +
        'The Four Major Stages in the Development of Racing Games\n' +
        '# Stage 1: The Golden Age of Arcades (1970s–1990s)\n' +
        'Before computers and home consoles became widespread, the arcade was the primary platform for racing games. During this period, the core appeal of racing games was an exciting sense of speed and the pressure created by time limits.\n' +
        '• 1974 – Gran Trak 10: Released by Atari, it is widely regarded as one of the earliest coin-operated racing games in history. It featured a black-and-white dot-matrix display and introduced physical controls such as a steering wheel, gear shifter, and pedals.\n' +
        '• 1982 – Pole Position: Developed and released by Namco, this game laid the foundation for modern racing games. It moved away from the traditional top-down perspective and pioneered a third-person, chase-camera view from behind the car. It also introduced a qualifying system.\n' +
        '• 1986 – OutRun: SEGA\'s legendary title introduced branching, nonlinear routes, Ferrari sports cars, a relaxed California coastal atmosphere, and freely selectable radio music. It transformed racing games from "cold competition" into an experience centered around the joy of driving.\n' +
        '# Stage 2: The Rise of Simulation and Genre Diversification (Late 1990s–2000s)\n' +
        'With the explosive improvement of 3D graphics chips, such as the 3dfx Voodoo, and the increasing power of home consoles, racing games underwent major genre diversification around 1997. Almost overnight, the genre developed into three major markets:\n' +
        '• Hardcore Realistic Simulation (Sim Racing): In 1997, SONY released the PlayStation exclusive Gran Turismo. Rather than simply focusing on acceleration, it emphasized tire grip, weight transfer, virtual license tests, and officially licensed real-world car manufacturers. It demonstrated that there was a huge market for a realistic "automotive lifestyle" experience.\n' +
        '• Street Culture and Customization (Arcade/Street): As the Fast & Furious film franchise became a global phenomenon, EA released Need for Speed: Underground in 2003 and Need for Speed: Underground 2 in 2004. The games introduced extensive neon lighting, vehicle customization, and police pursuits, pushing street-racing culture to new heights.\n' +
        '• Items and Family-Friendly Fun (Party/Kart): The Mario Kart series, which began in 1992, firmly established itself during this period as the "king of party racing games." Its friendship-destroying item mechanics and highly accessible gameplay made it a popular form of entertainment for players of all ages.\n' +
        '# The Split and Hardware Revolution: The Polarization of Entertainment and Professional Simulation (Late 2000s–Early 2010s)\n' +
        'During this period, traditional 3D arcade racing games gradually declined, while racing games became increasingly divided into two distinct directions.\n' +
        '• Hardcore Online Simulation: In 2008, iRacing was launched. It adopted a relatively expensive subscription model and strict hardware requirements, typically requiring a steering wheel setup. It was designed specifically for real-world racing drivers and hardcore enthusiasts. It later became a virtual training tool used by many F1 drivers outside the real-world racing season.\n' +
        '• Accessible Simulation (Simcade): Major franchises such as Gran Turismo and Microsoft\'s Forza Motorsport series established a middle ground. They retained realistic physics while still allowing players to enjoy the games comfortably with a standard controller.\n' +
        '# Stage 4: The Rise of Open-World Racing (2012–Present)\n' +
        'Modern players are no longer satisfied with fixed, closed circuits. The idea of "turning an entire country into your racetrack" has become one of the defining trends in racing games over the past decade.\n' +
        '• The Forza Horizon Series: Since the release of the first game in 2012, the series has gradually become one of the most influential racing franchises in the world. It pioneered beautifully designed open worlds, vibrant music-festival atmospheres, and highly flexible driving experiences.\n' +
        '• Expansive Maps and the Rise of Esports: Games such as The Crew even recreated a scaled-down version of the entire United States within the game world. At the same time, modern racing games have become increasingly connected with sim racing esports. Highly skilled virtual racing drivers now even have opportunities to be recruited by professional racing teams and transition into real-world motorsport careers.',
      // "Concept Structure" body text (English). Leading # • ◦ > are style markers (heading / bullet / sub-bullet / sub-bullet continuation), see aboutLayout in menu-scene.js
      'about.body.1':
        '# How to Make a 2D Racing Game\n' +
        'A 2D racing game can be created by following several simple steps.\n' +
        '# 1. Decide the Game Content\n' +
        'First, decide how the game will be played. For example, the player drives a car around a track and completes a certain number of laps to finish the race. You can also add different cars, tracks, and game modes.\n' +
        '# 2. Create the Track\n' +
        'Next, design the racing track. You can add curves, straight roads, obstacles, and a starting point. Collision areas should also be added so that the car does not drive outside the track.\n' +
        '# 3. Create the Player\'s Car\n' +
        'Create a car that the player can control. The player should be able to accelerate, slow down, and turn the car using a keyboard or another control method.\n' +
        '# 4. Add Collision\n' +
        'When the car hits a wall or an obstacle, its speed can decrease or its direction can change. This makes the game feel more realistic.\n' +
        '# 5. Create Computer-Controlled Cars\n' +
        'Add cars controlled by the computer. These cars can follow the track and race against the player, making the game more challenging.\n' +
        '# 6. Set the Racing Rules\n' +
        'Set the rules of the race. For example, the race can end after the player completes three laps. The finishing order determines the rankings. A timer can also be added to record the player\'s race time.\n' +
        '# 7. Create the Game Interface\n' +
        'Display information such as speed, current lap, race time, and ranking on the screen. This allows the player to easily understand the current race situation.\n' +
        '# 8. Add Sounds and Effects\n' +
        'Add engine sounds, braking sounds, collision sounds, and background music. You can also add effects such as smoke and speed effects to make the game more exciting.\n' +
        '# 9. Test the Game\n' +
        'After completing the game, test it carefully. Check whether the car can be controlled properly, whether there are any problems with the track, whether the computer-controlled cars work correctly, and whether the race ending and rankings are displayed correctly.\n' +
        '# In Simple Terms\n' +
        'The basic process of making a 2D racing game is:\n' +
        'Game planning → Track design → Car creation → Controls → Collision → Computer-controlled cars → Racing rules → Game interface → Sounds and effects → Testing',
      // "About Arc Games" body text (English). The CJK-first font renders a curly apostrophe as a wide glyph, so plain apostrophes are used
      'about.body.2':
        'The name "ARC\'s Concept Play-Chamber" (ARCの概遊庫) was inspired by a Chinese wordplay on "building an oil depot" (Gai You Ku), which in this context stands for a "Concept Game Repository." My hope is that my own work, alongside the creations of all fellow developers, can be just like that "oil depot"—bringing in massive wealth and striking it rich!\n' +
        'At the same time, it is a place where we can proudly and coolly share the sheer joy of game development, as well as the emotional journey we\'ve walked along the way. Beyond just playing prototype templates within the game, users can utilize the built-in history feature to understand the structural composition and development of various game genres. Through this hands-on knowledge, I hope to spark a genuine interest in game development for the next generation.\n' +
        'Now past the age of 50, I look back and realize I\'ve been in the game industry for nearly 25 years. Walking this path, though I\'ve participated in and developed quite a few games, I\'ve never truly made that one "megahit" title to skyrocket my name into stardom.\n' +
        'With the recent boom in AI development, the game industry is facing unprecedented shifts. Questions have begun to constantly haunt my mind: "Was choosing the path of game development really the right choice?"\n' +
        'Consequently, I found myself forced to rethink—at this stage of my life, what is the ultimate meaning of my existence? Among all my thoughts, the question I ask myself most frequently is: "What can I leave behind for this industry?"\n' +
        'I often wonder if I can take what I\'ve learned over these past 25 years and reignite that spark, that raw impulse of "I want to make games!" within the new generation who are interested in development. But how?\n' +
        '"Well, why not make a playable game-book?" Since childhood, I\'ve always been someone who hated reading "books with too many words" (except for manga, of course!). Instead of sitting there reading walls of text, I\'d rather experience it firsthand. If it sparks an interest, I can always go back and dive deeper later. And just like that—"ARC\'s Concept Play-Chamber" was born!\n' +
        'As I often say: most game developers will likely never become the next Shigeru Miyamoto. Nor will we necessarily become world-renowned masters like Hideo Kojima, who mythically rises from the ashes time and time again. Should we lose heart and give up because of that? I think not.\n' +
        'Because every single developer once possessed that innocent, childlike heart that deeply loved games. We once clutched gaming magazines, eagerly awaiting the arrival of the next new title. We once ran into arcades, dropped coins into the slots, and shouted at the top of our lungs with friends over a match of Street Fighter, living and dying by the win or loss. We once stayed excited for an entire day over just one game.\n' +
        'Those years and moments might have flashed by like a fleeting shooting star. But even now, I still believe—we play games because they are fun, and don\'t we make games for the exact same reason?\n' +
        'Even if we might never be the ones standing under the spotlight, at the very least, we can leave behind the works we once poured our hearts into, the works we once truly loved. This is precisely why I wanted to create "ARC\'s Concept Play-Chamber."\n' +
        '"ARC\'s Concept Play-Chamber"—a playable game-book, a story belonging to game developers, and the footprints left behind by a group of people who simply love games. I hope you all enjoy it. Thank you so much!',
      'about.fb': 'Facebook Fan Page', 'about.fb.blocked': 'The new window was blocked. Please open the page manually',
  }
};
