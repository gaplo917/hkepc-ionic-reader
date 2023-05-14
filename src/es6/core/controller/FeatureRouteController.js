/**
 * Created by Gaplo917 on 29/1/2016.
 */
import {
  NotificationBadgeUpdateRequest,
  ChangeThemeRequest,
  ChangeFontSizeRequest,
  MHeadFixRequest,
  AndroidBottomFixRequest,
} from '../model/requests'
import swal from 'sweetalert2'
import { NativeUpdateNotificationRequest } from '../bridge/requests'

export class FeatureRouteController {
  static get STATE() {
    return 'tab.features'
  }

  static get NAME() {
    return 'FeatureRouteController'
  }

  static get CONFIG() {
    return {
      url: '/features',
      views: {
        main: {
          templateUrl: 'templates/features/features.route.html',
          controller: FeatureRouteController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor($scope, apiService, AuthService, $state, ngToast, LocalStorageService, observeOnScope, $rootScope) {
    this.apiService = apiService
    this.scope = $scope
    this.state = $state
    this.ngToast = ngToast
    this.localStorageService = LocalStorageService
    this.isLoggedIn = false
    this.signature = true

    observeOnScope($scope, 'vm.isAutoLoadImage')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        const loadImageMethod = newValue ? 'auto' : 'block'

        this.localStorageService.set('loadImageMethod', loadImageMethod)
      })

    observeOnScope($scope, 'vm.signature')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.localStorageService.set('signature', newValue ? 'true' : 'false')
      })

    observeOnScope($scope, 'vm.fontSize')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(ChangeFontSizeRequest.NAME, new ChangeFontSizeRequest(newValue))
      })

    observeOnScope($scope, 'vm.darkTheme')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(ChangeThemeRequest.NAME, new ChangeThemeRequest(newValue))
      })

    observeOnScope($scope, 'vm.mHeadFix')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(MHeadFixRequest.NAME, new MHeadFixRequest(newValue))
      })

    observeOnScope($scope, 'vm.androidBottomFix')
      .skip(1)
      .subscribe(({ oldValue, newValue }) => {
        this.scope.$emit(AndroidBottomFixRequest.NAME, new AndroidBottomFixRequest(newValue))
      })

    this.localStorageService
      .get('loadImageMethod')
      .safeApply($scope, (loadImageMethod) => {
        this.isAutoLoadImage = loadImageMethod !== 'block'
      })
      .subscribe()

    this.localStorageService
      .get('theme')
      .safeApply($scope, (data) => {
        this.darkTheme = data || 'default'
      })
      .subscribe()

    this.localStorageService
      .get('fontSize')
      .safeApply($scope, (data) => {
        this.fontSize = data || '100'
      })
      .subscribe()

    this.localStorageService
      .get('signature')
      .safeApply($scope, (data) => {
        if (data) {
          this.signature = String(data) === 'true'
        }
      })
      .subscribe()

    this.localStorageService
      .get('mHeadFix')
      .safeApply($scope, (data) => {
        if (data) {
          this.mHeadFix = String(data) === 'true'
        }
      })
      .subscribe()

    this.localStorageService
      .get('androidBottomFix')
      .safeApply($scope, (data) => {
        if (data) {
          this.androidBottomFix = String(data) === 'true'
        }
      })
      .subscribe()

    this.authService = AuthService

    $rootScope
      .$eventToObservable(NotificationBadgeUpdateRequest.NAME)
      .filter(([event, req]) => req instanceof NotificationBadgeUpdateRequest)
      .safeApply($scope, ([event, req]) => {
        this.notification = req.notification
      })
      .subscribe()

    $rootScope
      .$eventToObservable(NativeUpdateNotificationRequest.NAME)
      .filter(([event, req]) => req instanceof NativeUpdateNotificationRequest)
      .safeApply($scope, ([event, req]) => {
        this.notification = req.notification
      })
      .subscribe()

    $scope.$on('$ionicView.loaded', (e) => {
      this.localStorageService.getObject('notification').subscribe((data) => {
        this.notification = data
      })

      this.authService
        .isLoggedIn()
        .safeApply($scope, (isLoggedIn) => {
          this.isLoggedIn = isLoggedIn
          if (isLoggedIn) {
            this.registerOnChangeForumStyle()
          }
        })
        .subscribe()

      if (this.isFree()) {
        this.signature = true
      }
    })
  }

  registerOnChangeForumStyle() {
    // TODO: move to web-worker
    this.apiService
      .settings()
      .safeApply(this.scope, ({ actionUrl, forumStyle, forumStyles, hiddenFormInputs }) => {
        this.forumStyle = forumStyle
        this.actionUrl = actionUrl
        this.hiddenFormInputs = hiddenFormInputs
      })
      .subscribe()
  }

  onChangeForumStyle(newStyle) {
    const { actionUrl, hiddenFormInputs } = this
    const spinnerHtml = `
          <div>
              <div class="text-center">傳送到 HKEPC 伺服器中</div>
          </div>
        `

    swal({
      animation: false,
      html: spinnerHtml,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
    })

    swal.showLoading()

    // Post to the server
    this.apiService
      .dynamicRequest({
        method: 'POST',
        url: actionUrl,
        data: {
          styleidnew: newStyle,
          ...hiddenFormInputs,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .safeApply(this.scope, (resp) => {
        swal({
          animation: false,
          title: '成功更改',
          text: '',
          type: 'success',
        })
      })
      .subscribe()
  }

  doRefresh() {
    this.registerOnChangeForumStyle()
    this.apiService
      .checkPM()
      .flatMap(() => this.apiService.memberCenter())
      .subscribe()
  }

  isFree() {
    const version = this.scope.nativeVersion
    return version && version[version.length - 1] === 'F'
  }
}
