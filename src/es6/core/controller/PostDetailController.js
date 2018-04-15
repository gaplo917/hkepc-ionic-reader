/**
 * Created by Gaplo917 on 11/1/2016.
 */
//import * as cheerio from 'cheerio';
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {XMLUtils} from '../../utils/xml'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest, PostDetailRefreshRequest, CommonInfoExtractRequest} from "../model/requests"

import * as _ from 'lodash'
import * as Controllers from "./index"
import swal from 'sweetalert2'

const cheerio = require('cheerio')
const uuid = require('uuid-v4');

export class PostDetailController{
  static get STATE() { return 'tab.topics-posts-detail'}
  static get NAME() { return 'PostDetailController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/posts/:postId/page/:page?delayRender=&focus=',
    views: {
      'main': {
        templateUrl:  'templates/post-detail.html',
        controller:   PostDetailController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx,$timeout, $ionicPopup, $rootScope, $compile) {
    this.scope = $scope
    this.rx = rx
    this.messageService = MessageService
    this.state = $state
    this.location = $location
    this.sce = $sce
    this.ionicHistory = $ionicHistory
    this.ionicModal = $ionicModal
    this.ionicPopover = $ionicPopover
    this.ionicPopup = $ionicPopup
    this.ngToast = ngToast
    this.authService = AuthService
    this.ionicScrollDelegate = $ionicScrollDelegate.$getByHandle('post-detail')
    this.LocalStorageService = LocalStorageService
    this.ionicActionSheet = $ionicActionSheet
    this.apiService = apiService
    this.$timeout = $timeout
    this.compile = $compile
    this.isAutoLoadImage = true

    this.messages = []
    this.postUrl = URLUtils.buildUrlFromState($state,$stateParams)
    this.currentUsername = undefined

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html', {
      scope: $scope
    }).then((popover) => {
      this.pageSliderPopover = popover
    })

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.pageSliderPopover.remove()
      if(this.postTaskSubscription) this.postTaskSubscription.dispose()
      this.deregisterReportModal()
    })

    $scope.$eventToObservable('lastread')
      .throttle(500)
      .doOnNext(([event,{ page, id }]) => {
        console.log("received broadcast lastread",page, id)
        const postId = id.replace('message-','')

        this.lastFocus = postId

        this.LocalStorageService.setObject(`${this.topicId}/${this.postId}/lastPosition`,{
          page: page,
          postId: postId
        })
      })
      .map(([event,{ page, id }]) => page)
      .distinctUntilChanged()
      .safeApply($scope, page => {
        this.currentPage = page
      })
      .subscribe()

    // to control the post is end
    this.end = false;

    // add action

    $scope.$on('$ionicView.loaded', (e) => {
      this.topicId = $stateParams.topicId
      this.postId = $stateParams.postId
      this.delayRender = $stateParams.delayRender ? parseInt($stateParams.delayRender) : -1
      this.focus = $stateParams.focus
      this.currentPage = $stateParams.page

      // check to see if from a focus request
      if(!this.focus){
        // if not , jump to last reading page position
        this.rx.Observable.combineLatest(
          this.LocalStorageService.getObject(`${this.topicId}/${this.postId}/lastPosition`),
          this.LocalStorageService.get('loadImageMethod'),
          (lastPosition, loadImageMethod) => {
            return {lastPosition, loadImageMethod}
          }
        )
          .safeApply(this.scope, ({lastPosition, loadImageMethod}) => {
            console.log("loadImageMethod from db", loadImageMethod)

            const _lastPosition = lastPosition || {}
            const lastPage = _lastPosition.page || $stateParams.page
            const lastPostId = _lastPosition.postId || $stateParams.focus

            this.currentPage = lastPage
            this.focus = lastPostId
            this.isAutoLoadImage = loadImageMethod !== 'block'

            this.loadMessages()
          })
          .subscribe()
      }
      else {
        this.LocalStorageService.get('loadImageMethod').safeApply(this.scope, loadImageMethod => {
          console.log("loadImageMethod from db", loadImageMethod)
          this.isAutoLoadImage = loadImageMethod !== 'block'

          this.loadMessages()
        }).subscribe()
      }


      // best effort to get it first
      this.authService.getUsername()
        .filter(username => username != undefined)
        .safeApply($scope, username => {
          this.currentUsername = username
        }).subscribe()

    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.leaveView = true
    })
    $scope.$on('$ionicView.enter', (e) => {
      if(this.leaveView){
        this.loadMessages('silent')
        this.leaveView = false
      }
    })


  }

  loadMore(){
    if(!this.end){
      //update the page count
      this.currentPage = parseInt(this.currentPage) + 1

      this.loadMessages()
    }
  }

  forceLoadMore(){
    this.end = false
  }


  /**
   *
   * @param style 'previous' or 'next'
   */
  loadMessages(style = 'next', page = this.currentPage){

    if(this.refreshing) return

    this.refreshing = true

    this.postTaskSubscription && this.postTaskSubscription.dispose()

    this.postTaskSubscription = this.apiService.postDetails({
      topicId: this.topicId,
      postId: this.postId,
      page: page,
      orderType: this.reversePostOrder ? 1 : 0,
      filterOnlyAuthorId: this.filterOnlyAuthorId,
      isAutoLoadImage: this.isAutoLoadImage
    })
      .flatMap((post) => {
        return this.authService.getUsername().map((username) => {
          return {
            post: post,
            username: username
          }
        })
      })
      .safeApply(this.scope, ({post, username}) => {
      console.debug(post)

      this.post = post

      this.totalPageNum = post.totalPageNum
      this.isLock = post.isLock

      post.messages.forEach(message => {
        this.messageService.isLikedPost(message).subscribe(isLiked => {
          message.liked = isLiked
        })

        message.isSelf = (username == message.author.name)

        // delayRender == -1 => not from find message
        message.focused = this.delayRender != -1 && message.id == this.focus

      })

      if(page > this.totalPageNum){
        page = this.totalPageNum

        // maybe have duplicate message
        const messageIds = this.messages.map(_ => _.id)
        const filtered = post.messages.filter(msg => {
          return messageIds.indexOf(msg.id) == -1
        })

        this.messages = this.messages.concat(filtered)

      } else {
        if(style == 'previous'){
          const messageIds = this.messages.map(_ => _.id)
          const filtered = post.messages.filter(msg => {
            return messageIds.indexOf(msg.id) == -1
          })

          const nextFocusId = `divider-previous-${page}`

          // add on the top
          this.messages.unshift({
            id: nextFocusId,
            post: { page: parseInt(page) + 1 },
            type: 'POST_PAGE_DIVIDER',
            content:`<i class="ion-android-arrow-up"></i> 上一頁加載完成 <i class="ion-ios-checkmark-outline" ></i>`,
          })

          this.messages = filtered.concat(this.messages)

          this.messages.unshift({
            id:`divider-${page}`,
            post: { page: page },
            type: 'POST_PAGE_DIVIDER',
          })

          // focus one the finish loading previous message
          this.focus = nextFocusId

        } else if (style === 'silent') {

          // slient update the content only
          for(let i = 0; i < this.messages.length; i ++){
            for(let j = 0; j < post.messages.length; j ++){
              if(this.messages[i].id == post.messages[j].id && this.messages[i].pstatus !== post.messages[j].pstatus){
                this.messages[i].content = post.messages[j].content
              }

            }
          }

          // maybe have new post, filter duplicate and concat new post to tail
          const messageIds = this.messages.map(_ => _.id)
          const filtered = post.messages.filter(msg => messageIds.indexOf(msg.id) === -1)

          if(filtered.length > 0){
            this.messages = this.messages.concat(filtered)
          }
        }
        else {
          // normal style (next)

          this.messages.push({
            post: { page: page },
            type: 'POST_PAGE_DIVIDER'
          })

          const messageIds = this.messages.map(_ => _.id)
          const filtered = post.messages.filter(msg => {
            return messageIds.indexOf(msg.id) == -1
          })

          this.messages = this.messages.concat(filtered)
        }
      }

      this.$timeout(() => {
        this.scope.$broadcast('scroll.infiniteScrollComplete')
        swal.close()
      })

      this.refreshing = false
      this.loadingPrevious = false
      this.end = page >= this.totalPageNum
      this.currentPage = page

      if(this.focus){
        this.$timeout(() => {
          console.debug('detected focus object')
          const focusPosition = angular.element(document.querySelector(`#message-${this.focus}`)).prop('offsetTop')
          console.log("ready to scroll to ",document.querySelector(`#message-${this.focus}`), focusPosition)

          this.$timeout(() => {
            this.ionicScrollDelegate.scrollTo(0,focusPosition)
          })

          this.focus = undefined

        })
      }
    }).subscribe()

  }

  like(message){
    console.log('like',message)

    if(message.liked){
      this.messageService.remove(message)
      message.liked = false
    }
    else {
      this.messageService.add(message)
      message.liked = true
    }

  }

  reset(){
    this.messages = []
    this.postTaskSubscription && this.postTaskSubscription.dispose()
    this.end = false

  }

  doRefresh(){
    this.reset()
    this.loadMessages()
  }

  onQuickReply(post){
    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      if(isLoggedIn){

        const reply = {
          id : null,
          postId: this.postId,
          topicId: post.topicId,
          type: 1 // default to use quote
        }

        const message = {
          post:{
            id: this.postId,
            topicId: this.topicId,
            title: post.title,
          },
        }

        this.state.go(Controllers.WriteReplyPostController.STATE, {
          topicId: this.topicId,
          postId: this.postId,
          page: this.currentPage,
          message: JSON.stringify(message),
          reply: JSON.stringify(reply)
        })

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>`)
      }
    }).subscribe()
  }
  onReply(message){
    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      if(isLoggedIn){
        if(this.isLock) {
          this.ngToast.danger(`<i class="ion-alert-circled"> 主題已被封鎖，無法回覆！</i>`)
          return
        }
        const reply = {
          id : message.id,
          postId: message.post.id,
          topicId: message.post.topicId,
          type: 3 // default to use quote
        }

        this.state.go(Controllers.WriteReplyPostController.STATE, {
          topicId: this.topicId,
          postId: this.postId,
          page: this.currentPage,
          message: JSON.stringify(message),
          reply: JSON.stringify(reply)
        })

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>`)
      }
    }).subscribe()

  }

  onReport(message){
    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      if(isLoggedIn){
        this.registerReportModal().then(reportModal => {
          reportModal.message = message

          reportModal.report = {}

          reportModal.show()
        })

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 舉報需要會員權限，請先登入！</i>`)
      }
    }).subscribe()

  }

  onEdit(message){

    this.state.go(Controllers.EditPostController.STATE, {
      topicId: this.topicId,
      postId: this.postId,
      page: this.currentPage,
      message: JSON.stringify(message),
    })
  }

  registerReportModal(){
    if(this.scope.reportModal) return Promise.resolve(this.scope.reportModal)

    const reportModal = this.scope.reportModal = this.scope.$new()
    reportModal.show = () => this.reportModal.show()
    reportModal.hide = () => this.reportModal.hide()
    reportModal.doReport = (message,report) => {

      console.log(JSON.stringify(report))

      if(report.content){
        console.log(HKEPC.forum.reportPage(message.post.topicId,message.post.id,message.id))
        // get the form hash first
        this.apiService.reportPage(message.post.topicId,message.post.id,message.id)
            .safeApply(this.scope, (resp) => {
              let $ = cheerio.load(resp.data)
              const relativeUrl = $('#postform').attr('action')
              const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

              console.log(postUrl)

              let formSource = cheerio.load($('#postform').html())

              // the text showing the effects of reply / quote
              const preText = formSource('#e_textarea').text()


              const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
                const k = formSource(elem).attr('name')
                const v = formSource(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              // build the report message
              const reportMessage = `${preText}\n${report.content}`

              const postData = [
                `message=${encodeURIComponent(reportMessage)}`,
                hiddenFormInputs.join('&')
              ].join('&')

              // Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 你的舉報已發送到 HKEPC！</i>`)

                this.reportModal.hide()

              })

            }).subscribe()
      }
      else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 內容不能空白！</i>`)
      }


    }

    return this.ionicModal.fromTemplateUrl('templates/modals/report-post.html', {
      scope: reportModal
    }).then((modal) => {
      this.reportModal = modal
      return Promise.resolve(reportModal)
    })
  }

  deregisterReportModal(){
    this.reportModal && this.reportModal.remove()
  }

  openPageSliderPopover($event) {
    this.inputPage = this.currentPage
    this.pageSliderPopover.show($event)
  }

  doLoadPreviousPage(){
    const minPageNum = Math.min(...this.messages.map(msg => msg.post.page))

    this.inputPage = minPageNum == 1 ? 1 : minPageNum - 1

    const spinnerHtml = `
          <div>
              <div class="text-center">加載上一頁中</div>
          </div>
        `

    swal({
      html: spinnerHtml,
      allowOutsideClick: false,
      showCancelButton: false,
      showConfirmButton: false,
      animation: false
    })

    swal.showLoading()

    this.$timeout(() => {
      this.currentPage = minPageNum
      this.doJumpPage()
    },400)

  }

  doJumpPage(){
    this.pageSliderPopover.hide()

    if(this.inputPage == this.currentPage - 1){
      this.loadingPrevious = true
      this.loadMessages('previous', this.inputPage)

    } else {
      this.reset()
      this.loadMessages('next', this.inputPage)
    }

  }

  findMessage(postId,messageId){
    console.log(`findMessage(${postId},${messageId})`)
    this.scope.$emit(FindMessageRequest.NAME,new FindMessageRequest(postId,messageId))
  }


  onBack(){
    if(this.ionicHistory.viewHistory().currentView.index !== 0){
      this.ionicHistory.goBack()

    }
    else {
      this.ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true

      })
      this.state.go(Controllers.PostListController.STATE,{
        topicId: this.topicId,
        page: 1
      })
    }
  }

  parseInt(i){
    return parseInt(i)
  }

  getTimes(i){
    return new Array(parseInt(i))
  }

  relativeMomentize(dateStr){
    const momentDate = moment(dateStr)

    if(momentDate.diff(new Date(),'days') >= -3 ){
      return momentDate.fromNow()
    } else {
      return dateStr
    }
  }

  onUserProfilePic(author){

    this.authService.isLoggedIn().safeApply(this.scope, isLoggedIn => {
      if(isLoggedIn){
        this.state.go(Controllers.UserProfileController.STATE,{
          author: JSON.stringify(author),
        })

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 查看會員需要會員權根，請先登入！</i>`)
      }
    }).subscribe()

  }

  onMore(message){
    // Show the action sheet
    var hideSheet = this.ionicActionSheet.show({
      buttons: [
        { text: '開啟 HKEPC 原始連結' },
        { text: `${this.reversePostOrder ? '關閉' : '開啟'}倒轉看帖` },
        { text: `${this.filterOnlyAuthorId ? '關閉' : '開啟'}只看 ${message.author.name} 的帖` },
        { text: `關注此主題的新回覆` },
        { text: `收藏此主題` },
        { text: `舉報` },
      ],
      titleText: '更多功能',
      cancelText: '取消',
      cancel: () => {
        // add cancel code..
        hideSheet()
        return true
      },
      buttonClicked: (index) => {
        if(index == 0){
          window.open(HKEPC.forum.findMessage(message.post.id, message.id))
        } else if(index == 1){
          this.reversePostOrder = !this.reversePostOrder
          if(this.reversePostOrder) this.ngToast.success(`<i class="ion-ios-checkmark"> 已開啟倒轉看帖功能！</i>`)
          else this.ngToast.success(`<i class="ion-ios-checkmark"> 已關閉倒轉看帖功能！</i>`)

          this.doRefresh()
        } else if(index == 2){
          this.filterOnlyAuthorId = this.filterOnlyAuthorId == undefined ? message.author.uid : undefined
          if(this.filterOnlyAuthorId !== undefined) this.ngToast.success(`<i class="ion-ios-checkmark"> 只看 ${message.author.name} 的帖！</i>`)
          else this.ngToast.success(`<i class="ion-ios-checkmark"> 已關閉只看 ${message.author.name} 的帖！</i>`)

          this.doRefresh()
        } else if(index == 3){
          this.apiService.subscribeNewReply(this.postId).safeApply(this.scope, () => {
            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功關注此主題，你將能夠接收到新回覆的通知！</i>`)
          }).subscribe()
        } else if(index == 4){
          this.apiService.addFavPost(this.postId).safeApply(this.scope, () => {
            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功收藏此主題！</i>`)
          }).subscribe()
        } else if(index == 5) {
          this.onReport(message)
        }
        return true;
      },
      destructiveButtonClicked: (index) => {
        return true
      }
    })

  }

  loadLazyImage(uid, imageSrc) {
    const image = document.getElementById(uid)
    const $element = angular.element(image)

    if(image.getAttribute('src') === imageSrc){
      window.open(imageSrc, '_system', 'location=yes')
    }
    else {
      // hide the image
      image.setAttribute('style', "display: none")
      const loader = this.compile(`
          <div class='image-loader-container'>
              <ion-spinner class='image-loader' icon='${image.getAttribute('image-lazy-loader')}'/>
          </div>
      `)(this.scope)

      $element.after(loader)

      const bgImg = new Image()

      bgImg.onload = function () {
        loader.remove()
        image.setAttribute('src', imageSrc)
        image.removeAttribute('style')
      }
      bgImg.onerror = function () {
        loader.remove()
        image.removeAttribute('style')
        // reproduce the error state
        image.onerror()
      }

      bgImg.src = imageSrc

    }
  }

  openImage(uid, imageSrc) {
    window.open(imageSrc, '_system', 'location=yes')
  }
}
