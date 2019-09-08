/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as Controllers from './index'
import swal from 'sweetalert2'
import { Bridge, Channel } from '../bridge/index'

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

  constructor ($scope, apiService, $stateParams, $ionicScrollDelegate, ngToast, $ionicHistory, $state, $compile, $timeout) {
    this.scope = $scope
    this.apiService = apiService
    this.ionicScrollDelegate = $ionicScrollDelegate.$getByHandle('chat-detail-scroll')
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.state = $state
    this.compile = $compile
    this.messageInput = ''
    this.$timeout = $timeout

    this.recipientId = $stateParams.id
    this.messages = null

    $scope.$on('$ionicView.loaded', (e) => {
      this.loadMessages()
    })
  }

  loadMessages () {
    this.apiService
      .chatDetails(this.recipientId)
      .safeApply(this.scope, ({ username, messages, actionUrl, hiddenFormInputs }) => {
        swal.close()

        // must exist in the list
        this.recipient = {
          id: this.recipientId,
          username: username
        }

        this.messages = messages

        // scroll to bottom
        this.ionicScrollDelegate.scrollBottom(false)

        this.actionUrl = actionUrl
        this.hiddenFormInputs = hiddenFormInputs
      }).subscribe()
  }

  sendMessage () {
    const { $timeout, actionUrl, hiddenFormInputs, messageInput: message } = this
    if (message === '') {
      // empty input
      this.ngToast.danger(`<i class="ion-alert-circled"> 不能發送空白訊息！</i>`)
      return
    }
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
    this.apiService.dynamicRequest({
      method: 'POST',
      url: actionUrl,
      data: {
        message: message,
        ...hiddenFormInputs
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).safeApply(this.scope, (resp) => {
      $timeout(() => this.doRefresh(), 500)
    }).subscribe()
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
      this.state.go(Controllers.ChatListController.STATE)
    }
  }

  requestComposeDialog () {
    if (Bridge.isAvailable()) {
      Bridge.callHandler(Channel.composeDialog, {
        title: `發送訊息`,
        positiveText: '發送',
        cancelText: '取消',
        placeholder: '訊息'
      }, (content) => {
        if (content === null) {
          // cancelled
          return
        }
        this.messageInput = content
        this.sendMessage()
      })
    }
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
