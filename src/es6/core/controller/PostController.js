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

  constructor($scope,$http, $stateParams,$sce,$state,$location,$message) {
    $scope.vm = this;
    this.scope = $scope
    this.http = $http
    this.messageService = $message
    this.state = $state
    this.location = $location
    this.sce = $sce

    this.topicId = $stateParams.topicId
    this.postId = $stateParams.postId
    this.page = $stateParams.page

    let postUrl = URLUtils.buildUrlFromState($state,$stateParams)

    // add action

    $scope.$on('$ionicView.loaded', (e) => {

      this.http
        .get(HKEPC.forum.posts(this.topicId,this.postId,this.page))
        .then((resp) => {

          async.waterfall([
            (callback) => {
              const html = new GeneralHtml(cheerio.load(resp.data))

              let $ = html
                  .removeIframe()
                  .processImgUrl(HKEPC.forum.image)
                  .getCheerio()

              // remove the hkepc forum text
              const postTitle = html
                  .getTitle()
                  .split('-')[0]

              // select the current login user
              const currentUsername = $('#umenu > cite').html()

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
                return (cb) => {
                  setTimeout(() => {

                    console.log("lazy function!!!")
                    let postSource = cheerio.load($(elem).html())

                    const message = {
                      id: postSource('table').attr('id'),
                      inAppUrl: postUrl,
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

                    message.likedStyle = $message.isLikedPost(message)
                        ? {color: '#0c60ee'}
                        : {}

                    this.scope.$apply(() => {
                      console.log("add message ",i, message)
                      this.messages.push(message)
                    })

                    // callback no error
                    cb(null)
                  }, 800 + 300 * (i+1)); // improve UX for smoothing the UI
                }

              }).get()

              async.parallel(tasks,function(err,result){
                callback(err)
              });

            }
          ], function (err, result) {
            // result now equals 'done'
            console.log("ALL TASK DONE!!!",err)
          });



          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          // err.status will contain the status code
        })
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

  onSwipeLeft(){
    let nextPostUrl = URLUtils.buildUrlFromState(this.state,{
      topicId: this.topicId,
      postId : this.postId,
      page: parseInt(this.page) + 1
    })
    this.location.url(nextPostUrl.replace('#',''));
  }


}