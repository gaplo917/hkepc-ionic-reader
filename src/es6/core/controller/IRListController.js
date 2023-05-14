/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as Controllers from './index'

export class IRListController {
  static get STATE() {
    return 'tab.topics-ir'
  }

  static get NAME() {
    return 'IRListController'
  }

  static get CONFIG() {
    return {
      url: '/ir',
      views: {
        main: {
          templateUrl: 'templates/ir/index.html',
          controller: IRListController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor($scope, $http, $state, $ionicHistory) {
    this.state = $state
    this.ionicHistory = $ionicHistory
  }

  onBack() {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

  relativeMomentize(dateStr) {
    if (moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(), 'days') >= -3) {
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  swipeLeft() {
    if (this.canSwipeBack) {
      this.onBack()
    }
  }
}
