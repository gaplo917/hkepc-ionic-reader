import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import {XMLUtils} from '../../utils/xml'
import * as _ from "lodash";
import {PostDetailRefreshRequest} from "../model/PostDetailRefreshRequest"
import swal from 'sweetalert'
const cheerio = require('cheerio')

export class EditPostController {
  static get STATE() { return 'tab.topics-posts-edit'}
  static get NAME() { return 'EditPostController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/posts/:postId/page/:page/edit?message=',
    cache: false,
    views: {
      'main': {
        templateUrl: 'templates/edit-post.html',
        controller: EditPostController.NAME,
        controllerAs: 'vm'
      },
    }
  }}
  


  constructor($scope,$state,$stateParams,$ionicHistory,ngToast, apiService, $ionicPopup, $rootScope, $compile) {
    this.id = "edit-content"
    this.apiService = apiService
    this.scope = $scope
    this.ngToast = ngToast
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.rootScope = $rootScope
    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page
    this.compile = $compile

    this.message = JSON.parse($stateParams.message)

    this.deleteImageIds = []
    this.attachImageIds = []
    this.existingImages = []
    this.ionicPopup = $ionicPopup

    this.preFetchContent().subscribe()
  }
  
  onImageUploadSuccess(attachmentIds){
    this.ngToast.success(`<i class="ion-ios-checkmark"> 成功新增圖片${attachmentIds.join(',')}！</i>`)
    this.preFetchContent().subscribe()
  }
  
  
  preFetchContent(){
    return this.apiService.preEditMessage(this.message.post.topicId,this.message.post.id,this.message.id)
      .safeApply(this.scope, (resp) => {
        let $ = cheerio.load(resp.data)
        const relativeUrl = $('#postform').attr('action')
        this.postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

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

        console.log("existingImages", existingImages)
        let attachFormSource = cheerio.load(imgattachform.html())

        const hiddenAttachFormInputs = {}

        hiddenAttachFormInputs['action'] = `${HKEPC.baseForumUrl}/${imgattachform.attr('action')}`

        attachFormSource(`input[type='hidden']`).map((i,elem) => {
          const k = attachFormSource(elem).attr('name')
          const v = attachFormSource(elem).attr('value')

          return hiddenAttachFormInputs[k] = encodeURIComponent(v)
        }).get()

        // assign hiddenAttachFormInputs to modal
        this.hiddenAttachFormInputs = hiddenAttachFormInputs
        this.existingImages = existingImages

        // ---------- End of Upload image preparation -----------------------------------------------

        let formSource = cheerio.load($('#postform').html())
        const subTopicTypeId = formSource(`#typeid > option[selected='selected']`).attr('value')


        const hiddenFormInputs = {}
        formSource(`input[type='hidden']`).map((i,elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value')

          hiddenFormInputs[k] = encodeURIComponent(v)
        }).get()

        this.hiddenFormInputs = hiddenFormInputs
        this.subTopicTypeId = subTopicTypeId

        // the text showing the effects of reply / quote
        this.edit = {
          subject: formSource('#subject').attr('value'),
          content :formSource('#e_textarea').text()
        }

      })
  }

  doEdit(subject,content){
    console.log(content)
    const postUrl = this.postUrl
    const hiddenFormInputs = this.hiddenFormInputs
    const subTopicTypeId = this.subTopicTypeId
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

    swal({
      content: (() => {
        return this.compile(`
          <div>
              <ion-spinner class='image-loader' icon='android'/>
              <div class="text-center">傳送到 HKEPC 伺服器中</div>
          </div>
        `)(this.scope)[0]
      })(),
      closeOnEsc: false,
      closeOnClickOutside: false,
      buttons: false
    })

    // Post to the server
    this.apiService.dynamicRequest({
      method: "POST",
      url : postUrl,
      data : {
        editsubmit: true,
        message: content,
        subject: subject,
        typeid: subTopicTypeId,
        ...hiddenFormInputs,
        ...imageFormData,
        ...deleteImageFormData
      },
      headers : {'Content-Type':'application/x-www-form-urlencoded'}
    }).safeApply(this.scope, (resp) => {
      const responseText = resp && resp.data && cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true}).html()
      const isEditSuccess = _.includes(responseText, '成功')
      if(isEditSuccess){

        swal.close()

        this.ngToast.success(`<i class="ion-ios-checkmark"> 修改成功！</i>`)

        // set the page to the message page
        this.currentPage = this.message.post.page

        this.onBack()
      }
      else {
        swal({
          title: "修改失敗",
          text: `HKEPC 傳回:「${responseText}」`,
          icon: "error",
          button: "確定",
        })
      }

    }).subscribe(
      () => {},
      err => swal({
        title: "發佈失敗",
        text: `網絡異常，請重新嘗試！`,
        icon: "error",
        button: "確定",
      })
    )
  }

  addImageToContent(existingImage){
    const attachmentId = existingImage.id
    const selectorId = this.id
    const selectionStart = document.getElementById(selectorId).selectionStart
    const content = document.getElementById(selectorId).value
    const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

    this.edit.content = `${splits[0]}[attachimg]${attachmentId}[/attachimg]\n${splits[1]}`
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

        this.edit.content = _.replace(this.edit.content, id ,'')
        this.edit.content = _.replace(this.edit.content, '[attachimg][/attachimg]' ,'')
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