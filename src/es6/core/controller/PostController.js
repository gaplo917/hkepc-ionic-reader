/**
 * Created by Gaplo917 on 11/1/2016.
 */
//import * as cheerio from 'cheerio';
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {HKEPCHtml} from "../model/hkepc-html"
import {FindMessageRequest} from "../model/find-message-request"

var cheerio = require('cheerio')
var async = require('async');

export class PostController{

  constructor($scope,$http, $stateParams,$sce,$state,$location,$message,$ionicHistory,$ionicModal,$ionicPopover,ngToast,authService) {
    this.scope = $scope
    this.http = $http
    this.messageService = $message
    this.state = $state
    this.location = $location
    this.sce = $sce
    this.ionicHistory = $ionicHistory
    this.ionicModal = $ionicModal
    this.ionicPopover = $ionicPopover
    this.ngToast = ngToast
    this.authService = authService

    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page
    this.messages = []
    this.postUrl = URLUtils.buildUrlFromState($state,$stateParams)

    // register reply modal
    this.registerReplyModal()

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

    // create a UI rendering queue
    this.queue = async.queue((task, callback) => {

      // update the messages list
      const message = task()

      this.messages.push(message)

      if(this.queue.length() % 1 == 0){
         //force update the view after 10 task
        this.scope.$apply()
      }

      setTimeout(() => callback(), 100)
    }, 1);


    // add action

    $scope.$on('$ionicView.loaded', (e) => {
      setTimeout(() => this.loadMessages(), 200)

    })

    $scope.$on('$ionicView.enter', (e) => {
      this.queue.resume()
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.queue.pause()
    })
  }

  loadMore(cb){
    if(this.hasMoreData()){
      const nextPage = parseInt(this.page) + 1
      if(nextPage <= this.totalPageNum){
        //update the page count
        this.page = parseInt(this.page) + 1

        this.loadMessages(cb)
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

  loadMessages(cb){
    this.http
        .get(HKEPC.forum.posts(this.topicId,this.postId,this.page))
        .then((resp) => {

          async.waterfall([
            (callback) => {
              const html = new HKEPCHtml(cheerio.load(resp.data))

              let $ = html
                  //.removeIframe()  // iframe ads
                  .processImgUrl(HKEPC.imageUrl)
                  .processEpcUrl()
                  .processExternalUrl()
                  .getCheerio()

              // remove the hkepc forum text
              const postTitle = html
                  .getTitle()
                  .split('-')[0]

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

              // select the current login user
              const currentUsername = $('#umenu > cite').text()

              // send the login name to parent controller
              this.scope.$emit("accountTabUpdate",currentUsername)

              // the first post
              const firstPost = $('.postcontent > .defaultpost > .postmessage.firstpost > .t_msgfontfix')

              angular.extend(this,{
                post:{
                  title: postTitle,
                  id: this.postId,
                  topicId: this.topicId
                },
                topic: {
                  id: this.topicId
                }
              })

              // callback for next function
              callback(null, $,postTitle);
            },
            ($,postTitle, callback) => {



              // PostHtml map to the model
              const tasks = $('#postlist > div').map( (i,elem) => {
                // remember this is a function object (lazy function)
                return () => {
                  let postSource = cheerio.load($(elem).html())

                  const adsSource = postSource('.adv')

                  // extract the ads before remove from the parent
                  const hasAds = adsSource.has('iframe')
                  const ads = hasAds? adsSource.html() : undefined

                  // really remove the ads
                  adsSource.remove()

                  const content = new HKEPCHtml(
                      cheerio.load(postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
                      postSource('.postcontent > .defaultpost > .postmessage').html())
                  ).processImageToLazy()
                  .getCheerio()

                  const message = {
                    id: postSource('table').attr('id').replace('pid',''),
                    pos: postSource('.postinfo strong a em').text(),
                    inAppUrl: this.postUrl,
                    createdAt: postSource('.posterinfo .authorinfo em').text(),
                    content : this.sce.trustAsHtml(content.html()),
                    ads: this.sce.trustAsHtml(ads),
                    post:{
                      id: this.postId,
                      topicId: this.topicId,
                      title: postTitle,
                      page: this.page
                    },
                    author:{
                      image: postSource('.postauthor .avatar img').attr('src'),
                      name : postSource('.postauthor > .postinfo').text()
                    }
                  }

                  message.likedStyle = this.messageService.isLikedPost(message)
                      ? {color: '#0c60ee'}
                      : {}

                  return message
                }

              }).get()

              this.queue.push(tasks)

              this.queue.drain = () => {
                this.scope.$apply()
                this.scope.$broadcast('scroll.infiniteScrollComplete')
                console.log("Done All UI rendering")
                callback()
                if(cb) cb(null)
              }

            }
          ], (err, result) => {
            // result now equals 'done'
            console.log("ALL TASK DONE!!!",err)
          });

        })

  }

  like(message){
    console.log('like',message)

    if(this.messageService.isLikedPost(message)){
      this.messageService.remove(message)
      message.likedStyle = {}
    }
    else {
      this.messageService.add(message)
      message.likedStyle = {color: '#0c60ee'}
    }

  }

  onSwipeRight(){
    this.ionicHistory.goBack();
  }

  reset(){
    this.messages = []
    this.queue.kill()
    this.end = false;

  }

  doRefresh(){
    this.refreshing = true
    this.reset()
    this.loadMessages(() => {
      this.refreshing = false
    })
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
              const postUrl = `${HKEPC.baseUrl}/${relativeUrl}&infloat=yes&inajax=1`

              console.log(postUrl)

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

  deregisterReplyModal(){
    this.replyModal.remove()
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
    this.scope.$emit('find',new FindMessageRequest(postId,messageId))
  }

  futureFeature(){
    this.ngToast.warning("此功能尚未開發！")
  }
}