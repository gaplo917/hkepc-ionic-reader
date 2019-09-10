import * as Controllers from './index'
const showdown  = require('showdown')

export class VersionV4Controller {
  static get STATE() { return 'tab.about-version-v4'}
  static get NAME() { return 'VersionV4Controller'}
  static get CONFIG() { return {
    url: '/about/version-v4',
    cache: false,
    views: {
      'main': {
        templateUrl: 'templates/about/version-v4.html',
        controller: VersionV4Controller.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, $state,$ionicHistory, $http, $rootScope, apiService) {
    this.state = $state
    this.ionicHistory = $ionicHistory
    const converter = new showdown.Converter()

    apiService.githubVersionV4($rootScope.isAndroidNative).safeApply($scope, resp => {
      this.content = converter.makeHtml(resp.data)
    }).subscribe()
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.AboutController.STATE)
    }
  }

  isPromote() {
    const today = moment()
    const promoteEnd = moment('2019-10-31')
    return promoteEnd.diff(today) >= 0
  }
}
