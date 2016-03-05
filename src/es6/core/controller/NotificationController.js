/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/find-message-request"

const cheerio = require('cheerio')
const async = require('async')

export class NotificationController{
  static get STATE() { return 'tab.notifications'}
  static get NAME() { return 'NotificationController'}
  static get CONFIG() { return {
    url: '/notifications',
    views: {
      'tab-notifications': {
        templateUrl: 'templates/tab-notifications.html',
        controller: NotificationController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, $http, AuthService,$state,$sce,ngToast){

    this.http = $http
    this.scope = $scope
    this.sce = $sce
    this.notifications = []
    this.state = $state
    this.ngToast = ngToast
    this.page = 1
    this.refreshing = false

    $scope.$on('$ionicView.loaded', (e) => {

      if(AuthService.isLoggedIn()){
        this.loadNotifications()
      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> Notification 需要會員權限，請先登入！</i>`)
        $state.go("tab.account")
      }

    })
  }

  loadNotifications(){
    this.refreshing = true

    this.http
      .get(HKEPC.forum.notifications(this.page))
      .then((resp) => {
        const html = new HKEPCHtml(cheerio.load(resp.data))

        let $ = html
            .removeIframe()
            .processEpcUrl()
            .processExternalUrl()
            .processImgUrl(HKEPC.baseUrl)
            .getCheerio()

        // select the current login user
        const currentUsername = $('#umenu > cite').text()

        // send the login name to parent controller
        this.scope.$emit("accountTabUpdate",currentUsername)

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

        const notifications = $('.feed li .f_quote, .feed li .f_reply').map((i, elem) => {
          return this.sce.trustAsHtml($(elem).html())
        }).get()

        this.notifications = this.notifications.concat(notifications)

        this.refreshing = false
        this.scope.$broadcast('scroll.infiniteScrollComplete')

      },(err) => {
        console.log(err)
      })
  }

  findMessage(postId,messageId){
    this.scope.$emit('find',new FindMessageRequest(postId,messageId))
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
}