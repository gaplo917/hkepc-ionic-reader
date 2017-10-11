import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import {XMLUtils} from '../../utils/xml'
import * as _ from "lodash";
import {PostListRefreshRequest} from "../model/PostListRefreshRequest"

const cheerio = require('cheerio')

export class WriteNewPostController {
  static get STATE() { return 'tab.topics-posts-new'}
  static get NAME() { return 'WriteNewPostController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/newPost?categories=&topic=',
    cache: false,
    views: {
      'tab-topics': {
        templateUrl: 'templates/write-new-post.html',
        controller: WriteNewPostController.NAME,
        controllerAs: 'vm'
      },
    }
  }}
  constructor($scope,$state,$stateParams,$ionicHistory,$ionicPopover,ngToast, apiService, $ionicPopup, $rootScope) {
    this.id = "new-content"
    this.post = { content: "" }
    this.topicId = $stateParams.topicId
    this.apiService = apiService
    this.scope = $scope
    this.rootScope = $rootScope
    this.ngToast = ngToast
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.topic = JSON.parse($stateParams.topic)
    this.categories = JSON.parse($stateParams.categories)

    this.deleteImageIds = []
    this.attachImageIds = []
    this.existingImages = []
    this.ionicPopup = $ionicPopup

    console.log("write new post ", this.topic)
    console.log("write new post ", this.categories)


    $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
      scope: $scope
    }).then((popover) => {
      this.categoryPopover = popover;
    })

    this.preFetchContent().subscribe()
  }

  onImageUploadSuccess(attachmentIds){
    this.ngToast.success(`<i class="ion-ios-checkmark"> 成功新增圖片${attachmentIds.join(',')}！</i>`)
    this.preFetchContent().subscribe()
  }

  preFetchContent(){

    return this.apiService.preNewPost(this.topicId)
      .safeApply(this.scope, resp => {
        let $ = cheerio.load(resp.data)

        const relativeUrl = $('#postform').attr('action')
        this.postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

        // ---------- Upload image preparation ----------------------------------------------
        let imgattachform = $('#imgattachform')

        let existingImages = $('img').map((i, e) => {
          const img = $(e)
          const src = img.attr('src')
          const rawId = img.attr('id')
          const isAttachment = _.startsWith(src, "//forum.hkepc.net")
          const id = _.replace(rawId, 'image_', '')
          return {
            src: src,
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
        // ---------- End of Upload image preparation -----------------------------------------------

        const hiddenFormInputs = {}
        $(`input[type='hidden']`).map((i,elem) => {
          const k = $(elem).attr('name')
          const v = $(elem).attr('value')

          hiddenFormInputs[k] = encodeURIComponent(v)
        }).get()

        this.hiddenFormInputs = hiddenFormInputs
      })
  }

  doPublishNewPost(post){
      const postUrl = this.postUrl
      console.log('do publist new post')

      const isValidInput = post.title && post.content

      if(isValidInput){

        const hiddenFormInputs = this.hiddenFormInputs

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

        const ionicReaderSign = HKEPC.signature()

        const subject = post.title
        const replyMessage = `${post.content}\n\n${ionicReaderSign}`

        //Post to the server
        this.apiService.dynamicRequest({
          method: "POST",
          url : postUrl,
          data : {
            subject: subject,
            message: replyMessage,
            typeid: _.get(post, 'category.id', undefined),
            handlekey: "newthread",
            topicsubmit: true,
            ...hiddenFormInputs,
            ...imageFormData,
            ...deleteImageFormData
          },
          headers : {'Content-Type':'application/x-www-form-urlencoded'}
        }).safeApply(this.scope, (resp) => {
          const responseText = cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true}).html()
          const isNewPostSuccess = _.includes(responseText, '主題已經發佈')

          if(isNewPostSuccess){
            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)
            this.rootScope.$emit(PostListRefreshRequest.NAME)
            this.onBack()
          }
          else {
            this.ngToast.danger(`<i class="ion-ios-close"> 發佈失敗！HKEPC 傳回:「${responseText}」</i>`)
          }
        }).subscribe()

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 標題或內容不能空白！</i>`)
      }
  }

  addImageToContent(existingImage){
    const attachmentId = existingImage.id
    const selectorId = this.id
    const selectionStart = document.getElementById(selectorId).selectionStart
    const content = document.getElementById(selectorId).value
    const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

    this.post.content = `${splits[0]}[attachimg]${attachmentId}[/attachimg]\n${splits[1]}`
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

        this.post.content = _.replace(this.post.content, id ,'')
        this.post.content = _.replace(this.post.content, '[attachimg][/attachimg]' ,'')
        setTimeout(() => this.scope.$apply(), 0)
      }
    })
  }

  openCategoryPopover($event){
    this.categoryPopover.show($event)
  }

  selectCategory(category){
    this.categoryPopover.hide()
    this.post.category = category
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
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

}