/**
 * Created by Gaplo917 on 6/3/2016.
 */
import * as Controllers from './index'
import { PaginationPopoverDelegates } from '../delegates/pagination-popover-delegates'
import { IRLifecycleOwner } from './base/IRLifecycleOwner'

export class MyPostController extends IRLifecycleOwner {
  static get STATE () { return 'tab.features-mypost' }

  static get NAME () { return 'MyPostController' }

  static get CONFIG () {
    return {
      url: '/features/mypost/:type',
      views: {
        main: {
          templateUrl: 'templates/features/mypost/my.post.html',
          controller: MyPostController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($ionicHistory, $state, $scope, $ionicPopover, $ionicScrollDelegate, apiService, AuthService, ngToast, $stateParams, $timeout) {
    super($scope)
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.apiService = apiService
    this.authService = AuthService
    this.ngToast = ngToast
    this.editMode = false

    this.type = $stateParams.type
    this.page = 1
    this.myposts = []

    this.paginationPopoverDelegate = PaginationPopoverDelegates({
      $scope,
      $ionicPopover,
      $timeout,
      $ionicScrollDelegate
    }, {
      getCurrentPage: () => this.page,
      getTotalPage: () => this.totalPageNum,
      getLocalMinPage: () => (this.myposts[0] && this.myposts[0].page) || 1,
      onJumpPage: ({ to }) => {
        this.reset()
        this.page = to
        this.loadMyPosts()
      }
    })
  }

  onViewLoaded () {
    const { authService, scope } = this
    authService.isLoggedIn().safeApply(scope, isLoggedIn => {
      if (isLoggedIn) {
        this.loadMyPosts()
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 我的帖子需要會員權限，請先登入！</i>`)
        this.onBack()
      }
    }).subscribe()
  }

  onViewDestroy () {
    this.paginationPopoverDelegate.remove()
  }

  title () {
    switch (this.type) {
      case 'threads': return '我的帖子'
      case 'favorites': return '我的收藏'
      case 'attention': return '我的關注'
      default:
        return ''
    }
  }

  loadMyPosts () {
    const { page } = this
    this.apiService.myPosts(page, this.type)
      .safeApply(this.scope, resp => {
        const { posts, totalPageNum, actionUrl, hiddenFormInputs } = resp
        this.actionUrl = actionUrl
        this.hiddenFormInputs = hiddenFormInputs
        this.totalPageNum = totalPageNum
        this.myposts = this.myposts.concat(posts.map(it => ({
          ...it,
          page
        })))

        this.scope.$broadcast('scroll.infiniteScrollComplete')
      }).subscribe()
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

  reset () {
    this.myposts = []
    this.end = false
  }

  loadMore () {
    if (this.hasMoreData()) {
      const nextPage = parseInt(this.page) + 1
      if (nextPage <= this.totalPageNum) {
        // update the page count
        this.page = parseInt(this.page) + 1

        this.loadMyPosts()
      } else {
        // set a flag for end
        this.end = true
      }
    }
  }

  hasMoreData () {
    return !this.end && !this.refreshing
  }

  deleteItem (id) {
    const { actionUrl, hiddenFormInputs } = this
    this.apiService.dynamicRequest({
      method: 'POST',
      url: actionUrl,
      data: {
        ...hiddenFormInputs,
        'delete[]': id
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
      .safeApply(this.scope, resp => {
        if (resp.status === 200) {
          this.ngToast.success(`<i class="ion-ios-checkmark"> 成功移除！</i>`)
          this.myposts = this.myposts.filter(it => it.post.id !== id)
        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 移除失敗！</i>`)
        }
      }).subscribe()
  }
}
