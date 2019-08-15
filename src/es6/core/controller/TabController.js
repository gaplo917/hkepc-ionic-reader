/**
 * Created by Gaplo917 on 23/1/2016.
 */
import {
  ChangeFontSizeRequest,
  ChangeThemeRequest,
  CommonInfoExtractRequest,
  FindMessageRequest,
  LoginTabUpdateRequest,
  MHeadFixRequest,
  NotificationBadgeUpdateRequest,
  PushHistoryRequest
} from '../model/requests'

import { NativeChangeFontSizeRequest, NativeChangeThemeRequest, NativeUpdateMHeadFixRequest } from '../bridge/requests'

import { isLegacyAndroid } from '../bridge/index'

import * as Controllers from './index'

export class TabController {
  static get STATE () { return 'tab' }

  static get NAME () { return 'TabController' }

  static get CONFIG () {
    return {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      controller: 'TabController',
      controllerAs: 'vm'

    }
  }

  constructor ($scope, $state, $rootScope, $ionicModal, $stateParams, AuthService, ngToast, LocalStorageService, HistoryService, $ionicHistory, rx, apiService, observeOnScope, $ionicSideMenuDelegate, $timeout) {
    console.debug(`[${TabController.NAME}] init`)

    this.scope = $scope
    this.rootScope = $rootScope
    this.localStorageService = LocalStorageService
    this.rx = rx
    this.state = $state
    this.authService = AuthService
    this.historyService = HistoryService
    this.ionicHistory = $ionicHistory
    this.apiService = apiService
    this.darkTheme = null
    this.isLoggedIn = false

    observeOnScope($scope, 'vm.fontSize').skip(1).subscribe(({ oldValue, newValue }) => {
      const width = this.fontSize <= 100 ? 'device-width' : window.innerWidth * 100 / this.fontSize
      const viewport = document.querySelector('meta[name=viewport]')
      viewport.setAttribute('content', `initial-scale=${this.fontSize / 100}, maximum-scale=${this.fontSize / 100}, user-scalable=no, width=${width}`)
    })

    observeOnScope($scope, 'vm.darkTheme').subscribe(({ oldValue, newValue }) => {
      if (isLegacyAndroid()) {
        $rootScope.darkTheme(newValue)
      }
    })

    observeOnScope($scope, 'vm.notification').subscribe(({ oldValue, newValue }) => {
      if (isLegacyAndroid()) {
        $rootScope.notification(JSON.stringify(newValue))
      }
    })

    observeOnScope($scope, 'vm.login').subscribe(({ oldValue, newValue }) => {
      if (isLegacyAndroid()) {
        $rootScope.username(newValue)
      }
    })

    // cache the value
    rx.Observable.combineLatest(AuthService.isLoggedIn(), AuthService.getUsername(), (isLoggedIn, username) => {
      this.isLoggedIn = isLoggedIn
    }).subscribe()

    this.localStorageService.get('theme').safeApply(this.scope, data => {
      this.darkTheme = data
    }).subscribe()

    this.localStorageService.get('fontSize').safeApply(this.scope, data => {
      this.fontSize = data || '100'
    }).subscribe()

    this.localStorageService.get('mHeadFix').safeApply($scope, data => {
      if (data) {
        this.mHeadFix = String(data) === 'true'
      }
    }).subscribe()

    $scope.$on('$ionicView.loaded', (e) => {
      // FIXME: ugly hack for dark theme, all style use ios style
      this.removeAndroidStyleCssClass()

      $timeout(() => {
        // set after render
        $rootScope.isRendered = true
      })
    })

    $rootScope.$eventToObservable(CommonInfoExtractRequest.NAME)
      .filter(([event, req]) => req instanceof CommonInfoExtractRequest)
      .debounce(100)
      .subscribe(([event, req]) => {
        console.debug(`[${TabController.NAME}] Received CommonInfoExtractRequest`)

        // select the current login user
        const username = req.username

        const pmNotification = req.pmNotification

        const postNotification = req.postNotification

        this.localStorageService.set('formhash', req.formhash)

        // send the login name to parent controller
        this.scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest(username))

        // send the notification badge update in rootscope
        this.rootScope.$emit(NotificationBadgeUpdateRequest.NAME, new NotificationBadgeUpdateRequest(pmNotification, postNotification))
      })

