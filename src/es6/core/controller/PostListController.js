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

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []
    this.slidePages = []
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

          const tasks = $('.threadlist table tbody').map( (i, elem) => {
            return () => {

              const postSource = cheerio.load($(elem).html())

              return {
                id: URLUtils.getQueryVariable(postSource('tr .subject span a').attr('href'), 'tid'),
                tag: postSource('tr .subject em a').text(),
                name: postSource('tr .subject span a').text(),
                author: {
                  name: postSource('tr .author a').text()
                },
                count: {
                  view: postSource('tr .nums em').text(),
                  reply: postSource('tr .nums strong').text()
                },
                publishDate: postSource('tr .author em').text(),
                pageNum: nextPage
              }
            }
          }).get()

          this.q.push(tasks, (err) => {
            console.log("finished one task!")
          })

          // when all task finished
          this.q.drain = () => {
            this.scope.$apply()
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

  reset(){
    this.q.kill()
    this.pages = []
    this.slidePages = []
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
    this.location.hash(`ionic-slide-${index}`)
    this.anchorScroll()

    // clear the model first
    //this.slidePages[index] = []

    setTimeout(() => {
      const diff = this.currentIndex - index
      const pagesNums = this.pages.map(p => p.num)
      this.currentPageNum = this.slidePages[this.currentIndex].num

      if(diff == 1 || diff == -2){
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
          if(this.currentPageNum == 1){
            console.log("go back")
            this.ionicHistory.goBack()
          }
        }

        this.scope.$apply()

      }
      else{
        // next page
        const largestPageNum = Math.max.apply(Math, pagesNums)

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
          this.scope.$apply()
        }

      }

      this.currentIndex = index
    },100)

    console.log(this.pages)
    console.log(`onSlideChanged${index}`)
  }

}