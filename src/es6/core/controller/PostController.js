/**
 * Created by Gaplo917 on 11/1/2016.
 */
//import * as cheerio from 'cheerio';
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class PostController{

  constructor($scope,$http, $stateParams,$sce,$state,$location,$message,$ionicHistory,$ionicModal,$ionicPopover) {
    $scope.vm = this;
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
    $ionicPopover.fromTemplateUrl('my-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });


    $scope.openPopover = ($event) => {
      this.inputPage = this.page
      $scope.popover.show($event);
    };
    $scope.closePopover = () => {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
      // Execute action
    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });

    // to control the post is end
    this.end = false;

    // create a UI rendering queue
    this.q = async.queue((task, callback) => {

      // update the messages list
      const message = task()
      if(this.messages.filter((m) => m.id == message.id).length > 0){
        this.end = true
      }
      else{
        this.messages.push(message)
      }

      if(this.q.length() % 1 == 0){
         //force update the view after 10 task
        this.scope.$apply()
      }

      setTimeout(() => callback(), 100)
    }, 1);


    // add action

    $scope.$on('$ionicView.loaded', (e) => {
      setTimeout(()=> this.loadMessages(),200)
    })

  }

  loadMore(cb){
    if(this.hasMoreData()){
      //update the page count
      this.page = parseInt(this.page) + 1

      this.loadMessages(cb)
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
              const html = new GeneralHtml(cheerio.load(resp.data))

              let $ = html
                  .removeIframe()
                  .processImgUrl(HKEPC.baseUrl)
                  .processExternalUrl()
                  .getCheerio()

              // remove the hkepc forum text
              const postTitle = html
                  .getTitle()
                  .split('-')[0]

              this.totalPageNum = $('.forumcontrol .pages a').map((i,elem) => {
                return $(elem).text()
              }).get()
                  .map(e => e.match(/\d/g)) // array of string with digit
                  .filter(e => e != null) // filter null value
                  .map(e => parseInt(e.join(''))) // join the array and parseInt
                  .reduce((e1, e2) => Math.max(e1, e2))


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

                  const message = {
                    id: postSource('table').attr('id').replace('pid',''),
                    pos: postSource('.postinfo strong a em').text(),
                    inAppUrl: this.postUrl,
                    createdAt: postSource('.posterinfo .authorinfo em').text(),
                    content : this.sce.trustAsHtml(
                        postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html()
                    ),
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
    this.page = 1
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
    this.message = message

    this.ionicModal.fromTemplateUrl('templates/modals/reply-post.html', {
      scope: this.scope
    }).then((modal) =>{
      this.scope.modal = modal
      this.scope.modal.show()
      this.reply = {
        id : message.id,
        postId: message.post.id,
        topicId: message.post.topicId,
        type: 3 // default to use quote
      }
    })

    this.scope.cancel = () => {
      this.scope.modal.hide()
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

          this.scope.modal.hide()

        },(err) => {
          alert("Error: Network timeout")
          console.log(JSON.stringify(err))
        })

      }, (err) => {
        alert("Error: Network timeout")
        console.log(JSON.stringify(err))
      })


  }

  onPageSliderDrag(value) {
    console.log(value)
  }

}