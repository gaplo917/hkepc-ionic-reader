/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from '../model/CommonInfoExtractRequest'
import {PushHistoryRequest} from '../model/PushHistoryRequest'
import * as Controllers from './index'

export class SearchController {
  static get STATE() { return 'tab.topics-search'}
  static get NAME() { return 'SearchController'}
  static get CONFIG() { return {
    url: '/topics/search',
    views: {
      'tab-topics': {
        templateUrl: 'templates/search.html',
        controller: SearchController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope,$ionicHistory,$state,ngToast,apiService, rx, LocalStorageService) {

    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.state = $state
    this.localStorageService = LocalStorageService
    this.apiService = apiService
    this.ngToast = ngToast
    this.rx = rx

    this.searching = false
    this.lastSearchTimestamp = 0

    this.localStorageService.get('formhash').safeApply($scope, data => {
      this.formhash = data

    }).subscribe()

  }

  onSearch(keyword){
    const now = new Date().getTime()

    const diffInSecond = parseInt((now - this.lastSearchTimestamp) / 1000)

    // only allow serach per 20 second ( limited by hkepc )
    const canSearch = diffInSecond >= 20

    if(canSearch){
      this.searching = true
      this.lastSearchTimestamp = new Date().getTime()

      this.apiService.search(this.formhash , keyword).safeApply(this.scope, resp => {
        this.state.go(
          Controllers.PostListController.STATE,
          {
            page:1 ,
            topicId: 'search',
            searchResp: JSON.stringify(resp),
            searchText: keyword
          }
        )

        this.searching = false

      }).subscribe()
    }
    else {
      this.ngToast.danger({
        dismissOnTimeout: false,
        content: `<i class="ion-ios-stopwatch-outline"> HKEPC 只支授 20 秒搜尋一次，請於 ${20 - diffInSecond} 秒後再嘗試！</i>`
      })
    }

  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }
}
