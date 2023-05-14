import * as Controllers from './index'

export class CMKeywordController {
  static get STATE() {
    return 'tab.features-contentmanage-keyword'
  }

  static get NAME() {
    return 'CMKeywordController'
  }

  static get CONFIG() {
    return {
      // topicType: 'latestPostTopicFilters' | 'latestReplyTopicFilters'
      url: '/features/contentmanage/keywords',
      views: {
        main: {
          templateUrl: 'templates/features/contentmanage/keywords.html',
          controller: CMKeywordController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor($scope, $http, $state, $stateParams, $ionicHistory, rx, apiService, LocalStorageService, observeOnScope) {
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.rx = rx
    this.apiService = apiService
    this.LocalStorageService = LocalStorageService
    this.items = []
    this.isReady = false
    this.keywordInput = ''
    this.editMode = false

    $scope.$on('$ionicView.loaded', (e) => {
      LocalStorageService.getObject('hlKeywords', [])
        .safeApply($scope, (hlKeywords) => {
          this.items = hlKeywords
          this.isReady = true
        })
        .subscribe()
    })
  }

  addKeyword(event) {
    if (!event || (event && event.which === 13)) {
      this.items = [this.keywordInput, ...this.items]
      this.keywordInput = ''
    }
    this.LocalStorageService.setObject('hlKeywords', this.items)
  }

  deleteKeyword(index) {
    this.items = this.items.filter((it, i) => i !== index)
    this.LocalStorageService.setObject('hlKeywords', this.items)
  }

  onBack() {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
      })
      this.state.go(Controllers.ContentManageController.STATE)
    }
  }
}
