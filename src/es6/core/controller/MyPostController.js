/**
 * Created by Gaplo917 on 6/3/2016.
 */
import * as Controllers from './index'

export class MyPostController {
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

  constructor ($ionicHistory, $state, $scope, $ionicPopover, apiService, AuthService, ngToast, $stateParams) {
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.apiService = apiService
    this.ngToast = ngToast

    this.type = $stateParams.type
    this.page = 1
    this.myposts = []

    $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html', {
      scope: $scope
    }).then((popover) => {
      this.pageSliderPopover = popover
    })

    $scope.$on('$destroy', () => {
      this.pageSliderPopover.remove()
    })

    $scope.$on('$ionicView.loaded', (e) => {
      AuthService.isLoggedIn().safeApply($scope, isLoggedIn => {
        if (isLoggedIn) {
          this.loadMyPosts()
        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 我的帖子需要會員權限，請先登入！</i>`)
        }
      }).subscribe()
    })
  }

  loadMyPosts () {
    this.apiService.myPosts(this.page, this.type)
      .safeApply(this.scope, resp => {
        const { posts, totalPageNum } = resp
        this.totalPageNum = totalPageNum
        this.myposts = this.myposts.concat(posts)

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

  openPageSliderPopover ($event) {
    this.inputPage = this.page
    this.pageSliderPopover.show($event)
  }

  doJumpPage () {
    this.pageSliderPopover.hide()
    this.reset()
    this.page = this.inputPage
    this.loadMyPosts()
  }

  parseInt (i) {
    return parseInt(i)
  }

  getTimes (i) {
    return new Array(parseInt(i))
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
}
