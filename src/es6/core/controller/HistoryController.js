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
        'main': {
          templateUrl: 'templates/features/history/history.html',
          controller: HistoryController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor(HistoryService,$ionicHistory,$state,$scope) {
    this.historyService = HistoryService
    this.state = $state
    this.ionicHistory = $ionicHistory

    $scope.$on('$ionicView.enter', (e) => {

      this.historyService.getHistoryStat().safeApply($scope, stat => {
        this.historyStat = stat
      }).subscribe()

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
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }

  momentize(dateStr){
    return moment(dateStr, 'YYYYMMDD').format('L')
  }

  relativeMomentize(dateStr){
    return moment(dateStr, 'YYYYMMDD').fromNow()
  }

  sortedDateStrKey(obj){
    if(obj){
      const keys = Object.keys(obj)

      return keys.length > 1
          ? keys.sort((e1,e2) => parseInt(e2) - parseInt(e1)).slice(0,5)
          : keys
    } else {
      return []
    }

  }
}