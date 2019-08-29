import * as Controllers from './index'

export class FindMessageController {
  static get STATE () { return 'tab.find-message' }

  static get NAME () { return 'FindMessageController' }

  static get CONFIG () {
    return {
      url: '/findMessage?postId=&messageId=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/find-message.html',
          controller: FindMessageController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $state, $stateParams, $ionicHistory, apiService, $compile) {
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.scope = $scope
    this.compile = $compile

    const messageId = $stateParams.messageId
    const postId = $stateParams.postId

    $scope.$on('$ionicView.loaded', (e) => {
      apiService.findMessage({ postId, messageId })
        .safeApply(this.scope, ({ currentPage, message }) => {
          this.pageNumber = currentPage
          this.message = message
        })
        .subscribe()
    })
  }

  goToMessage () {
    this.state.go(Controllers.PostDetailController.STATE, {
      topicId: this.message.post.topicId,
      postId: this.message.post.id,
      page: this.pageNumber,
      delayRender: 0,
      focus: this.message.id
    })
  }

  getTimes (i) {
    return new Array(parseInt(i))
  }

  relativeMomentize (dateStr) {
    const momentDate = moment(dateStr, 'YYYY-M-D hh:mm')

    if (momentDate.diff(new Date(), 'days') >= -3) {
      return momentDate.fromNow()
    } else {
      return dateStr
    }
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
    }
  }
}
