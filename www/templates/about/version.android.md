**27 May 2023 - Release IR Android 5.1.2**

#### App 更新 5.1.2

- 修正「點擊兩次返回鍵離開」無法離開問題
- 加長「點擊兩次返回鍵離開」時限為 3 秒
- 修正上載圖片時網絡不穩定會導致 Crash 問題
- 改善過場效果
- 減少記憶體用量

---

**17 May 2023 - Release IR Android 5.1.1**

#### App 更新 5.1.1

- 加入「載入中」動畫於廣告過場頁面，避免用戶誤以為是 App 出現問題
- 減少廣告出現次數 - 修正開 App 必出廣告問題

---

**14 May 2023 - Release IR Android 5.1.0**

#### 內核更新 v5.1

- 支援自動升級 Web 內核 - 提供更快的推送更新
- 內部整理降低維護難度
- 移除所有「優化」字眼
- 更新「我的最愛 -> 更多功能鍵」使用原生界面
- 加入「開啟 HKEPC 原紿連結」功能
- 開發者更新
  - DevOps 加入 Cloudflare Pages, GitHub Actions
  - 使用 `webpack5` 取代 `gulp` 改善開發環境
  - 更新到 `node.js 18`

#### App 更新

- 加入自動升級 Web 內核
- 移除內置瀏灠器，於外置瀏灠器開啟 payme, whatsapp 等連結
- 改善壓縮圖片使用過多 Memory 問題
- 修正 Google Admob 顯示廣告要求

---

**1 May 2023 - Release IR 內核 v5.0.0, Android 5.0.0**

#### 內核更新

- 加入常用字體顏色功能
- 修正「搜尋帖子」沒有資時仍顯示旋轉特效
- 修正「帖子消息」沒有資時仍顯示旋轉特效
- 修正私人訊息無法使用功能 (因為 HKEPC 更改了頭像連結)

#### App 更新

- 全面修正 Android 在不同裝置上的佈局安排 - 移除「全螢幕修正」功能
- 升級 Android 代碼
- 更新圖片選擇功能
- 更新最低要求為 Android 9.0
- 修正部份元件用色

---

**15 Sep 2019 - Release IR Extreme 內核 v4.2.3, Android 4.2.0**

#### 內核更新

- 修正帖子頁數不能超過 1000 頁問題
- 將所有圖片連結自動升級到 https

#### App 更新

- 修正用戶自行選取「全螢幕修正」後，不能再點擊開關修正

---

**14 Sep 2019 - Release IR Extreme 內核 v4.2.2, Android 4.1.2**

#### 內核更新

- 修正「最新帖子」頁面總數不正確問題

---

**12 Sep 2019 - Release IR Extreme 內核 v4.2.1, Android 4.1.1**

#### 內核更新

- 修正「我的帖子」功能
- 修正「我的回覆」功能

---

**12 Sep 2019 - Release IR Extreme 內核 v4.2.0, Android 4.1.0**

#### 內核更新

- **_輸入欄現根據裝置大小調整高度_** - 防止部份裝置出現輸入欄過大的情況
- **_輸入內容時，自動將畫面調整到最佳位置_** - 改善輸入體驗
- 加入修改「我的關注」功能
- 加入修改「我的收藏」功能

#### App 更新

- **_改善「分享到...」功能列表_** - 加入「Chrome」選項
- 修正部份裝置的 BottomSheetDialog 的字體顏色

---

**11 Sep 2019 - Release IR Extreme 內核 v4.1.1, Android 4.0.4**

#### App 更新

- 更新 Splash Screen 圖案到 Extreme 版本

---

**11 Sep 2019 - Release IR Extreme 內核 v4.1.1, Android 4.0.2**

#### 內核更新

- 修正修改帖子時，若刪除全部內容後會不出現輸入欄

---

**11 Sep 2019 - Release IR Extreme 內核 v4.1.0, Android 4.0.1**

#### 內核更新

- **_改善「頁面控制器」顯示方式_** - 現在會根據滑動方向隱藏/顯示
- 修正 M 字額設定隔距問題

---

**5 Sep 2019 - Release IR Extreme 內核 v4.0.0, Android 4.0.0**

