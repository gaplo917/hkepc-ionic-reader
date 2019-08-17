import * as Controllers from './index'

export class CMTopicController {
  static get STATE () { return 'tab.features-contentmanage-topic' }

  static get NAME () { return 'CMTopicController' }

  static get CONFIG () {
    return {
      // filterType: 'latestPostTopicFilters' | 'latestReplyTopicFilters'
      url: '/features/contentmanage/topic/:filterType',
      views: {
        main: {
          templateUrl: 'templates/features/contentmanage/topics.html',
          controller: CMTopicController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $http, $state, $stateParams, $ionicHistory, rx, apiService, LocalStorageService, observeOnScope) {
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.rx = rx
    this.apiService = apiService
    this.LocalStorageService = LocalStorageService
    this.targetFilter = $stateParams.filterType
    this.title = this.targetFilter === 'latestPostTopicFilters'
      ? '最新發佈'
      : this.targetFilter === 'latestReplyTopicFilters'
        ? '最新帖子'
        : '未知'
    this.originalItems = []
    this.items = []
    this.searchText = ''

    $scope.$on('$ionicView.loaded', (e) => {
      rx.Observable.combineLatest(
        LocalStorageService.getObject(this.targetFilter, []),
        apiService.fullTopicListFromSearch(),
        (filters, topics) => ({ filters, topics })
      )
        .safeApply($scope, ({ filters, topics }) => {
          this.originalItems = topics.map(it => {
            const { id } = it
            return {
              ...it,
              isSelected: filters.indexOf(id) >= 0
            }
          })
          this.items = this.originalItems
        })
        .subscribe()
    })

    observeOnScope($scope, 'vm.searchText')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.items = this.originalItems.filter(it => it.name.indexOf(newValue) >= 0)
      })
  }

  onTopicSelected () {
    this.LocalStorageService.setObject(this.targetFilter,
      this.originalItems
        .filter(it => it.isSelected)
        .map(it => it.id)
    )
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.ContentManageController.STATE)
    }
  }
}
