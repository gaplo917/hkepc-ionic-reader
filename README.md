![HKEPC IR App](meta/webpage_preview.png)

# HKEPC IR Pro (https://promote.hkepc.pro)

<img src="https://storage.googleapis.com/hkepc-ir-public/hkepc-ir-pro-icon@512.png" height="200">
<a href="https://apple.co/44zfmAV"><img src="https://storage.googleapis.com/hkepc-ir-public/apps-applestore.png" height="50" target="_blank"> </a>
<a href="https://play.google.com/store/apps/details?id=com.gaplotech.hkepc_ionic_reader"><img src="https://storage.googleapis.com/hkepc-ir-public/apps-googleplay.png" height="50" target="_blank"></a>

# Introduction

This application provided an unbelievable user experience through fine-tuning the web technology available since 2016.

- Replaced Cordova with thin native Swift(iOS) and Kotlin(Android) application with tailor-made message bridges.
- Extensively fine-tuning `ionic.js`, `ionic-angular.js` for a new navigation solution to
  [eliminate significant navigation delay](https://github.com/ionic-team/ionic/issues/10781).
- Extensively use [ReactiveX](https://rxjs.dev/) and
  [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to offload heavy HTML
  parsing duty on client side.
- Overall Tech Stack: Angularjs(v1), Scss, Webpack 5, ReactiveX, WebWorker

Disclaimer: I build this project in my leisure time and I have no relationship with HKEPC.

# 簡介

[1.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/1.x) Branch 完全依賴 Cordova

[2.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/2.x) Branch 已經完全移除 Cordova 並自行重制某部份功能，此
Project 將會作 Native Project 的 Submodules 運行

[3.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/3.x) Branch 效能先決．重新出發！Code review 及自行重製部份功能
(發現部份 `ionic-angular.js` 提供的功能是拖低流暢度的主要成因)

[4.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/4.x) Branch 內容自主．改良體驗！加入 HKEPC 討論區不能提供的功
能，繼續微調 `ionic-angular.js`

[5.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/4.x) Branch 持續改良體驗、可持續發展模式@1 May 2023

# 3.x - 效能先決．重新出發 (21 Jan 2019 Updated)

Ionic V1 - 雖然係第一代比較完整嘅 HTML 5 Mobile framework 並以 Cordova 為基礎去做，但 Ionic V1 其實有好多 Performance 問
題其實仲未 Optimize，更甚其實根本冇好好咁同 Native integrate。

> Ionic V1 有兩個嚴重影響效能嘅問題！

---

- **Virtual DOM Cache** - 用 Profiler 見
  到[呢幾行每次轉 View 都會成個 DOM element Cache 低，愈多 Element 就愈行愈慢](https://github.com/gaplo917/hkepc-ionic-reader/blob/026c729c0bf411d2c34b1cd15010c59e57b19a89/www/lib/ionic/js/ionic.js#L418-L449)
  ，所以點解嘅啲 Example App 好似咁順，但一寫落手 Ionic V1 一多 DOM 就疾疾下
  ，[其它人嘅案例(Ionic V2 Beta)](https://github.com/ionic-team/ionic/issues/10781)。慶幸地由於 2.x 開始已經全棄
  Cordova，Native 部份已經係自己寫，所有「返回上一頁」嘅動作都已經用 Native 處理（Native Browser 有 Cache 根本冇需要自己
  Cache)。 Disable 咗個 Cache 之後，基本上成個 Ionic V1 App 清爽咗好多，Android 中低階機更由 `~700 ms` 轉頁降到
  `~300 ms` ，瀏覧速度接近快咗 1 倍。

- **CPU-Heavy spinner** - 唔知點解 Scroll 嘅時好唔順，最後發現佢 Ionic V1 提供嘅 Spinner 係用 javascript 撩 DOM 咁去
  Render，極級燒 CPU，
  之[換做 CSS hardware accelerated spinner](https://github.com/gaplo917/hkepc-ionic-reader/commit/b3e6fbf25e063ac9957511fea2769183106275a7)
  ，效果相常滿意

---

> 另外，因為由 1.x 開始做嘅辛苦野先繼續到落去

- **AngularJs 1 + ES6 + AngularJS Rx** - Ionic V1 跟機係配 ES5，好多好開心嘅 ES6 功能用唔到；但因為自己深信寫 ES6 長遠一
  定有幫助，起手嘅時候我花咗好多時間搞 AngularJs + ES6 + Gulp + Babel + Browserify。呢個組合其實真係好少眾，網上亦冇乜資
  源。冇咁上下 Javascript 經歷其實好難做到。另外，自己係 ReactiveX 信徒加上 Angular 2 開始都用 RxJs，當然要用埋啦。

- **Web Worker** - Web Worker 呢兩隻字，好多人聽到都覺得離地。因為真正看待 Performance 嘅人，想唔 Block UI Thread 先會接
  觸搞並放資源去寫，因為放埋落 UI Thread 其實都只係疾一疾，唔理 Performance 其實無乜問題。但 HKEPC IR 係 Client-side
  parsing HTML，即係每一頁 HKEPC 拎落黎要抽取資料再去 Render，無可能下下都疾一下先去到下一版，就用
  [Rx doOnNext 叫醒 WebWorker 做 Parsing，再 FlatMap 去等收番個 Message](https://github.com/gaplo917/hkepc-ionic-reader/blob/4be9b221b0d2dfa1b61dcb4a5bb6616a9e1c859a/src/es6/core/service/ApiService.js#L30-L59)
  ，無 Rx 加持真係好難寫得好。

- **One-way Binding** - 記得開始寫嘅時候， AngularJs One-way Binding 都未出，出咗就即刻用，大量減低 Watcher 數目。

- **Native Message Bridge** - 做好咗一條 Message Bridge 之後可以做多好多野。

---

**HKEPC IR Pro Active User Snapshot@21 Jan 2019** ![HKEPC IR App](meta/firebase_user_activity.png)

---

HKEPC IR Pro iOS v2.4+ 及 Android v3.0+ 喺真正做到 hybrid sweet spot，自己用緊 iPhone 6S Plus(A9)/ LG G6(Snapdragon 821)
測試都覺得好流暢，未來嘅機只會更加流暢；

> HKEPC IR Pro 仲有好多位可以做得更好，Side Project 黎講真係要儲下心力先可以再更新。

# 2.x - 棄舊迎新．剷走 Cordova (9 Oct 2017 Updated)

### 移除 Cordova 原因

- Cordova 太多 Plugins 都好耐無更新，欠缺 Documentation、Buggy，摸石過河咁樣。

- iOS WKWebview 效能好過 iOS UIWebView 4-5 倍，但因為卡住 CORS 問題一直要駁 Proxy Server，亦無 Cordova Plugin 解決。

- Cordova Plugin 唔值得寫；寫 Cordova Plugin 好似隔山打牛咁，無針對性操作，極度低效率。

- Cordova 升級問題；每次都覺得十分痛苦，有時又會出唔到 Build， Cordova 個 WKWebview Engine 仲要做極都做唔好。Cordova 已
  經上到 7.x ，但係我仲卡緊係 `ios@3.9.2 (Cordova 5.4.2)` (因為用一個 Cordova Plugin 嘅 WKWebView Engine 只支援
  `ios@3.9.2`)。

- (上網搵 Cordova Plugin) + (試下佢仲 Work 唔 Work) => 浪費青春；例如話我一直想做 Image Compress + Upload 嘅 Features，
  浪費咗無數嘅青春去試下https://ionicframework.com/docs/native/ 提供嘅 Plugins，結果完全唔掂。

- 當時花心血做嘅 [Angular 1 + ES6 + Gulp Integration](https://github.com/gaplo917/angular-es6-seed) 令呢個 Project 非常
  容易脫離 Ionic CLI、Cordova。

> 總結：如果本身已經係 Native App Developer，真係唔好浪費時間係 Cordova 度！若果你好多野想做，自己用 Native App +
> WebView + Bridge 自己慢慢做，咁先係做到無限可能性，亦更加容易控制時間。

### 點解唔將啲時間做 React Native?

- [「CPU 效能過剩」係自己 2016 年頭認為會發生嘅事](http://gaplo.tech/hkepc-ionic-reader/) 所以當年先會揀 HTML 起手，2017
  年尾睇完 iPhone 8/X 發佈會，見到粒 A11 效能已經拍得住 i5 Mobile CPU 級數，更加確信自己嘅睇法。

- 做呢個 Project 嘅目標不嬲都係將「長遠性」放第一位； 現時 HKEPC IR 受惠於 HTML，直接將 HKEPC 拎番嘅 HTML 配合少量自製
  CSS 去 Render，完全唔需要處理最複雜多變嘅 Content Parsing（因為要做到完美要花極大量嘅時間，只要 HKEPC 一改界面就要重新
  做過）。

- 好多好有用嘅功能一早已經係 HTML 版本做好咗，若果要係 React Native 度重製，保守估計要花起碼半年工餘時間先可以做到超越
  HKEPC IR 嘅 RN 版本。但個人認為若果用戶用緊 (iPhone 6S/ LG G6) 之後嘅手機，流暢未必會感覺得到有大轉變。唔信？
  [Download 黎試下](https://itunes.apple.com/hk/app/hkepc-ir/id1081423513?mt=8)

### 而家個 Project 即係咩 Status?

而家 2.x Branch 已經完全移除 Ionic CLI、Cordova，只係繼續用 `ionic.css`, `ionic.js`, `ionic-angular.js`，並作為一個
Submodules Project 比 Native Project 用。

# Getting Start

```bash
    # Clone Repo
    git clone https://github.com/gaplo917/hkepc-ionic-reader

    cd hkepc-ionic-reader

    npm install

    # run in webpack dev, localhost:3000
    npm run dev

    #build production
    npm run build
```

# Create Proxy server for Dev

```bash
    git clone https://github.com/gaplo917/hkepc-cors-dev-proxy

    cd hkepc-cors-dev-proxy

    nvm use 12

    yarn install

    yarn start
```
