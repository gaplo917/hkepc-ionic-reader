/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as Controllers from './index'

export class ContentManageController {
  static get STATE () { return 'tab.features-contentmanage' }

  static get NAME () { return 'ContentManageController' }

  static get CONFIG () {
    return {
      url: '/features/contentmanage',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/features/contentmanage/content.manage.html',
          controller: ContentManageController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $http, $state, ngToast, LocalStorageService, AuthService, $ionicHistory, observeOnScope) {
    this.http = $http
    this.scope = $scope
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.filterMode = '1'

    $scope.$on('$ionicView.loaded', (e) => {

      AuthService.isLoggedIn().safeApply($scope, isLoggedIn => {
        if (isLoggedIn) {
          this.isReady = true
        } else {
          requestAnimationFrame(() => {
            ngToast.danger(`<i class="ion-alert-circled"> 論壞內容管理需要會員權限，請先登入！</i>`)
          })
        }
      }).subscribe()

      LocalStorageService.get('filterMode', '1').safeApply($scope, data => {
        this.filterMode = data
      }).subscribe()
    })

    observeOnScope($scope, 'vm.filterMode')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        LocalStorageService.set('filterMode', newValue)
      })
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }
}
