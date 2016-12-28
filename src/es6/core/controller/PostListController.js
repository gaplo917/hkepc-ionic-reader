/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {GeneralHtml} from '../model/general-html'
import {CommonInfoExtractRequest} from '../model/CommonInfoExtractRequest'
import {PushHistoryRequest} from '../model/PushHistoryRequest'
import * as Controllers from './index'

const cheerio = require('cheerio')
const async = require('async')
const moment = require('moment')
require('moment/locale/zh-tw');

export class PostListController {
  static get STATE() { return 'tab.topics-posts'}
  static get NAME() { return 'PostListController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/page/:page',
    views: {
      'tab-topics': {
        templateUrl: 'templates/topic-posts.html',
        controller: PostListController.NAME,
        controllerAs: 'vm'
      }
    }
  }}
  constructor($scope,$http,$state,$stateParams,$location,$ionicScrollDelegate,$ionicSlideBoxDelegate,$ionicHistory,$ionicPopover,LocalStorageService,$ionicModal,ngToast,$q, apiService, rx) {
    this.scope = $scope
    this.http = $http
    this.state = $state
    this.location = $location
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.ionicHistory = $ionicHistory
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.localStorageService = LocalStorageService
    this.ngToast = ngToast
    this.q = $q
    this.apiService = apiService
    this.rx = rx

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []
    this.categories = []
    this.slidePages = [{},{},{}]
    this.currentIndex = 0
    this.currentPageNum = this.page - 1
    this.showSpinner = true
    this.newPostModal = {}
    this.canSwipeBack = true

    const newPostModal = this.scope.newPostModal = $scope.$new()
    newPostModal.id = "new-content"
    newPostModal.post = {}

    newPostModal.hide = () => this.newPostModal.hide()
    newPostModal.show = () => {
      console.log(this.categories)
      newPostModal.categories = this.categories
      this.newPostModal.show()
    }
    newPostModal.openCategoryPopover = ($event) => {
      newPostModal.categoryPopover.show($event)
    }

    newPostModal.selectCategory = (category) => {
      newPostModal.categoryPopover.hide()
      newPostModal.post.category = category
    }

    newPostModal.initialize = (topic) => {
      newPostModal.topic = topic

      this.http.get(HKEPC.forum.newPost(this.topicId))
        .then(resp => {
          let $ = cheerio.load(resp.data)

          const relativeUrl = $('#postform').attr('action')
          const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

// ---------- Upload image preparation ----------------------------------------------
          let imgattachform = $('#imgattachform')
          let attachFormSource = cheerio.load(imgattachform.html())

          const hiddenAttachFormInputs = {}

          hiddenAttachFormInputs['action'] = `${HKEPC.baseForumUrl}/${imgattachform.attr('action')}`

          attachFormSource(`input[type='hidden']`).map((i,elem) => {
            const k = attachFormSource(elem).attr('name')
            const v = attachFormSource(elem).attr('value')

            return hiddenAttachFormInputs[k] = encodeURIComponent(v)
          }).get()

          // assign hiddenAttachFormInputs to modal
          newPostModal.hiddenAttachFormInputs = hiddenAttachFormInputs
          newPostModal.images = []

          newPostModal.onImageUpload = (image) => {
            console.log("onImageUplod",image)
            newPostModal.images.push(image)
          }

// ---------- End of Upload image preparation -----------------------------------------------

          newPostModal.doPublishNewPost = (post) => {
            console.log('do publist new post')

            const isValidInput = post.title && post.content
            const hasChoosenPostType =
                    (post.category.id && newPostModal.categories.length > 0) ||
                    newPostModal.categories.length == 0

            if(isValidInput && hasChoosenPostType){

              const hiddenFormInputs = $(`input[type='hidden']`).map((i,elem) => {
                const k = $(elem).attr('name')
                const v = $(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              console.log(hiddenFormInputs)

              const ionicReaderSign = HKEPC.signature()

              const subject = post.title
              const replyMessage = `${post.content}\n\n${ionicReaderSign}`
              const undefinedFilter = /.*=undefined$/i
              const postData = [
                `subject=${encodeURIComponent(subject)}`,
                `message=${encodeURIComponent(replyMessage)}`,
                `typeid=${post.category.id}`,
                `handlekey=newthread`,
                `topicsubmit=true`,
                hiddenFormInputs.join('&'),
                newPostModal.images.map(_ => _.formData).join('&')
              ].filter(e => !undefinedFilter.test(e))
                .join('&')

              //Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈主題！</i>`)

                newPostModal.hide()

                this.doRefresh()

              })

            } else if(hasChoosenPostType) {
              this.ngToast.danger(`<i class="ion-alert-circled"> 標題或內容不能空白！</i>`)
            } else {
              this.ngToast.danger(`<i class="ion-alert-circled"> 必須選擇新帖分類！</i>`)
            }
          }


        })
    }


    $ionicModal.fromTemplateUrl('templates/modals/new-post.html', {
      scope: newPostModal
    }).then((modal) => {
      this.newPostModal = modal

      $ionicPopover.fromTemplateUrl('templates/modals/categories.html', {
        scope: newPostModal
      }).then((popover) => {
        newPostModal.categoryPopover = popover;
      })

    })

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/sub-forums.html', {
      scope: $scope
    }).then((popover) => {
      this.subTopicListPopover = popover
    })

    $ionicPopover.fromTemplateUrl('templates/modals/filter-order.html', {
      scope: $scope
    }).then((popover) => {
      this.filterOrderPopover = popover
    })

    $scope.openPopover = ($event) => {
      if(this.subTopicList && this.subTopicList.length > 0){
        this.subTopicListPopover.show($event)
      }
    }

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.subTopicListPopover.remove()
      this.newPostModal.remove()
    })

    $scope.$on('$ionicView.loaded', (e) => {
    })

    $scope.$on('$ionicView.enter', (e) => {
      // stringify and compare to string value
      this.localStorageService.get('showSticky',true).subscribe(data => {
        console.log("showSticky",data)
        this.showSticky = String(data) == 'true'
      })

      this.filter = undefined
      this.order = undefined

      this.rx.Observable.timer(100).flatMap(this.loadMore()).subscribe()

    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
    })
  }

  loadMore(cb){
    const nextPage = this.currentPageNum + 1

    return this.apiService.postListPage({
      topicId: this.topicId,
      pageNum: nextPage,
      filter : this.filter,
      order: this.order,
      searchId: this.searchId
    })
      .do(resp => {
        this.searchId = resp.searchId
        // only extract the number
        this.totalPageNum = resp.totalPageNum

        this.subTopicList =  resp.subTopicList

        this.categories = resp.categories

        // push into the array
        this.pages.push({
          posts: resp.posts,
          num: resp.pageNum
        })

        if(this.currentIndex == 0){
          this.slidePages[0] = this.pages[0]
        }

        this.topic = {
          id: this.topicId,
          name: resp.topicName
        }
      })
  }

  updateUI(){
    this.ionicSlideBoxDelegate.update()
    this.scope.$apply()
  }

  reset(){
    this.pages = []
    this.slidePages = [{},{},{}]
    this.ionicSlideBoxDelegate.slide(0,10)
    this.currentIndex = 0
    this.currentPageNum = 0
    this.showSpinner = true
    this.ionicSlideBoxDelegate.$getByHandle(`posts-slidebox-${this.topicId}`)._instances[0].loop(true)
  }

  doRefresh(){
    this.reset()
    if(this.filter) {
      const category = this.categories.find(e => e.id == this.filter)
      if(category){
        this.ngToast.success(`<i class="ion-ios-checkmark-outline"> 正在使用分類 - #${category.name} </i>`)
      }
    }
    this.loadMore().subscribe()
  }

  onSlideChanged(index){
    if(this.slidePages.length == 0) return 0

    this.showSpinner = true

    //scroll to the hash tag
    this.location.hash(`ionic-slide-box`)
    this.ionicScrollDelegate.scrollTop(false)

    // clear the model first
    //this.slidePages[index] = []

    this.rx.Observable.timer(100)
      .subscribe(() => {
        const diff = this.currentIndex - index
        const pagesNums = this.pages.map(p => p.num)
        this.currentPageNum = this.slidePages[this.currentIndex].num
        this.ionicSlideBoxDelegate.$getByHandle(`posts-slidebox-${this.topicId}`)._instances[0].loop(true)
        this.canSwipeBack = false

        if(diff == 1 || diff == -2){

          if(this.currentPageNum ==  1 || (this.currentIndex == 1 && this.currentPageNum == 2)) {
            // disable the does-continue if the it is the initial page
            this.ionicSlideBoxDelegate.$getByHandle(`posts-slidebox-${this.topicId}`)._instances[0].loop(false)
            this.canSwipeBack = true
          }

          // previous page, i.e.  2 -> 1 , 1 -> 0 , 0 -> 2
          const smallestPageNum = Math.min.apply(Math, pagesNums)

          if(this.currentPageNum > smallestPageNum){
            console.log("default previous page")
            this.slidePages[index] = this.pages.find(page => page.num == this.currentPageNum - 1)

            // prefetch for better UX
            const prefetchSlideIndex = index - 1 < 0 ? 2 : index - 1
            this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum - 2)

          } else {
            console.log("loadMore Before()")
          }
        }
        else{
          // next page
          const largestPageNum = Math.max.apply(Math, pagesNums)

          if(this.currentPageNum == this.totalPageNum){

            this.ngToast.warning("已到最後一頁！")
            // scroll back the previous slides
            this.ionicSlideBoxDelegate.previous()
          }
          if(this.currentPageNum >= largestPageNum){
            console.log("loadMore After()")
            this.slidePages[index] = []
            this.loadMore().subscribe(() => {
              const len = this.pages.length -1
              const nextPage = Math.floor(len / 3) * 3 + index
              this.slidePages[this.currentIndex] = this.pages[nextPage - 1]
              this.slidePages[index] = this.pages[nextPage]

              // prefetch for better UX
              const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
              this.slidePages[prefetchSlideIndex] = []
            })

          }
          else{
            console.log("default next page")
            this.slidePages[index] = this.pages.find(p => p.num == this.currentPageNum + 1)

            // prefetch for better UX
            const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
            this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum + 2)
          }

        }

        this.currentIndex = index
        this.updateUI()
      })

    console.log(`onSlideChanged${index}`)
  }


  goToSubTopic(index,subTopic){
    this.subTopicListPopover.hide();

    // swap the item in the list
    this.subTopicList[index] = this.topic
    this.topic = subTopic

    // override the topic id
    this.topicId = subTopic.id

    this.doRefresh()
  }

  saveShowSticky(bool) {
    this.localStorageService.set('showSticky',bool)
  }

  doNewPost(topic){
    const newPostModal = this.scope.newPostModal
    newPostModal.initialize(topic)
    newPostModal.show()

  }
  doFilterOrder($event){
    this.filterOrderPopover.show($event)
  }

  onBack(){
    const history = this.ionicHistory.viewHistory()
    if(history.backView && history.backView.stateName == Controllers.TopicListController.STATE){
      this.ionicHistory.goBack()
    } else {
      this.state.go(Controllers.TopicListController.STATE)
    }
  }

  onGoToPost(post){
    this.scope.$emit(PushHistoryRequest.NAME, new PushHistoryRequest(post))
  }

  hasStickyPost(posts) {
    return posts && posts.filter(post => post.isSticky).length > 0
  }

  relativeMomentize(dateStr){
    if(moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(),'days') >= -3 ){
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  swipeLeft(){
    if(this.canSwipeBack){
      this.onBack()
    }
  }
}
