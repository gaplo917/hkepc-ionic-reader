import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import {XMLUtils} from '../../utils/xml'
import * as _ from "lodash";
import swal from 'sweetalert2'
import {Bridge} from "../bridge/Bridge";

const cheerio = require('cheerio')

export class WriteReplyPostController {
  static get STATE() { return 'tab.topics-posts-detail-reply'}
  static get NAME() { return 'WriteReplyPostController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/posts/:postId/page/:page/reply?message=&reply=',
    cache: false,
    views: {
      'main': {
        templateUrl: 'templates/write-reply-post.html',
        controller: WriteReplyPostController.NAME,
        controllerAs: 'vm'
      },
    }
  }}
  constructor($scope,$state,$stateParams,$ionicHistory,ngToast, apiService, $ionicPopup, $compile, LocalStorageService) {
    this.id = "reply-content"
    this.message = JSON.parse($stateParams.message)
    this.reply = JSON.parse($stateParams.reply)
    this.reply.content = ""
    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page
    this.compile = $compile

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
        if(signature === 'true'){
          this.ionicReaderSign = HKEPC.signature({
            androidVersion: Bridge.isAndroidNative() ? $scope.nativeVersion : null,
            iosVersion: Bridge.isiOSNative() ? $scope.nativeVersion : null,
          })
        } else {
          this.ionicReaderSign = ''
        }
      })


      // fetch the epc data for native App
      this.preFetchContent().subscribe()
    })
  }

  onImageUploadSuccess(attachmentIds){
    this.ngToast.success(`<i class="ion-ios-checkmark"> 成功新增圖片${attachmentIds.join(',')}！</i>`)
    this.preFetchContent().subscribe()
  }

  preFetchContent(){

    // useful for determine none|reply|quote type
    return this.apiService.replyPage(this.reply)
      .doOnNext(resp => {
        let $ = cheerio.load(resp.data)
        const relativeUrl = $('#postform').attr('action')

        // ---------- Upload image preparation ----------------------------------------------
        let imgattachform = $('#imgattachform')

        let existingImages = $('img').map((i, e) => {
          const img = $(e)
          const src = img.attr('src')
          const rawId = img.attr('id')
          const isAttachment = _.startsWith(src, "//forum.hkepc.net")
          const id = _.replace(rawId, 'image_', '')
          return {
            src: src.replace("//forum.hkepc.net", "https://forum.hkepc.net"),
            id: id,
            isAttachment: isAttachment
          }
        }).get()
          .filter(existingImage => existingImage.isAttachment)

        let attachFormSource = cheerio.load(imgattachform.html())

        const hiddenAttachFormInputs = {}

        hiddenAttachFormInputs['action'] = `${HKEPC.baseForumUrl}/${imgattachform.attr('action')}`

        attachFormSource(`input[type='hidden']`).map((i, elem) => {
          const k = attachFormSource(elem).attr('name')
          const v = attachFormSource(elem).attr('value')

          return hiddenAttachFormInputs[k] = encodeURIComponent(v)
        }).get()

        // assign hiddenAttachFormInputs to modal
        this.hiddenAttachFormInputs = hiddenAttachFormInputs
        this.existingImages = existingImages

        // ---------- End of Upload image preparation -----------------------------------------

        this.postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`


        let formSource = cheerio.load($('#postform').html())

        const hiddenFormInputs = {}
        formSource(`input[type='hidden']`).map((i,elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value')

          hiddenFormInputs[k] = encodeURIComponent(v)
        }).get()

        this.hiddenFormInputs = hiddenFormInputs

        // the text showing the effects of reply / quote
        this.preText = formSource('#e_textarea').text()

      })

  }

  doReply(reply){
    console.log(JSON.stringify(reply))

    const spinnerHtml = `
          <div>
              <div class="text-center">傳送到 HKEPC 伺服器中</div>
          </div>
        `

    swal({
      html: spinnerHtml,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
    })

    swal.showLoading()

    this.preFetchContent()
      .flatMap(() => {
        const postUrl = this.postUrl
        const preText = this.preText
        const hiddenFormInputs = this.hiddenFormInputs
        const ionicReaderSign = this.ionicReaderSign

        // build the reply message
        const replyMessage = `${preText}${reply.content}\n\n${ionicReaderSign}`

        const imageFormData = {}
        const deleteImageFormData = {}

        // attach Image logic
        this.attachImageIds.forEach(id => {
          imageFormData[`attachnew[${id}][description]=`] = ""
        })

        // delete image logic
        this.deleteImageIds.forEach((id,i) => {
          deleteImageFormData[`attachdel[${i}]`] = id
        })

        // Post to the server
        return this.apiService.dynamicRequest({
          method:  "POST",
          url:     postUrl,
          data:    {
            message: replyMessage,
            ...hiddenFormInputs,
            ...imageFormData,
            ...deleteImageFormData
          },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
      })
      .safeApply(this.scope, (resp) => {
        const responseText = resp && resp.data && cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true}).html()
        const isReplySuccess = _.includes(responseText, '回覆已經發佈')

        if(isReplySuccess){
          swal.close()
          this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈回覆！</i>`)

          this.onBack()
        }
        else {
          swal({
            title: "發佈失敗",
            text: `HKEPC 傳回:「${responseText}」`,
            type: "error",
            confirmButtonText: "確定",
          })
        }

      }).subscribe(
        () => {},
        err => swal({
          title: "發佈失敗",
          text: `網絡異常，請重新嘗試！`,
          type: "error",
          confirmButtonText: "確定",
        })
    )

  }


  addImageToContent(existingImage){
    const attachmentId = existingImage.id
    const selectorId = this.id
    const selectionStart = document.getElementById(selectorId).selectionStart
    const content = document.getElementById(selectorId).value
    const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

    this.reply.content = `${splits[0]}[attachimg]${attachmentId}[/attachimg]\n${splits[1]}`
    this.attachImageIds.push(attachmentId)
  }

  confirmDeleteImage(existingImage){
    this.ionicPopup.confirm({
      title: '確認要刪除圖片？', // String. The title of the popup.
      cssClass: '', // String, The custom CSS class name
      subTitle: '', // String (optional). The sub-title of the popup.
      cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
      cancelType: 'button-default', // String (default: 'button-default'). The type of the Cancel button.
      okText: '刪除', // String (default: 'OK'). The text of the OK button.
      okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
    }).then(isDelete => {
      console.log(`isDelete ${isDelete} ->`,existingImage)
      if(isDelete){
        const id = existingImage.id

        // add to delete array
        this.deleteImageIds.push(id)

        //remove attachment id from array
        this.attachImageIds = this.attachImageIds.filter(imgId => imgId !== id)

        this.existingImages = this.existingImages.filter(eImage => eImage.id !== id)

        this.reply.content = _.replace(this.reply.content, id ,'')
        this.reply.content = _.replace(this.reply.content, '[attachimg][/attachimg]' ,'')
        setTimeout(() => this.scope.$apply(), 0)
      }
    })
  }

  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
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
