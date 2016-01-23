/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class PostListController {

  constructor($scope,$http,$stateParams,$location,$anchorScroll,$ionicSlideBoxDelegate,$ionicHistory) {
    "use strict";
    console.log("called POST LIST CONTROLLER")
    $scope.vm = this;
    this.scope = $scope
    this.http = $http
    this.location = $location
    this.anchorScroll = $anchorScroll
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate
    this.ionicHistory = $ionicHistory
    this.ionicSlideBoxDelegate = $ionicSlideBoxDelegate

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []
    this.slidePages = [{},{},{}]
    this.currentIndex = 0
    this.currentPageNum = this.page - 1
    this.showSpinner = true

    // create a UI rendering queue
    this.q = async.queue((task, callback) => {

      // update the post list
      const post = task()

      if(post.id || post.id != ""){
        const page = this.pages.find(p => p.num == post.pageNum)

        if(page){
          page.posts.push(post)
        }
      }

      if(this.q.length() % 3 == 0){
        // force update the view after 3 task
        this.scope.$apply()
      }
      setTimeout(() => callback(), 40)
    }, 1);

    this.scope.$on('$ionicView.loaded', (e) => {
      setTimeout(() => { this.loadMore() } ,400)
    })
  }

  loadMore(cb = () => {}){
    const nextPage = this.currentPageNum + 1
    this.http
        .get(HKEPC.forum.topics(this.topicId, nextPage))
        .then((resp) => {
          // hide the spinner
          this.showSpinner = false

          let $ = cheerio.load(resp.data)
          const topicName = $('#nav').text().split('»')[1]
          const totalPageNumText = $('.pages_btns .pages .last').first().text()

          // select the current login user
          const currentUsername = $('#umenu > cite').text()

          // send the login name to parent controller
          this.scope.$emit("accountTabUpdate",currentUsername)

          // only extract the number
          this.totalPageNum = totalPageNumText
                              ? totalPageNumText.match(/\d/g).join("")
                              : 1

          const tasks = $('.threadlist table tbody').map( (i, elem) => {
            return () => {
              const htmlId = $(elem).attr('id')

              const postSource = cheerio.load($(elem).html())
              const postTitleImgUrl = postSource('tr .folder img').attr('src')

              return {
                id: URLUtils.getQueryVariable(postSource('tr .subject span a').attr('href'), 'tid'),
                topicId: this.topicId,
                tag: postSource('tr .subject em a').text(),
                name: postSource('tr .subject span[id^=thread_] a ').text(),
                author: {
                  name: postSource('tr .author a').text()
                },
                count: {
                  view: postSource('tr .nums em').text(),
                  reply: postSource('tr .nums strong').text()
                },
                publishDate: postSource('tr .author em').text(),
                pageNum: nextPage,
                isSticky: htmlId ? htmlId.startsWith("stickthread") : false,
                isRead: postTitleImgUrl ? postTitleImgUrl.indexOf('new') > 0 : false
              }
            }
          }).get()

          this.q.push(tasks, (err) => {
            // callback of each task if any
          })

          // when all task finished
          this.q.drain = () => {
            this.updateUI()
          }

          // push into the array
          this.pages.push({
            posts: [],
            num: nextPage
          })

          if(this.currentIndex == 0){
            this.slidePages[0] = this.pages[0]
          }

          this.topic = {
            id: this.topicId,
            name: topicName
          }

          cb(null)
          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          cb(err)
          // err.status will contain the status code
        })
  }

  updateUI(){
    this.ionicSlideBoxDelegate.update()
    this.scope.apply()
  }

  reset(){
    this.q.kill()
    this.pages = []
    this.slidePages = [{},{},{}]
    this.ionicSlideBoxDelegate.slide(0,10)
    this.currentIndex = 0
    this.currentPageNum = 0
    this.showSpinner = true

  }

  doRefresh(){
    this.reset()
    this.loadMore(() => {
      this.scope.$broadcast('scroll.refreshComplete');
    })
  }

  onSlideChanged(index){
    if(this.slidePages.length == 0) return 0

    this.showSpinner = true

    //scroll to the hash tag
    this.location.hash(`ionic-slide-box`)
    this.anchorScroll()

    // clear the model first
    //this.slidePages[index] = []

    setTimeout(() => {
      const diff = this.currentIndex - index
      const pagesNums = this.pages.map(p => p.num)
      this.currentPageNum = this.slidePages[this.currentIndex].num
      this.ionicSlideBoxDelegate.$getByHandle('slideshow-slidebox')._instances[0].loop(true)


      if(diff == 1 || diff == -2){

        if(this.currentPageNum ==  1 || (this.currentIndex == 1 && this.currentPageNum == 2)) {
          // disable the does-continue if the it is the initial page
          this.ionicSlideBoxDelegate.$getByHandle('slideshow-slidebox')._instances[0].loop(false)
        }

        // previous page, i.e.  2 -> 1 , 1 -> 0 , 0 -> 2
        const smallestPageNum = Math.min.apply(Math, pagesNums)

        if(this.currentPageNum > smallestPageNum){
          console.log("default previous page")
          this.slidePages[index] = this.pages.find(page => page.num == this.currentPageNum - 1)

          // prefetch for better UX
          const prefetchSlideIndex = index - 1 < 0 ? 2 : index - 1
          this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum - 2)


        }
        else{
          console.log("loadMore Before()")
          // TODO: loadMoare beofre
        }
      }
      else{
        // next page
        const largestPageNum = Math.max.apply(Math, pagesNums)

        if(this.currentPageNum == this.totalPageNum){

          // TODO: should have a better UX instead of alert box
          alert("完")
          // scroll back the previous slides
          this.ionicSlideBoxDelegate.previous()
        }
        if(this.currentPageNum >= largestPageNum){
          console.log("loadMore After()")
          this.slidePages[index] = []
          this.loadMore(() => {
            const len = this.pages.length -1
            const nextPage = Math.floor(len / 3) * 3 + index
            this.slidePages[this.currentIndex] = this.pages[nextPage - 1]
            this.slidePages[index] = this.pages[nextPage]

            // prefetch for better UX
            const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
            this.slidePages[prefetchSlideIndex] = []
          })

        }
        else{
          console.log("default next page")
          this.slidePages[index] = this.pages.find(p => p.num == this.currentPageNum + 1)

          // prefetch for better UX
          const prefetchSlideIndex = index + 1 > 2 ? 0 : index + 1
          this.slidePages[prefetchSlideIndex] = this.pages.find(page => page.num == this.currentPageNum + 2)
        }

      }

      this.currentIndex = index
      this.updateUI()

    },100)

    console.log(`onSlideChanged${index}`)
  }

}
