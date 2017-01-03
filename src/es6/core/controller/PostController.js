/**
 * Created by Gaplo917 on 11/1/2016.
 */
//import * as cheerio from 'cheerio';
import * as HKEPC from '../../data/config/hkepc'
import * as URLUtils from '../../utils/url'
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/FindMessageRequest"
import {CommonInfoExtractRequest} from "../model/CommonInfoExtractRequest"

import * as Controllers from "./index"
import { Clipboard } from 'ionic-native';

const cheerio = require('cheerio')

export class PostController{
  static get STATE() { return 'tab.topics-posts-detail'}
  static get NAME() { return 'PostController'}
  static get CONFIG() { return {
    url: '/topics/:topicId/posts/:postId/page/:page?delayRender=&focus=',
    views: {
      'tab-topics': {
        templateUrl: 'templates/post-detail.html',
        controller: PostController.NAME,
        controllerAs: 'vm'
      }
    }
  }}

  constructor($scope,$http, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx,$timeout) {
    this.scope = $scope
    this.http = $http
    this.rx = rx
    this.messageService = MessageService
    this.state = $state
    this.location = $location
    this.sce = $sce
    this.ionicHistory = $ionicHistory
    this.ionicModal = $ionicModal
    this.ionicPopover = $ionicPopover
    this.ngToast = ngToast
    this.authService = AuthService
    this.ionicScrollDelegate = $ionicScrollDelegate
    this.LocalStorageService = LocalStorageService
    this.ionicActionSheet = $ionicActionSheet
    this.apiService = apiService
    this.authService = AuthService
    this.$timeout = $timeout


    this.messages = []
    this.postUrl = URLUtils.buildUrlFromState($state,$stateParams)
    this.currentUsername = undefined

    AuthService.getUsername().subscribe(username => {
      this.currentUsername = username
    })


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
      this.deregisterReplyModal()
      this.deregisterReportModal()
      this.deregisterEditModal()
      this.deregisterUserProfileModal()
    })
    // Execute action on hide popover
    $scope.$on('popover.hidden', () => {
      // Execute action
    })
    // Execute action on remove popover
    $scope.$on('popover.removed', () => {
      // Execute action
    })

    $scope.$on('lastread', (event,{ page, id }) => {

      console.log("received broadcast lastread",page, id)
      this.currentPage = page

      $scope.$applyAsync()

      this.LocalStorageService.setObject(`${this.topicId}/${this.postId}/lastPosition`,{
        page: page,
        postId: id.replace('message-','')
      })

    })

    // to control the post is end
    this.end = false;

    // add action

    $scope.$on('$ionicView.loaded', (e) => {
      this.topicId = $stateParams.topicId
      this.postId = $stateParams.postId
      this.delayRender = $stateParams.delayRender ? parseInt($stateParams.delayRender) : -1
      this.focus = $stateParams.focus

      // Last reading page position
      this.LocalStorageService.getObject(`${this.topicId}/${this.postId}/lastPosition`)
        .map(data => data || {})
        .subscribe(data => {
          console.log("last page ", data)
          const lastPage = data.page
          const lastPostId = data.postId

          this.page = lastPage || $stateParams.page
          this.currentPage = this.page
          this.focus = lastPostId || $stateParams.focus

          setTimeout(() => this.loadMessages(), 100)
      })

    })

    $scope.$on('$ionicView.enter', (e) => {

      // register reply modal
      this.registerReplyModal()

      // register report modal
      this.registerReportModal()

      //register edit message modal
      this.registerEditMessageModal()

      this.registerUserProfileModal()
    })

  }

  loadMore(){
    if(!this.end){
      //update the page count
      this.page = parseInt(this.page) + 1

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
  loadMessages(style = 'next', page = this.page){

    if(this.refreshing) return

    this.refreshing = true

    this.postTaskSubscription && this.postTaskSubscription.dispose()

    this.postTaskSubscription = this.apiService.postDetails({
      topicId: this.topicId,
      postId: this.postId,
      page: page,
      orderType: this.reversePostOrder ? 1 : 0,
      filterOnlyAuthorId: this.filterOnlyAuthorId
    }).safeApply(this.scope, post => {
      console.debug(post)

      this.post = post

      this.totalPageNum = post.totalPageNum
      this.isLock = post.isLock

      post.messages.forEach(message => {
        this.messageService.isLikedPost(message).subscribe(isLiked => {
          message.liked = isLiked
        })

        // delayRender == -1 => not from find message
        message.focused = this.delayRender != -1 && message.id == this.focus

        this.authService.getUsername().subscribe(username => {
          message.author.isSelf = message.author.name == username
        })
      })

      if(page >= this.totalPageNum){
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

        } else {

          this.scope.$broadcast('scroll.infiniteScrollComplete')

          this.messages.push({
            post: { page: page },
            type: 'POST_PAGE_DIVIDER'
          })
          this.messages = this.messages.concat(post.messages)
        }
      }

      this.refreshing = false
      this.loadingPrevious = false
      this.end = page >= this.totalPageNum
      this.page = page

      if(this.focus){
        this.$timeout(() => {
          console.debug('detected focus object')
          const focusPosition = angular.element(document.querySelector(`#message-${this.focus}`)).prop('offsetTop')
          console.log("ready to scroll to ",document.querySelector(`#message-${this.focus}`), focusPosition)

          this.$timeout(() =>{
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

  onSwipeRight(){
    this.ionicHistory.goBack();
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
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if(isLoggedIn){
        const replyModal = this.scope.replyModal

        const message = {
          post: post
        }

        const reply = {
          id : undefined,
          postId: post.id,
          topicId: post.topicId,
          type: 1 // default to use quote
        }

        replyModal.initialize(message, reply)

        replyModal.show()

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>`)
      }
    })

  }

  onReply(message){
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if(isLoggedIn){
        const replyModal = this.scope.replyModal

        const reply = {
          id : message.id,
          postId: message.post.id,
          topicId: message.post.topicId,
          type: 3 // default to use quote
        }

        replyModal.initialize(message, reply)

        replyModal.show()

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>`)
      }
    })


  }

  onReport(message){
    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      if(isLoggedIn){
        const reportModal = this.scope.reportModal

        reportModal.message = message

        reportModal.report = {}

        reportModal.show()

      } else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 舉報需要會員權限，請先登入！</i>`)
      }
    })

  }

  onEdit(message){
    const editMessageModal = this.scope.editMessageModal

    editMessageModal.initialize(message)

    editMessageModal.show()

  }

  registerReportModal(){
    const reportModal = this.scope.reportModal = this.scope.$new()
    reportModal.show = () => this.reportModal.show()
    reportModal.hide = () => this.reportModal.hide()
    reportModal.doReport = (message,report) => {

      console.log(JSON.stringify(report))

      if(report.content){
        console.log(HKEPC.forum.reportPage(message.post.topicId,message.post.id,message.id))
        // get the form hash first
        this.http
            .get(HKEPC.forum.reportPage(message.post.topicId,message.post.id,message.id))
            .then((resp) => {
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

            })
      }
      else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 內容不能空白！</i>`)
      }


    }

    this.ionicModal.fromTemplateUrl('templates/modals/report-post.html', {
      scope: reportModal
    }).then((modal) => {
      this.reportModal = modal
    })
  }

  registerUserProfileModal(){
    const userProfileModal = this.scope.userProfileModal = this.scope.$new()

    this.ionicModal.fromTemplateUrl('templates/modals/user-profile.html', {
      scope: userProfileModal
    }).then(modal => {
      this.userProfileModal = modal

      userProfileModal.show = () => this.userProfileModal.show()
      userProfileModal.hide = () => this.userProfileModal.hide()


    })
  }

  registerReplyModal(){

    const replyModal = this.scope.replyModal = this.scope.$new()
    replyModal.id = "reply-content"

    this.ionicModal.fromTemplateUrl('templates/modals/reply-post.html', {
      scope: replyModal
    }).then((modal) => {
      this.replyModal = modal

      replyModal.show = () => this.replyModal.show()
      replyModal.hide = () => this.replyModal.hide()

      replyModal.initialize = (message, reply) => {

        replyModal.message = message

        replyModal.reply = reply

        // get the form hash first
        this.http
          .get(HKEPC.forum.replyPage(reply))
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
            replyModal.hiddenAttachFormInputs = hiddenAttachFormInputs
            replyModal.images = []

            replyModal.onImageUpload = (image) => {
              console.log("onImageUplod",image)
              replyModal.images.push(image)
            }

// ---------- End of Upload image preparation -----------------------------------------

            let formSource = cheerio.load($('#postform').html())

            // the text showing the effects of reply / quote
            const preText = formSource('#e_textarea').text()

            const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
              const k = formSource(elem).attr('name')
              const v = formSource(elem).attr('value')

              return `${k}=${encodeURIComponent(v)}`
            }).get()


            const ionicReaderSign = HKEPC.signature()

            // register new function
            replyModal.doReply = (reply) => {

              console.log(JSON.stringify(reply))

              // build the reply message
              const replyMessage = `${preText}\n${reply.content}\n\n${ionicReaderSign}`

              const postData = [
                `message=${encodeURIComponent(replyMessage)}`,
                hiddenFormInputs.join('&'),
                replyModal.images.map(_ => _.formData).join('&')
              ].join('&')

              // Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 成功發佈回覆！</i>`)

                this.replyModal.hide()

                this.end = false;

                this.doRefresh()

              })


            }


          })

      }

    })
  }

  registerEditMessageModal(){

    const editMessageModal = this.scope.editMessageModal = this.scope.$new()
    editMessageModal.id = "edit-content"
    editMessageModal.show = () => this.editMessageModal.show()
    editMessageModal.hide = () => this.editMessageModal.hide()
    editMessageModal.initialize = (message) => {
      editMessageModal.message = message

      console.log("edit message",message)

      this.http
          .get(HKEPC.forum.editMessage(message.post.topicId,message.post.id,message.id))
          .then((resp) => {
            let $ = cheerio.load(resp.data)
            const relativeUrl = $('#postform').attr('action')
            const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

            console.log(postUrl)

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
            editMessageModal.hiddenAttachFormInputs = hiddenAttachFormInputs
            editMessageModal.images = []

            editMessageModal.onImageUpload = (image) => {
              console.log("onImageUplod",image)
              editMessageModal.images.push(image)
            }

// ---------- End of Upload image preparation -----------------------------------------------

            let formSource = cheerio.load($('#postform').html())

            // the text showing the effects of reply / quote
            editMessageModal.edit = {
              subject: formSource('#subject').attr('value'),
              content :formSource('#e_textarea').text()
            }

            // register new function
            editMessageModal.doEdit = (subject,content) => {
              console.log(content)
              const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
                const k = formSource(elem).attr('name')
                const v = formSource(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              const postData = [
                `editsubmit=true`,
                `message=${encodeURIComponent(content)}`,
                `subject=${encodeURIComponent(subject)}`,
                hiddenFormInputs.join('&'),
                editMessageModal.images.map(_ => _.formData).join('&')
              ].join('&')

              // Post to the server
              this.http({
                method: "POST",
                url : postUrl,
                data : postData,
                headers : {'Content-Type':'application/x-www-form-urlencoded'}
              }).then((resp) => {

                this.ngToast.success(`<i class="ion-ios-checkmark"> 修改成功！</i>`)

                // set the page to the message page
                this.page = message.post.page

                this.doRefresh()

                this.editMessageModal.hide()

              })
            }

          })
    }

    this.ionicModal.fromTemplateUrl('templates/modals/edit-post.html', {
      scope: editMessageModal
    }).then((modal) => {
      this.editMessageModal = modal
    })
  }
  deregisterUserProfileModal(){
    this.userProfileModal.remove()
  }

  deregisterEditModal(){
    this.editMessageModal.remove()
  }

  deregisterReplyModal(){
    this.replyModal.remove()
  }

  deregisterReportModal(){
    this.reportModal.remove()
  }

  openPageSliderPopover($event) {
    this.inputPage = this.currentPage
    this.pageSliderPopover.show($event)
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
    this.scope.$emit(FindMessageRequest.NAME,new FindMessageRequest(postId,messageId))
  }


  onBack(){
    const history = this.ionicHistory.viewHistory()
    console.log(history)
    if(history.backView && (history.backView.stateName == Controllers.PostListController.STATE || history.backView.stateName == Controllers.PostController.STATE) &&
        history.backView.stateParams.postId != history.currentView.stateParams.postId){

      this.ionicHistory.goBack()

    } else {
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
    if(moment(dateStr, 'YYYY-M-D hh:mm').diff(new Date(),'days') >= -3 ){
      return moment(dateStr, 'YYYY-M-D hh:mm').fromNow()
    } else {
      return dateStr
    }
  }

  onUserProfilePic(author){

      this.authService.isLoggedIn().subscribe(isLoggedIn => {
        if(isLoggedIn){
          const userProfileModal = this.scope.userProfileModal

          userProfileModal.show()
          userProfileModal.author = author
          userProfileModal.content = undefined


          this.apiService.userProfile(author.uid).safeApply(this.scope.userProfileModal, data => {
            userProfileModal.author = author
            userProfileModal.content = data.content
          }).subscribe()


        } else {
          this.ngToast.danger(`<i class="ion-alert-circled"> 查看會員需要會員權根，請先登入！</i>`)
        }
      })

  }

  onMore(message){
    // Show the action sheet
    var hideSheet = this.ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-ios-copy-outline"></i> 複製 HKEPC IR Web 版連結' },
        { text: '<i class="icon ion-ios-copy-outline"></i> 複製 HKEPC 原始連結' },
        { text: `<i class="icon ion-ios-loop"></i> ${this.reversePostOrder ? '關閉' : '開啟'}倒轉看帖` },
        { text: `<i class="icon ion-ios-eye-outline"></i> ${this.filterOnlyAuthorId ? '關閉' : '開啟'}只看 ${message.author.name} 的帖` },
        { text: `<i class="icon ion-ios-lightbulb-outline"></i> 關注此主題的新回覆` },
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
          Clipboard.copy(`http://hkepc.ionic-reader.xyz/#/tab/topics/${this.topicId}/posts/${this.postId}/page/${this.page}?delayRender=&focus=${message.id}`);
          this.ngToast.success(`<i class="ion-ios-checkmark"> 連結已複製到剪貼簿！</i>`)
        }
        else if(index == 1){
          Clipboard.copy(HKEPC.forum.posts(this.topicId,this.postId,this.page));
          this.ngToast.success(`<i class="ion-ios-checkmark"> 連結已複製到剪貼簿！</i>`)
        }
        else if(index == 2){
          this.reversePostOrder = !this.reversePostOrder
          if(this.reversePostOrder) this.ngToast.success(`<i class="ion-ios-checkmark"> 已開啟倒轉看帖功能！</i>`)
          else this.ngToast.success(`<i class="ion-ios-checkmark"> 已關閉倒轉看帖功能！</i>`)

          this.doRefresh()
        }
        else if(index == 3){
          this.filterOnlyAuthorId = this.filterOnlyAuthorId == undefined ? message.author.uid : undefined
          if(this.filterOnlyAuthorId !== undefined) this.ngToast.success(`<i class="ion-ios-checkmark"> 只看 ${message.author.name} 的帖！</i>`)
          else this.ngToast.success(`<i class="ion-ios-checkmark"> 已關閉只看 ${message.author.name} 的帖！</i>`)

          this.doRefresh()
        }
        else if(index == 4){
          this.apiService.subscribeNewReply(this.postId).subscribe(() => {
            this.ngToast.success(`<i class="ion-ios-checkmark"> 成功關注此主題，你將能夠接收到新回覆的通知！</i>`)
          })
        }

        return true;
      },
      destructiveButtonClicked: (index) => {
        return true
      }
    })

  }
}