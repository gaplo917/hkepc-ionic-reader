**6 Feb 2019 - Release IR Pro 內核 v3.5.0, Android v3.0.0**
內核更新：
* 修正圖片無法完全加載問題
* 修正於側彈式提示於 M 字額機不能完整顯示問題
* 修正 EPC 回覆或引用時會有空格問題
* 移除加載圖片狀態動畫（如於 Post 內有大量圖片時會提升流暢度）

App 更新： 
* v3.0.0 重新設計原生 Navigation，務求達到更易用更清爽；使用 4 個分頁（論壇版塊、我的最愛、功能、關於）管理不同類別，不同分頁之間使用獨立 WebView 更有效發揮多核處理器！
* 改善部份代碼升提效能
* Android 最低版本要求提升至 6.0 (舊有 5.0, 5.1 將不再支援)

---

**4 Jun 2018 - Release IR Pro 內核 v3.4.0, Android v2.3.4**
內核更新：
* 加入「我的版塊」功能！用戶可自行調整喜好程度排列你的版塊！

---

**3 Jun 2018 - Release IR Pro 內核 v3.3.4, Android v2.3.3**
內核更新：
* 修正無法使用「一鍵轉換論壇風格」功能

App 更新： 
* 更改智能檢查 PM 條件為(每 60 秒 1 次為限，每次由 EPC Request 被動觸發)

---

**3 Jun 2018 - Release IR Pro 內核 v3.3.3, Android v2.3.2**
內核更新：
* 加入「安全問題」登入
* 修正`登入名稱`與`EPC 顯示名稱`大小寫不對會無法出現修改帖子功能

App 更新： 
* 修正 Side Menu 黑夜/ OLED 模式時，私人及帖子訊息數目顏色未有變更問題

---

**1 Jun 2018 - Release IR Pro 內核 v3.3.2, Android v2.3.1**
內核更新：
* 移除背景檢查 PM 功能 (IR App 在背景運行時，有機會被 EPC 伺服器認為 DDoS 而封 IP)
* 加長 「M 字額修正」

App 更新： 
* 加入智能檢查 PM (每 20 個 EPC Request 檢查 1 次 / 入 App 檢查 1 次 / 每 5 分鐘檢查 1 次)
* 優化 Side Menu 黑夜/ OLED 省電模式用色

---

**28 Apr 2018 - Release IR Pro 內核 v3.3.1, Android v2.3.0**
內核更新：
* 修正私人訊息/帖子訊息消失問題

---

**28 Apr 2018 - Release IR Pro 內核 v3.3.0, Android v2.3.0**
內核更新：
* 加入 「M 字額修正」
* 加入 「OLED 省電」模式
* 修正網絡不穩定時會登出問題
* 修正加載畫面時出現不必要的 icon
* 修正 action sheet 在黑底模式時底色不是黑色

---

App 更新：
* 支援內核「OLED 省電」模式

**19 Apr 2018 - Release IR Pro 內核 v3.2.0, Android v2.2.4**
內核重點內容：
* 以 RxJS 重寫部分 event-driven directives，活用 `Rx.Schedulers.async` (提升流暢度)
* 改善 image lazy loading spinner 當圖片加載中時佔用了不必要的空白位置
* 修正 infinite loading 部份時間出現 Load 錯頁數問題
* 修正 infinite loading spinner 有時不會被移除問題
* 組合多個重複 Toast，i.e. 連續多個重複的連線問題

App 重點內容：
* 修正 Android 6.0 以下裝置狀態列出現透明問題

---

**18 Apr 2018 - Release IR Pro 內核 v3.1.2, Android v2.2.3**
內核重點內容：
* 修正 Android 6.0 以下裝置無法上載圖片問題
* 大量減低帖子內的 watcher 數目及 Throttle scrolling event (提升流暢度)

App 重點內容：
* 修正 Android 6.0 以下裝置空白畫面問題
* 修正 Android 6.0 以下裝置無法瀏灠外部連結問題
* 修正 Android 6.0 以下裝置無法上載圖片問題

---

**16 Apr 2018 - Release IR Pro 內核 v3.1.1, Android v2.2.2**
內核重點內容：
* 修正部分無邊框元件設計
* 簡化部份元件
* 修正「修改帖子」時，上載圖片後帖子內容會重新由 HKEPC 提取並取代問題
* 修正返回瀏灠帖子時會重新 Render 頁面問題
* 解決鍵盤會遮蓋輸入問題

App 重點內容：
* 修正連線逾時有機會炒 App 問題

---

