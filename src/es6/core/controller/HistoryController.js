/**
 * Created by Gaplo917 on 6/3/2016.
 */
import * as Controllers from "./index"

export class HistoryController {
  static get STATE() { return 'tab.features-history' }

  static get NAME() { return 'HistoryController' }

  static get CONFIG() {
    return {
      url: '/features/history',
      views: {
        'tab-features': {
          templateUrl: 'templates/features/history/history.html',
          controller: HistoryController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor(HistoryService,$ionicHistory,$state) {
    this.historyService = HistoryService
    this.state = $state
    this.ionicHistory = $ionicHistory

    console.log(this.historyService.getAllHistory())

  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateName == Controllers.FeatureRouteController.STATE){
      this.ionicHistory.goBack()
    } else {
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }
}