首先，多謝你支持及購買 HKEPC IR Extreme v4！

> **Extreme** 是一個追求極緻的象徵，印証著 IR App 目前的發展方針。

是次更新內容比較長，內容包括：

- 內核更新
- App 更新
- 修正
- IR 營運狀態更新、定價的算式、互利共生的承諾、長期維護服務承諾、及可持續發展的更新

#### 內核更新

- **_「IR 內容設定」功能_** - 用戶可以自主控制於「最新發佈」及「最新帖子」中希望隱藏的 HKEPC 版塊、過濾其它 HKEPC 用戶發
  佈的主題或回覆以及加強顯示感興趣的字眼
- **_大幅提升瀏灠速度_** - 復審 ionic v1 內核，調整內核代碼；提升速度原因是移除了 IR App 不必要的 ~300ms 延遲及不必要
  的`click-block`，徹底解決了有機會 Freeze 的問題，同時在大部份 `EventListener` 亦加入了 `{passive: true}` 防止阻擋
  ui-thread
- **_加入「分享到...」功能_** - 用戶可以自由選擇「複制到剪貼薄」、「在 Safari 打開」或「分享到其它社交平台例如 Telegram,
  WhatsApp」
- **_重新設計「主題列表」界面_** - 更便利、清楚和容易地使用子版塊
- **_重新設計「帖子頁面」界面_** - 更清楚顯示目前的標題以及所在的版塊
- **_重新設計「頁面控制器」_** - 統一位於下方，更方便單手轉頁
- **_重新設計「發送短消息對話」界面_** - 更改成以親切的原生界面輸入、加入「黑夜」及「OLED 省電」設計及移除了 IR
  signature
- **_自動插入 Youtube 播放元件_** - 解決 EPC 用戶發佈主題時沒有使用 Youtube 插入功能，IR 用戶仍可以直接觀看短片，不用彈
  出彈入
- **_「更多功能」彈出式界面以原生界面取代_** - 反應速度更快捷及更 iOS 的界面
- **_重製或更改元件_** - 復審大量 v3.x 未協調的元件，重製或更改元件，保持 IR App 一貫清新風格
- **_提升開啟「主題/回覆發佈頁面」速度_** - 移除部份 v2.x 遺留的殘餘代碼，主要是 Web 內核上載圖片的功能 (3.x 已一統改為
  用 App 內核壓縮兼上載)
- **_實現「零．主程線阻檔」_** - 重構大量 v1.x 遺留的代碼，將所有 HTML Parsing 的工作都交予 Web Worker 處理，保証 Main
  Thread 不會被 CPU-Intensive 工作阻擋
- 改善英文字會斷開隔行問題
- 改善「主題/修改帖子發佈頁面」標題太長時很難使用

#### App 更新

- **_大幅提升開 App 速度_** - 改善部份代碼，減低開 App 時至少 300% 負載率
- **_更省電_** - 改善部份代碼，會根據使用狀況暫停不必要的 WebView
- **_支援「黑夜」及「OLED 省電模式」主題_** - 全部原生元件都支援
- **_自動開啟 YouTube App_** - 點擊任何 YouTube 都會自動開啟 YouTube App
- 更改 Bundle ID 重新上架，設定為收費版並定價 $68
- 支援內核 4.0.0 的原生呼叫

#### 修正

- 修正開 App 載入時會閃兩下問題
- 移除「回覆」/「查看」排序 （因為 HKEPC 方面已經移除）
- 修正於「黑夜」或「OLED 省電」模式時，開 App 時有時候出現白色畫面
- 修正於「黑夜」或「OLED 省電」模式時，彈出鍵盤時有時候出現白色畫面
- 修正插入 URL 的快捷鍵功能於「只輸入地址」時使用了錯誤的 Discuz! 格式
- 修正於查閱「引用」帖子功能時，圖片無法正常加載
- 修正無法舉報問題
- 修正「論壇版塊」無法加載的訊息

#### IR 營運狀態更新

IR 一直致力為 HKEPC 用戶提供優質的手機瀏覽體驗，為希望更多 IR App 能讓更多 HKEPC 用戶能使用 IR，故設定為免費
![image](img/gifs/icon_clap.gif)。

