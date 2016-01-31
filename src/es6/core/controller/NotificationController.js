/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/find-message-request"

var cheerio = require('cheerio')
var async = require('async');

export class NotificationController{

  constructor($scope, $http, authService,$state,$sce,ngToast){

    this.http = $http
    this.scope = $scope
    this.sce = $sce
    this.notifications = []
    this.state = $state
    this.ngToast = ngToast

    $scope.$on('$ionicView.enter', (e) => {

      if(authService.isLoggedIn()){

        setTimeout(()=> this.loadNotifications() ,400)

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> Notification 需要會員權限，請先登入！</i>`)
        $state.go("tab.account")
      }

    })
  }

  loadNotifications(){

    this.http
      .get(HKEPC.forum.notifications())
      .then((resp) => {
        const html = new HKEPCHtml(cheerio.load(resp.data))

        let $ = html
            .removeIframe()
            .processEpcUrl()
            .processExternalUrl()
            .processImgUrl(HKEPC.baseUrl)
            .getCheerio()

        const notifications = $('.feed li .f_quote').map((i, elem) => {
          return this.sce.trustAsHtml($(elem).html())
        }).get()

        this.notifications = notifications

      },(err) => {
        console.log(err)
      })
  }

  findMessage(postId,messageId){
    this.scope.$emit('find',new FindMessageRequest(postId,messageId))
  }
}