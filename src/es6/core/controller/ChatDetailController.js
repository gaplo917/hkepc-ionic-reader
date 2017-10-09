/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {XMLUtils} from '../../utils/xml'

import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"
import * as Controllers from "./index"

const cheerio = require('cheerio')
const moment = require('moment')
const uuid = require('uuid-v4');

export class ChatDetailController{
  static get STATE() { return 'tab.features-chat-detail'}
  static get NAME() { return 'ChatDetailController'}
  static get CONFIG() { return {
    url: '/features/chats/:id',
    cache: false,
    views: {
      'tab-features': {
        templateUrl: 'templates/features/chats/chats.details.html',
        controller: ChatDetailController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, apiService, $sce, $stateParams,$ionicScrollDelegate,ngToast,$ionicHistory,$state){

    this.scope = $scope
    this.apiService = apiService
    this.sce = $sce
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.state = $state

    this.senderId = $stateParams.id
    this.messages = []

    $scope.$on('$ionicView.loaded', (e) => {
        this.loadMessages()
    })

  }

  loadMessages(){
    this.apiService
        .chatDetails(this.senderId)
        .safeApply(this.scope, (resp) => {

          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
              .removeIframe()
              .processImgUrl(HKEPC.baseForumUrl)
              .processImageToLazy()
              .processExternalUrl()
              .getCheerio()

          const messages = $('.pm_list li.s_clear').map((i, elem) => {
            const isSelf = $(elem).attr('class').indexOf('self') > 0

            return this.parseChat($(elem).html(),isSelf)

          }).get()

          // must exist in the list
          const senderMessage = messages.filter((m) => !m.isSelf)[0]
          if(senderMessage){
            this.sender = {
              id : senderMessage.id,
              username : senderMessage.username
            }
          }

          this.messages = messages

          // scroll to bottom
          this.ionicScrollDelegate.scrollBottom(true)


          this.sendMessage = (message) => {
            // prepare the chat message
            const relativeUrl = $('#pmform').attr('action')
            const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

            let formSource = cheerio.load($('#pmform').html())

            const hiddenFormInputs = {}

            formSource(`input[type='hidden']`).map((i,elem) => {
              const k = formSource(elem).attr('name')
              const v = formSource(elem).attr('value')

              hiddenFormInputs[k] = encodeURIComponent(v)
            }).get()

            const ionicReaderSign = HKEPC.signature()

            // build the reply message
            const chatMessage = `${message}\n\n${ionicReaderSign}`

            // Post to the server
            this.apiService.postChatMessage({
              method: "POST",
              url : postUrl,
              data : {
                message: chatMessage,
               ...hiddenFormInputs
              },
              headers : {'Content-Type':'application/x-www-form-urlencoded'}
            }).safeApply(this.scope, (resp) => {

              const $ = cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true})

              const newMessage = this.parseChat($('li').html(),true)

              if(newMessage.date != 'invalid date') {
                this.messages.push(newMessage)

                this.ionicScrollDelegate.scrollBottom(true)

              } else {

                // hotfix for cannot show message
                setTimeout(() => this.doRefresh(), 1000)

              }

              delete this.input.message

            }).subscribe()
          }

        }).subscribe()
  }

  parseChat(chatHtml,isSelf) {
    let chatSource = cheerio.load(chatHtml)

    const avatarUrl = chatSource('.avatar img').attr('raw-src')
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
      date : moment(date,'YYYY-M-D hh:mm').fromNow(),
      isSelf: isSelf
    }
  }

  onSendMessage(sender,message){

    this.sendMessage(message)

  }

  doRefresh(){
    this.messages = []
    this.loadMessages()
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.ChatController.STATE)
    }
  }

  loadLazyImage(uid, imageSrc) {
    const image = document.getElementById(uid)
    if(image.getAttribute('src') === imageSrc){
      window.open(imageSrc, '_system', 'location=yes')
    }
    else {
      image.setAttribute('src', imageSrc)
    }
  }

  openImage(uid, imageSrc) {
    window.open(imageSrc, '_system', 'location=yes')
  }

}