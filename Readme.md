# 簡介
[1.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/1.x) Branch 完全依賴 Cordova

[2.x](https://github.com/gaplo917/hkepc-ionic-reader/tree/2.x) Branch 已經完全移除 Cordova 並自行重制某部份功能，此 Project 將會作 Native Project 的 Submodules 運行，[具體原因在此](https://github.com/gaplo917/hkepc-ionic-reader/tree/2.x#移除-cordova-原因)。

3.x Branch 效能先決．重新出發！Code review 及自行重製部份功能(發現部份 `ionic-angular.js` 提供的功能是拖低流暢度的主要成因)

# 效能先決．重新出發
TODO


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
