'use strict';

// 多語言:以「中文原文」為鍵,值為 [日文, 英文]。找不到翻譯時顯示中文原文。
const I18N = {
  '開始遊戲': ['ゲームスタート', 'START GAME'], '操作說明': ['あそびかた', 'HOW TO PLAY'],
  '排行榜': ['ランキング', 'RANKING'], '設定': ['せってい', 'SETTINGS'], '製作名單': ['スタッフ', 'STAFF'],
  '↑ ↓  選擇    Enter  決定': ['↑ ↓  えらぶ    Enter  けってい', '↑ ↓  Select    Enter  OK'],
  '↑↓ / A 選擇': ['↑↓ / A えらぶ', '↑↓ / A Select'],
  'TAP TO START': ['タップしてスタート', 'TAP TO START'], 'PRESS ANY KEY': ['キーを押してね', 'PRESS ANY KEY'], 'TAP': ['タップ', 'TAP'],

  '選擇賽事': ['コースセレクト', 'SELECT COURSE'], '難度': ['むずかしさ', 'LEVEL'],
  '3 個賽段,途中有 2 個 CHECK POINT': ['3ステージ構成、途中にCHECK POINTが2つ', '3 stages with 2 CHECK POINTs'],
  '本賽事障礙': ['このコースの障害物', 'Obstacles'], '確認出發': ['しゅっぱつ！', 'GO!'], '返回': ['もどる', 'BACK'],
  '櫻花之旅': ['さくらツアー', 'Sakura Tour'], '雪之國度': ['ゆきのくに', 'Snow Kingdom'], '糖果樂園': ['キャンディランド', 'Candy Land'],
  '從春日櫻花道出發,經過夕陽海岸,直奔星夜祭典!': ['春の桜並木から夕焼けの海岸をぬけて、星空のお祭りへ！', 'From the spring sakura road, past the sunset coast, to the starry festival!'],
  '晴朗雪原、極光黃昏、聖誕雪夜。路面結冰車身會打滑,小心雪堆與冰塊!': ['晴れた雪原、オーロラの夕暮れ、聖夜の雪景色。路面は凍結、車体が滑る！雪だまりと氷に注意！', 'Sunny snowfield, aurora dusk and a Christmas night. Icy roads make you slide - watch out for snowdrifts and ice blocks!'],
  '棉花糖、巧克力到霓虹遊樂園。果凍會彈飛你,口香糖會黏住你!': ['わたあめ、チョコ、ネオンの遊園地。ゼリーではね飛ばされ、ガムにくっつく！', 'Cotton candy, chocolate and a neon fun park. Jelly bounces you and gum sticks to you!'],
  '春日櫻花道': ['春の桜並木', 'Spring Sakura Road'], '夕陽海岸': ['夕焼けの海岸', 'Sunset Coast'], '星夜祭典': ['星空のお祭り', 'Starry Festival'],
  '雪原晴空': ['晴れの雪原', 'Sunny Snowfield'], '極光黃昏': ['オーロラの夕暮れ', 'Aurora Dusk'], '雪夜聖誕': ['聖夜の雪', 'Snowy Xmas Night'],
  '棉花糖晴空': ['わたあめ空', 'Cotton Candy Sky'], '巧克力黃昏': ['チョコの夕暮れ', 'Chocolate Dusk'], '霓虹樂園夜': ['ネオン遊園地の夜', 'Neon Park Night'],
  '大便': ['うんち', 'Poop'], '踩到會打滑轉圈': ['ふむとスリップして回る', 'Slip and spin'],
  '石頭': ['いわ', 'Rock'], '撞到整台翻車': ['ぶつかると横転', 'Crash and flip'],
  '雪堆': ['雪だまり', 'Snowdrift'], '陷入雪中大幅減速': ['雪に埋まって大幅減速', 'Sink in and slow down'],
  '冰塊': ['こおり', 'Ice Block'], '果凍': ['ゼリー', 'Jelly'], '被彈飛失去控制': ['はね飛ばされて操作不能', 'Bounced, no control'],
  '口香糖': ['ガム', 'Gum'], '被黏住幾乎停下': ['くっついてほぼ停止', 'Stuck, nearly stopped'],

  'PAUSE': ['ポーズ', 'PAUSE'], '繼續遊戲': ['つづける', 'RESUME'], '重新開始': ['やりなおす', 'RESTART'], '回主選單': ['メニューへ', 'MAIN MENU'],

  '遊戲規則': ['ルール', 'Rules'], '操作方式': ['そうさ', 'Controls'], '道具與敵車': ['アイテムとライバル', 'Items & Rivals'], '各賽事障礙': ['コース別の障害物', 'Course Obstacles'],
  '遊戲目標': ['ゲームの目的', 'Objective'],
  '在限定時間內,跑完全部 3 個賽段的賽道即可過關。時間歸零仍未抵達終點,就是 GAME OVER!': ['制限時間内に3つのステージすべてを走りきればクリア。時間切れならGAME OVER！', 'Finish all 3 stages before time runs out. If time hits zero, it is GAME OVER!'],
  '每個賽段結尾都有檢查點。在時間內通過,就會增加倒數時間並加分!': ['各ステージの終わりにチェックポイントがあります。通過すると制限時間が増えてボーナス点！', 'Each stage ends with a checkpoint. Pass it to gain extra time and bonus points!'],
  '留在賽道上': ['コースを走ろう', 'Stay on the Road'],
  '賽道兩側是草叢與樹木。偏離跑道會大幅減速,撞到樹更慘。': ['コースの外は草むらや木。外れると大きく減速し、木にぶつかるともっと遅くなります。', 'Off the road are bushes and trees. Leaving the road slows you a lot; hitting a tree is worse.'],
  '避開障礙': ['障害物をよけよう', 'Avoid Obstacles'],
  '每個賽事都有專屬障礙,撞到會打滑、翻車或減速!也小心別撞到其他賽車。': ['コースごとに専用の障害物があります。スリップや横転、減速に注意！ライバル車にも気をつけて。', 'Each course has its own obstacles that cause slips, crashes or slowdowns. Avoid rival cars too!'],
  '收集道具': ['アイテム収集', 'Collect Items'],
  '金幣加分、氮氣瓶最多可持有 5 瓶。': ['コインで得点、ニトロは最大5本まで持てます。', 'Coins give points. You can hold up to 5 nitro bottles.'],
  '遊戲結束後,各賽事積分前 20 名可登錄姓名,留名排行榜。': ['ゲーム終了後、コースごとの上位20位まで名前を登録できます。', 'After a run, the top 20 scores of each course can register a name.'],

  '操作': ['そうさ', 'Action'], '鍵盤': ['キーボード', 'Keyboard'], 'Xbox 手把': ['Xboxパッド', 'Xbox Pad'], '手機': ['スマホ', 'Mobile'],
  '左移': ['左', 'Left'], '右移': ['右', 'Right'], '油門': ['アクセル', 'Gas'], '剎車': ['ブレーキ', 'Brake'], '氮氣': ['ニトロ', 'Nitro'],
  '類比左/十字左': ['スティック左/十字左', 'Stick L / Pad L'], '類比右/十字右': ['スティック右/十字右', 'Stick R / Pad R'],
  '虛擬鍵左/傾斜': ['仮想キー左/傾き', 'Touch L / Tilt'], '虛擬鍵右/傾斜': ['仮想キー右/傾き', 'Touch R / Tilt'],
  '油門按鈕': ['アクセルボタン', 'Gas button'], '剎車按鈕': ['ブレーキボタン', 'Brake button'], '氮氣按鈕': ['ニトロボタン', 'Nitro button'],
  '向左滑/傾斜': ['左へスライド/傾き', 'Slide L / Tilt'], '向右滑/傾斜': ['右へスライド/傾き', 'Slide R / Tilt'], '右下 GO 區': ['右下 GO エリア', 'Lower-right GO'], '右下區按住': ['右下を長押し', 'Hold lower-right'], '右上區點一下': ['右上をタップ', 'Tap upper-right'],
  '◀  滑動轉向  ▶': ['◀  スライドで操作  ▶', '◀  SLIDE TO STEER  ▶'], '點一下': ['タップ', 'TAP'], '按住 剎車・甩尾': ['長押し ブレーキ・ドリフト', 'HOLD BRAKE / DRIFT'], '按住': ['長押し', 'HOLD'],
  '剩餘 10 秒': ['残り10秒', '10 SEC LEFT'],   '視角切換': ['視点切替', 'Camera'], '右上相機鈕': ['右上のカメラボタン', 'Top-right camera btn'],
  '進階技巧': ['テクニック', 'Tips'],
  '按住不放,車速會線性加速;放開則慢慢滑行減速。': ['押し続けると加速。離すとゆっくり減速します。', 'Hold to accelerate steadily. Release to coast and slow down.'],
  '按下後減速(點放控制力道)。過急彎前先減速!': ['押すと減速（ちょん押しで加減）。急カーブの前に減速しよう！', 'Press to slow down (tap for light braking). Slow down before sharp turns!'],
  '甩尾': ['ドリフト', 'Drift'],
  '「油門」+「剎車」同時按住,再按左/右,車身會飄移,能以不低的速度過彎,還有額外加分!': ['アクセル+ブレーキを同時に押して左右に入れるとドリフト。高速のままカーブを曲がれて、ボーナス点も！', 'Hold Gas + Brake and steer to drift. Take corners at high speed and earn bonus points!'],
  '按下消耗 1 瓶,BAR 條時間內瞬間加速且無敵,碰到障礙與敵車會把牠們撞飛!': ['1本消費してゲージの間ダッシュ＆無敵。障害物やライバルをはね飛ばす！', 'Uses 1 bottle: a burst of speed and invincibility while the bar lasts. Smash obstacles and rivals!'],

  '金幣': ['コイン', 'Coin'], '取得後獲得 1000 分。': ['取ると1000点。', 'Gives 1000 points.'],
  '氮氣瓶': ['ニトロボトル', 'Nitro Bottle'], '最多 5 瓶,使用後極速加速且無敵,可撞飛障礙與敵車!': ['最大5本。使うと超加速＆無敵で障害物やライバルをはね飛ばす！', 'Up to 5. Super speed and invincibility to smash obstacles and rivals!'],
  '呱呱 (青蛙)': ['ケロ (カエル)', 'Kero (Frog)'], '龜速直行的路障車,超車時小心。': ['ゆっくり直進する邪魔な車。追い越しに注意。', 'A slow roadblock car. Careful when overtaking.'],
  '兔兔 (兔子)': ['ウサ (ウサギ)', 'Usa (Rabbit)'], '左右蛇行前進,難以預測。': ['左右にくねくね進むので予測しづらい。', 'Weaves left and right, hard to predict.'],
  '黑喵 (黑貓)': ['クロ (黒ネコ)', 'Kuro (Black Cat)'], '速度快,還會擋住你的路線!': ['速くて、進路をふさいでくる！', 'Fast, and it blocks your path!'],

  '音樂': ['おんがく', 'Music'], '音效': ['こうかおん', 'SFX'], '傾斜控制': ['傾き操作', 'Tilt Control'],
  '手機陀螺儀轉向(直握手機)': ['スマホのジャイロで操作（縦持ち）', 'Steer by tilting the phone (hold upright)'],
  '自動油門': ['オートアクセル', 'Auto Gas'], '自動全程踩住油門': ['アクセルを自動で踏み続ける', 'Gas is held automatically'],
  '語言': ['言語', 'Language'], '音量 0~5(0 為靜音)': ['音量 0〜5（0はミュート）', 'Volume 0-5 (0 = mute)'],
  '請將手機直立握持': ['スマホを縦にして持ってね', 'Please hold your phone upright'],

  '企劃': ['企画', 'Design'], '程式': ['プログラム', 'Program'], '美術': ['アート', 'Art'], '特別感謝': ['スペシャルサンクス', 'Special Thanks'],

  '名次': ['順位', 'Rank'], '姓名': ['名前', 'Name'], '總積分': ['スコア', 'Score'], '完成時間': ['タイム', 'Time'],
  '★ = 完賽通關': ['★ = ゴール達成', '★ = Cleared'], '返回主選單': ['メニューへ', 'MAIN MENU'],

  '恭喜完賽!': ['ゴール！おめでとう！', 'Congratulations!'], '時間到了…下次再挑戰!': ['時間切れ…また挑戦してね！', 'Time is up... try again!'],
  '距離得分': ['走行距離', 'Distance'], '漂移得分': ['ドリフト', 'Drift'], '金幣 × {0}': ['コイン × {0}', 'Coins × {0}'],
  'CHECK POINT 獎勵': ['CHECK POINTボーナス', 'CHECK POINT Bonus'], '剩餘時間獎勵': ['残り時間ボーナス', 'Time Bonus'], '通關獎勵': ['クリアボーナス', 'Clear Bonus'],
  '完成總時間': ['トータルタイム', 'Total Time'], '進榜!請輸入你的姓名': ['ランクイン！名前を入力してね', 'New record! Enter your name'],
  '登錄': ['登録', 'SUBMIT'], '很可惜未進入前 20 名': ['残念、20位以内に入れませんでした', 'Not in the top 20 this time'], '前往排行榜': ['ランキングへ', 'TO RANKING'],

  '全球': ['ワールド', 'GLOBAL'], '本機': ['ローカル', 'LOCAL'], '讀取中...': ['読み込み中...', 'Loading...'], '無法連線,暫時無法顯示全球排行': ['接続できないため世界ランキングを表示できません', 'Offline: global ranking unavailable'],
  '了解歷史': ['歴史を知る', 'Learn History'], '← → 切換分頁　↑ ↓ / 滾輪 捲動': ['← → ページ切替　↑ ↓ / ホイール スクロール', '← → Page　↑ ↓ / Wheel: scroll'],
  '選擇車輛': ['マシンセレクト', 'SELECT VEHICLE'], '確認車輛': ['けってい！', 'CONFIRM'],
  '熊貓賽車': ['パンダ バギー', 'Panda Buggy'], '熊貓坦克': ['パンダ戦車', 'Panda Tank'], '熊貓掌機車': ['パンダ携帯ゲーム機カー', 'Panda Handheld'], '小飛翼火龍車': ['ちびウイング火竜カー', 'Mini Dragon Wing'],
  '紅色小火龍變身的四輪車,展開小翅膀,噴著火焰全速衝刺!': ['赤い小さな火竜が変身した四輪車。小さな翼を広げ、炎を噴いて全力疾走！', 'A four-wheeler shaped like a little red fire dragon, wings out and flames blazing!'],
  '黑白配色的傳奇跑車,車尾是藤原とう乳店的招牌!飛彈是熱騰騰的豆花!': ['白黒カラーの伝説のスポーツカー。リアには「藤原とう乳店」の看板！ミサイルはアツアツの豆花！', 'A legendary black-and-white sports car with a tofu-shop sign on the rear. Its missiles are steaming douhua!'],
  '經典的四驅賽車,熊貓最愛的座駕。': ['定番の四輪駆動レーシングカー。パンダのお気に入り！', 'The classic 4WD racer, loved by the panda.'],
  '威風的履帶戰車,熊貓從砲塔探出頭來衝刺!': ['迫力のキャタピラ戦車。パンダが砲塔から顔を出して大疾走！', 'A mighty tracked tank with the panda popping out of the turret!'],
  '復古掌上型遊戲機變身的賽車,螢幕上還有像素跑道!': ['レトロな携帯ゲーム機が変身したマシン。画面にはドット絵のコースも！', 'A retro handheld console turned racer, with a pixel track on its screen!'],
  '飛彈!': ['ミサイル！', 'MISSILE!'], '10 秒自動發射': ['10秒間 自動発射', 'AUTO-FIRE 10 SEC'], '飛彈': ['ミサイル', 'MISSILE'], '飛彈箱': ['ミサイルボックス', 'Missile Box'],
  '取得後 10 秒內車子會自動發射飛彈,擊飛前方敵車與障礙(不可累積)。': ['取ると10秒間、自動でミサイルを発射。前方のライバルや障害物を撃ち飛ばす（重ねがけ不可）。', 'For 10 seconds your vehicle auto-fires missiles at rivals and obstacles ahead (does not stack).'],
  '我的頭像': ['マイフェイス', 'MY FACE'], '🙂 我的頭像': ['🙂 マイフェイス', '🙂 My Face'],
  '目前使用預設熊貓頭像': ['今はデフォルトのパンダです', 'Using the default panda'], '預覽(點笑臉 / 哭臉試試表情)': ['プレビュー(😊 / 😢 をタップして表情を確認)', 'Preview (tap 😊 / 😢 to try expressions)'],
  '頭像照片只存在這台裝置的瀏覽器裡,不會上傳到任何地方,也不會出現在排行榜上。': ['顔写真はこの端末のブラウザ内だけに保存され、どこにもアップロードされず、ランキングにも表示されません。', 'Your photo is stored only in the browser on this device. It is never uploaded and never shown on the ranking.'],
  '上傳照片': ['写真をアップロード', 'Upload Photo'], '拍照': ['カメラで撮る', 'Take Photo'], '校正表情位置': ['表情の位置を調整', 'Adjust Expression'], '清除頭像': ['顔を消す', 'Remove Face'],
  '已儲存!頭像只存在這台裝置。': ['保存しました!顔写真はこの端末だけに保存されます。', 'Saved! Your face stays only on this device.'], '已清除,恢復為預設熊貓頭像。': ['削除しました。デフォルトのパンダに戻ります。', 'Removed. Back to the default panda.'],
  '無法讀取這張圖片': ['この画像を読み込めません', 'Cannot read this image'],
  '無法使用相機(可能被拒絕或這台裝置沒有相機),請改用「上傳照片」。': ['カメラを使えません(許可されていないか、カメラがありません)。「写真をアップロード」を使ってください。', 'Camera unavailable (denied or no camera). Please use "Upload Photo" instead.'],
  '拖曳移動、雙指或按鈕縮放,把臉放進圓圈裡': ['ドラッグで移動、2本指またはボタンで拡大縮小。顔を円に合わせてね', 'Drag to move, pinch or use buttons to zoom. Fit your face in the circle.'],
  '確定': ['けってい', 'OK'], '重選': ['えらび直す', 'Choose Again'], '相機啟動中...': ['カメラ起動中...', 'Starting camera...'],
  '看著鏡頭,把臉放進圓圈裡,按「拍下」': ['カメラを見て、顔を円に合わせて「撮る」を押してね', 'Look at the camera, fit your face in the circle, then press Shoot.'], '拍下': ['撮る', 'Shoot'],
  '點一下「左眼」的位置': ['「左目」の位置をタップ', 'Tap the LEFT eye'], '點一下「右眼」的位置': ['「右目」の位置をタップ', 'Tap the RIGHT eye'], '點一下「嘴巴」的位置': ['「口」の位置をタップ', 'Tap the MOUTH'],
  '表情會疊在你設定的位置上。滿意就按「完成」。': ['表情が設定した位置に重なります。よければ「完了」を押してね', 'Expressions will appear at the spots you set. Press Done when happy.'], '完成': ['完了', 'DONE'], '重來': ['やり直す', 'Redo'],
  '無敵衝刺!': ['むてきダッシュ！', 'INVINCIBLE!'], '打滑!': ['スリップ！', 'SLIP!'], '翻車!': ['横転！', 'CRASH!'],
  '陷入雪堆!': ['雪に埋まった！', 'SNOWED IN!'], '被黏住了!': ['くっついた！', 'STUCK!'], '彈飛!': ['はね飛ばされた！', 'BOUNCED!'],
  'TIME +{0} 秒': ['TIME +{0} 秒', 'TIME +{0} sec'], '前方急彎!': ['この先急カーブ！', 'SHARP TURN AHEAD!']
};

function tr(s, ...args) {
  const lang = (typeof Save !== 'undefined' && Save.data.lang) || 'zh';
  let out = s;
  if (lang !== 'zh') {
    const e = I18N[s];
    if (e) out = e[lang === 'ja' ? 0 : 1];
    else if (/[㐀-鿿]/.test(s)) { const m = (window.__missing = window.__missing || {}); m[s] = 1; }
  }
  args.forEach((v, i) => { out = out.replace('{' + i + '}', v); });
  return out;
}
