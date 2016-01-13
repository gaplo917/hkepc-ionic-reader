/**
 * Created by Gaplo917 on 11/1/2016.
 */
import * as HKEPC from "../../data/config/hkepc"
import * as URLUtils from "../../utils/url"
import {GeneralHtml} from "../model/general-html"
var cheerio = require('cheerio')
var async = require('async');

export class PostListController {

  constructor($scope,$http,$stateParams) {
    "use strict";
    console.log("called POST LIST CONTROLLER")
    $scope.vm = this;
    this.scope = $scope
    this.http = $http

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []

    // create a UI rendering queue
    this.q = async.queue((task, callback) => {

      // update the post list
      const post = task()
      if(post.id || post.id != ""){
        this.pages[this.pages.length - 1].posts.push(task())
      }

      if(this.q.length() % 3 == 0){
        // force update the view after 10 task
        this.scope.$apply()
      }

      setTimeout(() => callback(), 50)
    }, 1);

    this.scope.$on('$ionicView.loaded', (e) => {
      this.loadMore()
    })
  }

  loadMore(cb){
    const nextPage = this.pages.length + 1
    this.http
        .get(HKEPC.forum.topics(this.topicId, nextPage))
        .then((resp) => {

          let $ = cheerio.load(resp.data)
          const topicName = $('#nav').text().split('»')[1]

          const tasks = $('.threadlist table tbody').map( (i, elem) => {
            return () => {

              let postSource = cheerio.load($(elem).html())

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
                publishDate: postSource('tr .author em').text()
              }
            }
          }).get()

          this.q.push(tasks)

          // when all task finished
          this.q.drain = () => {
            this.scope.$apply()
            this.scope.$broadcast('scroll.infiniteScrollComplete')
          }

          // push into the array
          this.pages.push({
            posts: [],
            num: nextPage
          })

          this.topic = {
            id: this.topicId,
            name: topicName
          }

          if(cb) cb(null)
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
  }

  doRefresh(){
    this.reset()
    this.loadMore(() => {
      this.scope.$broadcast('scroll.refreshComplete');
    })
  }

}