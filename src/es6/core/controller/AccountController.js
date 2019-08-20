/**
 * Created by Gaplo917 on 27/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import { LoginTabUpdateRequest } from '../model/requests'
import * as Controllers from './index'

export class AccountController {
  static get STATE () { return 'tab.features-account' }

  static get NAME () { return 'AccountController' }

  static get CONFIG () {
    return {
      url: '/features/account',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/features/account/account.html',
          controller: AccountController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $http, $state, LocalStorageService, AuthService, $ionicHistory, $timeout) {
    this.http = $http
    this.scope = $scope
    this.state = $state
    this.authService = AuthService
    this.version = HKEPC.version
    this.ionicHistory = $ionicHistory
    this.$timeout = $timeout
    this.isLoggedIn = false
    this.isReady = false
    this.loginForm = {
      username: null,
      password: null,
      securityQuestionId: '0',
      securityQuestionAns: ''
    }

    $scope.$on('$ionicView.loaded', (e) => {
      this.authService.isLoggedIn().safeApply($scope, isLoggedIn => {
        this.isLoggedIn = isLoggedIn
        this.isReady = true
      }).subscribe()

      this.authService.getUsername().safeApply($scope, username => {
        if (username) {
          this.loginForm.username = username
        }
      }).subscribe()

      LocalStorageService.get('proxy').safeApply($scope, data => {
        this.proxy = data || HKEPC.proxy
      }).subscribe()

      LocalStorageService.getObject('authority').safeApply($scope, data => {
        this.loginForm = {
          ...this.loginForm,
          data
        }
      }).subscribe()
    })
  }

  login (username, password) {
    const authority = this.loginForm

    this.authService.login(authority, (err, username) => {
      if (err !== null) {
        this.authService.saveAuthority(authority)
      }

      this.scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest(username))

      // unset the password field
      this.loginForm = {
        ...this.loginForm,
        password: null,
        securityQuestionId: '0',
        securityQuestionAns: ''
      }

      this.ionicHistory.clearCache()

      requestAnimationFrame(() => {
        this.$timeout(() => {
          this.onBack()
        })
      })
    })
  }

  logout () {
    this.authService.logout()

    // send the login name to parent controller
    this.scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest(undefined, true))

    this.ionicHistory.clearCache()

    this.isLoggedIn = false
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }

  isProxy () {
    return URLUtils.isProxy()
  }
}
