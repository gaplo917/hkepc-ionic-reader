/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as Controllers from './index'

export class ChatListController {
  static get STATE() {
    return 'tab.features-chats'
  }

  static get NAME() {
    return 'ChatListController'
  }

  static get CONFIG() {
    return {
      url: '/features/chats',
      views: {
        main: {
          templateUrl: 'templates/features/chats/chats.list.html',
          controller: ChatListController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor($scope, apiService, AuthService, $state, ngToast, $ionicHistory, rx) {
    this.apiService = apiService
    this.scope = $scope
    this.chats = []
    this.state = $state
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.rx = rx

    this.page = 1

    $scope.$on('$ionicView.loaded', (e) => {
      this.rx.Observable.combineLatest(AuthService.isLoggedIn(), AuthService.getUsername(), (isLoggedIn, username) => {
        return {
          isLoggedIn,
          username,
        }
      })
        .safeApply($scope, ({ isLoggedIn, username }) => {
          if (isLoggedIn) {
            this.scope.$emit('accountTabUpdate', username)
            this.loadChats()
          } else {
            this.ngToast.danger('<i class="ion-alert-circled"> 私人訊息需要會員權限，請先登入！</i>')
            this.onBack()
          }
        })
        .subscribe()
    })
  }

  loadChats() {
    this.apiService
      .chatList(this.page)
      .safeApply(this.scope, ({ chats, totalPageNum }) => {
        this.totalPageNum = totalPageNum
        this.chats = this.chats.concat(chats)
        this.scope.$broadcast('scroll.infiniteScrollComplete')
      })
      .subscribe()
  }

  loadMore(cb) {
    if (this.hasMoreData()) {
      // update the page count
      this.page = parseInt(this.page) + 1

      this.loadChats(cb)
    }
  }

  hasMoreData() {
    return this.page < this.totalPageNum
  }

  doRefresh() {
    this.chats = []
    this.page = 1
    this.loadChats()
  }

  onBack() {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }
}