現時 IR App 只有用戶捐款這個單一收入來源，由於數量不多，三年來的總額約 $1200 HKD；獲得的收入連 iOS $99 USD/年 上架費都不
足夠支付，更甚，每個大型更新所需的開發費用（作者的機會成本 - Opportunity cost）。

三年以來，相信大家明白 IR App 都處於一個非常惡劣的營運環境，作者一直都有尋求出路，希望可以保障到 3000 名 IR 活躍月用戶，
由於活躍用戶數量上相信已佔總整個 HKEPC 活躍用戶有可觀的百分比，於是作者曾兩次嘗試主動透過 A Sir 接觸 HKEPC 的管理層尋求
合作機會，但非常可惜，全部方案均**不獲回覆**。

曾提及過的合作內容如下：

- **_設置不同位置的廣告欄_** - 為 HKEPC 的 Marketing 增加籌碼及廣告產品

- **_擺放 Ads 增加 HKEPC 的收入_** - 因為 IR 是手機應用程式，如果使用 hkepc.com 網頁正在使用中的 Ads 有可能被視為無效點
  擊或無法加載；另外 Mobile Ads 的點擊其實比 Web Ads 更值錢！

- **_加入推送通知_** - 為 HKEPC 的 Marketing 增加籌碼及廣告產品

如果 HKEPC 與 IR App 合作並採取以上方案均是「零成本、純合作」為 HKEPC 帶來新收入， 以上方案均是開源的「三贏」局面。

**_什麼是「三贏」？_**

1. HKEPC 方面： HKEPC 不用支付龐大的手機 App 開發費用。若要 HKEPC 後台 Discuz! 7.2 不變的情況下，找公司開發類似 IR 的手
   機應用程式，開發費用至少要 300k - 400k，費用還未包括維護費用及產品質素，風險非常高。回顧歷史，HKEPC 於 2014 年曾經出
   資打造官方 Android App，但第一個版本出後，多年來都沒有作出更新，更沒有提供 iOS App，相信 HKEPC 也深知「養一隻 App 比
   起養一個 PHP 論壇難好多，若當中沒有相關認識的人從中協調，中伏風險非常高」，更何況，要複製 IR App 三年來一直不斷改善用
   戶體驗及提升流暢度嗰種心力，談何容易。

2. IR 方面：作者則只收取部份**分紅**作添加新功能及長期維護開發費用去「養 App」。

3. 用戶方面：所有 HKEPC 用戶㫮可繼續完全免費享受與時並進、不斷改善以及高質素的 IR App。

儘管是一個幾乎零成本的三贏方案，HKEPC 管理層依然完全沒有回應，作者對如斯冷落的態度感到氣餒，加上面對 IR App 入不敷支的困
局：

> 喺時候 停一停 諗一諗

作者有諗過直接關門大吉這個三輸局面

1. 作者在 IR App 付出的努力將付諸流水
2. HKEPC 用戶將不能再使用 IR App 輕鬆瀏覧 HKEPC
3. HKEPC 將會失去每月 60 萬 PageView 及一堆已經主力用手機應用程式上的 HKEPC 用戶

以表達 「HKEPC 論壇於 2019 還沒有官方 App 」的不滿，但回顧初衷，作者對 HKEPC 有「熱衷」才能單方面付出三年時間做義工到今
天，相信無乜邊個可以做到呢個地步。

> 三年的義工，靠熱衷兼貼錢上架走到今天

誰也不想看到三輸的局面，但熱衷終有一日會用盡，必須要面對現實。

何況 IR Pro v3 App「叫做暢順用到兼唔太多問題」，剩餘的熱衷始終未夠大推動力去繼續進步。

在有自己不能控制的變數下要做到「一分耕耘 一分收穫」其實非常困難，HKEPC 管理層對作者的「耕耘」及提出的三贏方案連「閱」的
回覆都沒有。作者決定不再苦等，主動移除變數 - 既然不能由**既得利益者(HKEPC)**身上分紅並獲得合理的開發費用以達致收支平衝，
那麼現階段唯有退而求其次選擇「用者自付模式」營運，希望各位 IR 用戶明白。

