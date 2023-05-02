import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import * as _ from 'lodash'
import swal from 'sweetalert2'
import { Bridge } from '../bridge/Bridge'

export class WriteNewPostController {
  static get STATE () { return 'tab.topics-posts-new' }

  static get NAME () { return 'WriteNewPostController' }

  static get CONFIG () {
    return {
      url: '/topics/:topicId/newPost?categories=&topic=',
      cache: false,
      views: {
        main: {
          templateUrl: 'templates/write-new-post.html',
          controller: WriteNewPostController.NAME,
          controllerAs: 'vm'
        }
      }
    }
  }

  constructor ($scope, $state, $stateParams, $ionicHistory, $ionicPopover, ngToast, apiService, $ionicPopup, $rootScope, $compile, LocalStorageService, $ionicScrollDelegate) {
    this.id = 'new-content'
    this.post = { content: '' }
    this.topicId = $stateParams.topicId
    this.apiService = apiService
    this.scope = $scope
    this.rootScope = $rootScope
    this.ngToast = ngToast
    this.state = $state
    this.ionicHistory = $ionicHistory
    this.topic = JSON.parse($stateParams.topic)
    this.categories = JSON.parse($stateParams.categories)
    this.compile = $compile
    this.ionicScrollDelegate = $ionicScrollDelegate.$getByHandle('edit')

    this.deleteImageIds = []
    this.attachImageIds = []
    this.existingImages = []
    this.ionicPopup = $ionicPopup

    console.log('write new post ', this.topic)
    console.log('write new post ', this.categories)

    $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
      scope: $scope
    }).then((popover) => {
      this.categoryPopover = popover
    })

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
    return this.apiService.preNewPost(this.topicId)
      .safeApply(this.scope, resp => {
        const {
          actionUrl,
          hiddenFormInputs,
          existingImages,
          hiddenAttachFormInputs
        } = resp

        this.actionUrl = actionUrl

        // assign hiddenAttachFormInputs to modal
        this.hiddenAttachFormInputs = hiddenAttachFormInputs
        this.existingImages = existingImages

        this.hiddenFormInputs = hiddenFormInputs
      })
  }

  doPublishNewPost (post) {
    const isValidInput = post.title && post.content

    if (isValidInput) {
      const { actionUrl, hiddenFormInputs, ionicReaderSign } = this

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

      const subject = post.title
      const replyMessage = `${post.content}\n\n${ionicReaderSign}`

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
          subject: subject,
          message: replyMessage,
          typeid: _.get(post, 'category.id', undefined),
          handlekey: 'newthread',
          topicsubmit: true,
          ...hiddenFormInputs,
          ...imageFormData,
          ...deleteImageFormData
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }).flatMapApiFromCheerioworker('responseContainText', { text: '主題已經發佈', isXml: true })
        .safeApply(this.scope, ({ responseText, result }) => {
          if (result) {
            swal.close()

            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)

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
    } else {
      this.ngToast.danger(`<i class="ion-alert-circled"> 標題或內容不能空白！</i>`)
    }
  }

  addImageToContent (existingImage) {
    const attachmentId = existingImage.id
    const selectorId = this.id
    const selectionStart = document.getElementById(selectorId).selectionStart
    const content = document.getElementById(selectorId).value
    const splits = [content.slice(0, selectionStart), content.slice(selectionStart)]

    this.post.content = `${splits[0]}[attachimg]${attachmentId}[/attachimg]\n${splits[1]}`
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

        this.post.content = _.replace(this.post.content, id, '')
        this.post.content = _.replace(this.post.content, '[attachimg][/attachimg]', '')
        setTimeout(() => this.scope.$apply(), 0)
      }
    })
  }

  openCategoryPopover ($event) {
    this.categoryPopover.show($event)
  }

  selectCategory (category) {
    this.categoryPopover.hide()
    this.post.category = category
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
      this.state.go(Controllers.TopicListController.STATE)
    }
  }
}
