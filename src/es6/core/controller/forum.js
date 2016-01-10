/**
 * Created by Gaplo917 on 9/1/2016.
 */
import * as cheerio from "cheerio"
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"

export class ForumController {

  constructor() {
  }

  static getTopics($scope,$http) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //})
    $http
      .get(HKEPC.forum.index)
      .then((resp) => {
        console.log('Success', resp.data)
        let $ = cheerio.load(resp.data,{decodeEntities: true})

        let topics = []

        $('a.caption').each(function (i, elem) {
          if(URLUtils.getQueryVariable($(this).attr('href'),'fid') == 120)
            topics.push({
              id : URLUtils.getQueryVariable($(this).attr('href'),'fid'),
              name : decodeURIComponent($(this).text())
            })
        })

        $scope.topics = topics

        // For JSON responses, resp.data contains the result
      }, (err) => {
        alert("error")
        console.error('ERR', JSON.stringify(err))
        // err.status will contain the status code
      })
  }
  static getPosts($scope,$http,$stateParams) {
    "use strict";
    const topicId = $stateParams.topicId
    const page = $stateParams.page

    $scope.slideToPage = (page) => {
      alert(page)
    }

    $http
        .get(HKEPC.forum.topics(topicId,page))
        .then((resp) => {
          console.log('Success', resp.data)

          $scope.debug = resp.data

          let $ = cheerio.load(resp.data)

          let posts = []

          $('.threadlist table tbody tr th a').not('.threadpages > a').each(function (i, elem) {
            posts.push({
              id: URLUtils.getQueryVariable($(this).attr('href'), 'tid'),
              name: $(this).text()
            })
          })

          $scope.posts = posts
          $scope.topic = {
            id: topicId,
            name: HKEPC.data.topics[`${topicId}`],
            page: page
          }

          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          // err.status will contain the status code
        })
  }

  static getPost($scope,$http, $stateParams,$sce,$localstorage,$state,$location,$postlike) {

    const topicId = $stateParams.topicId
    const postId = $stateParams.postId
    const page = $stateParams.page

    $scope

    let postUrl = URLUtils.buildUrlFromState($state,$stateParams)

    // add action
    angular.extend($scope,{
      like: (post) => {
        console.log('like',post)

        if($postlike.isLikedPost(post)){
          $postlike.remove(post)
          post.likedStyle = {}
        }
        else {
          $postlike.add(post)
          post.likedStyle = {color: '#0c60ee'}
        }

      },
      onSwipeLeft: () => {
        let nextPostUrl = URLUtils.buildUrlFromState($state,{
          topicId: topicId,
          postId : postId,
          page: parseInt(page) + 1
        })

        $location.url(nextPostUrl.replace('#',''));
      }
    })

    $http
        .get(HKEPC.forum.posts(topicId,postId,page))
        .then((resp) => {
          const html = new GeneralHtml(cheerio.load(resp.data))

          let $ = html
                    .removeIframe()
                    .processImgUrl(HKEPC.forum.image)
                    .getCheerio()

          // remove the hkepc forum text
          const title = html
                          .getTitle()
                          .split('-')[0]

          // select the current login user
          const currentUsername = $('#umenu > cite').html()

          // the first post
          const firstPost = $('.postcontent > .defaultpost > .postmessage.firstpost > .t_msgfontfix')

          // PostHtml map to the model
          const posts = $('#postlist > div').map(function (i,elem) {
            let postSource = cheerio.load($(this).html())

            return {
              id: postSource('table').attr('id'),
              title: title,
              inAppUrl: postUrl,
              author:{
                image: postSource('.postauthor .avatar img').attr('src'),
                name : postSource('.postauthor > .postinfo').text()
              },
              createdAt: postSource('.posterinfo .authorinfo em').text(),
              content : $sce.trustAsHtml(
                  postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html()
              )
            }
          }).get()
            .map((post,i) => {
              post.likedStyle = $postlike.isLikedPost(post)
                                ? {color: '#0c60ee'}
                                : {}

              return post;
            })

          angular.extend($scope,{
            posts: posts,
            topic: {
              id : topicId
            }
          })

          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          // err.status will contain the status code
        })

  }

}
