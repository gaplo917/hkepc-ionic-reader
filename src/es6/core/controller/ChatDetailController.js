/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
const cheerio = require('cheerio')
const async = require('async')

export class ChatDetailController{
  static get STATE() { return 'tab.chat-detail'}
  static get NAME() { return 'ChatDetailController'}
  static get CONFIG() { return {
    url: '/chats/:id',
    cache: false,
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: ChatDetailController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope, $http, $sce, $stateParams,$ionicScrollDelegate,ngToast){

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
          setTimeout(() => {
            this.ionicScrollDelegate.scrollBottom()
          },500)

          this.sendMessage = (message) => {
            // prepare the chat message
            const relativeUrl = $('#pmform').attr('action')
            const postUrl = `${HKEPC.baseUrl}/${relativeUrl}&infloat=yes&inajax=1`

            let formSource = cheerio.load($('#pmform').html())

            const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
              const k = formSource(elem).attr('name')
              const v = formSource(elem).attr('value')

              return `${k}=${encodeURIComponent(v)}`
            }).get()

            const ionicReaderSign = HKEPC.signature()

            // build the reply message
            const chatMessage = `${message}\n\n${ionicReaderSign}`

            const postData = [
              `message=${encodeURIComponent(chatMessage)}`,
              hiddenFormInputs.join('&')
            ].join('&')

            // Post to the server
            this.http({
              method: "POST",
              url : postUrl,
              data : postData,
              headers : {'Content-Type':'application/x-www-form-urlencoded'}
            }).then((resp) => {

              this.ngToast.success(`<i class="ion-ios-checkmark"> 已發送！</i>`)

              this.doRefesh()
            })
          }

        })
  }

  parseChat(chatHtml,isSelf) {
    let chatSource = cheerio.load(chatHtml)

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
  }

  onSendMessage(sender,message){

    this.sendMessage(message)

  }

  doRefesh(){
    this.messages = []
    this.loadMessages()
  }
}