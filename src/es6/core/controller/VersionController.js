import * as Controllers from './index'
const showdown  = require('showdown')

export class VersionController {
  static get STATE() { return 'tab.about-version'}
  static get NAME() { return 'VersionController'}
  static get CONFIG() { return {
    url: '/about/version',
    views: {
      'main': {
        templateUrl: 'templates/about/version.html',
        controller: VersionController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($state,$ionicHistory, $http) {
    this.state = $state
    this.ionicHistory = $ionicHistory
    const converter = new showdown.Converter()
    $http.get('https://hkepc.ionic-reader.xyz/templates/about/version.md').then(resp => {
      this.content = converter.makeHtml(resp.data)
    })
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
}
