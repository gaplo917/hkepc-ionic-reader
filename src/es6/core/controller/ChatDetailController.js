/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'

import { GeneralHtml } from '../model/general-html'
import * as Controllers from './index'
import swal from 'sweetalert2'
import { Bridge } from '../bridge/Bridge'

import cheerio from 'cheerio'
import moment from 'moment'

export class ChatDetailController {
  static get STATE () { return 'tab.features-chat-detail' }

  static get NAME () { return 'ChatDetailController' }

  static get CONFIG () {
    return {
      url: '/features/chats/:id',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/features/chats/chats.details.html',
          controller: ChatDetailController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, apiService, $sce, $stateParams, $ionicScrollDelegate, ngToast, $ionicHistory, $state, $compile) {
    this.scope = $scope
    this.apiService = apiService
    this.sce = $sce
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.state = $state
    this.compile = $compile
    this.messageInput = ''

    this.recipientId = $stateParams.id
    this.messages = null

    $scope.$on('$ionicView.loaded', (e) => {
      this.loadMessages()
    })
  }

  loadMessages () {
    this.apiService
      .chatDetails(this.recipientId)
      .safeApply(this.scope, (resp) => {
        swal.close()

        const html = new GeneralHtml(cheerio.load(resp.data))

        const $ = html
          .removeAds()
          .processImgUrl(HKEPC.baseForumUrl)
          .processImageToLazy()
          .processExternalUrl()
          .getCheerio()

        const messages = $('.pm_list li.s_clear').map((i, elem) => {
          const isSelf = $(elem).attr('class').indexOf('self') > 0

          return this.parseChat($(elem).html(), isSelf)
        }).get()

        const username = $('.itemtitle .left strong').text()

        // must exist in the list
        this.recipient = {
          id: this.recipientId,
          username: username
        }

        this.messages = messages

        // scroll to bottom
        this.ionicScrollDelegate.scrollBottom(true)

        this.sendMessage = (message) => {
          // prepare the chat message
          const relativeUrl = $('#pmform').attr('action')
          const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

          const formSource = cheerio.load($('#pmform').html())

          const hiddenFormInputs = {}

          formSource(`input[type='hidden']`).map((i, elem) => {
            const k = formSource(elem).attr('name')
            const v = formSource(elem).attr('value')

            hiddenFormInputs[k] = encodeURIComponent(v)
          }).get()

          // build the reply message
          const chatMessage = `${message}`

          const spinnerHtml = `
              <div>
                  <div class="text-center">傳送到 HKEPC 伺服器中</div>
              </div>
            `

          swal({
            animation: false,
            html: spinnerHtml,
            allowOutsideClick: false,
            showCancelButton: false,
            showConfirmButton: false
          })

          swal.showLoading()

          // Post to the server
          this.apiService.postChatMessage({
            method: 'POST',
            url: postUrl,
            data: {
              message: chatMessage,
              ...hiddenFormInputs
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          }).safeApply(this.scope, (resp) => {
            setTimeout(() => {
              this.doRefresh()
            }, 1000)
          }).subscribe()
        }
      }).subscribe()
  }

  parseChat (chatHtml, isSelf) {
    const chatSource = cheerio.load(chatHtml)

    const avatarUrl = chatSource('.avatar img').attr('raw-src')
    const text = chatSource('.summary').html()
    const username = chatSource('.cite cite').text()

    chatSource('cite').remove()

    const date = chatSource('.cite').text()

    const id = URLUtils.getQueryVariable(avatarUrl, 'uid')
    return {
      id: id,
      avatarUrl: avatarUrl,
      content: this.sce.trustAsHtml(
        text
      ),
      username: username,
      date: date.trim(),
      isSelf: isSelf
    }
  }

  onSendMessage () {
    const { messageInput } = this
    if (messageInput === '') {
      // empty input
      this.ngToast.danger(`<i class="ion-alert-circled"> 不能發送空白訊息！</i>`)
      return
    }
    this.sendMessage(messageInput)
  }

  doRefresh () {
    this.messageInput = ''
    this.loadMessages()
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true
      })
      this.state.go(Controllers.ChatController.STATE)
    }
  }

  setIsFocused (bool) {
    this.isFocused = bool
  }

  loadLazyImage (uid, imageSrc) {
    const image = document.getElementById(uid)
    if (image.getAttribute('src') === imageSrc) {
      window.open(imageSrc, '_system', 'location=yes')
    } else {
      image.setAttribute('src', imageSrc)
    }
  }

  openImage (uid, imageSrc) {
    window.open(imageSrc, '_system', 'location=yes')
  }
}
