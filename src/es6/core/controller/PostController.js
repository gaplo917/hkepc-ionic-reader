/**
 * Created by Gaplo917 on 11/1/2016.
 */
//import * as cheerio from 'cheerio';
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {HKEPCHtml} from "../model/hkepc-html"
var cheerio = require('cheerio')
var async = require('async');

export class PostController{

  constructor($scope,$http, $stateParams,$sce,$state,$location,$message,$ionicHistory,$ionicModal,$ionicPopover) {
    this.scope = $scope
    this.http = $http
    this.messageService = $message
    this.state = $state
    this.location = $location
    this.sce = $sce
    this.ionicHistory = $ionicHistory
    this.ionicModal = $ionicModal

    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page
    this.messages = []
    this.postUrl = URLUtils.buildUrlFromState($state,$stateParams)

    // .fromTemplateUrl() method
    $ionicPopover.fromTemplateUrl('templates/modals/page-slider.html', {
      scope: $scope
    }).then((popover) => {
      this.pageSliderPopover = popover
    })

    $ionicPopover.fromTemplateUrl('templates/modals/gifs.html', {
      scope: $scope
    }).then((popover) => {
      this.gifPopover = popover;
    })

    $ionicModal.fromTemplateUrl('templates/modals/reply-post.html', {
      scope: $scope
    }).then((modal) => {
      this.replyModal = modal
    })

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', () => {
      this.pageSliderPopover.remove()
      this.gifPopover.remove()
      this.replyModal.remove()
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
    this.q = async.queue((task, callback) => {

      // update the messages list
      const message = task()

      this.messages.push(message)

      if(this.q.length() % 1 == 0){
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
      this.q.resume()
    })

    $scope.$on('$ionicView.beforeLeave', (e) => {
      this.q.pause()
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

              const pageNumArr = $('.forumcontrol .pages a')
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
                  title: postTitle
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

                  const ads = postSource('.adv').html()
                  postSource('.adv').remove()

                  const message = {
                    id: postSource('table').attr('id').replace('pid',''),
                    pos: postSource('.postinfo strong a em').text(),
                    inAppUrl: this.postUrl,
                    createdAt: postSource('.posterinfo .authorinfo em').text(),
                    content : this.sce.trustAsHtml(
                        // main content
                        postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html() ||
                        postSource('.postcontent > .defaultpost > .postmessage').html() // for banned message
                    ),
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

              this.q.push(tasks)

              this.q.drain = () => {
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

        }, (err) => {
          console.error('ERR', JSON.stringify(err))
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
    this.q.kill()
    this.end = false;

  }

  doRefresh(){
    this.refreshing = true
    this.reset()
    this.loadMessages(() => {
      this.refreshing = false
      this.scope.$broadcast('scroll.refreshComplete');
    })
  }

  onReply(message){

    // load gifs into controller
    this.gifs = HKEPC.data.gifs

    this.message = message

    this.replyModal.show()

    this.reply = {
      id : message.id,
      postId: message.post.id,
      topicId: message.post.topicId,
      type: 3 // default to use quote
    }

  }

  doReply(message,reply){

    console.log(JSON.stringify(reply))

    // get the form hash first
    this.http
      .get(HKEPC.forum.replyPage(reply))
      .then((resp) => {
        let $ = cheerio.load(resp.data)
        const relativeUrl = $('#postform').attr('action')
        const postUrl = `${HKEPC.baseUrl}/${relativeUrl}`

        console.log(postUrl)

        let formSource = cheerio.load($('#postform').html())

        // the text showing the effects of reply / quote
        const preText = formSource('#e_textarea').text()


        const hiddenFormInputs = formSource(`input[type='hidden']`).map((i,elem) => {
          const k = formSource(elem).attr('name')
          const v = formSource(elem).attr('value')

          return `${k}=${encodeURIComponent(v)}`
        }).get()


        // build the reply message
        const replyMessage = `${preText}\n${reply.content}`

        // Post to the server
        this.http({
          method: "POST",
          url : postUrl,
          data :`message=${encodeURIComponent(replyMessage)}&${hiddenFormInputs.join('&')}`,
          headers : {'Content-Type':'application/x-www-form-urlencoded'}
        }).then((resp) => {
          //console.log(JSON.stringify(resp))

          this.replyModal.hide()

        },(err) => {
          alert("Error: Network timeout")
          console.log(JSON.stringify(err))
        })

      }, (err) => {
        alert("Error: Network timeout")
        console.log(JSON.stringify(err))
      })

  }

  openGifPopover($event){
    this.gifPopover.show($event)
    console.log("open gifPopover")
  }

  addGifCodeToText(code){
    this.gifPopover.hide()
    this.reply.content = this.reply.content
                          ? `${this.reply.content} ${code} `
                          : `${code}`
    console.log(`add gif ${code}`)
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
}