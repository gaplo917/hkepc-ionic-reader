/**
 * Created by Gaplo917 on 23/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import {FindMessageRequest} from '../model/FindMessageRequest'
import {NotificationBadgeUpdateRequest} from '../model/NotificationBadgeUpdateRequest'
import {CommonInfoExtractRequest} from '../model/CommonInfoExtractRequest'
import {LoginTabUpdateRequest} from '../model/LoginTabUpdateRequest'
import {PushHistoryRequest} from '../model/PushHistoryRequest'
import {ChangeThemeRequest} from '../model/ChangeThemeRequest'
import {ChangeFontSizeRequest} from '../model/ChangeFontSizeRequest'
import {HideUsernameRequest} from '../model/HideUsernameRequest'
import {NativeChangeFontSizeRequest} from '../bridge/NativeChangeFontSizeRequest'
import {NativeChangeThemeRequest} from '../bridge/NativeChangeThemeRequest'

import * as Controllers from './index'

export class TabController{
  static get STATE() { return 'tab'}
  static get NAME() { return 'TabController'}
  static get CONFIG() { return {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'TabController',
    controllerAs: 'vm'

  }}

  constructor($scope,$state,$rootScope,$ionicModal,MessageResolver,$stateParams,AuthService,ngToast,LocalStorageService,HistoryService,$ionicHistory,rx, apiService) {
    this.scope = $scope
    this.scope.messageModal = $scope.$new()
    this.scope.eulaModal = $scope.$new()

    this.rootScope = $rootScope
    this.localStorageService = LocalStorageService
    this.rx = rx
    this.state = $state
    this.authService = AuthService
    this.historyService = HistoryService
    this.ionicHistory = $ionicHistory
    this.apiService = apiService

    this.isLoggedIn = false

    // cache the value
    rx.Observable.combineLatest(AuthService.isLoggedIn(), AuthService.getUsername(), (isLoggedIn, username) => {
      this.isLoggedIn = isLoggedIn

      this.scope.$emit(LoginTabUpdateRequest.NAME,new LoginTabUpdateRequest(username))
    }).subscribe()

    this.localStorageService.get('theme').safeApply(this.scope, data => {
      this.darkTheme = data == 'dark'
    }).subscribe()

    this.localStorageService.get('fontSize').safeApply(this.scope, data => {
      this.fontSize = data || "100"
    }).subscribe()

    this.localStorageService.get('hideUsername').safeApply(this.scope, data => {
      this.hideUsername = String(data) == "true"
    }).subscribe()

    // Try the credential on start app
    this.rx.Observable
        .concat(this.apiService.memberCenter(),this.apiService.checkPM())
        .delay(10000)
        .subscribe()

    // schedule to check PM
    this.rx.Observable.interval(60 * 1000)
      .do(() => console.debug(`[${TabController.NAME}] Background getting PM`))
      .flatMap(() => apiService.checkPM())
      .subscribe()

    $scope.$on('$ionicView.loaded', (e) => {
      // FIXME: ugly hack for dark theme, all style use ios style
      this.removeAndroidStyleCssClass()
    })

    $rootScope.$eventToObservable(CommonInfoExtractRequest.NAME)
      .filter(([event, req]) => req instanceof CommonInfoExtractRequest)
      .debounce(500)
      .subscribe( ([event, req]) =>{
        console.debug(`[${TabController.NAME}] Received CommonInfoExtractRequest`)

        // select the current login user
        const username = req.username

        const pmNotification = req.pmNotification

        const postNotification = req.postNotification

        this.localStorageService.set('formhash',req.formhash)

        // send the login name to parent controller
        this.scope.$emit(LoginTabUpdateRequest.NAME,new LoginTabUpdateRequest(username))

        // send the notification badge update in rootscope
        this.rootScope.$emit(NotificationBadgeUpdateRequest.NAME,new NotificationBadgeUpdateRequest(pmNotification,postNotification))

    })

    $rootScope.$eventToObservable(NotificationBadgeUpdateRequest.NAME)
      .filter(([event, req]) => req instanceof NotificationBadgeUpdateRequest)
      .debounce(500)
      .subscribe( ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received NotificationBadgeUpdateRequest`)

        console.log(req.notification)
        const notification = req.notification

        this.notification = notification

        this.localStorageService.setObject('notification',notification)
      })

    $scope.$eventToObservable(LoginTabUpdateRequest.NAME)
      .filter(([event,req]) => req instanceof LoginTabUpdateRequest)
      .safeApply($scope, ([event,req]) => {
        console.debug(`[${TabController.NAME}] Received LoginTabUpdateRequest`,req)

        if(req.username != undefined && req.username != "") {

          this.isLoggedIn = true
          this.login = String(this.hideUsername) == 'true' ? "IR 用家" : req.username

          console.log("changed login name to ", this.login)

        }
        else {
          this.login = undefined

          if(this.isLoggedIn){
            ngToast.danger(`<i class="ion-alert-circled"> 你的登入認証己過期，請重新登入！</i>`)
            AuthService.logout()

            this.isLoggedIn = false
          }

        }

    }).subscribe()

    $scope.$eventToObservable(FindMessageRequest.NAME)
      .filter(([event,req]) => req instanceof FindMessageRequest)
      .safeApply(this.scope, ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received FindMessageRequest`)

        this.messageModal.show()
        // reset the message first
        this.scope.messageModal.message = {}

    })
      .flatMap(([event, req]) => MessageResolver.resolve(HKEPC.forum.findMessage(req.postId,req.messageId)))
      .safeApply(this.scope, (data) => {
        this.scope.messageModal.message = data.message

        this.scope.messageModal.goToMessage = (msg) => {

          this.messageModal.hide()

          const targetState = window.location.hash.indexOf(Controllers.FeatureRouteController.CONFIG.url) > 0
            ? Controllers.ViewPostController.STATE
            : Controllers.PostDetailController.STATE

          const history = this.ionicHistory.viewHistory()
          if(history.currentView && (history.currentView.stateName == Controllers.ViewPostController.STATE || history.currentView.stateName == Controllers.PostDetailController.STATE )){
            this.ionicHistory.clearCache([history.currentView.stateId])
          }

          this.state.go(targetState,{
            topicId: msg.post.topicId,
            postId: msg.post.id,
            page: msg.post.page,
            delayRender: 0,
            focus: msg.id
          })
        }

        this.scope.messageModal.hide = () => this.messageModal.hide()

      })
      .subscribe()

    $scope.$eventToObservable(PushHistoryRequest.NAME)
      .filter(([event,req]) => req instanceof PushHistoryRequest)
      .subscribe( ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received PushHistoryRequest`)

        this.historyService.add(req.historyObj)

      })

    $scope.$eventToObservable(HideUsernameRequest.NAME)
      .filter(([event,req]) => req instanceof HideUsernameRequest)
      .flatMap(([event,req]) => {

        return this.authService.getUsername().map(username => {
          return {
            req: req,
            username: username
          }
        })
      })
      .safeApply($scope, ({req, username}) => {
        console.debug(`[${TabController.NAME}] Received HideUsernameRequest`, req)

        this.localStorageService.set('hideUsername',req.hidden)

        this.hideUsername = String(req.hidden) == "true"

        if (this.hideUsername) {
          // hide user name
          $scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest("IR 用家"))
        }
        else {
          // show user name
          $scope.$emit(LoginTabUpdateRequest.NAME, new LoginTabUpdateRequest(username))
        }
      }).subscribe()

    $rootScope.$eventToObservable(NativeChangeThemeRequest.NAME)
      .filter(([event,req]) => req instanceof NativeChangeThemeRequest)
      .safeApply(this.scope, ([event, req]) => {
        this.darkTheme = req.theme == 'dark'
      }).subscribe()

    $rootScope.$eventToObservable(NativeChangeFontSizeRequest.NAME)
      .filter(([event,req]) => req instanceof NativeChangeFontSizeRequest)
      .safeApply(this.scope, ([event, req]) => {
        this.fontSize = req.size
        this.ionicHistory.clearCache()
      }).subscribe()

    $scope.$eventToObservable(ChangeThemeRequest.NAME)
      .filter(([event,req]) => req instanceof ChangeThemeRequest)
      .subscribe( ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received ChangeThemeRequest`)
        this.darkTheme = req.theme == 'dark'
        this.localStorageService.set('theme',req.theme)

        if (window.StatusBar) {
          if(this.darkTheme){
            StatusBar.styleLightContent()
          } else {
            StatusBar.styleDefault()
          }
        }
      })

    $scope.$eventToObservable(ChangeFontSizeRequest.NAME)
      .filter(([event,req]) => req instanceof ChangeFontSizeRequest)
      .subscribe( ([event, req]) => {
        console.debug(`[${TabController.NAME}] Received ChangeFontSizeRequest`)
        this.fontSize = req.size
        this.localStorageService.set('fontSize',req.size)
        this.ionicHistory.clearCache();
      })

    $ionicModal.fromTemplateUrl('templates/modals/find-message.html', {
      scope: $scope.messageModal
    }).then((modal) => {
      this.messageModal = modal
    })

    this.localStorageService.get('agreeEULA',0).subscribe(data => {
      if(!data && (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) ){
        $ionicModal.fromTemplateUrl('templates/modals/EULA.html', {
          scope: $scope.eulaModal,
          backdropClickToClose: false
        }).then((modal) => {
          this.eulaModal = modal
          this.eulaModal.show()

          this.scope.eulaModal.disagree = () => {
            alert("請自行離開！")
          }

          this.scope.eulaModal.agree = () => {
            this.localStorageService.set('agreeEULA',1)
            this.eulaModal.hide()
          }
        })
      }
    })

  }

  removeAndroidStyleCssClass(){
    const body = angular.element(document.querySelector('body'))[0]

    body.className = body.className.replace('platform-android','')
  }

  isiOSNativeApp(){
    return window.WebViewJavascriptBridge ? true : false
  }

}