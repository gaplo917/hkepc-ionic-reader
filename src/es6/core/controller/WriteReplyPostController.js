import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import * as _ from 'lodash'
import swal from 'sweetalert2'
import { Bridge } from '../bridge/Bridge'

export class WriteReplyPostController {
  static get STATE () { return 'tab.topics-posts-detail-reply' }

  static get NAME () { return 'WriteReplyPostController' }

  static get CONFIG () {
    return {
      url: '/topics/:topicId/posts/:postId/page/:page/reply?post=&reply=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/write-reply-post.html',
          controller: WriteReplyPostController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $state, $stateParams, $ionicHistory, ngToast, apiService, $ionicPopup, $compile, LocalStorageService, $ionicScrollDelegate) {
    this.id = 'reply-content'
    this.post = JSON.parse($stateParams.post)
    this.reply = JSON.parse($stateParams.reply)
    this.isHideSelectType = this.reply.type === 1
    this.reply.content = ''
    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page
    this.compile = $compile
    this.ionicScrollDelegate = $ionicScrollDelegate.$getByHandle('edit')

    this.scope = $scope
    this.apiService = apiService
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.ionicPopup = $ionicPopup
    this.state = $state
    this.deleteImageIds = []
    this.attachImageIds = []
    this.existingImages = []

    $scope.$on('$ionicView.loaded', (e) => {
      LocalStorageService.get('signature').subscribe(signature => {
        const isFree = $scope.nativeVersion && $scope.nativeVersion[$scope.nativeVersion.length - 1] === 'F'
        if (signature === 'false' && !isFree) {
          this.ionicReaderSign = ''
        } else {
          this.ionicReaderSign = HKEPC.signature({
            androidVersion: Bridge.isAndroidNative() ? $scope.nativeVersion : null,
            iosVersion: Bridge.isiOSNative() ? $scope.nativeVersion : null
          })
        }
      })

      // fetch the epc data for native App
      this.preFetchContent().subscribe()
    })
  }

  onImageUploadSuccess (attachmentIds) {
    this.ngToast.success(`<i class="ion-ios-checkmark"> 成功新增圖片${attachmentIds.join(',')}！</i>`)
    this.preFetchContent().subscribe()
  }

  preFetchContent () {
    // useful for determine none|reply|quote type
    return this.apiService.replyPage(this.reply)
      .safeApply(this.scope, resp => {
        const {
          actionUrl,
          preText,
          hiddenFormInputs,
          existingImages,
          hiddenAttachFormInputs
        } = resp

        this.actionUrl = actionUrl

        // assign hiddenAttachFormInputs to modal
        this.hiddenAttachFormInputs = hiddenAttachFormInputs
        this.existingImages = existingImages

        this.hiddenFormInputs = hiddenFormInputs

        // the text showing the effects of reply / quote
        this.preText = preText
      })
  }

  doReply (reply) {
    console.log(JSON.stringify(reply))

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

    this.preFetchContent()
      .flatMap(() => {
        const actionUrl = this.actionUrl
        const preText = this.preText
        const hiddenFormInputs = this.hiddenFormInputs
        const ionicReaderSign = this.ionicReaderSign

        // build the reply message
        const replyMessage = `${preText.trim()}\n\n${reply.content}\n\n${ionicReaderSign}`

        const imageFormData = {}
        const deleteImageFormData = {}

        // attach Image logic
        this.attachImageIds.forEach(id => {
          imageFormData[`attachnew[${id}][description]=`] = ''
        })

        // delete image logic
        this.deleteImageIds.forEach((id, i) => {
          deleteImageFormData[`attachdel[${i}]`] = id
        })

        // Post to the server
        return this.apiService.dynamicRequest({
          method: 'POST',
          url: actionUrl,
          data: {
            message: replyMessage,
            ...hiddenFormInputs,
            ...imageFormData,
            ...deleteImageFormData
          },
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      })
      .flatMapApiFromCheerioworker('responseContainText', { text: '回覆已經發佈', isXml: true })
      .safeApply(this.scope, ({ responseText, result }) => {
        if (result) {
          swal.close()
          this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈回覆！</i>`)

          this.onBack()
        } else {
          swal({
            animation: false,
            title: '發佈失敗',
            text: `HKEPC 傳回:「${responseText}」`,
            type: 'error',
            confirmButtonText: '確定'
          })
        }
      }).subscribe(
        () => {},
        () => swal({
          animation: false,
          title: '發佈失敗',
          text: `網絡異常，請重新嘗試！`,
          type: 'error',
          confirmButtonText: '確定'
        })
      )
  }

  addImageToContent (existingImage) {
    const attachmentId = existingImage.id
    const selectorId = this.id
    const selectionStart = document.getElementById(selectorId).selectionStart
    const content = document.getElementById(selectorId).value
    const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

    this.reply.content = `${splits[0]}[attachimg]${attachmentId}[/attachimg]\n${splits[1]}`
    this.attachImageIds.push(attachmentId)
  }

  confirmDeleteImage (existingImage) {
    this.ionicPopup.confirm({
      title: '確認要刪除圖片？', // String. The title of the popup.
      cssClass: '', // String, The custom CSS class name
      subTitle: '', // String (optional). The sub-title of the popup.
      cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
      cancelType: 'button-default', // String (default: 'button-default'). The type of the Cancel button.
      okText: '刪除', // String (default: 'OK'). The text of the OK button.
      okType: 'button-assertive' // String (default: 'button-positive'). The type of the OK button.
    }).then(isDelete => {
      console.log(`isDelete ${isDelete} ->`, existingImage)
      if (isDelete) {
        const id = existingImage.id

        // add to delete array
        this.deleteImageIds.push(id)

        // remove attachment id from array
        this.attachImageIds = this.attachImageIds.filter(imgId => imgId !== id)

        this.existingImages = this.existingImages.filter(eImage => eImage.id !== id)

        this.reply.content = _.replace(this.reply.content, id, '')
        this.reply.content = _.replace(this.reply.content, '[attachimg][/attachimg]', '')
        setTimeout(() => this.scope.$apply(), 0)
      }
    })
  }

  onFocus () {
    const focusPosition = angular.element(document.querySelector(`#input-helper`)).prop('offsetTop')
    this.ionicScrollDelegate.scrollTo(0, focusPosition + 4, false)
  }

  onBack () {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true

      })
      this.state.go(Controllers.PostDetailController.STATE, {
        topicId: this.topicId,
        postId: this.postId,
        page: this.page
      })
    }
  }
}
