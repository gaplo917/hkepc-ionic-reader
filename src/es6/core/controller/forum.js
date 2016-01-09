/**
 * Created by Gaplo917 on 9/1/2016.
 */
import * as cheerio from "cheerio"
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"

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
    $http
        .get(HKEPC.forum.topics(topicId))
        .then((resp) => {
          console.log('Success', resp.data)

          $scope.debug = resp.data

          let $ = cheerio.load(resp.data, {decodeEntities: true})

          let posts = []

          $('.threadlist table tbody tr th a').not('.threadpages > a').each(function (i, elem) {
            posts.push({
              id: URLUtils.getQueryVariable($(this).attr('href'), 'tid'),
              name: decodeURIComponent($(this).text())
            })
          })

          $scope.posts = posts
          $scope.topic = {
            id: topicId,
            name: HKEPC.data.topics[`${topicId}`]
          }

          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          // err.status will contain the status code
        })
  }

  static getPost($scope,$http, $stateParams,$sce,$localstorage,$state) {
    const topicId = $stateParams.topicId
    const postId = $stateParams.postId
    let postUrl = URLUtils.buildUrlFromState($state,$stateParams)


    let likedPosts = $localstorage.getObject("like.posts")
    console.log('likedPosts',likedPosts)

    let isLiked = Object.keys(likedPosts).length > 0
                        ? likedPosts.filter((url) => url == postUrl).length == 1
                        : false;

    console.log('isliked',isLiked)

    $scope.likedStyle = isLiked ? { color: '#0c60ee'} : {}

    $scope.like = () => {
      console.log('like',postUrl)

      let likedPosts = $localstorage.getObject("like.posts")
      console.log('likedPosts',likedPosts)

      if(Object.keys(likedPosts).length == 0){
        $localstorage.setObject("like.posts",[postUrl])
        $scope.likedStyle = {color: '#0c60ee'}
      }
      else{
        let filteredPosts = likedPosts
          .filter((url) => url !== postUrl)

        const originLen = likedPosts.length
        const filteredLen = filteredPosts.length

        // do not add back to the list, if the user trigger when isLiked = true
        if(originLen - filteredLen == 0) {
          filteredPosts.push(postUrl)

          console.log("update UI")
          $scope.likedStyle = {color: '#0c60ee'}
        }
        else{
          console.log("update UI2")

          $scope.likedStyle = {}
        }

        $localstorage.setObject("like.posts",filteredPosts)
      }

    }

    $http
        .get(HKEPC.forum.posts(topicId,postId))
        .then((resp) => {
          //console.log('Success', resp.data)
          let posts = []

          $scope.debug = resp.data

          let $ = cheerio.load(resp.data)

          // select the current login user
          const currentUsername = $('#umenu > cite').html()

          // remove iframe
          $('iframe').remove()

          // select the post title
          const title = $('title').text().split('-')[0]

          // parsing the image( ie. relativePath, lazy loading )
          $('img').each(function(i,e) {
            function isRelativeUrlImg(url){
              return ! (url.startsWith('http://') || url.startsWith('https://'))
            }

            const lazyImg = $(this).attr('file')

            if(lazyImg){
              console.log('lazy',lazyImg)
              $(this).attr('src',lazyImg)
            }

            const imgSrc = $(this).attr('src') || ""

            if(isRelativeUrlImg(imgSrc)){
              console.log('gif',imgSrc)
              $(this).attr('src',`http://www.hkepc.com/forum/${imgSrc}`)
            }

          })

          // the first post
          const firstPost = $('.postcontent > .defaultpost > .postmessage.firstpost > .t_msgfontfix')

          // forEach Post map to the model
          $('#postlist > div').each(function (i,elem) {
            let postSource = cheerio.load($(this).html())

            posts.push({
              author:{
                image: postSource('.postauthor .avatar img').attr('src'),
                name : postSource('.postauthor > .postinfo').text()
              },
              createdAt: postSource('.posterinfo .authorinfo em').text(),
              content : $sce.trustAsHtml(
                  postSource('.postcontent > .defaultpost > .postmessage > .t_msgfontfix').html()
              ),
              title: title
            })
          })

          // pass the model to view
          $scope.posts = posts

          $scope.topic = {
            id : topicId
          }

          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          // err.status will contain the status code
        })

  }

}
