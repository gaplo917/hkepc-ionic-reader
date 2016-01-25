/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class ChatController{

  constructor($scope, $http){

    this.http = $http
    this.scope = $scope
    this.chats = []

    $scope.$on('$ionicView.enter', (e) => {
      setTimeout(()=> {
        this.loadChats()
      },400)
    })
  }

  loadChats(){
    this.http
        .get(HKEPC.forum.pmList(1))
        .then((resp) => {

          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseUrl)
              .getCheerio()

          const chats = $('.pm_list li').map((i, elem) => {
            let chatSource = cheerio.load($(elem).html())


            const avatarUrl = chatSource('.avatar img').attr('src')
            const summary = chatSource('.summary').text()
            const username = chatSource('.cite cite a').text()

            chatSource('cite').remove()
            const date = chatSource('.cite').text()

            const id = URLUtils.getQueryVariable(avatarUrl,'uid')
            return {
              id: id,
              avatarUrl:avatarUrl,
              summary:summary,
              username: username,
              date : date
            }

          }).get()


          this.chats = chats

          this.scope.apply()


        },(err) => {
          console.log(err)
        })
  }
}