IR Pro v3 會兌現當天許下永久完全免費的承諾；而新版本 IR Extreme v4 則會繼續走向極緻體驗，以「用者自付模式」模式繼續營運
。

如果這一刻你正在使用 IR Pro v3 䦦讀此更新，而你亦覺得 IR Pro v3 能帶給流暢的使用體驗。

> 那麼 IR Extreme v4 是一個更好更流暢更多功能的版本！希望閣下能購買使用以示支持.

#### IR 的定價的算式

IR 的支出除了固定的 iOS 上架年費($99 USD)外，其實最大的支出是作者的機會成本(開發時間)。

由於 IR 定位特殊不能面向數十億人的國際市場，只能面向潛在數千名 HKEPC 用戶；在非常有限的潛在用戶人數又想達致收支平衡，定
價策略必需要有數據及算式支持。

在僅有數千名的潛在用戶內，要從中獲得收入並達到收支平衝，定價無可否認一定要比較高。

IR App 以免費模式經營三年，頭一年已成功吸引到大量 HKEPC 用戶使用並立即進入飽和狀態：

- ~3000 位活躍月用戶 (每月至少用一次)
- ~1700 位活躍週用戶 (每週至少用一次)
- ~650 位活躍日用戶 (每天用)

上述數字大約已持續了 1.5 年，作者相信增長空間非常有限。

由於作者只期望收支平衡，下列算式均以成本價作出計算：

只計算 Extreme v4 的巨型更新，所涉及費用大約 `25,000 HKD` (不包括當初 v1/v2/v3 所付出的成本)

保守計算：50% 日用戶、5% 週用戶及 0.5% 月用戶會購買 Extreme v4 支持

```
總購買人數：650 * 0.5 + 1050 * 0.05 + 1300 * 0.005 = 384 人

目標銷售金額(包括 AppStore 及 PlayStore 的 30% 佣): $25000 / 0.7 = ~$35000 HKD

定價: 35000 / 384 = ~$91 HKD
```

理想計算：全部日用戶購買

```
總購買人數：650 人

目標銷售金額(包括 AppStore 及 PlayStore 的 30% 佣): $25000 / 0.7 = ~$35000 HKD

定價: 35000 / 650 = ~$53 HKD
```

若在兩個估算人數中取出平均值

```
總購買人數：(384 + 650) /2 = 516 人

目標銷售金額(包括 AppStore 及 PlayStore 的 30% 佣): $25000 / 0.7 = ~$35000 HKD

定價: 35000 / 516 = ~$67 HKD
```

所以根據上述數據及估算算式，IR 最接近的定價就是 **$68**

#### IR 互利共生的承諾

若於 2020 年 10 月之前，購買人數有幸突破到 1500 人，IR Extreme v4 將會**馬上**開發以下巨型更新:

- **_開發「原生主題/回覆發佈界面」取代現時「Web 內核的主題/回覆發佈頁面」及 原生 Gif 鍵盤_** - 真正完美體驗原生輸入
- **_重新設計「瀏覧紀錄」_**- 更清楚顯示過往的瀏覧紀錄
- **_重新設計「我的最愛」_**- 加入時間、用戶搜尋選項
- **_加入「熱門帖子」功能_**- HKEPC 論壇沒有此功能，作者雖要自行使用雲端伺服器同時利用 IR App 幫忙有效地採集每個帖子的瀏
  覧量及回覆量，再計算熱門程度。
- **_滙出「IR 內容設定」_**- 分享或額外備份你的 IR 內容設定

如 2020 年 10 月之後，購買 v4 人數多於或等於 500 人，上述巨型更新將會撥入 IR Extreme v5（當然 IR 用戶可以動議其它更新內
容），屆時用戶需要額外購買升級。

如 2020 年 10 月之後，購買 v4 人數仍少於 500 人，將會再檢討營運模式

#### IR 長期維護服務承諾

Extreme v4 版本保証提供由上架日起為期一年的維護服務，維護服務範圍包括修正當前版本的問題及確保可以連接 HKEPC。

Pro 版本將提供有限的維護服務，視乎問題的嚴重性以及維護所需的時間；若 HKEPC 伺服器進行大改版令 Pro 版無法使用，Pro 版有機
會直接下架。

