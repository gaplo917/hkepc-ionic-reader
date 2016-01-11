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
    $scope.vm = this;
    this.scope = $scope
    this.http = $http

    this.topicId = $stateParams.topicId
    this.page = $stateParams.page
    this.pages = []

    this.scope.$on('$ionicView.loaded', (e) => {
      this.loadMore()
    })
  }

  loadMore(){
    const nextPage = this.pages.length + 1
    this.http
        .get(HKEPC.forum.topics(this.topicId, nextPage))
        .then((resp) => {

          let $ = cheerio.load(resp.data)
          const topicName = $('#nav').text().split('»')[1]

          const posts = $('.threadlist table tbody').map(function (i, elem) {
            let postSource = cheerio.load($(this).html())

            return {
              id: URLUtils.getQueryVariable(postSource('tr .subject span a').attr('href'), 'tid'),
              tag: postSource('tr .subject em a').text(),
              name: postSource('tr .subject span a').text(),
              author:{
                name: postSource('tr .author a').text()
              },
              count:{
                view: postSource('tr .nums em').text(),
                reply: postSource('tr .nums strong').text()
              },
              publishDate: postSource('tr .author em').text()
            }
          }).get()
            .filter((post) => post.id != "")


          // push into the array
          this.pages.push({
            posts: posts,
            num: nextPage
          })

          this.topic = {
            id: this.topicId,
            name: topicName
          }

          this.scope.$broadcast('scroll.infiniteScrollComplete');
          // For JSON responses, resp.data contains the result
        }, (err) => {
          console.error('ERR', JSON.stringify(err))
          // err.status will contain the status code
        })
  }

}