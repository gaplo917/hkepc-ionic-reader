import * as Controllers from './index'
import { replace } from 'lodash-es'
import swal from 'sweetalert2'

export class EditPostController {
  static get STATE() {
    return 'tab.topics-posts-edit'
  }

  static get NAME() {
    return 'EditPostController'
  }

  static get CONFIG() {
    return {
      url: '/topics/:topicId/posts/:postId/page/:page/edit?message=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/edit-post.html',
          controller: EditPostController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }

  constructor(
    $scope,
    $state,
    $stateParams,
    $ionicHistory,
    ngToast,
    apiService,
    $ionicPopup,
    $rootScope,
    $compile,
    $ionicScrollDelegate
  ) {
    this.id = 'edit-content'
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
    this.ionicScrollDelegate = $ionicScrollDelegate.$getByHandle('edit')

    this.message = JSON.parse($stateParams.message)

    this.actionUrl = ''
    this.deleteImageIds = []
    this.attachImageIds = []
    this.existingImages = []
    this.ionicPopup = $ionicPopup

    $scope.$on('$ionicView.loaded', (e) => {
      // fetch the epc data for native App
      this.preFetchContent().subscribe()
    })
  }

  onImageUploadSuccess(attachmentIds) {
    this.ngToast.success(`<i class="ion-ios-checkmark"> 成功新增圖片${attachmentIds.join(',')}！</i>`)
    this.preFetchContent().subscribe()
  }

  preFetchContent() {
    return this.apiService
      .preEditMessage(this.message.post.topicId, this.message.post.id, this.message.id)
      .safeApply(this.scope, (resp) => {
        const { actionUrl, edit, subTopicTypeId, hiddenFormInputs, existingImages, hiddenAttachFormInputs } = resp

        this.actionUrl = actionUrl

        // assign hiddenAttachFormInputs to modal
        this.hiddenAttachFormInputs = hiddenAttachFormInputs
        this.existingImages = existingImages

        this.hiddenFormInputs = hiddenFormInputs
        this.subTopicTypeId = subTopicTypeId

        // the text showing the effects of reply / quote
        if (!this.edit) {
          this.edit = edit
        }
      })
  }

  doEdit(subject, content) {
    console.log(content)
    const { actionUrl, hiddenFormInputs, subTopicTypeId } = this
    const imageFormData = {}
    const deleteImageFormData = {}

    // attach Image logic
    this.attachImageIds.forEach((id) => {
      imageFormData[`attachnew[${id}][description]=`] = ''
    })

    // delete image logic
    this.deleteImageIds.forEach((id, i) => {
      deleteImageFormData[`attachdel[${i}]`] = id
    })

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
      showConfirmButton: false,
    })

    swal.showLoading()

    // Post to the server
    this.apiService
      .dynamicRequest({
        method: 'POST',
        url: actionUrl,
        data: {
          editsubmit: true,
          message: content,
          subject,
          typeid: subTopicTypeId,
          ...hiddenFormInputs,
          ...imageFormData,
          ...deleteImageFormData,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .flatMapApiFromCheerioworker('responseContainText', { text: '成功', isXml: true })
      .safeApply(this.scope, ({ responseText, result }) => {
        if (result) {
          swal.close()

          this.ngToast.success('<i class="ion-ios-checkmark"> 修改成功！</i>')

          // set the page to the message page
          this.currentPage = this.message.post.page

          this.onBack()
        } else {
          swal({
            animation: false,
            title: '修改失敗',
            text: `HKEPC 傳回:「${responseText}」`,
            type: 'error',
            confirmButtonText: '確定',
          })
        }
      })
      .subscribe(
        () => {},
        () =>
          swal({
            animation: false,
            title: '發佈失敗',
            text: '網絡異常，請重新嘗試！',
            type: 'error',
            confirmButtonText: '確定',
          })
      )
  }

  addImageToContent(existingImage) {
    const attachmentId = existingImage.id
    const selectorId = this.id
    const selectionStart = document.getElementById(selectorId).selectionStart
    const content = document.getElementById(selectorId).value
    const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

    this.edit.content = `${splits[0]}[attachimg]${attachmentId}[/attachimg]\n${splits[1]}`
    this.attachImageIds.push(attachmentId)
  }

  confirmDeleteImage(existingImage) {
    this.ionicPopup
      .confirm({
        title: '確認要刪除圖片？', // String. The title of the popup.
        cssClass: '', // String, The custom CSS class name
        subTitle: '', // String (optional). The sub-title of the popup.
        cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
        cancelType: 'button-default', // String (default: 'button-default'). The type of the Cancel button.
        okText: '刪除', // String (default: 'OK'). The text of the OK button.
        okType: 'button-assertive', // String (default: 'button-positive'). The type of the OK button.
      })
      .then((isDelete) => {
        console.log(`isDelete ${isDelete} ->`, existingImage)
        if (isDelete) {
          const id = existingImage.id

          // add to delete array
          this.deleteImageIds.push(id)

          // remove attachment id from array
          this.attachImageIds = this.attachImageIds.filter((imgId) => imgId !== id)

          this.existingImages = this.existingImages.filter((eImage) => eImage.id !== id)

          this.edit.content = replace(this.edit.content, id, '')
          this.edit.content = replace(this.edit.content, '[attachimg][/attachimg]', '')
          setTimeout(() => this.scope.$apply(), 0)
        }
      })
  }

  onFocus() {
    const focusPosition = angular.element(document.querySelector('#input-helper')).prop('offsetTop')
    this.ionicScrollDelegate.scrollTo(0, focusPosition + 4, false)
  }

  onBack() {
    if (this.ionicHistory.viewHistory().currentView.index !== 0) {
      this.ionicHistory.goBack()
    } else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true,
      })
      this.state.go(Controllers.PostDetailController.STATE, {
        topicId: this.topicId,
        postId: this.postId,
        page: this.page,
      })
    }
  }
}