#### IR 可持續發展的更新

- 升級 `AngularJs` `v1.5.3 -> v1.7.8 LTS` 版本

> AngularJS 1.6 fixes numerous bugs and adds new features, both in core and in external modules.

> AngularJS 1.7 contains bug fixes and features to AngularJS core and its external modules, some of which contain
> breaking changes.

- 升級 `Gulp v3.9.3 -> v4.0.1` 以支援 `NodeJs v12+`
- 使用 `browser-sync` 取代 `gulp-webserver` 改善開發環境
- 移除 v1.x 遺留下來的 `bower`，直接使用 `npm modules + browserify` bundle dependencies
- 所有代碼加入 `StandardJs Linting` - 貫徹 IR Project 對「長遠性」的追求

---

**12 Feb 2019 - Release IR Pro 內核 v3.5.2, Android v3.2.0**

App 更新：

- 改善「下載圖片」功能；v3.2.0 將直接下載到 `DCIM/HKEPC` 內
- 修正內置瀏灠器不能於系統瀏灠器開啟時會 Crash 問題
- 修正 HKEPC IR 閒置過久後重啟有機會 Crash 問題

---

**7 Feb 2019 - Release IR Pro 內核 v3.5.2, Android v3.1.2**

App 更新：

- 修正 v3.1.0, v3.1.1 版本不能正常使用問題 (Incremental build 出問題)

---

**7 Feb 2019 - Release IR Pro 內核 v3.5.2, Android v3.1.0**

內核更新：

- 支援提示雙向(Native <-> WebView X 4)同步功能，

App 更新：

- 加入提示雙向(Native <-> WebView X 4)同步功能，用戶無需要再手動刷新頁面更新提示數目
- 加入「一鍵回到主頁功能」，只需點擊底部 Navigation
- 加入內置瀏灠器提供更好的體驗（支援長按下載圖片及複制連結）
- 改善調色（不在使用的底部 Navigation）

---

**6 Feb 2019 - Release IR Pro 內核 v3.5.1, Android v3.0.4**

App 更新：

- 加入手動撤走黑邊；用戶如有黑邊問題，點擊一下就能撤走黑邊。

---

**6 Feb 2019 - Release IR Pro 內核 v3.5.1, Android v3.0.3**

內核更新：

- 「我的版塊」有時候無法按順序問題

App 更新：

- 嘗試修正沒有 Soft Navigation Bar 用戶有黑邊問題

---

**6 Feb 2019 - Release IR Pro 內核 v3.5.0, Android v3.0.2**

App 更新：

- 修正實體鍵用戶有黑邊問題

---

**6 Feb 2019 - Release IR Pro 內核 v3.5.0, Android v3.0.1**

App 更新：

- 改善 Android 8.0, 8.1, 9.0 用戶界面

---

**6 Feb 2019 - Release IR Pro 內核 v3.5.0, Android v3.0.0**

內核更新：

- 修正圖片無法完全加載問題
- 修正於側彈式提示於 M 字額機不能完整顯示問題
- 修正 EPC 回覆或引用時會有空格問題
- 移除加載圖片狀態動畫（如於 Post 內有大量圖片時會提升流暢度）

App 更新：

- v3.0.0 重新設計原生 Navigation，務求達到更易用更清爽；使用 4 個分頁（論壇版塊、我的最愛、功能、關於）管理不同類別，不
  同分頁之間使用獨立 WebView 更有效發揮多核處理器！
- 改善部份代碼升提效能
- Android 最低版本要求提升至 6.0 (舊有 5.0, 5.1 將不再支援)

---

**4 Jun 2018 - Release IR Pro 內核 v3.4.0, Android v2.3.4** 內核更新：

- 加入「我的版塊」功能！用戶可自行調整喜好程度排列你的版塊！

---

**3 Jun 2018 - Release IR Pro 內核 v3.3.4, Android v2.3.3**

內核更新：

- 修正無法使用「一鍵轉換論壇風格」功能

App 更新：

- 更改智能檢查 PM 條件為(每 60 秒 1 次為限，每次由 EPC Request 被動觸發)

---

