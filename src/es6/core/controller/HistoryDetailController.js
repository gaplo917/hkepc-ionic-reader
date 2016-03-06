/**
 * Created by Gaplo917 on 6/3/2016.
 */
import * as Controllers from "./index"

const moment = require('moment')
require('moment/locale/zh-tw');

export class HistoryDetailController {
  static get STATE() { return 'tab.features-history-details' }

  static get NAME() { return 'HistoryDetailController' }

  static get CONFIG() {
    return {
      url: '/features/history/:dateStr',
      views: {
        'tab-features': {
          templateUrl: 'templates/features/history/history.details.html',
          controller: HistoryDetailController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor(HistoryService,$ionicHistory,$state,$stateParams) {
    this.historyService = HistoryService
    this.state = $state
    this.ionicHistory = $ionicHistory

    this.dateStr = $stateParams.dateStr

    const histories = this.historyService.getHistoryAt(this.dateStr)
    this.histories = histories

  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateName == Controllers.FeatureRouteController.STATE){
      this.ionicHistory.goBack()
    } else {
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }

  momentize(dateStr){
    return moment(dateStr, 'YYYYMMDD').format('L')
  }

  relativeMomentize(dateStr){
    return moment(dateStr, 'YYYYMMDD').endOf('day').fromNow()
  }

  relativeMomentizeTimestamp(timestamp){
    return moment(timestamp).fromNow()
  }

}