**15 Apr 2018 - Release IR Pro 內核 v3.1, Android v2.2.1**
內核重點內容：
* 重製 image lazy loading 功能（改善圖片加載時會 Lag 機問題）
* 重製 infinity loading 功能 (提升流暢度)
* 移除原生 ionic spinner (CPU intensive) 改用純 CSS spinner (提升流暢度)
* 修正「最新發佈」出現置頂貼開關及發佈新帖子按鍵
* 修正轉換頁面時出現某些元件閃一下的問題
* 改善「加載上一頁」效果

App 重點內容：
* 改善圖片壓縮畫質

---

**4 Apr 2018 - Release IR Pro 內核 v3.0, Android v2.2.0**
重點內容：
* 大量優化效能並提升瀏覽速度
* 修正愈用愈 Lag 的問題
* 採用全新無邊框元件設計
* 加入「一鍵壓縮 150kB 連上傳圖片到 EPC」功能 (Android 6.0 以上)
* 修正網絡不穩時發佈會導致卡死的問題
* 加入更多 EPC 功能

新增功能：
* 加入「最新發佈」
* 加入「我的收藏」
* 加入「我的關注」
* 加入 「IR 簽名」開關
* 加入「收藏此帖子」功能
* 顯示 App 版本 及 Web 內核版本

修正問題：
* 修正愈用愈 Lag 的問題
* 修正網絡不穩時發佈會導致卡死的問題
* 修正搜尋引用後無法返回的問題
* 修正查閲用戶後無法返回的問題
* 修正無法正確顯示上載到 EPC 的咐件
* 移除顯示用戶名稱

---

