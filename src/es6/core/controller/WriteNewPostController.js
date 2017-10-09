import * as HKEPC from '../../data/config/hkepc'
import * as Controllers from './index'
import {XMLUtils} from '../../utils/xml'
import * as _ from "lodash";

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
  constructor($scope,$state,$stateParams,$ionicHistory,$ionicPopover,ngToast, apiService) {
    this.id = "new-content"
    this.post = { content: "" }
    this.topicId = $stateParams.topicId
    this.apiService = apiService
    this.scope = $scope
    this.ngToast = ngToast
    this.state = $state
    this.ionicHistory = $ionicHistory

    this.topic = JSON.parse($stateParams.topic)
    this.categories = JSON.parse($stateParams.categories)

    console.log("write new post ", this.topic)
    console.log("write new post ", this.categories)


    $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
      scope: $scope
    }).then((popover) => {
      this.categoryPopover = popover;
    })

    apiService.preNewPost(this.topicId)
      .subscribe(resp => {
        let $ = cheerio.load(resp.data)

        const relativeUrl = $('#postform').attr('action')
        this.postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

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
        this.images = []

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

        this.images.forEach(img => {
          imageFormData[img.formData] = ""
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
            ...imageFormData
          },
          headers : {'Content-Type':'application/x-www-form-urlencoded'}
        }).safeApply(this.scope, (resp) => {
          const responseText = cheerio.load(XMLUtils.removeCDATA(resp.data),{xmlMode:true}).html()
          const isNewPostSuccess = _.includes(responseText, '主題已經發佈')

          if(isNewPostSuccess){
            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)
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

  onImageUpload(image){
    console.log("onImageUplod",image)
    this.post.content = `${this.post.content}\n[attachimg]${image.id}[/attachimg]`
    this.images.push(image)
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