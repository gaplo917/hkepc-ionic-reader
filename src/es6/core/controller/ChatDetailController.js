/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
const cheerio = require('cheerio')
const async = require('async')

export class ChatDetailController{

  constructor($scope, $http, $sce, $stateParams,$ionicScrollDelegate,ngToast){
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //

    this.scope = $scope
    this.http = $http
    this.sce = $sce
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ngToast = ngToast
    this.senderId = $stateParams.id
    this.messages = []

    $scope.$on('$ionicView.loaded', (e) => {
      setTimeout(()=> {
        this.loadMessages()
      },400)

    })

  }

  loadMessages(){
    this.http
        .get(HKEPC.forum.pm(this.senderId))
        .then((resp) => {

          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseUrl)
              .processExternalUrl()
              .getCheerio()

          // select the current login user
          const currentUsername = $('#umenu > cite').text()

          // send the login name to parent controller
          this.scope.$emit("accountTabUpdate",currentUsername)

          const messages = $('.pm_list li.s_clear').map((i, elem) => {
            const isSelf = $(elem).attr('class').indexOf('self') > 0

            let chatSource = cheerio.load($(elem).html())

            const avatarUrl = chatSource('.avatar img').attr('src')
            const text = chatSource('.summary').html()
            const username = chatSource('.cite cite').text()

            chatSource('cite').remove()

            const date = chatSource('.cite').text()
            const id = URLUtils.getQueryVariable(avatarUrl,'uid')
            return {
              id: id,
              avatarUrl:avatarUrl,
              content: this.sce.trustAsHtml(
                  text
              ),
              username: username,
              date : date,
              isSelf: isSelf
            }

          }).get()

          // must exist in the list
          const senderMessage = messages.filter((m) => !m.isSelf)[0]
          this.sender = {
            id : senderMessage.id,
            username : senderMessage.username
          }

          this.messages = messages
          console.log(messages)
          this.scope.apply()

          // scroll to bottom
          setTimeout(() => {
            this.ionicScrollDelegate.scrollBottom()
          },500)

        },(err) => {
          console.log(err)
        })
  }

  sendMessage(sender,message){
    //alert(JSON.stringify({
    //  to: sender,
    //  message: message
    //}))

    this.ngToast.warning("此功能開發中")
  }
}