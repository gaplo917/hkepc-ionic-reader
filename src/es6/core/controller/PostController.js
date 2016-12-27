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
const moment = require('moment')
require('moment/locale/zh-tw');

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

  constructor($scope,$http, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet,apiService,rx) {
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
      this.deregisterReplyModal()
      this.deregisterReportModal()
    })
    // Execute action on hide popover
    $scope.$on('popover.hidden', () => {
      // Execute action
    })
    // Execute action on remove popover
    $scope.$on('popover.removed', () => {
      // Execute action
    })

    // to control the post is end
    this.end = false;

    // add action

    $scope.$on('$ionicView.loaded', (e) => {
      this.topicId = $stateParams.topicId
      this.postId = $stateParams.postId
      this.delayRender = $stateParams.delayRender ? parseInt($stateParams.delayRender) : 100
      this.focus = $stateParams.focus

      // Last reading page position
      this.LocalStorageService.get(`${this.topicId}/${this.postId}/lastPage`).subscribe(data => {
        const lastPage = data

        if(lastPage) {
          this.ngToast.info({
            horizontalPosition: 'right',
            timeout: 2000,
            content: `<i class="ion-ios-eye"> 自動跳到上一次閱讀的頁數</i>`
          })
        }
        this.page = lastPage || $stateParams.page

        setTimeout(() => this.loadMessages(), 200)

      })

    })

    $scope.$on('$ionicView.enter', (e) => {

      // register reply modal
      this.registerReplyModal()

      // register report modal
      this.registerReportModal()

      //register edit message modal
      this.registerEditMessageModal()
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      if(this.postTaskSubscription) this.postTaskSubscription.dispose()
      this.deregisterReplyModal()
      this.deregisterReportModal()
      this.deregisterEditModal()
    })
  }

  loadMore(){
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
      if(nextPage <= this.totalPageNum){
        //update the page count
        this.page = nextPage

        this.loadMessages()
      }
      else{
        // set a flag for end
        this.end = true
      }

    }

  }

  hasMoreData(){
    return !this.end && !this.refreshing
  }

  loadMessages(){
    this.LocalStorageService.set(`${this.topicId}/${this.postId}/lastPage`,this.page)

    this.postTaskSubscription && this.postTaskSubscription.dispose()

    this.postTaskSubscription = this.apiService.postDetails({
      topicId: this.topicId,
      postId: this.postId,
      page: this.page
    }).subscribe(post => {
      console.debug(post)

      this.post = post

      this.totalPageNum = post.totalPageNum

      post.messages.forEach(message => {
        this.messageService.isLikedPost(message).subscribe(isLiked => {
          message.liked = isLiked
        })

        message.focused = message.id == this.focus

        this.authService.getUsername().subscribe(username => {
          message.author.isSelf = message.author.name == username
        })
      })

      this.messages = this.messages.concat(post.messages)
    },
    err => console.trace(err),
    () => {
      console.debug("All Render Task Completed")

      if(this.focus){
        console.debug('detected focus object')
        setTimeout(() => {
          const focusPosition = angular.element(document.querySelector(`#message-${this.focus}`)).prop('offsetTop')
          this.ionicScrollDelegate.scrollTo(0,focusPosition)
          this.focus = undefined
        },200)
      }

      this.refreshing = false
      this.scope.$apply()
      this.scope.$broadcast('scroll.infiniteScrollComplete')
    })

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
    this.refreshing = true
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
              content :formSource('#e_textarea').text()
            }

            // register new function
            editMessageModal.doEdit = (content) => {
              console.log(content)
              const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
                const k = formSource(elem).attr('name')
                const v = formSource(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()

              const postData = [
                `editsubmit=true`,
                `message=${encodeURIComponent(content)}`,
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
    this.inputPage = this.page
    this.pageSliderPopover.show($event)
  }

  doJumpPage(){
    this.pageSliderPopover.hide()
    this.reset()
    this.page = this.inputPage
    this.loadMessages()
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


  onMore(message){
    // Show the action sheet
    var hideSheet = this.ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-share balanced"></i> 複製 HKEPC IR Web 版連結' },
        { text: '<i class="icon ion-share balanced"></i> 複製 HKEPC 原始連結' },
      ],
      titleText: '分享連結',
      cancelText: '取消',
      cancel: function() {
        // add cancel code..
        return true
      },
      buttonClicked: (index) => {
        if(index == 0){
          Clipboard.copy(`http://hkepc.ionic-reader.xyz/#/tab/topics/${this.topicId}/posts/${this.postId}/page/${this.page}?delayRender=&focus=${message.id}`);
        }
        else {
          Clipboard.copy(HKEPC.forum.posts(this.topicId,this.postId,this.page));
        }
        this.ngToast.success(`<i class="ion-ios-checkmark"> 連結已複製到剪貼簿！</i>`)

        return true;
      },
      destructiveButtonClicked: (index) => {
        return true
      }
    });

  }
}