**3 Jun 2018 - Release IR Pro 內核 v3.3.3, Android v2.3.2**

內核更新：

- 加入「安全問題」登入
- 修正`登入名稱`與`EPC 顯示名稱`大小寫不對會無法出現修改帖子功能

App 更新：

- 修正 Side Menu 黑夜/ OLED 模式時，私人及帖子訊息數目顏色未有變更問題

---

**1 Jun 2018 - Release IR Pro 內核 v3.3.2, Android v2.3.1**

內核更新：

- 移除背景檢查 PM 功能 (IR App 在背景運行時，有機會被 EPC 伺服器認為 DDoS 而封 IP)
- 加長 「M 字額修正」

App 更新：

- 加入智能檢查 PM (每 20 個 EPC Request 檢查 1 次 / 入 App 檢查 1 次 / 每 5 分鐘檢查 1 次)
- 改善 Side Menu 黑夜/ OLED 省電模式用色

---

**28 Apr 2018 - Release IR Pro 內核 v3.3.1, Android v2.3.0**

內核更新：

- 修正私人訊息/帖子訊息消失問題

---

**28 Apr 2018 - Release IR Pro 內核 v3.3.0, Android v2.3.0**

內核更新：

- 加入 「M 字額修正」
- 加入 「OLED 省電」模式
- 修正網絡不穩定時會登出問題
- 修正加載畫面時出現不必要的 icon
- 修正 action sheet 在黑底模式時底色不是黑色

---

App 更新：

- 支援內核「OLED 省電」模式

**19 Apr 2018 - Release IR Pro 內核 v3.2.0, Android v2.2.4**

內核重點內容：

- 以 RxJS 重寫部分 event-driven directives，活用 `Rx.Schedulers.async` (提升流暢度)
- 改善 image lazy loading spinner 當圖片加載中時佔用了不必要的空白位置
- 修正 infinite loading 部份時間出現 Load 錯頁數問題
- 修正 infinite loading spinner 有時不會被移除問題
- 組合多個重複 Toast，i.e. 連續多個重複的連線問題

App 重點內容：

- 修正 Android 6.0 以下裝置狀態列出現透明問題

---

**18 Apr 2018 - Release IR Pro 內核 v3.1.2, Android v2.2.3**

內核重點內容：

- 修正 Android 6.0 以下裝置無法上載圖片問題
- 大量減低帖子內的 watcher 數目及 Throttle scrolling event (提升流暢度)

App 重點內容：

- 修正 Android 6.0 以下裝置空白畫面問題
- 修正 Android 6.0 以下裝置無法瀏灠外部連結問題
- 修正 Android 6.0 以下裝置無法上載圖片問題

---

**16 Apr 2018 - Release IR Pro 內核 v3.1.1, Android v2.2.2**

內核重點內容：

- 修正部分無邊框元件設計
- 簡化部份元件
- 修正「修改帖子」時，上載圖片後帖子內容會重新由 HKEPC 提取並取代問題
- 修正返回瀏灠帖子時會重新 Render 頁面問題
- 解決鍵盤會遮蓋輸入問題

App 重點內容：

- 修正連線逾時有機會炒 App 問題

---

**15 Apr 2018 - Release IR Pro 內核 v3.1, Android v2.2.1**

內核重點內容：

- 重製 image lazy loading 功能（改善圖片加載時會 Lag 機問題）
- 重製 infinity loading 功能 (提升流暢度)
- 移除原生 ionic spinner (CPU intensive) 改用純 CSS spinner (提升流暢度)
- 修正「最新發佈」出現置頂貼開關及發佈新帖子按鍵
- 修正轉換頁面時出現某些元件閃一下的問題
- 改善「加載上一頁」效果

App 重點內容：

- 改善圖片壓縮畫質

---

**4 Apr 2018 - Release IR Pro 內核 v3.0, Android v2.2.0**

重點內容：

- 大量改善效能並提升瀏覽速度
- 修正愈用愈 Lag 的問題
- 採用全新無邊框元件設計
- 加入「一鍵壓縮 150kB 連上傳圖片到 EPC」功能 (Android 6.0 以上)
- 修正網絡不穩時發佈會導致卡死的問題
- 加入更多 EPC 功能