**2 Nov 2017 - Release v2.1.8 IR Pro**
新增功能：
* 支援 Android 5.0, 5.1 ! (部份功能）
* 於「功能」頁面加入 Refresh 鍵

修正問題：
* 修正瀏灠 URL 時會出時黑屏或彈 App 問題

---

**2 Nov 2017 - Release v2.1.5 IR Pro**
修正問題：
* 返回或轉頁面有機會出現去唔到問題

---

**1 Nov 2017 - Release v2.1.1 IR Pro**
修正問題：
* 不能正常登出

---

**1 Nov 2017 - Release v2.1.0 IR Pro**

IR v2.1.0  (又命名為 IR Pro) 正式推出，
所有現有 IR 用家將會直接升級至 IR Pro App 並能繼續免費使用 IR v1.7.0 以前提供的所有功能及部份 IR Pro 的新功能。

為慶祝 IR Pro 正式推出，由即日起至 2017 年 12 月 31 日，
所有 IR 用戶將會自動由「IR Basic」升級為「IR Silver」用戶組別直至 2018 年 1 月 1 日^*。
「IR Silver」會員將可解鎖所有 IR Pro 的新功能。

詳情請參閱：

> 關於 > IR 用戶組別

重點內容：
* 針對性修改 Ionic 內核，優化效能並提升瀏覽速度接近 200%*！！！
* 完全移除 Cordova 並自行架設 Native Bridge 重制及新增原生功能，提升使用體驗 
* 採用最新 Android 6.0 提供的 WebKit 技術 (Web Message) 接通原生功能
* 更改營運模式為 Freemium

新增功能：
* 加入「自動加載圖片」選項（IR Silver 限定）
* 加入「移除簽名功能」選項（IR Silver 限定）
* 加入「發送短消息」功能
* 加入「移除帖子圖片」功能
* 加入「點擊引用任何位置能查看全文」功能
* 加入「點擊圖片直接於原生瀏灠器開啟圖片」功能
* 加入「上一頁」快捷鍵優化使用體驗
* 加入過場效果
* 加入分辨死圖功能（原先出現空白問題）
* 支援 In App 播放 Youtube

修正問題：
* 修正 HKEPC 使用 Cloudflare Email Obfuscation 所產生的 `[email protected]` 問題
* 修正新增/修改/回覆帖子不能正常上下滾動
* 修正新增/修改/回覆帖子突然空白
* 修正新增/修改/回覆帖子不能正常使用「複製」及「貼上」功能
* 修正新增/修改/回覆帖子無法改變「無」、「回覆」、「引用」問題
* 修正開帖必需選擇帖子分類問題
* 修正改帖未必成功問題
* 修正部份時間開 App 出現空白畫面
* 修正熱門按鈕出現於「最新帖子」
* 修正熱門按鈕出現於「搜尋帖子」
* 修正使用「人類極限」的界面大小的體驗
* 移除 ionic 內核出現 Keyboard 效果（製造不必面的空白）


其它變更：
* HKEPC IR Pro 最低使用要求更改為 Android 6.0+
* 新增快捷鍵 - 註冊成為新會員
* 移除「新聞中心」
* 複製 EPC 連結更改為直接開啟


^*作者保留最終決定權

*與 IR v1.7.0 比較

---


**27 June 2017 - v1.7.0**

修正「搜尋帖子」部份時候獲不到結果，修正後完美等同 EPC Forum 内的搜尋
移除不必要的 UI

---

**26 June 2017 - Release v1.6.1**

修正 Status Bar 問題
升級到 Crosswalk Web View plugin 2.3 提升效能

---

**26 June 2017 - Release v1.6.0**

升級到 Https 連線 （EPC 提供的）

---

**2 Feb 2017 - Release v.1.5.3**
* 加入隱藏用戶名稱選項
* 修正轉頁問題
* 修正部份用家看不見修改帖子
* 修正編緝時突然變成空白
* 提升加載「帖子列表」的效能
* 加入自動顯示置頂帖子（如同頁內全都是置頂）
* 移除回覆的「預覧功能」
* 加入小型置頂的標題

---

**2 Jan 2017 - Release v.1.5.1**
* 提升接近 2 倍解讀 HKEPC HTML 的速度  
* 使用最新的 Web Worker 提升使用流暢度
* 改善論壇版塊的版面重新整理設計
*   修正不能修改 Post
* 加入全新頁面導覽器
* 加入點擊頭像瀏覽 User Profile
* 加入編輯輔助工具列支援加入 URL、字體大小、字型
* 加入全新圖片上載功能，直接上傳圖片至 HKEPC (150KB) 限制
* 加入一鍵轉換「論壇風格」，方便枱機用家輕鬆轉換 2.0 Beta 版
* 加入自動擴張輸入範圍，提升用家開帖、回覆體驗
* 加入自動轉換 Status Bar 顏色  加入顯示已鎖的帖
* 加入「倒轉看帖」功能
* 加入「只看該作者」功能
* 加入「關注主題的新回覆」功能
* 真正自動跳到上一次的閱讀位置  真正能夠向上頁閱讀  改善版面設計
* 移除 Loading bar

---

**14 Aug 2016 - Release v1.4.2**
* 加入新聞中心
* 加入分享連結功能
* 加入調整字型大小功能!!!
* 加長新 Post ／ Reply 的 Input Area
* 修正最新貼子標題出現頁數

---


**5 June 2016 - Release v1.3.3**
* 加入瀏覧最新文章功能 (需登入）
* 加入自動跳到上一次閱讀的頁數
* 在 Edit Post 加入 Gif Keyboard
* 升級 Ionic 版本
* Toast Message 改為右至左彈出
* Other Minor Bugs fix
* 改善效能

---

**22 Mar 2016 - Release v1.2.9**
* 改善黑底模式用色
* 修正少量問題

---

**19 Mar 2016 - Release v1.2.4**
* 加入全新 前往帖子功能
* Fix minor UI bugs
* Fix some color

---

**11 Mar 2016 - v1.1.0 Web Version Released**
* 加入黑底模式
* Fix minor UI bug,  improve UX

---

**08 Mar 2016 - v1.0.0 Web Version Released**
* 加入修改 Comment
* PM 對話
* Proxy 連線 升級至 Https
* 加入我的帖子
* 加入我的回覆
* 加入瀏覧紀錄
* 加入 User Rank
* 增加 Notification / PM 提示標記
* 提升 UX ( User Experience ) , 加入手動輸入 Page Number 、 改善用色、改善版面設計、改善版面跳頁問題

---

**01 Mar 2016 - Release v0.5.0**
* Fix EPC avatar cannot be displayed

---

**26 Feb 2016 - Release 0.4.4**
* ( First Version )

**15 Feb 2016 - Release v0.4.3 App Store rejected**

---

**14 Feb 2016 - Release v0.4.2**
* Urgent bug fix on wrong credential expire time

---

**14 Feb 2016 - Release v0.4.1**
* Minor bug fix
* Fix Edge Bug
* 加入 Paging 鍵

---

**09 Feb 2016 - Release v0.4.0**
* 新增 Likes System
* 修正 Jump Pages 問題

---

**06 Feb 2016 - Release v0.3.1**
* 新增 Filter / Order 功能
* 開 Post Validation

---

**06 Feb 2016 - Release v0.3.0**
* 開 Post 、 Reply 後自動 Refresh 
* 加 Gif 到上一次 edit 位置、UI 更新

---


**03 Feb 2016 - Release v0.2.0**
* Fix Login issue 限制未登入之會員能使用的功能
* 加入隱藏置頂帖子功能
* 加入 Image lazy loading

---

**31 Jan 2016 - Release v0.1.0**