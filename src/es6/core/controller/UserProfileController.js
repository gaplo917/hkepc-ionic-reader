import * as Controllers from './index'
import { userFilterSchema } from '../schema'

export class UserProfileController {
  static get STATE () {
    return 'tab.user-profile'
  }

  static get NAME () {
    return 'UserProfileController'
  }

  static get CONFIG () {
    return {
      url: '/userProfile?author=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/user-profile.html',
          controller: UserProfileController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $stateParams, $state, $ionicHistory, ngToast, apiService, $compile, LocalStorageService) {
    this.state = $state
    this.scope = $scope
    this.ionicHistory = $ionicHistory
    this.ngToast = ngToast
    this.apiService = apiService
    this.compile = $compile
    this.localStorageService = LocalStorageService
    this.isInUserFilter = false

    const author = JSON.parse($stateParams.author || '{}')

    this.author = author

    $scope.$on('$ionicView.loaded', (e) => {
      this.apiService.userProfile(author.uid).safeApply($scope, data => {
        this.content = data.content
      }).subscribe()
    })

    $scope.$on('$ionicView.enter', (e) => {
      this.localStorageService.getObject('userFilter', userFilterSchema)
        .safeApply($scope, (userFilter) => {
          const { userIds } = userFilter
          this.isInUserFilter = userIds.indexOf(String(this.author.uid)) >= 0
        })
        .subscribe()
    })
  }

  sendPm (author) {
    this.state.go(Controllers.ChatDetailController.STATE, {
      id: author.uid
    })
  }

  addToFilterList () {
    this.state.go(Controllers.CMUsersController.STATE, {
      prefill: JSON.stringify({
        id: this.author.uid,
        reason: ''
      })
    })
  }

  removeFromFilterList () {
    this.localStorageService.getObject('userFilter', userFilterSchema)
      .safeApply(this.scope, (userFilter) => {
        const { uid: userId } = this.author
        const index = userFilter.userIds.indexOf(String(this.author.uid))

        if (index >= 0) {
          userFilter.userIds.splice(index, 1)
          try {
            delete userFilter.users[userId]
          } catch (e) {
            console.log('data corrupted. nothing can handle')
          }

          this.localStorageService.setObject('userFilter', userFilter)
        }

        this.isInUserFilter = false
      })
      .subscribe()
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.TopicListController.STATE)
    }
  }
}
