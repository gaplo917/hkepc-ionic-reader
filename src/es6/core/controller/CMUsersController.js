import * as Controllers from './index'
import { userFilterSchema } from '../schema'
import swal from 'sweetalert2'

export class CMUsersController {
  static get STATE () { return 'tab.features-contentmanage-users' }

  static get NAME () { return 'CMUsersController' }

  static get CONFIG () {
    return {
      // topicType: 'latestPostTopicFilters' | 'latestReplyTopicFilters'
      url: '/features/contentmanage/users',
      views: {
        main: {
          templateUrl: 'templates/features/contentmanage/users.html',
          controller: CMUsersController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $http, $state, $stateParams, $ionicHistory, ngToast, rx, apiService, LocalStorageService, AuthService) {
    this.scope = $scope
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.ngToast = ngToast
    this.rx = rx
    this.apiService = apiService
    this.LocalStorageService = LocalStorageService
    this.authService = AuthService
    this.items = []
    this.isReady = false
    this.userIdInput = ''
    this.remarkInput = ''
    this.editMode = false
    this.userFilter = userFilterSchema

    $scope.$on('$ionicView.loaded', (e) => {
      LocalStorageService.getObject('userFilter', userFilterSchema)
        .safeApply($scope, (userFilter) => {
          const { users, userIds } = userFilter
          this.items = userIds.map(it => users[it])
          this.userFilter = userFilter
          this.isReady = true
        })
        .subscribe()
    })
  }

  showLoading () {
    const spinnerHtml = `
          <div>
              <div class="text-center">驗証用戶資料中</div>
          </div>
        `

    swal({
      animation: false,
      html: spinnerHtml,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false
    })

    swal.showLoading()
  }

  closeLoading () {
    swal.close()
  }

  addUser (event) {
    const { userIds, users } = this.userFilter
    if (!event || (event && event.which === 13)) {
      const { userIdInput, remarkInput } = this
      if (userIds.indexOf(userIdInput) >= 0) {
        const { uid, name } = users[userIdInput]
        this.ngToast.danger(`<i class="ion-alert-circled"> 用戶「${name} (UID: ${uid})」已經存在</i>`)
        return
      }
      this.showLoading()

      this.apiService.userProfile(userIdInput)
        .safeApply(this.scope, resp => {
          const { uid, name, rank, image } = resp
          if (!name) {
            this.ngToast.danger(`<i class="ion-alert-circled"> 用戶編號 ${uid} 不存在</i>`)
            return
          }
          // mutate
          this.userFilter.users[uid] = { uid, name, rank, image, remark: remarkInput }

          // use the mutated object
          this.userFilter.userIds = [uid, ...this.userFilter.userIds]
          this.LocalStorageService.setObject('userFilter', this.userFilter)

          const { users, userIds } = this.userFilter
          this.items = userIds.map(it => users[it])
          this.userIdInput = ''
          this.remarkInput = ''
        },
        () => {},
        () => this.closeLoading()
        ).subscribe()
    }
  }

  deleteUser (index) {
    const [item] = this.items.splice(index, 1)
    const { uid } = item
    this.userFilter.userIds.splice(index, 1)
    try {
      delete this.userFilter.users[uid]
    } catch (e) {
      console.log('data corrupted. nothing can handle')
    }
    this.LocalStorageService.setObject('userFilter', this.userFilter)
  }

  getTimes (i) {
    return new Array(parseInt(i))
  }

  onUserProfilePic (author) {
    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      if (isLoggedIn) {
        this.state.go(Controllers.UserProfileController.STATE, {
          author: JSON.stringify(author)
        })
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 查看會員需要會員權根，請先登入！</i>`)
      }
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
      this.state.go(Controllers.ContentManageController.STATE)
    }
  }
}
