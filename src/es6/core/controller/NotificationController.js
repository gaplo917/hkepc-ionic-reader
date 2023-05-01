/**
 * Created by Gaplo917 on 29/1/2016.
 */
import { FindMessageRequest } from '../model/requests'
import * as Controllers from './index'

export class NotificationController {
  static get STATE () { return 'tab.features-notifications' }

  static get NAME () { return 'NotificationController' }

  static get CONFIG () {
    return {
      url: '/features/notifications',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/features/notification/notification.html',
          controller: NotificationController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, apiService, AuthService, $state, $sce, ngToast, $ionicHistory) {
    this.apiService = apiService
    this.scope = $scope
    this.notifications = null
    this.state = $state
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory

    this.page = 1
    this.refreshing = false

    $scope.$on('$ionicView.loaded', (e) => {
      AuthService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
        if (isLoggedIn) {
          this.loadNotifications()
        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 帖子消息需要會員權限，請先登入！</i>`)
        }
      }).subscribe()
    })
  }

  loadNotifications () {
    this.refreshing = true

    this.apiService.notifications(this.page)
      .safeApply(this.scope, ({ totalPageNum, notifications }) => {
        this.totalPageNum = totalPageNum

        if (notifications.length > 0) {
          this.notifications = (this.notifications || []).concat(notifications)
        } else {
          this.notifications = []
        }

        this.refreshing = false

        this.scope.$broadcast('scroll.infiniteScrollComplete')
      }).subscribe()
  }

  findMessage (postId, messageId) {
    this.scope.$emit(FindMessageRequest.NAME, new FindMessageRequest(postId, messageId))
  }

  loadMore (cb) {
    if (this.hasMoreData()) {
      // update the page count
      this.page = parseInt(this.page) + 1

      this.loadNotifications(cb)
    }
  }

  hasMoreData () {
    return this.page < this.totalPageNum && !this.refreshing
  }

  doRefresh () {
    this.notifications = null
    this.page = 1
    this.loadNotifications()
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }
}
