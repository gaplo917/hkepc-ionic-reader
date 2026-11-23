/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import { LoginTabUpdateRequest } from '../model/requests'
import * as Controllers from './index'

export class AccountController {
  static get STATE() {
    return 'tab.features-account'
  }

  static get NAME() {
    return 'AccountController'
  }

  static get CONFIG() {
    return {
      url: '/features/account',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/features/account/account.html',
          controller: AccountController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor($scope, $http, $state, LocalStorageService, AuthService, apiService, ngToast, $ionicHistory, $timeout) {
    this.http = $http
    this.scope = $scope
    this.state = $state
    this.authService = AuthService
    this.apiService = apiService
    this.ngToast = ngToast
    this.version = HKEPC.version
    this.ionicHistory = $ionicHistory
    this.$timeout = $timeout
    this.isLoggedIn = false
    this.isReady = false
    this.loginInProgress = false
    this.loginForm = {
      username: null,
      password: null,
      securityQuestionId: '0',
      securityQuestionAns: '',
    }

    $scope.$on('$ionicView.loaded', (e) => {
      this.authService
        .isLoggedIn()
        .safeApply($scope, (isLoggedIn) => {
          this.isLoggedIn = isLoggedIn
          this.isReady = true
        })
        .subscribe()

      this.authService
        .getUsername()
        .safeApply($scope, (username) => {
          if (username) {
            this.loginForm.username = username
          }
        })
        .subscribe()

      LocalStorageService.get('proxy')
        .safeApply($scope, (data) => {
          this.proxy = data || HKEPC.proxy
        })
        .subscribe()

      LocalStorageService.getObject('authority')
        .safeApply($scope, (data) => {
          this.loginForm = {
            ...this.loginForm,
            data,
          }
        })
        .subscribe()
    })
  }

  login() {
    const form = this.loginForm
    if (this.loginInProgress) return
    if (!form.username || !form.password) return
    if (this.isProxy() && !this.agreeProxy) return

    this.loginInProgress = true
    let captured = false
    this.apiService
      .loginForm()
      .safeApply(this.scope, (tokens) => {
        captured = true
        const authority = {
          ...this.loginForm,
          ...tokens,
        }
        this.authService.login(authority, (err, username) => {
          this.loginInProgress = false
          this.scope.$applyAsync()
          if (err) return

          this.authService.saveAuthority(authority)

          this.scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest(username))

          this.loginForm = {
            ...this.loginForm,
            password: null,
            securityQuestionId: '0',
            securityQuestionAns: '',
          }

          this.ionicHistory.clearCache()

          requestAnimationFrame(() => {
            this.$timeout(() => {
              this.onBack()
            })
          })
        })
      })
      .subscribe(
        () => {},
        () => this.failLoginForm(),
        () => {
          if (!captured) this.failLoginForm()
        }
      )
  }

  failLoginForm() {
    this.loginInProgress = false
    this.ngToast.danger('<i class="ion-alert-circled"> 無法取得登錄驗證，請再試一次</i>')
    this.scope.$applyAsync()
  }

  logout() {
    this.authService.logout()

    // send the login name to parent controller
    this.scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest(undefined, true))

    this.ionicHistory.clearCache()

    this.isLoggedIn = false
  }

  onBack() {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true,
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }

  isProxy() {
    return URLUtils.isProxy()
  }
}