新增功能：

- 加入「最新發佈」
- 加入「我的收藏」
- 加入「我的關注」
- 加入 「IR 簽名」開關
- 加入「收藏此帖子」功能
- 顯示 App 版本 及 Web 內核版本

修正問題：

- 修正愈用愈 Lag 的問題
- 修正網絡不穩時發佈會導致卡死的問題
- 修正搜尋引用後無法返回的問題
- 修正查閲用戶後無法返回的問題
- 修正無法正確顯示上載到 EPC 的咐件
- 移除顯示用戶名稱

---

**2 Nov 2017 - Release v2.1.8 IR Pro**

新增功能：

- 支援 Android 5.0, 5.1 ! (部份功能）
- 於「功能」頁面加入 Refresh 鍵

修正問題：

- 修正瀏灠 URL 時會出時黑屏或彈 App 問題

---

**2 Nov 2017 - Release v2.1.5 IR Pro**

修正問題：

- 返回或轉頁面有機會出現去唔到問題

---

**1 Nov 2017 - Release v2.1.1 IR Pro**

修正問題：

- 不能正常登出

---

**1 Nov 2017 - Release v2.1.0 IR Pro**

IR v2.1.0 (又命名為 IR Pro) 正式推出，所有現有 IR 用家將會直接升級至 IR Pro App 並能繼續免費使用 IR v1.7.0 以前提供的所
有功能及部份 IR Pro 的新功能。

為慶祝 IR Pro 正式推出，由即日起至 2017 年 12 月 31 日，所有 IR 用戶將會自動由「IR Basic」升級為「IR Silver」用戶組別直
至 2018 年 1 月 1 日^\*。「IR Silver」會員將可解鎖所有 IR Pro 的新功能。

詳情請參閱：

> 關於 > IR 用戶組別

重點內容：

- 針對性修改 Ionic 內核，改善效能並提升瀏覽速度接近 200%\*！！！
- 完全移除 Cordova 並自行架設 Native Bridge 重制及新增原生功能，提升使用體驗
- 採用最新 Android 6.0 提供的 WebKit 技術 (Web Message) 接通原生功能
- 更改營運模式為 Freemium

新增功能：

- 加入「自動加載圖片」選項（IR Silver 限定）
- 加入「移除簽名功能」選項（IR Silver 限定）
- 加入「發送短消息」功能
- 加入「移除帖子圖片」功能
- 加入「點擊引用任何位置能查看全文」功能
- 加入「點擊圖片直接於原生瀏灠器開啟圖片」功能
- 加入「上一頁」快捷鍵改善使用體驗
- 加入過場效果
- 加入分辨死圖功能（原先出現空白問題）
- 支援 In App 播放 Youtube

修正問題：

- 修正 HKEPC 使用 Cloudflare Email Obfuscation 所產生的 `[email protected]` 問題
- 修正新增/修改/回覆帖子不能正常上下滾動
- 修正新增/修改/回覆帖子突然空白
- 修正新增/修改/回覆帖子不能正常使用「複製」及「貼上」功能
- 修正新增/修改/回覆帖子無法改變「無」、「回覆」、「引用」問題
- 修正開帖必需選擇帖子分類問題
- 修正改帖未必成功問題
- 修正部份時間開 App 出現空白畫面
- 修正熱門按鈕出現於「最新帖子」
- 修正熱門按鈕出現於「搜尋帖子」
- 修正使用「人類極限」的界面大小的體驗
- 移除 ionic 內核出現 Keyboard 效果（製造不必面的空白）

其它變更：

- HKEPC IR Pro 最低使用要求更改為 Android 6.0+
- 新增快捷鍵 - 註冊成為新會員
- 移除「新聞中心」
- 複製 EPC 連結更改為直接開啟

^\*作者保留最終決定權

\*與 IR v1.7.0 比較

---

**27 June 2017 - v1.7.0**

修正「搜尋帖子」部份時候獲不到結果，修正後完美等同 EPC Forum 内的搜尋移除不必要的 UI

---

**26 June 2017 - Release v1.6.1**

修正 Status Bar 問題升級到 Crosswalk Web View plugin 2.3 提升效能

---

**26 June 2017 - Release v1.6.0**

升級到 Https 連線 （EPC 提供的）

---

**2 Feb 2017 - Release v.1.5.3**

- 加入隱藏用戶名稱選項
- 修正轉頁問題
- 修正部份用家看不見修改帖子
- 修正編緝時突然變成空白
- 提升加載「帖子列表」的效能
- 加入自動顯示置頂帖子（如同頁內全都是置頂）
- 移除回覆的「預覧功能」
- 加入小型置頂的標題

---

**2 Jan 2017 - Release v.1.5.1**

- 提升接近 2 倍解讀 HKEPC HTML 的速度
- 使用最新的 Web Worker 提升使用流暢度
- 改善論壇版塊的版面重新整理設計
- 修正不能修改 Post
- 加入全新頁面導覽器
- 加入點擊頭像瀏覽 User Profile
- 加入編輯輔助工具列支援加入 URL、字體大小、字型
- 加入全新圖片上載功能，直接上傳圖片至 HKEPC (150KB) 限制
- 加入一鍵轉換「論壇風格」，方便枱機用家輕鬆轉換 2.0 Beta 版
- 加入自動擴張輸入範圍，提升用家開帖、回覆體驗
- 加入自動轉換 Status Bar 顏色    加入顯示已鎖的帖
- 加入「倒轉看帖」功能
- 加入「只看該作者」功能
- 加入「關注主題的新回覆」功能
- 真正自動跳到上一次的閱讀位置    真正能夠向上頁閱讀    改善版面設計
- 移除 Loading bar

---

**14 Aug 2016 - Release v1.4.2**

- 加入新聞中心
- 加入分享連結功能
- 加入調整字型大小功能!!!
- 加長新 Post ／ Reply 的 Input Area
- 修正最新貼子標題出現頁數

---

**5 June 2016 - Release v1.3.3**

- 加入瀏覧最新文章功能 (需登入）
- 加入自動跳到上一次閱讀的頁數
- 在 Edit Post 加入 Gif Keyboard
- 升級 Ionic 版本
- Toast Message 改為右至左彈出
- Other Minor Bugs fix
- 改善效能

---

**22 Mar 2016 - Release v1.2.9**

- 改善黑底模式用色
- 修正少量問題

---

**19 Mar 2016 - Release v1.2.4**

- 加入全新 前往帖子功能
- Fix minor UI bugs
- Fix some color

---

**11 Mar 2016 - v1.1.0 Web Version Released**

- 加入黑底模式
- Fix minor UI bug, improve UX

---

**08 Mar 2016 - v1.0.0 Web Version Released**

- 加入修改 Comment
- PM 對話
- Proxy 連線 升級至 Https
- 加入我的帖子
- 加入我的回覆
- 加入瀏覧紀錄
- 加入 User Rank
- 增加 Notification / PM 提示標記
- 提升 UX ( User Experience ) , 加入手動輸入 Page Number 、 改善用色、改善版面設計、改善版面跳頁問題

---

**01 Mar 2016 - Release v0.5.0**

- Fix EPC avatar cannot be displayed

---

**26 Feb 2016 - Release 0.4.4**

- ( First Version )

**15 Feb 2016 - Release v0.4.3 App Store rejected**

---

**14 Feb 2016 - Release v0.4.2**

- Urgent bug fix on wrong credential expire time

---

**14 Feb 2016 - Release v0.4.1**

- Minor bug fix
- Fix Edge Bug
- 加入 Paging 鍵

---

**09 Feb 2016 - Release v0.4.0**

- 新增 Likes System
- 修正 Jump Pages 問題

---

**06 Feb 2016 - Release v0.3.1**

- 新增 Filter / Order 功能
- 開 Post Validation

---

**06 Feb 2016 - Release v0.3.0**

- 開 Post 、 Reply 後自動 Refresh
- 加 Gif 到上一次 edit 位置、UI 更新

---

**03 Feb 2016 - Release v0.2.0**

- Fix Login issue 限制未登入之會員能使用的功能
- 加入隱藏置頂帖子功能
- 加入 Image lazy loading

---

**31 Jan 2016 - Release v0.1.0**