    $rootScope.$eventToObservable(NotificationBadgeUpdateRequest.NAME)
      .filter(([event, req]) => req instanceof NotificationBadgeUpdateRequest)
      .subscribe(([event, req]) => {
        console.debug(`[${TabController.NAME}] Received NotificationBadgeUpdateRequest`)

        console.log(req.notification)
        const notification = req.notification

        this.notification = notification

        this.localStorageService.setObject('notification', notification)
      })

    $scope.$eventToObservable(LoginTabUpdateRequest.NAME)
      .filter(([event, req]) => req instanceof LoginTabUpdateRequest)
      .safeApply($scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received LoginTabUpdateRequest`, req)

        if (req.username !== undefined && req.username !== '') {
          this.isLoggedIn = true

          this.login = req.username
        } else {
          this.login = undefined

          if (this.isLoggedIn && !req.isFromLogout) {
            ngToast.danger(`<i class="ion-alert-circled"> 你的登入認証己過期，請重新登入！</i>`)
            AuthService.logout()

            this.isLoggedIn = false
          }
        }
      }).subscribe()

    $scope.$eventToObservable(FindMessageRequest.NAME)
      .filter(([event, req]) => req instanceof FindMessageRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received FindMessageRequest`)

        this.state.go(Controllers.FindMessageController.STATE, {
          postId: req.postId,
          messageId: req.messageId
        })
      })
      .subscribe()

    $scope.$eventToObservable(PushHistoryRequest.NAME)
      .filter(([event, req]) => req instanceof PushHistoryRequest)
      .subscribe(([event, req]) => {
        console.debug(`[${TabController.NAME}] Received PushHistoryRequest`)

        this.historyService.add(req.historyObj)
      })

    $rootScope.$eventToObservable(NativeChangeThemeRequest.NAME)
      .filter(([event, req]) => req instanceof NativeChangeThemeRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received NativeChangeThemeRequest`)

        this.darkTheme = req.theme
      }).subscribe()

    $rootScope.$eventToObservable(NativeChangeFontSizeRequest.NAME)
      .filter(([event, req]) => req instanceof NativeChangeFontSizeRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received NativeChangeFontSizeRequest`)

        this.fontSize = req.size
        this.ionicHistory.clearCache()
      }).subscribe()

    $rootScope.$eventToObservable(NativeUpdateMHeadFixRequest.NAME)
      .filter(([event, req]) => req instanceof NativeUpdateMHeadFixRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received NativeUpdateMHeadFixRequest`)
        this.mHeadFix = String(req.isMHead) === 'true'
      }).subscribe()

    $scope.$eventToObservable(ChangeThemeRequest.NAME)

      .filter(([event, req]) => req instanceof ChangeThemeRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received ChangeThemeRequest`)
        this.darkTheme = req.theme
        this.localStorageService.set('theme', req.theme)
      }).subscribe()

    $scope.$eventToObservable(ChangeFontSizeRequest.NAME)
      .filter(([event, req]) => req instanceof ChangeFontSizeRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received ChangeFontSizeRequest`)
        this.fontSize = req.size
        this.localStorageService.set('fontSize', req.size)
        this.ionicHistory.clearCache()
      }).subscribe()

    $scope.$eventToObservable(MHeadFixRequest.NAME)
      .filter(([event, req]) => req instanceof MHeadFixRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received MHeadFixRequest`, req)
        this.mHeadFix = String(req.mHeadFix) === 'true'
        this.localStorageService.set('mHeadFix', req.mHeadFix ? 'true' : 'false')
      }).subscribe()
  }

  removeAndroidStyleCssClass () {
    const body = angular.element(document.querySelector('body'))[0]

    body.className = body.className.replace('platform-android', '')
  }
}
