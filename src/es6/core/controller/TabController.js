/**
 * Created by Gaplo917 on 23/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import {FindMessageRequest} from "../model/FindMessageRequest"
import {NotificationBadgeUpdateRequest} from "../model/NotificationBadgeUpdateRequest"
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import {LoginTabUpdateRequest} from "../model/LoginTabUpdateRequest"
import {PushHistoryRequest} from "../model/PushHistoryRequest"

const cheerio = require('cheerio')
const Rx = require('rx')

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

  constructor($scope,$http,$rootScope,$ionicModal,MessageResolver,$stateParams,AuthService,ngToast,LocalStorageService,HistoryService) {
    this.scope = $scope
    this.scope.messageModal = $scope.$new()
    this.scope.eulaModal = $scope.$new()

    this.rootScope = $rootScope
    this.localStorageService = LocalStorageService
    this.http = $http
    this.authService = AuthService
    this.historyService = HistoryService
    // cache the value
    this._isLoggedIn = AuthService.isLoggedIn()

    const getMemberCenterPromise = Rx.Observable.fromPromise(this.http.get(HKEPC.forum.memberCenter()))
    const checkPMPromise = Rx.Observable.fromPromise(this.http.get(HKEPC.forum.checkPM()))

    // Try the credential on start app
    Rx.Observable
        .concat(checkPMPromise,getMemberCenterPromise)
        .map(resp => cheerio.load(resp.data))
        .filter($ => $('body').html() != null)
        .subscribe(
            $ => this.scope.$emit(CommonInfoExtractRequest.NAME, new CommonInfoExtractRequest($))
        )

    // schedule to check PM
    Rx.Scheduler.default.schedulePeriodic(
        HKEPC.forum.checkPM(),
        1000 * 60 , /* 1 minutes */
        (url) =>  {
          this.http.get(url)
          return url
        }
    )

    $scope.$on(CommonInfoExtractRequest.NAME, (event,req) =>{
      if(req instanceof CommonInfoExtractRequest){
        console.debug(`[${TabController.NAME}] Received CommonInfoExtractRequest`)

        const $ = req.cheerio

        // select the current login user
        const currentUsername = $('#umenu > cite').text()

        const pmNotification = $('#prompt_pm').text().match(/\d/g)[0]

        const postNotification = $('#prompt_threads').text().match(/\d/g)[0]

        // send the login name to parent controller
        this.scope.$emit(LoginTabUpdateRequest.NAME,new LoginTabUpdateRequest(currentUsername))

        // send the notification badge update in rootscope
        this.rootScope.$emit(NotificationBadgeUpdateRequest.NAME,new NotificationBadgeUpdateRequest(pmNotification,postNotification))
        this.scope.$emit(NotificationBadgeUpdateRequest.NAME,new NotificationBadgeUpdateRequest(pmNotification,postNotification))

      }
    })

    $scope.$on(NotificationBadgeUpdateRequest.NAME,(event,req) => {
      if(req instanceof NotificationBadgeUpdateRequest){
        console.debug(`[${TabController.NAME}] Received NotificationBadgeUpdateRequest`)

        console.log(req.notification)
        const notification = req.notification

        this.notification = notification

        this.localStorageService.setObject('notification',notification)
      }
    })

    $scope.$on(LoginTabUpdateRequest.NAME, (event,req) =>{
      if(req instanceof LoginTabUpdateRequest){
        console.debug(`[${TabController.NAME}] Received LoginTabUpdateRequest`)

        this.login = req.username
        if(this.login) {
          this._isLoggedIn = true
        } else {
          this._isLoggedIn = false

          this.login = undefined

          if (AuthService.isLoggedIn()){
            ngToast.danger(`<i class="ion-alert-circled"> 你的登入認証己過期，請重新登入！</i>`)
            AuthService.logout()
          }
        }
      }
    })

    $scope.$on(FindMessageRequest.NAME, (event,arg) =>{
      if(arg instanceof FindMessageRequest){
        console.debug(`[${TabController.NAME}] Received FindMessageRequest`)

        this.messageModal.show()
        // reset the message first
        this.scope.messageModal.message = {}

        MessageResolver.resolve(HKEPC.forum.findMessage(arg.postId,arg.messageId))
            .then((data) => {

              this.scope.messageModal.message = data.message
              this.scope.messageModal.hide = () => this.messageModal.hide()

            })
      }

    })

    $scope.$on(PushHistoryRequest.NAME, (event,arg) =>{
      if(arg instanceof PushHistoryRequest){
        console.debug(`[${TabController.NAME}] Received PushHistoryRequest`)

        this.historyService.add(arg.historyObj)
      }

    })

    $ionicModal.fromTemplateUrl('templates/modals/find-message.html', {
      scope: $scope.messageModal
    }).then((modal) => {
      this.messageModal = modal
    })

    if(!this.localStorageService.get('agreeEULA',0)){

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

  }

  isLoggedIn(){
    return this._isLoggedIn
  }

}