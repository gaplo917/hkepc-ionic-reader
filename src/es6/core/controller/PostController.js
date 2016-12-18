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
const Rx = require('rx')
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

  constructor($scope,$http, $stateParams,$sce,$state,$location,MessageService,$ionicHistory,$ionicModal,$ionicPopover,ngToast,AuthService,$ionicScrollDelegate,LocalStorageService,$ionicActionSheet) {
    this.scope = $scope
    this.http = $http
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

    this.messages = []
    this.postUrl = URLUtils.buildUrlFromState($state,$stateParams)
    this.currentUsername = AuthService.getUsername()

    // register reply modal
    this.registerReplyModal()

    // register report modal
    this.registerReportModal()

    //register edit message modal
    this.registerEditMessageModal()

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
      const lastPage = this.LocalStorageService.get(`${this.topicId}/${this.postId}/lastPage`)
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

    $scope.$on('$ionicView.enter', (e) => {
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

    const source = Rx.Observable
        .fromPromise(this.http.get(HKEPC.forum.posts(this.topicId,this.postId,this.page)))
        .map(resp => new HKEPCHtml(cheerio.load(resp.data)))
        .map(
          html => html.processImgUrl(HKEPC.imageUrl)
            .processEpcUrl()
            .processExternalUrl()
        )

    source.map(html => html.getCheerio())
        .subscribe($ => this.scope.$emit(CommonInfoExtractRequest.NAME, new CommonInfoExtractRequest($)))


    // render the basic information first
    source.subscribe(
        html => {
          const pageBackLink = html.getCheerio()('.forumcontrol .pageback a').attr('href')

          // remove the hkepc forum text
          const postTitle = html
              .getTitle()
              .split('-')[0]

          const $ = html.getCheerio()

          const pageNumSource = $('.forumcontrol .pages a, .forumcontrol .pages strong')

          const pageNumArr = pageNumSource
                              .map((i,elem) => $(elem).text())
                              .get()
                              .map(e => e.match(/\d/g)) // array of string with digit
                              .filter(e => e != null) // filter null value
                              .map(e => parseInt(e.join(''))) // join the array and parseInt

          this.totalPageNum = pageNumArr.length == 0
                                ? 1
                                : Math.max(...pageNumArr)
          this.post = {
              title: postTitle,
              id: this.postId,
              topicId: URLUtils.getQueryVariable(pageBackLink,'fid')
            }

        },
        err => console.log(err)
    )

    const postTasks = source
        .flatMap(html => {
          const $ = html.getCheerio()
          return $('#postlist > div').map((i, elem) => {
            return {
              $: $,
              elem: elem,
              postTitle: html.getTitle().split(' - ')[0]
            }
          }).get()
        })
        .map(postObj => Rx.Observable.return(postObj).delay(this.delayRender))
        .concatAll()

    // render the post
    this.postTaskSubscription = postTasks
      .subscribe(
        postObj => {
          const elem = postObj.elem,
                $ = postObj.$,
                postTitle = postObj.postTitle

          let postSource = cheerio.load($(elem).html())

          const adsSource = postSource('.adv iframe')

          // extract the ads before remove from the parent
          const hasAds = adsSource.has('img')
          const ads = hasAds && !ionic.Platform.isIOS() && !ionic.Platform.isAndroid()  ? adsSource.html() : undefined

          // really remove the ads
          adsSource.remove()

          const content = new HKEPCHtml(
              cheerio.load(postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
                  postSource('.postcontent > .defaultpost > .postmessage').html())
          ).processImageToLazy()
              .getCheerio()

          const rank = postSource('.postauthor > p > img').attr('alt')

          const message = {
            id: postSource('table').attr('id').replace('pid',''),
            pos: postSource('.postinfo strong a em').text(),
            createdAt: postSource('.posterinfo .authorinfo em span').attr('title') || postSource('.posterinfo .authorinfo em').text().replace('發表於 ',''),
            content : content.html(),
            ads: ads,
            post:{
              id: this.postId,
              topicId: this.topicId,
              title: postTitle,
              page: this.page
            },
            author:{
              rank: rank ? rank.replace('Rank: ','') : 0,
              image: postSource('.postauthor .avatar img').attr('src'),
              name : postSource('.postauthor > .postinfo').text(),
              isSelf: postSource(' author > .postinfo').text().indexOf(this.currentUsername) >= 0
            }
          }

          message.liked = this.messageService.isLikedPost(message)
          message.focused = message.id == this.focus

          this.messages.push(message)

          this.scope.$apply()
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
        }
    )

  }

  like(message){
    console.log('like',message)

    if(this.messageService.isLikedPost(message)){
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
    this.postTaskSubscription.dispose()
    this.end = false;

  }

  doRefresh(){
    this.refreshing = true
    this.reset()
    this.loadMessages()
  }

  onQuickReply(post){
    if(this.authService.isLoggedIn()){
      const replyModal = this.scope.replyModal

      replyModal.message = {
        post: post
      }

      replyModal.reply = {
        id : undefined,
        postId: post.id,
        topicId: post.topicId,
        type: 1 // default to use quote
      }

      replyModal.show()

    } else {
      this.ngToast.danger(`<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>`)
    }
  }

  onReply(message){

    if(this.authService.isLoggedIn()){
      const replyModal = this.scope.replyModal

      replyModal.message = message

      replyModal.reply = {
        id : message.id,
        postId: message.post.id,
        topicId: message.post.topicId,
        type: 3 // default to use quote
      }

      replyModal.show()

    } else {
      this.ngToast.danger(`<i class="ion-alert-circled"> 留言需要會員權限，請先登入！</i>`)
    }

  }

  onReport(message){
    if(this.authService.isLoggedIn()){
      const reportModal = this.scope.reportModal

      reportModal.message = message

      reportModal.report = {}

      reportModal.show()

    } else {
      this.ngToast.danger(`<i class="ion-alert-circled"> 舉報需要會員權限，請先登入！</i>`)
    }
  }

  onEdit(message){
    const editMessageModal = this.scope.editMessageModal

    editMessageModal.getMessage(message)

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
    replyModal.show = () => this.replyModal.show()
    replyModal.hide = () => this.replyModal.hide()
    replyModal.doReply = (reply) => {

      console.log(JSON.stringify(reply))

      if(reply.content){

        // get the form hash first
        this.http
            .get(HKEPC.forum.replyPage(reply))
            .then((resp) => {
              let $ = cheerio.load(resp.data)
              const relativeUrl = $('#postform').attr('action')
              const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&infloat=yes&inajax=1`

              let formSource = cheerio.load($('#postform').html())

              // the text showing the effects of reply / quote
              const preText = formSource('#e_textarea').text()


              const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
                const k = formSource(elem).attr('name')
                const v = formSource(elem).attr('value')

                return `${k}=${encodeURIComponent(v)}`
              }).get()


              const ionicReaderSign = HKEPC.signature()

              // build the reply message
              const replyMessage = `${preText}\n${reply.content}\n\n${ionicReaderSign}`

              const postData = [
                `message=${encodeURIComponent(replyMessage)}`,
                hiddenFormInputs.join('&')
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

            })
      }
      else {
        this.ngToast.danger(`<i class="ion-alert-circled"> 內容不能空白！</i>`)
      }


    }
    replyModal.openGifPopover = ($event) => {

      // load gifs into controller
      replyModal.gifs = HKEPC.data.gifs

      replyModal.gifPopover.show($event)
    }

    replyModal.addGifCodeToText = (code) => {
      replyModal.gifPopover.hide()

      const selectionStart = document.getElementById('reply-content').selectionStart

      const content = replyModal.reply.content || ""

      const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

      replyModal.reply.content = `${splits[0]} ${code} ${splits[1]}`
    }

    this.ionicModal.fromTemplateUrl('templates/modals/reply-post.html', {
      scope: replyModal
    }).then((modal) => {
      this.replyModal = modal
      // register gif popover
      this.ionicPopover.fromTemplateUrl('templates/modals/gifs.html', {
        scope: replyModal
      }).then((popover) => {
        replyModal.gifPopover = popover;
      })
    })
  }

  registerEditMessageModal(){

    const editMessageModal = this.scope.editMessageModal = this.scope.$new()
    editMessageModal.show = () => this.editMessageModal.show()
    editMessageModal.hide = () => this.editMessageModal.hide()

    editMessageModal.openGifPopover = ($event) => {

      // load gifs into controller
      editMessageModal.gifs = HKEPC.data.gifs

      editMessageModal.gifPopover.show($event)
    }

    editMessageModal.addGifCodeToText = (code) => {
      editMessageModal.gifPopover.hide()

      const selectionStart = document.getElementById('edit-content').selectionStart

      const content = editMessageModal.edit.content || ""

      const splits = [content.slice(0,selectionStart),content.slice(selectionStart)]

      editMessageModal.edit.content = `${splits[0]} ${code} ${splits[1]}`
    }

    editMessageModal.getMessage = (message) => {
      editMessageModal.message = message

      this.http
          .get(HKEPC.forum.editMessage(message.post.topicId,message.post.id,message.id))
          .then((resp) => {
            let $ = cheerio.load(resp.data)
            const relativeUrl = $('#postform').attr('action')
            const postUrl = `${HKEPC.baseForumUrl}/${relativeUrl}&inajax=1`

            console.log(postUrl)

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
                hiddenFormInputs.join('&')
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
      // register gif popover
      this.ionicPopover.fromTemplateUrl('templates/modals/gifs.html', {
        scope: editMessageModal
      }).then((popover) => {
        editMessageModal.gifPopover = popover;
      })
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