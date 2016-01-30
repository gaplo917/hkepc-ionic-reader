/**
 * Created by Gaplo917 on 29/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class NotificationController{

  constructor($scope, $http, authService,$state,$sce){

    this.http = $http
    this.scope = $scope
    this.sce = $sce
    this.notifications = []
    this.state = $state

    $scope.$on('$ionicView.enter', (e) => {

      if(authService.isLoggedIn()){

        setTimeout(()=> this.loadNotifications() ,400)

      } else {
        alert("請先登入！")
        $state.go("tab.account")
      }

    })
  }

  loadNotifications(){

    this.http
      .get(HKEPC.forum.notifications())
      .then((resp) => {
        const html = new GeneralHtml(cheerio.load(resp.data))

        let $ = html
            .removeIframe()
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
}