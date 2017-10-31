/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import * as Controllers from "./index"

const cheerio = require('cheerio')

export class NotificationController{
  static get STATE() { return 'tab.features-notifications'}
  static get NAME() { return 'NotificationController'}
  static get CONFIG() { return {
    url: '/features/notifications',
    cache: false,
    views: {
      'main': {
        templateUrl: 'templates/features/notification/notification.html',
        controller: NotificationController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, apiService, AuthService,$state,$sce,ngToast,$ionicHistory){

    this.apiService = apiService
    this.scope = $scope
    this.sce = $sce
    this.notifications = []
    this.state = $state
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory

    this.page = 1
    this.refreshing = false

    $scope.$on('$ionicView.loaded', (e) => {

      AuthService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
        if (isLoggedIn) {
          this.loadNotifications()
        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 帖子消息需要會員權限，請先登入！</i>`)
          $state.go(Controllers.AccountController.STATE)
        }
      }).subscribe()

    })
  }

  loadNotifications(){
    this.refreshing = true

    this.apiService.notifications(this.page)
      .safeApply(this.scope, (resp) => {
        const html = new HKEPCHtml(cheerio.load(resp.data))

        let $ = html
            .removeAds()
            .processEpcUrl(window.location.hash)
            .processExternalUrl()
            .processImgUrl(HKEPC.baseForumUrl)
            .getCheerio()

        const pageNumSource = $('.pages a, .pages strong')

        const pageNumArr = pageNumSource
            .map((i,elem) => $(elem).text())
            .get()
            .map(e => e.match(/\d/g)) // array of string with digit
            .filter(e => e != null) // filter null value
            .map(e => parseInt(e.join(''))) // join the array and parseInt

        this.totalPageNum = pageNumArr.length == 0
            ? 1
            : Math.max(...pageNumArr)

        const notifications = $('.feed li .f_quote, .feed li .f_reply, .feed li .f_thread').map((i, elem) => {
          return {
            isRead: $(elem).find('img').attr('alt') != 'NEW',
            content: this.sce.trustAsHtml($(elem).html())
          }
        }).get()

        console.log(notifications)
        this.notifications = this.notifications.concat(notifications)

        this.refreshing = false
        this.scope.$broadcast('scroll.infiniteScrollComplete')

      }).subscribe()
  }

  findMessage(postId,messageId){
    this.scope.$emit(FindMessageRequest.NAME,new FindMessageRequest(postId,messageId))
  }

  loadMore(cb){
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
        //update the page count
        this.page = parseInt(this.page) + 1

        this.loadNotifications(cb)
    }

  }

  hasMoreData(){
    return this.page < this.totalPageNum && !this.refreshing
  }

  doRefresh(){
    this.notifications = []
    this.page = 1
    this.loadNotifications()
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.FeatureRouteController.STATE)
    }
  }
}