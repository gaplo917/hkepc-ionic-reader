# 簡介
1.x Branch 完全依賴 Cordova

2.x Branch 已經完全移除 Cordova 並自行重制某部份功能，此 Project 將會作 Native Project 的 Submodules 運行。

# 移除 Cordova 原因
* Cordova 太多 Plugins 都好耐無更新，欠缺 Documentation、Buggy，摸石過河咁樣。

* iOS WKWebview 效能好過 iOS UIWebView 4-5 倍，但因為卡住 CORS 問題一直要駁 Proxy Server，亦無 Cordova Plugin 解決呢件事。

* Cordova Plugin 唔值得寫；寫 Cordova Plugin 好似隔山打牛咁，無針對性操作，極度低效率。

* Cordova 升級問題；每次都覺得十分痛苦，有時又會出唔到 Build， Cordova 個 WKWebview Engine 仲要做極都做唔好。Cordova 已經上到 7.x ，但係我仲卡緊係 `ios@3.9.2 (Cordova 5.4.2)` (因為用一個 Cordova Plugin 嘅 WKWebView Engine 只支援 `ios@3.9.2`)。

* (上網搵 Cordova Plugin) + (試下佢仲 Work 唔 Work) => 浪費青春；例如話我一直想做 Image Compress + Upload 嘅 Features，浪費咗無數嘅青春去試下https://ionicframework.com/docs/native/ 提供嘅 Plugins，結果完全唔掂。

* 當時花心血做嘅 Angular 1 + ES6 + Gulp Integration 令呢個 Project 非常容易脫離 Ionic CLI、Cordova。

> 總結：如果本身已經係 Native App Developer，真係唔好浪費時間係 Cordova 度！若果你好多野想做，自己用 Native App + WebView + Bridge 自己慢慢做，咁先係做到無限可能性，亦更加容易控制時間。


# 點解唔將啲時間做 React Native?
* 睇完 iPhone 8/X 發佈會，見到粒 A11 效能已經拍得住 i5 Mobile CPU 級數；[「CPU 效能過剩」係自己 2 前年認為會發生嘅事](http://blog.gaplotech.com/hkepc-ionic-reader/) 所以當年先會揀 HTML 起手。

* 做呢個 Project 嘅目標不嬲都係將「長遠性」放第一位； 現時 HKEPC Ionic Reader 受惠於 HTML，直接將 HKEPC 拎番嘅 HTML + 自製 CSS 去 Render，完全唔需要處理最複雜多變嘅 Content Parsing（要做到完美要花極大量嘅時間，只要 HKEPC 一改界面就要重新做過）。

* 好多好有用嘅功能一早已經係 HTML 版本做好咗，若果要係 React Native 度重製，保守估計要花起碼半年工餘時間先可以做到超越 HKEPC IR 嘅 RN 版本。但個人認為若果用戶用緊 (iPhone 6S/ LG G6) 之後嘅手機，流暢未必會感覺得到有大轉變。唔信？ [Download 黎試下](https://itunes.apple.com/hk/app/hkepc-ir/id1081423513?mt=8)

> 其實阿 Gap 已經一早已經做咗一個 POC 出黎 https://github.com/gaplo917/HKEPC-React-Native-Reader 兩版 UI ，不過入面寫緊嘅唔算正統 React，因為當時想嘗試用新做法 React + ReactiveX(rxjs) 去做 State Modeling 而唔用 Redux，有興趣可以 Clone/Fork 黎玩下／繼續落去。

# 而家個 Project 即係咩 Status?
而家 2.x Branch 已經完全移除 Ionic CLI、Cordova，只係繼續用 `ionic.css`, `ionic.js`, `ionic-angular.js`，並作為一個 Submodules Project 比 Native Project 用。


# Getting Start

		// Clone Repo
		git clone https://github.com/gaplo917/hkepc-ionic-reader

		cd hkepc-ionic-reader

		yarn install

		yarn run bower install
# Run
		// run in web / dev with Native Project
		yarn run dev

		// build production / for Native Project
		yarn run build
