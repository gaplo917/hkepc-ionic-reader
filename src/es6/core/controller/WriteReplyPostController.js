import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import {XMLUtils} from '../../utils/xml'
import * as _ from "lodash";

const cheerio = require('cheerio')

export class WriteReplyPostController {
  static get STATE() { return 'tab.topics-posts-detail-reply'}
  static get NAME() { return 'WriteReplyPostController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/posts/:postId/page/:page/reply?message=&reply=',
    cache: false,
    views: {
      'tab-topics': {
        templateUrl: 'templates/write-reply-post.html',
        controller: WriteReplyPostController.NAME,
        controllerAs: 'vm'
      },
    }
  }}
  constructor($scope,$state,$stateParams,$ionicHistory,ngToast, apiService) {
    this.id = "reply-content"
    this.message = JSON.parse($stateParams.message)
    this.reply = JSON.parse($stateParams.reply)
    this.reply.content = ""
    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page

    this.scope = $scope
    this.apiService = apiService
    this.ngToast = ngToast
    this.ionicHistory = $ionicHistory
    this.state = $state
    this.images = []

    // fetch the epc data for native App
    this.preReplyFetchContent().subscribe()
  }
  onImageUpload(image) {
    console.log("onImageUplod", image)
    this.reply.content = `${this.reply.content}\n[attachimg]${image.id}[/attachimg]`
    this.images.push(image)
  }

  preReplyFetchContent(){

    // useful for determine none|reply|quote type
    return this.apiService.replyPage(this.reply)
      .doOnNext(resp => {
        let $ = cheerio.load(resp.data)
        const relativeUrl = $('#postform').attr('action')

        // ---------- Upload image preparation ----------------------------------------------
        let imgattachform = $('#imgattachform')
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

    this.preReplyFetchContent()
      .flatMap(() => {
        const postUrl = this.postUrl
        const preText = this.preText
        const hiddenFormInputs = this.hiddenFormInputs
        const ionicReaderSign = HKEPC.signature()

        // build the reply message
        const replyMessage = `${preText}\n${reply.content}\n\n${ionicReaderSign}`

        const imageFormData = {}
        this.images.forEach(img => {
          imageFormData[img.formData] = ""
        })

        // Post to the server
        return this.apiService.dynamicRequest({
          method:  "POST",
          url:     postUrl,
          data:    {
            message: replyMessage,
            ...hiddenFormInputs,
            ...imageFormData
          },
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
      })
      .safeApply(this.scope, (resp) => {
        const responseText = cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true}).html()
        const isReplySuccess = _.includes(responseText, '回覆已經發佈')

        if(isReplySuccess){
          this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈回覆！</i>`)
          this.onBack()
        }
        else {
          this.ngToast.danger(`<i class="ion-ios-close"> 發佈失敗！HKEPC 傳回:「${responseText}」</i>`)
        }

      }).subscribe()

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